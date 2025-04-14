import { Project, ProjectStats } from '@/types/project';
import { Task } from '@/types/task';
import { STATUS_COLORS } from '@/constants/StatusColors';

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
  if (!status) return type === 'project' ? 'ongoing' : 'todo';
  
  const normalized = status.toLowerCase().trim();
  
  // Statuts communs
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
  const lowerStatus = status?.toLowerCase();
  
  // Map des statuts possibles vers leur version normalisée
  const statusMap: { [key: string]: string } = {
    'active': 'ongoing',
    'en cours': 'ongoing',
    'ongoing': 'ongoing',
    'in progress': 'in_progress',
    'in_progress': 'in_progress',
    'en progression': 'in_progress',
    'completed': 'completed',
    'terminé': 'completed',
    'done': 'completed',
    'canceled': 'canceled',
    'annulé': 'canceled',
    'cancelled': 'canceled'
  };
  
  return statusMap[lowerStatus] || 'ongoing';
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
export function getProjectStatusLabel(status: string, translations?: any): string {
  const statusKey = normalizeProjectStatus(status);
  
  if (translations && translations.projects && translations.projects.status) {
    return translations.projects.status[statusKey] || statusKey;
  }
  
  // Fallback sans traductions
  switch (statusKey) {
    case 'ongoing':
      return 'En cours';
    case 'in_progress':
      return 'En progression';
    case 'completed':
      return 'Terminé';
    case 'canceled':
      return 'Annulé';
    case 'active':
      return 'Actif';
    default:
      return status;
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
export const getStatusColor = (status: string, type: 'project' | 'task' = 'project'): string => {
  const normalized = normalizeStatus(status, type);
  
  // Retourne les couleurs selon le statut normalisé
  switch (normalized) {
    case 'completed':
    case 'done':
      return STATUS_COLORS.COMPLETED;
    case 'in_progress':
      return STATUS_COLORS.IN_PROGRESS;
    case 'ongoing':
      return STATUS_COLORS.ONGOING;
    case 'canceled':
      return STATUS_COLORS.CANCELED;
    case 'todo':
      return STATUS_COLORS.TODO;
    default:
      return STATUS_COLORS.DEFAULT;
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
 * UTILITAIRES DE DATE
 */

/**
 * Formate la date d'échéance pour l'affichage
 */
export const formatDueDate = (dateString: string, translations?: any): string => {
  if (!dateString) {
    return translations?.utils?.project?.deadlineNotDefined || 'Non définie';
  }
  
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return translations?.utils?.project?.dates?.invalidDate || 'Date invalide';
  }
};

/**
 * Formatte une date d'échéance pour l'affichage
 * @param date Date à formater
 * @returns Date formatée
 */
export const formatDeadline = (date: string | Date): string => {
  if (!date) return 'Non définie';
  
  try {
    const deadlineDate = typeof date === 'string' ? new Date(date) : date;
    return deadlineDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
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
