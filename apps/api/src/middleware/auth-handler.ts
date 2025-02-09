import { BAD_REQUEST } from '@/controllers/response'
import Environment from '@/environment'

import { Handler, NextFunction, Response, Request } from 'express'

const authHandler = (env: Environment): Handler => {
  const { config } = env
  const { apiKey } = config.server

  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.get('x-api-key') !== apiKey) {
      return BAD_REQUEST(res)
    }

    return next()
  }
}

export default authHandler
