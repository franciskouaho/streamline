import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { TeamMember, TeamMemberUpdateInput, TeamInvitation, TeamInvitationInput } from '@/types/team';
import { useAuthStore } from '@/stores/auth'; // Ajouter cette ligne pour accéder à l'utilisateur connecté

// Récupérer tous les membres de l'équipe
export const useTeamMembers = () => {
  return useQuery<TeamMember[]>({
    queryKey: ['team-members'],
    queryFn: async () => {
      console.log('Fetching team members from frontend...');
      try {
        const response = await api.get('/team/members');
        console.log('Team members response data:', response.data);
        // Renvoyer les données telles quelles, SANS aucun filtrage
        return response.data;
      } catch (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }
    },
  });
};

// Récupérer un membre d'équipe spécifique
export const useTeamMember = (id: number) => {
  return useQuery({
    queryKey: ['team-members', id],
    queryFn: async (): Promise<TeamMember> => {
      const response = await api.get(`/team/members/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

// Récupérer les invitations envoyées
export const useTeamInvitations = () => {
  return useQuery<TeamInvitation[]>({
    queryKey: ['team-invitations'],
    queryFn: async () => {
      try {
        const response = await api.get('/team/invitations');
        console.log('Team invitations response data:', response.data);
        // Ne pas filtrer les invitations
        return response.data;
      } catch (error) {
        console.error('Error fetching team invitations:', error);
        throw error;
      }
    }
  });
};

// Inviter un nouveau membre
export const useInviteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inviteData: TeamInvitationInput) => {
      const response = await api.post('/team/invitations', inviteData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
    }
  });
};

// Renvoyer une invitation
export const useResendInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invitationId: number) => {
      const response = await api.post(`/team/invitations/${invitationId}/resend`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
    }
  });
};

// Annuler une invitation
export const useCancelInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invitationId: number) => {
      const response = await api.delete(`/team/invitations/${invitationId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    }
  });
};

// Mettre à jour un membre d'équipe
export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updateData: TeamMemberUpdateInput) => {
      const response = await api.put(`/team/members/${updateData.id}`, updateData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members', data.id] });
    }
  });
};

// Supprimer un membre d'équipe
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (memberId: number) => {
      await api.delete(`/team/members/${memberId}`);
      return memberId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    }
  });
};
