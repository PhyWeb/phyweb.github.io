import {alertModal, showToast} from "../../common/common.js"
import * as MP4Box from "../../common/mp4box/mp4box.all.2.1.2.js";
import { WebDemuxer } from "../../common/web-demuxer/web-demuxer.js";

const $ = document.querySelector.bind(document);

export default class EXTRACTOR {
  constructor() {
    this.checkSizeInfoReady = false;
    this.demuxerType = null;
    this.mp4boxfile = null;
    this.demuxer = null;
    this.height = null;
    this.width = null;
    this.nbSamples = null;
    this.duration = null;
    this.size = 0;
    this.sizeThreshold = 512;
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
      try { this.mp4boxfile.flush(); } catch (e) {}
    }
    if (this.demuxer) {
      try { this.demuxer.destroy(); this.demuxer = null; } catch (e) {}
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

  async checkSize(_file, _checksizeCB, _decodedVideoCB, _forceFilesize = false) {
    this._closeDecoder();
    this.checksizeCB = _checksizeCB;
    this.decodedVideoCB = _decodedVideoCB;
    this.forceFileSize = _forceFilesize;

    this.keyFrameFound = false;
    this.abortFlag = false;

    this.decodedVideo = {
      duration: null,
      width: null,
      height: null,
      frames: [],
      timestamps: []
    }

    let fileToLoad = _file;
    if (!fileToLoad.name) {
      fileToLoad = new File([_file], "video.mp4", { type: _file.type || "video/mp4" });
    }

    if (fileToLoad.name.match(/\.(mp4|m4v)$/i) || fileToLoad.type === 'video/mp4' || fileToLoad.type === 'video/x-m4v') {
      this.demuxerType = 'mp4box';
    } else {
      this.demuxerType = 'web-demuxer';
    }
    
    console.log("[PhyWeb] Demuxer utilisé :", this.demuxerType);

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
          if (this.demuxer) { this.demuxer.destroy(); this.demuxer = null; }
          if (this.mp4boxfile) { this.mp4boxfile.flush(); }
        }
      },
      backgroundNotClickable: true,
      id:"checksize-loading-modal"
    });

    if (this.demuxerType === 'mp4box') {
      this._checkSizeMP4Box(fileToLoad);
    } else {
      this._checkSizeWebDemuxer(fileToLoad);
    }
  }

  _checkSizeMP4Box(_file) {
    let chunksize = 1024 * 1024;
    let fileSize = _file.size;
    let offset = 0;
    this._chunkQueue = [];

    if(this.mp4boxfile) this.mp4boxfile.flush();
    this.mp4boxfile = MP4Box.createFile(true);
    this.mp4boxfile.onError = (e) => {
      this._closeDecoder();
      console.error("MP4Box error: ", e);
      if ($("#checksize-loading-modal")) $("#checksize-loading-modal").remove();
      showToast("Erreur de lecture du fichier vidéo.", "is-danger");
      $("#new-modal")?.classList.add("is-active");
    };
    this.mp4boxfile.onReady = (info) => {
      this._onReadyMP4Box(info);
    }
    this.mp4boxfile.onSamples = (track_id, ref, samples) => this.onSamples(samples);

    var onBlockRead = async (evt) => {
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

      while (this._chunkQueue && this._chunkQueue.length > 1000) {
        await new Promise(r => setTimeout(r, 50));
        if (this.abortFlag) return;
      }

      readBlock(offset, chunksize, _file);
    }

    var readBlock = function(_offset, _length, _f) {
      var r = new FileReader();
      var blob = _f.slice(_offset, _length + _offset);
      r.onload = onBlockRead;
      r.readAsArrayBuffer(blob);
    }
    readBlock(offset, chunksize, _file);
  }

  _onReadyMP4Box(_info){
    this.info = _info;
    if($("#checksize-loading-modal")) $("#checksize-loading-modal").remove();

    const firstTrack = _info?.videoTracks?.[0];
    if (!_info || !_info.videoTracks || _info.videoTracks.length === 0 || !firstTrack || !firstTrack.video || !firstTrack.video.height || !firstTrack.video.width) {
      this.abortFlag = true;
      this._closeDecoder();
      showToast("Aucune piste vidéo trouvée dans ce fichier.", "is-danger");
      $("#new-modal")?.classList.add("is-active");
      return;
    }

    this.track = firstTrack;

    this.rotation = 0;
    if (this.track.matrix) {
      let angle = Math.round(Math.atan2(this.track.matrix[1], this.track.matrix[0]) * (180 / Math.PI));
      if (angle < 0) angle += 360;
      if (angle === 90 || angle === 180 || angle === 270) {
        this.rotation = angle;
      }
    }

    if (this.rotation === 90 || this.rotation === 270) {
      this.width = Math.min(this.track.video.width, this.track.video.height);
      this.height = Math.max(this.track.video.width, this.track.video.height);
    } else {
      this.width = this.track.video.width;
      this.height = this.track.video.height;
    }

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
      codedHeight: this.track.video.height,
      codedWidth: this.track.video.width,
      description: getDescription(trackObj),
    };

    this._finalizeCheckSize();
  }

  async _checkSizeWebDemuxer(_file) {
    if(this.demuxer){
      this.demuxer.destroy();
      this.demuxer = null;
    }

    let progressInterval = setInterval(() => {
        let progressEl = $("#checksize-progress");
        if (progressEl && progressEl.value < 90) progressEl.value += 5;
    }, 100);

    try {
      this.demuxer = new WebDemuxer({
        wasmFilePath: new URL("../../common/web-demuxer/wasm-files/web-demuxer.wasm", import.meta.url).href
      });
      await this.demuxer.load(_file);
      clearInterval(progressInterval);
      if(this.abortFlag) return;
      let progressEl = $("#checksize-progress");
      if (progressEl) progressEl.value = 100;
      await this._onReadyWebDemuxer();
    } catch(e) {
      clearInterval(progressInterval);
      this._closeDecoder();
      if (this.demuxer) { this.demuxer.destroy(); this.demuxer = null; }
      console.error("WebDemuxer error: ", e);
      if ($("#checksize-loading-modal")) $("#checksize-loading-modal").remove();
      showToast("Erreur de lecture du fichier vidéo.", "is-danger");
      $("#new-modal")?.classList.add("is-active");
    }
  }

  async _onReadyWebDemuxer(){
    if($("#checksize-loading-modal")) $("#checksize-loading-modal").remove();
    try {
      const info = await this.demuxer.getMediaInfo();
      const videoStream = info.streams.find(s => s.codec_type_string === 'video');

      if (!videoStream) {
        throw new Error("Aucune piste vidéo valide trouvée");
      }

      this.rotation = 0;
      if (videoStream.tags) {
        const rotateKey = Object.keys(videoStream.tags).find(k => k.toLowerCase() === 'rotate');
        if (rotateKey) {
          this.rotation = parseInt(videoStream.tags[rotateKey], 10) || 0;
        }
      }
      if (!this.rotation && videoStream.side_data_list) {
        const displayMatrix = videoStream.side_data_list.find(sd => sd.side_data_type === 'Display Matrix');
        if (displayMatrix && displayMatrix.rotation) {
          this.rotation = parseInt(displayMatrix.rotation, 10) || 0;
        }
      }
      this.rotation = (this.rotation % 360 + 360) % 360;

      if (this.rotation === 90 || this.rotation === 270) {
        this.width = Math.min(videoStream.width, videoStream.height);
        this.height = Math.max(videoStream.width, videoStream.height);
      } else {
        this.width = videoStream.width;
        this.height = videoStream.height;
      }

      this.nbSamples = parseInt(videoStream.nb_frames) || 0;
      this.duration = videoStream.duration > 0 ? videoStream.duration : info.duration; 
      this.fps = (this.duration > 0 && this.nbSamples > 0) ? (this.nbSamples / this.duration) : 30;
      this.config = await this.demuxer.getDecoderConfig("video");

      const support = await VideoDecoder.isConfigSupported(this.config);
      if (!support.supported) {
        throw new Error(`Codec vidéo non supporté (${this.config.codec})`);
      }

      this._finalizeCheckSize();
    } catch(e) {
      this.abortFlag = true;
      this._closeDecoder();
      console.warn("WebDemuxer check error:", e);
      if (e.message && e.message.includes("Codec vidéo non supporté")) {
        showToast(e.message + ". Veuillez le convertir dans un codec supporté (H.264, H.265, AV1, VP9).", "is-danger");
      } else {
        showToast("Aucune piste vidéo trouvée dans ce fichier.", "is-danger");
      }
      $("#new-modal")?.classList.add("is-active");
    }
  }

  _finalizeCheckSize() {
    $("#def-size-input").checked = false;
    $("#fps-size-input").checked = false;
    $("#duration-size-input").checked = false;
    $("#duration-size-inputs").classList.add("is-hidden");

    this.updateSize();

    if(this.size < this.sizeThreshold && !this.forceFileSize) {
      this.extract();
    } else{
      $("#file-size-modal").classList.add('is-active');
      $("#def-size-label").innerHTML = `&nbsp;(${this.width} / ${this.height} => ${Math.round(this.width / 2)} / ${Math.round(this.height / 2)})`;
      $("#fps-size-label").innerHTML = `&nbsp;(${parseFloat(this.fps.toFixed(2))} => ${parseFloat((this.fps / 2).toFixed(2))}&nbsp;img/s)`;
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
    let estimatedBytesPerPixel = 0.5;
    this.size = Math.ceil(h * w * estimatedBytesPerPixel * nb / (1024*1024));
    const warningEl = $("#file-size-warning");
    if(this.size < this.sizeThreshold) {
      $("#size-label").className = "has-text-success";
      $("#open-resized-video").className = "button is-success";
      $("#open-resized-video").innerHTML = "Ouvrir la vidéo";
      if (warningEl) warningEl.classList.add("is-hidden");
    } else {
      $("#size-label").className = "has-text-danger";
      $("#open-resized-video").className = "button is-danger";
      $("#open-resized-video").innerHTML = "Ouvrir la vidéo malgré sa taille";
      if (warningEl) warningEl.classList.remove("is-hidden");
    }
    $("#size-label").innerHTML = this.size + " Mio";
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
    if (this.demuxerType === 'mp4box' && this.track?.movie_duration && this.track?.movie_timescale) {
      this.decodedVideo.duration = durationReduction
        ? Math.max(0, endTime - startTime) * 1000
        : (this.track.movie_duration * 1000 / this.track.movie_timescale); 
    } else {
      this.decodedVideo.duration = durationReduction
        ? Math.max(0, endTime - startTime) * 1000
        : defaultDuration; 
    }

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

        if (durationReduction && frameTimeSec < startTime && !(isLastVideoSample && savedFrameCount === 0)) {
          frame.close();
          return;
        }

        if (durationReduction && frameTimeSec > endTime && savedFrameCount > 0) {
          isOver = true;
          this.triggerFinish(false);
          frame.close();
          return;
        }

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

        this.decodedVideo.timestamps[currentIndex] = (frame.timestamp - firstFrameTimestamp) / 1e6;

        this._pendingBitmapsCount++;

        const canvasItem = this._acquireCanvas(this.decodedVideo.width, this.decodedVideo.height);
        
        let actualRotation = this.rotation;
        
        // If we expect a 90/270 rotation, check if the decoder already applied it
        // by comparing the frame's orientation to the intended canvas orientation.
        if (actualRotation === 90 || actualRotation === 270) {
            let canvasIsPortrait = this.decodedVideo.width < this.decodedVideo.height;
            let frameIsPortrait = frame.displayWidth < frame.displayHeight;
            if (canvasIsPortrait === frameIsPortrait) {
                actualRotation = 0; // Prevent double rotation
            }
        }

        canvasItem.ctx.save();
        if (actualRotation === 90) {
            canvasItem.ctx.translate(this.decodedVideo.width, 0);
            canvasItem.ctx.rotate(Math.PI / 2);
        } else if (actualRotation === 180) {
            canvasItem.ctx.translate(this.decodedVideo.width, this.decodedVideo.height);
            canvasItem.ctx.rotate(Math.PI);
        } else if (actualRotation === 270) {
            canvasItem.ctx.translate(0, this.decodedVideo.height);
            canvasItem.ctx.rotate(3 * Math.PI / 2);
        }

        const isRotated = (actualRotation === 90 || actualRotation === 270);
        
        // Use frame's native display dimensions to avoid deformation
        let fw = frame.displayWidth;
        let fh = frame.displayHeight;
        
        // Calculate the scale to fit the canvas while preserving aspect ratio
        let scale = Math.min(
            this.decodedVideo.width / (isRotated ? fh : fw),
            this.decodedVideo.height / (isRotated ? fw : fh)
        );

        let drawW = fw * scale;
        let drawH = fh * scale;
        
        // Center the frame inside the canvas bounds
        // In the rotated context, X and Y correspond to different canvas dimensions
        let dx = (isRotated ? this.decodedVideo.height - drawW : this.decodedVideo.width - drawW) / 2;
        let dy = (isRotated ? this.decodedVideo.width - drawH : this.decodedVideo.height - drawH) / 2;

        canvasItem.ctx.drawImage(frame, dx, dy, drawW, drawH);
        canvasItem.ctx.restore();
        
        frame.close();

        canvasItem.canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 })
        .then(async (blob) => {
          this._releaseCanvas(canvasItem);

          if (canceled || this._isCanceled) {
            this._decrementPendingBitmaps();
            return;
          }

          const blobUrl = URL.createObjectURL(blob);
          const img = new Image();
          img.src = blobUrl;
          if (img.decode) {
            try { await img.decode(); } catch (_) {}
          }
          this.decodedVideo.frames[currentIndex] = img; 
          this._decrementPendingBitmaps();
        }).catch((e) => {
          this._releaseCanvas(canvasItem);
          this._decrementPendingBitmaps();
        });
      },
      error: (e) => {
        console.error("VideoDecoder error:", e);
        this._closeDecoder();
        if ($("#extract-loading-modal")) $("#extract-loading-modal").remove();
        let msg = "Erreur lors du décodage de la vidéo.";
        if (e.name === "NotSupportedError") {
          msg = "Codec vidéo non supporté. Veuillez le convertir dans un codec supporté (H.264, H.265, AV1, VP9).";
        }
        showToast(msg, "is-danger");
        $("#new-modal")?.classList.add("is-active");
        this.triggerFinish(true);
      },
    });

    this.decoder.configure(this.config);

    if (this.demuxerType === 'mp4box') {
      const trackId = this.track?.id ?? this.info?.videoTracks?.[0]?.id;
      if (trackId !== undefined && this.mp4boxfile?.setExtractionOptions) {
        this.mp4boxfile.setExtractionOptions(trackId);
      }
      if (durationReduction && startTime > 0) {
        this.mp4boxfile.seek(startTime, true);
      }
      this.mp4boxfile.start();
    } else {
      try {
        const startS = durationReduction && startTime > 0 ? startTime : 0;
        const reader = this.demuxer.read("video", startS, undefined, 1).getReader();

        const processStream = async () => {
          while (!canceled && !this._finishTriggered && !this._isCanceled) {
            if (this._pendingBitmapsCount > 15 || (this.decoder && this.decoder.decodeQueueSize > 60)) {
              await new Promise((resolve) => setTimeout(resolve, 50));
              continue;
            }
            
            const { done, value: chunk } = await reader.read();
            
            if (done) {
               this._allSamplesReceived = true;
               if (this.decoder && this.decoder.decodeQueueSize === 0 && !this._finishTriggered) {
                  this.triggerFinish(false);
               } else if (!this._finishTriggered) {
                  const finishCheck = setInterval(() => {
                    if (!this.decoder || this.decoder.decodeQueueSize === 0 || this._finishTriggered) {
                      clearInterval(finishCheck);
                      this.triggerFinish(false);
                    }
                  }, 50);
               }
               break;
            }
            
            if (chunk) {
              try {
                if (this.decoder && this.decoder.state === "configured") {
                  this.decoder.decode(chunk);
                }
              } catch (e) {
                if (e.name === "DataError" || (e.message && e.message.includes("key frame"))) {
                  const buffer = new ArrayBuffer(chunk.byteLength);
                  chunk.copyTo(buffer);
                  const chunkToDecode = new EncodedVideoChunk({
                    type: "key",
                    timestamp: chunk.timestamp,
                    duration: chunk.duration,
                    data: buffer
                  });
                  try {
                    if (this.decoder && this.decoder.state === "configured") {
                      this.decoder.decode(chunkToDecode);
                    }
                  } catch (e2) {
                    // Ignore secondary exception
                  }
                } else {
                  console.error("Decoder decode error:", e);
                }
              }
            }
          }
        };

        processStream();
      } catch (e) {
        console.error("Erreur de flux WebDemuxer", e);
        this.triggerFinish(true);
      }
    }
  }

  // MP4Box Callbacks
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

      if (this._pendingBitmapsCount > 15 || (this.decoder && this.decoder.decodeQueueSize > 60)) {
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

    if (this._chunkQueue.length > 0 && !this._finishTriggered) {
      this._processChunkQueue();
      return;
    }

    if (this._allSamplesReceived && this._chunkQueue.length === 0 && !this._finishTriggered) {
      this.triggerFinish(false);
    }
  }
}
