/**
 * @license Highcharts Gantt JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/grid-axis
 * @requires highcharts
 *
 * GridAxis
 *
 * (c) 2016-2025 Lars A. V. Cabrera
 *
 * License: www.highcharts.com/license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("highcharts"), require("highcharts")["Axis"]);
	else if(typeof define === 'function' && define.amd)
		define("highcharts/modules/grid-axis", [["highcharts/highcharts"], ["highcharts/highcharts","Axis"]], factory);
	else if(typeof exports === 'object')
		exports["highcharts/modules/grid-axis"] = factory(require("highcharts"), require("highcharts")["Axis"]);
	else
		root["Highcharts"] = factory(root["Highcharts"], root["Highcharts"]["Axis"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__944__, __WEBPACK_EXTERNAL_MODULE__532__) {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 532:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__532__;

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
  "default": function() { return /* binding */ grid_axis_src; }
});

// EXTERNAL MODULE: external {"amd":["highcharts/highcharts"],"commonjs":["highcharts"],"commonjs2":["highcharts"],"root":["Highcharts"]}
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_ = __webpack_require__(944);
var highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default = /*#__PURE__*/__webpack_require__.n(highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_);
// EXTERNAL MODULE: external {"amd":["highcharts/highcharts","Axis"],"commonjs":["highcharts","Axis"],"commonjs2":["highcharts","Axis"],"root":["Highcharts","Axis"]}
var highcharts_Axis_commonjs_highcharts_Axis_commonjs2_highcharts_Axis_root_Highcharts_Axis_ = __webpack_require__(532);
var highcharts_Axis_commonjs_highcharts_Axis_commonjs2_highcharts_Axis_root_Highcharts_Axis_default = /*#__PURE__*/__webpack_require__.n(highcharts_Axis_commonjs_highcharts_Axis_commonjs2_highcharts_Axis_root_Highcharts_Axis_);
;// ./code/es5/es-modules/Core/Axis/GridAxis.js
/* *
 *
 *  (c) 2016 Highsoft AS
 *  Authors: Lars A. V. Cabrera
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */



var dateFormats = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).dateFormats;

var addEvent = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).addEvent, defined = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).defined, erase = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).erase, find = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).find, isArray = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).isArray, isNumber = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).isNumber, merge = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).merge, pick = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).pick, timeUnits = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).timeUnits, wrap = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()).wrap;
/* *
 *
 *  Enums
 *
 * */
/**
 * Enum for which side the axis is on. Maps to axis.side.
 * @private
 */
var GridAxisSide;
(function (GridAxisSide) {
    GridAxisSide[GridAxisSide["top"] = 0] = "top";
    GridAxisSide[GridAxisSide["right"] = 1] = "right";
    GridAxisSide[GridAxisSide["bottom"] = 2] = "bottom";
    GridAxisSide[GridAxisSide["left"] = 3] = "left";
})(GridAxisSide || (GridAxisSide = {}));
/* *
 *
 *  Functions
 *
 * */
/**
 * @private
 */
function argsToArray(args) {
    return Array.prototype.slice.call(args, 1);
}
/**
 * @private
 */
function isObject(x) {
    // Always use strict mode
    return highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default().isObject(x, true);
}
/**
 * @private
 */
function applyGridOptions(axis) {
    var options = axis.options;
    // Center-align by default
    /*
    if (!options.labels) {
        options.labels = {};
    }
    */
    options.labels.align = pick(options.labels.align, 'center');
    // @todo: Check against tickLabelPlacement between/on etc
    /* Prevents adding the last tick label if the axis is not a category
       axis.
       Since numeric labels are normally placed at starts and ends of a
       range of value, and this module makes the label point at the value,
       an "extra" label would appear. */
    if (!axis.categories) {
        options.showLastLabel = false;
    }
    // Prevents rotation of labels when squished, as rotating them would not
    // help.
    axis.labelRotation = 0;
    options.labels.rotation = 0;
    // Allow putting ticks closer than their data points.
    options.minTickInterval = 1;
}
/**
 * Extends axis class with grid support.
 * @private
 */
function compose(AxisClass, ChartClass, TickClass) {
    if (!AxisClass.keepProps.includes('grid')) {
        AxisClass.keepProps.push('grid');
        AxisClass.prototype.getMaxLabelDimensions = getMaxLabelDimensions;
        wrap(AxisClass.prototype, 'unsquish', wrapUnsquish);
        wrap(AxisClass.prototype, 'getOffset', wrapGetOffset);
        // Add event handlers
        addEvent(AxisClass, 'init', onInit);
        addEvent(AxisClass, 'afterGetTitlePosition', onAfterGetTitlePosition);
        addEvent(AxisClass, 'afterInit', onAfterInit);
        addEvent(AxisClass, 'afterRender', onAfterRender);
        addEvent(AxisClass, 'afterSetAxisTranslation', onAfterSetAxisTranslation);
        addEvent(AxisClass, 'afterSetOptions', onAfterSetOptions);
        addEvent(AxisClass, 'afterSetOptions', onAfterSetOptions2);
        addEvent(AxisClass, 'afterSetScale', onAfterSetScale);
        addEvent(AxisClass, 'afterTickSize', onAfterTickSize);
        addEvent(AxisClass, 'trimTicks', onTrimTicks);
        addEvent(AxisClass, 'destroy', onDestroy);
        addEvent(ChartClass, 'afterSetChartSize', onChartAfterSetChartSize);
        addEvent(TickClass, 'afterGetLabelPosition', onTickAfterGetLabelPosition);
        addEvent(TickClass, 'labelFormat', onTickLabelFormat);
    }
    return AxisClass;
}
/**
 * Get the largest label width and height.
 *
 * @private
 * @function Highcharts.Axis#getMaxLabelDimensions
 *
 * @param {Highcharts.Dictionary<Highcharts.Tick>} ticks
 * All the ticks on one axis.
 *
 * @param {Array<number|string>} tickPositions
 * All the tick positions on one axis.
 *
 * @return {Highcharts.SizeObject}
 * Object containing the properties height and width.
 *
 * @todo Move this to the generic axis implementation, as it is used there.
 */
function getMaxLabelDimensions(ticks, tickPositions) {
    var dimensions = {
            width: 0,
            height: 0
        };
    tickPositions.forEach(function (pos) {
        var tick = ticks[pos];
        var labelHeight = 0,
            labelWidth = 0,
            label;
        if (isObject(tick)) {
            label = isObject(tick.label) ? tick.label : {};
            // Find width and height of label
            labelHeight = label.getBBox ? label.getBBox().height : 0;
            if (label.textStr && !isNumber(label.textPxLength)) {
                label.textPxLength = label.getBBox().width;
            }
            labelWidth = isNumber(label.textPxLength) ?
                // Math.round ensures crisp lines
                Math.round(label.textPxLength) :
                0;
            if (label.textStr) {
                // Set the tickWidth same as the label width after ellipsis
                // applied #10281
                labelWidth = Math.round(label.getBBox().width);
            }
            // Update the result if width and/or height are larger
            dimensions.height = Math.max(labelHeight, dimensions.height);
            dimensions.width = Math.max(labelWidth, dimensions.width);
        }
    });
    // For tree grid, add indentation
    if (this.type === 'treegrid' &&
        this.treeGrid &&
        this.treeGrid.mapOfPosToGridNode) {
        var treeDepth = this.treeGrid.mapOfPosToGridNode[-1].height || 0;
        dimensions.width += (this.options.labels.indentation *
            (treeDepth - 1));
    }
    return dimensions;
}
/**
 * Handle columns and getOffset.
 * @private
 */
function wrapGetOffset(proceed) {
    var grid = this.grid, 
        // On the left side we handle the columns first because the offset is
        // calculated from the plot area and out
        columnsFirst = this.side === 3;
    if (!columnsFirst) {
        proceed.apply(this);
    }
    if (!(grid === null || grid === void 0 ? void 0 : grid.isColumn)) {
        var columns = (grid === null || grid === void 0 ? void 0 : grid.columns) || [];
        if (columnsFirst) {
            columns = columns.slice().reverse();
        }
        columns
            .forEach(function (column) {
            column.getOffset();
        });
    }
    if (columnsFirst) {
        proceed.apply(this);
    }
}
/**
 * @private
 */
function onAfterGetTitlePosition(e) {
    var axis = this;
    var options = axis.options;
    var gridOptions = options.grid || {};
    if (gridOptions.enabled === true) {
        // Compute anchor points for each of the title align options
        var axisTitle = axis.axisTitle,
            axisHeight = axis.height,
            horiz = axis.horiz,
            axisLeft = axis.left,
            offset = axis.offset,
            opposite = axis.opposite,
            options_1 = axis.options,
            axisTop = axis.top,
            axisWidth = axis.width;
        var tickSize = axis.tickSize();
        var titleWidth = axisTitle === null || axisTitle === void 0 ? void 0 : axisTitle.getBBox().width;
        var xOption = options_1.title.x;
        var yOption = options_1.title.y;
        var titleMargin = pick(options_1.title.margin,
            horiz ? 5 : 10);
        var titleFontSize = axisTitle ? axis.chart.renderer.fontMetrics(axisTitle).f : 0;
        var crispCorr = tickSize ? tickSize[0] / 2 : 0;
        // TODO account for alignment
        // the position in the perpendicular direction of the axis
        var offAxis = ((horiz ? axisTop + axisHeight : axisLeft) +
                (horiz ? 1 : -1) * // Horizontal axis reverses the margin
                    (opposite ? -1 : 1) * // So does opposite axes
                    crispCorr +
                (axis.side === GridAxisSide.bottom ? titleFontSize : 0));
        e.titlePosition.x = horiz ?
            axisLeft - (titleWidth || 0) / 2 - titleMargin + xOption :
            offAxis + (opposite ? axisWidth : 0) + offset + xOption;
        e.titlePosition.y = horiz ?
            (offAxis -
                (opposite ? axisHeight : 0) +
                (opposite ? titleFontSize : -titleFontSize) / 2 +
                offset +
                yOption) :
            axisTop - titleMargin + yOption;
    }
}
/**
 * @private
 */
function onAfterInit() {
    var axis = this;
    var chart = axis.chart,
        _a = axis.options.grid,
        gridOptions = _a === void 0 ? {} : _a,
        userOptions = axis.userOptions;
    if (gridOptions.enabled) {
        applyGridOptions(axis);
    }
    if (gridOptions.columns) {
        var columns = axis.grid.columns = [];
        var columnIndex = axis.grid.columnIndex = 0;
        // Handle columns, each column is a grid axis
        while (++columnIndex < gridOptions.columns.length) {
            var columnOptions = merge(userOptions,
                gridOptions.columns[columnIndex], {
                    isInternal: true,
                    linkedTo: 0,
                    // Disable by default the scrollbar on the grid axis
                    scrollbar: {
                        enabled: false
                    }
                }, 
                // Avoid recursion
                {
                    grid: {
                        columns: void 0
                    }
                });
            var column = new (highcharts_Axis_commonjs_highcharts_Axis_commonjs2_highcharts_Axis_root_Highcharts_Axis_default())(axis.chart,
                columnOptions, 'yAxis');
            column.grid.isColumn = true;
            column.grid.columnIndex = columnIndex;
            // Remove column axis from chart axes array, and place it
            // in the columns array.
            erase(chart.axes, column);
            erase(chart[axis.coll] || [], column);
            columns.push(column);
        }
    }
}
/**
 * Draw an extra line on the far side of the outermost axis,
 * creating floor/roof/wall of a grid. And some padding.
 * ```
 * Make this:
 *             (axis.min) __________________________ (axis.max)
 *                           |    |    |    |    |
 * Into this:
 *             (axis.min) __________________________ (axis.max)
 *                        ___|____|____|____|____|__
 * ```
 * @private
 */
function onAfterRender() {
    var _a,
        _b;
    var axis = this,
        axisTitle = axis.axisTitle,
        grid = axis.grid,
        options = axis.options,
        gridOptions = options.grid || {};
    if (gridOptions.enabled === true) {
        var min = axis.min || 0,
            max = axis.max || 0,
            firstTick = axis.ticks[axis.tickPositions[0]];
        // Adjust the title max width to the column width (#19657)
        if (axisTitle &&
            !axis.chart.styledMode &&
            (firstTick === null || firstTick === void 0 ? void 0 : firstTick.slotWidth) &&
            !axis.options.title.style.width) {
            axisTitle.css({ width: "" + firstTick.slotWidth + "px" });
        }
        // @todo actual label padding (top, bottom, left, right)
        axis.maxLabelDimensions = axis.getMaxLabelDimensions(axis.ticks, axis.tickPositions);
        // Remove right wall before rendering if updating
        if (axis.rightWall) {
            axis.rightWall.destroy();
        }
        /*
        Draw an extra axis line on outer axes
                    >
        Make this:    |______|______|______|___

                    > _________________________
        Into this:    |______|______|______|__|
                                                */
        if (((_a = axis.grid) === null || _a === void 0 ? void 0 : _a.isOuterAxis()) && axis.axisLine) {
            var lineWidth = options.lineWidth;
            if (lineWidth) {
                var linePath = axis.getLinePath(lineWidth),
                    startPoint = linePath[0],
                    endPoint = linePath[1], 
                    // Negate distance if top or left axis
                    // Subtract 1px to draw the line at the end of the tick
                    tickLength = (axis.tickSize('tick') || [1])[0],
                    distance = tickLength * ((axis.side === GridAxisSide.top ||
                        axis.side === GridAxisSide.left) ? -1 : 1);
                // If axis is horizontal, reposition line path vertically
                if (startPoint[0] === 'M' && endPoint[0] === 'L') {
                    if (axis.horiz) {
                        startPoint[2] += distance;
                        endPoint[2] += distance;
                    }
                    else {
                        startPoint[1] += distance;
                        endPoint[1] += distance;
                    }
                }
                // If it doesn't exist, add an upper and lower border
                // for the vertical grid axis.
                if (!axis.horiz && axis.chart.marginRight) {
                    var upperBorderStartPoint = startPoint,
                        upperBorderEndPoint = [
                            'L',
                            axis.left,
                            startPoint[2] || 0
                        ],
                        upperBorderPath = [
                            upperBorderStartPoint,
                            upperBorderEndPoint
                        ],
                        lowerBorderEndPoint = [
                            'L',
                            axis.chart.chartWidth - axis.chart.marginRight,
                            axis.toPixels(max + axis.tickmarkOffset)
                        ],
                        lowerBorderStartPoint = [
                            'M',
                            endPoint[1] || 0,
                            axis.toPixels(max + axis.tickmarkOffset)
                        ],
                        lowerBorderPath = [
                            lowerBorderStartPoint,
                            lowerBorderEndPoint
                        ];
                    if (!axis.grid.upperBorder && min % 1 !== 0) {
                        axis.grid.upperBorder = axis.grid.renderBorder(upperBorderPath);
                    }
                    if (axis.grid.upperBorder) {
                        axis.grid.upperBorder.attr({
                            stroke: options.lineColor,
                            'stroke-width': options.lineWidth
                        });
                        axis.grid.upperBorder.animate({
                            d: upperBorderPath
                        });
                    }
                    if (!axis.grid.lowerBorder && max % 1 !== 0) {
                        axis.grid.lowerBorder = axis.grid.renderBorder(lowerBorderPath);
                    }
                    if (axis.grid.lowerBorder) {
                        axis.grid.lowerBorder.attr({
                            stroke: options.lineColor,
                            'stroke-width': options.lineWidth
                        });
                        axis.grid.lowerBorder.animate({
                            d: lowerBorderPath
                        });
                    }
                }
                // Render an extra line parallel to the existing axes, to
                // close the grid.
                if (!axis.grid.axisLineExtra) {
                    axis.grid.axisLineExtra = axis.grid.renderBorder(linePath);
                }
                else {
                    axis.grid.axisLineExtra.attr({
                        stroke: options.lineColor,
                        'stroke-width': options.lineWidth
                    });
                    axis.grid.axisLineExtra.animate({
                        d: linePath
                    });
                }
                // Show or hide the line depending on options.showEmpty
                axis.axisLine[axis.showAxis ? 'show' : 'hide']();
            }
        }
        ((grid === null || grid === void 0 ? void 0 : grid.columns) || []).forEach(function (column) { return column.render(); });
        // Manipulate the tick mark visibility
        // based on the axis.max- allows smooth scrolling.
        if (!axis.horiz &&
            axis.chart.hasRendered &&
            (axis.scrollbar || ((_b = axis.linkedParent) === null || _b === void 0 ? void 0 : _b.scrollbar)) &&
            axis.tickPositions.length) {
            var tickmarkOffset = axis.tickmarkOffset,
                lastTick = axis.tickPositions[axis.tickPositions.length - 1],
                firstTick_1 = axis.tickPositions[0];
            var label = void 0,
                tickMark = void 0;
            while ((label = axis.hiddenLabels.pop()) && label.element) {
                label.show(); // #15453
            }
            while ((tickMark = axis.hiddenMarks.pop()) &&
                tickMark.element) {
                tickMark.show(); // #16439
            }
            // Hide/show first tick label.
            label = axis.ticks[firstTick_1].label;
            if (label) {
                if (min - firstTick_1 > tickmarkOffset) {
                    axis.hiddenLabels.push(label.hide());
                }
                else {
                    label.show();
                }
            }
            // Hide/show last tick mark/label.
            label = axis.ticks[lastTick].label;
            if (label) {
                if (lastTick - max > tickmarkOffset) {
                    axis.hiddenLabels.push(label.hide());
                }
                else {
                    label.show();
                }
            }
            var mark = axis.ticks[lastTick].mark;
            if (mark &&
                lastTick - max < tickmarkOffset &&
                lastTick - max > 0 && axis.ticks[lastTick].isLast) {
                axis.hiddenMarks.push(mark.hide());
            }
        }
    }
}
/**
 * @private
 */
function onAfterSetAxisTranslation() {
    var _a;
    var axis = this;
    var tickInfo = (_a = axis.tickPositions) === null || _a === void 0 ? void 0 : _a.info;
    var options = axis.options;
    var gridOptions = options.grid || {};
    var userLabels = axis.userOptions.labels || {};
    // Fire this only for the Gantt type chart, #14868.
    if (gridOptions.enabled) {
        if (axis.horiz) {
            axis.series.forEach(function (series) {
                series.options.pointRange = 0;
            });
            // Lower level time ticks, like hours or minutes, represent
            // points in time and not ranges. These should be aligned
            // left in the grid cell by default. The same applies to
            // years of higher order.
            if (tickInfo &&
                options.dateTimeLabelFormats &&
                options.labels &&
                !defined(userLabels.align) &&
                (options.dateTimeLabelFormats[tickInfo.unitName]
                    .range === false ||
                    tickInfo.count > 1 // Years
                )) {
                options.labels.align = 'left';
                if (!defined(userLabels.x)) {
                    options.labels.x = 3;
                }
            }
        }
        else {
            // Don't trim ticks which not in min/max range but
            // they are still in the min/max plus tickInterval.
            if (this.type !== 'treegrid' &&
                axis.grid &&
                axis.grid.columns) {
                this.minPointOffset = this.tickInterval;
            }
        }
    }
}
/**
 * Creates a left and right wall on horizontal axes:
 * - Places leftmost tick at the start of the axis, to create a left
 *   wall
 * - Ensures that the rightmost tick is at the end of the axis, to
 *   create a right wall.
 * @private
 */
function onAfterSetOptions(e) {
    var options = this.options,
        userOptions = e.userOptions,
        gridOptions = ((options && isObject(options.grid)) ? options.grid : {});
    var gridAxisOptions;
    if (gridOptions.enabled === true) {
        // Merge the user options into default grid axis options so
        // that when a user option is set, it takes precedence.
        gridAxisOptions = merge(true, {
            className: ('highcharts-grid-axis ' + (userOptions.className || '')),
            dateTimeLabelFormats: {
                hour: {
                    list: ['%[HM]', '%[H]']
                },
                day: {
                    list: ['%[AeB]', '%[aeb]', '%[E]']
                },
                week: {
                    list: ['Week %W', 'W%W']
                },
                month: {
                    list: ['%[B]', '%[b]', '%o']
                }
            },
            grid: {
                borderWidth: 1
            },
            labels: {
                padding: 2,
                style: {
                    fontSize: '0.9em'
                }
            },
            margin: 0,
            title: {
                text: null,
                reserveSpace: false,
                rotation: 0,
                style: {
                    textOverflow: 'ellipsis'
                }
            },
            // In a grid axis, only allow one unit of certain types,
            // for example we shouldn't have one grid cell spanning
            // two days.
            units: [[
                    'millisecond', // Unit name
                    [1, 10, 100]
                ], [
                    'second',
                    [1, 10]
                ], [
                    'minute',
                    [1, 5, 15]
                ], [
                    'hour',
                    [1, 6]
                ], [
                    'day',
                    [1]
                ], [
                    'week',
                    [1]
                ], [
                    'month',
                    [1]
                ], [
                    'year',
                    null
                ]]
        }, userOptions);
        // X-axis specific options
        if (this.coll === 'xAxis') {
            // For linked axes, tickPixelInterval is used only if
            // the tickPositioner below doesn't run or returns
            // undefined (like multiple years)
            if (defined(userOptions.linkedTo) &&
                !defined(userOptions.tickPixelInterval)) {
                gridAxisOptions.tickPixelInterval = 350;
            }
            // For the secondary grid axis, use the primary axis'
            // tick intervals and return ticks one level higher.
            if (
            // Check for tick pixel interval in options
            !defined(userOptions.tickPixelInterval) &&
                // Only for linked axes
                defined(userOptions.linkedTo) &&
                !defined(userOptions.tickPositioner) &&
                !defined(userOptions.tickInterval) &&
                !defined(userOptions.units)) {
                gridAxisOptions.tickPositioner = function (min, max) {
                    var _a,
                        _b;
                    var parentInfo = (_b = (_a = this.linkedParent) === null || _a === void 0 ? void 0 : _a.tickPositions) === null || _b === void 0 ? void 0 : _b.info;
                    if (parentInfo) {
                        var units = (gridAxisOptions.units || []);
                        var unitIdx = void 0,
                            count = 1,
                            unitName = 'year';
                        for (var i = 0; i < units.length; i++) {
                            var unit_1 = units[i];
                            if (unit_1 && unit_1[0] === parentInfo.unitName) {
                                unitIdx = i;
                                break;
                            }
                        }
                        // Get the first allowed count on the next unit.
                        var unit = (isNumber(unitIdx) && units[unitIdx + 1]);
                        if (unit) {
                            unitName = unit[0] || 'year';
                            var counts = unit[1];
                            count = (counts === null || counts === void 0 ? void 0 : counts[0]) || 1;
                            // In case the base X axis shows years, make the
                            // secondary axis show ten times the years (#11427)
                        }
                        else if (parentInfo.unitName === 'year') {
                            // `unitName` is 'year'
                            count = parentInfo.count * 10;
                        }
                        var unitRange = timeUnits[unitName];
                        this.tickInterval = unitRange * count;
                        return this.chart.time.getTimeTicks({ unitRange: unitRange, count: count, unitName: unitName }, min, max, this.options.startOfWeek);
                    }
                };
            }
        }
        // Now merge the combined options into the axis options
        merge(true, this.options, gridAxisOptions);
        if (this.horiz) {
            /*               _________________________
            Make this:    ___|_____|_____|_____|__|
                            ^                     ^
                            _________________________
            Into this:    |_____|_____|_____|_____|
                                ^                 ^    */
            options.minPadding = pick(userOptions.minPadding, 0);
            options.maxPadding = pick(userOptions.maxPadding, 0);
        }
        // If borderWidth is set, then use its value for tick and
        // line width.
        if (isNumber(options.grid.borderWidth)) {
            options.tickWidth = options.lineWidth =
                gridOptions.borderWidth;
        }
    }
}
/**
 * @private
 */
function onAfterSetOptions2(e) {
    var axis = this;
    var userOptions = e.userOptions;
    var gridOptions = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.grid) || {};
    var columns = gridOptions.columns;
    // Add column options to the parent axis. Children has their column options
    // set on init in onGridAxisAfterInit.
    if (gridOptions.enabled && columns) {
        merge(true, axis.options, columns[0]);
    }
}
/**
 * Handle columns and setScale.
 * @private
 */
function onAfterSetScale() {
    var axis = this;
    (axis.grid.columns || []).forEach(function (column) { return column.setScale(); });
}
/**
 * Draw vertical axis ticks extra long to create cell floors and roofs.
 * Overrides the tickLength for vertical axes.
 * @private
 */
function onAfterTickSize(e) {
    var _a = this,
        horiz = _a.horiz,
        maxLabelDimensions = _a.maxLabelDimensions,
        _b = _a.options.grid,
        gridOptions = _b === void 0 ? {} : _b;
    if (gridOptions.enabled && maxLabelDimensions) {
        var labelPadding = this.options.labels.distance * 2;
        var distance = horiz ?
                (gridOptions.cellHeight ||
                    labelPadding + maxLabelDimensions.height) :
                labelPadding + maxLabelDimensions.width;
        if (isArray(e.tickSize)) {
            e.tickSize[0] = distance;
        }
        else {
            e.tickSize = [distance, 0];
        }
    }
}
/**
 * @private
 */
function onChartAfterSetChartSize() {
    this.axes.forEach(function (axis) {
        var _a;
        (((_a = axis.grid) === null || _a === void 0 ? void 0 : _a.columns) || []).forEach(function (column) {
            column.setAxisSize();
            column.setAxisTranslation();
        });
    });
}
/**
 * @private
 */
function onDestroy(e) {
    var grid = this.grid;
    (grid.columns || []).forEach(function (column) { return column.destroy(e.keepEvents); });
    grid.columns = void 0;
}
/**
 * Wraps axis init to draw cell walls on vertical axes.
 * @private
 */
function onInit(e) {
    var axis = this;
    var userOptions = e.userOptions || {};
    var gridOptions = userOptions.grid || {};
    if (gridOptions.enabled && defined(gridOptions.borderColor)) {
        userOptions.tickColor = userOptions.lineColor = (gridOptions.borderColor);
    }
    if (!axis.grid) {
        axis.grid = new GridAxisAdditions(axis);
    }
    axis.hiddenLabels = [];
    axis.hiddenMarks = [];
}
/**
 * Center tick labels in cells.
 * @private
 */
function onTickAfterGetLabelPosition(e) {
    var tick = this,
        label = tick.label,
        axis = tick.axis,
        reversed = axis.reversed,
        chart = axis.chart,
        options = axis.options,
        gridOptions = options.grid || {},
        labelOpts = axis.options.labels,
        align = labelOpts.align, 
        // `verticalAlign` is currently not supported for axis.labels.
        verticalAlign = 'middle', // LabelOpts.verticalAlign,
        side = GridAxisSide[axis.side],
        tickmarkOffset = e.tickmarkOffset,
        tickPositions = axis.tickPositions,
        tickPos = tick.pos - tickmarkOffset,
        nextTickPos = (isNumber(tickPositions[e.index + 1]) ?
            tickPositions[e.index + 1] - tickmarkOffset :
            (axis.max || 0) + tickmarkOffset),
        tickSize = axis.tickSize('tick'),
        tickWidth = tickSize ? tickSize[0] : 0,
        crispCorr = tickSize ? tickSize[1] / 2 : 0;
    // Only center tick labels in grid axes
    if (gridOptions.enabled === true) {
        var bottom = void 0,
            top_1,
            left = void 0,
            right = void 0;
        // Calculate top and bottom positions of the cell.
        if (side === 'top') {
            bottom = axis.top + axis.offset;
            top_1 = bottom - tickWidth;
        }
        else if (side === 'bottom') {
            top_1 = chart.chartHeight - axis.bottom + axis.offset;
            bottom = top_1 + tickWidth;
        }
        else {
            bottom = axis.top + axis.len - (axis.translate(reversed ? nextTickPos : tickPos) || 0);
            top_1 = axis.top + axis.len - (axis.translate(reversed ? tickPos : nextTickPos) || 0);
        }
        // Calculate left and right positions of the cell.
        if (side === 'right') {
            left = chart.chartWidth - axis.right + axis.offset;
            right = left + tickWidth;
        }
        else if (side === 'left') {
            right = axis.left + axis.offset;
            left = right - tickWidth;
        }
        else {
            left = Math.round(axis.left + (axis.translate(reversed ? nextTickPos : tickPos) || 0)) - crispCorr;
            right = Math.min(// #15742
            Math.round(axis.left + (axis.translate(reversed ? tickPos : nextTickPos) || 0)) - crispCorr, axis.left + axis.len);
        }
        tick.slotWidth = right - left;
        // Calculate the positioning of the label based on
        // alignment.
        e.pos.x = (align === 'left' ?
            left :
            align === 'right' ?
                right :
                left + ((right - left) / 2) // Default to center
        );
        e.pos.y = (verticalAlign === 'top' ?
            top_1 :
            verticalAlign === 'bottom' ?
                bottom :
                top_1 + ((bottom - top_1) / 2) // Default to middle
        );
        if (label) {
            var lblMetrics = chart.renderer.fontMetrics(label),
                labelHeight = label.getBBox().height;
            // Adjustment to y position to align the label correctly.
            // Would be better to have a setter or similar for this.
            if (!labelOpts.useHTML) {
                var lines = Math.round(labelHeight / lblMetrics.h);
                e.pos.y += (
                // Center the label
                // TODO: why does this actually center the label?
                ((lblMetrics.b - (lblMetrics.h - lblMetrics.f)) / 2) +
                    // Adjust for height of additional lines.
                    -(((lines - 1) * lblMetrics.h) / 2));
            }
            else {
                e.pos.y += (
                // Readjust yCorr in htmlUpdateTransform
                lblMetrics.b +
                    // Adjust for height of html label
                    -(labelHeight / 2));
            }
        }
        e.pos.x += (axis.horiz && labelOpts.x) || 0;
    }
}
/**
 * @private
 */
function onTickLabelFormat(ctx) {
    var _a;
    var axis = ctx.axis,
        value = ctx.value;
    if ((_a = axis.options.grid) === null || _a === void 0 ? void 0 : _a.enabled) {
        var tickPos = axis.tickPositions;
        var series = (axis.linkedParent || axis).series[0];
        var isFirst = value === tickPos[0];
        var isLast = value === tickPos[tickPos.length - 1];
        var point = series && find(series.options.data,
            function (p) {
                return p[axis.isXAxis ? 'x' : 'y'] === value;
        });
        var pointCopy = void 0;
        if (point && series.is('gantt')) {
            // For the Gantt set point aliases to the pointCopy
            // to do not change the original point
            pointCopy = merge(point);
            highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default().seriesTypes.gantt.prototype.pointClass
                .setGanttPointAliases(pointCopy, axis.chart);
        }
        // Make additional properties available for the
        // formatter
        ctx.isFirst = isFirst;
        ctx.isLast = isLast;
        ctx.point = pointCopy;
    }
}
/**
 * Makes tick labels which are usually ignored in a linked axis
 * displayed if they are within range of linkedParent.min.
 * ```
 *                        _____________________________
 *                        |   |       |       |       |
 * Make this:             |   |   2   |   3   |   4   |
 *                        |___|_______|_______|_______|
 *                          ^
 *                        _____________________________
 *                        |   |       |       |       |
 * Into this:             | 1 |   2   |   3   |   4   |
 *                        |___|_______|_______|_______|
 *                          ^
 * ```
 * @private
 * @todo Does this function do what the drawing says? Seems to affect
 *       ticks and not the labels directly?
 */
function onTrimTicks() {
    var _a,
        _b;
    var axis = this,
        options = axis.options,
        gridOptions = options.grid || {},
        categoryAxis = axis.categories,
        tickPositions = axis.tickPositions,
        firstPos = tickPositions[0],
        secondPos = tickPositions[1],
        lastPos = tickPositions[tickPositions.length - 1],
        beforeLastPos = tickPositions[tickPositions.length - 2],
        linkedMin = (_a = axis.linkedParent) === null || _a === void 0 ? void 0 : _a.min,
        linkedMax = (_b = axis.linkedParent) === null || _b === void 0 ? void 0 : _b.max,
        min = linkedMin || axis.min,
        max = linkedMax || axis.max,
        tickInterval = axis.tickInterval,
        startLessThanMin = ( // #19845
        isNumber(min) &&
            min >= firstPos + tickInterval &&
            min < secondPos),
        endMoreThanMin = (isNumber(min) &&
            firstPos < min &&
            firstPos + tickInterval > min),
        startLessThanMax = (isNumber(max) &&
            lastPos > max &&
            lastPos - tickInterval < max),
        endMoreThanMax = (isNumber(max) &&
            max <= lastPos - tickInterval &&
            max > beforeLastPos);
    if (gridOptions.enabled === true &&
        !categoryAxis &&
        (axis.isXAxis || axis.isLinked)) {
        if ((endMoreThanMin || startLessThanMin) && !options.startOnTick) {
            tickPositions[0] = min;
        }
        if ((startLessThanMax || endMoreThanMax) && !options.endOnTick) {
            tickPositions[tickPositions.length - 1] = max;
        }
    }
}
/**
 * Avoid altering tickInterval when reserving space.
 * @private
 */
function wrapUnsquish(proceed) {
    var axis = this;
    var _a = axis.options.grid,
        gridOptions = _a === void 0 ? {} : _a;
    if (gridOptions.enabled === true && axis.categories) {
        return axis.tickInterval;
    }
    return proceed.apply(axis, argsToArray(arguments));
}
/* *
 *
 *  Class
 *
 * */
/**
 * Additions for grid axes.
 * @private
 * @class
 */
var GridAxisAdditions = /** @class */ (function () {
    /* *
    *
    *  Constructors
    *
    * */
    function GridAxisAdditions(axis) {
        this.axis = axis;
    }
    /* *
    *
    *  Functions
    *
    * */
    /**
     * Checks if an axis is the outer axis in its dimension. Since
     * axes are placed outwards in order, the axis with the highest
     * index is the outermost axis.
     *
     * Example: If there are multiple x-axes at the top of the chart,
     * this function returns true if the axis supplied is the last
     * of the x-axes.
     *
     * @private
     *
     * @return {boolean}
     * True if the axis is the outermost axis in its dimension; false if
     * not.
     */
    GridAxisAdditions.prototype.isOuterAxis = function () {
        var _a;
        var axis = this.axis;
        var chart = axis.chart;
        var columnIndex = axis.grid.columnIndex;
        var columns = (((_a = axis.linkedParent) === null || _a === void 0 ? void 0 : _a.grid.columns) ||
                axis.grid.columns ||
                []);
        var parentAxis = columnIndex ? axis.linkedParent : axis;
        var thisIndex = -1,
            lastIndex = 0;
        // On the left side, when we have columns (not only multiple axes), the
        // main axis is to the left
        if (axis.side === 3 && !chart.inverted && columns.length) {
            return !axis.linkedParent;
        }
        (chart[axis.coll] || []).forEach(function (otherAxis, index) {
            if (otherAxis.side === axis.side &&
                !otherAxis.options.isInternal) {
                lastIndex = index;
                if (otherAxis === parentAxis) {
                    // Get the index of the axis in question
                    thisIndex = index;
                }
            }
        });
        return (lastIndex === thisIndex &&
            (isNumber(columnIndex) ?
                columns.length === columnIndex :
                true));
    };
    /**
     * Add extra border based on the provided path.
     * @private
     * @param {SVGPath} path
     * The path of the border.
     * @return {Highcharts.SVGElement}
     * Border
     */
    GridAxisAdditions.prototype.renderBorder = function (path) {
        var axis = this.axis,
            renderer = axis.chart.renderer,
            options = axis.options,
            extraBorderLine = renderer.path(path)
                .addClass('highcharts-axis-line')
                .add(axis.axisGroup);
        if (!renderer.styledMode) {
            extraBorderLine.attr({
                stroke: options.lineColor,
                'stroke-width': options.lineWidth,
                zIndex: 7
            });
        }
        return extraBorderLine;
    };
    return GridAxisAdditions;
}());
/* *
 *
 *  Registry
 *
 * */
// First letter of the day of the week, e.g. 'M' for 'Monday'.
dateFormats.E = function (timestamp) {
    return this.dateFormat('%a', timestamp, true).charAt(0);
};
// Adds week date format
dateFormats.W = function (timestamp) {
    var d = this.toParts(timestamp),
        firstDay = (d[7] + 6) % 7,
        thursday = d.slice(0);
    thursday[2] = d[2] - firstDay + 3;
    var firstThursday = this.toParts(this.makeTime(thursday[0], 0, 1));
    if (firstThursday[7] !== 4) {
        d[1] = 0; // Set month to January
        d[2] = 1 + (11 - firstThursday[7]) % 7;
    }
    var thursdayTS = this.makeTime(thursday[0],
        thursday[1],
        thursday[2]),
        firstThursdayTS = this.makeTime(firstThursday[0],
        firstThursday[1],
        firstThursday[2]);
    return (1 +
        Math.floor((thursdayTS - firstThursdayTS) / 604800000)).toString();
};
/* *
 *
 *  Default Export
 *
 * */
var GridAxis = {
    compose: compose
};
/* harmony default export */ var Axis_GridAxis = (GridAxis);
/* *
 *
 *  API Options
 *
 * */
/**
 * @productdesc {gantt}
 * For grid axes (like in Gantt charts),
 * it is possible to declare as a list to provide different
 * formats depending on available space.
 *
 * Defaults to:
 * ```js
 * {
 *     hour: { list: ['%H:%M', '%H'] },
 *     day: { list: ['%A, %e. %B', '%a, %e. %b', '%E'] },
 *     week: { list: ['Week %W', 'W%W'] },
 *     month: { list: ['%B', '%b', '%o'] }
 * }
 * ```
 *
 * @sample {gantt} gantt/grid-axis/date-time-label-formats
 *         Gantt chart with custom axis date format.
 *
 * @apioption xAxis.dateTimeLabelFormats
 */
/**
 * Set grid options for the axis labels. Requires Highcharts Gantt.
 *
 * @since     6.2.0
 * @product   gantt
 * @apioption xAxis.grid
 */
/**
 * Enable grid on the axis labels. Defaults to true for Gantt charts.
 *
 * @type      {boolean}
 * @default   true
 * @since     6.2.0
 * @product   gantt
 * @apioption xAxis.grid.enabled
 */
/**
 * Set specific options for each column (or row for horizontal axes) in the
 * grid. Each extra column/row is its own axis, and the axis options can be set
 * here.
 *
 * @sample gantt/demo/left-axis-table
 *         Left axis as a table
 * @sample gantt/demo/treegrid-columns
 *         Collapsible tree grid with columns
 *
 * @type      {Array<Highcharts.XAxisOptions>}
 * @apioption xAxis.grid.columns
 */
/**
 * Set border color for the label grid lines.
 *
 * @type      {Highcharts.ColorString}
 * @default   #e6e6e6
 * @apioption xAxis.grid.borderColor
 */
/**
 * Set border width of the label grid lines.
 *
 * @type      {number}
 * @default   1
 * @apioption xAxis.grid.borderWidth
 */
/**
 * Set cell height for grid axis labels. By default this is calculated from font
 * size. This option only applies to horizontal axes. For vertical axes, check
 * the [#yAxis.staticScale](yAxis.staticScale) option.
 *
 * @sample gantt/grid-axis/cellheight
 *         Gant chart with custom cell height
 * @type      {number}
 * @apioption xAxis.grid.cellHeight
 */
''; // Keeps doclets above in JS file

;// ./code/es5/es-modules/masters/modules/grid-axis.src.js




var G = (highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default());
// Compositions
Axis_GridAxis.compose(G.Axis, G.Chart, G.Tick);
/* harmony default export */ var grid_axis_src = ((highcharts_commonjs_highcharts_commonjs2_highcharts_root_Highcharts_default()));

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});