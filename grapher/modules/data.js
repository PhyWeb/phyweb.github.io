import {Serie} from "../../common/common.js"

const $ = document.querySelector.bind(document);

const COLOR_LIST = [ "#2caffe", "#544fc5", "#00e272", "#fe6a35", "#6b8abc", "#d568fb", "#2ee0ca", "#fa4b42", "#feb56a", "#91e8e1" ]

const DEFAULT_LINE_WIDTH = 2;

class Curve extends Serie {
  constructor(_title, _unit, _color = "#000000", _lineWidth = 1, _lineStyle = "solid", _markerSymbol = "circle", _markerRadius = 4) {
    super(_title, _unit);

    this.color = _color;
    this.lineWidth = _lineWidth;
    this.lineStyle = _lineStyle; // "solid", "dash", "dot"
    this.markerSymbol = _markerSymbol;
    this.markerRadius = _markerRadius; // Radius of the marker in pixels
  }
}

/*----------------------------------------------------------------------------------------------
------------------------------------------------Data--------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Data {
  constructor() {
    this.curves = [];
  }   

  addCurve(_title, _unit, _size, _fill){
    // Check if the title is already used TODO: modal
    if(this.curves.find(curve => curve.title === _title)){
      console.error("Curve with title '" + _title + "' already exists.");
      return null;
    }

    // Find a color not already used
    let color = COLOR_LIST.find(color => !this.curves.some(curve => curve.color === color));
    /*if(!color){
      // If no color is available, use a random color
      color = "#" + Math.floor(Math.random()*16777215).toString(16);
      console.warn("No more colors available, using random color: " + color);
    }*/

    // Create the curve
    let curve = new Curve(_title, _unit, color, DEFAULT_LINE_WIDTH, "Solid");

    if(_size !== undefined){
      curve.init(_size, _fill);
    } else{
      curve.init(1, "");
    }

    this.curves.push(curve);

    return curve;
  }

  deleteCurve(_title){
    const index = this.curves.findIndex(objet => objet.title === _title);
    if (index !== -1) {
      this.curves.splice(index, 1);
    }
  }

  deleteAllCurves() {
    this.curves = [];
  }

  getTable(){
    let table = [];

    // Find the biggest curve
    let size = 0;
    this.curves.forEach((curve, i) => {
      if(curve.length > size){
        size = curve.length;
      }
    });

    this.curves.forEach((curve, i) => {
      curve.forEach((value, j) => {
        if(!table[j]){
          table[j] = [];
        }
        table[j][i] = value;
      });
    });

    return table;
  }

  getHeaders(){
    let headers = [];

    this.curves.forEach((curve, i) => {
      headers.push(curve.title + " (" + curve.unit + ")");
    });
    return headers;
  }

  setValue(_curveID, _index, _value){
    this.curves[_curveID][_index] = _value;
  }

  getCurveByTitle(_title){
    return this.curves.find(curve => curve.title === _title);
  }
}

export {Data};