import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { client } from '@/api/generated/client.gen';
import type { AuthResponse, UserProfileResponse } from '@/api/generated';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize client config synchronously on load to point to the backend server running on port 3000
client.setConfig({
  baseUrl: 'http://localhost:3000/api/v1'
});

const initialToken = localStorage.getItem('sinter_token');
if (initialToken) {
  client.setConfig({
    headers: {
      Authorization: `Bearer ${initialToken}`
    }
  });
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState<User | null>(null);

  // Fetch current user details if a token exists
  useEffect(() => {
    if (token) {
      const fetchUser = async () => {
        try {
          const response = await client.get<{ data: UserProfileResponse }, any, true>({
            url: '/users/me',
            throwOnError: true
          });
          if (response.data) {
            setUser({
              id: response.data.id,
              username: response.data.username
            });
          }
        } catch (err) {
          console.error('Failed to fetch user info on load:', err);
          logout();
        }
      };
      fetchUser();
    }
  }, [token]);

  const login = async (identifier: string, password: string) => {
    let device_name = 'Web Browser';
    try {
      if (typeof window !== 'undefined') {
        if ((window as any).__TAURI_INTERNALS__) {
          device_name = 'Tauri Desktop';
        } else {
          device_name = navigator.userAgent.substring(0, 100);
        }
      }
    } catch (e) {
      // noop
    }

    const response = await client.post<{ data: AuthResponse }, any, true>({
      url: '/auth/login',
      body: { identifier, password, device_name },
      throwOnError: true
    });
    const result = response.data;
    if (result) {
      localStorage.setItem('sinter_token', result.token);
      setToken(result.token);
      client.setConfig({
        headers: {
          Authorization: `Bearer ${result.token}`
        }
      });
      setUser({ id: result.id, username: result.username, email: result.email });
    }
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await client.post<{ data: AuthResponse }, any, true>({
      url: '/auth/register',
      body: { username, email, password },
      throwOnError: true
    });
    const result = response.data;
    if (result) {
      localStorage.setItem('sinter_token', result.token);
      setToken(result.token);
      client.setConfig({
        headers: {
          Authorization: `Bearer ${result.token}`
        }
      });
      setUser({ id: result.id, username: result.username, email: result.email });
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await client.post({
          url: '/auth/logout',
          throwOnError: true
        });
      }
    } catch (err) {
      console.error('Failed to logout from server:', err);
    }
    localStorage.removeItem('sinter_token');
    setToken(null);
    setUser(null);
    client.setConfig({
      headers: {
        Authorization: null
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
