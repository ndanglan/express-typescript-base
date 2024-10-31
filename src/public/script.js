const videoSource = document.getElementById('videoSource');
videoSource.src = `/stream/s3/12487162_1080_1920_30fps`;
const videoPlayer = document.getElementById('videoPlayer');
videoPlayer.load();

videoPlayer.addEventListener('loadedmetadata', () => {
  videoPlayer.duration = Math.ceil(videoPlayer.duration);
});

videoPlayer.addEventListener('error', (e) => {
  console.error('Error loading video:', e);
});
