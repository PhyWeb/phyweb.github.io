/**
 * fitter.worker.js
 * Ce Web Worker est dédié à l'ajustement de modèle (fitting) en utilisant Alglib.
 * Il reçoit les données, le type de modèle et une estimation initiale,
 * puis effectue le calcul en arrière-plan pour ne pas geler l'interface utilisateur.
 */

// On importe la librairie Alglib dans le scope du worker.
try {
  // Charge le script Alglib dans le scope global du worker.
  importScripts('../../common/alglib/alglib-v1.1.0.js'); 
} catch (e) {
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
    case 'dampedsin': // y = a*sin(b*x+c)*e^(-x*d) + e
      return (an, x) => an[0] * Math.sin(an[1] * x + an[2]) * Math.exp(-x * an[3]) + an[4];
    case 'dampedcos': // y = a*cos(b*x+c)*e^(-x*d) + e
      return (an, x) => an[0] * Math.cos(an[1] * x + an[2]) * Math.exp(-x * an[3]) + an[4];
    default:
      return () => 0; // Fonction par défaut qui ne fait rien
  }
}

// Écouteur pour les messages venant du thread principal
self.onmessage = async function (e) {
  if (!self.Alglib) {
    return; // Stoppe si Alglib n'est pas chargé
  }

  const { data, modelType, initialGuess } = e.data;

  try {
    const f = getFunction(modelType);

    // La fonction d'erreur à minimiser
    const fn1 = function (a) {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += Math.pow(data[i][1] - f(a, data[i][0]), 2);
      }
      return Math.sqrt(sum);
    };

    let solver = new Alglib();
    solver.add_function(fn1);
    await solver.promise; // Attendre que le module wasm soit prêt

    solver.solve('min', initialGuess);
    let params = solver.get_results();
    solver.remove();

    // Renvoyer le résultat au thread principal
    self.postMessage({ success: true, params: params });

  } catch (error) {
    console.error("Erreur dans le Web Worker d'ajustement:", error);
    self.postMessage({ success: false, error: error.message });
  }
};
