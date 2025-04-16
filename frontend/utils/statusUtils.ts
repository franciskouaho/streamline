import { STATUS_COLORS } from '@/constants/StatusColors';

/**
 * Obtient la couleur correspondante pour un statut donné
 * @param status Chaîne du statut
 * @returns Code couleur hexadécimal
 */
export const getStatusColor = (status: string): string => {
  status = String(status).toLowerCase();
  
  switch (status) {
    case 'completed':
    case 'terminé':
    case 'done':
      return STATUS_COLORS.COMPLETED;
    case 'in_progress':
    case 'en progression':
    case 'in progress':
      return STATUS_COLORS.IN_PROGRESS;
    case 'ongoing':
    case 'en cours':
      return STATUS_COLORS.ONGOING;
    case 'canceled':
    case 'cancelled':
    case 'annulé':
      return STATUS_COLORS.CANCELED;
    case 'todo':
    case 'à faire':
      return STATUS_COLORS.TODO;
    default:
      return STATUS_COLORS.DEFAULT;
  }
};

/**
 * Convertit une chaîne de statut en libellé lisible
 * @param status Chaîne du statut
 * @returns Libellé de statut formaté
 */
export const getStatusLabel = (status: string, translations?: any): string => {
  status = String(status).toLowerCase();
  
  // Si des traductions sont fournies, essayer de les utiliser
  if (translations?.projects?.status && translations.projects.status[status]) {
    return translations.projects.status[status];
  }
  
  // Libellés par défaut
  switch (status) {
    case 'completed':
    case 'done':
      return 'Terminé';
    case 'in_progress':
      return 'En progression';
    case 'ongoing':
      return 'En cours';
    case 'canceled':
    case 'cancelled':
      return 'Annulé';
    case 'todo':
      return 'À faire';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Obtient la traduction d'un statut à partir d'un objet de traductions
 * @param status Statut à traduire
 * @param translations Objet de traductions
 * @returns Traduction du statut ou le statut lui-même si non trouvé
 */
export const getStatusTranslation = (status: string, translations?: any): string => {
  if (!status) return '';
  
  status = String(status).toLowerCase();
  
  // Essayer d'abord avec la structure projects.status
  if (translations?.projects?.status && translations.projects.status[status]) {
    return translations.projects.status[status];
  }
  
  // Essayer ensuite avec la structure tasks si c'est un statut de tâche
  if (translations?.tasks && translations.tasks[status]) {
    return translations.tasks[status];
  }
  
  // Si aucune traduction n'est trouvée, utiliser des valeurs par défaut
  switch (status) {
    case 'completed':
      return 'Terminé';
    case 'in_progress':
      return 'En progression';
    case 'ongoing':
      return 'En cours';
    case 'canceled':
    case 'cancelled':
      return 'Annulé';
    case 'todo':
      return 'À faire';
    case 'done':
      return 'Terminé';
    default:
      // Retourner le statut formaté si aucune traduction n'est disponible
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Formate un pourcentage pour l'affichage
 * @param value Valeur du pourcentage
 * @returns Chaîne de pourcentage formatée
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};
