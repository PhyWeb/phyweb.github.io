import Curve from './data.js';

// Fonctions utilitaires
function splitFlexible(line) {
  return line.trim().split(/\s{2,}|\t/);
}

function isTabularData(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return false;
  const colCounts = lines.map(line => splitFlexible(line).length);
  const firstCount = colCounts[0];
  const sameCount = colCounts.filter(c => c === firstCount).length;
  return sameCount >= lines.length - 1 && firstCount >= 2;
}

//-----------------------------------------------------------------------------------------------
// --------------------------------------------IOManager-----------------------------------------
// ----------------------------------------------------------------------------------------------
export default class IOManager {
  constructor(app) {
    this.app = app;
    this.isLoading = false;
    this.pendingRW3 = null;
  }

  // --- Méthodes de Sauvegarde / Export ---

  /**
   * Méthode principale de sauvegarde
   * @param {string} fileName - Le nom du fichier à sauvegarder.
   * @param {string} format - Le format du fichier (csv, rw3, pw).
   */
  saveFile(fileName, format) {
    let content = '';
    const separator = '\t';

    if (format === 'csv') {
      content = this.generateCSV(separator);
    } else if (format === 'rw3') {
      content = this.generateRW3();
    } else if (format === 'pw') {
      content = this.generatePW(); // Nouvelle méthode
    } else {
      console.error("Format de fichier non supporté:", format);
      return;
    }

    this.triggerDownload(content, fileName);
  }

  /**
   * Génère le contenu JSON pour un fichier de session .pw.
   * @returns {string} Le contenu du fichier .pw (chaîne JSON).
   */
  generatePW() {
    const yCurves = this.app.grapher.chart.series.map(s => s.name);

    const dataToSave = {
      curves: this.app.data.curves.map(curve => ({
        title: curve.title,
        unit: curve.unit,
        color: curve.color,
        line: curve.line,
        markers: curve.markers,
        lineWidth: curve.lineWidth,
        lineStyle: curve.lineStyle,
        markerSymbol: curve.markerSymbol,
        markerRadius: curve.markerRadius,
        type: curve.type,
        values: Array.from(curve)
      })),
      parameters: this.app.data.parameters
    };

    const state = {
      version: "1.3",
      data: dataToSave,
      calculations: this.app.editor.getValue(),
      grapher: {
        xCurve: this.app.grapher.currentXCurve,
        yCurves: yCurves,
        grid: this.app.grapher.grid
      }
    };
    
    return JSON.stringify(state, null, 2);
  }

  /**
   * Génère le contenu pour un fichier CSV.
   * @param {string} separator - Le séparateur de colonnes.
   * @returns {string} Le contenu du fichier CSV.
   */
  generateCSV(separator) {
    const headers = this.app.data.curves.map(c => c.title).join(separator);
    const units = this.app.data.curves.map(c => c.unit).join(separator);
    const tableData = this.app.data.getTable();

    const dataRows = tableData.map(row => {
      // Remplace les null/undefined par des chaînes vides et les points par des virgules pour le format FR
      return row.map(cell => (cell === null || cell === undefined) ? '' : String(cell).replace('.', ',')).join(separator);
    }).join('\n');

    return `${headers}\n${units}\n${dataRows}`;
  }

  /**
   * Génère le contenu pour un fichier au format Regressi (.rw3). (Version finale corrigée)
   * @returns {string} Le contenu du fichier .rw3.
   */
  generateRW3() {
    // 1. On ne sélectionne QUE les courbes qui ne sont PAS issues d'un calcul.
    const rawCurves = this.app.data.curves.filter(c => c.type !== 'calculation');
    
    // 2. Les noms et unités ne proviennent QUE de ces courbes brutes.
    const rawNames = rawCurves.map(c => c.title);
    const rawUnits = rawCurves.map(c => c.unit);

    // 3. On construit le fichier en utilisant uniquement les données brutes.
    let output = "EVARISTE REGRESSI WINDOWS 1.0\n";
    
    output += `£${rawNames.length} NOM VAR\n`;
    output += rawNames.join('\n') + '\n';
    
    output += `£${rawUnits.length} UNITE VAR\n`;
    output += rawUnits.join('\n') + '\n';
    
    output += "£1 PAGE COMMENT\n\n";
    
    // Le tableau de valeurs est aussi construit UNIQUEMENT à partir des courbes brutes.
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

    // 4. On ajoute les formules pour que Regressi puisse créer les grandeurs calculées.
    const calculationsText = this.app.editor.getValue(); 
    if (calculationsText) {
      const memoLines = calculationsText.split('\n').map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') { return ''; }
        if (trimmedLine.startsWith('//')) { return "'" + trimmedLine.substring(2).trim(); }
        if (trimmedLine.startsWith('#')) { return "'" + trimmedLine.substring(1).trim(); }
        if (trimmedLine.includes('=')) {
          const parts = trimmedLine.split('=');
          const leftPart = parts[0].trim();
          const expression = parts.slice(1).join('=').trim();
          const variableName = leftPart.split('_')[0];
          return `${variableName}=${expression}`;
        }
        return "'" + trimmedLine;
      });

      if (memoLines.length > 0) {
        output += `\n£${memoLines.length} MEMO GRANDEURS\n`;
        output += memoLines.join('\n');
      }
    }
    
    return output;
  }

  /**
   * Crée un lien de téléchargement et le clique pour télécharger le contenu.
   * @param {string} content - Le contenu du fichier.
   * @param {string} fileName - Le nom du fichier.
   */
  triggerDownload(content, fileName) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- Méthodes de Chargement / Import ---

  /**
   * Méthode principale de chargement
   */
  loadFile(file) {
    this.app.deleteAllCurves();

    if (file.name.endsWith(".pw")) { // Gère le nouveau format
      this.loadPWFile(file);
      return;
    }
    if (file.type === "text/csv") {
      this.loadCSVFile(file);
      return;
    }
    if (file.name.endsWith(".rw3")) {
      this.loadRW3File(file);
      return;
    }

    console.error("Type de fichier non supporté");
  }

  /**
  * Charge des données tabulaires depuis le presse-papiers.
  * @param {string} data - Les données copiées (texte brut).
  */
  loadClipboard(data) {
    // Check if the data is tabular
    if (!isTabularData(data)) {
      throw new Error("Les données du presse-papiers ne sont pas au format tabulaire.");
    }

    // EMPTY DATA
    this.app.deleteAllCurves();

    this.loadData(data);
  }

  /**
   * Charge et restaure une session depuis un fichier .pw.
   * @param {File} file - Le fichier .pw à charger.
   */
  loadPWFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const state = JSON.parse(event.target.result);
        if (state.data && state.data.curves) {
          this.app.data.curves = state.data.curves.map(c => {
            const newCurve = new Curve(c.title, c.unit);
            Object.assign(newCurve, c);
            if (c.values) {
              c.values.forEach(val => newCurve.push(val));
            }
            return newCurve;
          });
          this.app.data.parameters = state.data.parameters || {};
        } else {
            throw new Error("Le fichier de session est invalide ou corrompu (données manquantes).");
        }
        if (state.grapher) {
            this.app.grapher.setGridVisibility(state.grapher.grid);
        }

        this.app.editor.setValue(text);

        this.app.spreadsheet.update();
        if (state.grapher && state.grapher.xCurve) {
            this.app.grapher.setXCurve(state.grapher.xCurve, false);
            this.app.grapher.updateChart(state.grapher.yCurves);
        } else {
            this.app.grapher.deleteAllCurves();
            this.app.grapher.updateChart();
        }
        // Update the calculation tab
        this.app.uiUpdater.updateCalculationUI();
        console.log("Session .pw restaurée avec succès (les paramètres locaux sont conservés).");
      } catch (e) {
        console.error("ERREUR lors du chargement de la session .pw :", e);
        alertModal({ title: "Erreur de chargement", body: "Le fichier de session est corrompu ou invalide. Vérifiez la console (F12) pour les détails." });
      }
    };
    reader.readAsText(file);
  }

  /**
   * Charge des données tabulaires depuis un fichier CSV.
   * @param {File} file - Le fichier CSV à charger.
   */
  loadCSVFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const raw = (event.target.result || "").replace(/^\uFEFF/, ""); // retire BOM

      // 1) Détection du séparateur le plus probable parmi ; , \t
      const detectDelimiter = (text) => {
        const candidates = [";", ",", "\t"];  // ordre volontaire pour FR puis US puis TSV
        const sample = text.split(/\r?\n/).slice(0, 20); // échantillon
        const score = {};
        for (const d of candidates) {
          let counts = [];
          for (const line of sample) {
            let inQuotes = false, count = 0;
            for (let i = 0; i < line.length; i++) {
              const ch = line[i];
              if (ch === '"') {
                // gérer "" à l'intérieur des champs
                if (inQuotes && line[i + 1] === '"') { i++; continue; }
                inQuotes = !inQuotes;
              } else if (!inQuotes && ch === d) {
                count++;
              }
            }
            counts.push(count);
          }
          // Consistance: on privilégie le séparateur avec un nombre de séparateurs non nul
          // et un écart‑type faible sur les lignes de l’échantillon
          const nonZero = counts.filter(c => c > 0);
          if (nonZero.length === 0) { score[d] = {mean: 0, stdev: 1e9, used: 0}; continue; }
          const mean = nonZero.reduce((a,b)=>a+b,0)/nonZero.length;
          const variance = nonZero.reduce((a,b)=>a+(b-mean)*(b-mean),0)/nonZero.length;
          score[d] = {mean, stdev: Math.sqrt(variance), used: nonZero.length};
        }
        // Choix: le plus utilisé avec la meilleure régularité (stdev minimal), puis mean maximal
        const ranked = Object.entries(score).sort((a,b)=>{
          if (b[1].used !== a[1].used) return b[1].used - a[1].used;
          if (a[1].stdev !== b[1].stdev) return a[1].stdev - b[1].stdev;
          return b[1].mean - a[1].mean;
        });
        const best = ranked[0]?.[0] || ";";
        return best;
      };

      // Parser CSV en respectant les guillemets
      const parseCSV = (text, delimiter) => {
        const rows = [];
        let row = [];
        let field = "";
        let inQuotes = false;

        const pushField = () => {
          row.push(field);
          field = "";
        };
        const pushRow = () => {
          rows.push(row);
          row = [];
        };

        for (let i = 0; i < text.length; i++) {
          const ch = text[i];

          if (ch === '"') {
            if (inQuotes && text[i + 1] === '"') {
              field += '"'; // séquence "" -> "
              i++;
            } else {
              inQuotes = !inQuotes;
            }
            continue;
          }

          if (!inQuotes && (ch === "\n" || ch === "\r")) {
            // fin de ligne (gérer CRLF)
            pushField();
            pushRow();
            if (ch === "\r" && text[i + 1] === "\n") i++;
            continue;
          }

          if (!inQuotes && ch === delimiter) {
            pushField();
            continue;
          }

          field += ch;
        }
        // Dernier champ / dernière ligne
        pushField();
        if (row.length > 1 || (row.length === 1 && row[0] !== "")) pushRow();

        return rows;
      };

      const delimiter = detectDelimiter(raw);
      const rows = parseCSV(raw, delimiter);

      // Conversion en TSV attendu par loadData (escape des tabs éventuels)
      const toTSV = rows
        .map(r => r.map(cell => String(cell).replace(/\t/g, " ")).join("\t"))
        .join("\n");

      this.loadData(toTSV);
    };
    reader.readAsText(file);
  }

  /**
   * Charge et restaure une "session" depuis un fichier .rw3.
   * @param {File} file - Le fichier .rw3 à charger.
   */
  async loadRW3File(file) {
    const buf = await file.arrayBuffer();

    // 1) Essai UTF-8
    const utf8Text = new TextDecoder('utf-8', { fatal: false }).decode(buf);

    // 2) Si “�” (U+FFFD) est présent, ou si on voit “Â£” issu d'un mauvais décodage, on bascule en Windows-1252 immédiatement.
    const needsCp1252 =
      utf8Text.includes('\uFFFD') || /Â£/.test(utf8Text);

    const data = needsCp1252
      ? new TextDecoder('windows-1252', { fatal: false }).decode(buf)
      : utf8Text;

    // Tokenisation en lignes
    const lines = data.split(/\r?\n/);

    const names = [];
    const units = [];
    const genres = []; // 0 = mesurée, 1 = calculée
    const rows = [];   // lignes mesurées uniquement

    const constNames = [];
    const constUnits = [];
    const constRawValues = [];

    const memoLines = [];

    const graphX = [];
    const graphY = [];

    let i = 0;

    let loadedVarValues = false

    // Lecture d'un bloc "£<n> <KEY>" -> n lignes
    const readBlock = (key, target, parser = s => s.trim()) => {
      const line = lines[i]?.trim() ?? '';
      const m = line.match(new RegExp(String.raw`(\d+)\s+${key}\b`, 'i'));
      if (!m) return false;
      const count = parseInt(m[1], 10) || 0;
      i++;
      for (let j = 0; j < count && i < lines.length; j++, i++) target.push(parser(lines[i]));
      return true;
    };

    // Parcours des sections utiles
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


      // Trouve les courbes à tracer
      if (/^£\s*0\s+GRAPHE\s+VAR\b/i.test(line)) { i++; continue; }
      let mX = line.match(/&\s*(\d+)\s+X\b/i);
      if (mX) { const n = parseInt(mX[1], 10) || 0; i++; 
        for (let j = 0; j < n && i < lines.length; j++, i++) 
          graphX.push(String(lines[i]).trim()); 
        continue; 
      }
      let mY = line.match(/&\s*(\d+)\s+Y\b/i);
      if (mY) { const n = parseInt(mY[1], 10) || 0; i++; 
        for (let j = 0; j < n && i < lines.length; j++, i++) 
          graphY.push(String(lines[i]).trim()); 
        continue; 
      }

      // Bloc paramètres
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

      // Bloc valeurs: on ne gère que le cas “colonnes mesurées”
      const mVal = line.match(/&\s*(\d+)\s+VALEUR VAR/i);
      if (mVal) {
        const n = parseInt(mVal[1], 10) || 0;
        i++; // se placer sur la première ligne de valeurs

        if (!loadedVarValues) {
          const measuredIdx = genres.length === names.length
            ? genres.map((g, idx) => (g === 0 ? idx : -1)).filter(idx => idx !== -1)
            : names.map((_, idx) => idx);
          const mCount = measuredIdx.length;

          let count = 0;
          while (i < lines.length && count < n) {
            const val = lines[i].trim();
            if (val) {
              const cols = val.split(/\s+/).map(s => Number.parseFloat(String(s).replace(',', '.')));
              if (cols.length === mCount && cols.every(Number.isFinite)) {
                rows.push(cols);
                count++;
              }
            }
            i++;
          }

          loadedVarValues = true;
        } else {
          i += n;
        }
        continue;
      }

      i++;
    }

    if (names.length === 0) throw new Error('No NOM VAR block found'); // garde-fou minimal [attached_file:84]

    // Préparer les en-têtes mesurés uniquement
    const measuredIdx = genres.length === names.length
      ? genres.map((g, idx) => (g === 0 ? idx : -1)).filter(idx => idx !== -1)
      : names.map((_, idx) => idx);

    const headerNames = measuredIdx.map(i => names[i]);
    const headerUnits = (units.length ? measuredIdx.map(i => units[i]) : measuredIdx.map(() => ''));

    // Sérialisation TSV: 2 en-têtes + lignes “mesurées”
    let output = '';
    output += headerNames.join('\t') + '\n';
    output += headerUnits.join('\t') + '\n';
    for (const r of rows) output += r.join('\t') + '\n';

    // lecture des paramètres
    const paramLines = [];
    if (constNames.length) {
      const n = Math.max(constNames.length, constUnits.length, constRawValues.length);
      for (let k = 0; k < n; k++) {
        const name = (constNames[k] || '').trim();
        const unit = (constUnits[k] || '').trim();
        const rawVal = String(constRawValues[k] ?? '').trim();
        if (!name || !rawVal) continue; // on n’écrit que s’il y a une valeur
        const lhs = unit ? `${name}_${unit}` : name;
        paramLines.push(`${lhs} = ${rawVal}`);
      }
    }

    // déplace un suffixe d'unité commun (ex: _J) du membre de droite vers la gauche
function moveUnitSuffixToLHS(line) {
  const t = String(line);
  const s = t.trim();
  if (!s || s.startsWith('#') || s.startsWith('//') || s.startsWith("'")) return t;

  const eq = s.indexOf('=');
  if (eq === -1) return t;

  const lhs = s.slice(0, eq).trim();
  const rhs = s.slice(eq + 1).trim();

  const unitMatches = [...rhs.matchAll(/\b[A-Za-z][\w²]*_([A-Za-zµ°]+)\b/g)];
  if (unitMatches.length === 0) return t;

  // Cette partie de la logique reste INCHANGÉE car m[1] est toujours l'unité
  const suffixes = new Set(unitMatches.map(m => m[1]));
  if (suffixes.size !== 1) return t;
  const unit = [...suffixes][0];
  if (/_([A-Za-zµ°]+)$/.test(lhs)) return t;

  const lhsNew = `${lhs}_${unit}`;

  const rhsNew = rhs.replace(new RegExp(`\\b([A-Za-z][\\w²]*)_${unit}\\b`, 'g'), '$1');
  
  return `${lhsNew} = ${rhsNew}`;
}

    const normalizedMemoLines = memoLines.map(moveUnitSuffixToLHS);

    // remplir l’éditeur avec le MEMO + paramètres
    const memoText = normalizedMemoLines.length ? normalizedMemoLines.join('\n') : '';
    const paramsText = paramLines.length ? paramLines.join('\n') : '';
    const finalText = memoText && paramsText ? `${paramsText}\n\n${memoText}` : (memoText || paramsText);
    if (finalText) this.app.editor.setValue(finalText);

    // Injection des données
    this.loadData(output.trim());

    // Configurer le graphe
    const existingTitles = this.app.data.curves.map(c => c.title);
    const chosenX = graphX.find(t => existingTitles.includes(t)) || existingTitles[0];
    if (chosenX) this.app.grapher.setXCurve(chosenX, false);

    const yNow = graphY.filter(t => existingTitles.includes(t));
    if (yNow.length) this.app.grapher.updateChart(yNow); else this.app.grapher.updateChart();

    // Y à activer plus tard (courbes calculées absentes pour l’instant)
    this.app.pendingRW3 = {
      x: chosenX || null, 
      y: graphY.filter(t => !existingTitles.includes(t))
    };

  }

  /**
   * Charge des données tabulaires depuis une chaîne de texte.
   * @param {string} data - Les données tabulaires (TSV attendu).
   */
  loadData(data) {
    if (this.isLoading) {
      console.warn("Tentative de chargement récursif des données, opération annulée.");
      return;
    }
    this.isLoading = true;

    try {
      const lines = data.trim().split('\n').filter(l => l.trim().length > 0);
      if (lines.length === 0) {
        this.isLoading = false; // S'assurer de réinitialiser le drapeau
        return; // Rien à charger
      }

      // Déterminer le nombre maximum de colonnes dans l'ensemble des données
      const numColumns = lines.reduce((max, line) => Math.max(max, splitFlexible(line).length), 0);
      if (numColumns === 0) {
        this.isLoading = false;
        return;
      }

      let headers;
      let units = undefined;
      let dataLines;

      // Vérifie si la première ligne ressemble à des données (c-à-d, est numérique).
      const firstLineCells = splitFlexible(lines[0]);
      const isFirstLineNumeric = firstLineCells.length > 0 && !isNaN(parseFloat(String(firstLineCells[0]).replace(',', '.').trim()));

      if (isFirstLineNumeric) {
        // Pas de ligne d'en-tête. On génère des en-têtes génériques pour toutes les colonnes.
        headers = Array.from({
          length: numColumns
        }, (_, i) => `Colonne${i + 1}`);
        units = Array(numColumns).fill(""); // Pas d'unités
        dataLines = lines; // Toutes les lignes sont des données
      } else {
        // La ligne d'en-tête existe.
        // On s'assure d'avoir un en-tête pour chaque colonne détectée.
        const rawHeaders = splitFlexible(lines[0]);
        headers = [];
        for (let i = 0; i < numColumns; i++) {
          const h = rawHeaders[i] || ""; // Utilise l'en-tête s'il existe, sinon une chaîne vide
          const trimmedHeader = h.trim();
          headers.push(trimmedHeader === "" ? `Colonne${i + 1}` : trimmedHeader);
        }

        // Vérifie si la deuxième ligne correspond aux unités ou aux données
        if (lines.length > 1) {
          const secondLineCells = splitFlexible(lines[1]);
          const isSecondLineNumeric = secondLineCells.length > 0 && !isNaN(parseFloat(String(secondLineCells[0]).replace(',', '.').trim()));

          if (isSecondLineNumeric) {
            // La deuxième ligne contient des données, donc pas de ligne d'unités
            units = Array(numColumns).fill("");
            dataLines = lines.slice(1);
          } else {
            // La deuxième ligne contient les unités. On s'assure d'en avoir pour chaque colonne.
            const rawUnits = splitFlexible(lines[1]);
            units = Array.from({
              length: numColumns
            }, (_, i) => (rawUnits[i] || "").trim());
            dataLines = lines.slice(2);
          }
        } else {
          // Il n'y a qu'une ligne d'en-tête, pas de données
          dataLines = [];
        }
      }

      // Crée les courbes et les remplit
      const curvesData = headers.map(() => []);

      for (const line of dataLines) {
        const cells = splitFlexible(line);
        for (let i = 0; i < headers.length; i++) {
          const rawValue = cells[i];
          const value = rawValue !== undefined ? parseFloat(String(rawValue).replace(',', '.').trim()) : null;
          curvesData[i].push(isNaN(value) ? null : value);
        }
      }

      // Ajoute les courbes à l'état de l'application
      for (let i = 0; i < headers.length; i++) {
        const curve = this.app.addCurve(headers[i], units ? units[i] : "");

        // Remplacer le contenu de la courbe sans utiliser l'opérateur de décomposition
        // pour éviter les erreurs de "call stack" avec de grands jeux de données.
        curve.length = 0; // Vider le tableau existant
        const dataToAdd = curvesData[i];
        for (let j = 0; j < dataToAdd.length; j++) {
          curve.push(dataToAdd[j]);
        }
      }

      console.log("data loaded", this.app.data);
      this.app.applyCalculation(this.app.editor.getValue()); // Re-applique les calculs
      this.app.spreadsheet.update();
      this.app.grapher.updateChart();
      this.app.uiUpdater.updateCalculationUI();

    } finally {
      this.isLoading = false; // Assure que le drapeau est réinitialisé même en cas d'erreur
    }
  }
}