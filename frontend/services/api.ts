import axios from 'axios';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

const getApiUrl = () => {
  if (Platform.OS === 'ios') {
    return `http://127.0.0.1:3333/api/v1`;
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3333/api/v1';
  }
  return `http://127.0.0.1:3333/api/v1`;
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  async (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Utiliser getState() pour accéder aux méthodes du store
      const { clearAuth } = useAuthStore.getState();
      if (clearAuth) {
        clearAuth();
        router.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;