import {Serie} from "../../common/common.js"

const $ = document.querySelector.bind(document);

const COLOR_LIST = [ "#2caffe", "#544fc5", "#00e272", "#fe6a35", "#6b8abc", "#d568fb", "#2ee0ca", "#fa4b42", "#feb56a", "#91e8e1" ]

const DEFAULT_MARKER = true;
const DEFAULT_LINE = false;
const DEFAULT_LINE_WIDTH = 2;

class Curve extends Serie {
  constructor(title, unit, color = "#000000", line = DEFAULT_LINE, markers = DEFAULT_MARKER, lineWidth = DEFAULT_LINE_WIDTH, lineStyle = "Solid", markerSymbol = "circle", markerRadius = 4) {
    super(title, unit);

    this.color = color;
    this.line = line; // true if the curve has a line
    this.markers = markers; // true if the curve has markers
    this.lineWidth = lineWidth;
    this.lineStyle = lineStyle; // "solid", "dash", "dot"
    this.markerSymbol = markerSymbol;
    this.markerRadius = markerRadius; // Radius of the marker in pixels
  }
}

/*----------------------------------------------------------------------------------------------
------------------------------------------------Data--------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Data {
  constructor() {
    this.curves = [];
    this.parameters = []; // For storing parameters (e.g. constants)
  }   

  addCurve(title, unit, size, fill){
    // Check if the title is already used TODO: modal
    if(this.curves.find(curve => curve.title === title)){
      console.error("Curve with title '" + title + "' already exists.");
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
    let curve = new Curve(title, unit, color);

    if(size !== undefined){
      curve.init(size, fill);
    } else{
      curve.init(1, "");
    }

    this.curves.push(curve);

    return curve;
  }

  deleteCurve(title){
    const index = this.curves.findIndex(objet => objet.title === title);
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

  setValue(curveID, index, value){
    this.curves[curveID][index] = value;
  }

  getCurveByTitle(title){
    return this.curves.find(curve => curve.title === title);
  }
}

export {Data};