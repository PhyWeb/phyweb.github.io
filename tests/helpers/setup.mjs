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

