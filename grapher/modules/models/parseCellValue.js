/**
 * Convertit une valeur de cellule ou de point de mesure en nombre ou null.
 * Gère les nombres existants, les virgules décimales (format FR), les espaces,
 * les notations scientifiques, ainsi que les chaînes vides et valeurs invalides.
 * @param {*} value - La valeur à parser.
 * @returns {number|null} Le nombre fini ou null si vide ou invalide.
 */
export function parseCellValue(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/\s+/g, '').replace(',', '.');
    if (cleaned === '') {
      return null;
    }
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}
