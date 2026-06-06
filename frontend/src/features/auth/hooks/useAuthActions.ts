import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { User } from '@/types';

export const useAuthActions = () => {
  const { setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (email === 'admin@vendorbridge.com' && password === 'password') {
        const mockUser: User = {
          id: 'u-1',
          name: 'Aman Patel',
          email: 'admin@vendorbridge.com',
          role: 'BUYER',
        };
        const mockToken = 'mock_jwt_token_vb_12345';
        setAuth(mockUser, mockToken);
        return true;
      } else {
        setError('Invalid email or password. Use admin@vendorbridge.com / password.');
        return false;
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong during login.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const mockUser: User = {
        id: `u-${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        role: 'BUYER',
      };
      const mockToken = 'mock_jwt_token_vb_registered';
      setAuth(mockUser, mockToken);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Something went wrong during registration.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  return { login, register, logout, isLoading, error };
};
