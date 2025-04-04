import { create } from 'zustand';
import api from '@/services/api'; // Import normal au lieu d'import dynamique

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  photoURL?: string;
  bio?: string;
  tasksInProgress?: number;
  tasksCompleted?: number;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
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
      
      // Utiliser l'API importée normalement
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
      
      // Utiliser l'API importée normalement
      const formattedData = {
        fullName: data.fullName,
        email: data.email,
        bio: data.bio,
        avatar: data.photoURL,  // Adaptation au format attendu par l'API
        role: data.role
      };
      
      const response = await api.put<{user: UserProfile}>('/auth/update', formattedData);
      
      // Mise à jour du profil avec les données renvoyées par l'API
      set({ 
        profile: response.data.user || {
          ...get().profile,
          ...data
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ error: "Impossible de mettre à jour le profil", isLoading: false });
      throw error;
    }
  },
}));
