import SymbolValidator from '../symbolValidator.js';
import { parseCellValue } from './parseCellValue.js';
import {
  DEFAULT_MODEL_RESOLUTION,
  SUPPORTED_MODEL_TYPES,
  getModelEquationString,
  getModelFunction,
  getModelName,
  getModelParamCount
} from './modelDefinitions.js';
import { estimateInitialGuess } from './modelInitialGuess.js';

export class Model {
  constructor(x, y, type, data, color, line, lineWidth, lineStyle) {
    this.x = x; // Courbe pour les valeurs x
    this.y = y; // Courbe pour les valeurs y

    this.id = Highcharts.uniqueKey();

    this.data = data; // On stocke l'instance complète de Data

    this.type = type; // Ex: "linear", "quadratic"
    this.visible = true; // Si le modèle est visible sur le graphe
    this.parameters = []; // Paramètres du modèle (a, b, c...)

    this.rmse = 0; // Ecart quadratique moyen
    this.rSquared = 0; // Coefficient de corrélation

    this.color = color;
    this.line = line;
    this.lineWidth = lineWidth;
    this.lineStyle = lineStyle;

    this.minX = null; // Bornes pour le tracé du modèle
    this.maxX = null; // Bornes pour le tracé du modèle
  }

  getEquationString() {
    return getModelEquationString(this.type, this.x.title, this.y.title, this.parameters);
  }

  getModelName() {
    return getModelName(this.type);
  }

  _getFunction() {
    return getModelFunction(this.type);
  }

  _buildData() {
    let data = [];
    for (let i = 0; i < this.x.length; i++) {
      const numX = parseCellValue(this.x[i]);
      const numY = parseCellValue(this.y[i]);

      if (numX === null || numY === null) {
        continue;
      }

      if (this.minX !== null && numX < this.minX) {
        continue;
      }
      if (this.maxX !== null && numX > this.maxX) {
        continue;
      }

      data.push([numX, numY]);
    }
    return data;
  }

  calculate(x) {
    const f = this._getFunction();
    const params = this.parameters.map(p => p.value);
    return f(params, x);
  }

  _estimateInitialGuess(data) {
    return estimateInitialGuess(this.type, data);
  }

  // Application des paramètres ajustés au modèle
  _applyParams(params, data) {
    const canPreserveNames = Array.isArray(this.parameters) &&
      this.parameters.length === params.length &&
      this.parameters.every(p => p && typeof p.name === 'string' && p.name.trim() !== '');

    if (canPreserveNames) {
      params.forEach((paramValue, i) => {
        const paramName = this.parameters[i].name;
        this.parameters[i].value = paramValue;
        const currentUnit = this.parameters[i].unit || (this.data && this.data.parameters && this.data.parameters[paramName]?.unit) || '';
        if (currentUnit) {
          this.parameters[i].unit = currentUnit;
        }
        if (this.data && this.data.parameters) {
          if (this.data.parameters[paramName]) {
            this.data.parameters[paramName].value = paramValue;
          } else {
            this.data.parameters[paramName] = { value: paramValue, unit: currentUnit, type: 'model' };
          }
        }
      });
    } else {
      if (this.data && this.data.parameters) {
        this.parameters.forEach(param => {
          delete this.data.parameters[param.name];
        });
      }
      this.parameters.length = 0;

      const baseNames = ['a', 'b', 'c', 'd', 'k', 'f'];
      params.forEach((paramValue, i) => {
        let baseName = baseNames[i] || `p${i}`;
        let finalName = baseName;
        let counter = 1;
        while (
          SymbolValidator.isReserved(finalName) ||
          (this.data && this.data.parameters && this.data.parameters.hasOwnProperty(finalName)) ||
          (this.data && this.data.curves && this.data.curves.some(c => c.title === finalName))
        ) {
          finalName = `${baseName}${counter}`;
          counter++;
        }
        this.parameters.push({ name: finalName, value: paramValue });
        if (this.data && this.data.parameters) {
          this.data.parameters[finalName] = { value: paramValue, unit: '', type: 'model' };
        }
      });
    }

    this.calculateRMSE(data);
    this.calculateRSquared(data);
  }

  // Ajustement du modèle par régression non linéaire via un Web Worker
  fit() {
    return new Promise((resolve, reject) => {
      if (this.activeWorker) {
        this.stopFit();
      }

      const data = this._buildData();
      if (data.length < 2) {
        return reject(new Error("Pas assez de données valides."));
      }

      const worker = new Worker(new URL('../fitter.worker.js', import.meta.url));
      this.activeWorker = worker;
      this.resolveFit = resolve;

      document.dispatchEvent(new CustomEvent('model-fit-start', { detail: { model: this } }));

      worker.onmessage = (e) => {
        const message = e.data;
        if (message.type === 'partial_update') {
          this.lastPartialParams = message.params;
        } else if (message.type === 'final_result') {
          if (message.success) {
            this._applyParams(message.params, data);
            worker.terminate();
            this.activeWorker = null;
            document.dispatchEvent(new CustomEvent('model-fit-end', { detail: { model: this } }));
            resolve(this);
          } else {
            worker.terminate();
            this.activeWorker = null;
            document.dispatchEvent(new CustomEvent('model-fit-end', { detail: { model: this } }));
            reject(new Error(message.error));
          }
        } else if (message.type === 'error') {
          worker.terminate();
          this.activeWorker = null;
          document.dispatchEvent(new CustomEvent('model-fit-end', { detail: { model: this } }));
          reject(new Error(message.error));
        }
      };

      worker.onerror = (error) => {
        worker.terminate();
        this.activeWorker = null;
        document.dispatchEvent(new CustomEvent('model-fit-end', { detail: { model: this } }));
        reject(error);
      };

      const guessSize = getModelParamCount(this.type);
      let initialGuess = this._estimateInitialGuess(data);
      if (!initialGuess || initialGuess.length !== guessSize || initialGuess.some(v => !isFinite(v))) {
        initialGuess = Array(guessSize).fill(1);
      }

      this.lastPartialParams = [...initialGuess];

      worker.postMessage({
        data: data,
        modelType: this.type,
        initialGuess: initialGuess
      });
    });
  }

  // Interruption du calcul d'ajustement en cours
  stopFit() {
    if (this.activeWorker) {
      this.activeWorker.terminate();
      this.activeWorker = null;

      const data = this._buildData();
      if (this.lastPartialParams) {
        this._applyParams(this.lastPartialParams, data);
      }

      document.dispatchEvent(new CustomEvent('model-fit-end', { detail: { model: this } }));
      if (this.resolveFit) {
        this.resolveFit(this);
      }
    }
  }

  getHighResData(minX, maxX, points = DEFAULT_MODEL_RESOLUTION) {
    if (!Array.isArray(this.parameters) || this.parameters.length === 0) {
      return [];
    }
    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
      return [];
    }
    if (!SUPPORTED_MODEL_TYPES.has(this.type)) {
      console.error("Modèle non pris en charge pour la génération de données haute résolution.");
      return [];
    }

    const data = [];
    points = Math.max(2, points);
    const step = (maxX - minX) / (points - 1);
    const f = this._getFunction();
    const params = this.parameters.map(p => p.value);

    try {
      for (let i = 0; i < points; i++) {
        const x = minX + i * step;
        const y = f(params, x);
        // Highcharts attend null pour les points hors domaine (NaN / ±Infinity)
        data.push([x, Number.isFinite(y) ? y : null]);
      }
      return data;
    } catch {
      return [];
    }
  }

  calculateRMSE(data) {
    if (this.parameters.length === 0) {
      this.rmse = 0;
      return;
    }

    const points = data || this._buildData();

    const f = this._getFunction();
    let sumOfSquaredErrors = 0;
    let validPointsCount = 0;

    for (let i = 0; i < points.length; i++) {
      const xVal = points[i][0];
      const yVal = points[i][1];

      if (xVal !== null && yVal !== null && isFinite(xVal) && isFinite(yVal)) {
        const predictedY = f(this.parameters.map(p => p.value), xVal);
        const error = yVal - predictedY;
        sumOfSquaredErrors += Math.pow(error, 2);
        validPointsCount++;
      }
    }

    const rmseValue = validPointsCount > 0 ? Math.sqrt(sumOfSquaredErrors / validPointsCount) : 0;
    this.rmse = isFinite(rmseValue) ? rmseValue : null;
  }

  calculateRSquared(data) {
    const points = data || this._buildData();
    if (this.parameters.length === 0 || points.length < 2) {
      this.rSquared = 0;
      return;
    }

    const f = this._getFunction();
    const validPoints = points.filter(p => p[0] !== null && p[1] !== null && isFinite(p[0]) && isFinite(p[1]));

    if (validPoints.length < 2) {
      this.rSquared = 0;
      return;
    }

    const meanY = validPoints.reduce((sum, point) => sum + point[1], 0) / validPoints.length;

    let totalSumOfSquares = 0;
    let residualSumOfSquares = 0;

    for (let i = 0; i < validPoints.length; i++) {
      const xVal = validPoints[i][0];
      const yVal = validPoints[i][1];

      const predictedY = f(this.parameters.map(p => p.value), xVal);
      totalSumOfSquares += Math.pow(yVal - meanY, 2);
      residualSumOfSquares += Math.pow(yVal - predictedY, 2);
    }

    let rSquaredValue;
    if (totalSumOfSquares === 0) {
      rSquaredValue = residualSumOfSquares === 0 ? 1 : 0;
    } else {
      rSquaredValue = 1 - (residualSumOfSquares / totalSumOfSquares);
    }

    this.rSquared = isFinite(rSquaredValue) ? rSquaredValue : null;
  }
}

export default Model;
