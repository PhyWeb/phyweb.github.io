// Panneau de propriétés à droite (Inspecteur : Scène, Multi-sélection, Objet, Connecteur, Légende)
import { getCatalogItem } from '../catalog.js';
import { localToWorld, normalizeAngle } from '../snapping.js';

export const LABEL_SYMBOLS = [
    { ch: '₀', title: 'Indice 0' },
    { ch: '₁', title: 'Indice 1' },
    { ch: '₂', title: 'Indice 2' },
    { ch: '₃', title: 'Indice 3' },
    { ch: '₄', title: 'Indice 4' },
    { ch: '₅', title: 'Indice 5' },
    { ch: '₆', title: 'Indice 6' },
    { ch: '₇', title: 'Indice 7' },
    { ch: '₈', title: 'Indice 8' },
    { ch: '₉', title: 'Indice 9' },
    { ch: '⁺', title: 'Charge +' },
    { ch: '⁻', title: 'Charge −' },
    { ch: '²', title: 'Exposant 2' },
    { ch: '³', title: 'Exposant 3' },
    { ch: '⁻¹', title: 'Exposant −1 (ex. mol·L⁻¹)' },
    { ch: '°', title: 'Degré' },
    { ch: '°C', title: 'Degré Celsius' },
    { ch: 'µ', title: 'Micro (µ)' },
    { ch: 'Ω', title: 'Ohm (Ω)' },
    { ch: 'σ', title: 'Conductivité (σ)' },
    { ch: 'λ', title: 'Longueur d’onde (λ)' },
    { ch: 'Δ', title: 'Variation (Δ)' },
    { ch: 'θ', title: 'Angle / Température (θ)' },
    { ch: 'α', title: 'Alpha (α)' },
    { ch: '±', title: 'Plus ou moins (±)' },
    { ch: '≈', title: 'Environ égal (≈)' },
    { ch: '×', title: 'Multiplication (×)' },
    { ch: '·', title: 'Point médian (mol·L⁻¹)' },
    { ch: '→', title: 'Flèche réaction' },
    { ch: '⇌', title: 'Équilibre chimique' },
    { ch: '↑', title: 'Dégagement gazeux (↑)' },
    { ch: '↓', title: 'Précipité (↓)' }
];

export function createInspectorController(ctx) {
    const { store, editor, dom, escHtml } = ctx;
    const { inspectorTitleEl, inspectorBodyEl, btnToggleSnap, btnToggleGrid } = dom;
    const inspectorPanelEl = document.getElementById('inspectorPanel');
    const btnToggleInspector = document.getElementById('btnToggleInspector');

    function toggleInspectorCollapsed() {
        if (!inspectorPanelEl) return;
        const collapsed = inspectorPanelEl.classList.toggle('is-collapsed');
        if (btnToggleInspector) {
            btnToggleInspector.setAttribute('aria-expanded', String(!collapsed));
        }
    }

    if (btnToggleInspector) {
        btnToggleInspector.addEventListener('click', toggleInspectorCollapsed);
    }

    function renderInspector() {
        const entries = store.getSelectedElements();

        if (entries.length === 0) {
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
                  <div><kbd>V</kbd> Sélection · <kbd>H</kbd> Main · <kbd>W</kbd> Fil · <kbd>T</kbd> Tuyau · <kbd>L</kbd> Légende</div>
                  <div><kbd>Shift+clic</kbd> / Cadre : Multi-sélection · <kbd>Ctrl+A</kbd> Tout</div>
                  <div><kbd>M</kbd> Aimantation · <kbd>G</kbd> Grille · <kbd>I</kbd> Inspecteur · <kbd>Alt</kbd> Libre</div>
                  <div><kbd>Ctrl+Z</kbd> Annuler · <kbd>Ctrl+C/X/V</kbd> Copier/Coller · <kbd>Ctrl+G</kbd> Grouper</div>
                  <div><kbd>Suppr</kbd> Effacer · <kbd>Ctrl+N/S/O/P</kbd> Fichier & Imprimer</div>
                  <div><kbd>Flèches</kbd> Décalage fin · <kbd>+/−/0</kbd> Zoom · <kbd>Clic droit</kbd> Menu / Vue</div>
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
                ctx.applyViewportTransform();
            });
            inspectorBodyEl.querySelector('#chkTransparent').addEventListener('change', (ev) => {
                editor.transparentExport = ev.target.checked;
            });
            inspectorBodyEl.querySelector('#btnInspectorTable').addEventListener('click', ctx.addOrSelectPaillasse);
            return;
        }

        if (entries.length > 1) {
            renderMultiInspector(entries);
            return;
        }

        const { kind, el } = entries[0];
        if (kind === 'item') {
            renderItemInspector(el);
        } else if (kind === 'connector') {
            renderConnectorInspector(el);
        } else if (kind === 'label') {
            renderLabelInspector(el);
        }
    }

    function renderMultiInspector(entries) {
        const nItems = entries.filter(e => e.kind === 'item').length;
        const nConns = entries.filter(e => e.kind === 'connector').length;
        const nLbls = entries.filter(e => e.kind === 'label').length;
        const allLocked = entries.every(e => Boolean(e.el.locked));
        const isSingleGroup = store.isSingleGroupSelected();
        const hasGrouped = store.hasGroupedSelection();
        const parts = [];
        if (nItems) parts.push(`${nItems} objet${nItems > 1 ? 's' : ''}`);
        if (nConns) parts.push(`${nConns} connecteur${nConns > 1 ? 's' : ''}`);
        if (nLbls) parts.push(`${nLbls} légende${nLbls > 1 ? 's' : ''}`);

        inspectorTitleEl.innerHTML = isSingleGroup
            ? `<i class="fas fa-object-group mr-1"></i> Groupe (${entries.length})`
            : `<i class="fas fa-object-group mr-1"></i> ${entries.length} éléments`;
        inspectorBodyEl.innerHTML = `
          <div class="prop-section">
            <div class="prop-section-title">${isSingleGroup ? 'Groupe' : 'Sélection multiple'}</div>
            <div style="font-size:0.78rem; color:var(--schemas-muted)">${parts.join(' · ')}</div>
            <div class="btn-row">
              <button class="mini-btn" id="btnDupMulti" title="Dupliquer la sélection (Ctrl+D)"><i class="fas fa-clone"></i> Dupliquer</button>
              <button class="mini-btn ${allLocked ? 'is-warning' : ''}" id="btnLockMulti" title="${allLocked ? 'Déverrouiller (Ctrl+Shift+L)' : 'Verrouiller (Ctrl+Shift+L)'}"><i class="fas ${allLocked ? 'fa-lock-open' : 'fa-lock'}"></i> ${allLocked ? 'Déverr.' : 'Verr.'}</button>
              <button class="mini-btn is-danger" id="btnDelMulti" title="Supprimer la sélection (Suppr)" ${allLocked ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
            </div>
            <div class="btn-row">
              ${!isSingleGroup ? `<button class="mini-btn" id="btnGroupMulti" title="Grouper la sélection (Ctrl+G)"><i class="fas fa-object-group"></i> Grouper</button>` : ''}
              ${hasGrouped ? `<button class="mini-btn" id="btnUngroupMulti" title="Dégrouper (Ctrl+Shift+G)"><i class="fas fa-object-ungroup"></i> Dégrouper</button>` : ''}
            </div>
            ${isSingleGroup ? '<div style="font-size:0.72rem; color:var(--schemas-muted)">Astuce : <kbd>Alt+clic</kbd> sélectionne un élément isolé du groupe.</div>' : ''}
          </div>
          ${(nItems + nLbls) >= 2 ? `
          <div class="prop-section">
            <div class="prop-section-title">Alignement</div>
            <div class="btn-row">
              <button class="mini-btn" data-align="left" title="Aligner à gauche"><i class="fas fa-align-left"></i></button>
              <button class="mini-btn" data-align="centerX" title="Centrer horizontalement"><i class="fas fa-align-center"></i></button>
              <button class="mini-btn" data-align="right" title="Aligner à droite"><i class="fas fa-align-right"></i></button>
            </div>
            <div class="btn-row">
              <button class="mini-btn" data-align="top" title="Aligner en haut"><i class="fas fa-arrow-up-to-line"></i> Haut</button>
              <button class="mini-btn" data-align="centerY" title="Centrer verticalement">Milieu</button>
              <button class="mini-btn" data-align="bottom" title="Aligner en bas">Bas</button>
            </div>
            ${(nItems + nLbls) >= 3 ? `
            <div class="btn-row" style="margin-top:2px">
              <button class="mini-btn" data-distribute="horizontal" title="Espacer régulièrement horizontalement"><i class="fas fa-arrows-left-right"></i> Espacer H</button>
              <button class="mini-btn" data-distribute="vertical" title="Espacer régulièrement verticalement"><i class="fas fa-arrows-up-down"></i> Espacer V</button>
            </div>` : ''}
          </div>` : ''}
          ${nItems > 0 ? `
          <div class="prop-section">
            <div class="prop-section-title">Ordre des calques</div>
            <div class="btn-row">
              <button class="mini-btn" id="btnMultiBack"><i class="fas fa-angles-down"></i> Arrière-plan</button>
              <button class="mini-btn" id="btnMultiFront"><i class="fas fa-angles-up"></i> Premier plan</button>
            </div>
          </div>` : ''}
        `;

        inspectorBodyEl.querySelector('#btnDupMulti').addEventListener('click', () => {
            store.duplicateSelected();
            ctx.renderScene();
            renderInspector();
        });
        inspectorBodyEl.querySelector('#btnLockMulti').addEventListener('click', () => {
            store.toggleLockSelected();
            ctx.renderScene();
            renderInspector();
        });
        inspectorBodyEl.querySelector('#btnGroupMulti')?.addEventListener('click', () => {
            if (store.groupSelected()) {
                ctx.renderScene();
                renderInspector();
            }
        });
        inspectorBodyEl.querySelector('#btnUngroupMulti')?.addEventListener('click', () => {
            if (store.ungroupSelected()) {
                ctx.renderScene();
                renderInspector();
            }
        });
        inspectorBodyEl.querySelector('#btnDelMulti').addEventListener('click', () => {
            store.deleteSelected();
            ctx.renderScene();
            renderInspector();
        });
        inspectorBodyEl.querySelectorAll('[data-align]').forEach(btn => {
            btn.addEventListener('click', () => ctx.alignSelectedElements(btn.dataset.align));
        });
        inspectorBodyEl.querySelectorAll('[data-distribute]').forEach(btn => {
            btn.addEventListener('click', () => ctx.distributeSelectedElements(btn.dataset.distribute));
        });
        const btnBack = inspectorBodyEl.querySelector('#btnMultiBack');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                const ids = new Set(entries.filter(e => e.kind === 'item').map(e => e.id));
                const moved = store.scene.items.filter(i => ids.has(i.id));
                const rest = store.scene.items.filter(i => !ids.has(i.id));
                const nextItems = [...moved, ...rest];
                if (!nextItems.some((it, idx) => it.id !== store.scene.items[idx].id)) return;
                store.pushHistory();
                store.scene.items = nextItems;
                ctx.renderScene();
            });
        }
        const btnFront = inspectorBodyEl.querySelector('#btnMultiFront');
        if (btnFront) {
            btnFront.addEventListener('click', () => {
                const ids = new Set(entries.filter(e => e.kind === 'item').map(e => e.id));
                const moved = store.scene.items.filter(i => ids.has(i.id));
                const rest = store.scene.items.filter(i => !ids.has(i.id));
                const nextItems = [...rest, ...moved];
                if (!nextItems.some((it, idx) => it.id !== store.scene.items[idx].id)) return;
                store.pushHistory();
                store.scene.items = nextItems;
                ctx.renderScene();
            });
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
                    specificHtml += `<div class="prop-row"><label>${field.label}</label><input type="text" class="prop-input" style="max-width:130px" data-prop="${field.key}" value="${escHtml(val ?? '')}" placeholder="${escHtml(field.placeholder || '')}"></div>`;
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

        const isLocked = Boolean(item.locked);
        const hasGlassBg = def.render(item.props || {}, '_probe').includes('verre-fond');
        inspectorBodyEl.innerHTML = `
          <div class="prop-section">
            <div class="btn-row">
              <button class="mini-btn" id="btnDupEl" title="Dupliquer (Ctrl+D)"><i class="fas fa-clone"></i> Dupliquer</button>
              <button class="mini-btn ${isLocked ? 'is-warning' : ''}" id="btnLockEl" title="${isLocked ? 'Déverrouiller (Ctrl+Shift+L)' : 'Verrouiller (Ctrl+Shift+L)'}"><i class="fas ${isLocked ? 'fa-lock-open' : 'fa-lock'}"></i> ${isLocked ? 'Déverr.' : 'Verr.'}</button>
              <button class="mini-btn is-danger" id="btnDelEl" title="Supprimer (Suppr)" ${isLocked ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
            </div>
            ${isLocked ? '<div class="lock-notice"><i class="fas fa-lock"></i><span>Objet verrouillé (position et suppression protégées)</span></div>' : ''}
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
                <input type="range" id="inpRotation" min="-180" max="180" step="1" value="${item.rotation ?? 0}" ${isLocked ? 'disabled' : ''}>
                <span class="prop-val" id="valRotation">${item.rotation ?? 0}°</span>
              </div>
            </div>
            <div class="btn-row">
              <button class="mini-btn" data-rot="-90" ${isLocked ? 'disabled' : ''}>-90°</button>
              <button class="mini-btn" data-rot="-45" ${isLocked ? 'disabled' : ''}>-45°</button>
              <button class="mini-btn" data-rot="-15" ${isLocked ? 'disabled' : ''}>-15°</button>
              <button class="mini-btn" data-rot="0" ${isLocked ? 'disabled' : ''}>0°</button>
              <button class="mini-btn" data-rot="15" ${isLocked ? 'disabled' : ''}>+15°</button>
              <button class="mini-btn" data-rot="45" ${isLocked ? 'disabled' : ''}>+45°</button>
              <button class="mini-btn" data-rot="90" ${isLocked ? 'disabled' : ''}>+90°</button>
            </div>
            <div class="prop-row">
              <label>Symétrie horizontale</label>
              <button class="mini-btn ${item.flipX ? 'is-active' : ''}" id="btnFlipX" style="flex:0 0 auto; padding:3px 10px" ${isLocked ? 'disabled' : ''}>
                <i class="fas fa-left-right"></i> Inverser
              </button>
            </div>
            <div class="prop-row">
              <label>Échelle</label>
              <div class="prop-range-wrap">
                <input type="range" id="inpScale" min="0.4" max="2.0" step="0.05" value="${item.scale ?? 1}" ${isLocked ? 'disabled' : ''}>
                <span class="prop-val" id="valScale">${Math.round((item.scale ?? 1) * 100)}%</span>
              </div>
            </div>
            ${hasGlassBg ? `
            <div class="prop-row">
              <label title="Ajoute un fond blanc pour masquer les objets et tuyaux situés derrière cette verrerie">Fond opaque</label>
              <input type="checkbox" id="chkOpaqueBg" ${item.opaqueBg ? 'checked' : ''}>
            </div>` : ''}
          </div>
        `;

        inspectorBodyEl.querySelector('#btnDupEl').addEventListener('click', () => {
            store.duplicateSelected();
            ctx.renderScene();
            renderInspector();
        });
        inspectorBodyEl.querySelector('#btnLockEl').addEventListener('click', () => {
            store.toggleLockSelected();
            ctx.renderScene();
            renderInspector();
        });
        inspectorBodyEl.querySelector('#btnDelEl').addEventListener('click', () => {
            store.deleteSelected();
            ctx.renderScene();
            renderInspector();
        });
        inspectorBodyEl.querySelectorAll('[data-z]').forEach(btn => {
            btn.addEventListener('click', () => {
                store.moveItemZOrder(item.id, btn.dataset.z);
                ctx.renderScene();
            });
        });

        const getVisibleSchemaKey = () => schema.filter(f => !f.showIf || f.showIf(item.props || {})).map(f => f.key).join(',');

        inspectorBodyEl.querySelectorAll('[data-prop]').forEach(input => {
            const key = input.dataset.prop;
            const field = schema.find(f => f.key === key);
            const isContinuous = input.type === 'range' || input.type === 'text' || input.type === 'color';
            const eventName = isContinuous ? 'input' : 'change';
            let historyPushed = false;
            let needsRerenderOnRelease = false;
            input.addEventListener(eventName, () => {
                const prevVal = item.props[key];
                const newVal = input.type === 'checkbox'
                    ? input.checked
                    : (input.type === 'range' ? Number(input.value) : input.value);
                if (prevVal === newVal) return;
                if (!historyPushed) {
                    store.pushHistory();
                    historyPushed = isContinuous;
                }
                const visBefore = getVisibleSchemaKey();
                item.props[key] = newVal;
                if (key === 'fillToRim' && newVal === true && 'liquidLevel' in item.props) {
                    item.props.liquidLevel = 100;
                }
                if (item.type === 'appareil-mesure' && key === 'mode') {
                    const modeDefaults = { pH: '7.00', 'σ': '125 µS/cm', 'O₂': '8.5 mg/L', '': '0.00' };
                    const prevDefault = modeDefaults[prevVal];
                    if (!item.props.display || item.props.display === prevDefault) {
                        item.props.display = modeDefaults[newVal] ?? '0.00';
                    }
                }
                const valEl = inspectorBodyEl.querySelector(`[data-val-for="${key}"]`);
                if (valEl) valEl.textContent = `${newVal}${field?.unit || ''}`;
                ctx.renderScene();
                const visAfter = getVisibleSchemaKey();
                if (eventName === 'change') {
                    renderInspector();
                } else if (visBefore !== visAfter) {
                    // Différer le re-rendu de l'inspecteur au relâchement pour ne pas détruire le slider en cours de glisser
                    needsRerenderOnRelease = true;
                }
            });
            if (isContinuous) {
                input.addEventListener('change', () => {
                    historyPushed = false;
                    if (needsRerenderOnRelease) {
                        needsRerenderOnRelease = false;
                        renderInspector();
                    }
                });
                if (input.type === 'text') {
                    input.addEventListener('blur', () => { historyPushed = false; });
                }
            }
        });

        inspectorBodyEl.querySelectorAll('[data-color-prop]').forEach(btn => {
            btn.addEventListener('click', () => {
                store.pushHistory();
                item.props[btn.dataset.colorProp] = btn.dataset.colorVal;
                ctx.renderScene();
                renderInspector();
            });
        });

        const inpRot = inspectorBodyEl.querySelector('#inpRotation');
        const valRot = inspectorBodyEl.querySelector('#valRotation');
        let rotHistoryPushed = false;
        let rotPivot = null;
        inpRot.addEventListener('input', () => {
            if (item.locked) return;
            const bb = def.getBBox(item.props || {});
            const cx = bb.x + bb.width / 2;
            const cy = bb.y + bb.height / 2;
            if (!rotHistoryPushed) {
                store.pushHistory();
                rotHistoryPushed = true;
                rotPivot = localToWorld(item, cx, cy);
            }
            item.rotation = Number(inpRot.value);
            const newCenter = localToWorld(item, cx, cy);
            item.x = Math.round(item.x + (rotPivot.x - newCenter.x));
            item.y = Math.round(item.y + (rotPivot.y - newCenter.y));
            valRot.textContent = `${item.rotation}°`;
            ctx.renderScene();
        });
        inpRot.addEventListener('change', () => { rotHistoryPushed = false; rotPivot = null; });

        inspectorBodyEl.querySelectorAll('[data-rot]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (item.locked) return;
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
                ctx.renderScene();
                renderInspector();
            });
        });

        inspectorBodyEl.querySelector('#btnFlipX').addEventListener('click', () => {
            if (item.locked) return;
            store.pushHistory();
            item.flipX = !item.flipX;
            ctx.renderScene();
            renderInspector();
        });

        const inpScale = inspectorBodyEl.querySelector('#inpScale');
        const valScale = inspectorBodyEl.querySelector('#valScale');
        let scaleHistoryPushed = false;
        inpScale.addEventListener('input', () => {
            if (item.locked) return;
            if (!scaleHistoryPushed) {
                store.pushHistory();
                scaleHistoryPushed = true;
            }
            item.scale = Number(inpScale.value);
            valScale.textContent = `${Math.round(item.scale * 100)}%`;
            ctx.renderScene();
        });
        inpScale.addEventListener('change', () => { scaleHistoryPushed = false; });

        const chkOpaqueBg = inspectorBodyEl.querySelector('#chkOpaqueBg');
        if (chkOpaqueBg) {
            chkOpaqueBg.addEventListener('change', () => {
                store.pushHistory();
                item.opaqueBg = chkOpaqueBg.checked;
                ctx.renderScene();
            });
        }
    }

    function rememberConnectorStyle(conn) {
        const bucket = editor.connectorDefaults?.[conn.kind];
        if (!bucket) return;
        bucket.mode = conn.mode || 'bezier';
        bucket.color = conn.color;
        bucket.width = conn.width;
        bucket.dashed = Boolean(conn.dashed);
        bucket.showArrow = Boolean(conn.showArrow);
        bucket.behindItems = Boolean(conn.behindItems);
    }

    function renderConnectorInspector(conn) {
        const isWire = conn.kind === 'wire';
        const isStraight = conn.mode === 'straight';
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
                { label: 'Caoutchouc brun', color: '#9c5a2d' },
                { label: 'Eau froide', color: '#74c0fc' },
                { label: 'Eau chaude', color: '#ff8787' },
                { label: 'Vide / Gris', color: '#adb5bd' },
                { label: 'Gaz', color: '#ffd43b' },
                { label: 'Transparent', color: '#ffffff' }
            ];

        const isLocked = Boolean(conn.locked);
        const isOrtho = conn.mode === 'orthogonal';
        const bendDisplayVal = isOrtho
            ? Math.round((Number(conn.bendX) || 0) + (Number(conn.bend) || 0) * 0.5)
            : (conn.bend ?? 0);
        inspectorBodyEl.innerHTML = `
          <div class="prop-section">
            <div class="btn-row">
              <button class="mini-btn" id="btnDupEl"><i class="fas fa-clone"></i> Dupliquer</button>
              <button class="mini-btn ${isLocked ? 'is-warning' : ''}" id="btnLockEl" title="${isLocked ? 'Déverrouiller (Ctrl+Shift+L)' : 'Verrouiller (Ctrl+Shift+L)'}"><i class="fas ${isLocked ? 'fa-lock-open' : 'fa-lock'}"></i> ${isLocked ? 'Déverr.' : 'Verr.'}</button>
              <button class="mini-btn is-danger" id="btnDelEl" ${isLocked ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
            </div>
            ${isLocked ? '<div class="lock-notice"><i class="fas fa-lock"></i><span>Connecteur verrouillé</span></div>' : ''}
          </div>

          <div class="prop-section">
            <div class="prop-section-title">Tracé</div>
            <div class="prop-row">
              <label for="selConnMode">Style de tracé</label>
              <select class="prop-select" id="selConnMode">
                <option value="bezier" ${conn.mode === 'bezier' ? 'selected' : ''}>Courbe souple</option>
                <option value="orthogonal" ${isOrtho ? 'selected' : ''}>Angles droits</option>
                <option value="straight" ${isStraight ? 'selected' : ''}>Ligne droite</option>
              </select>
            </div>
            ${!isStraight ? `
            <div class="prop-row">
              <label>Courbure / Décalage</label>
              <div class="prop-range-wrap">
                <input type="range" id="inpConnBend" min="-220" max="220" step="5" value="${bendDisplayVal}">
                <span class="prop-val" id="valConnBend">${bendDisplayVal}</span>
              </div>
            </div>
            <div class="btn-row">
              <button class="mini-btn" id="btnResetBend" title="Remettre la courbure naturelle tangente aux raccords"><i class="fas fa-wand-magic-sparkles"></i> Courbure auto</button>
            </div>` : ''}
            <div class="prop-row">
              <label>Épaisseur</label>
              <div class="prop-range-wrap">
                <input type="range" id="inpConnWidth" min="2" max="14" step="0.5" value="${conn.width ?? (isWire ? 3.5 : 8)}">
                <span class="prop-val" id="valConnWidth">${conn.width ?? (isWire ? 3.5 : 8)}</span>
              </div>
            </div>
            <div class="prop-row">
              <label for="chkConnDashed">Pointillés</label>
              <input type="checkbox" id="chkConnDashed" ${conn.dashed ? 'checked' : ''}>
            </div>
            <div class="prop-row">
              <label for="chkConnBehind">Passer derrière les objets</label>
              <input type="checkbox" id="chkConnBehind" ${conn.behindItems ? 'checked' : ''}>
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
              <label for="chkConnArrow">${isWire ? 'Flèche sens courant' : 'Flèche circulation'}</label>
              <input type="checkbox" id="chkConnArrow" ${conn.showArrow ? 'checked' : ''}>
            </div>
            ${conn.showArrow ? `
            <div class="prop-row">
              <label>Inverser la flèche</label>
              <button class="mini-btn" id="btnReverseArrow" style="flex:0 0 auto; padding:3px 10px"><i class="fas fa-arrows-left-right"></i> Inverser</button>
            </div>` : ''}
          </div>
        `;

        inspectorBodyEl.querySelector('#btnDupEl').addEventListener('click', () => { store.duplicateSelected(); ctx.renderScene(); renderInspector(); });
        inspectorBodyEl.querySelector('#btnLockEl').addEventListener('click', () => { store.toggleLockSelected(); ctx.renderScene(); renderInspector(); });
        inspectorBodyEl.querySelector('#btnDelEl').addEventListener('click', () => { store.deleteSelected(); ctx.renderScene(); renderInspector(); });

        inspectorBodyEl.querySelector('#selConnMode').addEventListener('change', (ev) => {
            store.pushHistory();
            conn.mode = ev.target.value;
            rememberConnectorStyle(conn);
            ctx.renderScene();
            renderInspector();
        });
        const inpBend = inspectorBodyEl.querySelector('#inpConnBend');
        if (inpBend) {
            let bendHistoryPushed = false;
            inpBend.addEventListener('input', () => {
                if (!bendHistoryPushed) {
                    store.pushHistory();
                    bendHistoryPushed = true;
                }
                const nextVal = Number(inpBend.value);
                if (conn.mode === 'orthogonal') {
                    conn.bendX = nextVal;
                    conn.bend = 0;
                } else {
                    conn.bend = nextVal;
                }
                inspectorBodyEl.querySelector('#valConnBend').textContent = nextVal;
                ctx.renderScene();
            });
            inpBend.addEventListener('change', () => { bendHistoryPushed = false; });
        }

        const btnResetBend = inspectorBodyEl.querySelector('#btnResetBend');
        if (btnResetBend) {
            btnResetBend.addEventListener('click', () => {
                store.pushHistory();
                conn.bend = 0;
                conn.bendX = 0;
                ctx.renderScene();
                renderInspector();
            });
        }

        const inpWidth = inspectorBodyEl.querySelector('#inpConnWidth');
        let widthHistoryPushed = false;
        inpWidth.addEventListener('input', () => {
            if (!widthHistoryPushed) {
                store.pushHistory();
                widthHistoryPushed = true;
            }
            conn.width = Number(inpWidth.value);
            rememberConnectorStyle(conn);
            inspectorBodyEl.querySelector('#valConnWidth').textContent = conn.width;
            ctx.renderScene();
        });
        inpWidth.addEventListener('change', () => { widthHistoryPushed = false; });

        inspectorBodyEl.querySelector('#chkConnDashed').addEventListener('change', (ev) => {
            store.pushHistory();
            conn.dashed = ev.target.checked;
            rememberConnectorStyle(conn);
            ctx.renderScene();
        });

        inspectorBodyEl.querySelector('#chkConnBehind').addEventListener('change', (ev) => {
            store.pushHistory();
            conn.behindItems = ev.target.checked;
            rememberConnectorStyle(conn);
            ctx.renderScene();
        });

        const inpColor = inspectorBodyEl.querySelector('#inpConnColor');
        let colorHistoryPushed = false;
        inpColor.addEventListener('input', () => {
            if (!colorHistoryPushed) {
                store.pushHistory();
                colorHistoryPushed = true;
            }
            conn.color = inpColor.value;
            rememberConnectorStyle(conn);
            ctx.renderScene();
        });
        inpColor.addEventListener('change', () => { colorHistoryPushed = false; renderInspector(); });

        inspectorBodyEl.querySelectorAll('[data-c]').forEach(btn => {
            btn.addEventListener('click', () => {
                store.pushHistory();
                conn.color = btn.dataset.c;
                rememberConnectorStyle(conn);
                ctx.renderScene();
                renderInspector();
            });
        });

        inspectorBodyEl.querySelector('#chkConnArrow').addEventListener('change', (ev) => {
            store.pushHistory();
            conn.showArrow = ev.target.checked;
            rememberConnectorStyle(conn);
            ctx.renderScene();
            renderInspector();
        });

        const btnRev = inspectorBodyEl.querySelector('#btnReverseArrow');
        if (btnRev) {
            btnRev.addEventListener('click', () => {
                store.pushHistory();
                conn.reverseArrow = !conn.reverseArrow;
                ctx.renderScene();
            });
        }
    }

    function rememberLabelStyle(lbl) {
        const d = editor.labelDefaults;
        if (!d) return;
        d.fontSize = Number(lbl.fontSize) || 20;
        d.color = lbl.color || '#1e293b';
        d.bold = Boolean(lbl.bold);
        d.italic = Boolean(lbl.italic);
        d.align = lbl.align === 'center' || lbl.align === 'right' ? lbl.align : 'left';
        d.bgEnabled = Boolean(lbl.bgEnabled);
        d.bgColor = lbl.bgColor || '#ffffff';
        d.borderEnabled = Boolean(lbl.borderEnabled);
        d.leaderStyle = lbl.leaderStyle === 'elbow' ? 'elbow' : 'straight';
        d.arrowHead = Boolean(lbl.arrowHead);
    }

    function renderLabelInspector(lbl) {
        inspectorTitleEl.innerHTML = '<i class="fas fa-font mr-1"></i> Légende';
        const align = lbl.align === 'center' || lbl.align === 'right' ? lbl.align : 'left';
        const leaderStyle = lbl.leaderStyle === 'elbow' ? 'elbow' : 'straight';
        const symbolButtons = LABEL_SYMBOLS.map(s =>
            `<button type="button" class="symbol-btn" data-symbol="${s.ch}" title="${s.title}">${s.ch}</button>`
        ).join('');
        const isLocked = Boolean(lbl.locked);
        inspectorBodyEl.innerHTML = `
          <div class="prop-section">
            <div class="btn-row">
              <button class="mini-btn" id="btnDupEl"><i class="fas fa-clone"></i> Dupliquer</button>
              <button class="mini-btn ${isLocked ? 'is-warning' : ''}" id="btnLockEl" title="${isLocked ? 'Déverrouiller (Ctrl+Shift+L)' : 'Verrouiller (Ctrl+Shift+L)'}"><i class="fas ${isLocked ? 'fa-lock-open' : 'fa-lock'}"></i> ${isLocked ? 'Déverr.' : 'Verr.'}</button>
              <button class="mini-btn is-danger" id="btnDelEl" ${isLocked ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
            </div>
            ${isLocked ? '<div class="lock-notice"><i class="fas fa-lock"></i><span>Légende verrouillée</span></div>' : ''}
          </div>
          <div class="prop-section">
            <div class="prop-section-title">Texte</div>
            <textarea class="prop-textarea" data-prop="text">${escHtml(lbl.text || '')}</textarea>
            <div class="symbol-palette" aria-label="Symboles scientifiques">${symbolButtons}</div>
            <div class="prop-row">
              <label>Taille police</label>
              <div class="prop-range-wrap">
                <input type="range" id="inpFontSize" min="10" max="36" step="1" value="${lbl.fontSize ?? 20}">
                <span class="prop-val" id="valFontSize">${lbl.fontSize ?? 20}px</span>
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
            <div class="btn-row">
              <button class="mini-btn ${align === 'left' ? 'is-active' : ''}" data-lbl-align="left" title="Aligner à gauche"><i class="fas fa-align-left"></i></button>
              <button class="mini-btn ${align === 'center' ? 'is-active' : ''}" data-lbl-align="center" title="Centrer"><i class="fas fa-align-center"></i></button>
              <button class="mini-btn ${align === 'right' ? 'is-active' : ''}" data-lbl-align="right" title="Aligner à droite"><i class="fas fa-align-right"></i></button>
            </div>
          </div>
          <div class="prop-section">
            <div class="prop-section-title">Étiquette (Fond & Cadre)</div>
            <div class="prop-row">
              <label for="chkLblBg">Fond</label>
              <div style="display:flex; align-items:center; gap:6px">
                ${lbl.bgEnabled ? `<input type="color" class="color-picker-native" id="inpLblBgColor" value="${lbl.bgColor || '#ffffff'}" title="Couleur du fond">` : ''}
                <input type="checkbox" id="chkLblBg" ${lbl.bgEnabled ? 'checked' : ''}>
              </div>
            </div>
            <div class="prop-row">
              <label for="chkLblBorder">Cadre</label>
              <input type="checkbox" id="chkLblBorder" ${lbl.borderEnabled ? 'checked' : ''}>
            </div>
          </div>
          <div class="prop-section">
            <div class="prop-section-title">Ligne de rappel</div>
            <div class="prop-row">
              <label for="chkLeader">Afficher la ligne</label>
              <input type="checkbox" id="chkLeader" ${lbl.showLeader ? 'checked' : ''}>
            </div>
            ${lbl.showLeader ? `
            <div class="prop-row">
              <label for="selLeaderStyle">Style</label>
              <select class="prop-select" id="selLeaderStyle">
                <option value="straight" ${leaderStyle === 'straight' ? 'selected' : ''}>Droite</option>
                <option value="elbow" ${leaderStyle === 'elbow' ? 'selected' : ''}>Coudée</option>
              </select>
            </div>
            <div class="prop-row">
              <label for="chkArrowHead">Embout flèche</label>
              <input type="checkbox" id="chkArrowHead" ${lbl.arrowHead ? 'checked' : ''}>
            </div>` : ''}
          </div>
        `;

        inspectorBodyEl.querySelector('#btnDupEl').addEventListener('click', () => { store.duplicateSelected(); ctx.renderScene(); renderInspector(); });
        inspectorBodyEl.querySelector('#btnLockEl').addEventListener('click', () => { store.toggleLockSelected(); ctx.renderScene(); renderInspector(); });
        inspectorBodyEl.querySelector('#btnDelEl').addEventListener('click', () => { store.deleteSelected(); ctx.renderScene(); renderInspector(); });

        const ta = inspectorBodyEl.querySelector('textarea[data-prop="text"]');
        let taHistoryPushed = false;
        ta.addEventListener('input', () => {
            if (!taHistoryPushed) {
                store.pushHistory();
                taHistoryPushed = true;
            }
            lbl.text = ta.value;
            ctx.renderScene();
        });
        ta.addEventListener('change', () => { taHistoryPushed = false; });
        ta.addEventListener('blur', () => { taHistoryPushed = false; });

        inspectorBodyEl.querySelectorAll('.symbol-btn').forEach(btn => {
            btn.addEventListener('mousedown', (ev) => ev.preventDefault());
            btn.addEventListener('click', () => {
                const sym = btn.dataset.symbol || '';
                const start = ta.selectionStart ?? ta.value.length;
                const end = ta.selectionEnd ?? ta.value.length;
                store.pushHistory();
                taHistoryPushed = false;
                ta.value = ta.value.slice(0, start) + sym + ta.value.slice(end);
                lbl.text = ta.value;
                ctx.renderScene();
                ta.focus();
                const pos = start + sym.length;
                ta.setSelectionRange(pos, pos);
            });
        });

        const inpFs = inspectorBodyEl.querySelector('#inpFontSize');
        let fsHistoryPushed = false;
        inpFs.addEventListener('input', () => {
            if (!fsHistoryPushed) {
                store.pushHistory();
                fsHistoryPushed = true;
            }
            lbl.fontSize = Number(inpFs.value);
            rememberLabelStyle(lbl);
            inspectorBodyEl.querySelector('#valFontSize').textContent = `${lbl.fontSize}px`;
            ctx.renderScene();
        });
        inpFs.addEventListener('change', () => { fsHistoryPushed = false; });

        const inpCol = inspectorBodyEl.querySelector('#inpLblColor');
        let colHistoryPushed = false;
        inpCol.addEventListener('input', () => {
            if (!colHistoryPushed) {
                store.pushHistory();
                colHistoryPushed = true;
            }
            lbl.color = inpCol.value;
            rememberLabelStyle(lbl);
            ctx.renderScene();
        });
        inpCol.addEventListener('change', () => { colHistoryPushed = false; });

        inspectorBodyEl.querySelector('#btnBold').addEventListener('click', () => {
            store.pushHistory();
            lbl.bold = !lbl.bold;
            rememberLabelStyle(lbl);
            ctx.renderScene();
            renderInspector();
        });
        inspectorBodyEl.querySelector('#btnItalic').addEventListener('click', () => {
            store.pushHistory();
            lbl.italic = !lbl.italic;
            rememberLabelStyle(lbl);
            ctx.renderScene();
            renderInspector();
        });
        inspectorBodyEl.querySelectorAll('[data-lbl-align]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (lbl.align === btn.dataset.lblAlign) return;
                store.pushHistory();
                lbl.align = btn.dataset.lblAlign;
                rememberLabelStyle(lbl);
                ctx.renderScene();
                renderInspector();
            });
        });

        inspectorBodyEl.querySelector('#chkLblBg').addEventListener('change', (ev) => {
            store.pushHistory();
            lbl.bgEnabled = ev.target.checked;
            if (lbl.bgEnabled && !lbl.bgColor) lbl.bgColor = '#ffffff';
            rememberLabelStyle(lbl);
            ctx.renderScene();
            renderInspector();
        });
        const inpBgCol = inspectorBodyEl.querySelector('#inpLblBgColor');
        if (inpBgCol) {
            let bgColHistoryPushed = false;
            inpBgCol.addEventListener('input', () => {
                if (!bgColHistoryPushed) {
                    store.pushHistory();
                    bgColHistoryPushed = true;
                }
                lbl.bgColor = inpBgCol.value;
                rememberLabelStyle(lbl);
                ctx.renderScene();
            });
            inpBgCol.addEventListener('change', () => { bgColHistoryPushed = false; });
        }
        inspectorBodyEl.querySelector('#chkLblBorder').addEventListener('change', (ev) => {
            store.pushHistory();
            lbl.borderEnabled = ev.target.checked;
            rememberLabelStyle(lbl);
            ctx.renderScene();
        });

        inspectorBodyEl.querySelector('#chkLeader').addEventListener('change', (ev) => {
            store.pushHistory();
            lbl.showLeader = ev.target.checked;
            ctx.renderScene();
            renderInspector();
        });
        const selLeaderStyle = inspectorBodyEl.querySelector('#selLeaderStyle');
        if (selLeaderStyle) {
            selLeaderStyle.addEventListener('change', (ev) => {
                store.pushHistory();
                lbl.leaderStyle = ev.target.value;
                rememberLabelStyle(lbl);
                ctx.renderScene();
            });
        }
        const chkAh = inspectorBodyEl.querySelector('#chkArrowHead');
        if (chkAh) {
            chkAh.addEventListener('change', (ev) => {
                store.pushHistory();
                lbl.arrowHead = ev.target.checked;
                rememberLabelStyle(lbl);
                ctx.renderScene();
            });
        }
    }

    function syncInspectorValues() {
        const el = store.getSelectedElement();
        if (!el) return;
        if (store.selection?.kind === 'connector') {
            const inpBend = inspectorBodyEl.querySelector('#inpConnBend');
            const valBend = inspectorBodyEl.querySelector('#valConnBend');
            const bendVal = el.mode === 'orthogonal'
                ? Math.round((Number(el.bendX) || 0) + (Number(el.bend) || 0) * 0.5)
                : el.bend;
            if (inpBend) inpBend.value = bendVal;
            if (valBend) valBend.textContent = bendVal;
        } else if (store.selection?.kind === 'item') {
            const inpRot = inspectorBodyEl.querySelector('#inpRotation');
            const valRot = inspectorBodyEl.querySelector('#valRotation');
            if (inpRot) inpRot.value = el.rotation ?? 0;
            if (valRot) valRot.textContent = `${el.rotation ?? 0}°`;
            const inpScale = inspectorBodyEl.querySelector('#inpScale');
            const valScale = inspectorBodyEl.querySelector('#valScale');
            if (inpScale) inpScale.value = el.scale ?? 1;
            if (valScale) valScale.textContent = `${Math.round((el.scale ?? 1) * 100)}%`;
        }
    }

    return {
        renderInspector,
        syncInspectorValues,
        toggleInspectorCollapsed
    };
}
