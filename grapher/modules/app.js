//import {Serie} from "../../common/common.js"

const $ = document.querySelector.bind(document);

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

  loadCSVFile(_file, delimiter = ",") {
    const reader = new FileReader();

    reader.onload = (event) =>{
      const csvText = event.target.result;
      
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(delimiter).map(h => h.trim());

      // Check if the second lines is a number or a string
      const isNumber = !isNaN(lines[1].split(delimiter)[0].trim());
      const units = undefined;
      if (!isNumber) {
        // The file has a unit line
        units = lines[1].split(delimiter).map(u => u.trim());
        // Remove the unit line from the data
        lines.splice(1, 1);
      }

      lines.splice(0, 1); // Remove the header line

      // Initialise un objet avec des tableaux vides pour chaque colonne
      for(let i = 0; i < headers.length; i++) {
        let curve = this.addCurve(headers[i], units ? units[i] : "");
        for(let j = 0; j < lines.length; j++) {
          curve[j] = parseFloat(lines[j].split(delimiter)[i].trim());
        }
      }

      console.log("File loaded", this.data);
      this.spreadsheet.update();
      this.grapher.updateChart();

    };

    reader.readAsText(_file);


  }
}

export {App};