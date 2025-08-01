/**
 * @license Highcharts JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/offline-exporting
 * @requires highcharts
 * @requires highcharts/modules/exporting
 *
 * Client side exporting module
 *
 * (c) 2015-2025 Torstein Honsi / Oystein Moseng
 *
 * License: www.highcharts.com/license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("highcharts"), require("highcharts")["AST"], require("highcharts")["Chart"]);
	else if(typeof define === 'function' && define.amd)
		define("highcharts/modules/offline-exporting", [["highcharts/highcharts"], ["highcharts/highcharts","AST"], ["highcharts/highcharts","Chart"]], factory);
	else if(typeof exports === 'object')
		exports["highcharts/modules/offline-exporting"] = factory(require("highcharts"), require("highcharts")["AST"], require("highcharts")["Chart"]);
	else
		root["Highcharts"] = factory(root["Highcharts"], root["Highcharts"]["AST"], root["Highcharts"]["Chart"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__944__, __WEBPACK_EXTERNAL_MODULE__660__, __WEBPACK_EXTERNAL_MODULE__960__) {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 660:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__660__;

/***/ }),

/***/ 944:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__944__;

/***/ }),

/***/ 960:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__960__;

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
  "default": function() { return /* binding */ offline_exporting_src; }
});

// EXTERNAL MODULE: external {"amd":["highcharts/highcharts"],"commonjs":["highcharts"],"commonjs2":["highcharts"],"root":["Highcharts"]}
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_ = __webpack_require__(944);
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default = /*#__PURE__*/__webpack_require__.n(highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_);
;// ./code/es5/es-modules/Extensions/DownloadURL.js
/* *
 *
 *  (c) 2015-2025 Oystein Moseng
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Mixin for downloading content in the browser
 *
 * */

/* *
 *
 *  Imports
 *
 * */

var isSafari = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).isSafari, win = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).win, doc = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).win.document;

var error = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).error;
/* *
 *
 *  Constants
 *
 * */
var domurl = win.URL || win.webkitURL || win;
/* *
 *
 *  Functions
 *
 * */
/**
 * Convert base64 dataURL to Blob if supported, otherwise returns undefined.
 *
 * @private
 * @function Highcharts.dataURLtoBlob
 *
 * @param {string} dataURL
 * URL to convert.
 *
 * @return {string | undefined}
 * Blob.
 */
function dataURLtoBlob(dataURL) {
    var parts = dataURL
            .replace(/filename=.*;/, '')
            .match(/data:([^;]*)(;base64)?,([A-Z+\d\/]+)/i);
    if (parts &&
        parts.length > 3 &&
        (win.atob) &&
        win.ArrayBuffer &&
        win.Uint8Array &&
        win.Blob &&
        (domurl.createObjectURL)) {
        // Try to convert data URL to Blob
        var binStr = win.atob(parts[3]),
            buf = new win.ArrayBuffer(binStr.length),
            binary = new win.Uint8Array(buf);
        for (var i = 0; i < binary.length; ++i) {
            binary[i] = binStr.charCodeAt(i);
        }
        return domurl
            .createObjectURL(new win.Blob([binary], { 'type': parts[1] }));
    }
}
/**
 * Download a data URL in the browser. Can also take a blob as first param.
 *
 * @private
 * @function Highcharts.downloadURL
 *
 * @param {string | global.URL} dataURL
 * The dataURL/Blob to download.
 * @param {string} filename
 * The name of the resulting file (w/extension).
 */
function downloadURL(dataURL, filename) {
    var nav = win.navigator,
        a = doc.createElement('a');
    // IE specific blob implementation
    // Don't use for normal dataURLs
    if (typeof dataURL !== 'string' &&
        !(dataURL instanceof String) &&
        nav.msSaveOrOpenBlob) {
        nav.msSaveOrOpenBlob(dataURL, filename);
        return;
    }
    dataURL = '' + dataURL;
    if (nav.userAgent.length > 1000 /* RegexLimits.shortLimit */) {
        throw new Error('Input too long');
    }
    var // Some browsers have limitations for data URL lengths. Try to convert
        // to Blob or fall back. Edge always needs that blob.
        isOldEdgeBrowser = /Edge\/\d+/.test(nav.userAgent), 
        // Safari on iOS needs Blob in order to download PDF
        safariBlob = (isSafari &&
            typeof dataURL === 'string' &&
            dataURL.indexOf('data:application/pdf') === 0);
    if (safariBlob || isOldEdgeBrowser || dataURL.length > 2000000) {
        dataURL = dataURLtoBlob(dataURL) || '';
        if (!dataURL) {
            throw new Error('Failed to convert to blob');
        }
    }
    // Try HTML5 download attr if supported
    if (typeof a.download !== 'undefined') {
        a.href = dataURL;
        a.download = filename; // HTML5 download attribute
        doc.body.appendChild(a);
        a.click();
        doc.body.removeChild(a);
    }
    else {
        // No download attr, just opening data URI
        try {
            if (!win.open(dataURL, 'chart')) {
                throw new Error('Failed to open window');
            }
        }
        catch (_a) {
            // If window.open failed, try location.href
            win.location.href = dataURL;
        }
    }
}
/**
 * Asynchronously downloads a script from a provided location.
 *
 * @private
 * @function Highcharts.getScript
 *
 * @param {string} scriptLocation
 * The location for the script to fetch.
 */
function getScript(scriptLocation) {
    return new Promise(function (resolve, reject) {
        var head = doc.getElementsByTagName('head')[0], script = doc.createElement('script');
        // Set type and location for the script
        script.type = 'text/javascript';
        script.src = scriptLocation;
        // Resolve in case of a succesful script fetching
        script.onload = function () {
            resolve();
        };
        // Reject in case of fail
        script.onerror = function () {
            reject(error("Error loading script ".concat(scriptLocation)));
        };
        // Append the newly created script
        head.appendChild(script);
    });
}
/* *
 *
 *  Default Export
 *
 * */
var DownloadURL = {
    dataURLtoBlob: dataURLtoBlob,
    downloadURL: downloadURL,
    getScript: getScript
};
/* harmony default export */ var Extensions_DownloadURL = (DownloadURL);

// EXTERNAL MODULE: external {"amd":["highcharts/highcharts","AST"],"commonjs":["highcharts","AST"],"commonjs2":["highcharts","AST"],"root":["Highcharts","AST"]}
var highcharts_AST_commonjs_highcharts_AST_commonjs2_highcharts_AST_root_Highcharts_AST_ = __webpack_require__(660);
var highcharts_AST_commonjs_highcharts_AST_commonjs2_highcharts_AST_root_Highcharts_AST_default = /*#__PURE__*/__webpack_require__.n(highcharts_AST_commonjs_highcharts_AST_commonjs2_highcharts_AST_root_Highcharts_AST_);
// EXTERNAL MODULE: external {"amd":["highcharts/highcharts","Chart"],"commonjs":["highcharts","Chart"],"commonjs2":["highcharts","Chart"],"root":["Highcharts","Chart"]}
var highcharts_Chart_commonjs_highcharts_Chart_commonjs2_highcharts_Chart_root_Highcharts_Chart_ = __webpack_require__(960);
var highcharts_Chart_commonjs_highcharts_Chart_commonjs2_highcharts_Chart_root_Highcharts_Chart_default = /*#__PURE__*/__webpack_require__.n(highcharts_Chart_commonjs_highcharts_Chart_commonjs2_highcharts_Chart_root_Highcharts_Chart_);
;// ./code/es5/es-modules/Extensions/OfflineExporting/OfflineExportingDefaults.js
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
 *  API Options
 *
 * */
/**
 * @optionparent exporting
 * @private
 */
var exporting = {};
/* *
 *
 *  Default Export
 *
 * */
var OfflineExportingDefaults = {
    exporting: exporting
};
/* harmony default export */ var OfflineExporting_OfflineExportingDefaults = (OfflineExportingDefaults);

;// ./code/es5/es-modules/Extensions/OfflineExporting/OfflineExporting.js
/* *
 *
 *  Client side exporting module
 *
 *  (c) 2015 Torstein Honsi / Oystein Moseng
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0,
        sent: function() { if (t[0] & 1) throw t[1]; return t[1]; },
        trys: [],
        ops: [] },
        f,
        y,
        t,
        g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};



var getOptions = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).getOptions, setOptions = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).setOptions;

var OfflineExporting_downloadURL = Extensions_DownloadURL.downloadURL, OfflineExporting_getScript = Extensions_DownloadURL.getScript;

var composed = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).composed, OfflineExporting_doc = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).doc, OfflineExporting_win = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).win;


var addEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).addEvent, extend = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).extend, pushUnique = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pushUnique;
/* *
 *
 *  Composition
 *
 * */
var OfflineExporting;
(function (OfflineExporting) {
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Composition function.
     *
     * @private
     * @function compose
     *
     * @param {ExportingClass} ExportingClass
     * Exporting class.
     *
     * @requires modules/exporting
     * @requires modules/offline-exporting
     */
    function compose(ExportingClass) {
        var _a,
            _b,
            _c;
        // Add the downloadSVG event to the Exporting class for local PDF export
        addEvent(ExportingClass, 'downloadSVG', function (e) {
            return __awaiter(this, void 0, void 0, function () {
                var svg,
                    exportingOptions,
                    exporting,
                    preventDefault,
                    _a,
                    type,
                    filename,
                    scale,
                    libURL,
                    error_1;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            svg = e.svg, exportingOptions = e.exportingOptions, exporting = e.exporting, preventDefault = e.preventDefault;
                            if (!((exportingOptions === null || exportingOptions === void 0 ? void 0 : exportingOptions.type) === 'application/pdf')) return [3 /*break*/, 9];
                            // Prevent the default export behavior
                            preventDefault === null || preventDefault === void 0 ? void 0 : preventDefault();
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 7, , 9]);
                            _a = highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default().Exporting.prepareImageOptions(exportingOptions), type = _a.type, filename = _a.filename, scale = _a.scale, libURL = _a.libURL;
                            if (!(type === 'application/pdf')) return [3 /*break*/, 6];
                            if (!!((_b = OfflineExporting_win.jspdf) === null || _b === void 0 ? void 0 : _b.jsPDF)) return [3 /*break*/, 4];
                            // Get jspdf
                            return [4 /*yield*/, OfflineExporting_getScript("" + libURL + "jspdf.js")];
                        case 2:
                            // Get jspdf
                            _c.sent();
                            // Get svg2pdf
                            return [4 /*yield*/, OfflineExporting_getScript("" + libURL + "svg2pdf.js")];
                        case 3:
                            // Get svg2pdf
                            _c.sent();
                            _c.label = 4;
                        case 4: 
                        // Call the PDF download if SVG element found
                        return [4 /*yield*/, downloadPDF(svg, scale, filename, exportingOptions === null || exportingOptions === void 0 ? void 0 : exportingOptions.pdfFont)];
                        case 5:
                            // Call the PDF download if SVG element found
                            _c.sent();
                            _c.label = 6;
                        case 6: return [3 /*break*/, 9];
                        case 7:
                            error_1 = _c.sent();
                            // Try to fallback to the server
                            return [4 /*yield*/, (exporting === null || exporting === void 0 ? void 0 : exporting.fallbackToServer(exportingOptions, error_1))];
                        case 8:
                            // Try to fallback to the server
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        });
        // Check the composition registry for the OfflineExporting
        if (!pushUnique(composed, 'OfflineExporting')) {
            return;
        }
        // Adding wrappers for the deprecated functions
        extend((highcharts_Chart_commonjs_highcharts_Chart_commonjs2_highcharts_Chart_root_Highcharts_Chart_default()).prototype, {
            exportChartLocal: function (exportingOptions, chartOptions) {
                return __awaiter(this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, ((_a = this.exporting) === null || _a === void 0 ? void 0 : _a.exportChart(exportingOptions, chartOptions))];
                            case 1:
                                _b.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            }
        });
        // Update with defaults of the offline exporting module
        setOptions(OfflineExporting_OfflineExportingDefaults);
        // Additionaly, extend the menuItems with the offline exporting variants
        var menuItems = (_c = (_b = (_a = getOptions().exporting) === null || _a === void 0 ? void 0 : _a.buttons) === null || _b === void 0 ? void 0 : _b.contextButton) === null || _c === void 0 ? void 0 : _c.menuItems;
        menuItems && menuItems.push('downloadPDF');
    }
    OfflineExporting.compose = compose;
    /**
     * Get data URL to an image of an SVG and call download on it options
     * object:
     * - **filename:** Name of resulting downloaded file without extension.
     * Default is `chart`.
     *
     * - **type:** File type of resulting download. Default is `image/png`.
     *
     * - **scale:** Scaling factor of downloaded image compared to source.
     * Default is `1`.
     * - **libURL:** URL pointing to location of dependency scripts to download
     * on demand. Default is the exporting.libURL option of the global
     * Highcharts options pointing to our server.
     *
     * @function Highcharts.downloadSVGLocal
     * @deprecated
     *
     * @param {string} svg
     * The generated SVG
     *
     * @param {Highcharts.ExportingOptions} options
     * The exporting options
     *
     */
    function downloadSVGLocal(svg, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default().Exporting.prototype.downloadSVG.call(void 0, svg, options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    OfflineExporting.downloadSVGLocal = downloadSVGLocal;
    /**
     * Converts an SVG string into a PDF file and triggers its download. This
     * function processes the SVG, applies necessary font adjustments, converts
     * it to a PDF, and initiates the file download.
     *
     * @private
     * @async
     * @function downloadPDF
     *
     * @param {string} svg
     * A string representation of the SVG markup to be converted into a PDF.
     * @param {number} scale
     * The scaling factor for the PDF output.
     * @param {string} filename
     * The name of the downloaded PDF file.
     * @param {Highcharts.PdfFontOptions} [pdfFont]
     * An optional object specifying URLs for different font variants (normal,
     * bold, italic, bolditalic).
     *
     * @return {Promise<void>}
     * A promise that resolves when the PDF has been successfully generated and
     * downloaded.
     *
     * @requires modules/exporting
     * @requires modules/offline-exporting
     */
    function downloadPDF(svg, scale, filename, pdfFont) {
        return __awaiter(this, void 0, void 0, function () {
            var svgNode,
                pdfData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        svgNode = preparePDF(svg, pdfFont);
                        if (!svgNode) return [3 /*break*/, 3];
                        // Loads all required fonts
                        return [4 /*yield*/, loadPdfFonts(svgNode, pdfFont)];
                    case 1:
                        // Loads all required fonts
                        _a.sent();
                        return [4 /*yield*/, svgToPdf(svgNode, 0, scale)];
                    case 2:
                        pdfData = _a.sent();
                        // Download the PDF
                        OfflineExporting_downloadURL(pdfData, filename);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Loads and registers custom fonts for PDF export if non-ASCII characters
     * are detected in the given SVG element. This function ensures that text
     * content with special characters is properly rendered in the exported PDF.
     *
     * It fetches font files (if provided in `pdfFont`), converts them to
     * base64, and registers them with jsPDF.
     *
     * @private
     * @function loadPdfFonts
     *
     * @param {SVGElement} svgElement
     * The generated SVG element containing the text content to be exported.
     * @param {Highcharts.PdfFontOptions} [pdfFont]
     * An optional object specifying URLs for different font variants (normal,
     * bold, italic, bolditalic). If non-ASCII characters are not detected,
     * fonts are not loaded.
     *
     * @requires modules/exporting
     * @requires modules/offline-exporting
     */
    function loadPdfFonts(svgElement, pdfFont) {
        return __awaiter(this, void 0, void 0, function () {
            var hasNonASCII,
                addFont,
                variants,
                normalBase64,
                _loop_1,
                _i,
                variants_1,
                variant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hasNonASCII = function (s) { return (
                        // eslint-disable-next-line no-control-regex
                        /[^\u0000-\u007F\u200B]+/.test(s)); };
                        addFont = function (variant, base64) {
                            OfflineExporting_win.jspdf.jsPDF.API.events.push([
                                'initialized',
                                function () {
                                    var _a;
                                    this.addFileToVFS(variant, base64);
                                    this.addFont(variant, 'HighchartsFont', variant);
                                    if (!((_a = this.getFontList()) === null || _a === void 0 ? void 0 : _a.HighchartsFont)) {
                                        this.setFont('HighchartsFont');
                                    }
                                }
                            ]);
                        };
                        // If there are no non-ASCII characters in the SVG, do not use bother
                        // downloading the font files
                        if (pdfFont && !hasNonASCII(svgElement.textContent || '')) {
                            pdfFont = void 0;
                        }
                        variants = ['normal', 'italic', 'bold', 'bolditalic'];
                        _loop_1 = function (variant) {
                            var url,
                                response,
                                blob_1,
                                reader_1,
                                base64,
                                e_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        url = pdfFont === null || pdfFont === void 0 ? void 0 : pdfFont[variant];
                                        if (!url) return [3 /*break*/, 7];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 5, , 6]);
                                        return [4 /*yield*/, OfflineExporting_win.fetch(url)];
                                    case 2:
                                        response = _b.sent();
                                        if (!response.ok) {
                                            throw new Error("Failed to fetch font: ".concat(url));
                                        }
                                        return [4 /*yield*/, response.blob()];
                                    case 3:
                                        blob_1 = _b.sent(), reader_1 = new FileReader();
                                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                reader_1.onloadend = function () {
                                                    if (typeof reader_1.result === 'string') {
                                                        resolve(reader_1.result.split(',')[1]);
                                                    }
                                                    else {
                                                        reject(new Error('Failed to read font as base64'));
                                                    }
                                                };
                                                reader_1.onerror = reject;
                                                reader_1.readAsDataURL(blob_1);
                                            })];
                                    case 4:
                                        base64 = _b.sent();
                                        addFont(variant, base64);
                                        if (variant === 'normal') {
                                            normalBase64 = base64;
                                        }
                                        return [3 /*break*/, 6];
                                    case 5:
                                        e_1 = _b.sent();
                                        return [3 /*break*/, 6];
                                    case 6: return [3 /*break*/, 8];
                                    case 7:
                                        // For other variants, fall back to normal text weight/style
                                        if (normalBase64) {
                                            addFont(variant, normalBase64);
                                        }
                                        _b.label = 8;
                                    case 8: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, variants_1 = variants;
                        _a.label = 1;
                    case 1:
                        if (!(_i < variants_1.length)) return [3 /*break*/, 4];
                        variant = variants_1[_i];
                        return [5 /*yield**/, _loop_1(variant)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Prepares an SVG for PDF export by ensuring proper text styling and
     * removing unnecessary elements. This function extracts an SVG element from
     * a given SVG string, applies font styles inherited from parent elements,
     * and removes text outlines and title elements to improve PDF rendering.
     *
     * @private
     * @function preparePDF
     *
     * @param {string} svg
     * A string representation of the SVG markup.
     * @param {Highcharts.PdfFontOptions} [pdfFont]
     * An optional object specifying URLs for different font variants (normal,
     * bold, italic, bolditalic). If provided, the text elements are assigned a
     * custom PDF font.
     *
     * @return {SVGSVGElement | null}
     * Returns the parsed SVG element from the container or `null` if the SVG is
     * not found.
     *
     * @requires modules/exporting
     * @requires modules/offline-exporting
     */
    function preparePDF(svg, pdfFont) {
        var dummySVGContainer = OfflineExporting_doc.createElement('div');
        highcharts_AST_commonjs_highcharts_AST_commonjs2_highcharts_AST_root_Highcharts_AST_default().setElementHTML(dummySVGContainer, svg);
        var textElements = dummySVGContainer.getElementsByTagName('text'), 
            // Copy style property to element from parents if it's not there.
            // Searches up hierarchy until it finds prop, or hits the chart
            // container
            setStylePropertyFromParents = function (el,
            propName) {
                var curParent = el;
            while (curParent && curParent !== dummySVGContainer) {
                if (curParent.style[propName]) {
                    var value = curParent.style[propName];
                    if (propName === 'fontSize' && /em$/.test(value)) {
                        value = Math.round(parseFloat(value) * 16) + 'px';
                    }
                    el.style[propName] = value;
                    break;
                }
                curParent = curParent.parentNode;
            }
        };
        var titleElements,
            outlineElements;
        // Workaround for the text styling. Making sure it does pick up
        // settings for parent elements.
        [].forEach.call(textElements, function (el) {
            // Workaround for the text styling. making sure it does pick up
            // the root element
            ['fontFamily', 'fontSize']
                .forEach(function (property) {
                setStylePropertyFromParents(el, property);
            });
            el.style.fontFamily = (pdfFont === null || pdfFont === void 0 ? void 0 : pdfFont.normal) ?
                // Custom PDF font
                'HighchartsFont' :
                // Generic font (serif, sans-serif etc)
                String(el.style.fontFamily &&
                    el.style.fontFamily.split(' ').splice(-1));
            // Workaround for plotband with width, removing title from text
            // nodes
            titleElements = el.getElementsByTagName('title');
            [].forEach.call(titleElements, function (titleElement) {
                el.removeChild(titleElement);
            });
            // Remove all .highcharts-text-outline elements, #17170
            outlineElements =
                el.getElementsByClassName('highcharts-text-outline');
            while (outlineElements.length > 0) {
                var outline = outlineElements[0];
                if (outline.parentNode) {
                    outline.parentNode.removeChild(outline);
                }
            }
        });
        return dummySVGContainer.querySelector('svg');
    }
    /**
     * Transform from PDF to SVG.
     *
     * @async
     * @private
     * @function svgToPdf
     *
     * @param {Highcharts.SVGElement} svgElement
     * The SVG element to convert.
     * @param {number} margin
     * The margin to apply.
     * @param {number} scale
     * The scale of the SVG.
     *
     * @requires modules/exporting
     * @requires modules/offline-exporting
     */
    function svgToPdf(svgElement, margin, scale) {
        return __awaiter(this, void 0, void 0, function () {
            var width,
                height,
                pdfDoc,
                gradients,
                index,
                gradient,
                stops,
                i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        width = (Number(svgElement.getAttribute('width')) + 2 * margin) *
                            scale, height = (Number(svgElement.getAttribute('height')) + 2 * margin) *
                            scale, pdfDoc = new OfflineExporting_win.jspdf.jsPDF(// eslint-disable-line new-cap
                        // Setting orientation to portrait if height exceeds width
                        height > width ? 'p' : 'l', 'pt', [width, height]);
                        // Workaround for #7090, hidden elements were drawn anyway. It comes
                        // down to https://github.com/yWorks/svg2pdf.js/issues/28. Check this
                        // later.
                        [].forEach.call(svgElement.querySelectorAll('*[visibility="hidden"]'), function (node) {
                            node.parentNode.removeChild(node);
                        });
                        gradients = svgElement.querySelectorAll('linearGradient');
                        for (index = 0; index < gradients.length; index++) {
                            gradient = gradients[index];
                            stops = gradient.querySelectorAll('stop');
                            i = 0;
                            while (i < stops.length &&
                                stops[i].getAttribute('offset') === '0' &&
                                stops[i + 1].getAttribute('offset') === '0') {
                                stops[i].remove();
                                i++;
                            }
                        }
                        // Workaround for #15135, zero width spaces, which Highcharts uses
                        // to break lines, are not correctly rendered in PDF. Replace it
                        // with a regular space and offset by some pixels to compensate.
                        [].forEach.call(svgElement.querySelectorAll('tspan'), function (tspan) {
                            if (tspan.textContent === '\u200B') {
                                tspan.textContent = ' ';
                                tspan.setAttribute('dx', -5);
                            }
                        });
                        // Transform from PDF to SVG
                        return [4 /*yield*/, pdfDoc.svg(svgElement, {
                                x: 0,
                                y: 0,
                                width: width,
                                height: height,
                                removeInvalid: true
                            })];
                    case 1:
                        // Transform from PDF to SVG
                        _a.sent();
                        // Return the output
                        return [2 /*return*/, pdfDoc.output('datauristring')];
                }
            });
        });
    }
})(OfflineExporting || (OfflineExporting = {}));
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ var OfflineExporting_OfflineExporting = (OfflineExporting);

;// ./code/es5/es-modules/masters/modules/offline-exporting.src.js





var G = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default());
// Compatibility
G.dataURLtoBlob = G.dataURLtoBlob || Extensions_DownloadURL.dataURLtoBlob;
G.downloadSVGLocal = OfflineExporting_OfflineExporting.downloadSVGLocal;
G.downloadURL = G.downloadURL || Extensions_DownloadURL.downloadURL;
// Compose
OfflineExporting_OfflineExporting.compose(G.Exporting);
/* harmony default export */ var offline_exporting_src = ((highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()));

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});