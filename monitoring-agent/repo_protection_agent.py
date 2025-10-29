#!/usr/bin/env python3
"""
Repository Protection Agent
Monitors repository access and enforces device/package integrity checks
"""

import os
import sys
import json
import hashlib
import platform
import requests
import subprocess
from pathlib import Path
from datetime import datetime

class RepositoryProtectionAgent:
    def __init__(self, api_url, api_token=None):
        self.api_url = api_url.rstrip('/')
        self.api_token = api_token
        self.headers = {
            'Content-Type': 'application/json'
        }
        if api_token:
            self.headers['Authorization'] = f'Bearer {api_token}'
    
    def get_device_fingerprint(self):
        """Generate device fingerprint"""
        try:
            # Get MAC addresses
            if platform.system() == 'Windows':
                result = subprocess.run(['getmac'], capture_output=True, text=True)
                mac_info = result.stdout
            else:
                result = subprocess.run(['ifconfig'], capture_output=True, text=True)
                mac_info = result.stdout
            
            device_info = {
                'hostname': platform.node(),
                'platform': platform.system(),
                'arch': platform.machine(),
                'mac_info': hashlib.sha256(mac_info.encode()).hexdigest()
            }
            
            fingerprint_string = json.dumps(device_info, sort_keys=True)
            fingerprint = hashlib.sha256(fingerprint_string.encode()).hexdigest()
            
            return fingerprint, device_info
        except Exception as e:
            print(f"Error generating fingerprint: {e}")
            return None, None
    
    def check_repository_protection(self, repo_path):
        """Check if repository has protection locks"""
        repo_path = Path(repo_path)
        
        # Check for encryption lock
        encryption_lock = repo_path / '.repo-encrypted.lock'
        if encryption_lock.exists():
            with open(encryption_lock, 'r') as f:
                lock_data = json.load(f)
            return {
                'protected': True,
                'type': 'ENCRYPTED',
                'message': 'Repository is encrypted. Contact administrator.',
                'details': lock_data
            }
        
        # Check for access block
        access_block = repo_path / '.repo-access-blocked'
        if access_block.exists():
            with open(access_block, 'r') as f:
                block_data = json.load(f)
            return {
                'protected': True,
                'type': 'BLOCKED',
                'message': block_data.get('message', 'Access blocked'),
                'details': block_data
            }
        
        return {
            'protected': False,
            'message': 'No protection detected'
        }
    
    def verify_repository_access(self, repository_id, repo_path):
        """Verify access to repository"""
        try:
            fingerprint, device_info = self.get_device_fingerprint()
            
            if not fingerprint:
                print("❌ Failed to generate device fingerprint")
                return {
                    'allowed': False,
                    'message': 'Failed to generate device fingerprint'
                }
            
            # Check local protection first
            protection_check = self.check_repository_protection(repo_path)
            if protection_check['protected']:
                print(f"❌ Repository is {protection_check['type']}")
                print(f"   {protection_check['message']}")
                return {
                    'allowed': False,
                    'message': protection_check['message'],
                    'details': protection_check
                }
            
            # Verify with backend
            try:
                response = requests.post(
                    f'{self.api_url}/api/repository-protection/verify-access',
                    headers=self.headers,
                    json={
                        'repositoryId': repository_id,
                        'repositoryPath': str(repo_path)
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print("✅ Device verified and access authorized")
                    return result
                elif response.status_code == 403:
                    result = response.json()
                    reason = result.get('reason', 'UNKNOWN')
                    
                    print(f"❌ Access denied: {reason}")
                    print(f"   {result.get('message', 'Access not authorized')}")
                    
                    # If repository was encrypted/blocked, create local lock
                    if reason in ['COPY_DETECTED', 'DEVICE_NOT_APPROVED', 'DEVICE_NOT_REGISTERED']:
                        self.create_local_lock(repo_path, result)
                    
                    return result
                else:
                    print(f"❌ Verification failed with status: {response.status_code}")
                    return {
                        'allowed': False,
                        'message': f'Verification failed: {response.status_code}'
                    }
            
            except requests.exceptions.ConnectionError:
                print("❌ Cannot connect to backend server")
                print("   Please ensure the backend is running and accessible")
                return {
                    'allowed': False,
                    'message': 'Backend server not accessible'
                }
            except requests.exceptions.Timeout:
                print("❌ Backend request timed out")
                return {
                    'allowed': False,
                    'message': 'Backend request timeout'
                }
        
        except Exception as e:
            print(f"❌ Error verifying access: {e}")
            return {
                'allowed': False,
                'message': f'Verification error: {str(e)}'
            }
    
    def create_local_lock(self, repo_path, reason_data):
        """Create local protection lock"""
        repo_path = Path(repo_path)
        
        lock_file = repo_path / '.repo-encrypted.lock'
        lock_data = {
            'encrypted': True,
            'timestamp': datetime.now().isoformat(),
            'reason': reason_data.get('reason', 'UNAUTHORIZED_ACCESS'),
            'message': reason_data.get('message', 'Access denied')
        }
        
        with open(lock_file, 'w') as f:
            json.dump(lock_data, f, indent=2)
        
        print(f"✗ Repository locked: {lock_data['message']}")
    
    def register_device(self, device_name):
        """Register current device"""
        try:
            fingerprint, device_info = self.get_device_fingerprint()
            
            if not fingerprint:
                return {
                    'success': False,
                    'message': 'Failed to generate device fingerprint'
                }
            
            response = requests.post(
                f'{self.api_url}/api/repository-protection/register-device',
                headers=self.headers,
                json={'deviceName': device_name}
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"✓ Device registered: {device_name}")
                print(f"  Fingerprint: {fingerprint[:16]}...")
                print(f"  Status: {result.get('device', {}).get('status', 'PENDING')}")
                return result
            else:
                return {
                    'success': False,
                    'message': f'Registration failed: {response.status_code}'
                }
        
        except Exception as e:
            print(f"Error registering device: {e}")
            return {
                'success': False,
                'message': str(e)
            }
    
    def validate_package_integrity(self, repo_path):
        """Validate package integrity"""
        repo_path = Path(repo_path)
        
        # Check for package.json (Node.js)
        package_json = repo_path / 'package.json'
        if package_json.exists():
            with open(package_json, 'r') as f:
                package_data = json.load(f)
            
            package_hash = hashlib.sha256(
                json.dumps(package_data, sort_keys=True).encode()
            ).hexdigest()
            
            return {
                'valid': True,
                'type': 'Node.js',
                'package': package_data.get('name'),
                'version': package_data.get('version'),
                'hash': package_hash
            }
        
        # Check for requirements.txt (Python)
        requirements_txt = repo_path / 'requirements.txt'
        if requirements_txt.exists():
            with open(requirements_txt, 'r') as f:
                requirements = f.read()
            
            req_hash = hashlib.sha256(requirements.encode()).hexdigest()
            
            return {
                'valid': True,
                'type': 'Python',
                'hash': req_hash
            }
        
        return {
            'valid': True,
            'type': 'Unknown',
            'message': 'No package manager files found'
        }
    
    def monitor_repository(self, repository_id, repo_path):
        """Monitor repository for unauthorized access"""
        print(f"Monitoring repository: {repo_path}")
        print(f"Repository ID: {repository_id}")
        
        # 1. Check protection status
        protection = self.check_repository_protection(repo_path)
        if protection['protected']:
            print(f"✗ Repository is {protection['type']}")
            print(f"  Message: {protection['message']}")
            return False
        
        # 2. Verify access
        print("Verifying access...")
        access = self.verify_repository_access(repository_id, repo_path)
        
        if not access.get('allowed', False):
            print(f"✗ Access denied: {access.get('message')}")
            return False
        
        print(f"✓ Access granted")
        
        # 3. Validate package integrity
        print("Validating package integrity...")
        package = self.validate_package_integrity(repo_path)
        print(f"✓ Package type: {package.get('type')}")
        
        if package.get('package'):
            print(f"  Package: {package['package']} v{package.get('version')}")
        
        return True

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Repository Protection Agent'
    )
    parser.add_argument(
        'command',
        choices=['register', 'verify', 'monitor', 'status'],
        help='Command to execute'
    )
    parser.add_argument(
        '--api-url',
        default=os.getenv('API_URL', 'http://localhost:5000'),
        help='API URL'
    )
    parser.add_argument(
        '--token',
        default=os.getenv('API_TOKEN'),
        help='API Token'
    )
    parser.add_argument(
        '--repo-id',
        help='Repository ID'
    )
    parser.add_argument(
        '--repo-path',
        default='.',
        help='Repository path (default: current directory)'
    )
    parser.add_argument(
        '--device-name',
        default=platform.node(),
        help='Device name'
    )
    
    args = parser.parse_args()
    
    agent = RepositoryProtectionAgent(args.api_url, args.token)
    
    if args.command == 'register':
        print("Registering device...")
        result = agent.register_device(args.device_name)
        if result.get('success'):
            print("\n✓ Device registered successfully!")
            print("  Wait for admin approval before accessing repositories.")
        else:
            print(f"\n✗ Registration failed: {result.get('message')}")
            sys.exit(1)
    
    elif args.command == 'verify':
        if not args.repo_id:
            print("Error: --repo-id is required")
            sys.exit(1)
        
        result = agent.verify_repository_access(args.repo_id, args.repo_path)
        
        if result.get('allowed'):
            print("\n✓ Access authorized")
            sys.exit(0)
        else:
            print(f"\n✗ Access denied: {result.get('message')}")
            sys.exit(1)
    
    elif args.command == 'monitor':
        if not args.repo_id:
            print("Error: --repo-id is required")
            sys.exit(1)
        
        success = agent.monitor_repository(args.repo_id, args.repo_path)
        sys.exit(0 if success else 1)
    
    elif args.command == 'status':
        protection = agent.check_repository_protection(args.repo_path)
        print(f"Repository: {args.repo_path}")
        print(f"Protected: {protection['protected']}")
        if protection['protected']:
            print(f"Type: {protection['type']}")
            print(f"Message: {protection['message']}")
        
        package = agent.validate_package_integrity(args.repo_path)
        print(f"\nPackage Type: {package.get('type')}")
        if package.get('package'):
            print(f"Package: {package['package']} v{package.get('version')}")

if __name__ == '__main__':
    main()
