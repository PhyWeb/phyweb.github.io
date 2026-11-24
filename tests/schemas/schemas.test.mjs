import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { CATALOG, CATEGORIES, SVG_SHARED_STYLES, getCatalogItem } from '../../applets/schemas/catalog.js';
import {
    localToWorld,
    getWorldAnchors,
    getWorldAnchorById,
    computeObjectSnap,
    findNearestConnectorPort,
    buildConnectorPath,
    snapRotationAngle,
    normalizeAngle
} from '../../applets/schemas/snapping.js';
import { SceneStore, resolveConnectorEndpoints } from '../../applets/schemas/state.js';
import { buildStandaloneSVG, computeSceneBounds } from '../../applets/schemas/export.js';

describe('Applet Schémas — Catalogue paramétrique', () => {
    it('contient toutes les familles unifiées et des catégories valides', () => {
        assert.ok(CATALOG.length >= 40, `Attendu >= 40 familles, obtenu ${CATALOG.length}`);
        const validCats = new Set(CATEGORIES.map(c => c.id));
        const seenIds = new Set();

        for (const item of CATALOG) {
            assert.ok(item.id && !seenIds.has(item.id), `ID dupliqué ou vide: ${item.id}`);
            seenIds.add(item.id);
            assert.ok(validCats.has(item.category), `Catégorie invalide pour ${item.id}: ${item.category}`);
            assert.ok(typeof item.render === 'function', `render manquant pour ${item.id}`);
            assert.ok(typeof item.getBBox === 'function', `getBBox manquant pour ${item.id}`);

            const bbox = item.getBBox(item.defaultProps || {});
            assert.ok(bbox.width > 0 && bbox.height > 0, `BBox invalide pour ${item.id}`);

            const svg = item.render(item.defaultProps || {}, `test_${item.id}`);
            assert.ok(typeof svg === 'string' && svg.trim().length > 0, `Rendu SVG vide pour ${item.id}`);
        }
    });

    it('adapte le rendu selon les propriétés (liquide, robinet, sélecteur, hauteur Boy)', () => {
        const becher = getCatalogItem('becher');
        const svgVide = becher.render({ volume: '250', liquidLevel: 0, liquidColor: '#9ad1f5' }, 'b1');
        const svgPlein = becher.render({ volume: '250', liquidLevel: 60, liquidColor: '#b832a8' }, 'b2');
        const svg100 = becher.render({ volume: '250', liquidLevel: 100, liquidColor: '#b832a8' }, 'b3');
        assert.ok(!svgVide.includes('#b832a8'));
        assert.ok(svgPlein.includes('#b832a8'));
        assert.ok(svg100.includes('y="-98.0"'));

        for (const id of ['becher', 'erlenmeyer', 'fiole-jaugee', 'eprouvette', 'tube-essais', 'ballon', 'burette', 'pipette']) {
            const def = getCatalogItem(id);
            const lvlField = def.propSchema.find(f => f.key === 'liquidLevel');
            assert.equal(lvlField?.max, 100, `${id} devrait autoriser un remplissage à 100%`);
        }

        const multi = getCatalogItem('multimetre');
        const svgVolt = multi.render({ selector: 'VDC', display: '4.50 V' }, 'm1');
        const svgAmp = multi.render({ selector: 'ADC', display: '0.25 A' }, 'm2');
        assert.ok(svgVolt.includes('4.50 V'));
        assert.ok(svgAmp.includes('0.25 A') && svgAmp.includes('A⎓'));

        const boy = getCatalogItem('boy');
        const bbBas = boy.getBBox({ height: 70 });
        const bbHaut = boy.getBBox({ height: 160 });
        assert.ok(bbHaut.height > bbBas.height);

        // Réfrigérants (droit & boules) : remplissage complet incluant les raccords latéraux
        const refrig = getCatalogItem('refrigerant');
        const svgDroit = refrig.render({ variant: 'droit', hasWater: true, waterColor: '#9ad1f5' }, 'rd1');
        const svgBoules = refrig.render({ variant: 'boules', hasWater: true, waterColor: '#9ad1f5' }, 'rb1');
        assert.ok(svgDroit.includes('41,-88') && svgDroit.includes('-41,-350'), 'Le réfrigérant droit doit remplir ses raccords');
        assert.ok(svgBoules.includes('43,-88') && svgBoules.includes('-43,-350'), 'Le réfrigérant à boules doit remplir ses raccords');

        // Robinet (burette & ampoule à décanter) : largeur constante du corps entre ouvert et fermé
        const burette = getCatalogItem('burette');
        const svgBurClosed = burette.render({ liquidLevel: 50, liquidColor: '#9ad1f5', open: false }, 'bur1');
        const svgBurOpen = burette.render({ liquidLevel: 50, liquidColor: '#9ad1f5', open: true }, 'bur2');
        assert.ok(svgBurClosed.includes('width="32"') && svgBurOpen.includes('width="32"'), 'Le corps du robinet de la burette doit garder la même largeur');

        // Ampoule à décanter : remplissage jusqu'au robinet (-33), bouchon uniformisé (.bouchon) et robinet de largeur constante
        const amp = getCatalogItem('ampoule-decanter');
        const svgAmpClosed = amp.render({ open: false, stopper: true, phase1Level: 35, phase1Color: '#9ad1f5', phase2Level: 30, phase2Color: '#f4d35e' }, 'amp1');
        const svgAmpOpen = amp.render({ open: true, stopper: true, phase1Level: 35, phase1Color: '#9ad1f5', phase2Level: 30, phase2Color: '#f4d35e' }, 'amp2');
        assert.ok(svgAmpClosed.includes('-2.5,-33 L 2.5,-33'), 'Le clip liquide de l’ampoule à décanter doit descendre jusqu’au robinet');
        assert.ok(svgAmpClosed.includes('<polygon class="bouchon"'), 'Le bouchon de l’ampoule à décanter doit utiliser le style .bouchon');
        assert.ok(svgAmpClosed.includes('width="32"') && svgAmpOpen.includes('width="32"'), 'Le corps du robinet de l’ampoule à décanter doit garder la même largeur');

        // Ampoule de coulée : liquide arrêté au niveau du robinet (-106), clip jusqu'au col (-295), options isobare & bouchon
        const coulee = getCatalogItem('ampoule-coulee');
        const svgCoulee = coulee.render({ open: false, isobare: false, stopper: false, liquidLevel: 60, liquidColor: '#9ad1f5' }, 'coul1');
        assert.ok(svgCoulee.includes('5.5,-106 L -5.5,-106') && !svgCoulee.includes('5.5,-94'), 'Le liquide de l’ampoule de coulée doit s’arrêter au robinet (-106)');
        assert.ok(svgCoulee.includes('M -12.5,-295 L 12.5,-295'), 'Le clip de l’ampoule de coulée doit inclure l’épaulement et le col');
        assert.ok(!svgCoulee.includes('<polygon class="bouchon"') && !svgCoulee.includes('-36,-270'));

        const svgCouleeIso = coulee.render({ open: false, isobare: true, stopper: true, liquidLevel: 60, liquidColor: '#9ad1f5' }, 'coul2');
        assert.ok(svgCouleeIso.includes('<polygon class="bouchon"'), 'L’option bouchon doit afficher un bouchon .bouchon');
        assert.ok(svgCouleeIso.includes('-36,-270') && svgCouleeIso.includes('-36,-78'), 'L’option isobare doit dessiner le tube d’équilibrage latéral');
        const bbIso = coulee.getBBox({ isobare: true, stopper: true });
        assert.ok(bbIso.x === -38 && bbIso.y === -319);

        // Paillasse : plateau décalé sous y=0 pour que les objets posés ne s'enfoncent pas dedans
        const paillasse = getCatalogItem('paillasse');
        const svgPlateau = paillasse.render({ width: 760, style: 'plateau', color: '#e2e8f0' }, 'p1');
        assert.ok(svgPlateau.includes('y="3"'), 'Le plateau de paillasse doit commencer à y=3 sous le plan d’aimantation y=0');

        // Évier présent dans le catalogue (Supports & Paillasse), encastré à niveau (y >= 0) avec ancre base (y=0) et tuyau
        const evier = getCatalogItem('evier');
        assert.ok(evier && evier.category === 'supports');
        const evierBB = evier.getBBox(evier.defaultProps);
        assert.equal(evierBB.y, 0, 'L’évier doit être encastré sous le niveau de la paillasse (y >= 0)');
        const evierAnchors = evier.getAnchors(evier.defaultProps);
        assert.ok(evierAnchors.some(a => a.type === 'base' && a.y === 0) && evierAnchors.some(a => a.type === 'hose'));

        // Support à entonnoir en bois (1 ou 2 anneaux) avec ancre base et anneaux clamp
        const supEnt = getCatalogItem('support-entonnoir');
        assert.ok(supEnt && supEnt.category === 'supports');
        assert.equal(supEnt.getAnchors({ variant: 'double', armY: 250 }).filter(a => a.type === 'clamp').length, 2);
        assert.equal(supEnt.getAnchors({ variant: 'simple', armY: 250 }).filter(a => a.type === 'clamp').length, 1);

        // pH-mètre / Conductimètre : titre lisible, écran agrandi et valeur par défaut avec unité pour le conductimètre
        const mesure = getCatalogItem('appareil-mesure');
        const svgPh = mesure.render({ mode: 'pH', display: '7.00' }, 'mes1');
        const svgCond = mesure.render({ mode: 'σ' }, 'mes2');
        assert.ok(svgPh.includes('pH-mètre') && svgPh.includes('font-size:26px'));
        assert.ok(svgCond.includes('Conductimètre') && svgCond.includes('125 µS/cm') && svgCond.includes('font-size:21px'));

        // Balance & Générateur : texte agrandi, version AC et gros signes + / − en DC
        const balance = getCatalogItem('balance');
        const svgBal = balance.render({ display: '12.50 g' }, 'bal1');
        assert.ok(svgBal.includes('font-size:24px'));

        const gen = getCatalogItem('generateur');
        const svgGenDC = gen.render({ currentType: 'DC', selector: '6V', display: '6.0 V', on: true }, 'g1');
        const svgGenAC = gen.render({ currentType: 'AC', selector: '6V', display: '6.0 V', on: true }, 'g2');
        assert.ok(svgGenDC.includes('GÉNÉRATEUR DC') && svgGenDC.includes('font-size:22px') && svgGenDC.includes('font-size:20px'));
        assert.ok(svgGenAC.includes('GÉNÉRATEUR AC') && svgGenAC.includes('>~</text>'));
    });

    it('maintient la surface du liquide horizontale par contre-rotation quand un récipient est incliné', () => {
        const tube = getCatalogItem('tube-essais');
        const svgIncline = tube.render({ liquidLevel: 50, liquidColor: '#9ad1f5', stopper: 'none' }, 't1', { rotation: 35, flipX: false });
        assert.ok(svgIncline.includes('rotate(-35.00, 0,'));

        const svgInclineFlip = tube.render({ liquidLevel: 50, liquidColor: '#9ad1f5', stopper: 'none' }, 't2', { rotation: 35, flipX: true });
        assert.ok(svgInclineFlip.includes('rotate(35.00, 0,'));
    });

    it('gère un niveau cohérent à l’horizontale (90°) et tête en bas (180°) selon ouvert/bouché', () => {
        const extractRectY = (svg) => {
            const m = svg.match(/<rect x="-800" y="([-\d.]+)"/);
            return m ? Number(m[1]) : null;
        };

        // Tube bouché à 90° : 90% doit être plus haut (y plus petit) que 10%
        const tube = getCatalogItem('tube-essais');
        const y90Low = extractRectY(tube.render({ liquidLevel: 10, liquidColor: '#9ad1f5', stopper: 'solid' }, 't90a', { rotation: 90, flipX: false }));
        const y90High = extractRectY(tube.render({ liquidLevel: 90, liquidColor: '#9ad1f5', stopper: 'solid' }, 't90b', { rotation: 90, flipX: false }));
        assert.ok(y90Low !== null && y90High !== null && y90High < y90Low, `Attendu y90High (${y90High}) < y90Low (${y90Low})`);

        // Tube bouché à 180° (retourné) : le niveau ne doit plus s'inverser (80% plus haut que 20%)
        const y180Low = extractRectY(tube.render({ liquidLevel: 20, liquidColor: '#9ad1f5', stopper: 'solid' }, 't180a', { rotation: 180, flipX: false }));
        const y180High = extractRectY(tube.render({ liquidLevel: 80, liquidColor: '#9ad1f5', stopper: 'solid' }, 't180b', { rotation: 180, flipX: false }));
        assert.ok(y180Low !== null && y180High !== null && y180High < y180Low, `Attendu y180High (${y180High}) < y180Low (${y180Low})`);

        // Bécher ouvert retourné à 180° : se vide complètement
        const becher = getCatalogItem('becher');
        const svgBecher180 = becher.render({ volume: '250', liquidLevel: 80, liquidColor: '#b832a8' }, 'b180', { rotation: 180, flipX: false });
        assert.ok(!svgBecher180.includes('#b832a8'), 'Un bécher ouvert à 180° doit être vide');

        // Option "À ras bord (dépl. d'eau)" : remplit intégralement même retourné à 180° et retient le liquide partiel
        const eprouvette = getCatalogItem('eprouvette');
        const svgEp180Full = eprouvette.render({ volume: '100', liquidLevel: 100, fillToRim: true, liquidColor: '#9ad1f5' }, 'ep1', { rotation: 180, flipX: false });
        assert.ok(svgEp180Full.includes('y="-800"'), 'À ras bord + 100% doit remplir tout le clipPath');
        const svgEp180Part = eprouvette.render({ volume: '100', liquidLevel: 60, fillToRim: true, liquidColor: '#9ad1f5' }, 'ep2', { rotation: 180, flipX: false });
        assert.ok(svgEp180Part.includes('#9ad1f5'), 'En mode déplacement d’eau à 180°, le liquide partiel doit rester retenu');

        // Fond de verrerie transparent et liquides en fusion darken (traits/électrodes intacts, pas d'assombrissement en superposition)
        assert.ok(SVG_SHARED_STYLES.includes('.verre-fond { fill: transparent;'));
        assert.ok(svgEp180Full.includes('mix-blend-mode: darken'));
        assert.ok(svgEp180Part.includes('mix-blend-mode: darken'));

        // Erlenmeyer ouvert à 90° : le liquide reste piégé dans la panse sous le col
        const erlen = getCatalogItem('erlenmeyer');
        const svgErlen90 = erlen.render({ volume: '250', liquidLevel: 50, liquidColor: '#b832a8' }, 'e90', { rotation: 90, flipX: false });
        assert.ok(svgErlen90.includes('#b832a8'), 'Un erlenmeyer à 90° doit conserver du liquide dans sa panse');

        // Ampoule à décanter bouchée vs ouverte à 180°
        const amp = getCatalogItem('ampoule-decanter');
        const svgAmpClosed = amp.render({ open: false, stopper: true, phase1Level: 35, phase1Color: '#9ad1f5', phase2Level: 30, phase2Color: '#f4d35e' }, 'a1', { rotation: 180, flipX: false });
        const svgAmpOpen = amp.render({ open: false, stopper: false, phase1Level: 35, phase1Color: '#9ad1f5', phase2Level: 30, phase2Color: '#f4d35e' }, 'a2', { rotation: 180, flipX: false });
        assert.ok(svgAmpClosed.includes('#9ad1f5') && svgAmpClosed.includes('#f4d35e'));
        assert.ok(!svgAmpOpen.includes('#9ad1f5') && !svgAmpOpen.includes('#f4d35e'));
    });

    it('expose la catégorie Effets (écoulement, gouttes, bulles, vapeur, précipité)', () => {
        assert.ok(CATEGORIES.some(c => c.id === 'effets'));
        for (const id of ['ecoulement', 'gouttes', 'bulles', 'vapeur', 'precipite']) {
            const def = getCatalogItem(id);
            assert.ok(def && def.category === 'effets', `Effet manquant ou mauvaise catégorie: ${id}`);
            const bb = def.getBBox(def.defaultProps);
            assert.ok(bb.width > 0 && bb.height > 0);
            const svg = def.render(def.defaultProps, `eff_${id}`);
            assert.ok(svg.trim().length > 0);
        }
    });
});

describe('Applet Schémas — Aimantation cohérente & emboîtements hors angle droit', () => {
    it('aimante la base d’un bécher sur le plateau d’un agitateur magnétique', () => {
        const agitateur = { id: 'ag1', type: 'agitateur-magnetique', x: 200, y: 400, rotation: 0, scale: 1, flipX: false, props: {} };
        const becher = { id: 'b1', type: 'becher', x: 0, y: 0, rotation: 0, scale: 1, flipX: false, props: { volume: '250' } };
        const snap = computeObjectSnap(becher, 206, 305, [agitateur, becher]);
        assert.equal(snap.x, 200);
        assert.equal(snap.y, 295);
        assert.ok(snap.snappedPort !== null);
    });

    it('aimante un ballon fond rond dans la cuve d’un chauffe-ballon', () => {
        const chauffe = { id: 'cb1', type: 'chauffe-ballon', x: 300, y: 500, rotation: 0, scale: 1, flipX: false, props: {} };
        const ballon = { id: 'bal1', type: 'ballon', x: 0, y: 0, rotation: 0, scale: 1, flipX: false, props: { variant: 'monocol' } };
        const snap = computeObjectSnap(ballon, 305, 445, [chauffe, ballon]);
        assert.equal(snap.x, 300);
        assert.equal(snap.y, 437);
        assert.ok(snap.snappedPort !== null);
    });

    it('emboîte un réfrigérant sur le col central d’un ballon (reflux vertical à 0°)', () => {
        const ballon = { id: 'bal1', type: 'ballon', x: 300, y: 437, rotation: 0, scale: 1, flipX: false, props: { variant: 'monocol' } };
        const refrig = { id: 'ref1', type: 'refrigerant', x: 0, y: 0, rotation: 10, scale: 1, flipX: false, props: { variant: 'boules' } };
        // Col ballon à y = 437 - 142 = 295 ; neck-bottom réfrigérant à y_local = -14 => item.y = 309
        const snap = computeObjectSnap(refrig, 304, 312, [ballon, refrig], { baseRotation: 10 });
        assert.equal(snap.rotation, 0);
        assert.ok(Math.abs(snap.x - 300) < 0.01);
        assert.ok(Math.abs(snap.y - 309) < 0.01);
    });

    it('auto-incline un réfrigérant droit à -75° sur une tête de distillation puis emboîte l’allonge coudée à 0°', () => {
        const tete = { id: 't1', type: 'tete-distillation', x: 300, y: 300, rotation: 0, scale: 1, flipX: false, props: { stopper: true } };
        const sideArm = getWorldAnchorById(tete, 'side-arm');
        assert.ok(sideArm);

        // Approcher un réfrigérant vertical (0°) de sorte que son haut (neck-top à y=-416) soit proche de side-arm
        const refrig = { id: 'r1', type: 'refrigerant', x: 0, y: 0, rotation: 0, scale: 1, flipX: false, props: { variant: 'droit' } };
        const snapRef = computeObjectSnap(refrig, sideArm.wx + 4, sideArm.wy + 416 + 5, [tete, refrig], { baseRotation: 0 });
        assert.equal(snapRef.rotation, -75);

        // Vérifier que neck-top du réfrigérant coïncide exactement avec side-arm après rotation
        const placedRefrig = { ...refrig, x: snapRef.x, y: snapRef.y, rotation: snapRef.rotation };
        const refTop = getWorldAnchorById(placedRefrig, 'neck-top');
        assert.ok(Math.hypot(refTop.wx - sideArm.wx, refTop.wy - sideArm.wy) < 0.05);

        // Maintenant emboîter une allonge coudée sur le bas du réfrigérant incliné à -75°
        const refBottom = getWorldAnchorById(placedRefrig, 'neck-bottom');
        const allonge = { id: 'a1', type: 'allonge-coudee', x: 0, y: 0, rotation: 12, scale: 1, flipX: false, props: {} };
        const allongeInletLocal = getCatalogItem('allonge-coudee').getAnchors()[0];
        const approxX = refBottom.wx - allongeInletLocal.x + 3;
        const approxY = refBottom.wy - allongeInletLocal.y - 4;

        const snapAllonge = computeObjectSnap(allonge, approxX, approxY, [tete, placedRefrig, allonge], { baseRotation: 12 });
        assert.equal(snapAllonge.rotation, 0);

        const placedAllonge = { ...allonge, x: snapAllonge.x, y: snapAllonge.y, rotation: snapAllonge.rotation };
        const placedInlet = getWorldAnchorById(placedAllonge, 'inlet');
        assert.ok(Math.hypot(placedInlet.wx - refBottom.wx, placedInlet.wy - refBottom.wy) < 0.05);
    });

    it('gère le retournement flipX d’une tête de distillation (réfrigérant incliné à +75°)', () => {
        const teteFlip = { id: 'tf', type: 'tete-distillation', x: 400, y: 300, rotation: 0, scale: 1, flipX: true, props: { stopper: true } };
        const sideArm = getWorldAnchorById(teteFlip, 'side-arm');
        const refrig = { id: 'r2', type: 'refrigerant', x: 0, y: 0, rotation: 0, scale: 1, flipX: false, props: { variant: 'droit' } };

        const snapRef = computeObjectSnap(refrig, sideArm.wx, sideArm.wy + 416, [teteFlip, refrig], { baseRotation: 0 });
        assert.equal(snapRef.rotation, 75);
    });

    it('auto-incline un bouchon ou une ampoule de coulée à ±45° sur les cols latéraux d’un ballon tricol', () => {
        const ballon = { id: 'b3', type: 'ballon', x: 300, y: 400, rotation: 0, scale: 1, flipX: false, props: { variant: 'tricol' } };
        const colDroit = getWorldAnchorById(ballon, 'neck-right');
        const colGauche = getWorldAnchorById(ballon, 'neck-left');

        const bouchon = { id: 'bc1', type: 'bouchon', x: 0, y: 0, rotation: 0, scale: 1, flipX: false, props: { variant: 'conique' } };
        const snapDroit = computeObjectSnap(bouchon, colDroit.wx + 2, colDroit.wy + 12, [ballon, bouchon], { baseRotation: 0 });
        assert.equal(snapDroit.rotation, 45);

        const snapGauche = computeObjectSnap(bouchon, colGauche.wx - 2, colGauche.wy + 12, [ballon, bouchon], { baseRotation: 0 });
        assert.equal(snapGauche.rotation, -45);

        const ampoule = { id: 'ac1', type: 'ampoule-coulee', x: 0, y: 0, rotation: 0, scale: 1, flipX: false, props: {} };
        const snapAmp = computeObjectSnap(ampoule, colDroit.wx, colDroit.wy + 58, [ballon, ampoule], { baseRotation: 0 });
        assert.equal(snapAmp.rotation, 45);
    });

    it('aligne une pince en bois sur un tube à essais incliné sans pivoter une potence fixe', () => {
        const tube = { id: 'tb1', type: 'tube-essais', x: 250, y: 400, rotation: 30, scale: 1, flipX: false, props: {} };
        const clampTarget = getWorldAnchorById(tube, 'clamp-target');

        const pince = { id: 'p1', type: 'pince-bois', x: 0, y: 0, rotation: 0, scale: 1, flipX: false, props: {} };
        const snapPince = computeObjectSnap(pince, clampTarget.wx + 69, clampTarget.wy, [tube, pince], { baseRotation: 0 });
        assert.equal(snapPince.rotation, 30);

        // Une potence (fixedUpright) ne doit PAS pivoter à 30°
        const potence = { id: 'pot1', type: 'potence', x: 0, y: 0, rotation: 0, scale: 1, flipX: false, props: { variant: 'simple', clamp1Y: 360 } };
        const snapPot = computeObjectSnap(potence, clampTarget.wx + 120, clampTarget.wy + 360, [tube, potence], { baseRotation: 0 });
        assert.equal(snapPot.rotation, 0);
    });

    it('aimante la poignée de rotation sur les angles remarquables (0°, ±45°, ±75°, ±90°, etc.)', () => {
        assert.deepEqual(snapRotationAngle(-73, true), { angle: -75, snapped: true });
        assert.deepEqual(snapRotationAngle(43.2, true), { angle: 45, snapped: true });
        assert.deepEqual(snapRotationAngle(22.4, true), { angle: 22, snapped: false });
        assert.deepEqual(snapRotationAngle(-73, false), { angle: -73, snapped: false });
        assert.equal(normalizeAngle(285), -75);
    });

    it('trouve les bornes électriques et olivettes de tuyaux', () => {
        const gen = { id: 'g1', type: 'generateur', x: 100, y: 300, rotation: 0, scale: 1, flipX: false, props: {} };
        const ref = { id: 'r1', type: 'refrigerant', x: 400, y: 500, rotation: 0, scale: 1, flipX: false, props: {} };

        const elecPort = findNearestConnectorPort(68, 270, [gen, ref], 'elec');
        assert.ok(elecPort && elecPort.itemId === 'g1' && elecPort.id === 'pos');

        const hosePort = findNearestConnectorPort(440, 418, [gen, ref], 'hose');
        assert.ok(hosePort && hosePort.itemId === 'r1' && hosePort.id === 'water-in');
    });

    it('génère un tracé Bézier et orthogonal valide', () => {
        const p1 = { x: 10, y: 20 };
        const p2 = { x: 150, y: 100 };
        assert.ok(buildConnectorPath(p1, p2, 'bezier', 40).includes('C '));
        assert.ok(buildConnectorPath(p1, p2, 'orthogonal', 0).includes('L '));
    });

    it('oriente les tangentes des tuyaux exactement dans l’axe des olivettes et du robinet', () => {
        // Réfrigérant incliné à -75° relié à un robinet d'eau vertical (sortie à 180° vers le bas)
        const ref = { id: 'r1', type: 'refrigerant', x: 300, y: 400, rotation: -75, scale: 1, flipX: false, props: { variant: 'droit' } };
        const rob = { id: 'rob1', type: 'robinet', x: 550, y: 500, rotation: 0, scale: 1, flipX: false, props: { variant: 'paillasse' } };
        const aIn = getWorldAnchorById(ref, 'water-in');
        const aOut = getWorldAnchorById(rob, 'outlet');

        assert.equal(aIn.worldAngle, 15);
        assert.equal(aOut.worldAngle, 180);

        const p1 = { x: aIn.wx, y: aIn.wy, angle: aIn.worldAngle };
        const p2 = { x: aOut.wx, y: aOut.wy, angle: aOut.worldAngle };

        // Courbe naturelle (bend = 0) : 1er point de contrôle doit partir exactement dans la direction 15° (sin 15°, -cos 15°)
        const dAuto = buildConnectorPath(p1, p2, 'bezier', 0, 0);
        const match = dAuto.match(/^M\s+([-\d.]+),([-\d.]+)\s+C\s+([-\d.]+),([-\d.]+)\s+([-\d.]+),([-\d.]+)/);
        assert.ok(match, `Format SVG inattendu: ${dAuto}`);
        const c1x = Number(match[3]) - p1.x;
        const c1y = Number(match[4]) - p1.y;
        const c1Len = Math.hypot(c1x, c1y);
        assert.ok(Math.abs(c1x / c1Len - Math.sin((15 * Math.PI) / 180)) < 0.02);
        assert.ok(Math.abs(c1y / c1Len - (-Math.cos((15 * Math.PI) / 180))) < 0.02);

        // 2e point de contrôle arrive verticalement par le bas (angle 180° => dx = 0, dy > 0)
        const c2x = Number(match[5]) - p2.x;
        const c2y = Number(match[6]) - p2.y;
        assert.ok(Math.abs(c2x) < 0.2 && c2y > 20);

        // Avec courbure manuelle (bend = 60, bendX = -20) : 2 segments C¹ conservant les mêmes tangentes de sortie
        const dCustom = buildConnectorPath(p1, p2, 'bezier', 60, -20);
        assert.equal((dCustom.match(/C /g) || []).length, 2);
    });

    it('aimante la base des objets sur toute la largeur d’une paillasse et clipse la trompe à eau sur le robinet', () => {
        const table = { id: 'tab1', type: 'paillasse', x: 300, y: 500, rotation: 0, scale: 1, flipX: false, props: { width: 800, style: 'plateau' } };
        const becher = { id: 'b1', type: 'becher', x: 0, y: 0, rotation: 0, scale: 1, flipX: false, props: { volume: '250' } };

        // Posé loin du centre de la table (x = 520, dans [300-400, 300+400] = [-100, 700]), proche de y = 500
        const snapTable = computeObjectSnap(becher, 523, 488, [table, becher]);
        assert.equal(snapTable.y, 500);
        assert.ok(snapTable.snappedPort !== null);

        // En dehors de la largeur de la table (x = 800 > 700), ne s'aimante pas à la table
        const snapOutside = computeObjectSnap(becher, 800, 488, [table, becher]);
        assert.equal(snapOutside.snappedPort, null);

        // Clipse une trompe à eau directement sous le bec du robinet
        const rob = { id: 'rob1', type: 'robinet', x: 600, y: 500, rotation: 0, scale: 1, flipX: false, props: { variant: 'paillasse' } };
        const bec = getWorldAnchorById(rob, 'faucet-out');
        const trompe = { id: 'tr1', type: 'trompe-eau', x: 0, y: 0, rotation: 0, scale: 1, flipX: false, props: {} };
        const snapTrompe = computeObjectSnap(trompe, bec.wx + 3, bec.wy + 145 + 4, [rob, trompe]);
        assert.equal(snapTrompe.x, bec.wx);
        assert.equal(snapTrompe.y, bec.wy + 145);
        assert.equal(snapTrompe.rotation, 0);

        // Aimante et retourne automatiquement (180°) un tube à essais pile dans l'axe d'une électrode de l'électrolyseur
        const elec = { id: 'el1', type: 'electrolyseur', x: 300, y: 500, rotation: 0, scale: 1, flipX: false, props: {} };
        const tube = { id: 'tb_el', type: 'tube-essais', x: 0, y: 0, rotation: 180, scale: 1, flipX: false, props: {} };
        // Électrode gauche à (280, 410) ; ouverture du tube retourné à y_local = +176 => item.y = 410 - 176 = 234
        const snapTube = computeObjectSnap(tube, 284, 238, [elec, tube], { baseRotation: 180 });
        assert.equal(snapTube.x, 280);
        assert.equal(snapTube.y, 234);
        assert.equal(snapTube.rotation, 180);
    });

    it('gère flipX et rotation dans localToWorld', () => {
        const item = { id: 'x', type: 'becher', x: 100, y: 200, rotation: 90, scale: 1, flipX: false, props: {} };
        const w = localToWorld(item, 0, -50);
        assert.ok(Math.abs(w.x - 150) < 0.01);
        assert.ok(Math.abs(w.y - 200) < 0.01);

        const flipped = { ...item, rotation: 0, flipX: true };
        const wf = localToWorld(flipped, 20, 0);
        assert.equal(wf.x, 80);
        assert.equal(wf.y, 200);
    });
});

describe('Applet Schémas — État, connecteurs dynamiques, Undo/Redo et Export', () => {
    it('suit dynamiquement les objets attachés aux fils et supporte Undo/Redo + JSON', () => {
        const store = new SceneStore();
        const gen = store.addItem('generateur', 100, 300);
        const multi = store.addItem('multimetre', 350, 300);
        const genPos = getWorldAnchors(gen).find(a => a.id === 'pos');
        const multiPos = getWorldAnchors(multi).find(a => a.id === 'pos');

        const wire = store.addConnector(
            'wire',
            { x: genPos.wx, y: genPos.wy, itemId: gen.id, anchorId: 'pos' },
            { x: multiPos.wx, y: multiPos.wy, itemId: multi.id, anchorId: 'pos' }
        );

        gen.x = 180;
        gen.y = 250;
        const ep = resolveConnectorEndpoints(wire, store.scene.items);
        assert.equal(ep.p1.x, 180 - 34);
        assert.equal(ep.p1.y, 250 - 32);

        const lbl = store.addLabel(200, 120, 'Générateur 6V', 180, 200);
        assert.equal(store.scene.labels.length, 1);

        const svg = buildStandaloneSVG(store.scene);
        assert.ok(svg.startsWith('<?xml'));
        assert.ok(svg.includes('Générateur 6V'));
        const bounds = computeSceneBounds(store.scene);
        assert.ok(bounds.width > 100 && bounds.height > 100);

        const json = store.exportJSON();
        const store2 = new SceneStore();
        store2.importJSON(json);
        assert.equal(store2.scene.items.length, 2);
        assert.equal(store2.scene.connectors.length, 1);
        assert.equal(store2.scene.labels.length, 1);

        assert.ok(store.undo());
        assert.equal(store.scene.labels.length, 0);
        assert.ok(store.redo());
        assert.equal(store.scene.labels.length, 1);

        store.selection = { kind: 'label', id: lbl.id };
        assert.ok(store.deleteSelected());
        assert.equal(store.scene.labels.length, 0);
    });

    it('gère la sélection multiple (toggle, selectAll, duplication avec connecteurs internes, suppression groupée)', () => {
        const store = new SceneStore();
        const gen = store.addItem('generateur', 100, 300);
        const multi = store.addItem('multimetre', 350, 300);
        const genPos = getWorldAnchors(gen).find(a => a.id === 'pos');
        const multiPos = getWorldAnchors(multi).find(a => a.id === 'pos');
        const wire = store.addConnector(
            'wire',
            { x: genPos.wx, y: genPos.wy, itemId: gen.id, anchorId: 'pos' },
            { x: multiPos.wx, y: multiPos.wy, itemId: multi.id, anchorId: 'pos' }
        );
        const lbl = store.addLabel(200, 120, 'Montage', 180, 200);

        // selectAll sélectionne les 4 éléments
        store.selectAll();
        assert.equal(store.selected.length, 4);
        assert.ok(store.isSelected('item', gen.id) && store.isSelected('connector', wire.id));

        // toggleSelection retire la légende
        store.toggleSelection('label', lbl.id);
        assert.equal(store.selected.length, 3);
        assert.ok(!store.isSelected('label', lbl.id));

        // Duplication groupée : les 2 objets + le fil sont dupliqués et le fil copié reste relié aux nouveaux objets
        const copies = store.duplicateSelected();
        assert.equal(Array.isArray(copies) && copies.length, 3);
        assert.equal(store.scene.items.length, 4);
        assert.equal(store.scene.connectors.length, 2);
        const copiedWire = store.scene.connectors[1];
        assert.notEqual(copiedWire.start.itemId, gen.id);
        assert.notEqual(copiedWire.end.itemId, multi.id);
        assert.ok(store.scene.items.some(i => i.id === copiedWire.start.itemId));
        assert.ok(store.scene.items.some(i => i.id === copiedWire.end.itemId));

        // Suppression groupée des copies sélectionnées
        assert.ok(store.deleteSelected());
        assert.equal(store.scene.items.length, 2);
        assert.equal(store.scene.connectors.length, 1);
        assert.equal(store.selected.length, 0);
    });
});
