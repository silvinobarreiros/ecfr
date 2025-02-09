import morgan from 'morgan'
import { RequestHandler, Request, Response } from 'express'
import logger from '@/logger'

const jsonFormat = (tokens: any, req: Request, res: Response) =>
  JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    res: {
      length: tokens.res(req, res, 'content-length'),
      time: `${tokens['response-time'](req, res)} ms`,
    },
    user: {
      // Add more custom fields if needed
      userAgent: tokens['user-agent'](req, res),
    },
  })

export default (): RequestHandler => {
  const options = {
    stream: {
      write: (log: any) => {
        logger.info(JSON.parse(log))
      },
    },
  }

  return morgan(jsonFormat, options)
}
