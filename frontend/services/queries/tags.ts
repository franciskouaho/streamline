import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Tag, CreateTagInput } from '@/types/tag';
import { queryClient } from './queryClient';

// Récupérer les tags d'un projet
export const useProjectTags = (projectId?: string | number) => {
  return useQuery({
    queryKey: ['tags', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await api.get(`/projects/${projectId}/tags`);
      return response.data as Tag[];
    },
    enabled: !!projectId,
  });
};

// Créer un tag pour un projet
export const useCreateProjectTag = (projectId?: string | number) => {
  return useMutation({
    mutationFn: async (data: CreateTagInput) => {
      const response = await api.post(`/projects/${projectId}/tags`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
    },
  });
};

// Supprimer un tag d'un projet
export const useDeleteProjectTag = (projectId?: string | number) => {
  return useMutation({
    mutationFn: async (tagId: number) => {
      const response = await api.delete(`/projects/${projectId}/tags/${tagId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
    },
  });
};

// Récupérer les tags associés à une tâche
export const useTaskTags = (taskId?: string | number) => {
  return useQuery({
    queryKey: ['task-tags', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const response = await api.get(`/tasks/${taskId}/tags`);
      return response.data as Tag[];
    },
    enabled: !!taskId,
  });
};

// Ajouter des tags à une tâche
export const useAddTaskTags = (taskId?: string | number) => {
  return useMutation({
    mutationFn: async (tagIds: number[]) => {
      const response = await api.post(`/tasks/${taskId}/tags`, { tagIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-tags', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Supprimer un tag d'une tâche
export const useRemoveTaskTag = (taskId?: string | number) => {
  return useMutation({
    mutationFn: async (tagId: number) => {
      const response = await api.delete(`/tasks/${taskId}/tags/${tagId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-tags', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
