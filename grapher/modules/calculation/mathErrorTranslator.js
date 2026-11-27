const FUNCTION_USAGE_HINTS = {
  diff: 'diff(y, x)',
  integrate: 'integrate(y, x)',
  smooth: 'smooth(y, n)',
  atan2: 'atan2(y, x)'
};

/**
 * Traduit et simplifie les messages d'erreur courants de math.js en français clair.
 * Les erreurs déjà rédigées en français par PhyWeb ou non reconnues sont renvoyées telles quelles.
 * @param {Error|string} error
 * @returns {string}
 */
export function translateMathError(error) {
  const rawMessage = typeof error === 'string'
    ? error
    : (error && typeof error.message === 'string' ? error.message : String(error || ''));

  if (!rawMessage) return 'Erreur de calcul inconnue.';

  let match;

  // 1. Oubli fréquent du '*' (ex: m(x + 1) au lieu de m * (x + 1))
  if ((match = rawMessage.match(/'([^']+)' is not a function/i))) {
    const name = match[1];
    return `« ${name} » n'est pas une fonction (avez-vous oublié le signe * ? Ex. : ${name} * (...)).`;
  }

  // 2. Parenthèses et crochets
  if (/^Parenthesis \) expected/i.test(rawMessage)) {
    return 'Parenthèse fermante ")" manquante.';
  }
  if (/^End of matrix \] expected/i.test(rawMessage)) {
    return 'Crochet fermant "]" manquant.';
  }
  if ((match = rawMessage.match(/^Unexpected operator (\S+)/i))) {
    if (match[1] === ')') return 'Parenthèse fermante ")" en trop.';
    if (match[1] === ']') return 'Crochet fermant "]" en trop.';
    return `Opérateur « ${match[1]} » inattendu.`;
  }

  // 3. Syntaxe incomplète ou invalide
  if (/^Unexpected end of expression/i.test(rawMessage)) {
    return 'La formule est incomplète.';
  }
  if (/^Value expected/i.test(rawMessage)) {
    return "Valeur ou grandeur attendue dans l'expression.";
  }
  if ((match = rawMessage.match(/^Unexpected part "([^"]+)"/i))) {
    return `Syntaxe invalide près de « ${match[1]} ».`;
  }
  if ((match = rawMessage.match(/^Syntax error in part "([^"]+)"/i))) {
    return `Erreur de syntaxe près de « ${match[1]} ».`;
  }

  // 4. Arguments de fonctions
  if ((match = rawMessage.match(/^Too few arguments in function (\w+)/i))) {
    const fn = match[1];
    const hint = FUNCTION_USAGE_HINTS[fn];
    return hint
      ? `Pas assez d'arguments pour ${fn}() — syntaxe attendue : ${hint}.`
      : `Pas assez d'arguments pour la fonction ${fn}().`;
  }
  if ((match = rawMessage.match(/^Too many arguments in function (\w+)\s*\(expected:\s*(\d+),\s*actual:\s*(\d+)\)/i))) {
    const [, fn, expected, actual] = match;
    const expNum = Number(expected);
    const actNum = Number(actual);
    return `Trop d'arguments pour ${fn}() (${expNum} attendu${expNum > 1 ? 's' : ''}, ${actNum} fourni${actNum > 1 ? 's' : ''}).`;
  }
  if ((match = rawMessage.match(/^Too many arguments in function (\w+)/i))) {
    return `Trop d'arguments pour la fonction ${match[1]}().`;
  }
  if ((match = rawMessage.match(/^Unexpected type of argument in function (\w+)/i))) {
    return `Argument invalide pour la fonction ${match[1]}().`;
  }

  // 5. Symboles et fonctions non définis (filet de sécurité)
  if ((match = rawMessage.match(/^Undefined function (\S+)/i))) {
    return `La fonction "${match[1]}" n'est pas reconnue.`;
  }
  if ((match = rawMessage.match(/^Undefined symbol (\S+)/i))) {
    return `La variable "${match[1]}" n'est pas définie.`;
  }

  // 6. Indexation et dimensions de tableaux
  if ((match = rawMessage.match(/^Index out of range\s*\((-?\d+)\s*<\s*1\)/i))) {
    return `Indice hors limites : la numérotation commence à 1 (indice ${match[1]} invalide).`;
  }
  if ((match = rawMessage.match(/^Index out of range\s*\((\d+)\s*>\s*(\d+)\)/i))) {
    return `Indice hors limites (${match[1]} dépasse la taille ${match[2]} de la grandeur).`;
  }
  if (/^Index out of range/i.test(rawMessage)) {
    return 'Indice hors limites.';
  }
  if (/(?:shape mismatch|dimension mismatch)/i.test(rawMessage)) {
    return "Les grandeurs utilisées n'ont pas la même taille.";
  }

  // 7. Erreurs d'évaluation statistique / génériques
  if ((match = rawMessage.match(/^Cannot calculate (\w+)/i))) {
    return `Impossible de calculer ${match[1]}() avec ces données.`;
  }

  return rawMessage;
}
