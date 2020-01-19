const videoWidth = 160 * 4;
const videoHeight = 90 * 4;

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
//tf.setBackend('cpu')
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
var bufcanv = document.getElementById('buffer');
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

    bufcanv.height = ch;
    bufcanv.width = cw;
    context = bufcanv.getContext('2d');
    //context.translate(cw, 0);
    //context.scale(-1, 1);

    video.addEventListener('play', function(){
        draw(this,context,cw,ch);
        
          // debug display
            //myWorker.postMessage(context.getImageData(0, 0, cw, ch));
    },false);

    //hmodel = await ht;
    console.log('saddsad')
    let myp5 = new p5(mkgame());

})

var mode = 'server';
const socket = new WebSocket('ws://35.222.136.238:8765');

var cansend = true;
socket.addEventListener('message', function (event) {
    //console.log('Message from server ', event.data);
    cansend = true
    let xy = JSON.parse(event.data).rightWrist.coords
    console.log('delay', Date.now() - sendtime, 'ms')
    set_user_pos(videoWidth - xy[1], xy[0])
});

var sendtime = -1
function pred() {
    //return hmodel.detect(context.getImageData(0, 0, cw, ch))
    let single = true;
    if (mode === 'server') {
        if (!cansend) {
            return new Promise((resolve, reject) => {
                resolve(null);
            })
        }
        cansend = false
        print('sending msg')
        socket.send(bufcanv.toDataURL())
        sendtime = Date.now()
        return new Promise((resolve, reject) => {
            resolve(null);
        })
    } else if (single) {
        return pn.estimateSinglePose(context.getImageData(0, 0, cw, ch), {
            flipHorizontal: true,
            decodingMethod: 'single-person'
        })
    } else {
        return pn.estimateMultiplePoses(context.getImageData(0, 0, cw, ch), {
            flipHorizontal: true,
            maxDetections: 1,
            scoreThreshold: 0.1,
            nmsRadius: 20
        })
    }
}