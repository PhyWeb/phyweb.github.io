import { formatUnit } from '../../common/formatter.js';
import { showToast } from '../../common/common.js';
import { formatAxisLabelWithUnit } from './grapher/axisFormatting.js';
import {
  MAX_PRINT_TABLE_POINTS,
  escapeHTML,
  buildImagePreviewHTML,
  buildPrintHTML
} from './export/printTemplates.js';

const $ = (selector) => document.querySelector(selector);

export { MAX_PRINT_TABLE_POINTS, escapeHTML };
export const EXPORT_RATIO_DIMENSIONS = Object.freeze({
  '16:10': { w: 880, h: 550 },
  '16:9': { w: 960, h: 540 },
  '4:3': { w: 800, h: 600 },
  '1:1': { w: 650, h: 650 }
});

const EXPORT_PREFS_KEY = 'phyweb_grapher_export_prefs';

/**
 * Nettoie un nom de fichier d'export (supprime les caractères interdits et espaces).
 * @param {string} rawName
 * @param {string} [fallback='phyweb_graphe']
 * @returns {string}
 */
export function sanitizeExportFilename(rawName, fallback = 'phyweb_graphe') {
  if (typeof rawName !== 'string') return fallback;
  const cleaned = rawName
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^[._]+|[._]+$/g, '');
  return cleaned || fallback;
}

export default class ExportManager {
  constructor({ common, data, grapher, editor } = {}) {
    this.common = common;
    this.data = data;
    this.grapher = grapher;
    this.editor = editor;
    this.exportCurveLabels = {}; // Surcharges temporaires { [curveTitle]: { title, unit } } pour l'export
  }

  resetCurveLabels() {
    this.exportCurveLabels = {};
  }

  /**
   * Initialise la modale d'exportation avec aperçu en temps réel
   */
  initExportModal() {
    const exportModal = $('#export-modal');
    const actionSelect = $('#export-action-select');
    const sectionsContainer = $('#export-sections-container');
    const imageOptions = $('#export-image-options');
    const confirmBtn = $('#export-confirm-button');
    const copyBtn = $('#export-copy-button');

    const iframe = $('#export-preview-iframe');
    const previewTitleEl = $('#export-preview-title');
    const titleInput = $('#export-title-input');
    const ratioSelect = $('#export-graph-ratio');
    const sizeSelect = $('#export-graph-size');
    const orientationSelect = $('#export-orientation-select');
    const marginSelect = $('#export-margin-select');
    const tableLayoutSelect = $('#export-table-layout');
    const formatSelect = $('#export-image-format');
    const scaleSelect = $('#export-image-scale');
    const dimsInfo = $('#export-image-dimensions-info');
    const filenameInput = $('#export-filename-input');
    const transparentBgCheckbox = $('#export-transparent-bg');
    const renameList = $('#export-rename-list');
    const renameResetBtn = $('#export-rename-reset-btn');
    let renameDebounceTimer = null;
    let titleDebounceTimer = null;

    const loadExportPrefs = () => {
      try {
        if (typeof localStorage === 'undefined') return;
        const raw = localStorage.getItem(EXPORT_PREFS_KEY);
        if (!raw) return;
        const prefs = JSON.parse(raw);
        if (!prefs || typeof prefs !== 'object') return;

        const applySelect = (el, val) => {
          if (!el || typeof val !== 'string') return;
          if (!el.options || Array.from(el.options).some(o => o.value === val)) {
            el.value = val;
          }
        };

        applySelect(actionSelect, prefs.action);
        applySelect(ratioSelect, prefs.ratio);
        applySelect(sizeSelect, prefs.textScale);
        applySelect(orientationSelect, prefs.orientation);
        applySelect(marginSelect, prefs.margin);
        applySelect(tableLayoutSelect, prefs.tableLayout);
        applySelect(formatSelect, prefs.imageFormat);
        applySelect(scaleSelect, prefs.imageScale);
        if (transparentBgCheckbox && typeof prefs.transparentBg === 'boolean') {
          transparentBgCheckbox.checked = prefs.transparentBg;
        }
      } catch (e) {
        // Ignore les erreurs de stockage (mode privé / environnement sans localStorage)
      }
    };

    const saveExportPrefs = () => {
      try {
        if (typeof localStorage === 'undefined') return;
        const prefs = {
          action: actionSelect?.value,
          ratio: ratioSelect?.value,
          textScale: sizeSelect?.value,
          orientation: orientationSelect?.value,
          margin: marginSelect?.value,
          tableLayout: tableLayoutSelect?.value,
          imageFormat: formatSelect?.value,
          imageScale: scaleSelect?.value,
          transparentBg: Boolean(transparentBgCheckbox?.checked)
        };
        localStorage.setItem(EXPORT_PREFS_KEY, JSON.stringify(prefs));
      } catch (e) {
        // Ignore les erreurs de stockage
      }
    };

    loadExportPrefs();

    const getChartDimensions = () => {
      const ratio = ratioSelect ? ratioSelect.value : '16:10';
      return this.getExportDimensions(ratio);
    };

    const getTextScale = () => {
      const val = parseFloat($('#export-graph-size')?.value);
      return Number.isFinite(val) && val > 0 ? val : 1;
    };

    const isTransparentBgActive = () => {
      const format = formatSelect ? formatSelect.value : 'image/png';
      return Boolean(transparentBgCheckbox && transparentBgCheckbox.checked && format !== 'image/jpeg');
    };

    const updateImageOptionsUI = () => {
      if (!formatSelect || !scaleSelect) return;
      const format = formatSelect.value;
      const isSvg = format === 'image/svg+xml';
      const isJpeg = format === 'image/jpeg';
      const dims = getChartDimensions();
      const scale = parseInt(scaleSelect.value, 10) || 1;

      scaleSelect.disabled = isSvg;
      if (transparentBgCheckbox) {
        transparentBgCheckbox.disabled = isJpeg;
      }
      if (dimsInfo) {
        dimsInfo.textContent = isSvg
          ? `Format vectoriel (${dims.w} × ${dims.h})`
          : `Dimensions : ${dims.w * scale} × ${dims.h * scale} px`;
      }
    };

    const populateRenameList = () => {
      if (!renameList) return;
      renameList.innerHTML = '';

      const curves = Array.isArray(this.data?.curves) ? this.data.curves : [];
      if (curves.length === 0) return;

      const currentX = this.grapher?.currentXCurve;

      curves.forEach(curve => {
        if (!curve || !curve.title) return;
        const origTitle = curve.title;
        const origUnit = curve.unit || '';
        const { title: currentTitle, unit: currentUnit } = this.getExportCurveLabel(origTitle, origUnit);

        const row = document.createElement('div');
        row.className = 'mb-2';

        const headerLine = document.createElement('div');
        headerLine.className = 'is-flex is-align-items-center mb-1';
        headerLine.style.gap = '6px';

        if (origTitle === currentX) {
          const badge = document.createElement('span');
          badge.className = 'tag is-dark is-light';
          badge.style.fontSize = '0.65rem';
          badge.style.height = '1.2rem';
          badge.style.padding = '0 5px';
          badge.style.flexShrink = '0';
          badge.textContent = 'X';
          headerLine.appendChild(badge);
        } else if (curve.color) {
          const dot = document.createElement('span');
          dot.style.display = 'inline-block';
          dot.style.width = '8px';
          dot.style.height = '8px';
          dot.style.borderRadius = '50%';
          dot.style.backgroundColor = curve.color;
          dot.style.flexShrink = '0';
          headerLine.appendChild(dot);
        }

        const origLabel = document.createElement('span');
        origLabel.className = 'is-size-7 has-text-grey export-rename-orig-label';
        const origLabelText = origUnit ? `${origTitle} (${origUnit})` : origTitle;
        origLabel.textContent = origLabelText;
        origLabel.title = origLabelText;
        headerLine.appendChild(origLabel);
        row.appendChild(headerLine);

        const inputsRow = document.createElement('div');
        inputsRow.className = 'is-flex';
        inputsRow.style.gap = '6px';

        const titleInputEl = document.createElement('input');
        titleInputEl.type = 'text';
        titleInputEl.className = 'input is-small';
        titleInputEl.style.flex = '1 1 62%';
        titleInputEl.style.minWidth = '0';
        titleInputEl.placeholder = origTitle;
        titleInputEl.value = currentTitle;
        titleInputEl.setAttribute('aria-label', `Nom d'export pour ${origTitle}`);

        const unitInputEl = document.createElement('input');
        unitInputEl.type = 'text';
        unitInputEl.className = 'input is-small';
        unitInputEl.style.flex = '1 1 38%';
        unitInputEl.style.minWidth = '0';
        unitInputEl.placeholder = 'Unité';
        unitInputEl.value = currentUnit;
        unitInputEl.setAttribute('aria-label', `Unité d'export pour ${origTitle}`);

        const handleLabelInput = () => {
          const nextTitle = titleInputEl.value.trim();
          const nextUnit = unitInputEl.value.trim();
          const sameAsOriginal = (nextTitle === '' || nextTitle === origTitle) && nextUnit === origUnit;

          if (sameAsOriginal) {
            delete this.exportCurveLabels[origTitle];
          } else {
            this.exportCurveLabels[origTitle] = {
              title: nextTitle,
              unit: nextUnit
            };
          }

          if (renameDebounceTimer) clearTimeout(renameDebounceTimer);
          renameDebounceTimer = setTimeout(() => {
            updatePreview();
          }, 200);
        };

        titleInputEl.addEventListener('input', handleLabelInput);
        unitInputEl.addEventListener('input', handleLabelInput);

        inputsRow.appendChild(titleInputEl);
        inputsRow.appendChild(unitInputEl);
        row.appendChild(inputsRow);
        renameList.appendChild(row);
      });
    };

    const updatePreview = () => {
      const action = actionSelect.value;
      const title = titleInput.value.trim();
      const dims = getChartDimensions();
      const iframeContainer = iframe.parentElement;
      const textScale = getTextScale();

      if (action === 'image') {
        sectionsContainer.classList.add('is-hidden');
        imageOptions.classList.remove('is-hidden');
        confirmBtn.textContent = "Télécharger l'image";
        if (previewTitleEl) previewTitleEl.textContent = "Aperçu de l'image";
        copyBtn.classList.remove('is-hidden');
        iframeContainer.classList.remove('has-background-grey-lighter');
        iframeContainer.classList.add('has-background-white');

        updateImageOptionsUI();
        const transparentBg = isTransparentBgActive();
        iframe.srcdoc = this.generateImagePreviewHTML(title, dims.w, dims.h, textScale, this.exportCurveLabels, {
          transparentBg
        });
      } else {
        sectionsContainer.classList.remove('is-hidden');
        imageOptions.classList.add('is-hidden');
        confirmBtn.textContent = "Imprimer / Exporter en PDF";
        if (previewTitleEl) previewTitleEl.textContent = "Aperçu du document";
        copyBtn.classList.add('is-hidden');
        iframeContainer.classList.add('has-background-grey-lighter');
        iframeContainer.classList.remove('has-background-white');

        const includeGraph = $('#export-check-graph').checked;
        const modelsCheckbox = $('#export-check-models');
        const modelsLabel = $('#export-models-label');
        const visibleModelsCount = Array.isArray(this.data?.models)
          ? this.data.models.filter(m => m && m.visible !== false).length
          : 0;
        if (modelsCheckbox) {
          modelsCheckbox.disabled = visibleModelsCount === 0;
        }
        if (modelsLabel) {
          modelsLabel.textContent = visibleModelsCount > 0
            ? `Modélisations (${visibleModelsCount})`
            : 'Modélisations (aucune)';
        }
        const includeModels = Boolean(modelsCheckbox && modelsCheckbox.checked && visibleModelsCount > 0);
        const includeTable = $('#export-check-table').checked;
        const includeCalc = $('#export-check-calc').checked;
        const margin = $('#export-margin-select').value;
        const orientation = $('#export-orientation-select')?.value || 'portrait';
        const tableLayout = $('#export-table-layout')?.value || 'vertical';

        const tableLayoutField = $('#export-table-layout-field');
        if (tableLayoutField) {
          tableLayoutField.classList.toggle('is-hidden', !includeTable);
        }

        const tableLabel = $('#export-table-label');
        if (tableLabel) {
          const totalPoints = (this.data && this.data.getTable) ? this.data.getTable().length : 0;
          if (totalPoints > MAX_PRINT_TABLE_POINTS) {
            tableLabel.textContent = `Tableur (Données - limité aux ${MAX_PRINT_TABLE_POINTS} premiers points)`;
          } else {
            tableLabel.textContent = 'Tableur (Données)';
          }
        }

        iframe.srcdoc = this.generatePrintHTML(
          includeGraph,
          includeTable,
          includeCalc,
          margin,
          title,
          dims.w,
          dims.h,
          textScale,
          this.exportCurveLabels,
          { includeModels, orientation, tableLayout }
        );
      }
    };

    $('#export-menu-button').addEventListener('click', () => {
      const emptyStateContainer = document.getElementById('empty-state-container');
      const isEmptyState = emptyStateContainer && !emptyStateContainer.classList.contains('is-hidden');
      const hasNoData = (!this.data?.curves || this.data.curves.length === 0) &&
                        (!this.editor?.getValue || this.editor.getValue().trim() === '');

      if (isEmptyState || hasNoData) {
        showToast("Aucune donnée à exporter.", "is-warning");
        return;
      }

      const graphTabButton = document.getElementById('grapheur-tab');
      const isAlreadyOnGraph = graphTabButton && graphTabButton.classList.contains('is-active');

      if (!isAlreadyOnGraph && graphTabButton) {
        // Bascule automatique sur l'onglet graphe
        graphTabButton.click();

        // Délai de 300ms pour laisser le temps à l'onglet de s'afficher et à Highcharts de reflow
        setTimeout(() => {
          populateRenameList();
          updatePreview();
          this.common.modalManager.openModal(exportModal);
        }, 300);
      } else {
        // Si on y est déjà, on affiche la modale instantanément
        populateRenameList();
        updatePreview();
        this.common.modalManager.openModal(exportModal);
      }
    });

    actionSelect.addEventListener('change', () => {
      saveExportPrefs();
      updatePreview();
    });
    document.querySelectorAll('.export-trigger').forEach(el => el.addEventListener('change', () => {
      saveExportPrefs();
      updatePreview();
    }));
    if (formatSelect) {
      formatSelect.addEventListener('change', () => {
        const hadTransparent = Boolean(transparentBgCheckbox && transparentBgCheckbox.checked);
        saveExportPrefs();
        updateImageOptionsUI();
        if (hadTransparent && actionSelect.value === 'image') {
          updatePreview();
        }
      });
    }
    if (scaleSelect) {
      scaleSelect.addEventListener('change', () => {
        saveExportPrefs();
        updateImageOptionsUI();
      });
    }
    if (renameResetBtn) {
      renameResetBtn.addEventListener('click', () => {
        if (renameDebounceTimer) clearTimeout(renameDebounceTimer);
        this.exportCurveLabels = {};
        populateRenameList();
        updatePreview();
      });
    }

    titleInput.addEventListener('input', (e) => {
      const newTitle = e.target.value.trim();
      if (filenameInput) {
        filenameInput.placeholder = newTitle ? sanitizeExportFilename(newTitle) : 'phyweb_graphe';
      }

      if (actionSelect.value === 'image') {
        if (titleDebounceTimer) clearTimeout(titleDebounceTimer);
        titleDebounceTimer = setTimeout(() => {
          updatePreview();
        }, 200);
        return;
      }

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const titleEl = iframeDoc.getElementById('preview-title');
        if (titleEl) {
          titleEl.textContent = newTitle;
          // Affiche le titre s'il y a du texte, sinon le cache
          titleEl.style.display = newTitle ? 'block' : 'none';
        }
      }
    });

    confirmBtn.addEventListener('click', () => {
      if (actionSelect.value === 'image') {
        const format = formatSelect ? formatSelect.value : 'image/png';
        const scale = (format === 'image/svg+xml') ? 1 : (parseInt(scaleSelect?.value, 10) || 1);
        const dims = getChartDimensions();
        const textScale = getTextScale();
        const title = titleInput.value.trim();
        const transparentBg = isTransparentBgActive();
        const rawFilename = filenameInput?.value?.trim() || title;
        const filename = sanitizeExportFilename(rawFilename, 'phyweb_graphe');

        if (this.grapher && this.grapher.chart) {
          const exportChartOptions = this.getExportChartOptions(dims.w, dims.h, textScale, this.exportCurveLabels, {
            title,
            transparentBg
          });

          this._withExportLegendState(() => {
            this.grapher.chart.exportChartLocal({
              type: format,
              filename: filename,
              scale: scale,
              sourceWidth: dims.w,
              sourceHeight: dims.h
            }, exportChartOptions);
          });
        }
        this.common.modalManager.closeAllModals();
      } else {
        const includeGraph = $('#export-check-graph').checked;
        const visibleModelsCount = Array.isArray(this.data?.models)
          ? this.data.models.filter(m => m && m.visible !== false).length
          : 0;
        const includeModels = Boolean($('#export-check-models')?.checked && visibleModelsCount > 0);
        const includeTable = $('#export-check-table').checked;
        const includeCalc = $('#export-check-calc').checked;

        if (!includeGraph && !includeModels && !includeTable && !includeCalc) {
          showToast("Veuillez sélectionner au moins un élément.", "is-warning");
          return;
        }

        iframe.contentWindow.print();
      }
    });

    copyBtn.addEventListener('click', () => {
      if (!navigator.clipboard || typeof navigator.clipboard.write !== 'function' || typeof ClipboardItem === 'undefined') {
        showToast("La copie d'image n'est pas supportée par ce navigateur.", "is-warning");
        return;
      }

      const dims = getChartDimensions();
      const textScale = getTextScale();
      const scale = parseInt(scaleSelect?.value, 10) || 1;
      const title = titleInput.value.trim();
      const transparentBg = Boolean(transparentBgCheckbox && transparentBgCheckbox.checked);

      if (this.grapher && this.grapher.chart) {
        // 1. Récupère le SVG brut
        const exportChartOptions = this.getExportChartOptions(dims.w, dims.h, textScale, this.exportCurveLabels, {
          title,
          transparentBg
        });
        const svg = this._withExportLegendState(() => this.grapher.chart.getSVG(exportChartOptions));

        // 2. Prépare un canvas avec la résolution voulue (scale)
        const canvas = document.createElement('canvas');
        canvas.width = dims.w * scale;
        canvas.height = dims.h * scale;
        const ctx = canvas.getContext('2d');
        if (!transparentBg) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 3. Dessine le SVG sur le Canvas via Blob URL (évite unescape() déprécié)
        const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(svgUrl);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 4. Extrait le PNG et l'envoie au presse-papier
          canvas.toBlob((blob) => {
            if (!blob) {
              showToast("Erreur lors de la génération de l'image.", "is-danger");
              return;
            }
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
              showToast("Image copiée dans le presse-papier !", "is-success");
              this.common.modalManager.closeAllModals();
            }).catch(err => {
              console.error("Erreur Clipboard:", err);
              showToast("Erreur lors de la copie.", "is-danger");
            });
          }, 'image/png');
        };
        img.onerror = (err) => {
          URL.revokeObjectURL(svgUrl);
          console.error("Erreur de rendu SVG pour copie:", err);
          showToast("Erreur lors de la génération de l'image.", "is-danger");
        };
        img.src = svgUrl;
      }
    });
  }

  /**
   * Ajuste temporairement showInLegend dans userOptions pour l'export,
   * afin que les séries masquées n'apparaissent pas barrées dans la légende exportée.
   * Restaure systématiquement l'état original après l'exécution du callback.
   * @param {Function} callback
   * @returns {*}
   */
  _withExportLegendState(callback) {
    const series = this.grapher?.chart?.series || [];
    const savedStates = [];

    for (const s of series) {
      if (!s) continue;
      const createdUserOptions = !s.userOptions;
      if (createdUserOptions) {
        s.userOptions = {};
      }
      const hadProperty = Object.prototype.hasOwnProperty.call(s.userOptions, 'showInLegend');
      const originalValue = s.userOptions.showInLegend;
      savedStates.push({ series: s, createdUserOptions, hadProperty, originalValue });
      s.userOptions.showInLegend = Boolean(s.visible && s.options?.showInLegend !== false);
    }

    try {
      return callback();
    } finally {
      for (const { series: s, createdUserOptions, hadProperty, originalValue } of savedStates) {
        if (createdUserOptions) {
          delete s.userOptions;
        } else if (hadProperty) {
          s.userOptions.showInLegend = originalValue;
        } else {
          delete s.userOptions.showInLegend;
        }
      }
    }
  }

  /**
   * Calcule les dimensions de référence (en px) du graphique exporté selon le ratio choisi,
   * indépendamment de l'échelle des textes.
   * @param {string} [ratio='16:10']
   * @returns {{ w: number, h: number }}
   */
  getExportDimensions(ratio = '16:10') {
    if (ratio && Object.prototype.hasOwnProperty.call(EXPORT_RATIO_DIMENSIONS, ratio)) {
      const preset = EXPORT_RATIO_DIMENSIONS[ratio];
      return { w: preset.w, h: preset.h };
    }
    const chartWidth = this.grapher?.chart?.chartWidth;
    const chartHeight = this.grapher?.chart?.chartHeight;
    if (Number.isFinite(chartWidth) && chartWidth > 0 && Number.isFinite(chartHeight) && chartHeight > 0) {
      return {
        w: Math.round(chartWidth),
        h: Math.round(chartHeight)
      };
    }
    return { ...EXPORT_RATIO_DIMENSIONS['16:10'] };
  }

  /**
   * Retourne le libellé (titre + unité) à afficher à l'export pour une grandeur donnée,
   * en appliquant les éventuelles surcharges d'export sans modifier les données d'origine.
   * @param {string} curveTitle - Symbole original de la grandeur.
   * @param {string} [defaultUnit=''] - Unité d'origine de la grandeur.
   * @param {Object|null} [overrides=this.exportCurveLabels] - Dictionnaire de surcharges.
   * @returns {{ title: string, unit: string }}
   */
  getExportCurveLabel(curveTitle, defaultUnit = '', overrides = this.exportCurveLabels) {
    const override = (overrides && curveTitle && Object.prototype.hasOwnProperty.call(overrides, curveTitle))
      ? overrides[curveTitle]
      : null;

    const customTitle = override && typeof override.title === 'string' ? override.title.trim() : '';
    const title = customTitle || (curveTitle || '');
    const unit = (override && typeof override.unit === 'string')
      ? override.unit.trim()
      : (defaultUnit || '');

    return { title, unit };
  }

  /**
   * Génère les options communes pour l'export du graphique (image ou PDF)
   * @param {number} width - Largeur de référence du SVG (en px)
   * @param {number} height - Hauteur de référence du SVG (en px)
   * @param {number} [textScale=1] - Facteur d'échelle des textes et repères (1 = 100%)
   * @param {Object|null} [curveLabels=this.exportCurveLabels] - Surcharges de noms/unités pour l'export
   * @param {Object} [extraOptions={}] - Options additionnelles (title, transparentBg)
   */
  getExportChartOptions(width, height, textScale = 1, curveLabels = this.exportCurveLabels, extraOptions = {}) {
    if (!this.grapher || !this.grapher.chart) return {};

    const self = this;
    const scale = Number.isFinite(textScale) && textScale > 0 ? textScale : 1;
    const spacingFactor = Math.max(1, scale);
    const axisTitleFontSize = `${Math.round(16 * scale)}px`;
    const axisLabelFontSize = `${Math.round(12 * scale)}px`;
    const legendFontSize = `${Math.round(16 * scale)}px`;
    const chartTitleText = typeof extraOptions.title === 'string' ? extraOptions.title.trim() : '';
    const transparentBg = Boolean(extraOptions.transparentBg);

    const resolvedOverrides = {};
    if (curveLabels && typeof curveLabels === 'object') {
      for (const [key, val] of Object.entries(curveLabels)) {
        if (val && typeof val === 'object') {
          resolvedOverrides[key] = {
            title: typeof val.title === 'string' ? val.title.trim() : '',
            unit: typeof val.unit === 'string' ? val.unit.trim() : ''
          };
        }
      }
    }

    const rawXTitle = this.grapher.currentXCurve || '';
    const xCurveObj = this.data?.getCurveByTitle ? this.data.getCurveByTitle(rawXTitle) : null;
    const { title: xDisplayTitle, unit: rawXUnit } = this.getExportCurveLabel(rawXTitle, xCurveObj?.unit || '', resolvedOverrides);
    const xAxis = this.grapher.chart.xAxis && this.grapher.chart.xAxis[0];
    const xExponent = (xAxis && xAxis.exponent) || 0;
    const xTitle = formatAxisLabelWithUnit(xDisplayTitle, rawXUnit, xExponent);

    const currentYExponent = (this.grapher.chart.yAxis && this.grapher.chart.yAxis[0] && this.grapher.chart.yAxis[0].exponent) || 0;

    return {
      chart: {
        width: width,
        height: height,
        backgroundColor: transparentBg ? 'transparent' : '#ffffff',
        plotBackgroundColor: transparentBg ? 'transparent' : null,
        exportTextScale: scale,
        exportCurveLabels: resolvedOverrides,
        exportXExponent: xExponent,
        exportYExponent: currentYExponent,
        spacing: [
          Math.round(10 * spacingFactor),
          Math.round(10 * spacingFactor),
          Math.round(15 * spacingFactor),
          Math.round(10 * spacingFactor)
        ]
      },
      title: {
        text: chartTitleText || null,
        style: {
          color: '#222222',
          fontSize: `${Math.round(18 * scale)}px`,
          fontWeight: '600'
        }
      },
      xAxis: [{
        title: {
          text: xTitle,
          align: 'high',
          style: {
            color: '#000000',
            fontSize: axisTitleFontSize,
            fontWeight: 'normal'
          }
        },
        labels: {
          style: {
            fontSize: axisLabelFontSize
          }
        }
      }],
      yAxis: [{
        labels: {
          style: {
            fontSize: axisLabelFontSize
          }
        }
      }],
      legend: {
        useHTML: false,
        itemStyle: {
          fontSize: legendFontSize,
          color: '#000000'
        },
        symbolWidth: Math.round(16 * scale),
        itemDistance: Math.round(20 * scale),
        labelFormatter: function () {
          const { title: displayName, unit: rawUnit } = self.getExportCurveLabel(
            this.name || '',
            this.userOptions?.unit || '',
            resolvedOverrides
          );
          const yAxis = this.chart && this.chart.yAxis && this.chart.yAxis[0];
          const yExponent = (yAxis && yAxis.exponent) || currentYExponent || 0;

          return formatAxisLabelWithUnit(displayName, rawUnit, yExponent);
        }
      }
    };
  }

  /**
   * Génère l'aperçu spécifique pour le mode Image
   */
  generateImagePreviewHTML(title, width, height, factor, curveLabels = this.exportCurveLabels, imageOptions = {}) {
    if (!this.grapher || !this.grapher.chart) return '';

    const transparentBg = Boolean(imageOptions.transparentBg);
    const exportChartOptions = this.getExportChartOptions(width, height, factor, curveLabels, {
      title,
      transparentBg
    });
    const svg = this._withExportLegendState(() => this.grapher.chart.getSVG(exportChartOptions));
    return buildImagePreviewHTML(svg, { transparentBg });
  }

  /**
   * Retourne une composition HTML propre pour l'impression / export PDF
   * @param {boolean} includeGraph
   * @param {boolean} includeTable
   * @param {boolean} includeCalc
   * @param {string} margin
   * @param {string} title
   * @param {number} width
   * @param {number} height
   * @param {number} factor
   * @param {Object|null} [curveLabels=this.exportCurveLabels]
   * @param {Object} [printOptions={}]
   * @param {boolean} [printOptions.includeModels=false]
   * @param {'portrait'|'landscape'} [printOptions.orientation='portrait']
   * @param {'horizontal'|'vertical'} [printOptions.tableLayout='horizontal']
   */
  generatePrintHTML(
    includeGraph,
    includeTable,
    includeCalc,
    margin,
    title,
    width,
    height,
    factor,
    curveLabels = this.exportCurveLabels,
    printOptions = {}
  ) {
    const sigDigits = this.data?.settings?.significantDigits ?? 4;
    const includeModels = Boolean(printOptions.includeModels);

    let svg = '';
    if (includeGraph && this.grapher?.chart) {
      const exportChartOptions = this.getExportChartOptions(width, height, factor, curveLabels);
      svg = this._withExportLegendState(() => this.grapher.chart.getSVG(exportChartOptions));
    }

    const visibleModels = (includeModels && Array.isArray(this.data?.models))
      ? this.data.models.filter(m => m && m.visible !== false)
      : [];

    let tableHeaders = [];
    let tableData = [];
    if (includeTable && this.data) {
      const hasCurves = Array.isArray(this.data.curves) && this.data.curves.length > 0;
      tableHeaders = hasCurves
        ? this.data.curves.map(c => {
            const { title: displayTitle, unit: displayUnit } = this.getExportCurveLabel(c.title, c.unit || '', curveLabels);
            const formattedUnit = formatUnit(displayUnit);
            return formattedUnit ? `${displayTitle} (${formattedUnit})` : displayTitle;
          })
        : (this.data.getHeaders() || []);
      tableData = this.data.getTable() || [];
    }

    const calcText = (includeCalc && this.editor) ? (this.editor.getValue() || '') : '';

    return buildPrintHTML({
      title,
      margin,
      orientation: printOptions.orientation,
      tableLayout: printOptions.tableLayout,
      significantDigits: sigDigits,
      includeGraph: Boolean(includeGraph && svg),
      svg,
      includeModels: visibleModels.length > 0,
      models: visibleModels,
      parameters: this.data?.parameters || {},
      includeTable: Boolean(includeTable && this.data),
      tableHeaders,
      tableData,
      includeCalc: Boolean(includeCalc && this.editor),
      calcText,
      getExportCurveLabel: (t, u) => this.getExportCurveLabel(t, u, curveLabels)
    });
  }
}

export { ExportManager };
