/**
 * @license Highstock JS v12.3.0 (2025-06-21)
 * @module highcharts/indicators/volume-by-price
 * @requires highcharts
 * @requires highcharts/modules/stock
 *
 * Indicator series type for Highcharts Stock
 *
 * (c) 2010-2025 Paweł Dalek
 *
 * License: www.highcharts.com/license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("highcharts"), require("highcharts")["SeriesRegistry"]);
	else if(typeof define === 'function' && define.amd)
		define("highcharts/indicators/volume-by-price", [["highcharts/highcharts"], ["highcharts/highcharts","SeriesRegistry"]], factory);
	else if(typeof exports === 'object')
		exports["highcharts/indicators/volume-by-price"] = factory(require("highcharts"), require("highcharts")["SeriesRegistry"]);
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
  "default": function() { return /* binding */ volume_by_price_src; }
});

// EXTERNAL MODULE: external {"amd":["highcharts/highcharts"],"commonjs":["highcharts"],"commonjs2":["highcharts"],"root":["Highcharts"]}
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_ = __webpack_require__(944);
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default = /*#__PURE__*/__webpack_require__.n(highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_);
// EXTERNAL MODULE: external {"amd":["highcharts/highcharts","SeriesRegistry"],"commonjs":["highcharts","SeriesRegistry"],"commonjs2":["highcharts","SeriesRegistry"],"root":["Highcharts","SeriesRegistry"]}
var highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_ = __webpack_require__(512);
var highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default = /*#__PURE__*/__webpack_require__.n(highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_);
;// ./code/es5/es-modules/Stock/Indicators/VBP/VBPPoint.js
/* *
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
/* *
 *
 *  Imports
 *
 * */

var SMAPoint = (highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default()).seriesTypes.sma.prototype.pointClass;
/* *
 *
 *  Class
 *
 * */
var VBPPoint = /** @class */ (function (_super) {
    __extends(VBPPoint, _super);
    function VBPPoint() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Required for destroying negative part of volume
    VBPPoint.prototype.destroy = function () {
        // @todo: this.negativeGraphic doesn't seem to be used anywhere
        if (this.negativeGraphic) {
            this.negativeGraphic = this.negativeGraphic.destroy();
        }
        _super.prototype.destroy.apply(this, arguments);
    };
    return VBPPoint;
}(SMAPoint));
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var VBP_VBPPoint = (VBPPoint);

;// ./code/es5/es-modules/Stock/Indicators/VBP/VBPIndicator.js
/* *
 *
 *  (c) 2010-2025 Paweł Dalek
 *
 *  Volume By Price (VBP) indicator for Highcharts Stock
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

var VBPIndicator_extends = (undefined && undefined.__extends) || (function () {
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


var animObject = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).animObject;

var noop = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).noop;

var _a = (highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default()).seriesTypes, columnProto = _a.column.prototype, SMAIndicator = _a.sma;

var addEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).addEvent, arrayMax = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).arrayMax, arrayMin = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).arrayMin, correctFloat = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).correctFloat, defined = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).defined, error = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).error, extend = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).extend, isArray = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).isArray, merge = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).merge;
/* *
 *
 *  Constants
 *
 * */
var abs = Math.abs;
/* *
 *
 *  Functions
 *
 * */
// Utils
/**
 * @private
 */
function arrayExtremesOHLC(data) {
    var dataLength = data.length;
    var min = data[0][3],
        max = min,
        i = 1,
        currentPoint;
    for (; i < dataLength; i++) {
        currentPoint = data[i][3];
        if (currentPoint < min) {
            min = currentPoint;
        }
        if (currentPoint > max) {
            max = currentPoint;
        }
    }
    return {
        min: min,
        max: max
    };
}
/* *
 *
 *  Class
 *
 * */
/**
 * The Volume By Price (VBP) series type.
 *
 * @private
 * @class
 * @name Highcharts.seriesTypes.vbp
 *
 * @augments Highcharts.Series
 */
var VBPIndicator = /** @class */ (function (_super) {
    VBPIndicator_extends(VBPIndicator, _super);
    function VBPIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* *
     *
     *  Functions
     *
     * */
    VBPIndicator.prototype.init = function (chart, options) {
        var indicator = this;
        // Series.update() sends data that is not necessary as everything is
        // calculated in getValues(), #17007
        delete options.data;
        _super.prototype.init.apply(indicator, arguments);
        // Only after series are linked add some additional logic/properties.
        var unbinder = addEvent(this.chart.constructor, 'afterLinkSeries',
            function () {
                // Protection for a case where the indicator is being updated,
                // for a brief moment the indicator is deleted.
                if (indicator.options) {
                    var params = indicator.options.params,
            baseSeries = indicator.linkedParent,
            volumeSeries = chart.get(params.volumeSeriesID);
                indicator.addCustomEvents(baseSeries, volumeSeries);
            }
            unbinder();
        }, {
            order: 1
        });
        return indicator;
    };
    // Adds events related with removing series
    VBPIndicator.prototype.addCustomEvents = function (baseSeries, volumeSeries) {
        var indicator = this,
            toEmptyIndicator = function () {
                indicator.chart.redraw();
            indicator.setData([]);
            indicator.zoneStarts = [];
            if (indicator.zoneLinesSVG) {
                indicator.zoneLinesSVG = indicator.zoneLinesSVG.destroy();
            }
        };
        // If base series is deleted, indicator series data is filled with
        // an empty array
        indicator.dataEventsToUnbind.push(addEvent(baseSeries, 'remove', function () {
            toEmptyIndicator();
        }));
        // If volume series is deleted, indicator series data is filled with
        // an empty array
        if (volumeSeries) {
            indicator.dataEventsToUnbind.push(addEvent(volumeSeries, 'remove', function () {
                toEmptyIndicator();
            }));
        }
        return indicator;
    };
    // Initial animation
    VBPIndicator.prototype.animate = function (init) {
        var series = this,
            inverted = series.chart.inverted,
            group = series.group,
            attr = {};
        if (!init && group) {
            var position = inverted ? series.yAxis.top : series.xAxis.left;
            if (inverted) {
                group['forceAnimate:translateY'] = true;
                attr.translateY = position;
            }
            else {
                group['forceAnimate:translateX'] = true;
                attr.translateX = position;
            }
            group.animate(attr, extend(animObject(series.options.animation), {
                step: function (val, fx) {
                    series.group.attr({
                        scaleX: Math.max(0.001, fx.pos)
                    });
                }
            }));
        }
    };
    VBPIndicator.prototype.drawPoints = function () {
        var indicator = this;
        if (indicator.options.volumeDivision.enabled) {
            indicator.posNegVolume(true, true);
            columnProto.drawPoints.apply(indicator, arguments);
            indicator.posNegVolume(false, false);
        }
        columnProto.drawPoints.apply(indicator, arguments);
    };
    // Function responsible for dividing volume into positive and negative
    VBPIndicator.prototype.posNegVolume = function (initVol, pos) {
        var indicator = this, signOrder = pos ?
                ['positive', 'negative'] :
                ['negative', 'positive'], volumeDivision = indicator.options.volumeDivision, pointLength = indicator.points.length;
        var posWidths = [],
            negWidths = [],
            i = 0,
            pointWidth,
            priceZone,
            wholeVol,
            point;
        if (initVol) {
            indicator.posWidths = posWidths;
            indicator.negWidths = negWidths;
        }
        else {
            posWidths = indicator.posWidths;
            negWidths = indicator.negWidths;
        }
        for (; i < pointLength; i++) {
            point = indicator.points[i];
            point[signOrder[0] + 'Graphic'] = point.graphic;
            point.graphic = point[signOrder[1] + 'Graphic'];
            if (initVol) {
                pointWidth = point.shapeArgs.width;
                priceZone = indicator.priceZones[i];
                wholeVol = priceZone.wholeVolumeData;
                if (wholeVol) {
                    posWidths.push(pointWidth / wholeVol * priceZone.positiveVolumeData);
                    negWidths.push(pointWidth / wholeVol * priceZone.negativeVolumeData);
                }
                else {
                    posWidths.push(0);
                    negWidths.push(0);
                }
            }
            point.color = pos ?
                volumeDivision.styles.positiveColor :
                volumeDivision.styles.negativeColor;
            point.shapeArgs.width = pos ?
                indicator.posWidths[i] :
                indicator.negWidths[i];
            point.shapeArgs.x = pos ?
                point.shapeArgs.x :
                indicator.posWidths[i];
        }
    };
    VBPIndicator.prototype.translate = function () {
        var indicator = this,
            options = indicator.options,
            chart = indicator.chart,
            yAxis = indicator.yAxis,
            yAxisMin = yAxis.min,
            zoneLinesOptions = indicator.options.zoneLines,
            priceZones = (indicator.priceZones);
        var yBarOffset = 0,
            volumeDataArray,
            maxVolume,
            primalBarWidth,
            barHeight,
            barHeightP,
            oldBarHeight,
            barWidth,
            pointPadding,
            chartPlotTop,
            barX,
            barY;
        columnProto.translate.apply(indicator);
        var indicatorPoints = indicator.points;
        // Do translate operation when points exist
        if (indicatorPoints.length) {
            pointPadding = options.pointPadding < 0.5 ?
                options.pointPadding :
                0.1;
            volumeDataArray = indicator.volumeDataArray;
            maxVolume = arrayMax(volumeDataArray);
            primalBarWidth = chart.plotWidth / 2;
            chartPlotTop = chart.plotTop;
            barHeight = abs(yAxis.toPixels(yAxisMin) -
                yAxis.toPixels(yAxisMin + indicator.rangeStep));
            oldBarHeight = abs(yAxis.toPixels(yAxisMin) -
                yAxis.toPixels(yAxisMin + indicator.rangeStep));
            if (pointPadding) {
                barHeightP = abs(barHeight * (1 - 2 * pointPadding));
                yBarOffset = abs((barHeight - barHeightP) / 2);
                barHeight = abs(barHeightP);
            }
            indicatorPoints.forEach(function (point, index) {
                barX = point.barX = point.plotX = 0;
                barY = point.plotY = (yAxis.toPixels(priceZones[index].start) -
                    chartPlotTop -
                    (yAxis.reversed ?
                        (barHeight - oldBarHeight) :
                        barHeight) -
                    yBarOffset);
                barWidth = correctFloat(primalBarWidth *
                    priceZones[index].wholeVolumeData / maxVolume);
                point.pointWidth = barWidth;
                point.shapeArgs = indicator.crispCol.apply(// eslint-disable-line no-useless-call
                indicator, [barX, barY, barWidth, barHeight]);
                point.volumeNeg = priceZones[index].negativeVolumeData;
                point.volumePos = priceZones[index].positiveVolumeData;
                point.volumeAll = priceZones[index].wholeVolumeData;
            });
            if (zoneLinesOptions.enabled) {
                indicator.drawZones(chart, yAxis, indicator.zoneStarts, zoneLinesOptions.styles);
            }
        }
    };
    VBPIndicator.prototype.getExtremes = function () {
        var prevCompare = this.options.compare,
            prevCumulative = this.options.cumulative;
        var ret;
        // Temporarily disable cumulative and compare while getting the extremes
        if (this.options.compare) {
            this.options.compare = void 0;
            ret = _super.prototype.getExtremes.call(this);
            this.options.compare = prevCompare;
        }
        else if (this.options.cumulative) {
            this.options.cumulative = false;
            ret = _super.prototype.getExtremes.call(this);
            this.options.cumulative = prevCumulative;
        }
        else {
            ret = _super.prototype.getExtremes.call(this);
        }
        return ret;
    };
    VBPIndicator.prototype.getValues = function (series, params) {
        var indicator = this,
            xValues = series.getColumn('x',
            true),
            yValues = series.processedYData,
            chart = indicator.chart,
            ranges = params.ranges,
            VBP = [],
            xData = [],
            yData = [],
            volumeSeries = chart.get(params.volumeSeriesID);
        // Checks if base series exists
        if (!series.chart) {
            error('Base series not found! In case it has been removed, add ' +
                'a new one.', true, chart);
            return;
        }
        // Checks if volume series exists and if it has data
        if (!volumeSeries ||
            !volumeSeries.getColumn('x', true).length) {
            var errorMessage = volumeSeries &&
                    !volumeSeries.getColumn('x',
                true).length ?
                    ' does not contain any data.' :
                    ' not found! Check `volumeSeriesID`.';
            error('Series ' +
                params.volumeSeriesID + errorMessage, true, chart);
            return;
        }
        // Checks if series data fits the OHLC format
        var isOHLC = isArray(yValues[0]);
        if (isOHLC && yValues[0].length !== 4) {
            error('Type of ' +
                series.name +
                ' series is different than line, OHLC or candlestick.', true, chart);
            return;
        }
        // Price zones contains all the information about the zones (index,
        // start, end, volumes, etc.)
        var priceZones = indicator.priceZones = indicator.specifyZones(isOHLC,
            xValues,
            yValues,
            ranges,
            volumeSeries);
        priceZones.forEach(function (zone, index) {
            VBP.push([zone.x, zone.end]);
            xData.push(VBP[index][0]);
            yData.push(VBP[index][1]);
        });
        return {
            values: VBP,
            xData: xData,
            yData: yData
        };
    };
    // Specifying where each zone should start ans end
    VBPIndicator.prototype.specifyZones = function (isOHLC, xValues, yValues, ranges, volumeSeries) {
        var indicator = this,
            rangeExtremes = (isOHLC ? arrayExtremesOHLC(yValues) : false),
            zoneStarts = indicator.zoneStarts = [],
            priceZones = [];
        var lowRange = rangeExtremes ?
                rangeExtremes.min :
                arrayMin(yValues),
            highRange = rangeExtremes ?
                rangeExtremes.max :
                arrayMax(yValues),
            i = 0,
            j = 1;
        // If the compare mode is set on the main series, change the VBP
        // zones to fit new extremes, #16277.
        var mainSeries = indicator.linkedParent;
        if (!indicator.options.compareToMain &&
            mainSeries.dataModify) {
            lowRange = mainSeries.dataModify.modifyValue(lowRange);
            highRange = mainSeries.dataModify.modifyValue(highRange);
        }
        if (!defined(lowRange) || !defined(highRange)) {
            if (this.points.length) {
                this.setData([]);
                this.zoneStarts = [];
                if (this.zoneLinesSVG) {
                    this.zoneLinesSVG = this.zoneLinesSVG.destroy();
                }
            }
            return [];
        }
        var rangeStep = indicator.rangeStep =
                correctFloat(highRange - lowRange) / ranges;
        zoneStarts.push(lowRange);
        for (; i < ranges - 1; i++) {
            zoneStarts.push(correctFloat(zoneStarts[i] + rangeStep));
        }
        zoneStarts.push(highRange);
        var zoneStartsLength = zoneStarts.length;
        //    Creating zones
        for (; j < zoneStartsLength; j++) {
            priceZones.push({
                index: j - 1,
                x: xValues[0],
                start: zoneStarts[j - 1],
                end: zoneStarts[j]
            });
        }
        return indicator.volumePerZone(isOHLC, priceZones, volumeSeries, xValues, yValues);
    };
    // Calculating sum of volume values for a specific zone
    VBPIndicator.prototype.volumePerZone = function (isOHLC, priceZones, volumeSeries, xValues, yValues) {
        var indicator = this, volumeXData = volumeSeries.getColumn('x', true), volumeYData = volumeSeries.getColumn('y', true), lastZoneIndex = priceZones.length - 1, baseSeriesLength = yValues.length, volumeSeriesLength = volumeYData.length;
        var previousValue,
            startFlag,
            endFlag,
            value,
            i;
        // Checks if each point has a corresponding volume value
        if (abs(baseSeriesLength - volumeSeriesLength)) {
            // If the first point don't have volume, add 0 value at the
            // beginning of the volume array
            if (xValues[0] !== volumeXData[0]) {
                volumeYData.unshift(0);
            }
            // If the last point don't have volume, add 0 value at the end
            // of the volume array
            if (xValues[baseSeriesLength - 1] !==
                volumeXData[volumeSeriesLength - 1]) {
                volumeYData.push(0);
            }
        }
        indicator.volumeDataArray = [];
        priceZones.forEach(function (zone) {
            zone.wholeVolumeData = 0;
            zone.positiveVolumeData = 0;
            zone.negativeVolumeData = 0;
            for (i = 0; i < baseSeriesLength; i++) {
                startFlag = false;
                endFlag = false;
                value = isOHLC ? yValues[i][3] : yValues[i];
                previousValue = i ?
                    (isOHLC ?
                        yValues[i - 1][3] :
                        yValues[i - 1]) :
                    value;
                // If the compare mode is set on the main series,
                // change the VBP zones to fit new extremes, #16277.
                var mainSeries = indicator.linkedParent;
                if (!indicator.options.compareToMain &&
                    mainSeries.dataModify) {
                    value = mainSeries.dataModify.modifyValue(value);
                    previousValue = mainSeries.dataModify
                        .modifyValue(previousValue);
                }
                // Checks if this is the point with the
                // lowest close value and if so, adds it calculations
                if (value <= zone.start && zone.index === 0) {
                    startFlag = true;
                }
                // Checks if this is the point with the highest
                // close value and if so, adds it calculations
                if (value >= zone.end && zone.index === lastZoneIndex) {
                    endFlag = true;
                }
                if ((value > zone.start || startFlag) &&
                    (value < zone.end || endFlag)) {
                    zone.wholeVolumeData += volumeYData[i];
                    if (previousValue > value) {
                        zone.negativeVolumeData += volumeYData[i];
                    }
                    else {
                        zone.positiveVolumeData += volumeYData[i];
                    }
                }
            }
            indicator.volumeDataArray.push(zone.wholeVolumeData);
        });
        return priceZones;
    };
    // Function responsible for drawing additional lines indicating zones
    VBPIndicator.prototype.drawZones = function (chart, yAxis, zonesValues, zonesStyles) {
        var indicator = this,
            renderer = chart.renderer,
            leftLinePos = 0,
            rightLinePos = chart.plotWidth,
            verticalOffset = chart.plotTop;
        var zoneLinesSVG = indicator.zoneLinesSVG,
            zoneLinesPath = [],
            verticalLinePos;
        zonesValues.forEach(function (value) {
            verticalLinePos = yAxis.toPixels(value) - verticalOffset;
            zoneLinesPath = zoneLinesPath.concat(chart.renderer.crispLine([[
                    'M',
                    leftLinePos,
                    verticalLinePos
                ], [
                    'L',
                    rightLinePos,
                    verticalLinePos
                ]], zonesStyles.lineWidth));
        });
        // Create zone lines one path or update it while animating
        if (zoneLinesSVG) {
            zoneLinesSVG.animate({
                d: zoneLinesPath
            });
        }
        else {
            zoneLinesSVG = indicator.zoneLinesSVG =
                renderer
                    .path(zoneLinesPath)
                    .attr({
                    'stroke-width': zonesStyles.lineWidth,
                    'stroke': zonesStyles.color,
                    'dashstyle': zonesStyles.dashStyle,
                    'zIndex': indicator.group.zIndex + 0.1
                })
                    .add(indicator.group);
        }
    };
    /* *
     *
     *  Static Properties
     *
     * */
    /**
     * Volume By Price indicator.
     *
     * This series requires `linkedTo` option to be set.
     *
     * @sample stock/indicators/volume-by-price
     *         Volume By Price indicator
     *
     * @extends      plotOptions.sma
     * @since        6.0.0
     * @product      highstock
     * @requires     stock/indicators/indicators
     * @requires     stock/indicators/volume-by-price
     * @optionparent plotOptions.vbp
     */
    VBPIndicator.defaultOptions = merge(SMAIndicator.defaultOptions, {
        /**
         * @excluding index, period
         */
        params: {
            // Index and period are unchangeable, do not inherit (#15362)
            index: void 0,
            period: void 0,
            /**
             * The number of price zones.
             */
            ranges: 12,
            /**
             * The id of volume series which is mandatory. For example using
             * OHLC data, volumeSeriesID='volume' means the indicator will be
             * calculated using OHLC and volume values.
             */
            volumeSeriesID: 'volume'
        },
        /**
         * The styles for lines which determine price zones.
         */
        zoneLines: {
            /**
             * Enable/disable zone lines.
             */
            enabled: true,
            /**
             * Specify the style of zone lines.
             *
             * @type    {Highcharts.CSSObject}
             * @default {"color": "#0A9AC9", "dashStyle": "LongDash", "lineWidth": 1}
             */
            styles: {
                /** @ignore-option */
                color: '#0A9AC9',
                /** @ignore-option */
                dashStyle: 'LongDash',
                /** @ignore-option */
                lineWidth: 1
            }
        },
        /**
         * The styles for bars when volume is divided into positive/negative.
         */
        volumeDivision: {
            /**
             * Option to control if volume is divided.
             */
            enabled: true,
            styles: {
                /**
                 * Color of positive volume bars.
                 *
                 * @type {Highcharts.ColorString}
                 */
                positiveColor: 'rgba(144, 237, 125, 0.8)',
                /**
                 * Color of negative volume bars.
                 *
                 * @type {Highcharts.ColorString}
                 */
                negativeColor: 'rgba(244, 91, 91, 0.8)'
            }
        },
        // To enable series animation; must be animationLimit > pointCount
        animationLimit: 1000,
        enableMouseTracking: false,
        pointPadding: 0,
        zIndex: -1,
        crisp: true,
        dataGrouping: {
            enabled: false
        },
        dataLabels: {
            align: 'left',
            allowOverlap: true,
            enabled: true,
            format: 'P: {point.volumePos:.2f} | N: {point.volumeNeg:.2f}',
            padding: 0,
            style: {
                /** @internal */
                fontSize: '0.5em'
            },
            verticalAlign: 'top'
        }
    });
    return VBPIndicator;
}(SMAIndicator));
extend(VBPIndicator.prototype, {
    nameBase: 'Volume by Price',
    nameComponents: ['ranges'],
    calculateOn: {
        chart: 'render',
        xAxis: 'afterSetExtremes'
    },
    pointClass: VBP_VBPPoint,
    markerAttribs: noop,
    drawGraph: noop,
    getColumnMetrics: columnProto.getColumnMetrics,
    crispCol: columnProto.crispCol
});
highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default().registerSeriesType('vbp', VBPIndicator);
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var VBP_VBPIndicator = ((/* unused pure expression or super */ null && (VBPIndicator)));
/* *
 *
 *  API Options
 *
 * */
/**
 * A `Volume By Price (VBP)` series. If the [type](#series.vbp.type) option is
 * not specified, it is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.vbp
 * @since     6.0.0
 * @product   highstock
 * @excluding dataParser, dataURL, compare, compareBase, compareStart
 * @requires  stock/indicators/indicators
 * @requires  stock/indicators/volume-by-price
 * @apioption series.vbp
 */
''; // To include the above in the js output

;// ./code/es5/es-modules/masters/indicators/volume-by-price.src.js




/* harmony default export */ var volume_by_price_src = ((highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()));

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});