import '../helpers/setup.mjs';
import fs from 'node:fs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';
import { Calculation } from '../../grapher/modules/calculation.js';

if (!global.CodeMirror) {
  global.CodeMirror = {
    defineMode: (name, modeFactory) => {
      global.CodeMirror._modes = global.CodeMirror._modes || {};
      global.CodeMirror._modes[name] = modeFactory;
    }
  };
}

describe('Contrôle Mega-Dropdown des Constantes dans l\'onglet Calculs', () => {
  describe('Conformité HTML dans grapher/index.html', () => {
    const htmlContent = fs.readFileSync('grapher/index.html', 'utf8');

    it('doit contenir le composant #constants-dropdown juste après #functions-dropdown dans .level-left', () => {
      assert.match(
        htmlContent,
        /<div class="dropdown" id="constants-dropdown">/,
        'Le conteneur doit avoir l\'ID constants-dropdown'
      );
      assert.match(
        htmlContent,
        /<button class="button is-purple-light"[^>]*aria-controls="constants-dropdown-menu"[^>]*>/,
        'Le déclencheur doit avoir un bouton is-purple-light avec aria-controls="constants-dropdown-menu"'
      );
      assert.match(
        htmlContent,
        /<span class="icon"[^>]*>[\s\S]*?π[\s\S]*?<\/span>/,
        'Le bouton doit contenir le symbole π'
      );
      assert.match(
        htmlContent,
        /<span>Constantes<\/span>/,
        'Le bouton doit afficher le texte "Constantes"'
      );
      assert.match(
        htmlContent,
        /fas fa-angle-down/,
        'Le bouton doit contenir la flèche fas fa-angle-down'
      );
      assert.match(
        htmlContent,
        /<div class="dropdown-menu" id="constants-dropdown-menu" role="menu" style="[^"]*min-width:\s*740px;?[^"]*">/,
        'Le menu doit avoir style="min-width: 740px;" et role="menu"'
      );
      assert.match(
        htmlContent,
        /<div class="dropdown-content p-4" id="calculation-constants-content"><\/div>/,
        'Le contenu doit avoir les classes dropdown-content p-4 et id calculation-constants-content'
      );
    });

    it('doit positionner constants-dropdown après functions-dropdown dans le DOM', () => {
      const fnIdx = htmlContent.indexOf('id="functions-dropdown"');
      const constIdx = htmlContent.indexOf('id="constants-dropdown"');
      assert.ok(fnIdx !== -1, 'functions-dropdown doit exister');
      assert.ok(constIdx !== -1, 'constants-dropdown doit exister');
      assert.ok(constIdx > fnIdx, 'constants-dropdown doit être après functions-dropdown');
    });
  });

  describe('Calculation.js - Reconnaissance de pi insensible à la casse', () => {
    const calc = new Calculation({ derivatePoints: 5, derivateEdges: true });

    it('doit reconnaître pi dans evaluateBlock sans erreur de variable non définie', () => {
      const formulas = [{ variableName: 'c', expression: '2 * pi * r', unit: 'm' }];
      const scope = { r: { value: 10, unit: 'm' } };
      const { results, errors } = calc.evaluateBlock(formulas, scope);
      assert.strictEqual(errors.length, 0);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].variableName, 'c');
      assert.ok(Math.abs(results[0].data.value - 20 * Math.PI) < 1e-10);
    });

    it('doit reconnaître PI et Pi dans evaluateBlock', () => {
      const formulas = [
        { variableName: 'c1', expression: 'PI', unit: '' },
        { variableName: 'c2', expression: 'Pi', unit: '' }
      ];
      const { results, errors } = calc.evaluateBlock(formulas, {});
      assert.strictEqual(errors.length, 0);
      assert.strictEqual(results.length, 2);
      assert.strictEqual(results[0].data.value, Math.PI);
      assert.strictEqual(results[1].data.value, Math.PI);
    });
  });

  describe('UIManager - updateCalculationUI() et génération du catalogue des constantes', () => {
    let ui;
    let mockCalculation;
    let mockData;
    let functionsContentElement;
    let constantsContentElement;
    let curvesContainer;
    let paramsContainer;

    function createFakeElement(tag = 'div') {
      const el = {
        tagName: tag.toUpperCase(),
        className: '',
        id: '',
        style: {},
        dataset: {},
        innerHTML: '',
        children: [],
        appendChild(child) {
          this.children.push(child);
          return child;
        },
        setAttribute(name, val) {
          if (!this.attributes) this.attributes = {};
          this.attributes[name] = val;
          if (name.startsWith('data-')) {
            const key = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            this.dataset[key] = val;
          }
        },
        querySelectorAll(sel) {
          const results = [];
          function traverse(node) {
            for (const child of node.children || []) {
              if (sel === '.column' && child.className.includes('column')) results.push(child);
              if (sel === 'a' && child.tagName === 'A') results.push(child);
              if (sel.startsWith('a[data-symbol') && child.tagName === 'A' && child.dataset?.symbol) results.push(child);
              traverse(child);
            }
          }
          traverse(this);
          return results;
        }
      };
      return el;
    }

    beforeEach(() => {
      mockCalculation = new Calculation({ derivatePoints: 5, derivateEdges: true });
      mockData = {
        curves: [{ title: 't', unit: 's' }],
        parameters: { m: { value: 2, unit: 'kg' } },
        settings: { significantDigits: 4 },
        models: []
      };

      functionsContentElement = createFakeElement('div');
      functionsContentElement.id = 'calculation-functions-content';

      constantsContentElement = createFakeElement('div');
      constantsContentElement.id = 'calculation-constants-content';

      curvesContainer = createFakeElement('ul');
      curvesContainer.id = 'calculation-sidebar-curves';

      paramsContainer = createFakeElement('ul');
      paramsContainer.id = 'calculation-sidebar-params';

      global.__getElementByIdOverride = (id) => {
        if (id === 'calculation-functions-content') return functionsContentElement;
        if (id === 'calculation-constants-content') return constantsContentElement;
        if (id === 'calculation-sidebar-curves') return curvesContainer;
        if (id === 'calculation-sidebar-params') return paramsContainer;
        return null;
      };

      global.__createElementOverride = (tag) => createFakeElement(tag);

      ui = Object.create(UIManager.prototype);
      ui.calculation = mockCalculation;
      ui.data = mockData;
      ui.editor = {
        setOption: () => {}
      };
    });

    it('génère 4 catégories de constantes dans #calculation-constants-content', () => {
      ui.updateCalculationUI();

      assert.strictEqual(constantsContentElement.children.length, 1);
      const grid = constantsContentElement.children[0];
      assert.strictEqual(grid.className, 'columns is-multiline is-variable is-3');
      assert.strictEqual(grid.children.length, 4);

      // Catégorie 1: Mécanique & Gravitation
      const cat1 = grid.children[0];
      assert.ok(cat1.className.includes('column is-6'));
      assert.strictEqual(cat1.children[0].textContent, 'Mécanique & Gravitation');

      // Catégorie 2: Ondes, Optique & Quantique
      const cat2 = grid.children[1];
      assert.ok(cat2.className.includes('column is-6'));
      assert.strictEqual(cat2.children[0].textContent, 'Ondes, Optique & Quantique');

      // Catégorie 3: Thermodynamique & Chimie
      const cat3 = grid.children[2];
      assert.ok(cat3.className.includes('column is-6'));
      assert.strictEqual(cat3.children[0].textContent, 'Thermodynamique & Chimie');

      // Catégorie 4: Mathématiques
      const cat4 = grid.children[3];
      assert.ok(cat4.className.includes('column is-6'));
      assert.strictEqual(cat4.children[0].textContent, 'Mathématiques');
    });

    it('contient toutes les constantes requises avec leurs attributs exacts', () => {
      ui.updateCalculationUI();

      const allLinks = constantsContentElement.querySelectorAll('a');
      assert.strictEqual(allLinks.length, 10, 'Doit contenir 10 constantes au total');

      const bySymbol = {};
      allLinks.forEach(a => {
        bySymbol[a.dataset.symbol] = a;
      });

      // g
      assert.ok(bySymbol['g'], 'g doit être présent');
      assert.strictEqual(bySymbol['g'].dataset.value, '9.81');
      assert.strictEqual(bySymbol['g'].dataset.unit, 'N/kg');
      assert.strictEqual(bySymbol['g'].dataset.native, 'false');
      assert.ok(bySymbol['g'].innerHTML.includes('Intensité de la pesanteur (9,81 N/kg)'));

      // G
      assert.ok(bySymbol['G'], 'G doit être présent');
      assert.strictEqual(bySymbol['G'].dataset.value, '6.674e-11');
      assert.strictEqual(bySymbol['G'].dataset.unit, 'N.m²/kg²');
      assert.strictEqual(bySymbol['G'].dataset.native, 'false');
      assert.ok(bySymbol['G'].innerHTML.includes('N·m<sup>2</sup>·kg<sup>-2</sup>'), 'G doit afficher son unité N·m²·kg⁻² au lieu de SI');

      // c
      assert.ok(bySymbol['c'], 'c doit être présent');
      assert.strictEqual(bySymbol['c'].dataset.value, '2.998e8');
      assert.strictEqual(bySymbol['c'].dataset.unit, 'm/s');

      // h
      assert.ok(bySymbol['h'], 'h doit être présent');
      assert.strictEqual(bySymbol['h'].dataset.value, '6.626e-34');
      assert.strictEqual(bySymbol['h'].dataset.unit, 'J.s');
      assert.ok(bySymbol['h'].innerHTML.includes('10<sup>-34</sup>'), 'h doit afficher 10^-34 avec balise sup');

      // qe
      assert.ok(bySymbol['qe'], 'qe doit être présent');
      assert.strictEqual(bySymbol['qe'].dataset.value, '1.602e-19');
      assert.strictEqual(bySymbol['qe'].dataset.unit, 'C');
      assert.ok(bySymbol['qe'].innerHTML.includes('q<sub>e</sub>'), 'qe doit afficher q_e avec indice sub');
      assert.ok(bySymbol['qe'].innerHTML.includes('10<sup>-19</sup>'), 'qe doit afficher 10^-19 avec balise sup');

      // NA
      assert.ok(bySymbol['NA'], 'NA doit être présent');
      assert.strictEqual(bySymbol['NA'].dataset.value, '6.022e23');
      assert.strictEqual(bySymbol['NA'].dataset.unit, 'mol^-1');
      assert.ok(bySymbol['NA'].innerHTML.includes('N<sub>A</sub>'), 'NA doit afficher N_A avec indice sub');
      assert.ok(bySymbol['NA'].innerHTML.includes('10<sup>23</sup>'), 'NA doit afficher 10^23 avec balise sup');

      // R
      assert.ok(bySymbol['R'], 'R doit être présent');
      assert.strictEqual(bySymbol['R'].dataset.value, '8.314');
      assert.strictEqual(bySymbol['R'].dataset.unit, 'J/(mol.K)');

      // kB
      assert.ok(bySymbol['kB'], 'kB doit être présent');
      assert.strictEqual(bySymbol['kB'].dataset.value, '1.381e-23');
      assert.strictEqual(bySymbol['kB'].dataset.unit, 'J/K');
      assert.ok(bySymbol['kB'].innerHTML.includes('k<sub>B</sub>'), 'kB doit afficher k_B avec indice sub');
      assert.ok(bySymbol['kB'].innerHTML.includes('10<sup>-23</sup>'), 'kB doit afficher 10^-23 avec balise sup');

      // F
      assert.ok(bySymbol['F'], 'F doit être présent');
      assert.strictEqual(bySymbol['F'].dataset.value, '9.649e4');
      assert.strictEqual(bySymbol['F'].dataset.unit, 'C/mol');

      // pi
      assert.ok(bySymbol['pi'], 'pi doit être présent');
      assert.strictEqual(bySymbol['pi'].dataset.native, 'true');
      assert.ok(bySymbol['pi'].innerHTML.includes('Nombre π (3,14159...)'));

      // Style des tags
      allLinks.forEach(link => {
        assert.ok(
          link.innerHTML.includes('tag is-purple-light has-text-weight-bold'),
          'Chaque constante doit avoir tag is-purple-light has-text-weight-bold'
        );
      });
    });

    it('affiche les puissances de 10 avec la balise sup dans la liste des paramètres à gauche', () => {
      mockData.parameters.h = { value: 6.626e-34, unit: 'J.s' };
      ui.updateCalculationUI();

      const paramLinks = paramsContainer.querySelectorAll('a');
      const hLink = paramLinks.find(a => a.dataset.value === 'h');
      assert.ok(hLink, 'Le paramètre h doit être présent dans la barre latérale');
      assert.ok(
        hLink.innerHTML.includes('6,626·10<sup>-34</sup>'),
        'La valeur de h doit être affichée avec <sup>-34</sup> pour éviter le décalage de chiffres'
      );
    });

    it('colore pi comme une constante (def) dans le mode CodeMirror phyweb-calc', () => {
      let definedModeFactory = null;
      global.CodeMirror.defineMode = (name, factory) => {
        if (name === 'phyweb-calc') {
          definedModeFactory = factory;
        }
      };

      ui.updateCalculationUI();

      assert.ok(definedModeFactory, 'Le mode phyweb-calc doit avoir été défini');
      const mode = definedModeFactory();

      const createFakeStream = (text) => {
        let pos = 0;
        let matched = '';
        return {
          eatSpace: () => false,
          match: (regex) => {
            const rest = text.slice(pos);
            const m = rest.match(regex);
            if (m && m.index === 0) {
              matched = m[0];
              pos += matched.length;
              return true;
            }
            return false;
          },
          current: () => matched,
          next: () => { pos++; }
        };
      };

      // Test coloration de 'pi'
      const streamPi = createFakeStream('pi');
      const tokenPi = mode.token(streamPi);
      assert.strictEqual(tokenPi, 'def', 'Le mot "pi" doit être coloré en "def"');

      // Test coloration d'un paramètre existant 'm'
      const streamM = createFakeStream('m');
      const tokenM = mode.token(streamM);
      assert.strictEqual(tokenM, 'def', 'Le paramètre "m" doit être coloré en "def"');

      // Test coloration d'une fonction usuelle 'sqrt'
      const streamSqrt = createFakeStream('sqrt');
      const tokenSqrt = mode.token(streamSqrt);
      assert.strictEqual(tokenSqrt, 'phyweb-function', 'La fonction "sqrt" doit être colorée en "phyweb-function"');

      // Test coloration des fonctions d'analyse 'diff', 'integrate', 'smooth' (is-warning)
      for (const fn of ['diff', 'integrate', 'smooth']) {
        const streamFn = createFakeStream(fn);
        const tokenFn = mode.token(streamFn);
        assert.strictEqual(tokenFn, 'phyweb-function-warning', `La fonction "${fn}" doit être colorée en "phyweb-function-warning"`);
      }
    });

    it('vérifie que les couleurs dans grapher.css reprennent celles des dropdown Bulma', () => {
      const cssContent = fs.readFileSync('grapher/lib/grapher.css', 'utf8');
      assert.match(
        cssContent,
        /\.cm-phyweb-function\s*\{[^}]*color:\s*#485fc7/,
        '.cm-phyweb-function doit avoir la couleur is-link (#485fc7)'
      );
      assert.match(
        cssContent,
        /\.cm-phyweb-function-warning\s*\{[^}]*color:\s*#c27803/,
        '.cm-phyweb-function-warning doit avoir la couleur is-warning (#c27803)'
      );
      assert.match(
        cssContent,
        /\.cm-def\s*\{[^}]*color:\s*#7b1fa2/,
        '.cm-def doit avoir la couleur violette (#7b1fa2)'
      );
      assert.match(
        cssContent,
        /sup,\s*sub\s*\{[^}]*vertical-align:\s*baseline/,
        'grapher.css doit normaliser sup et sub avec vertical-align: baseline'
      );
      assert.match(
        cssContent,
        /\.tag\s+sub,\s*\.tag\s+sup/,
        'grapher.css doit positionner les sub et sup dans les tags Bulma'
      );
    });
  });

  describe('UIManager - initCalculationControls() interactions constantes dropdown', () => {
    let ui;
    let functionsDropdownClasses;
    let constantsDropdownClasses;
    let functionsTriggerListener;
    let constantsTriggerListener;
    let constantsContentListener;
    let docClickListener;
    let insertedTexts;
    let cursorPosition;
    let editorLines;
    let replaceRangeCalls;
    let appliedCalculations;
    let toasts;

    beforeEach(() => {
      functionsDropdownClasses = new Set();
      constantsDropdownClasses = new Set();
      functionsTriggerListener = null;
      constantsTriggerListener = null;
      constantsContentListener = null;
      docClickListener = null;
      insertedTexts = [];
      cursorPosition = { line: 0, ch: 0 };
      editorLines = [''];
      replaceRangeCalls = [];
      appliedCalculations = [];
      toasts = [];

      const mockFunctionsTrigger = {
        addEventListener: (event, fn) => {
          if (event === 'click') functionsTriggerListener = fn;
        }
      };

      const mockFunctionsDropdown = {
        classList: {
          add: (cls) => functionsDropdownClasses.add(cls),
          remove: (cls) => functionsDropdownClasses.delete(cls),
          toggle: (cls) => {
            if (functionsDropdownClasses.has(cls)) {
              functionsDropdownClasses.delete(cls);
              return false;
            } else {
              functionsDropdownClasses.add(cls);
              return true;
            }
          },
          contains: (cls) => functionsDropdownClasses.has(cls)
        },
        querySelector: (sel) => (sel === '.dropdown-trigger' ? mockFunctionsTrigger : null),
        contains: (target) => target === mockFunctionsDropdown || target === mockFunctionsTrigger
      };

      const mockConstantsTrigger = {
        addEventListener: (event, fn) => {
          if (event === 'click') constantsTriggerListener = fn;
        }
      };

      const mockConstantsDropdown = {
        classList: {
          add: (cls) => constantsDropdownClasses.add(cls),
          remove: (cls) => constantsDropdownClasses.delete(cls),
          toggle: (cls) => {
            if (constantsDropdownClasses.has(cls)) {
              constantsDropdownClasses.delete(cls);
              return false;
            } else {
              constantsDropdownClasses.add(cls);
              return true;
            }
          },
          contains: (cls) => constantsDropdownClasses.has(cls)
        },
        querySelector: (sel) => (sel === '.dropdown-trigger' ? mockConstantsTrigger : null),
        contains: (target) => target === mockConstantsDropdown || target === mockConstantsTrigger
      };

      const mockConstantsContent = {
        addEventListener: (event, fn) => {
          if (event === 'click') constantsContentListener = fn;
        }
      };

      global.__getElementByIdOverride = (id) => {
        if (id === 'functions-dropdown') return mockFunctionsDropdown;
        if (id === 'constants-dropdown') return mockConstantsDropdown;
        if (id === 'calculation-functions-content') return { addEventListener: () => {} };
        if (id === 'calculation-constants-content') return mockConstantsContent;
        if (id === 'calculation-sidebar') return { addEventListener: () => {} };
        if (id === 'apply-calculation-button') return { addEventListener: () => {} };
        if (id === 'calculs-tab') return { addEventListener: () => {} };
        return null;
      };

      global.__querySelectorOverride = (sel) => {
        if (sel === '#apply-calculation-button') return { addEventListener: () => {} };
        if (sel === '#calculation-sidebar') return { addEventListener: () => {} };
        if (sel === '#calculs-tab') return { addEventListener: () => {} };
        return null;
      };

      const origAddEventListener = global.document.addEventListener;
      global.document.addEventListener = (event, fn) => {
        if (event === 'click') docClickListener = fn;
        origAddEventListener(event, fn);
      };

      ui = Object.create(UIManager.prototype);
      ui.data = {
        curves: [{ title: 't', unit: 's', type: 'measured' }],
        parameters: {}
      };
      ui.app = {
        applyCalculation: (text) => {
          appliedCalculations.push(text);
          return true;
        }
      };
      ui.editor = {
        getWrapperElement: () => ({ classList: { add: () => {} } }),
        setOption: () => {},
        replaceSelection: (text) => {
          insertedTexts.push(text);
          const line = editorLines[cursorPosition.line] || '';
          editorLines[cursorPosition.line] = line.slice(0, cursorPosition.ch) + text + line.slice(cursorPosition.ch);
          cursorPosition.ch += text.length;
        },
        replaceRange: (text, pos) => {
          replaceRangeCalls.push({ text, pos });
          const addedLines = text.split('\n').length - 1;
          if (pos && (pos.line < cursorPosition.line || (pos.line === cursorPosition.line && pos.ch < cursorPosition.ch)) && addedLines > 0) {
            cursorPosition.line += addedLines;
          }
          const fullText = editorLines.join('\n');
          const newFullText = text + fullText;
          editorLines = newFullText.split('\n');
        },
        getCursor: () => ({ ...cursorPosition }),
        setCursor: (pos) => { cursorPosition = { ...pos }; },
        getLine: (lineNo) => editorLines[lineNo] || '',
        getValue: () => editorLines.join('\n'),
        focus: () => {}
      };
      ui.updateCalculationUI = () => {};
    });

    it('ouvre et ferme #constants-dropdown avec stopPropagation', () => {
      ui.initCalculationControls();
      assert.ok(constantsTriggerListener);

      let stopped = false;
      constantsTriggerListener({ stopPropagation: () => { stopped = true; } });
      assert.strictEqual(stopped, true);
      assert.strictEqual(constantsDropdownClasses.has('is-active'), true);

      // Clic à nouveau pour fermer
      constantsTriggerListener({ stopPropagation: () => {} });
      assert.strictEqual(constantsDropdownClasses.has('is-active'), false);
    });

    it('assure l\'exclusivité mutuelle entre functions-dropdown et constants-dropdown', () => {
      ui.initCalculationControls();

      // Ouvrir functions-dropdown
      functionsTriggerListener({ stopPropagation: () => {} });
      assert.strictEqual(functionsDropdownClasses.has('is-active'), true);
      assert.strictEqual(constantsDropdownClasses.has('is-active'), false);

      // Ouvrir constants-dropdown -> doit fermer functions-dropdown
      constantsTriggerListener({ stopPropagation: () => {} });
      assert.strictEqual(constantsDropdownClasses.has('is-active'), true);
      assert.strictEqual(functionsDropdownClasses.has('is-active'), false);

      // Ré-ouvrir functions-dropdown -> doit fermer constants-dropdown
      functionsTriggerListener({ stopPropagation: () => {} });
      assert.strictEqual(functionsDropdownClasses.has('is-active'), true);
      assert.strictEqual(constantsDropdownClasses.has('is-active'), false);
    });

    it('ferme #constants-dropdown lors d\'un clic sur document', () => {
      ui.initCalculationControls();
      constantsDropdownClasses.add('is-active');

      assert.ok(docClickListener);
      docClickListener({ target: {} });
      assert.strictEqual(constantsDropdownClasses.has('is-active'), false);
    });

    it('au clic sur pi (native: true), insère le symbole au curseur et ferme le dropdown', () => {
      ui.initCalculationControls();
      constantsDropdownClasses.add('is-active');

      const fakeLink = {
        dataset: { symbol: 'pi', value: '', unit: '', native: 'true' },
        getAttribute: (k) => fakeLink.dataset[k.replace('data-', '')]
      };

      constantsContentListener({
        preventDefault: () => {},
        target: { closest: (sel) => (sel === 'a[data-symbol]' ? fakeLink : null) }
      });

      assert.strictEqual(insertedTexts.length, 1);
      assert.strictEqual(insertedTexts[0], 'pi');
      assert.strictEqual(constantsDropdownClasses.has('is-active'), false);
      assert.strictEqual(replaceRangeCalls.length, 0, 'pi ne doit pas insérer de ligne de définition');
      assert.strictEqual(appliedCalculations.length, 0);
    });

    it('refuse d\'insérer une constante si le symbole est déjà utilisé par une grandeur mesurée du tableur', () => {
      ui.initCalculationControls();
      // 't' est déjà dans curves
      const fakeLink = {
        dataset: { symbol: 't', value: '1.0', unit: 's', native: 'false' },
        getAttribute: (k) => fakeLink.dataset[k.replace('data-', '')]
      };

      constantsContentListener({
        preventDefault: () => {},
        target: { closest: (sel) => (sel === 'a[data-symbol]' ? fakeLink : null) }
      });

      assert.strictEqual(insertedTexts.length, 0);
      assert.strictEqual(replaceRangeCalls.length, 0);
      assert.strictEqual(appliedCalculations.length, 0);
    });

    it('au clic sur g quand l\'utilisateur écrit après un "=", insère le symbole au curseur et déclare la constante en haut', () => {
      ui.initCalculationControls();
      constantsDropdownClasses.add('is-active');

      // Simule l'utilisateur tapant "Ep = m * "
      editorLines = ['Ep = m * '];
      cursorPosition = { line: 0, ch: 10 };

      const fakeLink = {
        dataset: { symbol: 'g', value: '9.81', unit: 'N/kg', native: 'false' },
        getAttribute: (k) => fakeLink.dataset[k.replace('data-', '')]
      };

      constantsContentListener({
        preventDefault: () => {},
        target: { closest: (sel) => (sel === 'a[data-symbol]' ? fakeLink : null) }
      });

      // 1. Symbole inséré au curseur
      assert.strictEqual(insertedTexts.length, 1);
      assert.strictEqual(insertedTexts[0], 'g');

      // 2. Ligne de définition insérée en haut
      assert.strictEqual(replaceRangeCalls.length, 1);
      assert.strictEqual(replaceRangeCalls[0].text, 'g_N/kg = 9.81\n');
      assert.deepStrictEqual(replaceRangeCalls[0].pos, { line: 0, ch: 0 });

      // 3. Calcul appliqué immédiatement
      assert.strictEqual(appliedCalculations.length, 1);
      assert.ok(appliedCalculations[0].startsWith('g_N/kg = 9.81\n'));

      // 4. Dropdown fermé
      assert.strictEqual(constantsDropdownClasses.has('is-active'), false);
    });

    it('au clic sur une constante déjà déclarée, insère au curseur sans la redéclarer', () => {
      ui.initCalculationControls();
      constantsDropdownClasses.add('is-active');

      // 'g' est déjà déclaré en ligne 0
      editorLines = ['g_N/kg = 9.81', 'Ep = m * '];
      cursorPosition = { line: 1, ch: 9 };

      const fakeLink = {
        dataset: { symbol: 'g', value: '9.81', unit: 'N/kg', native: 'false' },
        getAttribute: (k) => fakeLink.dataset[k.replace('data-', '')]
      };

      constantsContentListener({
        preventDefault: () => {},
        target: { closest: (sel) => (sel === 'a[data-symbol]' ? fakeLink : null) }
      });

      // Symbole inséré au curseur
      assert.strictEqual(insertedTexts.length, 1);
      assert.strictEqual(insertedTexts[0], 'g');

      // PAS de nouvelle ligne de définition
      assert.strictEqual(replaceRangeCalls.length, 0);
      assert.strictEqual(appliedCalculations.length, 0);
      assert.strictEqual(constantsDropdownClasses.has('is-active'), false);
    });

    it('au clic sur une constante non déclarée sans "=" avant le curseur, insère la définition en haut sans insérer au curseur', () => {
      ui.initCalculationControls();
      constantsDropdownClasses.add('is-active');

      editorLines = [''];
      cursorPosition = { line: 0, ch: 0 };

      const fakeLink = {
        dataset: { symbol: 'c', value: '2.998e8', unit: 'm/s', native: 'false' },
        getAttribute: (k) => fakeLink.dataset[k.replace('data-', '')]
      };

      constantsContentListener({
        preventDefault: () => {},
        target: { closest: (sel) => (sel === 'a[data-symbol]' ? fakeLink : null) }
      });

      // Rien au curseur
      assert.strictEqual(insertedTexts.length, 0);

      // Définition en haut
      assert.strictEqual(replaceRangeCalls.length, 1);
      assert.strictEqual(replaceRangeCalls[0].text, 'c_m/s = 2.998e8\n');
      assert.deepStrictEqual(cursorPosition, { line: 1, ch: 0 }, 'Le curseur doit avoir été déplacé sur la ligne 1');
      assert.strictEqual(appliedCalculations.length, 1);
      assert.strictEqual(constantsDropdownClasses.has('is-active'), false);
    });

    it('refuse d\'insérer une constante si le symbole est déjà utilisé par un paramètre de modèle', () => {
      ui.initCalculationControls();
      ui.data.parameters['g'] = { value: 9.81, unit: 'N/kg', type: 'model' };

      const fakeLink = {
        dataset: { symbol: 'g', value: '9.81', unit: 'N/kg', native: 'false' },
        getAttribute: (k) => fakeLink.dataset[k.replace('data-', '')]
      };

      constantsContentListener({
        preventDefault: () => {},
        target: { closest: (sel) => (sel === 'a[data-symbol]' ? fakeLink : null) }
      });

      assert.strictEqual(insertedTexts.length, 0);
      assert.strictEqual(replaceRangeCalls.length, 0);
      assert.strictEqual(appliedCalculations.length, 0);
    });

    it('refuse d\'insérer une constante si le symbole est déjà défini dans l\'éditeur avec une autre valeur ou formule', () => {
      ui.initCalculationControls();
      constantsDropdownClasses.add('is-active');

      // 'g' est déjà défini comme une variable différente
      editorLines = ['g = 5'];
      cursorPosition = { line: 0, ch: 5 };

      const fakeLink = {
        dataset: { symbol: 'g', value: '9.81', unit: 'N/kg', native: 'false' },
        getAttribute: (k) => fakeLink.dataset[k.replace('data-', '')]
      };

      constantsContentListener({
        preventDefault: () => {},
        target: { closest: (sel) => (sel === 'a[data-symbol]' ? fakeLink : null) }
      });

      assert.strictEqual(insertedTexts.length, 0);
      assert.strictEqual(replaceRangeCalls.length, 0);
      assert.strictEqual(appliedCalculations.length, 0);
    });
  });
});

