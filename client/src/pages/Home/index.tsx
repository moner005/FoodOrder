import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRestaurants } from "@/services/marketplace";
import type { Restaurant } from "@/types/marketplace";
import topBun from "@/assets/burger/top-bun.png";
import lettuce from "@/assets/burger/lettuce.png";
import tomato from "@/assets/burger/tomato.png";
import cheese from "@/assets/burger/cheese.png";
import patty from "@/assets/burger/patty.png";
import bottomBun from "@/assets/burger/bottom-bun.png";
import "./home.css";
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
    <>
      <div className="customer-home">
        <section className="customer-hero" aria-labelledby="home-hero-title">
          <div className="hero-decoration circle-one" aria-hidden="true" />
          <div className="hero-decoration circle-two" aria-hidden="true" />
          <div className="hero-decoration circle-three" aria-hidden="true" />

          <div className="hero-content">
            <span className="hero-tag">🍴 Delicious Food, Delivered Fast</span>
            <h1 id="home-hero-title">Good Food.<br /><span>Great Mood!</span></h1>
            <p>Order your favorite meals from the best restaurants and enjoy fast delivery at your doorstep.</p>
            <div className="hero-buttons">
              <Link to="/restaurants" className="hero-primary-btn">
                Explore Restaurants <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="hero-visual" role="img" aria-label="An animated burger with layers of lettuce, tomato, cheese, and a patty">
            <div className="burger-background-circle" />
            <div className="exploding-burger">
              <img src={topBun} alt="" className="burger-part top-bun" />
              <img src={lettuce} alt="" className="burger-part lettuce" />
              <img src={tomato} alt="" className="burger-part tomato" />
              <img src={cheese} alt="" className="burger-part cheese" />
              <img src={patty} alt="" className="burger-part patty" />
              <img src={bottomBun} alt="" className="burger-part bottom-bun" />
            </div>
          </div>
        </section>
      </div>
      <section className="sb-page sb-section">
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
    </>
  );
}
