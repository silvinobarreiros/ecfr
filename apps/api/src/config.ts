import { Result, Err, Ok } from 'ts-results-es'
import { z } from 'zod'

const Env = z.enum(['development', 'production', 'local'])
type NodeEnv = z.infer<typeof Env>

export type Configuration = {
  env: NodeEnv
  server: {
    port: number
    apiKey: string
    cacheLocation: string
  }
}

const configSchema = z.object({
  NODE_ENV: Env.optional().default('development'),

  PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .default('4535'),

  API_KEY: z.string(),
  CACHE_LOCATION: z.string().default('./db-json'),
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
      cacheLocation: config.data.CACHE_LOCATION,
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
  }

  return redacted
}
