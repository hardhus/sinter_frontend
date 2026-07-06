import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { client } from '@/rspc';

interface AuthContextType {
  user: { id: string; username: string; email: string } | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('sinter_token'));
  const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);

  // Token varsa kullanıcı bilgilerini al (isteğe bağlı)
  useEffect(() => {
    if (token) {
      // Örneğin: client.query('auth.me') gibi bir query ile kullanıcı bilgilerini çekebilirsin.
      // Şimdilik basit tutalım.
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const result = await client.mutation('auth.login', { email, password });
    localStorage.setItem('sinter_token', result.token);
    setToken(result.token);
    setUser({ id: result.id, username: result.username, email: result.email });
  };

  const register = async (username: string, email: string, password: string) => {
    const result = await client.mutation('auth.register', { username, email, password });
    localStorage.setItem('sinter_token', result.token);
    setToken(result.token);
    setUser({ id: result.id, username: result.username, email: result.email });
  };

  const logout = () => {
    localStorage.removeItem('sinter_token');
    setToken(null);
    setUser(null);
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
