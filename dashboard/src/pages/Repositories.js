import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ShieldExclamationIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Repositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchRepositories();
    fetchStats();
  }, []);

  const fetchRepositories = async () => {
    try {
      const response = await api.get('/api/repositories');
      setRepositories(response.data.data);
    } catch (error) {
      toast.error('Failed to load repositories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/repositories/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDecrypt = async (id) => {
    if (!window.confirm('Are you sure you want to decrypt this repository?')) {
      return;
    }

    try {
      await api.put(`/api/repositories/${id}/decrypt`);
      toast.success('Repository decrypted successfully');
      fetchRepositories();
      fetchStats();
    } catch (error) {
      toast.error('Failed to decrypt repository');
      console.error(error);
    }
  };

  const getSecurityStatusColor = (status) => {
    const colors = {
      SECURE: 'bg-green-100 text-green-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      COMPROMISED: 'bg-red-100 text-red-800',
      ENCRYPTED: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSecurityIcon = (status) => {
    switch (status) {
      case 'SECURE':
        return <ShieldCheckIcon className="w-5 h-5 text-green-600" />;
      case 'WARNING':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'COMPROMISED':
        return <ShieldExclamationIcon className="w-5 h-5 text-red-600" />;
      case 'ENCRYPTED':
        return <LockClosedIcon className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor and manage repository security status
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Repositories</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRepositories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <LockClosedIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Encrypted</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.encryptedRepositories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <ShieldExclamationIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Compromised</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.compromisedRepositories}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Repository
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Security Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Encrypted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {repositories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No repositories found
                </td>
              </tr>
            ) : (
              repositories.map((repo) => (
                <tr key={repo.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getSecurityIcon(repo.securityStatus)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{repo.name}</div>
                        {repo.gitlabUrl && (
                          <div className="text-sm text-gray-500">{repo.gitlabUrl}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSecurityStatusColor(repo.securityStatus)}`}>
                      {repo.securityStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {repo.isEncrypted ? (
                      <span className="flex items-center text-sm text-blue-600">
                        <LockClosedIcon className="w-4 h-4 mr-1" />
                        Encrypted
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {repo.lastActivity
                      ? new Date(repo.lastActivity).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {repo.isEncrypted && (
                      <button
                        onClick={() => handleDecrypt(repo.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Decrypt
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Repositories;
