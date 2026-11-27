import { toSuperscript, formatUnit } from '../../../common/formatter.js';

/**
 * Calcule l'exposant scientifique (multiple de 3) à factoriser sur un axe
 * en fonction de ses bornes min/max.
 * @param {number} min
 * @param {number} max
 * @param {boolean} [disableScientificNotation=false]
 * @returns {number}
 */
export function computeAxisExponent(min, max, disableScientificNotation = false) {
  if (disableScientificNotation) return 0;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 0;

  const maxAbs = Math.max(Math.abs(max), Math.abs(min));
  if (maxAbs <= 0) return 0;

  const power = Math.floor(Math.log10(maxAbs));
  const range = Math.abs(max - min);
  if (power >= 3 || power < -3) {
    if (power >= 3 && range > 0 && Math.log10(maxAbs / range) > 2) {
      return 0;
    }
    return Math.floor(power / 3) * 3;
  }
  return 0;
}

/**
 * Formate la combinaison puissance de 10 (×10^n) + unité physique.
 * @param {string} rawUnit
 * @param {number} [exponent=0]
 * @returns {string}
 */
export function formatUnitWithExponent(rawUnit, exponent = 0) {
  const unit = formatUnit(rawUnit || '');
  const exponentPart = exponent ? `×10${toSuperscript(exponent)}` : '';

  if (exponentPart && unit) {
    return `${exponentPart} ${unit}`;
  }
  if (exponentPart) {
    return exponentPart;
  }
  if (unit) {
    return unit;
  }
  return '';
}

/**
 * Formate un libellé complet d'axe ou de légende : `Nom (×10^n unité)`.
 * @param {string} displayName
 * @param {string} rawUnit
 * @param {number} [exponent=0]
 * @returns {string}
 */
export function formatAxisLabelWithUnit(displayName, rawUnit, exponent = 0) {
  const content = formatUnitWithExponent(rawUnit, exponent);
  if (displayName) {
    return content ? `${displayName} (${content})` : displayName;
  }
  return content ? `(${content})` : '';
}

/**
 * Formate une graduation numérique d'axe Highcharts compte tenu de l'exposant factorisé.
 * @param {number} rawValue
 * @param {number} tickInterval
 * @param {number} [exponent=0]
 * @returns {string}
 */
export function formatAxisTickValue(rawValue, tickInterval, exponent = 0) {
  const factor = Math.pow(10, exponent || 0);
  const value = rawValue / factor;
  const scaledTickInterval = tickInterval / factor;
  let decimals = 0;
  if (scaledTickInterval > 0) {
    decimals = Math.max(0, -Math.floor(Math.log10(scaledTickInterval)) + 1);
  }
  decimals = Math.min(decimals, 15);
  return Highcharts.numberFormat(value, decimals, ',', ' ');
}
