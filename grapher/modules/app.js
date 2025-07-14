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
  constructor(data, spreadsheet, grapher, calculation) {
    this.data = data;
    this.spreadsheet = spreadsheet;
    this.grapher = grapher;
    this.calculation = calculation;
  }   

  addCurve(title, unit) {
    let curve = this.spreadsheet.addCurve(title, unit);

    if(this.data.curves.length === 1){
      this.grapher.setXCurve(title);
    }

    if(this.data.curves.length === 2){
      this.grapher.updateChart([title]);
    }

    // Update the sidebar
    window.updateCalculationSidebar();

    return curve;
  }

  deleteCurve(curveTitle){
    // Delete the curve
    this.data.deleteCurve(curveTitle);

    // Update the graph if needed
    this.grapher.deleteCurve(curveTitle);

    // Update the spreadsheet
    this.spreadsheet.update();

    // Update the sidebar
    window.updateCalculationSidebar();
  }

  deleteAllCurves() {
    // Delete all curves
    this.data.deleteAllCurves();
    this.data.deleteAllParameters();

    // Update the graph
    this.grapher.deleteAllCurves(); 

    // Update the calculation
    this.calculation.clear();

    // Update the spreadsheet
    this.spreadsheet.update();

    // Update the sidebar
    window.updateCalculationSidebar();
  }

  applyCalculation(text) {
  // --- Phase 1: Nettoyage et Préparation ---
  this.data.curves = this.data.curves.filter(curve => curve.type !== "calculation");
  this.data.parameters = {};

  const formulasToEvaluate = [];
  const parsingWarnings = [];

  if (!text || text.trim() === "") {
    this.spreadsheet.update();
    this.grapher.updateChart();
    window.updateCalculationSidebar();
    return;
  }

  // --- NOUVEAU : Logique de parsing pour le format variable_unité = expression ---
  const lines = text.trim().split('\n');
  const validIdentifier = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === '' || trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
      continue;
    }

    const parts = trimmedLine.split('=');
    if (parts.length !== 2) {
      parsingWarnings.push(`Syntaxe invalide (ignorer) : "${trimmedLine}"`);
      continue;
    }

    const leftPart = parts[0].trim();
    const expression = parts[1].trim();

    // Sépare le nom de la variable et l'unité
    const leftParts = leftPart.split('_');
    const variableName = leftParts[0];
    const unit = leftParts.length > 1 ? leftParts.slice(1).join('_') : '';

    if (!validIdentifier.test(variableName)) {
      parsingWarnings.push(`Nom de variable invalide : "${variableName}"`);
      continue;
    }
    
    formulasToEvaluate.push({ variableName, expression, unit });
  }

  // --- Phase 2: Exécution des calculs ---
  const initialScope = {};
  this.data.curves.forEach(curve => {
    initialScope[curve.title] = curve; 
  });
  for(const key in this.data.parameters) {
    initialScope[key] = this.data.parameters[key];
  }

  const { results, errors } = this.calculation.evaluateBlock(formulasToEvaluate, initialScope);

  // --- Phase 3: Mise à jour des données et de l'interface ---
  results.forEach(result => {
    if (result.type === 'parameter') {
      this.data.parameters[result.variableName] = result.data;
    } else {
      const newCurve = this.addCurve(result.variableName, result.unit);
      newCurve.type = "calculation";
      newCurve.length = 0; // Vider le tableau
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
    alert("Certains calculs ont échoué. Voir la console pour les détails.");
  }

  this.spreadsheet.update();
  this.grapher.updateChart();
  window.updateCalculationSidebar();
}

  loadFile(file) {
    // TODO: warining if unsaved data
    console.log("loadFile", file, "type", file.type);

    // EMPTY DATA
    this.deleteAllCurves();

    if(file.type === "text/csv"){
      this.loadCSVFile(file);
      return;
    }

    if (file.name.endsWith(".rw3")) {
      this.loadRW3File(file);
      return;
    }

    console.error("Unsupported file type");

  }

  loadClipboard(data) {
    // Check if the data is tabular
    if (!isTabularData(data)) {
      console.error("Clipboard data is not tabular");
      return;
    }

    // EMPTY DATA
    this.deleteAllCurves();

    this.loadData(data);
  }

  loadCSVFile(file) {
    const reader = new FileReader();

    reader.onload = (event) =>{
      let data = event.target.result;
      // Remplacer toutes les virgules par des tabulations
      data = data.replace(/,/g, '\t');
      // Remplacer tous les points-virgules par des tabulations
      data = data.replace(/;/g, '\t');
      this.loadData(data);
    };

    reader.readAsText(file);
  }

  loadRW3File(file) {
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const lines = data.split(/\r?\n/);

      let names = [];
      let units = [];
      let values = [];

      let i = 0;
      let expectedRows = 0;

      while (i < lines.length) {
        const line = lines[i].trim();

        // Lire les noms de variables
        if (line.startsWith("£") && line.includes("NOM VAR")) {
          const count = parseInt(line.match(/£(\d+)/)?.[1]);
          i++;
          for (let j = 0; j < count && i < lines.length; j++, i++) {
            names.push(lines[i].trim());
          }
          continue;
        }

        // Lire les unités
        if (line.startsWith("£") && line.includes("UNITE VAR")) {
          const count = parseInt(line.match(/£(\d+)/)?.[1]);
          i++;
          for (let j = 0; j < count && i < lines.length; j++, i++) {
            units.push(lines[i].trim());
          }
          continue;
        }

        // Lire les valeurs
        if (line.startsWith("&") && line.includes("VALEUR VAR")) {
          expectedRows = parseInt(line.match(/&(\d+)/)?.[1]) || 0;
          i++;
          let rowCount = 0;
          while (i < lines.length && rowCount < expectedRows) {
            const valLine = lines[i].trim();
            if (valLine !== "") {
              const nums = valLine.split(/\s+/).map(parseFloat);
              if (nums.length === names.length) {
                values.push(nums);
                rowCount++;
              } else {
                console.warn(`Ligne ignorée (attendues: ${names.length}, trouvées: ${nums.length}) :`, valLine);
              }
            }
            i++;
          }
          break;
        }

        i++;
      }

      // Construction du texte tabulé
      let output = '';
      output += names.join('\t') + '\n';
      output += units.join('\t') + '\n';
      values.forEach(row => {
        output += row.join('\t') + '\n';
      });

      this.loadData(output.trim());
    };

    reader.readAsText(file);
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
      this.spreadsheet.update();
      this.grapher.updateChart();
      window.updateCalculationSidebar();
    } finally {
      this._isLoading = false; // Assure que le drapeau est réinitialisé même en cas d'erreur
    }
  }
}
export {App};