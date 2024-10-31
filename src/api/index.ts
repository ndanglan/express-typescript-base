import express, { Router } from "express";

import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { streamRouter } from "@/api/stream/streamRouter";
import { userRouter } from "@/api/user/userRouter";
import { redisLimit, TRateLimitRule } from "@/common/middleware/rateLimiter";

export const router: Router = express.Router();

const USER_RATE_LIMIT: TRateLimitRule = {
 endpoint: "users",
 rate_limit: {
  time: 60,
  limit: 5,
 },
};

router.use("/health-check", healthCheckRouter);
router.use("/users", redisLimit(USER_RATE_LIMIT), userRouter);
router.use("/stream", streamRouter);
