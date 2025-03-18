!/**
 * Highstock JS v12.1.2 (2025-01-09)
 * @module highcharts/indicators/pivot-points
 * @requires highcharts
 * @requires highcharts/modules/stock
 *
 * Indicator series type for Highcharts Stock
 *
 * (c) 2010-2024 Paweł Fus
 *
 * License: www.highcharts.com/license
 */function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("highcharts"),require("highcharts").SeriesRegistry):"function"==typeof define&&define.amd?define("highcharts/indicators/pivot-points",[["highcharts/highcharts"],["highcharts/highcharts","SeriesRegistry"]],e):"object"==typeof exports?exports["highcharts/indicators/pivot-points"]=e(require("highcharts"),require("highcharts").SeriesRegistry):t.Highcharts=e(t.Highcharts,t.Highcharts.SeriesRegistry)}(this,function(t,e){return function(){"use strict";var o,n,r={512:function(t){t.exports=e},944:function(e){e.exports=t}},a={};function i(t){var e=a[t];if(void 0!==e)return e.exports;var o=a[t]={exports:{}};return r[t](o,o.exports,i),o.exports}i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,{a:e}),e},i.d=function(t,e){for(var o in e)i.o(e,o)&&!i.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)};var p={};i.d(p,{default:function(){return L}});var s=i(944),l=i.n(s),u=i(512),c=i.n(u),f=(o=function(t,e){return(o=Object.setPrototypeOf||({__proto__:[]})instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)e.hasOwnProperty(o)&&(t[o]=e[o])})(t,e)},function(t,e){function n(){this.constructor=t}o(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)});function h(t,e){var o,n=t.series.pointArrayMap,r=n.length;for(c().seriesTypes.sma.prototype.pointClass.prototype[e].call(t);r--;)t[o="dataLabel"+n[r]]&&t[o].element&&t[o].destroy(),t[o]=null}var y=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return f(e,t),e.prototype.destroyElements=function(){h(this,"destroyElements")},e.prototype.destroy=function(){h(this,"destroyElements")},e}(c().seriesTypes.sma.prototype.pointClass),d=(n=function(t,e){return(n=Object.setPrototypeOf||({__proto__:[]})instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw TypeError("Class extends value "+String(e)+" is not a constructor or null");function o(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(o.prototype=e.prototype,new o)}),g=c().seriesTypes.sma,v=l().merge,b=l().extend,m=l().defined,P=l().isArray,x=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return d(e,t),e.prototype.toYData=function(t){return[t.P]},e.prototype.translate=function(){var e=this;t.prototype.translate.apply(e),e.points.forEach(function(t){e.pointArrayMap.forEach(function(o){m(t[o])&&(t["plot"+o]=e.yAxis.toPixels(t[o],!0))})}),e.plotEndPoint=e.xAxis.toPixels(e.endPoint,!0)},e.prototype.getGraphPath=function(e){for(var o,n,r,a=this,i=[[],[],[],[],[],[],[],[],[]],p=a.pointArrayMap.length,s=a.plotEndPoint,l=[],u=e.length;u--;){for(r=0,n=e[u];r<p;r++)m(n[o=a.pointArrayMap[r]])&&i[r].push({plotX:n.plotX,plotY:n["plot"+o],isNull:!1},{plotX:s,plotY:n["plot"+o],isNull:!1},{plotX:s,plotY:null,isNull:!0});s=n.plotX}return i.forEach(function(e){l=l.concat(t.prototype.getGraphPath.call(a,e))}),l},e.prototype.drawDataLabels=function(){var e,o,n,r,a=this,i=a.pointArrayMap;a.options.dataLabels.enabled&&(o=a.points.length,i.concat([!1]).forEach(function(p,s){for(r=o;r--;)n=a.points[r],p?(n.y=n[p],n.pivotLine=p,n.plotY=n["plot"+p],e=n["dataLabel"+p],s&&(n["dataLabel"+i[s-1]]=n.dataLabel),n.dataLabels||(n.dataLabels=[]),n.dataLabels[0]=n.dataLabel=e=e&&e.element?e:null):n["dataLabel"+i[s-1]]=n.dataLabel;t.prototype.drawDataLabels.call(a)}))},e.prototype.getValues=function(t,e){var o,n,r,a,i,p,s,l=e.period,u=t.xData,c=t.yData,f=c?c.length:0,h=this[e.algorithm+"Placement"],y=[],d=[],g=[];if(!(u.length<l)&&P(c[0])&&4===c[0].length){for(s=l+1;s<=f+l;s+=l)r=u.slice(s-l-1,s),a=c.slice(s-l-1,s),n=r.length,o=r[n-1],p=h(this.getPivotAndHLC(a)),i=y.push([o].concat(p)),d.push(o),g.push(y[i-1].slice(1));return this.endPoint=r[0]+(o-r[0])/n*l,{values:y,xData:d,yData:g}}},e.prototype.getPivotAndHLC=function(t){var e=t[t.length-1][3],o=-1/0,n=1/0;return t.forEach(function(t){o=Math.max(o,t[1]),n=Math.min(n,t[2])}),[(o+n+e)/3,o,n,e]},e.prototype.standardPlacement=function(t){var e=t[1]-t[2];return[null,null,t[0]+e,2*t[0]-t[2],t[0],2*t[0]-t[1],t[0]-e,null,null]},e.prototype.camarillaPlacement=function(t){var e=t[1]-t[2];return[t[3]+1.5*e,t[3]+1.25*e,t[3]+1.1666*e,t[3]+1.0833*e,t[0],t[3]-1.0833*e,t[3]-1.1666*e,t[3]-1.25*e,t[3]-1.5*e]},e.prototype.fibonacciPlacement=function(t){var e=t[1]-t[2];return[null,t[0]+e,t[0]+.618*e,t[0]+.382*e,t[0],t[0]-.382*e,t[0]-.618*e,t[0]-e,null]},e.defaultOptions=v(g.defaultOptions,{params:{index:void 0,period:28,algorithm:"standard"},marker:{enabled:!1},enableMouseTracking:!1,dataLabels:{enabled:!0,format:"{point.pivotLine}"},dataGrouping:{approximation:"averages"}}),e}(g);b(x.prototype,{nameBase:"Pivot Points",pointArrayMap:["R4","R3","R2","R1","P","S1","S2","S3","S4"],pointValKey:"P",pointClass:y}),c().registerSeriesType("pivotpoints",x);var L=l();return p.default}()});