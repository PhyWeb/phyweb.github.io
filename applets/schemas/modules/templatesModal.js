// Modale de sélection de modèles de montages préconstruits (Templates)
import { alertModal } from '../../../common/common.js';
import { TEMPLATES, buildTemplateScene } from '../templates.js';
import { buildStandaloneSVG } from '../export.js';

export function createTemplatesModalController(ctx) {
    const { store, notify } = ctx;
    const modalEl = document.getElementById('templates-modal');
    const gridEl = document.getElementById('templatesGrid');
    const closeXBtn = document.getElementById('templates-close-x');
    const cancelBtn = document.getElementById('templates-cancel-button');
    const backdropEl = modalEl?.querySelector('.modal-background');

    if (!modalEl || !gridEl) {
        return { openTemplatesModal: () => {}, closeTemplatesModal: () => {} };
    }

    let rendered = false;

    function closeTemplatesModal() {
        modalEl.classList.remove('is-active');
    }

    function applyTemplate(tpl) {
        const scene = buildTemplateScene(tpl.id);
        if (!scene) return;
        store.importJSON(scene);
        ctx.setTool('select');
        ctx.renderScene();
        ctx.renderInspector();
        ctx.fitViewToScene();
        closeTemplatesModal();
        notify(`Modèle « ${tpl.name} » chargé !`);
    }

    function handleSelectTemplate(tpl) {
        if (!ctx.hasUnsavedChanges?.()) {
            applyTemplate(tpl);
            return;
        }
        closeTemplatesModal();
        alertModal({
            id: 'load-template-modal',
            type: 'warning',
            title: 'Charger un modèle',
            delete: true,
            body: `<p>Charger le modèle <strong>${tpl.name}</strong> remplacera le schéma actuel.</p><p class="has-text-grey is-size-7 mt-2">Les modifications non sauvegardées seront remplacées (annulable avec Ctrl+Z).</p>`,
            confirm: {
                label: 'Charger le modèle',
                type: 'warning',
                cb: () => applyTemplate(tpl)
            },
            cancel: 'Annuler',
            width: '32rem'
        });
    }

    function renderCards() {
        if (rendered) return;
        rendered = true;
        gridEl.innerHTML = '';

        for (const tpl of TEMPLATES) {
            const previewScene = tpl.build(`preview_${tpl.id}`);
            const svgMarkup = buildStandaloneSVG(previewScene, { transparent: false, padding: 24 });

            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'template-card';
            card.innerHTML = `
              <div class="template-card-preview">${svgMarkup}</div>
              <div class="template-card-info">
                <div class="template-card-head">
                  <span class="template-card-title">${tpl.name}</span>
                  <span class="template-card-tag">${tpl.category}</span>
                </div>
                <p class="template-card-desc">${tpl.description}</p>
              </div>
            `;
            card.addEventListener('click', () => handleSelectTemplate(tpl));
            gridEl.appendChild(card);
        }
    }

    function openTemplatesModal() {
        ctx.closeOverlays?.();
        renderCards();
        modalEl.classList.add('is-active');
    }

    closeXBtn?.addEventListener('click', closeTemplatesModal);
    cancelBtn?.addEventListener('click', closeTemplatesModal);
    backdropEl?.addEventListener('click', closeTemplatesModal);
    document.getElementById('btnOpenTemplates')?.addEventListener('click', openTemplatesModal);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEl.classList.contains('is-active')) {
            e.preventDefault();
            closeTemplatesModal();
        }
    });

    return {
        openTemplatesModal,
        closeTemplatesModal
    };
}
