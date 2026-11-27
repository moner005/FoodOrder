import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { apiClient } from "@/services/apiClient";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStores";
import "./Meals.css";

interface ApiMeal {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  image: string | null;
  isAvailable: boolean;
  restaurantId: string;
  category: {
    id: string;
    name: string;
  };
  restaurant?: {
    id: string;
    name: string;
  };
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800";

export default function MealsPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const restaurantId = searchParams.get("restaurantId");

  const [meals, setMeals] = useState<ApiMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = useCartStore((state) => state.load);
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);

  // Load meals from the backend
  useEffect(() => {
    let active = true;

    async function loadMeals() {
      try {
        setLoading(true);
        setError("");

        const endpoint = restaurantId
          ? `meals/restaurant/${encodeURIComponent(restaurantId)}`
          : "meals";

        const response = await apiClient.get<ApiMeal[]>(endpoint);

        if (active) {
          setMeals(response.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load meals. Please try again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMeals();

    return () => {
      active = false;
    };
  }, [restaurantId]);

  // Add meal to cart
  const handleAddToCart = (meal: ApiMeal) => {
    if (!user) {
      alert("Please log in to add meals to your cart.");
      navigate("/login");
      return;
    }
    if (!meal.isAvailable) {
      return;
    }

    loadCart();

    const added = addItem({
      mealId: meal.id,
      restaurantId: meal.restaurantId,
      restaurantName: meal.restaurant?.name ?? "",
      name: meal.name,
      description: meal.description ?? "",
      price: Number(meal.price),
      imageUrl: meal.image ?? "",
      quantity: 1,
      note: "",
    });

    if (added) {
      alert(`${meal.name} added to cart successfully!`);
    } else {
      alert("Unable to add this meal to your cart.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="meals-page">
        <header className="meals-heading">
          <span>OUR MENU</span>
          <h1>Discover Our Meals</h1>
          <p>Loading meals...</p>
        </header>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="meals-page">
        <header className="meals-heading">
          <span>OUR MENU</span>
          <h1>Discover Our Meals</h1>
          <p>{error}</p>

          <Link to="/restaurants">Browse Restaurants</Link>
        </header>
      </main>
    );
  }

  return (
    <main className="meals-page">
      <header className="meals-heading">
        <span>OUR MENU</span>

        <h1>
          {restaurantId ? "Discover Restaurant Meals" : "Discover All Meals"}
        </h1>

        <p>Choose your favorite food and enjoy every bite.</p>

        {!restaurantId && <Link to="/restaurants">Browse Restaurants</Link>}
      </header>

      <section className="meals-grid">
        {meals.map((meal) => (
          <article className="customer-meal-card" key={meal.id}>
            <Link to={`/meals/${meal.id}`} className="meal-image-link">
              <img
                src={meal.image || FALLBACK_IMAGE}
                alt={meal.name}
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </Link>

            <div className="customer-meal-info">
              <span className="meal-category">
                {meal.category?.name ?? "Uncategorized"}
              </span>

              {meal.restaurant && (
                <small className="meal-restaurant-name">
                  {meal.restaurant.name}
                </small>
              )}

              <Link to={`/meals/${meal.id}`} className="meal-title-link">
                <h2>{meal.name}</h2>
              </Link>

              <p>{meal.description || "Delicious freshly prepared food."}</p>

              <div className="meal-card-bottom">
                <strong>${Number(meal.price).toFixed(2)}</strong>

                <span
                  className={
                    meal.isAvailable ? "available-label" : "unavailable-label"
                  }
                >
                  {meal.isAvailable ? "Available" : "Sold Out"}
                </span>
              </div>

              <div className="meal-card-buttons">
                <Link to={`/meals/${meal.id}`} className="details-btn">
                  View Details
                </Link>

                <button
                  type="button"
                  className="add-to-cart-btn"
                  disabled={!meal.isAvailable}
                  onClick={() => handleAddToCart(meal)}
                >
                  + Add to Cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {meals.length === 0 && (
        <div className="no-meals">
          <h2>No meals available</h2>
          <p>
            {restaurantId
              ? "This restaurant has no available meals yet."
              : "There are no available meals from active restaurants."}
          </p>

          <Link to="/restaurants">Explore Restaurants</Link>
        </div>
      )}
    </main>
  );
}
