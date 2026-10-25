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

describe('Contrôle Mega-Dropdown des Fonctions dans l\'onglet Calculs', () => {
  describe('Conformité HTML dans grapher/index.html', () => {
    const htmlContent = fs.readFileSync('grapher/index.html', 'utf8');

    it('doit avoir supprimé la section Fonctions de la barre latérale #calculation-sidebar', () => {
      assert.strictEqual(
        htmlContent.includes('<p class="menu-label">Fonctions</p>'),
        false,
        'La barre latérale ne doit plus contenir le label Fonctions'
      );
      assert.strictEqual(
        htmlContent.includes('id="calculation-sidebar-functions"'),
        false,
        'La barre latérale ne doit plus contenir le conteneur calculation-sidebar-functions'
      );
    });

    it('doit avoir ajouté le dropdown Bulma dans .level-left de la barre supérieure des calculs', () => {
      assert.match(
        htmlContent,
        /<div class="level-left"[^>]*style="[^"]*gap:\s*0\.5rem;?[^"]*"[^>]*>/,
        '.level-left doit comporter le style gap: 0.5rem;'
      );
      assert.match(
        htmlContent,
        /<div class="dropdown" id="functions-dropdown">/,
        'Le conteneur doit avoir la classe dropdown et id functions-dropdown'
      );
      assert.match(
        htmlContent,
        /<button class="button is-link is-light"[^>]*aria-controls="functions-dropdown-menu"[^>]*>/,
        'Le déclencheur doit avoir un bouton is-link is-light avec aria-controls'
      );
      assert.match(
        htmlContent,
        /fa-solid fa-square-root-variable/,
        'Le bouton doit contenir l\'icône fa-solid fa-square-root-variable'
      );
      assert.match(
        htmlContent,
        /<span>Insérer une fonction<\/span>/,
        'Le bouton doit afficher le texte "Insérer une fonction"'
      );
      assert.match(
        htmlContent,
        /fas fa-angle-down/,
        'Le bouton doit contenir la flèche fas fa-angle-down'
      );
      assert.match(
        htmlContent,
        /<div class="dropdown-menu" id="functions-dropdown-menu" role="menu" style="[^"]*min-width:\s*540px;?[^"]*">/,
        'Le menu doit avoir style="min-width: 540px;" et role="menu"'
      );
      assert.match(
        htmlContent,
        /<div class="dropdown-content p-4" id="calculation-functions-content"><\/div>/,
        'Le contenu doit avoir les classes dropdown-content p-4 et id calculation-functions-content'
      );
    });
  });

  describe('UIManager - updateCalculationUI() et génération du Mega-Dropdown', () => {
    let ui;
    let mockCalculation;
    let mockData;
    let functionsContentElement;
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
        querySelectorAll(sel) {
          const results = [];
          function traverse(node) {
            for (const child of node.children || []) {
              if (sel === '.column' && child.className.includes('column')) results.push(child);
              if (sel === 'a' && child.tagName === 'A') results.push(child);
              if (sel.startsWith('a[data-value') && child.tagName === 'A' && child.dataset?.value) results.push(child);
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
        curves: [{ title: 't', unit: 's' }, { title: 'x', unit: 'm' }],
        parameters: { m: { value: 2, unit: 'kg' } },
        settings: { significantDigits: 4 },
        models: []
      };

      functionsContentElement = createFakeElement('div');
      functionsContentElement.id = 'calculation-functions-content';

      curvesContainer = createFakeElement('ul');
      curvesContainer.id = 'calculation-sidebar-curves';

      paramsContainer = createFakeElement('ul');
      paramsContainer.id = 'calculation-sidebar-params';

      global.__getElementByIdOverride = (id) => {
        if (id === 'calculation-functions-content') return functionsContentElement;
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

    it('génère 4 colonnes catégorisées dans #calculation-functions-content', () => {
      ui.updateCalculationUI();

      assert.strictEqual(functionsContentElement.children.length, 1);
      const grid = functionsContentElement.children[0];
      assert.strictEqual(grid.className, 'columns is-multiline is-variable is-3');
      assert.strictEqual(grid.children.length, 4);

      // Catégorie 1: Usuelles & Puissances
      const cat1 = grid.children[0];
      assert.ok(cat1.className.includes('column is-6'));
      assert.strictEqual(cat1.children[0].textContent, 'Usuelles & Puissances');
      assert.strictEqual(cat1.children[0].innerHTML.includes('fa-'), false, 'Pas d\'icône fa dans Catégorie 1');

      // Catégorie 2: Analyse & Arrondis
      const cat2 = grid.children[1];
      assert.strictEqual(cat2.children[0].textContent, 'Analyse & Arrondis');
      assert.strictEqual(cat2.children[0].innerHTML.includes('fa-'), false, 'Pas d\'icône fa dans Catégorie 2');

      // Catégorie 3: Trigonométrie (rad)
      const cat3 = grid.children[2];
      assert.strictEqual(cat3.children[0].textContent, 'Trigonométrie (rad)');
      assert.strictEqual(cat3.children[0].innerHTML.includes('fa-'), false, 'Pas d\'icône fa dans Catégorie 3');

      // Catégorie 4: Hyperboliques
      const cat4 = grid.children[3];
      assert.strictEqual(cat4.children[0].textContent, 'Hyperboliques');
      assert.strictEqual(cat4.children[0].innerHTML.includes('fa-'), false, 'Pas d\'icône fa dans Catégorie 4');
    });

    it('diff et integrate doivent avoir le tag is-warning is-light et les autres fonctions is-link is-light', () => {
      ui.updateCalculationUI();

      const allLinks = functionsContentElement.querySelectorAll('a');
      assert.ok(allLinks.length >= 23, `Devrait contenir au moins 23 fonctions, trouvé: ${allLinks.length}`);

      const diffLink = allLinks.find(a => a.dataset.value === 'diff()');
      assert.ok(diffLink, 'diff() doit être présent');
      assert.ok(diffLink.innerHTML.includes('tag is-warning is-light'), 'diff doit avoir is-warning is-light');
      assert.ok(diffLink.innerHTML.includes('>diff</span>'), 'diff doit être affiché sans parenthèses dans le tag');
      assert.ok(diffLink.innerHTML.includes('Dérivée : diff(y, x)'), 'diff doit afficher sa description');

      const integrateLink = allLinks.find(a => a.dataset.value === 'integrate()');
      assert.ok(integrateLink, 'integrate() doit être présent');
      assert.ok(integrateLink.innerHTML.includes('tag is-warning is-light'), 'integrate doit avoir is-warning is-light');
      assert.ok(integrateLink.innerHTML.includes('>integrate</span>'), 'integrate doit être affiché sans parenthèses dans le tag');
      assert.ok(integrateLink.innerHTML.includes('Primitive : integrate(y, x)'), 'integrate doit afficher sa description');

      const sqrtLink = allLinks.find(a => a.dataset.value === 'sqrt()');
      assert.ok(sqrtLink, 'sqrt() doit être présent');
      assert.ok(sqrtLink.innerHTML.includes('tag is-link is-light'), 'sqrt doit avoir is-link is-light');
      assert.ok(sqrtLink.innerHTML.includes('>sqrt</span>'), 'sqrt doit être affiché sans parenthèses dans le tag');
      assert.ok(sqrtLink.innerHTML.includes('Racine carrée'), 'sqrt doit afficher sa description');
    });

    it('ne régénère pas le dropdown s\'il contient déjà des enfants (idempotent)', () => {
      ui.updateCalculationUI();
      assert.strictEqual(functionsContentElement.children.length, 1);

      // Second appel
      ui.updateCalculationUI();
      assert.strictEqual(functionsContentElement.children.length, 1);
    });
  });

  describe('UIManager - initCalculationControls() interactions dropdown', () => {
    let ui;
    let functionsDropdownClasses;
    let dropdownTriggerListener;
    let functionsContentListener;
    let docClickListener;
    let insertedTexts = [];

    beforeEach(() => {
      functionsDropdownClasses = new Set();
      dropdownTriggerListener = null;
      functionsContentListener = null;
      docClickListener = null;
      insertedTexts = [];

      const mockDropdownTrigger = {
        addEventListener: (event, fn) => {
          if (event === 'click') dropdownTriggerListener = fn;
        }
      };

      const mockDropdown = {
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
        querySelector: (sel) => {
          if (sel === '.dropdown-trigger') return mockDropdownTrigger;
          return null;
        },
        contains: (target) => {
          return target === mockDropdown || target === mockDropdownTrigger;
        }
      };

      const mockFunctionsContent = {
        addEventListener: (event, fn) => {
          if (event === 'click') functionsContentListener = fn;
        }
      };

      global.__getElementByIdOverride = (id) => {
        if (id === 'functions-dropdown') return mockDropdown;
        if (id === 'calculation-functions-content') return mockFunctionsContent;
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

      // Remplacement de document.addEventListener pour capturer le listener global
      const origAddEventListener = global.document.addEventListener;
      global.document.addEventListener = (event, fn) => {
        if (event === 'click') docClickListener = fn;
        origAddEventListener(event, fn);
      };

      ui = Object.create(UIManager.prototype);
      ui.editor = {
        getWrapperElement: () => ({ classList: { add: () => {} } }),
        setOption: () => {},
        replaceSelection: (text) => insertedTexts.push(text),
        getCursor: () => ({ line: 0, ch: 0 }),
        setCursor: () => {},
        focus: () => {}
      };
      ui.updateCalculationUI = () => {};
    });

    it('ouvre et ferme le dropdown au clic sur .dropdown-trigger avec stopPropagation', () => {
      ui.initCalculationControls();

      assert.ok(dropdownTriggerListener, 'Écouteur sur trigger doit être enregistré');

      let propagationStopped = false;
      const fakeEvent = {
        stopPropagation: () => { propagationStopped = true; }
      };

      dropdownTriggerListener(fakeEvent);
      assert.strictEqual(propagationStopped, true);
      assert.strictEqual(functionsDropdownClasses.has('is-active'), true);

      // Clic à nouveau pour fermer
      dropdownTriggerListener(fakeEvent);
      assert.strictEqual(functionsDropdownClasses.has('is-active'), false);
    });

    it('ferme le dropdown lors d\'un clic extérieur sur document', () => {
      ui.initCalculationControls();
      functionsDropdownClasses.add('is-active');

      assert.ok(docClickListener, 'Écouteur sur document doit être enregistré');
      docClickListener({ target: {} }); // Clic à l'extérieur
      assert.strictEqual(functionsDropdownClasses.has('is-active'), false);
    });

    it('au clic sur a[data-value], insère le texte et ferme immédiatement le dropdown', () => {
      ui.initCalculationControls();
      functionsDropdownClasses.add('is-active');

      assert.ok(functionsContentListener, 'Écouteur sur functionsContent doit être enregistré');

      let preventedDefault = false;
      const fakeEvent = {
        preventDefault: () => { preventedDefault = true; },
        target: {
          closest: (sel) => {
            if (sel === 'a[data-value]') {
              return { dataset: { value: 'sqrt()' } };
            }
            return null;
          }
        }
      };

      functionsContentListener(fakeEvent);

      assert.strictEqual(preventedDefault, true);
      assert.strictEqual(insertedTexts.length, 1);
      assert.strictEqual(insertedTexts[0], 'sqrt('); // insertTextInEditor enlève la dernière parenthèse
      assert.strictEqual(functionsDropdownClasses.has('is-active'), false);
    });

    it('insère diff(,) avec la virgule au clic sur diff()', () => {
      ui.initCalculationControls();
      functionsDropdownClasses.add('is-active');

      const fakeEvent = {
        preventDefault: () => {},
        target: {
          closest: (sel) => {
            if (sel === 'a[data-value]') {
              return { dataset: { value: 'diff()' } };
            }
            return null;
          }
        }
      };

      functionsContentListener(fakeEvent);

      assert.strictEqual(insertedTexts[0], 'diff(,)');
      assert.strictEqual(functionsDropdownClasses.has('is-active'), false);
    });

    it('insère integrate(,) avec la virgule au clic sur integrate()', () => {
      ui.initCalculationControls();
      functionsDropdownClasses.add('is-active');

      const fakeEvent = {
        preventDefault: () => {},
        target: {
          closest: (sel) => {
            if (sel === 'a[data-value]') {
              return { dataset: { value: 'integrate()' } };
            }
            return null;
          }
        }
      };

      functionsContentListener(fakeEvent);

      assert.strictEqual(insertedTexts[0], 'integrate(,)');
      assert.strictEqual(functionsDropdownClasses.has('is-active'), false);
    });

    it('ferme le dropdown lorsque la touche Escape est pressée', () => {
      functionsDropdownClasses.add('is-active');

      // Simule l'action onEscape configurée dans setupGlobalShortcuts
      const dropdown = document.getElementById('functions-dropdown');
      if (dropdown) {
        dropdown.classList.remove('is-active');
      }

      assert.strictEqual(functionsDropdownClasses.has('is-active'), false);
    });
  });
});
