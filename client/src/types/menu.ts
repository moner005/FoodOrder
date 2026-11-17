export const MENU_CATEGORIES = ['starters', 'mains', 'drinks', 'desserts'] as const

export type MenuCategory = (typeof MENU_CATEGORIES)[number]

export interface MenuItem {
  id: string
  restaurantId: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: MenuCategory
  isAvailable: boolean
}