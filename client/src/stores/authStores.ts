
import { create } from 'zustand';
import { apiClient } from '@/services/apiClient';

import {
  clearSession,
  getSession,
  saveSession,
} from '@/services/authStorage';

import { useCartStore } from '@/stores/cartStore';
import type { SessionUser } from '@/types/auth';

interface AuthResponse {
  message: string;
  accessToken: string;
  user: SessionUser;
}

interface AuthStore {
  user: SessionUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: getSession(),

  login: async (email, password) => {
    const response = await apiClient.post<AuthResponse>(
      'auth/login',
      { email, password },
    );

    const { user, accessToken } = response.data;

    if (!accessToken || !user) {
      throw new Error('Login response is incomplete');
    }

    saveSession(user, accessToken);

    // Load only this user's cart after login.
    useCartStore.getState().load(user.id);

    set({ user });
  },

  logout: () => {
    // Remove the previous user's cart from the screen.
    useCartStore.getState().reset();

    clearSession();

    set({ user: null });
  },
}));
