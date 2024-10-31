import type { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

import { env } from "@/common/utils/envConfig";
import { redis } from "@/common/config/redis.config";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

const rateLimiter = rateLimit({
 legacyHeaders: true,
 limit: env.COMMON_RATE_LIMIT_MAX_REQUESTS,
 message: "Too many requests, please try again later.",
 standardHeaders: true,
 windowMs: 15 * 60 * env.COMMON_RATE_LIMIT_WINDOW_MS,
 keyGenerator: (req: Request) => req.ip as string,
});

export type TRateLimitRule = {
 endpoint: string;
 rate_limit: {
  time: number;
  limit: number;
 };
};
export const redisLimit = (rule: TRateLimitRule) => {
 const { endpoint, rate_limit } = rule;
 return async (req: Request, res: Response, next: NextFunction) => {
  const isAddress = req.ip;
  const redisId = `${endpoint}:${isAddress}`;

  const requests = await redis.incr(redisId);

  if (requests === 1) {
   await redis.expire(redisId, rate_limit.time);
  }

  if (requests > rate_limit.limit) {
   return handleServiceResponse(
    ServiceResponse.failure(
     "Too many requests",
     null,
     StatusCodes.TOO_MANY_REQUESTS,
    ),
    res,
   );
  }

  next();
 };
};
export default rateLimiter;
