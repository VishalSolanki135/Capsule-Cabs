import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { setAccessToken, clearTokens } from '../services/authTokens';

interface AuthContextType {
  user: null | { id: string; phone: string; firstName: string };
  login: (phone: string, password: string) => Promise<void>;
  register: (payload: {
    phone: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);

  useEffect(() => {
    // Optionally fetch user profile if accessToken exists
  }, []);

  const login = async (phone: string, password: string) => {
    const { data } = await api.post('/auth/login', { phone, password });
    const { accessToken, refreshToken } = data.data;
    setAccessToken(accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    // Decode token or fetch profile
    setUser({ id: '', phone, firstName: '' });
  };

  const register = async (payload: {
    phone: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    const { data } = await api.post('/auth/register', payload);
    const { accessToken, refreshToken } = data.data;
    setAccessToken(accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser({
      id: data.data.user.id,
      phone: data.data.user.phone,
      firstName: data.data.user.firstName
    });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    clearTokens();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
