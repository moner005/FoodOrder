
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { useCartStore } from '@/stores/cartStore';
import { getCheckoutCartItems } from '@/services/checkoutCartAdapter';

import './Dashboard.css';

export default function DashboardPage() {
  const cartLines = useCartStore((state) => state.items);

  const cartItems = useMemo(
    () => getCheckoutCartItems(cartLines),
    [cartLines],
  );

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const stats = [
    {
      icon: '📦',
      title: 'Total Orders',
      value: '—',
      description: 'Order history is not connected yet',
    },
    {
      icon: '🚚',
      title: 'Active Orders',
      value: '—',
      description: 'Available after order integration',
    },
    {
      icon: '✓',
      title: 'Completed Orders',
      value: '—',
      description: 'No order history source yet',
    },
    {
      icon: '🛒',
      title: 'Items in Cart',
      value: cartCount.toString(),
      description: 'Current items in your shopping cart',
    },
  ];

  return (
    <main className="dashboard-page">

      {/* Dashboard header */}
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">CUSTOMER DASHBOARD</p>

          <h1>Welcome to your dashboard.</h1>

          <p className="dashboard-description">
            Your personal space to explore meals and
            manage your food ordering journey.
          </p>
        </div>

        <Link
          to={routes.meals}
          className="dashboard-primary-btn"
        >
          Explore Menu <span>→</span>
        </Link>
      </header>

      {/* Statistics */}
      <section
        className="dashboard-stats"
        aria-label="Account overview"
      >
        {stats.map((stat) => (
          <article
            className="dashboard-stat-card"
            key={stat.title}
          >
            <div className="dashboard-stat-top">
              <span className="dashboard-stat-icon">
                {stat.icon}
              </span>

              <span className="dashboard-stat-dot" />
            </div>

            <p>{stat.title}</p>

            <strong>{stat.value}</strong>

            <small>{stat.description}</small>
          </article>
        ))}
      </section>

      {/* Main content */}
      <section className="dashboard-content">

        <div className="dashboard-main-column">

          {/* Recent orders */}
          <article className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p className="eyebrow">YOUR ACTIVITY</p>
                <h2>Recent Orders</h2>
              </div>

              <Link
                to={routes.orders}
                className="dashboard-text-link"
              >
                View all →
              </Link>
            </div>

            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">
                📦
              </div>

              <h3>Your order history will appear here</h3>

              <p>
                Once the orders service is implemented,
                you will be able to track your orders,
                review previous purchases and see their
                delivery status.
              </p>

              <Link
                to={routes.meals}
                className="dashboard-outline-btn"
              >
                Explore meals
              </Link>
            </div>
          </article>

          {/* Getting started */}
          <article className="dashboard-panel dashboard-welcome-panel">
            <div className="dashboard-welcome-icon">
              🍽️
            </div>

            <div>
              <p className="eyebrow">GOOD FOOD IS WAITING</p>

              <h2>Something delicious is just a click away.</h2>

              <p>
                Browse the menu, discover your favorite
                meals and add them to your cart.
              </p>

              <Link
                to={routes.meals}
                className="dashboard-text-link"
              >
                Discover the menu →
              </Link>
            </div>
          </article>

        </div>

        {/* Sidebar */}
        <aside className="dashboard-sidebar">

          <article className="dashboard-panel">
            <p className="eyebrow">QUICK ACCESS</p>

            <h2>Quick Actions</h2>

            <div className="dashboard-quick-links">

              <Link
                to={routes.meals}
                className="dashboard-quick-link"
              >
                <span className="quick-link-icon">
                  🍔
                </span>

                <span className="quick-link-content">
                  <strong>Browse Menu</strong>
                  <small>Discover available meals</small>
                </span>

                <span className="quick-link-arrow">→</span>
              </Link>

              <Link
                to={routes.cart}
                className="dashboard-quick-link"
              >
                <span className="quick-link-icon">
                  🛒
                </span>

                <span className="quick-link-content">
                  <strong>My Cart</strong>
                  <small>
                    {cartCount} items currently selected
                  </small>
                </span>

                <span className="quick-link-arrow">→</span>
              </Link>

              <Link
                to={routes.orders}
                className="dashboard-quick-link"
              >
                <span className="quick-link-icon">
                  📋
                </span>

                <span className="quick-link-content">
                  <strong>My Orders</strong>
                  <small>View order history</small>
                </span>

                <span className="quick-link-arrow">→</span>
              </Link>

            </div>
          </article>

          <article className="dashboard-help-card">
            <span>💡</span>

            <h3>Need something?</h3>

            <p>
              Start by exploring our menu and choosing
              your favorite meals.
            </p>

            <Link to={routes.meals}>
              Start exploring →
            </Link>
          </article>

        </aside>
      </section>

      <p className="dashboard-data-note">
        Order statistics and history will be available
        after integration with the orders service.
      </p>

    </main>
  );
}
