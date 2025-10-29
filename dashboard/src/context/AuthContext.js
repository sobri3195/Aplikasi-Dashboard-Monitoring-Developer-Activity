import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const fetchUser = async () => {
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
    const response = await api.post('/api/auth/login', { email, password });
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    api.setAuthToken(token);
    setToken(token);
    setUser(user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    api.setAuthToken(token);
    setToken(token);
    setUser(user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
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
