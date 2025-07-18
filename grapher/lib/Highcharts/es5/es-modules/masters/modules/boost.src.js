/**
 * @license Highcharts JS v@product.version@ (@product.date@)
 * @module highcharts/modules/boost
 * @requires highcharts
 *
 * Boost module
 *
 * (c) 2010-2025 Highsoft AS
 * Author: Torstein Honsi
 *
 * License: www.highcharts.com/license
 *
 * */
'use strict';
import Highcharts from '../../Core/Globals.js';
import Boost from '../../Extensions/Boost/Boost.js';
var G = Highcharts;
G.hasWebGLSupport = Boost.hasWebGLSupport;
Boost.compose(G.Chart, G.Axis, G.Series, G.seriesTypes, G.Point, G.Color);
export default Highcharts;
