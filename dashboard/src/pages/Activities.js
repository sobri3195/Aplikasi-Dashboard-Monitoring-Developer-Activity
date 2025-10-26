import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ExclamationTriangleIcon, FunnelIcon } from '@heroicons/react/24/outline';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ isSuspicious: null, activityType: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 50 });

  useEffect(() => {
    fetchActivities();
  }, [filter, pagination.page]);

  const fetchActivities = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filter,
      };
      const response = await api.get('/api/activities', { params });
      setActivities(response.data.data);
      setPagination({ ...pagination, ...response.data.pagination });
    } catch (error) {
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      GIT_CLONE: 'bg-blue-100 text-blue-800',
      GIT_PULL: 'bg-green-100 text-green-800',
      GIT_PUSH: 'bg-purple-100 text-purple-800',
      GIT_COMMIT: 'bg-indigo-100 text-indigo-800',
      GIT_CHECKOUT: 'bg-cyan-100 text-cyan-800',
      REPO_COPY: 'bg-red-100 text-red-800',
      UNAUTHORIZED_ACCESS: 'bg-red-100 text-red-800',
      LOGIN: 'bg-gray-100 text-gray-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      LOW: 'text-green-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      CRITICAL: 'text-red-600',
    };
    return colors[level] || 'text-gray-600';
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
        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor all developer git activities</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={filter.isSuspicious || ''}
            onChange={(e) => setFilter({ ...filter, isSuspicious: e.target.value || null })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Activities</option>
            <option value="true">Suspicious Only</option>
            <option value="false">Normal Only</option>
          </select>
          <select
            value={filter.activityType}
            onChange={(e) => setFilter({ ...filter, activityType: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Types</option>
            <option value="GIT_CLONE">Clone</option>
            <option value="GIT_PULL">Pull</option>
            <option value="GIT_PUSH">Push</option>
            <option value="GIT_COMMIT">Commit</option>
            <option value="REPO_COPY">Repo Copy</option>
            <option value="UNAUTHORIZED_ACCESS">Unauthorized Access</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Repository
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.map((activity) => (
                <tr key={activity.id} className={`hover:bg-gray-50 ${activity.isSuspicious ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(activity.activityType)}`}>
                        {activity.activityType}
                      </span>
                      {activity.isSuspicious && (
                        <ExclamationTriangleIcon className="ml-2 h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity.user?.name}</div>
                    <div className="text-xs text-gray-500">{activity.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity.repository || '-'}</div>
                    {activity.branch && (
                      <div className="text-xs text-gray-500">{activity.branch}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity.device?.deviceName}</div>
                    <div className="text-xs text-gray-500">
                      {activity.device?.isAuthorized ? '✓ Authorized' : '✗ Unauthorized'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getRiskLevelColor(activity.riskLevel)}`}>
                      {activity.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No activities found
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{pagination.page}</span> of{' '}
                  <span className="font-medium">{pagination.pages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
