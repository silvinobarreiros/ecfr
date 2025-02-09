import { ErrImpl } from 'ts-results-es'

export const errorFromResult = (msg: string, result: ErrImpl<Error>): Error => {
  const { error } = result
  return new Error(`${msg}: caused by: ${error.message}`, { cause: error })
}
