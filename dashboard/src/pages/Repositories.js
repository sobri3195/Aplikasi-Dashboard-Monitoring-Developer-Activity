import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ShieldExclamationIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

const Repositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRepo, setEditingRepo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    gitlabUrl: '',
    isEncrypted: false,
    securityStatus: 'SECURE'
  });

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

  const handleAddRepository = () => {
    setEditingRepo(null);
    setFormData({
      name: '',
      path: '',
      gitlabUrl: '',
      isEncrypted: false,
      securityStatus: 'SECURE'
    });
    setShowAddModal(true);
  };

  const handleEditRepository = (repo) => {
    setEditingRepo(repo);
    setFormData({
      name: repo.name,
      path: repo.path || '',
      gitlabUrl: repo.gitlabUrl || '',
      isEncrypted: repo.isEncrypted,
      securityStatus: repo.securityStatus
    });
    setShowAddModal(true);
  };

  const handleDeleteRepository = async (id) => {
    if (!window.confirm('Are you sure you want to delete this repository?')) {
      return;
    }

    try {
      await api.delete(`/api/repositories/${id}`);
      toast.success('Repository deleted successfully');
      fetchRepositories();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete repository');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Repository name is required');
      return;
    }

    try {
      if (editingRepo) {
        await api.put(`/api/repositories/${editingRepo.id}`, formData);
        toast.success('Repository updated successfully');
      } else {
        await api.post('/api/repositories', formData);
        toast.success('Repository added successfully');
      }
      
      setShowAddModal(false);
      fetchRepositories();
      fetchStats();
    } catch (error) {
      toast.error(editingRepo ? 'Failed to update repository' : 'Failed to add repository');
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage repository security status
          </p>
        </div>
        <button
          onClick={handleAddRepository}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Repository
        </button>
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
                    <button
                      onClick={() => handleEditRepository(repo)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <PencilIcon className="w-4 h-4 inline" />
                    </button>
                    {repo.isEncrypted && (
                      <button
                        onClick={() => handleDecrypt(repo.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Decrypt
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteRepository(repo.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingRepo ? 'Edit Repository' : 'Add New Repository'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Repository Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="e.g., my-project"
                      />
                    </div>

                    <div>
                      <label htmlFor="path" className="block text-sm font-medium text-gray-700">
                        Repository Path
                      </label>
                      <input
                        type="text"
                        name="path"
                        id="path"
                        value={formData.path}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="e.g., /repos/my-project"
                      />
                    </div>

                    <div>
                      <label htmlFor="gitlabUrl" className="block text-sm font-medium text-gray-700">
                        GitLab URL
                      </label>
                      <input
                        type="text"
                        name="gitlabUrl"
                        id="gitlabUrl"
                        value={formData.gitlabUrl}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="e.g., https://gitlab.com/user/repo"
                      />
                    </div>

                    <div>
                      <label htmlFor="securityStatus" className="block text-sm font-medium text-gray-700">
                        Security Status
                      </label>
                      <select
                        name="securityStatus"
                        id="securityStatus"
                        value={formData.securityStatus}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="SECURE">Secure</option>
                        <option value="WARNING">Warning</option>
                        <option value="COMPROMISED">Compromised</option>
                        <option value="ENCRYPTED">Encrypted</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isEncrypted"
                        id="isEncrypted"
                        checked={formData.isEncrypted}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isEncrypted" className="ml-2 block text-sm text-gray-900">
                        Enable Encryption
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingRepo ? 'Update' : 'Add'} Repository
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repositories;
