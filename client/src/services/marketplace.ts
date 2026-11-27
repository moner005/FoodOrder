import { apiClient } from "@/services/apiClient";
import type { Meal, Restaurant } from "@/types/marketplace";

export async function getRestaurants() {
  return (await apiClient.get<Restaurant[]>("restaurants")).data;
}

export async function getRestaurant(id: string) {
  return (await apiClient.get<Restaurant>(`restaurants/${encodeURIComponent(id)}`)).data;
}

export async function getMeals(restaurantId?: string) {
  const endpoint = restaurantId
    ? `meals/restaurant/${encodeURIComponent(restaurantId)}`
    : "meals";
  return (await apiClient.get<Meal[]>(endpoint)).data;
}

export async function getMeal(id: string) {
  return (await apiClient.get<Meal>(`meals/${encodeURIComponent(id)}`)).data;
}
