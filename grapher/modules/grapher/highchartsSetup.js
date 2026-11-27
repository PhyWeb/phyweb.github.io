import { formatNumber, formatUnit } from '../../../common/formatter.js';
import {
  computeAxisExponent,
  formatUnitWithExponent,
  formatAxisLabelWithUnit,
  formatAxisTickValue
} from './axisFormatting.js';

export const ANIMATION_FLAG = false; // Désactiver les animations pour de meilleures performances
export const PADDING = 0.02; // 2% de padding pour le zoom auto
export const ZERO_PLOT_LINE = {
  id: 'zero-line',
  value: 0,
  width: 2,
  color: '#555555',
  zIndex: 2
};
export const GRID_STYLE = {
  majorColor: '#cccccc',
  majorWidth: 1,
  minorColor: '#e8e8e8',
  minorWidth: 0.75,
  minorTickColor: '#999999',
  minorTickWidth: 1,
  minorTickLength: 4
};

/**
 * Calcule des bornes orthonormées (même échelle unités/pixel en X et Y) en élargissant
 * l'axe le plus serré autour de son centre afin de ne jamais rogner les données visibles.
 * Retourne `null` si les axes sont déjà orthonormés (à 1e-6 près) ou invalides.
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} yMin
 * @param {number} yMax
 * @param {number} plotWidth
 * @param {number} plotHeight
 * @returns {{ xMin: number, xMax: number, yMin: number, yMax: number } | null}
 */
export function computeOrthonormalBounds(xMin, xMax, yMin, yMax, plotWidth, plotHeight) {
  if (
    !Number.isFinite(xMin) || !Number.isFinite(xMax) ||
    !Number.isFinite(yMin) || !Number.isFinite(yMax) ||
    !Number.isFinite(plotWidth) || !Number.isFinite(plotHeight) ||
    plotWidth <= 0 || plotHeight <= 0
  ) {
    return null;
  }

  const rangeX = xMax - xMin;
  const rangeY = yMax - yMin;
  if (rangeX <= 0 || rangeY <= 0) return null;

  const scaleX = rangeX / plotWidth;
  const scaleY = rangeY / plotHeight;
  if (Math.abs(scaleX - scaleY) / Math.max(scaleX, scaleY) < 1e-6) {
    return null;
  }

  const scale = Math.max(scaleX, scaleY);
  const targetRangeX = scale * plotWidth;
  const targetRangeY = scale * plotHeight;
  const centerX = (xMin + xMax) / 2;
  const centerY = (yMin + yMax) / 2;

  return {
    xMin: targetRangeX > rangeX ? centerX - targetRangeX / 2 : xMin,
    xMax: targetRangeX > rangeX ? centerX + targetRangeX / 2 : xMax,
    yMin: targetRangeY > rangeY ? centerY - targetRangeY / 2 : yMin,
    yMax: targetRangeY > rangeY ? centerY + targetRangeY / 2 : yMax
  };
}

/**
 * Calcule un pas de graduation partagé (`1, 2, 2.5, 5, 10 × 10^n`) pour garantir
 * des carreaux parfaitement carrés en mode repère orthonormé (1:1).
 * @param {number} scale - Échelle en unités par pixel (`range / plotSize`).
 * @param {number} [targetPixels=80] - Espacement cible entre graduations principales (px).
 * @returns {number | null}
 */
export function computeSharedTickInterval(scale, targetPixels = 80) {
  if (!Number.isFinite(scale) || scale <= 0 || !Number.isFinite(targetPixels) || targetPixels <= 0) {
    return null;
  }
  const raw = scale * targetPixels;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / magnitude;
  const multiples = [1, 2, 2.5, 5, 10];
  let chosen = multiples[multiples.length - 1];
  for (let i = 0; i < multiples.length; i++) {
    chosen = multiples[i];
    if (normalized <= (multiples[i] + (multiples[i + 1] || multiples[i])) / 2) {
      break;
    }
  }
  return Number((chosen * magnitude).toPrecision(12));
}

/**
 * Applique une seule fois les surcharges globales Highcharts (auto-zoom incluant l'origine,
 * symboles SVG `cross` et `crossX`).
 * @param {object} H - L'objet global Highcharts.
 */
export function installHighchartsPatches(H) {
  if (!H || H._phywebGrapherPatched) return;
  H._phywebGrapherPatched = true;

  if (typeof H.wrap === 'function' && H.Axis?.prototype) {
    H.wrap(H.Axis.prototype, 'setExtremes', function (proceed, newMin, newMax, redraw, animation, eventArgs) {
      const chart = this.chart;

      const minIsAuto = newMin === null || newMin === undefined;
      const maxIsAuto = newMax === null || newMax === undefined;
      if ((minIsAuto || maxIsAuto) && chart?.options?.customGrapherInstance) {
        const includeOrigin = !!chart.options.customGrapherInstance.includeOriginOnAutoZoom;

        let globalDataMin = Infinity;
        let globalDataMax = -Infinity;
        const isXAxis = this.isXAxis;
        const axisIndex = this.index;
        const relevantSeries = isXAxis
          ? chart.series.filter(s => s.visible && !s.options.id?.startsWith('model-'))
          : chart.series.filter(s => s.visible && (s.yAxis ? s.yAxis.index === axisIndex : true) && !s.options.id?.startsWith('model-'));

        relevantSeries.forEach(series => {
          const allPoints = series.options.data;
          if (!allPoints || allPoints.length === 0) return;

          const isArrayData = Array.isArray(allPoints[0]);
          allPoints.forEach(pointData => {
            let value;
            if (isArrayData) {
              value = isXAxis ? pointData[0] : pointData[1];
            } else if (pointData && typeof pointData === 'object') {
              value = isXAxis ? pointData.x : pointData.y;
            }

            if (value !== undefined && !isNaN(value) && isFinite(value)) {
              globalDataMin = Math.min(globalDataMin, value);
              globalDataMax = Math.max(globalDataMax, value);
            }
          });
        });

        const hasData = globalDataMin !== Infinity && globalDataMax !== -Infinity;
        if (hasData) {
          let finalMin;
          let finalMax;

          if (includeOrigin) {
            if (globalDataMin >= 0) {
              finalMin = 0;
              const range = globalDataMax - 0;
              finalMax = range > 0 ? globalDataMax + range * PADDING : 1;
            } else if (globalDataMax <= 0) {
              finalMax = 0;
              const range = 0 - globalDataMin;
              finalMin = range > 0 ? globalDataMin - range * PADDING : -1;
            } else {
              const range = globalDataMax - globalDataMin;
              finalMin = globalDataMin - range * PADDING;
              finalMax = globalDataMax + range * PADDING;
            }
          } else {
            const range = globalDataMax - globalDataMin;
            if (range > 0) {
              finalMin = globalDataMin - range * PADDING;
              finalMax = globalDataMax + range * PADDING;
            } else {
              finalMin = globalDataMin - 1;
              finalMax = globalDataMax + 1;
            }
          }

          let targetMin = minIsAuto ? finalMin : newMin;
          let targetMax = maxIsAuto ? finalMax : newMax;

          if (targetMin >= targetMax) {
            if (maxIsAuto) {
              targetMax = targetMin + Math.max(Math.abs(targetMin) * 0.1, 1);
            } else if (minIsAuto) {
              targetMin = targetMax - Math.max(Math.abs(targetMax) * 0.1, 1);
            }
          }

          proceed.call(this, targetMin, targetMax, redraw, animation, eventArgs);
        } else {
          proceed.call(this, minIsAuto ? null : newMin, maxIsAuto ? null : newMax, redraw, animation, eventArgs);
        }
      } else {
        proceed.call(this, newMin, newMax, redraw, animation, eventArgs);
      }
    });
  }

  if (H.SVGRenderer?.prototype?.symbols) {
    // Symbole en forme de croix (+)
    H.SVGRenderer.prototype.symbols.cross = function (x, y, w, h) {
      const size = Math.min(w, h);
      const cx = x + w / 2;
      const cy = y + h / 2;
      const s = size / 2;

      return [
        'M', cx - s, cy,
        'L', cx + s, cy,
        'M', cx, cy - s,
        'L', cx, cy + s
      ];
    };

    // Symbole en forme de croix en X (x)
    H.SVGRenderer.prototype.symbols.crossX = function (x, y, w, h) {
      const s = Math.min(w, h) / 2;
      const cx = x + w / 2;
      const cy = y + h / 2;

      return [
        'M', cx - s, cy - s,
        'L', cx + s, cy + s,
        'M', cx - s, cy + s,
        'L', cx + s, cy - s
      ];
    };
  }

  if (typeof H.addEvent === 'function' && H.Point) {
    H.addEvent(H.Point, 'afterSetState', function (e) {
      if (e?.state === 'select') {
        bringPointToFront(this);
      }
    });
  }
}

function bringPointToFront(point) {
  const halo = point?.series?.halo;
  if (halo && halo.point === point && (!halo.element || halo.element.parentNode)) {
    halo.toFront?.();
  }
  if (point?.graphic && (!point.graphic.element || point.graphic.element.parentNode)) {
    point.graphic.toFront?.();
  }
}

/**
 * Construit les options de marqueur Highcharts pour une courbe donnée,
 * avec un style de sélection adapté aux symboles pleins et aux croix (`cross`, `crossX`).
 * @param {object} curve
 * @returns {object}
 */
export function buildSeriesMarkerOptions(curve) {
  const isCross = curve.markerSymbol === 'cross' || curve.markerSymbol === 'crossX';
  return {
    enabled: curve.markers,
    symbol: curve.markerSymbol,
    radius: curve.markerRadius,
    lineWidth: isCross ? 1 : 0,
    lineColor: curve.color,
    states: {
      select: isCross
        ? {
            fillColor: null,
            lineColor: curve.color,
            lineWidth: 2.5,
            radiusPlus: 2
          }
        : {
            fillColor: null,
            lineColor: '#ffffff',
            lineWidth: 2,
            radiusPlus: 2
          }
    }
  };
}

/**
 * Construit les options Highcharts pour l'instance Grapher donnée.
 * @param {import('../grapher.js').default} grapher
 * @returns {object}
 */
export function buildChartOptions(grapher) {
  return {
    customGrapherInstance: grapher,
    animation: ANIMATION_FLAG,
    boost: {
      useGPUTranslations: true
    },
    chart: {
      type: "line",
      alignTicks: false,
      animation: ANIMATION_FLAG,
      marginBottom: 60,
      events: {
        load: function () {
          const chart = this;

          function drawArrows() {
            if (chart.customArrows) {
              chart.customArrows.forEach(a => a.destroy());
            }

            chart.customArrows = [];

            const xAxis = chart.xAxis[0];
            const yAxis = chart.yAxis[0];

            const arrowScale = chart.renderer?.forExport ? (chart.options?.chart?.exportTextScale || 1) : 1;
            const arrowLen = Math.round(10 * arrowScale);
            const arrowHalfW = Math.round(5 * arrowScale);

            // Flèche X (droite)
            const xEnd = xAxis.toPixels(xAxis.max);
            const yPos = chart.plotHeight + chart.plotTop;

            const arrowX = chart.renderer.path([
              'M', xEnd, yPos,
              'L', xEnd - arrowLen, yPos - arrowHalfW,
              'L', xEnd - arrowLen, yPos + arrowHalfW,
              'Z'
            ]).attr({
              fill: 'black',
              zIndex: 10
            }).add();

            chart.customArrows.push(arrowX);

            const xCurveObj = grapher.data.getCurveByTitle(grapher.currentXCurve);
            const unitText = formatUnitWithExponent(xCurveObj?.unit || '', xAxis.exponent || 0);

            if (!chart.renderer?.forExport) {
              const unitLabel = document.getElementById('xaxis-unit-label');
              if (unitLabel) {
                unitLabel.innerHTML = unitText ? `(${unitText})` : '';
              }
            }

            // Flèche Y (haut)
            const yEnd = yAxis.toPixels(yAxis.max);
            const xPos = chart.plotLeft;

            const arrowY = chart.renderer.path([
              'M', xPos, yEnd,
              'L', xPos - arrowHalfW, yEnd + arrowLen,
              'L', xPos + arrowHalfW, yEnd + arrowLen,
              'Z'
            ]).attr({
              fill: 'black',
              zIndex: 10
            }).add();

            chart.customArrows.push(arrowY);
          }

          drawArrows();
          grapher.drawAnnotations(chart);

          Highcharts.addEvent(chart, 'redraw', drawArrows);
          Highcharts.addEvent(chart, 'redraw', () => grapher.drawAnnotations(chart));
          Highcharts.addEvent(chart, 'redraw', () => grapher.uiManager?.updateModelToolVisibility());
          Highcharts.addEvent(chart, 'redraw', () => {
            if (grapher.crosshairMode === 'edit-bounds' && grapher.editingModel) {
              grapher.updateModelBoundsVisuals();
            }
          });
          Highcharts.addEvent(chart, 'redraw', () => {
            if (typeof chart.getSelectedPoints === 'function') {
              chart.getSelectedPoints().forEach(bringPointToFront);
            }
          });
          Highcharts.addEvent(chart, 'redraw', () => {
            if (grapher.orthonormal && !grapher._applyingOrthonormal) {
              grapher.applyOrthonormalBounds(true);
            }
          });
        },
        selection: (e) => {
          if (!e.xAxis || !e.yAxis) return;
          e.preventDefault();

          grapher.hasUserZoom = true;

          grapher.chart.xAxis[0].setExtremes(e.xAxis[0].min, e.xAxis[0].max, false);
          grapher.chart.yAxis[0].setExtremes(e.yAxis[0].min, e.yAxis[0].max, false);
          if (grapher.orthonormal) {
            grapher.applyOrthonormalBounds(false);
          }
          grapher.chart.redraw();

          grapher.updateAutoZoomButtonVisibility();
        },
        click: function () {
          const selectedPoints = this.getSelectedPoints();
          selectedPoints.forEach(point => {
            point.select(false);
          });
        },
      }
    },
    legend: {
      useHTML: true,
      itemStyle: {
        fontSize: '16px',
        color: '#000000'
      },
      labelFormatter: function () {
        const yAxis = this.chart.yAxis[0];
        const yExponent = yAxis ? yAxis.exponent : 0;
        const labelText = formatAxisLabelWithUnit(this.name, this.userOptions.unit || '', yExponent);

        if (this.chart.renderer && this.chart.renderer.forExport) {
          return labelText;
        }

        return `<span style="position: relative; top: -2px;">${labelText}</span>`;
      },
      layout: 'horizontal',
      align: 'left',
      verticalAlign: 'top',
      x: 0,
      y: -10,
    },
    tooltip: {
      enabled: false,
      useHTML: true,
      shape: 'callout',
      backgroundColor: 'white',
      borderColor: '#dbdbdb',
      borderWidth: 1,
      borderRadius: 6,
      shadow: false,
      style: {
        fontSize: '14px',
        padding: '10px'
      },
      formatter: function () {
        const chart = this.series.chart;
        const g = chart.options.customGrapherInstance;
        if (!g) return '';

        const significantDigits = g?.data?.settings?.significantDigits ?? 4;

        const xCurve = g.currentXCurve;
        const xCurveObj = g.data.getCurveByTitle(xCurve);
        const xUnit = formatUnit(xCurveObj?.unit || '');
        const xLabel = `<strong>${xCurve} =</strong> ${formatNumber(this.x, significantDigits)} ${xUnit}`;

        const yCurveObj = g.data.getCurveByTitle(this.series.name);
        const yUnit = formatUnit(yCurveObj?.unit || '');
        const yLabel = `<strong>${this.series.name} =</strong> ${formatNumber(this.y, significantDigits)} ${yUnit}`;

        return `${xLabel}<br>${yLabel}`;
      }
    },
    zooming: {
      type: null
    },
    accessibility: {
      enabled: false
    },
    exporting: {
      enabled: true,
      fallbackToExportServer: false,
      buttons: {
        contextButton: {
          enabled: false
        }
      }
    },
    title: {
      text: null
    },
    loading: {
      style: {
        fontSize: '2.5rem',
        opacity: 0.85
      }
    },
    xAxis: [{
      title: {
        text: null
      },
      gridLineWidth: grapher.grid ? GRID_STYLE.majorWidth : 0,
      gridLineColor: GRID_STYLE.majorColor,
      minorGridLineWidth: grapher.minorGrid ? GRID_STYLE.minorWidth : 0,
      minorGridLineColor: GRID_STYLE.minorColor,
      minorTickInterval: grapher.minorGrid ? 'auto' : null,
      minorTickWidth: grapher.minorGrid ? GRID_STYLE.minorTickWidth : 0,
      minorTickLength: GRID_STYLE.minorTickLength,
      minorTickColor: GRID_STYLE.minorTickColor,
      plotLines: grapher._getZeroPlotLines(),
      startOnTick: false,
      endOnTick: false,
      minPadding: 0,
      maxPadding: 0,
      minRange: 1e-30,
      events: {
        setExtremes: function (e) {
          const g = this.chart.options.customGrapherInstance;
          if (g && !g.suppressModelAutoUpdate) {
            let newMin = e.min !== undefined && e.min !== null ? e.min : this.dataMin;
            let newMax = e.max !== undefined && e.max !== null ? e.max : this.dataMax;

            if (newMin !== undefined && newMax !== undefined) {
              g.redrawAllModels(newMin, newMax);
              g._modelsUpdatedInSetExtremes = true;
            }
          }
        },
        afterSetExtremes: function () {
          const g = this.chart.options.customGrapherInstance;
          const oldExponent = this.exponent;
          this.exponent = g ? computeAxisExponent(this.min, this.max, g.disableScientificNotation) : 0;

          if (oldExponent !== this.exponent) {
            this.isDirty = true;
            this.forceRedraw = true;
            this.chart.redraw(false);
          }
        }
      },
      labels: {
        formatter: function () {
          const exportExp = this.chart?.renderer?.forExport ? this.chart?.options?.chart?.exportXExponent : undefined;
          const exponent = exportExp !== undefined ? exportExp : (this.axis.exponent || 0);
          return formatAxisTickValue(this.value, this.axis.tickInterval, exponent);
        }
      }
    },
    { // Axe X Secondaire (index 1) pour les modèles
      visible: false,
      linkedTo: 0
    }],
    yAxis: [{
      title: {
        text: null
      },
      lineWidth: 1,
      gridLineWidth: grapher.grid ? GRID_STYLE.majorWidth : 0,
      gridLineColor: GRID_STYLE.majorColor,
      minorGridLineWidth: grapher.minorGrid ? GRID_STYLE.minorWidth : 0,
      minorGridLineColor: GRID_STYLE.minorColor,
      minorTickInterval: grapher.minorGrid ? 'auto' : null,
      minorTickWidth: grapher.minorGrid ? GRID_STYLE.minorTickWidth : 0,
      minorTickLength: GRID_STYLE.minorTickLength,
      minorTickColor: GRID_STYLE.minorTickColor,
      plotLines: grapher._getZeroPlotLines(),
      tickWidth: 1,
      startOnTick: false,
      endOnTick: false,
      minPadding: 0,
      maxPadding: 0,
      events: {
        afterSetExtremes: function () {
          const g = this.chart.options.customGrapherInstance;
          const oldExponent = this.exponent;
          this.exponent = g ? computeAxisExponent(this.min, this.max, g.disableScientificNotation) : 0;

          if (oldExponent !== this.exponent) {
            this.isDirty = true;
            this.forceRedraw = true;
            this.chart.legend.update({}, false);
            this.chart.redraw(false);
          }
        }
      },
      labels: {
        formatter: function () {
          const exportExp = this.chart?.renderer?.forExport ? this.chart?.options?.chart?.exportYExponent : undefined;
          const exponent = exportExp !== undefined ? exportExp : (this.axis.exponent || 0);
          return formatAxisTickValue(this.value, this.axis.tickInterval, exponent);
        }
      }
    },
    { // Axe Y Secondaire (index 1) pour les modèles
      visible: false,
      linkedTo: 0
    }],
    credits: {
      enabled: false
    },
    plotOptions: {
      line: {
        boostThreshold: 5000
      },
      series: {
        boostThreshold: 5000,
        allowPointSelect: true,
        findNearestPointBy: 'xy',
        animation: ANIMATION_FLAG,
        stickyTracking: false,
        marker: {
          states: {
            select: {
              fillColor: null,
              lineColor: '#ffffff',
              lineWidth: 2,
              radiusPlus: 2
            }
          }
        },
        states: {
          hover: {
            enabled: false,
            lineWidthPlus: 0
          },
          select: {
            halo: {
              size: 10,
              opacity: 0.25
            }
          }
        },
        events: {
          legendItemClick: function () {
            const g = this.chart.options.customGrapherInstance;
            setTimeout(() => g?.reorderLegendByVisibility(), 0);
            return true;
          }
        },
        point: {
          events: {
            select: function () {
              bringPointToFront(this);
            }
          }
        }
      }
    },
    series: []
  };
}

/**
 * Attache les écouteurs DOM/Highcharts d'interaction (réticules, poignées de bornes, redraw des modèles).
 * @param {import('../grapher.js').default} grapher
 */
export function attachChartInteractionListeners(grapher) {
  const PAN_THRESHOLD_PX = 4;

  // Zoom à la molette centré sur le curseur
  grapher.chart.container.addEventListener('wheel', (e) => {
    if (!grapher.chart?.pointer?.getChartPosition) return;
    const pos = grapher.chart.pointer.getChartPosition();
    const pageX = e.pageX ?? e.clientX;
    const pageY = e.pageY ?? e.clientY;
    const chartX = pageX - pos.left;
    const chartY = pageY - pos.top;

    if (!grapher._isInsidePlotBox(chartX, chartY)) return;

    e.preventDefault();
    if (!e.deltaY) return;

    let normalizedDelta = e.deltaY;
    if (e.deltaMode === 1) normalizedDelta *= 16;
    else if (e.deltaMode === 2) normalizedDelta *= 100;
    const clampedDelta = Math.max(-150, Math.min(150, normalizedDelta));
    const factor = Math.pow(1.15, clampedDelta / 100);

    grapher.hideFreeCrosshair();
    grapher.zoomAt(factor, chartX, chartY);
  }, { passive: false });

  // Déplacement (pan) au clic gauche (hors outil / zoom rectangle) ou clic milieu
  grapher.chart.container.addEventListener('mousedown', (e) => {
    const isZoomBoxActive = Boolean(
      grapher.uiManager?.isZoomEnabled || grapher.chart?.options?.chart?.zooming?.type
    );
    const isLeftPan = e.button === 0 && grapher.crosshairMode === null && !isZoomBoxActive;
    const isMiddlePan = e.button === 1;
    if (!isLeftPan && !isMiddlePan) return;

    if (!grapher.chart?.pointer?.getChartPosition) return;
    const pos = grapher.chart.pointer.getChartPosition();
    const pageX = e.pageX ?? e.clientX;
    const pageY = e.pageY ?? e.clientY;
    const chartX = pageX - pos.left;
    const chartY = pageY - pos.top;

    if (!grapher._isInsidePlotBox(chartX, chartY)) return;

    const xAxis = grapher.chart.xAxis?.[0];
    const yAxis = grapher.chart.yAxis?.[0];
    if (!xAxis || !yAxis) return;

    const xEx = xAxis.getExtremes();
    const yEx = yAxis.getExtremes();
    if (!Number.isFinite(xEx?.min) || !Number.isFinite(xEx?.max) ||
        !Number.isFinite(yEx?.min) || !Number.isFinite(yEx?.max)) {
      return;
    }

    if (isMiddlePan) {
      e.preventDefault();
    }

    const panState = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      xMin: xEx.min,
      xMax: xEx.max,
      yMin: yEx.min,
      yMax: yEx.max,
      plotWidth: grapher.chart.plotWidth,
      plotHeight: grapher.chart.plotHeight,
      moved: false,
      rafId: null,
      lastDx: 0,
      lastDy: 0
    };

    const flushPan = () => {
      panState.rafId = null;
      grapher.panFromOrigin(panState.lastDx, panState.lastDy, panState);
    };

    const onPanMove = (moveEvent) => {
      const dx = moveEvent.clientX - panState.startClientX;
      const dy = moveEvent.clientY - panState.startClientY;

      if (!panState.moved) {
        if (Math.hypot(dx, dy) < PAN_THRESHOLD_PX) return;
        panState.moved = true;
        grapher.isPanning = true;
        grapher.chart.container.classList?.add('chart-panning');
        grapher.hideFreeCrosshair();
      }

      moveEvent.preventDefault?.();
      panState.lastDx = dx;
      panState.lastDy = dy;

      if (typeof requestAnimationFrame === 'function') {
        if (panState.rafId === null) {
          panState.rafId = requestAnimationFrame(flushPan);
        }
      } else {
        flushPan();
      }
    };

    const onPanEnd = () => {
      document.removeEventListener('mousemove', onPanMove);
      document.removeEventListener('mouseup', onPanEnd);

      if (panState.rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(panState.rafId);
        panState.rafId = null;
      }

      if (panState.moved) {
        grapher.panFromOrigin(panState.lastDx, panState.lastDy, panState);
        grapher.isPanning = false;
        grapher.chart.container.classList?.remove('chart-panning');

        // Empêche le relâchement du drag de déclencher un clic parasite sur le graphe
        const suppressClick = (clickEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
        };
        grapher.chart.container.addEventListener('click', suppressClick, { capture: true, once: true });
        setTimeout(() => {
          grapher.chart.container.removeEventListener('click', suppressClick, { capture: true });
        }, 0);
      }
    };

    document.addEventListener('mousemove', onPanMove);
    document.addEventListener('mouseup', onPanEnd);
  });

  grapher.chart.container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (
      grapher.crosshairMode !== 'free' &&
      grapher.crosshairMode !== 'model' &&
      grapher.crosshairMode !== 'data' &&
      grapher.crosshairMode !== 'tangent' &&
      grapher.crosshairMode !== 'tangent-method' &&
      grapher.crosshairMode !== 'edit-bounds'
    ) return;

    const pos = grapher.chart.pointer.getChartPosition();
    const chartX = e.pageX - pos.left;
    const chartY = e.pageY - pos.top;

    if (grapher.crosshairMode !== 'edit-bounds' && !grapher._isInsidePlotBox(chartX, chartY)) {
      return;
    }

    e.preventDefault();

    grapher.mouseDownInfo = {
      chartX,
      chartY,
      time: Date.now()
    };

    if (grapher.crosshairMode === 'data') {
      const dataSeries = grapher.chart.series.filter(s => !s.options.id?.startsWith('model-'));
      const point = grapher.chart.pointer.findNearestKDPoint(dataSeries, true, grapher.mouseDownInfo);
      if (point) {
        grapher.mouseDownInfo.snappedPoint = { x: point.x, y: point.y, unit: point.series?.userOptions?.unit || '' };
      }
    } else if (grapher.crosshairMode === 'model') {
      const point = grapher._findNearestModelPoint(grapher.mouseDownInfo);
      if (point) {
        grapher.mouseDownInfo.snappedPoint = { x: point.x, y: point.y, unit: point.unit || '' };
      }
    }

    if (grapher.crosshairMode === 'edit-bounds' && grapher.editingModel) {
      const xAxis = grapher.chart.xAxis[0];
      const xMin = grapher._getSafeBound(grapher.editingModel.minX, xAxis.dataMin, xAxis.min, 0);
      const xMax = grapher._getSafeBound(grapher.editingModel.maxX, xAxis.dataMax, xAxis.max, 1);

      const pxVal = grapher.mouseDownInfo.chartX;
      const pxMin = xAxis.toPixels(xMin);
      const pxMax = xAxis.toPixels(xMax);

      if (Math.abs(pxVal - pxMin) < 20) {
        grapher.draggingBound = 'min';
      } else if (Math.abs(pxVal - pxMax) < 20) {
        grapher.draggingBound = 'max';
      }

      if (grapher.draggingBound) {
        grapher.previousModelBounds = {
          minX: grapher.editingModel.minX,
          maxX: grapher.editingModel.maxX
        };
      }
    }

    grapher.isDragging = true;

    document.addEventListener('mousemove', grapher.handleMouseMove);
    document.addEventListener('mouseup', grapher.handleMouseUp);
  });

  grapher.chart.container.addEventListener('mousemove', (e) => {
    if (grapher.crosshairMode === null) return;

    const pos = grapher.chart.pointer.getChartPosition();
    const payload = { chartX: e.pageX - pos.left, chartY: e.pageY - pos.top };

    if (grapher.crosshairMode === 'free') {
      grapher.drawFreeCrosshair(payload);
    } else if (grapher.crosshairMode === 'model') {
      grapher.drawModelCrosshair(payload);
    } else if (grapher.crosshairMode === 'data') {
      grapher.drawDataCrosshair(payload);
    } else if (grapher.crosshairMode === 'tangent' || grapher.crosshairMode === 'tangent-method') {
      grapher.drawTangent(payload);
    }
  });

  Highcharts.addEvent(grapher.chart.container, 'mouseleave', () => {
    grapher.hideFreeCrosshair();
    grapher.snappedModelPoint = null;
    grapher.snappedDataPoint = null;
  });

  Highcharts.addEvent(grapher.chart, 'redraw', () => {
    if (grapher._modelsUpdatedInSetExtremes) {
      grapher._modelsUpdatedInSetExtremes = false;
      return;
    }
    if (grapher.suppressModelAutoUpdate) return;
    const ex = grapher.chart.xAxis[0].getExtremes();
    grapher.redrawAllModels(ex.min, ex.max);
  });
}
