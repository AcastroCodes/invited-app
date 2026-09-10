import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/user')
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await axios.get('/sanctum/csrf-cookie');
    await axios.post('/login', { email, password });
    const res = await axios.get('/api/user');
    setUser(res.data);
    window.location.href = '/dashboard';
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    await axios.get('/sanctum/csrf-cookie');
    await axios.post('/register', { name, email, password, password_confirmation: password, ...(role && { role }) });
    const res = await axios.get('/api/user');
    setUser(res.data);
    window.location.href = '/dashboard';
  };

  const logout = async () => {
    await axios.post('/logout');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
