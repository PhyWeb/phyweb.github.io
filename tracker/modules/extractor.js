import {alertModal, showToast} from "../../common/common.js"

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
    this.keyFrameFound = false;
    this._pendingBitmapsCount = 0;
    this._canvasPool = [];
    this._chunkQueue = [];
    this._isProcessingQueue = false;
    this._isCanceled = false;
    this._allSamplesReceived = false;
    this._receivedSamplesCount = 0;
    this._pendingDrainResolve = null;
    this.decodedVideo = {
      duration: null,
      width: null,
      height: null,
      frames: [],
      timestamps: []
    };
    this.decoder = null;
  }

  _closeDecoder() {
    if (this.decoder) {
      try {
        if (this.decoder.state !== "closed" && typeof this.decoder.close === "function") {
          this.decoder.close();
        }
      } catch (e) {
        console.warn("Erreur lors de la fermeture du VideoDecoder:", e);
      }
      this.decoder = null;
    }
  }

  _decrementPendingBitmaps() {
    this._pendingBitmapsCount = Math.max(0, this._pendingBitmapsCount - 1);
    if (this._pendingDrainResolve && this._pendingBitmapsCount <= 15) {
      const resolve = this._pendingDrainResolve;
      this._pendingDrainResolve = null;
      resolve();
    }
  }

  _acquireCanvas(width, height) {
    if (!this._canvasPool) {
      this._canvasPool = [];
    }
    let item = this._canvasPool.pop();
    if (!item) {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d", { alpha: false });
      item = { canvas, ctx };
    }
    return item;
  }

  _releaseCanvas(item) {
    if (this._canvasPool && item) {
      this._canvasPool.push(item);
    }
  }

  _clearCanvasPool() {
    if (this._canvasPool) {
      this._canvasPool.length = 0;
    }
  }

  triggerFinish = async (wasCanceled = false) => {
    if (wasCanceled) {
      this._isCanceled = true;
    }
    if (this._finishTriggered) return;
    this._finishTriggered = true;

    if (this._pendingDrainResolve) {
      const resolve = this._pendingDrainResolve;
      this._pendingDrainResolve = null;
      resolve();
    }
    this._chunkQueue = [];

    if (wasCanceled) {
      this._closeDecoder();
    } else {
      try {
        if (this.decoder && this.decoder.state === "configured") {
          await this.decoder.flush();
        }
      } catch (e) {
        console.warn("Decoder flush warning:", e);
      }
      this._closeDecoder();
    }

    if (this.mp4boxfile) {
      try {
        this.mp4boxfile.flush();
      } catch (e) {
        console.warn("MP4Box flush warning:", e);
      }
    }

    const checkAndFinish = () => {
      if (this._pendingBitmapsCount <= 0 || wasCanceled || this._isCanceled) {
        if ($('#extract-loading-modal')) $('#extract-loading-modal').remove();

        this._closeDecoder();

        if (wasCanceled || this._isCanceled) {
          this._clearCanvasPool();
          if (this.decodedVideo && this.decodedVideo.frames) {
            for (const frameImg of this.decodedVideo.frames) {
              if (frameImg && frameImg.src) {
                URL.revokeObjectURL(frameImg.src);
              }
            }
            this.decodedVideo.frames = [];
            this.decodedVideo.timestamps = [];
          }
          return;
        }

        this._clearCanvasPool();

        if (this.decodedVideo && this.decodedVideo.timestamps) {
          const timestamps = this.decodedVideo.timestamps;
          if (timestamps.length > 1) {
            const last = timestamps.length - 1;
            let dt = timestamps[last] - timestamps[last - 1];
            if (dt <= 0) {
              dt = (timestamps[last] - timestamps[0]) / last;
            }
            if (dt <= 0 && this.fps) {
              dt = 1 / this.fps;
            }
            if (dt <= 0) {
              dt = 1 / 30;
            }
            this.decodedVideo.duration = (timestamps[last] + dt - timestamps[0]) * 1000;
          } else if (timestamps.length === 1 && (!this.decodedVideo.duration || this.decodedVideo.duration <= 0)) {
            this.decodedVideo.duration = 1000 / (this.fps || 30);
          }
        }

        if (this.decodedVideoCB) {
          this.decodedVideoCB(this.decodedVideo);
        }
      } else {
        setTimeout(checkAndFinish, 30);
      }
    };
    checkAndFinish();
  };

  checkSize(_file, _checksizeCB, _decodedVideoCB, _forceFilesize = false) {
    this._closeDecoder();
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
      frames: [],
      timestamps: []
    }

    const openModal = $("#open-modal");
    if (openModal) openModal.classList.remove("is-active");
    const newModal = $("#new-modal");
    if (newModal) newModal.classList.remove("is-active");
    alertModal({
      title: "Analyse de la vidéo",
      body: `<progress class="progress is-primary" id="checksize-progress" value="0" max="100"></progress>`,
      width: "42rem",
      cancel: {
        type: "danger",
        label: "Annuler",
        cb: () => {
          this.abortFlag = true;
          this._closeDecoder();
        }
      },
      backgroundNotClickable: true,
      id:"checksize-loading-modal"
    });

    if(this.mp4boxfile){
      this.mp4boxfile.flush();
    }
    this.mp4boxfile = MP4Box.createFile(true);
    this.mp4boxfile.onError = (e) => {
      this._closeDecoder();
      console.error("MP4Box error: ", e);
      if ($("#checksize-loading-modal")) $("#checksize-loading-modal").remove();
      showToast("Erreur de lecture du fichier vidéo.", "is-danger");
      $("#new-modal")?.classList.add("is-active");
    };
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
        if ($("#checksize-loading-modal")) $("#checksize-loading-modal").remove();
        showToast("Erreur lors de la lecture du fichier.", "is-danger");
        $("#new-modal")?.classList.add("is-active");
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

    const firstTrack = _info?.videoTracks?.[0];
    if (!_info || !_info.videoTracks || _info.videoTracks.length === 0 || !firstTrack || !firstTrack.video || !firstTrack.video.height || !firstTrack.video.width) {
      this.abortFlag = true;
      this._closeDecoder();
      console.warn("Aucune piste vidéo valide trouvée");
      showToast("Aucune piste vidéo trouvée dans ce fichier.", "is-danger");
      $("#new-modal")?.classList.add("is-active");
      return;
    }

    this.track = firstTrack;
    this.height = this.track.video.height;
    this.width = this.track.video.width;
    this.nbSamples = this.track.nb_samples || 0;
    const movieTimescale = this.track.movie_timescale || 1;
    this.duration = (this.track.movie_duration && movieTimescale > 0) ? (this.track.movie_duration / movieTimescale) : 0;
    this.fps = (this.duration > 0 && this.nbSamples > 0) ? (this.nbSamples / this.duration) : 30;

    let getDescription = (track) => {
      if (!track || !track.mdia?.minf?.stbl?.stsd?.entries) return undefined;
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
      return undefined;
    }

    const trackObj = (this.mp4boxfile && typeof this.mp4boxfile.getTrackById === "function")
      ? this.mp4boxfile.getTrackById(this.track.id)
      : null;

    this.config = {
      codec: this.track.codec,
      codedHeight: this.height,
      codedWidth: this.width,
      description: getDescription(trackObj),
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
      const sliderMax = (this.duration && this.duration > 0) ? this.duration : 0.001;
      $("#duration-size-label").innerHTML = (this.duration || 0).toFixed(2);
      $("#file-slider").noUiSlider.updateOptions({
        range: { 'min': 0, 'max': sliderMax },
        start: [0, sliderMax],
        margin: null
      });
      $("#file-slider").noUiSlider.set([0, sliderMax]);

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
    let duration = this.duration || 0;
    if ($("#duration-size-input").checked) {
      const rawStart = parseFloat($("#start-size-input").value);
      const rawEnd = parseFloat($("#end-size-input").value);
      const start = Math.min(isNaN(rawStart) ? 0 : rawStart, isNaN(rawEnd) ? 0 : rawEnd);
      const end = Math.max(isNaN(rawStart) ? 0 : rawStart, isNaN(rawEnd) ? 0 : rawEnd);
      duration = Math.max(0, end - start);
    }
    let nb = Math.max(1, duration * fps);
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
    this._closeDecoder();
    this.checksizeCB()

    const durationReduction = $("#duration-size-input").checked;
    const fpsReduction = $("#fps-size-input").checked;
    const defReduction = $("#def-size-input").checked;

    const rawStart = durationReduction ? parseFloat($("#start-size-input").value) : 0;
    const rawEnd = durationReduction ? parseFloat($("#end-size-input").value) : Infinity;
    const startTime = Math.min(isNaN(rawStart) ? 0 : rawStart, isNaN(rawEnd) ? Infinity : rawEnd);
    const endTime = Math.max(isNaN(rawStart) ? 0 : rawStart, isNaN(rawEnd) ? Infinity : rawEnd);

    const defaultDuration = (this.duration || 0) * 1000;
    this.decodedVideo.duration = durationReduction
      ? Math.max(0, endTime - startTime) * 1000
      : ((this.track?.movie_duration && this.track?.movie_timescale) ? (this.track.movie_duration * 1000 / this.track.movie_timescale) : defaultDuration); 
    this.decodedVideo.width = defReduction ? this.width / 2 : this.width;
    this.decodedVideo.height = defReduction ? this.height / 2 : this.height;
    this.decodedVideo.frames = [];
    this.decodedVideo.timestamps = [];

    let candidateFrameCount = 0;
    let savedFrameCount = 0;
    let decodedFrameCount = 0;
    let canceled = false;
    this._finishTriggered = false;
    this.keyFrameFound = false;
    this._pendingBitmapsCount = 0;
    this._clearCanvasPool();
    this._chunkQueue = [];
    this._isProcessingQueue = false;
    this._isCanceled = false;
    this._allSamplesReceived = false;
    this._receivedSamplesCount = 0;
    this._pendingDrainResolve = null;

    alertModal({
      title: "Ouverture de la vidéo",
      body: `<p>Décodage de la vidéo:</p><progress class="progress is-primary" id="extract-decode-progress" value="0" max="100"></progress>`,
      width: "42rem",
      cancel: {
        type: "danger",
        label: "Arrêter",
        cb: () => {
          canceled = true;
          this.triggerFinish(true);
        }
      },
      id: "extract-loading-modal"
    });

    let firstFrameTimestamp = null;
    let isOver = false;

    this.decoder = new VideoDecoder({
      output: (frame) => {
        if (isOver || canceled) {
          if (canceled && !isOver) {
            isOver = true;
            this.triggerFinish(true);
          }
          frame.close();
          return;
        }

        decodedFrameCount++;
        const frameTimeSec = frame.timestamp / 1e6;
        const isLastVideoSample = this.nbSamples && (decodedFrameCount >= this.nbSamples);

        // Frames before start time (sauf si c'est la toute dernière frame de la vidéo et qu'aucune frame n'a été enregistrée)
        if (durationReduction && frameTimeSec < startTime && !(isLastVideoSample && savedFrameCount === 0)) {
          frame.close();
          return;
        }

        // Frame is after end time: finish extraction immediately
        // Sécurité : si aucune frame n'a encore été enregistrée, on conserve au moins la première frame disponible >= startTime
        if (durationReduction && frameTimeSec > endTime && savedFrameCount > 0) {
          isOver = true;
          this.triggerFinish(false);
          frame.close();
          return;
        }

        // FPS reduction: keep 1 frame out of 2
        if (fpsReduction && candidateFrameCount % 2 === 1) {
          candidateFrameCount++;
          frame.close();
          return;
        }
        candidateFrameCount++;

        if (firstFrameTimestamp === null) {
          firstFrameTimestamp = frame.timestamp;
        }

        let progress = durationReduction
          ? (this.decodedVideo.duration > 0
              ? Math.min(100, Math.max(0, ((frame.timestamp - firstFrameTimestamp) / 1e3 + (frame.duration / 1e3)) / this.decodedVideo.duration * 100))
              : 100)
          : (this.nbSamples ? ((savedFrameCount + 1) / this.nbSamples * 100) : 100);

        let progressEl = $("#extract-decode-progress");
        if (progressEl) progressEl.value = Math.ceil(progress);

        if (this.nbSamples && !durationReduction && !fpsReduction) {
          if (savedFrameCount + 1 >= this.nbSamples) {
            isOver = true;
            this.triggerFinish(false);
          }
        }

        let currentIndex = savedFrameCount;
        savedFrameCount++;

        // Timestamp in seconds relative to the first kept frame
        this.decodedVideo.timestamps[currentIndex] = (frame.timestamp - firstFrameTimestamp) / 1e6;

        this._pendingBitmapsCount++;

        // Obtenir un canvas dédié depuis le pool pour éviter les courses critiques asynchrones
        const canvasItem = this._acquireCanvas(this.decodedVideo.width, this.decodedVideo.height);
        
        // Dessiner la frame sur son canvas dédié
        canvasItem.ctx.drawImage(frame, 0, 0, this.decodedVideo.width, this.decodedVideo.height);
        frame.close(); // On peut fermer la frame immédiatement après l'avoir dessinée

        // Convertir le canvas en Blob JPEG avec qualité 0.85
        canvasItem.canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 })
        .then(async (blob) => {
          this._releaseCanvas(canvasItem);

          // On génère une URL locale pour le Blob pour faciliter son affichage dans le player
          const blobUrl = URL.createObjectURL(blob);
          
          // On crée un élément Image standard
          const img = new Image();
          img.src = blobUrl;
          if (img.decode) {
            try {
              await img.decode();
            } catch (_) {}
          }
          
          // On stocke l'élément Image prêt à être dessiné
          this.decodedVideo.frames[currentIndex] = img; 
          this._decrementPendingBitmaps();
        }).catch((e) => {
          this._releaseCanvas(canvasItem);
          console.error("Erreur de conversion Blob:", e);
          this._decrementPendingBitmaps();
        });
      },
      error: (e) => {
        console.error("VideoDecoder error:", e);
        this._closeDecoder();
        if ($("#extract-loading-modal")) $("#extract-loading-modal").remove();
        showToast("Erreur lors du décodage de la vidéo.", "is-danger");
        $("#new-modal")?.classList.add("is-active");
        this.triggerFinish(true);
      },
    });

    this.decoder.configure(this.config);
    const trackId = this.track?.id ?? this.info?.videoTracks?.[0]?.id;
    if (trackId !== undefined && this.mp4boxfile?.setExtractionOptions) {
      this.mp4boxfile.setExtractionOptions(trackId);
    }
    if (durationReduction && startTime > 0) {
      this.mp4boxfile.seek(startTime, true);
    }
    this.mp4boxfile.start();
  }

  onSamples(samples){
    if (this._finishTriggered) return;

    for (let i = 0; i < samples.length; i++) {
      if (this._finishTriggered) break;
      const sample = samples[i];
      this._receivedSamplesCount = (this._receivedSamplesCount || 0) + 1;
      if (this.nbSamples && ((sample.number !== undefined && sample.number + 1 >= this.nbSamples) || (this._receivedSamplesCount >= this.nbSamples))) {
        this._allSamplesReceived = true;
      }
      this.onChunk(new EncodedVideoChunk({
        type: sample.is_sync ? "key" : "delta",
        timestamp: 1e6 * sample.cts / sample.timescale,
        duration: 1e6 * sample.duration / sample.timescale,
        data: sample.data
      }));
    }
    this._processChunkQueue();
  }

  onChunk(chunk){
    if ($("#duration-size-input") && $("#duration-size-input").checked) {
      const rawEnd = parseFloat($("#end-size-input").value);
      const rawStart = parseFloat($("#start-size-input").value);
      const startTime = Math.min(isNaN(rawStart) ? 0 : rawStart, isNaN(rawEnd) ? Infinity : rawEnd);
      const endTime = Math.max(isNaN(rawStart) ? 0 : rawStart, isNaN(rawEnd) ? Infinity : rawEnd);
      if ((chunk.timestamp - chunk.duration) / 1e6 > endTime + 0.2) {
        return;
      }
      if (!this.keyFrameFound) {
        if (chunk.type !== "key") return;
        this.keyFrameFound = true;
      }
    }

    this._chunkQueue.push(chunk);
    this._processChunkQueue();
  }

  async _processChunkQueue() {
    if (this._isProcessingQueue) return;
    this._isProcessingQueue = true;

    while (this._chunkQueue.length > 0) {
      if (this._finishTriggered) {
        this._chunkQueue = [];
        break;
      }

      // --- SÉCURITÉ RAM : Si le processeur a plus de 15 images de retard en compression ---
      // On attend que la mémoire se libère avant de décoder la suite.
      if (this._pendingBitmapsCount > 15) {
        await new Promise((resolve) => {
          const timer = setTimeout(() => {
            if (this._pendingDrainResolve === onDrain) {
              this._pendingDrainResolve = null;
            }
            resolve();
          }, 50);
          const onDrain = () => {
            clearTimeout(timer);
            resolve();
          };
          this._pendingDrainResolve = onDrain;
        });
        continue;
      }

      const chunk = this._chunkQueue.shift();
      try {
        if (this.decoder && this.decoder.state === "configured") {
          this.decoder.decode(chunk);
        }
      } catch (e) {
        console.error("Decoder decode error:", e);
      }
    }

    this._isProcessingQueue = false;

    // Relancer au cas où de nouveaux chunks ont été ajoutés pendant la transition
    if (this._chunkQueue.length > 0 && !this._finishTriggered) {
      this._processChunkQueue();
      return;
    }

    // Si tous les échantillons du fichier ont été reçus et que la file est vide
    if (this._allSamplesReceived && this._chunkQueue.length === 0 && !this._finishTriggered) {
      this.triggerFinish(false);
    }
  }
}