import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStores";
import { useCartStore } from "@/stores/cartStore";
import type { Meal, Restaurant } from "@/types/marketplace";
import { amountToMinor, formatMinor } from "@/types/marketplace";

const FALLBACK = "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=900&auto=format&fit=crop";

export function MealGrid({ meals, restaurants }: { meals: Meal[]; restaurants: Restaurant[] }) {
  const user = useAuthStore((state) => state.user);
  const loadCart = useCartStore((state) => state.load);
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
  const add = (meal: Meal) => {
    if (!user) { navigate("/login"); return; }
    const restaurant = restaurantById.get(meal.restaurantId);
    if (!meal.isAvailable || !restaurant?.isOpen || restaurant.status !== "ACTIVE") return;
    loadCart();
    const success = addItem({ mealId: meal.id, restaurantId: meal.restaurantId, restaurantName: restaurant.name, name: meal.name, description: meal.description ?? "", price: amountToMinor(meal.price) / 100, imageUrl: meal.image ?? "", quantity: 1, note: "" });
    setMessage(success ? `${meal.name} added to your cart.` : "Sign in to add meals to your cart.");
  };
  if (!meals.length) return <div className="sb-empty"><h2>No meals match</h2><p>Try clearing the search or choosing another category.</p></div>;
  return <>
    <p className="sb-sr-only" role="status" aria-live="polite">{message}</p>
    <div className="sb-meal-grid">{meals.map((meal) => {
      const restaurant = restaurantById.get(meal.restaurantId);
      const available = meal.isAvailable && restaurant?.isOpen && restaurant.status === "ACTIVE";
      return <article className="sb-meal-card" key={meal.id}>
        <Link className="sb-meal-image" to={`/meals/${encodeURIComponent(meal.id)}`}><img src={meal.image || FALLBACK} alt="" onError={(event) => { event.currentTarget.src = FALLBACK; }} /></Link>
        <div className="sb-card-body"><p className="sb-card-meta"><span>{meal.category?.name || "From the menu"}</span><span className={available ? "sb-open" : "sb-closed"}>{available ? "Available" : meal.isAvailable ? "Restaurant closed" : "Sold out"}</span></p><h2><Link to={`/meals/${encodeURIComponent(meal.id)}`}>{meal.name}</Link></h2>{restaurant && <Link className="sb-muted sb-restaurant-link" to={`/restaurants/${encodeURIComponent(restaurant.id)}/meals`}>{restaurant.name}</Link>}<p>{meal.description || "Prepared by the restaurant."}</p><div className="sb-meal-bottom"><strong>{formatMinor(amountToMinor(meal.price))}</strong><button className="sb-button sb-primary" type="button" disabled={!available} onClick={() => add(meal)}>{available ? "Add to cart" : "Unavailable"}</button></div></div>
      </article>;
    })}</div>
  </>;
}
