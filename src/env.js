import { createEnv } from "@t3-oss/env-nextjs";
import { type } from "arktype";

export const env = createEnv({
  server: {
    NODE_ENV: type("'development' | 'test' | 'production' | undefined").pipe(
      (v) => v ?? "development",
    ),
  },
  client: {},
  runtimeEnv: {},
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
