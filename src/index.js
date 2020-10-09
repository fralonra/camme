import * as handpose from '@tensorflow-models/handpose';
import fp from 'fingerpose';
console.log(fp);
const config = {
  video: { width: 640, height: 480, fps: 30 },
};

async function main() {
  const video = document.querySelector('#pose-video');
  const canvas = document.querySelector('#pose-canvas');
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'red';

  const drawing = document.querySelector('#drawing');
  const drawingCtx = drawing.getContext('2d');
  drawingCtx.lineWidth = 3;

  let isDrawing = false;

  // configure gesture estimator
  // add "✌🏻" and "👍" as sample gestures
  const pointerGesture = new fp.GestureDescription('pointer');
  pointerGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
  pointerGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);
  pointerGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
  pointerGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
  pointerGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
  const knownGestures = [pointerGesture];
  const GE = new fp.GestureEstimator(knownGestures);

  // load handpose model
  const model = await handpose.load();
  console.log('Handpose model loaded');

  // main estimation loop
  const estimateHands = async () => {
    // clear canvas overlay
    ctx.clearRect(0, 0, config.video.width, config.video.height);

    // get hand landmarks from video
    // Note: Handpose currently only detects one hand at a time
    // Therefore the maximum number of predictions is 1
    const predictions = await model.estimateHands(video, true);

    if (predictions.length > 0) {
      // now estimate gestures based on landmarks
      // using a minimum confidence of 7.5 (out of 10)
      const est = GE.estimate(predictions[0].landmarks, 8.5);

      if (est.gestures.length > 0) {
        const keypoints = predictions[0].annotations.indexFinger;
        drawKeypoint(keypoints[3]);
        drawKeypoints(keypoints);
      } else {
        if (isDrawing) {
          isDrawing = false;
        }
      }
    } else {
      if (isDrawing) {
        isDrawing = false;
      }
    }

    // ...and so on
    window.requestAnimationFrame(estimateHands);
  };

  estimateHands();
  console.log('Starting predictions');

  function drawPoint(y, x, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }

  function drawKeypoint(keypoint) {
    const [y, x, z] = keypoint;
    if (!isDrawing) {
      drawingCtx.beginPath();
      drawingCtx.moveTo(y - 2, x - 2);
      isDrawing = true;
    }
    drawingCtx.lineTo(y - 2, x - 2);
    drawingCtx.stroke();
  }

  function drawKeypoints(keypoints) {
    for (let i = 0; i < keypoints.length; i++) {
      const [y, x, z] = keypoints[i];
      drawPoint(x - 2, y - 2, 3);
    }

    drawPath(keypoints, false);
  }

  function drawPath(points, closePath) {
    const region = new Path2D();
    region.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      region.lineTo(point[0], point[1]);
    }

    if (closePath) {
      region.closePath();
    }
    ctx.stroke(region);
  }
}

async function initCamera(width, height, fps) {
  const constraints = {
    audio: false,
    video: {
      facingMode: 'user',
      width: width,
      height: height,
      frameRate: { max: fps },
    },
  };

  const video = document.querySelector('#pose-video');
  video.width = width;
  video.height = height;

  // get video stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initCamera(config.video.width, config.video.height, config.video.fps).then(
    (video) => {
      video.play();
      video.addEventListener('loadeddata', (event) => {
        console.log('Camera is ready');
        main();
      });
    },
  );

  const canvas = document.querySelector('#pose-canvas');
  canvas.width = config.video.width;
  canvas.height = config.video.height;

  const drawing = document.querySelector('#drawing');
  drawing.width = config.video.width;
  drawing.height = config.video.height;
  console.log('Canvas initialized');
});
