// Catalogue paramétrique des objets de chimie & physique
// Échelle : 1 mm = 1 px (fidèle à assets/verrerie/verrerie.svg)

export const CATEGORIES = [
    { id: 'all', label: 'Tous', icon: 'fa-border-all' },
    { id: 'verrerie', label: 'Verrerie', icon: 'fa-flask' },
    { id: 'dosage', label: 'Dosage & Prélèvement', icon: 'fa-eye-dropper' },
    { id: 'separation', label: 'Synthèse & Séparation', icon: 'fa-filter' },
    { id: 'supports', label: 'Supports & Paillasse', icon: 'fa-fire-burner' },
    { id: 'mesure', label: 'Mesure', icon: 'fa-gauge-high' },
    { id: 'electricite', label: 'Électricité & Piles', icon: 'fa-bolt' },
    { id: 'effets', label: 'Effets', icon: 'fa-droplet' },
    { id: 'formes', label: 'Formes & Flèches', icon: 'fa-shapes' }
];

export const LIQUID_PRESETS = [
    { label: 'Eau / Incolore', color: '#9ad1f5' },
    { label: 'Sulfate de cuivre', color: '#3b9eff' },
    { label: 'Permanganate', color: '#b832a8' },
    { label: 'Diiode / Rouille', color: '#d98a2b' },
    { label: 'BBT Jaune', color: '#f4d35e' },
    { label: 'BBT Vert', color: '#4ecdc4' },
    { label: 'Phénolphtaléine', color: '#f78fb3' },
    { label: 'Rouge', color: '#e06358' }
];

export const SOLID_PRESETS = [
    { label: 'Turquoise (CuSO₄)', color: '#4ecdc4' },
    { label: 'Blanc (NaCl)', color: '#e9ecef' },
    { label: 'Violet (KMnO₄)', color: '#7b2cbf' },
    { label: 'Jaune (Soufre)', color: '#f4d35e' },
    { label: 'Cuivre', color: '#c87a52' },
    { label: 'Gris (Fer/Zinc)', color: '#8d99ae' }
];

export const SHAPE_STROKE_PRESETS = [
    { label: 'Noir / Ardoise', color: '#1e293b' },
    { label: 'Rouge', color: '#e03131' },
    { label: 'Bleu', color: '#2563eb' },
    { label: 'Vert', color: '#16a34a' },
    { label: 'Orange', color: '#ea580c' },
    { label: 'Violet', color: '#7c3aed' }
];

export const SHAPE_FILL_PRESETS = [
    { label: 'Bleu clair', color: '#bfdbfe' },
    { label: 'Jaune pâle', color: '#fef08a' },
    { label: 'Vert pâle', color: '#bbf7d0' },
    { label: 'Rose pâle', color: '#fecdd3' },
    { label: 'Gris clair', color: '#e2e8f0' },
    { label: 'Blanc', color: '#ffffff' }
];

export const SVG_SHARED_STYLES = `
  .verre { fill: #ffffff; stroke: #000000; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .verre-fond { fill: transparent; stroke: none; pointer-events: all; }
  .liquide { fill: #9ad1f5; stroke: none; }
  .solide { fill: #4ecdc4; stroke: none; }
  .propipette { fill: #e06358; stroke: #000000; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .robinet-rouge { fill: #e06358; stroke: #000000; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .trait { fill: none; stroke: #000000; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
  .potence { fill: none; stroke: #000000; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
  .bouchon { fill: #555555; stroke: #000000; stroke-width: 3; stroke-linejoin: round; }
  .metal { fill: #b8bec4; stroke: #000000; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .ecran { fill: #e6ece8; stroke: #000000; stroke-width: 2.5; stroke-linejoin: round; }
  .bouton { fill: #cccccc; stroke: #000000; stroke-width: 2; stroke-linejoin: round; }
  .texte-ecran { font-family: monospace; font-size: 16px; font-weight: bold; fill: #000000; text-anchor: end; }
  .cuivre { fill: #c87a52; stroke: #000000; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .zinc { fill: #94a0aa; stroke: #000000; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .texte-metal { font-family: sans-serif; font-size: 14px; font-weight: bold; fill: #000000; text-anchor: middle; }
  .multimetre-jaune { fill: #f5b025; stroke: #000000; stroke-width: 3; stroke-linejoin: round; }
  .texte-multimetre { font-family: sans-serif; font-size: 11px; font-weight: bold; fill: #000000; text-anchor: middle; }
  .bois { fill: #d9b382; stroke: #000000; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
`;

function esc(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function projectWorldY(lx, ly, sinT, cosT, flipSign) {
    return flipSign * sinT * lx + cosT * ly;
}

function getLiquidVerticalSpan(xMin, xMax, yMin, yMax, rot, flipX) {
    const rad = (rot * Math.PI) / 180;
    const sinT = Math.sin(rad);
    const cosT = Math.cos(rad);
    const flipSign = flipX ? -1 : 1;
    const ys = [
        projectWorldY(xMin, yMin, sinT, cosT, flipSign),
        projectWorldY(xMax, yMin, sinT, cosT, flipSign),
        projectWorldY(xMin, yMax, sinT, cosT, flipSign),
        projectWorldY(xMax, yMax, sinT, cosT, flipSign)
    ];
    return {
        sinT,
        cosT,
        flipSign,
        wyTop: Math.min(...ys),
        wyBottom: Math.max(...ys)
    };
}

function renderClippedLiquid(uid, clipPathD, minY, maxY, level, color, ctx = {}, opts = {}) {
    const lvl = Math.max(0, Math.min(100, Number(level) || 0));
    const fillToRim = Boolean(opts?.fillToRim);
    if (lvl <= 0 && !fillToRim) return '';
    if (fillToRim && lvl >= 100) {
        return `
      <defs><clipPath id="clip-${uid}"><path d="${clipPathD}" /></clipPath></defs>
      <g clip-path="url(#clip-${uid})" style="mix-blend-mode: darken;">
        <rect x="-800" y="-800" width="1600" height="1600" fill="${esc(color)}" />
      </g>
    `;
    }
    if (lvl <= 0) return '';
    const rot = Number(ctx?.rotation) || 0;
    const flipX = Boolean(ctx?.flipX);
    const hw = Number(opts?.halfWidth) || 0;
    const effectiveMinY = (fillToRim && Array.isArray(opts?.rimPoints) && opts.rimPoints.length > 0)
        ? Math.min(minY, ...opts.rimPoints.map(([, ry]) => ry))
        : minY;
    const { sinT, cosT, flipSign, wyTop, wyBottom } = getLiquidVerticalSpan(-hw, hw, effectiveMinY, maxY, rot, flipX);
    let wySurface = wyBottom - (lvl / 100) * (wyBottom - wyTop);

    // Pour un récipient ouvert (hors déplacement d'eau), la surface libre ne peut jamais dépasser le bord d'ouverture le plus bas
    if (!opts?.sealed && !fillToRim && Array.isArray(opts?.rimPoints) && opts.rimPoints.length > 0) {
        const wyRim = Math.max(...opts.rimPoints.map(([rx, ry]) => projectWorldY(rx, ry, sinT, cosT, flipSign)));
        if (wySurface < wyRim) wySurface = wyRim;
        if (wySurface >= wyBottom - 0.5) return '';
    }

    const counterRot = flipX ? rot : -rot;
    const rotAttr = Math.abs(counterRot) > 0.01 ? ` transform="rotate(${counterRot.toFixed(2)}, 0, 0)"` : '';
    return `
      <defs><clipPath id="clip-${uid}"><path d="${clipPathD}" /></clipPath></defs>
      <g clip-path="url(#clip-${uid})" style="mix-blend-mode: darken;">
        <g${rotAttr}>
          <rect x="-800" y="${wySurface.toFixed(1)}" width="1600" height="1600" fill="${esc(color)}" />
        </g>
      </g>
    `;
}

function renderStopcock(cx, cy, open) {
    // Robinet fermé = poignée horizontale, ouvert = poignée verticale dans l'axe du tube
    const handle = open
        ? `<rect class="robinet-rouge" x="${cx + 16}" y="${cy - 16}" width="7" height="32" rx="2" />`
        : `<rect class="robinet-rouge" x="${cx + 16}" y="${cy - 3.5}" width="24" height="7" rx="2" />`;
    return `
      <rect class="robinet-rouge" x="${cx - 26}" y="${cy - 5}" width="10" height="10" rx="1.5" />
      <rect class="verre" style="stroke-width: 2.5;" x="${cx - 16}" y="${cy - 3.5}" width="32" height="7" />
      ${handle}
    `;
}

const LIQUID_PROPS_SCHEMA = [
    { key: 'liquidLevel', label: 'Niveau liquide', type: 'range', min: 0, max: 100, step: 5, unit: '%' },
    { key: 'fillToRim', label: 'À ras bord (dépl. d’eau)', type: 'toggle' },
    { key: 'liquidColor', label: 'Couleur liquide', type: 'color', presets: LIQUID_PRESETS, showIf: p => p.fillToRim || (p.liquidLevel || 0) > 0 }
];

// =========================================================================
// CATALOGUE DES OBJETS UNIFIÉS
// =========================================================================

export const CATALOG = [
    // ---------------------------------------------------------------------
    // 1. VERRERIE & RÉCIPIENTS
    // ---------------------------------------------------------------------
    {
        id: 'becher',
        name: 'Bécher',
        category: 'verrerie',
        keywords: 'becher recipient verre solution',
        defaultProps: { volume: '250', liquidLevel: 45, liquidColor: '#9ad1f5' },
        propSchema: [
            { key: 'volume', label: 'Volume', type: 'select', options: [
                { value: '100', label: '100 mL (Petit)' },
                { value: '250', label: '250 mL (Moyen)' },
                { value: '500', label: '500 mL (Grand)' }
            ]},
            ...LIQUID_PROPS_SCHEMA
        ],
        getBBox(p) {
            if (p.volume === '100') return { x: -37, y: -75, width: 64, height: 75 };
            if (p.volume === '500') return { x: -64, y: -140, width: 114, height: 140 };
            return { x: -49, y: -105, width: 86, height: 105 };
        },
        getAnchors(p) {
            const h = p.volume === '100' ? 75 : (p.volume === '500' ? 140 : 105);
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'inside-bottom', x: 0, y: -4, type: 'surface', dir: 'up', label: 'Fond' },
                { id: 'top', x: 0, y: -h, type: 'neck-top', dir: 'up', label: 'Ouverture' }
            ];
        },
        render(p, uid, ctx = {}) {
            if (p.volume === '100') {
                const bg = 'M -37,-75 L -27,-65 L -27,-6 C -27,-2 -24,0 -20,0 L 20,0 C 24,0 27,-2 27,-6 L 27,-75 Z';
                const clip = 'M -25.5,-73 L -25.5,-6 C -25.5,-2.5 -23,-1.5 -20,-1.5 L 20,-1.5 C 23,-1.5 25.5,-2.5 25.5,-6 L 25.5,-73 Z';
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, clip, -70, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 25.5, rimPoints: [[-25.5, -73], [25.5, -73]], fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="M -37,-75 L -27,-65 L -27,-6 C -27,-2 -24,0 -20,0 L 20,0 C 24,0 27,-2 27,-6 L 27,-75" />
                  <path class="trait" d="M 21,-50 L 26,-50 L 26,-20 L 21,-20" />
                  <line class="trait" x1="18" y1="-35" x2="26" y2="-35" />
                `;
            }
            if (p.volume === '500') {
                const bg = 'M -64,-140 L -50,-126 L -50,-10 C -50,-4 -45,0 -38,0 L 38,0 C 45,0 50,-4 50,-10 L 50,-140 Z';
                const clip = 'M -48.5,-138 L -48.5,-10 C -48.5,-5 -44,-1.5 -38,-1.5 L 38,-1.5 C 44,-1.5 48.5,-5 48.5,-10 L 48.5,-138 Z';
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, clip, -132, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 48.5, rimPoints: [[-48.5, -138], [48.5, -138]], fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="M -64,-140 L -50,-126 L -50,-10 C -50,-4 -45,0 -38,0 L 38,0 C 45,0 50,-4 50,-10 L 50,-140" />
                  <path class="trait" d="M 42,-103 L 49,-103 L 49,-25 L 42,-25" />
                  <line class="trait" x1="39" y1="-77" x2="49" y2="-77" />
                  <line class="trait" x1="39" y1="-51" x2="49" y2="-51" />
                `;
            }
            const bg = 'M -49,-105 L -37,-93 L -37,-8 C -37,-3 -33,0 -27,0 L 27,0 C 33,0 37,-3 37,-8 L 37,-105 Z';
            const clip = 'M -35.5,-103 L -35.5,-8 C -35.5,-3.5 -32,-1.5 -27,-1.5 L 27,-1.5 C 32,-1.5 35.5,-3.5 35.5,-8 L 35.5,-103 Z';
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, clip, -98, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 35.5, rimPoints: [[-35.5, -103], [35.5, -103]], fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" style="fill:none;" d="M -49,-105 L -37,-93 L -37,-8 C -37,-3 -33,0 -27,0 L 27,0 C 33,0 37,-3 37,-8 L 37,-105" />
              <path class="trait" d="M 30,-74 L 36,-74 L 36,-20 L 30,-20" />
              <line class="trait" x1="28" y1="-56" x2="36" y2="-56" />
              <line class="trait" x1="28" y1="-38" x2="36" y2="-38" />
            `;
        }
    },

    {
        id: 'erlenmeyer',
        name: 'Erlenmeyer',
        category: 'verrerie',
        keywords: 'erlenmeyer fiole conique titrage',
        defaultProps: { volume: '250', liquidLevel: 35, liquidColor: '#9ad1f5' },
        propSchema: [
            { key: 'volume', label: 'Volume', type: 'select', options: [
                { value: '100', label: '100 mL (Petit)' },
                { value: '250', label: '250 mL (Moyen)' },
                { value: '500', label: '500 mL (Grand)' }
            ]},
            ...LIQUID_PROPS_SCHEMA
        ],
        getBBox(p) {
            if (p.volume === '100') return { x: -38, y: -130, width: 76, height: 130 };
            if (p.volume === '500') return { x: -60, y: -215, width: 120, height: 215 };
            return { x: -49, y: -175, width: 98, height: 175 };
        },
        getAnchors(p) {
            const h = p.volume === '100' ? 130 : (p.volume === '500' ? 215 : 175);
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'inside-bottom', x: 0, y: -4, type: 'surface', dir: 'up', label: 'Fond' },
                { id: 'neck-top', x: 0, y: -h + 10, type: 'neck-top', dir: 'up', angle: 0, label: 'Col' }
            ];
        },
        render(p, uid, ctx = {}) {
            if (p.volume === '100') {
                const bg = 'M -14,-130 L -11,-126 L -11,-97 L -36,-19 C -39,-9 -33,0 -23,0 L 23,0 C 33,0 39,-9 36,-19 L 11,-97 L 11,-126 L 14,-130 Z';
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, bg, -97, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 35, rimPoints: [[-11, -126], [11, -126]], fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="M -14,-130 L -11,-126 L -11,-97 L -36,-19 C -39,-9 -33,0 -23,0 L 23,0 C 33,0 39,-9 36,-19 L 11,-97 L 11,-126 L 14,-130" />
                  <line class="trait" x1="6" y1="-63" x2="21" y2="-63" />
                  <line class="trait" x1="14" y1="-33" x2="31" y2="-33" />
                `;
            }
            if (p.volume === '500') {
                const bg = 'M -20,-215 L -15,-209 L -15,-165 L -58,-27 C -63,-13 -54,0 -40,0 L 40,0 C 54,0 63,-13 58,-27 L 15,-165 L 15,-209 L 20,-215 Z';
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, bg, -165, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 56, rimPoints: [[-15, -209], [15, -209]], fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="M -20,-215 L -15,-209 L -15,-165 L -58,-27 C -63,-13 -54,0 -40,0 L 40,0 C 54,0 63,-13 58,-27 L 15,-165 L 15,-209 L 20,-215" />
                  <line class="trait" x1="8" y1="-120" x2="28" y2="-120" />
                  <line class="trait" x1="18" y1="-87" x2="39" y2="-87" />
                  <line class="trait" x1="28" y1="-54" x2="49" y2="-54" />
                  <line class="trait" x1="38" y1="-21" x2="59" y2="-21" />
                `;
            }
            const bg = 'M -17,-175 L -13,-170 L -13,-133 L -47,-23 C -51,-11 -44,0 -32,0 L 32,0 C 44,0 51,-11 47,-23 L 13,-133 L 13,-170 L 17,-175 Z';
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, bg, -133, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 45, rimPoints: [[-13, -170], [13, -170]], fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" style="fill:none;" d="M -17,-175 L -13,-170 L -13,-133 L -47,-23 C -51,-11 -44,0 -32,0 L 32,0 C 44,0 51,-11 47,-23 L 13,-133 L 13,-170 L 17,-175" />
              <line class="trait" x1="8" y1="-90" x2="25" y2="-90" />
              <line class="trait" x1="18" y1="-57" x2="36" y2="-57" />
              <line class="trait" x1="27" y1="-25" x2="45" y2="-25" />
            `;
        }
    },

    {
        id: 'fiole-jaugee',
        name: 'Fiole jaugée',
        category: 'verrerie',
        keywords: 'fiole jaugee dilution dissolution menisque',
        defaultProps: { mode: 'normal', liquidLevel: 50, liquidColor: '#9ad1f5', stopper: false },
        propSchema: [
            { key: 'mode', label: 'Affichage', type: 'select', options: [
                { value: 'normal', label: 'Standard' },
                { value: 'menisque', label: 'Zoom ménisque + œil' }
            ]},
            { key: 'liquidLevel', label: 'Niveau liquide', type: 'range', min: 0, max: 100, step: 5, unit: '%', showIf: p => p.mode === 'normal' },
            { key: 'fillToRim', label: 'À ras bord (dépl. d’eau)', type: 'toggle', showIf: p => p.mode === 'normal' },
            { key: 'liquidColor', label: 'Couleur liquide', type: 'color', presets: LIQUID_PRESETS, showIf: p => p.mode === 'menisque' || p.fillToRim || (p.liquidLevel || 0) > 0 },
            { key: 'stopper', label: 'Bouchée', type: 'toggle', showIf: p => p.mode === 'normal' }
        ],
        getBBox(p) {
            if (p.mode === 'menisque') return { x: -64, y: -239, width: 204, height: 239 };
            return { x: -48, y: p.stopper ? -235 : -215, width: 96, height: p.stopper ? 235 : 215 };
        },
        getAnchors(p) {
            const anchors = [{ id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' }];
            if (p.mode === 'normal') {
                anchors.push({ id: 'neck-top', x: 0, y: -205, type: 'neck-top', dir: 'up', angle: 0, label: 'Col' });
            }
            return anchors;
        },
        render(p, uid, ctx = {}) {
            if (p.mode === 'menisque') {
                const c = esc(p.liquidColor || '#9ad1f5');
                return `
                  <path fill="${c}" d="M -10,-118 C -10,-100 -48,-68 -48,-28 C -48,-10 -38,0 -23,0 L 23,0 C 38,0 48,-10 48,-28 C 48,-68 10,-100 10,-118 Z" />
                  <path class="verre" style="fill:none;" d="M -10,-118 C -10,-100 -48,-68 -48,-28 C -48,-10 -38,0 -23,0 L 23,0 C 38,0 48,-10 48,-28 C 48,-68 10,-100 10,-118" />
                  <circle cx="0" cy="-175" r="62" fill="#ffffff" stroke="#000000" stroke-width="3.5" />
                  <path fill="${c}" d="M -22,-184 Q 0,-166 22,-184 L 22,-118 A 62,62 0 0,1 -22,-118 Z" />
                  <line class="trait" x1="-22" y1="-232" x2="-22" y2="-118" />
                  <line class="trait" x1="22" y1="-232" x2="22" y2="-118" />
                  <line class="trait" x1="-22" y1="-175" x2="22" y2="-175" />
                  <circle cx="0" cy="-175" r="62" fill="none" stroke="#000000" stroke-width="3.5" />
                  <path d="M 90,-193 A 24,24 0 0,1 90,-157 A 35,35 0 0,1 90,-193 Z" fill="#6ab5e8" />
                  <path d="M 86,-184 A 11,11 0 0,1 86,-166 A 22,22 0 0,1 86,-184 Z" fill="#000000" />
                  <path class="trait" d="M 92,-195 A 38,38 0 0,0 92,-155" />
                  <path class="trait" d="M 82,-201 L 137,-175 L 82,-149" />
                `;
            }
            const bg = 'M -10,-215 L -10,-118 C -10,-100 -48,-68 -48,-28 C -48,-10 -38,0 -23,0 L 23,0 C 38,0 48,-10 48,-28 C 48,-68 10,-100 10,-118 L 10,-215 Z';
            const stopperSvg = p.stopper ? `<polygon class="bouchon" points="-12.5,-235 12.5,-235 9.5,-203 -9.5,-203" />` : '';
            // 100% correspond au trait de jauge (y = -162)
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, bg, -162, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 46, rimPoints: [[-10, -215], [10, -215]], sealed: Boolean(p.stopper), fillToRim: Boolean(p.fillToRim) })}
              ${stopperSvg}
              <path class="verre" style="fill:none;" d="M -10,-215 L -10,-118 C -10,-100 -48,-68 -48,-28 C -48,-10 -38,0 -23,0 L 23,0 C 38,0 48,-10 48,-28 C 48,-68 10,-100 10,-118 L 10,-215" />
              <line class="trait" x1="-10" y1="-162" x2="10" y2="-162" />
            `;
        }
    },

    {
        id: 'eprouvette',
        name: 'Éprouvette graduée',
        category: 'verrerie',
        keywords: 'eprouvette graduee volume liquide',
        defaultProps: { volume: '100', liquidLevel: 50, liquidColor: '#9ad1f5' },
        propSchema: [
            { key: 'volume', label: 'Volume', type: 'select', options: [
                { value: '25', label: '25 mL (Petite)' },
                { value: '100', label: '100 mL (Moyenne)' },
                { value: '250', label: '250 mL (Grande)' }
            ]},
            ...LIQUID_PROPS_SCHEMA
        ],
        getBBox(p) {
            if (p.volume === '25') return { x: -32, y: -225, width: 64, height: 225 };
            if (p.volume === '250') return { x: -52, y: -375, width: 104, height: 375 };
            return { x: -42, y: -305, width: 84, height: 305 };
        },
        getAnchors(p) {
            const h = p.volume === '25' ? 225 : (p.volume === '250' ? 375 : 305);
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'top', x: 0, y: -h, type: 'neck-top', dir: 'up', label: 'Ouverture' }
            ];
        },
        render(p, uid, ctx = {}) {
            if (p.volume === '25') {
                const bg = 'M -26,-225 L -16,-215 L -16,0 L 16,0 L 16,-225 Z';
                const clip = 'M -14.5,-215 L -14.5,-1.5 L 14.5,-1.5 L 14.5,-215 Z';
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, clip, -205, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 14.5, rimPoints: [[-14.5, -215], [14.5, -215]], fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="M -26,-225 L -16,-215 L -16,0 L 16,0 L 16,-225" />
                  <line class="verre" x1="-32" y1="0" x2="32" y2="0" />
                  ${[-180, -145, -110, -75, -40].map(y => `<line class="trait" x1="-2" y1="${y}" x2="16" y2="${y}" />`).join('')}
                `;
            }
            if (p.volume === '250') {
                const bg = 'M -42,-375 L -28,-361 L -28,0 L 28,0 L 28,-375 Z';
                const clip = 'M -26.5,-360 L -26.5,-1.5 L 26.5,-1.5 L 26.5,-360 Z';
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, clip, -345, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 26.5, rimPoints: [[-26.5, -360], [26.5, -360]], fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="M -42,-375 L -28,-361 L -28,0 L 28,0 L 28,-375" />
                  <line class="verre" x1="-52" y1="0" x2="52" y2="0" />
                  ${[-315, -270, -225, -180, -135, -90, -45].map(y => `<line class="trait" x1="-3" y1="${y}" x2="28" y2="${y}" />`).join('')}
                `;
            }
            const bg = 'M -34,-305 L -22,-293 L -22,0 L 22,0 L 22,-305 Z';
            const clip = 'M -20.5,-293 L -20.5,-1.5 L 20.5,-1.5 L 20.5,-293 Z';
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, clip, -280, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 20.5, rimPoints: [[-20.5, -293], [20.5, -293]], fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" style="fill:none;" d="M -34,-305 L -22,-293 L -22,0 L 22,0 L 22,-305" />
              <line class="verre" x1="-42" y1="0" x2="42" y2="0" />
              ${[-250, -210, -170, -130, -90, -50].map(y => `<line class="trait" x1="-2" y1="${y}" x2="22" y2="${y}" />`).join('')}
            `;
        }
    },

    {
        id: 'tube-essais',
        name: 'Tube à essais',
        category: 'verrerie',
        keywords: 'tube essais test',
        defaultProps: { liquidLevel: 45, liquidColor: '#9ad1f5', stopper: 'none' },
        propSchema: [
            ...LIQUID_PROPS_SCHEMA,
            { key: 'stopper', label: 'Bouchon', type: 'select', options: [
                { value: 'none', label: 'Ouvert (sans bouchon)' },
                { value: 'solid', label: 'Bouchon plein' },
                { value: 'pierced', label: 'Bouchon percé' }
            ]}
        ],
        getBBox(p) {
            const topY = p.stopper !== 'none' ? -204 : -185;
            return { x: -13, y: topY, width: 26, height: -topY };
        },
        getAnchors(p) {
            const anchors = [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Fond' },
                { id: 'clamp-target', x: 0, y: -135, type: 'clamp-target', dir: 'any', angle: 0, label: 'Zone pince' },
                { id: 'neck-top', x: 0, y: -176, type: 'neck-top', dir: 'up', angle: 0, label: 'Ouverture' }
            ];
            if (p.stopper === 'pierced') {
                anchors.push({ id: 'hole', x: 0, y: -188, type: 'hole', dir: 'up', angle: 0, label: 'Trou bouchon' });
            }
            return anchors;
        },
        render(p, uid, ctx = {}) {
            const bg = 'M -11,-185 L -11,-11 A 11,11 0 0,0 11,-11 L 11,-185 Z';
            let stopperSvg = '';
            if (p.stopper === 'solid') {
                stopperSvg = `<polygon class="bouchon" points="-13,-204 13,-204 10,-172 -10,-172" />`;
            } else if (p.stopper === 'pierced') {
                stopperSvg = `
                  <polygon class="bouchon" points="-13,-204 -4,-204 -4,-172 -10,-172" />
                  <polygon class="bouchon" points="4,-204 13,-204 10,-172 4,-172" />
                `;
            }
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, bg, -175, -1, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 10, rimPoints: [[-11, -185], [11, -185]], sealed: p.stopper !== 'none', fillToRim: Boolean(p.fillToRim) })}
              ${stopperSvg}
              <path class="verre" style="fill:none;" d="M -11,-185 L -11,-11 A 11,11 0 0,0 11,-11 L 11,-185" />
            `;
        }
    },

    {
        id: 'ballon',
        name: 'Ballon',
        category: 'verrerie',
        keywords: 'ballon monocol bicol tricol fond rond plat reflux',
        defaultProps: { variant: 'monocol', liquidLevel: 40, liquidColor: '#9ad1f5' },
        propSchema: [
            { key: 'variant', label: 'Type', type: 'select', options: [
                { value: 'monocol', label: 'Monocol (fond rond)' },
                { value: 'bicol', label: 'Bicol (fond rond)' },
                { value: 'tricol', label: 'Tricol (fond rond)' },
                { value: 'fond-plat', label: 'Fond plat' }
            ]},
            ...LIQUID_PROPS_SCHEMA
        ],
        getBBox(p) {
            if (p.variant === 'fond-plat') return { x: -54, y: -146, width: 108, height: 146 };
            if (p.variant === 'bicol') return { x: -54, y: -156, width: 122, height: 156 };
            if (p.variant === 'tricol') return { x: -68, y: -156, width: 136, height: 156 };
            return { x: -54, y: -156, width: 108, height: 156 };
        },
        getAnchors(p) {
            if (p.variant === 'fond-plat') {
                return [
                    { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base plate' },
                    { id: 'neck-top', x: 0, y: -132, type: 'neck-top', dir: 'up', angle: 0, label: 'Col' },
                    { id: 'clamp-target', x: 0, y: -125, type: 'clamp-target', dir: 'any', angle: 0, label: 'Col (pince)' }
                ];
            }
            const anchors = [
                { id: 'round-bottom', x: 0, y: 0, type: 'round-bottom', dir: 'down', label: 'Fond rond' },
                { id: 'neck-top', x: 0, y: -142, type: 'neck-top', dir: 'up', angle: 0, label: 'Col central' },
                { id: 'clamp-target', x: 0, y: -132, type: 'clamp-target', dir: 'any', angle: 0, label: 'Col (pince)' }
            ];
            if (p.variant === 'bicol' || p.variant === 'tricol') {
                anchors.push({ id: 'neck-right', x: 51.4, y: -106.4, type: 'neck-top', dir: 'up-right', angle: 45, label: 'Col droit (45°)' });
            }
            if (p.variant === 'tricol') {
                anchors.push({ id: 'neck-left', x: -51.4, y: -106.4, type: 'neck-top', dir: 'up-left', angle: -45, label: 'Col gauche (-45°)' });
            }
            return anchors;
        },
        render(p, uid, ctx = {}) {
            if (p.variant === 'fond-plat') {
                const bg = 'M -14,-146 L -14,-96 A 53,53 0 0,0 -28,0 L 28,0 A 53,53 0 0,0 14,-96 L 14,-146 Z';
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, bg, -96, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 51, rimPoints: [[-14, -146], [14, -146]], fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="M -14,-146 L -14,-96 A 53,53 0 0,0 -28,0 L 28,0 A 53,53 0 0,0 14,-96 L 14,-146" />
                `;
            }
            // Fond rond : centre cercle à y=-53, rayon 53, bas à y=0, col haut à y=-156
            const bgMain = 'M -14,-156 L -14,-106 A 53,53 0 1,0 14,-106 L 14,-156 Z';
            const ballonOpts = { halfWidth: 51, rimPoints: [[-14, -156], [14, -156]], fillToRim: Boolean(p.fillToRim) };
            if (p.variant === 'bicol') {
                return `
                  <path class="verre-fond" d="${bgMain}" />
                  <polygon class="verre-fond" points="50,-122 67,-105 45,-83 28,-100" />
                  ${renderClippedLiquid(uid, bgMain, -104, -1.5, p.liquidLevel, p.liquidColor, ctx, ballonOpts)}
                  <line class="verre" x1="50" y1="-122" x2="28" y2="-100" />
                  <line class="verre" x1="67" y1="-105" x2="45" y2="-83" />
                  <path class="verre" style="fill:none;" d="M -14,-156 L -14,-106 A 53,53 0 1,0 45,-83" />
                  <path class="verre" style="fill:none;" d="M 28,-100 A 53,53 0 0,0 14,-106 L 14,-156" />
                `;
            }
            if (p.variant === 'tricol') {
                return `
                  <path class="verre-fond" d="${bgMain}" />
                  <polygon class="verre-fond" points="-50,-122 -67,-105 -45,-83 -28,-100" />
                  <polygon class="verre-fond" points="50,-122 67,-105 45,-83 28,-100" />
                  ${renderClippedLiquid(uid, bgMain, -104, -1.5, p.liquidLevel, p.liquidColor, ctx, ballonOpts)}
                  <line class="verre" x1="-50" y1="-122" x2="-28" y2="-100" />
                  <line class="verre" x1="-67" y1="-105" x2="-45" y2="-83" />
                  <line class="verre" x1="50" y1="-122" x2="28" y2="-100" />
                  <line class="verre" x1="67" y1="-105" x2="45" y2="-83" />
                  <path class="verre" style="fill:none;" d="M -45,-83 A 53,53 0 1,0 45,-83" />
                  <path class="verre" style="fill:none;" d="M -14,-156 L -14,-106 A 53,53 0 0,0 -28,-100" />
                  <path class="verre" style="fill:none;" d="M 28,-100 A 53,53 0 0,0 14,-106 L 14,-156" />
                `;
            }
            return `
              <path class="verre-fond" d="${bgMain}" />
              ${renderClippedLiquid(uid, bgMain, -104, -1.5, p.liquidLevel, p.liquidColor, ctx, ballonOpts)}
              <path class="verre" style="fill:none;" d="M -14,-156 L -14,-106 A 53,53 0 1,0 14,-106 L 14,-156" />
            `;
        }
    },

    {
        id: 'cristallisoir',
        name: 'Cristallisoir',
        category: 'verrerie',
        keywords: 'cristallisoir cuve bain marie glace',
        defaultProps: { size: 'petit', liquidLevel: 45, liquidColor: '#9ad1f5' },
        propSchema: [
            { key: 'size', label: 'Taille', type: 'select', options: [
                { value: 'petit', label: 'Petit (Ø 180 mm)' },
                { value: 'grand', label: 'Grand (Ø 240 mm)' }
            ]},
            ...LIQUID_PROPS_SCHEMA
        ],
        getBBox(p) {
            if (p.size === 'grand') return { x: -136, y: -120, width: 256, height: 120 };
            return { x: -104, y: -90, width: 194, height: 90 };
        },
        getAnchors(p) {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'inside-bottom', x: 0, y: -4, type: 'surface', dir: 'up', label: 'Fond' }
            ];
        },
        render(p, uid, ctx = {}) {
            if (p.size === 'grand') {
                const bg = 'M -136,-120 L -120,-104 L -120,-16 C -120,-7 -113,0 -104,0 L 104,0 C 113,0 120,-7 120,-16 L 120,-120 Z';
                const clip = 'M -118.5,-118 L -118.5,-16 C -118.5,-8 -112,-1.5 -104,-1.5 L 104,-1.5 C 112,-1.5 118.5,-8 118.5,-16 L 118.5,-118 Z';
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, clip, -110, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 118.5, rimPoints: [[-118.5, -118], [118.5, -118]], fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="M -136,-120 L -120,-104 L -120,-16 C -120,-7 -113,0 -104,0 L 104,0 C 113,0 120,-7 120,-16 L 120,-120" />
                `;
            }
            const bg = 'M -104,-90 L -90,-76 L -90,-14 C -90,-6 -84,0 -76,0 L 76,0 C 84,0 90,-6 90,-14 L 90,-90 Z';
            const clip = 'M -88.5,-88 L -88.5,-14 C -88.5,-7 -83,-1.5 -76,-1.5 L 76,-1.5 C 83,-1.5 88.5,-7 88.5,-14 L 88.5,-88 Z';
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, clip, -82, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 88.5, rimPoints: [[-88.5, -88], [88.5, -88]], fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" style="fill:none;" d="M -104,-90 L -90,-76 L -90,-14 C -90,-6 -84,0 -76,0 L 76,0 C 84,0 90,-6 90,-14 L 90,-90" />
            `;
        }
    },

    {
        id: 'cuve-ccm',
        name: 'Cuve à CCM',
        category: 'verrerie',
        keywords: 'cuve ccm chromatographie eluant couvercle',
        defaultProps: { lidClosed: true, liquidLevel: 15, liquidColor: '#9ad1f5' },
        propSchema: [
            { key: 'lidClosed', label: 'Couvercle fermé', type: 'toggle' },
            { key: 'liquidLevel', label: 'Niveau éluant', type: 'range', min: 0, max: 50, step: 5, unit: '%' },
            { key: 'liquidColor', label: 'Couleur éluant', type: 'color', presets: LIQUID_PRESETS, showIf: p => (p.liquidLevel || 0) > 0 }
        ],
        getBBox(p) {
            return { x: -78, y: p.lidClosed ? -204 : -180, width: 156, height: p.lidClosed ? 204 : 180 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'inside-bottom', x: 0, y: -4, type: 'surface', dir: 'up', label: 'Fond' }
            ];
        },
        render(p, uid, ctx = {}) {
            const bg = 'M -74,-180 L -66,-172 L -66,-8 C -66,-3 -62,0 -57,0 L 57,0 C 62,0 66,-3 66,-8 L 66,-172 L 74,-180 Z';
            const clip = 'M -64.5,-172 L -64.5,-8 C -64.5,-4 -61.5,-1.5 -57,-1.5 L 57,-1.5 C 61.5,-1.5 64.5,-4 64.5,-8 L 64.5,-172 Z';
            const lid = p.lidClosed ? `
              <rect class="verre" x="-78" y="-192" width="156" height="12" rx="2" />
              <rect class="verre" x="-14" y="-204" width="28" height="12" rx="3" />
            ` : '';
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, clip, -170, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 64.5, rimPoints: [[-64.5, -172], [64.5, -172]], sealed: Boolean(p.lidClosed) })}
              <path class="verre" style="fill:none;" d="M -74,-180 L -66,-172 L -66,-8 C -66,-3 -62,0 -57,0 L 57,0 C 62,0 66,-3 66,-8 L 66,-172 L 74,-180" />
              ${lid}
            `;
        }
    },

    {
        id: 'boite-petri',
        name: 'Boîte de Petri',
        category: 'verrerie',
        keywords: 'boite petri coupelle couvercle',
        defaultProps: { lidState: 'closed', hasContent: false, contentColor: '#f4d35e' },
        propSchema: [
            { key: 'lidState', label: 'Couvercle', type: 'select', options: [
                { value: 'closed', label: 'Fermé' },
                { value: 'ajar', label: 'Entrouvert' },
                { value: 'open', label: 'Retiré (sans couvercle)' }
            ]},
            { key: 'hasContent', label: 'Contient un milieu', type: 'toggle' },
            { key: 'contentColor', label: 'Couleur', type: 'color', presets: LIQUID_PRESETS, showIf: p => p.hasContent }
        ],
        getBBox() {
            return { x: -48, y: -32, width: 96, height: 32 };
        },
        getAnchors() {
            return [{ id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' }];
        },
        render(p) {
            const content = p.hasContent
                ? `<path fill="${esc(p.contentColor)}" d="M -42,-8 L 42,-8 L 42,-5 C 42,-2.5 40,-1.5 38,-1.5 L -38,-1.5 C -40,-1.5 -42,-2.5 -42,-5 Z" />`
                : '';
            let lid = '';
            if (p.lidState === 'closed') {
                lid = `
                  <path class="verre-fond" d="M -47,-9 L -47,-15 C -47,-18 -44.5,-20 -41,-20 L 41,-20 C 44.5,-20 47,-18 47,-15 L 47,-9 Z" />
                  <path class="verre" style="fill:none;" d="M -47,-9 L -47,-15 C -47,-18 -44.5,-20 -41,-20 L 41,-20 C 44.5,-20 47,-18 47,-15 L 47,-9" />
                `;
            } else if (p.lidState === 'ajar') {
                lid = `
                  <g transform="translate(8, -10) rotate(-14)">
                    <path class="verre-fond" d="M -47,-9 L -47,-15 C -47,-18 -44.5,-20 -41,-20 L 41,-20 C 44.5,-20 47,-18 47,-15 L 47,-9 Z" />
                    <path class="verre" style="fill:none;" d="M -47,-9 L -47,-15 C -47,-18 -44.5,-20 -41,-20 L 41,-20 C 44.5,-20 47,-18 47,-15 L 47,-9" />
                  </g>
                `;
            }
            return `
              <path class="verre-fond" d="M -44,-15 L -44,-5 C -44,-2 -41.5,0 -38,0 L 38,0 C 41.5,0 44,-2 44,-5 L 44,-15 Z" />
              ${content}
              <path class="verre" style="fill:none;" d="M -44,-15 L -44,-5 C -44,-2 -41.5,0 -38,0 L 38,0 C 41.5,0 44,-2 44,-5 L 44,-15" />
              ${lid}
            `;
        }
    },

    {
        id: 'verre-montre',
        name: 'Verre de montre',
        category: 'verrerie',
        keywords: 'verre montre coupelle solide pesee',
        defaultProps: { hasSolid: false, solidColor: '#4ecdc4' },
        propSchema: [
            { key: 'hasSolid', label: 'Contient un solide', type: 'toggle' },
            { key: 'solidColor', label: 'Couleur solide', type: 'color', presets: SOLID_PRESETS, showIf: p => p.hasSolid }
        ],
        getBBox() {
            return { x: -65, y: -15, width: 130, height: 18 };
        },
        getAnchors() {
            return [{ id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' }];
        },
        render(p) {
            const solid = p.hasSolid
                ? `<path fill="${esc(p.solidColor)}" d="M -26,-6 Q 0,-18 26,-6 Q 0,-1 -26,-6 Z" />`
                : '';
            return `
              ${solid}
              <path class="verre" d="M -65,-13 Q 0,13 65,-13 Q 0,4 -65,-13 Z" />
            `;
        }
    },

    // ---------------------------------------------------------------------
    // 2. PRÉLÈVEMENT, DOSAGE & TRANSFERT
    // ---------------------------------------------------------------------
    {
        id: 'burette',
        name: 'Burette graduée',
        category: 'dosage',
        keywords: 'burette graduee titrage dosage robinet',
        defaultProps: { liquidLevel: 85, liquidColor: '#9ad1f5', open: false },
        propSchema: [
            { key: 'open', label: 'Robinet ouvert', type: 'toggle' },
            ...LIQUID_PROPS_SCHEMA
        ],
        getBBox() {
            return { x: -28, y: -610, width: 68, height: 610 };
        },
        getAnchors() {
            return [
                { id: 'tip', x: 0, y: 0, type: 'tip', dir: 'down', label: 'Pointe' },
                { id: 'clamp-low', x: 0, y: -235, type: 'clamp-target', dir: 'any', angle: 0, label: 'Pince basse' },
                { id: 'clamp-high', x: 0, y: -495, type: 'clamp-target', dir: 'any', angle: 0, label: 'Pince haute' },
                { id: 'neck-top', x: 0, y: -600, type: 'neck-top', dir: 'up', angle: 0, label: 'Haut' }
            ];
        },
        render(p, uid, ctx = {}) {
            const bg = 'M -13,-610 L -9,-600 L -9,-55 L -4,-40 L -4,0 L 4,-8 L 4,-40 L 9,-55 L 9,-600 L 13,-610 Z';
            const clip = 'M -7.5,-590 L -7.5,-55 L -2.5,-40 L -2.5,-3 L 2.5,-8 L 2.5,-40 L 7.5,-55 L 7.5,-590 Z';
            let grads = '';
            for (let i = 0; i < 26; i++) {
                const y = -545 + i * 19;
                const x1 = (i % 2 === 0) ? -2 : 2;
                grads += `<line class="trait" x1="${x1}" y1="${y}" x2="9" y2="${y}" />`;
            }
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, clip, -545, -3, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 7.5, rimPoints: [[-9, -600], [9, -600]], fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" style="fill:none;" d="M -13,-610 L -9,-600 L -9,-55 L -4,-40 L -4,0" />
              <path class="verre" style="fill:none;" d="M 13,-610 L 9,-600 L 9,-55 L 4,-40 L 4,-8" />
              ${grads}
              ${renderStopcock(0, -28, p.open)}
            `;
        }
    },

    {
        id: 'pipette',
        name: 'Pipette',
        category: 'dosage',
        keywords: 'pipette jaugee graduee pasteur prelevement',
        defaultProps: { variant: 'jaugee', liquidLevel: 70, liquidColor: '#9ad1f5' },
        propSchema: [
            { key: 'variant', label: 'Type', type: 'select', options: [
                { value: 'jaugee', label: 'Pipette jaugée' },
                { value: 'graduee', label: 'Pipette graduée' },
                { value: 'pasteur', label: 'Pipette Pasteur' }
            ]},
            ...LIQUID_PROPS_SCHEMA
        ],
        getBBox(p) {
            if (p.variant === 'pasteur') return { x: -8, y: -150, width: 16, height: 150 };
            if (p.variant === 'graduee') return { x: -13, y: -430, width: 26, height: 430 };
            return { x: -14, y: -495, width: 28, height: 495 };
        },
        getAnchors(p) {
            if (p.variant === 'pasteur') {
                return [{ id: 'tip', x: 0, y: 0, type: 'tip', dir: 'down', label: 'Pointe' }];
            }
            const topY = p.variant === 'graduee' ? -430 : -495;
            return [
                { id: 'tip', x: 0, y: 0, type: 'tip', dir: 'down', label: 'Pointe' },
                { id: 'neck-top', x: 0, y: topY + 6, type: 'neck-top', dir: 'up', angle: 0, label: 'Embout propipette' }
            ];
        },
        render(p, uid, ctx = {}) {
            if (p.variant === 'pasteur') {
                const bg = 'M 0,-150 C -6,-150 -7,-144 -7,-136 L -7,-118 C -7,-113 -4,-110 -3,-108 L -3,-45 L -1.5,-30 L -1.5,0 L 1.5,0 L 1.5,-30 L 3,-45 L 3,-108 C 4,-110 7,-113 7,-118 L 7,-136 C 7,-144 6,-150 0,-150 Z';
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, bg, -108, -1, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 3, sealed: true, fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="${bg}" />
                  <line class="trait" x1="-5" y1="-112" x2="5" y2="-112" />
                  <line class="trait" style="stroke-width: 1.5;" x1="-1" y1="-90" x2="3" y2="-90" />
                  <line class="trait" style="stroke-width: 1.5;" x1="0" y1="-75" x2="3" y2="-75" />
                  <line class="trait" style="stroke-width: 1.5;" x1="-1" y1="-60" x2="3" y2="-60" />
                  <line class="trait" style="stroke-width: 1.5;" x1="0" y1="-45" x2="3" y2="-45" />
                `;
            }
            if (p.variant === 'graduee') {
                const bg = 'M -4.5,-430 L -4.5,-402 C -12.5,-397 -12.5,-377 -4.5,-372 L -4.5,-360 L -7,-353 L -7,-75 L -4.5,-65 L -4.5,-17 L -2,0 L 2,0 L 4.5,-17 L 4.5,-65 L 7,-75 L 7,-353 L 4.5,-360 L 4.5,-372 C 12.5,-377 12.5,-397 4.5,-402 L 4.5,-430 Z';
                let grads = '';
                for (let i = 0; i < 18; i++) {
                    const y = -335 + i * 15;
                    const x1 = (i % 2 === 0) ? -1 : 1.5;
                    grads += `<line class="trait" x1="${x1}" y1="${y}" x2="7" y2="${y}" />`;
                }
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, bg, -345, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 7, sealed: true, fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="M -4.5,-430 L -4.5,-402 C -12.5,-397 -12.5,-377 -4.5,-372 L -4.5,-360 L -7,-353 L -7,-75 L -4.5,-65 L -4.5,-17 L -2,0 L 2,0 L 4.5,-17 L 4.5,-65 L 7,-75 L 7,-353 L 4.5,-360 L 4.5,-372 C 12.5,-377 12.5,-397 4.5,-402 L 4.5,-430" />
                  ${grads}
                `;
            }
            const bg = 'M -4.5,-495 L -4.5,-467 C -12.5,-462 -12.5,-442 -4.5,-437 L -4.5,-317 C -13.5,-310 -13.5,-303 -13.5,-295 L -13.5,-209 C -13.5,-201 -13.5,-194 -4.5,-187 L -4.5,-17 L -2,0 L 2,0 L 4.5,-17 L 4.5,-187 C 13.5,-194 13.5,-201 13.5,-209 L 13.5,-295 C 13.5,-303 13.5,-310 4.5,-317 L 4.5,-437 C 12.5,-442 12.5,-462 4.5,-467 L 4.5,-495 Z';
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, bg, -377, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 13, sealed: true, fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" style="fill:none;" d="M -4.5,-495 L -4.5,-467 C -12.5,-462 -12.5,-442 -4.5,-437 L -4.5,-317 C -13.5,-310 -13.5,-303 -13.5,-295 L -13.5,-209 C -13.5,-201 -13.5,-194 -4.5,-187 L -4.5,-17 L -2,0 L 2,0 L 4.5,-17 L 4.5,-187 C 13.5,-194 13.5,-201 13.5,-209 L 13.5,-295 C 13.5,-303 13.5,-310 4.5,-317 L 4.5,-437 C 12.5,-442 12.5,-462 4.5,-467 L 4.5,-495" />
              <line class="trait" x1="-4.5" y1="-377" x2="4.5" y2="-377" />
            `;
        }
    },

    {
        id: 'propipette',
        name: 'Propipette',
        category: 'dosage',
        keywords: 'propipette poire aspiration pipette',
        defaultProps: { color: '#e06358' },
        propSchema: [
            { key: 'color', label: 'Couleur', type: 'color', presets: [
                { label: 'Rouge', color: '#e06358' },
                { label: 'Verte', color: '#4ecdc4' },
                { label: 'Bleue', color: '#4a90d9' }
            ]}
        ],
        getBBox() {
            return { x: -30, y: -143, width: 60, height: 143 };
        },
        getAnchors() {
            return [{ id: 'neck-bottom', x: 0, y: -4, type: 'neck-bottom', dir: 'down', angle: 180, label: 'Embout pipette' }];
        },
        render(p) {
            return `
              <path class="propipette" style="fill:${esc(p.color || '#e06358')}" d="M -5.5,-138 L -5.5,-122.45 A 28,28 0 0,0 -5.5,-67.55 L -5.5,-55 L -9.5,-55 L -9.5,-44 L -5.5,-44 L -5.5,-32 L -22.5,-32 L -22.5,-24 L -5.5,-24 L -5.5,-5 L 5.5,-5 L 5.5,-44 L 9.5,-44 L 9.5,-55 L 5.5,-55 L 5.5,-67.55 A 28,28 0 0,0 5.5,-122.45 L 5.5,-138 Z" />
              <rect class="bouchon" x="-8.5" y="-143" width="17" height="5" />
              <rect class="bouchon" x="-26.5" y="-35" width="4" height="14" />
              <rect class="bouchon" x="-8.5" y="-5" width="17" height="5" />
            `;
        }
    },

    {
        id: 'seringue',
        name: 'Seringue graduée',
        category: 'dosage',
        keywords: 'seringue piston gaz volume',
        defaultProps: { piston: 50, hasLiquid: true, liquidColor: '#9ad1f5' },
        propSchema: [
            { key: 'piston', label: 'Position piston', type: 'range', min: 0, max: 100, step: 5, unit: '%' },
            { key: 'hasLiquid', label: 'Contient un fluide', type: 'toggle' },
            { key: 'liquidColor', label: 'Couleur fluide', type: 'color', presets: LIQUID_PRESETS, showIf: p => p.hasLiquid }
        ],
        getBBox() {
            return { x: -21, y: -195, width: 42, height: 195 };
        },
        getAnchors() {
            return [
                { id: 'tip', x: 0, y: 0, type: 'hose', dir: 'down', label: 'Embout Luer' }
            ];
        },
        render(p) {
            const pct = Math.max(0, Math.min(100, Number(p.piston) || 0));
            // Joint piston va de y=-26 (0%) à y=-96 (100%)
            const jointY = -26 - (pct / 100) * 70;
            const stemTop = jointY - 96;
            const liqSvg = (p.hasLiquid && pct > 0)
                ? `<rect x="-9.5" y="${(jointY + 8).toFixed(1)}" width="19" height="${(-18 - (jointY + 8)).toFixed(1)}" fill="${esc(p.liquidColor)}" />`
                : '';
            return `
              <path class="verre-fond" d="M -11,-108 L 11,-108 L 11,-18 L 2.5,-14 L 2.5,0 L -2.5,0 L -2.5,-14 L -11,-18 Z" />
              ${liqSvg}
              <rect class="verre" x="-4" y="${stemTop.toFixed(1)}" width="8" height="96" />
              <line class="trait" style="stroke-width: 1.5;" x1="0" y1="${stemTop.toFixed(1)}" x2="0" y2="${jointY.toFixed(1)}" />
              <rect class="verre" x="-14" y="${(stemTop - 6).toFixed(1)}" width="28" height="6" rx="2" />
              <rect class="bouchon" x="-9.5" y="${jointY.toFixed(1)}" width="19" height="8" rx="1.5" />
              <path class="verre" style="fill:none;" d="M -11,-108 L -11,-18 L -2.5,-14 L -2.5,0 L 2.5,0 L 2.5,-14 L 11,-18 L 11,-108" />
              <rect class="verre" x="-21" y="-112" width="42" height="5" rx="2" />
              ${[-94, -84, -74, -64, -54, -44, -34, -24].map((y, i) => `<line class="trait" style="stroke-width: 1.8;" x1="${i % 2 === 0 ? 2 : 5}" y1="${y}" x2="11" y2="${y}" />`).join('')}
            `;
        }
    },

    {
        id: 'pissette',
        name: 'Pissette',
        category: 'dosage',
        keywords: 'pissette eau distillee rincage',
        defaultProps: { liquidLevel: 55, liquidColor: '#9ad1f5' },
        propSchema: [...LIQUID_PROPS_SCHEMA],
        getBBox() {
            return { x: -58, y: -272, width: 96, height: 272 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'tip', x: -56, y: -224, type: 'tip', dir: 'left', label: 'Bec' }
            ];
        },
        render(p, uid, ctx = {}) {
            const clip = 'M -36.5,-203.5 L 36.5,-203.5 L 36.5,-11 C 36.5,-5.5 32,-1.5 26.5,-1.5 L -26.5,-1.5 C -32,-1.5 -36.5,-5.5 -36.5,-11 Z';
            return `
              <rect class="verre-fond" x="-38" y="-205" width="76" height="205" rx="11" />
              ${renderClippedLiquid(uid, clip, -195, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 36.5, sealed: true, fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" d="M 2.5,-13 L 2.5,-258 C 2.5,-270 -7,-272 -17,-264 L -52,-234 L -58,-225 L -54.5,-222.5 L -47,-230 L -13,-259 C -7,-264 -2.5,-262 -2.5,-256 L -2.5,-13 Z" />
              <rect class="verre" style="fill:none;" x="-38" y="-205" width="76" height="205" rx="11" />
              <rect class="verre" x="-14" y="-215" width="28" height="10" />
              <rect class="verre" x="-19" y="-231" width="38" height="16" rx="2.5" />
            `;
        }
    },

    {
        id: 'flacon',
        name: 'Flacon de laboratoire',
        category: 'dosage',
        keywords: 'flacon bouteille reactif gl45 bouchon',
        defaultProps: { volume: '500', capped: true, capColor: '#2554b0', liquidLevel: 60, liquidColor: '#9ad1f5' },
        propSchema: [
            { key: 'volume', label: 'Volume', type: 'select', options: [
                { value: '250', label: '250 mL (Petit)' },
                { value: '500', label: '500 mL (Moyen)' },
                { value: '1000', label: '1 L (Grand)' }
            ]},
            { key: 'capped', label: 'Bouchon fermé', type: 'toggle' },
            { key: 'capColor', label: 'Couleur bouchon', type: 'color', presets: [
                { label: 'Bleu GL45', color: '#2554b0' },
                { label: 'Rouge', color: '#c92a2a' },
                { label: 'Gris', color: '#555555' }
            ], showIf: p => p.capped },
            ...LIQUID_PROPS_SCHEMA
        ],
        getBBox(p) {
            if (p.volume === '250') return { x: -39, y: p.capped ? -168 : -142, width: 78, height: p.capped ? 168 : 142 };
            if (p.volume === '1000') return { x: -61, y: p.capped ? -256 : -230, width: 122, height: p.capped ? 256 : 230 };
            return { x: -49, y: p.capped ? -208 : -182, width: 98, height: p.capped ? 208 : 182 };
        },
        getAnchors(p) {
            const neckY = p.volume === '250' ? -142 : (p.volume === '1000' ? -230 : -182);
            const anchors = [{ id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' }];
            if (!p.capped) anchors.push({ id: 'neck-top', x: 0, y: neckY, type: 'neck-top', dir: 'up', label: 'Col' });
            return anchors;
        },
        render(p, uid, ctx = {}) {
            const capSvg = (yTop) => !p.capped ? '' : `
              <rect x="-26" y="${yTop}" width="52" height="26" rx="3" fill="${esc(p.capColor || '#2554b0')}" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" />
              <rect x="-28" y="${yTop + 21}" width="56" height="5" rx="1.5" fill="${esc(p.capColor || '#2554b0')}" stroke="#000000" stroke-width="2" />
              ${[-17, -8.5, 0, 8.5, 17].map(x => `<line x1="${x}" y1="${yTop + 1}" x2="${x}" y2="${yTop + 21}" stroke="#000000" stroke-width="1.5" />`).join('')}
            `;
            if (p.volume === '250') {
                const bg = 'M -23,-142 L -23,-124 C -23,-112 -39,-102 -39,-84 L -39,-12 C -39,-5 -34,0 -27,0 L 27,0 C 34,0 39,-5 39,-12 L 39,-84 C 39,-102 23,-112 23,-124 L 23,-142 Z';
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, bg, -108, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 38, rimPoints: [[-23, -142], [23, -142]], sealed: Boolean(p.capped), fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="M -23,-142 L -23,-124 C -23,-112 -39,-102 -39,-84 L -39,-12 C -39,-5 -34,0 -27,0 L 27,0 C 34,0 39,-5 39,-12 L 39,-84 C 39,-102 23,-112 23,-124 L 23,-142" />
                  <path class="trait" d="M 23,-72 L 29,-72 L 29,-21 L 23,-21" />
                  <line class="trait" x1="21" y1="-46.5" x2="29" y2="-46.5" />
                  ${capSvg(-168)}
                `;
            }
            if (p.volume === '1000') {
                const bg = 'M -23,-230 L -23,-208 C -23,-192 -61,-174 -61,-148 L -61,-16 C -61,-7 -54,0 -45,0 L 45,0 C 54,0 61,-7 61,-16 L 61,-148 C 61,-174 23,-192 23,-208 L 23,-230 Z';
                return `
                  <path class="verre-fond" d="${bg}" />
                  ${renderClippedLiquid(uid, bg, -185, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 60, rimPoints: [[-23, -230], [23, -230]], sealed: Boolean(p.capped), fillToRim: Boolean(p.fillToRim) })}
                  <path class="verre" style="fill:none;" d="M -23,-230 L -23,-208 C -23,-192 -61,-174 -61,-148 L -61,-16 C -61,-7 -54,0 -45,0 L 45,0 C 54,0 61,-7 61,-16 L 61,-148 C 61,-174 23,-192 23,-208 L 23,-230" />
                  <path class="trait" d="M 39,-134 L 47,-134 L 47,-30 L 39,-30" />
                  <line class="trait" x1="36" y1="-108" x2="47" y2="-108" />
                  <line class="trait" x1="36" y1="-82" x2="47" y2="-82" />
                  <line class="trait" x1="36" y1="-56" x2="47" y2="-56" />
                  ${capSvg(-256)}
                `;
            }
            const bg = 'M -23,-182 L -23,-162 C -23,-148 -49,-134 -49,-112 L -49,-14 C -49,-6 -43,0 -35,0 L 35,0 C 43,0 49,-6 49,-14 L 49,-112 C 49,-134 23,-148 23,-162 L 23,-182 Z';
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, bg, -145, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 48, rimPoints: [[-23, -182], [23, -182]], sealed: Boolean(p.capped), fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" style="fill:none;" d="M -23,-182 L -23,-162 C -23,-148 -49,-134 -49,-112 L -49,-14 C -49,-6 -43,0 -35,0 L 35,0 C 43,0 49,-6 49,-14 L 49,-112 C 49,-134 23,-148 23,-162 L 23,-182" />
              <path class="trait" d="M 30,-100 L 37,-100 L 37,-25 L 30,-25" />
              <line class="trait" x1="27" y1="-75" x2="37" y2="-75" />
              <line class="trait" x1="27" y1="-50" x2="37" y2="-50" />
              ${capSvg(-208)}
            `;
        }
    },

    {
        id: 'flacon-gouttes',
        name: 'Flacon compte-gouttes',
        category: 'dosage',
        keywords: 'flacon compte gouttes indicateur colore',
        defaultProps: { liquidLevel: 55, liquidColor: '#f4d35e' },
        propSchema: [...LIQUID_PROPS_SCHEMA],
        getBBox() {
            return { x: -21, y: -130, width: 42, height: 130 };
        },
        getAnchors() {
            return [{ id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' }];
        },
        render(p, uid, ctx = {}) {
            const bg = 'M -10,-92 L -10,-82 C -10,-76 -21,-71 -21,-62 L -21,-6 C -21,-2 -18,0 -14,0 L 14,0 C 18,0 21,-2 21,-6 L 21,-62 C 21,-71 10,-76 10,-82 L 10,-92 Z';
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, bg, -74, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 20, sealed: true, fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" style="stroke-width: 2;" d="M -2.5,-92 L -2.5,-24 L -1,-12 L 1,-12 L 2.5,-24 L 2.5,-92 Z" />
              <path class="verre" style="fill:none;" d="M -10,-92 L -10,-82 C -10,-76 -21,-71 -21,-62 L -21,-6 C -21,-2 -18,0 -14,0 L 14,0 C 18,0 21,-2 21,-6 L 21,-62 C 21,-71 10,-76 10,-82 L 10,-92" />
              <path class="propipette" d="M -7,-104 L -7,-121 C -7,-128 -4,-130 0,-130 C 4,-130 7,-128 7,-121 L 7,-104 Z" />
              <rect class="bouchon" x="-12" y="-104" width="24" height="12" rx="2" />
            `;
        }
    },

    {
        id: 'entonnoir',
        name: 'Entonnoir',
        category: 'separation',
        keywords: 'entonnoir filtre filtration buchner',
        defaultProps: { variant: 'simple' },
        propSchema: [
            { key: 'variant', label: 'Type', type: 'select', options: [
                { value: 'simple', label: 'Entonnoir simple' },
                { value: 'filtre', label: 'Avec filtre plissé' },
                { value: 'buchner', label: 'Entonnoir Büchner' }
            ]}
        ],
        getBBox(p) {
            if (p.variant === 'filtre') return { x: -44, y: -120, width: 88, height: 120 };
            if (p.variant === 'buchner') return { x: -46, y: -146, width: 92, height: 146 };
            return { x: -33, y: -100, width: 66, height: 100 };
        },
        getAnchors(p) {
            if (p.variant === 'buchner') {
                return [
                    { id: 'neck-bottom', x: 0, y: -48, type: 'neck-bottom', dir: 'down', angle: 180, label: 'Joint conique' },
                    { id: 'clamp-target', x: 0, y: -70, type: 'clamp-target', dir: 'any', angle: 0, label: 'Cône (anneau)' },
                    { id: 'tip', x: 0, y: 0, type: 'tip', dir: 'down', label: 'Pointe' }
                ];
            }
            const coneY = p.variant === 'filtre' ? -52 : -50;
            return [
                { id: 'neck-bottom', x: 0, y: coneY, type: 'neck-bottom', dir: 'down', angle: 180, label: 'Base cône' },
                { id: 'clamp-target', x: 0, y: coneY - 12, type: 'clamp-target', dir: 'any', angle: 0, label: 'Cône (anneau)' },
                { id: 'tip', x: 0, y: 0, type: 'tip', dir: 'down', label: 'Pointe' }
            ];
        },
        render(p) {
            if (p.variant === 'filtre') {
                return `
                  <path class="verre-fond" d="M -44,-120 L -28,-112 L -14,-120 L 0,-112 L 14,-120 L 28,-112 L 44,-120 L 5,-60 L 5,0 L -5,0 L -5,-60 Z" />
                  <path class="trait" d="M -44,-120 L -28,-112 L -14,-120 L 0,-112 L 14,-120 L 28,-112 L 44,-120 L 4,-62 Q 0,-58 -4,-62 Z" />
                  <path class="verre" style="fill:none;" d="M -36,-98 L -5,-56 L -5,0" />
                  <path class="verre" style="fill:none;" d="M 36,-98 L 5,-56 L 5,0" />
                `;
            }
            if (p.variant === 'buchner') {
                return `
                  <path class="verre-fond" d="M -46,-146 L 46,-146 L 46,-100 L 7,-62 L 7,0 L -7,-10 L -7,-62 L -46,-100 Z" />
                  <path class="verre" style="fill:none;" d="M -46,-146 L -46,-100 L -7,-62 L -7,-10" />
                  <path class="verre" style="fill:none;" d="M 46,-146 L 46,-100 L 7,-62 L 7,0" />
                  <line class="trait" style="stroke-dasharray: 4 3;" x1="-46" y1="-103" x2="46" y2="-103" />
                  <polygon class="bouchon" points="-19,-60 19,-60 15,-42 -15,-42" />
                `;
            }
            return `
              <path class="verre-fond" d="M -33,-100 L -5,-55 L -5,0 L 5,0 L 5,-55 L 33,-100 Z" />
              <path class="verre" style="fill:none;" d="M -33,-100 L -5,-55 L -5,0" />
              <path class="verre" style="fill:none;" d="M 33,-100 L 5,-55 L 5,0" />
            `;
        }
    },

    {
        id: 'ampoule-decanter',
        name: 'Ampoule à décanter',
        category: 'separation',
        keywords: 'ampoule decanter extraction liquide phase robinet',
        defaultProps: { open: false, stopper: true, phase1Level: 35, phase1Color: '#9ad1f5', phase2Level: 30, phase2Color: '#f4d35e' },
        propSchema: [
            { key: 'open', label: 'Robinet ouvert', type: 'toggle' },
            { key: 'stopper', label: 'Bouchon en place', type: 'toggle' },
            { key: 'phase1Level', label: 'Phase inférieure', type: 'range', min: 0, max: 80, step: 5, unit: '%' },
            { key: 'phase1Color', label: 'Couleur phase inf.', type: 'color', presets: LIQUID_PRESETS, showIf: p => (p.phase1Level || 0) > 0 },
            { key: 'phase2Level', label: 'Phase supérieure', type: 'range', min: 0, max: 80, step: 5, unit: '%' },
            { key: 'phase2Color', label: 'Couleur phase sup.', type: 'color', presets: LIQUID_PRESETS, showIf: p => (p.phase2Level || 0) > 0 }
        ],
        getBBox(p) {
            return { x: -58, y: p.stopper ? -456 : -432, width: 116, height: p.stopper ? 456 : 432 };
        },
        getAnchors() {
            return [
                { id: 'tip', x: 0, y: 0, type: 'tip', dir: 'down', label: 'Pointe' },
                { id: 'clamp-target', x: 0, y: -230, type: 'clamp-target', dir: 'any', angle: 0, label: 'Tige (pince)' },
                { id: 'neck-top', x: 0, y: -420, type: 'neck-top', dir: 'up', angle: 0, label: 'Col' }
            ];
        },
        render(p, uid, ctx = {}) {
            const bg = 'M -14,-432 L -14,-390 C -60,-380 -62,-322 -40,-284 C -26,-260 -12,-244 -10,-230 L -10,-57 L -4,-44 L -4,0 L 4,-8 L 4,-44 L 10,-57 L 10,-230 C 12,-244 26,-260 40,-284 C 62,-322 60,-380 14,-390 L 14,-432 Z';
            const bodyClip = 'M -12.5,-390 C -58,-380 -60,-322 -38.5,-284 C -24.5,-260 -10.5,-244 -8.5,-230 L -8.5,-57 L -2.5,-44 L -2.5,-33 L 2.5,-33 L 2.5,-44 L 8.5,-57 L 8.5,-230 C 10.5,-244 24.5,-260 38.5,-284 C 60,-322 58,-380 12.5,-390 Z';
            const l1 = Math.max(0, Math.min(80, Number(p.phase1Level) || 0));
            const l2 = Math.max(0, Math.min(100 - l1, Number(p.phase2Level) || 0));
            const rot = Number(ctx?.rotation) || 0;
            const flipX = Boolean(ctx?.flipX);
            const { sinT, cosT, flipSign, wyTop, wyBottom } = getLiquidVerticalSpan(-55, 55, -385, -225, rot, flipX);
            let wy1 = wyBottom - (l1 / 100) * (wyBottom - wyTop);
            let wy2 = wy1 - (l2 / 100) * (wyBottom - wyTop);
            if (!p.stopper) {
                const wyRim = Math.max(
                    projectWorldY(-14, -432, sinT, cosT, flipSign),
                    projectWorldY(14, -432, sinT, cosT, flipSign)
                );
                if (wy1 < wyRim) wy1 = wyRim;
                if (wy2 < wyRim) wy2 = wyRim;
            }
            const showP1 = l1 > 0 && wy1 < wyBottom - 0.5;
            const showP2 = l2 > 0 && wy2 < wy1 - 0.5;
            const counterRot = flipX ? rot : -rot;
            const rotAttr = Math.abs(counterRot) > 0.01 ? ` transform="rotate(${counterRot.toFixed(2)}, 0, 0)"` : '';
            const liquids = (showP1 || showP2) ? `
              <defs><clipPath id="clip-${uid}"><path d="${bodyClip}" /></clipPath></defs>
              <g clip-path="url(#clip-${uid})" style="mix-blend-mode: darken;">
                <g${rotAttr}>
                  ${showP1 ? `<rect x="-800" y="${wy1.toFixed(1)}" width="1600" height="1600" fill="${esc(p.phase1Color)}" />` : ''}
                  ${showP2 ? `<rect x="-800" y="${wy2.toFixed(1)}" width="1600" height="${showP1 ? (wy1 - wy2).toFixed(1) : '1600'}" fill="${esc(p.phase2Color)}" />` : ''}
                  ${showP1 && showP2 ? `<line x1="-800" y1="${wy1.toFixed(1)}" x2="800" y2="${wy1.toFixed(1)}" stroke="rgba(0,0,0,0.2)" stroke-width="1.2" />` : ''}
                </g>
              </g>
            ` : '';
            const stopperSvg = p.stopper
                ? `<polygon class="bouchon" points="-17,-454 17,-454 13,-416 -13,-416" />`
                : '';
            return `
              <path class="verre-fond" d="${bg}" />
              ${liquids}
              ${stopperSvg}
              <path class="verre" style="fill:none;" d="M -14,-432 L -14,-390 C -60,-380 -62,-322 -40,-284 C -26,-260 -12,-244 -10,-230 L -10,-57 L -4,-44 L -4,0" />
              <path class="verre" style="fill:none;" d="M 14,-432 L 14,-390 C 60,-380 62,-322 40,-284 C 26,-260 12,-244 10,-230 L 10,-57 L 4,-44 L 4,-8" />
              ${renderStopcock(0, -33, p.open)}
            `;
        }
    },

    {
        id: 'ampoule-coulee',
        name: 'Ampoule de coulée',
        category: 'separation',
        keywords: 'ampoule coulee isobare addition goutte synthese equilibrage bouchon',
        defaultProps: { open: false, isobare: false, stopper: false, liquidLevel: 60, liquidColor: '#9ad1f5' },
        propSchema: [
            { key: 'isobare', label: 'Ampoule isobare', type: 'toggle' },
            { key: 'stopper', label: 'Bouchon en place', type: 'toggle' },
            { key: 'open', label: 'Robinet ouvert', type: 'toggle' },
            ...LIQUID_PROPS_SCHEMA
        ],
        getBBox(p) {
            const minX = p.isobare ? -38 : -28;
            const topY = p.stopper ? -319 : -295;
            return { x: minX, y: topY, width: 40 - minX, height: -topY };
        },
        getAnchors() {
            return [
                { id: 'neck-bottom', x: 0, y: -58, type: 'neck-bottom', dir: 'down', angle: 180, label: 'Embout rodé' },
                { id: 'neck-top', x: 0, y: -285, type: 'neck-top', dir: 'up', angle: 0, label: 'Col supérieur' },
                { id: 'clamp-target', x: 0, y: -200, type: 'clamp-target', dir: 'any', angle: 0, label: 'Corps (pince)' }
            ];
        },
        render(p, uid, ctx = {}) {
            const bg = 'M -14,-295 L 14,-295 L 14,-260 L 23,-248 L 23,-138 L 7,-118 L 7,-94 L 13,-85 L 13,-45 L 4,-35 L 4,-8 L -4,0 L -4,-35 L -13,-45 L -13,-85 L -7,-94 L -7,-118 L -23,-138 L -23,-248 L -14,-260 Z';
            const clip = 'M -12.5,-295 L 12.5,-295 L 12.5,-260 L 21.5,-248 L 21.5,-138 L 5.5,-118 L 5.5,-106 L -5.5,-106 L -5.5,-118 L -21.5,-138 L -21.5,-248 L -12.5,-260 Z';
            const stopperSvg = p.stopper
                ? `<polygon class="bouchon" points="-17,-317 17,-317 13,-279 -13,-279" />`
                : '';
            const leftWallSvg = p.isobare
                ? `
                  <path class="verre-fond" d="M -14,-278 L -28,-278 Q -36,-278 -36,-270 L -36,-78 Q -36,-70 -28,-70 L -13,-70 L -13,-76 L -28,-76 Q -30,-76 -30,-78 L -30,-270 Q -30,-272 -28,-272 L -14,-272 Z" />
                  <path class="verre" style="fill:none;" d="M -14,-295 L -14,-278 L -28,-278 Q -36,-278 -36,-270 L -36,-78 Q -36,-70 -28,-70 L -13,-70 L -13,-45 L -4,-35 L -4,0" />
                  <path class="verre" style="fill:none;" d="M -14,-272 L -28,-272 Q -30,-272 -30,-270 L -30,-78 Q -30,-76 -28,-76 L -13,-76" />
                  <path class="verre" style="fill:none;" d="M -14,-272 L -14,-260 L -23,-248 L -23,-138 L -7,-118 L -7,-94 L -13,-85 L -13,-76" />
                `
                : `<path class="verre" style="fill:none;" d="M -14,-295 L -14,-260 L -23,-248 L -23,-138 L -7,-118 L -7,-94 L -13,-85 L -13,-45 L -4,-35 L -4,0" />`;
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, clip, -245, -106, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 21.5, rimPoints: [[-12.5, -295], [12.5, -295]], sealed: Boolean(p.stopper), fillToRim: Boolean(p.fillToRim) })}
              ${stopperSvg}
              ${leftWallSvg}
              <path class="verre" style="fill:none;" d="M 14,-295 L 14,-260 L 23,-248 L 23,-138 L 7,-118 L 7,-94 L 13,-85 L 13,-45 L 4,-35 L 4,-8" />
              ${[-228, -213, -198, -183, -168, -153].map((y, i) => `<line class="trait" x1="${i % 2 === 0 ? 11 : 15}" y1="${y}" x2="23" y2="${y}" />`).join('')}
              ${renderStopcock(0, -106, p.open)}
            `;
        }
    },

    {
        id: 'coupelle-pesee',
        name: 'Coupelle de pesée',
        category: 'dosage',
        keywords: 'coupelle pesee balance solide poudre',
        defaultProps: { hasSolid: true, solidColor: '#4ecdc4' },
        propSchema: [
            { key: 'hasSolid', label: 'Contient un solide', type: 'toggle' },
            { key: 'solidColor', label: 'Couleur solide', type: 'color', presets: SOLID_PRESETS, showIf: p => p.hasSolid }
        ],
        getBBox() {
            return { x: -44, y: -16, width: 88, height: 16 };
        },
        getAnchors() {
            return [{ id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' }];
        },
        render(p) {
            const solid = p.hasSolid
                ? `<path fill="${esc(p.solidColor)}" d="M -24,-7.5 Q 0,-15.5 24,-7.5 L 19,-1.5 L -19,-1.5 Z" />`
                : '';
            return `
              ${solid}
              <path class="trait" d="M -44,-14 L -30,-2 C -27,-0.5 -24,0 -20,0 L 20,0 C 24,0 27,-0.5 30,-2 L 44,-14" />
            `;
        }
    },

    {
        id: 'spatule',
        name: 'Spatule',
        category: 'dosage',
        keywords: 'spatule prelever solide poudre',
        defaultProps: {},
        propSchema: [],
        getBBox() {
            return { x: -12, y: -222, width: 20, height: 222 };
        },
        getAnchors() {
            return [{ id: 'tip', x: 0, y: 0, type: 'tip', dir: 'down', label: 'Bout plat' }];
        },
        render() {
            return `<path class="metal" d="M -2,-222 C -12,-214 -14,-198 -4,-185 L -2,-182 L -2,-28 L -4,-24 L -4,0 L 0.5,0 L 1.5,-24 L 2,-28 L 2,-184 C -7,-196 -6,-210 1,-220 Z" />`;
        }
    },

    {
        id: 'baguette-verre',
        name: 'Baguette en verre',
        category: 'dosage',
        keywords: 'baguette verre agitateur tige',
        defaultProps: {},
        propSchema: [],
        getBBox() {
            return { x: -4, y: -220, width: 8, height: 220 };
        },
        getAnchors() {
            return [{ id: 'tip', x: 0, y: 0, type: 'tip', dir: 'down', label: 'Extrémité' }];
        },
        render() {
            return `<rect class="verre" x="-3.5" y="-220" width="7" height="220" rx="3.5" />`;
        }
    },

    // ---------------------------------------------------------------------
    // 3. SUPPORTS, CHAUFFAGE & ACCESSOIRES
    // ---------------------------------------------------------------------
    {
        id: 'paillasse',
        name: 'Paillasse / Table',
        category: 'supports',
        fixedUpright: true,
        insertAtBack: true,
        keywords: 'table paillasse support sol plan travail banc',
        defaultProps: { width: 760, style: 'plateau', color: '#e2e8f0' },
        propSchema: [
            { key: 'style', label: 'Style', type: 'select', options: [
                { value: 'plateau', label: 'Plateau de paillasse' },
                { value: 'pieds', label: 'Table avec pieds' },
                { value: 'ligne', label: 'Trait de sol (épuré)' }
            ]},
            { key: 'width', label: 'Largeur', type: 'range', min: 250, max: 1600, step: 20, unit: 'mm' },
            { key: 'color', label: 'Couleur plateau', type: 'color', presets: [
                { label: 'Gris paillasse', color: '#e2e8f0' },
                { label: 'Bois clair', color: '#e6ccb2' },
                { label: 'Blanc labo', color: '#f8fafc' },
                { label: 'Ardoise', color: '#cbd5e1' }
            ], showIf: p => p.style !== 'ligne' }
        ],
        getBBox(p) {
            const w = Math.max(250, Number(p.width) || 760);
            const h = p.style === 'pieds' ? 98 : (p.style === 'ligne' ? 16 : 26);
            return { x: -w / 2, y: 0, width: w, height: h };
        },
        getAnchors(p) {
            const w = Math.max(250, Number(p.width) || 760);
            return [
                { id: 'table-top', x: 0, y: 0, x1: -w / 2, x2: w / 2, type: 'surface-line', dir: 'up', angle: 0, label: 'Dessus paillasse' }
            ];
        },
        render(p) {
            const w = Math.max(250, Number(p.width) || 760);
            const hw = w / 2;
            // Décalage de 3 px vers le bas afin que les objets posés sur y=0 (stroke-width 3) reposent sur le dessus du plateau sans s'y enfoncer
            if (p.style === 'ligne') {
                let hatches = '';
                for (let x = -hw + 12; x <= hw - 6; x += 18) {
                    hatches += `<line x1="${x}" y1="3" x2="${x - 8}" y2="13" stroke="#64748b" stroke-width="1.6" stroke-linecap="round" />`;
                }
                return `
                  <line x1="${-hw}" y1="3" x2="${hw}" y2="3" stroke="#000000" stroke-width="3.5" stroke-linecap="round" />
                  ${hatches}
                `;
            }
            const col = esc(p.color || '#e2e8f0');
            if (p.style === 'pieds') {
                const legOffset = Math.max(40, hw - 48);
                return `
                  <rect x="${-legOffset}" y="23" width="16" height="72" fill="#94a3b8" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" />
                  <rect x="${legOffset - 16}" y="23" width="16" height="72" fill="#94a3b8" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" />
                  <rect x="${-legOffset + 16}" y="23" width="${(legOffset - 16) * 2}" height="14" fill="#cbd5e1" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" />
                  <rect x="${-hw}" y="3" width="${w}" height="20" rx="3" fill="${col}" stroke="#000000" stroke-width="3" stroke-linejoin="round" />
                `;
            }
            return `
              <rect x="${-hw}" y="3" width="${w}" height="20" rx="3" fill="${col}" stroke="#000000" stroke-width="3" stroke-linejoin="round" />
              <line x1="${-hw + 6}" y1="17" x2="${hw - 6}" y2="17" stroke="rgba(0,0,0,0.12)" stroke-width="2" />
            `;
        }
    },

    {
        id: 'robinet',
        name: 'Robinet d’eau',
        category: 'supports',
        fixedUpright: true,
        keywords: 'robinet eau evier alimentation col cygne refrigerant trompe',
        defaultProps: { variant: 'paillasse', open: false, showStream: false, handleColor: '#3b82f6' },
        propSchema: [
            { key: 'variant', label: 'Modèle', type: 'select', options: [
                { value: 'paillasse', label: 'Col de cygne (paillasse)' },
                { value: 'mural', label: 'Mural / Sortie simple' }
            ]},
            { key: 'open', label: 'Robinet ouvert', type: 'toggle' },
            { key: 'showStream', label: 'Afficher filet d’eau', type: 'toggle', showIf: p => p.open },
            { key: 'handleColor', label: 'Couleur manette', type: 'color', presets: [
                { label: 'Eau froide (bleu)', color: '#3b82f6' },
                { label: 'Eau chaude (rouge)', color: '#e06358' },
                { label: 'Gaz (jaune)', color: '#f59e0b' },
                { label: 'Métal', color: '#94a3b8' }
            ]}
        ],
        getBBox(p) {
            if (p.variant === 'mural') {
                return { x: -30, y: -92, width: 120, height: p.open && p.showStream ? 150 : 96 };
            }
            return { x: -92, y: -235, width: 145, height: 235 };
        },
        getAnchors(p) {
            if (p.variant === 'mural') {
                return [
                    { id: 'outlet', x: 74, y: 0, type: 'hose', dir: 'down', angle: 180, label: 'Olive sortie eau' },
                    { id: 'faucet-out', x: 74, y: 0, type: 'faucet-out', dir: 'down', angle: 180, label: 'Bec robinet' }
                ];
            }
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Embase paillasse' },
                { id: 'outlet', x: -72, y: -148, type: 'hose', dir: 'down', angle: 180, label: 'Olive sortie eau' },
                { id: 'faucet-out', x: -72, y: -148, type: 'faucet-out', dir: 'down', angle: 180, label: 'Bec robinet' }
            ];
        },
        render(p) {
            const hc = esc(p.handleColor || '#3b82f6');
            if (p.variant === 'mural') {
                const stream = (p.open && p.showStream)
                    ? `<path d="M 71,2 Q 70,30 71,56 L 77,56 Q 78,30 77,2 Z" fill="#74c0fc" opacity="0.85" />`
                    : '';
                const handleSvg = p.open
                    ? `<rect x="26" y="-88" width="10" height="32" rx="3" fill="${hc}" stroke="#000000" stroke-width="2.5" />`
                    : `<rect x="13" y="-76" width="36" height="10" rx="3" fill="${hc}" stroke="#000000" stroke-width="2.5" />`;
                return `
                  ${stream}
                  <!-- Rosace murale -->
                  <rect class="metal" x="-26" y="-66" width="12" height="44" rx="2.5" />
                  <!-- Corps horizontal + coude descendant -->
                  <path class="metal" d="M -14,-52 L 58,-52 Q 82,-52 82,-28 L 82,-18 L 66,-18 L 66,-28 Q 66,-36 58,-36 L -14,-36 Z" />
                  <!-- Olive crantée de sortie vers le bas -->
                  <path class="metal" d="M 69,-18 L 79,-18 L 79,-3 L 77,0 L 71,0 L 69,-3 Z" />
                  <line class="trait" style="stroke-width:1.5;" x1="69" y1="-12" x2="79" y2="-12" />
                  <line class="trait" style="stroke-width:1.5;" x1="69" y1="-7" x2="79" y2="-7" />
                  <!-- Tête de vanne + poignée -->
                  <rect class="metal" x="23" y="-68" width="16" height="16" rx="2" />
                  ${handleSvg}
                `;
            }
            const stream = (p.open && p.showStream)
                ? `<path d="M -75,-146 Q -76,-80 -75,-2 L -69,-2 Q -68,-80 -69,-146 Z" fill="#74c0fc" opacity="0.85" />`
                : '';
            const handleSvg = p.open
                ? `<rect x="28" y="-68" width="10" height="32" rx="3" fill="${hc}" stroke="#000000" stroke-width="2.5" />`
                : `<rect x="17" y="-57" width="32" height="10" rx="3" fill="${hc}" stroke="#000000" stroke-width="2.5" />`;
            return `
              ${stream}
              <!-- Embase fixée sur la paillasse -->
              <rect class="metal" x="-22" y="-12" width="44" height="12" rx="2.5" />
              <rect class="metal" x="-14" y="-70" width="28" height="58" rx="3" />
              <!-- Vanne latérale + manette -->
              <rect class="metal" x="14" y="-59" width="16" height="14" rx="2" />
              ${handleSvg}
              <!-- Col de cygne vers la gauche -->
              <path class="metal" d="M -7,-70 L -7,-196 A 29,29 0 0,0 -65,-196 L -65,-172 L -79,-172 L -79,-196 A 43,43 0 0,1 7,-196 L 7,-70 Z" />
              <!-- Olive crantée de sortie vers le bas (x=-72, y=-148) -->
              <path class="metal" d="M -77,-172 L -67,-172 L -67,-152 L -69.5,-148 L -74.5,-148 L -77,-152 Z" />
              <line class="trait" style="stroke-width:1.5;" x1="-77" y1="-165" x2="-67" y2="-165" />
              <line class="trait" style="stroke-width:1.5;" x1="-77" y1="-158" x2="-67" y2="-158" />
            `;
        }
    },

    {
        id: 'evier',
        name: 'Évier',
        category: 'supports',
        fixedUpright: true,
        keywords: 'evier bac eau vidange rejet lavabo refrigerant paillasse encastre',
        defaultProps: { width: 140, hasWater: true, waterColor: '#9ad1f5' },
        propSchema: [
            { key: 'width', label: 'Largeur', type: 'range', min: 100, max: 220, step: 10, unit: 'mm' },
            { key: 'hasWater', label: 'Eau au fond', type: 'toggle' },
            { key: 'waterColor', label: 'Couleur eau', type: 'color', presets: LIQUID_PRESETS, showIf: p => p.hasWater }
        ],
        getBBox(p) {
            const w = Math.max(100, Math.min(220, Number(p.width) || 140));
            return { x: -w / 2 - 10, y: 0, width: w + 20, height: 92 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Niveau paillasse' },
                { id: 'drain-in', x: 0, y: 14, type: 'hose', dir: 'up', angle: 0, label: 'Évacuation eau' }
            ];
        },
        render(p) {
            const w = Math.max(100, Math.min(220, Number(p.width) || 140));
            const hw = w / 2;
            const water = p.hasWater
                ? `<path d="M ${-hw + 9},50 Q ${(-hw / 3).toFixed(1)},47 0,50 T ${hw - 9},50 L ${hw - 9},58 C ${hw - 9},62.5 ${hw - 12.5},65 ${hw - 18},65 L ${-hw + 18},65 C ${-hw + 12.5},65 ${-hw + 9},62.5 ${-hw + 9},58 Z" fill="${esc(p.waterColor || '#9ad1f5')}" opacity="0.85" />`
                : '';
            return `
              <!-- Masque de découpe encastré à niveau dans la paillasse -->
              <path d="M ${-hw},1 L ${-hw},62 C ${-hw},69 ${-hw + 6},74 ${-hw + 14},74 L ${hw - 14},74 C ${hw - 6},74 ${hw},69 ${hw},62 L ${hw},1 Z" fill="#f1f5f9" stroke="none" />
              <!-- Cuve intérieure ouverte vers le haut -->
              <path d="M ${-hw + 8},2 L ${-hw + 8},58 C ${-hw + 8},63 ${-hw + 12},66 ${-hw + 18},66 L ${hw - 18},66 C ${hw - 12},66 ${hw - 8},63 ${hw - 8},58 L ${hw - 8},2 Z" fill="#ffffff" stroke="none" />
              ${water}
              <!-- Conduit d'évacuation sous l'évier -->
              <path d="M -7,74 L -7,92 L 7,92 L 7,74 Z" fill="#94a3b8" stroke="none" />
              <line x1="-7" y1="74" x2="-7" y2="92" stroke="#000000" stroke-width="2.5" stroke-linecap="round" />
              <line x1="7" y1="74" x2="7" y2="92" stroke="#000000" stroke-width="2.5" stroke-linecap="round" />
              <!-- Contours de la cuve (ouverts en haut) -->
              <path d="M ${-hw + 8},3 L ${-hw + 8},58 C ${-hw + 8},63 ${-hw + 12},66 ${-hw + 18},66 L ${hw - 18},66 C ${hw - 12},66 ${hw - 8},63 ${hw - 8},58 L ${hw - 8},3" fill="none" stroke="#000000" stroke-width="2" stroke-linejoin="round" />
              <path d="M ${-hw},6 L ${-hw},62 C ${-hw},69 ${-hw + 6},74 ${-hw + 14},74 L ${hw - 14},74 C ${hw - 6},74 ${hw},69 ${hw},62 L ${hw},6" fill="none" stroke="#000000" stroke-width="3" stroke-linejoin="round" />
              <!-- Bonde au fond -->
              <rect x="-12" y="64" width="24" height="4" rx="1.5" fill="#94a3b8" stroke="#000000" stroke-width="1.8" />
              <line x1="-6" y1="64" x2="-6" y2="68" stroke="#000000" stroke-width="1.3" />
              <line x1="0" y1="64" x2="0" y2="68" stroke="#000000" stroke-width="1.3" />
              <line x1="6" y1="64" x2="6" y2="68" stroke="#000000" stroke-width="1.3" />
              <!-- Rebords d'encastrement posés à niveau sur la paillasse -->
              <path d="M ${-hw - 10},6 L ${-hw - 10},1.5 L ${-hw + 8},1.5 L ${-hw + 8},6 Z" fill="#cbd5e1" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" />
              <path d="M ${hw - 8},6 L ${hw - 8},1.5 L ${hw + 10},1.5 L ${hw + 10},6 Z" fill="#cbd5e1" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" />
            `;
        }
    },

    {
        id: 'potence',
        name: 'Potence',
        category: 'supports',
        fixedUpright: true,
        keywords: 'potence support pince noix titrage burette',
        defaultProps: { variant: 'simple', clamp1Y: 360, clamp2Y: 620 },
        propSchema: [
            { key: 'variant', label: 'Configuration', type: 'select', options: [
                { value: 'simple', label: 'Simple (1 pince)' },
                { value: 'titrage', label: 'Titrage (2 pinces)' }
            ]},
            { key: 'clamp1Y', label: 'Hauteur pince 1', type: 'range', min: 100, max: 520, step: 10, unit: 'mm' },
            { key: 'clamp2Y', label: 'Hauteur pince 2', type: 'range', min: 180, max: 700, step: 10, unit: 'mm', showIf: p => p.variant === 'titrage' }
        ],
        getBBox(p) {
            if (p.variant === 'titrage') return { x: -145, y: -748, width: 195, height: 748 };
            return { x: -130, y: -565, width: 175, height: 565 };
        },
        getAnchors(p) {
            const c1 = -(Number(p.clamp1Y) || 360);
            const anchors = [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Socle' },
                { id: 'clamp1', x: -120, y: c1, type: 'clamp', dir: 'left', angle: 180, label: 'Pince 1' }
            ];
            if (p.variant === 'titrage') {
                const c2 = -(Number(p.clamp2Y) || 620);
                anchors.push({ id: 'clamp2', x: -120, y: c2, type: 'clamp', dir: 'left', angle: 180, label: 'Pince 2' });
            }
            return anchors;
        },
        render(p) {
            const c1 = -(Number(p.clamp1Y) || 360);
            if (p.variant === 'titrage') {
                const c2 = -(Number(p.clamp2Y) || 620);
                return `
                  <line class="potence" x1="-120" y1="0" x2="50" y2="0" />
                  <line class="potence" x1="0" y1="-748" x2="0" y2="0" />
                  <line class="potence" x1="-113" y1="${c1}" x2="40" y2="${c1}" />
                  <circle cx="0" cy="${c1}" r="8" fill="#000000" />
                  <path class="potence" d="M -145,${c1 - 9} L -113,${c1 - 9} L -113,${c1 + 9} L -145,${c1 + 9}" />
                  <line class="potence" x1="-113" y1="${c2}" x2="40" y2="${c2}" />
                  <circle cx="0" cy="${c2}" r="8" fill="#000000" />
                  <path class="potence" d="M -145,${c2 - 9} L -113,${c2 - 9} L -113,${c2 + 9} L -145,${c2 + 9}" />
                `;
            }
            return `
              <line class="potence" x1="-100" y1="0" x2="45" y2="0" />
              <line class="potence" x1="0" y1="-565" x2="0" y2="0" />
              <line class="potence" x1="-98" y1="${c1}" x2="40" y2="${c1}" />
              <circle cx="0" cy="${c1}" r="8" fill="#000000" />
              <path class="potence" d="M -130,${c1 - 10} L -98,${c1 - 10} L -98,${c1 + 10} L -130,${c1 + 10}" />
            `;
        }
    },

    {
        id: 'support-entonnoir',
        name: 'Support à entonnoir (bois)',
        category: 'supports',
        fixedUpright: true,
        keywords: 'potence support entonnoir ampoule decanter bois anneau filtration decantation',
        defaultProps: { variant: 'double', armY: 250 },
        propSchema: [
            { key: 'variant', label: 'Configuration', type: 'select', options: [
                { value: 'double', label: 'Double (2 anneaux)' },
                { value: 'simple', label: 'Simple (1 anneau)' }
            ]},
            { key: 'armY', label: 'Hauteur du support', type: 'range', min: 130, max: 330, step: 10, unit: 'mm' }
        ],
        getBBox(p) {
            if (p.variant === 'simple') return { x: -115, y: -386, width: 215, height: 386 };
            return { x: -115, y: -386, width: 230, height: 386 };
        },
        getAnchors(p) {
            const ay = -(Number(p.armY) || 250);
            const anchors = [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Socle bois' },
                { id: 'ring-left', x: -72, y: ay, type: 'clamp', dir: 'up', angle: 180, label: 'Anneau gauche' }
            ];
            if (p.variant !== 'simple') {
                anchors.push({ id: 'ring-right', x: 72, y: ay, type: 'clamp', dir: 'up', angle: 180, label: 'Anneau droit' });
            }
            return anchors;
        },
        render(p) {
            const ay = -(Number(p.armY) || 250);
            const isDouble = p.variant !== 'simple';
            const armSvg = isDouble
                ? `
                  <!-- Bras double à 2 anneaux en bois -->
                  <path class="bois" d="M -115,${ay - 10} L 115,${ay - 10} C 115,${ay + 2} 105,${ay + 6} 72,${ay + 6} C 42,${ay + 6} 28,${ay + 2} 18,${ay + 2} L -18,${ay + 2} C -28,${ay + 2} -42,${ay + 6} -72,${ay + 6} C -105,${ay + 6} -115,${ay + 2} -115,${ay - 10} Z" />
                  <ellipse cx="-72" cy="${ay - 5}" rx="28" ry="4.5" fill="#ffffff" stroke="#000000" stroke-width="2" />
                  <ellipse cx="72" cy="${ay - 5}" rx="28" ry="4.5" fill="#ffffff" stroke="#000000" stroke-width="2" />
                `
                : `
                  <!-- Bras simple à 1 anneau en bois -->
                  <path class="bois" d="M -115,${ay - 10} L 18,${ay - 10} L 18,${ay + 2} L -18,${ay + 2} C -28,${ay + 2} -42,${ay + 6} -72,${ay + 6} C -105,${ay + 6} -115,${ay + 2} -115,${ay - 10} Z" />
                  <ellipse cx="-72" cy="${ay - 5}" rx="28" ry="4.5" fill="#ffffff" stroke="#000000" stroke-width="2" />
                `;
            return `
              <!-- Socle rectangulaire en bois -->
              <rect class="bois" x="-100" y="-18" width="200" height="18" rx="2.5" />
              <!-- Tige verticale en bois + renfort bas + pommeau haut -->
              <rect class="bois" x="-7" y="-366" width="14" height="348" rx="3" />
              <rect class="bois" x="-10" y="-96" width="20" height="78" rx="2.5" />
              <circle class="bois" cx="0" cy="-374" r="8.5" />
              <!-- Bloc de serrage coulissant + vis papillon -->
              <rect class="bois" x="-18" y="${ay + 2}" width="36" height="24" rx="3" />
              <line class="trait" style="stroke-width:1.8;" x1="-18" y1="${ay + 22}" x2="18" y2="${ay + 22}" />
              <path class="bois" style="fill:#b98850;" d="M -14,${ay + 18} L 4,${ay + 7} L 9,${ay + 14} L -9,${ay + 25} Z" />
              <circle cx="0" cy="${ay + 14}" r="3" fill="#8b5e34" stroke="#000000" stroke-width="1.5" />
              ${armSvg}
            `;
        }
    },

    {
        id: 'boy',
        name: 'Support élévateur (Boy)',
        category: 'supports',
        fixedUpright: true,
        keywords: 'boy support elevateur ciseau hauteur',
        defaultProps: { height: 90 },
        propSchema: [
            { key: 'height', label: 'Hauteur', type: 'range', min: 60, max: 185, step: 5, unit: 'mm' }
        ],
        getBBox(p) {
            const h = Number(p.height) || 90;
            return { x: -100, y: -h, width: 228, height: h };
        },
        getAnchors(p) {
            const h = Number(p.height) || 90;
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'surface', x: 0, y: -h, type: 'surface', dir: 'up', label: 'Plateau supérieur' }
            ];
        },
        render(p) {
            const h = Math.max(60, Math.min(185, Number(p.height) || 90));
            const topY = -h;
            const midY = -h / 2;
            // Géométrie du ciseau : bras de longueur constante ~172 mm
            const halfSpan = Math.max(36, Math.min(78, Math.sqrt(Math.max(1200, 168 * 168 - (h - 18) * (h - 18))) / 2));
            const knobX = Math.max(106, halfSpan + 44);
            return `
              <rect class="metal" x="-100" y="-9" width="200" height="9" rx="2" />
              <line class="potence" x1="${(-halfSpan).toFixed(1)}" y1="${(topY + 9).toFixed(1)}" x2="${halfSpan.toFixed(1)}" y2="-9" />
              <line class="potence" x1="${halfSpan.toFixed(1)}" y1="${(topY + 9).toFixed(1)}" x2="${(-halfSpan).toFixed(1)}" y2="-9" />
              <line class="trait" x1="${(-halfSpan - 8).toFixed(1)}" y1="${midY.toFixed(1)}" x2="${knobX.toFixed(1)}" y2="${midY.toFixed(1)}" />
              <circle cx="0" cy="${midY.toFixed(1)}" r="6" fill="#555555" stroke="#000000" stroke-width="2" />
              <rect class="bouchon" x="${knobX.toFixed(1)}" y="${(midY - 12).toFixed(1)}" width="12" height="24" rx="2" />
              <rect class="metal" x="-100" y="${topY.toFixed(1)}" width="200" height="9" rx="2" />
            `;
        }
    },

    {
        id: 'agitateur-magnetique',
        name: 'Agitateur magnétique',
        category: 'supports',
        fixedUpright: true,
        keywords: 'agitateur magnetique chauffant titrage plaque',
        defaultProps: { stirring: true, heating: false },
        propSchema: [
            { key: 'stirring', label: 'Agitation (voyant vert)', type: 'toggle' },
            { key: 'heating', label: 'Chauffage (voyant rouge)', type: 'toggle' }
        ],
        getBBox() {
            return { x: -122, y: -105, width: 244, height: 105 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'surface', x: 0, y: -105, type: 'surface', dir: 'up', label: 'Plateau' }
            ];
        },
        render(p) {
            const cStir = p.stirring ? '#4ecdc4' : '#cccccc';
            const cHeat = p.heating ? '#e06358' : '#cccccc';
            const stirAngle = p.stirring ? 35 : -135;
            const heatAngle = p.heating ? 45 : -135;
            return `
              <rect class="bouchon" x="-102" y="-9" width="22" height="9" rx="2" />
              <rect class="bouchon" x="80" y="-9" width="22" height="9" rx="2" />
              <path class="verre" d="M -114,-85 L 114,-85 L 122,-19 C 122,-13 117,-9 110,-9 L -110,-9 C -117,-9 -122,-13 -122,-19 Z" />
              <rect class="bouchon" x="-16" y="-96" width="32" height="11" />
              <rect class="metal" x="-78" y="-105" width="156" height="9" rx="2.5" />
              <circle cx="-85" cy="-64" r="5" fill="${cStir}" stroke="#000000" stroke-width="2" />
              <circle cx="-85" cy="-34" r="5" fill="${cHeat}" stroke="#000000" stroke-width="2" />
              <g transform="translate(-22, -48)">
                <circle class="bouton" cx="0" cy="0" r="18" />
                <line class="trait" x1="0" y1="0" x2="0" y2="-15" transform="rotate(${stirAngle})" />
              </g>
              <g transform="translate(58, -48)">
                <circle class="bouton" cx="0" cy="0" r="18" />
                <line class="trait" x1="0" y1="0" x2="0" y2="-15" transform="rotate(${heatAngle})" />
              </g>
            `;
        }
    },

    {
        id: 'barreau-aimante',
        name: 'Barreau aimanté',
        category: 'supports',
        keywords: 'barreau aimante turbulent agitateur',
        defaultProps: {},
        propSchema: [],
        getBBox() {
            return { x: -17, y: -10, width: 34, height: 10 };
        },
        getAnchors() {
            return [{ id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' }];
        },
        render() {
            return `
              <rect class="verre" x="-17" y="-10" width="34" height="10" rx="5" />
              <line class="trait" style="stroke-width: 1.5;" x1="0" y1="-10" x2="0" y2="0" />
            `;
        }
    },

    {
        id: 'chauffe-ballon',
        name: 'Chauffe-ballon',
        category: 'supports',
        fixedUpright: true,
        keywords: 'chauffe ballon chauffage reflux distillation',
        defaultProps: { on: true, power: 6 },
        propSchema: [
            { key: 'on', label: 'Allumé (voyant)', type: 'toggle' },
            { key: 'power', label: 'Thermostat', type: 'range', min: 0, max: 10, step: 1 }
        ],
        getBBox() {
            return { x: -81, y: -118, width: 162, height: 118 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'cradle', x: 0, y: -63, type: 'cradle', dir: 'up', label: 'Cuve ballon' }
            ];
        },
        render(p) {
            const led = p.on ? '#e06358' : '#cccccc';
            const angle = -135 + ((Number(p.power) || 0) / 10) * 270;
            return `
              <rect class="bouchon" x="-71" y="-9" width="22" height="9" rx="2" />
              <rect class="bouchon" x="49" y="-9" width="22" height="9" rx="2" />
              <path class="verre" d="M -81,-118 L -55,-118 A 55,55 0 0,0 55,-118 L 81,-118 L 81,-9 L -81,-9 Z" />
              <circle cx="-48" cy="-35" r="4.5" fill="${led}" stroke="#000000" stroke-width="2" />
              <g transform="translate(44, -35)">
                <circle class="bouton" cx="0" cy="0" r="13" />
                <line class="trait" x1="0" y1="0" x2="0" y2="-11" transform="rotate(${angle.toFixed(1)})" />
              </g>
            `;
        }
    },

    {
        id: 'support-ballon',
        name: 'Support à ballon',
        category: 'supports',
        fixedUpright: true,
        keywords: 'support ballon valet anneau',
        defaultProps: {},
        propSchema: [],
        getBBox() {
            return { x: -58, y: -28, width: 116, height: 28 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'cradle', x: 0, y: -12, type: 'cradle', dir: 'up', label: 'Empreinte ballon' }
            ];
        },
        render() {
            return `<path class="verre" d="M -58,-22 C -58,-25.5 -55.5,-28 -52,-28 L -38,-28 A 53,53 0 0,0 38,-28 L 52,-28 C 55.5,-28 58,-25.5 58,-22 L 58,-6 C 58,-2.5 55.5,0 52,0 L -52,0 C -55.5,0 -58,-2.5 -58,-6 Z" />`;
        }
    },

    {
        id: 'bec-bunsen',
        name: 'Bec Bunsen',
        category: 'supports',
        fixedUpright: true,
        keywords: 'bec bunsen flamme chauffage gaz',
        defaultProps: { flame: 'blue' },
        propSchema: [
            { key: 'flame', label: 'Flamme', type: 'select', options: [
                { value: 'off', label: 'Éteint' },
                { value: 'blue', label: 'Flamme bleue (chauffante)' },
                { value: 'yellow', label: 'Flamme jaune (sécurité)' }
            ]}
        ],
        getBBox(p) {
            const topY = p.flame === 'off' ? -155 : -215;
            return { x: -41, y: topY, width: 97, height: -topY };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'gas', x: 56, y: -22, type: 'hose', dir: 'right', label: 'Arrivée gaz' }
            ];
        },
        render(p) {
            let flameSvg = '';
            if (p.flame === 'blue') {
                flameSvg = `
                  <path d="M -6,-156 Q -10,-184 0,-215 Q 10,-184 6,-156 Z" fill="#9ad1f5" fill-opacity="0.75" stroke="#4a90d9" stroke-width="1.5" />
                  <path d="M -3.5,-156 Q -5,-174 0,-188 Q 5,-174 3.5,-156 Z" fill="#4a90d9" fill-opacity="0.85" stroke="none" />
                `;
            } else if (p.flame === 'yellow') {
                flameSvg = `
                  <path d="M -7,-156 Q -14,-186 0,-215 Q 14,-186 7,-156 Z" fill="#ffd43b" fill-opacity="0.85" stroke="#f08c00" stroke-width="1.5" />
                  <path d="M -3.5,-156 Q -5,-172 0,-184 Q 5,-172 3.5,-156 Z" fill="#ff922b" fill-opacity="0.85" stroke="none" />
                `;
            }
            const airHole = p.flame === 'yellow' ? 'fill="#b8bec4"' : 'fill="#333333"';
            return `
              ${flameSvg}
              <path class="metal" d="M 20,-26 L 52,-26 L 56,-24 L 56,-20 L 52,-18 L 20,-18 Z" />
              <line class="trait" style="stroke-width: 1.5;" x1="34" y1="-26" x2="34" y2="-18" />
              <line class="trait" style="stroke-width: 1.5;" x1="44" y1="-26" x2="44" y2="-18" />
              <rect class="metal" x="-7" y="-155" width="14" height="101" />
              <rect class="metal" x="-10" y="-54" width="20" height="24" rx="2" />
              <rect x="-5" y="-48" width="10" height="12" rx="3" ${airHole} stroke="#000000" stroke-width="1.5" />
              <path class="bouchon" d="M -22,-30 L 22,-30 L 26,-14 L 38,-14 C 40,-14 41,-12 41,-10 L 41,0 L -41,0 L -41,-10 C -41,-12 -40,-14 -38,-14 L -26,-14 Z" />
            `;
        }
    },

    {
        id: 'portoir-tubes',
        name: 'Portoir 6 tubes',
        category: 'supports',
        fixedUpright: true,
        keywords: 'portoir support tubes essais rack',
        defaultProps: {},
        propSchema: [],
        getBBox() {
            return { x: -140, y: -90, width: 280, height: 90 };
        },
        getAnchors() {
            const xs = [-105, -63, -21, 21, 63, 105];
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                ...xs.map((x, i) => ({ id: `slot-${i + 1}`, x, y: -16, type: 'surface', dir: 'up', label: `Tube ${i + 1}` }))
            ];
        },
        render() {
            const segments = [[-135, 17], [-92, 16], [-50, 16], [-8, 16], [34, 16], [76, 16], [118, 17]];
            return `
              <rect class="metal" x="-140" y="-16" width="280" height="16" rx="2.5" />
              <rect class="metal" x="-131" y="-78" width="10" height="62" />
              <rect class="metal" x="121" y="-78" width="10" height="62" />
              ${segments.map(([x, w]) => `<rect class="metal" x="${x}" y="-90" width="${w}" height="12" rx="1.5" />`).join('')}
            `;
        }
    },

    {
        id: 'pince-bois',
        name: 'Pince en bois',
        category: 'supports',
        keywords: 'pince bois tube essais chauffage',
        defaultProps: {},
        propSchema: [],
        getBBox() {
            return { x: -90, y: -24, width: 180, height: 48 };
        },
        getAnchors() {
            return [{ id: 'clamp', x: -69, y: 0, type: 'clamp', dir: 'left', angle: 180, label: 'Mâchoires' }];
        },
        render() {
            return `
              <path class="bois" d="M -90,-10 L -38,-13 L 86,-22 L 88,-13 L -38,-1 L -58,-1 C -62,-9 -76,-9 -80,-1 L -90,-1 Z" />
              <path class="bois" d="M -90,1 L -80,1 C -76,9 -62,9 -58,1 L -38,1 L 88,13 L 86,22 L -38,13 L -90,10 Z" />
              <rect class="metal" x="-44" y="-12" width="14" height="24" rx="4" />
              <line class="trait" style="stroke-width: 1.8;" x1="-44" y1="0" x2="-30" y2="0" />
            `;
        }
    },

    {
        id: 'bouchon',
        name: 'Bouchon',
        category: 'separation',
        keywords: 'bouchon conique cylindrique perce caoutchouc',
        defaultProps: { variant: 'conique' },
        propSchema: [
            { key: 'variant', label: 'Type', type: 'select', options: [
                { value: 'conique', label: 'Conique plein' },
                { value: 'perce', label: 'Conique percé' },
                { value: 'cylindrique', label: 'Cylindrique verre' }
            ]}
        ],
        getBBox(p) {
            if (p.variant === 'cylindrique') return { x: -17, y: -48, width: 34, height: 48 };
            return { x: -13, y: -32, width: 26, height: 32 };
        },
        getAnchors(p) {
            const bottomY = p.variant === 'cylindrique' ? -18 : -12;
            const anchors = [{ id: 'neck-bottom', x: 0, y: bottomY, type: 'neck-bottom', dir: 'down', angle: 180, label: 'Emboîtement' }];
            if (p.variant === 'perce') anchors.push({ id: 'hole', x: 0, y: -16, type: 'hole', dir: 'up', angle: 0, label: 'Passage' });
            return anchors;
        },
        render(p) {
            if (p.variant === 'cylindrique') {
                return `
                  <rect class="verre" x="-17" y="-48" width="34" height="8" rx="3" />
                  <rect class="verre" x="-13" y="-40" width="26" height="40" rx="2" />
                `;
            }
            if (p.variant === 'perce') {
                return `
                  <polygon class="bouchon" points="-13,-32 -4,-32 -4,0 -10,0" />
                  <polygon class="bouchon" points="4,-32 13,-32 10,0 4,0" />
                `;
            }
            return `<polygon class="bouchon" points="-12.5,-32 12.5,-32 9.5,0 -9.5,0" />`;
        }
    },

    // ---------------------------------------------------------------------
    // 4. DISTILLATION & VIDE
    // ---------------------------------------------------------------------
    {
        id: 'refrigerant',
        name: 'Réfrigérant',
        category: 'separation',
        keywords: 'refrigerant boules allihn droit liebig reflux distillation eau',
        defaultProps: { variant: 'boules', hasWater: false, waterColor: '#cbe8fb' },
        propSchema: [
            { key: 'variant', label: 'Type', type: 'select', options: [
                { value: 'boules', label: 'À boules (Allihn / Reflux)' },
                { value: 'droit', label: 'Droit (Liebig / Distillation)' }
            ]},
            { key: 'hasWater', label: 'Eau dans le manchon', type: 'toggle' },
            { key: 'waterColor', label: 'Couleur eau', type: 'color', presets: LIQUID_PRESETS, showIf: p => p.hasWater }
        ],
        getBBox() {
            return { x: -43, y: -430, width: 86, height: 430 };
        },
        getAnchors() {
            return [
                { id: 'neck-bottom', x: 0, y: -14, type: 'neck-bottom', dir: 'down', angle: 180, label: 'Embout bas' },
                { id: 'neck-top', x: 0, y: -416, type: 'neck-top', dir: 'up', angle: 0, label: 'Embout haut' },
                { id: 'clamp-target', x: 0, y: -215, type: 'clamp-target', dir: 'any', angle: 0, label: 'Manchon (pince)' },
                { id: 'water-out', x: -43, y: -346, type: 'hose', dir: 'left', label: 'Olivette haute' },
                { id: 'water-in', x: 43, y: -84, type: 'hose', dir: 'right', label: 'Olivette basse' }
            ];
        },
        render(p) {
            if (p.variant === 'droit') {
                const jacketWater = 'M -14,-380 L 14,-380 L 19,-367 L 19,-88 L 41,-88 L 41,-80 L 19,-80 L 19,-63 L 13,-50 L -13,-50 L -19,-63 L -19,-342 L -41,-342 L -41,-350 L -19,-350 L -19,-367 Z';
                const innerTube = 'M -14,-380 L -7,-355 L -7,-75 L -13,-50 L 13,-50 L 7,-75 L 7,-355 L 14,-380 Z';
                const water = p.hasWater ? `<path fill="${esc(p.waterColor)}" d="${jacketWater}" />` : '';
                return `
                  <path class="verre-fond" d="M -14,-430 L 14,-430 L 14,-380 L 19,-367 L 19,-88 L 41,-88 L 41,-80 L 19,-80 L 19,-63 L 13,-50 L 13,0 L -13,0 L -13,-50 L -19,-63 L -19,-342 L -41,-342 L -41,-350 L -19,-350 L -19,-367 L -14,-380 Z" />
                  ${water}
                  ${p.hasWater ? `<path fill="#ffffff" d="${innerTube}" />` : ''}
                  <path class="verre" style="fill:none;" d="M -14,-430 L -14,-380 L -19,-367 L -19,-350 L -41,-350" />
                  <path class="verre" style="fill:none;" d="M -41,-342 L -19,-342 L -19,-63 L -13,-50 L -13,0" />
                  <path class="verre" style="fill:none;" d="M 14,-430 L 14,-380 L 19,-367 L 19,-88 L 41,-88" />
                  <path class="verre" style="fill:none;" d="M 41,-80 L 19,-80 L 19,-63 L 13,-50 L 13,0" />
                  <path class="trait" d="M -14,-380 L -7,-355 L -7,-75 L -13,-50" />
                  <path class="trait" d="M 14,-380 L 7,-355 L 7,-75 L 13,-50" />
                `;
            }
            const jacketWater = 'M -14,-380 L 14,-380 L 21,-367 L 21,-88 L 43,-88 L 43,-80 L 21,-80 L 21,-63 L 13,-50 L -13,-50 L -21,-63 L -21,-342 L -43,-342 L -43,-350 L -21,-350 L -21,-367 Z';
            const water = p.hasWater ? `<path fill="${esc(p.waterColor)}" d="${jacketWater}" />` : '';
            const innerTube = `M -14,-380 L -6,-355 L -6,-335 C -14,-329 -14,-311 -6,-305 L -6,-287 C -14,-281 -14,-263 -6,-257 L -6,-239 C -14,-233 -14,-215 -6,-209 L -6,-191 C -14,-185 -14,-167 -6,-161 L -6,-143 C -14,-137 -14,-119 -6,-113 L -6,-75 L -13,-50 L 13,-50 L 6,-75 L 6,-113 C 14,-119 14,-137 6,-143 L 6,-161 C 14,-167 14,-185 6,-191 L 6,-209 C 14,-215 14,-233 6,-239 L 6,-257 C 14,-263 14,-281 6,-287 L 6,-305 C 14,-311 14,-329 6,-335 L 6,-355 L 14,-380 Z`;
            return `
              <path class="verre-fond" d="M -14,-430 L 14,-430 L 14,-380 L 21,-367 L 21,-88 L 43,-88 L 43,-80 L 21,-80 L 21,-63 L 13,-50 L 13,0 L -13,0 L -13,-50 L -21,-63 L -21,-342 L -43,-342 L -43,-350 L -21,-350 L -21,-367 L -14,-380 Z" />
              ${water}
              ${p.hasWater ? `<path fill="#ffffff" d="${innerTube}" />` : ''}
              <path class="verre" style="fill:none;" d="M -14,-430 L -14,-380 L -21,-367 L -21,-350 L -43,-350" />
              <path class="verre" style="fill:none;" d="M -43,-342 L -21,-342 L -21,-63 L -13,-50 L -13,0" />
              <path class="verre" style="fill:none;" d="M 14,-430 L 14,-380 L 21,-367 L 21,-88 L 43,-88" />
              <path class="verre" style="fill:none;" d="M 43,-80 L 21,-80 L 21,-63 L 13,-50 L 13,0" />
              <path class="trait" d="M -14,-380 L -6,-355 L -6,-335 C -14,-329 -14,-311 -6,-305 L -6,-287 C -14,-281 -14,-263 -6,-257 L -6,-239 C -14,-233 -14,-215 -6,-209 L -6,-191 C -14,-185 -14,-167 -6,-161 L -6,-143 C -14,-137 -14,-119 -6,-113 L -6,-75 L -13,-50" />
              <path class="trait" d="M 14,-380 L 6,-355 L 6,-335 C 14,-329 14,-311 6,-305 L 6,-287 C 14,-281 14,-263 6,-257 L 6,-239 C 14,-233 14,-215 6,-209 L 6,-191 C 14,-185 14,-167 6,-161 L 6,-143 C 14,-137 14,-119 6,-113 L 6,-75 L 13,-50" />
            `;
        }
    },

    {
        id: 'colonne-vigreux',
        name: 'Colonne de Vigreux',
        category: 'separation',
        keywords: 'colonne vigreux distillation fractionnee',
        defaultProps: {},
        propSchema: [],
        getBBox() {
            return { x: -18, y: -410, width: 36, height: 410 };
        },
        getAnchors() {
            return [
                { id: 'neck-bottom', x: 0, y: -14, type: 'neck-bottom', dir: 'down', angle: 180, label: 'Embout bas' },
                { id: 'neck-top', x: 0, y: -396, type: 'neck-top', dir: 'up', angle: 0, label: 'Embout haut' },
                { id: 'clamp-target', x: 0, y: -205, type: 'clamp-target', dir: 'any', angle: 0, label: 'Corps (pince)' }
            ];
        },
        render() {
            const leftYs = [-335, -280, -225, -170, -115];
            const rightYs = [-312, -257, -202, -147, -92];
            return `
              <path class="verre-fond" d="M -14,-410 L 14,-410 L 14,-370 L 17,-362 L 17,-65 L 13,-55 L 13,0 L -13,0 L -13,-55 L -17,-65 L -17,-362 L -14,-370 Z" />
              <path class="verre" style="fill:none;" d="M -14,-410 L -14,-370 L -17,-362 L -17,-65 L -13,-55 L -13,0" />
              <path class="verre" style="fill:none;" d="M 14,-410 L 14,-370 L 17,-362 L 17,-65 L 13,-55 L 13,0" />
              ${leftYs.map(y => `<polyline class="trait" points="-17,${y} -4,${y + 8} -17,${y + 16}" />`).join('')}
              ${rightYs.map(y => `<polyline class="trait" points="17,${y} 4,${y + 8} 17,${y + 16}" />`).join('')}
            `;
        }
    },

    {
        id: 'tete-distillation',
        name: 'Tête de distillation',
        category: 'separation',
        keywords: 'tete distillation thermometre bouchon',
        defaultProps: { stopper: true },
        propSchema: [{ key: 'stopper', label: 'Bouchon percé', type: 'toggle' }],
        getBBox(p) {
            return { x: -16, y: p.stopper ? -173 : -155, width: 124, height: p.stopper ? 173 : 155 };
        },
        getAnchors(p) {
            const anchors = [
                { id: 'neck-bottom', x: 0, y: -14, type: 'neck-bottom', dir: 'down', angle: 180, label: 'Embout bas' },
                { id: 'side-arm', x: 91.5, y: -74.1, type: 'neck-bottom', dir: 'down-right', angle: 105, label: 'Sortie réfrigérant (75°)' }
            ];
            if (p.stopper) anchors.push({ id: 'hole', x: 0, y: -157, type: 'hole', dir: 'up', angle: 0, label: 'Passage thermomètre' });
            else anchors.push({ id: 'neck-top', x: 0, y: -142, type: 'neck-top', dir: 'up', angle: 0, label: 'Col haut' });
            return anchors;
        },
        render(p) {
            const stopper = p.stopper ? `
              <rect class="bouchon" x="-13" y="-173" width="9" height="32" rx="1.5" />
              <rect class="bouchon" x="4" y="-173" width="9" height="32" rx="1.5" />
            ` : '';
            return `
              <path class="verre-fond" d="M -14,-155 L 14,-155 L 14,-108 L 108,-83 L 102,-58 L 13,-81 L 13,0 L -13,0 L -13,-108 Z" />
              <path class="verre" style="fill:none;" d="M -14,-155 L -14,-108 L -13,-96 L -13,0" />
              <path class="verre" style="fill:none;" d="M 14,-155 L 14,-108 L 108,-83" />
              <path class="verre" style="fill:none;" d="M 13,0 L 13,-81 L 102,-58" />
              ${stopper}
            `;
        }
    },

    {
        id: 'allonge-coudee',
        name: 'Allonge coudée',
        category: 'separation',
        keywords: 'allonge coudee distillation distillat',
        defaultProps: {},
        propSchema: [],
        getBBox() {
            return { x: -59, y: -118, width: 66, height: 118 };
        },
        getAnchors() {
            return [
                { id: 'inlet', x: -42, y: -100.9, type: 'neck-top', dir: 'up-left', angle: -75, label: 'Entrée réfrigérant (75°)' },
                { id: 'tip', x: 0, y: 0, type: 'tip', dir: 'down', label: 'Sortie distillat' }
            ];
        },
        render() {
            return `
              <path class="verre-fond" d="M -52,-118 L -5,-105 Q 7,-102 7,-88 L 7,0 L -7,0 L -7,-78 L -59,-91 Z" />
              <path class="verre" style="fill:none;" d="M -52,-118 L -5,-105 Q 7,-102 7,-88 L 7,0" />
              <path class="verre" style="fill:none;" d="M -59,-91 L -7,-78 L -7,0" />
            `;
        }
    },

    {
        id: 'fiole-vide',
        name: 'Fiole à vide',
        category: 'separation',
        keywords: 'fiole vide buchner filtration aspiration',
        defaultProps: { liquidLevel: 25, liquidColor: '#9ad1f5' },
        propSchema: [...LIQUID_PROPS_SCHEMA],
        getBBox() {
            return { x: -60, y: -215, width: 120, height: 215 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'neck-top', x: 0, y: -205, type: 'neck-top', dir: 'up', angle: 0, label: 'Col Büchner' },
                { id: 'vacuum', x: 44, y: -177.5, type: 'hose', dir: 'right', label: 'Olive vide' }
            ];
        },
        render(p, uid, ctx = {}) {
            const bg = 'M -20,-215 L -15,-209 L -15,-165 L -58,-27 C -63,-13 -54,0 -40,0 L 40,0 C 54,0 63,-13 58,-27 L 15,-165 L 15,-172 L 44,-172 L 44,-183 L 15,-183 L 15,-209 L 20,-215 Z';
            return `
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, bg, -165, -1.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 56, rimPoints: [[-15, -209], [15, -209]], fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" style="fill:none;" d="M -20,-215 L -15,-209 L -15,-165 L -58,-27 C -63,-13 -54,0 -40,0 L 40,0 C 54,0 63,-13 58,-27 L 15,-165 L 15,-172 L 44,-172" />
              <path class="verre" style="fill:none;" d="M 20,-215 L 15,-209 L 15,-183 L 44,-183" />
            `;
        }
    },

    {
        id: 'trompe-eau',
        name: 'Trompe à eau',
        category: 'separation',
        keywords: 'trompe eau vide venturi aspiration robinet',
        defaultProps: {},
        propSchema: [],
        getBBox() {
            return { x: -47, y: -145, width: 58, height: 145 };
        },
        getAnchors() {
            return [
                { id: 'vacuum', x: -47, y: -76, type: 'hose', dir: 'left', angle: -90, label: 'Olive aspiration' },
                { id: 'water-in', x: 0, y: -145, type: 'hose', dir: 'up', angle: 0, label: 'Robinet eau' },
                { id: 'faucet-mount', x: 0, y: -145, type: 'faucet-in', dir: 'up', angle: 0, label: 'Fixation robinet' }
            ];
        },
        render() {
            return `
              <path class="metal" d="M -11,-81 L -43,-81 L -47,-78.5 L -47,-73.5 L -43,-71 L -11,-71 Z" />
              <line class="trait" style="stroke-width: 1.5;" x1="-35" y1="-81" x2="-35" y2="-71" />
              <line class="trait" style="stroke-width: 1.5;" x1="-25" y1="-81" x2="-25" y2="-71" />
              <path class="metal" d="M -11,-145 L 11,-145 L 11,-128 L 8,-124 L 8,-98 L 11,-94 L 11,-58 L 6,-52 L 6,0 L -6,0 L -6,-52 L -11,-58 L -11,-94 L -8,-98 L -8,-124 L -11,-128 Z" />
              <line class="trait" x1="-11" y1="-128" x2="11" y2="-128" />
              <polyline class="trait" style="stroke-width: 1.5; stroke-dasharray: 3 2;" points="-5,-122 -1.5,-76 -5,-54" />
              <polyline class="trait" style="stroke-width: 1.5; stroke-dasharray: 3 2;" points="5,-122 1.5,-76 5,-54" />
            `;
        }
    },

    {
        id: 'tube-degagement',
        name: 'Tube à dégagement',
        category: 'separation',
        keywords: 'tube degagement gaz bulles',
        defaultProps: {},
        propSchema: [],
        getBBox() {
            return { x: -4, y: -266, width: 288, height: 266 };
        },
        getAnchors() {
            return [
                { id: 'inlet', x: 0, y: -182, type: 'probe-tip', dir: 'down', angle: 180, label: 'Entrée gaz' },
                { id: 'outlet', x: 280, y: -32, type: 'tip', dir: 'up', label: 'Sortie gaz' }
            ];
        },
        render() {
            return `
              <path class="verre-fond" d="M 4,-164 L 4,-244 Q 4,-258 18,-258 L 194,-258 Q 208,-258 208,-244 L 208,-18 Q 208,0 226,0 L 266,0 Q 284,0 284,-18 L 284,-32 L 276,-32 L 276,-18 Q 276,-8 266,-8 L 226,-8 Q 216,-8 216,-18 L 216,-244 Q 216,-266 194,-266 L 18,-266 Q -4,-266 -4,-244 L -4,-164 Z" />
              <path class="verre" style="fill:none;" d="M -4,-164 L -4,-244 Q -4,-266 18,-266 L 194,-266 Q 216,-266 216,-244 L 216,-18 Q 216,-8 226,-8 L 266,-8 Q 276,-8 276,-18 L 276,-32" />
              <path class="verre" style="fill:none;" d="M 4,-164 L 4,-244 Q 4,-258 18,-258 L 194,-258 Q 208,-258 208,-244 L 208,-18 Q 208,0 226,0 L 266,0 Q 284,0 284,-18 L 284,-32" />
            `;
        }
    },

    // ---------------------------------------------------------------------
    // 5. MESURE & ÉLECTRICITÉ
    // ---------------------------------------------------------------------
    {
        id: 'balance',
        name: 'Balance de précision',
        category: 'mesure',
        fixedUpright: true,
        keywords: 'balance masse pesee gramme ecran',
        defaultProps: { display: '0.00 g' },
        propSchema: [
            { key: 'display', label: 'Affichage écran', type: 'text', placeholder: '0.00 g' }
        ],
        getBBox() {
            return { x: -122, y: -106, width: 244, height: 106 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'surface', x: 0, y: -106, type: 'surface', dir: 'up', label: 'Plateau' }
            ];
        },
        render(p) {
            const shown = String(p.display ?? '0.00 g');
            const fontSize = shown.length <= 7 ? 24 : (shown.length <= 10 ? 20 : 17);
            const textY = shown.length <= 7 ? -40 : (shown.length <= 10 ? -41 : -42);
            return `
              <rect class="bouchon" x="-102" y="-9" width="22" height="9" rx="2" />
              <rect class="bouchon" x="80" y="-9" width="22" height="9" rx="2" />
              <path class="verre" d="M -114,-85 L 114,-85 L 122,-19 C 122,-13 117,-9 110,-9 L -110,-9 C -117,-9 -122,-13 -122,-19 Z" />
              <rect class="bouchon" x="-12" y="-98" width="24" height="13" />
              <rect class="verre" x="-74" y="-106" width="148" height="8" rx="2.5" />
              <rect class="ecran" x="-98" y="-68" width="122" height="40" rx="4" />
              <text class="texte-ecran" style="font-size:${fontSize}px;" x="18" y="${textY}">${esc(shown)}</text>
              <rect class="bouton" x="38" y="-68" width="26" height="40" rx="3" />
              <rect class="bouton" x="72" y="-68" width="26" height="40" rx="3" />
            `;
        }
    },

    {
        id: 'multimetre',
        name: 'Multimètre',
        category: 'electricite',
        keywords: 'multimetre voltmetre amperemetre ohmmetre tension courant',
        defaultProps: { selector: 'VDC', display: '1.10 V' },
        propSchema: [
            { key: 'selector', label: 'Sélecteur', type: 'select', options: [
                { value: 'VDC', label: 'Voltmètre continu (V⎓)' },
                { value: 'VAC', label: 'Voltmètre alternatif (V~)' },
                { value: 'ADC', label: 'Ampèremètre continu (A⎓)' },
                { value: 'mA', label: 'Milliampèremètre (mA)' },
                { value: 'OHM', label: 'Ohmmètre (Ω)' },
                { value: 'OFF', label: 'Éteint (OFF)' }
            ]},
            { key: 'display', label: 'Affichage écran', type: 'text', placeholder: '1.10 V' }
        ],
        getBBox() {
            return { x: -42.5, y: -170, width: 85, height: 170 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'com', x: -14.5, y: -35, type: 'elec', dir: 'down', label: 'Borne COM' },
                { id: 'pos', x: 14.5, y: -35, type: 'elec', dir: 'down', label: 'Borne V / A' }
            ];
        },
        render(p) {
            const isAmp = p.selector === 'ADC' || p.selector === 'mA';
            const angles = { VAC: -55, VDC: 0, OHM: 55, mA: -55, ADC: 0, OFF: 180 };
            const angle = angles[p.selector] ?? 0;
            const redLabel = isAmp ? (p.selector === 'mA' ? 'mA' : 'A') : 'V/Ω';
            const shownText = p.selector === 'OFF' ? '' : (p.display ?? '0.00');
            const labels = isAmp
                ? `<text style="font-family:sans-serif;font-size:9px;font-weight:bold;fill:${p.selector === 'mA' ? '#f5b025' : '#fff'};text-anchor:middle;" x="-21.5" y="-98">mA</text>
                   <text style="font-family:sans-serif;font-size:9px;font-weight:bold;fill:${p.selector === 'ADC' ? '#f5b025' : '#fff'};text-anchor:middle;" x="0" y="-109">A⎓</text>
                   <text style="font-family:sans-serif;font-size:9px;font-weight:bold;fill:#fff;text-anchor:middle;" x="21.5" y="-98">A~</text>`
                : `<text style="font-family:sans-serif;font-size:9px;font-weight:bold;fill:${p.selector === 'VAC' ? '#f5b025' : '#fff'};text-anchor:middle;" x="-21.5" y="-98">V~</text>
                   <text style="font-family:sans-serif;font-size:9px;font-weight:bold;fill:${p.selector === 'VDC' ? '#f5b025' : '#fff'};text-anchor:middle;" x="0" y="-109">V⎓</text>
                   <text style="font-family:sans-serif;font-size:9px;font-weight:bold;fill:${p.selector === 'OHM' ? '#f5b025' : '#fff'};text-anchor:middle;" x="21.5" y="-98">Ω</text>`;
            return `
              <rect class="multimetre-jaune" x="-42.5" y="-170" width="85" height="170" rx="10" />
              <rect x="-36.5" y="-164" width="73" height="158" rx="6" fill="#2d3136" stroke="#000000" stroke-width="2" />
              <rect class="ecran" x="-30.5" y="-156" width="61" height="32" rx="3" />
              <text class="texte-ecran" style="font-size: 14px;" x="24" y="-134">${esc(shownText)}</text>
              <g transform="translate(0, -85)">
                <circle cx="0" cy="0" r="15" fill="#181a1c" stroke="#000000" stroke-width="2" />
                <circle cx="0" cy="0" r="11" fill="#40454a" stroke="#000000" stroke-width="1.5" />
                <line x1="0" y1="0" x2="0" y2="-13" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" transform="rotate(${angle})" />
              </g>
              ${labels}
              <text style="font-family:sans-serif;font-size:8px;font-weight:bold;fill:${p.selector === 'OFF' ? '#ff4d4d' : '#bbb'};text-anchor:middle;" x="0" y="-59">OFF</text>
              <circle cx="-14.5" cy="-35" r="8" fill="#181a1c" stroke="#000000" stroke-width="2" />
              <circle cx="-14.5" cy="-35" r="4.5" fill="#333333" stroke="#000000" stroke-width="1.5" />
              <circle cx="-14.5" cy="-35" r="2" fill="#000000" />
              <text class="texte-multimetre" style="font-size: 9px; fill: #ffffff;" x="-14.5" y="-18">COM</text>
              <circle cx="14.5" cy="-35" r="8" fill="#e06358" stroke="#000000" stroke-width="2" />
              <circle cx="14.5" cy="-35" r="4.5" fill="#f28b82" stroke="#000000" stroke-width="1.5" />
              <circle cx="14.5" cy="-35" r="2" fill="#000000" />
              <text class="texte-multimetre" style="font-size: 9px; fill: #e06358;" x="14.5" y="-18">${redLabel}</text>
            `;
        }
    },

    {
        id: 'generateur',
        name: 'Générateur de tension',
        category: 'electricite',
        fixedUpright: true,
        keywords: 'generateur alimentation tension continu alternatif dc ac pile courant',
        defaultProps: { currentType: 'DC', selector: '6V', display: '6.0 V', on: true },
        propSchema: [
            { key: 'currentType', label: 'Type de courant', type: 'select', options: [
                { value: 'DC', label: 'Continu (DC ⎓)' },
                { value: 'AC', label: 'Alternatif (AC ~)' }
            ]},
            { key: 'on', label: 'Interrupteur ON/OFF', type: 'toggle' },
            { key: 'selector', label: 'Sélecteur tension', type: 'select', options: [
                { value: '3V', label: '3 V' },
                { value: '6V', label: '6 V' },
                { value: '9V', label: '9 V' },
                { value: '12V', label: '12 V' },
                { value: 'VAR', label: 'Réglable' }
            ]},
            { key: 'display', label: 'Affichage écran', type: 'text', placeholder: '6.0 V' }
        ],
        getBBox() {
            return { x: -85, y: -120, width: 170, height: 120 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'pos', x: -34, y: -32, type: 'elec', dir: 'down', label: 'Borne + / ~' },
                { id: 'neg', x: 4, y: -32, type: 'elec', dir: 'down', label: 'Borne − / ~' }
            ];
        },
        render(p) {
            const isAC = p.currentType === 'AC';
            const angles = { '3V': -70, '6V': -25, '9V': 25, '12V': 70, 'VAR': 120 };
            const angle = angles[p.selector] ?? 0;
            const ledColor = p.on ? '#4ecdc4' : '#cccccc';
            const txt = String(p.on ? (p.display ?? '6.0 V') : 'OFF');
            const fontSize = txt.length <= 6 ? 22 : (txt.length <= 8 ? 18 : 15);
            const textY = txt.length <= 6 ? -80 : -82;
            const terminalsSvg = isAC
                ? `
                  <circle cx="-34" cy="-32" r="8" fill="#f5b025" stroke="#000000" stroke-width="2" />
                  <circle cx="-34" cy="-32" r="3" fill="#000000" />
                  <text style="font-family:sans-serif;font-size:20px;font-weight:bold;fill:#1e293b;text-anchor:middle;" x="-15" y="-25">~</text>
                  <circle cx="4" cy="-32" r="8" fill="#f5b025" stroke="#000000" stroke-width="2" />
                  <circle cx="4" cy="-32" r="3" fill="#000000" />
                `
                : `
                  <text style="font-family:sans-serif;font-size:20px;font-weight:bold;fill:#e03131;text-anchor:middle;" x="-54" y="-25">+</text>
                  <circle cx="-34" cy="-32" r="8" fill="#e06358" stroke="#000000" stroke-width="2" />
                  <circle cx="-34" cy="-32" r="3" fill="#000000" />
                  <text style="font-family:sans-serif;font-size:20px;font-weight:bold;fill:#000000;text-anchor:middle;" x="-15" y="-25">−</text>
                  <circle cx="4" cy="-32" r="8" fill="#181a1c" stroke="#000000" stroke-width="2" />
                  <circle cx="4" cy="-32" r="3" fill="#000000" />
                `;
            return `
              <rect class="bouchon" x="-72" y="-8" width="18" height="8" rx="2" />
              <rect class="bouchon" x="54" y="-8" width="18" height="8" rx="2" />
              <rect class="verre" x="-85" y="-120" width="170" height="112" rx="8" />
              <rect x="-78" y="-113" width="156" height="98" rx="4" fill="#f1f3f5" stroke="#000000" stroke-width="1.5" />
              <rect class="ecran" x="-70" y="-106" width="96" height="36" rx="3" />
              <text class="texte-ecran" style="font-size:${fontSize}px;" x="20" y="${textY}">${esc(txt)}</text>
              <circle cx="62" cy="-96" r="5" fill="${ledColor}" stroke="#000000" stroke-width="2" />
              <text style="font-family:sans-serif;font-size:11.5px;font-weight:bold;fill:#1e293b;text-anchor:middle;" x="-26" y="-54">GÉNÉRATEUR ${isAC ? 'AC' : 'DC'}</text>
              <g transform="translate(53, -44)">
                <circle class="bouton" cx="0" cy="0" r="16" />
                <line class="trait" x1="0" y1="0" x2="0" y2="-13" transform="rotate(${angle})" />
              </g>
              ${terminalsSvg}
            `;
        }
    },

    {
        id: 'appareil-mesure',
        name: 'pH-mètre / Conductimètre',
        category: 'mesure',
        fixedUpright: true,
        keywords: 'ph metre conductimetre boitier mesure sonde',
        defaultProps: { mode: 'pH', display: '7.00' },
        propSchema: [
            { key: 'mode', label: 'Type d\'appareil', type: 'select', options: [
                { value: 'pH', label: 'pH-mètre' },
                { value: 'σ', label: 'Conductimètre' },
                { value: 'O₂', label: 'Oxymètre' },
                { value: '', label: 'Universel (sans titre)' }
            ]},
            { key: 'display', label: 'Valeur affichée', type: 'text', placeholder: '7.00' }
        ],
        getBBox() {
            return { x: -75, y: -162, width: 150, height: 162 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'probe', x: 0, y: -162, type: 'elec', dir: 'up', label: 'Connecteur sonde' }
            ];
        },
        render(p) {
            const labels = {
                pH: 'pH-mètre',
                'σ': 'Conductimètre',
                'O₂': 'Oxymètre'
            };
            const defaultDisplays = {
                pH: '7.00',
                'σ': '125 µS/cm',
                'O₂': '8.5 mg/L',
                '': '0.00'
            };
            const titleText = labels[p.mode] ?? (p.mode || '');
            const title = titleText
                ? `<text style="font-family:sans-serif;font-size:15px;font-weight:bold;fill:#1e293b;text-anchor:middle;" x="0" y="-66">${esc(titleText)}</text>`
                : '';
            const shown = String(p.display ?? defaultDisplays[p.mode] ?? '7.00');
            const fontSize = shown.length <= 6 ? 26 : (shown.length <= 9 ? 21 : 18.5);
            const textY = shown.length <= 6 ? -100 : (shown.length <= 9 ? -102 : -103);
            return `
              <rect class="bouchon" x="-65" y="-8" width="18" height="8" rx="2" />
              <rect class="bouchon" x="47" y="-8" width="18" height="8" rx="2" />
              <rect class="verre" x="-75" y="-148" width="150" height="140" rx="10" />
              <rect class="bouchon" x="-7" y="-162" width="14" height="14" rx="2" />
              <rect class="ecran" x="-64" y="-132" width="128" height="46" rx="4" />
              <text class="texte-ecran" style="font-size:${fontSize}px;" x="58" y="${textY}">${esc(shown)}</text>
              ${title}
              <circle class="bouton" cx="-29" cy="-40" r="11" />
              <circle class="bouton" cx="29" cy="-40" r="11" />
            `;
        }
    },

    {
        id: 'sonde',
        name: 'Sonde de mesure',
        category: 'mesure',
        keywords: 'sonde ph conductimetrie cellule electrode',
        defaultProps: { variant: 'ph' },
        propSchema: [
            { key: 'variant', label: 'Type de sonde', type: 'select', options: [
                { value: 'ph', label: 'Sonde pH-métrique' },
                { value: 'conductimetrie', label: 'Cellule conductimétrique' }
            ]}
        ],
        getBBox() {
            return { x: -10, y: -188, width: 20, height: 188 };
        },
        getAnchors() {
            return [
                { id: 'tip', x: 0, y: -50, type: 'probe-tip', dir: 'down', angle: 180, label: 'Passage sonde' },
                { id: 'clamp-target', x: 0, y: -100, type: 'clamp-target', dir: 'any', angle: 0, label: 'Corps (pince)' },
                { id: 'cable', x: 0, y: -188, type: 'elec', dir: 'up', label: 'Câble' }
            ];
        },
        render(p) {
            if (p.variant === 'conductimetrie') {
                return `
                  <rect class="bouchon" x="-5" y="-188" width="10" height="10" rx="1.5" />
                  <rect class="bouchon" x="-9" y="-178" width="18" height="22" rx="2" />
                  <rect class="verre" x="-6" y="-156" width="12" height="128" />
                  <rect class="metal" x="-7" y="-28" width="4" height="28" />
                  <rect class="metal" x="3" y="-28" width="4" height="28" />
                `;
            }
            return `
              <rect class="bouchon" x="-5" y="-188" width="10" height="10" rx="1.5" />
              <rect class="bouchon" x="-9" y="-178" width="18" height="22" rx="2" />
              <rect class="verre" x="-7" y="-156" width="14" height="146" />
              <circle class="verre" cx="0" cy="-6" r="6" />
            `;
        }
    },

    {
        id: 'thermometre',
        name: 'Thermomètre',
        category: 'mesure',
        keywords: 'thermometre temperature alcool numerique celsius',
        defaultProps: { variant: 'alcool', temperature: 25 },
        propSchema: [
            { key: 'variant', label: 'Type', type: 'select', options: [
                { value: 'alcool', label: 'Thermomètre à alcool' },
                { value: 'numerique', label: 'Thermomètre numérique' }
            ]},
            { key: 'temperature', label: 'Température', type: 'range', min: -10, max: 120, step: 1, unit: '°C' }
        ],
        getBBox(p) {
            if (p.variant === 'numerique') return { x: -36, y: -297, width: 72, height: 297 };
            return { x: -8, y: -251, width: 16, height: 251 };
        },
        getAnchors() {
            return [
                { id: 'tip', x: 0, y: -70, type: 'probe-tip', dir: 'down', angle: 180, label: 'Tige / Bulbe' },
                { id: 'clamp-target', x: 0, y: -150, type: 'clamp-target', dir: 'any', angle: 0, label: 'Tige' }
            ];
        },
        render(p) {
            const temp = Number(p.temperature ?? 25);
            if (p.variant === 'numerique') {
                return `
                  <rect class="metal" x="-4" y="-245" width="8" height="245" rx="4" />
                  <rect class="verre" x="-36" y="-297" width="72" height="52" rx="6" />
                  <rect class="ecran" x="-28" y="-289" width="56" height="26" rx="3" />
                  <text class="texte-ecran" style="font-size: 13px;" x="23" y="-271">${esc(temp.toFixed(1))}°C</text>
                  <circle class="bouton" cx="0" cy="-255" r="4" />
                `;
            }
            // Colonne rouge proportionnelle à la température (-10..120 -> y=-45..-235)
            const frac = Math.max(0, Math.min(1, (temp + 10) / 130));
            const topY = -45 - frac * 185;
            const colH = -12 - topY;
            return `
              <rect class="verre" x="-4" y="-251" width="8" height="245" rx="4" />
              <circle cx="0" cy="-8" r="6" fill="#e06358" stroke="#000000" stroke-width="2" />
              <rect x="-1.5" y="${topY.toFixed(1)}" width="3" height="${colH.toFixed(1)}" fill="#e06358" />
              ${[-221, -201, -181, -161, -141, -121].map(y => `<line class="trait" style="stroke-width: 1.5;" x1="0" y1="${y}" x2="4" y2="${y}" />`).join('')}
            `;
        }
    },

    {
        id: 'chronometre',
        name: 'Chronomètre',
        category: 'mesure',
        keywords: 'chronometre temps cinetique seconde',
        defaultProps: { display: '00:00.0' },
        propSchema: [
            { key: 'display', label: 'Affichage temps', type: 'text', placeholder: '00:00.0' }
        ],
        getBBox() {
            return { x: -38, y: -78, width: 76, height: 78 };
        },
        getAnchors() {
            return [{ id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' }];
        },
        render(p) {
            return `
              <g transform="translate(-28, -65) rotate(-42)">
                <rect x="-8" y="-4.5" width="16" height="6.5" rx="1.5" fill="#333333" stroke="#000000" stroke-width="2" stroke-linejoin="round" />
              </g>
              <g transform="translate(28, -65) rotate(42)">
                <rect x="-8" y="-4.5" width="16" height="6.5" rx="1.5" fill="#333333" stroke="#000000" stroke-width="2" stroke-linejoin="round" />
              </g>
              <rect x="-4" y="-78" width="8" height="6" rx="1.5" fill="#333333" stroke="#000000" stroke-width="2" />
              <path d="M -9,-72 L 9,-72 L 18,-67 L 25,-73 L 36,-63 L 30,-56 A 33,33 0 0,1 8,-6 L 7,0 L -7,0 L -8,-6 A 33,33 0 0,1 -30,-56 L -36,-63 L -25,-73 L -18,-67 Z" fill="#f2d638" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" />
              <rect x="-24" y="-61" width="48" height="36" rx="8" fill="#222222" stroke="#000000" stroke-width="2" />
              <rect class="ecran" x="-19" y="-54" width="38" height="20" rx="2" />
              <text class="texte-ecran" style="font-size: 8.5px;" x="17" y="-40.5">${esc(p.display ?? '00:00.0')}</text>
              <path d="M -16,-20 Q 0,-23 16,-20 L 13,-14 Q 0,-11 -13,-14 Z" fill="#444444" stroke="#000000" stroke-width="1.5" stroke-linejoin="round" />
            `;
        }
    },

    {
        id: 'electrolyseur',
        name: 'Électrolyseur',
        category: 'electricite',
        keywords: 'electrolyseur electrolyse cuve electrodes gaz',
        defaultProps: { liquidLevel: 60, liquidColor: '#9ad1f5', bubbles: false },
        propSchema: [
            ...LIQUID_PROPS_SCHEMA,
            { key: 'bubbles', label: 'Dégagement gazeux (bulles)', type: 'toggle' }
        ],
        getBBox() {
            return { x: -78, y: -180, width: 156, height: 180 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base' },
                { id: 'elec-left', x: -64, y: -44, type: 'elec', dir: 'left', label: 'Borne rouge' },
                { id: 'elec-right', x: 64, y: -44, type: 'elec', dir: 'right', label: 'Borne noire' },
                { id: 'electrode-left', x: -20, y: -90, type: 'neck-bottom', dir: 'up', angle: 0, label: 'Électrode gauche' },
                { id: 'electrode-right', x: 20, y: -90, type: 'neck-bottom', dir: 'up', angle: 0, label: 'Électrode droite' }
            ];
        },
        render(p, uid, ctx = {}) {
            const clip = 'M -78,-180 L 78,-180 L 52,-70 L -52,-70 Z';
            const bubblesSvg = p.bubbles ? `
              <circle cx="-20" cy="-126" r="2.5" fill="#fff" stroke="#333" stroke-width="1" />
              <circle cx="-16" cy="-136" r="2" fill="#fff" stroke="#333" stroke-width="1" />
              <circle cx="-22" cy="-146" r="3" fill="#fff" stroke="#333" stroke-width="1" />
              <circle cx="20" cy="-128" r="2" fill="#fff" stroke="#333" stroke-width="1" />
              <circle cx="24" cy="-139" r="2.5" fill="#fff" stroke="#333" stroke-width="1" />
            ` : '';
            return `
              <rect x="-65" y="-18" width="130" height="18" rx="3" fill="#333333" stroke="#000000" stroke-width="3" stroke-linejoin="round" />
              <rect x="-45" y="-70" width="90" height="52" fill="#a0a8b0" stroke="#000000" stroke-width="2.5" />
              <line class="trait" style="stroke-width: 3;" x1="-64" y1="-44" x2="-45" y2="-44" />
              <rect x="-59" y="-51" width="14" height="14" rx="2" fill="#e06358" stroke="#000000" stroke-width="2" />
              <line class="trait" style="stroke-width: 3;" x1="45" y1="-44" x2="64" y2="-44" />
              <rect x="45" y="-51" width="14" height="14" rx="2" fill="#333333" stroke="#000000" stroke-width="2" />
              <polygon class="verre-fond" points="-78,-180 78,-180 52,-70 -52,-70" />
              ${renderClippedLiquid(uid, clip, -172, -71.5, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 70, rimPoints: [[-78, -180], [78, -180]], fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" style="fill:none;" d="M -78,-180 L -52,-70 L 52,-70 L 78,-180" />
              <rect x="-23" y="-120" width="6" height="88" rx="1.5" fill="#44494d" stroke="#000000" stroke-width="2" />
              <rect x="17" y="-120" width="6" height="88" rx="1.5" fill="#44494d" stroke="#000000" stroke-width="2" />
              ${bubblesSvg}
            `;
        }
    },

    {
        id: 'tube-en-u',
        name: 'Tube en U',
        category: 'electricite',
        keywords: 'tube u electrolyse pile',
        defaultProps: { liquidLevel: 65, liquidColor: '#9ad1f5' },
        propSchema: [...LIQUID_PROPS_SCHEMA],
        getBBox() {
            return { x: -60, y: -200, width: 120, height: 200 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Pied' },
                { id: 'left-top', x: -45, y: -200, type: 'neck-top', dir: 'up', label: 'Branche gauche' },
                { id: 'right-top', x: 45, y: -200, type: 'neck-top', dir: 'up', label: 'Branche droite' }
            ];
        },
        render(p, uid, ctx = {}) {
            const bg = 'M -58,-200 L -58,-80 A 58,58 0 0,0 58,-80 L 58,-200 L 32,-200 L 32,-80 A 32,32 0 0,1 -32,-80 L -32,-200 Z';
            return `
              <path class="verre-fond" d="M -48,0 L 48,0 L 48,-8 L 8,-8 L 8,-22 L -8,-22 L -8,-8 L -48,-8 Z" />
              <path class="verre" style="fill:none;" d="M -48,0 L 48,0 L 48,-8 L 8,-8 L 8,-22" />
              <path class="verre" style="fill:none;" d="M -48,0 L -48,-8 L -8,-8 L -8,-22" />
              <line class="verre" style="stroke-width:2.5;" x1="-8" y1="-22" x2="8" y2="-22" />
              <path class="verre-fond" d="${bg}" />
              ${renderClippedLiquid(uid, bg, -195, -22, p.liquidLevel, p.liquidColor, ctx, { halfWidth: 56, rimPoints: [[-58, -200], [58, -200]], fillToRim: Boolean(p.fillToRim) })}
              <path class="verre" style="fill:none;" d="M -58,-200 L -58,-80 A 58,58 0 0,0 58,-80 L 58,-200" />
              <path class="verre" style="fill:none;" d="M -32,-200 L -32,-80 A 32,32 0 0,0 32,-80 L 32,-200" />
              <line class="verre" style="stroke-width:2.5;" x1="-60" y1="-200" x2="-30" y2="-200" />
              <line class="verre" style="stroke-width:2.5;" x1="30" y1="-200" x2="60" y2="-200" />
            `;
        }
    },

    {
        id: 'pont-salin',
        name: 'Pont salin',
        category: 'electricite',
        keywords: 'pont salin pile electrochimie daniell',
        defaultProps: { gelColor: '#9ad1f5' },
        propSchema: [
            { key: 'gelColor', label: 'Couleur gel', type: 'color', presets: LIQUID_PRESETS }
        ],
        getBBox() {
            return { x: -61, y: -125, width: 122, height: 125 };
        },
        getAnchors() {
            return [
                { id: 'left-foot', x: -54, y: 0, type: 'tip', dir: 'down', label: 'Branche gauche' },
                { id: 'right-foot', x: 54, y: 0, type: 'tip', dir: 'down', label: 'Branche droite' }
            ];
        },
        render(p) {
            return `
              <path class="verre-fond" d="M -61,0 L -61,-103 A 22,22 0 0 1 -39,-125 L 39,-125 A 22,22 0 0 1 61,-103 L 61,0 L 47,0 L 47,-103 A 8,8 0 0 0 39,-111 L -39,-111 A 8,8 0 0 0 -47,-103 L -47,0 Z" />
              <path fill="${esc(p.gelColor || '#9ad1f5')}" d="M -59.5,-14 L -59.5,-103 A 20.5,20.5 0 0 1 -39,-123.5 L 39,-123.5 A 20.5,20.5 0 0 1 59.5,-103 L 59.5,-14 L 48.5,-14 L 48.5,-103 A 9.5,9.5 0 0 0 39,-112.5 L -39,-112.5 A 9.5,9.5 0 0 0 -48.5,-103 L -48.5,-14 Z" />
              <rect x="-61" y="-14" width="14" height="14" rx="2" fill="#dce3ea" stroke="#000000" stroke-width="2" />
              <rect x="47" y="-14" width="14" height="14" rx="2" fill="#dce3ea" stroke="#000000" stroke-width="2" />
              <path class="verre" style="fill:none;" d="M -61,0 L -61,-103 A 22,22 0 0 1 -39,-125 L 39,-125 A 22,22 0 0 1 61,-103 L 61,0" />
              <path class="verre" style="fill:none;" d="M -47,0 L -47,-103 A 8,8 0 0 1 -39,-111 L 39,-111 A 8,8 0 0 1 47,-103 L 47,0" />
            `;
        }
    },

    {
        id: 'electrode',
        name: 'Lame métallique',
        category: 'electricite',
        keywords: 'lame electrode cuivre zinc fer argent graphite pile',
        defaultProps: { metal: 'Cu' },
        propSchema: [
            { key: 'metal', label: 'Métal', type: 'select', options: [
                { value: 'Cu', label: 'Cuivre (Cu)' },
                { value: 'Zn', label: 'Zinc (Zn)' },
                { value: 'Fe', label: 'Fer (Fe)' },
                { value: 'Al', label: 'Aluminium (Al)' },
                { value: 'Ag', label: 'Argent (Ag)' },
                { value: 'C', label: 'Graphite (C)' }
            ]}
        ],
        getBBox() {
            return { x: -14, y: -135, width: 28, height: 135 };
        },
        getAnchors() {
            return [
                { id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Bas' },
                { id: 'elec', x: 0, y: -118, type: 'elec', dir: 'up', label: 'Connexion pince' }
            ];
        },
        render(p) {
            const colors = { Cu: '#c87a52', Zn: '#94a0aa', Fe: '#7c848c', Al: '#d0d5db', Ag: '#e2e6ea', C: '#495057' };
            const textColor = p.metal === 'C' ? '#ffffff' : '#000000';
            return `
              <rect x="-14" y="-135" width="28" height="135" rx="3" fill="${colors[p.metal] || '#c87a52'}" stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="0" cy="-118" r="4" fill="#ffffff" stroke="#000000" stroke-width="2" />
              <text class="texte-metal" style="fill:${textColor}" x="0" y="-55">${esc(p.metal || 'Cu')}</text>
            `;
        }
    },

    // ---------------------------------------------------------------------
    // 6. EFFETS (ÉCOULEMENTS, GOUTTES, BULLES, VAPEUR, PRÉCIPITÉ)
    // ---------------------------------------------------------------------
    {
        id: 'ecoulement',
        name: 'Filet de liquide',
        category: 'effets',
        keywords: 'ecoulement filet jet liquide verser transvasement eau',
        defaultProps: { length: 120, width: 6, curve: 0, color: '#9ad1f5' },
        propSchema: [
            { key: 'length', label: 'Longueur', type: 'range', min: 25, max: 320, step: 5, unit: 'mm' },
            { key: 'width', label: 'Épaisseur', type: 'range', min: 2, max: 16, step: 1, unit: 'mm' },
            { key: 'curve', label: 'Courbure (jet)', type: 'range', min: -120, max: 120, step: 5, unit: 'mm' },
            { key: 'color', label: 'Couleur', type: 'color', presets: LIQUID_PRESETS }
        ],
        getBBox(p) {
            const len = Math.max(25, Number(p.length) || 120);
            const w = Math.max(2, Number(p.width) || 6);
            const c = Number(p.curve) || 0;
            const minX = Math.min(0, c) - w;
            const maxX = Math.max(0, c) + w;
            return { x: minX, y: -w / 2, width: Math.max(12, maxX - minX), height: len + w };
        },
        getAnchors() {
            return [{ id: 'origin', x: 0, y: 0, type: 'tip', dir: 'up', label: 'Origine filet' }];
        },
        render(p) {
            const len = Math.max(25, Number(p.length) || 120);
            const w = Math.max(2, Number(p.width) || 6);
            const c = Number(p.curve) || 0;
            const col = esc(p.color || '#9ad1f5');
            const pathD = Math.abs(c) < 1
                ? `M 0,0 L 0,${len}`
                : `M 0,0 Q ${c},0 ${c},${len}`;
            return `
              <path d="${pathD}" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="${(w + 1.8).toFixed(1)}" stroke-linecap="round" />
              <path d="${pathD}" fill="none" stroke="${col}" stroke-width="${w.toFixed(1)}" stroke-linecap="round" opacity="0.92" />
              <path d="${pathD}" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="${Math.max(1, w * 0.28).toFixed(1)}" stroke-linecap="round" />
            `;
        }
    },

    {
        id: 'gouttes',
        name: 'Gouttes',
        category: 'effets',
        keywords: 'goutte gouttes goutte-a-goutte titrage burette pipette liquide',
        defaultProps: { count: 3, spacing: 26, size: 1, color: '#9ad1f5' },
        propSchema: [
            { key: 'count', label: 'Nombre de gouttes', type: 'range', min: 1, max: 5, step: 1 },
            { key: 'spacing', label: 'Espacement', type: 'range', min: 14, max: 50, step: 2, unit: 'mm' },
            { key: 'size', label: 'Taille', type: 'range', min: 0.6, max: 1.8, step: 0.1 },
            { key: 'color', label: 'Couleur', type: 'color', presets: LIQUID_PRESETS }
        ],
        getBBox(p) {
            const count = Math.max(1, Math.min(5, Math.round(Number(p.count) || 3)));
            const spacing = Math.max(14, Number(p.spacing) || 26);
            const sz = Math.max(0.6, Number(p.size) || 1);
            const r = 6 * sz;
            const totalH = (count - 1) * spacing + 2.4 * r + 4;
            return { x: -r - 2, y: -2, width: (r + 2) * 2, height: totalH };
        },
        getAnchors() {
            return [{ id: 'origin', x: 0, y: 0, type: 'tip', dir: 'up', label: 'Origine gouttes' }];
        },
        render(p) {
            const count = Math.max(1, Math.min(5, Math.round(Number(p.count) || 3)));
            const spacing = Math.max(14, Number(p.spacing) || 26);
            const sz = Math.max(0.6, Number(p.size) || 1);
            const r = 5.5 * sz;
            const col = esc(p.color || '#9ad1f5');
            let svg = '';
            for (let i = 0; i < count; i++) {
                const y = i * spacing;
                const yMid = y + r * 1.45;
                const yBot = y + r * 2.3;
                svg += `
                  <path d="M 0,${y.toFixed(1)} C ${(-r).toFixed(1)},${yMid.toFixed(1)} ${(-r).toFixed(1)},${yBot.toFixed(1)} 0,${yBot.toFixed(1)} C ${r.toFixed(1)},${yBot.toFixed(1)} ${r.toFixed(1)},${yMid.toFixed(1)} 0,${y.toFixed(1)} Z"
                        fill="${col}" stroke="rgba(0,0,0,0.45)" stroke-width="1.3" stroke-linejoin="round" />
                  <circle cx="${(-r * 0.28).toFixed(1)}" cy="${(y + r * 1.45).toFixed(1)}" r="${Math.max(1, r * 0.22).toFixed(1)}" fill="rgba(255,255,255,0.7)" />
                `;
            }
            return svg;
        }
    },

    {
        id: 'bulles',
        name: 'Bulles / Effervescence',
        category: 'effets',
        keywords: 'bulles effervescence gaz ebullition degagement reaction',
        defaultProps: { count: 8, spread: 38, height: 75, color: '#ffffff' },
        propSchema: [
            { key: 'count', label: 'Nombre de bulles', type: 'range', min: 3, max: 15, step: 1 },
            { key: 'spread', label: 'Largeur', type: 'range', min: 14, max: 90, step: 2, unit: 'mm' },
            { key: 'height', label: 'Hauteur', type: 'range', min: 25, max: 150, step: 5, unit: 'mm' },
            { key: 'color', label: 'Couleur', type: 'color', presets: [
                { label: 'Blanc (air / gaz)', color: '#ffffff' },
                { label: 'Bleu pâle', color: '#dbeafe' },
                { label: 'Vert pâle', color: '#d1fae5' },
                { label: 'Jaune pâle', color: '#fef3c7' }
            ]}
        ],
        getBBox(p) {
            const spread = Math.max(14, Number(p.spread) || 38);
            const h = Math.max(25, Number(p.height) || 75);
            return { x: -spread / 2 - 6, y: -h - 6, width: spread + 12, height: h + 12 };
        },
        getAnchors() {
            return [{ id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Origine bulles' }];
        },
        render(p) {
            const count = Math.max(3, Math.min(15, Math.round(Number(p.count) || 8)));
            const spread = Math.max(14, Number(p.spread) || 38);
            const h = Math.max(25, Number(p.height) || 75);
            const col = esc(p.color || '#ffffff');
            // Distribution déterministe (nombre d'or) pour un rendu naturel et reproductible
            let svg = '';
            for (let i = 0; i < count; i++) {
                const t = (i + 0.5) / count;
                const phase = ((i * 0.6180339887) % 1) - 0.5;
                const cx = phase * spread;
                const cy = -t * h;
                const r = 2.0 + t * 2.6 + ((i % 3) * 0.45);
                svg += `
                  <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${col}" fill-opacity="0.88" stroke="#334155" stroke-width="1.3" />
                  <circle cx="${(cx - r * 0.3).toFixed(1)}" cy="${(cy - r * 0.3).toFixed(1)}" r="${Math.max(0.7, r * 0.25).toFixed(1)}" fill="#ffffff" />
                `;
            }
            return svg;
        }
    },

    {
        id: 'vapeur',
        name: 'Vapeur / Fumée',
        category: 'effets',
        keywords: 'vapeur fumee gaz chauffage evaporation ebullition',
        defaultProps: { waves: 3, height: 70, width: 46, color: '#94a3b8' },
        propSchema: [
            { key: 'waves', label: 'Nombre de volutes', type: 'range', min: 1, max: 5, step: 1 },
            { key: 'height', label: 'Hauteur', type: 'range', min: 30, max: 130, step: 5, unit: 'mm' },
            { key: 'width', label: 'Largeur', type: 'range', min: 18, max: 100, step: 4, unit: 'mm' },
            { key: 'color', label: 'Couleur', type: 'color', presets: [
                { label: 'Vapeur d’eau', color: '#94a3b8' },
                { label: 'Vapeurs rousses (NO₂)', color: '#c96a2b' },
                { label: 'Vapeurs violettes (I₂)', color: '#9b5de5' },
                { label: 'Dichlore (Cl₂)', color: '#c9b428' }
            ]}
        ],
        getBBox(p) {
            const w = Math.max(18, Number(p.width) || 46);
            const h = Math.max(30, Number(p.height) || 70);
            return { x: -w / 2 - 8, y: -h - 4, width: w + 16, height: h + 8 };
        },
        getAnchors() {
            return [{ id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base vapeur' }];
        },
        render(p) {
            const waves = Math.max(1, Math.min(5, Math.round(Number(p.waves) || 3)));
            const h = Math.max(30, Number(p.height) || 70);
            const w = Math.max(18, Number(p.width) || 46);
            const col = esc(p.color || '#94a3b8');
            const amp = Math.min(8, Math.max(4, w / (waves * 2.5)));
            let svg = '';
            for (let i = 0; i < waves; i++) {
                const x0 = waves === 1 ? 0 : (-w / 2 + (i / (waves - 1)) * w);
                const hWave = h * (0.85 + 0.15 * ((i + 1) % 2));
                const d = `M ${x0.toFixed(1)},0 C ${(x0 - amp).toFixed(1)},${(-hWave * 0.28).toFixed(1)} ${(x0 + amp).toFixed(1)},${(-hWave * 0.55).toFixed(1)} ${x0.toFixed(1)},${(-hWave * 0.72).toFixed(1)} S ${(x0 + amp).toFixed(1)},${(-hWave * 0.92).toFixed(1)} ${x0.toFixed(1)},${(-hWave).toFixed(1)}`;
                svg += `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round" opacity="0.78" />`;
            }
            return svg;
        }
    },

    {
        id: 'precipite',
        name: 'Précipité / Dépôt',
        category: 'effets',
        keywords: 'precipite depot solide fond ions reaction trouble',
        defaultProps: { width: 54, height: 18, color: '#3b9eff' },
        propSchema: [
            { key: 'width', label: 'Largeur', type: 'range', min: 18, max: 120, step: 2, unit: 'mm' },
            { key: 'height', label: 'Épaisseur', type: 'range', min: 8, max: 40, step: 2, unit: 'mm' },
            { key: 'color', label: 'Couleur', type: 'color', presets: [
                { label: 'Bleu (Cu(OH)₂)', color: '#3b9eff' },
                { label: 'Rouille (Fe(OH)₃)', color: '#c85a2a' },
                { label: 'Vert (Fe(OH)₂)', color: '#4ecdc4' },
                { label: 'Blanc (AgCl / Zn(OH)₂)', color: '#e2e8f0' },
                { label: 'Jaune (PbI₂)', color: '#f4d35e' }
            ]}
        ],
        getBBox(p) {
            const w = Math.max(18, Number(p.width) || 54);
            const h = Math.max(8, Number(p.height) || 18);
            return { x: -w / 2 - 2, y: -h - 4, width: w + 4, height: h + 6 };
        },
        getAnchors() {
            return [{ id: 'base', x: 0, y: 0, type: 'base', dir: 'down', label: 'Base dépôt' }];
        },
        render(p) {
            const w = Math.max(18, Number(p.width) || 54);
            const h = Math.max(8, Number(p.height) || 18);
            const hw = w / 2;
            const col = esc(p.color || '#3b9eff');
            const mound = `M ${(-hw).toFixed(1)},0 C ${(-hw * 0.92).toFixed(1)},${(-h * 0.65).toFixed(1)} ${(-hw * 0.55).toFixed(1)},${(-h * 0.95).toFixed(1)} ${(-hw * 0.25).toFixed(1)},${(-h * 0.78).toFixed(1)} C ${(-hw * 0.05).toFixed(1)},${(-h * 1.1).toFixed(1)} ${(hw * 0.22).toFixed(1)},${(-h * 1.05).toFixed(1)} ${(hw * 0.35).toFixed(1)},${(-h * 0.78).toFixed(1)} C ${(hw * 0.62).toFixed(1)},${(-h * 0.92).toFixed(1)} ${(hw * 0.92).toFixed(1)},${(-h * 0.6).toFixed(1)} ${hw.toFixed(1)},0 Z`;
            // Quelques grains en suspension juste au-dessus du dépôt
            const grains = [-0.62, -0.3, 0.05, 0.38, 0.64].map((f, i) => {
                const gx = f * hw;
                const gy = -h * (0.45 + 0.35 * ((i + 1) % 3) / 2) - 2;
                const gr = 1.4 + (i % 2) * 0.7;
                return `<circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${gr.toFixed(1)}" fill="${col}" stroke="rgba(0,0,0,0.35)" stroke-width="0.8" />`;
            }).join('');
            return `
              <path d="${mound}" fill="${col}" stroke="rgba(0,0,0,0.4)" stroke-width="1.4" stroke-linejoin="round" />
              ${grains}
            `;
        }
    },

    // ---------------------------------------------------------------------
    // 8. FORMES GÉOMÉTRIQUES & FLÈCHES
    // ---------------------------------------------------------------------
    {
        id: 'forme-fleche',
        name: 'Flèche / Vecteur',
        category: 'formes',
        keywords: 'fleche vecteur rayon force vitesse sens etape reaction avant apres',
        defaultProps: {
            length: 120,
            strokeWidth: 3,
            strokeColor: '#1e293b',
            dashed: false,
            doubleHead: false,
            headStyle: 'triangle'
        },
        propSchema: [
            { key: 'length', label: 'Longueur', type: 'range', min: 40, max: 400, step: 5, unit: 'px' },
            { key: 'strokeWidth', label: 'Épaisseur', type: 'range', min: 1.5, max: 8, step: 0.5, unit: 'px' },
            { key: 'strokeColor', label: 'Couleur', type: 'color', presets: SHAPE_STROKE_PRESETS },
            { key: 'headStyle', label: 'Pointe', type: 'select', options: [
                { value: 'triangle', label: 'Triangle plein' },
                { value: 'open', label: 'Chevron ouvert' }
            ]},
            { key: 'doubleHead', label: 'Double flèche', type: 'toggle' },
            { key: 'dashed', label: 'Pointillés', type: 'toggle' }
        ],
        getBBox(p) {
            const len = Math.max(40, Number(p.length) || 120);
            const hw = len / 2;
            const headH = Math.max(10, (Number(p.strokeWidth) || 3) * 3.2);
            return { x: -hw - 4, y: -headH, width: len + 8, height: headH * 2 };
        },
        getAnchors() {
            return [];
        },
        render(p) {
            const len = Math.max(40, Number(p.length) || 120);
            const sw = Number(p.strokeWidth) || 3;
            const col = esc(p.strokeColor || '#1e293b');
            const hw = len / 2;
            const hl = Math.max(10, sw * 3.8);
            const hh = Math.max(5.5, sw * 2.1);
            const dash = p.dashed ? `stroke-dasharray="${(sw * 2.6).toFixed(1)} ${(sw * 1.8).toFixed(1)}"` : '';
            const isOpen = p.headStyle === 'open';
            const x1 = p.doubleHead ? (-hw + (isOpen ? 2 : hl * 0.72)) : -hw;
            const x2 = hw - (isOpen ? 2 : hl * 0.72);

            const rightHead = isOpen
                ? `<polyline points="${(hw - hl).toFixed(1)},${(-hh).toFixed(1)} ${hw.toFixed(1)},0 ${(hw - hl).toFixed(1)},${hh.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />`
                : `<polygon points="${hw.toFixed(1)},0 ${(hw - hl).toFixed(1)},${(-hh).toFixed(1)} ${(hw - hl * 0.72).toFixed(1)},0 ${(hw - hl).toFixed(1)},${hh.toFixed(1)}" fill="${col}" />`;

            const leftHead = p.doubleHead
                ? (isOpen
                    ? `<polyline points="${(-hw + hl).toFixed(1)},${(-hh).toFixed(1)} ${(-hw).toFixed(1)},0 ${(-hw + hl).toFixed(1)},${hh.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />`
                    : `<polygon points="${(-hw).toFixed(1)},0 ${(-hw + hl).toFixed(1)},${(-hh).toFixed(1)} ${(-hw + hl * 0.72).toFixed(1)},0 ${(-hw + hl).toFixed(1)},${hh.toFixed(1)}" fill="${col}" />`)
                : '';

            return `
              <line x1="${(-hw).toFixed(1)}" y1="0" x2="${hw.toFixed(1)}" y2="0" stroke="transparent" stroke-width="18" />
              <line x1="${x1.toFixed(1)}" y1="0" x2="${x2.toFixed(1)}" y2="0" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" ${dash} />
              ${rightHead}
              ${leftHead}
            `;
        }
    },

    {
        id: 'forme-ligne',
        name: 'Segment / Axe',
        category: 'formes',
        keywords: 'ligne trait segment axe separation pointilles',
        defaultProps: {
            length: 140,
            strokeWidth: 2.5,
            strokeColor: '#1e293b',
            dashed: false
        },
        propSchema: [
            { key: 'length', label: 'Longueur', type: 'range', min: 30, max: 500, step: 5, unit: 'px' },
            { key: 'strokeWidth', label: 'Épaisseur', type: 'range', min: 1, max: 8, step: 0.5, unit: 'px' },
            { key: 'strokeColor', label: 'Couleur', type: 'color', presets: SHAPE_STROKE_PRESETS },
            { key: 'dashed', label: 'Pointillés', type: 'toggle' }
        ],
        getBBox(p) {
            const len = Math.max(30, Number(p.length) || 140);
            return { x: -len / 2 - 4, y: -10, width: len + 8, height: 20 };
        },
        getAnchors() {
            return [];
        },
        render(p) {
            const len = Math.max(30, Number(p.length) || 140);
            const sw = Number(p.strokeWidth) || 2.5;
            const col = esc(p.strokeColor || '#1e293b');
            const hw = len / 2;
            const dash = p.dashed ? `stroke-dasharray="${(sw * 2.8).toFixed(1)} ${(sw * 2).toFixed(1)}"` : '';
            return `
              <line x1="${(-hw).toFixed(1)}" y1="0" x2="${hw.toFixed(1)}" y2="0" stroke="transparent" stroke-width="18" />
              <line x1="${(-hw).toFixed(1)}" y1="0" x2="${hw.toFixed(1)}" y2="0" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" ${dash} />
            `;
        }
    },

    {
        id: 'forme-rectangle',
        name: 'Rectangle / Cadre',
        category: 'formes',
        keywords: 'rectangle cadre boite zone encadre zoom etape carre',
        defaultProps: {
            width: 180,
            height: 110,
            radius: 8,
            strokeWidth: 2.5,
            strokeColor: '#1e293b',
            dashed: false,
            filled: false,
            fillColor: '#bfdbfe',
            fillOpacity: 25
        },
        propSchema: [
            { key: 'width', label: 'Largeur', type: 'range', min: 40, max: 500, step: 5, unit: 'px' },
            { key: 'height', label: 'Hauteur', type: 'range', min: 30, max: 400, step: 5, unit: 'px' },
            { key: 'radius', label: 'Coins arrondis', type: 'range', min: 0, max: 30, step: 2, unit: 'px' },
            { key: 'strokeWidth', label: 'Épaisseur', type: 'range', min: 1, max: 8, step: 0.5, unit: 'px' },
            { key: 'strokeColor', label: 'Contour', type: 'color', presets: SHAPE_STROKE_PRESETS },
            { key: 'dashed', label: 'Pointillés', type: 'toggle' },
            { key: 'filled', label: 'Remplissage', type: 'toggle' },
            { key: 'fillColor', label: 'Couleur fond', type: 'color', presets: SHAPE_FILL_PRESETS, showIf: p => Boolean(p.filled) },
            { key: 'fillOpacity', label: 'Opacité fond', type: 'range', min: 10, max: 100, step: 5, unit: '%', showIf: p => Boolean(p.filled) }
        ],
        getBBox(p) {
            const w = Math.max(40, Number(p.width) || 180);
            const h = Math.max(30, Number(p.height) || 110);
            return { x: -w / 2 - 4, y: -h / 2 - 4, width: w + 8, height: h + 8 };
        },
        getAnchors() {
            return [];
        },
        render(p) {
            const w = Math.max(40, Number(p.width) || 180);
            const h = Math.max(30, Number(p.height) || 110);
            const rx = Math.max(0, Math.min(Number(p.radius) || 0, Math.min(w, h) / 2));
            const sw = Number(p.strokeWidth) || 2.5;
            const col = esc(p.strokeColor || '#1e293b');
            const dash = p.dashed ? `stroke-dasharray="${(sw * 2.8).toFixed(1)} ${(sw * 2).toFixed(1)}"` : '';
            const fill = p.filled ? esc(p.fillColor || '#bfdbfe') : 'none';
            const fillOp = p.filled ? (Math.max(10, Math.min(100, Number(p.fillOpacity) || 25)) / 100).toFixed(2) : '1';
            const hitRect = p.filled
                ? ''
                : `<rect x="${(-w / 2).toFixed(1)}" y="${(-h / 2).toFixed(1)}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="transparent" stroke-width="14" pointer-events="stroke" />`;
            return `
              ${hitRect}
              <rect x="${(-w / 2).toFixed(1)}" y="${(-h / 2).toFixed(1)}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" fill-opacity="${fillOp}" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" ${dash} />
            `;
        }
    },

    {
        id: 'forme-ellipse',
        name: 'Cercle / Ellipse',
        category: 'formes',
        keywords: 'cercle ellipse rond loupe zoom zone ovale',
        defaultProps: {
            rx: 55,
            ry: 55,
            strokeWidth: 2.5,
            strokeColor: '#1e293b',
            dashed: false,
            filled: false,
            fillColor: '#bfdbfe',
            fillOpacity: 25
        },
        propSchema: [
            { key: 'rx', label: 'Rayon X', type: 'range', min: 15, max: 250, step: 5, unit: 'px' },
            { key: 'ry', label: 'Rayon Y', type: 'range', min: 15, max: 250, step: 5, unit: 'px' },
            { key: 'strokeWidth', label: 'Épaisseur', type: 'range', min: 1, max: 8, step: 0.5, unit: 'px' },
            { key: 'strokeColor', label: 'Contour', type: 'color', presets: SHAPE_STROKE_PRESETS },
            { key: 'dashed', label: 'Pointillés', type: 'toggle' },
            { key: 'filled', label: 'Remplissage', type: 'toggle' },
            { key: 'fillColor', label: 'Couleur fond', type: 'color', presets: SHAPE_FILL_PRESETS, showIf: p => Boolean(p.filled) },
            { key: 'fillOpacity', label: 'Opacité fond', type: 'range', min: 10, max: 100, step: 5, unit: '%', showIf: p => Boolean(p.filled) }
        ],
        getBBox(p) {
            const rx = Math.max(15, Number(p.rx) || 55);
            const ry = Math.max(15, Number(p.ry) || 55);
            return { x: -rx - 4, y: -ry - 4, width: rx * 2 + 8, height: ry * 2 + 8 };
        },
        getAnchors() {
            return [];
        },
        render(p) {
            const rx = Math.max(15, Number(p.rx) || 55);
            const ry = Math.max(15, Number(p.ry) || 55);
            const sw = Number(p.strokeWidth) || 2.5;
            const col = esc(p.strokeColor || '#1e293b');
            const dash = p.dashed ? `stroke-dasharray="${(sw * 2.8).toFixed(1)} ${(sw * 2).toFixed(1)}"` : '';
            const fill = p.filled ? esc(p.fillColor || '#bfdbfe') : 'none';
            const fillOp = p.filled ? (Math.max(10, Math.min(100, Number(p.fillOpacity) || 25)) / 100).toFixed(2) : '1';
            const hitEl = p.filled
                ? ''
                : `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="none" stroke="transparent" stroke-width="14" pointer-events="stroke" />`;
            return `
              ${hitEl}
              <ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="${fill}" fill-opacity="${fillOp}" stroke="${col}" stroke-width="${sw}" ${dash} />
            `;
        }
    },

    {
        id: 'forme-accolade',
        name: 'Accolade',
        category: 'formes',
        keywords: 'accolade regroupement hauteur mesure annotation brace',
        defaultProps: {
            height: 140,
            strokeWidth: 2.5,
            strokeColor: '#1e293b'
        },
        propSchema: [
            { key: 'height', label: 'Hauteur', type: 'range', min: 50, max: 400, step: 5, unit: 'px' },
            { key: 'strokeWidth', label: 'Épaisseur', type: 'range', min: 1.5, max: 6, step: 0.5, unit: 'px' },
            { key: 'strokeColor', label: 'Couleur', type: 'color', presets: SHAPE_STROKE_PRESETS }
        ],
        getBBox(p) {
            const h = Math.max(50, Number(p.height) || 140);
            return { x: -16, y: -h / 2 - 4, width: 32, height: h + 8 };
        },
        getAnchors() {
            return [];
        },
        render(p) {
            const h = Math.max(50, Number(p.height) || 140);
            const hh = h / 2;
            const sw = Number(p.strokeWidth) || 2.5;
            const col = esc(p.strokeColor || '#1e293b');
            const r = Math.min(14, hh * 0.28);
            const d = `M -10,${(-hh).toFixed(1)} Q 0,${(-hh).toFixed(1)} 0,${(-hh + r).toFixed(1)} L 0,${(-r).toFixed(1)} Q 0,0 10,0 Q 0,0 0,${r.toFixed(1)} L 0,${(hh - r).toFixed(1)} Q 0,${hh.toFixed(1)} -10,${hh.toFixed(1)}`;
            return `
              <path d="${d}" fill="none" stroke="transparent" stroke-width="18" />
              <path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />
            `;
        }
    }
];

export const CATALOG_MAP = Object.fromEntries(CATALOG.map(item => [item.id, item]));

export function getCatalogItem(typeId) {
    return CATALOG_MAP[typeId] || null;
}
