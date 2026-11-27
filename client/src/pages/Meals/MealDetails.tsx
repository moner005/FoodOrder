import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { apiClient } from "@/services/apiClient";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStores";
import "./MealDetails.css";

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
  restaurant: {
    id: string;
    name: string;
    status: string;
  };
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800";

export default function MealDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [meal, setMeal] = useState<ApiMeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState("");
  const user = useAuthStore((state) => state.user);
  const loadCart = useCartStore((state) => state.load);
  const addItem = useCartStore((state) => state.addItem);

  // Fetch meal details from the backend
  useEffect(() => {
    let active = true;

    async function loadMealDetails() {
      if (!id) {
        setError("Meal ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get<ApiMeal>(
          `meals/${encodeURIComponent(id)}`,
        );

        if (active) {
          setMeal(response.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load meal details.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMealDetails();

    return () => {
      active = false;
    };
  }, [id]);

  // Add selected meal and quantity to cart
  const handleAddToCart = () => {
    if (!user) {
      alert("Please log in to add meals to your cart.");
      navigate("/login");
      return;
    }
    if (!meal || !meal.isAvailable) return;

    loadCart();

    for (let index = 0; index < quantity; index++) {
      const added = addItem({
        mealId: meal.id,
        restaurantId: meal.restaurantId,
        restaurantName: meal.restaurant.name,
        name: meal.name,
        description: meal.description ?? "",
        price: Number(meal.price),
        imageUrl: meal.image ?? "",
        quantity: 1,
        note: "",
      });

      if (!added) {
        setAddedMessage("Unable to add this meal to your cart.");
        return;
      }
    }

    setAddedMessage(
      `${quantity} ${meal.name} added to your cart successfully!`,
    );

    setTimeout(() => {
      setAddedMessage("");
    }, 3000);
  };

  // Loading state
  if (loading) {
    return (
      <main className="meal-details-page">
        <div className="meal-details-state">
          <p>Loading meal details...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !meal) {
    return (
      <main className="meal-details-page">
        <div className="meal-details-state">
          <h2>Meal Not Found</h2>
          <p>{error || "This meal could not be found."}</p>
          <Link to="/meals" className="meal-back-button">
            Browse Meals
          </Link>
        </div>
      </main>
    );
  }

  const price = Number(meal.price);

  return (
    <main className="meal-details-page">
      {/* Page Header */}
      <section className="meal-details-header">
        <div>
          <span>DISCOVER YOUR FAVORITE</span>
          <h1>Meal Details</h1>
          <p>Explore every delicious detail before placing your order.</p>
        </div>

        <div className="meal-details-header-icon">🍽️</div>
      </section>

      {/* Breadcrumb */}
      <div className="meal-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/restaurants">Restaurants</Link>
        <span>/</span>
        <Link
          to={`/meals?restaurantId=${encodeURIComponent(meal.restaurantId)}`}
        >
          {meal.restaurant.name}
        </Link>
        <span>/</span>
        <strong>{meal.name}</strong>
      </div>

      {/* Main Details Card */}
      <section className="meal-details-card">
        {/* Meal Image */}
        <div className="meal-details-image-wrapper">
          <img
            className="meal-details-image"
            src={meal.image || FALLBACK_IMAGE}
            alt={meal.name}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          <span
            className={
              meal.isAvailable
                ? "meal-details-availability available"
                : "meal-details-availability unavailable"
            }
          >
            {meal.isAvailable ? "Available" : "Sold Out"}
          </span>
        </div>

        {/* Meal Information */}
        <div className="meal-details-info">
          <span className="meal-details-category">
            {meal.category?.name ?? "Uncategorized"}
          </span>

          <h2>{meal.name}</h2>

          <Link
            to={`/meals?restaurantId=${encodeURIComponent(meal.restaurantId)}`}
            className="meal-details-restaurant"
          >
            🏪 {meal.restaurant.name}
          </Link>

          <p className="meal-details-description">
            {meal.description ||
              "A delicious meal prepared with fresh ingredients."}
          </p>

          <div className="meal-details-price">${price.toFixed(2)}</div>

          <div className="meal-details-divider" />

          {/* Quantity */}
          <div className="meal-details-quantity">
            <span>Quantity</span>

            <div className="quantity-selector">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() =>
                  setQuantity((previous) => Math.max(1, previous - 1))
                }
              >
                −
              </button>

              <strong>{quantity}</strong>

              <button
                type="button"
                onClick={() => setQuantity((previous) => previous + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="meal-details-total">
            <span>Total Price</span>
            <strong>${(price * quantity).toFixed(2)}</strong>
          </div>

          {/* Feedback */}
          {addedMessage && (
            <p className="meal-added-message" role="status">
              {addedMessage}
            </p>
          )}

          {/* Buttons */}
          <div className="meal-details-actions">
            <button
              type="button"
              className="meal-details-add-btn"
              disabled={!meal.isAvailable}
              onClick={handleAddToCart}
            >
              {meal.isAvailable ? "Add to Cart" : "Currently Unavailable"}
            </button>

            <button
              type="button"
              className="meal-details-cart-btn"
              onClick={() => navigate("/cart")}
            >
              View Cart →
            </button>
          </div>

          <Link
            to={`/meals?restaurantId=${encodeURIComponent(meal.restaurantId)}`}
            className="meal-details-back"
          >
            ← Back to Restaurant Menu
          </Link>
        </div>
      </section>

      {/* Additional Information */}
      <section className="meal-details-features">
        <div>
          <span>🥗</span>
          <strong>Fresh Ingredients</strong>
          <p>Prepared with care and quality ingredients.</p>
        </div>

        <div>
          <span>🍽️</span>
          <strong>Restaurant Quality</strong>
          <p>Enjoy meals from your favorite restaurants.</p>
        </div>

        <div>
          <span>🛍️</span>
          <strong>Easy Ordering</strong>
          <p>Add your favorite meals to your cart easily.</p>
        </div>
      </section>
    </main>
  );
}
