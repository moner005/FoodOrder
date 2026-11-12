import type { CartLine } from '@/types/cart'

export interface RestaurantCartIntegration {
  addMeal: ((line: CartLine) => void) | null
}

// The shared store currently exposes items and clear only. The cart owner must
// provide an action accepting mealId, quantity and note, with validation and
// normalized-note merging. Replace this adapter with a selector for that action.
// Never write to the store directly or report a successful add before integration.
export function useRestaurantCart(): RestaurantCartIntegration {
  return { addMeal: null }
}
