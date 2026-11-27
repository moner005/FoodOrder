
import { Link } from 'react-router-dom';
import './Contact.css';

export default function ContactPage() {
  return (
    <main className="contact-page">

      <section className="contact-header">
        <div className="contact-header-content">
          <span>WE ARE HERE FOR YOU</span>
          <h1>Get In Touch</h1>
          <p>
            We would love to hear from you.
            Your feedback makes SwiftBite better.
          </p>
        </div>

        <div className="contact-header-icon">
          💌
        </div>
      </section>

      <section className="contact-main-card">

        <div className="contact-intro">
          <span className="contact-subtitle">
            CONTACT SWIFTBITE
          </span>

          <h2>How can we help you?</h2>

          <p>
            Have a question about your order or one of our
            restaurants? Explore your account or find your next
            favorite meal.
          </p>
        </div>

        <div className="contact-options">

          <article className="contact-option">
            <div className="contact-option-icon">
              📦
            </div>

            <h3>Order Support</h3>

            <p>
              Check your order history and follow
              your delivery status.
            </p>

            <Link to="/orders">
              View My Orders →
            </Link>
          </article>

          <article className="contact-option">
            <div className="contact-option-icon">
              🍽️
            </div>

            <h3>Our Restaurants</h3>

            <p>
              Discover available restaurants and explore
              their delicious menus.
            </p>

            <Link to="/restaurants">
              Explore Restaurants →
            </Link>
          </article>

          <article className="contact-option">
            <div className="contact-option-icon">
              👤
            </div>

            <h3>Your Account</h3>

            <p>
              Review your account information and
              manage your profile.
            </p>

            <Link to="/profile">
              Open My Profile →
            </Link>
          </article>

        </div>

        <div className="contact-footer-message">
          <span>♥</span>
          <p>
            Thank you for choosing SwiftBite.
            Good food, good mood!
          </p>
        </div>

      </section>

    </main>
  );
}
