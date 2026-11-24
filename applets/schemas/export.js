// Rendu SVG autonome et fonctions d'export (SVG, PNG HD, Presse-papier, JSON)
import { getCatalogItem, SVG_SHARED_STYLES } from './catalog.js';
import { localToWorld, buildConnectorPath, getConnectorMidpoint } from './snapping.js';
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
        const mid = getConnectorMidpoint(p1, p2, conn.mode, conn.bend, conn.bendX || 0);
        expand(p1.x - 10, p1.y - 10);
        expand(p1.x + 10, p1.y + 10);
        expand(p2.x - 10, p2.y - 10);
        expand(p2.x + 10, p2.y + 10);
        expand(mid.x - 15, mid.y - 15);
        expand(mid.x + 15, mid.y + 15);
    }

    for (const lbl of scene.labels) {
        const lines = String(lbl.text || '').split('\n');
        const maxLen = Math.max(4, ...lines.map(l => l.length));
        const approxW = maxLen * (lbl.fontSize || 16) * 0.62;
        const approxH = lines.length * (lbl.fontSize || 16) * 1.3;
        expand(lbl.x - 6, lbl.y - (lbl.fontSize || 16));
        expand(lbl.x + approxW + 6, lbl.y + approxH);
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
    const d = buildConnectorPath(p1, p2, conn.mode, conn.bend, conn.bendX || 0);
    const mid = getConnectorMidpoint(p1, p2, conn.mode, conn.bend, conn.bendX || 0);
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
 * Construit le markup SVG d'une légende (texte + ligne de rappel optionnelle).
 */
export function renderLabelSVG(lbl) {
    const fs = Number(lbl.fontSize) || 16;
    const weight = lbl.bold ? 'bold' : 'normal';
    const style = lbl.italic ? 'italic' : 'normal';
    const color = esc(lbl.color || '#1e293b');
    const lines = String(lbl.text || '').split('\n');

    let leaderSvg = '';
    if (lbl.showLeader) {
        const startX = lbl.x - 6;
        const startY = lbl.y - fs * 0.35;
        const dx = lbl.targetX - startX;
        const dy = lbl.targetY - startY;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const head = lbl.arrowHead
            ? `<polygon points="0,0 -10,-4.2 -7.5,0 -10,4.2" fill="${color}" transform="translate(${lbl.targetX.toFixed(1)}, ${lbl.targetY.toFixed(1)}) rotate(${angle.toFixed(1)})" />`
            : `<circle cx="${lbl.targetX.toFixed(1)}" cy="${lbl.targetY.toFixed(1)}" r="3.5" fill="${color}" />`;
        leaderSvg = `
          <line x1="${startX.toFixed(1)}" y1="${startY.toFixed(1)}" x2="${lbl.targetX.toFixed(1)}" y2="${lbl.targetY.toFixed(1)}" stroke="${color}" stroke-width="1.8" stroke-linecap="round" />
          ${head}
        `;
    }

    const tspans = lines.map((line, i) =>
        `<tspan x="${lbl.x}" dy="${i === 0 ? 0 : (fs * 1.25).toFixed(1)}">${esc(line)}</tspan>`
    ).join('');

    return `
      ${leaderSvg}
      <text x="${lbl.x}" y="${lbl.y}" fill="${color}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="${fs}" font-weight="${weight}" font-style="${style}">${tspans}</text>
    `;
}

/**
 * Génère une chaîne SVG complète et autonome prête à l'export.
 */
export function buildStandaloneSVG(scene, options = {}) {
    const { transparent = false, padding = 36 } = options;
    const bounds = computeSceneBounds(scene, padding);

    const itemsMarkup = scene.items.map(item => {
        const def = getCatalogItem(item.type);
        if (!def) return '';
        const scale = item.scale ?? 1;
        const fx = item.flipX ? -scale : scale;
        const transform = `translate(${item.x}, ${item.y}) rotate(${item.rotation ?? 0}) scale(${fx}, ${scale})`;
        return `<g transform="${transform}">${def.render(item.props || {}, item.id, { rotation: item.rotation ?? 0, flipX: !!item.flipX })}</g>`;
    }).join('\n');

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
