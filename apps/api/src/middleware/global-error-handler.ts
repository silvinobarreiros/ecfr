import { Request, Response } from 'express'

const unexpectedErrorCode = -1

export default (err: any, _req: Request, res: Response, _next: (...args: any[]) => any): void => {
  res.status(500).json({
    message: err.message || '',
    code: unexpectedErrorCode,
  })
}
