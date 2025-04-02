import { create } from 'zustand';
import { useAuthStore } from './auth';
import api from '@/services/api';

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  photoURL?: string;
  bio?: string;
  tasksInProgress?: number;
  tasksCompleted?: number;
}

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get<{user: UserProfile}>('/auth/me');
      set({ 
        profile: response.data.user,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ error: "Impossible de récupérer le profil", isLoading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.put<UserProfile>('/auth/update', data);
      set({ 
        profile: response.data,
        isLoading: false
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ error: "Impossible de mettre à jour le profil", isLoading: false });
      throw error;
    }
  },
}));
