import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  UserGroupIcon,
  ComputerDesktopIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/dashboard/overview');
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { overview, securityStats, recentActivities, recentAlerts, activityTrend } = dashboardData || {};

  const stats = [
    {
      name: 'Total Users',
      value: overview?.totalUsers || 0,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Devices',
      value: overview?.totalDevices || 0,
      icon: ComputerDesktopIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Activities',
      value: overview?.totalActivities || 0,
      icon: ClockIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Security Score',
      value: `${overview?.securityScore || 0}%`,
      icon: ShieldCheckIcon,
      color: overview?.securityScore >= 80 ? 'bg-green-500' : overview?.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500',
    },
  ];

  const getActivityTypeColor = (type) => {
    const colors = {
      GIT_CLONE: 'bg-blue-100 text-blue-800',
      GIT_PULL: 'bg-green-100 text-green-800',
      GIT_PUSH: 'bg-purple-100 text-purple-800',
      GIT_COMMIT: 'bg-indigo-100 text-indigo-800',
      REPO_COPY: 'bg-red-100 text-red-800',
      UNAUTHORIZED_ACCESS: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      INFO: 'bg-blue-100 text-blue-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor developer activities and security metrics in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Authorized Devices</span>
              <span className="text-sm font-semibold text-green-600">
                {securityStats?.authorizedDevices || 0} / {securityStats?.totalDevices || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Approval</span>
              <span className="text-sm font-semibold text-yellow-600">
                {securityStats?.pendingDevices || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Suspicious Activities</span>
              <span className="text-sm font-semibold text-red-600">
                {securityStats?.suspiciousActivities || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Critical Alerts</span>
              <span className="text-sm font-semibold text-red-600">
                {securityStats?.criticalAlerts || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Encrypted Repos</span>
              <span className="text-sm font-semibold text-purple-600">
                {securityStats?.encryptedRepos || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(activity.activityType)}`}>
                          {activity.activityType}
                        </span>
                        {activity.isSuspicious && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-900">{activity.user?.email}</p>
                      {activity.repository && (
                        <p className="text-xs text-gray-500">Repository: {activity.repository}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </p>
                      <p className="text-xs text-gray-400">{activity.device?.deviceName}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent activities
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentAlerts && recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.activity?.user?.email} - {alert.activity?.device?.deviceName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {format(new Date(alert.createdAt), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent alerts
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
