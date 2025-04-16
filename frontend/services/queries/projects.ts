import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Project, ProjectStats, ProjectProgress, ProjectTimeline } from '@/types/project';
import api from '@/services/api';

// Récupérer tous les projets
export const useProjects = (filter: 'all' | 'owned' | 'member' = 'all') => {
  return useQuery({
    queryKey: ['projects', filter],
    queryFn: async () => {
      try {
        const response = await api.get(`/projects?filter=${filter}`)
        console.log('Projects response:', response.data)
        return response.data
      } catch (error) {
        console.error('Error fetching projects:', error)
        throw error
      }
    }
  })
}

// Récupérer un projet spécifique par ID
export const useProject = (id: string | number) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async (): Promise<Project> => {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

// Créer un nouveau projet
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectData: Partial<Project>) => {
      try {
        // Formater les données avant l'envoi
        const formattedData = {
          ...projectData,
          settings: '{}', // String JSON vide
          // S'assurer que les tags sont envoyés comme un tableau d'objets
          tags: projectData.tags ? projectData.tags.map(tag => ({
            name: tag.name,
            color: tag.color,
            icon: tag.icon
          })) : null
        };
        
        console.log('Formatted project data:', formattedData);
        const response = await api.post('/projects', formattedData);
        return response.data;
      } catch (error) {
        console.error('Error details:', error.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

// Mettre à jour un projet
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<Project>) => {
      const response = await api.put(`/projects/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] });
    }
  });
};

// Mettre à jour uniquement le statut d'un projet
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number | string; status: string }) => {
      const response = await api.patch(`/projects/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
    }
  });
};

// Supprimer un projet
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number | string) => {
      await api.delete(`/projects/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

// Ajouter un membre à un projet
export const useAddProjectMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, memberId }: { projectId: number, memberId: number }) => {
      try {
        console.log(`Requête POST vers /projects/${projectId}/members avec memberId:`, memberId);
        const response = await api.post(`/projects/${projectId}/members`, { memberId });
        return response.data;
      } catch (error) {
        console.error('Error in API call to add project member:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Corriger les clés d'invalidation pour qu'elles correspondent aux clés réellement utilisées
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Error adding member to project:', error);
    }
  });
};

// Supprimer un membre d'un projet
export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, memberId }: { projectId: number; memberId: number }) => {
      const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the project query to get updated data
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId.toString()] });
    },
    onError: (error) => {
      console.error('Error removing member from project:', error);
    }
  });
};

// Récupérer les statistiques des projets
export const useProjectStats = () => {
  return useQuery({
    queryKey: ['project-stats'],
    queryFn: async (): Promise<ProjectStats> => {
      const response = await api.get('/projects/stats');
      return response.data;
    }
  });
};

// Récupérer les données pour le graphique de progression
export const useProjectsProgress = () => {
  return useQuery({
    queryKey: ['projects-progress'],
    queryFn: async (): Promise<ProjectProgress[]> => {
      const response = await api.get('/projects/progress');
      return response.data;
    }
  });
};

// Récupérer les données pour le graphique de timeline
export const useProjectTimeline = () => {
  return useQuery({
    queryKey: ['project-timeline'],
    queryFn: async (): Promise<ProjectTimeline[]> => {
      const response = await api.get('/projects/timeline');
      return response.data;
    }
  });
};