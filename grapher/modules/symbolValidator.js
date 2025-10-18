/**
 * Gère la validation des symboles (noms de grandeurs et de paramètres).
 */
export default class SymbolValidator {
  /**
   * @param {object} data - L'instance de la classe Data pour accéder aux courbes et paramètres.
   */
  constructor(data) {
    this.data = data;
    // La regex unifiée : doit commencer par une lettre (ou underscore)
    // et ne contenir que des lettres, des chiffres ou des underscores.
    this.validSymbolRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  }

  /**
   * Valide un symbole selon plusieurs critères (format, unicité).
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
        message: `Le symbole "${symbol}" est invalide. Il doit commencer par une lettre et ne peut contenir que des lettres, des chiffres et des underscores (_).`
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