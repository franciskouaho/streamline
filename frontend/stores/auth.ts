import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Suppression de l'import direct de api pour éviter le cycle de dépendances
// import api from '@/services/api';

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
  deleteAccount: () => Promise<void>;
  initialize: () => Promise<void>;
  clearAuth: () => Promise<void>; // Ajout de la fonction clearAuth
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
        // Import dynamique pour éviter le cycle de dépendances
        const { default: api } = await import('@/services/api');
        // Configure axios avec le token avant la requête
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await api.get('/auth/me');
          set({
            user: response.data.user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Erreur de vérification du token:', error);
          await AsyncStorage.removeItem('@auth_token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
    } catch (error) {
      console.error('Erreur d\'initialisation:', error);
      await AsyncStorage.removeItem('@auth_token');
      // Dynamiquement importer api pour éviter le cycle
      const { default: api } = await import('@/services/api');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      // Import dynamique pour éviter le cycle de dépendances
      const { default: api } = await import('@/services/api');
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem('@auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
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
      // Import dynamique pour éviter le cycle de dépendances
      const { default: api } = await import('@/services/api');
      const response = await api.post('/auth/register', { email, password, fullName });
      const { token, user } = response.data;

      await AsyncStorage.setItem('@auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
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
      // Import dynamique pour éviter le cycle de dépendances
      const { default: api } = await import('@/services/api');
      
      // Appel API pour déconnecter (si le backend le supporte)
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.log('Logout API error (non-critical):', error);
      }
      
      // Même si l'API échoue, on supprime le token localement
      await AsyncStorage.removeItem('@auth_token');
      delete api.defaults.headers.common['Authorization'];
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  },
  
  deleteAccount: async () => {
    try {
      // Import dynamique pour éviter le cycle de dépendances
      const { default: api } = await import('@/services/api');
      await api.delete('/auth/me');
      await AsyncStorage.removeItem('@auth_token');
      delete api.defaults.headers.common['Authorization'];
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      throw error;
    }
  },
  
  clearAuth: async () => {
    await AsyncStorage.removeItem('@auth_token');
    // Import dynamique pour éviter le cycle de dépendances
    const { default: api } = await import('@/services/api');
    delete api.defaults.headers.common['Authorization'];
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  }
}));
