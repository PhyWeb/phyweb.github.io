/* *
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
import Annotation from '../Annotation.js';
import CrookedLine from './CrookedLine.js';
import D from '../../../Core/Defaults.js';
var defaultOptions = D.defaultOptions;
import MockPoint from '../MockPoint.js';
import U from '../../../Core/Utilities.js';
var merge = U.merge;
if (defaultOptions.annotations) {
    /**
     * Options for the infinity line annotation type.
     *
     * @sample highcharts/annotations-advanced/infinity-line/
     *         Infinity line
     *
     * @extends      annotations.types.crookedLine
     * @product      highstock
     * @optionparent annotations.types.infinityLine
     */
    defaultOptions.annotations.types.infinityLine = merge(defaultOptions.annotations.types.crookedLine);
}
/* *
 *
 *  Class
 *
 * */
var InfinityLine = /** @class */ (function (_super) {
    __extends(InfinityLine, _super);
    function InfinityLine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* *
     *
     *  Static Functions
     *
     * */
    InfinityLine.edgePoint = function (startIndex, endIndex) {
        return function (target) {
            var annotation = target.annotation, type = annotation.options.typeOptions.type;
            var points = annotation.points;
            if (type === 'horizontalLine' || type === 'verticalLine') {
                // Horizontal and vertical lines have only one point,
                // make a copy of it:
                points = [
                    points[0],
                    new MockPoint(annotation.chart, points[0].target, {
                        // Add 0 or 1 to x or y depending on type
                        x: points[0].x + +(type === 'horizontalLine'),
                        y: points[0].y + +(type === 'verticalLine'),
                        xAxis: points[0].options.xAxis,
                        yAxis: points[0].options.yAxis
                    })
                ];
            }
            return InfinityLine.findEdgePoint(points[startIndex], points[endIndex]);
        };
    };
    InfinityLine.findEdgeCoordinate = function (firstPoint, secondPoint, xOrY, edgePointFirstCoordinate) {
        var xOrYOpposite = xOrY === 'x' ? 'y' : 'x';
        // Solves equation for x or y
        // y - y1 = (y2 - y1) / (x2 - x1) * (x - x1)
        return ((secondPoint[xOrY] - firstPoint[xOrY]) *
            (edgePointFirstCoordinate - firstPoint[xOrYOpposite]) /
            (secondPoint[xOrYOpposite] - firstPoint[xOrYOpposite]) +
            firstPoint[xOrY]);
    };
    InfinityLine.findEdgePoint = function (firstPoint, secondPoint) {
        var chart = firstPoint.series.chart, xAxis = firstPoint.series.xAxis, yAxis = secondPoint.series.yAxis, firstPointPixels = MockPoint.pointToPixels(firstPoint), secondPointPixels = MockPoint.pointToPixels(secondPoint), deltaX = secondPointPixels.x - firstPointPixels.x, deltaY = secondPointPixels.y - firstPointPixels.y, xAxisMin = xAxis.left, xAxisMax = xAxisMin + xAxis.width, yAxisMin = yAxis.top, yAxisMax = yAxisMin + yAxis.height, xLimit = deltaX < 0 ? xAxisMin : xAxisMax, yLimit = deltaY < 0 ? yAxisMin : yAxisMax, edgePoint = {
            x: deltaX === 0 ? firstPointPixels.x : xLimit,
            y: deltaY === 0 ? firstPointPixels.y : yLimit
        };
        var edgePointX, edgePointY, swap;
        if (deltaX !== 0 && deltaY !== 0) {
            edgePointY = InfinityLine.findEdgeCoordinate(firstPointPixels, secondPointPixels, 'y', xLimit);
            edgePointX = InfinityLine.findEdgeCoordinate(firstPointPixels, secondPointPixels, 'x', yLimit);
            if (edgePointY >= yAxisMin && edgePointY <= yAxisMax) {
                edgePoint.x = xLimit;
                edgePoint.y = edgePointY;
            }
            else {
                edgePoint.x = edgePointX;
                edgePoint.y = yLimit;
            }
        }
        edgePoint.x -= chart.plotLeft;
        edgePoint.y -= chart.plotTop;
        if (firstPoint.series.chart.inverted) {
            swap = edgePoint.x;
            edgePoint.x = edgePoint.y;
            edgePoint.y = swap;
        }
        return edgePoint;
    };
    /* *
     *
     *  Functions
     *
     * */
    InfinityLine.prototype.addShapes = function () {
        var typeOptions = this.options.typeOptions, points = [
            this.points[0],
            InfinityLine.endEdgePoint
        ];
        // Be case-insensitive (#15155) e.g.:
        // - line
        // - horizontalLine
        // - verticalLine
        if (typeOptions.type.match(/line/gi)) {
            points[0] = InfinityLine.startEdgePoint;
        }
        var line = this.initShape(merge(typeOptions.line, {
            type: 'path',
            points: points,
            className: 'highcharts-infinity-lines'
        }), 0);
        typeOptions.line = line.options;
    };
    /* *
     *
     *  Static Properties
     *
     * */
    InfinityLine.endEdgePoint = InfinityLine.edgePoint(0, 1);
    InfinityLine.startEdgePoint = InfinityLine.edgePoint(1, 0);
    return InfinityLine;
}(CrookedLine));
Annotation.types.infinityLine = InfinityLine;
/* *
 *
 *  Default Export
 *
 * */
export default InfinityLine;
/* *
 *
 *  API Declarations
 *
 * */
/**
 * An infinity line annotation.
 *
 * @sample highcharts/annotations-advanced/infinity-line/
 *         Infinity Line
 *
 * @extends   annotations.types.crookedLine
 * @product   highstock
 * @apioption annotations.types.infinityLine
 */
(''); // Keeps doclets above in transpiled file
