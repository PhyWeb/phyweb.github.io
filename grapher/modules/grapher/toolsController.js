import { showToast } from '../../../common/common.js';

const $ = (selector) => document.querySelector(selector);

export default class ToolsController {
  constructor(grapher) {
    this.grapher = grapher;
  }

  setCrosshairMode(mode) {
    const g = this.grapher;
    g.crosshairMode = mode;

    const needsStickyTracking = (mode === 'data' || mode === 'tangent' || mode === 'tangent-method');

    g.hideFreeCrosshair();
    g.snappedModelPoint = null;
    g.snappedDataPoint = null;

    if (g.tempAnnotation) {
      g.tempAnnotation.forEach(el => el.destroy());
      g.tempAnnotation = null;
    }

    if (g.isDragging) {
      g.isDragging = false;
      g.mouseDownInfo = null;
      document.removeEventListener('mousemove', g.handleMouseMove);
      document.removeEventListener('mouseup', g.handleMouseUp);
    }

    if (mode !== 'edit-bounds') {
      g.hideModelBounds();
      g.editingModel = null;
      if (g.draggingBound) {
        g.draggingBound = null;
        g.previousModelBounds = null;
      }
    }

    // Désélectionner immédiatement les éventuels points sélectionnés lors de l'activation d'un outil
    if (mode !== null && typeof g.chart?.getSelectedPoints === 'function') {
      g.chart.getSelectedPoints().forEach(p => p.select(false));
    }

    // Application de la classe CSS pour forcer le curseur
    if (mode === 'free' || mode === 'model' || mode === 'data' || mode === 'tangent' || mode === 'tangent-method') {
      g.chart.container.classList.add('chart-free-crosshair');
    } else {
      g.chart.container.classList.remove('chart-free-crosshair');
    }

    // Mise à jour groupée de toutes les options nécessaires
    g.chart.update({
      chart: { zooming: { type: null } },
      tooltip: { enabled: false },
      plotOptions: {
        series: {
          allowPointSelect: mode === null,
          stickyTracking: needsStickyTracking,
          enableMouseTracking: true,
          states: { hover: { enabled: false } }
        }
      }
    });
  }

  drawFreeCrosshair(event) {
    const g = this.grapher;
    const chart = g.chart;
    if (!chart.pointer) return;

    g.hideFreeCrosshair();

    const { chartX, chartY } = event;
    if (!g._isInsidePlotBox(chartX, chartY, chart)) {
      return;
    }

    const xValue = chart.xAxis[0].toValue(chartX);
    const yValue = chart.yAxis[0].toValue(chartY);

    g.freeCrosshair = g._drawStyledCrosshair(chartX, chartY, xValue, yValue);
  }

  hideFreeCrosshair() {
    const g = this.grapher;
    if (g.freeCrosshair) {
      Object.values(g.freeCrosshair).forEach(el => el?.destroy?.());
      g.freeCrosshair = null;
    }
  }

  drawModelCrosshair(event) {
    const g = this.grapher;
    const chart = g.chart;
    if (!g._isInsidePlotBox(event.chartX, event.chartY, chart)) {
      g.hideFreeCrosshair();
      g.snappedModelPoint = null;
      return;
    }

    const best = g._findNearestModelPoint(event);
    if (!best) {
      g.hideFreeCrosshair();
      g.snappedModelPoint = null;
      return;
    }

    const pixelX = best.plotX + chart.plotLeft;
    const pixelY = best.plotY + chart.plotTop;
    if (!g._isInsidePlotBox(pixelX, pixelY, chart)) {
      g.hideFreeCrosshair();
      g.snappedModelPoint = null;
      return;
    }

    g.snappedModelPoint = { x: best.x, y: best.y };
    g.hideFreeCrosshair();
    g.freeCrosshair = g._drawStyledCrosshair(pixelX, pixelY, best.x, best.y);
  }

  drawDataCrosshair(event) {
    const g = this.grapher;
    const chart = g.chart;
    if (!g._isInsidePlotBox(event.chartX, event.chartY, chart)) {
      g.snappedDataPoint = null;
      g.hideFreeCrosshair();
      return;
    }

    const dataSeries = chart.series.filter(s => !s.options.id?.startsWith('model-'));
    const point = chart.pointer.findNearestKDPoint(dataSeries, false, event);

    if (point && point.plotX !== undefined && point.plotY !== undefined) {
      const pixelX = point.plotX + chart.plotLeft;
      const pixelY = point.plotY + chart.plotTop;
      if (!g._isInsidePlotBox(pixelX, pixelY, chart)) {
        g.snappedDataPoint = null;
        g.hideFreeCrosshair();
        return;
      }

      g.snappedDataPoint = { x: point.x, y: point.y };
      g.hideFreeCrosshair();
      g.freeCrosshair = g._drawStyledCrosshair(pixelX, pixelY, point.x, point.y);
    } else {
      g.snappedDataPoint = null;
      g.hideFreeCrosshair();
    }
  }

  drawModelBounds(model) {
    const g = this.grapher;
    g.hideModelBounds();
    if (!model || !g.chart) return;

    const chart = g.chart;
    const xAxis = chart.xAxis[0];

    const xMin = g._getSafeBound(model.minX, xAxis.dataMin, xAxis.min, 0);
    const xMax = g._getSafeBound(model.maxX, xAxis.dataMax, xAxis.max, 1);

    const pxMin = xAxis.toPixels(xMin);
    const pxMax = xAxis.toPixels(xMax);
    const pyTop = chart.plotTop;
    const pyBottom = chart.plotTop + chart.plotHeight;

    const rectX = Math.min(pxMin, pxMax);
    const rectW = Math.abs(pxMax - pxMin);

    const band = chart.renderer.rect(rectX, pyTop, rectW, pyBottom - pyTop)
      .attr({ fill: 'rgba(0, 0, 0, 0.1)', zIndex: 3 })
      .add();

    const leftHandle = chart.renderer.path(['M', pxMin, pyTop, 'L', pxMin, pyBottom])
      .attr({ 'stroke-width': 4, stroke: model.color, zIndex: 4 })
      .add();
    const rightHandle = chart.renderer.path(['M', pxMax, pyTop, 'L', pxMax, pyBottom])
      .attr({ 'stroke-width': 4, stroke: model.color, zIndex: 4 })
      .add();

    const leftTracker = chart.renderer.path(['M', pxMin, pyTop, 'L', pxMin, pyBottom])
      .attr({ 'stroke-width': 40, stroke: 'transparent', zIndex: 5, cursor: 'ew-resize' })
      .add();
    const rightTracker = chart.renderer.path(['M', pxMax, pyTop, 'L', pxMax, pyBottom])
      .attr({ 'stroke-width': 40, stroke: 'transparent', zIndex: 5, cursor: 'ew-resize' })
      .add();

    g.modelBoundsElements = { band, leftHandle, rightHandle, leftTracker, rightTracker };
  }

  updateModelBoundsVisuals() {
    const g = this.grapher;
    if (!g.modelBoundsElements || !g.editingModel || !g.chart) return;

    const chart = g.chart;
    const xAxis = chart.xAxis[0];

    const xMin = g._getSafeBound(g.editingModel.minX, xAxis.dataMin, xAxis.min, 0);
    const xMax = g._getSafeBound(g.editingModel.maxX, xAxis.dataMax, xAxis.max, 1);

    const pxMin = xAxis.toPixels(xMin);
    const pxMax = xAxis.toPixels(xMax);
    const pyTop = chart.plotTop;
    const pyBottom = chart.plotTop + chart.plotHeight;

    const rectX = Math.min(pxMin, pxMax);
    const rectW = Math.abs(pxMax - pxMin);

    g.modelBoundsElements.band.attr({ x: rectX, y: pyTop, width: rectW, height: pyBottom - pyTop });

    const leftPath = ['M', pxMin, pyTop, 'L', pxMin, pyBottom];
    const rightPath = ['M', pxMax, pyTop, 'L', pxMax, pyBottom];

    g.modelBoundsElements.leftHandle.attr({ d: leftPath });
    g.modelBoundsElements.leftTracker.attr({ d: leftPath });
    g.modelBoundsElements.rightHandle.attr({ d: rightPath });
    g.modelBoundsElements.rightTracker.attr({ d: rightPath });
  }

  hideModelBounds() {
    const g = this.grapher;
    if (g.modelBoundsElements) {
      Object.values(g.modelBoundsElements).forEach(el => el.destroy());
      g.modelBoundsElements = null;
    }
  }

  _getSafeBound(val1, val2, val3, fallback) {
    const isValid = (v) => typeof v === 'number' && !isNaN(v) && isFinite(v);
    if (isValid(val1)) return val1;
    if (isValid(val2)) return val2;
    if (isValid(val3)) return val3;
    return fallback;
  }

  _findNearestModelPoint(event) {
    const g = this.grapher;
    const chart = g.chart;
    if (!chart?.pointer) return null;

    const xAxis = chart.xAxis[0];
    const yAxis = chart.yAxis[0];
    const xVal = xAxis.toValue(event.chartX);

    let best = null;
    g.data.models.forEach(model => {
      if (model.x.title !== g.currentXCurve || !model.visible) return;
      const s = chart.get(`model-${model.id}`);
      if (!s || !s.visible || (!s.points && !s.data)) return;

      const pts = s.points ?? s.data;
      if (!pts.length) return;

      let closest = null, minDx = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const point = pts[i];
        if (!point || point.isNull || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
          continue;
        }
        const dx = Math.abs(point.x - xVal);
        if (dx < minDx) {
          minDx = dx;
          closest = { x: point.x, y: point.y };
        }
      }
      if (!closest) return;

      const pixelX = xAxis.toPixels(closest.x);
      const pixelY = yAxis.toPixels(closest.y);
      if (!Number.isFinite(pixelX) || !Number.isFinite(pixelY)) return;
      const dist2 = Math.pow(pixelX - event.chartX, 2) + Math.pow(pixelY - event.chartY, 2);

      if (!best || dist2 < best.dist2) {
        best = {
          x: closest.x,
          y: closest.y,
          unit: model.y?.unit || '',
          plotX: pixelX - chart.plotLeft,
          plotY: pixelY - chart.plotTop,
          dist2: dist2
        };
      }
    });
    return best;
  }

  handleMouseMove(e) {
    const g = this.grapher;
    if (!g.isDragging) return;

    if (g.crosshairMode === 'edit-bounds') {
      if (g.editingModel && g.draggingBound) {
        const pos = g.chart.pointer.getChartPosition();
        const chartX = e.pageX - pos.left;
        const xAxis = g.chart.xAxis[0];
        const xValue = xAxis.toValue(chartX);

        if (g.draggingBound === 'min') {
          const currentMax = g._getSafeBound(g.editingModel.maxX, xAxis.dataMax, xAxis.max, 1);
          g.editingModel.minX = Math.min(xValue, currentMax);
        } else {
          const currentMin = g._getSafeBound(g.editingModel.minX, xAxis.dataMin, xAxis.min, 0);
          g.editingModel.maxX = Math.max(xValue, currentMin);
        }

        g.updateModelBoundsVisuals();
      }
      return;
    }

    const chart = g.chart;
    const pos = chart.pointer.getChartPosition();
    const startInfo = g.mouseDownInfo;
    const currentX = e.pageX - pos.left;
    const currentY = e.pageY - pos.top;

    if (g.tempAnnotation) {
      g.tempAnnotation.forEach(el => el.destroy());
      g.tempAnnotation = null;
    }

    if (g.crosshairMode !== 'free' && g.crosshairMode !== 'data' && g.crosshairMode !== 'model') {
      return;
    }

    const distance = Math.sqrt(Math.pow(currentX - startInfo.chartX, 2) + Math.pow(currentY - startInfo.chartY, 2));
    if (distance < 5) {
      return;
    }

    let p1_pix, p2_pix;

    if (g.crosshairMode === 'data') {
      if (!startInfo.snappedPoint) return;
      const startPoint = startInfo.snappedPoint;
      p1_pix = { x: chart.xAxis[0].toPixels(startPoint.x), y: chart.yAxis[0].toPixels(startPoint.y) };

      const dataSeries = chart.series.filter(s => !s.options.id?.startsWith('model-'));
      const currentPoint = chart.pointer.findNearestKDPoint(dataSeries, true, { chartX: currentX, chartY: currentY });
      if (!currentPoint) return;
      p2_pix = { x: currentPoint.plotX + chart.plotLeft, y: currentPoint.plotY + chart.plotTop };
    } else if (g.crosshairMode === 'model') {
      if (!startInfo.snappedPoint) return;
      p1_pix = { x: chart.xAxis[0].toPixels(startInfo.snappedPoint.x), y: chart.yAxis[0].toPixels(startInfo.snappedPoint.y) };

      const currentPoint = g._findNearestModelPoint({ chartX: currentX, chartY: currentY });
      if (!currentPoint) return;
      p2_pix = { x: currentPoint.plotX + chart.plotLeft, y: currentPoint.plotY + chart.plotTop };
    } else {
      p1_pix = { x: startInfo.chartX, y: startInfo.chartY };
      const clampedEnd = g._isInsidePlotBox(startInfo.chartX, startInfo.chartY, chart)
        ? g._clampToPlotBox(currentX, currentY, chart)
        : { chartX: currentX, chartY: currentY };
      p2_pix = { x: clampedEnd.chartX, y: clampedEnd.chartY };
    }

    const tempElements = [];
    tempElements.push(g._clipToPlot(
      chart.renderer.path(['M', p1_pix.x, p1_pix.y, 'L', p2_pix.x, p2_pix.y])
        .attr({ 'stroke-width': 2, stroke: 'rgba(220, 53, 69, 0.7)', 'stroke-dasharray': '5,5', zIndex: 10 }).add(),
      chart
    ));
    const ep1 = g._drawEndpoint(p1_pix.x, p1_pix.y);
    const ep2 = g._drawEndpoint(p2_pix.x, p2_pix.y);
    ep1.forEach(el => g._clipToPlot(el, chart));
    ep2.forEach(el => g._clipToPlot(el, chart));
    tempElements.push(...ep1, ...ep2);
    const deltaLineAttr = { 'stroke-width': 1, stroke: 'rgba(0, 123, 255, 0.7)', 'stroke-dasharray': '4,4', zIndex: 9 };
    tempElements.push(g._clipToPlot(
      chart.renderer.path(['M', p1_pix.x, p1_pix.y, 'L', p2_pix.x, p1_pix.y]).attr(deltaLineAttr).add(),
      chart
    ));
    tempElements.push(g._clipToPlot(
      chart.renderer.path(['M', p2_pix.x, p1_pix.y, 'L', p2_pix.x, p2_pix.y]).attr(deltaLineAttr).add(),
      chart
    ));

    g.tempAnnotation = tempElements;
  }

  handleMouseUp(e) {
    const g = this.grapher;

    if (g.crosshairMode === 'edit-bounds') {
      if (g.isDragging && g.draggingBound && g.editingModel) {
        const targetModel = g.editingModel;
        const prevBounds = g.previousModelBounds;

        g.showLoading('Mise à jour du modèle...', 500, true);

        targetModel.fit().then(() => {
          if (g.data?.models && !g.data.models.includes(targetModel)) {
            if (g.data.parameters && Array.isArray(targetModel.parameters)) {
              targetModel.parameters.forEach(param => {
                delete g.data.parameters[param.name];
              });
            }
            return;
          }

          g.updateModels();

          if (g.uiManager) {
            g.uiManager.updateModelPanel(targetModel);
            g.uiManager.updateCalculationUI();
          }
        }).catch(error => {
          console.error("Erreur lors du recalcul des bornes :", error);

          if (prevBounds) {
            targetModel.minX = prevBounds.minX;
            targetModel.maxX = prevBounds.maxX;
            if (g.crosshairMode === 'edit-bounds' && g.editingModel === targetModel) {
              g.updateModelBoundsVisuals();
            }
          }

          showToast(`Impossible de recalculer le modèle : ${error?.message || 'données insuffisantes.'}`, 'is-warning');
        }).finally(() => {
          g.hideLoading();
        });
      }

      g.isDragging = false;
      g.draggingBound = null;
      g.previousModelBounds = null;
      g.mouseDownInfo = null;

      document.removeEventListener('mousemove', g.handleMouseMove);
      document.removeEventListener('mouseup', g.handleMouseUp);
      return;
    }

    document.removeEventListener('mousemove', g.handleMouseMove);
    document.removeEventListener('mouseup', g.handleMouseUp);

    if (!g.isDragging) return;
    g.isDragging = false;

    if (g.tempAnnotation) {
      g.tempAnnotation.forEach(item => { item.destroy(); });
      g.tempAnnotation = null;
    }

    const chart = g.chart;
    const pos = chart.pointer.getChartPosition();
    const endX = e.pageX - pos.left;
    const endY = e.pageY - pos.top;
    const { chartX: startX, chartY: startY, snappedPoint: startSnappedPoint } = g.mouseDownInfo;
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    let annotationAdded = false;

    if (distance < 5) {
      let xValue, yValue;

      if (g.crosshairMode === 'model') {
        if (g.snappedModelPoint) {
          xValue = g.snappedModelPoint.x;
          yValue = g.snappedModelPoint.y;
          g.data.annotations.push({
            id: Highcharts.uniqueKey(),
            type: 'point',
            x: xValue,
            y: yValue,
            xCurve: g.currentXCurve
          });
          annotationAdded = true;
        }
      } else if (g.crosshairMode === 'data') {
        if (g.snappedDataPoint) {
          xValue = g.snappedDataPoint.x;
          yValue = g.snappedDataPoint.y;
          g.data.annotations.push({
            id: Highcharts.uniqueKey(),
            type: 'point',
            x: xValue,
            y: yValue,
            xCurve: g.currentXCurve
          });
          annotationAdded = true;
        }
      } else if (g.crosshairMode === 'tangent') {
        const point = g._findNearestPoint({ chartX: endX, chartY: endY });
        if (point) {
          const slope = g._calculateSlope(point);
          if (slope !== null && Number.isFinite(slope)) {
            g.data.annotations.push({
              id: Highcharts.uniqueKey(),
              type: 'tangent',
              point: { x: point.x, y: point.y },
              slope: slope,
              xCurve: g.currentXCurve
            });
            annotationAdded = true;
          }
        }
      } else if (g.crosshairMode === 'tangent-method') {
        const point = g._findNearestPoint({ chartX: endX, chartY: endY });
        if (point) {
          const slope1 = g._calculateSlope(point);
          if (slope1 !== null && Number.isFinite(slope1)) {
            const result = g._findTangentMethodPoints(point, slope1);
            if (result) {
              g.data.annotations = g.data.annotations.filter(
                ann => ann.type !== 'tangent-method' || (ann.xCurve && ann.xCurve !== g.currentXCurve)
              );

              g.data.annotations.push({
                id: Highcharts.uniqueKey(),
                type: 'tangent-method',
                point1: result.p1,
                point2: result.p2,
                slope: slope1,
                seriesName: point.series.name,
                xCurve: g.currentXCurve
              });
              annotationAdded = true;

              const tangentMethodBtn = $('#tool-tangent-method');
              if (tangentMethodBtn && typeof MouseEvent === 'function') {
                const silentClick = new MouseEvent('click', { bubbles: false });
                tangentMethodBtn.dispatchEvent(silentClick);
              }
            }
          }
        }
      } else if (g.crosshairMode === 'free') {
        if (g._isInsidePlotBox(endX, endY, chart)) {
          xValue = chart.xAxis[0].toValue(endX);
          yValue = chart.yAxis[0].toValue(endY);
          g.data.annotations.push({
            id: Highcharts.uniqueKey(),
            type: 'point',
            x: xValue,
            y: yValue,
            xCurve: g.currentXCurve
          });
          annotationAdded = true;
        }
      }
    } else {
      let p1, p2;

      if (g.crosshairMode === 'data') {
        if (startSnappedPoint) {
          const dataSeries = chart.series.filter(s => !s.options.id?.startsWith('model-'));
          const endPoint = chart.pointer.findNearestKDPoint(dataSeries, true, { chartX: endX, chartY: endY });
          if (endPoint) {
            p1 = startSnappedPoint;
            p2 = { x: endPoint.x, y: endPoint.y };
          }
        }
      } else if (g.crosshairMode === 'model') {
        if (startSnappedPoint) {
          const endPoint = g._findNearestModelPoint({ chartX: endX, chartY: endY });
          if (endPoint) {
            p1 = startSnappedPoint;
            p2 = { x: endPoint.x, y: endPoint.y };
          }
        }
      } else if (g.crosshairMode === 'free') {
        const clampedEnd = g._isInsidePlotBox(startX, startY, chart)
          ? g._clampToPlotBox(endX, endY, chart)
          : { chartX: endX, chartY: endY };
        p1 = { x: chart.xAxis[0].toValue(startX), y: chart.yAxis[0].toValue(startY) };
        p2 = { x: chart.xAxis[0].toValue(clampedEnd.chartX), y: chart.yAxis[0].toValue(clampedEnd.chartY) };
      }

      if (p1 && p2) {
        let yUnit = '';
        if (g.crosshairMode === 'data' || g.crosshairMode === 'model') {
          yUnit = startSnappedPoint?.unit || '';
        } else if (g.crosshairMode === 'free') {
          const visibleDataSeries = chart.series.filter(s => s.visible && !s.options.id?.startsWith('model-'));
          if (visibleDataSeries.length > 0) {
            const firstUnit = visibleDataSeries[0].userOptions?.unit || '';
            const allSame = visibleDataSeries.every(s => (s.userOptions?.unit || '') === firstUnit);
            yUnit = allSame ? firstUnit : '';
          }
        }
        g.data.annotations.push({
          id: Highcharts.uniqueKey(),
          type: 'segment',
          points: [p1, p2],
          yUnit: yUnit,
          xCurve: g.currentXCurve
        });
        annotationAdded = true;
      }
    }

    g.mouseDownInfo = null;

    if (annotationAdded) {
      if (g.uiManager) {
        g.uiManager.updateClearAnnotationsButtonVisibility();
      }
      chart.redraw();
    }
  }

  _findNearestPoint(event) {
    const chart = this.grapher.chart;
    const searchableSeries = chart.series.filter(s => s.visible && !s.options.id?.startsWith('model-') && s.type !== 'spline');
    return chart.pointer.findNearestKDPoint(searchableSeries, false, event);
  }

  _extractPoint(p) {
    if (!p) return null;
    let x, y;
    if (Array.isArray(p)) {
      x = p[0];
      y = p[1];
    } else if (typeof p === 'object') {
      x = p.x ?? p[0];
      y = p.y ?? p[1];
    }
    x = typeof x === 'number' ? x : Number(x);
    y = typeof y === 'number' ? y : Number(y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y };
  }

  _calculateSlope(point) {
    if (!point || !point.series) return null;
    const series = point.series;
    const data = (series.points && series.points.length > 0) ? series.points : series.options?.data;
    if (!Array.isArray(data) || data.length < 2) return null;
    const n = data.length;

    let index = -1;
    if (typeof point.index === 'number' && point.index >= 0 && point.index < n) {
      const candidate = this._extractPoint(data[point.index]);
      if (candidate && Math.abs(candidate.x - point.x) < 1e-9 && Math.abs(candidate.y - point.y) < 1e-9) {
        index = point.index;
      }
    }

    if (index === -1) {
      index = data.findIndex(p => {
        const pt = this._extractPoint(p);
        return pt && Math.abs(pt.x - point.x) < 1e-9 && Math.abs(pt.y - point.y) < 1e-9;
      });
    }

    if (index === -1) return null;

    const current_point = this._extractPoint(data[index]);
    if (!current_point) return null;

    const p_minus_1 = index > 0 ? this._extractPoint(data[index - 1]) : null;
    const p_plus_1 = index < n - 1 ? this._extractPoint(data[index + 1]) : null;

    if (p_minus_1 && p_plus_1) {
      const dx = p_plus_1.x - p_minus_1.x;
      if (dx !== 0 && Number.isFinite(dx)) {
        const slope = (p_plus_1.y - p_minus_1.y) / dx;
        if (Number.isFinite(slope)) return slope;
      }
    }

    if (p_plus_1) {
      const dx = p_plus_1.x - current_point.x;
      if (dx !== 0 && Number.isFinite(dx)) {
        const slope = (p_plus_1.y - current_point.y) / dx;
        if (Number.isFinite(slope)) return slope;
      }
    }

    if (p_minus_1) {
      const dx = current_point.x - p_minus_1.x;
      if (dx !== 0 && Number.isFinite(dx)) {
        const slope = (current_point.y - p_minus_1.y) / dx;
        if (Number.isFinite(slope)) return slope;
      }
    }

    return null;
  }

  _calculateSlopeLegacy(point) {
    const series = point.series;
    const data = series.options.data;
    const n = data.length;

    if (n < 2) return null;

    const isArrayData = Array.isArray(data[0]);
    const index = data.findIndex(p => {
      if (isArrayData) {
        return p[0] === point.x && p[1] === point.y;
      }
      return p.x === point.x && p.y === point.y;
    });

    if (index === -1) return null;

    const getPointObject = (p) => {
      if (!p) return null;
      if (isArrayData) return { x: p[0], y: p[1] };
      return p;
    };

    const p_minus_1 = getPointObject(index > 0 ? data[index - 1] : null);
    const p_plus_1 = getPointObject(index < n - 1 ? data[index + 1] : null);
    const current_point = getPointObject(data[index]);

    if (p_minus_1 && p_plus_1) {
      const dx = p_plus_1.x - p_minus_1.x;
      return dx === 0 ? null : (p_plus_1.y - p_minus_1.y) / dx;
    } else if (p_plus_1) {
      const dx = p_plus_1.x - current_point.x;
      return dx === 0 ? null : (p_plus_1.y - current_point.y) / dx;
    } else if (p_minus_1) {
      const dx = current_point.x - p_minus_1.x;
      return dx === 0 ? null : (current_point.y - p_minus_1.y) / dx;
    }

    return null;
  }

  _findTangentMethodPoints(point, slope1) {
    const series = point.series;
    const data = series.options.data;
    const n = data.length;
    if (n < 2) return null;

    const isArrayData = Array.isArray(data[0]);
    const getPointObject = (p) => {
      if (!p) return null;
      if (isArrayData) return { x: p[0], y: p[1] };
      return { x: p.x, y: p.y };
    };

    const pFirst = getPointObject(data[0]);
    const pLast = getPointObject(data[n - 1]);
    const globalDeltaX = (pLast && pFirst) ? pLast.x - pFirst.x : 0;
    const globalDeltaY = (pLast && pFirst) ? pLast.y - pFirst.y : 0;
    const globalSlope = globalDeltaX !== 0 ? globalDeltaY / globalDeltaX : globalDeltaY;
    const globalSign = Math.sign(globalSlope);

    const slopes = [];
    let maxSlope = -Infinity;
    let jumpIndex = -1;
    let p1Index = -1;

    for (let i = 0; i < n; i++) {
      const p = getPointObject(data[i]);
      if ((p.x === point.x || Math.abs(p.x - point.x) < 1e-9) && (p.y === point.y || Math.abs(p.y - point.y) < 1e-9)) p1Index = i;

      const p_minus_1 = getPointObject(i > 0 ? data[i - 1] : null);
      const p_plus_1 = getPointObject(i < n - 1 ? data[i + 1] : null);
      let s = null;
      if (p_minus_1 && p_plus_1) {
        const dx = p_plus_1.x - p_minus_1.x;
        s = dx !== 0 ? (p_plus_1.y - p_minus_1.y) / dx : null;
      } else if (p_plus_1) {
        const dx = p_plus_1.x - p.x;
        s = dx !== 0 ? (p_plus_1.y - p.y) / dx : null;
      } else if (p_minus_1) {
        const dx = p.x - p_minus_1.x;
        s = dx !== 0 ? (p.y - p_minus_1.y) / dx : null;
      }
      slopes.push(s);

      const matchesGlobalSign = globalSign === 0 || (s !== null && Math.sign(s) === globalSign);
      if (s !== null && Number.isFinite(s) && matchesGlobalSign && Math.abs(s) > maxSlope) {
        maxSlope = Math.abs(s);
        jumpIndex = i;
      }
    }

    if (jumpIndex === -1) {
      for (let i = 0; i < n; i++) {
        const s = slopes[i];
        if (s !== null && Number.isFinite(s) && Math.abs(s) > maxSlope) {
          maxSlope = Math.abs(s);
          jumpIndex = i;
        }
      }
    }

    if (p1Index === -1 || jumpIndex === -1) return null;

    let bestP2Index = -1;
    let minDiff = Infinity;

    const searchStart = p1Index < jumpIndex ? jumpIndex + 1 : 0;
    const searchEnd = p1Index < jumpIndex ? n : jumpIndex;

    for (let i = searchStart; i < searchEnd; i++) {
      if (slopes[i] !== null && Number.isFinite(slopes[i])) {
        const diff = Math.abs(slopes[i] - slope1);
        if (diff < minDiff) {
          minDiff = diff;
          bestP2Index = i;
        }
      }
    }

    if (bestP2Index !== -1) {
      return {
        p1: getPointObject(data[p1Index]),
        p2: getPointObject(data[bestP2Index])
      };
    }
    return null;
  }

  drawTangent(event) {
    const g = this.grapher;
    g.hideFreeCrosshair();

    const chart = g.chart;
    if (!g._isInsidePlotBox(event.chartX, event.chartY, chart)) {
      return;
    }

    const point = g._findNearestPoint(event);
    if (!point) return;

    const slope = g._calculateSlope(point);
    if (slope === null || !Number.isFinite(slope)) return;

    const pixelX = point.plotX + chart.plotLeft;
    const pixelY = point.plotY + chart.plotTop;
    if (!g._isInsidePlotBox(pixelX, pixelY, chart)) {
      return;
    }

    let crosshairElements = {};

    if (g.crosshairMode === 'tangent-method') {
      crosshairElements.centerPoint = g._clipToPlot(g._drawEndpoint(pixelX, pixelY)[0], chart);
    } else {
      crosshairElements = g._drawStyledCrosshair(pixelX, pixelY, point.x, point.y);
    }

    const bounds = g._getAxisDataBounds(chart);
    const clippedTangent = g._clipInfiniteLineToAxisBounds(point.x, point.y, slope, bounds);
    let tangentLine = null;
    if (clippedTangent) {
      const p1 = { x: chart.xAxis[0].toPixels(clippedTangent.x1), y: chart.yAxis[0].toPixels(clippedTangent.y1) };
      const p2 = { x: chart.xAxis[0].toPixels(clippedTangent.x2), y: chart.yAxis[0].toPixels(clippedTangent.y2) };
      tangentLine = g._clipToPlot(
        chart.renderer.path(['M', p1.x, p1.y, 'L', p2.x, p2.y])
          .attr({ 'stroke-width': 2, stroke: 'rgba(0, 200, 100, 0.8)', zIndex: 4 }).add(),
        chart
      );
    }

    g.freeCrosshair = tangentLine ? { ...crosshairElements, tangentLine } : { ...crosshairElements };

    if (g.crosshairMode !== 'tangent-method') {
      g.freeCrosshair.slopeLabel = g._drawSlopeLabel(pixelX, pixelY, slope, chart);
    }
  }
}
