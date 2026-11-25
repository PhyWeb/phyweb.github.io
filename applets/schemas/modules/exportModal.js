// Modale d'export avancé & impression / PDF (inspirée de Grapher)
import { sanitizeFilename } from '../state.js';
import {
    buildStandaloneSVG,
    renderSceneToImageBlob,
    computeSceneBounds,
    buildPrintDocumentHTML,
    buildImagePreviewHTML
} from '../export.js';

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

export function createExportModalController(ctx) {
    const { store, editor, notify } = ctx;

    const modalEl = document.getElementById('export-modal');
    if (!modalEl) {
        return { openExportModal: () => {}, closeExportModal: () => {} };
    }

    const actionSelect = document.getElementById('export-action-select');
    const printOptions = document.getElementById('export-print-options');
    const imageOptions = document.getElementById('export-image-options');
    const titleInput = document.getElementById('export-title-input');
    const orientationSelect = document.getElementById('export-orientation-select');
    const marginSelect = document.getElementById('export-margin-select');
    const formatSelect = document.getElementById('export-image-format');
    const scaleField = document.getElementById('export-scale-field');
    const scaleSelect = document.getElementById('export-image-scale');
    const paddingSelect = document.getElementById('export-padding-select');
    const transparentField = document.getElementById('export-transparent-field');
    const transparentCheck = document.getElementById('export-transparent-check');
    const dimsInfo = document.getElementById('export-dims-info');
    const previewHeading = document.getElementById('export-preview-heading');
    const iframe = document.getElementById('export-preview-iframe');
    const confirmBtn = document.getElementById('export-confirm-button');
    const copyBtn = document.getElementById('export-copy-button');
    const cancelBtn = document.getElementById('export-cancel-button');
    const closeXBtn = document.getElementById('export-close-x');
    const backdropEl = modalEl.querySelector('.modal-background');

    function closeExportModal() {
        modalEl.classList.remove('is-active');
    }

    function updatePreview() {
        const action = actionSelect.value;

        if (action === 'image') {
            printOptions.classList.add('is-hidden');
            imageOptions.classList.remove('is-hidden');
            copyBtn.classList.remove('is-hidden');
            previewHeading.textContent = 'Aperçu de l\'image';
            confirmBtn.innerHTML = '<span class="icon is-small"><i class="fas fa-download"></i></span><span>Télécharger l\'image</span>';

            const format = formatSelect.value;
            const isSvg = format === 'image/svg+xml';
            const isJpeg = format === 'image/jpeg';
            const scale = parseInt(scaleSelect.value, 10) || 3;
            const padding = parseInt(paddingSelect.value, 10) || 0;
            const transparent = !isJpeg && transparentCheck.checked;

            scaleField.classList.toggle('is-hidden', isSvg);
            transparentField.classList.toggle('is-hidden', isJpeg);

            const bounds = computeSceneBounds(store.scene, padding);
            if (isSvg) {
                dimsInfo.textContent = `Dimensions vectorielles : ${bounds.width} × ${bounds.height} px`;
            } else {
                dimsInfo.textContent = `Dimensions export : ${Math.round(bounds.width * scale)} × ${Math.round(bounds.height * scale)} px`;
            }

            iframe.srcdoc = buildImagePreviewHTML(store.scene, { transparent, padding });
        } else {
            printOptions.classList.remove('is-hidden');
            imageOptions.classList.add('is-hidden');
            copyBtn.classList.add('is-hidden');
            previewHeading.textContent = 'Aperçu du document A4';
            confirmBtn.innerHTML = '<span class="icon is-small"><i class="fas fa-print"></i></span><span>Imprimer / Exporter en PDF</span>';

            iframe.srcdoc = buildPrintDocumentHTML(store.scene, {
                title: titleInput.value.trim(),
                orientation: orientationSelect.value,
                margin: marginSelect.value,
                padding: 24
            });
        }
    }

    function openExportModal(initialAction = 'image') {
        if (!ctx.hasSceneData()) {
            notify('Ajoutez au moins un élément avant d\'exporter ou d\'imprimer.');
            return;
        }
        ctx.closeOverlays?.();
        actionSelect.value = initialAction === 'print' ? 'print' : 'image';
        titleInput.value = (store.scene.title || '').trim();
        transparentCheck.checked = Boolean(editor.transparentExport);
        updatePreview();
        modalEl.classList.add('is-active');
    }

    actionSelect.addEventListener('change', updatePreview);
    modalEl.querySelectorAll('.export-trigger').forEach(el => {
        el.addEventListener('change', updatePreview);
    });

    titleInput.addEventListener('input', () => {
        const newTitle = titleInput.value.trim();
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        const titleEl = iframeDoc?.getElementById('preview-title');
        if (titleEl) {
            titleEl.textContent = newTitle;
            titleEl.style.display = newTitle ? 'block' : 'none';
        }
    });

    confirmBtn.addEventListener('click', async () => {
        if (actionSelect.value === 'print') {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            return;
        }

        const format = formatSelect.value;
        const scale = parseInt(scaleSelect.value, 10) || 3;
        const padding = parseInt(paddingSelect.value, 10) || 0;
        const transparent = format !== 'image/jpeg' && transparentCheck.checked;
        const baseName = sanitizeFilename(store.scene.title);

        // Synchroniser la préférence fond transparent avec l'éditeur
        if (format !== 'image/jpeg') {
            editor.transparentExport = transparent;
        }

        try {
            if (format === 'image/svg+xml') {
                const svg = buildStandaloneSVG(store.scene, { transparent, padding });
                const filename = `${baseName}.svg`;
                downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), filename);
                notify(`Fichier SVG téléchargé (${filename}) !`);
            } else {
                const ext = format === 'image/jpeg' ? 'jpg' : 'png';
                const blob = await renderSceneToImageBlob(store.scene, { format, scale, transparent, padding });
                const filename = `${baseName}.${ext}`;
                downloadBlob(blob, filename);
                notify(`Image ${ext.toUpperCase()} téléchargée (${filename}) !`);
            }
            closeExportModal();
        } catch (err) {
            console.error(err);
            notify('Erreur lors de l\'export de l\'image.');
        }
    });

    copyBtn.addEventListener('click', async () => {
        const scale = parseInt(scaleSelect.value, 10) || 3;
        const padding = parseInt(paddingSelect.value, 10) || 0;
        const transparent = formatSelect.value !== 'image/jpeg' && transparentCheck.checked;
        try {
            const blob = await renderSceneToImageBlob(store.scene, { format: 'image/png', scale, transparent, padding });
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            notify('Image copiée dans le presse-papier !');
            closeExportModal();
        } catch (err) {
            console.error(err);
            notify('Impossible de copier automatiquement : utilisez le bouton Télécharger.');
        }
    });

    cancelBtn?.addEventListener('click', closeExportModal);
    closeXBtn?.addEventListener('click', closeExportModal);
    backdropEl?.addEventListener('click', closeExportModal);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEl.classList.contains('is-active')) {
            e.preventDefault();
            closeExportModal();
        }
    });

    return {
        openExportModal,
        closeExportModal
    };
}
