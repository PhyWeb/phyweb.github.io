// Contrôleur principal de l'applet Schémas de Chimie & Physique
import { initApplets, showToast } from '../../common/common.js';
import { CATALOG, CATEGORIES, SVG_SHARED_STYLES, getCatalogItem } from './catalog.js';
import {
    computeObjectSnap,
    findNearestConnectorPort,
    getWorldAnchors,
    buildConnectorPath,
    getConnectorMidpoint,
    localToWorld,
    snapRotationAngle,
    normalizeAngle
} from './snapping.js';
import { SceneStore, resolveConnectorEndpoints } from './state.js';
import {
    buildStandaloneSVG,
    renderConnectorSVG,
    renderLabelSVG,
    renderSceneToPNGBlob,
    computeSceneBounds
} from './export.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Initialisation navbar PhyWeb
const notify = (msg) => {
    if (typeof showToast === 'function') showToast(msg);
    else console.log(msg);
};
try {
    initApplets('Schémas de Chimie & Physique', '../..');
} catch (e) {
    console.warn('initApplets ignoré:', e);
}

// =========================================================================
// ÉTAT DE L'ÉDITEUR
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
    spaceDown: false
};

// Références DOM
const stageEl = document.getElementById('stageContainer');
const svgEl = document.getElementById('sceneSvg');
const viewportGroup = document.getElementById('viewportGroup');
const gridRect = document.getElementById('gridRect');
const layerItems = document.getElementById('layerItems');
const layerConnectors = document.getElementById('layerConnectors');
const layerLabels = document.getElementById('layerLabels');
const layerOverlay = document.getElementById('layerOverlay');

const toolHintEl = document.getElementById('toolHint');
const zoomBadgeEl = document.getElementById('zoomBadge');
const inspectorTitleEl = document.getElementById('inspectorTitle');
const inspectorBodyEl = document.getElementById('inspectorBody');
const drawerEl = document.getElementById('objectDrawer');
const drawerTabsEl = document.getElementById('drawerTabs');
const drawerGridEl = document.getElementById('drawerGrid');
const drawerSearchEl = document.getElementById('drawerSearchInput');

const btnUndo = document.getElementById('btnUndo');
const btnRedo = document.getElementById('btnRedo');
const btnToggleSnap = document.getElementById('btnToggleSnap');
const btnToggleGrid = document.getElementById('btnToggleGrid');

// Injecter les styles SVG partagés dans le SVG principal
const styleEl = document.createElementNS(SVG_NS, 'style');
styleEl.textContent = SVG_SHARED_STYLES;
svgEl.insertBefore(styleEl, svgEl.firstChild);

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
    if (
        store.scene.items.length === 0 &&
        store.scene.connectors.length === 0 &&
        store.scene.labels.length === 0
    ) {
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
// RENDU DE LA SCÈNE
// =========================================================================
function renderScene() {
    // 1. Objets
    layerItems.innerHTML = store.scene.items.map(item => {
        const def = getCatalogItem(item.type);
        if (!def) return '';
        const scale = item.scale ?? 1;
        const fx = item.flipX ? -scale : scale;
        const transform = `translate(${item.x}, ${item.y}) rotate(${item.rotation ?? 0}) scale(${fx}, ${scale})`;
        return `<g class="scene-item" data-kind="item" data-id="${item.id}" transform="${transform}">${def.render(item.props || {}, item.id, { rotation: item.rotation ?? 0, flipX: !!item.flipX })}</g>`;
    }).join('');

    // 2. Connecteurs (fils & tuyaux)
    layerConnectors.innerHTML = store.scene.connectors.map(conn => {
        const { p1, p2 } = resolveConnectorEndpoints(conn, store.scene.items);
        const d = buildConnectorPath(p1, p2, conn.mode, conn.bend, conn.bendX || 0);
        const hitStroke = `<path d="${d}" fill="none" stroke="transparent" stroke-width="18" />`;
        return `<g class="scene-connector" data-kind="connector" data-id="${conn.id}">${hitStroke}${renderConnectorSVG(conn, store.scene.items)}</g>`;
    }).join('');

    // 3. Légendes
    layerLabels.innerHTML = store.scene.labels.map(lbl => {
        return `<g class="scene-label" data-kind="label" data-id="${lbl.id}">${renderLabelSVG(lbl)}</g>`;
    }).join('');

    renderOverlay();
    updateHistoryButtons();
}

function renderOverlay() {
    let html = '';

    // Afficher les bornes/olivettes quand on utilise l'outil fil ou tuyau
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

    // Tracé en cours d'un fil ou tuyau
    if (editor.pendingConnector) {
        const pc = editor.pendingConnector;
        const p1 = { x: pc.start.x, y: pc.start.y, angle: pc.startAngle ?? null };
        const p2 = pc.hoveredPort
            ? { x: pc.hoveredPort.wx, y: pc.hoveredPort.wy, angle: pc.hoveredPort.worldAngle ?? null }
            : { x: pc.cursorX, y: pc.cursorY, angle: null };
        const defaultBend = (p1.angle !== null || p2.angle !== null) ? 0 : (pc.kind === 'wire' ? 40 : 30);
        const d = buildConnectorPath(p1, p2, 'bezier', defaultBend, 0);
        const col = pc.kind === 'wire' ? '#e03131' : '#0284c7';
        html += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${pc.kind === 'wire' ? 3 : 6}" stroke-dasharray="6 4" opacity="0.8" pointer-events="none" />`;
        html += `<circle cx="${p1.x.toFixed(1)}" cy="${p1.y.toFixed(1)}" r="5" fill="${col}" pointer-events="none" />`;
    }

    // Boîte de sélection et poignées
    const sel = store.selection;
    if (sel) {
        const el = store.getSelectedElement();
        if (el && sel.kind === 'item') {
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
                html += `<g transform="${transform}">
                    <rect class="selection-box" x="${bb.x - pad}" y="${topY}" width="${bb.width + pad * 2}" height="${bb.height + pad * 2}" rx="4" style="stroke-width:${sw.toFixed(2)}" />
                    <line class="rotate-stem" x1="${cx.toFixed(1)}" y1="${topY.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(handleY + r).toFixed(1)}" style="stroke-width:${sw.toFixed(2)}" />
                    <circle class="rotate-handle" data-handle="item-rotate" cx="${cx.toFixed(1)}" cy="${handleY.toFixed(1)}" r="${r.toFixed(2)}" style="stroke-width:${sw.toFixed(2)}" title="Glisser pour pivoter (double-clic : 0°)" />
                    <path class="rotate-handle-icon" d="M ${(cx - rIcon).toFixed(2)},${handleY.toFixed(2)} A ${rIcon.toFixed(2)},${rIcon.toFixed(2)} 0 1,1 ${(cx + rIcon * 0.6).toFixed(2)},${(handleY + rIcon * 0.8).toFixed(2)}" style="stroke-width:${sw.toFixed(2)}" />
                </g>`;
            }
        } else if (el && sel.kind === 'connector') {
            const { p1, p2 } = resolveConnectorEndpoints(el, store.scene.items);
            const mid = getConnectorMidpoint(p1, p2, el.mode, el.bend, el.bendX || 0);
            html += `<circle class="handle-dot" data-handle="conn-start" cx="${p1.x.toFixed(1)}" cy="${p1.y.toFixed(1)}" r="6" />`;
            html += `<circle class="handle-dot" data-handle="conn-end" cx="${p2.x.toFixed(1)}" cy="${p2.y.toFixed(1)}" r="6" />`;
            html += `<circle class="handle-dot" data-handle="conn-bend" cx="${mid.x.toFixed(1)}" cy="${mid.y.toFixed(1)}" r="5.5" title="Glisser librement pour courber" />`;
        } else if (el && sel.kind === 'label') {
            html += `<circle class="handle-dot" data-handle="lbl-pos" cx="${(el.x - 10).toFixed(1)}" cy="${(el.y - 6).toFixed(1)}" r="5" />`;
            if (el.showLeader) {
                html += `<circle class="handle-dot" data-handle="lbl-target" cx="${el.targetX.toFixed(1)}" cy="${el.targetY.toFixed(1)}" r="6" />`;
            }
        }
    }

    // Guides d'alignement et halo d'aimantation port-à-port
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

    layerOverlay.innerHTML = html;
}

function updateHistoryButtons() {
    btnUndo.disabled = !store.canUndo();
    btnRedo.disabled = !store.canRedo();
}

// =========================================================================
// CHANGEMENT D'OUTIL
// =========================================================================
const TOOL_HINTS = {
    select: 'Sélection · Glissez pour déplacer, molette pour zoomer',
    wire: 'Fil électrique · Cliquez sur deux bornes (ou deux points)',
    hose: 'Tuyau de chimie · Cliquez sur deux embouts (ou deux points)',
    label: 'Légende · Cliquez sur le schéma pour placer une annotation'
};

function setTool(tool) {
    editor.tool = tool;
    editor.pendingConnector = null;
    stageEl.classList.remove('tool-select', 'tool-wire', 'tool-hose', 'tool-label');
    stageEl.classList.add(`tool-${tool}`);
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.tool === tool);
    });
    toolHintEl.textContent = TOOL_HINTS[tool] || '';
    renderOverlay();
}

// =========================================================================
// INTERACTIONS SOURIS / POINTEUR SUR LE CANVAS SVG
// =========================================================================
svgEl.addEventListener('pointerdown', (e) => {
    // Pan avec clic milieu ou Espace + clic gauche
    if (e.button === 1 || (e.button === 0 && editor.spaceDown)) {
        e.preventDefault();
        stageEl.classList.add('is-panning');
        editor.drag = {
            kind: 'pan',
            startClientX: e.clientX,
            startClientY: e.clientY,
            origPanX: editor.panX,
            origPanY: editor.panY
        };
        svgEl.setPointerCapture(e.pointerId);
        return;
    }

    if (e.button !== 0) return;
    const pt = clientToScene(e.clientX, e.clientY);

    // 1. Outil Fil électrique ou Tuyau
    if (editor.tool === 'wire' || editor.tool === 'hose') {
        const portType = editor.tool === 'wire' ? 'elec' : 'hose';
        const nearPort = editor.snapEnabled ? findNearestConnectorPort(pt.x, pt.y, store.scene.items, portType) : null;
        const snappedPoint = nearPort
            ? { x: nearPort.wx, y: nearPort.wy, itemId: nearPort.itemId, anchorId: nearPort.id }
            : { x: Math.round(pt.x), y: Math.round(pt.y) };

        if (!editor.pendingConnector) {
            editor.pendingConnector = {
                kind: editor.tool,
                start: snappedPoint,
                startAngle: nearPort ? (nearPort.worldAngle ?? null) : null,
                cursorX: snappedPoint.x,
                cursorY: snappedPoint.y,
                hoveredPort: nearPort
            };
            renderOverlay();
        } else {
            store.addConnector(editor.tool, editor.pendingConnector.start, snappedPoint);
            editor.pendingConnector = null;
            setTool('select');
            renderScene();
            renderInspector();
        }
        return;
    }

    // 2. Outil Légende
    if (editor.tool === 'label') {
        store.addLabel(pt.x + 55, pt.y - 25, 'Légende', pt.x, pt.y);
        setTool('select');
        renderScene();
        renderInspector();
        const txtArea = inspectorBodyEl.querySelector('textarea[data-prop="text"]');
        if (txtArea) {
            txtArea.focus();
            txtArea.select();
        }
        return;
    }

    // 3. Outil Sélection : vérifier d'abord les poignées
    const handleEl = e.target.closest('[data-handle]');
    if (handleEl && store.selection) {
        const handleType = handleEl.dataset.handle;
        store.pushHistory();
        if (handleType === 'item-rotate' && store.selection.kind === 'item') {
            const item = store.getSelectedElement();
            const def = item ? getCatalogItem(item.type) : null;
            if (item && def) {
                const bb = def.getBBox(item.props || {});
                const cx = bb.x + bb.width / 2;
                const cy = bb.y + bb.height / 2;
                const pivotWorld = localToWorld(item, cx, cy);
                editor.drag = {
                    kind: 'rotate-item',
                    id: item.id,
                    localCenterX: cx,
                    localCenterY: cy,
                    pivotX: pivotWorld.x,
                    pivotY: pivotWorld.y
                };
                svgEl.setPointerCapture(e.pointerId);
                return;
            }
        }
        const currentEl = store.getSelectedElement();
        editor.drag = {
            kind: 'handle',
            handleType,
            startX: pt.x,
            startY: pt.y,
            origBend: currentEl?.bend ?? 0,
            origBendX: currentEl?.bendX ?? 0
        };
        svgEl.setPointerCapture(e.pointerId);
        return;
    }

    // Vérifier clic sur un élément de scène
    const hitEl = e.target.closest('[data-kind][data-id]');
    if (hitEl) {
        const kind = hitEl.dataset.kind;
        const id = hitEl.dataset.id;
        store.selection = { kind, id };
        renderInspector();
        renderOverlay();

        const el = store.getSelectedElement();
        if (kind === 'item' && el) {
            editor.drag = {
                kind: 'move-item',
                id,
                offsetX: pt.x - el.x,
                offsetY: pt.y - el.y,
                origRotation: el.rotation ?? 0,
                historyPushed: false
            };
            svgEl.setPointerCapture(e.pointerId);
        } else if (kind === 'label' && el) {
            editor.drag = {
                kind: 'move-label',
                id,
                startX: pt.x,
                startY: pt.y,
                origX: el.x,
                origY: el.y,
                origTargetX: el.targetX,
                origTargetY: el.targetY,
                historyPushed: false
            };
            svgEl.setPointerCapture(e.pointerId);
        }
        return;
    }

    // Clic dans le vide -> désélectionner + pan fluide si on glisse
    store.selection = null;
    renderInspector();
    renderOverlay();
    editor.drag = {
        kind: 'pan',
        startClientX: e.clientX,
        startClientY: e.clientY,
        origPanX: editor.panX,
        origPanY: editor.panY
    };
    stageEl.classList.add('is-panning');
    svgEl.setPointerCapture(e.pointerId);
});

svgEl.addEventListener('pointermove', (e) => {
    const pt = clientToScene(e.clientX, e.clientY);

    if (editor.pendingConnector) {
        const portType = editor.pendingConnector.kind === 'wire' ? 'elec' : 'hose';
        editor.pendingConnector.cursorX = pt.x;
        editor.pendingConnector.cursorY = pt.y;
        editor.pendingConnector.hoveredPort = editor.snapEnabled
            ? findNearestConnectorPort(pt.x, pt.y, store.scene.items, portType)
            : null;
        renderOverlay();
        return;
    }

    if (!editor.drag) return;

    if (editor.drag.kind === 'pan') {
        editor.panX = editor.drag.origPanX + (e.clientX - editor.drag.startClientX);
        editor.panY = editor.drag.origPanY + (e.clientY - editor.drag.startClientY);
        applyViewportTransform();
        return;
    }

    if (editor.drag.kind === 'move-item') {
        const item = store.scene.items.find(i => i.id === editor.drag.id);
        if (!item) return;
        if (!editor.drag.historyPushed) {
            store.pushHistory();
            editor.drag.historyPushed = true;
        }
        const overDelete = isOverDeleteZone(e.clientX, e.clientY);
        drawerEl.classList.toggle('is-drop-delete', overDelete);
        const rawX = pt.x - editor.drag.offsetX;
        const rawY = pt.y - editor.drag.offsetY;
        const snap = computeObjectSnap(item, rawX, rawY, store.scene.items, {
            snapEnabled: editor.snapEnabled && !e.altKey && !overDelete,
            gridSize: editor.gridSize,
            snapToGrid: editor.showGrid,
            baseRotation: editor.drag.origRotation
        });
        item.x = Math.round(snap.x);
        item.y = Math.round(snap.y);
        item.rotation = snap.rotation;
        editor.activeGuides = snap.guides;
        editor.snappedPort = snap.snappedPort;
        renderScene();
        syncInspectorValues();
        return;
    }

    if (editor.drag.kind === 'rotate-item') {
        const item = store.scene.items.find(i => i.id === editor.drag.id);
        if (!item) return;
        const { pivotX, pivotY, localCenterX, localCenterY } = editor.drag;
        const rawAngle = (Math.atan2(pt.y - pivotY, pt.x - pivotX) * 180) / Math.PI + 90;
        const res = snapRotationAngle(rawAngle, editor.snapEnabled && !e.altKey);
        item.rotation = res.angle;
        // Maintenir le centre visuel fixe pendant la rotation
        const newCenter = localToWorld(item, localCenterX, localCenterY);
        item.x = Math.round(item.x + (pivotX - newCenter.x));
        item.y = Math.round(item.y + (pivotY - newCenter.y));
        editor.rotateFeedback = { x: pt.x, y: pt.y, angle: res.angle, snapped: res.snapped };
        renderScene();
        syncInspectorValues();
        return;
    }

    if (editor.drag.kind === 'move-label') {
        const lbl = store.scene.labels.find(l => l.id === editor.drag.id);
        if (!lbl) return;
        if (!editor.drag.historyPushed) {
            store.pushHistory();
            editor.drag.historyPushed = true;
        }
        drawerEl.classList.toggle('is-drop-delete', isOverDeleteZone(e.clientX, e.clientY));
        const dx = pt.x - editor.drag.startX;
        const dy = pt.y - editor.drag.startY;
        lbl.x = Math.round(editor.drag.origX + dx);
        lbl.y = Math.round(editor.drag.origY + dy);
        // Maintenir la pointe sur la cible si Shift n'est pas enfoncé, ou déplacer tout ensemble avec Shift
        if (e.shiftKey) {
            lbl.targetX = Math.round(editor.drag.origTargetX + dx);
            lbl.targetY = Math.round(editor.drag.origTargetY + dy);
        }
        renderScene();
        return;
    }

    if (editor.drag.kind === 'handle') {
        const el = store.getSelectedElement();
        if (!el) return;
        const h = editor.drag.handleType;
        if (h === 'conn-start' || h === 'conn-end') {
            const portType = el.kind === 'wire' ? 'elec' : 'hose';
            const near = editor.snapEnabled ? findNearestConnectorPort(pt.x, pt.y, store.scene.items, portType) : null;
            const endpoint = near
                ? { x: near.wx, y: near.wy, itemId: near.itemId, anchorId: near.id }
                : { x: Math.round(pt.x), y: Math.round(pt.y) };
            if (h === 'conn-start') el.start = endpoint;
            else el.end = endpoint;
            editor.snappedPort = near ? { x: near.wx, y: near.wy } : null;
            renderScene();
        } else if (h === 'conn-bend') {
            el.bendX = Math.round((editor.drag.origBendX || 0) + (pt.x - editor.drag.startX));
            el.bend = Math.round((editor.drag.origBend || 0) + (pt.y - editor.drag.startY));
            renderScene();
            syncInspectorValues();
        } else if (h === 'lbl-target') {
            el.targetX = Math.round(pt.x);
            el.targetY = Math.round(pt.y);
            renderScene();
        }
    }
});

function isOverDeleteZone(clientX, clientY) {
    const r = drawerEl.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
}

svgEl.addEventListener('pointerup', (e) => {
    if (editor.drag) {
        const wasMovable = editor.drag.kind === 'move-item' || editor.drag.kind === 'move-label';
        const shouldDelete = wasMovable && isOverDeleteZone(e.clientX, e.clientY);
        const historyPushed = Boolean(editor.drag.historyPushed);

        editor.drag = null;
        editor.activeGuides = [];
        editor.snappedPort = null;
        editor.rotateFeedback = null;
        drawerEl.classList.remove('is-drop-delete');
        stageEl.classList.remove('is-panning');
        try { svgEl.releasePointerCapture(e.pointerId); } catch (_) {}

        if (shouldDelete) {
            store.deleteSelected(historyPushed);
            renderScene();
            renderInspector();
            notify('Élément supprimé.');
        } else {
            renderOverlay();
        }
    }
});

// Double-clic sur la poignée de rotation -> réinitialiser l'angle à 0° autour du centre visuel
svgEl.addEventListener('dblclick', (e) => {
    const handleEl = e.target.closest('[data-handle="item-rotate"]');
    if (!handleEl || store.selection?.kind !== 'item') return;
    const item = store.getSelectedElement();
    const def = item ? getCatalogItem(item.type) : null;
    if (!item || !def) return;
    const bb = def.getBBox(item.props || {});
    const cx = bb.x + bb.width / 2;
    const cy = bb.y + bb.height / 2;
    const pivot = localToWorld(item, cx, cy);
    store.pushHistory();
    item.rotation = 0;
    const newCenter = localToWorld(item, cx, cy);
    item.x = Math.round(item.x + (pivot.x - newCenter.x));
    item.y = Math.round(item.y + (pivot.y - newCenter.y));
    renderScene();
    renderInspector();
});

svgEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAt(factor, e.clientX, e.clientY);
}, { passive: false });

// =========================================================================
// PANNEAU DE PROPRIÉTÉS À DROITE (INSPECTEUR)
// =========================================================================
function renderInspector() {
    const sel = store.selection;
    const el = store.getSelectedElement();

    if (!sel || !el) {
        inspectorTitleEl.innerHTML = '<i class="fas fa-sliders mr-1"></i> Scène';
        inspectorBodyEl.innerHTML = `
          <div class="prop-section">
            <div class="prop-section-title">Affichage & Aimantation</div>
            <div class="prop-row">
              <label for="chkSnap">Aimantation</label>
              <input type="checkbox" id="chkSnap" ${editor.snapEnabled ? 'checked' : ''}>
            </div>
            <div class="prop-row">
              <label for="chkGrid">Grille millimétrée</label>
              <input type="checkbox" id="chkGrid" ${editor.showGrid ? 'checked' : ''}>
            </div>
            <div class="prop-row">
              <label for="chkTransparent">Fond transparent (export)</label>
              <input type="checkbox" id="chkTransparent" ${editor.transparentExport ? 'checked' : ''}>
            </div>
            <div class="btn-row" style="margin-top:4px">
              <button class="mini-btn" id="btnInspectorTable"><i class="fas fa-table"></i> ${store.scene.items.some(i => i.type === 'paillasse') ? 'Sélectionner la paillasse' : 'Ajouter une paillasse en bas'}</button>
            </div>
          </div>
          <div class="prop-section">
            <div class="prop-section-title">Raccourcis clavier</div>
            <div class="shortcuts-list">
              <div><kbd>V</kbd> Sélection · <kbd>W</kbd> Fil · <kbd>T</kbd> Tuyau · <kbd>L</kbd> Légende</div>
              <div><kbd>M</kbd> Aimantation · <kbd>G</kbd> Grille · <kbd>Alt</kbd> Ignorer aimant</div>
              <div><kbd>Ctrl+Z</kbd> Annuler · <kbd>Ctrl+D</kbd> Dupliquer · <kbd>Suppr</kbd> Effacer</div>
              <div><kbd>Flèches</kbd> Décalage fin · <kbd>Molette</kbd> Zoom</div>
            </div>
          </div>
        `;
        inspectorBodyEl.querySelector('#chkSnap').addEventListener('change', (ev) => {
            editor.snapEnabled = ev.target.checked;
            btnToggleSnap.classList.toggle('is-toggled', editor.snapEnabled);
        });
        inspectorBodyEl.querySelector('#chkGrid').addEventListener('change', (ev) => {
            editor.showGrid = ev.target.checked;
            btnToggleGrid.classList.toggle('is-toggled', editor.showGrid);
            applyViewportTransform();
        });
        inspectorBodyEl.querySelector('#chkTransparent').addEventListener('change', (ev) => {
            editor.transparentExport = ev.target.checked;
        });
        inspectorBodyEl.querySelector('#btnInspectorTable').addEventListener('click', addOrSelectPaillasse);
        return;
    }

    if (sel.kind === 'item') {
        renderItemInspector(el);
    } else if (sel.kind === 'connector') {
        renderConnectorInspector(el);
    } else if (sel.kind === 'label') {
        renderLabelInspector(el);
    }
}

function renderItemInspector(item) {
    const def = getCatalogItem(item.type);
    if (!def) return;
    inspectorTitleEl.innerHTML = `<i class="fas fa-flask mr-1"></i> ${def.name}`;

    let specificHtml = '';
    const schema = def.propSchema || [];
    if (schema.length > 0) {
        specificHtml = `<div class="prop-section"><div class="prop-section-title">Propriétés de l'objet</div>`;
        for (const field of schema) {
            if (field.showIf && !field.showIf(item.props || {})) continue;
            const val = item.props?.[field.key];
            if (field.type === 'select') {
                const opts = field.options.map(o => `<option value="${o.value}" ${String(val) === String(o.value) ? 'selected' : ''}>${o.label}</option>`).join('');
                specificHtml += `<div class="prop-row"><label>${field.label}</label><select class="prop-select" data-prop="${field.key}">${opts}</select></div>`;
            } else if (field.type === 'range') {
                specificHtml += `<div class="prop-row">
                  <label>${field.label}</label>
                  <div class="prop-range-wrap">
                    <input type="range" data-prop="${field.key}" min="${field.min}" max="${field.max}" step="${field.step || 1}" value="${val ?? field.min}">
                    <span class="prop-val" data-val-for="${field.key}">${val ?? field.min}${field.unit || ''}</span>
                  </div>
                </div>`;
            } else if (field.type === 'toggle') {
                specificHtml += `<div class="prop-row"><label>${field.label}</label><input type="checkbox" data-prop="${field.key}" ${val ? 'checked' : ''}></div>`;
            } else if (field.type === 'text') {
                specificHtml += `<div class="prop-row"><label>${field.label}</label><input type="text" class="prop-input" style="max-width:130px" data-prop="${field.key}" value="${String(val ?? '').replace(/"/g, '&quot;')}" placeholder="${field.placeholder || ''}"></div>`;
            } else if (field.type === 'color') {
                const swatches = (field.presets || []).map(pr =>
                    `<button type="button" class="color-swatch ${val === pr.color ? 'is-selected' : ''}" data-color-prop="${field.key}" data-color-val="${pr.color}" style="background:${pr.color}" title="${pr.label}"></button>`
                ).join('');
                specificHtml += `
                  <div>
                    <div class="prop-row" style="margin-bottom:4px"><label>${field.label}</label>
                      <input type="color" class="color-picker-native" data-prop="${field.key}" value="${val || '#9ad1f5'}">
                    </div>
                    <div class="color-swatches">${swatches}</div>
                  </div>
                `;
            }
        }
        specificHtml += `</div>`;
    }

    inspectorBodyEl.innerHTML = `
      <div class="prop-section">
        <div class="btn-row">
          <button class="mini-btn" id="btnDupEl" title="Dupliquer (Ctrl+D)"><i class="fas fa-clone"></i> Dupliquer</button>
          <button class="mini-btn is-danger" id="btnDelEl" title="Supprimer (Suppr)"><i class="fas fa-trash"></i> Supprimer</button>
        </div>
        <div class="btn-row">
          <button class="mini-btn" data-z="back" title="Arrière-plan"><i class="fas fa-angles-down"></i></button>
          <button class="mini-btn" data-z="backward" title="Reculer"><i class="fas fa-angle-down"></i></button>
          <button class="mini-btn" data-z="forward" title="Avancer"><i class="fas fa-angle-up"></i></button>
          <button class="mini-btn" data-z="front" title="Premier plan"><i class="fas fa-angles-up"></i></button>
        </div>
      </div>

      ${specificHtml}

      <div class="prop-section">
        <div class="prop-section-title">Orientation & Taille</div>
        <div class="prop-row">
          <label>Rotation</label>
          <div class="prop-range-wrap">
            <input type="range" id="inpRotation" min="-180" max="180" step="1" value="${item.rotation ?? 0}">
            <span class="prop-val" id="valRotation">${item.rotation ?? 0}°</span>
          </div>
        </div>
        <div class="btn-row">
          <button class="mini-btn" data-rot="-90">-90°</button>
          <button class="mini-btn" data-rot="-45">-45°</button>
          <button class="mini-btn" data-rot="-15">-15°</button>
          <button class="mini-btn" data-rot="0">0°</button>
          <button class="mini-btn" data-rot="15">+15°</button>
          <button class="mini-btn" data-rot="45">+45°</button>
          <button class="mini-btn" data-rot="90">+90°</button>
        </div>
        <div class="prop-row">
          <label>Symétrie horizontale</label>
          <button class="mini-btn ${item.flipX ? 'is-active' : ''}" id="btnFlipX" style="flex:0 0 auto; padding:3px 10px">
            <i class="fas fa-left-right"></i> Inverser
          </button>
        </div>
        <div class="prop-row">
          <label>Échelle</label>
          <div class="prop-range-wrap">
            <input type="range" id="inpScale" min="0.4" max="2.0" step="0.05" value="${item.scale ?? 1}">
            <span class="prop-val" id="valScale">${Math.round((item.scale ?? 1) * 100)}%</span>
          </div>
        </div>
      </div>
    `;

    // Actions
    inspectorBodyEl.querySelector('#btnDupEl').addEventListener('click', () => {
        store.duplicateSelected();
        renderScene();
        renderInspector();
    });
    inspectorBodyEl.querySelector('#btnDelEl').addEventListener('click', () => {
        store.deleteSelected();
        renderScene();
        renderInspector();
    });
    inspectorBodyEl.querySelectorAll('[data-z]').forEach(btn => {
        btn.addEventListener('click', () => {
            store.moveItemZOrder(item.id, btn.dataset.z);
            renderScene();
        });
    });

    // Propriétés spécifiques
    inspectorBodyEl.querySelectorAll('[data-prop]').forEach(input => {
        const key = input.dataset.prop;
        const field = schema.find(f => f.key === key);
        const eventName = (input.type === 'range' || input.type === 'text' || input.type === 'color') ? 'input' : 'change';
        input.addEventListener(eventName, () => {
            const prevVal = item.props[key];
            const newVal = input.type === 'checkbox'
                ? input.checked
                : (input.type === 'range' ? Number(input.value) : input.value);
            if (prevVal === newVal) return;
            item.props[key] = newVal;
            const valEl = inspectorBodyEl.querySelector(`[data-val-for="${key}"]`);
            if (valEl) valEl.textContent = `${newVal}${field?.unit || ''}`;
            renderScene();
            // Si un showIf dépend de cette propriété (ex: level 0 <-> >0, mode, variant), re-rendre l'inspecteur sur change
            if (eventName === 'change' || (prevVal === 0 && newVal > 0) || (prevVal > 0 && newVal === 0)) {
                renderInspector();
            }
        });
        input.addEventListener('change', () => {
            store.pushHistory();
        });
    });

    inspectorBodyEl.querySelectorAll('[data-color-prop]').forEach(btn => {
        btn.addEventListener('click', () => {
            store.pushHistory();
            item.props[btn.dataset.colorProp] = btn.dataset.colorVal;
            renderScene();
            renderInspector();
        });
    });

    // Rotation / Symétrie / Échelle
    const inpRot = inspectorBodyEl.querySelector('#inpRotation');
    const valRot = inspectorBodyEl.querySelector('#valRotation');
    inpRot.addEventListener('input', () => {
        item.rotation = Number(inpRot.value);
        valRot.textContent = `${item.rotation}°`;
        renderScene();
    });
    inpRot.addEventListener('change', () => store.pushHistory());

    inspectorBodyEl.querySelectorAll('[data-rot]').forEach(btn => {
        btn.addEventListener('click', () => {
            store.pushHistory();
            const delta = Number(btn.dataset.rot);
            const bb = def.getBBox(item.props || {});
            const cx = bb.x + bb.width / 2;
            const cy = bb.y + bb.height / 2;
            const pivot = localToWorld(item, cx, cy);
            item.rotation = delta === 0 ? 0 : normalizeAngle((item.rotation || 0) + delta);
            const newCenter = localToWorld(item, cx, cy);
            item.x = Math.round(item.x + (pivot.x - newCenter.x));
            item.y = Math.round(item.y + (pivot.y - newCenter.y));
            renderScene();
            renderInspector();
        });
    });

    inspectorBodyEl.querySelector('#btnFlipX').addEventListener('click', () => {
        store.pushHistory();
        item.flipX = !item.flipX;
        renderScene();
        renderInspector();
    });

    const inpScale = inspectorBodyEl.querySelector('#inpScale');
    const valScale = inspectorBodyEl.querySelector('#valScale');
    inpScale.addEventListener('input', () => {
        item.scale = Number(inpScale.value);
        valScale.textContent = `${Math.round(item.scale * 100)}%`;
        renderScene();
    });
    inpScale.addEventListener('change', () => store.pushHistory());
}

function renderConnectorInspector(conn) {
    const isWire = conn.kind === 'wire';
    inspectorTitleEl.innerHTML = isWire
        ? '<i class="fas fa-bolt mr-1"></i> Fil électrique'
        : '<i class="fas fa-water mr-1"></i> Tuyau de chimie';

    const presets = isWire
        ? [
            { label: 'Rouge (+)', color: '#e03131' },
            { label: 'Noir (COM/−)', color: '#1e1e1e' },
            { label: 'Bleu', color: '#1971c2' },
            { label: 'Vert', color: '#2f9e44' },
            { label: 'Jaune', color: '#f08c00' }
        ]
        : [
            { label: 'Eau froide', color: '#74c0fc' },
            { label: 'Eau chaude', color: '#ff8787' },
            { label: 'Vide / Caoutchouc', color: '#adb5bd' },
            { label: 'Gaz', color: '#ffd43b' },
            { label: 'Transparent', color: '#ffffff' }
        ];

    inspectorBodyEl.innerHTML = `
      <div class="prop-section">
        <div class="btn-row">
          <button class="mini-btn" id="btnDupEl"><i class="fas fa-clone"></i> Dupliquer</button>
          <button class="mini-btn is-danger" id="btnDelEl"><i class="fas fa-trash"></i> Supprimer</button>
        </div>
      </div>

      <div class="prop-section">
        <div class="prop-section-title">Tracé</div>
        <div class="prop-row">
          <label>Style de tracé</label>
          <select class="prop-select" id="selConnMode">
            <option value="bezier" ${conn.mode === 'bezier' ? 'selected' : ''}>Courbe souple</option>
            <option value="orthogonal" ${conn.mode === 'orthogonal' ? 'selected' : ''}>Angles droits</option>
          </select>
        </div>
        <div class="prop-row">
          <label>Courbure / Décalage</label>
          <div class="prop-range-wrap">
            <input type="range" id="inpConnBend" min="-220" max="220" step="5" value="${conn.bend ?? 0}">
            <span class="prop-val" id="valConnBend">${conn.bend ?? 0}</span>
          </div>
        </div>
        <div class="btn-row">
          <button class="mini-btn" id="btnResetBend" title="Remettre la courbure naturelle tangente aux raccords"><i class="fas fa-wand-magic-sparkles"></i> Courbure auto</button>
        </div>
        <div class="prop-row">
          <label>Épaisseur</label>
          <div class="prop-range-wrap">
            <input type="range" id="inpConnWidth" min="2" max="14" step="0.5" value="${conn.width ?? (isWire ? 3.5 : 8)}">
            <span class="prop-val" id="valConnWidth">${conn.width ?? (isWire ? 3.5 : 8)}</span>
          </div>
        </div>
        <div class="prop-row">
          <label>Pointillés</label>
          <input type="checkbox" id="chkConnDashed" ${conn.dashed ? 'checked' : ''}>
        </div>
      </div>

      <div class="prop-section">
        <div class="prop-section-title">Couleur & Sens</div>
        <div class="prop-row">
          <label>Couleur</label>
          <input type="color" class="color-picker-native" id="inpConnColor" value="${conn.color || '#e03131'}">
        </div>
        <div class="color-swatches">
          ${presets.map(p => `<button type="button" class="color-swatch ${conn.color === p.color ? 'is-selected' : ''}" data-c="${p.color}" style="background:${p.color}" title="${p.label}"></button>`).join('')}
        </div>
        <div class="prop-row" style="margin-top:4px">
          <label>${isWire ? 'Flèche sens courant' : 'Flèche circulation'}</label>
          <input type="checkbox" id="chkConnArrow" ${conn.showArrow ? 'checked' : ''}>
        </div>
        ${conn.showArrow ? `
        <div class="prop-row">
          <label>Inverser la flèche</label>
          <button class="mini-btn" id="btnReverseArrow" style="flex:0 0 auto; padding:3px 10px"><i class="fas fa-arrows-left-right"></i> Inverser</button>
        </div>` : ''}
      </div>
    `;

    inspectorBodyEl.querySelector('#btnDupEl').addEventListener('click', () => { store.duplicateSelected(); renderScene(); renderInspector(); });
    inspectorBodyEl.querySelector('#btnDelEl').addEventListener('click', () => { store.deleteSelected(); renderScene(); renderInspector(); });

    inspectorBodyEl.querySelector('#selConnMode').addEventListener('change', (ev) => {
        store.pushHistory();
        conn.mode = ev.target.value;
        renderScene();
    });
    const inpBend = inspectorBodyEl.querySelector('#inpConnBend');
    inpBend.addEventListener('input', () => {
        conn.bend = Number(inpBend.value);
        inspectorBodyEl.querySelector('#valConnBend').textContent = conn.bend;
        renderScene();
    });
    inpBend.addEventListener('change', () => store.pushHistory());

    inspectorBodyEl.querySelector('#btnResetBend').addEventListener('click', () => {
        store.pushHistory();
        conn.bend = 0;
        conn.bendX = 0;
        renderScene();
        renderInspector();
    });

    const inpWidth = inspectorBodyEl.querySelector('#inpConnWidth');
    inpWidth.addEventListener('input', () => {
        conn.width = Number(inpWidth.value);
        inspectorBodyEl.querySelector('#valConnWidth').textContent = conn.width;
        renderScene();
    });
    inpWidth.addEventListener('change', () => store.pushHistory());

    inspectorBodyEl.querySelector('#chkConnDashed').addEventListener('change', (ev) => {
        store.pushHistory();
        conn.dashed = ev.target.checked;
        renderScene();
    });

    const inpColor = inspectorBodyEl.querySelector('#inpConnColor');
    inpColor.addEventListener('input', () => {
        conn.color = inpColor.value;
        renderScene();
    });
    inpColor.addEventListener('change', () => { store.pushHistory(); renderInspector(); });

    inspectorBodyEl.querySelectorAll('[data-c]').forEach(btn => {
        btn.addEventListener('click', () => {
            store.pushHistory();
            conn.color = btn.dataset.c;
            renderScene();
            renderInspector();
        });
    });

    inspectorBodyEl.querySelector('#chkConnArrow').addEventListener('change', (ev) => {
        store.pushHistory();
        conn.showArrow = ev.target.checked;
        renderScene();
        renderInspector();
    });

    const btnRev = inspectorBodyEl.querySelector('#btnReverseArrow');
    if (btnRev) {
        btnRev.addEventListener('click', () => {
            store.pushHistory();
            conn.reverseArrow = !conn.reverseArrow;
            renderScene();
        });
    }
}

function renderLabelInspector(lbl) {
    inspectorTitleEl.innerHTML = '<i class="fas fa-font mr-1"></i> Légende';
    inspectorBodyEl.innerHTML = `
      <div class="prop-section">
        <div class="btn-row">
          <button class="mini-btn" id="btnDupEl"><i class="fas fa-clone"></i> Dupliquer</button>
          <button class="mini-btn is-danger" id="btnDelEl"><i class="fas fa-trash"></i> Supprimer</button>
        </div>
      </div>
      <div class="prop-section">
        <div class="prop-section-title">Texte</div>
        <textarea class="prop-textarea" data-prop="text">${lbl.text || ''}</textarea>
        <div class="prop-row">
          <label>Taille police</label>
          <div class="prop-range-wrap">
            <input type="range" id="inpFontSize" min="10" max="36" step="1" value="${lbl.fontSize ?? 16}">
            <span class="prop-val" id="valFontSize">${lbl.fontSize ?? 16}px</span>
          </div>
        </div>
        <div class="prop-row">
          <label>Couleur</label>
          <input type="color" class="color-picker-native" id="inpLblColor" value="${lbl.color || '#1e293b'}">
        </div>
        <div class="btn-row">
          <button class="mini-btn ${lbl.bold ? 'is-active' : ''}" id="btnBold"><i class="fas fa-bold"></i> Gras</button>
          <button class="mini-btn ${lbl.italic ? 'is-active' : ''}" id="btnItalic"><i class="fas fa-italic"></i> Italique</button>
        </div>
      </div>
      <div class="prop-section">
        <div class="prop-section-title">Ligne de rappel</div>
        <div class="prop-row">
          <label>Afficher la ligne</label>
          <input type="checkbox" id="chkLeader" ${lbl.showLeader ? 'checked' : ''}>
        </div>
        ${lbl.showLeader ? `
        <div class="prop-row">
          <label>Embout flèche</label>
          <input type="checkbox" id="chkArrowHead" ${lbl.arrowHead ? 'checked' : ''}>
        </div>` : ''}
      </div>
    `;

    inspectorBodyEl.querySelector('#btnDupEl').addEventListener('click', () => { store.duplicateSelected(); renderScene(); renderInspector(); });
    inspectorBodyEl.querySelector('#btnDelEl').addEventListener('click', () => { store.deleteSelected(); renderScene(); renderInspector(); });

    const ta = inspectorBodyEl.querySelector('textarea[data-prop="text"]');
    ta.addEventListener('input', () => { lbl.text = ta.value; renderScene(); });
    ta.addEventListener('change', () => store.pushHistory());

    const inpFs = inspectorBodyEl.querySelector('#inpFontSize');
    inpFs.addEventListener('input', () => {
        lbl.fontSize = Number(inpFs.value);
        inspectorBodyEl.querySelector('#valFontSize').textContent = `${lbl.fontSize}px`;
        renderScene();
    });
    inpFs.addEventListener('change', () => store.pushHistory());

    const inpCol = inspectorBodyEl.querySelector('#inpLblColor');
    inpCol.addEventListener('input', () => { lbl.color = inpCol.value; renderScene(); });
    inpCol.addEventListener('change', () => store.pushHistory());

    inspectorBodyEl.querySelector('#btnBold').addEventListener('click', () => {
        store.pushHistory();
        lbl.bold = !lbl.bold;
        renderScene();
        renderInspector();
    });
    inspectorBodyEl.querySelector('#btnItalic').addEventListener('click', () => {
        store.pushHistory();
        lbl.italic = !lbl.italic;
        renderScene();
        renderInspector();
    });
    inspectorBodyEl.querySelector('#chkLeader').addEventListener('change', (ev) => {
        store.pushHistory();
        lbl.showLeader = ev.target.checked;
        renderScene();
        renderInspector();
    });
    const chkAh = inspectorBodyEl.querySelector('#chkArrowHead');
    if (chkAh) {
        chkAh.addEventListener('change', (ev) => {
            store.pushHistory();
            lbl.arrowHead = ev.target.checked;
            renderScene();
        });
    }
}

function syncInspectorValues() {
    const el = store.getSelectedElement();
    if (!el) return;
    if (store.selection?.kind === 'connector') {
        const inpBend = inspectorBodyEl.querySelector('#inpConnBend');
        const valBend = inspectorBodyEl.querySelector('#valConnBend');
        if (inpBend) inpBend.value = el.bend;
        if (valBend) valBend.textContent = el.bend;
    } else if (store.selection?.kind === 'item') {
        const inpRot = inspectorBodyEl.querySelector('#inpRotation');
        const valRot = inspectorBodyEl.querySelector('#valRotation');
        if (inpRot) inpRot.value = el.rotation ?? 0;
        if (valRot) valRot.textContent = `${el.rotation ?? 0}°`;
    }
}

// =========================================================================
// DRAWER EN BAS (BANQUE D'OBJETS AVEC APERÇUS SVG)
// =========================================================================
function buildDrawerTabs() {
    drawerTabsEl.innerHTML = CATEGORIES.map(cat => `
      <button class="drawer-tab ${editor.activeCategory === cat.id ? 'is-active' : ''}" data-cat="${cat.id}">
        <i class="fas ${cat.icon}"></i>
        <span>${cat.label}</span>
      </button>
    `).join('');

    drawerTabsEl.querySelectorAll('.drawer-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            editor.activeCategory = btn.dataset.cat;
            buildDrawerTabs();
            buildDrawerGrid();
        });
    });
}

function buildDrawerGrid() {
    const q = editor.searchQuery.trim().toLowerCase();
    const list = CATALOG.filter(item => {
        const catOk = editor.activeCategory === 'all' || item.category === editor.activeCategory;
        if (!catOk) return false;
        if (!q) return true;
        return item.name.toLowerCase().includes(q) || (item.keywords || '').toLowerCase().includes(q);
    });

    if (list.length === 0) {
        drawerGridEl.innerHTML = `<span class="has-text-grey is-size-7 ml-2">Aucun objet trouvé pour « ${editor.searchQuery} ».</span>`;
        return;
    }

    drawerGridEl.innerHTML = list.map(def => {
        const bb = def.getBBox(def.defaultProps || {});
        const pad = 10;
        const vb = `${bb.x - pad} ${bb.y - pad} ${bb.width + pad * 2} ${bb.height + pad * 2}`;
        const thumbSvg = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${def.render(def.defaultProps || {}, 'thumb_' + def.id)}</svg>`;
        return `
          <button class="drawer-card" data-add-type="${def.id}" title="Ajouter : ${def.name}">
            <div class="drawer-card-thumb">${thumbSvg}</div>
            <div class="drawer-card-name">${def.name}</div>
          </button>
        `;
    }).join('');

    drawerGridEl.querySelectorAll('[data-add-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            const typeId = btn.dataset.addType;
            const center = getViewportCenterScene();
            // Léger décalage si plusieurs objets sont ajoutés au même endroit
            const jitter = (store.scene.items.length % 5) * 14 - 28;
            store.addItem(typeId, center.x + jitter, center.y + 40);
            setTool('select');
            renderScene();
            renderInspector();
        });
    });
}

// =========================================================================
// EXPORTS & SAUVEGARDE / CHARGEMENT
// =========================================================================
async function handleCopyPNG() {
    try {
        const blob = await renderSceneToPNGBlob(store.scene, { scale: 3, transparent: editor.transparentExport });
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        notify('Schéma HD copié dans le presse-papier !');
    } catch (err) {
        console.error(err);
        notify('Impossible de copier automatiquement : utilisez le bouton PNG.');
    }
}

async function handleExportPNG() {
    try {
        const blob = await renderSceneToPNGBlob(store.scene, { scale: 3, transparent: editor.transparentExport });
        downloadBlob(blob, 'schema-phyweb.png');
        notify('Image PNG HD téléchargée !');
    } catch (err) {
        console.error(err);
        notify('Erreur lors de l\'export PNG.');
    }
}

function handleExportSVG() {
    const svg = buildStandaloneSVG(store.scene, { transparent: editor.transparentExport });
    downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), 'schema-phyweb.svg');
    notify('Fichier SVG téléchargé !');
}

function handleSaveJSON() {
    const json = store.exportJSON();
    downloadBlob(new Blob([json], { type: 'application/json;charset=utf-8' }), 'schema-phyweb.json');
    notify('Projet sauvegardé (.json) !');
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// =========================================================================
// CÂBLAGE DES BOUTONS & RACCOURCIS CLAVIER
// =========================================================================
document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => setTool(btn.dataset.tool));
});

btnUndo.addEventListener('click', () => { if (store.undo()) { renderScene(); renderInspector(); } });
btnRedo.addEventListener('click', () => { if (store.redo()) { renderScene(); renderInspector(); } });

btnToggleSnap.addEventListener('click', () => {
    editor.snapEnabled = !editor.snapEnabled;
    btnToggleSnap.classList.toggle('is-toggled', editor.snapEnabled);
    if (!store.selection) renderInspector();
});

btnToggleGrid.addEventListener('click', () => {
    editor.showGrid = !editor.showGrid;
    btnToggleGrid.classList.toggle('is-toggled', editor.showGrid);
    applyViewportTransform();
    if (!store.selection) renderInspector();
});

function addOrSelectPaillasse() {
    const existing = store.scene.items.find(i => i.type === 'paillasse');
    if (existing) {
        store.selection = { kind: 'item', id: existing.id };
        setTool('select');
        renderScene();
        renderInspector();
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
    renderInspector();
    notify('Paillasse ajoutée en bas du montage !');
}

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

document.getElementById('btnCopyPNG').addEventListener('click', handleCopyPNG);
document.getElementById('btnQuickCopy').addEventListener('click', handleCopyPNG);
document.getElementById('btnExportPNG').addEventListener('click', handleExportPNG);
document.getElementById('btnQuickPNG').addEventListener('click', handleExportPNG);
document.getElementById('btnExportSVG').addEventListener('click', handleExportSVG);
document.getElementById('btnQuickSVG').addEventListener('click', handleExportSVG);
document.getElementById('btnSaveJSON').addEventListener('click', handleSaveJSON);

const jsonFileInput = document.getElementById('jsonFileInput');
document.getElementById('btnLoadJSON').addEventListener('click', () => jsonFileInput.click());
jsonFileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const text = await file.text();
        store.importJSON(text);
        renderScene();
        renderInspector();
        fitViewToScene();
        notify('Projet chargé avec succès !');
    } catch (err) {
        notify('Erreur : fichier JSON invalide.');
    }
    jsonFileInput.value = '';
});

document.getElementById('btnClearScene').addEventListener('click', () => {
    if (store.clearAll()) {
        renderScene();
        renderInspector();
        notify('Schéma effacé.');
    }
});

document.getElementById('btnToggleDrawer').addEventListener('click', () => {
    drawerEl.classList.toggle('is-collapsed');
});

drawerSearchEl.addEventListener('input', () => {
    editor.searchQuery = drawerSearchEl.value;
    if (drawerEl.classList.contains('is-collapsed')) {
        drawerEl.classList.remove('is-collapsed');
    }
    buildDrawerGrid();
});

// Raccourcis clavier globaux
window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.code === 'Space') {
        editor.spaceDown = true;
        stageEl.classList.add('is-panning');
        return;
    }

    if (e.key === 'Escape') {
        editor.pendingConnector = null;
        setTool('select');
        store.selection = null;
        renderInspector();
        renderOverlay();
        return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) { if (store.redo()) { renderScene(); renderInspector(); } }
        else { if (store.undo()) { renderScene(); renderInspector(); } }
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (store.redo()) { renderScene(); renderInspector(); }
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (store.duplicateSelected()) { renderScene(); renderInspector(); }
        return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.deleteSelected()) {
            e.preventDefault();
            renderScene();
            renderInspector();
        }
        return;
    }

    const k = e.key.toLowerCase();
    if (k === 'v') setTool('select');
    else if (k === 'w') setTool('wire');
    else if (k === 't') setTool('hose');
    else if (k === 'l') setTool('label');
    else if (k === 'm') btnToggleSnap.click();
    else if (k === 'g') btnToggleGrid.click();
    else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && store.selection) {
        const el = store.getSelectedElement();
        if (!el || store.selection.kind === 'connector') return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        store.pushHistory();
        if (e.key === 'ArrowUp') el.y -= step;
        if (e.key === 'ArrowDown') el.y += step;
        if (e.key === 'ArrowLeft') el.x -= step;
        if (e.key === 'ArrowRight') el.x += step;
        renderScene();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        editor.spaceDown = false;
        if (!editor.drag) stageEl.classList.remove('is-panning');
    }
});

// =========================================================================
// INITIALISATION
// =========================================================================
buildDrawerTabs();
buildDrawerGrid();
setTool('select');
renderScene();
renderInspector();
requestAnimationFrame(centerInitialView);
