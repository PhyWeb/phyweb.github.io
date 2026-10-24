/**
 * fitter.worker.js
 * Ce Web Worker est dédié à l'ajustement de modèle (fitting) en utilisant Alglib.
 * Il reçoit les données, le type de modèle et une estimation initiale,
 * puis effectue le calcul en arrière-plan pour ne pas geler l'interface utilisateur.
 */

// On importe la librairie Alglib dans le scope du worker.
let alglibLoadError = null;
try {
  // Charge le script Alglib dans le scope global du worker.
  importScripts('../../common/alglib/alglib-v1.1.0.js'); 
} catch (e) {
  alglibLoadError = e;
  console.error("Alglib n'a pas pu être chargé via importScripts.", e);
}

/**
 * Recrée la fonction mathématique du modèle à partir de son type.
 * Cette fonction est une copie de `getFunction` de la classe Model,
 * mais elle est autonome et ne dépend pas de `this`.
 * @param {string} type - Le type de modèle (ex: 'linear', 'quadratic').
 * @returns {Function} La fonction mathématique correspondante.
 */
function getFunction(type) {
  switch (type) {
    case 'linear': // y = ax
      return (an, x) => an[0] * x;
    case 'affine': // y = ax + b
      return (an, x) => an[0] * x + an[1];
    case 'quadratic': // y = ax^2 + bx + c
      return (an, x) => an[0] * Math.pow(x, 2) + an[1] * x + an[2];
    case 'power': // y = ax^b
      return (an, x) => an[0] * Math.pow(x, an[1]);
    case 'exp1': // y = a*e^(-x/b)
      return (an, x) => an[0] * Math.exp(-x / an[1]);
    case 'exp2': // y = a*(1 - e^(-x/b))
      return (an, x) => an[0] * (1 - Math.exp(-x / an[1]));
    case 'ln': // y = a*ln(x) + b
      return (an, x) => an[0] * Math.log(x) + an[1];
    case 'log': // y = a*log10(x) + b
      return (an, x) => an[0] * Math.log10(x) + an[1];
    case 'sin': // y = a*sin(b*x+c) + d
      return (an, x) => an[0] * Math.sin(an[1] * x + an[2]) + an[3];
    case 'cos': // y = a*cos(b*x+c) + d
      return (an, x) => an[0] * Math.cos(an[1] * x + an[2]) + an[3];
    case 'dampedsin': // y = a*sin(b*x+c)*e^(-x/d) + e
      return (an, x) => an[0] * Math.sin(an[1] * x + an[2]) * Math.exp(-x / an[3]) + an[4];
    case 'dampedcos': // y = a*cos(b*x+c)*e^(-x/d) + e
      return (an, x) => an[0] * Math.cos(an[1] * x + an[2]) * Math.exp(-x / an[3]) + an[4];
    default:
      return () => 0; // Fonction par défaut qui ne fait rien
  }
}

// Écouteur pour les messages venant du thread principal
self.onmessage = async function (e) {
  if (!self.Alglib) {
    self.postMessage({
      type: 'error',
      success: false,
      error: alglibLoadError
        ? `Alglib n'a pas pu être chargé : ${alglibLoadError.message || alglibLoadError}`
        : "La bibliothèque Alglib n'a pas pu être chargée dans le Web Worker."
    });
    return;
  }

  const { data, modelType, initialGuess } = e.data;
  let iterationCount = 0; // Compteur pour ne pas spammer

  try {
    const f = getFunction(modelType);

    const fn1 = function (a) {
      iterationCount++;

      // Toutes les 1000 itérations, on envoie l'état actuel au thread principal
      if (iterationCount % 1000 === 0) {
        self.postMessage({ 
          type: 'partial_update', 
          params: Array.from(a) 
        });
      }

      // Calcul des moindres carrés avec protection contre les singularités et divisions par zéro
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const val = f(a, data[i][0]);
        if (!Number.isFinite(val)) return 1e30; // Pénalité forte si le paramètre sort du domaine
        const diff = data[i][1] - val;
        sum += diff * diff;
      }
      const norm = Math.sqrt(sum);
      if (!Number.isFinite(norm)) return 1e30;
      return norm;
    };

    let solver = new Alglib();
    solver.add_function(fn1);
    await solver.promise;

    solver.solve('min', initialGuess);
    let params = solver.get_results();
    const termType = solver.termType;
    solver.remove();

    if (termType === -8 || (Array.isArray(params) && params.some(p => !Number.isFinite(p)))) {
      self.postMessage({
        type: 'error',
        success: false,
        error: "L'ajustement a échoué : divergence numérique dans Alglib."
      });
      return;
    }

    // Renvoyer le résultat FINAL
    self.postMessage({ type: 'final_result', success: true, params: params });

  } catch (error) {
    self.postMessage({ type: 'error', success: false, error: error.message });
  }
};
