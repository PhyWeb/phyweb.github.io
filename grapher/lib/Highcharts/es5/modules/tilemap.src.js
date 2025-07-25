/**
 * @license Highmaps JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/tilemap
 * @requires highcharts
 * @requires highcharts/modules/map
 *
 * Tilemap module
 *
 * (c) 2010-2025 Highsoft AS
 *
 * License: www.highcharts.com/license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("highcharts"), require("highcharts")["SeriesRegistry"], require("highcharts")["Color"]);
	else if(typeof define === 'function' && define.amd)
		define("highcharts/modules/tilemap", [["highcharts/highcharts"], ["highcharts/highcharts","SeriesRegistry"], ["highcharts/highcharts","Color"]], factory);
	else if(typeof exports === 'object')
		exports["highcharts/modules/tilemap"] = factory(require("highcharts"), require("highcharts")["SeriesRegistry"], require("highcharts")["Color"]);
	else
		root["Highcharts"] = factory(root["Highcharts"], root["Highcharts"]["SeriesRegistry"], root["Highcharts"]["Color"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__944__, __WEBPACK_EXTERNAL_MODULE__512__, __WEBPACK_EXTERNAL_MODULE__620__) {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 512:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__512__;

/***/ }),

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
  "default": function() { return /* binding */ tilemap_src; }
});

// EXTERNAL MODULE: external {"amd":["highcharts/highcharts"],"commonjs":["highcharts"],"commonjs2":["highcharts"],"root":["Highcharts"]}
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_ = __webpack_require__(944);
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default = /*#__PURE__*/__webpack_require__.n(highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_);
// EXTERNAL MODULE: external {"amd":["highcharts/highcharts","SeriesRegistry"],"commonjs":["highcharts","SeriesRegistry"],"commonjs2":["highcharts","SeriesRegistry"],"root":["Highcharts","SeriesRegistry"]}
var highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_ = __webpack_require__(512);
var highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default = /*#__PURE__*/__webpack_require__.n(highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_);
// EXTERNAL MODULE: external {"amd":["highcharts/highcharts","Color"],"commonjs":["highcharts","Color"],"commonjs2":["highcharts","Color"],"root":["Highcharts","Color"]}
var highcharts_Color_commonjs_highcharts_Color_commonjs2_highcharts_Color_root_Highcharts_Color_ = __webpack_require__(620);
var highcharts_Color_commonjs_highcharts_Color_commonjs2_highcharts_Color_root_Highcharts_Color_default = /*#__PURE__*/__webpack_require__.n(highcharts_Color_commonjs_highcharts_Color_commonjs2_highcharts_Color_root_Highcharts_Color_);
;// ./code/es5/es-modules/Core/Axis/Color/ColorAxisComposition.js
/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


var color = (highcharts_Color_commonjs_highcharts_Color_commonjs2_highcharts_Color_root_Highcharts_Color_default()).parse;

var addEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).addEvent, extend = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).extend, merge = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).merge, pick = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pick, splat = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).splat;
/* *
 *
 *  Composition
 *
 * */
var ColorAxisComposition;
(function (ColorAxisComposition) {
    /* *
     *
     *  Declarations
     *
     * */
    /* *
     *
     *  Variables
     *
     * */
    var ColorAxisConstructor;
    /* *
     *
     *  Functions
     *
     * */
    /**
     * @private
     */
    function compose(ColorAxisClass, ChartClass, FxClass, LegendClass, SeriesClass) {
        var chartProto = ChartClass.prototype,
            fxProto = FxClass.prototype,
            seriesProto = SeriesClass.prototype;
        if (!chartProto.collectionsWithUpdate.includes('colorAxis')) {
            ColorAxisConstructor = ColorAxisClass;
            chartProto.collectionsWithUpdate.push('colorAxis');
            chartProto.collectionsWithInit.colorAxis = [
                chartProto.addColorAxis
            ];
            addEvent(ChartClass, 'afterCreateAxes', onChartAfterCreateAxes);
            wrapChartCreateAxis(ChartClass);
            fxProto.fillSetter = wrapFxFillSetter;
            fxProto.strokeSetter = wrapFxStrokeSetter;
            addEvent(LegendClass, 'afterGetAllItems', onLegendAfterGetAllItems);
            addEvent(LegendClass, 'afterColorizeItem', onLegendAfterColorizeItem);
            addEvent(LegendClass, 'afterUpdate', onLegendAfterUpdate);
            extend(seriesProto, {
                optionalAxis: 'colorAxis',
                translateColors: seriesTranslateColors
            });
            extend(seriesProto.pointClass.prototype, {
                setVisible: pointSetVisible
            });
            addEvent(SeriesClass, 'afterTranslate', onSeriesAfterTranslate, { order: 1 });
            addEvent(SeriesClass, 'bindAxes', onSeriesBindAxes);
        }
    }
    ColorAxisComposition.compose = compose;
    /**
     * Extend the chart createAxes method to also make the color axis.
     * @private
     */
    function onChartAfterCreateAxes() {
        var _this = this;
        var userOptions = this.userOptions;
        this.colorAxis = [];
        // If a `colorAxis` config is present in the user options (not in a
        // theme), instanciate it.
        if (userOptions.colorAxis) {
            userOptions.colorAxis = splat(userOptions.colorAxis);
            userOptions.colorAxis.map(function (axisOptions) { return (new ColorAxisConstructor(_this, axisOptions)); });
        }
    }
    /**
     * Add the color axis. This also removes the axis' own series to prevent
     * them from showing up individually.
     * @private
     */
    function onLegendAfterGetAllItems(e) {
        var _this = this;
        var colorAxes = this.chart.colorAxis || [],
            destroyItem = function (item) {
                var i = e.allItems.indexOf(item);
            if (i !== -1) {
                // #15436
                _this.destroyItem(e.allItems[i]);
                e.allItems.splice(i, 1);
            }
        };
        var colorAxisItems = [],
            options,
            i;
        colorAxes.forEach(function (colorAxis) {
            options = colorAxis.options;
            if (options === null || options === void 0 ? void 0 : options.showInLegend) {
                // Data classes
                if (options.dataClasses && options.visible) {
                    colorAxisItems = colorAxisItems.concat(colorAxis.getDataClassLegendSymbols());
                    // Gradient legend
                }
                else if (options.visible) {
                    // Add this axis on top
                    colorAxisItems.push(colorAxis);
                }
                // If dataClasses are defined or showInLegend option is not set
                // to true, do not add color axis' series to legend.
                colorAxis.series.forEach(function (series) {
                    if (!series.options.showInLegend || options.dataClasses) {
                        if (series.options.legendType === 'point') {
                            series.points.forEach(function (point) {
                                destroyItem(point);
                            });
                        }
                        else {
                            destroyItem(series);
                        }
                    }
                });
            }
        });
        i = colorAxisItems.length;
        while (i--) {
            e.allItems.unshift(colorAxisItems[i]);
        }
    }
    /**
     * @private
     */
    function onLegendAfterColorizeItem(e) {
        if (e.visible && e.item.legendColor) {
            e.item.legendItem.symbol.attr({
                fill: e.item.legendColor
            });
        }
    }
    /**
     * Updates in the legend need to be reflected in the color axis. (#6888)
     * @private
     */
    function onLegendAfterUpdate(e) {
        var _a;
        (_a = this.chart.colorAxis) === null || _a === void 0 ? void 0 : _a.forEach(function (colorAxis) {
            colorAxis.update({}, e.redraw);
        });
    }
    /**
     * Calculate and set colors for points.
     * @private
     */
    function onSeriesAfterTranslate() {
        var _a;
        if (((_a = this.chart.colorAxis) === null || _a === void 0 ? void 0 : _a.length) ||
            this.colorAttribs) {
            this.translateColors();
        }
    }
    /**
     * Add colorAxis to series axisTypes.
     * @private
     */
    function onSeriesBindAxes() {
        var axisTypes = this.axisTypes;
        if (!axisTypes) {
            this.axisTypes = ['colorAxis'];
        }
        else if (axisTypes.indexOf('colorAxis') === -1) {
            axisTypes.push('colorAxis');
        }
    }
    /**
     * Set the visibility of a single point
     * @private
     * @function Highcharts.colorPointMixin.setVisible
     * @param {boolean} visible
     */
    function pointSetVisible(vis) {
        var point = this,
            method = vis ? 'show' : 'hide';
        point.visible = point.options.visible = Boolean(vis);
        // Show and hide associated elements
        ['graphic', 'dataLabel'].forEach(function (key) {
            if (point[key]) {
                point[key][method]();
            }
        });
        this.series.buildKDTree(); // Rebuild kdtree #13195
    }
    ColorAxisComposition.pointSetVisible = pointSetVisible;
    /**
     * In choropleth maps, the color is a result of the value, so this needs
     * translation too
     * @private
     * @function Highcharts.colorSeriesMixin.translateColors
     */
    function seriesTranslateColors() {
        var series = this,
            points = this.getPointsCollection(), // #17945
            nullColor = this.options.nullColor,
            colorAxis = this.colorAxis,
            colorKey = this.colorKey;
        points.forEach(function (point) {
            var value = point.getNestedProperty(colorKey),
                color = point.options.color || (point.isNull || point.value === null ?
                    nullColor :
                    (colorAxis && typeof value !== 'undefined') ?
                        colorAxis.toColor(value,
                point) :
                        point.color || series.color);
            if (color && point.color !== color) {
                point.color = color;
                if (series.options.legendType === 'point' &&
                    point.legendItem &&
                    point.legendItem.label) {
                    series.chart.legend.colorizeItem(point, point.visible);
                }
            }
        });
    }
    /**
     * @private
     */
    function wrapChartCreateAxis(ChartClass) {
        var superCreateAxis = ChartClass.prototype.createAxis;
        ChartClass.prototype.createAxis = function (type, options) {
            var chart = this;
            if (type !== 'colorAxis') {
                return superCreateAxis.apply(chart, arguments);
            }
            var axis = new ColorAxisConstructor(chart,
                merge(options.axis, {
                    index: chart[type].length,
                    isX: false
                }));
            chart.isDirtyLegend = true;
            // Clear before 'bindAxes' (#11924)
            chart.axes.forEach(function (axis) {
                axis.series = [];
            });
            chart.series.forEach(function (series) {
                series.bindAxes();
                series.isDirtyData = true;
            });
            if (pick(options.redraw, true)) {
                chart.redraw(options.animation);
            }
            return axis;
        };
    }
    /**
     * Handle animation of the color attributes directly.
     * @private
     */
    function wrapFxFillSetter() {
        this.elem.attr('fill', color(this.start).tweenTo(color(this.end), this.pos), void 0, true);
    }
    /**
     * Handle animation of the color attributes directly.
     * @private
     */
    function wrapFxStrokeSetter() {
        this.elem.attr('stroke', color(this.start).tweenTo(color(this.end), this.pos), void 0, true);
    }
})(ColorAxisComposition || (ColorAxisComposition = {}));
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Color_ColorAxisComposition = (ColorAxisComposition);

;// ./code/es5/es-modules/Series/Tilemap/TilemapPoint.js
/* *
 *
 *  Tilemaps module
 *
 *  (c) 2010-2025 Highsoft AS
 *  Author: Øystein Moseng
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


var Point = (highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default()).series.prototype.pointClass, HeatmapPoint = (highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default()).seriesTypes.heatmap.prototype.pointClass;

var TilemapPoint_extend = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).extend;
/* *
 *
 *  Class
 *
 * */
var TilemapPoint = /** @class */ (function (_super) {
    __extends(TilemapPoint, _super);
    function TilemapPoint() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * @private
     * @function Highcharts.Point#haloPath
     */
    TilemapPoint.prototype.haloPath = function () {
        return this.series.tileShape.haloPath.apply(this, arguments);
    };
    return TilemapPoint;
}(HeatmapPoint));
TilemapPoint_extend(TilemapPoint.prototype, {
    setState: Point.prototype.setState,
    setVisible: Color_ColorAxisComposition.pointSetVisible
});
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Tilemap_TilemapPoint = (TilemapPoint);

;// ./code/es5/es-modules/Series/Tilemap/TilemapSeriesDefaults.js
/* *
 *
 *  Tilemaps module
 *
 *  (c) 2010-2025 Highsoft AS
 *  Author: Øystein Moseng
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
 * A tilemap series is a type of heatmap where the tile shapes are
 * configurable.
 *
 * @sample highcharts/demo/honeycomb-usa/
 *         Honeycomb tilemap, USA
 * @sample maps/plotoptions/honeycomb-brazil/
 *         Honeycomb tilemap, Brazil
 * @sample maps/plotoptions/honeycomb-china/
 *         Honeycomb tilemap, China
 * @sample maps/plotoptions/honeycomb-europe/
 *         Honeycomb tilemap, Europe
 * @sample maps/demo/circlemap-africa/
 *         Circlemap tilemap, Africa
 * @sample maps/demo/diamondmap
 *         Diamondmap tilemap
 *
 * @extends      plotOptions.heatmap
 * @since        6.0.0
 * @excluding    jitter, joinBy, shadow, allAreas, mapData, marker, data,
 *               dataSorting, boostThreshold, boostBlending
 * @product      highcharts highmaps
 * @requires     modules/tilemap
 * @optionparent plotOptions.tilemap
 */
var TilemapSeriesDefaults = {
    // Remove marker from tilemap default options, as it was before
    // heatmap refactoring.
    marker: null,
    states: {
        hover: {
            halo: {
                enabled: true,
                size: 2,
                opacity: 0.5,
                attributes: {
                    zIndex: 3
                }
            }
        }
    },
    /**
     * The padding between points in the tilemap.
     *
     * @sample maps/plotoptions/tilemap-pointpadding
     *         Point padding on tiles
     */
    pointPadding: 2,
    /**
     * The column size - how many X axis units each column in the tilemap
     * should span. Works as in [Heatmaps](#plotOptions.heatmap.colsize).
     *
     * @sample {highcharts} maps/demo/heatmap/
     *         One day
     * @sample {highmaps} maps/demo/heatmap/
     *         One day
     *
     * @type      {number}
     * @default   1
     * @product   highcharts highmaps
     * @apioption plotOptions.tilemap.colsize
     */
    /**
     * The row size - how many Y axis units each tilemap row should span.
     * Analogous to [colsize](#plotOptions.tilemap.colsize).
     *
     * @sample {highcharts} maps/demo/heatmap/
     *         1 by default
     * @sample {highmaps} maps/demo/heatmap/
     *         1 by default
     *
     * @type      {number}
     * @default   1
     * @product   highcharts highmaps
     * @apioption plotOptions.tilemap.rowsize
     */
    /**
     * The shape of the tiles in the tilemap. Possible values are `hexagon`,
     * `circle`, `diamond`, and `square`.
     *
     * @sample maps/demo/circlemap-africa
     *         Circular tile shapes
     * @sample maps/demo/diamondmap
     *         Diamond tile shapes
     *
     * @type {Highcharts.TilemapShapeValue}
     */
    tileShape: 'hexagon'
};
/**
 * A `tilemap` series. If the [type](#series.tilemap.type) option is
 * not specified, it is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.tilemap
 * @excluding allAreas, dataParser, dataURL, joinBy, mapData, marker,
 *            pointRange, shadow, stack, dataSorting, boostThreshold,
 *            boostBlending
 * @product   highcharts highmaps
 * @requires  modules/tilemap
 * @apioption series.tilemap
 */
/**
 * An array of data points for the series. For the `tilemap` series
 * type, points can be given in the following ways:
 *
 * 1. An array of arrays with 3 or 2 values. In this case, the values correspond
 *    to `x,y,value`. If the first value is a string, it is applied as the name
 *    of the point, and the `x` value is inferred. The `x` value can also be
 *    omitted, in which case the inner arrays should be of length 2\. Then the
 *    `x` value is automatically calculated, either starting at 0 and
 *    incremented by 1, or from `pointStart` and `pointInterval` given in the
 *    series options.
 *    ```js
 *    data: [
 *        [0, 9, 7],
 *        [1, 10, 4],
 *        [2, 6, 3]
 *    ]
 *    ```
 *
 * 2. An array of objects with named values. The objects are point configuration
 *    objects as seen below. If the total number of data points exceeds the
 *    series' [turboThreshold](#series.tilemap.turboThreshold), this option is
 *    not available.
 *    ```js
 *    data: [{
 *        x: 1,
 *        y: 3,
 *        value: 10,
 *        name: "Point2",
 *        color: "#00FF00"
 *    }, {
 *        x: 1,
 *        y: 7,
 *        value: 10,
 *        name: "Point1",
 *        color: "#FF00FF"
 *    }]
 *    ```
 *
 * Note that for some [tileShapes](#plotOptions.tilemap.tileShape) the grid
 * coordinates are offset.
 *
 * @sample maps/series/tilemap-gridoffset
 *         Offset grid coordinates
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
 * @extends   series.heatmap.data
 * @excluding marker
 * @product   highcharts highmaps
 * @apioption series.tilemap.data
 */
/**
 * The color of the point. In tilemaps the point color is rarely set
 * explicitly, as we use the color to denote the `value`. Options for
 * this are set in the [colorAxis](#colorAxis) configuration.
 *
 * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
 * @product   highcharts highmaps
 * @apioption series.tilemap.data.color
 */
/**
 * The x coordinate of the point.
 *
 * Note that for some [tileShapes](#plotOptions.tilemap.tileShape) the grid
 * coordinates are offset.
 *
 * @sample maps/series/tilemap-gridoffset
 *         Offset grid coordinates
 *
 * @type      {number}
 * @product   highcharts highmaps
 * @apioption series.tilemap.data.x
 */
/**
 * The y coordinate of the point.
 *
 * Note that for some [tileShapes](#plotOptions.tilemap.tileShape) the grid
 * coordinates are offset.
 *
 * @sample maps/series/tilemap-gridoffset
 *         Offset grid coordinates
 *
 * @type      {number}
 * @product   highcharts highmaps
 * @apioption series.tilemap.data.y
 */
''; // Keeps doclets above detached
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Tilemap_TilemapSeriesDefaults = (TilemapSeriesDefaults);

;// ./code/es5/es-modules/Series/Tilemap/TilemapShapes.js
/* *
 *
 *  Tilemaps module
 *
 *  (c) 2010-2025 Highsoft AS
 *  Author: Øystein Moseng
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


var noop = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).noop;

var _a = (highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default()).seriesTypes, HeatmapSeries = _a.heatmap, ScatterSeries = _a.scatter;

var clamp = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).clamp, TilemapShapes_pick = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pick;
/* *
 *
 *  Functions
 *
 * */
/**
 * Utility func to get padding definition from tile size division
 * @private
 */
function tilePaddingFromTileSize(series, xDiv, yDiv) {
    var options = series.options;
    return {
        xPad: (options.colsize || 1) / -xDiv,
        yPad: (options.rowsize || 1) / -yDiv
    };
}
/* *
 *
 *  Registry
 *
 * */
/**
 * Map of shape types.
 * @private
 */
var TilemapShapes = {
    // Hexagon shape type.
    hexagon: {
        alignDataLabel: ScatterSeries.prototype.alignDataLabel,
        getSeriesPadding: function (series) {
            return tilePaddingFromTileSize(series, 3, 2);
        },
        haloPath: function (size) {
            if (!size) {
                return [];
            }
            var hexagon = this.tileEdges;
            return [
                ['M', hexagon.x2 - size, hexagon.y1 + size],
                ['L', hexagon.x3 + size, hexagon.y1 + size],
                ['L', hexagon.x4 + size * 1.5, hexagon.y2],
                ['L', hexagon.x3 + size, hexagon.y3 - size],
                ['L', hexagon.x2 - size, hexagon.y3 - size],
                ['L', hexagon.x1 - size * 1.5, hexagon.y2],
                ['Z']
            ];
        },
        translate: function () {
            var _a;
            var series = this, options = series.options, xAxis = series.xAxis, yAxis = series.yAxis, seriesPointPadding = options.pointPadding || 0, xPad = (options.colsize || 1) / 3, yPad = (options.rowsize || 1) / 2;
            var yShift;
            series.generatePoints();
            for (var _i = 0, _b = series.points; _i < _b.length; _i++) {
                var point = _b[_i];
                var x1 = clamp(Math.floor(xAxis.len -
                        xAxis.translate(point.x - xPad * 2, 0, 1, 0, 1)), -xAxis.len, 2 * xAxis.len),
                    x2 = clamp(Math.floor(xAxis.len -
                        xAxis.translate(point.x - xPad, 0, 1, 0, 1)), -xAxis.len, 2 * xAxis.len),
                    x3 = clamp(Math.floor(xAxis.len -
                        xAxis.translate(point.x + xPad, 0, 1, 0, 1)), -xAxis.len, 2 * xAxis.len),
                    x4 = clamp(Math.floor(xAxis.len -
                        xAxis.translate(point.x + xPad * 2, 0, 1, 0, 1)), -xAxis.len, 2 * xAxis.len),
                    y1 = clamp(Math.floor(yAxis.translate(point.y - yPad, 0, 1, 0, 1)), -yAxis.len, 2 * yAxis.len),
                    y2 = clamp(Math.floor(yAxis.translate(point.y, 0, 1, 0, 1)), -yAxis.len, 2 * yAxis.len),
                    y3 = clamp(Math.floor(yAxis.translate(point.y + yPad, 0, 1, 0, 1)), -yAxis.len, 2 * yAxis.len);
                var pointPadding = (_a = point.pointPadding) !== null && _a !== void 0 ? _a : seriesPointPadding, 
                    // We calculate the point padding of the midpoints to
                    // preserve the angles of the shape.
                    midPointPadding = pointPadding *
                        Math.abs(x2 - x1) / Math.abs(y3 - y2),
                    xMidPadding = xAxis.reversed ?
                        -midPointPadding : midPointPadding,
                    xPointPadding = xAxis.reversed ?
                        -pointPadding : pointPadding,
                    yPointPadding = yAxis.reversed ?
                        -pointPadding : pointPadding;
                // Shift y-values for every second grid column
                if (point.x % 2) {
                    yShift = yShift || Math.round(Math.abs(y3 - y1) / 2) *
                        // We have to reverse the shift for reversed y-axes
                        (yAxis.reversed ? -1 : 1);
                    y1 += yShift;
                    y2 += yShift;
                    y3 += yShift;
                }
                // Set plotX and plotY for use in K-D-Tree and more
                point.plotX = point.clientX = (x2 + x3) / 2;
                point.plotY = y2;
                // Apply point padding to translated coordinates
                x1 += xMidPadding + xPointPadding;
                x2 += xPointPadding;
                x3 -= xPointPadding;
                x4 -= xMidPadding + xPointPadding;
                y1 -= yPointPadding;
                y3 += yPointPadding;
                // Store points for halo creation
                point.tileEdges = {
                    x1: x1, x2: x2, x3: x3, x4: x4, y1: y1, y2: y2, y3: y3
                };
                // Finally set the shape for this point
                point.shapeType = 'path';
                point.shapeArgs = {
                    d: [
                        ['M', x2, y1],
                        ['L', x3, y1],
                        ['L', x4, y2],
                        ['L', x3, y3],
                        ['L', x2, y3],
                        ['L', x1, y2],
                        ['Z']
                    ]
                };
            }
            series.translateColors();
        }
    },
    // Diamond shape type.
    diamond: {
        alignDataLabel: ScatterSeries.prototype.alignDataLabel,
        getSeriesPadding: function (series) {
            return tilePaddingFromTileSize(series, 2, 2);
        },
        haloPath: function (size) {
            if (!size) {
                return [];
            }
            var diamond = this.tileEdges;
            return [
                ['M', diamond.x2, diamond.y1 + size],
                ['L', diamond.x3 + size, diamond.y2],
                ['L', diamond.x2, diamond.y3 - size],
                ['L', diamond.x1 - size, diamond.y2],
                ['Z']
            ];
        },
        translate: function () {
            var series = this,
                options = series.options,
                xAxis = series.xAxis,
                yAxis = series.yAxis,
                seriesPointPadding = options.pointPadding || 0,
                xPad = (options.colsize || 1),
                yPad = (options.rowsize || 1) / 2;
            var yShift;
            series.generatePoints();
            for (var _i = 0, _a = series.points; _i < _a.length; _i++) {
                var point = _a[_i];
                var x1 = clamp(Math.round(xAxis.len -
                        xAxis.translate(point.x - xPad, 0, 1, 0, 0)), -xAxis.len, 2 * xAxis.len),
                    x3 = clamp(Math.round(xAxis.len -
                        xAxis.translate(point.x + xPad, 0, 1, 0, 0)), -xAxis.len, 2 * xAxis.len),
                    y1 = clamp(Math.round(yAxis.translate(point.y - yPad, 0, 1, 0, 0)), -yAxis.len, 2 * yAxis.len),
                    y2 = clamp(Math.round(yAxis.translate(point.y, 0, 1, 0, 0)), -yAxis.len, 2 * yAxis.len),
                    y3 = clamp(Math.round(yAxis.translate(point.y + yPad, 0, 1, 0, 0)), -yAxis.len, 2 * yAxis.len);
                var x2 = clamp(Math.round(xAxis.len -
                        xAxis.translate(point.x, 0, 1, 0, 0)), -xAxis.len, 2 * xAxis.len),
                    pointPadding = TilemapShapes_pick(point.pointPadding,
                    seriesPointPadding), 
                    // We calculate the point padding of the midpoints to
                    // preserve the angles of the shape.
                    midPointPadding = pointPadding *
                        Math.abs(x2 - x1) / Math.abs(y3 - y2),
                    xPointPadding = xAxis.reversed ?
                        -midPointPadding : midPointPadding,
                    yPointPadding = yAxis.reversed ?
                        -pointPadding : pointPadding;
                // Shift y-values for every second grid column
                // We have to reverse the shift for reversed y-axes
                if (point.x % 2) {
                    yShift = Math.abs(y3 - y1) / 2 * (yAxis.reversed ? -1 : 1);
                    y1 += yShift;
                    y2 += yShift;
                    y3 += yShift;
                }
                // Set plotX and plotY for use in K-D-Tree and more
                point.plotX = point.clientX = x2;
                point.plotY = y2;
                // Apply point padding to translated coordinates
                x1 += xPointPadding;
                x3 -= xPointPadding;
                y1 -= yPointPadding;
                y3 += yPointPadding;
                // Store points for halo creation
                point.tileEdges = {
                    x1: x1, x2: x2, x3: x3, y1: y1, y2: y2, y3: y3
                };
                // Set this point's shape parameters
                point.shapeType = 'path';
                point.shapeArgs = {
                    d: [
                        ['M', x2, y1],
                        ['L', x3, y2],
                        ['L', x2, y3],
                        ['L', x1, y2],
                        ['Z']
                    ]
                };
            }
            series.translateColors();
        }
    },
    // Circle shape type.
    circle: {
        alignDataLabel: ScatterSeries.prototype.alignDataLabel,
        getSeriesPadding: function (series) {
            return tilePaddingFromTileSize(series, 2, 2);
        },
        haloPath: function (size) {
            return ScatterSeries.prototype.pointClass.prototype.haloPath
                .call(this, size + (size && this.radius));
        },
        translate: function () {
            var series = this,
                options = series.options,
                xAxis = series.xAxis,
                yAxis = series.yAxis,
                seriesPointPadding = options.pointPadding || 0,
                yRadius = (options.rowsize || 1) / 2,
                colsize = (options.colsize || 1);
            var colsizePx,
                yRadiusPx,
                xRadiusPx,
                radius,
                forceNextRadiusCompute = false;
            series.generatePoints();
            for (var _i = 0, _a = series.points; _i < _a.length; _i++) {
                var point = _a[_i];
                var x = clamp(Math.round(xAxis.len -
                        xAxis.translate(point.x, 0, 1, 0, 0)), -xAxis.len, 2 * xAxis.len);
                var pointPadding = seriesPointPadding,
                    hasPerPointPadding = false,
                    y = clamp(Math.round(yAxis.translate(point.y, 0, 1, 0, 0)), -yAxis.len, 2 * yAxis.len);
                // If there is point padding defined on a single point, add it
                if (typeof point.pointPadding !== 'undefined') {
                    pointPadding = point.pointPadding;
                    hasPerPointPadding = true;
                    forceNextRadiusCompute = true;
                }
                // Find radius if not found already.
                // Use the smallest one (x vs y) to avoid overlap.
                // Note that the radius will be recomputed for each series.
                // Ideal (max) x radius is dependent on y radius:
                /*
                                * (circle 2)

                                        * (circle 3)
                                        |    yRadiusPx
                    (circle 1)    *-------|
                                 colsizePx

                    The distance between circle 1 and 3 (and circle 2 and 3) is
                    2r, which is the hypotenuse of the triangle created by
                    colsizePx and yRadiusPx. If the distance between circle 2
                    and circle 1 is less than 2r, we use half of that distance
                    instead (yRadiusPx).
                */
                if (!radius || forceNextRadiusCompute) {
                    colsizePx = Math.abs(clamp(Math.floor(xAxis.len -
                        xAxis.translate(point.x + colsize, 0, 1, 0, 0)), -xAxis.len, 2 * xAxis.len) - x);
                    yRadiusPx = Math.abs(clamp(Math.floor(yAxis.translate(point.y + yRadius, 0, 1, 0, 0)), -yAxis.len, 2 * yAxis.len) - y);
                    xRadiusPx = Math.floor(Math.sqrt((colsizePx * colsizePx + yRadiusPx * yRadiusPx)) / 2);
                    radius = Math.min(colsizePx, xRadiusPx, yRadiusPx) - pointPadding;
                    // If we have per point padding we need to always compute
                    // the radius for this point and the next. If we used to
                    // have per point padding but don't anymore, don't force
                    // compute next radius.
                    if (forceNextRadiusCompute && !hasPerPointPadding) {
                        forceNextRadiusCompute = false;
                    }
                }
                // Shift y-values for every second grid column.
                // Note that we always use the optimal y axis radius for this.
                // Also note: We have to reverse the shift for reversed y-axes.
                if (point.x % 2) {
                    y += yRadiusPx * (yAxis.reversed ? -1 : 1);
                }
                // Set plotX and plotY for use in K-D-Tree and more
                point.plotX = point.clientX = x;
                point.plotY = y;
                // Save radius for halo
                point.radius = radius;
                // Set this point's shape parameters
                point.shapeType = 'circle';
                point.shapeArgs = {
                    x: x,
                    y: y,
                    r: radius
                };
            }
            series.translateColors();
        }
    },
    // Square shape type.
    square: {
        alignDataLabel: HeatmapSeries.prototype.alignDataLabel,
        translate: HeatmapSeries.prototype.translate,
        getSeriesPadding: noop,
        haloPath: HeatmapSeries.prototype.pointClass.prototype.haloPath
    }
};
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Tilemap_TilemapShapes = (TilemapShapes);

;// ./code/es5/es-modules/Series/Tilemap/TilemapSeries.js
/* *
 *
 *  Tilemaps module
 *
 *  (c) 2010-2025 Highsoft AS
 *  Author: Øystein Moseng
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

var TilemapSeries_extends = (undefined && undefined.__extends) || (function () {
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

var composed = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).composed, TilemapSeries_noop = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).noop;

var TilemapSeries_a = (highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default()).seriesTypes, ColumnSeries = TilemapSeries_a.column, TilemapSeries_HeatmapSeries = TilemapSeries_a.heatmap, TilemapSeries_ScatterSeries = TilemapSeries_a.scatter;




var TilemapSeries_addEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).addEvent, TilemapSeries_extend = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).extend, TilemapSeries_merge = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).merge, pushUnique = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pushUnique;
/* *
 *
 *  Functions
 *
 * */
/**
 * Extension to add pixel padding for series. Uses getSeriesPixelPadding on each
 * series and adds the largest padding required. If no series has this function
 * defined, we add nothing.
 * @private
 */
function onAxisAfterSetAxisTranslation() {
    if (this.recomputingForTilemap || this.coll === 'colorAxis') {
        return;
    }
    var axis = this, 
        // Find which series' padding to use
        seriesPadding = axis.series
            .map(function (series) {
            return series.getSeriesPixelPadding &&
                series.getSeriesPixelPadding(axis);
    })
        .reduce(function (a, b) {
        return (a && a.padding) > (b && b.padding) ?
            a :
            b;
    }, void 0) ||
        {
            padding: 0,
            axisLengthFactor: 1
        }, lengthPadding = Math.round(seriesPadding.padding * seriesPadding.axisLengthFactor);
    // Don't waste time on this if we're not adding extra padding
    if (seriesPadding.padding) {
        // Recompute translation with new axis length now (minus padding)
        axis.len -= lengthPadding;
        axis.recomputingForTilemap = true;
        axis.setAxisTranslation();
        delete axis.recomputingForTilemap;
        axis.minPixelPadding += seriesPadding.padding;
        axis.len += lengthPadding;
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
 * @name Highcharts.seriesTypes.tilemap
 *
 * @augments Highcharts.Series
 */
var TilemapSeries = /** @class */ (function (_super) {
    TilemapSeries_extends(TilemapSeries, _super);
    function TilemapSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* *
     *
     *  Static Functions
     *
     * */
    TilemapSeries.compose = function (AxisClass) {
        if (pushUnique(composed, 'TilemapSeries')) {
            TilemapSeries_addEvent(AxisClass, 'afterSetAxisTranslation', onAxisAfterSetAxisTranslation);
        }
    };
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Use the shape's defined data label alignment function.
     * @private
     */
    TilemapSeries.prototype.alignDataLabel = function () {
        return this.tileShape.alignDataLabel.apply(this, arguments);
    };
    TilemapSeries.prototype.drawPoints = function () {
        // In styled mode, use CSS, otherwise the fill used in the style
        // sheet will take precedence over the fill attribute.
        ColumnSeries.prototype.drawPoints.call(this);
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            if (point.graphic) {
                point.graphic[this.chart.styledMode ? 'css' : 'animate'](this.colorAttribs(point));
            }
        }
    };
    /**
     * Get metrics for padding of axis for this series.
     * @private
     */
    TilemapSeries.prototype.getSeriesPixelPadding = function (axis) {
        var isX = axis.isXAxis,
            padding = this.tileShape.getSeriesPadding(this);
        // If the shape type does not require padding, return no-op padding
        if (!padding) {
            return {
                padding: 0,
                axisLengthFactor: 1
            };
        }
        // Use translate to compute how far outside the points we
        // draw, and use this difference as padding.
        var coord1 = Math.round(axis.translate(isX ?
                padding.xPad * 2 :
                padding.yPad, 0, 1, 0, 1));
        var coord2 = Math.round(axis.translate(isX ? padding.xPad : 0, 0, 1, 0, 1));
        return {
            padding: (axis.single ? // If there is only one tick adjust padding #18647
                Math.abs(coord1 - coord2) / 2 :
                Math.abs(coord1 - coord2)) || 0,
            // Offset the yAxis length to compensate for shift. Setting the
            // length factor to 2 would add the same margin to max as min.
            // Now we only add a slight bit of the min margin to max, as we
            // don't actually draw outside the max bounds. For the xAxis we
            // draw outside on both sides so we add the same margin to min
            // and max.
            axisLengthFactor: isX ? 2 : 1.1
        };
    };
    /**
     * Set tile shape object on series.
     * @private
     */
    TilemapSeries.prototype.setOptions = function () {
        // Call original function
        var ret = _super.prototype.setOptions.apply(this,
            arguments);
        this.tileShape = Tilemap_TilemapShapes[ret.tileShape];
        return ret;
    };
    /**
     * Use translate from tileShape.
     * @private
     */
    TilemapSeries.prototype.translate = function () {
        return this.tileShape.translate.apply(this, arguments);
    };
    /* *
     *
     *  Static Properties
     *
     * */
    TilemapSeries.defaultOptions = TilemapSeries_merge(TilemapSeries_HeatmapSeries.defaultOptions, Tilemap_TilemapSeriesDefaults);
    return TilemapSeries;
}(TilemapSeries_HeatmapSeries));
TilemapSeries_extend(TilemapSeries.prototype, {
    // Revert the noop on getSymbol.
    getSymbol: TilemapSeries_noop,
    // Use drawPoints, markerAttribs, pointAttribs methods from the old
    // heatmap implementation.
    // TODO: Consider standardizing heatmap and tilemap into more
    // consistent form.
    markerAttribs: TilemapSeries_ScatterSeries.prototype.markerAttribs,
    pointAttribs: ColumnSeries.prototype.pointAttribs,
    pointClass: Tilemap_TilemapPoint
});
highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default().registerSeriesType('tilemap', TilemapSeries);
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Tilemap_TilemapSeries = (TilemapSeries);
/* *
 *
 *  API Declarations
 *
 * */
/**
 * @typedef {"circle"|"diamond"|"hexagon"|"square"} Highcharts.TilemapShapeValue
 */
''; // Keeps doclets above in JS file

;// ./code/es5/es-modules/masters/modules/tilemap.src.js




var G = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default());
Tilemap_TilemapSeries.compose(G.Axis);
/* harmony default export */ var tilemap_src = ((highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()));

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});