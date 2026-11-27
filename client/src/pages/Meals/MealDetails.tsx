import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMeal, getRestaurants } from "@/services/marketplace";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStores";
import type { Meal, Restaurant } from "@/types/marketplace";
import { amountToMinor, formatMinor } from "@/types/marketplace";
import "../Home/marketplace.css";

const FALLBACK = "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=1000&auto=format&fit=crop";

export default function MealDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const loadCart = useCartStore((state) => state.load);
  const addItem = useCartStore((state) => state.addItem);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([getMeal(id), getRestaurants()]).then(([currentMeal, venues]) => {
      const found = venues.find((item) => item.id === currentMeal.restaurantId);
      if (!found) throw new Error("This restaurant is no longer listed.");
      if (active) { setMeal(currentMeal); setRestaurant(found); }
    }).catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : "Unable to load this meal.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);
  if (loading) return <div className="sb-page"><p className="sb-muted" role="status">Loading dish…</p></div>;
  if (error || !meal || !restaurant) return <div className="sb-page"><div className="sb-empty"><h1>Dish unavailable</h1><p>{error || "This dish could not be found."}</p><Link className="sb-button sb-primary" to="/meals">Browse meals</Link></div></div>;
  const available = meal.isAvailable && restaurant.isOpen && restaurant.status === "ACTIVE";
  const add = () => {
    if (!available) return;
    if (!user) { navigate("/login"); return; }
    loadCart();
    let success = true;
    for (let i = 0; i < quantity; i++) success = addItem({ mealId: meal.id, restaurantId: restaurant.id, restaurantName: restaurant.name, name: meal.name, description: meal.description ?? "", price: amountToMinor(meal.price) / 100, imageUrl: meal.image ?? "", quantity: 1, note: "" }) && success;
    setMessage(success ? `${quantity} ${meal.name} ${quantity === 1 ? "added" : "added"} to your cart.` : "Your cart is at its quantity limit for this dish.");
  };
  return <div className="sb-page">
    <nav className="sb-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>›</span><Link to={`/restaurants/${encodeURIComponent(restaurant.id)}/meals`}>{restaurant.name}</Link><span>›</span><span>{meal.name}</span></nav>
    <section className="sb-dish-detail"><img src={meal.image || FALLBACK} alt={meal.name} onError={(event) => { event.currentTarget.src = FALLBACK; }} /><div><p className="sb-eyebrow">{meal.category?.name || "FROM THE MENU"}</p><h1>{meal.name}</h1><Link className="sb-text-link" to={`/restaurants/${encodeURIComponent(restaurant.id)}/meals`}>{restaurant.name} menu →</Link><p>{meal.description || "Prepared fresh by the restaurant."}</p><div className="sb-dish-price">{formatMinor(amountToMinor(meal.price))}</div><p className={available ? "sb-open" : "sb-closed"}>{available ? "Available to order" : meal.isAvailable ? "Restaurant closed" : "Sold out"}</p><div className="sb-quantity"><label htmlFor="meal-quantity">Quantity</label><div><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((n) => Math.max(1, n - 1))}>−</button><output id="meal-quantity">{quantity}</output><button type="button" aria-label="Increase quantity" disabled={quantity >= 99} onClick={() => setQuantity((n) => Math.min(99, n + 1))}>+</button></div></div><p className="sb-muted">Item total: {formatMinor(amountToMinor(meal.price) * quantity)}</p><button className="sb-button sb-primary" type="button" disabled={!available} onClick={add}>{available ? "Add to cart" : "Unavailable"}</button><p role="status" aria-live="polite">{message}</p></div></section>
  </div>;
}
