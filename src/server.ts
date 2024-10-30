import { S3Client } from "@aws-sdk/client-s3";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import path from "path";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";

import { router } from "@/api";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";

const logger = pino({ name: "server start" });
const app: Express = express();

const s3 = new S3Client({
 region: env.S3_REGION,
 endpoint: `https://s3.${process.env.S3_REGION}.amazonaws.com`,
 credentials: {
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
 },
});

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: false }));
app.use(helmet());

app.use(rateLimiter);
app.use(express.static(path.join(__dirname, "public")));
// Request logging
app.use(requestLogger);

// Routes
app.use("/api", router);
app.get("/client", (req, res) => {
 res.set("Content-Type", "text/html");
 res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger, s3 };
