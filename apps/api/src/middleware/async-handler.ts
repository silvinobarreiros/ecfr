import { Request, Response } from 'express'

export default (fn: (...args: any[]) => any) =>
  (req: Request, res: Response, next: (...args: any[]) => any) =>
    Promise.resolve(fn(req, res, next)).catch(next)
