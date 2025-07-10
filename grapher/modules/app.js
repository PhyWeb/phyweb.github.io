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

    return curve;
  }

  deleteCurve(curveTitle){
    // Delete the curve
    this.data.deleteCurve(curveTitle);

    // Update the graph if needed
    this.grapher.deleteCurve(curveTitle);

    // Update the spreadsheet
    this.spreadsheet.update();
  }

  deleteAllCurves() {
    // Delete all curves
    this.data.deleteAllCurves();

    // Update the graph
    this.grapher.deleteAllCurves(); 

    // Update the calculation
    this.calculation.clear();

    // Update the spreadsheet
    this.spreadsheet.update();
  }

  applyCalculation(text) {
    if (!text || text.trim() === "") {
      console.error("No calculation provided");
      return;
    }

    // --- Phase 1: Préparation des données pour le moteur de calcul ---
    
    const initialScope = {};
    this.data.curves.forEach(curve => {
      if (curve.type !== "calculation") {
        // Modification demandée : passer l'objet courbe entier au scope.
        // Math.js est capable de le traiter s'il est array-like.
        initialScope[curve.title] = curve; 
      }
    });

    const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const validIdentifier = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    const formulasToEvaluate = [];

    for (const line of lines) {
      const parts = line.split('=');
      if (parts.length !== 2) {
        console.warn(`Ligne invalide (ignorer) : "${line}"`);
        continue;
      }

      const variableName = parts[0].trim();
      const expression = parts[1].trim();

      if (!validIdentifier.test(variableName)) {
        console.warn(`Nom de variable invalide (ignorer) : "${variableName}"`);
        continue;
      }
      
      formulasToEvaluate.push({ variableName, expression });
    }

    // --- Phase 2: Appel du moteur de calcul ---

    const { results, errors } = this.calculation.evaluateBlock(formulasToEvaluate, initialScope);

    // --- Phase 3: Mise à jour de l'application avec les résultats ---

    results.forEach(result => {
      const existingCurve = this.data.getCurveByTitle(result.variableName);
      if (existingCurve) {
        existingCurve.splice(0, existingCurve.length, ...result.data);
      } else {
        const newCurve = this.addCurve(result.variableName, "");
        newCurve.type = "calculation";
        newCurve.splice(0, newCurve.length, ...result.data);
      }
    });

    if (errors.length > 0) {
      errors.forEach(calc => {
        console.error(`Impossible de calculer "${calc.variableName} = ${calc.expression}". Vérifiez les dépendances circulaires ou les variables manquantes.`);
      });
    }

    // Mettre à jour le graphique et le tableur une seule fois à la fin
    this.spreadsheet.update();
    this.grapher.updateChart();
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

      console.log("RW3 data parsed:\n" + output);

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
  }
}
export {App};