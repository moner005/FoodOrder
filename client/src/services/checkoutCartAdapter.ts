
import type { CartLine } from '@/types/cart';

export interface CheckoutCartItem {
  key: string;
  mealId: string;
  name?: string;
  description?: string;
  quantity: number;
  note: string;
  imageUrl?: string;
  price?: number;
}

export function getCheckoutCartItems(
  lines: CartLine[],
): CheckoutCartItem[] {
  return lines
    .filter(
      (item) =>
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    )
    .map((item) => ({
      key: item.mealId,
      mealId: item.mealId,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      note: item.note ?? '',
      imageUrl: item.imageUrl,
      price: item.price,
    }));
}
