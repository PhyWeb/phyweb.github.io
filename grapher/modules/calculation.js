const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
--------------------------------------------Calculation-----------------------------------------
----------------------------------------------------------------------------------------------*/
export default class Calculation {
  /**
   * @param {object} data - L'objet de données contenant les courbes. Ex: { curves: [{ title: 'x', values: [1,2,3] }] }
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

      // Gestion spéciale pour les fonctions qui peuvent retourner des nombres complexes
      if (['sqrt', 'log', 'ln'].includes(name)) {
        const typedFn = mathInstance.typed(name, {
          'Array | Matrix': function(x) {
            return mathInstance.map(x, val => {
              // Si la valeur est négative ou nulle, on ne calcule pas.
              if (val === null || val < 0) {
                return null;
              }
              // Pour le log, 0 n'est pas défini non plus.
              if ((name === 'log' || name === 'ln') && val === 0) {
                return null;
              }
              return originalFn(val);
            });
          },
          'any': function(x) {
            if (x === null || x < 0) return null;
            if ((name === 'log' || name === 'ln') && x === 0) return null;
            return originalFn(x);
          }
        });
        mathInstance.import({ [name]: typedFn }, { override: true });
      } else {
        // Comportement standard pour les autres fonctions
        const typedFn = mathInstance.typed(name, {
          'Array | Matrix': function(x) {
            return mathInstance.map(x, val => (val === null ? null : originalFn(val)));
          },
          'any': function(x) {
            return originalFn(x);
          }
        });
        mathInstance.import({ [name]: typedFn }, { override: true });
      }
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
      // signature pour le cas: Array ^ Array
      'Array | Matrix, Array | Matrix': function(base, exponent) {
        return mathInstance.map(base, exponent, (b, e) => {
          if (b === null || e === null) return null;
          // Gère le cas des bases négatives avec exposants non-entiers qui donnerait un résultat complexe
          if (b < 0 && e % 1 !== 0) {
            return null;
          }
          return originalPow(b, e);
        });
      },

      // Signature pour le cas: Array ^ Nombre
      'Array | Matrix, any': function(base, exponent) {
        return mathInstance.map(base, (b) => {
          if (b === null) return null;
          // Gère le cas des bases négatives avec exposants non-entiers qui donnerait un résultat complexe
          if (b < 0 && exponent % 1 !== 0) return null;
          return originalPow(b, exponent);
        });
      },
      
      // Signature de base pour le cas: Nombre ^ Nombre
      'any, any': function(base, exponent) {
        return originalPow(base, exponent);
      }
    });
    mathInstance.import({ pow: typedPow }, { override: true });


    // --- Ajout de la fonction de dérivation numérique avec options de lissage ---

    /**
     * Calcule la dérivée numérique de y par rapport à x. Gère les valeurs null et les grilles à pas variable.
     * @param {Array<number|null>} y Le tableau des valeurs de la fonction.
     * @param {Array<number|null>} x Le tableau des points de la variable (ex: le temps).
     * @param {number} [points=5] Le nombre de points à utiliser pour le stencil (3, 5, ou 7).
     * @param {boolean} [calculateEdges=true] Si false, les points sur les bords qui ne peuvent pas utiliser le stencil complet retourneront null.
     * @returns {Array<number|null>} La dérivée numérique.
     */
    const numericalDerivative = (y, x, points = 5, calculateEdges = true) => {
        const toArr = (v) => (v && v.toArray ? v.toArray() : v);
        const yArr = toArr(y);
        const xArr = toArr(x);

        const nMin = Math.min(yArr.length, xArr.length);
        const nMax = Math.max(yArr.length, xArr.length);

        if (nMin < points) {
            throw new Error(`Pas assez de points pour une dérivation à ${points} points. Il en faut au moins ${points}.`);
        }


        const n = nMin;
        let direction = 0; // 1 pour croissant, -1 pour décroissant
        let prevX = null;
        for (let i = 0; i < n; i++) {
          const currentX = xArr[i];
          if (currentX === null || currentX === undefined || !isFinite(currentX)) continue;
          if (prevX !== null) {
            const diffX = currentX - prevX;
            if (diffX === 0) {
              throw new Error("la grandeur de dérivation contient deux valeurs identiques consécutives.");
            }
            const stepDir = Math.sign(diffX);
            if (direction === 0) {
              direction = stepDir;
            } else if (stepDir !== direction) {
              throw new Error("la grandeur de dérivation n'est pas triée. Veuillez trier vos données dans le tableur.");
            }
          }
          prevX = currentX;
        }

        const result = new Array(nMax).fill(null);



        // Helper pour vérifier si le sous-ensemble de points possède un pas régulier (tolérance aux arrondis flottants)
        const isUniformSpacing = (coords, startIdx, count) => {
            if (startIdx < 0 || startIdx + count > coords.length) return false;
            for (let k = 0; k < count; k++) {
                if (coords[startIdx + k] === null || coords[startIdx + k] === undefined || !Number.isFinite(coords[startIdx + k])) {
                    return false;
                }
            }
            const firstStep = coords[startIdx + 1] - coords[startIdx];
            if (firstStep === 0) return false;
            const tol = 1e-3 * Math.abs(firstStep);
            for (let k = 1; k < count - 1; k++) {
                const step = coords[startIdx + k + 1] - coords[startIdx + k];
                if (Math.sign(step) !== Math.sign(firstStep) || Math.abs(step - firstStep) > tol) {
                    return false;
                }
            }
            return true;
        };

        // Détermine si le point i est un bord devant être masqué lorsque calculateEdges est false.
        // Un point n'est considéré comme bord pour un stencil 5 ou 7 points que si ce stencil d'ordre supérieur
        // est effectivement applicable sur les données avoisinantes.
        const isEdgePoint = (i) => {
            if (i === 0 || i === n - 1) return true;
            if (points >= 7) {
                if ((i === 1 || i === 2) && isUniformSpacing(xArr, 0, 7)) return true;
                if ((i === n - 2 || i === n - 3) && isUniformSpacing(xArr, n - 7, 7)) return true;
            }
            if (points >= 5) {
                if (i === 1 && isUniformSpacing(xArr, 0, 5)) return true;
                if (i === n - 2 && isUniformSpacing(xArr, n - 5, 5)) return true;
            }
            return false;
        };

        let warnedNonUniform = false;

        for (let i = 0; i < n; i++) {
            if (yArr[i] === null || xArr[i] === null) {
                continue;
            }

            const isEdge = isEdgePoint(i);

            if (isEdge && !calculateEdges) {
                continue;
            }

            let computed = false;

            // Stencil uniforme à 7 points (ordre 6)
            if (points >= 7 && i >= 3 && i < n - 3) {
                const stencilY = [yArr[i - 3], yArr[i - 2], yArr[i - 1], yArr[i], yArr[i + 1], yArr[i + 2], yArr[i + 3]];
                const stencilX = [xArr[i - 3], xArr[i - 2], xArr[i - 1], xArr[i], xArr[i + 1], xArr[i + 2], xArr[i + 3]];
                if (!stencilY.includes(null) && !stencilX.includes(null) && isUniformSpacing(xArr, i - 3, 7)) {
                    const h = (xArr[i + 3] - xArr[i - 3]) / 6;
                    if (h !== 0) {
                        result[i] = (-yArr[i - 3] + 9 * yArr[i - 2] - 45 * yArr[i - 1] + 45 * yArr[i + 1] - 9 * yArr[i + 2] + yArr[i + 3]) / (60 * h);
                        computed = true;
                    }
                } else if (!warnedNonUniform && points >= 7) {
                    console.warn("Dérivation : pas variable détecté pour le stencil à 7 points. Utilisation du schéma adapté au pas variable.");
                    warnedNonUniform = true;
                }
            }

            // Stencil uniforme à 5 points (ordre 4)
            if (!computed && points >= 5 && i >= 2 && i < n - 2) {
                const stencilY = [yArr[i - 2], yArr[i - 1], yArr[i], yArr[i + 1], yArr[i + 2]];
                const stencilX = [xArr[i - 2], xArr[i - 1], xArr[i], xArr[i + 1], xArr[i + 2]];
                if (!stencilY.includes(null) && !stencilX.includes(null) && isUniformSpacing(xArr, i - 2, 5)) {
                    const h = (xArr[i + 2] - xArr[i - 2]) / 4;
                    if (h !== 0) {
                        result[i] = (yArr[i - 2] - 8 * yArr[i - 1] + 8 * yArr[i + 1] - yArr[i + 2]) / (12 * h);
                        computed = true;
                    }
                } else if (!warnedNonUniform && points >= 5) {
                    console.warn("Dérivation : pas variable détecté pour le stencil à 5 points. Utilisation du schéma adapté au pas variable.");
                    warnedNonUniform = true;
                }
            }

            // Schéma non-uniforme à 3 points (Lagrange / différences finies d'ordre 2 pour pas variable)
            if (!computed && i >= 1 && i < n - 1) {
                if (yArr[i - 1] !== null && xArr[i - 1] !== null && yArr[i + 1] !== null && xArr[i + 1] !== null) {
                    const h1 = xArr[i] - xArr[i - 1];
                    const h2 = xArr[i + 1] - xArr[i];
                    if (h1 !== 0 && h2 !== 0 && (h1 + h2) !== 0) {
                        result[i] = (Math.pow(h1, 2) * (yArr[i + 1] - yArr[i]) + Math.pow(h2, 2) * (yArr[i] - yArr[i - 1])) / (h1 * h2 * (h1 + h2));
                        computed = true;
                    }
                }
            }

            // Repli sur différences finies à 2 points aux extrémités ou près des points manquants
            if (!computed) {
                if (i + 1 < n && yArr[i + 1] !== null && xArr[i + 1] !== null) {
                    const dx = xArr[i + 1] - xArr[i];
                    if (dx !== 0) {
                        result[i] = (yArr[i + 1] - yArr[i]) / dx;
                        computed = true;
                    }
                } else if (i - 1 >= 0 && yArr[i - 1] !== null && xArr[i - 1] !== null) {
                    const dx = xArr[i] - xArr[i - 1];
                    if (dx !== 0) {
                        result[i] = (yArr[i] - yArr[i - 1]) / dx;
                        computed = true;
                    }
                }
            }
        }
        return result;
    };

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

    // --- Ajout de la fonction d'intégration numérique (primitive par trapèzes cumulés) ---

    /**
     * Calcule la primitive numérique de y par rapport à x via la méthode des trapèzes cumulés.
     * @param {Array<number|null>} y Le tableau des valeurs de la fonction à intégrer.
     * @param {Array<number|null>} x Le tableau des points de la variable d'intégration.
     * @param {number} [initialValue=0] La valeur initiale de la primitive au premier point.
     * @returns {Array<number|null>} La primitive numérique cumulée.
     */
    const numericalIntegration = (y, x, initialValue = 0) => {
      const toArr = (v) => (v && v.toArray ? v.toArray() : v);
      const yArr = toArr(y);
      const xArr = toArr(x);

      const nMin = Math.min(yArr.length, xArr.length);
      const nMax = Math.max(yArr.length, xArr.length);

      if (nMin < 2) {
        throw new Error("Pas assez de points pour calculer une primitive. Il en faut au moins 2.");
      }

      let direction = 0; // 1 pour croissant, -1 pour décroissant
      let prevX = null;
      for (let i = 0; i < nMin; i++) {
        const currentX = xArr[i];
        if (currentX === null || currentX === undefined || !Number.isFinite(currentX)) continue;
        if (prevX !== null) {
          const diffX = currentX - prevX;
          if (diffX === 0) {
            throw new Error("la grandeur d'intégration contient deux valeurs identiques consécutives.");
          }
          const stepDir = Math.sign(diffX);
          if (direction === 0) {
            direction = stepDir;
          } else if (stepDir !== direction) {
            throw new Error("la grandeur d'intégration n'est pas triée. Veuillez trier vos données dans le tableur.");
          }
        }
        prevX = currentX;
      }

      const result = new Array(nMax).fill(null);
      let cumulativeSum = Number(initialValue) || 0;
      let prevValidIdx = -1;

      for (let i = 0; i < nMin; i++) {
        const xVal = xArr[i];
        const yVal = yArr[i];
        const isValid = xVal !== null && xVal !== undefined && Number.isFinite(xVal) &&
                        yVal !== null && yVal !== undefined && Number.isFinite(yVal);

        if (!isValid) {
          continue;
        }

        if (prevValidIdx === -1) {
          result[i] = cumulativeSum;
          prevValidIdx = i;
        } else {
          const dx = xVal - xArr[prevValidIdx];
          cumulativeSum += 0.5 * (yArr[prevValidIdx] + yVal) * dx;
          result[i] = cumulativeSum;
          prevValidIdx = i;
        }
      }

      return result;
    };

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

    // --- Ajout de la fonction de lissage par moyenne mobile centrée ---

    /**
     * Calcule la moyenne mobile centrée d'un tableau y.
     * @param {Array<number|null>} y Le tableau des valeurs à lisser.
     * @param {number} [windowSize=5] La taille de la fenêtre de lissage (entier >= 3).
     * @returns {Array<number|null>} Les valeurs lissées.
     */
    const movingAverageSmooth = (y, windowSize = 5) => {
      const toArr = (v) => (v && v.toArray ? v.toArray() : v);
      const yArr = toArr(y);

      const w = Math.round(Number(windowSize));
      if (!Number.isFinite(w) || w < 3) {
        throw new Error("La fenêtre de lissage doit être un entier supérieur ou égal à 3.");
      }

      const half = Math.floor((w - 1) / 2);

      if (!yArr || yArr.length < w) {
        throw new Error(`Pas assez de points pour un lissage sur ${w} points.`);
      }

      const result = new Array(yArr.length).fill(null);

      for (let i = 0; i < yArr.length; i++) {
        const valI = yArr[i];
        if (valI === null || valI === undefined || !Number.isFinite(valI)) {
          result[i] = null;
          continue;
        }

        const maxHalf = Math.min(half, i, yArr.length - 1 - i);
        let sum = 0;
        let count = 0;

        for (let j = i - maxHalf; j <= i + maxHalf; j++) {
          const val = yArr[j];
          if (val !== null && val !== undefined && Number.isFinite(val)) {
            sum += val;
            count++;
          }
        }

        result[i] = count > 0 ? sum / count : null;
      }

      return result;
    };

    const typedSmooth = mathInstance.typed('smooth', {
      'Array | Matrix': (y) => movingAverageSmooth(y, 5),
      'Array | Matrix, number': (y, n) => movingAverageSmooth(y, n),
      'number': (y) => y,
      'number, number': (y) => y
    });
    mathInstance.import({ smooth: typedSmooth }, { override: true });

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
   * Remplace les caractères spéciaux comme '²' par leur équivalent pour math.js.
   * @param {string} expression - L'expression à traiter.
   * @returns {string} - L'expression avec les caractères remplacés.
   */
  preprocessSpecialCharacters(expression) {
      // Remplace le caractère '²' par '^2'
      return expression.replace(/²/g, '^2');
  }

  /**
   * Traite les virgules dans une expression pour concilier la notation décimale française
   * (ex: 0,5 * m) et les séparateurs d'arguments ou d'éléments (ex: pow(2,3), [1,2,3], pow(x1,2)) :
   * - Remplace les points-virgules ';' utilisés comme séparateurs par des virgules
   * - Préserve les virgules comme séparateurs dans les tableaux [1,2,3]
   * - Préserve les virgules comme séparateurs d'arguments dans les fonctions multi-arguments (pow(2,3), min(2,3), atan2(1,2)...)
   * - Préserve les virgules après une variable se terminant par un chiffre (ex: pow(x1,2))
   * - Convertit les virgules décimales en points (ex: 1,5 * a -> 1.5 * a, sin(0,5) -> sin(0.5))
   * @param {string} expression - L'expression à traiter.
   * @returns {string} - L'expression avec les virgules traitées.
   */
  preprocessDecimalCommas(expression) {
    if (!expression || typeof expression !== 'string') return expression;

    // Normalise le point-virgule (séparateur usuel en notation française quand la virgule est décimale)
    let expr = expression.replace(/;\s*/g, ', ');

    const multiArgFunctions = new Set([
      'pow', 'diff', 'integrate', 'smooth', 'atan2', 'min', 'max', 'hypot', 'gcd', 'lcm', 'nthroot', 'mod'
    ]);

    // Trouve l'indice de la parenthèse fermante correspondante
    const findMatchingCloseParen = (str, openIndex) => {
      let depth = 0;
      for (let k = openIndex; k < str.length; k++) {
        if (str[k] === '(') depth++;
        else if (str[k] === ')') {
          depth--;
          if (depth === 0) return k;
        }
      }
      return -1;
    };

    // Compte le nombre de virgules au niveau 0 (hors sous-parenthèses/crochets) entre deux indices
    const countTopLevelCommas = (str, start, end) => {
      let count = 0;
      let pDepth = 0;
      let bDepth = 0;
      for (let k = start; k < end; k++) {
        const c = str[k];
        if (c === '(') pDepth++;
        else if (c === ')') pDepth--;
        else if (c === '[') bDepth++;
        else if (c === ']') bDepth--;
        else if (c === ',' && pDepth === 0 && bDepth === 0) {
          count++;
        }
      }
      return count;
    };

    const stack = [];
    let result = '';
    const len = expr.length;
    let i = 0;

    while (i < len) {
      const char = expr[i];

      // Parenthèse ouvrante
      if (char === '(') {
        let j = result.length - 1;
        while (j >= 0 && /\s/.test(result[j])) j--;
        const identEnd = j + 1;
        while (j >= 0 && /[a-zA-ZÀ-ÖØ-öø-ÿ0-9_]/.test(result[j])) j--;
        const ident = result.slice(j + 1, identEnd).toLowerCase();

        const closeIndex = findMatchingCloseParen(expr, i);
        const topLevelCommas = closeIndex !== -1 ? countTopLevelCommas(expr, i + 1, closeIndex) : 0;

        if (ident && multiArgFunctions.has(ident)) {
          stack.push({ type: 'multiArgCall', name: ident, topLevelCommas });
        } else if (ident) {
          stack.push({ type: 'singleArgCall', name: ident, topLevelCommas });
        } else {
          stack.push({ type: 'paren', topLevelCommas });
        }

        result += char;
        i++;
        continue;
      }

      // Parenthèse fermante
      if (char === ')') {
        if (stack.length > 0 && stack[stack.length - 1].type !== 'bracket') {
          stack.pop();
        }
        result += char;
        i++;
        continue;
      }

      // Crochet ouvrant (tableau)
      if (char === '[') {
        stack.push({ type: 'bracket' });
        result += char;
        i++;
        continue;
      }

      // Crochet fermant
      if (char === ']') {
        if (stack.length > 0 && stack[stack.length - 1].type === 'bracket') {
          stack.pop();
        }
        result += char;
        i++;
        continue;
      }

      // Virgule
      if (char === ',') {
        const prevChar = i > 0 ? expr[i - 1] : '';
        const nextChar = i + 1 < len ? expr[i + 1] : '';

        // Une virgule décimale est nécessairement collée entre deux chiffres
        const isBetweenDigits = /\d/.test(prevChar) && /\d/.test(nextChar);

        // Vérifier si le chiffre avant la virgule fait partie d'un identifiant (ex: pow(x1,2))
        let isPartOfIdentifier = false;
        if (isBetweenDigits) {
          let k = result.length - 1;
          while (k >= 0 && /\d/.test(result[k])) k--;
          if (k >= 0 && /[a-zA-ZÀ-ÖØ-öø-ÿ_]/.test(result[k])) {
            isPartOfIdentifier = true;
          }
        }

        const currentContext = stack.length > 0 ? stack[stack.length - 1] : null;

        if (isBetweenDigits && isPartOfIdentifier) {
          result += ', ';
          i++;
          continue;
        }

        if (isBetweenDigits && !isPartOfIdentifier) {
          // Dans un tableau [1,2,3], la virgule sépare des éléments
          if (currentContext && currentContext.type === 'bracket') {
            result += ', ';
            i++;
            continue;
          }

          // Dans une fonction multi-arguments :
          // Si la fonction ne comporte qu'une seule virgule à son niveau principal (ex: pow(2,3), min(2,3), atan2(1,2)),
          // cette virgule est obligatoirement le séparateur d'arguments.
          if (currentContext && currentContext.type === 'multiArgCall' && currentContext.topLevelCommas === 1) {
            result += ', ';
            i++;
            continue;
          }

          // Pour les fonctions variadiques à plusieurs entiers sans espace (ex: min(2,3,4))
          if (currentContext && ['min', 'max', 'hypot', 'gcd', 'lcm'].includes(currentContext.name)) {
            let p = i - 1;
            while (p >= 0 && /\d/.test(expr[p])) p--;
            let q = i + 1;
            while (q < len && /\d/.test(expr[q])) q++;
            const atStartOrAfterComma = p < 0 || expr[p] === '(' || expr[p] === ',' || expr[p] === ' ';
            const atEndOrBeforeComma = q >= len || expr[q] === ')' || expr[q] === ',' || expr[q] === ' ';
            if (atStartOrAfterComma && atEndOrBeforeComma && currentContext.topLevelCommas > 1) {
              result += ', ';
              i++;
              continue;
            }
          }

          // Sinon, c'est une virgule décimale (ex: 0,5 * m, sin(0,5), pow(0,5, 2))
          result += '.';
          i++;
          continue;
        }

        result += ',';
        i++;
        continue;
      }

      result += char;
      i++;
    }

    return result;
  }

  /**
   * Prétraite une formule pour la normaliser avant analyse syntaxique et évaluation :
   * - Remplace les virgules décimales par des points tout en préservant les séparateurs d'arguments
   * - Remplace les caractères spéciaux (ex: '²' -> '^2')
   * - Normalise la casse des fonctions connues (ex: SQRT -> sqrt)
   * @param {string} expression - L'expression à traiter.
   * @returns {string} - L'expression nettoyée et normalisée.
   */
  preprocessExpression(expression) {
    if (!expression || typeof expression !== 'string') return expression;
    let clean = this.preprocessDecimalCommas(expression);
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

  while (pendingCalculations.length > 0 && progressMade && iteration <= maxIterations) {
    progressMade = false;
    iteration++;
    
    const remainingForNextLoop = [];

    for (const calc of pendingCalculations) {
      try {
        const cleanExpression = this.preprocessExpression(calc.expression);

        const expressionNode = this.mathInstance.parse(cleanExpression);
        expressionNode.traverse((node, path, parent) => {
          // On vérifie que chaque variable (SymbolNode) est bien définie
          if (node.isSymbolNode) {
            const symbol = node.name;
            // La variable doit exister soit dans nos données (scope), soit être une fonction mathématique
            if (!(symbol in scope) && !(symbol in this.mathInstance)) {
              // Si elle n'existe pas, on lève une erreur claire et on arrête tout.
              throw new Error(`La variable "${symbol}" n'est pas définie.`);
            }
            // On s'assure que si la grandeur fait partie de nos données (scope), elle contient bien des valeurs
            if (symbol in scope && Array.isArray(scope[symbol]) && scope[symbol].length === 0) {
              throw new Error(`La grandeur "${symbol}" ne contient aucune donnée.`);
            }
          }
        });

        const resultData = this.evaluate(cleanExpression, scope);
        
        const isParameter = typeof resultData === 'number' || resultData === null;
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
        // Si une erreur est levée (par nous ou par math.js), on la stocke
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
    const allFunctions = [...this.scalarFunctions, 'diff', 'integrate', 'smooth'];
    return allFunctions;
  }
}

export { Calculation };