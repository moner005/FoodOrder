
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import MealCard from '@/components/menu/MealCard';
import type { MenuItem } from '@/types/menu';
import { apiClient } from '@/services/apiClient';
import { routes } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStores';



interface ApiRestaurant {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  image?: string | null;
  status: string;
}

interface ApiMeal {
  id: string;
  updatedAt: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  price: number | string;
  image: string | null;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
  };
}

export default function OwnerHomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedRestaurantId = (location.state as { restaurantId?: string } | null)?.restaurantId ?? '';
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');

  const [meals, setMeals] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mealToDelete, setMealToDelete] = useState<MenuItem | null>(null);

  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedRestaurant = restaurants.find(
    (restaurant) => restaurant.id === selectedRestaurantId,
  );

  // Load restaurants belonging to the logged-in owner.
  useEffect(() => {
    let active = true;

    async function loadRestaurants() {
      try {
        setLoadingRestaurants(true);
        setError('');

        const response = await apiClient.get<ApiRestaurant[]>(isAdmin ? 'restaurants/admin/all' : 'restaurants/my-restaurants');

        if (!active) return;

        const data = response.data;
        setRestaurants(data);

        setSelectedRestaurantId((current) => {
          if (current && data.some((restaurant) => restaurant.id === current)) {
            return current;
          }

          if (requestedRestaurantId && data.some((restaurant) => restaurant.id === requestedRestaurantId)) return requestedRestaurantId;

          return data[0]?.id ?? '';
        });
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load your restaurants.',
          );
        }
      } finally {
        if (active) {
          setLoadingRestaurants(false);
        }
      }
    }

    loadRestaurants();

    return () => {
      active = false;
    };
  }, [isAdmin, requestedRestaurantId]);

  // Load meals whenever the selected restaurant changes.
  useEffect(() => {
    let active = true;

    async function loadMeals() {
      if (!selectedRestaurantId) {
        setMeals([]);
        return;
      }

      try {
        setLoadingMeals(true);
        setActionError('');

        const response = await apiClient.get<ApiMeal[]>(
          `meals/manage/restaurant/${encodeURIComponent(selectedRestaurantId)}`,
        );

        if (active) {
          const mappedMeals: MenuItem[] = response.data.map((meal) => ({
            id: meal.id,
            updatedAt: meal.updatedAt,
            restaurantId: meal.restaurantId,
            name: meal.name,
            description: meal.description ?? '',
            price: Number(meal.price),
            imageUrl: meal.image ?? '',
            category: meal.category?.name ?? 'Uncategorized',
            isAvailable: meal.isAvailable,
          }));

          setMeals(mappedMeals);
        }
      } catch (err) {
        if (active) {
          setActionError(
            err instanceof Error
              ? err.message
              : 'Unable to load restaurant meals.',
          );
        }
      } finally {
        if (active) {
          setLoadingMeals(false);
        }
      }
    }

    loadMeals();

    return () => {
      active = false;
    };
  }, [selectedRestaurantId]);

  // Generate category filters from actual database meals.
  const categories = useMemo(
    () => [...new Set(meals.map((meal) => meal.category))],
    [meals],
  );

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        meal.category === selectedCategory;

      const matchesSearch = meal.name
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [meals, selectedCategory, searchTerm]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || selectedCategory !== 'all';

  function handleEdit(id: string) {
    navigate(routes.ownerMenuEdit(id), {
      state: { restaurantId: selectedRestaurantId },
    });
  }

  async function handleToggleAvailability(id: string) {
    const meal = meals.find((item) => item.id === id);

    if (!meal) return;

    try {
      setSaving(true);
      setActionError('');

      const response = await apiClient.patch<ApiMeal>(`meals/${id}`, {
        isAvailable: !meal.isAvailable,
        expectedUpdatedAt: meal.updatedAt,
      });

      setMeals((previous) =>
        previous.map((item) =>
          item.id === id
          ? { ...item, isAvailable: !item.isAvailable, updatedAt: response.data.updatedAt }
            : item,
        ),
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to update meal availability.',
      );
      const status = typeof err === 'object' && err !== null && 'response' in err
        ? Number((err as { response?: { status?: number } }).response?.status)
        : 0;
      if (status === 409 && selectedRestaurantId) {
        try {
          const refreshed = await apiClient.get<ApiMeal[]>(`meals/manage/restaurant/${encodeURIComponent(selectedRestaurantId)}`);
          setMeals(refreshed.data.map((item) => ({ id: item.id, updatedAt: item.updatedAt, restaurantId: item.restaurantId, name: item.name, description: item.description ?? '', price: Number(item.price), imageUrl: item.image ?? '', category: item.category?.name ?? 'Uncategorized', isAvailable: item.isAvailable })));
        } catch { /* Keep the original conflict message visible. */ }
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!mealToDelete) return;

    try {
      setSaving(true);
      setActionError('');

      await apiClient.delete(`meals/${mealToDelete.id}`);

      setMeals((previous) =>
        previous.filter((meal) => meal.id !== mealToDelete.id),
      );

      setMealToDelete(null);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to delete this meal.',
      );
    } finally {
      setSaving(false);
    }
  }

  function clearFilters() {
    setSearchTerm('');
    setSelectedCategory('all');
  }

  if (loadingRestaurants) {
    return (
      <section className="owner-page">
        <div className="owner-empty">
          Loading your restaurant information...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="owner-page">
        <div className="owner-empty">
          <h2>Unable to load your dashboard</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (restaurants.length === 0) {
    return (
      <section className="owner-page">
        <div className="owner-empty">
          <h2>No restaurant is linked to your account</h2>
          <p>
            Create a restaurant or contact the administrator
            to associate your account with a restaurant.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="owner-page">

      {/* Restaurant Information */}
      <div className="owner-restaurant-info">
        <div className="owner-restaurant-image">
          {selectedRestaurant?.image ? (
            <img
              src={selectedRestaurant.image}
              alt={selectedRestaurant.name}
            />
          ) : (
            <span>Restaurant photo</span>
          )}
        </div>

        <div>
          <p className="eyebrow">{isAdmin ? 'PLATFORM MENU MANAGEMENT' : 'RESTAURANT OWNER'}</p>

          <h1 className="owner-restaurant-name">
            {selectedRestaurant?.name}
          </h1>

          <p>{selectedRestaurant?.description}</p>

          <span>
            Status: {selectedRestaurant?.status}
          </span>
        </div>
      </div>

      {/* Restaurant selector for owners with multiple restaurants */}
      {restaurants.length > 1 && (
        <div className="owner-toolbar">
          <label htmlFor="owner-restaurant-select">
            Select Restaurant
          </label>

          <select
            id="owner-restaurant-select"
            className="input"
            value={selectedRestaurantId}
            onChange={(event) => {
              setSelectedRestaurantId(event.target.value);
              setSelectedCategory('all');
            }}
          >
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Menu Heading */}
      <div className="owner-header">
        <h1 className="owner-title">Your menu</h1>

        <button
          className="button primary"
          type="button"
          onClick={() =>
            navigate(routes.ownerMenuNew, {
              state: { restaurantId: selectedRestaurantId },
            })
          }
          disabled={selectedRestaurant?.status !== 'ACTIVE' && !isAdmin}
        >
          Add new meal
        </button>
      </div>

      {selectedRestaurant?.status !== 'ACTIVE' && !isAdmin && (
        <p className="owner-empty">
          This restaurant must be ACTIVE before adding meals.
        </p>
      )}

      {/* Search and Filters */}
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

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            className="button secondary"
            type="button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {actionError && (
        <div className="owner-empty">
          <p>{actionError}</p>
        </div>
      )}

      {loadingMeals ? (
        <div className="owner-empty">
          Loading restaurant meals...
        </div>
      ) : meals.length === 0 ? (
        <div className="owner-empty">
          <p>You haven't added any meals yet.</p>

          <button
            className="button primary"
            type="button"
            disabled={selectedRestaurant?.status !== 'ACTIVE' && !isAdmin}
            onClick={() =>
              navigate(routes.ownerMenuNew, {
                state: { restaurantId: selectedRestaurantId },
              })
            }
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
              onDelete={(id) =>
                setMealToDelete(
                  meals.find((item) => item.id === id) ?? null,
                )
              }
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {mealToDelete && (
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

            <p className="modal-text">
              This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                className="button secondary"
                type="button"
                disabled={saving}
                onClick={() => setMealToDelete(null)}
              >
                Cancel
              </button>

              <button
                className="button danger"
                type="button"
                disabled={saving}
                onClick={handleDeleteConfirm}
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
