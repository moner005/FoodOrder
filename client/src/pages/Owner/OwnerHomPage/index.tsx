import { useNavigate } from "react-router-dom";
import MealCard from "../../../components/menu/MealCard";
import type { MenuItem } from "../../../types/menu";
import { useState } from "react";
import { routes } from "@/constants/routes";

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
    price: 6.99,
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

export default function OwnerHomePage() {
    const [meals, setMeals] = useState<MenuItem[]>(mockMenuItems);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const navigate = useNavigate()

    function handleToggleAvailability(id: string) {
        setMeals((prevMeals) =>
            prevMeals.map((meal) =>
                meal.id === id ? { ...meal, isAvailable: !meal.isAvailable } : meal
            )
        );
    } 

    function handleEditMeal(id: string) {
        navigate(routes.ownerMenuEdit(id));
    }

  return (
    <div>
      <h1>Owner Home Page</h1>
      <button onClick={() => navigate(routes.ownerMenuNew)}>Add New Meal</button>
      <input
        type="text"
        placeholder="Search meals..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="all">All Categories</option>
        <option value="appetizers">Appetizers</option>
        <option value="mains">Mains</option>
        <option value="desserts">Desserts</option>
      </select>
      <div className="menu-grid">
        {meals.map((item) => (
          <MealCard
            key={item.id}
            menuItem={item}
            onToggleAvailability={handleToggleAvailability}
            onEdit={handleEditMeal}
            onDelete={() => {}}
          />
        ))}
      </div>
    </div>
  );
}