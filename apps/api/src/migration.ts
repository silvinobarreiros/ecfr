/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
/* eslint-disable no-template-curly-in-string */
import dotenv from 'dotenv'

import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import config from '../drizzle.config'

const { Client } = pg
const { out } = config

const env = process.argv[2] || 'local'

console.log(`Running migration for ${env} environment`)

const envFile = env === 'prod' ? '.env' : '.env.local'
dotenv.config({ path: envFile, override: true })

console.log(`Using ${envFile} for environment variables`)

const dbCredentials = {
  user: process.env.DB_ADMIN_USER || 'postgres',
  password: process.env.DB_ADMIN_PASSWORD || 'password',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_DATABASE || 'tradish',
  ssl: process.env.DB_SSL === 'true',
}

const migrationsFolder = out?.replaceAll('./', '') || 'migrations'

const initializeSetupMigration = (): string => {
  const username = process.env.DB_APP_USER!
  const password = process.env.DB_APP_PASSWORD!
  const { database } = dbCredentials

  if (!username || !password) {
    throw new Error('DB_APP_USER and DB_APP_PASSWORD must be set in the environment')
  }

  return `
DO
$do$
BEGIN
    IF NOT EXISTS (
        SELECT
        FROM   pg_catalog.pg_user
        WHERE  usename = '${username}') THEN
        CREATE USER ${username} WITH ENCRYPTED PASSWORD '${password}';
    END IF;
END
$do$;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT CONNECT ON DATABASE "${database}" TO ${username};
GRANT USAGE ON SCHEMA public TO ${username};
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${username};
GRANT SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO ${username};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${username};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, UPDATE ON SEQUENCES TO ${username};
`
}

console.log('Starting migration...')

// Run the migration
const client = new Client(dbCredentials)

const runMigrations = async () => {
  await client.connect()
  const db = drizzle(client)

  const setupMigration = initializeSetupMigration()

  await client.query(setupMigration)

  await migrate(db, {
    migrationsFolder,
    migrationsSchema: 'public',
    migrationsTable: 'drizzle_history',
  })
  await client.end()
}

runMigrations()
  .then(() => {
    console.log('Migration completed')
  })
  .catch((err) => {
    console.error('Migration failed', err)
  })
