import { Result, Err, Ok } from 'ts-results-es'

export const filterNullValues = <T extends object>(updateData: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(updateData).filter(([_, value]) => value !== null)
  ) as Partial<T>

export const extractOne = <T>(result: Result<T[], Error>, msg: string): Result<T, Error> => {
  if (result.isErr()) {
    return result
  }

  const items = result.value

  if (items === undefined || items.length === 0) {
    return Err(new Error(msg))
  }

  const item = items[0]
  if (!item) {
    return Err(new Error(msg))
  }

  return Ok(item)
}
