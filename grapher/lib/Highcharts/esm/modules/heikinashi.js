/**
 * Highstock JS v12.3.0 (2025-06-21)
 * @module highcharts/modules/heikinashi
 * @requires highcharts
 * @requires highcharts/modules/stock
 *
 * HeikinAshi series type for Highcharts Stock
 *
 * (c) 2010-2025 Karol Kolodziej
 *
 * License: www.highcharts.com/license
 */import*as t from"../highcharts.js";import"./stock.js";var i={};i.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return i.d(e,{a:e}),e},i.d=(t,e)=>{for(var a in e)i.o(e,a)&&!i.o(t,a)&&Object.defineProperty(t,a,{enumerable:!0,get:e[a]})},i.o=(t,i)=>Object.prototype.hasOwnProperty.call(t,i);let e=t.default;var a=i.n(e);i.d({},{});let s=t.default.SeriesRegistry;var h=i.n(s);let{candlestick:{prototype:{pointClass:o}},hlc:{prototype:{pointClass:r}}}=h().seriesTypes,{composed:n}=a(),{candlestick:l}=h().seriesTypes,{addEvent:p,merge:c,pushUnique:d}=a();function u(){this.series.forEach(t=>{t.is("heikinashi")&&(t.heikiashiData.length=0,t.getHeikinashiData())})}function f(){let t=this.points,i=this.heikiashiData,e=this.cropStart||0;for(let a=0;a<t.length;a++){let s=t[a],h=i[a+e];s.open=h[0],s.high=h[1],s.low=h[2],s.close=h[3]}}function k(){this.heikiashiData.length&&(this.heikiashiData.length=0)}class y extends l{constructor(){super(...arguments),this.heikiashiData=[]}static compose(t,i){l.compose(t),d(n,"HeikinAshi")&&(p(i,"postProcessData",u),p(y,"afterTranslate",f),p(y,"updatedData",k))}getHeikinashiData(){let t=this.allGroupedTable||this.dataTable,i=t.rowCount,e=this.heikiashiData;if(!e.length&&i){this.modifyFirstPointValue(t.getRow(0,this.pointArrayMap));for(let a=1;a<i;a++)this.modifyDataPoint(t.getRow(a,this.pointArrayMap),e[a-1])}this.heikiashiData=e}init(){super.init.apply(this,arguments),this.heikiashiData=[]}modifyFirstPointValue(t){let i=(t[0]+t[1]+t[2]+t[3])/4,e=(t[0]+t[3])/2;this.heikiashiData.push([i,t[1],t[2],e])}modifyDataPoint(t,i){let e=(i[0]+i[3])/2,a=(t[0]+t[1]+t[2]+t[3])/4,s=Math.max(t[1],a,e),h=Math.min(t[2],a,e);this.heikiashiData.push([e,s,h,a])}}y.defaultOptions=c(l.defaultOptions,{dataGrouping:{groupAll:!0}}),y.prototype.pointClass=class extends o{},h().registerSeriesType("heikinashi",y);let g=a();y.compose(g.Series,g.Axis);let D=a();export{D as default};