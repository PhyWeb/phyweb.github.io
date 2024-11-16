function PhyAudio(_bufferSize){
  this.gain = 1;

  this.data = [];

  this.recording = false;
  this.availableData = false;

  this.startTime;
  this.delay = -1;

  // Create an audio context
  this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // TODO Maybe deprecated
  this.sampleRate = this.audioCtx.sampleRate;

  this.playbackSource = this.audioCtx.createBufferSource();

  // Create a gain node
  this.gainNode = this.audioCtx.createGain();

  // Create a processor node
  this.processorNode = this.audioCtx.createScriptProcessor(4096, 1, 1);

  // Create an analyser node
  this.analyserNode = this.audioCtx.createAnalyser();

  // Set the analyser
  this.analyserNode.fftSize = _bufferSize * 2;

  // Only ask for audio
  let constraints = { audio: true, video: false }; 

  // Get the audio source and connect all nodes
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {

    // Create a MediaStreamAudioSourceNode
    // Feed the HTMLMediaElement into it
    this.source = this.audioCtx.createMediaStreamSource(stream);

    // connect the AudioBufferSourceNode to the gain node
    // and the gain node to the analyser
    // and the analyser to the scriptprocessor
    // and the analyser to the destination
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.processorNode); 
    this.processorNode.connect(this.audioCtx.destination); // TODO replace destination by a dummy node to avoid audio playback
  }.bind(this))
  .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.

  this.resumeContext = function(e){
    if(this.audioCtx.state == "suspended"){
      this.audioCtx.resume();
    }
  }

  this.processorNode.onaudioprocess = function(e) {
    if(this.recording == true){
      // push new datas to the array
      if(this.delay == -1){
        this.delay = Math.max(0, (4096 / this.sampleRate) - (performance.now() - this.startTime) / 1000);
      }
      this.data.push(convertFloat32ToInt16(e.inputBuffer.getChannelData(0)));
    }
    
    if(this.recording == true && (this.data.length - 2) * 4096 > (this.recordLength + this.delay) * this.sampleRate){
      this.availableData = true;
      this.recording = false;
    }

  }.bind(this)

  this.startRecording = function(_length){
    this.startTime = performance.now();
    this.data.length = 0;
    this.recording = true;
    this.recordLength = _length;
  }

  this.isDataAvailable = function(_length){
    if(this.availableData == true && this.data.length > 0){
      return true;
    }
    return false;
  }

  this.getRecord = function(){
    let shift = Math.round(this.delay * this.sampleRate);
    if (shift > 4096){ 
      shift = 4096;
    }
    let a = new Int16Array(this.data.length * this.data[0].length - shift);

    // Copy the first chunk
    for(let i = 0; i < this.data[0].length - shift; i++){
      a[i] = this.data[2][i + shift];
    }

    // concat all remaining chunks together
    for(let i = 3; i  < this.data.length; i++){
      a.set(this.data[i], (i - 2) * this.data[0].length - shift);
    }
    this.availableData = false;
    this.delay = -1;

    return a.slice(0, this.recordLength * this.sampleRate);
  }

  this.setBufferSize = function(_bufferSize){
    this.analyserNode.fftSize = _bufferSize * 2;
  }

  this.getGraph = function(){
    let graphDataArray = new Float32Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getFloatTimeDomainData(graphDataArray);
    return convertFloat32ToInt16(graphDataArray);
  }

  /*this.getFft = function(){
    this.analyserNode.getByteFrequencyData(this.fftDataArray);
    return this.fftDataArray;
  }*/

  this.getSampleRate = function(){
    return this.audioCtx.sampleRate;
  }

  this.setGain = function(_gain){
    this.gain = _gain;
    this.gainNode.gain.setValueAtTime(_gain, this.audioCtx.currentTime);
  }

  /*----------------------------------------------------------------------------------------------
  ---------------------------------------PLAYBACK FUNCTION----------------------------------------
  ----------------------------------------------------------------------------------------------*/
  this.play = function (channelData) {
    /*
    // create a new single channel audio buffer to put sound into
    let soundBuffer = this.audioCtx.createBuffer(1, channelData.length, this.audioCtx.sampleRate);
    // get channel data for mutating
    let channelBuffer = soundBuffer.getChannelData(0);

    for (let i = 0, l = channelData.length; i < l; i++) {
      s = Math.max(-32768, Math.min(32767, channelData[i])); // built-in int16 to float32
      channelBuffer[i] = s < 0 ? s / 32768 : s / 32767;
    }*/
    let soundBuffer = this.arrayToAudioBuffer(channelData);

    this.playbackSource = this.audioCtx.createBufferSource();

    // set the source to be the buffer we created earlier
    this.playbackSource.buffer = soundBuffer;

    // connect the source to the destination so we can hear the sound
    this.playbackSource.connect(this.audioCtx.destination);

    // start the source playing!
    this.playbackSource.start();
  }

  this.stop = function () {
    // stop the source playing!
    this.playbackSource.stop();
  }

  /*----------------------------------------------------------------------------------------------
  ----------------------------------------DECODE FUNCTION-----------------------------------------
  ----------------------------------------------------------------------------------------------*/
  this.decode = function(_data, _callback){
    this.audioCtx.decodeAudioData(_data).then(function(decodedData) {
      _callback(decodedData);
     });
  }

  /*----------------------------------------------------------------------------------------------
  ---------------------------------------UTILITY FUNCTIONS----------------------------------------
  ----------------------------------------------------------------------------------------------*/
  // Convert array to an audioBuffer (single channel only)
  this.arrayToAudioBuffer = function(_array, _sr = this.audioCtx.sampleRate){
    // create a new single channel audio buffer to put sound into
    let soundBuffer = this.audioCtx.createBuffer(1, _array.length, _sr);
    // get channel data for mutating
    let channelBuffer = soundBuffer.getChannelData(0);

    for (let i = 0, l = _array.length; i < l; i++) {
      let s = Math.max(-32768, Math.min(32767, _array[i])); // built-in int16 to float32
      channelBuffer[i] = s < 0 ? s / 32768 : s / 32767;
    }
    return soundBuffer;
  }

  // Convert AudioBuffer to a Blob using WAVE representation
  this.generateWavFile = function(_data, _sr) {
    let audioBuffer = this.arrayToAudioBuffer(_data, _sr);
    let wave = this.bufferToWave(audioBuffer, audioBuffer.length)
    return wave;
  }

  // Convert AudioBuffer to a Blob using WAVE representation
  this.bufferToWave = function(abuffer, len) {
    let numOfChan = abuffer.numberOfChannels,
    length = len * numOfChan * 2 + 44,
    buffer = new ArrayBuffer(length),
    view = new DataView(buffer),
    channels = [], i, sample,
    offset = 0,
    pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this demo)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while(pos < length) {
      for(i = 0; i < numOfChan; i++) {             // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true);          // write 16-bit sample
        pos += 2;
      }
      offset++                                     // next source sample
    }

    // create Blob
    return buffer;

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }

}

/*----------------------------------------------------------------------------------------------
-------------------------------------TYPED ARRAY CONVERTERS-------------------------------------
----------------------------------------------------------------------------------------------*/
function convertFloat32ToInt16(buffer, l = buffer.length, _start = 0) {
	let buf = new Int16Array(l);
  let s;

  for(let i = 0; i < (l + _start); i++){
    s = Math.max(-1, Math.min(1, buffer[i+_start]));
    buf[i] = s < 0 ? s * 32768 : s * 32767;
  }
  return buf;
}

function convertInt16ToFloat32(buffer) {
  let l = buffer.length;  //Buffer
	let buf = new Float32Array(l);

	while (l--) {
    s = Math.max(-32768, Math.min(32767, buffer[l]));
    buf[l] = s < 0 ? s / 32768 : s / 32767;
  }
  return buf;
}

export { PhyAudio, convertFloat32ToInt16 , convertInt16ToFloat32};