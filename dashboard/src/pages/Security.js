import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const Security = () => {
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState(null);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const response = await api.get('/api/dashboard/security');
      setSecurityData(response.data.data);
    } catch (error) {
      toast.error('Failed to load security data');
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

  const { securityStats, unauthorizedDevices, suspiciousActivities, criticalAlerts, encryptedRepositories } = securityData || {};

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of security metrics and threats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Security Score</p>
              <p className={`text-3xl font-bold ${getSecurityScoreColor(securityStats?.securityScore)}`}>
                {securityStats?.securityScore || 0}%
              </p>
            </div>
            <ShieldCheckIcon className={`h-12 w-12 ${getSecurityScoreColor(securityStats?.securityScore)}`} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Authorized Devices</p>
              <p className="text-3xl font-bold text-green-600">
                {securityStats?.authorizedDevices || 0}
              </p>
            </div>
            <ComputerDesktopIcon className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Devices</p>
              <p className="text-3xl font-bold text-yellow-600">
                {securityStats?.pendingDevices || 0}
              </p>
            </div>
            <ComputerDesktopIcon className="h-12 w-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suspicious Activities</p>
              <p className="text-3xl font-bold text-red-600">
                {securityStats?.suspiciousActivities || 0}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-600">
                {securityStats?.criticalAlerts || 0}
              </p>
            </div>
            <ShieldExclamationIcon className="h-12 w-12 text-red-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Unauthorized Devices</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {unauthorizedDevices && unauthorizedDevices.length > 0 ? (
              unauthorizedDevices.map((device) => (
                <div key={device.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{device.deviceName}</p>
                      <p className="text-xs text-gray-500">{device.user?.email}</p>
                      <p className="text-xs text-gray-400">{device.osInfo}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                      {device.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No unauthorized devices
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Critical Alerts</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {criticalAlerts && criticalAlerts.length > 0 ? (
              criticalAlerts.map((alert) => (
                <div key={alert.id} className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.activity?.user?.email} - {format(new Date(alert.createdAt), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No critical alerts
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Suspicious Activities</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {suspiciousActivities && suspiciousActivities.length > 0 ? (
              suspiciousActivities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {activity.activityType}
                      </span>
                      <p className="text-sm text-gray-900 mt-1">{activity.user?.email}</p>
                      <p className="text-xs text-gray-500">
                        {activity.repository} - {activity.device?.deviceName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </p>
                      <span className={`text-xs font-medium ${
                        activity.riskLevel === 'CRITICAL' ? 'text-red-600' :
                        activity.riskLevel === 'HIGH' ? 'text-orange-600' :
                        activity.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {activity.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No suspicious activities
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Encrypted Repositories</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {encryptedRepositories && encryptedRepositories.length > 0 ? (
              encryptedRepositories.map((repo) => (
                <div key={repo.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <LockClosedIcon className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{repo.name}</p>
                        <p className="text-xs text-gray-500">
                          Encrypted on {format(new Date(repo.encryptedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      {repo.securityStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No encrypted repositories
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
