// Contrôleur du drawer inférieur (banque d'objets, recherche, drag-and-drop vers le canvas)
import { CATALOG, CATEGORIES, getCatalogItem } from '../catalog.js';
import { computeObjectSnap } from '../snapping.js';

export function createDrawerController(ctx) {
    const { store, editor, dom, escHtml } = ctx;
    const { stageEl, drawerEl, drawerTabsEl, drawerGridEl, drawerSearchEl } = dom;

    let drawerDrag = null;
    let suppressDrawerClick = false;

    function isOverStage(clientX, clientY) {
        const r = stageEl.getBoundingClientRect();
        return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    }

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

    function startDrawerDragListeners(btn, typeId, e) {
        const def = getCatalogItem(typeId);
        if (!def) return;
        const bb = def.getBBox(def.defaultProps || {});
        const centerOffsetX = bb.x + bb.width / 2;
        const centerOffsetY = bb.y + bb.height / 2;

        drawerDrag = {
            typeId,
            startClientX: e.clientX,
            startClientY: e.clientY,
            active: false,
            item: null,
            ghostEl: null,
            centerOffsetX,
            centerOffsetY
        };

        const onMove = (ev) => {
            if (!drawerDrag) return;
            const dist = Math.hypot(ev.clientX - drawerDrag.startClientX, ev.clientY - drawerDrag.startClientY);
            if (!drawerDrag.active) {
                if (dist < 6) return;
                drawerDrag.active = true;
                suppressDrawerClick = true;
                document.body.classList.add('is-dragging-from-drawer');
                const ghost = document.createElement('div');
                ghost.className = 'drawer-drag-ghost';
                ghost.innerHTML = btn.innerHTML;
                document.body.appendChild(ghost);
                drawerDrag.ghostEl = ghost;
            }

            const overStage = isOverStage(ev.clientX, ev.clientY);
            if (overStage) {
                if (drawerDrag.ghostEl) drawerDrag.ghostEl.style.display = 'none';
                const pt = ctx.clientToScene(ev.clientX, ev.clientY);
                const rawX = pt.x - drawerDrag.centerOffsetX;
                const rawY = pt.y - drawerDrag.centerOffsetY;

                if (!drawerDrag.item) {
                    drawerDrag.item = store.addItem(drawerDrag.typeId, rawX, rawY);
                    ctx.setTool('select');
                }
                if (drawerDrag.item) {
                    const snap = computeObjectSnap(drawerDrag.item, rawX, rawY, store.scene.items, {
                        snapEnabled: editor.snapEnabled && !ev.altKey,
                        gridSize: editor.gridSize,
                        snapToGrid: editor.showGrid,
                        baseRotation: 0
                    });
                    drawerDrag.item.x = Math.round(snap.x);
                    drawerDrag.item.y = Math.round(snap.y);
                    drawerDrag.item.rotation = snap.rotation;
                    editor.activeGuides = snap.guides;
                    editor.snappedPort = snap.snappedPort;
                    ctx.renderScene();
                }
            } else {
                if (drawerDrag.ghostEl) {
                    drawerDrag.ghostEl.style.display = 'flex';
                    drawerDrag.ghostEl.style.left = `${ev.clientX}px`;
                    drawerDrag.ghostEl.style.top = `${ev.clientY}px`;
                }
                editor.activeGuides = [];
                editor.snappedPort = null;
                if (drawerDrag.item) {
                    ctx.renderOverlay();
                }
            }
        };

        const onEnd = (ev) => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onEnd);
            window.removeEventListener('pointercancel', onEnd);
            document.body.classList.remove('is-dragging-from-drawer');

            const drag = drawerDrag;
            drawerDrag = null;
            if (!drag) return;

            if (drag.ghostEl) drag.ghostEl.remove();
            editor.activeGuides = [];
            editor.snappedPort = null;

            if (drag.active) {
                const droppedOnStage = ev.type !== 'pointercancel' && isOverStage(ev.clientX, ev.clientY);
                if (drag.item && !droppedOnStage) {
                    // Annuler proprement l'ajout si l'objet est relâché hors de la zone de dessin
                    store.undo();
                    store.redoStack = [];
                }
                ctx.renderScene();
                ctx.renderInspector();
                setTimeout(() => { suppressDrawerClick = false; }, 0);
            }
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onEnd);
        window.addEventListener('pointercancel', onEnd);
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
            drawerGridEl.innerHTML = `<span class="has-text-grey is-size-7 ml-2">Aucun objet trouvé pour « ${escHtml(editor.searchQuery)} ».</span>`;
            return;
        }

        drawerGridEl.innerHTML = list.map(def => {
            const bb = def.getBBox(def.defaultProps || {});
            const pad = 10;
            const vb = `${bb.x - pad} ${bb.y - pad} ${bb.width + pad * 2} ${bb.height + pad * 2}`;
            const thumbSvg = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${def.render(def.defaultProps || {}, 'thumb_' + def.id)}</svg>`;
            return `
              <button class="drawer-card" data-add-type="${def.id}" title="Cliquer ou glisser sur le schéma : ${def.name}">
                <div class="drawer-card-thumb">${thumbSvg}</div>
                <div class="drawer-card-name">${def.name}</div>
              </button>
            `;
        }).join('');

        drawerGridEl.querySelectorAll('[data-add-type]').forEach(btn => {
            btn.addEventListener('pointerdown', (e) => {
                if (e.button !== 0) return;
                startDrawerDragListeners(btn, btn.dataset.addType, e);
            });
            btn.addEventListener('click', () => {
                if (suppressDrawerClick) return;
                const typeId = btn.dataset.addType;
                const center = ctx.getViewportCenterScene();
                // Léger décalage aligné sur la grille si plusieurs objets sont ajoutés au même endroit
                const g = editor.gridSize || 10;
                const jitter = ((store.scene.items.length % 5) - 2) * g * 2;
                const sx = Math.round((center.x + jitter) / g) * g;
                const sy = Math.round((center.y + 40) / g) * g;
                store.addItem(typeId, sx, sy);
                ctx.setTool('select');
                ctx.renderScene();
                ctx.renderInspector();
            });
        });
    }

    // Convertir la molette verticale en défilement horizontal sur la grille et les onglets du drawer
    const enableHorizontalWheel = (el) => {
        if (!el) return;
        el.addEventListener('wheel', (e) => {
            if (el.scrollWidth <= el.clientWidth) return;
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    };
    enableHorizontalWheel(drawerGridEl);
    enableHorizontalWheel(drawerTabsEl);

    // Bouton replier/déplier & recherche
    document.getElementById('btnToggleDrawer')?.addEventListener('click', () => {
        drawerEl.classList.toggle('is-collapsed');
    });

    const btnClearSearch = document.getElementById('btnClearSearch');
    drawerSearchEl.addEventListener('input', () => {
        editor.searchQuery = drawerSearchEl.value;
        if (btnClearSearch) btnClearSearch.hidden = !drawerSearchEl.value;
        if (drawerEl.classList.contains('is-collapsed')) {
            drawerEl.classList.remove('is-collapsed');
        }
        buildDrawerGrid();
    });

    if (btnClearSearch) {
        btnClearSearch.addEventListener('click', () => {
            drawerSearchEl.value = '';
            editor.searchQuery = '';
            btnClearSearch.hidden = true;
            buildDrawerGrid();
            drawerSearchEl.focus();
        });
    }

    document.getElementById('btnOpenShapes')?.addEventListener('click', () => {
        editor.activeCategory = 'formes';
        if (editor.searchQuery) {
            drawerSearchEl.value = '';
            editor.searchQuery = '';
            if (btnClearSearch) btnClearSearch.hidden = true;
        }
        drawerEl.classList.remove('is-collapsed');
        buildDrawerTabs();
        buildDrawerGrid();
    });

    return {
        buildDrawerTabs,
        buildDrawerGrid
    };
}
