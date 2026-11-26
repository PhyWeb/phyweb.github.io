// Gestion des entrées/sorties : session, navbar/menu, titre, sauvegarde .pws, exports PNG/SVG et Nouveau schéma
import { alertModal, FileDropManager } from '../../../common/common.js';
import { sanitizeFilename } from '../state.js';
import { buildStandaloneSVG, renderSceneToPNGBlob } from '../export.js';

const SESSION_STORAGE_KEY = 'phyweb_schemas_session_v1';

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

export function createIOController(ctx) {
    const { store, editor, notify } = ctx;
    let savedSnapshot = store.snapshot();
    let schemaTitleInputEl = null;
    let unsavedDotEl = null;
    let persistSessionTimer = null;

    function hasSceneData() {
        return (
            store.scene.items.length > 0 ||
            store.scene.connectors.length > 0 ||
            store.scene.labels.length > 0
        );
    }

    function hasUnsavedChanges() {
        return hasSceneData() && store.snapshot() !== savedSnapshot;
    }

    function updateDocumentStatus() {
        const dirty = hasUnsavedChanges();
        const title = (store.scene.title || '').trim();
        if (schemaTitleInputEl && document.activeElement !== schemaTitleInputEl) {
            schemaTitleInputEl.value = store.scene.title || '';
        }
        if (unsavedDotEl) {
            unsavedDotEl.hidden = !dirty;
        }
        const baseTitle = title || 'Schémas de Chimie & Physique';
        document.title = `${dirty ? '● ' : ''}${baseTitle} - PhyWeb`;
    }

    function markAsSaved() {
        savedSnapshot = store.snapshot();
        updateDocumentStatus();
    }

    function persistSessionImmediate() {
        if (persistSessionTimer !== null) {
            clearTimeout(persistSessionTimer);
            persistSessionTimer = null;
        }
        try {
            if (!hasSceneData()) {
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } else {
                sessionStorage.setItem(SESSION_STORAGE_KEY, store.exportJSON());
            }
        } catch (_) {
            // Ignorer si sessionStorage est indisponible ou plein
        }
    }

    function persistSession() {
        if (persistSessionTimer !== null) clearTimeout(persistSessionTimer);
        persistSessionTimer = setTimeout(persistSessionImmediate, 250);
    }

    function restoreSession() {
        try {
            const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            if (!parsed || !Array.isArray(parsed.items)) return false;
            const hasAny =
                parsed.items.length > 0 ||
                (Array.isArray(parsed.connectors) && parsed.connectors.length > 0) ||
                (Array.isArray(parsed.labels) && parsed.labels.length > 0);
            if (!hasAny) return false;
            store.scene = {
                version: 1,
                title: typeof parsed.title === 'string' ? parsed.title : '',
                items: parsed.items || [],
                connectors: Array.isArray(parsed.connectors) ? parsed.connectors : [],
                labels: Array.isArray(parsed.labels) ? parsed.labels : []
            };
            store.clearSelection();
            return true;
        } catch (_) {
            return false;
        }
    }

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
            const filename = `${sanitizeFilename(store.scene.title)}.png`;
            downloadBlob(blob, filename);
            notify(`Image PNG HD téléchargée (${filename}) !`);
        } catch (err) {
            console.error(err);
            notify('Erreur lors de l\'export PNG.');
        }
    }

    function handleExportSVG() {
        const svg = buildStandaloneSVG(store.scene, { transparent: editor.transparentExport });
        const filename = `${sanitizeFilename(store.scene.title)}.svg`;
        downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), filename);
        notify(`Fichier SVG téléchargé (${filename}) !`);
    }

    function handleSaveJSON() {
        const json = store.exportJSON();
        const filename = `${sanitizeFilename(store.scene.title)}.pws`;
        downloadBlob(new Blob([json], { type: 'application/json;charset=utf-8' }), filename);
        markAsSaved();
        notify(`Schéma sauvegardé (${filename}) !`);
    }

    function resetToNewScene() {
        ctx.closeOverlays?.();
        store.resetNew();
        ctx.setTool('select');
        markAsSaved();
        ctx.renderScene();
        ctx.renderInspector();
        ctx.centerInitialView();
        notify('Nouveau schéma créé.');
    }

    function handleNewScene() {
        if (!hasUnsavedChanges()) {
            if (!hasSceneData() && !(store.scene.title || '').trim()) return;
            resetToNewScene();
            return;
        }
        alertModal({
            id: 'new-scene-modal',
            type: 'warning',
            title: 'Nouveau schéma',
            delete: true,
            body: '<p>Créer un nouveau schéma effacera le document actuel.</p><p class="has-text-grey is-size-7 mt-2">Les modifications non sauvegardées seront perdues.</p>',
            confirm: {
                label: 'Créer un nouveau schéma',
                type: 'warning',
                cb: () => resetToNewScene()
            },
            cancel: 'Annuler',
            width: '32rem'
        });
    }

    const jsonFileInput = document.getElementById('jsonFileInput');
    function triggerLoadJSON() {
        if (!jsonFileInput) return;
        if (!hasUnsavedChanges()) {
            jsonFileInput.click();
            return;
        }
        alertModal({
            id: 'load-scene-modal',
            type: 'warning',
            title: 'Charger un projet',
            delete: true,
            body: '<p>Charger un autre fichier remplacera le schéma actuel.</p><p class="has-text-grey is-size-7 mt-2">Les modifications non sauvegardées seront perdues (annulable avec Ctrl+Z).</p>',
            confirm: {
                label: 'Choisir un fichier',
                type: 'warning',
                cb: () => jsonFileInput.click()
            },
            cancel: 'Annuler',
            width: '32rem'
        });
    }

    function loadFromContent(text, fileName = '', { markSaved = true } = {}) {
        const fallbackName = String(fileName || '').replace(/\.(pws|json)$/i, '');
        const fallbackTitle = fallbackName.toLowerCase() === 'schema-phyweb' ? '' : fallbackName;
        store.importJSON(text, fallbackTitle);
        if (markSaved) markAsSaved();
        ctx.renderScene();
        ctx.renderInspector();
        ctx.fitViewToScene();
    }

    function setupElectronStartupImport() {
        if (window.electronAPI && typeof window.electronAPI.onImportData === 'function') {
            window.electronAPI.onImportData((payload) => {
                try {
                    const data = (payload && typeof payload === 'object' && Object.hasOwn(payload, 'data'))
                        ? payload.data
                        : payload;
                    const markSaved = Boolean(payload?.markAsSaved);
                    const fileName = payload?.fileName || '';
                    loadFromContent(data, fileName, { markSaved });
                    notify('Schéma chargé avec succès !');
                } catch (err) {
                    console.error('Erreur import .pws Electron :', err);
                    notify('Erreur : fichier .pws invalide.');
                }
            });
        }
    }

    async function handleDroppedFile(file) {
        if (!file) return;
        const lower = String(file.name || '').toLowerCase();
        if (!lower.endsWith('.pws') && !lower.endsWith('.json')) {
            notify('Format non pris en charge : déposez un fichier .pws (ou .json).');
            return;
        }
        let text;
        try {
            text = await file.text();
            // Valider le JSON avant d'afficher une éventuelle modale de confirmation
            const clean = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
            const parsed = JSON.parse(clean);
            if (!parsed || !Array.isArray(parsed.items)) {
                throw new Error('Format invalide');
            }
        } catch (_) {
            notify('Erreur : fichier .pws invalide.');
            return;
        }

        const applyLoad = () => {
            try {
                loadFromContent(text, file.name, { markSaved: true });
                notify('Schéma chargé avec succès !');
            } catch (_) {
                notify('Erreur : fichier .pws invalide.');
            }
        };

        if (!hasUnsavedChanges()) {
            applyLoad();
            return;
        }

        alertModal({
            id: 'drop-scene-modal',
            type: 'warning',
            title: 'Ouvrir le schéma déposé',
            delete: true,
            body: `<p>Ouvrir <strong>${file.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong> remplacera le schéma actuel.</p><p class="has-text-grey is-size-7 mt-2">Les modifications non sauvegardées seront perdues (annulable avec Ctrl+Z).</p>`,
            confirm: {
                label: 'Ouvrir le fichier',
                type: 'warning',
                cb: applyLoad
            },
            cancel: 'Annuler',
            width: '32rem'
        });
    }

    if (typeof document !== 'undefined' && document.body) {
        new FileDropManager(document.body, handleDroppedFile);
    }

    if (jsonFileInput) {
        jsonFileInput.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const text = await file.text();
                loadFromContent(text, file.name, { markSaved: true });
                notify('Schéma chargé avec succès !');
            } catch (err) {
                notify('Erreur : fichier .pws invalide.');
            }
            jsonFileInput.value = '';
        });
    }

    function handleClearScene() {
        if (!hasSceneData()) return;
        alertModal({
            id: 'clear-scene-modal',
            type: 'danger',
            title: 'Effacer le schéma',
            delete: true,
            body: '<p>Êtes-vous sûr de vouloir effacer tout le schéma ?</p><p class="has-text-grey is-size-7 mt-2">Vous pourrez toujours annuler cette action avec Ctrl+Z.</p>',
            confirm: {
                label: 'Effacer',
                type: 'danger',
                cb: () => {
                    if (store.clearAll()) {
                        markAsSaved();
                        ctx.renderScene();
                        ctx.renderInspector();
                        notify('Schéma effacé.');
                    }
                }
            },
            cancel: 'Annuler',
            width: '32rem'
        });
    }

    function setupNavbarMenu() {
        const navbarStart = document.querySelector('#navbar-container .navbar-start');
        if (navbarStart && !document.getElementById('schemaTitleWrap')) {
            const titleItem = document.createElement('div');
            titleItem.className = 'navbar-item';
            titleItem.style.height = '100%';
            titleItem.innerHTML = `
              <div class="schema-title-wrap" id="schemaTitleWrap" title="Nom du schéma (utilisé pour les exports)">
                <i class="fa-solid fa-pen" aria-hidden="true"></i>
                <input type="text" id="schemaTitleInput" class="schema-title-input" placeholder="Sans titre" maxlength="80" autocomplete="off" aria-label="Nom du schéma">
                <span class="unsaved-dot" id="unsavedIndicator" title="Modifications non sauvegardées" hidden></span>
              </div>
            `;
            navbarStart.appendChild(titleItem);

            schemaTitleInputEl = titleItem.querySelector('#schemaTitleInput');
            unsavedDotEl = titleItem.querySelector('#unsavedIndicator');

            let titleHistoryPushed = false;
            schemaTitleInputEl.addEventListener('input', () => {
                if (!titleHistoryPushed) {
                    store.pushHistory();
                    titleHistoryPushed = true;
                }
                store.scene.title = schemaTitleInputEl.value;
                updateDocumentStatus();
                persistSession();
            });
            schemaTitleInputEl.addEventListener('change', () => { titleHistoryPushed = false; });
            schemaTitleInputEl.addEventListener('blur', () => { titleHistoryPushed = false; });
            schemaTitleInputEl.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter' || ev.key === 'Escape') {
                    schemaTitleInputEl.blur();
                }
            });
        }

        const navbarEnd = document.querySelector('#navbar-container .navbar-end');
        if (!navbarEnd || document.getElementById('menu-dropdown-container')) return;

        const menuEl = document.createElement('div');
        menuEl.className = 'navbar-item has-dropdown';
        menuEl.id = 'menu-dropdown-container';
        menuEl.style.height = '100%';
        menuEl.innerHTML = `
          <a class="navbar-link" id="menu-dropdown-toggle" style="height: 100%;">
            Menu
          </a>
          <div class="navbar-dropdown is-right is-size-6" id="menu-dropdown-content">
            <a class="navbar-item" id="menuNewScene">
              <span class="icon"><i class="fa-solid fa-file-circle-plus"></i></span>
              <span>Nouveau schéma</span>
            </a>
            <a class="navbar-item" id="menuSaveJSON">
              <span class="icon"><i class="fa-solid fa-floppy-disk"></i></span>
              <span>Sauvegarder (.pws)</span>
            </a>
            <a class="navbar-item" id="menuLoadJSON">
              <span class="icon"><i class="fa-solid fa-folder-open"></i></span>
              <span>Charger (.pws)</span>
            </a>
            <hr class="navbar-divider">
            <a class="navbar-item" id="menuCopyPNG">
              <span class="icon"><i class="fa-solid fa-copy"></i></span>
              <span>Copier l'image HD</span>
            </a>
            <a class="navbar-item" id="menuExportPNG">
              <span class="icon"><i class="fa-solid fa-image"></i></span>
              <span>Exporter en PNG HD</span>
            </a>
            <a class="navbar-item" id="menuExportSVG">
              <span class="icon"><i class="fa-solid fa-bezier-curve"></i></span>
              <span>Exporter en SVG</span>
            </a>
            <hr class="navbar-divider">
            <a class="navbar-item" id="menuExportAdvanced">
              <span class="icon"><i class="fa-solid fa-print"></i></span>
              <span>Exporter / Imprimer (PDF)…</span>
            </a>
          </div>
        `;

        const divider = navbarEnd.querySelector('.vertical-divider.window-control');
        if (divider) navbarEnd.insertBefore(menuEl, divider);
        else navbarEnd.appendChild(menuEl);

        const toggle = menuEl.querySelector('#menu-dropdown-toggle');
        toggle.addEventListener('click', (ev) => {
            ev.stopPropagation();
            menuEl.classList.toggle('is-active');
        });
        document.addEventListener('click', () => {
            menuEl.classList.remove('is-active');
        });
        menuEl.querySelectorAll('.navbar-dropdown .navbar-item').forEach(item => {
            item.addEventListener('click', () => menuEl.classList.remove('is-active'));
        });

        menuEl.querySelector('#menuNewScene').addEventListener('click', () => handleNewScene());
        menuEl.querySelector('#menuSaveJSON').addEventListener('click', () => handleSaveJSON());
        menuEl.querySelector('#menuLoadJSON').addEventListener('click', () => triggerLoadJSON());
        menuEl.querySelector('#menuCopyPNG').addEventListener('click', () => handleCopyPNG());
        menuEl.querySelector('#menuExportPNG').addEventListener('click', () => handleExportPNG());
        menuEl.querySelector('#menuExportSVG').addEventListener('click', () => handleExportSVG());
        menuEl.querySelector('#menuExportAdvanced').addEventListener('click', () => ctx.openExportModal?.('image'));
    }

    // Alerte navigateur en cas de fermeture d'onglet ou rechargement avec modifications non sauvegardées
    window.addEventListener('beforeunload', (e) => {
        persistSessionImmediate();
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    return {
        hasSceneData,
        hasUnsavedChanges,
        markAsSaved,
        updateDocumentStatus,
        persistSession,
        persistSessionImmediate,
        restoreSession,
        setupNavbarMenu,
        setupElectronStartupImport,
        handleCopyPNG,
        handleExportPNG,
        handleExportSVG,
        handleSaveJSON,
        handleNewScene,
        handleClearScene,
        triggerLoadJSON
    };
}
