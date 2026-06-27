import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pcp_token');
    const savedUser = localStorage.getItem('pcp_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        api.get('/auth/me').then(u => { setUser(u); localStorage.setItem('pcp_user', JSON.stringify(u)); }).catch(() => logout());
      } catch { logout(); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('pcp_token', data.token);
    localStorage.setItem('pcp_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('pcp_token');
    localStorage.removeItem('pcp_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
