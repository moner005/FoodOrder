import type { MenuItem } from '../types/menu';

const MENU_KEY='menu'

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    restaurantId: '1',
    name: 'Spaghetti Bolognese',
    description: 'Classic Italian pasta dish with rich meat sauce.',
    price: 12.99,
    imageUrl: 'https://example.com/images/spaghetti-bolognese.jpg',
    category: 'mains',
    isAvailable: true,
  },
  {
    id: '2',
    restaurantId: '1',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with Caesar dressing and croutons.',
    price: 8.99,
    imageUrl: 'https://example.com/images/caesar-salad.jpg',
    category: 'starters',
    isAvailable: true,
  },
  {
    id: '3',
    restaurantId: '1',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a gooey center.',
    price           : 6.99,
    imageUrl: 'https://example.com/images/chocolate-lava-cake.jpg',
    category: 'desserts',
    isAvailable: false,
  },
  {
    id: '4',
    restaurantId: '1',
    name: 'Margarita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil.',
    price: 10.99,
    imageUrl: 'https://example.com/images/margarita-pizza.jpg',
    category: 'mains',
    isAvailable: true,
  },
  {
    id: '5',
    restaurantId: '1',
    name: 'Lemonade',
    description: 'Refreshing homemade lemonade.',
    price: 3.99,
    imageUrl: 'https://example.com/images/lemonade.jpg',
    category: 'drinks',
    isAvailable: true,
  },
];
localStorage.setItem(MENU_KEY, JSON.stringify(mockMenuItems));

function getMenu(): MenuItem[] {
  const menuString = localStorage.getItem(MENU_KEY);
  if (menuString) {
    try {
      return JSON.parse(menuString) as MenuItem[];
    } catch (error) {
      console.error('Error parsing menu from localStorage:', error);
      return [];
    }
  }
  return [];
}

function saveMenu(menu: MenuItem[]): void {
  try {
    const menuString = JSON.stringify(menu);
    localStorage.setItem(MENU_KEY, menuString);
  } catch (error) {
    console.error('Error saving menu to localStorage:', error);
  }
}

function toggleMealAvailability(id: string): MenuItem[] {
  const menu = getMenu();
  const updatedMenu = menu.map((meal) =>
    meal.id === id ? { ...meal, isAvailable: !meal.isAvailable } : meal
  );
  saveMenu(updatedMenu);
  return updatedMenu;
}

function deleteMeal(id: string): MenuItem[] {
  const menu = getMenu();
  const updatedMenu = menu.filter((meal) => meal.id !== id);
  saveMenu(updatedMenu);
  return updatedMenu;
}

type MealData = Omit<MenuItem, 'id' | 'restaurantId'>;

function getMealById(id: string): MenuItem | undefined {
  return getMenu().find((meal) => meal.id === id)
}

function addMeal(restaurantId: string, data: MealData): { ok: boolean; message?: string } {
  const menu = getMenu()
  saveMenu([...menu, { ...data, restaurantId, id: crypto.randomUUID() }])
  return { ok: true }
}

function updateMeal(id: string, data: MealData): { ok: boolean; message?: string } {
  const menu = getMenu()
  if (!menu.some((meal) => meal.id === id)) {
    return { ok: false, message: 'Meal not found.' }
  }
  saveMenu(menu.map((meal) => (meal.id === id ? { ...meal, ...data } : meal)))
  return { ok: true }
}

export { getMenu, saveMenu, toggleMealAvailability, deleteMeal, getMealById, addMeal, updateMeal };