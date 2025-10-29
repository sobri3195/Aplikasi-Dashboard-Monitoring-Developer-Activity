import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  ClockIcon,
  ServerIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DeveloperStats = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [groupBy, setGroupBy] = useState('time');
  const [activityStats, setActivityStats] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    fetchStats();
  }, [timeRange, groupBy]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, metricsRes, heatmapRes] = await Promise.all([
        api.get(`/api/developer-stats/activity-stats?timeRange=${timeRange}&groupBy=${groupBy}`),
        api.get(`/api/developer-stats/performance-metrics?timeRange=${timeRange}`),
        api.get(`/api/developer-stats/heatmap?timeRange=30d`)
      ]);

      setActivityStats(statsRes.data.data);
      setPerformanceMetrics(metricsRes.data.data);
      setHeatmapData(heatmapRes.data.data);
    } catch (error) {
      toast.error('Failed to load developer statistics');
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

  const { summary, repositories, devices, hourlyDistribution } = performanceMetrics || {};

  const statsCards = [
    {
      name: 'Total Activities',
      value: summary?.totalActivities || 0,
      icon: ChartBarIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Commits',
      value: summary?.commitStats?.totalCommits || 0,
      icon: CodeBracketIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Active Repositories',
      value: repositories?.length || 0,
      icon: ServerIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Active Devices',
      value: devices?.length || 0,
      icon: ClockIcon,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developer Activity Statistics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive analytics of developer activities
          </p>
        </div>
        <div className="flex space-x-4">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="time">By Time</option>
            <option value="repo">By Repository</option>
            <option value="device">By Device</option>
            <option value="type">By Type</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            {groupBy === 'time' ? (
              <LineChart data={activityStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            ) : groupBy === 'type' ? (
              <PieChart>
                <Pie
                  data={activityStats}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {activityStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : (
              <BarChart data={activityStats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={groupBy === 'repo' ? 'repository' : 'device.deviceName'} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Repositories</h3>
          <div className="space-y-3">
            {repositories && repositories.slice(0, 10).map((repo, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {repo.repository}
                  </p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {repo._count} activities
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Devices</h3>
          <div className="space-y-3">
            {devices && devices.slice(0, 10).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.device?.deviceName || 'Unknown Device'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.device?.hostname}
                  </p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.count} activities
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summary?.activityByType && summary.activityByType.map((type, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500">{type.activityType}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{type._count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeveloperStats;
