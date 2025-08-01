/**
 * @license Highcharts JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/flowmap
 * @requires highcharts
 *
 * (c) 2009-2025
 *
 * License: www.highcharts.com/license
 */
import * as __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__ from "../highcharts.src.js";
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
;// external ["../highcharts.src.js","default","SeriesRegistry"]
const external_highcharts_src_js_default_SeriesRegistry_namespaceObject = __WEBPACK_EXTERNAL_MODULE__highcharts_src_js_8202131d__["default"].SeriesRegistry;
var external_highcharts_src_js_default_SeriesRegistry_default = /*#__PURE__*/__webpack_require__.n(external_highcharts_src_js_default_SeriesRegistry_namespaceObject);
;// ./code/es-modules/Series/FlowMap/FlowMapPoint.js
/* *
 *
 *  (c) 2010-2025 Askel Eirik Johansson, Piotr Madej
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */


const { seriesTypes: { mapline: { prototype: { pointClass: MapLinePoint } } } } = (external_highcharts_src_js_default_SeriesRegistry_default());

const { pick, isString, isNumber } = (external_highcharts_src_js_default_default());
/* *
 *
 *  Class
 *
 * */
class FlowMapPoint extends MapLinePoint {
    /* *
     *
     *  Functions
     *
     * */
    /**
     * @private
     */
    isValid() {
        let valid = !!(this.options.to && this.options.from);
        [this.options.to, this.options.from]
            .forEach(function (toOrFrom) {
            valid = !!(valid && (toOrFrom && (isString(toOrFrom) || ( // Point id or has lat/lon coords
            isNumber(pick(toOrFrom[0], toOrFrom.lat)) &&
                isNumber(pick(toOrFrom[1], toOrFrom.lon))))));
        });
        return valid;
    }
}
/* *
 *
 *  Default Export
 *
 * */
/* harmony default export */ const FlowMap_FlowMapPoint = (FlowMapPoint);

;// ./code/es-modules/Series/FlowMap/FlowMapSeries.js
/* *
 *
 *  (c) 2010-2025 Askel Eirik Johansson, Piotr Madej
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */



const { series: { prototype: { pointClass: Point } }, seriesTypes: { column: ColumnSeries, map: MapSeries, mapline: MapLineSeries } } = (external_highcharts_src_js_default_SeriesRegistry_default());

const { addEvent, arrayMax, arrayMin, defined, extend, isArray, merge, pick: FlowMapSeries_pick, relativeLength } = (external_highcharts_src_js_default_default());
/**
 * The flowmap series type
 *
 * @private
 * @class
 * @name Highcharts.seriesTypes.flowmap
 *
 * @augments Highcharts.Series
 */
class FlowMapSeries extends MapLineSeries {
    /* *
     *
     *  Static Function
     *
     * */
    /**
     * Get vector length.
     * @private
     */
    static getLength(x, y) {
        return Math.sqrt(x * x + y * y);
    }
    /**
     * Return a normalized vector.
     * @private
     */
    static normalize(x, y) {
        const length = this.getLength(x, y);
        return [x / length, y / length];
    }
    /**
     * Return an SVGPath for markerEnd.
     * @private
     */
    static markerEndPath(lCorner, rCorner, topCorner, options) {
        const width = relativeLength(options.width || 0, this.getLength(rCorner[0] - lCorner[0], rCorner[1] - lCorner[1]));
        const type = options.markerType || 'arrow', [edgeX, edgeY] = this.normalize(rCorner[0] - lCorner[0], rCorner[1] - lCorner[1]);
        const path = [];
        // For arrow head calculation.
        if (type === 'arrow') {
            // Left side of arrow head.
            let [x, y] = lCorner;
            x -= edgeX * width;
            y -= edgeY * width;
            path.push(['L', x, y]);
            // Tip of arrow head.
            path.push(['L', topCorner[0], topCorner[1]]);
            // Right side of arrow head.
            [x, y] = rCorner;
            x += edgeX * width;
            y += edgeY * width;
            path.push(['L', x, y]);
        }
        // For mushroom head calculation.
        if (type === 'mushroom') {
            let [xLeft, yLeft] = lCorner, [xRight, yRight] = rCorner;
            const [xTop, yTop] = topCorner, xMid = (xRight - xLeft) / 2 + xLeft, yMid = (yRight - yLeft) / 2 + yLeft, 
            // Control point for curve.
            xControl = (xTop - xMid) * 2 + xMid, yControl = (yTop - yMid) * 2 + yMid;
            // Left side of arrow head.
            xLeft -= edgeX * width;
            yLeft -= edgeY * width;
            path.push(['L', xLeft, yLeft]);
            // Right side of arrow head.
            xRight += edgeX * width;
            yRight += edgeY * width;
            // Curve from left to right.
            path.push(['Q', xControl, yControl, xRight, yRight]);
        }
        return path;
    }
    /**
     *
     *  Functions
     *
     */
    /**
     * Animate the flowmap point one by one from 'fromPoint'.
     *
     * @private
     * @function Highcharts.seriesTypes.flowmap#animate
     *
     * @param {boolean} init
     *        Whether to initialize the animation or run it
     */
    animate(init) {
        const series = this, points = series.points;
        if (!init) { // Run the animation
            points.forEach((point) => {
                if (point.shapeArgs &&
                    isArray(point.shapeArgs.d) &&
                    point.shapeArgs.d.length) {
                    const path = point.shapeArgs.d, x = path[0][1], y = path[0][2];
                    // To animate SVG path the initial path array needs to be
                    // same as target, but element should be visible, so we
                    // insert array elements with start (M) values
                    if (x && y) {
                        const start = [];
                        for (let i = 0; i < path.length; i++) {
                            // Added any when merging master into another branch
                            // :((. The spread looks correct, but TS complains
                            // about possible number in the first position,
                            // which is the segment type.
                            start.push([...path[i]]);
                            for (let j = 1; j < path[i].length; j++) {
                                start[i][j] = j % 2 ? x : y;
                            }
                        }
                        if (point.graphic) {
                            point.graphic.attr({ d: start });
                            point.graphic.animate({ d: path });
                        }
                    }
                }
            });
        }
    }
    /**
     * Get the actual width of a link either as a mapped weight between
     * `minWidth` and `maxWidth` or a specified width.
     * @private
     */
    getLinkWidth(point) {
        const width = this.options.width, weight = point.options.weight || this.options.weight;
        point.options.weight = weight;
        if (width && !weight) {
            return width;
        }
        const smallestWeight = this.smallestWeight, greatestWeight = this.greatestWeight;
        if (!defined(weight) || !smallestWeight || !greatestWeight) {
            return 0;
        }
        const minWidthLimit = this.options.minWidth, maxWidthLimit = this.options.maxWidth;
        return (weight - smallestWeight) * (maxWidthLimit - minWidthLimit) /
            ((greatestWeight - smallestWeight) || 1) + minWidthLimit;
    }
    /**
     * Automatically calculate the optimal curve based on a reference point.
     * @private
     */
    autoCurve(fromX, fromY, toX, toY, centerX, centerY) {
        const linkV = {
            x: (toX - fromX),
            y: (toY - fromY)
        }, half = {
            x: (toX - fromX) / 2 + fromX,
            y: (toY - fromY) / 2 + fromY
        }, centerV = {
            x: half.x - centerX,
            y: half.y - centerY
        };
        // Dot product and determinant
        const dot = linkV.x * centerV.x + linkV.y * centerV.y, det = linkV.x * centerV.y - linkV.y * centerV.x;
        // Calculate the angle and base the curveFactor on it.
        let angle = Math.atan2(det, dot), angleDeg = angle * 180 / Math.PI;
        if (angleDeg < 0) {
            angleDeg = 360 + angleDeg;
        }
        angle = angleDeg * Math.PI / 180;
        // A more subtle result.
        return -Math.sin(angle) * 0.7;
    }
    /**
     * Get point attributes.
     * @private
     */
    pointAttribs(point, state) {
        const attrs = MapSeries.prototype.pointAttribs.call(this, point, state);
        attrs.fill = FlowMapSeries_pick(point.options.fillColor, point.options.color, this.options.fillColor === 'none' ? null : this.options.fillColor, this.color);
        attrs['fill-opacity'] = FlowMapSeries_pick(point.options.fillOpacity, this.options.fillOpacity);
        attrs['stroke-width'] = FlowMapSeries_pick(point.options.lineWidth, this.options.lineWidth, 1);
        if (point.options.opacity) {
            attrs.opacity = point.options.opacity;
        }
        return attrs;
    }
    /**
     * Draw shapeArgs based on from/to options. Run translation operations. We
     * need two loops: first loop to calculate data, like smallest/greatest
     * weights and centerOfPoints, which needs the calculated positions, second
     * loop for calculating shapes of points based on previous calculations.
     * @private
     */
    translate() {
        if (this.chart.hasRendered && (this.isDirtyData || !this.hasRendered)) {
            this.processData();
            this.generatePoints();
        }
        const weights = [];
        let averageX = 0, averageY = 0;
        this.points.forEach((point) => {
            const chart = this.chart, mapView = chart.mapView, options = point.options, dirtySeries = () => {
                point.series.isDirty = true;
            }, getPointXY = (pointId) => {
                const foundPoint = chart.get(pointId);
                // Connect to the linked parent point (in mappoint) to
                // trigger series redraw for the linked point (in flow).
                if ((foundPoint instanceof Point) &&
                    foundPoint.plotX &&
                    foundPoint.plotY) {
                    // After linked point update flowmap point should
                    // be also updated
                    addEvent(foundPoint, 'update', dirtySeries);
                    return {
                        x: foundPoint.plotX,
                        y: foundPoint.plotY
                    };
                }
            }, getLonLatXY = (lonLat) => {
                if (isArray(lonLat)) {
                    return {
                        lon: lonLat[0],
                        lat: lonLat[1]
                    };
                }
                return lonLat;
            };
            let fromPos, toPos;
            if (typeof options.from === 'string') {
                fromPos = getPointXY(options.from);
            }
            else if (typeof options.from === 'object' && mapView) {
                fromPos = mapView.lonLatToPixels(getLonLatXY(options.from));
            }
            if (typeof options.to === 'string') {
                toPos = getPointXY(options.to);
            }
            else if (typeof options.to === 'object' && mapView) {
                toPos = mapView.lonLatToPixels(getLonLatXY(options.to));
            }
            // Save original point location.
            point.fromPos = fromPos;
            point.toPos = toPos;
            if (fromPos && toPos) {
                averageX += (fromPos.x + toPos.x) / 2;
                averageY += (fromPos.y + toPos.y) / 2;
            }
            if (FlowMapSeries_pick(point.options.weight, this.options.weight)) {
                weights.push(FlowMapSeries_pick(point.options.weight, this.options.weight));
            }
        });
        this.smallestWeight = arrayMin(weights);
        this.greatestWeight = arrayMax(weights);
        this.centerOfPoints = {
            x: averageX / this.points.length,
            y: averageY / this.points.length
        };
        this.points.forEach((point) => {
            // Don't draw point if weight is not valid.
            if (!this.getLinkWidth(point)) {
                point.shapeArgs = {
                    d: []
                };
                return;
            }
            if (point.fromPos) {
                point.plotX = point.fromPos.x;
                point.plotY = point.fromPos.y;
            }
            // Calculate point shape
            point.shapeType = 'path';
            point.shapeArgs = this.getPointShapeArgs(point);
            // When updating point from null to normal value, set a real color
            // (don't keep nullColor).
            point.color = FlowMapSeries_pick(point.options.color, point.series.color);
        });
    }
    getPointShapeArgs(point) {
        const { fromPos, toPos } = point;
        if (!fromPos || !toPos) {
            return {};
        }
        const finalWidth = this.getLinkWidth(point) / 2, pointOptions = point.options, markerEndOptions = merge(this.options.markerEnd, pointOptions.markerEnd), growTowards = FlowMapSeries_pick(pointOptions.growTowards, this.options.growTowards), fromX = fromPos.x || 0, fromY = fromPos.y || 0;
        let toX = toPos.x || 0, toY = toPos.y || 0, curveFactor = FlowMapSeries_pick(pointOptions.curveFactor, this.options.curveFactor), offset = markerEndOptions && markerEndOptions.enabled &&
            markerEndOptions.height || 0;
        if (!defined(curveFactor)) { // Automate the curveFactor value.
            curveFactor = this.autoCurve(fromX, fromY, toX, toY, this.centerOfPoints.x, this.centerOfPoints.y);
        }
        // An offset makes room for arrows if they are specified.
        if (offset) {
            // Prepare offset if it's a percentage by converting to number.
            offset = relativeLength(offset, finalWidth * 4);
            // Vector between the points.
            let dX = toX - fromX, dY = toY - fromY;
            // Vector is halved.
            dX *= 0.5;
            dY *= 0.5;
            // Vector points exactly between the points.
            const mX = fromX + dX, mY = fromY + dY;
            // Rotating the halfway distance by 90 anti-clockwise.
            // We can then use this to create an arc.
            const tmp = dX;
            dX = dY;
            dY = -tmp;
            // Calculate the arc strength.
            const arcPointX = (mX + dX * curveFactor), arcPointY = (mY + dY * curveFactor);
            let [offsetX, offsetY] = FlowMapSeries.normalize(arcPointX - toX, arcPointY - toY);
            offsetX *= offset;
            offsetY *= offset;
            toX += offsetX;
            toY += offsetY;
        }
        // Vector between the points.
        let dX = toX - fromX, dY = toY - fromY;
        // Vector is halved.
        dX *= 0.5;
        dY *= 0.5;
        // Vector points exactly between the points.
        const mX = fromX + dX, mY = fromY + dY;
        // Rotating the halfway distance by 90 anti-clockwise.
        // We can then use this to create an arc.
        let tmp = dX;
        dX = dY;
        dY = -tmp;
        // Weight vector calculation for the middle of the curve.
        let [wX, wY] = FlowMapSeries.normalize(dX, dY);
        // The `fineTune` prevents an obvious mismatch along the curve.
        const fineTune = 1 + Math.sqrt(curveFactor * curveFactor) * 0.25;
        wX *= finalWidth * fineTune;
        wY *= finalWidth * fineTune;
        // Calculate the arc strength.
        const arcPointX = (mX + dX * curveFactor), arcPointY = (mY + dY * curveFactor);
        // Calculate edge vectors in the from-point.
        let [fromXToArc, fromYToArc] = FlowMapSeries.normalize(arcPointX - fromX, arcPointY - fromY);
        tmp = fromXToArc;
        fromXToArc = fromYToArc;
        fromYToArc = -tmp;
        fromXToArc *= finalWidth;
        fromYToArc *= finalWidth;
        // Calculate edge vectors in the to-point.
        let [toXToArc, toYToArc] = FlowMapSeries.normalize(arcPointX - toX, arcPointY - toY);
        tmp = toXToArc;
        toXToArc = -toYToArc;
        toYToArc = tmp;
        toXToArc *= finalWidth;
        toYToArc *= finalWidth;
        // Shrink the starting edge and middle thickness to make it grow
        // towards the end.
        if (growTowards) {
            fromXToArc /= finalWidth;
            fromYToArc /= finalWidth;
            wX /= 4;
            wY /= 4;
        }
        const shapeArgs = {
            d: [[
                    'M',
                    fromX - fromXToArc,
                    fromY - fromYToArc
                ], [
                    'Q',
                    arcPointX - wX,
                    arcPointY - wY,
                    toX - toXToArc,
                    toY - toYToArc
                ], [
                    'L',
                    toX + toXToArc,
                    toY + toYToArc
                ], [
                    'Q',
                    arcPointX + wX,
                    arcPointY + wY,
                    fromX + fromXToArc,
                    fromY + fromYToArc
                ], [
                    'Z'
                ]]
        };
        if (markerEndOptions && markerEndOptions.enabled && shapeArgs.d) {
            const marker = FlowMapSeries.markerEndPath([toX - toXToArc, toY - toYToArc], [toX + toXToArc, toY + toYToArc], [toPos.x, toPos.y], markerEndOptions);
            shapeArgs.d.splice(2, 0, ...marker);
        }
        // Objects converted to string to be used in tooltip.
        const fromPoint = point.options.from, toPoint = point.options.to, fromLat = fromPoint.lat, fromLon = fromPoint.lon, toLat = toPoint.lat, toLon = toPoint.lon;
        if (fromLat && fromLon) {
            point.options.from = `${+fromLat}, ${+fromLon}`;
        }
        if (toLat && toLon) {
            point.options.to = `${+toLat}, ${+toLon}`;
        }
        return shapeArgs;
    }
}
/* *
 *
 *  Static properties
 *
 * */
/**
 * A flowmap series is a series laid out on top of a map series allowing to
 * display route paths (e.g. flight or ship routes) or flows on a map. It
 * creates a link between two points on a map chart.
 *
 * @since 11.0.0
 * @extends      plotOptions.mapline
 * @excluding    affectsMapView, allAreas, allowPointSelect, boostBlending,
 * boostThreshold, borderColor, borderWidth, dashStyle, dataLabels,
 * dragDrop, joinBy, mapData, negativeColor, onPoint, shadow, showCheckbox
 * @product      highmaps
 * @requires     modules/flowmap
 * @optionparent plotOptions.flowmap
 */
FlowMapSeries.defaultOptions = merge(MapLineSeries.defaultOptions, {
    animation: true,
    /**
     * The `curveFactor` option for all links. Value higher than 0 will
     * curve the link clockwise. A negative value will curve it counter
     * clockwise. If the value is 0 the link will be a straight line. By
     * default undefined curveFactor get an automatic curve.
     *
     * @sample {highmaps} maps/series-flowmap/curve-factor Setting different
     *         values for curveFactor
     *
     * @type      {number}
     * @default   undefined
     * @apioption plotOptions.flowmap.curveFactor
     */
    dataLabels: {
        enabled: false
    },
    /**
     * The fill color of all the links. If not set, the series color will be
     * used with the opacity set in
     * [fillOpacity](#plotOptions.flowmap.fillOpacity).
     *
     * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     * @apioption plotOptions.flowmap.fillColor
     */
    /**
     * The opacity of the color fill for all links.
     *
     * @type   {number}
     * @sample {highmaps} maps/series-flowmap/fill-opacity
     *         Setting different values for fillOpacity
     */
    fillOpacity: 0.5,
    /**
     * The [id](#series.id) of another series to link to. Additionally, the
     * value can be ":previous" to link to the previous series. When two
     * series are linked, only the first one appears in the legend. Toggling
     * the visibility of this also toggles the linked series, which is
     * necessary for operations such as zoom or updates on the flowmap
     * series.
     *
     * @type      {string}
     * @apioption plotOptions.flowmap.linkedTo
     */
    /**
     * A `markerEnd` creates an arrow symbol indicating the direction of
     * flow at the destination. Specifying a `markerEnd` here will create
     * one for each link.
     *
     * @declare Highcharts.SeriesFlowMapSeriesOptionsObject
     */
    markerEnd: {
        /**
         * Enable or disable the `markerEnd`.
         *
         * @type   {boolean}
         * @sample {highmaps} maps/series-flowmap/marker-end
         *         Setting different markerType for markerEnd
         */
        enabled: true,
        /**
         * Height of the `markerEnd`. Can be a number in pixels or a
         * percentage based on the weight of the link.
         *
         * @type  {number|string}
         */
        height: '40%',
        /**
         * Width of the `markerEnd`. Can be a number in pixels or a
         * percentage based on the weight of the link.
         *
         * @type  {number|string}
         */
        width: '40%',
        /**
         * Change the shape of the `markerEnd`.
         * Can be `arrow` or `mushroom`.
         *
         * @type {string}
         */
        markerType: 'arrow'
    },
    /**
     * If no weight has previously been specified, this will set the width
     * of all the links without being compared to and scaled according to
     * other weights.
     *
     * @type  {number}
     */
    width: 1,
    /**
     * Maximum width of a link expressed in pixels. The weight of a link is
     * mapped between `maxWidth` and `minWidth`.
     *
     * @type  {number}
     */
    maxWidth: 25,
    /**
     * Minimum width of a link expressed in pixels. The weight of a link is
     * mapped between `maxWidth` and `minWidth`.
     *
     * @type  {number}
     */
    minWidth: 5,
    /**
     * Specify the `lineWidth` of the links if they are not specified.
     *
     * @type  {number}
     */
    lineWidth: void 0,
    /**
     * The opacity of all the links. Affects the opacity for the entire
     * link, including stroke. See also
     * [fillOpacity](#plotOptions.flowmap.fillOpacity), that affects the
     * opacity of only the fill color.
     *
     * @apioption plotOptions.flowmap.opacity
     */
    /**
     * The weight for all links with unspecified weights. The weight of a
     * link determines its thickness compared to other links.
     *
     * @sample {highmaps} maps/series-flowmap/ship-route/ Example ship route
     *
     * @type      {number}
     * @product   highmaps
     * @apioption plotOptions.flowmap.weight
     */
    tooltip: {
        /**
         * The HTML for the flowmaps' route description in the tooltip. It
         * consists of the `headerFormat` and `pointFormat`, which can be
         * edited. Variables are enclosed by curly brackets. Available
         * variables are `series.name`, `point.options.from`,
         * `point.options.to`, `point.options.weight` and other properties in the
         * same form.
         *
         * @product   highmaps
         */
        headerFormat: '<span style="font-size: 0.8em">{series.name}</span><br/>',
        pointFormat: '{point.options.from} \u2192 {point.options.to}: <b>{point.options.weight}</b>'
    }
});
extend(FlowMapSeries.prototype, {
    pointClass: FlowMap_FlowMapPoint,
    pointArrayMap: ['from', 'to', 'weight'],
    drawPoints: ColumnSeries.prototype.drawPoints,
    dataColumnKeys: ColumnSeries.prototype.dataColumnKeys,
    // Make it work on zoom or pan.
    useMapGeometry: true
});
external_highcharts_src_js_default_SeriesRegistry_default().registerSeriesType('flowmap', FlowMapSeries);
/* *
 *
 *  Default export
 *
 * */
/* harmony default export */ const FlowMap_FlowMapSeries = ((/* unused pure expression or super */ null && (FlowMapSeries)));
/* *
 *
 *  API options
 *
 * */
/**
 * A `flowmap` series. If the [type](#series.flowmap.type) option
 * is not specified, it is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.flowmap
 * @excluding affectsMapView, allAreas, allowPointSelect, boostBlending,
 * boostThreshold, borderColor, borderWidth, dashStyle, dataLabels, dragDrop,
 * joinBy, mapData, negativeColor, onPoint, shadow, showCheckbox
 * @product   highmaps
 * @apioption series.flowmap
 */
/**
 * An array of data points for the series. For the `flowmap` series
 * type, points can be given in the following ways:
 *
 * 1.  An array of arrays with options as values. In this case,
 *     the values correspond to `from, to, weight`. Example:
 *     ```js
 *     data: [
 *         ['Point 1', 'Point 2', 4]
 *     ]
 *     ```
 *
 * 2.  An array of objects with named values. The following snippet shows only a
 *     few settings, see the complete options set below.
 *
 *     ```js
 *     data: [{
 *         from: 'Point 1',
 *         to: 'Point 2',
 *         curveFactor: 0.4,
 *         weight: 5,
 *         growTowards: true,
 *         markerEnd: {
 *             enabled: true,
 *             height: 15,
 *             width: 8
 *         }
 *     }]
 *     ```
 *
 * 3.   For objects with named values, instead of using the `mappoint` `id`,
 *      you can use `[longitude, latitude]` arrays.
 *
 *      ```js
 *      data: [{
 *          from: [longitude, latitude],
 *          to: [longitude, latitude]
 *      }]
 *      ```
 *
 * @type      {Array<number|null|*>}
 * @apioption series.flowmap.data
 */
/**
 * A `curveFactor` with a higher value than 0 will curve the link clockwise.
 * A negative value will curve the link counter clockwise.
 * If the value is 0 the link will be straight.
 *
 * @sample {highmaps} maps/series-flowmap/ship-route/
 *         Example ship route
 *
 * @type      {number}
 * @apioption series.flowmap.data.curveFactor
 */
/**
 * The fill color of an individual link.
 *
 * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
 * @apioption series.flowmap.data.fillColor
 */
/**
 * ID referencing a map point holding coordinates of the link origin or
 * coordinates in terms of array of `[longitude, latitude]` or object with `lon`
 * and `lat` properties.
 *
 * @sample {highmaps} maps/series-flowmap/from-to-lon-lat
 *         Flowmap point using lonlat coordinates
 * @sample {highmaps} maps/series-flowmap/flight-routes
 *         Highmaps basic flight routes demo
 *
 * @type      {string|Highcharts.LonLatArray|Highcharts.MapLonLatObject}
 * @apioption series.flowmap.data.from
 */
/**
 * ID referencing a map point holding coordinates of the link origin or
 * coordinates in terms of array of `[longitude, latitude]` or object with `lon`
 * and `lat` properties.
 *
 * @sample {highmaps} maps/series-flowmap/from-to-lon-lat
 *         Flowmap point using lonlat coordinates
 * @sample {highmaps} maps/series-flowmap/flight-routes
 *         Highmaps basic flight routes demo
 *
 * @type      {string|Highcharts.LonLatArray|Highcharts.MapLonLatObject}
 * @apioption series.flowmap.data.to
 */
/**
 * The opacity of the link color fill.
 *
 * @type      {number}
 * @apioption series.flowmap.data.fillOpacity
 */
/**
 * If set to `true`, the line will grow towards its end.
 *
 * @sample {highmaps} maps/series-flowmap/ship-route/
 *         Example ship route
 *
 * @type      {boolean}
 * @apioption series.flowmap.data.growTowards
 */
/**
 * Specifying a `markerEnd` here will create an arrow symbol
 * indicating the direction of flow at the destination of one individual link.
 * If one has been previously specified at the higher level option it will be
 * overridden for the current link.
 *
 * @sample {highmaps} maps/series-flowmap/ship-route/
 *         Example ship route
 *
 * @type      {*|null}
 * @apioption series.flowmap.data.markerEnd
 */
/**
 * Enable or disable the `markerEnd`.
 *
 * @type      {boolean}
 * @apioption series.flowmap.data.markerEnd.enabled
 */
/**
 * Height of the `markerEnd`. Can be a number in pixels
 * or a percentage based on the weight of the link.
 *
 * @type      {number|string}
 * @apioption series.flowmap.data.markerEnd.height
 */
/**
 * Width of the `markerEnd`. Can be a number in pixels
 * or a percentage based on the weight of the link.
 *
 * @type      {number|string}
 * @apioption series.flowmap.data.markerEnd.width
 */
/**
 * Change the shape of the `markerEnd`. Can be `arrow` or `mushroom`.
 *
 * @type      {string}
 * @apioption series.flowmap.data.markerEnd.markerType
 */
/**
 * The opacity of an individual link.
 *
 * @type      {number}
 * @apioption series.flowmap.data.opacity
 */
/**
 * The weight of a link determines its thickness compared to
 * other links.
 *
 * @sample {highmaps} maps/series-flowmap/ship-route/
 *         Example ship route
 *
 * @type      {number}
 * @apioption series.flowmap.data.weight
 */
/**
 * Specify the `lineWidth` of the link.
 *
 * @type  {number}
 * @apioption series.flowmap.data.lineWidth
 */
''; // Adds doclets above to transpiled file

;// ./code/es-modules/masters/modules/flowmap.src.js




/* harmony default export */ const flowmap_src = ((external_highcharts_src_js_default_default()));

export { flowmap_src as default };
