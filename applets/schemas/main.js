// Contrôleur principal de l'applet Schémas de Chimie & Physique
import { initApplets, showToast } from '../../common/common.js';
import { SVG_SHARED_STYLES, getCatalogItem } from './catalog.js';
import {
    getWorldAnchors,
    buildConnectorPath,
    getConnectorMidpoint,
    computeConnectorGeometry,
    computeDistributionDeltas,
    localToWorld,
    normalizeAngle
} from './snapping.js';
import { SceneStore, resolveConnectorEndpoints } from './state.js';
import {
    renderConnectorSVG,
    renderLabelSVG,
    getLabelMetrics,
    computeSceneBounds
} from './export.js';
import { createIOController } from './modules/io.js';
import { createDrawerController } from './modules/drawer.js';
import { createInspectorController } from './modules/inspector.js';
import { createInteractionsController } from './modules/interactions.js';
import { createExportModalController } from './modules/exportModal.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function escHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const notify = (msg) => {
    if (typeof showToast === 'function') showToast(msg);
    else console.log(msg);
};

// =========================================================================
// ÉTAT DU STORE & DE L'ÉDITEUR
// =========================================================================
const store = new SceneStore();

const editor = {
    tool: 'select',          // 'select' | 'wire' | 'hose' | 'label'
    snapEnabled: true,
    showGrid: true,
    gridSize: 10,
    transparentExport: false,
    zoom: 1,
    panX: 0,
    panY: 0,
    activeCategory: 'all',
    searchQuery: '',
    // Interactions en cours
    drag: null,              // { kind, ... }
    pendingConnector: null,  // { kind, start, cursorX, cursorY, hoveredPort }
    activeGuides: [],
    snappedPort: null,
    rotateFeedback: null,    // { x, y, angle, snapped }
    scaleFeedback: null,     // { x, y, pct }
    spaceDown: false,
    connectorDefaults: {
        wire: { mode: 'bezier', color: '#e03131', width: 3.5, dashed: false, showArrow: false, behindItems: false },
        hose: { mode: 'bezier', color: '#74c0fc', width: 8, dashed: false, showArrow: true, behindItems: false }
    }
};

// Références DOM
const dom = {
    stageEl: document.getElementById('stageContainer'),
    svgEl: document.getElementById('sceneSvg'),
    viewportGroup: document.getElementById('viewportGroup'),
    gridRect: document.getElementById('gridRect'),
    layerConnectorsBack: document.getElementById('layerConnectorsBack'),
    layerItems: document.getElementById('layerItems'),
    layerConnectors: document.getElementById('layerConnectors'),
    layerLabels: document.getElementById('layerLabels'),
    layerOverlay: document.getElementById('layerOverlay'),
    toolHintEl: document.getElementById('toolHint'),
    zoomBadgeEl: document.getElementById('zoomBadge'),
    inspectorTitleEl: document.getElementById('inspectorTitle'),
    inspectorBodyEl: document.getElementById('inspectorBody'),
    drawerEl: document.getElementById('objectDrawer'),
    drawerTabsEl: document.getElementById('drawerTabs'),
    drawerGridEl: document.getElementById('drawerGrid'),
    drawerSearchEl: document.getElementById('drawerSearchInput'),
    btnUndo: document.getElementById('btnUndo'),
    btnRedo: document.getElementById('btnRedo'),
    btnToggleSnap: document.getElementById('btnToggleSnap'),
    btnToggleGrid: document.getElementById('btnToggleGrid')
};

const {
    stageEl,
    svgEl,
    viewportGroup,
    gridRect,
    layerConnectorsBack,
    layerItems,
    layerConnectors,
    layerLabels,
    layerOverlay,
    toolHintEl,
    zoomBadgeEl,
    btnUndo,
    btnRedo,
    btnToggleSnap,
    btnToggleGrid
} = dom;

// Injecter les styles SVG partagés dans le SVG principal et pour les miniatures du drawer (source unique : catalog.js)
const styleEl = document.createElementNS(SVG_NS, 'style');
styleEl.textContent = SVG_SHARED_STYLES;
svgEl.insertBefore(styleEl, svgEl.firstChild);

if (!document.getElementById('schemas-drawer-svg-styles')) {
    const thumbStyleEl = document.createElement('style');
    thumbStyleEl.id = 'schemas-drawer-svg-styles';
    thumbStyleEl.textContent = SVG_SHARED_STYLES.replace(/(^|\n)\s*(\.[\w-]+)/g, '$1.drawer-card-thumb $2');
    document.head.appendChild(thumbStyleEl);
}

// =========================================================================
// COORDONNÉES & VIEWPORT
// =========================================================================
function clientToScene(clientX, clientY) {
    const rect = svgEl.getBoundingClientRect();
    return {
        x: (clientX - rect.left - editor.panX) / editor.zoom,
        y: (clientY - rect.top - editor.panY) / editor.zoom
    };
}

function getViewportCenterScene() {
    const rect = svgEl.getBoundingClientRect();
    return {
        x: (rect.width / 2 - editor.panX) / editor.zoom,
        y: (rect.height / 2 - editor.panY) / editor.zoom
    };
}

function applyViewportTransform() {
    viewportGroup.setAttribute('transform', `translate(${editor.panX.toFixed(1)}, ${editor.panY.toFixed(1)}) scale(${editor.zoom.toFixed(4)})`);
    gridRect.style.display = editor.showGrid ? 'block' : 'none';
    zoomBadgeEl.textContent = `${Math.round(editor.zoom * 100)}%`;
}

function centerInitialView() {
    const rect = svgEl.getBoundingClientRect();
    editor.zoom = 1;
    editor.panX = rect.width / 2;
    editor.panY = rect.height * 0.65;
    applyViewportTransform();
}

function zoomAt(factor, clientX, clientY) {
    const rect = svgEl.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const newZoom = Math.max(0.25, Math.min(3.5, editor.zoom * factor));
    const ratio = newZoom / editor.zoom;
    editor.panX = mx - (mx - editor.panX) * ratio;
    editor.panY = my - (my - editor.panY) * ratio;
    editor.zoom = newZoom;
    applyViewportTransform();
}

function fitViewToScene() {
    const rect = svgEl.getBoundingClientRect();
    if (!io.hasSceneData()) {
        centerInitialView();
        return;
    }
    const b = computeSceneBounds(store.scene, 60);
    const scaleX = rect.width / Math.max(1, b.width);
    const scaleY = rect.height / Math.max(1, b.height);
    editor.zoom = Math.max(0.3, Math.min(1.8, Math.min(scaleX, scaleY)));
    editor.panX = rect.width / 2 - (b.x + b.width / 2) * editor.zoom;
    editor.panY = rect.height / 2 - (b.y + b.height / 2) * editor.zoom;
    applyViewportTransform();
}

// =========================================================================
// BOÎTES ENGLOBANTES & UTILITAIRES GÉOMÉTRIQUES
// =========================================================================
function getElementWorldBounds(kind, el) {
    if (kind === 'item') {
        const def = getCatalogItem(el.type);
        if (!def) return null;
        const bb = def.getBBox(el.props || {});
        const corners = [
            localToWorld(el, bb.x, bb.y),
            localToWorld(el, bb.x + bb.width, bb.y),
            localToWorld(el, bb.x, bb.y + bb.height),
            localToWorld(el, bb.x + bb.width, bb.y + bb.height)
        ];
        return {
            minX: Math.min(...corners.map(c => c.x)),
            minY: Math.min(...corners.map(c => c.y)),
            maxX: Math.max(...corners.map(c => c.x)),
            maxY: Math.max(...corners.map(c => c.y))
        };
    }
    if (kind === 'connector') {
        const { p1, p2 } = resolveConnectorEndpoints(el, store.scene.items);
        const { bounds } = computeConnectorGeometry(p1, p2, el.mode, el.bend, el.bendX || 0);
        return {
            minX: bounds.minX - 6,
            minY: bounds.minY - 6,
            maxX: bounds.maxX + 6,
            maxY: bounds.maxY + 6
        };
    }
    if (kind === 'label') {
        const m = getLabelMetrics(el);
        let minX = m.boxX - 4;
        let minY = m.boxY - 4;
        let maxX = m.boxX + m.boxW + 4;
        let maxY = m.boxY + m.boxH + 4;
        if (el.showLeader) {
            minX = Math.min(minX, el.targetX);
            minY = Math.min(minY, el.targetY);
            maxX = Math.max(maxX, el.targetX);
            maxY = Math.max(maxY, el.targetY);
        }
        return { minX, minY, maxX, maxY };
    }
    return null;
}

function rectsIntersect(a, b) {
    return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

function findElementsInRect(x1, y1, x2, y2) {
    const rect = {
        minX: Math.min(x1, x2),
        minY: Math.min(y1, y2),
        maxX: Math.max(x1, x2),
        maxY: Math.max(y1, y2)
    };
    const found = [];
    for (const item of store.scene.items) {
        if (item.locked) continue;
        const b = getElementWorldBounds('item', item);
        if (b && rectsIntersect(rect, b)) found.push({ kind: 'item', id: item.id });
    }
    for (const conn of store.scene.connectors) {
        if (conn.locked) continue;
        const b = getElementWorldBounds('connector', conn);
        if (b && rectsIntersect(rect, b)) found.push({ kind: 'connector', id: conn.id });
    }
    for (const lbl of store.scene.labels) {
        if (lbl.locked) continue;
        const b = getElementWorldBounds('label', lbl);
        if (b && rectsIntersect(rect, b)) found.push({ kind: 'label', id: lbl.id });
    }
    return found;
}

function alignSelectedElements(mode) {
    const entries = store.getSelectedElements().filter(e => !e.el.locked && (e.kind === 'item' || e.kind === 'label'));
    if (entries.length < 2) return;
    const withBounds = entries
        .map(e => ({ ...e, b: getElementWorldBounds(e.kind, e.el) }))
        .filter(e => e.b);
    if (withBounds.length < 2) return;

    store.pushHistory();
    const minX = Math.min(...withBounds.map(e => e.b.minX));
    const maxX = Math.max(...withBounds.map(e => e.b.maxX));
    const minY = Math.min(...withBounds.map(e => e.b.minY));
    const maxY = Math.max(...withBounds.map(e => e.b.maxY));
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    for (const { kind, el, b } of withBounds) {
        let dx = 0, dy = 0;
        if (mode === 'left') dx = minX - b.minX;
        else if (mode === 'centerX') dx = midX - (b.minX + b.maxX) / 2;
        else if (mode === 'right') dx = maxX - b.maxX;
        else if (mode === 'top') dy = minY - b.minY;
        else if (mode === 'centerY') dy = midY - (b.minY + b.maxY) / 2;
        else if (mode === 'bottom') dy = maxY - b.maxY;

        el.x = Math.round(el.x + dx);
        el.y = Math.round(el.y + dy);
        if (kind === 'label') {
            el.targetX = Math.round(el.targetX + dx);
            el.targetY = Math.round(el.targetY + dy);
        }
    }
    renderScene();
}

function distributeSelectedElements(axis) {
    const entries = store.getSelectedElements().filter(e => !e.el.locked && (e.kind === 'item' || e.kind === 'label'));
    if (entries.length < 3) return;
    const withBounds = entries
        .map(e => ({ ...e, b: getElementWorldBounds(e.kind, e.el) }))
        .filter(e => e.b);
    if (withBounds.length < 3) return;

    const deltas = computeDistributionDeltas(withBounds, axis);
    if (deltas.size === 0) return;

    store.pushHistory();
    for (const { id, kind, el } of withBounds) {
        const d = deltas.get(id);
        if (!d) continue;
        el.x = Math.round(el.x + d.dx);
        el.y = Math.round(el.y + d.dy);
        if (kind === 'label') {
            el.targetX = Math.round(el.targetX + d.dx);
            el.targetY = Math.round(el.targetY + d.dy);
        }
    }
    renderScene();
}

function rotateItemBy(item, deltaDeg) {
    if (!item || item.locked) return;
    const def = getCatalogItem(item.type);
    if (!def) return;
    const bb = def.getBBox(item.props || {});
    const cx = bb.x + bb.width / 2;
    const cy = bb.y + bb.height / 2;
    const pivot = localToWorld(item, cx, cy);
    store.pushHistory();
    item.rotation = deltaDeg === 0 ? 0 : normalizeAngle((item.rotation || 0) + deltaDeg);
    const newCenter = localToWorld(item, cx, cy);
    item.x = Math.round(item.x + (pivot.x - newCenter.x));
    item.y = Math.round(item.y + (pivot.y - newCenter.y));
    renderScene();
    inspector.renderInspector();
}

// =========================================================================
// RENDU DE LA SCÈNE & OVERLAY
// =========================================================================
function updateHistoryButtons() {
    btnUndo.disabled = !store.canUndo();
    btnRedo.disabled = !store.canRedo();
}

function renderScene() {
    layerItems.innerHTML = store.scene.items.map(item => {
        const def = getCatalogItem(item.type);
        if (!def) return '';
        const scale = item.scale ?? 1;
        const fx = item.flipX ? -scale : scale;
        const transform = `translate(${item.x}, ${item.y}) rotate(${item.rotation ?? 0}) scale(${fx}, ${scale})`;
        return `<g class="scene-item${item.locked ? ' is-locked' : ''}" data-kind="item" data-id="${item.id}" transform="${transform}">${def.render(item.props || {}, item.id, { rotation: item.rotation ?? 0, flipX: !!item.flipX })}</g>`;
    }).join('');

    const renderConnectorGroup = (conn) => {
        const { p1, p2 } = resolveConnectorEndpoints(conn, store.scene.items);
        const d = buildConnectorPath(p1, p2, conn.mode, conn.bend, conn.bendX || 0);
        const hitStroke = `<path d="${d}" fill="none" stroke="transparent" stroke-width="18" />`;
        return `<g class="scene-connector${conn.locked ? ' is-locked' : ''}" data-kind="connector" data-id="${conn.id}">${hitStroke}${renderConnectorSVG(conn, store.scene.items)}</g>`;
    };

    if (layerConnectorsBack) {
        layerConnectorsBack.innerHTML = store.scene.connectors
            .filter(conn => conn.behindItems)
            .map(renderConnectorGroup)
            .join('');
    }
    layerConnectors.innerHTML = store.scene.connectors
        .filter(conn => !conn.behindItems)
        .map(renderConnectorGroup)
        .join('');

    layerLabels.innerHTML = store.scene.labels.map(lbl => {
        return `<g class="scene-label${lbl.locked ? ' is-locked' : ''}" data-kind="label" data-id="${lbl.id}">${renderLabelSVG(lbl)}</g>`;
    }).join('');

    renderOverlay();
    updateHistoryButtons();
    io.updateDocumentStatus();
    io.persistSession();
}

function renderOverlay() {
    let html = '';

    if (editor.tool === 'wire' || editor.tool === 'hose') {
        const targetType = editor.tool === 'wire' ? 'elec' : 'hose';
        const isHose = targetType === 'hose';
        for (const item of store.scene.items) {
            for (const a of getWorldAnchors(item)) {
                if (a.type !== targetType) continue;
                const hot = editor.pendingConnector?.hoveredPort &&
                    editor.pendingConnector.hoveredPort.itemId === a.itemId &&
                    editor.pendingConnector.hoveredPort.id === a.id;
                html += `<circle class="port-indicator ${isHose ? 'is-hose' : ''} ${hot ? 'is-hot' : ''}" cx="${a.wx.toFixed(1)}" cy="${a.wy.toFixed(1)}" r="${hot ? 9 : 6}" />`;
            }
        }
    }

    if (editor.pendingConnector) {
        const pc = editor.pendingConnector;
        const defs = editor.connectorDefaults[pc.kind] || {};
        const mode = defs.mode || 'bezier';
        const p1 = { x: pc.start.x, y: pc.start.y, angle: pc.startAngle ?? null };
        const p2 = pc.hoveredPort
            ? { x: pc.hoveredPort.wx, y: pc.hoveredPort.wy, angle: pc.hoveredPort.worldAngle ?? null }
            : { x: pc.cursorX, y: pc.cursorY, angle: null };
        const defaultBend = mode === 'straight' ? 0 : ((p1.angle !== null || p2.angle !== null) ? 0 : (pc.kind === 'wire' ? 40 : 30));
        const d = buildConnectorPath(p1, p2, mode, defaultBend, 0);
        const col = defs.color || (pc.kind === 'wire' ? '#e03131' : '#0284c7');
        const sw = Number(defs.width) || (pc.kind === 'wire' ? 3.5 : 6);
        html += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-dasharray="6 4" opacity="0.82" pointer-events="none" />`;
        html += `<circle cx="${p1.x.toFixed(1)}" cy="${p1.y.toFixed(1)}" r="5" fill="${col}" pointer-events="none" />`;
    }

    const selectedEntries = store.getSelectedElements();
    if (selectedEntries.length === 1) {
        const { kind, el } = selectedEntries[0];
        const isLocked = Boolean(el.locked);
        if (kind === 'item') {
            const def = getCatalogItem(el.type);
            if (def) {
                const bb = def.getBBox(el.props || {});
                const pad = 6;
                const scale = el.scale ?? 1;
                const fx = el.flipX ? -scale : scale;
                const transform = `translate(${el.x}, ${el.y}) rotate(${el.rotation ?? 0}) scale(${fx}, ${scale})`;
                const cx = bb.x + bb.width / 2;
                const topY = bb.y - pad;
                const stemLen = 26 / (scale * editor.zoom);
                const handleY = topY - stemLen;
                const r = 7 / (scale * editor.zoom);
                const rIcon = 3.2 / (scale * editor.zoom);
                const sw = 1.6 / (scale * editor.zoom);
                const hs = 8.5 / (scale * editor.zoom);
                const hHalf = hs / 2;
                const bx1 = bb.x - pad;
                const by1 = topY;
                const bx2 = bb.x + bb.width + pad;
                const by2 = bb.y + bb.height + pad;
                if (isLocked) {
                    const b = getElementWorldBounds('item', el);
                    const s = 1 / editor.zoom;
                    html += `<g transform="${transform}">
                        <rect class="selection-box is-locked" x="${bx1}" y="${by1}" width="${bb.width + pad * 2}" height="${bb.height + pad * 2}" rx="4" style="stroke-width:${sw.toFixed(2)}" />
                    </g>`;
                    if (b) {
                        html += `<g transform="translate(${(b.maxX + 4 * s).toFixed(1)}, ${(b.minY - 8 * s).toFixed(1)}) scale(${s.toFixed(3)})">
                            <rect class="lock-badge-bg" x="-28" y="-10" width="56" height="18" rx="9" />
                            <text class="lock-badge-text" x="0" y="3">Verrouillé</text>
                        </g>`;
                    }
                } else {
                    html += `<g transform="${transform}">
                        <rect class="selection-box" x="${bx1}" y="${by1}" width="${bb.width + pad * 2}" height="${bb.height + pad * 2}" rx="4" style="stroke-width:${sw.toFixed(2)}" />
                        <line class="rotate-stem" x1="${cx.toFixed(1)}" y1="${by1.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(handleY + r).toFixed(1)}" style="stroke-width:${sw.toFixed(2)}" />
                        <circle class="rotate-handle" data-handle="item-rotate" cx="${cx.toFixed(1)}" cy="${handleY.toFixed(1)}" r="${r.toFixed(2)}" style="stroke-width:${sw.toFixed(2)}"><title>Glisser pour pivoter (double-clic : 0°)</title></circle>
                        <path class="rotate-handle-icon" d="M ${(cx - rIcon).toFixed(2)},${handleY.toFixed(2)} A ${rIcon.toFixed(2)},${rIcon.toFixed(2)} 0 1,1 ${(cx + rIcon * 0.6).toFixed(2)},${(handleY + rIcon * 0.8).toFixed(2)}" style="stroke-width:${sw.toFixed(2)}" />
                        <rect class="resize-handle is-nw" data-handle="item-resize" data-corner="nw" x="${(bx1 - hHalf).toFixed(2)}" y="${(by1 - hHalf).toFixed(2)}" width="${hs.toFixed(2)}" height="${hs.toFixed(2)}" rx="${(1.5 / (scale * editor.zoom)).toFixed(2)}" style="stroke-width:${sw.toFixed(2)}"><title>Glisser pour redimensionner</title></rect>
                        <rect class="resize-handle is-ne" data-handle="item-resize" data-corner="ne" x="${(bx2 - hHalf).toFixed(2)}" y="${(by1 - hHalf).toFixed(2)}" width="${hs.toFixed(2)}" height="${hs.toFixed(2)}" rx="${(1.5 / (scale * editor.zoom)).toFixed(2)}" style="stroke-width:${sw.toFixed(2)}"><title>Glisser pour redimensionner</title></rect>
                        <rect class="resize-handle is-sw" data-handle="item-resize" data-corner="sw" x="${(bx1 - hHalf).toFixed(2)}" y="${(by2 - hHalf).toFixed(2)}" width="${hs.toFixed(2)}" height="${hs.toFixed(2)}" rx="${(1.5 / (scale * editor.zoom)).toFixed(2)}" style="stroke-width:${sw.toFixed(2)}"><title>Glisser pour redimensionner</title></rect>
                        <rect class="resize-handle is-se" data-handle="item-resize" data-corner="se" x="${(bx2 - hHalf).toFixed(2)}" y="${(by2 - hHalf).toFixed(2)}" width="${hs.toFixed(2)}" height="${hs.toFixed(2)}" rx="${(1.5 / (scale * editor.zoom)).toFixed(2)}" style="stroke-width:${sw.toFixed(2)}"><title>Glisser pour redimensionner</title></rect>
                    </g>`;
                }
            }
        } else if (kind === 'connector') {
            const { p1, p2 } = resolveConnectorEndpoints(el, store.scene.items);
            if (isLocked) {
                const d = buildConnectorPath(p1, p2, el.mode, el.bend, el.bendX || 0);
                html += `<path d="${d}" fill="none" stroke="#d97706" stroke-width="${((el.width || 4) + 5).toFixed(1)}" opacity="0.28" stroke-linecap="round" pointer-events="none" />`;
            } else {
                html += `<circle class="handle-dot" data-handle="conn-start" cx="${p1.x.toFixed(1)}" cy="${p1.y.toFixed(1)}" r="6"><title>Déplacer le point de départ</title></circle>`;
                html += `<circle class="handle-dot" data-handle="conn-end" cx="${p2.x.toFixed(1)}" cy="${p2.y.toFixed(1)}" r="6"><title>Déplacer le point d’arrivée</title></circle>`;
                if (el.mode !== 'straight') {
                    const mid = getConnectorMidpoint(p1, p2, el.mode, el.bend, el.bendX || 0);
                    html += `<circle class="handle-dot" data-handle="conn-bend" cx="${mid.x.toFixed(1)}" cy="${mid.y.toFixed(1)}" r="5.5"><title>Glisser librement pour courber</title></circle>`;
                }
            }
        } else if (kind === 'label') {
            const m = getLabelMetrics(el);
            if (isLocked) {
                const swWorld = 1.5 / editor.zoom;
                html += `<rect class="selection-box is-locked" x="${(m.boxX - 4).toFixed(1)}" y="${(m.boxY - 4).toFixed(1)}" width="${(m.boxW + 8).toFixed(1)}" height="${(m.boxH + 8).toFixed(1)}" rx="4" style="stroke-width:${swWorld.toFixed(2)}" />`;
            } else {
                html += `<circle class="handle-dot" data-handle="lbl-pos" cx="${(m.boxX - 8).toFixed(1)}" cy="${(el.y - m.fs * 0.35).toFixed(1)}" r="5"><title>Déplacer la légende (Shift : avec la pointe)</title></circle>`;
                if (el.showLeader) {
                    html += `<circle class="handle-dot" data-handle="lbl-target" cx="${el.targetX.toFixed(1)}" cy="${el.targetY.toFixed(1)}" r="6"><title>Déplacer la pointe de la flèche</title></circle>`;
                }
            }
        }
    } else if (selectedEntries.length > 1) {
        let gMinX = Infinity, gMinY = Infinity, gMaxX = -Infinity, gMaxY = -Infinity;
        const swWorld = 1.4 / editor.zoom;
        for (const { kind, el } of selectedEntries) {
            const b = getElementWorldBounds(kind, el);
            if (b) {
                if (b.minX < gMinX) gMinX = b.minX;
                if (b.minY < gMinY) gMinY = b.minY;
                if (b.maxX > gMaxX) gMaxX = b.maxX;
                if (b.maxY > gMaxY) gMaxY = b.maxY;
            }
            if (kind === 'item') {
                const def = getCatalogItem(el.type);
                if (!def) continue;
                const bb = def.getBBox(el.props || {});
                const pad = 4;
                const scale = el.scale ?? 1;
                const fx = el.flipX ? -scale : scale;
                const transform = `translate(${el.x}, ${el.y}) rotate(${el.rotation ?? 0}) scale(${fx}, ${scale})`;
                const sw = 1.4 / (scale * editor.zoom);
                html += `<g transform="${transform}">
                    <rect class="selection-box" x="${bb.x - pad}" y="${bb.y - pad}" width="${bb.width + pad * 2}" height="${bb.height + pad * 2}" rx="4" style="stroke-width:${sw.toFixed(2)}" />
                </g>`;
            } else if (kind === 'connector') {
                const { p1, p2 } = resolveConnectorEndpoints(el, store.scene.items);
                const d = buildConnectorPath(p1, p2, el.mode, el.bend, el.bendX || 0);
                html += `<path d="${d}" fill="none" stroke="#2563eb" stroke-width="${((el.width || 4) + 4).toFixed(1)}" opacity="0.28" stroke-linecap="round" pointer-events="none" />`;
            } else if (kind === 'label' && b) {
                html += `<rect class="selection-box" x="${(b.minX - 4).toFixed(1)}" y="${(b.minY - 4).toFixed(1)}" width="${(b.maxX - b.minX + 8).toFixed(1)}" height="${(b.maxY - b.minY + 8).toFixed(1)}" rx="3" style="stroke-width:${swWorld.toFixed(2)}" />`;
            }
        }
        if (isFinite(gMinX)) {
            const gPad = 10 / editor.zoom;
            html += `<rect class="selection-group-box" x="${(gMinX - gPad).toFixed(1)}" y="${(gMinY - gPad).toFixed(1)}" width="${(gMaxX - gMinX + gPad * 2).toFixed(1)}" height="${(gMaxY - gMinY + gPad * 2).toFixed(1)}" rx="6" style="stroke-width:${(1.6 / editor.zoom).toFixed(2)}" />`;
        }
    }

    if (editor.drag?.kind === 'marquee') {
        const m = editor.drag;
        const rx = Math.min(m.startX, m.currX);
        const ry = Math.min(m.startY, m.currY);
        const rw = Math.abs(m.currX - m.startX);
        const rh = Math.abs(m.currY - m.startY);
        html += `<rect class="marquee-box" x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" style="stroke-width:${(1.4 / editor.zoom).toFixed(2)}" />`;
    }

    for (const g of editor.activeGuides) {
        if (g.type === 'v') {
            html += `<line class="snap-guide" x1="${g.x.toFixed(1)}" y1="${g.y1.toFixed(1)}" x2="${g.x.toFixed(1)}" y2="${g.y2.toFixed(1)}" />`;
        } else {
            html += `<line class="snap-guide" x1="${g.x1.toFixed(1)}" y1="${g.y.toFixed(1)}" x2="${g.x2.toFixed(1)}" y2="${g.y.toFixed(1)}" />`;
        }
    }
    if (editor.snappedPort) {
        html += `<circle class="snap-port-halo" cx="${editor.snappedPort.x.toFixed(1)}" cy="${editor.snappedPort.y.toFixed(1)}" r="10" />`;
        if (editor.snappedPort.alignedAngle !== null && editor.snappedPort.alignedAngle !== undefined) {
            const bx = editor.snappedPort.x + 26 / editor.zoom;
            const by = editor.snappedPort.y - 18 / editor.zoom;
            const s = 1 / editor.zoom;
            html += `<g transform="translate(${bx.toFixed(1)}, ${by.toFixed(1)}) scale(${s.toFixed(3)})">
                <rect class="angle-badge-bg is-snapped" x="-24" y="-11" width="48" height="20" rx="10" />
                <text class="angle-badge-text" x="0" y="3">${editor.snappedPort.alignedAngle}°</text>
            </g>`;
        }
    }

    if (editor.rotateFeedback) {
        const rf = editor.rotateFeedback;
        const s = 1 / editor.zoom;
        html += `<g transform="translate(${(rf.x + 28 * s).toFixed(1)}, ${(rf.y - 18 * s).toFixed(1)}) scale(${s.toFixed(3)})">
            <rect class="angle-badge-bg ${rf.snapped ? 'is-snapped' : ''}" x="-24" y="-11" width="48" height="20" rx="10" />
            <text class="angle-badge-text" x="0" y="3">${rf.angle}°</text>
        </g>`;
    }

    if (editor.scaleFeedback) {
        const sf = editor.scaleFeedback;
        const s = 1 / editor.zoom;
        html += `<g transform="translate(${(sf.x + 28 * s).toFixed(1)}, ${(sf.y - 18 * s).toFixed(1)}) scale(${s.toFixed(3)})">
            <rect class="angle-badge-bg" x="-26" y="-11" width="52" height="20" rx="10" />
            <text class="angle-badge-text" x="0" y="3">${sf.pct}%</text>
        </g>`;
    }

    layerOverlay.innerHTML = html;
}

const TOOL_HINTS = {
    select: 'Sélection · Glissez pour cadrer, Shift+clic multi-sélection, Espace/clic droit pour déplacer la vue',
    pan: 'Main · Glissez pour déplacer la vue (molette pour zoomer, V pour revenir à la sélection)',
    wire: 'Fil électrique · Cliquez sur deux bornes pour tracer en chaîne (Échap pour quitter)',
    hose: 'Tuyau de chimie · Cliquez sur deux embouts pour tracer en chaîne (Échap pour quitter)',
    label: 'Légende · Cliquez sur le schéma pour placer une annotation'
};

function setTool(tool) {
    editor.tool = tool;
    editor.pendingConnector = null;
    stageEl.classList.remove('tool-select', 'tool-pan', 'tool-wire', 'tool-hose', 'tool-label');
    stageEl.classList.add(`tool-${tool}`);
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.tool === tool);
    });
    toolHintEl.textContent = TOOL_HINTS[tool] || '';
    renderOverlay();
}

function addOrSelectPaillasse() {
    const existing = store.scene.items.find(i => i.type === 'paillasse');
    if (existing) {
        store.selection = { kind: 'item', id: existing.id };
        setTool('select');
        renderScene();
        inspector.renderInspector();
        return;
    }
    const center = getViewportCenterScene();
    let tableX = Math.round(center.x);
    let tableY = Math.round(center.y + 160);
    let width = 760;

    if (store.scene.items.length > 0) {
        const b = computeSceneBounds(store.scene, 0);
        tableX = Math.round(b.x + b.width / 2);
        tableY = Math.round(b.y + b.height);
        width = Math.max(600, Math.min(1600, Math.ceil((b.width + 180) / 20) * 20));
    }
    const item = store.addItem('paillasse', tableX, tableY);
    if (item) {
        item.props.width = width;
    }
    setTool('select');
    renderScene();
    inspector.renderInspector();
    notify('Paillasse ajoutée en bas du montage !');
}

// =========================================================================
// INITIALISATION DES MODULES & NAVBAR PHYWEB
// =========================================================================
const ctx = {
    store,
    editor,
    dom,
    escHtml,
    notify,
    clientToScene,
    getViewportCenterScene,
    applyViewportTransform,
    centerInitialView,
    zoomAt,
    fitViewToScene,
    findElementsInRect,
    alignSelectedElements,
    distributeSelectedElements,
    rotateItemBy,
    addOrSelectPaillasse,
    renderScene,
    renderOverlay,
    setTool
};

const io = createIOController(ctx);
ctx.hasSceneData = io.hasSceneData;
ctx.handleNewScene = io.handleNewScene;
ctx.handleSaveJSON = io.handleSaveJSON;
ctx.triggerLoadJSON = io.triggerLoadJSON;

try {
    initApplets('Schémas de Chimie & Physique', '../..', () => io.hasUnsavedChanges());
} catch (e) {
    console.warn('initApplets ignoré:', e);
}
io.setupNavbarMenu();

const inspector = createInspectorController(ctx);
ctx.renderInspector = inspector.renderInspector;
ctx.syncInspectorValues = inspector.syncInspectorValues;

const drawer = createDrawerController(ctx);
const exportModal = createExportModalController(ctx);
ctx.openExportModal = exportModal.openExportModal;

const interactions = createInteractionsController(ctx);
ctx.closeOverlays = () => {
    interactions.closeContextMenu();
    interactions.closeInlineLabelEditor();
};

// =========================================================================
// CÂBLAGE DE LA BARRE D'OUTILS & EXPORTS RAPIDES
// =========================================================================
document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => setTool(btn.dataset.tool));
});

btnUndo.addEventListener('click', () => { if (store.undo()) { renderScene(); inspector.renderInspector(); } });
btnRedo.addEventListener('click', () => { if (store.redo()) { renderScene(); inspector.renderInspector(); } });

btnToggleSnap.addEventListener('click', () => {
    editor.snapEnabled = !editor.snapEnabled;
    btnToggleSnap.classList.toggle('is-toggled', editor.snapEnabled);
    if (!store.selection) inspector.renderInspector();
});

btnToggleGrid.addEventListener('click', () => {
    editor.showGrid = !editor.showGrid;
    btnToggleGrid.classList.toggle('is-toggled', editor.showGrid);
    applyViewportTransform();
    if (!store.selection) inspector.renderInspector();
});

document.getElementById('btnAddTable').addEventListener('click', addOrSelectPaillasse);

document.getElementById('btnZoomIn').addEventListener('click', () => {
    const r = svgEl.getBoundingClientRect();
    zoomAt(1.2, r.left + r.width / 2, r.top + r.height / 2);
});
document.getElementById('btnZoomOut').addEventListener('click', () => {
    const r = svgEl.getBoundingClientRect();
    zoomAt(1 / 1.2, r.left + r.width / 2, r.top + r.height / 2);
});
document.getElementById('btnZoomFit').addEventListener('click', fitViewToScene);

document.getElementById('btnQuickCopy').addEventListener('click', io.handleCopyPNG);
document.getElementById('btnQuickPNG').addEventListener('click', io.handleExportPNG);
document.getElementById('btnQuickSVG').addEventListener('click', io.handleExportSVG);
document.getElementById('btnClearScene').addEventListener('click', io.handleClearScene);

// =========================================================================
// DÉMARRAGE
// =========================================================================
const restoredFromSession = io.restoreSession();
io.setupElectronStartupImport();
drawer.buildDrawerTabs();
drawer.buildDrawerGrid();
setTool('select');
renderScene();
inspector.renderInspector();
requestAnimationFrame(() => {
    if (restoredFromSession) {
        fitViewToScene();
        notify('Schéma restauré pour cette session.');
    } else {
        centerInitialView();
    }
});
