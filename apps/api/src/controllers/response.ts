import logger from '@/logger'
import { errorFromResult } from '@/utils/error'
import { Response } from 'express'
import { Result } from 'ts-results-es'

export interface TypedResponse<T> extends Omit<Response, 'json'> {
  json: (data: T) => this
}

interface Headers {
  [key: string]: string
}

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' }

enum ErrorCodes {
  API_ERROR = 'api_error',
  INVALID_REQUEST_ERROR = 'invalid_request_error',
  NOT_AUTHORIZED = 'not_authorized',
}

export const buildResponse = <T>(
  res: TypedResponse<T>,
  status: number,
  body: T,
  additionalHeaders?: Headers
): void => {
  res
    .set({ ...DEFAULT_HEADERS, ...additionalHeaders })
    .status(status)
    .json(body)
}

type SuccessFunc<T> = (res: TypedResponse<T>, body: T, additionalHeaders?: Headers) => void

export const handle =
  <T>(res: TypedResponse<T>, result: Result<T, Error>) =>
  (success: SuccessFunc<T>) => {
    if (result.isOk()) {
      success(res, result.value)
    } else {
      const error = errorFromResult('Error handling request', result)
      logger.error(error)

      INTERNAL_SERVER_ERROR(res)
    }
  }

export function ok<T>(res: TypedResponse<T>, body: T, additionalHeaders?: Headers) {
  return buildResponse(res, 200, body, additionalHeaders ?? {})
}

export function accepted<T>(res: TypedResponse<T>, body: T, additionalHeaders?: Headers) {
  return buildResponse(res, 202, body, additionalHeaders ?? {})
}

export function created<T>(res: TypedResponse<T>, body: T, additionalHeaders?: Headers) {
  return buildResponse(res, 201, body, additionalHeaders ?? {})
}

export function noContent<T>(res: TypedResponse<T>, body: T, additionalHeaders?: Headers) {
  return buildResponse(res, 204, {} as T, additionalHeaders ?? {})
}

export const UNAUTHORIZED_REQUEST = (res: Response) =>
  buildResponse(res, 401, {
    error_code: ErrorCodes.NOT_AUTHORIZED,
    message: 'Unauthorized request',
  })

export const BAD_REQUEST = (res: Response) =>
  buildResponse(res, 400, {
    error_code: ErrorCodes.INVALID_REQUEST_ERROR,
    message: 'Bad request',
  })

export const LIMIT_EXCEEDED = (res: Response) =>
  buildResponse(res, 422, {
    error_code: ErrorCodes.INVALID_REQUEST_ERROR,
    message: 'Limit exceeded on the keys',
  })

export const FORBIDDEN = (res: Response) =>
  buildResponse(res, 403, {
    error_code: ErrorCodes.NOT_AUTHORIZED,
    message: 'Not authorized to make this request',
  })

export const USER_EXISTS = (res: Response) =>
  buildResponse(res, 409, {
    error_code: ErrorCodes.INVALID_REQUEST_ERROR,
    message: 'User already exists',
  })

export const BUSSINESS_EXISTS = (res: Response) =>
  buildResponse(res, 409, {
    error_code: ErrorCodes.INVALID_REQUEST_ERROR,
    message: 'Bussiness already exists',
  })

export const INTERNAL_SERVER_ERROR = (res: Response) =>
  buildResponse(
    res,
    500,
    {
      error_code: ErrorCodes.API_ERROR,
      message: 'An internal error has occurred',
    },
    { 'X-Amzn-ErrorType': 'InternalFailureException' }
  )
