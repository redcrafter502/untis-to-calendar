import { Redis } from "@upstash/redis";
import { env } from "@/env";

export const redis = new Redis({
  url: env.UPSASH_REDIS_REDIS_URL,
  token: env.UPSASH_REDIS_REDIS_TOKEN,
});
