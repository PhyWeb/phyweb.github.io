/**
 * Formate un nombre en chaîne de caractères avec un nombre fixe de chiffres significatifs.
 * Utilise la notation scientifique (ex: "1,23·10⁵") pour les grands et petits nombres.
 * @param {*} value La valeur à formater.
 * @param {number} significantDigits Le nombre de chiffres significatifs.
 * @param {object} [options] Options de formatage.
 * @param {boolean} [options.useScientificNotation=true] Indique s'il faut utiliser la notation scientifique.
 * @returns {string} La valeur formatée.
 */
export function formatNumber(value, significantDigits, options = {}) {
  const { useScientificNotation = true } = options;
  // Pour les cellules vides (null, undefined), retourner une chaîne vide.
  if (value === null || typeof value === 'undefined') {
    return '';
  }
  // Pour les autres non-nombres (chaînes, etc.), les retourner tels quels.
  if (typeof value !== 'number' || isNaN(value)) {
    return String(value);
  }

  // toPrecision() ne supporte pas les valeurs <= 0.
  if (significantDigits <= 0) {
    return value.toString().replace('.', ',');
  }

  // Seuils pour décider quand utiliser la notation scientifique.
  const lowerThreshold = 1e-4;
  const upperThreshold = Math.pow(10, significantDigits);

  const absValue = Math.abs(value);

  // Utiliser la notation scientifique pour les nombres très grands ou très petits (sauf zéro).
  if (useScientificNotation && value !== 0 && (absValue < lowerThreshold || absValue >= upperThreshold)) {
    // toExponential donne la notation 'e' avec un chiffre avant la virgule.
    // Le nombre de chiffres après la virgule est significantDigits - 1.
    const exponentialStr = value.toExponential(significantDigits - 1);
    const [mantissa, exponentStr] = exponentialStr.split('e');

    // Formate la mantisse avec une virgule.
    const formattedMantissa = mantissa.replace('.', ',');

    // Formate l'exposant avec des caractères en exposant.
    const exponent = parseInt(exponentStr, 10);
    const superscriptExponent = exponent
      .toString()
      .split('')
      .map(char => {
        if (char === '-') return '⁻'; // Caractère moins en exposant
        return '⁰¹²³⁴⁵⁶⁷⁸⁹'[char];
      })
      .join('');

    return `${formattedMantissa}·10${superscriptExponent}`;
  }

  // Pour les nombres dans la plage "normale", on utilise la logique pour préserver les zéros de fin.
  let formattedValue = value.toPrecision(significantDigits);

  // Si toPrecision retourne une notation scientifique (pour les petits nombres),
  // on la déplie manuellement pour garder les zéros.
  if (formattedValue.includes('e')) {
    const [mantissa, exponentStr] = formattedValue.split('e');
    const exponent = parseInt(exponentStr, 10);

    if (exponent < 0) {
      // Déplie les petits nombres pour préserver les zéros (ex: 1.20e-5 -> 0.0000120)
      const isNegative = mantissa.startsWith('-');
      const absMantissa = isNegative ? mantissa.substring(1) : mantissa;
      const digits = absMantissa.replace('.', '');
      const zeros = '0'.repeat(Math.abs(exponent) - 1);
      formattedValue = (isNegative ? '-' : '') + '0.' + zeros + digits;
    }
  }

  // Remplace le point décimal par une virgule pour la localisation française.
  return formattedValue.replace('.', ',');
}