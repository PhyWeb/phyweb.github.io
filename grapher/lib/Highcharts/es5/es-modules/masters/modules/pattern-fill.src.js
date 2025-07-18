/**
 * @license Highcharts JS v@product.version@ (@product.date@)
 * @module highcharts/modules/pattern-fill
 * @requires highcharts
 *
 * Module for adding patterns and images as point fills.
 *
 * (c) 2010-2025 Highsoft AS
 * Author: Torstein Hønsi, Øystein Moseng
 *
 * License: www.highcharts.com/license
 */
'use strict';
import Highcharts from '../../Core/Globals.js';
import PatternFill from '../../Extensions/PatternFill.js';
var G = Highcharts;
G.patterns = PatternFill.patterns;
PatternFill.compose(G.Chart, G.Series, G.SVGRenderer);
export default Highcharts;
