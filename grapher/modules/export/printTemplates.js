import { formatNumber, formatUnit } from '../../../common/formatter.js';

export const MAX_PRINT_TABLE_POINTS = 500;

/**
 * Échappe les caractères HTML spéciaux pour prévenir les injections XSS
 * et les balises cassées lors de l'interpolation dans un template HTML.
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Génère le HTML d'aperçu pour l'export image.
 * @param {string} svg
 * @param {{ transparentBg?: boolean }} [options]
 * @returns {string}
 */
export function buildImagePreviewHTML(svg, { transparentBg = false } = {}) {
  const bodyBgStyle = transparentBg
    ? 'background-color: #ffffff; background-image: repeating-conic-gradient(#e6e6e6 0% 25%, #ffffff 0% 50%); background-size: 16px 16px;'
    : 'background-color: white;';

  return `
      <body style="${bodyBgStyle} font-family: sans-serif; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; box-sizing: border-box;">
      <div style="flex-grow: 1; display: flex; justify-content: center; align-items: center; width: 100%; min-height: 0;">
        ${svg}
      </div>
      <style>
        /* On force le SVG à s'étirer pour remplir l'iframe tout en gardant son ratio */
        svg { 
          width: 100% !important; 
          height: 100% !important; 
          max-height: 100%;
        }
      </style>
      </body>`;
}

/**
 * Construit le document HTML complet pour l'impression / export PDF.
 * @param {object} params
 * @returns {string}
 */
export function buildPrintHTML({
  title = '',
  margin = '10mm',
  orientation = 'portrait',
  tableLayout = 'horizontal',
  significantDigits = 4,
  includeGraph = false,
  svg = '',
  includeModels = false,
  models = [],
  parameters = {},
  includeTable = false,
  tableHeaders = [],
  tableData = [],
  includeCalc = false,
  calcText = '',
  getExportCurveLabel = (t, u) => ({ title: t || '', unit: u || '' })
}) {
  const isLandscape = orientation === 'landscape';
  const normalizedLayout = tableLayout === 'vertical' ? 'vertical' : 'horizontal';
  const pageWidthMm = isLandscape ? '297mm' : '210mm';
  const pageHeightMm = isLandscape ? '210mm' : '297mm';
  const svgMaxHeightMm = isLandscape ? '160mm' : '240mm';

  let html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4 ${isLandscape ? 'landscape' : 'portrait'}; margin: ${margin}; }
          
          /* --- Mode Aperçu (Écran) --- */
          @media screen {
            html {
              background-color: transparent;
              min-height: 100%;
              box-sizing: border-box;
            }
            body {
              background-color: transparent;
              margin: 0;
              padding: 16px;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
              box-sizing: border-box;
              overflow-x: hidden;
            }
            .a4-sheet { 
              background-color: white;
              width: ${pageWidthMm};
              min-height: ${pageHeightMm};
              padding: ${margin};
              box-sizing: border-box;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              transform-origin: top center;
              flex-shrink: 0;
            }
          }
          
          /* --- Mode Impression --- */
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            .a4-sheet { 
              padding: 0 !important; 
              width: auto !important;
              min-height: auto !important;
              box-shadow: none !important;
              transform: none !important;
              margin: 0 !important;
            }
          }

          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            color: #333; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .section-title {
            font-size: 13px;
            font-weight: 600;
            color: #444;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
            margin: 14px 0 10px 0;
            page-break-after: avoid;
          }

          /* Modélisations */
          .models-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 10px;
            margin-bottom: 16px;
          }
          .model-card {
            border: 1px solid #ddd;
            border-left: 4px solid #3273dc;
            border-radius: 4px;
            padding: 8px 10px;
            background-color: #fcfcfc;
            font-size: 11px;
            page-break-inside: avoid;
          }
          .model-card-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 6px;
            margin-bottom: 4px;
          }
          .model-card-title {
            font-weight: 700;
            font-size: 12px;
            color: #222;
          }
          .model-card-type {
            font-size: 10px;
            color: #666;
          }
          .model-card-equation {
            font-family: 'Cambria Math', 'Times New Roman', serif;
            font-size: 12px;
            margin: 3px 0 6px 0;
            color: #111;
          }
          .model-card-list {
            list-style: none;
            margin: 0;
            padding: 0;
          }
          .model-card-list li {
            margin: 1px 0;
          }
          .model-card-quality {
            margin-top: 5px;
            padding-top: 4px;
            border-top: 1px dashed #e0e0e0;
            color: #555;
            font-size: 10.5px;
          }

          /* Tableau horizontal (flex) */
          .flex-table { display: flex; flex-wrap: wrap; row-gap: 6px; padding-left: 1px; padding-top: 1px; margin-bottom: 20px; }
          .flex-col { display: flex; flex-direction: column; margin-left: -1px; }
          .header-col { font-weight: bold; background-color: #f0f0f0; }
          .flex-cell { border: 1px solid #aaa; margin-top: -1px; padding: 4px 6px; font-size: 10px; text-align: center; white-space: nowrap; }
          .row-header { text-align: right; background-color: #f9f9f9; }

          /* Tableau vertical (classique avec répétition d'en-tête) */
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 10.5px;
          }
          table.data-table thead { display: table-header-group; }
          table.data-table tr { page-break-inside: avoid; }
          table.data-table th,
          table.data-table td {
            border: 1px solid #bbb;
            padding: 4px 7px;
            text-align: center;
          }
          table.data-table th {
            background-color: #f0f0f0;
            font-weight: 600;
            color: #222;
          }
          table.data-table tbody tr:nth-child(even) {
            background-color: #fafafa;
          }
          table.data-table td.point-idx {
            background-color: #f5f5f5;
            font-weight: 600;
            width: 1%;
            white-space: nowrap;
          }
          
          pre { background: #f9f9f9; padding: 12px; border: 1px solid #ddd; border-radius: 5px; white-space: pre-wrap; font-family: monospace; font-size: 11.5px; margin-top: 0; }
          
          .svg-container { text-align: center; margin-bottom: 16px; page-break-inside: avoid; }
          /* Remplit proprement la largeur imprimable tout en conservant le ratio */
          .svg-container svg { width: 100%; max-width: 100%; max-height: ${svgMaxHeightMm}; height: auto !important; display: block; margin: 0 auto; }
        </style>
      </head>
      <body>
      <div class="a4-sheet" id="a4-sheet">
    `;

  const safeTitle = escapeHTML(title);
  html += `<h1 id="preview-title" style="text-align: center; color: #333; margin-top: 0; margin-bottom: 16px; font-size: 18px; display: ${safeTitle ? 'block' : 'none'};">${safeTitle}</h1>`;

  if (includeGraph && svg) {
    html += `<div class="svg-container">${svg}</div>`;
  }

  if (includeModels && Array.isArray(models) && models.length > 0) {
    html += `<h2 class="section-title">Modélisations</h2><div class="models-grid">`;
    models.forEach(model => {
      const xRawTitle = model.x?.title || '';
      const yRawTitle = model.y?.title || '';
      const { title: xDisplay, unit: xUnit } = getExportCurveLabel(xRawTitle, model.x?.unit || '');
      const { title: yDisplay } = getExportCurveLabel(yRawTitle, model.y?.unit || '');
      const safeColor = escapeHTML(model.color || '#3273dc');
      const modelName = typeof model.getModelName === 'function' ? escapeHTML(model.getModelName()) : escapeHTML(model.type || '');
      const equationHtml = typeof model.getEquationString === 'function' ? model.getEquationString() : '';

      html += `<div class="model-card" style="border-left-color: ${safeColor};">`;
      html += `<div class="model-card-header"><span class="model-card-title">${escapeHTML(yDisplay)} = f(${escapeHTML(xDisplay)})</span><span class="model-card-type">${modelName}</span></div>`;
      if (equationHtml) {
        html += `<div class="model-card-equation">${equationHtml}</div>`;
      }

      if (Array.isArray(model.parameters) && model.parameters.length > 0) {
        html += `<ul class="model-card-list">`;
        model.parameters.forEach(param => {
          const rawUnit = param.unit || parameters?.[param.name]?.unit || '';
          const formattedUnit = formatUnit(rawUnit);
          const unitText = formattedUnit ? ` ${escapeHTML(formattedUnit)}` : '';
          const formattedVal = (param.value !== null && param.value !== undefined && !isNaN(param.value))
            ? formatNumber(param.value, significantDigits, { html: true })
            : 'Indéfini';
          html += `<li><strong>${escapeHTML(param.name)}</strong> = ${formattedVal}${unitText}</li>`;
        });
        html += `</ul>`;
      }

      if (model.minX != null || model.maxX != null) {
        const minStr = model.minX != null ? formatNumber(model.minX, significantDigits, { html: true }) : '-∞';
        const maxStr = model.maxX != null ? formatNumber(model.maxX, significantDigits, { html: true }) : '+∞';
        const formattedXUnit = formatUnit(xUnit);
        const xUnitSuffix = formattedXUnit ? ` ${escapeHTML(formattedXUnit)}` : '';
        html += `<div class="model-card-quality">Domaine : [${minStr} ; ${maxStr}]${xUnitSuffix}</div>`;
      }

      const rmseStr = model.rmse != null ? formatNumber(model.rmse, significantDigits, { html: true }) : 'Indéfini';
      const r2Str = model.rSquared != null ? formatNumber(model.rSquared, 5, { html: true }) : 'Indéfini';
      html += `<div class="model-card-quality">Écart-type = ${rmseStr} &nbsp;|&nbsp; R² = ${r2Str}</div>`;
      html += `</div>`;
    });
    html += `</div>`;
  }

  if (includeTable && tableHeaders.length > 0 && tableData.length > 0) {
    const totalPoints = tableData.length;
    const numPoints = Math.min(totalPoints, MAX_PRINT_TABLE_POINTS);

    if (includeGraph || includeModels) {
      html += `<h2 class="section-title">Données</h2>`;
    }

    if (normalizedLayout === 'vertical') {
      html += `<table class="data-table"><thead><tr><th>#</th>`;
      tableHeaders.forEach(h => {
        html += `<th>${escapeHTML(h)}</th>`;
      });
      html += `</tr></thead><tbody>`;

      for (let j = 0; j < numPoints; j++) {
        html += `<tr><td class="point-idx">${j + 1}</td>`;
        tableHeaders.forEach((h, colIndex) => {
          const val = tableData[j] ? tableData[j][colIndex] : undefined;
          const displayVal = (val !== null && val !== undefined && !isNaN(val) && val !== '')
            ? formatNumber(val, significantDigits, { html: true })
            : '';
          html += `<td>${displayVal}</td>`;
        });
        html += `</tr>`;
      }
      html += `</tbody></table>`;
    } else {
      html += `<div class="flex-table"><div class="flex-col header-col"><div class="flex-cell row-header">Point #</div>`;
      tableHeaders.forEach(h => html += `<div class="flex-cell row-header">${escapeHTML(h)}</div>`);
      html += `</div>`;

      for (let j = 0; j < numPoints; j++) {
        html += `<div class="flex-col"><div class="flex-cell" style="background-color:#f9f9f9; font-weight:bold;">${j + 1}</div>`;
        tableHeaders.forEach((h, colIndex) => {
          const val = tableData[j] ? tableData[j][colIndex] : undefined;
          const displayVal = (val !== null && val !== undefined && !isNaN(val) && val !== '')
            ? formatNumber(val, significantDigits, { html: true }) : '';
          html += `<div class="flex-cell">${displayVal}</div>`;
        });
        html += `</div>`;
      }
      html += `</div>`;
    }

    if (totalPoints > MAX_PRINT_TABLE_POINTS) {
      const totalPointsFormatted = totalPoints.toLocaleString('fr-FR');
      html += `
            <div class="print-table-notice" style="font-size: 11px; color: #555; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; padding: 8px 12px; margin-top: -10px; margin-bottom: 20px; text-align: center;">
              Affichage limité aux ${MAX_PRINT_TABLE_POINTS} premiers points (sur ${totalPointsFormatted} au total) pour préserver la fluidité d'impression. Pour exploiter l'ensemble des données, utilisez l'export de fichier (CSV / RW3).
            </div>
          `;
    }
  }

  if (includeCalc) {
    if (includeGraph || includeModels || includeTable) {
      html += `<h2 class="section-title">Feuille de calculs</h2>`;
    }
    const safeCalcText = escapeHTML(calcText || '');
    html += `<pre>${safeCalcText.trim() ? safeCalcText : 'Aucun calcul enregistré.'}</pre>`;
  }

  html += `
      </div>
      <script>
        (function() {
          function fitSheet() {
            var sheet = document.getElementById('a4-sheet');
            if (!sheet) return;
            sheet.style.transform = '';
            sheet.style.marginBottom = '';
            var available = document.documentElement.clientWidth - 32;
            var sheetW = sheet.offsetWidth;
            if (sheetW > 0 && available > 0 && sheetW > available) {
              var scale = available / sheetW;
              sheet.style.transform = 'scale(' + scale + ')';
              sheet.style.marginBottom = '-' + Math.round(sheet.offsetHeight * (1 - scale)) + 'px';
            }
          }
          window.addEventListener('load', fitSheet);
          window.addEventListener('resize', fitSheet);
          fitSheet();
        })();
      </script>
      </body></html>`;
  return html;
}
