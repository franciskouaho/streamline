import { Project, ProjectStats } from '@/types/project';
import { Task } from '@/types/task';

/**
 * Calcule les statistiques des projets à partir d'une liste de projets
 */
export const calculateProjectStats = (projects: Project[]): ProjectStats => {
  if (!projects || !projects.length) {
    return { ongoing: 0, inProgress: 0, completed: 0, canceled: 0, total: 0 };
  }

  return projects.reduce((stats, project) => {
    switch (project.status.toLowerCase()) {
      case 'ongoing':
        stats.ongoing += 1;
        break;
      case 'in_progress':
        stats.inProgress += 1;
        break;
      case 'completed':
        stats.completed += 1;
        break;
      case 'canceled':
        stats.canceled += 1;
        break;
    }
    stats.total += 1;
    return stats;
  }, { ongoing: 0, inProgress: 0, completed: 0, canceled: 0, total: 0 });
};

/**
 * Calcule les statistiques des tâches à partir d'une liste de tâches
 */
export const calculateTaskStats = (tasks: Task[]) => {
  if (!tasks || !tasks.length) {
    return { todo: 0, inProgress: 0, done: 0, total: 0 };
  }

  return tasks.reduce((stats, task) => {
    switch (task.status.toLowerCase()) {
      case 'todo':
        stats.todo += 1;
        break;
      case 'in_progress':
        stats.inProgress += 1;
        break;
      case 'done':
        stats.done += 1;
        break;
    }
    stats.total += 1;
    return stats;
  }, { todo: 0, inProgress: 0, done: 0, total: 0 });
};

/**
 * Calcule le pourcentage de progression d'un projet
 */
export const calculateProjectProgress = (project: Project): number => {
  if (!project.tasks || project.tasks.length === 0) return 0;
  
  const completedTasks = project.tasks.filter(task => 
    task.status.toLowerCase() === 'done' || task.status.toLowerCase() === 'completed'
  ).length;
  
  return Math.round((completedTasks / project.tasks.length) * 100);
};

/**
 * Formate la date d'échéance pour l'affichage
 */
export const formatDueDate = (dateString: string): string => {
  if (!dateString) return 'Non définie';
  
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return 'Date invalide';
  }
};

/**
 * Normalise une date en format YYYY-MM-DD
 */
export const normalizeDate = (date: string | Date | null | undefined): string | null => {
  if (!date) return null;
  
  try {
    if (typeof date === 'string') {
      // Si c'est déjà au format YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      
      return new Date(date).toISOString().split('T')[0];
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Erreur lors de la normalisation de la date:", error);
    return null;
  }
};

/**
 * Vérifie si deux dates sont le même jour
 */
export const isSameDay = (date1: string | Date | null | undefined, date2: string | Date | null | undefined): boolean => {
  if (!date1 || !date2) return false;
  
  const normalizedDate1 = normalizeDate(date1);
  const normalizedDate2 = normalizeDate(date2);
  
  return normalizedDate1 === normalizedDate2;
};

/**
 * Récupère les initiales d'un nom complet
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

/**
 * Récupère une couleur en fonction du statut
 */
export const getStatusColor = (status: string): string => {
  const colors = {
    todo: '#ffb443',
    in_progress: '#4d8efc',
    ongoing: '#4d8efc',
    active: '#43d2c3',      // Ajout de la couleur pour "active"
    done: '#43d2c3',
    completed: '#43d2c3',
    canceled: '#ff3b30',
    archived: '#888888'
  };
  
  return colors[status.toLowerCase()] || '#666';
};
