import { Serie } from "../../common/common.js";
import { formatUnit } from "../../common/formatter.js";
import { parseCellValue } from "./models/parseCellValue.js";
import { Model } from "./models/model.js";

const COLOR_LIST = ["#2caffe", "#544fc5", "#00e272", "#fe6a35", "#6b8abc", "#d568fb", "#2ee0ca", "#fa4b42", "#feb56a", "#91e8e1"];

const DEFAULT_MARKER = true;
const DEFAULT_LINE = false;
const DEFAULT_LINE_WIDTH = 2;

/*----------------------------------------------------------------------------------------------
-----------------------------------------------Curve--------------------------------------------
----------------------------------------------------------------------------------------------*/

class Curve extends Serie {
  constructor(title, unit, color = "#000000", line = DEFAULT_LINE, markers = DEFAULT_MARKER, lineWidth = DEFAULT_LINE_WIDTH, lineStyle = "Solid", markerSymbol = "circle", markerRadius = 4) {
    super(title, unit);

    this.color = color;
    this.line = line; // Affichage de la ligne reliant les points
    this.markers = markers; // Affichage des marqueurs de points
    this.lineWidth = lineWidth;
    this.lineStyle = lineStyle; // Style de ligne ("solid", "dash", "dot")
    this.markerSymbol = markerSymbol;
    this.markerRadius = markerRadius; // Rayon des marqueurs en pixels
  }
}

/*----------------------------------------------------------------------------------------------
------------------------------------------------Data--------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Data {
  constructor(initialSettings = {}) {
    this.curves = [];
    this.parameters = {}; // Paramètres et constantes
    this.models = []; // Modèles mathématiques
    this.annotations = [];

    this.settings = {
      significantDigits: initialSettings?.significantDigits ?? 4,
    };

    this.lastSortVariable = null; // Dernière variable utilisée pour le tri
    this.lastSortDirection = 'asc'; // Sens du tri ('asc' ou 'desc')
  }

  addCurve(title, unit, size, fill, line, markers, type) {
    // Vérifie si le nom de grandeur est déjà utilisé
    if (this.curves.find(curve => curve.title === title)) {
      return null;
    }

    // Recherche d'une couleur non attribuée (avec repli cyclique si toutes sont déjà utilisées)
    let color = COLOR_LIST.find(color => !this.curves.some(curve => curve.color === color));
    if (!color) {
      color = COLOR_LIST[this.curves.length % COLOR_LIST.length];
    }

    // Création de la grandeur
    let curve = new Curve(title, unit, color, line, markers);
    if (type) {
      curve.type = type;
    }

    if (size !== undefined) {
      curve.init(size, fill);
    }

    this.curves.push(curve);

    return curve;
  }

  deleteCurve(title) {
    // Réinitialise le tri si la grandeur supprimée servait d'axe de tri
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

  async addModel(xName, yName, type) {
    let x = this.getCurveByTitle(xName);
    let y = this.getCurveByTitle(yName);
    let model = new Model(x, y, type, this, y.color, true, 2, "Dash");
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

  getTable() {
    let table = [];

    // Recherche de la série la plus longue
    let size = 0;
    this.curves.forEach((curve) => {
      if (curve.length > size) {
        size = curve.length;
      }
    });

    for (let j = 0; j < size; j++) {
      const row = [];
      for (let i = 0; i < this.curves.length; i++) {
        row[i] = this.curves[i][j] ?? null;
      }
      table.push(row);
    }

    return table;
  }

  getHeaders() {
    let headers = [];

    this.curves.forEach((curve) => {
      const formattedUnit = formatUnit(curve.unit);
      headers.push(formattedUnit ? `${curve.title} (${formattedUnit})` : curve.title);
    });
    return headers;
  }

  setValue(curveIndex, index, value) {
    const curve = this.curves[curveIndex];
    if (!curve || curve.type === 'calculation' || index < 0) return null;
    const parsedValue = parseCellValue(value);
    // Ne pas étendre la série avec des null au-delà de sa longueur actuelle (ex: minSpareRows)
    if (parsedValue === null && index >= curve.length) {
      return null;
    }
    curve[index] = parsedValue;
    return parsedValue;
  }

  getCurveByTitle(title) {
    return this.curves.find(curve => curve.title === title);
  }

  getCurveByIndex(index) {
    return this.curves[index];
  }

  /**
   * Trie toutes les données de courbe en fonction des valeurs d'une variable spécifiée.
   * @param {string} variableTitle - Le titre de la courbe à utiliser pour le tri.
   * @param {'asc'|'desc'} [direction='asc'] - Sens du tri (croissant ou décroissant).
   * @returns {boolean} true si l'ordre des lignes a été modifié, false sinon.
   */
  sortDataBy(variableTitle, direction = 'asc') {
    const sortCurveIndex = this.curves.findIndex(c => c.title === variableTitle);

    if (sortCurveIndex === -1) {
      console.warn(`Curve "${variableTitle}" not found for sorting.`);
      return false;
    }

    const dir = direction === 'desc' ? 'desc' : 'asc';
    this.lastSortVariable = variableTitle;
    this.lastSortDirection = dir;

    // Si la colonne de tri n'est pas déjà la première, on la déplace au début.
    if (sortCurveIndex > 0) {
      const [sortedCurve] = this.curves.splice(sortCurveIndex, 1);
      this.curves.unshift(sortedCurve);
    }

    const sortColumn = this.curves[0];
    const rowCount = this.curves.reduce((max, curve) => Math.max(max, curve.length), 0);
    const indices = Array.from({ length: rowCount }, (_, i) => i);

    indices.sort((indexA, indexB) => {
      const valA = sortColumn[indexA];
      const valB = sortColumn[indexB];

      const aIsNull = valA === null || valA === undefined || valA === '';
      const bIsNull = valB === null || valB === undefined || valB === '';

      if (aIsNull && bIsNull) return 0;
      if (aIsNull) return 1;
      if (bIsNull) return -1;

      const numA = parseCellValue(valA);
      const numB = parseCellValue(valB);

      let cmp;
      if (numA !== null && numB !== null) {
        cmp = numA - numB;
      } else {
        console.warn(`Comparaison non numérique entre "${valA}" et "${valB}". Utilisation du tri lexicographique.`);
        cmp = String(valA).localeCompare(String(valB));
      }

      return dir === 'desc' ? -cmp : cmp;
    });

    const orderChanged = indices.some((origIndex, newIndex) => origIndex !== newIndex);

    this.curves.forEach(curve => {
      while (curve.length < rowCount) {
        curve.push(null);
      }
      const originalValues = [...curve];
      for (let i = 0; i < rowCount; i++) {
        curve[i] = originalValues[indices[i]];
      }
    });

    return orderChanged;
  }

  /**
   * Réinitialise la variable de tri pour permettre un nouveau tri.
   */
  clearSort() {
    this.lastSortVariable = null;
    this.lastSortDirection = 'asc';
  }
}

export { COLOR_LIST, Data, Curve, Model, parseCellValue };
