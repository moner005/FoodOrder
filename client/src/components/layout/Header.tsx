import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStores";

import "./header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  // Get cart data directly from Zustand
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  const loadCart = useCartStore((state) => state.load);

  // Load saved cart when Header mounts
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Authentication
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="swift-header">
      {/* Logo */}
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

      {/* Mobile Menu */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation */}
      <nav className={`swift-nav ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>
          Home
        </NavLink>

        <NavLink to="/restaurants" onClick={() => setMenuOpen(false)}>
          Restaurants
        </NavLink>

        <NavLink to="/meals" onClick={() => setMenuOpen(false)}>
          Meals
        </NavLink>

        <NavLink to="/checkout" onClick={() => setMenuOpen(false)}>
          Checkout
        </NavLink>

        {user && (
          <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
            My Profile
          </NavLink>
        )}

        <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
          Contact
        </NavLink>
      </nav>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Cart */}
        <NavLink
          to="/cart"
          className="cart-btn"
          aria-label={`Shopping cart, ${cartCount} items`}
        >
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

        {/* Logged-in User */}
        {user ? (
          <>
            <span className="header-user-name">Hi, {user.name}</span>

            <button type="button" className="login-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="login-btn">
              Login
            </NavLink>

            <NavLink to="/register" className="login-btn">
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
