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
      newCurve.splice(0, newCurve.length, ...result.data);
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
    let lines = data.trim().split('\n').filter(l => l.trim().length > 0); // ignore les lignes vides

    let headers = splitFlexible(lines[0]).map(h => h.trim());

    // Check if the second line is a number or a string
    let secondLine = splitFlexible(lines[1]);
    let isNumber = !isNaN(secondLine[0].replace(',', '.').trim());

    let units = undefined;
    if (!isNumber) {
      units = secondLine.map(u => u.trim());
      lines.splice(1, 1); // supprime la ligne d’unité
    }

    lines.splice(0, 1); // supprime la ligne d’en-tête

    // Création des courbes
    for (let i = 0; i < headers.length; i++) {
      let curve = this.addCurve(headers[i], units ? units[i] : "");

      for (let j = 0; j < lines.length; j++) {
        let cells = splitFlexible(lines[j]);
        let value = cells[i] !== undefined ? parseFloat(cells[i].replace(',', '.').trim()) : null;
        curve[j] = isNaN(value) ? null : value; // fallback si conversion impossible
      }
    }

    console.log("data loaded", this.data);
    this.spreadsheet.update();
    this.grapher.updateChart();
    // Met à jour la barre latérale de calcul
    window.updateCalculationSidebar();
  }
}
export {App};