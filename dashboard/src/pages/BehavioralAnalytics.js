import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const BehavioralAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [filters, setFilters] = useState({
    anomalyType: '',
    isReviewed: '',
    timeRange: '7d',
    page: 1,
    limit: 50
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters).toString();
      const [anomaliesRes, statsRes, dashboardRes] = await Promise.all([
        api.get(`/api/behavioral-analytics/anomalies?${params}`),
        api.get(`/api/behavioral-analytics/anomalies/stats?timeRange=${filters.timeRange}`),
        api.get(`/api/behavioral-analytics/anomalies/dashboard?timeRange=${filters.timeRange}`)
      ]);

      setAnomalies(anomaliesRes.data.data.anomalies);
      setStats(statsRes.data.data);
      setDashboard(dashboardRes.data.data);
    } catch (error) {
      toast.error('Failed to load behavioral analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAnomaly = async (anomalyId, isFalsePositive) => {
    try {
      await api.put(`/api/behavioral-analytics/anomalies/${anomalyId}/review`, {
        isFalsePositive,
        notes: isFalsePositive ? 'Marked as false positive' : 'Confirmed anomaly'
      });
      toast.success('Anomaly reviewed successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to review anomaly');
      console.error(error);
    }
  };

  const getAnomalyTypeColor = (type) => {
    const colors = {
      UNUSUAL_TIME: 'bg-blue-100 text-blue-800',
      HIGH_FREQUENCY: 'bg-yellow-100 text-yellow-800',
      UNUSUAL_LOCATION: 'bg-red-100 text-red-800',
      UNUSUAL_REPOSITORY: 'bg-purple-100 text-purple-800',
      UNUSUAL_DEVICE: 'bg-orange-100 text-orange-800',
      UNUSUAL_COMMAND_PATTERN: 'bg-indigo-100 text-indigo-800',
      DATA_EXFILTRATION: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getRiskLevel = (score) => {
    if (score >= 0.9) return { text: 'Critical', color: 'text-red-600' };
    if (score >= 0.8) return { text: 'High', color: 'text-orange-600' };
    if (score >= 0.6) return { text: 'Medium', color: 'text-yellow-600' };
    return { text: 'Low', color: 'text-blue-600' };
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
        <h1 className="text-2xl font-bold text-gray-900">Behavioral Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Detect and analyze anomalous behavior patterns
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Anomalies</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.summary?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">High Risk</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.summary?.highRisk || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Unreviewed</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats?.summary?.unreviewed || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">High Risk Users</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {dashboard?.highRiskUsers?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Anomaly Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.timeline || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} name="Anomalies" />
              <Line type="monotone" dataKey="avgScore" stroke="#f59e0b" strokeWidth={2} name="Avg Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Anomalies by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.byType || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anomalyType" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="_count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Detected Anomalies</h3>
            <div className="flex space-x-4">
              <select
                value={filters.anomalyType}
                onChange={(e) => setFilters({ ...filters, anomalyType: e.target.value, page: 1 })}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              >
                <option value="">All Types</option>
                <option value="UNUSUAL_TIME">Unusual Time</option>
                <option value="HIGH_FREQUENCY">High Frequency</option>
                <option value="UNUSUAL_LOCATION">Unusual Location</option>
                <option value="UNUSUAL_REPOSITORY">Unusual Repository</option>
                <option value="UNUSUAL_DEVICE">Unusual Device</option>
                <option value="DATA_EXFILTRATION">Data Exfiltration</option>
              </select>
              <select
                value={filters.isReviewed}
                onChange={(e) => setFilters({ ...filters, isReviewed: e.target.value, page: 1 })}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="false">Unreviewed</option>
                <option value="true">Reviewed</option>
              </select>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters({ ...filters, timeRange: e.target.value, page: 1 })}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {anomalies.map((anomaly) => {
            const riskLevel = getRiskLevel(anomaly.anomalyScore);
            return (
              <div key={anomaly.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAnomalyTypeColor(anomaly.anomalyType)}`}>
                        {anomaly.anomalyType}
                      </span>
                      <span className={`text-xs font-semibold ${riskLevel.color}`}>
                        {riskLevel.text} ({(anomaly.anomalyScore * 100).toFixed(0)}%)
                      </span>
                      {anomaly.isReviewed && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{anomaly.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      User: {anomaly.user?.email} - {format(new Date(anomaly.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  {!anomaly.isReviewed && (
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleReviewAnomaly(anomaly.id, false)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleReviewAnomaly(anomaly.id, true)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        False Positive
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {dashboard?.highRiskUsers && dashboard.highRiskUsers.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">High Risk Users</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard.highRiskUsers.map((item, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900">{item.user?.email}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {item.anomalyCount} anomalies detected
                </p>
                <p className="text-xs text-gray-600">
                  Avg Risk: {(item.avgScore * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BehavioralAnalytics;
