import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TeamMember, TeamInvitation, InviteUserInput, TeamMemberUpdateInput } from '@/types/team';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth'; // Ajouter cette ligne pour accéder à l'utilisateur connecté

// Récupérer tous les membres de l'équipe
export const useTeamMembers = () => {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async (): Promise<TeamMember[]> => {
      try {
        const response = await api.get('/team/members');
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des membres:", error);
        return [];
      }
    }
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

// Récupérer toutes les invitations
export const useTeamInvitations = () => {
  const { user } = useAuthStore(); // Ajouter cette ligne pour accéder à l'utilisateur connecté

  return useQuery({
    queryKey: ['team-invitations'],
    queryFn: async (): Promise<TeamInvitation[]> => {
      const response = await api.get('/team/invitations');
      // Filtrer les invitations pour exclure celles de l'utilisateur connecté
      return response.data.filter((invitation: TeamInvitation) => 
        invitation.email !== user?.email
      );
    }
  });
};

// Inviter un utilisateur
export const useInviteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inviteData: InviteUserInput) => {
      const response = await api.post('/team/invite', inviteData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
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
      await api.delete(`/team/invitations/${invitationId}`);
      return invitationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
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
