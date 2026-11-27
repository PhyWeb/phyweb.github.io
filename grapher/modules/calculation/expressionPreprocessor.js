import { stripInlineComment } from '../io/formulaUtils.js';

/**
 * Normalise la casse des fonctions connues dans une expression.
 * @param {string} expression - L'expression à traiter.
 * @param {string[]} knownFunctions - Liste des noms de fonctions connues.
 * @returns {string} L'expression avec les fonctions en minuscules.
 */
export function normalizeFunctionCases(expression, knownFunctions) {
  const regex = new RegExp(`\\b(${knownFunctions.join('|')})\\b(?=\\s*\\()`, 'gi');
  return expression.replace(regex, (match) => match.toLowerCase());
}

/**
 * Remplace les exposants Unicode (ex: '²', '³', '⁻¹', '⁻²') par leur équivalent pour math.js ('^2', '^3', '^(-1)', '^(-2)').
 * @param {string} expression - L'expression à traiter.
 * @returns {string} - L'expression avec les exposants convertis.
 */
export function preprocessSpecialCharacters(expression) {
  if (!expression || typeof expression !== 'string') return expression;
  const superscriptMap = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '⁺': '+', '⁻': '-'
  };
  return expression.replace(/([⁺⁻]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match) => {
    const ascii = match.split('').map(ch => superscriptMap[ch] || ch).join('');
    if (ascii.startsWith('-') || ascii.startsWith('+')) {
      return `^(${ascii})`;
    }
    return `^${ascii}`;
  });
}

/**
 * Traite les virgules dans une expression pour concilier la notation décimale française
 * (ex: 0,5 * m) et les séparateurs d'arguments ou d'éléments (ex: pow(2,3), [1,2,3], pow(x1,2)).
 * @param {string} expression - L'expression à traiter.
 * @returns {string} - L'expression avec les virgules traitées.
 */
export function preprocessDecimalCommas(expression) {
  if (!expression || typeof expression !== 'string') return expression;

  let expr = expression.replace(/;\s*/g, ', ');

  const multiArgFunctions = new Set([
    'pow', 'diff', 'integrate', 'smooth', 'atan2', 'min', 'max', 'hypot', 'gcd', 'lcm', 'nthroot', 'mod'
  ]);

  const findMatchingCloseParen = (str, openIndex) => {
    let depth = 0;
    for (let k = openIndex; k < str.length; k++) {
      if (str[k] === '(') depth++;
      else if (str[k] === ')') {
        depth--;
        if (depth === 0) return k;
      }
    }
    return -1;
  };

  const countTopLevelCommas = (str, start, end) => {
    let count = 0;
    let pDepth = 0;
    let bDepth = 0;
    for (let k = start; k < end; k++) {
      const c = str[k];
      if (c === '(') pDepth++;
      else if (c === ')') pDepth--;
      else if (c === '[') bDepth++;
      else if (c === ']') bDepth--;
      else if (c === ',' && pDepth === 0 && bDepth === 0) {
        count++;
      }
    }
    return count;
  };

  const stack = [];
  let result = '';
  const len = expr.length;
  let i = 0;

  while (i < len) {
    const char = expr[i];

    if (char === '(') {
      let j = result.length - 1;
      while (j >= 0 && /\s/.test(result[j])) j--;
      const identEnd = j + 1;
      while (j >= 0 && /[a-zA-ZÀ-ÖØ-öø-ÿ0-9_]/.test(result[j])) j--;
      const ident = result.slice(j + 1, identEnd).toLowerCase();

      const closeIndex = findMatchingCloseParen(expr, i);
      const topLevelCommas = closeIndex !== -1 ? countTopLevelCommas(expr, i + 1, closeIndex) : 0;

      if (ident && multiArgFunctions.has(ident)) {
        stack.push({ type: 'multiArgCall', name: ident, topLevelCommas });
      } else if (ident) {
        stack.push({ type: 'singleArgCall', name: ident, topLevelCommas });
      } else {
        stack.push({ type: 'paren', topLevelCommas });
      }

      result += char;
      i++;
      continue;
    }

    if (char === ')') {
      if (stack.length > 0 && stack[stack.length - 1].type !== 'bracket') {
        stack.pop();
      }
      result += char;
      i++;
      continue;
    }

    if (char === '[') {
      stack.push({ type: 'bracket' });
      result += char;
      i++;
      continue;
    }

    if (char === ']') {
      if (stack.length > 0 && stack[stack.length - 1].type === 'bracket') {
        stack.pop();
      }
      result += char;
      i++;
      continue;
    }

    if (char === ',') {
      const prevChar = i > 0 ? expr[i - 1] : '';
      const nextChar = i + 1 < len ? expr[i + 1] : '';

      const isBetweenDigits = /\d/.test(prevChar) && /\d/.test(nextChar);

      let isPartOfIdentifier = false;
      if (isBetweenDigits) {
        let k = result.length - 1;
        while (k >= 0 && /\d/.test(result[k])) k--;
        if (k >= 0 && /[a-zA-ZÀ-ÖØ-öø-ÿ_]/.test(result[k])) {
          isPartOfIdentifier = true;
        }
      }

      const currentContext = stack.length > 0 ? stack[stack.length - 1] : null;

      if (isBetweenDigits && isPartOfIdentifier) {
        result += ', ';
        i++;
        continue;
      }

      if (isBetweenDigits && !isPartOfIdentifier) {
        if (currentContext && currentContext.type === 'bracket') {
          result += ', ';
          i++;
          continue;
        }

        if (currentContext && currentContext.type === 'multiArgCall' && currentContext.topLevelCommas === 1) {
          result += ', ';
          i++;
          continue;
        }

        result += '.';
        i++;
        continue;
      }

      result += ',';
      i++;
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

/**
 * Prétraite une formule pour la normaliser avant analyse syntaxique et évaluation.
 * @param {string} expression - L'expression à traiter.
 * @param {string[]} knownFunctions - Liste des fonctions connues pour normaliser la casse.
 * @returns {string}
 */
export function preprocessExpression(expression, knownFunctions) {
  if (!expression || typeof expression !== 'string') return expression;
  let clean = stripInlineComment(expression);
  clean = preprocessDecimalCommas(clean);
  clean = preprocessSpecialCharacters(clean);
  clean = normalizeFunctionCases(clean, knownFunctions);
  return clean;
}
