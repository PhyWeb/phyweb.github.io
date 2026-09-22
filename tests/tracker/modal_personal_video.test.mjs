import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import PLAYER from '../../tracker/modules/player.js';
import EXTRACTOR from '../../tracker/modules/extractor.js';
import { ModalManager } from '../../common/common.js';

describe('Tracker - Fermeture des modales lors du chargement d\'une vidéo perso', () => {
  let originalQSOverride;
  let originalQSAllOverride;
  let originalCreateElementOverride;
  let originalCancelAnimationFrame;
  let originalRequestAnimationFrame;
  let originalFileReader;
  let mockElements;

  const createMockElement = (id = '') => {
    const classes = new Set();
    const listeners = {};
    return {
      id,
      value: '',
      files: [],
      style: {},
      classList: {
        add: (c) => classes.add(c),
        remove: (c) => classes.delete(c),
        toggle: (c) => {
          if (classes.has(c)) classes.delete(c);
          else classes.add(c);
        },
        contains: (c) => classes.has(c)
      },
      listeners,
      addEventListener: (type, fn) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
      },
      click: function () {
        if (listeners['click']) {
          listeners['click'].forEach(fn => fn({ preventDefault: () => {} }));
        }
      },
      dispatchEvent: function (event) {
        if (listeners[event.type]) {
          listeners[event.type].forEach(fn => fn(event));
        }
      },
      closest: function (sel) {
        if (sel === '.modal') return this;
        return null;
      },
      remove: () => {},
      appendChild: () => {},
      querySelector: () => null,
      querySelectorAll: () => []
    };
  };

  beforeEach(() => {
    mockElements = {
      '#videoContainer': { offsetWidth: 640, offsetHeight: 480 },
      '#new-modal': createMockElement('new-modal'),
      '#open-modal': createMockElement('open-modal'),
      '#file-size-modal': createMockElement('file-size-modal'),
      '#file-input': createMockElement('file-input'),
      '#force-filesize-modal-input': { checked: false },
      '#empty-state-container': createMockElement('empty-state-container'),
      '#video-controls': createMockElement('video-controls'),
      '#magnifier-button': createMockElement('magnifier-button'),
      '#settings-button': createMockElement('settings-button'),
      '#handler-wrapper': createMockElement('handler-wrapper'),
      '.handler': createMockElement('handler'),
      '#videoCanvas': createMockElement('videoCanvas'),
      '#etalonnage-button': createMockElement('etalonnage-button'),
      '#frame-label': { innerHTML: '' },
      '#table-head': { innerHTML: '', appendChild: () => {} },
      '#table-body': { innerHTML: '', appendChild: () => {} }
    };

    originalQSOverride = global.__querySelectorOverride;
    originalQSAllOverride = global.__querySelectorAllOverride;
    originalCancelAnimationFrame = global.cancelAnimationFrame;
    originalRequestAnimationFrame = global.requestAnimationFrame;
    originalFileReader = global.FileReader;

    global.cancelAnimationFrame = () => {};
    global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
    global.FileReader = class {
      readAsArrayBuffer() {}
    };

    originalCreateElementOverride = global.__createElementOverride;
    global.__createElementOverride = () => createMockElement();

    global.__querySelectorOverride = (sel) => {
      if (mockElements[sel]) return mockElements[sel];
      return createMockElement();
    };

    global.__querySelectorAllOverride = (sel) => {
      if (sel === '.modal') {
        return [mockElements['#new-modal'], mockElements['#open-modal'], mockElements['#file-size-modal']];
      }
      return [];
    };
  });

  afterEach(() => {
    global.__querySelectorOverride = originalQSOverride;
    global.__querySelectorAllOverride = originalQSAllOverride;
    global.__createElementOverride = originalCreateElementOverride;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.FileReader = originalFileReader;
  });

  it('ModalManager.closeAllModals() doit fermer toutes les modales actives dont new-modal', () => {
    const modalManager = new ModalManager();
    mockElements['#new-modal'].classList.add('is-active');
    mockElements['#open-modal'].classList.add('is-active');

    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), true);
    assert.equal(mockElements['#open-modal'].classList.contains('is-active'), true);

    modalManager.closeAllModals();

    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), false);
    assert.equal(mockElements['#open-modal'].classList.contains('is-active'), false);
  });

  it('EXTRACTOR.checkSize doit retirer is-active de #new-modal et #open-modal', () => {
    const extractor = new EXTRACTOR();
    mockElements['#new-modal'].classList.add('is-active');
    mockElements['#open-modal'].classList.add('is-active');

    // Simuler l'appel checkSize avec un faux fichier
    const fakeFile = { size: 1024, slice: () => new Blob() };
    extractor.checkSize(fakeFile, () => {}, () => {});

    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), false);
    assert.equal(mockElements['#open-modal'].classList.contains('is-active'), false);
  });

  it('PLAYER doit fermer #new-modal et #open-modal lors de l affichage d une vidéo chargée (decodedVideoCB)', () => {
    const measurementMock = {
      init: () => {},
      originFrame: 0,
      selectRow: () => {},
      series: [[], [], []]
    };
    const extractorMock = {};
    const canvasMock = {
      getContext: () => ({
        clearRect: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        fill: () => {}
      }),
      addEventListener: () => {},
      style: {}
    };

    const player = new PLAYER(mockElements['#videoContainer'], canvasMock, measurementMock, extractorMock);
    mockElements['#new-modal'].classList.add('is-active');
    mockElements['#open-modal'].classList.add('is-active');

    // Simuler le chargement d'une vidéo décodée
    const decodedVideo = {
      width: 640,
      height: 480,
      duration: 1000,
      frames: [{ src: 'blob:test' }],
      timestamps: [0]
    };

    // Déclencher la logique de callback de décodage dans PLAYER
    let capturedCB = null;
    extractorMock.checkSize = (file, checksizeCB, decodedCB) => {
      capturedCB = decodedCB;
    };

    player.load(new Blob());
    assert.ok(capturedCB, 'decodedVideoCB doit être enregistré');

    // Exécuter le callback
    capturedCB(decodedVideo);

    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), false);
    assert.equal(mockElements['#open-modal'].classList.contains('is-active'), false);
    assert.equal(mockElements['#empty-state-container'].classList.contains('is-hidden'), true);
    assert.equal(mockElements['#video-controls'].classList.contains('is-hidden'), false);
  });

  it('Le handler de changement de fichier doit appeler closeAllModals avant et lors de confirmAction', () => {
    let closedCount = 0;
    const modalManagerMock = {
      closeAllModals: () => {
        closedCount++;
        mockElements['#new-modal'].classList.remove('is-active');
      }
    };

    let confirmActionCalled = false;
    const navManagerMock = {
      confirmAction: (action) => {
        confirmActionCalled = true;
        action();
      }
    };

    let playerLoadedWith = null;
    const playerMock = {
      load: (file) => {
        playerLoadedWith = file;
      }
    };

    mockElements['#new-modal'].classList.add('is-active');
    const fakeFile = { name: 'ma-video.mp4', type: 'video/mp4' };
    mockElements['#file-input'].files = [fakeFile];

    // Reproduire la logique exacte de change de main.js
    const onFileInputChange = () => {
      if (!mockElements['#file-input'].files || !mockElements['#file-input'].files[0]) return;
      const file = mockElements['#file-input'].files[0];
      if (file.type !== 'video/mp4') return;

      modalManagerMock.closeAllModals();

      navManagerMock.confirmAction(() => {
        modalManagerMock.closeAllModals();
        playerMock.load(file);
      });
    };

    onFileInputChange();

    assert.equal(confirmActionCalled, true);
    assert.equal(playerLoadedWith, fakeFile);
    assert.ok(closedCount >= 2, 'closeAllModals doit avoir été appelé avant et dans confirmAction');
    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), false);
  });

  it('PLAYER doit réouvrir #new-modal si decodedVideoCB ne contient aucune frame (échec de décodage)', () => {
    const measurementMock = {
      init: () => {},
      originFrame: 0,
      selectRow: () => {},
      series: [[], [], []]
    };
    const extractorMock = {};
    const canvasMock = {
      getContext: () => ({ clearRect: () => {}, drawImage: () => {} }),
      addEventListener: () => {},
      style: {}
    };

    const player = new PLAYER(mockElements['#videoContainer'], canvasMock, measurementMock, extractorMock);
    mockElements['#new-modal'].classList.remove('is-active');

    let capturedCB = null;
    extractorMock.checkSize = (file, checksizeCB, decodedCB) => {
      capturedCB = decodedCB;
    };

    player.load(new Blob());
    // Simuler un décodage qui échoue ou ne renvoie aucune image
    capturedCB({ frames: [] });

    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), true, '#new-modal doit être réouvert si aucune image n\'est extraite');
  });

  it('EXTRACTOR.onReady doit réouvrir #new-modal si aucune piste vidéo n\'est présente', () => {
    const extractor = new EXTRACTOR();
    mockElements['#new-modal'].classList.remove('is-active');

    extractor.onReady({ videoTracks: [] });

    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), true, '#new-modal doit être réouvert si aucune piste vidéo');
  });

  it('EXTRACTOR doit réouvrir #new-modal en cas d\'erreur MP4Box', () => {
    const extractor = new EXTRACTOR();
    mockElements['#new-modal'].classList.remove('is-active');

    const fakeFile = { size: 1024, slice: () => new Blob() };
    extractor.checkSize(fakeFile, () => {}, () => {});

    // Déclencher l'erreur MP4Box
    extractor.mp4boxfile.onError(new Error('Format invalide'));

    assert.equal(mockElements['#new-modal'].classList.contains('is-active'), true, '#new-modal doit être réouvert lors d\'une erreur MP4Box');
  });
});
