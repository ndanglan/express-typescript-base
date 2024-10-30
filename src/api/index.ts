import express, { Router } from "express";

import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { streamRouter } from "@/api/stream/streamRouter";
import { userRouter } from "@/api/user/userRouter";

export const router: Router = express.Router();

router.use("/health-check", healthCheckRouter);
router.use("/users", userRouter);
router.use("/stream", streamRouter);
