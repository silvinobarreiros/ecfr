import { Result } from 'ts-results-es'

export const flatten = async <T, E>(
  result: Result<Promise<Result<T, E>>, E>
): Promise<Result<T, E>> => {
  if (result.isOk()) {
    return result.value
  }

  return result
}

export const flattenAll = async <T>(
  results: Promise<Result<T, Error>>[]
): Promise<Result<T[], Error>> =>
  Result.wrapAsync<T[], Error>(async () => {
    const flattened = await Promise.all(results)

    const flattenedResults = []

    for (const result of flattened) {
      if (result.isErr()) {
        throw result.error
      }
      flattenedResults.push(result.value)
    }

    return flattenedResults
  })
