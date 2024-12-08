import {alertModal} from "../../common/common.js"

const $ = document.querySelector.bind(document);

/*----------------------------------------------------------------------------------------------
--------------------------------------------CHECK SIZE------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class CHECKSIZE {
  constructor(_extractor) {
    this.extractor = _extractor;

    this.height = null;
    this.width = null;
    this.nbSamples = null;
    this.duration = null;

    this.size = 0;

    this.sizeThreshold = 1024;
  }   

  load(_file, _player){
    $("#open-modal").classList.remove("is-active");
    alertModal({
      title: "Analyse de la vidéo",
      body: `<progress class="progress is-primary" id="checksize-progress" value="0" max="100"></progress>`,
      width: "42rem",
      cancel: {
        type: "danger",
        label: "Annuler",
        cb: ()=>{this.extractor.checkSizeInfoReady = true}
      },
      backgroundNotClickable: true,
      id:"checksize-loading-modal"
    });

    this.extractor.checkSize(_file, (info)=>{
      console.log("Video info : ", info)

    $("#checksize-loading-modal").remove();

      let track = info.videoTracks[0];
      this.height = track.video.height;
      this.width = track.video.width;
      this.nbSamples = track.nb_samples;
      this.duration = track.movie_duration / track.movie_timescale;
      this.fps = this.nbSamples / this.duration;

      $("#def-size-input").checked = false;
      $("#fps-size-input").checked = false;
      $("#duration-size-input").checked = false;
      $("#duration-size-inputs").classList.add("is-hidden");

      this.updateSize();

      console.log(`video size ${this.size}  MiB`)

      // Check if the video is too big
      if(this.size < this.sizeThreshold) {
        _player.load(_file);
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
    });
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
}