/* *
 *
 *  (c) 2009-2025 Øystein Moseng
 *
 *  Accessibility component for chart info region and table.
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
import A11yI18n from '../A11yI18n.js';
import AccessibilityComponent from '../AccessibilityComponent.js';
import Announcer from '../Utils/Announcer.js';
import AnnotationsA11y from './AnnotationsA11y.js';
const { getAnnotationsInfoHTML } = AnnotationsA11y;
import AST from '../../Core/Renderer/HTML/AST.js';
import CU from '../Utils/ChartUtilities.js';
const { getAxisDescription, getAxisRangeDescription, getChartTitle, unhideChartElementFromAT } = CU;
import F from '../../Core/Templating.js';
const { format } = F;
import H from '../../Core/Globals.js';
const { doc } = H;
import HU from '../Utils/HTMLUtilities.js';
const { addClass, getElement, getHeadingTagNameForElement, stripHTMLTagsFromString, visuallyHideElement } = HU;
import U from '../../Core/Utilities.js';
const { attr, pick, replaceNested } = U;
/* *
 *
 *  Functions
 *
 * */
/* eslint-disable valid-jsdoc */
/**
 * @private
 */
function getTableSummary(chart) {
    return chart.langFormat('accessibility.table.tableSummary', { chart: chart });
}
/**
 * @private
 */
function getTypeDescForMapChart(chart, formatContext) {
    return formatContext.mapTitle ?
        chart.langFormat('accessibility.chartTypes.mapTypeDescription', formatContext) :
        chart.langFormat('accessibility.chartTypes.unknownMap', formatContext);
}
/**
 * @private
 */
function getTypeDescForCombinationChart(chart, formatContext) {
    return chart.langFormat('accessibility.chartTypes.combinationChart', formatContext);
}
/**
 * @private
 */
function getTypeDescForEmptyChart(chart, formatContext) {
    return chart.langFormat('accessibility.chartTypes.emptyChart', formatContext);
}
/**
 * @private
 */
function buildTypeDescriptionFromSeries(chart, types, context) {
    const firstType = types[0], typeExplanation = chart.langFormat('accessibility.seriesTypeDescriptions.' + firstType, context), multi = chart.series && chart.series.length < 2 ? 'Single' : 'Multiple';
    return (chart.langFormat('accessibility.chartTypes.' + firstType + multi, context) ||
        chart.langFormat('accessibility.chartTypes.default' + multi, context)) + (typeExplanation ? ' ' + typeExplanation : '');
}
/**
 * Return simplified explanation of chart type. Some types will not be
 * familiar to most users, but in those cases we try to add an explanation
 * of the type.
 *
 * @private
 * @function Highcharts.Chart#getTypeDescription
 * @param {Array<string>} types The series types in this chart.
 * @return {string} The text description of the chart type.
 */
function getTypeDescription(chart, types) {
    const firstType = types[0], firstSeries = chart.series && chart.series[0] || {}, mapTitle = chart.mapView && chart.mapView.geoMap &&
        chart.mapView.geoMap.title, formatContext = {
        numSeries: chart.series.length,
        numPoints: firstSeries.points && firstSeries.points.length,
        chart,
        mapTitle
    };
    if (!firstType) {
        return getTypeDescForEmptyChart(chart, formatContext);
    }
    if (firstType === 'map' || firstType === 'tiledwebmap') {
        return getTypeDescForMapChart(chart, formatContext);
    }
    if (chart.types.length > 1) {
        return getTypeDescForCombinationChart(chart, formatContext);
    }
    return buildTypeDescriptionFromSeries(chart, types, formatContext);
}
/**
 * @private
 */
function stripEmptyHTMLTags(str) {
    // Scan alert #[71]: Loop for nested patterns
    return replaceNested(str, [/<([\w\-.:!]+)\b[^<>]*>\s*<\/\1>/g, '']);
}
/* *
 *
 *  Class
 *
 * */
/**
 * The InfoRegionsComponent class
 *
 * @private
 * @class
 * @name Highcharts.InfoRegionsComponent
 */
class InfoRegionsComponent extends AccessibilityComponent {
    constructor() {
        /* *
         *
         *  Properties
         *
         * */
        super(...arguments);
        this.screenReaderSections = {};
    }
    /* *
     *
     *  Functions
     *
     * */
    /* eslint-disable valid-jsdoc */
    /**
     * Init the component
     * @private
     */
    init() {
        const chart = this.chart;
        const component = this;
        this.initRegionsDefinitions();
        this.addEvent(chart, 'afterGetTableAST', function (e) {
            component.onDataTableCreated(e);
        });
        this.addEvent(chart, 'afterViewData', function (e) {
            if (e.wasHidden) {
                component.dataTableDiv = e.element;
                // Use a small delay to give browsers & AT time to
                // register the new table.
                setTimeout(function () {
                    component.focusDataTable();
                }, 300);
            }
        });
        this.addEvent(chart, 'afterHideData', function () {
            if (component.viewDataTableButton) {
                component.viewDataTableButton
                    .setAttribute('aria-expanded', 'false');
            }
        });
        if (chart.exporting) {
            // Needed when print logic in exporting does not trigger
            // rerendering thus repositioning of screen reader DOM elements
            // (#21554)
            this.addEvent(chart, 'afterPrint', function () {
                component.updateAllScreenReaderSections();
            });
        }
        this.announcer = new Announcer(chart, 'assertive');
    }
    /**
     * @private
     */
    initRegionsDefinitions() {
        const component = this, accessibilityOptions = this.chart.options.accessibility;
        this.screenReaderSections = {
            before: {
                element: null,
                buildContent: function (chart) {
                    const formatter = accessibilityOptions.screenReaderSection
                        .beforeChartFormatter;
                    return formatter ? formatter(chart) :
                        component.defaultBeforeChartFormatter(chart);
                },
                insertIntoDOM: function (el, chart) {
                    chart.renderTo.insertBefore(el, chart.renderTo.firstChild);
                },
                afterInserted: function () {
                    if (typeof component.sonifyButtonId !== 'undefined') {
                        component.initSonifyButton(component.sonifyButtonId);
                    }
                    if (typeof component.dataTableButtonId !== 'undefined') {
                        component.initDataTableButton(component.dataTableButtonId);
                    }
                }
            },
            after: {
                element: null,
                buildContent: function (chart) {
                    const formatter = accessibilityOptions.screenReaderSection
                        .afterChartFormatter;
                    return formatter ? formatter(chart) :
                        component.defaultAfterChartFormatter();
                },
                insertIntoDOM: function (el, chart) {
                    chart.renderTo.insertBefore(el, chart.container.nextSibling);
                },
                afterInserted: function () {
                    if (component.chart.accessibility &&
                        accessibilityOptions.keyboardNavigation.enabled) {
                        component.chart.accessibility
                            .keyboardNavigation.updateExitAnchor(); // #15986
                    }
                }
            }
        };
    }
    /**
     * Called on chart render. Have to update the sections on render, in order
     * to get a11y info from series.
     */
    onChartRender() {
        this.linkedDescriptionElement = this.getLinkedDescriptionElement();
        this.setLinkedDescriptionAttrs();
        this.updateAllScreenReaderSections();
    }
    updateAllScreenReaderSections() {
        const component = this;
        Object.keys(this.screenReaderSections).forEach(function (regionKey) {
            component.updateScreenReaderSection(regionKey);
        });
    }
    /**
     * @private
     */
    getLinkedDescriptionElement() {
        const chartOptions = this.chart.options, linkedDescOption = chartOptions.accessibility.linkedDescription;
        if (!linkedDescOption) {
            return;
        }
        if (typeof linkedDescOption !== 'string') {
            return linkedDescOption;
        }
        const query = format(linkedDescOption, this.chart), queryMatch = doc.querySelectorAll(query);
        if (queryMatch.length === 1) {
            return queryMatch[0];
        }
    }
    /**
     * @private
     */
    setLinkedDescriptionAttrs() {
        const el = this.linkedDescriptionElement;
        if (el) {
            el.setAttribute('aria-hidden', 'true');
            addClass(el, 'highcharts-linked-description');
        }
    }
    /**
     * @private
     * @param {string} regionKey
     * The name/key of the region to update
     */
    updateScreenReaderSection(regionKey) {
        const chart = this.chart;
        const region = this.screenReaderSections[regionKey];
        const content = region.buildContent(chart);
        const sectionDiv = region.element = (region.element || this.createElement('div'));
        const hiddenDiv = (sectionDiv.firstChild || this.createElement('div'));
        if (content) {
            this.setScreenReaderSectionAttribs(sectionDiv, regionKey);
            AST.setElementHTML(hiddenDiv, content);
            sectionDiv.appendChild(hiddenDiv);
            region.insertIntoDOM(sectionDiv, chart);
            if (chart.styledMode) {
                addClass(hiddenDiv, 'highcharts-visually-hidden');
            }
            else {
                visuallyHideElement(hiddenDiv);
            }
            unhideChartElementFromAT(chart, hiddenDiv);
            if (region.afterInserted) {
                region.afterInserted();
            }
        }
        else {
            if (sectionDiv.parentNode) {
                sectionDiv.parentNode.removeChild(sectionDiv);
            }
            region.element = null;
        }
    }
    /**
     * Apply a11y attributes to a screen reader info section
     * @private
     * @param {Highcharts.HTMLDOMElement} sectionDiv The section element
     * @param {string} regionKey Name/key of the region we are setting attrs for
     */
    setScreenReaderSectionAttribs(sectionDiv, regionKey) {
        const chart = this.chart, labelText = chart.langFormat('accessibility.screenReaderSection.' + regionKey +
            'RegionLabel', { chart: chart, chartTitle: getChartTitle(chart) }), sectionId = `highcharts-screen-reader-region-${regionKey}-${chart.index}`;
        attr(sectionDiv, {
            id: sectionId,
            'aria-label': labelText || void 0
        });
        // Sections are wrapped to be positioned relatively to chart in case
        // elements inside are tabbed to.
        sectionDiv.style.position = 'relative';
        if (labelText) {
            sectionDiv.setAttribute('role', chart.options.accessibility.landmarkVerbosity === 'all' ?
                'region' : 'group');
        }
    }
    /**
     * @private
     */
    defaultBeforeChartFormatter() {
        const chart = this.chart, format = chart.options.accessibility.screenReaderSection
            .beforeChartFormat;
        if (!format) {
            return '';
        }
        const axesDesc = this.getAxesDescription(), shouldHaveSonifyBtn = (chart.sonify &&
            chart.options.sonification &&
            chart.options.sonification.enabled), sonifyButtonId = 'highcharts-a11y-sonify-data-btn-' +
            chart.index, dataTableButtonId = 'hc-linkto-highcharts-data-table-' +
            chart.index, annotationsList = getAnnotationsInfoHTML(chart), annotationsTitleStr = chart.langFormat('accessibility.screenReaderSection.annotations.heading', { chart: chart }), context = {
            headingTagName: getHeadingTagNameForElement(chart.renderTo),
            chartTitle: getChartTitle(chart),
            typeDescription: this.getTypeDescriptionText(),
            chartSubtitle: this.getSubtitleText(),
            chartLongdesc: this.getLongdescText(),
            xAxisDescription: axesDesc.xAxis,
            yAxisDescription: axesDesc.yAxis,
            playAsSoundButton: shouldHaveSonifyBtn ?
                this.getSonifyButtonText(sonifyButtonId) : '',
            viewTableButton: chart.exporting?.getCSV ?
                this.getDataTableButtonText(dataTableButtonId) : '',
            annotationsTitle: annotationsList ? annotationsTitleStr : '',
            annotationsList: annotationsList
        }, formattedString = A11yI18n.i18nFormat(format, context, chart);
        this.dataTableButtonId = dataTableButtonId;
        this.sonifyButtonId = sonifyButtonId;
        return stripEmptyHTMLTags(formattedString);
    }
    /**
     * @private
     */
    defaultAfterChartFormatter() {
        const chart = this.chart;
        const format = chart.options.accessibility.screenReaderSection
            .afterChartFormat;
        if (!format) {
            return '';
        }
        const context = { endOfChartMarker: this.getEndOfChartMarkerText() };
        const formattedString = A11yI18n.i18nFormat(format, context, chart);
        return stripEmptyHTMLTags(formattedString);
    }
    /**
     * @private
     */
    getLinkedDescription() {
        const el = this.linkedDescriptionElement, content = el && el.innerHTML || '';
        return stripHTMLTagsFromString(content, this.chart.renderer.forExport);
    }
    /**
     * @private
     */
    getLongdescText() {
        const chartOptions = this.chart.options, captionOptions = chartOptions.caption, captionText = captionOptions && captionOptions.text, linkedDescription = this.getLinkedDescription();
        return (chartOptions.accessibility.description ||
            linkedDescription ||
            captionText ||
            '');
    }
    /**
     * @private
     */
    getTypeDescriptionText() {
        const chart = this.chart;
        return chart.types ?
            chart.options.accessibility.typeDescription ||
                getTypeDescription(chart, chart.types) : '';
    }
    /**
     * @private
     */
    getDataTableButtonText(buttonId) {
        const chart = this.chart, buttonText = chart.langFormat('accessibility.table.viewAsDataTableButtonText', { chart: chart, chartTitle: getChartTitle(chart) });
        return '<button id="' + buttonId + '">' + buttonText + '</button>';
    }
    /**
     * @private
     */
    getSonifyButtonText(buttonId) {
        const chart = this.chart;
        if (chart.options.sonification &&
            chart.options.sonification.enabled === false) {
            return '';
        }
        const buttonText = chart.langFormat('accessibility.sonification.playAsSoundButtonText', { chart: chart, chartTitle: getChartTitle(chart) });
        return '<button id="' + buttonId + '">' + buttonText + '</button>';
    }
    /**
     * @private
     */
    getSubtitleText() {
        const subtitle = (this.chart.options.subtitle);
        return stripHTMLTagsFromString(subtitle && subtitle.text || '', this.chart.renderer.forExport);
    }
    /**
     * @private
     */
    getEndOfChartMarkerText() {
        const endMarkerId = `highcharts-end-of-chart-marker-${this.chart.index}`, endMarker = getElement(endMarkerId);
        if (endMarker) {
            return endMarker.outerHTML;
        }
        const chart = this.chart, markerText = chart.langFormat('accessibility.screenReaderSection.endOfChartMarker', { chart: chart }), id = 'highcharts-end-of-chart-marker-' + chart.index;
        return '<div id="' + id + '">' + markerText + '</div>';
    }
    /**
     * @private
     * @param {Highcharts.Dictionary<string>} e
     */
    onDataTableCreated(e) {
        const chart = this.chart;
        if (chart.options.accessibility.enabled) {
            if (this.viewDataTableButton) {
                this.viewDataTableButton.setAttribute('aria-expanded', 'true');
            }
            const attributes = e.tree.attributes || {};
            attributes.tabindex = -1;
            attributes.summary = getTableSummary(chart);
            e.tree.attributes = attributes;
        }
    }
    /**
     * @private
     */
    focusDataTable() {
        const tableDiv = this.dataTableDiv, table = tableDiv && tableDiv.getElementsByTagName('table')[0];
        if (table && table.focus) {
            table.focus();
        }
    }
    /**
     * @private
     * @param {string} sonifyButtonId
     */
    initSonifyButton(sonifyButtonId) {
        const el = this.sonifyButton = getElement(sonifyButtonId);
        const chart = this.chart;
        const defaultHandler = (e) => {
            if (el) {
                el.setAttribute('aria-hidden', 'true');
                el.setAttribute('aria-label', '');
            }
            e.preventDefault();
            e.stopPropagation();
            const announceMsg = chart.langFormat('accessibility.sonification.playAsSoundClickAnnouncement', { chart: chart });
            this.announcer.announce(announceMsg);
            setTimeout(() => {
                if (el) {
                    el.removeAttribute('aria-hidden');
                    el.removeAttribute('aria-label');
                }
                if (chart.sonify) {
                    chart.sonify();
                }
            }, 1000); // Delay to let screen reader speak the button press
        };
        if (el && chart) {
            el.setAttribute('tabindex', -1);
            el.onclick = function (e) {
                const onPlayAsSoundClick = (chart.options.accessibility &&
                    chart.options.accessibility.screenReaderSection
                        .onPlayAsSoundClick);
                (onPlayAsSoundClick || defaultHandler).call(this, e, chart);
            };
        }
    }
    /**
     * Set attribs and handlers for default viewAsDataTable button if exists.
     * @private
     * @param {string} tableButtonId
     */
    initDataTableButton(tableButtonId) {
        const el = this.viewDataTableButton = getElement(tableButtonId), chart = this.chart, tableId = tableButtonId.replace('hc-linkto-', '');
        if (el) {
            attr(el, {
                tabindex: -1,
                'aria-expanded': !!getElement(tableId)
            });
            el.onclick = chart.options.accessibility
                .screenReaderSection.onViewDataTableClick ||
                function () {
                    chart.exporting?.viewData();
                };
        }
    }
    /**
     * Return object with text description of each of the chart's axes.
     * @private
     */
    getAxesDescription() {
        const chart = this.chart, shouldDescribeColl = function (collectionKey, defaultCondition) {
            const axes = chart[collectionKey];
            return axes.length > 1 || axes[0] &&
                pick(axes[0].options.accessibility &&
                    axes[0].options.accessibility.enabled, defaultCondition);
        }, hasNoMap = !!chart.types &&
            chart.types.indexOf('map') < 0 &&
            chart.types.indexOf('treemap') < 0 &&
            chart.types.indexOf('tilemap') < 0, hasCartesian = !!chart.hasCartesianSeries, showXAxes = shouldDescribeColl('xAxis', !chart.angular && hasCartesian && hasNoMap), showYAxes = shouldDescribeColl('yAxis', hasCartesian && hasNoMap), desc = {};
        if (showXAxes) {
            desc.xAxis = this.getAxisDescriptionText('xAxis');
        }
        if (showYAxes) {
            desc.yAxis = this.getAxisDescriptionText('yAxis');
        }
        return desc;
    }
    /**
     * @private
     */
    getAxisDescriptionText(collectionKey) {
        const chart = this.chart;
        const axes = chart[collectionKey];
        return chart.langFormat('accessibility.axis.' + collectionKey + 'Description' + (axes.length > 1 ? 'Plural' : 'Singular'), {
            chart: chart,
            names: axes.map(function (axis) {
                return getAxisDescription(axis);
            }),
            ranges: axes.map(function (axis) {
                return getAxisRangeDescription(axis);
            }),
            numAxes: axes.length
        });
    }
    /**
     * Remove component traces
     */
    destroy() {
        if (this.announcer) {
            this.announcer.destroy();
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default InfoRegionsComponent;
