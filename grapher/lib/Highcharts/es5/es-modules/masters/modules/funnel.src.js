/**
 * @license Highcharts JS v@product.version@ (@product.date@)
 * @module highcharts/modules/funnel
 * @requires highcharts
 *
 * Highcharts funnel module
 *
 * (c) 2010-2025 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
'use strict';
import Highcharts from '../../Core/Globals.js';
import FunnelSeries from '../../Series/Funnel/FunnelSeries.js';
import '../../Series/Pyramid/PyramidSeries.js';
var G = Highcharts;
FunnelSeries.compose(G.Chart);
export default Highcharts;
