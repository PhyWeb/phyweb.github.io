import {alertModal} from "../../common/common.js"

import * as MP4Box from "../lib/mp4box.all.1.4.4.js";

const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
--------------------------------------------EXTRACTOR-------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class EXTRACTOR {
  constructor() {
    this.checkSizeInfoReady = false;

    this.mp4boxfile;

    this.height = null;
    this.width = null;
    this.nbSamples = null;
    this.duration = null;

    this.size = 0;

    this.sizeThreshold = 1024;
  }

  checkSize(_file, _checksizeCB, _decodedVideoCB, _forceFilesize = false) {
    this.checksizeCB = _checksizeCB;
    this.decodedVideoCB = _decodedVideoCB;

    console.log("File: ", _file);

    this.forceFileSize = _forceFilesize;

    let chunksize = 1024 * 1024;

    let fileSize = _file.size;
    let offset = 0;

    this.keyFrameFound = false;

    this.abortFlag = false;

    this.decodedVideo = {
      duration: null,
      width: null,
      height: null,
      frames: []
    }

    // Display progress bar
    $("#open-modal").classList.remove("is-active");
    alertModal({
      title: "Analyse de la vidéo",
      body: `<progress class="progress is-primary" id="checksize-progress" value="0" max="100"></progress>`,
      width: "42rem",
      cancel: {
        type: "danger",
        label: "Annuler",
        cb: () => this.abortFlag = true
      },
      backgroundNotClickable: true,
      id:"checksize-loading-modal"
    });

    // MP4Box callbacks
    if(this.mp4boxfile){
      this.mp4boxfile.flush();
    }
    this.mp4boxfile = MP4Box.createFile(true);
    this.mp4boxfile.onError = (e) => {console.log("MP4Box error: ", e);};
    this.mp4boxfile.onReady = (info) => {
      this.onReady(info);
    }
    this.mp4boxfile.onSamples = (track_id, ref, samples) => this.onSamples(samples);


    var onBlockRead = (evt) => {
      if(this.abortFlag){
        return;
      }

      if (offset >= fileSize) {
        return;
      }

      if (evt.target.error == null) {
        if($("#checksize-progress")){
          $("#checksize-progress").value = Math.ceil(100*offset/fileSize);
        }
        let buffer = evt.target.result;
        buffer.fileStart = offset;
        this.mp4boxfile.appendBuffer(buffer);
        offset += evt.target.result.byteLength;
      } else {
        console.log("Read error: " + evt.target.error);
        return;
      }

      readBlock(offset, chunksize, _file);
    }

    var readBlock = function(_offset, _length, _file) {
      var r = new FileReader();
      var blob = _file.slice(_offset, _length + _offset);
      r.onload = onBlockRead;
      r.readAsArrayBuffer(blob);
    }

    readBlock(offset, chunksize, _file);
  }

  onReady(_info){
    console.log("info", _info);

    this.info = _info;

    $("#checksize-loading-modal").remove();

    this.track = _info.videoTracks[0];
    this.height = this.track.video.height;
    this.width = this.track.video.width;
    this.nbSamples = this.track.nb_samples;
    this.duration = this.track.movie_duration / this.track.movie_timescale;
    this.fps = this.nbSamples / this.duration;

    // Get the appropriate `description` for a specific track. Assumes that the
    let getDescription = (track) => {
      for (const entry of track.mdia.minf.stbl.stsd.entries) {
        if (entry.avcC || entry.hvcC || entry.av1C || entry.vpcC) {
          const stream = new MP4Box.DataStream(undefined, 0, true);
          if (entry.avcC) {
            entry.avcC.write(stream);
          }
          if (entry.hvcC) {
            entry.hvcC.write(stream);
          }
          if (entry.av1C) {
            entry.av1C.write(stream);
          }
          if (entry.vpcC) {
            entry.vpcC.write(stream);
          }
          return new Uint8Array(stream.buffer, 8);  // Remove the box header.
        }
      }
      console.log("avcC, hvcC, vpcC or av1C not found");
    }

    // Decoder configuration
    this.config = {
      codec: this.track.codec,
      codedHeight: this.track.video.height,
      codedWidth: this.track.video.width,
      description: getDescription(this.mp4boxfile.getTrackById(this.track.id)),
    };

    $("#def-size-input").checked = false;
    $("#fps-size-input").checked = false;
    $("#duration-size-input").checked = false;
    $("#duration-size-inputs").classList.add("is-hidden");

    this.updateSize();

    console.log(`video size ${this.size}  MiB`)

    // Check if the video is too big
    if(this.size < this.sizeThreshold && !this.forceFileSize) {
      this.extract();
    } else{
      $("#file-size-modal").classList.add('is-active');

      $("#def-size-label").innerHTML = ` ( ${this.width} / ${this.height} => ${this.width / 2} / ${this.height / 2} )`;
      $("#fps-size-label").innerHTML = `( ${this.fps.toFixed(2)/1} => ${this.fps.toFixed(2)/2} img/s )`;

      $("#duration-size-label").innerHTML = this.duration.toFixed(2);

      $("#file-slider").noUiSlider.reset();
      $("#file-slider").noUiSlider.updateOptions({
        range:{
          'min': 0,
          'max': this.duration
        }
      });

      this.updateSize();

      $("#def-size-input").addEventListener("click", ()=>{
        this.updateSize();
      });

      $("#fps-size-input").addEventListener("click", ()=>{
        this.updateSize();
      });

      $("#duration-size-input").addEventListener("click", ()=>{
        if($("#duration-size-input").checked){
          $("#duration-size-inputs").classList.remove("is-hidden");
        } else{
          $("#duration-size-inputs").classList.add("is-hidden");
        }
        this.updateSize();
      });
      $("#start-size-input").addEventListener("change", ()=>{
        this.updateSize();
      });
      $("#end-size-input").addEventListener("change", ()=>{
        this.updateSize();
      });
    }
  }

  updateSize(){
    let h = $("#def-size-input").checked ? this.height / 2 : this.height;
    let w = $("#def-size-input").checked ? this.width / 2 : this.width;
    let fps = $("#fps-size-input").checked ? this.fps / 2 : this.fps;

    let duration;
    if($("#duration-size-input").checked){
      duration = $("#end-size-input").value - $("#start-size-input").value;
    } else{
      duration = this.duration;
    }

    let nb = duration * fps;

    this.size = Math.ceil(h * w * 4 * nb / (1024*1024));

    if(this.size < this.sizeThreshold) {
      $("#size-label").classList.remove("has-text-danger");
      $("#size-label").classList.add("has-text-success");

      $("#open-resized-video").classList.remove("is-danger");
      $("#open-resized-video").classList.add("is-success");
      $("#open-resized-video").innerHTML = "Ouvrir la vidéo";
    } else {
      $("#size-label").classList.add("has-text-danger");
      $("#size-label").classList.remove("has-text-success");

      $("#open-resized-video").classList.add("is-danger");
      $("#open-resized-video").classList.remove("is-success");
      $("#open-resized-video").innerHTML = "Ouvrir la vidéo malgré sa taille";
    }
    
    $("#size-label").innerHTML = this.size + " Mio"
  }

  extract(){
    this.checksizeCB()

    this.decodedVideo.duration = $("#duration-size-input").checked ? ($("#end-size-input").value - $("#start-size-input").value) * 1000 : this.track.movie_duration * 1000 / this.track.movie_timescale; 
    this.decodedVideo.width = $("#def-size-input").checked ? this.width / 2 : this.width;
    this.decodedVideo.height = $("#def-size-input").checked ? this.height / 2 : this.height;

    let frameCount = 0;
    let canceled = false;

    alertModal({
      title: "Ouverture de la vidéo",
      body: `<p>Décodage de la vidéo:</p>
      <progress class="progress is-primary" id="extract-decode-progress" value="0" max="100"></progress>`,
      width: "42rem",
      cancel: {
        type: "danger",
        label: "Arrêter",
        cb: ()=>{canceled = true}
      },
      id:"extract-loading-modal"
    });


    let firstFrameTimestamp = 0;
    let isOver = false;

    this.decoder = new VideoDecoder({
      output: (frame) => {

        // compute the progress
        if(frameCount == 0){
          if($("#duration-size-input").checked){
            firstFrameTimestamp = frame.timestamp - (frame.duration);
          } else {
            firstFrameTimestamp = 0;
          }         
        }
        let progress = ((frame.timestamp + frame.duration ) / 1e3 - firstFrameTimestamp / 1e3) / this.decodedVideo.duration * 100;
        // check if the user canceled
        if(canceled){
          if(!isOver){
            isOver = true;
            this.onFinish();
          }

          frame.close();
          return;
        }
        
        // check if the frame is after the last frame
        if(progress >= 100){
          if(!isOver){
            isOver = true;
            this.onFinish();
          }

          frame.close();
          return;
        }

        // Update the progressbar
        $("#extract-decode-progress").value = Math.ceil(progress);

        // check if the frame is before the start
        if($("#duration-size-input").checked && frame.timestamp / 1000000 < $("#start-size-input").value){
          frame.close();
          return;
        }

        // check if the frame is odd
        if($("#fps-size-input").checked && frameCount % 2 == 1){
          frame.close();
          frameCount++;
          return;
        }

        if($("#def-size-input").checked){
          createImageBitmap(frame,{resizeWidth : this.decodedVideo.width / 2, resizeHeight : this.decodedVideo.height / 2, resizeQuality : "medium"}).then((result)=>{
            this.decodedVideo.frames.push(result);
            frame.close();
          })
        } else {
          createImageBitmap(frame).then((result)=>{
            this.decodedVideo.frames.push(result);
            frame.close();
          })
        }

        frameCount++;
      },
      error: function(e) {
        console.error(e);
        alertModal({
          type: "danger",
          title: "Erreur",
          body: `<p>Une erreur est survenue lors du décodage de la vidéo.</p>
            <p class="has-text-justified">Le format de la vidéo n'est pas pris en charge ou la mémoire vidéo est insuffisante pour ouvrir une vidéo de cette taille.</p>`,
          width: "42rem",
          confirm: "OK",
        });
      },
    });

    this.decoder.configure(this.config);

    this.mp4boxfile.setExtractionOptions(this.info.videoTracks[0].id);
    if($("#duration-size-input").checked){
      if(parseInt($("#start-size-input").value) - 5 > 0){
        this.mp4boxfile.seek(parseInt($("#start-size-input").value) - 5);
      }
    }
    this.mp4boxfile.start();
  }

  onSamples(samples){
    // Generate and emit an EncodedVideoChunk for each demuxed sample.
    for (const sample of samples) {
      this.onChunk(new EncodedVideoChunk({
        type: sample.is_sync ? "key" : "delta",
        timestamp: 1e6 * sample.cts / sample.timescale,
        duration: 1e6 * sample.duration / sample.timescale,
        data: sample.data
      }))
    }
  }

  onChunk(chunk){
    if($("#duration-size-input").checked && (chunk.timestamp - chunk.duration) / 1000000 > (parseInt($("#end-size-input").value) + 1)){
      return;
    }

    if($("#duration-size-input").checked && chunk.timestamp / 1000000 < $("#start-size-input").value - 5){
      return; //return if the frame is at least 5s before the start
    }

    if($("#duration-size-input").checked && chunk.timestamp / 1000000 <= $("#start-size-input").value){
      if(!this.keyFrameFound){
        if(chunk.type !== "key"){
          return;
        } else{
          this.keyFrameFound = true; // Find the first keyframe within 5s of the start
        }
      }
    }

    this.decoder.decode(chunk);
  }

  onFinish(){
    if($("#extract-loading-modal")){
      $("#extract-loading-modal").remove();
    }

    let flushVideoDecoder = async () => {
      await this.decoder.flush();
      await this.mp4boxfile.flush();
      this.decodedVideoCB(this.decodedVideo);
    }

    flushVideoDecoder();
  }
}

/*! mp4box 02-11-2024 */