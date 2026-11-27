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
        },
        selection: (e) => {
          if (!e.xAxis || !e.yAxis) return;
          e.preventDefault();

          grapher.hasUserZoom = true;

          grapher.chart.xAxis[0].setExtremes(e.xAxis[0].min, e.xAxis[0].max, false);
          grapher.chart.yAxis[0].setExtremes(e.yAxis[0].min, e.yAxis[0].max, false);
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
      gridLineWidth: grapher.grid ? 1 : 0,
      minorGridLineWidth: grapher.minorGrid ? 1 : 0,
      minorTickInterval: grapher.minorGrid ? 'auto' : null,
      minorGridLineColor: '#f2f2f2',
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
            }
          }
        },
        afterSetExtremes: function () {
          const g = this.chart.options.customGrapherInstance;
          const oldExponent = this.exponent;
          this.exponent = g ? computeAxisExponent(this.min, this.max, g.disableScientificNotation) : 0;

          if (oldExponent !== this.exponent) {
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
      minorGridLineWidth: grapher.minorGrid ? 1 : 0,
      minorTickInterval: grapher.minorGrid ? 'auto' : null,
      minorGridLineColor: '#f2f2f2',
      gridLineWidth: grapher.grid ? 1 : 0,
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
            this.chart.legend.update({});
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
        boostThreshold: 50000
      },
      series: {
        boostThreshold: 50000,
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
  grapher.chart.container.addEventListener('mousedown', (e) => {
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
    if (grapher.suppressModelAutoUpdate) return;
    const ex = grapher.chart.xAxis[0].getExtremes();
    grapher.redrawAllModels(ex.min, ex.max);
  });
}
