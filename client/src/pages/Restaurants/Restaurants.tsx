import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getRestaurants } from "@/services/marketplace";
import type { Restaurant } from "@/types/marketplace";
import { amountToMinor, formatMinor } from "@/types/marketplace";
import "../Home/marketplace.css";

const FALLBACK = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true); setError("");
    getRestaurants().then(setRestaurants).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load restaurants.")).finally(() => setLoading(false));
  };
  useEffect(() => { void Promise.resolve().then(load); }, []);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return restaurants.filter((item) => [item.name, item.cuisine, item.description, item.address].some((part) => part?.toLocaleLowerCase().includes(query)));
  }, [restaurants, search]);

  return <div className="sb-page">
    <header className="sb-page-heading"><div><p className="sb-eyebrow">THE NEIGHBORHOOD TABLE</p><h1>Restaurants</h1><p>Find a kitchen and browse its current menu.</p></div><label className="sb-search"><span>Search restaurants</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, cuisine or area" /></label></header>
    {loading && <p className="sb-muted" role="status">Loading restaurants…</p>}
    {!loading && error && <div className="sb-empty"><h2>Restaurants could not load</h2><p>{error}</p><button className="sb-button sb-secondary" onClick={load}>Try again</button></div>}
    {!loading && !error && filtered.length > 0 && <div className="sb-restaurant-grid">
      {filtered.map((restaurant) => <article className="sb-restaurant-card" key={restaurant.id}>
        <Link to={`/restaurants/${encodeURIComponent(restaurant.id)}/meals`} className="sb-card-image"><img src={restaurant.image || FALLBACK} alt="" onError={(event) => { event.currentTarget.src = FALLBACK; }} /></Link>
        <div className="sb-card-body"><div className="sb-card-meta"><span>{restaurant.cuisine || "Local kitchen"}</span><span className={restaurant.isOpen ? "sb-open" : "sb-closed"}>{restaurant.isOpen ? "Open now" : "Closed"}</span></div><h2>{restaurant.name}</h2><p>{restaurant.description || restaurant.address || "Browse the menu and availability."}</p>{restaurant.address && <p className="sb-muted">{restaurant.address}</p>}<p className="sb-muted">Delivery {formatMinor(amountToMinor(restaurant.deliveryFee))} · Minimum {formatMinor(amountToMinor(restaurant.minimumSubtotal))}{restaurant.deliveryAreas.length ? ` · ${restaurant.deliveryAreas.join(", ")}` : " · Area not restricted"}</p><Link className="sb-button sb-primary" to={`/restaurants/${encodeURIComponent(restaurant.id)}/meals`}>View menu <span aria-hidden="true">→</span></Link></div>
      </article>)}
    </div>}
    {!loading && !error && filtered.length === 0 && <div className="sb-empty"><h2>{restaurants.length ? "No matches found" : "No restaurants are listed yet"}</h2><p>{restaurants.length ? "Try another restaurant name, cuisine, or area." : "Approved restaurants will appear here."}</p>{search && <button className="sb-button sb-secondary" onClick={() => setSearch("")}>Clear search</button>}</div>}
  </div>;
}
