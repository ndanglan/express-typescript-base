import express, { Router } from "express";

import { streamController } from "@/api/stream/streamController";
import { uploadMiddleware } from "@/common/middleware/upload";
import { validateFileName } from "@/common/middleware/validations";

export const streamRouter: Router = express.Router();
streamRouter.get("/", streamController.streamMp4);

streamRouter.get(
 "/s3/:filename",
 validateFileName,
 streamController.streamS3File,
);

streamRouter.post(
 "/process",
 uploadMiddleware,
 streamController.localFileToHlsProcess,
);

streamRouter.get(
 "/hls/:filename",
 validateFileName,
 streamController.streamHLS,
);
