// Interactions canvas (pointeur, drag, rotation, redimensionnement, menu contextuel, édition inline, raccourcis clavier)
import { getCatalogItem } from '../catalog.js';
import {
    computeObjectSnap,
    findNearestConnectorPort,
    localToWorld,
    snapRotationAngle
} from '../snapping.js';
import { getLabelMetrics } from '../export.js';

export function createInteractionsController(ctx) {
    const { store, editor, dom, notify } = ctx;
    const { stageEl, svgEl, drawerEl, inspectorBodyEl, btnToggleSnap, btnToggleGrid } = dom;

    // =========================================================================
    // MENU CONTEXTUEL (CLIC DROIT COURT SANS DRAG)
    // =========================================================================
    const contextMenuEl = document.createElement('div');
    contextMenuEl.className = 'schemas-context-menu';
    contextMenuEl.setAttribute('role', 'menu');
    contextMenuEl.hidden = true;
    document.body.appendChild(contextMenuEl);

    function closeContextMenu() {
        if (!contextMenuEl.hidden) {
            contextMenuEl.hidden = true;
            contextMenuEl.innerHTML = '';
        }
    }

    document.addEventListener('pointerdown', (e) => {
        if (!contextMenuEl.hidden && !contextMenuEl.contains(e.target)) {
            closeContextMenu();
        }
    });
    window.addEventListener('blur', closeContextMenu);
    window.addEventListener('resize', closeContextMenu);

    function handleCopySelection() {
        const n = store.copySelected();
        if (!n) return false;
        notify(n > 1 ? `${n} éléments copiés.` : 'Élément copié.');
        return true;
    }

    function handleCutSelection() {
        const allLocked = store.getSelectedElements().every(e => Boolean(e.el.locked));
        if (allLocked) {
            notify('Impossible de couper un élément verrouillé.');
            return false;
        }
        const n = store.cutSelected();
        if (!n) return false;
        ctx.renderScene();
        ctx.renderInspector();
        notify(n > 1 ? `${n} éléments coupés.` : 'Élément coupé.');
        return true;
    }

    function handleToggleLock() {
        const locked = store.toggleLockSelected();
        if (locked === null) return false;
        ctx.renderScene();
        ctx.renderInspector();
        notify(locked ? 'Élément(s) verrouillé(s).' : 'Élément(s) déverrouillé(s).');
        return true;
    }

    function handleGroupSelected() {
        const gid = store.groupSelected();
        if (!gid) return false;
        ctx.renderScene();
        ctx.renderInspector();
        notify('Éléments groupés.');
        return true;
    }

    function handleUngroupSelected() {
        if (!store.ungroupSelected()) return false;
        ctx.renderScene();
        ctx.renderInspector();
        notify('Groupe dissocié.');
        return true;
    }

    function handlePasteSelection(atPoint = null) {
        const created = store.pasteClipboard(atPoint ? { atPoint } : {});
        if (!created || created.length === 0) return false;
        ctx.renderScene();
        ctx.renderInspector();
        notify(created.length > 1 ? `${created.length} éléments collés.` : 'Élément collé.');
        return true;
    }

    function openContextMenu(clientX, clientY, hitEl) {
        const scenePt = ctx.clientToScene(clientX, clientY);
        if (hitEl) {
            const kind = hitEl.dataset.kind;
            const id = hitEl.dataset.id;
            if (!store.isSelected(kind, id)) {
                store.selectWithGroup(kind, id);
                ctx.renderOverlay();
                ctx.renderInspector();
            }
        }

        const entries = store.getSelectedElements();
        const actions = [];

        if (hitEl && entries.length > 0) {
            const isSingleItem = entries.length === 1 && entries[0].kind === 'item';
            const isSingleConn = entries.length === 1 && entries[0].kind === 'connector';
            const hasItems = entries.some(en => en.kind === 'item');
            const singleItem = isSingleItem ? entries[0].el : null;
            const singleConn = isSingleConn ? entries[0].el : null;
            const allLocked = entries.every(en => Boolean(en.el.locked));

            actions.push({ label: 'Copier', icon: 'fa-copy', kbd: 'Ctrl+C', onClick: () => handleCopySelection() });
            actions.push({ label: 'Couper', icon: 'fa-scissors', kbd: 'Ctrl+X', disabled: allLocked, onClick: () => handleCutSelection() });
            actions.push({ label: 'Dupliquer', icon: 'fa-clone', kbd: 'Ctrl+D', onClick: () => { store.duplicateSelected(); ctx.renderScene(); ctx.renderInspector(); } });
            actions.push({
                label: allLocked ? 'Déverrouiller' : 'Verrouiller',
                icon: allLocked ? 'fa-lock-open' : 'fa-lock',
                kbd: 'Ctrl+Shift+L',
                onClick: () => handleToggleLock()
            });
            if (entries.length >= 2 && !store.isSingleGroupSelected()) {
                actions.push({
                    label: 'Grouper',
                    icon: 'fa-object-group',
                    kbd: 'Ctrl+G',
                    onClick: () => handleGroupSelected()
                });
            }
            if (store.hasGroupedSelection()) {
                actions.push({
                    label: 'Dégrouper',
                    icon: 'fa-object-ungroup',
                    kbd: 'Ctrl+Shift+G',
                    onClick: () => handleUngroupSelected()
                });
            }

            if (isSingleConn) {
                actions.push({ divider: true });
                actions.push({
                    label: singleConn.behindItems ? 'Passer devant les objets' : 'Passer derrière les objets',
                    icon: singleConn.behindItems ? 'fa-angles-up' : 'fa-angles-down',
                    onClick: () => {
                        store.pushHistory();
                        singleConn.behindItems = !singleConn.behindItems;
                        if (editor.connectorDefaults?.[singleConn.kind]) {
                            editor.connectorDefaults[singleConn.kind].behindItems = singleConn.behindItems;
                        }
                        ctx.renderScene();
                        ctx.renderInspector();
                    }
                });
            } else if (isSingleItem) {
                actions.push({ divider: true });
                actions.push({ label: 'Pivoter −90°', icon: 'fa-rotate-left', disabled: Boolean(singleItem.locked), onClick: () => ctx.rotateItemBy(singleItem, -90) });
                actions.push({ label: 'Pivoter +90°', icon: 'fa-rotate-right', disabled: Boolean(singleItem.locked), onClick: () => ctx.rotateItemBy(singleItem, 90) });
                actions.push({
                    label: 'Inverser horizontalement',
                    icon: 'fa-left-right',
                    disabled: Boolean(singleItem.locked),
                    onClick: () => {
                        store.pushHistory();
                        singleItem.flipX = !singleItem.flipX;
                        ctx.renderScene();
                        ctx.renderInspector();
                    }
                });
                actions.push({ divider: true });
                actions.push({ label: 'Premier plan', icon: 'fa-angles-up', onClick: () => { store.moveItemZOrder(singleItem.id, 'front'); ctx.renderScene(); } });
                actions.push({ label: 'Avancer d’un plan', icon: 'fa-angle-up', onClick: () => { store.moveItemZOrder(singleItem.id, 'forward'); ctx.renderScene(); } });
                actions.push({ label: 'Reculer d’un plan', icon: 'fa-angle-down', onClick: () => { store.moveItemZOrder(singleItem.id, 'backward'); ctx.renderScene(); } });
                actions.push({ label: 'Arrière-plan', icon: 'fa-angles-down', onClick: () => { store.moveItemZOrder(singleItem.id, 'back'); ctx.renderScene(); } });
            } else if (hasItems) {
                actions.push({ divider: true });
                actions.push({
                    label: 'Mettre au premier plan',
                    icon: 'fa-angles-up',
                    onClick: () => {
                        store.pushHistory();
                        const ids = new Set(entries.filter(en => en.kind === 'item').map(en => en.id));
                        store.scene.items = [
                            ...store.scene.items.filter(i => !ids.has(i.id)),
                            ...store.scene.items.filter(i => ids.has(i.id))
                        ];
                        ctx.renderScene();
                    }
                });
                actions.push({
                    label: 'Mettre à l’arrière-plan',
                    icon: 'fa-angles-down',
                    onClick: () => {
                        store.pushHistory();
                        const ids = new Set(entries.filter(en => en.kind === 'item').map(en => en.id));
                        store.scene.items = [
                            ...store.scene.items.filter(i => ids.has(i.id)),
                            ...store.scene.items.filter(i => !ids.has(i.id))
                        ];
                        ctx.renderScene();
                    }
                });
            }

            actions.push({ divider: true });
            actions.push({
                label: 'Supprimer',
                icon: 'fa-trash',
                kbd: 'Suppr',
                danger: true,
                disabled: allLocked,
                onClick: () => {
                    store.deleteSelected();
                    ctx.renderScene();
                    ctx.renderInspector();
                }
            });
        } else {
            actions.push({
                label: 'Coller ici',
                icon: 'fa-paste',
                kbd: 'Ctrl+V',
                disabled: !store.hasClipboard(),
                onClick: () => handlePasteSelection(scenePt)
            });
            actions.push({
                label: 'Tout sélectionner',
                icon: 'fa-object-group',
                kbd: 'Ctrl+A',
                disabled: !ctx.hasSceneData(),
                onClick: () => {
                    store.selectAll();
                    ctx.renderOverlay();
                    ctx.renderInspector();
                }
            });
            actions.push({ divider: true });
            actions.push({
                label: 'Centrer / Adapter la vue',
                icon: 'fa-expand',
                kbd: '0',
                onClick: () => ctx.fitViewToScene()
            });
        }

        contextMenuEl.innerHTML = '';
        for (const act of actions) {
            if (act.divider) {
                const div = document.createElement('div');
                div.className = 'context-menu-divider';
                contextMenuEl.appendChild(div);
                continue;
            }
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `context-menu-item${act.danger ? ' is-danger' : ''}`;
            btn.disabled = Boolean(act.disabled);
            btn.innerHTML = `<i class="fas ${act.icon}"></i><span>${act.label}</span>${act.kbd ? `<span class="context-menu-kbd">${act.kbd}</span>` : ''}`;
            btn.addEventListener('click', () => {
                closeContextMenu();
                act.onClick();
            });
            contextMenuEl.appendChild(btn);
        }

        contextMenuEl.hidden = false;
        const rect = contextMenuEl.getBoundingClientRect();
        const x = Math.min(clientX, Math.max(8, window.innerWidth - rect.width - 8));
        const y = Math.min(clientY, Math.max(8, window.innerHeight - rect.height - 8));
        contextMenuEl.style.left = `${x}px`;
        contextMenuEl.style.top = `${y}px`;
    }

    // =========================================================================
    // ÉDITION DIRECTE DE LÉGENDE SUR LE CANVAS
    // =========================================================================
    let inlineEditorEl = null;

    function closeInlineLabelEditor() {
        if (inlineEditorEl) {
            const el = inlineEditorEl;
            inlineEditorEl = null;
            el.remove();
        }
    }

    function openInlineLabelEditor(lbl) {
        closeInlineLabelEditor();
        if (!lbl) return;

        const m = getLabelMetrics(lbl);
        const left = m.boxX * editor.zoom + editor.panX - 6;
        const top = m.boxY * editor.zoom + editor.panY - 4;
        const fontSizePx = Math.max(11, Math.round(m.fs * editor.zoom));

        const ta = document.createElement('textarea');
        ta.className = 'inline-label-editor';
        ta.value = lbl.text || '';
        ta.rows = Math.max(1, m.lines.length);
        ta.style.left = `${Math.round(left)}px`;
        ta.style.top = `${Math.round(top)}px`;
        ta.style.width = `${Math.max(110, Math.round(m.boxW * editor.zoom + 34))}px`;
        ta.style.fontSize = `${fontSizePx}px`;
        ta.style.fontWeight = lbl.bold ? 'bold' : 'normal';
        ta.style.fontStyle = lbl.italic ? 'italic' : 'normal';
        ta.style.textAlign = m.align;
        ta.style.color = lbl.color || '#1e293b';
        if (lbl.bgEnabled) ta.style.background = lbl.bgColor || '#ffffff';

        let historyPushed = false;
        ta.addEventListener('input', () => {
            if (!historyPushed) {
                store.pushHistory();
                historyPushed = true;
            }
            lbl.text = ta.value;
            const lines = ta.value.split('\n');
            ta.rows = Math.max(1, lines.length);
            const maxLen = Math.max(4, ...lines.map(l => l.length));
            ta.style.width = `${Math.max(110, Math.round(maxLen * fontSizePx * 0.62 + 34))}px`;
            ctx.renderScene();
            const inspTa = inspectorBodyEl.querySelector('textarea[data-prop="text"]');
            if (inspTa && inspTa.value !== ta.value) inspTa.value = ta.value;
        });

        ta.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' || (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey))) {
                ev.preventDefault();
                ev.stopPropagation();
                closeInlineLabelEditor();
            }
        });

        ta.addEventListener('blur', () => {
            closeInlineLabelEditor();
        });

        stageEl.appendChild(ta);
        inlineEditorEl = ta;
        ta.focus();
        ta.select();
    }

    function startMultiDrag(pt) {
        const entries = store.getSelectedElements();
        const origItems = [];
        const origLabels = [];
        const origConns = [];
        for (const { kind, el } of entries) {
            if (el.locked) continue;
            if (kind === 'item') {
                origItems.push({ el, x: el.x, y: el.y });
            } else if (kind === 'label') {
                origLabels.push({ el, x: el.x, y: el.y, targetX: el.targetX, targetY: el.targetY });
            } else if (kind === 'connector') {
                origConns.push({
                    el,
                    startFree: !el.start.itemId,
                    endFree: !el.end.itemId,
                    startX: el.start.x,
                    startY: el.start.y,
                    endX: el.end.x,
                    endY: el.end.y
                });
            }
        }
        if (origItems.length === 0 && origLabels.length === 0 && origConns.length === 0) {
            return null;
        }
        return {
            kind: 'move-multi',
            startX: pt.x,
            startY: pt.y,
            origItems,
            origLabels,
            origConns,
            historyPushed: false
        };
    }

    function isOverDeleteZone(clientX, clientY) {
        const r = drawerEl.getBoundingClientRect();
        return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    }

    // =========================================================================
    // INTERACTIONS SOURIS / POINTEUR SUR LE CANVAS SVG
    // =========================================================================
    svgEl.addEventListener('contextmenu', (e) => e.preventDefault());

    svgEl.addEventListener('pointerdown', (e) => {
        closeContextMenu();
        closeInlineLabelEditor();

        // Pan avec clic milieu, clic droit (drag >= 4px ; clic court = menu contextuel), outil Main ou Espace + clic gauche
        if (e.button === 1 || e.button === 2 || (e.button === 0 && (editor.spaceDown || editor.tool === 'pan'))) {
            e.preventDefault();
            const isRightClick = e.button === 2;
            if (!isRightClick) stageEl.classList.add('is-panning');
            editor.drag = {
                kind: 'pan',
                isRightClick,
                moved: false,
                hitEl: isRightClick ? e.target.closest('[data-kind][data-id]') : null,
                startClientX: e.clientX,
                startClientY: e.clientY,
                origPanX: editor.panX,
                origPanY: editor.panY
            };
            svgEl.setPointerCapture(e.pointerId);
            return;
        }

        if (e.button !== 0) return;
        const pt = ctx.clientToScene(e.clientX, e.clientY);

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
                ctx.renderOverlay();
            } else {
                const defaults = editor.connectorDefaults?.[editor.tool] || {};
                store.addConnector(editor.tool, editor.pendingConnector.start, snappedPoint, defaults);
                editor.pendingConnector = null;
                // Rester dans l'outil Fil/Tuyau pour permettre le tracé en chaîne (Échap pour quitter)
                ctx.renderScene();
                ctx.renderInspector();
            }
            return;
        }

        // 2. Outil Légende
        if (editor.tool === 'label') {
            e.preventDefault();
            const lbl = store.addLabel(pt.x + 55, pt.y - 25, 'Légende', pt.x, pt.y);
            ctx.setTool('select');
            ctx.renderScene();
            ctx.renderInspector();
            requestAnimationFrame(() => openInlineLabelEditor(lbl));
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
            if (handleType === 'item-resize' && store.selection.kind === 'item') {
                const item = store.getSelectedElement();
                const def = item ? getCatalogItem(item.type) : null;
                if (item && def) {
                    const bb = def.getBBox(item.props || {});
                    const pad = 6;
                    const corner = handleEl.dataset.corner || 'se';
                    const bx1 = bb.x - pad;
                    const by1 = bb.y - pad;
                    const bx2 = bb.x + bb.width + pad;
                    const by2 = bb.y + bb.height + pad;
                    const grabLocalX = (corner === 'nw' || corner === 'sw') ? bx1 : bx2;
                    const grabLocalY = (corner === 'nw' || corner === 'ne') ? by1 : by2;
                    const oppLocalX = (corner === 'nw' || corner === 'sw') ? bx2 : bx1;
                    const oppLocalY = (corner === 'nw' || corner === 'ne') ? by2 : by1;
                    const anchorWorld = localToWorld(item, oppLocalX, oppLocalY);
                    const grabWorld = localToWorld(item, grabLocalX, grabLocalY);
                    const origDist = Math.hypot(grabWorld.x - anchorWorld.x, grabWorld.y - anchorWorld.y) || 1;
                    editor.drag = {
                        kind: 'resize-item',
                        id: item.id,
                        oppLocalX,
                        oppLocalY,
                        anchorX: anchorWorld.x,
                        anchorY: anchorWorld.y,
                        ux: (grabWorld.x - anchorWorld.x) / origDist,
                        uy: (grabWorld.y - anchorWorld.y) / origDist,
                        origDist,
                        origScale: item.scale ?? 1
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
                origX: currentEl?.x ?? 0,
                origY: currentEl?.y ?? 0,
                origTargetX: currentEl?.targetX ?? 0,
                origTargetY: currentEl?.targetY ?? 0,
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

            if (e.shiftKey) {
                store.toggleSelectionWithGroup(kind, id);
                ctx.renderInspector();
                ctx.renderOverlay();
                return;
            }

            if (e.altKey) {
                // Alt+clic : sélectionner cet élément isolément même s'il appartient à un groupe
                store.selection = { kind, id };
                ctx.renderInspector();
                ctx.renderOverlay();
            } else {
                const alreadyInMulti = store.selected.length > 1 && store.isSelected(kind, id);
                if (!alreadyInMulti) {
                    store.selectWithGroup(kind, id);
                    ctx.renderInspector();
                    ctx.renderOverlay();
                }
            }

            if (store.selected.length > 1) {
                const multiDrag = startMultiDrag(pt);
                if (multiDrag) {
                    editor.drag = multiDrag;
                    svgEl.setPointerCapture(e.pointerId);
                }
                return;
            }

            const el = store.getSelectedElement();
            if (!el || el.locked) return;
            if (kind === 'item') {
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
                if (e.detail >= 2) {
                    e.preventDefault();
                    requestAnimationFrame(() => openInlineLabelEditor(el));
                    return;
                }
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

        // Clic dans le vide -> cadre de sélection multiple (avec Shift pour cumuler)
        const baseSelection = e.shiftKey ? store.selected.map(s => ({ ...s })) : [];
        if (!e.shiftKey) {
            store.clearSelection();
            ctx.renderInspector();
        }
        editor.drag = {
            kind: 'marquee',
            startX: pt.x,
            startY: pt.y,
            currX: pt.x,
            currY: pt.y,
            baseSelection
        };
        ctx.renderOverlay();
        svgEl.setPointerCapture(e.pointerId);
    });

    svgEl.addEventListener('pointermove', (e) => {
        const pt = ctx.clientToScene(e.clientX, e.clientY);

        if (editor.pendingConnector) {
            const portType = editor.pendingConnector.kind === 'wire' ? 'elec' : 'hose';
            editor.pendingConnector.cursorX = pt.x;
            editor.pendingConnector.cursorY = pt.y;
            editor.pendingConnector.hoveredPort = editor.snapEnabled
                ? findNearestConnectorPort(pt.x, pt.y, store.scene.items, portType)
                : null;
            ctx.renderOverlay();
            return;
        }

        if (!editor.drag) return;

        if (editor.drag.kind === 'pan') {
            const dxClient = e.clientX - editor.drag.startClientX;
            const dyClient = e.clientY - editor.drag.startClientY;
            if (editor.drag.isRightClick && !editor.drag.moved) {
                if (Math.hypot(dxClient, dyClient) < 4) return;
                editor.drag.moved = true;
                stageEl.classList.add('is-panning');
            }
            editor.panX = editor.drag.origPanX + dxClient;
            editor.panY = editor.drag.origPanY + dyClient;
            ctx.applyViewportTransform();
            return;
        }

        if (editor.drag.kind === 'marquee') {
            editor.drag.currX = pt.x;
            editor.drag.currY = pt.y;
            const inside = ctx.findElementsInRect(editor.drag.startX, editor.drag.startY, pt.x, pt.y);
            store.setSelection([...editor.drag.baseSelection, ...inside]);
            ctx.renderOverlay();
            return;
        }

        if (editor.drag.kind === 'move-multi') {
            if (!editor.drag.historyPushed) {
                store.pushHistory();
                editor.drag.historyPushed = true;
            }
            const overDelete = isOverDeleteZone(e.clientX, e.clientY);
            drawerEl.classList.toggle('is-drop-delete', overDelete);
            let dx = pt.x - editor.drag.startX;
            let dy = pt.y - editor.drag.startY;
            if (editor.snapEnabled && editor.showGrid && !e.altKey && !overDelete && editor.gridSize > 0) {
                dx = Math.round(dx / editor.gridSize) * editor.gridSize;
                dy = Math.round(dy / editor.gridSize) * editor.gridSize;
            } else {
                dx = Math.round(dx);
                dy = Math.round(dy);
            }
            for (const o of editor.drag.origItems) {
                o.el.x = o.x + dx;
                o.el.y = o.y + dy;
            }
            for (const o of editor.drag.origLabels) {
                o.el.x = o.x + dx;
                o.el.y = o.y + dy;
                o.el.targetX = o.targetX + dx;
                o.el.targetY = o.targetY + dy;
            }
            for (const o of editor.drag.origConns) {
                if (o.startFree) {
                    o.el.start.x = o.startX + dx;
                    o.el.start.y = o.startY + dy;
                }
                if (o.endFree) {
                    o.el.end.x = o.endX + dx;
                    o.el.end.y = o.endY + dy;
                }
            }
            ctx.renderScene();
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
            ctx.renderScene();
            ctx.syncInspectorValues();
            return;
        }

        if (editor.drag.kind === 'rotate-item') {
            const item = store.scene.items.find(i => i.id === editor.drag.id);
            if (!item) return;
            const { pivotX, pivotY, localCenterX, localCenterY } = editor.drag;
            const rawAngle = (Math.atan2(pt.y - pivotY, pt.x - pivotX) * 180) / Math.PI + 90;
            const res = snapRotationAngle(rawAngle, editor.snapEnabled && !e.altKey);
            item.rotation = res.angle;
            const newCenter = localToWorld(item, localCenterX, localCenterY);
            item.x = Math.round(item.x + (pivotX - newCenter.x));
            item.y = Math.round(item.y + (pivotY - newCenter.y));
            editor.rotateFeedback = { x: pt.x, y: pt.y, angle: res.angle, snapped: res.snapped };
            ctx.renderScene();
            ctx.syncInspectorValues();
            return;
        }

        if (editor.drag.kind === 'resize-item') {
            const item = store.scene.items.find(i => i.id === editor.drag.id);
            if (!item) return;
            const { anchorX, anchorY, ux, uy, origDist, origScale, oppLocalX, oppLocalY } = editor.drag;
            const proj = (pt.x - anchorX) * ux + (pt.y - anchorY) * uy;
            let nextScale = Math.max(0.4, Math.min(2.0, origScale * (proj / origDist)));
            if (editor.snapEnabled && !e.altKey) {
                nextScale = Math.round(nextScale / 0.05) * 0.05;
            }
            nextScale = Math.round(nextScale * 100) / 100;
            item.scale = Math.max(0.4, Math.min(2.0, nextScale));
            const newAnchor = localToWorld(item, oppLocalX, oppLocalY);
            item.x = Math.round(item.x + (anchorX - newAnchor.x));
            item.y = Math.round(item.y + (anchorY - newAnchor.y));
            editor.scaleFeedback = { x: pt.x, y: pt.y, pct: Math.round(item.scale * 100) };
            ctx.renderScene();
            ctx.syncInspectorValues();
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
            if (e.shiftKey) {
                lbl.targetX = Math.round(editor.drag.origTargetX + dx);
                lbl.targetY = Math.round(editor.drag.origTargetY + dy);
            }
            ctx.renderScene();
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
                ctx.renderScene();
            } else if (h === 'conn-bend') {
                el.bendX = Math.round((editor.drag.origBendX || 0) + (pt.x - editor.drag.startX));
                el.bend = Math.round((editor.drag.origBend || 0) + (pt.y - editor.drag.startY));
                ctx.renderScene();
                ctx.syncInspectorValues();
            } else if (h === 'lbl-pos') {
                const dx = pt.x - editor.drag.startX;
                const dy = pt.y - editor.drag.startY;
                el.x = Math.round(editor.drag.origX + dx);
                el.y = Math.round(editor.drag.origY + dy);
                if (e.shiftKey) {
                    el.targetX = Math.round(editor.drag.origTargetX + dx);
                    el.targetY = Math.round(editor.drag.origTargetY + dy);
                }
                ctx.renderScene();
            } else if (h === 'lbl-target') {
                el.targetX = Math.round(pt.x);
                el.targetY = Math.round(pt.y);
                ctx.renderScene();
            }
        }
    });

    svgEl.addEventListener('pointerup', (e) => {
        if (editor.drag) {
            const wasRightClickMenu = editor.drag.kind === 'pan' && editor.drag.isRightClick && !editor.drag.moved;
            const rightClickHitEl = editor.drag.hitEl;
            const wasMarquee = editor.drag.kind === 'marquee';
            const wasMovable = editor.drag.kind === 'move-item' || editor.drag.kind === 'move-label' || editor.drag.kind === 'move-multi';
            const shouldDelete = wasMovable && isOverDeleteZone(e.clientX, e.clientY);
            const historyPushed = Boolean(editor.drag.historyPushed);
            const delCount = store.selected.length;

            editor.drag = null;
            editor.activeGuides = [];
            editor.snappedPort = null;
            editor.rotateFeedback = null;
            editor.scaleFeedback = null;
            drawerEl.classList.remove('is-drop-delete');
            stageEl.classList.remove('is-panning');
            try { svgEl.releasePointerCapture(e.pointerId); } catch (_) {}

            if (wasRightClickMenu) {
                openContextMenu(e.clientX, e.clientY, rightClickHitEl);
                return;
            }

            if (shouldDelete) {
                store.deleteSelected(historyPushed);
                ctx.renderScene();
                ctx.renderInspector();
                notify(delCount > 1 ? `${delCount} éléments supprimés.` : 'Élément supprimé.');
            } else {
                if (wasMarquee) ctx.renderInspector();
                ctx.renderOverlay();
            }
        }
    });

    svgEl.addEventListener('dblclick', (e) => {
        let labelEl = e.target.closest('[data-kind="label"][data-id]');
        if (!labelEl && typeof document.elementsFromPoint === 'function') {
            for (const node of document.elementsFromPoint(e.clientX, e.clientY)) {
                const found = node.closest?.('[data-kind="label"][data-id]');
                if (found) { labelEl = found; break; }
            }
        }
        if (labelEl) {
            e.preventDefault();
            store.selection = { kind: 'label', id: labelEl.dataset.id };
            ctx.renderOverlay();
            ctx.renderInspector();
            const lbl = store.getSelectedElement();
            if (lbl && !lbl.locked) openInlineLabelEditor(lbl);
            return;
        }

        const handleEl = e.target.closest('[data-handle="item-rotate"]');
        if (!handleEl || store.selection?.kind !== 'item') return;
        const item = store.getSelectedElement();
        if (item) ctx.rotateItemBy(item, 0);
    });

    svgEl.addEventListener('wheel', (e) => {
        e.preventDefault();
        closeContextMenu();
        closeInlineLabelEditor();
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        ctx.zoomAt(factor, e.clientX, e.clientY);
    }, { passive: false });

    // =========================================================================
    // RACCOURCIS CLAVIER GLOBAUX
    // =========================================================================
    window.addEventListener('keydown', (e) => {
        if (document.querySelector('.modal.is-active')) return;

        const isAltGr = Boolean(e.getModifierState && e.getModifierState('AltGraph'));
        const isCtrlOrCmd = (e.ctrlKey || e.metaKey) && !isAltGr;
        const isAlt = e.altKey && !isAltGr;

        if (isCtrlOrCmd && !isAlt) {
            const lower = e.key.toLowerCase();
            if (lower === 'n') {
                e.preventDefault();
                ctx.handleNewScene();
                return;
            }
            if (lower === 's') {
                e.preventDefault();
                ctx.handleSaveJSON();
                return;
            }
            if (lower === 'o') {
                e.preventDefault();
                ctx.triggerLoadJSON();
                return;
            }
            if (lower === 'p') {
                e.preventDefault();
                ctx.openExportModal?.('print');
                return;
            }
        }

        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        if (e.code === 'Space') {
            e.preventDefault();
            editor.spaceDown = true;
            stageEl.classList.add('is-panning');
            return;
        }

        if (e.key === 'Escape') {
            closeContextMenu();
            if (editor.pendingConnector) {
                // Annuler d'abord le tracé en cours tout en restant dans l'outil Fil/Tuyau
                editor.pendingConnector = null;
                ctx.renderOverlay();
                return;
            }
            ctx.setTool('select');
            store.selection = null;
            ctx.renderInspector();
            ctx.renderOverlay();
            return;
        }

        if (isCtrlOrCmd && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (e.shiftKey) { if (store.redo()) { ctx.renderScene(); ctx.renderInspector(); } }
            else { if (store.undo()) { ctx.renderScene(); ctx.renderInspector(); } }
            return;
        }
        if (isCtrlOrCmd && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            if (store.redo()) { ctx.renderScene(); ctx.renderInspector(); }
            return;
        }
        if (isCtrlOrCmd && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            store.selectAll();
            ctx.renderOverlay();
            ctx.renderInspector();
            return;
        }
        if (isCtrlOrCmd && e.key.toLowerCase() === 'c') {
            if (store.selected.length > 0) {
                e.preventDefault();
                handleCopySelection();
            }
            return;
        }
        if (isCtrlOrCmd && e.key.toLowerCase() === 'x') {
            if (store.selected.length > 0) {
                e.preventDefault();
                handleCutSelection();
            }
            return;
        }
        if (isCtrlOrCmd && e.key.toLowerCase() === 'v') {
            if (store.hasClipboard()) {
                e.preventDefault();
                handlePasteSelection();
            }
            return;
        }
        if (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'l') {
            if (store.selected.length > 0) {
                e.preventDefault();
                handleToggleLock();
            }
            return;
        }
        if (isCtrlOrCmd && e.key.toLowerCase() === 'g') {
            e.preventDefault();
            if (e.shiftKey) handleUngroupSelected();
            else handleGroupSelected();
            return;
        }
        if (isCtrlOrCmd && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            if (store.duplicateSelected()) { ctx.renderScene(); ctx.renderInspector(); }
            return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (store.deleteSelected()) {
                e.preventDefault();
                ctx.renderScene();
                ctx.renderInspector();
            }
            return;
        }

        if (!isAlt) {
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                const r = svgEl.getBoundingClientRect();
                ctx.zoomAt(1.2, r.left + r.width / 2, r.top + r.height / 2);
                return;
            }
            if (e.key === '-') {
                e.preventDefault();
                const r = svgEl.getBoundingClientRect();
                ctx.zoomAt(1 / 1.2, r.left + r.width / 2, r.top + r.height / 2);
                return;
            }
            if (e.key === '0') {
                e.preventDefault();
                ctx.fitViewToScene();
                return;
            }
        }

        if (isCtrlOrCmd || isAlt) return;

        const k = e.key.toLowerCase();
        if (k === 'v') ctx.setTool('select');
        else if (k === 'h') ctx.setTool('pan');
        else if (k === 'w') ctx.setTool('wire');
        else if (k === 't') ctx.setTool('hose');
        else if (k === 'l') ctx.setTool('label');
        else if (k === 'm') btnToggleSnap.click();
        else if (k === 'g') btnToggleGrid.click();
        else if (k === 'i') document.getElementById('btnToggleInspector')?.click();
        else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && store.selected.length > 0) {
            const entries = store.getSelectedElements();
            const movable = entries.filter(en => !en.el.locked && (en.kind === 'item' || en.kind === 'label' || (en.kind === 'connector' && (!en.el.start.itemId || !en.el.end.itemId))));
            if (movable.length === 0) return;
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const dx = e.key === 'ArrowLeft' ? -step : (e.key === 'ArrowRight' ? step : 0);
            const dy = e.key === 'ArrowUp' ? -step : (e.key === 'ArrowDown' ? step : 0);
            store.pushHistory();
            for (const { kind, el } of movable) {
                if (kind === 'item') {
                    el.x += dx;
                    el.y += dy;
                } else if (kind === 'label') {
                    el.x += dx;
                    el.y += dy;
                    el.targetX += dx;
                    el.targetY += dy;
                } else if (kind === 'connector') {
                    if (!el.start.itemId) { el.start.x += dx; el.start.y += dy; }
                    if (!el.end.itemId) { el.end.x += dx; el.end.y += dy; }
                }
            }
            ctx.renderScene();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            editor.spaceDown = false;
            if (!editor.drag) stageEl.classList.remove('is-panning');
        }
    });

    return {
        closeContextMenu,
        closeInlineLabelEditor,
        openInlineLabelEditor,
        handleCopySelection,
        handleCutSelection,
        handlePasteSelection
    };
}
