import loadConfig, { Configuration, redact } from '@/config'
import logger from '@/logger'
import { Repositories } from '@repos/index'
import { createDbConnection, createRepositories } from '@repos/postgres'
import { Ok, Result } from 'ts-results-es'

export default interface Environment {
  startup: Date
  config: Configuration
  repositories: Repositories
}

export const loadEnv = async (): Promise<Result<Environment, Error>> => {
  const startup = new Date()
  const configResult = loadConfig()

  if (configResult.isErr()) {
    return configResult
  }

  const config = configResult.value

  logger.info('🔧 Configuration loaded:', redact(config))

  const connectionResult = createDbConnection(config)
  if (connectionResult.isErr()) {
    return connectionResult
  }

  const connection = connectionResult.value

  logger.info('🔗 Database connection established')

  const repositories = createRepositories(connection)

  return Ok({
    startup,
    logger,
    config,
    connection,
    repositories,
  })
}
