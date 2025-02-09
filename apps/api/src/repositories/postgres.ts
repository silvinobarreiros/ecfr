import { Configuration } from '@/config'
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { Result } from 'ts-results-es'
import { Repositories } from '.'

const { Pool } = pg

export type Database = NodePgDatabase<Record<string, never>>

export const createDbConnection = (config: Configuration): Result<Database, Error> => {
  const { database } = config

  const ssl = database.ssl ? { rejectUnauthorized: false } : false
  const pool = new Pool({
    ...database,
    ssl,
    max: 10,
    connectionTimeoutMillis: 120000,
    statement_timeout: 300000,
    query_timeout: 300000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 1000,
    idleTimeoutMillis: 60000,
  })

  return Result.wrap(() => drizzle(pool, { logger: false }))
}

export const createRepositories = (connection: Database): Repositories => ({})
