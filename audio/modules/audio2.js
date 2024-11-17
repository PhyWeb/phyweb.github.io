class PhyAudio{
  constructor(_bufferSize){
    this.audioCtx = new AudioContext();
    this.mediaStream;
    this.micNode;
    this.processorNode;
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = _bufferSize * 2;

    this.isModuleLoaded = false;
  }

  startAudio = async () => {
    if (!this.isModuleLoaded) {
      await this.audioCtx.audioWorklet.addModule('modules/processor-node.js');
      this.isModuleLoaded = true;
    }
    await this.loadGraph();
  };

  loadRT

  loadGraph = async () => {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
    this.micNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.processorNode = new AudioWorkletNode(this.audioCtx, 'processor-node');

    this.processorNode.port.onmessage = (e) => {
      if (e.data.eventType === 'data') {
        console.log(e.data.audioBuffer);
        // process pcm data
      }
      if (e.data.eventType === 'stop') {
        // recording has stopped
      }
    };

    this.micNode.connect(this.processorNode).connect(this.analyserNode).connect(this.audioCtx.destination);


  };

  onUserGesture = async () => {
    await this.startAudio(this.audioCtx);
    this.audioCtx.resume();
  }

  getSampleRate = () => {
    return this.audioCtx.sampleRate;
  }

  getGraph = () => {
    let graphDataArray = new Float32Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getFloatTimeDomainData(graphDataArray);
    return convertFloat32ToInt16(graphDataArray);
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