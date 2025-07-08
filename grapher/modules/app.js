//import {Serie} from "../../common/common.js"

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
  constructor(_data, _spreadsheet, _grapher) {
    this.data = _data;
    this.spreadsheet = _spreadsheet;
    this.grapher = _grapher;

  }   

  addCurve(_title, _unit) {
    let curve = this.spreadsheet.addCurve(_title, _unit);

    if(this.data.curves.length === 1){
      this.grapher.setXCurve(_title);
    }

    if(this.data.curves.length === 2){
      this.grapher.updateChart([_title]);
    }

    return curve;
  }

  deleteCurve(_curve){
    // Delete the curve
    this.data.deleteCurve(_curve);

    // Update the graph if needed
    this.grapher.deleteCurve(_curve);

    // Update the spreadsheet
    this.spreadsheet.update();
  }

  deleteAllCurves() {
    // Delete all curves
    this.data.deleteAllCurves();

    // Update the graph
    this.grapher.deleteAllCurves(); 

    // Update the spreadsheet
    this.spreadsheet.update();
  }

  loadFile(_file) {
    // TODO: warining if unsaved data
    console.log("loadFile", _file, "type", _file.type);

    // EMPTY DATA
    this.deleteAllCurves();

    if(_file.type === "text/csv" || _file.type === "video/m4v"){
      this.loadCSVFile(_file);
      return;
    }

    console.error("Unsupported file type");

  }

  loadClipboard(_data) {
    // Check if the data is tabular
    if (!isTabularData(_data)) {
      console.error("Clipboard data is not tabular");
      return;
    }

    // EMPTY DATA
    this.deleteAllCurves();

    this.loadData(_data, "\t");
  }

  loadCSVFile(_file) {
    const reader = new FileReader();

    reader.onload = (event) =>{
      let data = event.target.result;
      // Remplacer toutes les virgules par des tabulations
      data = data.replace(/,/g, '\t');
      // Remplacer tous les points-virgules par des tabulations
      data = data.replace(/;/g, '\t');
      this.loadData(data);
    };

    reader.readAsText(_file);
  }

  loadData(_data) {
    let lines = _data.trim().split('\n').filter(l => l.trim().length > 0); // ignore les lignes vides

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