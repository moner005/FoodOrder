export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  image: string | null;
  cuisine: string;
  status: string;
  isOpen: boolean;
  deliveryFee: string;
  minimumSubtotal: string;
  deliveryAreas: string[];
}

export interface Meal {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  isAvailable: boolean;
  category: { id: string; name: string } | null;
  restaurant?: Pick<Restaurant, "id" | "name" | "status" | "isOpen">;
}

export function amountToMinor(amount: number | string): number {
  const match = String(amount).match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) throw new Error("The server returned an invalid price.");
  const minor = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  if (!Number.isSafeInteger(minor)) throw new Error("The price is outside the supported range.");
  return minor;
}

export function formatMinor(minor: number): string {
  return `$${(minor / 100).toFixed(2)}`;
}
