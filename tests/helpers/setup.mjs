const createMockElement = () => ({
  value: '',
  textContent: '',
  style: {},
  classList: {
    add: () => {},
    remove: () => {},
    toggle: () => {},
    contains: () => false
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  setAttribute: () => {},
  removeAttribute: () => {},
  appendChild: () => {},
  remove: () => {}
});

if (!global.document) {
  global.document = {
    querySelector: (sel) => (global.__querySelectorOverride ? global.__querySelectorOverride(sel) : createMockElement()),
    querySelectorAll: (sel) => (global.__querySelectorAllOverride ? global.__querySelectorAllOverride(sel) : []),
    getElementById: (id) => (global.__getElementByIdOverride ? global.__getElementByIdOverride(id) : createMockElement()),
    createElement: (tag) => (global.__createElementOverride ? global.__createElementOverride(tag) : createMockElement()),
    createDocumentFragment: () => createMockElement(),
    body: createMockElement()
  };
} else {
  const origQS = global.document.querySelector;
  global.document.querySelector = (sel) => (global.__querySelectorOverride ? global.__querySelectorOverride(sel) : (origQS ? origQS(sel) : createMockElement()));
  if (!global.document.createElement) global.document.createElement = (tag) => (global.__createElementOverride ? global.__createElementOverride(tag) : createMockElement());
  if (!global.document.createDocumentFragment) global.document.createDocumentFragment = () => createMockElement();
  if (!global.document.body) global.document.body = createMockElement();
}

if (!global.window) {
  global.window = global;
}

// Mock minimal pour Highcharts (génération de clés uniques pour Model et chargement de Grapher)
if (!global.Highcharts) {
  global.Highcharts = {
    uniqueKey: () => 'model-' + Math.random().toString(36).slice(2),
    getOptions: () => ({ colors: ['#2caffe', '#544fc5', '#00e272', '#fe6a35'] }),
    Axis: function() {},
    wrap: function(obj, method, func) {
      const orig = obj[method];
      obj[method] = function(...args) {
        return func.call(this, orig ? orig.bind(this) : () => {}, ...args);
      };
    },
    SVGRenderer: function() {}
  };
  global.Highcharts.Axis.prototype = { setExtremes: () => {} };
  global.Highcharts.SVGRenderer.prototype = { symbols: {} };
} else {
  if (!global.Highcharts.getOptions) {
    global.Highcharts.getOptions = () => ({ colors: ['#2caffe', '#544fc5', '#00e272', '#fe6a35'] });
  }
  if (!global.Highcharts.Axis) {
    global.Highcharts.Axis = function() {};
    global.Highcharts.Axis.prototype = { setExtremes: () => {} };
  }
  if (!global.Highcharts.wrap) {
    global.Highcharts.wrap = function(obj, method, func) {
      const orig = obj[method];
      obj[method] = function(...args) {
        return func.call(this, orig ? orig.bind(this) : () => {}, ...args);
      };
    };
  }
  if (!global.Highcharts.SVGRenderer) {
    global.Highcharts.SVGRenderer = function() {};
    global.Highcharts.SVGRenderer.prototype = { symbols: {} };
  }
}

// Chargement de Math.js en global tel qu'il est présent dans le navigateur
if (!global.math) {
  const mathModule = await import('../../common/math.js/math.min.js');
  global.math = mathModule.default || mathModule;
}

