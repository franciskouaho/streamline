import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

interface User {
  id: number;
  email: string;
  fullName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem('@auth_token');
      
      if (token) {
        // Configure axios avec le token avant la requête
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await api.get('/auth/me');
        set({
          user: response.data.user,
          token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Erreur d\'initialisation:', error);
      await AsyncStorage.removeItem('@auth_token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem('@auth_token', token);
      set({
        user,
        token,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      set({ error: 'Erreur de connexion' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string, fullName: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/register', { email, password, fullName });
      const { token, user } = response.data;

      await AsyncStorage.setItem('@auth_token', token);
      set({
        user,
        token,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      set({ error: "Erreur d'inscription" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  },
}));
