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
import D from '../../../Core/Defaults.js';
var defaultOptions = D.defaultOptions;
import InfinityLine from './InfinityLine.js';
import MockPoint from '../MockPoint.js';
import U from '../../../Core/Utilities.js';
var merge = U.merge;
if (defaultOptions.annotations) {
    defaultOptions.annotations.types.pitchfork = merge(defaultOptions.annotations.types.infinityLine, 
    /**
     * Options for the pitchfork annotation type.
     *
     * @sample highcharts/annotations-advanced/pitchfork/
     *         Pitchfork
     *
     * @extends      annotations.types.infinityLine
     * @product      highstock
     * @optionparent annotations.types.pitchfork
     */
    {
        typeOptions: {
            /**
             * Inner background options.
             *
             * @extends   annotations.types.crookedLine.shapeOptions
             * @excluding height, r, type, width
             */
            innerBackground: {
                fill: 'rgba(130, 170, 255, 0.4)',
                strokeWidth: 0
            },
            /**
             * Outer background options.
             *
             * @extends   annotations.types.crookedLine.shapeOptions
             * @excluding height, r, type, width
             */
            outerBackground: {
                fill: 'rgba(156, 229, 161, 0.4)',
                strokeWidth: 0
            }
        }
    });
}
/* *
 *
 *  Class
 *
 * */
var Pitchfork = /** @class */ (function (_super) {
    __extends(Pitchfork, _super);
    function Pitchfork() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* *
     *
     *  Static Functions
     *
     * */
    Pitchfork.outerLineEdgePoint = function (firstPointIndex) {
        return function (target) {
            var annotation = target.annotation, points = annotation.points;
            return Pitchfork.findEdgePoint(points[firstPointIndex], points[0], new MockPoint(annotation.chart, target, annotation.midPointOptions()));
        };
    };
    Pitchfork.findEdgePoint = function (point, firstAnglePoint, secondAnglePoint) {
        var angle = Math.atan2((secondAnglePoint.plotY -
            firstAnglePoint.plotY), secondAnglePoint.plotX - firstAnglePoint.plotX), distance = 1e7;
        return {
            x: point.plotX + distance * Math.cos(angle),
            y: point.plotY + distance * Math.sin(angle)
        };
    };
    Pitchfork.middleLineEdgePoint = function (target) {
        var annotation = target.annotation, points = annotation.points;
        return InfinityLine.findEdgePoint(points[0], new MockPoint(annotation.chart, target, annotation.midPointOptions()));
    };
    /* *
     *
     *  Functions
     *
     * */
    Pitchfork.prototype.midPointOptions = function () {
        var points = this.points;
        return {
            x: (points[1].x + points[2].x) / 2,
            y: (points[1].y + points[2].y) / 2,
            xAxis: points[0].series.xAxis,
            yAxis: points[0].series.yAxis
        };
    };
    Pitchfork.prototype.addShapes = function () {
        this.addLines();
        this.addBackgrounds();
    };
    Pitchfork.prototype.addLines = function () {
        var className = 'highcharts-pitchfork-lines';
        this.initShape({
            type: 'path',
            points: [
                this.points[0],
                Pitchfork.middleLineEdgePoint
            ],
            className: className
        }, 0);
        this.initShape({
            type: 'path',
            points: [
                this.points[1],
                Pitchfork.topLineEdgePoint
            ],
            className: className
        }, 1);
        this.initShape({
            type: 'path',
            points: [
                this.points[2],
                Pitchfork.bottomLineEdgePoint
            ],
            className: className
        }, 2);
    };
    Pitchfork.prototype.addBackgrounds = function () {
        var shapes = this.shapes, typeOptions = this.options.typeOptions;
        var innerBackground = this.initShape(merge(typeOptions.innerBackground, {
            type: 'path',
            points: [
                function (target) {
                    var annotation = target.annotation, points = annotation.points, midPointOptions = annotation.midPointOptions();
                    return {
                        x: (points[1].x + midPointOptions.x) / 2,
                        y: (points[1].y + midPointOptions.y) / 2,
                        xAxis: midPointOptions.xAxis,
                        yAxis: midPointOptions.yAxis
                    };
                },
                shapes[1].points[1],
                shapes[2].points[1],
                function (target) {
                    var annotation = target.annotation, points = annotation.points, midPointOptions = annotation.midPointOptions();
                    return {
                        x: (midPointOptions.x + points[2].x) / 2,
                        y: (midPointOptions.y + points[2].y) / 2,
                        xAxis: midPointOptions.xAxis,
                        yAxis: midPointOptions.yAxis
                    };
                }
            ],
            className: 'highcharts-pitchfork-inner-background'
        }), 3);
        var outerBackground = this.initShape(merge(typeOptions.outerBackground, {
            type: 'path',
            points: [
                this.points[1],
                shapes[1].points[1],
                shapes[2].points[1],
                this.points[2]
            ],
            className: 'highcharts-pitchfork-outer-background'
        }), 4);
        typeOptions.innerBackground = innerBackground.options;
        typeOptions.outerBackground = outerBackground.options;
    };
    Pitchfork.topLineEdgePoint = Pitchfork.outerLineEdgePoint(1);
    Pitchfork.bottomLineEdgePoint = Pitchfork.outerLineEdgePoint(0);
    return Pitchfork;
}(InfinityLine));
Annotation.types.pitchfork = Pitchfork;
/* *
 *
 *  Default Export
 *
 * */
export default Pitchfork;
