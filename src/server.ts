import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import path from "path";
import { pino } from "pino";
import fs from "fs";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { ServiceResponse } from "@/common/models/serviceResponse";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.get("/", (req, res) => {
 res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/stream", (req: any, res) => {
 const range = req.headers.range;
 const filename = req.params.filename;

 const videoPath = path.resolve(
  path.join(__dirname, "public", "test-video.mp4"),
 );
 if (!fs.existsSync(videoPath)) {
  return res.status(404).send("Video not found");
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
  return res.status(500).send("Video stream error");
 });

 videoStream.pipe(res);
});

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
