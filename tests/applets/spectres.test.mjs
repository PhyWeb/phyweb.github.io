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

  // Extraction du code JS du script principal (dernier bloc <script> non-module)
  const scripts = [...htmlContent.matchAll(/<script(?![^>]*type=['"]module['"])[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length >= 2, 'Les scripts inline de spectres doivent exister');
  const jsCode = scripts[scripts.length - 1][1] + '; globalThis.__PRESETS_DB = PRESETS_DB; globalThis.__state = state;';

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

    it('Mode réaliste : le cache du maximum de Planck ne change pas les résultats (alternance de températures)', () => {
      const { getThermalMultiplier } = sandbox;
      const first3000 = getThermalMultiplier(600, 3000, false, 7);
      const first9000 = getThermalMultiplier(600, 9000, false, 7);
      // Alternance de températures : le cache doit rester cohérent
      assert.equal(getThermalMultiplier(600, 3000, false, 7), first3000);
      assert.equal(getThermalMultiplier(600, 9000, false, 7), first9000);
      assert.notEqual(first3000, first9000);
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
      assert.match(htmlContent, /state\.tracks\[tIdx\]\.name\s*=\s*getPresetShortName\(item\)/);
    });

    it('getPresetShortName retire la partie entre parenthèses du libellé', () => {
      const { getPresetShortName } = sandbox;
      assert.equal(getPresetShortName({ label: 'Soleil (5800 K)' }), 'Soleil');
      assert.equal(getPresetShortName({ label: 'Hydrogène' }), 'Hydrogène');
    });

    it('le changement de preset ne doit pas écraser un nom personnalisé', () => {
      assert.match(htmlContent, /const\s+isAutoName\s*=/);
      assert.match(htmlContent, /if\s*\(isAutoName\)\s*\{\s*state\.tracks\[tIdx\]\.name/);
    });
  });

  describe('Intégrité de l\'axe et du zoom à fort grossissement', () => {
    it('doit prévoir un pas fin (majorStep=0.5, minorStep=0.1) quand spanNm <= 4', () => {
      assert.match(htmlContent, /geom\.spanNm\s*<=\s*4\)\s*\{\s*majorStep\s*=\s*0\.5;\s*minorStep\s*=\s*0\.1;/);
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

    it('doit couvrir tout le spectre visible pour une vue globale (400 - 750 nm)', () => {
      const grad = sandbox.getSpectrumGradient(400, 750);
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
      assert.match(htmlContent, /fill\.style\.background\s*=\s*getSpectrumGradient\(vMin,\s*vMax\)/);
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
      assert.match(htmlContent, /\.dual-range-fill\s*\{[^}]*pointer-events:\s*none;/);
      assert.match(htmlContent, /\.dual-range-fill\s*\{[^}]*will-change:\s*left,\s*width;/);
      assert.match(htmlContent, /\.dual-range-track\s*\{[^}]*pointer-events:\s*none;/);
    });

    it('doit découpler le rafraîchissement continu via scheduleRender / requestAnimationFrame', () => {
      assert.match(htmlContent, /function\s+scheduleRender\s*\(\)/);
      assert.match(htmlContent, /renderAnimFrameId\s*=\s*requestFrame/);
    });

    it('updateCanvasDimensions ne doit réallouer canvas.width/height que si les dimensions ont changé', () => {
      assert.match(htmlContent, /if\s*\(\s*canvas\.width\s*!==\s*targetW\s*\)\s*canvas\.width\s*=\s*targetW;/);
      assert.match(htmlContent, /if\s*\(\s*canvas\.height\s*!==\s*targetH\s*\)\s*canvas\.height\s*=\s*targetH;/);
    });

    it('doit éviter les reflows forcés (getBoundingClientRect) pendant le glissement des curseurs', () => {
      assert.match(htmlContent, /isDraggingZoomSlider\s*=\s*true/);
      assert.match(htmlContent, /if\s*\(\s*isDraggingZoomSlider\s*\)\s*return;/);
    });
  });

  describe('Gestion de la molette et zoom au pavé tactile (wheel)', () => {
    it('le code source ne doit pas appeler preventDefault avant de vérifier que le curseur est dans la bande', () => {
      const wheelCodeMatch = htmlContent.match(/canvas\.addEventListener\(['"]wheel['"],\s*\(e\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\{\s*passive:\s*false\s*\}\);/);
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
      assert.match(htmlContent, /Math\.pow\(\s*1\.22\s*,\s*clampedDy\s*\/\s*100\s*\)/);
      assert.match(htmlContent, /e\.deltaMode\s*===\s*1/);
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

    it('doit réécrire la valeur corrigée (800) dans zoomMaxInput même si le champ a le focus', () => {
      const maxInput = elementsById.get('zoomMaxInput');
      const state = sandbox.__state;
      sandbox.document.activeElement = maxInput;

      maxInput.value = '999';
      maxInput.dispatchEvent({ type: 'change', target: maxInput });

      assert.equal(state.viewMaxNm, 800);
      assert.equal(maxInput.value, 800, 'Le champ maxInput doit afficher 800 et non 999 après validation');
    });

    it('doit restaurer la valeur courante dans l\'input si la saisie est invalide (NaN)', () => {
      const minInput = elementsById.get('zoomMinInput');
      sandbox.document.activeElement = minInput;

      minInput.value = 'texte_invalide';
      minInput.dispatchEvent({ type: 'change', target: minInput });

      assert.equal(minInput.value, 350, 'Une saisie invalide doit être réinitialisée à la valeur actuelle');
    });
  });
});
