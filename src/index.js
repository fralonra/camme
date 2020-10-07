import * as handTrack from 'handtrackjs';

async function main() {
  const model = await loadModel();
  await startWebcam();
  startDetect(model);
}

async function loadModel() {
  return await handTrack.load({
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
  });
}

function startDetect(model) {
  const video = document.getElementById('video');

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  window.requestAnimationFrame(detect);

  async function detect() {
    model.detect(video).then((predictions) => {
      console.log('Predictions: ', predictions);
      model.renderPredictions(predictions, canvas, ctx, video);
      window.requestAnimationFrame(detect);
    });
  }
}

async function startWebcam() {
  const video = document.getElementById('video');
  await handTrack.startVideo(video)
}

main();
