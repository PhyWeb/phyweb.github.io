// Configuration globale pour simuler l'environnement minimal requis par les modules dans Node.js
if (!global.document) {
  global.document = {
    querySelector: () => ({ value: '' }),
    querySelectorAll: () => [],
    getElementById: () => null
  };
}

if (!global.window) {
  global.window = global;
}

// Chargement de Math.js en global tel qu'il est présent dans le navigateur
if (!global.math) {
  const mathModule = await import('../../common/math.js/math.min.js');
  global.math = mathModule.default || mathModule;
}

// Mock minimal pour Highcharts (génération de clés uniques pour Model)
if (!global.Highcharts) {
  global.Highcharts = {
    uniqueKey: () => 'model-' + Math.random().toString(36).slice(2)
  };
}

