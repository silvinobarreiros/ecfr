import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import path from 'path'
import { getTableName } from 'drizzle-orm'
import { sql } from 'drizzle-orm/sql'

let container: StartedPostgreSqlContainer
let db: NodePgDatabase<Record<string, never>>

export const getTestDb = async (): Promise<{ db: NodePgDatabase<Record<string, never>> }> => {
  if (!container) {
    const postgresContainer = new PostgreSqlContainer()
      .withDatabase('test')
      .withUsername('user')
      .withPassword('password')

    container = await postgresContainer.start()

    const pool = new Pool({
      connectionString: container.getConnectionUri(),
    })

    db = drizzle(pool)

    const migrationsPath = path.join(__dirname, '../../../migrations')
    await migrate(db, { migrationsFolder: migrationsPath })
  }

  return { db }
}

// Helper to clear all tables between tests
export const clearTables = async () => {
  const { db } = await getTestDb()

  const tables = [].map(getTableName)

  const commands = tables.map((table) => db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE;`)))
  await Promise.all(commands)
}
