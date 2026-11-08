import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

describe('Générateur de Spectres (/applets/spectres)', () => {
  const htmlPath = path.join(rootDir, 'applets/spectres/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  it('le fichier applets/spectres/index.html doit contenir les balises et styles essentiels', () => {
    assert.ok(htmlContent.length > 0);
    assert.match(htmlContent, /<canvas\s+id=["']spectrumCanvas["']/);
    assert.match(htmlContent, /id=["']zoomMinSlider["']/);
    assert.match(htmlContent, /id=["']zoomMaxSlider["']/);
    assert.match(htmlContent, /id=["']tracksTabsContainer["']/);
    assert.match(htmlContent, /id=["']activeTrackContainer["']/);
  });

  it('doit corriger le défilement vertical pour éviter que le panneau soit tronqué (overflow-y: auto)', () => {
    // common.css applique overflow: hidden sur body, html.
    // L'applet doit impérativement forcer overflow-y: auto !important pour les petits écrans / ordinateurs portables.
    assert.match(htmlContent, /overflow-y:\s*auto\s*!important/i);
    assert.match(htmlContent, /touch-action:\s*none/i);
  });

  it('les inputs de zoom doivent accepter des pas décimaux (step="any")', () => {
    assert.match(htmlContent, /id=["']zoomMinInput["'][^>]*step=["']any["']/);
    assert.match(htmlContent, /id=["']zoomMaxInput["'][^>]*step=["']any["']/);
  });

  // Extraction du code JS du script principal (dernier bloc <script> non-module)
  const scripts = [...htmlContent.matchAll(/<script(?![^>]*type=['"]module['"])[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length >= 2, 'Les scripts inline de spectres doivent exister');
  const jsCode = scripts[scripts.length - 1][1] + '; globalThis.__PRESETS_DB = PRESETS_DB; globalThis.__state = state;';

  const createMockElement = (id = '') => ({
    id,
    value: '500',
    checked: true,
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: () => {},
    dataset: {},
    getContext: () => ({
      setTransform: () => {},
      fillRect: () => {},
      scale: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      strokeRect: () => {},
      strokeText: () => {},
      fillText: () => {},
      measureText: () => ({ width: 50 }),
      save: () => {},
      restore: () => {},
      setLineDash: () => {},
      drawImage: () => {},
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: () => {}
    }),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 260 }),
    appendChild: () => {},
    innerHTML: '',
    setPointerCapture: () => {},
    releasePointerCapture: () => {},
    hasPointerCapture: () => false
  });

  // Exécution du script dans un bac à sable avec mocks DOM
  const sandbox = {
    document: {
      documentElement: { classList: { add: () => {} } },
      getElementById: (id) => createMockElement(id),
      querySelector: (sel) => createMockElement(),
      querySelectorAll: () => [],
      createElement: () => createMockElement(),
      activeElement: null
    },
    window: {
      devicePixelRatio: 1,
      innerWidth: 1200,
      addEventListener: () => {}
    },
    navigator: {
      userAgent: 'Mozilla/5.0'
    },
    Math,
    parseFloat,
    parseInt,
    isNaN,
    JSON,
    Uint8ClampedArray,
    showToast: () => {}
  };
  vm.createContext(sandbox);

  it('le script principal doit s\'évaluer sans erreur', () => {
    vm.runInContext(jsCode, sandbox);
    assert.ok(sandbox.__PRESETS_DB);
    assert.equal(typeof sandbox.wavelengthToRGB, 'function');
    assert.equal(typeof sandbox.getThermalMultiplier, 'function');
    assert.equal(typeof sandbox.getLinesFactor, 'function');
  });

  describe('Conversion longueur d\'onde -> RGB (wavelengthToRGB)', () => {
    it('retourne [0, 0, 0] pour les longueurs d\'onde hors du visible (< 380 nm ou > 780 nm)', () => {
      const { wavelengthToRGB } = sandbox;
      assert.deepEqual([...wavelengthToRGB(300)], [0, 0, 0]);
      assert.deepEqual([...wavelengthToRGB(350)], [0, 0, 0]);
      assert.deepEqual([...wavelengthToRGB(850)], [0, 0, 0]);
    });

    it('donne une composante bleue/violette dominante autour de 420-450 nm', () => {
      const { wavelengthToRGB } = sandbox;
      const [r, g, b] = wavelengthToRGB(440);
      assert.ok(b > r && b > g, `Le bleu (${b}) doit dominer à 440 nm (r=${r}, g=${g})`);
    });

    it('donne une composante verte dominante autour de 520-540 nm', () => {
      const { wavelengthToRGB } = sandbox;
      const [r, g, b] = wavelengthToRGB(530);
      assert.ok(g > r && g > b, `Le vert (${g}) doit dominer à 530 nm (r=${r}, b=${b})`);
    });

    it('donne du jaune (R et G élevés, B très faible) vers 585 nm', () => {
      const { wavelengthToRGB } = sandbox;
      const [r, g, b] = wavelengthToRGB(585);
      assert.ok(r > 200 && g > 150 && b === 0, `Doit être jaune à 585 nm (r=${r}, g=${g}, b=${b})`);
    });

    it('donne une composante rouge dominante vers 650-700 nm', () => {
      const { wavelengthToRGB } = sandbox;
      const [r, g, b] = wavelengthToRGB(660);
      assert.ok(r > g && r > b && g === 0 && b === 0, `Le rouge (${r}) doit dominer à 660 nm`);
    });
  });

  describe('Calcul du rayonnement thermique (getThermalMultiplier)', () => {
    it('Mode exagéré : enrichissement vers le violet lorsque la température augmente', () => {
      const { getThermalMultiplier } = sandbox;
      const multColdViolet = getThermalMultiplier(420, 2000, true, 7);
      const multColdRed = getThermalMultiplier(680, 2000, true, 7);
      assert.ok(multColdViolet < 0.05, `À 2000 K, le violet doit être éteint (obtenu ${multColdViolet})`);
      assert.ok(multColdRed > 0.4, `À 2000 K, le rouge doit être présent (obtenu ${multColdRed})`);

      const multHotViolet = getThermalMultiplier(420, 9000, true, 7);
      assert.ok(multHotViolet > 0.9, `À 9000 K, le violet doit être allumé (obtenu ${multHotViolet})`);
    });

    it('Mode réaliste (loi de Planck) : produit des valeurs bornées dans [0, 1] sans NaN', () => {
      const { getThermalMultiplier } = sandbox;
      for (let temp = 1500; temp <= 12000; temp += 1500) {
        for (let lambda = 390; lambda <= 770; lambda += 20) {
          const val = getThermalMultiplier(lambda, temp, false, 7);
          assert.ok(!isNaN(val), `getThermalMultiplier ne doit pas renvoyer NaN pour T=${temp}, λ=${lambda}`);
          assert.ok(val >= 0 && val <= 1, `getThermalMultiplier doit être dans [0, 1], obtenu ${val}`);
        }
      }
    });
  });

  describe('Facteur de raies spectrales (getLinesFactor)', () => {
    it('détecte correctement une raie fine et retourne une intensité maximale proche de 1 au centre', () => {
      const { getLinesFactor } = sandbox;
      const lines = [{ lambda: 589.0, w: 1.8, intensity: 1.0 }];
      const centerFactor = getLinesFactor(589.0, lines, 400);
      assert.ok(centerFactor > 0.95, `Au centre de la raie, facteur proche de 1 (obtenu ${centerFactor})`);

      const farFactor = getLinesFactor(600.0, lines, 400);
      assert.equal(farFactor, 0, 'Loin de la raie, le facteur doit être nul');
    });

    it('affine la résolution instrumentale des raies atomiques lors d\'un zoom prononcé', () => {
      const { getLinesFactor } = sandbox;
      const lines = [{ lambda: 589.0, w: 1.8, intensity: 1.0 }];

      const valWide = getLinesFactor(589.4, lines, 400);
      const valZoomed = getLinesFactor(589.4, lines, 7);

      assert.ok(valWide > valZoomed, `En zoom fort, la raie doit être plus résolue (fine) : ${valWide} > ${valZoomed}`);
    });
  });

  describe('Vérification de la base de données (PRESETS_DB)', () => {
    it('toutes les raies de tous les éléments doivent avoir des longueurs d\'onde et largeurs valides', () => {
      const PRESETS_DB = sandbox.__PRESETS_DB;
      assert.ok(PRESETS_DB, 'PRESETS_DB doit être défini');
      for (const [key, preset] of Object.entries(PRESETS_DB)) {
        assert.ok(preset.label, `Le preset ${key} doit avoir un label`);
        assert.ok(Array.isArray(preset.lines), `Le preset ${key} doit avoir un tableau lines`);
        for (const line of preset.lines) {
          assert.ok(line.lambda >= 350 && line.lambda <= 800, `λ=${line.lambda} dans ${key} doit être dans [350, 800] nm`);
          assert.ok(line.w > 0, `Largeur w=${line.w} dans ${key} doit être > 0`);
          assert.ok(line.intensity >= 0 && line.intensity <= 1, `Intensité dans ${key} doit être dans [0, 1]`);
        }
      }
    });

    it('contient les nouveaux éléments standards (Argon et Cadmium)', () => {
      const PRESETS_DB = sandbox.__PRESETS_DB;
      assert.ok(PRESETS_DB.Ar, 'Argon doit être dans la base');
      assert.ok(PRESETS_DB.Cd, 'Cadmium doit être dans la base');
      assert.equal(PRESETS_DB.Cd.lines[2].lambda, 508.6);
    });

    it('le doublet du Sodium Na doit contenir les 2 raies D1 et D2 séparées de 0.6 nm', () => {
      const PRESETS_DB = sandbox.__PRESETS_DB;
      const naLines = PRESETS_DB.Na.lines;
      assert.equal(naLines.length, 2);
      assert.equal(naLines[0].lambda, 589.0);
      assert.equal(naLines[1].lambda, 589.6);
      assert.equal(naLines[0].label, 'D2');
      assert.equal(naLines[1].label, 'D1');
    });
  });

  describe('Logique de sélection de presets (nom et mode)', () => {
    it('le code de gestion du catalogue doit adapter automatiquement le mode et le nom', () => {
      assert.match(htmlContent, /state\.tracks\[tIdx\]\.mode\s*=\s*['"]absorption_lines['"]/);
      assert.match(htmlContent, /state\.tracks\[tIdx\]\.mode\s*=\s*['"]thermal_abs['"]/);
      assert.match(htmlContent, /state\.tracks\[tIdx\]\.name\s*=\s*item\.label\.split/);
    });
  });

  describe('Intégrité de l\'axe et du zoom à fort grossissement', () => {
    it('doit prévoir un pas fin (majorStep=0.5, minorStep=0.1) quand spanNm <= 4', () => {
      assert.match(htmlContent, /geom\.spanNm\s*<=\s*4\)\s*\{\s*majorStep\s*=\s*0\.5;\s*minorStep\s*=\s*0\.1;/);
    });
  });
});
