import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken } from '../services/api';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (payload: { accessToken?: string; credential?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api.auth
      .me()
      .then((res) => {
        setUser(res.user);
      })
      .catch(() => {
        setStoredToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setStoredToken(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password });
    setStoredToken(res.token);
    setUser(res.user);
  };

  const loginWithGoogle = async (payload: {
    accessToken?: string;
    credential?: string;
  }) => {
    const res = await api.auth.googleLogin(payload);
    setStoredToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  return useContext(AuthContext);
}
