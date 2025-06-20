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

    this.decodedVideo;

    this.measurement = _measurement;

    this.segment = {
      x1: null,
      y1: null,
      x2: null,
      y2: null
    };

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

  load(_file, _forceFilesize = false){
    // Pause if the video is playing
    this.pause();
    
    // Stop loop
    cancelAnimationFrame(this.animationFrameRequest);

    // Checksize callback
    let checksizeCB = () => {
      // destroy previous frames
      if(this.decodedVideo){
        this.decodedVideo.frames.forEach((e)=>{
          e.close();
        });
      }
    }

    // Decoded video callback
    let decodedVideoCB = (_decodedVideo) => {
      console.log("Video decoded", _decodedVideo);
      this.decodedVideo = _decodedVideo;
      this.currentFrame = 0;
      this.currentPoint = 0;

      // Display UI
      $("#video-controls").classList.remove("is-hidden");
      $("#magnifier-button").classList.remove("is-hidden");
      $("#settings-button").classList.remove("is-hidden");
      $("#handler-wrapper").classList.remove("is-hidden");
      $("#background-arrow").classList.add("is-hidden");
      $(".handler").style.display= "block";
      this.videoCanvas.style.display= "block";

      this.measurement.init(this.decodedVideo, this);

      $("#etalonnage-button").click();

      this.resize();

      this.setFrame(this.currentFrame);

      this.animationFrameRequest = requestAnimationFrame(this.loop);
    }
    
    // Check if _file is a file or a path and start extraction
    if(typeof _file === "string"){
      fetch(_file)
      .then(res => res.blob()) 
      .then(blob => {
        this.extractor.checkSize(blob, checksizeCB, decodedVideoCB, _forceFilesize);
      });
    } else {
      this.extractor.checkSize(_file, checksizeCB, decodedVideoCB, _forceFilesize);
    }
  }

  drawFrame(_frameID){
    this.ctx.clearRect(0, 0, this.videoCanvas.width, this.videoCanvas.height);
    this.ctx.drawImage(this.decodedVideo.frames[_frameID]/*e.target*/, 0, 0 ,this.videoCanvas.width, this.videoCanvas.height);
    
    if($("#etalonnage-button").classList.contains("is-active")){
      // Draw the origin
      this.drawOrigin();

      // Draw the scale segment
      if(this.measurement.scale.scaleSegment.x1 != null || this.segment.x1 != null){
        this.drawSegment();
      }
    }

    // Draw the crosses
    this.drawCrosses();

    // Draw the magnifier
    if(this.magnifier === true){
      this.drawMagnifier(_frameID);
    }
  }

  drawCrosses(){
    for(let i = 0; i < (this.measurement.series.length - 1) / 2; i++){
      for(let j = this.measurement.originFrame; j < this.measurement.series[0].length; j++){
        this.drawCross(this.measurement.series[(i * 2) + 1][j], this.measurement.series[(i * 2) + 2][j]);
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
    const x = this.videoCanvas.width * this.measurement.scale.origin.x;
    const y = this.videoCanvas.height * this.measurement.scale.origin.y;

    //horizontal arrow
    if(this.measurement.scale.origin.type == "topright" || this.measurement.scale.origin.type == "downright"){
      canvasArrow(this.ctx, 0, y, this.videoCanvas.width, y);
    } else {
      canvasArrow(this.ctx, this.videoCanvas.width, y, 0, y);
    }
    //vertical arrow
    if(this.measurement.scale.origin.type == "topright" || this.measurement.scale.origin.type == "topleft"){-
      canvasArrow(this.ctx, x, this.videoCanvas.height, x, 0);
    } else {
      canvasArrow(this.ctx, x, 0, x, this.videoCanvas.height);
    }

    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawSegment(){
    let x1 = this.videoCanvas.width * this.measurement.scale.scaleSegment.x1;
    let y1 = this.videoCanvas.height * this.measurement.scale.scaleSegment.y1;
    let x2 = this.videoCanvas.width * this.measurement.scale.scaleSegment.x2;
    let y2 = this.videoCanvas.height * this.measurement.scale.scaleSegment.y2;

    if(this.segment.x1 != null){
      // draw to mouse instead
      x1 = this.segment.x1 * this.videoCanvas.width;
      y1 = this.segment.y1 * this.videoCanvas.height;
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

  setFrame(id, _pause = true){
    if (id < this.measurement.originFrame){
      id = this.measurement.originFrame;
    }
    if(_pause){
      this.pause();
    }
    this.currentFrame = id;
    this.currentPoint = 0;

    // Update the image label
    $("#frame-label").innerHTML = "Image n° " + (this.currentFrame + 1) +"/" + this.decodedVideo.frames.length;

    // Update the table
    this.measurement.selectRow(this.currentFrame);

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

        this.setFrame(this.currentFrame + 1, false);
        // Update the image label
        $("#frame-label").innerHTML = "Image n° " + (this.currentFrame + 1) +"/" + this.decodedVideo.frames.length;

        // Update the table
        this.measurement.selectRow(this.currentFrame);

        //this.drawFrame(this.currentFrame); not usefull since we called setFrame ?
      }
      requestAnimationFrame(this.playing); 
    } else {
      this.pause();
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

    // Update the coordinates label
    const scaleX = this.measurement.scale.getOrientedScaleX();
    const scaleY = this.measurement.scale.getOrientedScaleY();

    const x = (((this.distPoint.x + 0.5) - this.measurement.scale.origin.x) * scaleX).round(4);
    const y = (((this.distPoint.y + 0.5) - this.measurement.scale.origin.y) * scaleY).round(4);

    if(this.measurement.scale.scaleSegment.x2 != null || this.segment.x2 != null){
      // a scale has been set
      $("#x-coord-label").innerHTML = "X : " + x + " m";
      $("#y-coord-label").innerHTML = "Y : " + y + " m";
    } else{
      $("#x-coord-label").innerHTML = "X : " + x;
      $("#y-coord-label").innerHTML = "Y : " + y;
    }
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


    if(this.currentPoint < ((this.measurement.series.length - 1) / 2) - 1){
      this.currentPoint++
    } else{
      this.nextFrame();
    }

  }

  // Escape shortcut callback (originMode)
  originModeKeyboardShortcut = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      this.exitOriginMode();
    }
  }

  enterOriginMode(_type){
    this.originFlag = _type;
    $("#canvas-shadow").style.display= "block";
    this.videoCanvas.style.zIndex = "100";

    $("#canvas-shadow").addEventListener("click", this.exitOriginMode);
    this.videoCanvas.removeEventListener("click", this.onClick);
    this.videoCanvas.addEventListener("click", this.onOriginClick);

    // Keyboard shortcut
    document.addEventListener("keyup", this.originModeKeyboardShortcut);
  }

  exitOriginMode = () => {
    $("#canvas-shadow").style.display= "none";
    $("#canvas-shadow").removeEventListener("click", this.exitOriginMode);

    this.videoCanvas.addEventListener("click", this.onClick);
    this.videoCanvas.removeEventListener("click", this.onOriginClick);

    this.videoCanvas.style.zIndex = "auto";

    this.videoCanvas.style.cursor = "crosshair";
    this.originFlag = "none";

    // Remove keyboard shortcut
    document.removeEventListener("keyup", this.originModeKeyboardShortcut);
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

    console.log(this.measurement.scale.origin.type, this.originFlag);
    this.measurement.scale.origin.type = this.originFlag;
    console.log(this.measurement.scale.origin.type, this.originFlag);

    this.measurement.scale.origin.x = distPoint.x + 0.5;
    this.measurement.scale.origin.y = distPoint.y + 0.5;

    $("#topright").classList.remove("is-active");
    $("#topleft").classList.remove("is-active");
    $("#downright").classList.remove("is-active");
    $("#downleft").classList.remove("is-active");

    $("#"+this.originFlag).classList.add("is-active");

    this.measurement.updateTable();

    this.exitOriginMode();
  }

  // Escape shortcut callback (scaleMode)
  scaleModeKeyboardShortcut = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      this.exitScaleMode();
    }
  }

  enterScalenMode(_type){
    $("#canvas-shadow").style.display= "block";
    this.videoCanvas.style.zIndex = "100";

    $("#segment-button").classList.add("is-active");

    $("#canvas-shadow").addEventListener("click", this.exitScaleMode);
    this.videoCanvas.removeEventListener("click", this.onClick);
    this.videoCanvas.addEventListener("click", this.onScaleClick);

    // Keyboard shortcut
    document.addEventListener("keyup", this.scaleModeKeyboardShortcut);
  }

  exitScaleMode = () => {
    $("#canvas-shadow").style.display= "none";
    $("#canvas-shadow").removeEventListener("click", this.exitScaleMode);

    $("#segment-button").classList.remove("is-active");

    this.videoCanvas.addEventListener("click", this.onClick);
    this.videoCanvas.removeEventListener("click", this.onScaleClick);

    this.videoCanvas.style.zIndex = "auto";

    this.segment.x1 = null;
    this.segment.x2 = null;
    this.segment.y1 = null;
    this.segment.y2 = null;

    // Remove keyboard shortcut
    document.removeEventListener("keyup", this.scaleModeKeyboardShortcut);
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

    if(this.segment.x1 == null){
      this.segment.x1 = distPoint.x + 0.5;
      this.segment.y1 = distPoint.y + 0.5;
    } else{
      this.segment.x2 = distPoint.x + 0.5;
      this.segment.y2 = distPoint.y + 0.5;

      this.measurement.scale.scaleSegment.x1 = this.segment.x1;
      this.measurement.scale.scaleSegment.y1 = this.segment.y1;
      this.measurement.scale.scaleSegment.x2 = this.segment.x2;
      this.measurement.scale.scaleSegment.y2 = this.segment.y2;

      this.measurement.updateTable();

      this.exitScaleMode();
    }
  }

  setOriginFrame(id) {
    if(isNumber(id) == true){
      if(id >=0 && id < this.measurement.series[0].length){
        //this.measurement.originFrame = id
        this.measurement.setOriginFrame(id);
        this.setFrame(this.currentFrame); // check if currentFrame < originFrame
        console.log("originframe : " , id)
      } 
    }
  }

}