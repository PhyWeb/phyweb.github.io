/* *
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
import Annotation from '../Annotation.js';
import D from '../../../Core/Defaults.js';
const { defaultOptions } = D;
import MockPoint from '../MockPoint.js';
import U from '../../../Core/Utilities.js';
const { merge, pick } = U;
if (defaultOptions.annotations) {
    /**
     * Options for the vertical line annotation type.
     *
     * @sample highcharts/annotations-advanced/vertical-line/
     *         Vertical line
     *
     * @extends      annotations.types.crookedLine
     * @excluding    labels, shapes, controlPointOptions
     * @product      highstock
     * @optionparent annotations.types.verticalLine
     */
    defaultOptions.annotations.types.verticalLine = {
        typeOptions: {
            /**
             * @ignore
             */
            yOffset: 10,
            /**
             * Label options.
             *
             * @extends annotations.types.crookedLine.labelOptions
             */
            label: {
                offset: -40,
                point: function (target) {
                    return target.annotation.points[0];
                },
                allowOverlap: true,
                backgroundColor: 'none',
                borderWidth: 0,
                crop: true,
                overflow: 'none',
                shape: 'rect',
                text: '{y:.2f}'
            },
            /**
             * Connector options.
             *
             * @extends   annotations.types.crookedLine.shapeOptions
             * @excluding height, r, type, width
             */
            connector: {
                strokeWidth: 1,
                markerEnd: 'arrow'
            }
        },
        labelOptions: {
            style: {
                color: "#333333" /* Palette.neutralColor80 */,
                fontSize: '0.7em'
            }
        }
    };
}
/* *
 *
 *  Class
 *
 * */
class VerticalLine extends Annotation {
    static connectorFirstPoint(target) {
        const annotation = target.annotation, chart = annotation.chart, inverted = chart.inverted, point = annotation.points[0], left = pick(point.series.yAxis && point.series.yAxis.left, 0), top = pick(point.series.yAxis && point.series.yAxis.top, 0), offset = annotation.options.typeOptions.label.offset, y = MockPoint.pointToPixels(point, true)[inverted ? 'x' : 'y'];
        return {
            x: point.x,
            xAxis: point.series.xAxis,
            y: y + offset +
                (inverted ? (left - chart.plotLeft) : (top - chart.plotTop))
        };
    }
    static connectorSecondPoint(target) {
        const annotation = target.annotation, chart = annotation.chart, inverted = chart.inverted, typeOptions = annotation.options.typeOptions, point = annotation.points[0], left = pick(point.series.yAxis && point.series.yAxis.left, 0), top = pick(point.series.yAxis && point.series.yAxis.top, 0), y = MockPoint.pointToPixels(point, true)[inverted ? 'x' : 'y'];
        let yOffset = typeOptions.yOffset;
        if (typeOptions.label.offset < 0) {
            yOffset *= -1;
        }
        return {
            x: point.x,
            xAxis: point.series.xAxis,
            y: y + yOffset +
                (inverted ? (left - chart.plotLeft) : (top - chart.plotTop))
        };
    }
    /* *
     *
     *  Functions
     *
     * */
    getPointsOptions() {
        return [this.options.typeOptions.point];
    }
    addShapes() {
        const typeOptions = this.options.typeOptions, connector = this.initShape(merge(typeOptions.connector, {
            type: 'path',
            points: [
                VerticalLine.connectorFirstPoint,
                VerticalLine.connectorSecondPoint
            ],
            className: 'highcharts-vertical-line'
        }), 0);
        typeOptions.connector = connector.options;
        this.userOptions.typeOptions.point = typeOptions.point;
    }
    addLabels() {
        const typeOptions = this.options.typeOptions, labelOptions = typeOptions.label;
        let x = 0, y = labelOptions.offset, verticalAlign = labelOptions.offset < 0 ? 'bottom' : 'top', align = 'center';
        if (this.chart.inverted) {
            x = labelOptions.offset;
            y = 0;
            verticalAlign = 'middle';
            align = labelOptions.offset < 0 ? 'right' : 'left';
        }
        const label = this.initLabel(merge(labelOptions, {
            verticalAlign: verticalAlign,
            align: align,
            x: x,
            y: y
        }));
        typeOptions.label = label.options;
    }
}
Annotation.types.verticalLine = VerticalLine;
/* *
 *
 *  Default Export
 *
 * */
export default VerticalLine;
