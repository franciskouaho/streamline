import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import type { TaskData } from '@/types/task';

export function useTasks(projectId?: string | number) {
  return useQuery({
    queryKey: ['tasks', { projectId }],
    queryFn: async () => {
      const { data } = await api.get<TaskData[]>('/tasks', {
        params: { projectId },
      });
      return data;
    },
  });
}

export function useTask(id: string | number) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const { data } = await api.get<TaskData>(`/tasks/${id}`);
      return data;
    },
  });
}

interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  assigneeId?: number;
  projectId?: number;
  status?: string;
  priority?: string;
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskData) => {
      try {
        console.log('Creating task with data:', data);
        // S'assurer que projectId est défini
        const taskData = {
          ...data,
          projectId: data.projectId || 1, // Forcer une valeur par défaut
          status: data.status || 'todo',
          priority: data.priority || 'medium',
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        };
        
        console.log('Formatted task data:', taskData);
        const response = await api.post('/tasks', taskData);
        return response.data;
      } catch (error) {
        console.error('Task creation error:', {
          error,
          request: error.config,
          response: error.response?.data
        });
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Task created successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Task creation mutation error:', error);
    }
  });
}

export function useUpdateTask(id: string | number) {
  return useMutation({
    mutationFn: async (updatedTask: Partial<TaskData>) => {
      const { data } = await api.put<TaskData>(`/tasks/${id}`, updatedTask);
      return data;
    },
  });
}

export function useDeleteTask() {
  return useMutation({
    mutationFn: async (id: string | number) => {
      await api.delete(`/tasks/${id}`);
      return id;
    },
  });
}
