import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
  ComputerDesktopIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const Monitoring = () => {
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [devices, setDevices] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    authorizedDevices: 0,
    unauthorizedDevices: 0,
    secureRepos: 0,
    encryptedRepos: 0,
    activeAlerts: 0,
  });

  useEffect(() => {
    fetchMonitoringData();
    
    if (socket) {
      socket.on('new-activity', (activity) => {
        setActivities((prev) => [activity, ...prev].slice(0, 20));
        updateStats();
      });

      socket.on('new-alert', (alertData) => {
        setAlerts((prev) => [alertData.alert, ...prev].slice(0, 10));
        toast.error('New security alert!');
        updateStats();
      });

      socket.on('device-status-changed', () => {
        fetchDevices();
      });

      socket.on('repository-status-changed', () => {
        fetchRepositories();
      });
    }

    return () => {
      if (socket) {
        socket.off('new-activity');
        socket.off('new-alert');
        socket.off('device-status-changed');
        socket.off('repository-status-changed');
      }
    };
  }, [socket]);

  const fetchMonitoringData = async () => {
    try {
      await Promise.all([
        fetchActivities(),
        fetchDevices(),
        fetchRepositories(),
        fetchAlerts(),
      ]);
    } catch (error) {
      toast.error('Failed to load monitoring data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get('/api/activities', {
        params: { limit: 20, orderBy: 'timestamp', order: 'desc' }
      });
      setActivities(response.data.data.activities || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await api.get('/api/devices');
      setDevices(response.data.data || []);
      updateStats();
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const fetchRepositories = async () => {
    try {
      const response = await api.get('/api/repositories');
      setRepositories(response.data.data || []);
      updateStats();
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/api/alerts', {
        params: { isResolved: false, limit: 10 }
      });
      setAlerts(response.data.data || []);
      updateStats();
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const updateStats = () => {
    const authorizedDevices = devices.filter(d => d.isAuthorized).length;
    const unauthorizedDevices = devices.filter(d => !d.isAuthorized).length;
    const secureRepos = repositories.filter(r => r.securityStatus === 'SECURE').length;
    const encryptedRepos = repositories.filter(r => r.isEncrypted).length;
    const activeAlerts = alerts.filter(a => !a.isResolved).length;

    setStats({
      totalActivities: activities.length,
      authorizedDevices,
      unauthorizedDevices,
      secureRepos,
      encryptedRepos,
      activeAlerts,
    });
  };

  useEffect(() => {
    updateStats();
  }, [activities, devices, repositories, alerts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'GIT_CLONE':
        return '📥';
      case 'GIT_PULL':
        return '⬇️';
      case 'GIT_PUSH':
        return '⬆️';
      case 'GIT_COMMIT':
        return '💾';
      case 'GIT_CHECKOUT':
        return '🔄';
      default:
        return '📋';
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

  const getSecurityStatusIcon = (status) => {
    switch (status) {
      case 'SECURE':
        return <ShieldCheckIcon className="h-5 w-5 text-green-500" />;
      case 'WARNING':
        return <ShieldExclamationIcon className="h-5 w-5 text-yellow-500" />;
      case 'COMPROMISED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'ENCRYPTED':
        return <LockClosedIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <ShieldCheckIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSecurityStatusText = (status) => {
    const texts = {
      SECURE: 'Aman',
      WARNING: 'Terduga',
      COMPROMISED: 'Terkompromi',
      ENCRYPTED: 'Terenkripsi',
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monitoring Real-Time</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pantau aktivitas developer dan status keamanan secara real-time
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <ComputerDesktopIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Device Authorized</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.authorizedDevices}
                    </div>
                    {stats.unauthorizedDevices > 0 && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                        +{stats.unauthorizedDevices} unauthorized
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Repository Aman</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.secureRepos}
                    </div>
                    {stats.encryptedRepos > 0 && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-purple-600">
                        +{stats.encryptedRepos} encrypted
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stats.activeAlerts > 0 ? 'bg-red-500' : 'bg-green-500'} rounded-md p-3`}>
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Alert Aktif</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.activeAlerts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Real-time Activities */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Aktivitas Developer (Real-Time)
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="animate-pulse mr-1">●</span> Live
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getActivityIcon(activity.activityType)}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(activity.activityType)}`}>
                          {activity.activityType.replace('GIT_', '')}
                        </span>
                        {activity.isSuspicious && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            🚨 Suspicious
                          </span>
                        )}
                        <span className={`text-xs font-semibold ${getRiskLevelColor(activity.riskLevel)}`}>
                          {activity.riskLevel}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-900">
                        <span className="font-medium">{activity.user?.email || 'Unknown'}</span>
                        <span className="mx-2">•</span>
                        <span>{activity.device?.deviceName || 'Unknown Device'}</span>
                      </div>
                      {activity.repository && (
                        <p className="mt-1 text-xs text-gray-600">
                          📦 {activity.repository}
                          {activity.branch && ` (${activity.branch})`}
                        </p>
                      )}
                      {activity.location && (
                        <p className="mt-1 text-xs text-gray-500">
                          📍 {activity.location}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'HH:mm:ss')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(activity.timestamp), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Tidak ada aktivitas terbaru</p>
              </div>
            )}
          </div>
        </div>

        {/* Device Status & Alerts */}
        <div className="space-y-6">
          {/* Device Status */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Status Device</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {devices.slice(0, 5).map((device) => (
                  <div key={device.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full ${device.isAuthorized ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {device.deviceName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {device.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {device.isAuthorized ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
                {devices.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Tidak ada device terdaftar
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Alert Keamanan</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {alerts && alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 mt-1 ${
                        alert.severity === 'CRITICAL' ? 'text-red-500' :
                        alert.severity === 'WARNING' ? 'text-yellow-500' : 'text-blue-500'
                      }`}>
                        <ExclamationTriangleIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.alertType?.replace(/_/g, ' ') || 'Alert'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(alert.createdAt), 'HH:mm - dd MMM')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <CheckCircleIcon className="mx-auto h-10 w-10 text-green-500" />
                  <p className="mt-2 text-sm">Tidak ada alert aktif</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Repository Security Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Indikator Keamanan Repository
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {getSecurityStatusIcon(repo.securityStatus)}
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {repo.name}
                      </h4>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        repo.securityStatus === 'SECURE' ? 'bg-green-100 text-green-800' :
                        repo.securityStatus === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                        repo.securityStatus === 'COMPROMISED' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {getSecurityStatusText(repo.securityStatus)}
                      </span>
                      {repo.isEncrypted && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🔒 Encrypted
                        </span>
                      )}
                    </div>
                    {repo.lastActivity && (
                      <p className="mt-2 text-xs text-gray-500">
                        Last activity: {format(new Date(repo.lastActivity), 'dd MMM HH:mm')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {repositories.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>Tidak ada repository terdaftar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Riwayat Alert dan Respons Sistem
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe Alert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pesan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Respons Sistem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(alert.createdAt), 'dd MMM yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {alert.alertType?.replace(/_/g, ' ') || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {alert.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {alert.isResolved ? (
                      <span className="inline-flex items-center text-green-600">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-600">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {alert.details?.systemResponse || 
                     (alert.alertType === 'REPO_ENCRYPTED' ? 'Repository auto-encrypted' :
                      alert.alertType === 'UNAUTHORIZED_DEVICE' ? 'Access blocked' :
                      'Alert triggered')}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada riwayat alert
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
