export const DEFAULT_MODEL_RESOLUTION = 400; // Nombre de points pour le tracé du modèle

export const SUPPORTED_MODEL_TYPES = new Set([
  "linear", "affine", "quadratic", "power",
  "exp1", "exp2", "ln", "log",
  "sin", "cos", "dampedsin", "dampedcos"
]);

/**
 * Retourne le nombre de paramètres attendus pour un type de modèle donné.
 * @param {string} type
 * @returns {number}
 */
export function getModelParamCount(type) {
  switch (type) {
    case "linear":
      return 1;
    case "quadratic":
      return 3;
    case "sin":
    case "cos":
      return 4;
    case "dampedsin":
    case "dampedcos":
      return 5;
    default:
      return 2;
  }
}

/**
 * Retourne le libellé français d'un type de modèle.
 * @param {string} type
 * @returns {string}
 */
export function getModelName(type) {
  switch (type) {
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

/**
 * Retourne l'équation formatée en HTML d'un modèle.
 * @param {string} type
 * @param {string} xTitle
 * @param {string} yTitle
 * @param {Array<{name: string}>} parameters
 * @returns {string}
 */
export function getModelEquationString(type, xTitle, yTitle, parameters) {
  switch (type) {
    case "linear":
      return `${yTitle} = ${parameters[0].name}·${xTitle}`;
    case "affine":
      return `${yTitle} = ${parameters[0].name}·${xTitle} + ${parameters[1].name}`;
    case "quadratic":
      return `${yTitle} = ${parameters[0].name}·${xTitle}² + ${parameters[1].name}·${xTitle} + ${parameters[2].name}`;
    case "power":
      return `${yTitle} = ${parameters[0].name}·${xTitle}<sup>${parameters[1].name}</sup>`;
    case "exp1":
      return `${yTitle} = ${parameters[0].name}·e<sup>-${xTitle}/${parameters[1].name}</sup>`;
    case "exp2":
      return `${yTitle} = ${parameters[0].name}·(1 - e<sup>-${xTitle}/${parameters[1].name}</sup>)`;
    case "ln":
      return `${yTitle} = ${parameters[0].name}·ln(${xTitle}) + ${parameters[1].name}`;
    case "log":
      return `${yTitle} = ${parameters[0].name}·log(${xTitle}) + ${parameters[1].name}`;
    case "sin":
      return `${yTitle} = ${parameters[0].name}·sin(${parameters[1].name}·${xTitle} + ${parameters[2].name}) + ${parameters[3].name}`;
    case "cos":
      return `${yTitle} = ${parameters[0].name}·cos(${parameters[1].name}·${xTitle} + ${parameters[2].name}) + ${parameters[3].name}`;
    case "dampedsin":
      return `${yTitle} = ${parameters[0].name}·sin(${parameters[1].name}·${xTitle} + ${parameters[2].name})·e<sup>-${xTitle}/${parameters[3].name}</sup> + ${parameters[4].name}`;
    case "dampedcos":
      return `${yTitle} = ${parameters[0].name}·cos(${parameters[1].name}·${xTitle} + ${parameters[2].name})·e<sup>-${xTitle}/${parameters[3].name}</sup> + ${parameters[4].name}`;
    default:
      return "Modèle non défini";
  }
}

/**
 * Retourne la fonction mathématique correspondant au type de modèle.
 * ATTENTION : doit rester strictement identique à `getFunction` dans `fitter.worker.js`
 * (vérifié par `tests/grapher/modelWorkerParity.test.mjs`).
 * @param {string} type
 * @returns {(a_n: number[], x: number) => number}
 */
export function getModelFunction(type) {
  switch (type) {
    case "linear":
      return (a_n, x) => a_n[0] * x;
    case "affine":
      return (a_n, x) => a_n[0] * x + a_n[1];
    case "quadratic":
      return (a_n, x) => a_n[0] * Math.pow(x, 2) + a_n[1] * x + a_n[2];
    case "power":
      return (a_n, x) => a_n[0] * Math.pow(x, a_n[1]);
    case "exp1":
      return (a_n, x) => a_n[0] * Math.exp(-x / a_n[1]);
    case "exp2":
      return (a_n, x) => a_n[0] * (1 - Math.exp(-x / a_n[1]));
    case "ln":
      return (a_n, x) => a_n[0] * Math.log(x) + a_n[1];
    case "log":
      return (a_n, x) => a_n[0] * Math.log10(x) + a_n[1];
    case "sin":
      return (a_n, x) => a_n[0] * Math.sin(a_n[1] * x + a_n[2]) + a_n[3];
    case "cos":
      return (a_n, x) => a_n[0] * Math.cos(a_n[1] * x + a_n[2]) + a_n[3];
    case "dampedsin":
      return (a_n, x) => a_n[0] * Math.sin(a_n[1] * x + a_n[2]) * Math.exp(-x / a_n[3]) + a_n[4];
    case "dampedcos":
      return (a_n, x) => a_n[0] * Math.cos(a_n[1] * x + a_n[2]) * Math.exp(-x / a_n[3]) + a_n[4];
    default:
      return () => 0;
  }
}
