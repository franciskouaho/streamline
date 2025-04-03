import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Project, ProjectStats, ProjectProgress, ProjectTimeline } from '@/types/project';
import api from '@/services/api';

// Récupérer tous les projets
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      const response = await api.get('/projects');
      return response.data;
    }
  });
};

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
      const response = await api.post('/projects', projectData);
      return response.data;
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