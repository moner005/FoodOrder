import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="swift-footer">

      <div className="footer-container">

        
        <div className="footer-brand">

          <Link to="/" className="footer-logo">

            <div className="footer-logo-icon">
              🍔
            </div>

            <span>SwiftBite</span>

          </Link>

          <p className="footer-description">
            Delicious food, delivered with love.
            Discover your favorite meals and enjoy
            every bite with SwiftBite.
          </p>

          <div className="footer-socials">

            <a href="#facebook" aria-label="Facebook">
              f
            </a>

            <a href="#instagram" aria-label="Instagram">
              ◎
            </a>

            <a href="#twitter" aria-label="Twitter">
              𝕏
            </a>

            <a href="#youtube" aria-label="YouTube">
              ▶
            </a>

          </div>

        </div>


    
        <div className="footer-column">

          <h3>Quick Links</h3>

          <ul>

            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/restaurants">Restaurants</Link>
            </li>

            <li>
              <Link to="/meals">Explore Meals</Link>
            </li>

            <li>
              <Link to="/about">About Us</Link>
            </li>

            <li>
              <Link to="/contact">Contact Us</Link>
            </li>

          </ul>

        </div>


    
        <div className="footer-column">

          <h3>Customer Service</h3>

          <ul>

            <li>
              <Link to="/profile">My Account</Link>
            </li>

            <li>
              <Link to="/cart">My Cart</Link>
            </li>

            <li>
              <Link to="/checkout">Checkout</Link>
            </li>

            <li>
              <a href="#faq">FAQs</a>
            </li>

            <li>
              <a href="#support">Help & Support</a>
            </li>

          </ul>

        </div>


        
        <div className="footer-column footer-contact">

          <h3>Get In Touch</h3>

          <p>
            Have questions or need help?
            We'd love to hear from you.
          </p>

          <div className="contact-item">
            <span>✉</span>
            <a href="mailto:hello@swiftbite.com">
              hello@swiftbite.com
            </a>
          </div>

          <div className="contact-item">
            <span>📍</span>
            <span>Delivering happiness to your door</span>
          </div>

          <Link to="/contact" className="footer-contact-btn">
            Contact Us →
          </Link>

        </div>

      </div>


      
      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} SwiftBite.
          All rights reserved.
        </p>

        <div className="footer-bottom-links">

          <a href="#privacy">Privacy Policy</a>

          <span>•</span>

          <a href="#terms">Terms & Conditions</a>

        </div>

        <p className="footer-made">
          Made with <span>♥</span> for food lovers
        </p>

      </div>

    </footer>
  );
};

export default Footer;