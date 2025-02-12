import { Ok, Result } from 'ts-results-es'

import loadConfig, { Configuration, redact } from '@/config'
import logger from '@/logger'
import { ECFRClient } from './types/ecrf-client'
import { ECFRAnalytics } from './services/analysis/ecrf-analytics'
import { WebECFRClient } from './services/ecrf/web-ecrf-client'
import { FileAnalyticsCache } from './services/analysis/analytics-cache'

export default interface Environment {
  startup: Date
  config: Configuration
  ecrfClient: ECFRClient
  ecrfAnalytics: ECFRAnalytics
}

export const loadEnv = async (): Promise<Result<Environment, Error>> => {
  const startup = new Date()
  const configResult = loadConfig()

  if (configResult.isErr()) {
    return configResult
  }

  const config = configResult.value

  logger.info('🔧 Configuration loaded:', redact(config))

  const analysisCache = new FileAnalyticsCache('./db-json')
  const ecrfClient = new WebECFRClient()

  const ecrfAnalytics = new ECFRAnalytics(ecrfClient, analysisCache)
  ecrfAnalytics.initialize()

  return Ok({
    startup,
    logger,
    config,
    ecrfClient,
    ecrfAnalytics,
  })
}
