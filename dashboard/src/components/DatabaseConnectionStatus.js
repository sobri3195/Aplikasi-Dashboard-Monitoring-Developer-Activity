import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';

const DatabaseConnectionStatus = ({ onClose }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/db-connection/status');
      setStatus(response.data);
    } catch (error) {
      if (error.response?.data) {
        setStatus(error.response.data);
      } else {
        setStatus({
          connected: false,
          message: 'Failed to check database connection',
          error: error.message,
          instructions: [
            '1. Ensure the backend server is running',
            '2. Check your network connection',
            '3. Verify API_URL is configured correctly',
          ],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadGuide = async () => {
    try {
      const response = await api.get('/api/db-connection/guide');
      setGuide(response.data);
      setShowGuide(true);
    } catch (error) {
      console.error('Failed to load connection guide:', error);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center">
            <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-lg">Checking database connection...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {status?.connected ? (
                <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
              ) : (
                <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Database Connection Status
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {status?.database || 'crimson-base-54008430'} • {status?.provider || 'Neon PostgreSQL'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        </div>

        {/* Status Content */}
        <div className="p-6">
          {/* Connection Status */}
          <div className={`rounded-lg p-4 mb-6 ${
            status?.connected
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {status?.connected ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-lg font-medium ${
                  status?.connected ? 'text-green-800' : 'text-red-800'
                }`}>
                  {status?.message || 'Unknown status'}
                </h3>
                {status?.error && (
                  <p className="mt-2 text-sm text-red-700">
                    <strong>Error:</strong> {status.error}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Database Stats (if connected) */}
          {status?.connected && status?.stats && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Database Statistics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{status.stats.users}</div>
                  <div className="text-sm text-gray-600 mt-1">Users</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{status.stats.devices}</div>
                  <div className="text-sm text-gray-600 mt-1">Devices</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{status.stats.activities}</div>
                  <div className="text-sm text-gray-600 mt-1">Activities</div>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Status */}
          {status?.configuration && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Configuration</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">DATABASE_URL Configured:</span>
                  <span className={`font-medium ${
                    status.configuration.databaseUrlConfigured
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {status.configuration.databaseUrlConfigured ? 'Yes ✓' : 'No ✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Environment:</span>
                  <span className="font-medium text-gray-900">
                    {status.configuration.nodeEnv}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Instructions (if not connected) */}
          {!status?.connected && status?.instructions && status.instructions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
                What to do to connect:
              </h4>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <ol className="space-y-2">
                  {status.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Environment Variable Example */}
          {!status?.connected && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Example .env Configuration
              </h4>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono">
{`# Database Configuration
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require

# Backend Configuration
JWT_SECRET=your-jwt-secret-key-here
API_SECRET=your-api-secret-key-here
NODE_ENV=production

# Replace:
# [user] - Your Neon database username
# [password] - Your Neon database password
# [endpoint] - Your Neon endpoint (e.g., ep-cool-name-123456)`}
                </pre>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={checkConnection}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh Status
            </button>
            
            <button
              onClick={loadGuide}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              View Setup Guide
            </button>

            {status?.connected && (
              <button
                onClick={onClose}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            )}
          </div>

          {/* Connection Guide Modal */}
          {showGuide && guide && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      Database Connection Setup Guide
                    </h3>
                    <button
                      onClick={() => setShowGuide(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {guide.steps.map((step) => (
                      <div key={step.step} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full font-bold">
                              {step.step}
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {step.title}
                            </h4>
                            <p className="text-gray-600 mt-1">{step.description}</p>
                            {step.notes && (
                              <p className="text-sm text-gray-500 mt-2 italic">
                                Note: {step.notes}
                              </p>
                            )}
                            {step.example && (
                              <div className="mt-2 bg-gray-900 rounded p-3 overflow-x-auto">
                                <code className="text-sm text-green-400 font-mono">
                                  {step.example}
                                </code>
                              </div>
                            )}
                            {step.commands && (
                              <div className="mt-2 bg-gray-900 rounded p-3">
                                {step.commands.map((cmd, idx) => (
                                  <div key={idx} className="text-sm text-green-400 font-mono">
                                    $ {cmd}
                                  </div>
                                ))}
                              </div>
                            )}
                            {step.link && (
                              <a
                                href={step.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                              >
                                Visit {step.link} →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resources */}
                  {guide.resources && guide.resources.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Additional Resources
                      </h4>
                      <ul className="space-y-2">
                        {guide.resources.map((resource, idx) => (
                          <li key={idx}>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {resource.title} →
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectionStatus;
