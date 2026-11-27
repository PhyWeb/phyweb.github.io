import { formatNumber, formatUnit } from '../../../common/formatter.js';

export default class AnnotationsRenderer {
  constructor(grapher) {
    this.grapher = grapher;
  }

  /**
   * Dessine une croix et ses labels en respectant le style original.
   */
  _drawStyledCrosshair(pixelX, pixelY, valueX, valueY, targetChart = this.grapher.chart) {
    const chart = targetChart;
    const renderer = chart.renderer;
    const significantDigits = this.grapher.data?.settings?.significantDigits ?? 4;
    const { plotLeft, plotTop, plotWidth, plotHeight } = chart;

    const elements = {};

    // Lignes
    elements.xLine = renderer.path(['M', pixelX, plotTop, 'L', pixelX, plotTop + plotHeight])
      .attr({ 'stroke-width': 1, stroke: '#555555', dashstyle: 'Dash', zIndex: 5 }).add();
    elements.yLine = renderer.path(['M', plotLeft, pixelY, 'L', plotLeft + plotWidth, pixelY])
      .attr({ 'stroke-width': 1, stroke: '#555555', dashstyle: 'Dash', zIndex: 5 }).add();

    // Labels avec le style d'origine
    const labelAttr = { fill: 'white', stroke: '#dbdbdb', 'stroke-width': 1, r: 6, padding: 8, zIndex: 6 };
    const labelCss = { color: 'black', fontSize: '14px' };

    elements.xLabel = renderer.label(formatNumber(valueX, significantDigits), 0, 0, 'callout').attr(labelAttr).css(labelCss).add();
    const xLabelBBox = elements.xLabel.getBBox();
    elements.xLabel.translate(pixelX - xLabelBBox.width / 2, plotTop + plotHeight - xLabelBBox.height - 5);

    elements.yLabel = renderer.label(formatNumber(valueY, significantDigits), 0, 0, 'callout').attr(labelAttr).css(labelCss).add();
    const yLabelBBox = elements.yLabel.getBBox();
    elements.yLabel.translate(plotLeft + 5, pixelY - yLabelBBox.height / 2);

    return elements;
  }

  /**
   * Dessine un simple point stylisé pour les extrémités des segments.
   */
  _drawEndpoint(pixelX, pixelY, targetChart = this.grapher.chart) {
    const chart = targetChart;
    const renderer = chart.renderer;

    const circle = renderer.circle(pixelX, pixelY, 4)
      .attr({
        fill: 'rgba(220, 53, 69, 0.9)',
        stroke: 'white',
        'stroke-width': 1,
        zIndex: 5
      }).add();

    return [circle];
  }

  _isInsidePlotBox(chartX, chartY, chart = this.grapher.chart) {
    if (!chart || !Number.isFinite(chartX) || !Number.isFinite(chartY)) return false;
    const { plotLeft, plotTop, plotWidth, plotHeight } = chart;
    if (![plotLeft, plotTop, plotWidth, plotHeight].every(Number.isFinite)) return false;
    return chartX >= plotLeft && chartX <= plotLeft + plotWidth &&
           chartY >= plotTop && chartY <= plotTop + plotHeight;
  }

  _clampToPlotBox(chartX, chartY, chart = this.grapher.chart) {
    if (!chart) return { chartX, chartY };
    const { plotLeft, plotTop, plotWidth, plotHeight } = chart;
    return {
      chartX: Math.max(plotLeft, Math.min(plotLeft + plotWidth, chartX)),
      chartY: Math.max(plotTop, Math.min(plotTop + plotHeight, chartY))
    };
  }

  _getPlotClipRect(targetChart = this.grapher.chart) {
    if (!targetChart?.renderer || typeof targetChart.renderer.clipRect !== 'function') {
      return null;
    }
    const { plotLeft, plotTop, plotWidth, plotHeight } = targetChart;
    if (![plotLeft, plotTop, plotWidth, plotHeight].every(Number.isFinite) || plotWidth <= 0 || plotHeight <= 0) {
      return null;
    }
    if (!targetChart._annotationsClipRect || targetChart._annotationsClipRect.destroyed) {
      targetChart._annotationsClipRect = targetChart.renderer.clipRect(plotLeft, plotTop, plotWidth, plotHeight);
    } else {
      targetChart._annotationsClipRect.attr({ x: plotLeft, y: plotTop, width: plotWidth, height: plotHeight });
    }
    return targetChart._annotationsClipRect;
  }

  _clipToPlot(element, targetChart = this.grapher.chart) {
    if (!element || typeof element.clip !== 'function') return element;
    const clipRect = this._getPlotClipRect(targetChart);
    if (clipRect) {
      element.clip(clipRect);
    }
    return element;
  }

  _getAxisDataBounds(chart = this.grapher.chart) {
    const xExt = chart?.xAxis?.[0]?.getExtremes?.();
    const yExt = chart?.yAxis?.[0]?.getExtremes?.();
    if (!xExt || !yExt) return null;
    const { min: xMin, max: xMax } = xExt;
    const { min: yMin, max: yMax } = yExt;
    if (![xMin, xMax, yMin, yMax].every(Number.isFinite) || xMin >= xMax || yMin >= yMax) {
      return null;
    }
    return { xMin, xMax, yMin, yMax };
  }

  _isDataPointInBounds(pt, bounds) {
    if (!pt || !Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return false;
    if (!bounds) return true;
    return pt.x >= bounds.xMin && pt.x <= bounds.xMax &&
           pt.y >= bounds.yMin && pt.y <= bounds.yMax;
  }

  _clipLineToAxisBounds(x1, y1, x2, y2, bounds) {
    if (![x1, y1, x2, y2].every(Number.isFinite)) return null;
    if (!bounds) return { x1, y1, x2, y2 };

    const { xMin, xMax, yMin, yMax } = bounds;
    const dx = x2 - x1;
    const dy = y2 - y1;
    let t0 = 0;
    let t1 = 1;

    const checks = [
      [-dx, x1 - xMin],
      [dx, xMax - x1],
      [-dy, y1 - yMin],
      [dy, yMax - y1]
    ];

    for (const [p, q] of checks) {
      if (p === 0) {
        if (q < 0) return null;
      } else {
        const r = q / p;
        if (p < 0) {
          if (r > t1) return null;
          if (r > t0) t0 = r;
        } else {
          if (r < t0) return null;
          if (r < t1) t1 = r;
        }
      }
    }

    return {
      x1: x1 + t0 * dx,
      y1: y1 + t0 * dy,
      x2: x1 + t1 * dx,
      y2: y1 + t1 * dy
    };
  }

  _clipInfiniteLineToAxisBounds(px, py, slope, bounds) {
    if (![px, py, slope].every(Number.isFinite) || !bounds) return null;
    const { xMin, xMax, yMin, yMax } = bounds;

    if (slope === 0) {
      if (py < yMin || py > yMax) return null;
      return { x1: xMin, y1: py, x2: xMax, y2: py };
    }

    const xAtYMin = px + (yMin - py) / slope;
    const xAtYMax = px + (yMax - py) / slope;
    const xLow = Math.max(xMin, Math.min(xAtYMin, xAtYMax));
    const xHigh = Math.min(xMax, Math.max(xAtYMin, xAtYMax));

    if (xLow > xHigh) return null;

    const yLow = Math.max(yMin, Math.min(yMax, py + slope * (xLow - px)));
    const yHigh = Math.max(yMin, Math.min(yMax, py + slope * (xHigh - px)));

    return { x1: xLow, y1: yLow, x2: xHigh, y2: yHigh };
  }

  _drawSlopeLabel(pixelX, pixelY, slope, targetChart = this.grapher.chart) {
    const significantDigits = this.grapher.data?.settings?.significantDigits ?? 4;
    const exportScale = targetChart.renderer?.forExport ? (targetChart.options?.chart?.exportTextScale || 1) : 1;
    const slopeText = `pente = ${formatNumber(slope, significantDigits)}`;
    const slopeLabel = targetChart.renderer.label(slopeText, 0, 0, 'callout')
      .attr({ fill: 'white', stroke: '#dbdbdb', 'stroke-width': 1, r: 6, padding: Math.round(8 * exportScale), zIndex: 6 })
      .css({ color: 'black', fontSize: `${Math.round(14 * exportScale)}px` })
      .add();

    const labelBBox = slopeLabel.getBBox();
    let labelX = pixelX + 15 > targetChart.plotWidth + targetChart.plotLeft - labelBBox.width
      ? pixelX - 15 - labelBBox.width
      : pixelX + 15;
    let labelY = slope > 0 ? pixelY + 15 : pixelY - 15 - labelBBox.height;

    if (labelY < targetChart.plotTop) {
      labelY = pixelY + 15;
    }
    if (labelY + labelBBox.height > targetChart.plotTop + targetChart.plotHeight) {
      labelY = pixelY - 15 - labelBBox.height;
    }

    labelX = Math.max(targetChart.plotLeft, Math.min(labelX, targetChart.plotLeft + targetChart.plotWidth - labelBBox.width));
    labelY = Math.max(targetChart.plotTop, Math.min(labelY, targetChart.plotTop + targetChart.plotHeight - labelBBox.height));

    slopeLabel.translate(labelX, labelY);
    return slopeLabel;
  }

  /**
   * Dessine toutes les annotations stockées dans grapher.data.annotations.
   */
  drawAnnotations(targetChart = this.grapher.chart) {
    if (!targetChart || !targetChart.renderer) {
      return;
    }
    const g = this.grapher;
    const chart = targetChart;
    const xAxis = chart.xAxis[0];
    const yAxis = chart.yAxis[0];
    const significantDigits = g.data?.settings?.significantDigits ?? 4;
    const bounds = this._getAxisDataBounds(chart);

    // Supprimer les anciennes annotations sur ce graphique s’il y en a
    if (Array.isArray(targetChart.renderedAnnotations)) {
      targetChart.renderedAnnotations.forEach(rendered => {
        if (Array.isArray(rendered)) {
          rendered.forEach(el => el?.destroy?.());
        } else if (typeof rendered === 'object' && rendered !== null) {
          Object.values(rendered).forEach(el => el?.destroy?.());
        }
      });
    }
    targetChart.renderedAnnotations = [];

    if (targetChart === g.chart) {
      g.renderedAnnotations = targetChart.renderedAnnotations;
    }

    // Dessiner chaque annotation
    g.data.annotations.forEach(annotation => {
      if (annotation.xCurve && g.currentXCurve && annotation.xCurve !== g.currentXCurve) {
        return;
      }

      if (annotation.type === 'point') {
        const pixelX = xAxis.toPixels(annotation.x);
        const pixelY = yAxis.toPixels(annotation.y);

        if (this._isInsidePlotBox(pixelX, pixelY, chart)) {
          const renderedCrosshair = this._drawStyledCrosshair(pixelX, pixelY, annotation.x, annotation.y, targetChart);
          targetChart.renderedAnnotations.push(renderedCrosshair);
        }
      } else if (annotation.type === 'segment') {
        const [p1, p2] = annotation.points;
        const [pixelX1, pixelY1] = [xAxis.toPixels(p1.x), yAxis.toPixels(p1.y)];
        const [pixelX2, pixelY2] = [xAxis.toPixels(p2.x), yAxis.toPixels(p2.y)];

        const segmentElements = [];

        const clippedSeg = this._clipLineToAxisBounds(p1.x, p1.y, p2.x, p2.y, bounds);
        if (clippedSeg) {
          const mainLine = chart.renderer.path([
            'M', xAxis.toPixels(clippedSeg.x1), yAxis.toPixels(clippedSeg.y1),
            'L', xAxis.toPixels(clippedSeg.x2), yAxis.toPixels(clippedSeg.y2)
          ]).attr({ 'stroke-width': 2, stroke: 'rgba(220, 53, 69, 0.9)', zIndex: 4 }).add();
          segmentElements.push(this._clipToPlot(mainLine, targetChart));
        }

        if (this._isDataPointInBounds(p1, bounds)) {
          const ep1 = this._drawEndpoint(pixelX1, pixelY1, targetChart);
          ep1.forEach(el => this._clipToPlot(el, targetChart));
          segmentElements.push(...ep1);
        }
        if (this._isDataPointInBounds(p2, bounds)) {
          const ep2 = this._drawEndpoint(pixelX2, pixelY2, targetChart);
          ep2.forEach(el => this._clipToPlot(el, targetChart));
          segmentElements.push(...ep2);
        }

        const deltaLineAttr = { 'stroke-width': 1, stroke: 'rgba(0, 123, 255, 0.8)', 'stroke-dasharray': '4,4', zIndex: 3 };
        const clippedDeltaX = this._clipLineToAxisBounds(p1.x, p1.y, p2.x, p1.y, bounds);
        if (clippedDeltaX) {
          const dxLine = chart.renderer.path([
            'M', xAxis.toPixels(clippedDeltaX.x1), yAxis.toPixels(clippedDeltaX.y1),
            'L', xAxis.toPixels(clippedDeltaX.x2), yAxis.toPixels(clippedDeltaX.y2)
          ]).attr(deltaLineAttr).add();
          segmentElements.push(this._clipToPlot(dxLine, targetChart));
        }

        const clippedDeltaY = this._clipLineToAxisBounds(p2.x, p1.y, p2.x, p2.y, bounds);
        if (clippedDeltaY) {
          const dyLine = chart.renderer.path([
            'M', xAxis.toPixels(clippedDeltaY.x1), yAxis.toPixels(clippedDeltaY.y1),
            'L', xAxis.toPixels(clippedDeltaY.x2), yAxis.toPixels(clippedDeltaY.y2)
          ]).attr(deltaLineAttr).add();
          segmentElements.push(this._clipToPlot(dyLine, targetChart));
        }

        const xCurveObj = g.data.getCurveByTitle(g.currentXCurve);
        const firstYSeries = chart.series.find(s => s.visible && s.yAxis?.index === 0);
        const exportLabels = targetChart.renderer?.forExport ? targetChart.options?.chart?.exportCurveLabels : null;
        const xOverride = exportLabels && g.currentXCurve ? exportLabels[g.currentXCurve] : null;
        const yOverride = exportLabels && firstYSeries?.name ? exportLabels[firstYSeries.name] : null;

        const resolvedXUnit = formatUnit((xOverride && typeof xOverride.unit === 'string') ? xOverride.unit : (xCurveObj?.unit || ''));
        const xUnit = resolvedXUnit ? ` ${resolvedXUnit}` : '';
        const rawYUnit = formatUnit((yOverride && typeof yOverride.unit === 'string')
          ? yOverride.unit
          : (annotation.yUnit !== undefined
              ? annotation.yUnit
              : (firstYSeries?.userOptions?.unit || '')));
        const yUnit = rawYUnit ? ` ${rawYUnit}` : '';

        const exportScale = targetChart.renderer?.forExport ? (targetChart.options?.chart?.exportTextScale || 1) : 1;
        const labelAttr = { fill: 'rgba(255, 255, 255, 0.85)', stroke: '#dbdbdb', 'stroke-width': 1, r: 4, padding: Math.round(5 * exportScale), zIndex: 6 };
        const labelCss = { color: 'black', fontSize: `${Math.round(12 * exportScale)}px` };

        if (clippedDeltaX) {
          const dxText = `Δx = ${formatNumber(p2.x - p1.x, significantDigits)}${xUnit}`;
          const dxLabel = chart.renderer.label(dxText, 0, 0).attr(labelAttr).css(labelCss).add();
          const dxBBox = dxLabel.getBBox();
          const midPixX = (xAxis.toPixels(clippedDeltaX.x1) + xAxis.toPixels(clippedDeltaX.x2)) / 2;
          let dxLabelX = midPixX - dxBBox.width / 2;
          let dxLabelY = pixelY1 - (pixelY1 > pixelY2 ? 5 : dxBBox.height + 5);
          if (Number.isFinite(chart.plotLeft) && Number.isFinite(chart.plotWidth)) {
            dxLabelX = Math.max(chart.plotLeft, Math.min(dxLabelX, chart.plotLeft + chart.plotWidth - dxBBox.width));
          }
          if (Number.isFinite(chart.plotTop) && Number.isFinite(chart.plotHeight)) {
            dxLabelY = Math.max(chart.plotTop, Math.min(dxLabelY, chart.plotTop + chart.plotHeight - dxBBox.height));
          }
          dxLabel.translate(dxLabelX, dxLabelY);
          segmentElements.push(dxLabel);
        }

        if (clippedDeltaY) {
          const dyText = `Δy = ${formatNumber(p2.y - p1.y, significantDigits)}${yUnit}`;
          const dyLabel = chart.renderer.label(dyText, 0, 0).attr(labelAttr).css(labelCss).add();
          const dyBBox = dyLabel.getBBox();
          const midPixY = (yAxis.toPixels(clippedDeltaY.y1) + yAxis.toPixels(clippedDeltaY.y2)) / 2;
          let dyLabelX = pixelX2 + (pixelX2 > pixelX1 ? 5 : -dyBBox.width - 5);
          let dyLabelY = midPixY - dyBBox.height / 2;
          if (Number.isFinite(chart.plotLeft) && Number.isFinite(chart.plotWidth)) {
            dyLabelX = Math.max(chart.plotLeft, Math.min(dyLabelX, chart.plotLeft + chart.plotWidth - dyBBox.width));
          }
          if (Number.isFinite(chart.plotTop) && Number.isFinite(chart.plotHeight)) {
            dyLabelY = Math.max(chart.plotTop, Math.min(dyLabelY, chart.plotTop + chart.plotHeight - dyBBox.height));
          }
          dyLabel.translate(dyLabelX, dyLabelY);
          segmentElements.push(dyLabel);
        }

        if (segmentElements.length > 0) {
          targetChart.renderedAnnotations.push(segmentElements);
        }
      } else if (annotation.type === 'tangent') {
        const { point, slope } = annotation;
        if (!Number.isFinite(slope)) return;
        const pixelX = xAxis.toPixels(point.x);
        const pixelY = yAxis.toPixels(point.y);

        const renderedTangent = {};
        const pointVisible = this._isDataPointInBounds(point, bounds) && this._isInsidePlotBox(pixelX, pixelY, chart);

        if (pointVisible) {
          Object.assign(renderedTangent, this._drawStyledCrosshair(pixelX, pixelY, point.x, point.y, targetChart));
        }

        const clippedTangent = this._clipInfiniteLineToAxisBounds(point.x, point.y, slope, bounds);
        if (clippedTangent) {
          const p1 = { x: xAxis.toPixels(clippedTangent.x1), y: yAxis.toPixels(clippedTangent.y1) };
          const p2 = { x: xAxis.toPixels(clippedTangent.x2), y: yAxis.toPixels(clippedTangent.y2) };
          renderedTangent.tangentLine = this._clipToPlot(
            chart.renderer.path(['M', p1.x, p1.y, 'L', p2.x, p2.y])
              .attr({ 'stroke-width': 2, stroke: 'rgba(0, 200, 100, 0.8)', zIndex: 4 }).add(),
            targetChart
          );
        }

        if (pointVisible) {
          renderedTangent.slopeLabel = this._drawSlopeLabel(pixelX, pixelY, slope, targetChart);
        }

        if (Object.keys(renderedTangent).length > 0) {
          targetChart.renderedAnnotations.push(renderedTangent);
        }
      } else if (annotation.type === 'tangent-method') {
        const { point1, point2, slope, seriesName } = annotation;
        if (!Number.isFinite(slope)) return;
        const pixelX1 = xAxis.toPixels(point1.x);
        const pixelY1 = yAxis.toPixels(point1.y);
        const pixelX2 = xAxis.toPixels(point2.x);
        const pixelY2 = yAxis.toPixels(point2.y);

        const renderedTangentMethod = {};

        if (this._isDataPointInBounds(point1, bounds)) {
          renderedTangentMethod.pt1 = this._clipToPlot(this._drawEndpoint(pixelX1, pixelY1, targetChart)[0], targetChart);
        }
        if (this._isDataPointInBounds(point2, bounds)) {
          renderedTangentMethod.pt2 = this._clipToPlot(this._drawEndpoint(pixelX2, pixelY2, targetChart)[0], targetChart);
        }

        const drawLine = (p, color, dashStyle = 'Solid') => {
          const clipped = this._clipInfiniteLineToAxisBounds(p.x, p.y, slope, bounds);
          if (!clipped) return null;
          const pMin = { x: xAxis.toPixels(clipped.x1), y: yAxis.toPixels(clipped.y1) };
          const pMax = { x: xAxis.toPixels(clipped.x2), y: yAxis.toPixels(clipped.y2) };
          return this._clipToPlot(
            chart.renderer.path(['M', pMin.x, pMin.y, 'L', pMax.x, pMax.y])
              .attr({ 'stroke-width': 2, stroke: color, dashstyle: dashStyle, zIndex: 4 }).add(),
            targetChart
          );
        };

        const line1 = drawLine(point1, 'rgba(0, 200, 100, 0.8)');
        if (line1) renderedTangentMethod.line1 = line1;
        const line2 = drawLine(point2, 'rgba(0, 200, 100, 0.8)');
        if (line2) renderedTangentMethod.line2 = line2;

        const b1 = point1.y - slope * point1.x;
        const b2 = point2.y - slope * point2.x;
        const bMed = (b1 + b2) / 2;
        const pMed = { x: 0, y: bMed };
        const medianLine = drawLine(pMed, 'rgba(0, 200, 100, 0.5)', 'Dash');
        if (medianLine) renderedTangentMethod.medianLine = medianLine;

        const series = chart.series.find(s => s.name === seriesName);
        if (series) {
          const data = series.options.data;
          const isArrayData = Array.isArray(data[0]);
          const getPt = (p) => isArrayData ? { x: p[0], y: p[1] } : { x: p.x, y: p.y };
          let eqPoint = null;

          const minSearchX = Math.min(point1.x, point2.x);
          const maxSearchX = Math.max(point1.x, point2.x);
          const xMid = (point1.x + point2.x) / 2;
          const candidates = [];

          for (let i = 0; i < data.length - 1; i++) {
            const pA = getPt(data[i]);
            const pB = getPt(data[i + 1]);

            if (Math.max(pA.x, pB.x) < minSearchX || Math.min(pA.x, pB.x) > maxSearchX) {
              continue;
            }
            if (pB.x === pA.x) {
              const xInt = pA.x;
              const yInt = slope * xInt + bMed;
              if (yInt >= Math.min(pA.y, pB.y) && yInt <= Math.max(pA.y, pB.y)) {
                candidates.push({
                  pt: { x: xInt, y: yInt },
                  absSlope: Infinity,
                  distToMid: Math.abs(xInt - xMid)
                });
              }
            } else {
              const mSeg = (pB.y - pA.y) / (pB.x - pA.x);
              if (mSeg !== slope) {
                const xInt = (pA.y - mSeg * pA.x - bMed) / (slope - mSeg);
                const segMinX = Math.min(pA.x, pB.x);
                const segMaxX = Math.max(pA.x, pB.x);
                if (xInt >= segMinX - 1e-9 && xInt <= segMaxX + 1e-9) {
                  const clampedX = Math.max(segMinX, Math.min(segMaxX, xInt));
                  const yInt = slope * clampedX + bMed;
                  candidates.push({
                    pt: { x: clampedX, y: yInt },
                    absSlope: Math.abs(mSeg),
                    distToMid: Math.abs(clampedX - xMid)
                  });
                }
              }
            }
          }

          if (candidates.length > 0) {
            candidates.sort((a, b) => {
              if (!Number.isFinite(b.absSlope) && Number.isFinite(a.absSlope)) return 1;
              if (!Number.isFinite(a.absSlope) && Number.isFinite(b.absSlope)) return -1;
              if (!Number.isFinite(a.absSlope) && !Number.isFinite(b.absSlope)) {
                return a.distToMid - b.distToMid;
              }
              const maxS = Math.max(a.absSlope, b.absSlope);
              if (maxS > 0 && Math.abs(a.absSlope - b.absSlope) / maxS > 0.25) {
                return b.absSlope - a.absSlope;
              }
              return a.distToMid - b.distToMid;
            });
            eqPoint = candidates[0].pt;
          }

          if (eqPoint && this._isDataPointInBounds(eqPoint, bounds)) {
            const pxEq = xAxis.toPixels(eqPoint.x);
            const pyEq = yAxis.toPixels(eqPoint.y);
            renderedTangentMethod.eqPoint = this._clipToPlot(
              chart.renderer.circle(pxEq, pyEq, 4)
                .attr({ fill: 'rgba(220, 53, 69, 0.9)', stroke: 'white', 'stroke-width': 1, zIndex: 6 }).add(),
              targetChart
            );

            const xCurveObj = g.data.getCurveByTitle(g.currentXCurve);
            const yCurveObj = g.data.getCurveByTitle(seriesName);

            const isExport = Boolean(targetChart.renderer?.forExport);
            const exportScale = isExport ? (targetChart.options?.chart?.exportTextScale || 1) : 1;
            const exportLabels = isExport ? targetChart.options?.chart?.exportCurveLabels : null;
            const xKey = xCurveObj?.title || g.currentXCurve || '';
            const yKey = yCurveObj?.title || seriesName || '';
            const xOverride = exportLabels && xKey ? exportLabels[xKey] : null;
            const yOverride = exportLabels && yKey ? exportLabels[yKey] : null;

            const eqSub = isExport
              ? '<tspan style="font-size: 0.72em; baseline-shift: sub;">eq</tspan>'
              : '<sub>eq</sub>';
            const xBaseName = (xOverride && xOverride.title) ? xOverride.title : (xKey || 'V');
            const yBaseName = (yOverride && yOverride.title) ? yOverride.title : (yKey || 'pH');
            const xLabelName = xBaseName + eqSub;
            const yLabelName = yBaseName + eqSub;

            const resolvedXUnit = formatUnit((xOverride && typeof xOverride.unit === 'string') ? xOverride.unit : (xCurveObj?.unit || ''));
            const resolvedYUnit = formatUnit((yOverride && typeof yOverride.unit === 'string')
              ? yOverride.unit
              : (yCurveObj?.unit || series?.userOptions?.unit || ''));
            const xUnit = resolvedXUnit ? ` ${resolvedXUnit}` : '';
            const yUnit = resolvedYUnit ? ` ${resolvedYUnit}` : '';

            const eqText = `<b>${xLabelName}</b> = ${formatNumber(eqPoint.x, significantDigits)}${xUnit}<br/><b>${yLabelName}</b> = ${formatNumber(eqPoint.y, significantDigits)}${yUnit}`;
            const eqLabel = chart.renderer.label(eqText, 0, 0, 'callout', null, null, !isExport)
              .attr({
                fill: 'rgba(255, 255, 255, 0.95)',
                stroke: '#dbdbdb',
                'stroke-width': 1,
                r: 6,
                padding: Math.round(8 * exportScale),
                zIndex: 6
              })
              .css({
                color: 'black',
                fontSize: `${Math.round(14 * exportScale)}px`
              }).add();

            const eqBBox = eqLabel.getBBox();
            let eqLabelX = pxEq + 12;
            if (eqLabelX + eqBBox.width > chart.plotLeft + chart.plotWidth) {
              eqLabelX = pxEq - 12 - eqBBox.width;
            }
            let eqLabelY = pyEq - 20;
            eqLabelX = Math.max(chart.plotLeft, Math.min(eqLabelX, chart.plotLeft + chart.plotWidth - eqBBox.width));
            eqLabelY = Math.max(chart.plotTop, Math.min(eqLabelY, chart.plotTop + chart.plotHeight - eqBBox.height));
            eqLabel.translate(eqLabelX, eqLabelY);

            renderedTangentMethod.eqLabel = eqLabel;
          }
        }

        if (Object.keys(renderedTangentMethod).length > 0) {
          targetChart.renderedAnnotations.push(renderedTangentMethod);
        }
      }
    });
  }

  /**
   * Supprime toutes les annotations (données et affichage).
   */
  clearAllAnnotations() {
    this.grapher.data.annotations = [];

    if (this.grapher.uiManager) {
      this.grapher.uiManager.updateClearAnnotationsButtonVisibility();
    }

    if (this.grapher.chart) {
      this.grapher.chart.redraw();
    }
  }
}
