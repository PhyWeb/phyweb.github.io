import {Serie} from "../../common/common.js"

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
  constructor(x, y, type, data, color, line, lineWidth, lineStyle) {
    this.x = x; // Courbe pour les valeurs x
    this.y = y; // Courbe pour les valeurs y

    this.id = Highcharts.uniqueKey();

    this.data = data; // On stocke l'instance complète de Data

    this.type = type; // Ex: "Linear", "Quadratic"
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

  /*
  * Retourne la fonction mathématique correspondant au type de modèle.
  * @returns {Function}
  * @returns {Function} La fonction mathématique du modèle.
  * ATTENTION : fonction dupliquée dans le worker fitter.worker.js
  */
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
      if (this.minX !== null && xVal < this.minX) {
        continue;
      }
      if (this.maxX !== null && xVal > this.maxX) {
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

  /**
   * Estime des paramètres initiaux basés sur les données pour aider l'algorithme d'ajustement.
   * @param {Array<Array<number>>} data - Les données [x, y].
   * @returns {Array<number>|null} Les paramètres estimés ou null.
   */
  _estimateInitialGuess(data) {
    const n = data.length;
    if (n < 2) return null;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    let minX = data[0][0], maxX = data[0][0];
    let minY = data[0][1], maxY = data[0][1];

    for (let i = 0; i < n; i++) {
      const x = data[i][0];
      const y = data[i][1];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const meanY = sumY / n;

    // Linear regression (y = mx + p)
    const denominator = (n * sumXX - sumX * sumX);
    let slope = 1, intercept = 0;
    if (Math.abs(denominator) > 1e-9) {
        slope = (n * sumXY - sumX * sumY) / denominator;
        intercept = (sumY - slope * sumX) / n;
    }

    switch (this.type) {
      case 'linear': // y = ax
        // a = sum(xy) / sum(xx)
        return [sumXX !== 0 ? sumXY / sumXX : 1];

      case 'affine': // y = ax + b
        return [slope, intercept];

      case 'quadratic': // y = ax^2 + bx + c
        {
            const x1 = data[0][0], y1 = data[0][1];
            const x3 = data[n-1][0], y3 = data[n-1][1];
            const mid = Math.floor(n/2);
            const x2 = data[mid][0], y2 = data[mid][1];
            
            const denom = (x1 - x2) * (x1 - x3) * (x2 - x3);
            if (Math.abs(denom) < 1e-9) return [0, slope, intercept];
            
            const a = (x3 * (y2 - y1) + x2 * (y1 - y3) + x1 * (y3 - y2)) / denom;
            const b = (x3*x3 * (y1 - y2) + x2*x2 * (y3 - y1) + x1*x1 * (y2 - y3)) / denom;
            const c = (x2 * x3 * (x2 - x3) * y1 + x3 * x1 * (x3 - x1) * y2 + x1 * x2 * (x1 - x2) * y3) / denom;
            return [a, b, c];
        }

      case 'power': // y = a*x^b
        {
            let sLnX = 0, sLnY = 0, sLnXLnY = 0, sLnXLnX = 0;
            let count = 0;
            for(let i=0; i<n; i++) {
                if(data[i][0] > 0 && data[i][1] > 0) {
                    const lx = Math.log(data[i][0]);
                    const ly = Math.log(data[i][1]);
                    sLnX += lx; sLnY += ly;
                    sLnXLnY += lx * ly; sLnXLnX += lx * lx;
                    count++;
                }
            }
            if(count < 2) return [1, 1];
            const denomPow = (count * sLnXLnX - sLnX * sLnX);
            if (Math.abs(denomPow) < 1e-9) return [1, 1];
            const b = (count * sLnXLnY - sLnX * sLnY) / denomPow;
            const lnA = (sLnY - b * sLnX) / count;
            return [Math.exp(lnA), b];
        }

      case 'exp1': // y = a*e^(-x/b)
        {
            let sX = 0, sLnY = 0, sXLnY = 0, sXX_exp = 0;
            let count = 0;
            for(let i=0; i<n; i++) {
                if(data[i][1] > 0) {
                    const x = data[i][0];
                    const ly = Math.log(data[i][1]);
                    sX += x; sLnY += ly;
                    sXLnY += x * ly; sXX_exp += x * x;
                    count++;
                }
            }
            if(count < 2) return [1, 1];
            const denomExp = (count * sXX_exp - sX * sX);
            if (Math.abs(denomExp) < 1e-9) return [1, 1];
            const m = (count * sXLnY - sX * sLnY) / denomExp; // m = -1/b
            const interceptExp = (sLnY - m * sX) / count; // ln(a)
            const a = Math.exp(interceptExp);
            const b = Math.abs(m) > 1e-9 ? -1.0 / m : 1;
            return [a, b];
        }
        
      case 'exp2': // y = a*(1 - e^(-x/b))
        {
            const a = maxY > 0 ? maxY * 1.05 : 1;
            let sX = 0, sLnDiff = 0, sXLnDiff = 0, sXX_exp2 = 0;
            let count = 0;
            for(let i=0; i<n; i++) {
                if(a - data[i][1] > 0) {
                    const x = data[i][0];
                    const ldiff = Math.log(a - data[i][1]);
                    sX += x; sLnDiff += ldiff;
                    sXLnDiff += x * ldiff; sXX_exp2 += x * x;
                    count++;
                }
            }
            if(count < 2) return [a, 1];
            const denomExp2 = (count * sXX_exp2 - sX * sX);
            if (Math.abs(denomExp2) < 1e-9) return [a, 1];
            const m = (count * sXLnDiff - sX * sLnDiff) / denomExp2; // m = -1/b
            const b = Math.abs(m) > 1e-9 ? -1.0 / m : 1;
            return [a, b];
        }

      case 'ln': // y = a*ln(x) + b
        {
            let sLnX = 0, sY_ln = 0, sLnXY = 0, sLnXLnX = 0;
            let count = 0;
            for(let i=0; i<n; i++) {
                if(data[i][0] > 0) {
                    const lx = Math.log(data[i][0]);
                    const y = data[i][1];
                    sLnX += lx; sY_ln += y;
                    sLnXY += lx * y; sLnXLnX += lx * lx;
                    count++;
                }
            }
            if(count < 2) return [1, 1];
            const denomLn = (count * sLnXLnX - sLnX * sLnX);
            if (Math.abs(denomLn) < 1e-9) return [1, 1];
            const a = (count * sLnXY - sLnX * sY_ln) / denomLn;
            const b = (sY_ln - a * sLnX) / count;
            return [a, b];
        }

      case 'log': // y = a*log10(x) + b
        {
            let sLogX = 0, sY_log = 0, sLogXY = 0, sLogXLogX = 0;
            let count = 0;
            for(let i=0; i<n; i++) {
                if(data[i][0] > 0) {
                    const lx = Math.log10(data[i][0]);
                    const y = data[i][1];
                    sLogX += lx; sY_log += y;
                    sLogXY += lx * y; sLogXLogX += lx * lx;
                    count++;
                }
            }
            if(count < 2) return [1, 1];
            const denomLog = (count * sLogXLogX - sLogX * sLogX);
            if (Math.abs(denomLog) < 1e-9) return [1, 1];
            const a = (count * sLogXY - sLogX * sY_log) / denomLog;
            const b = (sY_log - a * sLogX) / count;
            return [a, b];
        }

      case 'sin': // y = a*sin(bx+c) + d
      case 'cos': // y = a*cos(bx+c) + d
      case 'dampedsin': // y = a*sin(bx+c)*exp(-x/d) + e
      case 'dampedcos': // y = a*cos(bx+c)*exp(-x/d) + e
        {
            const d = meanY; // offset
            const a = (maxY - minY) / 2; // amplitude
            
            let crossings = 0;
            for(let i=1; i<n; i++) {
                if ((data[i][1] - d) * (data[i-1][1] - d) < 0) {
                    crossings++;
                }
            }
            
            let b = 1;
            if (crossings > 0 && maxX !== minX) {
                b = Math.PI * crossings / (maxX - minX);
            } else if (maxX !== minX) {
                b = Math.PI / (maxX - minX);
            }
            
            const c = 0; // phase

            if (this.type.includes('damped')) {
                const decay = (maxX - minX) || 1;
                return [a, b, c, decay, d];
            } else {
                return [a, b, c, d];
            }
        }

      default:
        return null;
    }
  }

  /**
   * Lance l'ajustement du modèle dans un Web Worker pour ne pas bloquer le thread principal.
   * @returns {Promise<Model>} Une promesse qui se résout avec l'instance du modèle mis à jour.
   */
  fit() {
    return new Promise((resolve, reject) => {
      const data = this._buildData();
      if (data.length < 2) {
        console.error("Pas assez de données valides pour effectuer une modélisation.");
        return reject(new Error("Pas assez de données valides pour effectuer une modélisation."));
      }
      
      // Créer un Web Worker pour l'ajustement
      const worker = new Worker('./modules/fitter.worker.js');

      worker.onmessage = (e) => {
        if (e.data.success) {
          const params = e.data.params;

          // Vider les anciens paramètres du modèle de l'objet global
          this.parameters.forEach(param => {
            delete this.data.parameters[param.name];
          });
          
          // Vide le tableau de paramètres du modèle lui-même
          this.parameters.length = 0;

          const baseNames = ['a', 'b', 'c', 'd', 'e', 'f'];
          params.forEach((paramValue, i) => {
            let baseName = baseNames[i] || `p${i}`;
            let finalName = baseName;
            let counter = 1;
            while (this.data.parameters.hasOwnProperty(finalName) || this.data.curves.some(c => c.title === finalName)) {
              finalName = `${baseName}${counter}`;
              counter++;
            }

            this.parameters.push({ name: finalName, value: paramValue });
            this.data.parameters[finalName] = { value: paramValue, unit: '', type: 'model' };
          });

          console.log("Fitted parameters with names", this.parameters);
          
          this.calculateRMSE();
          this.calculateRSquared(data);
          
          worker.terminate(); // Libérer les ressources du worker
          resolve(this);
        } else {
          console.error("Erreur du Web Worker:", e.data.error);
          worker.terminate();
          reject(new Error(e.data.error));
        }
      };

      worker.onerror = (error) => {
        console.error(`Erreur du Web Worker: ${error.message}`, error);
        worker.terminate();
        reject(error);
      };

      let guessSize = 2;
      if (this.type === 'linear') guessSize = 1;
      if (this.type === 'quadratic') guessSize = 3;
      if (this.type === 'cubic') guessSize = 4;
      if (this.type === 'sin' || this.type === 'cos') guessSize = 4;
      if (this.type === 'dampedsin' || this.type === 'dampedcos') guessSize = 5;
      
      let initialGuess = this._estimateInitialGuess(data);
      
      if (!initialGuess || initialGuess.length !== guessSize || initialGuess.some(v => !isFinite(v))) {
          initialGuess = Array(guessSize).fill(1);
      }

      worker.postMessage({
        data: data,
        modelType: this.type,
        initialGuess: initialGuess
      });
    });
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

  addCurve(title, unit, size, fill, line, markers){
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
    let curve = new Curve(title, unit, color, line, markers);

    if (size !== undefined) {
      curve.init(size, fill);
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
    let model = new Model(x, y, type, this,y.color,true,2,"Dash");
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
      headers.push(curve.unit ? `${curve.title} (${curve.unit})` : curve.title);
    });
    return headers;
  }

  setValue(curveIndex, index, value){
    this.curves[curveIndex][index] = value;
  }

  getCurveByTitle(title){
    return this.curves.find(curve => curve.title === title);
  }

  getCurveByIndex(index) {
    return this.curves[index];
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

export {COLOR_LIST, Data, Curve, Model};