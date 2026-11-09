import { initApplets, showToast } from '../../common/common.js';
import {
    LAMBDA_MIN_VISIBLE,
    LAMBDA_MAX_VISIBLE,
    ABS_MIN_NM,
    ABS_MAX_NM,
    TEMP_MIN_K,
    TEMP_MAX_K,
    TEMP_DEFAULT_K,
    PRESETS_DB,
    DEFAULT_STATE,
    DEFAULT_TRACK_NAMES,
    getPresetShortName
} from './data.js';

window.showToast = showToast || ((msg) => console.log(msg));
try {
    initApplets("Générateur de Spectres", "../..");
} catch (e) {
    window.showToast = (msg) => alert(msg);
}

const canvas = document.getElementById('spectrumCanvas');
const ctx = canvas.getContext('2d');

const EXPORT_SCALE = 3;
let currentScale = window.devicePixelRatio || 1;
let logicalWidth = 800;
let logicalHeight = 260;
let isExportingEmptyGrid = false;
let isExportingHD = false;
let cachedBandCanvas = null;
let cachedBandCtx = null;
let pendingTexts = [];

// Onglet actuellement affiché dans le panneau de droite (0 à 3)
let selectedTabIndex = 0;

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
let draggedLine = null;
let hoveredLine = null;
let isPanningSpectrum = false;
let panStartX = 0;
let panStartMinNm = ABS_MIN_NM;
let panStartMaxNm = ABS_MAX_NM;
let isDraggingZoomSlider = false;

// --- Conversion Longueur d'onde (nm) -> Couleur RGB ---
export function wavelengthToRGB(wavelength) {
    let r = 0, g = 0, b = 0, factor = 0;

    if (wavelength >= LAMBDA_MIN_VISIBLE && wavelength < 440) {
        r = -(wavelength - 440) / (440 - LAMBDA_MIN_VISIBLE);
        g = 0.0;
        b = 1.0;
    } else if (wavelength >= 440 && wavelength < 490) {
        r = 0.0;
        g = (wavelength - 440) / (490 - 440);
        b = 1.0;
    } else if (wavelength >= 490 && wavelength < 510) {
        r = 0.0;
        g = 1.0;
        b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
        r = (wavelength - 510) / (580 - 510);
        g = 1.0;
        b = 0.0;
    } else if (wavelength >= 580 && wavelength < 645) {
        r = 1.0;
        g = -(wavelength - 645) / (645 - 580);
        b = 0.0;
    } else if (wavelength >= 645 && wavelength <= LAMBDA_MAX_VISIBLE) {
        r = 1.0;
        g = 0.0;
        b = 0.0;
    }

    if (wavelength >= LAMBDA_MIN_VISIBLE && wavelength < 420) {
        factor = 0.55 + 0.45 * (wavelength - LAMBDA_MIN_VISIBLE) / (420 - LAMBDA_MIN_VISIBLE);
    } else if (wavelength >= 420 && wavelength <= 700) {
        factor = 1.0;
    } else if (wavelength > 700 && wavelength <= LAMBDA_MAX_VISIBLE) {
        factor = 0.35 + 0.65 * (LAMBDA_MAX_VISIBLE - wavelength) / (LAMBDA_MAX_VISIBLE - 700);
    } else {
        factor = 0.0;
    }

    const gamma = 0.8;
    const R = r > 0 ? Math.round(255 * Math.pow(r * factor, gamma)) : 0;
    const G = g > 0 ? Math.round(255 * Math.pow(g * factor, gamma)) : 0;
    const B = b > 0 ? Math.round(255 * Math.pow(b * factor, gamma)) : 0;

    return [R, G, B];
}

// --- Loi de Planck (mode réaliste) ---
export const PLANCK_C2 = 1.4388e7; // hc/k en nm·K
export const planck = (l, T) => 1.0 / (Math.pow(l, 5) * (Math.exp(PLANCK_C2 / (l * T)) - 1));

// Maximum de Planck sur le visible, mémoïsé par température (évite 15 évaluations par pixel)
export const planckMaxCache = new Map();
export function getPlanckMax(tempK) {
    const cached = planckMaxCache.get(tempK);
    if (cached !== undefined) return cached;
    let maxVal = 0;
    for (let l = LAMBDA_MIN_VISIBLE; l <= LAMBDA_MAX_VISIBLE; l += 25) {
        const v = planck(l, tempK);
        if (v > maxVal) maxVal = v;
    }
    // Le curseur de température évolue par pas : on borne la taille du cache
    if (planckMaxCache.size > 200) planckMaxCache.clear();
    planckMaxCache.set(tempK, maxVal);
    return maxVal;
}

// --- Calcul de l'intensité thermique (Réaliste vs Exagéré) ---
export function getThermalMultiplier(lambdaNm, tempK, isExaggerated, sharpness) {
    if (lambdaNm < LAMBDA_MIN_VISIBLE || lambdaNm > LAMBDA_MAX_VISIBLE) return 0;

    if (!isExaggerated) {
        const maxVal = getPlanckMax(tempK);
        const rawRatio = maxVal > 0 ? planck(lambdaNm, tempK) / maxVal : 0;
        const globalBrightness = Math.min(1.0, 0.55 + 0.45 * ((tempK - 1500) / 4500));
        return Math.min(1.0, Math.pow(rawRatio, 0.65) * globalBrightness);
    } else {
        let cutoffNm;
        if (tempK <= 6000) {
            const tNorm = Math.max(0, (tempK - 1500) / (6000 - 1500));
            cutoffNm = 685 - 305 * Math.pow(tNorm, 0.85);
        } else {
            cutoffNm = LAMBDA_MIN_VISIBLE - (tempK - 6000) * 0.02;
        }

        const transitionWidth = Math.max(2.5, 50 - sharpness * 4.7);
        const x = (lambdaNm - cutoffNm) / (transitionWidth * 0.35);
        const sigmoid = 1.0 / (1.0 + Math.exp(-x));

        let hotBlueBoost = 1.0;
        if (tempK > 6000) {
            const hotFactor = Math.min(1.0, (tempK - 6000) / (12000 - 6000));
            // À haute température (jusqu'à 12 000 K), le rouge s'atténue nettement (vers ~28%)
            // pour illustrer la dominance du bleu sans jamais éteindre le rouge ni effacer Hα (656,3 nm)
            const redAttenuation = ((lambdaNm - LAMBDA_MIN_VISIBLE) / (LAMBDA_MAX_VISIBLE - LAMBDA_MIN_VISIBLE)) * 0.72 * hotFactor;
            hotBlueBoost = Math.max(0.2, 1.0 - redAttenuation);
        }

        return Math.max(0, Math.min(1, sigmoid * hotBlueBoost));
    }
}

// --- Calcul de la largeur effective d'une raie/bande selon le niveau de zoom ---
export function getEffectiveLineWidth(rawW, spanNm = 410) {
    const w = (typeof rawW === 'number' && Number.isFinite(rawW) && rawW > 0) ? rawW : 2.0;
    const zoomResolutionScale = Math.min(1.0, Math.max(0.08, Math.pow(spanNm / 350, 0.75)));
    // Transition continue entre les raies fines (atomiques, w <= 2 nm) et les bandes larges (moléculaires/solutions, w >= 8 nm)
    // pour éviter toute discontinuité de largeur visuelle lors du zoom (B5).
    const t = Math.max(0, Math.min(1, (w - 2.0) / 6.0));
    const scale = (1 - t) * zoomResolutionScale + t * 1.0;
    return w * scale;
}

// --- Calcul du facteur d'absorption/émission des raies (avec résolution adaptative au zoom) ---
export function getLinesFactor(lambdaNm, lines, spanNm = 410) {
    let total = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const dist = Math.abs(lambdaNm - line.lambda);
        const effectiveW = getEffectiveLineWidth(line.w, spanNm);
        const halfW = effectiveW / 2;

        if (dist < halfW * 3.5) {
            const sigma = halfW * 0.75;
            const val = (line.intensity ?? 1.0) * Math.exp(-0.5 * Math.pow(dist / sigma, 2.4));
            total = Math.max(total, val);
        }
    }
    return Math.min(1.0, total);
}

// --- Calcul du dégradé représentant exactement les couleurs de la plage [minNm, maxNm] ---
let lastGradKey = "";
let lastGradCss = "";

export function getSpectrumGradient(minNm, maxNm) {
    // Arrondi à 0.2 nm pour éviter des recalculs superflus sur micro-déplacements
    const rMin = Math.round(minNm * 5) / 5;
    const rMax = Math.round(maxNm * 5) / 5;
    const key = `${rMin}_${rMax}`;
    if (key === lastGradKey) {
        return lastGradCss;
    }

    const numStops = 12;
    const stops = [];
    const span = Math.max(1e-3, rMax - rMin);

    for (let i = 0; i <= numStops; i++) {
        const lambda = rMin + (i / numStops) * span;
        let [r, g, b] = wavelengthToRGB(lambda);

        if (lambda < LAMBDA_MIN_VISIBLE || lambda > LAMBDA_MAX_VISIBLE) {
            r = 30; g = 30; b = 30;
        }

        const pct = Math.round((i / numStops) * 100);
        stops.push(`rgb(${r}, ${g}, ${b}) ${pct}%`);
    }
    lastGradKey = key;
    lastGradCss = `linear-gradient(90deg, ${stops.join(', ')})`;
    return lastGradCss;
}

// --- Synchronisation de la barre de Zoom UI ---
export function syncZoomUI() {
    const minInput = document.getElementById('zoomMinInput');
    const maxInput = document.getElementById('zoomMaxInput');
    const minSlider = document.getElementById('zoomMinSlider');
    const maxSlider = document.getElementById('zoomMaxSlider');
    const fill = document.getElementById('zoomRangeFill');

    if (!minInput || !maxInput || !minSlider || !maxSlider || !fill) return;

    const vMin = Math.round(state.viewMinNm * 10) / 10;
    const vMax = Math.round(state.viewMaxNm * 10) / 10;

    minInput.value = vMin;
    maxInput.value = vMax;
    minSlider.value = vMin;
    maxSlider.value = vMax;

    const pctMin = ((vMin - ABS_MIN_NM) / (ABS_MAX_NM - ABS_MIN_NM)) * 100;
    const pctMax = ((vMax - ABS_MIN_NM) / (ABS_MAX_NM - ABS_MIN_NM)) * 100;
    fill.style.left = `${Math.max(0, pctMin)}%`;
    fill.style.width = `${Math.max(0, pctMax - pctMin)}%`;
    fill.style.background = getSpectrumGradient(vMin, vMax);

    if (!isDraggingZoomSlider) {
        if (vMin > (ABS_MIN_NM + ABS_MAX_NM) / 2) {
            minSlider.style.zIndex = '4';
            maxSlider.style.zIndex = '3';
        } else {
            minSlider.style.zIndex = '3';
            maxSlider.style.zIndex = '4';
        }
    }
}

// --- Rendu fluide synchronisé au rafraîchissement d'écran (60-144 Hz) ---
const requestFrame = (typeof window !== 'undefined' && window.requestAnimationFrame)
    ? window.requestAnimationFrame.bind(window)
    : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (cb) => setTimeout(cb, 0));
const cancelFrame = (typeof window !== 'undefined' && window.cancelAnimationFrame)
    ? window.cancelAnimationFrame.bind(window)
    : (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : (id) => clearTimeout(id));

let renderAnimFrameId = null;
export function scheduleRender() {
    if (renderAnimFrameId !== null) return;
    renderAnimFrameId = requestFrame(() => {
        renderAnimFrameId = null;
        render();
    });
}

export function setZoomRange(newMin, newMax, immediate = false) {
    const minSpan = 3; // Zoom max = fenêtre de 3 nm
    let a = Math.max(ABS_MIN_NM, Math.min(ABS_MAX_NM - minSpan, newMin));
    let b = Math.min(ABS_MAX_NM, Math.max(a + minSpan, newMax));
    state.viewMinNm = a;
    state.viewMaxNm = b;
    syncZoomUI();
    if (immediate) {
        if (renderAnimFrameId !== null) {
            cancelFrame(renderAnimFrameId);
            renderAnimFrameId = null;
        }
        render();
    } else {
        scheduleRender();
    }
}

// --- Géométrie du Canvas ---
export function getLayoutGeometry() {
    const activeTracks = state.tracks.map((t, idx) => ({ ...t, index: idx })).filter(t => t.active);
    const count = activeTracks.length || 1;
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;

    ctx.save();
    let maxTextW = 0;
    activeTracks.forEach((t, aIdx) => {
        if (t.showName && t.name.trim() !== "") {
            ctx.font = "bold 13px Arial";
            const nameW = ctx.measureText(t.name.trim()).width;
            maxTextW = Math.max(maxTextW, nameW);

            const hasTemp = (t.mode === 'thermal' || t.mode === 'thermal_abs') && t.showTempBadge;
            if (hasTemp) {
                ctx.font = "italic bold 11px Arial";
                const tempW = ctx.measureText(`T = ${t.temp} K`).width;
                maxTextW = Math.max(maxTextW, tempW);
            }
        }
        if (aIdx === 0 && state.showProfile) {
            ctx.font = "italic 12px Arial";
            maxTextW = Math.max(maxTextW, ctx.measureText("Profil I(λ)").width);
        }
    });
    ctx.restore();

    const basePad = isSmallScreen ? 14 : 24;
    const leftMargin = maxTextW > 0 ? Math.ceil(maxTextW) + basePad : (isSmallScreen ? 12 : 24);
    const rightMargin = state.showAxis ? (isSmallScreen ? 56 : 66) : (isSmallScreen ? 12 : 24);
    const topMargin = 26;
    const bottomMargin = state.showAxis ? 44 : 20;
    const trackGap = state.showLineValues ? 28 : 18;

    const minNm = state.viewMinNm;
    const maxNm = state.viewMaxNm;
    const spanNm = Math.max(1, maxNm - minNm);

    const totalBarWidth = state.specWidth;
    const profileExtraH = state.showProfile ? 88 : 0;

    const totalW = leftMargin + totalBarWidth + rightMargin;
    const totalH = topMargin + count * state.bandHeight + (count - 1) * trackGap + profileExtraH + bottomMargin;

    const nmToX = (nm) => leftMargin + ((nm - minNm) / spanNm) * totalBarWidth;
    const xToNm = (px) => minNm + ((px - leftMargin) / totalBarWidth) * spanNm;

    return {
        activeTracks,
        leftMargin,
        rightMargin,
        topMargin,
        bottomMargin,
        trackGap,
        totalBarWidth,
        profileExtraH,
        totalW,
        totalH,
        minNm,
        maxNm,
        spanNm,
        nmToX,
        xToNm
    };
}

export function updateCanvasDimensions() {
    if (!isExportingHD) {
        currentScale = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    }
    const geom = getLayoutGeometry();
    logicalWidth = geom.totalW;
    logicalHeight = geom.totalH;

    const targetW = Math.round(logicalWidth * currentScale);
    const targetH = Math.round(logicalHeight * currentScale);
    if (canvas.width !== targetW) canvas.width = targetW;
    if (canvas.height !== targetH) canvas.height = targetH;

    const styleW = logicalWidth + "px";
    const styleH = logicalHeight + "px";
    if (canvas.style.width !== styleW) canvas.style.width = styleW;
    if (canvas.style.height !== styleH) canvas.style.height = styleH;
}

// --- Utilitaires de dessin ---
export function drawLine(x1, y1, x2, y2, color = "black", width = 1, dash = []) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
}

export function drawText(text, x, y, color = "black", font = "14px Arial", align = "center", baseline = "middle", withHalo = true) {
    pendingTexts.push({ text, x, y, color, font, align, baseline, withHalo });
}

export function flushTexts() {
    pendingTexts.forEach(t => {
        ctx.font = t.font;
        ctx.textAlign = t.align;
        ctx.textBaseline = t.baseline;
        if (t.withHalo) {
            ctx.lineJoin = "round";
            ctx.miterLimit = 2;
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
            ctx.strokeText(t.text, t.x, t.y);
        }
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y);
    });
    pendingTexts = [];
}

// --- Rendu d'une piste spectrale pixel par pixel ---
let cachedImgData = null;

export function renderSpectrumBand(track, xStart, yStart, width, height, geom) {
    const renderW = Math.max(1, Math.round(width * currentScale));
    if (!cachedBandCanvas) {
        cachedBandCanvas = document.createElement('canvas');
        cachedBandCtx = cachedBandCanvas.getContext('2d');
    }
    if (cachedBandCanvas.width !== renderW) {
        cachedBandCanvas.width = renderW;
        cachedBandCanvas.height = 1;
        cachedImgData = null;
    }
    if (!cachedImgData) {
        cachedImgData = cachedBandCtx.createImageData(renderW, 1);
    }
    const data = cachedImgData.data;

    const bgByte = state.printMode ? 248 : 8;

    for (let px = 0; px < renderW; px++) {
        const lambda = geom.minNm + (px / renderW) * geom.spanNm;
        const [baseR, baseG, baseB] = wavelengthToRGB(lambda);
        const isVisibleDomain = (lambda >= LAMBDA_MIN_VISIBLE && lambda <= LAMBDA_MAX_VISIBLE);

        let R = bgByte, G = bgByte, B = bgByte;

        if (!isVisibleDomain) {
            R = state.printMode ? 238 : 18;
            G = state.printMode ? 238 : 18;
            B = state.printMode ? 238 : 18;

            const lFactor = getLinesFactor(lambda, track.lines, geom.spanNm);
            if (lFactor > 0.05) {
                if (track.mode === 'emission_lines') {
                    const c = state.printMode ? Math.round(238 * (1 - lFactor * 0.75)) : Math.round(18 + lFactor * 140);
                    R = c; G = Math.round(c * 0.7); B = c;
                } else if (track.mode === 'absorption_lines' || track.mode === 'thermal_abs') {
                    const c = Math.round(R * (1 - lFactor * 0.85));
                    R = c; G = c; B = c;
                }
            }
        } else {
            if (track.mode === 'thermal') {
                const th = getThermalMultiplier(lambda, track.temp, state.exaggerated, state.sharpness);
                R = Math.round(bgByte * (1 - th) + baseR * th);
                G = Math.round(bgByte * (1 - th) + baseG * th);
                B = Math.round(bgByte * (1 - th) + baseB * th);
            } 
            else if (track.mode === 'emission_lines') {
                const em = getLinesFactor(lambda, track.lines, geom.spanNm);
                if (state.printMode) {
                    const darkR = Math.round(baseR * 0.35);
                    const darkG = Math.round(baseG * 0.35);
                    const darkB = Math.round(baseB * 0.35);
                    R = Math.round(bgByte * (1 - em) + darkR * em);
                    G = Math.round(bgByte * (1 - em) + darkG * em);
                    B = Math.round(bgByte * (1 - em) + darkB * em);
                } else {
                    R = Math.round(bgByte * (1 - em) + baseR * em);
                    G = Math.round(bgByte * (1 - em) + baseG * em);
                    B = Math.round(bgByte * (1 - em) + baseB * em);
                }
            } 
            else if (track.mode === 'absorption_lines') {
                const abs = getLinesFactor(lambda, track.lines, geom.spanNm);
                const darkR = 10, darkG = 10, darkB = 10;
                R = Math.round(baseR * (1 - abs) + darkR * abs);
                G = Math.round(baseG * (1 - abs) + darkG * abs);
                B = Math.round(baseB * (1 - abs) + darkB * abs);
            } 
            else if (track.mode === 'thermal_abs') {
                const th = getThermalMultiplier(lambda, track.temp, state.exaggerated, state.sharpness);
                const thR = bgByte * (1 - th) + baseR * th;
                const thG = bgByte * (1 - th) + baseG * th;
                const thB = bgByte * (1 - th) + baseB * th;

                const abs = getLinesFactor(lambda, track.lines, geom.spanNm);
                const darkR = 8, darkG = 8, darkB = 8;
                R = Math.round(thR * (1 - abs) + darkR * abs);
                G = Math.round(thG * (1 - abs) + darkG * abs);
                B = Math.round(thB * (1 - abs) + darkB * abs);
            }
        }

        const idx = px * 4;
        data[idx] = R;
        data[idx + 1] = G;
        data[idx + 2] = B;
        data[idx + 3] = 255;
    }

    cachedBandCtx.putImageData(cachedImgData, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cachedBandCanvas, xStart, yStart, width, height);
}

// --- Rendu principal ---
export function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(currentScale, currentScale);

    const geom = getLayoutGeometry();
    let currentY = geom.topMargin;

    geom.activeTracks.forEach((track, activeIdx) => {
        const bandX = geom.leftMargin;
        const bandY = currentY;
        const bandW = geom.totalBarWidth;
        const bandH = state.bandHeight;

        if (isExportingEmptyGrid) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(bandX, bandY, bandW, bandH);
        } else {
            renderSpectrumBand(track, bandX, bandY, bandW, bandH, geom);
        }

        // Délimitations UV (< 400 nm) et IR (> 800 nm) si présentes dans la fenêtre de zoom
        if (state.showUVIR) {
            const sepColor = isExportingEmptyGrid || state.printMode ? "#7f8c8d" : "rgba(255,255,255,0.65)";

            if (geom.minNm < LAMBDA_MIN_VISIBLE && geom.maxNm > LAMBDA_MIN_VISIBLE) {
                const xMinVis = geom.nmToX(LAMBDA_MIN_VISIBLE);
                drawLine(xMinVis, bandY, xMinVis, bandY + bandH, sepColor, 1.5, [4, 4]);
                if (activeIdx === 0 && (xMinVis - bandX) > 22) {
                    drawText("UV", (bandX + xMinVis) / 2, bandY - 10, "#7f8c8d", "bold 11px Arial", "center", "middle");
                }
            }
            if (geom.minNm < LAMBDA_MAX_VISIBLE && geom.maxNm > LAMBDA_MAX_VISIBLE) {
                const xMaxVis = geom.nmToX(LAMBDA_MAX_VISIBLE);
                drawLine(xMaxVis, bandY, xMaxVis, bandY + bandH, sepColor, 1.5, [4, 4]);
                if (activeIdx === 0 && (bandX + bandW - xMaxVis) > 22) {
                    drawText("IR", (xMaxVis + bandX + bandW) / 2, bandY - 10, "#7f8c8d", "bold 11px Arial", "center", "middle");
                }
            }
        }

        ctx.strokeStyle = "#34495e";
        ctx.lineWidth = 1.6;
        ctx.strokeRect(bandX, bandY, bandW, bandH);

        // Titre à gauche et température systématiquement à la ligne en dessous
        if (track.showName && track.name) {
            const hasTemp = (track.mode === 'thermal' || track.mode === 'thermal_abs') && track.showTempBadge && !isExportingEmptyGrid;
            if (hasTemp) {
                drawText(track.name, bandX - 10, bandY + bandH / 2 - 7, "#2c3e50", "bold 13px Arial", "right", "middle");
                drawText(`T = ${track.temp} K`, bandX - 10, bandY + bandH / 2 + 8, "#e67e22", "italic bold 11px Arial", "right", "middle");
            } else {
                drawText(track.name, bandX - 10, bandY + bandH / 2, "#2c3e50", "bold 13px Arial", "right", "middle");
            }
        }

        // Marqueurs de raies
        if (!isExportingEmptyGrid && track.mode !== 'thermal') {
            track.lines.forEach((line, lIdx) => {
                if (line.lambda < geom.minNm || line.lambda > geom.maxNm) return;
                const lx = geom.nmToX(line.lambda);

                const isHovered = (hoveredLine && hoveredLine.trackIndex === track.index && hoveredLine.lineIndex === lIdx) ||
                                  (draggedLine && draggedLine.trackIndex === track.index && draggedLine.lineIndex === lIdx);

                if (isHovered) {
                    ctx.save();
                    ctx.strokeStyle = "#f1c40f";
                    ctx.lineWidth = 2;
                    ctx.setLineDash([2, 2]);
                    const effectiveW = getEffectiveLineWidth(line.w, geom.spanNm);
                    const boxW = Math.max(6, (effectiveW / geom.spanNm) * geom.totalBarWidth);
                    ctx.strokeRect(lx - boxW / 2, bandY - 2, boxW, bandH + 4);
                    ctx.restore();
                    drawText(`${line.lambda.toFixed(1)} nm`, lx, bandY - 9, "#d35400", "bold 11px Arial", "center", "middle");
                } else if (state.showLineValues) {
                    const formattedLambda = geom.spanNm < 40 ? line.lambda.toFixed(1) : Math.round(line.lambda);
                    const txt = line.label ? `${formattedLambda} (${line.label})` : `${formattedLambda}`;
                    drawText(txt, lx, bandY - 8, "#2c3e50", "10px Arial", "center", "middle");
                }
            });
        }

        // Profil spectral I(λ) sous le Spectre 1
        if (activeIdx === 0 && state.showProfile) {
            const profY = bandY + bandH + 12;
            const profH = 68;

            ctx.fillStyle = "#fafbfc";
            ctx.fillRect(bandX, profY, bandW, profH);
            ctx.strokeStyle = "#bdc3c7";
            ctx.lineWidth = 1;
            ctx.strokeRect(bandX, profY, bandW, profH);

            drawText("Profil I(λ)", bandX - 10, profY + profH / 2, "#7f8c8d", "italic 12px Arial", "right", "middle");

            if (!isExportingEmptyGrid) {
                drawLine(bandX, profY + profH - 5, bandX + bandW, profY + profH - 5, "#eceff1", 1);
                drawText("1", bandX - 3, profY + 7, "#95a5a6", "9px Arial", "right", "middle", false);
                drawText("0", bandX - 3, profY + profH - 5, "#95a5a6", "9px Arial", "right", "middle", false);

                ctx.beginPath();
                ctx.strokeStyle = "#e74c3c";
                ctx.lineWidth = 1.8;

                for (let px = 0; px <= bandW; px++) {
                    const lambda = geom.minNm + (px / bandW) * geom.spanNm;
                    let intensity = 0;

                    if (track.mode === 'thermal') {
                        intensity = getThermalMultiplier(lambda, track.temp, state.exaggerated, state.sharpness);
                    } else if (track.mode === 'emission_lines') {
                        intensity = getLinesFactor(lambda, track.lines, geom.spanNm);
                    } else if (track.mode === 'absorption_lines') {
                        const inVisible = lambda >= LAMBDA_MIN_VISIBLE && lambda <= LAMBDA_MAX_VISIBLE;
                        intensity = (inVisible ? 1.0 : 0) * (1 - getLinesFactor(lambda, track.lines, geom.spanNm));
                    } else if (track.mode === 'thermal_abs') {
                        const th = getThermalMultiplier(lambda, track.temp, state.exaggerated, state.sharpness);
                        const abs = getLinesFactor(lambda, track.lines, geom.spanNm);
                        intensity = th * (1 - abs);
                    }

                    const py = profY + profH - 5 - intensity * (profH - 10);
                    if (px === 0) ctx.moveTo(bandX + px, py);
                    else ctx.lineTo(bandX + px, py);
                }
                ctx.stroke();
            }

            currentY += profH + 14;
        }

        currentY += bandH + geom.trackGap;
    });

    // Axe gradué en bas (adaptatif selon le niveau de zoom)
    if (state.showAxis) {
        const axisY = currentY - geom.trackGap + 8;
        const axisStartX = geom.leftMargin;
        const axisEndX = geom.leftMargin + geom.totalBarWidth;

        drawLine(axisStartX, axisY, axisEndX + 10, axisY, "#2c3e50", 1.6);
        ctx.beginPath();
        ctx.fillStyle = "#2c3e50";
        ctx.moveTo(axisEndX + 15, axisY);
        ctx.lineTo(axisEndX + 7, axisY - 4);
        ctx.lineTo(axisEndX + 7, axisY + 4);
        ctx.fill();

        drawText("λ (nm)", axisEndX + 19, axisY, "#2c3e50", "bold italic 12px Arial", "left", "middle");

        let majorStep = 50, minorStep = 10;
        if (geom.spanNm <= 4) { majorStep = 0.5; minorStep = 0.1; }
        else if (geom.spanNm <= 8) { majorStep = 1; minorStep = 0.2; }
        else if (geom.spanNm <= 20) { majorStep = 2; minorStep = 0.5; }
        else if (geom.spanNm <= 50) { majorStep = 5; minorStep = 1; }
        else if (geom.spanNm <= 120) { majorStep = 10; minorStep = 2; }
        else if (geom.spanNm <= 240) { majorStep = 20; minorStep = 5; }

        const firstTick = Math.ceil(geom.minNm / minorStep) * minorStep;
        for (let nm = firstTick; nm <= geom.maxNm + 1e-6; nm += minorStep) {
            const roundedNm = Math.round(nm * 100) / 100;
            const tx = geom.nmToX(roundedNm);
            if (tx < axisStartX - 1 || tx > axisEndX + 1) continue;

            const isMajor = Math.abs(roundedNm / majorStep - Math.round(roundedNm / majorStep)) < 1e-4;
            const tickH = isMajor ? 7 : 4;

            drawLine(tx, axisY, tx, axisY + tickH, "#2c3e50", isMajor ? 1.5 : 1);
            if (isMajor) {
                const labelStr = majorStep < 1 ? roundedNm.toFixed(1) : Math.round(roundedNm).toString();
                drawText(labelStr, tx, axisY + 17, "#2c3e50", "bold 11px Arial", "center", "middle");
            }
        }
    }

    flushTexts();
}

// --- Construction des options du méga-dropdown de présélections (inspiré de Grapher) ---
export function buildPresetsDropdownHTML(currentKey, trackIdx = selectedTabIndex) {
    const catAtomes = {
        title: 'Atomes & Ions',
        icon: 'fa-atom',
        iconColor: 'has-text-info',
        items: []
    };
    const catEtoiles = {
        title: 'Étoiles',
        icon: 'fa-star',
        iconColor: 'has-text-warning',
        items: []
    };
    const catMolecules = {
        title: 'Molécules & Solutions',
        icon: 'fa-flask',
        iconColor: 'has-text-purple',
        items: []
    };

    Object.keys(PRESETS_DB).forEach(key => {
        const item = PRESETS_DB[key];
        if (item.category === 'Atomes & Ions') catAtomes.items.push(key);
        else if (item.category === 'Étoiles') catEtoiles.items.push(key);
        else if (item.category === 'Molécules & Solutions') catMolecules.items.push(key);
        else catMolecules.items.push(key);
    });

    const renderItem = (key) => {
        const item = PRESETS_DB[key];
        if (!item) return '';
        const isSelected = (key === currentKey);
        const tag = item.tag || key;
        const desc = item.desc || item.label;
        const tagClass = item.tagClass || 'is-info is-light';
        return `
            <a class="dropdown-item p-1 is-flex is-align-items-center is-justify-content-space-between preset-item ${isSelected ? 'is-active-preset' : ''}" data-key="${key}" data-track="${trackIdx}" style="border-radius: 4px; cursor: pointer;">
                <span class="tag ${tagClass} has-text-weight-bold" style="font-family: monospace; min-width: 44px; justify-content: center; flex-shrink: 0;"><span style="display: inline-block; line-height: normal;">${tag}</span></span>
                <span class="is-size-7 ${isSelected ? 'has-text-link has-text-weight-bold' : 'has-text-grey'} ml-2" style="white-space: nowrap;">${desc}${isSelected ? ' <i class="fas fa-check ml-1 has-text-link"></i>' : ''}</span>
            </a>
        `;
    };

    const renderCategory = (cat) => {
        let html = `
            <p class="menu-label mb-2 is-flex is-align-items-center" style="font-weight: 600;">
                <span class="icon is-small ${cat.iconColor} mr-1"><i class="fas ${cat.icon}"></i></span>
                <span>${cat.title}</span>
            </p>
        `;
        cat.items.forEach(key => {
            html += renderItem(key);
        });
        return html;
    };

    return `
        <div class="columns is-variable is-3 mb-0">
            <div class="column is-6 py-1">
                ${renderCategory(catAtomes)}
            </div>
            <div class="column is-6 py-1">
                ${renderCategory(catEtoiles)}
                <hr class="my-2" style="background-color: #edf2f7; height: 1px; border: none;">
                ${renderCategory(catMolecules)}
            </div>
        </div>
    `;
}

// --- Application d'une présélection de catalogue sur une piste ---
export function applyPreset(tIdx, key) {
    if (!key || !PRESETS_DB[key]) return;
    const item = PRESETS_DB[key];
    const prevPreset = PRESETS_DB[state.tracks[tIdx].presetKey];
    const currentName = state.tracks[tIdx].name.trim();
    state.tracks[tIdx].presetKey = key;
    state.tracks[tIdx].lines = JSON.parse(JSON.stringify(item.lines));

    // Le nom n'est remplacé que s'il n'a pas été personnalisé par l'utilisateur
    const isAutoName = currentName === ''
        || DEFAULT_TRACK_NAMES.includes(currentName)
        || (prevPreset && currentName === getPresetShortName(prevPreset));
    if (isAutoName) {
        state.tracks[tIdx].name = getPresetShortName(item);
    }

    if (item.category === 'Molécules & Solutions') {
        state.tracks[tIdx].mode = 'absorption_lines';
    } else if (item.category === 'Étoiles') {
        state.tracks[tIdx].mode = 'thermal_abs';
        if (item.temp) state.tracks[tIdx].temp = item.temp;
    } else if (item.category === 'Atomes & Ions') {
        if (state.tracks[tIdx].mode === 'thermal') {
            state.tracks[tIdx].mode = 'emission_lines';
        }
    }

    if (item.temp) {
        state.tracks[tIdx].temp = item.temp;
    }
    buildTracksUI();
    updateCanvasDimensions();
    render();
}

// --- Génération de l'interface par onglets (1 seul spectre affiché à la fois) ---
export function buildTracksUI() {
    const tabsContainer = document.getElementById('tracksTabsContainer');
    const editorContainer = document.getElementById('activeTrackContainer');
    if (!tabsContainer || !editorContainer) return;

    tabsContainer.innerHTML = '';
    state.tracks.forEach((t, idx) => {
        const n = idx + 1;
        const isSelected = (idx === selectedTabIndex);
        const tabEl = document.createElement('div');
        tabEl.className = `spec-tab t${n} ${isSelected ? 'is-selected' : ''}`;
        tabEl.dataset.tab = idx;
        tabEl.innerHTML = `
            <input type="checkbox" class="toggle-track-tab" data-track="${idx}" ${t.active ? 'checked' : ''} title="Activer/Désactiver le Spectre ${n}">
            <span>Spectre ${n}</span>
        `;
        tabsContainer.appendChild(tabEl);
    });

    const idx = selectedTabIndex;
    const track = state.tracks[idx];
    const isThermal = (track.mode === 'thermal' || track.mode === 'thermal_abs');
    const hasLines = (track.mode !== 'thermal');

    const currentPreset = track.presetKey ? PRESETS_DB[track.presetKey] : null;
    let currentPresetLabel = "-- Choisir un modèle --";
    let currentCategoryIcon = "fa-layer-group";
    let currentIconClass = "has-text-grey";

    if (currentPreset) {
        currentPresetLabel = currentPreset.label;
        if (currentPreset.category === 'Atomes & Ions') {
            currentCategoryIcon = "fa-atom";
            currentIconClass = "has-text-info";
        } else if (currentPreset.category === 'Étoiles') {
            currentCategoryIcon = "fa-star";
            currentIconClass = "has-text-warning";
        } else if (currentPreset.category === 'Molécules & Solutions') {
            currentCategoryIcon = "fa-flask";
            currentIconClass = "has-text-purple";
        }
    }

    let linesHtml = '';
    if (hasLines) {
        let itemsHtml = '';
        track.lines.forEach((line, lIdx) => {
            itemsHtml += `
                <div class="line-row">
                    <span class="has-text-grey is-size-7" style="width: 18px; flex-shrink: 0;">${lIdx + 1}.</span>
                    <input class="input is-small line-lambda" data-track="${idx}" data-line="${lIdx}" id="lambda-input-${idx}-${lIdx}" type="number" step="0.1" min="350" max="850" value="${line.lambda}" style="width: 64px; text-align: center; flex-shrink: 0;" title="Longueur d'onde λ (nm)">
                    <span class="is-size-7 has-text-grey" style="margin-left: 3px; margin-right: 10px; flex-shrink: 0;">nm</span>
                    <input class="input is-small line-width" data-track="${idx}" data-line="${lIdx}" type="number" step="0.5" min="0.2" max="120" value="${line.w}" style="width: 52px; text-align: center; flex-shrink: 0;" title="Largeur Δλ (nm)">
                    <span class="is-size-7 has-text-grey" style="margin-left: 3px; margin-right: 10px; flex-shrink: 0;" title="Largeur de la raie ou bande">Δλ</span>
                    <input class="input is-small line-label" data-track="${idx}" data-line="${lIdx}" type="text" placeholder="Label" value="${line.label || ''}" style="flex: 1; min-width: 45px; margin-right: 8px;" title="Étiquette optionnelle (ex: Hα, D)">
                    <button class="button is-small is-danger is-light px-2 remove-line" data-track="${idx}" data-line="${lIdx}" style="flex-shrink: 0; margin-left: auto;" title="Supprimer">
                        <span class="icon is-small"><i class="fas fa-times"></i></span>
                    </button>
                </div>
            `;
        });

        linesHtml = `
            <div class="mt-2">
                <div class="control-row mb-2">
                    <label class="label" style="width: 68px;">Catalogue</label>
                    <div class="dropdown is-right" id="presets-dropdown" style="flex: 1; margin-right: 4px; min-width: 0;">
                        <div class="dropdown-trigger" style="width: 100%;">
                            <button class="button is-small is-fullwidth is-justify-content-space-between preset-dropdown-btn" type="button" aria-haspopup="true" aria-controls="presets-dropdown-menu" data-track="${idx}" title="Choisir un modèle dans le catalogue">
                                <span class="is-flex is-align-items-center" style="gap: 6px; min-width: 0;">
                                    <span class="icon is-small ${currentIconClass}" style="flex-shrink: 0;"><i class="fas ${currentCategoryIcon}"></i></span>
                                    <span class="preset-label-text" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${currentPresetLabel}</span>
                                </span>
                                <span class="icon is-small ml-1" style="flex-shrink: 0;"><i class="fas fa-angle-down" aria-hidden="true"></i></span>
                            </button>
                        </div>
                        <div class="dropdown-menu" id="presets-dropdown-menu" role="menu" style="min-width: 520px; z-index: 100;">
                            <div class="dropdown-content p-3" id="presets-dropdown-content" style="max-height: 480px; overflow-y: auto;">
                                ${buildPresetsDropdownHTML(track.presetKey, idx)}
                            </div>
                        </div>
                    </div>
                    <button class="button is-small is-danger is-light px-2 clear-lines-btn" data-track="${idx}" title="Vider toutes les raies">
                        <span class="icon is-small"><i class="fas fa-trash-can"></i></span>
                    </button>
                </div>

                <div class="is-flex is-justify-content-space-between is-align-items-center mt-1">
                    <span class="is-size-7 has-text-weight-semibold has-text-grey-dark">Raies / Bandes (${track.lines.length}) :</span>
                    <div class="buttons has-addons mb-0">
                        <button class="button is-small is-primary is-light py-0 px-2 add-line" data-track="${idx}" data-width="2" style="height: 22px; font-size: 0.72rem;" title="Ajouter une raie fine (atome)">
                            + Raie fine
                        </button>
                        <button class="button is-small is-link is-light py-0 px-2 add-line" data-track="${idx}" data-width="35" style="height: 22px; font-size: 0.72rem;" title="Ajouter une bande large (molécule ou solution colorée)">
                            + Bande large
                        </button>
                    </div>
                </div>
                <div class="lines-list">
                    ${itemsHtml || '<p class="is-size-7 has-text-grey-light has-text-centered py-2">Aucune raie. Choisissez un modèle dans le catalogue ou cliquez sur "+ Raie".</p>'}
                </div>
            </div>
        `;
    }

    const thermalHtml = isThermal ? `
        <div class="mt-2 p-2" style="background: #fff8f0; border-radius: 4px; border: 1px solid #fae5d3;">
            <div class="is-flex is-justify-content-space-between is-align-items-center mb-1">
                <span class="is-size-7 has-text-weight-bold" style="color: #d35400;"><i class="fas fa-temperature-high"></i> Température :</span>
                <div class="is-flex is-align-items-center" style="gap: 6px;">
                    <input class="input is-small track-temp-num" data-track="${idx}" type="number" step="100" min="1500" max="12000" value="${track.temp}" style="width: 70px; height: 24px; text-align: right;">
                    <span class="is-size-7 has-text-weight-bold">K</span>
                    <label class="checkbox is-size-7 ml-2" title="Afficher la température sous le titre">
                        <input type="checkbox" class="track-temp-badge" data-track="${idx}" ${track.showTempBadge ? 'checked' : ''}> Légende
                    </label>
                </div>
            </div>
            <input type="range" class="track-temp-range" data-track="${idx}" min="1500" max="12000" step="50" value="${track.temp}" style="width: 100%;">
            <div class="is-flex is-justify-content-between mt-1" style="gap: 4px;">
                <button class="button is-white is-small temp-quick" data-track="${idx}" data-temp="2200" style="flex:1; font-size: 0.65rem; height: 20px; padding: 0;">Lampe 2200K</button>
                <button class="button is-white is-small temp-quick" data-track="${idx}" data-temp="3500" style="flex:1; font-size: 0.65rem; height: 20px; padding: 0;">3500K</button>
                <button class="button is-white is-small temp-quick" data-track="${idx}" data-temp="5800" style="flex:1; font-size: 0.65rem; height: 20px; padding: 0;">Soleil 5800K</button>
                <button class="button is-white is-small temp-quick" data-track="${idx}" data-temp="9500" style="flex:1; font-size: 0.65rem; height: 20px; padding: 0;">Sirius 9500K</button>
            </div>
        </div>
    ` : '';

    editorContainer.innerHTML = `
        <div style="${track.active ? '' : 'opacity: 0.55;'}">
            <div class="control-row">
                <label class="label" style="width: 52px;">Titre</label>
                <input class="input is-small track-name" data-track="${idx}" type="text" value="${track.name}" style="flex: 1;">
                <button class="button is-small is-white px-2 ml-1 toggle-track-name" data-track="${idx}" title="Afficher/Masquer le titre à gauche du spectre">
                    <span class="icon is-small"><i class="fas ${track.showName ? 'fa-eye' : 'fa-eye-slash has-text-grey-light'}"></i></span>
                </button>
            </div>
            <div class="control-row mb-0">
                <label class="label" style="width: 52px;">Nature</label>
                <div class="select is-small is-fullwidth" style="flex: 1;">
                    <select class="track-mode" data-track="${idx}">
                        <option value="thermal" ${track.mode === 'thermal' ? 'selected' : ''}>Émission thermique</option>
                        <option value="emission_lines" ${track.mode === 'emission_lines' ? 'selected' : ''}>Émission de raies / bandes</option>
                        <option value="absorption_lines" ${track.mode === 'absorption_lines' ? 'selected' : ''}>Absorption sur fond continu</option>
                        <option value="thermal_abs" ${track.mode === 'thermal_abs' ? 'selected' : ''}>Thermique + Absorption</option>
                    </select>
                </div>
            </div>
            ${thermalHtml}
            ${linesHtml}
        </div>
    `;
}

// --- Événements de la barre de Zoom ---
const dualRangeWrap = document.querySelector('.dual-range-wrapper');
const minSliderEl = document.getElementById('zoomMinSlider');
const maxSliderEl = document.getElementById('zoomMaxSlider');

if (dualRangeWrap) {
    dualRangeWrap.addEventListener('pointermove', (e) => {
        if (isDraggingZoomSlider) return;
        const rect = dualRangeWrap.getBoundingClientRect();
        if (rect.width <= 0) return;
        const pct = (e.clientX - rect.left) / rect.width;
        const valUnderMouse = ABS_MIN_NM + pct * (ABS_MAX_NM - ABS_MIN_NM);
        const distMin = Math.abs(valUnderMouse - state.viewMinNm);
        const distMax = Math.abs(valUnderMouse - state.viewMaxNm);
        if (distMin < distMax) {
            minSliderEl.style.zIndex = '5';
            maxSliderEl.style.zIndex = '4';
        } else {
            minSliderEl.style.zIndex = '4';
            maxSliderEl.style.zIndex = '5';
        }
    });
}

if (minSliderEl && maxSliderEl) {
    minSliderEl.addEventListener('pointerdown', () => {
        isDraggingZoomSlider = true;
        minSliderEl.style.zIndex = '6';
        maxSliderEl.style.zIndex = '4';
    });
    maxSliderEl.addEventListener('pointerdown', () => {
        isDraggingZoomSlider = true;
        minSliderEl.style.zIndex = '4';
        maxSliderEl.style.zIndex = '6';
    });
    window.addEventListener('pointerup', () => { isDraggingZoomSlider = false; });
    window.addEventListener('pointercancel', () => { isDraggingZoomSlider = false; });

    minSliderEl.addEventListener('input', (e) => {
        minSliderEl.style.zIndex = '6';
        maxSliderEl.style.zIndex = '4';
        const val = parseFloat(e.target.value);
        setZoomRange(Math.min(val, state.viewMaxNm - 3), state.viewMaxNm);
    });

    maxSliderEl.addEventListener('input', (e) => {
        minSliderEl.style.zIndex = '4';
        maxSliderEl.style.zIndex = '6';
        const val = parseFloat(e.target.value);
        setZoomRange(state.viewMinNm, Math.max(val, state.viewMinNm + 3));
    });
}

const zoomMinInput = document.getElementById('zoomMinInput');
if (zoomMinInput) {
    zoomMinInput.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            setZoomRange(val, state.viewMaxNm, true);
        } else {
            syncZoomUI();
        }
    });
}

const zoomMaxInput = document.getElementById('zoomMaxInput');
if (zoomMaxInput) {
    zoomMaxInput.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            setZoomRange(state.viewMinNm, val, true);
        } else {
            syncZoomUI();
        }
    });
}

document.querySelectorAll('.zoom-preset').forEach(btn => {
    btn.addEventListener('click', () => {
        const zMin = parseFloat(btn.dataset.min);
        const zMax = parseFloat(btn.dataset.max);
        setZoomRange(zMin, zMax, true);
    });
});

// --- Gestion des clics sur la barre d'onglets ---
const tracksTabsContainer = document.getElementById('tracksTabsContainer');
if (tracksTabsContainer) {
    tracksTabsContainer.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.toggle-track-tab');
        if (checkbox) {
            const tIdx = parseInt(checkbox.dataset.track);
            state.tracks[tIdx].active = checkbox.checked;
            selectedTabIndex = tIdx;
            buildTracksUI();
            updateCanvasDimensions();
            render();
            return;
        }

        const tab = e.target.closest('.spec-tab');
        if (tab) {
            selectedTabIndex = parseInt(tab.dataset.tab);
            buildTracksUI();
        }
    });
}

// --- Événements délégués du panneau du spectre actif ---
const activeTrackContainer = document.getElementById('activeTrackContainer');

if (activeTrackContainer) {
    activeTrackContainer.addEventListener('input', (e) => {
        const t = e.target;
        const tIdx = parseInt(t.dataset.track);
        const lIdx = parseInt(t.dataset.line);

        if (t.classList.contains('track-name')) {
            state.tracks[tIdx].name = t.value;
            updateCanvasDimensions();
            render();
        } else if (t.classList.contains('track-temp-range')) {
            const parsed = parseInt(t.value);
            const val = Number.isFinite(parsed) ? Math.max(TEMP_MIN_K, Math.min(TEMP_MAX_K, parsed)) : TEMP_DEFAULT_K;
            state.tracks[tIdx].temp = val;
            const numInput = activeTrackContainer.querySelector(`.track-temp-num[data-track="${tIdx}"]`);
            if (numInput) numInput.value = val;
            scheduleRender();
        } else if (t.classList.contains('track-temp-num')) {
            // Pendant la frappe : on n'applique que les valeurs valides, sans réécrire le champ
            const val = parseInt(t.value);
            if (Number.isFinite(val) && val >= TEMP_MIN_K && val <= TEMP_MAX_K) {
                state.tracks[tIdx].temp = val;
                const rangeInput = activeTrackContainer.querySelector(`.track-temp-range[data-track="${tIdx}"]`);
                if (rangeInput) rangeInput.value = val;
                scheduleRender();
            }
        } else if (t.classList.contains('line-lambda')) {
            // Pendant la frappe : seules les valeurs dans la plage affichable sont appliquées
            const val = parseFloat(t.value);
            if (Number.isFinite(val) && val >= ABS_MIN_NM && val <= ABS_MAX_NM) {
                state.tracks[tIdx].lines[lIdx].lambda = val;
                scheduleRender();
            }
        } else if (t.classList.contains('line-width')) {
            const val = parseFloat(t.value);
            if (!isNaN(val) && val > 0) {
                state.tracks[tIdx].lines[lIdx].w = val;
                scheduleRender();
            }
        } else if (t.classList.contains('line-label')) {
            state.tracks[tIdx].lines[lIdx].label = t.value;
            scheduleRender();
        }
    });

    activeTrackContainer.addEventListener('change', (e) => {
        const t = e.target;
        const tIdx = parseInt(t.dataset.track);

        // Validation finale à la fin de la saisie : recadrage ou restauration de la dernière valeur valide
        if (t.classList.contains('track-temp-num')) {
            const parsed = parseInt(t.value);
            const val = Number.isFinite(parsed)
                ? Math.max(TEMP_MIN_K, Math.min(TEMP_MAX_K, parsed))
                : state.tracks[tIdx].temp;
            state.tracks[tIdx].temp = val;
            t.value = val;
            const rangeInput = activeTrackContainer.querySelector(`.track-temp-range[data-track="${tIdx}"]`);
            if (rangeInput) rangeInput.value = val;
            scheduleRender();
            return;
        }
        if (t.classList.contains('line-lambda')) {
            const lIdx = parseInt(t.dataset.line);
            const line = state.tracks[tIdx].lines[lIdx];
            const parsed = parseFloat(t.value);
            const val = Number.isFinite(parsed)
                ? Math.max(ABS_MIN_NM, Math.min(ABS_MAX_NM, parsed))
                : line.lambda;
            line.lambda = val;
            t.value = val;
            scheduleRender();
            return;
        }

        if (t.classList.contains('track-mode')) {
            state.tracks[tIdx].mode = t.value;
            if (t.value !== 'thermal' && state.tracks[tIdx].lines.length === 0) {
                state.tracks[tIdx].lines = JSON.parse(JSON.stringify(PRESETS_DB.H.lines));
                state.tracks[tIdx].presetKey = "H";
            }
            buildTracksUI();
            updateCanvasDimensions();
            render();
        } else if (t.classList.contains('preset-select')) {
            applyPreset(tIdx, t.value);
        } else if (t.classList.contains('track-temp-badge')) {
            state.tracks[tIdx].showTempBadge = t.checked;
            updateCanvasDimensions();
            render();
        }
    });

    activeTrackContainer.addEventListener('click', (e) => {
        const dropdownBtn = e.target.closest('.preset-dropdown-btn');
        const presetItem = e.target.closest('.preset-item');

        if (dropdownBtn) {
            e.stopPropagation();
            const dropdown = document.getElementById('presets-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('is-active');
            }
            return;
        }

        if (presetItem) {
            e.preventDefault();
            const tIdx = parseInt(presetItem.dataset.track);
            const key = presetItem.dataset.key;
            applyPreset(tIdx, key);
            return;
        }

        const clearBtn = e.target.closest('.clear-lines-btn');
        const addBtn = e.target.closest('.add-line');
        const removeBtn = e.target.closest('.remove-line');
        const toggleNameBtn = e.target.closest('.toggle-track-name');
        const tempQuickBtn = e.target.closest('.temp-quick');

        if (clearBtn) {
            const tIdx = parseInt(clearBtn.dataset.track);
            state.tracks[tIdx].lines = [];
            state.tracks[tIdx].presetKey = "";
            buildTracksUI();
            render();
        } else if (addBtn) {
            const tIdx = parseInt(addBtn.dataset.track);
            const w = parseFloat(addBtn.dataset.width) || 2.0;
            const centerNm = Math.round(((state.viewMinNm + state.viewMaxNm) / 2) * 2) / 2;
            state.tracks[tIdx].lines.push({
                lambda: centerNm,
                w: w,
                intensity: 1.0,
                label: w > 10 ? "Bande" : ""
            });
            buildTracksUI();
            render();
        } else if (removeBtn) {
            const tIdx = parseInt(removeBtn.dataset.track);
            const lIdx = parseInt(removeBtn.dataset.line);
            state.tracks[tIdx].lines.splice(lIdx, 1);
            buildTracksUI();
            render();
        } else if (toggleNameBtn) {
            const tIdx = parseInt(toggleNameBtn.dataset.track);
            state.tracks[tIdx].showName = !state.tracks[tIdx].showName;
            buildTracksUI();
            updateCanvasDimensions();
            render();
        } else if (tempQuickBtn) {
            const tIdx = parseInt(tempQuickBtn.dataset.track);
            const temp = parseInt(tempQuickBtn.dataset.temp);
            state.tracks[tIdx].temp = temp;
            buildTracksUI();
            updateCanvasDimensions();
            render();
        }
    });
}

// Fermeture du dropdown lors d'un clic extérieur ou appui sur Échap
window.addEventListener('click', (e) => {
    const dropdown = document.getElementById('presets-dropdown');
    if (!dropdown || !dropdown.classList.contains('is-active')) return;
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-active');
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const dropdown = document.getElementById('presets-dropdown');
        if (dropdown) dropdown.classList.remove('is-active');
    }
});

// --- Événements des contrôles globaux ---
const specWidthInput = document.getElementById('specWidthInput');
if (specWidthInput) {
    specWidthInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 250 && val <= 1400) {
            state.specWidth = val;
            updateCanvasDimensions();
            render();
        }
    });
}

const bandHeightInput = document.getElementById('bandHeightInput');
if (bandHeightInput) {
    bandHeightInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 10 && val <= 200) {
            state.bandHeight = val;
            updateCanvasDimensions();
            render();
        }
    });
}

const toggleAxis = document.getElementById('toggleAxis');
if (toggleAxis) {
    toggleAxis.addEventListener('change', (e) => {
        state.showAxis = e.target.checked;
        updateCanvasDimensions();
        render();
    });
}

const toggleUVIR = document.getElementById('toggleUVIR');
if (toggleUVIR) {
    toggleUVIR.addEventListener('change', (e) => {
        state.showUVIR = e.target.checked;
        if (state.showUVIR && state.viewMinNm === LAMBDA_MIN_VISIBLE && state.viewMaxNm === LAMBDA_MAX_VISIBLE) {
            setZoomRange(ABS_MIN_NM, ABS_MAX_NM);
        } else if (!state.showUVIR && state.viewMinNm === ABS_MIN_NM && state.viewMaxNm === ABS_MAX_NM) {
            setZoomRange(LAMBDA_MIN_VISIBLE, LAMBDA_MAX_VISIBLE);
        } else {
            updateCanvasDimensions();
            render();
        }
    });
}

const toggleLineValues = document.getElementById('toggleLineValues');
if (toggleLineValues) {
    toggleLineValues.addEventListener('change', (e) => {
        state.showLineValues = e.target.checked;
        updateCanvasDimensions();
        render();
    });
}

const toggleProfile = document.getElementById('toggleProfile');
if (toggleProfile) {
    toggleProfile.addEventListener('change', (e) => {
        state.showProfile = e.target.checked;
        updateCanvasDimensions();
        render();
    });
}

const togglePrintMode = document.getElementById('togglePrintMode');
if (togglePrintMode) {
    togglePrintMode.addEventListener('change', (e) => {
        state.printMode = e.target.checked;
        render();
    });
}

const toggleExaggerated = document.getElementById('toggleExaggerated');
if (toggleExaggerated) {
    toggleExaggerated.addEventListener('change', (e) => {
        state.exaggerated = e.target.checked;
        const sharpnessRow = document.getElementById('sharpnessRow');
        if (sharpnessRow) {
            sharpnessRow.style.opacity = state.exaggerated ? '1' : '0.4';
            sharpnessRow.style.pointerEvents = state.exaggerated ? 'auto' : 'none';
        }
        render();
    });
}

const exaggerationSharpness = document.getElementById('exaggerationSharpness');
if (exaggerationSharpness) {
    exaggerationSharpness.addEventListener('input', (e) => {
        state.sharpness = parseInt(e.target.value) || 7;
        const sharpnessVal = document.getElementById('sharpnessVal');
        if (sharpnessVal) sharpnessVal.textContent = `${state.sharpness}/10`;
        render();
    });
}

window.addEventListener('resize', () => {
    updateCanvasDimensions();
    render();
});

// --- Interaction Pointeur (Glisser-déposer des raies, Panoramique et Molette de Zoom) ---
export function getHoveredLine(mouseX, mouseY) {
    const geom = getLayoutGeometry();
    let currentY = geom.topMargin;

    for (let aIdx = 0; aIdx < geom.activeTracks.length; aIdx++) {
        const track = geom.activeTracks[aIdx];
        const bandY = currentY;
        const bandH = state.bandHeight;

        if (track.mode !== 'thermal' && mouseY >= bandY - 5 && mouseY <= bandY + bandH + 5) {
            let bestMatch = null;
            let minDistance = Infinity;

            for (let lIdx = 0; lIdx < track.lines.length; lIdx++) {
                const line = track.lines[lIdx];
                if (line.lambda < geom.minNm || line.lambda > geom.maxNm) continue;
                const lx = geom.nmToX(line.lambda);
                const effectiveW = getEffectiveLineWidth(line.w, geom.spanNm);
                const tolPx = Math.max(6, (effectiveW / geom.spanNm) * geom.totalBarWidth * 0.5 + 4);
                const dist = Math.abs(mouseX - lx);

                if (dist <= tolPx && dist < minDistance) {
                    minDistance = dist;
                    bestMatch = { trackIndex: track.index, lineIndex: lIdx };
                }
            }

            if (bestMatch) {
                return bestMatch;
            }
        }

        if (aIdx === 0 && state.showProfile) {
            currentY += 68 + 14;
        }
        currentY += bandH + geom.trackGap;
    }
    return null;
}

if (canvas) {
    canvas.addEventListener('wheel', (e) => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const mouseX = (e.clientX - rect.left) * (logicalWidth / rect.width);
        const geom = getLayoutGeometry();

        // Ne pas bloquer le défilement de la page si le curseur est en dehors de la bande spectrale
        if (mouseX < geom.leftMargin || mouseX > geom.leftMargin + geom.totalBarWidth) return;
        if (e.deltaY === 0) return;

        e.preventDefault();

        let dy = e.deltaY;
        if (e.deltaMode === 1) {
            dy *= 33;
        } else if (e.deltaMode === 2) {
            dy *= 800;
        }

        const cursorNm = geom.xToNm(mouseX);
        // Facteur de zoom continu dépendant de deltaY pour compatibilité molette crantée et pavé tactile (touchpad)
        const clampedDy = Math.max(-300, Math.min(300, dy));
        const zoomFactor = Math.pow(1.22, clampedDy / 100);
        const newSpan = Math.max(3, Math.min(ABS_MAX_NM - ABS_MIN_NM, geom.spanNm * zoomFactor));

        const ratio = (cursorNm - geom.minNm) / geom.spanNm;
        let newMin = cursorNm - ratio * newSpan;
        let newMax = newMin + newSpan;

        if (newMin < ABS_MIN_NM) {
            newMin = ABS_MIN_NM;
            newMax = newMin + newSpan;
        }
        if (newMax > ABS_MAX_NM) {
            newMax = ABS_MAX_NM;
            newMin = newMax - newSpan;
        }

        setZoomRange(newMin, newMax);
    }, { passive: false });

    canvas.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (logicalWidth / rect.width);
        const mouseY = (e.clientY - rect.top) * (logicalHeight / rect.height);

        draggedLine = getHoveredLine(mouseX, mouseY);
        if (draggedLine) {
            canvas.style.cursor = 'grabbing';
            if (selectedTabIndex !== draggedLine.trackIndex) {
                selectedTabIndex = draggedLine.trackIndex;
                buildTracksUI();
            }
        } else {
            const geom = getLayoutGeometry();
            if (mouseX >= geom.leftMargin && mouseX <= geom.leftMargin + geom.totalBarWidth) {
                isPanningSpectrum = true;
                panStartX = mouseX;
                panStartMinNm = state.viewMinNm;
                panStartMaxNm = state.viewMaxNm;
                canvas.style.cursor = 'grabbing';
            }
        }
    });

    canvas.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (logicalWidth / rect.width);
        const mouseY = (e.clientY - rect.top) * (logicalHeight / rect.height);

        if (draggedLine) {
            canvas.style.cursor = 'grabbing';
            const geom = getLayoutGeometry();
            const rawNm = geom.xToNm(mouseX);
            const stepRound = geom.spanNm < 30 ? 10 : 2;
            const clampedNm = Math.max(geom.minNm, Math.min(geom.maxNm, Math.round(rawNm * stepRound) / stepRound));

            state.tracks[draggedLine.trackIndex].lines[draggedLine.lineIndex].lambda = clampedNm;

            const inputEl = document.getElementById(`lambda-input-${draggedLine.trackIndex}-${draggedLine.lineIndex}`);
            if (inputEl) inputEl.value = clampedNm;

            scheduleRender();
        } else if (isPanningSpectrum) {
            const geom = getLayoutGeometry();
            const dxPx = mouseX - panStartX;
            const span = panStartMaxNm - panStartMinNm;
            const dNm = -(dxPx / geom.totalBarWidth) * span;

            let newMin = panStartMinNm + dNm;
            let newMax = panStartMaxNm + dNm;

            if (newMin < ABS_MIN_NM) {
                newMin = ABS_MIN_NM;
                newMax = newMin + span;
            }
            if (newMax > ABS_MAX_NM) {
                newMax = ABS_MAX_NM;
                newMin = newMax - span;
            }
            setZoomRange(newMin, newMax);
        } else {
            const newHover = getHoveredLine(mouseX, mouseY);
            const changed = JSON.stringify(newHover) !== JSON.stringify(hoveredLine);
            hoveredLine = newHover;
            canvas.style.cursor = hoveredLine ? 'ew-resize' : 'grab';
            if (changed) scheduleRender();
        }
    });

    const endPointerAction = (e) => {
        if (e && canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
        }
        if (draggedLine) {
            state.tracks[draggedLine.trackIndex].lines.sort((a, b) => a.lambda - b.lambda);
            buildTracksUI();
        }
        draggedLine = null;
        isPanningSpectrum = false;
        canvas.style.cursor = hoveredLine ? 'ew-resize' : 'grab';
        render();
    };

    canvas.addEventListener('pointerup', endPointerAction);
    canvas.addEventListener('pointercancel', endPointerAction);
    canvas.addEventListener('pointerleave', () => {
        if (!draggedLine && !isPanningSpectrum && hoveredLine) {
            hoveredLine = null;
            canvas.style.cursor = 'default';
            render();
        }
    });
}

// --- Fonctions d'Export HD et Réinitialisation ---
export function withHDExport(exportAction) {
    isExportingHD = true;
    const savedScale = currentScale;
    currentScale = EXPORT_SCALE;
    updateCanvasDimensions();
    render();
    exportAction();
    currentScale = savedScale;
    isExportingHD = false;
    updateCanvasDimensions();
    render();
}

export function copyToClipboard(successMsg = "Spectre HD copié dans le presse-papier !") {
    if (!navigator.clipboard || !navigator.clipboard.write || typeof ClipboardItem === "undefined") {
        window.showToast("Presse-papier inaccessible dans ce contexte. Utilisez le bouton 'PNG'.", "is-warning");
        return;
    }

    let dataUrl;
    withHDExport(() => {
        dataUrl = canvas.toDataURL("image/png");
    });

    const blobPromise = fetch(dataUrl).then(res => res.blob());
    const item = new ClipboardItem({ "image/png": blobPromise });

    navigator.clipboard.write([item])
        .then(() => window.showToast(successMsg, "is-success"))
        .catch(() => window.showToast("Erreur lors de la copie. Utilisez le bouton 'PNG'.", "is-danger"));
}

export function copyEmptyGrid() {
    isExportingEmptyGrid = true;
    copyToClipboard("Cadre vierge gradué copié !");
    isExportingEmptyGrid = false;
    render();
}

export function downloadImage() {
    withHDExport(() => {
        const link = document.createElement('a');
        link.download = 'spectre_HD.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}

export function downloadEmptyGrid() {
    isExportingEmptyGrid = true;
    withHDExport(() => {
        const link = document.createElement('a');
        link.download = 'spectre_cadre_vierge_HD.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
    isExportingEmptyGrid = false;
    render();
}

export function resetApplet() {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    selectedTabIndex = 0;
    const specWidthEl = document.getElementById('specWidthInput');
    if (specWidthEl) specWidthEl.value = state.specWidth;
    const bandHeightEl = document.getElementById('bandHeightInput');
    if (bandHeightEl) bandHeightEl.value = state.bandHeight;
    const toggleAxisEl = document.getElementById('toggleAxis');
    if (toggleAxisEl) toggleAxisEl.checked = state.showAxis;
    const toggleUVIREl = document.getElementById('toggleUVIR');
    if (toggleUVIREl) toggleUVIREl.checked = state.showUVIR;
    const toggleLineValuesEl = document.getElementById('toggleLineValues');
    if (toggleLineValuesEl) toggleLineValuesEl.checked = state.showLineValues;
    const toggleProfileEl = document.getElementById('toggleProfile');
    if (toggleProfileEl) toggleProfileEl.checked = state.showProfile;
    const togglePrintModeEl = document.getElementById('togglePrintMode');
    if (togglePrintModeEl) togglePrintModeEl.checked = state.printMode;
    const toggleExaggeratedEl = document.getElementById('toggleExaggerated');
    if (toggleExaggeratedEl) toggleExaggeratedEl.checked = state.exaggerated;
    const exaggerationSharpnessEl = document.getElementById('exaggerationSharpness');
    if (exaggerationSharpnessEl) exaggerationSharpnessEl.value = state.sharpness;
    const sharpnessValEl = document.getElementById('sharpnessVal');
    if (sharpnessValEl) sharpnessValEl.textContent = `${state.sharpness}/10`;
    const sharpnessRowEl = document.getElementById('sharpnessRow');
    if (sharpnessRowEl) {
        sharpnessRowEl.style.opacity = state.exaggerated ? '1' : '0.4';
        sharpnessRowEl.style.pointerEvents = state.exaggerated ? 'auto' : 'none';
    }

    syncZoomUI();
    buildTracksUI();
    updateCanvasDimensions();
    render();
}

// Lier aux boutons et à window pour compatibilité
window.copyToClipboard = copyToClipboard;
window.copyEmptyGrid = copyEmptyGrid;
window.downloadImage = downloadImage;
window.downloadEmptyGrid = downloadEmptyGrid;
window.resetApplet = resetApplet;

// Câblage direct des boutons d'export et reset
const btnCopyHD = document.getElementById('btnCopyHD');
if (btnCopyHD) btnCopyHD.addEventListener('click', () => copyToClipboard());
const btnDownloadHD = document.getElementById('btnDownloadHD');
if (btnDownloadHD) btnDownloadHD.addEventListener('click', () => downloadImage());
const btnCopyEmpty = document.getElementById('btnCopyEmpty');
if (btnCopyEmpty) btnCopyEmpty.addEventListener('click', () => copyEmptyGrid());
const btnDownloadEmpty = document.getElementById('btnDownloadEmpty');
if (btnDownloadEmpty) btnDownloadEmpty.addEventListener('click', () => downloadEmptyGrid());
const btnResetApplet = document.getElementById('btnResetApplet');
if (btnResetApplet) btnResetApplet.addEventListener('click', () => resetApplet());

// Initialisation au chargement
if (toggleExaggerated) toggleExaggerated.checked = state.exaggerated;
const sharpnessRow = document.getElementById('sharpnessRow');
if (sharpnessRow) {
    sharpnessRow.style.opacity = state.exaggerated ? '1' : '0.4';
    sharpnessRow.style.pointerEvents = state.exaggerated ? 'auto' : 'none';
}
syncZoomUI();
buildTracksUI();
updateCanvasDimensions();
render();

export { state, selectedTabIndex };
