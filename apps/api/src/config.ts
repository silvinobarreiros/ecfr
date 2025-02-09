import { Result, Err, Ok } from 'ts-results-es'
import { z } from 'zod'

const Env = z.enum(['development', 'production', 'local'])
type NodeEnv = z.infer<typeof Env>

export type Configuration = {
  env: NodeEnv
  server: {
    port: number
    apiKey: string
  }
  database: {
    user: string
    password: string
    database: string
    host: string
    port: number
    ssl: boolean
  }
}

const configSchema = z.object({
  NODE_ENV: Env.optional().default('development'),

  PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .default('4535'),

  API_KEY: z.string(),

  DB_HOST: z.string().default('127.0.0.1'),

  DB_PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .default('5432'),

  DB_DATABASE: z.string(),
  DB_APP_USER: z.string(),
  DB_APP_PASSWORD: z.string(),
  DB_SSL: z
    .string()
    .refine((val) => ['true', 'false'].includes(val.toLowerCase()))
    .transform((str) => str.toLowerCase() === 'true'),
})

export default (): Result<Configuration, Error> => {
  const config = configSchema.safeParse(process.env)

  if (!config.success) {
    const { error } = config
    const errors = error.errors.map((e) => `${e.path}: ${e.message}`).join('\n')
    const message = `Error parsing configuration: ${errors}`

    return Err(new Error(message))
  }

  return Ok({
    env: config.data.NODE_ENV,
    server: {
      port: config.data.PORT,
      apiKey: config.data.API_KEY,
    },
    database: {
      user: config.data.DB_APP_USER,
      password: config.data.DB_APP_PASSWORD,
      database: config.data.DB_DATABASE,
      host: config.data.DB_HOST,
      port: config.data.DB_PORT,
      ssl: config.data.DB_SSL,
    },
  })
}

// ----------------------------------------------------------------------

export const redact = (config: Configuration): any => {
  const redacted = {
    ...config,
    server: {
      ...config.server,
      apiKey: 'REDACTED',
      authKey: 'REDACTED',
    },
    database: {
      ...config.database,
      password: 'REDACTED',
    },
  }

  return redacted
}
