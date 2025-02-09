import { z } from 'zod'

type Validator<T> = (data?: any) => data is T

export const validateSchema =
  <T>(schema: z.ZodObject<any>): Validator<T> =>
  (data?: any): data is T => {
    if (data === null || data === undefined) {
      return false
    }

    const result = schema.safeParse(data)
    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error('schema parsing error', result.error)
      return false
    }

    return true
  }
