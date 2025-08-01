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
import U from './Utilities.js';
var addEvent = U.addEvent, isFunction = U.isFunction, objectEach = U.objectEach, removeEvent = U.removeEvent;
/* *
 *
 *  Class Namespace
 *
 * */
var Foundation;
(function (Foundation) {
    /* *
     *
     *  Functions
     *
     * */
    /* eslint-disable valid-jsdoc */
    /**
     * Register event options. If an event handler is set on the options, it
     * should be subject to Chart.update, Axis.update and Series.update. This is
     * contrary to general handlers that are set directly using addEvent either
     * on the class or on the instance. #6538, #6943, #10861.
     * @private
     */
    function registerEventOptions(component, options) {
        // A lookup over those events that are added by _options_ (not
        // programmatically). These are updated through .update()
        component.eventOptions = component.eventOptions || {};
        // Register event listeners
        objectEach(options.events, function (event, eventType) {
            // If event does not exist, or is changed by the .update()
            // function
            if (component.eventOptions[eventType] !== event) {
                // Remove existing if set by option
                if (component.eventOptions[eventType]) {
                    removeEvent(component, eventType, component.eventOptions[eventType]);
                    delete component.eventOptions[eventType];
                }
                if (isFunction(event)) {
                    component.eventOptions[eventType] = event;
                    addEvent(component, eventType, event, {
                        order: 0 // #14080 fire those events as firsts
                    });
                }
            }
        });
    }
    Foundation.registerEventOptions = registerEventOptions;
})(Foundation || (Foundation = {}));
/* *
 *
 *  Default Export
 *
 * */
export default Foundation;
