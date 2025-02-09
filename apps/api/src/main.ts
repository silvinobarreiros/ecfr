import Environment, { loadEnv } from '@/environment'
import logger from '@/logger'
import Server from '@/server'

const SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT']
const SHUTDOWN_TIMEOUT_MILLIS = 10000

const main = (env: Environment) => {
  const server = new Server(env)

  server.start()

  SHUTDOWN_SIGNALS.forEach((signal) => process.on(signal, shutdown(env, server)))
}

const formatStdErr = (msg: string) => JSON.stringify({ level: 'error', message: msg })

const shutdown = (env: Environment, server: Server) => async (signal: string) => {
  logger.info(`🛎  Shutdown initiated with signal ${signal}`)

  setTimeout(() => {
    const error = `Could not close connections in ${SHUTDOWN_TIMEOUT_MILLIS}ms, forcefully shutting down`
    process.stderr.write(formatStdErr(error))

    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MILLIS)

  await server.stop()
  process.stderr.write(formatStdErr('Completed graceful shutdown'))
  process.exit(0)
}

const errorHandler = (error: any) => {
  process.stderr.write(formatStdErr(`Fatal application error: ${error}`))
  process.kill(process.pid, 'SIGINT')
}

loadEnv()
  .then((env) => (env.isErr() ? errorHandler(env.error) : main(env.value)))
  .catch(errorHandler)
