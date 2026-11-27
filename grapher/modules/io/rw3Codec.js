import { removeAccents, showToast } from '../../../common/common.js';
import { sanitizeSymbol, sanitizeUnit, updateFormulasReferences } from './formulaUtils.js';

/**
 * Déplace un suffixe d'unité commun (ex: _J) du membre de droite vers la gauche.
 * @param {string} line
 * @returns {string}
 */
export function moveUnitSuffixToLHS(line) {
  const t = String(line);
  const s = t.trim();
  if (!s || s.startsWith('#') || s.startsWith('//') || s.startsWith("'")) return t;

  const eq = s.indexOf('=');
  if (eq === -1) return t;

  const lhs = s.slice(0, eq).trim();
  const rhs = s.slice(eq + 1).trim();

  const unitRegexStr = "[a-zA-ZÀ-ÿ0-9µ°\\/\\-\\.\\^]+";
  const varRegexStr = "[a-zA-ZÀ-ÿ][a-zA-Z0-9À-ÿ]*";

  const boundLeft = "(?<![a-zA-Z0-9À-ÿ_])";
  const boundRight = "(?![a-zA-Z0-9À-ÿ_])";

  const extractRegex = new RegExp(`${boundLeft}${varRegexStr}_(${unitRegexStr})${boundRight}`, 'g');
  const unitMatches = [...rhs.matchAll(extractRegex)];

  if (unitMatches.length === 0) return t;

  const suffixes = new Set(unitMatches.map(m => m[1]));
  if (suffixes.size !== 1) return t;
  const unit = [...suffixes][0];

  if (new RegExp(`_(${unitRegexStr})$`).test(lhs)) return t;

  const lhsNew = `${lhs}_${unit}`;

  const escapedUnit = unit.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const replaceRegex = new RegExp(`${boundLeft}(${varRegexStr})_${escapedUnit}${boundRight}`, 'g');
  const rhsNew = rhs.replace(replaceRegex, '$1');

  return `${lhsNew} = ${rhsNew}`;
}

/**
 * Génère le contenu pour un fichier au format Regressi (.rw3).
 * @param {object} app
 * @returns {string}
 */
export function generateRW3(app) {
  const rawCurves = app.data.curves.filter(c => c.type !== 'calculation');

  const rawNames = rawCurves.map(c => removeAccents(c.title));
  const rawUnits = rawCurves.map(c => removeAccents(c.unit));

  let output = "EVARISTE REGRESSI WINDOWS 1.0\n";

  output += `£${rawNames.length} NOM VAR\n`;
  output += rawNames.join('\n') + '\n';

  output += `£${rawUnits.length} UNITE VAR\n`;
  output += rawUnits.join('\n') + '\n';

  output += "£1 PAGE COMMENT\n\n";

  const numRows = rawCurves.reduce((max, curve) => Math.max(max, curve.length), 0);
  const dataRows = [];

  for (let i = 0; i < numRows; i++) {
    const row = rawCurves.map(curve => {
      const cell = curve[i];
      return (cell === null || cell === undefined) ? '' : String(cell).replace('.', ',');
    });
    dataRows.push(row.join('\t'));
  }

  output += `&${numRows} VALEUR VAR\n`;
  output += dataRows.join('\n');

  const calculationsText = removeAccents(app.editor.getValue());
  if (calculationsText) {
    const memoLines = calculationsText.split('\n').map(line => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        return null;
      }

      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
        return "'" + trimmedLine.substring(trimmedLine.startsWith('//') ? 2 : 1).trim();
      }

      if (trimmedLine.includes('=')) {
        const parts = trimmedLine.split('=');
        const leftPart = parts[0].trim();
        const expression = parts.slice(1).join('=').trim();

        const lastUnderscoreIndex = leftPart.lastIndexOf('_');

        if (lastUnderscoreIndex > 0 && lastUnderscoreIndex < leftPart.length - 1) {
          const variableName = leftPart.substring(0, lastUnderscoreIndex);
          if (/^[a-zA-Z]/.test(variableName)) {
            return `${variableName} = ${expression}`;
          }
        }

        return trimmedLine;
      }

      return trimmedLine;
    }).filter(Boolean);

    if (memoLines.length > 0) {
      output += `\n£${memoLines.length} MEMO GRANDEURS\n`;
      output += memoLines.join('\n');
    }
  }

  return output;
}

/**
 * Décode et analyse le contenu binaire d'un fichier .rw3.
 * @param {ArrayBuffer} buf
 * @returns {{ tsvOutput: string, finalText: string, graphX: string[], graphY: string[], nameMap: object }}
 */
export function parseRW3Buffer(buf) {
  const utf8Text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
  const needsCp1252 = utf8Text.includes('\uFFFD') || /Â£/.test(utf8Text);

  const data = needsCp1252
    ? new TextDecoder('windows-1252', { fatal: false }).decode(buf)
    : utf8Text;

  const lines = data.split(/\r?\n/);

  const names = [];
  const units = [];
  const genres = []; // 0 = mesurée, 1 = calculée
  const rows = [];

  const constNames = [];
  const constUnits = [];
  const constRawValues = [];

  const memoLines = [];

  const graphX = [];
  const graphY = [];

  let i = 0;
  let loadedVarValues = false;
  let hasWarnedTruncation = false;

  const readBlock = (key, target, parser = s => s.trim()) => {
    const line = lines[i]?.trim() ?? '';
    const m = line.match(new RegExp(String.raw`(\d+)\s+${key}\b`, 'i'));
    if (!m) return false;
    const count = parseInt(m[1], 10) || 0;
    i++;
    for (let j = 0; j < count && i < lines.length; j++, i++) target.push(parser(lines[i]));
    return true;
  };

  while (i < lines.length) {
    const line = lines[i]?.trim() ?? '';

    if (/NOM VAR/i.test(line)) { readBlock('NOM VAR', names); continue; }
    if (/GENRE VAR/i.test(line)) { readBlock('GENRE VAR', genres, s => parseInt(String(s).trim(), 10) || 0); continue; }
    if (/UNITE VAR/i.test(line)) { readBlock('UNITE VAR', units, s => String(s).trim()); continue; }

    if (/MEMO GRANDEURS/i.test(line)) {
      readBlock('MEMO GRANDEURS', memoLines, s => String(s).replace(/\r$/, ''));
      continue;
    }

    if (/NOM CONST/i.test(line)) { readBlock('NOM CONST', constNames, s => String(s).trim()); continue; }
    if (/UNITE CONST/i.test(line)) { readBlock('UNITE CONST', constUnits, s => String(s).trim()); continue; }

    if (/^£\s*0\s+GRAPHE\s+VAR\b/i.test(line)) { i++; continue; }
    let mX = line.match(/&\s*(\d+)\s+X\b/i);
    if (mX) {
      const n = parseInt(mX[1], 10) || 0; i++;
      for (let j = 0; j < n && i < lines.length; j++, i++)
        graphX.push(String(lines[i]).trim());
      continue;
    }
    let mY = line.match(/&\s*(\d+)\s+Y\b/i);
    if (mY) {
      const n = parseInt(mY[1], 10) || 0; i++;
      for (let j = 0; j < n && i < lines.length; j++, i++)
        graphY.push(String(lines[i]).trim());
      continue;
    }

    const mConst = line.match(/&\s*(\d+)\s+VALEUR CONST/i);
    if (mConst) {
      const n = parseInt(mConst[1], 10) || 0;
      i++;
      for (let j = 0; j < n && i < lines.length; j++, i++) {
        const raw = String(lines[i]).trim();
        constRawValues.push(String(raw));
      }
      continue;
    }

    const mVal = line.match(/&\s*(\d+)\s+VALEUR VAR/i);
    if (mVal) {
      const n = parseInt(mVal[1], 10) || 0;
      i++;

      if (!loadedVarValues) {
        const measuredIdx = genres.length === names.length
          ? genres.map((g, idx) => (g === 0 ? idx : -1)).filter(idx => idx !== -1)
          : names.map((_, idx) => idx);
        const mCount = measuredIdx.length;

        let count = 0;
        while (i < lines.length && count < n) {
          const val = lines[i].trim();
          if (val) {
            const cols = val.split(/\s+/).map(s => {
              const num = Number.parseFloat(String(s).replace(',', '.'));
              return Number.isFinite(num) ? num : null;
            });

            while (cols.length < mCount) {
              cols.push(null);
            }

            if (cols.length > mCount) {
              if (!hasWarnedTruncation) {
                console.warn("Des colonnes excédentaires ont été ignorées car il manque des en-têtes.");
                showToast("Certaines colonnes de données ont été ignorées (aucun en-tête correspondant).", "is-warning");
                hasWarnedTruncation = true;
              }
            }

            rows.push(cols.slice(0, mCount));
          } else {
            rows.push(Array(mCount).fill(null));
          }
          i++;
          count++;
        }

        loadedVarValues = true;
      } else {
        i += n;
      }
      continue;
    }

    i++;
  }

  if (names.length === 0) throw new Error('Aucun bloc NOM VAR trouvé dans le fichier. Fichier invalide.');

  const measuredIdx = genres.length === names.length
    ? genres.map((g, idx) => (g === 0 ? idx : -1)).filter(idx => idx !== -1)
    : names.map((_, idx) => idx);

  if (measuredIdx.length === 0) {
    throw new Error('Aucune variable mesurée trouvée dans le fichier. Fichier invalide.');
  }

  const existingSymbols = new Set();
  const nameMap = {};

  const cleanNames = names.map(name => {
    const newName = sanitizeSymbol(name, existingSymbols);
    if (name !== newName) nameMap[name] = newName;
    return newName;
  });

  const cleanConstNames = constNames.map(name => {
    const newName = sanitizeSymbol(name, existingSymbols);
    if (name !== newName) nameMap[name] = newName;
    return newName;
  });

  const headerNames = measuredIdx.map(idx => cleanNames[idx]);
  const headerUnits = (units.length ? measuredIdx.map(idx => sanitizeUnit(units[idx])) : measuredIdx.map(() => ''));

  let output = '';
  output += headerNames.join('\t') + '\n';
  output += headerUnits.join('\t') + '\n';
  for (const r of rows) output += r.join('\t') + '\n';

  const paramLines = [];
  if (cleanConstNames.length) {
    const n = Math.max(cleanConstNames.length, constUnits.length, constRawValues.length);
    for (let k = 0; k < n; k++) {
      const name = (cleanConstNames[k] || '').trim();
      const unit = sanitizeUnit(constUnits[k]);
      const rawVal = String(constRawValues[k] ?? '').trim();
      if (!name || !rawVal) continue;
      const lhs = unit ? `${name}_${unit}` : name;
      paramLines.push(`${lhs} = ${rawVal}`);
    }
  }

  const normalizedMemoLines = memoLines.map(moveUnitSuffixToLHS);
  const memoText = normalizedMemoLines.length ? normalizedMemoLines.join('\n') : '';
  const paramsText = paramLines.length ? paramLines.join('\n') : '';
  let finalText = memoText && paramsText ? `${paramsText}\n\n${memoText}` : (memoText || paramsText);
  finalText = updateFormulasReferences(finalText, nameMap);

  return {
    tsvOutput: output.trim(),
    finalText,
    graphX,
    graphY,
    nameMap
  };
}
