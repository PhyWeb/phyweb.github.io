/**
 * Highstock JS v12.3.0 (2025-06-21)
 * @module highcharts/indicators/trendline
 * @requires highcharts
 * @requires highcharts/modules/stock
 *
 * Indicator series type for Highcharts Stock
 *
 * (c) 2010-2025 Sebastian Bochan
 *
 * License: www.highcharts.com/license
 */import*as e from"../highcharts.js";import"../modules/stock.js";var t={};t.n=e=>{var r=e&&e.__esModule?()=>e.default:()=>e;return t.d(r,{a:r}),r},t.d=(e,r)=>{for(var l in r)t.o(r,l)&&!t.o(e,l)&&Object.defineProperty(e,l,{enumerable:!0,get:r[l]})},t.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);let r=e.default;var l=t.n(r);t.d({},{});let s=e.default.SeriesRegistry;var a=t.n(s);let{sma:n}=a().seriesTypes,{extend:o,merge:i,isArray:p}=l();class d extends n{constructor(){super(...arguments),this.updateAllPoints=!0}getValues(e,t){let r=e.xData,l=e.yData,s=[],a=[],n=[],o=[],i=t.index,d=0,u=0,h=0,f=0,c=0;for(let e=0;e<r.length;e++)(0===e||r[e]!==r[e-1])&&c++,s.push(c);for(let e=0;e<s.length;e++)h+=s[e],f+=p(l[e])?l[e][i]:l[e];let g=h/s.length,m=f/l.length;for(let e=0;e<s.length;e++){let t=p(l[e])?l[e][i]:l[e];d+=(s[e]-g)*(t-m),u+=Math.pow(s[e]-g,2)}for(let e=0;e<s.length;e++){if(r[e]===n[n.length-1])continue;let t=r[e],l=m+d/u*(s[e]-g);a.push([t,l]),n.push(t),o.push(l)}return{xData:n,yData:o,values:a}}}d.defaultOptions=i(n.defaultOptions,{params:{period:void 0,index:3}}),o(d.prototype,{nameBase:"Trendline",nameComponents:void 0}),a().registerSeriesType("trendline",d);let u=l();export{u as default};