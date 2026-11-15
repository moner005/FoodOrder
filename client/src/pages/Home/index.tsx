 import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

import topBun from "../../assets/burger/top-bun.png";
import lettuce from "../../assets/burger/lettuce.png";
import tomato from "../../assets/burger/tomato.png";
import cheese from "../../assets/burger/cheese.png";
import patty from "../../assets/burger/patty.png";
import bottomBun from "../../assets/burger/bottom-bun.png";

const features = [
  {
    icon: "🛵",
    title: "Fast Delivery",
    description: "At your doorstep",
  },
  {
    icon: "🛡",
    title: "Secure Payment",
    description: "Shop with confidence",
  },
  {
    icon: "🍴",
    title: "Wide Variety",
    description: "Explore top restaurants",
  },
  {
    icon: "🎧",
    title: "24/7 Support",
    description: "We're here to help",
  },
];

const restaurants = [
  {
    name: "Burger House",
    category: "Burgers • Fast Food",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=700",
  },
  {
    name: "Pizza Palace",
    category: "Pizza • Italian",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700",
  },
  {
    name: "Fresh Garden",
    category: "Healthy • Salads",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700",
  },
];

const meals = [
  {
    name: "Classic Burger",
    price: "$12.99",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700",
  },
  {
    name: "Italian Pizza",
    price: "$15.50",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700",
  },
  {
    name: "Pasta Special",
    price: "$13.00",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700",
  },
];

function CustomerHome() {
  return (
    <main className="customer-home">

      {/* HERO SECTION */}
      <section className="customer-hero">

        <div className="hero-decoration circle-one"></div>
        <div className="hero-decoration circle-two"></div>
        <div className="hero-decoration circle-three"></div>

        <div className="hero-content">

          <span className="hero-tag">
            🍴 Delicious Food, Delivered Fast
          </span>

          <h1>
            Good Food.
            <br />
            <span>Great Mood!</span>
          </h1>

          <p>
            Order your favorite meals from the best restaurants
            and enjoy fast delivery at your doorstep.
          </p>

          <div className="hero-buttons">
            <Link to="/restaurants" className="hero-primary-btn">
              Explore Restaurants <span>→</span>
            </Link>

            {/* <Link to="/meals" className="hero-secondary-btn">
              View Menu <span>▶️</span>
            </Link> */}
          </div>

          <div className="hero-small-info">
            <div>
              <strong>500+</strong>
              <span>Restaurants</span>
            </div>

            <div>
              <strong>10k+</strong>
              <span>Happy Customers</span>
            </div>

            <div>
              <strong>30 min</strong>
              <span>Fast Delivery</span>
            </div>
          </div>

        </div>

        {/* EXPLODING BURGER */}
        <div className="hero-visual">

          <div className="burger-background-circle"></div>

          <div className="exploding-burger">

            <img
              src={topBun}
              alt="Burger top bun"
              className="burger-part top-bun"
            />

            <img
              src={lettuce}
              alt="Lettuce"
              className="burger-part lettuce"
            />

            <img
              src={tomato}
              alt="Tomato"
              className="burger-part tomato"
            />

            <img
              src={cheese}
              alt="Cheese"
              className="burger-part cheese"
            />
 <img
              src={patty}
              alt="Burger patty"
              className="burger-part patty"
            />

            <img
              src={bottomBun}
              alt="Bottom bun"
              className="burger-part bottom-bun"
            />

          </div>
        </div>

      </section>

      {/* FEATURES */}
      <section className="features-bar">

        {features.map((feature, index) => (
          <div className="feature-item" key={index}>

            <div className="feature-icon">
              {feature.icon}
            </div>

            <div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>

          </div>
        ))}

      </section>

      {/* POPULAR RESTAURANTS */}
      <section className="home-section restaurants-section" id="restaurants">

        <div className="home-section-heading">
          <span></span>

          <div>
            <h2>Popular Restaurants</h2>
            <p>Discover top-rated restaurants near you</p>
          </div>

          <span></span>
        </div>

        <div className="restaurants-grid">

          {restaurants.map((restaurant, index) => (
            <article className="restaurant-card" key={index}>

              <div className="restaurant-image-wrapper">

                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                />

                <span className="restaurant-rating">
                  ⭐️ {restaurant.rating}
                </span>

              </div>

              <div className="restaurant-info">

                <div>
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.category}</p>
                </div>

                <Link to="/restaurants" className="restaurant-link">
                  →
                </Link>

              </div>

              <Link to="/restaurants" className="restaurant-meals-btn">
                Show All Meals
              </Link>

            </article>
          ))}

        </div>
      </section>

      {/* POPULAR MEALS */}
      <section className="home-section meals-section" id="meals">

        <div className="home-section-heading">
          <span></span>

          <div>
            <h2>Popular Meals</h2>
            <p>Our customers' favorite dishes</p>
          </div>

          <span></span>
        </div>

        <div className="meals-grid">

          {meals.map((meal, index) => (
            <article className="meal-card" key={index}>

              <div className="meal-image-wrapper">
                <img src={meal.image} alt={meal.name} />
              </div>

              <div className="meal-info">

                <h3>{meal.name}</h3>

                <div className="meal-bottom">
                  <strong>{meal.price}</strong>

                  <Link to="/meals" className="meal-add-btn">
                    +
                  </Link>
                </div>

              </div>

            </article>
          ))}

        </div>
      </section>

    </main>
  );
}

export default CustomerHome;