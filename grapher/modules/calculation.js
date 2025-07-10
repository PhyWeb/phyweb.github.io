const $ = document.querySelector.bind(document);

const DIFF_POINTS = 3; // Nombre de points par défaut pour la dérivation numérique

/*----------------------------------------------------------------------------------------------
--------------------------------------------Calculation-----------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Calculation {

  constructor(data) {
    this.data = data; // Objet de données contenant les courbes
    
    this.scalarFunctions = [
      'sqrt', 'cbrt', 'abs', 'exp', 'log', 'log10', 'log2', 'round', 'floor', 'ceil', 'sign',
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
      'asinh', 'acosh', 'atanh', 'not', 'identity'
      // Note: min et max ne sont pas inclus ici car ils peuvent prendre plusieurs arguments.
      // Leur redéfinition pour un comportement élément par élément est plus complexe.
    ];
    
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

      const typedFn = math.typed(name, {
        'Array | Matrix': function(x) {
          return mathInstance.map(x, originalFn);
        },
        // Comportement par défaut pour les autres types (nombres, etc.)
        'any': function(x) {
          return originalFn(x);
        }
      });
      
      mathInstance.import({ [name]: typedFn }, { override: true });
    });

    // Redéfinir la fonction de puissance (pour l'opérateur ^)
    const originalPow = mathInstance.pow;
    const typedPow = math.typed('pow', {
      'Array | Matrix, any': function(base, exponent) {
        return mathInstance.dotPow(base, exponent);
      },
      // Comportement par défaut pour les autres types
      'any, any': function(base, exponent) {
        return originalPow(base, exponent);
      }
    });
    mathInstance.import({ pow: typedPow }, { override: true });

    // --- MODIFIÉ : Ajout de la fonction de dérivation numérique avec options de lissage ---

    // Définir les paramètres par défaut pour la fonction DIFF
    const DEFAULT_DIFF_POINTS = 3;
    const DEFAULT_DIFF_CALCULATE_EDGES = true;

    /**
     * Calcule la dérivée numérique de y par rapport à x.
     * @param {Array<number>} y Le tableau des valeurs de la fonction.
     * @param {Array<number>} x Le tableau des points de la variable (ex: le temps).
     * @param {number} [points=3] Le nombre de points à utiliser pour le stencil (3, 5, ou 7).
     * @param {boolean} [calculateEdges=true] Si false, les points sur les bords qui ne peuvent pas utiliser le stencil complet retourneront null.
     * @returns {Array<number|null>} La dérivée numérique.
     */
    const numericalDerivative = (y, x, points = DEFAULT_DIFF_POINTS, calculateEdges = DEFAULT_DIFF_CALCULATE_EDGES) => {
        const n = y.length;
        if (n !== x.length) {
            throw new Error('Les tableaux pour la dérivation (DIFF) doivent avoir la même longueur.');
        }
        if (n < points) {
            throw new Error(`Pas assez de points pour une dérivation à ${points} points. Il en faut au moins ${points}.`);
        }

        const result = new Array(n);
        const offset = Math.floor(points / 2);

        for (let i = 0; i < n; i++) {
            // Vérifie si le point est un "bord" pour le stencil demandé.
            const isEdgeForRequestedStencil = (i < offset || i >= n - offset);

            if (isEdgeForRequestedStencil && !calculateEdges) {
                result[i] = null;
                continue; // Passe au point suivant
            }

            // Tente la dérivation à 7 points (si demandée et possible)
            if (points >= 7 && i >= 3 && i < n - 3) {
                const h = (x[i + 3] - x[i - 3]) / 6; // Espacement moyen local
                if (h === 0) { throw new Error(`L'espacement en x est nul au point ${i}, impossible de diviser par zéro.`); }
                result[i] = (-y[i - 3] + 9 * y[i - 2] - 45 * y[i - 1] + 45 * y[i + 1] - 9 * y[i + 2] + y[i + 3]) / (60 * h);
            }
            // Tente la dérivation à 5 points (si demandée et possible)
            else if (points >= 5 && i >= 2 && i < n - 2) {
                const h = (x[i + 2] - x[i - 2]) / 4; // Espacement moyen local
                if (h === 0) { throw new Error(`L'espacement en x est nul au point ${i}, impossible de diviser par zéro.`); }
                result[i] = (y[i - 2] - 8 * y[i - 1] + 8 * y[i + 1] - y[i + 2]) / (12 * h);
            }
            // Utiliser la dérivation à 3 points (différence centrale, si possible)
            else if (i >= 1 && i < n - 1) {
                const dx = x[i + 1] - x[i - 1];
                if (dx === 0) { throw new Error(`L'espacement en x est nul au point ${i}, impossible de diviser par zéro.`); }
                result[i] = (y[i + 1] - y[i - 1]) / dx;
            }
            // Gérer les points aux extrémités absolues (différence avant/arrière)
            else if (i === 0) {
                const dx = x[1] - x[0];
                if (dx === 0) { throw new Error(`L'espacement en x est nul au point 0, impossible de diviser par zéro.`); }
                result[i] = (y[1] - y[0]) / dx;
            }
            else { // i === n - 1
                const dx = x[n - 1] - x[n - 2];
                if (dx === 0) { throw new Error(`L'espacement en x est nul au point ${n - 1}, impossible de diviser par zéro.`); }
                result[i] = (y[n - 1] - y[n - 2]) / dx;
            }
        }
        return result;
    };

    const typedDiff = math.typed('DIFF', {
        'Array, Array': (y, x) => numericalDerivative(y, x, DEFAULT_DIFF_POINTS, DEFAULT_DIFF_CALCULATE_EDGES),
        'Array, Array, number': (y, x, p) => numericalDerivative(y, x, p, DEFAULT_DIFF_CALCULATE_EDGES),
        'Array, Array, number, boolean': numericalDerivative,
        'Matrix, Matrix': (y, x) => math.matrix(numericalDerivative(y.toArray(), x.toArray(), DEFAULT_DIFF_POINTS, DEFAULT_DIFF_CALCULATE_EDGES)),
        'Matrix, Matrix, number': (y, x, p) => math.matrix(numericalDerivative(y.toArray(), x.toArray(), p, DEFAULT_DIFF_CALCULATE_EDGES)),
        'Matrix, Matrix, number, boolean': (y, x, p, c) => math.matrix(numericalDerivative(y.toArray(), x.toArray(), p, c)),
    });
    mathInstance.import({ DIFF: typedDiff }, { override: true });

    return mathInstance;
  }

  /**
   * Évalue une seule expression mathématique.
   * @param {string} expression - La chaîne de caractères de la formule à évaluer.
   * @param {object} scope - Le scope contenant les variables disponibles pour le calcul.
   * @returns Le résultat du calcul.
   */
  evaluate(expression, scope) {
    return this.mathInstance.evaluate(expression, scope);
  }

  /**
   * Évalue un bloc de formules en gérant les dépendances.
   * @param {Array<object>} formulas - Un tableau d'objets {variableName, expression}.
   * @param {object} initialScope - Le scope de base avec les courbes initiales.
   * @returns {{results: Array<object>, errors: Array<object>}} Un objet contenant les résultats réussis et les calculs échoués.
   */
  evaluateBlock(formulas, initialScope) {
    const scope = { ...initialScope };
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
          
          // Succès !
          scope[calc.variableName] = resultData;
          successfulResults.push({ variableName: calc.variableName, data: resultData });
          progressMade = true;

        } catch (error) {
          // Échec probable dû à une dépendance manquante, on réessaiera.
          remainingForNextLoop.push(calc);
        }
      }
      pendingCalculations = remainingForNextLoop;
    }

    // Retourne les résultats et les erreurs (calculs restants)
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
}

export { Calculation };