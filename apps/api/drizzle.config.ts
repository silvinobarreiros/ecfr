import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const dbCredentials = {
  user: process.env.DB_ADMIN_USER || 'postgres',
  password: process.env.DB_ADMIN_PASSWORD || 'tradish',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'tradish',
}

const config = defineConfig({
  schema: './src/models/*.ts',
  dialect: 'postgresql',
  out: './migrations',
  dbCredentials,
})

export default config
