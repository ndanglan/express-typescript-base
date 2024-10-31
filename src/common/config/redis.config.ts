import { createClient } from "redis";

import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";

export const redis = createClient({
 password: env.REDIS_PASSWORD,
 socket: {
  host: env.REDIS_SOCKET_HOST,
  port: env.REDIS_SOCKET_PORT,
 },
});
