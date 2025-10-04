import {Serie} from "../../common/common.js"

import {Alglib} from '../../common/alglib/Alglib-v1.1.0.js';

const $ = document.querySelector.bind(document);

const COLOR_LIST = [ "#2caffe", "#544fc5", "#00e272", "#fe6a35", "#6b8abc", "#d568fb", "#2ee0ca", "#fa4b42", "#feb56a", "#91e8e1" ]

const DEFAULT_MARKER = true;
const DEFAULT_LINE = false;
const DEFAULT_LINE_WIDTH = 2;

const DEFAULT_MODEL_RESOLUTION = 400; // Number of points to generate for the model curve

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
  constructor(x, y, type, dataParameters, color, line, lineWidth, lineStyle) {
    this.x = x; // Courbe pour les valeurs x
    this.y = y; // Courbe pour les valeurs y

    this.id = Highcharts.uniqueKey();

    this.dataParameters = dataParameters; // Référence aux paramètres de données (pour ajouter les paramètres du modèle)

    this.type = type; // Ex: "Linear", "Quadratic"
    this.visible = true; // Si le modèle est visible sur le graphe
    this.parameters = []; // Paramètres du modèle (a, b, c...)

    this.rmse = 0; // Ecart quadratique moyen
    this.rSquared = 0; // Coefficient de corrélation

    this.color = color;
    this.line = line;
    this.lineWidth = lineWidth;
    this.lineStyle = lineStyle;

    this.borne_debut = null;
    this.borne_fin = null;
  }

  getEquationString() {
    switch(this.type){
      case "linear":
        // y = a*x
        return `${this.y.title} = ${this.parameters[0].name}·${this.x.title}`;
      case "affine":
        // y = a*x + b
        return `${this.y.title} = ${this.parameters[0].name}·${this.x.title} + ${this.parameters[1].name}`;
      case "quadratic":
        // y = a*x^2 + b*x + c
        return `${this.y.title} = ${this.parameters[0].name}·${this.x.title}² + ${this.parameters[1].name}·${this.x.title} + ${this.parameters[2].name}`;
      case "power":
        // y = a*x^b
        return `${this.y.title} = ${this.parameters[0].name}·${this.x.title}<sup>${this.parameters[1].name}</sup>`;
      case "exp1":
        // y = a*e^(-x/b)
        return `${this.y.title} = ${this.parameters[0].name}·e<sup>-${this.x.title}/${this.parameters[1].name}</sup>`;
      case "exp2":
        // y = a*(1 - e^(-x/b))
        return `${this.y.title} = ${this.parameters[0].name}·(1 - e<sup>-${this.x.title}/${this.parameters[1].name}</sup>)`;
      case "ln":
        // y = a*ln(x) + b
        return `${this.y.title} = ${this.parameters[0].name}·ln(${this.x.title}) + ${this.parameters[1].name}`;
      case "log":
        // y = a*log10(x) + b
        return `${this.y.title} = ${this.parameters[0].name}·log(${this.x.title}) + ${this.parameters[1].name}`;
      case "sin":
        // y = a*sin(b*x + c) + d
        return `${this.y.title} = ${this.parameters[0].name}·sin(${this.parameters[1].name}·${this.x.title} + ${this.parameters[2].name}) + ${this.parameters[3].name}`;
      case "cos":
        // y = a*cos(b*x + c) + d
        return `${this.y.title} = ${this.parameters[0].name}·cos(${this.parameters[1].name}·${this.x.title} + ${this.parameters[2].name}) + ${this.parameters[3].name}`;
      case "dampedsin":
        // y = a*sin(b*x + c)*e^(-x/d) + e
        return `${this.y.title} = ${this.parameters[0].name}·sin(${this.parameters[1].name}·${this.x.title} + ${this.parameters[2].name})·e<sup>-${this.x.title}/${this.parameters[3].name}</sup> + ${this.parameters[4].name}`;
      case "dampedcos":
        // y = a*cos(b*x + c)*e^(-x/d) + e
        return `${this.y.title} = ${this.parameters[0].name}·cos(${this.parameters[1].name}·${this.x.title} + ${this.parameters[2].name})·e<sup>-${this.x.title}/${this.parameters[3].name}</sup> + ${this.parameters[4].name}`;
      default:
        return "Modèle non défini";
    }
  }

  getModelName(){
    switch(this.type){
      case "linear":
        return "Linéaire";
      case "affine":
        return "Affine";
      case "quadratic":
        return "Parabole";
      case "power":
        return "Puissance";
      case "exp1":
        return "Exponentielle 1";
      case "exp2":
        return "Exponentielle 2";
      case "ln":
        return "Logarithme népérien";
      case "log":
        return "Logarithme décimal";
      case "sin":
        return "Sinus";
      case "cos":
        return "Cosinus";
      case "dampedsin":
        return "Sin amorti";
      case "dampedcos":
        return "Cos amorti";
      default:
        return "Modèle inconnu";
    }
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
      case "power":
        // y = a*x^b
        return (a_n, x) => a_n[0] * Math.pow(x, a_n[1]);
      case "exp1":
        // y = a*e^(-x/b)
        return (a_n, x) => a_n[0] * Math.exp(-x / a_n[1]);
      case "exp2":
        // y = a*(1 - e^(-x/b))
        return (a_n, x) => a_n[0] * (1 - Math.exp(-x / a_n[1]));
      case "ln":
        // y = a*ln(x) + b
        return (a_n, x) => a_n[0] * Math.log(x) + a_n[1];
      case "log":
        // y = a*log10(x) + b
        return (a_n, x) => a_n[0] * Math.log10(x) + a_n[1];
      case "sin":
        // y = a*sin(b*x + c) + d
        return (a_n, x) => a_n[0] * Math.sin(a_n[1] * x + a_n[2]) + a_n[3];
      case "cos":
        // y = a*cos(b*x + c) + d
        return (a_n, x) => a_n[0] * Math.cos(a_n[1] * x + a_n[2]) + a_n[3];
      case "dampedsin":
        // y = a*sin(b*x + c)*e^(-x/d) + e
        return (a_n, x) => a_n[0] * Math.sin(a_n[1] * x + a_n[2]) * Math.exp(-x / a_n[3]) + a_n[4];
      case "dampedcos":
        // y = a*cos(b*x + c)*e^(-x/d) + e
        return (a_n, x) => a_n[0] * Math.cos(a_n[1] * x + a_n[2]) * Math.exp(-x / a_n[3]) + a_n[4];
      default:
        return () => 0; // Fonction par défaut
      }
  }

  _buildData(){
    let data = [];
    for(let i = 0; i < this.x.length; i++){
      const xVal = this.x[i];
      const yVal = this.y[i];

      // On ne prend en compte que les points dans les bornes définies
      if (this.borne_debut !== null && xVal < this.borne_debut) {
        continue;
      }
      if (this.borne_fin !== null && xVal > this.borne_fin) {
        continue;
      }

      if (xVal !== null && yVal !== null && xVal !== '' && yVal !== '' && isFinite(xVal) && isFinite(yVal)) {
        data.push([xVal, yVal]);
      }
    }
    return data;
  }

  calculate(x){
    const f = this._getFunction();
    const params = this.parameters.map(p => p.value);
    return f(params, x);
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
    if (this.type === 'quadratic') guess_size = 3;
    if (this.type === 'cubic') guess_size = 4;
    if (this.type === 'sin') guess_size = 4;
    if (this.type === 'cos') guess_size = 4;
    if (this.type === 'dampedsin') guess_size = 5;
    if (this.type === 'dampedcos') guess_size = 5;
    
    solver.solve("min", Array(guess_size).fill(1));
    let params = solver.get_results();

    // Vider les anciens paramètres du modèle de l'objet global
    this.parameters.forEach(param => {
        delete this.dataParameters[param.name];
    });

    // Vide le tableau de paramètres du modèle lui-même
    this.parameters = [];

    const baseNames = ['a', 'b', 'c', 'd', 'e', 'f']; // Pour les 6 premiers paramètres

    params.forEach((paramValue, i) => {
      let baseName = baseNames[i] || `p${i}`; // Utilise a,b,c... ou p_i si plus de 6
      let finalName = baseName;
      let counter = 1;

      // Cherche un nom unique si le nom de base est déjà pris
      while (this.dataParameters.hasOwnProperty(finalName)) {
        finalName = `${baseName}${counter}`;
        counter++;
      }

      this.parameters.push({ name: finalName, value: paramValue });
      this.dataParameters[finalName] = {value:paramValue,unit:"",type:"model"};
    });

    console.log("Fitted parameters with names:", this.parameters);

    this.calculateRMSE(); // Calcule l'écart quadratique moyen
    this.calculateRSquared(data); // Calcule le coefficient de corrélation

    solver.remove();
    return this;
  }

  getHighResData(minX, maxX, points = DEFAULT_MODEL_RESOLUTION){
    const data = [];
    const step = (maxX - minX) / (points - 1);

    switch(this.type){
      case "linear":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0].value * x;
          data.push([x, y]);
        }
        break;
        case "affine":
          for (let i = 0; i < points; i++) {
            const x = minX + i * step;
            const y = this.parameters[0].value * x + this.parameters[1].value;
            data.push([x, y]);
          }
          break;
      case "quadratic":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0].value * Math.pow(x, 2) + this.parameters[1].value * x + this.parameters[2].value;
          data.push([x, y]);
        }
        break;
      case "cubic":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[3].value * Math.pow(x, 3) + this.parameters[2].value * Math.pow(x, 2) + this.parameters[1].value * x + this.parameters[0].value;
          data.push([x, y]);
        }
        break;
      case "power":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0].value * Math.pow(x, this.parameters[1].value);
          data.push([x, y]);
        }
        break;
      case "exp1":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0].value * Math.exp(-x / this.parameters[1].value);
          data.push([x, y]);
        }
        break;
      case "exp2":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0].value * (1 - Math.exp(-x / this.parameters[1].value));
          data.push([x, y]);
        }
        break;
      case "ln":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0].value * Math.log(x) + this.parameters[1].value;
          data.push([x, y]);
        }
        break;
      case "log":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0].value * Math.log10(x) + this.parameters[1].value;
          data.push([x, y]);
        }
        break;
      case "sin":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0].value * Math.sin(this.parameters[1].value * x + this.parameters[2].value) + this.parameters[3].value;
          data.push([x, y]);
        }
        break;
      case "cos":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0].value * Math.cos(this.parameters[1].value * x + this.parameters[2].value) + this.parameters[3].value;
          data.push([x, y]);
        }
        break;
      case "dampedsin":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0].value * Math.sin(this.parameters[1].value * x + this.parameters[2].value) * Math.exp(-x / this.parameters[3].value) + this.parameters[4].value;
          data.push([x, y]);
        }
        break;
      case "dampedcos":
        for (let i = 0; i < points; i++) {
          const x = minX + i * step;
          const y = this.parameters[0].value * Math.cos(this.parameters[1].value * x + this.parameters[2].value) * Math.exp(-x / this.parameters[3].value) + this.parameters[4].value;
          data.push([x, y]);
        }
        break;
      default:
        console.error("Modèle non pris en charge pour la génération de données haute résolution.");
        break;
    }
    
    return data;
  }

  calculateRMSE() {
    if (this.parameters.length === 0) {
      this.rmse = 0;
      return;
    }
    
    const f = this._getFunction();
    let sumOfSquaredErrors = 0;
    let validPointsCount = 0;
    
    for (let i = 0; i < this.x.length; i++) {
      const xVal = this.x[i];
      const yVal = this.y[i];
      
      // On ne calcule l'erreur que pour les points valides
      if (xVal !== null && yVal !== null && isFinite(xVal) && isFinite(yVal)) {
        const predictedY = f(this.parameters.map(p => p.value), xVal);
        const error = yVal - predictedY;
        sumOfSquaredErrors += Math.pow(error, 2);
        validPointsCount++;
      }
    }
    
    const rmseValue = validPointsCount > 0 ? Math.sqrt(sumOfSquaredErrors / validPointsCount) : 0;

    // On vérifie si le résultat est un nombre fini (ni Infinity, ni NaN)
    this.rmse = isFinite(rmseValue) ? rmseValue : null;
  }

  calculateRSquared(data) {
    if (this.parameters.length === 0 || data.length < 2) {
      this.rSquared = 0;
      return;
    }

    const f = this._getFunction();

    // 1. Calculer la moyenne des valeurs y réelles
    const meanY = data.reduce((sum, point) => sum + point[1], 0) / data.length;

    let totalSumOfSquares = 0;
    let residualSumOfSquares = 0;

    for (let i = 0; i < data.length; i++) {
      const xVal = data[i][0];
      const yVal = data[i][1];
      
      // Valeur prédite par le modèle
      const predictedY = f(this.parameters.map(p => p.value), xVal);

      // Calculer la somme totale des carrés (total sum of squares)
      totalSumOfSquares += Math.pow(yVal - meanY, 2);
      
      // Calculer la somme résiduelle des carrés (residual sum of squares)
      residualSumOfSquares += Math.pow(yVal - predictedY, 2);
    }
    
    // Calculer le R²
    let rSquaredValue;
    if (totalSumOfSquares === 0) {
      rSquaredValue = 1; // Si toutes les valeurs y sont identiques, R² est 1
    } else {
      rSquaredValue = 1 - (residualSumOfSquares / totalSumOfSquares);
    }

    // On vérifie si le résultat est un nombre fini
    this.rSquared = isFinite(rSquaredValue) ? rSquaredValue : null;
  }
}

/*----------------------------------------------------------------------------------------------
------------------------------------------------Data--------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Data {
  constructor(initialSettings) {
    this.curves = [];
    this.parameters = {}; // For storing parameters (e.g. constants)

    this.models = []; // For storing models
    this.annotations = [];

    this.settings = {
      significantDigits: initialSettings.significantDigits,
    };

    this.lastSortVariable = null; // Dernière variable utilisée pour le tri
  }

  addCurve(title, unit, size, fill){
    // Check if the title is already used TODO: modal
    if(this.curves.find(curve => curve.title === title)){
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
    // If the deleted curve was the last sort variable, clear the sort
    if (this.lastSortVariable === title) {
      this.clearSort();
    }

    const index = this.curves.findIndex(objet => objet.title === title);
    if (index !== -1) {
      this.curves.splice(index, 1);
    }
  }

  deleteAllCurves() {
    this.curves = [];
    this.clearSort();
  }

  deleteAllParameters() {
    this.parameters = {};
  }

  deleteRow(index, amount = 1) {
    this.curves.forEach(curve => {
      curve.splice(index, amount);
    });
  }

  async addModel(xName, yName, type){
    let x = this.getCurveByTitle(xName);
    let y = this.getCurveByTitle(yName);
    let model = new Model(x, y, type, this.parameters,y.color,true,2,"Dash");
    model.visible = true;
    await model.fit();
    this.models.push(model);
    return model;
  }

  deleteModel(modelID) {
    const index = this.models.findIndex(m => m.id === modelID);
    if (index !== -1) {
      const model = this.models[index];
      
      // Supprime les paramètres du modèle de l'objet parameters
      model.parameters.forEach(param => {
        delete this.parameters[param.name];
      });
      
      this.models.splice(index, 1);
    }
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

  /**
   * Trie toutes les données de courbe en fonction des valeurs d'une variable spécifiée.
   * @param {string} variableTitle - Le titre de la courbe à utiliser pour le tri.
   */
  sortDataBy(variableTitle) {
    const sortCurveIndex = this.curves.findIndex(c => c.title === variableTitle);

    this.lastSortVariable = variableTitle;

    // Si la colonne de tri n'est pas déjà la première, on la déplace au début.
    if (sortCurveIndex > 0) {
      // On retire la grandeur de sa position actuelle pour la remettre en premier.
      const [sortedCurve] = this.curves.splice(sortCurveIndex, 1);
      this.curves.unshift(sortedCurve);
    }

    const sortColumn = this.curves[sortCurveIndex];

    // Trouver le nombre maximum de lignes parmi toutes les courbes
    const rowCount = this.curves.reduce((max, curve) => Math.max(max, curve.length), 0);

    // Créer un tableau d'indices [0, 1, 2, ..., rowCount-1]
    const indices = Array.from({ length: rowCount }, (_, i) => i);

    indices.sort((indexA, indexB) => {
      const valA = sortColumn[indexA];
      const valB = sortColumn[indexB];

      const aIsNull = valA === null || valA === undefined;
      const bIsNull = valB === null || valB === undefined;

      if (aIsNull && bIsNull) return 0;
      if (aIsNull) return 1; // Mettre les nuls à la fin
      if (bIsNull) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return valA - valB; // Tri numérique
      }

      console.warn(`Comparaison non numérique entre "${valA}" et "${valB}". Utilisation du tri lexicographique.`);
      return String(valA).localeCompare(String(valB));
    });

    // Réorganiser les données dans chaque courbe en fonction des indices triés
    this.curves.forEach(curve => {
      // S'assurer que la courbe a la bonne longueur
      while (curve.length < rowCount) {
        curve.push(null);
      }
      const originalValues = [...curve];
      for (let i = 0; i < rowCount; i++) {
        curve[i] = originalValues[indices[i]];
      }
    });
  }

  /**
   * Réinitialise la variable de tri pour permettre un nouveau tri.
   */
  clearSort() {
    this.lastSortVariable = null;
  }

  
}

export {Data, Curve};