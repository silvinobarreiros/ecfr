export type ErrorMessage = {
  code: number
  message: string
}

export const AGREEMENT_TYPE_NOT_SUPPORTED: ErrorMessage = {
  code: 0,
  message: 'Agreement type not supported',
}
