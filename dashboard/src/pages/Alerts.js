import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ severity: '', isResolved: '' });

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (filter.severity) params.severity = filter.severity;
      if (filter.isResolved) params.isResolved = filter.isResolved;
      
      const response = await api.get('/api/alerts', { params });
      setAlerts(response.data.data);
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await api.put(`/api/alerts/${alertId}/resolve`);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      INFO: InformationCircleIcon,
      WARNING: ExclamationCircleIcon,
      CRITICAL: ExclamationCircleIcon,
    };
    return icons[severity] || InformationCircleIcon;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      INFO: 'bg-blue-100 text-blue-800 border-blue-200',
      WARNING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
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
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
        <p className="mt-1 text-sm text-gray-500">Security alerts and notifications</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <select
            value={filter.severity}
            onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Severities</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <select
            value={filter.isResolved}
            onChange={(e) => setFilter({ ...filter, isResolved: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Alerts</option>
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => {
          const SeverityIcon = getSeverityIcon(alert.severity);
          return (
            <div
              key={alert.id}
              className={`bg-white rounded-lg border-l-4 shadow-sm p-6 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <SeverityIcon className="h-6 w-6" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{alert.alertType}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.isResolved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {alert.isResolved ? 'Resolved' : 'Open'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{alert.message}</p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">User:</span> {alert.activity?.user?.email || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Device:</span> {alert.activity?.device?.deviceName || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Repository:</span> {alert.activity?.repository || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span>{' '}
                      {format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  {!alert.isResolved && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Resolve
                      </button>
                    </div>
                  )}
                  {alert.isResolved && alert.resolvedAt && (
                    <div className="mt-2 text-xs text-gray-500">
                      Resolved on {format(new Date(alert.resolvedAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
            <p className="mt-1 text-sm text-gray-500">
              All clear! No security alerts at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
