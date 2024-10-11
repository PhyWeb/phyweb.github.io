/*----------------------------------------------------------------------------------------------
--------------------------------------------EXTRACTOR-------------------------------------------
----------------------------------------------------------------------------------------------*/
class EXTRACTOR {
  constructor() {

  }   

  async extract(_file,_cb){
  let decodedVideo = {
    duration: null,
    width: null,
    height: null,
    frames: []
  }
  // `getVideoFrames` requires a video URL as input.
  // If you have a file/blob instead of a videoUrl, turn it into a URL like this:
  let videoUrl = URL.createObjectURL(_file);

  await getVideoFrames({
    videoUrl,
    onFrame(frame) {  // `frame` is a VideoFrame object: https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame
      createImageBitmap(frame).then((result)=>{
        decodedVideo.frames.push(result);
        frame.close();
      })
    },
    onConfig(config) {
      console.log(config)
      decodedVideo.duration = config.info.duration
      decodedVideo.width = config.codedWidth;
      decodedVideo.height = config.codedHeight;
    },
    onFinish() {
      console.log("Decoded!")
      decodedVideo.fps = decodedVideo.frames.length / (decodedVideo.duration / 1000);
      _cb(decodedVideo)
    },
  });

  URL.revokeObjectURL(_file); // revoke URL to prevent memory leak
  }
}