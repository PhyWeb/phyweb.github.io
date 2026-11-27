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

const decimalFormatterCache = new Map();

function getDecimalFormatter(decimals) {
  let formatter = decimalFormatterCache.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true
    });
    decimalFormatterCache.set(decimals, formatter);
  }
  return formatter;
}

function groupIntegerDigits(intStr, thousandsSep) {
  if (!thousandsSep || intStr.length <= 3) return intStr;
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
}

function formatExtremeDecimal(absValue, decimals, decimalPoint, thousandsSep) {
  const exp = Math.floor(Math.log10(absValue));

  if (exp >= 0) {
    const [mantissa, expStr] = absValue.toExponential().split('e');
    const e = parseInt(expStr, 10);
    const digits = mantissa.replace('.', '');
    const intLen = e + 1;
    let intPart;
    let fracPart = '';

    if (digits.length <= intLen) {
      intPart = digits.padEnd(intLen, '0');
    } else {
      intPart = digits.slice(0, intLen);
      fracPart = digits.slice(intLen);
    }

    const groupedInt = groupIntegerDigits(intPart, thousandsSep);
    if (decimals <= 0) return groupedInt;
    return `${groupedInt}${decimalPoint}${fracPart.slice(0, decimals).padEnd(decimals, '0')}`;
  }

  const sigDecimals = decimals + exp;
  if (sigDecimals < 0) {
    return '0';
  }

  const [mantissa, expStr] = absValue.toExponential(Math.min(sigDecimals, 100)).split('e');
  const e = parseInt(expStr, 10);
  const digits = mantissa.replace('.', '');

  if (e >= 0) {
    const intLen = e + 1;
    const intPart = digits.length <= intLen ? digits.padEnd(intLen, '0') : digits.slice(0, intLen);
    const fracPart = digits.length <= intLen ? '' : digits.slice(intLen);
    const groupedInt = groupIntegerDigits(intPart, thousandsSep);
    if (decimals <= 0) return groupedInt;
    return `${groupedInt}${decimalPoint}${fracPart.slice(0, decimals).padEnd(decimals, '0')}`;
  }

  const leadingZeros = -e - 1;
  const fracRaw = '0'.repeat(leadingZeros) + digits;
  return `0${decimalPoint}${fracRaw.slice(0, decimals).padEnd(decimals, '0')}`;
}

/**
 * Formate une graduation numérique d'axe Highcharts compte tenu de l'exposant factorisé,
 * sans jamais réintroduire de notation scientifique (`e-7`, `e+21`, etc.).
 * @param {number} rawValue
 * @param {number} tickInterval
 * @param {number} [exponent=0]
 * @returns {string}
 */
export function formatAxisTickValue(rawValue, tickInterval, exponent = 0) {
  const factor = Math.pow(10, exponent || 0);
  const value = rawValue / factor;
  if (!Number.isFinite(value)) return '';
  if (value === 0) return '0';

  const scaledTickInterval = tickInterval / factor;
  let decimals = 0;
  if (Number.isFinite(scaledTickInterval) && scaledTickInterval > 0) {
    decimals = Math.max(0, -Math.floor(Math.log10(scaledTickInterval)) + 1);
  }
  decimals = Math.min(decimals, 30);

  const absValue = Math.abs(value);
  const isNegative = value < 0;
  let formatted;

  if (absValue < 1e21 && decimals <= 20) {
    formatted = getDecimalFormatter(decimals)
      .format(absValue)
      .replace(/,/g, '\u0000')
      .replace(/\./g, ',')
      .replace(/\u0000/g, ' ');
  } else {
    formatted = formatExtremeDecimal(absValue, decimals, ',', ' ');
  }

  if (/^0(?:,0+)?$/.test(formatted)) {
    return '0';
  }
  return isNegative ? `-${formatted}` : formatted;
}
