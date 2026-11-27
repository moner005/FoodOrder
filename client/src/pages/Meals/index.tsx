import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MealGrid } from "@/components/menu/MealGrid";
import { getMeals, getRestaurants } from "@/services/marketplace";
import type { Meal, Restaurant } from "@/types/marketplace";
import { amountToMinor, formatMinor } from "@/types/marketplace";
import "../Home/marketplace.css";

export default function MealsPage() {
  const [params] = useSearchParams();
  const restaurantId = params.get("restaurantId");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([getMeals(restaurantId ?? undefined), getRestaurants()]).then(([nextMeals, nextRestaurants]) => {
      if (active) { setMeals(nextMeals); setRestaurants(nextRestaurants); }
    }).catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : "Unable to load meals.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [restaurantId]);
  const selectedRestaurant = restaurants.find((item) => item.id === restaurantId);
  const categories = ["All", ...new Set(meals.map((meal) => meal.category?.name).filter((name): name is string => Boolean(name)))];
  const filtered = useMemo(() => meals.filter((meal) => (category === "All" || meal.category?.name === category) && `${meal.name} ${meal.description ?? ""} ${meal.category?.name ?? ""}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())), [meals, category, search]);
  return <div className="sb-page">
    <header className="sb-page-heading"><div><p className="sb-eyebrow">FROM THE KITCHENS</p><h1>{selectedRestaurant?.name ? `${selectedRestaurant.name} menu` : "Explore meals"}</h1><p>{selectedRestaurant?.description || "Browse dishes across the neighborhood, then add to your cart."}</p>{selectedRestaurant && <Link className="sb-text-link" to={`/restaurants/${encodeURIComponent(selectedRestaurant.id)}/meals`}>Open restaurant page →</Link>}</div><label className="sb-search"><span>Search meals</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Dish or category" /></label></header>
    {selectedRestaurant && <div className="sb-venue-info"><strong className={selectedRestaurant.isOpen ? "sb-open" : "sb-closed"}>{selectedRestaurant.isOpen ? "Open now" : "Closed"}</strong><span>{selectedRestaurant.cuisine}</span><span>Delivery {formatMinor(amountToMinor(selectedRestaurant.deliveryFee))}</span><span>Minimum {formatMinor(amountToMinor(selectedRestaurant.minimumSubtotal))}</span><span>{selectedRestaurant.deliveryAreas.length ? `Serves ${selectedRestaurant.deliveryAreas.join(", ")}` : "No area restriction"}</span></div>}
    <div className="sb-filter-row"><div className="sb-categories" aria-label="Meal categories">{categories.map((item) => <button type="button" className={category === item ? "selected" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><button type="button" className="sb-text-button" onClick={() => { setSearch(""); setCategory("All"); }}>Clear filters</button></div>
    {loading && <p className="sb-muted" role="status">Loading menus…</p>}
    {!loading && error && <div className="sb-empty"><h2>Meals could not load</h2><p>{error}</p><Link to="/restaurants" className="sb-button sb-secondary">Browse restaurants</Link></div>}
    {!loading && !error && <MealGrid meals={filtered} restaurants={restaurants} />}
  </div>;
}
