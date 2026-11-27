import SymbolValidator from '../symbolValidator.js';

/**
 * Nettoie un symbole pour respecter : /^[a-zA-ZÀ-ÿ][a-zA-Z0-9À-ÿ]*$/
 * et le passe en CamelCase si besoin.
 */
export function sanitizeSymbol(str, existingSymbols) {
  if (!str) return "var";

  // 1. Transforme les espaces, tirets et underscores en CamelCase
  let s = str.trim().replace(/[-_\s]+(.)?/g, (match, c) => c ? c.toUpperCase() : '');

  // 2. Ne garde que les lettres (avec accents) et les chiffres
  s = s.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '');

  // 3. S'assure que ça commence par une lettre
  if (/^[0-9]/.test(s) || s === "") {
    s = "v" + (s === "" ? "ar" : s);
  }

  // 4. Garantit l'absence de mot réservé et l'unicité
  let finalSymbol = s;
  let counter = SymbolValidator.isReserved(finalSymbol) ? 1 : 2;
  while (
    SymbolValidator.isReserved(finalSymbol) ||
    (existingSymbols && existingSymbols.has(finalSymbol))
  ) {
    finalSymbol = `${s}${counter}`;
    counter++;
  }

  if (existingSymbols) existingSymbols.add(finalSymbol);
  return finalSymbol;
}

/**
 * Nettoie une unité : remplace les underscores par des tirets
 * pour ne pas casser la séparation variable_unité.
 */
export function sanitizeUnit(str) {
  if (!str) return "";
  return String(str).replace(/_/g, '-').trim();
}

/**
 * Isole la partie code et la partie commentaire d'une ligne.
 * Gère les commentaires pleins ou en fin de ligne (#, // et ' de Regressi),
 * tout en préservant le contenu à l'intérieur des chaînes de caractères ("...").
 * @param {string} line
 * @returns {{ code: string, comment: string }}
 */
export function splitCodeAndComment(line) {
  if (!line || typeof line !== 'string') {
    return { code: '', comment: '' };
  }

  const trimmed = line.trimStart();
  if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith("'")) {
    return { code: '', comment: line };
  }

  let inString = false;
  let stringChar = '';

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inString) {
      if (ch === stringChar && line[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === '#') {
      return { code: line.slice(0, i), comment: line.slice(i) };
    }

    if (ch === '/' && i + 1 < line.length && line[i + 1] === '/') {
      return { code: line.slice(0, i), comment: line.slice(i) };
    }

    if (ch === "'" && (i === 0 || /\s/.test(line[i - 1]))) {
      return { code: line.slice(0, i), comment: line.slice(i) };
    }
  }

  return { code: line, comment: '' };
}

/**
 * Retire les commentaires inline (#, // et ' précédé d'un espace) d'une expression.
 * Préserve le contenu à l'intérieur des chaînes de caractères ("...").
 * @param {string} str - L'expression à nettoyer.
 * @returns {string} - L'expression sans commentaire.
 */
export function stripInlineComment(str) {
  if (!str || typeof str !== 'string') return '';
  return splitCodeAndComment(str).code.trim();
}

/**
 * Remplace les identifiants de variables dans une expression mathématique.
 */
export function replaceVariablesInExpression(expr, nameMap) {
  if (!expr) return expr;
  const keys = Object.keys(nameMap).filter(k => k && k.length > 0).sort((a, b) => b.length - a.length);
  if (keys.length === 0) return expr;

  let result = expr;
  for (const oldName of keys) {
    const escapedOld = oldName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?<![a-zA-Z0-9À-ÖØ-öø-ÿ_])${escapedOld}(?![a-zA-Z0-9À-ÖØ-öø-ÿ_])`, 'g');
    result = result.replace(regex, nameMap[oldName]);
  }
  return result;
}

/**
 * Met à jour un texte de formules en remplaçant les anciens noms par les nouveaux
 * tout en préservant les unités du membre de gauche et les commentaires.
 */
export function updateFormulasReferences(text, nameMap) {
  if (!text || typeof text !== 'string') return text;
  if (!nameMap || Object.keys(nameMap).length === 0) return text;

  const lines = text.split('\n');
  const processedLines = lines.map(rawLine => {
    let line = rawLine;
    let lineEnding = '';
    if (line.endsWith('\r')) {
      line = line.slice(0, -1);
      lineEnding = '\r';
    }

    const { code, comment } = splitCodeAndComment(line);
    if (!code) {
      return line + lineEnding;
    }

    const eqIndex = code.indexOf('=');
    if (eqIndex === -1) {
      const updatedCode = replaceVariablesInExpression(code, nameMap);
      return updatedCode + comment + lineEnding;
    }

    const rawLhs = code.slice(0, eqIndex);
    const rawRhs = code.slice(eqIndex + 1);

    // Membre de gauche (LHS) : variable[_unité]
    const underscoreIndex = rawLhs.indexOf('_');
    let updatedLhs;
    if (underscoreIndex !== -1) {
      const varPart = rawLhs.slice(0, underscoreIndex);
      const unitPart = rawLhs.slice(underscoreIndex);
      const match = varPart.match(/^(\s*)(.*?)(\s*)$/);
      const leading = match ? match[1] : '';
      const varName = match ? match[2] : varPart;
      const trailing = match ? match[3] : '';
      const newVarName = Object.prototype.hasOwnProperty.call(nameMap, varName)
        ? nameMap[varName]
        : replaceVariablesInExpression(varName, nameMap);
      updatedLhs = leading + newVarName + trailing + unitPart;
    } else {
      const match = rawLhs.match(/^(\s*)(.*?)(\s*)$/);
      const leading = match ? match[1] : '';
      const varName = match ? match[2] : rawLhs;
      const trailing = match ? match[3] : '';
      const newVarName = Object.prototype.hasOwnProperty.call(nameMap, varName)
        ? nameMap[varName]
        : replaceVariablesInExpression(varName, nameMap);
      updatedLhs = leading + newVarName + trailing;
    }

    // Membre de droite (RHS) : expression mathématique
    const updatedRhs = replaceVariablesInExpression(rawRhs, nameMap);

    return updatedLhs + '=' + updatedRhs + comment + lineEnding;
  });

  return processedLines.join('\n');
}

/**
 * Met à jour l'unité d'une variable définie dans un bloc de formules (membre de gauche variable[_unité] = ...),
 * tout en préservant l'espacement, le membre de droite et les commentaires.
 * @param {string} text
 * @param {string} variableName
 * @param {string} newUnit
 * @returns {string}
 */
export function updateFormulaUnit(text, variableName, newUnit) {
  if (!text || typeof text !== 'string' || !variableName) return text;

  const cleanUnit = String(newUnit ?? '').trim().replace(/\s+/g, '');
  const lines = text.split('\n');

  const processedLines = lines.map(rawLine => {
    let line = rawLine;
    let lineEnding = '';
    if (line.endsWith('\r')) {
      line = line.slice(0, -1);
      lineEnding = '\r';
    }

    const { code, comment } = splitCodeAndComment(line);
    if (!code) {
      return line + lineEnding;
    }

    const eqIndex = code.indexOf('=');
    if (eqIndex === -1) {
      return line + lineEnding;
    }

    const rawLhs = code.slice(0, eqIndex);
    const rawRhs = code.slice(eqIndex + 1);

    const underscoreIndex = rawLhs.indexOf('_');
    const rawVarPart = underscoreIndex !== -1 ? rawLhs.slice(0, underscoreIndex) : rawLhs;
    const normalizedVar = rawVarPart.trim().replace(/\s+/g, '');

    if (normalizedVar !== variableName) {
      return line + lineEnding;
    }

    const leadingMatch = rawLhs.match(/^(\s*)/);
    const trailingMatch = rawLhs.match(/(\s*)$/);
    const leading = leadingMatch ? leadingMatch[1] : '';
    const trailing = trailingMatch ? trailingMatch[1] : '';
    const newLhsCore = cleanUnit ? `${variableName}_${cleanUnit}` : variableName;

    return leading + newLhsCore + trailing + '=' + rawRhs + comment + lineEnding;
  });

  return processedLines.join('\n');
}
