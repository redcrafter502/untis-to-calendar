import { createEnv } from "@t3-oss/env-nextjs";
import { type } from "arktype";

export const env = createEnv({
  server: {
    UPSASH__REDIS_REST_URL: type("string"),
    UPSASH_REDIS_REST_TOKEN: type("string"),
    NODE_ENV: type("'development' | 'test' | 'production' | undefined").pipe(
      (v) => v ?? "development",
    ),
  },
  client: {},
  runtimeEnv: {
    UPSASH_REDIS_REDIS_URL: process.env.UPSASH_REDIS_REST_URL,
    UPSASH_REDIS_REDIS_TOKEN: process.env.UPSASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
