/**
 * Highcharts JS v12.3.0 (2025-06-21)
 * @module highcharts/themes/grid-light
 * @requires highcharts
 *
 * (c) 2009-2025 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */import*as e from"../highcharts.js";var t,o,l={};l.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return l.d(t,{a:t}),t},l.d=(e,t)=>{for(var o in t)l.o(t,o)&&!l.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},l.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);let a=e.default;var s=l.n(a);let{setOptions:r}=s(),{createElement:i}=s();(t=o||(o={})).options={colors:["#7cb5ec","#f7a35c","#90ee7e","#7798BF","#aaeeee","#ff0066","#eeaaee","#55BF3B","#DF5353","#7798BF","#aaeeee"],chart:{backgroundColor:null,style:{fontFamily:"Dosis, sans-serif"}},title:{style:{fontSize:"16px",fontWeight:"bold",textTransform:"uppercase"}},tooltip:{borderWidth:0,backgroundColor:"rgba(219,219,216,0.8)",shadow:!1},legend:{backgroundColor:"#F0F0EA",itemStyle:{fontWeight:"bold",fontSize:"13px"}},xAxis:{gridLineWidth:1,labels:{style:{fontSize:"12px"}}},yAxis:{minorTickInterval:"auto",title:{style:{textTransform:"uppercase"}},labels:{style:{fontSize:"12px"}}},plotOptions:{candlestick:{lineColor:"#404048"}}},t.apply=function(){i("link",{href:"https://fonts.googleapis.com/css?family=Dosis:400,600",rel:"stylesheet",type:"text/css"},null,document.getElementsByTagName("head")[0]),r(t.options)};let n=o;s().theme=n.options,n.apply();let p=s();export{p as default};