/**
 * Highcharts Gantt JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/static-scale
 * @requires highcharts
 *
 * StaticScale
 *
 * (c) 2016-2025 Torstein Honsi, Lars A. V. Cabrera
 *
 * License: www.highcharts.com/license
 */import*as t from"../highcharts.js";var e={};e.n=t=>{var i=t&&t.__esModule?()=>t.default:()=>t;return e.d(i,{a:i}),i},e.d=(t,i)=>{for(var a in i)e.o(i,a)&&!e.o(t,a)&&Object.defineProperty(t,a,{enumerable:!0,get:i[a]})},e.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e);let i=t.default;var a=e.n(i);let{addEvent:r,defined:s,isNumber:o,pick:l}=a();function h(){let t=this.chart.options.chart;!this.horiz&&o(this.options.staticScale)&&(!t.height||t.scrollablePlotArea&&t.scrollablePlotArea.minHeight)&&(this.staticScale=this.options.staticScale)}function n(){if("adjustHeight"!==this.redrawTrigger){for(let t of this.axes||[]){let e=t.chart,i=!!e.initiatedScale&&e.options.animation,a=t.options.staticScale;if(t.staticScale&&s(t.min)){let r=l(t.brokenAxis&&t.brokenAxis.unitLength,t.max+t.tickInterval-t.min)*a,s=(r=Math.max(r,a))-e.plotHeight;!e.scrollablePixelsY&&Math.abs(s)>=1&&(e.plotHeight=r,e.redrawTrigger="adjustHeight",e.setSize(void 0,e.chartHeight+s,i)),t.series.forEach(function(t){let i=t.sharedClipKey&&e.sharedClips[t.sharedClipKey];i&&i.attr(e.inverted?{width:e.plotHeight}:{height:e.plotHeight})})}}this.initiatedScale=!0}this.redrawTrigger=null}let c=a();({compose:function(t,e){let i=e.prototype;i.adjustHeight||(r(t,"afterSetOptions",h),i.adjustHeight=n,r(e,"render",i.adjustHeight))}}).compose(c.Axis,c.Chart);let d=a();export{d as default};