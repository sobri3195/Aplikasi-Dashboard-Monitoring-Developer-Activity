import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchDevices = async () => {
    try {
      const params = filter !== 'ALL' ? { status: filter } : {};
      const response = await api.get('/api/devices', { params });
      setDevices(response.data.data);
    } catch (error) {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (deviceId) => {
    try {
      await api.put(`/api/devices/${deviceId}/approve`);
      toast.success('Device approved successfully');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to approve device');
    }
  };

  const handleReject = async (deviceId) => {
    try {
      await api.put(`/api/devices/${deviceId}/reject`);
      toast.success('Device rejected');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to reject device');
    }
  };

  const handleRevoke = async (deviceId) => {
    try {
      await api.put(`/api/devices/${deviceId}/revoke`);
      toast.success('Device access revoked');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to revoke device access');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      SUSPENDED: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon },
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <badge.icon className="h-4 w-4 mr-1" />
        {status}
      </span>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and authorize developer devices</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Seen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{device.deviceName}</div>
                    <div className="text-xs text-gray-500">{device.hostname}</div>
                    <div className="text-xs text-gray-400">{device.osInfo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{device.user?.name}</div>
                    <div className="text-xs text-gray-500">{device.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(device.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {device.lastSeen ? format(new Date(device.lastSeen), 'MMM dd, yyyy HH:mm') : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {device.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(device.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(device.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {device.status === 'APPROVED' && (
                      <button
                        onClick={() => handleRevoke(device.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Devices;
