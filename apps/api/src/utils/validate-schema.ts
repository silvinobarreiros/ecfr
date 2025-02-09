import { Err, Ok, Result } from 'ts-results-es'
import { z } from 'zod'

const validateSchema = (schema: z.ZodObject<any>, data: any): Result<void, Error> => {
  const result = schema.safeParse(data)

  if (!result.success) {
    const { error } = result
    const errors = error.errors.map((e) => `${e.path}: ${e.message}`).join('\n')
    const message = `Error parsing object: ${errors}`

    return Err(new Error(message))
  }

  return Ok(undefined)
}

export default validateSchema
