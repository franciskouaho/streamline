import fr from './fr';
import en from './en';

const translations = {
  fr,
  en
};

// Type simple pour déterminer la langue actuelle
let currentLanguage: 'fr' | 'en' = 'fr';

// Fonction pour changer la langue
export const setLanguage = (lang: 'fr' | 'en') => {
  currentLanguage = lang;
};

// Fonction pour obtenir une traduction
export const t = (key: string): string => {
  // On sépare la clé par des points pour naviguer dans l'objet de traduction
  const keys = key.split('.');
  let result = translations[currentLanguage];
  
  // Parcourir l'objet de traduction selon les clés
  for (const k of keys) {
    if (result && result[k]) {
      result = result[k];
    } else {
      // Clé non trouvée, retourner la clé elle-même
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  return typeof result === 'string' ? result : key;
};

export default {
  t,
  setLanguage,
  getCurrentLanguage: () => currentLanguage
};
