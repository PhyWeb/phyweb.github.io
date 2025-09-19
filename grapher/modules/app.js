import { Curve } from './data.js';
import { alertModal } from '../../common/common.js';

const $ = document.querySelector.bind(document);

// Utilitaire : split tabulations ou au moins 2 espaces
function splitFlexible(line) {
  return line.trim().split(/\t| {2,}/);
}

function isTabularData(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return false;

  const colCounts = lines.map(line => splitFlexible(line).length);
  const firstCount = colCounts[0];

  const sameCount = colCounts.filter(c => c === firstCount).length;

  return sameCount >= lines.length - 1 && firstCount >= 2;
}

/*----------------------------------------------------------------------------------------------
-------------------------------------------------APP--------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class App {
  constructor(data, spreadsheet, grapher, calculation, editor, uiUpdater) {
    this.data = data;
    this.spreadsheet = spreadsheet;
    this.grapher = grapher;
    this.calculation = calculation;
    this.editor = editor;
    this.uiUpdater = uiUpdater;
  }  

  addCurve(title, unit) {
    let curve = this.spreadsheet.addCurve(title, unit);

    if(this.data.curves.length === 1){
      this.grapher.setXCurve(title);
    }

    if(this.data.curves.length === 2){
      this.grapher.updateChart([title]);
    }

    // Update the calculation tab
    this.uiUpdater.updateCalculationUI();

    return curve;
  }

  deleteCurve(curveTitle){
    // First, find and delete any models dependent on this curve
    const modelsToDelete = this.data.models.filter(model => model.x.title === curveTitle || model.y.title === curveTitle);

    if (modelsToDelete.length > 0) {
      console.log(`Deleting ${modelsToDelete.length} model(s) dependent on curve "${curveTitle}".`);
      modelsToDelete.forEach(model => {
        this.deleteModel(model.id);

        // remove the model's UI panel
        const modelPanel = document.querySelector(`article[data-model-id="${model.id}"]`);
        if (modelPanel) {
          modelPanel.remove();
        }
      });
    }

    // Delete the curve
    this.data.deleteCurve(curveTitle);

    // Update the graph if needed
    this.grapher.deleteCurve(curveTitle);

    // Update the spreadsheet
    this.spreadsheet.update();

    // Update the calculation tab
    this.uiUpdater.updateCalculationUI();
  }

  deleteAllCurves() {
    // Delete all curves
    this.data.deleteAllCurves();
    // Conserver uniquement les paramètres de type 'model'
    const parametersToKeep = {};
    for (const key in this.data.parameters) {
      if (Object.prototype.hasOwnProperty.call(this.data.parameters, key)) {
        const param = this.data.parameters[key];
        if (param && param.type === 'model') {
            parametersToKeep[key] = param;
        }
      }
    }
    this.data.parameters = parametersToKeep;

    // Update the graph
    this.grapher.deleteAllCurves(); 

    $("#auto-zoom-button").click(); // Reset the zoom

    // Update the calculation
    this.calculation.clear();

    // clear the spreadsheet
    this.spreadsheet.clear();

    // Update the calculation tab
    this.uiUpdater.updateCalculationUI();
  }

  deleteRow(startRow, amount) {
    // On vérifie que les arguments sont valides
    if (typeof startRow === 'undefined' || typeof amount === 'undefined' || amount < 1) {
      return;
    }
    
    this.data.deleteRow(startRow, amount);

    this.spreadsheet.update();
    this.grapher.updateChart();
  }

  async addModel(x, y, type) {
    let model = await this.data.addModel(x, y, type);

    if (model) {
      // 1. Crée la série du modèle sans redessiner le graphique
      this.grapher.addModelSeries(model);

      this.grapher.updateModelVisibility();
      
      // 2. Déclenche manuellement UN SEUL redraw.
      // Cet appel va mettre à jour le graphique et l'événement 'redraw'
      // s'assurera que tous les modèles sont correctement tracés.
      this.grapher.chart.redraw();

      // 3. Met à jour l'UI'
      this.uiUpdater.updateCalculationUI();
      this.uiUpdater.updateRecalculateButtonVisibility();

      return model;
    } else {
      alertModal({
        title: "Modélisation impossible",
        body: "Pour créer un modèle, vous devez avoir au moins deux grandeurs dans votre tableur.",
        confirm: "OK"
      });
    }
  }

  /**
   * Recalcule tous les modèles existants.
   */
  async recalculateAllModels() {
    if (this.data.models.length === 0) {
      return;
    }

    try {
      for (const model of this.data.models) {
        // Recalcule les paramètres du modèle
        await model.fit();
         // Met à jour le panneau du modèle avec les nouveaux résultats
        this.uiUpdater.updateModelPanel(model);
      }
      
      // Met à jour la visibilité et redessine le graphique
      this.grapher.updateModelVisibility();
      this.grapher.chart.redraw();
      
      // Met à jour l'interface utilisateur de calcul (pour les paramètres) et ferme la modale
      this.uiUpdater.updateCalculationUI();
      this.uiUpdater.updateRecalculateButtonVisibility();

    } catch (e) {
      console.error("Erreur lors du recalcul des modèles:", e);
      alertModal({
        type: "danger",
        title: "Erreur de recalcul",
        body: "Une erreur est survenue lors du recalcul des modèles. Veuillez vérifier la console pour plus de détails.",
        confirm: "OK"
      });
    }
  }

  deleteModel(modelID) {
    const model = this.data.models.find(m => m.id === modelID);
    if (!model) return;

    // Supprime la série du graphique
    const series = this.grapher.chart.get(`model-${model.id}`);
    if (series) {
      series.remove();
    }

    // Supprime le modèle de l'objet de données
    this.data.deleteModel(modelID);

    // Met à jour l'UI
      this.uiUpdater.updateCalculationUI();
      this.uiUpdater.updateRecalculateButtonVisibility();
  }

  applyCalculation(text) {
    // --- Phase 1: Analyse et Validation ---
    const formulasToEvaluate = [];
    const parsingWarnings = [];

    if (!text || text.trim() === "") {
      this.data.curves = this.data.curves.filter(curve => curve.type !== "calculation");
      // Conserver uniquement les paramètres de type 'model'
      const parametersToKeep = {};
      for (const key in this.data.parameters) {
        if (Object.prototype.hasOwnProperty.call(this.data.parameters, key)) {
          const param = this.data.parameters[key];
          if (param && param.type === 'model') {
              parametersToKeep[key] = param;
          }
        }
      }
      this.data.parameters = parametersToKeep;
      this.spreadsheet.update();
      this.grapher.updateChart();
      this.uiUpdater.updateCalculationUI();
      return;
    }

    const lines = text.trim().split('\n');
    const validSymbolRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/; // Ne commence PAS par un underscore
    const definedInBlock = new Set();
    const rawCurveTitles = this.data.curves.filter(c => c.type !== 'calculation').map(c => c.title);
    const modelParameterNames = Object.keys(this.data.parameters).filter(key => this.data.parameters[key].type === 'model');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (
        trimmedLine === '' ||
        trimmedLine.startsWith('#') ||
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith("'") 
      ) {
        continue;
      }

      const parts = trimmedLine.split('=');
      if (parts.length < 2) {
        parsingWarnings.push(`Syntaxe invalide (ignorée) : "${trimmedLine}"`);
        continue;
      }

      const leftPart = parts[0].trim();
      const expression = parts.slice(1).join('=').trim();
      const leftParts = leftPart.split('_');
      
      const variableName = leftParts[0].trim().replace(/\s+/g, '');
      const unit = leftParts.length > 1 ? leftParts.slice(1).join('_').trim().replace(/\s+/g, '') : '';

      if (!validSymbolRegex.test(variableName)) {
        alertModal({
          title: "Symbole invalide",
          body: `Le symbole "${variableName}" est invalide. Il doit commencer par une lettre et ne peut contenir que des lettres, des chiffres et des underscores.`,
          confirm: "OK"
        });
        return;
      }

      if (modelParameterNames.includes(variableName)) {
        alertModal({
          title: "Conflit de nom",
          body: `Le symbole "${variableName}" est un paramètre de modèle et ne peut pas être redéfini.`,
          confirm: "OK"
        });
        return;
      }

      if (rawCurveTitles.includes(variableName)) {
          alertModal({
              title: "Conflit de nom",
              body: `Le symbole "${variableName}" est déjà utilisé par une grandeur non-calculée et ne peut pas être redéfini ici.`,
              confirm: "OK"
          });
          return;
      }

      if (definedInBlock.has(variableName)) {
          alertModal({
              title: "Symbole dupliqué",
              body: `Le symbole "${variableName}" est défini plusieurs fois dans ce bloc de calcul.`,
              confirm: "OK"
          });
          return;
      }
      definedInBlock.add(variableName);

      formulasToEvaluate.push({ variableName, expression, unit });
    }

    // --- Phase de nettoyage des dépendances ---
    // 1. Identifier les grandeurs calculées qui vont être supprimées
    const newCalculatedTitles = new Set(formulasToEvaluate.map(f => f.variableName));
    const calculatedCurvesToDelete = this.data.curves.filter(
      curve => curve.type === 'calculation' && !newCalculatedTitles.has(curve.title)
    );

    // 2. Si des grandeurs calculées sont supprimées, supprimer les modèles dépendants
    if (calculatedCurvesToDelete.length > 0) {
      calculatedCurvesToDelete.forEach(curve => {
        this.grapher.deleteCurve(curve.title); // Supprime la courbe du graphique
        console.log(`Deleting calculated curve "${curve.title}" as it is no longer defined.`);
        const modelsToDelete = this.data.models.filter(
          model => model.x.title === curve.title || model.y.title === curve.title
        );

        modelsToDelete.forEach(model => {
          console.log(`Deleting model ${model.id} because it depends on the deleted calculated curve "${curve.title}".`);
          // Supprimer le modèle (données et graphique)
          this.deleteModel(model.id);

          // Supprimer le panneau UI du modèle
          const modelPanel = document.querySelector(`article[data-model-id="${model.id}"]`);
          if (modelPanel) {
            modelPanel.remove();
          }
        });
      });
    }

    // --- Phase 2: Exécution (uniquement si toutes les validations sont passées) ---
    this.data.curves = this.data.curves.filter(curve => curve.type !== "calculation");
    // Conserver uniquement les paramètres de type 'model'
    const parametersToKeep = {};
    for (const key in this.data.parameters) {
      if (Object.prototype.hasOwnProperty.call(this.data.parameters, key)) {
        const param = this.data.parameters[key];
        if (param && param.type === 'model') {
            parametersToKeep[key] = param;
        }
      }
    }
    this.data.parameters = parametersToKeep;

    const initialScope = {};
    // Ajoute toutes les courbes au scope
    this.data.curves.forEach(curve => {
      initialScope[curve.title] = curve; 
    });
    // Ajoute tous les paramètres au scope
    for (const key in this.data.parameters) {
        if (Object.prototype.hasOwnProperty.call(this.data.parameters, key)) {
            initialScope[key] = this.data.parameters[key];
        }
    }
    
    const { results, errors } = this.calculation.evaluateBlock(formulasToEvaluate, initialScope);

    // --- Phase 3: Mise à jour des données et de l'interface ---
    results.forEach(result => {
      if (result.type === 'parameter') {
        this.data.parameters[result.variableName] = result.data;
      } else {
        const newCurve = this.addCurve(result.variableName, result.unit);
        newCurve.type = "calculation";
        newCurve.length = 0;
        const dataToAdd = result.data;
        if (dataToAdd) {
            for (let i = 0; i < dataToAdd.length; i++) {
                newCurve.push(dataToAdd[i]);
            }
        }
      }
    });

    const allErrors = [
      ...parsingWarnings,
      ...errors.map(err => `Calcul impossible pour "${err.variableName}": ${err.error}`)
    ];

    if (allErrors.length > 0) {
      console.error("Erreurs de calcul:", allErrors);
      alertModal({
        title: "Erreurs de calcul",
        body: "Certains calculs ont échoué. Voir la console (F12) pour les détails.",
        confirm: "OK"
      });
    }

    this.spreadsheet.update();
    this.grapher.updateChart();
    this.uiUpdater.updateCalculationUI();

    // Si un RW3 a été chargé juste avant, on ajoute les courbes demandées
    if (this._pendingRW3 && Array.isArray(this._pendingRW3.y)) {
      const existing = this.data.curves.map(c => c.title);
      const want = this._pendingRW3.y.filter(t => existing.includes(t));
      if (want.length) {
        const currentList = this.grapher.chart?.series?.map(s => s.name) || [];
        const merged = Array.from(new Set([...currentList, ...want]));
        this.grapher.updateChart(merged);
      }
      this._pendingRW3 = null;
    }
  }

  /**
   * Méthode principale de chargement, modifiée pour gérer .pw
   */
  loadFile(file) {
    // TODO ... avertissement sur les données non sauvegardées ...
    console.log("loadFile", file, "type", file.type);

    this.deleteAllCurves();

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

  loadClipboard(data) {
    // Check if the data is tabular
    if (!isTabularData(data)) {
      alertModal({
        type: "warning",
        title: "Données non tabulaires",
        body: "Les données du presse-papiers ne sont pas au format tabulaire. Veuillez copier des données au format CSV ou similaire.",
        confirm: "OK"
      });
      return;
    }

    // EMPTY DATA
    this.deleteAllCurves();

    this.loadData(data);
  }

  /**
   * Charge et restaure une session depuis un fichier .pw. (Version améliorée)
   * @param {File} file - Le fichier .pw à charger.
   */
  loadPWFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const state = JSON.parse(event.target.result);
        if (state.data && state.data.curves) {
          this.data.curves = state.data.curves.map(c => {
            const newCurve = new Curve(c.title, c.unit);
            Object.assign(newCurve, c);
            if (c.values) {
              c.values.forEach(val => newCurve.push(val));
            }
            return newCurve;
          });
          this.data.parameters = state.data.parameters || {};
        } else {
            throw new Error("Le fichier de session est invalide ou corrompu (données manquantes).");
        }
        if (state.grapher) {
            this.grapher.setGridVisibility(state.grapher.grid);
        }

        this.editor.setValue(text);

        this.spreadsheet.update();
        if (state.grapher && state.grapher.xCurve) {
            this.grapher.setXCurve(state.grapher.xCurve, false);
            this.grapher.updateChart(state.grapher.yCurves);
        } else {
            this.grapher.deleteAllCurves();
            this.grapher.updateChart();
        }
        // Update the calculation tab
        this.uiUpdater.updateCalculationUI();
        console.log("Session .pw restaurée avec succès (les paramètres locaux sont conservés).");
      } catch (e) {
        console.error("ERREUR lors du chargement de la session .pw :", e);
        alertModal({ title: "Erreur de chargement", body: "Le fichier de session est corrompu ou invalide. Vérifiez la console (F12) pour les détails." });
      }
    };
    reader.readAsText(file);
  }

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

  // Charge et parse un fichier Regressi (.rw3), puis injecte les données en TSV dans this.loadData.
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

    // éplace un suffixe d'unité commun (ex: _J) du membre de droite vers la gauche
    function moveUnitSuffixToLHS(line) {
      const t = String(line);
      const s = t.trim();
      if (!s || s.startsWith('#') || s.startsWith('//') || s.startsWith("'")) return t;

      const eq = s.indexOf('=');
      if (eq === -1) return t;

      const lhs = s.slice(0, eq).trim();
      const rhs = s.slice(eq + 1).trim();

      // Cherche des tokens du type nom_unite dans le RHS
      const unitMatches = [...rhs.matchAll(/\b[A-Za-z]\w*_([A-Za-zµ°]+)\b/g)];
      if (unitMatches.length === 0) return t;

      // On n’agit que si un unique suffixe est détecté dans le RHS et que le LHS n’en a pas déjà
      const suffixes = new Set(unitMatches.map(m => m[1]));
      if (suffixes.size !== 1) return t;
      const unit = [...suffixes][0];
      if (/_([A-Za-zµ°]+)$/.test(lhs)) return t;

      const lhsNew = `${lhs}_${unit}`;
      const rhsNew = rhs.replace(new RegExp(`\\b([A-Za-z]\\w*)_${unit}\\b`, 'g'), '$1');
      return `${lhsNew} = ${rhsNew}`;
    }

    const normalizedMemoLines = memoLines.map(moveUnitSuffixToLHS);

    // remplir l’éditeur avec le MEMO + paramètres
    const memoText = normalizedMemoLines.length ? normalizedMemoLines.join('\n') : '';
    const paramsText = paramLines.length ? paramLines.join('\n') : '';
    const finalText = memoText && paramsText ? `${paramsText}\n\n${memoText}` : (memoText || paramsText);
    if (finalText) this.editor.setValue(finalText);

    // Injection des données
    this.loadData(output.trim());

    // Configurer le graphe
    const existingTitles = this.data.curves.map(c => c.title);
    const chosenX = graphX.find(t => existingTitles.includes(t)) || existingTitles[0];
    if (chosenX) this.grapher.setXCurve(chosenX, false);

    const yNow = graphY.filter(t => existingTitles.includes(t));
    if (yNow.length) this.grapher.updateChart(yNow); else this.grapher.updateChart();

    // Y à activer plus tard (courbes calculées absentes pour l’instant)
    this._pendingRW3 = {
      x: chosenX || null, 
      y: graphY.filter(t => !existingTitles.includes(t))
    };

  }

  loadData(data) {
    if (this._isLoading) {
      console.warn("Tentative de chargement récursif des données, opération annulée.");
      return;
    }
    this._isLoading = true;

    try {
      const lines = data.trim().split('\n').filter(l => l.trim().length > 0);
      if (lines.length === 0) {
        this._isLoading = false; // S'assurer de réinitialiser le drapeau
        return; // Rien à charger
      }

      // Déterminer le nombre maximum de colonnes dans l'ensemble des données
      const numColumns = lines.reduce((max, line) => Math.max(max, splitFlexible(line).length), 0);
      if (numColumns === 0) {
        this._isLoading = false;
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
        const curve = this.addCurve(headers[i], units ? units[i] : "");

        // Remplacer le contenu de la courbe sans utiliser l'opérateur de décomposition
        // pour éviter les erreurs de "call stack" avec de grands jeux de données.
        curve.length = 0; // Vider le tableau existant
        const dataToAdd = curvesData[i];
        for (let j = 0; j < dataToAdd.length; j++) {
          curve.push(dataToAdd[j]);
        }
      }

      console.log("data loaded", this.data);
      this.applyCalculation(this.editor.getValue()); // Re-applique les calculs
      this.spreadsheet.update();
      this.grapher.updateChart();
      this.uiUpdater.updateCalculationUI();


    } finally {
      this._isLoading = false; // Assure que le drapeau est réinitialisé même en cas d'erreur
    }
  }

  /**
   * Méthode principale de sauvegarde
   */
  saveFile(fileName, format) {
    let content = '';
    const separator = '\t';

    if (format === 'csv') {
      content = this._generateCSV(separator);
    } else if (format === 'rw3') {
      content = this._generateRW3();
    } else if (format === 'pw') {
      content = this._generatePW(); // Nouvelle méthode
    } else {
      console.error("Format de fichier non supporté:", format);
      return;
    }

    this._triggerDownload(content, fileName);
  }

  /**
   * Génère le contenu JSON pour un fichier de session .pw. (Version améliorée)
   * @returns {string} Le contenu du fichier .pw (chaîne JSON).
   * @private
   */
  _generatePW() {
    const yCurves = this.grapher.chart.series.map(s => s.name);

    const dataToSave = {
      curves: this.data.curves.map(curve => ({
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
      parameters: this.data.parameters
    };

    const state = {
      version: "1.3",
      data: dataToSave,
      calculations: $("#calculation-input").value,
      grapher: {
        xCurve: this.grapher.currentXCurve,
        yCurves: yCurves,
        grid: this.grapher.grid
      }
    };
    
    return JSON.stringify(state, null, 2);
  }

  /**
   * Génère le contenu pour un fichier CSV.
   * @param {string} separator - Le séparateur de colonnes.
   * @returns {string} Le contenu du fichier CSV.
   * @private
   */
  _generateCSV(separator) {
    const headers = this.data.curves.map(c => c.title).join(separator);
    const units = this.data.curves.map(c => c.unit).join(separator);
    const tableData = this.data.getTable();

    const dataRows = tableData.map(row => {
      // Remplace les null/undefined par des chaînes vides et les points par des virgules pour le format FR
      return row.map(cell => (cell === null || cell === undefined) ? '' : String(cell).replace('.', ',')).join(separator);
    }).join('\n');

    return `${headers}\n${units}\n${dataRows}`;
  }

  /**
   * Génère le contenu pour un fichier au format Regressi (.rw3). (Version finale corrigée)
   * @returns {string} Le contenu du fichier .rw3.
   * @private
   */
  _generateRW3() {
    // 1. On ne sélectionne QUE les courbes qui ne sont PAS issues d'un calcul.
    const rawCurves = this.data.curves.filter(c => c.type !== 'calculation');
    
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
    const calculationsText = $("#calculation-input").value;
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
   * @private
   */
  _triggerDownload(content, fileName) {
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
}
export {App};