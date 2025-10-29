import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const demoAccounts = [
  { 
    email: 'admin@devmonitor.com', 
    password: 'admin123456', 
    user: {
      id: 1,
      name: 'Admin User',
      email: 'admin@devmonitor.com',
      role: 'Admin'
    }
  },
  { 
    email: 'developer@devmonitor.com', 
    password: 'developer123', 
    user: {
      id: 2,
      name: 'Developer User',
      email: 'developer@devmonitor.com',
      role: 'Developer'
    }
  },
  { 
    email: 'viewer@devmonitor.com', 
    password: 'viewer123', 
    user: {
      id: 3,
      name: 'Viewer User',
      email: 'viewer@devmonitor.com',
      role: 'Viewer'
    }
  },
  { 
    email: 'john.doe@example.com', 
    password: 'john123', 
    user: {
      id: 4,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Developer'
    }
  },
  { 
    email: 'jane.smith@example.com', 
    password: 'jane123', 
    user: {
      id: 5,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Developer'
    }
  },
  { 
    email: 'alex.johnson@example.com', 
    password: 'alex123', 
    user: {
      id: 6,
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      role: 'Admin'
    }
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const fetchUser = async () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }

    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      api.setAuthToken(token);
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password) => {
    const demoAccount = demoAccounts.find(
      account => account.email === email && account.password === password
    );

    if (demoAccount) {
      const mockToken = `demo-token-${demoAccount.user.id}-${Date.now()}`;
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(demoAccount.user));
      api.setAuthToken(mockToken);
      setToken(mockToken);
      setUser(demoAccount.user);
      return {
        success: true,
        data: {
          user: demoAccount.user,
          token: mockToken
        }
      };
    }

    const response = await api.post('/api/auth/login', { email, password });
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    api.setAuthToken(token);
    setToken(token);
    setUser(user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    api.setAuthToken(token);
    setToken(token);
    setUser(user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
