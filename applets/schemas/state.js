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
            ...this.scene.items.map(i => ({ kind: 'item', id: i.id })),
            ...this.scene.connectors.map(c => ({ kind: 'connector', id: c.id })),
            ...this.scene.labels.map(l => ({ kind: 'label', id: l.id }))
        ];
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

    addLabel(x, y, text = 'Légende', targetX = null, targetY = null) {
        this.pushHistory();
        const lbl = {
            id: nextId('lbl'),
            text,
            x: Math.round(x),
            y: Math.round(y),
            fontSize: 16,
            color: '#1e293b',
            bold: false,
            italic: false,
            align: 'left',
            bgEnabled: false,
            bgColor: '#ffffff',
            borderEnabled: false,
            showLeader: targetX !== null && targetY !== null,
            leaderStyle: 'straight',
            targetX: targetX !== null ? Math.round(targetX) : Math.round(x - 60),
            targetY: targetY !== null ? Math.round(targetY) : Math.round(y + 35),
            arrowHead: true
        };
        this.scene.labels.push(lbl);
        this.selection = { kind: 'label', id: lbl.id };
        return lbl;
    }

    deleteSelected(skipHistory = false) {
        if (this.selected.length === 0) return false;
        if (!skipHistory) this.pushHistory();

        const itemIds = new Set(this.selected.filter(s => s.kind === 'item').map(s => s.id));
        const connIds = new Set(this.selected.filter(s => s.kind === 'connector').map(s => s.id));
        const lblIds = new Set(this.selected.filter(s => s.kind === 'label').map(s => s.id));

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
        this.selected = [];
        return true;
    }

    duplicateSelected() {
        const entries = this.getSelectedElements();
        if (entries.length === 0) return null;
        this.pushHistory();

        const newSelection = [];
        const itemIdMap = new Map();
        const created = [];

        // 1. Dupliquer d'abord les objets pour pouvoir remapper les connecteurs internes
        for (const { kind, el } of entries) {
            if (kind !== 'item') continue;
            const copy = JSON.parse(JSON.stringify(el));
            copy.id = nextId('obj');
            copy.x += 30;
            copy.y += 30;
            this.scene.items.push(copy);
            itemIdMap.set(el.id, copy.id);
            newSelection.push({ kind: 'item', id: copy.id });
            created.push(copy);
        }

        // 2. Dupliquer les connecteurs (en conservant les liaisons entre objets dupliqués)
        for (const { kind, el } of entries) {
            if (kind !== 'connector') continue;
            const copy = JSON.parse(JSON.stringify(el));
            copy.id = nextId(el.kind === 'wire' ? 'wire' : 'hose');
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
            copy.x += 25;
            copy.y += 25;
            copy.targetX += 25;
            copy.targetY += 25;
            this.scene.labels.push(copy);
            newSelection.push({ kind: 'label', id: copy.id });
            created.push(copy);
        }

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

    copySelected() {
        const entries = this.getSelectedElements();
        if (entries.length === 0) return 0;

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

    cutSelected() {
        const count = this.copySelected();
        if (count === 0) return 0;
        this.deleteSelected();
        return count;
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
        const created = [];

        for (const src of this.clipboard.items) {
            const copy = JSON.parse(JSON.stringify(src));
            copy.id = nextId('obj');
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
            copy.x = Math.round(copy.x + dx);
            copy.y = Math.round(copy.y + dy);
            copy.targetX = Math.round(copy.targetX + dx);
            copy.targetY = Math.round(copy.targetY + dy);
            this.scene.labels.push(copy);
            newSelection.push({ kind: 'label', id: copy.id });
            created.push(copy);
        }

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
        this.pushHistory();
        this.scene = {
            version: 1,
            title: typeof parsed.title === 'string' && parsed.title.trim()
                ? parsed.title.trim()
                : String(fallbackTitle || '').trim(),
            items: parsed.items || [],
            connectors: Array.isArray(parsed.connectors) ? parsed.connectors : [],
            labels: Array.isArray(parsed.labels) ? parsed.labels : []
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
    let p1 = { x: conn.start.x, y: conn.start.y, angle: null };
    let p2 = { x: conn.end.x, y: conn.end.y, angle: null };

    if (conn.start.itemId && conn.start.anchorId) {
        const it = items.find(i => i.id === conn.start.itemId);
        if (it) {
            const a = getWorldAnchorById(it, conn.start.anchorId);
            if (a) p1 = { x: a.wx, y: a.wy, angle: a.worldAngle ?? null };
        }
    }
    if (conn.end.itemId && conn.end.anchorId) {
        const it = items.find(i => i.id === conn.end.itemId);
        if (it) {
            const a = getWorldAnchorById(it, conn.end.anchorId);
            if (a) p2 = { x: a.wx, y: a.wy, angle: a.worldAngle ?? null };
        }
    }
    return { p1, p2 };
}
