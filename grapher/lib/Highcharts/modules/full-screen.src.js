/**
 * @license Highstock JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/full-screen
 * @requires highcharts
 *
 * Advanced Highcharts Stock tools
 *
 * (c) 2010-2025 Highsoft AS
 * Author: Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(root["_Highcharts"], root["_Highcharts"]["AST"]);
	else if(typeof define === 'function' && define.amd)
		define("highcharts/modules/full-screen", ["highcharts/highcharts"], function (amd1) {return factory(amd1,amd1["AST"]);});
	else if(typeof exports === 'object')
		exports["highcharts/modules/full-screen"] = factory(root["_Highcharts"], root["_Highcharts"]["AST"]);
	else
		root["Highcharts"] = factory(root["Highcharts"], root["Highcharts"]["AST"]);
})(typeof window === 'undefined' ? this : window, (__WEBPACK_EXTERNAL_MODULE__944__, __WEBPACK_EXTERNAL_MODULE__660__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 660:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__660__;

/***/ }),

/***/ 944:
/***/ ((module) => {

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
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ full_screen_src)
});

// EXTERNAL MODULE: external {"amd":["highcharts/highcharts"],"commonjs":["highcharts"],"commonjs2":["highcharts"],"root":["Highcharts"]}
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_ = __webpack_require__(944);
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default = /*#__PURE__*/__webpack_require__.n(highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_);
// EXTERNAL MODULE: external {"amd":["highcharts/highcharts","AST"],"commonjs":["highcharts","AST"],"commonjs2":["highcharts","AST"],"root":["Highcharts","AST"]}
var highcharts_AST_commonjs_highcharts_AST_commonjs2_highcharts_AST_root_Highcharts_AST_ = __webpack_require__(660);
var highcharts_AST_commonjs_highcharts_AST_commonjs2_highcharts_AST_root_Highcharts_AST_default = /*#__PURE__*/__webpack_require__.n(highcharts_AST_commonjs_highcharts_AST_commonjs2_highcharts_AST_root_Highcharts_AST_);
;// ./code/es-modules/Extensions/Exporting/Fullscreen.js
/* *
 *
 *  (c) 2009-2025 Rafal Sebestjanski
 *
 *  Full screen for Highcharts
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
/**
 * The module allows user to enable display chart in full screen mode.
 * Used in StockTools too.
 * Based on default solutions in browsers.
 */



const { composed } = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default());

const { addEvent, fireEvent, pushUnique } = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default());
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function onChartBeforeRender() {
    /**
     * @name Highcharts.Chart#fullscreen
     * @type {Highcharts.Fullscreen}
     * @requires modules/full-screen
     */
    this.fullscreen = new Fullscreen(this);
}
/* *
 *
 *  Class
 *
 * */
/**
 * Handles displaying chart's container in the fullscreen mode.
 *
 * **Note**: Fullscreen is not supported on iPhone due to iOS limitations.
 *
 * @class
 * @name Highcharts.Fullscreen
 *
 * @requires modules/exporting
 */
class Fullscreen {
    /* *
     *
     *  Static Functions
     *
     * */
    /**
     * Prepares the chart class to support fullscreen.
     *
     * @param {typeof_Highcharts.Chart} ChartClass
     * The chart class to decorate with fullscreen support.
     */
    static compose(ChartClass) {
        if (pushUnique(composed, 'Fullscreen')) {
            // Initialize fullscreen
            addEvent(ChartClass, 'beforeRender', onChartBeforeRender);
        }
    }
    /* *
     *
     *  Constructors
     *
     * */
    constructor(chart) {
        /**
         * Chart managed by the fullscreen controller.
         * @name Highcharts.Fullscreen#chart
         * @type {Highcharts.Chart}
         */
        this.chart = chart;
        /**
         * The flag is set to `true` when the chart is displayed in
         * the fullscreen mode.
         *
         * @name Highcharts.Fullscreen#isOpen
         * @type {boolean | undefined}
         * @since 8.0.1
         */
        this.isOpen = false;
        const container = chart.renderTo;
        // Hold event and methods available only for a current browser.
        if (!this.browserProps) {
            if (typeof container.requestFullscreen === 'function') {
                this.browserProps = {
                    fullscreenChange: 'fullscreenchange',
                    requestFullscreen: 'requestFullscreen',
                    exitFullscreen: 'exitFullscreen'
                };
            }
            else if (container.mozRequestFullScreen) {
                this.browserProps = {
                    fullscreenChange: 'mozfullscreenchange',
                    requestFullscreen: 'mozRequestFullScreen',
                    exitFullscreen: 'mozCancelFullScreen'
                };
            }
            else if (container.webkitRequestFullScreen) {
                this.browserProps = {
                    fullscreenChange: 'webkitfullscreenchange',
                    requestFullscreen: 'webkitRequestFullScreen',
                    exitFullscreen: 'webkitExitFullscreen'
                };
            }
            else if (container.msRequestFullscreen) {
                this.browserProps = {
                    fullscreenChange: 'MSFullscreenChange',
                    requestFullscreen: 'msRequestFullscreen',
                    exitFullscreen: 'msExitFullscreen'
                };
            }
        }
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Stops displaying the chart in fullscreen mode.
     * Exporting module required.
     *
     * @since       8.0.1
     *
     * @function    Highcharts.Fullscreen#close
     * @return      {void}
     * @requires    modules/full-screen
     */
    close() {
        const fullscreen = this, chart = fullscreen.chart, optionsChart = chart.options.chart;
        fireEvent(chart, 'fullscreenClose', null, function () {
            // Don't fire exitFullscreen() when user exited
            // using 'Escape' button.
            if (fullscreen.isOpen &&
                fullscreen.browserProps &&
                chart.container.ownerDocument instanceof Document) {
                chart.container.ownerDocument[fullscreen.browserProps.exitFullscreen]();
            }
            // Unbind event as it's necessary only before exiting
            // from fullscreen.
            if (fullscreen.unbindFullscreenEvent) {
                fullscreen.unbindFullscreenEvent = fullscreen
                    .unbindFullscreenEvent();
            }
            chart.setSize(fullscreen.origWidth, fullscreen.origHeight, false);
            fullscreen.origWidth = void 0;
            fullscreen.origHeight = void 0;
            optionsChart.width = fullscreen.origWidthOption;
            optionsChart.height = fullscreen.origHeightOption;
            fullscreen.origWidthOption = void 0;
            fullscreen.origHeightOption = void 0;
            fullscreen.isOpen = false;
            fullscreen.setButtonText();
        });
    }
    /**
     * Displays the chart in fullscreen mode.
     * When fired customly by user before exporting context button is created,
     * button's text will not be replaced - it's on the user side.
     * Exporting module required.
     *
     * @since       8.0.1
     *
     * @function Highcharts.Fullscreen#open
     * @return      {void}
     * @requires    modules/full-screen
     */
    open() {
        const fullscreen = this, chart = fullscreen.chart, optionsChart = chart.options.chart;
        fireEvent(chart, 'fullscreenOpen', null, function () {
            if (optionsChart) {
                fullscreen.origWidthOption = optionsChart.width;
                fullscreen.origHeightOption = optionsChart.height;
            }
            fullscreen.origWidth = chart.chartWidth;
            fullscreen.origHeight = chart.chartHeight;
            // Handle exitFullscreen() method when user clicks 'Escape' button.
            if (fullscreen.browserProps) {
                const unbindChange = addEvent(chart.container.ownerDocument, // Chart's document
                fullscreen.browserProps.fullscreenChange, function () {
                    // Handle lack of async of browser's
                    // fullScreenChange event.
                    if (fullscreen.isOpen) {
                        fullscreen.isOpen = false;
                        fullscreen.close();
                    }
                    else {
                        chart.setSize(null, null, false);
                        fullscreen.isOpen = true;
                        fullscreen.setButtonText();
                    }
                });
                const unbindDestroy = addEvent(chart, 'destroy', unbindChange);
                fullscreen.unbindFullscreenEvent = () => {
                    unbindChange();
                    unbindDestroy();
                };
                const promise = chart.renderTo[fullscreen.browserProps.requestFullscreen]();
                if (promise) {
                    promise['catch'](function () {
                        alert(// eslint-disable-line no-alert
                        'Full screen is not supported inside a frame.');
                    });
                }
            }
        });
    }
    /**
     * Replaces the exporting context button's text when toogling the
     * fullscreen mode.
     *
     * @private
     *
     * @since 8.0.1
     *
     * @requires modules/full-screen
     */
    setButtonText() {
        const chart = this.chart, exportDivElements = chart.exporting?.divElements, exportingOptions = chart.options.exporting, menuItems = (exportingOptions &&
            exportingOptions.buttons &&
            exportingOptions.buttons.contextButton.menuItems), lang = chart.options.lang;
        if (exportingOptions &&
            exportingOptions.menuItemDefinitions &&
            lang &&
            lang.exitFullscreen &&
            lang.viewFullscreen &&
            menuItems &&
            exportDivElements) {
            const exportDivElement = exportDivElements[menuItems.indexOf('viewFullscreen')];
            if (exportDivElement) {
                highcharts_AST_commonjs_highcharts_AST_commonjs2_highcharts_AST_root_Highcharts_AST_default().setElementHTML(exportDivElement, !this.isOpen ?
                    (exportingOptions.menuItemDefinitions.viewFullscreen
                        .text ||
                        lang.viewFullscreen) : lang.exitFullscreen);
            }
        }
    }
    /**
     * Toggles displaying the chart in fullscreen mode.
     * By default, when the exporting module is enabled, a context button with
     * a drop down menu in the upper right corner accesses this function.
     * Exporting module required.
     *
     * @since 8.0.1
     *
     * @sample      highcharts/members/chart-togglefullscreen/
     *              Toggle fullscreen mode from a HTML button
     *
     * @function Highcharts.Fullscreen#toggle
     * @requires    modules/full-screen
     */
    toggle() {
        const fullscreen = this;
        if (!fullscreen.isOpen) {
            fullscreen.open();
        }
        else {
            fullscreen.close();
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const Exporting_Fullscreen = (Fullscreen);
/* *
 *
 *  API Declarations
 *
 * */
/**
 * Gets fired when closing the fullscreen
 *
 * @callback Highcharts.FullScreenfullscreenCloseCallbackFunction
 *
 * @param {Highcharts.Chart} chart
 *        The chart on which the event occurred.
 *
 * @param {global.Event} event
 *        The event that occurred.
 */
/**
 * Gets fired when opening the fullscreen
 *
 * @callback Highcharts.FullScreenfullscreenOpenCallbackFunction
 *
 * @param {Highcharts.Chart} chart
 *        The chart on which the event occurred.
 *
 * @param {global.Event} event
 *        The event that occurred.
 */
(''); // Keeps doclets above separated from following code
/* *
 *
 *  API Options
 *
 * */
/**
 * Fires when a fullscreen is closed through the context menu item,
 * or a fullscreen is closed on the `Escape` button click,
 * or the `Chart.fullscreen.close` method.
 *
 * @sample highcharts/chart/events-fullscreen
 *         Title size change on fullscreen open
 *
 * @type      {Highcharts.FullScreenfullscreenCloseCallbackFunction}
 * @since     10.1.0
 * @context   Highcharts.Chart
 * @requires  modules/full-screen
 * @apioption chart.events.fullscreenClose
 */
/**
 * Fires when a fullscreen is opened through the context menu item,
 * or the `Chart.fullscreen.open` method.
 *
 * @sample highcharts/chart/events-fullscreen
 *         Title size change on fullscreen open
 *
 * @type      {Highcharts.FullScreenfullscreenOpenCallbackFunction}
 * @since     10.1.0
 * @context   Highcharts.Chart
 * @requires  modules/full-screen
 * @apioption chart.events.fullscreenOpen
 */
(''); // Keeps doclets above in transpiled file

;// ./code/es-modules/masters/modules/full-screen.src.js




const G = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default());
G.Fullscreen = G.Fullscreen || Exporting_Fullscreen;
G.Fullscreen.compose(G.Chart);
/* harmony default export */ const full_screen_src = ((highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()));

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});