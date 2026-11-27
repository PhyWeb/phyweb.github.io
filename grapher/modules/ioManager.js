import {
  sanitizeSymbol,
  sanitizeUnit,
  updateFormulasReferences,
  updateFormulaUnit
} from './io/formulaUtils.js';
import {
  splitFlexible,
  isTabularData,
  isNumeric,
  isLineNumeric,
  generateCSV,
  parseCSVFileToTSV
} from './io/csvCodec.js';
import {
  generatePW,
  parsePWInput,
  validatePWState,
  restorePWState
} from './io/pwCodec.js';
import {
  generateRW3,
  parseRW3Buffer
} from './io/rw3Codec.js';
import { parseCellValue } from './models/parseCellValue.js';

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
   * @param {object} [options] - Options d'export (ex: { unitFormat: 'row'|'parentheses'|'none' }).
   */
  saveFile(fileName, format, options = {}) {
    let content = '';
    const separator = ';';
    let mimeType = 'text/plain;charset=utf-8';

    if (format === 'csv') {
      const unitFormat = options.unitFormat
        ?? (typeof document !== 'undefined' ? document.querySelector("#csv-unit-format-select")?.value : undefined)
        ?? 'row';
      content = this.generateCSV(separator, unitFormat);
      mimeType = 'text/csv;charset=utf-8';
    } else if (format === 'rw3') {
      content = this.generateRW3();
      mimeType = 'text/plain;charset=utf-8';
    } else if (format === 'pw') {
      content = this.generatePW();
      mimeType = 'application/json;charset=utf-8';
    } else {
      console.error("Format de fichier non supporté:", format);
      return;
    }

    this.triggerDownload(content, fileName, mimeType);
  }

  /**
   * Génère le contenu JSON pour un fichier de session .pw (version 3.0).
   * @returns {string}
   */
  generatePW() {
    return generatePW(this.app);
  }

  /**
   * Génère le contenu pour un fichier CSV.
   * @param {string} separator - Le séparateur de colonnes.
   * @param {'row'|'parentheses'|'none'} [unitFormat='row']
   * @returns {string}
   */
  generateCSV(separator, unitFormat = 'row') {
    return generateCSV(this.app.data, separator, unitFormat);
  }

  /**
   * Génère le contenu pour un fichier au format Regressi (.rw3).
   * @returns {string}
   */
  generateRW3() {
    return generateRW3(this.app);
  }

  /**
   * Crée un lien de téléchargement et le clique pour télécharger le contenu.
   * @param {string} content - Le contenu du fichier.
   * @param {string} fileName - Le nom du fichier.
   * @param {string} [mimeType='text/plain;charset=utf-8'] - Le type MIME du fichier.
   */
  triggerDownload(content, fileName, mimeType = 'text/plain;charset=utf-8') {
    // Le BOM UTF-8 (\uFEFF) n'est nécessaire que pour les fichiers CSV afin qu'Excel sous Windows reconnaisse l'encodage UTF-8.
    // Pour les fichiers JSON (.pw), le BOM est interdit par la RFC 8259 et cause des SyntaxError lors de JSON.parse.
    const isCsv = fileName.toLowerCase().endsWith('.csv');
    const blobParts = isCsv ? ['\uFEFF', content] : [content];
    const blob = new Blob(blobParts, { type: mimeType });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // --- Méthodes de Chargement / Import ---

  /**
   * Méthode principale de chargement
   */
  async loadFile(file) {
    const fileName = (file?.name || "").toLowerCase();
    const fileType = (file?.type || "").toLowerCase();

    if (fileName.endsWith(".pw")) {
      await this.loadPWFile(file);
    } else if (
      fileName.endsWith(".csv") ||
      fileType === "text/csv" ||
      fileType === "application/vnd.ms-excel" ||
      fileType === "text/x-csv" ||
      fileType === "application/csv"
    ) {
      await this.loadCSVFile(file);
    } else if (fileName.endsWith(".rw3")) {
      await this.loadRW3File(file);
    } else {
      throw new Error(`Le type de fichier "${file?.name}" n'est pas supporté.`);
    }
  }

  /**
   * Charge des données tabulaires depuis le presse-papiers.
   * @param {string} data - Les données copiées (texte brut).
   */
  loadClipboard(data) {
    if (!isTabularData(data)) {
      throw new Error("Les données du presse-papiers ne sont pas au format tabulaire.");
    }

    this.app.resetSession?.();
    this.loadData(data);
  }

  /**
   * @private
   */
  _parsePWInput(pwInput) {
    return parsePWInput(pwInput);
  }

  /**
   * @private
   */
  _validatePWState(state) {
    return validatePWState(state);
  }

  /**
   * Valide un état .pw, réinitialise la session puis restaure les données.
   * @private
   */
  async _applyValidatedPWState(state) {
    this._validatePWState(state);
    this.app.resetSession?.();
    await this._processPWState(state);
  }

  /**
   * Restaure l'état complet de l'application depuis un objet .pw validé.
   * @private
   */
  async _processPWState(state) {
    this._validatePWState(state);
    await restorePWState(this.app, state);
  }

  /**
   * Charge un fichier .pw en le lisant et en restaurant son état.
   * @param {File} file
   * @returns {Promise<void>}
   */
  async loadPWFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const state = this._parsePWInput(event?.target?.result);
          await this._applyValidatedPWState(state);
          resolve();
        } catch (e) {
          console.error(`Erreur lors du chargement du fichier .pw :`, e);
          reject(new Error("Le fichier de session est corrompu ou invalide."));
        }
      };
      reader.onerror = () => {
        reject(new Error("Impossible de lire le fichier."));
      };
      reader.readAsText(file);
    });
  }

  /**
   * Charge une session depuis une chaîne .pw (ex. sessionStorage).
   * @param {string} pwDataString
   * @returns {Promise<void>}
   */
  async loadPWFromString(pwDataString) {
    try {
      const state = this._parsePWInput(pwDataString);
      await this._applyValidatedPWState(state);
    } catch (e) {
      console.error("Erreur lors du chargement des données PW depuis la chaîne de caractères :", e);
      throw new Error("Les données de session sont corrompues ou invalides.");
    }
  }

  /**
   * Charge des données tabulaires depuis un fichier CSV.
   * @param {File} file
   */
  async loadCSVFile(file) {
    const toTSV = await parseCSVFileToTSV(file);
    try {
      this.app.resetSession?.();
      this.loadData(toTSV);
    } catch (e) {
      console.error(e);
      throw new Error("Erreur lors de l'injection des données CSV.");
    }
  }

  /**
   * Charge et restaure une "session" depuis un fichier .rw3.
   * @param {File} file
   */
  async loadRW3File(file) {
    try {
      const buf = await file.arrayBuffer();
      const { tsvOutput, finalText, graphX, graphY, nameMap } = parseRW3Buffer(buf);

      // Réinitialiser la session uniquement après lecture et validation complètes du fichier
      this.app.resetSession?.();

      if (finalText) {
        this.app.editor.setValue(finalText.endsWith('\n') ? finalText : finalText + '\n');
      }

      this.loadData(tsvOutput);

      // Configurer le graphe
      const cleanGraphX = graphX.map(t => nameMap[t] || t);
      const cleanGraphY = graphY.map(t => nameMap[t] || t);

      const existingTitles = this.app.data.curves.map(c => c.title);
      const chosenX = cleanGraphX.find(t => existingTitles.includes(t)) || existingTitles[0];
      if (chosenX) this.app.grapher.setXCurve(chosenX, false);

      const yNow = cleanGraphY.filter(t => existingTitles.includes(t));
      this.app.grapher.updateChart();
      this.app.grapher.reorderLegendByVisibility();
      if (yNow.length) this.app.grapher.setVisibilityFromList(yNow);

      // Y à activer plus tard (courbes calculées absentes pour l'instant)
      this.app.pendingRW3 = {
        x: chosenX || null,
        y: cleanGraphY.filter(t => !existingTitles.includes(t))
      };
    } catch (error) {
      throw new Error(`Le fichier RW3 ne peut pas être lu : ${error}`);
    }
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
      const lines = data.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length === 0) {
        this.isLoading = false;
        return;
      }

      const delimiter = data.includes('\t') ? '\t' : undefined;
      const numColumns = lines.reduce((max, line) => Math.max(max, splitFlexible(line, delimiter).length), 0);
      if (numColumns === 0) {
        this.isLoading = false;
        return;
      }

      let headers;
      let units = undefined;
      let dataLines;

      const firstLineCells = splitFlexible(lines[0], delimiter);
      const isFirstLineNumeric = isLineNumeric(firstLineCells);

      if (isFirstLineNumeric) {
        headers = Array.from({ length: numColumns }, (_, i) => `Colonne${i + 1}`);
        units = Array(numColumns).fill("");
        dataLines = lines;
      } else {
        const rawHeaders = splitFlexible(lines[0], delimiter);
        const extractedTitles = [];
        const extractedUnits = [];

        for (let i = 0; i < numColumns; i++) {
          const h = rawHeaders[i] || "";
          const trimmedHeader = h.trim();
          if (trimmedHeader === "") {
            extractedTitles.push(`Colonne${i + 1}`);
            extractedUnits.push("");
          } else {
            const unitMatch = trimmedHeader.match(/^(.+?)\s*[\(\[]([^\)\]]+)[\)\]]$/);
            if (unitMatch) {
              extractedTitles.push(unitMatch[1].trim());
              extractedUnits.push(sanitizeUnit(unitMatch[2]));
            } else {
              extractedTitles.push(trimmedHeader);
              extractedUnits.push("");
            }
          }
        }

        if (lines.length > 1) {
          const secondLineCells = splitFlexible(lines[1], delimiter);
          const isSecondLineNumeric = isLineNumeric(secondLineCells);

          if (isSecondLineNumeric) {
            units = extractedUnits;
            dataLines = lines.slice(1);
          } else {
            const rawUnits = splitFlexible(lines[1], delimiter);
            units = Array.from({ length: numColumns }, (_, i) => sanitizeUnit(rawUnits[i]) || extractedUnits[i] || "");
            dataLines = lines.slice(2);
          }
        } else {
          units = extractedUnits;
          dataLines = [];
        }

        const existingSymbols = new Set(Object.keys(this.app.data.parameters));
        headers = extractedTitles.map(h => sanitizeSymbol(h, existingSymbols));
      }

      const curvesData = headers.map(() => []);

      for (const line of dataLines) {
        const cells = splitFlexible(line, delimiter);
        for (let i = 0; i < headers.length; i++) {
          curvesData[i].push(parseCellValue(cells[i]));
        }
      }

      const PERFORMANCE_THRESHOLD = Infinity;
      for (let i = 0; i < headers.length; i++) {
        const dataToAdd = curvesData[i];

        let curve;
        if (dataToAdd.length > PERFORMANCE_THRESHOLD) {
          curve = this.app.addCurve(headers[i], units ? units[i] : undefined, true, false);
        } else {
          curve = this.app.addCurve(headers[i], units ? units[i] : undefined);
        }

        for (let j = 0; j < dataToAdd.length; j++) {
          curve.push(dataToAdd[j]);
        }
      }

      console.log("data loaded", this.app.data);
      this.app.applyCalculation(this.app.editor.getValue());
      this.app.spreadsheet.focusFirstCell(false);
      this.app.spreadsheet.update();
      this.app.grapher.updateChart();
      this.app.grapher.reorderLegendByVisibility();

      this.app.grapher.chart.xAxis[0].setExtremes(null, null);
      this.app.grapher.chart.yAxis[0].setExtremes(null, null);

      this.app.uiManager.updateCalculationUI();
      this.app.uiManager.updateSortUI();
      this.app.uiManager.updateXAxisSelector();
    } finally {
      this.isLoading = false;
    }
  }
}

export { isNumeric, isLineNumeric, sanitizeSymbol, sanitizeUnit, splitFlexible, isTabularData, updateFormulasReferences, updateFormulaUnit };
