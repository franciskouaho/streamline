/**
 * Constantes de couleurs pour les statuts dans l'application
 */

export const STATUS_COLORS = {
  COMPLETED: '#43d2c3',  // Vert clair
  IN_PROGRESS: '#4d8efc', // Bleu
  ONGOING: '#4d8efc',    // Bleu (même que IN_PROGRESS pour cohérence)
  CANCELED: '#ff3b30',   // Rouge
  TODO: '#ffb443',       // Orange
  DONE: '#43d2c3',       // Vert clair (même que COMPLETED)
  DEFAULT: '#cccccc'     // Gris
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
