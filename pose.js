const videoWidth = 160;
const videoHeight = 90;

// from: https://github.com/tensorflow/tfjs-models/blob/72787aa4d4af9e5cea4c31d11db412355b878b70/posenet/demos/camera.js
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;

  const mobile = false; // TODO: impl mobile check
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}




//from http://html5doctor.com/video-canvas-magic/
function draw(v,c,w,h) {
    if(v.paused || v.ended) return false;
    c.drawImage(v,0,0,w,h);
    setTimeout(draw,20,v,c,w,h);
}

//const ht = handTrack.load();
var pn;
var context;
var hmodel;
let cw = videoWidth, ch = videoHeight;
$(document).ready(async () => {
    pn = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: cw, height: ch },
        multiplier: 0.75
    });

    // load webcam feed
    let video;

    try {
      video = await loadVideo();
    } catch (e) {
      console.log('webcam err!', e)
      throw e;
    }

    var bufcanv = document.getElementById('buffer');
    bufcanv.height = ch;
    bufcanv.width = cw;
    context = bufcanv.getContext('2d');

    video.addEventListener('play', function(){
        draw(this,context,cw,ch);
        
            //myWorker.postMessage(context.getImageData(0, 0, cw, ch));
    },false);

    //hmodel = await ht;
        
    let myp5 = new p5(mkgame());

})

function pred() {
    //return hmodel.detect(context.getImageData(0, 0, cw, ch))
    return pn.estimateSinglePose(context.getImageData(0, 0, cw, ch), {
        flipHorizontal: true,
        decodingMethod: 'single-person'
    })
}