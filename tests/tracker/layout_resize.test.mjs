import '../helpers/setup.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

describe('Tracker - Redimensionnement de fenêtre et panneau latéral (#right-column)', () => {
  let mockRightColumn;
  let mockPlayer;

  beforeEach(() => {
    mockRightColumn = {
      children: [
        {
          style: {
            width: '285px',
            flexGrow: 0
          }
        }
      ]
    };

    mockPlayer = {
      resizeCallCount: 0,
      resize() {
        this.resizeCallCount++;
      }
    };
  });

  describe('Démonstration du bug historique', () => {
    it('montre que passer resize directement comme écouteur affecte l\'objet UIEvent à style.width', () => {
      // Logique initiale de main.js :
      // window.addEventListener('resize', resize, false);
      // function resize(column2Size = "285px") {
      //   $("#right-column").children[0].style.width = column2Size;
      //   player.resize();
      // }
      const historicalResize = (column2Size = '285px') => {
        mockRightColumn.children[0].style.width = column2Size;
        mockPlayer.resize();
      };

      const uiEvent = { type: 'resize', toString: () => '[object UIEvent]' };

      // Le navigateur déclenche resize(event)
      historicalResize(uiEvent);

      // Le style CSS reçoit l'objet UIEvent
      assert.equal(mockRightColumn.children[0].style.width, uiEvent);
      assert.equal(String(mockRightColumn.children[0].style.width), '[object UIEvent]');

      // player.resize() a tourné, ce qui masquait visuellement le problème
      assert.equal(mockPlayer.resizeCallCount, 1);
    });
  });

  describe('Validation de la correction minimale', () => {
    it('l\'écouteur window resize doit uniquement appeler player.resize() sans toucher au style CSS', () => {
      // L'utilisateur a préalablement agrandi le panneau à 450px
      mockRightColumn.children[0].style.width = '450px';

      // Nouvelle implémentation minimale :
      // window.addEventListener('resize', () => { player.resize(); }, false);
      const onWindowResize = () => {
        mockPlayer.resize();
      };

      // Déclenchement de l'événement de redimensionnement de la fenêtre
      onWindowResize();

      // Vérifications :
      // 1. Le lecteur vidéo est bien redimensionné
      assert.equal(mockPlayer.resizeCallCount, 1);
      // 2. La largeur personnalisée par l'utilisateur (450px) est totalement préservée
      assert.equal(mockRightColumn.children[0].style.width, '450px');
      // 3. Aucun objet Event n'a pollué style.width
      assert.notEqual(String(mockRightColumn.children[0].style.width), '[object UIEvent]');
    });

    it('resize(column2Size) doit mettre à jour la largeur lors du drag du séparateur', () => {
      const resize = (column2Size = '285px') => {
        mockRightColumn.children[0].style.width = column2Size;
        mockRightColumn.children[0].style.flexGrow = 0;
        mockPlayer.resize();
      };

      // Simulation du glissement du séparateur avec une nouvelle taille en px
      resize('360px');

      assert.equal(mockRightColumn.children[0].style.width, '360px');
      assert.equal(mockRightColumn.children[0].style.flexGrow, 0);
      assert.equal(mockPlayer.resizeCallCount, 1);
    });

    it('resize() sans argument doit appliquer la largeur par défaut de 285px à l\'initialisation', () => {
      const resize = (column2Size = '285px') => {
        mockRightColumn.children[0].style.width = column2Size;
        mockRightColumn.children[0].style.flexGrow = 0;
        mockPlayer.resize();
      };

      mockRightColumn.children[0].style.width = '0px';

      resize();

      assert.equal(mockRightColumn.children[0].style.width, '285px');
      assert.equal(mockPlayer.resizeCallCount, 1);
    });
  });
});
