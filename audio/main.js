import FOURIER from "./modules/fourier.js"
import {PhyAudio, convertFloat32ToInt16} from "./modules/audio.js"

import {Common, alertModal, TabManager, downloadFile, exportToCSV, exportToRW3, Serie} from "../common/common.js"

const $ = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', () => {

// Common
let common = new Common("Audio");

// SimpleMode enabled?
let simpleMode = false;

// Declare vars
let rtWaveData;
let recWaveData;

let rtFourierData;
let recFourierData;

const rtBasebufferSize = 4096;
const rtLength = 0.04;
const chunkLength = 0.1;

// True if the rt graph needs to be fully drawn
let rtInitialDraw = true;

// Create fourier, PhyAudio and fileReader objects
let fourier = new FOURIER(rtBasebufferSize);
let audio = new PhyAudio(rtBasebufferSize);
let fileReader = new FileReader();

// Get the default max sample rate from the audio context
let baseSampleRate;

// RTS vars
let paused = false;

// Record vars
let sampleLength = parseFloat($("#sample-length-input").value);
let recSampleRate; // The sample will be recorded with this sampleRate
let recordedSampleRate; // The sample was recorded with this sampleRate

let samplingStartTime;

let onAudioDecodeEndedBuffer;

// Save vars
let saves = [];

/*----------------------------------------------------------------------------------------------
----------------------------------------------TABS----------------------------------------------
----------------------------------------------------------------------------------------------*/
let tabManager = new TabManager($("#save-tabs"));

tabManager.newTab({
  tabButton: $("#rt-tab-button"),
  tab: $("#rt-panel"),
  isActive : true,
  clickCB: ()=>{
	  audio.startAudio("RT");
    rtWaveChart.reflow();
    rtFourierChart.reflow();
  }
});
tabManager.newTab({
  tabButton: $("#rec-tab-button"),
  tab: $("#rec-panel"),
  clickCB: ()=>{
	  audio.startAudio("REC");
  }
});

// rec tabs
$("#mic-tab-button").addEventListener("click",()=>{
  $("#mic-tab-button").classList.add("is-active");
  $("#file-tab-button").classList.remove("is-active");
  $("#mic-panel").classList.remove("is-hidden");
  $("#file-panel").classList.add("is-hidden");
})
$("#file-tab-button").addEventListener("click",()=>{
  $("#file-tab-button").classList.add("is-active");
  $("#mic-tab-button").classList.remove("is-active");
  $("#mic-panel").classList.add("is-hidden");
  $("#file-panel").classList.remove("is-hidden");
})

// save fourier tabs
$("#regular-fourier-button").addEventListener("click",()=>{
  $("#regular-fourier-button").classList.add("is-active");
  $("#temporal-fourier-button").classList.remove("is-active");
})
$("#temporal-fourier-button").addEventListener("click",()=>{
  $("#regular-fourier-button").classList.remove("is-active");
  $("#temporal-fourier-button").classList.add("is-active");
})

/*----------------------------------------------------------------------------------------------
---------------------------------------------NAVBAR---------------------------------------------
----------------------------------------------------------------------------------------------*/
let quitConfirm = (_path)=>{
	// Check if there's at least 1 saved tab
  if(tabManager.tabs.length === 2){
    window.location.replace(_path);
    return;
  }
	
	alertModal({
	  type: "warning",
	  title: "Quitter l'application",
	  body: `<p>Etes-vous sûr de vouloir quitter l'application. Les données seront perdues.</p>`,
	  confirm:{
      label: "Quitter",
      type:"warning",
      cb: ()=>{window.location.replace(_path);}
	  },
	  cancel: "Annuler",
	  width: "42rem"
	})
}
  
$("#navbar-home-button").addEventListener("click", () => {
  quitConfirm("../index.html");
});
$("#navbar-tracker-button").addEventListener("click", () => {
  quitConfirm("../tracker/index.html");
});
$("#navbar-grapher-button").addEventListener("click", () => {
  quitConfirm("../grapher/index.html");
});

/*----------------------------------------------------------------------------------------------
------------------------------------------CONFIG MODAL------------------------------------------
----------------------------------------------------------------------------------------------*/
$("#choose-config-modal").classList.add("is-active");
$("#simple-mode-button").addEventListener("click", async ()=>{
  await audioInit()
	common.modalManager.closeAllModals();

	simpleMode = true;

	// Hide fourier graph cards
	$("#rt-fourier-container").style.display = "none";
	$("#rec-fourier-container").style.display = "none";
	$("#sav-fourier-container").style.display = "none";
	$("#sav-temporal-fourier-container").style.display = "none";

	// Hide save furier settings
	$("#fourier-settings-panel").style.display = "none";

	// Resize wave charts to full height
	$("#rt-graph-container").style.height = "calc(100vh - 130px)";
	$("#rec-graph-container").style.height = "calc(100vh - 130px)";
	$("#sav-graph-container").style.height = "calc(100vh - 130px)";

  //remove unnecassary margin
  $("#rt-graph-container").style.marginBottom = "0px";
  $("#rec-graph-container").style.marginBottom = "0px";
  $("#sav-graph-container").style.marginBottom = "0px";

  // Reflow charts
	rtWaveChart.reflow();

  draw();
});

$("#complete-mode-button").addEventListener("click", async ()=>{
	await audioInit()
	common.modalManager.closeAllModals();

  simpleMode = false;

  // Reflow charts
	rtWaveChart.reflow();

  paused = false;

  draw();
});

async function audioInit(){
	await audio.startAudio("RT");
  baseSampleRate = audio.getSampleRate();
  recSampleRate = baseSampleRate; // The sample will be recorded with this sampleRate

  populateSampleRateSelect($("#rec-samplerate-select"), 1, 16);
}

/*----------------------------------------------------------------------------------------------
--------------------------------------------RT LOGIC--------------------------------------------
----------------------------------------------------------------------------------------------*/
$("#amplification-slider").addEventListener("input", onRtAmplificationSliderChange);
$("#amplification-slider").addEventListener("dblclick", onRtAmplificationSliderDblClick);
$("#amplification-label").addEventListener("dblclick", onRtAmplificationSliderDblClick);
function onRtAmplificationSliderChange() {
	audio.setGain($("#amplification-slider").value);
	$("#amplification-label").innerHTML = "x " + audio.gain;
}

function onRtAmplificationSliderDblClick() {
	$("#amplification-slider").value = 1;
	onRtAmplificationSliderChange();
}

//pause button
$("#pause-button").addEventListener("click", ()=>{
  if(paused == true){
		paused = false;
		$("#pause-button").classList.remove("is-warning");
		// Hide the record button
		$("#rt-save-to-tab-button").parentNode.classList.add("is-hidden");
	}
	else{
		paused = true;
		$("#pause-button").classList.add("is-warning");
		// Show the record button
		$("#rt-save-to-tab-button").parentNode.classList.remove("is-hidden");
	}
});

// rt save button
$("#rt-save-to-tab-button").addEventListener("click", ()=>{
	// Display save modal
	$("#save-modal").classList.add("is-active");

	// Focus the input
	$("#save-name-input").focus();
})

// rt save button
$("#rec-save-to-tab-button").addEventListener("click", ()=>{
	// Display save modal
	$("#save-modal").classList.add("is-active");

	// Focus the input
	$("#save-name-input").focus();
})

/*----------------------------------------------------------------------------------------------
-----------------------------------------SAVE A NEW TAB-----------------------------------------
----------------------------------------------------------------------------------------------*/
// keyboard shortcut
$("#save-name-input").addEventListener("keyup", (event)=> {
	if (event.key === "Enter") {
		event.preventDefault();
		$("#confirm-save-button").click();
	}
});

$("#confirm-save-button").addEventListener("click", ()=>{
	// Get the save name
	let text;
	if($("#save-name-input").value == ""){
		text = "Enreg";
	}
	else{
		text = $("#save-name-input").value;
	}

	if(tabManager.activeTab == 0){
		saves.push({
			name: text,
			linearData: rtWaveData,
			fLinearData: rtFourierData,
			fTemporalData: [],
			recordedSampleRateLvl: 1,
			displaySampleRateLvl: 1,
			range: {xRange: [undefined, undefined], yRange: [undefined, undefined]},
			fourierRange: {xRange: [undefined, undefined], yRange: [undefined, undefined]},
			fourierType: 0
		});
	}
	else{
		saves.push({
			name: text,
			linearData: recWaveData,
			fLinearData: recFourierData,
			fTemporalData: [],
			recordedSampleRateLvl: baseSampleRate / recordedSampleRate,
			displaySampleRateLvl: baseSampleRate / recordedSampleRate,
			range: {xRange: [undefined, undefined], yRange: [undefined, undefined]},
			fourierRange: {xRange: [undefined, undefined], yRange: [undefined, undefined]},
			fourierType: 0
		});
	}
	// add the tab
	tabManager.newTab({
    tab: $("#save-panel"),
    name: text,
    clickCB: saveDraw,
    deleteCB: onCloseTabButton
  })

  function onCloseTabButton(_id){
		// Delete tab datas
		saves.splice(_id - 2,1);
  }

	// Empty the input and hide the modal card
	$("#save-name-input").value = "";
	common.modalManager.closeAllModals();
})

/*----------------------------------------------------------------------------------------------
----------------------------------------REC SAMPLE LOGIC----------------------------------------
----------------------------------------------------------------------------------------------*/
$("#sample-button").addEventListener("click",()=>{
	// SampleLength value verifications
	if($("#sample-length-input").value === ""){
    alertModal({
      type: "warning",
      title: "Durée non valide",
      body: "La durée d'enregistrement n'est pas un nombre valide.",
      confirm: "OK"
    })
		return;
	}
	if($("#sample-length-input").value < 0.01){
    alertModal({
      type: "warning",
      title: "Durée insuffisante",
      body: "La durée d'enregistrement minimale est de 0,01 s.",
      confirm: "OK"
    })
		return;
	}
	if($("#sample-length-input").value > 60){
    alertModal({
      type: "warning",
      title: "Durée trop importante",
      body: "La durée d'enregistrement maximale est de 60 s.",
      confirm: "OK"
    })
		return;
	}
	// Get the sampleLength
	sampleLength = parseFloat($("#sample-length-input").value);

  // Save the sampleRate used
	recordedSampleRate = recSampleRate;

	// Record new datas
	audio.startRecording(sampleLength);

	// Hide the playback controls
	$("#sample-panel").classList.add("is-hidden");

	// Save the sampling start time
	samplingStartTime = Date.now();

	// Display the progress bar
  $("#sample-length-input").classList.add("is-hidden");
	$("#sample-progress-bar").classList.remove("is-hidden");
  $("#sample-button").classList.add("is-hidden");
	$("#stop-sample-button").classList.remove("is-hidden");
});

$("#stop-sample-button").addEventListener("click",()=>{
  audio.stopRecording();
});

/*----------------------------------------------------------------------------------------------
------------------------------------REC & SAVE PLAY AND STOP------------------------------------
----------------------------------------------------------------------------------------------*/
$("#rec-play-button").addEventListener("click", ()=>{
  $("#rec-play-button").classList.add("is-hidden");
  $("#rec-stop-button").classList.remove("is-hidden");

  let onRecPlaybackEnded = ()=>{
    $("#rec-play-button").classList.remove("is-hidden");
    $("#rec-stop-button").classList.add("is-hidden");
  }
  audioPlayback(recWaveData.getData(baseSampleRate / recordedSampleRate), recordedSampleRate, onRecPlaybackEnded);
});

$("#rec-stop-button").addEventListener("click", ()=>{
  audio.stop();
});

$("#sav-play-button").addEventListener("click", ()=>{
  $("#sav-play-button").classList.add("is-hidden");
  $("#sav-stop-button").classList.remove("is-hidden");

  let onSavPlaybackEnded = ()=>{
    $("#sav-play-button").classList.remove("is-hidden");
    $("#sav-stop-button").classList.add("is-hidden");
  }
	// Prepare the datas if the samplerate is not default
	let sr = baseSampleRate / saves[tabManager.activeTab-2].displaySampleRateLvl;
	audioPlayback(saves[tabManager.activeTab-2].linearData.getData(saves[tabManager.activeTab-2].displaySampleRateLvl), sr, onSavPlaybackEnded);
});

$("#sav-stop-button").addEventListener("click", ()=>{
  audio.stop();
});

/*----------------------------------------------------------------------------------------------
-------------------------------------------SAMPLERATE-------------------------------------------
----------------------------------------------------------------------------------------------*/

$("#rec-samplerate-select").addEventListener("change", ()=>{
  recSampleRate = $("#rec-samplerate-select").value;
});

// save samplerate
$("#save-samplerate-select").addEventListener("click", ()=>{
	saves[tabManager.activeTab-2].displaySampleRateLvl = baseSampleRate / $("#save-samplerate-select").value;
	saveDraw();
});

function populateSampleRateSelect(_select, _initLvl = 1, _l = 4){
	// Remove all previous options
	while (_select.firstChild) {
    _select.removeChild(_select.firstChild);
	}
	// Populate sampleRate selects based on baseSampleRate
	for (let i = _initLvl; i <= _l; i = i * 2) {
		let option = document.createElement("option");
		option.value = baseSampleRate / i;
		option.text = (baseSampleRate / i).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Hz";
		_select.add(option);
	}
}

/*----------------------------------------------------------------------------------------------
-------------------------------------------FILE LOAD--------------------------------------------
----------------------------------------------------------------------------------------------*/
$("#file-input").addEventListener("change",(event)=>{
	// Read the file
	fileReader.readAsArrayBuffer($("#file-input").files[0]);
	// Hide the playback controls
	$("#sample-panel").classList.add("is-hidden");
	// Hide the fileInput button
	$("#file-label").classList.add("is-hidden");
	// Display the decoding label
	$("#file-progress-bar").classList.remove("is-hidden");
});

fileReader.addEventListener("loadend", ()=>{
  //clear the input
  $("#file-input").value = "";
	// Decode the audio in the file
	audio.decode(fileReader.result, onAudioDecodeEnd);
});

function onAudioDecodeEnd(_rawData){

	$("#file-label").classList.remove("is-hidden");
	$("#file-progress-bar").classList.add("is-hidden");

	let length = _rawData.duration * baseSampleRate;
	if(_rawData.duration > 30){
    // open the resize modal and reset the slider
    $("#file-slider").noUiSlider.reset();
    $("#file-slider").noUiSlider.updateOptions({
      range:{
        'min': 0,
        'max': _rawData.duration
      }
    });
    
    $("#file-length-modal").classList.add("is-active");

    // save the data in a buffer
    onAudioDecodeEndedBuffer = _rawData;
	} else {
    drawDecodedAudio(_rawData, length);
  }
}

// file modal confirm
$("#open-resized-file").addEventListener("click",()=>{
  let length = parseInt(($("#file-slider").noUiSlider.get(true)[1] - $("#file-slider").noUiSlider.get(true)[0]) * baseSampleRate);
  let start = parseInt($("#file-slider").noUiSlider.get(true)[0] * baseSampleRate);

  drawDecodedAudio(onAudioDecodeEndedBuffer, length, start);

  $("#file-length-modal").classList.remove("is-active");
});

// file slider
noUiSlider.create($("#file-slider"), {
  start: [0, 10],
  connect: true,
  range: {
      'min': 0,
      'max': 1
  },
  margin: 0.05,
  limit: 60,
  behaviour: 'tap-drag',
  tooltips: false,
  pips: {
    mode: 'steps',
    stepped: true,
    density: 4
	}
});
$("#file-slider").noUiSlider.on('update', function (values, handle) {
  let value = values[handle];

  if (handle) {
    $("#end-length-input").value = value;
  } else {
    $("#start-length-input").value = value;
  }
});
$("#start-length-input").addEventListener('change', function () {
  $("#file-slider").noUiSlider.set([this.value, null]);
});
$("#end-length-input").addEventListener('change', function () {
  $("#file-slider").noUiSlider.set([null, this.value]);
});


let drawDecodedAudio = (_rawData, _length, _start = 0)=>{
  // Save the sampleRate used DUMMY
  recordedSampleRate = baseSampleRate;

  // Draw the datas
  recordGraphDraw(convertFloat32ToInt16(_rawData.getChannelData(0), _length, _start), baseSampleRate);
}

/*----------------------------------------------------------------------------------------------
--------------------------------------------DOWNLOAD--------------------------------------------
----------------------------------------------------------------------------------------------*/
// SLIDER
noUiSlider.create($("#data-slider"), {
	start: [0, 10],
	connect: true,
	range: {
	  'min': 0,
	  'max': 10
	},
	margin: 0.001,
	behaviour: 'tap-drag',
	tooltips: false,
	pips: {
	  mode: 'steps',
	  stepped: true,
	  density: 4
    // TODO doesnt work for small durations
	},
  format:{
    to: function(value){
      return value.toFixed(3);
    },
    from: function(value){
      return value;
    }
  }
});

$("#data-slider").noUiSlider.on('update', function (values, handle) {
  let value = values[handle];

  if (handle) {
    $("#end-size-input").value = value;
  } else {
    $("#start-size-input").value = value;
  }
});

$("#start-size-input").addEventListener('change', function () {
  $("#data-slider").noUiSlider.set([this.value, null]);
});
$("#end-size-input").addEventListener('change', function () {
  $("#data-slider").noUiSlider.set([null, this.value]);
});

// Download button
$("#download-button").addEventListener("click", ()=>{

  // Slider reset
  $("#data-slider").noUiSlider.updateOptions({
    range:{
      'min': 0,
      'max': saves[tabManager.activeTab-2].linearData.getDuration()
    }
  });
  $("#data-slider").noUiSlider.reset();

	// Display save modal
	$("#download-modal").classList.add("is-active");
	// Focus the input
	$("#file-name-input").focus();
})

// Data part selection
$("#all-data-button").addEventListener("click", ()=>{
	$("#all-data-button").classList.add('is-link');
	$("#on-screen-button").classList.remove('is-link');
	$("#part-button").classList.remove('is-link');
	$("#data-size-panel").classList.add('is-hidden');
});
$("#on-screen-button").addEventListener("click", ()=>{
	$("#on-screen-button").classList.add('is-link');
	$("#part-button").classList.remove('is-link');
	$("#all-data-button").classList.remove('is-link');
	$("#data-size-panel").classList.add('is-hidden');
});
  $("#part-button").addEventListener("click", ()=>{
	$("#part-button").classList.add('is-link');
	$("#on-screen-button").classList.remove('is-link');
	$("#all-data-button").classList.remove('is-link');
	$("#data-size-panel").classList.remove('is-hidden');
});

// Format selection
$("#wav-button").addEventListener("click", ()=>{
  $("#wav-button").classList.add('is-link');
  $("#csv-button").classList.remove('is-link');
  $("#rw3-button").classList.remove('is-link');
  $("#file-name-input").placeholder = "enregistrement.wav";
});
$("#csv-button").addEventListener("click", ()=>{
  $("#csv-button").classList.add('is-link');
  $("#rw3-button").classList.remove('is-link');
  $("#wav-button").classList.remove('is-link');
  $("#file-name-input").placeholder = "enregistrement.csv";
});
$("#rw3-button").addEventListener("click", ()=>{
  $("#rw3-button").classList.add('is-link');
  $("#csv-button").classList.remove('is-link');
  $("#wav-button").classList.remove('is-link');
  $("#file-name-input").placeholder = "enregistrement.rw3";
});

// Actual download
$("#download-file-button").addEventListener("click", ()=>{
  let filename = "enregistrement";
  if($("#file-name-input").value !== ""){
    filename = $("#file-name-input").value;
  }

  let sr = baseSampleRate / saves[tabManager.activeTab-2].displaySampleRateLvl;

  let series = [];
  series.push(new Serie("Temps","s"));
  series.push(new Serie("Amplitude",""));

  series[1] = saves[tabManager.activeTab-2].linearData.getData(saves[tabManager.activeTab-2].displaySampleRateLvl);

  // Download only the part selected by the user
  if($("#part-button").classList.contains("is-link")){
    let start = parseFloat($("#start-size-input").value);
    let end = parseFloat($("#end-size-input").value);
    let startSample = Math.round(start * sr);
    let endSample = Math.round(end * sr);
    series[1] = series[1].slice(startSample, endSample);
  }

  // Download only the on screen part
  if($("#on-screen-button").classList.contains("is-link")){
    let start = savWaveChart.xAxis[0].min;
    let end = savWaveChart.xAxis[0].max;
    let startSample = Math.round(start * sr);
    let endSample = Math.round(end * sr);
    series[1] = series[1].slice(startSample, endSample);
  }

  if($("#wav-button").classList.contains("is-link")){
    let file = audio.generateWavFile(series[1], sr);
    downloadFile(file,"wav",filename);
  }
  if($("#csv-button").classList.contains("is-link")){
    downloadData(series, "csv", filename);
  }
  if($("#rw3-button").classList.contains("is-link")){
    downloadData(series, "rw3", filename);
  }
  common.modalManager.closeAllModals();
});

function downloadData(_series, _type, _name){
  let sr = baseSampleRate / saves[tabManager.activeTab-2].displaySampleRateLvl;

  // Format the time serie
  for(let i = 0; i < _series[1].length; i++){
    _series[0][i] = i / sr;
  }

  // Download the file
  let file;
  if(_type === "csv"){
    file = exportToCSV(_series, true);
  }
  if(_type === "rw3"){
    file = exportToRW3(_series, true, "Enregistrement PhyWeb Audio");
  }
  downloadFile(file, _type, _name)
}

/*----------------------------------------------------------------------------------------------
------------------------Format milliseconds to a displayable time layout------------------------
----------------------------------------------------------------------------------------------*/
function formatDate(_t) {
	let min = Math.floor(_t / 60000);
	let sec = Math.floor((_t % 60000) / 1000);
	let csec = Math.round(((_t % 60000) % 1000) / 10);
	if (min < 10){
		min = "0" + min;
	}
	if (sec < 10){
		sec = "0" + sec;
	}
	if(csec < 10){
		csec = "0" +csec;
	}

	// Round up if x.995+
	if(((_t % 60000) % 1000) / 10 > 99.5){
		sec++;
		if (sec < 10){
			sec = "0" + sec;
		}
		csec = "00";
	}

	if(_t < 60 * 1000){
		return sec + "," + csec + " s";
	} else{
		return min + ":" + sec;
	}
}

/*----------------------------------------------------------------------------------------------
--------------------------------------LINEAR DATA Object----------------------------------------
----------------------------------------------------------------------------------------------*/
function LinearData(_data, _step = 1) {
	this.data = _data;
	this.step = _step;

	this.getData = function(_downSampling = 1, _length = undefined, stabilize = false){
		let data
		if(stabilize == true){
			data = this.stabilize();
		} else{
			data = this.data;
		}
		if(_length == undefined){
			if(_downSampling == 1){
				return data;
			} else {
				let data2 = new Int16Array(data.length / _downSampling); // TODO PAS QUE INT16!!!
				for(let i = 0; i < data.length; i++){
					data2[i] = data[i*_downSampling];
				}
				return data2;
			}
		} else{
			let data2 = new Int16Array(_length * baseSampleRate / _downSampling); // TODO PAS QUE INT16!!!
			for(let i = 0; i < _length * baseSampleRate / _downSampling; i++){
				data2[i] = data[i*_downSampling];
			}
			return data2;
		}
	}

	this.getDuration = function(){
		return this.data.length * this.step;
	}

	this.stabilize = function(){
		let maximum = 0;
		let maximumIndex = 0;
		for(let i = 0; i < this.data.length / 10; i++){
			if(this.data[i] > maximum){
				maximum = this.data[i];
				maximumIndex = i;
			}
		}
		let stabilizedData = new Int16Array(_data.length - maximumIndex)
		stabilizedData.set(this.data.slice(maximumIndex, _data.length));
		return stabilizedData;
	}
}

/*----------------------------------------------------------------------------------------------
-----------------------------------------GRAPH SETTINGS-----------------------------------------
----------------------------------------------------------------------------------------------*/

Highcharts.setOptions({
	lang: {
			decimalPoint: ',',
			thousandsSep: ' ',
			numericSymbols: [],
			resetZoom: "Réinitialiser le zoom"
	}
});

function HighchartOptions(_title, _xTitle, _yTitle, _xMin, _xMax, _yMin, _yMax, _xDecimals = 0, _zoom = undefined, _animation = true, _mouseTracking = true){
  this.accessibility = {
    enabled : false
  };
  this.chart = {
		spacingLeft: 0,
		spacingBottom: 0,
		zoomType: _zoom,
		plotBorderWidth: 1,
		animation: _animation
	};
	this.plotOptions = {
		series: {
			states: {
				hover: {lineWidthPlus: 0}
			},
			lineWidth: 3,
			color: common.colors.linkRGB,
			enableMouseTracking: _mouseTracking
		},
	};
	this.title = {
    text: _title
	};
	this.legend = {
		enabled: false
	};
	this.xAxis = {
		title: {
      text: _xTitle
    },
		min: _xMin,
		softMax: _xMax
	};
	this.yAxis = {
		title: {
      text: _yTitle
		},
		min: _yMin,
		max: _yMax,
	};
	this.credits = {
		enabled: false
	};
	this.tooltip = {
		formatter: function() {
			return _xTitle + ": <b>" + Highcharts.numberFormat(this.x, _xDecimals) + "</b><br>" + _yTitle + ": <b>" + Highcharts.numberFormat(this.y,0) + "</b>";
		}
	};
	this.series = [{animation:false}/*{
		animation: false,
		name: _seriesNames[0],
		states: {
			hover: {
				enabled: false
			}
		}
	}*/]
}

let rtWaveOptions = new HighchartOptions(null, "Temps (s)", "Amplitude", 0, 0.04, -32768, 32768, 0, undefined, false, false);
let rtFourierOptions = new HighchartOptions(null, "Fréquence (Hz)", "Amplitude", 0, 10000, 0, 32768, 0, undefined, false, false);

let recWaveOptions = new HighchartOptions(null, "Temps (s)", "Amplitude", 0, 0.05, -32768, 32768, 7, "xy");
let recFourierOptions = new HighchartOptions(null, "Fréquence (Hz)", "Amplitude", 0, 10000, 0, 32768, 2, "xy");

let savWaveOptions = new HighchartOptions(null, "Temps (s)", "Amplitude", 0, 0.05, -32768, 32768, 7, "xy");
let savFourierOptions = new HighchartOptions(null, "Fréquence (Hz)", "Amplitude", 0, 10000, 0, 32768, 2, "xy");
let savTemporalFourierOptions = {
  accessibility: {
    enabled : false
  },
	chart: {
		type: "heatmap",
		zoomType:"xy",
		spacingLeft: 0,
		spacingBottom: 0
	},
	title: {
    text: null
	},
	credits: {
		enabled: false
	},
	legend: {
		align: 'right',
		layout: 'vertical',
		margin: 0,
		verticalAlign: 'top',
		y: 25,
		symbolHeight: 280
	},
	yAxis: {
		title: {
      text: "Temps (s)"
    },
		min: 0,
		max: 2
	},
	xAxis: {
		title: {
      text: "Fréquence (Hz)"
		},
		minPadding: 0,
		maxPadding: 0,
		startOnTick: false,
		endOnTick: false,
		min: 0,
		max: 10000,
	},
	colorAxis: {
		minColor: "#e6ebf5",
		maxColor: "#003399",
		min: 0,
		max: 20000
		},
		tooltip: {
			formatter: function() {
				return "Fréquence: <b>" + Highcharts.numberFormat(this.x, 10) + "</b><br>" + "Temps: <b>" + Highcharts.numberFormat(this.y,1) + "</b>";
			}
		},
	series:[{colsize:10//span columns on 10 units
	}]
}

savWaveOptions.chart.events = {selection: function(event){onSavWaveGraphSelection(event)}};
savFourierOptions.chart.events = {selection: function(event){onSavFourierGraphSelection(event)}};
savTemporalFourierOptions.chart.events = {selection: function(event){onSavTemporalFourierGraphSelection(event)}};

/*----------------------------------------------------------------------------------------------
---------------------------------------Create the graphs ---------------------------------------
----------------------------------------------------------------------------------------------*/
let rtWaveChart = Highcharts.chart('rt-graph-container', rtWaveOptions);
let rtFourierChart = Highcharts.chart('rt-fourier-container', rtFourierOptions);

let recWaveChart = Highcharts.chart('rec-graph-container', recWaveOptions);
let recFourierChart = Highcharts.chart('rec-fourier-container', recFourierOptions);

let savWaveChart = Highcharts.chart('sav-graph-container', savWaveOptions);
let savFourierChart = Highcharts.chart('sav-fourier-container', savFourierOptions);
let savTemporalFourierChart = Highcharts.chart('sav-temporal-fourier-container', savTemporalFourierOptions);

/*savWaveChart.xAxis[0].allowZoomOutside = true;
savWaveChart.yAxis[0].allowZoomOutside = true;
savFourierChart.xAxis[0].allowZoomOutside = true;
savFourierChart.yAxis[0].allowZoomOutside = true;
savTemporalFourierChart.xAxis[0].allowZoomOutside = true;
savTemporalFourierChart.yAxis[0].allowZoomOutside = true;*/

/*----------------------------------------------------------------------------------------------
-----------------------------------------DRAW FUNCTIONS-----------------------------------------
----------------------------------------------------------------------------------------------*/
function realtimeDraw() {
	if(paused == false){
	// sample
	rtWaveData = new LinearData(audio.getGraph(), 1 / baseSampleRate);


	// Compute the fourier
	if(simpleMode == false){
		rtFourierData = computeFourier(rtWaveData, baseSampleRate);
	} else{
		rtFourierData = null;
	}

	// Initial Draw
	if(rtInitialDraw && rtWaveData.data.length > 0){
		rtWaveChart.series[0].pointInterval = rtWaveData.step * 2;
		rtWaveChart.series[0].setData(arrayCopy(rtWaveData.getData(2, rtLength, true)));
		if(simpleMode == false){
			rtFourierChart.series[0].pointInterval = rtFourierData.step;
			rtFourierChart.series[0].setData(arrayCopy(rtFourierData.getData()));
		}
		rtInitialDraw = false;
	}

	// Update datas and redraw the serie (not the whole graph)
	rtWaveChart.series[0].setData(arrayCopy(rtWaveData.getData(2, rtLength, true)), false);
	rtWaveChart.series[0].redraw();
	if(simpleMode == false){
		rtFourierChart.series[0].setData(arrayCopy(rtFourierData.getData()), false);
		rtFourierChart.series[0].redraw();
	}
	};
}

function recordDraw() {
	// Reflow the charts to the div size
	recWaveChart.reflow();
	recFourierChart.reflow();
	
	// Update the progressBar
	if($("#sample-progress-bar").classList.contains("is-hidden") === false){
		
		let elapsedTime = Date.now() - samplingStartTime;
		$("#sample-progress-bar").value = Math.min((elapsedTime) / (sampleLength * 10), 100);
		let remainingTime = new Date(Math.max(0, sampleLength - (Date.now() - samplingStartTime)));

		//recProgressBarLabel.innerHTML = formatDate(Math.max(0,sampleLength * 1000 - (Date.now() - samplingStartTime)));
	}

	// sample
	if(audio.isDataAvailable() == true){
		// Hide the progress bar
		$("#sample-length-input").classList.remove("is-hidden");
		$("#sample-progress-bar").classList.add("is-hidden");
		$("#sample-button").classList.remove("is-hidden");
		$("#stop-sample-button").classList.add("is-hidden");

		recordGraphDraw(audio.getRecord(), recSampleRate);
	}
}

function recordGraphDraw(_data){
  // Discard old datas and create a new LinearData
  recWaveData = new LinearData(_data, 1 / baseSampleRate)
  // Display the save and playback buttons
  $("#sample-panel").classList.remove("is-hidden");
  // Display the sample length
  $("#rec-sample-length-label").innerHTML = "Durée : " + formatDate(recWaveData.getDuration() * 1000);
  // Compute the dft
  if(simpleMode == false){
    recFourierData = computeFourier(recWaveData, recordedSampleRate);
  } else{
    recFourierData = null;
  }
  // Plot graphs
  recWaveChart.xAxis.max = recWaveData.getDuration();
  recWaveChart.series[0].pointInterval = recWaveData.step * (baseSampleRate / recordedSampleRate);
  recWaveChart.series[0].setData(arrayCopy(recWaveData.getData(baseSampleRate / recordedSampleRate)));

  if(simpleMode == false){
    recFourierChart.series[0].pointInterval = recFourierData.step;
    recFourierChart.series[0].setData(arrayCopy(recFourierData.getData()));
  }
}

function saveDraw() {
	// Reflow the charts to the div size
	savWaveChart.reflow();
	savFourierChart.reflow();
	//savTemporalFourierChart.reflow();

	// Populate the sample rate 
	populateSampleRateSelect($("#save-samplerate-select"), saves[tabManager.activeTab-2].recordedSampleRateLvl, 32);
	
	// Select the right option
	$("#save-samplerate-select").selectedIndex = Math.log2(saves[tabManager.activeTab-2].displaySampleRateLvl) - Math.log2(saves[tabManager.activeTab-2].recordedSampleRateLvl);

	// Display the sample length
	$("#save-sample-length-label").innerHTML = "Durée : " + formatDate(saves[tabManager.activeTab-2].linearData.getDuration() * 1000);

	// Update the data & apply zoom
	savWaveChart.series[0].pointInterval = saves[tabManager.activeTab-2].linearData.step * saves[tabManager.activeTab-2].displaySampleRateLvl;
	savWaveChart.series[0].setData(arrayCopy(saves[tabManager.activeTab-2].linearData.getData(saves[tabManager.activeTab-2].displaySampleRateLvl)), false);
	savWaveChart.zoom({xAxis:[{min:saves[tabManager.activeTab-2].range.xRange[0],max:saves[tabManager.activeTab-2].range.xRange[1], axis:savWaveChart.xAxis[0]}], yAxis:[{min:saves[tabManager.activeTab-2].range.yRange[0],max:saves[tabManager.activeTab-2].range.yRange[1], axis:savWaveChart.yAxis[0]}]});

	// Display the right fourier type and update the datas
  if(simpleMode){return;};
	if(saves[tabManager.activeTab-2].fourierType == 0){
		$("#sav-fourier-container").classList.remove("is-hidden");
		$("#sav-temporal-fourier-container").classList.add("is-hidden");
		savFourierChart.series[0].pointInterval = saves[tabManager.activeTab-2].fLinearData.step;
		savFourierChart.series[0].setData(arrayCopy(saves[tabManager.activeTab-2].fLinearData.getData()), false);
		savFourierChart.zoom({xAxis:[{min:saves[tabManager.activeTab-2].fourierRange.xRange[0],max:saves[tabManager.activeTab-2].fourierRange.xRange[1], axis:savFourierChart.xAxis[0]}], yAxis:[{min:saves[tabManager.activeTab-2].fourierRange.yRange[0],max:saves[tabManager.activeTab-2].fourierRange.yRange[1], axis:savFourierChart.yAxis[0]}]});
	}
	if(saves[tabManager.activeTab-2].fourierType == 1){
		$("#sav-fourier-container").classList.add("is-hidden");
		$("#sav-temporal-fourier-container").classList.remove("is-hidden");
		savTemporalFourierChart.series[0].setData(saves[tabManager.activeTab-2].fTemporalData);
		savTemporalFourierChart.zoom({xAxis:[{min:saves[tabManager.activeTab-2].fourierRange.xRange[0],max:saves[tabManager.activeTab-2].fourierRange.xRange[1], axis:savTemporalFourierChart.xAxis[0]}], yAxis:[{min:saves[tabManager.activeTab-2].fourierRange.yRange[0],max:saves[tabManager.activeTab-2].fourierRange.yRange[1], axis:savTemporalFourierChart.yAxis[0]}]});
	}
}

function draw() {
	requestAnimationFrame(draw);

	// resume the audio context if it is suspended
	//audio.resumeContext(); TODO

	switch(tabManager.activeTab){
	case 0:
		realtimeDraw();
		break;
	case 1:
		recordDraw();
		break;
	}
};

/*----------------------------------------------------------------------------------------------
-----------------------------------AUDIO PLAYBACK FUNCTION--------------------------------------
----------------------------------------------------------------------------------------------*/
// TODO probablement passer ca dans audio.js avec tout ce qui touche au samplerate

function audioPlayback(_data, _sr, _callback){
	// Prepare the datas if the samplerate is not default
		if(_sr != baseSampleRate){
			let factor = baseSampleRate / _sr; 
			let prepData = [];
			for(let i = 0; i < _data.length; i++){
				prepData[i * factor] = _data[i];
				for(let j = 1; j < factor; j++){
					prepData[i * factor + j] =  (_data[i + 1] - _data[i]) / factor * j + _data[i + 1];
				}
			}
		
		// Play the recorded sound
		audio.play(prepData);
	}
	else{
		// Play the recorded sound
		audio.play(_data);
	}

	// New source created everytime = reset event functions
	audio.playbackSource.onended = function(){_callback()};
}

/*----------------------------------------------------------------------------------------------
-------------------------------------HIHGCHART ZOOM EVENTS--------------------------------------
----------------------------------------------------------------------------------------------*/
function onSavWaveGraphSelection(event){
	if (event.xAxis != undefined){ // handmade selection
		saves[tabManager.activeTab-2].range.xRange = [event.xAxis[0].min, event.xAxis[0].max];
		saves[tabManager.activeTab-2].range.yRange = [event.yAxis[0].min, event.yAxis[0].max];
	} else{ // Reset zoom button
		saves[tabManager.activeTab-2].range.xRange = [undefined, undefined];
		saves[tabManager.activeTab-2].range.yRange = [undefined, undefined];
	}
}

function onSavFourierGraphSelection(event){
	if (event.xAxis != undefined){ // handmade selection
		saves[tabManager.activeTab-2].fourierRange.xRange = [event.xAxis[0].min, event.xAxis[0].max];
		saves[tabManager.activeTab-2].fourierRange.yRange = [event.yAxis[0].min, event.yAxis[0].max];
	} else{ // Reset zoom button
		saves[tabManager.activeTab-2].fourierRange.xRange = [undefined, undefined];
		saves[tabManager.activeTab-2].fourierRange.yRange = [undefined, undefined];
	}
}

function onSavTemporalFourierGraphSelection(event){
	if (event.xAxis != undefined){ // handmade selection
		saves[tabManager.activeTab-2].fourierRange.xRange = [event.xAxis[0].min, event.xAxis[0].max];
		saves[tabManager.activeTab-2].fourierRange.yRange = [event.yAxis[0].min, event.yAxis[0].max];
	} else{ // Reset zoom button
		saves[tabManager.activeTab-2].fourierRange.xRange = [undefined, undefined];
		saves[tabManager.activeTab-2].fourierRange.yRange = [undefined, undefined];
	}
}

/*----------------------------------------------------------------------------------------------
-------------------------------------DEEP? COPY FUNCTION-----------------------------------------
----------------------------------------------------------------------------------------------*/
function arrayCopy(_array, _length = _array.length){
	let copy = [];
	for(let i = 0; i < _length; i++){
		copy[i] = _array[i];
	}
	return copy;
}

/*----------------------------------------------------------------------------------------------
---------------------------------------COMPUTE FOURIER------------------------------------------
----------------------------------------------------------------------------------------------*/
function computeFourier(_wave, _sampleRate, _range){
	let startIndex;
	let stopIndex;
	if(_range == undefined){
		startIndex = 0;
		stopIndex = _wave.data.length;
	}
	else{
		startIndex = Math.floor(_range[0] * _sampleRate);
		stopIndex = Math.floor(_range[1] * _sampleRate);
	}

	// Select the needed datas
	let fftInput = new LinearData(_wave.getData(baseSampleRate / _sampleRate).slice(startIndex, stopIndex));

	// limit dft to 10 kHz
	let maxIndex = fftInput.data.length / 2;
	if(_sampleRate / 2 > 10000){
		maxIndex = fftInput.data.length / _sampleRate * 10000 + 1;
	}
	// Plot the dft
	let result = new LinearData(new Float32Array(maxIndex));
	fourier.computeNormalizedFft(fftInput, result, _sampleRate, false);
	return result;

}

function computeTemporalFourier(_wave, _sampleRate, _range){
	let startIndex;
	let stopIndex;
	if(_range == undefined){
		startIndex = 0;
		stopIndex = _wave.data.length;
	}
	else{
		startIndex = Math.floor(_range[0] * baseSampleRate);
		stopIndex = Math.floor(_range[1] * baseSampleRate);
	}

	// Select the needed datas
	let data = new LinearData(_wave.getData().slice(startIndex, stopIndex), 1 / baseSampleRate);

	// Split the data in chunks and perform dft on them
	let chunks = []
	for(let i = 0; (i+1) < data.getDuration() / chunkLength; i++){
		chunks[i] = computeFourier(new LinearData(data.getData().slice(i * chunkLength * baseSampleRate, (i+1) * chunkLength * baseSampleRate)), _sampleRate);
	}
	return chunks;
}

// save fourier replot
$("#save-fourier-replot-button").addEventListener("click",()=>{onFourierReplotButtonClick()})

function onFourierReplotButtonClick() {
	// Save the ranges
	saves[tabManager.activeTab-2].fourierPlottingRange = [savWaveChart.xAxis[0].min,savWaveChart.xAxis[0].max];

	if($("#regular-fourier-button").classList.contains("is-active")){
		// display the regular dft
		$("#sav-fourier-container").classList.remove("is-hidden");
		$("#sav-temporal-fourier-container").classList.add("is-hidden");

		// Compute the dft
		saves[tabManager.activeTab-2].fLinearData = computeFourier(saves[tabManager.activeTab-2].linearData, baseSampleRate / saves[tabManager.activeTab-2].displaySampleRateLvl, saves[tabManager.activeTab-2].fourierPlottingRange);

		// Update and redraw
		savFourierChart.series[0].pointInterval = saves[tabManager.activeTab-2].fLinearData.step;
		savFourierChart.series[0].setData(arrayCopy(saves[tabManager.activeTab-2].fLinearData.getData()));
		if(saves[tabManager.activeTab-2].fourierType != 0){
			// User changed fourier type => reset zoom
			savFourierChart.zoom({xAxis:[{min:undefined,max:undefined, axis:savFourierChart.xAxis[0]}], yAxis:[{min:undefined,max:undefined, axis:savFourierChart.yAxis[0]}]});
		}
		// Log fourier type displayed
		saves[tabManager.activeTab-2].fourierType = 0;
	}
	else{
		// check data size and return if too short
		if(saves[tabManager.activeTab-2].fourierPlottingRange[1] - saves[tabManager.activeTab-2].fourierPlottingRange[0] < 0.5){
      alertModal({
        type: "warning",
        title: "Durée insuffisante",
        body: "La durée de l'enregistrement doit être supérieure à 0,5s pour réaliser une analyse spectrale temporelle.",
        confirm: "OK"
      })
			return;
		}
		// display the temporal dft
		$("#sav-fourier-container").classList.add("is-hidden");
		$("#sav-temporal-fourier-container").classList.remove("is-hidden");

		let chunks = computeTemporalFourier(saves[tabManager.activeTab-2].linearData, baseSampleRate / saves[tabManager.activeTab-2].displaySampleRateLvl, saves[tabManager.activeTab-2].fourierPlottingRange);
		// Format data
		let highestAmplitude = 0;
		saves[tabManager.activeTab-2].fTemporalData = [];
		for(let i = 0; i < chunks.length; i++){
			for(let j = 0; j < chunks[i].data.length; j++){
				saves[tabManager.activeTab-2].fTemporalData[i * chunks[0].data.length + j] = [j * chunks[0].step, i * chunkLength, chunks[i].data[j]];
				if(chunks[i].data[j] > highestAmplitude){ // check for the highest amplitude
					highestAmplitude = chunks[i].data[j];
				}
			}
		}
		// Update boundaries
		savTemporalFourierChart.update({
			yAxis:{max:chunks.length * chunkLength},
			colorAxis:{max:highestAmplitude}
		});

		// Set the new datas and draw
		savTemporalFourierChart.series[0].setData(saves[tabManager.activeTab-2].fTemporalData);
		if(saves[tabManager.activeTab-2].fourierType != 1){
			// User changed fourier type => reset zoom
			savTemporalFourierChart.zoom({xAxis:[{min:undefined,max:undefined, axis:savTemporalFourierChart.xAxis[0]}], yAxis:[{min:undefined,max:undefined, axis:savTemporalFourierChart.yAxis[0]}]});
		}
		// Log fourier type displayed
		saves[tabManager.activeTab-2].fourierType = 1;
	}
}
});

