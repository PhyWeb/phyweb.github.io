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
  const spectresDir = path.join(rootDir, 'applets/spectres');
  const htmlPath = path.join(spectresDir, 'index.html');
  const cssPath = path.join(spectresDir, 'style.css');
  const dataPath = path.join(spectresDir, 'data.js');
  const mainPath = path.join(spectresDir, 'main.js');

  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const dataContent = fs.readFileSync(dataPath, 'utf8');
  const mainContent = fs.readFileSync(mainPath, 'utf8');

  it('l\'applet doit être correctement découpée en 4 fichiers (html, css, data, main)', () => {
    assert.ok(fs.existsSync(htmlPath), 'index.html doit exister');
    assert.ok(fs.existsSync(cssPath), 'style.css doit exister');
    assert.ok(fs.existsSync(dataPath), 'data.js doit exister');
    assert.ok(fs.existsSync(mainPath), 'main.js doit exister');
    assert.match(htmlContent, /<link\s+rel=["']stylesheet["']\s+href=["']style\.css["']/);
    assert.match(htmlContent, /<script\s+type=["']module["']\s+src=["']main\.js["']>/);
  });

  it('le fichier applets/spectres/index.html doit contenir les balises essentielles', () => {
    assert.ok(htmlContent.length > 0);
    assert.match(htmlContent, /<canvas\s+id=["']spectrumCanvas["']/);
    assert.match(htmlContent, /id=["']zoomMinSlider["']/);
    assert.match(htmlContent, /id=["']zoomMaxSlider["']/);
    assert.match(htmlContent, /id=["']tracksTabsContainer["']/);
    assert.match(htmlContent, /id=["']activeTrackContainer["']/);
  });

  it('les boutons d\'action ne doivent pas avoir d\'attributs inline onclick (évite les doubles exécutions)', () => {
    assert.doesNotMatch(htmlContent, /id=["']btnCopyHD["'][^>]*onclick=/);
    assert.doesNotMatch(htmlContent, /id=["']btnDownloadHD["'][^>]*onclick=/);
    assert.doesNotMatch(htmlContent, /id=["']btnCopyEmpty["'][^>]*onclick=/);
    assert.doesNotMatch(htmlContent, /id=["']btnDownloadEmpty["'][^>]*onclick=/);
    assert.doesNotMatch(htmlContent, /id=["']btnResetApplet["'][^>]*onclick=/);
  });

  it('le mode exagération doit être désactivé par défaut', () => {
    assert.doesNotMatch(htmlContent, /<input\s+type=["']checkbox["']\s+id=["']toggleExaggerated["']\s+checked/);
    assert.match(htmlContent, /<input\s+type=["']checkbox["']\s+id=["']toggleExaggerated["']/);
    assert.match(dataContent, /exaggerated:\s*false/);
  });

  it('doit corriger le défilement vertical pour éviter que le panneau soit tronqué (overflow-y: auto)', () => {
    // common.css applique overflow: hidden sur body, html.
    // L'applet doit impérativement forcer overflow-y: auto !important pour les petits écrans / ordinateurs portables.
    assert.match(cssContent, /overflow-y:\s*auto\s*!important/i);
    assert.match(cssContent, /touch-action:\s*none/i);
  });

  it('les inputs de zoom doivent accepter des pas décimaux (step="any")', () => {
    assert.match(htmlContent, /id=["']zoomMinInput["'][^>]*step=["']any["']/);
    assert.match(htmlContent, /id=["']zoomMaxInput["'][^>]*step=["']any["']/);
  });

  it('la page d\'accueil index.html doit référencer l\'outil Spectres dans la section Outils pour l\'enseignant', () => {
    const homeHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.match(homeHtml, /href=["']\.\/applets\/spectres\/index\.html["']/);
    assert.match(homeHtml, /Spectres d['’]émission et d['’]absorption/);
  });

  it('la page 404.html doit rediriger les URL /spectres et /spectre vers /applets/spectres/', () => {
    const errorHtml = fs.readFileSync(path.join(rootDir, '404.html'), 'utf8');
    assert.match(errorHtml, /\/spectres/);
    assert.match(errorHtml, /\/applets\/spectres\//);
  });

  const elementsById = new Map();
  const createMockElement = (id = '') => {
    if (id && elementsById.has(id)) return elementsById.get(id);
    const listeners = {};
    const el = {
      id,
      value: '500',
      checked: true,
      style: {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      addEventListener: (type, fn) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
      },
      dispatchEvent: (event) => {
        if (listeners[event.type]) {
          listeners[event.type].forEach(fn => fn(event));
        }
      },
      _listeners: listeners,
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
    };
    if (id) elementsById.set(id, el);
    return el;
  };

  // Exécution des scripts dans un bac à sable avec mocks DOM
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
      addEventListener: () => {},
      requestAnimationFrame: (cb) => { cb(); return 1; },
      cancelAnimationFrame: () => {}
    },
    navigator: {
      userAgent: 'Mozilla/5.0'
    },
    setTimeout,
    clearTimeout,
    Math,
    parseFloat,
    parseInt,
    isNaN,
    JSON,
    Uint8ClampedArray,
    showToast: () => {},
    initApplets: () => {}
  };
  vm.createContext(sandbox);

  // Évaluation de data.js et main.js dans le sandbox
  const dataJsClean = dataContent
    .replace(/^export\s+(const|let|function)/gm, '$1')
    .replace(/^export\s*\{[^}]*\};?/gm, '');
  vm.runInContext(dataJsClean, sandbox);

  const mainJsClean = mainContent
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, '')
    .replace(/^export\s+(const|let|function)/gm, '$1')
    .replace(/^export\s*\{[^}]*\};?/gm, '') +
    '; globalThis.__DEFAULT_STATE = DEFAULT_STATE; globalThis.__PRESETS_DB = PRESETS_DB; globalThis.__state = state; globalThis.__getHoveredLine = getHoveredLine; globalThis.__getLayoutGeometry = getLayoutGeometry; globalThis.__getEffectiveLineWidth = getEffectiveLineWidth; globalThis.__buildPresetsDropdownHTML = buildPresetsDropdownHTML; globalThis.__applyPreset = applyPreset;';

  it('les modules data.js et main.js doivent s\'évaluer sans erreur', () => {
    vm.runInContext(mainJsClean, sandbox);
    assert.ok(sandbox.__PRESETS_DB);
    assert.equal(sandbox.__state.exaggerated, false);
    assert.equal(typeof sandbox.wavelengthToRGB, 'function');
    assert.equal(typeof sandbox.getThermalMultiplier, 'function');
    assert.equal(typeof sandbox.getLinesFactor, 'function');
  });

  describe('Conversion longueur d\'onde -> RGB (wavelengthToRGB)', () => {
    it('retourne [0, 0, 0] pour les longueurs d\'onde hors du visible (< 400 nm ou > 800 nm)', () => {
      const { wavelengthToRGB } = sandbox;
      assert.deepEqual([...wavelengthToRGB(300)], [0, 0, 0]);
      assert.deepEqual([...wavelengthToRGB(350)], [0, 0, 0]);
      assert.deepEqual([...wavelengthToRGB(395)], [0, 0, 0]);
      assert.deepEqual([...wavelengthToRGB(805)], [0, 0, 0]);
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

    it('Mode exagéré : à très haute température (12000 K), le violet domine et le rouge est atténué sans extinction totale', () => {
      const { getThermalMultiplier } = sandbox;
      const multHotViolet = getThermalMultiplier(400, 12000, true, 7);
      const multHotHAlpha = getThermalMultiplier(656.3, 12000, true, 7);
      const multHotDeepRed = getThermalMultiplier(770, 12000, true, 7);

      assert.ok(multHotViolet > 0.9, `À 12000 K, le violet doit être éclatant (> 0.9), obtenu ${multHotViolet}`);
      assert.ok(multHotDeepRed < 0.35, `À 12000 K, le rouge extrême doit être atténué (< 0.35), obtenu ${multHotDeepRed}`);
      assert.ok(multHotDeepRed > 0.15, `À 12000 K, le rouge ne doit pas être totalement coupé (> 0.15), obtenu ${multHotDeepRed}`);
      assert.ok(multHotHAlpha > 0.45, `À 12000 K, la raie Hα (656.3 nm) doit rester clairement visible (> 0.45), obtenu ${multHotHAlpha}`);
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

    it('Mode réaliste : le cache du maximum de Planck ne change pas les résultats (alternance de températures)', () => {
      const { getThermalMultiplier } = sandbox;
      const first3000 = getThermalMultiplier(600, 3000, false, 7);
      const first9000 = getThermalMultiplier(600, 9000, false, 7);
      // Alternance de températures : le cache doit rester cohérent
      assert.equal(getThermalMultiplier(600, 3000, false, 7), first3000);
      assert.equal(getThermalMultiplier(600, 9000, false, 7), first9000);
      assert.notEqual(first3000, first9000);
    });

    it('Mode réaliste : continuité de la courbe de Planck à la frontière UV/visible (390-410 nm)', () => {
      const { getThermalMultiplier } = sandbox;
      // À 5800 K (Soleil), l'intensité thermique doit rester continue à travers 400 nm sans s'effondrer à 0
      const val390 = getThermalMultiplier(390, 5800, false, 7);
      const val400 = getThermalMultiplier(400, 5800, false, 7);
      const val410 = getThermalMultiplier(410, 5800, false, 7);

      assert.ok(val390 > 0.8, `À 390 nm (proche UV), l'intensité doit être calculée (> 0.8), obtenu ${val390}`);
      assert.ok(val400 > 0.8, `À 400 nm, l'intensité doit être continue (> 0.8), obtenu ${val400}`);
      assert.ok(val410 > 0.8, `À 410 nm, l'intensité doit être continue (> 0.8), obtenu ${val410}`);
      assert.ok(Math.abs(val400 - val390) < 0.05, `Continuité entre 390 et 400 nm : écart ${Math.abs(val400 - val390)}`);

      // En dehors de [350, 850], la fonction retourne 0
      assert.equal(getThermalMultiplier(340, 5800, false, 7), 0);
      assert.equal(getThermalMultiplier(860, 5800, false, 7), 0);
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
          assert.ok(line.lambda >= 350 && line.lambda <= 850, `λ=${line.lambda} dans ${key} doit être dans [350, 850] nm`);
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

    it('le preset Calcium (Ca) doit contenir les raies authentiques et pas la raie du fer à 527.0 nm', () => {
      const PRESETS_DB = sandbox.__PRESETS_DB;
      const caLines = PRESETS_DB.Ca.lines;
      const lambdas = caLines.map(l => l.lambda);
      assert.ok(lambdas.includes(393.4), 'Doit contenir Ca II K (393.4 nm)');
      assert.ok(lambdas.includes(396.8), 'Doit contenir Ca II H (396.8 nm)');
      assert.ok(lambdas.includes(422.7), 'Doit contenir Ca I g (422.7 nm)');
      assert.equal(caLines[0].label, 'Ca II (K)');
      assert.equal(caLines[1].label, 'Ca II (H)');
      assert.equal(caLines[2].label, 'Ca I (g)');
      assert.ok(lambdas.includes(612.2), 'Doit contenir la raie orange à 612.2 nm');
      assert.ok(lambdas.includes(616.2), 'Doit contenir la raie orange à 616.2 nm');
      assert.ok(!lambdas.includes(527.0), 'Ne doit pas contenir la raie Fraunhofer E du fer (527.0 nm)');
    });
  });

  describe('Logique de sélection de presets (nom et mode)', () => {
    it('le code de gestion du catalogue doit adapter automatiquement le mode et le nom', () => {
      assert.match(mainContent, /state\.tracks\[tIdx\]\.mode\s*=\s*['"]absorption_lines['"]/);
      assert.match(mainContent, /state\.tracks\[tIdx\]\.mode\s*=\s*['"]thermal_abs['"]/);
      assert.match(mainContent, /state\.tracks\[tIdx\]\.name\s*=\s*getPresetShortName\(item\)/);
    });

    it('getPresetShortName retire la partie entre parenthèses du libellé', () => {
      const { getPresetShortName } = sandbox;
      assert.equal(getPresetShortName({ label: 'Soleil (5800 K)' }), 'Soleil');
      assert.equal(getPresetShortName({ label: 'Hydrogène' }), 'Hydrogène');
    });

    it('le changement de preset ne doit pas écraser un nom personnalisé', () => {
      assert.match(mainContent, /const\s+isAutoName\s*=/);
      assert.match(mainContent, /if\s*\(isAutoName\)\s*\{\s*state\.tracks\[tIdx\]\.name/);
    });

    it('DEFAULT_STATE : la piste Corps chaud (mode thermique sans raies) ne doit pas être liée au preset Hydrogène', () => {
      const DEFAULT_STATE = sandbox.__DEFAULT_STATE;
      assert.ok(DEFAULT_STATE);
      const track3 = DEFAULT_STATE.tracks[2];
      assert.equal(track3.name, 'Corps chaud');
      assert.equal(track3.mode, 'thermal');
      assert.equal(track3.lines.length, 0);
      assert.equal(track3.presetKey, null, 'Le presetKey doit être null pour un corps chaud pur sans raies');
    });
  });

  describe('Méga-dropdown des présélections (catalogue structuré par catégories comme Grapher)', () => {
    it('le code de spectres doit inclure le conteneur dropdown Bulma avec menu structuré', () => {
      assert.match(mainContent, /id=["']presets-dropdown["']/);
      assert.match(mainContent, /class=["'][^"']*dropdown\s+is-right[^"']*["']/);
      assert.match(mainContent, /class=["'][^"']*preset-dropdown-btn[^"']*["']/);
      assert.match(mainContent, /class=["'][^"']*preset-dropdown-content[^"']*["']|id=["']presets-dropdown-content["']/);
    });

    it('le bouton du dropdown ne doit pas tronquer son icône à gauche (annulation des marges négatives Bulma)', () => {
      // Bulma applique .button .icon:first-child:not(:last-child) avec margin-inline-start négatif.
      // Dans le bouton de présélection, l'icône de gauche ne doit pas avoir de marge négative et ne doit pas être tronquée.
      assert.match(cssContent, /\.preset-dropdown-btn\s+\.icon:first-child:not\(:last-child\)\s*\{[^}]*margin-inline-start:\s*0/);
    });

    it('buildPresetsDropdownHTML doit générer une disposition en colonnes avec les 3 catégories', () => {
      const buildDropdownHTML = sandbox.__buildPresetsDropdownHTML;
      assert.equal(typeof buildDropdownHTML, 'function');

      const html = buildDropdownHTML('Na', 0);
      // Colonnes Bulma
      assert.match(html, /class=["'][^"']*columns[^"']*["']/);
      assert.match(html, /class=["'][^"']*column\s+is-6[^"']*["']/);

      // Titres des 3 catégories
      assert.match(html, /Atomes\s*&\s*Ions/);
      assert.match(html, /Étoiles/);
      assert.match(html, /Molécules\s*&\s*Solutions/);

      // Icônes de catégories
      assert.match(html, /fa-atom/);
      assert.match(html, /fa-star/);
      assert.match(html, /fa-flask/);
    });

    it('chaque preset doit posséder son tag, sa description et son attribut data-key', () => {
      const buildDropdownHTML = sandbox.__buildPresetsDropdownHTML;
      const html = buildDropdownHTML('H', 0);

      // Atomes : tag bleu
      assert.match(html, /data-key=["']H["'][^>]*>[\s\S]*?<span\s+class=["'][^"']*tag\s+is-info\s+is-light[^"']*["'][^>]*>[\s\S]*?H[\s\S]*?<\/span>/);
      // Étoiles : tag jaune
      assert.match(html, /data-key=["']Star_Soleil["'][^>]*>[\s\S]*?<span\s+class=["'][^"']*tag\s+is-warning\s+is-light[^"']*["'][^>]*>[\s\S]*?Soleil[\s\S]*?<\/span>/);
      // Molécules : tag violet harmonisé avec Grapher
      assert.match(html, /data-key=["']KMnO4["'][^>]*>[\s\S]*?<span\s+class=["'][^"']*tag\s+is-purple-light[^"']*["'][^>]*>[\s\S]*?KMnO₄[\s\S]*?<\/span>/);
    });

    it('l\'élément sélectionné doit être mis en valeur (is-active-preset et coche check)', () => {
      const buildDropdownHTML = sandbox.__buildPresetsDropdownHTML;
      const htmlNa = buildDropdownHTML('Na', 0);

      assert.match(htmlNa, /class=["'][^"']*preset-item\s+is-active-preset[^"']*["'][^>]*data-key=["']Na["']/);
      assert.match(htmlNa, /data-key=["']Na["'][\s\S]*?fa-check/);
    });

    it('applyPreset applique correctement le modèle, met à jour les raies et ajuste le mode', () => {
      const applyPreset = sandbox.__applyPreset;
      const state = sandbox.__state;
      const PRESETS_DB = sandbox.__PRESETS_DB;
      assert.equal(typeof applyPreset, 'function');

      // Test 1: Sélection d'un atome (Na)
      state.tracks[0].name = "Corps chaud"; // nom par défaut
      applyPreset(0, 'Na');
      assert.equal(state.tracks[0].presetKey, 'Na');
      assert.equal(state.tracks[0].name, 'Sodium');
      assert.equal(state.tracks[0].lines.length, PRESETS_DB.Na.lines.length);

      // Test 2: Sélection d'une solution (KMnO4) -> bascule automatique en mode absorption
      applyPreset(0, 'KMnO4');
      assert.equal(state.tracks[0].presetKey, 'KMnO4');
      assert.equal(state.tracks[0].mode, 'absorption_lines');
      assert.equal(state.tracks[0].name, 'Permanganate de potassium');

      // Test 3: Sélection d'une étoile (Soleil) -> mode thermal_abs et température
      applyPreset(0, 'Star_Soleil');
      assert.equal(state.tracks[0].presetKey, 'Star_Soleil');
      assert.equal(state.tracks[0].mode, 'thermal_abs');
      assert.equal(state.tracks[0].temp, 5800);
      assert.equal(state.tracks[0].name, 'Soleil');

      // Test 4: Sélection d'un atome (H) depuis un mode thermal_abs -> bascule en emission_lines
      applyPreset(0, 'H');
      assert.equal(state.tracks[0].presetKey, 'H');
      assert.equal(state.tracks[0].mode, 'emission_lines', 'Doit basculer en emission_lines lors du choix d\'un atome depuis thermal_abs');
      assert.equal(state.tracks[0].name, 'Hydrogène');
    });
  });

  describe('Intégrité de l\'axe et du zoom à fort grossissement', () => {
    it('doit prévoir un pas fin (majorStep=0.5, minorStep=0.1) quand spanNm <= 4', () => {
      assert.match(mainContent, /geom\.spanNm\s*<=\s*4\)\s*\{\s*majorStep\s*=\s*0\.5;\s*minorStep\s*=\s*0\.1;/);
    });

    it('l\'encombrement vertical du profil I(λ) dans getLayoutGeometry doit être exactement de 82 px', () => {
      const state = sandbox.__state;
      const getLayoutGeometry = sandbox.__getLayoutGeometry;

      state.showProfile = false;
      const hSansProfil = getLayoutGeometry().totalH;

      state.showProfile = true;
      const hAvecProfil = getLayoutGeometry().totalH;

      assert.equal(hAvecProfil - hSansProfil, 82, 'L\'activation du profil doit ajouter exactement 82 px au totalH');
    });
  });

  describe('Dégradé spectral dynamique de la barre de zoom (getSpectrumGradient)', () => {
    it('la fonction getSpectrumGradient doit être définie', () => {
      assert.equal(typeof sandbox.getSpectrumGradient, 'function');
    });

    it('doit produire uniquement du jaune pour une sélection serrée sur le doublet du Sodium (586 - 593 nm)', () => {
      const grad = sandbox.getSpectrumGradient(586, 593);
      assert.ok(grad.startsWith('linear-gradient(90deg,'));
      // Extraire tous les rgb(...) du dégradé
      const rgbMatches = [...grad.matchAll(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g)];
      assert.ok(rgbMatches.length > 5, 'Doit contenir plusieurs stops de couleur');
      for (const m of rgbMatches) {
        const r = parseInt(m[1]);
        const g = parseInt(m[2]);
        const b = parseInt(m[3]);
        // Du jaune : R élevé (> 200), G élevé (> 150), B nul/négligeable (< 20)
        assert.ok(r > 200, `R (${r}) doit être élevé pour du jaune`);
        assert.ok(g > 150, `G (${g}) doit être élevé pour du jaune`);
        assert.ok(b < 20, `B (${b}) doit être quasi nul pour du jaune`);
      }
    });

    it('doit produire uniquement du rouge pour une sélection serrée vers H-alpha (650 - 670 nm)', () => {
      const grad = sandbox.getSpectrumGradient(650, 670);
      const rgbMatches = [...grad.matchAll(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g)];
      for (const m of rgbMatches) {
        const r = parseInt(m[1]);
        const g = parseInt(m[2]);
        const b = parseInt(m[3]);
        assert.ok(r > 200, `R (${r}) doit dominer`);
        assert.equal(g, 0, 'G doit être 0 dans le rouge');
        assert.equal(b, 0, 'B doit être 0 dans le rouge');
      }
    });

    it('doit couvrir tout le spectre visible pour une vue globale (400 - 800 nm)', () => {
      const grad = sandbox.getSpectrumGradient(400, 800);
      const rgbMatches = [...grad.matchAll(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g)];
      // Premier stop : violet (B élevé)
      const firstB = parseInt(rgbMatches[0][3]);
      assert.ok(firstB > 150, 'Le début du spectre visible doit être violet/bleu');
      // Dernier stop : rouge sombre (R dominant, G et B nuls)
      const lastR = parseInt(rgbMatches[rgbMatches.length - 1][1]);
      const lastG = parseInt(rgbMatches[rgbMatches.length - 1][2]);
      const lastB = parseInt(rgbMatches[rgbMatches.length - 1][3]);
      assert.ok(lastR > 50 && lastG === 0 && lastB === 0, 'La fin du spectre visible doit être rouge sombre');
    });

    it('syncZoomUI doit appliquer le dégradé dynamique sur fill.style.background', () => {
      assert.match(mainContent, /fill\.style\.background\s*=\s*getSpectrumGradient\(vMin,\s*vMax\)/);
    });

    it('doit mémoïser le dégradé pour éviter des allocations et recalculs superflus', () => {
      const grad1 = sandbox.getSpectrumGradient(500, 600);
      const grad2 = sandbox.getSpectrumGradient(500, 600);
      assert.equal(grad1, grad2);
      // Même résultat pour un écart inférieur à 0.1 nm (arrondi au 0.2 nm)
      const grad3 = sandbox.getSpectrumGradient(500.04, 600.04);
      assert.equal(grad1, grad3);
    });
  });

  describe('Fluidité 60 Hz et Optimisation de la barre de zoom', () => {
    it('la piste de remplissage .dual-range-fill doit avoir will-change et pointer-events: none', () => {
      assert.match(cssContent, /\.dual-range-fill\s*\{[^}]*pointer-events:\s*none;/);
      assert.match(cssContent, /\.dual-range-fill\s*\{[^}]*will-change:\s*left,\s*width;/);
      assert.match(cssContent, /\.dual-range-track\s*\{[^}]*pointer-events:\s*none;/);
    });

    it('doit découpler le rafraîchissement continu via scheduleRender / requestAnimationFrame', () => {
      assert.match(mainContent, /function\s+scheduleRender\s*\(\)/);
      assert.match(mainContent, /renderAnimFrameId\s*=\s*requestFrame/);
    });

    it('updateCanvasDimensions ne doit réallouer canvas.width/height que si les dimensions ont changé', () => {
      assert.match(mainContent, /if\s*\(\s*canvas\.width\s*!==\s*targetW\s*\)\s*canvas\.width\s*=\s*targetW;/);
      assert.match(mainContent, /if\s*\(\s*canvas\.height\s*!==\s*targetH\s*\)\s*canvas\.height\s*=\s*targetH;/);
    });

    it('doit éviter les reflows forcés (getBoundingClientRect) pendant le glissement des curseurs', () => {
      assert.match(mainContent, /isDraggingZoomSlider\s*=\s*true/);
      assert.match(mainContent, /if\s*\(\s*isDraggingZoomSlider\s*\)\s*return;/);
    });
  });

  describe('Gestion de la molette et zoom au pavé tactile (wheel)', () => {
    it('le code source ne doit pas appeler preventDefault avant de vérifier que le curseur est dans la bande', () => {
      const wheelCodeMatch = mainContent.match(/canvas\.addEventListener\(['"]wheel['"],\s*\(e\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\{\s*passive:\s*false\s*\}\);/);
      assert.ok(wheelCodeMatch, 'Le listener wheel doit être présent');
      const body = wheelCodeMatch[1];
      const preventDefaultIndex = body.indexOf('e.preventDefault()');
      const boundCheckIndex = body.search(/mouseX\s*<\s*geom\.leftMargin/);
      assert.ok(preventDefaultIndex > -1, 'e.preventDefault() doit être appelé');
      assert.ok(boundCheckIndex > -1, 'Le test curseur dans la bande doit exister');
      assert.ok(
        preventDefaultIndex > boundCheckIndex,
        'e.preventDefault() doit être appelé APRÈS le test du curseur dans la bande pour ne pas bloquer le scroll'
      );
    });

    it('le zoom doit être proportionnel à deltaY (évite le sur-zoom sur pavé tactile)', () => {
      assert.match(mainContent, /Math\.pow\(\s*1\.22\s*,\s*clampedDy\s*\/\s*100\s*\)/);
      assert.match(mainContent, /e\.deltaMode\s*===\s*1/);
    });

    it('ne doit pas bloquer le défilement (pas de preventDefault) quand le curseur est hors de la bande spectrale', () => {
      const canvasEl = elementsById.get('spectrumCanvas');
      assert.ok(canvasEl && canvasEl._listeners.wheel?.length > 0, 'Le canvas doit avoir un listener wheel');
      const wheelHandler = canvasEl._listeners.wheel[0];

      // Curseur dans la marge gauche (titres des spectres)
      let prevented = false;
      wheelHandler({
        clientX: 5,
        clientY: 50,
        deltaY: 100,
        deltaMode: 0,
        preventDefault: () => { prevented = true; }
      });
      assert.equal(prevented, false, 'Ne doit pas appeler preventDefault dans la marge gauche');

      // Curseur dans la marge droite
      prevented = false;
      wheelHandler({
        clientX: 790,
        clientY: 50,
        deltaY: 100,
        deltaMode: 0,
        preventDefault: () => { prevented = true; }
      });
      assert.equal(prevented, false, 'Ne doit pas appeler preventDefault dans la marge droite');

      // deltaY nul
      prevented = false;
      wheelHandler({
        clientX: 400,
        clientY: 50,
        deltaY: 0,
        deltaMode: 0,
        preventDefault: () => { prevented = true; }
      });
      assert.equal(prevented, false, 'Ne doit pas appeler preventDefault si deltaY est 0');
    });

    it('doit zoomer progressivement sur pavé tactile sans sauts brutaux de 22%', () => {
      const canvasEl = elementsById.get('spectrumCanvas');
      const wheelHandler = canvasEl._listeners.wheel[0];
      const state = sandbox.__state;

      // Fixer une plage de zoom initiale connue
      state.viewMinNm = 400;
      state.viewMaxNm = 700;
      const initialSpan = state.viewMaxNm - state.viewMinNm; // 300 nm

      let prevented = false;
      // Événement typique de pavé tactile : petit deltaY (+2)
      wheelHandler({
        clientX: 400,
        clientY: 50,
        deltaY: 2,
        deltaMode: 0,
        preventDefault: () => { prevented = true; }
      });

      assert.equal(prevented, true, 'Doit appeler preventDefault dans la bande spectrale');
      const newSpan = state.viewMaxNm - state.viewMinNm;
      const ratioChange = (newSpan - initialSpan) / initialSpan;

      // Pour deltaY = 2, le zoom doit être très faible (< 1%) et non 22%
      assert.ok(
        ratioChange > 0 && ratioChange < 0.01,
        `Le zoom pour deltaY=2 doit être progressif (< 1%), obtenu ${(ratioChange * 100).toFixed(2)}%`
      );
    });

    it('doit appliquer un facteur de zoom d\'environ 1.22 pour un cran classique de molette (deltaY = 100)', () => {
      const canvasEl = elementsById.get('spectrumCanvas');
      const wheelHandler = canvasEl._listeners.wheel[0];
      const state = sandbox.__state;

      // Plage initiale
      state.viewMinNm = 500;
      state.viewMaxNm = 600;
      const initialSpan = state.viewMaxNm - state.viewMinNm; // 100 nm

      wheelHandler({
        clientX: 400,
        clientY: 50,
        deltaY: 100,
        deltaMode: 0,
        preventDefault: () => {}
      });

      const newSpan = state.viewMaxNm - state.viewMinNm;
      const factor = newSpan / initialSpan;
      assert.ok(Math.abs(factor - 1.22) < 0.01, `Pour deltaY=100, le facteur doit être proche de 1.22 (obtenu ${factor})`);
    });
  });

  describe('Synchronisation des champs de zoom min/max (B3)', () => {
    it('doit réécrire la valeur corrigée (350) dans zoomMinInput même si le champ a le focus (Entrée)', () => {
      const minInput = elementsById.get('zoomMinInput');
      const state = sandbox.__state;
      sandbox.document.activeElement = minInput;

      minInput.value = '100';
      minInput.dispatchEvent({ type: 'change', target: minInput });

      assert.equal(state.viewMinNm, 350);
      assert.equal(minInput.value, 350, 'Le champ minInput doit afficher 350 et non 100 après validation');
    });

    it('doit réécrire la valeur corrigée (850) dans zoomMaxInput même si le champ a le focus', () => {
      const maxInput = elementsById.get('zoomMaxInput');
      const state = sandbox.__state;
      sandbox.document.activeElement = maxInput;

      maxInput.value = '999';
      maxInput.dispatchEvent({ type: 'change', target: maxInput });

      assert.equal(state.viewMaxNm, 850);
      assert.equal(maxInput.value, 850, 'Le champ maxInput doit afficher 850 et non 999 après validation');
    });

    it('doit restaurer la valeur courante dans l\'input si la saisie est invalide (NaN)', () => {
      const minInput = elementsById.get('zoomMinInput');
      sandbox.document.activeElement = minInput;

      minInput.value = 'texte_invalide';
      minInput.dispatchEvent({ type: 'change', target: minInput });

      assert.equal(minInput.value, 350, 'Une saisie invalide doit être réinitialisée à la valeur actuelle');
    });
  });

  describe('Sélection de la raie la plus proche au survol (B4)', () => {
    it('doit attraper la raie la plus proche et non la première raie dans la tolérance (doublet du sodium Na)', () => {
      const state = sandbox.__state;
      const getHoveredLine = sandbox.__getHoveredLine;
      const getLayoutGeometry = sandbox.__getLayoutGeometry;

      // Configuration de la piste 0 avec le preset Na (D2 à 589.0 nm, D1 à 589.6 nm)
      state.tracks[0].active = true;
      state.tracks[0].mode = 'emission_lines';
      state.tracks[0].lines = [
        { lambda: 589.0, w: 1.8, intensity: 1.00, label: 'D2' },
        { lambda: 589.6, w: 1.8, intensity: 0.95, label: 'D1' }
      ];
      // Zoom global standard (400 - 800 nm)
      state.viewMinNm = 400;
      state.viewMaxNm = 800;

      const geom = getLayoutGeometry();
      const xD2 = geom.nmToX(589.0);
      const xD1 = geom.nmToX(589.6);
      const testY = geom.topMargin + 10; // Dans la bande de la piste 0

      // 1. Survol exactement sur D2 (589.0 nm) -> doit sélectionner D2 (index 0)
      const hoverD2 = getHoveredLine(xD2, testY);
      assert.ok(hoverD2, 'Doit détecter une raie en xD2');
      assert.equal(hoverD2.lineIndex, 0, 'Doit sélectionner D2 (index 0) lorsque le curseur est sur 589.0 nm');

      // 2. Survol exactement sur D1 (589.6 nm) -> doit sélectionner D1 (index 1) et non masquer D1 par D2
      const hoverD1 = getHoveredLine(xD1, testY);
      assert.ok(hoverD1, 'Doit détecter une raie en xD1');
      assert.equal(hoverD1.lineIndex, 1, 'Doit sélectionner D1 (index 1) lorsque le curseur est sur 589.6 nm');

      // 3. Survol légèrement à droite de D1 (589.8 nm) -> doit sélectionner D1 (index 1)
      const xD1Right = geom.nmToX(589.8);
      const hoverD1Right = getHoveredLine(xD1Right, testY);
      assert.ok(hoverD1Right, 'Doit détecter une raie en xD1Right');
      assert.equal(hoverD1Right.lineIndex, 1, 'Doit sélectionner D1 (index 1) lorsque le curseur est plus proche de D1');

      // 4. Survol légèrement à gauche de D2 (588.8 nm) -> doit sélectionner D2 (index 0)
      const xD2Left = geom.nmToX(588.8);
      const hoverD2Left = getHoveredLine(xD2Left, testY);
      assert.ok(hoverD2Left, 'Doit détecter une raie en xD2Left');
      assert.equal(hoverD2Left.lineIndex, 0, 'Doit sélectionner D2 (index 0) lorsque le curseur est plus proche de D2');
    });

    it('retourne null si le pointeur est en dehors de la bande ou de la tolérance', () => {
      const getHoveredLine = sandbox.__getHoveredLine;
      const getLayoutGeometry = sandbox.__getLayoutGeometry;
      const geom = getLayoutGeometry();

      // En dehors en Y (au-dessus du spectre)
      assert.equal(getHoveredLine(geom.nmToX(589.0), 0), null);
      // En dehors en X (loin de toute raie, ex: 450 nm)
      assert.equal(getHoveredLine(geom.nmToX(450.0), geom.topMargin + 10), null);
    });

    it('doit réinitialiser le curseur souris à "default" lors du pointerleave même sans raie survolée', () => {
      const canvasEl = elementsById.get('spectrumCanvas');
      assert.ok(canvasEl, 'Le canvas doit exister');
      canvasEl.style.cursor = 'grab';

      canvasEl.dispatchEvent({ type: 'pointerleave' });
      assert.equal(canvasEl.style.cursor, 'default', 'Le curseur doit revenir à "default" après pointerleave');
    });
  });

  describe('Continuité de la largeur des raies et cadre de survol (B5)', () => {
    it('getEffectiveLineWidth doit assurer la continuité autour de 5 nm sans saut brutal', () => {
      const getEffectiveLineWidth = sandbox.__getEffectiveLineWidth;
      assert.equal(typeof getEffectiveLineWidth, 'function', 'getEffectiveLineWidth doit être définie');

      // Zoom fort (span = 7 nm, zoomResolutionScale = 0.08)
      const w50 = getEffectiveLineWidth(5.0, 7);
      const w51 = getEffectiveLineWidth(5.1, 7);

      assert.ok(w50 > 2.0 && w50 < 3.0, `w50 doit être environ 2.7 nm (obtenu: ${w50})`);
      assert.ok(w51 > 2.0 && w51 < 3.0, `w51 doit être environ 2.8 nm (obtenu: ${w51})`);
      assert.ok(Math.abs(w51 - w50) < 0.2, `La différence entre 5.0 et 5.1 nm doit être continue (<0.2 nm) : ${Math.abs(w51 - w50)}`);

      // Raie fine atomique (w = 1.8 nm) : doit être amincie au maximum
      const wFine = getEffectiveLineWidth(1.8, 7);
      assert.ok(wFine < 0.2, `Une raie fine atomique doit être amincie (obtenu: ${wFine})`);

      // Bande large moléculaire (w >= 8 nm) : doit conserver sa largeur physique exacte
      const wBand = getEffectiveLineWidth(40.0, 7);
      assert.equal(wBand, 40.0, 'Une bande large doit conserver sa largeur physique exacte');
    });

    it('getEffectiveLineWidth doit être robuste aux valeurs invalides ou indéfinies', () => {
      const getEffectiveLineWidth = sandbox.__getEffectiveLineWidth;
      assert.equal(getEffectiveLineWidth(undefined, 400), 2.0);
      assert.equal(getEffectiveLineWidth(null, 400), 2.0);
      assert.equal(getEffectiveLineWidth(0, 400), 2.0);
      assert.equal(getEffectiveLineWidth(-5, 400), 2.0);
      assert.equal(getEffectiveLineWidth(NaN, 400), 2.0);
    });

    it('le code de rendu du cadre de survol et de capture doit utiliser getEffectiveLineWidth', () => {
      assert.match(mainContent, /const\s+effectiveW\s*=\s*getEffectiveLineWidth\(line\.w,\s*geom\.spanNm\);/);
      assert.match(mainContent, /const\s+boxW\s*=\s*Math\.max\(6,\s*\(effectiveW\s*\/\s*geom\.spanNm\)\s*\*\s*geom\.totalBarWidth\);/);
    });
  });

  describe('Validation des paramètres de raie (line-width, line-lambda) (Bug 7)', () => {
    it('doit recadrer ou restaurer line-width en cas de saisie invalide (change)', () => {
      const activeTrackContainer = elementsById.get('activeTrackContainer');
      const state = sandbox.__state;
      state.tracks[0].lines = [{ lambda: 500, w: 2.0, intensity: 1 }];

      const widthInput = {
        classList: { contains: (c) => c === 'line-width' },
        dataset: { track: '0', line: '0' },
        value: '-5'
      };

      const changeHandler = activeTrackContainer._listeners.change[0];
      changeHandler({ target: widthInput });

      assert.equal(state.tracks[0].lines[0].w, 2.0, 'Doit restaurer la valeur précédente si valeur négative');
      assert.equal(widthInput.value, 2.0, 'Doit réécrire la valeur valide dans l\'input');

      // Test avec valeur trop grande (> 120)
      widthInput.value = '250';
      changeHandler({ target: widthInput });
      assert.equal(state.tracks[0].lines[0].w, 120, 'Doit borner à 120 max');
      assert.equal(widthInput.value, 120);
    });
  });

  describe('Export du cadre vierge et repères d\'axe du profil (Bug 8)', () => {
    it('les repères 0 et 1 et la ligne de base doivent être tracés même lors de l\'export du cadre vierge', () => {
      assert.match(
        mainContent,
        /drawText\(["']Profil I\(λ\)["'][\s\S]*?drawLine\(bandX,\s*profY\s*\+\s*profH\s*-\s*5[\s\S]*?drawText\(["']1["'][\s\S]*?drawText\(["']0["'][\s\S]*?if\s*\(!isExportingEmptyGrid\)\s*\{\s*ctx\.beginPath/
      );
    });
  });

  describe('Conformité des classes CSS Bulma (Bug 9)', () => {
    it('doit utiliser la classe officielle Bulma is-justify-content-space-between', () => {
      assert.doesNotMatch(mainContent, /class=["'][^"']*is-justify-content-between[^"']*["']/);
      assert.match(mainContent, /class=["'][^"']*is-justify-content-space-between mt-1[^"']*["']/);
    });
  });
});
