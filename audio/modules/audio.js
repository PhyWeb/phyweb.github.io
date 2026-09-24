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
    
    let success = false;
    if(_mode === "RT"){
      success = await this.loadRT();
    }
    if(_mode === "REC"){
      success = await this.loadREC();
    }

    if(success){
      this.audioCtx.resume();
    }
    return success;
  };

  loadRT = async () => {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
      this.micNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.gainNode = this.audioCtx.createGain();
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = this.bufferSize * 2;

      this.micNode.connect(this.gainNode).connect(this.analyserNode);

      return true;  
    } catch (error) {
      console.error("Accès micro refusé (RT):", error);
      return false;
    }
  }

  loadREC = async () => {
    try {
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
      return true;
    } catch (error) {
      console.error("Accès micro refusé (REC):", error);
      return false;
    }
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
function convertFloat32ToInt16(buffer, l, _start = 0) {
  if (!buffer || buffer.length === 0) {
    return new Int16Array(0);
  }
  const startOffset = Math.max(0, _start);
  const targetLen = (l !== undefined) ? Math.max(0, l) : Math.max(0, buffer.length - startOffset);
  if (targetLen <= 0) {
    return new Int16Array(0);
  }

  const buf = new Int16Array(targetLen);
  const count = Math.min(targetLen, Math.max(0, buffer.length - startOffset));
  let s;

  for (let i = 0; i < count; i++) {
    s = Math.max(-1, Math.min(1, buffer[i + startOffset]));
    buf[i] = s < 0 ? s * 32768 : s * 32767;
  }
  return buf;
}

function convertInt16ToFloat32(buffer) {
  if (!buffer || buffer.length === 0) {
    return new Float32Array(0);
  }
  let l = buffer.length;
  const buf = new Float32Array(l);
  let s;

  while (l--) {
    s = Math.max(-32768, Math.min(32767, buffer[l]));
    buf[l] = s < 0 ? s / 32768 : s / 32767;
  }
  return buf;
}

/*----------------------------------------------------------------------------------------------
-------------------------------------AUDIO RESAMPLING-------------------------------------------
----------------------------------------------------------------------------------------------*/
/**
 * Rééchantillonne des données audio par interpolation linéaire (upsampling / sous-échantillonnage de lecture).
 * Utilisé pour adapter la fréquence d'échantillonnage d'un enregistrement ou d'une sauvegarde
 * à la fréquence native (baseSampleRate) de l'AudioContext.
 *
 * @param {ArrayLike<number>} data - Données audio sources
 * @param {number} factor - Facteur de sur-échantillonnage (baseSampleRate / targetSampleRate)
 * @returns {Float32Array|ArrayLike<number>} Données rééchantillonnées
 */
function resampleLinear(data, factor) {
  if (!data || data.length === 0) {
    return new Float32Array(0);
  }
  if (!factor || factor <= 1) {
    return data;
  }

  const len = data.length;
  const isInt = Math.abs(factor - Math.round(factor)) < 1e-6;

  if (isInt) {
    const f = Math.round(factor);
    const prepData = new Float32Array(len * f);
    for (let i = 0; i < len; i++) {
      const current = data[i];
      const next = (i + 1 < len) ? data[i + 1] : current;
      const step = (next - current) / f;
      const baseIdx = i * f;
      prepData[baseIdx] = current;
      for (let j = 1; j < f; j++) {
        prepData[baseIdx + j] = current + step * j;
      }
    }
    return prepData;
  } else {
    const targetLength = Math.round(len * factor);
    const prepData = new Float32Array(targetLength);
    for (let k = 0; k < targetLength; k++) {
      const t = k / factor;
      const i = Math.floor(t);
      const alpha = t - i;
      if (i + 1 < len) {
        prepData[k] = data[i] + (data[i + 1] - data[i]) * alpha;
      } else {
        prepData[k] = data[Math.min(i, len - 1)];
      }
    }
    return prepData;
  }
}

/**
 * Objet / conteneur de données linéaires (séries temporelles audio ou spectrales).
 * Permet l'extraction sous-échantillonnée, la mesure de durée et la stabilisation du signal.
 */
class LinearData {
  constructor(_data, _step = 1) {
    this.data = _data;
    this.step = _step;
  }

  /**
   * Retourne les données éventuellement sous-échantillonnées et stabilisées.
   *
   * @param {number} _downSampling - Facteur de sous-échantillonnage temporel (défaut: 1)
   * @param {number|undefined} _length - Durée temporelle en secondes à extraire (optionnel)
   * @param {boolean} stabilize - Si true, aligne les données sur le premier pic maximal
   * @param {number|undefined} _sampleRate - Fréquence d'échantillonnage de référence pour _length (optionnel)
   * @returns {TypedArray|Array} Données sous-échantillonnées
   */
  getData(_downSampling = 1, _length = undefined, stabilize = false, _sampleRate = undefined) {
    let data;
    if (stabilize === true) {
      data = this.stabilize();
    } else {
      data = this.data;
    }
    if (!data || data.length === 0) {
      return data;
    }

    if (_length === undefined) {
      if (_downSampling <= 1) {
        return data;
      }
      const targetLength = Math.floor(data.length / _downSampling);
      const ArrayConstructor = (data.constructor && typeof data.constructor === 'function' && data.constructor !== Array)
        ? data.constructor
        : (Array.isArray(data) ? Array : Int16Array);

      const data2 = new ArrayConstructor(targetLength);
      for (let i = 0; i < targetLength; i++) {
        data2[i] = data[Math.floor(i * _downSampling)];
      }
      return data2;
    } else {
      const effectiveSampleRate = _sampleRate || (this.step && this.step !== 1 ? (1 / this.step) : (typeof baseSampleRate !== 'undefined' ? baseSampleRate : 1));
      const totalSamples = Math.min(Math.round(_length * effectiveSampleRate), data.length);
      const effectiveDownSampling = _downSampling > 0 ? _downSampling : 1;
      const targetLength = Math.floor(totalSamples / effectiveDownSampling);

      const ArrayConstructor = (data.constructor && typeof data.constructor === 'function' && data.constructor !== Array)
        ? data.constructor
        : (Array.isArray(data) ? Array : Int16Array);

      const data2 = new ArrayConstructor(targetLength);
      for (let i = 0; i < targetLength; i++) {
        data2[i] = data[Math.floor(i * effectiveDownSampling)];
      }
      return data2;
    }
  }

  /**
   * Retourne la durée totale du signal en secondes.
   * @returns {number}
   */
  getDuration() {
    return this.data ? this.data.length * this.step : 0;
  }

  /**
   * Recherche le pic maximal dans les 10 premiers pourcents du signal
   * et retourne une tranche débutant à cet indice.
   * @returns {TypedArray|Array}
   */
  stabilize() {
    if (!this.data || this.data.length === 0) {
      return this.data;
    }
    let maximum = 0;
    let maximumIndex = 0;
    const searchLimit = Math.floor(this.data.length / 10);
    for (let i = 0; i < searchLimit; i++) {
      if (this.data[i] > maximum) {
        maximum = this.data[i];
        maximumIndex = i;
      }
    }
    return this.data.slice(maximumIndex);
  }
}

export { PhyAudio, convertFloat32ToInt16, convertInt16ToFloat32, resampleLinear, LinearData };
