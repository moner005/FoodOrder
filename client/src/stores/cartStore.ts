import { create } from 'zustand'
import type { CartLine } from '@/types/cart'

interface CartStore { items: CartLine[]; clear: () => void }
export const useCartStore = create<CartStore>((set) => ({ items: [], clear: () => set({ items: [] }) }))
