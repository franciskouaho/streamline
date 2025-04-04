/**
 * Constantes de couleurs pour les statuts dans l'application
 */

export const STATUS_COLORS = {
  // Statuts de projets
  ONGOING: "#4d8efc",    // Bleu - En cours
  IN_PROGRESS: "#ffb443", // Orange - En progression
  COMPLETED: "#43d2c3",  // Vert - Terminé
  CANCELED: "#ff7a5c",   // Rouge/orange - Annulé
  
  // Statuts de tâches
  TODO: "#ffb443",       // Orange - À faire
  DONE: "#43d2c3",       // Vert - Terminé
  
  // Priorités de tâches
  LOW: "#43d2c3",        // Vert - Faible
  MEDIUM: "#ffb443",     // Orange - Moyenne
  HIGH: "#ff3b30",       // Rouge - Haute
  
  // Couleur par défaut
  DEFAULT: "#666666"     // Gris
};

/**
 * Couleurs pour les graphiques
 */
export const CHART_COLORS = {
  ONGOING: STATUS_COLORS.ONGOING,
  IN_PROGRESS: STATUS_COLORS.IN_PROGRESS,
  COMPLETED: STATUS_COLORS.COMPLETED,
  CANCELED: STATUS_COLORS.CANCELED,
  PRIMARY: "#ff7a5c",
  SECONDARY: "#4d8efc",
  ACCENT: "#43d2c3",
  WARNING: "#ffb443",
  ERROR: "#ff3b30",
  BACKGROUND: "#ffffff",
  TEXT: "#000000",
  LIGHT_TEXT: "#666666",
};
