export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'starters' | 'mains' | 'drinks' | 'desserts';
  isAvailable: boolean;
}