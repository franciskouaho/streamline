import { useAuthStore } from '@/stores/auth';

export interface TeamMember {
  id: number | string;
  fullName: string;
  email: string;
  photoURL?: string | null;
  role?: string;
  status?: 'active' | 'pending' | 'inactive';
  projectCount?: number;
}

export interface TeamInvitation {
  id: number;
  email: string;
  name?: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedBy: number;
  expiresAt?: string;
  createdAt: string;
  token: string;
}

export interface InviteUserInput {
  email: string;
  name?: string;
  role?: string;
  sendNotification?: boolean;
}

export interface TeamMemberUpdateInput {
  id: number;
  role?: string;
}
