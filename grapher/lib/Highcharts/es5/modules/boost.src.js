/**
 * @license Highcharts JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/boost
 * @requires highcharts
 *
 * Boost module
 *
 * (c) 2010-2025 Highsoft AS
 * Author: Torstein Honsi
 *
 * License: www.highcharts.com/license
 *
 * */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("highcharts"), require("highcharts")["Color"]);
	else if(typeof define === 'function' && define.amd)
		define("highcharts/modules/boost", [["highcharts/highcharts"], ["highcharts/highcharts","Color"]], factory);
	else if(typeof exports === 'object')
		exports["highcharts/modules/boost"] = factory(require("highcharts"), require("highcharts")["Color"]);
	else
		root["Highcharts"] = factory(root["Highcharts"], root["Highcharts"]["Color"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__944__, __WEBPACK_EXTERNAL_MODULE__620__) {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 620:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__620__;

/***/ }),

/***/ 944:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__944__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ boost_src; }
});

// EXTERNAL MODULE: external {"amd":["highcharts/highcharts"],"commonjs":["highcharts"],"commonjs2":["highcharts"],"root":["Highcharts"]}
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_ = __webpack_require__(944);
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default = /*#__PURE__*/__webpack_require__.n(highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_);
;// ./code/es5/es-modules/Extensions/Boost/Boostables.js
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

/* *
 *
 *  Constants
 *
 * */
// These are the series we allow boosting for.
var Boostables = [
    'area',
    'areaspline',
    'arearange',
    'column',
    'columnrange',
    'bar',
    'line',
    'scatter',
    'heatmap',
    'bubble',
    'treemap'
];
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Boost_Boostables = (Boostables);

;// ./code/es5/es-modules/Extensions/Boost/BoostableMap.js
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

/* *
 *
 *  Imports
 *
 * */

/* *
 *
 *  Constants
 *
 * */
// These are the series we allow boosting for.
var BoostableMap = {};
Boost_Boostables.forEach(function (item) {
    BoostableMap[item] = true;
});
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Boost_BoostableMap = (BoostableMap);

;// ./code/es5/es-modules/Extensions/Boost/BoostChart.js
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



var composed = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).composed;

var addEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).addEvent, pick = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pick, pushUnique = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pushUnique;
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function compose(ChartClass, wglMode) {
    if (wglMode && pushUnique(composed, 'Boost.Chart')) {
        ChartClass.prototype.callbacks.push(onChartCallback);
    }
    return ChartClass;
}
/**
 * Get the clip rectangle for a target, either a series or the chart.
 * For the chart, we need to consider the maximum extent of its Y axes,
 * in case of Highcharts Stock panes and navigator.
 *
 * @private
 * @function Highcharts.Chart#getBoostClipRect
 */
function getBoostClipRect(chart, target) {
    var navigator = chart.navigator;
    var clipBox = {
            x: chart.plotLeft,
            y: chart.plotTop,
            width: chart.plotWidth,
            height: chart.plotHeight
        };
    if (navigator && chart.inverted) { // #17820, #20936
        clipBox.width += navigator.top + navigator.height;
        if (!navigator.opposite) {
            clipBox.x = navigator.left;
        }
    }
    else if (navigator && !chart.inverted) {
        clipBox.height = navigator.top + navigator.height - chart.plotTop;
    }
    // Clipping of individual series (#11906, #19039).
    if (target.is) {
        var _a = target,
            xAxis = _a.xAxis,
            yAxis = _a.yAxis;
        clipBox = chart.getClipBox(target);
        if (chart.inverted) {
            var lateral = clipBox.width;
            clipBox.width = clipBox.height;
            clipBox.height = lateral;
            clipBox.x = yAxis.pos;
            clipBox.y = xAxis.pos;
        }
        else {
            clipBox.x = xAxis.pos;
            clipBox.y = yAxis.pos;
        }
    }
    if (target === chart) {
        var verticalAxes = chart.inverted ? chart.xAxis : chart.yAxis; // #14444
            if (verticalAxes.length <= 1) {
                clipBox.y = Math.min(verticalAxes[0].pos,
            clipBox.y);
            clipBox.height = (verticalAxes[0].pos -
                chart.plotTop +
                verticalAxes[0].len);
        }
    }
    return clipBox;
}
/**
 * Returns true if the chart is in series boost mode.
 * @private
 * @param {Highcharts.Chart} chart
 * Chart to check.
 * @return {boolean}
 * `true` if the chart is in series boost mode.
 */
function isChartSeriesBoosting(chart) {
    var allSeries = chart.series,
        boost = chart.boost = chart.boost || {},
        boostOptions = chart.options.boost || {},
        threshold = pick(boostOptions.seriesThreshold, 50);
    if (allSeries.length >= threshold) {
        return true;
    }
    if (allSeries.length === 1) {
        return false;
    }
    var allowBoostForce = boostOptions.allowForce;
    if (typeof allowBoostForce === 'undefined') {
        allowBoostForce = true;
        for (var _i = 0, _a = chart.xAxis; _i < _a.length; _i++) {
            var axis = _a[_i];
            if (pick(axis.min, -Infinity) > pick(axis.dataMin, -Infinity) ||
                pick(axis.max, Infinity) < pick(axis.dataMax, Infinity)) {
                allowBoostForce = false;
                break;
            }
        }
    }
    if (typeof boost.forceChartBoost !== 'undefined') {
        if (allowBoostForce) {
            return boost.forceChartBoost;
        }
        boost.forceChartBoost = void 0;
    }
    // If there are more than five series currently boosting,
    // we should boost the whole chart to avoid running out of webgl contexts.
    var canBoostCount = 0,
        needBoostCount = 0,
        seriesOptions;
    for (var _b = 0, allSeries_1 = allSeries; _b < allSeries_1.length; _b++) {
        var series = allSeries_1[_b];
        seriesOptions = series.options;
        // Don't count series with boostThreshold set to 0
        // See #8950
        // Also don't count if the series is hidden.
        // See #9046
        if (seriesOptions.boostThreshold === 0 ||
            series.visible === false) {
            continue;
        }
        // Don't count heatmap series as they are handled differently.
        // In the future we should make the heatmap/treemap path compatible
        // with forcing. See #9636.
        if (series.type === 'heatmap') {
            continue;
        }
        if (Boost_BoostableMap[series.type]) {
            ++canBoostCount;
        }
        if (patientMax(series.getColumn('x', true), seriesOptions.data, 
        /// series.xData,
        series.points) >= (seriesOptions.boostThreshold || Number.MAX_VALUE)) {
            ++needBoostCount;
        }
    }
    boost.forceChartBoost = allowBoostForce && ((
    // Even when the series that need a boost are less than or equal
    // to 5, force a chart boost when all series are to be boosted.
    // See #18815
    canBoostCount === allSeries.length &&
        needBoostCount === canBoostCount) ||
        needBoostCount > 5);
    return boost.forceChartBoost;
}
/**
 * Take care of the canvas blitting
 * @private
 */
function onChartCallback(chart) {
    /**
     * Convert chart-level canvas to image.
     * @private
     */
    function canvasToSVG() {
        if (chart.boost &&
            chart.boost.wgl &&
            isChartSeriesBoosting(chart)) {
            chart.boost.wgl.render(chart);
        }
    }
    /**
     * Clear chart-level canvas.
     * @private
     */
    function preRender() {
        var _a,
            _b;
        // Reset force state
        chart.boost = chart.boost || {};
        chart.boost.forceChartBoost = void 0;
        chart.boosted = false;
        // Clear the canvas
        if (!chart.axes.some(function (axis) { return axis.isPanning; })) {
            (_b = (_a = chart.boost).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
        if (chart.boost.canvas &&
            chart.boost.wgl &&
            isChartSeriesBoosting(chart)) {
            // Allocate
            chart.boost.wgl.allocateBuffer(chart);
        }
        // See #6518 + #6739
        if (chart.boost.markerGroup &&
            chart.xAxis &&
            chart.xAxis.length > 0 &&
            chart.yAxis &&
            chart.yAxis.length > 0) {
            chart.boost.markerGroup.translate(chart.xAxis[0].pos, chart.yAxis[0].pos);
        }
    }
    addEvent(chart, 'predraw', preRender);
    // Use the load event rather than redraw, otherwise user load events will
    // fire too early (#18755)
    addEvent(chart, 'load', canvasToSVG, { order: -1 });
    addEvent(chart, 'redraw', canvasToSVG);
    var prevX = -1;
    var prevY = -1;
    addEvent(chart.pointer, 'afterGetHoverData', function (e) {
        var _a;
        var series = (_a = e.hoverPoint) === null || _a === void 0 ? void 0 : _a.series;
        chart.boost = chart.boost || {};
        if (chart.boost.markerGroup && series) {
            var xAxis = chart.inverted ? series.yAxis : series.xAxis;
            var yAxis = chart.inverted ? series.xAxis : series.yAxis;
            if ((xAxis && xAxis.pos !== prevX) ||
                (yAxis && yAxis.pos !== prevY)) {
                // #21176: If the axis is changed, hide teh halo without
                // animation  to prevent flickering of halos sharing the
                // same marker group
                chart.series.forEach(function (s) {
                    var _a;
                    (_a = s.halo) === null || _a === void 0 ? void 0 : _a.hide();
                });
                // #10464: Keep the marker group position in sync with the
                // position of the hovered series axes since there is only
                // one shared marker group when boosting.
                chart.boost.markerGroup.translate(xAxis.pos, yAxis.pos);
                prevX = xAxis.pos;
                prevY = yAxis.pos;
            }
        }
    });
}
/**
 * Tolerant max() function.
 *
 * @private
 * @param {...Array<Array<unknown>>} args
 * Max arguments
 * @return {number}
 * Max value
 */
function patientMax() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var r = -Number.MAX_VALUE;
    args.forEach(function (t) {
        if (typeof t !== 'undefined' &&
            t !== null &&
            typeof t.length !== 'undefined') {
            if (t.length > 0) {
                r = t.length;
                return true;
            }
        }
    });
    return r;
}
/* *
 *
 *  Default Export
 *
 * */
var BoostChart = {
    compose: compose,
    getBoostClipRect: getBoostClipRect,
    isChartSeriesBoosting: isChartSeriesBoosting
};
/* harmony default export */ var Boost_BoostChart = (BoostChart);

// EXTERNAL MODULE: external {"amd":["highcharts/highcharts","Color"],"commonjs":["highcharts","Color"],"commonjs2":["highcharts","Color"],"root":["Highcharts","Color"]}
var highcharts_Color_commonjs_highcharts_Color_commonjs2_highcharts_Color_root_Highcharts_Color_ = __webpack_require__(620);
var highcharts_Color_commonjs_highcharts_Color_commonjs2_highcharts_Color_root_Highcharts_Color_default = /*#__PURE__*/__webpack_require__.n(highcharts_Color_commonjs_highcharts_Color_commonjs2_highcharts_Color_root_Highcharts_Color_);
;// ./code/es5/es-modules/Extensions/Boost/WGLDrawMode.js
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

/* *
 *
 *  Constants
 *
 * */
var WGLDrawMode = {
    'area': 'LINES',
    'arearange': 'LINES',
    'areaspline': 'LINES',
    'column': 'LINES',
    'columnrange': 'LINES',
    'bar': 'LINES',
    'line': 'LINE_STRIP',
    'scatter': 'POINTS',
    'heatmap': 'TRIANGLES',
    'treemap': 'TRIANGLES',
    'bubble': 'POINTS'
};
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Boost_WGLDrawMode = (WGLDrawMode);

;// ./code/es5/es-modules/Extensions/Boost/WGLShader.js
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


var clamp = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).clamp, error = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).error, WGLShader_pick = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pick;
/* *
 *
 *  Constants
 *
 * */
var fragmentShader = [
    /* eslint-disable max-len, @typescript-eslint/indent */
    'precision highp float;',
    'uniform vec4 fillColor;',
    'varying highp vec2 position;',
    'varying highp vec4 vColor;',
    'uniform sampler2D uSampler;',
    'uniform bool isCircle;',
    'uniform bool hasColor;',
    // 'vec4 toColor(float value, vec2 point) {',
    //     'return vec4(0.0, 0.0, 0.0, 0.0);',
    // '}',
    'void main(void) {',
    'vec4 col = fillColor;',
    'vec4 tcol = texture2D(uSampler, gl_PointCoord.st);',
    'if (hasColor) {',
    'col = vColor;',
    '}',
    'if (isCircle) {',
    'col *= tcol;',
    'if (tcol.r < 0.0) {',
    'discard;',
    '} else {',
    'gl_FragColor = col;',
    '}',
    '} else {',
    'gl_FragColor = col;',
    '}',
    '}'
    /* eslint-enable max-len, @typescript-eslint/indent */
].join('\n');
var vertexShader = [
    /* eslint-disable max-len, @typescript-eslint/indent */
    '#version 100',
    '#define LN10 2.302585092994046',
    'precision highp float;',
    'attribute vec4 aVertexPosition;',
    'attribute vec4 aColor;',
    'varying highp vec2 position;',
    'varying highp vec4 vColor;',
    'uniform mat4 uPMatrix;',
    'uniform float pSize;',
    'uniform float translatedThreshold;',
    'uniform bool hasThreshold;',
    'uniform bool skipTranslation;',
    'uniform float xAxisTrans;',
    'uniform float xAxisMin;',
    'uniform float xAxisMinPad;',
    'uniform float xAxisPointRange;',
    'uniform float xAxisLen;',
    'uniform bool  xAxisPostTranslate;',
    'uniform float xAxisOrdinalSlope;',
    'uniform float xAxisOrdinalOffset;',
    'uniform float xAxisPos;',
    'uniform bool  xAxisCVSCoord;',
    'uniform bool  xAxisIsLog;',
    'uniform bool  xAxisReversed;',
    'uniform float yAxisTrans;',
    'uniform float yAxisMin;',
    'uniform float yAxisMinPad;',
    'uniform float yAxisPointRange;',
    'uniform float yAxisLen;',
    'uniform bool  yAxisPostTranslate;',
    'uniform float yAxisOrdinalSlope;',
    'uniform float yAxisOrdinalOffset;',
    'uniform float yAxisPos;',
    'uniform bool  yAxisCVSCoord;',
    'uniform bool  yAxisIsLog;',
    'uniform bool  yAxisReversed;',
    'uniform bool  isBubble;',
    'uniform bool  bubbleSizeByArea;',
    'uniform float bubbleZMin;',
    'uniform float bubbleZMax;',
    'uniform float bubbleZThreshold;',
    'uniform float bubbleMinSize;',
    'uniform float bubbleMaxSize;',
    'uniform bool  bubbleSizeAbs;',
    'uniform bool  isInverted;',
    'float bubbleRadius(){',
    'float value = aVertexPosition.w;',
    'float zMax = bubbleZMax;',
    'float zMin = bubbleZMin;',
    'float radius = 0.0;',
    'float pos = 0.0;',
    'float zRange = zMax - zMin;',
    'if (bubbleSizeAbs){',
    'value = value - bubbleZThreshold;',
    'zMax = max(zMax - bubbleZThreshold, zMin - bubbleZThreshold);',
    'zMin = 0.0;',
    '}',
    'if (value < zMin){',
    'radius = bubbleZMin / 2.0 - 1.0;',
    '} else {',
    'pos = zRange > 0.0 ? (value - zMin) / zRange : 0.5;',
    'if (bubbleSizeByArea && pos > 0.0){',
    'pos = sqrt(pos);',
    '}',
    'radius = ceil(bubbleMinSize + pos * (bubbleMaxSize - bubbleMinSize)) / 2.0;',
    '}',
    'return radius * 2.0;',
    '}',
    'float translate(float val,',
    'float pointPlacement,',
    'float localA,',
    'float localMin,',
    'float minPixelPadding,',
    'float pointRange,',
    'float len,',
    'bool  cvsCoord,',
    'bool  isLog,',
    'bool  reversed',
    '){',
    'float sign = 1.0;',
    'float cvsOffset = 0.0;',
    'if (cvsCoord) {',
    'sign *= -1.0;',
    'cvsOffset = len;',
    '}',
    'if (isLog) {',
    'val = log(val) / LN10;',
    '}',
    'if (reversed) {',
    'sign *= -1.0;',
    'cvsOffset -= sign * len;',
    '}',
    'return sign * (val - localMin) * localA + cvsOffset + ',
    '(sign * minPixelPadding);', // ' + localA * pointPlacement * pointRange;',
    '}',
    'float xToPixels(float value) {',
    'if (skipTranslation){',
    'return value;// + xAxisPos;',
    '}',
    'return translate(value, 0.0, xAxisTrans, xAxisMin, xAxisMinPad, xAxisPointRange, xAxisLen, xAxisCVSCoord, xAxisIsLog, xAxisReversed);// + xAxisPos;',
    '}',
    'float yToPixels(float value, float checkTreshold) {',
    'float v;',
    'if (skipTranslation){',
    'v = value;// + yAxisPos;',
    '} else {',
    'v = translate(value, 0.0, yAxisTrans, yAxisMin, yAxisMinPad, yAxisPointRange, yAxisLen, yAxisCVSCoord, yAxisIsLog, yAxisReversed);// + yAxisPos;',
    'if (v > yAxisLen) {',
    'v = yAxisLen;',
    '}',
    '}',
    'if (checkTreshold > 0.0 && hasThreshold) {',
    'v = min(v, translatedThreshold);',
    '}',
    'return v;',
    '}',
    'void main(void) {',
    'if (isBubble){',
    'gl_PointSize = bubbleRadius();',
    '} else {',
    'gl_PointSize = pSize;',
    '}',
    // 'gl_PointSize = 10.0;',
    'vColor = aColor;',
    'if (skipTranslation && isInverted) {',
    // If we get translated values from JS, just swap them (x, y)
    'gl_Position = uPMatrix * vec4(aVertexPosition.y + yAxisPos, aVertexPosition.x + xAxisPos, 0.0, 1.0);',
    '} else if (isInverted) {',
    // But when calculating pixel positions directly,
    // swap axes and values (x, y)
    'gl_Position = uPMatrix * vec4(yToPixels(aVertexPosition.y, aVertexPosition.z) + yAxisPos, xToPixels(aVertexPosition.x) + xAxisPos, 0.0, 1.0);',
    '} else {',
    'gl_Position = uPMatrix * vec4(xToPixels(aVertexPosition.x) + xAxisPos, yToPixels(aVertexPosition.y, aVertexPosition.z) + yAxisPos, 0.0, 1.0);',
    '}',
    // 'gl_Position = uPMatrix * vec4(aVertexPosition.x, aVertexPosition.y, 0.0, 1.0);',
    '}'
    /* eslint-enable max-len, @typescript-eslint/indent */
].join('\n');
/* *
 *
 *  Class
 *
 * */
/* eslint-disable valid-jsdoc */
/**
 * A static shader mimicing axis translation functions found in Core/Axis
 *
 * @private
 *
 * @param {WebGLContext} gl
 * the context in which the shader is active
 */
var WGLShader = /** @class */ (function () {
    /* *
     *
     *  Constructor
     *
     * */
    function WGLShader(gl) {
        // Error stack
        this.errors = [];
        this.uLocations = {};
        this.gl = gl;
        if (gl && !this.createShader()) {
            return void 0;
        }
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Bind the shader.
     * This makes the shader the active one until another one is bound,
     * or until 0 is bound.
     * @private
     */
    WGLShader.prototype.bind = function () {
        if (this.gl && this.shaderProgram) {
            this.gl.useProgram(this.shaderProgram);
        }
    };
    /**
     * Create the shader.
     * Loads the shader program statically defined above
     * @private
     */
    WGLShader.prototype.createShader = function () {
        var _this = this;
        var v = this.stringToProgram(vertexShader, 'vertex'), f = this.stringToProgram(fragmentShader, 'fragment'), uloc = function (n) { return (_this.gl.getUniformLocation(_this.shaderProgram, n)); };
        if (!v || !f) {
            this.shaderProgram = false;
            this.handleErrors();
            return false;
        }
        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, v);
        this.gl.attachShader(this.shaderProgram, f);
        this.gl.linkProgram(this.shaderProgram);
        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            this.errors.push(this.gl.getProgramInfoLog(this.shaderProgram));
            this.handleErrors();
            this.shaderProgram = false;
            return false;
        }
        this.gl.useProgram(this.shaderProgram);
        this.gl.bindAttribLocation(this.shaderProgram, 0, 'aVertexPosition');
        this.pUniform = uloc('uPMatrix');
        this.psUniform = uloc('pSize');
        this.fcUniform = uloc('fillColor');
        this.isBubbleUniform = uloc('isBubble');
        this.bubbleSizeAbsUniform = uloc('bubbleSizeAbs');
        this.bubbleSizeAreaUniform = uloc('bubbleSizeByArea');
        this.uSamplerUniform = uloc('uSampler');
        this.skipTranslationUniform = uloc('skipTranslation');
        this.isCircleUniform = uloc('isCircle');
        this.isInverted = uloc('isInverted');
        return true;
    };
    /**
     * Handle errors accumulated in errors stack
     * @private
     */
    WGLShader.prototype.handleErrors = function () {
        if (this.errors.length) {
            error('[highcharts boost] shader error - ' +
                this.errors.join('\n'));
        }
    };
    /**
     * String to shader program
     * @private
     * @param {string} str
     * Program source
     * @param {string} type
     * Program type: either `vertex` or `fragment`
     */
    WGLShader.prototype.stringToProgram = function (str, type) {
        var shader = this.gl.createShader(type === 'vertex' ? this.gl.VERTEX_SHADER : this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(shader, str);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            this.errors.push('when compiling ' +
                type +
                ' shader:\n' +
                this.gl.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };
    /**
     * Destroy the shader
     * @private
     */
    WGLShader.prototype.destroy = function () {
        if (this.gl && this.shaderProgram) {
            this.gl.deleteProgram(this.shaderProgram);
            this.shaderProgram = false;
        }
    };
    WGLShader.prototype.fillColorUniform = function () {
        return this.fcUniform;
    };
    /**
     * Get the shader program handle
     * @private
     * @return {WebGLProgram}
     * The handle for the program
     */
    WGLShader.prototype.getProgram = function () {
        return this.shaderProgram;
    };
    WGLShader.prototype.pointSizeUniform = function () {
        return this.psUniform;
    };
    WGLShader.prototype.perspectiveUniform = function () {
        return this.pUniform;
    };
    /**
     * Flush
     * @private
     */
    WGLShader.prototype.reset = function () {
        if (this.gl && this.shaderProgram) {
            this.gl.uniform1i(this.isBubbleUniform, 0);
            this.gl.uniform1i(this.isCircleUniform, 0);
        }
    };
    /**
     * Set bubble uniforms
     * @private
     * @param {Highcharts.Series} series
     * Series to use
     */
    WGLShader.prototype.setBubbleUniforms = function (series, zCalcMin, zCalcMax, pixelRatio) {
        if (pixelRatio === void 0) { pixelRatio = 1; }
        var seriesOptions = series.options;
        var zMin = Number.MAX_VALUE,
            zMax = -Number.MAX_VALUE;
        if (this.gl && this.shaderProgram && series.is('bubble')) {
            var pxSizes = series.getPxExtremes();
            zMin = WGLShader_pick(seriesOptions.zMin, clamp(zCalcMin, seriesOptions.displayNegative === false ?
                seriesOptions.zThreshold : -Number.MAX_VALUE, zMin));
            zMax = WGLShader_pick(seriesOptions.zMax, Math.max(zMax, zCalcMax));
            this.gl.uniform1i(this.isBubbleUniform, 1);
            this.gl.uniform1i(this.isCircleUniform, 1);
            this.gl.uniform1i(this.bubbleSizeAreaUniform, (series.options.sizeBy !== 'width'));
            this.gl.uniform1i(this.bubbleSizeAbsUniform, series.options
                .sizeByAbsoluteValue);
            this.setUniform('bubbleMinSize', pxSizes.minPxSize * pixelRatio);
            this.setUniform('bubbleMaxSize', pxSizes.maxPxSize * pixelRatio);
            this.setUniform('bubbleZMin', zMin);
            this.setUniform('bubbleZMax', zMax);
            this.setUniform('bubbleZThreshold', series.options.zThreshold);
        }
    };
    /**
     * Set the Color uniform.
     * @private
     * @param {Array<number>} color
     * Array with RGBA values.
     */
    WGLShader.prototype.setColor = function (color) {
        if (this.gl && this.shaderProgram) {
            this.gl.uniform4f(this.fcUniform, color[0] / 255.0, color[1] / 255.0, color[2] / 255.0, color[3]);
        }
    };
    /**
     * Enable/disable circle drawing
     * @private
     */
    WGLShader.prototype.setDrawAsCircle = function (flag) {
        if (this.gl && this.shaderProgram) {
            this.gl.uniform1i(this.isCircleUniform, flag ? 1 : 0);
        }
    };
    /**
     * Set if inversion state
     * @private
     * @param {number} flag
     * Inversion flag
     */
    WGLShader.prototype.setInverted = function (flag) {
        if (this.gl && this.shaderProgram) {
            this.gl.uniform1i(this.isInverted, flag);
        }
    };
    /**
     * Set the perspective matrix
     * @private
     * @param {Float32List} m
     * Matrix 4 x 4
     */
    WGLShader.prototype.setPMatrix = function (m) {
        if (this.gl && this.shaderProgram) {
            this.gl.uniformMatrix4fv(this.pUniform, false, m);
        }
    };
    /**
     * Set the point size.
     * @private
     * @param {number} p
     * Point size
     */
    WGLShader.prototype.setPointSize = function (p) {
        if (this.gl && this.shaderProgram) {
            this.gl.uniform1f(this.psUniform, p);
        }
    };
    /**
     * Set skip translation
     * @private
     */
    WGLShader.prototype.setSkipTranslation = function (flag) {
        if (this.gl && this.shaderProgram) {
            this.gl.uniform1i(this.skipTranslationUniform, flag === true ? 1 : 0);
        }
    };
    /**
     * Set the active texture
     * @private
     * @param {number} texture
     * Texture to activate
     */
    WGLShader.prototype.setTexture = function (texture) {
        if (this.gl && this.shaderProgram) {
            this.gl.uniform1i(this.uSamplerUniform, texture);
        }
    };
    /**
     * Set a uniform value.
     * This uses a hash map to cache uniform locations.
     * @private
     * @param {string} name
     * Name of the uniform to set.
     * @param {number} val
     * Value to set
     */
    WGLShader.prototype.setUniform = function (name, val) {
        if (this.gl && this.shaderProgram) {
            var u = this.uLocations[name] = (this.uLocations[name] ||
                    this.gl.getUniformLocation(this.shaderProgram,
                name));
            this.gl.uniform1f(u, val);
        }
    };
    return WGLShader;
}());
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Boost_WGLShader = (WGLShader);

;// ./code/es5/es-modules/Extensions/Boost/WGLVertexBuffer.js
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

/* *
 *
 *  Class
 *
 * */
/**
 * Vertex Buffer abstraction.
 * A vertex buffer is a set of vertices which are passed to the GPU
 * in a single call.
 *
 * @private
 * @class
 * @name WGLVertexBuffer
 *
 * @param {WebGLContext} gl
 * Context in which to create the buffer.
 * @param {WGLShader} shader
 * Shader to use.
 */
var WGLVertexBuffer = /** @class */ (function () {
    /* *
     *
     *  Constructor
     *
     * */
    function WGLVertexBuffer(gl, shader, dataComponents
    /* , type */
    ) {
        /* *
         *
         *  Properties
         *
         * */
        this.buffer = false;
        this.iterator = 0;
        this.preAllocated = false;
        this.vertAttribute = false;
        this.components = dataComponents || 2;
        this.dataComponents = dataComponents;
        this.gl = gl;
        this.shader = shader;
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Note about pre-allocated buffers:
     *     - This is slower for charts with many series
     * @private
     */
    WGLVertexBuffer.prototype.allocate = function (size) {
        this.iterator = -1;
        this.preAllocated = new Float32Array(size * 4);
    };
    /**
     * Bind the buffer
     * @private
     */
    WGLVertexBuffer.prototype.bind = function () {
        if (!this.buffer) {
            return false;
        }
        /// gl.bindAttribLocation(shader.program(), 0, 'aVertexPosition');
        // gl.enableVertexAttribArray(vertAttribute);
        // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(this.vertAttribute, this.components, this.gl.FLOAT, false, 0, 0);
        /// gl.enableVertexAttribArray(vertAttribute);
    };
    /**
     * Build the buffer
     * @private
     * @param {Array<number>} dataIn
     * Zero padded array of indices
     * @param {string} attrib
     * Name of the Attribute to bind the buffer to
     * @param {number} dataComponents
     * Number of components per. indice
     */
    WGLVertexBuffer.prototype.build = function (dataIn, attrib, dataComponents) {
        var farray;
        this.data = dataIn || [];
        if ((!this.data || this.data.length === 0) && !this.preAllocated) {
            /// console.error('trying to render empty vbuffer');
            this.destroy();
            return false;
        }
        this.components = dataComponents || this.components;
        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
        }
        if (!this.preAllocated) {
            farray = new Float32Array(this.data);
        }
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.preAllocated || farray, this.gl.STATIC_DRAW);
        /// gl.bindAttribLocation(shader.program(), 0, 'aVertexPosition');
        this.vertAttribute = this.gl
            .getAttribLocation(this.shader.getProgram(), attrib);
        this.gl.enableVertexAttribArray(this.vertAttribute);
        // Trigger cleanup
        farray = false;
        return true;
    };
    /**
     * @private
     */
    WGLVertexBuffer.prototype.destroy = function () {
        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
            this.buffer = false;
            this.vertAttribute = false;
        }
        this.iterator = 0;
        this.components = this.dataComponents || 2;
        this.data = [];
    };
    /**
     * Adds data to the pre-allocated buffer.
     * @private
     * @param {number} x
     * X data
     * @param {number} y
     * Y data
     * @param {number} a
     * A data
     * @param {number} b
     * B data
     */
    WGLVertexBuffer.prototype.push = function (x, y, a, b) {
        if (this.preAllocated) { // && iterator <= preAllocated.length - 4) {
            this.preAllocated[++this.iterator] = x;
            this.preAllocated[++this.iterator] = y;
            this.preAllocated[++this.iterator] = a;
            this.preAllocated[++this.iterator] = b;
        }
    };
    /**
     * Render the buffer
     *
     * @private
     * @param {number} from
     * Start indice.
     * @param {number} to
     * End indice.
     * @param {WGLDrawModeValue} drawMode
     * Draw mode.
     */
    WGLVertexBuffer.prototype.render = function (from, to, drawMode) {
        var length = this.preAllocated ?
                this.preAllocated.length : this.data.length;
        if (!this.buffer) {
            return false;
        }
        if (!length) {
            return false;
        }
        if (!from || from > length || from < 0) {
            from = 0;
        }
        if (!to || to > length) {
            to = length;
        }
        if (from >= to) {
            return false;
        }
        drawMode = drawMode || 'POINTS';
        this.gl.drawArrays(this.gl[drawMode], from / this.components, (to - from) / this.components);
        return true;
    };
    return WGLVertexBuffer;
}());
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Boost_WGLVertexBuffer = (WGLVertexBuffer);

;// ./code/es5/es-modules/Extensions/Boost/WGLRenderer.js
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


var color = (highcharts_Color_commonjs_highcharts_Color_commonjs2_highcharts_Color_root_Highcharts_Color_default()).parse;

var doc = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).doc, win = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).win;

var isNumber = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).isNumber, isObject = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).isObject, merge = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).merge, objectEach = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).objectEach, WGLRenderer_pick = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pick;



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
        var near = 0,
            far = 1;
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
        var isStacked,
            xData,
            s;
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
        var _a,
            _b;
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
        var plotWidth = series.chart.plotWidth,
            lastX = false,
            lastY = false,
            minVal,
            scolor, 
            //
            skipped = 0,
            hadPoints = false, 
            // The following are used in the builder while loop
            x,
            y,
            d,
            z,
            i = -1,
            px = false,
            nx = false,
            low,
            nextInside = false,
            prevInside = false,
            pcolor = false,
            isXInside = false,
            isYInside = true,
            firstPoint = true,
            zoneColors,
            zoneDefColor = false,
            gapSize = false,
            vlen = 0;
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
        var vertice = function (x,
            y,
            checkTreshold,
            pointSize,
            color) {
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
        var pushRect = function (x,
            y,
            w,
            h,
            color) {
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
                var swidth,
                    pointAttr;
                if (typeof plotY !== 'undefined' &&
                    !isNaN(plotY) &&
                    point.y !== null &&
                    point.shapeArgs) {
                    var _a = point.shapeArgs,
                        _b = _a.x,
                        x_1 = _b === void 0 ? 0 : _b,
                        _c = _a.y,
                        y_1 = _c === void 0 ? 0 : _c,
                        _d = _a.width,
                        width = _d === void 0 ? 0 : _d,
                        _e = _a.height,
                        height = _e === void 0 ? 0 : _e;
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
        var pushSupplementPoint = function (point,
            atStart) {
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
        var markerData = this.markerData,
            series = this.series,
            settings = this.settings;
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
                drawMode: Boost_WGLDrawMode[s.type] || 'LINE_STRIP'
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
        var gl = this.gl,
            settings = this.settings,
            shader = this.shader,
            vbuffer = this.vbuffer;
        var pixelRatio = this.getPixelRatio();
        if (chart) {
            this.width = chart.chartWidth * pixelRatio;
            this.height = chart.chartHeight * pixelRatio;
        }
        else {
            return false;
        }
        var height = this.height,
            width = this.width;
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
        if (settings.lineWidth > 1 && !(highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).isMS) {
            gl.lineWidth(settings.lineWidth);
        }
        if (vbuffer) {
            vbuffer.build(this.data, 'aVertexPosition', 4);
            vbuffer.bind();
        }
        shader.setInverted(chart.inverted);
        // Render the series
        this.series.forEach(function (s, si) {
            var _a,
                _b,
                _c;
            var options = s.series.options,
                shapeOptions = options.marker,
                lineWidth = (typeof options.lineWidth !== 'undefined' ?
                    options.lineWidth :
                    1),
                threshold = options.threshold,
                hasThreshold = isNumber(threshold),
                yBottom = s.series.yAxis.getThreshold(threshold),
                translatedThreshold = yBottom,
                showMarkers = WGLRenderer_pick(options.marker ? options.marker.enabled : null,
                s.series.xAxis.isRadial ? true : null,
                s.series.closestPointRangePx >
                    2 * ((options.marker ?
                        options.marker.radius :
                        10) || 10)),
                shapeTexture = _this.textureHandles[(shapeOptions && shapeOptions.symbol) ||
                    s.series.symbol] || _this.textureHandles.circle;
            var sindex,
                cbuffer,
                fillColor,
                scolor = [];
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
                fillColor = new (highcharts_Color_commonjs_highcharts_Color_commonjs2_highcharts_Color_root_Highcharts_Color_default())(fillColor).setOpacity(WGLRenderer_pick(options.fillOpacity, 1.0)).get();
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
                cbuffer = new Boost_WGLVertexBuffer(gl, shader);
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
                shader.setPointSize(WGLRenderer_pick(options.marker && options.marker.radius, 0.5) * 2 * pixelRatio);
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
                shader.setPointSize(WGLRenderer_pick(options.marker && options.marker.radius, 5) * 2 * pixelRatio);
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
        var shader = this.shader = new Boost_WGLShader(gl);
        if (!shader) {
            // We need to abort, there's no shader context
            return false;
        }
        this.vbuffer = new Boost_WGLVertexBuffer(gl, shader);
        var createTexture = function (name,
            fn) {
                var props = {
                    isReady: false,
                    texture: doc.createElement('canvas'),
                    handle: gl.createTexture()
                },
            ctx = props.texture.getContext('2d');
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
        var gl = this.gl,
            shader = this.shader,
            vbuffer = this.vbuffer;
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
/* harmony default export */ var Boost_WGLRenderer = (WGLRenderer);

;// ./code/es5/es-modules/Data/ColumnUtils.js
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
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
    function splice(column, start, deleteCount, removedAsSubarray, items) {
        if (items === void 0) { items = []; }
        if (Array.isArray(column)) {
            if (!Array.isArray(items)) {
                items = Array.from(items);
            }
            return {
                removed: column.splice.apply(column, __spreadArray([start, deleteCount], items, false)),
                array: column
            };
        }
        var Constructor = Object.getPrototypeOf(column)
                .constructor;
        var removed = column[removedAsSubarray ? 'subarray' : 'slice'](start,
            start + deleteCount);
        var newLength = column.length - deleteCount + items.length;
        var result = new Constructor(newLength);
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
/* harmony default export */ var Data_ColumnUtils = (ColumnUtils);

;// ./code/es5/es-modules/Data/DataTableCore.js
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


var setLength = Data_ColumnUtils.setLength, splice = Data_ColumnUtils.splice;

var fireEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).fireEvent, DataTableCore_objectEach = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).objectEach, uniqueKey = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).uniqueKey;
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
var DataTableCore = /** @class */ (function () {
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
    function DataTableCore(options) {
        if (options === void 0) { options = {}; }
        var _this = this;
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
        var rowCount = 0;
        DataTableCore_objectEach(options.columns || {}, function (column, columnName) {
            _this.columns[columnName] = column.slice();
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
    DataTableCore.prototype.applyRowCount = function (rowCount) {
        var _this = this;
        this.rowCount = rowCount;
        DataTableCore_objectEach(this.columns, function (column, columnName) {
            if (column.length !== rowCount) {
                _this.columns[columnName] = setLength(column, rowCount);
            }
        });
    };
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
    DataTableCore.prototype.deleteRows = function (rowIndex, rowCount) {
        var _this = this;
        if (rowCount === void 0) { rowCount = 1; }
        if (rowCount > 0 && rowIndex < this.rowCount) {
            var length_1 = 0;
            DataTableCore_objectEach(this.columns, function (column, columnName) {
                _this.columns[columnName] =
                    splice(column, rowIndex, rowCount).array;
                length_1 = column.length;
            });
            this.rowCount = length_1;
        }
        fireEvent(this, 'afterDeleteRows', { rowIndex: rowIndex, rowCount: rowCount });
        this.versionTag = uniqueKey();
    };
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
    DataTableCore.prototype.getColumn = function (columnName, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asReference) {
        return this.columns[columnName];
    };
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
    DataTableCore.prototype.getColumns = function (columnNames, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asReference) {
        var _this = this;
        return (columnNames || Object.keys(this.columns)).reduce(function (columns, columnName) {
            columns[columnName] = _this.columns[columnName];
            return columns;
        }, {});
    };
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
    DataTableCore.prototype.getRow = function (rowIndex, columnNames) {
        var _this = this;
        return (columnNames || Object.keys(this.columns)).map(function (key) { var _a; return (_a = _this.columns[key]) === null || _a === void 0 ? void 0 : _a[rowIndex]; });
    };
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
    DataTableCore.prototype.setColumn = function (columnName, column, rowIndex, eventDetail) {
        var _a;
        if (column === void 0) { column = []; }
        if (rowIndex === void 0) { rowIndex = 0; }
        this.setColumns((_a = {}, _a[columnName] = column, _a), rowIndex, eventDetail);
    };
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
    DataTableCore.prototype.setColumns = function (columns, rowIndex, eventDetail) {
        var _this = this;
        var rowCount = this.rowCount;
        DataTableCore_objectEach(columns, function (column, columnName) {
            _this.columns[columnName] = column.slice();
            rowCount = column.length;
        });
        this.applyRowCount(rowCount);
        if (!(eventDetail === null || eventDetail === void 0 ? void 0 : eventDetail.silent)) {
            fireEvent(this, 'afterSetColumns');
            this.versionTag = uniqueKey();
        }
    };
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
    DataTableCore.prototype.setRow = function (row, rowIndex, insert, eventDetail) {
        if (rowIndex === void 0) { rowIndex = this.rowCount; }
        var columns = this.columns,
            indexRowCount = insert ? this.rowCount + 1 : rowIndex + 1;
        DataTableCore_objectEach(row, function (cellValue, columnName) {
            var column = columns[columnName] ||
                    (eventDetail === null || eventDetail === void 0 ? void 0 : eventDetail.addColumns) !== false && new Array(indexRowCount);
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
        if (!(eventDetail === null || eventDetail === void 0 ? void 0 : eventDetail.silent)) {
            fireEvent(this, 'afterSetRows');
            this.versionTag = uniqueKey();
        }
    };
    return DataTableCore;
}());
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Data_DataTableCore = (DataTableCore);
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

;// ./code/es5/es-modules/Extensions/Boost/BoostSeries.js
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




var BoostSeries_getBoostClipRect = Boost_BoostChart.getBoostClipRect, BoostSeries_isChartSeriesBoosting = Boost_BoostChart.isChartSeriesBoosting;

var getOptions = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).getOptions;

var BoostSeries_composed = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).composed, BoostSeries_doc = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).doc, noop = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).noop, BoostSeries_win = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).win;

var BoostSeries_addEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).addEvent, destroyObjectProperties = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).destroyObjectProperties, BoostSeries_error = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).error, extend = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).extend, BoostSeries_fireEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).fireEvent, isArray = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).isArray, BoostSeries_isNumber = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).isNumber, BoostSeries_pick = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pick, BoostSeries_pushUnique = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pushUnique, wrap = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).wrap, defined = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).defined;


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
        !BoostSeries_isChartSeriesBoosting(series.chart)) {
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
    return BoostSeries_pick((chart &&
        chart.options &&
        chart.options.boost &&
        chart.options.boost.enabled), true);
}
/**
 * @private
 */
function BoostSeries_compose(SeriesClass, seriesTypes, PointClass, wglMode) {
    if (BoostSeries_pushUnique(BoostSeries_composed, 'Boost.Series')) {
        var plotOptions_1 = getOptions().plotOptions,
            seriesProto_1 = SeriesClass.prototype;
        BoostSeries_addEvent(SeriesClass, 'destroy', onSeriesDestroy);
        BoostSeries_addEvent(SeriesClass, 'hide', onSeriesHide);
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
            var _a,
                _b;
            if (type === 'click' && this.series.boosted) {
                var point = e.point;
                if ((point.dist || point.distX) >= ((_b = (_a = point.series.options.marker) === null || _a === void 0 ? void 0 : _a.radius) !== null && _b !== void 0 ? _b : 10)) {
                    return;
                }
            }
            return proceed.apply(this, [].slice.call(arguments, 1));
        });
        // Set default options
        Boost_Boostables.forEach(function (type) {
            var typePlotOptions = plotOptions_1[type];
            if (typePlotOptions) {
                typePlotOptions.boostThreshold = 5000;
                typePlotOptions.boostData = [];
                seriesTypes[type].prototype.fillOpacity = true;
            }
        });
        if (wglMode) {
            var AreaSeries = seriesTypes.area,
                AreaSplineSeries = seriesTypes.areaspline,
                BubbleSeries = seriesTypes.bubble,
                ColumnSeries = seriesTypes.column,
                HeatmapSeries = seriesTypes.heatmap,
                ScatterSeries = seriesTypes.scatter,
                TreemapSeries = seriesTypes.treemap;
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
    var _a,
        _b,
        _c;
    var ChartClass = chart.constructor,
        targetGroup = chart.seriesGroup || series.group,
        alpha = 1;
    var width = chart.chartWidth,
        height = chart.chartHeight,
        target = chart,
        foSupported = typeof SVGForeignObjectElement !== 'undefined',
        hasClickHandler = false;
    if (BoostSeries_isChartSeriesBoosting(chart)) {
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
        mainCanvas = BoostSeries_doc.createElement('canvas');
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
                BoostSeries_doc.createElement('canvas');
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
            var _a,
                _b;
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
        var box = BoostSeries_getBoostClipRect(chart,
            target), 
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
        boost.wgl = new Boost_WGLRenderer(function (wgl) {
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
            BoostSeries_error('[highcharts boost] - unable to init WebGL renderer');
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
        var point = void 0,
            i = void 0;
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
            else if (BoostSeries_win.requestAnimationFrame) {
                // If available, do requestAnimationFrame - shaves off a few ms
                BoostSeries_win.requestAnimationFrame(function () {
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
    var boost = series.boost,
        chart = series.chart,
        chartBoost = chart.boost;
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
    var options = series.options,
        dataLength = series.dataTable.modified.rowCount,
        xAxis = series.xAxis && series.xAxis.options,
        yAxis = series.yAxis && series.yAxis.options,
        colorAxis = series.colorAxis && series.colorAxis.options;
    return dataLength > (options.boostThreshold || Number.MAX_VALUE) &&
        // Defined yAxis extremes
        BoostSeries_isNumber(yAxis.min) &&
        BoostSeries_isNumber(yAxis.max) &&
        // Defined (and required) xAxis extremes
        (!checkX ||
            (BoostSeries_isNumber(xAxis.min) && BoostSeries_isNumber(xAxis.max))) &&
        // Defined (e.g. heatmap) colorAxis extremes
        (!colorAxis ||
            (BoostSeries_isNumber(colorAxis.min) && BoostSeries_isNumber(colorAxis.max)));
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
    return (BoostSeries_isChartSeriesBoosting(series.chart) ||
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
    var series = this,
        chart = series.chart;
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
        !BoostSeries_isChartSeriesBoosting(series.chart)) {
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
    var seriesOptions = series.options,
        xAxis = series.xAxis,
        PointClass = series.pointClass;
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
    point.category = BoostSeries_pick(xAxis.categories ?
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
    var _a,
        _b,
        _c,
        _d,
        _e,
        _f,
        _g,
        _h;
    var series = this,
        options = series.options,
        xAxis = series.xAxis,
        yAxis = series.yAxis;
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
    var processedData = [],
        processedXData = [],
        processedYData = [],
        xRangeNeeded = !(BoostSeries_isNumber(xExtremes.max) || BoostSeries_isNumber(xExtremes.min)),
        yRangeNeeded = !(BoostSeries_isNumber(yExtremes.max) || BoostSeries_isNumber(yExtremes.min));
    var cropped = false,
        x,
        xDataMax = xData[0],
        xDataMin = xData[0],
        y,
        yDataMax = yData === null || yData === void 0 ? void 0 : yData[0],
        yDataMin = yData === null || yData === void 0 ? void 0 : yData[0];
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
        series.dataTable.modified = new Data_DataTableCore();
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
    var _a,
        _b,
        _c;
    var options = this.options || {}, chart = this.chart, chartBoost = chart.boost, seriesBoost = this.boost, xAxis = this.xAxis, yAxis = this.yAxis, xData = options.xData || this.getColumn('x', true), yData = options.yData || this.getColumn('y', true), lowData = this.getColumn('low', true), highData = this.getColumn('high', true), rawData = this.processedData || options.data, xExtremes = xAxis.getExtremes(), 
        // Taking into account the offset of the min point #19497
        xMin = xExtremes.min - (xAxis.minPointOffset || 0), xMax = xExtremes.max + (xAxis.minPointOffset || 0), yExtremes = yAxis.getExtremes(), yMin = yExtremes.min - (yAxis.minPointOffset || 0), yMax = yExtremes.max + (yAxis.minPointOffset || 0), pointTaken = {}, sampling = !!this.sampling, enableMouseTracking = options.enableMouseTracking, threshold = options.threshold, isRange = this.pointArrayMap &&
            this.pointArrayMap.join(',') === 'low,high', isStacked = !!options.stacking, cropStart = this.cropStart || 0, requireSorting = this.requireSorting, useRaw = !xData, compareX = options.findNearestPointBy === 'x', xDataFull = ((this.getColumn('x').length ?
            this.getColumn('x') :
            void 0) ||
            this.options.xData ||
            this.getColumn('x', true)), lineWidth = BoostSeries_pick(options.lineWidth, 1), nullYSubstitute = options.nullInteraction && yMin, tooltip = chart.tooltip;
    var renderer = false,
        lastClientX,
        yBottom = yAxis.getThreshold(threshold),
        minVal,
        maxVal,
        minI,
        maxI;
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
    if (!BoostSeries_isChartSeriesBoosting(chart)) {
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
    var points = this.points = [],
        addKDPoint = function (clientX,
        plotY,
        i,
        percentage) {
            var x = xDataFull ? xDataFull[cropStart + i] : false,
        pushPoint = function (plotX) {
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
    BoostSeries_fireEvent(this, 'renderCanvas');
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
        var _a,
            _b;
        var chartDestroyed = typeof chart.index === 'undefined';
        var x,
            y,
            clientX,
            plotY,
            percentage,
            low = false,
            isYInside = true;
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
    var boostOptions = renderer.settings,
        doneProcessing = function () {
            BoostSeries_fireEvent(_this, 'renderedCanvas');
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
    var renderer = createAndAttachRenderer(this.chart,
        this);
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
            !Boost_BoostableMap[this.type] ||
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
    var _a,
        _b,
        _c;
    var dataToMeasure = this.options.data;
    if (boostEnabled(this.chart) && Boost_BoostableMap[this.type]) {
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
                if (!BoostSeries_isNumber(firstPoint) &&
                    !isArray(firstPoint) &&
                    !series.is('treemap')) {
                    BoostSeries_error(12, false, series.chart);
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
    var result = proceed.apply(this,
        [].slice.call(arguments, 1));
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
    compose: BoostSeries_compose,
    destroyGraphics: destroyGraphics,
    eachAsync: eachAsync,
    getPoint: getPoint
};
/* harmony default export */ var Boost_BoostSeries = (BoostSeries);

;// ./code/es5/es-modules/Extensions/Boost/NamedColors.js
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

/* *
 *
 *  Constants
 *
 * */
// Register color names since GL can't render those directly.
// TODO: When supporting modern syntax, make this a named export
var defaultHTMLColorMap = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dodgerblue: '#1e90ff',
    feldspar: '#d19275',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    grey: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgrey: '#d3d3d3',
    lightgreen: '#90ee90',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslateblue: '#8470ff',
    lightslategray: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370d8',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#d87093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    violetred: '#d02090',
    wheat: '#f5deb3',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32'
};
/* *
 *
 *  Default Export
 *
 * */
var namedColors = {
    defaultHTMLColorMap: defaultHTMLColorMap
};
/* harmony default export */ var NamedColors = (namedColors);

;// ./code/es5/es-modules/Extensions/Boost/Boost.js
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

var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Boost_spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};



var Boost_doc = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).doc, Boost_win = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).win;


var Boost_addEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).addEvent, Boost_error = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).error;
/* *
 *
 *  Constants
 *
 * */
var Boost_contexts = [
    'webgl',
    'experimental-webgl',
    'moz-webgl',
    'webkit-3d'
];
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function Boost_compose(ChartClass, AxisClass, SeriesClass, seriesTypes, PointClass, ColorClass) {
    var wglMode = hasWebGLSupport();
    if (!wglMode) {
        if (typeof (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).initCanvasBoost !== 'undefined') {
            // Fallback to canvas boost
            highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default().initCanvasBoost();
        }
        else {
            Boost_error(26);
        }
    }
    if (ColorClass && !ColorClass.names.lightgoldenrodyellow) {
        ColorClass.names = __assign(__assign({}, ColorClass.names), NamedColors.defaultHTMLColorMap);
    }
    // WebGL support is alright, and we're good to go.
    Boost_BoostChart.compose(ChartClass, wglMode);
    Boost_BoostSeries.compose(SeriesClass, seriesTypes, PointClass, wglMode);
    // Handle zooming by touch/pinch or mouse wheel. Assume that boosted charts
    // are too slow for a live preview while dragging. Instead, just scale the
    // div while `isPanning`.
    Boost_addEvent(AxisClass, 'setExtremes', function (e) {
        var _a;
        var _b,
            _c;
        // Render targets can be either chart-wide or series-specific
        var renderTargets = Boost_spreadArray([this.chart],
            this.series,
            true).map(function (item) { return item.renderTarget; })
                .filter(Boolean);
        for (var _i = 0, renderTargets_1 = renderTargets; _i < renderTargets_1.length; _i++) {
            var renderTarget = renderTargets_1[_i];
            var _d = this, horiz = _d.horiz, pos = _d.pos, scaleKey = horiz ? 'scaleX' : 'scaleY', translateKey = horiz ? 'translateX' : 'translateY', lastScale = (_b = renderTarget === null || renderTarget === void 0 ? void 0 : renderTarget[scaleKey]) !== null && _b !== void 0 ? _b : 1;
            var scale = 1,
                translate = 0,
                opacity = 1,
                filter = 'none';
            if (this.isPanning) {
                scale = ((_c = e.scale) !== null && _c !== void 0 ? _c : 1) * lastScale;
                translate = ((renderTarget === null || renderTarget === void 0 ? void 0 : renderTarget[translateKey]) || 0) -
                    scale * (e.move || 0) +
                    lastScale * pos -
                    scale * pos;
                opacity = 0.7;
                filter = 'blur(3px)';
            }
            renderTarget === null || renderTarget === void 0 ? void 0 : renderTarget.attr((_a = {},
                _a[scaleKey] = scale,
                _a[translateKey] = translate,
                _a)).css({
                transition: '250ms filter, 250ms opacity',
                filter: filter,
                opacity: opacity
            });
        }
    });
}
/**
 * Returns true if the current browser supports WebGL.
 *
 * @requires modules/boost
 *
 * @function Highcharts.hasWebGLSupport
 *
 * @return {boolean}
 * `true` if the browser supports WebGL.
 */
function hasWebGLSupport() {
    var canvas,
        gl = false;
    if (typeof Boost_win.WebGLRenderingContext !== 'undefined') {
        canvas = Boost_doc.createElement('canvas');
        for (var i = 0; i < Boost_contexts.length; ++i) {
            try {
                gl = canvas.getContext(Boost_contexts[i]);
                if (typeof gl !== 'undefined' && gl !== null) {
                    return true;
                }
            }
            catch (e) {
                // Silent error
            }
        }
    }
    return false;
}
/* *
 *
 *  Default Export
 *
 * */
var Boost = {
    compose: Boost_compose,
    hasWebGLSupport: hasWebGLSupport
};
/* harmony default export */ var Boost_Boost = (Boost);
/* *
 *
 *  API Options
 *
 * */
/**
 * Options for the Boost module. The Boost module allows certain series types
 * to be rendered by WebGL instead of the default SVG. This allows hundreds of
 * thousands of data points to be rendered in milliseconds. In addition to the
 * WebGL rendering it saves time by skipping processing and inspection of the
 * data wherever possible. This introduces some limitations to what features are
 * available in boost mode. See [the docs](
 * https://www.highcharts.com/docs/advanced-chart-features/boost-module) for
 * details.
 *
 * In addition to the global `boost` option, each series has a
 * [boostThreshold](#plotOptions.series.boostThreshold) that defines when the
 * boost should kick in.
 *
 * Requires the `modules/boost.js` module.
 *
 * @sample {highstock} highcharts/boost/line-series-heavy-stock
 *         Stock chart
 * @sample {highstock} highcharts/boost/line-series-heavy-dynamic
 *         Dynamic stock chart
 * @sample highcharts/boost/line
 *         Line chart
 * @sample highcharts/boost/line-series-heavy
 *         Line chart with hundreds of series
 * @sample highcharts/boost/scatter
 *         Scatter chart
 * @sample highcharts/boost/area
 *         Area chart
 * @sample highcharts/boost/arearange
 *         Area range chart
 * @sample highcharts/boost/column
 *         Column chart
 * @sample highcharts/boost/columnrange
 *         Column range chart
 * @sample highcharts/boost/bubble
 *         Bubble chart
 * @sample highcharts/boost/heatmap
 *         Heat map
 * @sample highcharts/boost/treemap
 *         Tree map
 *
 * @product   highcharts highstock
 * @requires  modules/boost
 * @apioption boost
 */
/**
 * The chart will be boosted, if one of the series crosses its threshold and all
 * the series in the chart can be boosted.
 *
 * @type      {boolean}
 * @default   true
 * @apioption boost.allowForce
 */
/**
 * Enable or disable boost on a chart.
 *
 * @type      {boolean}
 * @default   true
 * @apioption boost.enabled
 */
/**
 * Debugging options for boost.
 * Useful for benchmarking, and general timing.
 *
 * @apioption boost.debug
 */
/**
 * Time the series rendering.
 *
 * This outputs the time spent on actual rendering in the console when
 * set to true.
 *
 * @type      {boolean}
 * @default   false
 * @apioption boost.debug.timeRendering
 */
/**
 * Time the series processing.
 *
 * This outputs the time spent on transforming the series data to
 * vertex buffers when set to true.
 *
 * @type      {boolean}
 * @default   false
 * @apioption boost.debug.timeSeriesProcessing
 */
/**
 * Time the WebGL setup.
 *
 * This outputs the time spent on setting up the WebGL context,
 * creating shaders, and textures.
 *
 * @type      {boolean}
 * @default   false
 * @apioption boost.debug.timeSetup
 */
/**
 * Time the building of the k-d tree.
 *
 * This outputs the time spent building the k-d tree used for
 * markers etc.
 *
 * Note that the k-d tree is built async, and runs post-rendering.
 * Following, it does not affect the performance of the rendering itself.
 *
 * @type      {boolean}
 * @default   false
 * @apioption boost.debug.timeKDTree
 */
/**
 * Show the number of points skipped through culling.
 *
 * When set to true, the number of points skipped in series processing
 * is outputted. Points are skipped if they are closer than 1 pixel from
 * each other.
 *
 * @type      {boolean}
 * @default   false
 * @apioption boost.debug.showSkipSummary
 */
/**
 * Time the WebGL to SVG buffer copy
 *
 * After rendering, the result is copied to an image which is injected
 * into the SVG.
 *
 * If this property is set to true, the time it takes for the buffer copy
 * to complete is outputted.
 *
 * @type      {boolean}
 * @default   false
 * @apioption boost.debug.timeBufferCopy
 */
/**
 * The pixel ratio for the WebGL content. If 0, the `window.devicePixelRatio` is
 * used. This ensures sharp graphics on high DPI displays like Apple's Retina,
 * as well as when a page is zoomed.
 *
 * The default is left at 1 for now, as this is a new feature that has the
 * potential to break existing setups. Over time, when it has been battle
 * tested, the intention is to set it to 0 by default.
 *
 * Another use case for this option is to set it to 2 in order to make exported
 * and upscaled charts render sharp.
 *
 * One limitation when using the `pixelRatio` is that the line width of graphs
 * is scaled down. Since the Boost module currently can only render 1px line
 * widths, it is scaled down to a thin 0.5 pixels on a Retina display.
 *
 * @sample    highcharts/boost/line-devicepixelratio
 *            Enable the `devicePixelRatio`
 * @sample    highcharts/boost/line-export-pixelratio
 *            Sharper graphics in export
 *
 * @type      {number}
 * @since 10.0.0
 * @default   1
 * @apioption boost.pixelRatio
 */
/**
 * Set the series threshold for when the boost should kick in globally.
 *
 * Setting to e.g. 20 will cause the whole chart to enter boost mode
 * if there are 20 or more series active. When the chart is in boost mode,
 * every series in it will be rendered to a common canvas. This offers
 * a significant speed improvement in charts with a very high
 * amount of series.
 *
 * @type      {number}
 * @default   50
 * @apioption boost.seriesThreshold
 */
/**
 * Enable or disable GPU translations. GPU translations are faster than doing
 * the translation in JavaScript.
 *
 * This option may cause rendering issues with certain datasets.
 * Namely, if your dataset has large numbers with small increments (such as
 * timestamps), it won't work correctly. This is due to floating point
 * precision.
 *
 * @type      {boolean}
 * @default   false
 * @apioption boost.useGPUTranslations
 */
/**
 * Enable or disable pre-allocation of vertex buffers.
 *
 * Enabling this will make it so that the binary data arrays required for
 * storing the series data will be allocated prior to transforming the data
 * to a WebGL-compatible format.
 *
 * This saves a copy operation on the order of O(n) and so is significantly more
 * performant. However, this is currently an experimental option, and may cause
 * visual artifacts with some datasets.
 *
 * As such, care should be taken when using this setting to make sure that
 * it doesn't cause any rendering glitches with the given use-case.
 *
 * @type      {boolean}
 * @default   false
 * @apioption boost.usePreallocated
 */
/**
 * Set the point threshold for when a series should enter boost mode.
 *
 * Setting it to e.g. 2000 will cause the series to enter boost mode when there
 * are 2000 or more points in the series.
 *
 * To disable boosting on the series, set the `boostThreshold` to 0. Setting it
 * to 1 will force boosting.
 *
 * Note that the [cropThreshold](plotOptions.series.cropThreshold) also affects
 * this setting. When zooming in on a series that has fewer points than the
 * `cropThreshold`, all points are rendered although outside the visible plot
 * area, and the `boostThreshold` won't take effect.
 *
 * @type      {number}
 * @default   5000
 * @requires  modules/boost
 * @apioption plotOptions.series.boostThreshold
 */
/**
 * Sets the color blending in the boost module.
 *
 * @type       {string}
 * @default    undefined
 * @validvalue ["add", "multiply", "darken"]
 * @requires   modules/boost
 * @apioption  plotOptions.series.boostBlending
 */
''; // Adds doclets above to transpiled file

;// ./code/es5/es-modules/masters/modules/boost.src.js




var G = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default());
G.hasWebGLSupport = Boost_Boost.hasWebGLSupport;
Boost_Boost.compose(G.Chart, G.Axis, G.Series, G.seriesTypes, G.Point, G.Color);
/* harmony default export */ var boost_src = ((highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()));

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});