import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import * as Sentry from '@sentry/react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Devices from './pages/Devices';
import Activities from './pages/Activities';
import Alerts from './pages/Alerts';
import Security from './pages/Security';
import Repositories from './pages/Repositories';
import Users from './pages/Users';
import DeveloperStats from './pages/DeveloperStats';
import SecurityLogs from './pages/SecurityLogs';
import BehavioralAnalytics from './pages/BehavioralAnalytics';
import DeviceVerification from './pages/DeviceVerification';
import ErrorFallback from './components/ErrorFallback';

const SentryRoutes = Sentry.withSentryRouting(Routes);

function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                },
              }}
            />
            <SentryRoutes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="monitoring" element={<Monitoring />} />
              <Route path="devices" element={<Devices />} />
              <Route path="activities" element={<Activities />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="security" element={<Security />} />
              <Route path="repositories" element={<Repositories />} />
              <Route path="users" element={<Users />} />
              <Route path="developer-stats" element={<DeveloperStats />} />
              <Route path="security-logs" element={<SecurityLogs />} />
              <Route path="behavioral-analytics" element={<BehavioralAnalytics />} />
              <Route path="device-verification" element={<DeviceVerification />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </SentryRoutes>
        </SocketProvider>
      </AuthProvider>
    </Router>
    </Sentry.ErrorBoundary>
  );
}

export default App;
