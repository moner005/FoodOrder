import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MealCard from '@/components/menu/MealCard'
import { MENU_CATEGORIES } from '@/types/menu'
import type { MenuItem } from '@/types/menu'
import { deleteMeal, getMenu, toggleMealAvailability } from '@/services/menuStorage'
import { CURRENT_RESTAURANT, CURRENT_RESTAURANT_ID,
} from '@/constants/restaurant'
import { routes } from '@/constants/routes'

export default function OwnerHomePage() {
  const navigate = useNavigate()
  const [meals, setMeals] = useState<MenuItem[]>(() => getMenu())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [mealToDelete, setMealToDelete] = useState<MenuItem | null>(null)

  const ownerMeals = meals.filter((meal) => meal.restaurantId === CURRENT_RESTAURANT_ID)

  const filteredMeals = ownerMeals.filter((meal) => {
    const matchesCategory = selectedCategory === 'all' || meal.category === selectedCategory
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    return matchesCategory && matchesSearch
  })

  const hasActiveFilters = searchTerm.trim() !== '' || selectedCategory !== 'all'

  function handleToggleAvailability(id: string) {
    setMeals(toggleMealAvailability(id))
  }

  function handleEdit(id: string) {
    navigate(routes.ownerMenuEdit(id))
  }

  function handleDeleteRequest(id: string) {
    setMealToDelete(ownerMeals.find((meal) => meal.id === id) ?? null)
  }

  function handleDeleteConfirm() {
    if (mealToDelete) {
      setMeals(deleteMeal(mealToDelete.id))
    }
    setMealToDelete(null)
  }

  function clearFilters() {
    setSearchTerm('')
    setSelectedCategory('all')
  }

  return (
    <section className="owner-page">
      <div className="owner-restaurant-info">
        <div className="owner-restaurant-image">
          {CURRENT_RESTAURANT.imageUrl ? (
            <img
              src={CURRENT_RESTAURANT.imageUrl}
              alt={`${CURRENT_RESTAURANT.name} restaurant`}
            />
          ) : (
            <span>Restaurant photo</span>
          )}
        </div>
        <div>
          <p className="eyebrow">Restaurant owner</p>
          <h1 className="owner-restaurant-name">{CURRENT_RESTAURANT.name}</h1>
          <p>{CURRENT_RESTAURANT.description}</p>
        </div>
      </div>
      <div className="owner-header">
        <h1 className="owner-title">Your menu</h1>
        <button
          className="button primary"
          type="button"
          onClick={() => navigate(routes.ownerMenuNew)}
        >
          Add new meal
        </button>
      </div>

      <div className="owner-toolbar">
        <input
          className="input owner-search"
          type="text"
          placeholder="Search meals..."
          aria-label="Search meals"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <select
          className="input"
          aria-label="Filter by category"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          <option value="all">All categories</option>
          {MENU_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        {hasActiveFilters ? (
          <button
            className="button secondary"
            type="button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {ownerMeals.length === 0 ? (
        <div className="owner-empty">
          <p>You haven&apos;t added any meals yet.</p>
          <button
            className="button primary"
            type="button"
            onClick={() => navigate(routes.ownerMenuNew)}
          >
            Add your first meal
          </button>
        </div>
      ) : filteredMeals.length === 0 ? (
        <p className="owner-empty">
          No meals match your search.
        </p>
      ) : (
        <div className="owner-grid">
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              menuItem={meal}
              onToggleAvailability={handleToggleAvailability}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {mealToDelete ? (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <h2 id="delete-title" className="modal-title">
              Delete {mealToDelete.name}?
            </h2>
            <p className="modal-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="button secondary"
                type="button"
                onClick={() => setMealToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="button danger"
                type="button"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}