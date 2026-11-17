import type { MenuItem } from "@/types/menu";
import { CURRENT_RESTAURANT_ID } from "@/constants/restaurant";

export const mockMenu: MenuItem[] = [
  {
    id: "m1",
    restaurantId: CURRENT_RESTAURANT_ID,
    name: "Margherita Pizza",
    description: "Tomato, mozzarella and fresh basil.",
    price: 8.5,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2KQjChMbKPJ0gMEIkqJNPwYJKlEX07PlC9_CgaJHevg&s=10",
    category: "mains",
    isAvailable: true,
  },
  {
    id: "m2",
    restaurantId: CURRENT_RESTAURANT_ID,
    name: "Caesar Salad",
    description: "Romaine, parmesan and croutons.",
    price: 5.25,
    imageUrl: "https://www.budgetbytes.com/wp-content/uploads/2024/03/Caesar-Salad-Plated.jpg",
    category: "starters",
    isAvailable: true,
  },
  {
    id: "m3",
    restaurantId: CURRENT_RESTAURANT_ID,
    name: "Lemon Mint Juice",
    description: "Fresh and cold.",
    price: 2.5,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSI_hGuslpDBdi8MAIFuzc7pR9T3xs15RttZ7xnECIGlg&s=10",
    category: "drinks",
    isAvailable: false,
  },
  {
    id: "m4",
    restaurantId: CURRENT_RESTAURANT_ID,
    name: "Chocolate Cake",
    description: "Warm, with a molten center.",
    price: 4.75,
    imageUrl: "https://assets.epicurious.com/photos/61f4370abf67bb5e52649829/2:3/w_3068,h_4602,c_limit/DoubleDhocolateLayerCake_RECIPE_012622_26397.jpg",
    category: "desserts",
    isAvailable: true,
  },
  {
    id: "m5",
    restaurantId: CURRENT_RESTAURANT_ID,
    name: "Spaghetti Carbonara",
    description: "Pasta with pancetta, egg and parmesan.",
    price: 9.0,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5j2VfeSybRX5jmETFWbG1C6eBD9TbkmkSF7dDU-DnORh7LXir8cskOocm&s=10",
    category: "mains",
    isAvailable: true,
  },
  {
    id: "m6",
    restaurantId: CURRENT_RESTAURANT_ID,
    name: "Garlic Bread",
    description: "Toasted with garlic butter.",
    price: 3.0,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQasCAjHcODgbNRCDDyvJQKMyzX7nhGPrBXy8VI4nnbkQ&s=10",
    category: "starters",
    isAvailable: true,
  }
];

const MENU_KEY = "menu";

export type MealData = Omit<MenuItem, "id" | "restaurantId">;
type SaveResult = { ok: boolean; message?: string };

function saveMenu(items: MenuItem[]): void {
  localStorage.setItem(MENU_KEY, JSON.stringify(items));
}

export function getMenu(): MenuItem[] {
  try {
    const stored = localStorage.getItem(MENU_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading menu from localStorage:", error);
  }
  try {
    saveMenu(mockMenu);
  } catch (error) {
    console.error("Error seeding menu in localStorage:", error);
  }
  return mockMenu;
}

export function getMealById(id: string): MenuItem | undefined {
  return getMenu().find((meal) => meal.id === id);
}

export function toggleMealAvailability(id: string): MenuItem[] {
  const updated = getMenu().map((meal) =>
    meal.id === id ? { ...meal, isAvailable: !meal.isAvailable } : meal,
  );
  try {
    saveMenu(updated);
  } catch (error) {
    console.error("Error saving menu:", error);
  }
  return updated;
}

export function deleteMeal(id: string): MenuItem[] {
    const updated = getMenu().filter((meal) => meal.id !== id);
  try {
    saveMenu(updated);
  } catch (error) {
    console.error("Error saving menu:", error);
  }
  return updated;
}

export function addMeal(restaurantId: string, data: MealData): SaveResult {
  try {
    saveMenu([
      ...getMenu(),
      { ...data, restaurantId, id: crypto.randomUUID() },
    ]);
    return { ok: true };
  } catch (error) {
    console.error("Error adding meal:", error);
    return { ok: false, message: "Could not save the meal. Please try again." };
  }
}

export function updateMeal(id: string, data: MealData): SaveResult {
  const menu = getMenu();
  if (!menu.some((meal) => meal.id === id)) {
    return { ok: false, message: "Meal not found." };
  }
  try {
    saveMenu(
      menu.map((meal) => (meal.id === id ? { ...meal, ...data } : meal)),
    );
    return { ok: true };
  } catch (error) {
    console.error("Error updating meal:", error);
    return { ok: false, message: "Could not save the meal. Please try again." };
  }
}
