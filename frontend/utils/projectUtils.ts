import { Project, ProjectStats } from '@/types/project';
import { Task } from '@/types/task';
import { STATUS_COLORS } from '@/constants/StatusColors';
import { formatDate } from './dateUtils';

/**
 * GESTION DES STATUTS - NORMALISATION ET LABELS
 */

/**
 * Normalise un statut pour traitement uniforme
 * @param status Le statut à normaliser
 * @param type Le type d'objet ('project' ou 'task')
 * @returns Le statut normalisé
 */
export const normalizeStatus = (status: string, type: 'project' | 'task' = 'project'): string => {
  const normalized = status?.toLowerCase().trim() || '';
  
  if (['completed', 'terminé', 'termine', 'done', 'terminés', 'terminée'].includes(normalized)) {
    return type === 'project' ? 'completed' : 'done';
  } else if (['ongoing', 'en cours', 'in_progress', 'in progress', 'progression'].includes(normalized)) {
    return type === 'project' ? (normalized === 'in_progress' || normalized === 'in progress' || normalized === 'progression' ? 'in_progress' : 'ongoing') : 'in_progress';
  }
  
  // Statuts spécifiques aux projets
  if (type === 'project' && ['canceled', 'cancelled', 'annulé', 'annule', 'annulés'].includes(normalized)) {
    return 'canceled';
  }
  
  // Statuts spécifiques aux tâches
  if (type === 'task' && ['todo', 'à faire', 'a faire', 'pending'].includes(normalized)) {
    return 'todo';
  }
  
  // Valeurs par défaut
  return type === 'project' ? 'ongoing' : 'todo';
};

// Fonctions d'aide qui utilisent la fonction centrale normalizeStatus
export const normalizeProjectStatus = (status: string): string => {
  if (!status) return 'pending';
  const normalized = status.toLowerCase().trim();
  
  switch (normalized) {
    case 'done':
    case 'terminé':
    case 'completed':
      return 'completed';
    case 'in progress':
    case 'in_progress':
    case 'en cours':
      return 'in_progress';
    case 'ongoing':
    case 'en progression':
      return 'ongoing';
    case 'canceled':
    case 'annulé':
      return 'canceled';
    default:
      return 'pending';
  }
};

export const normalizeTaskStatus = (status: string): string => {
  const lowerStatus = status?.toLowerCase();
  
  if (lowerStatus === 'done' || lowerStatus === 'completed' || lowerStatus === 'terminé') {
    return 'done';
  } else if (lowerStatus === 'in_progress' || lowerStatus === 'in progress' || lowerStatus === 'en cours') {
    return 'in_progress';
  } else {
    return 'todo';
  }
};

/**
 * Obtient un libellé convivial pour un statut
 * @param status Le statut à traduire en libellé
 * @param type Le type d'objet ('project' ou 'task')
 * @returns Le libellé du statut
 */
export const getStatusLabel = (status: string, type: 'project' | 'task' = 'project'): string => {
  const normalized = normalizeStatus(status, type);
  
  const labels = {
    project: {
      'ongoing': 'En cours',
      'in_progress': 'En progression',
      'completed': 'Terminé',
      'canceled': 'Annulé'
    },
    task: {
      'todo': 'À faire',
      'in_progress': 'En cours',
      'done': 'Terminé'
    }
  };
  
  return labels[type][normalized] || (type === 'project' ? 'En cours' : 'À faire');
};

// Fonction d'aide qui utilise la fonction centrale getStatusLabel
export function getProjectStatusLabel(status: string): string {
  const normalized = normalizeProjectStatus(status);
  switch (normalized) {
    case 'completed':
      return 'Terminé';
    case 'in_progress':
      return 'En cours';
    case 'ongoing':
      return 'En progression';
    case 'canceled':
      return 'Annulé';
    default:
      return 'En attente';
  }
}

export const getTaskStatusLabel = (status: string, translations?: any): string => {
  const normalizedStatus = normalizeTaskStatus(status);
  
  if (translations && translations.tasks) {
    return translations.tasks[normalizedStatus] || normalizedStatus;
  }
  
  // Fallback pour les tâches
  switch (normalizedStatus) {
    case 'todo':
      return 'À faire';
    case 'done':
      return 'Terminée';
    case 'ongoing':
      return 'En cours';
    case 'in_progress':
      return 'En traitement';
    case 'completed':
      return 'Terminée';
    default:
      return status;
  }
};

/**
 * Récupère une couleur en fonction du statut
 * @param status Le statut à coloriser
 * @param type Le type d'objet ('project' ou 'task')
 * @returns La couleur correspondante au statut
 */
export const getStatusColor = (status: string): string => {
  const normalizedStatus = normalizeProjectStatus(status);
  switch (normalizedStatus) {
    case 'completed':
      return '#43d2c3';
    case 'in_progress':
      return '#ffb443';
    case 'ongoing':
      return '#4d8efc';
    case 'canceled':
      return '#ff3b30';
    default:
      return '#888';
  }
};

/**
 * ANALYSE ET STATISTIQUES DES PROJETS
 */

/**
 * Calcule les statistiques des projets à partir d'une liste de projets
 */
export const calculateProjectStats = (projects: Project[]): ProjectStats => {
  if (!projects || projects.length === 0) {
    return {
      total: 0,
      ongoing: 0,
      inProgress: 0,
      completed: 0,
      canceled: 0
    };
  }

  const stats = {
    total: projects.length,
    ongoing: 0,
    inProgress: 0,
    completed: 0,
    canceled: 0
  };

  projects.forEach(project => {
    const normalizedStatus = normalizeProjectStatus(project.status);
    
    if (normalizedStatus === 'completed') {
      stats.completed += 1;
    } else if (normalizedStatus === 'ongoing') {
      stats.ongoing += 1;
    } else if (normalizedStatus === 'in_progress') {
      stats.inProgress += 1;
    } else if (normalizedStatus === 'canceled') {
      stats.canceled += 1;
    } else {
      // Statut non reconnu, ajouter aux "en cours" par défaut
      stats.ongoing += 1;
      console.log('Statut non reconnu:', project.status, '- assigné à "ongoing"');
    }
  });

  return stats;
};

/**
 * Calcule les statistiques des tâches d'un projet
 * @param tasks Tableau des tâches du projet
 * @returns Statistiques (todo, inProgress, done, total)
 */
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

/**
 * Calcule le pourcentage de progression d'un projet
 * @param project Le projet ou ses statistiques
 * @returns Pourcentage de complétion (0-100)
 */
export const calculateProgress = (project: Project | ProjectStats): number => {
  // Si nous avons un projet complet, on peut calculer à partir des tâches
  if ('tasks' in project && project.tasks && project.tasks.length > 0) {
    const stats = calculateTaskStats(project.tasks);
    return stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  }
  
  // Si nous avons seulement les stats
  if ('totalTasks' in project && project.totalTasks > 0) {
    return Math.round((project.completedTasks / project.totalTasks) * 100);
  }
  
  return 0;
};

/**
 * Calcule le pourcentage de progression d'un projet et son statut recommandé
 */
export const calculateProjectProgress = (project: Project): { progress: number; recommendedStatus?: string } => {
  if (!project.tasks || project.tasks.length === 0) return { progress: 0 };
  
  const completedTasks = project.tasks.filter(task => 
    normalizeTaskStatus(task.status) === 'done'
  ).length;
  
  const progress = Math.round((completedTasks / project.tasks.length) * 100);
  
  // Déterminer le statut recommandé en fonction de la progression
  let recommendedStatus;
  if (progress === 100) {
    recommendedStatus = 'completed';
  } else if (progress >= 70) {
    recommendedStatus = 'in_progress';
  } else if (progress > 0) {
    recommendedStatus = 'ongoing';
  } else {
    recommendedStatus = 'ongoing';
  }
  
  return { progress, recommendedStatus };
};

/**
 * Détermine si le statut d'un projet doit être mis à jour automatiquement
 */
export const shouldUpdateProjectStatus = (project: Project, tasks: Task[]): { 
  shouldUpdate: boolean; 
  newStatus?: string; 
  progress: number 
} => {
  // Si le projet est annulé, on ne le met pas à jour automatiquement
  if (normalizeProjectStatus(project.status) === 'canceled') {
    return { shouldUpdate: false, progress: 0 };
  }
  
  // Calculer la progression
  const stats = calculateTaskStats(tasks);
  const progress = calculateProgress({ tasks });
  const currentStatus = normalizeProjectStatus(project.status);
  
  // Déterminer le nouveau statut en fonction des statistiques
  let newStatus = currentStatus;
  
  // Si toutes les tâches sont terminées, le projet doit être marqué comme terminé
  if (stats.done === stats.total && stats.total > 0) {
    newStatus = 'completed';
  } 
  // Si le projet est marqué comme terminé mais qu'il reste des tâches non terminées
  else if (currentStatus === 'completed' && stats.done < stats.total) {
    newStatus = 'in_progress';
  }
  // Si aucune tâche n'est commencée, statut "ongoing"
  else if (stats.inProgress === 0 && stats.done === 0) {
    newStatus = 'ongoing';
  }
  // Si des tâches sont en cours, statut "in_progress"
  else if (stats.inProgress > 0 || (stats.done > 0 && stats.done < stats.total)) {
    newStatus = 'in_progress';
  }
  
  // Ne mettre à jour que si le statut a changé
  return { 
    shouldUpdate: newStatus !== currentStatus, 
    newStatus, 
    progress 
  };
};

/**
 * AUTRES UTILITAIRES
 */

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
 * Formate une date d'échéance
 */
export const formatDueDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'Non définie';
  return formatDate(date, 'fr-FR', { 
    day: 'numeric',
    month: 'short'
  });
};

/**
 * Traduction des statuts des projets
 */
export const getProjectStatusTranslation = (status: string, translations: any): string => {
  try {
    const statusMap: { [key: string]: string } = {
      'active': translations?.projects?.status?.active || 'Actif',
      'in_progress': translations?.projects?.status?.in_progress || 'En progression',
      'completed': translations?.projects?.status?.completed || 'Terminé',
      'canceled': translations?.projects?.status?.canceled || 'Annulé',
      'ongoing': translations?.projects?.status?.ongoing || 'En cours'
    };
    return statusMap[status] || status;
  } catch (error) {
    console.warn('Error getting status translation:', error);
    return status;
  }
};
