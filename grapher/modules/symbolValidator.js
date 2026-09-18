/**
 * Gère la validation des symboles (noms de grandeurs et de paramètres).
 */
export default class SymbolValidator {
  /**
   * Ensemble des mots réservés (fonctions, constantes mathématiques et mots-clés)
   * incompatibles avec un nom de grandeur ou de paramètre dans math.js.
   */
  static RESERVED_SYMBOLS = new Set([
    // Constantes mathématiques et mots-clés
    'e', 'pi',
    'infinity', 'nan',
    'true', 'false', 'null', 'undefined',

    // Fonctions scalaires supportées par PhyWeb (Calculation.js)
    'sqrt', 'cbrt', 'abs', 'exp', 'log', 'ln',
    'round', 'floor', 'ceil', 'fix', 'sign',
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'sec', 'csc', 'cot', 'asec', 'acsc', 'acot',
    'sech', 'csch', 'coth', 'asech', 'acsch', 'acoth',

    // Fonction personnalisée de dérivation
    'diff',

    // Autres fonctions et opérateurs math.js
    'log10', 'log2', 'pow', 'mod',
    'min', 'max', 'sum', 'mean', 'median', 'std', 'variance',
    'and', 'or', 'not', 'xor'
  ]);

  /**
   * @param {object} data - L'instance de la classe Data pour accéder aux courbes et paramètres.
   */
  constructor(data = { curves: [], parameters: {} }) {
    this.data = data || { curves: [], parameters: {} };
    // La regex unifiée : doit commencer par une lettre et ne contenir que des lettres (éventuellement accentuées) et des chiffres (aucun underscore ni caractère spécial).
    // Note: la plage À-ÖØ-öø-ÿ remplace À-ÿ afin d'exclure les opérateurs arithmétiques \u00D7 (×) et \u00F7 (÷).
    this.validSymbolRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-Z0-9À-ÖØ-öø-ÿ]*$/;
  }

  /**
   * Vérifie si un symbole correspond à un mot réservé (insensible à la casse).
   * @param {string} symbol - Le symbole à tester.
   * @returns {boolean}
   */
  isReserved(symbol) {
    if (!symbol || typeof symbol !== 'string') return false;
    return SymbolValidator.RESERVED_SYMBOLS.has(symbol.trim().toLowerCase());
  }

  /**
   * Valide un symbole selon plusieurs critères (format, mot réservé, unicité).
   * @param {string} symbol - Le symbole à valider.
   * @param {object} options - Options de validation.
   * @param {string[]} [options.ignoreList=[]] - Une liste de symboles à ignorer lors de la vérification de l'unicité (utile pour un renommage).
   * @returns {{isValid: boolean, message: string|null}} - Un objet avec le résultat de la validation.
   */
  validate(symbol, { ignoreList = [] } = {}) {
    if (!symbol || !symbol.trim()) {
      return { isValid: false, message: 'Le symbole ne peut pas être vide.' };
    }

    if (!this.validSymbolRegex.test(symbol)) {
      return {
        isValid: false,
        message: `Le symbole "${symbol}" est invalide. Il doit commencer par une lettre et ne peut contenir que des lettres (éventuellement accentuées) et des chiffres.`
      };
    }

    if (this.isReserved(symbol)) {
      return {
        isValid: false,
        message: `Le symbole "${symbol}" est un mot réservé (fonction ou constante mathématique). Veuillez en choisir un autre.`
      };
    }

    const isAlreadyUsed = this.data.curves.some(c => c.title === symbol && !ignoreList.includes(symbol)) ||
      (this.data.parameters.hasOwnProperty(symbol) && !ignoreList.includes(symbol));

    if (isAlreadyUsed) {
      return {
        isValid: false,
        message: `Le symbole "${symbol}" est déjà utilisé. Veuillez en choisir un autre.`
      };
    }

    return { isValid: true, message: null };
  }
}