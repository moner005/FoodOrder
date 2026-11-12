export interface Restaurant {
  id: string
  name: string
  description: string
  imageUrl: string
  cuisine: string
  address: string
  contact: { email: string }
  openingHours: { days: string; hours: string }[]
  isOpen: boolean
  currency: string
  deliveryFeeMinor: number
  minimumSubtotalMinor: number
  supportedAreas: string[]
}
