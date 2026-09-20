import '../helpers/setup.mjs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import MEASUREMENT from '../../tracker/modules/measurement.js';

describe('Tracker Measurement Module', () => {
  it('doit utiliser les timestamps réels quand ils sont fournis', () => {
    const measurement = new MEASUREMENT();
    const fakePlayer = {
      setFrame: () => {}
    };

    const mockDecodedVideo = {
      width: 1920,
      height: 1080,
      duration: 1000,
      frames: [{}, {}, {}, {}],
      timestamps: [0.0, 0.0333, 0.0667, 0.1000]
    };

    measurement.init(mockDecodedVideo, fakePlayer);

    assert.equal(measurement.series[0].length, 4);
    assert.equal(measurement.series[0][0], 0.0);
    assert.equal(measurement.series[0][1], 0.0333);
    assert.equal(measurement.series[0][2], 0.0667);
    assert.equal(measurement.series[0][3], 0.1000);
  });

  it('doit calculer le temps uniforme si les timestamps réels ne sont pas fournis (rétrocompatibilité)', () => {
    const measurement = new MEASUREMENT();
    const fakePlayer = {
      setFrame: () => {}
    };

    const mockDecodedVideo = {
      width: 1920,
      height: 1080,
      duration: 2000, // 2000 ms
      frames: [{}, {}, {}] // 3 frames -> 0, 2/3 s, 4/3 s
    };

    measurement.init(mockDecodedVideo, fakePlayer);

    assert.equal(measurement.series[0].length, 3);
    assert.equal(measurement.series[0][0], 0);
    assert.equal(measurement.series[0][1].toFixed(4), ((2000 / 3) * 1 / 1000).toFixed(4));
    assert.equal(measurement.series[0][2].toFixed(4), ((2000 / 3) * 2 / 1000).toFixed(4));
  });
});

describe('Tracker Scale & Étalonnage (scale.update)', () => {
  let measurement;
  let scaleInputElement;
  const originalQSOverride = global.__querySelectorOverride;

  const createDefaultMock = () => ({
    value: '1',
    textContent: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    addEventListener: () => {},
    removeEventListener: () => {},
    setAttribute: () => {},
    removeAttribute: () => {},
    appendChild: () => {},
    remove: () => {},
    children: []
  });

  beforeEach(() => {
    measurement = new MEASUREMENT();
    scaleInputElement = createDefaultMock();
    scaleInputElement.value = '1';

    global.__querySelectorOverride = (sel) => {
      if (sel === '#scale-input') return scaleInputElement;
      return createDefaultMock();
    };
  });

  afterEach(() => {
    global.__querySelectorOverride = originalQSOverride;
  });

  it('ne doit pas produire Infinity ou NaN si les points du segment sont identiques (dx=0, dy=0)', () => {
    measurement.scale.scaleSegment = { x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5 };
    scaleInputElement.value = '1';

    measurement.scale.update(1.777);

    assert.equal(Number.isFinite(measurement.scale.value), true, 'measurement.scale.value doit être fini');
    assert.equal(measurement.scale.value, 1, 'measurement.scale.value doit conserver la valeur par défaut 1');
    assert.equal(Number.isFinite(measurement.scale.getOrientedScaleX()), true);
    assert.equal(Number.isFinite(measurement.scale.getOrientedScaleY(1.777)), true);
  });

  it('doit réinitialiser le segment invalide à null si dx=0 et dy=0', () => {
    measurement.scale.scaleSegment = { x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5 };
    scaleInputElement.value = '1';

    measurement.scale.update(1.777);

    assert.equal(measurement.scale.scaleSegment.x1, null);
    assert.equal(measurement.scale.scaleSegment.y1, null);
    assert.equal(measurement.scale.scaleSegment.x2, null);
    assert.equal(measurement.scale.scaleSegment.y2, null);
  });

  it('ne doit pas produire Infinity ou NaN si la distance est quasi-nulle (inférieure au seuil minimal)', () => {
    measurement.scale.scaleSegment = { x1: 0.5, y1: 0.5, x2: 0.5 + 1e-7, y2: 0.5 };
    scaleInputElement.value = '1';

    measurement.scale.update(1.777);

    assert.equal(Number.isFinite(measurement.scale.value), true);
    assert.equal(measurement.scale.value, 1);
  });

  it('doit calculer correctement l\'échelle quand le segment et l\'input sont valides', () => {
    // x1=0.2, x2=0.7 (dx = 0.5), y1=0.4, y2=0.4 (dy = 0)
    // ratio = 1 -> dist = 0.5
    // scale-input = "2.5" -> value = 2.5 / 0.5 = 5.0
    measurement.scale.scaleSegment = { x1: 0.2, y1: 0.4, x2: 0.7, y2: 0.4 };
    scaleInputElement.value = '2.5';

    measurement.scale.update(1);

    assert.ok(Math.abs(measurement.scale.value - 5) < 1e-9, `Valeur attendue 5, reçu ${measurement.scale.value}`);
    assert.ok(Math.abs(measurement.scale.getOrientedScaleX() - 5) < 1e-9);
  });

  it('doit conserver la valeur par défaut si scale-input est non numérique ou <= 0', () => {
    measurement.scale.scaleSegment = { x1: 0.2, y1: 0.4, x2: 0.7, y2: 0.4 };
    
    // Valeur 0
    scaleInputElement.value = '0';
    measurement.scale.update(1);
    assert.equal(measurement.scale.value, 1);

    // Valeur négative
    scaleInputElement.value = '-2';
    measurement.scale.update(1);
    assert.equal(measurement.scale.value, 1);

    // Valeur invalide
    scaleInputElement.value = 'abc';
    measurement.scale.update(1);
    assert.equal(measurement.scale.value, 1);
  });

  it('ne doit pas corrompre prepareDownloadData() avec des coordonnées Infinity ou NaN en cas de segment nul', () => {
    const fakePlayer = { setFrame: () => {} };
    const mockDecodedVideo = {
      width: 1920,
      height: 1080,
      duration: 1000,
      frames: [{}, {}],
      timestamps: [0.0, 0.0333]
    };
    measurement.init(mockDecodedVideo, fakePlayer);

    // Point mesuré
    measurement.series[1][0] = 0.5; // x
    measurement.series[2][0] = 0.5; // y

    // Segment nul
    measurement.scale.scaleSegment = { x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5 };
    scaleInputElement.value = '1';

    const data = measurement.prepareDownloadData();

    // Vérifier que x et y ne sont pas Infinity ou NaN
    const xVal = data[1][0];
    const yVal = data[2][0];
    assert.equal(Number.isFinite(xVal), true, `xVal (${xVal}) doit être un nombre fini`);
    assert.equal(Number.isFinite(yVal), true, `yVal (${yVal}) doit être un nombre fini`);
  });

  it('doit préserver la valeur d\'échelle étalonnée si scale-input est temporairement vidé', () => {
    measurement.scale.scaleSegment = { x1: 0, y1: 0, x2: 0.5, y2: 0 };
    scaleInputElement.value = '2.5';
    measurement.scale.update(1);
    assert.equal(measurement.scale.value, 5);

    // Vidage temporaire du champ (ex: suppression de la saisie au clavier)
    scaleInputElement.value = '';
    measurement.scale.update(1);
    assert.equal(measurement.scale.value, 5, 'L\'échelle précédemment étalonnée doit être conservée');
  });

  it('doit préserver la valeur d\'échelle étalonnée si scale-input contient une valeur invalide (texte, négatif, zéro)', () => {
    measurement.scale.scaleSegment = { x1: 0, y1: 0, x2: 0.5, y2: 0 };
    scaleInputElement.value = '2.5';
    measurement.scale.update(1);
    assert.equal(measurement.scale.value, 5);

    // Saisie textuelle invalide
    scaleInputElement.value = 'abc';
    measurement.scale.update(1);
    assert.equal(measurement.scale.value, 5, 'L\'échelle doit être conservée en cas de texte invalide');

    // Saisie négative
    scaleInputElement.value = '-2';
    measurement.scale.update(1);
    assert.equal(measurement.scale.value, 5, 'L\'échelle doit être conservée en cas de valeur négative');

    // Saisie zéro
    scaleInputElement.value = '0';
    measurement.scale.update(1);
    assert.equal(measurement.scale.value, 5, 'L\'échelle doit être conservée en cas de valeur nulle');
  });

  it('doit accepter une virgule comme séparateur décimal (ex: \'1,5\' pour les claviers français)', () => {
    measurement.scale.scaleSegment = { x1: 0, y1: 0, x2: 0.5, y2: 0 }; // dist = 0.5
    scaleInputElement.value = '1,5';
    measurement.scale.update(1);

    // 1.5 / 0.5 = 3.0
    assert.equal(measurement.scale.value, 3);
    assert.equal(measurement.scale.getOrientedScaleX(), 3);
  });

  it('doit accepter une valeur décimale avec espaces et virgule (ex: \'  2,5  \')', () => {
    measurement.scale.scaleSegment = { x1: 0, y1: 0, x2: 0.5, y2: 0 }; // dist = 0.5
    scaleInputElement.value = '  2,5  ';
    measurement.scale.update(1);

    // 2.5 / 0.5 = 5.0
    assert.equal(measurement.scale.value, 5);
  });

  it('ne doit pas écraser l\'étalonnage lors de prepareDownloadData() si scale-input est temporairement vide', () => {
    const fakePlayer = { setFrame: () => {} };
    const mockDecodedVideo = {
      width: 1920,
      height: 1080,
      duration: 1000,
      frames: [{}, {}],
      timestamps: [0.0, 0.0333]
    };
    measurement.init(mockDecodedVideo, fakePlayer);

    measurement.series[1][0] = 0.5; // x
    measurement.series[2][0] = 0.5; // y

    // Étalonnage valide (dist = 0.5, input = 2 -> scale.value = 4)
    measurement.scale.scaleSegment = { x1: 0, y1: 0, x2: 0.5, y2: 0 };
    scaleInputElement.value = '2';
    measurement.scale.update(1);
    assert.equal(measurement.scale.value, 4);

    // Le champ est vidé
    scaleInputElement.value = '';
    const data = measurement.prepareDownloadData();

    // scale.value doit être préservée à 4
    assert.equal(measurement.scale.value, 4);
    // Coordonnée x doit être calculée avec scale = 4, pas scale = 1
    assert.equal(data[1][0], (0.5 - 0) * 4);
  });

  describe('Protection contre les valeurs d\'échelle négatives (d <= 0) et non-inversion des axes X et Y', () => {
    it('ne doit jamais inverser l\'orientation des axes X et Y en cas de saisie d\'une distance négative', () => {
      // Configuration étalonnage : segment horizontal de longueur 0.5
      // Origine par défaut : "topright" (X orienté vers la droite, Y orienté vers le haut)
      measurement.scale.scaleSegment = { x1: 0.1, y1: 0.2, x2: 0.6, y2: 0.2 };
      measurement.scale.origin.type = 'topright';

      // Saisie d'une distance négative d = -2.5
      scaleInputElement.value = '-2.5';
      measurement.scale.update(1);

      // 1. scale.value doit rester strictement positif (valeur par défaut 1 si aucun étalonnage antérieur)
      assert.ok(measurement.scale.value > 0, `scale.value (${measurement.scale.value}) doit être > 0`);
      assert.equal(measurement.scale.value, 1);

      // 2. L'axe X physique doit rester positif vers la droite (> 0)
      const scaleX = measurement.scale.getOrientedScaleX();
      assert.ok(scaleX > 0, `scaleX (${scaleX}) doit être strictement positif pour 'topright'`);

      // 3. L'axe Y physique doit rester positif vers le haut (négatif en coordonnées canvas car Y descend)
      const scaleY = measurement.scale.getOrientedScaleY(1);
      assert.ok(scaleY < 0, `scaleY (${scaleY}) doit être négatif en coordonnées canvas pour 'topright'`);
    });

    it('ne doit pas inverser l\'orientation des axes physiques pour les 4 quadrants d\'origine en cas de valeur négative', () => {
      measurement.scale.scaleSegment = { x1: 0, y1: 0, x2: 0.5, y2: 0 }; // dist = 0.5
      scaleInputElement.value = '2.0'; // Étalonnage initial valide -> scale.value = 4.0
      measurement.scale.update(1);
      assert.equal(measurement.scale.value, 4.0);

      // Saisie d'une distance négative
      scaleInputElement.value = '-5.0';
      measurement.scale.update(1);

      // La valeur 4.0 doit être conservée, jamais écrasée par une valeur négative
      assert.equal(measurement.scale.value, 4.0);

      const orientations = [
        { type: 'topright', expectedXSign: 1, expectedYSign: -1 },
        { type: 'downright', expectedXSign: 1, expectedYSign: 1 },
        { type: 'topleft', expectedXSign: -1, expectedYSign: -1 },
        { type: 'downleft', expectedXSign: -1, expectedYSign: 1 }
      ];

      for (const { type, expectedXSign, expectedYSign } of orientations) {
        measurement.scale.origin.type = type;
        const scaleX = measurement.scale.getOrientedScaleX();
        const scaleY = measurement.scale.getOrientedScaleY(1);

        assert.equal(Math.sign(scaleX), expectedXSign, `Signe X invalide pour ${type} : attendu ${expectedXSign}, reçu ${Math.sign(scaleX)}`);
        assert.equal(Math.sign(scaleY), expectedYSign, `Signe Y invalide pour ${type} : attendu ${expectedYSign}, reçu ${Math.sign(scaleY)}`);
      }
    });

    it('doit refuser l\'écrasement direct de scale.value par une valeur <= 0 via le setter', () => {
      // Étalonnage initial valide
      measurement.scale.value = 3.5;
      assert.equal(measurement.scale.value, 3.5);

      // Tentative d'assignation négative
      measurement.scale.value = -10;
      assert.equal(measurement.scale.value, 3.5, 'La valeur négative ne doit pas modifier scale.value');

      // Tentative d'assignation nulle
      measurement.scale.value = 0;
      assert.equal(measurement.scale.value, 3.5, 'La valeur nulle ne doit pas modifier scale.value');

      // Tentative d'assignation non finie
      measurement.scale.value = -Infinity;
      assert.equal(measurement.scale.value, 3.5, 'La valeur infinie négative ne doit pas modifier scale.value');
      measurement.scale.value = NaN;
      assert.equal(measurement.scale.value, 3.5, 'La valeur NaN ne doit pas modifier scale.value');
    });

    it('doit supporter le paramètre d dans scale.update(ratio, d) et rejeter les distances <= 0', () => {
      measurement.scale.scaleSegment = { x1: 0, y1: 0, x2: 0.5, y2: 0 }; // dist = 0.5

      // Appel avec paramètre direct d valide (numérique)
      measurement.scale.update(1, 2);
      assert.equal(measurement.scale.value, 4);

      // Appel avec paramètre direct d négatif
      measurement.scale.update(1, -3);
      assert.equal(measurement.scale.value, 4, 'scale.value doit conserver sa valeur valide précédente');

      // Appel avec paramètre direct d nul
      measurement.scale.update(1, 0);
      assert.equal(measurement.scale.value, 4, 'scale.value doit conserver sa valeur valide précédente');

      // Appel avec paramètre direct sous forme de chaîne avec virgule
      measurement.scale.update(1, '  1,5  ');
      assert.equal(measurement.scale.value, 3);
    });

    it('ne doit pas inverser les coordonnées physiques calculées dans les séries en cas de saisie négative', () => {
      const fakePlayer = { setFrame: () => {} };
      const mockDecodedVideo = {
        width: 1000,
        height: 1000,
        duration: 1000,
        frames: [{}, {}],
        timestamps: [0.0, 0.0333]
      };
      measurement.init(mockDecodedVideo, fakePlayer);

      // Origine au centre (0.5, 0.5), type "topright"
      measurement.scale.origin.x = 0.5;
      measurement.scale.origin.y = 0.5;
      measurement.scale.origin.type = 'topright';

      // Point à droite et au-dessus de l'origine :
      // Sur le canvas, droite = x > 0.5 (ex: 0.7), haut = y < 0.5 (ex: 0.3)
      measurement.series[1][0] = 0.7; // canvas x
      measurement.series[2][0] = 0.3; // canvas y

      // Étalonnage avec segment dist = 0.5 et d = 1.0 m -> scale.value = 2.0
      measurement.scale.scaleSegment = { x1: 0, y1: 0, x2: 0.5, y2: 0 };
      scaleInputElement.value = '1.0';
      measurement.scale.update(1);

      let data = measurement.prepareDownloadData();
      // x physique = (0.7 - 0.5) * (+2) = +0.4 > 0
      // y physique = (0.3 - 0.5) * (-2) = +0.4 > 0
      assert.ok(data[1][0] > 0, `X physique (${data[1][0]}) doit être positif`);
      assert.ok(data[2][0] > 0, `Y physique (${data[2][0]}) doit être positif`);

      // Maintenant, l'utilisateur tape une distance négative dans scale-input
      scaleInputElement.value = '-10.0';
      measurement.scale.update(1);

      data = measurement.prepareDownloadData();
      // Les coordonnées physiques X et Y ne doivent surtout pas être inversées (devenir négatives)
      assert.ok(data[1][0] > 0, `X physique (${data[1][0]}) ne doit pas s'inverser avec une saisie négative`);
      assert.ok(data[2][0] > 0, `Y physique (${data[2][0]}) ne doit pas s'inverser avec une saisie négative`);
      assert.ok(Math.abs(data[1][0] - 0.4) < 1e-9, `Attendu ~0.4, reçu ${data[1][0]}`);
      assert.ok(Math.abs(data[2][0] - 0.4) < 1e-9, `Attendu ~0.4, reçu ${data[2][0]}`);
    });
  });
});



