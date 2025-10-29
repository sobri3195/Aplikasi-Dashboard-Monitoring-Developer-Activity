import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      newSocket.emit('join-dashboard');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    newSocket.on('new-activity', (data) => {
      console.log('New activity:', data);
      if (data.isSuspicious) {
        toast.error(`Suspicious activity detected: ${data.activityType}`, {
          duration: 5000,
        });
      }
    });

    newSocket.on('new-alert', (data) => {
      console.log('New alert:', data);
      const { alert } = data;
      if (alert.severity === 'CRITICAL') {
        toast.error(`Critical Alert: ${alert.message}`, {
          duration: 8000,
        });
      } else if (alert.severity === 'WARNING') {
        toast(`Warning: ${alert.message}`, {
          icon: '⚠️',
          duration: 6000,
        });
      }
    });

    newSocket.on('device-registered', (device) => {
      toast.success(`New device registered: ${device.deviceName}`);
    });

    newSocket.on('device-approved', (device) => {
      toast.success(`Device approved: ${device.deviceName}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
