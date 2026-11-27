// Gestion de l'état de la scène, historique (Undo/Redo) et sérialisation JSON
import { getCatalogItem } from './catalog.js';
import { getWorldAnchorById } from './snapping.js';

let idCounter = 1;
export function nextId(prefix = 'el') {
    return `${prefix}_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;
}

export function createInitialScene() {
    return {
        version: 1,
        title: '',       // Nom personnalisable du schéma (utilisé pour les exports)
        items: [],       // Objets du catalogue { id, type, x, y, rotation, scale, flipX, props }
        connectors: [],  // Fils électriques & tuyaux { id, kind: 'wire'|'hose', start, end, mode, bend, color, width, dashed, showArrow, reverseArrow }
        labels: []       // Légendes { id, text, x, y, fontSize, color, bold, italic, showLeader, targetX, targetY, arrowHead }
    };
}

/**
 * Transforme un titre de schéma en nom de fichier sûr (sans extension).
 */
export function sanitizeFilename(title, fallback = 'schema-phyweb') {
    const raw = String(title ?? '').trim();
    if (!raw) return fallback;
    const cleaned = raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, ' ')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^[-.]+|[-.]+$/g, '');
    return cleaned || fallback;
}

export class SceneStore {
    constructor() {
        this.scene = createInitialScene();
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistory = 60;
        this.selected = []; // Liste d'éléments sélectionnés : { kind: 'item'|'connector'|'label', id: string }[]
        this.clipboard = null;
        this.pasteCount = 0;
    }

    get selection() {
        return this.selected.length > 0 ? this.selected[this.selected.length - 1] : null;
    }

    set selection(val) {
        this.selected = val ? [{ kind: val.kind, id: val.id }] : [];
    }

    isSelected(kind, id) {
        return this.selected.some(s => s.kind === kind && s.id === id);
    }

    setSelection(list) {
        const seen = new Set();
        this.selected = [];
        for (const s of list || []) {
            if (!s || !s.kind || !s.id) continue;
            const k = `${s.kind}:${s.id}`;
            if (seen.has(k)) continue;
            seen.add(k);
            this.selected.push({ kind: s.kind, id: s.id });
        }
    }

    toggleSelection(kind, id) {
        const idx = this.selected.findIndex(s => s.kind === kind && s.id === id);
        if (idx >= 0) {
            this.selected.splice(idx, 1);
        } else {
            this.selected.push({ kind, id });
        }
    }

    selectAll() {
        this.selected = [
            ...this.scene.items.filter(i => !i.locked).map(i => ({ kind: 'item', id: i.id })),
            ...this.scene.connectors.filter(c => !c.locked).map(c => ({ kind: 'connector', id: c.id })),
            ...this.scene.labels.filter(l => !l.locked).map(l => ({ kind: 'label', id: l.id }))
        ];
    }

    toggleLockSelected() {
        const entries = this.getSelectedElements();
        if (entries.length === 0) return null;
        const allLocked = entries.every(e => Boolean(e.el.locked));
        const nextLocked = !allLocked;
        this.pushHistory();
        for (const { el } of entries) {
            el.locked = nextLocked;
        }
        return nextLocked;
    }

    getGroupMembers(groupId) {
        if (!groupId) return [];
        return [
            ...this.scene.items.filter(i => i.groupId === groupId).map(i => ({ kind: 'item', id: i.id })),
            ...this.scene.connectors.filter(c => c.groupId === groupId).map(c => ({ kind: 'connector', id: c.id })),
            ...this.scene.labels.filter(l => l.groupId === groupId).map(l => ({ kind: 'label', id: l.id }))
        ];
    }

    selectWithGroup(kind, id) {
        const el = this._findElement(kind, id);
        if (!el) return;
        if (el.groupId) {
            const members = this.getGroupMembers(el.groupId);
            if (members.length > 0) {
                this.setSelection(members);
                return;
            }
        }
        this.selection = { kind, id };
    }

    toggleSelectionWithGroup(kind, id) {
        const el = this._findElement(kind, id);
        if (!el) return;
        if (el.groupId) {
            const members = this.getGroupMembers(el.groupId);
            const allSelected = members.every(m => this.isSelected(m.kind, m.id));
            if (allSelected) {
                const keys = new Set(members.map(m => `${m.kind}:${m.id}`));
                this.selected = this.selected.filter(s => !keys.has(`${s.kind}:${s.id}`));
            } else {
                this.setSelection([...this.selected, ...members]);
            }
            return;
        }
        this.toggleSelection(kind, id);
    }

    groupSelected() {
        const entries = this.getSelectedElements();
        if (entries.length < 2) return null;
        this.pushHistory();
        const gid = nextId('grp');
        for (const { el } of entries) {
            el.groupId = gid;
        }
        this._cleanupOrphanGroups();
        return gid;
    }

    ungroupSelected() {
        const entries = this.getSelectedElements();
        const grouped = entries.filter(e => Boolean(e.el.groupId));
        if (grouped.length === 0) return false;
        this.pushHistory();
        for (const { el } of grouped) {
            delete el.groupId;
        }
        this._cleanupOrphanGroups();
        return true;
    }

    hasGroupedSelection() {
        return this.getSelectedElements().some(e => Boolean(e.el.groupId));
    }

    isSingleGroupSelected() {
        const entries = this.getSelectedElements();
        if (entries.length < 2) return false;
        const gid = entries[0].el.groupId;
        return Boolean(gid) && entries.every(e => e.el.groupId === gid);
    }

    _cleanupOrphanGroups() {
        const counts = new Map();
        const all = [...this.scene.items, ...this.scene.connectors, ...this.scene.labels];
        for (const el of all) {
            if (el.groupId) counts.set(el.groupId, (counts.get(el.groupId) || 0) + 1);
        }
        for (const el of all) {
            if (el.groupId && (counts.get(el.groupId) || 0) < 2) {
                delete el.groupId;
            }
        }
    }

    clearSelection() {
        this.selected = [];
    }

    snapshot() {
        return JSON.stringify(this.scene);
    }

    pushHistory() {
        const snap = this.snapshot();
        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === snap) {
            return;
        }
        this.undoStack.push(snap);
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }

    undo() {
        if (!this.canUndo()) return false;
        this.redoStack.push(this.snapshot());
        this.scene = JSON.parse(this.undoStack.pop());
        this.ensureValidSelection();
        return true;
    }

    redo() {
        if (!this.canRedo()) return false;
        this.undoStack.push(this.snapshot());
        this.scene = JSON.parse(this.redoStack.pop());
        this.ensureValidSelection();
        return true;
    }

    _findElement(kind, id) {
        if (kind === 'item') return this.scene.items.find(i => i.id === id) || null;
        if (kind === 'connector') return this.scene.connectors.find(c => c.id === id) || null;
        if (kind === 'label') return this.scene.labels.find(l => l.id === id) || null;
        return null;
    }

    ensureValidSelection() {
        this.selected = this.selected.filter(s => Boolean(this._findElement(s.kind, s.id)));
    }

    getSelectedElement() {
        const sel = this.selection;
        if (!sel) return null;
        return this._findElement(sel.kind, sel.id);
    }

    getSelectedElements() {
        const out = [];
        for (const s of this.selected) {
            const el = this._findElement(s.kind, s.id);
            if (el) out.push({ kind: s.kind, id: s.id, el });
        }
        return out;
    }

    addItem(typeId, x, y) {
        const def = getCatalogItem(typeId);
        if (!def) return null;
        this.pushHistory();
        const item = {
            id: nextId('obj'),
            type: typeId,
            x: Math.round(x),
            y: Math.round(y),
            rotation: 0,
            scale: 1,
            flipX: false,
            props: JSON.parse(JSON.stringify(def.defaultProps || {}))
        };
        if (def.insertAtBack) {
            this.scene.items.unshift(item);
        } else {
            this.scene.items.push(item);
        }
        this.selection = { kind: 'item', id: item.id };
        return item;
    }

    addConnector(kind, start, end, defaults = {}) {
        this.pushHistory();
        const isWire = kind === 'wire';
        const isAttached = Boolean((start?.itemId && start?.anchorId) || (end?.itemId && end?.anchorId));
        const mode = defaults.mode || 'bezier';
        const conn = {
            id: nextId(isWire ? 'wire' : 'hose'),
            kind,
            start: { ...start }, // { x, y, itemId?, anchorId? }
            end: { ...end },
            mode,                // 'bezier' | 'orthogonal' | 'straight'
            bend: mode === 'straight' ? 0 : (isAttached ? 0 : (isWire ? 40 : 30)),
            bendX: 0,
            color: defaults.color || (isWire ? '#e03131' : '#74c0fc'),
            width: Number(defaults.width) || (isWire ? 3.5 : 8),
            dashed: Boolean(defaults.dashed),
            showArrow: defaults.showArrow !== undefined ? Boolean(defaults.showArrow) : !isWire,
            reverseArrow: false,
            behindItems: Boolean(defaults.behindItems)
        };
        this.scene.connectors.push(conn);
        this.selection = { kind: 'connector', id: conn.id };
        return conn;
    }

    addLabel(x, y, text = 'Légende', targetX = null, targetY = null, defaults = {}) {
        this.pushHistory();
        const lbl = {
            id: nextId('lbl'),
            text,
            x: Math.round(x),
            y: Math.round(y),
            fontSize: Number(defaults.fontSize) || 20,
            color: defaults.color || '#1e293b',
            bold: Boolean(defaults.bold),
            italic: Boolean(defaults.italic),
            align: defaults.align === 'center' || defaults.align === 'right' ? defaults.align : 'left',
            bgEnabled: Boolean(defaults.bgEnabled),
            bgColor: defaults.bgColor || '#ffffff',
            borderEnabled: Boolean(defaults.borderEnabled),
            showLeader: targetX !== null && targetY !== null,
            leaderStyle: defaults.leaderStyle === 'elbow' ? 'elbow' : 'straight',
            targetX: targetX !== null ? Math.round(targetX) : Math.round(x - 60),
            targetY: targetY !== null ? Math.round(targetY) : Math.round(y + 35),
            arrowHead: defaults.arrowHead !== undefined ? Boolean(defaults.arrowHead) : true
        };
        this.scene.labels.push(lbl);
        this.selection = { kind: 'label', id: lbl.id };
        return lbl;
    }

    deleteSelected(skipHistory = false) {
        if (this.selected.length === 0) return false;
        const deletable = this.getSelectedElements().filter(e => !e.el.locked);
        if (deletable.length === 0) return false;
        if (!skipHistory) this.pushHistory();

        const itemIds = new Set(deletable.filter(s => s.kind === 'item').map(s => s.id));
        const connIds = new Set(deletable.filter(s => s.kind === 'connector').map(s => s.id));
        const lblIds = new Set(deletable.filter(s => s.kind === 'label').map(s => s.id));

        if (itemIds.size > 0) {
            // Détacher les connecteurs conservés qui étaient reliés aux objets supprimés
            for (const c of this.scene.connectors) {
                if (connIds.has(c.id)) continue;
                const ep = resolveConnectorEndpoints(c, this.scene.items);
                if (c.start.itemId && itemIds.has(c.start.itemId)) {
                    c.start = { x: ep.p1.x, y: ep.p1.y };
                }
                if (c.end.itemId && itemIds.has(c.end.itemId)) {
                    c.end = { x: ep.p2.x, y: ep.p2.y };
                }
            }
            this.scene.items = this.scene.items.filter(i => !itemIds.has(i.id));
        }
        if (connIds.size > 0) {
            this.scene.connectors = this.scene.connectors.filter(c => !connIds.has(c.id));
        }
        if (lblIds.size > 0) {
            this.scene.labels = this.scene.labels.filter(l => !lblIds.has(l.id));
        }
        this._cleanupOrphanGroups();
        this.ensureValidSelection();
        return true;
    }

    duplicateSelected() {
        const entries = this.getSelectedElements();
        if (entries.length === 0) return null;
        this.pushHistory();

        const newSelection = [];
        const itemIdMap = new Map();
        const groupIdMap = new Map();
        const remapGroup = (gid) => {
            if (!gid) return undefined;
            if (!groupIdMap.has(gid)) groupIdMap.set(gid, nextId('grp'));
            return groupIdMap.get(gid);
        };
        const created = [];

        // 1. Dupliquer d'abord les objets pour pouvoir remapper les connecteurs internes
        for (const { kind, el } of entries) {
            if (kind !== 'item') continue;
            const copy = JSON.parse(JSON.stringify(el));
            copy.id = nextId('obj');
            copy.locked = false;
            if (copy.groupId) copy.groupId = remapGroup(copy.groupId);
            copy.x += 30;
            copy.y += 30;
            const def = getCatalogItem(copy.type);
            if (def?.insertAtBack) this.scene.items.unshift(copy);
            else this.scene.items.push(copy);
            itemIdMap.set(el.id, copy.id);
            newSelection.push({ kind: 'item', id: copy.id });
            created.push(copy);
        }

        // 2. Dupliquer les connecteurs (en conservant les liaisons entre objets dupliqués)
        for (const { kind, el } of entries) {
            if (kind !== 'connector') continue;
            const copy = JSON.parse(JSON.stringify(el));
            copy.id = nextId(el.kind === 'wire' ? 'wire' : 'hose');
            copy.locked = false;
            if (copy.groupId) copy.groupId = remapGroup(copy.groupId);
            const ep = resolveConnectorEndpoints(el, this.scene.items);
            if (el.start.itemId && itemIdMap.has(el.start.itemId)) {
                copy.start = { ...el.start, itemId: itemIdMap.get(el.start.itemId), x: ep.p1.x + 30, y: ep.p1.y + 30 };
            } else {
                copy.start = { x: ep.p1.x + 30, y: ep.p1.y + 30 };
            }
            if (el.end.itemId && itemIdMap.has(el.end.itemId)) {
                copy.end = { ...el.end, itemId: itemIdMap.get(el.end.itemId), x: ep.p2.x + 30, y: ep.p2.y + 30 };
            } else {
                copy.end = { x: ep.p2.x + 30, y: ep.p2.y + 30 };
            }
            this.scene.connectors.push(copy);
            newSelection.push({ kind: 'connector', id: copy.id });
            created.push(copy);
        }

        // 3. Dupliquer les légendes
        for (const { kind, el } of entries) {
            if (kind !== 'label') continue;
            const copy = JSON.parse(JSON.stringify(el));
            copy.id = nextId('lbl');
            copy.locked = false;
            if (copy.groupId) copy.groupId = remapGroup(copy.groupId);
            copy.x += 30;
            copy.y += 30;
            copy.targetX += 30;
            copy.targetY += 30;
            this.scene.labels.push(copy);
            newSelection.push({ kind: 'label', id: copy.id });
            created.push(copy);
        }

        this._cleanupOrphanGroups();
        this.selected = newSelection;
        return created.length === 1 ? created[0] : created;
    }

    hasClipboard() {
        return Boolean(
            this.clipboard &&
            (this.clipboard.items.length > 0 ||
                this.clipboard.connectors.length > 0 ||
                this.clipboard.labels.length > 0)
        );
    }

    _copyEntries(entries) {
        const items = [];
        const connectors = [];
        const labels = [];

        for (const { kind, el } of entries) {
            if (kind === 'item') {
                items.push(JSON.parse(JSON.stringify(el)));
            } else if (kind === 'connector') {
                const ep = resolveConnectorEndpoints(el, this.scene.items);
                connectors.push({
                    data: JSON.parse(JSON.stringify(el)),
                    resolvedP1: { x: ep.p1.x, y: ep.p1.y },
                    resolvedP2: { x: ep.p2.x, y: ep.p2.y }
                });
            } else if (kind === 'label') {
                labels.push(JSON.parse(JSON.stringify(el)));
            }
        }

        this.clipboard = { items, connectors, labels };
        this.pasteCount = 0;
        return entries.length;
    }

    copySelected() {
        const entries = this.getSelectedElements();
        if (entries.length === 0) return 0;
        return this._copyEntries(entries);
    }

    cutSelected() {
        const cuttable = this.getSelectedElements().filter(e => !e.el.locked);
        if (cuttable.length === 0) return 0;
        this._copyEntries(cuttable);
        this.deleteSelected();
        return cuttable.length;
    }

    pasteClipboard(options = {}) {
        if (!this.hasClipboard()) return null;
        this.pushHistory();

        let dx = 0;
        let dy = 0;
        if (options.atPoint && Number.isFinite(options.atPoint.x) && Number.isFinite(options.atPoint.y)) {
            const xs = [];
            const ys = [];
            for (const it of this.clipboard.items) { xs.push(it.x); ys.push(it.y); }
            for (const l of this.clipboard.labels) { xs.push(l.x); ys.push(l.y); }
            for (const c of this.clipboard.connectors) {
                xs.push((c.resolvedP1.x + c.resolvedP2.x) / 2);
                ys.push((c.resolvedP1.y + c.resolvedP2.y) / 2);
            }
            if (xs.length > 0) {
                const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
                const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
                dx = Math.round(options.atPoint.x - cx);
                dy = Math.round(options.atPoint.y - cy);
            }
            this.pasteCount = 0;
        } else {
            const step = Number(options.offsetStep) || 24;
            this.pasteCount += 1;
            dx = step * this.pasteCount;
            dy = step * this.pasteCount;
        }

        const newSelection = [];
        const itemIdMap = new Map();
        const groupIdMap = new Map();
        const remapGroup = (gid) => {
            if (!gid) return undefined;
            if (!groupIdMap.has(gid)) groupIdMap.set(gid, nextId('grp'));
            return groupIdMap.get(gid);
        };
        const created = [];

        for (const src of this.clipboard.items) {
            const copy = JSON.parse(JSON.stringify(src));
            copy.id = nextId('obj');
            copy.locked = false;
            if (copy.groupId) copy.groupId = remapGroup(copy.groupId);
            copy.x = Math.round(copy.x + dx);
            copy.y = Math.round(copy.y + dy);
            const def = getCatalogItem(copy.type);
            if (def?.insertAtBack) this.scene.items.unshift(copy);
            else this.scene.items.push(copy);
            itemIdMap.set(src.id, copy.id);
            newSelection.push({ kind: 'item', id: copy.id });
            created.push(copy);
        }

        for (const { data, resolvedP1, resolvedP2 } of this.clipboard.connectors) {
            const copy = JSON.parse(JSON.stringify(data));
            copy.id = nextId(copy.kind === 'wire' ? 'wire' : 'hose');
            copy.locked = false;
            if (copy.groupId) copy.groupId = remapGroup(copy.groupId);
            if (data.start.itemId && itemIdMap.has(data.start.itemId)) {
                copy.start = {
                    ...data.start,
                    itemId: itemIdMap.get(data.start.itemId),
                    x: Math.round(resolvedP1.x + dx),
                    y: Math.round(resolvedP1.y + dy)
                };
            } else {
                copy.start = { x: Math.round(resolvedP1.x + dx), y: Math.round(resolvedP1.y + dy) };
            }
            if (data.end.itemId && itemIdMap.has(data.end.itemId)) {
                copy.end = {
                    ...data.end,
                    itemId: itemIdMap.get(data.end.itemId),
                    x: Math.round(resolvedP2.x + dx),
                    y: Math.round(resolvedP2.y + dy)
                };
            } else {
                copy.end = { x: Math.round(resolvedP2.x + dx), y: Math.round(resolvedP2.y + dy) };
            }
            this.scene.connectors.push(copy);
            newSelection.push({ kind: 'connector', id: copy.id });
            created.push(copy);
        }

        for (const src of this.clipboard.labels) {
            const copy = JSON.parse(JSON.stringify(src));
            copy.id = nextId('lbl');
            copy.locked = false;
            if (copy.groupId) copy.groupId = remapGroup(copy.groupId);
            copy.x = Math.round(copy.x + dx);
            copy.y = Math.round(copy.y + dy);
            copy.targetX = Math.round(copy.targetX + dx);
            copy.targetY = Math.round(copy.targetY + dy);
            this.scene.labels.push(copy);
            newSelection.push({ kind: 'label', id: copy.id });
            created.push(copy);
        }

        this._cleanupOrphanGroups();
        this.selected = newSelection;
        return created;
    }

    moveItemZOrder(id, direction) {
        const idx = this.scene.items.findIndex(i => i.id === id);
        if (idx === -1) return false;
        const arr = this.scene.items;
        let newIdx = idx;
        if (direction === 'front') newIdx = arr.length - 1;
        else if (direction === 'back') newIdx = 0;
        else if (direction === 'forward') newIdx = Math.min(arr.length - 1, idx + 1);
        else if (direction === 'backward') newIdx = Math.max(0, idx - 1);

        if (newIdx === idx) return false;
        this.pushHistory();
        const [item] = arr.splice(idx, 1);
        arr.splice(newIdx, 0, item);
        return true;
    }

    clearAll() {
        if (
            this.scene.items.length === 0 &&
            this.scene.connectors.length === 0 &&
            this.scene.labels.length === 0
        ) {
            return false;
        }
        this.pushHistory();
        const prevTitle = this.scene.title || '';
        this.scene = createInitialScene();
        this.scene.title = prevTitle;
        this.selection = null;
        return true;
    }

    resetNew() {
        this.scene = createInitialScene();
        this.undoStack = [];
        this.redoStack = [];
        this.selected = [];
        return true;
    }

    exportJSON() {
        return JSON.stringify({
            app: 'PhyWeb-Schemas',
            version: 1,
            ...this.scene
        }, null, 2);
    }

    importJSON(jsonString, fallbackTitle = '') {
        const cleanStr = typeof jsonString === 'string' && jsonString.charCodeAt(0) === 0xFEFF
            ? jsonString.slice(1)
            : jsonString;
        const parsed = typeof cleanStr === 'string' ? JSON.parse(cleanStr) : cleanStr;
        if (!parsed || !Array.isArray(parsed.items)) {
            throw new Error('Format de fichier .pws / JSON invalide.');
        }
        const sanitizeItems = (arr) => (Array.isArray(arr) ? arr : [])
            .filter(it => it && typeof it === 'object' && typeof it.type === 'string')
            .map(it => ({
                ...it,
                id: typeof it.id === 'string' && it.id ? it.id : nextId('obj'),
                x: Number.isFinite(Number(it.x)) ? Number(it.x) : 0,
                y: Number.isFinite(Number(it.y)) ? Number(it.y) : 0,
                rotation: Number.isFinite(Number(it.rotation)) ? Number(it.rotation) : 0,
                scale: Number.isFinite(Number(it.scale)) && Number(it.scale) > 0 ? Number(it.scale) : 1,
                props: it.props && typeof it.props === 'object' ? it.props : {}
            }));
        const sanitizeEndpoint = (ep) => {
            if (!ep || typeof ep !== 'object') return null;
            const out = {
                x: Number.isFinite(Number(ep.x)) ? Number(ep.x) : 0,
                y: Number.isFinite(Number(ep.y)) ? Number(ep.y) : 0
            };
            if (typeof ep.itemId === 'string' && ep.itemId && typeof ep.anchorId === 'string' && ep.anchorId) {
                out.itemId = ep.itemId;
                out.anchorId = ep.anchorId;
            }
            return out;
        };
        const sanitizeConnectors = (arr) => (Array.isArray(arr) ? arr : [])
            .filter(c => c && typeof c === 'object' && c.start && c.end)
            .map(c => ({
                ...c,
                id: typeof c.id === 'string' && c.id ? c.id : nextId(c.kind === 'hose' ? 'hose' : 'wire'),
                kind: c.kind === 'hose' ? 'hose' : 'wire',
                start: sanitizeEndpoint(c.start),
                end: sanitizeEndpoint(c.end)
            }))
            .filter(c => c.start && c.end);
        const sanitizeLabels = (arr) => (Array.isArray(arr) ? arr : [])
            .filter(l => l && typeof l === 'object')
            .map(l => {
                const lx = Number.isFinite(Number(l.x)) ? Number(l.x) : 0;
                const ly = Number.isFinite(Number(l.y)) ? Number(l.y) : 0;
                return {
                    ...l,
                    id: typeof l.id === 'string' && l.id ? l.id : nextId('lbl'),
                    text: String(l.text ?? ''),
                    x: lx,
                    y: ly,
                    targetX: Number.isFinite(Number(l.targetX)) ? Number(l.targetX) : lx - 60,
                    targetY: Number.isFinite(Number(l.targetY)) ? Number(l.targetY) : ly + 35
                };
            });

        this.pushHistory();
        this.scene = {
            version: 1,
            title: typeof parsed.title === 'string' && parsed.title.trim()
                ? parsed.title.trim()
                : String(fallbackTitle || '').trim(),
            items: sanitizeItems(parsed.items),
            connectors: sanitizeConnectors(parsed.connectors),
            labels: sanitizeLabels(parsed.labels)
        };
        this.selection = null;
        return true;
    }
}

/**
 * Résout les coordonnées monde réelles (p1, p2) d'un connecteur,
 * en suivant dynamiquement les objets auxquels il est attaché.
 */
export function resolveConnectorEndpoints(conn, items) {
    const start = conn?.start || { x: 0, y: 0 };
    const end = conn?.end || { x: 0, y: 0 };
    let p1 = { x: Number(start.x) || 0, y: Number(start.y) || 0, angle: null };
    let p2 = { x: Number(end.x) || 0, y: Number(end.y) || 0, angle: null };

    if (start.itemId && start.anchorId) {
        const it = items.find(i => i.id === start.itemId);
        if (it) {
            const a = getWorldAnchorById(it, start.anchorId);
            if (a) p1 = { x: a.wx, y: a.wy, angle: a.worldAngle ?? null };
        }
    }
    if (end.itemId && end.anchorId) {
        const it = items.find(i => i.id === end.itemId);
        if (it) {
            const a = getWorldAnchorById(it, end.anchorId);
            if (a) p2 = { x: a.wx, y: a.wy, angle: a.worldAngle ?? null };
        }
    }
    return { p1, p2 };
}
