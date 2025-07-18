/**
 * @license Highcharts JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/variwide
 * @requires highcharts
 *
 * Highcharts variwide module
 *
 * (c) 2010-2025 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("highcharts"), require("highcharts")["SeriesRegistry"]);
	else if(typeof define === 'function' && define.amd)
		define("highcharts/modules/variwide", [["highcharts/highcharts"], ["highcharts/highcharts","SeriesRegistry"]], factory);
	else if(typeof exports === 'object')
		exports["highcharts/modules/variwide"] = factory(require("highcharts"), require("highcharts")["SeriesRegistry"]);
	else
		root["Highcharts"] = factory(root["Highcharts"], root["Highcharts"]["SeriesRegistry"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__944__, __WEBPACK_EXTERNAL_MODULE__512__) {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 512:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__512__;

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
  "default": function() { return /* binding */ variwide_src; }
});

// EXTERNAL MODULE: external {"amd":["highcharts/highcharts"],"commonjs":["highcharts"],"commonjs2":["highcharts"],"root":["Highcharts"]}
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_ = __webpack_require__(944);
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default = /*#__PURE__*/__webpack_require__.n(highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_);
// EXTERNAL MODULE: external {"amd":["highcharts/highcharts","SeriesRegistry"],"commonjs":["highcharts","SeriesRegistry"],"commonjs2":["highcharts","SeriesRegistry"],"root":["Highcharts","SeriesRegistry"]}
var highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_ = __webpack_require__(512);
var highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default = /*#__PURE__*/__webpack_require__.n(highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_);
;// ./code/es5/es-modules/Series/Variwide/VariwideComposition.js
/* *
 *
 *  Highcharts variwide module
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


var composed = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).composed;

var addEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).addEvent, pushUnique = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pushUnique, wrap = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).wrap;
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function compose(AxisClass, TickClass) {
    if (pushUnique(composed, 'Variwide')) {
        var tickProto = TickClass.prototype;
        addEvent(AxisClass, 'afterDrawCrosshair', onAxisAfterDrawCrosshair);
        addEvent(AxisClass, 'afterRender', onAxisAfterRender);
        addEvent(TickClass, 'afterGetPosition', onTickAfterGetPosition);
        tickProto.postTranslate = tickPostTranslate;
        wrap(tickProto, 'getLabelPosition', wrapTickGetLabelPosition);
    }
}
/**
 * Same width as the category (#8083)
 * @private
 */
function onAxisAfterDrawCrosshair(e) {
    var _a;
    if (this.variwide && this.cross) {
        this.cross.attr('stroke-width', (_a = e.point) === null || _a === void 0 ? void 0 : _a.crosshairWidth);
    }
}
/**
 * On a vertical axis, apply anti-collision logic to the labels.
 * @private
 */
function onAxisAfterRender() {
    var axis = this;
    if (this.variwide) {
        this.chart.labelCollectors.push(function () {
            return axis.tickPositions
                .filter(function (pos) { return !!axis.ticks[pos].label; })
                .map(function (pos, i) {
                var label = axis.ticks[pos].label;
                label.labelrank = axis.zData[i];
                return label;
            });
        });
    }
}
/**
 * @private
 */
function onTickAfterGetPosition(e) {
    var axis = this.axis,
        xOrY = axis.horiz ? 'x' : 'y';
    if (axis.variwide) {
        this[xOrY + 'Orig'] = e.pos[xOrY];
        this.postTranslate(e.pos, xOrY, this.pos);
    }
}
/**
 * @private
 */
function tickPostTranslate(xy, xOrY, index) {
    var axis = this.axis;
    var pos = xy[xOrY] - axis.pos;
    if (!axis.horiz) {
        pos = axis.len - pos;
    }
    pos = axis.series[0].postTranslate(index, pos);
    if (!axis.horiz) {
        pos = axis.len - pos;
    }
    xy[xOrY] = axis.pos + pos;
}
/**
 * @private
 */
function wrapTickGetLabelPosition(proceed, _x, _y, _label, horiz, 
/* eslint-disable @typescript-eslint/no-unused-vars */
_labelOptions, _tickmarkOffset, _index
/* eslint-enable @typescript-eslint/no-unused-vars */
) {
    var args = Array.prototype.slice.call(arguments, 1),
        xOrY = horiz ? 'x' : 'y';
    // Replace the x with the original x
    if (this.axis.variwide &&
        typeof this[xOrY + 'Orig'] === 'number') {
        args[horiz ? 0 : 1] = this[xOrY + 'Orig'];
    }
    var xy = proceed.apply(this,
        args);
    // Post-translate
    if (this.axis.variwide && this.axis.categories) {
        this.postTranslate(xy, xOrY, this.pos);
    }
    return xy;
}
/* *
 *
 *  Default Export
 *
 * */
var VariwideComposition = {
    compose: compose
};
/* harmony default export */ var Variwide_VariwideComposition = (VariwideComposition);

;// ./code/es5/es-modules/Series/Variwide/VariwidePoint.js
/* *
 *
 *  Highcharts variwide module
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d,
        b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d,
        b) { d.__proto__ = b; }) ||
                function (d,
        b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var ColumnPoint = (highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default()).seriesTypes.column.prototype.pointClass;

var isNumber = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).isNumber;
/* *
 *
 *  Class
 *
 * */
var VariwidePoint = /** @class */ (function (_super) {
    __extends(VariwidePoint, _super);
    function VariwidePoint() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* *
     *
     *  Functions
     *
     * */
    VariwidePoint.prototype.isValid = function () {
        return isNumber(this.y) && isNumber(this.z);
    };
    return VariwidePoint;
}(ColumnPoint));
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Variwide_VariwidePoint = (VariwidePoint);

;// ./code/es5/es-modules/Series/Variwide/VariwideSeriesDefaults.js
/* *
 *
 *  Highcharts variwide module
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
 *  API Options
 *
 * */
/**
 * A variwide chart (related to marimekko chart) is a column chart with a
 * variable width expressing a third dimension.
 *
 * @sample {highcharts} highcharts/demo/variwide/
 *         Variwide chart
 * @sample {highcharts} highcharts/series-variwide/inverted/
 *         Inverted variwide chart
 * @sample {highcharts} highcharts/series-variwide/datetime/
 *         Variwide columns on a datetime axis
 *
 * @extends      plotOptions.column
 * @since        6.0.0
 * @product      highcharts
 * @excluding    boostThreshold, crisp, depth, edgeColor, edgeWidth,
 *               groupZPadding, boostBlending
 * @requires     modules/variwide
 * @optionparent plotOptions.variwide
 */
var VariwideSeriesDefaults = {
    /**
     * In a variwide chart, the point padding is 0 in order to express the
     * horizontal stacking of items.
     */
    pointPadding: 0,
    /**
     * In a variwide chart, the group padding is 0 in order to express the
     * horizontal stacking of items.
     */
    groupPadding: 0
};
/**
 * A `variwide` series. If the [type](#series.variwide.type) option is not
 * specified, it is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.variwide
 * @excluding boostThreshold, boostBlending
 * @product   highcharts
 * @requires  modules/variwide
 * @apioption series.variwide
 */
/**
 * An array of data points for the series. For the `variwide` series type,
 * points can be given in the following ways:
 *
 * 1. An array of arrays with 3 or 2 values. In this case, the values correspond
 *    to `x,y,z`. If the first value is a string, it is applied as the name of
 *    the point, and the `x` value is inferred. The `x` value can also be
 *    omitted, in which case the inner arrays should be of length 2. Then the
 *    `x` value is automatically calculated, either starting at 0 and
 *    incremented by 1, or from `pointStart` and `pointInterval` given in the
 *    series options.
 *    ```js
 *       data: [
 *           [0, 1, 2],
 *           [1, 5, 5],
 *           [2, 0, 2]
 *       ]
 *    ```
 *
 * 2. An array of objects with named values. The following snippet shows only a
 *    few settings, see the complete options set below. If the total number of
 *    data points exceeds the series'
 *    [turboThreshold](#series.variwide.turboThreshold), this option is not
 *    available.
 *    ```js
 *       data: [{
 *           x: 1,
 *           y: 1,
 *           z: 1,
 *           name: "Point2",
 *           color: "#00FF00"
 *       }, {
 *           x: 1,
 *           y: 5,
 *           z: 4,
 *           name: "Point1",
 *           color: "#FF00FF"
 *       }]
 *    ```
 *
 * @sample {highcharts} highcharts/series/data-array-of-arrays/
 *         Arrays of numeric x and y
 * @sample {highcharts} highcharts/series/data-array-of-arrays-datetime/
 *         Arrays of datetime x and y
 * @sample {highcharts} highcharts/series/data-array-of-name-value/
 *         Arrays of point.name and y
 * @sample {highcharts} highcharts/series/data-array-of-objects/
 *         Config objects
 *
 * @type      {Array<Array<(number|string),number>|Array<(number|string),number,number>|*>}
 * @extends   series.line.data
 * @excluding marker
 * @product   highcharts
 * @apioption series.variwide.data
 */
/**
 * The relative width for each column. On a category axis, the widths are
 * distributed so they sum up to the X axis length. On linear and datetime axes,
 * the columns will be laid out from the X value and Z units along the axis.
 *
 * @type      {number}
 * @product   highcharts
 * @apioption series.variwide.data.z
 */
''; // Adds doclets above to transpiled file
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Variwide_VariwideSeriesDefaults = (VariwideSeriesDefaults);

;// ./code/es5/es-modules/Series/Variwide/VariwideSeries.js
/* *
 *
 *  Highcharts variwide module
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

var VariwideSeries_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d,
        b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d,
        b) { d.__proto__ = b; }) ||
                function (d,
        b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b,
        p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var ColumnSeries = (highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default()).seriesTypes.column;




var VariwideSeries_addEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).addEvent, arrayMin = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).arrayMin, arrayMax = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).arrayMax, crisp = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).crisp, extend = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).extend, merge = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).merge, pick = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pick;
/* *
 *
 *  Class
 *
 * */
/**
 * @private
 * @class
 * @name Highcharts.seriesTypes.variwide
 *
 * @augments Highcharts.Series
 */
var VariwideSeries = /** @class */ (function (_super) {
    VariwideSeries_extends(VariwideSeries, _super);
    function VariwideSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* *
     *
     * Functions
     *
     * */
    VariwideSeries.prototype.processData = function (force) {
        this.totalZ = 0;
        this.relZ = [];
        highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default().seriesTypes.column.prototype.processData.call(this, force);
        var zData = this.getColumn('z');
        (this.xAxis.reversed ?
            zData.slice().reverse() :
            zData).forEach(function (z, i) {
            this.relZ[i] = this.totalZ;
            this.totalZ += z;
        }, this);
        if (this.xAxis.categories) {
            this.xAxis.variwide = true;
            this.xAxis.zData = zData; // Used for label rank
        }
        return;
    };
    /**
     * Translate an x value inside a given category index into the distorted
     * axis translation.
     *
     * @private
     * @function Highcharts.Series#postTranslate
     *
     * @param {number} index
     *        The category index
     *
     * @param {number} x
     *        The X pixel position in undistorted axis pixels
     *
     * @param {Highcharts.Point} point
     *        For crosshairWidth for every point
     *
     * @return {number}
     *         Distorted X position
     */
    VariwideSeries.prototype.postTranslate = function (index, x, point) {
        var axis = this.xAxis, relZ = this.relZ, i = axis.reversed ? relZ.length - index : index, goRight = axis.reversed ? -1 : 1, minPx = axis.toPixels(axis.reversed ?
                (axis.dataMax || 0) + axis.pointRange :
                (axis.dataMin || 0)), maxPx = axis.toPixels(axis.reversed ?
                (axis.dataMin || 0) :
                (axis.dataMax || 0) + axis.pointRange), len = Math.abs(maxPx - minPx), totalZ = this.totalZ, left = this.chart.inverted ?
                maxPx - (this.chart.plotTop - goRight * axis.minPixelPadding) :
                minPx - this.chart.plotLeft - goRight * axis.minPixelPadding, linearSlotLeft = i / relZ.length * len, linearSlotRight = (i + goRight) / relZ.length * len, slotLeft = (pick(relZ[i], totalZ) / totalZ) * len, slotRight = (pick(relZ[i + goRight], totalZ) / totalZ) * len, xInsideLinearSlot = (x - (left + linearSlotLeft));
        // Set crosshairWidth for every point (#8173)
        if (point) {
            point.crosshairWidth = slotRight - slotLeft;
        }
        return left + slotLeft +
            xInsideLinearSlot * (slotRight - slotLeft) /
                (linearSlotRight - linearSlotLeft);
    };
    /* eslint-enable valid-jsdoc */
    VariwideSeries.prototype.translate = function () {
        // Temporarily disable crisping when computing original shapeArgs
        this.crispOption = this.options.crisp;
        this.options.crisp = false;
        _super.prototype.translate.call(this);
        // Reset option
        this.options.crisp = this.crispOption;
    };
    /**
     * Function that corrects stack labels positions
     * @private
     */
    VariwideSeries.prototype.correctStackLabels = function () {
        var series = this,
            options = series.options,
            yAxis = series.yAxis;
        var pointStack,
            pointWidth,
            stack,
            xValue;
        for (var _i = 0, _a = series.points; _i < _a.length; _i++) {
            var point = _a[_i];
            xValue = point.x;
            pointWidth = point.shapeArgs.width;
            stack = yAxis.stacking.stacks[(series.negStacks &&
                point.y < (options.startFromThreshold ?
                    0 :
                    options.threshold) ?
                '-' :
                '') + series.stackKey];
            if (stack) {
                pointStack = stack[xValue];
                if (pointStack && !point.isNull) {
                    pointStack.setOffset(-(pointWidth / 2) || 0, pointWidth || 0, void 0, void 0, point.plotX, series.xAxis);
                }
            }
        }
    };
    VariwideSeries.prototype.getXExtremes = function (xData) {
        var max = arrayMax(xData),
            maxZ = this.getColumn('z')[xData.indexOf(max)];
        return {
            min: arrayMin(xData),
            max: max + (this.xAxis.categories ? 0 : maxZ)
        };
    };
    /* *
     *
     *  Static Properties
     *
     * */
    VariwideSeries.compose = Variwide_VariwideComposition.compose;
    VariwideSeries.defaultOptions = merge(ColumnSeries.defaultOptions, Variwide_VariwideSeriesDefaults);
    return VariwideSeries;
}(ColumnSeries));
// Extend translation by distorting X position based on Z.
VariwideSeries_addEvent(VariwideSeries, 'afterColumnTranslate', function () {
    // Temporarily disable crisping when computing original shapeArgs
    var xAxis = this.xAxis,
        inverted = this.chart.inverted;
    var i = -1;
    // Distort the points to reflect z dimension
    for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
        var point = _a[_i];
        ++i;
        var shapeArgs = point.shapeArgs || {},
            _b = shapeArgs.x,
            x = _b === void 0 ? 0 : _b,
            _c = shapeArgs.width,
            width = _c === void 0 ? 0 : _c,
            _d = point.plotX,
            plotX = _d === void 0 ? 0 : _d,
            tooltipPos = point.tooltipPos,
            _e = point.z,
            z = _e === void 0 ? 0 : _e;
        var left = void 0,
            right = void 0;
        if (xAxis.variwide) {
            left = this.postTranslate(i, x, point);
            right = this.postTranslate(i, x + width);
            // For linear or datetime axes, the variwide column should start with X
            // and extend Z units, without modifying the axis.
        }
        else {
            left = plotX;
            right = xAxis.translate(point.x + z, false, false, false, true);
        }
        if (this.crispOption) {
            left = crisp(left, this.borderWidth);
            right = crisp(right, this.borderWidth);
        }
        shapeArgs.x = left;
        shapeArgs.width = Math.max(right - left, 1);
        // Crosshair position (#8083)
        point.plotX = (left + right) / 2;
        // Adjust the tooltip position
        if (tooltipPos) {
            if (!inverted) {
                tooltipPos[0] = shapeArgs.x + shapeArgs.width / 2;
            }
            else {
                tooltipPos[1] = xAxis.len - shapeArgs.x - shapeArgs.width / 2;
            }
        }
    }
    if (this.options.stacking) {
        this.correctStackLabels();
    }
}, { order: 2 });
extend(VariwideSeries.prototype, {
    irregularWidths: true,
    keysAffectYAxis: ['y'],
    pointArrayMap: ['y', 'z'],
    parallelArrays: ['x', 'y', 'z'],
    pointClass: Variwide_VariwidePoint
});
highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default().registerSeriesType('variwide', VariwideSeries);
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Variwide_VariwideSeries = (VariwideSeries);

;// ./code/es5/es-modules/masters/modules/variwide.src.js




var G = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default());
Variwide_VariwideSeries.compose(G.Axis, G.Tick);
/* harmony default export */ var variwide_src = ((highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()));

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});