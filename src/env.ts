import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  AUTH_SECRET: z.string(),
  API_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
})

envSchema.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
