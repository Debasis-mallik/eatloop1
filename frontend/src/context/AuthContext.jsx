import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eatloop_user')) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('eatloop_token') || null);

  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.user);
          localStorage.setItem('eatloop_user', JSON.stringify(data.user));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('eatloop_token', data.token);
    localStorage.setItem('eatloop_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('eatloop_token', data.token);
    localStorage.setItem('eatloop_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('eatloop_token');
    localStorage.removeItem('eatloop_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('eatloop_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
