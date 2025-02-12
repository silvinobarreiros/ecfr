import { createServer, Server as HttpServer } from 'http'
import express, { Application } from 'express'
import controllers from '@/controllers'
import Environment from '@/environment'
import logger from '@/logger'
import RequestLogger from '@/middleware/request-logger'
import globalErrorHandler from '@/middleware/global-error-handler'
import cors from '@/middleware/cors'
import bodyParserCamelCase from './middleware/body-parser'
import getRoutes from './utils/print-routes'

/**
 * Initialize the express application
 * @param environment
 * @returns
 */
const initializeApp = (environment: Environment): Application => {
  const routers = controllers(environment)

  const app = express()
    .use(bodyParserCamelCase)
    .use(cors)
    .use(RequestLogger())
    .use(...routers)
    .use(globalErrorHandler)

  const jsonRoutes = getRoutes(app)
  logger.info(`🔗  API routes:`, { routes: jsonRoutes })

  return app
}

export default class Server {
  private httpServer: HttpServer

  constructor(private environment: Environment) {
    const app = initializeApp(environment)

    this.httpServer = createServer(app)
  }

  public start(): void {
    const { port } = this.environment.config.server

    this.httpServer.listen({ port }, () => {
      logger.info(`🚀  Server ready at http://localhost:${port}`)
      logger.info(`Current directory: ${process.cwd()}`)
    })
  }

  public stop(): Promise<void> {
    return new Promise((res) =>
      this.httpServer.close((error) => {
        if (error) {
          logger.error(`🛩  Error while trying to shut down server: ${error.message}`)
        } else {
          logger.info('🛩  Hasta la vista, baby. Gracefully shutting down server')
        }
        res()
      })
    )
  }
}
