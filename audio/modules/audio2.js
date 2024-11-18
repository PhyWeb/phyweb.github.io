class PhyAudio{
  constructor(_bufferSize){
    this.audioCtx;
    this.mediaStream;
    this.micNode;
    this.processorNode;
    this.analyserNode;

    this.data = [];

    this.recording = false;
    this.delay = -1;

    this.bufferSize = _bufferSize;

    this.isModuleLoaded = false;
  }

  startAudio = async (_mode) => {
    this.audioCtx = new AudioContext();

    if (!this.isModuleLoaded) {
      await this.audioCtx.audioWorklet.addModule('modules/processor-node.js');
    }
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

          if(this.delay == -1){
            this.delay = Math.max(0, (4096 / this.audioCtx.sampleRate) - (performance.now() - this.startTime) / 1000);
          }

          this.data.push(convertFloat32ToInt16(e.data.audioBuffer))
          if(this.data.length * bufferLength > this.recordLength * this.audioCtx.sampleRate){
            this.availableData = true;
            this.recording = false;
          }
        }
      }
      if (e.data.eventType === 'stop') {
        // recording has stopped
      }
    };

    this.micNode.connect(this.processorNode).connect(this.audioCtx.destination);
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

  startRecording = (_length = 1) =>{
    this.startTime = performance.now();
    this.data.length = 0;
    this.recording = true;
    this.recordLength = _length;
  }

  init = async () => {
    await this.startAudio(this.audioCtx);
    
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