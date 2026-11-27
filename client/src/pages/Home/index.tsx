
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



function CustomerHome() {
  return (
    <main className="customer-home">
      {/* HERO SECTION */}
      <section className="customer-hero">
        <div className="hero-decoration circle-one"></div>
        <div className="hero-decoration circle-two"></div>
        <div className="hero-decoration circle-three"></div>

        <div className="hero-content">
          <span className="hero-tag">🍴 Delicious Food, Delivered Fast</span>

          <h1>
            Good Food.
            <br />
            <span>Great Mood!</span>
          </h1>

          <p>
            Order your favorite meals from the best restaurants and enjoy fast
            delivery at your doorstep.
          </p>

          <div className="hero-buttons">
            <Link to="/restaurants" className="hero-primary-btn">
              Explore Restaurants <span>→</span>
            </Link>
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

        <div className="hero-visual">
          <div className="burger-background-circle"></div>

          <div className="exploding-burger">
            <img
              src={topBun}
              alt="Burger top bun"
              className="burger-part top-bun"
            />

            <img src={lettuce} alt="Lettuce" className="burger-part lettuce" />

            <img src={tomato} alt="Tomato" className="burger-part tomato" />

            <img src={cheese} alt="Cheese" className="burger-part cheese" />
            <img src={patty} alt="Burger patty" className="burger-part patty" />

            <img
              src={bottomBun}
              alt="Bottom bun"
              className="burger-part bottom-bun"
            />
          </div>
        </div>
      </section>

      <section className="features-bar">
        {features.map((feature, index) => (
          <div className="feature-item" key={index}>
            <div className="feature-icon">{feature.icon}</div>

            <div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

export default CustomerHome;
