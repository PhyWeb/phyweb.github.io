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

/**
 * Calcule la géométrie estimée d'une légende (boîte texte, alignement, fond/cadre).
 */
export function getLabelMetrics(lbl) {
    const fs = Number(lbl.fontSize) || 16;
    const lines = String(lbl.text || '').split('\n');
    const maxLen = Math.max(1, ...lines.map(l => l.length));
    const lineHeight = fs * 1.25;
    const textW = maxLen * fs * 0.58;
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
 * Construit le markup SVG d'une légende (texte, fond/cadre optionnel + ligne de rappel droite ou coudée).
 */
export function renderLabelSVG(lbl) {
    const m = getLabelMetrics(lbl);
    const { fs, lines, lineHeight, textAnchor, hasBox, boxX, boxY, boxW, boxH } = m;
    const weight = lbl.bold ? 'bold' : 'normal';
    const style = lbl.italic ? 'italic' : 'normal';
    const color = esc(lbl.color || '#1e293b');

    let leaderSvg = '';
    if (lbl.showLeader) {
        const gap = hasBox ? 0 : 6;
        const midY = lbl.y - fs * 0.35;
        let startX;
        let startY;
        let side;
        if (lbl.targetX < boxX) {
            side = 'left';
            startX = boxX - gap;
            startY = midY;
        } else if (lbl.targetX > boxX + boxW) {
            side = 'right';
            startX = boxX + boxW + gap;
            startY = midY;
        } else if (lbl.targetY < lbl.y - fs * 0.5) {
            side = 'top';
            startX = boxX + boxW / 2;
            startY = boxY - (hasBox ? 0 : 4);
        } else {
            side = 'bottom';
            startX = boxX + boxW / 2;
            startY = boxY + boxH + (hasBox ? 0 : 4);
        }

        const isElbow = lbl.leaderStyle === 'elbow';
        let lineSvg = '';
        let fromX = startX;
        let fromY = startY;

        if (isElbow && (side === 'left' || side === 'right')) {
            const distH = Math.abs(lbl.targetX - startX);
            const stub = Math.min(22, Math.max(8, distH * 0.35));
            const elbowX = side === 'left' ? startX - stub : startX + stub;
            const elbowY = startY;
            fromX = elbowX;
            fromY = elbowY;
            lineSvg = `<polyline points="${startX.toFixed(1)},${startY.toFixed(1)} ${elbowX.toFixed(1)},${elbowY.toFixed(1)} ${lbl.targetX.toFixed(1)},${lbl.targetY.toFixed(1)}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />`;
        } else if (isElbow && (side === 'top' || side === 'bottom') && Math.abs(lbl.targetX - startX) > 6) {
            const distV = Math.abs(lbl.targetY - startY);
            const stub = Math.min(20, Math.max(8, distV * 0.35));
            const elbowX = startX;
            const elbowY = side === 'top' ? startY - stub : startY + stub;
            fromX = elbowX;
            fromY = elbowY;
            lineSvg = `<polyline points="${startX.toFixed(1)},${startY.toFixed(1)} ${elbowX.toFixed(1)},${elbowY.toFixed(1)} ${lbl.targetX.toFixed(1)},${lbl.targetY.toFixed(1)}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />`;
        } else {
            lineSvg = `<line x1="${startX.toFixed(1)}" y1="${startY.toFixed(1)}" x2="${lbl.targetX.toFixed(1)}" y2="${lbl.targetY.toFixed(1)}" stroke="${color}" stroke-width="1.8" stroke-linecap="round" />`;
        }

        const dx = lbl.targetX - fromX;
        const dy = lbl.targetY - fromY;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const head = lbl.arrowHead
            ? `<polygon points="0,0 -10,-4.2 -7.5,0 -10,4.2" fill="${color}" transform="translate(${lbl.targetX.toFixed(1)}, ${lbl.targetY.toFixed(1)}) rotate(${angle.toFixed(1)})" />`
            : '';
        leaderSvg = `
          ${lineSvg}
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
        return `<g transform="${transform}">${def.render(item.props || {}, item.id, { rotation: item.rotation ?? 0, flipX: !!item.flipX })}</g>`;
    }).join('\n');
    // Sur fond transparent, mix-blend-mode: darken peut altérer ou masquer les liquides lors de la rasterisation SVG → Canvas
    const itemsMarkup = transparent
        ? rawItemsMarkup.replaceAll('style="mix-blend-mode: darken;"', 'opacity="0.88"')
        : rawItemsMarkup;

    const connectorsMarkup = scene.connectors.map(c => `<g>${renderConnectorSVG(c, scene.items)}</g>`).join('\n');
    const labelsMarkup = scene.labels.map(l => `<g>${renderLabelSVG(l)}</g>`).join('\n');
    const bgRect = transparent ? '' : `<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="#ffffff" />`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" width="${bounds.width}" height="${bounds.height}">
  <style>${SVG_SHARED_STYLES}</style>
  ${bgRect}
  <g id="layer-items">${itemsMarkup}</g>
  <g id="layer-connectors">${connectorsMarkup}</g>
  <g id="layer-labels">${labelsMarkup}</g>
</svg>`;
}

/**
 * Rasterise le SVG autonome en PNG HD (Blob) via un canvas hors écran.
 */
export function renderSceneToPNGBlob(scene, options = {}) {
    const { scale = 3, transparent = false, padding = 36 } = options;
    const svgString = buildStandaloneSVG(scene, { transparent, padding });
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
                if (!transparent) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0, bounds.width, bounds.height);
                URL.revokeObjectURL(url);
                canvas.toBlob(blob => {
                    if (blob) resolve(blob);
                    else reject(new Error('Échec de la génération PNG.'));
                }, 'image/png');
            } catch (err) {
                URL.revokeObjectURL(url);
                reject(err);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Impossible de charger le SVG pour l\'export PNG.'));
        };
        img.src = url;
    });
}
