class ProcessorNode extends AudioWorkletProcessor {
    constructor(){
      super();

      this.bufferSize = 2048;
      this.buffer = new Float32Array(this.bufferSize);
      this.initBuffer();
    }

    initBuffer() {
      this.bytesWritten = 0;
    }

    isBufferEmpty() {
      return this.bytesWritten === 0;
    }
  
    isBufferFull() {
      return this.bytesWritten === this.bufferSize;
    }

    appendToBuffer(value) {
      if (this.isBufferFull()) {
        this.flush();
      }
  
      this.buffer[this.bytesWritten] = value;
      this.bytesWritten += 1;
    }

    flush() {
      let buffer = this.buffer;
      if (this.bytesWritten < this.bufferSize) {
        buffer = buffer.slice(0, this.bytesWritten);
      }
  
      this.port.postMessage({
        eventType: 'data',
        audioBuffer: buffer
      });
  
      this.initBuffer();
    }

    recordingStopped() {
      this.port.postMessage({
        eventType: 'stop'
      });
    }

    process(inputs, outputs, parameters) {
      //const isRecordingValues = parameters.isRecording;
      for(let i = 0; i < inputs[0][0].length; i++){
        this.appendToBuffer(inputs[0][0][i]);
      }
      outputs[0][0].set(inputs[0][0]);

      return true;
    }
  }

  registerProcessor("processor-node", ProcessorNode);