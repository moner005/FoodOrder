import type { CartLine } from "@/types/cart";
import type { Meal, Restaurant } from "@/types/marketplace";
import { amountToMinor } from "@/types/marketplace";

export interface CartGroup {
  restaurant: Restaurant;
  lines: Array<{ line: CartLine; meal: Meal }>;
  subtotalMinor: number;
  feeMinor: number;
  minimumMinor: number;
}

export interface CartQuote {
  groups: CartGroup[];
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
  commonAreas: string[];
  areaRequired: boolean;
  issues: string[];
}

export function quoteCart(lines: CartLine[], meals: Map<string, Meal | null>, restaurants: Restaurant[], selectedArea?: string): CartQuote {
  const venues = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
  const groupMap = new Map<string, CartGroup>();
  const issues: string[] = [];
  for (const line of lines) {
    const meal = meals.get(line.mealId);
    const restaurant = venues.get(meal?.restaurantId ?? line.restaurantId ?? "");
    if (!meal || !restaurant) { issues.push(`${line.name || "A cart item"} is no longer available in the catalog.`); continue; }
    if (!meal.isAvailable) issues.push(`${meal.name} is sold out.`);
    if (restaurant.status !== "ACTIVE" || !restaurant.isOpen) issues.push(`${restaurant.name} is closed or not accepting orders.`);
    const group = groupMap.get(restaurant.id) ?? { restaurant, lines: [], subtotalMinor: 0, feeMinor: amountToMinor(restaurant.deliveryFee), minimumMinor: amountToMinor(restaurant.minimumSubtotal) };
    group.lines.push({ line, meal });
    group.subtotalMinor += amountToMinor(meal.price) * line.quantity;
    groupMap.set(restaurant.id, group);
  }
  const groups = [...groupMap.values()];
  for (const group of groups) if (group.subtotalMinor < group.minimumMinor) issues.push(`${group.restaurant.name} requires ${formatMinor(group.minimumMinor)} in food before its delivery fee.`);
  const restricted = groups.filter((group) => group.restaurant.deliveryAreas.length > 0);
  let commonAreas = restricted[0]?.restaurant.deliveryAreas ?? [];
  for (const group of restricted.slice(1)) {
    const allowed = new Set(group.restaurant.deliveryAreas.map(normalize));
    commonAreas = commonAreas.filter((area) => allowed.has(normalize(area)));
  }
  const areaRequired = restricted.length > 0;
  if (areaRequired && commonAreas.length === 0) issues.push("These restaurants have no shared delivery area.");
  if (selectedArea && areaRequired && !commonAreas.some((area) => normalize(area) === normalize(selectedArea))) issues.push("Choose a delivery area served by every restaurant in this cart.");
  const subtotalMinor = groups.reduce((sum, group) => sum + group.subtotalMinor, 0);
  const deliveryFeeMinor = groups.reduce((sum, group) => sum + group.feeMinor, 0);
  return { groups, subtotalMinor, deliveryFeeMinor, totalMinor: subtotalMinor + deliveryFeeMinor, commonAreas, areaRequired, issues: [...new Set(issues)] };
}

function normalize(value: string) { return value.trim().replace(/\s+/g, " ").toLocaleLowerCase(); }
function formatMinor(value: number) { return `$${(value / 100).toFixed(2)}`; }
