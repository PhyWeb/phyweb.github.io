import {alertModal} from "../../common/common.js"

import * as MP4Box from "../../common/mp4box/mp4box.all.2.1.2.js";

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
    this.sizeThreshold = 512; // 512 Mio
    this._finishTriggered = false;
    this._pendingBitmapsCount = 0;
  }

  triggerFinish = (wasCanceled = false) => {
    if (this._finishTriggered) return;
    this._finishTriggered = true;
    
    const checkAndFinish = () => {
      if (this._pendingBitmapsCount <= 0 || wasCanceled) {
        this.onFinish(wasCanceled);
      } else {
        setTimeout(checkAndFinish, 50);
      }
    };
    checkAndFinish();
  };

  checkSize(_file, _checksizeCB, _decodedVideoCB, _forceFilesize = false) {
    this.checksizeCB = _checksizeCB;
    this.decodedVideoCB = _decodedVideoCB;
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
      if(this.abortFlag) return;
      if (offset >= fileSize) {
        this.mp4boxfile.flush(); 
        return;
      }
      if (evt.target.error == null) {
        let progressEl = $("#checksize-progress");
        if(progressEl) progressEl.value = Math.ceil(100*offset/fileSize);
        let buffer = evt.target.result;
        buffer.fileStart = offset;
        this.mp4boxfile.appendBuffer(buffer);
        offset += evt.target.result.byteLength;
      } else {
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
    this.info = _info;
    if($("#checksize-loading-modal")) $("#checksize-loading-modal").remove();

    this.track = _info.videoTracks[0];
    this.height = this.track.video.height;
    this.width = this.track.video.width;
    this.nbSamples = this.track.nb_samples;
    this.duration = this.track.movie_duration / this.track.movie_timescale;
    this.fps = this.nbSamples / this.duration;

    let getDescription = (track) => {
      for (const entry of track.mdia.minf.stbl.stsd.entries) {
        if (entry.avcC || entry.hvcC || entry.av1C || entry.vpcC) {
          const stream = new MP4Box.DataStream(undefined, 0, true);
          if (entry.avcC) entry.avcC.write(stream);
          if (entry.hvcC) entry.hvcC.write(stream);
          if (entry.av1C) entry.av1C.write(stream);
          if (entry.vpcC) entry.vpcC.write(stream);
          return new Uint8Array(stream.buffer, 8);
        }
      }
    }

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

    if(this.size < this.sizeThreshold && !this.forceFileSize) {
      this.extract();
    } else{
      $("#file-size-modal").classList.add('is-active');
      $("#def-size-label").innerHTML = ` ( ${this.width} / ${this.height} => ${this.width / 2} / ${this.height / 2} )`;
      $("#fps-size-label").innerHTML = ` ( ${this.fps.toFixed(2)/1} => ${this.fps.toFixed(2)/2} img/s )`;
      $("#duration-size-label").innerHTML = this.duration.toFixed(2);
      $("#file-slider").noUiSlider.reset();
      $("#file-slider").noUiSlider.updateOptions({ range:{ 'min': 0, 'max': this.duration } });

      this.updateSize();
      $("#def-size-input").addEventListener("click", () => this.updateSize());
      $("#fps-size-input").addEventListener("click", () => this.updateSize());
      $("#duration-size-input").addEventListener("click", ()=>{
        if($("#duration-size-input").checked) $("#duration-size-inputs").classList.remove("is-hidden");
        else $("#duration-size-inputs").classList.add("is-hidden");
        this.updateSize();
      });
      $("#start-size-input").addEventListener("change", () => this.updateSize());
      $("#end-size-input").addEventListener("change", () => this.updateSize());
    }
  }

  updateSize(){
    let h = $("#def-size-input").checked ? this.height / 2 : this.height;
    let w = $("#def-size-input").checked ? this.width / 2 : this.width;
    let fps = $("#fps-size-input").checked ? this.fps / 2 : this.fps;
    let duration = $("#duration-size-input").checked ? ($("#end-size-input").value - $("#start-size-input").value) : this.duration;
    let nb = duration * fps;
    // ~0.5 octets par pixel compressé au lieu de 4 octets bruts
    let estimatedBytesPerPixel = 0.5;
    this.size = Math.ceil(h * w * estimatedBytesPerPixel * nb / (1024*1024));
    if(this.size < this.sizeThreshold) {
      $("#size-label").className = "has-text-success";
      $("#open-resized-video").className = "button is-success";
      $("#open-resized-video").innerHTML = "Ouvrir la vidéo";
    } else {
      $("#size-label").className = "has-text-danger";
      $("#open-resized-video").className = "button is-danger";
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
    this._finishTriggered = false;
    this._pendingBitmapsCount = 0;

    alertModal({
      title: "Ouverture de la vidéo",
      body: `<p>Décodage de la vidéo:</p><progress class="progress is-primary" id="extract-decode-progress" value="0" max="100"></progress>`,
      width: "42rem",
      cancel: { type: "danger", label: "Arrêter", cb: ()=>{canceled = true} },
      id:"extract-loading-modal"
    });

    let firstFrameTimestamp = 0;
    let isOver = false;

    // Création du canvas hors-champ pour la compression
    const offscreenCanvas = new OffscreenCanvas(this.decodedVideo.width, this.decodedVideo.height);
    const offscreenCtx = offscreenCanvas.getContext("2d", { alpha: false }); // alpha: false optimise le rendu JPEG

    this.decoder = new VideoDecoder({
      output: (frame) => {
        // Capture de l'index actuel pour garantir le bon ordre des images
        let currentIndex = frameCount; 
        
        if(frameCount == 0) firstFrameTimestamp = $("#duration-size-input").checked ? (frame.timestamp - frame.duration) : 0;
        let progress = ((frame.timestamp + frame.duration ) / 1e3 - firstFrameTimestamp / 1e3) / this.decodedVideo.duration * 100;

        if (this.nbSamples && !$("#duration-size-input").checked && !$("#fps-size-input").checked) {
          if (frameCount + 1 >= this.nbSamples) {
            if(!isOver){ isOver = true; this.triggerFinish(false); }
          }
        }

        if(canceled){
          if(!isOver) { isOver = true; this.triggerFinish(true); }
          frame.close(); return;
        }
        
        if(progress >= 99.9 && !isOver){
          isOver = true; this.triggerFinish(false);
          frame.close(); return;
        }

        let progressEl = $("#extract-decode-progress");
        if(progressEl) progressEl.value = Math.ceil(progress);

        if($("#duration-size-input").checked && frame.timestamp / 1000000 < $("#start-size-input").value){
          frame.close(); return;
        }

        if($("#fps-size-input").checked && frameCount % 2 == 1){
          frame.close(); frameCount++; return;
        }

        this._pendingBitmapsCount++;
        
        // Dessiner la frame sur le canvas
        offscreenCtx.drawImage(frame, 0, 0, this.decodedVideo.width, this.decodedVideo.height);
        frame.close(); // On peut fermer la frame immédiatement après l'avoir dessinée

        // Convertir le canvas en Blob JPEG avec qualité 0.85
        offscreenCanvas.convertToBlob({ type: "image/jpeg", quality: 0.85 })
        .then((blob) => {
          // On génère une URL locale pour le Blob pour faciliter son affichage dans le player
          const blobUrl = URL.createObjectURL(blob);
          
          // On crée un élément Image standard
          const img = new Image();
          img.src = blobUrl;
          
          // On stocke l'élément Image prêt à être dessiné
          this.decodedVideo.frames[currentIndex] = img; 
          this._pendingBitmapsCount--;
        }).catch((e) => {
          console.error("Erreur de conversion Blob:", e);
          this._pendingBitmapsCount--;
        });
        
        frameCount++;
      },
      error: (e) => { console.error(e); },
    });

    this.decoder.configure(this.config);
    this.mp4boxfile.setExtractionOptions(this.info.videoTracks[0].id);
    if($("#duration-size-input").checked){
      let seekTime = parseInt($("#start-size-input").value) - 5;
      if(seekTime > 0) this.mp4boxfile.seek(seekTime);
    }
    this.mp4boxfile.start();
  }

  onSamples(samples){
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i];
      this.onChunk(new EncodedVideoChunk({
        type: sample.is_sync ? "key" : "delta",
        timestamp: 1e6 * sample.cts / sample.timescale,
        duration: 1e6 * sample.duration / sample.timescale,
        data: sample.data
      }));
      if (sample.number + 1 >= this.nbSamples) this.decoder.flush();
    }
  }

  onChunk(chunk){
    if ($("#duration-size-input").checked && (chunk.timestamp - chunk.duration) / 1000000 > (parseInt($("#end-size-input").value) + 1)) {
      this.triggerFinish(false); return;
    }
    if($("#duration-size-input").checked && chunk.timestamp / 1000000 < $("#start-size-input").value - 5) return;
    if($("#duration-size-input").checked && chunk.timestamp / 1000000 <= $("#start-size-input").value){
      if(!this.keyFrameFound){
        if(chunk.type !== "key") return;
        else this.keyFrameFound = true;
      }
    }

    // --- SÉCURITÉ RAM : Si le processeur a plus de 15 images de retard en compression ---
    // On attend un peu avant de décoder la suite pour éviter de saturer la mémoire.
    if (this._pendingBitmapsCount > 15) {
      setTimeout(() => this.onChunk(chunk), 50);
      return;
    }

    this.decoder.decode(chunk);
  }

  onFinish = (wasCanceled) => {
    // On ne retire la modale que si on est sûr d'avoir tout fini
    let finalize = async () => {
      await this.decoder.flush();
      await this.mp4boxfile.flush();
      
      if ($('#extract-loading-modal')) $('#extract-loading-modal').remove();

    if (wasCanceled) {
        for (const frameImg of this.decodedVideo.frames) {
          if (frameImg && frameImg.src) {
            URL.revokeObjectURL(frameImg.src);
          }
        }
        this.decodedVideo.frames = [];
        return;
      }
      this.decodedVideoCB(this.decodedVideo);
    }
    finalize();
  }
}