import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth';

// Interface pour l'utilisateur
export interface User {
  id: string;
  email: string;
  fullName?: string | null;
  avatar?: string | null;
  role?: string;
}

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Propriétés du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Utilisation du store Zustand pour l'état
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();

  // Valeur du contexte
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
