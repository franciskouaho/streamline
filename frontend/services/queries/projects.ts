import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import type { ProjectData } from '@/types/project';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get<ProjectData[]>('/projects');
      return data;
    },
  });
}

export function useProject(id: string | number) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get<ProjectData>(`/projects/${id}`);
      return data;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProjectData>) => {
      try {
        // Nettoyer les données avant l'envoi
        const projectData = {
          name: data.name?.trim(),
          description: data.description?.trim() || null,
          status: data.status || 'active'
        };

        console.log('Sending project data:', projectData);
        const response = await api.post('/projects', projectData);
        console.log('Project creation response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Project creation error details:', {
          error,
          response: error.response?.data,
          status: error.response?.status
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject(id: string | number) {
  return useMutation({
    mutationFn: async (updatedProject: Partial<ProjectData>) => {
      const { data } = await api.put<ProjectData>(`/projects/${id}`, updatedProject);
      return data;
    },
  });
}

export function useDeleteProject() {
  return useMutation({
    mutationFn: async (id: string | number) => {
      await api.delete(`/projects/${id}`);
      return id;
    },
  });
}
