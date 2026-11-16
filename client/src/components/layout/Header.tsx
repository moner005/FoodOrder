import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";

const Header = ({ cartCount = 0 }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="swift-header">
      <NavLink to="/" className="swift-logo">
        <svg className="logo-icon" viewBox="0 0 55 45" fill="none">
          <path d="M12 27C12 17 19 9 28 9C37 9 44 17 44 27" fill="#9b3f27" />

          <path d="M8 29H48V33H8V29Z" fill="#9b3f27" />

          <path
            d="M13 36H43"
            stroke="#9b3f27"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d="M4 21H9M2 26H7M46 16H52"
            stroke="#9b3f27"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <circle cx="28" cy="14" r="2" fill="#fbf8f2" />
        </svg>

        <span>SwiftBite</span>
      </NavLink>

      <button
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`swift-nav ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>
          Home
        </NavLink>

        <NavLink to="/restaurants" onClick={() => setMenuOpen(false)}>
          Restaurants
        </NavLink>

        <NavLink to="/checkout" onClick={() => setMenuOpen(false)}>
          Checkout
        </NavLink>

        <NavLink to="/Userprofile" onClick={() => setMenuOpen(false)}>
          Userprofile
        </NavLink>

        <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
          Contact
        </NavLink>
      </nav>

      <div className="header-actions">
        <NavLink to="/cart" className="cart-btn" aria-label="Shopping cart">
          <svg
            viewBox="0 0 24 24"
            width="23"
            height="23"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1H5L7.7 14.5A2 2 0 0 0 9.7 16H19a2 2 0 0 0 2-1.6L23 6H6" />
          </svg>

          <span className="cart-count">{cartCount}</span>
        </NavLink>

        <NavLink to="/login" className="login-btn">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5Z" />
          </svg>
          Login / Sign Up
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
