import { useNavigate } from "react-router-dom";
import MealCard from "../../../components/menu/MealCard";
import type { MenuItem } from "../../../types/menu";
import { useState } from "react";
import { routes } from "@/constants/routes";
import { getMenu, toggleMealAvailability, deleteMeal } from "../../../services/menuStorage";

// const mockMenuItems: MenuItem[] = [
//   {
//     id: '1',
//     restaurantId: '1',
//     name: 'Spaghetti Bolognese',
//     description: 'Classic Italian pasta dish with rich meat sauce.',
//     price: 12.99,
//     imageUrl: 'https://example.com/images/spaghetti-bolognese.jpg',
//     category: 'mains',
//     isAvailable: true,
//   },
//   {
//     id: '2',
//     restaurantId: '1',
//     name: 'Caesar Salad',
//     description: 'Crisp romaine lettuce with Caesar dressing and croutons.',
//     price: 8.99,
//     imageUrl: 'https://example.com/images/caesar-salad.jpg',
//     category: 'starters',
//     isAvailable: true,
//   },
//   {
//     id: '3',
//     restaurantId: '1',
//     name: 'Chocolate Lava Cake',
//     description: 'Warm chocolate cake with a gooey center.',
//     price: 6.99,
//     imageUrl: 'https://example.com/images/chocolate-lava-cake.jpg',
//     category: 'desserts',
//     isAvailable: false,
//   },
//   {
//     id: '4',
//     restaurantId: '1',
//     name: 'Margarita Pizza',
//     description: 'Classic pizza with tomato sauce, mozzarella, and basil.',
//     price: 10.99,
//     imageUrl: 'https://example.com/images/margarita-pizza.jpg',
//     category: 'mains',
//     isAvailable: true,
//   },
//   {
//     id: '5',
//     restaurantId: '1',
//     name: 'Lemonade',
//     description: 'Refreshing homemade lemonade.',
//     price: 3.99,
//     imageUrl: 'https://example.com/images/lemonade.jpg',
//     category: 'drinks',
//     isAvailable: true,
//   },
// ];

export default function OwnerHomePage() {
    const [meals, setMeals] = useState<MenuItem[]>(() => getMenu());
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [mealToDelete, setMealToDelete] = useState<MenuItem | null>(null);
    const navigate = useNavigate()

    function handleToggleAvailability(id: string) {
        setMeals(toggleMealAvailability(id));
    } 

    function handleEditMeal(id: string) {
        navigate(routes.ownerMenuEdit(id));
    }

    function handleDeleteMeal(id: string) {
      setMeals(deleteMeal(id))
    }

    const filteredMeals = meals.filter((meal) => {
        const matchesSearchTerm = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || meal.category === selectedCategory;
        return matchesSearchTerm && matchesCategory;
    });

  return (
    <div>
      <h1>Owner Home Page</h1>
      <button onClick={() => navigate(routes.ownerMenuNew)}>Add New Meal</button>
      {meals.length === 0 && <p>No meals available. Please add a new meal.</p>}
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
        <option value="starters">Starters</option>
        <option value="mains">Mains</option>
        <option value="desserts">Desserts</option>
        <option value="drinks">Drinks</option>
      </select>
      <div className="menu-grid">
        {filteredMeals.length === 0 ? (
          <p>No meals found.</p>
        ) : (
          filteredMeals.map((item) => (
            <MealCard
              key={item.id}
              menuItem={item}
              onToggleAvailability={handleToggleAvailability}
              onEdit={handleEditMeal}
              onDelete={handleDeleteMeal}
            />
          ))
        )}
      </div>
      {mealToDelete && (
        <div className="modal">
          <p>Are you sure you want to delete {mealToDelete.name}?</p>
          <button onClick={() => {
            setMeals((prevMeals) => prevMeals.filter((meal) => meal.id !== mealToDelete.id));
            setMealToDelete(null);
          }}>Yes</button>
          <button onClick={() => setMealToDelete(null)}>No</button>
        </div>
      )}
    </div>
  );
}