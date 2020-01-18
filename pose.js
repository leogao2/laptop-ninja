const videoWidth = 600;
const videoHeight = 500;

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




$(document).ready(async () => {
    // load posenet
    const net = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
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

    const pose = await net.estimateSinglePose(video, {
        flipHorizontal: true,
        decodingMethod: 'single-person'
      });

    console.log(pose)


})