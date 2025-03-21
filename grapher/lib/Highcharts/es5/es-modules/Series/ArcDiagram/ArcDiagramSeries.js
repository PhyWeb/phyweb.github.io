/* *
 *
 *  Arc diagram module
 *
 *  (c) 2021 Piotr Madej, Grzegorz Blachliński
 *
 *  License: www.highcharts.com/license
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import ArcDiagramPoint from './ArcDiagramPoint.js';
import ArcDiagramSeriesDefaults from './ArcDiagramSeriesDefaults.js';
import SankeyColumnComposition from '../Sankey/SankeyColumnComposition.js';
import Series from '../../Core/Series/Series.js';
import SeriesRegistry from '../../Core/Series/SeriesRegistry.js';
import SVGRenderer from '../../Core/Renderer/SVG/SVGRenderer.js';
import U from '../../Core/Utilities.js';
import SVGElement from '../../Core/Renderer/SVG/SVGElement.js';
import TextPath from '../../Extensions/TextPath.js';
TextPath.compose(SVGElement);
var symbols = SVGRenderer.prototype.symbols;
var _a = SeriesRegistry.seriesTypes, ColumnSeries = _a.column, SankeySeries = _a.sankey;
var crisp = U.crisp, extend = U.extend, merge = U.merge, pick = U.pick, relativeLength = U.relativeLength;
/* *
 *
 *  Class
 *
 * */
/**
 * @private
 * @class
 * @name Highcharts.seriesTypes.arcdiagram
 *
 * @augments Highcharts.seriesTypes.sankey
 */
var ArcDiagramSeries = /** @class */ (function (_super) {
    __extends(ArcDiagramSeries, _super);
    function ArcDiagramSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Create node columns by analyzing the nodes and the relations between
     * incoming and outgoing links.
     * @private
     */
    ArcDiagramSeries.prototype.createNodeColumns = function () {
        var _this = this;
        var series = this, chart = series.chart, 
        // Column needs casting, to much methods required at the same time
        column = SankeyColumnComposition.compose([], series);
        column.sankeyColumn.maxLength = chart.inverted ?
            chart.plotHeight : chart.plotWidth;
        // Get the translation factor needed for each column to fill up the plot
        // height
        column.sankeyColumn.getTranslationFactor = function (series) {
            var nodes = column.slice(), minLinkWidth = _this.options.minLinkWidth || 0;
            var skipPoint, factor = 0, i, radius, maxRadius = 0, scale = 1, additionalSpace = 0, remainingWidth = (chart.plotSizeX || 0) -
                (series.options.marker &&
                    series.options.marker.lineWidth || 0) -
                (column.length - 1) *
                    series.nodePadding;
            // Because the minLinkWidth option doesn't obey the direct
            // translation, we need to run translation iteratively, check node
            // heights, remove those nodes affected by minLinkWidth, check
            // again, etc.
            while (column.length) {
                factor = remainingWidth / column.sankeyColumn.sum();
                skipPoint = false;
                i = column.length;
                while (i--) {
                    radius = (column[i].getSum()) * factor * scale;
                    var plotArea = Math.min(chart.plotHeight, chart.plotWidth);
                    if (radius > plotArea) {
                        scale = Math.min(plotArea / radius, scale);
                    }
                    else if (radius < minLinkWidth) {
                        column.splice(i, 1);
                        remainingWidth -= minLinkWidth;
                        radius = minLinkWidth;
                        skipPoint = true;
                    }
                    additionalSpace += radius * (1 - scale) / 2;
                    maxRadius = Math.max(maxRadius, radius);
                }
                if (!skipPoint) {
                    break;
                }
            }
            // Re-insert original nodes
            column.length = 0;
            nodes.forEach(function (node) {
                node.scale = scale;
                column.push(node);
            });
            column.sankeyColumn.maxRadius = maxRadius;
            column.sankeyColumn.scale = scale;
            column.sankeyColumn.additionalSpace = additionalSpace;
            return factor;
        };
        column.sankeyColumn.offset = function (node, factor) {
            var equalNodes = node.series.options.equalNodes, nodePadding = series.nodePadding, maxRadius = Math.min(chart.plotWidth, chart.plotHeight, (column.sankeyColumn.maxLength || 0) /
                series.nodes.length - nodePadding);
            var offset = column.sankeyColumn.additionalSpace || 0, totalNodeOffset;
            for (var i = 0; i < column.length; i++) {
                var sum = column[i].getSum() *
                    (column.sankeyColumn.scale || 0);
                var width = equalNodes ?
                    maxRadius :
                    Math.max(sum * factor, series.options.minLinkWidth || 0);
                if (sum) {
                    totalNodeOffset = width + nodePadding;
                }
                else {
                    // If node sum equals 0 nodePadding is missed #12453
                    totalNodeOffset = 0;
                }
                if (column[i] === node) {
                    return {
                        relativeLeft: offset + relativeLength(node.options.offset || 0, totalNodeOffset)
                    };
                }
                offset += totalNodeOffset;
            }
        };
        // Add nodes directly to the column right after it's creation
        series.nodes.forEach(function (node) {
            node.column = 0;
            column.push(node);
        });
        return [column];
    };
    /**
     * Run translation operations for one link.
     * @private
     */
    ArcDiagramSeries.prototype.translateLink = function (point) {
        var _a, _b;
        var series = this, fromNode = point.fromNode, toNode = point.toNode, chart = this.chart, translationFactor = series.translationFactor, pointOptions = point.options, seriesOptions = series.options, linkWeight = pick(pointOptions.linkWeight, seriesOptions.linkWeight, Math.max((point.weight || 0) *
            translationFactor *
            fromNode.scale, (series.options.minLinkWidth || 0))), centeredLinks = point.series.options.centeredLinks, nodeTop = fromNode.nodeY;
        var getX = function (node, fromOrTo) {
            var linkLeft = ((node.offset(point, fromOrTo) || 0) *
                translationFactor);
            var x = Math.min(node.nodeX + linkLeft, 
            // Prevent links from spilling below the node (#12014)
            node.nodeX + (node.shapeArgs && node.shapeArgs.height || 0) - linkWeight);
            return x;
        };
        var fromX = centeredLinks ?
            fromNode.nodeX +
                ((fromNode.shapeArgs.height || 0) - linkWeight) / 2 :
            getX(fromNode, 'linksFrom'), toX = centeredLinks ? toNode.nodeX +
            ((toNode.shapeArgs.height || 0) - linkWeight) / 2 :
            getX(toNode, 'linksTo'), bottom = nodeTop;
        if (fromX > toX) {
            _a = [toX, fromX], fromX = _a[0], toX = _a[1];
        }
        if (seriesOptions.reversed) {
            _b = [toX, fromX], fromX = _b[0], toX = _b[1];
            bottom = (chart.plotSizeY || 0) - bottom;
        }
        point.shapeType = 'path';
        point.linkBase = [
            fromX,
            fromX + linkWeight,
            toX,
            toX + linkWeight
        ];
        var linkRadius = ((toX + linkWeight - fromX) / Math.abs(toX + linkWeight - fromX)) * pick(seriesOptions.linkRadius, Math.min(Math.abs(toX + linkWeight - fromX) / 2, fromNode.nodeY - Math.abs(linkWeight)));
        point.shapeArgs = {
            d: [
                ['M', fromX, bottom],
                [
                    'A',
                    (toX + linkWeight - fromX) / 2,
                    linkRadius,
                    0,
                    0,
                    1,
                    toX + linkWeight,
                    bottom
                ],
                ['L', toX, bottom],
                [
                    'A',
                    (toX - fromX - linkWeight) / 2,
                    linkRadius - linkWeight,
                    0,
                    0,
                    0,
                    fromX + linkWeight,
                    bottom
                ],
                ['Z']
            ]
        };
        point.dlBox = {
            x: fromX + (toX - fromX) / 2,
            y: bottom - linkRadius,
            height: linkWeight,
            width: 0
        };
        // And set the tooltip anchor in the middle
        point.tooltipPos = chart.inverted ? [
            (chart.plotSizeY || 0) - point.dlBox.y - linkWeight / 2,
            (chart.plotSizeX || 0) - point.dlBox.x
        ] : [
            point.dlBox.x,
            point.dlBox.y + linkWeight / 2
        ];
        // Pass test in drawPoints
        point.y = point.plotY = 1;
        point.x = point.plotX = 1;
        if (!point.color) {
            point.color = fromNode.color;
        }
    };
    /**
     * Run translation operations for one node.
     * @private
     */
    ArcDiagramSeries.prototype.translateNode = function (node, column) {
        var _a;
        var series = this, translationFactor = series.translationFactor, chart = series.chart, maxNodesLength = chart.inverted ?
            chart.plotWidth : chart.plotHeight, options = series.options, maxRadius = Math.min(chart.plotWidth, chart.plotHeight, maxNodesLength / node.series.nodes.length - this.nodePadding), sum = node.getSum() * (column.sankeyColumn.scale || 0), equalNodes = options.equalNodes, nodeHeight = equalNodes ?
            maxRadius :
            Math.max(sum * translationFactor, this.options.minLinkWidth || 0), lineWidth = ((_a = options.marker) === null || _a === void 0 ? void 0 : _a.lineWidth) || 0, nodeOffset = column.sankeyColumn.offset(node, translationFactor), fromNodeLeft = crisp(pick(nodeOffset && nodeOffset.absoluteLeft, ((column.sankeyColumn.left(translationFactor) || 0) +
            (nodeOffset && nodeOffset.relativeLeft || 0))), lineWidth), markerOptions = merge(options.marker, node.options.marker), symbol = markerOptions.symbol, markerRadius = markerOptions.radius, top = parseInt(options.offset, 10) *
            ((chart.inverted ?
                chart.plotWidth : chart.plotHeight) - (crisp(this.colDistance * (node.column || 0) +
                (markerOptions.lineWidth || 0) / 2, lineWidth) +
                (column.sankeyColumn.scale || 0) *
                    (column.sankeyColumn.maxRadius || 0) / 2)) / 100;
        node.sum = sum;
        // If node sum is 0, don’t render the rect #12453
        if (sum) {
            // Draw the node
            node.nodeX = fromNodeLeft;
            node.nodeY = top;
            var x = fromNodeLeft, width = node.options.width || options.width || nodeHeight, height = node.options.height || options.height || nodeHeight;
            var y = top;
            if (options.reversed) {
                y = (chart.plotSizeY || 0) - top;
                if (chart.inverted) {
                    y = (chart.plotSizeY || 0) - top;
                }
            }
            if (this.mapOptionsToLevel) {
                // Calculate data label options for the point
                node.dlOptions = SankeySeries.getDLOptions({
                    level: this.mapOptionsToLevel[node.level],
                    optionsPoint: node.options
                });
            }
            // Pass test in drawPoints
            node.plotX = 1;
            node.plotY = 1;
            // Set the anchor position for tooltips
            node.tooltipPos = chart.inverted ? [
                (chart.plotSizeY || 0) - y - height / 2,
                (chart.plotSizeX || 0) - x - width / 2
            ] : [
                x + width / 2,
                y + height / 2
            ];
            node.shapeType = 'path';
            node.shapeArgs = {
                d: symbols[symbol || 'circle'](x, y - (markerRadius || height) / 2, markerRadius || width, markerRadius || height),
                width: markerRadius || width,
                height: markerRadius || height
            };
            node.dlBox = {
                x: x + width / 2,
                y: y,
                height: 0,
                width: 0
            };
        }
        else {
            node.dlOptions = {
                enabled: false
            };
        }
    };
    // Networkgraph has two separate collecions of nodes and lines, render
    // dataLabels for both sets:
    ArcDiagramSeries.prototype.drawDataLabels = function () {
        if (this.options.dataLabels) {
            var textPath = this.options.dataLabels.textPath;
            // Render node labels:
            ColumnSeries.prototype.drawDataLabels.call(this, this.nodes);
            // Render link labels:
            this.options.dataLabels.textPath =
                this.options.dataLabels.linkTextPath;
            ColumnSeries.prototype.drawDataLabels.call(this, this.data);
            // Restore nodes
            this.options.dataLabels.textPath = textPath;
        }
    };
    ArcDiagramSeries.prototype.pointAttribs = function (point, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state) {
        if (point && point.isNode) {
            var attrs = __rest(Series.prototype.pointAttribs
                .apply(this, arguments), []);
            return attrs;
        }
        return _super.prototype.pointAttribs.apply(this, arguments);
    };
    ArcDiagramSeries.prototype.markerAttribs = function (point) {
        if (point.isNode) {
            return _super.prototype.markerAttribs.apply(this, arguments);
        }
        return {};
    };
    /* *
     *
     *  Static Properties
     *
     * */
    ArcDiagramSeries.defaultOptions = merge(SankeySeries.defaultOptions, ArcDiagramSeriesDefaults);
    return ArcDiagramSeries;
}(SankeySeries));
extend(ArcDiagramSeries.prototype, {
    orderNodes: false
});
ArcDiagramSeries.prototype.pointClass = ArcDiagramPoint;
SeriesRegistry.registerSeriesType('arcdiagram', ArcDiagramSeries);
/* *
 *
 *  Default Export
 *
 * */
export default ArcDiagramSeries;
