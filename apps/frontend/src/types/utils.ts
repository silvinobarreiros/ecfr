import { z } from 'zod'

export type Validator<T> = (data?: any) => data is T
export type ListValidator<T> = (data?: any[]) => data is T[]

export const validateSchema =
  <T>(schema: z.ZodObject<any> | z.ZodType<any>): Validator<T> =>
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

export const validateSchemas =
  <T>(schema: z.ZodArray<z.ZodObject<any>> | z.ZodArray<z.ZodType<any>>): ListValidator<T> =>
  (data?: any[]): data is T[] => {
    if (data === null || data === undefined) {
      return false
    }

    // console.log('data', JSON.stringify(data, null, 2))

    const result = schema.safeParse(data)
    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error('schema array parsing error', result.error)
      return false
    }

    return true
  }

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
