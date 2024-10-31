import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
 NODE_ENV: str({
  devDefault: testOnly("test"),
  choices: ["development", "production", "test"],
 }),
 HOST: host({ devDefault: testOnly("localhost") }),
 PORT: port({ devDefault: testOnly(3000) }),
 TCP_PORT: port({ devDefault: testOnly(8081) }),
 CORS_ORIGIN: str({ devDefault: testOnly("http://localhost:3000") }),
 COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
 COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
 S3_ACCESS_KEY_ID: str({ devDefault: testOnly("") }),
 S3_SECRET_ACCESS_KEY: str({ devDefault: testOnly("") }),
 S3_REGION: str({ devDefault: testOnly("") }),
 HLS_TARGET_DURATION: str({
  devDefault: testOnly("25"),
 }),
 HLS_PLAYLIST_LENGTH: str({
  devDefault: testOnly("25"),
 }),
 HLS_MAX_FILES: str({
  devDefault: testOnly("25"),
 }),
 REDIS_PASSWORD: str({
  devDefault: testOnly("REDIS_PASSWORD"),
 }),
 REDIS_SOCKET_HOST: str({
  devDefault: testOnly("REDIS_SOCKET_HOST"),
 }),
 REDIS_SOCKET_PORT: num({ devDefault: testOnly(1000) }),
});
