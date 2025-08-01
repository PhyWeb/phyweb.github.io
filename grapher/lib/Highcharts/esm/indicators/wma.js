/**
 * Highstock JS v12.3.0 (2025-06-21)
 * @module highcharts/indicators/wma
 * @requires highcharts
 * @requires highcharts/modules/stock
 *
 * Indicator series type for Highcharts Stock
 *
 * (c) 2010-2025 Kacper Madej
 *
 * License: www.highcharts.com/license
 */import*as e from"../highcharts.js";import"../modules/stock.js";var t={};t.n=e=>{var r=e&&e.__esModule?()=>e.default:()=>e;return t.d(r,{a:r}),r},t.d=(e,r)=>{for(var s in r)t.o(r,s)&&!t.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:r[s]})},t.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);let r=e.default;var s=t.n(r);t.d({},{});let a=e.default.SeriesRegistry;var u=t.n(a);let{sma:l}=u().seriesTypes,{isArray:n,merge:o}=s();function i(e,t,r,s,a){let u=t[s],l=a<0?r[s]:r[s][a];e.push([u,l])}function p(e,t,r,s){let a=e.length,u=e.reduce(function(e,t,r){return[null,e[1]+t[1]*(r+1)]})[1]/((a+1)/2*a),l=t[s-1];return e.shift(),[l,u]}class d extends l{getValues(e,t){let r=t.period,s=e.xData,a=e.yData,u=a?a.length:0,l=s[0],o=[],d=[],f=[],h=1,c=-1,m,g,y=a[0];if(s.length<r)return;n(a[0])&&(c=t.index,y=a[0][c]);let v=[[l,y]];for(;h!==r;)i(v,s,a,h,c),h++;for(m=h;m<u;m++)o.push(g=p(v,s,a,m)),d.push(g[0]),f.push(g[1]),i(v,s,a,m,c);return o.push(g=p(v,s,a,m)),d.push(g[0]),f.push(g[1]),{values:o,xData:d,yData:f}}}d.defaultOptions=o(l.defaultOptions,{params:{index:3,period:9}}),u().registerSeriesType("wma",d);let f=s();export{f as default};