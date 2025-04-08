import { createEnv } from "@t3-oss/env-nextjs";
import { type } from "arktype";

export const env = createEnv({
  server: {
    UPSTASH_REDIS_REST_URL: type("string"),
    UPSTASH_REDIS_REST_TOKEN: type("string"),
    NODE_ENV: type("'development' | 'test' | 'production' | undefined").pipe(
      (v) => v ?? "development",
    ),
  },
  client: {},
  runtimeEnv: {
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
