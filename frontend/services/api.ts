import axios from 'axios';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'ios') {
      return 'http://localhost:3333/api/v1';
    } else if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3333/api/v1';
    } else {
      return 'https://api.emplica.fr/api/v1';
    }
  } else {
    return 'https://api.emplica.fr/api/v1';
  }
};

// Configuration de base pour axios
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // Augmentation du timeout à 15 secondes
});

// Ajout des informations de débogage
console.log('API URL:', getApiUrl());
console.log('Platform:', Platform.OS);

let retryCount = 0;
const MAX_RETRIES = 3;

// Stocker le chemin de redirection pour les erreurs 401
let isRedirecting = false;

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  async (config) => {
    try {
      // Récupération du token depuis le stockage
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log(`Requête ${config.method?.toUpperCase()} vers ${config.url}`);
      return config;
    } catch (error) {
      console.error('Erreur dans l\'intercepteur de requête:', error);
      return config;
    }
  },
  (error) => {
    console.error('Erreur lors de la préparation de la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => {
    // Réinitialiser le compteur de tentatives en cas de succès
    retryCount = 0;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Gestion spécifique des erreurs réseau
    if (error.message === 'Network Error') {
      console.warn(i18n.t('errors.network'));
      
      // Logique de retry pour les erreurs réseau
      if (retryCount < MAX_RETRIES && originalRequest) {
        retryCount++;
        console.log(`${i18n.t('errors.retryAttempt')} ${retryCount}/${MAX_RETRIES}...`);
        
        // Attendre avant de réessayer (délai exponentiel avec jitter)
        const delay = Math.min(1000 * 2 ** retryCount + Math.random() * 1000, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return api(originalRequest);
      }
    }
    
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      console.log(i18n.t('errors.sessionExpired'));
      await AsyncStorage.removeItem('@auth_token');
      delete api.defaults.headers.common['Authorization'];
      
      // On importe dynamiquement le store pour éviter les cycles de dépendances
      try {
        const authStoreModule = await import('@/stores/auth');
        const clearAuth = authStoreModule.useAuthStore.getState().clearAuth;
        if (clearAuth) {
          await clearAuth();
        }
      } catch (importError) {
        console.error("Erreur lors de l'import du store Auth:", importError);
      }
      
      // Éviter les redirections multiples
      if (!isRedirecting) {
        isRedirecting = true;
        
        // Redirection vers la page de login avec une légère attente
        setTimeout(() => {
          try {
            router.replace('/login');
            setTimeout(() => {
              isRedirecting = false;
            }, 1000);
          } catch (e) {
            console.error('Erreur de redirection:', e);
            isRedirecting = false;
          }
        }, 100);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
