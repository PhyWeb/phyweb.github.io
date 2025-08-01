/* *
 *
 *  Authors: Rafal Sebestjanski and Pawel Lysy
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
import ControlPoint from '../ControlPoint.js';
import U from '../../../Core/Utilities.js';
var merge = U.merge, isNumber = U.isNumber, defined = U.defined;
if (defaultOptions.annotations) {
    defaultOptions.annotations.types.timeCycles = merge(defaultOptions.annotations.types.crookedLine, 
    /**
     * Options for the  time cycles annotation type.
     *
     * @sample highcharts/annotations-advanced/time-cycles/
     *         Time Cycles annotation
     *
     * @extends      annotations.types.crookedLine
     * @product      highstock
     * @exclude      labelOptions
     * @optionparent annotations.types.timeCycles
     */
    {
        typeOptions: {
            /**
             * @exclude   y
             * @product   highstock
             * @apioption annotations.types.timeCycles.typeOptions.points
             */
            controlPointOptions: [{
                    positioner: function (target) {
                        var point = target.points[0], position = target.anchor(point).absolutePosition;
                        return {
                            x: position.x - (this.graphic.width || 0) / 2,
                            y: target.y - (this.graphic.height || 0)
                        };
                    },
                    events: {
                        drag: function (e, target) {
                            var position = target.anchor(target.points[0]).absolutePosition;
                            target.translatePoint(e.chartX - position.x, 0, 0);
                            target.redraw(false);
                        }
                    }
                }, {
                    positioner: function (target) {
                        var point = target.points[1], position = target.anchor(point).absolutePosition;
                        return {
                            x: position.x - (this.graphic.width || 0) / 2,
                            y: target.y - (this.graphic.height || 0)
                        };
                    },
                    events: {
                        drag: function (e, target) {
                            var position = target.anchor(target.points[1]).absolutePosition;
                            target.translatePoint(e.chartX - position.x, 0, 1);
                            target.redraw(false);
                        }
                    }
                }]
        }
    });
}
/* *
 *
 *  Functions
 *
 * */
/**
 * Function to create start of the path.
 * @param {number} x x position of the TimeCycles
 * @param {number} y y position of the TimeCycles
 * @return {string} path
 */
function getStartingPath(x, y) {
    return ['M', x, y];
}
/**
 * Function which generates the path of the halfcircle.
 *
 * @param {number} pixelInterval diameter of the circle in pixels
 * @param {number} numberOfCircles number of cricles
 * @param {number} startX x position of the first circle
 * @param {number} y y position of the bottom of the timeCycles
 * @return {string} path
 *
 */
function getCirclePath(pixelInterval, numberOfCircles, startX, y) {
    var path = [];
    for (var i = 1; i <= numberOfCircles; i++) {
        path.push([
            'A',
            pixelInterval / 2,
            pixelInterval / 2,
            0,
            1,
            1,
            startX + i * pixelInterval,
            y
        ]);
    }
    return path;
}
/* *
 *
 *  Class
 *
 * */
var TimeCycles = /** @class */ (function (_super) {
    __extends(TimeCycles, _super);
    function TimeCycles() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* *
     *
     *  Functions
     *
     * */
    TimeCycles.prototype.init = function (annotation, userOptions, index) {
        if (defined(userOptions.yAxis)) {
            userOptions.points.forEach(function (point) {
                point.yAxis = userOptions.yAxis;
            });
        }
        if (defined(userOptions.xAxis)) {
            userOptions.points.forEach(function (point) {
                point.xAxis = userOptions.xAxis;
            });
        }
        _super.prototype.init.call(this, annotation, userOptions, index);
    };
    TimeCycles.prototype.setPath = function () {
        this.shapes[0].options.d = this.getPath();
    };
    TimeCycles.prototype.getPath = function () {
        return [getStartingPath(this.startX, this.y)].concat(getCirclePath(this.pixelInterval, this.numberOfCircles, this.startX, this.y));
    };
    TimeCycles.prototype.addShapes = function () {
        var typeOptions = this.options.typeOptions;
        this.setPathProperties();
        var shape = this.initShape(merge(typeOptions.line, {
            type: 'path',
            d: this.getPath(),
            points: this.options.points,
            className: 'highcharts-timecycles-lines'
        }), 0);
        typeOptions.line = shape.options;
    };
    TimeCycles.prototype.addControlPoints = function () {
        var _this = this;
        var options = this.options, typeOptions = options.typeOptions;
        options.controlPointOptions.style.cursor = this.chart.inverted ?
            'ns-resize' :
            'ew-resize';
        typeOptions.controlPointOptions.forEach(function (option) {
            var controlPointsOptions = merge(options.controlPointOptions, option);
            var controlPoint = new ControlPoint(_this.chart, _this, controlPointsOptions, 0);
            _this.controlPoints.push(controlPoint);
        });
    };
    TimeCycles.prototype.setPathProperties = function () {
        var options = this.options.typeOptions, points = options.points;
        if (!points) {
            return;
        }
        var point1 = points[0], point2 = points[1], xAxisNumber = options.xAxis || 0, yAxisNumber = options.yAxis || 0, xAxis = this.chart.xAxis[xAxisNumber], yAxis = this.chart.yAxis[yAxisNumber], xValue1 = point1.x, yValue = point1.y, xValue2 = point2.x;
        if (!xValue1 || !xValue2) {
            return;
        }
        var y = isNumber(yValue) ?
            yAxis.toPixels(yValue) :
            yAxis.top + yAxis.height, x = isNumber(xValue1) ? xAxis.toPixels(xValue1) : xAxis.left, x2 = isNumber(xValue2) ? xAxis.toPixels(xValue2) : xAxis.left + 30, xAxisLength = xAxis.len, pixelInterval = Math.round(Math.max(Math.abs(x2 - x), 2)), 
        // There can be 2 not full circles on the chart, so add 2.
        numberOfCircles = Math.floor(xAxisLength / pixelInterval) + 2, 
        // Calculate where the annotation should start drawing relative to
        // first point.
        pixelShift = (Math.floor((x - xAxis.left) / pixelInterval) + 1) * pixelInterval;
        this.startX = x - pixelShift;
        this.y = y;
        this.pixelInterval = pixelInterval;
        this.numberOfCircles = numberOfCircles;
    };
    TimeCycles.prototype.redraw = function (animation) {
        this.setPathProperties();
        this.setPath();
        _super.prototype.redraw.call(this, animation);
    };
    return TimeCycles;
}(CrookedLine));
Annotation.types.timeCycles = TimeCycles;
/* *
 *
 *  Default Export
 *
 * */
export default TimeCycles;
