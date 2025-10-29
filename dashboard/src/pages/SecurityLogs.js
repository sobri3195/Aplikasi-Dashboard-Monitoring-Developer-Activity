import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ShieldExclamationIcon,
  ClockIcon,
  ServerIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SecurityLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [syncStatus, setSyncStatus] = useState([]);
  const [filters, setFilters] = useState({
    logType: '',
    severity: '',
    page: 1,
    limit: 50
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters).toString();
      const [logsRes, statsRes, syncRes] = await Promise.all([
        api.get(`/api/security-logs?${params}`),
        api.get('/api/security-logs/stats?timeRange=7d'),
        api.get('/api/security-logs/sync-status')
      ]);

      setLogs(logsRes.data.data.logs);
      setStats(statsRes.data.data);
      setSyncStatus(syncRes.data.data);
    } catch (error) {
      toast.error('Failed to load security logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      INFO: 'bg-blue-100 text-blue-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      INFO: CheckCircleIcon,
      WARNING: ExclamationCircleIcon,
      CRITICAL: XCircleIcon,
    };
    const Icon = icons[severity] || CheckCircleIcon;
    return <Icon className="h-5 w-5" />;
  };

  const getSyncStatusColor = (status) => {
    const colors = {
      SYNCED: 'text-green-600 bg-green-100',
      SYNCING: 'text-blue-600 bg-blue-100',
      ERROR: 'text-red-600 bg-red-100',
      OUTDATED: 'text-yellow-600 bg-yellow-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
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
        <h1 className="text-2xl font-bold text-gray-900">Security Logs & Sync Status</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor security events and device synchronization status
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <ShieldExclamationIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Logs</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.summary?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <XCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Critical Events</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats?.summary?.bySeverity?.find(s => s.severity === 'CRITICAL')?._count || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <ServerIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Synced Devices</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {syncStatus.filter(s => s.syncStatus?.syncStatus === 'SYNCED').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {stats?.timeline && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Events Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="INFO" stroke="#3b82f6" />
              <Line type="monotone" dataKey="WARNING" stroke="#f59e0b" />
              <Line type="monotone" dataKey="CRITICAL" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Security Logs</h3>
          </div>
          <div className="px-6 py-4">
            <div className="flex space-x-4 mb-4">
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Severities</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <select
                value={filters.logType}
                onChange={(e) => setFilters({ ...filters, logType: e.target.value, page: 1 })}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="AUTH_FAILURE">Auth Failure</option>
                <option value="UNAUTHORIZED_ACCESS">Unauthorized Access</option>
                <option value="DEVICE_CHANGE">Device Change</option>
                <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                <option value="POLICY_VIOLATION">Policy Violation</option>
              </select>
            </div>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                        {getSeverityIcon(log.severity)}
                        <span className="ml-1">{log.severity}</span>
                      </span>
                      <span className="text-xs text-gray-500">{log.logType}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{log.message}</p>
                    {log.ipAddress && (
                      <p className="text-xs text-gray-500 mt-1">IP: {log.ipAddress}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Device Sync Status</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {syncStatus.map((item) => (
              <div key={item.device.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.device.deviceName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.device.user?.email}
                    </p>
                    {item.syncStatus?.lastSyncAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last sync: {format(new Date(item.syncStatus.lastSyncAt), 'MMM dd, HH:mm')}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSyncStatusColor(item.syncStatus?.syncStatus || 'SYNCED')}`}>
                      {item.syncStatus?.syncStatus || 'SYNCED'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;
