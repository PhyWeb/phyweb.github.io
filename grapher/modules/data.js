import {Serie} from "../../common/common.js"

import {Alglib} from 'https://cdn.jsdelivr.net/gh/Pterodactylus/Alglib.js@master/Alglib-v1.1.0.js'

const $ = document.querySelector.bind(document);

const COLOR_LIST = [ "#2caffe", "#544fc5", "#00e272", "#fe6a35", "#6b8abc", "#d568fb", "#2ee0ca", "#fa4b42", "#feb56a", "#91e8e1" ]

const DEFAULT_MARKER = true;
const DEFAULT_LINE = false;
const DEFAULT_LINE_WIDTH = 2;

const DEFAULT_MODEL_RESOLUTION = 200; // Number of points to generate for the model curve

/*----------------------------------------------------------------------------------------------
-----------------------------------------------Curve--------------------------------------------
----------------------------------------------------------------------------------------------*/

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
-----------------------------------------------Model--------------------------------------------
----------------------------------------------------------------------------------------------*/

class Model {
  constructor(x, y, type) {
    this.x = x; // Courbe pour les valeurs x
    this.y = y; // Courbe pour les valeurs y

    this.id = Highcharts.uniqueKey();

    this.type = type; // Ex: "Linear", "Quadratic"
    this.visible = true; // Si le modèle est visible sur le graphe
    this.parameters = []; // Paramètres du modèle (a, b, c...)
  }

  getEquationString() {
    /*if (Object.keys(this.parameters).length === 0) return "Calcul en cours...";
    
    switch(this.type){
      case "Linear":
        // Affiche le signe correctement pour les valeurs négatives
        const sign = this.parameters.b < 0 ? '-' : '+';
        const absB = Math.abs(this.parameters.b);
        return `y = ${this.parameters.a.toPrecision(3)}x ${sign} ${absB.toPrecision(3)}`;
      default:
        return "Modèle non défini";
    }*/
  }

  _getFunction(){
    switch(this.type){
      case "linear":
        // y = a*x
        return (a_n, x) => a_n[0] * x;
      case "affine":
        // y = a*x + b 
        return (a_n, x) => a_n[0] * x + a_n[1];
      case "quadratic":
        // y = a*x^2 + b*x + c
        return (a_n, x) => a_n[0] * Math.pow(x, 2) + a_n[1] * x + a_n[2];
      case "Cubic":
        // y = a*x^3 + b*x^2 + c*x + d
        return (a_n, x) => a_n[0] * Math.pow(x, 3) + a_n[1] * Math.pow(x, 2) + a_n[2] * x + a_n[3];
      case "power":
        // y = a*x^b
        return (a_n, x) => a_n[0] * Math.pow(x, a_n[1]);
      default:
        return () => 0; // Fonction par défaut
      }
  }

  _buildData(){
    let data = [];
    for(let i = 0; i < this.x.length; i++){
      const xVal = this.x[i];
      const yVal = this.y[i];
      if (xVal !== null && yVal !== null && xVal !== '' && yVal !== '' && isFinite(xVal) && isFinite(yVal)) {
        data.push([xVal, yVal]);
      }
    }
    return data;
  }

  async fit(){
    const data = this._buildData();
    if (data.length < 2) { // Il faut au moins 2 points pour une régression
        console.error("Pas assez de données valides pour effectuer une modélisation.");
        return this;
    };

    const f = this._getFunction();

    const fn1 = function(a){
      let sum = 0;
      for (let i = 0; i < data.length; ++i) {
            sum += Math.pow(data[i][1] - f(a, data[i][0]), 2);
        }
        return Math.sqrt(sum);
	}

    let solver = new Alglib();
    solver.add_function(fn1);

    await solver.promise;

    let guess_size = 2;
    if (this.type === 'linear') guess_size = 1;
    if (this.type === 'affine') guess_size = 2;
    if (this.type === 'quadratic') guess_size = 3;
    if (this.type === 'cubic') guess_size = 4;
    if (this.type === 'power') guess_size = 2;
    
    solver.solve("min", Array(guess_size).fill(1));
    let a = solver.get_results();
    console.log("Fitting results:", a);
    
    this.parameters = a;

    solver.remove();
    return this;
  }

  getHighResData(minX, maxX, points = DEFAULT_MODEL_RESOLUTION){ {
    const data = [];
    const step = (maxX - minX) / (points - 1);

    switch(this.type){
      case "linear":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0] * x;
          data.push([x, y]);
        }
        break;
        case "affine":
          for (let i = 0; i < points; i++) {
            const x = minX + i * step;
            const y = this.parameters[0] * x + this.parameters[1];
            data.push([x, y]);
          }
          break;
      case "quadratic":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0] * Math.pow(x, 2) + this.parameters[1] * x + this.parameters[2];
          data.push([x, y]);
        }
        break;
      case "cubic":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[3] * Math.pow(x, 3) + this.parameters[2] * Math.pow(x, 2) + this.parameters[1] * x + this.parameters[0];
          data.push([x, y]);
        }
        break;
      case "power":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0] * Math.pow(x, this.parameters[1]);
          data.push([x, y]);
        }
        break;
      default:
        console.error("Modèle non pris en charge pour la génération de données haute résolution.");
        break;
    }
    
    return data;
  }
}

/*----------------------------------------------------------------------------------------------
------------------------------------------------Data--------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Data {
  constructor() {
    this.curves = [];
    this.parameters = {}; // For storing parameters (e.g. constants)

    this.models = []; // For storing models

    this.settings = {
      significantDigits: 4
    };
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

  deleteAllParameters() {
    this.parameters = {};
  }

  deleteRow(index, amount = 1) {
    this.curves.forEach(curve => {
      curve.splice(index, amount);
    });
  }

  async addModel(x, y, type){
    let datax = this.getCurveByTitle(x);
    let datay = this.getCurveByTitle(y);
    let model = new Model(datax, datay, type);
    model.visible = true;
    await model.fit();
    this.models.push(model);
    return model;
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

export {Data, Curve};