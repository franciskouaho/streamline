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
        const taskData = {
          title: data.title,
          description: data.description,
          projectId: data.projectId,
          status: data.status || 'todo',
          priority: data.priority || 'medium',
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
          assigneeId: data.assigneeId || null
        };
        
        console.log('Sending task data:', taskData);
        const response = await api.post('/tasks', taskData);
        return response.data;
      } catch (error) {
        console.error('Task creation error:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', { projectId: variables.projectId }] });
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: number | string } & Partial<TaskData>) => {
      const { id, ...updates } = data;
      const response = await api.put<TaskData>(`/tasks/${id}`, updates);
      return response.data;
    },
    onSuccess: (_, variables) => {
      const { id } = variables;
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      await api.delete(`/tasks/${id}`);
      return id;
    },
    onSuccess: (_, taskId) => {
      // Invalider toutes les requêtes liées aux tâches
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      
      // Si l'ID du projet est dans le cache, invalider les tâches liées à ce projet
      const projectsWithTasks = queryClient.getQueriesData({ queryKey: ['tasks'] });
      for (const [queryKey] of projectsWithTasks) {
        if (Array.isArray(queryKey) && queryKey.length > 1) {
          queryClient.invalidateQueries({ queryKey });
        }
      }
    },
  });
}

export function useProjectTasks(projectId: string | number) {
  return useQuery({
    queryKey: ['tasks', { projectId }],
    queryFn: async () => {
      const { data } = await api.get<TaskData[]>('/tasks', {
        params: { projectId },
      });
      console.log('Project tasks:', data);
      return data;
    },
    enabled: !!projectId,
  });
}

export function useCreateProjectTask(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<TaskData>) => {
      const taskData = {
        ...data,
        projectId,
      };
      const response = await api.post('/tasks', taskData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { projectId }] });
    },
  });
}
