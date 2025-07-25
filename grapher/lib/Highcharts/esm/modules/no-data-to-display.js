/**
 * Highcharts JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/no-data-to-display
 * @requires highcharts
 *
 * Plugin for displaying a message when there is no data visible in chart.
 *
 * (c) 2010-2025 Highsoft AS
 * Author: Oystein Moseng
 *
 * License: www.highcharts.com/license
 */import*as t from"../highcharts.js";var a={};a.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return a.d(e,{a:e}),e},a.d=(t,e)=>{for(var o in e)a.o(e,o)&&!a.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},a.o=(t,a)=>Object.prototype.hasOwnProperty.call(t,a);let e=t.default;var o=a.n(e);let n=t.default.AST;var i=a.n(n);let s={lang:{noData:"No data to display"},noData:{attr:{zIndex:1},position:{x:0,y:0,align:"center",verticalAlign:"middle"},style:{fontWeight:"bold",fontSize:"0.8em",color:"#666666"}}},{addEvent:r,extend:l,merge:d}=o();function h(){let t=this.series||[],a=t.length;for(;a--;)if(t[a].hasData()&&!t[a].options.isInternal)return!0;return this.loadingShown}function D(){this.noDataLabel&&(this.noDataLabel=this.noDataLabel.destroy())}function f(t){let a=this.options,e=t||a&&a.lang.noData||"",o=a&&(a.noData||{});this.renderer&&(this.noDataLabel||(this.noDataLabel=this.renderer.label(e,0,0,void 0,void 0,void 0,o.useHTML,void 0,"no-data").add()),this.styledMode||this.noDataLabel.attr(i().filterUserAttributes(o.attr||{})).css(o.style||{}),this.noDataLabel.align(l(this.noDataLabel.getBBox(),o.position||{}),!1,"plotBox"))}function p(){this.hasData()?this.hideNoData():this.showNoData()}let c=o();({compose:function(t,a){let e=t.prototype;e.showNoData||(e.hasData=h,e.hideNoData=D,e.showNoData=f,r(t,"render",p),d(!0,a,s))}}).compose(c.Chart,c.defaultOptions);let u=o();export{u as default};