export interface MealCategory {
  id: string
  name: string
}

export interface Meal {
  id: string
  name: string
  description: string
  categoryId: string
  priceMinor: number
  imageUrl: string
  available: boolean
  dietaryLabels: string[]
  allergens: string[]
}
