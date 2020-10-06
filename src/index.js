navigator.mediaDevices.getUserMedia({
  video: true
})
.then(function (stream) {
  const video = document.getElementById('video')
  video.srcObject = stream
  video.onloadedmetadata = function (e) {
    video.play();
  }
})
.catch(function (err) {
  /* 处理error */
});