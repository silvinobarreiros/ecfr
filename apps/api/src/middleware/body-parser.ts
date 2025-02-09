import { NextFunction, Request, Response } from 'express'
import camelcaseKeys from 'camelcase-keys'

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = camelcaseKeys(req.body, { deep: true })
  }

  next()
}
