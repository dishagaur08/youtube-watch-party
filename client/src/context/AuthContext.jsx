import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('vyntra_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data?.success) {
          setUser(res.data.data);
          const socket = getSocket();
          socket.emit('user:online', { userId: res.data.data._id || res.data.data.id });
        }
      } catch (err) {
        localStorage.removeItem('vyntra_token');
        localStorage.removeItem('vyntra_refresh_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { user: userData, token, refreshToken } = res.data.data;
      localStorage.setItem('vyntra_token', token);
      localStorage.setItem('vyntra_refresh_token', refreshToken);
      setUser(userData);
      const socket = getSocket();
      socket.emit('user:online', { userId: userData._id || userData.id });
      return { success: true };
    }
    return { success: false, message: res.data?.message };
  };

  const register = async (username, email, password, displayName) => {
    const res = await api.post('/auth/register', { username, email, password, displayName });
    if (res.data?.success) {
      const { user: userData, token, refreshToken } = res.data.data;
      localStorage.setItem('vyntra_token', token);
      localStorage.setItem('vyntra_refresh_token', refreshToken);
      setUser(userData);
      const socket = getSocket();
      socket.emit('user:online', { userId: userData._id || userData.id });
      return { success: true };
    }
    return { success: false, message: res.data?.message };
  };

  const logout = () => {
    localStorage.removeItem('vyntra_token');
    localStorage.removeItem('vyntra_refresh_token');
    setUser(null);
  };

  const updateProfile = async (updateData) => {
    const res = await api.put('/auth/profile', updateData);
    if (res.data?.success) {
      setUser(res.data.data);
      return { success: true, data: res.data.data };
    }
    return { success: false, message: res.data?.message };
  };

  // Quick Demo Account Login helper for seamless evaluation
  const loginAsDemo = async (role = 'user') => {
    const email = role === 'admin' ? 'admin@vyntra.io' : 'disha@vyntra.io';
    return await login(email, 'vyntra123');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
