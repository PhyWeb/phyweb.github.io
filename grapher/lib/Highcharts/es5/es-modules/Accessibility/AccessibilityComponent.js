/* *
 *
 *  (c) 2009-2025 Øystein Moseng
 *
 *  Accessibility component class definition
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
import CU from './Utils/ChartUtilities.js';
var fireEventOnWrappedOrUnwrappedElement = CU.fireEventOnWrappedOrUnwrappedElement;
import DOMElementProvider from './Utils/DOMElementProvider.js';
import EventProvider from './Utils/EventProvider.js';
import HU from './Utils/HTMLUtilities.js';
var getFakeMouseEvent = HU.getFakeMouseEvent;
/* *
 *
 *  Class
 *
 * */
/**
 * The AccessibilityComponent base class, representing a part of the chart that
 * has accessibility logic connected to it. This class can be inherited from to
 * create a custom accessibility component for a chart.
 *
 * Components should take care to destroy added elements and unregister event
 * handlers on destroy. This is handled automatically if using `this.addEvent`
 * and `this.createElement`.
 *
 * @sample highcharts/accessibility/custom-component
 *         Custom accessibility component
 *
 * @requires modules/accessibility
 * @class
 * @name Highcharts.AccessibilityComponent
 */
var AccessibilityComponent = /** @class */ (function () {
    function AccessibilityComponent() {
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Called when accessibility is disabled or chart is destroyed.
     *
     * @function Highcharts.AccessibilityComponent#destroy
     */
    AccessibilityComponent.prototype.destroy = function () { };
    /**
     * Get keyboard navigation handler for this component.
     *
     * @function Highcharts.AccessibilityComponent#getKeyboardNavigation
     * @return   {Highcharts.KeyboardNavigationHandler|Array<Highcharts.KeyboardNavigationHandler>}
     *           The keyboard navigation handler(s) for this component.
     */
    AccessibilityComponent.prototype.getKeyboardNavigation = function () {
        return [];
    };
    /**
     * Called on component initialization.
     *
     * @function Highcharts.AccessibilityComponent#init
     */
    AccessibilityComponent.prototype.init = function () { };
    /**
     * Called on every chart render.
     *
     * @function Highcharts.AccessibilityComponent#onChartRender
     */
    AccessibilityComponent.prototype.onChartRender = function () { };
    /**
     * Called on updates to the chart, including options changes.
     * Note that this is also called on first render of chart.
     *
     * @function Highcharts.AccessibilityComponent#onChartUpdate
     */
    AccessibilityComponent.prototype.onChartUpdate = function () { };
    /**
     * Initialize the class
     * @private
     * @param {Highcharts.Chart} chart The chart object
     * @param {Highcharts.ProxyProvider} proxyProvider The proxy provider of the accessibility module
     */
    AccessibilityComponent.prototype.initBase = function (chart, proxyProvider) {
        this.chart = chart;
        this.eventProvider = new EventProvider();
        this.domElementProvider = new DOMElementProvider();
        this.proxyProvider = proxyProvider;
        // Key code enum for common keys
        this.keyCodes = {
            left: 37,
            right: 39,
            up: 38,
            down: 40,
            enter: 13,
            space: 32,
            esc: 27,
            tab: 9,
            pageUp: 33,
            pageDown: 34,
            end: 35,
            home: 36
        };
    };
    /**
     * Add an event to an element and keep track of it for later removal.
     * See EventProvider for details.
     * @private
     */
    AccessibilityComponent.prototype.addEvent = function (el, type, fn, options) {
        return this.eventProvider.addEvent(el, type, fn, options);
    };
    /**
     * Create an element and keep track of it for later removal.
     * See DOMElementProvider for details.
     * @private
     */
    AccessibilityComponent.prototype.createElement = function (tagName, options) {
        return this.domElementProvider.createElement(tagName, options);
    };
    /**
     * Fire a fake click event on an element. It is useful to have this on
     * AccessibilityComponent for users of custom components.
     * @private
     */
    AccessibilityComponent.prototype.fakeClickEvent = function (el) {
        var fakeEvent = getFakeMouseEvent('click');
        fireEventOnWrappedOrUnwrappedElement(el, fakeEvent);
    };
    /**
     * Remove traces of the component.
     * @private
     */
    AccessibilityComponent.prototype.destroyBase = function () {
        this.domElementProvider.destroyCreatedElements();
        this.eventProvider.removeAddedEvents();
    };
    return AccessibilityComponent;
}());
/* *
 *
 *  Default Export
 *
 * */
export default AccessibilityComponent;
