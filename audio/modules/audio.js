class PhyAudio{
  constructor(_bufferSize){
    this.audioCtx;
    this.mediaStream;
    this.micNode;
    this.processorNode;
    this.analyserNode;

    this.data = [];

    this.recording = false;

    this.bufferSize = _bufferSize;

    this.isModuleLoaded = false;
  }

  /*----------------------------------------------------------------------------------------------
  --------------------------------------RT & REC FUNCTIONS----------------------------------------
  ----------------------------------------------------------------------------------------------*/
  startAudio = async (_mode) => {
    // Create a new audio context
    if(this.audioCtx){
      this.audioCtx.close();
    }
    this.audioCtx = new AudioContext();

    // load the record processor node
    if (!this.isModuleLoaded) {
      await this.audioCtx.audioWorklet.addModule('modules/processor-node.js');
    }
    // Create the rt or rec graph
    if(_mode === "RT"){
      await this.loadRT();
    }
    if(_mode === "REC"){
      await this.loadREC();
    }

    this.audioCtx.resume();
  };

  loadRT = async () => {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
    this.micNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.gainNode = this.audioCtx.createGain();
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = this.bufferSize * 2;

    this.micNode.connect(this.gainNode).connect(this.analyserNode);
  }

  loadREC = async () => {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
    this.micNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.processorNode = new AudioWorkletNode(this.audioCtx, 'processor-node');

    this.processorNode.port.onmessage = (e) => {
      if (e.data.eventType === 'data') {
        if(this.recording){
          let bufferLength = e.data.audioBuffer.length;

          this.data.push(convertFloat32ToInt16(e.data.audioBuffer))
          if(this.data.length * bufferLength > this.recordLength * this.audioCtx.sampleRate){
            this.availableData = true;
            this.recording = false;
          }
        }
      }
      if (e.data.eventType === 'stop') {
        // recording has stopped TODO probably not usefull
      }
    };

    this.micNode.connect(this.processorNode);
  };

  isDataAvailable = () =>{
    if(this.availableData == true && this.data.length > 0){
      return true;
    }
    return false;
  }

  getRecord = () =>{
    let a = new Int16Array(this.data.length * this.data[0].length);

    // concat all remaining chunks together
    for(let i = 0; i  < this.data.length; i++){
      a.set(this.data[i], i * this.data[0].length);
    }
    this.availableData = false;
    this.delay = -1;

    return a.slice(0, this.recordLength * this.audioCtx.sampleRate);
  }

  startRecording = (_length) =>{
    this.startTime = performance.now();
    this.data.length = 0;
    this.recording = true;
    this.recordLength = _length;
  }

  stopRecording = () =>{
    this.recordLength = (performance.now() - this.startTime) / 1000;
  }

  getSampleRate = () => {
    return this.audioCtx.sampleRate;
  }

  getGraph = () => {
    if(this.analyserNode){
      let graphDataArray = new Float32Array(this.analyserNode.frequencyBinCount);
      this.analyserNode.getFloatTimeDomainData(graphDataArray);
      return convertFloat32ToInt16(graphDataArray);
    } else {
      return [];
    }
  }

  setGain = (_gain) => {
    this.gain = _gain;
    this.gainNode.gain.setValueAtTime(_gain, this.audioCtx.currentTime);
  }

  close = ()=>{
    this.audioCtx.close();
    this.isModuleLoaded = undefined;
  }

  /*----------------------------------------------------------------------------------------------
  --------------------------------------PLAYBACK FUNCTIONS----------------------------------------
  ----------------------------------------------------------------------------------------------*/
  play = (channelData) => {
    let soundBuffer = this.arrayToAudioBuffer(channelData);

    this.playbackSource = this.audioCtx.createBufferSource();

    // set the source to be the buffer we created earlier
    this.playbackSource.buffer = soundBuffer;

    // connect the source to the destination so we can hear the sound
    this.playbackSource.connect(this.audioCtx.destination);

    // start the source playing!
    this.playbackSource.start();
  }

  stop = () =>{
    // stop the source playing!
    this.playbackSource.stop();
  }

  /*----------------------------------------------------------------------------------------------
  ----------------------------------------DECODE FUNCTION-----------------------------------------
  ----------------------------------------------------------------------------------------------*/
  decode = (_data, _callback) => {
    this.audioCtx.decodeAudioData(_data).then(function(decodedData) {
      _callback(decodedData);
     });
  }

  /*----------------------------------------------------------------------------------------------
  ---------------------------------------UTILITY FUNCTIONS----------------------------------------
  ----------------------------------------------------------------------------------------------*/
  // Convert array to an audioBuffer (single channel only)
  arrayToAudioBuffer = (_array, _sr = this.audioCtx.sampleRate) => {
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
  generateWavFile = (_data, _sr) => {
    let audioBuffer = this.arrayToAudioBuffer(_data, _sr);
    let wave = this.bufferToWave(audioBuffer, audioBuffer.length)
    return wave;
  }

  // Convert AudioBuffer to a Blob using WAVE representation
  bufferToWave = (abuffer, len) => {
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