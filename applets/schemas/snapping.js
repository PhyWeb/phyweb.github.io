// Moteur de transformations géométriques, aimantation positionnelle/angulaire et tracé naturel des connecteurs
import { getCatalogItem } from './catalog.js';

// Paires de types d'ancres compatibles entre un objet déplacé et un objet fixe
const COMPATIBLE_ANCHOR_PAIRS = new Map([
    ['base', ['surface']],
    ['surface', ['base']],
    ['neck-bottom', ['neck-top']],
    ['neck-top', ['neck-bottom']],
    ['clamp-target', ['clamp']],
    ['clamp', ['clamp-target']],
    ['round-bottom', ['cradle']],
    ['cradle', ['round-bottom']],
    ['probe-tip', ['hole']],
    ['hole', ['probe-tip']],
    ['faucet-in', ['faucet-out']],
    ['faucet-out', ['faucet-in']]
]);

// Types d'ancres qui déclenchent un auto-alignement angulaire face-à-face (180°)
const AXIAL_ALIGN_TYPES = new Set([
    'neck-bottom',
    'neck-top',
    'probe-tip',
    'hole',
    'clamp',
    'clamp-target',
    'faucet-in',
    'faucet-out'
]);

// Angles remarquables en chimie & physique pour la poignée de rotation
export const SNAP_ROTATION_ANGLES = [
    -180, -165, -150, -135, -120, -105, -90, -75, -60, -45, -30, -15,
    0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180
];

/**
 * Ramène un angle dans l'intervalle ]-180, 180].
 */
export function normalizeAngle(deg) {
    let a = ((Number(deg) || 0) % 360 + 360) % 360;
    if (a > 180) a -= 360;
    return Math.abs(a) < 1e-9 ? 0 : Math.round(a * 100) / 100;
}

/**
 * Convertit un angle (0° = haut, sens horaire) en vecteur unitaire SVG.
 */
export function angleToUnitVector(angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: Math.sin(rad), y: -Math.cos(rad) };
}

/**
 * Aimante un angle brut sur les angles remarquables (0°, ±15°, ±30°, ±45°, ±75°, ±90°, ±105°, 180°).
 */
export function snapRotationAngle(rawAngle, snapEnabled = true, threshold = 5) {
    const norm = normalizeAngle(rawAngle);
    if (!snapEnabled) {
        return { angle: Math.round(norm), snapped: false };
    }
    let best = null;
    let bestDiff = threshold;
    for (const target of SNAP_ROTATION_ANGLES) {
        const diff = Math.abs(normalizeAngle(norm - target));
        if (diff <= bestDiff) {
            bestDiff = diff;
            best = target;
        }
    }
    if (best !== null) {
        return { angle: best === -180 ? 180 : best, snapped: true };
    }
    return { angle: Math.round(norm), snapped: false };
}

/**
 * Transforme un point local (lx, ly) d'un objet vers les coordonnées scène (wx, wy).
 */
export function localToWorld(item, lx, ly) {
    const scale = item.scale ?? 1;
    const fx = item.flipX ? -1 : 1;
    const rad = ((item.rotation ?? 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const sx = lx * scale * fx;
    const sy = ly * scale;

    return {
        x: item.x + sx * cos - sy * sin,
        y: item.y + sx * sin + sy * cos
    };
}

/**
 * Retourne l'angle sortant monde (en degrés, 0° = haut, sens horaire) d'une ancre.
 */
export function getAnchorWorldAngle(item, anchor) {
    const localAngle = anchor.angle ?? defaultAngleForDir(anchor.dir);
    if (localAngle === null || localAngle === undefined) return null;
    const flipped = item.flipX ? -localAngle : localAngle;
    return normalizeAngle(flipped + (item.rotation ?? 0));
}

function defaultAngleForDir(dir) {
    switch (dir) {
        case 'up': return 0;
        case 'up-right': return 45;
        case 'right': return 90;
        case 'down-right': return 135;
        case 'down': return 180;
        case 'down-left': return -135;
        case 'left': return -90;
        case 'up-left': return -45;
        default: return null;
    }
}

/**
 * Retourne tous les points d'ancrage d'un objet en coordonnées scène (avec angle monde).
 */
export function getWorldAnchors(item) {
    const def = getCatalogItem(item.type);
    if (!def || !def.getAnchors) return [];
    const localAnchors = def.getAnchors(item.props || {});
    return localAnchors.map(a => {
        const w = localToWorld(item, a.x, a.y);
        const out = {
            ...a,
            itemId: item.id,
            wx: w.x,
            wy: w.y,
            worldAngle: getAnchorWorldAngle(item, a)
        };
        if (a.type === 'surface-line' && a.x1 !== undefined && a.x2 !== undefined) {
            const pA = localToWorld(item, a.x1, a.y);
            const pB = localToWorld(item, a.x2, a.y);
            out.wx1 = pA.x;
            out.wy1 = pA.y;
            out.wx2 = pB.x;
            out.wy2 = pB.y;
        }
        return out;
    });
}

/**
 * Retourne la position monde d'une ancre précise d'un objet.
 */
export function getWorldAnchorById(item, anchorId) {
    const anchors = getWorldAnchors(item);
    return anchors.find(a => a.id === anchorId) || null;
}

/**
 * Calcule la position ET la rotation aimantées d'un objet déplacé vers (targetX, targetY).
 * Priorité :
 * 1. Aimantation port-à-port ponctuel compatible (avec auto-alignement angulaire)
 * 2. Aimantation d'une base sur une surface étendue (ex: dessus de paillasse / table)
 * 3. Guides d'alignement horizontal/vertical sur les origines/bases des objets voisins
 * 4. Grille (si activée)
 */
export function computeObjectSnap(movingItem, targetX, targetY, allItems, options = {}) {
    const {
        snapEnabled = true,
        gridSize = 10,
        snapToGrid = true,
        portRadius = 28,
        alignRadius = 8,
        baseRotation = movingItem.rotation ?? 0
    } = options;

    if (!snapEnabled) {
        return { x: targetX, y: targetY, rotation: baseRotation, guides: [], snappedPort: null };
    }

    const movingDef = getCatalogItem(movingItem.type);
    const canAutoRotate = !movingDef?.fixedUpright;
    const probeItem = { ...movingItem, x: targetX, y: targetY, rotation: baseRotation };
    const movingAnchors = getWorldAnchors(probeItem);
    const others = allItems.filter(it => it.id !== movingItem.id);

    // 1. Aimantation port-à-port ponctuel cohérente (avec auto-alignement angulaire si applicable)
    let bestPort = null;
    let bestDist = portRadius;

    for (const other of others) {
        const otherAnchors = getWorldAnchors(other);
        for (const ma of movingAnchors) {
            const allowed = COMPATIBLE_ANCHOR_PAIRS.get(ma.type);
            if (!allowed) continue;
            for (const oa of otherAnchors) {
                if (!allowed.includes(oa.type)) continue;
                const dist = Math.hypot(oa.wx - ma.wx, oa.wy - ma.wy);
                if (dist < bestDist) {
                    bestDist = dist;

                    let finalRot = baseRotation;
                    const maLocalAngle = ma.angle ?? defaultAngleForDir(ma.dir);
                    const shouldAlign =
                        canAutoRotate &&
                        ma.autoAlign !== false &&
                        oa.autoAlign !== false &&
                        AXIAL_ALIGN_TYPES.has(ma.type) &&
                        maLocalAngle !== null &&
                        oa.worldAngle !== null;

                    if (shouldAlign) {
                        const maEffectiveLocal = movingItem.flipX ? -maLocalAngle : maLocalAngle;
                        finalRot = normalizeAngle(oa.worldAngle + 180 - maEffectiveLocal);
                    }

                    const rotatedProbe = { ...movingItem, x: targetX, y: targetY, rotation: finalRot };
                    const maRotatedWorld = localToWorld(rotatedProbe, ma.x, ma.y);
                    const dx = oa.wx - maRotatedWorld.x;
                    const dy = oa.wy - maRotatedWorld.y;

                    bestPort = {
                        x: targetX + dx,
                        y: targetY + dy,
                        rotation: finalRot,
                        portX: oa.wx,
                        portY: oa.wy,
                        alignedAngle: shouldAlign ? finalRot : null,
                        label: `${ma.label} ⇄ ${oa.label}`
                    };
                }
            }
        }
    }

    if (bestPort) {
        return {
            x: bestPort.x,
            y: bestPort.y,
            rotation: bestPort.rotation,
            guides: [],
            snappedPort: {
                x: bestPort.portX,
                y: bestPort.portY,
                label: bestPort.label,
                alignedAngle: bestPort.alignedAngle
            }
        };
    }

    // 2. Aimantation d'une base sur une surface étendue (ex: paillasse / table)
    let surfaceSnapY = null;
    let bestSurfaceDist = portRadius;
    let surfacePortVisual = null;
    const baseAnchor = movingAnchors.find(a => a.type === 'base');
    if (baseAnchor) {
        for (const other of others) {
            const otherAnchors = getWorldAnchors(other);
            for (const oa of otherAnchors) {
                if (oa.type !== 'surface-line' || oa.wx1 === undefined) continue;
                const abx = oa.wx2 - oa.wx1;
                const aby = oa.wy2 - oa.wy1;
                const lenSq = abx * abx + aby * aby;
                if (lenSq < 1) continue;
                const t = ((baseAnchor.wx - oa.wx1) * abx + (baseAnchor.wy - oa.wy1) * aby) / lenSq;
                if (t < 0 || t > 1) continue;
                const projX = oa.wx1 + t * abx;
                const projY = oa.wy1 + t * aby;
                const dist = Math.hypot(projX - baseAnchor.wx, projY - baseAnchor.wy);
                if (dist < bestSurfaceDist) {
                    bestSurfaceDist = dist;
                    surfaceSnapY = targetY + (projY - baseAnchor.wy);
                    surfacePortVisual = { x: projX, y: projY, label: `Base ⇄ ${oa.label}`, alignedAngle: null };
                }
            }
        }
    }

    // 3. Alignement intelligent (axes X et Y des origines/bases des objets voisins)
    let x = targetX;
    let y = surfaceSnapY !== null ? surfaceSnapY : targetY;
    let bestDx = alignRadius;
    let bestDy = alignRadius;
    let guideX = null;
    let guideY = null;

    for (const other of others) {
        // Ignorer la paillasse pour l'alignement X central si on pose dessus
        const otherDef = getCatalogItem(other.type);
        if (!otherDef?.insertAtBack) {
            const dx = other.x - targetX;
            if (Math.abs(dx) < Math.abs(bestDx)) {
                bestDx = dx;
                guideX = { type: 'v', x: other.x, y1: Math.min(other.y, y) - 60, y2: Math.max(other.y, y) + 60 };
            }
        }
        if (surfaceSnapY === null) {
            const dy = other.y - targetY;
            if (Math.abs(dy) < Math.abs(bestDy)) {
                bestDy = dy;
                guideY = { type: 'h', y: other.y, x1: Math.min(other.x, targetX) - 60, x2: Math.max(other.x, targetX) + 60 };
            }
        }
    }

    const guides = [];
    if (guideX) {
        x = targetX + bestDx;
        guides.push(guideX);
    } else if (snapToGrid && gridSize > 0) {
        x = Math.round(targetX / gridSize) * gridSize;
    }

    if (surfaceSnapY === null) {
        if (guideY) {
            y = targetY + bestDy;
            guides.push(guideY);
        } else if (snapToGrid && gridSize > 0) {
            y = Math.round(targetY / gridSize) * gridSize;
        }
    } else if (surfacePortVisual) {
        // Mettre à jour X du halo sur la table
        surfacePortVisual.x = x + (baseAnchor.wx - targetX);
    }

    return { x, y, rotation: baseRotation, guides, snappedPort: surfacePortVisual };
}

/**
 * Trouve le port d'accroche (elec ou hose) le plus proche d'un point (wx, wy)
 * pour le tracé de fils électriques ou de tuyaux de chimie.
 */
export function findNearestConnectorPort(wx, wy, allItems, portType, radius = 26) {
    let best = null;
    let bestDist = radius;
    for (const item of allItems) {
        const anchors = getWorldAnchors(item);
        for (const a of anchors) {
            if (a.type !== portType) continue;
            const d = Math.hypot(a.wx - wx, a.wy - wy);
            if (d < bestDist) {
                bestDist = d;
                best = a;
            }
        }
    }
    return best;
}

/**
 * Calcule la géométrie complète d'un connecteur (tracé SVG `d` + point milieu/angle)
 * en respectant les tangentes sortantes exactes (`p1.angle`, `p2.angle`) des bornes et olivettes.
 */
export function computeConnectorGeometry(p1, p2, mode = 'bezier', bend = 0, bendX = 0) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy);

    const hasA1 = p1.angle !== null && p1.angle !== undefined;
    const hasA2 = p2.angle !== null && p2.angle !== undefined;
    const t1 = hasA1 ? angleToUnitVector(p1.angle) : null;
    const t2 = hasA2 ? angleToUnitVector(p2.angle) : null;

    if (mode === 'orthogonal') {
        const stub = 24;
        const s1 = t1 ? { x: p1.x + t1.x * stub, y: p1.y + t1.y * stub } : { x: p1.x, y: p1.y };
        const s2 = t2 ? { x: p2.x + t2.x * stub, y: p2.y + t2.y * stub } : { x: p2.x, y: p2.y };
        const offsetX = bendX || bend * 0.5;
        const midX = (s1.x + s2.x) / 2 + offsetX;
        const midY = (s1.y + s2.y) / 2;

        const pts = [p1];
        if (t1) pts.push(s1);
        pts.push({ x: midX, y: s1.y });
        pts.push({ x: midX, y: s2.y });
        if (t2) pts.push(s2);
        pts.push(p2);

        const d = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
        const angle = (s2.y - s1.y) >= 0 ? 90 : -90;
        return { d, mid: { x: midX, y: midY, angle } };
    }

    // Mode courbe souple (Bézier)
    if (dist < 1) {
        return {
            d: `M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} L ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`,
            mid: { x: p1.x, y: p1.y, angle: 0 }
        };
    }

    // Si au moins une extrémité est branchée sur un port orienté, on garantit une sortie tangente exacte
    if (t1 || t2) {
        const baseLen = Math.max(38, Math.min(130, dist * 0.42));

        let u1 = t1;
        let u2 = t2;
        if (!u1) {
            const target = { x: p2.x + u2.x * baseLen, y: p2.y + u2.y * baseLen };
            const vx = target.x - p1.x, vy = target.y - p1.y;
            const vl = Math.hypot(vx, vy) || 1;
            u1 = { x: vx / vl, y: vy / vl };
        }
        if (!u2) {
            const target = { x: p1.x + u1.x * baseLen, y: p1.y + u1.y * baseLen };
            const vx = target.x - p2.x, vy = target.y - p2.y;
            const vl = Math.hypot(vx, vy) || 1;
            u2 = { x: vx / vl, y: vy / vl };
        }

        const c1Base = { x: p1.x + u1.x * baseLen, y: p1.y + u1.y * baseLen };
        const c2Base = { x: p2.x + u2.x * baseLen, y: p2.y + u2.y * baseLen };

        // Milieu naturel de la courbe cubique (t = 0.5)
        const m0x = 0.125 * p1.x + 0.375 * c1Base.x + 0.375 * c2Base.x + 0.125 * p2.x;
        const m0y = 0.125 * p1.y + 0.375 * c1Base.y + 0.375 * c2Base.y + 0.125 * p2.y;

        if (Math.abs(bend) < 0.5 && Math.abs(bendX) < 0.5) {
            const tx = 0.75 * (c1Base.x - p1.x) + 1.5 * (c2Base.x - c1Base.x) + 0.75 * (p2.x - c2Base.x);
            const ty = 0.75 * (c1Base.y - p1.y) + 1.5 * (c2Base.y - c1Base.y) + 0.75 * (p2.y - c2Base.y);
            const d = `M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} C ${c1Base.x.toFixed(1)},${c1Base.y.toFixed(1)} ${c2Base.x.toFixed(1)},${c2Base.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
            return { d, mid: { x: m0x, y: m0y, angle: (Math.atan2(ty, tx) * 180) / Math.PI } };
        }

        // Courbe 2 segments C¹ passant exactement par M = M0 + (bendX, bend) tout en restant strictement tangente à u1 et u2
        const mx = m0x + bendX;
        const my = m0y + bend;
        const d1 = Math.hypot(mx - p1.x, my - p1.y);
        const d2 = Math.hypot(p2.x - mx, p2.y - my);
        const l1 = Math.max(26, Math.min(115, d1 * 0.45));
        const l2 = Math.max(26, Math.min(115, d2 * 0.45));

        const c1 = { x: p1.x + u1.x * l1, y: p1.y + u1.y * l1 };
        const c2 = { x: p2.x + u2.x * l2, y: p2.y + u2.y * l2 };

        const chordX = c2.x - c1.x;
        const chordY = c2.y - c1.y;
        const chordLen = Math.hypot(chordX, chordY) || 1;
        const ux = chordX / chordLen;
        const uy = chordY / chordLen;

        const lm1 = Math.max(14, Math.min(90, d1 * 0.34));
        const lm2 = Math.max(14, Math.min(90, d2 * 0.34));
        const m1 = { x: mx - ux * lm1, y: my - uy * lm1 };
        const m2 = { x: mx + ux * lm2, y: my + uy * lm2 };

        const d = `M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} C ${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${m1.x.toFixed(1)},${m1.y.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)} C ${m2.x.toFixed(1)},${m2.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
        return { d, mid: { x: mx, y: my, angle: (Math.atan2(uy, ux) * 180) / Math.PI } };
    }

    // Extrémités 100% libres (non attachées) : Bézier souple classique
    const cx1 = p1.x + dx * 0.25 + bendX * 0.7;
    const cy1 = p1.y + dy * 0.1 + bend;
    const cx2 = p1.x + dx * 0.75 + bendX * 0.7;
    const cy2 = p2.y - dy * 0.1 + bend;
    const d = `M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} C ${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;

    const x = 0.125 * p1.x + 0.375 * cx1 + 0.375 * cx2 + 0.125 * p2.x;
    const y = 0.125 * p1.y + 0.375 * cy1 + 0.375 * cy2 + 0.125 * p2.y;
    const tx = 0.75 * (cx1 - p1.x) + 1.5 * (cx2 - cx1) + 0.75 * (p2.x - cx2);
    const ty = 0.75 * (cy1 - p1.y) + 1.5 * (cy2 - cy1) + 0.75 * (p2.y - cy2);
    return { d, mid: { x, y, angle: (Math.atan2(ty, tx) * 180) / Math.PI } };
}

/**
 * Calcule le tracé SVG (attribut `d`) d'un connecteur (fil électrique ou tuyau).
 */
export function buildConnectorPath(p1, p2, mode = 'bezier', bend = 0, bendX = 0) {
    return computeConnectorGeometry(p1, p2, mode, bend, bendX).d;
}

/**
 * Calcule le point milieu et l'angle tangent d'un connecteur pour afficher une flèche de sens.
 */
export function getConnectorMidpoint(p1, p2, mode = 'bezier', bend = 0, bendX = 0) {
    return computeConnectorGeometry(p1, p2, mode, bend, bendX).mid;
}
