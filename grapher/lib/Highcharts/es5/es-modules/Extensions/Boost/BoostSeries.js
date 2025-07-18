/* *
 *
 *  (c) 2019-2025 Highsoft AS
 *
 *  Boost module: stripped-down renderer for higher performance
 *
 *  License: highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
import BoostableMap from './BoostableMap.js';
import Boostables from './Boostables.js';
import BoostChart from './BoostChart.js';
var getBoostClipRect = BoostChart.getBoostClipRect, isChartSeriesBoosting = BoostChart.isChartSeriesBoosting;
import D from '../../Core/Defaults.js';
var getOptions = D.getOptions;
import H from '../../Core/Globals.js';
var composed = H.composed, doc = H.doc, noop = H.noop, win = H.win;
import U from '../../Core/Utilities.js';
var addEvent = U.addEvent, destroyObjectProperties = U.destroyObjectProperties, error = U.error, extend = U.extend, fireEvent = U.fireEvent, isArray = U.isArray, isNumber = U.isNumber, pick = U.pick, pushUnique = U.pushUnique, wrap = U.wrap, defined = U.defined;
import WGLRenderer from './WGLRenderer.js';
import DataTableCore from '../../Data/DataTableCore.js';
/* *
 *
 *  Constants
 *
 * */
var CHUNK_SIZE = 3000;
/* *
 *
 *  Variables
 *
 * */
var index, mainCanvas;
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function allocateIfNotSeriesBoosting(renderer, series) {
    var boost = series.boost;
    if (renderer &&
        boost &&
        boost.target &&
        boost.canvas &&
        !isChartSeriesBoosting(series.chart)) {
        renderer.allocateBufferForSingleSeries(series);
    }
}
/**
 * Return true if ths boost.enabled option is true
 *
 * @private
 * @param {Highcharts.Chart} chart
 * The chart
 * @return {boolean}
 * True, if boost is enabled.
 */
function boostEnabled(chart) {
    return pick((chart &&
        chart.options &&
        chart.options.boost &&
        chart.options.boost.enabled), true);
}
/**
 * @private
 */
function compose(SeriesClass, seriesTypes, PointClass, wglMode) {
    if (pushUnique(composed, 'Boost.Series')) {
        var plotOptions_1 = getOptions().plotOptions, seriesProto_1 = SeriesClass.prototype;
        addEvent(SeriesClass, 'destroy', onSeriesDestroy);
        addEvent(SeriesClass, 'hide', onSeriesHide);
        if (wglMode) {
            seriesProto_1.renderCanvas = seriesRenderCanvas;
        }
        wrap(seriesProto_1, 'getExtremes', wrapSeriesGetExtremes);
        wrap(seriesProto_1, 'processData', wrapSeriesProcessData);
        wrap(seriesProto_1, 'searchPoint', wrapSeriesSearchPoint);
        [
            'translate',
            'generatePoints',
            'drawTracker',
            'drawPoints',
            'render'
        ].forEach(function (method) {
            return wrapSeriesFunctions(seriesProto_1, seriesTypes, method);
        });
        wrap(PointClass.prototype, 'firePointEvent', function (proceed, type, e) {
            var _a, _b;
            if (type === 'click' && this.series.boosted) {
                var point = e.point;
                if ((point.dist || point.distX) >= ((_b = (_a = point.series.options.marker) === null || _a === void 0 ? void 0 : _a.radius) !== null && _b !== void 0 ? _b : 10)) {
                    return;
                }
            }
            return proceed.apply(this, [].slice.call(arguments, 1));
        });
        // Set default options
        Boostables.forEach(function (type) {
            var typePlotOptions = plotOptions_1[type];
            if (typePlotOptions) {
                typePlotOptions.boostThreshold = 5000;
                typePlotOptions.boostData = [];
                seriesTypes[type].prototype.fillOpacity = true;
            }
        });
        if (wglMode) {
            var AreaSeries = seriesTypes.area, AreaSplineSeries = seriesTypes.areaspline, BubbleSeries = seriesTypes.bubble, ColumnSeries = seriesTypes.column, HeatmapSeries = seriesTypes.heatmap, ScatterSeries = seriesTypes.scatter, TreemapSeries = seriesTypes.treemap;
            if (AreaSeries) {
                extend(AreaSeries.prototype, {
                    fill: true,
                    fillOpacity: true,
                    sampling: true
                });
            }
            if (AreaSplineSeries) {
                extend(AreaSplineSeries.prototype, {
                    fill: true,
                    fillOpacity: true,
                    sampling: true
                });
            }
            if (BubbleSeries) {
                var bubbleProto_1 = BubbleSeries.prototype;
                // By default, the bubble series does not use the KD-tree, so
                // force it to.
                delete bubbleProto_1.buildKDTree;
                // SeriesTypes.bubble.prototype.directTouch = false;
                // Needed for markers to work correctly
                wrap(bubbleProto_1, 'markerAttribs', function (proceed) {
                    if (this.boosted) {
                        return false;
                    }
                    return proceed.apply(this, [].slice.call(arguments, 1));
                });
            }
            if (ColumnSeries) {
                extend(ColumnSeries.prototype, {
                    fill: true,
                    sampling: true
                });
            }
            if (ScatterSeries) {
                ScatterSeries.prototype.fill = true;
            }
            // We need to handle heatmaps separately, since we can't perform the
            // size/color calculations in the shader easily.
            // @todo This likely needs future optimization.
            [HeatmapSeries, TreemapSeries].forEach(function (SC) {
                if (SC) {
                    wrap(SC.prototype, 'drawPoints', wrapSeriesDrawPoints);
                }
            });
        }
    }
    return SeriesClass;
}
/**
 * Create a canvas + context and attach it to the target
 *
 * @private
 * @function createAndAttachRenderer
 *
 * @param {Highcharts.Chart} chart
 * the chart
 *
 * @param {Highcharts.Series} series
 * the series
 *
 * @return {Highcharts.BoostGLRenderer}
 * the canvas renderer
 */
function createAndAttachRenderer(chart, series) {
    var _a, _b, _c;
    var ChartClass = chart.constructor, targetGroup = chart.seriesGroup || series.group, alpha = 1;
    var width = chart.chartWidth, height = chart.chartHeight, target = chart, foSupported = typeof SVGForeignObjectElement !== 'undefined', hasClickHandler = false;
    if (isChartSeriesBoosting(chart)) {
        target = chart;
    }
    else {
        target = series;
        hasClickHandler = Boolean(((_a = series.options.events) === null || _a === void 0 ? void 0 : _a.click) ||
            ((_c = (_b = series.options.point) === null || _b === void 0 ? void 0 : _b.events) === null || _c === void 0 ? void 0 : _c.click));
    }
    var boost = target.boost =
        target.boost ||
            {};
    // Support for foreignObject is flimsy as best.
    // IE does not support it, and Chrome has a bug which messes up
    // the canvas draw order.
    // As such, we force the Image fallback for now, but leaving the
    // actual Canvas path in-place in case this changes in the future.
    foSupported = false;
    if (!mainCanvas) {
        mainCanvas = doc.createElement('canvas');
    }
    if (!boost.target) {
        boost.canvas = mainCanvas;
        // Fall back to image tag if foreignObject isn't supported,
        // or if we're exporting.
        if (chart.renderer.forExport || !foSupported) {
            target.renderTarget = boost.target = chart.renderer.image('', 0, 0, width, height)
                .addClass('highcharts-boost-canvas')
                .add(targetGroup);
            boost.clear = function () {
                boost.target.attr({
                    // Insert a blank pixel (#17182)
                    /* eslint-disable-next-line max-len*/
                    href: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
                });
            };
            boost.copy = function () {
                boost.resize();
                boost.target.attr({
                    href: boost.canvas.toDataURL('image/png')
                });
            };
        }
        else {
            boost.targetFo = chart.renderer
                .createElement('foreignObject')
                .add(targetGroup);
            target.renderTarget = boost.target =
                doc.createElement('canvas');
            boost.targetCtx = boost.target.getContext('2d');
            boost.targetFo.element.appendChild(boost.target);
            boost.clear = function () {
                boost.target.width = boost.canvas.width;
                boost.target.height = boost.canvas.height;
            };
            boost.copy = function () {
                boost.target.width = boost.canvas.width;
                boost.target.height = boost.canvas.height;
                boost.targetCtx.drawImage(boost.canvas, 0, 0);
            };
        }
        boost.resize = function () {
            var _a, _b;
            width = chart.chartWidth;
            height = chart.chartHeight;
            (boost.targetFo || boost.target)
                .attr({
                x: 0,
                y: 0,
                width: width,
                height: height
            })
                .css({
                pointerEvents: hasClickHandler ? void 0 : 'none',
                mixedBlendMode: 'normal',
                opacity: alpha
            })
                .addClass(hasClickHandler ? 'highcharts-tracker' : '');
            if (target instanceof ChartClass) {
                (_b = (_a = target.boost) === null || _a === void 0 ? void 0 : _a.markerGroup) === null || _b === void 0 ? void 0 : _b.translate(chart.plotLeft, chart.plotTop);
            }
        };
        boost.clipRect = chart.renderer.clipRect();
        (boost.targetFo || boost.target)
            .attr({
            // Set the z index of the boost target to that of the last
            // series using it. This logic is not perfect, as it will not
            // handle interleaved series with boost enabled or disabled. But
            // it will cover the most common use case of one or more
            // successive boosted or non-boosted series (#9819).
            zIndex: series.options.zIndex
        });
        if (target instanceof ChartClass) {
            target.boost.markerGroup = target.renderer
                .g()
                .add(targetGroup)
                .translate(series.xAxis.pos, series.yAxis.pos);
        }
    }
    boost.canvas.width = width;
    boost.canvas.height = height;
    if (boost.clipRect) {
        var box = getBoostClipRect(chart, target), 
        // When using panes, the image itself must be clipped. When not
        // using panes, it is better to clip the target group, because then
        // we preserve clipping on touch- and mousewheel zoom preview.
        clippedElement = (box.width === chart.clipBox.width &&
            box.height === chart.clipBox.height) ? targetGroup :
            (boost.targetFo || boost.target);
        boost.clipRect.attr(box);
        clippedElement === null || clippedElement === void 0 ? void 0 : clippedElement.clip(boost.clipRect);
    }
    boost.resize();
    boost.clear();
    if (!boost.wgl) {
        boost.wgl = new WGLRenderer(function (wgl) {
            if (wgl.settings.debug.timeBufferCopy) {
                console.time('buffer copy'); // eslint-disable-line no-console
            }
            boost.copy();
            if (wgl.settings.debug.timeBufferCopy) {
                console.timeEnd('buffer copy'); // eslint-disable-line no-console
            }
        });
        if (!boost.wgl.init(boost.canvas)) {
            // The OGL renderer couldn't be inited. This likely means a shader
            // error as we wouldn't get to this point if there was no WebGL
            // support.
            error('[highcharts boost] - unable to init WebGL renderer');
        }
        boost.wgl.setOptions(chart.options.boost || {});
        if (target instanceof ChartClass) {
            boost.wgl.allocateBuffer(chart);
        }
    }
    boost.wgl.setSize(width, height);
    return boost.wgl;
}
/**
 * If implemented in the core, parts of this can probably be
 * shared with other similar methods in Highcharts.
 * @private
 * @function Highcharts.Series#destroyGraphics
 */
function destroyGraphics(series) {
    var points = series.points;
    if (points) {
        var point = void 0, i = void 0;
        for (i = 0; i < points.length; i = i + 1) {
            point = points[i];
            if (point && point.destroyElements) {
                point.destroyElements(); // #7557
            }
        }
    }
    ['graph', 'area', 'tracker'].forEach(function (prop) {
        var seriesProp = series[prop];
        if (seriesProp) {
            series[prop] = seriesProp.destroy();
        }
    });
    for (var _i = 0, _a = series.zones; _i < _a.length; _i++) {
        var zone = _a[_i];
        destroyObjectProperties(zone, void 0, true);
    }
}
/**
 * An "async" foreach loop. Uses a setTimeout to keep the loop from blocking the
 * UI thread.
 *
 * @private
 * @param {Array<unknown>} arr
 * The array to loop through.
 * @param {Function} fn
 * The callback to call for each item.
 * @param {Function} finalFunc
 * The callback to call when done.
 * @param {number} [chunkSize]
 * The number of iterations per timeout.
 * @param {number} [i]
 * The current index.
 * @param {boolean} [noTimeout]
 * Set to true to skip timeouts.
 */
function eachAsync(arr, fn, finalFunc, chunkSize, i, noTimeout) {
    i = i || 0;
    chunkSize = chunkSize || CHUNK_SIZE;
    var threshold = i + chunkSize;
    var proceed = true;
    while (proceed && i < threshold && i < arr.length) {
        proceed = fn(arr[i], i);
        ++i;
    }
    if (proceed) {
        if (i < arr.length) {
            if (noTimeout) {
                eachAsync(arr, fn, finalFunc, chunkSize, i, noTimeout);
            }
            else if (win.requestAnimationFrame) {
                // If available, do requestAnimationFrame - shaves off a few ms
                win.requestAnimationFrame(function () {
                    eachAsync(arr, fn, finalFunc, chunkSize, i);
                });
            }
            else {
                setTimeout(eachAsync, 0, arr, fn, finalFunc, chunkSize, i);
            }
        }
        else if (finalFunc) {
            finalFunc();
        }
    }
}
/**
 * Enter boost mode and apply boost-specific properties.
 * @private
 * @function Highcharts.Series#enterBoost
 */
function enterBoost(series) {
    var _a;
    series.boost = series.boost || {
        // Faster than a series bind:
        getPoint: (function (bp) { return getPoint(series, bp); })
    };
    var alteredByBoost = series.boost.altered = [];
    // Save the original values, including whether it was an own
    // property or inherited from the prototype.
    ['allowDG', 'directTouch', 'stickyTracking'].forEach(function (prop) {
        alteredByBoost.push({
            prop: prop,
            val: series[prop],
            own: Object.hasOwnProperty.call(series, prop)
        });
    });
    series.allowDG = false;
    series.directTouch = false;
    series.stickyTracking = true;
    // Prevent animation when zooming in on boosted series(#13421).
    series.finishedAnimating = true;
    // Hide series label if any
    if (series.labelBySeries) {
        series.labelBySeries = series.labelBySeries.destroy();
    }
    // Destroy existing points after zoom out
    if (series.is('scatter') &&
        !series.is('treemap') &&
        series.data.length) {
        for (var _i = 0, _b = series.data; _i < _b.length; _i++) {
            var point = _b[_i];
            (_a = point === null || point === void 0 ? void 0 : point.destroy) === null || _a === void 0 ? void 0 : _a.call(point);
        }
        series.data.length = 0;
        series.points.length = 0;
        delete series.processedData;
    }
}
/**
 * Exit from boost mode and restore non-boost properties.
 * @private
 * @function Highcharts.Series#exitBoost
 */
function exitBoost(series) {
    var _a;
    var boost = series.boost, chart = series.chart, chartBoost = chart.boost;
    if (chartBoost === null || chartBoost === void 0 ? void 0 : chartBoost.markerGroup) {
        chartBoost.markerGroup.destroy();
        chartBoost.markerGroup = void 0;
        for (var _i = 0, _b = chart.series; _i < _b.length; _i++) {
            var s = _b[_i];
            s.markerGroup = void 0;
            s.markerGroup = s.plotGroup('markerGroup', 'markers', 'visible', 1, chart.seriesGroup).addClass('highcharts-tracker');
        }
    }
    // Reset instance properties and/or delete instance properties and go back
    // to prototype
    if (boost) {
        (boost.altered || []).forEach(function (setting) {
            if (setting.own) {
                series[setting.prop] = setting.val;
            }
            else {
                // Revert to prototype
                delete series[setting.prop];
            }
        });
        // Clear previous run
        if (boost.clear) {
            boost.clear();
        }
    }
    // #21106, clean up boost clipping on the series groups.
    (_a = (chart.seriesGroup || series.group)) === null || _a === void 0 ? void 0 : _a.clip();
}
/**
 * @private
 * @function Highcharts.Series#hasExtremes
 */
function hasExtremes(series, checkX) {
    var options = series.options, dataLength = series.dataTable.modified.rowCount, xAxis = series.xAxis && series.xAxis.options, yAxis = series.yAxis && series.yAxis.options, colorAxis = series.colorAxis && series.colorAxis.options;
    return dataLength > (options.boostThreshold || Number.MAX_VALUE) &&
        // Defined yAxis extremes
        isNumber(yAxis.min) &&
        isNumber(yAxis.max) &&
        // Defined (and required) xAxis extremes
        (!checkX ||
            (isNumber(xAxis.min) && isNumber(xAxis.max))) &&
        // Defined (e.g. heatmap) colorAxis extremes
        (!colorAxis ||
            (isNumber(colorAxis.min) && isNumber(colorAxis.max)));
}
/**
 * Used multiple times. In processData first on this.options.data, the second
 * time it runs the check again after processedXData is built.
 * If the data is going to be grouped, the series shouldn't be boosted.
 * @private
 */
var getSeriesBoosting = function (series, data) {
    // Check if will be grouped.
    if (series.forceCrop) {
        return false;
    }
    return (isChartSeriesBoosting(series.chart) ||
        ((data ? data.length : 0) >=
            (series.options.boostThreshold || Number.MAX_VALUE)));
};
/**
 * Extend series.destroy to also remove the fake k-d-tree points (#5137).
 * Normally this is handled by Series.destroy that calls Point.destroy,
 * but the fake search points are not registered like that.
 * @private
 */
function onSeriesDestroy() {
    var series = this, chart = series.chart;
    if (chart.boost &&
        chart.boost.markerGroup === series.markerGroup) {
        series.markerGroup = void 0;
    }
    if (chart.hoverPoints) {
        chart.hoverPoints = chart.hoverPoints.filter(function (point) {
            return point.series === series;
        });
    }
    if (chart.hoverPoint && chart.hoverPoint.series === series) {
        chart.hoverPoint = void 0;
    }
}
/**
 * @private
 */
function onSeriesHide() {
    var boost = this.boost;
    if (boost && boost.canvas && boost.target) {
        if (boost.wgl) {
            boost.wgl.clear();
        }
        if (boost.clear) {
            boost.clear();
        }
    }
}
/**
 * Performs the actual render if the renderer is
 * attached to the series.
 * @private
 */
function renderIfNotSeriesBoosting(series) {
    var boost = series.boost;
    if (boost &&
        boost.canvas &&
        boost.target &&
        boost.wgl &&
        !isChartSeriesBoosting(series.chart)) {
        boost.wgl.render(series.chart);
    }
}
/**
 * Return a full Point object based on the index.
 * The boost module uses stripped point objects for performance reasons.
 * @private
 * @param {object|Highcharts.Point} boostPoint
 *        A stripped-down point object
 * @return {Highcharts.Point}
 *         A Point object as per https://api.highcharts.com/highcharts#Point
 */
function getPoint(series, boostPoint) {
    var _a;
    var seriesOptions = series.options, xAxis = series.xAxis, PointClass = series.pointClass;
    if (boostPoint instanceof PointClass) {
        return boostPoint;
    }
    var isScatter = series.is('scatter'), xData = ((isScatter && series.getColumn('x', true).length ?
        series.getColumn('x', true) :
        void 0) ||
        (series.getColumn('x').length ? series.getColumn('x') : void 0) ||
        seriesOptions.xData ||
        series.getColumn('x', true) ||
        false), yData = (series.getColumn('y', true) ||
        seriesOptions.yData ||
        false), point = new PointClass(series, (isScatter && xData && yData) ?
        [xData[boostPoint.i], yData[boostPoint.i]] :
        (isArray(series.options.data) ? series.options.data : [])[boostPoint.i], xData ? xData[boostPoint.i] : void 0);
    point.category = pick(xAxis.categories ?
        xAxis.categories[point.x] :
        point.x, // @todo simplify
    point.x);
    point.key = (_a = point.name) !== null && _a !== void 0 ? _a : point.category;
    point.dist = boostPoint.dist;
    point.distX = boostPoint.distX;
    point.plotX = boostPoint.plotX;
    point.plotY = boostPoint.plotY;
    point.index = boostPoint.i;
    point.percentage = boostPoint.percentage;
    point.isInside = series.isPointInside(point);
    return point;
}
/**
 * @private
 */
function scatterProcessData(force) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var series = this, options = series.options, xAxis = series.xAxis, yAxis = series.yAxis;
    // Process only on changes
    if (!series.isDirty &&
        !xAxis.isDirty &&
        !yAxis.isDirty &&
        !force) {
        return false;
    }
    // Required to get tick-based zoom ranges that take options into account
    // like `minPadding`, `maxPadding`, `startOnTick`, `endOnTick`.
    series.yAxis.setTickInterval();
    var boostThreshold = options.boostThreshold || 0, cropThreshold = options.cropThreshold, xData = series.getColumn('x'), xExtremes = xAxis.getExtremes(), xMax = (_a = xExtremes.max) !== null && _a !== void 0 ? _a : Number.MAX_VALUE, xMin = (_b = xExtremes.min) !== null && _b !== void 0 ? _b : -Number.MAX_VALUE, yData = series.getColumn('y'), yExtremes = yAxis.getExtremes(), yMax = (_c = yExtremes.max) !== null && _c !== void 0 ? _c : Number.MAX_VALUE, yMin = (_d = yExtremes.min) !== null && _d !== void 0 ? _d : -Number.MAX_VALUE;
    // Skip processing in non-boost zoom
    if (!series.boosted &&
        xAxis.old &&
        yAxis.old &&
        xMin >= ((_e = xAxis.old.min) !== null && _e !== void 0 ? _e : -Number.MAX_VALUE) &&
        xMax <= ((_f = xAxis.old.max) !== null && _f !== void 0 ? _f : Number.MAX_VALUE) &&
        yMin >= ((_g = yAxis.old.min) !== null && _g !== void 0 ? _g : -Number.MAX_VALUE) &&
        yMax <= ((_h = yAxis.old.max) !== null && _h !== void 0 ? _h : Number.MAX_VALUE)) {
        series.dataTable.modified.setColumns({
            x: xData,
            y: yData
        });
        return true;
    }
    // Without thresholds just assign data
    var dataLength = series.dataTable.rowCount;
    if (!boostThreshold ||
        dataLength < boostThreshold ||
        (cropThreshold &&
            !series.forceCrop &&
            !series.getExtremesFromAll &&
            !options.getExtremesFromAll &&
            dataLength < cropThreshold)) {
        series.dataTable.modified.setColumns({
            x: xData,
            y: yData
        });
        return true;
    }
    // Filter unsorted scatter data for ranges
    var processedData = [], processedXData = [], processedYData = [], xRangeNeeded = !(isNumber(xExtremes.max) || isNumber(xExtremes.min)), yRangeNeeded = !(isNumber(yExtremes.max) || isNumber(yExtremes.min));
    var cropped = false, x, xDataMax = xData[0], xDataMin = xData[0], y, yDataMax = yData === null || yData === void 0 ? void 0 : yData[0], yDataMin = yData === null || yData === void 0 ? void 0 : yData[0];
    for (var i = 0, iEnd = xData.length; i < iEnd; ++i) {
        x = xData[i];
        y = yData === null || yData === void 0 ? void 0 : yData[i];
        if (x >= xMin && x <= xMax &&
            y >= yMin && y <= yMax) {
            processedData.push({ x: x, y: y });
            processedXData.push(x);
            processedYData.push(y);
            if (xRangeNeeded) {
                xDataMax = Math.max(xDataMax, x);
                xDataMin = Math.min(xDataMin, x);
            }
            if (yRangeNeeded) {
                yDataMax = Math.max(yDataMax, y);
                yDataMin = Math.min(yDataMin, y);
            }
        }
        else {
            cropped = true;
        }
    }
    if (xRangeNeeded) {
        xAxis.dataMax = Math.max(xDataMax, xAxis.dataMax || 0);
        xAxis.dataMin = Math.min(xDataMin, xAxis.dataMin || 0);
    }
    if (yRangeNeeded) {
        yAxis.dataMax = Math.max(yDataMax, yAxis.dataMax || 0);
        yAxis.dataMin = Math.min(yDataMin, yAxis.dataMin || 0);
    }
    // Set properties as base processData
    series.cropped = cropped;
    series.cropStart = 0;
    // For boosted points rendering
    if (cropped && series.dataTable.modified === series.dataTable) {
        // Calling setColumns with cropped data must be done on a new instance
        // to avoid modification of the original (complete) data
        series.dataTable.modified = new DataTableCore();
    }
    series.dataTable.modified.setColumns({
        x: processedXData,
        y: processedYData
    });
    if (!getSeriesBoosting(series, processedXData)) {
        series.processedData = processedData; // For un-boosted points rendering
    }
    return true;
}
/**
 * @private
 * @function Highcharts.Series#renderCanvas
 */
function seriesRenderCanvas() {
    var _this = this;
    var _a, _b, _c;
    var options = this.options || {}, chart = this.chart, chartBoost = chart.boost, seriesBoost = this.boost, xAxis = this.xAxis, yAxis = this.yAxis, xData = options.xData || this.getColumn('x', true), yData = options.yData || this.getColumn('y', true), lowData = this.getColumn('low', true), highData = this.getColumn('high', true), rawData = this.processedData || options.data, xExtremes = xAxis.getExtremes(), 
    // Taking into account the offset of the min point #19497
    xMin = xExtremes.min - (xAxis.minPointOffset || 0), xMax = xExtremes.max + (xAxis.minPointOffset || 0), yExtremes = yAxis.getExtremes(), yMin = yExtremes.min - (yAxis.minPointOffset || 0), yMax = yExtremes.max + (yAxis.minPointOffset || 0), pointTaken = {}, sampling = !!this.sampling, enableMouseTracking = options.enableMouseTracking, threshold = options.threshold, isRange = this.pointArrayMap &&
        this.pointArrayMap.join(',') === 'low,high', isStacked = !!options.stacking, cropStart = this.cropStart || 0, requireSorting = this.requireSorting, useRaw = !xData, compareX = options.findNearestPointBy === 'x', xDataFull = ((this.getColumn('x').length ?
        this.getColumn('x') :
        void 0) ||
        this.options.xData ||
        this.getColumn('x', true)), lineWidth = pick(options.lineWidth, 1), nullYSubstitute = options.nullInteraction && yMin, tooltip = chart.tooltip;
    var renderer = false, lastClientX, yBottom = yAxis.getThreshold(threshold), minVal, maxVal, minI, maxI;
    // Clear mock points and tooltip after zoom (#20330)
    if (!this.boosted) {
        return;
    }
    (_a = this.points) === null || _a === void 0 ? void 0 : _a.forEach(function (point) {
        var _a;
        (_a = point === null || point === void 0 ? void 0 : point.destroyElements) === null || _a === void 0 ? void 0 : _a.call(point);
    });
    this.points = [];
    if (tooltip && !tooltip.isHidden) {
        var isSeriesHovered = ((_b = chart.hoverPoint) === null || _b === void 0 ? void 0 : _b.series) === this ||
            ((_c = chart.hoverPoints) === null || _c === void 0 ? void 0 : _c.some(function (point) { return point.series === _this; }));
        if (isSeriesHovered) {
            chart.hoverPoint = chart.hoverPoints = void 0;
            tooltip.hide(0);
        }
    }
    else if (chart.hoverPoints) {
        chart.hoverPoints = chart.hoverPoints.filter(function (point) { return point.series !== _this; });
    }
    // When touch-zooming or mouse-panning, re-rendering the canvas would not
    // perform fast enough. Instead, let the axes redraw, but not the series.
    // The series is scale-translated in an event handler for an approximate
    // preview.
    if (xAxis.isPanning || yAxis.isPanning) {
        return;
    }
    // Get or create the renderer
    renderer = createAndAttachRenderer(chart, this);
    chart.boosted = true;
    if (!this.visible) {
        return;
    }
    // If we are zooming out from SVG mode, destroy the graphics
    if (this.points || this.graph) {
        destroyGraphics(this);
    }
    // If we're rendering per. series we should create the marker groups
    // as usual.
    if (!isChartSeriesBoosting(chart)) {
        // If all series were boosting, but are not anymore
        // restore private markerGroup
        if (this.markerGroup === (chartBoost === null || chartBoost === void 0 ? void 0 : chartBoost.markerGroup)) {
            this.markerGroup = void 0;
        }
        this.markerGroup = this.plotGroup('markerGroup', 'markers', 'visible', 1, chart.seriesGroup).addClass('highcharts-tracker');
    }
    else {
        // If series has a private markerGroup, remove that
        // and use common markerGroup
        if (this.markerGroup &&
            this.markerGroup !== (chartBoost === null || chartBoost === void 0 ? void 0 : chartBoost.markerGroup)) {
            this.markerGroup.destroy();
        }
        // Use a single group for the markers
        this.markerGroup = chartBoost === null || chartBoost === void 0 ? void 0 : chartBoost.markerGroup;
        // When switching from chart boosting mode, destroy redundant
        // series boosting targets
        if (seriesBoost && seriesBoost.target) {
            this.renderTarget =
                seriesBoost.target =
                    seriesBoost.target.destroy();
        }
    }
    var points = this.points = [], addKDPoint = function (clientX, plotY, i, percentage) {
        var x = xDataFull ? xDataFull[cropStart + i] : false, pushPoint = function (plotX) {
            if (chart.inverted) {
                plotX = xAxis.len - plotX;
                plotY = yAxis.len - plotY;
            }
            points.push({
                destroy: noop,
                x: x,
                clientX: plotX,
                plotX: plotX,
                plotY: plotY,
                i: cropStart + i,
                percentage: percentage
            });
        };
        // We need to do ceil on the clientX to make things
        // snap to pixel values. The renderer will frequently
        // draw stuff on "sub-pixels".
        clientX = Math.ceil(clientX);
        // Shaves off about 60ms compared to repeated concatenation
        index = compareX ? clientX : clientX + ',' + plotY;
        // The k-d tree requires series points.
        // Reduce the amount of points, since the time to build the
        // tree increases exponentially.
        if (enableMouseTracking) {
            if (!pointTaken[index]) {
                pointTaken[index] = true;
                pushPoint(clientX);
            }
            else if (x === xDataFull[xDataFull.length - 1]) {
                // If the last point is on the same pixel as the last
                // tracked point, swap them. (#18856)
                points.length--;
                pushPoint(clientX);
            }
        }
    };
    // Do not start building while drawing
    this.buildKDTree = noop;
    fireEvent(this, 'renderCanvas');
    if (this.is('line') &&
        lineWidth > 1 &&
        (seriesBoost === null || seriesBoost === void 0 ? void 0 : seriesBoost.target) &&
        chartBoost &&
        !chartBoost.lineWidthFilter) {
        chartBoost.lineWidthFilter = chart.renderer.definition({
            tagName: 'filter',
            children: [
                {
                    tagName: 'feMorphology',
                    attributes: {
                        operator: 'dilate',
                        radius: 0.25 * lineWidth
                    }
                }
            ],
            attributes: { id: 'linewidth' }
        });
        seriesBoost.target.attr({
            filter: 'url(#linewidth)'
        });
    }
    if (renderer) {
        allocateIfNotSeriesBoosting(renderer, this);
        renderer.pushSeries(this);
        // Perform the actual renderer if we're on series level
        renderIfNotSeriesBoosting(this);
    }
    /**
     * This builds the KD-tree
     * @private
     */
    function processPoint(d, i) {
        var _a, _b;
        var chartDestroyed = typeof chart.index === 'undefined';
        var x, y, clientX, plotY, percentage, low = false, isYInside = true;
        if (!defined(d)) {
            return true;
        }
        if (!chartDestroyed) {
            if (useRaw) {
                x = d[0];
                y = d[1];
            }
            else {
                x = d;
                y = (_b = (_a = yData[i]) !== null && _a !== void 0 ? _a : nullYSubstitute) !== null && _b !== void 0 ? _b : null;
            }
            // Resolve low and high for range series
            if (isRange) {
                if (useRaw) {
                    y = d.slice(1, 3);
                }
                low = lowData[i];
                y = highData[i];
            }
            else if (isStacked) {
                x = d.x;
                y = d.stackY;
                low = y - d.y;
                percentage = d.percentage;
            }
            // Optimize for scatter zooming
            if (!requireSorting) {
                isYInside = (y || 0) >= yMin && y <= yMax;
            }
            if (y !== null && x >= xMin && x <= xMax && isYInside) {
                clientX = xAxis.toPixels(x, true);
                if (sampling) {
                    if (typeof minI === 'undefined' ||
                        clientX === lastClientX) {
                        if (!isRange) {
                            low = y;
                        }
                        if (typeof maxI === 'undefined' ||
                            y > maxVal) {
                            maxVal = y;
                            maxI = i;
                        }
                        if (typeof minI === 'undefined' ||
                            low < minVal) {
                            minVal = low;
                            minI = i;
                        }
                    }
                    // Add points and reset
                    if (!compareX || clientX !== lastClientX) {
                        // `maxI` is number too:
                        if (typeof minI !== 'undefined') {
                            plotY =
                                yAxis.toPixels(maxVal, true);
                            yBottom =
                                yAxis.toPixels(minVal, true);
                            addKDPoint(clientX, plotY, maxI, percentage);
                            if (yBottom !== plotY) {
                                addKDPoint(clientX, yBottom, minI, percentage);
                            }
                        }
                        minI = maxI = void 0;
                        lastClientX = clientX;
                    }
                }
                else {
                    plotY = Math.ceil(yAxis.toPixels(y, true));
                    addKDPoint(clientX, plotY, i, percentage);
                }
            }
        }
        return !chartDestroyed;
    }
    /**
     * @private
     */
    var boostOptions = renderer.settings, doneProcessing = function () {
        fireEvent(_this, 'renderedCanvas');
        // Go back to prototype, ready to build
        delete _this.buildKDTree;
        // Check that options exist, as async processing
        // could mean the series is removed at this point (#19895)
        if (_this.options) {
            _this.buildKDTree();
        }
        if (boostOptions.debug.timeKDTree) {
            console.timeEnd('kd tree building'); // eslint-disable-line no-console
        }
    };
    // Loop over the points to build the k-d tree - skip this if
    // exporting
    if (!chart.renderer.forExport) {
        if (boostOptions.debug.timeKDTree) {
            console.time('kd tree building'); // eslint-disable-line no-console
        }
        eachAsync(isStacked ?
            this.data.slice(cropStart) :
            (xData || rawData), processPoint, doneProcessing);
    }
}
/**
 * Used for treemap|heatmap.drawPoints
 * @private
 */
function wrapSeriesDrawPoints(proceed) {
    var enabled = true;
    if (this.chart.options && this.chart.options.boost) {
        enabled = typeof this.chart.options.boost.enabled === 'undefined' ?
            true :
            this.chart.options.boost.enabled;
    }
    if (!enabled || !this.boosted) {
        return proceed.call(this);
    }
    this.chart.boosted = true;
    // Make sure we have a valid OGL context
    var renderer = createAndAttachRenderer(this.chart, this);
    if (renderer) {
        allocateIfNotSeriesBoosting(renderer, this);
        renderer.pushSeries(this);
    }
    renderIfNotSeriesBoosting(this);
}
/**
 * Override a bunch of methods the same way. If the number of points is
 * below the threshold, run the original method. If not, check for a
 * canvas version or do nothing.
 *
 * Note that we're not overriding any of these for heatmaps.
 */
function wrapSeriesFunctions(seriesProto, seriesTypes, method) {
    /**
     * @private
     */
    function branch(proceed) {
        var letItPass = this.options.stacking &&
            (method === 'translate' || method === 'generatePoints');
        if (!this.boosted ||
            letItPass ||
            !boostEnabled(this.chart) ||
            this.type === 'heatmap' ||
            this.type === 'treemap' ||
            !BoostableMap[this.type] ||
            this.options.boostThreshold === 0) {
            proceed.call(this);
            // Run canvas version of method, like renderCanvas(), if it exists
        }
        else if (method === 'render' && this.renderCanvas) {
            this.renderCanvas();
        }
    }
    wrap(seriesProto, method, branch);
    // Special case for some types, when translate method is already wrapped
    if (method === 'translate') {
        for (var _i = 0, _a = [
            'column',
            'arearange',
            'columnrange',
            'heatmap',
            'treemap'
        ]; _i < _a.length; _i++) {
            var type = _a[_i];
            if (seriesTypes[type]) {
                wrap(seriesTypes[type].prototype, method, branch);
            }
        }
    }
}
/**
 * Do not compute extremes when min and max are set. If we use this in the
 * core, we can add the hook to hasExtremes to the methods directly.
 * @private
 */
function wrapSeriesGetExtremes(proceed) {
    if (this.boosted) {
        if (hasExtremes(this)) {
            return {};
        }
        if (this.xAxis.isPanning || this.yAxis.isPanning) {
            // Do not re-compute the extremes during panning, because looping
            // the data is expensive. The `this` contains the `dataMin` and
            // `dataMax` to use.
            return this;
        }
    }
    return proceed.apply(this, [].slice.call(arguments, 1));
}
/**
 * If the series is a heatmap or treemap, or if the series is not boosting
 * do the default behaviour. Otherwise, process if the series has no
 * extremes.
 * @private
 */
function wrapSeriesProcessData(proceed) {
    var _a, _b, _c;
    var dataToMeasure = this.options.data;
    if (boostEnabled(this.chart) && BoostableMap[this.type]) {
        var series = this, 
        // Flag for code that should run for ScatterSeries and its
        // subclasses, apart from the enlisted exceptions.
        isScatter = series.is('scatter') &&
            !series.is('bubble') &&
            !series.is('treemap') &&
            !series.is('heatmap');
        // If there are no extremes given in the options, we also need to
        // process the data to read the data extremes. If this is a heatmap,
        // do default behaviour.
        if (
        // First pass with options.data:
        !getSeriesBoosting(series, dataToMeasure) ||
            isScatter ||
            series.is('treemap') ||
            // Use processedYData for the stack (#7481):
            series.options.stacking ||
            !hasExtremes(series, true)) {
            // Do nothing until the panning stops
            if (series.boosted && (((_a = series.xAxis) === null || _a === void 0 ? void 0 : _a.isPanning) || ((_b = series.yAxis) === null || _b === void 0 ? void 0 : _b.isPanning))) {
                return;
            }
            // Extra check for zoomed scatter data
            if (isScatter && series.yAxis.type !== 'treegrid') {
                scatterProcessData.call(series, arguments[1]);
            }
            else {
                proceed.apply(series, [].slice.call(arguments, 1));
            }
            dataToMeasure = series.getColumn('x', true);
        }
        // Set the isBoosting flag, second pass with processedXData to
        // see if we have zoomed.
        series.boosted = getSeriesBoosting(series, dataToMeasure);
        // Enter or exit boost mode
        if (series.boosted) {
            // Force turbo-mode:
            var firstPoint = void 0;
            if ((_c = series.options.data) === null || _c === void 0 ? void 0 : _c.length) {
                firstPoint = series.getFirstValidPoint(series.options.data);
                if (!isNumber(firstPoint) &&
                    !isArray(firstPoint) &&
                    !series.is('treemap')) {
                    error(12, false, series.chart);
                }
            }
            enterBoost(series);
        }
        else {
            exitBoost(series);
        }
        // The series type is not boostable
    }
    else {
        proceed.apply(this, [].slice.call(arguments, 1));
    }
}
/**
 * Return a point instance from the k-d-tree
 * @private
 */
function wrapSeriesSearchPoint(proceed) {
    var result = proceed.apply(this, [].slice.call(arguments, 1));
    if (this.boost && result) {
        return this.boost.getPoint(result);
    }
    return result;
}
/* *
 *
 *  Default Export
 *
 * */
var BoostSeries = {
    compose: compose,
    destroyGraphics: destroyGraphics,
    eachAsync: eachAsync,
    getPoint: getPoint
};
export default BoostSeries;
