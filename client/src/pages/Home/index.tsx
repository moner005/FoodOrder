import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRestaurants } from "@/services/marketplace";
import type { Restaurant } from "@/types/marketplace";
import "./marketplace.css";

const FALLBACK = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getRestaurants().then((data) => active && setRestaurants(data.slice(0, 3)))
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : "Restaurants are unavailable right now."));
    return () => { active = false; };
  }, []);

  return (
    <div className="sb-page sb-home">
      <section className="sb-hero">
        <div className="sb-hero-copy">
          <p className="sb-eyebrow">GOOD FOOD, CLOSE TO HOME</p>
          <h1>A good meal<br /><em>brings us together.</em></h1>
          <p>Explore neighborhood kitchens, see what is being served, and build one order from more than one restaurant.</p>
          <div className="sb-actions">
            <Link className="sb-button sb-primary" to="/restaurants">Browse restaurants <span aria-hidden="true">→</span></Link>
            <Link className="sb-text-link" to="/meals">Explore all meals</Link>
          </div>
        </div>
        <div className="sb-hero-image" role="img" aria-label="A table set with freshly prepared food" />
      </section>
      <section className="sb-section">
        <div className="sb-section-heading">
          <div><p className="sb-eyebrow">A PLACE TO START</p><h2>Restaurants to explore</h2></div>
          <Link className="sb-text-link" to="/restaurants">See all restaurants →</Link>
        </div>
        {error ? <p className="sb-message" role="status">{error}</p> : restaurants.length === 0 ? <p className="sb-muted">Loading neighborhood restaurants…</p> : (
          <div className="sb-restaurant-grid">
            {restaurants.map((restaurant) => (
              <Link className="sb-restaurant-card" to={`/restaurants/${encodeURIComponent(restaurant.id)}/meals`} key={restaurant.id}>
                <img src={restaurant.image || FALLBACK} alt="" onError={(event) => { event.currentTarget.src = FALLBACK; }} />
                <div className="sb-card-body"><div className="sb-card-meta"><span>{restaurant.cuisine || "Local kitchen"}</span><span className={restaurant.isOpen ? "sb-open" : "sb-closed"}>{restaurant.isOpen ? "Open now" : "Closed"}</span></div><h3>{restaurant.name}</h3><p>{restaurant.description || restaurant.address || "Explore the menu"}</p><span className="sb-text-link">View menu →</span></div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
