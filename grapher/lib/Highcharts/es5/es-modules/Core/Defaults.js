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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import ChartDefaults from './Chart/ChartDefaults.js';
import H from './Globals.js';
var isTouchDevice = H.isTouchDevice;
import Palettes from './Color/Palettes.js';
import Time from './Time.js';
import U from './Utilities.js';
var fireEvent = U.fireEvent, merge = U.merge;
/* *
 *
 *  API Options
 *
 * */
/**
 * Global default settings.
 *
 * @name Highcharts.defaultOptions
 * @type {Highcharts.Options}
 */ /**
* @optionparent
* @private
*/
var defaultOptions = {
    /**
     * An array containing the default colors for the chart's series. When
     * all colors are used, new colors are pulled from the start again.
     *
     * Default colors can also be set on a series or series.type basis,
     * see [column.colors](#plotOptions.column.colors),
     * [pie.colors](#plotOptions.pie.colors).
     *
     * In styled mode, the colors option doesn't exist. Instead, colors
     * are defined in CSS and applied either through series or point class
     * names, or through the [chart.colorCount](#chart.colorCount) option.
     *
     * @sample {highcharts} highcharts/chart/colors/
     *         Assign a global color theme
     * @sample highcharts/members/theme-v10/
     *         Latest release styled like version 10
     *
     * @type    {Array<(Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject)>}
     * @default [
     *     "#2caffe",
     *     "#544fc5",
     *     "#00e272",
     *     "#fe6a35",
     *     "#6b8abc",
     *     "#d568fb",
     *     "#2ee0ca",
     *     "#fa4b42",
     *     "#feb56a",
     *     "#91e8e1"
     * ]
     */
    colors: Palettes.colors,
    /**
     * Styled mode only. Configuration object for adding SVG definitions for
     * reusable elements. See [gradients, shadows and
     * patterns](https://www.highcharts.com/docs/chart-design-and-style/gradients-shadows-and-patterns)
     * for more information and code examples.
     *
     * @type      {*}
     * @since     5.0.0
     * @apioption defs
     */
    /**
     * @ignore-option
     */
    symbols: ['circle', 'diamond', 'square', 'triangle', 'triangle-down'],
    /**
     * An object containing language-related strings and settings. A typical
     * setup uses `Highcharts.setOptions` to make the options apply to all
     * charts in the same page.
     *
     * ```js
     * Highcharts.setOptions({
     *     lang: {
     *         locale: 'fr'
     *     }
     * });
     * ```
     *
     * @optionparent lang
     */
    lang: {
        weekFrom: 'week from',
        /**
         * The default chart title.
         *
         * @since 12.2.0
         */
        chartTitle: 'Chart title',
        /**
         * The browser locale to use for date and number formatting. The actual
         * locale used for each chart is determined in three steps:
         * 1. If this `lang.locale` option is specified, it is used.
         * 2. Else, look for the closest ancestor HTML element with a `lang`
         *    attribute, typically the `<html>` element.
         * 3. If no 'lang' attribute is found, use the default browser locale.
         *
         * Use `en-GB`, British English, for approximate consistency with
         * Highcharts v < 12.
         *
         * @sample highcharts/lang/locale/
         *         Set the locale using the `lang.locale` option
         * @sample highcharts/lang/locale-attribute/
         *         Pick up the locale from the HTML `lang` attribute
         * @sample highcharts/members/highcharts-numberformat
         *         Arabic locale with digits and dates         *
         *
         * @since 12.0.0
         * @type {string|Array<string>}
         */
        locale: void 0,
        /**
         * The loading text that appears when the chart is set into the loading
         * state following a call to `chart.showLoading`.
         */
        loading: 'Loading...',
        /**
         * An array containing the months names. Corresponds to the `%B` format
         * in `Highcharts.dateFormat()`. Defaults to 'undefined',
         * meaning the default month names are used according to the
         * `lang.locale` setting.
         *
         * @type    {Array<string>}
         */
        months: void 0,
        /**
         * [Format string](https://www.highcharts.com/docs/chart-concepts/templating) for the default series name.
         *
         * @since 12.2.0
         */
        seriesName: 'Series {add index 1}',
        /**
         * An array containing the months names in abbreviated form. Corresponds
         * to the `%b` format in `Highcharts.dateFormat()`. Defaults to
         * 'undefined', meaning the default short month names are used according
         * to the `lang.locale` setting.
         *
         * @type    {Array<string>}
         */
        shortMonths: void 0,
        /**
         * An array containing the weekday names. Defaults to 'undefined',
         * meaning the default weekday names are used according to the
         * `lang.locale` setting.
         *
         * @type    {Array<string>}
         */
        weekdays: void 0,
        /**
         * Short week days, starting Sunday. Defaults to 'undefined', meaning
         * the default short weekday names are used according to the
         * `lang.locale` setting.
         *
         * @sample highcharts/lang/shortweekdays/
         *         Finnish two-letter abbreviations
         *
         * @type      {Array<string>}
         * @since     4.2.4
         * @apioption lang.shortWeekdays
         */
        /**
         * What to show in a date field for invalid dates. Defaults to an empty
         * string.
         *
         * @type      {string}
         * @since     4.1.8
         * @product   highcharts highstock
         * @apioption lang.invalidDate
         */
        /**
         * The title appearing on hovering the zoom in button. The text itself
         * defaults to "+" and can be changed in the button options.
         *
         * @type      {string}
         * @default   Zoom in
         * @product   highmaps
         * @apioption lang.zoomIn
         */
        /**
         * The title appearing on hovering the zoom out button. The text itself
         * defaults to "-" and can be changed in the button options.
         *
         * @type      {string}
         * @default   Zoom out
         * @product   highmaps
         * @apioption lang.zoomOut
         */
        /**
         * The default decimal point used in the `Highcharts.numberFormat`
         * method unless otherwise specified in the function arguments. Defaults
         * to the locale decimal point as determined by `lang.locale`.
         *
         * @type      {string}
         * @default   undefined
         * @since     1.2.2
         * @apioption lang.decimalPoint
         */
        /**
         * [Metric prefixes](https://en.wikipedia.org/wiki/Metric_prefix) used
         * to shorten high numbers in axis labels. Replacing any of the
         * positions with `null` causes the full number to be written. Setting
         * `numericSymbols` to `undefined` disables shortening altogether.
         *
         * @sample {highcharts} highcharts/lang/numericsymbols/
         *         Replacing the symbols with text
         * @sample {highstock} highcharts/lang/numericsymbols/
         *         Replacing the symbols with text
         *
         * @type    {Array<string>}
         * @default ["k", "M", "G", "T", "P", "E"]
         * @since   2.3.0
         */
        numericSymbols: ['k', 'M', 'G', 'T', 'P', 'E'],
        /**
         * The default name for a pie slice (point).
         * @since 12.2.0
         */
        pieSliceName: 'Slice',
        /**
         * The magnitude of [numericSymbols](#lang.numericSymbol) replacements.
         * Use 10000 for Japanese, Korean and various Chinese locales, which
         * use symbols for 10^4, 10^8 and 10^12.
         *
         * @sample highcharts/lang/numericsymbolmagnitude/
         *         10000 magnitude for Japanese
         *
         * @type      {number}
         * @default   1000
         * @since     5.0.3
         * @apioption lang.numericSymbolMagnitude
         */
        /**
         * The default thousands separator used in the `Highcharts.numberFormat`
         * method unless otherwise specified in the function arguments. Defaults
         * to the locale thousands separator as determined by `lang.locale`.
         *
         * @type      {string}
         * @default   undefined
         * @since     1.2.2
         * @apioption lang.thousandsSep
         */
        /**
         * The text for the label appearing when a chart is zoomed.
         *
         * @since 1.2.4
         */
        resetZoom: 'Reset zoom',
        /**
         * The tooltip title for the label appearing when a chart is zoomed.
         *
         * @since 1.2.4
         */
        /**
         * The default title of the Y axis
         *
         * @since 12.2.0
         */
        yAxisTitle: 'Values',
        resetZoomTitle: 'Reset zoom level 1:1'
    },
    /**
     * Global options that don't apply to each chart. These options must be set
     * using the `Highcharts.setOptions` method.
     *
     * ```js
     * Highcharts.setOptions({
     *     global: {
     *         buttonTheme: {
     *             fill: '#d0d0d0'
     *         }
     *     }
     * });
     * ```
     */
    global: {
        /**
         * General theme for buttons. This applies to the zoom button, exporting
         * context menu, map navigation, range selector buttons and custom
         * buttons generated using the `SVGRenderer.button` function. However,
         * each of these may be overridden with more specific options.
         *
         * @sample highcharts/global/buttontheme
         *         General button theme
         * @since 11.4.2
         */
        buttonTheme: {
            /**
             * The fill color for buttons
             */
            fill: "#f7f7f7" /* Palette.neutralColor3 */,
            /**
             * The padding of buttons
             */
            padding: 8,
            /**
             * The border radius for buttons
             */
            r: 2,
            /**
             * The stroke color for buttons
             */
            stroke: "#cccccc" /* Palette.neutralColor20 */,
            /**
             * The stroke width for buttons
             */
            'stroke-width': 1,
            /**
             * CSS styling for the buttons' text
             */
            style: {
                color: "#333333" /* Palette.neutralColor80 */,
                cursor: 'pointer',
                fontSize: '0.8em',
                fontWeight: 'normal'
            },
            /**
             * State overrides for the buttons
             */
            states: {
                /**
                 * Hover state overrides for the buttons are applied in addition
                 * to the normal state options
                 */
                hover: {
                    fill: "#e6e6e6" /* Palette.neutralColor10 */
                },
                /**
                 * Select state overrides for the buttons are applied in
                 * addition to the normal state options
                 */
                select: {
                    fill: "#e6e9ff" /* Palette.highlightColor10 */,
                    style: {
                        color: "#000000" /* Palette.neutralColor100 */,
                        fontWeight: 'bold'
                    }
                },
                /**
                 * Disabled state overrides for the buttons are applied in
                 * addition to the normal state options
                 */
                disabled: {
                    /**
                     * Disabled state CSS style overrides for the buttons' text
                     */
                    style: {
                        color: "#cccccc" /* Palette.neutralColor20 */
                    }
                }
            }
        }
    },
    /**
     * Time options that can apply globally or to individual charts. These
     * settings affect how `datetime` axes are laid out, how tooltips are
     * formatted, how series
     * [pointIntervalUnit](#plotOptions.series.pointIntervalUnit) works and how
     * the Highcharts Stock range selector handles time.
     *
     * The common use case is that all charts in the same Highcharts object
     * share the same time settings, in which case the global settings are set
     * using `setOptions`.
     *
     * ```js
     * // Apply time settings globally
     * Highcharts.setOptions({
     *     time: {
     *         timezone: 'Europe/London'
     *     }
     * });
     * // Apply time settings by instance
     * const chart = Highcharts.chart('container', {
     *     time: {
     *         timezone: 'America/New_York'
     *     },
     *     series: [{
     *         data: [1, 4, 3, 5]
     *     }]
     * });
     *
     * // Use the Time object
     * console.log(
     *        'Current time in New York',
     *        chart.time.dateFormat('%Y-%m-%d %H:%M:%S', Date.now())
     * );
     * ```
     *
     * Since v6.0.5, the time options were moved from the `global` object to the
     * `time` object, and time options can be set on each individual chart.
     *
     * @sample {highcharts|highstock}
     *         highcharts/time/timezone/
     *         Set the timezone globally
     * @sample {highcharts}
     *         highcharts/time/individual/
     *         Set the timezone per chart instance
     * @sample {highstock}
     *         stock/time/individual/
     *         Set the timezone per chart instance
     *
     * @since     6.0.5
     * @optionparent time
     */
    time: {
        /**
         * A custom `Date` class for advanced date handling. For example,
         * [JDate](https://github.com/tahajahangir/jdate) can be hooked in to
         * handle Jalali dates.
         *
         * @type      {*}
         * @since     4.0.4
         * @product   highcharts highstock gantt
         */
        Date: void 0,
        /**
         * A named time zone. Supported time zone names rely on the browser
         * implementations, as described in the [mdn
         * docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#timezone).
         * If the given time zone is not recognized by the browser, Highcharts
         * provides a warning and falls back to returning a 0 offset,
         * corresponding to the UTC time zone.
         *
         * The time zone affects axis scaling, tickmark placement and
         * time display in `Highcharts.dateFormat`.
         *
         * Setting `timezone` to `undefined` falls back to the default browser
         * timezone setting.
         *
         * Until v11.2.0, this option depended on moment.js.
         *
         * @sample {highcharts|highstock} highcharts/time/timezone/ Europe/Oslo
         *
         * @type      {string}
         * @since     5.0.7
         * @product   highcharts highstock gantt
         */
        timezone: 'UTC',
        /**
         * The timezone offset in minutes. Positive values are west, negative
         * values are east of UTC, as in the ECMAScript
         * [getTimezoneOffset](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset)
         * method. Use this to display UTC based data in a predefined time zone.
         *
         * This option is deprecated as of v11.4.1 and will be removed in a
         * future release. Use the [time.timezone](#time.timezone) option
         * instead.
         *
         * @see [time.getTimezoneOffset](#time.getTimezoneOffset)
         *
         * @sample {highcharts|highstock} highcharts/time/timezoneoffset/
         *         Timezone offset
         *
         * @since     3.0.8
         * @deprecated 11.4.2
         * @product   highcharts highstock gantt
         */
        timezoneOffset: 0,
        /**
         * Whether to use UTC time for axis scaling, tickmark placement and
         * time display in `Highcharts.dateFormat`. Advantages of using UTC
         * is that the time displays equally regardless of the user agent's
         * time zone settings. Local time can be used when the data is loaded
         * in real time or when correct Daylight Saving Time transitions are
         * required.
         *
         * Setting `useUTC` to true is equivalent to setting `time.timezone` to
         * `"UTC"`. Setting `useUTC` to false is equivalent to setting
         * `time.timezone` to `undefined`.
         *
         * @see [time.timezone](#timezone)
         *
         * @sample {highcharts} highcharts/time/useutc-true/
         *         True by default
         * @sample {highcharts} highcharts/time/useutc-false/
         *         False
         *
         * @deprecated
         */
        useUTC: void 0
    },
    chart: ChartDefaults,
    /**
     * The chart's main title.
     *
     * @sample {highmaps} maps/title/title/
     *         Title options demonstrated
     * @sample {highcharts} highcharts/title/align-auto/
     *         Default title alignment
     */
    title: {
        /**
         * When the title is floating, the plot area will not move to make space
         * for it.
         *
         * @sample {highcharts} highcharts/chart/zoomtype-none/
         *         False by default
         * @sample {highcharts} highcharts/title/floating/
         *         True - title on top of the plot area
         * @sample {highstock} stock/chart/title-floating/
         *         True - title on top of the plot area
         *
         * @type      {boolean}
         * @default   false
         * @since     2.1
         * @apioption title.floating
         */
        /**
         * Whether to
         * [use HTML](https://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting#html)
         * to render the text.
         *
         * @type      {boolean}
         * @default   false
         * @apioption title.useHTML
         */
        /**
         * The vertical alignment of the title. Can be one of `"top"`,
         * `"middle"` and `"bottom"`. When a value is given, the title behaves
         * as if [floating](#title.floating) were `true`.
         *
         * @sample {highcharts} highcharts/title/verticalalign/
         *         Chart title in bottom right corner
         * @sample {highstock} stock/chart/title-verticalalign/
         *         Chart title in bottom right corner
         *
         * @type      {Highcharts.VerticalAlignValue}
         * @since     2.1
         * @apioption title.verticalAlign
         */
        /**
         * The x position of the title relative to the alignment within
         * `chart.spacingLeft` and `chart.spacingRight`.
         *
         * @sample {highcharts} highcharts/title/align/
         *         Aligned to the plot area (x = 70px = margin left - spacing
         *         left)
         * @sample {highstock} stock/chart/title-align/
         *         Aligned to the plot area (x = 50px = margin left - spacing
         *         left)
         *
         * @type      {number}
         * @default   0
         * @since     2.0
         * @apioption title.x
         */
        /**
         * The y position of the title relative to the alignment within
         * [chart.spacingTop](#chart.spacingTop) and [chart.spacingBottom](
         * #chart.spacingBottom). By default it depends on the font size.
         *
         * @sample {highcharts} highcharts/title/y/
         *         Title inside the plot area
         * @sample {highstock} stock/chart/title-verticalalign/
         *         Chart title in bottom right corner
         *
         * @type      {number}
         * @since     2.0
         * @apioption title.y
         */
        /**
         * CSS styles for the title. Use this for font styling, but use `align`,
         * `x` and `y` for text alignment.
         *
         * Note that the default [title.minScale](#title.minScale) option also
         * affects the rendered font size. In order to keep the font size fixed
         * regardless of title length, set `minScale` to 1.
         *
         * In styled mode, the title style is given in the `.highcharts-title`
         * class.
         *
         * @sample {highcharts} highcharts/title/style/
         *         Custom color and weight
         * @sample {highstock} stock/chart/title-style/
         *         Custom color and weight
         * @sample highcharts/css/titles/
         *         Styled mode
         *
         * @type      {Highcharts.CSSObject}
         * @default   {highcharts|highmaps} { "color": "#333333", "fontSize": "18px" }
         * @default   {highstock} { "color": "#333333", "fontSize": "16px" }
         */
        style: {
            color: "#333333" /* Palette.neutralColor80 */,
            fontWeight: 'bold'
        },
        /**
         * The title of the chart. To disable the title, set the `text` to
         * `undefined`.
         *
         * @sample {highcharts} highcharts/title/text/
         *         Custom title
         * @sample {highstock} stock/chart/title-text/
         *         Custom title
         *
         * @default {highcharts|highmaps} Chart title
         * @default {highstock} undefined
         */
        text: 'Chart title',
        /**
         * The horizontal alignment of the title. Can be one of "left", "center"
         * and "right".
         *
         * Since v12 it defaults to `undefined`, meaning the alignment is
         * computed for best fit. If the text fits in one line, it aligned to
         * the center, but if it is wrapped into multiple lines, it is aligned
         * to the left.
         *
         * @sample {highcharts} highcharts/title/align-auto/
         *         Default alignment, dynamic
         * @sample {highcharts} highcharts/title/align/
         *         Aligned to the plot area (x = 70px = margin left - spacing
         *         left)
         * @sample {highstock} stock/chart/title-align/
         *         Aligned to the plot area (x = 50px = margin left - spacing
         *         left)
         *
         * @type      {Highcharts.AlignValue}
         * @default   undefined
         * @since     2.0
         * @apioption title.align
         */
        /**
         * The margin between the title and the plot area, or if a subtitle
         * is present, the margin between the subtitle and the plot area.
         *
         * @sample {highcharts} highcharts/title/margin-50/
         *         A chart title margin of 50
         * @sample {highcharts} highcharts/title/margin-subtitle/
         *         The same margin applied with a subtitle
         * @sample {highstock} stock/chart/title-margin/
         *         A chart title margin of 50
         *
         * @since 2.1
         */
        margin: 15,
        /**
         * When the title is too wide to fit in the chart, the default behavior
         * is to scale it down to fit, or apply word wrap if it is scaled down
         * to `minScale` and still doesn't fit.
         *
         * The default value reflects the scale, when using default font sizes,
         * when the title font size matches that of the subtitle. The title
         * still stands out as it is bold by default.
         *
         * Set `minScale` to 1 to avoid downscaling.
         *
         * @sample {highcharts} highcharts/title/align-auto/
         *         Downscaling demonstrated
         *
         * @since 12.0.0
         */
        minScale: 0.67
    },
    /**
     * The chart's subtitle. This can be used both to display a subtitle below
     * the main title, and to display random text anywhere in the chart. The
     * subtitle can be updated after chart initialization through the
     * `Chart.setTitle` method.
     *
     * @sample {highcharts} highcharts/title/align-auto/
     *         Default title alignment
     * @sample {highmaps} maps/title/subtitle/
     *         Subtitle options demonstrated
     */
    subtitle: {
        /**
         * The horizontal alignment of the subtitle. Can be one of "left",
         * "center" and "right". Since v12, it defaults to `undefined`, meaning
         * the actual alignment is inherited from the alignment of the main
         * title.
         *
         * @sample {highcharts} highcharts/title/align-auto/
         *         Default title and subtitle alignment, dynamic
         * @sample {highcharts} highcharts/subtitle/align/
         *         Footnote at right of plot area
         * @sample {highstock} stock/chart/subtitle-footnote
         *         Footnote at bottom right of plot area
         *
         * @type  {Highcharts.AlignValue}
         * @default undefined
         * @since 2.0
         * @apioption subtitle.align
         */
        /**
         * When the subtitle is floating, the plot area will not move to make
         * space for it.
         *
         * @sample {highcharts} highcharts/subtitle/floating/
         *         Floating title and subtitle
         * @sample {highstock} stock/chart/subtitle-footnote
         *         Footnote floating at bottom right of plot area
         *
         * @type      {boolean}
         * @default   false
         * @since     2.1
         * @apioption subtitle.floating
         */
        /**
         * CSS styles for the title.
         *
         * In styled mode, the subtitle style is given in the
         * `.highcharts-subtitle` class.
         *
         * @sample {highcharts} highcharts/subtitle/style/
         *         Custom color and weight
         * @sample {highcharts} highcharts/css/titles/
         *         Styled mode
         * @sample {highstock} stock/chart/subtitle-style
         *         Custom color and weight
         * @sample {highstock} highcharts/css/titles/
         *         Styled mode
         * @sample {highmaps} highcharts/css/titles/
         *         Styled mode
         *
         * @type      {Highcharts.CSSObject}
         * @default   {"color": "#666666"}
         * @apioption subtitle.style
         */
        /**
         * Whether to
         * [use HTML](https://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting#html)
         * to render the text.
         *
         * @type      {boolean}
         * @default   false
         * @apioption subtitle.useHTML
         */
        /**
         * The vertical alignment of the title. Can be one of `"top"`,
         * `"middle"` and `"bottom"`. When middle, the subtitle behaves as
         * floating.
         *
         * @sample {highcharts} highcharts/subtitle/verticalalign/
         *         Footnote at the bottom right of plot area
         * @sample {highstock} stock/chart/subtitle-footnote
         *         Footnote at the bottom right of plot area
         *
         * @type      {Highcharts.VerticalAlignValue}
         * @since     2.1
         * @apioption subtitle.verticalAlign
         */
        /**
         * The x position of the subtitle relative to the alignment within
         * `chart.spacingLeft` and `chart.spacingRight`.
         *
         * @sample {highcharts} highcharts/subtitle/align/
         *         Footnote at right of plot area
         * @sample {highstock} stock/chart/subtitle-footnote
         *         Footnote at the bottom right of plot area
         *
         * @type      {number}
         * @default   0
         * @since     2.0
         * @apioption subtitle.x
         */
        /**
         * The y position of the subtitle relative to the alignment within
         * `chart.spacingTop` and `chart.spacingBottom`. By default the subtitle
         * is laid out below the title unless the title is floating.
         *
         * @sample {highcharts} highcharts/subtitle/verticalalign/
         *         Footnote at the bottom right of plot area
         * @sample {highstock} stock/chart/subtitle-footnote
         *         Footnote at the bottom right of plot area
         *
         * @type      {number}
         * @since     2.0
         * @apioption subtitle.y
         */
        /**
         * CSS styles for the title.
         *
         * In styled mode, the subtitle style is given in the
         * `.highcharts-subtitle` class.
         *
         * @sample {highcharts} highcharts/subtitle/style/
         *         Custom color and weight
         * @sample {highcharts} highcharts/css/titles/
         *         Styled mode
         * @sample {highstock} stock/chart/subtitle-style
         *         Custom color and weight
         * @sample {highstock} highcharts/css/titles/
         *         Styled mode
         * @sample {highmaps} highcharts/css/titles/
         *         Styled mode
         *
         * @type      {Highcharts.CSSObject}
         * @default   {"color": "#666666"}
         */
        style: {
            color: "#666666" /* Palette.neutralColor60 */,
            /**
             * @type {number|string}
             */
            fontSize: '0.8em'
        },
        /**
         * The subtitle of the chart.
         *
         * @sample {highcharts|highstock} highcharts/subtitle/text/
         *         Custom subtitle
         * @sample {highcharts|highstock} highcharts/subtitle/text-formatted/
         *         Formatted and linked text.
         */
        text: ''
    },
    /**
     * The chart's caption, which will render below the chart and will be part
     * of exported charts. The caption can be updated after chart initialization
     * through the `Chart.update` or `Chart.caption.update` methods.
     *
     * @sample highcharts/caption/text/
     *         A chart with a caption
     * @since  7.2.0
     */
    caption: {
        /**
         * When the caption is floating, the plot area will not move to make
         * space for it.
         *
         * @type      {boolean}
         * @default   false
         * @apioption caption.floating
         */
        /**
         * The margin between the caption and the plot area.
         */
        margin: 15,
        /**
         * Whether to
         * [use HTML](https://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting#html)
         * to render the text.
         *
         * @type      {boolean}
         * @default   false
         * @apioption caption.useHTML
         */
        /**
         * The x position of the caption relative to the alignment within
         * `chart.spacingLeft` and `chart.spacingRight`.
         *
         * @type      {number}
         * @default   0
         * @apioption caption.x
         */
        /**
         * The y position of the caption relative to the alignment within
         * `chart.spacingTop` and `chart.spacingBottom`.
         *
         * @type      {number}
         * @apioption caption.y
         */
        /**
         * CSS styles for the caption.
         *
         * In styled mode, the caption style is given in the
         * `.highcharts-caption` class.
         *
         * @sample {highcharts} highcharts/css/titles/
         *         Styled mode
         *
         * @type      {Highcharts.CSSObject}
         * @default   {"color": "#666666"}
         */
        style: {
            color: "#666666" /* Palette.neutralColor60 */,
            /**
             * @type {number|string}
             */
            fontSize: '0.8em'
        },
        /**
         * The caption text of the chart.
         *
         * @sample {highcharts} highcharts/caption/text/
         *         Custom caption
         */
        text: '',
        /**
         * The horizontal alignment of the caption. Can be one of "left",
         *  "center" and "right".
         *
         * @type  {Highcharts.AlignValue}
         */
        align: 'left',
        /**
         * The vertical alignment of the caption. Can be one of `"top"`,
         * `"middle"` and `"bottom"`. When middle, the caption behaves as
         * floating.
         *
         * @type      {Highcharts.VerticalAlignValue}
         */
        verticalAlign: 'bottom'
    },
    /**
     * The plotOptions is a wrapper object for config objects for each series
     * type. The config objects for each series can also be overridden for
     * each series item as given in the series array.
     *
     * Configuration options for the series are given in three levels. Options
     * for all series in a chart are given in the [plotOptions.series](
     * #plotOptions.series) object. Then options for all series of a specific
     * type are given in the plotOptions of that type, for example
     * `plotOptions.line`. Next, options for one single series are given in
     * [the series array](#series).
     */
    plotOptions: {},
    /**
     * The legend is a box containing a symbol and name for each series
     * item or point item in the chart. Each series (or points in case
     * of pie charts) is represented by a symbol and its name in the legend.
     *
     * It is possible to override the symbol creator function and create
     * [custom legend symbols](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/studies/legend-custom-symbol/).
     *
     * @productdesc {highmaps}
     * A Highmaps legend by default contains one legend item per series, but if
     * a `colorAxis` is defined, the axis will be displayed in the legend.
     * Either as a gradient, or as multiple legend items for `dataClasses`.
     */
    legend: {
        /**
         * The background color of the legend.
         *
         * @see In styled mode, the legend background fill can be applied with
         *      the `.highcharts-legend-box` class.
         *
         * @sample {highcharts} highcharts/legend/backgroundcolor/
         *         Yellowish background
         * @sample {highstock} stock/legend/align/
         *         Various legend options
         * @sample {highmaps} maps/legend/border-background/
         *         Border and background options
         *
         * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
         * @apioption legend.backgroundColor
         */
        /**
         * The width of the drawn border around the legend.
         *
         * @see In styled mode, the legend border stroke width can be applied
         *      with the `.highcharts-legend-box` class.
         *
         * @sample {highcharts} highcharts/legend/borderwidth/
         *         2px border width
         * @sample {highstock} stock/legend/align/
         *         Various legend options
         * @sample {highmaps} maps/legend/border-background/
         *         Border and background options
         *
         * @type      {number}
         * @default   0
         * @apioption legend.borderWidth
         */
        /**
         * Enable or disable the legend. There is also a series-specific option,
         * [showInLegend](#plotOptions.series.showInLegend), that can hide the
         * series from the legend. In some series types this is `false` by
         * default, so it must set to `true` in order to show the legend for the
         * series.
         *
         * @sample {highcharts} highcharts/legend/enabled-false/ Legend disabled
         * @sample {highstock} stock/legend/align/ Various legend options
         * @sample {highmaps} maps/legend/enabled-false/ Legend disabled
         *
         * @default {highstock} false
         * @default {highmaps} true
         * @default {gantt} false
         */
        enabled: true,
        /**
         * The horizontal alignment of the legend box within the chart area.
         * Valid values are `left`, `center` and `right`.
         *
         * In the case that the legend is aligned in a corner position, the
         * `layout` option will determine whether to place it above/below
         * or on the side of the plot area.
         *
         * @sample {highcharts} highcharts/legend/align/
         *         Legend at the right of the chart
         * @sample {highstock} stock/legend/align/
         *         Various legend options
         * @sample {highmaps} maps/legend/alignment/
         *         Legend alignment
         *
         * @type  {Highcharts.AlignValue}
         * @since 2.0
         */
        align: 'center',
        /**
         * If the [layout](legend.layout) is `horizontal` and the legend items
         * span over two lines or more, whether to align the items into vertical
         * columns. Setting this to `false` makes room for more items, but will
         * look more messy.
         *
         * @since 6.1.0
         */
        alignColumns: true,
        /**
         * A CSS class name to apply to the legend group.
         */
        className: 'highcharts-no-tooltip',
        /**
         * General event handlers for the legend. These event hooks can
         * also be attached to the legend at run time using the
         * `Highcharts.addEvent` function.
         *
         * @declare Highcharts.LegendEventsOptionsObject
         *
         * @private
         */
        events: {},
        /**
         * Fires when the legend item belonging to the series is clicked. One
         * parameter, `event`, is passed to the function. The default action
         * is to toggle the visibility of the series, point or data class. This
         * can be prevented by returning `false` or calling
         * `event.preventDefault()`.
         *
         * @sample {highcharts} highcharts/legend/itemclick/
         *         Confirm hiding and showing
         * @sample {highcharts} highcharts/legend/pie-legend-itemclick/
         *         Confirm toggle visibility of pie slices
         *
         * @type      {Highcharts.LegendItemClickCallbackFunction}
         * @context   Highcharts.Legend
         * @apioption legend.events.itemClick
         */
        /**
         * When the legend is floating, the plot area ignores it and is allowed
         * to be placed below it.
         *
         * @sample {highcharts} highcharts/legend/floating-false/
         *         False by default
         * @sample {highcharts} highcharts/legend/floating-true/
         *         True
         * @sample {highmaps} maps/legend/alignment/
         *         Floating legend
         *
         * @type      {boolean}
         * @default   false
         * @since     2.1
         * @apioption legend.floating
         */
        /**
         * The layout of the legend items. Can be one of `horizontal` or
         * `vertical` or `proximate`. When `proximate`, the legend items will be
         * placed as close as possible to the graphs they're representing,
         * except in inverted charts or when the legend position doesn't allow
         * it.
         *
         * @sample {highcharts} highcharts/legend/layout-horizontal/
         *         Horizontal by default
         * @sample {highcharts} highcharts/legend/layout-vertical/
         *         Vertical
         * @sample highcharts/legend/layout-proximate
         *         Labels proximate to the data
         * @sample {highstock} stock/legend/layout-horizontal/
         *         Horizontal by default
         * @sample {highmaps} maps/legend/padding-itemmargin/
         *         Vertical with data classes
         * @sample {highmaps} maps/legend/layout-vertical/
         *         Vertical with color axis gradient
         *
         * @validvalue ["horizontal", "vertical", "proximate"]
         */
        layout: 'horizontal',
        /**
         * In a legend with horizontal layout, the itemDistance defines the
         * pixel distance between each item.
         *
         * @sample {highcharts} highcharts/legend/layout-horizontal/
         *         50px item distance
         * @sample {highstock} highcharts/legend/layout-horizontal/
         *         50px item distance
         *
         * @type      {number}
         * @default   {highcharts} 20
         * @default   {highstock} 20
         * @default   {highmaps} 8
         * @since     3.0.3
         * @apioption legend.itemDistance
         */
        /**
         * The pixel bottom margin for each legend item.
         *
         * @sample {highcharts|highstock} highcharts/legend/padding-itemmargin/
         *         Padding and item margins demonstrated
         * @sample {highmaps} maps/legend/padding-itemmargin/
         *         Padding and item margins demonstrated
         *
         * @since     2.2.0
         */
        itemMarginBottom: 2,
        /**
         * The pixel top margin for each legend item.
         *
         * @sample {highcharts|highstock} highcharts/legend/padding-itemmargin/
         *         Padding and item margins demonstrated
         * @sample {highmaps} maps/legend/padding-itemmargin/
         *         Padding and item margins demonstrated
         *
         * @since     2.2.0
         */
        itemMarginTop: 2,
        /**
         * The width for each legend item. By default the items are laid out
         * successively. In a [horizontal layout](legend.layout), if the items
         * are laid out across two rows or more, they will be vertically aligned
         * depending on the [legend.alignColumns](legend.alignColumns) option.
         *
         * @sample {highcharts} highcharts/legend/itemwidth-default/
         *         Undefined by default
         * @sample {highcharts} highcharts/legend/itemwidth-80/
         *         80 for aligned legend items
         *
         * @type      {number}
         * @since     2.0
         * @apioption legend.itemWidth
         */
        /**
         * A [format string](https://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting)
         * for each legend label. Available variables relates to properties on
         * the series, or the point in case of pies.
         *
         * @type      {string}
         * @default   {name}
         * @since     1.3
         * @apioption legend.labelFormat
         */
        /* eslint-disable valid-jsdoc */
        /**
         * Callback function to format each of the series' labels. The `this`
         * keyword refers to the series object, or the point object in case of
         * pie charts. By default the series or point name is printed.
         *
         * @productdesc {highmaps}
         * In Highmaps the context can also be a data class in case of a
         * `colorAxis`.
         *
         * @sample {highcharts} highcharts/legend/labelformatter/
         *         Add text
         * @sample {highmaps} maps/legend/labelformatter/
         *         Data classes with label formatter
         *
         * @type {Highcharts.FormatterCallbackFunction<Point|Series>}
         */
        labelFormatter: function () {
            // eslint-enable valid-jsdoc
            return this.name;
        },
        /**
         * Line height for the legend items. Deprecated as of 2.1\. Instead,
         * the line height for each item can be set using
         * `itemStyle.lineHeight`, and the padding between items using
         * `itemMarginTop` and `itemMarginBottom`.
         *
         * @sample {highcharts} highcharts/legend/lineheight/
         *         Setting padding
         *
         * @deprecated
         *
         * @type      {number}
         * @default   16
         * @since     2.0
         * @product   highcharts gantt
         * @apioption legend.lineHeight
         */
        /**
         * If the plot area sized is calculated automatically and the legend is
         * not floating, the legend margin is the space between the legend and
         * the axis labels or plot area.
         *
         * @sample {highcharts} highcharts/legend/margin-default/
         *         12 pixels by default
         * @sample {highcharts} highcharts/legend/margin-30/
         *         30 pixels
         *
         * @type      {number}
         * @default   12
         * @since     2.1
         * @apioption legend.margin
         */
        /**
         * Maximum pixel height for the legend. When the maximum height is
         * extended, navigation will show.
         *
         * @type      {number}
         * @since     2.3.0
         * @apioption legend.maxHeight
         */
        /**
         * The color of the drawn border around the legend.
         *
         * @see In styled mode, the legend border stroke can be applied with the
         *      `.highcharts-legend-box` class.
         *
         * @sample {highcharts} highcharts/legend/bordercolor/
         *         Brown border
         * @sample {highstock} stock/legend/align/
         *         Various legend options
         * @sample {highmaps} maps/legend/border-background/
         *         Border and background options
         *
         * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
         */
        borderColor: "#999999" /* Palette.neutralColor40 */,
        /**
         * The border corner radius of the legend.
         *
         * @sample {highcharts} highcharts/legend/borderradius-default/
         *         Square by default
         * @sample {highcharts} highcharts/legend/borderradius-round/
         *         5px rounded
         * @sample {highmaps} maps/legend/border-background/
         *         Border and background options
         */
        borderRadius: 0,
        /**
         * Options for the paging or navigation appearing when the legend is
         * overflown. Navigation works well on screen, but not in static
         * exported images. One way of working around that is to
         * [increase the chart height in
         * export](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/legend/navigation-enabled-false/).
         *
         * @sample highcharts/legend/scrollable-vertical/
         *         Legend with vertical scrollable extension
         * @sample highcharts/legend/scrollable-horizontal/
         *         Legend with horizontal scrollable extension
         *
         */
        navigation: {
            /**
             * How to animate the pages when navigating up or down. A value of
             * `true` applies the default navigation given in the
             * `chart.animation` option. Additional options can be given as an
             * object containing values for easing and duration.
             *
             * @sample {highcharts} highcharts/legend/navigation/
             *         Legend page navigation demonstrated
             * @sample {highstock} highcharts/legend/navigation/
             *         Legend page navigation demonstrated
             *
             * @type      {boolean|Partial<Highcharts.AnimationOptionsObject>}
             * @default   true
             * @since     2.2.4
             * @apioption legend.navigation.animation
             */
            /**
             * The pixel size of the up and down arrows in the legend paging
             * navigation.
             *
             * @sample {highcharts} highcharts/legend/navigation/
             *         Legend page navigation demonstrated
             * @sample {highstock} highcharts/legend/navigation/
             *         Legend page navigation demonstrated
             *
             * @type      {number}
             * @default   12
             * @since     2.2.4
             * @apioption legend.navigation.arrowSize
             */
            /**
             * Whether to enable the legend navigation. In most cases, disabling
             * the navigation results in an unwanted overflow.
             *
             * See also the
             * [adapt chart to legend](https://github.com/highcharts/adapt-chart-to-legend)
             * plugin for a solution to extend the chart height to make room for
             * the legend, optionally in exported charts only.
             *
             * @type      {boolean}
             * @default   true
             * @since     4.2.4
             * @apioption legend.navigation.enabled
             */
            /**
             * Text styles for the legend page navigation.
             *
             * @see In styled mode, the navigation items are styled with the
             *      `.highcharts-legend-navigation` class.
             *
             * @sample {highcharts} highcharts/legend/navigation/
             *         Legend page navigation demonstrated
             * @sample {highstock} highcharts/legend/navigation/
             *         Legend page navigation demonstrated
             *
             * @type      {Highcharts.CSSObject}
             * @since     2.2.4
             * @apioption legend.navigation.style
             */
            style: {
                /**
                 * @type {number|string}
                 */
                fontSize: '0.8em'
            },
            /**
             * The color for the active up or down arrow in the legend page
             * navigation.
             *
             * @see In styled mode, the active arrow be styled with the
             *      `.highcharts-legend-nav-active` class.
             *
             * @sample  {highcharts} highcharts/legend/navigation/
             *          Legend page navigation demonstrated
             * @sample  {highstock} highcharts/legend/navigation/
             *          Legend page navigation demonstrated
             *
             * @type  {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
             * @since 2.2.4
             */
            activeColor: "#0022ff" /* Palette.highlightColor100 */,
            /**
             * The color of the inactive up or down arrow in the legend page
             * navigation. .
             *
             * @see In styled mode, the inactive arrow be styled with the
             *      `.highcharts-legend-nav-inactive` class.
             *
             * @sample {highcharts} highcharts/legend/navigation/
             *         Legend page navigation demonstrated
             * @sample {highstock} highcharts/legend/navigation/
             *         Legend page navigation demonstrated
             *
             * @type  {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
             * @since 2.2.4
             */
            inactiveColor: "#cccccc" /* Palette.neutralColor20 */
        },
        /**
         * The inner padding of the legend box.
         *
         * @sample {highcharts|highstock} highcharts/legend/padding-itemmargin/
         *         Padding and item margins demonstrated
         * @sample {highmaps} maps/legend/padding-itemmargin/
         *         Padding and item margins demonstrated
         *
         * @type      {number}
         * @default   8
         * @since     2.2.0
         * @apioption legend.padding
         */
        /**
         * Whether to reverse the order of the legend items compared to the
         * order of the series or points as defined in the configuration object.
         *
         * @see [yAxis.reversedStacks](#yAxis.reversedStacks),
         *      [series.legendIndex](#series.legendIndex)
         *
         * @sample {highcharts} highcharts/legend/reversed/
         *         Stacked bar with reversed legend
         *
         * @type      {boolean}
         * @default   false
         * @since     1.2.5
         * @apioption legend.reversed
         */
        /**
         * Whether to show the symbol on the right side of the text rather than
         * the left side. This is common in Arabic and Hebrew.
         *
         * @sample {highcharts} highcharts/legend/rtl/
         *         Symbol to the right
         *
         * @type      {boolean}
         * @default   false
         * @since     2.2
         * @apioption legend.rtl
         */
        /**
         * CSS styles for the legend area. In the 1.x versions the position
         * of the legend area was determined by CSS. In 2.x, the position is
         * determined by properties like `align`, `verticalAlign`, `x` and `y`,
         * but the styles are still parsed for backwards compatibility.
         *
         * @deprecated
         *
         * @type      {Highcharts.CSSObject}
         * @product   highcharts highstock
         * @apioption legend.style
         */
        /**
         * CSS styles for each legend item. Only a subset of CSS is supported,
         * notably those options related to text. The default `textOverflow`
         * property makes long texts truncate. Set it to `undefined` to wrap
         * text instead. A `width` property can be added to control the text
         * width.
         *
         * @see In styled mode, the legend items can be styled with the
         *      `.highcharts-legend-item` class.
         *
         * @sample {highcharts} highcharts/legend/itemstyle/
         *         Bold black text
         * @sample {highmaps} maps/legend/itemstyle/
         *         Item text styles
         *
         * @type    {Highcharts.CSSObject}
         * @default {"color": "#333333", "cursor": "pointer", "fontSize": "0.8em", "fontWeight": "bold", "textOverflow": "ellipsis"}
         */
        itemStyle: {
            /**
             * @ignore
             */
            color: "#333333" /* Palette.neutralColor80 */,
            /**
             * @ignore
             */
            cursor: 'pointer',
            /**
             * @ignore
             */
            fontSize: '0.8em',
            /**
             * @ignore
             */
            textDecoration: 'none',
            /**
             * @ignore
             */
            textOverflow: 'ellipsis'
        },
        /**
         * CSS styles for each legend item in hover mode. Only a subset of
         * CSS is supported, notably those options related to text. Properties
         * are inherited from `style` unless overridden here.
         *
         * @see In styled mode, the hovered legend items can be styled with
         *      the `.highcharts-legend-item:hover` pseudo-class.
         *
         * @sample {highcharts} highcharts/legend/itemhoverstyle/
         *         Red on hover
         * @sample {highmaps} maps/legend/itemstyle/
         *         Item text styles
         *
         * @type    {Highcharts.CSSObject}
         * @default {"color": "#000000"}
         */
        itemHoverStyle: {
            /**
             * @ignore
             */
            color: "#000000" /* Palette.neutralColor100 */
        },
        /**
         * CSS styles for each legend item when the corresponding series or
         * point is hidden. Only a subset of CSS is supported, notably those
         * options related to text. Properties are inherited from `style`
         * unless overridden here.
         *
         * @see In styled mode, the hidden legend items can be styled with
         *      the `.highcharts-legend-item-hidden` class.
         *
         * @sample {highcharts} highcharts/legend/itemhiddenstyle/
         *         Darker gray color
         *
         * @type    {Highcharts.CSSObject}
         * @default {"color": "#cccccc"}
         */
        itemHiddenStyle: {
            /**
             * @ignore
             */
            color: "#666666" /* Palette.neutralColor60 */,
            /**
             * @ignore
             */
            textDecoration: 'line-through'
        },
        /**
         * Whether to apply a drop shadow to the legend. A `backgroundColor`
         * also needs to be applied for this to take effect. The shadow can be
         * an object configuration containing `color`, `offsetX`, `offsetY`,
         * `opacity` and `width`.
         *
         * @sample {highcharts} highcharts/legend/shadow/
         *         White background and drop shadow
         * @sample {highstock} stock/legend/align/
         *         Various legend options
         * @sample {highmaps} maps/legend/border-background/
         *         Border and background options
         *
         * @type {boolean|Highcharts.CSSObject}
         */
        shadow: false,
        /**
         * Default styling for the checkbox next to a legend item when
         * `showCheckbox` is true.
         *
         * @type {Highcharts.CSSObject}
         * @default {"width": "13px", "height": "13px", "position":"absolute"}
         */
        itemCheckboxStyle: {
            /**
             * @ignore
             */
            position: 'absolute',
            /**
             * @ignore
             */
            width: '13px', // For IE precision
            /**
             * @ignore
             */
            height: '13px'
        },
        /// itemWidth: undefined,
        /**
         * When this is true, the legend symbol width will be the same as
         * the symbol height, which in turn defaults to the font size of the
         * legend items.
         *
         * @since 5.0.0
         */
        squareSymbol: true,
        /**
         * The pixel height of the symbol for series types that use a rectangle
         * in the legend. Defaults to the font size of legend items.
         *
         * Note: This option is a default source of color axis height, if the
         * [colorAxis.height](https://api.highcharts.com/highcharts/colorAxis.height)
         * option is not set.
         *
         * @productdesc {highmaps}
         * In Highmaps, when the symbol is the gradient of a vertical color
         * axis, the height defaults to 200.
         *
         * @sample {highmaps} maps/legend/layout-vertical-sized/
         *         Sized vertical gradient
         * @sample {highmaps} maps/legend/padding-itemmargin/
         *         No distance between data classes
         *
         * @type      {number}
         * @since     3.0.8
         * @apioption legend.symbolHeight
         */
        /**
         * The border radius of the symbol for series types that use a rectangle
         * in the legend. Defaults to half the `symbolHeight`, effectively
         * creating a circle.
         *
         * For color axis scales, it defaults to 3.
         *
         * @sample {highcharts} highcharts/legend/symbolradius/
         *         Round symbols
         * @sample {highstock} highcharts/legend/symbolradius/
         *         Round symbols
         * @sample {highmaps} highcharts/legend/symbolradius/
         *         Round symbols
         *
         * @type      {number}
         * @since     3.0.8
         * @apioption legend.symbolRadius
         */
        /**
         * The pixel width of the legend item symbol. When the `squareSymbol`
         * option is set, this defaults to the `symbolHeight`, otherwise 16.
         *
         * Note: This option is a default source of color axis width, if the
         * [colorAxis.width](https://api.highcharts.com/highcharts/colorAxis.width)
         * option is not set.
         *
         * @productdesc {highmaps}
         * In Highmaps, when the symbol is the gradient of a horizontal color
         * axis, the width defaults to 200.
         *
         * @sample {highcharts} highcharts/legend/symbolwidth/
         *         Greater symbol width and padding
         * @sample {highmaps} maps/legend/padding-itemmargin/
         *         Padding and item margins demonstrated
         * @sample {highmaps} maps/legend/layout-vertical-sized/
         *         Sized vertical gradient
         *
         * @type      {number}
         * @apioption legend.symbolWidth
         */
        /**
         * Whether to [use HTML](https://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting#html)
         * to render the legend item texts.
         *
         * Prior to 4.1.7, when using HTML, [legend.navigation](
         * #legend.navigation) was disabled.
         *
         * @sample highcharts/legend/scrollable-vertical/
         *         Legend with vertical scrollable extension
         * @sample highcharts/legend/scrollable-horizontal/
         *         Legend with horizontal scrollable extension
         *
         * @type      {boolean}
         * @default   false
         * @apioption legend.useHTML
         */
        /**
         * For a color axis with data classes, how many decimals to render in
         * the legend. The default preserves the decimals of the range numbers.
         *
         * @type      {number}
         * @default   -1
         * @product   highcharts highmaps
         * @apioption legend.valueDecimals
         */
        /**
         * For a color axis with data classes, a suffix for the range numbers in
         * the legend.
         *
         * @type      {string}
         * @default   ''
         * @product   highcharts highmaps
         * @apioption legend.valueSuffix
         */
        /**
         * The width of the legend box. If a number is set, it translates to
         * pixels. Since v7.0.2 it allows setting a percent string of the full
         * chart width, for example `40%`.
         *
         * Defaults to the full chart width for legends below or above the
         * chart, half the chart width for legends to the left and right.
         *
         * @sample {highcharts} highcharts/legend/width/
         *         Aligned to the plot area
         * @sample {highcharts} highcharts/legend/width-percent/
         *         A percent of the chart width
         *
         * @type      {number|string}
         * @since     2.0
         * @apioption legend.width
         */
        /**
         * The pixel padding between the legend item symbol and the legend
         * item text.
         *
         * @sample {highcharts} highcharts/legend/symbolpadding/
         *         Greater symbol width and padding
         */
        symbolPadding: 5,
        /**
         * The vertical alignment of the legend box. Can be one of `top`,
         * `middle` or `bottom`. Vertical position can be further determined
         * by the `y` option.
         *
         * In the case that the legend is aligned in a corner position, the
         * `layout` option will determine whether to place it above/below
         * or on the side of the plot area.
         *
         * When the [layout](#legend.layout) option is `proximate`, the
         * `verticalAlign` option doesn't apply.
         *
         * @sample {highcharts} highcharts/legend/verticalalign/
         *         Legend 100px from the top of the chart
         * @sample {highstock} stock/legend/align/
         *         Various legend options
         * @sample {highmaps} maps/legend/alignment/
         *         Legend alignment
         *
         * @type  {Highcharts.VerticalAlignValue}
         * @since 2.0
         */
        verticalAlign: 'bottom',
        // Width: undefined,
        /**
         * The x offset of the legend relative to its horizontal alignment
         * `align` within chart.spacingLeft and chart.spacingRight. Negative
         * x moves it to the left, positive x moves it to the right.
         *
         * @sample {highcharts} highcharts/legend/width/
         *         Aligned to the plot area
         *
         * @since 2.0
         */
        x: 0,
        /**
         * The vertical offset of the legend relative to it's vertical alignment
         * `verticalAlign` within chart.spacingTop and chart.spacingBottom.
         *  Negative y moves it up, positive y moves it down.
         *
         * @sample {highcharts} highcharts/legend/verticalalign/
         *         Legend 100px from the top of the chart
         * @sample {highstock} stock/legend/align/
         *         Various legend options
         * @sample {highmaps} maps/legend/alignment/
         *         Legend alignment
         *
         * @since 2.0
         */
        y: 0,
        /**
         * A title to be added on top of the legend.
         *
         * @sample {highcharts} highcharts/legend/title/
         *         Legend title
         * @sample {highmaps} maps/legend/alignment/
         *         Legend with title
         *
         * @since 3.0
         */
        title: {
            /**
             * A text or HTML string for the title.
             *
             * @type      {string}
             * @since     3.0
             * @apioption legend.title.text
             */
            /**
             * Generic CSS styles for the legend title.
             *
             * @see In styled mode, the legend title is styled with the
             *      `.highcharts-legend-title` class.
             *
             * @type    {Highcharts.CSSObject}
             * @default {"fontSize": "0.8em", "fontWeight": "bold"}
             * @since   3.0
             */
            style: {
                /**
                 * @ignore
                 */
                color: "#333333" /* Palette.neutralColor80 */,
                /**
                 * @ignore
                 */
                fontSize: '0.8em',
                /**
                 * @ignore
                 */
                fontWeight: 'bold'
            }
        }
    },
    /**
     * The loading options control the appearance of the loading screen
     * that covers the plot area on chart operations. This screen only
     * appears after an explicit call to `chart.showLoading()`. It is a
     * utility for developers to communicate to the end user that something
     * is going on, for example while retrieving new data via an XHR connection.
     * The "Loading..." text itself is not part of this configuration
     * object, but part of the `lang` object.
     */
    loading: {
        /**
         * The duration in milliseconds of the fade out effect.
         *
         * @sample highcharts/loading/hideduration/
         *         Fade in and out over a second
         *
         * @type      {number}
         * @default   100
         * @since     1.2.0
         * @apioption loading.hideDuration
         */
        /**
         * The duration in milliseconds of the fade in effect.
         *
         * @sample highcharts/loading/hideduration/
         *         Fade in and out over a second
         *
         * @type      {number}
         * @default   100
         * @since     1.2.0
         * @apioption loading.showDuration
         */
        /**
         * CSS styles for the loading label `span`.
         *
         * @see In styled mode, the loading label is styled with the
         *      `.highcharts-loading-inner` class.
         *
         * @sample {highcharts|highmaps} highcharts/loading/labelstyle/
         *         Vertically centered
         * @sample {highstock} stock/loading/general/
         *         Label styles
         *
         * @type    {Highcharts.CSSObject}
         * @default {"fontWeight": "bold", "position": "relative", "top": "45%"}
         * @since   1.2.0
         */
        labelStyle: {
            /**
             * @ignore
             */
            fontWeight: 'bold',
            /**
             * @ignore
             */
            position: 'relative',
            /**
             * @ignore
             */
            top: '45%'
        },
        /**
         * CSS styles for the loading screen that covers the plot area.
         *
         * In styled mode, the loading label is styled with the
         * `.highcharts-loading` class.
         *
         * @sample  {highcharts|highmaps} highcharts/loading/style/
         *          Gray plot area, white text
         * @sample  {highstock} stock/loading/general/
         *          Gray plot area, white text
         *
         * @type    {Highcharts.CSSObject}
         * @default {"position": "absolute", "backgroundColor": "#ffffff", "opacity": 0.5, "textAlign": "center"}
         * @since   1.2.0
         */
        style: {
            /**
             * @ignore
             */
            position: 'absolute',
            /**
             * @ignore
             */
            backgroundColor: "#ffffff" /* Palette.backgroundColor */,
            /**
             * @ignore
             */
            opacity: 0.5,
            /**
             * @ignore
             */
            textAlign: 'center'
        }
    },
    /**
     * Options for the tooltip that appears when the user hovers over a
     * series or point.
     *
     * @declare Highcharts.TooltipOptions
     */
    tooltip: {
        /**
         * The color of the tooltip border. When `undefined`, the border takes
         * the color of the corresponding series or point.
         *
         * Note that the [borderWidth](#tooltip.borderWidth) is usually 0 by
         * default, so the border color may not be visible until a border width
         * is set.
         *
         * @sample {highcharts} highcharts/tooltip/bordercolor-default/ Follow
         *         series by default
         * @sample {highcharts} highcharts/tooltip/bordercolor-black/ Black
         *         border
         * @sample {highstock} stock/tooltip/general/ Styled tooltip
         * @sample {highmaps} maps/tooltip/background-border/ Background and
         *         border demo
         *
         * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
         * @apioption tooltip.borderColor
         */
        /**
         * A CSS class name to apply to the tooltip's container div,
         * allowing unique CSS styling for each chart.
         *
         * @type      {string}
         * @apioption tooltip.className
         */
        /**
         * Since 4.1, the crosshair definitions are moved to the Axis object
         * in order for a better separation from the tooltip. See
         * [xAxis.crosshair](#xAxis.crosshair).
         *
         * @sample {highcharts} highcharts/tooltip/crosshairs-x/
         *         Enable a crosshair for the x value
         *
         * @deprecated
         *
         * @type      {*}
         * @default   true
         * @apioption tooltip.crosshairs
         */
        /**
         * Distance from point to tooltip in pixels.
         *
         * @type      {number}
         * @default   16
         * @apioption tooltip.distance
         */
        /**
         * Whether the tooltip should be fixed to one position in the chart, or
         * located next to the point or mouse. When the tooltip is fixed, the
         * position can be further specified with the
         * [tooltip.position](#tooltip.position) options set.
         *
         * @sample    highcharts/tooltip/fixed/
         *            Fixed tooltip and position options
         * @sample    {highstock} stock/tooltip/fixed/
         *            Stock chart with fixed tooltip
         * @sample    {highmaps} maps/tooltip/fixed/
         *            Map with fixed tooltip
         *
         * @type      {boolean}
         * @default   false
         * @since 12.2.0
         * @apioption tooltip.fixed
         */
        /**
         * Whether the tooltip should follow the mouse as it moves across
         * columns, pie slices and other point types with an extent.
         * By default it behaves this way for pie, polygon, map, sankey
         * and wordcloud series by override in the `plotOptions`
         * for those series types.
         *
         * Does not apply if [split](#tooltip.split) is `true`.
         *
         * For touch moves to behave the same way, [followTouchMove](
         * #tooltip.followTouchMove) must be `true` also.
         *
         * @sample highcharts/tooltip/followpointer/
         *         Tooltip follow pointer comparison
         *
         * @type      {boolean}
         * @default   {highcharts} false
         * @default   {highstock} false
         * @default   {highmaps} true
         * @since     3.0
         * @apioption tooltip.followPointer
         */
        /**
         * Whether the tooltip should update as the finger moves on a touch
         * device. If this is `true` and [chart.panning](#chart.panning) is
         * set,`followTouchMove` will take over one-finger touches, so the user
         * needs to use two fingers for zooming and panning.
         *
         * Note the difference to [followPointer](#tooltip.followPointer) that
         * only defines the _position_ of the tooltip. If `followPointer` is
         * false in for example a column series, the tooltip will show above or
         * below the column, but as `followTouchMove` is true, the tooltip will
         * jump from column to column as the user swipes across the plot area.
         *
         * @type      {boolean}
         * @default   {highcharts} true
         * @default   {highstock} true
         * @default   {highmaps} false
         * @since     3.0.1
         * @apioption tooltip.followTouchMove
         */
        /**
         * A [format string](https://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting)
         * for the whole shared tooltip. When format strings are a requirement,
         * it is usually more convenient to use `headerFormat`, `pointFormat`
         * and `footerFormat`, but the `format` option allows combining them
         * into one setting.
         *
         * The context of the format string is the same as that of the
         * `tooltip.formatter` callback.
         *
         * @sample {highcharts} highcharts/tooltip/format-shared/
         *         Format for shared tooltip
         *
         * @type      {string}
         * @default   undefined
         * @since     11.1.0
         * @apioption tooltip.format
         */
        /**
         * Callback function to format the text of the tooltip from scratch. In
         * case of single or [shared](#tooltip.shared) tooltips, a string should
         * be returned. In case of [split](#tooltip.split) tooltips, it should
         * return an array where the first item is the header, and subsequent
         * items are mapped to the points. Return `false` to disable tooltip for
         * a specific point on series.
         *
         * A subset of HTML is supported. Unless `useHTML` is true, the HTML of
         * the tooltip is parsed and converted to SVG, therefore this isn't a
         * complete HTML renderer. The following HTML tags are supported: `b`,
         * `br`, `em`, `i`, `span`, `strong`. Spans can be styled with a `style`
         * attribute, but only text-related CSS, that is shared with SVG, is
         * handled.
         *
         * The context of the formatter (since v12) is the
         * [Point](https://api.highcharts.com/class-reference/Highcharts.Point)
         * instance. If the tooltip is shared or split, an array `this.points`
         * contains all points of the hovered x-value.
         *
         * Common properties from the Point to use in the formatter include:
         *
         * - **Point.percentage**:
         *   Stacked series and pies only. The point's percentage of the total.
         *
         * - **Point.points**:
         *   In a shared or split tooltip, this is an array containing all the
         *   hovered points.
         *
         * - **this.series**:
         *   The series object. The series name is available through
         *   `this.series.name`.
         *
         * - **this.total**:
         *   The total value at this point's x value in a stacked series, or the
         *   sum of all slices in a pie series.
         *
         * - **this.x**:
         *   The x value.
         *
         * - **this.y**:
         *   The y value.
         *
         * @sample {highcharts} highcharts/tooltip/formatter-simple/
         *         Simple string formatting
         * @sample {highcharts} highcharts/tooltip/formatter-shared/
         *         Formatting with shared tooltip
         * @sample {highcharts|highstock} highcharts/tooltip/formatter-split/
         *         Formatting with split tooltip
         * @sample highcharts/tooltip/formatter-conditional-default/
         *         Extending default formatter
         * @sample {highstock} stock/tooltip/formatter/
         *         Formatting with shared tooltip
         * @sample {highmaps} maps/tooltip/formatter/
         *         String formatting
         *
         * @type      {Highcharts.TooltipFormatterCallbackFunction}
         * @apioption tooltip.formatter
         */
        /**
         * Callback function to format the text of the tooltip for
         * visible null points.
         * Works analogously to [formatter](#tooltip.formatter).
         *
         * @sample highcharts/plotoptions/series-nullformat
         *         Format data label and tooltip for null point.
         *
         * @type      {Highcharts.TooltipFormatterCallbackFunction}
         * @apioption tooltip.nullFormatter
         */
        /**
         * Whether to allow the tooltip to render outside the chart's SVG
         * element box. By default (`false`), the tooltip is rendered within the
         * chart's SVG element, which results in the tooltip being aligned
         * inside the chart area. For small charts, this may result in clipping
         * or overlapping. When `true`, a separate SVG element is created and
         * overlaid on the page, allowing the tooltip to be aligned inside the
         * page itself. Beware that with this option active, CSS classes on the
         * chart's target container, with classnames matching the pattern
         * 'highcharts-*', will be set on the tooltip as well. This is done to
         * support theming for tooltips with this option.
         *
         * Defaults to `true` if `chart.scrollablePlotArea` is activated,
         * otherwise `false`.
         *
         * @sample highcharts/tooltip/outside
         *         Small charts with tooltips outside
         *
         * @type      {boolean|undefined}
         * @default   undefined
         * @since     6.1.1
         * @apioption tooltip.outside
         */
        /**
         * A callback function for formatting the HTML output for a single point
         * in the tooltip. Like the `pointFormat` string, but with more
         * flexibility.
         *
         * @type      {Highcharts.FormatterCallbackFunction<Highcharts.Point>}
         * @since     4.1.0
         * @context   Highcharts.Point
         * @apioption tooltip.pointFormatter
         */
        /**
         * A callback function to place the tooltip in a custom position. The
         * callback receives three parameters: `labelWidth`, `labelHeight` and
         * `point`, where point contains values for `plotX` and `plotY` telling
         * where the reference point is in the plot area. Add `chart.plotLeft`
         * and `chart.plotTop` to get the full coordinates.
         *
         * To find the actual hovered `Point` instance, use
         * `this.chart.hoverPoint`. For shared or split tooltips, all the hover
         * points are available in `this.chart.hoverPoints`.
         *
         * Since v7, when [tooltip.split](#tooltip.split) option is enabled,
         * positioner is called for each of the boxes separately, including
         * xAxis header. xAxis header is not a point, instead `point` argument
         * contains info: `{ plotX: Number, plotY: Number, isHeader: Boolean }`
         *
         * Since v12.2, the [tooltip.fixed](#tooltip.fixed) option combined with
         * [tooltip.position](#tooltip.position) covers most of the use cases
         * for custom tooltip positioning.
         *
         * The return should be an object containing x and y values, for example
         * `{ x: 100, y: 100 }`.
         *
         * @sample {highcharts} highcharts/tooltip/positioner/
         *         A fixed tooltip position
         * @sample {highstock} stock/tooltip/positioner/
         *         A fixed tooltip position on top of the chart
         * @sample {highmaps} maps/tooltip/positioner/
         *         A fixed tooltip position
         * @sample {highstock} stock/tooltip/split-positioner/
         *         Split tooltip with fixed positions
         * @sample {highstock} stock/tooltip/positioner-scrollable-plotarea/
         *         Scrollable plot area combined with tooltip positioner
         *
         * @see [position](#tooltip.position)
         *
         * @type      {Highcharts.TooltipPositionerCallbackFunction}
         * @since     2.2.4
         * @apioption tooltip.positioner
         */
        /**
         * Shows tooltip for all points with the same X value. Splits the
         * tooltip into one label per series, with the header close to the axis.
         * This is recommended over [shared](#tooltip.shared)
         * tooltips for charts with multiple line series, generally making them
         * easier to read. This option takes precedence over `tooltip.shared`.
         *
         * Not supported for [polar](#chart.polar) and [inverted](#chart.inverted) charts.
         *
         * @productdesc {highstock} In Highcharts Stock, tooltips are split
         * by default since v6.0.0. Stock charts typically contain
         * multi-dimension points and multiple panes, making split tooltips
         * the preferred layout over
         * the previous `shared` tooltip.
         *
         * @sample highcharts/tooltip/split/
         *         Split tooltip
         * @sample {highcharts|highstock} highcharts/tooltip/formatter-split/
         *         Split tooltip and custom formatter callback
         *
         * @type      {boolean}
         * @default   {highcharts} false
         * @default   {highstock} true
         * @since     5.0.0
         * @product   highcharts highstock
         * @apioption tooltip.split
         */
        /**
         * Prevents the tooltip from switching or closing, when touched or
         * pointed.
         *
         * @sample highcharts/tooltip/stickoncontact/
         *         Tooltip sticks on pointer contact
         *
         * @type      {boolean}
         * @since     8.0.1
         * @apioption tooltip.stickOnContact
         */
        /**
         * Use HTML to render the contents of the tooltip instead of SVG. Using
         * HTML allows advanced formatting like tables and images in the
         * tooltip. It is also recommended for rtl languages as it works around
         * rtl bugs in early Firefox.
         *
         * @sample {highcharts|highstock} highcharts/tooltip/footerformat/
         *         A table for value alignment
         * @sample {highcharts|highstock} highcharts/tooltip/fullhtml/
         *         Full HTML tooltip
         * @sample {highmaps} maps/tooltip/usehtml/
         *         Pure HTML tooltip
         *
         * @type      {boolean}
         * @default   false
         * @since     2.2
         * @apioption tooltip.useHTML
         */
        /**
         * How many decimals to show in each series' y value. This is
         * overridable in each series' tooltip options object. The default is to
         * preserve all decimals.
         *
         * @sample {highcharts|highstock} highcharts/tooltip/valuedecimals/
         *         Set decimals, prefix and suffix for the value
         * @sample {highmaps} maps/tooltip/valuedecimals/
         *         Set decimals, prefix and suffix for the value
         *
         * @type      {number|undefined}
         * @since     2.2
         * @apioption tooltip.valueDecimals
         */
        /**
         * A string to prepend to each series' y value. Overridable in each
         * series' tooltip options object.
         *
         * @sample {highcharts|highstock} highcharts/tooltip/valuedecimals/
         *         Set decimals, prefix and suffix for the value
         * @sample {highmaps} maps/tooltip/valuedecimals/
         *         Set decimals, prefix and suffix for the value
         *
         * @type      {string}
         * @since     2.2
         * @apioption tooltip.valuePrefix
         */
        /**
         * A string to append to each series' y value. Overridable in each
         * series' tooltip options object.
         *
         * @sample {highcharts|highstock} highcharts/tooltip/valuedecimals/
         *         Set decimals, prefix and suffix for the value
         * @sample {highmaps} maps/tooltip/valuedecimals/
         *         Set decimals, prefix and suffix for the value
         *
         * @type      {string}
         * @since     2.2
         * @apioption tooltip.valueSuffix
         */
        /**
         * The format for the date in the tooltip header if the X axis is a
         * datetime axis. The default is a best guess based on the smallest
         * distance between points in the chart.
         *
         * @sample {highcharts} highcharts/tooltip/xdateformat/
         *         A different format
         *
         * @type      {string|Highcharts.DateTimeFormatOptions}
         * @product   highcharts highstock gantt
         * @apioption tooltip.xDateFormat
         */
        /**
         * How many decimals to show for the `point.change`
         * or the `point.cumulativeSum` value when the `series.compare`
         * or the `series.cumulative` option is set.
         * This is overridable in each series' tooltip options object.
         *
         * @type      {number}
         * @default   2
         * @since     1.0.1
         * @product   highstock
         * @apioption tooltip.changeDecimals
         */
        /**
         * Enable or disable the tooltip.
         *
         * @sample {highcharts} highcharts/tooltip/enabled/
         *         Disabled
         * @sample {highcharts} highcharts/plotoptions/series-point-events-mouseover/
         *         Disable tooltip and show values on chart instead
         */
        enabled: true,
        /**
         * Enable or disable animation of the tooltip.
         *
         * @type       {boolean|Partial<Highcharts.AnimationOptionsObject>}
         * @since      2.3.0
         */
        animation: {
            duration: 300,
            // EaseOutCirc
            easing: function (x) { return Math.sqrt(1 - Math.pow(x - 1, 2)); }
        },
        /**
         * The radius of the rounded border corners.
         *
         * @sample {highcharts} highcharts/tooltip/bordercolor-default/
         *         Default border radius
         * @sample {highcharts} highcharts/tooltip/borderradius-0/
         *         Square borders
         * @sample {highmaps} maps/tooltip/background-border/
         *         Background and border demo
         */
        borderRadius: 3,
        /**
         * For series on datetime axes, the date format in the tooltip's
         * header will by default be guessed based on the closest data points.
         * This member gives the default string representations used for
         * each unit. For an overview of the string or object configuration, see
         * [dateFormat](/class-reference/Highcharts.Time#dateFormat).
         *
         * @see [xAxis.dateTimeLabelFormats](#xAxis.dateTimeLabelFormats)
         *
         * @type    {Highcharts.Dictionary<string|Highcharts.DateTimeFormatOptions>}
         * @product highcharts highstock gantt
         */
        dateTimeLabelFormats: {
            /** @internal */
            millisecond: '%[AebHMSL]',
            /** @internal */
            second: '%[AebHMS]',
            /** @internal */
            minute: '%[AebHM]',
            /** @internal */
            hour: '%[AebHM]',
            /** @internal */
            day: '%[AebY]',
            /** @internal */
            week: '%v %[AebY]',
            /** @internal */
            month: '%[BY]',
            /** @internal */
            year: '%Y'
        },
        /**
         * A string to append to the tooltip format.
         *
         * @sample {highcharts} highcharts/tooltip/footerformat/
         *         A table for value alignment
         * @sample {highmaps} maps/tooltip/format/
         *         Format demo
         *
         * @since 2.2
         */
        footerFormat: '',
        /**
         * The name of a symbol to use for the border around the tooltip
         * header. Applies only when [tooltip.split](#tooltip.split) is
         * enabled.
         *
         * Custom callbacks for symbol path generation can also be added to
         * `Highcharts.SVGRenderer.prototype.symbols` the same way as for
         * [series.marker.symbol](plotOptions.line.marker.symbol).
         *
         * @see [tooltip.shape](#tooltip.shape)
         *
         * @sample {highstock} stock/tooltip/split-positioner/
         *         Different shapes for header and split boxes
         *
         * @type       {Highcharts.TooltipShapeValue}
         * @validvalue ["callout", "rect"]
         * @since      7.0
         */
        headerShape: 'callout',
        /**
         * The number of milliseconds to wait until the tooltip is hidden when
         * mouse out from a point or chart.
         *
         * @since 3.0
         */
        hideDelay: 500,
        /**
         * Padding inside the tooltip, in pixels.
         *
         * @since 5.0.0
         */
        padding: 8,
        /**
         * Positioning options for fixed tooltip, taking effect only when
         * [tooltip.fixed](#tooltip.fixed) is `true`.
         *
         * @sample {highcharts} highcharts/tooltip/fixed/
         *         Fixed tooltip and position options
         * @sample {highstock} stock/tooltip/fixed/
         *         Stock chart with fixed tooltip
         * @sample {highmaps} maps/tooltip/fixed/
         *         Map with fixed tooltip
         *
         * @since 12.2.0
         */
        position: {
            /**
             * The horizontal alignment of the fixed tooltip.
             *
             * @sample highcharts/tooltip/fixed/
             *         Fixed tooltip
             * @sample {highstock} stock/tooltip/fixed/
             *         Stock chart with fixed tooltip
             *
             * @type {Highcharts.AlignValue}
             * @default left
             * @apioption tooltip.position.align
             */
            /**
             * The vertical alignment of the fixed tooltip.
             *
             * @sample highcharts/tooltip/fixed/
             *         Fixed tooltip
             * @sample {highstock} stock/tooltip/fixed/
             *         Stock chart with fixed tooltip
             *
             * @type {Highcharts.VerticalAlignValue}
             * @default top
             * @apioption tooltip.position.verticalAlign
             */
            /**
             * What the fixed tooltip alignment should be relative to.
             *
             * The default, `pane`, means that it is aligned within the plot
             * area for that given series. If the tooltip is split (as default
             * in Stock charts), each partial tooltip is aligned within the
             * series' pane.
             *
             * @sample highcharts/tooltip/fixed/
             *         Fixed tooltip
             * @sample {highstock} stock/tooltip/fixed/
             *         Stock chart with fixed tooltip
             *
             * @type {string}
             * @default pane
             * @validvalue ["pane", "chart", "plotBox", "spacingBox"]
             * @apioption tooltip.position.relativeTo
             */
            /**
             * X pixel offset from the given position. Can be used to shy away
             * from axis lines, grid lines etc to avoid the tooltip overlapping
             * other elements.
             *
             * @sample highcharts/tooltip/fixed/
             *         Fixed tooltip
             * @sample {highstock} stock/tooltip/fixed/
             *         Stock chart with fixed tooltip
             */
            x: 0,
            /**
             * Y pixel offset from the given position. Can be used to shy away
             * from axis lines, grid lines etc to avoid the tooltip overlapping
             * other elements.
             *
             * @sample highcharts/tooltip/fixed/
             *         Fixed tooltip
             * @sample {highstock} stock/tooltip/fixed/
             *         Stock chart with fixed tooltip
             */
            y: 3
        },
        /**
         * The name of a symbol to use for the border around the tooltip. Can
         * be one of: `"callout"`, `"circle"` or `"rect"`. When
         * [tooltip.split](#tooltip.split)
         * option is enabled, shape is applied to all boxes except header, which
         * is controlled by
         * [tooltip.headerShape](#tooltip.headerShape).
         *
         * Custom callbacks for symbol path generation can also be added to
         * `Highcharts.SVGRenderer.prototype.symbols` the same way as for
         * [series.marker.symbol](plotOptions.line.marker.symbol).
         *
         * Defaults to `callout` for floating tooltip, `rect` for
         * [fixed](#tooltip.fixed) tooltip.
         *
         * @type  {Highcharts.TooltipShapeValue}
         * @since 4.0
         * @default undefined
         * @apioption tooltip.shape
         */
        /**
         * Shows information in the tooltip for all points with the same X
         * value. When the tooltip is shared, the entire plot area will capture
         * mouse movement or touch events. Tooltip texts for series types with
         * ordered data (not pie, scatter, flags etc) will be shown in a single
         * bubble. This is recommended for single series charts and for
         * tablet/mobile optimized charts.
         *
         * See also [tooltip.split](#tooltip.split), that is better suited for
         * charts with many series, especially line-type series. The
         * `tooltip.split` option takes precedence over `tooltip.shared`.
         *
         * @sample {highcharts} highcharts/tooltip/shared-false/
         *         False by default
         * @sample {highcharts} highcharts/tooltip/shared-true/
         *         True
         * @sample {highcharts} highcharts/tooltip/shared-x-crosshair/
         *         True with x axis crosshair
         * @sample {highcharts} highcharts/tooltip/shared-true-mixed-types/
         *         True with mixed series types
         *
         * @since   2.1
         * @product highcharts highstock
         */
        shared: false,
        /**
         * Proximity snap for graphs or single points. It defaults to 10 for
         * mouse-powered devices and 25 for touch devices.
         *
         * Note that in most cases the whole plot area captures the mouse
         * movement, and in these cases `tooltip.snap` doesn't make sense. This
         * applies when [stickyTracking](#plotOptions.series.stickyTracking)
         * is `true` (default) and when the tooltip is [shared](#tooltip.shared)
         * or [split](#tooltip.split).
         *
         * @sample {highcharts} highcharts/tooltip/bordercolor-default/
         *         10 px by default
         * @sample {highcharts} highcharts/tooltip/snap-50/
         *         50 px on graph
         *
         * @type    {number}
         * @default 10/25
         * @since   1.2.0
         * @product highcharts highstock
         */
        snap: isTouchDevice ? 25 : 10,
        /**
         * The HTML of the tooltip header line. The context is the
         * [Point class](https://api.highcharts.com/class-reference/Highcharts.Point).
         * Variables are enclosed in curly brackets. Examples of common
         * variables to include are `x`, `y`, `series.name` and `series.color`
         * and other properties on the same form. The `point.key` variable
         * contains the category name, x value or datetime string depending on
         * the type of axis. For datetime axes, the `point.key` date format can
         * be set using `tooltip.xDateFormat`.
         *
         * @sample {highcharts} highcharts/tooltip/footerformat/
         *         An HTML table in the tooltip
         * @sample {highstock} highcharts/tooltip/footerformat/
         *         An HTML table in the tooltip
         * @sample {highmaps} maps/tooltip/format/
         *         Format demo
         *
         * @type      {string}
         * @apioption tooltip.headerFormat
         */
        headerFormat: '<span style="font-size: 0.8em">{ucfirst point.key}</span><br/>',
        /**
         * The HTML of the null point's line in the tooltip. Works analogously
         * to [pointFormat](#tooltip.pointFormat).
         *
         * @sample {highcharts} highcharts/series/null-interaction
         *         Line chart with null interaction
         * @sample {highcharts} highcharts/plotoptions/series-nullformat
         *         Heatmap with null interaction
         *
         * @type      {string}
         * @apioption tooltip.nullFormat
         */
        /**
         * The HTML of the point's line in the tooltip. The context is the
         * [Point class](https://api.highcharts.com/class-reference/Highcharts.Point).
         * Variables are enclosed in curly brackets. Examples of common
         * variables to include are `x`, `y`, `series.name` and `series.color`
         * and other properties on the same form. Furthermore, `y` can be
         * extended by the `tooltip.valuePrefix` and `tooltip.valueSuffix`
         * variables. This can also be overridden for each series, which makes
         * it a good hook for displaying units.
         *
         * In styled mode, the dot is colored by a class name rather than the
         * point color.
         *
         * @sample {highcharts} highcharts/tooltip/pointformat/
         *         A different point format with value suffix
         * @sample {highcharts|highstock} highcharts/tooltip/pointformat-extra-information/
         *         Show extra information about points in the tooltip
         * @sample {highmaps} maps/tooltip/format/
         *         Format demo
         *
         * @type       {string}
         * @since      2.2
         * @apioption  tooltip.pointFormat
         */
        pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
        /**
         * The background color or gradient for the tooltip.
         *
         * In styled mode, the stroke width is set in the
         * `.highcharts-tooltip-box` class.
         *
         * @sample {highcharts} highcharts/tooltip/backgroundcolor-solid/
         *         Yellowish background
         * @sample {highcharts} highcharts/tooltip/backgroundcolor-gradient/
         *         Gradient
         * @sample {highcharts} highcharts/css/tooltip-border-background/
         *         Tooltip in styled mode
         * @sample {highstock} stock/tooltip/general/
         *         Custom tooltip
         * @sample {highstock} highcharts/css/tooltip-border-background/
         *         Tooltip in styled mode
         * @sample {highmaps} maps/tooltip/background-border/
         *         Background and border demo
         * @sample {highmaps} highcharts/css/tooltip-border-background/
         *         Tooltip in styled mode
         *
         * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
         */
        backgroundColor: "#ffffff" /* Palette.backgroundColor */,
        /**
         * The pixel width of the tooltip border. Defaults to 0 for single
         * tooltips and fixed tooltips, otherwise 1 for split tooltips.
         *
         * In styled mode, the stroke width is set in the
         * `.highcharts-tooltip-box` class.
         *
         * @sample {highcharts} highcharts/tooltip/bordercolor-default/
         *         2 pixels
         * @sample {highcharts} highcharts/tooltip/borderwidth/
         *         No border (shadow only)
         * @sample {highcharts} highcharts/css/tooltip-border-background/
         *         Tooltip in styled mode
         * @sample {highstock} stock/tooltip/general/
         *         Custom tooltip
         * @sample {highstock} highcharts/css/tooltip-border-background/
         *         Tooltip in styled mode
         * @sample {highmaps} maps/tooltip/background-border/
         *         Background and border demo
         * @sample {highmaps} highcharts/css/tooltip-border-background/
         *         Tooltip in styled mode
         *
         * @type {number}
         */
        borderWidth: void 0,
        /**
         * Whether to apply a drop shadow to the tooltip. Defaults to true,
         * unless the tooltip is [fixed](#tooltip.fixed).
         *
         * @sample {highcharts} highcharts/tooltip/bordercolor-default/
         *         True by default
         * @sample {highcharts} highcharts/tooltip/shadow/
         *         False
         * @sample {highmaps} maps/tooltip/positioner/
         *         Fixed tooltip position, border and shadow disabled
         *
         * @type {boolean|Highcharts.ShadowOptionsObject}
         * @default undefined
         * @apioption tooltip.shadow
         */
        /**
         * Prevents the tooltip from switching or closing when touched or
         * pointed.
         *
         * @sample highcharts/tooltip/stickoncontact/
         *         Tooltip sticks on pointer contact
         *
         * @since 8.0.1
         */
        stickOnContact: false,
        /**
         * CSS styles for the tooltip. The tooltip can also be styled through
         * the CSS class `.highcharts-tooltip`.
         *
         * Note that the default `pointerEvents` style makes the tooltip ignore
         * mouse events, so in order to use clickable tooltips, this value must
         * be set to `auto`.
         *
         * @sample {highcharts} highcharts/tooltip/style/
         *         Greater padding, bold text
         *
         * @type {Highcharts.CSSObject}
         */
        style: {
            /** @internal */
            color: "#333333" /* Palette.neutralColor80 */,
            /** @internal */
            cursor: 'default',
            /**
             * @type {number|string}
             */
            fontSize: '0.8em'
        },
        /**
         * Use HTML to render the contents of the tooltip instead of SVG. Using
         * HTML allows advanced formatting like tables and images in the
         * tooltip. It is also recommended for rtl languages as it works around
         * rtl bugs in early Firefox.
         *
         * @sample {highcharts|highstock} highcharts/tooltip/footerformat/
         *         A table for value alignment
         * @sample {highcharts|highstock} highcharts/tooltip/fullhtml/
         *         Full HTML tooltip
         * @sample {highmaps} maps/tooltip/usehtml/
         *         Pure HTML tooltip
         *
         * @since 2.2
         */
        useHTML: false
    },
    /**
     * Highchart by default puts a credits label in the lower right corner
     * of the chart. This can be changed using these options.
     */
    credits: {
        /**
         * Credits for map source to be concatenated with conventional credit
         * text. By default this is a format string that collects copyright
         * information from the map if available.
         *
         * @see [mapTextFull](#credits.mapTextFull)
         * @see [text](#credits.text)
         *
         * @type      {string}
         * @default   \u00a9 <a href="{geojson.copyrightUrl}">{geojson.copyrightShort}</a>
         * @since     4.2.2
         * @product   highmaps
         * @apioption credits.mapText
         */
        /**
         * Detailed credits for map source to be displayed on hover of credits
         * text. By default this is a format string that collects copyright
         * information from the map if available.
         *
         * @see [mapText](#credits.mapText)
         * @see [text](#credits.text)
         *
         * @type      {string}
         * @default   {geojson.copyright}
         * @since     4.2.2
         * @product   highmaps
         * @apioption credits.mapTextFull
         */
        /**
         * Whether to show the credits text.
         *
         * @sample {highcharts} highcharts/credits/enabled-false/
         *         Credits disabled
         * @sample {highstock} stock/credits/enabled/
         *         Credits disabled
         * @sample {highmaps} maps/credits/enabled-false/
         *         Credits disabled
         */
        enabled: true,
        /**
         * The URL for the credits label.
         *
         * @sample {highcharts} highcharts/credits/href/
         *         Custom URL and text
         * @sample {highmaps} maps/credits/customized/
         *         Custom URL and text
         */
        href: 'https://www.highcharts.com?credits',
        /**
         * Position configuration for the credits label.
         *
         * @sample {highcharts} highcharts/credits/position-left/
         *         Left aligned
         * @sample {highcharts} highcharts/credits/position-left/
         *         Left aligned
         * @sample {highmaps} maps/credits/customized/
         *         Left aligned
         * @sample {highmaps} maps/credits/customized/
         *         Left aligned
         *
         * @type    {Highcharts.AlignObject}
         * @since   2.1
         */
        position: {
            /** @internal */
            align: 'right',
            /** @internal */
            x: -10,
            /** @internal */
            verticalAlign: 'bottom',
            /** @internal */
            y: -5
        },
        /**
         * CSS styles for the credits label.
         *
         * @see In styled mode, credits styles can be set with the
         *      `.highcharts-credits` class.
         *
         * @type {Highcharts.CSSObject}
         */
        style: {
            /** @internal */
            cursor: 'pointer',
            /** @internal */
            color: "#999999" /* Palette.neutralColor40 */,
            /**
             * @type {number|string}
             */
            fontSize: '0.6em'
        },
        /**
         * The text for the credits label.
         *
         * @productdesc {highmaps}
         * If a map is loaded as GeoJSON, the text defaults to
         * `Highcharts @ {map-credits}`. Otherwise, it defaults to
         * `Highcharts.com`.
         *
         * @sample {highcharts} highcharts/credits/href/
         *         Custom URL and text
         * @sample {highmaps} maps/credits/customized/
         *         Custom URL and text
         */
        text: 'Highcharts.com'
    }
};
var defaultTime = new Time(defaultOptions.time, defaultOptions.lang);
/**
 * Get the updated default options. Until 3.0.7, merely exposing defaultOptions
 * for outside modules wasn't enough because the setOptions method created a new
 * object.
 *
 * @function Highcharts.getOptions
 *
 * @return {Highcharts.Options}
 * Default options.
 */
function getOptions() {
    return defaultOptions;
}
/**
 * Merge the default options with custom options and return the new options
 * structure. Commonly used for defining reusable templates.
 *
 * @sample highcharts/members/setoptions Applying a global theme
 *
 * @function Highcharts.setOptions
 *
 * @param {Highcharts.Options} options
 * The new custom chart options.
 *
 * @return {Highcharts.Options}
 * Updated options.
 */
function setOptions(options) {
    var _a;
    fireEvent(H, 'setOptions', { options: options });
    // Copy in the default options
    merge(true, defaultOptions, options);
    // Update the time object
    if (options.time) {
        defaultTime.update(defaultOptions.time);
    }
    if (options.lang && 'locale' in options.lang) {
        defaultTime.update({
            locale: options.lang.locale
        });
    }
    if ((_a = options.lang) === null || _a === void 0 ? void 0 : _a.chartTitle) {
        defaultOptions.title = __assign(__assign({}, defaultOptions.title), { text: options.lang.chartTitle });
    }
    return defaultOptions;
}
/* *
 *
 *  Default Export
 *
 * */
var DefaultOptions = {
    defaultOptions: defaultOptions,
    defaultTime: defaultTime,
    getOptions: getOptions,
    setOptions: setOptions
};
export default DefaultOptions;
/* *
 *
 *  API Declarations
 *
 * */
/**
 * @typedef {"plotBox"|"spacingBox"} Highcharts.ButtonRelativeToValue
 */
/**
 * Gets fired when a series is added to the chart after load time, using the
 * `addSeries` method. Returning `false` prevents the series from being added.
 *
 * @callback Highcharts.ChartAddSeriesCallbackFunction
 *
 * @param {Highcharts.Chart} this
 *        The chart on which the event occurred.
 *
 * @param {Highcharts.ChartAddSeriesEventObject} event
 *        The event that occurred.
 */
/**
 * Contains common event information. Through the `options` property you can
 * access the series options that were passed to the `addSeries` method.
 *
 * @interface Highcharts.ChartAddSeriesEventObject
 */ /**
* The series options that were passed to the `addSeries` method.
* @name Highcharts.ChartAddSeriesEventObject#options
* @type {Highcharts.SeriesOptionsType}
*/ /**
* Prevents the default behaviour of the event.
* @name Highcharts.ChartAddSeriesEventObject#preventDefault
* @type {Function}
*/ /**
* The event target.
* @name Highcharts.ChartAddSeriesEventObject#target
* @type {Highcharts.Chart}
*/ /**
* The event type.
* @name Highcharts.ChartAddSeriesEventObject#type
* @type {"addSeries"}
*/
/**
 * Gets fired when clicking on the plot background.
 *
 * @callback Highcharts.ChartClickCallbackFunction
 *
 * @param {Highcharts.Chart} this
 *        The chart on which the event occurred.
 *
 * @param {Highcharts.PointerEventObject} event
 *        The event that occurred.
 */
/**
 * Contains an axes of the clicked spot.
 *
 * @interface Highcharts.ChartClickEventAxisObject
 */ /**
* Axis at the clicked spot.
* @name Highcharts.ChartClickEventAxisObject#axis
* @type {Highcharts.Axis}
*/ /**
* Axis value at the clicked spot.
* @name Highcharts.ChartClickEventAxisObject#value
* @type {number}
*/
/**
 * Contains information about the clicked spot on the chart. Remember the unit
 * of a datetime axis is milliseconds since 1970-01-01 00:00:00.
 *
 * @interface Highcharts.ChartClickEventObject
 * @extends Highcharts.PointerEventObject
 */ /**
* Information about the x-axis on the clicked spot.
* @name Highcharts.ChartClickEventObject#xAxis
* @type {Array<Highcharts.ChartClickEventAxisObject>}
*/ /**
* Information about the y-axis on the clicked spot.
* @name Highcharts.ChartClickEventObject#yAxis
* @type {Array<Highcharts.ChartClickEventAxisObject>}
*/ /**
* Information about the z-axis on the clicked spot.
* @name Highcharts.ChartClickEventObject#zAxis
* @type {Array<Highcharts.ChartClickEventAxisObject>|undefined}
*/
/**
 * Gets fired when the chart is finished loading.
 *
 * @callback Highcharts.ChartLoadCallbackFunction
 *
 * @param {Highcharts.Chart} this
 *        The chart on which the event occurred.
 *
 * @param {global.Event} event
 *        The event that occurred.
 */
/**
 * Fires when the chart is redrawn, either after a call to `chart.redraw()` or
 * after an axis, series or point is modified with the `redraw` option set to
 * `true`.
 *
 * @callback Highcharts.ChartRedrawCallbackFunction
 *
 * @param {Highcharts.Chart} this
 *        The chart on which the event occurred.
 *
 * @param {global.Event} event
 *        The event that occurred.
 */
/**
 * Gets fired after initial load of the chart (directly after the `load` event),
 * and after each redraw (directly after the `redraw` event).
 *
 * @callback Highcharts.ChartRenderCallbackFunction
 *
 * @param {Highcharts.Chart} this
 *        The chart on which the event occurred.
 *
 * @param {global.Event} event
 *        The event that occurred.
 */
/**
 * Gets fired when an area of the chart has been selected. The default action
 * for the selection event is to zoom the chart to the selected area. It can be
 * prevented by calling `event.preventDefault()` or return false.
 *
 * @callback Highcharts.ChartSelectionCallbackFunction
 *
 * @param {Highcharts.Chart} this
 *        The chart on which the event occurred.
 *
 * @param {Highcharts.SelectEventObject} event
 *        Event informations
 *
 * @return {boolean|undefined}
 *         Return false to prevent the default action, usually zoom.
 */
(''); // Detach doclets above
