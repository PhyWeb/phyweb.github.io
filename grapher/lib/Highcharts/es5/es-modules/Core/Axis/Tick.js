/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
import F from '../Templating.js';
import H from '../Globals.js';
var deg2rad = H.deg2rad;
import U from '../Utilities.js';
var clamp = U.clamp, correctFloat = U.correctFloat, defined = U.defined, destroyObjectProperties = U.destroyObjectProperties, extend = U.extend, fireEvent = U.fireEvent, getAlignFactor = U.getAlignFactor, isNumber = U.isNumber, merge = U.merge, objectEach = U.objectEach, pick = U.pick;
/* *
 *
 *  Class
 *
 * */
/* eslint-disable no-invalid-this, valid-jsdoc */
/**
 * The Tick class.
 *
 * @class
 * @name Highcharts.Tick
 *
 * @param {Highcharts.Axis} axis
 * The axis of the tick.
 *
 * @param {number} pos
 * The position of the tick on the axis in terms of axis values.
 *
 * @param {string} [type]
 * The type of tick, either 'minor' or an empty string
 *
 * @param {boolean} [noLabel=false]
 * Whether to disable the label or not. Defaults to false.
 *
 * @param {Object} [parameters]
 * Optional parameters for the tick.
 */
var Tick = /** @class */ (function () {
    /* *
     *
     *  Constructors
     *
     * */
    function Tick(axis, pos, type, noLabel, parameters) {
        this.isNew = true;
        this.isNewLabel = true;
        /**
         * The related axis of the tick.
         * @name Highcharts.Tick#axis
         * @type {Highcharts.Axis}
         */
        this.axis = axis;
        /**
         * The logical position of the tick on the axis in terms of axis values.
         * @name Highcharts.Tick#pos
         * @type {number}
         */
        this.pos = pos;
        /**
         * The tick type, which can be `"minor"`, or an empty string.
         * @name Highcharts.Tick#type
         * @type {string}
         */
        this.type = type || '';
        this.parameters = parameters || {};
        /**
         * The mark offset of the tick on the axis. Usually `undefined`, numeric
         * for grid axes.
         * @name Highcharts.Tick#tickmarkOffset
         * @type {number|undefined}
         */
        this.tickmarkOffset = this.parameters.tickmarkOffset;
        this.options = this.parameters.options;
        fireEvent(this, 'init');
        if (!type && !noLabel) {
            this.addLabel();
        }
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Write the tick label.
     *
     * @private
     * @function Highcharts.Tick#addLabel
     */
    Tick.prototype.addLabel = function () {
        var _a, _b;
        var tick = this, axis = tick.axis, options = axis.options, chart = axis.chart, categories = axis.categories, log = axis.logarithmic, names = axis.names, pos = tick.pos, labelOptions = pick((_a = tick.options) === null || _a === void 0 ? void 0 : _a.labels, options.labels), tickPositions = axis.tickPositions, isFirst = pos === tickPositions[0], isLast = pos === tickPositions[tickPositions.length - 1], animateLabels = (!labelOptions.step || labelOptions.step === 1) &&
            axis.tickInterval === 1, tickPositionInfo = tickPositions.info;
        var label = tick.label, dateTimeLabelFormat, dateTimeLabelFormats, i;
        // The context value
        var value = this.parameters.category || (categories ?
            pick(categories[pos], names[pos], pos) :
            pos);
        if (log && isNumber(value)) {
            value = correctFloat(log.lin2log(value));
        }
        // Set the datetime label format. If a higher rank is set for this
        // position, use that. If not, use the general format.
        if (axis.dateTime) {
            if (tickPositionInfo) {
                dateTimeLabelFormats = chart.time.resolveDTLFormat(options.dateTimeLabelFormats[(!((_b = options.grid) === null || _b === void 0 ? void 0 : _b.enabled) &&
                    tickPositionInfo.higherRanks[pos]) ||
                    tickPositionInfo.unitName]);
                dateTimeLabelFormat = dateTimeLabelFormats.main;
            }
            else if (isNumber(value)) { // #1441
                dateTimeLabelFormat = axis.dateTime.getXDateFormat(value, options.dateTimeLabelFormats ||
                    {});
            }
        }
        // Set properties for access in render method
        /**
         * True if the tick is the first one on the axis.
         * @name Highcharts.Tick#isFirst
         * @readonly
         * @type {boolean|undefined}
         */
        tick.isFirst = isFirst;
        /**
         * True if the tick is the last one on the axis.
         * @name Highcharts.Tick#isLast
         * @readonly
         * @type {boolean|undefined}
         */
        tick.isLast = isLast;
        // Get the string
        var ctx = {
            axis: axis,
            chart: chart,
            dateTimeLabelFormat: dateTimeLabelFormat,
            isFirst: isFirst,
            isLast: isLast,
            pos: pos,
            tick: tick,
            tickPositionInfo: tickPositionInfo,
            value: value
        };
        // Fire an event that allows modifying the context for use in
        // `labels.format` and `labels.formatter`.
        fireEvent(this, 'labelFormat', ctx);
        // Label formatting. When `labels.format` is given, we first run the
        // defaultFormatter and append the result to the context as `text`.
        // Handy for adding prefix or suffix while keeping default number
        // formatting.
        var labelFormatter = function (ctx) {
            if (labelOptions.formatter) {
                return labelOptions.formatter.call(ctx, ctx);
            }
            if (labelOptions.format) {
                ctx.text = axis.defaultLabelFormatter.call(ctx);
                return F.format(labelOptions.format, ctx, chart);
            }
            return axis.defaultLabelFormatter.call(ctx);
        };
        var str = labelFormatter.call(ctx, ctx);
        // Set up conditional formatting based on the format list if existing.
        var list = dateTimeLabelFormats === null || dateTimeLabelFormats === void 0 ? void 0 : dateTimeLabelFormats.list;
        if (list) {
            tick.shortenLabel = function () {
                for (i = 0; i < list.length; i++) {
                    extend(ctx, { dateTimeLabelFormat: list[i] });
                    label.attr({
                        text: labelFormatter.call(ctx, ctx)
                    });
                    if (label.getBBox().width <
                        axis.getSlotWidth(tick) - 2 *
                            (labelOptions.padding || 0)) {
                        return;
                    }
                }
                label.attr({
                    text: ''
                });
            };
        }
        else {
            // #15692
            tick.shortenLabel = void 0;
        }
        // Call only after first render
        if (animateLabels && axis._addedPlotLB) {
            tick.moveLabel(str, labelOptions);
        }
        // First call
        if (!defined(label) && !tick.movedLabel) {
            /**
             * The rendered text label of the tick.
             * @name Highcharts.Tick#label
             * @type {Highcharts.SVGElement|undefined}
             */
            tick.label = label = tick.createLabel(str, labelOptions);
            // Base value to detect change for new calls to getBBox
            tick.rotation = 0;
            // Update
        }
        else if (label && label.textStr !== str && !animateLabels) {
            // When resetting text, also reset the width if dynamically set
            // (#8809)
            if (label.textWidth &&
                !labelOptions.style.width &&
                !label.styles.width) {
                label.css({ width: null });
            }
            label.attr({ text: str });
            label.textPxLength = label.getBBox().width;
        }
    };
    /**
     * Render and return the label of the tick.
     *
     * @private
     * @function Highcharts.Tick#createLabel
     */
    Tick.prototype.createLabel = function (str, labelOptions, xy) {
        var axis = this.axis, _a = axis.chart, renderer = _a.renderer, styledMode = _a.styledMode, whiteSpace = labelOptions.style.whiteSpace, label = defined(str) && labelOptions.enabled ?
            renderer
                .text(str, xy === null || xy === void 0 ? void 0 : xy.x, xy === null || xy === void 0 ? void 0 : xy.y, labelOptions.useHTML)
                .add(axis.labelGroup) :
            void 0;
        // Un-rotated length
        if (label) {
            if (!styledMode) {
                label.css(merge(labelOptions.style));
            }
            label.textPxLength = label.getBBox().width;
            // Apply the white-space setting after we read the full text width
            if (!styledMode && whiteSpace) {
                label.css({ whiteSpace: whiteSpace });
            }
        }
        return label;
    };
    /**
     * Destructor for the tick prototype
     *
     * @private
     * @function Highcharts.Tick#destroy
     */
    Tick.prototype.destroy = function () {
        destroyObjectProperties(this, this.axis);
    };
    /**
     * Gets the x and y positions for ticks in terms of pixels.
     *
     * @private
     * @function Highcharts.Tick#getPosition
     *
     * @param {boolean} horiz
     * Whether the tick is on an horizontal axis or not.
     *
     * @param {number} tickPos
     * Position of the tick.
     *
     * @param {number} tickmarkOffset
     * Tickmark offset for all ticks.
     *
     * @param {boolean} [old]
     * Whether the axis has changed or not.
     *
     * @return {Highcharts.PositionObject}
     * The tick position.
     *
     * @emits Highcharts.Tick#event:afterGetPosition
     */
    Tick.prototype.getPosition = function (horiz, tickPos, tickmarkOffset, old) {
        var axis = this.axis, chart = axis.chart, cHeight = (old && chart.oldChartHeight) || chart.chartHeight, pos = {
            x: horiz ?
                correctFloat(axis.translate(tickPos + tickmarkOffset, void 0, void 0, old) +
                    axis.transB) :
                (axis.left +
                    axis.offset +
                    (axis.opposite ?
                        (((old && chart.oldChartWidth) ||
                            chart.chartWidth) -
                            axis.right -
                            axis.left) :
                        0)),
            y: horiz ?
                (cHeight -
                    axis.bottom +
                    axis.offset -
                    (axis.opposite ? axis.height : 0)) :
                correctFloat(cHeight -
                    axis.translate(tickPos + tickmarkOffset, void 0, void 0, old) -
                    axis.transB)
        };
        // Chrome workaround for #10516
        pos.y = clamp(pos.y, -1e9, 1e9);
        fireEvent(this, 'afterGetPosition', { pos: pos });
        return pos;
    };
    /**
     * Get the x, y position of the tick label
     * @private
     */
    Tick.prototype.getLabelPosition = function (x, y, label, horiz, labelOptions, tickmarkOffset, index, step) {
        var axis = this.axis, transA = axis.transA, reversed = ( // #7911
        axis.isLinked && axis.linkedParent ?
            axis.linkedParent.reversed :
            axis.reversed), staggerLines = axis.staggerLines, rotCorr = axis.tickRotCorr || { x: 0, y: 0 }, 
        // Adjust for label alignment if we use reserveSpace: true (#5286)
        labelOffsetCorrection = (!horiz && !axis.reserveSpaceDefault ?
            -axis.labelOffset * (axis.labelAlign === 'center' ? 0.5 : 1) :
            0), distance = labelOptions.distance, pos = {};
        var yOffset, line;
        if (axis.side === 0) {
            yOffset = label.rotation ? -distance : -label.getBBox().height;
        }
        else if (axis.side === 2) {
            yOffset = rotCorr.y + distance;
        }
        else {
            // #3140, #3140
            yOffset = Math.cos(label.rotation * deg2rad) *
                (rotCorr.y - label.getBBox(false, 0).height / 2);
        }
        if (defined(labelOptions.y)) {
            yOffset = axis.side === 0 && axis.horiz ?
                labelOptions.y + yOffset :
                labelOptions.y;
        }
        x = x +
            pick(labelOptions.x, [0, 1, 0, -1][axis.side] * distance) +
            labelOffsetCorrection +
            rotCorr.x -
            (tickmarkOffset && horiz ?
                tickmarkOffset * transA * (reversed ? -1 : 1) :
                0);
        y = y + yOffset - (tickmarkOffset && !horiz ?
            tickmarkOffset * transA * (reversed ? 1 : -1) : 0);
        // Correct for staggered labels
        if (staggerLines) {
            line = (index / (step || 1) % staggerLines);
            if (axis.opposite) {
                line = staggerLines - line - 1;
            }
            y += line * (axis.labelOffset / staggerLines);
        }
        pos.x = x;
        pos.y = Math.round(y);
        fireEvent(this, 'afterGetLabelPosition', { pos: pos, tickmarkOffset: tickmarkOffset, index: index });
        return pos;
    };
    /**
     * Get the offset height or width of the label
     *
     * @private
     * @function Highcharts.Tick#getLabelSize
     */
    Tick.prototype.getLabelSize = function () {
        return this.label ?
            this.label.getBBox()[this.axis.horiz ? 'height' : 'width'] :
            0;
    };
    /**
     * Extendible method to return the path of the marker
     * @private
     */
    Tick.prototype.getMarkPath = function (x, y, tickLength, tickWidth, horiz, renderer) {
        if (horiz === void 0) { horiz = false; }
        return renderer.crispLine([[
                'M',
                x,
                y
            ], [
                'L',
                x + (horiz ? 0 : -tickLength),
                y + (horiz ? tickLength : 0)
            ]], tickWidth);
    };
    /**
     * Handle the label overflow by adjusting the labels to the left and right
     * edge, or hide them if they collide into the neighbour label.
     *
     * @private
     * @function Highcharts.Tick#handleOverflow
     */
    Tick.prototype.handleOverflow = function (xy) {
        var _a;
        var tick = this, axis = this.axis, labelOptions = axis.options.labels, pxPos = xy.x, chartWidth = axis.chart.chartWidth, spacing = axis.chart.spacing, leftBound = pick(axis.labelLeft, Math.min(axis.pos, spacing[3])), rightBound = pick(axis.labelRight, Math.max(!axis.isRadial ? axis.pos + axis.len : 0, chartWidth - spacing[1])), label = this.label, rotation = this.rotation, factor = getAlignFactor(axis.labelAlign || label.attr('align')), labelWidth = label.getBBox().width, slotWidth = axis.getSlotWidth(tick), xCorrection = factor, css = {};
        var modifiedSlotWidth = slotWidth, goRight = 1, leftPos, rightPos, textWidth;
        // Check if the label overshoots the chart spacing box. If it does, move
        // it. If it now overshoots the slotWidth, add ellipsis.
        if (!rotation && labelOptions.overflow === 'justify') {
            leftPos = pxPos - factor * labelWidth;
            rightPos = pxPos + (1 - factor) * labelWidth;
            if (leftPos < leftBound) {
                modifiedSlotWidth =
                    xy.x + modifiedSlotWidth * (1 - factor) - leftBound;
            }
            else if (rightPos > rightBound) {
                modifiedSlotWidth =
                    rightBound - xy.x + modifiedSlotWidth * factor;
                goRight = -1;
            }
            modifiedSlotWidth = Math.min(slotWidth, modifiedSlotWidth); // #4177
            if (modifiedSlotWidth < slotWidth && axis.labelAlign === 'center') {
                xy.x += (goRight *
                    (slotWidth -
                        modifiedSlotWidth -
                        xCorrection * (slotWidth - Math.min(labelWidth, modifiedSlotWidth))));
            }
            // If the label width exceeds the available space, set a text width
            // to be picked up below. Also, if a width has been set before, we
            // need to set a new one because the reported labelWidth will be
            // limited by the box (#3938).
            if (labelWidth > modifiedSlotWidth ||
                (axis.autoRotation && ((_a = label === null || label === void 0 ? void 0 : label.styles) === null || _a === void 0 ? void 0 : _a.width))) {
                textWidth = modifiedSlotWidth;
            }
            // Add ellipsis to prevent rotated labels to be clipped against the edge
            // of the chart
        }
        else if (rotation < 0 &&
            pxPos - factor * labelWidth < leftBound) {
            textWidth = Math.round(pxPos / Math.cos(rotation * deg2rad) - leftBound);
        }
        else if (rotation > 0 &&
            pxPos + factor * labelWidth > rightBound) {
            textWidth = Math.round((chartWidth - pxPos) /
                Math.cos(rotation * deg2rad));
        }
        if (textWidth && label) {
            if (tick.shortenLabel) {
                tick.shortenLabel();
            }
            else {
                label.css(extend(css, {
                    width: Math.floor(textWidth) + 'px',
                    lineClamp: axis.isRadial ? 0 : 1
                }));
            }
        }
    };
    /**
     * Try to replace the label if the same one already exists.
     *
     * @private
     * @function Highcharts.Tick#moveLabel
     */
    Tick.prototype.moveLabel = function (str, labelOptions) {
        var tick = this, label = tick.label, axis = tick.axis;
        var moved = false, labelPos;
        if (label && label.textStr === str) {
            tick.movedLabel = label;
            moved = true;
            delete tick.label;
        }
        else { // Find a label with the same string
            objectEach(axis.ticks, function (currentTick) {
                if (!moved &&
                    !currentTick.isNew &&
                    currentTick !== tick &&
                    currentTick.label &&
                    currentTick.label.textStr === str) {
                    tick.movedLabel = currentTick.label;
                    moved = true;
                    currentTick.labelPos = tick.movedLabel.xy;
                    delete currentTick.label;
                }
            });
        }
        // Create new label if the actual one is moved
        if (!moved && (tick.labelPos || label)) {
            labelPos = tick.labelPos || label.xy;
            tick.movedLabel = tick.createLabel(str, labelOptions, labelPos);
            if (tick.movedLabel) {
                tick.movedLabel.attr({ opacity: 0 });
            }
        }
    };
    /**
     * Put everything in place
     *
     * @private
     * @param {number} index
     *
     * @param {boolean} [old]
     * Use old coordinates to prepare an animation into new position
     *
     * @param {number} [opacity]
     */
    Tick.prototype.render = function (index, old, opacity) {
        var _a;
        var tick = this, axis = tick.axis, horiz = axis.horiz, pos = tick.pos, tickmarkOffset = pick(tick.tickmarkOffset, axis.tickmarkOffset), xy = tick.getPosition(horiz, pos, tickmarkOffset, old), x = xy.x, y = xy.y, axisStart = axis.pos, axisEnd = axisStart + axis.len, pxPos = horiz ? x : y;
        var labelOpacity = pick(opacity, (_a = tick.label) === null || _a === void 0 ? void 0 : _a.newOpacity, // #15528
        1);
        // Anything that is not between `axis.pos` and `axis.pos + axis.length`
        // should not be visible (#20166). The `correctFloat` is for reversed
        // axes in Safari.
        if (!axis.chart.polar &&
            (correctFloat(pxPos) < axisStart || pxPos > axisEnd)) {
            opacity = 0;
        }
        opacity !== null && opacity !== void 0 ? opacity : (opacity = 1);
        this.isActive = true;
        // Create the grid line
        this.renderGridLine(old, opacity);
        // Create the tick mark
        this.renderMark(xy, opacity);
        // The label is created on init - now move it into place
        this.renderLabel(xy, old, labelOpacity, index);
        tick.isNew = false;
        fireEvent(this, 'afterRender');
    };
    /**
     * Renders the gridLine.
     *
     * @private
     * @function Highcharts.Tick#renderGridLine
     * @param {boolean} old  Whether or not the tick is old
     * @param {number} opacity  The opacity of the grid line
     */
    Tick.prototype.renderGridLine = function (old, opacity) {
        var tick = this, axis = tick.axis, options = axis.options, attribs = {}, pos = tick.pos, type = tick.type, tickmarkOffset = pick(tick.tickmarkOffset, axis.tickmarkOffset), renderer = axis.chart.renderer;
        var gridLine = tick.gridLine, gridLinePath, gridLineWidth = options.gridLineWidth, gridLineColor = options.gridLineColor, dashStyle = options.gridLineDashStyle;
        if (tick.type === 'minor') {
            gridLineWidth = options.minorGridLineWidth;
            gridLineColor = options.minorGridLineColor;
            dashStyle = options.minorGridLineDashStyle;
        }
        if (!gridLine) {
            if (!axis.chart.styledMode) {
                attribs.stroke = gridLineColor;
                attribs['stroke-width'] = gridLineWidth || 0;
                attribs.dashstyle = dashStyle;
            }
            if (!type) {
                attribs.zIndex = 1;
            }
            if (old) {
                opacity = 0;
            }
            /**
             * The rendered grid line of the tick.
             * @name Highcharts.Tick#gridLine
             * @type {Highcharts.SVGElement|undefined}
             */
            tick.gridLine = gridLine = renderer.path()
                .attr(attribs)
                .addClass('highcharts-' + (type ? type + '-' : '') + 'grid-line')
                .add(axis.gridGroup);
        }
        if (gridLine) {
            gridLinePath = axis.getPlotLinePath({
                value: pos + tickmarkOffset,
                lineWidth: gridLine.strokeWidth(),
                force: 'pass',
                old: old,
                acrossPanes: false // #18025
            });
            // If the parameter 'old' is set, the current call will be followed
            // by another call, therefore do not do any animations this time
            if (gridLinePath) {
                gridLine[old || tick.isNew ? 'attr' : 'animate']({
                    d: gridLinePath,
                    opacity: opacity
                });
            }
        }
    };
    /**
     * Renders the tick mark.
     *
     * @private
     * @function Highcharts.Tick#renderMark
     * @param {Highcharts.PositionObject} xy  The position vector of the mark
     * @param {number} opacity  The opacity of the mark
     */
    Tick.prototype.renderMark = function (xy, opacity) {
        var tick = this, axis = tick.axis, options = axis.options, renderer = axis.chart.renderer, type = tick.type, tickSize = axis.tickSize(type ? type + 'Tick' : 'tick'), x = xy.x, y = xy.y, tickWidth = pick(options[type !== 'minor' ? 'tickWidth' : 'minorTickWidth'], !type && axis.isXAxis ? 1 : 0), // X axis defaults to 1
        tickColor = options[type !== 'minor' ? 'tickColor' : 'minorTickColor'];
        var mark = tick.mark;
        var isNewMark = !mark;
        if (tickSize) {
            // Negate the length
            if (axis.opposite) {
                tickSize[0] = -tickSize[0];
            }
            // First time, create it
            if (!mark) {
                /**
                 * The rendered mark of the tick.
                 * @name Highcharts.Tick#mark
                 * @type {Highcharts.SVGElement|undefined}
                 */
                tick.mark = mark = renderer.path()
                    .addClass('highcharts-' + (type ? type + '-' : '') + 'tick')
                    .add(axis.axisGroup);
                if (!axis.chart.styledMode) {
                    mark.attr({
                        stroke: tickColor,
                        'stroke-width': tickWidth
                    });
                }
            }
            mark[isNewMark ? 'attr' : 'animate']({
                d: tick.getMarkPath(x, y, tickSize[0], mark.strokeWidth(), axis.horiz, renderer),
                opacity: opacity
            });
        }
    };
    /**
     * Renders the tick label.
     * Note: The label should already be created in init(), so it should only
     * have to be moved into place.
     *
     * @private
     * @function Highcharts.Tick#renderLabel
     * @param {Highcharts.PositionObject} xy  The position vector of the label
     * @param {boolean} old  Whether or not the tick is old
     * @param {number} opacity  The opacity of the label
     * @param {number} index  The index of the tick
     */
    Tick.prototype.renderLabel = function (xy, old, opacity, index) {
        var tick = this, axis = tick.axis, horiz = axis.horiz, options = axis.options, label = tick.label, labelOptions = options.labels, step = labelOptions.step, tickmarkOffset = pick(tick.tickmarkOffset, axis.tickmarkOffset), x = xy.x, y = xy.y;
        var show = true;
        if (label && isNumber(x)) {
            label.xy = xy = tick.getLabelPosition(x, y, label, horiz, labelOptions, tickmarkOffset, index, step);
            // Apply show first and show last. If the tick is both first and
            // last, it is a single centered tick, in which case we show the
            // label anyway (#2100).
            if ((tick.isFirst &&
                !tick.isLast &&
                !options.showFirstLabel) ||
                (tick.isLast &&
                    !tick.isFirst &&
                    !options.showLastLabel)) {
                show = false;
                // Handle label overflow and show or hide accordingly
            }
            else if (horiz &&
                !labelOptions.step &&
                !labelOptions.rotation &&
                !old &&
                opacity !== 0) {
                tick.handleOverflow(xy);
            }
            // Apply step
            if (step && index % step) {
                // Show those indices dividable by step
                show = false;
            }
            // Set the new position, and show or hide
            if (show && isNumber(xy.y)) {
                xy.opacity = opacity;
                label[tick.isNewLabel ? 'attr' : 'animate'](xy).show(true);
                tick.isNewLabel = false;
            }
            else {
                label.hide(); // #1338, #15863
                tick.isNewLabel = true;
            }
        }
    };
    /**
     * Replace labels with the moved ones to perform animation. Additionally
     * destroy unused labels.
     *
     * @private
     * @function Highcharts.Tick#replaceMovedLabel
     */
    Tick.prototype.replaceMovedLabel = function () {
        var tick = this, label = tick.label, axis = tick.axis;
        // Animate and destroy
        if (label && !tick.isNew) {
            label.animate({ opacity: 0 }, void 0, label.destroy);
            delete tick.label;
        }
        axis.isDirty = true;
        tick.label = tick.movedLabel;
        delete tick.movedLabel;
    };
    return Tick;
}());
/* *
 *
 *  Default Export
 *
 * */
export default Tick;
/* *
 *
 *  API Declarations
 *
 * */
/**
 * Optional parameters for the tick.
 * @private
 * @interface Highcharts.TickParametersObject
 */ /**
* Set category for the tick.
* @name Highcharts.TickParametersObject#category
* @type {string|undefined}
*/ /**
* @name Highcharts.TickParametersObject#options
* @type {Highcharts.Dictionary<any>|undefined}
*/ /**
* Set tickmarkOffset for the tick.
* @name Highcharts.TickParametersObject#tickmarkOffset
* @type {number|undefined}
*/
/**
 * Additional time tick information.
 *
 * @interface Highcharts.TimeTicksInfoObject
 * @extends Highcharts.TimeNormalizedObject
 */ /**
* @name Highcharts.TimeTicksInfoObject#higherRanks
* @type {Array<string>}
*/ /**
* @name Highcharts.TimeTicksInfoObject#totalRange
* @type {number}
*/
(''); // Keeps doclets above in JS file
