import Papa from '../../../common/papaparse/papaparse.esm.js';

export function splitFlexible(line, delimiter) {
  if (typeof line !== 'string') return [];
  const cleanLine = line.replace(/\r$/, '');
  const sep = delimiter || (cleanLine.includes('\t') ? '\t' : null);
  if (sep) {
    return cleanLine.split(sep).map(cell => cell.trim());
  }
  return cleanLine.trim().split(/\s{2,}/).map(cell => cell.trim());
}

export function isTabularData(text) {
  if (!text || typeof text !== 'string') return false;
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return false;
  const delimiter = text.includes('\t') ? '\t' : undefined;
  const colCounts = lines.map(line => splitFlexible(line, delimiter).length);
  const firstCount = colCounts[0];
  const sameCount = colCounts.filter(c => c === firstCount).length;
  return sameCount >= lines.length - 1 && firstCount >= 2;
}

/**
 * Vérifie si une valeur représente un nombre valide.
 * Évite les faux positifs de parseFloat (ex: "1ère mesure", "24h", "1/s", "10^-3").
 */
export function isNumeric(val) {
  if (val === null || val === undefined) return false;
  const s = String(val).replace(',', '.').trim();
  if (s === '') return false;
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(s);
}

/**
 * Vérifie si une ligne de cellules correspond à des données numériques.
 */
export function isLineNumeric(cells) {
  if (!cells || cells.length === 0) return false;
  const nonEmpty = cells.map(c => String(c).trim()).filter(c => c.length > 0);
  return nonEmpty.length > 0 && nonEmpty.every(isNumeric);
}

/**
 * Génère le contenu pour un fichier CSV.
 * @param {object} data - Instance Data
 * @param {string} separator - Séparateur de colonnes
 * @param {'row'|'parentheses'|'none'} [unitFormat='row']
 * @returns {string}
 */
export function generateCSV(data, separator, unitFormat = 'row') {
  const rawHeaders = data.curves.map(c => c.title);
  const rawUnits = data.curves.map(c => c.unit);

  const tableData = data.getTable();
  const dataRows = tableData.map(row => {
    return row.map(cell => (cell === null || cell === undefined) ? '' : String(cell).replace('.', ','));
  });

  let allRows = [];
  if (unitFormat === 'parentheses') {
    const headers = rawHeaders.map((h, i) => {
      const u = rawUnits[i];
      return (h && u) ? `${h} (${u})` : (h || u || "");
    });
    allRows = [headers, ...dataRows];
  } else if (unitFormat === 'none') {
    allRows = [rawHeaders, ...dataRows];
  } else {
    // 'row' par défaut (format 2 lignes spécifique à Grapher)
    allRows = [rawHeaders, rawUnits, ...dataRows];
  }

  return Papa.unparse(allRows, {
    delimiter: separator
  });
}

/**
 * Parse un fichier CSV via PapaParse (Web Worker) et le convertit en chaîne TSV.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function parseCSVFileToTSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      worker: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (!results || !Array.isArray(results.data) || results.data.length === 0) {
            throw new Error('Le fichier CSV ne contient aucune donnée.');
          }

          const toTSV = results.data
            .map(r => (Array.isArray(r) ? r : [r]).map(cell => String(cell).replace(/\t/g, " ")).join("\t"))
            .join("\n");

          if (!toTSV.trim()) {
            throw new Error('Le fichier CSV ne contient aucune donnée exploitable.');
          }

          resolve(toTSV);
        } catch (e) {
          reject(new Error('Erreur lors de l\'injection des données CSV.'));
          console.error(e);
        }
      },
      error: (err) => {
        reject(new Error('Erreur lors de la lecture du fichier CSV.'));
        console.error(err);
      }
    });
  });
}
