import { stripInlineComment } from './io/formulaUtils.js';
import {
  numericalDerivative,
  numericalIntegration,
  movingAverageSmooth
} from './calculation/numericalAnalysis.js';
import {
  normalizeFunctionCases,
  preprocessSpecialCharacters,
  preprocessDecimalCommas
} from './calculation/expressionPreprocessor.js';

const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
--------------------------------------------Calculation-----------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Calculation {
  /**
   * @param {object} initialSettings
   */
  constructor(initialSettings) {
    this.scalarFunctions = [
      'sqrt', 'cbrt', 'abs', 'exp', 'log', 'ln',
      'round', 'floor', 'ceil',
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh'
    ];

    this.derivatePoints = initialSettings.derivatePoints; // Nombre de points pour la dérivation
    this.derivateEdges = initialSettings.derivateEdges; // Calculer les bords ou non

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

    // Créer 'ln' comme un alias pour la fonction 'log' (logarithme népérien par défaut)
    mathInstance.import({ ln: mathInstance.log });

    // Redéfinir 'log' pour qu'il soit le logarithme en base 10
    mathInstance.import({ log: mathInstance.log10 }, { override: true });

    // Garantir la reconnaissance de pi insensible à la casse dans le scope
    mathInstance.import({ Pi: mathInstance.pi }, { override: false });

    // Redéfinir les fonctions scalaires pour qu'elles fonctionnent sur les tableaux
    this.scalarFunctions.forEach(name => {
      const originalFn = mathInstance[name];
      if (typeof originalFn !== 'function') return;

      const sanitize = (val) => {
        if (val === null || val === undefined) return null;
        try {
          const res = originalFn(val);
          return (typeof res === 'number' && Number.isFinite(res)) ? res : null;
        } catch {
          return null;
        }
      };

      const typedFn = mathInstance.typed(name, {
        'Array | Matrix': (x) => mathInstance.map(x, sanitize),
        'any': sanitize
      });
      mathInstance.import({ [name]: typedFn }, { override: true });
    });

    // Rendre les opérateurs arithmétiques "null-aware" et finis dans R
    const configureOperator = (name, operation) => {
      const originalFunc = mathInstance[name];
      const safeOp = (a, b) => {
        if (a === null || b === null || a === undefined || b === undefined) return null;
        try {
          const res = operation(a, b);
          return (typeof res === 'number' && Number.isFinite(res)) ? res : null;
        } catch {
          return null;
        }
      };

      const typedFunc = mathInstance.typed(name, {
        'Array | Matrix, Array | Matrix': (a, b) => mathInstance.map(a, b, (valA, valB) => safeOp(valA, valB)),
        'Array | Matrix, any': (a, b) => mathInstance.map(a, valA => safeOp(valA, b)),
        'any, Array | Matrix': (a, b) => mathInstance.map(b, valB => safeOp(a, valB)),
        'any, any': (a, b) => {
          if (a === null || b === null || a === undefined || b === undefined) return null;
          try {
            const res = originalFunc(a, b);
            return (typeof res === 'number' && Number.isFinite(res)) ? res : null;
          } catch {
            return null;
          }
        }
      });
      mathInstance.import({ [name]: typedFunc }, { override: true });
    };

    configureOperator('add', (a, b) => a + b);
    configureOperator('subtract', (a, b) => a - b);
    configureOperator('multiply', (a, b) => a * b);
    configureOperator('divide', (a, b) => a / b);

    // Rendre les opérateurs unaires "null-aware" et finis dans R
    const configureUnaryOperator = (name) => {
      const originalFunc = mathInstance[name];
      const safeUnary = (x) => {
        if (x === null || x === undefined) return null;
        try {
          const res = originalFunc(x);
          return (typeof res === 'number' && Number.isFinite(res)) ? res : null;
        } catch {
          return null;
        }
      };
      const typedFunc = mathInstance.typed(name, {
        'Array | Matrix': (x) => mathInstance.map(x, safeUnary),
        'null': () => null,
        'any': safeUnary
      });
      mathInstance.import({ [name]: typedFunc }, { override: true });
    };

    configureUnaryOperator('unaryMinus');
    configureUnaryOperator('unaryPlus');

    // Redéfinir la fonction de puissance (pour l'opérateur ^)
    const originalPow = mathInstance.pow;
    const safePow = (base, exponent) => {
      if (base === null || exponent === null || base === undefined || exponent === undefined) return null;
      try {
        const res = originalPow(base, exponent);
        return (typeof res === 'number' && Number.isFinite(res)) ? res : null;
      } catch {
        return null;
      }
    };
    const typedPow = mathInstance.typed('pow', {
      'Array | Matrix, Array | Matrix': (base, exponent) => mathInstance.map(base, exponent, (b, e) => safePow(b, e)),
      'Array | Matrix, any': function (base, exponent) {
        return mathInstance.map(base, (b) => {
          if (b === null || exponent === null) return null;
          if (b < 0 && exponent % 1 !== 0) return null;
          return safePow(b, exponent);
        });
      },
      'any, Array | Matrix': function (base, exponent) {
        return mathInstance.map(exponent, (e) => {
          if (e === null || base === null) return null;
          if (base < 0 && e % 1 !== 0) return null;
          return safePow(base, e);
        });
      },
      'any, any': function (base, exponent) {
        if (base === null || exponent === null) return null;
        return safePow(base, exponent);
      }
    });
    mathInstance.import({ pow: typedPow }, { override: true });

    // --- Dérivation numérique ---
    const typedDiff = mathInstance.typed('diff', {
      'number, Array | Matrix': (y, x) => mathInstance.zeros((x && x.length !== undefined) ? x.length : (x.size && x.size()[0]) || 0).toArray(),
      'Array | Matrix, Array | Matrix': (y, x) => numericalDerivative(y, x, this.derivatePoints, this.derivateEdges),
      'Array | Matrix, number': () => {
        throw new Error('Impossible de dériver par rapport à une constante.');
      },
      'number, number': () => {
        throw new Error('Impossible de dériver par rapport à une constante.');
      },
    });
    mathInstance.import({ diff: typedDiff }, { override: true });

    // --- Intégration numérique (primitive par trapèzes cumulés) ---
    const typedIntegrate = mathInstance.typed('integrate', {
      'Array | Matrix, Array | Matrix': (y, x) => numericalIntegration(y, x, 0),
      'Array | Matrix, Array | Matrix, number': (y, x, y0) => numericalIntegration(y, x, y0),
      'number, Array | Matrix': (y, x) => {
        const xArr = x && x.toArray ? x.toArray() : x;
        return numericalIntegration(new Array(xArr.length).fill(y), xArr, 0);
      },
      'number, Array | Matrix, number': (y, x, y0) => {
        const xArr = x && x.toArray ? x.toArray() : x;
        return numericalIntegration(new Array(xArr.length).fill(y), xArr, y0);
      },
      'Array | Matrix, number': () => {
        throw new Error("Impossible d'intégrer par rapport à une constante.");
      },
      'number, number': () => {
        throw new Error("Impossible d'intégrer par rapport à une constante.");
      },
      'Array | Matrix, number, number': () => {
        throw new Error("Impossible d'intégrer par rapport à une constante.");
      },
      'number, number, number': () => {
        throw new Error("Impossible d'intégrer par rapport à une constante.");
      }
    });
    mathInstance.import({ integrate: typedIntegrate }, { override: true });

    // --- Lissage par moyenne mobile centrée ---
    const typedSmooth = mathInstance.typed('smooth', {
      'Array | Matrix': (y) => movingAverageSmooth(y, 5),
      'Array | Matrix, number': (y, n) => movingAverageSmooth(y, n),
      'number': (y) => y,
      'number, number': (y) => y
    });
    mathInstance.import({ smooth: typedSmooth }, { override: true });

    return mathInstance;
  }

  _normalizeFunctionCases(expression) {
    return normalizeFunctionCases(expression, this.getAvailableFunctions());
  }

  preprocessSpecialCharacters(expression) {
    return preprocessSpecialCharacters(expression);
  }

  preprocessDecimalCommas(expression) {
    return preprocessDecimalCommas(expression);
  }

  stripInlineComment(str) {
    return stripInlineComment(str);
  }

  preprocessExpression(expression) {
    if (!expression || typeof expression !== 'string') return expression;
    let clean = stripInlineComment(expression);
    clean = this.preprocessDecimalCommas(clean);
    clean = this.preprocessSpecialCharacters(clean);
    clean = this._normalizeFunctionCases(clean);
    return clean;
  }

  /**
   * Évalue une seule expression mathématique.
   * @param {string} expression - La chaîne de caractères de la formule à évaluer.
   * @param {object} scope - Le scope contenant les variables disponibles pour le calcul.
   * @returns Le résultat du calcul.
   */
  evaluate(expression, scope) {
    const cleanExpression = this.preprocessExpression(expression);
    return this.mathInstance.evaluate(cleanExpression, scope);
  }

  /**
   * Évalue un bloc de formules en gérant les dépendances et en validant les variables.
   * @param {Array<object>} formulas - Un tableau d'objets {variableName, expression, unit}.
   * @param {object} initialScope - Le scope de base avec les courbes et paramètres initiaux.
   * @returns {{results: Array<object>, errors: Array<object>}} Un objet contenant les résultats et les erreurs.
   */
  evaluateBlock(formulas, initialScope) {
    console.log('Évaluation des formules avec le scope initial:', initialScope);
    const toArr = (v) => (v && v.toArray ? v.toArray() : v);

    let maxCurveLength = 0;
    for (const key in initialScope) {
      const value = initialScope[key];
      const isParam = typeof value === 'object' && value !== null && !Array.isArray(value) && value.hasOwnProperty('value');
      if (!isParam) {
        const arr = toArr(value);
        if (arr && typeof arr.length === 'number' && arr.length > maxCurveLength) {
          maxCurveLength = arr.length;
        }
      }
    }

    const scope = {};
    for (const key in initialScope) {
      const value = initialScope[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && value.hasOwnProperty('value')) {
        scope[key] = value.value;
      } else {
        const rawArray = toArr(value);
        const cleanedArray = [];
        const len = rawArray ? rawArray.length : 0;
        if (len > 0) {
          const targetLen = Math.max(len, maxCurveLength);
          for (let i = 0; i < targetLen; i++) {
            if (i >= len) {
              cleanedArray.push(null);
              continue;
            }
            const val = rawArray[i];
            if (val === null || val === undefined || String(val).trim() === '') {
              cleanedArray.push(null);
              continue;
            }
            const num = Number(val);
            cleanedArray.push(isNaN(num) ? null : num);
          }
        }
        scope[key] = cleanedArray;
      }
    }

    let pendingCalculations = [...formulas];
    const successfulResults = [];

    let progressMade = true;
    const maxIterations = pendingCalculations.length;
    let iteration = 0;

    while (pendingCalculations.length > 0 && progressMade && iteration <= maxIterations) {
      progressMade = false;
      iteration++;

      const remainingForNextLoop = [];

      for (const calc of pendingCalculations) {
        try {
          const cleanExpression = this.preprocessExpression(calc.expression);

          const expressionNode = this.mathInstance.parse(cleanExpression);
          expressionNode.traverse((node) => {
            if (node.isSymbolNode) {
              const symbol = node.name;
              if (!(symbol in scope) && !(symbol in this.mathInstance)) {
                throw new Error(`La variable "${symbol}" n'est pas définie.`);
              }
              if (symbol in scope && Array.isArray(scope[symbol]) && scope[symbol].length === 0) {
                throw new Error(`La grandeur "${symbol}" ne contient aucune donnée.`);
              }
              if (symbol in scope && scope[symbol] === null) {
                throw new Error(`Le paramètre "${symbol}" n'a pas de valeur valide.`);
              }
            }
          });

          const resultData = this.evaluate(cleanExpression, scope);

          if (resultData === null) {
            throw new Error(`Le résultat n'est pas défini dans les réels (hors du domaine de validité).`);
          }

          if (typeof resultData === 'number' && !Number.isFinite(resultData)) {
            throw new Error(`Le calcul a produit une valeur non finie (${resultData}).`);
          }

          const isParameter = typeof resultData === 'number';
          const isCurve = Array.isArray(resultData) || (resultData !== null && typeof resultData.toArray === 'function');

          if (!isParameter && !isCurve) {
            throw new Error(`Le résultat n'est pas d'un type mathématique valide (texte ou objet non pris en charge).`);
          }

          if (isParameter) {
            scope[calc.variableName] = resultData;
            successfulResults.push({
              variableName: calc.variableName,
              data: { value: resultData, unit: calc.unit || '' },
              type: 'parameter'
            });
          } else {
            const rawArray = toArr(resultData);
            const resultAsArray = (rawArray || []).map(val => (typeof val === 'number' && Number.isFinite(val)) ? val : null);
            if (maxCurveLength > 0 && resultAsArray.length < maxCurveLength) {
              while (resultAsArray.length < maxCurveLength) {
                resultAsArray.push(null);
              }
            }
            if (resultAsArray.length > maxCurveLength) {
              maxCurveLength = resultAsArray.length;
            }
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
    this.mathInstance = this.createConfiguredMathInstance();
    $("#calculation-input").value = "";
  }

  getAvailableFunctions() {
    return [...this.scalarFunctions, 'diff', 'integrate', 'smooth'];
  }
}

export { Calculation, stripInlineComment };
