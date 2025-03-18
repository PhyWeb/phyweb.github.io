!/**
 * Highstock JS v12.1.2 (2025-01-09)
 * @module highcharts/modules/pointandfigure
 * @requires highcharts
 * @requires highcharts/modules/stock
 *
 * Point and figure series type for Highcharts Stock
 *
 * (c) 2010-2024 Kamil Musialowski
 *
 * License: www.highcharts.com/license
 */function(t,r){"object"==typeof exports&&"object"==typeof module?module.exports=r(require("highcharts"),require("highcharts").SeriesRegistry,require("highcharts").RendererRegistry):"function"==typeof define&&define.amd?define("highcharts/modules/pointandfigure",[["highcharts/highcharts"],["highcharts/highcharts","SeriesRegistry"],["highcharts/highcharts","RendererRegistry"]],r):"object"==typeof exports?exports["highcharts/modules/pointandfigure"]=r(require("highcharts"),require("highcharts").SeriesRegistry,require("highcharts").RendererRegistry):t.Highcharts=r(t.Highcharts,t.Highcharts.SeriesRegistry,t.Highcharts.RendererRegistry)}(this,function(t,r,e){return function(){"use strict";var o,n,i,s={608:function(t){t.exports=e},512:function(t){t.exports=r},944:function(r){r.exports=t}},a={};function p(t){var r=a[t];if(void 0!==r)return r.exports;var e=a[t]={exports:{}};return s[t](e,e.exports,p),e.exports}p.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return p.d(r,{a:r}),r},p.d=function(t,r){for(var e in r)p.o(r,e)&&!p.o(t,e)&&Object.defineProperty(t,e,{enumerable:!0,get:r[e]})},p.o=function(t,r){return Object.prototype.hasOwnProperty.call(t,r)};var h={};p.d(h,{default:function(){return j}});var u=p(944),c=p.n(u),l=p(512),f=p.n(l),d=(o=function(t,r){return(o=Object.setPrototypeOf||({__proto__:[]})instanceof Array&&function(t,r){t.__proto__=r}||function(t,r){for(var e in r)r.hasOwnProperty(e)&&(t[e]=r[e])})(t,r)},function(t,r){function e(){this.constructor=t}o(t,r),t.prototype=null===r?Object.create(r):(e.prototype=r.prototype,new e)}),y=function(t){function r(){return null!==t&&t.apply(this,arguments)||this}return d(r,t),r.prototype.resolveMarker=function(){var t=this.series.options;this.marker=this.options.marker=this.upTrend?t.markerUp:t.marker,this.color=this.options.marker.lineColor},r.prototype.resolveColor=function(){t.prototype.resolveColor.call(this),this.resolveMarker()},r.prototype.getClassName=function(){return t.prototype.getClassName.call(this)+(this.upTrend?" highcharts-point-up":" highcharts-point-down")},r}(f().seriesTypes.scatter.prototype.pointClass),g={boxSize:"1%",reversalAmount:3,tooltip:{pointFormat:'<span style="color:{point.color}">●</span> <b> {series.name}</b><br/>Close: {point.y:.2f}<br/>',headerFormat:""},turboThreshold:0,groupPadding:.2,pointPadding:.1,pointRange:null,dataGrouping:{enabled:!1},markerUp:{symbol:"cross",lineColor:"#00FF00",lineWidth:2},marker:{symbol:"circle",fillColor:"transparent",lineColor:"#FF0000",lineWidth:2},legendSymbol:"lineMarker"},m=p(608),v=p.n(m);!function(t){var r=[];function e(t,r,e,o){return[["M",t,r],["L",t+e,r+o],["M",t+e,r],["L",t,r+o],["Z"]]}t.compose=function(t){-1===r.indexOf(t)&&(r.push(t),t.prototype.symbols.cross=e);var o=v().getRendererType();r.indexOf(o)&&r.push(o)}}(i||(i={}));var x=i,b=(n=function(t,r){return(n=Object.setPrototypeOf||({__proto__:[]})instanceof Array&&function(t,r){t.__proto__=r}||function(t,r){for(var e in r)Object.prototype.hasOwnProperty.call(r,e)&&(t[e]=r[e])})(t,r)},function(t,r){if("function"!=typeof r&&null!==r)throw TypeError("Class extends value "+String(r)+" is not a constructor or null");function e(){this.constructor=t}n(t,r),t.prototype=null===r?Object.create(r):(e.prototype=r.prototype,new e)}),C=c().composed,k=f().seriesTypes,_=k.scatter,O=k.column.prototype,R=c().extend,T=c().merge,P=c().pushUnique,M=c().isNumber,S=c().relativeLength,w=function(t){function r(){var r=null!==t&&t.apply(this,arguments)||this;return r.allowDG=!1,r}return b(r,t),r.compose=function(t){P(C,"pointandfigure")&&x.compose(t)},r.prototype.init=function(){t.prototype.init.apply(this,arguments),this.pnfDataGroups=[]},r.prototype.getProcessedData=function(){if(!this.pnfDataGroups)return{modified:this.dataTable.modified,cropped:!1,cropStart:0,closestPointRange:1};var t,r=this.dataTable.modified,e=this.options,o=this.getColumn("x",!0),n=this.getColumn("y",!0),i=e.boxSize,s=M(i)?i:S(i,n[0]),a=this.pnfDataGroups,p=s*e.reversalAmount;function h(t,r,e){for(var o=a[a.length-1],n=r?1:-1,i=Math.floor(n*(t-e)/s),p=1;p<=i;p++){var h=e+s*p*n;o.y.push(h)}}if(this.calculatedBoxSize=s,this.isDirtyData||0===a.length){this.pnfDataGroups.length=0;for(var u=0;u<n.length;u++){var c=o[u],l=n[u],f=n[0];if(l-f>=s){t=!0,a.push({x:c,y:[l],upTrend:t});break}if(f-l>=s){t=!1,a.push({x:c,y:[l],upTrend:t});break}}n.forEach(function(r,e){var n,i=o[e],u=(n=a[a.length-1].y)[n.length-1];t&&(r-u>=s&&h(r,t,u),u-r>=p&&(t=!1,a.push({x:i,y:[],upTrend:t}),h(r,t,u))),!t&&(u-r>=s&&h(r,t,u),r-u>=p&&(t=!0,a.push({x:i,y:[],upTrend:t}),h(r,t,u)))})}var d=[],y=[],g=[];return a.forEach(function(t){var r=t.x,e=t.upTrend;t.y.forEach(function(t){y.push(r),g.push(t),d.push({x:r,y:t,upTrend:e})})}),r.setColumn("x",y),r.setColumn("y",g),this.pnfDataGroups=a,this.processedData=d,{modified:r,cropped:!1,cropStart:0,closestPointRange:1}},r.prototype.markerAttribs=function(t){var r=this.options,e={},o=t.pos();return e.width=this.markerWidth,e.height=this.markerHeight,o&&e.width&&e.height&&(e.x=o[0]-Math.round(e.width)/2,e.y=o[1]-Math.round(e.height)/2),r.crisp&&e.x&&(e.x=Math.floor(e.x)),e},r.prototype.translate=function(){var r=this.getColumnMetrics(),e=this.calculatedBoxSize;this.markerWidth=r.width+r.paddedWidth+r.offset,this.markerHeight=this.yAxis.toPixels(0)-this.yAxis.toPixels(e),t.prototype.translate.call(this)},r.defaultOptions=T(_.defaultOptions,g),r}(_);R(w.prototype,{takeOrdinalPosition:!0,pnfDataGroups:[],getColumnMetrics:O.getColumnMetrics,pointClass:y,sorted:!0}),f().registerSeriesType("pointandfigure",w);var D=c();w.compose(D.Renderer);var j=c();return h.default}()});