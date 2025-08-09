import { useState, useEffect } from 'react';

const CORRECT_PASSWORD = import.meta.env.VITE_LOGIN_PASSWORD || 'LongevInfiniteLife';
const AUTH_STORAGE_KEY = 'longevai_authenticated';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(stored === 'true');
    setIsLoading(false);
  }, []);

  const login = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}