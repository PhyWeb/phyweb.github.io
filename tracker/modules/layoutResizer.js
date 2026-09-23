/**
 * Gestion du redimensionnement de l'interface de Tracker :
 * - Panneau latéral droit (#right-column)
 * - Séparateur déplaçable (.handler)
 * - Adaptation du lecteur vidéo (player.resize())
 */

/**
 * Calcule la largeur du panneau latéral lors du glissement du séparateur (.handler).
 * Borne la largeur entre minColumnWidth (285px par défaut) et (wrapperWidth - minLeftWidth),
 * garantissant que la zone vidéo conserve une largeur minimale d'au moins minLeftWidth (520px par défaut).
 *
 * @param {number} wrapperWidth - Largeur offsetWidth de #handler-wrapper
 * @param {number} clientX - Position horizontale du pointeur (e.clientX)
 * @param {number} [handleOffset=26] - Décalage du curseur par rapport au séparateur
 * @param {number} [minColumnWidth=285] - Largeur minimale du panneau latéral
 * @param {number} [minLeftWidth=520] - Largeur minimale réservée à la vidéo
 * @returns {string} Largeur CSS calculée avec unité 'px' (ex: "320px")
 */
export function computeColumnWidth(
  wrapperWidth,
  clientX,
  handleOffset = 26,
  minColumnWidth = 285,
  minLeftWidth = 520
) {
  const safeWrapperWidth = typeof wrapperWidth === 'number' && Number.isFinite(wrapperWidth) ? wrapperWidth : 0;
  const safeClientX = typeof clientX === 'number' && Number.isFinite(clientX) ? clientX : 0;
  
  const rawTargetWidth = safeWrapperWidth - safeClientX - handleOffset;
  const maxAllowedWidth = Math.max(minColumnWidth, safeWrapperWidth - minLeftWidth);
  const clampedWidth = Math.min(maxAllowedWidth, Math.max(minColumnWidth, rawTargetWidth));
  return `${clampedWidth}px`;
}

/**
 * Applique la largeur au panneau latéral droit et déclenche le redimensionnement du lecteur.
 * Protège contre l'écrasement accidentel du style CSS lorsque la fonction est invoquée
 * en tant que gestionnaire d'événement (reçoit un objet Event / UIEvent au lieu d'une taille).
 *
 * @param {HTMLElement|{children: Array<{style: Object}>}} rightColumnEl - Conteneur #right-column
 * @param {string|number|Event|UIEvent} [column2Size="285px"] - Nouvelle largeur ou valeur par défaut
 * @param {{resize: Function}|null} [player=null] - Instance du lecteur vidéo
 */
export function applyResize(rightColumnEl, column2Size = "285px", player = null) {
  // Si column2Size est un nombre pur, on lui accole 'px'
  if (typeof column2Size === "number" && Number.isFinite(column2Size)) {
    column2Size = `${column2Size}px`;
  }

  // Ne définir style.width que si column2Size est une chaîne CSS valide (pas un objet Event/UIEvent)
  const isValidWidth = typeof column2Size === "string" &&
    column2Size.trim().length > 0 &&
    !column2Size.startsWith("[object");

  if (isValidWidth && rightColumnEl && rightColumnEl.children && rightColumnEl.children[0]) {
    rightColumnEl.children[0].style.width = column2Size;
    rightColumnEl.children[0].style.flexGrow = 0;
  }

  if (player && typeof player.resize === "function") {
    player.resize();
  }
}
