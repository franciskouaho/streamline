/**
 * Format a date according to the specified locale and options
 * @param date Date to format (Date object or ISO string)
 * @param locale Locale to use for formatting (defaults to 'fr-FR')
 * @param options Additional formatting options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | null | undefined,
  locale: string = 'fr-FR',
  options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  }
): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn(`Invalid date: ${date}`);
    return '';
  }
  
  return dateObj.toLocaleDateString(locale, options);
};

/**
 * Format a date showing only month and year
 * @param date Date to format
 * @param locale Locale to use
 * @returns Formatted date string with month and year
 */
export const formatMonthYear = (
  date: Date | string | null | undefined,
  locale: string = 'fr-FR'
): string => {
  return formatDate(date, locale, { month: 'long', year: 'numeric' });
};

/**
 * Format a date for displaying in a calendar
 * @param date Date to format
 * @param locale Locale to use
 * @returns Formatted date string for calendar
 */
export const formatCalendarDate = (
  date: Date | string | null | undefined,
  locale: string = 'fr-FR'
): string => {
  return formatDate(date, locale, { weekday: 'short', day: 'numeric', month: 'short' });
};

/**
 * Format a date with time
 * @param date Date to format
 * @param locale Locale to use
 * @returns Formatted date string with time
 */
export const formatDateTime = (
  date: Date | string | null | undefined,
  locale: string = 'fr-FR'
): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn(`Invalid date: ${date}`);
    return '';
  }
  
  return dateObj.toLocaleDateString(locale, { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a deadline for display
 * This is useful for project deadlines, task due dates, etc.
 * @param dateString ISO date string to format
 * @param locale Locale to use
 * @returns Formatted deadline string
 */
export const formatDeadline = (
  dateString: string | null | undefined,
  locale: string = 'fr-FR'
): string => {
  if (!dateString) return '';
  return formatDate(dateString, locale);
};

/**
 * Normalise une date en format YYYY-MM-DD
 * @param date Date à normaliser
 * @returns Date normalisée au format YYYY-MM-DD ou null si invalide
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
 * @param date1 Première date
 * @param date2 Deuxième date
 * @returns true si les dates représentent le même jour
 */
export const isSameDay = (date1: string | Date | null | undefined, date2: string | Date | null | undefined): boolean => {
  if (!date1 || !date2) return false;
  
  const normalizedDate1 = normalizeDate(date1);
  const normalizedDate2 = normalizeDate(date2);
  
  return normalizedDate1 === normalizedDate2;
};
