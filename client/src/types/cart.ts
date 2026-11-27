export interface CartLine {
  mealId: string;
  restaurantId?: string;
  restaurantName?: string;
  quantity: number;
  note: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

export interface CartState {
  items: CartLine[];
}