import express, { Router } from "express";

import { streamController } from "@/api/stream/streamController";
import { uploadMiddleware } from "@/common/middleware/upload";

export const streamRouter: Router = express.Router();
streamRouter.get("/", streamController.streamMp4);

streamRouter.get("/s3/:filename", streamController.streamS3File);

streamRouter.post(
 "/process",
 uploadMiddleware,
 streamController.localFileToHlsProcess,
);

streamRouter.get("/hls/:filename", streamController.streamHLS);
