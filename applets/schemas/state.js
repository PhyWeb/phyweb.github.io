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
        items: [],       // Objets du catalogue { id, type, x, y, rotation, scale, flipX, props }
        connectors: [],  // Fils électriques & tuyaux { id, kind: 'wire'|'hose', start, end, mode, bend, color, width, dashed, showArrow, reverseArrow }
        labels: []       // Légendes { id, text, x, y, fontSize, color, bold, italic, showLeader, targetX, targetY, arrowHead }
    };
}

export class SceneStore {
    constructor() {
        this.scene = createInitialScene();
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistory = 60;
        this.selection = null; // { kind: 'item'|'connector'|'label', id: string } | null
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

    ensureValidSelection() {
        if (!this.selection) return;
        const el = this.getSelectedElement();
        if (!el) this.selection = null;
    }

    getSelectedElement() {
        if (!this.selection) return null;
        const { kind, id } = this.selection;
        if (kind === 'item') return this.scene.items.find(i => i.id === id) || null;
        if (kind === 'connector') return this.scene.connectors.find(c => c.id === id) || null;
        if (kind === 'label') return this.scene.labels.find(l => l.id === id) || null;
        return null;
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

    addConnector(kind, start, end) {
        this.pushHistory();
        const isWire = kind === 'wire';
        const isAttached = Boolean((start?.itemId && start?.anchorId) || (end?.itemId && end?.anchorId));
        const conn = {
            id: nextId(isWire ? 'wire' : 'hose'),
            kind,
            start: { ...start }, // { x, y, itemId?, anchorId? }
            end: { ...end },
            mode: 'bezier',      // 'bezier' | 'orthogonal'
            bend: isAttached ? 0 : (isWire ? 40 : 30),
            bendX: 0,
            color: isWire ? '#e03131' : '#74c0fc',
            width: isWire ? 3.5 : 8,
            dashed: false,
            showArrow: !isWire,
            reverseArrow: false
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
            showLeader: targetX !== null && targetY !== null,
            targetX: targetX !== null ? Math.round(targetX) : Math.round(x - 60),
            targetY: targetY !== null ? Math.round(targetY) : Math.round(y + 35),
            arrowHead: true
        };
        this.scene.labels.push(lbl);
        this.selection = { kind: 'label', id: lbl.id };
        return lbl;
    }

    deleteSelected(skipHistory = false) {
        if (!this.selection) return false;
        const { kind, id } = this.selection;
        if (!skipHistory) this.pushHistory();
        if (kind === 'item') {
            // Détacher les connecteurs reliés à cet objet en figeant leurs coordonnées courantes
            for (const c of this.scene.connectors) {
                const ep = resolveConnectorEndpoints(c, this.scene.items);
                if (c.start.itemId === id) {
                    c.start = { x: ep.p1.x, y: ep.p1.y };
                }
                if (c.end.itemId === id) {
                    c.end = { x: ep.p2.x, y: ep.p2.y };
                }
            }
            this.scene.items = this.scene.items.filter(i => i.id !== id);
        } else if (kind === 'connector') {
            this.scene.connectors = this.scene.connectors.filter(c => c.id !== id);
        } else if (kind === 'label') {
            this.scene.labels = this.scene.labels.filter(l => l.id !== id);
        }
        this.selection = null;
        return true;
    }

    duplicateSelected() {
        const el = this.getSelectedElement();
        if (!el) return null;
        this.pushHistory();
        const copy = JSON.parse(JSON.stringify(el));
        copy.id = nextId(this.selection.kind === 'item' ? 'obj' : this.selection.kind);
        if (this.selection.kind === 'item') {
            copy.x += 30;
            copy.y += 30;
            this.scene.items.push(copy);
        } else if (this.selection.kind === 'connector') {
            const ep = resolveConnectorEndpoints(el, this.scene.items);
            copy.start = { x: ep.p1.x + 30, y: ep.p1.y + 30 };
            copy.end = { x: ep.p2.x + 30, y: ep.p2.y + 30 };
            this.scene.connectors.push(copy);
        } else if (this.selection.kind === 'label') {
            copy.x += 25;
            copy.y += 25;
            copy.targetX += 25;
            copy.targetY += 25;
            this.scene.labels.push(copy);
        }
        this.selection = { kind: this.selection.kind, id: copy.id };
        return copy;
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
        this.scene = createInitialScene();
        this.selection = null;
        return true;
    }

    exportJSON() {
        return JSON.stringify({
            app: 'PhyWeb-Schemas',
            version: 1,
            ...this.scene
        }, null, 2);
    }

    importJSON(jsonString) {
        const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        if (!parsed || !Array.isArray(parsed.items)) {
            throw new Error('Format de fichier JSON invalide.');
        }
        this.pushHistory();
        this.scene = {
            version: 1,
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
