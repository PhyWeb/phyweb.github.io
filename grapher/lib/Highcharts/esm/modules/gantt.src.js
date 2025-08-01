/**
 * @license Highcharts Gantt JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/gantt
 * @requires highcharts
 *
 * Gantt series
 *
 * (c) 2016-2025 Lars A. V. Cabrera
 *
 * License: www.highcharts.com/license
 */
import * as __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__ from "../highcharts.src.js";
import * as __WEBPACK_EXTERNAL_MODULE__pathfinder_src_js_33aeac6b__ from "./pathfinder.src.js";
import * as __WEBPACK_EXTERNAL_MODULE__static_scale_src_js_77bdd82a__ from "./static-scale.src.js";
import * as __WEBPACK_EXTERNAL_MODULE__xrange_src_js_9610b67c__ from "./xrange.src.js";
/******/ // The require scope
/******/ var __webpack_require__ = {};
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat get default export */
/******/ (() => {
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		var getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/************************************************************************/

;// external ["../highcharts.src.js","default"]
const external_highcharts_src_js_default_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"];
var external_highcharts_src_js_default_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_namespaceObject);
;// ./code/es-modules/Extensions/ArrowSymbols.js
/* *
 *
 *  (c) 2017 Highsoft AS
 *  Authors: Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

/* *
 *
 *  Functions
 *
 * */
/**
 * Creates an arrow symbol. Like a triangle, except not filled.
 * ```
 *                   o
 *             o
 *       o
 * o
 *       o
 *             o
 *                   o
 * ```
 *
 * @private
 * @function
 *
 * @param {number} x
 *        x position of the arrow
 *
 * @param {number} y
 *        y position of the arrow
 *
 * @param {number} w
 *        width of the arrow
 *
 * @param {number} h
 *        height of the arrow
 *
 * @return {Highcharts.SVGPathArray}
 *         Path array
 */
function arrow(x, y, w, h) {
    return [
        ['M', x, y + h / 2],
        ['L', x + w, y],
        ['L', x, y + h / 2],
        ['L', x + w, y + h]
    ];
}
/**
 * Creates a half-width arrow symbol. Like a triangle, except not filled.
 * ```
 *       o
 *    o
 * o
 *    o
 *       o
 * ```
 *
 * @private
 * @function
 *
 * @param {number} x
 *        x position of the arrow
 *
 * @param {number} y
 *        y position of the arrow
 *
 * @param {number} w
 *        width of the arrow
 *
 * @param {number} h
 *        height of the arrow
 *
 * @return {Highcharts.SVGPathArray}
 *         Path array
 */
function arrowHalf(x, y, w, h) {
    return arrow(x, y, w / 2, h);
}
/**
 * @private
 */
function compose(SVGRendererClass) {
    const symbols = SVGRendererClass.prototype.symbols;
    symbols.arrow = arrow;
    symbols['arrow-filled'] = triangleLeft;
    symbols['arrow-filled-half'] = triangleLeftHalf;
    symbols['arrow-half'] = arrowHalf;
    symbols['triangle-left'] = triangleLeft;
    symbols['triangle-left-half'] = triangleLeftHalf;
}
/**
 * Creates a left-oriented triangle.
 * ```
 *             o
 *       ooooooo
 * ooooooooooooo
 *       ooooooo
 *             o
 * ```
 *
 * @private
 * @function
 *
 * @param {number} x
 *        x position of the triangle
 *
 * @param {number} y
 *        y position of the triangle
 *
 * @param {number} w
 *        width of the triangle
 *
 * @param {number} h
 *        height of the triangle
 *
 * @return {Highcharts.SVGPathArray}
 *         Path array
 */
function triangleLeft(x, y, w, h) {
    return [
        ['M', x + w, y],
        ['L', x, y + h / 2],
        ['L', x + w, y + h],
        ['Z']
    ];
}
/**
 * Creates a half-width, left-oriented triangle.
 * ```
 *       o
 *    oooo
 * ooooooo
 *    oooo
 *       o
 * ```
 *
 * @private
 * @function
 *
 * @param {number} x
 *        x position of the triangle
 *
 * @param {number} y
 *        y position of the triangle
 *
 * @param {number} w
 *        width of the triangle
 *
 * @param {number} h
 *        height of the triangle
 *
 * @return {Highcharts.SVGPathArray}
 *         Path array
 */
function triangleLeftHalf(x, y, w, h) {
    return triangleLeft(x, y, w / 2, h);
}
/* *
 *
 *  Default Export
 *
 * */
const ArrowSymbols = {
    compose
};
/* harmony default export */ const Extensions_ArrowSymbols = (ArrowSymbols);

;// ./code/es-modules/Gantt/Connection.js
/* *
 *
 *  (c) 2016 Highsoft AS
 *  Authors: Øystein Moseng, Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */



const { defined, error, merge, objectEach } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Constants
 *
 * */
const deg2rad = (external_highcharts_src_js_default_default()).deg2rad, max = Math.max, min = Math.min;
/* *
 *
 *  Class
 *
 * */
/**
 * The Connection class. Used internally to represent a connection between two
 * points.
 *
 * @private
 * @class
 * @name Highcharts.Connection
 *
 * @param {Highcharts.Point} from
 *        Connection runs from this Point.
 *
 * @param {Highcharts.Point} to
 *        Connection runs to this Point.
 *
 * @param {Highcharts.ConnectorsOptions} [options]
 *        Connection options.
 */
class Connection {
    constructor(from, to, options) {
        this.init(from, to, options);
    }
    /**
     * Initialize the Connection object. Used as constructor only.
     *
     * @function Highcharts.Connection#init
     *
     * @param {Highcharts.Point} from
     *        Connection runs from this Point.
     *
     * @param {Highcharts.Point} to
     *        Connection runs to this Point.
     *
     * @param {Highcharts.ConnectorsOptions} [options]
     *        Connection options.
     */
    init(from, to, options) {
        this.fromPoint = from;
        this.toPoint = to;
        this.options = options;
        this.chart = from.series.chart;
        this.pathfinder = this.chart.pathfinder;
    }
    /**
     * Add (or update) this connection's path on chart. Stores reference to the
     * created element on this.graphics.path.
     *
     * @function Highcharts.Connection#renderPath
     *
     * @param {Highcharts.SVGPathArray} path
     *        Path to render, in array format. E.g. ['M', 0, 0, 'L', 10, 10]
     *
     * @param {Highcharts.SVGAttributes} [attribs]
     *        SVG attributes for the path.
     *
     * @param {Partial<Highcharts.AnimationOptionsObject>} [animation]
     *        Animation options for the rendering.
     */
    renderPath(path, attribs) {
        const connection = this, chart = this.chart, styledMode = chart.styledMode, pathfinder = this.pathfinder, anim = {};
        let pathGraphic = connection.graphics && connection.graphics.path;
        // Add the SVG element of the pathfinder group if it doesn't exist
        if (!pathfinder.group) {
            pathfinder.group = chart.renderer.g()
                .addClass('highcharts-pathfinder-group')
                .attr({ zIndex: -1 })
                .add(chart.seriesGroup);
        }
        // Shift the group to compensate for plot area.
        // Note: Do this always (even when redrawing a path) to avoid issues
        // when updating chart in a way that changes plot metrics.
        pathfinder.group.translate(chart.plotLeft, chart.plotTop);
        // Create path if does not exist
        if (!(pathGraphic && pathGraphic.renderer)) {
            pathGraphic = chart.renderer.path()
                .add(pathfinder.group);
            if (!styledMode) {
                pathGraphic.attr({
                    opacity: 0
                });
            }
        }
        // Set path attribs and animate to the new path
        pathGraphic.attr(attribs);
        anim.d = path;
        if (!styledMode) {
            anim.opacity = 1;
        }
        pathGraphic.animate(anim);
        // Store reference on connection
        this.graphics = this.graphics || {};
        this.graphics.path = pathGraphic;
    }
    /**
     * Calculate and add marker graphics for connection to the chart. The
     * created/updated elements are stored on this.graphics.start and
     * this.graphics.end.
     *
     * @function Highcharts.Connection#addMarker
     *
     * @param {string} type
     *        Marker type, either 'start' or 'end'.
     *
     * @param {Highcharts.ConnectorsMarkerOptions} options
     *        All options for this marker. Not calculated or merged with other
     *        options.
     *
     * @param {Highcharts.SVGPathArray} path
     *        Connection path in array format. This is used to calculate the
     *        rotation angle of the markers.
     */
    addMarker(type, options, path) {
        const connection = this, chart = connection.fromPoint.series.chart, pathfinder = chart.pathfinder, renderer = chart.renderer, point = (type === 'start' ?
            connection.fromPoint :
            connection.toPoint), anchor = point.getPathfinderAnchorPoint(options);
        let markerVector, radians, rotation, box, width, height, pathVector, segment;
        if (!options.enabled) {
            return;
        }
        // Last vector before start/end of path, used to get angle
        if (type === 'start') {
            segment = path[1];
        }
        else { // 'end'
            segment = path[path.length - 2];
        }
        if (segment && segment[0] === 'M' || segment[0] === 'L') {
            pathVector = {
                x: segment[1],
                y: segment[2]
            };
            // Get angle between pathVector and anchor point and use it to
            // create marker position.
            radians = point.getRadiansToVector(pathVector, anchor);
            markerVector = point.getMarkerVector(radians, options.radius, anchor);
            // Rotation of marker is calculated from angle between pathVector
            // and markerVector.
            // (Note:
            //  Used to recalculate radians between markerVector and pathVector,
            //  but this should be the same as between pathVector and anchor.)
            rotation = -radians / deg2rad;
            if (options.width && options.height) {
                width = options.width;
                height = options.height;
            }
            else {
                width = height = options.radius * 2;
            }
            // Add graphics object if it does not exist
            connection.graphics = connection.graphics || {};
            box = {
                x: markerVector.x - (width / 2),
                y: markerVector.y - (height / 2),
                width: width,
                height: height,
                rotation: rotation,
                rotationOriginX: markerVector.x,
                rotationOriginY: markerVector.y
            };
            if (!connection.graphics[type]) {
                // Create new marker element
                connection.graphics[type] = renderer
                    .symbol(options.symbol)
                    .addClass('highcharts-point-connecting-path-' + type + '-marker' +
                    ' highcharts-color-' + this.fromPoint.colorIndex)
                    .attr(box)
                    .add(pathfinder.group);
                if (!renderer.styledMode) {
                    connection.graphics[type].attr({
                        fill: options.color || connection.fromPoint.color,
                        stroke: options.lineColor,
                        'stroke-width': options.lineWidth,
                        opacity: 0
                    })
                        .animate({
                        opacity: 1
                    }, point.series.options.animation);
                }
            }
            else {
                connection.graphics[type].animate(box);
            }
        }
    }
    /**
     * Calculate and return connection path.
     * Note: Recalculates chart obstacles on demand if they aren't calculated.
     *
     * @function Highcharts.Connection#getPath
     *
     * @param {Highcharts.ConnectorsOptions} options
     *        Connector options. Not calculated or merged with other options.
     *
     * @return {object|undefined}
     *         Calculated SVG path data in array format.
     */
    getPath(options) {
        const pathfinder = this.pathfinder, chart = this.chart, algorithm = pathfinder.algorithms[options.type];
        let chartObstacles = pathfinder.chartObstacles;
        if (typeof algorithm !== 'function') {
            error('"' + options.type + '" is not a Pathfinder algorithm.');
            return {
                path: [],
                obstacles: []
            };
        }
        // This function calculates obstacles on demand if they don't exist
        if (algorithm.requiresObstacles && !chartObstacles) {
            chartObstacles =
                pathfinder.chartObstacles =
                    pathfinder.getChartObstacles(options);
            // If the algorithmMargin was computed, store the result in default
            // options.
            chart.options.connectors.algorithmMargin =
                options.algorithmMargin;
            // Cache some metrics too
            pathfinder.chartObstacleMetrics =
                pathfinder.getObstacleMetrics(chartObstacles);
        }
        // Get the SVG path
        return algorithm(
        // From
        this.fromPoint.getPathfinderAnchorPoint(options.startMarker), 
        // To
        this.toPoint.getPathfinderAnchorPoint(options.endMarker), merge({
            chartObstacles: chartObstacles,
            lineObstacles: pathfinder.lineObstacles || [],
            obstacleMetrics: pathfinder.chartObstacleMetrics,
            hardBounds: {
                xMin: 0,
                xMax: chart.plotWidth,
                yMin: 0,
                yMax: chart.plotHeight
            },
            obstacleOptions: {
                margin: options.algorithmMargin
            },
            startDirectionX: pathfinder.getAlgorithmStartDirection(options.startMarker)
        }, options));
    }
    /**
     * (re)Calculate and (re)draw the connection.
     *
     * @function Highcharts.Connection#render
     */
    render() {
        const connection = this, fromPoint = connection.fromPoint, series = fromPoint.series, chart = series.chart, pathfinder = chart.pathfinder, attribs = {};
        let options = merge(chart.options.connectors, series.options.connectors, fromPoint.options.connectors, connection.options);
        // Set path attribs
        if (!chart.styledMode) {
            attribs.stroke = options.lineColor || fromPoint.color;
            attribs['stroke-width'] = options.lineWidth;
            if (options.dashStyle) {
                attribs.dashstyle = options.dashStyle;
            }
        }
        attribs['class'] = // eslint-disable-line dot-notation
            'highcharts-point-connecting-path ' +
                'highcharts-color-' + fromPoint.colorIndex;
        options = merge(attribs, options);
        // Set common marker options
        if (!defined(options.marker.radius)) {
            options.marker.radius = min(max(Math.ceil((options.algorithmMargin || 8) / 2) - 1, 1), 5);
        }
        // Get the path
        const pathResult = connection.getPath(options), path = pathResult.path;
        // Always update obstacle storage with obstacles from this path.
        // We don't know if future calls will need this for their algorithm.
        if (pathResult.obstacles) {
            pathfinder.lineObstacles =
                pathfinder.lineObstacles || [];
            pathfinder.lineObstacles =
                pathfinder.lineObstacles.concat(pathResult.obstacles);
        }
        // Add the calculated path to the pathfinder group
        connection.renderPath(path, attribs);
        // Render the markers
        connection.addMarker('start', merge(options.marker, options.startMarker), path);
        connection.addMarker('end', merge(options.marker, options.endMarker), path);
    }
    /**
     * Destroy connection by destroying the added graphics elements.
     *
     * @function Highcharts.Connection#destroy
     */
    destroy() {
        if (this.graphics) {
            objectEach(this.graphics, function (val) {
                val.destroy();
            });
            delete this.graphics;
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Gantt_Connection = (Connection);
/* *
 *
 *  API Declarations
 *
 * */
/**
 * The default pathfinder algorithm to use for a chart. It is possible to define
 * your own algorithms by adding them to the
 * `Highcharts.Pathfinder.prototype.algorithms`
 * object before the chart has been created.
 *
 * The default algorithms are as follows:
 *
 * `straight`:      Draws a straight line between the connecting
 *                  points. Does not avoid other points when drawing.
 *
 * `simpleConnect`: Finds a path between the points using right angles
 *                  only. Takes only starting/ending points into
 *                  account, and will not avoid other points.
 *
 * `fastAvoid`:     Finds a path between the points using right angles
 *                  only. Will attempt to avoid other points, but its
 *                  focus is performance over accuracy. Works well with
 *                  less dense datasets.
 *
 * @typedef {"fastAvoid"|"simpleConnect"|"straight"|string} Highcharts.PathfinderTypeValue
 */
''; // Keeps doclets above in JS file

;// ./code/es-modules/Extensions/CurrentDateIndication.js
/* *
 *
 *  (c) 2016-2025 Highsoft AS
 *
 *  Author: Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { composed } = (external_highcharts_src_js_default_default());

const { addEvent, merge: CurrentDateIndication_merge, pushUnique, wrap } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Constants
 *
 * */
/**
 * Show an indicator on the axis for the current date and time. Can be a
 * boolean or a configuration object similar to
 * [xAxis.plotLines](#xAxis.plotLines).
 *
 * @sample gantt/current-date-indicator/demo
 *         Current date indicator enabled
 * @sample gantt/current-date-indicator/object-config
 *         Current date indicator with custom options
 *
 * @declare   Highcharts.CurrentDateIndicatorOptions
 * @type      {boolean|CurrentDateIndicatorOptions}
 * @default   true
 * @extends   xAxis.plotLines
 * @excluding value
 * @product   gantt
 * @apioption xAxis.currentDateIndicator
 */
const defaultOptions = {
    color: "#ccd3ff" /* Palette.highlightColor20 */,
    width: 2,
    /**
     * @declare Highcharts.AxisCurrentDateIndicatorLabelOptions
     */
    label: {
        /**
         * Format of the label. This options is passed as the first argument to
         * [dateFormat](/class-reference/Highcharts.Time#dateFormat) function.
         *
         * @type      {string|Intl.DateTimeFormatOptions}
         * @product   gantt
         * @apioption xAxis.currentDateIndicator.label.format
         */
        format: '%[abdYHM]',
        formatter: function (value, format) {
            return this.axis.chart.time.dateFormat(format || '', value, true);
        },
        rotation: 0,
        /**
         * @type {Highcharts.CSSObject}
         */
        style: {
            /** @internal */
            fontSize: '0.7em'
        }
    }
};
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function CurrentDateIndication_compose(AxisClass, PlotLineOrBandClass) {
    if (pushUnique(composed, 'CurrentDateIndication')) {
        addEvent(AxisClass, 'afterSetOptions', onAxisAfterSetOptions);
        addEvent(PlotLineOrBandClass, 'render', onPlotLineOrBandRender);
        wrap(PlotLineOrBandClass.prototype, 'getLabelText', wrapPlotLineOrBandGetLabelText);
    }
}
/**
 * @private
 */
function onAxisAfterSetOptions() {
    const options = this.options, cdiOptions = options.currentDateIndicator;
    if (cdiOptions) {
        const plotLineOptions = typeof cdiOptions === 'object' ?
            CurrentDateIndication_merge(defaultOptions, cdiOptions) :
            CurrentDateIndication_merge(defaultOptions);
        plotLineOptions.value = Date.now();
        plotLineOptions.className = 'highcharts-current-date-indicator';
        if (!options.plotLines) {
            options.plotLines = [];
        }
        options.plotLines.push(plotLineOptions);
    }
}
/**
 * @private
 */
function onPlotLineOrBandRender() {
    // If the label already exists, update its text
    if (this.label) {
        this.label.attr({
            text: this.getLabelText(this.options.label)
        });
    }
}
/**
 * @private
 */
function wrapPlotLineOrBandGetLabelText(defaultMethod, defaultLabelOptions) {
    const options = this.options;
    if (options &&
        options.className &&
        options.className.indexOf('highcharts-current-date-indicator') !== -1 &&
        options.label &&
        typeof options.label.formatter === 'function') {
        options.value = Date.now();
        return options.label.formatter
            .call(this, options.value, options.label.format);
    }
    return defaultMethod.call(this, defaultLabelOptions);
}
/* *
 *
 *  Default Export
 *
 * */
const CurrentDateIndication = {
    compose: CurrentDateIndication_compose
};
/* harmony default export */ const Extensions_CurrentDateIndication = (CurrentDateIndication);

;// external ["../highcharts.src.js","default","Chart"]
const external_highcharts_src_js_default_Chart_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].Chart;
var external_highcharts_src_js_default_Chart_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_Chart_namespaceObject);
;// ./code/es-modules/Core/Chart/GanttChart.js
/* *
 *
 *  (c) 2016-2025 Highsoft AS
 *
 *  Author: Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */



const { defaultOptions: GanttChart_defaultOptions } = (external_highcharts_src_js_default_default());

const { isArray, merge: GanttChart_merge, splat } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Class
 *
 * */
/**
 * Gantt-optimized chart. Use {@link Highcharts.Chart|Chart} for common charts.
 *
 * @requires modules/gantt
 *
 * @class
 * @name Highcharts.GanttChart
 * @extends Highcharts.Chart
 */
class GanttChart extends (external_highcharts_src_js_default_Chart_default()) {
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Initializes the chart. The constructor's arguments are passed on
     * directly.
     *
     * @function Highcharts.GanttChart#init
     *
     * @param {Highcharts.Options} userOptions
     *        Custom options.
     *
     * @param {Function} [callback]
     *        Function to run when the chart has loaded and all external
     *        images are loaded.
     *
     *
     * @emits Highcharts.GanttChart#event:init
     * @emits Highcharts.GanttChart#event:afterInit
     */
    init(userOptions, callback) {
        const xAxisOptions = userOptions.xAxis, yAxisOptions = userOptions.yAxis;
        let defaultLinkedTo;
        // Avoid doing these twice
        userOptions.xAxis = userOptions.yAxis = void 0;
        const options = GanttChart_merge(true, {
            chart: {
                type: 'gantt'
            },
            title: {
                text: ''
            },
            legend: {
                enabled: false
            },
            navigator: {
                series: { type: 'gantt' },
                // Bars were clipped, #14060.
                yAxis: {
                    type: 'category'
                }
            }
        }, userOptions, // User's options
        // forced options
        {
            isGantt: true
        });
        userOptions.xAxis = xAxisOptions;
        userOptions.yAxis = yAxisOptions;
        // Apply X axis options to both single and multi x axes If user hasn't
        // defined axes as array, make it into an array and add a second axis by
        // default.
        options.xAxis = (!isArray(userOptions.xAxis) ?
            [userOptions.xAxis || {}, {}] :
            userOptions.xAxis).map((xAxisOptions, i) => {
            if (i === 1) { // Second xAxis
                defaultLinkedTo = 0;
            }
            return GanttChart_merge(
            // Defaults
            {
                grid: {
                    borderColor: GanttChart_defaultOptions.xAxis?.grid?.borderColor ||
                        "#cccccc" /* Palette.neutralColor20 */,
                    enabled: true
                },
                opposite: GanttChart_defaultOptions.xAxis?.opposite ??
                    xAxisOptions.opposite ??
                    true,
                linkedTo: defaultLinkedTo
            }, 
            // User options
            xAxisOptions, 
            // Forced options
            {
                type: 'datetime'
            });
        });
        // Apply Y axis options to both single and multi y axes
        options.yAxis = (splat(userOptions.yAxis || {})).map((yAxisOptions) => GanttChart_merge(
        // Defaults
        {
            grid: {
                borderColor: GanttChart_defaultOptions.yAxis?.grid?.borderColor ||
                    "#cccccc" /* Palette.neutralColor20 */,
                enabled: true
            },
            staticScale: 50,
            reversed: true,
            // Set default type treegrid, but only if 'categories' is
            // undefined
            type: yAxisOptions.categories ? yAxisOptions.type : 'treegrid'
        }, 
        // User options
        yAxisOptions));
        super.init(options, callback);
    }
}
/* *
 *
 *  Class Namespace
 *
 * */
(function (GanttChart) {
    /* *
     *
     *  Functions
     *
     * */
    /* eslint-disable jsdoc/check-param-names */
    /**
     * The factory function for creating new gantt charts. Creates a new {@link
     * Highcharts.GanttChart|GanttChart} object with different default options
     * than the basic Chart.
     *
     * @example
     * // Render a chart in to div#container
     * let chart = Highcharts.ganttChart('container', {
     *     title: {
     *         text: 'My chart'
     *     },
     *     series: [{
     *         data: ...
     *     }]
     * });
     *
     * @function Highcharts.ganttChart
     *
     * @param {string|Highcharts.HTMLDOMElement} renderTo
     *        The DOM element to render to, or its id.
     *
     * @param {Highcharts.Options} options
     *        The chart options structure.
     *
     * @param {Highcharts.ChartCallbackFunction} [callback]
     *        Function to run when the chart has loaded and all external
     *        images are loaded. Defining a
     *        [chart.events.load](https://api.highcharts.com/highcharts/chart.events.load)
     *        handler is equivalent.
     *
     * @return {Highcharts.GanttChart}
     *         Returns the Chart object.
     */
    function ganttChart(a, b, c) {
        return new GanttChart(a, b, c);
    }
    GanttChart.ganttChart = ganttChart;
    /* eslint-enable jsdoc/check-param-names */
})(GanttChart || (GanttChart = {}));
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Chart_GanttChart = (GanttChart);

;// external ["../highcharts.src.js","default","Axis"]
const external_highcharts_src_js_default_Axis_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].Axis;
var external_highcharts_src_js_default_Axis_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_Axis_namespaceObject);
;// ./code/es-modules/Stock/Navigator/ChartNavigatorComposition.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { isTouchDevice } = (external_highcharts_src_js_default_default());

const { addEvent: ChartNavigatorComposition_addEvent, merge: ChartNavigatorComposition_merge, pick } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Constants
 *
 * */
const composedMembers = [];
/* *
 *
 *  Variables
 *
 * */
let NavigatorConstructor;
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function ChartNavigatorComposition_compose(ChartClass, NavigatorClass) {
    if (external_highcharts_src_js_default_default().pushUnique(composedMembers, ChartClass)) {
        const chartProto = ChartClass.prototype;
        NavigatorConstructor = NavigatorClass;
        chartProto.callbacks.push(onChartCallback);
        ChartNavigatorComposition_addEvent(ChartClass, 'afterAddSeries', onChartAfterAddSeries);
        ChartNavigatorComposition_addEvent(ChartClass, 'afterSetChartSize', onChartAfterSetChartSize);
        ChartNavigatorComposition_addEvent(ChartClass, 'afterUpdate', onChartAfterUpdate);
        ChartNavigatorComposition_addEvent(ChartClass, 'beforeRender', onChartBeforeRender);
        ChartNavigatorComposition_addEvent(ChartClass, 'beforeShowResetZoom', onChartBeforeShowResetZoom);
        ChartNavigatorComposition_addEvent(ChartClass, 'update', onChartUpdate);
    }
}
/**
 * Handle adding new series.
 * @private
 */
function onChartAfterAddSeries() {
    if (this.navigator) {
        // Recompute which series should be shown in navigator, and add them
        this.navigator.setBaseSeries(null, false);
    }
}
/**
 * For stock charts, extend the Chart.setChartSize method so that we can set the
 * final top position of the navigator once the height of the chart, including
 * the legend, is determined. #367. We can't use Chart.getMargins, because
 * labels offsets are not calculated yet.
 * @private
 */
function onChartAfterSetChartSize() {
    const legend = this.legend, navigator = this.navigator;
    let legendOptions, xAxis, yAxis;
    if (navigator) {
        legendOptions = legend && legend.options;
        xAxis = navigator.xAxis;
        yAxis = navigator.yAxis;
        const { scrollbarHeight, scrollButtonSize } = navigator;
        // Compute the top position
        if (this.inverted) {
            navigator.left = navigator.opposite ?
                this.chartWidth - scrollbarHeight -
                    navigator.height :
                this.spacing[3] + scrollbarHeight;
            navigator.top = this.plotTop + scrollButtonSize;
        }
        else {
            navigator.left = pick(xAxis.left, this.plotLeft + scrollButtonSize);
            navigator.top = navigator.navigatorOptions.top ||
                this.chartHeight -
                    navigator.height -
                    scrollbarHeight -
                    (this.scrollbar?.options.margin || 0) -
                    this.spacing[2] -
                    (this.rangeSelector && this.extraBottomMargin ?
                        this.rangeSelector.getHeight() :
                        0) -
                    ((legendOptions &&
                        legendOptions.verticalAlign === 'bottom' &&
                        legendOptions.layout !== 'proximate' && // #13392
                        legendOptions.enabled &&
                        !legendOptions.floating) ?
                        legend.legendHeight +
                            pick(legendOptions.margin, 10) :
                        0) -
                    (this.titleOffset ? this.titleOffset[2] : 0);
        }
        if (xAxis && yAxis) { // False if navigator is disabled (#904)
            if (this.inverted) {
                xAxis.options.left = yAxis.options.left = navigator.left;
            }
            else {
                xAxis.options.top = yAxis.options.top = navigator.top;
            }
            xAxis.setAxisSize();
            yAxis.setAxisSize();
        }
    }
}
/**
 * Initialize navigator, if no scrolling exists yet.
 * @private
 */
function onChartAfterUpdate(event) {
    if (!this.navigator && !this.scroller &&
        (this.options.navigator.enabled ||
            this.options.scrollbar.enabled)) {
        this.scroller = this.navigator = new NavigatorConstructor(this);
        if (pick(event.redraw, true)) {
            this.redraw(event.animation); // #7067
        }
    }
}
/**
 * Initialize navigator for stock charts
 * @private
 */
function onChartBeforeRender() {
    const options = this.options;
    if (options.navigator.enabled ||
        options.scrollbar.enabled) {
        this.scroller = this.navigator = new NavigatorConstructor(this);
    }
}
/**
 * For Stock charts. For x only zooming, do not to create the zoom button
 * because X axis zooming is already allowed by the Navigator and Range
 * selector. (#9285)
 * @private
 */
function onChartBeforeShowResetZoom() {
    const chartOptions = this.options, navigator = chartOptions.navigator, rangeSelector = chartOptions.rangeSelector;
    if (((navigator && navigator.enabled) ||
        (rangeSelector && rangeSelector.enabled)) &&
        ((!isTouchDevice &&
            this.zooming.type === 'x') ||
            (isTouchDevice && this.zooming.pinchType === 'x'))) {
        return false;
    }
}
/**
 * @private
 */
function onChartCallback(chart) {
    const navigator = chart.navigator;
    // Initialize the navigator
    if (navigator && chart.xAxis[0]) {
        const extremes = chart.xAxis[0].getExtremes();
        navigator.render(extremes.min, extremes.max);
    }
}
/**
 * Merge options, if no scrolling exists yet
 * @private
 */
function onChartUpdate(e) {
    const navigatorOptions = (e.options.navigator || {}), scrollbarOptions = (e.options.scrollbar || {});
    if (!this.navigator && !this.scroller &&
        (navigatorOptions.enabled || scrollbarOptions.enabled)) {
        ChartNavigatorComposition_merge(true, this.options.navigator, navigatorOptions);
        ChartNavigatorComposition_merge(true, this.options.scrollbar, scrollbarOptions);
        delete e.options.navigator;
        delete e.options.scrollbar;
    }
}
/* *
 *
 *  Default Export
 *
 * */
const ChartNavigatorComposition = {
    compose: ChartNavigatorComposition_compose
};
/* harmony default export */ const Navigator_ChartNavigatorComposition = (ChartNavigatorComposition);

;// ./code/es-modules/Core/Axis/NavigatorAxisComposition.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { isTouchDevice: NavigatorAxisComposition_isTouchDevice } = (external_highcharts_src_js_default_default());

const { addEvent: NavigatorAxisComposition_addEvent, correctFloat, defined: NavigatorAxisComposition_defined, isNumber, pick: NavigatorAxisComposition_pick } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function onAxisInit() {
    const axis = this;
    if (!axis.navigatorAxis) {
        axis.navigatorAxis = new NavigatorAxisAdditions(axis);
    }
}
/**
 * For Stock charts, override selection zooming with some special features
 * because X axis zooming is already allowed by the Navigator and Range
 * selector.
 * @private
 */
function onAxisSetExtremes(e) {
    const axis = this, chart = axis.chart, chartOptions = chart.options, navigator = chartOptions.navigator, navigatorAxis = axis.navigatorAxis, pinchType = chart.zooming.pinchType, rangeSelector = chartOptions.rangeSelector, zoomType = chart.zooming.type;
    let zoomed;
    if (axis.isXAxis &&
        (navigator?.enabled || rangeSelector?.enabled)) {
        // For y only zooming, ignore the X axis completely
        if (zoomType === 'y' && e.trigger === 'zoom') {
            zoomed = false;
            // For xy zooming, record the state of the zoom before zoom selection,
            // then when the reset button is pressed, revert to this state. This
            // should apply only if the chart is initialized with a range (#6612),
            // otherwise zoom all the way out.
        }
        else if (((e.trigger === 'zoom' && zoomType === 'xy') ||
            (NavigatorAxisComposition_isTouchDevice && pinchType === 'xy')) &&
            axis.options.range) {
            const previousZoom = navigatorAxis.previousZoom;
            // Minimum defined, zooming in
            if (NavigatorAxisComposition_defined(e.min)) {
                navigatorAxis.previousZoom = [axis.min, axis.max];
                // Minimum undefined, resetting zoom
            }
            else if (previousZoom) {
                e.min = previousZoom[0];
                e.max = previousZoom[1];
                navigatorAxis.previousZoom = void 0;
            }
        }
    }
    if (typeof zoomed !== 'undefined') {
        e.preventDefault();
    }
}
/* *
 *
 *  Class
 *
 * */
/**
 * @private
 * @class
 */
class NavigatorAxisAdditions {
    /* *
     *
     *  Static Functions
     *
     * */
    /**
     * @private
     */
    static compose(AxisClass) {
        if (!AxisClass.keepProps.includes('navigatorAxis')) {
            AxisClass.keepProps.push('navigatorAxis');
            NavigatorAxisComposition_addEvent(AxisClass, 'init', onAxisInit);
            NavigatorAxisComposition_addEvent(AxisClass, 'setExtremes', onAxisSetExtremes);
        }
    }
    /* *
     *
     *  Constructors
     *
     * */
    constructor(axis) {
        this.axis = axis;
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * @private
     */
    destroy() {
        this.axis = void 0;
    }
    /**
     * Add logic to normalize the zoomed range in order to preserve the pressed
     * state of range selector buttons
     *
     * @private
     * @function Highcharts.Axis#toFixedRange
     */
    toFixedRange(pxMin, pxMax, fixedMin, fixedMax) {
        const axis = this.axis, halfPointRange = (axis.pointRange || 0) / 2;
        let newMin = NavigatorAxisComposition_pick(fixedMin, axis.translate(pxMin, true, !axis.horiz)), newMax = NavigatorAxisComposition_pick(fixedMax, axis.translate(pxMax, true, !axis.horiz));
        // Add/remove half point range to/from the extremes (#1172)
        if (!NavigatorAxisComposition_defined(fixedMin)) {
            newMin = correctFloat(newMin + halfPointRange);
        }
        if (!NavigatorAxisComposition_defined(fixedMax)) {
            newMax = correctFloat(newMax - halfPointRange);
        }
        if (!isNumber(newMin) || !isNumber(newMax)) { // #1195, #7411
            newMin = newMax = void 0;
        }
        return {
            min: newMin,
            max: newMax
        };
    }
}
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const NavigatorAxisComposition = (NavigatorAxisAdditions);

;// external ["../highcharts.src.js","default","Color"]
const external_highcharts_src_js_default_Color_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].Color;
var external_highcharts_src_js_default_Color_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_Color_namespaceObject);
;// external ["../highcharts.src.js","default","SeriesRegistry"]
const external_highcharts_src_js_default_SeriesRegistry_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].SeriesRegistry;
var external_highcharts_src_js_default_SeriesRegistry_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_SeriesRegistry_namespaceObject);
;// ./code/es-modules/Stock/Navigator/NavigatorDefaults.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { parse: color } = (external_highcharts_src_js_default_Color_default());

const { seriesTypes } = (external_highcharts_src_js_default_SeriesRegistry_default());
/* *
 *
 *  Constants
 *
 * */
/**
 * The navigator is a small series below the main series, displaying
 * a view of the entire data set. It provides tools to zoom in and
 * out on parts of the data as well as panning across the dataset.
 *
 * @product      highstock gantt
 * @optionparent navigator
 */
const NavigatorDefaults = {
    /**
     * Whether the navigator and scrollbar should adapt to updated data
     * in the base X axis. When loading data async, as in the demo below,
     * this should be `false`. Otherwise new data will trigger navigator
     * redraw, which will cause unwanted looping. In the demo below, the
     * data in the navigator is set only once. On navigating, only the main
     * chart content is updated.
     *
     * @sample {highstock} stock/demo/lazy-loading/
     *         Set to false with async data loading
     *
     * @type      {boolean}
     * @default   true
     * @apioption navigator.adaptToUpdatedData
     */
    /**
     * An integer identifying the index to use for the base series, or a
     * string representing the id of the series.
     *
     * **Note**: As of Highcharts 5.0, this is now a deprecated option.
     * Prefer [series.showInNavigator](#plotOptions.series.showInNavigator).
     *
     * @see [series.showInNavigator](#plotOptions.series.showInNavigator)
     *
     * @deprecated
     * @type      {number|string}
     * @default   0
     * @apioption navigator.baseSeries
     */
    /**
     * Enable or disable the navigator.
     *
     * @sample {highstock} stock/navigator/enabled/
     *         Disable the navigator
     *
     * @type      {boolean}
     * @default   true
     * @apioption navigator.enabled
     */
    /**
     * When the chart is inverted, whether to draw the navigator on the
     * opposite side.
     *
     * @type      {boolean}
     * @default   false
     * @since     5.0.8
     * @apioption navigator.opposite
     */
    /**
     * The height of the navigator.
     *
     * @sample {highstock} stock/navigator/height/
     *         A higher navigator
     */
    height: 40,
    /**
     * The distance from the nearest element, the X axis or X axis labels.
     *
     * @sample {highstock} stock/navigator/margin/
     *         A margin of 2 draws the navigator closer to the X axis labels
     */
    margin: 22,
    /**
     * Whether the mask should be inside the range marking the zoomed
     * range, or outside. In Highcharts Stock 1.x it was always `false`.
     *
     * @sample {highstock} stock/demo/maskinside-false/
     *         False, mask outside
     *
     * @since   2.0
     */
    maskInside: true,
    /**
     * Options for the handles for dragging the zoomed area.
     *
     * @sample {highstock} stock/navigator/handles/
     *         Colored handles
     */
    handles: {
        /**
         * Width for handles.
         *
         * @sample {highstock} stock/navigator/styled-handles/
         *         Styled handles
         *
         * @since   6.0.0
         */
        width: 7,
        /**
         * Border radius of the handles.
         *
         * @sample {highstock} stock/navigator/handles-border-radius/
         *      Border radius on the navigator handles.
         *
         * @since 11.4.2
         */
        borderRadius: 0,
        /**
         * Height for handles.
         *
         * @sample {highstock} stock/navigator/styled-handles/
         *         Styled handles
         *
         * @since   6.0.0
         */
        height: 15,
        /**
         * Array to define shapes of handles. 0-index for left, 1-index for
         * right.
         *
         * Additionally, the URL to a graphic can be given on this form:
         * `url(graphic.png)`. Note that for the image to be applied to
         * exported charts, its URL needs to be accessible by the export
         * server.
         *
         * Custom callbacks for symbol path generation can also be added to
         * `Highcharts.SVGRenderer.prototype.symbols`. The callback is then
         * used by its method name, as shown in the demo.
         *
         * @sample {highstock} stock/navigator/styled-handles/
         *         Styled handles
         *
         * @type    {Array<string>}
         * @default ["navigator-handle", "navigator-handle"]
         * @since   6.0.0
         */
        symbols: ['navigator-handle', 'navigator-handle'],
        /**
         * Allows to enable/disable handles.
         *
         * @since   6.0.0
         */
        enabled: true,
        /**
         * The width for the handle border and the stripes inside.
         *
         * @sample {highstock} stock/navigator/styled-handles/
         *         Styled handles
         *
         * @since     6.0.0
         * @apioption navigator.handles.lineWidth
         */
        lineWidth: 1,
        /**
         * The fill for the handle.
         *
         * @type    {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
         */
        backgroundColor: "#f2f2f2" /* Palette.neutralColor5 */,
        /**
         * The stroke for the handle border and the stripes inside.
         *
         * @type    {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
         */
        borderColor: "#999999" /* Palette.neutralColor40 */
    },
    /**
     * The color of the mask covering the areas of the navigator series
     * that are currently not visible in the main series. The default
     * color is bluish with an opacity of 0.3 to see the series below.
     *
     * @see In styled mode, the mask is styled with the
     *      `.highcharts-navigator-mask` and
     *      `.highcharts-navigator-mask-inside` classes.
     *
     * @sample {highstock} stock/navigator/maskfill/
     *         Blue, semi transparent mask
     *
     * @type    {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     * @default rgba(102,133,194,0.3)
     */
    maskFill: color("#667aff" /* Palette.highlightColor60 */).setOpacity(0.3).get(),
    /**
     * The color of the line marking the currently zoomed area in the
     * navigator.
     *
     * @sample {highstock} stock/navigator/outline/
     *         2px blue outline
     *
     * @type    {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     * @default #cccccc
     */
    outlineColor: "#999999" /* Palette.neutralColor40 */,
    /**
     * The width of the line marking the currently zoomed area in the
     * navigator.
     *
     * @see In styled mode, the outline stroke width is set with the
     *      `.highcharts-navigator-outline` class.
     *
     * @sample {highstock} stock/navigator/outline/
     *         2px blue outline
     *
     * @type    {number}
     */
    outlineWidth: 1,
    /**
     * Options for the navigator series. Available options are the same
     * as any series, documented at [plotOptions](#plotOptions.series)
     * and [series](#series).
     *
     * Unless data is explicitly defined on navigator.series, the data
     * is borrowed from the first series in the chart.
     *
     * Default series options for the navigator series are:
     * ```js
     * series: {
     *     type: 'areaspline',
     *     fillOpacity: 0.05,
     *     dataGrouping: {
     *         smoothed: true
     *     },
     *     lineWidth: 1,
     *     marker: {
     *         enabled: false
     *     }
     * }
     * ```
     *
     * @see In styled mode, the navigator series is styled with the
     *      `.highcharts-navigator-series` class.
     *
     * @sample {highstock} stock/navigator/series-data/
     *         Using a separate data set for the navigator
     * @sample {highstock} stock/navigator/series/
     *         A green navigator series
     *
     * @type {*|Array<*>|Highcharts.SeriesOptionsType|Array<Highcharts.SeriesOptionsType>}
     */
    series: {
        /**
         * The type of the navigator series.
         *
         * Heads up:
         * In column-type navigator, zooming is limited to at least one
         * point with its `pointRange`.
         *
         * @sample {highstock} stock/navigator/column/
         *         Column type navigator
         *
         * @type    {string}
         * @default {highstock} `areaspline` if defined, otherwise `line`
         * @default {gantt} gantt
         */
        type: (typeof seriesTypes.areaspline === 'undefined' ?
            'line' :
            'areaspline'),
        /**
         * The fill opacity of the navigator series.
         */
        fillOpacity: 0.05,
        /**
         * The pixel line width of the navigator series.
         */
        lineWidth: 1,
        /**
         * @ignore-option
         */
        compare: null,
        /**
         * @ignore-option
         */
        sonification: {
            enabled: false
        },
        /**
         * Unless data is explicitly defined, the data is borrowed from the
         * first series in the chart.
         *
         * @type      {Array<number|Array<number|string|null>|object|null>}
         * @product   highstock
         * @apioption navigator.series.data
         */
        /**
         * Data grouping options for the navigator series.
         *
         * @extends plotOptions.series.dataGrouping
         */
        dataGrouping: {
            approximation: 'average',
            enabled: true,
            groupPixelWidth: 2,
            // Replace smoothed property by anchors, #12455.
            firstAnchor: 'firstPoint',
            anchor: 'middle',
            lastAnchor: 'lastPoint',
            // Day and week differs from plotOptions.series.dataGrouping
            units: [
                ['millisecond', [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]],
                ['second', [1, 2, 5, 10, 15, 30]],
                ['minute', [1, 2, 5, 10, 15, 30]],
                ['hour', [1, 2, 3, 4, 6, 8, 12]],
                ['day', [1, 2, 3, 4]],
                ['week', [1, 2, 3]],
                ['month', [1, 3, 6]],
                ['year', null]
            ]
        },
        /**
         * Data label options for the navigator series. Data labels are
         * disabled by default on the navigator series.
         *
         * @extends plotOptions.series.dataLabels
         */
        dataLabels: {
            enabled: false,
            zIndex: 2 // #1839
        },
        id: 'highcharts-navigator-series',
        className: 'highcharts-navigator-series',
        /**
         * Sets the fill color of the navigator series.
         *
         * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
         * @apioption navigator.series.color
         */
        /**
         * Line color for the navigator series. Allows setting the color
         * while disallowing the default candlestick setting.
         *
         * @type {Highcharts.ColorString|null}
         */
        lineColor: null, // #4602
        marker: {
            enabled: false
        },
        /**
         * Since Highcharts Stock v8, default value is the same as default
         * `pointRange` defined for a specific type (e.g. `null` for
         * column type).
         *
         * In Highcharts Stock version < 8, defaults to 0.
         *
         * @extends plotOptions.series.pointRange
         * @type {number|null}
         * @apioption navigator.series.pointRange
         */
        /**
         * The threshold option. Setting it to 0 will make the default
         * navigator area series draw its area from the 0 value and up.
         *
         * @type {number|null}
         */
        threshold: null
    },
    /**
     * Enable or disable navigator sticking to right, while adding new
     * points. If `undefined`, the navigator sticks to the axis maximum only
     * if it was already at the maximum prior to adding points.
     *
     * @type      {boolean}
     * @default   undefined
     * @since 10.2.1
     * @sample {highstock} stock/navigator/sticktomax-false/
     * stickToMax set to false
     * @apioption navigator.stickToMax
     */
    /**
     * Options for the navigator X axis. Default series options for the
     * navigator xAxis are:
     * ```js
     * xAxis: {
     *     tickWidth: 0,
     *     lineWidth: 0,
     *     gridLineWidth: 1,
     *     tickPixelInterval: 200,
     *     labels: {
     *            align: 'left',
     *         style: {
     *             color: '#888'
     *         },
     *         x: 3,
     *         y: -4
     *     }
     * }
     * ```
     *
     * @extends   xAxis
     * @excluding linkedTo, maxZoom, minRange, opposite, range, scrollbar,
     *            showEmpty, maxRange
     */
    xAxis: {
        /**
         * Additional range on the right side of the xAxis. Works similar to
         * `xAxis.maxPadding`, but the value is set in terms of axis values,
         * percentage or pixels.
         *
         * If it's a number, it is interpreted as axis values, which in a
         * datetime axis equals milliseconds.
         *
         * If it's a percentage string, is interpreted as percentages of the
         * axis length. An overscroll of 50% will make a 100px axis 50px longer.
         *
         * If it's a pixel string, it is interpreted as a fixed pixel value, but
         * limited to 90% of the axis length.
         *
         * If it's undefined, the value is inherited from `xAxis.overscroll`.
         *
         * Can be set for both, main xAxis and navigator's xAxis.
         *
         * @type    {number | string | undefined}
         * @since   6.0.0
         * @apioption navigator.xAxis.overscroll
         */
        className: 'highcharts-navigator-xaxis',
        tickLength: 0,
        lineWidth: 0,
        gridLineColor: "#e6e6e6" /* Palette.neutralColor10 */,
        id: 'navigator-x-axis',
        gridLineWidth: 1,
        tickPixelInterval: 200,
        labels: {
            align: 'left',
            /**
             * @type {Highcharts.CSSObject}
             */
            style: {
                /** @ignore */
                color: "#000000" /* Palette.neutralColor100 */,
                /** @ignore */
                fontSize: '0.7em',
                /** @ignore */
                opacity: 0.6,
                /** @ignore */
                textOutline: '2px contrast'
            },
            x: 3,
            y: -4
        },
        crosshair: false
    },
    /**
     * Options for the navigator Y axis. Default series options for the
     * navigator yAxis are:
     * ```js
     * yAxis: {
     *     gridLineWidth: 0,
     *     startOnTick: false,
     *     endOnTick: false,
     *     minPadding: 0.1,
     *     maxPadding: 0.1,
     *     labels: {
     *         enabled: false
     *     },
     *     title: {
     *         text: null
     *     },
     *     tickWidth: 0
     * }
     * ```
     *
     * @extends   yAxis
     * @excluding height, linkedTo, maxZoom, minRange, ordinal, range,
     *            showEmpty, scrollbar, top, units, maxRange, minLength,
     *            maxLength, resize
     */
    yAxis: {
        className: 'highcharts-navigator-yaxis',
        gridLineWidth: 0,
        startOnTick: false,
        endOnTick: false,
        minPadding: 0.1,
        id: 'navigator-y-axis',
        maxPadding: 0.1,
        labels: {
            enabled: false
        },
        crosshair: false,
        title: {
            text: void 0
        },
        tickLength: 0,
        tickWidth: 0
    }
};
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Navigator_NavigatorDefaults = (NavigatorDefaults);
/* *
 *
 *  API Options
 *
 * */
/**
 * Maximum range which can be set using the navigator's handles.
 * Opposite of [xAxis.minRange](#xAxis.minRange).
 *
 * @sample {highstock} stock/navigator/maxrange/
 *         Defined max and min range
 *
 * @type      {number}
 * @since     6.0.0
 * @product   highstock gantt
 * @apioption xAxis.maxRange
 */
(''); // Keeps doclets above in JS file

;// ./code/es-modules/Core/Renderer/SVG/Symbols.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { defined: Symbols_defined, isNumber: Symbols_isNumber, pick: Symbols_pick } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Functions
 *
 * */
/* eslint-disable require-jsdoc, valid-jsdoc */
/**
 *
 */
function arc(cx, cy, w, h, options) {
    const arc = [];
    if (options) {
        let start = options.start || 0, end = options.end || 0;
        const rx = Symbols_pick(options.r, w), ry = Symbols_pick(options.r, h || w), 
        // Subtract a small number to prevent cos and sin of start and end
        // from becoming equal on 360 arcs (#1561). The size of the circle
        // affects the constant, therefore the division by `rx`. If the
        // proximity is too small, the arc disappears. If it is too great, a
        // gap appears. This can be seen in the animation of the official
        // bubble demo (#20585).
        proximity = 0.0002 / (options.borderRadius ? 1 : Math.max(rx, 1)), fullCircle = (Math.abs(end - start - 2 * Math.PI) <
            proximity);
        if (fullCircle) {
            start = Math.PI / 2;
            end = Math.PI * 2.5 - proximity;
        }
        const innerRadius = options.innerR, open = Symbols_pick(options.open, fullCircle), cosStart = Math.cos(start), sinStart = Math.sin(start), cosEnd = Math.cos(end), sinEnd = Math.sin(end), 
        // Proximity takes care of rounding errors around PI (#6971)
        longArc = Symbols_pick(options.longArc, end - start - Math.PI < proximity ? 0 : 1);
        let arcSegment = [
            'A', // ArcTo
            rx, // X radius
            ry, // Y radius
            0, // Slanting
            longArc, // Long or short arc
            Symbols_pick(options.clockwise, 1), // Clockwise
            cx + rx * cosEnd,
            cy + ry * sinEnd
        ];
        arcSegment.params = { start, end, cx, cy }; // Memo for border radius
        arc.push([
            'M',
            cx + rx * cosStart,
            cy + ry * sinStart
        ], arcSegment);
        if (Symbols_defined(innerRadius)) {
            arcSegment = [
                'A', // ArcTo
                innerRadius, // X radius
                innerRadius, // Y radius
                0, // Slanting
                longArc, // Long or short arc
                // Clockwise - opposite to the outer arc clockwise
                Symbols_defined(options.clockwise) ? 1 - options.clockwise : 0,
                cx + innerRadius * cosStart,
                cy + innerRadius * sinStart
            ];
            // Memo for border radius
            arcSegment.params = {
                start: end,
                end: start,
                cx,
                cy
            };
            arc.push(open ?
                [
                    'M',
                    cx + innerRadius * cosEnd,
                    cy + innerRadius * sinEnd
                ] : [
                'L',
                cx + innerRadius * cosEnd,
                cy + innerRadius * sinEnd
            ], arcSegment);
        }
        if (!open) {
            arc.push(['Z']);
        }
    }
    return arc;
}
/**
 * Callout shape used for default tooltips.
 */
function callout(x, y, w, h, options) {
    const arrowLength = 6, halfDistance = 6, r = Math.min((options?.r) || 0, w, h), safeDistance = r + halfDistance, anchorX = options?.anchorX, anchorY = options?.anchorY || 0;
    const path = roundedRect(x, y, w, h, { r });
    if (!Symbols_isNumber(anchorX)) {
        return path;
    }
    // Do not render a connector, if anchor starts inside the label
    if (anchorX < w && anchorX > 0 && anchorY < h && anchorY > 0) {
        return path;
    }
    // Anchor on right side
    if (x + anchorX > w - safeDistance) {
        // Chevron
        if (anchorY > y + safeDistance &&
            anchorY < y + h - safeDistance) {
            path.splice(3, 1, ['L', x + w, anchorY - halfDistance], ['L', x + w + arrowLength, anchorY], ['L', x + w, anchorY + halfDistance], ['L', x + w, y + h - r]);
            // Simple connector
        }
        else {
            if (anchorX < w) { // Corner connector
                const isTopCorner = anchorY < y + safeDistance, cornerY = isTopCorner ? y : y + h, sliceStart = isTopCorner ? 2 : 5;
                path.splice(sliceStart, 0, ['L', anchorX, anchorY], ['L', x + w - r, cornerY]);
            }
            else { // Side connector
                path.splice(3, 1, ['L', x + w, h / 2], ['L', anchorX, anchorY], ['L', x + w, h / 2], ['L', x + w, y + h - r]);
            }
        }
        // Anchor on left side
    }
    else if (x + anchorX < safeDistance) {
        // Chevron
        if (anchorY > y + safeDistance &&
            anchorY < y + h - safeDistance) {
            path.splice(7, 1, ['L', x, anchorY + halfDistance], ['L', x - arrowLength, anchorY], ['L', x, anchorY - halfDistance], ['L', x, y + r]);
            // Simple connector
        }
        else {
            if (anchorX > 0) { // Corner connector
                const isTopCorner = anchorY < y + safeDistance, cornerY = isTopCorner ? y : y + h, sliceStart = isTopCorner ? 1 : 6;
                path.splice(sliceStart, 0, ['L', anchorX, anchorY], ['L', x + r, cornerY]);
            }
            else { // Side connector
                path.splice(7, 1, ['L', x, h / 2], ['L', anchorX, anchorY], ['L', x, h / 2], ['L', x, y + r]);
            }
        }
    }
    else if ( // Replace bottom
    anchorY > h &&
        anchorX < w - safeDistance) {
        path.splice(5, 1, ['L', anchorX + halfDistance, y + h], ['L', anchorX, y + h + arrowLength], ['L', anchorX - halfDistance, y + h], ['L', x + r, y + h]);
    }
    else if ( // Replace top
    anchorY < 0 &&
        anchorX > safeDistance) {
        path.splice(1, 1, ['L', anchorX - halfDistance, y], ['L', anchorX, y - arrowLength], ['L', anchorX + halfDistance, y], ['L', w - r, y]);
    }
    return path;
}
/**
 *
 */
function circle(x, y, w, h) {
    // Return a full arc
    return arc(x + w / 2, y + h / 2, w / 2, h / 2, {
        start: Math.PI * 0.5,
        end: Math.PI * 2.5,
        open: false
    });
}
/**
 *
 */
function diamond(x, y, w, h) {
    return [
        ['M', x + w / 2, y],
        ['L', x + w, y + h / 2],
        ['L', x + w / 2, y + h],
        ['L', x, y + h / 2],
        ['Z']
    ];
}
// #15291
/**
 *
 */
function rect(x, y, w, h, options) {
    if (options?.r) {
        return roundedRect(x, y, w, h, options);
    }
    return [
        ['M', x, y],
        ['L', x + w, y],
        ['L', x + w, y + h],
        ['L', x, y + h],
        ['Z']
    ];
}
/**
 *
 */
function roundedRect(x, y, w, h, options) {
    const r = options?.r || 0;
    return [
        ['M', x + r, y],
        ['L', x + w - r, y], // Top side
        ['A', r, r, 0, 0, 1, x + w, y + r], // Top-right corner
        ['L', x + w, y + h - r], // Right side
        ['A', r, r, 0, 0, 1, x + w - r, y + h], // Bottom-right corner
        ['L', x + r, y + h], // Bottom side
        ['A', r, r, 0, 0, 1, x, y + h - r], // Bottom-left corner
        ['L', x, y + r], // Left side
        ['A', r, r, 0, 0, 1, x + r, y],
        ['Z'] // Top-left corner
    ];
}
/**
 *
 */
function triangle(x, y, w, h) {
    return [
        ['M', x + w / 2, y],
        ['L', x + w, y + h],
        ['L', x, y + h],
        ['Z']
    ];
}
/**
 *
 */
function triangleDown(x, y, w, h) {
    return [
        ['M', x, y],
        ['L', x + w, y],
        ['L', x + w / 2, y + h],
        ['Z']
    ];
}
const Symbols = {
    arc,
    callout,
    circle,
    diamond,
    rect,
    roundedRect,
    square: rect,
    triangle,
    'triangle-down': triangleDown
};
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const SVG_Symbols = (Symbols);

;// ./code/es-modules/Stock/Navigator/NavigatorSymbols.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */



const { relativeLength } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Constants
 *
 * */
/**
 * Draw one of the handles on the side of the zoomed range in the navigator.
 * @private
 */
function navigatorHandle(_x, _y, width, height, options = {}) {
    const halfWidth = options.width ? options.width / 2 : width, markerPosition = 1.5, r = relativeLength(options.borderRadius || 0, Math.min(halfWidth * 2, height));
    height = options.height || height;
    return [
        ['M', -markerPosition, height / 2 - 3.5],
        ['L', -markerPosition, height / 2 + 4.5],
        ['M', markerPosition - 1, height / 2 - 3.5],
        ['L', markerPosition - 1, height / 2 + 4.5],
        ...SVG_Symbols.rect(-halfWidth - 1, 0.5, halfWidth * 2 + 1, height, { r })
    ];
}
/* *
 *
 *  Default Export
 *
 * */
const NavigatorSymbols = {
    'navigator-handle': navigatorHandle
};
/* harmony default export */ const Navigator_NavigatorSymbols = (NavigatorSymbols);

;// external ["../highcharts.src.js","default","RendererRegistry"]
const external_highcharts_src_js_default_RendererRegistry_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].RendererRegistry;
var external_highcharts_src_js_default_RendererRegistry_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_RendererRegistry_namespaceObject);
;// ./code/es-modules/Stock/Utilities/StockUtilities.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { defined: StockUtilities_defined } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Functions
 *
 * */
/**
 * Sets the chart.fixedRange to the specified value. If the value is larger
 * than actual range, sets it to the maximum possible range. (#20327)
 *
 * @private
 * @function Highcharts.StockChart#setFixedRange
 * @param {number|undefined} range
 *        Range to set in axis units.
 */
function setFixedRange(range) {
    const xAxis = this.xAxis[0];
    if (StockUtilities_defined(xAxis.dataMax) &&
        StockUtilities_defined(xAxis.dataMin) &&
        range) {
        this.fixedRange = Math.min(range, xAxis.dataMax - xAxis.dataMin);
    }
    else {
        this.fixedRange = range;
    }
}
const StockUtilities = {
    setFixedRange
};
/* harmony default export */ const Utilities_StockUtilities = (StockUtilities);

;// ./code/es-modules/Stock/Navigator/NavigatorComposition.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { defaultOptions: NavigatorComposition_defaultOptions } = (external_highcharts_src_js_default_default());

const { composed: NavigatorComposition_composed } = (external_highcharts_src_js_default_default());




const { getRendererType } = (external_highcharts_src_js_default_RendererRegistry_default());

const { setFixedRange: NavigatorComposition_setFixedRange } = Utilities_StockUtilities;

const { addEvent: NavigatorComposition_addEvent, extend, pushUnique: NavigatorComposition_pushUnique } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Variables
 *
 * */
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function NavigatorComposition_compose(ChartClass, AxisClass, SeriesClass) {
    NavigatorAxisComposition.compose(AxisClass);
    if (NavigatorComposition_pushUnique(NavigatorComposition_composed, 'Navigator')) {
        ChartClass.prototype.setFixedRange = NavigatorComposition_setFixedRange;
        extend(getRendererType().prototype.symbols, Navigator_NavigatorSymbols);
        extend(NavigatorComposition_defaultOptions, { navigator: Navigator_NavigatorDefaults });
        NavigatorComposition_addEvent(SeriesClass, 'afterUpdate', onSeriesAfterUpdate);
    }
}
/**
 * Handle updating series
 * @private
 */
function onSeriesAfterUpdate() {
    if (this.chart.navigator && !this.options.isInternal) {
        this.chart.navigator.setBaseSeries(null, false);
    }
}
/* *
 *
 *  Default Export
 *
 * */
const NavigatorComposition = {
    compose: NavigatorComposition_compose
};
/* harmony default export */ const Navigator_NavigatorComposition = (NavigatorComposition);

;// ./code/es-modules/Core/Axis/ScrollbarAxis.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { composed: ScrollbarAxis_composed } = (external_highcharts_src_js_default_default());

const { addEvent: ScrollbarAxis_addEvent, defined: ScrollbarAxis_defined, pick: ScrollbarAxis_pick, pushUnique: ScrollbarAxis_pushUnique } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Composition
 *
 * */
var ScrollbarAxis;
(function (ScrollbarAxis) {
    /* *
     *
     *  Variables
     *
     * */
    let Scrollbar;
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Attaches to axis events to create scrollbars if enabled.
     *
     * @private
     *
     * @param {Highcharts.Axis} AxisClass
     * Axis class to extend.
     *
     * @param {Highcharts.Scrollbar} ScrollbarClass
     * Scrollbar class to use.
     */
    function compose(AxisClass, ScrollbarClass) {
        if (ScrollbarAxis_pushUnique(ScrollbarAxis_composed, 'Axis.Scrollbar')) {
            Scrollbar = ScrollbarClass;
            ScrollbarAxis_addEvent(AxisClass, 'afterGetOffset', onAxisAfterGetOffset);
            ScrollbarAxis_addEvent(AxisClass, 'afterInit', onAxisAfterInit);
            ScrollbarAxis_addEvent(AxisClass, 'afterRender', onAxisAfterRender);
        }
    }
    ScrollbarAxis.compose = compose;
    /** @private */
    function getExtremes(axis) {
        const axisMin = ScrollbarAxis_pick(axis.options?.min, axis.min);
        const axisMax = ScrollbarAxis_pick(axis.options?.max, axis.max);
        return {
            axisMin,
            axisMax,
            scrollMin: ScrollbarAxis_defined(axis.dataMin) ?
                Math.min(axisMin, axis.min, axis.dataMin, ScrollbarAxis_pick(axis.threshold, Infinity)) : axisMin,
            scrollMax: ScrollbarAxis_defined(axis.dataMax) ?
                Math.max(axisMax, axis.max, axis.dataMax, ScrollbarAxis_pick(axis.threshold, -Infinity)) : axisMax
        };
    }
    /**
     * Make space for a scrollbar.
     * @private
     */
    function onAxisAfterGetOffset() {
        const axis = this, scrollbar = axis.scrollbar, opposite = scrollbar && !scrollbar.options.opposite, index = axis.horiz ? 2 : opposite ? 3 : 1;
        if (scrollbar) {
            // Reset scrollbars offsets
            axis.chart.scrollbarsOffsets = [0, 0];
            axis.chart.axisOffset[index] +=
                scrollbar.size + (scrollbar.options.margin || 0);
        }
    }
    /**
     * Wrap axis initialization and create scrollbar if enabled.
     * @private
     */
    function onAxisAfterInit() {
        const axis = this;
        if (axis.options?.scrollbar?.enabled) {
            // Predefined options:
            axis.options.scrollbar.vertical = !axis.horiz;
            axis.options.startOnTick = axis.options.endOnTick = false;
            axis.scrollbar = new Scrollbar(axis.chart.renderer, axis.options.scrollbar, axis.chart);
            ScrollbarAxis_addEvent(axis.scrollbar, 'changed', function (e) {
                const { axisMin, axisMax, scrollMin: unitedMin, scrollMax: unitedMax } = getExtremes(axis), range = unitedMax - unitedMin;
                let to, from;
                // #12834, scroll when show/hide series, wrong extremes
                if (!ScrollbarAxis_defined(axisMin) || !ScrollbarAxis_defined(axisMax)) {
                    return;
                }
                if ((axis.horiz && !axis.reversed) ||
                    (!axis.horiz && axis.reversed)) {
                    to = unitedMin + range * this.to;
                    from = unitedMin + range * this.from;
                }
                else {
                    // Y-values in browser are reversed, but this also
                    // applies for reversed horizontal axis:
                    to = unitedMin + range * (1 - this.from);
                    from = unitedMin + range * (1 - this.to);
                }
                if (this.shouldUpdateExtremes(e.DOMType)) {
                    // #17977, set animation to undefined instead of true
                    const animate = e.DOMType === 'mousemove' ||
                        e.DOMType === 'touchmove' ? false : void 0;
                    axis.setExtremes(from, to, true, animate, e);
                }
                else {
                    // When live redraw is disabled, don't change extremes
                    // Only change the position of the scrollbar thumb
                    this.setRange(this.from, this.to);
                }
            });
        }
    }
    /**
     * Wrap rendering axis, and update scrollbar if one is created.
     * @private
     */
    function onAxisAfterRender() {
        const axis = this, { scrollMin, scrollMax } = getExtremes(axis), scrollbar = axis.scrollbar, offset = (axis.axisTitleMargin + (axis.titleOffset || 0)), scrollbarsOffsets = axis.chart.scrollbarsOffsets, axisMargin = axis.options.margin || 0;
        let offsetsIndex, from, to;
        if (scrollbar && scrollbarsOffsets) {
            if (axis.horiz) {
                // Reserve space for labels/title
                if (!axis.opposite) {
                    scrollbarsOffsets[1] += offset;
                }
                scrollbar.position(axis.left, (axis.top +
                    axis.height +
                    2 +
                    scrollbarsOffsets[1] -
                    (axis.opposite ? axisMargin : 0)), axis.width, axis.height);
                // Next scrollbar should reserve space for margin (if set)
                if (!axis.opposite) {
                    scrollbarsOffsets[1] += axisMargin;
                }
                offsetsIndex = 1;
            }
            else {
                // Reserve space for labels/title
                if (axis.opposite) {
                    scrollbarsOffsets[0] += offset;
                }
                let xPosition;
                if (!scrollbar.options.opposite) {
                    xPosition = axis.opposite ? 0 : axisMargin;
                }
                else {
                    xPosition = axis.left +
                        axis.width +
                        2 +
                        scrollbarsOffsets[0] -
                        (axis.opposite ? 0 : axisMargin);
                }
                scrollbar.position(xPosition, axis.top, axis.width, axis.height);
                // Next scrollbar should reserve space for margin (if set)
                if (axis.opposite) {
                    scrollbarsOffsets[0] += axisMargin;
                }
                offsetsIndex = 0;
            }
            scrollbarsOffsets[offsetsIndex] += scrollbar.size +
                (scrollbar.options.margin || 0);
            if (isNaN(scrollMin) ||
                isNaN(scrollMax) ||
                !ScrollbarAxis_defined(axis.min) ||
                !ScrollbarAxis_defined(axis.max) ||
                axis.dataMin === axis.dataMax // #10733
            ) {
                // Default action: when data extremes are the same or there is
                // not extremes on the axis, but scrollbar exists, make it
                // full size
                scrollbar.setRange(0, 1);
            }
            else if (axis.min === axis.max) { // #20359
                // When the extremes are the same, set the scrollbar to a point
                // within the extremes range. Utilize pointRange to perform the
                // calculations. (#20359)
                const interval = axis.pointRange / (axis.dataMax +
                    1);
                from = interval * axis.min;
                to = interval * (axis.max + 1);
                scrollbar.setRange(from, to);
            }
            else {
                from = ((axis.min - scrollMin) /
                    (scrollMax - scrollMin));
                to = ((axis.max - scrollMin) /
                    (scrollMax - scrollMin));
                if ((axis.horiz && !axis.reversed) ||
                    (!axis.horiz && axis.reversed)) {
                    scrollbar.setRange(from, to);
                }
                else {
                    // Inverse vertical axis
                    scrollbar.setRange(1 - to, 1 - from);
                }
            }
        }
    }
})(ScrollbarAxis || (ScrollbarAxis = {}));
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Axis_ScrollbarAxis = (ScrollbarAxis);

;// ./code/es-modules/Stock/Scrollbar/ScrollbarDefaults.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

/* *
 *
 *  Constant
 *
 * */
/**
 *
 * The scrollbar is a means of panning over the X axis of a stock chart.
 * Scrollbars can also be applied to other types of axes.
 *
 * Another approach to scrollable charts is the [chart.scrollablePlotArea](
 * https://api.highcharts.com/highcharts/chart.scrollablePlotArea) option that
 * is especially suitable for simpler cartesian charts on mobile.
 *
 * In styled mode, all the presentational options for the
 * scrollbar are replaced by the classes `.highcharts-scrollbar-thumb`,
 * `.highcharts-scrollbar-arrow`, `.highcharts-scrollbar-button`,
 * `.highcharts-scrollbar-rifles` and `.highcharts-scrollbar-track`.
 *
 * @sample stock/yaxis/inverted-bar-scrollbar/
 *         A scrollbar on a simple bar chart
 *
 * @product highstock gantt
 * @optionparent scrollbar
 *
 * @private
 */
const ScrollbarDefaults = {
    /**
     * The height of the scrollbar. If `buttonsEnabled` is true , the height
     * also applies to the width of the scroll arrows so that they are always
     * squares.
     *
     * @sample stock/scrollbar/style/
     *         Non-default height
     *
     * @type    {number}
     */
    height: 10,
    /**
     * The border rounding radius of the bar.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     */
    barBorderRadius: 5,
    /**
     * The corner radius of the scrollbar buttons.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     */
    buttonBorderRadius: 0,
    /**
     * Enable or disable the buttons at the end of the scrollbar.
     *
     * @since 11.0.0
     */
    buttonsEnabled: false,
    /**
     * Enable or disable the scrollbar.
     *
     * @sample stock/scrollbar/enabled/
     *         Disable the scrollbar, only use navigator
     *
     * @type      {boolean}
     * @default   true
     * @apioption scrollbar.enabled
     */
    /**
     * Whether to redraw the main chart as the scrollbar or the navigator
     * zoomed window is moved. Defaults to `true` for modern browsers and
     * `false` for legacy IE browsers as well as mobile devices.
     *
     * @sample stock/scrollbar/liveredraw
     *         Setting live redraw to false
     *
     * @type  {boolean}
     * @since 1.3
     */
    liveRedraw: void 0,
    /**
     * The margin between the scrollbar and its axis when the scrollbar is
     * applied directly to an axis, or the navigator in case that is enabled.
     * Defaults to 10 for axis, 3 for navigator.
     *
     * @type {number|undefined}
     */
    margin: void 0,
    /**
     * The minimum width of the scrollbar.
     *
     * @since 1.2.5
     */
    minWidth: 6,
    /** @ignore-option */
    opposite: true,
    /**
     * Whether to show or hide the scrollbar when the scrolled content is
     * zoomed out to it full extent.
     *
     * @type      {boolean}
     * @default   true
     * @apioption scrollbar.showFull
     */
    step: 0.2,
    /**
     * The z index of the scrollbar group.
     */
    zIndex: 3,
    /**
     * The background color of the scrollbar itself.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     *
     * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     */
    barBackgroundColor: "#cccccc" /* Palette.neutralColor20 */,
    /**
     * The width of the bar's border.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     */
    barBorderWidth: 0,
    /**
     * The color of the scrollbar's border.
     *
     * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     */
    barBorderColor: "#cccccc" /* Palette.neutralColor20 */,
    /**
     * The color of the small arrow inside the scrollbar buttons.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     *
     * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     */
    buttonArrowColor: "#333333" /* Palette.neutralColor80 */,
    /**
     * The color of scrollbar buttons.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     *
     * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     */
    buttonBackgroundColor: "#e6e6e6" /* Palette.neutralColor10 */,
    /**
     * The color of the border of the scrollbar buttons.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     *
     * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     */
    buttonBorderColor: "#cccccc" /* Palette.neutralColor20 */,
    /**
     * The border width of the scrollbar buttons.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     */
    buttonBorderWidth: 1,
    /**
     * The color of the small rifles in the middle of the scrollbar.
     *
     * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     */
    rifleColor: 'none',
    /**
     * The color of the track background.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     *
     * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     */
    trackBackgroundColor: 'rgba(255, 255, 255, 0.001)', // #18922
    /**
     * The color of the border of the scrollbar track.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     *
     * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     */
    trackBorderColor: "#cccccc" /* Palette.neutralColor20 */,
    /**
     * The corner radius of the border of the scrollbar track.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     */
    trackBorderRadius: 5,
    /**
     * The width of the border of the scrollbar track.
     *
     * @sample stock/scrollbar/style/
     *         Scrollbar styling
     */
    trackBorderWidth: 1
};
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Scrollbar_ScrollbarDefaults = (ScrollbarDefaults);

;// ./code/es-modules/Stock/Scrollbar/Scrollbar.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { defaultOptions: Scrollbar_defaultOptions } = (external_highcharts_src_js_default_default());

const { composed: Scrollbar_composed } = (external_highcharts_src_js_default_default());



const { addEvent: Scrollbar_addEvent, correctFloat: Scrollbar_correctFloat, crisp, defined: Scrollbar_defined, destroyObjectProperties, extend: Scrollbar_extend, fireEvent, merge: Scrollbar_merge, pick: Scrollbar_pick, pushUnique: Scrollbar_pushUnique, removeEvent } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Constants
 *
 * */
/* eslint-disable no-invalid-this, valid-jsdoc */
/**
 * A reusable scrollbar, internally used in Highcharts Stock's
 * navigator and optionally on individual axes.
 *
 * @private
 * @class
 * @name Highcharts.Scrollbar
 * @param {Highcharts.SVGRenderer} renderer
 * @param {Highcharts.ScrollbarOptions} options
 * @param {Highcharts.Chart} chart
 */
class Scrollbar {
    /* *
     *
     *  Static Functions
     *
     * */
    static compose(AxisClass) {
        Axis_ScrollbarAxis.compose(AxisClass, Scrollbar);
        if (Scrollbar_pushUnique(Scrollbar_composed, 'Scrollbar')) {
            Scrollbar_extend(Scrollbar_defaultOptions, { scrollbar: Scrollbar_ScrollbarDefaults });
        }
    }
    /**
     * When we have vertical scrollbar, rifles and arrow in buttons should be
     * rotated. The same method is used in Navigator's handles, to rotate them.
     *
     * @function Highcharts.swapXY
     *
     * @param {Highcharts.SVGPathArray} path
     * Path to be rotated.
     *
     * @param {boolean} [vertical]
     * If vertical scrollbar, swap x-y values.
     *
     * @return {Highcharts.SVGPathArray}
     * Rotated path.
     *
     * @requires modules/stock
     */
    static swapXY(path, vertical) {
        if (vertical) {
            path.forEach((seg) => {
                const len = seg.length;
                let temp;
                for (let i = 0; i < len; i += 2) {
                    temp = seg[i + 1];
                    if (typeof temp === 'number') {
                        seg[i + 1] = seg[i + 2];
                        seg[i + 2] = temp;
                    }
                }
            });
        }
        return path;
    }
    /* *
     *
     *  Constructors
     *
     * */
    constructor(renderer, options, chart) {
        /* *
         *
         *  Properties
         *
         * */
        this._events = [];
        this.chartX = 0;
        this.chartY = 0;
        this.from = 0;
        this.scrollbarButtons = [];
        this.scrollbarLeft = 0;
        this.scrollbarStrokeWidth = 1;
        this.scrollbarTop = 0;
        this.size = 0;
        this.to = 0;
        this.trackBorderWidth = 1;
        this.x = 0;
        this.y = 0;
        this.init(renderer, options, chart);
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Set up the mouse and touch events for the Scrollbar
     *
     * @private
     * @function Highcharts.Scrollbar#addEvents
     */
    addEvents() {
        const buttonsOrder = this.options.inverted ? [1, 0] : [0, 1], buttons = this.scrollbarButtons, bar = this.scrollbarGroup.element, track = this.track.element, mouseDownHandler = this.mouseDownHandler.bind(this), mouseMoveHandler = this.mouseMoveHandler.bind(this), mouseUpHandler = this.mouseUpHandler.bind(this);
        const _events = [
            // Mouse events
            [
                buttons[buttonsOrder[0]].element,
                'click',
                this.buttonToMinClick.bind(this)
            ],
            [
                buttons[buttonsOrder[1]].element,
                'click',
                this.buttonToMaxClick.bind(this)
            ],
            [track, 'click', this.trackClick.bind(this)],
            [bar, 'mousedown', mouseDownHandler],
            [bar.ownerDocument, 'mousemove', mouseMoveHandler],
            [bar.ownerDocument, 'mouseup', mouseUpHandler],
            // Touch events
            [bar, 'touchstart', mouseDownHandler],
            [bar.ownerDocument, 'touchmove', mouseMoveHandler],
            [bar.ownerDocument, 'touchend', mouseUpHandler]
        ];
        // Add them all
        _events.forEach(function (args) {
            Scrollbar_addEvent.apply(null, args);
        });
        this._events = _events;
    }
    buttonToMaxClick(e) {
        const scroller = this;
        const range = ((scroller.to - scroller.from) *
            Scrollbar_pick(scroller.options.step, 0.2));
        scroller.updatePosition(scroller.from + range, scroller.to + range);
        fireEvent(scroller, 'changed', {
            from: scroller.from,
            to: scroller.to,
            trigger: 'scrollbar',
            DOMEvent: e
        });
    }
    buttonToMinClick(e) {
        const scroller = this;
        const range = Scrollbar_correctFloat(scroller.to - scroller.from) *
            Scrollbar_pick(scroller.options.step, 0.2);
        scroller.updatePosition(Scrollbar_correctFloat(scroller.from - range), Scrollbar_correctFloat(scroller.to - range));
        fireEvent(scroller, 'changed', {
            from: scroller.from,
            to: scroller.to,
            trigger: 'scrollbar',
            DOMEvent: e
        });
    }
    /**
     * Get normalized (0-1) cursor position over the scrollbar
     *
     * @private
     * @function Highcharts.Scrollbar#cursorToScrollbarPosition
     *
     * @param  {*} normalizedEvent
     *         normalized event, with chartX and chartY values
     *
     * @return {Highcharts.Dictionary<number>}
     *         Local position {chartX, chartY}
     */
    cursorToScrollbarPosition(normalizedEvent) {
        const scroller = this, options = scroller.options, minWidthDifference = options.minWidth > scroller.calculatedWidth ?
            options.minWidth :
            0; // `minWidth` distorts translation
        return {
            chartX: (normalizedEvent.chartX - scroller.x -
                scroller.xOffset) /
                (scroller.barWidth - minWidthDifference),
            chartY: (normalizedEvent.chartY - scroller.y -
                scroller.yOffset) /
                (scroller.barWidth - minWidthDifference)
        };
    }
    /**
     * Destroys allocated elements.
     *
     * @private
     * @function Highcharts.Scrollbar#destroy
     */
    destroy() {
        const scroller = this, navigator = scroller.chart.scroller;
        // Disconnect events added in addEvents
        scroller.removeEvents();
        // Destroy properties
        [
            'track',
            'scrollbarRifles',
            'scrollbar',
            'scrollbarGroup',
            'group'
        ].forEach(function (prop) {
            if (scroller[prop] && scroller[prop].destroy) {
                scroller[prop] = scroller[prop].destroy();
            }
        });
        // #6421, chart may have more scrollbars
        if (navigator && scroller === navigator.scrollbar) {
            navigator.scrollbar = null;
            // Destroy elements in collection
            destroyObjectProperties(navigator.scrollbarButtons);
        }
    }
    /**
     * Draw the scrollbar buttons with arrows
     *
     * @private
     * @function Highcharts.Scrollbar#drawScrollbarButton
     * @param {number} index
     *        0 is left, 1 is right
     */
    drawScrollbarButton(index) {
        const scroller = this, renderer = scroller.renderer, scrollbarButtons = scroller.scrollbarButtons, options = scroller.options, size = scroller.size, group = renderer.g().add(scroller.group);
        scrollbarButtons.push(group);
        if (options.buttonsEnabled) {
            // Create a rectangle for the scrollbar button
            const rect = renderer.rect()
                .addClass('highcharts-scrollbar-button')
                .add(group);
            // Presentational attributes
            if (!scroller.chart.styledMode) {
                rect.attr({
                    stroke: options.buttonBorderColor,
                    'stroke-width': options.buttonBorderWidth,
                    fill: options.buttonBackgroundColor
                });
            }
            // Place the rectangle based on the rendered stroke width
            rect.attr(rect.crisp({
                x: -0.5,
                y: -0.5,
                width: size,
                height: size,
                r: options.buttonBorderRadius
            }, rect.strokeWidth()));
            // Button arrow
            const arrow = renderer
                .path(Scrollbar.swapXY([[
                    'M',
                    size / 2 + (index ? -1 : 1),
                    size / 2 - 3
                ], [
                    'L',
                    size / 2 + (index ? -1 : 1),
                    size / 2 + 3
                ], [
                    'L',
                    size / 2 + (index ? 2 : -2),
                    size / 2
                ]], options.vertical))
                .addClass('highcharts-scrollbar-arrow')
                .add(scrollbarButtons[index]);
            if (!scroller.chart.styledMode) {
                arrow.attr({
                    fill: options.buttonArrowColor
                });
            }
        }
    }
    /**
     * @private
     * @function Highcharts.Scrollbar#init
     * @param {Highcharts.SVGRenderer} renderer
     * @param {Highcharts.ScrollbarOptions} options
     * @param {Highcharts.Chart} chart
     */
    init(renderer, options, chart) {
        const scroller = this;
        scroller.scrollbarButtons = [];
        scroller.renderer = renderer;
        scroller.userOptions = options;
        scroller.options = Scrollbar_merge(Scrollbar_ScrollbarDefaults, Scrollbar_defaultOptions.scrollbar, options);
        scroller.options.margin = Scrollbar_pick(scroller.options.margin, 10);
        scroller.chart = chart;
        // Backward compatibility
        scroller.size = Scrollbar_pick(scroller.options.size, scroller.options.height);
        // Init
        if (options.enabled) {
            scroller.render();
            scroller.addEvents();
        }
    }
    mouseDownHandler(e) {
        const scroller = this, normalizedEvent = scroller.chart.pointer?.normalize(e) || e, mousePosition = scroller.cursorToScrollbarPosition(normalizedEvent);
        scroller.chartX = mousePosition.chartX;
        scroller.chartY = mousePosition.chartY;
        scroller.initPositions = [scroller.from, scroller.to];
        scroller.grabbedCenter = true;
    }
    /**
     * Event handler for the mouse move event.
     * @private
     */
    mouseMoveHandler(e) {
        const scroller = this, normalizedEvent = scroller.chart.pointer?.normalize(e) || e, options = scroller.options, direction = options.vertical ?
            'chartY' : 'chartX', initPositions = scroller.initPositions || [];
        let scrollPosition, chartPosition, change;
        // In iOS, a mousemove event with e.pageX === 0 is fired when
        // holding the finger down in the center of the scrollbar. This
        // should be ignored.
        if (scroller.grabbedCenter &&
            // #4696, scrollbar failed on Android
            (!e.touches || e.touches[0][direction] !== 0)) {
            chartPosition = scroller.cursorToScrollbarPosition(normalizedEvent)[direction];
            scrollPosition = scroller[direction];
            change = chartPosition - scrollPosition;
            scroller.hasDragged = true;
            scroller.updatePosition(initPositions[0] + change, initPositions[1] + change);
            if (scroller.hasDragged) {
                fireEvent(scroller, 'changed', {
                    from: scroller.from,
                    to: scroller.to,
                    trigger: 'scrollbar',
                    DOMType: e.type,
                    DOMEvent: e
                });
            }
        }
    }
    /**
     * Event handler for the mouse up event.
     * @private
     */
    mouseUpHandler(e) {
        const scroller = this;
        if (scroller.hasDragged) {
            fireEvent(scroller, 'changed', {
                from: scroller.from,
                to: scroller.to,
                trigger: 'scrollbar',
                DOMType: e.type,
                DOMEvent: e
            });
        }
        scroller.grabbedCenter =
            scroller.hasDragged =
                scroller.chartX =
                    scroller.chartY = null;
    }
    /**
     * Position the scrollbar, method called from a parent with defined
     * dimensions.
     *
     * @private
     * @function Highcharts.Scrollbar#position
     * @param {number} x
     *        x-position on the chart
     * @param {number} y
     *        y-position on the chart
     * @param {number} width
     *        width of the scrollbar
     * @param {number} height
     *        height of the scrollbar
     */
    position(x, y, width, height) {
        const scroller = this, options = scroller.options, { buttonsEnabled, margin = 0, vertical } = options, method = scroller.rendered ? 'animate' : 'attr';
        let xOffset = height, yOffset = 0;
        // Make the scrollbar visible when it is repositioned, #15763.
        scroller.group.show();
        scroller.x = x;
        scroller.y = y + this.trackBorderWidth;
        scroller.width = width; // Width with buttons
        scroller.height = height;
        scroller.xOffset = xOffset;
        scroller.yOffset = yOffset;
        // If Scrollbar is a vertical type, swap options:
        if (vertical) {
            scroller.width = scroller.yOffset = width = yOffset = scroller.size;
            scroller.xOffset = xOffset = 0;
            scroller.yOffset = yOffset = buttonsEnabled ? scroller.size : 0;
            // Width without buttons
            scroller.barWidth = height - (buttonsEnabled ? width * 2 : 0);
            scroller.x = x = x + margin;
        }
        else {
            scroller.height = height = scroller.size;
            scroller.xOffset = xOffset = buttonsEnabled ? scroller.size : 0;
            // Width without buttons
            scroller.barWidth = width - (buttonsEnabled ? height * 2 : 0);
            scroller.y = scroller.y + margin;
        }
        // Set general position for a group:
        scroller.group[method]({
            translateX: x,
            translateY: scroller.y
        });
        // Resize background/track:
        scroller.track[method]({
            width: width,
            height: height
        });
        // Move right/bottom button to its place:
        scroller.scrollbarButtons[1][method]({
            translateX: vertical ? 0 : width - xOffset,
            translateY: vertical ? height - yOffset : 0
        });
    }
    /**
     * Removes the event handlers attached previously with addEvents.
     *
     * @private
     * @function Highcharts.Scrollbar#removeEvents
     */
    removeEvents() {
        this._events.forEach(function (args) {
            removeEvent.apply(null, args);
        });
        this._events.length = 0;
    }
    /**
     * Render scrollbar with all required items.
     *
     * @private
     * @function Highcharts.Scrollbar#render
     */
    render() {
        const scroller = this, renderer = scroller.renderer, options = scroller.options, size = scroller.size, styledMode = scroller.chart.styledMode, group = renderer.g('scrollbar')
            .attr({
            zIndex: options.zIndex
        })
            .hide() // Initially hide the scrollbar #15863
            .add();
        // Draw the scrollbar group
        scroller.group = group;
        // Draw the scrollbar track:
        scroller.track = renderer.rect()
            .addClass('highcharts-scrollbar-track')
            .attr({
            r: options.trackBorderRadius || 0,
            height: size,
            width: size
        }).add(group);
        if (!styledMode) {
            scroller.track.attr({
                fill: options.trackBackgroundColor,
                stroke: options.trackBorderColor,
                'stroke-width': options.trackBorderWidth
            });
        }
        const trackBorderWidth = scroller.trackBorderWidth =
            scroller.track.strokeWidth();
        scroller.track.attr({
            x: -crisp(0, trackBorderWidth),
            y: -crisp(0, trackBorderWidth)
        });
        // Draw the scrollbar itself
        scroller.scrollbarGroup = renderer.g().add(group);
        scroller.scrollbar = renderer.rect()
            .addClass('highcharts-scrollbar-thumb')
            .attr({
            height: size - trackBorderWidth,
            width: size - trackBorderWidth,
            r: options.barBorderRadius || 0
        }).add(scroller.scrollbarGroup);
        scroller.scrollbarRifles = renderer
            .path(Scrollbar.swapXY([
            ['M', -3, size / 4],
            ['L', -3, 2 * size / 3],
            ['M', 0, size / 4],
            ['L', 0, 2 * size / 3],
            ['M', 3, size / 4],
            ['L', 3, 2 * size / 3]
        ], options.vertical))
            .addClass('highcharts-scrollbar-rifles')
            .add(scroller.scrollbarGroup);
        if (!styledMode) {
            scroller.scrollbar.attr({
                fill: options.barBackgroundColor,
                stroke: options.barBorderColor,
                'stroke-width': options.barBorderWidth
            });
            scroller.scrollbarRifles.attr({
                stroke: options.rifleColor,
                'stroke-width': 1
            });
        }
        scroller.scrollbarStrokeWidth = scroller.scrollbar.strokeWidth();
        scroller.scrollbarGroup.translate(-crisp(0, scroller.scrollbarStrokeWidth), -crisp(0, scroller.scrollbarStrokeWidth));
        // Draw the buttons:
        scroller.drawScrollbarButton(0);
        scroller.drawScrollbarButton(1);
    }
    /**
     * Set scrollbar size, with a given scale.
     *
     * @private
     * @function Highcharts.Scrollbar#setRange
     * @param {number} from
     *        scale (0-1) where bar should start
     * @param {number} to
     *        scale (0-1) where bar should end
     */
    setRange(from, to) {
        const scroller = this, options = scroller.options, vertical = options.vertical, minWidth = options.minWidth, fullWidth = scroller.barWidth, method = (this.rendered &&
            !this.hasDragged &&
            !(this.chart.navigator && this.chart.navigator.hasDragged)) ? 'animate' : 'attr';
        if (!Scrollbar_defined(fullWidth)) {
            return;
        }
        const toPX = fullWidth * Math.min(to, 1);
        let fromPX, newSize;
        from = Math.max(from, 0);
        fromPX = Math.ceil(fullWidth * from);
        scroller.calculatedWidth = newSize = Scrollbar_correctFloat(toPX - fromPX);
        // We need to recalculate position, if minWidth is used
        if (newSize < minWidth) {
            fromPX = (fullWidth - minWidth + newSize) * from;
            newSize = minWidth;
        }
        const newPos = Math.floor(fromPX + scroller.xOffset + scroller.yOffset);
        const newRiflesPos = newSize / 2 - 0.5; // -0.5 -> rifle line width / 2
        // Store current position:
        scroller.from = from;
        scroller.to = to;
        if (!vertical) {
            scroller.scrollbarGroup[method]({
                translateX: newPos
            });
            scroller.scrollbar[method]({
                width: newSize
            });
            scroller.scrollbarRifles[method]({
                translateX: newRiflesPos
            });
            scroller.scrollbarLeft = newPos;
            scroller.scrollbarTop = 0;
        }
        else {
            scroller.scrollbarGroup[method]({
                translateY: newPos
            });
            scroller.scrollbar[method]({
                height: newSize
            });
            scroller.scrollbarRifles[method]({
                translateY: newRiflesPos
            });
            scroller.scrollbarTop = newPos;
            scroller.scrollbarLeft = 0;
        }
        if (newSize <= 12) {
            scroller.scrollbarRifles.hide();
        }
        else {
            scroller.scrollbarRifles.show();
        }
        // Show or hide the scrollbar based on the showFull setting
        if (options.showFull === false) {
            if (from <= 0 && to >= 1) {
                scroller.group.hide();
            }
            else {
                scroller.group.show();
            }
        }
        scroller.rendered = true;
    }
    /**
     * Checks if the extremes should be updated in response to a scrollbar
     * change event.
     *
     * @private
     * @function Highcharts.Scrollbar#shouldUpdateExtremes
     */
    shouldUpdateExtremes(eventType) {
        return (Scrollbar_pick(this.options.liveRedraw, (external_highcharts_src_js_default_default()).svg &&
            !(external_highcharts_src_js_default_default()).isTouchDevice &&
            !this.chart.boosted) ||
            // Mouseup always should change extremes
            eventType === 'mouseup' ||
            eventType === 'touchend' ||
            // Internal events
            !Scrollbar_defined(eventType));
    }
    trackClick(e) {
        const scroller = this;
        const normalizedEvent = scroller.chart.pointer?.normalize(e) || e, range = scroller.to - scroller.from, top = scroller.y + scroller.scrollbarTop, left = scroller.x + scroller.scrollbarLeft;
        if ((scroller.options.vertical && normalizedEvent.chartY > top) ||
            (!scroller.options.vertical && normalizedEvent.chartX > left)) {
            // On the top or on the left side of the track:
            scroller.updatePosition(scroller.from + range, scroller.to + range);
        }
        else {
            // On the bottom or the right side of the track:
            scroller.updatePosition(scroller.from - range, scroller.to - range);
        }
        fireEvent(scroller, 'changed', {
            from: scroller.from,
            to: scroller.to,
            trigger: 'scrollbar',
            DOMEvent: e
        });
    }
    /**
     * Update the scrollbar with new options
     *
     * @private
     * @function Highcharts.Scrollbar#update
     * @param  {Highcharts.ScrollbarOptions} options
     */
    update(options) {
        this.destroy();
        this.init(this.chart.renderer, Scrollbar_merge(true, this.options, options), this.chart);
    }
    /**
     * Update position option in the Scrollbar, with normalized 0-1 scale
     *
     * @private
     * @function Highcharts.Scrollbar#updatePosition
     * @param  {number} from
     * @param  {number} to
     */
    updatePosition(from, to) {
        if (to > 1) {
            from = Scrollbar_correctFloat(1 - Scrollbar_correctFloat(to - from));
            to = 1;
        }
        if (from < 0) {
            to = Scrollbar_correctFloat(to - from);
            from = 0;
        }
        this.from = from;
        this.to = to;
    }
}
/* *
 *
 *  Static Properties
 *
 * */
Scrollbar.defaultOptions = Scrollbar_ScrollbarDefaults;
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Scrollbar_Scrollbar = (Scrollbar);

;// external ["../highcharts.src.js","default","SVGRenderer"]
const external_highcharts_src_js_default_SVGRenderer_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].SVGRenderer;
var external_highcharts_src_js_default_SVGRenderer_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_SVGRenderer_namespaceObject);
;// ./code/es-modules/Stock/Navigator/Navigator.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */




const { defaultOptions: Navigator_defaultOptions } = (external_highcharts_src_js_default_default());

const { isTouchDevice: Navigator_isTouchDevice } = (external_highcharts_src_js_default_default());




const { prototype: { symbols } } = (external_highcharts_src_js_default_SVGRenderer_default());

const { addEvent: Navigator_addEvent, clamp, correctFloat: Navigator_correctFloat, defined: Navigator_defined, destroyObjectProperties: Navigator_destroyObjectProperties, erase, extend: Navigator_extend, find, fireEvent: Navigator_fireEvent, isArray: Navigator_isArray, isNumber: Navigator_isNumber, merge: Navigator_merge, pick: Navigator_pick, removeEvent: Navigator_removeEvent, splat: Navigator_splat } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Functions
 *
 * */
/**
 * Finding the min or max of a set of variables where we don't know if they are
 * defined, is a pattern that is repeated several places in Highcharts. Consider
 * making this a global utility method.
 * @private
 */
function numExt(extreme, ...args) {
    const numbers = [].filter.call(args, Navigator_isNumber);
    if (numbers.length) {
        return Math[extreme].apply(0, numbers);
    }
}
/* *
 *
 *  Class
 *
 * */
/**
 * The Navigator class
 *
 * @private
 * @class
 * @name Highcharts.Navigator
 *
 * @param {Highcharts.Chart} chart
 *        Chart object
 */
class Navigator {
    /* *
     *
     *  Static Properties
     *
     * */
    static compose(ChartClass, AxisClass, SeriesClass) {
        Navigator_ChartNavigatorComposition.compose(ChartClass, Navigator);
        Navigator_NavigatorComposition.compose(ChartClass, AxisClass, SeriesClass);
    }
    /* *
     *
     *  Constructor
     *
     * */
    constructor(chart) {
        this.isDirty = false;
        this.scrollbarHeight = 0;
        this.init(chart);
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Draw one of the handles on the side of the zoomed range in the navigator.
     *
     * @private
     * @function Highcharts.Navigator#drawHandle
     *
     * @param {number} x
     *        The x center for the handle
     *
     * @param {number} index
     *        0 for left and 1 for right
     *
     * @param {boolean|undefined} inverted
     *        Flag for chart.inverted
     *
     * @param {string} verb
     *        Use 'animate' or 'attr'
     */
    drawHandle(x, index, inverted, verb) {
        const navigator = this, height = navigator.navigatorOptions.handles.height;
        // Place it
        navigator.handles[index][verb](inverted ? {
            translateX: Math.round(navigator.left + navigator.height / 2),
            translateY: Math.round(navigator.top + parseInt(x, 10) + 0.5 - height)
        } : {
            translateX: Math.round(navigator.left + parseInt(x, 10)),
            translateY: Math.round(navigator.top + navigator.height / 2 - height / 2 - 1)
        });
    }
    /**
     * Render outline around the zoomed range
     *
     * @private
     * @function Highcharts.Navigator#drawOutline
     *
     * @param {number} zoomedMin
     *        in pixels position where zoomed range starts
     *
     * @param {number} zoomedMax
     *        in pixels position where zoomed range ends
     *
     * @param {boolean|undefined} inverted
     *        flag if chart is inverted
     *
     * @param {string} verb
     *        use 'animate' or 'attr'
     */
    drawOutline(zoomedMin, zoomedMax, inverted, verb) {
        const navigator = this, maskInside = navigator.navigatorOptions.maskInside, outlineWidth = navigator.outline.strokeWidth(), halfOutline = outlineWidth / 2, outlineCorrection = (outlineWidth % 2) / 2, // #5800
        scrollButtonSize = navigator.scrollButtonSize, navigatorSize = navigator.size, navigatorTop = navigator.top, height = navigator.height, lineTop = navigatorTop - halfOutline, lineBtm = navigatorTop + height;
        let left = navigator.left, verticalMin, path;
        if (inverted) {
            verticalMin = navigatorTop + zoomedMax + outlineCorrection;
            zoomedMax = navigatorTop + zoomedMin + outlineCorrection;
            path = [
                [
                    'M',
                    left + height,
                    navigatorTop - scrollButtonSize - outlineCorrection
                ],
                // Top right of zoomed range
                ['L', left + height, verticalMin],
                ['L', left, verticalMin], // Top left of z.r.
                ['M', left, zoomedMax], // Bottom left of z.r.
                ['L', left + height, zoomedMax], // Bottom right of z.r.
                [
                    'L',
                    left + height,
                    navigatorTop + navigatorSize + scrollButtonSize
                ]
            ];
            if (maskInside) {
                path.push(
                // Upper left of zoomed range
                ['M', left + height, verticalMin - halfOutline], 
                // Upper right of z.r.
                [
                    'L',
                    left + height,
                    zoomedMax + halfOutline
                ]);
            }
        }
        else {
            left -= scrollButtonSize;
            zoomedMin += left + scrollButtonSize - outlineCorrection;
            zoomedMax += left + scrollButtonSize - outlineCorrection;
            path = [
                // Left
                ['M', left, lineTop],
                // Upper left of zoomed range
                ['L', zoomedMin, lineTop],
                // Lower left of z.r.
                ['L', zoomedMin, lineBtm],
                // Lower right of z.r.
                ['M', zoomedMax, lineBtm],
                // Upper right of z.r.
                ['L', zoomedMax, lineTop],
                // Right
                [
                    'L',
                    left + navigatorSize + scrollButtonSize * 2,
                    lineTop
                ]
            ];
            if (maskInside) {
                path.push(
                // Upper left of zoomed range
                ['M', zoomedMin - halfOutline, lineTop], 
                // Upper right of z.r.
                ['L', zoomedMax + halfOutline, lineTop]);
            }
        }
        navigator.outline[verb]({
            d: path
        });
    }
    /**
     * Render outline around the zoomed range
     *
     * @private
     * @function Highcharts.Navigator#drawMasks
     *
     * @param {number} zoomedMin
     *        in pixels position where zoomed range starts
     *
     * @param {number} zoomedMax
     *        in pixels position where zoomed range ends
     *
     * @param {boolean|undefined} inverted
     *        flag if chart is inverted
     *
     * @param {string} verb
     *        use 'animate' or 'attr'
     */
    drawMasks(zoomedMin, zoomedMax, inverted, verb) {
        const navigator = this, left = navigator.left, top = navigator.top, navigatorHeight = navigator.height;
        let height, width, x, y;
        // Determine rectangle position & size
        // According to (non)inverted position:
        if (inverted) {
            x = [left, left, left];
            y = [top, top + zoomedMin, top + zoomedMax];
            width = [navigatorHeight, navigatorHeight, navigatorHeight];
            height = [
                zoomedMin,
                zoomedMax - zoomedMin,
                navigator.size - zoomedMax
            ];
        }
        else {
            x = [left, left + zoomedMin, left + zoomedMax];
            y = [top, top, top];
            width = [
                zoomedMin,
                zoomedMax - zoomedMin,
                navigator.size - zoomedMax
            ];
            height = [navigatorHeight, navigatorHeight, navigatorHeight];
        }
        navigator.shades.forEach((shade, i) => {
            shade[verb]({
                x: x[i],
                y: y[i],
                width: width[i],
                height: height[i]
            });
        });
    }
    /**
     * Generate and update DOM elements for a navigator:
     *
     * - main navigator group
     *
     * - all shades
     *
     * - outline
     *
     * - handles
     *
     * @private
     * @function Highcharts.Navigator#renderElements
     */
    renderElements() {
        const navigator = this, navigatorOptions = navigator.navigatorOptions, maskInside = navigatorOptions.maskInside, chart = navigator.chart, inverted = chart.inverted, renderer = chart.renderer, mouseCursor = {
            cursor: inverted ? 'ns-resize' : 'ew-resize'
        }, 
        // Create the main navigator group
        navigatorGroup = navigator.navigatorGroup ??
            (navigator.navigatorGroup = renderer
                .g('navigator')
                .attr({
                zIndex: 8,
                visibility: 'hidden'
            })
                .add());
        // Create masks, each mask will get events and fill:
        [
            !maskInside,
            maskInside,
            !maskInside
        ].forEach((hasMask, index) => {
            const shade = navigator.shades[index] ??
                (navigator.shades[index] = renderer.rect()
                    .addClass('highcharts-navigator-mask' +
                    (index === 1 ? '-inside' : '-outside'))
                    .add(navigatorGroup));
            if (!chart.styledMode) {
                shade.attr({
                    fill: hasMask ? navigatorOptions.maskFill : 'rgba(0,0,0,0)'
                });
                if (index === 1) {
                    shade.css(mouseCursor);
                }
            }
        });
        // Create the outline:
        if (!navigator.outline) {
            navigator.outline = renderer.path()
                .addClass('highcharts-navigator-outline')
                .add(navigatorGroup);
        }
        if (!chart.styledMode) {
            navigator.outline.attr({
                'stroke-width': navigatorOptions.outlineWidth,
                stroke: navigatorOptions.outlineColor
            });
        }
        // Create the handlers:
        if (navigatorOptions.handles?.enabled) {
            const handlesOptions = navigatorOptions.handles, { height, width } = handlesOptions;
            [0, 1].forEach((index) => {
                const symbolName = handlesOptions.symbols[index];
                if (!navigator.handles[index] ||
                    navigator.handles[index].symbolUrl !== symbolName) {
                    // Generate symbol from scratch if we're dealing with an URL
                    navigator.handles[index]?.destroy();
                    navigator.handles[index] = renderer.symbol(symbolName, -width / 2 - 1, 0, width, height, handlesOptions);
                    // Z index is 6 for right handle, 7 for left. Can't be 10,
                    // because of the tooltip in inverted chart (#2908).
                    navigator.handles[index].attr({ zIndex: 7 - index })
                        .addClass('highcharts-navigator-handle ' +
                        'highcharts-navigator-handle-' +
                        ['left', 'right'][index]).add(navigatorGroup);
                    navigator.addMouseEvents();
                    // If the navigator symbol changed, update its path and name
                }
                else if (!navigator.handles[index].isImg &&
                    navigator.handles[index].symbolName !== symbolName) {
                    const symbolFn = symbols[symbolName], path = symbolFn.call(symbols, -width / 2 - 1, 0, width, height);
                    navigator.handles[index].attr({
                        d: path
                    });
                    navigator.handles[index].symbolName = symbolName;
                }
                if (chart.inverted) {
                    navigator.handles[index].attr({
                        rotation: 90,
                        rotationOriginX: Math.floor(-width / 2),
                        rotationOriginY: (height + width) / 2
                    });
                }
                if (!chart.styledMode) {
                    navigator.handles[index]
                        .attr({
                        fill: handlesOptions.backgroundColor,
                        stroke: handlesOptions.borderColor,
                        'stroke-width': handlesOptions.lineWidth,
                        width: handlesOptions.width,
                        height: handlesOptions.height,
                        x: -width / 2 - 1,
                        y: 0
                    })
                        .css(mouseCursor);
                }
            });
        }
    }
    /**
     * Update navigator
     *
     * @private
     * @function Highcharts.Navigator#update
     *
     * @param {Highcharts.NavigatorOptions} options
     *        Options to merge in when updating navigator
     */
    update(options, redraw = false) {
        const chart = this.chart, invertedUpdate = chart.options.chart.inverted !==
            chart.scrollbar?.options.vertical;
        Navigator_merge(true, chart.options.navigator, options);
        this.navigatorOptions = chart.options.navigator || {};
        this.setOpposite();
        // Revert to destroy/init for navigator/scrollbar enabled toggle
        if (Navigator_defined(options.enabled) || invertedUpdate) {
            this.destroy();
            this.navigatorEnabled = options.enabled || this.navigatorEnabled;
            return this.init(chart);
        }
        if (this.navigatorEnabled) {
            this.isDirty = true;
            if (options.adaptToUpdatedData === false) {
                this.baseSeries.forEach((series) => {
                    Navigator_removeEvent(series, 'updatedData', this.updatedDataHandler);
                }, this);
            }
            if (options.adaptToUpdatedData) {
                this.baseSeries.forEach((series) => {
                    series.eventsToUnbind.push(Navigator_addEvent(series, 'updatedData', this.updatedDataHandler));
                }, this);
            }
            // Update navigator series
            if (options.series || options.baseSeries) {
                this.setBaseSeries(void 0, false);
            }
            // Update navigator axis
            if (options.height || options.xAxis || options.yAxis) {
                this.height = options.height ?? this.height;
                const offsets = this.getXAxisOffsets();
                this.xAxis.update({
                    ...options.xAxis,
                    offsets,
                    [chart.inverted ? 'width' : 'height']: this.height,
                    [chart.inverted ? 'height' : 'width']: void 0
                }, false);
                this.yAxis.update({
                    ...options.yAxis,
                    [chart.inverted ? 'width' : 'height']: this.height
                }, false);
            }
        }
        if (redraw) {
            chart.redraw();
        }
    }
    /**
     * Render the navigator
     *
     * @private
     * @function Highcharts.Navigator#render
     * @param {number} min
     *        X axis value minimum
     * @param {number} max
     *        X axis value maximum
     * @param {number} [pxMin]
     *        Pixel value minimum
     * @param {number} [pxMax]
     *        Pixel value maximum
     */
    render(min, max, pxMin, pxMax) {
        const navigator = this, chart = navigator.chart, xAxis = navigator.xAxis, pointRange = xAxis.pointRange || 0, scrollbarXAxis = xAxis.navigatorAxis.fake ? chart.xAxis[0] : xAxis, navigatorEnabled = navigator.navigatorEnabled, rendered = navigator.rendered, inverted = chart.inverted, minRange = chart.xAxis[0].minRange, maxRange = chart.xAxis[0].options.maxRange, scrollButtonSize = navigator.scrollButtonSize;
        let navigatorWidth, scrollbarLeft, scrollbarTop, scrollbarHeight = navigator.scrollbarHeight, navigatorSize, verb;
        // Don't redraw while moving the handles (#4703).
        if (this.hasDragged && !Navigator_defined(pxMin)) {
            return;
        }
        if (this.isDirty) {
            // Update DOM navigator elements
            this.renderElements();
        }
        min = Navigator_correctFloat(min - pointRange / 2);
        max = Navigator_correctFloat(max + pointRange / 2);
        // Don't render the navigator until we have data (#486, #4202, #5172).
        if (!Navigator_isNumber(min) || !Navigator_isNumber(max)) {
            // However, if navigator was already rendered, we may need to resize
            // it. For example hidden series, but visible navigator (#6022).
            if (rendered) {
                pxMin = 0;
                pxMax = Navigator_pick(xAxis.width, scrollbarXAxis.width);
            }
            else {
                return;
            }
        }
        navigator.left = Navigator_pick(xAxis.left, 
        // In case of scrollbar only, without navigator
        chart.plotLeft + scrollButtonSize +
            (inverted ? chart.plotWidth : 0));
        let zoomedMax = navigator.size = navigatorSize = Navigator_pick(xAxis.len, (inverted ? chart.plotHeight : chart.plotWidth) -
            2 * scrollButtonSize);
        if (inverted) {
            navigatorWidth = scrollbarHeight;
        }
        else {
            navigatorWidth = navigatorSize + 2 * scrollButtonSize;
        }
        // Get the pixel position of the handles
        pxMin = Navigator_pick(pxMin, xAxis.toPixels(min, true));
        pxMax = Navigator_pick(pxMax, xAxis.toPixels(max, true));
        // Verify (#1851, #2238)
        if (!Navigator_isNumber(pxMin) || Math.abs(pxMin) === Infinity) {
            pxMin = 0;
            pxMax = navigatorWidth;
        }
        // Are we below the minRange? (#2618, #6191)
        const newMin = xAxis.toValue(pxMin, true), newMax = xAxis.toValue(pxMax, true), currentRange = Math.abs(Navigator_correctFloat(newMax - newMin));
        if (currentRange < minRange) {
            if (this.grabbedLeft) {
                pxMin = xAxis.toPixels(newMax - minRange - pointRange, true);
            }
            else if (this.grabbedRight) {
                pxMax = xAxis.toPixels(newMin + minRange + pointRange, true);
            }
        }
        else if (Navigator_defined(maxRange) &&
            Navigator_correctFloat(currentRange - pointRange) > maxRange) {
            if (this.grabbedLeft) {
                pxMin = xAxis.toPixels(newMax - maxRange - pointRange, true);
            }
            else if (this.grabbedRight) {
                pxMax = xAxis.toPixels(newMin + maxRange + pointRange, true);
            }
        }
        // Handles are allowed to cross, but never exceed the plot area
        navigator.zoomedMax = clamp(Math.max(pxMin, pxMax), 0, zoomedMax);
        navigator.zoomedMin = clamp(navigator.fixedWidth ?
            navigator.zoomedMax - navigator.fixedWidth :
            Math.min(pxMin, pxMax), 0, zoomedMax);
        navigator.range = navigator.zoomedMax - navigator.zoomedMin;
        zoomedMax = Math.round(navigator.zoomedMax);
        const zoomedMin = Math.round(navigator.zoomedMin);
        if (navigatorEnabled) {
            navigator.navigatorGroup.attr({
                visibility: 'inherit'
            });
            // Place elements
            verb = rendered && !navigator.hasDragged ? 'animate' : 'attr';
            navigator.drawMasks(zoomedMin, zoomedMax, inverted, verb);
            navigator.drawOutline(zoomedMin, zoomedMax, inverted, verb);
            if (navigator.navigatorOptions.handles.enabled) {
                navigator.drawHandle(zoomedMin, 0, inverted, verb);
                navigator.drawHandle(zoomedMax, 1, inverted, verb);
            }
        }
        if (navigator.scrollbar) {
            if (inverted) {
                scrollbarTop = navigator.top - scrollButtonSize;
                scrollbarLeft = navigator.left - scrollbarHeight +
                    (navigatorEnabled || !scrollbarXAxis.opposite ? 0 :
                        // Multiple axes has offsets:
                        (scrollbarXAxis.titleOffset || 0) +
                            // Self margin from the axis.title
                            scrollbarXAxis.axisTitleMargin);
                scrollbarHeight = navigatorSize + 2 * scrollButtonSize;
            }
            else {
                scrollbarTop = navigator.top + (navigatorEnabled ?
                    navigator.height :
                    -scrollbarHeight);
                scrollbarLeft = navigator.left - scrollButtonSize;
            }
            // Reposition scrollbar
            navigator.scrollbar.position(scrollbarLeft, scrollbarTop, navigatorWidth, scrollbarHeight);
            // Keep scale 0-1
            navigator.scrollbar.setRange(
            // Use real value, not rounded because range can be very small
            // (#1716)
            navigator.zoomedMin / (navigatorSize || 1), navigator.zoomedMax / (navigatorSize || 1));
        }
        navigator.rendered = true;
        this.isDirty = false;
        Navigator_fireEvent(this, 'afterRender');
    }
    /**
     * Set up the mouse and touch events for the navigator
     *
     * @private
     * @function Highcharts.Navigator#addMouseEvents
     */
    addMouseEvents() {
        const navigator = this, chart = navigator.chart, container = chart.container;
        let eventsToUnbind = [], mouseMoveHandler, mouseUpHandler;
        /**
         * Create mouse events' handlers.
         * Make them as separate functions to enable wrapping them:
         */
        navigator.mouseMoveHandler = mouseMoveHandler = function (e) {
            navigator.onMouseMove(e);
        };
        navigator.mouseUpHandler = mouseUpHandler = function (e) {
            navigator.onMouseUp(e);
        };
        // Add shades and handles mousedown events
        eventsToUnbind = navigator.getPartsEvents('mousedown');
        eventsToUnbind.push(
        // Add mouse move and mouseup events. These are bind to doc/div,
        // because Navigator.grabbedSomething flags are stored in mousedown
        // events
        Navigator_addEvent(chart.renderTo, 'mousemove', mouseMoveHandler), Navigator_addEvent(container.ownerDocument, 'mouseup', mouseUpHandler), 
        // Touch events
        Navigator_addEvent(chart.renderTo, 'touchmove', mouseMoveHandler), Navigator_addEvent(container.ownerDocument, 'touchend', mouseUpHandler));
        eventsToUnbind.concat(navigator.getPartsEvents('touchstart'));
        navigator.eventsToUnbind = eventsToUnbind;
        // Data events
        if (navigator.series && navigator.series[0]) {
            eventsToUnbind.push(Navigator_addEvent(navigator.series[0].xAxis, 'foundExtremes', function () {
                chart.navigator.modifyNavigatorAxisExtremes();
            }));
        }
    }
    /**
     * Generate events for handles and masks
     *
     * @private
     * @function Highcharts.Navigator#getPartsEvents
     *
     * @param {string} eventName
     *        Event name handler, 'mousedown' or 'touchstart'
     *
     * @return {Array<Function>}
     *         An array of functions to remove navigator functions from the
     *         events again.
     */
    getPartsEvents(eventName) {
        const navigator = this, events = [];
        ['shades', 'handles'].forEach(function (name) {
            navigator[name].forEach(function (navigatorItem, index) {
                events.push(Navigator_addEvent(navigatorItem.element, eventName, function (e) {
                    navigator[name + 'Mousedown'](e, index);
                }));
            });
        });
        return events;
    }
    /**
     * Mousedown on a shaded mask, either:
     *
     * - will be stored for future drag&drop
     *
     * - will directly shift to a new range
     *
     * @private
     * @function Highcharts.Navigator#shadesMousedown
     *
     * @param {Highcharts.PointerEventObject} e
     *        Mouse event
     *
     * @param {number} index
     *        Index of a mask in Navigator.shades array
     */
    shadesMousedown(e, index) {
        e = this.chart.pointer?.normalize(e) || e;
        const navigator = this, chart = navigator.chart, xAxis = navigator.xAxis, zoomedMin = navigator.zoomedMin, navigatorSize = navigator.size, range = navigator.range;
        let navigatorPosition = navigator.left, chartX = e.chartX, fixedMax, fixedMin, ext, left;
        // For inverted chart, swap some options:
        if (chart.inverted) {
            chartX = e.chartY;
            navigatorPosition = navigator.top;
        }
        if (index === 1) {
            // Store information for drag&drop
            navigator.grabbedCenter = chartX;
            navigator.fixedWidth = range;
            navigator.dragOffset = chartX - zoomedMin;
        }
        else {
            // Shift the range by clicking on shaded areas
            left = chartX - navigatorPosition - range / 2;
            if (index === 0) {
                left = Math.max(0, left);
            }
            else if (index === 2 && left + range >= navigatorSize) {
                left = navigatorSize - range;
                if (navigator.reversedExtremes) {
                    // #7713
                    left -= range;
                    fixedMin = navigator.getUnionExtremes().dataMin;
                }
                else {
                    // #2293, #3543
                    fixedMax = navigator.getUnionExtremes().dataMax;
                }
            }
            if (left !== zoomedMin) { // It has actually moved
                navigator.fixedWidth = range; // #1370
                ext = xAxis.navigatorAxis.toFixedRange(left, left + range, fixedMin, fixedMax);
                if (Navigator_defined(ext.min)) { // #7411
                    Navigator_fireEvent(this, 'setRange', {
                        min: Math.min(ext.min, ext.max),
                        max: Math.max(ext.min, ext.max),
                        redraw: true,
                        eventArguments: {
                            trigger: 'navigator'
                        }
                    });
                }
            }
        }
    }
    /**
     * Mousedown on a handle mask.
     * Will store necessary information for drag&drop.
     *
     * @private
     * @function Highcharts.Navigator#handlesMousedown
     * @param {Highcharts.PointerEventObject} e
     *        Mouse event
     * @param {number} index
     *        Index of a handle in Navigator.handles array
     */
    handlesMousedown(e, index) {
        e = this.chart.pointer?.normalize(e) || e;
        const navigator = this, chart = navigator.chart, baseXAxis = chart.xAxis[0], 
        // For reversed axes, min and max are changed,
        // so the other extreme should be stored
        reverse = navigator.reversedExtremes;
        if (index === 0) {
            // Grab the left handle
            navigator.grabbedLeft = true;
            navigator.otherHandlePos = navigator.zoomedMax;
            navigator.fixedExtreme = reverse ? baseXAxis.min : baseXAxis.max;
        }
        else {
            // Grab the right handle
            navigator.grabbedRight = true;
            navigator.otherHandlePos = navigator.zoomedMin;
            navigator.fixedExtreme = reverse ? baseXAxis.max : baseXAxis.min;
        }
        chart.setFixedRange(void 0);
    }
    /**
     * Mouse move event based on x/y mouse position.
     *
     * @private
     * @function Highcharts.Navigator#onMouseMove
     *
     * @param {Highcharts.PointerEventObject} e
     *        Mouse event
     */
    onMouseMove(e) {
        const navigator = this, chart = navigator.chart, navigatorSize = navigator.navigatorSize, range = navigator.range, dragOffset = navigator.dragOffset, inverted = chart.inverted;
        let left = navigator.left, chartX;
        // In iOS, a mousemove event with e.pageX === 0 is fired when holding
        // the finger down in the center of the scrollbar. This should be
        // ignored.
        if (!e.touches || e.touches[0].pageX !== 0) { // #4696
            e = chart.pointer?.normalize(e) || e;
            chartX = e.chartX;
            // Swap some options for inverted chart
            if (inverted) {
                left = navigator.top;
                chartX = e.chartY;
            }
            // Drag left handle or top handle
            if (navigator.grabbedLeft) {
                navigator.hasDragged = true;
                navigator.render(0, 0, chartX - left, navigator.otherHandlePos);
                // Drag right handle or bottom handle
            }
            else if (navigator.grabbedRight) {
                navigator.hasDragged = true;
                navigator.render(0, 0, navigator.otherHandlePos, chartX - left);
                // Drag scrollbar or open area in navigator
            }
            else if (navigator.grabbedCenter) {
                navigator.hasDragged = true;
                if (chartX < dragOffset) { // Outside left
                    chartX = dragOffset;
                    // Outside right
                }
                else if (chartX >
                    navigatorSize + dragOffset - range) {
                    chartX = navigatorSize + dragOffset - range;
                }
                navigator.render(0, 0, chartX - dragOffset, chartX - dragOffset + range);
            }
            if (navigator.hasDragged &&
                navigator.scrollbar &&
                Navigator_pick(navigator.scrollbar.options.liveRedraw, 
                // By default, don't run live redraw on touch
                // devices or if the chart is in boost.
                !Navigator_isTouchDevice &&
                    !this.chart.boosted)) {
                e.DOMType = e.type;
                setTimeout(function () {
                    navigator.onMouseUp(e);
                }, 0);
            }
        }
    }
    /**
     * Mouse up event based on x/y mouse position.
     *
     * @private
     * @function Highcharts.Navigator#onMouseUp
     * @param {Highcharts.PointerEventObject} e
     *        Mouse event
     */
    onMouseUp(e) {
        const navigator = this, chart = navigator.chart, xAxis = navigator.xAxis, scrollbar = navigator.scrollbar, DOMEvent = e.DOMEvent || e, inverted = chart.inverted, verb = navigator.rendered && !navigator.hasDragged ?
            'animate' : 'attr';
        let zoomedMax, zoomedMin, unionExtremes, fixedMin, fixedMax, ext;
        if (
        // MouseUp is called for both, navigator and scrollbar (that order),
        // which causes calling afterSetExtremes twice. Prevent first call
        // by checking if scrollbar is going to set new extremes (#6334)
        (navigator.hasDragged && (!scrollbar || !scrollbar.hasDragged)) ||
            e.trigger === 'scrollbar') {
            unionExtremes = navigator.getUnionExtremes();
            // When dragging one handle, make sure the other one doesn't change
            if (navigator.zoomedMin === navigator.otherHandlePos) {
                fixedMin = navigator.fixedExtreme;
            }
            else if (navigator.zoomedMax === navigator.otherHandlePos) {
                fixedMax = navigator.fixedExtreme;
            }
            // Snap to right edge (#4076)
            if (navigator.zoomedMax === navigator.size) {
                fixedMax = navigator.reversedExtremes ?
                    unionExtremes.dataMin :
                    unionExtremes.dataMax;
            }
            // Snap to left edge (#7576)
            if (navigator.zoomedMin === 0) {
                fixedMin = navigator.reversedExtremes ?
                    unionExtremes.dataMax :
                    unionExtremes.dataMin;
            }
            ext = xAxis.navigatorAxis.toFixedRange(navigator.zoomedMin, navigator.zoomedMax, fixedMin, fixedMax);
            if (Navigator_defined(ext.min)) {
                Navigator_fireEvent(this, 'setRange', {
                    min: Math.min(ext.min, ext.max),
                    max: Math.max(ext.min, ext.max),
                    redraw: true,
                    animation: navigator.hasDragged ? false : null,
                    eventArguments: {
                        trigger: 'navigator',
                        triggerOp: 'navigator-drag',
                        DOMEvent: DOMEvent // #1838
                    }
                });
            }
        }
        if (e.DOMType !== 'mousemove' &&
            e.DOMType !== 'touchmove') {
            navigator.grabbedLeft = navigator.grabbedRight =
                navigator.grabbedCenter = navigator.fixedWidth =
                    navigator.fixedExtreme = navigator.otherHandlePos =
                        navigator.hasDragged = navigator.dragOffset = null;
        }
        // Update position of navigator shades, outline and handles (#12573)
        if (navigator.navigatorEnabled &&
            Navigator_isNumber(navigator.zoomedMin) &&
            Navigator_isNumber(navigator.zoomedMax)) {
            zoomedMin = Math.round(navigator.zoomedMin);
            zoomedMax = Math.round(navigator.zoomedMax);
            if (navigator.shades) {
                navigator.drawMasks(zoomedMin, zoomedMax, inverted, verb);
            }
            if (navigator.outline) {
                navigator.drawOutline(zoomedMin, zoomedMax, inverted, verb);
            }
            if (navigator.navigatorOptions.handles.enabled &&
                Object.keys(navigator.handles).length ===
                    navigator.handles.length) {
                navigator.drawHandle(zoomedMin, 0, inverted, verb);
                navigator.drawHandle(zoomedMax, 1, inverted, verb);
            }
        }
    }
    /**
     * Removes the event handlers attached previously with addEvents.
     *
     * @private
     * @function Highcharts.Navigator#removeEvents
     */
    removeEvents() {
        if (this.eventsToUnbind) {
            this.eventsToUnbind.forEach(function (unbind) {
                unbind();
            });
            this.eventsToUnbind = void 0;
        }
        this.removeBaseSeriesEvents();
    }
    /**
     * Remove data events.
     *
     * @private
     * @function Highcharts.Navigator#removeBaseSeriesEvents
     */
    removeBaseSeriesEvents() {
        const baseSeries = this.baseSeries || [];
        if (this.navigatorEnabled && baseSeries[0]) {
            if (this.navigatorOptions.adaptToUpdatedData !== false) {
                baseSeries.forEach(function (series) {
                    Navigator_removeEvent(series, 'updatedData', this.updatedDataHandler);
                }, this);
            }
            // We only listen for extremes-events on the first baseSeries
            if (baseSeries[0].xAxis) {
                Navigator_removeEvent(baseSeries[0].xAxis, 'foundExtremes', this.modifyBaseAxisExtremes);
            }
        }
    }
    /**
     * Calculate the navigator xAxis offsets
     *
     * @private
     */
    getXAxisOffsets() {
        return (this.chart.inverted ?
            [this.scrollButtonSize, 0, -this.scrollButtonSize, 0] :
            [0, -this.scrollButtonSize, 0, this.scrollButtonSize]);
    }
    /**
     * Initialize the Navigator object
     *
     * @private
     * @function Highcharts.Navigator#init
     */
    init(chart) {
        const chartOptions = chart.options, navigatorOptions = chartOptions.navigator || {}, navigatorEnabled = navigatorOptions.enabled, scrollbarOptions = chartOptions.scrollbar || {}, scrollbarEnabled = scrollbarOptions.enabled, height = navigatorEnabled && navigatorOptions.height || 0, scrollbarHeight = scrollbarEnabled && scrollbarOptions.height || 0, scrollButtonSize = scrollbarOptions.buttonsEnabled && scrollbarHeight || 0;
        this.handles = [];
        this.shades = [];
        this.chart = chart;
        this.setBaseSeries();
        this.height = height;
        this.scrollbarHeight = scrollbarHeight;
        this.scrollButtonSize = scrollButtonSize;
        this.scrollbarEnabled = scrollbarEnabled;
        this.navigatorEnabled = navigatorEnabled;
        this.navigatorOptions = navigatorOptions;
        this.scrollbarOptions = scrollbarOptions;
        this.setOpposite();
        const navigator = this, baseSeries = navigator.baseSeries, xAxisIndex = chart.xAxis.length, yAxisIndex = chart.yAxis.length, baseXaxis = baseSeries && baseSeries[0] && baseSeries[0].xAxis ||
            chart.xAxis[0] || { options: {} };
        chart.isDirtyBox = true;
        if (navigator.navigatorEnabled) {
            const offsets = this.getXAxisOffsets();
            // An x axis is required for scrollbar also
            navigator.xAxis = new (external_highcharts_src_js_default_Axis_default())(chart, Navigator_merge({
                // Inherit base xAxis' break, ordinal options and overscroll
                breaks: baseXaxis.options.breaks,
                ordinal: baseXaxis.options.ordinal,
                overscroll: baseXaxis.options.overscroll
            }, navigatorOptions.xAxis, {
                type: 'datetime',
                yAxis: navigatorOptions.yAxis?.id,
                index: xAxisIndex,
                isInternal: true,
                offset: 0,
                keepOrdinalPadding: true, // #2436
                startOnTick: false,
                endOnTick: false,
                // Inherit base xAxis' padding when ordinal is false (#16915).
                minPadding: baseXaxis.options.ordinal ? 0 :
                    baseXaxis.options.minPadding,
                maxPadding: baseXaxis.options.ordinal ? 0 :
                    baseXaxis.options.maxPadding,
                zoomEnabled: false
            }, chart.inverted ? {
                offsets,
                width: height
            } : {
                offsets,
                height
            }), 'xAxis');
            navigator.yAxis = new (external_highcharts_src_js_default_Axis_default())(chart, Navigator_merge(navigatorOptions.yAxis, {
                alignTicks: false,
                offset: 0,
                index: yAxisIndex,
                isInternal: true,
                reversed: Navigator_pick((navigatorOptions.yAxis &&
                    navigatorOptions.yAxis.reversed), (chart.yAxis[0] && chart.yAxis[0].reversed), false), // #14060
                zoomEnabled: false
            }, chart.inverted ? {
                width: height
            } : {
                height: height
            }), 'yAxis');
            // If we have a base series, initialize the navigator series
            if (baseSeries || navigatorOptions.series.data) {
                navigator.updateNavigatorSeries(false);
                // If not, set up an event to listen for added series
            }
            else if (chart.series.length === 0) {
                navigator.unbindRedraw = Navigator_addEvent(chart, 'beforeRedraw', function () {
                    // We've got one, now add it as base
                    if (chart.series.length > 0 && !navigator.series) {
                        navigator.setBaseSeries();
                        navigator.unbindRedraw(); // Reset
                    }
                });
            }
            navigator.reversedExtremes = (chart.inverted && !navigator.xAxis.reversed) || (!chart.inverted && navigator.xAxis.reversed);
            // Render items, so we can bind events to them:
            navigator.renderElements();
            // Add mouse events
            navigator.addMouseEvents();
            // In case of scrollbar only, fake an x axis to get translation
        }
        else {
            navigator.xAxis = {
                chart,
                navigatorAxis: {
                    fake: true
                },
                translate: function (value, reverse) {
                    const axis = chart.xAxis[0], ext = axis.getExtremes(), scrollTrackWidth = axis.len - 2 * scrollButtonSize, min = numExt('min', axis.options.min, ext.dataMin), valueRange = numExt('max', axis.options.max, ext.dataMax) - min;
                    return reverse ?
                        // From pixel to value
                        (value * valueRange / scrollTrackWidth) + min :
                        // From value to pixel
                        scrollTrackWidth * (value - min) / valueRange;
                },
                toPixels: function (value) {
                    return this.translate(value);
                },
                toValue: function (value) {
                    return this.translate(value, true);
                }
            };
            navigator.xAxis.navigatorAxis.axis = navigator.xAxis;
            navigator.xAxis.navigatorAxis.toFixedRange = (NavigatorAxisComposition.prototype.toFixedRange.bind(navigator.xAxis.navigatorAxis));
        }
        // Initialize the scrollbar
        if (chart.options.scrollbar?.enabled) {
            const options = Navigator_merge(chart.options.scrollbar, { vertical: chart.inverted });
            if (!Navigator_isNumber(options.margin)) {
                options.margin = chart.inverted ? -3 : 3;
            }
            chart.scrollbar = navigator.scrollbar = new Scrollbar_Scrollbar(chart.renderer, options, chart);
            Navigator_addEvent(navigator.scrollbar, 'changed', function (e) {
                const range = navigator.size, to = range * this.to, from = range * this.from;
                navigator.hasDragged = navigator.scrollbar.hasDragged;
                navigator.render(0, 0, from, to);
                if (this.shouldUpdateExtremes(e.DOMType)) {
                    setTimeout(function () {
                        navigator.onMouseUp(e);
                    });
                }
            });
        }
        // Add data events
        navigator.addBaseSeriesEvents();
        // Add redraw events
        navigator.addChartEvents();
    }
    /**
     * Set the opposite property on navigator
     *
     * @private
     */
    setOpposite() {
        const navigatorOptions = this.navigatorOptions, navigatorEnabled = this.navigatorEnabled, chart = this.chart;
        this.opposite = Navigator_pick(navigatorOptions.opposite, Boolean(!navigatorEnabled && chart.inverted)); // #6262
    }
    /**
     * Get the union data extremes of the chart - the outer data extremes of the
     * base X axis and the navigator axis.
     *
     * @private
     * @function Highcharts.Navigator#getUnionExtremes
     */
    getUnionExtremes(returnFalseOnNoBaseSeries) {
        const baseAxis = this.chart.xAxis[0], time = this.chart.time, navAxis = this.xAxis, navAxisOptions = navAxis.options, baseAxisOptions = baseAxis.options;
        let ret;
        if (!returnFalseOnNoBaseSeries || baseAxis.dataMin !== null) {
            ret = {
                dataMin: Navigator_pick(// #4053
                time.parse(navAxisOptions?.min), numExt('min', time.parse(baseAxisOptions.min), baseAxis.dataMin, navAxis.dataMin, navAxis.min)),
                dataMax: Navigator_pick(time.parse(navAxisOptions?.max), numExt('max', time.parse(baseAxisOptions.max), baseAxis.dataMax, navAxis.dataMax, navAxis.max))
            };
        }
        return ret;
    }
    /**
     * Set the base series and update the navigator series from this. With a bit
     * of modification we should be able to make this an API method to be called
     * from the outside
     *
     * @private
     * @function Highcharts.Navigator#setBaseSeries
     * @param {Highcharts.SeriesOptionsType} [baseSeriesOptions]
     *        Additional series options for a navigator
     * @param {boolean} [redraw]
     *        Whether to redraw after update.
     */
    setBaseSeries(baseSeriesOptions, redraw) {
        const chart = this.chart, baseSeries = this.baseSeries = [];
        baseSeriesOptions = (baseSeriesOptions ||
            chart.options && chart.options.navigator.baseSeries ||
            (chart.series.length ?
                // Find the first non-navigator series (#8430)
                find(chart.series, (s) => (!s.options.isInternal)).index :
                0));
        // Iterate through series and add the ones that should be shown in
        // navigator.
        (chart.series || []).forEach((series, i) => {
            if (
            // Don't include existing nav series
            !series.options.isInternal &&
                (series.options.showInNavigator ||
                    (i === baseSeriesOptions ||
                        series.options.id === baseSeriesOptions) &&
                        series.options.showInNavigator !== false)) {
                baseSeries.push(series);
            }
        });
        // When run after render, this.xAxis already exists
        if (this.xAxis && !this.xAxis.navigatorAxis.fake) {
            this.updateNavigatorSeries(true, redraw);
        }
    }
    /**
     * Update series in the navigator from baseSeries, adding new if does not
     * exist.
     *
     * @private
     * @function Highcharts.Navigator.updateNavigatorSeries
     */
    updateNavigatorSeries(addEvents, redraw) {
        const navigator = this, chart = navigator.chart, baseSeries = navigator.baseSeries, navSeriesMixin = {
            enableMouseTracking: false,
            index: null, // #6162
            linkedTo: null, // #6734
            group: 'nav', // For columns
            padXAxis: false,
            xAxis: this.navigatorOptions.xAxis?.id,
            yAxis: this.navigatorOptions.yAxis?.id,
            showInLegend: false,
            stacking: void 0, // #4823
            isInternal: true,
            states: {
                inactive: {
                    opacity: 1
                }
            }
        }, 
        // Remove navigator series that are no longer in the baseSeries
        navigatorSeries = navigator.series =
            (navigator.series || []).filter((navSeries) => {
                const base = navSeries.baseSeries;
                if (baseSeries.indexOf(base) < 0) { // Not in array
                    // If there is still a base series connected to this
                    // series, remove event handler and reference.
                    if (base) {
                        Navigator_removeEvent(base, 'updatedData', navigator.updatedDataHandler);
                        delete base.navigatorSeries;
                    }
                    // Kill the nav series. It may already have been
                    // destroyed (#8715).
                    if (navSeries.chart) {
                        navSeries.destroy();
                    }
                    return false;
                }
                return true;
            });
        let baseOptions, mergedNavSeriesOptions, chartNavigatorSeriesOptions = navigator.navigatorOptions.series, baseNavigatorOptions;
        // Go through each base series and merge the options to create new
        // series
        if (baseSeries && baseSeries.length) {
            baseSeries.forEach((base) => {
                const linkedNavSeries = base.navigatorSeries, userNavOptions = Navigator_extend(
                // Grab color and visibility from base as default
                {
                    color: base.color,
                    visible: base.visible
                }, !Navigator_isArray(chartNavigatorSeriesOptions) ?
                    chartNavigatorSeriesOptions :
                    Navigator_defaultOptions.navigator.series);
                // Don't update if the series exists in nav and we have disabled
                // adaptToUpdatedData.
                if (linkedNavSeries &&
                    navigator.navigatorOptions.adaptToUpdatedData === false) {
                    return;
                }
                navSeriesMixin.name = 'Navigator ' + baseSeries.length;
                baseOptions = base.options || {};
                baseNavigatorOptions = baseOptions.navigatorOptions || {};
                // The dataLabels options are not merged correctly
                // if the settings are an array, #13847.
                userNavOptions.dataLabels = Navigator_splat(userNavOptions.dataLabels);
                mergedNavSeriesOptions = Navigator_merge(baseOptions, navSeriesMixin, userNavOptions, baseNavigatorOptions);
                // Once nav series type is resolved, pick correct pointRange
                mergedNavSeriesOptions.pointRange = Navigator_pick(
                // Stricte set pointRange in options
                userNavOptions.pointRange, baseNavigatorOptions.pointRange, 
                // Fallback to default values, e.g. `null` for column
                Navigator_defaultOptions.plotOptions[mergedNavSeriesOptions.type || 'line'].pointRange);
                // Merge data separately. Do a slice to avoid mutating the
                // navigator options from base series (#4923).
                const navigatorSeriesData = baseNavigatorOptions.data || userNavOptions.data;
                navigator.hasNavigatorData =
                    navigator.hasNavigatorData || !!navigatorSeriesData;
                mergedNavSeriesOptions.data = (navigatorSeriesData ||
                    baseOptions.data?.slice(0));
                // Update or add the series
                if (linkedNavSeries && linkedNavSeries.options) {
                    linkedNavSeries.update(mergedNavSeriesOptions, redraw);
                }
                else {
                    base.navigatorSeries = chart.initSeries(mergedNavSeriesOptions);
                    // Set data on initial run with dataSorting enabled (#20318)
                    chart.setSortedData();
                    base.navigatorSeries.baseSeries = base; // Store ref
                    navigatorSeries.push(base.navigatorSeries);
                }
            });
        }
        // If user has defined data (and no base series) or explicitly defined
        // navigator.series as an array, we create these series on top of any
        // base series.
        if (chartNavigatorSeriesOptions.data &&
            !(baseSeries && baseSeries.length) ||
            Navigator_isArray(chartNavigatorSeriesOptions)) {
            navigator.hasNavigatorData = false;
            // Allow navigator.series to be an array
            chartNavigatorSeriesOptions =
                Navigator_splat(chartNavigatorSeriesOptions);
            chartNavigatorSeriesOptions.forEach((userSeriesOptions, i) => {
                navSeriesMixin.name =
                    'Navigator ' + (navigatorSeries.length + 1);
                mergedNavSeriesOptions = Navigator_merge(Navigator_defaultOptions.navigator.series, {
                    // Since we don't have a base series to pull color from,
                    // try to fake it by using color from series with same
                    // index. Otherwise pull from the colors array. We need
                    // an explicit color as otherwise updates will increment
                    // color counter and we'll get a new color for each
                    // update of the nav series.
                    color: chart.series[i] &&
                        !chart.series[i].options.isInternal &&
                        chart.series[i].color ||
                        chart.options.colors[i] ||
                        chart.options.colors[0]
                }, navSeriesMixin, userSeriesOptions);
                mergedNavSeriesOptions.data = userSeriesOptions.data;
                if (mergedNavSeriesOptions.data) {
                    navigator.hasNavigatorData = true;
                    navigatorSeries.push(chart.initSeries(mergedNavSeriesOptions));
                }
            });
        }
        if (addEvents) {
            this.addBaseSeriesEvents();
        }
    }
    /**
     * Add data events.
     * For example when main series is updated we need to recalculate extremes
     *
     * @private
     * @function Highcharts.Navigator#addBaseSeriesEvent
     */
    addBaseSeriesEvents() {
        const navigator = this, baseSeries = navigator.baseSeries || [];
        // Bind modified extremes event to first base's xAxis only.
        // In event of > 1 base-xAxes, the navigator will ignore those.
        // Adding this multiple times to the same axis is no problem, as
        // duplicates should be discarded by the browser.
        if (baseSeries[0] && baseSeries[0].xAxis) {
            baseSeries[0].eventsToUnbind.push(Navigator_addEvent(baseSeries[0].xAxis, 'foundExtremes', this.modifyBaseAxisExtremes));
        }
        baseSeries.forEach((base) => {
            // Link base series show/hide to navigator series visibility
            base.eventsToUnbind.push(Navigator_addEvent(base, 'show', function () {
                if (this.navigatorSeries) {
                    this.navigatorSeries.setVisible(true, false);
                }
            }));
            base.eventsToUnbind.push(Navigator_addEvent(base, 'hide', function () {
                if (this.navigatorSeries) {
                    this.navigatorSeries.setVisible(false, false);
                }
            }));
            // Respond to updated data in the base series, unless explicitly
            // not adapting to data changes.
            if (this.navigatorOptions.adaptToUpdatedData !== false) {
                if (base.xAxis) {
                    base.eventsToUnbind.push(Navigator_addEvent(base, 'updatedData', this.updatedDataHandler));
                }
            }
            // Handle series removal
            base.eventsToUnbind.push(Navigator_addEvent(base, 'remove', function () {
                if (baseSeries) {
                    erase(baseSeries, base); // #21043
                }
                if (this.navigatorSeries && navigator.series) {
                    erase(navigator.series, this.navigatorSeries);
                    if (Navigator_defined(this.navigatorSeries.options)) {
                        this.navigatorSeries.remove(false);
                    }
                    delete this.navigatorSeries;
                }
            }));
        });
    }
    /**
     * Get minimum from all base series connected to the navigator
     * @private
     * @param {number} currentSeriesMin
     *        Minium from the current series
     * @return {number}
     *         Minimum from all series
     */
    getBaseSeriesMin(currentSeriesMin) {
        return this.baseSeries.reduce(function (min, series) {
            // #10193
            return Math.min(min, series.getColumn('x')[0] ?? min);
        }, currentSeriesMin);
    }
    /**
     * Set the navigator x axis extremes to reflect the total. The navigator
     * extremes should always be the extremes of the union of all series in the
     * chart as well as the navigator series.
     *
     * @private
     * @function Highcharts.Navigator#modifyNavigatorAxisExtremes
     */
    modifyNavigatorAxisExtremes() {
        const xAxis = this.xAxis;
        if (typeof xAxis.getExtremes !== 'undefined') {
            const unionExtremes = this.getUnionExtremes(true);
            if (unionExtremes &&
                (unionExtremes.dataMin !== xAxis.min ||
                    unionExtremes.dataMax !== xAxis.max)) {
                xAxis.min = unionExtremes.dataMin;
                xAxis.max = unionExtremes.dataMax;
            }
        }
    }
    /**
     * Hook to modify the base axis extremes with information from the Navigator
     *
     * @private
     * @function Highcharts.Navigator#modifyBaseAxisExtremes
     */
    modifyBaseAxisExtremes() {
        const baseXAxis = this, navigator = baseXAxis.chart.navigator, baseExtremes = baseXAxis.getExtremes(), baseMin = baseExtremes.min, baseMax = baseExtremes.max, baseDataMin = baseExtremes.dataMin, baseDataMax = baseExtremes.dataMax, range = baseMax - baseMin, stickToMin = navigator.stickToMin, stickToMax = navigator.stickToMax, overscroll = Navigator_pick(baseXAxis.ordinal?.convertOverscroll(baseXAxis.options.overscroll), 0), navigatorSeries = navigator.series && navigator.series[0], hasSetExtremes = !!baseXAxis.setExtremes, 
        // When the extremes have been set by range selector button, don't
        // stick to min or max. The range selector buttons will handle the
        // extremes. (#5489)
        unmutable = baseXAxis.eventArgs &&
            baseXAxis.eventArgs.trigger === 'rangeSelectorButton';
        let newMax, newMin;
        if (!unmutable) {
            // If the zoomed range is already at the min, move it to the right
            // as new data comes in
            if (stickToMin) {
                newMin = baseDataMin;
                newMax = newMin + range;
            }
            // If the zoomed range is already at the max, move it to the right
            // as new data comes in
            if (stickToMax) {
                newMax = baseDataMax + overscroll;
                // If stickToMin is true, the new min value is set above
                if (!stickToMin) {
                    newMin = Math.max(baseDataMin, // Don't go below data extremes (#13184)
                    newMax - range, navigator.getBaseSeriesMin(navigatorSeries && navigatorSeries.xData ?
                        navigatorSeries.xData[0] :
                        -Number.MAX_VALUE));
                }
            }
            // Update the extremes
            if (hasSetExtremes && (stickToMin || stickToMax)) {
                if (Navigator_isNumber(newMin)) {
                    baseXAxis.min = baseXAxis.userMin = newMin;
                    baseXAxis.max = baseXAxis.userMax = newMax;
                }
            }
        }
        // Reset
        navigator.stickToMin =
            navigator.stickToMax = null;
    }
    /**
     * Handler for updated data on the base series. When data is modified, the
     * navigator series must reflect it. This is called from the Chart.redraw
     * function before axis and series extremes are computed.
     *
     * @private
     * @function Highcharts.Navigator#updateDataHandler
     */
    updatedDataHandler() {
        const navigator = this.chart.navigator, baseSeries = this, navigatorSeries = this.navigatorSeries, shouldStickToMax = navigator.reversedExtremes ?
            Math.round(navigator.zoomedMin) === 0 :
            Math.round(navigator.zoomedMax) >= Math.round(navigator.size);
        // If the scrollbar is scrolled all the way to the right, keep right as
        // new data comes in, unless user set navigator.stickToMax to false.
        navigator.stickToMax = Navigator_pick(this.chart.options.navigator &&
            this.chart.options.navigator.stickToMax, shouldStickToMax);
        navigator.stickToMin = navigator.shouldStickToMin(baseSeries, navigator);
        // Set the navigator series data to the new data of the base series
        if (navigatorSeries && !navigator.hasNavigatorData) {
            navigatorSeries.options.pointStart = baseSeries.getColumn('x')[0];
            navigatorSeries.setData(baseSeries.options.data, false, null, false); // #5414
        }
    }
    /**
     * Detect if the zoomed area should stick to the minimum, #14742.
     *
     * @private
     * @function Highcharts.Navigator#shouldStickToMin
     */
    shouldStickToMin(baseSeries, navigator) {
        const xDataMin = navigator.getBaseSeriesMin(baseSeries.getColumn('x')[0]), xAxis = baseSeries.xAxis, max = xAxis.max, min = xAxis.min, range = xAxis.options.range;
        let stickToMin = true;
        if (Navigator_isNumber(max) && Navigator_isNumber(min)) {
            // If range declared, stick to the minimum only if the range
            // is smaller than the data set range.
            if (range && max - xDataMin > 0) {
                stickToMin = max - xDataMin < range;
            }
            else {
                // If the current axis minimum falls outside the new
                // updated dataset, we must adjust.
                stickToMin = min <= xDataMin;
            }
        }
        else {
            stickToMin = false; // #15864
        }
        return stickToMin;
    }
    /**
     * Add chart events, like redrawing navigator, when chart requires that.
     *
     * @private
     * @function Highcharts.Navigator#addChartEvents
     */
    addChartEvents() {
        if (!this.eventsToUnbind) {
            this.eventsToUnbind = [];
        }
        this.eventsToUnbind.push(
        // Move the scrollbar after redraw, like after data updata even if
        // axes don't redraw
        Navigator_addEvent(this.chart, 'redraw', function () {
            const navigator = this.navigator, xAxis = navigator && (navigator.baseSeries &&
                navigator.baseSeries[0] &&
                navigator.baseSeries[0].xAxis ||
                this.xAxis[0]); // #5709, #13114
            if (xAxis) {
                navigator.render(xAxis.min, xAxis.max);
            }
        }), 
        // Make room for the navigator, can be placed around the chart:
        Navigator_addEvent(this.chart, 'getMargins', function () {
            const chart = this, navigator = chart.navigator;
            let marginName = navigator.opposite ?
                'plotTop' : 'marginBottom';
            if (chart.inverted) {
                marginName = navigator.opposite ?
                    'marginRight' : 'plotLeft';
            }
            chart[marginName] = (chart[marginName] || 0) + (navigator.navigatorEnabled || !chart.inverted ?
                navigator.height +
                    (this.scrollbar?.options.margin || 0) +
                    navigator.scrollbarHeight : 0) + (navigator.navigatorOptions.margin || 0);
        }), Navigator_addEvent(Navigator, 'setRange', function (e) {
            this.chart.xAxis[0].setExtremes(e.min, e.max, e.redraw, e.animation, e.eventArguments);
        }));
    }
    /**
     * Destroys allocated elements.
     *
     * @private
     * @function Highcharts.Navigator#destroy
     */
    destroy() {
        // Disconnect events added in addEvents
        this.removeEvents();
        if (this.xAxis) {
            erase(this.chart.xAxis, this.xAxis);
            erase(this.chart.axes, this.xAxis);
        }
        if (this.yAxis) {
            erase(this.chart.yAxis, this.yAxis);
            erase(this.chart.axes, this.yAxis);
        }
        // Destroy series
        (this.series || []).forEach((s) => {
            if (s.destroy) {
                s.destroy();
            }
        });
        // Destroy properties
        [
            'series', 'xAxis', 'yAxis', 'shades', 'outline', 'scrollbarTrack',
            'scrollbarRifles', 'scrollbarGroup', 'scrollbar', 'navigatorGroup',
            'rendered'
        ].forEach((prop) => {
            if (this[prop] && this[prop].destroy) {
                this[prop].destroy();
            }
            this[prop] = null;
        });
        // Destroy elements in collection
        [this.handles].forEach((coll) => {
            Navigator_destroyObjectProperties(coll);
        });
        // Clean up linked series
        this.baseSeries.forEach((s) => {
            s.navigatorSeries = void 0;
        });
        this.navigatorEnabled = false;
    }
}
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Navigator_Navigator = (Navigator);

;// ./code/es-modules/Stock/RangeSelector/RangeSelectorDefaults.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

/* *
 *
 *  Declarations
 *
 * */
/**
 * An object containing language-related strings and settings. A typical setup
 * uses `Highcharts.setOptions` to make the options apply to all charts in the
 * same page.
 *
 * ```js
 * Highcharts.setOptions({
 *     lang: {
 *         locale: 'fr'
 *     }
 * });
 * ```
 *
 * @optionparent lang
 */
const lang = {
    /**
     * The text for the label for the range selector buttons.
     *
     * @product highstock gantt
     */
    rangeSelectorZoom: 'Zoom',
    /**
     * The text for the label for the "from" input box in the range
     * selector. Since v9.0, this string is empty as the label is not
     * rendered by default.
     *
     * @product highstock gantt
     */
    rangeSelectorFrom: '',
    /**
     * The text for the label for the "to" input box in the range selector.
     *
     * @product highstock gantt
     */
    rangeSelectorTo: '→',
    /**
     * The default text for the rangeselector buttons.
     *
     * @since 12.2.0
     */
    rangeSelector: {
        allText: 'All',
        allTitle: 'View all',
        monthText: '{count}m',
        monthTitle: 'View {count} {#eq count 1}month{else}months{/eq}',
        yearText: '{count}y',
        yearTitle: 'View {count} {#eq count 1}year{else}years{/eq}',
        ytdText: 'YTD',
        ytdTitle: 'View year to date'
    }
};
/**
 * The range selector is a tool for selecting ranges to display within
 * the chart. It provides buttons to select preconfigured ranges in
 * the chart, like 1 day, 1 week, 1 month etc. It also provides input
 * boxes where min and max dates can be manually input.
 *
 * @product      highstock gantt
 * @optionparent rangeSelector
 */
const rangeSelector = {
    /**
     * Whether to enable all buttons from the start. By default buttons are
     * only enabled if the corresponding time range exists on the X axis,
     * but enabling all buttons allows for dynamically loading different
     * time ranges.
     *
     * @sample {highstock} stock/rangeselector/allbuttonsenabled-true/
     *         All buttons enabled
     *
     * @since     2.0.3
     */
    allButtonsEnabled: false,
    /**
     * An array of configuration objects for the buttons.
     *
     * Defaults to:
     * ```js
     * buttons: [{
     *     type: 'month',
     *     count: 1,
     *     text: '1m',
     *     title: 'View 1 month'
     * }, {
     *     type: 'month',
     *     count: 3,
     *     text: '3m',
     *     title: 'View 3 months'
     * }, {
     *     type: 'month',
     *     count: 6,
     *     text: '6m',
     *     title: 'View 6 months'
     * }, {
     *     type: 'ytd',
     *     text: 'YTD',
     *     title: 'View year to date'
     * }, {
     *     type: 'year',
     *     count: 1,
     *     text: '1y',
     *     title: 'View 1 year'
     * }, {
     *     type: 'all',
     *     text: 'All',
     *     title: 'View all'
     * }]
     * ```
     *
     * @sample {highstock} stock/demo/rangeselector-datagrouping/
     *         Data grouping by buttons
     *
     * @type      {Array<*>}
     */
    buttons: [{
            type: 'month',
            count: 1
        }, {
            type: 'month',
            count: 3
        }, {
            type: 'month',
            count: 6
        }, {
            type: 'ytd'
        }, {
            type: 'year',
            count: 1
        }, {
            type: 'all'
        }],
    /**
     * How many units of the defined type the button should span. If `type`
     * is "month" and `count` is 3, the button spans three months.
     *
     * @type      {number}
     * @default   1
     * @apioption rangeSelector.buttons.count
     */
    /**
     * Fires when clicking on the rangeSelector button. One parameter,
     * event, is passed to the function, containing common event
     * information.
     *
     * ```js
     * click: function(e) {
     *   console.log(this);
     * }
     * ```
     *
     * Return false to stop default button's click action.
     *
     * @sample {highstock} stock/rangeselector/button-click/
     *         Click event on the button
     *
     * @type      {Highcharts.RangeSelectorClickCallbackFunction}
     * @apioption rangeSelector.buttons.events.click
     */
    /**
     * Additional range (in milliseconds) added to the end of the calculated
     * time span.
     *
     * @sample {highstock} stock/rangeselector/min-max-offsets/
     *         Button offsets
     *
     * @type      {number}
     * @default   0
     * @since     6.0.0
     * @apioption rangeSelector.buttons.offsetMax
     */
    /**
     * Additional range (in milliseconds) added to the start of the
     * calculated time span.
     *
     * @sample {highstock} stock/rangeselector/min-max-offsets/
     *         Button offsets
     *
     * @type      {number}
     * @default   0
     * @since     6.0.0
     * @apioption rangeSelector.buttons.offsetMin
     */
    /**
     * When buttons apply dataGrouping on a series, by default zooming
     * in/out will deselect buttons and unset dataGrouping. Enable this
     * option to keep buttons selected when extremes change.
     *
     * @sample {highstock} stock/rangeselector/preserve-datagrouping/
     *         Different preserveDataGrouping settings
     *
     * @type      {boolean}
     * @default   false
     * @since     6.1.2
     * @apioption rangeSelector.buttons.preserveDataGrouping
     */
    /**
     * A custom data grouping object for each button.
     *
     * @see [series.dataGrouping](#plotOptions.series.dataGrouping)
     *
     * @sample {highstock} stock/demo/rangeselector-datagrouping/
     *         Data grouping by range selector buttons
     *
     * @type      {*}
     * @extends   plotOptions.series.dataGrouping
     * @apioption rangeSelector.buttons.dataGrouping
     */
    /**
     * The text for the button itself.
     *
     * @type      {string}
     * @apioption rangeSelector.buttons.text
     */
    /**
     * Explanation for the button, shown as a tooltip on hover, and used by
     * assistive technology.
     *
     * @type      {string}
     * @apioption rangeSelector.buttons.title
     */
    /**
     * Defined the time span for the button. Can be one of `millisecond`,
     * `second`, `minute`, `hour`, `day`, `week`, `month`, `year`, `ytd`,
     * and `all`.
     *
     * @type       {Highcharts.RangeSelectorButtonTypeValue}
     * @apioption  rangeSelector.buttons.type
     */
    /**
     * The space in pixels between the buttons in the range selector.
     */
    buttonSpacing: 5,
    /**
     * Whether to collapse the range selector buttons into a dropdown when
     * there is not enough room to show everything in a single row, instead
     * of dividing the range selector into multiple rows.
     * Can be one of the following:
     *  - `always`: Always collapse
     *  - `responsive`: Only collapse when there is not enough room
     *  - `never`: Never collapse
     *
     * @sample {highstock} stock/rangeselector/dropdown/
     *         Dropdown option
     *
     * @validvalue ["always", "responsive", "never"]
     * @since 9.0.0
     */
    dropdown: 'responsive',
    /**
     * Enable or disable the range selector. Default to `true` for stock
     * charts, using the `stockChart` factory.
     *
     * @sample {highstock} stock/rangeselector/enabled/
     *         Disable the range selector
     *
     * @type {boolean|undefined}
     * @default {highstock} true
     */
    enabled: void 0,
    /**
     * The vertical alignment of the rangeselector box. Allowed properties
     * are `top`, `middle`, `bottom`.
     *
     * @sample {highstock} stock/rangeselector/vertical-align-middle/
     *         Middle
     * @sample {highstock} stock/rangeselector/vertical-align-bottom/
     *         Bottom
     *
     * @type  {Highcharts.VerticalAlignValue}
     * @since 6.0.0
     */
    verticalAlign: 'top',
    /**
     * A collection of attributes for the buttons. The object takes SVG
     * attributes like `fill`, `stroke`, `stroke-width`, as well as `style`,
     * a collection of CSS properties for the text.
     *
     * The object can also be extended with states, so you can set
     * presentational options for `hover`, `select` or `disabled` button
     * states.
     *
     * CSS styles for the text label.
     *
     * In styled mode, the buttons are styled by the
     * `.highcharts-range-selector-buttons .highcharts-button` rule with its
     * different states.
     *
     * @sample {highstock} stock/rangeselector/styling/
     *         Styling the buttons and inputs
     *
     * @type {Highcharts.SVGAttributes}
     */
    buttonTheme: {
        /** @ignore */
        width: 28,
        /** @ignore */
        height: 18,
        /** @ignore */
        padding: 2,
        /** @ignore */
        zIndex: 7 // #484, #852
    },
    /**
     * When the rangeselector is floating, the plot area does not reserve
     * space for it. This opens for positioning anywhere on the chart.
     *
     * @sample {highstock} stock/rangeselector/floating/
     *         Placing the range selector between the plot area and the
     *         navigator
     *
     * @since 6.0.0
     */
    floating: false,
    /**
     * The x offset of the range selector relative to its horizontal
     * alignment within `chart.spacingLeft` and `chart.spacingRight`.
     *
     * @since 6.0.0
     */
    x: 0,
    /**
     * The y offset of the range selector relative to its horizontal
     * alignment within `chart.spacingLeft` and `chart.spacingRight`.
     *
     * @since 6.0.0
     */
    y: 0,
    /**
     * Deprecated. The height of the range selector. Currently it is
     * calculated dynamically.
     *
     * @deprecated
     * @type  {number|undefined}
     * @since 2.1.9
     */
    height: void 0, // Reserved space for buttons and input
    /**
     * The border color of the date input boxes.
     *
     * @sample {highstock} stock/rangeselector/styling/
     *         Styling the buttons and inputs
     *
     * @type      {Highcharts.ColorString}
     * @since     1.3.7
     */
    inputBoxBorderColor: 'none',
    /**
     * The pixel height of the date input boxes.
     *
     * @sample {highstock} stock/rangeselector/styling/
     *         Styling the buttons and inputs
     *
     * @since     1.3.7
     */
    inputBoxHeight: 17,
    /**
     * The pixel width of the date input boxes. When `undefined`, the width
     * is fitted to the rendered content.
     *
     * @sample {highstock} stock/rangeselector/styling/
     *         Styling the buttons and inputs
     *
     * @type   {number|undefined}
     * @since  1.3.7
     */
    inputBoxWidth: void 0,
    /**
     * The date format in the input boxes when not selected for editing.
     * Defaults to `%e %b %Y`.
     *
     * This is used to determine which type of input to show,
     * `datetime-local`, `date` or `time` and falling back to `text` when
     * the browser does not support the input type or the format contains
     * milliseconds.
     *
     * @sample {highstock} stock/rangeselector/input-type/
     *         Input types
     * @sample {highstock} stock/rangeselector/input-format/
     *         Milliseconds in the range selector
     *
     */
    inputDateFormat: '%[ebY]',
    /**
     * A custom callback function to parse values entered in the input boxes and
     * return a valid JavaScript time as milliseconds since 1970. The first
     * argument passed is the value to parse, second is a boolean indicating use
     * of UTC time. The third is a reference to the `time` object. Time zone can
     * be read from `time.timezone`.
     *
     * This will only get called for inputs of type `text`. Since v8.2.3, the
     * input type is dynamically determined based on the granularity of the
     * `inputDateFormat` and the browser support.
     *
     * @sample {highstock} stock/rangeselector/input-format/
     *         Milliseconds in the range selector
     *
     * @type      {Highcharts.RangeSelectorParseCallbackFunction}
     * @since     1.3.3
     */
    inputDateParser: void 0,
    /**
     * The date format in the input boxes when they are selected for
     * editing. This must be a format that is recognized by JavaScript
     * Date.parse.
     *
     * This will only be used for inputs of type `text`. Since v8.2.3,
     * the input type is dynamically determined based on the granularity
     * of the `inputDateFormat` and the browser support.
     *
     * @sample {highstock} stock/rangeselector/input-format/
     *         Milliseconds in the range selector
     *
     */
    inputEditDateFormat: '%Y-%m-%d',
    /**
     * Enable or disable the date input boxes.
     */
    inputEnabled: true,
    /**
     * Positioning for the input boxes. Allowed properties are `align`,
     *  `x` and `y`.
     *
     * @since 1.2.4
     */
    inputPosition: {
        /**
         * The alignment of the input box. Allowed properties are `left`,
         * `center`, `right`.
         *
         * @sample {highstock} stock/rangeselector/input-button-opposite-alignment/
         *         Opposite alignment
         *
         * @sample {highstock} stock/rangeselector/input-button-same-alignment/
         *         Same alignment for buttons and input
         *
         * @type  {Highcharts.AlignValue}
         * @since 6.0.0
         */
        align: 'right',
        /**
         * X offset of the input row.
         */
        x: 0,
        /**
         * Y offset of the input row.
         */
        y: 0
    },
    /**
     * The space in pixels between the labels and the date input boxes in
     * the range selector.
     *
     * @since 9.0.0
     */
    inputSpacing: 5,
    /**
     * The index of the button to appear pre-selected. If the selected range
     * exceeds the total data range and the 'all' option is available,
     * the 'all' option, showing the full range, is automatically selected.
     *
     * @type      {number}
     */
    selected: void 0,
    /**
     * Positioning for the button row.
     *
     * @since 1.2.4
     */
    buttonPosition: {
        /**
         * The alignment of the input box. Allowed properties are `left`,
         * `center`, `right`.
         *
         * @sample {highstock} stock/rangeselector/input-button-opposite-alignment/
         *         Opposite alignment
         *
         * @sample {highstock} stock/rangeselector/input-button-same-alignment/
         *         Same alignment for buttons and input
         *
         * @type  {Highcharts.AlignValue}
         * @since 6.0.0
         */
        align: 'left',
        /**
         * X offset of the button row.
         */
        x: 0,
        /**
         * Y offset of the button row.
         */
        y: 0
    },
    /**
     * CSS for the HTML inputs in the range selector.
     *
     * In styled mode, the inputs are styled by the
     * `.highcharts-range-input text` rule in SVG mode, and
     * `input.highcharts-range-selector` when active.
     *
     * @sample {highstock} stock/rangeselector/styling/
     *         Styling the buttons and inputs
     *
     * @type      {Highcharts.CSSObject}
     * @apioption rangeSelector.inputStyle
     */
    inputStyle: {
        /** @ignore */
        color: "#334eff" /* Palette.highlightColor80 */,
        /** @ignore */
        cursor: 'pointer',
        /** @ignore */
        fontSize: '0.8em'
    },
    /**
     * CSS styles for the labels - the Zoom, From and To texts.
     *
     * In styled mode, the labels are styled by the
     * `.highcharts-range-label` class.
     *
     * @sample {highstock} stock/rangeselector/styling/
     *         Styling the buttons and inputs
     *
     * @type {Highcharts.CSSObject}
     */
    labelStyle: {
        /** @ignore */
        color: "#666666" /* Palette.neutralColor60 */,
        /** @ignore */
        fontSize: '0.8em'
    }
};
/* *
 *
 *  Default Export
 *
 * */
const RangeSelectorDefaults = {
    lang,
    rangeSelector
};
/* harmony default export */ const RangeSelector_RangeSelectorDefaults = (RangeSelectorDefaults);

;// ./code/es-modules/Stock/RangeSelector/RangeSelectorComposition.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { defaultOptions: RangeSelectorComposition_defaultOptions } = (external_highcharts_src_js_default_default());

const { composed: RangeSelectorComposition_composed } = (external_highcharts_src_js_default_default());


const { addEvent: RangeSelectorComposition_addEvent, defined: RangeSelectorComposition_defined, extend: RangeSelectorComposition_extend, isNumber: RangeSelectorComposition_isNumber, merge: RangeSelectorComposition_merge, pick: RangeSelectorComposition_pick, pushUnique: RangeSelectorComposition_pushUnique } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Constants
 *
 * */
const chartDestroyEvents = [];
/* *
 *
 *  Variables
 *
 * */
let RangeSelectorConstructor;
/* *
 *
 *  Functions
 *
 * */
/**
 * Get the axis min value based on the range option and the current max. For
 * stock charts this is extended via the {@link RangeSelector} so that if the
 * selected range is a multiple of months or years, it is compensated for
 * various month lengths.
 *
 * @private
 * @function Highcharts.Axis#minFromRange
 * @return {number|undefined}
 *         The new minimum value.
 */
function axisMinFromRange() {
    const rangeOptions = this.range, type = rangeOptions.type, max = this.max, time = this.chart.time, 
    // Get the true range from a start date
    getTrueRange = function (base, count) {
        const original = time.toParts(base), modified = original.slice();
        if (type === 'year') {
            modified[0] += count;
        }
        else {
            modified[1] += count;
        }
        let d = time.makeTime.apply(time, modified);
        const numbers = time.toParts(d);
        // When subtracting a month still places us in the same month, like
        // subtracting one month from March 31 places us on February 31,
        // which translates to March 3 (#6537)
        if (type === 'month' &&
            original[1] === numbers[1] &&
            Math.abs(count) === 1) {
            modified[0] = original[0];
            modified[1] = original[1];
            // 0 is the last day of the previous month
            modified[2] = 0;
        }
        d = time.makeTime.apply(time, modified);
        return d - base;
    };
    let min, range;
    if (RangeSelectorComposition_isNumber(rangeOptions)) {
        min = max - rangeOptions;
        range = rangeOptions;
    }
    else if (rangeOptions) {
        min = max + getTrueRange(max, -(rangeOptions.count || 1));
        // Let the fixedRange reflect initial settings (#5930)
        if (this.chart) {
            this.chart.setFixedRange(max - min);
        }
    }
    const dataMin = RangeSelectorComposition_pick(this.dataMin, Number.MIN_VALUE);
    if (!RangeSelectorComposition_isNumber(min)) {
        min = dataMin;
    }
    if (min <= dataMin) {
        min = dataMin;
        if (typeof range === 'undefined') { // #4501
            range = getTrueRange(min, rangeOptions.count);
        }
        this.newMax = Math.min(min + range, RangeSelectorComposition_pick(this.dataMax, Number.MAX_VALUE));
    }
    if (!RangeSelectorComposition_isNumber(max)) {
        min = void 0;
    }
    else if (!RangeSelectorComposition_isNumber(rangeOptions) &&
        rangeOptions &&
        rangeOptions._offsetMin) {
        min += rangeOptions._offsetMin;
    }
    return min;
}
/**
 * @private
 */
function updateRangeSelectorButtons() {
    this.rangeSelector?.redrawElements();
}
/**
 * @private
 */
function RangeSelectorComposition_compose(AxisClass, ChartClass, RangeSelectorClass) {
    RangeSelectorConstructor = RangeSelectorClass;
    if (RangeSelectorComposition_pushUnique(RangeSelectorComposition_composed, 'RangeSelector')) {
        const chartProto = ChartClass.prototype;
        AxisClass.prototype.minFromRange = axisMinFromRange;
        RangeSelectorComposition_addEvent(ChartClass, 'afterGetContainer', createRangeSelector);
        RangeSelectorComposition_addEvent(ChartClass, 'beforeRender', RangeSelectorComposition_onChartBeforeRender);
        RangeSelectorComposition_addEvent(ChartClass, 'destroy', onChartDestroy);
        RangeSelectorComposition_addEvent(ChartClass, 'getMargins', onChartGetMargins);
        RangeSelectorComposition_addEvent(ChartClass, 'redraw', redrawRangeSelector);
        RangeSelectorComposition_addEvent(ChartClass, 'update', RangeSelectorComposition_onChartUpdate);
        RangeSelectorComposition_addEvent(ChartClass, 'beforeRedraw', updateRangeSelectorButtons);
        chartProto.callbacks.push(redrawRangeSelector);
        RangeSelectorComposition_extend(RangeSelectorComposition_defaultOptions, { rangeSelector: RangeSelector_RangeSelectorDefaults.rangeSelector });
        RangeSelectorComposition_extend(RangeSelectorComposition_defaultOptions.lang, RangeSelector_RangeSelectorDefaults.lang);
    }
}
/**
 * Initialize rangeselector for stock charts
 * @private
 */
function createRangeSelector() {
    if (this.options.rangeSelector &&
        this.options.rangeSelector.enabled) {
        this.rangeSelector = new RangeSelectorConstructor(this);
    }
}
/**
 * @private
 */
function RangeSelectorComposition_onChartBeforeRender() {
    const chart = this, rangeSelector = chart.rangeSelector;
    if (rangeSelector) {
        if (RangeSelectorComposition_isNumber(rangeSelector.deferredYTDClick)) {
            rangeSelector.clickButton(rangeSelector.deferredYTDClick);
            delete rangeSelector.deferredYTDClick;
        }
        const verticalAlign = rangeSelector.options.verticalAlign;
        if (!rangeSelector.options.floating) {
            if (verticalAlign === 'bottom') {
                this.extraBottomMargin = true;
            }
            else if (verticalAlign === 'top') {
                this.extraTopMargin = true;
            }
        }
    }
}
function redrawRangeSelector() {
    const chart = this;
    const rangeSelector = this.rangeSelector;
    if (!rangeSelector) {
        return;
    }
    let alignTo;
    const extremes = chart.xAxis[0].getExtremes();
    const legend = chart.legend;
    const verticalAlign = (rangeSelector &&
        rangeSelector.options.verticalAlign);
    if (RangeSelectorComposition_isNumber(extremes.min)) {
        rangeSelector.render(extremes.min, extremes.max);
    }
    // Re-align the legend so that it's below the rangeselector
    if (legend.display &&
        verticalAlign === 'top' &&
        verticalAlign === legend.options.verticalAlign) {
        // Create a new alignment box for the legend.
        alignTo = RangeSelectorComposition_merge(chart.spacingBox);
        if (legend.options.layout === 'vertical') {
            alignTo.y = chart.plotTop;
        }
        else {
            alignTo.y += rangeSelector.getHeight();
        }
        legend.group.placed = false; // Don't animate the alignment.
        legend.align(alignTo);
    }
}
/**
 * Remove resize/afterSetExtremes at chart destroy.
 * @private
 */
function onChartDestroy() {
    for (let i = 0, iEnd = chartDestroyEvents.length; i < iEnd; ++i) {
        const events = chartDestroyEvents[i];
        if (events[0] === this) {
            events[1].forEach((unbind) => unbind());
            chartDestroyEvents.splice(i, 1);
            return;
        }
    }
}
/**
 *
 */
function onChartGetMargins() {
    const rangeSelector = this.rangeSelector;
    if (rangeSelector?.options?.enabled) {
        const rangeSelectorHeight = rangeSelector.getHeight();
        const verticalAlign = rangeSelector.options.verticalAlign;
        if (!rangeSelector.options.floating) {
            if (verticalAlign === 'bottom') {
                this.marginBottom += rangeSelectorHeight;
            }
            else if (verticalAlign !== 'middle') {
                this.plotTop += rangeSelectorHeight;
            }
        }
    }
}
/**
 * @private
 */
function RangeSelectorComposition_onChartUpdate(e) {
    const chart = this, options = e.options, optionsRangeSelector = options.rangeSelector, extraBottomMarginWas = this.extraBottomMargin, extraTopMarginWas = this.extraTopMargin;
    let rangeSelector = chart.rangeSelector;
    if (optionsRangeSelector &&
        optionsRangeSelector.enabled &&
        !RangeSelectorComposition_defined(rangeSelector) &&
        this.options.rangeSelector) {
        this.options.rangeSelector.enabled = true;
        this.rangeSelector = rangeSelector = new RangeSelectorConstructor(this);
    }
    this.extraBottomMargin = false;
    this.extraTopMargin = false;
    if (rangeSelector) {
        const verticalAlign = (optionsRangeSelector &&
            optionsRangeSelector.verticalAlign) || (rangeSelector.options && rangeSelector.options.verticalAlign);
        if (!rangeSelector.options.floating) {
            if (verticalAlign === 'bottom') {
                this.extraBottomMargin = true;
            }
            else if (verticalAlign !== 'middle') {
                this.extraTopMargin = true;
            }
        }
        if (this.extraBottomMargin !== extraBottomMarginWas ||
            this.extraTopMargin !== extraTopMarginWas) {
            this.isDirtyBox = true;
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
const RangeSelectorComposition = {
    compose: RangeSelectorComposition_compose
};
/* harmony default export */ const RangeSelector_RangeSelectorComposition = (RangeSelectorComposition);

;// external ["../highcharts.src.js","default","SVGElement"]
const external_highcharts_src_js_default_SVGElement_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].SVGElement;
var external_highcharts_src_js_default_SVGElement_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_SVGElement_namespaceObject);
;// external ["../highcharts.src.js","default","Templating"]
const external_highcharts_src_js_default_Templating_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].Templating;
var external_highcharts_src_js_default_Templating_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_Templating_namespaceObject);
;// ./code/es-modules/Data/ColumnUtils.js
/* *
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
/**
 * Utility functions for columns that can be either arrays or typed arrays.
 * @private
 */
var ColumnUtils;
(function (ColumnUtils) {
    /* *
    *
    *  Declarations
    *
    * */
    /* *
    *
    * Functions
    *
    * */
    /**
     * Sets the length of the column array.
     *
     * @param {DataTable.Column} column
     * Column to be modified.
     *
     * @param {number} length
     * New length of the column.
     *
     * @param {boolean} asSubarray
     * If column is a typed array, return a subarray instead of a new array. It
     * is faster `O(1)`, but the entire buffer will be kept in memory until all
     * views to it are destroyed. Default is `false`.
     *
     * @return {DataTable.Column}
     * Modified column.
     *
     * @private
     */
    function setLength(column, length, asSubarray) {
        if (Array.isArray(column)) {
            column.length = length;
            return column;
        }
        return column[asSubarray ? 'subarray' : 'slice'](0, length);
    }
    ColumnUtils.setLength = setLength;
    /**
     * Splices a column array.
     *
     * @param {DataTable.Column} column
     * Column to be modified.
     *
     * @param {number} start
     * Index at which to start changing the array.
     *
     * @param {number} deleteCount
     * An integer indicating the number of old array elements to remove.
     *
     * @param {boolean} removedAsSubarray
     * If column is a typed array, return a subarray instead of a new array. It
     * is faster `O(1)`, but the entire buffer will be kept in memory until all
     * views to it are destroyed. Default is `true`.
     *
     * @param {Array<number>|TypedArray} items
     * The elements to add to the array, beginning at the start index. If you
     * don't specify any elements, `splice()` will only remove elements from the
     * array.
     *
     * @return {SpliceResult}
     * Object containing removed elements and the modified column.
     *
     * @private
     */
    function splice(column, start, deleteCount, removedAsSubarray, items = []) {
        if (Array.isArray(column)) {
            if (!Array.isArray(items)) {
                items = Array.from(items);
            }
            return {
                removed: column.splice(start, deleteCount, ...items),
                array: column
            };
        }
        const Constructor = Object.getPrototypeOf(column)
            .constructor;
        const removed = column[removedAsSubarray ? 'subarray' : 'slice'](start, start + deleteCount);
        const newLength = column.length - deleteCount + items.length;
        const result = new Constructor(newLength);
        result.set(column.subarray(0, start), 0);
        result.set(items, start);
        result.set(column.subarray(start + deleteCount), start + items.length);
        return {
            removed: removed,
            array: result
        };
    }
    ColumnUtils.splice = splice;
})(ColumnUtils || (ColumnUtils = {}));
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Data_ColumnUtils = (ColumnUtils);

;// ./code/es-modules/Data/DataTableCore.js
/* *
 *
 *  (c) 2009-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Sophie Bremer
 *  - Gøran Slettemark
 *  - Torstein Hønsi
 *
 * */


const { setLength, splice } = Data_ColumnUtils;

const { fireEvent: DataTableCore_fireEvent, objectEach: DataTableCore_objectEach, uniqueKey } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Class
 *
 * */
/**
 * Class to manage columns and rows in a table structure. It provides methods
 * to add, remove, and manipulate columns and rows, as well as to retrieve data
 * from specific cells.
 *
 * @class
 * @name Highcharts.DataTable
 *
 * @param {Highcharts.DataTableOptions} [options]
 * Options to initialize the new DataTable instance.
 */
class DataTableCore {
    /**
     * Constructs an instance of the DataTable class.
     *
     * @example
     * const dataTable = new Highcharts.DataTableCore({
     *   columns: {
     *     year: [2020, 2021, 2022, 2023],
     *     cost: [11, 13, 12, 14],
     *     revenue: [12, 15, 14, 18]
     *   }
     * });

     *
     * @param {Highcharts.DataTableOptions} [options]
     * Options to initialize the new DataTable instance.
     */
    constructor(options = {}) {
        /**
         * Whether the ID was automatic generated or given in the constructor.
         *
         * @name Highcharts.DataTable#autoId
         * @type {boolean}
         */
        this.autoId = !options.id;
        this.columns = {};
        /**
         * ID of the table for identification purposes.
         *
         * @name Highcharts.DataTable#id
         * @type {string}
         */
        this.id = (options.id || uniqueKey());
        this.modified = this;
        this.rowCount = 0;
        this.versionTag = uniqueKey();
        let rowCount = 0;
        DataTableCore_objectEach(options.columns || {}, (column, columnName) => {
            this.columns[columnName] = column.slice();
            rowCount = Math.max(rowCount, column.length);
        });
        this.applyRowCount(rowCount);
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Applies a row count to the table by setting the `rowCount` property and
     * adjusting the length of all columns.
     *
     * @private
     * @param {number} rowCount The new row count.
     */
    applyRowCount(rowCount) {
        this.rowCount = rowCount;
        DataTableCore_objectEach(this.columns, (column, columnName) => {
            if (column.length !== rowCount) {
                this.columns[columnName] = setLength(column, rowCount);
            }
        });
    }
    /**
     * Delete rows. Simplified version of the full
     * `DataTable.deleteRows` method.
     *
     * @param {number} rowIndex
     * The start row index
     *
     * @param {number} [rowCount=1]
     * The number of rows to delete
     *
     * @return {void}
     *
     * @emits #afterDeleteRows
     */
    deleteRows(rowIndex, rowCount = 1) {
        if (rowCount > 0 && rowIndex < this.rowCount) {
            let length = 0;
            DataTableCore_objectEach(this.columns, (column, columnName) => {
                this.columns[columnName] =
                    splice(column, rowIndex, rowCount).array;
                length = column.length;
            });
            this.rowCount = length;
        }
        DataTableCore_fireEvent(this, 'afterDeleteRows', { rowIndex, rowCount });
        this.versionTag = uniqueKey();
    }
    /**
     * Fetches the given column by the canonical column name. Simplified version
     * of the full `DataTable.getRow` method, always returning by reference.
     *
     * @param {string} columnName
     * Name of the column to get.
     *
     * @return {Highcharts.DataTableColumn|undefined}
     * A copy of the column, or `undefined` if not found.
     */
    getColumn(columnName, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asReference) {
        return this.columns[columnName];
    }
    /**
     * Retrieves all or the given columns. Simplified version of the full
     * `DataTable.getColumns` method, always returning by reference.
     *
     * @param {Array<string>} [columnNames]
     * Column names to retrieve.
     *
     * @return {Highcharts.DataTableColumnCollection}
     * Collection of columns. If a requested column was not found, it is
     * `undefined`.
     */
    getColumns(columnNames, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asReference) {
        return (columnNames || Object.keys(this.columns)).reduce((columns, columnName) => {
            columns[columnName] = this.columns[columnName];
            return columns;
        }, {});
    }
    /**
     * Retrieves the row at a given index.
     *
     * @param {number} rowIndex
     * Row index to retrieve. First row has index 0.
     *
     * @param {Array<string>} [columnNames]
     * Column names to retrieve.
     *
     * @return {Record<string, number|string|undefined>|undefined}
     * Returns the row values, or `undefined` if not found.
     */
    getRow(rowIndex, columnNames) {
        return (columnNames || Object.keys(this.columns)).map((key) => this.columns[key]?.[rowIndex]);
    }
    /**
     * Sets cell values for a column. Will insert a new column, if not found.
     *
     * @param {string} columnName
     * Column name to set.
     *
     * @param {Highcharts.DataTableColumn} [column]
     * Values to set in the column.
     *
     * @param {number} [rowIndex]
     * Index of the first row to change. (Default: 0)
     *
     * @param {Record<string, (boolean|number|string|null|undefined)>} [eventDetail]
     * Custom information for pending events.
     *
     * @emits #setColumns
     * @emits #afterSetColumns
     */
    setColumn(columnName, column = [], rowIndex = 0, eventDetail) {
        this.setColumns({ [columnName]: column }, rowIndex, eventDetail);
    }
    /**
     * Sets cell values for multiple columns. Will insert new columns, if not
     * found. Simplified version of the full `DataTableCore.setColumns`, limited
     * to full replacement of the columns (undefined `rowIndex`).
     *
     * @param {Highcharts.DataTableColumnCollection} columns
     * Columns as a collection, where the keys are the column names.
     *
     * @param {number} [rowIndex]
     * Index of the first row to change. Ignored in the `DataTableCore`, as it
     * always replaces the full column.
     *
     * @param {Record<string, (boolean|number|string|null|undefined)>} [eventDetail]
     * Custom information for pending events.
     *
     * @emits #setColumns
     * @emits #afterSetColumns
     */
    setColumns(columns, rowIndex, eventDetail) {
        let rowCount = this.rowCount;
        DataTableCore_objectEach(columns, (column, columnName) => {
            this.columns[columnName] = column.slice();
            rowCount = column.length;
        });
        this.applyRowCount(rowCount);
        if (!eventDetail?.silent) {
            DataTableCore_fireEvent(this, 'afterSetColumns');
            this.versionTag = uniqueKey();
        }
    }
    /**
     * Sets cell values of a row. Will insert a new row if no index was
     * provided, or if the index is higher than the total number of table rows.
     * A simplified version of the full `DateTable.setRow`, limited to objects.
     *
     * @param {Record<string, number|string|undefined>} row
     * Cell values to set.
     *
     * @param {number} [rowIndex]
     * Index of the row to set. Leave `undefined` to add as a new row.
     *
     * @param {boolean} [insert]
     * Whether to insert the row at the given index, or to overwrite the row.
     *
     * @param {Record<string, (boolean|number|string|null|undefined)>} [eventDetail]
     * Custom information for pending events.
     *
     * @emits #afterSetRows
     */
    setRow(row, rowIndex = this.rowCount, insert, eventDetail) {
        const { columns } = this, indexRowCount = insert ? this.rowCount + 1 : rowIndex + 1;
        DataTableCore_objectEach(row, (cellValue, columnName) => {
            let column = columns[columnName] ||
                eventDetail?.addColumns !== false && new Array(indexRowCount);
            if (column) {
                if (insert) {
                    column = splice(column, rowIndex, 0, true, [cellValue]).array;
                }
                else {
                    column[rowIndex] = cellValue;
                }
                columns[columnName] = column;
            }
        });
        if (indexRowCount > this.rowCount) {
            this.applyRowCount(indexRowCount);
        }
        if (!eventDetail?.silent) {
            DataTableCore_fireEvent(this, 'afterSetRows');
            this.versionTag = uniqueKey();
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Data_DataTableCore = (DataTableCore);
/* *
 *
 *  API Declarations
 *
 * */
/**
 * A typed array.
 * @typedef {Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} Highcharts.TypedArray
 * //**
 * A column of values in a data table.
 * @typedef {Array<boolean|null|number|string|undefined>|Highcharts.TypedArray} Highcharts.DataTableColumn
 */ /**
* A collection of data table columns defined by a object where the key is the
* column name and the value is an array of the column values.
* @typedef {Record<string, Highcharts.DataTableColumn>} Highcharts.DataTableColumnCollection
*/
/**
 * Options for the `DataTable` or `DataTableCore` classes.
 * @interface Highcharts.DataTableOptions
 */ /**
* The column options for the data table. The columns are defined by an object
* where the key is the column ID and the value is an array of the column
* values.
*
* @name Highcharts.DataTableOptions.columns
* @type {Highcharts.DataTableColumnCollection|undefined}
*/ /**
* Custom ID to identify the new DataTable instance.
*
* @name Highcharts.DataTableOptions.id
* @type {string|undefined}
*/
(''); // Keeps doclets above in JS file

;// ./code/es-modules/Core/Axis/OrdinalAxis.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */





const { addEvent: OrdinalAxis_addEvent, correctFloat: OrdinalAxis_correctFloat, css, defined: OrdinalAxis_defined, error: OrdinalAxis_error, isNumber: OrdinalAxis_isNumber, pick: OrdinalAxis_pick, timeUnits, isString } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Composition
 *
 * */
/**
 * Extends the axis with ordinal support.
 * @private
 */
var OrdinalAxis;
(function (OrdinalAxis) {
    /* *
     *
     *  Declarations
     *
     * */
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Extends the axis with ordinal support.
     *
     * @private
     *
     * @param AxisClass
     * Axis class to extend.
     *
     * @param ChartClass
     * Chart class to use.
     *
     * @param SeriesClass
     * Series class to use.
     */
    function compose(AxisClass, SeriesClass, ChartClass) {
        const axisProto = AxisClass.prototype;
        if (!axisProto.ordinal2lin) {
            axisProto.getTimeTicks = getTimeTicks;
            axisProto.index2val = index2val;
            axisProto.lin2val = lin2val;
            axisProto.val2lin = val2lin;
            // Record this to prevent overwriting by broken-axis module (#5979)
            axisProto.ordinal2lin = axisProto.val2lin;
            OrdinalAxis_addEvent(AxisClass, 'afterInit', onAxisAfterInit);
            OrdinalAxis_addEvent(AxisClass, 'foundExtremes', onAxisFoundExtremes);
            OrdinalAxis_addEvent(AxisClass, 'afterSetScale', onAxisAfterSetScale);
            OrdinalAxis_addEvent(AxisClass, 'initialAxisTranslation', onAxisInitialAxisTranslation);
            OrdinalAxis_addEvent(ChartClass, 'pan', onChartPan);
            OrdinalAxis_addEvent(ChartClass, 'touchpan', onChartPan);
            OrdinalAxis_addEvent(SeriesClass, 'updatedData', onSeriesUpdatedData);
        }
        return AxisClass;
    }
    OrdinalAxis.compose = compose;
    /**
     * In an ordinal axis, there might be areas with dense concentrations of
     * points, then large gaps between some. Creating equally distributed
     * ticks over this entire range may lead to a huge number of ticks that
     * will later be removed. So instead, break the positions up in
     * segments, find the tick positions for each segment then concatenize
     * them. This method is used from both data grouping logic and X axis
     * tick position logic.
     * @private
     */
    function getTimeTicks(normalizedInterval, min, max, startOfWeek, positions = [], closestDistance = 0, findHigherRanks) {
        const higherRanks = {}, tickPixelIntervalOption = this.options.tickPixelInterval, time = this.chart.time, 
        // Record all the start positions of a segment, to use when
        // deciding what's a gap in the data.
        segmentStarts = [];
        let end, segmentPositions, hasCrossedHigherRank, info, outsideMax, start = 0, groupPositions = [], lastGroupPosition = -Number.MAX_VALUE;
        // The positions are not always defined, for example for ordinal
        // positions when data has regular interval (#1557, #2090)
        if ((!this.options.ordinal && !this.options.breaks) ||
            !positions ||
            positions.length < 3 ||
            typeof min === 'undefined') {
            return time.getTimeTicks.apply(time, arguments);
        }
        // Analyze the positions array to split it into segments on gaps
        // larger than 5 times the closest distance. The closest distance is
        // already found at this point, so we reuse that instead of
        // computing it again.
        const posLength = positions.length;
        for (end = 0; end < posLength; end++) {
            outsideMax = end && positions[end - 1] > max;
            if (positions[end] < min) { // Set the last position before min
                start = end;
            }
            if (end === posLength - 1 ||
                positions[end + 1] - positions[end] > closestDistance * 5 ||
                outsideMax) {
                // For each segment, calculate the tick positions from the
                // getTimeTicks utility function. The interval will be the
                // same regardless of how long the segment is.
                if (positions[end] > lastGroupPosition) { // #1475
                    segmentPositions = time.getTimeTicks(normalizedInterval, positions[start], positions[end], startOfWeek);
                    // Prevent duplicate groups, for example for multiple
                    // segments within one larger time frame (#1475)
                    while (segmentPositions.length &&
                        segmentPositions[0] <= lastGroupPosition) {
                        segmentPositions.shift();
                    }
                    if (segmentPositions.length) {
                        lastGroupPosition =
                            segmentPositions[segmentPositions.length - 1];
                    }
                    segmentStarts.push(groupPositions.length);
                    groupPositions = groupPositions.concat(segmentPositions);
                }
                // Set start of next segment
                start = end + 1;
            }
            if (outsideMax) {
                break;
            }
        }
        // Get the grouping info from the last of the segments. The info is
        // the same for all segments.
        if (segmentPositions) {
            info = segmentPositions.info;
            // Optionally identify ticks with higher rank, for example
            // when the ticks have crossed midnight.
            if (findHigherRanks && info.unitRange <= timeUnits.hour) {
                end = groupPositions.length - 1;
                // Compare points two by two
                for (start = 1; start < end; start++) {
                    if (time.dateFormat('%d', groupPositions[start]) !==
                        time.dateFormat('%d', groupPositions[start - 1])) {
                        higherRanks[groupPositions[start]] = 'day';
                        hasCrossedHigherRank = true;
                    }
                }
                // If the complete array has crossed midnight, we want
                // to mark the first positions also as higher rank
                if (hasCrossedHigherRank) {
                    higherRanks[groupPositions[0]] = 'day';
                }
                info.higherRanks = higherRanks;
            }
            // Save the info
            info.segmentStarts = segmentStarts;
            groupPositions.info = info;
        }
        else {
            OrdinalAxis_error(12, false, this.chart);
        }
        // Don't show ticks within a gap in the ordinal axis, where the
        // space between two points is greater than a portion of the tick
        // pixel interval
        if (findHigherRanks && OrdinalAxis_defined(tickPixelIntervalOption)) {
            const length = groupPositions.length, translatedArr = [], distances = [];
            let itemToRemove, translated, lastTranslated, medianDistance, distance, i = length;
            // Find median pixel distance in order to keep a reasonably even
            // distance between ticks (#748)
            while (i--) {
                translated = this.translate(groupPositions[i]);
                if (lastTranslated) {
                    distances[i] = lastTranslated - translated;
                }
                translatedArr[i] = lastTranslated = translated;
            }
            distances.sort((a, b) => a - b);
            medianDistance = distances[Math.floor(distances.length / 2)];
            if (medianDistance < tickPixelIntervalOption * 0.6) {
                medianDistance = null;
            }
            // Now loop over again and remove ticks where needed
            i = groupPositions[length - 1] > max ? length - 1 : length; // #817
            lastTranslated = void 0;
            while (i--) {
                translated = translatedArr[i];
                distance = Math.abs(lastTranslated - translated);
                // #4175 - when axis is reversed, the distance, is negative but
                // tickPixelIntervalOption positive, so we need to compare the
                // same values
                // Remove ticks that are closer than 0.6 times the pixel
                // interval from the one to the right, but not if it is close to
                // the median distance (#748).
                if (lastTranslated &&
                    distance < tickPixelIntervalOption * 0.8 &&
                    (medianDistance === null || distance < medianDistance * 0.8)) {
                    // Is this a higher ranked position with a normal
                    // position to the right?
                    if (higherRanks[groupPositions[i]] &&
                        !higherRanks[groupPositions[i + 1]]) {
                        // Yes: remove the lower ranked neighbour to the
                        // right
                        itemToRemove = i + 1;
                        lastTranslated = translated; // #709
                    }
                    else {
                        // No: remove this one
                        itemToRemove = i;
                    }
                    groupPositions.splice(itemToRemove, 1);
                }
                else {
                    lastTranslated = translated;
                }
            }
        }
        return groupPositions;
    }
    /**
     * Get axis position of given index of the extended ordinal positions.
     * Used only when panning an ordinal axis.
     *
     * @private
     * @function Highcharts.Axis#index2val
     * @param {number} index
     * The index value of searched point
     */
    function index2val(index) {
        const axis = this, ordinal = axis.ordinal, 
        // Context could be changed to extendedOrdinalPositions.
        ordinalPositions = ordinal.positions;
        // The visible range contains only equally spaced values.
        if (!ordinalPositions) {
            return index;
        }
        let i = ordinalPositions.length - 1, distance;
        if (index < 0) { // Out of range, in effect panning to the left
            index = ordinalPositions[0];
        }
        else if (index > i) { // Out of range, panning to the right
            index = ordinalPositions[i];
        }
        else { // Split it up
            i = Math.floor(index);
            distance = index - i; // The decimal
        }
        if (typeof distance !== 'undefined' &&
            typeof ordinalPositions[i] !== 'undefined') {
            return ordinalPositions[i] + (distance ?
                distance *
                    (ordinalPositions[i + 1] - ordinalPositions[i]) :
                0);
        }
        return index;
    }
    /**
     * Translate from linear (internal) to axis value.
     *
     * @private
     * @function Highcharts.Axis#lin2val
     * @param {number} val
     * The linear abstracted value.
     */
    function lin2val(val) {
        const axis = this, ordinal = axis.ordinal, localMin = axis.old ? axis.old.min : axis.min, localA = axis.old ? axis.old.transA : axis.transA;
        // Always use extendedPositions (#19816)
        const positions = ordinal.getExtendedPositions();
        // In some cases (especially in early stages of the chart creation) the
        // getExtendedPositions might return undefined.
        if (positions?.length) {
            // Convert back from modivied value to pixels. // #15970
            const pixelVal = OrdinalAxis_correctFloat((val - localMin) * localA +
                axis.minPixelPadding), index = OrdinalAxis_correctFloat(ordinal.getIndexOfPoint(pixelVal, positions)), mantissa = OrdinalAxis_correctFloat(index % 1);
            // Check if the index is inside position array. If true,
            // read/approximate value for that exact index.
            if (index >= 0 && index <= positions.length - 1) {
                const leftNeighbour = positions[Math.floor(index)], rightNeighbour = positions[Math.ceil(index)], distance = rightNeighbour - leftNeighbour;
                return positions[Math.floor(index)] + mantissa * distance;
            }
        }
        // If the value is outside positions array, return initial value
        return val; // #16784
    }
    /**
     * Internal function to calculate the precise index in ordinalPositions
     * array.
     * @private
     */
    function getIndexInArray(ordinalPositions, val) {
        const index = OrdinalAxis.Additions.findIndexOf(ordinalPositions, val, true);
        if (ordinalPositions[index] === val) {
            return index;
        }
        const percent = (val - ordinalPositions[index]) /
            (ordinalPositions[index + 1] - ordinalPositions[index]);
        return index + percent;
    }
    /**
    * @private
    */
    function onAxisAfterInit() {
        const axis = this;
        if (!axis.ordinal) {
            axis.ordinal = new OrdinalAxis.Additions(axis);
        }
    }
    /**
     * @private
     */
    function onAxisFoundExtremes() {
        const axis = this, { eventArgs, options } = axis;
        if (axis.isXAxis &&
            OrdinalAxis_defined(options.overscroll) &&
            options.overscroll !== 0 &&
            OrdinalAxis_isNumber(axis.max) &&
            OrdinalAxis_isNumber(axis.min)) {
            if (axis.options.ordinal && !axis.ordinal.originalOrdinalRange) {
                // Calculate the original ordinal range
                axis.ordinal.getExtendedPositions(false);
            }
            if (axis.max === axis.dataMax &&
                (
                // Panning is an exception. We don't want to apply
                // overscroll when panning over the dataMax
                eventArgs?.trigger !== 'pan' ||
                    axis.isInternal) &&
                // Scrollbar buttons are the other execption
                eventArgs?.trigger !== 'navigator') {
                const overscroll = axis.ordinal.convertOverscroll(options.overscroll);
                axis.max += overscroll;
                // Live data and buttons require translation for the min:
                if (!axis.isInternal &&
                    OrdinalAxis_defined(axis.userMin) &&
                    eventArgs?.trigger !== 'mousewheel') {
                    axis.min += overscroll;
                }
            }
        }
    }
    /**
     * For ordinal axis, that loads data async, redraw axis after data is
     * loaded. If we don't do that, axis will have the same extremes as
     * previously, but ordinal positions won't be calculated. See #10290
     * @private
     */
    function onAxisAfterSetScale() {
        const axis = this;
        if (axis.horiz && !axis.isDirty) {
            axis.isDirty = axis.isOrdinal &&
                axis.chart.navigator &&
                !axis.chart.navigator.adaptToUpdatedData;
        }
    }
    /**
     * @private
     */
    function onAxisInitialAxisTranslation() {
        const axis = this;
        if (axis.ordinal) {
            axis.ordinal.beforeSetTickPositions();
            axis.tickInterval = axis.ordinal.postProcessTickInterval(axis.tickInterval);
        }
    }
    /**
     * Extending the Chart.pan method for ordinal axes
     * @private
     */
    function onChartPan(e) {
        const chart = this, xAxis = chart.xAxis[0], overscroll = xAxis.ordinal.convertOverscroll(xAxis.options.overscroll), chartX = e.originalEvent.chartX, panning = chart.options.chart.panning;
        let runBase = false;
        if (panning?.type !== 'y' &&
            xAxis.options.ordinal &&
            xAxis.series.length &&
            // On touch devices, let default function handle the pinching
            (!e.touches || e.touches.length <= 1)) {
            const mouseDownX = chart.mouseDownX, extremes = xAxis.getExtremes(), dataMin = extremes.dataMin, dataMax = extremes.dataMax, min = extremes.min, max = extremes.max, hoverPoints = chart.hoverPoints, closestPointRange = (xAxis.closestPointRange ||
                xAxis.ordinal?.overscrollPointsRange), pointPixelWidth = (xAxis.translationSlope *
                (xAxis.ordinal.slope || closestPointRange)), 
            // How many ordinal units did we move?
            movedUnits = Math.round((mouseDownX - chartX) / pointPixelWidth), 
            // Get index of all the chart's points
            extendedOrdinalPositions = xAxis.ordinal.getExtendedPositions(), extendedAxis = {
                ordinal: {
                    positions: extendedOrdinalPositions,
                    extendedOrdinalPositions: extendedOrdinalPositions
                }
            }, index2val = xAxis.index2val, val2lin = xAxis.val2lin;
            let trimmedRange, ordinalPositions;
            // Make sure panning to the edges does not decrease the zoomed range
            if ((min <= dataMin && movedUnits <= 0) ||
                (max >= dataMax + overscroll && movedUnits >= 0)) {
                e.preventDefault();
                return;
            }
            // We have an ordinal axis, but the data is equally spaced
            if (!extendedAxis.ordinal.positions) {
                runBase = true;
            }
            else if (Math.abs(movedUnits) > 1) {
                // Remove active points for shared tooltip
                if (hoverPoints) {
                    hoverPoints.forEach(function (point) {
                        point.setState();
                    });
                }
                // In grouped data series, the last ordinal position represents
                // the grouped data, which is to the left of the real data max.
                // If we don't compensate for this, we will be allowed to pan
                // grouped data series passed the right of the plot area.
                ordinalPositions = extendedAxis.ordinal.positions;
                if (overscroll) { // #21606
                    ordinalPositions = extendedAxis.ordinal.positions =
                        ordinalPositions.concat(xAxis.ordinal.getOverscrollPositions());
                }
                if (dataMax > ordinalPositions[ordinalPositions.length - 1]) {
                    ordinalPositions.push(dataMax);
                }
                // Get the new min and max values by getting the ordinal index
                // for the current extreme, then add the moved units and
                // translate back to values. This happens on the extended
                // ordinal positions if the new position is out of range, else
                // it happens on the current x axis which is smaller and faster.
                chart.setFixedRange(max - min);
                trimmedRange = xAxis.navigatorAxis
                    .toFixedRange(void 0, void 0, index2val.apply(extendedAxis, [
                    val2lin.apply(extendedAxis, [min, true]) +
                        movedUnits
                ]), index2val.apply(extendedAxis, [
                    val2lin.apply(extendedAxis, [max, true]) +
                        movedUnits
                ]));
                // Apply it if it is within the available data range
                if (trimmedRange.min >= Math.min(ordinalPositions[0], min) &&
                    trimmedRange.max <= Math.max(ordinalPositions[ordinalPositions.length - 1], max) + overscroll) {
                    xAxis.setExtremes(trimmedRange.min, trimmedRange.max, true, false, { trigger: 'pan' });
                }
                chart.mouseDownX = chartX; // Set new reference for next run
                css(chart.container, { cursor: 'move' });
            }
        }
        else {
            runBase = true;
        }
        // Revert to the linear chart.pan version
        if (runBase || (panning && /y/.test(panning.type))) {
            if (overscroll && OrdinalAxis_isNumber(xAxis.dataMax)) {
                xAxis.max = xAxis.dataMax + overscroll;
            }
        }
        else {
            e.preventDefault();
        }
    }
    /**
     * @private
     */
    function onSeriesUpdatedData() {
        const xAxis = this.xAxis;
        // Destroy the extended ordinal index on updated data
        // and destroy extendedOrdinalPositions, #16055.
        if (xAxis?.options.ordinal) {
            delete xAxis.ordinal.index;
            delete xAxis.ordinal.originalOrdinalRange;
        }
    }
    /**
     * Translate from a linear axis value to the corresponding ordinal axis
     * position. If there are no gaps in the ordinal axis this will be the
     * same. The translated value is the value that the point would have if
     * the axis was linear, using the same min and max.
     *
     * @private
     * @function Highcharts.Axis#val2lin
     * @param {number} val
     * The axis value.
     * @param {boolean} [toIndex]
     * Whether to return the index in the ordinalPositions or the new value.
     */
    function val2lin(val, toIndex) {
        const axis = this, ordinal = axis.ordinal, ordinalPositions = ordinal.positions;
        let slope = ordinal.slope, extendedOrdinalPositions;
        if (!ordinalPositions) {
            return val;
        }
        const ordinalLength = ordinalPositions.length;
        let ordinalIndex;
        // If the searched value is inside visible plotArea, ivastigate the
        // value basing on ordinalPositions.
        if (ordinalPositions[0] <= val &&
            ordinalPositions[ordinalLength - 1] >= val) {
            ordinalIndex = getIndexInArray(ordinalPositions, val);
            // Final return value is based on ordinalIndex
        }
        else {
            extendedOrdinalPositions = ordinal.getExtendedPositions?.();
            if (!extendedOrdinalPositions?.length) {
                return val;
            }
            const length = extendedOrdinalPositions.length;
            if (!slope) {
                slope =
                    (extendedOrdinalPositions[length - 1] -
                        extendedOrdinalPositions[0]) /
                        length;
            }
            // `originalPointReference` is equal to the index of first point of
            // ordinalPositions in extendedOrdinalPositions.
            const originalPositionsReference = getIndexInArray(extendedOrdinalPositions, ordinalPositions[0]);
            // If the searched value is outside the visiblePlotArea,
            // check if it is inside extendedOrdinalPositions.
            if (val >= extendedOrdinalPositions[0] &&
                val <=
                    extendedOrdinalPositions[length - 1]) {
                // Return Value
                ordinalIndex = getIndexInArray(extendedOrdinalPositions, val) -
                    originalPositionsReference;
            }
            else {
                if (!toIndex) {
                    // If the value is outside positions array,
                    // return initial value, #16784
                    return val;
                }
                // Since ordinal.slope is the average distance between 2
                // points on visible plotArea, this can be used to calculate
                // the approximate position of the point, which is outside
                // the extendedOrdinalPositions.
                if (val < extendedOrdinalPositions[0]) {
                    const diff = extendedOrdinalPositions[0] - val, approximateIndexOffset = diff / slope;
                    ordinalIndex =
                        -originalPositionsReference -
                            approximateIndexOffset;
                }
                else {
                    const diff = val -
                        extendedOrdinalPositions[length - 1], approximateIndexOffset = diff / slope;
                    ordinalIndex =
                        approximateIndexOffset +
                            length -
                            originalPositionsReference;
                }
            }
        }
        return toIndex ? ordinalIndex : slope * (ordinalIndex || 0) +
            ordinal.offset;
    }
    /* *
     *
     *  Classes
     *
     * */
    /**
     * @private
     */
    class Additions {
        /* *
         *
         *  Constructors
         *
         * */
        /**
         * @private
         */
        constructor(axis) {
            this.index = {};
            this.axis = axis;
        }
        /* *
        *
        *  Functions
        *
        * */
        /**
         * Calculate the ordinal positions before tick positions are calculated.
         * @private
         */
        beforeSetTickPositions() {
            const axis = this.axis, ordinal = axis.ordinal, extremes = axis.getExtremes(), min = extremes.min, max = extremes.max, hasBreaks = axis.brokenAxis?.hasBreaks, isOrdinal = axis.options.ordinal, overscroll = axis.options.overscroll &&
                axis.ordinal.convertOverscroll(axis.options.overscroll) ||
                0;
            let len, uniqueOrdinalPositions, dist, minIndex, maxIndex, slope, i, ordinalPositions = [], overscrollPointsRange = Number.MAX_VALUE, useOrdinal = false, adjustOrdinalExtremesPoints = false, isBoosted = false;
            // Apply the ordinal logic
            if (isOrdinal || hasBreaks) { // #4167 YAxis is never ordinal ?
                let distanceBetweenPoint = 0;
                axis.series.forEach(function (series, i) {
                    const xData = series.getColumn('x', true);
                    uniqueOrdinalPositions = [];
                    // For an axis with multiple series, check if the distance
                    // between points is identical throughout all series.
                    if (i > 0 &&
                        series.options.id !== 'highcharts-navigator-series' &&
                        xData.length > 1) {
                        adjustOrdinalExtremesPoints = (distanceBetweenPoint !== xData[1] - xData[0]);
                    }
                    distanceBetweenPoint = xData[1] - xData[0];
                    if (series.boosted) {
                        isBoosted = series.boosted;
                    }
                    if (series.reserveSpace() &&
                        (series
                            .takeOrdinalPosition !== false || hasBreaks)) {
                        // Concatenate the processed X data into the existing
                        // positions, or the empty array
                        ordinalPositions = ordinalPositions.concat(xData);
                        len = ordinalPositions.length;
                        // Remove duplicates (#1588)
                        ordinalPositions.sort(function (a, b) {
                            // Without a custom function it is sorted as strings
                            return a - b;
                        });
                        overscrollPointsRange = Math.min(overscrollPointsRange, OrdinalAxis_pick(
                        // Check for a single-point series:
                        series.closestPointRange, overscrollPointsRange));
                        if (len) {
                            i = 0;
                            while (i < len - 1) {
                                if (ordinalPositions[i] !==
                                    ordinalPositions[i + 1]) {
                                    uniqueOrdinalPositions.push(ordinalPositions[i + 1]);
                                }
                                i++;
                            }
                            // Check first item:
                            if (uniqueOrdinalPositions[0] !==
                                ordinalPositions[0]) {
                                uniqueOrdinalPositions.unshift(ordinalPositions[0]);
                            }
                            ordinalPositions = uniqueOrdinalPositions;
                        }
                    }
                });
                if (!axis.ordinal.originalOrdinalRange) {
                    // Calculate current originalOrdinalRange
                    axis.ordinal.originalOrdinalRange =
                        (ordinalPositions.length - 1) * overscrollPointsRange;
                }
                // If the distance between points is not identical throughout
                // all series, remove the first and last ordinal position to
                // avoid enabling ordinal logic when it is not needed, #17405.
                // Only for boosted series because changes are negligible.
                if (adjustOrdinalExtremesPoints && isBoosted) {
                    ordinalPositions.pop();
                    ordinalPositions.shift();
                }
                // Cache the length
                len = ordinalPositions.length;
                // Check if we really need the overhead of mapping axis data
                // against the ordinal positions. If the series consist of
                // evenly spaced data any way, we don't need any ordinal logic.
                if (len > 2) { // Two points have equal distance by default
                    dist = ordinalPositions[1] - ordinalPositions[0];
                    i = len - 1;
                    while (i-- && !useOrdinal) {
                        if (ordinalPositions[i + 1] - ordinalPositions[i] !==
                            dist) {
                            useOrdinal = true;
                        }
                    }
                    // When zooming in on a week, prevent axis padding for
                    // weekends even though the data within the week is evenly
                    // spaced.
                    if (!axis.options.keepOrdinalPadding &&
                        (ordinalPositions[0] - min > dist ||
                            max - overscroll - ordinalPositions[len - 1] >
                                dist)) {
                        useOrdinal = true;
                    }
                }
                else if (axis.options.overscroll) {
                    if (len === 2) {
                        // Exactly two points, distance for overscroll is fixed:
                        overscrollPointsRange =
                            ordinalPositions[1] - ordinalPositions[0];
                    }
                    else if (len === 1) {
                        // We have just one point, closest distance is unknown.
                        // Assume then it is last point and overscrolled range:
                        overscrollPointsRange = overscroll;
                        ordinalPositions = [
                            ordinalPositions[0],
                            ordinalPositions[0] + overscrollPointsRange
                        ];
                    }
                    else {
                        // In case of zooming in on overscrolled range, stick to
                        // the old range:
                        overscrollPointsRange = ordinal.overscrollPointsRange;
                    }
                }
                // Record the slope and offset to compute the linear values from
                // the array index. Since the ordinal positions may exceed the
                // current range, get the start and end positions within it
                // (#719, #665b)
                if (useOrdinal || axis.forceOrdinal) {
                    if (axis.options.overscroll) {
                        ordinal.overscrollPointsRange = overscrollPointsRange;
                        ordinalPositions = ordinalPositions.concat(ordinal.getOverscrollPositions());
                    }
                    // Register
                    ordinal.positions = ordinalPositions;
                    // This relies on the ordinalPositions being set. Use
                    // Math.max and Math.min to prevent padding on either sides
                    // of the data.
                    minIndex = axis.ordinal2lin(// #5979
                    Math.max(min, ordinalPositions[0]), true);
                    maxIndex = Math.max(axis.ordinal2lin(Math.min(max, ordinalPositions[ordinalPositions.length - 1]), true), 1); // #3339
                    // Set the slope and offset of the values compared to the
                    // indices in the ordinal positions.
                    ordinal.slope = slope =
                        (max - min) / (maxIndex - minIndex);
                    ordinal.offset = min - (minIndex * slope);
                }
                else {
                    ordinal.overscrollPointsRange = OrdinalAxis_pick(axis.closestPointRange, ordinal.overscrollPointsRange);
                    ordinal.positions = axis.ordinal.slope = ordinal.offset =
                        void 0;
                }
            }
            axis.isOrdinal = isOrdinal && useOrdinal; // #3818, #4196, #4926
            ordinal.groupIntervalFactor = null; // Reset for next run
        }
        /**
         * Faster way of using the Array.indexOf method.
         * Works for sorted arrays only with unique values.
         *
         * @param {Array} sortedArray
         *        The sorted array inside which we are looking for.
         * @param {number} key
         *        The key to being found.
         * @param {boolean} indirectSearch
         *        In case of lack of the point in the array, should return
         *        value be equal to -1 or the closest smaller index.
         *  @private
         */
        static findIndexOf(sortedArray, key, indirectSearch) {
            let start = 0, end = sortedArray.length - 1, middle;
            while (start < end) {
                middle = Math.ceil((start + end) / 2);
                // Key found as the middle element.
                if (sortedArray[middle] <= key) {
                    // Continue searching to the right.
                    start = middle;
                }
                else {
                    // Continue searching to the left.
                    end = middle - 1;
                }
            }
            if (sortedArray[start] === key) {
                return start;
            }
            // Key could not be found.
            return !indirectSearch ? -1 : start;
        }
        /**
         * Get the ordinal positions for the entire data set. This is necessary
         * in chart panning because we need to find out what points or data
         * groups are available outside the visible range. When a panning
         * operation starts, if an index for the given grouping does not exists,
         * it is created and cached. This index is deleted on updated data, so
         * it will be regenerated the next time a panning operation starts.
         * @private
         */
        getExtendedPositions(withOverscroll = true) {
            const ordinal = this, axis = ordinal.axis, axisProto = axis.constructor.prototype, chart = axis.chart, key = axis.series.reduce((k, series) => {
                const grouping = series.currentDataGrouping;
                return (k +
                    (grouping ? grouping.count + grouping.unitName : 'raw'));
            }, ''), overscroll = withOverscroll ?
                axis.ordinal.convertOverscroll(axis.options.overscroll) : 0, extremes = axis.getExtremes();
            let fakeAxis, fakeSeries = void 0, ordinalIndex = ordinal.index;
            // If this is the first time, or the ordinal index is deleted by
            // updatedData,
            // create it.
            if (!ordinalIndex) {
                ordinalIndex = ordinal.index = {};
            }
            if (!ordinalIndex[key]) {
                // Create a fake axis object where the extended ordinal
                // positions are emulated
                fakeAxis = {
                    series: [],
                    chart: chart,
                    forceOrdinal: false,
                    getExtremes: function () {
                        return {
                            min: extremes.dataMin,
                            max: extremes.dataMax + overscroll
                        };
                    },
                    applyGrouping: axisProto.applyGrouping,
                    getGroupPixelWidth: axisProto.getGroupPixelWidth,
                    getTimeTicks: axisProto.getTimeTicks,
                    options: {
                        ordinal: true
                    },
                    ordinal: {
                        getGroupIntervalFactor: this.getGroupIntervalFactor
                    },
                    ordinal2lin: axisProto.ordinal2lin, // #6276
                    getIndexOfPoint: axisProto.getIndexOfPoint,
                    val2lin: axisProto.val2lin // #2590
                };
                fakeAxis.ordinal.axis = fakeAxis;
                // Add the fake series to hold the full data, then apply
                // processData to it
                axis.series.forEach((series) => {
                    if (series.takeOrdinalPosition === false) {
                        return; // #22657
                    }
                    fakeSeries = {
                        xAxis: fakeAxis,
                        chart: chart,
                        groupPixelWidth: series.groupPixelWidth,
                        destroyGroupedData: (external_highcharts_src_js_default_default()).noop,
                        getColumn: series.getColumn,
                        applyGrouping: series.applyGrouping,
                        getProcessedData: series.getProcessedData,
                        reserveSpace: series.reserveSpace,
                        visible: series.visible
                    };
                    const xData = series.getColumn('x').concat(withOverscroll ?
                        ordinal.getOverscrollPositions() :
                        []);
                    fakeSeries.dataTable = new Data_DataTableCore({
                        columns: {
                            x: xData
                        }
                    });
                    fakeSeries.options = {
                        ...series.options,
                        dataGrouping: series.currentDataGrouping ? {
                            firstAnchor: series.options.dataGrouping?.firstAnchor,
                            anchor: series.options.dataGrouping?.anchor,
                            lastAnchor: series.options.dataGrouping?.firstAnchor,
                            enabled: true,
                            forced: true,
                            approximation: 'open',
                            units: [[
                                    series.currentDataGrouping.unitName,
                                    [series.currentDataGrouping.count]
                                ]]
                        } : {
                            enabled: false
                        }
                    };
                    fakeAxis.series.push(fakeSeries);
                    series.processData.apply(fakeSeries);
                });
                fakeAxis.applyGrouping({ hasExtremesChanged: true });
                // Force to use the ordinal when points are evenly spaced (e.g.
                // weeks), #3825.
                if ((fakeSeries?.closestPointRange !==
                    fakeSeries?.basePointRange) &&
                    fakeSeries.currentDataGrouping) {
                    fakeAxis.forceOrdinal = true;
                }
                // Run beforeSetTickPositions to compute the ordinalPositions
                axis.ordinal.beforeSetTickPositions.apply({ axis: fakeAxis });
                if (!axis.ordinal.originalOrdinalRange &&
                    fakeAxis.ordinal.originalOrdinalRange) {
                    axis.ordinal.originalOrdinalRange =
                        fakeAxis.ordinal.originalOrdinalRange;
                }
                // Cache it
                if (fakeAxis.ordinal.positions) {
                    ordinalIndex[key] = fakeAxis.ordinal.positions;
                }
            }
            return ordinalIndex[key];
        }
        /**
         * Find the factor to estimate how wide the plot area would have been if
         * ordinal gaps were included. This value is used to compute an imagined
         * plot width in order to establish the data grouping interval.
         *
         * A real world case is the intraday-candlestick example. Without this
         * logic, it would show the correct data grouping when viewing a range
         * within each day, but once moving the range to include the gap between
         * two days, the interval would include the cut-away night hours and the
         * data grouping would be wrong. So the below method tries to compensate
         * by identifying the most common point interval, in this case days.
         *
         * An opposite case is presented in issue #718. We have a long array of
         * daily data, then one point is appended one hour after the last point.
         * We expect the data grouping not to change.
         *
         * In the future, if we find cases where this estimation doesn't work
         * optimally, we might need to add a second pass to the data grouping
         * logic, where we do another run with a greater interval if the number
         * of data groups is more than a certain fraction of the desired group
         * count.
         * @private
         */
        getGroupIntervalFactor(xMin, xMax, series) {
            const ordinal = this, processedXData = series.getColumn('x', true), len = processedXData.length, distances = [];
            let median, i, groupIntervalFactor = ordinal.groupIntervalFactor;
            // Only do this computation for the first series, let the other
            // inherit it (#2416)
            if (!groupIntervalFactor) {
                // Register all the distances in an array
                for (i = 0; i < len - 1; i++) {
                    distances[i] = (processedXData[i + 1] -
                        processedXData[i]);
                }
                // Sort them and find the median
                distances.sort(function (a, b) {
                    return a - b;
                });
                median = distances[Math.floor(len / 2)];
                // Compensate for series that don't extend through the entire
                // axis extent. #1675.
                xMin = Math.max(xMin, processedXData[0]);
                xMax = Math.min(xMax, processedXData[len - 1]);
                ordinal.groupIntervalFactor = groupIntervalFactor =
                    (len * median) / (xMax - xMin);
            }
            // Return the factor needed for data grouping
            return groupIntervalFactor;
        }
        /**
         * Get index of point inside the ordinal positions array.
         *
         * @private
         * @param {number} pixelVal
         * The pixel value of a point.
         *
         * @param {Array<number>} [ordinalArray]
         * An array of all points available on the axis for the given data set.
         * Either ordinalPositions if the value is inside the plotArea or
         * extendedOrdinalPositions if not.
         */
        getIndexOfPoint(pixelVal, ordinalArray) {
            const ordinal = this, axis = ordinal.axis, min = axis.min, minX = axis.minPixelPadding, indexOfMin = getIndexInArray(ordinalArray, min);
            const ordinalPointPixelInterval = axis.translationSlope *
                (ordinal.slope ||
                    axis.closestPointRange ||
                    ordinal.overscrollPointsRange);
            const shiftIndex = OrdinalAxis_correctFloat((pixelVal - minX) / ordinalPointPixelInterval);
            return indexOfMin + shiftIndex;
        }
        /**
         * Get ticks for an ordinal axis within a range where points don't
         * exist. It is required when overscroll is enabled. We can't base on
         * points, because we may not have any, so we use approximated
         * pointRange and generate these ticks between Axis.dataMax,
         * Axis.dataMax + Axis.overscroll evenly spaced. Used in panning and
         * navigator scrolling.
         * @private
         */
        getOverscrollPositions() {
            const ordinal = this, axis = ordinal.axis, extraRange = ordinal.convertOverscroll(axis.options.overscroll), distance = ordinal.overscrollPointsRange, positions = [];
            let max = axis.dataMax;
            if (OrdinalAxis_defined(distance)) {
                // Max + pointRange because we need to scroll to the last
                while (max < axis.dataMax + extraRange) {
                    max += distance;
                    positions.push(max);
                }
            }
            return positions;
        }
        /**
         * Make the tick intervals closer because the ordinal gaps make the
         * ticks spread out or cluster.
         * @private
         */
        postProcessTickInterval(tickInterval) {
            // Problem: https://jsfiddle.net/highcharts/FQm4E/1/. This is a case
            // where this algorithm doesn't work optimally. In this case, the
            // tick labels are spread out per week, but all the gaps reside
            // within weeks. So we have a situation where the labels are courser
            // than the ordinal gaps, and thus the tick interval should not be
            // altered.
            const ordinal = this, axis = ordinal.axis, ordinalSlope = ordinal.slope, closestPointRange = axis.closestPointRange;
            let ret;
            if (ordinalSlope && closestPointRange) {
                if (!axis.options.breaks) {
                    ret = (tickInterval /
                        (ordinalSlope / closestPointRange));
                }
                else {
                    ret = closestPointRange || tickInterval; // #7275
                }
            }
            else {
                ret = tickInterval;
            }
            return ret;
        }
        /**
         * If overscroll is pixel or percentage value, convert it to axis range.
         *
         * @private
         * @param {number | string} overscroll
         * Overscroll value in axis range, pixels or percentage value.
         * @return {number}
         * Overscroll value in axis range.
         */
        convertOverscroll(overscroll = 0) {
            const ordinal = this, axis = ordinal.axis, calculateOverscroll = function (overscrollPercentage) {
                return OrdinalAxis_pick(ordinal.originalOrdinalRange, OrdinalAxis_defined(axis.dataMax) && OrdinalAxis_defined(axis.dataMin) ?
                    axis.dataMax - axis.dataMin : 0) * overscrollPercentage;
            };
            if (isString(overscroll)) {
                const overscrollValue = parseInt(overscroll, 10);
                let isFullRange;
                // #22334
                if (OrdinalAxis_defined(axis.min) && OrdinalAxis_defined(axis.max) &&
                    OrdinalAxis_defined(axis.dataMin) && OrdinalAxis_defined(axis.dataMax)) {
                    isFullRange =
                        axis.max - axis.min === axis.dataMax - axis.dataMin;
                    if (!isFullRange) {
                        this.originalOrdinalRange = axis.max - axis.min;
                    }
                }
                if (/%$/.test(overscroll)) {
                    // If overscroll is percentage
                    return calculateOverscroll(overscrollValue / 100);
                }
                if (/px/.test(overscroll)) {
                    // If overscroll is pixels, it is limited to 90% of the axis
                    // length to prevent division by zero
                    const limitedOverscrollValue = Math.min(overscrollValue, axis.len * 0.9), pixelToPercent = limitedOverscrollValue / axis.len;
                    return calculateOverscroll(pixelToPercent /
                        (isFullRange ? (1 - pixelToPercent) : 1));
                }
                // If overscroll is a string but not pixels or percentage,
                // return 0 as no overscroll
                return 0;
            }
            return overscroll;
        }
    }
    OrdinalAxis.Additions = Additions;
})(OrdinalAxis || (OrdinalAxis = {}));
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Axis_OrdinalAxis = (OrdinalAxis);

;// ./code/es-modules/Stock/RangeSelector/RangeSelector.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */



const { defaultOptions: RangeSelector_defaultOptions } = (external_highcharts_src_js_default_default());




const { format } = (external_highcharts_src_js_default_Templating_default());


const { addEvent: RangeSelector_addEvent, createElement, css: RangeSelector_css, defined: RangeSelector_defined, destroyObjectProperties: RangeSelector_destroyObjectProperties, diffObjects, discardElement, extend: RangeSelector_extend, fireEvent: RangeSelector_fireEvent, isNumber: RangeSelector_isNumber, isString: RangeSelector_isString, merge: RangeSelector_merge, objectEach: RangeSelector_objectEach, pick: RangeSelector_pick, splat: RangeSelector_splat } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Functions
 *
 * */
/**
 * Get the preferred input type based on a date format string.
 *
 * @private
 * @function preferredInputType
 */
function preferredInputType(format) {
    const hasTimeKey = (char) => new RegExp(`%[[a-zA-Z]*${char}`).test(format);
    const ms = RangeSelector_isString(format) ?
        format.indexOf('%L') !== -1 :
        // Implemented but not typed as of 2024
        format.fractionalSecondDigits;
    if (ms) {
        return 'text';
    }
    const date = RangeSelector_isString(format) ?
        ['a', 'A', 'd', 'e', 'w', 'b', 'B', 'm', 'o', 'y', 'Y']
            .some(hasTimeKey) :
        format.dateStyle || format.day || format.month || format.year;
    const time = RangeSelector_isString(format) ?
        ['H', 'k', 'I', 'l', 'M', 'S'].some(hasTimeKey) :
        format.timeStyle || format.hour || format.minute || format.second;
    if (date && time) {
        return 'datetime-local';
    }
    if (date) {
        return 'date';
    }
    if (time) {
        return 'time';
    }
    return 'text';
}
/* *
 *
 *  Class
 *
 * */
/**
 * The range selector.
 *
 * @private
 * @class
 * @name Highcharts.RangeSelector
 * @param {Highcharts.Chart} chart
 */
class RangeSelector {
    /* *
     *
     *  Static Functions
     *
     * */
    /**
     * @private
     */
    static compose(AxisClass, ChartClass) {
        RangeSelector_RangeSelectorComposition.compose(AxisClass, ChartClass, RangeSelector);
    }
    /* *
     *
     *  Constructor
     *
     * */
    constructor(chart) {
        this.isDirty = false;
        this.buttonOptions = [];
        this.initialButtonGroupWidth = 0;
        this.maxButtonWidth = () => {
            let buttonWidth = 0;
            this.buttons.forEach((button) => {
                const bBox = button.getBBox();
                if (bBox.width > buttonWidth) {
                    buttonWidth = bBox.width;
                }
            });
            return buttonWidth;
        };
        this.init(chart);
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * The method to run when one of the buttons in the range selectors is
     * clicked
     *
     * @private
     * @function Highcharts.RangeSelector#clickButton
     * @param {number} i
     *        The index of the button
     * @param {boolean} [redraw]
     */
    clickButton(i, redraw) {
        const rangeSelector = this, chart = rangeSelector.chart, rangeOptions = rangeSelector.buttonOptions[i], baseAxis = chart.xAxis[0], unionExtremes = (chart.scroller && chart.scroller.getUnionExtremes()) || baseAxis || {}, type = rangeOptions.type, dataGrouping = rangeOptions.dataGrouping;
        let dataMin = unionExtremes.dataMin, dataMax = unionExtremes.dataMax, newMin, newMax = RangeSelector_isNumber(baseAxis?.max) ? Math.round(Math.min(baseAxis.max, dataMax ?? baseAxis.max)) : void 0, // #1568
        baseXAxisOptions, range = rangeOptions._range, rangeMin, ctx, ytdExtremes, addOffsetMin = true;
        // Chart has no data, base series is removed
        if (dataMin === null || dataMax === null) {
            return;
        }
        rangeSelector.setSelected(i);
        // Apply dataGrouping associated to button
        if (dataGrouping) {
            this.forcedDataGrouping = true;
            external_highcharts_src_js_default_Axis_default().prototype.setDataGrouping.call(baseAxis || { chart: this.chart }, dataGrouping, false);
            this.frozenStates = rangeOptions.preserveDataGrouping;
        }
        // Apply range
        if (type === 'month' || type === 'year') {
            if (!baseAxis) {
                // This is set to the user options and picked up later when the
                // axis is instantiated so that we know the min and max.
                range = rangeOptions;
            }
            else {
                ctx = {
                    range: rangeOptions,
                    max: newMax,
                    chart: chart,
                    dataMin: dataMin,
                    dataMax: dataMax
                };
                newMin = baseAxis.minFromRange.call(ctx);
                if (RangeSelector_isNumber(ctx.newMax)) {
                    newMax = ctx.newMax;
                }
                // #15799: offsetMin is added in minFromRange so that it works
                // with pre-selected buttons as well
                addOffsetMin = false;
            }
            // Fixed times like minutes, hours, days
        }
        else if (range) {
            if (RangeSelector_isNumber(newMax)) {
                newMin = Math.max(newMax - range, dataMin);
                newMax = Math.min(newMin + range, dataMax);
                addOffsetMin = false;
            }
        }
        else if (type === 'ytd') {
            // On user clicks on the buttons, or a delayed action running from
            // the beforeRender event (below), the baseAxis is defined.
            if (baseAxis) {
                // When "ytd" is the pre-selected button for the initial view,
                // its calculation is delayed and rerun in the beforeRender
                // event (below). When the series are initialized, but before
                // the chart is rendered, we have access to the xData array
                // (#942).
                if (baseAxis.hasData() && (!RangeSelector_isNumber(dataMax) ||
                    !RangeSelector_isNumber(dataMin))) {
                    dataMin = Number.MAX_VALUE;
                    dataMax = -Number.MAX_VALUE;
                    chart.series.forEach((series) => {
                        // Reassign it to the last item
                        const xData = series.getColumn('x');
                        if (xData.length) {
                            dataMin = Math.min(xData[0], dataMin);
                            dataMax = Math.max(xData[xData.length - 1], dataMax);
                        }
                    });
                    redraw = false;
                }
                if (RangeSelector_isNumber(dataMax) && RangeSelector_isNumber(dataMin)) {
                    ytdExtremes = rangeSelector.getYTDExtremes(dataMax, dataMin);
                    newMin = rangeMin = ytdExtremes.min;
                    newMax = ytdExtremes.max;
                }
                // "ytd" is pre-selected. We don't yet have access to processed
                // point and extremes data (things like pointStart and pointInterval
                // are missing), so we delay the process (#942)
            }
            else {
                rangeSelector.deferredYTDClick = i;
                return;
            }
        }
        else if (type === 'all' && baseAxis) {
            // If the navigator exist and the axis range is declared reset that
            // range and from now on only use the range set by a user, #14742.
            if (chart.navigator && chart.navigator.baseSeries[0]) {
                chart.navigator.baseSeries[0].xAxis.options.range = void 0;
            }
            newMin = dataMin;
            newMax = dataMax;
        }
        if (addOffsetMin && rangeOptions._offsetMin && RangeSelector_defined(newMin)) {
            newMin += rangeOptions._offsetMin;
        }
        if (rangeOptions._offsetMax && RangeSelector_defined(newMax)) {
            newMax += rangeOptions._offsetMax;
        }
        if (this.dropdown) {
            this.dropdown.selectedIndex = i + 1;
        }
        // Update the chart
        if (!baseAxis) {
            // Axis not yet instantiated. Temporarily set min and range
            // options and axes once defined and remove them on
            // chart load (#4317 & #20529).
            baseXAxisOptions = RangeSelector_splat(chart.options.xAxis || {})[0];
            const axisRangeUpdateEvent = RangeSelector_addEvent(chart, 'afterCreateAxes', function () {
                const xAxis = chart.xAxis[0];
                xAxis.range = xAxis.options.range = range;
                xAxis.min = xAxis.options.min = rangeMin;
            });
            RangeSelector_addEvent(chart, 'load', function resetMinAndRange() {
                const xAxis = chart.xAxis[0];
                chart.setFixedRange(rangeOptions._range);
                xAxis.options.range = baseXAxisOptions.range;
                xAxis.options.min = baseXAxisOptions.min;
                axisRangeUpdateEvent(); // Remove event
            });
        }
        else if (RangeSelector_isNumber(newMin) && RangeSelector_isNumber(newMax)) {
            // Existing axis object. Set extremes after render time.
            baseAxis.setExtremes(newMin, newMax, RangeSelector_pick(redraw, true), void 0, // Auto animation
            {
                trigger: 'rangeSelectorButton',
                rangeSelectorButton: rangeOptions
            });
            chart.setFixedRange(rangeOptions._range);
        }
        RangeSelector_fireEvent(this, 'afterBtnClick');
    }
    /**
     * Set the selected option. This method only sets the internal flag, it
     * doesn't update the buttons or the actual zoomed range.
     *
     * @private
     * @function Highcharts.RangeSelector#setSelected
     * @param {number} [selected]
     */
    setSelected(selected) {
        this.selected = this.options.selected = selected;
    }
    /**
     * Initialize the range selector
     *
     * @private
     * @function Highcharts.RangeSelector#init
     * @param {Highcharts.Chart} chart
     */
    init(chart) {
        const rangeSelector = this, options = chart.options.rangeSelector, langOptions = chart.options.lang, buttonOptions = options.buttons, selectedOption = options.selected, blurInputs = function () {
            const minInput = rangeSelector.minInput, maxInput = rangeSelector.maxInput;
            // #3274 in some case blur is not defined
            if (minInput && !!minInput.blur) {
                RangeSelector_fireEvent(minInput, 'blur');
            }
            if (maxInput && !!maxInput.blur) {
                RangeSelector_fireEvent(maxInput, 'blur');
            }
        };
        rangeSelector.chart = chart;
        rangeSelector.options = options;
        rangeSelector.buttons = [];
        rangeSelector.buttonOptions = buttonOptions
            .map((opt) => {
            if (opt.type && langOptions.rangeSelector) {
                opt.text ?? (opt.text = langOptions.rangeSelector[`${opt.type}Text`]);
                opt.title ?? (opt.title = langOptions.rangeSelector[`${opt.type}Title`]);
            }
            opt.text = format(opt.text, {
                count: opt.count || 1
            });
            opt.title = format(opt.title, {
                count: opt.count || 1
            });
            return opt;
        });
        this.eventsToUnbind = [];
        this.eventsToUnbind.push(RangeSelector_addEvent(chart.container, 'mousedown', blurInputs));
        this.eventsToUnbind.push(RangeSelector_addEvent(chart, 'resize', blurInputs));
        // Extend the buttonOptions with actual range
        buttonOptions.forEach(rangeSelector.computeButtonRange);
        // Zoomed range based on a pre-selected button index
        if (typeof selectedOption !== 'undefined' &&
            buttonOptions[selectedOption]) {
            this.clickButton(selectedOption, false);
        }
        this.eventsToUnbind.push(RangeSelector_addEvent(chart, 'load', function () {
            // If a data grouping is applied to the current button, release it
            // when extremes change
            if (chart.xAxis && chart.xAxis[0]) {
                RangeSelector_addEvent(chart.xAxis[0], 'setExtremes', function (e) {
                    if (RangeSelector_isNumber(this.max) &&
                        RangeSelector_isNumber(this.min) &&
                        this.max - this.min !== chart.fixedRange &&
                        e.trigger !== 'rangeSelectorButton' &&
                        e.trigger !== 'updatedData' &&
                        rangeSelector.forcedDataGrouping &&
                        !rangeSelector.frozenStates) {
                        this.setDataGrouping(false, false);
                    }
                });
            }
        }));
        this.createElements();
    }
    /**
     * Dynamically update the range selector buttons after a new range has been
     * set
     *
     * @private
     * @function Highcharts.RangeSelector#updateButtonStates
     */
    updateButtonStates() {
        const rangeSelector = this, chart = this.chart, dropdown = this.dropdown, dropdownLabel = this.dropdownLabel, baseAxis = chart.xAxis[0], actualRange = Math.round(baseAxis.max - baseAxis.min), hasNoData = !baseAxis.hasVisibleSeries, day = 24 * 36e5, // A single day in milliseconds
        unionExtremes = (chart.scroller &&
            chart.scroller.getUnionExtremes()) || baseAxis, dataMin = unionExtremes.dataMin, dataMax = unionExtremes.dataMax, ytdExtremes = rangeSelector.getYTDExtremes(dataMax, dataMin), ytdMin = ytdExtremes.min, ytdMax = ytdExtremes.max, selected = rangeSelector.selected, allButtonsEnabled = rangeSelector.options.allButtonsEnabled, buttonStates = new Array(rangeSelector.buttonOptions.length)
            .fill(0), selectedExists = RangeSelector_isNumber(selected), buttons = rangeSelector.buttons;
        let isSelectedTooGreat = false, selectedIndex = null;
        rangeSelector.buttonOptions.forEach((rangeOptions, i) => {
            const range = rangeOptions._range, type = rangeOptions.type, count = rangeOptions.count || 1, offsetRange = rangeOptions._offsetMax -
                rangeOptions._offsetMin, isSelected = i === selected, 
            // Disable buttons where the range exceeds what is allowed i;
            // the current view
            isTooGreatRange = range >
                dataMax - dataMin, 
            // Disable buttons where the range is smaller than the minimum
            // range
            isTooSmallRange = range < baseAxis.minRange;
            // Do not select the YTD button if not explicitly told so
            let isYTDButNotSelected = false, 
            // Disable the All button if we're already showing all
            isSameRange = range === actualRange;
            if (isSelected && isTooGreatRange) {
                isSelectedTooGreat = true;
            }
            if (baseAxis.isOrdinal &&
                baseAxis.ordinal?.positions &&
                range &&
                actualRange < range) {
                // Handle ordinal ranges
                const positions = baseAxis.ordinal.positions, prevOrdinalPosition = Axis_OrdinalAxis.Additions.findIndexOf(positions, baseAxis.min, true), nextOrdinalPosition = Math.min(Axis_OrdinalAxis.Additions.findIndexOf(positions, baseAxis.max, true) + 1, positions.length - 1);
                if (positions[nextOrdinalPosition] -
                    positions[prevOrdinalPosition] > range) {
                    isSameRange = true;
                }
            }
            else if (
            // Months and years have variable range so we check the extremes
            (type === 'month' || type === 'year') &&
                (actualRange + 36e5 >=
                    { month: 28, year: 365 }[type] * day * count - offsetRange) &&
                (actualRange - 36e5 <=
                    { month: 31, year: 366 }[type] * day * count + offsetRange)) {
                isSameRange = true;
            }
            else if (type === 'ytd') {
                isSameRange = (ytdMax - ytdMin + offsetRange) === actualRange;
                isYTDButNotSelected = !isSelected;
            }
            else if (type === 'all') {
                isSameRange = (baseAxis.max - baseAxis.min >=
                    dataMax - dataMin);
            }
            // The new zoom area happens to match the range for a button - mark
            // it selected. This happens when scrolling across an ordinal gap.
            // It can be seen in the intraday demos when selecting 1h and scroll
            // across the night gap.
            const disable = (!allButtonsEnabled &&
                !(isSelectedTooGreat && type === 'all') &&
                (isTooGreatRange ||
                    isTooSmallRange ||
                    hasNoData));
            const select = ((isSelectedTooGreat && type === 'all') ||
                (isYTDButNotSelected ? false : isSameRange) ||
                (isSelected && rangeSelector.frozenStates));
            if (disable) {
                buttonStates[i] = 3;
            }
            else if (select) {
                if (!selectedExists || i === selected) {
                    selectedIndex = i;
                }
            }
        });
        if (selectedIndex !== null) {
            buttonStates[selectedIndex] = 2;
            rangeSelector.setSelected(selectedIndex);
            if (this.dropdown) {
                this.dropdown.selectedIndex = selectedIndex + 1;
            }
        }
        else {
            rangeSelector.setSelected();
            if (this.dropdown) {
                this.dropdown.selectedIndex = -1;
            }
            if (dropdownLabel) {
                dropdownLabel.setState(0);
                dropdownLabel.attr({
                    text: (RangeSelector_defaultOptions.lang.rangeSelectorZoom || '') + ' ▾'
                });
            }
        }
        for (let i = 0; i < buttonStates.length; i++) {
            const state = buttonStates[i];
            const button = buttons[i];
            if (button.state !== state) {
                button.setState(state);
                if (dropdown) {
                    dropdown.options[i + 1].disabled = (state === 3);
                    if (state === 2) {
                        if (dropdownLabel) {
                            dropdownLabel.setState(2);
                            dropdownLabel.attr({
                                text: rangeSelector.buttonOptions[i].text + ' ▾'
                            });
                        }
                        dropdown.selectedIndex = i + 1;
                    }
                    const bbox = dropdownLabel.getBBox();
                    RangeSelector_css(dropdown, {
                        width: `${bbox.width}px`,
                        height: `${bbox.height}px`
                    });
                }
            }
        }
    }
    /**
     * Compute and cache the range for an individual button
     *
     * @private
     * @function Highcharts.RangeSelector#computeButtonRange
     * @param {Highcharts.RangeSelectorButtonsOptions} rangeOptions
     */
    computeButtonRange(rangeOptions) {
        const type = rangeOptions.type, count = rangeOptions.count || 1, 
        // These time intervals have a fixed number of milliseconds, as
        // opposed to month, ytd and year
        fixedTimes = {
            millisecond: 1,
            second: 1000,
            minute: 60 * 1000,
            hour: 3600 * 1000,
            day: 24 * 3600 * 1000,
            week: 7 * 24 * 3600 * 1000
        };
        // Store the range on the button object
        if (fixedTimes[type]) {
            rangeOptions._range = fixedTimes[type] * count;
        }
        else if (type === 'month' || type === 'year') {
            rangeOptions._range = {
                month: 30,
                year: 365
            }[type] * 24 * 36e5 * count;
        }
        rangeOptions._offsetMin = RangeSelector_pick(rangeOptions.offsetMin, 0);
        rangeOptions._offsetMax = RangeSelector_pick(rangeOptions.offsetMax, 0);
        rangeOptions._range +=
            rangeOptions._offsetMax - rangeOptions._offsetMin;
    }
    /**
     * Get the unix timestamp of a HTML input for the dates
     *
     * @private
     * @function Highcharts.RangeSelector#getInputValue
     */
    getInputValue(name) {
        const input = name === 'min' ? this.minInput : this.maxInput;
        const options = this.chart.options
            .rangeSelector;
        const time = this.chart.time;
        if (input) {
            return ((input.type === 'text' && options.inputDateParser) ||
                this.defaultInputDateParser)(input.value, time.timezone === 'UTC', time);
        }
        return 0;
    }
    /**
     * Set the internal and displayed value of a HTML input for the dates
     *
     * @private
     * @function Highcharts.RangeSelector#setInputValue
     */
    setInputValue(name, inputTime) {
        const options = this.options, time = this.chart.time, input = name === 'min' ? this.minInput : this.maxInput, dateBox = name === 'min' ? this.minDateBox : this.maxDateBox;
        if (input) {
            input.setAttribute('type', preferredInputType(options.inputDateFormat || '%e %b %Y'));
            const hcTimeAttr = input.getAttribute('data-hc-time');
            let updatedTime = RangeSelector_defined(hcTimeAttr) ? Number(hcTimeAttr) : void 0;
            if (RangeSelector_defined(inputTime)) {
                const previousTime = updatedTime;
                if (RangeSelector_defined(previousTime)) {
                    input.setAttribute('data-hc-time-previous', previousTime);
                }
                input.setAttribute('data-hc-time', inputTime);
                updatedTime = inputTime;
            }
            input.value = time.dateFormat((this.inputTypeFormats[input.type] ||
                options.inputEditDateFormat), updatedTime);
            if (dateBox) {
                dateBox.attr({
                    text: time.dateFormat(options.inputDateFormat, updatedTime)
                });
            }
        }
    }
    /**
     * Set the min and max value of a HTML input for the dates
     *
     * @private
     * @function Highcharts.RangeSelector#setInputExtremes
     */
    setInputExtremes(name, min, max) {
        const input = name === 'min' ? this.minInput : this.maxInput;
        if (input) {
            const format = this.inputTypeFormats[input.type];
            const time = this.chart.time;
            if (format) {
                const newMin = time.dateFormat(format, min);
                if (input.min !== newMin) {
                    input.min = newMin;
                }
                const newMax = time.dateFormat(format, max);
                if (input.max !== newMax) {
                    input.max = newMax;
                }
            }
        }
    }
    /**
     * @private
     * @function Highcharts.RangeSelector#showInput
     * @param {string} name
     */
    showInput(name) {
        const dateBox = name === 'min' ? this.minDateBox : this.maxDateBox, input = name === 'min' ? this.minInput : this.maxInput;
        if (input && dateBox && this.inputGroup) {
            const isTextInput = input.type === 'text', { translateX = 0, translateY = 0 } = this.inputGroup, { x = 0, width = 0, height = 0 } = dateBox, { inputBoxWidth } = this.options;
            RangeSelector_css(input, {
                width: isTextInput ?
                    ((width + (inputBoxWidth ? -2 : 20)) + 'px') :
                    'auto',
                height: (height - 2) + 'px',
                border: '2px solid silver'
            });
            if (isTextInput && inputBoxWidth) {
                RangeSelector_css(input, {
                    left: (translateX + x) + 'px',
                    top: translateY + 'px'
                });
                // Inputs of types date, time or datetime-local should be centered
                // on top of the dateBox
            }
            else {
                RangeSelector_css(input, {
                    left: Math.min(Math.round(x +
                        translateX -
                        (input.offsetWidth - width) / 2), this.chart.chartWidth - input.offsetWidth) + 'px',
                    top: (translateY - (input.offsetHeight - height) / 2) + 'px'
                });
            }
        }
    }
    /**
     * @private
     * @function Highcharts.RangeSelector#hideInput
     * @param {string} name
     */
    hideInput(name) {
        const input = name === 'min' ? this.minInput : this.maxInput;
        if (input) {
            RangeSelector_css(input, {
                top: '-9999em',
                border: 0,
                width: '1px',
                height: '1px'
            });
        }
    }
    /**
     * @private
     * @function Highcharts.RangeSelector#defaultInputDateParser
     */
    defaultInputDateParser(inputDate, useUTC, time) {
        return time?.parse(inputDate) || 0;
    }
    /**
     * Draw either the 'from' or the 'to' HTML input box of the range selector
     *
     * @private
     * @function Highcharts.RangeSelector#drawInput
     */
    drawInput(name) {
        const { chart, div, inputGroup } = this;
        const rangeSelector = this, chartStyle = chart.renderer.style || {}, renderer = chart.renderer, options = chart.options.rangeSelector, lang = RangeSelector_defaultOptions.lang, isMin = name === 'min';
        /**
         * @private
         */
        function updateExtremes(name) {
            const { maxInput, minInput } = rangeSelector, chartAxis = chart.xAxis[0], unionExtremes = chart.scroller?.getUnionExtremes() || chartAxis, dataMin = unionExtremes.dataMin, dataMax = unionExtremes.dataMax, currentExtreme = chart.xAxis[0].getExtremes()[name];
            let value = rangeSelector.getInputValue(name);
            if (RangeSelector_isNumber(value) && value !== currentExtreme) {
                // Validate the extremes. If it goes beyond the data min or
                // max, use the actual data extreme (#2438).
                if (isMin && maxInput && RangeSelector_isNumber(dataMin)) {
                    if (value > Number(maxInput.getAttribute('data-hc-time'))) {
                        value = void 0;
                    }
                    else if (value < dataMin) {
                        value = dataMin;
                    }
                }
                else if (minInput && RangeSelector_isNumber(dataMax)) {
                    if (value < Number(minInput.getAttribute('data-hc-time'))) {
                        value = void 0;
                    }
                    else if (value > dataMax) {
                        value = dataMax;
                    }
                }
                // Set the extremes
                if (typeof value !== 'undefined') { // @todo typeof undefined
                    chartAxis.setExtremes(isMin ? value : chartAxis.min, isMin ? chartAxis.max : value, void 0, void 0, { trigger: 'rangeSelectorInput' });
                }
            }
        }
        // Create the text label
        const text = lang[isMin ? 'rangeSelectorFrom' : 'rangeSelectorTo'] || '';
        const label = renderer
            .label(text, 0)
            .addClass('highcharts-range-label')
            .attr({
            padding: text ? 2 : 0,
            height: text ? options.inputBoxHeight : 0
        })
            .add(inputGroup);
        // Create an SVG label that shows updated date ranges and records click
        // events that bring in the HTML input.
        const dateBox = renderer
            .label('', 0)
            .addClass('highcharts-range-input')
            .attr({
            padding: 2,
            width: options.inputBoxWidth,
            height: options.inputBoxHeight,
            'text-align': 'center'
        })
            .on('click', function () {
            // If it is already focused, the onfocus event doesn't fire
            // (#3713)
            rangeSelector.showInput(name);
            rangeSelector[name + 'Input'].focus();
        });
        if (!chart.styledMode) {
            dateBox.attr({
                stroke: options.inputBoxBorderColor,
                'stroke-width': 1
            });
        }
        dateBox.add(inputGroup);
        // Create the HTML input element. This is rendered as 1x1 pixel then set
        // to the right size when focused.
        const input = createElement('input', {
            name: name,
            className: 'highcharts-range-selector'
        }, void 0, div);
        // #14788: Setting input.type to an unsupported type throws in IE, so
        // we need to use setAttribute instead
        input.setAttribute('type', preferredInputType(options.inputDateFormat || '%e %b %Y'));
        if (!chart.styledMode) {
            // Styles
            label.css(RangeSelector_merge(chartStyle, options.labelStyle));
            dateBox.css(RangeSelector_merge({
                color: "#333333" /* Palette.neutralColor80 */
            }, chartStyle, options.inputStyle));
            RangeSelector_css(input, RangeSelector_extend({
                position: 'absolute',
                border: 0,
                boxShadow: '0 0 15px rgba(0,0,0,0.3)',
                width: '1px', // Chrome needs a pixel to see it
                height: '1px',
                padding: 0,
                textAlign: 'center',
                fontSize: chartStyle.fontSize,
                fontFamily: chartStyle.fontFamily,
                top: '-9999em' // #4798
            }, options.inputStyle));
        }
        // Blow up the input box
        input.onfocus = () => {
            rangeSelector.showInput(name);
        };
        // Hide away the input box
        input.onblur = () => {
            // Update extremes only when inputs are active
            if (input === (external_highcharts_src_js_default_default()).doc.activeElement) { // Only when focused
                // Update also when no `change` event is triggered, like when
                // clicking inside the SVG (#4710)
                updateExtremes(name);
            }
            // #10404 - move hide and blur outside focus
            rangeSelector.hideInput(name);
            rangeSelector.setInputValue(name);
            input.blur(); // #4606
        };
        let keyDown = false;
        // Handle changes in the input boxes
        input.onchange = () => {
            // Update extremes and blur input when clicking date input calendar
            if (!keyDown) {
                updateExtremes(name);
                rangeSelector.hideInput(name);
                input.blur();
            }
        };
        input.onkeypress = (event) => {
            // IE does not fire onchange on enter
            if (event.keyCode === 13) {
                updateExtremes(name);
            }
        };
        input.onkeydown = (event) => {
            keyDown = true;
            // Arrow keys
            if (event.key === 'ArrowUp' ||
                event.key === 'ArrowDown' ||
                event.key === 'Tab') {
                updateExtremes(name);
            }
        };
        input.onkeyup = () => {
            keyDown = false;
        };
        return { dateBox, input, label };
    }
    /**
     * Get the position of the range selector buttons and inputs. This can be
     * overridden from outside for custom positioning.
     *
     * @private
     * @function Highcharts.RangeSelector#getPosition
     */
    getPosition() {
        const chart = this.chart, options = chart.options.rangeSelector, top = options.verticalAlign === 'top' ?
            chart.plotTop - chart.axisOffset[0] :
            0; // Set offset only for verticalAlign top
        return {
            buttonTop: top + options.buttonPosition.y,
            inputTop: top + options.inputPosition.y - 10
        };
    }
    /**
     * Get the extremes of YTD. Will choose dataMax if its value is lower than
     * the current timestamp. Will choose dataMin if its value is higher than
     * the timestamp for the start of current year.
     *
     * @private
     * @function Highcharts.RangeSelector#getYTDExtremes
     * @return {*}
     * Returns min and max for the YTD
     */
    getYTDExtremes(dataMax, dataMin) {
        const time = this.chart.time, year = time.toParts(dataMax)[0], startOfYear = time.makeTime(year, 0);
        return {
            max: dataMax,
            min: Math.max(dataMin, startOfYear)
        };
    }
    createElements() {
        const chart = this.chart, renderer = chart.renderer, container = chart.container, chartOptions = chart.options, options = chartOptions.rangeSelector, inputEnabled = options.inputEnabled, inputsZIndex = RangeSelector_pick(chartOptions.chart.style?.zIndex, 0) + 1;
        if (options.enabled === false) {
            return;
        }
        this.group = renderer.g('range-selector-group')
            .attr({
            zIndex: 7
        })
            .add();
        this.div = createElement('div', void 0, {
            position: 'relative',
            height: 0,
            zIndex: inputsZIndex
        });
        if (this.buttonOptions.length) {
            this.renderButtons();
        }
        // First create a wrapper outside the container in order to make
        // the inputs work and make export correct
        if (container.parentNode) {
            container.parentNode.insertBefore(this.div, container);
        }
        if (inputEnabled) {
            this.createInputs();
        }
    }
    /**
     * Create the input elements and its group.
     *
     */
    createInputs() {
        this.inputGroup = this.chart.renderer.g('input-group').add(this.group);
        const minElems = this.drawInput('min');
        this.minDateBox = minElems.dateBox;
        this.minLabel = minElems.label;
        this.minInput = minElems.input;
        const maxElems = this.drawInput('max');
        this.maxDateBox = maxElems.dateBox;
        this.maxLabel = maxElems.label;
        this.maxInput = maxElems.input;
    }
    /**
     * Render the range selector including the buttons and the inputs. The first
     * time render is called, the elements are created and positioned. On
     * subsequent calls, they are moved and updated.
     *
     * @private
     * @function Highcharts.RangeSelector#render
     * @param {number} [min]
     *        X axis minimum
     * @param {number} [max]
     *        X axis maximum
     */
    render(min, max) {
        if (this.options.enabled === false) {
            return;
        }
        const chart = this.chart, chartOptions = chart.options, options = chartOptions.rangeSelector, 
        // Place inputs above the container
        inputEnabled = options.inputEnabled;
        if (inputEnabled) {
            if (!this.inputGroup) {
                this.createInputs();
            }
            // Set or reset the input values
            this.setInputValue('min', min);
            this.setInputValue('max', max);
            if (!this.chart.styledMode) {
                this.maxLabel?.css(options.labelStyle);
                this.minLabel?.css(options.labelStyle);
            }
            const unionExtremes = (chart.scroller && chart.scroller.getUnionExtremes()) || chart.xAxis[0] || {};
            if (RangeSelector_defined(unionExtremes.dataMin) &&
                RangeSelector_defined(unionExtremes.dataMax)) {
                const minRange = chart.xAxis[0].minRange || 0;
                this.setInputExtremes('min', unionExtremes.dataMin, Math.min(unionExtremes.dataMax, this.getInputValue('max')) - minRange);
                this.setInputExtremes('max', Math.max(unionExtremes.dataMin, this.getInputValue('min')) + minRange, unionExtremes.dataMax);
            }
            // Reflow
            if (this.inputGroup) {
                let x = 0;
                [
                    this.minLabel,
                    this.minDateBox,
                    this.maxLabel,
                    this.maxDateBox
                ].forEach((label) => {
                    if (label) {
                        const { width } = label.getBBox();
                        if (width) {
                            label.attr({ x });
                            x += width + options.inputSpacing;
                        }
                    }
                });
            }
        }
        else {
            if (this.inputGroup) {
                this.inputGroup.destroy();
                delete this.inputGroup;
            }
        }
        if (!this.chart.styledMode) {
            if (this.zoomText) {
                this.zoomText.css(options.labelStyle);
            }
        }
        this.alignElements();
        this.updateButtonStates();
    }
    /**
     * Render the range buttons. This only runs the first time, later the
     * positioning is laid out in alignElements.
     *
     * @private
     * @function Highcharts.RangeSelector#renderButtons
     */
    renderButtons() {
        var _a;
        const { chart, options } = this;
        const lang = RangeSelector_defaultOptions.lang;
        const renderer = chart.renderer;
        const buttonTheme = RangeSelector_merge(options.buttonTheme);
        const states = buttonTheme && buttonTheme.states;
        // Prevent the button from resetting the width when the button state
        // changes since we need more control over the width when collapsing
        // the buttons
        delete buttonTheme.width;
        delete buttonTheme.states;
        this.buttonGroup = renderer.g('range-selector-buttons').add(this.group);
        const dropdown = this.dropdown = createElement('select', void 0, {
            position: 'absolute',
            padding: 0,
            border: 0,
            cursor: 'pointer',
            opacity: 0.0001
        }, this.div);
        // Create a label for dropdown select element
        const userButtonTheme = chart.userOptions.rangeSelector?.buttonTheme;
        this.dropdownLabel = renderer.button('', 0, 0, () => { }, RangeSelector_merge(buttonTheme, {
            'stroke-width': RangeSelector_pick(buttonTheme['stroke-width'], 0),
            width: 'auto',
            paddingLeft: RangeSelector_pick(options.buttonTheme.paddingLeft, userButtonTheme?.padding, 8),
            paddingRight: RangeSelector_pick(options.buttonTheme.paddingRight, userButtonTheme?.padding, 8)
        }), states && states.hover, states && states.select, states && states.disabled)
            .hide()
            .add(this.group);
        // Prevent page zoom on iPhone
        RangeSelector_addEvent(dropdown, 'touchstart', () => {
            dropdown.style.fontSize = '16px';
        });
        // Forward events from select to button
        const mouseOver = (external_highcharts_src_js_default_default()).isMS ? 'mouseover' : 'mouseenter', mouseOut = (external_highcharts_src_js_default_default()).isMS ? 'mouseout' : 'mouseleave';
        RangeSelector_addEvent(dropdown, mouseOver, () => {
            RangeSelector_fireEvent(this.dropdownLabel.element, mouseOver);
        });
        RangeSelector_addEvent(dropdown, mouseOut, () => {
            RangeSelector_fireEvent(this.dropdownLabel.element, mouseOut);
        });
        RangeSelector_addEvent(dropdown, 'change', () => {
            const button = this.buttons[dropdown.selectedIndex - 1];
            RangeSelector_fireEvent(button.element, 'click');
        });
        this.zoomText = renderer
            .label(lang.rangeSelectorZoom || '', 0)
            .attr({
            padding: options.buttonTheme.padding,
            height: options.buttonTheme.height,
            paddingLeft: 0,
            paddingRight: 0
        })
            .add(this.buttonGroup);
        if (!this.chart.styledMode) {
            this.zoomText.css(options.labelStyle);
            (_a = options.buttonTheme)['stroke-width'] ?? (_a['stroke-width'] = 0);
        }
        createElement('option', {
            textContent: this.zoomText.textStr,
            disabled: true
        }, void 0, dropdown);
        this.createButtons();
    }
    createButtons() {
        const { options } = this;
        const buttonTheme = RangeSelector_merge(options.buttonTheme);
        const states = buttonTheme && buttonTheme.states;
        // Prevent the button from resetting the width when the button state
        // changes since we need more control over the width when collapsing
        // the buttons
        const width = buttonTheme.width || 28;
        delete buttonTheme.width;
        delete buttonTheme.states;
        this.buttonOptions.forEach((rangeOptions, i) => {
            this.createButton(rangeOptions, i, width, states);
        });
    }
    createButton(rangeOptions, i, width, states) {
        const { dropdown, buttons, chart, options } = this;
        const renderer = chart.renderer;
        const buttonTheme = RangeSelector_merge(options.buttonTheme);
        dropdown?.add(createElement('option', {
            textContent: rangeOptions.title || rangeOptions.text
        }), i + 2);
        buttons[i] = renderer
            .button(rangeOptions.text ?? '', 0, 0, (e) => {
            // Extract events from button object and call
            const buttonEvents = (rangeOptions.events && rangeOptions.events.click);
            let callDefaultEvent;
            if (buttonEvents) {
                callDefaultEvent =
                    buttonEvents.call(rangeOptions, e);
            }
            if (callDefaultEvent !== false) {
                this.clickButton(i);
            }
            this.isActive = true;
        }, buttonTheme, states && states.hover, states && states.select, states && states.disabled)
            .attr({
            'text-align': 'center',
            width
        })
            .add(this.buttonGroup);
        if (rangeOptions.title) {
            buttons[i].attr('title', rangeOptions.title);
        }
    }
    /**
     * Align the elements horizontally and vertically.
     *
     * @private
     * @function Highcharts.RangeSelector#alignElements
     */
    alignElements() {
        const { buttonGroup, buttons, chart, group, inputGroup, options, zoomText } = this;
        const chartOptions = chart.options;
        const navButtonOptions = (chartOptions.exporting &&
            chartOptions.exporting.enabled !== false &&
            chartOptions.navigation &&
            chartOptions.navigation.buttonOptions);
        const { buttonPosition, inputPosition, verticalAlign } = options;
        // Get the X offset required to avoid overlapping with the exporting
        // button. This is used both by the buttonGroup and the inputGroup.
        const getXOffsetForExportButton = (group, position, rightAligned) => {
            if (navButtonOptions &&
                this.titleCollision(chart) &&
                verticalAlign === 'top' &&
                rightAligned && ((position.y -
                group.getBBox().height - 12) <
                ((navButtonOptions.y || 0) +
                    (navButtonOptions.height || 0) +
                    chart.spacing[0]))) {
                return -40;
            }
            return 0;
        };
        let plotLeft = chart.plotLeft;
        if (group && buttonPosition && inputPosition) {
            let translateX = buttonPosition.x - chart.spacing[3];
            if (buttonGroup) {
                this.positionButtons();
                if (!this.initialButtonGroupWidth) {
                    let width = 0;
                    if (zoomText) {
                        width += zoomText.getBBox().width + 5;
                    }
                    buttons.forEach((button, i) => {
                        width += button.width || 0;
                        if (i !== buttons.length - 1) {
                            width += options.buttonSpacing;
                        }
                    });
                    this.initialButtonGroupWidth = width;
                }
                plotLeft -= chart.spacing[3];
                // Detect collision between button group and exporting
                const xOffsetForExportButton = getXOffsetForExportButton(buttonGroup, buttonPosition, buttonPosition.align === 'right' ||
                    inputPosition.align === 'right');
                this.alignButtonGroup(xOffsetForExportButton);
                if (this.buttonGroup?.translateY) {
                    this.dropdownLabel
                        .attr({ y: this.buttonGroup.translateY });
                }
                // Skip animation
                group.placed = buttonGroup.placed = chart.hasLoaded;
            }
            let xOffsetForExportButton = 0;
            if (options.inputEnabled && inputGroup) {
                // Detect collision between the input group and exporting button
                xOffsetForExportButton = getXOffsetForExportButton(inputGroup, inputPosition, buttonPosition.align === 'right' ||
                    inputPosition.align === 'right');
                if (inputPosition.align === 'left') {
                    translateX = plotLeft;
                }
                else if (inputPosition.align === 'right') {
                    translateX = -Math.max(chart.axisOffset[1], -xOffsetForExportButton);
                }
                // Update the alignment to the updated spacing box
                inputGroup.align({
                    y: inputPosition.y,
                    width: inputGroup.getBBox().width,
                    align: inputPosition.align,
                    // Fix wrong getBBox() value on right align
                    x: inputPosition.x + translateX - 2
                }, true, chart.spacingBox);
                // Skip animation
                inputGroup.placed = chart.hasLoaded;
            }
            this.handleCollision(xOffsetForExportButton);
            // Vertical align
            group.align({
                verticalAlign
            }, true, chart.spacingBox);
            const alignTranslateY = group.alignAttr.translateY;
            // Set position
            let groupHeight = group.getBBox().height + 20; // # 20 padding
            let translateY = 0;
            // Calculate bottom position
            if (verticalAlign === 'bottom') {
                const legendOptions = chart.legend && chart.legend.options;
                const legendHeight = (legendOptions &&
                    legendOptions.verticalAlign === 'bottom' &&
                    legendOptions.enabled &&
                    !legendOptions.floating ?
                    (chart.legend.legendHeight +
                        RangeSelector_pick(legendOptions.margin, 10)) :
                    0);
                groupHeight = groupHeight + legendHeight - 20;
                translateY = (alignTranslateY -
                    groupHeight -
                    (options.floating ? 0 : options.y) -
                    (chart.titleOffset ? chart.titleOffset[2] : 0) -
                    10 // 10 spacing
                );
            }
            if (verticalAlign === 'top') {
                if (options.floating) {
                    translateY = 0;
                }
                if (chart.titleOffset && chart.titleOffset[0]) {
                    translateY = chart.titleOffset[0];
                }
                translateY += ((chart.margin[0] - chart.spacing[0]) || 0);
            }
            else if (verticalAlign === 'middle') {
                if (inputPosition.y === buttonPosition.y) {
                    translateY = alignTranslateY;
                }
                else if (inputPosition.y || buttonPosition.y) {
                    if (inputPosition.y < 0 ||
                        buttonPosition.y < 0) {
                        translateY -= Math.min(inputPosition.y, buttonPosition.y);
                    }
                    else {
                        translateY = alignTranslateY - groupHeight;
                    }
                }
            }
            group.translate(options.x, options.y + Math.floor(translateY));
            // Translate HTML inputs
            const { minInput, maxInput, dropdown } = this;
            if (options.inputEnabled && minInput && maxInput) {
                minInput.style.marginTop = group.translateY + 'px';
                maxInput.style.marginTop = group.translateY + 'px';
            }
            if (dropdown) {
                dropdown.style.marginTop = group.translateY + 'px';
            }
        }
    }
    /**
     * @private
     */
    redrawElements() {
        const chart = this.chart, { inputBoxHeight, inputBoxBorderColor } = this.options;
        this.maxDateBox?.attr({
            height: inputBoxHeight
        });
        this.minDateBox?.attr({
            height: inputBoxHeight
        });
        if (!chart.styledMode) {
            this.maxDateBox?.attr({
                stroke: inputBoxBorderColor
            });
            this.minDateBox?.attr({
                stroke: inputBoxBorderColor
            });
        }
        if (this.isDirty) {
            this.isDirty = false;
            // Reset this prop to force redrawing collapse of buttons
            this.isCollapsed = void 0;
            const newButtonsOptions = this.options.buttons ?? [];
            const btnLength = Math.min(newButtonsOptions.length, this.buttonOptions.length);
            const { dropdown, options } = this;
            const buttonTheme = RangeSelector_merge(options.buttonTheme);
            const states = buttonTheme && buttonTheme.states;
            // Prevent the button from resetting the width when the button state
            // changes since we need more control over the width when collapsing
            // the buttons
            const width = buttonTheme.width || 28;
            // Destroy additional buttons
            if (newButtonsOptions.length < this.buttonOptions.length) {
                for (let i = this.buttonOptions.length - 1; i >= newButtonsOptions.length; i--) {
                    const btn = this.buttons.pop();
                    btn?.destroy();
                    this.dropdown?.options.remove(i + 1);
                }
            }
            // Update current buttons
            for (let i = btnLength - 1; i >= 0; i--) {
                const diff = diffObjects(newButtonsOptions[i], this.buttonOptions[i]);
                if (Object.keys(diff).length !== 0) {
                    const rangeOptions = newButtonsOptions[i];
                    this.buttons[i].destroy();
                    dropdown?.options.remove(i + 1);
                    this.createButton(rangeOptions, i, width, states);
                    this.computeButtonRange(rangeOptions);
                }
            }
            // Create missing buttons
            if (newButtonsOptions.length > this.buttonOptions.length) {
                for (let i = this.buttonOptions.length; i < newButtonsOptions.length; i++) {
                    this.createButton(newButtonsOptions[i], i, width, states);
                    this.computeButtonRange(newButtonsOptions[i]);
                }
            }
            this.buttonOptions = this.options.buttons ?? [];
            if (RangeSelector_defined(this.options.selected) && this.buttons.length) {
                this.clickButton(this.options.selected, false);
            }
        }
    }
    /**
     * Align the button group horizontally and vertically.
     *
     * @private
     * @function Highcharts.RangeSelector#alignButtonGroup
     * @param {number} xOffsetForExportButton
     * @param {number} [width]
     */
    alignButtonGroup(xOffsetForExportButton, width) {
        const { chart, options, buttonGroup, dropdown, dropdownLabel } = this;
        const { buttonPosition } = options;
        const plotLeft = chart.plotLeft - chart.spacing[3];
        let translateX = buttonPosition.x - chart.spacing[3];
        let dropdownTranslateX = chart.plotLeft;
        if (buttonPosition.align === 'right') {
            translateX += xOffsetForExportButton - plotLeft; // #13014
            if (this.hasVisibleDropdown) {
                dropdownTranslateX = chart.chartWidth +
                    xOffsetForExportButton -
                    this.maxButtonWidth() - 20;
            }
        }
        else if (buttonPosition.align === 'center') {
            translateX -= plotLeft / 2;
            if (this.hasVisibleDropdown) {
                dropdownTranslateX = chart.chartWidth / 2 -
                    this.maxButtonWidth();
            }
        }
        if (dropdown) {
            RangeSelector_css(dropdown, {
                left: dropdownTranslateX + 'px',
                top: buttonGroup?.translateY + 'px'
            });
        }
        dropdownLabel?.attr({
            x: dropdownTranslateX
        });
        if (buttonGroup) {
            // Align button group
            buttonGroup.align({
                y: buttonPosition.y,
                width: RangeSelector_pick(width, this.initialButtonGroupWidth),
                align: buttonPosition.align,
                x: translateX
            }, true, chart.spacingBox);
        }
    }
    /**
     * @private
     * @function Highcharts.RangeSelector#positionButtons
     */
    positionButtons() {
        const { buttons, chart, options, zoomText } = this;
        const verb = chart.hasLoaded ? 'animate' : 'attr';
        const { buttonPosition } = options;
        const plotLeft = chart.plotLeft;
        let buttonLeft = plotLeft;
        if (zoomText && zoomText.visibility !== 'hidden') {
            // #8769, allow dynamically updating margins
            zoomText[verb]({
                x: RangeSelector_pick(plotLeft + buttonPosition.x, plotLeft)
            });
            // Button start position
            buttonLeft += buttonPosition.x +
                zoomText.getBBox().width + 5;
        }
        for (let i = 0, iEnd = this.buttonOptions.length; i < iEnd; ++i) {
            if (buttons[i].visibility !== 'hidden') {
                buttons[i][verb]({ x: buttonLeft });
                // Increase the button position for the next button
                buttonLeft += (buttons[i].width || 0) + options.buttonSpacing;
            }
            else {
                buttons[i][verb]({ x: plotLeft });
            }
        }
    }
    /**
     * Handle collision between the button group and the input group
     *
     * @private
     * @function Highcharts.RangeSelector#handleCollision
     *
     * @param  {number} xOffsetForExportButton
     *                  The X offset of the group required to make room for the
     *                  exporting button
     */
    handleCollision(xOffsetForExportButton) {
        const { chart, buttonGroup, inputGroup, initialButtonGroupWidth } = this;
        const { buttonPosition, dropdown, inputPosition } = this.options;
        const moveInputsDown = () => {
            if (inputGroup && buttonGroup) {
                inputGroup.attr({
                    translateX: inputGroup.alignAttr.translateX + (chart.axisOffset[1] >= -xOffsetForExportButton ?
                        0 :
                        -xOffsetForExportButton),
                    translateY: inputGroup.alignAttr.translateY +
                        buttonGroup.getBBox().height + 10
                });
            }
        };
        // Detect collision
        if (inputGroup && buttonGroup) {
            if (inputPosition.align === buttonPosition.align) {
                moveInputsDown();
                if (initialButtonGroupWidth >
                    chart.plotWidth + xOffsetForExportButton - 20) {
                    this.collapseButtons();
                }
                else {
                    this.expandButtons();
                }
            }
            else if (initialButtonGroupWidth -
                xOffsetForExportButton +
                inputGroup.getBBox().width >
                chart.plotWidth) {
                if (dropdown === 'responsive') {
                    this.collapseButtons();
                }
                else {
                    moveInputsDown();
                }
            }
            else {
                this.expandButtons();
            }
        }
        else if (buttonGroup && dropdown === 'responsive') {
            if (initialButtonGroupWidth > chart.plotWidth) {
                this.collapseButtons();
            }
            else {
                this.expandButtons();
            }
        }
        // Forced states
        if (buttonGroup) {
            if (dropdown === 'always') {
                this.collapseButtons();
            }
            if (dropdown === 'never') {
                this.expandButtons();
            }
        }
        this.alignButtonGroup(xOffsetForExportButton);
    }
    /**
     * Collapse the buttons and show the select element.
     *
     * @private
     * @function Highcharts.RangeSelector#collapseButtons
     * @param {number} xOffsetForExportButton
     */
    collapseButtons() {
        const { buttons, zoomText } = this;
        if (this.isCollapsed === true) {
            return;
        }
        this.isCollapsed = true;
        zoomText.hide();
        buttons.forEach((button) => void button.hide());
        this.showDropdown();
    }
    /**
     * Show all the buttons and hide the select element.
     *
     * @private
     * @function Highcharts.RangeSelector#expandButtons
     */
    expandButtons() {
        const { buttons, zoomText } = this;
        if (this.isCollapsed === false) {
            return;
        }
        this.isCollapsed = false;
        this.hideDropdown();
        zoomText.show();
        buttons.forEach((button) => void button.show());
        this.positionButtons();
    }
    /**
     * Position the select element on top of the button.
     *
     * @private
     * @function Highcharts.RangeSelector#showDropdown
     */
    showDropdown() {
        const { buttonGroup, dropdownLabel, dropdown } = this;
        if (buttonGroup && dropdown) {
            dropdownLabel.show();
            RangeSelector_css(dropdown, { visibility: 'inherit' });
            this.hasVisibleDropdown = true;
        }
    }
    /**
     * @private
     * @function Highcharts.RangeSelector#hideDropdown
     */
    hideDropdown() {
        const { dropdown } = this;
        if (dropdown) {
            this.dropdownLabel.hide();
            RangeSelector_css(dropdown, {
                visibility: 'hidden',
                width: '1px',
                height: '1px'
            });
            this.hasVisibleDropdown = false;
        }
    }
    /**
     * Extracts height of range selector
     *
     * @private
     * @function Highcharts.RangeSelector#getHeight
     * @return {number}
     * Returns rangeSelector height
     */
    getHeight() {
        const rangeSelector = this, options = rangeSelector.options, rangeSelectorGroup = rangeSelector.group, inputPosition = options.inputPosition, buttonPosition = options.buttonPosition, yPosition = options.y, buttonPositionY = buttonPosition.y, inputPositionY = inputPosition.y;
        let rangeSelectorHeight = 0;
        if (options.height) {
            return options.height;
        }
        // Align the elements before we read the height in case we're switching
        // between wrapped and non-wrapped layout
        this.alignElements();
        rangeSelectorHeight = rangeSelectorGroup ?
            // 13px to keep back compatibility
            (rangeSelectorGroup.getBBox(true).height) + 13 +
                yPosition :
            0;
        const minPosition = Math.min(inputPositionY, buttonPositionY);
        if ((inputPositionY < 0 && buttonPositionY < 0) ||
            (inputPositionY > 0 && buttonPositionY > 0)) {
            rangeSelectorHeight += Math.abs(minPosition);
        }
        return rangeSelectorHeight;
    }
    /**
     * Detect collision with title or subtitle
     *
     * @private
     * @function Highcharts.RangeSelector#titleCollision
     * @return {boolean}
     * Returns collision status
     */
    titleCollision(chart) {
        return !(chart.options.title.text ||
            chart.options.subtitle.text);
    }
    /**
     * Update the range selector with new options
     *
     * @private
     * @function Highcharts.RangeSelector#update
     * @param {Highcharts.RangeSelectorOptions} options
     */
    update(options, redraw = true) {
        const chart = this.chart;
        RangeSelector_merge(true, this.options, options);
        if (this.options.selected &&
            this.options.selected >= this.options.buttons.length) {
            this.options.selected = void 0;
            chart.options.rangeSelector.selected = void 0;
        }
        if (RangeSelector_defined(options.enabled)) {
            this.destroy();
            return this.init(chart);
        }
        this.isDirty = !!options.buttons;
        if (redraw) {
            this.render();
        }
    }
    /**
     * Destroys allocated elements.
     *
     * @private
     * @function Highcharts.RangeSelector#destroy
     */
    destroy() {
        const rSelector = this, minInput = rSelector.minInput, maxInput = rSelector.maxInput;
        if (rSelector.eventsToUnbind) {
            rSelector.eventsToUnbind.forEach((unbind) => unbind());
            rSelector.eventsToUnbind = void 0;
        }
        // Destroy elements in collections
        RangeSelector_destroyObjectProperties(rSelector.buttons);
        // Clear input element events
        if (minInput) {
            minInput.onfocus = minInput.onblur = minInput.onchange = null;
        }
        if (maxInput) {
            maxInput.onfocus = maxInput.onblur = maxInput.onchange = null;
        }
        // Destroy HTML and SVG elements
        RangeSelector_objectEach(rSelector, function (val, key) {
            if (val && key !== 'chart') {
                if (val instanceof (external_highcharts_src_js_default_SVGElement_default())) {
                    // SVGElement
                    val.destroy();
                }
                else if (val instanceof window.HTMLElement) {
                    // HTML element
                    discardElement(val);
                }
                delete rSelector[key];
            }
            if (val !== RangeSelector.prototype[key]) {
                rSelector[key] = null;
            }
        }, this);
        this.buttons = [];
    }
}
RangeSelector_extend(RangeSelector.prototype, {
    /**
     * The date formats to use when setting min, max and value on date inputs.
     * @private
     */
    inputTypeFormats: {
        'datetime-local': '%Y-%m-%dT%H:%M:%S',
        'date': '%Y-%m-%d',
        'time': '%H:%M:%S'
    }
});
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const RangeSelector_RangeSelector = (RangeSelector);
/* *
 *
 *  API Options
 *
 * */
/**
 * Define the time span for the button
 *
 * @typedef {"all"|"day"|"hour"|"millisecond"|"minute"|"month"|"second"|"week"|"year"|"ytd"} Highcharts.RangeSelectorButtonTypeValue
 */
/**
 * Callback function to react on button clicks.
 *
 * @callback Highcharts.RangeSelectorClickCallbackFunction
 *
 * @param {global.Event} e
 *        Event arguments.
 *
 * @param {boolean|undefined}
 *        Return false to cancel the default button event.
 */
/**
 * Callback function to parse values entered in the input boxes and return a
 * valid JavaScript time as milliseconds since 1970.
 *
 * @callback Highcharts.RangeSelectorParseCallbackFunction
 *
 * @param {string} value
 *        Input value to parse.
 *
 * @return {number}
 *         Parsed JavaScript time value.
 */
(''); // Keeps doclets above in JS file

;// external "./pathfinder.src.js"
var x = (y) => {
	var x = {}; __webpack_require__.d(x,
    	y); return x
    } 
    var y = (x) => (() => (x))
    const external_pathfinder_src_js_namespaceObject = x({  });
;// external "./static-scale.src.js"
var external_static_scale_src_js_x = (y) => {
	var x = {}; __webpack_require__.d(x,
    	y); return x
    } 
    var external_static_scale_src_js_y = (x) => (() => (x))
    const external_static_scale_src_js_namespaceObject = external_static_scale_src_js_x({  });
;// external "./xrange.src.js"
var external_xrange_src_js_x = (y) => {
	var x = {}; __webpack_require__.d(x,
    	y); return x
    } 
    var external_xrange_src_js_y = (x) => (() => (x))
    const external_xrange_src_js_namespaceObject = external_xrange_src_js_x({  });
;// ./code/es-modules/Series/Gantt/GanttPoint.js
/* *
 *
 *  (c) 2016-2025 Highsoft AS
 *
 *  Author: Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { xrange: { prototype: { pointClass: XRangePoint } } } = (external_highcharts_src_js_default_SeriesRegistry_default()).seriesTypes;
/* *
 *
 *  Class
 *
 * */
class GanttPoint extends XRangePoint {
    /* *
     *
     *  Static Functions
     *
     * */
    /**
     * @private
     */
    static setGanttPointAliases(options, chart) {
        options.x = options.start = chart.time.parse(options.start ?? options.x);
        options.x2 = options.end = chart.time.parse(options.end ?? options.x2);
        options.partialFill = options.completed =
            options.completed ?? options.partialFill;
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Applies the options containing the x and y data and possible some
     * extra properties. This is called on point init or from point.update.
     *
     * @private
     * @function Highcharts.Point#applyOptions
     *
     * @param {Object} options
     *        The point options
     *
     * @param {number} x
     *        The x value
     *
     * @return {Highcharts.Point}
     *         The Point instance
     */
    applyOptions(options, x) {
        const ganttPoint = super.applyOptions(options, x);
        GanttPoint.setGanttPointAliases(ganttPoint, ganttPoint.series.chart);
        this.isNull = !this.isValid?.();
        return ganttPoint;
    }
    isValid() {
        return ((typeof this.start === 'number' ||
            typeof this.x === 'number') &&
            (typeof this.end === 'number' ||
                typeof this.x2 === 'number' ||
                this.milestone));
    }
}
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Gantt_GanttPoint = (GanttPoint);

;// ./code/es-modules/Series/Gantt/GanttSeriesDefaults.js
/* *
 *
 *  (c) 2016-2025 Highsoft AS
 *
 *  Author: Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { isNumber: GanttSeriesDefaults_isNumber } = (external_highcharts_src_js_default_default());
/* *
 *
 *  API Options
 *
 * */
/**
 * A `gantt` series. If the [type](#series.gantt.type) option is not specified,
 * it is inherited from [chart.type](#chart.type).
 *
 * @extends      plotOptions.xrange
 * @product      gantt
 * @requires     highcharts-gantt
 * @optionparent plotOptions.gantt
 */
const GanttSeriesDefaults = {
    // Options - default options merged with parent
    grouping: false,
    dataLabels: {
        enabled: true
    },
    tooltip: {
        headerFormat: '<span style="font-size: 0.8em">{series.name}</span><br/>',
        pointFormat: null,
        pointFormatter: function () {
            const point = this, series = point.series, xAxis = series.xAxis, formats = series.tooltipOptions.dateTimeLabelFormats, startOfWeek = xAxis.options.startOfWeek, ttOptions = series.tooltipOptions, milestone = point.options.milestone;
            let format = ttOptions.xDateFormat, retVal = '<b>' + (point.name || point.yCategory) + '</b>';
            if (ttOptions.pointFormat) {
                return point.tooltipFormatter(ttOptions.pointFormat);
            }
            if (!format && GanttSeriesDefaults_isNumber(point.start)) {
                format = series.chart.time.getDateFormat(xAxis.closestPointRange, point.start, startOfWeek, formats || {});
            }
            const start = series.chart.time.dateFormat(format, point.start), end = series.chart.time.dateFormat(format, point.end);
            retVal += '<br/>';
            if (!milestone) {
                retVal += 'Start: ' + start + '<br/>';
                retVal += 'End: ' + end + '<br/>';
            }
            else {
                retVal += start + '<br/>';
            }
            return retVal;
        }
    },
    connectors: {
        type: 'simpleConnect',
        /**
         * @declare Highcharts.ConnectorsAnimationOptionsObject
         */
        animation: {
            reversed: true // Dependencies go from child to parent
        },
        radius: 0,
        startMarker: {
            enabled: true,
            symbol: 'arrow-filled',
            radius: 4,
            fill: '#fa0',
            align: 'left'
        },
        endMarker: {
            enabled: false, // Only show arrow on the dependent task
            align: 'right'
        }
    }
};
/**
 * A `gantt` series.
 *
 * @extends   series,plotOptions.gantt
 * @excluding boostThreshold, dashStyle, findNearestPointBy,
 *            getExtremesFromAll, marker, negativeColor, pointInterval,
 *            pointIntervalUnit, pointPlacement, pointStart
 * @product   gantt
 * @requires  highcharts-gantt
 * @apioption series.gantt
 */
/**
 * Data for a Gantt series.
 *
 * @declare   Highcharts.GanttPointOptionsObject
 * @type      {Array<*>}
 * @extends   series.xrange.data
 * @excluding className, connect, dataLabels, events,
 *            partialFill, selected, x, x2
 * @product   gantt
 * @apioption series.gantt.data
 */
/**
 * Whether the grid node belonging to this point should start as collapsed. Used
 * in axes of type treegrid.
 *
 * @sample {gantt} gantt/treegrid-axis/collapsed/
 *         Start as collapsed
 *
 * @type      {boolean}
 * @default   false
 * @product   gantt
 * @apioption series.gantt.data.collapsed
 */
/**
 * The start time of a task. May be a timestamp or a date string.
 *
 * @type      {number|string}
 * @product   gantt
 * @apioption series.gantt.data.start
 */
/**
 * The end time of a task. May be a timestamp or a date string.
 *
 * @type      {number|string}
 * @product   gantt
 * @apioption series.gantt.data.end
 */
/**
 * The Y value of a task.
 *
 * @type      {number}
 * @product   gantt
 * @apioption series.gantt.data.y
 */
/**
 * The name of a task. If a `treegrid` y-axis is used (default in Gantt charts),
 * this will be picked up automatically, and used to calculate the y-value.
 *
 * @type      {string}
 * @product   gantt
 * @apioption series.gantt.data.name
 */
/**
 * Progress indicator, how much of the task completed. If it is a number, the
 * `fill` will be applied automatically.
 *
 * @sample {gantt} gantt/demo/progress-indicator
 *         Progress indicator
 *
 * @type      {number|*}
 * @extends   series.xrange.data.partialFill
 * @product   gantt
 * @apioption series.gantt.data.completed
 */
/**
 * The amount of the progress indicator, ranging from 0 (not started) to 1
 * (finished).
 *
 * @type      {number}
 * @default   0
 * @apioption series.gantt.data.completed.amount
 */
/**
 * The fill of the progress indicator. Defaults to a darkened variety of the
 * main color.
 *
 * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
 * @apioption series.gantt.data.completed.fill
 */
/**
 * The ID of the point (task) that this point depends on in Gantt charts.
 * Aliases [connect](series.xrange.data.connect). Can also be an object,
 * specifying further connecting [options](series.gantt.connectors) between the
 * points. Multiple connections can be specified by providing an array.
 *
 * @sample gantt/demo/project-management
 *         Dependencies
 * @sample gantt/pathfinder/demo
 *         Different connection types
 *
 * @type      {string|Array<string|*>|*}
 * @extends   series.xrange.data.connect
 * @since     6.2.0
 * @product   gantt
 * @apioption series.gantt.data.dependency
 */
/**
 * Whether this point is a milestone. If so, only the `start` option is handled,
 * while `end` is ignored.
 *
 * @sample gantt/gantt/milestones
 *         Milestones
 *
 * @type      {boolean}
 * @since     6.2.0
 * @product   gantt
 * @apioption series.gantt.data.milestone
 */
/**
 * The ID of the parent point (task) of this point in Gantt charts.
 *
 * @sample gantt/demo/subtasks
 *         Gantt chart with subtasks
 *
 * @type      {string}
 * @since     6.2.0
 * @product   gantt
 * @apioption series.gantt.data.parent
 */
/**
 * @excluding afterAnimate
 * @apioption series.gantt.events
 */
''; // Detachs doclets above
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Gantt_GanttSeriesDefaults = (GanttSeriesDefaults);

;// ./code/es-modules/Series/PathUtilities.js
/* *
 *
 *  (c) 2010-2025 Pawel Lysy
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

const getLinkPath = {
    'default': getDefaultPath,
    straight: getStraightPath,
    curved: getCurvedPath
};
/**
 *
 */
function getDefaultPath(pathParams) {
    const { x1, y1, x2, y2, width = 0, inverted = false, radius, parentVisible } = pathParams;
    const path = [
        ['M', x1, y1],
        ['L', x1, y1],
        ['C', x1, y1, x1, y2, x1, y2],
        ['L', x1, y2],
        ['C', x1, y1, x1, y2, x1, y2],
        ['L', x1, y2]
    ];
    return parentVisible ?
        applyRadius([
            ['M', x1, y1],
            ['L', x1 + width * (inverted ? -0.5 : 0.5), y1],
            ['L', x1 + width * (inverted ? -0.5 : 0.5), y2],
            ['L', x2, y2]
        ], radius) :
        path;
}
/**
 *
 */
function getStraightPath(pathParams) {
    const { x1, y1, x2, y2, width = 0, inverted = false, parentVisible } = pathParams;
    return parentVisible ? [
        ['M', x1, y1],
        ['L', x1 + width * (inverted ? -1 : 1), y2],
        ['L', x2, y2]
    ] : [
        ['M', x1, y1],
        ['L', x1, y2],
        ['L', x1, y2]
    ];
}
/**
 *
 */
function getCurvedPath(pathParams) {
    const { x1, y1, x2, y2, offset = 0, width = 0, inverted = false, parentVisible } = pathParams;
    return parentVisible ?
        [
            ['M', x1, y1],
            [
                'C',
                x1 + offset,
                y1,
                x1 - offset + width * (inverted ? -1 : 1),
                y2,
                x1 + width * (inverted ? -1 : 1),
                y2
            ],
            ['L', x2, y2]
        ] :
        [
            ['M', x1, y1],
            ['C', x1, y1, x1, y2, x1, y2],
            ['L', x2, y2]
        ];
}
/**
 * General function to apply corner radius to a path
 * @private
 */
function applyRadius(path, r) {
    const d = [];
    for (let i = 0; i < path.length; i++) {
        const x = path[i][1];
        const y = path[i][2];
        if (typeof x === 'number' && typeof y === 'number') {
            // MoveTo
            if (i === 0) {
                d.push(['M', x, y]);
            }
            else if (i === path.length - 1) {
                d.push(['L', x, y]);
                // CurveTo
            }
            else if (r) {
                const prevSeg = path[i - 1];
                const nextSeg = path[i + 1];
                if (prevSeg && nextSeg) {
                    const x1 = prevSeg[1], y1 = prevSeg[2], x2 = nextSeg[1], y2 = nextSeg[2];
                    // Only apply to breaks
                    if (typeof x1 === 'number' &&
                        typeof x2 === 'number' &&
                        typeof y1 === 'number' &&
                        typeof y2 === 'number' &&
                        x1 !== x2 &&
                        y1 !== y2) {
                        const directionX = x1 < x2 ? 1 : -1, directionY = y1 < y2 ? 1 : -1;
                        d.push([
                            'L',
                            x - directionX * Math.min(Math.abs(x - x1), r),
                            y - directionY * Math.min(Math.abs(y - y1), r)
                        ], [
                            'C',
                            x,
                            y,
                            x,
                            y,
                            x + directionX * Math.min(Math.abs(x - x2), r),
                            y + directionY * Math.min(Math.abs(y - y2), r)
                        ]);
                    }
                }
                // LineTo
            }
            else {
                d.push(['L', x, y]);
            }
        }
    }
    return d;
}
const PathUtilities = {
    applyRadius,
    getLinkPath
};
/* harmony default export */ const Series_PathUtilities = (PathUtilities);

;// ./code/es-modules/Gantt/PathfinderAlgorithms.js
/* *
 *
 *  (c) 2016 Highsoft AS
 *  Author: Øystein Moseng
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */



const { pick: PathfinderAlgorithms_pick } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Constants
 *
 * */
const { min: PathfinderAlgorithms_min, max: PathfinderAlgorithms_max, abs } = Math;
/* *
 *
 *  Functions
 *
 * */
/**
 * Get index of last obstacle before xMin. Employs a type of binary search, and
 * thus requires that obstacles are sorted by xMin value.
 *
 * @private
 * @function findLastObstacleBefore
 *
 * @param {Array<object>} obstacles
 *        Array of obstacles to search in.
 *
 * @param {number} xMin
 *        The xMin threshold.
 *
 * @param {number} [startIx]
 *        Starting index to search from. Must be within array range.
 *
 * @return {number}
 *         The index of the last obstacle element before xMin.
 */
function findLastObstacleBefore(obstacles, xMin, startIx) {
    const min = xMin - 0.0000001; // Make sure we include all obstacles at xMin
    let left = startIx || 0, // Left limit
    right = obstacles.length - 1, // Right limit
    cursor, cmp;
    while (left <= right) {
        cursor = (right + left) >> 1;
        cmp = min - obstacles[cursor].xMin;
        if (cmp > 0) {
            left = cursor + 1;
        }
        else if (cmp < 0) {
            right = cursor - 1;
        }
        else {
            return cursor;
        }
    }
    return left > 0 ? left - 1 : 0;
}
/**
 * Test if a point lays within an obstacle.
 *
 * @private
 * @function pointWithinObstacle
 *
 * @param {Object} obstacle
 *        Obstacle to test.
 *
 * @param {Highcharts.Point} point
 *        Point with x/y props.
 *
 * @return {boolean}
 *         Whether point is within the obstacle or not.
 */
function pointWithinObstacle(obstacle, point) {
    return (point.x <= obstacle.xMax &&
        point.x >= obstacle.xMin &&
        point.y <= obstacle.yMax &&
        point.y >= obstacle.yMin);
}
/**
 * Find the index of an obstacle that wraps around a point.
 * Returns -1 if not found.
 *
 * @private
 * @function findObstacleFromPoint
 *
 * @param {Array<object>} obstacles
 *        Obstacles to test.
 *
 * @param {Highcharts.Point} point
 *        Point with x/y props.
 *
 * @return {number}
 *         Ix of the obstacle in the array, or -1 if not found.
 */
function findObstacleFromPoint(obstacles, point) {
    let i = findLastObstacleBefore(obstacles, point.x + 1) + 1;
    while (i--) {
        if (obstacles[i].xMax >= point.x &&
            // Optimization using lazy evaluation
            pointWithinObstacle(obstacles[i], point)) {
            return i;
        }
    }
    return -1;
}
/**
 * Get SVG path array from array of line segments.
 *
 * @private
 * @function pathFromSegments
 *
 * @param {Array<object>} segments
 *        The segments to build the path from.
 *
 * @return {Highcharts.SVGPathArray}
 *         SVG path array as accepted by the SVG Renderer.
 */
function pathFromSegments(segments) {
    const path = [];
    if (segments.length) {
        path.push(['M', segments[0].start.x, segments[0].start.y]);
        for (let i = 0; i < segments.length; ++i) {
            path.push(['L', segments[i].end.x, segments[i].end.y]);
        }
    }
    return path;
}
/**
 * Limits obstacle max/mins in all directions to bounds. Modifies input
 * obstacle.
 *
 * @private
 * @function limitObstacleToBounds
 *
 * @param {Object} obstacle
 *        Obstacle to limit.
 *
 * @param {Object} bounds
 *        Bounds to use as limit.
 *
 * @return {void}
 */
function limitObstacleToBounds(obstacle, bounds) {
    obstacle.yMin = PathfinderAlgorithms_max(obstacle.yMin, bounds.yMin);
    obstacle.yMax = PathfinderAlgorithms_min(obstacle.yMax, bounds.yMax);
    obstacle.xMin = PathfinderAlgorithms_max(obstacle.xMin, bounds.xMin);
    obstacle.xMax = PathfinderAlgorithms_min(obstacle.xMax, bounds.xMax);
}
/**
 * Get an SVG path from a starting coordinate to an ending coordinate.
 * Draws a straight line.
 *
 * @function Highcharts.Pathfinder.algorithms.straight
 *
 * @param {Highcharts.PositionObject} start
 *        Starting coordinate, object with x/y props.
 *
 * @param {Highcharts.PositionObject} end
 *        Ending coordinate, object with x/y props.
 *
 * @return {Object}
 *         An object with the SVG path in Array form as accepted by the SVG
 *         renderer, as well as an array of new obstacles making up this
 *         path.
 */
function straight(start, end) {
    return {
        path: [
            ['M', start.x, start.y],
            ['L', end.x, end.y]
        ],
        obstacles: [{ start: start, end: end }]
    };
}
/**
 * Find a path from a starting coordinate to an ending coordinate, using
 * right angles only, and taking only starting/ending obstacle into
 * consideration.
 *
 * @function Highcharts.Pathfinder.algorithms.simpleConnect
 *
 * @param {Highcharts.PositionObject} start
 *        Starting coordinate, object with x/y props.
 *
 * @param {Highcharts.PositionObject} end
 *        Ending coordinate, object with x/y props.
 *
 * @param {Object} options
 *        Options for the algorithm:
 *        - chartObstacles: Array of chart obstacles to avoid
 *        - startDirectionX: Optional. True if starting in the X direction.
 *          If not provided, the algorithm starts in the direction that is
 *          the furthest between start/end.
 *
 * @return {Object}
 *         An object with the SVG path in Array form as accepted by the SVG
 *         renderer, as well as an array of new obstacles making up this
 *         path.
 */
const simpleConnect = function (start, end, options) {
    const segments = [], chartObstacles = options.chartObstacles, startObstacleIx = findObstacleFromPoint(chartObstacles, start), endObstacleIx = findObstacleFromPoint(chartObstacles, end);
    let endSegment, dir = PathfinderAlgorithms_pick(options.startDirectionX, abs(end.x - start.x) > abs(end.y - start.y)) ? 'x' : 'y', startObstacle, endObstacle, waypoint, useMax, endPoint;
    // eslint-disable-next-line valid-jsdoc
    /**
     * Return a clone of a point with a property set from a target object,
     * optionally with an offset
     * @private
     */
    function copyFromPoint(from, fromKey, to, toKey, offset) {
        const point = {
            x: from.x,
            y: from.y
        };
        point[fromKey] = to[toKey || fromKey] + (offset || 0);
        return point;
    }
    // eslint-disable-next-line valid-jsdoc
    /**
     * Return waypoint outside obstacle.
     * @private
     */
    function getMeOut(obstacle, point, direction) {
        const useMax = abs(point[direction] - obstacle[direction + 'Min']) >
            abs(point[direction] - obstacle[direction + 'Max']);
        return copyFromPoint(point, direction, obstacle, direction + (useMax ? 'Max' : 'Min'), useMax ? 1 : -1);
    }
    // Pull out end point
    if (endObstacleIx > -1) {
        endObstacle = chartObstacles[endObstacleIx];
        waypoint = getMeOut(endObstacle, end, dir);
        endSegment = {
            start: waypoint,
            end: end
        };
        endPoint = waypoint;
    }
    else {
        endPoint = end;
    }
    // If an obstacle envelops the start point, add a segment to get out,
    // and around it.
    if (startObstacleIx > -1) {
        startObstacle = chartObstacles[startObstacleIx];
        waypoint = getMeOut(startObstacle, start, dir);
        segments.push({
            start: start,
            end: waypoint
        });
        // If we are going back again, switch direction to get around start
        // obstacle.
        if (
        // Going towards max from start:
        waypoint[dir] >= start[dir] ===
            // Going towards min to end:
            waypoint[dir] >= endPoint[dir]) {
            dir = dir === 'y' ? 'x' : 'y';
            useMax = start[dir] < end[dir];
            segments.push({
                start: waypoint,
                end: copyFromPoint(waypoint, dir, startObstacle, dir + (useMax ? 'Max' : 'Min'), useMax ? 1 : -1)
            });
            // Switch direction again
            dir = dir === 'y' ? 'x' : 'y';
        }
    }
    // We are around the start obstacle. Go towards the end in one
    // direction.
    const prevWaypoint = segments.length ?
        segments[segments.length - 1].end :
        start;
    waypoint = copyFromPoint(prevWaypoint, dir, endPoint);
    segments.push({
        start: prevWaypoint,
        end: waypoint
    });
    // Final run to end point in the other direction
    dir = dir === 'y' ? 'x' : 'y';
    const waypoint2 = copyFromPoint(waypoint, dir, endPoint);
    segments.push({
        start: waypoint,
        end: waypoint2
    });
    // Finally add the endSegment
    segments.push(endSegment);
    const path = Series_PathUtilities.applyRadius(pathFromSegments(segments), options.radius);
    return {
        path,
        obstacles: segments
    };
};
simpleConnect.requiresObstacles = true;
/**
 * Find a path from a starting coordinate to an ending coordinate, taking
 * obstacles into consideration. Might not always find the optimal path,
 * but is fast, and usually good enough.
 *
 * @function Highcharts.Pathfinder.algorithms.fastAvoid
 *
 * @param {Highcharts.PositionObject} start
 *        Starting coordinate, object with x/y props.
 *
 * @param {Highcharts.PositionObject} end
 *        Ending coordinate, object with x/y props.
 *
 * @param {Object} options
 *        Options for the algorithm.
 *        - chartObstacles:  Array of chart obstacles to avoid
 *        - lineObstacles:   Array of line obstacles to jump over
 *        - obstacleMetrics: Object with metrics of chartObstacles cached
 *        - hardBounds:      Hard boundaries to not cross
 *        - obstacleOptions: Options for the obstacles, including margin
 *        - startDirectionX: Optional. True if starting in the X direction.
 *                           If not provided, the algorithm starts in the
 *                           direction that is the furthest between
 *                           start/end.
 *
 * @return {Object}
 *         An object with the SVG path in Array form as accepted by the SVG
 *         renderer, as well as an array of new obstacles making up this
 *         path.
 */
function fastAvoid(start, end, options) {
    /*
        Algorithm rules/description
        - Find initial direction
        - Determine soft/hard max for each direction.
        - Move along initial direction until obstacle.
        - Change direction.
        - If hitting obstacle, first try to change length of previous line
            before changing direction again.

        Soft min/max x = start/destination x +/- widest obstacle + margin
        Soft min/max y = start/destination y +/- tallest obstacle + margin

        @todo:
            - Make retrospective, try changing prev segment to reduce
                corners
            - Fix logic for breaking out of end-points - not always picking
                the best direction currently
            - When going around the end obstacle we should not always go the
                shortest route, rather pick the one closer to the end point
    */
    const dirIsX = PathfinderAlgorithms_pick(options.startDirectionX, abs(end.x - start.x) > abs(end.y - start.y)), dir = dirIsX ? 'x' : 'y', endSegments = [], 
    // Boundaries to stay within. If beyond soft boundary, prefer to
    // change direction ASAP. If at hard max, always change immediately.
    metrics = options.obstacleMetrics, softMinX = PathfinderAlgorithms_min(start.x, end.x) - metrics.maxWidth - 10, softMaxX = PathfinderAlgorithms_max(start.x, end.x) + metrics.maxWidth + 10, softMinY = PathfinderAlgorithms_min(start.y, end.y) - metrics.maxHeight - 10, softMaxY = PathfinderAlgorithms_max(start.y, end.y) + metrics.maxHeight + 10;
    let segments, useMax, extractedEndPoint, forceObstacleBreak = false, // Used in clearPathTo to keep track of
    // when to force break through an obstacle.
    // Obstacles
    chartObstacles = options.chartObstacles, endObstacleIx = findLastObstacleBefore(chartObstacles, softMaxX);
    const startObstacleIx = findLastObstacleBefore(chartObstacles, softMinX);
    // eslint-disable-next-line valid-jsdoc
    /**
     * How far can you go between two points before hitting an obstacle?
     * Does not work for diagonal lines (because it doesn't have to).
     * @private
     */
    function pivotPoint(fromPoint, toPoint, directionIsX) {
        const searchDirection = fromPoint.x < toPoint.x ? 1 : -1;
        let firstPoint, lastPoint, highestPoint, lowestPoint;
        if (fromPoint.x < toPoint.x) {
            firstPoint = fromPoint;
            lastPoint = toPoint;
        }
        else {
            firstPoint = toPoint;
            lastPoint = fromPoint;
        }
        if (fromPoint.y < toPoint.y) {
            lowestPoint = fromPoint;
            highestPoint = toPoint;
        }
        else {
            lowestPoint = toPoint;
            highestPoint = fromPoint;
        }
        // Go through obstacle range in reverse if toPoint is before
        // fromPoint in the X-dimension.
        let i = searchDirection < 0 ?
            // Searching backwards, start at last obstacle before last point
            PathfinderAlgorithms_min(findLastObstacleBefore(chartObstacles, lastPoint.x), chartObstacles.length - 1) :
            // Forwards. Since we're not sorted by xMax, we have to look
            // at all obstacles.
            0;
        // Go through obstacles in this X range
        while (chartObstacles[i] && (searchDirection > 0 && chartObstacles[i].xMin <= lastPoint.x ||
            searchDirection < 0 && chartObstacles[i].xMax >= firstPoint.x)) {
            // If this obstacle is between from and to points in a straight
            // line, pivot at the intersection.
            if (chartObstacles[i].xMin <= lastPoint.x &&
                chartObstacles[i].xMax >= firstPoint.x &&
                chartObstacles[i].yMin <= highestPoint.y &&
                chartObstacles[i].yMax >= lowestPoint.y) {
                if (directionIsX) {
                    return {
                        y: fromPoint.y,
                        x: fromPoint.x < toPoint.x ?
                            chartObstacles[i].xMin - 1 :
                            chartObstacles[i].xMax + 1,
                        obstacle: chartObstacles[i]
                    };
                }
                // Else ...
                return {
                    x: fromPoint.x,
                    y: fromPoint.y < toPoint.y ?
                        chartObstacles[i].yMin - 1 :
                        chartObstacles[i].yMax + 1,
                    obstacle: chartObstacles[i]
                };
            }
            i += searchDirection;
        }
        return toPoint;
    }
    /**
     * Decide in which direction to dodge or get out of an obstacle.
     * Considers desired direction, which way is shortest, soft and hard
     * bounds.
     *
     * (? Returns a string, either xMin, xMax, yMin or yMax.)
     *
     * @private
     * @function
     *
     * @param {Object} obstacle
     *        Obstacle to dodge/escape.
     *
     * @param {Object} fromPoint
     *        Point with x/y props that's dodging/escaping.
     *
     * @param {Object} toPoint
     *        Goal point.
     *
     * @param {boolean} dirIsX
     *        Dodge in X dimension.
     *
     * @param {Object} bounds
     *        Hard and soft boundaries.
     *
     * @return {boolean}
     *         Use max or not.
     */
    function getDodgeDirection(obstacle, fromPoint, toPoint, dirIsX, bounds) {
        const softBounds = bounds.soft, hardBounds = bounds.hard, dir = dirIsX ? 'x' : 'y', toPointMax = { x: fromPoint.x, y: fromPoint.y }, toPointMin = { x: fromPoint.x, y: fromPoint.y }, maxOutOfSoftBounds = obstacle[dir + 'Max'] >=
            softBounds[dir + 'Max'], minOutOfSoftBounds = obstacle[dir + 'Min'] <=
            softBounds[dir + 'Min'], maxOutOfHardBounds = obstacle[dir + 'Max'] >=
            hardBounds[dir + 'Max'], minOutOfHardBounds = obstacle[dir + 'Min'] <=
            hardBounds[dir + 'Min'], 
        // Find out if we should prefer one direction over the other if
        // we can choose freely
        minDistance = abs(obstacle[dir + 'Min'] - fromPoint[dir]), maxDistance = abs(obstacle[dir + 'Max'] - fromPoint[dir]);
        let // If it's a small difference, pick the one leading towards dest
        // point. Otherwise pick the shortest distance
        useMax = abs(minDistance - maxDistance) < 10 ?
            fromPoint[dir] < toPoint[dir] :
            maxDistance < minDistance;
        // Check if we hit any obstacles trying to go around in either
        // direction.
        toPointMin[dir] = obstacle[dir + 'Min'];
        toPointMax[dir] = obstacle[dir + 'Max'];
        const minPivot = pivotPoint(fromPoint, toPointMin, dirIsX)[dir] !==
            toPointMin[dir], maxPivot = pivotPoint(fromPoint, toPointMax, dirIsX)[dir] !==
            toPointMax[dir];
        useMax = minPivot ?
            (maxPivot ? useMax : true) :
            (maxPivot ? false : useMax);
        // `useMax` now contains our preferred choice, bounds not taken into
        // account. If both or neither direction is out of bounds we want to
        // use this.
        // Deal with soft bounds
        useMax = minOutOfSoftBounds ?
            (maxOutOfSoftBounds ? useMax : true) : // Out on min
            (maxOutOfSoftBounds ? false : useMax); // Not out on min
        // Deal with hard bounds
        useMax = minOutOfHardBounds ?
            (maxOutOfHardBounds ? useMax : true) : // Out on min
            (maxOutOfHardBounds ? false : useMax); // Not out on min
        return useMax;
    }
    // eslint-disable-next-line valid-jsdoc
    /**
     * Find a clear path between point.
     * @private
     */
    function clearPathTo(fromPoint, toPoint, dirIsX) {
        // Don't waste time if we've hit goal
        if (fromPoint.x === toPoint.x && fromPoint.y === toPoint.y) {
            return [];
        }
        const dir = dirIsX ? 'x' : 'y', obstacleMargin = options.obstacleOptions.margin, bounds = {
            soft: {
                xMin: softMinX,
                xMax: softMaxX,
                yMin: softMinY,
                yMax: softMaxY
            },
            hard: options.hardBounds
        };
        let pivot, segments, waypoint, waypointUseMax, envelopingObstacle, secondEnvelopingObstacle, envelopWaypoint;
        // If fromPoint is inside an obstacle we have a problem. Break out
        // by just going to the outside of this obstacle. We prefer to go to
        // the nearest edge in the chosen direction.
        envelopingObstacle =
            findObstacleFromPoint(chartObstacles, fromPoint);
        if (envelopingObstacle > -1) {
            envelopingObstacle = chartObstacles[envelopingObstacle];
            waypointUseMax = getDodgeDirection(envelopingObstacle, fromPoint, toPoint, dirIsX, bounds);
            // Cut obstacle to hard bounds to make sure we stay within
            limitObstacleToBounds(envelopingObstacle, options.hardBounds);
            envelopWaypoint = dirIsX ? {
                y: fromPoint.y,
                x: envelopingObstacle[waypointUseMax ? 'xMax' : 'xMin'] +
                    (waypointUseMax ? 1 : -1)
            } : {
                x: fromPoint.x,
                y: envelopingObstacle[waypointUseMax ? 'yMax' : 'yMin'] +
                    (waypointUseMax ? 1 : -1)
            };
            // If we crashed into another obstacle doing this, we put the
            // waypoint between them instead
            secondEnvelopingObstacle = findObstacleFromPoint(chartObstacles, envelopWaypoint);
            if (secondEnvelopingObstacle > -1) {
                secondEnvelopingObstacle = chartObstacles[secondEnvelopingObstacle];
                // Cut obstacle to hard bounds
                limitObstacleToBounds(secondEnvelopingObstacle, options.hardBounds);
                // Modify waypoint to lay between obstacles
                envelopWaypoint[dir] = waypointUseMax ? PathfinderAlgorithms_max(envelopingObstacle[dir + 'Max'] - obstacleMargin + 1, (secondEnvelopingObstacle[dir + 'Min'] +
                    envelopingObstacle[dir + 'Max']) / 2) :
                    PathfinderAlgorithms_min((envelopingObstacle[dir + 'Min'] + obstacleMargin - 1), ((secondEnvelopingObstacle[dir + 'Max'] +
                        envelopingObstacle[dir + 'Min']) / 2));
                // We are not going anywhere. If this happens for the first
                // time, do nothing. Otherwise, try to go to the extreme of
                // the obstacle pair in the current direction.
                if (fromPoint.x === envelopWaypoint.x &&
                    fromPoint.y === envelopWaypoint.y) {
                    if (forceObstacleBreak) {
                        envelopWaypoint[dir] = waypointUseMax ?
                            PathfinderAlgorithms_max(envelopingObstacle[dir + 'Max'], secondEnvelopingObstacle[dir + 'Max']) + 1 :
                            PathfinderAlgorithms_min(envelopingObstacle[dir + 'Min'], secondEnvelopingObstacle[dir + 'Min']) - 1;
                    }
                    // Toggle on if off, and the opposite
                    forceObstacleBreak = !forceObstacleBreak;
                }
                else {
                    // This point is not identical to previous.
                    // Clear break trigger.
                    forceObstacleBreak = false;
                }
            }
            segments = [{
                    start: fromPoint,
                    end: envelopWaypoint
                }];
        }
        else { // If not enveloping, use standard pivot calculation
            pivot = pivotPoint(fromPoint, {
                x: dirIsX ? toPoint.x : fromPoint.x,
                y: dirIsX ? fromPoint.y : toPoint.y
            }, dirIsX);
            segments = [{
                    start: fromPoint,
                    end: {
                        x: pivot.x,
                        y: pivot.y
                    }
                }];
            // Pivot before goal, use a waypoint to dodge obstacle
            if (pivot[dirIsX ? 'x' : 'y'] !== toPoint[dirIsX ? 'x' : 'y']) {
                // Find direction of waypoint
                waypointUseMax = getDodgeDirection(pivot.obstacle, pivot, toPoint, !dirIsX, bounds);
                // Cut waypoint to hard bounds
                limitObstacleToBounds(pivot.obstacle, options.hardBounds);
                waypoint = {
                    x: dirIsX ?
                        pivot.x :
                        pivot.obstacle[waypointUseMax ? 'xMax' : 'xMin'] +
                            (waypointUseMax ? 1 : -1),
                    y: dirIsX ?
                        pivot.obstacle[waypointUseMax ? 'yMax' : 'yMin'] +
                            (waypointUseMax ? 1 : -1) :
                        pivot.y
                };
                // We're changing direction here, store that to make sure we
                // also change direction when adding the last segment array
                // after handling waypoint.
                dirIsX = !dirIsX;
                segments = segments.concat(clearPathTo({
                    x: pivot.x,
                    y: pivot.y
                }, waypoint, dirIsX));
            }
        }
        // Get segments for the other direction too
        // Recursion is our friend
        segments = segments.concat(clearPathTo(segments[segments.length - 1].end, toPoint, !dirIsX));
        return segments;
    }
    // eslint-disable-next-line valid-jsdoc
    /**
     * Extract point to outside of obstacle in whichever direction is
     * closest. Returns new point outside obstacle.
     * @private
     */
    function extractFromObstacle(obstacle, point, goalPoint) {
        const dirIsX = PathfinderAlgorithms_min(obstacle.xMax - point.x, point.x - obstacle.xMin) <
            PathfinderAlgorithms_min(obstacle.yMax - point.y, point.y - obstacle.yMin), bounds = {
            soft: options.hardBounds,
            hard: options.hardBounds
        }, useMax = getDodgeDirection(obstacle, point, goalPoint, dirIsX, bounds);
        return dirIsX ? {
            y: point.y,
            x: obstacle[useMax ? 'xMax' : 'xMin'] + (useMax ? 1 : -1)
        } : {
            x: point.x,
            y: obstacle[useMax ? 'yMax' : 'yMin'] + (useMax ? 1 : -1)
        };
    }
    // Cut the obstacle array to soft bounds for optimization in large
    // datasets.
    chartObstacles =
        chartObstacles.slice(startObstacleIx, endObstacleIx + 1);
    // If an obstacle envelops the end point, move it out of there and add
    // a little segment to where it was.
    if ((endObstacleIx = findObstacleFromPoint(chartObstacles, end)) > -1) {
        extractedEndPoint = extractFromObstacle(chartObstacles[endObstacleIx], end, start);
        endSegments.push({
            end: end,
            start: extractedEndPoint
        });
        end = extractedEndPoint;
    }
    // If it's still inside one or more obstacles, get out of there by
    // force-moving towards the start point.
    while ((endObstacleIx = findObstacleFromPoint(chartObstacles, end)) > -1) {
        useMax = end[dir] - start[dir] < 0;
        extractedEndPoint = {
            x: end.x,
            y: end.y
        };
        extractedEndPoint[dir] = chartObstacles[endObstacleIx][useMax ? dir + 'Max' : dir + 'Min'] + (useMax ? 1 : -1);
        endSegments.push({
            end: end,
            start: extractedEndPoint
        });
        end = extractedEndPoint;
    }
    // Find the path
    segments = clearPathTo(start, end, dirIsX);
    // Add the end-point segments
    segments = segments.concat(endSegments.reverse());
    return {
        path: pathFromSegments(segments),
        obstacles: segments
    };
}
fastAvoid.requiresObstacles = true;
/* *
 *
 *  Default Export
 *
 * */
// Define the available pathfinding algorithms.
// Algorithms take up to 3 arguments: starting point, ending point, and an
// options object.
const algorithms = {
    fastAvoid,
    straight,
    simpleConnect
};
/* harmony default export */ const PathfinderAlgorithms = (algorithms);

;// ./code/es-modules/Gantt/ConnectorsDefaults.js
/* *
 *
 *  (c) 2016 Highsoft AS
 *  Authors: Øystein Moseng, Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

/* *
 *
 *  API Defaults
 *
 * */
/*
 @todo:
     - Document how to write your own algorithms
     - Consider adding a Point.pathTo method that wraps creating a connection
       and rendering it
*/
const connectorsDefaults = {
    /**
     * The Pathfinder module allows you to define connections between any two
     * points, represented as lines - optionally with markers for the start
     * and/or end points. Multiple algorithms are available for calculating how
     * the connecting lines are drawn.
     *
     * Connector functionality requires Highcharts Gantt to be loaded. In Gantt
     * charts, the connectors are used to draw dependencies between tasks.
     *
     * @see [dependency](series.gantt.data.dependency)
     *
     * @sample gantt/pathfinder/demo
     *         Pathfinder connections
     *
     * @declare      Highcharts.ConnectorsOptions
     * @product      gantt
     * @optionparent connectors
     */
    connectors: {
        /**
         * Enable connectors for this chart. Requires Highcharts Gantt.
         *
         * @type      {boolean}
         * @default   true
         * @since     6.2.0
         * @apioption connectors.enabled
         */
        /**
         * Set the default dash style for this chart's connecting lines.
         *
         * @type      {string}
         * @default   solid
         * @since     6.2.0
         * @apioption connectors.dashStyle
         */
        /**
         * Set the default color for this chart's Pathfinder connecting lines.
         * Defaults to the color of the point being connected.
         *
         * @type      {Highcharts.ColorString}
         * @since     6.2.0
         * @apioption connectors.lineColor
         */
        /**
         * Set the default pathfinder margin to use, in pixels. Some Pathfinder
         * algorithms attempt to avoid obstacles, such as other points in the
         * chart. These algorithms use this margin to determine how close lines
         * can be to an obstacle. The default is to compute this automatically
         * from the size of the obstacles in the chart.
         *
         * To draw connecting lines close to existing points, set this to a low
         * number. For more space around existing points, set this number
         * higher.
         *
         * @sample gantt/pathfinder/algorithm-margin
         *         Small algorithmMargin
         *
         * @type      {number}
         * @since     6.2.0
         * @apioption connectors.algorithmMargin
         */
        /**
         * Set the default pathfinder algorithm to use for this chart. It is
         * possible to define your own algorithms by adding them to the
         * Highcharts.Pathfinder.prototype.algorithms object before the chart
         * has been created.
         *
         * The default algorithms are as follows:
         *
         * `straight`:      Draws a straight line between the connecting
         *                  points. Does not avoid other points when drawing.
         *
         * `simpleConnect`: Finds a path between the points using right angles
         *                  only. Takes only starting/ending points into
         *                  account, and will not avoid other points.
         *
         * `fastAvoid`:     Finds a path between the points using right angles
         *                  only. Will attempt to avoid other points, but its
         *                  focus is performance over accuracy. Works well with
         *                  less dense datasets.
         *
         * Default value: `straight` is used as default for most series types,
         * while `simpleConnect` is used as default for Gantt series, to show
         * dependencies between points.
         *
         * @sample gantt/pathfinder/demo
         *         Different types used
         *
         * @type    {Highcharts.PathfinderTypeValue}
         * @default undefined
         * @since   6.2.0
         */
        type: 'straight',
        /**
         * The corner radius for the connector line.
         *
         * @since 11.2.0
         */
        radius: 0,
        /**
         * Set the default pixel width for this chart's Pathfinder connecting
         * lines.
         *
         * @since 6.2.0
         */
        lineWidth: 1,
        /**
         * Marker options for this chart's Pathfinder connectors. Note that
         * this option is overridden by the `startMarker` and `endMarker`
         * options.
         *
         * @declare Highcharts.ConnectorsMarkerOptions
         * @since   6.2.0
         */
        marker: {
            /**
             * Set the radius of the connector markers. The default is
             * automatically computed based on the algorithmMargin setting.
             *
             * Setting marker.width and marker.height will override this
             * setting.
             *
             * @type      {number}
             * @since     6.2.0
             * @apioption connectors.marker.radius
             */
            /**
             * Set the width of the connector markers. If not supplied, this
             * is inferred from the marker radius.
             *
             * @type      {number}
             * @since     6.2.0
             * @apioption connectors.marker.width
             */
            /**
             * Set the height of the connector markers. If not supplied, this
             * is inferred from the marker radius.
             *
             * @type      {number}
             * @since     6.2.0
             * @apioption connectors.marker.height
             */
            /**
             * Set the color of the connector markers. By default this is the
             * same as the connector color.
             *
             * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
             * @since     6.2.0
             * @apioption connectors.marker.color
             */
            /**
             * Set the line/border color of the connector markers. By default
             * this is the same as the marker color.
             *
             * @type      {Highcharts.ColorString}
             * @since     6.2.0
             * @apioption connectors.marker.lineColor
             */
            /**
             * Enable markers for the connectors.
             */
            enabled: false,
            /**
             * Horizontal alignment of the markers relative to the points.
             *
             * @type {Highcharts.AlignValue}
             */
            align: 'center',
            /**
             * Vertical alignment of the markers relative to the points.
             *
             * @type {Highcharts.VerticalAlignValue}
             */
            verticalAlign: 'middle',
            /**
             * Whether or not to draw the markers inside the points.
             */
            inside: false,
            /**
             * Set the line/border width of the pathfinder markers.
             */
            lineWidth: 1
        },
        /**
         * Marker options specific to the start markers for this chart's
         * Pathfinder connectors. Overrides the generic marker options.
         *
         * @declare Highcharts.ConnectorsStartMarkerOptions
         * @extends connectors.marker
         * @since   6.2.0
         */
        startMarker: {
            /**
             * Set the symbol of the connector start markers.
             */
            symbol: 'diamond'
        },
        /**
         * Marker options specific to the end markers for this chart's
         * Pathfinder connectors. Overrides the generic marker options.
         *
         * @declare Highcharts.ConnectorsEndMarkerOptions
         * @extends connectors.marker
         * @since   6.2.0
         */
        endMarker: {
            /**
             * Set the symbol of the connector end markers.
             */
            symbol: 'arrow-filled'
        }
    }
};
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const ConnectorsDefaults = (connectorsDefaults);
/* *
 *
 *  API Options
 *
 * */
/**
 * Override Pathfinder connector options for a series. Requires Highcharts Gantt
 * to be loaded.
 *
 * @declare   Highcharts.SeriesConnectorsOptionsObject
 * @extends   connectors
 * @since     6.2.0
 * @excluding enabled, algorithmMargin
 * @product   gantt
 * @apioption plotOptions.series.connectors
 */
/**
 * Connect to a point. This option can be either a string, referring to the ID
 * of another point, or an object, or an array of either. If the option is an
 * array, each element defines a connection.
 *
 * @sample gantt/pathfinder/demo
 *         Different connection types
 *
 * @declare   Highcharts.XrangePointConnectorsOptionsObject
 * @type      {string|Array<string|*>|*}
 * @extends   plotOptions.series.connectors
 * @since     6.2.0
 * @excluding enabled
 * @product   gantt
 * @requires  highcharts-gantt
 * @apioption series.xrange.data.connect
 */
/**
 * The ID of the point to connect to.
 *
 * @type      {string}
 * @since     6.2.0
 * @product   gantt
 * @apioption series.xrange.data.connect.to
 */
''; // Keeps doclets above in JS file

;// ./code/es-modules/Gantt/PathfinderComposition.js
/* *
 *
 *  (c) 2016 Highsoft AS
 *  Authors: Øystein Moseng, Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */



const { setOptions } = (external_highcharts_src_js_default_default());

const { defined: PathfinderComposition_defined, error: PathfinderComposition_error, merge: PathfinderComposition_merge } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Functions
 *
 * */
/**
 * Get point bounding box using plotX/plotY and shapeArgs. If using
 * graphic.getBBox() directly, the bbox will be affected by animation.
 *
 * @private
 * @function
 *
 * @param {Highcharts.Point} point
 *        The point to get BB of.
 *
 * @return {Highcharts.Dictionary<number>|null}
 *         Result xMax, xMin, yMax, yMin.
 */
function getPointBB(point) {
    const shapeArgs = point.shapeArgs;
    // Prefer using shapeArgs (columns)
    if (shapeArgs) {
        return {
            xMin: shapeArgs.x || 0,
            xMax: (shapeArgs.x || 0) + (shapeArgs.width || 0),
            yMin: shapeArgs.y || 0,
            yMax: (shapeArgs.y || 0) + (shapeArgs.height || 0)
        };
    }
    // Otherwise use plotX/plotY and bb
    const bb = point.graphic && point.graphic.getBBox();
    return bb ? {
        xMin: point.plotX - bb.width / 2,
        xMax: point.plotX + bb.width / 2,
        yMin: point.plotY - bb.height / 2,
        yMax: point.plotY + bb.height / 2
    } : null;
}
/**
 * Warn if using legacy options. Copy the options over. Note that this will
 * still break if using the legacy options in chart.update, addSeries etc.
 * @private
 */
function warnLegacy(chart) {
    if (chart.options.pathfinder ||
        chart.series.reduce(function (acc, series) {
            if (series.options) {
                PathfinderComposition_merge(true, (series.options.connectors = series.options.connectors ||
                    {}), series.options.pathfinder);
            }
            return acc || series.options && series.options.pathfinder;
        }, false)) {
        PathfinderComposition_merge(true, (chart.options.connectors = chart.options.connectors || {}), chart.options.pathfinder);
        PathfinderComposition_error('WARNING: Pathfinder options have been renamed. ' +
            'Use "chart.connectors" or "series.connectors" instead.');
    }
}
/* *
 *
 *  Composition
 *
 * */
var ConnectionComposition;
(function (ConnectionComposition) {
    /* *
     *
     *  Functions
     *
     * */
    /** @private */
    function compose(ChartClass, PathfinderClass, PointClass) {
        const pointProto = PointClass.prototype;
        if (!pointProto.getPathfinderAnchorPoint) {
            // Initialize Pathfinder for charts
            ChartClass.prototype.callbacks.push(function (chart) {
                const options = chart.options;
                if (options.connectors.enabled !== false) {
                    warnLegacy(chart);
                    this.pathfinder = new PathfinderClass(this);
                    this.pathfinder.update(true); // First draw, defer render
                }
            });
            pointProto.getMarkerVector = pointGetMarkerVector;
            pointProto.getPathfinderAnchorPoint = pointGetPathfinderAnchorPoint;
            pointProto.getRadiansToVector = pointGetRadiansToVector;
            // Set default Pathfinder options
            setOptions(ConnectorsDefaults);
        }
    }
    ConnectionComposition.compose = compose;
    /**
     * Get coordinates of anchor point for pathfinder connection.
     *
     * @private
     * @function Highcharts.Point#getPathfinderAnchorPoint
     *
     * @param {Highcharts.ConnectorsMarkerOptions} markerOptions
     *        Connection options for position on point.
     *
     * @return {Highcharts.PositionObject}
     *         An object with x/y properties for the position. Coordinates are
     *         in plot values, not relative to point.
     */
    function pointGetPathfinderAnchorPoint(markerOptions) {
        const bb = getPointBB(this);
        let x, y;
        switch (markerOptions.align) { // eslint-disable-line default-case
            case 'right':
                x = 'xMax';
                break;
            case 'left':
                x = 'xMin';
        }
        switch (markerOptions.verticalAlign) { // eslint-disable-line default-case
            case 'top':
                y = 'yMin';
                break;
            case 'bottom':
                y = 'yMax';
        }
        return {
            x: x ? bb[x] : (bb.xMin + bb.xMax) / 2,
            y: y ? bb[y] : (bb.yMin + bb.yMax) / 2
        };
    }
    /**
     * Utility to get the angle from one point to another.
     *
     * @private
     * @function Highcharts.Point#getRadiansToVector
     *
     * @param {Highcharts.PositionObject} v1
     *        The first vector, as an object with x/y properties.
     *
     * @param {Highcharts.PositionObject} v2
     *        The second vector, as an object with x/y properties.
     *
     * @return {number}
     *         The angle in degrees
     */
    function pointGetRadiansToVector(v1, v2) {
        let box;
        if (!PathfinderComposition_defined(v2)) {
            box = getPointBB(this);
            if (box) {
                v2 = {
                    x: (box.xMin + box.xMax) / 2,
                    y: (box.yMin + box.yMax) / 2
                };
            }
        }
        return Math.atan2(v2.y - v1.y, v1.x - v2.x);
    }
    /**
     * Utility to get the position of the marker, based on the path angle and
     * the marker's radius.
     *
     * @private
     * @function Highcharts.Point#getMarkerVector
     *
     * @param {number} radians
     *        The angle in radians from the point center to another vector.
     *
     * @param {number} markerRadius
     *        The radius of the marker, to calculate the additional distance to
     *        the center of the marker.
     *
     * @param {Object} anchor
     *        The anchor point of the path and marker as an object with x/y
     *        properties.
     *
     * @return {Object}
     *         The marker vector as an object with x/y properties.
     */
    function pointGetMarkerVector(radians, markerRadius, anchor) {
        const twoPI = Math.PI * 2.0, bb = getPointBB(this), rectWidth = bb.xMax - bb.xMin, rectHeight = bb.yMax - bb.yMin, rAtan = Math.atan2(rectHeight, rectWidth), rectHalfWidth = rectWidth / 2.0, rectHalfHeight = rectHeight / 2.0, rectHorizontalCenter = bb.xMin + rectHalfWidth, rectVerticalCenter = bb.yMin + rectHalfHeight, edgePoint = {
            x: rectHorizontalCenter,
            y: rectVerticalCenter
        };
        let theta = radians, tanTheta = 1, leftOrRightRegion = false, xFactor = 1, yFactor = 1;
        while (theta < -Math.PI) {
            theta += twoPI;
        }
        while (theta > Math.PI) {
            theta -= twoPI;
        }
        tanTheta = Math.tan(theta);
        if ((theta > -rAtan) && (theta <= rAtan)) {
            // Right side
            yFactor = -1;
            leftOrRightRegion = true;
        }
        else if (theta > rAtan && theta <= (Math.PI - rAtan)) {
            // Top side
            yFactor = -1;
        }
        else if (theta > (Math.PI - rAtan) || theta <= -(Math.PI - rAtan)) {
            // Left side
            xFactor = -1;
            leftOrRightRegion = true;
        }
        else {
            // Bottom side
            xFactor = -1;
        }
        // Correct the edgePoint according to the placement of the marker
        if (leftOrRightRegion) {
            edgePoint.x += xFactor * (rectHalfWidth);
            edgePoint.y += yFactor * (rectHalfWidth) * tanTheta;
        }
        else {
            edgePoint.x += xFactor * (rectHeight / (2.0 * tanTheta));
            edgePoint.y += yFactor * (rectHalfHeight);
        }
        if (anchor.x !== rectHorizontalCenter) {
            edgePoint.x = anchor.x;
        }
        if (anchor.y !== rectVerticalCenter) {
            edgePoint.y = anchor.y;
        }
        return {
            x: edgePoint.x + (markerRadius * Math.cos(theta)),
            y: edgePoint.y - (markerRadius * Math.sin(theta))
        };
    }
})(ConnectionComposition || (ConnectionComposition = {}));
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const PathfinderComposition = (ConnectionComposition);

;// external ["../highcharts.src.js","default","Point"]
const external_highcharts_src_js_default_Point_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].Point;
var external_highcharts_src_js_default_Point_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_Point_namespaceObject);
;// ./code/es-modules/Gantt/Pathfinder.js
/* *
 *
 *  (c) 2016 Highsoft AS
 *  Authors: Øystein Moseng, Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */






const { addEvent: Pathfinder_addEvent, defined: Pathfinder_defined, pick: Pathfinder_pick, splat: Pathfinder_splat } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Constants
 *
 * */
const Pathfinder_max = Math.max, Pathfinder_min = Math.min;
/* *
 *
 *  Functions
 *
 * */
/**
 * Get point bounding box using plotX/plotY and shapeArgs. If using
 * graphic.getBBox() directly, the bbox will be affected by animation.
 *
 * @private
 * @function
 *
 * @param {Highcharts.Point} point
 *        The point to get BB of.
 *
 * @return {Highcharts.Dictionary<number>|null}
 *         Result xMax, xMin, yMax, yMin.
 */
function Pathfinder_getPointBB(point) {
    const shapeArgs = point.shapeArgs;
    // Prefer using shapeArgs (columns)
    if (shapeArgs) {
        return {
            xMin: shapeArgs.x || 0,
            xMax: (shapeArgs.x || 0) + (shapeArgs.width || 0),
            yMin: shapeArgs.y || 0,
            yMax: (shapeArgs.y || 0) + (shapeArgs.height || 0)
        };
    }
    // Otherwise use plotX/plotY and bb
    const bb = point.graphic && point.graphic.getBBox();
    return bb ? {
        xMin: point.plotX - bb.width / 2,
        xMax: point.plotX + bb.width / 2,
        yMin: point.plotY - bb.height / 2,
        yMax: point.plotY + bb.height / 2
    } : null;
}
/**
 * Compute smallest distance between two rectangles.
 * @private
 */
function calculateObstacleDistance(a, b, bbMargin) {
    // Count the distance even if we are slightly off
    const margin = Pathfinder_pick(bbMargin, 10), yOverlap = a.yMax + margin > b.yMin - margin &&
        a.yMin - margin < b.yMax + margin, xOverlap = a.xMax + margin > b.xMin - margin &&
        a.xMin - margin < b.xMax + margin, xDistance = yOverlap ? (a.xMin > b.xMax ? a.xMin - b.xMax : b.xMin - a.xMax) : Infinity, yDistance = xOverlap ? (a.yMin > b.yMax ? a.yMin - b.yMax : b.yMin - a.yMax) : Infinity;
    // If the rectangles collide, try recomputing with smaller margin.
    // If they collide anyway, discard the obstacle.
    if (xOverlap && yOverlap) {
        return (margin ?
            calculateObstacleDistance(a, b, Math.floor(margin / 2)) :
            Infinity);
    }
    return Pathfinder_min(xDistance, yDistance);
}
/**
 * Calculate margin to place around obstacles for the pathfinder in pixels.
 * Returns a minimum of 1 pixel margin.
 *
 * @private
 * @function
 *
 * @param {Array<object>} obstacles
 *        Obstacles to calculate margin from.
 *
 * @return {number}
 *         The calculated margin in pixels. At least 1.
 */
function calculateObstacleMargin(obstacles) {
    const len = obstacles.length, distances = [];
    let onstacleDistance;
    // Go over all obstacles and compare them to the others.
    for (let i = 0; i < len; ++i) {
        // Compare to all obstacles ahead. We will already have compared this
        // obstacle to the ones before.
        for (let j = i + 1; j < len; ++j) {
            onstacleDistance =
                calculateObstacleDistance(obstacles[i], obstacles[j]);
            // TODO: Magic number 80
            if (onstacleDistance < 80) { // Ignore large distances
                distances.push(onstacleDistance);
            }
        }
    }
    // Ensure we always have at least one value, even in very spacious charts
    distances.push(80);
    return Pathfinder_max(Math.floor(distances.sort(function (a, b) {
        return (a - b);
    })[
    // Discard first 10% of the relevant distances, and then grab
    // the smallest one.
    Math.floor(distances.length / 10)] / 2 - 1 // Divide the distance by 2 and subtract 1.
    ), 1 // 1 is the minimum margin
    );
}
/* *
 *
 *  Class
 *
 * */
/**
 * The Pathfinder class.
 *
 * @private
 * @class
 * @name Highcharts.Pathfinder
 *
 * @param {Highcharts.Chart} chart
 *        The chart to operate on.
 */
class Pathfinder {
    /* *
     *
     *  Static Functions
     *
     * */
    static compose(ChartClass, PointClass) {
        PathfinderComposition.compose(ChartClass, Pathfinder, PointClass);
    }
    /* *
     *
     *  Constructor
     *
     * */
    constructor(chart) {
        this.init(chart);
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Initialize the Pathfinder object.
     *
     * @function Highcharts.Pathfinder#init
     *
     * @param {Highcharts.Chart} chart
     *        The chart context.
     */
    init(chart) {
        // Initialize pathfinder with chart context
        this.chart = chart;
        // Init connection reference list
        this.connections = [];
        // Recalculate paths/obstacles on chart redraw
        Pathfinder_addEvent(chart, 'redraw', function () {
            this.pathfinder.update();
        });
    }
    /**
     * Update Pathfinder connections from scratch.
     *
     * @function Highcharts.Pathfinder#update
     *
     * @param {boolean} [deferRender]
     *        Whether or not to defer rendering of connections until
     *        series.afterAnimate event has fired. Used on first render.
     */
    update(deferRender) {
        const chart = this.chart, pathfinder = this, oldConnections = pathfinder.connections;
        // Rebuild pathfinder connections from options
        pathfinder.connections = [];
        chart.series.forEach(function (series) {
            if (series.visible && !series.options.isInternal) {
                series.points.forEach(function (point) {
                    const ganttPointOptions = point.options;
                    // For Gantt series the connect could be
                    // defined as a dependency
                    if (ganttPointOptions && ganttPointOptions.dependency) {
                        ganttPointOptions.connect = ganttPointOptions
                            .dependency;
                    }
                    const connects = point.options?.connect ?
                        Pathfinder_splat(point.options.connect) :
                        [];
                    let to;
                    if (point.visible && point.isInside !== false) {
                        connects.forEach((connect) => {
                            const toId = typeof connect === 'string' ?
                                connect :
                                connect.to;
                            if (toId) {
                                to = chart.get(toId);
                            }
                            if (to instanceof (external_highcharts_src_js_default_Point_default()) &&
                                to.series.visible &&
                                to.visible &&
                                to.isInside !== false) {
                                // Add new connection
                                pathfinder.connections.push(new Gantt_Connection(point, // From
                                to, typeof connect === 'string' ?
                                    {} :
                                    connect));
                            }
                        });
                    }
                });
            }
        });
        // Clear connections that should not be updated, and move old info over
        // to new connections.
        for (let j = 0, k, found, lenOld = oldConnections.length, lenNew = pathfinder.connections.length; j < lenOld; ++j) {
            found = false;
            const oldCon = oldConnections[j];
            for (k = 0; k < lenNew; ++k) {
                const newCon = pathfinder.connections[k];
                if ((oldCon.options && oldCon.options.type) ===
                    (newCon.options && newCon.options.type) &&
                    oldCon.fromPoint === newCon.fromPoint &&
                    oldCon.toPoint === newCon.toPoint) {
                    newCon.graphics = oldCon.graphics;
                    found = true;
                    break;
                }
            }
            if (!found) {
                oldCon.destroy();
            }
        }
        // Clear obstacles to force recalculation. This must be done on every
        // redraw in case positions have changed. Recalculation is handled in
        // Connection.getPath on demand.
        delete this.chartObstacles;
        delete this.lineObstacles;
        // Draw the pending connections
        pathfinder.renderConnections(deferRender);
    }
    /**
     * Draw the chart's connecting paths.
     *
     * @function Highcharts.Pathfinder#renderConnections
     *
     * @param {boolean} [deferRender]
     *        Whether or not to defer render until series animation is finished.
     *        Used on first render.
     */
    renderConnections(deferRender) {
        if (deferRender) {
            // Render after series are done animating
            this.chart.series.forEach(function (series) {
                const render = function () {
                    // Find pathfinder connections belonging to this series
                    // that haven't rendered, and render them now.
                    const pathfinder = series.chart.pathfinder, conns = pathfinder && pathfinder.connections || [];
                    conns.forEach(function (connection) {
                        if (connection.fromPoint &&
                            connection.fromPoint.series === series) {
                            connection.render();
                        }
                    });
                    if (series.pathfinderRemoveRenderEvent) {
                        series.pathfinderRemoveRenderEvent();
                        delete series.pathfinderRemoveRenderEvent;
                    }
                };
                if (series.options.animation === false) {
                    render();
                }
                else {
                    series.pathfinderRemoveRenderEvent = Pathfinder_addEvent(series, 'afterAnimate', render);
                }
            });
        }
        else {
            // Go through connections and render them
            this.connections.forEach(function (connection) {
                connection.render();
            });
        }
    }
    /**
     * Get obstacles for the points in the chart. Does not include connecting
     * lines from Pathfinder. Applies algorithmMargin to the obstacles.
     *
     * @function Highcharts.Pathfinder#getChartObstacles
     *
     * @param {Object} options
     *        Options for the calculation. Currently only
     *        `options.algorithmMargin`.
     *
     * @param {number} options.algorithmMargin
     *        The algorithm margin to use for the obstacles.

    * @return {Array<object>}
     *         An array of calculated obstacles. Each obstacle is defined as an
     *         object with xMin, xMax, yMin and yMax properties.
     */
    getChartObstacles(options) {
        const series = this.chart.series, margin = Pathfinder_pick(options.algorithmMargin, 0);
        let obstacles = [], calculatedMargin;
        for (let i = 0, sLen = series.length; i < sLen; ++i) {
            if (series[i].visible && !series[i].options.isInternal) {
                for (let j = 0, pLen = series[i].points.length, bb, point; j < pLen; ++j) {
                    point = series[i].points[j];
                    if (point.visible) {
                        bb = Pathfinder_getPointBB(point);
                        if (bb) {
                            obstacles.push({
                                xMin: bb.xMin - margin,
                                xMax: bb.xMax + margin,
                                yMin: bb.yMin - margin,
                                yMax: bb.yMax + margin
                            });
                        }
                    }
                }
            }
        }
        // Sort obstacles by xMin for optimization
        obstacles = obstacles.sort(function (a, b) {
            return a.xMin - b.xMin;
        });
        // Add auto-calculated margin if the option is not defined
        if (!Pathfinder_defined(options.algorithmMargin)) {
            calculatedMargin =
                options.algorithmMargin =
                    calculateObstacleMargin(obstacles);
            obstacles.forEach(function (obstacle) {
                obstacle.xMin -= calculatedMargin;
                obstacle.xMax += calculatedMargin;
                obstacle.yMin -= calculatedMargin;
                obstacle.yMax += calculatedMargin;
            });
        }
        return obstacles;
    }
    /**
     * Utility function to get metrics for obstacles:
     * - Widest obstacle width
     * - Tallest obstacle height
     *
     * @function Highcharts.Pathfinder#getObstacleMetrics
     *
     * @param {Array<object>} obstacles
     *        An array of obstacles to inspect.
     *
     * @return {Object}
     *         The calculated metrics, as an object with maxHeight and maxWidth
     *         properties.
     */
    getObstacleMetrics(obstacles) {
        let maxWidth = 0, maxHeight = 0, width, height, i = obstacles.length;
        while (i--) {
            width = obstacles[i].xMax - obstacles[i].xMin;
            height = obstacles[i].yMax - obstacles[i].yMin;
            if (maxWidth < width) {
                maxWidth = width;
            }
            if (maxHeight < height) {
                maxHeight = height;
            }
        }
        return {
            maxHeight: maxHeight,
            maxWidth: maxWidth
        };
    }
    /**
     * Utility to get which direction to start the pathfinding algorithm
     * (X vs Y), calculated from a set of marker options.
     *
     * @function Highcharts.Pathfinder#getAlgorithmStartDirection
     *
     * @param {Highcharts.ConnectorsMarkerOptions} markerOptions
     *        Marker options to calculate from.
     *
     * @return {boolean}
     *         Returns true for X, false for Y, and undefined for autocalculate.
     */
    getAlgorithmStartDirection(markerOptions) {
        const xCenter = markerOptions.align !== 'left' &&
            markerOptions.align !== 'right', yCenter = markerOptions.verticalAlign !== 'top' &&
            markerOptions.verticalAlign !== 'bottom';
        return xCenter ?
            (yCenter ? void 0 : false) : // When x is centered
            (yCenter ? true : void 0); // When x is off-center
    }
}
/**
 * @name Highcharts.Pathfinder#algorithms
 * @type {Highcharts.Dictionary<Function>}
 */
Pathfinder.prototype.algorithms = PathfinderAlgorithms;
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Gantt_Pathfinder = (Pathfinder);
/* *
 *
 *  API Options
 *
 * */
/**
 * The default pathfinder algorithm to use for a chart. It is possible to define
 * your own algorithms by adding them to the
 * `Highcharts.Pathfinder.prototype.algorithms`
 * object before the chart has been created.
 *
 * The default algorithms are as follows:
 *
 * `straight`:      Draws a straight line between the connecting
 *                  points. Does not avoid other points when drawing.
 *
 * `simpleConnect`: Finds a path between the points using right angles
 *                  only. Takes only starting/ending points into
 *                  account, and will not avoid other points.
 *
 * `fastAvoid`:     Finds a path between the points using right angles
 *                  only. Will attempt to avoid other points, but its
 *                  focus is performance over accuracy. Works well with
 *                  less dense datasets.
 *
 * @typedef {"fastAvoid"|"simpleConnect"|"straight"|string} Highcharts.PathfinderTypeValue
 */
''; // Keeps doclets above in JS file

;// ./code/es-modules/Extensions/StaticScale.js
/* *
 *
 *  (c) 2016-2025 Torstein Honsi, Lars Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { addEvent: StaticScale_addEvent, defined: StaticScale_defined, isNumber: StaticScale_isNumber, pick: StaticScale_pick } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Composition
 *
 * */
/** @private */
function StaticScale_compose(AxisClass, ChartClass) {
    const chartProto = ChartClass.prototype;
    if (!chartProto.adjustHeight) {
        StaticScale_addEvent(AxisClass, 'afterSetOptions', StaticScale_onAxisAfterSetOptions);
        chartProto.adjustHeight = chartAdjustHeight;
        StaticScale_addEvent(ChartClass, 'render', chartProto.adjustHeight);
    }
}
/** @private */
function StaticScale_onAxisAfterSetOptions() {
    const chartOptions = this.chart.options.chart;
    if (!this.horiz &&
        StaticScale_isNumber(this.options.staticScale) &&
        (!chartOptions.height ||
            (chartOptions.scrollablePlotArea &&
                chartOptions.scrollablePlotArea.minHeight))) {
        this.staticScale = this.options.staticScale;
    }
}
/** @private */
function chartAdjustHeight() {
    const chart = this;
    if (chart.redrawTrigger !== 'adjustHeight') {
        for (const axis of (chart.axes || [])) {
            const chart = axis.chart, animate = !!chart.initiatedScale &&
                chart.options.animation, staticScale = axis.options.staticScale;
            if (axis.staticScale && StaticScale_defined(axis.min)) {
                let height = StaticScale_pick(axis.brokenAxis && axis.brokenAxis.unitLength, axis.max + axis.tickInterval - axis.min) * staticScale;
                // Minimum height is 1 x staticScale.
                height = Math.max(height, staticScale);
                const diff = height - chart.plotHeight;
                if (!chart.scrollablePixelsY && Math.abs(diff) >= 1) {
                    chart.plotHeight = height;
                    chart.redrawTrigger = 'adjustHeight';
                    chart.setSize(void 0, chart.chartHeight + diff, animate);
                }
                // Make sure clip rects have the right height before initial
                // animation.
                axis.series.forEach(function (series) {
                    const clipRect = series.sharedClipKey &&
                        chart.sharedClips[series.sharedClipKey];
                    if (clipRect) {
                        clipRect.attr(chart.inverted ? {
                            width: chart.plotHeight
                        } : {
                            height: chart.plotHeight
                        });
                    }
                });
            }
        }
        this.initiatedScale = true;
    }
    this.redrawTrigger = null;
}
/* *
 *
 *  Default Export
 *
 * */
const StaticScale = {
    compose: StaticScale_compose
};
/* harmony default export */ const Extensions_StaticScale = (StaticScale);
/* *
 *
 *  API Options
 *
 * */
/**
 * For vertical axes only. Setting the static scale ensures that each tick unit
 * is translated into a fixed pixel height. For example, setting the static
 * scale to 24 results in each Y axis category taking up 24 pixels, and the
 * height of the chart adjusts. Adding or removing items will make the chart
 * resize.
 *
 * @sample gantt/xrange-series/demo/
 *         X-range series with static scale
 *
 * @type      {number}
 * @default   50
 * @since     6.2.0
 * @product   gantt
 * @apioption yAxis.staticScale
 */
''; // Keeps doclets above in JS file

;// external ["../highcharts.src.js","default","StackItem"]
const external_highcharts_src_js_default_StackItem_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].StackItem;
var external_highcharts_src_js_default_StackItem_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_StackItem_namespaceObject);
;// ./code/es-modules/Core/Axis/BrokenAxis.js
/* *
 *
 *  (c) 2009-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */



const { addEvent: BrokenAxis_addEvent, find: BrokenAxis_find, fireEvent: BrokenAxis_fireEvent, isArray: BrokenAxis_isArray, isNumber: BrokenAxis_isNumber, pick: BrokenAxis_pick } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Composition
 *
 * */
/**
 * Axis with support of broken data rows.
 * @private
 */
var BrokenAxis;
(function (BrokenAxis) {
    /* *
     *
     *  Declarations
     *
     * */
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Adds support for broken axes.
     * @private
     */
    function compose(AxisClass, SeriesClass) {
        if (!AxisClass.keepProps.includes('brokenAxis')) {
            AxisClass.keepProps.push('brokenAxis');
            BrokenAxis_addEvent(AxisClass, 'init', onAxisInit);
            BrokenAxis_addEvent(AxisClass, 'afterInit', onAxisAfterInit);
            BrokenAxis_addEvent(AxisClass, 'afterSetTickPositions', onAxisAfterSetTickPositions);
            BrokenAxis_addEvent(AxisClass, 'afterSetOptions', onAxisAfterSetOptions);
            const seriesProto = SeriesClass.prototype;
            seriesProto.drawBreaks = seriesDrawBreaks;
            seriesProto.gappedPath = seriesGappedPath;
            BrokenAxis_addEvent(SeriesClass, 'afterGeneratePoints', onSeriesAfterGeneratePoints);
            BrokenAxis_addEvent(SeriesClass, 'afterRender', onSeriesAfterRender);
        }
        return AxisClass;
    }
    BrokenAxis.compose = compose;
    /**
     * @private
     */
    function onAxisAfterInit() {
        if (typeof this.brokenAxis !== 'undefined') {
            this.brokenAxis.setBreaks(this.options.breaks, false);
        }
    }
    /**
     * Force Axis to be not-ordinal when breaks are defined.
     * @private
     */
    function onAxisAfterSetOptions() {
        const axis = this;
        if (axis.brokenAxis?.hasBreaks) {
            axis.options.ordinal = false;
        }
    }
    /**
     * @private
     */
    function onAxisAfterSetTickPositions() {
        const axis = this, brokenAxis = axis.brokenAxis;
        if (brokenAxis?.hasBreaks) {
            const tickPositions = axis.tickPositions, info = axis.tickPositions.info, newPositions = [];
            for (let i = 0; i < tickPositions.length; i++) {
                if (!brokenAxis.isInAnyBreak(tickPositions[i])) {
                    newPositions.push(tickPositions[i]);
                }
            }
            axis.tickPositions = newPositions;
            axis.tickPositions.info = info;
        }
    }
    /**
     * @private
     */
    function onAxisInit() {
        const axis = this;
        if (!axis.brokenAxis) {
            axis.brokenAxis = new Additions(axis);
        }
    }
    /**
     * @private
     */
    function onSeriesAfterGeneratePoints() {
        const { isDirty, options: { connectNulls }, points, xAxis, yAxis } = this;
        // Set, or reset visibility of the points. Axis.setBreaks marks
        // the series as isDirty
        if (isDirty) {
            let i = points.length;
            while (i--) {
                const point = points[i];
                // Respect nulls inside the break (#4275)
                const nullGap = point.y === null && connectNulls === false;
                const isPointInBreak = (!nullGap && (xAxis?.brokenAxis?.isInAnyBreak(point.x, true) ||
                    yAxis?.brokenAxis?.isInAnyBreak(point.y, true)));
                // Set point.visible if in any break.
                // If not in break, reset visible to original value.
                point.visible = isPointInBreak ?
                    false :
                    point.options.visible !== false;
            }
        }
    }
    /**
     * @private
     */
    function onSeriesAfterRender() {
        this.drawBreaks(this.xAxis, ['x']);
        this.drawBreaks(this.yAxis, BrokenAxis_pick(this.pointArrayMap, ['y']));
    }
    /**
     * @private
     */
    function seriesDrawBreaks(axis, keys) {
        const series = this, points = series.points;
        let breaks, threshold, y;
        if (axis?.brokenAxis?.hasBreaks) {
            const brokenAxis = axis.brokenAxis;
            keys.forEach(function (key) {
                breaks = brokenAxis?.breakArray || [];
                threshold = axis.isXAxis ?
                    axis.min :
                    BrokenAxis_pick(series.options.threshold, axis.min);
                // Array of breaks that have been "zoomed-out" which means that
                // they were shown previously, but now after zoom, they are not
                // (#19885).
                const breaksOutOfRange = axis?.options?.breaks?.filter(function (brk) {
                    let isOut = true;
                    // Iterate to see if "brk" is in axis range
                    for (let i = 0; i < breaks.length; i++) {
                        const otherBreak = breaks[i];
                        if (otherBreak.from === brk.from &&
                            otherBreak.to === brk.to) {
                            isOut = false;
                            break;
                        }
                    }
                    return isOut;
                });
                points.forEach(function (point) {
                    y = BrokenAxis_pick(point['stack' + key.toUpperCase()], point[key]);
                    breaks.forEach(function (brk) {
                        if (BrokenAxis_isNumber(threshold) && BrokenAxis_isNumber(y)) {
                            let eventName = '';
                            if ((threshold < brk.from && y > brk.to) ||
                                (threshold > brk.from && y < brk.from)) {
                                eventName = 'pointBreak';
                            }
                            else if ((threshold < brk.from &&
                                y > brk.from &&
                                y < brk.to) || (threshold > brk.from &&
                                y > brk.to &&
                                y < brk.from)) {
                                eventName = 'pointInBreak';
                            }
                            if (eventName) {
                                BrokenAxis_fireEvent(axis, eventName, { point, brk });
                            }
                        }
                    });
                    breaksOutOfRange?.forEach(function (brk) {
                        BrokenAxis_fireEvent(axis, 'pointOutsideOfBreak', { point, brk });
                    });
                });
            });
        }
    }
    /**
     * Extend getGraphPath by identifying gaps in the data so that we
     * can draw a gap in the line or area. This was moved from ordinal
     * axis module to broken axis module as of #5045.
     *
     * @private
     * @function Highcharts.Series#gappedPath
     *
     * @return {Highcharts.SVGPathArray}
     * Gapped path
     */
    function seriesGappedPath() {
        const currentDataGrouping = this.currentDataGrouping, groupingSize = currentDataGrouping?.gapSize, points = this.points.slice(), yAxis = this.yAxis;
        let gapSize = this.options.gapSize, i = points.length - 1, stack;
        /**
         * Defines when to display a gap in the graph, together with the
         * [gapUnit](plotOptions.series.gapUnit) option.
         *
         * In case when `dataGrouping` is enabled, points can be grouped
         * into a larger time span. This can make the grouped points to
         * have a greater distance than the absolute value of `gapSize`
         * property, which will result in disappearing graph completely.
         * To prevent this situation the mentioned distance between
         * grouped points is used instead of previously defined
         * `gapSize`.
         *
         * In practice, this option is most often used to visualize gaps
         * in time series. In a stock chart, intraday data is available
         * for daytime hours, while gaps will appear in nights and
         * weekends.
         *
         * @see [gapUnit](plotOptions.series.gapUnit)
         * @see [xAxis.breaks](#xAxis.breaks)
         *
         * @sample {highstock} stock/plotoptions/series-gapsize/
         * Setting the gap size to 2 introduces gaps for weekends in
         * daily datasets.
         *
         * @type      {number}
         * @default   0
         * @product   highstock
         * @requires  modules/broken-axis
         * @apioption plotOptions.series.gapSize
         */
        /**
         * Together with [gapSize](plotOptions.series.gapSize), this
         * option defines where to draw gaps in the graph.
         *
         * When the `gapUnit` is `"relative"` (default), a gap size of 5
         * means that if the distance between two points is greater than
         * 5 times that of the two closest points, the graph will be
         * broken.
         *
         * When the `gapUnit` is `"value"`, the gap is based on absolute
         * axis values, which on a datetime axis is milliseconds. This
         * also applies to the navigator series that inherits gap
         * options from the base series.
         *
         * @see [gapSize](plotOptions.series.gapSize)
         *
         * @type       {string}
         * @default    relative
         * @since      5.0.13
         * @product    highstock
         * @validvalue ["relative", "value"]
         * @requires   modules/broken-axis
         * @apioption  plotOptions.series.gapUnit
         */
        if (gapSize && i > 0) { // #5008
            // Gap unit is relative
            if (this.options.gapUnit !== 'value') {
                gapSize *= this.basePointRange;
            }
            // Setting a new gapSize in case dataGrouping is enabled
            // (#7686)
            if (groupingSize &&
                groupingSize > gapSize &&
                // Except when DG is forced (e.g. from other series)
                // and has lower granularity than actual points (#11351)
                groupingSize >= this.basePointRange) {
                gapSize = groupingSize;
            }
            // Extension for ordinal breaks
            let current, next;
            while (i--) {
                // Reassign next if it is not visible
                if (!(next && next.visible !== false)) {
                    next = points[i + 1];
                }
                current = points[i];
                // Skip iteration if one of the points is not visible
                if (next.visible === false || current.visible === false) {
                    continue;
                }
                if (next.x - current.x > gapSize) {
                    const xRange = (current.x + next.x) / 2;
                    points.splice(// Insert after this one
                    i + 1, 0, {
                        isNull: true,
                        x: xRange
                    });
                    // For stacked chart generate empty stack items, #6546
                    if (yAxis.stacking && this.options.stacking) {
                        stack = yAxis.stacking.stacks[this.stackKey][xRange] = new (external_highcharts_src_js_default_StackItem_default())(yAxis, yAxis.options.stackLabels, false, xRange, this.stack);
                        stack.total = 0;
                    }
                }
                // Assign current to next for the upcoming iteration
                next = current;
            }
        }
        // Call base method
        return this.getGraphPath(points);
    }
    /* *
     *
     *  Class
     *
     * */
    /**
     * Provides support for broken axes.
     * @private
     * @class
     */
    class Additions {
        /* *
         *
         *  Static Functions
         *
         * */
        /**
         * @private
         */
        static isInBreak(brk, val) {
            const repeat = brk.repeat || Infinity, from = brk.from, length = brk.to - brk.from, test = (val >= from ?
                (val - from) % repeat :
                repeat - ((from - val) % repeat));
            let ret;
            if (!brk.inclusive) {
                ret = test < length && test !== 0;
            }
            else {
                ret = test <= length;
            }
            return ret;
        }
        /**
         * @private
         */
        static lin2Val(val) {
            const axis = this;
            const brokenAxis = axis.brokenAxis;
            const breakArray = brokenAxis?.breakArray;
            if (!breakArray || !BrokenAxis_isNumber(val)) {
                return val;
            }
            let nval = val, brk, i;
            for (i = 0; i < breakArray.length; i++) {
                brk = breakArray[i];
                if (brk.from >= nval) {
                    break;
                }
                else if (brk.to < nval) {
                    nval += brk.len;
                }
                else if (Additions.isInBreak(brk, nval)) {
                    nval += brk.len;
                }
            }
            return nval;
        }
        /**
         * @private
         */
        static val2Lin(val) {
            const axis = this;
            const brokenAxis = axis.brokenAxis;
            const breakArray = brokenAxis?.breakArray;
            if (!breakArray || !BrokenAxis_isNumber(val)) {
                return val;
            }
            let nval = val, brk, i;
            for (i = 0; i < breakArray.length; i++) {
                brk = breakArray[i];
                if (brk.to <= val) {
                    nval -= brk.len;
                }
                else if (brk.from >= val) {
                    break;
                }
                else if (Additions.isInBreak(brk, val)) {
                    nval -= (val - brk.from);
                    break;
                }
            }
            return nval;
        }
        /* *
         *
         *  Constructors
         *
         * */
        constructor(axis) {
            this.hasBreaks = false;
            this.axis = axis;
        }
        /* *
         *
         *  Functions
         *
         * */
        /**
         * Returns the first break found where the x is larger then break.from
         * and smaller then break.to.
         *
         * @param {number} x
         * The number which should be within a break.
         *
         * @param {Array<Highcharts.XAxisBreaksOptions>} breaks
         * The array of breaks to search within.
         *
         * @return {Highcharts.XAxisBreaksOptions|undefined}
         * Returns the first break found that matches, returns false if no break
         * is found.
         */
        findBreakAt(x, breaks) {
            return BrokenAxis_find(breaks, function (b) {
                return b.from < x && x < b.to;
            });
        }
        /**
         * @private
         */
        isInAnyBreak(val, testKeep) {
            const brokenAxis = this, axis = brokenAxis.axis, breaks = axis.options.breaks || [];
            let i = breaks.length, inbrk, keep, ret;
            if (i && BrokenAxis_isNumber(val)) {
                while (i--) {
                    if (Additions.isInBreak(breaks[i], val)) {
                        inbrk = true;
                        if (!keep) {
                            keep = BrokenAxis_pick(breaks[i].showPoints, !axis.isXAxis);
                        }
                    }
                }
                if (inbrk && testKeep) {
                    ret = inbrk && !keep;
                }
                else {
                    ret = inbrk;
                }
            }
            return ret;
        }
        /**
         * Dynamically set or unset breaks in an axis. This function in lighter
         * than using Axis.update, and it also preserves animation.
         *
         * @private
         * @function Highcharts.Axis#setBreaks
         *
         * @param {Array<Highcharts.XAxisBreaksOptions>} [breaks]
         * The breaks to add. When `undefined` it removes existing breaks.
         *
         * @param {boolean} [redraw=true]
         * Whether to redraw the chart immediately.
         */
        setBreaks(breaks, redraw) {
            const brokenAxis = this, axis = brokenAxis.axis, time = axis.chart.time, hasBreaks = BrokenAxis_isArray(breaks) &&
                !!breaks.length &&
                !!Object.keys(breaks[0]).length; // Check for [{}], #16368.
            axis.isDirty = brokenAxis.hasBreaks !== hasBreaks;
            brokenAxis.hasBreaks = hasBreaks;
            // Compile string dates
            breaks?.forEach((brk) => {
                brk.from = time.parse(brk.from) || 0;
                brk.to = time.parse(brk.to) || 0;
            });
            if (breaks !== axis.options.breaks) {
                axis.options.breaks = axis.userOptions.breaks = breaks;
            }
            axis.forceRedraw = true; // Force recalculation in setScale
            // Recalculate series related to the axis.
            axis.series.forEach(function (series) {
                series.isDirty = true;
            });
            if (!hasBreaks && axis.val2lin === Additions.val2Lin) {
                // Revert to prototype functions
                delete axis.val2lin;
                delete axis.lin2val;
            }
            if (hasBreaks) {
                axis.userOptions.ordinal = false;
                axis.lin2val = Additions.lin2Val;
                axis.val2lin = Additions.val2Lin;
                axis.setExtremes = function (newMin, newMax, redraw, animation, eventArguments) {
                    // If trying to set extremes inside a break, extend min to
                    // after, and max to before the break ( #3857 )
                    if (brokenAxis.hasBreaks) {
                        const breaks = (this.options.breaks || []);
                        let axisBreak;
                        while ((axisBreak = brokenAxis.findBreakAt(newMin, breaks))) {
                            newMin = axisBreak.to;
                        }
                        while ((axisBreak = brokenAxis.findBreakAt(newMax, breaks))) {
                            newMax = axisBreak.from;
                        }
                        // If both min and max is within the same break.
                        if (newMax < newMin) {
                            newMax = newMin;
                        }
                    }
                    axis.constructor.prototype.setExtremes.call(this, newMin, newMax, redraw, animation, eventArguments);
                };
                axis.setAxisTranslation = function () {
                    axis.constructor.prototype.setAxisTranslation.call(this);
                    brokenAxis.unitLength = void 0;
                    if (brokenAxis.hasBreaks) {
                        const breaks = axis.options.breaks || [], 
                        // Temporary one:
                        breakArrayT = [], breakArray = [], pointRangePadding = BrokenAxis_pick(axis.pointRangePadding, 0);
                        let length = 0, inBrk, repeat, min = axis.userMin || axis.min, max = axis.userMax || axis.max, start, i;
                        // Min & max check (#4247)
                        breaks.forEach(function (brk) {
                            repeat = brk.repeat || Infinity;
                            if (BrokenAxis_isNumber(min) && BrokenAxis_isNumber(max)) {
                                if (Additions.isInBreak(brk, min)) {
                                    min += ((brk.to % repeat) -
                                        (min % repeat));
                                }
                                if (Additions.isInBreak(brk, max)) {
                                    max -= ((max % repeat) -
                                        (brk.from % repeat));
                                }
                            }
                        });
                        // Construct an array holding all breaks in the axis
                        breaks.forEach(function (brk) {
                            start = brk.from;
                            repeat = brk.repeat || Infinity;
                            if (BrokenAxis_isNumber(min) && BrokenAxis_isNumber(max)) {
                                while (start - repeat > min) {
                                    start -= repeat;
                                }
                                while (start < min) {
                                    start += repeat;
                                }
                                for (i = start; i < max; i += repeat) {
                                    breakArrayT.push({
                                        value: i,
                                        move: 'in'
                                    });
                                    breakArrayT.push({
                                        value: i + brk.to - brk.from,
                                        move: 'out',
                                        size: brk.breakSize
                                    });
                                }
                            }
                        });
                        breakArrayT.sort(function (a, b) {
                            return ((a.value === b.value) ?
                                ((a.move === 'in' ? 0 : 1) -
                                    (b.move === 'in' ? 0 : 1)) :
                                a.value - b.value);
                        });
                        // Simplify the breaks
                        inBrk = 0;
                        start = min;
                        breakArrayT.forEach(function (brk) {
                            inBrk += (brk.move === 'in' ? 1 : -1);
                            if (inBrk === 1 && brk.move === 'in') {
                                start = brk.value;
                            }
                            if (inBrk === 0 && BrokenAxis_isNumber(start)) {
                                breakArray.push({
                                    from: start,
                                    to: brk.value,
                                    len: brk.value - start - (brk.size || 0)
                                });
                                length += (brk.value -
                                    start -
                                    (brk.size || 0));
                            }
                        });
                        brokenAxis.breakArray = breakArray;
                        // Used with staticScale, and below the actual axis
                        // length, when breaks are subtracted.
                        if (BrokenAxis_isNumber(min) &&
                            BrokenAxis_isNumber(max) &&
                            BrokenAxis_isNumber(axis.min)) {
                            brokenAxis.unitLength = max - min - length +
                                pointRangePadding;
                            BrokenAxis_fireEvent(axis, 'afterBreaks');
                            if (axis.staticScale) {
                                axis.transA = axis.staticScale;
                            }
                            else if (brokenAxis.unitLength) {
                                axis.transA *=
                                    (max - axis.min + pointRangePadding) /
                                        brokenAxis.unitLength;
                            }
                            if (pointRangePadding) {
                                axis.minPixelPadding =
                                    axis.transA * (axis.minPointOffset || 0);
                            }
                            axis.min = min;
                            axis.max = max;
                        }
                    }
                };
            }
            if (BrokenAxis_pick(redraw, true)) {
                axis.chart.redraw();
            }
        }
    }
    BrokenAxis.Additions = Additions;
})(BrokenAxis || (BrokenAxis = {}));
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Axis_BrokenAxis = (BrokenAxis);

;// ./code/es-modules/Core/Axis/GridAxis.js
/* *
 *
 *  (c) 2016 Highsoft AS
 *  Authors: Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */



const { dateFormats } = (external_highcharts_src_js_default_default());

const { addEvent: GridAxis_addEvent, defined: GridAxis_defined, erase: GridAxis_erase, find: GridAxis_find, isArray: GridAxis_isArray, isNumber: GridAxis_isNumber, merge: GridAxis_merge, pick: GridAxis_pick, timeUnits: GridAxis_timeUnits, wrap: GridAxis_wrap } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Enums
 *
 * */
/**
 * Enum for which side the axis is on. Maps to axis.side.
 * @private
 */
var GridAxisSide;
(function (GridAxisSide) {
    GridAxisSide[GridAxisSide["top"] = 0] = "top";
    GridAxisSide[GridAxisSide["right"] = 1] = "right";
    GridAxisSide[GridAxisSide["bottom"] = 2] = "bottom";
    GridAxisSide[GridAxisSide["left"] = 3] = "left";
})(GridAxisSide || (GridAxisSide = {}));
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function argsToArray(args) {
    return Array.prototype.slice.call(args, 1);
}
/**
 * @private
 */
function isObject(x) {
    // Always use strict mode
    return external_highcharts_src_js_default_default().isObject(x, true);
}
/**
 * @private
 */
function applyGridOptions(axis) {
    const options = axis.options;
    // Center-align by default
    /*
    if (!options.labels) {
        options.labels = {};
    }
    */
    options.labels.align = GridAxis_pick(options.labels.align, 'center');
    // @todo: Check against tickLabelPlacement between/on etc
    /* Prevents adding the last tick label if the axis is not a category
       axis.
       Since numeric labels are normally placed at starts and ends of a
       range of value, and this module makes the label point at the value,
       an "extra" label would appear. */
    if (!axis.categories) {
        options.showLastLabel = false;
    }
    // Prevents rotation of labels when squished, as rotating them would not
    // help.
    axis.labelRotation = 0;
    options.labels.rotation = 0;
    // Allow putting ticks closer than their data points.
    options.minTickInterval = 1;
}
/**
 * Extends axis class with grid support.
 * @private
 */
function GridAxis_compose(AxisClass, ChartClass, TickClass) {
    if (!AxisClass.keepProps.includes('grid')) {
        AxisClass.keepProps.push('grid');
        AxisClass.prototype.getMaxLabelDimensions = getMaxLabelDimensions;
        GridAxis_wrap(AxisClass.prototype, 'unsquish', wrapUnsquish);
        GridAxis_wrap(AxisClass.prototype, 'getOffset', wrapGetOffset);
        // Add event handlers
        GridAxis_addEvent(AxisClass, 'init', onInit);
        GridAxis_addEvent(AxisClass, 'afterGetTitlePosition', onAfterGetTitlePosition);
        GridAxis_addEvent(AxisClass, 'afterInit', onAfterInit);
        GridAxis_addEvent(AxisClass, 'afterRender', onAfterRender);
        GridAxis_addEvent(AxisClass, 'afterSetAxisTranslation', onAfterSetAxisTranslation);
        GridAxis_addEvent(AxisClass, 'afterSetOptions', onAfterSetOptions);
        GridAxis_addEvent(AxisClass, 'afterSetOptions', onAfterSetOptions2);
        GridAxis_addEvent(AxisClass, 'afterSetScale', onAfterSetScale);
        GridAxis_addEvent(AxisClass, 'afterTickSize', onAfterTickSize);
        GridAxis_addEvent(AxisClass, 'trimTicks', onTrimTicks);
        GridAxis_addEvent(AxisClass, 'destroy', onDestroy);
        GridAxis_addEvent(ChartClass, 'afterSetChartSize', GridAxis_onChartAfterSetChartSize);
        GridAxis_addEvent(TickClass, 'afterGetLabelPosition', onTickAfterGetLabelPosition);
        GridAxis_addEvent(TickClass, 'labelFormat', onTickLabelFormat);
    }
    return AxisClass;
}
/**
 * Get the largest label width and height.
 *
 * @private
 * @function Highcharts.Axis#getMaxLabelDimensions
 *
 * @param {Highcharts.Dictionary<Highcharts.Tick>} ticks
 * All the ticks on one axis.
 *
 * @param {Array<number|string>} tickPositions
 * All the tick positions on one axis.
 *
 * @return {Highcharts.SizeObject}
 * Object containing the properties height and width.
 *
 * @todo Move this to the generic axis implementation, as it is used there.
 */
function getMaxLabelDimensions(ticks, tickPositions) {
    const dimensions = {
        width: 0,
        height: 0
    };
    tickPositions.forEach(function (pos) {
        const tick = ticks[pos];
        let labelHeight = 0, labelWidth = 0, label;
        if (isObject(tick)) {
            label = isObject(tick.label) ? tick.label : {};
            // Find width and height of label
            labelHeight = label.getBBox ? label.getBBox().height : 0;
            if (label.textStr && !GridAxis_isNumber(label.textPxLength)) {
                label.textPxLength = label.getBBox().width;
            }
            labelWidth = GridAxis_isNumber(label.textPxLength) ?
                // Math.round ensures crisp lines
                Math.round(label.textPxLength) :
                0;
            if (label.textStr) {
                // Set the tickWidth same as the label width after ellipsis
                // applied #10281
                labelWidth = Math.round(label.getBBox().width);
            }
            // Update the result if width and/or height are larger
            dimensions.height = Math.max(labelHeight, dimensions.height);
            dimensions.width = Math.max(labelWidth, dimensions.width);
        }
    });
    // For tree grid, add indentation
    if (this.type === 'treegrid' &&
        this.treeGrid &&
        this.treeGrid.mapOfPosToGridNode) {
        const treeDepth = this.treeGrid.mapOfPosToGridNode[-1].height || 0;
        dimensions.width += (this.options.labels.indentation *
            (treeDepth - 1));
    }
    return dimensions;
}
/**
 * Handle columns and getOffset.
 * @private
 */
function wrapGetOffset(proceed) {
    const { grid } = this, 
    // On the left side we handle the columns first because the offset is
    // calculated from the plot area and out
    columnsFirst = this.side === 3;
    if (!columnsFirst) {
        proceed.apply(this);
    }
    if (!grid?.isColumn) {
        let columns = grid?.columns || [];
        if (columnsFirst) {
            columns = columns.slice().reverse();
        }
        columns
            .forEach((column) => {
            column.getOffset();
        });
    }
    if (columnsFirst) {
        proceed.apply(this);
    }
}
/**
 * @private
 */
function onAfterGetTitlePosition(e) {
    const axis = this;
    const options = axis.options;
    const gridOptions = options.grid || {};
    if (gridOptions.enabled === true) {
        // Compute anchor points for each of the title align options
        const { axisTitle, height: axisHeight, horiz, left: axisLeft, offset, opposite, options, top: axisTop, width: axisWidth } = axis;
        const tickSize = axis.tickSize();
        const titleWidth = axisTitle?.getBBox().width;
        const xOption = options.title.x;
        const yOption = options.title.y;
        const titleMargin = GridAxis_pick(options.title.margin, horiz ? 5 : 10);
        const titleFontSize = axisTitle ? axis.chart.renderer.fontMetrics(axisTitle).f : 0;
        const crispCorr = tickSize ? tickSize[0] / 2 : 0;
        // TODO account for alignment
        // the position in the perpendicular direction of the axis
        const offAxis = ((horiz ? axisTop + axisHeight : axisLeft) +
            (horiz ? 1 : -1) * // Horizontal axis reverses the margin
                (opposite ? -1 : 1) * // So does opposite axes
                crispCorr +
            (axis.side === GridAxisSide.bottom ? titleFontSize : 0));
        e.titlePosition.x = horiz ?
            axisLeft - (titleWidth || 0) / 2 - titleMargin + xOption :
            offAxis + (opposite ? axisWidth : 0) + offset + xOption;
        e.titlePosition.y = horiz ?
            (offAxis -
                (opposite ? axisHeight : 0) +
                (opposite ? titleFontSize : -titleFontSize) / 2 +
                offset +
                yOption) :
            axisTop - titleMargin + yOption;
    }
}
/**
 * @private
 */
function onAfterInit() {
    const axis = this;
    const { chart, options: { grid: gridOptions = {} }, userOptions } = axis;
    if (gridOptions.enabled) {
        applyGridOptions(axis);
    }
    if (gridOptions.columns) {
        const columns = axis.grid.columns = [];
        let columnIndex = axis.grid.columnIndex = 0;
        // Handle columns, each column is a grid axis
        while (++columnIndex < gridOptions.columns.length) {
            const columnOptions = GridAxis_merge(userOptions, gridOptions.columns[columnIndex], {
                isInternal: true,
                linkedTo: 0,
                // Disable by default the scrollbar on the grid axis
                scrollbar: {
                    enabled: false
                }
            }, 
            // Avoid recursion
            {
                grid: {
                    columns: void 0
                }
            });
            const column = new (external_highcharts_src_js_default_Axis_default())(axis.chart, columnOptions, 'yAxis');
            column.grid.isColumn = true;
            column.grid.columnIndex = columnIndex;
            // Remove column axis from chart axes array, and place it
            // in the columns array.
            GridAxis_erase(chart.axes, column);
            GridAxis_erase(chart[axis.coll] || [], column);
            columns.push(column);
        }
    }
}
/**
 * Draw an extra line on the far side of the outermost axis,
 * creating floor/roof/wall of a grid. And some padding.
 * ```
 * Make this:
 *             (axis.min) __________________________ (axis.max)
 *                           |    |    |    |    |
 * Into this:
 *             (axis.min) __________________________ (axis.max)
 *                        ___|____|____|____|____|__
 * ```
 * @private
 */
function onAfterRender() {
    const axis = this, { axisTitle, grid, options } = axis, gridOptions = options.grid || {};
    if (gridOptions.enabled === true) {
        const min = axis.min || 0, max = axis.max || 0, firstTick = axis.ticks[axis.tickPositions[0]];
        // Adjust the title max width to the column width (#19657)
        if (axisTitle &&
            !axis.chart.styledMode &&
            firstTick?.slotWidth &&
            !axis.options.title.style.width) {
            axisTitle.css({ width: `${firstTick.slotWidth}px` });
        }
        // @todo actual label padding (top, bottom, left, right)
        axis.maxLabelDimensions = axis.getMaxLabelDimensions(axis.ticks, axis.tickPositions);
        // Remove right wall before rendering if updating
        if (axis.rightWall) {
            axis.rightWall.destroy();
        }
        /*
        Draw an extra axis line on outer axes
                    >
        Make this:    |______|______|______|___

                    > _________________________
        Into this:    |______|______|______|__|
                                                */
        if (axis.grid?.isOuterAxis() && axis.axisLine) {
            const lineWidth = options.lineWidth;
            if (lineWidth) {
                const linePath = axis.getLinePath(lineWidth), startPoint = linePath[0], endPoint = linePath[1], 
                // Negate distance if top or left axis
                // Subtract 1px to draw the line at the end of the tick
                tickLength = (axis.tickSize('tick') || [1])[0], distance = tickLength * ((axis.side === GridAxisSide.top ||
                    axis.side === GridAxisSide.left) ? -1 : 1);
                // If axis is horizontal, reposition line path vertically
                if (startPoint[0] === 'M' && endPoint[0] === 'L') {
                    if (axis.horiz) {
                        startPoint[2] += distance;
                        endPoint[2] += distance;
                    }
                    else {
                        startPoint[1] += distance;
                        endPoint[1] += distance;
                    }
                }
                // If it doesn't exist, add an upper and lower border
                // for the vertical grid axis.
                if (!axis.horiz && axis.chart.marginRight) {
                    const upperBorderStartPoint = startPoint, upperBorderEndPoint = [
                        'L',
                        axis.left,
                        startPoint[2] || 0
                    ], upperBorderPath = [
                        upperBorderStartPoint,
                        upperBorderEndPoint
                    ], lowerBorderEndPoint = [
                        'L',
                        axis.chart.chartWidth - axis.chart.marginRight,
                        axis.toPixels(max + axis.tickmarkOffset)
                    ], lowerBorderStartPoint = [
                        'M',
                        endPoint[1] || 0,
                        axis.toPixels(max + axis.tickmarkOffset)
                    ], lowerBorderPath = [
                        lowerBorderStartPoint,
                        lowerBorderEndPoint
                    ];
                    if (!axis.grid.upperBorder && min % 1 !== 0) {
                        axis.grid.upperBorder = axis.grid.renderBorder(upperBorderPath);
                    }
                    if (axis.grid.upperBorder) {
                        axis.grid.upperBorder.attr({
                            stroke: options.lineColor,
                            'stroke-width': options.lineWidth
                        });
                        axis.grid.upperBorder.animate({
                            d: upperBorderPath
                        });
                    }
                    if (!axis.grid.lowerBorder && max % 1 !== 0) {
                        axis.grid.lowerBorder = axis.grid.renderBorder(lowerBorderPath);
                    }
                    if (axis.grid.lowerBorder) {
                        axis.grid.lowerBorder.attr({
                            stroke: options.lineColor,
                            'stroke-width': options.lineWidth
                        });
                        axis.grid.lowerBorder.animate({
                            d: lowerBorderPath
                        });
                    }
                }
                // Render an extra line parallel to the existing axes, to
                // close the grid.
                if (!axis.grid.axisLineExtra) {
                    axis.grid.axisLineExtra = axis.grid.renderBorder(linePath);
                }
                else {
                    axis.grid.axisLineExtra.attr({
                        stroke: options.lineColor,
                        'stroke-width': options.lineWidth
                    });
                    axis.grid.axisLineExtra.animate({
                        d: linePath
                    });
                }
                // Show or hide the line depending on options.showEmpty
                axis.axisLine[axis.showAxis ? 'show' : 'hide']();
            }
        }
        (grid?.columns || []).forEach((column) => column.render());
        // Manipulate the tick mark visibility
        // based on the axis.max- allows smooth scrolling.
        if (!axis.horiz &&
            axis.chart.hasRendered &&
            (axis.scrollbar || axis.linkedParent?.scrollbar) &&
            axis.tickPositions.length) {
            const tickmarkOffset = axis.tickmarkOffset, lastTick = axis.tickPositions[axis.tickPositions.length - 1], firstTick = axis.tickPositions[0];
            let label, tickMark;
            while ((label = axis.hiddenLabels.pop()) && label.element) {
                label.show(); // #15453
            }
            while ((tickMark = axis.hiddenMarks.pop()) &&
                tickMark.element) {
                tickMark.show(); // #16439
            }
            // Hide/show first tick label.
            label = axis.ticks[firstTick].label;
            if (label) {
                if (min - firstTick > tickmarkOffset) {
                    axis.hiddenLabels.push(label.hide());
                }
                else {
                    label.show();
                }
            }
            // Hide/show last tick mark/label.
            label = axis.ticks[lastTick].label;
            if (label) {
                if (lastTick - max > tickmarkOffset) {
                    axis.hiddenLabels.push(label.hide());
                }
                else {
                    label.show();
                }
            }
            const mark = axis.ticks[lastTick].mark;
            if (mark &&
                lastTick - max < tickmarkOffset &&
                lastTick - max > 0 && axis.ticks[lastTick].isLast) {
                axis.hiddenMarks.push(mark.hide());
            }
        }
    }
}
/**
 * @private
 */
function onAfterSetAxisTranslation() {
    const axis = this;
    const tickInfo = axis.tickPositions?.info;
    const options = axis.options;
    const gridOptions = options.grid || {};
    const userLabels = axis.userOptions.labels || {};
    // Fire this only for the Gantt type chart, #14868.
    if (gridOptions.enabled) {
        if (axis.horiz) {
            axis.series.forEach((series) => {
                series.options.pointRange = 0;
            });
            // Lower level time ticks, like hours or minutes, represent
            // points in time and not ranges. These should be aligned
            // left in the grid cell by default. The same applies to
            // years of higher order.
            if (tickInfo &&
                options.dateTimeLabelFormats &&
                options.labels &&
                !GridAxis_defined(userLabels.align) &&
                (options.dateTimeLabelFormats[tickInfo.unitName]
                    .range === false ||
                    tickInfo.count > 1 // Years
                )) {
                options.labels.align = 'left';
                if (!GridAxis_defined(userLabels.x)) {
                    options.labels.x = 3;
                }
            }
        }
        else {
            // Don't trim ticks which not in min/max range but
            // they are still in the min/max plus tickInterval.
            if (this.type !== 'treegrid' &&
                axis.grid &&
                axis.grid.columns) {
                this.minPointOffset = this.tickInterval;
            }
        }
    }
}
/**
 * Creates a left and right wall on horizontal axes:
 * - Places leftmost tick at the start of the axis, to create a left
 *   wall
 * - Ensures that the rightmost tick is at the end of the axis, to
 *   create a right wall.
 * @private
 */
function onAfterSetOptions(e) {
    const options = this.options, userOptions = e.userOptions, gridOptions = ((options && isObject(options.grid)) ? options.grid : {});
    let gridAxisOptions;
    if (gridOptions.enabled === true) {
        // Merge the user options into default grid axis options so
        // that when a user option is set, it takes precedence.
        gridAxisOptions = GridAxis_merge(true, {
            className: ('highcharts-grid-axis ' + (userOptions.className || '')),
            dateTimeLabelFormats: {
                hour: {
                    list: ['%[HM]', '%[H]']
                },
                day: {
                    list: ['%[AeB]', '%[aeb]', '%[E]']
                },
                week: {
                    list: ['Week %W', 'W%W']
                },
                month: {
                    list: ['%[B]', '%[b]', '%o']
                }
            },
            grid: {
                borderWidth: 1
            },
            labels: {
                padding: 2,
                style: {
                    fontSize: '0.9em'
                }
            },
            margin: 0,
            title: {
                text: null,
                reserveSpace: false,
                rotation: 0,
                style: {
                    textOverflow: 'ellipsis'
                }
            },
            // In a grid axis, only allow one unit of certain types,
            // for example we shouldn't have one grid cell spanning
            // two days.
            units: [[
                    'millisecond', // Unit name
                    [1, 10, 100]
                ], [
                    'second',
                    [1, 10]
                ], [
                    'minute',
                    [1, 5, 15]
                ], [
                    'hour',
                    [1, 6]
                ], [
                    'day',
                    [1]
                ], [
                    'week',
                    [1]
                ], [
                    'month',
                    [1]
                ], [
                    'year',
                    null
                ]]
        }, userOptions);
        // X-axis specific options
        if (this.coll === 'xAxis') {
            // For linked axes, tickPixelInterval is used only if
            // the tickPositioner below doesn't run or returns
            // undefined (like multiple years)
            if (GridAxis_defined(userOptions.linkedTo) &&
                !GridAxis_defined(userOptions.tickPixelInterval)) {
                gridAxisOptions.tickPixelInterval = 350;
            }
            // For the secondary grid axis, use the primary axis'
            // tick intervals and return ticks one level higher.
            if (
            // Check for tick pixel interval in options
            !GridAxis_defined(userOptions.tickPixelInterval) &&
                // Only for linked axes
                GridAxis_defined(userOptions.linkedTo) &&
                !GridAxis_defined(userOptions.tickPositioner) &&
                !GridAxis_defined(userOptions.tickInterval) &&
                !GridAxis_defined(userOptions.units)) {
                gridAxisOptions.tickPositioner = function (min, max) {
                    const parentInfo = this.linkedParent?.tickPositions?.info;
                    if (parentInfo) {
                        const units = (gridAxisOptions.units || []);
                        let unitIdx, count = 1, unitName = 'year';
                        for (let i = 0; i < units.length; i++) {
                            const unit = units[i];
                            if (unit && unit[0] === parentInfo.unitName) {
                                unitIdx = i;
                                break;
                            }
                        }
                        // Get the first allowed count on the next unit.
                        const unit = (GridAxis_isNumber(unitIdx) && units[unitIdx + 1]);
                        if (unit) {
                            unitName = unit[0] || 'year';
                            const counts = unit[1];
                            count = counts?.[0] || 1;
                            // In case the base X axis shows years, make the
                            // secondary axis show ten times the years (#11427)
                        }
                        else if (parentInfo.unitName === 'year') {
                            // `unitName` is 'year'
                            count = parentInfo.count * 10;
                        }
                        const unitRange = GridAxis_timeUnits[unitName];
                        this.tickInterval = unitRange * count;
                        return this.chart.time.getTimeTicks({ unitRange, count, unitName }, min, max, this.options.startOfWeek);
                    }
                };
            }
        }
        // Now merge the combined options into the axis options
        GridAxis_merge(true, this.options, gridAxisOptions);
        if (this.horiz) {
            /*               _________________________
            Make this:    ___|_____|_____|_____|__|
                            ^                     ^
                            _________________________
            Into this:    |_____|_____|_____|_____|
                                ^                 ^    */
            options.minPadding = GridAxis_pick(userOptions.minPadding, 0);
            options.maxPadding = GridAxis_pick(userOptions.maxPadding, 0);
        }
        // If borderWidth is set, then use its value for tick and
        // line width.
        if (GridAxis_isNumber(options.grid.borderWidth)) {
            options.tickWidth = options.lineWidth =
                gridOptions.borderWidth;
        }
    }
}
/**
 * @private
 */
function onAfterSetOptions2(e) {
    const axis = this;
    const userOptions = e.userOptions;
    const gridOptions = userOptions?.grid || {};
    const columns = gridOptions.columns;
    // Add column options to the parent axis. Children has their column options
    // set on init in onGridAxisAfterInit.
    if (gridOptions.enabled && columns) {
        GridAxis_merge(true, axis.options, columns[0]);
    }
}
/**
 * Handle columns and setScale.
 * @private
 */
function onAfterSetScale() {
    const axis = this;
    (axis.grid.columns || []).forEach((column) => column.setScale());
}
/**
 * Draw vertical axis ticks extra long to create cell floors and roofs.
 * Overrides the tickLength for vertical axes.
 * @private
 */
function onAfterTickSize(e) {
    const { horiz, maxLabelDimensions, options: { grid: gridOptions = {} } } = this;
    if (gridOptions.enabled && maxLabelDimensions) {
        const labelPadding = this.options.labels.distance * 2;
        const distance = horiz ?
            (gridOptions.cellHeight ||
                labelPadding + maxLabelDimensions.height) :
            labelPadding + maxLabelDimensions.width;
        if (GridAxis_isArray(e.tickSize)) {
            e.tickSize[0] = distance;
        }
        else {
            e.tickSize = [distance, 0];
        }
    }
}
/**
 * @private
 */
function GridAxis_onChartAfterSetChartSize() {
    this.axes.forEach((axis) => {
        (axis.grid?.columns || []).forEach((column) => {
            column.setAxisSize();
            column.setAxisTranslation();
        });
    });
}
/**
 * @private
 */
function onDestroy(e) {
    const { grid } = this;
    (grid.columns || []).forEach((column) => column.destroy(e.keepEvents));
    grid.columns = void 0;
}
/**
 * Wraps axis init to draw cell walls on vertical axes.
 * @private
 */
function onInit(e) {
    const axis = this;
    const userOptions = e.userOptions || {};
    const gridOptions = userOptions.grid || {};
    if (gridOptions.enabled && GridAxis_defined(gridOptions.borderColor)) {
        userOptions.tickColor = userOptions.lineColor = (gridOptions.borderColor);
    }
    if (!axis.grid) {
        axis.grid = new GridAxisAdditions(axis);
    }
    axis.hiddenLabels = [];
    axis.hiddenMarks = [];
}
/**
 * Center tick labels in cells.
 * @private
 */
function onTickAfterGetLabelPosition(e) {
    const tick = this, label = tick.label, axis = tick.axis, reversed = axis.reversed, chart = axis.chart, options = axis.options, gridOptions = options.grid || {}, labelOpts = axis.options.labels, align = labelOpts.align, 
    // `verticalAlign` is currently not supported for axis.labels.
    verticalAlign = 'middle', // LabelOpts.verticalAlign,
    side = GridAxisSide[axis.side], tickmarkOffset = e.tickmarkOffset, tickPositions = axis.tickPositions, tickPos = tick.pos - tickmarkOffset, nextTickPos = (GridAxis_isNumber(tickPositions[e.index + 1]) ?
        tickPositions[e.index + 1] - tickmarkOffset :
        (axis.max || 0) + tickmarkOffset), tickSize = axis.tickSize('tick'), tickWidth = tickSize ? tickSize[0] : 0, crispCorr = tickSize ? tickSize[1] / 2 : 0;
    // Only center tick labels in grid axes
    if (gridOptions.enabled === true) {
        let bottom, top, left, right;
        // Calculate top and bottom positions of the cell.
        if (side === 'top') {
            bottom = axis.top + axis.offset;
            top = bottom - tickWidth;
        }
        else if (side === 'bottom') {
            top = chart.chartHeight - axis.bottom + axis.offset;
            bottom = top + tickWidth;
        }
        else {
            bottom = axis.top + axis.len - (axis.translate(reversed ? nextTickPos : tickPos) || 0);
            top = axis.top + axis.len - (axis.translate(reversed ? tickPos : nextTickPos) || 0);
        }
        // Calculate left and right positions of the cell.
        if (side === 'right') {
            left = chart.chartWidth - axis.right + axis.offset;
            right = left + tickWidth;
        }
        else if (side === 'left') {
            right = axis.left + axis.offset;
            left = right - tickWidth;
        }
        else {
            left = Math.round(axis.left + (axis.translate(reversed ? nextTickPos : tickPos) || 0)) - crispCorr;
            right = Math.min(// #15742
            Math.round(axis.left + (axis.translate(reversed ? tickPos : nextTickPos) || 0)) - crispCorr, axis.left + axis.len);
        }
        tick.slotWidth = right - left;
        // Calculate the positioning of the label based on
        // alignment.
        e.pos.x = (align === 'left' ?
            left :
            align === 'right' ?
                right :
                left + ((right - left) / 2) // Default to center
        );
        e.pos.y = (verticalAlign === 'top' ?
            top :
            verticalAlign === 'bottom' ?
                bottom :
                top + ((bottom - top) / 2) // Default to middle
        );
        if (label) {
            const lblMetrics = chart.renderer.fontMetrics(label), labelHeight = label.getBBox().height;
            // Adjustment to y position to align the label correctly.
            // Would be better to have a setter or similar for this.
            if (!labelOpts.useHTML) {
                const lines = Math.round(labelHeight / lblMetrics.h);
                e.pos.y += (
                // Center the label
                // TODO: why does this actually center the label?
                ((lblMetrics.b - (lblMetrics.h - lblMetrics.f)) / 2) +
                    // Adjust for height of additional lines.
                    -(((lines - 1) * lblMetrics.h) / 2));
            }
            else {
                e.pos.y += (
                // Readjust yCorr in htmlUpdateTransform
                lblMetrics.b +
                    // Adjust for height of html label
                    -(labelHeight / 2));
            }
        }
        e.pos.x += (axis.horiz && labelOpts.x) || 0;
    }
}
/**
 * @private
 */
function onTickLabelFormat(ctx) {
    const { axis, value } = ctx;
    if (axis.options.grid?.enabled) {
        const tickPos = axis.tickPositions;
        const series = (axis.linkedParent || axis).series[0];
        const isFirst = value === tickPos[0];
        const isLast = value === tickPos[tickPos.length - 1];
        const point = series && GridAxis_find(series.options.data, function (p) {
            return p[axis.isXAxis ? 'x' : 'y'] === value;
        });
        let pointCopy;
        if (point && series.is('gantt')) {
            // For the Gantt set point aliases to the pointCopy
            // to do not change the original point
            pointCopy = GridAxis_merge(point);
            external_highcharts_src_js_default_default().seriesTypes.gantt.prototype.pointClass
                .setGanttPointAliases(pointCopy, axis.chart);
        }
        // Make additional properties available for the
        // formatter
        ctx.isFirst = isFirst;
        ctx.isLast = isLast;
        ctx.point = pointCopy;
    }
}
/**
 * Makes tick labels which are usually ignored in a linked axis
 * displayed if they are within range of linkedParent.min.
 * ```
 *                        _____________________________
 *                        |   |       |       |       |
 * Make this:             |   |   2   |   3   |   4   |
 *                        |___|_______|_______|_______|
 *                          ^
 *                        _____________________________
 *                        |   |       |       |       |
 * Into this:             | 1 |   2   |   3   |   4   |
 *                        |___|_______|_______|_______|
 *                          ^
 * ```
 * @private
 * @todo Does this function do what the drawing says? Seems to affect
 *       ticks and not the labels directly?
 */
function onTrimTicks() {
    const axis = this, options = axis.options, gridOptions = options.grid || {}, categoryAxis = axis.categories, tickPositions = axis.tickPositions, firstPos = tickPositions[0], secondPos = tickPositions[1], lastPos = tickPositions[tickPositions.length - 1], beforeLastPos = tickPositions[tickPositions.length - 2], linkedMin = axis.linkedParent?.min, linkedMax = axis.linkedParent?.max, min = linkedMin || axis.min, max = linkedMax || axis.max, tickInterval = axis.tickInterval, startLessThanMin = ( // #19845
    GridAxis_isNumber(min) &&
        min >= firstPos + tickInterval &&
        min < secondPos), endMoreThanMin = (GridAxis_isNumber(min) &&
        firstPos < min &&
        firstPos + tickInterval > min), startLessThanMax = (GridAxis_isNumber(max) &&
        lastPos > max &&
        lastPos - tickInterval < max), endMoreThanMax = (GridAxis_isNumber(max) &&
        max <= lastPos - tickInterval &&
        max > beforeLastPos);
    if (gridOptions.enabled === true &&
        !categoryAxis &&
        (axis.isXAxis || axis.isLinked)) {
        if ((endMoreThanMin || startLessThanMin) && !options.startOnTick) {
            tickPositions[0] = min;
        }
        if ((startLessThanMax || endMoreThanMax) && !options.endOnTick) {
            tickPositions[tickPositions.length - 1] = max;
        }
    }
}
/**
 * Avoid altering tickInterval when reserving space.
 * @private
 */
function wrapUnsquish(proceed) {
    const axis = this;
    const { options: { grid: gridOptions = {} } } = axis;
    if (gridOptions.enabled === true && axis.categories) {
        return axis.tickInterval;
    }
    return proceed.apply(axis, argsToArray(arguments));
}
/* *
 *
 *  Class
 *
 * */
/**
 * Additions for grid axes.
 * @private
 * @class
 */
class GridAxisAdditions {
    /* *
    *
    *  Constructors
    *
    * */
    constructor(axis) {
        this.axis = axis;
    }
    /* *
    *
    *  Functions
    *
    * */
    /**
     * Checks if an axis is the outer axis in its dimension. Since
     * axes are placed outwards in order, the axis with the highest
     * index is the outermost axis.
     *
     * Example: If there are multiple x-axes at the top of the chart,
     * this function returns true if the axis supplied is the last
     * of the x-axes.
     *
     * @private
     *
     * @return {boolean}
     * True if the axis is the outermost axis in its dimension; false if
     * not.
     */
    isOuterAxis() {
        const axis = this.axis;
        const chart = axis.chart;
        const columnIndex = axis.grid.columnIndex;
        const columns = (axis.linkedParent?.grid.columns ||
            axis.grid.columns ||
            []);
        const parentAxis = columnIndex ? axis.linkedParent : axis;
        let thisIndex = -1, lastIndex = 0;
        // On the left side, when we have columns (not only multiple axes), the
        // main axis is to the left
        if (axis.side === 3 && !chart.inverted && columns.length) {
            return !axis.linkedParent;
        }
        (chart[axis.coll] || []).forEach((otherAxis, index) => {
            if (otherAxis.side === axis.side &&
                !otherAxis.options.isInternal) {
                lastIndex = index;
                if (otherAxis === parentAxis) {
                    // Get the index of the axis in question
                    thisIndex = index;
                }
            }
        });
        return (lastIndex === thisIndex &&
            (GridAxis_isNumber(columnIndex) ?
                columns.length === columnIndex :
                true));
    }
    /**
     * Add extra border based on the provided path.
     * @private
     * @param {SVGPath} path
     * The path of the border.
     * @return {Highcharts.SVGElement}
     * Border
     */
    renderBorder(path) {
        const axis = this.axis, renderer = axis.chart.renderer, options = axis.options, extraBorderLine = renderer.path(path)
            .addClass('highcharts-axis-line')
            .add(axis.axisGroup);
        if (!renderer.styledMode) {
            extraBorderLine.attr({
                stroke: options.lineColor,
                'stroke-width': options.lineWidth,
                zIndex: 7
            });
        }
        return extraBorderLine;
    }
}
/* *
 *
 *  Registry
 *
 * */
// First letter of the day of the week, e.g. 'M' for 'Monday'.
dateFormats.E = function (timestamp) {
    return this.dateFormat('%a', timestamp, true).charAt(0);
};
// Adds week date format
dateFormats.W = function (timestamp) {
    const d = this.toParts(timestamp), firstDay = (d[7] + 6) % 7, thursday = d.slice(0);
    thursday[2] = d[2] - firstDay + 3;
    const firstThursday = this.toParts(this.makeTime(thursday[0], 0, 1));
    if (firstThursday[7] !== 4) {
        d[1] = 0; // Set month to January
        d[2] = 1 + (11 - firstThursday[7]) % 7;
    }
    const thursdayTS = this.makeTime(thursday[0], thursday[1], thursday[2]), firstThursdayTS = this.makeTime(firstThursday[0], firstThursday[1], firstThursday[2]);
    return (1 +
        Math.floor((thursdayTS - firstThursdayTS) / 604800000)).toString();
};
/* *
 *
 *  Default Export
 *
 * */
const GridAxis = {
    compose: GridAxis_compose
};
/* harmony default export */ const Axis_GridAxis = (GridAxis);
/* *
 *
 *  API Options
 *
 * */
/**
 * @productdesc {gantt}
 * For grid axes (like in Gantt charts),
 * it is possible to declare as a list to provide different
 * formats depending on available space.
 *
 * Defaults to:
 * ```js
 * {
 *     hour: { list: ['%H:%M', '%H'] },
 *     day: { list: ['%A, %e. %B', '%a, %e. %b', '%E'] },
 *     week: { list: ['Week %W', 'W%W'] },
 *     month: { list: ['%B', '%b', '%o'] }
 * }
 * ```
 *
 * @sample {gantt} gantt/grid-axis/date-time-label-formats
 *         Gantt chart with custom axis date format.
 *
 * @apioption xAxis.dateTimeLabelFormats
 */
/**
 * Set grid options for the axis labels. Requires Highcharts Gantt.
 *
 * @since     6.2.0
 * @product   gantt
 * @apioption xAxis.grid
 */
/**
 * Enable grid on the axis labels. Defaults to true for Gantt charts.
 *
 * @type      {boolean}
 * @default   true
 * @since     6.2.0
 * @product   gantt
 * @apioption xAxis.grid.enabled
 */
/**
 * Set specific options for each column (or row for horizontal axes) in the
 * grid. Each extra column/row is its own axis, and the axis options can be set
 * here.
 *
 * @sample gantt/demo/left-axis-table
 *         Left axis as a table
 * @sample gantt/demo/treegrid-columns
 *         Collapsible tree grid with columns
 *
 * @type      {Array<Highcharts.XAxisOptions>}
 * @apioption xAxis.grid.columns
 */
/**
 * Set border color for the label grid lines.
 *
 * @type      {Highcharts.ColorString}
 * @default   #e6e6e6
 * @apioption xAxis.grid.borderColor
 */
/**
 * Set border width of the label grid lines.
 *
 * @type      {number}
 * @default   1
 * @apioption xAxis.grid.borderWidth
 */
/**
 * Set cell height for grid axis labels. By default this is calculated from font
 * size. This option only applies to horizontal axes. For vertical axes, check
 * the [#yAxis.staticScale](yAxis.staticScale) option.
 *
 * @sample gantt/grid-axis/cellheight
 *         Gant chart with custom cell height
 * @type      {number}
 * @apioption xAxis.grid.cellHeight
 */
''; // Keeps doclets above in JS file

;// ./code/es-modules/Gantt/Tree.js
/* *
 *
 *  (c) 2016-2025 Highsoft AS
 *
 *  Authors: Jon Arild Nygard
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

/* *
 *
 *  Imports
 *
 * */

const { extend: Tree_extend, isNumber: Tree_isNumber, pick: Tree_pick } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Functions
 *
 * */
/**
 * Creates an object map from parent id to children's index.
 *
 * @private
 * @function Highcharts.Tree#getListOfParents
 *
 * @param {Array<*>} data
 *        List of points set in options. `Array.parent` is parent id of point.
 *
 * @return {Highcharts.Dictionary<Array<*>>}
 * Map from parent id to children index in data
 */
function getListOfParents(data) {
    const root = '', ids = [], listOfParents = data.reduce((prev, curr) => {
        const { parent = '', id } = curr;
        if (typeof prev[parent] === 'undefined') {
            prev[parent] = [];
        }
        prev[parent].push(curr);
        if (id) {
            ids.push(id);
        }
        return prev;
    }, {});
    Object.keys(listOfParents).forEach((node) => {
        if ((node !== root) && (ids.indexOf(node) === -1)) {
            const adoptedByRoot = listOfParents[node].map(function (orphan) {
                const { ...parentExcluded } = orphan; // #15196
                return parentExcluded;
            });
            listOfParents[root].push(...adoptedByRoot);
            delete listOfParents[node];
        }
    });
    return listOfParents;
}
/** @private */
function getNode(id, parent, level, data, mapOfIdToChildren, options) {
    const after = options && options.after, before = options && options.before, node = {
        data,
        depth: level - 1,
        id,
        level,
        parent: (parent || '')
    };
    let descendants = 0, height = 0, start, end;
    // Allow custom logic before the children has been created.
    if (typeof before === 'function') {
        before(node, options);
    }
    // Call getNode recursively on the children. Calculate the height of the
    // node, and the number of descendants.
    const children = ((mapOfIdToChildren[id] || [])).map((child) => {
        const node = getNode(child.id, id, (level + 1), child, mapOfIdToChildren, options), childStart = child.start || NaN, childEnd = (child.milestone === true ?
            childStart :
            child.end ||
                NaN);
        // Start should be the lowest child.start.
        start = ((!Tree_isNumber(start) || childStart < start) ?
            childStart :
            start);
        // End should be the largest child.end.
        // If child is milestone, then use start as end.
        end = ((!Tree_isNumber(end) || childEnd > end) ?
            childEnd :
            end);
        descendants = descendants + 1 + node.descendants;
        height = Math.max(node.height + 1, height);
        return node;
    });
    // Calculate start and end for point if it is not already explicitly set.
    if (data) {
        data.start = Tree_pick(data.start, start);
        data.end = Tree_pick(data.end, end);
    }
    Tree_extend(node, {
        children: children,
        descendants: descendants,
        height: height
    });
    // Allow custom logic after the children has been created.
    if (typeof after === 'function') {
        after(node, options);
    }
    return node;
}
/** @private */
function getTree(data, options) {
    return getNode('', null, 1, null, getListOfParents(data), options);
}
/* *
 *
 *  Default Export
 *
 * */
const Tree = {
    getNode,
    getTree
};
/* harmony default export */ const Gantt_Tree = (Tree);

;// ./code/es-modules/Core/Axis/TreeGrid/TreeGridTick.js
/* *
 *
 *  (c) 2016 Highsoft AS
 *  Authors: Jon Arild Nygard
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { addEvent: TreeGridTick_addEvent, removeEvent: TreeGridTick_removeEvent, isObject: TreeGridTick_isObject, isNumber: TreeGridTick_isNumber, pick: TreeGridTick_pick, wrap: TreeGridTick_wrap } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function onTickInit() {
    const tick = this;
    if (!tick.treeGrid) {
        tick.treeGrid = new TreeGridTickAdditions(tick);
    }
}
/**
 * @private
 */
function onTickHover(label) {
    label.addClass('highcharts-treegrid-node-active');
    if (!label.renderer.styledMode) {
        label.css({
            textDecoration: 'underline'
        });
    }
}
/**
 * @private
 */
function onTickHoverExit(label, options) {
    const css = TreeGridTick_isObject(options.style) ? options.style : {};
    label.removeClass('highcharts-treegrid-node-active');
    if (!label.renderer.styledMode) {
        label.css({ textDecoration: (css.textDecoration || 'none') });
    }
}
/**
 * @private
 */
function renderLabelIcon(tick, params) {
    const treeGrid = tick.treeGrid, isNew = !treeGrid.labelIcon, renderer = params.renderer, labelBox = params.xy, options = params.options, width = options.width || 0, height = options.height || 0, padding = options.padding ?? tick.axis.linkedParent ? 0 : 5, iconCenter = {
        x: labelBox.x - (width / 2) - padding,
        y: labelBox.y - (height / 2)
    }, rotation = params.collapsed ? 90 : 180, shouldRender = params.show && TreeGridTick_isNumber(iconCenter.y);
    let icon = treeGrid.labelIcon;
    if (!icon) {
        treeGrid.labelIcon = icon = renderer
            .path(renderer.symbols[options.type](options.x || 0, options.y || 0, width, height))
            .addClass('highcharts-label-icon')
            .add(params.group);
    }
    // Set the new position, and show or hide
    icon[shouldRender ? 'show' : 'hide'](); // #14904, #1338
    // Presentational attributes
    if (!renderer.styledMode) {
        icon
            .attr({
            cursor: 'pointer',
            'fill': TreeGridTick_pick(params.color, "#666666" /* Palette.neutralColor60 */),
            'stroke-width': 1,
            stroke: options.lineColor,
            strokeWidth: options.lineWidth || 0
        });
    }
    // Update the icon positions
    icon[isNew ? 'attr' : 'animate']({
        translateX: iconCenter.x,
        translateY: iconCenter.y,
        rotation: rotation
    });
}
/**
 * @private
 */
function wrapGetLabelPosition(proceed, x, y, label, horiz, labelOptions, tickmarkOffset, index, step) {
    const tick = this, lbOptions = TreeGridTick_pick(tick.options?.labels, labelOptions), pos = tick.pos, axis = tick.axis, isTreeGrid = axis.type === 'treegrid', result = proceed.apply(tick, [x, y, label, horiz, lbOptions, tickmarkOffset, index, step]);
    let mapOfPosToGridNode, node, level;
    if (isTreeGrid) {
        const { width = 0, padding = axis.linkedParent ? 0 : 5 } = (lbOptions && TreeGridTick_isObject(lbOptions.symbol, true) ?
            lbOptions.symbol :
            {}), indentation = (lbOptions && TreeGridTick_isNumber(lbOptions.indentation) ?
            lbOptions.indentation :
            0);
        mapOfPosToGridNode = axis.treeGrid.mapOfPosToGridNode;
        node = mapOfPosToGridNode?.[pos];
        level = node?.depth || 1;
        result.x += (
        // Add space for symbols
        (width + (padding * 2)) +
            // Apply indentation
            ((level - 1) * indentation));
    }
    return result;
}
/**
 * @private
 */
function wrapRenderLabel(proceed) {
    const tick = this, { pos, axis, label, treeGrid: tickGrid, options: tickOptions } = tick, icon = tickGrid?.labelIcon, labelElement = label?.element, { treeGrid: axisGrid, options: axisOptions, chart, tickPositions } = axis, mapOfPosToGridNode = axisGrid.mapOfPosToGridNode, labelOptions = TreeGridTick_pick(tickOptions?.labels, axisOptions?.labels), symbolOptions = (labelOptions && TreeGridTick_isObject(labelOptions.symbol, true) ?
        labelOptions.symbol :
        {}), node = mapOfPosToGridNode?.[pos], { descendants, depth } = node || {}, hasDescendants = node && descendants && descendants > 0, level = depth, isTreeGridElement = (axis.type === 'treegrid') && labelElement, shouldRender = tickPositions.indexOf(pos) > -1, prefixClassName = 'highcharts-treegrid-node-', prefixLevelClass = prefixClassName + 'level-', styledMode = chart.styledMode;
    let collapsed, addClassName, removeClassName;
    if (isTreeGridElement && node) {
        // Add class name for hierarchical styling.
        label
            .removeClass(new RegExp(prefixLevelClass + '.*'))
            .addClass(prefixLevelClass + level);
    }
    proceed.apply(tick, Array.prototype.slice.call(arguments, 1));
    if (isTreeGridElement && hasDescendants) {
        collapsed = axisGrid.isCollapsed(node);
        renderLabelIcon(tick, {
            color: (!styledMode &&
                label.styles.color ||
                ''),
            collapsed: collapsed,
            group: label.parentGroup,
            options: symbolOptions,
            renderer: label.renderer,
            show: shouldRender,
            xy: label.xy
        });
        // Add class name for the node.
        addClassName = prefixClassName +
            (collapsed ? 'collapsed' : 'expanded');
        removeClassName = prefixClassName +
            (collapsed ? 'expanded' : 'collapsed');
        label
            .addClass(addClassName)
            .removeClass(removeClassName);
        if (!styledMode) {
            label.css({
                cursor: 'pointer'
            });
        }
        // Add events to both label text and icon
        [label, icon].forEach((object) => {
            if (object && !object.attachedTreeGridEvents) {
                // On hover
                TreeGridTick_addEvent(object.element, 'mouseover', function () {
                    onTickHover(label);
                });
                // On hover out
                TreeGridTick_addEvent(object.element, 'mouseout', function () {
                    onTickHoverExit(label, labelOptions);
                });
                TreeGridTick_addEvent(object.element, 'click', function () {
                    tickGrid.toggleCollapse();
                });
                object.attachedTreeGridEvents = true;
            }
        });
    }
    else if (icon) {
        TreeGridTick_removeEvent(labelElement);
        label?.css({ cursor: 'default' });
        icon.destroy();
    }
}
/* *
 *
 *  Classes
 *
 * */
/**
 * @private
 * @class
 */
class TreeGridTickAdditions {
    /* *
     *
     *  Static Functions
     *
     * */
    /**
     * @private
     */
    static compose(TickClass) {
        const tickProto = TickClass.prototype;
        if (!tickProto.toggleCollapse) {
            TreeGridTick_addEvent(TickClass, 'init', onTickInit);
            TreeGridTick_wrap(tickProto, 'getLabelPosition', wrapGetLabelPosition);
            TreeGridTick_wrap(tickProto, 'renderLabel', wrapRenderLabel);
            // Backwards compatibility
            tickProto.collapse = function (redraw) {
                this.treeGrid.collapse(redraw);
            };
            tickProto.expand = function (redraw) {
                this.treeGrid.expand(redraw);
            };
            tickProto.toggleCollapse = function (redraw) {
                this.treeGrid.toggleCollapse(redraw);
            };
        }
    }
    /* *
     *
     *  Constructors
     *
     * */
    /**
     * @private
     */
    constructor(tick) {
        this.tick = tick;
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Collapse the grid cell. Used when axis is of type treegrid.
     *
     * @see gantt/treegrid-axis/collapsed-dynamically/demo.js
     *
     * @private
     * @function Highcharts.Tick#collapse
     *
     * @param {boolean} [redraw=true]
     * Whether to redraw the chart or wait for an explicit call to
     * {@link Highcharts.Chart#redraw}
     */
    collapse(redraw) {
        const tick = this.tick, axis = tick.axis, brokenAxis = axis.brokenAxis;
        if (brokenAxis &&
            axis.treeGrid.mapOfPosToGridNode) {
            const pos = tick.pos, node = axis.treeGrid.mapOfPosToGridNode[pos], breaks = axis.treeGrid.collapse(node);
            brokenAxis.setBreaks(breaks, TreeGridTick_pick(redraw, true));
        }
    }
    /**
     * Destroy remaining labelIcon if exist.
     *
     * @private
     * @function Highcharts.Tick#destroy
     */
    destroy() {
        if (this.labelIcon) {
            this.labelIcon.destroy();
        }
    }
    /**
     * Expand the grid cell. Used when axis is of type treegrid.
     *
     * @see gantt/treegrid-axis/collapsed-dynamically/demo.js
     *
     * @private
     * @function Highcharts.Tick#expand
     *
     * @param {boolean} [redraw=true]
     * Whether to redraw the chart or wait for an explicit call to
     * {@link Highcharts.Chart#redraw}
     */
    expand(redraw) {
        const { pos, axis } = this.tick, { treeGrid, brokenAxis } = axis, posMappedNodes = treeGrid.mapOfPosToGridNode;
        if (brokenAxis && posMappedNodes) {
            const node = posMappedNodes[pos], breaks = treeGrid.expand(node);
            brokenAxis.setBreaks(breaks, TreeGridTick_pick(redraw, true));
        }
    }
    /**
     * Toggle the collapse/expand state of the grid cell. Used when axis is
     * of type treegrid.
     *
     * @see gantt/treegrid-axis/collapsed-dynamically/demo.js
     *
     * @private
     * @function Highcharts.Tick#toggleCollapse
     *
     * @param {boolean} [redraw=true]
     * Whether to redraw the chart or wait for an explicit call to
     * {@link Highcharts.Chart#redraw}
     */
    toggleCollapse(redraw) {
        const tick = this.tick, axis = tick.axis, brokenAxis = axis.brokenAxis;
        if (brokenAxis &&
            axis.treeGrid.mapOfPosToGridNode) {
            const pos = tick.pos, node = axis.treeGrid.mapOfPosToGridNode[pos], breaks = axis.treeGrid.toggleCollapse(node);
            brokenAxis.setBreaks(breaks, TreeGridTick_pick(redraw, true));
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const TreeGridTick = (TreeGridTickAdditions);

;// ./code/es-modules/Series/TreeUtilities.js
/* *
 *
 *  (c) 2014-2025 Highsoft AS
 *
 *  Authors: Jon Arild Nygard / Oystein Moseng
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */



const { extend: TreeUtilities_extend, isArray: TreeUtilities_isArray, isNumber: TreeUtilities_isNumber, isObject: TreeUtilities_isObject, merge: TreeUtilities_merge, pick: TreeUtilities_pick, relativeLength: TreeUtilities_relativeLength } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Functions
 *
 * */
/* eslint-disable valid-jsdoc */
/**
 * @private
 */
function getColor(node, options) {
    const index = options.index, mapOptionsToLevel = options.mapOptionsToLevel, parentColor = options.parentColor, parentColorIndex = options.parentColorIndex, series = options.series, colors = options.colors, siblings = options.siblings, points = series.points, chartOptionsChart = series.chart.options.chart;
    let getColorByPoint, point, level, colorByPoint, colorIndexByPoint, color, colorIndex;
    /**
     * @private
     */
    const variateColor = (color) => {
        const colorVariation = level && level.colorVariation;
        if (colorVariation &&
            colorVariation.key === 'brightness' &&
            index &&
            siblings) {
            return external_highcharts_src_js_default_Color_default().parse(color).brighten(colorVariation.to * (index / siblings)).get();
        }
        return color;
    };
    if (node) {
        point = points[node.i];
        level = mapOptionsToLevel[node.level] || {};
        getColorByPoint = point && level.colorByPoint;
        if (getColorByPoint) {
            colorIndexByPoint = point.index % (colors ?
                colors.length :
                chartOptionsChart.colorCount);
            colorByPoint = colors && colors[colorIndexByPoint];
        }
        // Select either point color, level color or inherited color.
        if (!series.chart.styledMode) {
            color = TreeUtilities_pick(point && point.options.color, level && level.color, colorByPoint, parentColor && variateColor(parentColor), series.color);
        }
        colorIndex = TreeUtilities_pick(point && point.options.colorIndex, level && level.colorIndex, colorIndexByPoint, parentColorIndex, options.colorIndex);
    }
    return {
        color: color,
        colorIndex: colorIndex
    };
}
/**
 * Creates a map from level number to its given options.
 *
 * @private
 *
 * @param {Object} params
 * Object containing parameters.
 * - `defaults` Object containing default options. The default options are
 *   merged with the userOptions to get the final options for a specific
 *   level.
 * - `from` The lowest level number.
 * - `levels` User options from series.levels.
 * - `to` The highest level number.
 *
 * @return {Highcharts.Dictionary<object>|null}
 * Returns a map from level number to its given options.
 */
function getLevelOptions(params) {
    const result = {};
    let defaults, converted, i, from, to, levels;
    if (TreeUtilities_isObject(params)) {
        from = TreeUtilities_isNumber(params.from) ? params.from : 1;
        levels = params.levels;
        converted = {};
        defaults = TreeUtilities_isObject(params.defaults) ? params.defaults : {};
        if (TreeUtilities_isArray(levels)) {
            converted = levels.reduce((obj, item) => {
                let level, levelIsConstant, options;
                if (TreeUtilities_isObject(item) && TreeUtilities_isNumber(item.level)) {
                    options = TreeUtilities_merge({}, item);
                    levelIsConstant = TreeUtilities_pick(options.levelIsConstant, defaults.levelIsConstant);
                    // Delete redundant properties.
                    delete options.levelIsConstant;
                    delete options.level;
                    // Calculate which level these options apply to.
                    level = item.level + (levelIsConstant ? 0 : from - 1);
                    if (TreeUtilities_isObject(obj[level])) {
                        TreeUtilities_merge(true, obj[level], options); // #16329
                    }
                    else {
                        obj[level] = options;
                    }
                }
                return obj;
            }, {});
        }
        to = TreeUtilities_isNumber(params.to) ? params.to : 1;
        for (i = 0; i <= to; i++) {
            result[i] = TreeUtilities_merge({}, defaults, TreeUtilities_isObject(converted[i]) ? converted[i] : {});
        }
    }
    return result;
}
/**
 * @private
 * @todo Combine buildTree and buildNode with setTreeValues
 * @todo Remove logic from Treemap and make it utilize this mixin.
 */
function setTreeValues(tree, options) {
    const before = options.before, idRoot = options.idRoot, mapIdToNode = options.mapIdToNode, nodeRoot = mapIdToNode[idRoot], levelIsConstant = (options.levelIsConstant !== false), points = options.points, point = points[tree.i], optionsPoint = point && point.options || {}, children = [];
    let childrenTotal = 0;
    tree.levelDynamic = tree.level - (levelIsConstant ? 0 : nodeRoot.level);
    tree.name = TreeUtilities_pick(point && point.name, '');
    tree.visible = (idRoot === tree.id ||
        options.visible === true);
    if (typeof before === 'function') {
        tree = before(tree, options);
    }
    // First give the children some values
    tree.children.forEach((child, i) => {
        const newOptions = TreeUtilities_extend({}, options);
        TreeUtilities_extend(newOptions, {
            index: i,
            siblings: tree.children.length,
            visible: tree.visible
        });
        child = setTreeValues(child, newOptions);
        children.push(child);
        if (child.visible) {
            childrenTotal += child.val;
        }
    });
    // Set the values
    const value = TreeUtilities_pick(optionsPoint.value, childrenTotal);
    tree.visible = value >= 0 && (childrenTotal > 0 || tree.visible);
    tree.children = children;
    tree.childrenTotal = childrenTotal;
    tree.isLeaf = tree.visible && !childrenTotal;
    tree.val = value;
    return tree;
}
/**
 * Update the rootId property on the series. Also makes sure that it is
 * accessible to exporting.
 *
 * @private
 *
 * @param {Object} series
 * The series to operate on.
 *
 * @return {string}
 * Returns the resulting rootId after update.
 */
function updateRootId(series) {
    let rootId, options;
    if (TreeUtilities_isObject(series)) {
        // Get the series options.
        options = TreeUtilities_isObject(series.options) ? series.options : {};
        // Calculate the rootId.
        rootId = TreeUtilities_pick(series.rootNode, options.rootId, '');
        // Set rootId on series.userOptions to pick it up in exporting.
        if (TreeUtilities_isObject(series.userOptions)) {
            series.userOptions.rootId = rootId;
        }
        // Set rootId on series to pick it up on next update.
        series.rootNode = rootId;
    }
    return rootId;
}
/**
 * Get the node width, which relies on the plot width and the nodeDistance
 * option.
 *
 * @private
 */
function getNodeWidth(series, columnCount) {
    const { chart, options } = series, { nodeDistance = 0, nodeWidth = 0 } = options, { plotSizeX = 1 } = chart;
    // Node width auto means they are evenly distributed along the width of
    // the plot area
    if (nodeWidth === 'auto') {
        if (typeof nodeDistance === 'string' && /%$/.test(nodeDistance)) {
            const fraction = parseFloat(nodeDistance) / 100, total = columnCount + fraction * (columnCount - 1);
            return plotSizeX / total;
        }
        const nDistance = Number(nodeDistance);
        return ((plotSizeX + nDistance) /
            (columnCount || 1)) - nDistance;
    }
    return TreeUtilities_relativeLength(nodeWidth, plotSizeX);
}
/* *
 *
 *  Default Export
 *
 * */
const TreeUtilities = {
    getColor,
    getLevelOptions,
    getNodeWidth,
    setTreeValues,
    updateRootId
};
/* harmony default export */ const Series_TreeUtilities = (TreeUtilities);

;// ./code/es-modules/Core/Axis/TreeGrid/TreeGridAxis.js
/* *
 *
 *  (c) 2016 Highsoft AS
 *  Authors: Jon Arild Nygard
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */






const { getLevelOptions: TreeGridAxis_getLevelOptions } = Series_TreeUtilities;

const { addEvent: TreeGridAxis_addEvent, isArray: TreeGridAxis_isArray, splat: TreeGridAxis_splat, find: TreeGridAxis_find, fireEvent: TreeGridAxis_fireEvent, isObject: TreeGridAxis_isObject, isString: TreeGridAxis_isString, merge: TreeGridAxis_merge, pick: TreeGridAxis_pick, removeEvent: TreeGridAxis_removeEvent, wrap: TreeGridAxis_wrap } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Variables
 *
 * */
let TickConstructor;
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function getBreakFromNode(node, max) {
    const to = node.collapseEnd || 0;
    let from = node.collapseStart || 0;
    // In broken-axis, the axis.max is minimized until it is not within a
    // break. Therefore, if break.to is larger than axis.max, the axis.to
    // should not add the 0.5 axis.tickMarkOffset, to avoid adding a break
    // larger than axis.max.
    // TODO consider simplifying broken-axis and this might solve itself
    if (to >= max) {
        from -= 0.5;
    }
    return {
        from: from,
        to: to,
        showPoints: false
    };
}
/**
 * Creates a tree structure of the data, and the treegrid. Calculates
 * categories, and y-values of points based on the tree.
 *
 * @private
 * @function getTreeGridFromData
 *
 * @param {Array<Highcharts.GanttPointOptions>} data
 * All the data points to display in the axis.
 *
 * @param {boolean} uniqueNames
 * Whether or not the data node with the same name should share grid cell. If
 * true they do share cell. False by default.
 *
 * @param {number} numberOfSeries
 *
 * @return {Object}
 * Returns an object containing categories, mapOfIdToNode,
 * mapOfPosToGridNode, and tree.
 *
 * @todo There should be only one point per line.
 * @todo It should be optional to have one category per point, or merge
 *       cells
 * @todo Add unit-tests.
 */
function getTreeGridFromData(data, uniqueNames, numberOfSeries) {
    const categories = [], collapsedNodes = [], mapOfIdToNode = {}, uniqueNamesEnabled = uniqueNames || false;
    let mapOfPosToGridNode = {}, posIterator = -1;
    // Build the tree from the series data.
    const treeParams = {
        // After the children has been created.
        after: function (node) {
            const gridNode = mapOfPosToGridNode[node.pos];
            let height = 0, descendants = 0;
            gridNode.children.forEach(function (child) {
                descendants += (child.descendants || 0) + 1;
                height = Math.max((child.height || 0) + 1, height);
            });
            gridNode.descendants = descendants;
            gridNode.height = height;
            if (gridNode.collapsed) {
                collapsedNodes.push(gridNode);
            }
        },
        // Before the children has been created.
        before: function (node) {
            const data = TreeGridAxis_isObject(node.data, true) ?
                node.data :
                {}, name = TreeGridAxis_isString(data.name) ? data.name : '', parentNode = mapOfIdToNode[node.parent], parentGridNode = (TreeGridAxis_isObject(parentNode, true) ?
                mapOfPosToGridNode[parentNode.pos] :
                null), hasSameName = function (x) {
                return x.name === name;
            };
            let gridNode, pos;
            // If not unique names, look for sibling node with the same name
            if (uniqueNamesEnabled &&
                TreeGridAxis_isObject(parentGridNode, true) &&
                !!(gridNode = TreeGridAxis_find(parentGridNode.children, hasSameName))) {
                // If there is a gridNode with the same name, reuse position
                pos = gridNode.pos;
                // Add data node to list of nodes in the grid node.
                gridNode.nodes.push(node);
            }
            else {
                // If it is a new grid node, increment position.
                pos = posIterator++;
            }
            // Add new grid node to map.
            if (!mapOfPosToGridNode[pos]) {
                mapOfPosToGridNode[pos] = gridNode = {
                    depth: parentGridNode ? parentGridNode.depth + 1 : 0,
                    name: name,
                    id: data.id,
                    nodes: [node],
                    children: [],
                    pos: pos
                };
                // If not root, then add name to categories.
                if (pos !== -1) {
                    categories.push(name);
                }
                // Add name to list of children.
                if (TreeGridAxis_isObject(parentGridNode, true)) {
                    parentGridNode.children.push(gridNode);
                }
            }
            // Add data node to map
            if (TreeGridAxis_isString(node.id)) {
                mapOfIdToNode[node.id] = node;
            }
            // If one of the points are collapsed, then start the grid node
            // in collapsed state.
            if (gridNode &&
                data.collapsed === true) {
                gridNode.collapsed = true;
            }
            // Assign pos to data node
            node.pos = pos;
        }
    };
    const updateYValuesAndTickPos = function (map, numberOfSeries) {
        const setValues = function (gridNode, start, result) {
            const nodes = gridNode.nodes, padding = 0.5;
            let end = start + (start === -1 ? 0 : numberOfSeries - 1);
            const diff = (end - start) / 2, pos = start + diff;
            nodes.forEach(function (node) {
                const data = node.data;
                if (TreeGridAxis_isObject(data, true)) {
                    // Update point
                    data.y = start + (data.seriesIndex || 0);
                    // Remove the property once used
                    delete data.seriesIndex;
                }
                node.pos = pos;
            });
            result[pos] = gridNode;
            gridNode.pos = pos;
            gridNode.tickmarkOffset = diff + padding;
            gridNode.collapseStart = end + padding;
            gridNode.children.forEach(function (child) {
                setValues(child, end + 1, result);
                end = (child.collapseEnd || 0) - padding;
            });
            // Set collapseEnd to the end of the last child node.
            gridNode.collapseEnd = end + padding;
            return result;
        };
        return setValues(map['-1'], -1, {});
    };
    // Create tree from data
    const tree = Gantt_Tree.getTree(data, treeParams);
    // Update y values of data, and set calculate tick positions.
    mapOfPosToGridNode = updateYValuesAndTickPos(mapOfPosToGridNode, numberOfSeries);
    // Return the resulting data.
    return {
        categories: categories,
        mapOfIdToNode: mapOfIdToNode,
        mapOfPosToGridNode: mapOfPosToGridNode,
        collapsedNodes: collapsedNodes,
        tree: tree
    };
}
/**
 * Builds the tree of categories and calculates its positions.
 * @private
 * @param {Object} e Event object
 * @param {Object} e.target The chart instance which the event was fired on.
 * @param {object[]} e.target.axes The axes of the chart.
 */
function onBeforeRender(e) {
    const chart = e.target, axes = chart.axes;
    axes.filter((axis) => axis.type === 'treegrid').forEach(function (axis) {
        const options = axis.options || {}, labelOptions = options.labels, uniqueNames = axis.uniqueNames, max = chart.time.parse(options.max), 
        // Check whether any of series is rendering for the first
        // time, visibility has changed, or its data is dirty, and
        // only then update. #10570, #10580. Also check if
        // mapOfPosToGridNode exists. #10887
        isDirty = (!axis.treeGrid.mapOfPosToGridNode ||
            axis.series.some(function (series) {
                return !series.hasRendered ||
                    series.isDirtyData ||
                    series.isDirty;
            }));
        let numberOfSeries = 0, data, treeGrid;
        if (isDirty) {
            const seriesHasPrimitivePoints = [];
            // Concatenate data from all series assigned to this axis.
            data = axis.series.reduce(function (arr, s) {
                const seriesData = (s.options.data || []), firstPoint = seriesData[0], 
                // Check if the first point is a simple array of values.
                // If so we assume that this is the case for all points.
                foundPrimitivePoint = (Array.isArray(firstPoint) &&
                    !firstPoint.find((value) => (typeof value === 'object')));
                seriesHasPrimitivePoints.push(foundPrimitivePoint);
                if (s.visible) {
                    // Push all data to array
                    seriesData.forEach(function (pointOptions) {
                        // For using keys, or when using primitive points,
                        // rebuild the data structure
                        if (foundPrimitivePoint || s.options.keys?.length) {
                            pointOptions = s.pointClass.prototype
                                .optionsToObject
                                .call({ series: s }, pointOptions);
                            s.pointClass.setGanttPointAliases(pointOptions, chart);
                        }
                        if (TreeGridAxis_isObject(pointOptions, true)) {
                            // Set series index on data. Removed again
                            // after use.
                            pointOptions.seriesIndex = (numberOfSeries);
                            arr.push(pointOptions);
                        }
                    });
                    // Increment series index
                    if (uniqueNames === true) {
                        numberOfSeries++;
                    }
                }
                return arr;
            }, []);
            // If max is higher than set data - add a
            // dummy data to render categories #10779
            if (max && data.length < max) {
                for (let i = data.length; i <= max; i++) {
                    data.push({
                        // Use the zero-width character
                        // to avoid conflict with uniqueNames
                        name: i + '\u200B'
                    });
                }
            }
            // `setScale` is fired after all the series is initialized,
            // which is an ideal time to update the axis.categories.
            treeGrid = getTreeGridFromData(data, uniqueNames || false, (uniqueNames === true) ? numberOfSeries : 1);
            // Assign values to the axis.
            axis.categories = treeGrid.categories;
            axis.treeGrid.mapOfPosToGridNode = (treeGrid.mapOfPosToGridNode);
            axis.hasNames = true;
            axis.treeGrid.tree = treeGrid.tree;
            // Update yData now that we have calculated the y values
            axis.series.forEach(function (series, index) {
                const axisData = (series.options.data || []).map(function (d) {
                    if (seriesHasPrimitivePoints[index] ||
                        (TreeGridAxis_isArray(d) &&
                            series.options.keys &&
                            series.options.keys.length)) {
                        // Get the axisData from the data array used to
                        // build the treeGrid where has been modified
                        data.forEach(function (point) {
                            const toArray = TreeGridAxis_splat(d);
                            if (toArray.indexOf(point.x || 0) >= 0 &&
                                toArray.indexOf(point.x2 || 0) >= 0) {
                                d = point;
                            }
                        });
                    }
                    return TreeGridAxis_isObject(d, true) ? TreeGridAxis_merge(d) : d;
                });
                // Avoid destroying points when series is not visible
                if (series.visible) {
                    series.setData(axisData, false);
                }
            });
            // Calculate the label options for each level in the tree.
            axis.treeGrid.mapOptionsToLevel =
                TreeGridAxis_getLevelOptions({
                    defaults: labelOptions,
                    from: 1,
                    levels: labelOptions?.levels,
                    to: axis.treeGrid.tree?.height
                });
            // Setting initial collapsed nodes
            if (e.type === 'beforeRender') {
                axis.treeGrid.collapsedNodes = treeGrid.collapsedNodes;
            }
        }
    });
}
/**
 * Generates a tick for initial positioning.
 *
 * @private
 * @function Highcharts.GridAxis#generateTick
 *
 * @param {Function} proceed
 * The original generateTick function.
 *
 * @param {number} pos
 * The tick position in axis values.
 */
function wrapGenerateTick(proceed, pos) {
    const axis = this, mapOptionsToLevel = axis.treeGrid.mapOptionsToLevel || {}, isTreeGrid = axis.type === 'treegrid', ticks = axis.ticks;
    let tick = ticks[pos], levelOptions, options, gridNode;
    if (isTreeGrid &&
        axis.treeGrid.mapOfPosToGridNode) {
        gridNode = axis.treeGrid.mapOfPosToGridNode[pos];
        levelOptions = mapOptionsToLevel[gridNode.depth];
        if (levelOptions) {
            options = {
                labels: levelOptions
            };
        }
        if (!tick &&
            TickConstructor) {
            ticks[pos] = tick =
                new TickConstructor(axis, pos, void 0, void 0, {
                    category: gridNode.name,
                    tickmarkOffset: gridNode.tickmarkOffset,
                    options: options
                });
        }
        else {
            // Update labels depending on tick interval
            tick.parameters.category = gridNode.name;
            tick.options = options;
            tick.addLabel();
        }
    }
    else {
        proceed.apply(axis, Array.prototype.slice.call(arguments, 1));
    }
}
/**
 * @private
 */
function wrapInit(proceed, chart, userOptions, coll) {
    const axis = this, isTreeGrid = userOptions.type === 'treegrid';
    if (!axis.treeGrid) {
        axis.treeGrid = new TreeGridAxisAdditions(axis);
    }
    // Set default and forced options for TreeGrid
    if (isTreeGrid) {
        // Add event for updating the categories of a treegrid.
        // NOTE Preferably these events should be set on the axis.
        TreeGridAxis_addEvent(chart, 'beforeRender', onBeforeRender);
        TreeGridAxis_addEvent(chart, 'beforeRedraw', onBeforeRender);
        // Add new collapsed nodes on addseries
        TreeGridAxis_addEvent(chart, 'addSeries', function (e) {
            if (e.options.data) {
                const treeGrid = getTreeGridFromData(e.options.data, userOptions.uniqueNames || false, 1);
                axis.treeGrid.collapsedNodes = (axis.treeGrid.collapsedNodes || []).concat(treeGrid.collapsedNodes);
            }
        });
        // Collapse all nodes in axis.treegrid.collapsednodes
        // where collapsed equals true.
        TreeGridAxis_addEvent(axis, 'foundExtremes', function () {
            if (axis.treeGrid.collapsedNodes) {
                axis.treeGrid.collapsedNodes.forEach(function (node) {
                    const breaks = axis.treeGrid.collapse(node);
                    if (axis.brokenAxis) {
                        axis.brokenAxis.setBreaks(breaks, false);
                        // Remove the node from the axis collapsedNodes
                        if (axis.treeGrid.collapsedNodes) {
                            axis.treeGrid.collapsedNodes = axis.treeGrid
                                .collapsedNodes
                                .filter((n) => ((node.collapseStart !==
                                n.collapseStart) ||
                                node.collapseEnd !== n.collapseEnd));
                        }
                    }
                });
            }
        });
        // If staticScale is not defined on the yAxis
        // and chart height is set, set axis.isDirty
        // to ensure collapsing works (#12012)
        TreeGridAxis_addEvent(axis, 'afterBreaks', function () {
            if (axis.coll === 'yAxis' &&
                !axis.staticScale &&
                axis.chart.options.chart.height) {
                axis.isDirty = true;
            }
        });
        userOptions = TreeGridAxis_merge({
            // Default options
            grid: {
                enabled: true
            },
            // TODO: add support for align in treegrid.
            labels: {
                align: 'left',
                /**
                * Set options on specific levels in a tree grid axis. Takes
                * precedence over labels options.
                *
                * @sample {gantt} gantt/treegrid-axis/labels-levels
                *         Levels on TreeGrid Labels
                *
                * @type      {Array<*>}
                * @product   gantt
                * @apioption yAxis.labels.levels
                *
                * @private
                */
                levels: [{
                        /**
                        * Specify the level which the options within this object
                        * applies to.
                        *
                        * @type      {number}
                        * @product   gantt
                        * @apioption yAxis.labels.levels.level
                        *
                        * @private
                        */
                        level: void 0
                    }, {
                        level: 1,
                        /**
                         * @type      {Highcharts.CSSObject}
                         * @product   gantt
                         * @apioption yAxis.labels.levels.style
                         *
                         * @private
                         */
                        style: {
                            /** @ignore-option */
                            fontWeight: 'bold'
                        }
                    }],
                /**
                 * The symbol for the collapse and expand icon in a
                 * treegrid.
                 *
                 * @product      gantt
                 * @optionparent yAxis.labels.symbol
                 *
                 * @private
                 */
                symbol: {
                    /**
                     * The symbol type. Points to a definition function in
                     * the `Highcharts.Renderer.symbols` collection.
                     *
                     * @type {Highcharts.SymbolKeyValue}
                     *
                     * @private
                     */
                    type: 'triangle',
                    x: -5,
                    y: -5,
                    height: 10,
                    width: 10
                }
            },
            uniqueNames: false
        }, userOptions, {
            // Forced options
            reversed: true
        });
    }
    // Now apply the original function with the original arguments, which are
    // sliced off this function's arguments
    proceed.apply(axis, [chart, userOptions, coll]);
    if (isTreeGrid) {
        axis.hasNames = true;
        axis.options.showLastLabel = true;
    }
}
/**
 * Set the tick positions, tickInterval, axis min and max.
 *
 * @private
 * @function Highcharts.GridAxis#setTickInterval
 *
 * @param {Function} proceed
 * The original setTickInterval function.
 */
function wrapSetTickInterval(proceed) {
    const axis = this, options = axis.options, time = axis.chart.time, linkedParent = typeof options.linkedTo === 'number' ?
        this.chart[axis.coll]?.[options.linkedTo] :
        void 0, isTreeGrid = axis.type === 'treegrid';
    if (isTreeGrid) {
        axis.min = axis.userMin ?? time.parse(options.min) ?? axis.dataMin;
        axis.max = axis.userMax ?? time.parse(options.max) ?? axis.dataMax;
        TreeGridAxis_fireEvent(axis, 'foundExtremes');
        // `setAxisTranslation` modifies the min and max according to axis
        // breaks.
        axis.setAxisTranslation();
        axis.tickInterval = 1;
        axis.tickmarkOffset = 0.5;
        axis.tickPositions = axis.treeGrid.mapOfPosToGridNode ?
            axis.treeGrid.getTickPositions() :
            [];
        if (linkedParent) {
            const linkedParentExtremes = linkedParent.getExtremes();
            axis.min = TreeGridAxis_pick(linkedParentExtremes.min, linkedParentExtremes.dataMin);
            axis.max = TreeGridAxis_pick(linkedParentExtremes.max, linkedParentExtremes.dataMax);
            axis.tickPositions = linkedParent.tickPositions;
        }
        axis.linkedParent = linkedParent;
    }
    else {
        proceed.apply(axis, Array.prototype.slice.call(arguments, 1));
    }
}
/**
 * Wrap axis redraw to remove TreeGrid events from ticks
 *
 * @private
 * @function Highcharts.GridAxis#redraw
 *
 * @param {Function} proceed
 * The original setTickInterval function.
 */
function wrapRedraw(proceed) {
    const axis = this, isTreeGrid = this.type === 'treegrid';
    if (isTreeGrid && axis.visible) {
        axis.tickPositions.forEach(function (pos) {
            const tick = axis.ticks[pos];
            if (tick.label?.attachedTreeGridEvents) {
                TreeGridAxis_removeEvent(tick.label.element);
                tick.label.attachedTreeGridEvents = false;
            }
        });
    }
    proceed.apply(axis, Array.prototype.slice.call(arguments, 1));
}
/* *
 *
 *  Classes
 *
 * */
/**
 * @private
 * @class
 */
class TreeGridAxisAdditions {
    /* *
     *
     *  Static Functions
     *
     * */
    /**
     * @private
     */
    static compose(AxisClass, ChartClass, SeriesClass, TickClass) {
        if (!AxisClass.keepProps.includes('treeGrid')) {
            const axisProps = AxisClass.prototype;
            AxisClass.keepProps.push('treeGrid');
            TreeGridAxis_wrap(axisProps, 'generateTick', wrapGenerateTick);
            TreeGridAxis_wrap(axisProps, 'init', wrapInit);
            TreeGridAxis_wrap(axisProps, 'setTickInterval', wrapSetTickInterval);
            TreeGridAxis_wrap(axisProps, 'redraw', wrapRedraw);
            // Make utility functions available for testing.
            axisProps.utils = {
                getNode: Gantt_Tree.getNode
            };
            if (!TickConstructor) {
                TickConstructor = TickClass;
            }
        }
        Axis_GridAxis.compose(AxisClass, ChartClass, TickClass);
        Axis_BrokenAxis.compose(AxisClass, SeriesClass);
        TreeGridTick.compose(TickClass);
        return AxisClass;
    }
    /* *
     *
     *  Constructors
     *
     * */
    /**
     * @private
     */
    constructor(axis) {
        this.axis = axis;
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Set the collapse status.
     *
     * @private
     *
     * @param {Highcharts.Axis} axis
     * The axis to check against.
     *
     * @param {Highcharts.GridNode} node
     * The node to collapse.
     */
    setCollapsedStatus(node) {
        const axis = this.axis, chart = axis.chart;
        axis.series.forEach(function (series) {
            const data = series.options.data;
            if (node.id && data) {
                const point = chart.get(node.id), dataPoint = data[series.data.indexOf(point)];
                if (point && dataPoint) {
                    point.collapsed = node.collapsed;
                    dataPoint.collapsed = node.collapsed;
                }
            }
        });
    }
    /**
     * Calculates the new axis breaks to collapse a node.
     *
     * @private
     *
     * @param {Highcharts.Axis} axis
     * The axis to check against.
     *
     * @param {Highcharts.GridNode} node
     * The node to collapse.
     *
     * @param {number} pos
     * The tick position to collapse.
     *
     * @return {Array<object>}
     * Returns an array of the new breaks for the axis.
     */
    collapse(node) {
        const axis = this.axis, breaks = (axis.options.breaks || []), obj = getBreakFromNode(node, axis.max);
        breaks.push(obj);
        // Change the collapsed flag #13838
        node.collapsed = true;
        axis.treeGrid.setCollapsedStatus(node);
        return breaks;
    }
    /**
     * Calculates the new axis breaks to expand a node.
     *
     * @private
     *
     * @param {Highcharts.Axis} axis
     * The axis to check against.
     *
     * @param {Highcharts.GridNode} node
     * The node to expand.
     *
     * @param {number} pos
     * The tick position to expand.
     *
     * @return {Array<object>}
     * Returns an array of the new breaks for the axis.
     */
    expand(node) {
        const axis = this.axis, breaks = (axis.options.breaks || []), obj = getBreakFromNode(node, axis.max);
        // Change the collapsed flag #13838
        node.collapsed = false;
        axis.treeGrid.setCollapsedStatus(node);
        // Remove the break from the axis breaks array.
        return breaks.reduce(function (arr, b) {
            if (b.to !== obj.to || b.from !== obj.from) {
                arr.push(b);
            }
            return arr;
        }, []);
    }
    /**
     * Creates a list of positions for the ticks on the axis. Filters out
     * positions that are outside min and max, or is inside an axis break.
     *
     * @private
     *
     * @return {Array<number>}
     * List of positions.
     */
    getTickPositions() {
        const axis = this.axis, roundedMin = Math.floor(axis.min / axis.tickInterval) * axis.tickInterval, roundedMax = Math.ceil(axis.max / axis.tickInterval) * axis.tickInterval;
        return Object.keys(axis.treeGrid.mapOfPosToGridNode || {}).reduce(function (arr, key) {
            const pos = +key;
            if (pos >= roundedMin &&
                pos <= roundedMax &&
                !axis.brokenAxis?.isInAnyBreak(pos)) {
                arr.push(pos);
            }
            return arr;
        }, []);
    }
    /**
     * Check if a node is collapsed.
     *
     * @private
     *
     * @param {Highcharts.Axis} axis
     * The axis to check against.
     *
     * @param {Object} node
     * The node to check if is collapsed.
     *
     * @param {number} pos
     * The tick position to collapse.
     *
     * @return {boolean}
     * Returns true if collapsed, false if expanded.
     */
    isCollapsed(node) {
        const axis = this.axis, breaks = (axis.options.breaks || []), obj = getBreakFromNode(node, axis.max);
        return breaks.some(function (b) {
            return b.from === obj.from && b.to === obj.to;
        });
    }
    /**
     * Calculates the new axis breaks after toggling the collapse/expand
     * state of a node. If it is collapsed it will be expanded, and if it is
     * expanded it will be collapsed.
     *
     * @private
     *
     * @param {Highcharts.Axis} axis
     * The axis to check against.
     *
     * @param {Highcharts.GridNode} node
     * The node to toggle.
     *
     * @return {Array<object>}
     * Returns an array of the new breaks for the axis.
     */
    toggleCollapse(node) {
        return (this.isCollapsed(node) ?
            this.expand(node) :
            this.collapse(node));
    }
}
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const TreeGridAxis = (TreeGridAxisAdditions);

;// ./code/es-modules/Series/Gantt/GanttSeries.js
/* *
 *
 *  (c) 2016-2025 Highsoft AS
 *
 *  Author: Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */





const { series: Series, seriesTypes: { xrange: XRangeSeries } } = (external_highcharts_src_js_default_SeriesRegistry_default());



const { extend: GanttSeries_extend, isNumber: GanttSeries_isNumber, merge: GanttSeries_merge } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Class
 *
 * */
/**
 * @private
 * @class
 * @name Highcharts.seriesTypes.gantt
 *
 * @augments Highcharts.Series
 */
class GanttSeries extends XRangeSeries {
    /* *
     *
     *  Static Functions
     *
     * */
    static compose(AxisClass, ChartClass, SeriesClass, TickClass) {
        XRangeSeries.compose(AxisClass);
        if (!ChartClass) {
            return;
        }
        Extensions_StaticScale.compose(AxisClass, ChartClass);
        if (!SeriesClass) {
            return;
        }
        Gantt_Pathfinder.compose(ChartClass, SeriesClass.prototype.pointClass);
        if (!TickClass) {
            return;
        }
        TreeGridAxis.compose(AxisClass, ChartClass, SeriesClass, TickClass);
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Draws a single point in the series.
     *
     * This override draws the point as a diamond if point.options.milestone
     * is true, and uses the original drawPoint() if it is false or not set.
     *
     * @requires highcharts-gantt
     *
     * @private
     * @function Highcharts.seriesTypes.gantt#drawPoint
     *
     * @param {Highcharts.Point} point
     *        An instance of Point in the series
     *
     * @param {"animate"|"attr"} verb
     *        'animate' (animates changes) or 'attr' (sets options)
     */
    drawPoint(point, verb) {
        const series = this, seriesOpts = series.options, renderer = series.chart.renderer, shapeArgs = point.shapeArgs, plotY = point.plotY, state = point.selected && 'select', cutOff = seriesOpts.stacking && !seriesOpts.borderRadius;
        let graphic = point.graphic, diamondShape;
        if (point.options.milestone) {
            if (GanttSeries_isNumber(plotY) &&
                point.y !== null &&
                point.visible !== false) {
                diamondShape = renderer.symbols.diamond(shapeArgs.x || 0, shapeArgs.y || 0, shapeArgs.width || 0, shapeArgs.height || 0);
                if (graphic) {
                    graphic[verb]({
                        d: diamondShape
                    });
                }
                else {
                    point.graphic = graphic = renderer.path(diamondShape)
                        .addClass(point.getClassName(), true)
                        .add(point.group || series.group);
                }
                // Presentational
                if (!series.chart.styledMode) {
                    point.graphic
                        .attr(series.pointAttribs(point, state))
                        .shadow(seriesOpts.shadow, null, cutOff);
                }
            }
            else if (graphic) {
                point.graphic = graphic.destroy(); // #1269
            }
        }
        else {
            super.drawPoint(point, verb);
        }
    }
    /**
     * Handle milestones, as they have no x2.
     * @private
     */
    translatePoint(point) {
        let shapeArgs, size;
        super.translatePoint(point);
        if (point.options.milestone) {
            shapeArgs = point.shapeArgs;
            size = shapeArgs.height || 0;
            point.shapeArgs = {
                x: (shapeArgs.x || 0) - (size / 2),
                y: shapeArgs.y,
                width: size,
                height: size
            };
        }
    }
}
/* *
 *
 *  Static Properties
 *
 * */
GanttSeries.defaultOptions = GanttSeries_merge(XRangeSeries.defaultOptions, Gantt_GanttSeriesDefaults);
GanttSeries_extend(GanttSeries.prototype, {
    pointArrayMap: ['start', 'end', 'y'],
    pointClass: Gantt_GanttPoint,
    setData: Series.prototype.setData
});
external_highcharts_src_js_default_SeriesRegistry_default().registerSeriesType('gantt', GanttSeries);
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Gantt_GanttSeries = (GanttSeries);

;// ./code/es-modules/masters/modules/gantt.src.js












// Series


const G = (external_highcharts_src_js_default_default());
// Classes
G.Connection = G.Connection || Gantt_Connection;
G.GanttChart = G.GanttChart || Chart_GanttChart;
G.Navigator = G.Navigator || Navigator_Navigator;
G.RangeSelector = G.RangeSelector || RangeSelector_RangeSelector;
G.Scrollbar = G.Scrollbar || Scrollbar_Scrollbar;
// Functions
G.ganttChart = G.GanttChart.ganttChart;
// Compositions
Extensions_ArrowSymbols.compose(G.SVGRenderer);
Extensions_CurrentDateIndication.compose(G.Axis, G.PlotLineOrBand);
Gantt_GanttSeries.compose(G.Axis, G.Chart, G.Series, G.Tick);
G.Navigator.compose(G.Chart, G.Axis, G.Series);
G.RangeSelector.compose(G.Axis, G.Chart);
G.Scrollbar.compose(G.Axis);
/* harmony default export */ const gantt_src = ((external_highcharts_src_js_default_default()));

export { gantt_src as default };
