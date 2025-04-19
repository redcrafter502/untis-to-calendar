import { createEnv } from "@t3-oss/env-nextjs";
import { type } from "arktype";

export const env = createEnv({
  server: {
    NEXT_PUBLIC_STACK_PROJECT_ID: type("string"),
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: type("string"),
    STACK_SECRET_SERVER_KEY: type("string"),
    UPSTASH_REDIS_REST_URL: type("string"),
    UPSTASH_REDIS_REST_TOKEN: type("string"),
    NODE_ENV: type("'development' | 'test' | 'production' | undefined").pipe(
      (v) => v ?? "development",
    ),
  },
  client: {},
  runtimeEnv: {
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:
      process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
