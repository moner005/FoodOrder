import type { CartLine } from "@/types/cart";

const LEGACY_CART_KEY = "foodorder-cart-v2";

export interface CheckoutCartItem {
  key: string;
  mealId: string;
  name?: string;
  description?: string;
  quantity: number;
  note: string;
  imageUrl?: string;
}

type CartLineWithDetails = CartLine & {
  name?: unknown;
  description?: unknown;
  imageUrl?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapCurrentCart(lines: CartLine[]): CheckoutCartItem[] {
  return lines
    .filter(
      (line) =>
        typeof line.mealId === "string" &&
        Number.isInteger(line.quantity) &&
        line.quantity > 0,
    )
    .map((line, index) => {
      const details = line as CartLineWithDetails;

      return {
        key: `${line.mealId}-${index}`,
        mealId: line.mealId,

        name: typeof details.name === "string" ? details.name : undefined,

        description:
          typeof details.description === "string"
            ? details.description
            : undefined,

        imageUrl:
          typeof details.imageUrl === "string" ? details.imageUrl : undefined,

        quantity: line.quantity,

        note: typeof line.note === "string" ? line.note : "",
      };
    });
}

function readLegacyCart(): CheckoutCartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(LEGACY_CART_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.reduce<CheckoutCartItem[]>((result, item, index) => {
      if (!isRecord(item)) return result;

      const validId =
        typeof item.id === "number" || typeof item.id === "string";

      const validItem =
        validId &&
        typeof item.name === "string" &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0;

      if (!validItem) return result;

      result.push({
        key: `${item.id}-${index}`,
        mealId: String(item.id),
        name: item.name as string,

        description:
          typeof item.description === "string" ? item.description : undefined,

        imageUrl: typeof item.image === "string" ? item.image : undefined,

        quantity: item.quantity as number,
        note: "",
      });

      return result;
    }, []);
  } catch {
    return [];
  }
}

export function getCheckoutCartItems(
  currentItems: CartLine[],
): CheckoutCartItem[] {
  if (currentItems.length > 0) {
    return mapCurrentCart(currentItems);
  }

  // Compatibility with Lamis's previous cart implementation.
  return readLegacyCart();
}
