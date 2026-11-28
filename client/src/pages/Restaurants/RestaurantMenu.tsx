import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MealGrid } from "@/components/menu/MealGrid";
import { getMeals, getRestaurants } from "@/services/marketplace";
import type { Meal, Restaurant } from "@/types/marketplace";
import { amountToMinor, formatMinor } from "@/types/marketplace";
import "../Home/marketplace.css";

export default function RestaurantMenuPage() {
  const { restaurantId = "" } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  useEffect(() => {
    let active = true;
    getRestaurants().then(async (list) => {
      const found = list.find((item) => item.id === restaurantId || item.slug === restaurantId);
      if (!found) throw new Error("This restaurant could not be found.");
      const menu = await getMeals(found.id);
      if (active) { setRestaurant(found); setMeals(menu); }
    }).catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : "Unable to load this restaurant.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [restaurantId]);
  const categories = ["All", ...new Set(meals.map((meal) => meal.category?.name).filter((name): name is string => Boolean(name)))];
  const filtered = useMemo(() => meals.filter((meal) => (category === "All" || meal.category?.name === category) && `${meal.name} ${meal.description ?? ""}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())), [meals, search, category]);
  if (loading) return <div className="sb-page"><p className="sb-muted" role="status">Loading restaurant menu…</p></div>;
  if (error || !restaurant) return <div className="sb-page"><div className="sb-empty"><h1>Restaurant unavailable</h1><p>{error || "This restaurant could not be found."}</p><Link className="sb-button sb-primary" to="/restaurants">Browse restaurants</Link></div></div>;
  return <div className="sb-page">
    <Link className="sb-text-link" to="/restaurants">← All restaurants</Link>
    <section className="sb-venue-hero">
      <div>
        <p className="sb-eyebrow">{restaurant.cuisine || "NEIGHBORHOOD KITCHEN"}</p>
        <h1>{restaurant.name}</h1>
        {restaurant.description && <p>{restaurant.description}</p>}
        {restaurant.address && <p>{restaurant.address}</p>}
        {restaurant.isOpen && <div className="sb-venue-info">
          <strong className="sb-open">Open now</strong>
          <span>Delivery {formatMinor(amountToMinor(restaurant.deliveryFee))}</span>
          <span>Minimum {formatMinor(amountToMinor(restaurant.minimumSubtotal))}</span>
          <span>{restaurant.deliveryAreas.length ? `Serves ${restaurant.deliveryAreas.join(", ")}` : "No area restriction"}</span>
        </div>}
      </div>
      {restaurant.image && <img src={restaurant.image} alt="" />}
    </section>
    {meals.length === 0 ? <div className="sb-empty">
      <h2>Menu unavailable</h2>
      <p>This restaurant has no menu on SwiftBite yet.</p>
    </div> : <>
      {!restaurant.isOpen && <p className="sb-closed-notice" role="status">This restaurant is closed right now. You can browse its menu, but ordering is unavailable.</p>}
      <div className="sb-page-heading sb-menu-toolbar"><div><p className="sb-eyebrow">ON THE MENU</p><h2>Choose a dish</h2></div><label className="sb-search"><span>Search this menu</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Dish name" /></label></div>
      <div className="sb-filter-row"><div className="sb-categories" aria-label="Menu categories">{categories.map((item) => <button type="button" className={category === item ? "selected" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><button type="button" className="sb-text-button" onClick={() => { setSearch(""); setCategory("All"); }}>Clear filters</button></div>
      <MealGrid meals={filtered} restaurants={[restaurant]} />
    </>}
  </div>;
}
