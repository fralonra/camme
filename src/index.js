import * as faceapi from 'face-api.js';

async function main() {
  await loadModel();
  startWebcam();
}

async function loadModel() {
  const MODEL_URL = '/models';

  await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
  await faceapi.loadFaceLandmarkModel(MODEL_URL);
  await faceapi.loadFaceRecognitionModel(MODEL_URL);

  console.log("loaded")
}

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
    })
    .then(function (stream) {
      const video = document.getElementById('video');

      video.srcObject = stream;
      video.onloadedmetadata = function () {
        video.play();

        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        window.requestAnimationFrame(detect);

        async function detect() {
          let fullFaceDescriptions = await faceapi
            .detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors();

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, fullFaceDescriptions);
          // faceapi.draw.drawFaceLandmarks(canvas, fullFaceDescriptions)

          window.requestAnimationFrame(detect);
        }
      };
    })
    .catch(function (err) {
      /* 处理error */
    });
}

main();
