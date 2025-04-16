import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Tag } from '@/types/tag';

export const useCreateProjectTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { projectId: string | number; tag: Partial<Tag> }) => {
      const response = await api.post(`/projects/${data.projectId}/tags`, data.tag);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'tags'] });
    },
  });
};

export const useDeleteProjectTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, tagId }: { projectId: string | number; tagId: number }) => {
      await api.delete(`/projects/${projectId}/tags/${tagId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'tags'] });
    },
  });
};
