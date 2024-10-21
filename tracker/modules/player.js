import CHECKSIZE from "./checksize.js"

const $ = document.querySelector.bind(document);

function isNumber(str) {
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
  !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

/*----------------------------------------------------------------------------------------------
----------------------------------------------PLAYER--------------------------------------------
----------------------------------------------------------------------------------------------*/
export default class PLAYER {
  constructor(_videoContainer, _canvas, _measurement, _extractor) {
    this.videoContainer = _videoContainer;
    this.videoCanvas = _canvas;

    this.ctx = this.videoCanvas.getContext("2d"); 
    this.extractor = _extractor;

    this.measurement = _measurement;

    this.checkSize = new CHECKSIZE(this.extractor);

    this.pauseFlag = false;
    this.originFlag = "none";

    this.point = { x: 0, y: 0 };
    this.distPoint = { x: 0, y: 0 };

    this.currentFrame = 0;
    this.currentPoint = 0;

    this.magnifier = false;

    this.videoCanvas.addEventListener("mousemove", this.onMouseMove);
    this.videoCanvas.addEventListener("click", this.onClick);

    this.animationFrameRequest;
  }

  checkVideoSize(_file){
    this.checkSize.load(_file,this);
  }

  load(_path, _defResize = false, _fpsResize = false, _durationResize = false){
    // Stop loop
    cancelAnimationFrame(this.animationFrameRequest);

    let durationResize = {
      checked: _durationResize,
      start: parseInt($("#start-size-input").value),
      end: parseInt($("#end-size-input").value),
    }

    this.extractor.extract(_path,_defResize,_fpsResize,durationResize,(_decodedVideo) => {
      console.log(_decodedVideo);
      this.decodedVideo = _decodedVideo;
      this.currentFrame = 0;
      this.currentPoint = 0;



      $("#video-controls").classList.remove("is-hidden");
      $("#magnifier-button").classList.remove("is-hidden");
      $("#handler-wrapper").classList.remove("is-hidden");
      $("#background-arrow").classList.add("is-hidden");
      //$("#right-column").classList.add("is-flex");
      $(".handler").style.display= "block";
      this.videoCanvas.style.display= "block";

      console.log("video loaded");
      this.measurement.init(this.decodedVideo, this);

      $("#etalonnage-button").click();

      this.resize();

      this.animationFrameRequest = requestAnimationFrame(this.loop);

    })  
  }

  drawFrame(_frameID){
      this.ctx.clearRect(0, 0, this.videoCanvas.width, this.videoCanvas.height);
      this.ctx.drawImage(this.decodedVideo.frames[_frameID]/*e.target*/, 0, 0 ,this.videoCanvas.width, this.videoCanvas.height);

    
    if($("#etalonnage-button").classList.contains("is-active")){
      // Draw the origin
      this.drawOrigin();

      // Draw the scale segment
      if(this.measurement.scaleSegment.x1 != null  && this.measurement.scaleSegment.y1){
        this.drawSegment();
      }
    }

    // Draw the crosses
    this.drawCrosses();

    // Draw the magnifier
    if(this.magnifier === true){
      this.drawMagnifier(_frameID);
    }

    // Update the image label
    $("#frame-label").innerHTML = "Image n° " + (this.currentFrame + 1) +"/" + this.decodedVideo.frames.length;

    // Update the table
    this.measurement.selectRow(this.currentFrame);

  }

  drawCrosses(){
    for(let i = this.measurement.originFrame; i < this.measurement.data.length; i++){
      for(let j = 0; j < this.measurement.data[i].xs.length; j++){
        this.drawCross(this.measurement.data[i].xs[j], this.measurement.data[i].ys[j]);
      }
    }
  }

  drawCross(_x, _y){
    const x = this.videoCanvas.width * _x;
    const y = this.videoCanvas.height * _y;

    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(x - 5, y);
    this.ctx.lineTo(x + 5, y);
    this.ctx.moveTo(x, y - 5);
    this.ctx.lineTo(x, y + 5);
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawMagnifier(_frameID){
    //let a = this.ctx.getImageData(0,0,this.videoCanvas.width,this.videoCanvas.height)
    let img = new VideoFrame(this.videoCanvas, {timestamp : 0})

    let magnifierPower = 2;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.point.x, this.point.y, this.videoCanvas.height * 0.15, 0, Math.PI * 2, true);
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 6;
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.clip();
		
		this.ctx.drawImage(
      /*this.decodedVideo.frames[_frameID]*/ img,
      -this.videoCanvas.width * (magnifierPower - 1) / 2 +
        (this.videoCanvas.width - this.videoCanvas.width * magnifierPower) * (this.distPoint.x * 1),
      -this.videoCanvas.height * (magnifierPower - 1) / 2 +
        (this.videoCanvas.height - this.videoCanvas.height * magnifierPower) * (this.distPoint.y * 1),
      this.videoCanvas.width * magnifierPower,
      this.videoCanvas.height * magnifierPower
    );

    img.close();
    this.ctx.restore();
  }

  drawOrigin(){
    function canvasArrow(context, fromx, fromy, tox, toy) {
      const headlen = 10; // length of head in pixels
      const dx = tox - fromx;
      const dy = toy - fromy;
      const angle = Math.atan2(dy, dx);
      context.lineWidth = 2;
      context.moveTo(fromx, fromy);
      context.lineTo(tox, toy);
      context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
      context.moveTo(tox, toy);
      context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    }

    this.ctx.beginPath();
    const x = this.videoCanvas.width * this.measurement.origin.x;
    const y = this.videoCanvas.height * this.measurement.origin.y;

    //horizontal arrow
    if(this.measurement.origin.type == "topright" || this.measurement.origin.type == "downright"){
      canvasArrow(this.ctx, 0, y, this.videoCanvas.width, y);
    } else {
      canvasArrow(this.ctx, this.videoCanvas.width, y, 0, y);
    }
    //vertical arrow
    if(this.measurement.origin.type == "topright" || this.measurement.origin.type == "topleft"){-
      canvasArrow(this.ctx, x, this.videoCanvas.height, x, 0);
    } else {
      canvasArrow(this.ctx, x, 0, x, this.videoCanvas.height);
    }

    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawSegment(){
    let x1 = this.videoCanvas.width * this.measurement.scaleSegment.x1;
    let y1 = this.videoCanvas.height * this.measurement.scaleSegment.y1;
    let x2 = this.videoCanvas.width * this.measurement.scaleSegment.x2;
    let y2 = this.videoCanvas.height * this.measurement.scaleSegment.y2;

    // Draw to mouse instead
    if(this.measurement.scaleSegment.x2 == null && this.measurement.scaleSegment.y2 == null){
      x2 = this.videoCanvas.width * (this.distPoint.x + 0.5);
      y2 = this.videoCanvas.height * (this.distPoint.y + 0.5);
      
    }
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);

    this.ctx.lineTo(x2, y2);

    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
    this.ctx.closePath();
  }

  toggleMagnifier(){
    if(this.magnifier){
      $("#magnifier-button").classList.remove("is-active");
      this.magnifier = false;
    } else {
      $("#magnifier-button").classList.add("is-active");
      this.magnifier = true;
    }
  }

  firstFrame(){
    this.setFrame(this.measurement.originFrame);
  }

  previousFrame(){
    if(this.currentFrame > 0){this.setFrame(this.currentFrame - 1);}
  }

  nextFrame(){
    if(this.currentFrame < this.decodedVideo.frames.length - 1){this.setFrame(this.currentFrame + 1);}
  }

  lastFrame(){
    this.setFrame(this.decodedVideo.frames.length - 1);
  }

  setFrame(id){
    if (id < this.measurement.originFrame){
      id = this.measurement.originFrame;
    }
    this.pause();
    this.currentFrame = id;
    this.currentPoint = 0;
    this.drawFrame(this.currentFrame);
  }

  play(){
    $("#play-button").classList.add("is-hidden");
    $("#pause-button").classList.remove("is-hidden");

    this.pauseFlag = false;
    this.dateOrigin = performance.now();
    requestAnimationFrame(this.playing);
  }

  pause(){
    $("#pause-button").classList.add("is-hidden");
    $("#play-button").classList.remove("is-hidden");

    this.pauseFlag = true;
  }

  playing = () => {
    if(this.currentFrame < this.decodedVideo.frames.length - 1 && this.pauseFlag === false){
      let elapsedTime = performance.now() - this.dateOrigin;
      if(elapsedTime > this.decodedVideo.duration / this.decodedVideo.frames.length){
        this.dateOrigin = performance.now();
        this.currentFrame++
        this.drawFrame(this.currentFrame);
      }
      requestAnimationFrame(this.playing); 
    }
  }

  resize(){
    let videoContainerRatio = this.videoContainer.offsetHeight / this.videoContainer.offsetWidth; 

    if(this.decodedVideo != null){
      let videoRatio = this.decodedVideo.height / this.decodedVideo.width;

      if (videoContainerRatio < videoRatio) {
        // stretch to height
        this.videoCanvas.width = this.videoContainer.offsetHeight / videoRatio;
        this.videoCanvas.height = this.videoContainer.offsetHeight;

        // horizontal align
        let left = (this.videoContainer.offsetWidth - this.videoCanvas.width ) / 2
        this.videoCanvas.style.left = left.toString() + "px";
        this.videoCanvas.style.top = "0px";
      } else {
        // stretch to width
        this.videoCanvas.width = this.videoContainer.offsetWidth;
        this.videoCanvas.height = this.videoContainer.offsetWidth * videoRatio;
        // vertical align
        let top = (this.videoContainer.offsetHeight - this.videoCanvas.width * videoRatio) / 2
        this.videoCanvas.style.top = top.toString() + "px";
        this.videoCanvas.style.left = "0px";
      }

      this.drawFrame(this.currentFrame);
    }
  }

  loop = () => {
    this.animationFrameRequest = requestAnimationFrame(this.loop);
    this.drawFrame(this.currentFrame);
  }

  onMouseMove = (ev) => {
    let rect = this.videoCanvas.getBoundingClientRect();
		this.point = { x: (ev.clientX/* - 7*/) - rect.left, y: (ev.clientY/* - 7*/) - rect.top };

    this.distPoint = {
      x: (this.point.x - this.videoCanvas.width * 0.5) / this.videoCanvas.width,
      y: (this.point.y - this.videoCanvas.height * 0.5) / this.videoCanvas.height
    };	
  }

  onClick = (ev) => {
    let rect = this.videoCanvas.getBoundingClientRect();
		let point = {
      x:
        (ev.clientX/* - 7*/) - rect.left,
      y: (ev.clientY/* - 7*/) - rect.top
    };

    let distPoint = {
      x: (point.x - this.videoCanvas.width * 0.5) / this.videoCanvas.width,
      y: (point.y - this.videoCanvas.height * 0.5) / this.videoCanvas.height
    };

    this.measurement.changeValue(this.currentFrame, this.currentPoint, distPoint.x + 0.5, distPoint.y + 0.5);
    this.videoCanvas.style.cursor = "crosshair";


    if(this.currentPoint < this.measurement.data[this.currentFrame].xs.length - 1){
      this.currentPoint++
    } else{
      this.nextFrame();
    }

  }

  enterOriginMode(_type){
    this.originFlag = _type;
    $("#canvas-shadow").style.display= "block";
    this.videoCanvas.style.zIndex = "100";

    $("#canvas-shadow").addEventListener("click", this.exitOriginMode);
    this.videoCanvas.removeEventListener("click", this.onClick);
    this.videoCanvas.addEventListener("click", this.onOriginClick);

  }

  exitOriginMode = () => {
    $("#canvas-shadow").style.display= "none";
    $("#canvas-shadow").removeEventListener("click", this.exitOriginMode);

    this.videoCanvas.addEventListener("click", this.onClick);
    this.videoCanvas.removeEventListener("click", this.onOriginClick);

    this.videoCanvas.style.zIndex = "auto";

    this.videoCanvas.style.cursor = "crosshair";
    this.originFlag = "none";
  }

  onOriginClick = (ev) => {
    let rect = this.videoCanvas.getBoundingClientRect();
		let point = {
      x: (ev.clientX/* - 7*/) - rect.left,
      y: (ev.clientY/* - 7*/) - rect.top
    };

    let distPoint = {
      x: (point.x - this.videoCanvas.width * 0.5) / this.videoCanvas.width,
      y: (point.y - this.videoCanvas.height * 0.5) / this.videoCanvas.height
    };

    this.measurement.origin.type = this.originFlag;

    this.measurement.origin.x = distPoint.x + 0.5;
    this.measurement.origin.y = distPoint.y + 0.5;

    $("#topright").classList.remove("is-active");
    $("#topleft").classList.remove("is-active");
    $("#downright").classList.remove("is-active");
    $("#downleft").classList.remove("is-active");

    $("#"+this.originFlag).classList.add("is-active");

    this.measurement.updateTable();

    this.exitOriginMode();
  }

  enterScalenMode(_type){
    $("#canvas-shadow").style.display= "block";
    this.videoCanvas.style.zIndex = "100";

    $("#segment-button").classList.add("is-active");

    $("#canvas-shadow").addEventListener("click", this.exitScaleMode);
    this.videoCanvas.removeEventListener("click", this.onClick);
    this.videoCanvas.addEventListener("click", this.onScaleClick);

    this.measurement.scaleSegment.x1 = null;
    this.measurement.scaleSegment.x2 = null;
    this.measurement.scaleSegment.y1 = null;
    this.measurement.scaleSegment.y2 = null;

  }

  exitScaleMode = () => {
    $("#canvas-shadow").style.display= "none";
    $("#canvas-shadow").removeEventListener("click", this.exitScaleMode);

    $("#segment-button").classList.remove("is-active");

    this.videoCanvas.addEventListener("click", this.onClick);
    this.videoCanvas.removeEventListener("click", this.onScaleClick);

    this.videoCanvas.style.zIndex = "auto";
  }

  onScaleClick = (ev) => {
    let rect = this.videoCanvas.getBoundingClientRect();
		let point = {
      x: (ev.clientX/* - 7*/) - rect.left,
      y: (ev.clientY/* - 7*/) - rect.top
    };

    let distPoint = {
      x: (point.x - this.videoCanvas.width * 0.5) / this.videoCanvas.width,
      y: (point.y - this.videoCanvas.height * 0.5) / this.videoCanvas.height
    };

    if(this.measurement.scaleSegment.x1 == null){
      this.measurement.scaleSegment.x1 = distPoint.x + 0.5;
      this.measurement.scaleSegment.y1 = distPoint.y + 0.5;
    } else{
      this.measurement.scaleSegment.x2 = distPoint.x + 0.5;
      this.measurement.scaleSegment.y2 = distPoint.y + 0.5;

      this.measurement.updateTable();

      this.exitScaleMode();
    }
  }

  setOriginFrame(id) {
    if(isNumber(id) == true){
      if(id >=0 && id < this.measurement.data.length){
        this.measurement.originFrame = id
        this.setFrame(this.currentFrame); // check if currentFrame < originFrame
        console.log("originframe : " , id)
      } 
    }
  }

}