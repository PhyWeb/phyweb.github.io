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
    this.spreadsheet.addCurve(_title, _unit);

    if(this.data.curves.length === 1){
      this.grapher.setXCurve(_title);
    }

    if(this.data.curves.length === 2){
      this.grapher.updateChart([_title]);
    }
  }

  deleteCurve(_curve){
    // Delete the curve
    this.data.deleteCurve(_curve);

    // Update the graph if needed
    this.grapher.deleteCurve(_curve);

    // Update the spreadsheet
    this.spreadsheet.update();
  }
}

export {App};