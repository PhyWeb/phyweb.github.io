/**
 * @license Highstock JS v12.3.0 (2025-06-21)
 * @module highcharts/indicators/psar
 * @requires highcharts
 * @requires highcharts/modules/stock
 *
 * Parabolic SAR Indicator for Highcharts Stock
 *
 * (c) 2010-2025 Grzegorz Blachliński
 *
 * License: www.highcharts.com/license
 */
import * as __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__ from "../highcharts.src.js";
import * as __WEBPACK_EXTERNAL_MODULE__modules_stock_src_js_b3d80146__ from "../modules/stock.src.js";
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
;// external "../modules/stock.src.js"
var x = (y) => {
	var x = {}; __webpack_require__.d(x,
    	y); return x
    } 
    var y = (x) => (() => (x))
    const stock_src_js_namespaceObject = x({  });
;// external ["../highcharts.src.js","default","SeriesRegistry"]
const external_highcharts_src_js_default_SeriesRegistry_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].SeriesRegistry;
var external_highcharts_src_js_default_SeriesRegistry_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_SeriesRegistry_namespaceObject);
;// ./code/es-modules/Stock/Indicators/PSAR/PSARIndicator.js
/* *
 *
 *  Parabolic SAR indicator for Highcharts Stock
 *
 *  (c) 2010-2025 Grzegorz Blachliński
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { sma: SMAIndicator } = (external_highcharts_src_js_default_SeriesRegistry_default()).seriesTypes;

const { merge } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Functions
 *
 * */
// Utils:
/**
 *
 */
function toFixed(a, n) {
    return parseFloat(a.toFixed(n));
}
/**
 *
 */
function calculateDirection(previousDirection, low, high, PSAR) {
    if ((previousDirection === 1 && low > PSAR) ||
        (previousDirection === -1 && high > PSAR)) {
        return 1;
    }
    return -1;
}
/* *
 * Method for calculating acceleration factor
 * dir - direction
 * pDir - previous Direction
 * eP - extreme point
 * pEP - previous extreme point
 * inc - increment for acceleration factor
 * maxAcc - maximum acceleration factor
 * initAcc - initial acceleration factor
 */
/**
 *
 */
function getAccelerationFactor(dir, pDir, eP, pEP, pAcc, inc, maxAcc, initAcc) {
    if (dir === pDir) {
        if (dir === 1 && (eP > pEP)) {
            return (pAcc === maxAcc) ? maxAcc : toFixed(pAcc + inc, 2);
        }
        if (dir === -1 && (eP < pEP)) {
            return (pAcc === maxAcc) ? maxAcc : toFixed(pAcc + inc, 2);
        }
        return pAcc;
    }
    return initAcc;
}
/**
 *
 */
function getExtremePoint(high, low, previousDirection, previousExtremePoint) {
    if (previousDirection === 1) {
        return (high > previousExtremePoint) ? high : previousExtremePoint;
    }
    return (low < previousExtremePoint) ? low : previousExtremePoint;
}
/**
 *
 */
function getEPMinusPSAR(EP, PSAR) {
    return EP - PSAR;
}
/**
 *
 */
function getAccelerationFactorMultiply(accelerationFactor, EPMinusSAR) {
    return accelerationFactor * EPMinusSAR;
}
/* *
 * Method for calculating PSAR
 * pdir - previous direction
 * sDir - second previous Direction
 * PSAR - previous PSAR
 * pACCMultiply - previous acceleration factor multiply
 * sLow - second previous low
 * pLow - previous low
 * sHigh - second previous high
 * pHigh - previous high
 * pEP - previous extreme point
 */
/**
 *
 */
function getPSAR(pdir, sDir, PSAR, pACCMulti, sLow, pLow, pHigh, sHigh, pEP) {
    if (pdir === sDir) {
        if (pdir === 1) {
            return (PSAR + pACCMulti < Math.min(sLow, pLow)) ?
                PSAR + pACCMulti :
                Math.min(sLow, pLow);
        }
        return (PSAR + pACCMulti > Math.max(sHigh, pHigh)) ?
            PSAR + pACCMulti :
            Math.max(sHigh, pHigh);
    }
    return pEP;
}
/* *
 *
 *  Class
 *
 * */
/**
 * The Parabolic SAR series type.
 *
 * @private
 * @class
 * @name Highcharts.seriesTypes.psar
 *
 * @augments Highcharts.Series
 */
class PSARIndicator extends SMAIndicator {
    constructor() {
        /* *
         *
         *  Static Properties
         *
         * */
        super(...arguments);
        this.nameComponents = void 0;
    }
    /* *
     *
     *  Functions
     *
     * */
    getValues(series, params) {
        const xVal = series.xData, yVal = series.yData, maxAccelerationFactor = params.maxAccelerationFactor, increment = params.increment, 
        // Set initial acc factor (for every new trend!)
        initialAccelerationFactor = params.initialAccelerationFactor, decimals = params.decimals, index = params.index, PSARArr = [], xData = [], yData = [];
        let accelerationFactor = params.initialAccelerationFactor, direction, 
        // Extreme point is the lowest low for falling and highest high
        // for rising psar - and we are starting with falling
        extremePoint = yVal[0][1], EPMinusPSAR, accelerationFactorMultiply, newDirection, previousDirection = 1, prevLow, prevPrevLow, prevHigh, prevPrevHigh, PSAR = yVal[0][2], newExtremePoint, high, low, ind;
        if (index >= yVal.length) {
            return;
        }
        for (ind = 0; ind < index; ind++) {
            extremePoint = Math.max(yVal[ind][1], extremePoint);
            PSAR = Math.min(yVal[ind][2], toFixed(PSAR, decimals));
        }
        direction = (yVal[ind][1] > PSAR) ? 1 : -1;
        EPMinusPSAR = getEPMinusPSAR(extremePoint, PSAR);
        accelerationFactor = params.initialAccelerationFactor;
        accelerationFactorMultiply = getAccelerationFactorMultiply(accelerationFactor, EPMinusPSAR);
        PSARArr.push([xVal[index], PSAR]);
        xData.push(xVal[index]);
        yData.push(toFixed(PSAR, decimals));
        for (ind = index + 1; ind < yVal.length; ind++) {
            prevLow = yVal[ind - 1][2];
            prevPrevLow = yVal[ind - 2][2];
            prevHigh = yVal[ind - 1][1];
            prevPrevHigh = yVal[ind - 2][1];
            high = yVal[ind][1];
            low = yVal[ind][2];
            // Null points break PSAR
            if (prevPrevLow !== null &&
                prevPrevHigh !== null &&
                prevLow !== null &&
                prevHigh !== null &&
                high !== null &&
                low !== null) {
                PSAR = getPSAR(direction, previousDirection, PSAR, accelerationFactorMultiply, prevPrevLow, prevLow, prevHigh, prevPrevHigh, extremePoint);
                newExtremePoint = getExtremePoint(high, low, direction, extremePoint);
                newDirection = calculateDirection(previousDirection, low, high, PSAR);
                accelerationFactor = getAccelerationFactor(newDirection, direction, newExtremePoint, extremePoint, accelerationFactor, increment, maxAccelerationFactor, initialAccelerationFactor);
                EPMinusPSAR = getEPMinusPSAR(newExtremePoint, PSAR);
                accelerationFactorMultiply = getAccelerationFactorMultiply(accelerationFactor, EPMinusPSAR);
                PSARArr.push([xVal[ind], toFixed(PSAR, decimals)]);
                xData.push(xVal[ind]);
                yData.push(toFixed(PSAR, decimals));
                previousDirection = direction;
                direction = newDirection;
                extremePoint = newExtremePoint;
            }
        }
        return {
            values: PSARArr,
            xData: xData,
            yData: yData
        };
    }
}
/**
 * Parabolic SAR. This series requires `linkedTo`
 * option to be set and should be loaded
 * after `stock/indicators/indicators.js` file.
 *
 * @sample stock/indicators/psar
 *         Parabolic SAR Indicator
 *
 * @extends      plotOptions.sma
 * @since        6.0.0
 * @product      highstock
 * @requires     stock/indicators/indicators
 * @requires     stock/indicators/psar
 * @optionparent plotOptions.psar
 */
PSARIndicator.defaultOptions = merge(SMAIndicator.defaultOptions, {
    lineWidth: 0,
    marker: {
        enabled: true
    },
    states: {
        hover: {
            lineWidthPlus: 0
        }
    },
    /**
     * @excluding period
     */
    params: {
        period: void 0, // Unchangeable period, do not inherit (#15362)
        /**
         * The initial value for acceleration factor.
         * Acceleration factor is starting with this value
         * and increases by specified increment each time
         * the extreme point makes a new high.
         * AF can reach a maximum of maxAccelerationFactor,
         * no matter how long the uptrend extends.
         */
        initialAccelerationFactor: 0.02,
        /**
         * The Maximum value for acceleration factor.
         * AF can reach a maximum of maxAccelerationFactor,
         * no matter how long the uptrend extends.
         */
        maxAccelerationFactor: 0.2,
        /**
         * Acceleration factor increases by increment each time
         * the extreme point makes a new high.
         *
         * @since 6.0.0
         */
        increment: 0.02,
        /**
         * Index from which PSAR is starting calculation
         *
         * @since 6.0.0
         */
        index: 2,
        /**
         * Number of maximum decimals that are used in PSAR calculations.
         *
         * @since 6.0.0
         */
        decimals: 4
    }
});
external_highcharts_src_js_default_SeriesRegistry_default().registerSeriesType('psar', PSARIndicator);
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const PSAR_PSARIndicator = ((/* unused pure expression or super */ null && (PSARIndicator)));
/* *
 *
 *  API Options
 *
 * */
/**
 * A `PSAR` series. If the [type](#series.psar.type) option is not specified, it
 * is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.psar
 * @since     6.0.0
 * @product   highstock
 * @excluding dataParser, dataURL
 * @requires  stock/indicators/indicators
 * @requires  stock/indicators/psar
 * @apioption series.psar
 */
''; // To include the above in the js output

;// ./code/es-modules/masters/indicators/psar.src.js





/* harmony default export */ const psar_src = ((external_highcharts_src_js_default_default()));

export { psar_src as default };
