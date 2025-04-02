import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/stores/auth';

interface AuthResponse {
  token: string;
}

interface LoginData {
  email: string;
  password: string;
  remember?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

interface UserData {
  id: number;
  email: string;
  fullName: string;
  profile?: {
    // ajoutez les champs du profil selon votre modèle
  };
}

export function useLogin() {
  const login = useAuthStore(state => state.login);
  
  return useMutation({
    mutationFn: async (data: LoginData) => {
      await login(data.email, data.password);
    },
  });
}

export function useRegister() {
  const register = useAuthStore(state => state.register);
  
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      await register(data.email, data.password, data.fullName);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
      const authStore = useAuthStore.getState();
      authStore.clearAuth();
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<UserData>('/auth/me');
      return data;
    },
  });
}
