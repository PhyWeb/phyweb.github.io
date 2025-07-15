const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
--------------------------------------------Calculation-----------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Calculation {
  /**
   * @param {object} data - L'objet de données contenant les courbes. Ex: { curves: [{ title: 'x', values: [1,2,3] }] }
   */
  constructor(data) {
    this.data = data;
    
    this.scalarFunctions = [
      'sqrt', 'cbrt', 'abs', 'exp', 'log', 'log10', 'log2', 'round', 'floor', 'ceil',
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
      'asinh', 'acosh', 'atanh'
      // Note: min et max ne sont pas inclus ici car ils peuvent prendre plusieurs arguments.
      // Leur redéfinition pour un comportement élément par élément est plus complexe.
    ];

    this.derivatePoints = 5; // Nombre de points pour la dérivation
    this.derivateEdges = true; // Calculer les bords ou non
    
    // Créer une instance de math.js pré-configurée pour gérer les opérations sur les tableaux.
    this.mathInstance = this.createConfiguredMathInstance();
  }

  /**
   * Crée et configure une instance de math.js en utilisant math.typed pour la robustesse.
   * Cette méthode garantit que les fonctions scalaires et la puissance s'appliquent
   * élément par élément lorsqu'elles reçoivent un tableau/une matrice.
   * @returns {object} Une instance de math.js configurée.
   */
  createConfiguredMathInstance() {
    const mathInstance = math.create(math.all);

    // Redéfinir les fonctions scalaires pour qu'elles fonctionnent sur les tableaux
    this.scalarFunctions.forEach(name => {
      const originalFn = mathInstance[name];
      if (typeof originalFn !== 'function') return;

      const typedFn = mathInstance.typed(name, {
        'Array | Matrix': function(x) {
          return mathInstance.map(x, val => (val === null ? null : originalFn(val)));
        },
        // Comportement par défaut pour les autres types (nombres, etc.)
        'any': function(x) {
          return originalFn(x);
        }
      });
      
      mathInstance.import({ [name]: typedFn }, { override: true });
    });

    // Rendre les opérateurs arithmétiques "null-aware"
    const configureOperator = (name, operation) => {
      const originalFunc = mathInstance[name];
      const typedFunc = mathInstance.typed(name, {
        'Array | Matrix, Array | Matrix': (a, b) => mathInstance.map(a, b, (valA, valB) => (valA === null || valB === null) ? null : operation(valA, valB)),
        'Array | Matrix, any': (a, b) => mathInstance.map(a, valA => (valA === null) ? null : operation(valA, b)),
        'any, Array | Matrix': (a, b) => mathInstance.map(b, valB => (valB === null) ? null : operation(a, valB)),
        'any, any': (a, b) => originalFunc(a, b)
      });
      mathInstance.import({ [name]: typedFunc }, { override: true });
    };

    configureOperator('add', (a, b) => a + b);
    configureOperator('subtract', (a, b) => a - b);
    configureOperator('multiply', (a, b) => a * b);
    configureOperator('divide', (a, b) => a / b);

    // Redéfinir la fonction de puissance (pour l'opérateur ^)
    const originalPow = mathInstance.pow;
    const typedPow = mathInstance.typed('pow', {
      'Array | Matrix, any': function(base, exponent) {
        return mathInstance.map(base, (b) => (b === null) ? null : originalPow(b, exponent));
      },
      'any, any': function(base, exponent) {
        return originalPow(base, exponent);
      }
    });
    mathInstance.import({ pow: typedPow }, { override: true });


    // --- Ajout de la fonction de dérivation numérique avec options de lissage ---

    /**
     * Calcule la dérivée numérique de y par rapport à x. Gère les valeurs null.
     * @param {Array<number|null>} y Le tableau des valeurs de la fonction.
     * @param {Array<number|null>} x Le tableau des points de la variable (ex: le temps).
     * @param {number} [points=3] Le nombre de points à utiliser pour le stencil (3, 5, ou 7).
     * @param {boolean} [calculateEdges=true] Si false, les points sur les bords qui ne peuvent pas utiliser le stencil complet retourneront null.
     * @returns {Array<number|null>} La dérivée numérique.
     */
    const numericalDerivative = (y, x, points = 5, calculateEdges = true) => {
      console.log(points, calculateEdges);
        const n = y.length;
        if (n !== x.length) {
            throw new Error('Les tableaux pour la dérivation (diff) doivent avoir la même longueur.');
        }
        if (n < points) {
            throw new Error(`Pas assez de points pour une dérivation à ${points} points. Il en faut au moins ${points}.`);
        }

        const result = new Array(n).fill(null);
        const offset = Math.floor(points / 2);

        for (let i = 0; i < n; i++) {
            const isEdgeForRequestedStencil = (i < offset || i >= n - offset);

            if (isEdgeForRequestedStencil && !calculateEdges) {
                continue;
            }

            if (points >= 7 && i >= 3 && i < n - 3) {
                const stencilY = [y[i - 3], y[i - 2], y[i - 1], y[i + 1], y[i + 2], y[i + 3]];
                const stencilX = [x[i - 3], x[i + 3]];
                if ([...stencilY, ...stencilX].some(p => p === null)) { continue; }
                
                const h = (x[i + 3] - x[i - 3]) / 6;
                if (h === 0) { continue; }
                result[i] = (-y[i - 3] + 9 * y[i - 2] - 45 * y[i - 1] + 45 * y[i + 1] - 9 * y[i + 2] + y[i + 3]) / (60 * h);
            }
            else if (points >= 5 && i >= 2 && i < n - 2) {
                const stencilY = [y[i - 2], y[i - 1], y[i + 1], y[i + 2]];
                const stencilX = [x[i - 2], x[i + 2]];
                if ([...stencilY, ...stencilX].some(p => p === null)) { continue; }

                const h = (x[i + 2] - x[i - 2]) / 4;
                if (h === 0) { continue; }
                result[i] = (y[i - 2] - 8 * y[i - 1] + 8 * y[i + 1] - y[i + 2]) / (12 * h);
            }
            else if (i >= 1 && i < n - 1) {
                if (y[i + 1] === null || y[i - 1] === null || x[i + 1] === null || x[i - 1] === null) { continue; }
                const dx = x[i + 1] - x[i - 1];
                if (dx === 0) { continue; }
                result[i] = (y[i + 1] - y[i - 1]) / dx;
            }
            else if (i === 0) {
                if (y[1] === null || y[0] === null || x[1] === null || x[0] === null) { continue; }
                const dx = x[1] - x[0];
                if (dx === 0) { continue; }
                result[i] = (y[1] - y[0]) / dx;
            }
            else { // i === n - 1
                if (y[n - 1] === null || y[n - 2] === null || x[n - 1] === null || x[n - 2] === null) { continue; }
                const dx = x[n - 1] - x[n - 2];
                if (dx === 0) { continue; }
                result[i] = (y[n - 1] - y[n - 2]) / dx;
            }
        }
        return result;
    };

    const typedDiff = mathInstance.typed('diff', {
      'number, Array': (y, x) => mathInstance.zeros(x.length).toArray(),
      'Array, Array': (y, x) => numericalDerivative(y, x, this.derivatePoints, this.derivateEdges),
    });
    mathInstance.import({ diff: typedDiff }, { override: true });

    return mathInstance;
  }

  /**
   * Normalise la casse des fonctions connues dans une expression.
   * @param {string} expression - L'expression à traiter.
   * @returns {string} L'expression avec les fonctions en minuscules.
   */
  _normalizeFunctionCases(expression) {
    const knownFunctions = this.getAvailableFunctions();
    // Crée une regex insensible à la casse pour toutes les fonctions connues
    const regex = new RegExp(`\\b(${knownFunctions.join('|')})\\b(?=\\s*\\()`, 'gi');
    
    return expression.replace(regex, (match) => match.toLowerCase());
  }

  /**
   * Retire les unités des noms de variables dans une expression.
   * @param {string} expression - Ex: "2 * t_s + g"
   * @returns {string} - Ex: "2 * t + g"
   */
  _preprocessExpression(expression) {
    // Cette regex trouve les variables suivies d'une unité et ne garde que la variable.
    return expression.replace(/([a-zA-Z_][a-zA-Z0-9_]*)_([a-zA-Z0-9\/\^\*\s\(\)-]+)/g, '$1');
  }

  /**
   * Évalue une seule expression mathématique.
   * @param {string} expression - La chaîne de caractères de la formule à évaluer.
   * @param {object} scope - Le scope contenant les variables disponibles pour le calcul.
   * @returns Le résultat du calcul.
   */
  evaluate(expression, scope) {
    // Normalise la casse des fonctions (ex: SQRT -> sqrt)
    const normalizedExpr = this._normalizeFunctionCases(expression);
    // Retire les unités des variables (ex: t_s -> t)
    const cleanExpression = this._preprocessExpression(normalizedExpr);
    // Évalue l'expression nettoyée
    return this.mathInstance.evaluate(cleanExpression, scope);
  }

  /**
   * Évalue un bloc de formules en gérant les dépendances.
   * @param {Array<object>} formulas - Un tableau d'objets {variableName, expression, unit}.
   * @param {object} initialScope - Le scope de base avec les courbes et paramètres initiaux.
   * @returns {{results: Array<object>, errors: Array<object>}} Un objet contenant les résultats réussis et les calculs échoués.
   */
  evaluateBlock(formulas, initialScope) {
    const toArr = (v) => (v && v.toArray ? v.toArray() : v);

    const scope = {};
    for (const key in initialScope) {
      const value = initialScope[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && value.hasOwnProperty('value')) {
          scope[key] = value.value; 
      } else {
          const rawArray = toArr(value);
          const cleanedArray = [];
          const len = rawArray.length;
          for (let i = 0; i < len; i++) {
            const val = rawArray[i];
            if (val === null || val === undefined || String(val).trim() === '') {
              cleanedArray.push(null);
              continue;
            }
            const num = Number(val);
            cleanedArray.push(isNaN(num) ? null : num);
          }
          scope[key] = cleanedArray;
      }
    }

    let pendingCalculations = [...formulas];
    const successfulResults = [];
    
    let progressMade = true;
    const maxIterations = pendingCalculations.length;
    let iteration = 0;

    while (pendingCalculations.length > 0 && progressMade && iteration < maxIterations) {
      progressMade = false;
      iteration++;
      
      const remainingForNextLoop = [];

      for (const calc of pendingCalculations) {
        try {
          const resultData = this.evaluate(calc.expression, scope);
          
          const isParameter = typeof resultData === 'number';
          
          if (isParameter) {
            scope[calc.variableName] = resultData;
            successfulResults.push({ 
              variableName: calc.variableName, 
              data: { value: resultData, unit: calc.unit || '' },
              type: 'parameter' 
            });
          } else {
            const resultAsArray = toArr(resultData);
            scope[calc.variableName] = resultAsArray;
            successfulResults.push({ 
              variableName: calc.variableName, 
              data: resultAsArray,
              type: 'curve',
              unit: calc.unit || ''
            });
          }
          progressMade = true;

        } catch (error) {
          remainingForNextLoop.push({ ...calc, error: error.message });
        }
      }
      pendingCalculations = remainingForNextLoop;
    }

    return {
      results: successfulResults,
      errors: pendingCalculations 
    };
  }

  clear() {
    // Réinitialise l'instance math.js pour libérer la mémoire et réinitialiser les fonctions.
    this.mathInstance = this.createConfiguredMathInstance();

    $("#calculation-input").value = ""; // Réinitialise le champ de saisie
  }

  getAvailableFunctions() {
    // Retourne les fonctions scalaires de base plus les fonctions personnalisées.
    // Le tri assure un affichage alphabétique propre dans la barre latérale.
    const allFunctions = [...this.scalarFunctions, 'diff'];
    return allFunctions;
  }
}

export { Calculation };