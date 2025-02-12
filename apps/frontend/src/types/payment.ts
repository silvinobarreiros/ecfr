export type PaymentTier = 'basic' | 'premium' | 'non-subscription'
export type PaymentInterval = 'month' | 'year' | 'once'

export type PaymentCard = {
  id: string
  cardNumber: string
  cardType: string
  primary?: boolean
}
