import { Curve, Model, COLOR_LIST } from '../data.js';
import { sanitizeSymbol, sanitizeUnit, updateFormulasReferences } from './formulaUtils.js';

/**
 * Génère le contenu JSON pour un fichier de session .pw (version 3.0).
 * @param {object} app
 * @returns {string}
 */
export function generatePW(app) {
  const dataToSave = {
    curves: app.data.curves.map(curve => ({
      title: curve.title,
      unit: curve.unit,
      color: curve.color,
      line: curve.line,
      markers: curve.markers,
      lineWidth: curve.lineWidth,
      lineStyle: curve.lineStyle,
      markerSymbol: curve.markerSymbol,
      markerRadius: curve.markerRadius,
      type: curve.type,
      values: Array.from(curve)
    })),

    parameters: app.data.parameters,

    models: app.data.models.map(m => ({
      id: m.id,
      xTitle: m.x.title,
      yTitle: m.y.title,
      type: m.type,
      visible: m.visible,
      color: m.color,
      lineWidth: m.lineWidth,
      lineStyle: m.lineStyle,
      minX: m.minX,
      maxX: m.maxX,
      parameters: m.parameters,
      rmse: m.rmse,
      rSquared: m.rSquared,
    })),

    annotations: app.data.annotations ?? [],
  };

  const yCurves = app.grapher?.chart?.series
    ? app.grapher.chart.series
        .filter(s => !s.options?.id?.startsWith('model-') && s.visible !== false)
        .map(s => s.name)
    : [];

  let zoomState = null;
  if (app.grapher.chart) {
    const xEx = app.grapher.chart.xAxis[0].getExtremes();
    const yEx = app.grapher.chart.yAxis[0].getExtremes();
    const hasUserZoom = app.grapher.hasUserZoom;
    zoomState = {
      xUserMin: hasUserZoom && xEx.userMin !== undefined ? xEx.userMin : null,
      xUserMax: hasUserZoom && xEx.userMax !== undefined ? xEx.userMax : null,
      yUserMin: hasUserZoom && yEx.userMin !== undefined ? yEx.userMin : null,
      yUserMax: hasUserZoom && yEx.userMax !== undefined ? yEx.userMax : null
    };
  }

  const state = {
    version: "3.0",
    data: dataToSave,
    calculations: app.editor.getValue(),
    calculation: {
      angleUnit: app.calculation?.angleUnit === 'deg' ? 'deg' : 'rad'
    },
    grapher: {
      xCurve: app.grapher.currentXCurve,
      yCurves: yCurves,
      zoom: zoomState,
      orthonormal: Boolean(app.grapher.orthonormal)
    },
    sort: {
      lastSortVariable: app.data.lastSortVariable ?? null,
    },
  };

  return JSON.stringify(state, null, 2);
}

/**
 * Parse une entrée .pw (chaîne JSON éventuellement précédée d'un BOM UTF-8, ou objet direct).
 * @param {string|object} pwInput
 * @returns {object}
 */
export function parsePWInput(pwInput) {
  if (typeof pwInput === 'string') {
    const cleanData = pwInput.replace(/^\uFEFF/, '').trim();
    if (!cleanData) {
      throw new Error("Fichier PW invalide : contenu vide.");
    }
    return JSON.parse(cleanData);
  }
  if (pwInput && typeof pwInput === 'object' && !Array.isArray(pwInput)) {
    return pwInput;
  }
  throw new Error("Fichier PW invalide : format d'entrée incorrect.");
}

/**
 * Valide la structure minimale d'un état .pw avant de modifier ou réinitialiser la session active.
 * @param {object} state
 */
export function validatePWState(state) {
  if (
    !state ||
    typeof state !== 'object' ||
    Array.isArray(state) ||
    !state.data ||
    typeof state.data !== 'object' ||
    Array.isArray(state.data) ||
    !Array.isArray(state.data.curves)
  ) {
    throw new Error("Fichier PW invalide : données de courbes manquantes.");
  }
  if (state.data.curves.some(curve => !curve || typeof curve !== 'object' || Array.isArray(curve))) {
    throw new Error("Fichier PW invalide : format de courbe incorrect.");
  }
  if (
    state.data.parameters !== undefined &&
    state.data.parameters !== null &&
    (typeof state.data.parameters !== 'object' || Array.isArray(state.data.parameters))
  ) {
    throw new Error("Fichier PW invalide : format de paramètres incorrect.");
  }
  if (state.data.models !== undefined && state.data.models !== null && !Array.isArray(state.data.models)) {
    throw new Error("Fichier PW invalide : format de modèles incorrect.");
  }
  if (state.data.annotations !== undefined && state.data.annotations !== null && !Array.isArray(state.data.annotations)) {
    throw new Error("Fichier PW invalide : format d'annotations incorrect.");
  }
}

/**
 * Restaure un état .pw validé dans l'application.
 * @param {object} app
 * @param {object} state
 */
export async function restorePWState(app, state) {
  validatePWState(state);

  const existingSymbols = new Set();
  const nameMap = {};

  app.data.curves = [];
  state.data.curves.forEach((savedCurve, index) => {
    const oldTitle = savedCurve.title || `Courbe ${index + 1}`;
    const newTitle = sanitizeSymbol(oldTitle, existingSymbols);
    if (oldTitle !== newTitle) nameMap[oldTitle] = newTitle;

    let curveColor = savedCurve.color;
    if (!curveColor || typeof curveColor !== 'string') {
      curveColor = COLOR_LIST.find(c => !app.data.curves.some(curve => curve.color === c));
      if (!curveColor) {
        curveColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        console.warn('No COLORLIST available, using random color for', newTitle);
      }
    }

    const sanitizedUnit = sanitizeUnit(savedCurve.unit);
    const newCurve = new Curve(
      newTitle,
      sanitizedUnit,
      curveColor,
      savedCurve.line,
      savedCurve.markers,
      savedCurve.lineWidth,
      savedCurve.lineStyle,
      savedCurve.markerSymbol,
      savedCurve.markerRadius
    );
    if (savedCurve.type !== undefined) {
      newCurve.type = savedCurve.type;
    }

    if (Array.isArray(savedCurve.values)) {
      savedCurve.values.forEach(val => {
        if (typeof val === 'number' && Number.isFinite(val)) {
          newCurve.push(val);
        } else if (typeof val === 'string' && val.trim() !== '' && Number.isFinite(Number(val))) {
          newCurve.push(Number(val));
        } else {
          newCurve.push(null);
        }
      });
    } else {
      console.error('Invalid values array:', savedCurve.values);
    }

    app.data.curves.push(newCurve);
  });

  // Restauration des paramètres
  app.data.parameters = {};
  if (state.data.parameters) {
    for (const [oldName, paramObj] of Object.entries(state.data.parameters)) {
      const newName = sanitizeSymbol(oldName, existingSymbols);
      if (oldName !== newName) nameMap[oldName] = newName;
      app.data.parameters[newName] = paramObj;
    }
  }

  // Restauration des modèles sans recalcul
  if (Array.isArray(state.data.models)) {
    for (const savedModel of state.data.models) {
      const updatedXTitle = nameMap[savedModel.xTitle] || savedModel.xTitle;
      const updatedYTitle = nameMap[savedModel.yTitle] || savedModel.yTitle;

      const xCurve = app.data.getCurveByTitle(updatedXTitle);
      const yCurve = app.data.getCurveByTitle(updatedYTitle);

      if (!xCurve || !yCurve) {
        console.warn(`Modèle pour "${savedModel.yTitle}" ignoré car les courbes sont introuvables.`);
        continue;
      }

      const model = new Model(xCurve, yCurve, savedModel.type, app.data);

      Object.assign(model, savedModel);
      model.minX = savedModel.minX ?? savedModel.bornedebut ?? null;
      model.maxX = savedModel.maxX ?? savedModel.bornefin ?? null;

      if (Array.isArray(savedModel.parameters)) {
        model.parameters = savedModel.parameters.map(p => {
          const pName = nameMap[p.name] || p.name;
          if (!app.data.parameters[pName]) {
            const pUnit = p.unit || '';
            app.data.parameters[pName] = { value: p.value, unit: pUnit, type: 'model' };
          }
          const finalUnit = p.unit || app.data.parameters[pName]?.unit || '';
          return {
            name: pName,
            value: p.value,
            ...(finalUnit ? { unit: finalUnit } : (p.unit !== undefined ? { unit: p.unit } : {}))
          };
        });
      }

      app.data.models.push(model);
      app.grapher.addModelSeries(model);
      app.uiManager.createModelPanel(model.id);
    }
  }

  // Restauration des calculs et annotations
  if (app.calculation) {
    app.calculation.angleUnit = state.calculation?.angleUnit === 'deg' ? 'deg' : 'rad';
  }
  let calculationsText = state.calculations ?? "";
  calculationsText = updateFormulasReferences(calculationsText, nameMap);
  app.editor.setValue(calculationsText);
  app.data.annotations = (state.data.annotations ?? []).map(ann => {
    if (!ann || typeof ann !== 'object') return ann;
    const updated = { ...ann };
    if (updated.type === 'tangent-method' && updated.seriesName && nameMap[updated.seriesName]) {
      updated.seriesName = nameMap[updated.seriesName];
    }
    if (updated.xCurve && nameMap[updated.xCurve]) {
      updated.xCurve = nameMap[updated.xCurve];
    }
    return updated;
  });
  app.uiManager.updateClearAnnotationsButtonVisibility();

  // Restauration du graphique (abscisse, courbes affichées et visibilité)
  const existingTitles = app.data.curves.map(c => c.title);
  const rawXCurve = state.grapher?.xCurve;
  const mappedXCurve = rawXCurve ? (nameMap[rawXCurve] || rawXCurve) : null;

  const chosenX = (mappedXCurve && existingTitles.includes(mappedXCurve))
    ? mappedXCurve
    : (app.data.curves.find(c => c.type === 'x')?.title || existingTitles[0] || null);

  if (chosenX) {
    app.grapher.setXCurve(chosenX, false);
  }

  app.grapher.updateChart();

  if (Array.isArray(state.grapher?.yCurves)) {
    const mappedYCurves = state.grapher.yCurves.map(y => nameMap[y] || y);
    const validYCurves = mappedYCurves.filter(y => existingTitles.includes(y));
    if (mappedYCurves.length === 0 || validYCurves.length > 0) {
      app.grapher.setVisibilityFromList(mappedYCurves);
    }
  }

  if (state.sort && state.sort.lastSortVariable) {
    app.data.lastSortVariable = nameMap[state.sort.lastSortVariable] || state.sort.lastSortVariable;
  }

  // Finalisation UI
  app.spreadsheet.focusFirstCell(false);
  app.spreadsheet.update();
  app.uiManager.updateCalculationUI();
  app.uiManager.updateAllModelPanelVisibilityIcons();
  app.uiManager.updateRecalculateButtonVisibility();
  app.uiManager.updateSortUI();
  app.uiManager.updateXAxisSelector();
  app.grapher.updateModelVisibility();
  app.grapher.reorderLegendByVisibility();

  // Restauration du mode repère orthonormé (1:1)
  app.grapher.orthonormal = Boolean(state.grapher?.orthonormal);
  app.grapher.updateOrthonormalButtonUI?.();

  // Restauration de l'état de Zoom
  const autoZoomBtn = typeof document !== 'undefined' ? document.querySelector("#auto-zoom-button") : null;
  if (state.grapher && state.grapher.zoom) {
    const z = state.grapher.zoom;
    app.grapher.chart.xAxis[0].setExtremes(z.xUserMin ?? null, z.xUserMax ?? null, false);
    app.grapher.chart.yAxis[0].setExtremes(z.yUserMin ?? null, z.yUserMax ?? null, false);

    const hasManualZoom = z.xUserMin !== null || z.xUserMax !== null || z.yUserMin !== null || z.yUserMax !== null;
    if (hasManualZoom) {
      app.grapher.hasUserZoom = true;
      if (autoZoomBtn) autoZoomBtn.classList.remove("is-hidden");
    } else {
      app.grapher.hasUserZoom = false;
      if (autoZoomBtn) autoZoomBtn.classList.add("is-hidden");
      app.uiManager.resetZoomUI();
    }
    if (app.grapher.orthonormal) {
      app.grapher.applyOrthonormalBounds?.(false);
    }
    app.grapher.chart.redraw();
  } else {
    app.grapher.resetZoom();
    if (autoZoomBtn) autoZoomBtn.classList.add("is-hidden");
  }

  console.log("Session .pw (v3.0) restaurée avec succès.");
}
