export const DEFAULT_SETTINGS = {
  significantDigits: 3,
  grapherGrid: true,
  includeOriginOnAutoZoom: true,
  derivatePoints: 5,
  derivateEdges: false,
};

/**
 * Charge les paramètres depuis le localStorage et les fusionne avec les défauts.
 * @returns {object} Les paramètres complets de l'application.
 */
export function loadSettings() {
  try {
    const storedSettings = JSON.parse(localStorage.getItem('phyweb-settings'));
    // Fusionne les paramètres par défaut avec ceux stockés pour éviter les erreurs si de nouveaux paramètres sont ajoutés au code.
    return { ...DEFAULT_SETTINGS, ...storedSettings };
  } catch (e) {
    console.error("Impossible de charger les paramètres, utilisation des défauts.", e);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Sauvegarde un objet de paramètres dans le localStorage.
 * @param {object} settings - L'objet de paramètres à sauvegarder.
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem('phyweb-settings', JSON.stringify(settings));
  } catch (e) {
    console.error("Impossible de sauvegarder les paramètres.", e);
  }
}

/**
 * Supprime les paramètres sauvegardés du localStorage.
 */
export function clearSavedSettings() {
    localStorage.removeItem('phyweb-settings');
}