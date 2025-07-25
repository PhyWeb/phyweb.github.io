/**
 * Highcharts JS v12.3.0 (2025-06-21)
 * @module highcharts/themes/sunset
 * @requires highcharts
 *
 * (c) 2009-2025 Highsoft AS
 *
 * License: www.highcharts.com/license
 */import*as o from"../highcharts.js";var e,r,t={};t.n=o=>{var e=o&&o.__esModule?()=>o.default:()=>o;return t.d(e,{a:e}),e},t.d=(o,e)=>{for(var r in e)t.o(e,r)&&!t.o(o,r)&&Object.defineProperty(o,r,{enumerable:!0,get:e[r]})},t.o=(o,e)=>Object.prototype.hasOwnProperty.call(o,e);let l=o.default;var a=t.n(l);let{setOptions:n}=a();(e=r||(r={})).options={colors:["#FDD089","#FF7F79","#A0446E","#251535"],colorAxis:{maxColor:"#60042E",minColor:"#FDD089"},plotOptions:{map:{nullColor:"#fefefc"}},navigator:{series:{color:"#FF7F79",lineColor:"#A0446E"}}},e.apply=function(){n(e.options)};let s=r;a().theme=s.options,s.apply();let p=a();export{p as default};