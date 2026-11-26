// Rendu SVG autonome et fonctions d'export (SVG, PNG HD, Presse-papier, JSON)
import { getCatalogItem, SVG_SHARED_STYLES } from './catalog.js';
import { localToWorld, computeConnectorGeometry } from './snapping.js';
import { resolveConnectorEndpoints } from './state.js';

function esc(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Calcule la boîte englobante globale de tous les éléments de la scène.
 */
export function computeSceneBounds(scene, padding = 36) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const expand = (x, y) => {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    };

    for (const item of scene.items) {
        const def = getCatalogItem(item.type);
        if (!def) continue;
        const bb = def.getBBox(item.props || {});
        const corners = [
            localToWorld(item, bb.x, bb.y),
            localToWorld(item, bb.x + bb.width, bb.y),
            localToWorld(item, bb.x, bb.y + bb.height),
            localToWorld(item, bb.x + bb.width, bb.y + bb.height)
        ];
        for (const c of corners) expand(c.x, c.y);
    }

    for (const conn of scene.connectors) {
        const { p1, p2 } = resolveConnectorEndpoints(conn, scene.items);
        const geom = computeConnectorGeometry(p1, p2, conn.mode, conn.bend, conn.bendX || 0);
        const margin = Math.max(12, (Number(conn.width) || 4) + 6);
        expand(geom.bounds.minX - margin, geom.bounds.minY - margin);
        expand(geom.bounds.maxX + margin, geom.bounds.maxY + margin);
    }

    for (const lbl of scene.labels) {
        const m = getLabelMetrics(lbl);
        expand(m.boxX - 4, m.boxY - 4);
        expand(m.boxX + m.boxW + 4, m.boxY + m.boxH + 4);
        if (lbl.showLeader) {
            expand(lbl.targetX, lbl.targetY);
        }
    }

    if (!isFinite(minX)) {
        return { x: 0, y: 0, width: 800, height: 600 };
    }

    return {
        x: Math.floor(minX - padding),
        y: Math.floor(minY - padding),
        width: Math.ceil(maxX - minX + padding * 2),
        height: Math.ceil(maxY - minY + padding * 2)
    };
}

/**
 * Construit le markup SVG d'un connecteur (fil ou tuyau).
 */
export function renderConnectorSVG(conn, items) {
    const { p1, p2 } = resolveConnectorEndpoints(conn, items);
    const { d, mid } = computeConnectorGeometry(p1, p2, conn.mode, conn.bend, conn.bendX || 0);
    const arrowAngle = conn.reverseArrow ? mid.angle + 180 : mid.angle;
    const dashAttr = conn.dashed ? 'stroke-dasharray="8 6"' : '';

    if (conn.kind === 'hose') {
        const w = Number(conn.width) || 8;
        const innerW = Math.max(2, w - 3.5);
        const arrowSvg = conn.showArrow
            ? `<g transform="translate(${mid.x.toFixed(1)}, ${mid.y.toFixed(1)}) rotate(${arrowAngle.toFixed(1)})">
                 <polygon points="8,0 -5,-5 -2,0 -5,5" fill="#1e293b" stroke="#ffffff" stroke-width="1" />
               </g>`
            : '';
        return `
          <path d="${d}" fill="none" stroke="#000000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${dashAttr} />
          <path d="${d}" fill="none" stroke="${esc(conn.color || '#74c0fc')}" stroke-width="${innerW.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" ${dashAttr} />
          ${arrowSvg}
        `;
    }

    const w = Number(conn.width) || 3.5;
    const arrowSvg = conn.showArrow
        ? `<g transform="translate(${mid.x.toFixed(1)}, ${mid.y.toFixed(1)}) rotate(${arrowAngle.toFixed(1)})">
             <polygon points="8,0 -6,-5.5 -3,0 -6,5.5" fill="${esc(conn.color || '#e03131')}" stroke="#ffffff" stroke-width="0.8" />
           </g>`
        : '';
    return `
      <path d="${d}" fill="none" stroke="${esc(conn.color || '#e03131')}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${dashAttr} />
      <circle cx="${p1.x.toFixed(1)}" cy="${p1.y.toFixed(1)}" r="3.5" fill="${esc(conn.color || '#e03131')}" stroke="#000000" stroke-width="1.2" />
      <circle cx="${p2.x.toFixed(1)}" cy="${p2.y.toFixed(1)}" r="3.5" fill="${esc(conn.color || '#e03131')}" stroke="#000000" stroke-width="1.2" />
      ${arrowSvg}
    `;
}

let _measureCtx = null;

function measureTextWidth(lines, fs, bold, italic) {
    if (typeof document !== 'undefined') {
        if (!_measureCtx) {
            const c = document.createElement('canvas');
            _measureCtx = c.getContext('2d');
        }
        if (_measureCtx) {
            _measureCtx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fs}px system-ui, -apple-system, 'Segoe UI', sans-serif`;
            let maxW = 0;
            for (const line of lines) {
                const w = _measureCtx.measureText(line).width;
                if (w > maxW) maxW = w;
            }
            if (maxW > 0) return maxW;
        }
    }
    const maxLen = Math.max(1, ...lines.map(l => l.length));
    return maxLen * fs * 0.58;
}

/**
 * Calcule la géométrie estimée (ou mesurée exactement dans le navigateur) d'une légende.
 */
export function getLabelMetrics(lbl) {
    const fs = Number(lbl.fontSize) || 16;
    const lines = String(lbl.text || '').split('\n');
    const lineHeight = fs * 1.25;
    const textW = measureTextWidth(lines, fs, Boolean(lbl.bold), Boolean(lbl.italic));
    const textH = (lines.length - 1) * lineHeight + fs;
    const align = lbl.align === 'center' || lbl.align === 'right' ? lbl.align : 'left';
    const hasBox = Boolean(lbl.bgEnabled || lbl.borderEnabled);
    const padX = hasBox ? 8 : 0;
    const padY = hasBox ? 5 : 0;

    let textLeft = lbl.x;
    if (align === 'center') textLeft = lbl.x - textW / 2;
    else if (align === 'right') textLeft = lbl.x - textW;

    const textTop = lbl.y - fs * 0.88;
    const boxX = textLeft - padX;
    const boxY = textTop - padY;
    const boxW = textW + padX * 2;
    const boxH = textH + padY * 2;

    return {
        fs,
        lines,
        lineHeight,
        align,
        textAnchor: align === 'center' ? 'middle' : (align === 'right' ? 'end' : 'start'),
        textLeft,
        textTop,
        textW,
        textH,
        hasBox,
        boxX,
        boxY,
        boxW,
        boxH
    };
}

/**
 * Calcule le point d'accroche de la ligne de rappel côté texte (gauche, droite, haut ou bas).
 */
export function getLabelLeaderAnchor(lbl) {
    const m = getLabelMetrics(lbl);
    const { fs, hasBox, boxX, boxY, boxW, boxH } = m;
    const gap = hasBox ? 0 : 6;
    const midY = lbl.y - fs * 0.35;
    if (lbl.targetX < boxX) {
        return { side: 'left', startX: boxX - gap, startY: midY, metrics: m };
    }
    if (lbl.targetX > boxX + boxW) {
        return { side: 'right', startX: boxX + boxW + gap, startY: midY, metrics: m };
    }
    if (lbl.targetY < lbl.y - fs * 0.5) {
        return { side: 'top', startX: boxX + boxW / 2, startY: boxY - (hasBox ? 0 : 4), metrics: m };
    }
    return { side: 'bottom', startX: boxX + boxW / 2, startY: boxY + boxH + (hasBox ? 0 : 4), metrics: m };
}

/**
 * Construit le markup SVG d'une légende (texte, fond/cadre optionnel + ligne de rappel droite ou coudée).
 */
export function renderLabelSVG(lbl, options = {}) {
    const interactive = Boolean(options?.interactive);
    const anchor = getLabelLeaderAnchor(lbl);
    const m = anchor.metrics;
    const { fs, lines, lineHeight, textAnchor, hasBox, boxX, boxY, boxW, boxH } = m;
    const weight = lbl.bold ? 'bold' : 'normal';
    const style = lbl.italic ? 'italic' : 'normal';
    const color = esc(lbl.color || '#1e293b');

    let leaderSvg = '';
    if (lbl.showLeader) {
        const { side, startX, startY } = anchor;
        const isElbow = lbl.leaderStyle === 'elbow';
        let lineSvg = '';
        let hitSvg = '';
        let fromX = startX;
        let fromY = startY;

        if (isElbow && (side === 'left' || side === 'right')) {
            const distH = Math.abs(lbl.targetX - startX);
            const stub = Math.min(22, Math.max(8, distH * 0.35));
            const elbowX = side === 'left' ? startX - stub : startX + stub;
            const elbowY = startY;
            fromX = elbowX;
            fromY = elbowY;
            const pts = `${startX.toFixed(1)},${startY.toFixed(1)} ${elbowX.toFixed(1)},${elbowY.toFixed(1)} ${lbl.targetX.toFixed(1)},${lbl.targetY.toFixed(1)}`;
            lineSvg = `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-label-part="leader" />`;
            if (interactive) hitSvg = `<polyline points="${pts}" fill="none" stroke="transparent" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" data-label-part="leader" />`;
        } else if (isElbow && (side === 'top' || side === 'bottom') && Math.abs(lbl.targetX - startX) > 6) {
            const distV = Math.abs(lbl.targetY - startY);
            const stub = Math.min(20, Math.max(8, distV * 0.35));
            const elbowX = startX;
            const elbowY = side === 'top' ? startY - stub : startY + stub;
            fromX = elbowX;
            fromY = elbowY;
            const pts = `${startX.toFixed(1)},${startY.toFixed(1)} ${elbowX.toFixed(1)},${elbowY.toFixed(1)} ${lbl.targetX.toFixed(1)},${lbl.targetY.toFixed(1)}`;
            lineSvg = `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" data-label-part="leader" />`;
            if (interactive) hitSvg = `<polyline points="${pts}" fill="none" stroke="transparent" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" data-label-part="leader" />`;
        } else {
            const attrs = `x1="${startX.toFixed(1)}" y1="${startY.toFixed(1)}" x2="${lbl.targetX.toFixed(1)}" y2="${lbl.targetY.toFixed(1)}"`;
            lineSvg = `<line ${attrs} stroke="${color}" stroke-width="1.8" stroke-linecap="round" data-label-part="leader" />`;
            if (interactive) hitSvg = `<line ${attrs} stroke="transparent" stroke-width="14" stroke-linecap="round" data-label-part="leader" />`;
        }

        const dx = lbl.targetX - fromX;
        const dy = lbl.targetY - fromY;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const head = lbl.arrowHead
            ? `<polygon points="0,0 -10,-4.2 -7.5,0 -10,4.2" fill="${color}" transform="translate(${lbl.targetX.toFixed(1)}, ${lbl.targetY.toFixed(1)}) rotate(${angle.toFixed(1)})" data-label-part="leader" />`
            : '';
        leaderSvg = `
          ${lineSvg}
          ${hitSvg}
          ${head}
        `;
    }

    let boxSvg = '';
    if (hasBox) {
        const fillAttr = lbl.bgEnabled ? esc(lbl.bgColor || '#ffffff') : 'none';
        const strokeAttr = lbl.borderEnabled ? color : 'none';
        const strokeWidthAttr = lbl.borderEnabled ? '1.5' : '0';
        boxSvg = `<rect x="${boxX.toFixed(1)}" y="${boxY.toFixed(1)}" width="${boxW.toFixed(1)}" height="${boxH.toFixed(1)}" rx="5" fill="${fillAttr}" stroke="${strokeAttr}" stroke-width="${strokeWidthAttr}" />`;
    }

    const tspans = lines.map((line, i) =>
        `<tspan x="${lbl.x}" dy="${i === 0 ? 0 : lineHeight.toFixed(1)}">${esc(line)}</tspan>`
    ).join('');

    return `
      ${leaderSvg}
      ${boxSvg}
      <text x="${lbl.x}" y="${lbl.y}" text-anchor="${textAnchor}" fill="${color}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="${fs}" font-weight="${weight}" font-style="${style}">${tspans}</text>
    `;
}

/**
 * Génère une chaîne SVG complète et autonome prête à l'export.
 */
export function buildStandaloneSVG(scene, options = {}) {
    const { transparent = false, padding = 36 } = options;
    const bounds = computeSceneBounds(scene, padding);

    const rawItemsMarkup = scene.items.map(item => {
        const def = getCatalogItem(item.type);
        if (!def) return '';
        const scale = item.scale ?? 1;
        const fx = item.flipX ? -scale : scale;
        const transform = `translate(${item.x}, ${item.y}) rotate(${item.rotation ?? 0}) scale(${fx}, ${scale})`;
        return `<g${item.opaqueBg ? ' class="is-opaque-bg"' : ''} transform="${transform}">${def.render(item.props || {}, item.id, { rotation: item.rotation ?? 0, flipX: !!item.flipX })}</g>`;
    }).join('\n');
    // Sur fond transparent, mix-blend-mode: darken peut altérer ou masquer les liquides lors de la rasterisation SVG → Canvas
    const itemsMarkup = transparent
        ? rawItemsMarkup.replaceAll('style="mix-blend-mode: darken;"', 'opacity="0.88"')
        : rawItemsMarkup;

    const backConnectorsMarkup = scene.connectors
        .filter(c => c.behindItems)
        .map(c => `<g>${renderConnectorSVG(c, scene.items)}</g>`)
        .join('\n');
    const frontConnectorsMarkup = scene.connectors
        .filter(c => !c.behindItems)
        .map(c => `<g>${renderConnectorSVG(c, scene.items)}</g>`)
        .join('\n');
    const labelsMarkup = scene.labels.map(l => `<g>${renderLabelSVG(l)}</g>`).join('\n');
    const bgRect = transparent ? '' : `<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="#ffffff" />`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" width="${bounds.width}" height="${bounds.height}">
  <style>${SVG_SHARED_STYLES}</style>
  ${bgRect}
  <g id="layer-connectors-back">${backConnectorsMarkup}</g>
  <g id="layer-items">${itemsMarkup}</g>
  <g id="layer-connectors">${frontConnectorsMarkup}</g>
  <g id="layer-labels">${labelsMarkup}</g>
</svg>`;
}

/**
 * Rasterise le SVG autonome en Blob image (PNG ou JPEG) via un canvas hors écran.
 */
export function renderSceneToImageBlob(scene, options = {}) {
    const {
        format = 'image/png',
        scale = 3,
        transparent = false,
        padding = 36,
        quality = 0.94
    } = options;
    const isJpeg = format === 'image/jpeg';
    const effectiveTransparent = !isJpeg && Boolean(transparent);
    const svgString = buildStandaloneSVG(scene, { transparent: effectiveTransparent, padding });
    const bounds = computeSceneBounds(scene, padding);

    return new Promise((resolve, reject) => {
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(bounds.width * scale));
                canvas.height = Math.max(1, Math.round(bounds.height * scale));
                const ctx = canvas.getContext('2d');
                if (!effectiveTransparent) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0, bounds.width, bounds.height);
                URL.revokeObjectURL(url);
                canvas.toBlob(blob => {
                    if (blob) resolve(blob);
                    else reject(new Error('Échec de la génération de l\'image.'));
                }, isJpeg ? 'image/jpeg' : 'image/png', isJpeg ? quality : undefined);
            } catch (err) {
                URL.revokeObjectURL(url);
                reject(err);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Impossible de charger le SVG pour l\'export image.'));
        };
        img.src = url;
    });
}

/**
 * Rasterise le SVG autonome en PNG HD (Blob) via un canvas hors écran.
 */
export function renderSceneToPNGBlob(scene, options = {}) {
    return renderSceneToImageBlob(scene, { ...options, format: 'image/png' });
}

/**
 * Génère une page HTML autonome prête pour l'aperçu et l'impression / export PDF A4.
 */
export function buildPrintDocumentHTML(scene, options = {}) {
    const {
        title = '',
        margin = '1.5cm',
        orientation = 'portrait',
        padding = 24
    } = options;
    const isLandscape = orientation === 'landscape';
    const pageW = isLandscape ? '297mm' : '210mm';
    const pageH = isLandscape ? '210mm' : '297mm';
    const safeTitle = esc(String(title || '').trim());
    const svg = buildStandaloneSVG(scene, { transparent: false, padding });

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle || 'Schéma PhyWeb'}</title>
  <style>
    @page {
      size: A4 ${isLandscape ? 'landscape' : 'portrait'};
      margin: ${esc(margin)};
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #e2e8f0;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      color: #0f172a;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page-sheet {
      width: ${pageW};
      min-height: ${pageH};
      margin: 18px auto;
      padding: ${esc(margin)};
      background: #ffffff;
      box-shadow: 0 8px 28px rgba(15, 23, 42, 0.16);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    #preview-title {
      width: 100%;
      margin: 0 0 14px 0;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #e2e8f0;
      text-align: center;
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      display: ${safeTitle ? 'block' : 'none'};
    }
    .schema-wrap {
      width: 100%;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .schema-wrap svg {
      max-width: 100%;
      max-height: calc(${pageH} - 2 * ${esc(margin)} - 60px);
      width: auto;
      height: auto;
      display: block;
    }
    @media print {
      html, body { background: #ffffff; }
      .page-sheet {
        width: auto;
        min-height: auto;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
      .schema-wrap svg {
        max-height: 92vh;
      }
    }
  </style>
</head>
<body>
  <div class="page-sheet">
    <h1 id="preview-title">${safeTitle}</h1>
    <div class="schema-wrap">${svg}</div>
  </div>
</body>
</html>`;
}

/**
 * Génère une page HTML d'aperçu centré pour l'export image (PNG / JPEG / SVG).
 */
export function buildImagePreviewHTML(scene, options = {}) {
    const { transparent = false, padding = 36 } = options;
    const svg = buildStandaloneSVG(scene, { transparent, padding });
    const bgCss = transparent
        ? 'background-color: #ffffff; background-image: linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%); background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0;'
        : 'background: #ffffff;';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 16px;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
    }
    .frame {
      max-width: 100%;
      max-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
      overflow: hidden;
      ${bgCss}
    }
    .frame svg {
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 40px);
      width: auto;
      height: auto;
      display: block;
    }
  </style>
</head>
<body>
  <div class="frame">${svg}</div>
</body>
</html>`;
}
