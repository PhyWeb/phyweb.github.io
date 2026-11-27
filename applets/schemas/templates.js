// Modèles de montages préconstruits (Templates) assemblés géométriquement sur les ancres du catalogue
import { getCatalogItem } from './catalog.js';
import { getWorldAnchorById, localToWorld, normalizeAngle } from './snapping.js';

function createBuilder(title, idPrefix = 'tpl') {
    const safePrefix = String(idPrefix || 'tpl').replace(/[^a-zA-Z0-9_-]/g, '_');
    let seq = 1;
    const items = [];
    const connectors = [];
    const labels = [];

    const addItem = (type, x, y, props = {}, extra = {}) => {
        const def = getCatalogItem(type);
        if (!def) throw new Error(`Type de catalogue inconnu dans le modèle : ${type}`);
        const item = {
            id: `${safePrefix}_obj_${seq++}`,
            type,
            x: Math.round(x),
            y: Math.round(y),
            rotation: extra.rotation ?? 0,
            scale: extra.scale ?? 1,
            flipX: Boolean(extra.flipX),
            locked: Boolean(extra.locked),
            opaqueBg: Boolean(extra.opaqueBg),
            props: { ...JSON.parse(JSON.stringify(def.defaultProps || {})), ...props }
        };
        if (def.insertAtBack) items.unshift(item);
        else items.push(item);
        return item;
    };

    /**
     * Aligne une ancre de `item` exactement sur une ancre de `targetItem`,
     * avec auto-alignement angulaire face-à-face (180°) optionnel.
     */
    const snapTo = (item, myAnchorId, targetItem, targetAnchorId, { alignAngle = false } = {}) => {
        const targetA = getWorldAnchorById(targetItem, targetAnchorId);
        const def = getCatalogItem(item.type);
        const myLocal = def?.getAnchors?.(item.props || []).find(a => a.id === myAnchorId);
        if (!targetA || !myLocal) return item;

        if (alignAngle && targetA.worldAngle !== null && myLocal.angle !== undefined) {
            const effLocal = item.flipX ? -myLocal.angle : myLocal.angle;
            item.rotation = normalizeAngle(targetA.worldAngle + 180 - effLocal);
        }
        const myWorld = localToWorld(item, myLocal.x, myLocal.y);
        item.x = Math.round(item.x + (targetA.wx - myWorld.x));
        item.y = Math.round(item.y + (targetA.wy - myWorld.y));
        return item;
    };

    const connect = (kind, startRef, endRef, opts = {}) => {
        const resolve = (ref) => {
            if (ref.item && ref.anchorId) {
                const a = getWorldAnchorById(ref.item, ref.anchorId);
                if (a) return { x: Math.round(a.wx), y: Math.round(a.wy), itemId: ref.item.id, anchorId: ref.anchorId };
            }
            return { x: Math.round(ref.x ?? 0), y: Math.round(ref.y ?? 0) };
        };
        const isWire = kind === 'wire';
        const conn = {
            id: `${safePrefix}_${isWire ? 'wire' : 'hose'}_${seq++}`,
            kind,
            start: resolve(startRef),
            end: resolve(endRef),
            mode: opts.mode || 'bezier',
            bend: opts.bend ?? 0,
            bendX: opts.bendX ?? 0,
            color: opts.color || (isWire ? '#e03131' : '#74c0fc'),
            width: opts.width ?? (isWire ? 3.5 : 8),
            dashed: Boolean(opts.dashed),
            showArrow: opts.showArrow !== undefined ? Boolean(opts.showArrow) : !isWire,
            reverseArrow: Boolean(opts.reverseArrow),
            behindItems: Boolean(opts.behindItems)
        };
        connectors.push(conn);
        return conn;
    };

    const addLabel = (x, y, text, targetX = null, targetY = null, opts = {}) => {
        const lbl = {
            id: `${safePrefix}_lbl_${seq++}`,
            text,
            x: Math.round(x),
            y: Math.round(y),
            fontSize: opts.fontSize ?? 20,
            color: opts.color || '#1e293b',
            bold: Boolean(opts.bold),
            italic: Boolean(opts.italic),
            align: opts.align || 'left',
            bgEnabled: Boolean(opts.bgEnabled),
            bgColor: opts.bgColor || '#ffffff',
            borderEnabled: Boolean(opts.borderEnabled),
            showLeader: targetX !== null && targetY !== null,
            leaderStyle: opts.leaderStyle || 'elbow',
            targetX: targetX !== null ? Math.round(targetX) : Math.round(x - 60),
            targetY: targetY !== null ? Math.round(targetY) : Math.round(y + 35),
            arrowHead: opts.arrowHead !== undefined ? Boolean(opts.arrowHead) : true
        };
        labels.push(lbl);
        return lbl;
    };

    return {
        addItem,
        snapTo,
        connect,
        addLabel,
        build: () => ({ version: 1, title, items, connectors, labels })
    };
}

export const TEMPLATES = [
    {
        id: 'titrage-ph',
        name: 'Titrage pH-métrique',
        category: 'Dosage',
        description: 'Burette graduée sur potence, bécher sur agitateur magnétique, pH-mètre et sonde.',
        build(idPrefix = 'tpl_titrage-ph') {
            const b = createBuilder('Titrage pH-métrique', idPrefix);
            const Y = 460;
            b.addItem('paillasse', 100, Y, { width: 820 }, { locked: true });
            b.addItem('agitateur-magnetique', 0, Y, { stirring: true, heating: false });
            b.addItem('becher', 0, 355, { volume: '500', liquidLevel: 55, liquidColor: '#9ad1f5' });
            b.addItem('barreau-aimante', 0, 351);

            const potence = b.addItem('potence', 150, Y, { variant: 'titrage', clampSize: 'petite', clamp1Y: 480, clamp1Reach: 129, clamp2Y: 650, clamp2Reach: 129 });
            const burette = b.addItem('burette', 21, 215, { liquidLevel: 72, liquidColor: '#f78fb3', open: true });
            b.snapTo(burette, 'clamp-low', potence, 'clamp1');

            b.addItem('gouttes', 21, 215, { count: 3, spacing: 20, size: 1, color: '#f78fb3' });

            const phMetre = b.addItem('appareil-mesure', -220, Y, { mode: 'pH', display: '3.20' });
            const sonde = b.addItem('sonde', -30, 340, { variant: 'ph' });
            b.connect('wire', { item: sonde, anchorId: 'cable' }, { item: phMetre, anchorId: 'probe' }, {
                color: '#1e1e1e',
                width: 3,
                bend: -35,
                showArrow: false
            });

            b.addLabel(-139, 0, 'Solution titrante\n(burette graduée)', 10, 30, { align: 'right' });
            b.addLabel(369, 232, 'Solution titrée\n(bécher)', 49, 306, { align: 'right' });
            b.addLabel(273, 374, 'Agitateur magnétique\n+ barreau aimanté', 119, 403);
            return b.build();
        }
    },

    {
        id: 'chauffage-reflux',
        name: 'Chauffage à reflux',
        category: 'Synthèse',
        description: 'Support élévateur, chauffe-ballon, ballon, réfrigérant à boules et circulation d’eau.',
        build(idPrefix = 'tpl_chauffage-reflux') {
            const b = createBuilder('Chauffage à reflux', idPrefix);
            const Y = 520;
            b.addItem('paillasse', 100, Y, { width: 880 }, { locked: true });
            const boy = b.addItem('boy', 0, Y, { height: 95 });
            const chauffe = b.addItem('chauffe-ballon', 0, Y, { on: true, power: 7 });
            b.snapTo(chauffe, 'base', boy, 'surface');

            const ballon = b.addItem('ballon', 0, Y, { variant: 'monocol', liquidLevel: 45, liquidColor: '#f4d35e' }, { opaqueBg: true });
            b.snapTo(ballon, 'round-bottom', chauffe, 'cradle');

            const refrig = b.addItem('refrigerant', 0, Y, { variant: 'boules', hasWater: true, waterColor: '#cbe8fb' });
            b.snapTo(refrig, 'neck-bottom', ballon, 'neck-top', { alignAngle: true });

            const potence = b.addItem('potence', 120, Y, { variant: 'simple', clampSize: 'moyenne', clamp1Y: 290 });
            const ballonClamp = getWorldAnchorById(ballon, 'clamp-target');
            if (ballonClamp) potence.props.clamp1Y = Math.max(100, Math.min(520, Math.round(Y - ballonClamp.wy)));

            const robinet = b.addItem('robinet', 440, Y, { variant: 'paillasse' });
            const evier = b.addItem('evier', 340, Y);

            b.connect('hose', { item: robinet, anchorId: 'outlet' }, { item: refrig, anchorId: 'water-in' }, {
                color: '#74c0fc',
                showArrow: true,
                behindItems: true
            });
            b.connect('hose', { item: refrig, anchorId: 'water-out' }, { item: evier, anchorId: 'drain-in' }, {
                color: '#ff8787',
                showArrow: true,
                bend: 45,
                bendX: -114,
                behindItems: true
            });

            b.addLabel(-200, -49, 'Réfrigérant à boules\n(condensation des vapeurs)', -21, -10, { align: 'right' });
            b.addLabel(-214, 232, 'Mélange réactionnel\n(ballon)', -31, 317, { align: 'right' });
            b.addLabel(-216, 324, 'Chauffe-ballon', -82, 375, { align: 'right' });
            b.addLabel(-217, 397, 'Support élévateur (Boy)', -103, 432, { align: 'right' });
            b.addLabel(204, 68, 'Entrée eau froide', 47, 141);
            b.addLabel(-232, -161, 'Sortie d\'eau', -41, -117);
            return b.build();
        }
    },

    {
        id: 'distillation',
        name: 'Distillation fractionnée',
        category: 'Séparation',
        description: 'Ballon chauffé, colonne de Vigreux, tête de distillation avec thermomètre, réfrigérant droit sur potence et éprouvette.',
        build(idPrefix = 'tpl_distillation') {
            const b = createBuilder('Distillation fractionnée', idPrefix);
            const Y = 540;
            b.addItem('paillasse', 220, Y, { width: 1120 }, { locked: true });
            b.addItem('potence', 205, Y, { variant: 'face', clampSize: 'grande', rodHeight: 820, clamp1Y: 680, clamp1Angle: -75 });
            b.addItem('potence', 100, Y, { variant: 'simple', clampSize: 'moyenne', rodHeight: 560, clamp1Y: 290, clamp1Side: 'right', clamp1Reach: 180 }, { flipX: true });

            b.addItem('boy', -80, Y, { height: 85 });
            b.addItem('chauffe-ballon', -80, 455, { on: true, power: 6 });
            b.addItem('ballon', -80, 392, { variant: 'monocol', liquidLevel: 50, liquidColor: '#d98a2b' });
            b.addItem('colonne-vigreux', -80, 264);
            b.addItem('tete-distillation', -80, -118, { stopper: true });
            b.addItem('thermometre', -80, -205, { variant: 'alcool', temperature: 78 });
            b.addItem('allonge-coudee', 441, 13);

            const evier = b.addItem('evier', 600, Y, { width: 140, hasWater: true, waterColor: '#9ad1f5' }, { opaqueBg: true });
            const robinet = b.addItem('robinet', 710, Y, { variant: 'paillasse' });
            const refrig = b.addItem('refrigerant', 413, -84, { variant: 'droit', hasWater: true, waterColor: '#cbe8fb' }, { rotation: -75, flipX: true, opaqueBg: true });

            b.addItem('boy', 420, Y, { height: 185 });
            b.addItem('eprouvette', 441, 350, { volume: '100', liquidLevel: 50, liquidColor: '#9ad1f5' }, { opaqueBg: true });

            b.connect('hose', { item: robinet, anchorId: 'outlet' }, { item: refrig, anchorId: 'water-in' }, {
                color: '#74c0fc',
                bend: -16,
                bendX: -6,
                showArrow: true,
                behindItems: true
            });
            b.connect('hose', { item: refrig, anchorId: 'water-out' }, { item: evier, anchorId: 'drain-in' }, {
                color: '#ff8787',
                showArrow: true,
                behindItems: true
            });

            b.addLabel(-240, -11, 'Colonne de Vigreux', -98, 54, { align: 'right' });
            b.addLabel(-242, -311, 'Thermomètre', -88, -283, { align: 'right' });
            b.addLabel(359, -251, 'Réfrigérant droit', 237, -154);
            b.addLabel(602, 135, 'Distillat\n(éprouvette)', 465, 231);
            b.addLabel(-303, 351, 'Chauffe-ballon', -161, 416, { align: 'right' });
            b.addLabel(-305, 242, 'Mélange réactionnel', -108, 339, { align: 'right' });
            return b.build();
        }
    },

    {
        id: 'filtration-vide',
        name: 'Filtration sous vide (Büchner)',
        category: 'Séparation',
        description: 'Fiole à vide, entonnoir Büchner, robinet avec trompe à eau et tuyau d’aspiration.',
        build(idPrefix = 'tpl_filtration-vide') {
            const b = createBuilder('Filtration sous vide (Büchner)', idPrefix);
            const Y = 460;
            b.addItem('paillasse', 80, Y, { width: 760 }, { locked: true });
            const fiole = b.addItem('fiole-vide', -60, Y, { liquidLevel: 30, liquidColor: '#9ad1f5' });
            const buchner = b.addItem('entonnoir', -60, Y, { variant: 'buchner' });
            b.snapTo(buchner, 'neck-bottom', fiole, 'neck-top', { alignAngle: true });

            const robinet = b.addItem('robinet', 370, Y, { variant: 'paillasse' });
            const trompe = b.addItem('trompe-eau', 298, 433);
            b.snapTo(trompe, 'faucet-mount', robinet, 'faucet-out', { alignAngle: true });
            b.addItem('evier', 260, Y, {}, { opaqueBg: true });

            b.connect('hose', { item: fiole, anchorId: 'vacuum' }, { item: trompe, anchorId: 'vacuum' }, {
                color: '#adb5bd',
                width: 9,
                showArrow: true
            });

            b.addLabel(-250, 193, 'Entonnoir Büchner\n+ papier filtre', -108, 191, { align: 'right' });
            b.addLabel(-242, 397, 'Fiole à vide\n(filtrat)', -107, 397, { align: 'right' });
            b.addLabel(91, 210, 'Trompe à eau\n(aspiration)', 286, 286);
            return b.build();
        }
    },

    {
        id: 'pile-daniell',
        name: 'Pile Daniell (Cu / Zn)',
        category: 'Électrochimie',
        description: 'Deux demi-piles Cu²⁺/Cu et Zn²⁺/Zn reliées par un pont salin et un voltmètre.',
        build(idPrefix = 'tpl_pile-daniell') {
            const b = createBuilder('Pile Daniell (Cu / Zn)', idPrefix);
            const Y = 440;
            b.addItem('paillasse', 0, Y, { width: 760 }, { locked: true });

            b.addItem('becher', -110, Y, { volume: '500', liquidLevel: 65, liquidColor: '#cbe8fb' });
            b.addItem('becher', 110, Y, { volume: '500', liquidLevel: 65, liquidColor: '#3b9eff' });

            const elZn = b.addItem('electrode', -130, 395, { metal: 'Zn' });
            const elCu = b.addItem('electrode', 130, 395, { metal: 'Cu' });
            b.addItem('pont-salin', 0, 395, { gelColor: '#e2e8f0' }, { scale: 1.5 });

            const multi = b.addItem('multimetre', 0, 160, { selector: 'VDC', display: '1.10 V' });

            b.connect('wire', { item: elCu, anchorId: 'elec' }, { item: multi, anchorId: 'pos' }, {
                color: '#e03131',
                width: 3.5,
                bend: -35,
                showArrow: false
            });
            b.connect('wire', { item: elZn, anchorId: 'elec' }, { item: multi, anchorId: 'com' }, {
                color: '#1e1e1e',
                width: 3.5,
                bend: -35,
                showArrow: false
            });

            b.addLabel(-250, 390, 'Demi-pile Zn\n(Zn²⁺ + SO₄²⁻)', -143, 410, { align: 'right' });
            b.addLabel(250, 390, 'Demi-pile Cu\n(Cu²⁺ + SO₄²⁻)', 140, 411);
            b.addLabel(1, 319, 'Pont salin', 1, 232, { align: 'center', leaderStyle: 'straight' });
            b.addLabel(110, 120, 'Voltmètre\n(U = 1,10 V)', 45, 120);
            return b.build();
        }
    }
];

export function buildTemplateScene(templateId, idPrefix) {
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return null;
    return tpl.build(idPrefix);
}
