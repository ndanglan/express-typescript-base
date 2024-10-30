import { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { spawn } from "child_process";
import dayjs from "dayjs";
import type { Request, RequestHandler, Response } from "express";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import path from "path";

import { streamService } from "@/api/stream/streamService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { logger } from "@/server";

class StreamController {
 public streamMp4: RequestHandler = async (_req: Request, res: Response) => {
  const range = _req.headers.range ?? "";
  const filename = _req.params.filename ?? "test-video.mp4";
  const videoPath = path.resolve(
   path.join(__dirname, "../../public", filename),
  );
  if (!fs.existsSync(videoPath)) {
   return handleServiceResponse(
    ServiceResponse.failure("Video not found", null, StatusCodes.NOT_FOUND),
    res,
   );
  }

  const videoSize = fs.statSync(videoPath).size;
  const chunkSize = 10 ** 6; // 1MB chunks
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
   "Content-Range": `bytes ${start}-${end}/${videoSize}`,
   "Accept-Ranges": "bytes",
   "Content-Length": contentLength,
   "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });

  videoStream.on("error", (err) => {
   console.error("Stream error:", err);
   return handleServiceResponse(
    ServiceResponse.failure(
     "Stream error",
     null,
     StatusCodes.INTERNAL_SERVER_ERROR,
    ),
    res,
   );
  });

  videoStream.pipe(res);
 };

 public streamS3File: RequestHandler = async (_req: Request, res: Response) => {
  const filename = _req.params.filename;
  const s3Options = {
   Bucket: "duhairongsbucket",
   Key: `${filename}.mp4`, // key to your object in S3
  };
  const serviceResponse = await streamService.s3SendCommand(s3Options);

  if ((serviceResponse as GetObjectCommandOutput).Body) {
   const videoStream: any = (serviceResponse as GetObjectCommandOutput).Body; // This should be a stream

   videoStream?.pipe?.(res);
  } else {
   return handleServiceResponse(serviceResponse as ServiceResponse<null>, res);
  }
 };

 public localFileToHlsProcess: RequestHandler = async (
  _req: Request,
  res: Response,
 ) => {
  try {
   const inputFile = _req.file?.path ?? "";

   if (!inputFile) {
    return handleServiceResponse(
     ServiceResponse.failure(
      "No video file uploaded",
      null,
      StatusCodes.BAD_REQUEST,
     ),
     res,
    );
   }

   const originalFilename = path
    .parse(_req.file?.originalname ?? `originalFilename_${dayjs().valueOf()}`)
    .name.replace(/\s/g, "_");

   const outputDir = path.join(
    __dirname,
    "../../public/output",
    originalFilename,
   );

   if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
   }

   const inputFileForward = inputFile.replace(/\\/g, "/");
   const outputDirForward = outputDir.replace(/\\/g, "/");
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

   logger.info(`Running ${args.join(" ")}`);

   const gst = spawn(command, args);
   gst.stderr.on("data", (data) => console.error(`GStreamer error: ${data}`));
   gst.on("exit", (code, signal) => {
    console.log(`GStreamer exited with code ${code}`);
    if (code === 0) {
     return handleServiceResponse(
      ServiceResponse.success(
       "Video conversion completed successfully",
       null,
       StatusCodes.OK,
      ),
      res,
     );
    } else {
     return handleServiceResponse(
      ServiceResponse.failure(
       "Error occurred during video conversion.",
       null,
       StatusCodes.INTERNAL_SERVER_ERROR,
      ),
      res,
     );
    }
   });

   // Handle cleanup on response close (if applicable)
   res.on("close", () => {
    gst.kill();
   });
  } catch (error) {
   logger.error("Error processing video:", error);
   return handleServiceResponse(
    ServiceResponse.failure(
     "Error processing video",
     null,
     StatusCodes.INTERNAL_SERVER_ERROR,
    ),
    res,
   );
  }
 };

 public streamHLS: RequestHandler = async (_req: Request, res: Response) => {
  const { filename } = _req.params;

  const segmentRegex = /segment_(.+?)_\d{5}/;
  const match = filename.match(segmentRegex);
  const foldername = match ? match[1] : filename;

  const playlistPath = path.join(
   __dirname,
   `../../public`,
   "output",
   foldername,
   match ? filename : "playlist.m3u8",
  );

  if (!fs.existsSync(playlistPath)) {
   return handleServiceResponse(
    ServiceResponse.failure("playlist not found", null, StatusCodes.NOT_FOUND),
    res,
   );
  }

  res.sendFile(playlistPath, (err) => {
   if (err) {
    console.error("Error serving playlist:", err);
    return handleServiceResponse(
     ServiceResponse.failure(
      "Error serving playlist",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
     ),
     res,
    );
   }
  });
 };
}

export const streamController = new StreamController();
