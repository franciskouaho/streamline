import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Task, SubTask } from '@/types/task';
import api from '@/services/api';
import { normalizeTaskStatus } from '@/utils/projectUtils'; // Importer la fonction de normalisation

// Récupérer toutes les tâches
export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      try {
        const response = await api.get('/tasks');
        console.log("Tâches récupérées:", response.data.length);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches:", error);
        return [];
      }
    }
  });
};

// Récupérer les tâches d'un projet spécifique
export const useProjectTasks = (projectId: string | number) => {
  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: async (): Promise<Task[]> => {
      const response = await api.get(`/tasks?projectId=${projectId}`);
      return response.data;
    },
    enabled: !!projectId
  });
};

// Récupérer une tâche spécifique par ID
export const useTask = (id: string | number) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async (): Promise<Task> => {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

// Récupérer les tâches pour une date spécifique
export const useTasksByDate = (date: Date | null) => {
  // Convertir la date en format YYYY-MM-DD
  const formattedDate = date ? date.toISOString().split('T')[0] : null;
  
  return useQuery({
    queryKey: ['tasks', 'date', formattedDate],
    queryFn: async (): Promise<Task[]> => {
      try {
        console.log(`Récupération des tâches pour la date: ${formattedDate}`);
        
        // Si votre API ne prend pas en charge le filtrage par date, vous pouvez récupérer toutes les tâches
        // et les filtrer côté client
        const response = await api.get('/tasks');
        
        if (formattedDate) {
          // Filtrer les tâches pour la date spécifiée
          const tasksForDate = response.data.filter((task: Task) => {
            if (!task.dueDate && !task.date) return false;
            
            const taskDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null;
            const taskDate = task.date ? new Date(task.date).toISOString().split('T')[0] : null;
            
            return taskDueDate === formattedDate || taskDate === formattedDate;
          });
          
          console.log(`Tâches filtrées pour ${formattedDate}:`, tasksForDate.length);
          return tasksForDate;
        }
        
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches par date:", error);
        return [];
      }
    },
    enabled: !!formattedDate
  });
};

// Créer une nouvelle tâche
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      try {
        // Vérifier si projectId est défini et n'est pas 'undefined' ou 'null' en tant que chaîne
        if (taskData.projectId !== undefined && 
            taskData.projectId !== null && 
            taskData.projectId !== 'undefined' && 
            taskData.projectId !== 'null') {
          try {
            // Vérifier si le projet existe
            await api.get(`/projects/${taskData.projectId}`);
          } catch (error) {
            if (error.response && error.response.status === 404) {
              // Si le projet n'existe pas, on supprime le projectId pour éviter l'erreur de clé étrangère
              console.warn(`Le projet avec l'ID ${taskData.projectId} n'existe pas. Création d'une tâche sans projet.`);
              delete taskData.projectId;
            }
          }
        } else {
          // Si projectId est undefined, null ou une chaîne invalide, le supprimer
          delete taskData.projectId;
        }
        
        const response = await api.post('/tasks', taskData);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la création de la tâche:", error.response?.data || error.message);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'project', data.projectId] });
      }
    }
  });
};

// Mettre à jour une tâche
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: TaskStatusUpdateInput) => {
      const response = await api.put(`/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalider les requêtes de tâches
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', data.id] });
      
      if (data.projectId) {
        // Invalider les tâches du projet
        queryClient.invalidateQueries({ queryKey: ['tasks', 'project', data.projectId] });
        
        // Invalider le projet lui-même et la liste des projets
        // pour déclencher la mise à jour automatique du statut
        queryClient.invalidateQueries({ queryKey: ['projects', data.projectId] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      }
    }
  });
};

// Supprimer une tâche
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number | string) => {
      await api.delete(`/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
};

// Ajouter une sous-tâche
export const useAddSubTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subtaskData: Partial<SubTask>) => {
      const response = await api.post('/subtasks', subtaskData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.taskId] });
    }
  });
};

// Mettre à jour une sous-tâche
export const useUpdateSubTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<SubTask>) => {
      const response = await api.put(`/subtasks/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.taskId] });
    }
  });
};

// Calculer les statistiques des tâches
export const calculateTaskStats = (tasks: Task[]) => {
  if (!tasks || !Array.isArray(tasks)) {
    return { todo: 0, inProgress: 0, done: 0, total: 0 };
  }

  return tasks.reduce((stats, task) => {
    // Utiliser la fonction centralisée pour normaliser le statut
    const normalizedStatus = normalizeTaskStatus(task.status);
    
    if (normalizedStatus === 'done') {
      stats.done += 1;
    } else if (normalizedStatus === 'in_progress') {
      stats.inProgress += 1;
    } else {
      stats.todo += 1;
    }
    
    stats.total += 1;
    return stats;
  }, { todo: 0, inProgress: 0, done: 0, total: 0 });
};
