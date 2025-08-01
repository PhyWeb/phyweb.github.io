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
import Color from '../../Core/Color/Color.js';
var color = Color.parse;
import H from '../../Core/Globals.js';
var doc = H.doc, win = H.win;
import U from '../../Core/Utilities.js';
var isNumber = U.isNumber, isObject = U.isObject, merge = U.merge, objectEach = U.objectEach, pick = U.pick;
import WGLDrawMode from './WGLDrawMode.js';
import WGLShader from './WGLShader.js';
import WGLVertexBuffer from './WGLVertexBuffer.js';
/* *
 *
 *  Constants
 *
 * */
// Things to draw as "rectangles" (i.e lines)
var asBar = {
    'column': true,
    'columnrange': true,
    'bar': true,
    'area': true,
    'areaspline': true,
    'arearange': true
};
var asCircle = {
    'scatter': true,
    'bubble': true
};
var contexts = [
    'webgl',
    'experimental-webgl',
    'moz-webgl',
    'webkit-3d'
];
/* *
 *
 *  Class
 *
 * */
/* eslint-disable valid-jsdoc */
/**
 * Main renderer. Used to render series.
 *
 * Notes to self:
 * - May be able to build a point map by rendering to a separate canvas and
 *   encoding values in the color data.
 * - Need to figure out a way to transform the data quicker
 *
 * @private
 *
 * @param {Function} postRenderCallback
 */
var WGLRenderer = /** @class */ (function () {
    /* *
     *
     *  Constructor
     *
     * */
    function WGLRenderer(postRenderCallback) {
        /**
         * The data to render - array of coordinates.
         * Repeating sequence of [x, y, checkThreshold, pointSize].
         */
        this.data = [];
        // Height of our viewport in pixels
        this.height = 0;
        // Is it inited?
        this.isInited = false;
        // The marker data
        this.markerData = [];
        // The series stack
        this.series = [];
        // Texture handles
        this.textureHandles = {};
        // Width of our viewport in pixels
        this.width = 0;
        this.postRenderCallback = postRenderCallback;
        this.settings = {
            pointSize: 1,
            lineWidth: 1,
            fillColor: '#AA00AA',
            useAlpha: true,
            usePreallocated: false,
            useGPUTranslations: false,
            debug: {
                timeRendering: false,
                timeSeriesProcessing: false,
                timeSetup: false,
                timeBufferCopy: false,
                timeKDTree: false,
                showSkipSummary: false
            }
        };
    }
    /* *
     *
     *  Static Functions
     *
     * */
    /**
     * Returns an orthographic perspective matrix
     * @private
     * @param {number} width
     * the width of the viewport in pixels
     * @param {number} height
     * the height of the viewport in pixels
     */
    WGLRenderer.orthoMatrix = function (width, height) {
        var near = 0, far = 1;
        return [
            2 / width, 0, 0, 0,
            0, -(2 / height), 0, 0,
            0, 0, -2 / (far - near), 0,
            -1, 1, -(far + near) / (far - near), 1
        ];
    };
    /**
     * @private
     */
    WGLRenderer.seriesPointCount = function (series) {
        var isStacked, xData, s;
        if (series.boosted) {
            isStacked = !!series.options.stacking;
            xData = ((series.getColumn('x').length ?
                series.getColumn('x') :
                void 0) ||
                series.options.xData ||
                series.getColumn('x', true));
            s = (isStacked ? series.data : (xData || series.options.data))
                .length;
            if (series.type === 'treemap') {
                s *= 12;
            }
            else if (series.type === 'heatmap') {
                s *= 6;
            }
            else if (asBar[series.type]) {
                s *= 2;
            }
            return s;
        }
        return 0;
    };
    /* *
     *
     *  Functions
     *
     * */
    /**
     * @private
     */
    WGLRenderer.prototype.getPixelRatio = function () {
        return this.settings.pixelRatio || win.devicePixelRatio || 1;
    };
    /**
     * @private
     */
    WGLRenderer.prototype.setOptions = function (options) {
        // The pixelRatio defaults to 1. This is an antipattern, we should
        // refactor the Boost options to include an object of default options as
        // base for the merge, like other components.
        if (!('pixelRatio' in options)) {
            options.pixelRatio = 1;
        }
        merge(true, this.settings, options);
    };
    /**
     * Allocate a float buffer to fit all series
     * @private
     */
    WGLRenderer.prototype.allocateBuffer = function (chart) {
        var vbuffer = this.vbuffer;
        var s = 0;
        if (!this.settings.usePreallocated) {
            return;
        }
        chart.series.forEach(function (series) {
            if (series.boosted) {
                s += WGLRenderer.seriesPointCount(series);
            }
        });
        vbuffer && vbuffer.allocate(s);
    };
    /**
     * @private
     */
    WGLRenderer.prototype.allocateBufferForSingleSeries = function (series) {
        var vbuffer = this.vbuffer;
        var s = 0;
        if (!this.settings.usePreallocated) {
            return;
        }
        if (series.boosted) {
            s = WGLRenderer.seriesPointCount(series);
        }
        vbuffer && vbuffer.allocate(s);
    };
    /**
     * Clear the depth and color buffer
     * @private
     */
    WGLRenderer.prototype.clear = function () {
        var gl = this.gl;
        gl && gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };
    /**
     * Push data for a single series
     * This calculates additional vertices and transforms the data to be
     * aligned correctly in memory
     * @private
     */
    WGLRenderer.prototype.pushSeriesData = function (series, inst) {
        var _this = this;
        var _a, _b;
        var data = this.data, settings = this.settings, vbuffer = this.vbuffer, isRange = (series.pointArrayMap &&
            series.pointArrayMap.join(',') === 'low,high'), chart = series.chart, options = series.options, sorted = series.sorted, xAxis = series.xAxis, yAxis = series.yAxis, isStacked = !!options.stacking, rawData = options.data, xExtremes = series.xAxis.getExtremes(), 
        // Taking into account the offset of the min point #19497
        xMin = xExtremes.min - (series.xAxis.minPointOffset || 0), xMax = xExtremes.max + (series.xAxis.minPointOffset || 0), yExtremes = series.yAxis.getExtremes(), yMin = yExtremes.min - (series.yAxis.minPointOffset || 0), yMax = yExtremes.max + (series.yAxis.minPointOffset || 0), xData = (series.getColumn('x').length ? series.getColumn('x') : void 0) || options.xData || series.getColumn('x', true), yData = (series.getColumn('y').length ? series.getColumn('y') : void 0) || options.yData || series.getColumn('y', true), zData = (series.getColumn('z').length ? series.getColumn('z') : void 0) || options.zData || series.getColumn('z', true), useRaw = !xData || xData.length === 0, 
        /// threshold = options.threshold,
        // yBottom = chart.yAxis[0].getThreshold(threshold),
        // hasThreshold = isNumber(threshold),
        // colorByPoint = series.options.colorByPoint,
        // This is required for color by point, so make sure this is
        // uncommented if enabling that
        // colorIndex = 0,
        // Required for color axis support
        // caxis,
        connectNulls = options.connectNulls, 
        // For some reason eslint/TypeScript don't pick up that this is
        // actually used: --- bre1470: it is never read, just set
        // maxVal: (number|undefined), // eslint-disable-line no-unused-vars
        points = series.points || false, sdata = isStacked ? series.data : (xData || rawData), closestLeft = { x: Number.MAX_VALUE, y: 0 }, closestRight = { x: -Number.MAX_VALUE, y: 0 }, cullXThreshold = 1, cullYThreshold = 1, chartDestroyed = typeof chart.index === 'undefined', drawAsBar = asBar[series.type], zoneAxis = options.zoneAxis || 'y', zones = options.zones || false, threshold = options.threshold, pixelRatio = this.getPixelRatio();
        var plotWidth = series.chart.plotWidth, lastX = false, lastY = false, minVal, scolor, 
        //
        skipped = 0, hadPoints = false, 
        // The following are used in the builder while loop
        x, y, d, z, i = -1, px = false, nx = false, low, nextInside = false, prevInside = false, pcolor = false, isXInside = false, isYInside = true, firstPoint = true, zoneColors, zoneDefColor = false, gapSize = false, vlen = 0;
        if (options.boostData && options.boostData.length > 0) {
            return;
        }
        if (options.gapSize) {
            gapSize = options.gapUnit !== 'value' ?
                options.gapSize * series.closestPointRange :
                options.gapSize;
        }
        if (zones) {
            zoneColors = [];
            zones.forEach(function (zone, i) {
                if (zone.color) {
                    var zoneColor = color(zone.color).rgba;
                    zoneColor[0] /= 255.0;
                    zoneColor[1] /= 255.0;
                    zoneColor[2] /= 255.0;
                    zoneColors[i] = zoneColor;
                    if (!zoneDefColor && typeof zone.value === 'undefined') {
                        zoneDefColor = zoneColor;
                    }
                }
            });
            if (!zoneDefColor) {
                var seriesColor = ((series.pointAttribs && series.pointAttribs().fill) ||
                    series.color);
                zoneDefColor = color(seriesColor).rgba;
                zoneDefColor[0] /= 255.0;
                zoneDefColor[1] /= 255.0;
                zoneDefColor[2] /= 255.0;
            }
        }
        if (chart.inverted) {
            plotWidth = series.chart.plotHeight;
        }
        series.closestPointRangePx = Number.MAX_VALUE;
        /**
         * Push color to color buffer - need to do this per vertex.
         * @private
         */
        var pushColor = function (color) {
            if (color) {
                inst.colorData.push(color[0]);
                inst.colorData.push(color[1]);
                inst.colorData.push(color[2]);
                inst.colorData.push(color[3]);
            }
        };
        /**
         * Push a vertice to the data buffer.
         * @private
         */
        var vertice = function (x, y, checkTreshold, pointSize, color) {
            if (pointSize === void 0) { pointSize = 1; }
            pushColor(color);
            // Correct for pixel ratio
            if (pixelRatio !== 1 && (!settings.useGPUTranslations ||
                inst.skipTranslation)) {
                x *= pixelRatio;
                y *= pixelRatio;
                pointSize *= pixelRatio;
            }
            if (settings.usePreallocated && vbuffer) {
                vbuffer.push(x, y, checkTreshold ? 1 : 0, pointSize);
                vlen += 4;
            }
            else {
                data.push(x);
                data.push(y);
                data.push(checkTreshold ? pixelRatio : 0);
                data.push(pointSize);
            }
        };
        /**
         * @private
         */
        var closeSegment = function () {
            if (inst.segments.length) {
                inst.segments[inst.segments.length - 1].to = data.length || vlen;
            }
        };
        /**
         * Create a new segment for the current set.
         * @private
         */
        var beginSegment = function () {
            // Insert a segment on the series.
            // A segment is just a start indice.
            // When adding a segment, if one exists from before, it should
            // set the previous segment's end
            if (inst.segments.length &&
                inst.segments[inst.segments.length - 1].from === (data.length || vlen)) {
                return;
            }
            closeSegment();
            inst.segments.push({
                from: data.length || vlen
            });
        };
        /**
         * Push a rectangle to the data buffer.
         * @private
         */
        var pushRect = function (x, y, w, h, color) {
            pushColor(color);
            vertice(x + w, y);
            pushColor(color);
            vertice(x, y);
            pushColor(color);
            vertice(x, y + h);
            pushColor(color);
            vertice(x, y + h);
            pushColor(color);
            vertice(x + w, y + h);
            pushColor(color);
            vertice(x + w, y);
        };
        // Create the first segment
        beginSegment();
        // Special case for point shapes
        if (points && points.length > 0) {
            // If we're doing points, we assume that the points are already
            // translated, so we skip the shader translation.
            inst.skipTranslation = true;
            // Force triangle draw mode
            inst.drawMode = 'TRIANGLES';
            // We don't have a z component in the shader, so we need to sort.
            if (points[0].node && points[0].node.levelDynamic) {
                points.sort(function (a, b) {
                    if (a.node) {
                        if (a.node.levelDynamic >
                            b.node.levelDynamic) {
                            return 1;
                        }
                        if (a.node.levelDynamic <
                            b.node.levelDynamic) {
                            return -1;
                        }
                    }
                    return 0;
                });
            }
            points.forEach(function (point) {
                var plotY = point.plotY;
                var swidth, pointAttr;
                if (typeof plotY !== 'undefined' &&
                    !isNaN(plotY) &&
                    point.y !== null &&
                    point.shapeArgs) {
                    var _a = point.shapeArgs, _b = _a.x, x_1 = _b === void 0 ? 0 : _b, _c = _a.y, y_1 = _c === void 0 ? 0 : _c, _d = _a.width, width = _d === void 0 ? 0 : _d, _e = _a.height, height = _e === void 0 ? 0 : _e;
                    pointAttr = chart.styledMode ?
                        point.series
                            .colorAttribs(point) :
                        pointAttr = point.series.pointAttribs(point);
                    swidth = pointAttr['stroke-width'] || 0;
                    // Handle point colors
                    pcolor = color(pointAttr.fill).rgba;
                    pcolor[0] /= 255.0;
                    pcolor[1] /= 255.0;
                    pcolor[2] /= 255.0;
                    // So there are two ways of doing this. Either we can
                    // create a rectangle of two triangles, or we can do a
                    // point and use point size. Latter is faster, but
                    // only supports squares. So we're doing triangles.
                    // We could also use one color per. vertice to get
                    // better color interpolation.
                    // If there's stroking, we do an additional rect
                    if (series.is('treemap')) {
                        swidth = swidth || 1;
                        scolor = color(pointAttr.stroke).rgba;
                        scolor[0] /= 255.0;
                        scolor[1] /= 255.0;
                        scolor[2] /= 255.0;
                        pushRect(x_1, y_1, width, height, scolor);
                        swidth /= 2;
                    }
                    // } else {
                    //     swidth = 0;
                    // }
                    // Fixes issues with inverted heatmaps (see #6981). The root
                    // cause is that the coordinate system is flipped. In other
                    // words, instead of [0,0] being top-left, it's
                    // bottom-right. This causes a vertical and horizontal flip
                    // in the resulting image, making it rotated 180 degrees.
                    if (series.is('heatmap') && chart.inverted) {
                        x_1 = xAxis.len - x_1;
                        y_1 = yAxis.len - y_1;
                        width = -width;
                        height = -height;
                    }
                    pushRect(x_1 + swidth, y_1 + swidth, width - (swidth * 2), height - (swidth * 2), pcolor);
                }
            });
            closeSegment();
            return;
        }
        var _loop_1 = function () {
            d = sdata[++i];
            if (typeof d === 'undefined') {
                return "continue";
            }
            /// px = x = y = z = nx = low = false;
            // chartDestroyed = typeof chart.index === 'undefined';
            // nextInside = prevInside = pcolor = isXInside = isYInside = false;
            // drawAsBar = asBar[series.type];
            if (chartDestroyed) {
                return "break";
            }
            // Uncomment this to enable color by point.
            // This currently left disabled as the charts look really ugly
            // when enabled and there's a lot of points.
            // Leaving in for the future (tm).
            // if (colorByPoint) {
            //     colorIndex = ++colorIndex %
            //         series.chart.options.colors.length;
            //     pcolor = toRGBAFast(series.chart.options.colors[colorIndex]);
            //     pcolor[0] /= 255.0;
            //     pcolor[1] /= 255.0;
            //     pcolor[2] /= 255.0;
            // }
            // Handle the point.color option (#5999)
            var pointOptions = rawData && rawData[i];
            if (!useRaw && isObject(pointOptions, true)) {
                if (pointOptions.color) {
                    pcolor = color(pointOptions.color).rgba;
                    pcolor[0] /= 255.0;
                    pcolor[1] /= 255.0;
                    pcolor[2] /= 255.0;
                }
            }
            if (useRaw) {
                x = d[0];
                y = d[1];
                if (sdata[i + 1]) {
                    nx = sdata[i + 1][0];
                }
                if (sdata[i - 1]) {
                    px = sdata[i - 1][0];
                }
                if (d.length >= 3) {
                    z = d[2];
                    if (d[2] > inst.zMax) {
                        inst.zMax = d[2];
                    }
                    if (d[2] < inst.zMin) {
                        inst.zMin = d[2];
                    }
                }
            }
            else {
                x = d;
                y = yData === null || yData === void 0 ? void 0 : yData[i];
                if (sdata[i + 1]) {
                    nx = sdata[i + 1];
                }
                if (sdata[i - 1]) {
                    px = sdata[i - 1];
                }
                if (zData && zData.length) {
                    z = zData[i];
                    if (zData[i] > inst.zMax) {
                        inst.zMax = zData[i];
                    }
                    if (zData[i] < inst.zMin) {
                        inst.zMin = zData[i];
                    }
                }
            }
            if (!connectNulls && (x === null || y === null)) {
                beginSegment();
                return "continue";
            }
            if (nx && nx >= xMin && nx <= xMax) {
                nextInside = true;
            }
            if (px && px >= xMin && px <= xMax) {
                prevInside = true;
            }
            if (isRange) {
                if (useRaw) {
                    y = d.slice(1, 3);
                }
                low = (_a = series.getColumn('low', true)) === null || _a === void 0 ? void 0 : _a[i];
                y = ((_b = series.getColumn('high', true)) === null || _b === void 0 ? void 0 : _b[i]) || 0;
            }
            else if (isStacked) {
                x = d.x;
                y = d.stackY;
                low = y - d.y;
            }
            if (yMin !== null &&
                typeof yMin !== 'undefined' &&
                yMax !== null &&
                typeof yMax !== 'undefined') {
                isYInside = y >= yMin && y <= yMax;
            }
            // Do not render points outside the zoomed range (#19701)
            if (!sorted && !isYInside) {
                return "continue";
            }
            if (x > xMax && closestRight.x < xMax) {
                closestRight.x = x;
                closestRight.y = y;
            }
            if (x < xMin && closestLeft.x > xMin) {
                closestLeft.x = x;
                closestLeft.y = y;
            }
            if (y === null && connectNulls) {
                return "continue";
            }
            // Cull points outside the extremes
            // Continue if `sdata` has only one point as `nextInside` asserts
            // whether the next point exists and will thus be false. (#22194)
            if (y === null || (!isYInside && sdata.length > 1 &&
                !nextInside && !prevInside)) {
                beginSegment();
                return "continue";
            }
            // The first point before and first after extremes should be
            // rendered (#9962, 19701)
            // Make sure series with a single point are rendered (#21897)
            if (sorted && ((nx >= xMin || x >= xMin) &&
                (px <= xMax || x <= xMax)) ||
                !sorted && ((x >= xMin) && (x <= xMax))) {
                isXInside = true;
            }
            if (!isXInside && !nextInside && !prevInside) {
                return "continue";
            }
            if (gapSize && x - px > gapSize) {
                beginSegment();
            }
            // Note: Boost requires that zones are sorted!
            if (zones) {
                var zoneColor_1;
                zones.some(function (// eslint-disable-line no-loop-func
                zone, i) {
                    var last = zones[i - 1];
                    if (zoneAxis === 'x') {
                        if (typeof zone.value !== 'undefined' &&
                            x <= zone.value) {
                            if (zoneColors[i] &&
                                (!last || x >= last.value)) {
                                zoneColor_1 = zoneColors[i];
                            }
                            return true;
                        }
                        return false;
                    }
                    if (typeof zone.value !== 'undefined' && y <= zone.value) {
                        if (zoneColors[i] &&
                            (!last || y >= last.value)) {
                            zoneColor_1 = zoneColors[i];
                        }
                        return true;
                    }
                    return false;
                });
                pcolor = zoneColor_1 || zoneDefColor || pcolor;
            }
            // Skip translations - temporary floating point fix
            if (!settings.useGPUTranslations) {
                inst.skipTranslation = true;
                x = xAxis.toPixels(x, true);
                y = yAxis.toPixels(y, true);
                // Make sure we're not drawing outside of the chart area.
                // See #6594. Update: this is no longer required as far as I
                // can tell. Leaving in for git blame in case there are edge
                // cases I've not found. Having this in breaks #10246.
                // if (y > plotHeight) {
                // y = plotHeight;
                // }
                if (x > plotWidth) {
                    // If this is rendered as a point, just skip drawing it
                    // entirely, as we're not dependant on lineTo'ing to it.
                    // See #8197
                    if (inst.drawMode === 'POINTS') {
                        return "continue";
                    }
                    // Having this here will clamp markers and make the angle
                    // of the last line wrong. See 9166.
                    // x = plotWidth;
                }
            }
            // No markers on out of bounds things.
            // Out of bound things are shown if and only if the next
            // or previous point is inside the rect.
            if (inst.hasMarkers && isXInside) {
                /// x = Highcharts.correctFloat(
                //     Math.min(Math.max(-1e5, xAxis.translate(
                //         x,
                //         0,
                //         0,
                //         0,
                //         1,
                //         0.5,
                //         false
                //     )), 1e5)
                // );
                if (lastX !== false) {
                    series.closestPointRangePx = Math.min(series.closestPointRangePx, Math.abs(x - lastX));
                }
            }
            // If the last _drawn_ point is closer to this point than the
            // threshold, skip it. Shaves off 20-100ms in processing.
            if (!settings.useGPUTranslations &&
                !settings.usePreallocated &&
                (lastX && Math.abs(x - lastX) < cullXThreshold) &&
                (lastY && Math.abs(y - lastY) < cullYThreshold)) {
                if (settings.debug.showSkipSummary) {
                    ++skipped;
                }
                return "continue";
            }
            if (drawAsBar) {
                minVal = low || 0;
                if (low === false || typeof low === 'undefined') {
                    if (y < 0) {
                        minVal = y;
                    }
                    else {
                        minVal = 0;
                    }
                }
                if ((!isRange && !isStacked) ||
                    yAxis.logarithmic // #16850
                ) {
                    minVal = Math.max(threshold === null ? yMin : threshold, // #5268
                    yMin); // #8731
                }
                if (!settings.useGPUTranslations) {
                    minVal = yAxis.toPixels(minVal, true);
                }
                // Need to add an extra point here
                vertice(x, minVal, 0, 0, pcolor);
            }
            // Do step line if enabled.
            // Draws an additional point at the old Y at the new X.
            // See #6976.
            if (options.step && !firstPoint) {
                vertice(x, lastY, 0, 2, pcolor);
            }
            vertice(x, y, 0, series.type === 'bubble' ? (z || 1) : 2, pcolor);
            // Uncomment this to support color axis.
            // if (caxis) {
            //     pcolor = color(caxis.toColor(y)).rgba;
            //     inst.colorData.push(color[0] / 255.0);
            //     inst.colorData.push(color[1] / 255.0);
            //     inst.colorData.push(color[2] / 255.0);
            //     inst.colorData.push(color[3]);
            // }
            lastX = x;
            lastY = y;
            hadPoints = true;
            firstPoint = false;
        };
        // Extract color axis
        // (chart.axes || []).forEach((a): void => {
        //     if (H.ColorAxis && a instanceof H.ColorAxis) {
        //         caxis = a;
        //     }
        // });
        while (i < sdata.length - 1) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        }
        if (settings.debug.showSkipSummary) {
            console.log('skipped points:', skipped); // eslint-disable-line no-console
        }
        var pushSupplementPoint = function (point, atStart) {
            if (!settings.useGPUTranslations) {
                inst.skipTranslation = true;
                point.x = xAxis.toPixels(point.x, true);
                point.y = yAxis.toPixels(point.y, true);
            }
            // We should only do this for lines, and we should ignore markers
            // since there's no point here that would have a marker.
            if (atStart) {
                _this.data = [point.x, point.y, 0, 2].concat(_this.data);
                return;
            }
            vertice(point.x, point.y, 0, 2);
        };
        if (!hadPoints &&
            connectNulls !== false &&
            series.drawMode === 'line_strip') {
            if (closestLeft.x < Number.MAX_VALUE) {
                // We actually need to push this *before* the complete buffer.
                pushSupplementPoint(closestLeft, true);
            }
            if (closestRight.x > -Number.MAX_VALUE) {
                pushSupplementPoint(closestRight);
            }
        }
        closeSegment();
    };
    /**
     * Push a series to the renderer
     * If we render the series immediately, we don't have to loop later
     * @private
     * @param {Highchart.Series} s
     * The series to push.
     */
    WGLRenderer.prototype.pushSeries = function (s) {
        var markerData = this.markerData, series = this.series, settings = this.settings;
        if (series.length > 0) {
            if (series[series.length - 1].hasMarkers) {
                series[series.length - 1].markerTo = markerData.length;
            }
        }
        if (settings.debug.timeSeriesProcessing) {
            console.time('building ' + s.type + ' series'); // eslint-disable-line no-console
        }
        var obj = {
            segments: [],
            markerFrom: markerData.length,
            // Push RGBA values to this array to use per. point coloring.
            // It should be 0-padded, so each component should be pushed in
            // succession.
            colorData: [],
            series: s,
            zMin: Number.MAX_VALUE,
            zMax: -Number.MAX_VALUE,
            hasMarkers: s.options.marker ?
                s.options.marker.enabled !== false :
                false,
            showMarkers: true,
            drawMode: WGLDrawMode[s.type] || 'LINE_STRIP'
        };
        if (s.index >= series.length) {
            series.push(obj);
        }
        else {
            series[s.index] = obj;
        }
        // Add the series data to our buffer(s)
        this.pushSeriesData(s, obj);
        if (settings.debug.timeSeriesProcessing) {
            console.timeEnd('building ' + s.type + ' series'); // eslint-disable-line no-console
        }
    };
    /**
     * Flush the renderer.
     * This removes pushed series and vertices.
     * Should be called after clearing and before rendering
     * @private
     */
    WGLRenderer.prototype.flush = function () {
        var vbuffer = this.vbuffer;
        this.data = [];
        this.markerData = [];
        this.series = [];
        if (vbuffer) {
            vbuffer.destroy();
        }
    };
    /**
     * Pass x-axis to shader
     * @private
     * @param {Highcharts.Axis} axis
     * The x-axis.
     */
    WGLRenderer.prototype.setXAxis = function (axis) {
        var shader = this.shader;
        if (!shader) {
            return;
        }
        var pixelRatio = this.getPixelRatio();
        shader.setUniform('xAxisTrans', axis.transA * pixelRatio);
        shader.setUniform('xAxisMin', axis.min);
        shader.setUniform('xAxisMinPad', axis.minPixelPadding * pixelRatio);
        shader.setUniform('xAxisPointRange', axis.pointRange);
        shader.setUniform('xAxisLen', axis.len * pixelRatio);
        shader.setUniform('xAxisPos', axis.pos * pixelRatio);
        shader.setUniform('xAxisCVSCoord', (!axis.horiz));
        shader.setUniform('xAxisIsLog', (!!axis.logarithmic));
        shader.setUniform('xAxisReversed', (!!axis.reversed));
    };
    /**
     * Pass y-axis to shader
     * @private
     * @param {Highcharts.Axis} axis
     * The y-axis.
     */
    WGLRenderer.prototype.setYAxis = function (axis) {
        var shader = this.shader;
        if (!shader) {
            return;
        }
        var pixelRatio = this.getPixelRatio();
        shader.setUniform('yAxisTrans', axis.transA * pixelRatio);
        shader.setUniform('yAxisMin', axis.min);
        shader.setUniform('yAxisMinPad', axis.minPixelPadding * pixelRatio);
        shader.setUniform('yAxisPointRange', axis.pointRange);
        shader.setUniform('yAxisLen', axis.len * pixelRatio);
        shader.setUniform('yAxisPos', axis.pos * pixelRatio);
        shader.setUniform('yAxisCVSCoord', (!axis.horiz));
        shader.setUniform('yAxisIsLog', (!!axis.logarithmic));
        shader.setUniform('yAxisReversed', (!!axis.reversed));
    };
    /**
     * Set the translation threshold
     * @private
     * @param {boolean} has
     * Has threshold flag.
     * @param {numbe} translation
     * The threshold.
     */
    WGLRenderer.prototype.setThreshold = function (has, translation) {
        var shader = this.shader;
        if (!shader) {
            return;
        }
        shader.setUniform('hasThreshold', has);
        shader.setUniform('translatedThreshold', translation);
    };
    /**
     * Render the data
     * This renders all pushed series.
     * @private
     */
    WGLRenderer.prototype.renderChart = function (chart) {
        var _this = this;
        var gl = this.gl, settings = this.settings, shader = this.shader, vbuffer = this.vbuffer;
        var pixelRatio = this.getPixelRatio();
        if (chart) {
            this.width = chart.chartWidth * pixelRatio;
            this.height = chart.chartHeight * pixelRatio;
        }
        else {
            return false;
        }
        var height = this.height, width = this.width;
        if (!gl || !shader || !width || !height) {
            return false;
        }
        if (settings.debug.timeRendering) {
            console.time('gl rendering'); // eslint-disable-line no-console
        }
        gl.canvas.width = width;
        gl.canvas.height = height;
        shader.bind();
        gl.viewport(0, 0, width, height);
        shader.setPMatrix(WGLRenderer.orthoMatrix(width, height));
        if (settings.lineWidth > 1 && !H.isMS) {
            gl.lineWidth(settings.lineWidth);
        }
        if (vbuffer) {
            vbuffer.build(this.data, 'aVertexPosition', 4);
            vbuffer.bind();
        }
        shader.setInverted(chart.inverted);
        // Render the series
        this.series.forEach(function (s, si) {
            var _a, _b, _c;
            var options = s.series.options, shapeOptions = options.marker, lineWidth = (typeof options.lineWidth !== 'undefined' ?
                options.lineWidth :
                1), threshold = options.threshold, hasThreshold = isNumber(threshold), yBottom = s.series.yAxis.getThreshold(threshold), translatedThreshold = yBottom, showMarkers = pick(options.marker ? options.marker.enabled : null, s.series.xAxis.isRadial ? true : null, s.series.closestPointRangePx >
                2 * ((options.marker ?
                    options.marker.radius :
                    10) || 10)), shapeTexture = _this.textureHandles[(shapeOptions && shapeOptions.symbol) ||
                s.series.symbol] || _this.textureHandles.circle;
            var sindex, cbuffer, fillColor, scolor = [];
            if (s.segments.length === 0 ||
                s.segments[0].from === s.segments[0].to) {
                return;
            }
            if (shapeTexture.isReady) {
                gl.bindTexture(gl.TEXTURE_2D, shapeTexture.handle);
                shader.setTexture(shapeTexture.handle);
            }
            if (chart.styledMode) {
                if (s.series.markerGroup === ((_a = s.series.chart.boost) === null || _a === void 0 ? void 0 : _a.markerGroup)) {
                    // Create a temporary markerGroup to get the fill color
                    delete s.series.markerGroup;
                    s.series.markerGroup = s.series.plotGroup('markerGroup', 'markers', 'visible', 1, chart.seriesGroup).addClass('highcharts-tracker');
                    fillColor = s.series.markerGroup.getStyle('fill');
                    s.series.markerGroup.destroy();
                    s.series.markerGroup = (_b = s.series.chart.boost) === null || _b === void 0 ? void 0 : _b.markerGroup;
                }
                else {
                    fillColor = (_c = s.series.markerGroup) === null || _c === void 0 ? void 0 : _c.getStyle('fill');
                }
            }
            else {
                fillColor =
                    (s.drawMode === 'POINTS' && // #14260
                        s.series.pointAttribs &&
                        s.series.pointAttribs().fill) ||
                        s.series.color;
                if (options.colorByPoint) {
                    fillColor = s.series.chart.options.colors[si];
                }
            }
            if (s.series.fillOpacity && options.fillOpacity) {
                fillColor = new Color(fillColor).setOpacity(pick(options.fillOpacity, 1.0)).get();
            }
            scolor = color(fillColor).rgba;
            if (!settings.useAlpha) {
                scolor[3] = 1.0;
            }
            // Blending
            if (options.boostBlending === 'add') {
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                gl.blendEquation(gl.FUNC_ADD);
            }
            else if (options.boostBlending === 'mult' ||
                options.boostBlending === 'multiply') {
                gl.blendFunc(gl.DST_COLOR, gl.ZERO);
            }
            else if (options.boostBlending === 'darken') {
                gl.blendFunc(gl.ONE, gl.ONE);
                gl.blendEquation(gl.FUNC_MIN);
            }
            else {
                /// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                // gl.blendEquation(gl.FUNC_ADD);
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }
            shader.reset();
            // If there are entries in the colorData buffer, build and bind it.
            if (s.colorData.length > 0) {
                shader.setUniform('hasColor', 1);
                cbuffer = new WGLVertexBuffer(gl, shader);
                cbuffer.build(
                // The color array attribute for vertex is assigned from 0,
                // so it needs to be shifted to be applied to further
                // segments. #18858
                Array(s.segments[0].from).concat(s.colorData), 'aColor', 4);
                cbuffer.bind();
            }
            else {
                // Set the hasColor uniform to false (0) when the series
                // contains no colorData buffer points. #18858
                shader.setUniform('hasColor', 0);
                // #15869, a buffer with fewer points might already be bound by
                // a different series/chart causing out of range errors
                gl.disableVertexAttribArray(gl.getAttribLocation(shader.getProgram(), 'aColor'));
            }
            // Set series specific uniforms
            shader.setColor(scolor);
            _this.setXAxis(s.series.xAxis);
            _this.setYAxis(s.series.yAxis);
            _this.setThreshold(hasThreshold, translatedThreshold);
            if (s.drawMode === 'POINTS') {
                shader.setPointSize(pick(options.marker && options.marker.radius, 0.5) * 2 * pixelRatio);
            }
            // If set to true, the toPixels translations in the shader
            // is skipped, i.e it's assumed that the value is a pixel coord.
            shader.setSkipTranslation(s.skipTranslation);
            if (s.series.type === 'bubble') {
                shader.setBubbleUniforms(s.series, s.zMin, s.zMax, pixelRatio);
            }
            shader.setDrawAsCircle(asCircle[s.series.type] || false);
            if (!vbuffer) {
                return;
            }
            // Do the actual rendering
            // If the line width is < 0, skip rendering of the lines. See #7833.
            if (lineWidth > 0 || s.drawMode !== 'LINE_STRIP') {
                for (sindex = 0; sindex < s.segments.length; sindex++) {
                    vbuffer.render(s.segments[sindex].from, s.segments[sindex].to, s.drawMode);
                }
            }
            if (s.hasMarkers && showMarkers) {
                shader.setPointSize(pick(options.marker && options.marker.radius, 5) * 2 * pixelRatio);
                shader.setDrawAsCircle(true);
                for (sindex = 0; sindex < s.segments.length; sindex++) {
                    vbuffer.render(s.segments[sindex].from, s.segments[sindex].to, 'POINTS');
                }
            }
        });
        if (settings.debug.timeRendering) {
            console.timeEnd('gl rendering'); // eslint-disable-line no-console
        }
        if (this.postRenderCallback) {
            this.postRenderCallback(this);
        }
        this.flush();
    };
    /**
     * Render the data when ready
     * @private
     */
    WGLRenderer.prototype.render = function (chart) {
        var _this = this;
        this.clear();
        if (chart.renderer.forExport) {
            return this.renderChart(chart);
        }
        if (this.isInited) {
            this.renderChart(chart);
        }
        else {
            setTimeout(function () {
                _this.render(chart);
            }, 1);
        }
    };
    /**
     * Set the viewport size in pixels
     * Creates an orthographic perspective matrix and applies it.
     * @private
     */
    WGLRenderer.prototype.setSize = function (width, height) {
        var shader = this.shader;
        // Skip if there's no change, or if we have no valid shader
        if (!shader || (this.width === width && this.height === height)) {
            return;
        }
        this.width = width;
        this.height = height;
        shader.bind();
        shader.setPMatrix(WGLRenderer.orthoMatrix(width, height));
    };
    /**
     * Init OpenGL
     * @private
     */
    WGLRenderer.prototype.init = function (canvas, noFlush) {
        var _this = this;
        var settings = this.settings;
        this.isInited = false;
        if (!canvas) {
            return false;
        }
        if (settings.debug.timeSetup) {
            console.time('gl setup'); // eslint-disable-line no-console
        }
        for (var i = 0; i < contexts.length; ++i) {
            this.gl = canvas.getContext(contexts[i], {
            //    /premultipliedAlpha: false
            });
            if (this.gl) {
                break;
            }
        }
        var gl = this.gl;
        if (gl) {
            if (!noFlush) {
                this.flush();
            }
        }
        else {
            return false;
        }
        gl.enable(gl.BLEND);
        /// gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);
        /// gl.depthMask(gl.FALSE);
        gl.depthFunc(gl.LESS);
        var shader = this.shader = new WGLShader(gl);
        if (!shader) {
            // We need to abort, there's no shader context
            return false;
        }
        this.vbuffer = new WGLVertexBuffer(gl, shader);
        var createTexture = function (name, fn) {
            var props = {
                isReady: false,
                texture: doc.createElement('canvas'),
                handle: gl.createTexture()
            }, ctx = props.texture.getContext('2d');
            _this.textureHandles[name] = props;
            props.texture.width = 512;
            props.texture.height = 512;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0)';
            ctx.fillStyle = '#FFF';
            fn(ctx);
            try {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, props.handle);
                /// gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, props.texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                /// gl.generateMipmap(gl.TEXTURE_2D);
                gl.bindTexture(gl.TEXTURE_2D, null);
                props.isReady = true;
            }
            catch (e) {
                // Silent error
            }
        };
        // Circle shape
        createTexture('circle', function (ctx) {
            ctx.beginPath();
            ctx.arc(256, 256, 256, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
        });
        // Square shape
        createTexture('square', function (ctx) {
            ctx.fillRect(0, 0, 512, 512);
        });
        // Diamond shape
        createTexture('diamond', function (ctx) {
            ctx.beginPath();
            ctx.moveTo(256, 0);
            ctx.lineTo(512, 256);
            ctx.lineTo(256, 512);
            ctx.lineTo(0, 256);
            ctx.lineTo(256, 0);
            ctx.fill();
        });
        // Triangle shape
        createTexture('triangle', function (ctx) {
            ctx.beginPath();
            ctx.moveTo(0, 512);
            ctx.lineTo(256, 0);
            ctx.lineTo(512, 512);
            ctx.lineTo(0, 512);
            ctx.fill();
        });
        // Triangle shape (rotated)
        createTexture('triangle-down', function (ctx) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(256, 512);
            ctx.lineTo(512, 0);
            ctx.lineTo(0, 0);
            ctx.fill();
        });
        this.isInited = true;
        if (settings.debug.timeSetup) {
            console.timeEnd('gl setup'); // eslint-disable-line no-console
        }
        return true;
    };
    /**
     * @private
     * @todo use it
     */
    WGLRenderer.prototype.destroy = function () {
        var gl = this.gl, shader = this.shader, vbuffer = this.vbuffer;
        this.flush();
        if (vbuffer) {
            vbuffer.destroy();
        }
        if (shader) {
            shader.destroy();
        }
        if (gl) {
            objectEach(this.textureHandles, function (texture) {
                if (texture.handle) {
                    gl.deleteTexture(texture.handle);
                }
            });
            gl.canvas.width = 1;
            gl.canvas.height = 1;
        }
    };
    return WGLRenderer;
}());
/* *
 *
 *  Default Export
 *
 * */
export default WGLRenderer;
