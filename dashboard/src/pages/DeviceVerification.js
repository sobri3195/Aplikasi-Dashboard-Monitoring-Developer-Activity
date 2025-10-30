import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  ComputerDesktopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const DeviceVerification = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [devices, setDevices] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, devicesRes] = await Promise.all([
        api.get('/api/device-verification/pending'),
        api.get('/api/devices')
      ]);

      setPendingRequests(requestsRes.data.data.requests);
      setDevices(devicesRes.data.data);
    } catch (error) {
      toast.error('Failed to load device verification data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.put(`/api/device-verification/${requestId}/approve`);
      toast.success('Verification request approved');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve request');
      console.error(error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.put(`/api/device-verification/${requestId}/reject`, {
        reason: 'Rejected by admin'
      });
      toast.success('Verification request rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject request');
      console.error(error);
    }
  };

  const handleForceReverification = async (deviceId) => {
    if (!window.confirm('Are you sure you want to force this device to re-verify?')) {
      return;
    }

    try {
      await api.put(`/api/device-verification/force/${deviceId}`);
      toast.success('Device forced to re-verify');
      fetchData();
    } catch (error) {
      toast.error('Failed to force re-verification');
      console.error(error);
    }
  };

  const handleRequestReverification = async () => {
    if (!selectedDevice || !requestReason.trim()) {
      toast.error('Please select a device and provide a reason');
      return;
    }

    try {
      await api.post('/api/device-verification/request', {
        deviceId: selectedDevice.id,
        reason: requestReason
      });
      toast.success('Re-verification request submitted');
      setShowRequestModal(false);
      setSelectedDevice(null);
      setRequestReason('');
      fetchData();
    } catch (error) {
      toast.error('Failed to submit request');
      console.error(error);
    }
  };

  const openRequestModal = (device) => {
    setSelectedDevice(device);
    setShowRequestModal(true);
  };

  const getDeviceStatusColor = (status) => {
    const colors = {
      APPROVED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDeviceStatusIcon = (status) => {
    const icons = {
      APPROVED: CheckCircleIcon,
      PENDING: ClockIcon,
      REJECTED: XCircleIcon,
      SUSPENDED: XCircleIcon,
    };
    const Icon = icons[status] || ClockIcon;
    return <Icon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Verification Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage device verification requests and force re-verification
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{pendingRequests.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved Devices</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {devices.filter(d => d.status === 'APPROVED').length}
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
                <ComputerDesktopIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Devices</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{devices.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && pendingRequests.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pending Verification Requests</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingRequests.map((request) => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <ComputerDesktopIcon className="h-5 w-5 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">
                        {request.device?.deviceName}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeviceStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      User: {request.device?.user?.email}
                    </p>
                    {request.reason && (
                      <p className="text-sm text-gray-500 mt-1">
                        Reason: {request.reason}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Requested: {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Devices</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {devices.map((device) => (
            <div key={device.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <ComputerDesktopIcon className="h-5 w-5 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">
                      {device.deviceName}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeviceStatusColor(device.status)}`}>
                      {getDeviceStatusIcon(device.status)}
                      <span className="ml-1">{device.status}</span>
                    </span>
                    {device.isAuthorized && (
                      <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    User: {device.user?.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Hostname: {device.hostname} | Last seen: {device.lastSeen ? format(new Date(device.lastSeen), 'MMM dd, HH:mm') : 'Never'}
                  </p>
                </div>
                {isAdmin && device.status === 'APPROVED' && (
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => openRequestModal(device)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Request Re-verification
                    </button>
                    <button
                      onClick={() => handleForceReverification(device.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Force Re-verify
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRequestModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Request Device Re-verification
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Device: {selectedDevice?.deviceName}
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for re-verification
                  </label>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    rows={4}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Provide a reason for requesting re-verification..."
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleRequestReverification}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedDevice(null);
                    setRequestReason('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceVerification;
