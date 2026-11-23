import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import UIManager from '../../grapher/modules/ui.js';

describe('Exportation et Sauvegarde - État vide / session non ouverte', () => {
  let uiManager;
  let dataMock;
  let grapherMock;
  let editorMock;
  let commonMock;
  let mockElements;
  let openedModals;
  let toasts;
  let tabClickCount;

  const createMockElement = (tag = 'div') => {
    const classList = new Set();
    const listeners = {};
    return {
      tagName: tag.toUpperCase(),
      value: '',
      checked: false,
      textContent: '',
      innerHTML: '',
      style: {},
      parentElement: null,
      classList: {
        add: (...cls) => cls.forEach(c => classList.add(c)),
        remove: (...cls) => cls.forEach(c => classList.delete(c)),
        toggle: (c, force) => {
          if (force !== undefined) {
            force ? classList.add(c) : classList.delete(c);
            return force;
          }
          if (classList.has(c)) {
            classList.delete(c);
            return false;
          } else {
            classList.add(c);
            return true;
          }
        },
        contains: (c) => classList.has(c)
      },
      addEventListener: (type, fn) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
      },
      removeEventListener: (type, fn) => {
        if (!listeners[type]) return;
        listeners[type] = listeners[type].filter(l => l !== fn);
      },
      dispatchEvent: (e) => {
        const type = e.type || e;
        if (listeners[type]) listeners[type].forEach(fn => fn(e));
      },
      click: function() {
        if (listeners['click']) {
          listeners['click'].forEach(fn => fn({ preventDefault: () => {}, stopPropagation: () => {} }));
        }
      },
      querySelector: () => null,
      querySelectorAll: () => [],
      closest: () => null
    };
  };

  beforeEach(() => {
    openedModals = [];
    toasts = [];
    tabClickCount = 0;

    const toastContainer = createMockElement('div');
    toastContainer.appendChild = (child) => {
      toasts.push({
        className: child.className || '',
        innerHTML: child.innerHTML || ''
      });
      return child;
    };

    const emptyStateContainer = createMockElement('div'); // Visible par défaut (pas de 'is-hidden')

    const exportMenuButton = createMockElement('a');
    const saveButton = createMockElement('a');

    const grapheurTab = createMockElement('li');
    grapheurTab.addEventListener('click', () => {
      tabClickCount++;
    });

    const grapheurPanel = createMockElement('div');
    grapheurPanel.classList.add('is-hidden');

    const tableurPanel = createMockElement('div');
    const calculsPanel = createMockElement('div');

    const exportModal = createMockElement('div');
    const downloadModal = createMockElement('div');

    const actionSelect = createMockElement('select');
    actionSelect.value = 'pdf';

    const graphSize = createMockElement('select');
    graphSize.value = '1';

    const titleInput = createMockElement('input');
    const iframe = createMockElement('iframe');
    const iframeContainer = createMockElement('div');
    iframe.parentElement = iframeContainer;

    mockElements = {
      '#empty-state-container': emptyStateContainer,
      '#export-menu-button': exportMenuButton,
      '#save-button': saveButton,
      '#grapheur-tab': grapheurTab,
      '#grapheur-panel': grapheurPanel,
      '#tableur-panel': tableurPanel,
      '#calculs-panel': calculsPanel,
      '#export-modal': exportModal,
      '#download-modal': downloadModal,
      '#export-action-select': actionSelect,
      '#export-sections-container': createMockElement('div'),
      '#export-image-options': createMockElement('div'),
      '#export-confirm-button': createMockElement('button'),
      '#export-copy-button': createMockElement('button'),
      '#export-preview-iframe': iframe,
      '#export-title-input': titleInput,
      '#export-graph-size': graphSize,
      '#export-image-format': createMockElement('select'),
      '#export-image-scale': createMockElement('select'),
      '#export-check-graph': createMockElement('input'),
      '#export-check-table': createMockElement('input'),
      '#export-check-calc': createMockElement('input'),
      '#export-margin-select': createMockElement('select'),
      '#export-table-label': createMockElement('span'),
      '#file-name-input': createMockElement('input'),
      '#file-extension-label': createMockElement('span'),
      '#download-file-button': createMockElement('button'),
      '#csv-options': createMockElement('div'),
      '#pw-button': createMockElement('button'),
      '#csv-button': createMockElement('button'),
      '#rw3-button': createMockElement('button'),
      '#save-format-warning': createMockElement('div'),
      '.toast-container': toastContainer
    };

    global.__querySelectorOverride = (sel) => mockElements[sel] || null;
    global.__getElementByIdOverride = (id) => mockElements['#' + id] || null;
    global.__querySelectorAllOverride = (sel) => {
      if (sel === '.export-trigger') return [];
      return [];
    };

    dataMock = {
      curves: [],
      getTable: () => [],
      settings: { significantDigits: 4 }
    };

    grapherMock = {
      chart: {
        chartWidth: 800,
        chartHeight: 500,
        getSVG: () => '<svg></svg>'
      }
    };

    editorMock = {
      getValue: () => ''
    };

    commonMock = {
      modalManager: {
        openModal: (el) => openedModals.push(el),
        closeAllModals: () => {}
      }
    };

    uiManager = new UIManager(commonMock, dataMock, grapherMock, {}, editorMock, {});
    uiManager.initExportModal();
    uiManager.initSaveModal();
  });

  afterEach(() => {
    global.__querySelectorOverride = null;
    global.__getElementByIdOverride = null;
    global.__querySelectorAllOverride = null;
  });

  it('ne doit pas déclencher la bascule d\'onglet ni ouvrir la modale d\'export si l\'écran d\'accueil (empty-state) est actif', () => {
    // #empty-state-container est visible (pas de 'is-hidden')
    assert.strictEqual(mockElements['#empty-state-container'].classList.contains('is-hidden'), false);

    mockElements['#export-menu-button'].click();

    // Vérifie que le clic sur l'onglet graphe n'a pas été déclenché
    assert.strictEqual(tabClickCount, 0, 'grapheur-tab ne doit pas être cliqué');
    // Vérifie que la modale d\'export n\'a pas été ouverte
    assert.strictEqual(openedModals.length, 0, 'La modale d\'export ne doit pas s\'ouvrir');
    // Vérifie qu\'un toast d\'avertissement approprié a été affiché
    assert.strictEqual(toasts.length, 1, 'Un toast doit être affiché');
    assert.ok(toasts[0].className.includes('is-warning'));
    assert.match(toasts[0].innerHTML, /Aucune donnée à exporter/);
  });

  it('ne doit pas ouvrir la modale de sauvegarde si l\'écran d\'accueil (empty-state) est actif', () => {
    assert.strictEqual(mockElements['#empty-state-container'].classList.contains('is-hidden'), false);

    mockElements['#save-button'].click();

    assert.strictEqual(openedModals.length, 0, 'La modale de téléchargement ne doit pas s\'ouvrir');
    assert.strictEqual(toasts.length, 1, 'Un toast doit être affiché');
    assert.ok(toasts[0].className.includes('is-warning'));
    assert.match(toasts[0].innerHTML, /Aucune donnée à sauvegarder/);
  });

  it('ne doit pas ouvrir la modale d\'export si une session est ouverte mais ne contient aucune grandeur ni calcul', () => {
    // Session ouverte (#empty-state-container est caché)
    mockElements['#empty-state-container'].classList.add('is-hidden');
    dataMock.curves = [];
    editorMock.getValue = () => '';

    mockElements['#export-menu-button'].click();

    assert.strictEqual(tabClickCount, 0, 'grapheur-tab ne doit pas être cliqué');
    assert.strictEqual(openedModals.length, 0);
    assert.strictEqual(toasts.length, 1);
    assert.match(toasts[0].innerHTML, /Aucune donnée à exporter/);
  });

  it('doit basculer vers l\'onglet graphe et ouvrir la modale d\'export quand une session contient des grandeurs', (t, done) => {
    // Session ouverte avec données
    mockElements['#empty-state-container'].classList.add('is-hidden');
    dataMock.curves = [{ title: 'x', unit: 'm', length: 5 }];

    mockElements['#export-menu-button'].click();

    // L'onglet n'était pas actif, donc grapheur-tab.click() doit être appelé
    assert.strictEqual(tabClickCount, 1, 'grapheur-tab doit être cliqué pour basculer');

    // La modale s'ouvre après un setTimeout de 300ms
    setTimeout(() => {
      assert.strictEqual(openedModals.length, 1);
      assert.strictEqual(openedModals[0], mockElements['#export-modal']);
      done();
    }, 350);
  });

  it('doit ouvrir directement la modale d\'export sans délai si l\'onglet grapheur est déjà actif', () => {
    mockElements['#empty-state-container'].classList.add('is-hidden');
    dataMock.curves = [{ title: 'x', unit: 'm', length: 5 }];
    mockElements['#grapheur-tab'].classList.add('is-active');

    mockElements['#export-menu-button'].click();

    assert.strictEqual(tabClickCount, 0, 'Pas de clic supplémentaire sur grapheur-tab');
    assert.strictEqual(openedModals.length, 1);
    assert.strictEqual(openedModals[0], mockElements['#export-modal']);
  });
});
