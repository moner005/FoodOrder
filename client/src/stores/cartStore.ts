
import { create } from 'zustand'
import type { CartLine } from '@/types/cart'

interface CartStore {
  items: CartLine[]
  addToCart: (mealId: string) => void
  clear: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addToCart: (mealId) =>
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.mealId === mealId,
      )

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.mealId === mealId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }
      }

      return {
        items: [
          ...state.items,
          {
            mealId,
            quantity: 1,
            note: '',
          },
        ],
      }
    }),

  clear: () => set({ items: [] }),
}))
