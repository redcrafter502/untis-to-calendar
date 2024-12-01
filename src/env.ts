import {z} from 'zod'

const envSchema = z.object({
    PORT: z.string(),
    AUTH_SECRET: z.string(),
    API_URL: z.string().url(),
    DB_SSL_REQUIRED: z.enum(['true', 'false']),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_DATABASE: z.string(),
    DB_HOST: z.string(),
    DB_DIALECT: z.enum(['mysql', 'postgres', 'sqlite', 'mariadb', 'mssql', 'db2', 'snowflake', 'oracle']),
    DB_POOL_MAX: z.string(),
    DB_POOL_MIN: z.string(),
    DB_POOL_ACQUIRE: z.string(),
    DB_POOL_IDLE: z.string(),
})

envSchema.parse(process.env)

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envSchema>{}
    }
}
