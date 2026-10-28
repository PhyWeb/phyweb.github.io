import '../helpers/setup.mjs';
import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { downloadFile } from '../../common/common.js';
import VIDEOLIST from '../../tracker/modules/videolist.js';
import MEASUREMENT from '../../tracker/modules/measurement.js';
import { computeColumnWidth, applyResize } from '../../tracker/modules/layoutResizer.js';

describe('Corrections techniques - Vérification unitaire', () => {

  describe('1. layoutResizer (computeColumnWidth & applyResize)', () => {
    it('computeColumnWidth calcule et borne la largeur de colonne correctement', () => {
      // wrapper = 1000, clientX = 400, handleOffset = 26 => 1000 - 400 - 26 = 574px.
      // maxAllowed = 1000 - 520 = 480px => borne max à 480px
      const width1 = computeColumnWidth(1000, 400);
      assert.equal(width1, '480px');

      // wrapper = 1000, clientX = 800, handleOffset = 26 => 1000 - 800 - 26 = 174px => borne min à 285px
      const width2 = computeColumnWidth(1000, 800);
      assert.equal(width2, '285px');

      // Valeur intermédiaire valide
      // wrapper = 1000, clientX = 600, handleOffset = 26 => 1000 - 600 - 26 = 374px
      const width3 = computeColumnWidth(1000, 600);
      assert.equal(width3, '374px');
    });

    it('applyResize met à jour le premier enfant de right-column et appelle player.resize()', () => {
      const mockRightColumn = {
        children: [{ style: { width: '200px', flexGrow: 1 } }]
      };
      let resizeCalled = false;
      const mockPlayer = {
        resize: () => { resizeCalled = true; }
      };

      applyResize(mockRightColumn, '350px', mockPlayer);

      assert.equal(mockRightColumn.children[0].style.width, '350px');
      assert.equal(mockRightColumn.children[0].style.flexGrow, 0);
      assert.equal(resizeCalled, true);
    });
  });

  describe('2. measurement.updateTable (optimisation scaleX / scaleY)', () => {
    it('getOrientedScaleX et getOrientedScaleY ne sont appelés qu\'une seule fois lors de updateTable', () => {
      const measurement = new MEASUREMENT();
      
      // Simuler une table avec plusieurs lignes
      const rowCount = 20;
      measurement.tableBody = {
        children: Array.from({ length: rowCount }, () => ({}))
      };
      measurement.labelsCache = Array.from({ length: rowCount }, () => ({
        t: { textContent: '' },
        x: { 1: { textContent: '' } },
        y: { 1: { textContent: '' } }
      }));
      measurement.series = [
        Array.from({ length: rowCount }, (_, i) => i * 0.04), // t
        Object.assign(Array.from({ length: rowCount }, () => 10), { get: () => 1 }), // x1
        Object.assign(Array.from({ length: rowCount }, () => 20), { get: () => 2 })  // y1
      ];
      measurement.series[0].title = 't';
      measurement.series[1].title = 'x1';
      measurement.series[2].title = 'y1';
      measurement.originFrame = 0;

      let countScaleX = 0;
      let countScaleY = 0;
      measurement.scale = {
        update: () => {},
        origin: { x: 0, y: 0 },
        getOrientedScaleX: () => {
          countScaleX++;
          return 1;
        },
        getOrientedScaleY: () => {
          countScaleY++;
          return 1;
        }
      };

      measurement.updateTable();

      // scaleX et scaleY doivent être calculés 1 seule fois avant la boucle et non 20 fois
      assert.equal(countScaleX, 1, 'getOrientedScaleX doit être appelé exactement 1 fois');
      assert.equal(countScaleY, 1, 'getOrientedScaleY doit être appelé exactement 1 fois');
    });
  });

  describe('3. downloadFile (révocation de URL.createObjectURL)', () => {
    it('révoque l\'URL Blob via URL.revokeObjectURL avec setTimeout', async () => {
      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      const originalCreateElementOverride = global.__createElementOverride;

      let createdUrl = null;
      let revokedUrl = null;
      let clickCalled = false;

      URL.createObjectURL = (blob) => {
        createdUrl = 'blob:http://localhost/mock-uuid';
        return createdUrl;
      };

      URL.revokeObjectURL = (url) => {
        revokedUrl = url;
      };

      global.__createElementOverride = (tag) => ({
        href: '',
        download: '',
        click: () => { clickCalled = true; }
      });

      try {
        await downloadFile('col1,col2\n1,2', 'csv', 'export_test');
        assert.equal(clickCalled, true);
        assert.equal(createdUrl, 'blob:http://localhost/mock-uuid');
        // Avant le délai de 1000ms, l'URL n'est pas encore révoquée
        assert.equal(revokedUrl, null);

        // Attente de l'expiration du timeout (1100ms)
        await new Promise((resolve) => setTimeout(resolve, 1100));

        assert.equal(revokedUrl, 'blob:http://localhost/mock-uuid');
      } finally {
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
        global.__createElementOverride = originalCreateElementOverride;
      }
    });
  });

  describe('4. videolist.js (sécurisation JSON.parse et xhr.onerror)', () => {
    it('loadXHR enregistre un gestionnaire xhr.onerror qui logge l\'erreur sans crasher', () => {
      const videolist = new VIDEOLIST();
      let registeredOnError = null;

      const originalXHR = global.XMLHttpRequest;
      global.XMLHttpRequest = class {
        constructor() {
          this.onload = null;
          this.onerror = null;
          this.responseType = '';
        }
        open() {}
        send() {
          registeredOnError = this.onerror;
        }
      };

      let loggedError = false;
      const originalConsoleError = console.error;
      console.error = (...args) => {
        loggedError = true;
      };

      try {
        videolist.loadXHR('assets/list.json', 'text', () => {});
        assert.equal(typeof registeredOnError, 'function', 'loadXHR doit définir xhr.onerror');

        // Déclencher une erreur réseau
        assert.doesNotThrow(() => {
          registeredOnError(new Error('Network error'));
        });
        assert.equal(loggedError, true, 'xhr.onerror doit logger l\'erreur');
      } finally {
        global.XMLHttpRequest = originalXHR;
        console.error = originalConsoleError;
      }
    });

    it('init() capture une erreur de JSON.parse sans faire planter l\'application', () => {
      const videolist = new VIDEOLIST();

      const originalXHR = global.XMLHttpRequest;
      global.XMLHttpRequest = class {
        constructor() {
          this.onload = null;
          this.onerror = null;
          this.response = 'invalid json {[';
        }
        open() {}
        send() {
          if (this.onload) this.onload();
        }
      };

      let loggedError = false;
      const originalConsoleError = console.error;
      console.error = (...args) => {
        loggedError = true;
      };

      try {
        assert.doesNotThrow(() => {
          videolist.init('assets/corrupted.json');
        }, 'init ne doit pas lever d exception sur un JSON corrompu');
        assert.equal(loggedError, true, 'L\'erreur de parsing doit être loggée');
      } finally {
        global.XMLHttpRequest = originalXHR;
        console.error = originalConsoleError;
      }
    });
  });

});
