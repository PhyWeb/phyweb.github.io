/**
 * @license Highcharts JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/pyramid3d
 * @requires highcharts
 * @requires highcharts/highcharts-3d
 * @requires highcharts/modules/cylinder
 * @requires highcharts/modules/funnel3d
 *
 * Highcharts 3D funnel module
 *
 * (c) 2010-2025 Kacper Madej
 *
 * License: www.highcharts.com/license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("highcharts"), require("highcharts")["SeriesRegistry"]);
	else if(typeof define === 'function' && define.amd)
		define("highcharts/modules/pyramid3d", [["highcharts/highcharts"], ["highcharts/highcharts","SeriesRegistry"]], factory);
	else if(typeof exports === 'object')
		exports["highcharts/modules/pyramid3d"] = factory(require("highcharts"), require("highcharts")["SeriesRegistry"]);
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
  "default": function() { return /* binding */ pyramid3d_src; }
});

// EXTERNAL MODULE: external {"amd":["highcharts/highcharts"],"commonjs":["highcharts"],"commonjs2":["highcharts"],"root":["Highcharts"]}
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_ = __webpack_require__(944);
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default = /*#__PURE__*/__webpack_require__.n(highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_);
;// ./code/es5/es-modules/Series/Pyramid3D/Pyramid3DSeriesDefaults.js
/* *
 *
 *  Highcharts pyramid3d series module
 *
 *  (c) 2010-2025 Highsoft AS
 *  Author: Kacper Madej
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
 * A pyramid3d is a 3d version of pyramid series type. Pyramid charts are
 * a type of chart often used to visualize stages in a sales project,
 * where the top are the initial stages with the most clients.
 *
 * @sample highcharts/demo/pyramid3d/
 *         Pyramid3d
 *
 * @extends      plotOptions.funnel3d
 * @excluding    dataSorting, legendSymbolColor, neckHeight, neckWidth,
 * @product      highcharts
 * @since        7.1.0
 * @requires     highcharts-3d
 * @requires     modules/cylinder
 * @requires     modules/funnel3d
 * @requires     modules/pyramid3d
 * @optionparent plotOptions.pyramid3d
 */
var Pyramid3DSeriesDefaults = {
    /**
     * A reversed pyramid3d is funnel3d, but the latter supports neck
     * related options: neckHeight and neckWidth
     *
     * @product highcharts
     */
    reversed: true,
    neckHeight: 0,
    neckWidth: 0,
    dataLabels: {
        /**
         * @default top
         */
        verticalAlign: 'top'
    }
};
/**
 * A `pyramid3d` series. If the [type](#series.pyramid3d.type) option is
 * not specified, it is inherited from [chart.type](#chart.type).
 *
 * @since     7.1.0
 * @extends   series,plotOptions.pyramid3d
 * @excluding allAreas,boostThreshold,colorAxis,compare,compareBase,dataSorting
 * @product   highcharts
 * @sample    {highcharts} highcharts/demo/pyramid3d/ Pyramid3d
 * @requires  modules/pyramid3d
 * @apioption series.pyramid3d
 */
/**
 * An array of data points for the series. For the `pyramid3d` series
 * type, points can be given in the following ways:
 *
 * 1.  An array of numerical values. In this case, the numerical values
 * will be interpreted as `y` options. The `x` values will be automatically
 * calculated, either starting at 0 and incremented by 1, or from `pointStart`
 * and `pointInterval` given in the series options. If the axis has
 * categories, these will be used. Example:
 *
 *  ```js
 *  data: [0, 5, 3, 5]
 *  ```
 *
 * 2.  An array of objects with named values. The following snippet shows only a
 * few settings, see the complete options set below. If the total number of data
 * points exceeds the series'
 * [turboThreshold](#series.pyramid3d.turboThreshold),
 * this option is not available.
 *
 *  ```js
 *     data: [{
 *         y: 2,
 *         name: "Point2",
 *         color: "#00FF00"
 *     }, {
 *         y: 4,
 *         name: "Point1",
 *         color: "#FF00FF"
 *     }]
 *  ```
 *
 * @sample {highcharts} highcharts/chart/reflow-true/
 *         Numerical values
 * @sample {highcharts} highcharts/series/data-array-of-arrays/
 *         Arrays of numeric x and y
 * @sample {highcharts} highcharts/series/data-array-of-arrays-datetime/
 *         Arrays of datetime x and y
 * @sample {highcharts} highcharts/series/data-array-of-name-value/
 *         Arrays of point.name and y
 * @sample {highcharts} highcharts/series/data-array-of-objects/
 *         Config objects
 *
 * @type      {Array<number|Array<number>|*>}
 * @extends   series.funnel3d.data
 * @product   highcharts
 * @apioption series.pyramid3d.data
 */
''; // Detachs doclets above
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Pyramid3D_Pyramid3DSeriesDefaults = (Pyramid3DSeriesDefaults);

// EXTERNAL MODULE: external {"amd":["highcharts/highcharts","SeriesRegistry"],"commonjs":["highcharts","SeriesRegistry"],"commonjs2":["highcharts","SeriesRegistry"],"root":["Highcharts","SeriesRegistry"]}
var highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_ = __webpack_require__(512);
var highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default = /*#__PURE__*/__webpack_require__.n(highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_);
;// ./code/es5/es-modules/Series/Pyramid3D/Pyramid3DSeries.js
/* *
 *
 *  Highcharts pyramid3d series module
 *
 *  (c) 2010-2025 Highsoft AS
 *  Author: Kacper Madej
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


var Funnel3DSeries = (highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default()).seriesTypes.funnel3d;

var merge = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).merge;
/* *
 *
 *  Class
 *
 * */
/**
 * The pyramid3d series type.
 *
 * @private
 * @class
 * @name Highcharts.seriesTypes.pyramid3d
 * @augments seriesTypes.funnel3d
 * @requires highcharts-3d
 * @requires modules/cylinder
 * @requires modules/funnel3d
 * @requires modules/pyramid3d
 */
var Pyramid3DSeries = /** @class */ (function (_super) {
    __extends(Pyramid3DSeries, _super);
    function Pyramid3DSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* *
     *
     *  Static Properties
     *
     * */
    Pyramid3DSeries.defaultOptions = merge(Funnel3DSeries.defaultOptions, Pyramid3D_Pyramid3DSeriesDefaults);
    return Pyramid3DSeries;
}(Funnel3DSeries));
highcharts_SeriesRegistry_commonjs_highcharts_SeriesRegistry_commonjs2_highcharts_SeriesRegistry_root_Highcharts_SeriesRegistry_default().registerSeriesType('pyramid3d', Pyramid3DSeries);
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var Pyramid3D_Pyramid3DSeries = ((/* unused pure expression or super */ null && (Pyramid3DSeries)));

;// ./code/es5/es-modules/masters/modules/pyramid3d.src.js




/* harmony default export */ var pyramid3d_src = ((highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()));

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});