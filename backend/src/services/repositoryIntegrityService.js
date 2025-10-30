const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

class RepositoryIntegrityService {
  generateFileHash(content, algorithm = 'SHA-256') {
    const hash = crypto.createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
  }

  async registerCommitHash(repositoryId, commitHash, files) {
    try {
      const hashes = [];

      for (const file of files) {
        const fileHash = this.generateFileHash(file.content);
        
        const hash = await prisma.repositoryHash.create({
          data: {
            repositoryId,
            filePath: file.path,
            commitHash,
            fileHash,
            hashAlgorithm: 'SHA-256',
            status: 'VERIFIED',
            verifiedAt: new Date(),
            verificationLog: {
              registered: true,
              timestamp: new Date(),
              fileSize: file.content.length
            }
          }
        });

        hashes.push(hash);
      }

      await prisma.auditLog.create({
        data: {
          action: 'COMMIT_HASH_REGISTERED',
          entity: 'Repository',
          entityId: repositoryId,
          changes: {
            commitHash,
            filesCount: files.length,
            hashes: hashes.map(h => ({ path: h.filePath, hash: h.fileHash }))
          }
        }
      });

      return hashes;
    } catch (error) {
      console.error('Error registering commit hash:', error);
      throw error;
    }
  }

  async verifyRepositoryIntegrity(repositoryId, commitHash, files) {
    try {
      const storedHashes = await prisma.repositoryHash.findMany({
        where: {
          repositoryId,
          commitHash
        }
      });

      if (storedHashes.length === 0) {
        return {
          status: 'PENDING_VERIFICATION',
          message: 'No hash records found for this commit',
          verified: false
        };
      }

      const verificationResults = [];
      let tamperedCount = 0;

      for (const file of files) {
        const currentHash = this.generateFileHash(file.content);
        const storedHash = storedHashes.find(h => h.filePath === file.path);

        if (!storedHash) {
          verificationResults.push({
            path: file.path,
            status: 'NOT_FOUND',
            message: 'File not in original commit'
          });
          tamperedCount++;
          continue;
        }

        if (currentHash !== storedHash.fileHash) {
          tamperedCount++;
          
          await prisma.repositoryHash.update({
            where: { id: storedHash.id },
            data: {
              status: 'TAMPERED',
              tamperedAt: new Date(),
              verificationLog: {
                tampered: true,
                timestamp: new Date(),
                expectedHash: storedHash.fileHash,
                actualHash: currentHash
              }
            }
          });

          verificationResults.push({
            path: file.path,
            status: 'TAMPERED',
            expectedHash: storedHash.fileHash,
            actualHash: currentHash,
            message: 'File content does not match stored hash'
          });
        } else {
          await prisma.repositoryHash.update({
            where: { id: storedHash.id },
            data: {
              lastChecked: new Date()
            }
          });

          verificationResults.push({
            path: file.path,
            status: 'VERIFIED',
            hash: currentHash,
            message: 'File integrity verified'
          });
        }
      }

      const overallStatus = tamperedCount > 0 ? 'TAMPERED' : 'VERIFIED';

      if (tamperedCount > 0) {
        await this.handleIntegrityViolation(repositoryId, commitHash, verificationResults);
      }

      return {
        status: overallStatus,
        verified: tamperedCount === 0,
        totalFiles: files.length,
        tamperedFiles: tamperedCount,
        verifiedFiles: files.length - tamperedCount,
        details: verificationResults,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error verifying repository integrity:', error);
      throw error;
    }
  }

  async handleIntegrityViolation(repositoryId, commitHash, verificationResults) {
    try {
      const tamperedFiles = verificationResults.filter(r => r.status === 'TAMPERED');

      await prisma.alert.create({
        data: {
          alertType: 'REPO_ENCRYPTED',
          severity: 'CRITICAL',
          message: `🚨 Repository integrity violation detected - ${tamperedFiles.length} file(s) tampered`,
          details: {
            repositoryId,
            commitHash,
            tamperedFiles: tamperedFiles.map(f => f.path),
            timestamp: new Date()
          }
        }
      });

      await prisma.repository.update({
        where: { id: repositoryId },
        data: {
          securityStatus: 'COMPROMISED'
        }
      });

      await prisma.securityLog.create({
        data: {
          logType: 'POLICY_VIOLATION',
          severity: 'CRITICAL',
          message: 'Repository integrity compromised',
          details: {
            repositoryId,
            commitHash,
            tamperedCount: tamperedFiles.length,
            files: tamperedFiles.map(f => ({
              path: f.path,
              expectedHash: f.expectedHash,
              actualHash: f.actualHash
            }))
          }
        }
      });

      await this.notifyAdmins(repositoryId, tamperedFiles);
    } catch (error) {
      console.error('Error handling integrity violation:', error);
    }
  }

  async notifyAdmins(repositoryId, tamperedFiles) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' }
      });

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId }
      });

      for (const admin of admins) {
        console.log(`Notifying admin ${admin.email} about integrity violation in ${repository?.name}`);
      }
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }

  async getIntegrityStatus(repositoryId) {
    try {
      const hashes = await prisma.repositoryHash.findMany({
        where: { repositoryId },
        orderBy: { verifiedAt: 'desc' }
      });

      const total = hashes.length;
      const verified = hashes.filter(h => h.status === 'VERIFIED').length;
      const tampered = hashes.filter(h => h.status === 'TAMPERED').length;
      const corrupted = hashes.filter(h => h.status === 'CORRUPTED').length;

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId }
      });

      return {
        repositoryId,
        repositoryName: repository?.name,
        status: repository?.securityStatus,
        integrity: {
          total,
          verified,
          tampered,
          corrupted,
          percentage: total > 0 ? (verified / total) * 100 : 0
        },
        lastChecked: hashes[0]?.lastChecked,
        recentHashes: hashes.slice(0, 10)
      };
    } catch (error) {
      console.error('Error getting integrity status:', error);
      throw error;
    }
  }

  async getHashTimeline(repositoryId, filePath) {
    try {
      const timeline = await prisma.repositoryHash.findMany({
        where: {
          repositoryId,
          filePath
        },
        orderBy: { verifiedAt: 'desc' }
      });

      return timeline;
    } catch (error) {
      console.error('Error getting hash timeline:', error);
      throw error;
    }
  }

  async getAllRepositoriesIntegrityStatus() {
    try {
      const repositories = await prisma.repository.findMany();
      const results = [];

      for (const repo of repositories) {
        const status = await this.getIntegrityStatus(repo.id);
        results.push(status);
      }

      return results;
    } catch (error) {
      console.error('Error getting all repositories integrity status:', error);
      throw error;
    }
  }

  async generateIntegrityReport(repositoryId, startDate, endDate) {
    try {
      const hashes = await prisma.repositoryHash.findMany({
        where: {
          repositoryId,
          verifiedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { verifiedAt: 'desc' }
      });

      const violations = hashes.filter(h => h.status === 'TAMPERED' || h.status === 'CORRUPTED');

      const report = {
        repositoryId,
        period: { start: startDate, end: endDate },
        summary: {
          totalChecks: hashes.length,
          violations: violations.length,
          integrityRate: hashes.length > 0 
            ? ((hashes.length - violations.length) / hashes.length * 100).toFixed(2) 
            : 100
        },
        violations: violations.map(v => ({
          filePath: v.filePath,
          commitHash: v.commitHash,
          status: v.status,
          tamperedAt: v.tamperedAt,
          verificationLog: v.verificationLog
        })),
        generatedAt: new Date()
      };

      return report;
    } catch (error) {
      console.error('Error generating integrity report:', error);
      throw error;
    }
  }

  async markAsEncrypted(repositoryId) {
    try {
      await prisma.repositoryHash.updateMany({
        where: { repositoryId },
        data: { status: 'ENCRYPTED' }
      });

      await prisma.repository.update({
        where: { id: repositoryId },
        data: {
          securityStatus: 'ENCRYPTED',
          isEncrypted: true,
          encryptedAt: new Date()
        }
      });

      return { success: true, message: 'Repository marked as encrypted' };
    } catch (error) {
      console.error('Error marking repository as encrypted:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      const totalRepos = await prisma.repository.count();
      const verifiedRepos = await prisma.repository.count({
        where: { securityStatus: 'SECURE' }
      });
      const compromisedRepos = await prisma.repository.count({
        where: { securityStatus: 'COMPROMISED' }
      });
      const encryptedRepos = await prisma.repository.count({
        where: { securityStatus: 'ENCRYPTED' }
      });

      const totalHashes = await prisma.repositoryHash.count();
      const tamperedHashes = await prisma.repositoryHash.count({
        where: { status: 'TAMPERED' }
      });

      return {
        repositories: {
          total: totalRepos,
          verified: verifiedRepos,
          compromised: compromisedRepos,
          encrypted: encryptedRepos
        },
        hashes: {
          total: totalHashes,
          tampered: tamperedHashes,
          integrityRate: totalHashes > 0 
            ? ((totalHashes - tamperedHashes) / totalHashes * 100).toFixed(2)
            : 100
        }
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }
}

module.exports = new RepositoryIntegrityService();
