import { spawn } from "child_process";
import { parentPort, workerData } from "worker_threads";

import { env } from "@/common/utils/envConfig";

(async () => {
  try {
    const { inputFileForward, outputDirForward, originalFilename } = workerData;

    const command = "gst-launch-1.0";
    const args = [
      "--gst-debug",
      "*:2",
      "filesrc",
      `location=${inputFileForward}`,
      "!",
      "decodebin",
      "name=demux",
      "demux.", // Video stream
      "!",
      "queue",
      "!",
      "videoconvert",
      "!",
      "videoscale",
      "!",
      "video/x-raw, width=1920, height=1080",
      "!",
      "x264enc",
      "bitrate=8000",
      "speed-preset=ultrafast",
      "tune=zerolatency",
      "!",
      "h264parse",
      "!",
      "mpegtsmux",
      "name=mux",
      "!",
      "hlssink",
      `target-duration=${env.HLS_TARGET_DURATION}`,
      `playlist-length=${env.HLS_PLAYLIST_LENGTH}`,
      `max-files=${env.HLS_MAX_FILES}`,
      `location=${outputDirForward}/segment_${originalFilename}_%05d.ts`, // Use a pattern for segment files
      `playlist-location=${outputDirForward}/playlist.m3u8`, // Location for the HLS playlist
      "demux.",
      "!",
      "queue",
      "!",
      "audioconvert",
      "!",
      "audioresample",
      "!",
      "voaacenc",
      "!",
      "aacparse",
      "!",
      "mux.",
    ];
    // Ensure the output directory exists
    parentPort?.postMessage({ type:'log', status: false, message:`Running: ${args.join(' ')}` });
    const gst = spawn(command, args);
    gst.stderr.on("data", (data) =>parentPort?.postMessage({ type:'log', status: false, message:`GStreamer error: ${data}` }));

    gst.on("exit", (code, signal) => {
      parentPort?.postMessage({ type:'log', status: false, message:`GStreamer exited with code ${code}` })
      parentPort?.postMessage({
        status: code === 0,
      });
    });

    // Handle cleanup on response close (if applicable)
    parentPort?.on("close", () => {
      gst.kill();
    });

  } catch (error) {
    parentPort?.postMessage({ status: false, error: JSON.stringify(error) });
    // Ensure cleanup if the main thread closes the worker early
    process.exit(1);
  }
})();
