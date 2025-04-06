import { useAuthStore } from '@/stores/auth';

export interface TeamMember {
  id: number | string; // string pour les invitations en attente, avec préfixe 'inv_'
  userId?: number;
  fullName: string;
  email: string;
  photoURL?: string;
  role?: string;
  status?: 'active' | 'pending' | 'inactive';
  projectCount?: number;
  invitationId?: number; // Pour les invitations en attente
}

export interface TeamMemberUpdateInput {
  id: number;
  role?: string;
  status?: string;
}

export interface TeamInvitation {
  id: number;
  email: string;
  name?: string;
  role: string;
  invitedBy: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt?: string;
  token: string;
  createdAt: string;
  updatedAt?: string;
  userId?: number;
}

export interface TeamInvitationInput {
  email: string;
  name?: string;
  role?: string;
  sendNotification?: boolean;
}

export interface TeamInvitationResponseInput {
  notificationId?: number;
}
