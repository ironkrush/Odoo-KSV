import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

const getStoredToken = () => localStorage.getItem('vb_token');
const getStoredUser = (): User | null => {
  const userJson = localStorage.getItem('vb_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = getStoredToken();
  const initialUser = getStoredUser();

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,
    setAuth: (user, token) => {
      localStorage.setItem('vb_token', token);
      localStorage.setItem('vb_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    clearAuth: () => {
      localStorage.removeItem('vb_token');
      localStorage.removeItem('vb_user');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
