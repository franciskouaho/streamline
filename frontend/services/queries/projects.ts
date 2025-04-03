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
      // Formatage des dates au format ISO
      const projectData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      };
      
      console.log('Creating project with data:', projectData);
      const response = await api.post('/projects', projectData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
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
