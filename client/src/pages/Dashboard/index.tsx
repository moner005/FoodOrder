
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStores';
import { useCartStore } from '@/stores/cartStore';
import { apiClient } from '@/services/apiClient';

import './Dashboard.css';

const ACTIVE_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
];

const NEXT_STATUS: Record<string, string> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

interface Restaurant {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  image?: string | null;
  status: string;
}

interface Meal {
  id: string;
  restaurantId: string;
  name: string;
  price: number | string;
  isAvailable: boolean;
}

interface OrderItem {
  id: string;
  mealName: string;
  quantity: number;
  subtotal: number | string;
}

interface Order {
  id: string;
  status: string;
  total: number | string;
  createdAt: string;
  items?: OrderItem[];
  restaurant?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

interface OwnerOrder extends Order {
  restaurantId: string;
  restaurantName: string;
}

function money(value: number | string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
}

function dateLabel(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

function statusLabel(status: string) {
  return status.replaceAll('_', ' ').toLowerCase().replace(
    /\b\w/g,
    (letter) => letter.toUpperCase(),
  );
}

// ==========================================
// MAIN DASHBOARD - ROLE DETECTION
// ==========================================

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const cartCount = useCartStore((state) =>
    state.items.reduce(
      (total, item) => total + item.quantity,
      0,
    ),
  );

  if (!user) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-role-empty">
          <h2>Please log in to view your dashboard.</h2>
          <Link to={routes.login} className="dashboard-primary-btn">
            Log in
          </Link>
        </section>
      </main>
    );
  }

  const role = user.role?.toUpperCase();

  if (role === 'ADMIN') {
    return <AdminDashboard userName={user.name} />;
  }

  if (role === 'RESTAURANT_OWNER') {
    return <OwnerDashboard userName={user.name} />;
  }

  if (role === 'CUSTOMER') {
    return (
      <CustomerDashboard
        userName={user.name}
        cartCount={cartCount}
      />
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-role-empty">
        <h2>Dashboard unavailable</h2>
        <p>
          Your account role is not supported by this dashboard.
        </p>
        <p>Current role: {role || 'Not assigned'}</p>
      </section>
    </main>
  );
}

// ==========================================
// CUSTOMER DASHBOARD
// ==========================================

function CustomerDashboard({
  userName,
  cartCount,
}: {
  userName: string;
  cartCount: number;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError('');

        const response = await apiClient.get<Order[]>(
          'orders/my-orders',
        );

        if (active) {
          setOrders(response.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load your orders.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  const activeOrders = orders.filter((order) =>
    ACTIVE_STATUSES.includes(order.status.toUpperCase()),
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status.toUpperCase() === 'DELIVERED',
  ).length;

  const stats = [
    {
      icon: '📦',
      title: 'Total Orders',
      value: orders.length,
      description: 'All your placed orders',
    },
    {
      icon: '🚚',
      title: 'Active Orders',
      value: activeOrders,
      description: 'Orders currently in progress',
    },
    {
      icon: '✓',
      title: 'Completed Orders',
      value: completedOrders,
      description: 'Successfully delivered orders',
    },
    {
      icon: '🛒',
      title: 'Items in Cart',
      value: cartCount,
      description: 'Current items in your cart',
    },
  ];

  return (
    <main className="dashboard-page">

      <header className="dashboard-header">
        <div>
          <p className="eyebrow">CUSTOMER DASHBOARD</p>
          <h1>Welcome back, {userName}.</h1>
          <p className="dashboard-description">
            Manage your orders and discover your favorite meals.
          </p>
        </div>

        <Link to={routes.meals} className="dashboard-primary-btn">
          Explore Menu →
        </Link>
      </header>

      <section className="dashboard-stats">
        {stats.map((stat) => (
          <article className="dashboard-stat-card" key={stat.title}>
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

      <section className="dashboard-content">
        <div className="dashboard-main-column">
          <article className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p className="eyebrow">YOUR ACTIVITY</p>
                <h2>Recent Orders</h2>
              </div>
              <Link to={routes.orders} className="dashboard-text-link">
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="dashboard-empty">
                Loading your orders...
              </div>
            ) : error ? (
              <div className="dashboard-empty">
                <h3>Unable to load orders</h3>
                <p>{error}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">🍽️</div>
                <h3>You haven't placed an order yet</h3>
                <p>Your order history will appear here.</p>
                <Link
                  to={routes.meals}
                  className="dashboard-outline-btn"
                >
                  Explore Meals
                </Link>
              </div>
            ) : (
              <div className="dashboard-recent-orders">
                {orders.slice(0, 5).map((order) => (
                  <Link
                    to={`/orders/${order.id}`}
                    className="dashboard-order-row"
                    key={order.id}
                  >
                    <div className="dashboard-order-info">
                      <strong>
                        Order #{order.id.slice(0, 8)}
                      </strong>
                      <small>
                        {order.restaurant?.name || 'Restaurant'} ·{' '}
                        {dateLabel(order.createdAt)}
                      </small>
                      <small>
                        {order.items?.length ?? 0} meal types
                      </small>
                    </div>

                    <div className="dashboard-order-meta">
                      <strong>${money(order.total)}</strong>
                      <span className="dashboard-order-status">
                        {statusLabel(order.status)}
                      </span>
                      <span>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>

          <article className="dashboard-panel dashboard-welcome-panel">
            <div className="dashboard-welcome-icon">🍽️</div>
            <div>
              <p className="eyebrow">GOOD FOOD IS WAITING</p>
              <h2>Something delicious is just a click away.</h2>
              <p>
                Browse restaurants and discover your favorite meals.
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

        <aside className="dashboard-sidebar">
          <QuickActions cartCount={cartCount} />

          <article className="dashboard-help-card">
            <span>💬</span>
            <h3>Need something?</h3>
            <p>We are here to make your food ordering journey easier.</p>
            <Link to={routes.contact}>Contact us →</Link>
          </article>
        </aside>
      </section>
    </main>
  );
}

// ==========================================
// RESTAURANT OWNER DASHBOARD
// ==========================================

function OwnerDashboard({ userName }: { userName: string }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [orders, setOrders] = useState<OwnerOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');

  useEffect(() => {
    let active = true;

    async function loadOwnerDashboard() {
      try {
        setLoading(true);
        setError('');

        const restaurantResponse =
          await apiClient.get<Restaurant[]>(
            'restaurants/my-restaurants',
          );

        const ownedRestaurants = restaurantResponse.data;

        if (!active) return;

        setRestaurants(ownedRestaurants);

        const results = await Promise.all(
          ownedRestaurants.map(async (restaurant) => {
            const [mealResult, orderResult] =
              await Promise.allSettled([
                apiClient.get<Meal[]>(
                  `meals/manage/restaurant/${restaurant.id}`,
                ),
                apiClient.get<Order[]>(
                  `orders/restaurant/${restaurant.id}`,
                ),
              ]);

            return {
              restaurant,
              meals:
                mealResult.status === 'fulfilled'
                  ? mealResult.value.data
                  : [],
              orders:
                orderResult.status === 'fulfilled'
                  ? orderResult.value.data
                  : [],
              failed:
                mealResult.status === 'rejected' ||
                orderResult.status === 'rejected',
            };
          }),
        );

        if (!active) return;

        setMeals(results.flatMap((result) => result.meals));

        const allOrders: OwnerOrder[] = results.flatMap((result) =>
          result.orders.map((order) => ({
            ...order,
            restaurantId: result.restaurant.id,
            restaurantName: result.restaurant.name,
          })),
        );

        allOrders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        );

        setOrders(allOrders);

        if (results.some((result) => result.failed)) {
          setActionMessage(
            'Some meal or order information could not be loaded. Please refresh.',
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load your restaurant dashboard.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOwnerDashboard();

    return () => {
      active = false;
    };
  }, []);

  const activeOrders = orders.filter((order) =>
    ACTIVE_STATUSES.includes(order.status.toUpperCase()),
  ).length;

  const pendingOrders = orders.filter(
    (order) => order.status.toUpperCase() === 'PENDING',
  ).length;

  const availableMeals = meals.filter(
    (meal) => meal.isAvailable,
  ).length;

  async function updateOrderStatus(order: OwnerOrder) {
    const currentStatus = order.status.toUpperCase();
    const nextStatus = NEXT_STATUS[currentStatus];

    if (!nextStatus) return;

    try {
      setUpdatingOrderId(order.id);
      setActionMessage('');

      await apiClient.patch(
        `orders/${order.id}/status`,
        { status: nextStatus },
      );

      setOrders((previous) =>
        previous.map((item) =>
          item.id === order.id
            ? { ...item, status: nextStatus }
            : item,
        ),
      );
    } catch (err) {
      setActionMessage(
        err instanceof Error
          ? err.message
          : 'Unable to update order status.',
      );
    } finally {
      setUpdatingOrderId('');
    }
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-role-empty">
          Loading your restaurant dashboard...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-role-empty">
          <h2>Unable to load your dashboard</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  const stats = [
    {
      icon: '🏪',
      title: 'My Restaurants',
      value: restaurants.length,
      description: 'Restaurants linked to your account',
    },
    {
      icon: '🍽️',
      title: 'Total Meals',
      value: meals.length,
      description: 'Meals across your restaurants',
    },
    {
      icon: '✓',
      title: 'Available Meals',
      value: availableMeals,
      description: 'Currently available for customers',
    },
    {
      icon: '📦',
      title: 'Total Orders',
      value: orders.length,
      description: `${activeOrders} active orders`,
    },
  ];

  return (
    <main className="dashboard-page">

      <header className="dashboard-header">
        <div>
          <p className="eyebrow">RESTAURANT OWNER DASHBOARD</p>
          <h1>Welcome back, {userName}.</h1>
          <p className="dashboard-description">
            Manage your restaurants, meals and customer orders.
          </p>
        </div>

        <Link
          to={routes.ownerHome}
          className="dashboard-primary-btn"
        >
          Manage Menu →
        </Link>
      </header>

      <section className="dashboard-stats">
        {stats.map((stat) => (
          <article className="dashboard-stat-card" key={stat.title}>
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

      {restaurants.length === 0 ? (
        <section className="dashboard-panel">
          <div className="dashboard-empty">
            <h2>No restaurants found</h2>
            <p>
              Your account is not currently linked to a restaurant
              with the Restaurant Owner role.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="dashboard-content">
            <div className="dashboard-main-column">
              <article className="dashboard-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <p className="eyebrow">YOUR BUSINESS</p>
                    <h2>My Restaurants</h2>
                  </div>

                  <Link
                    to={routes.ownerHome}
                    className="dashboard-text-link"
                  >
                    Manage Menu →
                  </Link>
                </div>

                <div className="dashboard-restaurant-list">
                  {restaurants.map((restaurant) => {
                    const restaurantMeals = meals.filter(
                      (meal) => meal.restaurantId === restaurant.id,
                    );

                    const restaurantOrders = orders.filter(
                      (order) => order.restaurantId === restaurant.id,
                    );

                    return (
                      <article
                        className="dashboard-restaurant-card"
                        key={restaurant.id}
                      >
                        <div className="dashboard-restaurant-info">
                          <strong>{restaurant.name}</strong>
                          <span>
                            {restaurant.description ||
                              restaurant.address ||
                              'Your restaurant'}
                          </span>
                        </div>

                        <span className="dashboard-restaurant-status">
                          {restaurant.status}
                        </span>

                        <div className="dashboard-restaurant-numbers">
                          <span>{restaurantMeals.length} meals</span>
                          <span>{restaurantOrders.length} orders</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </article>

              <article className="dashboard-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <p className="eyebrow">ORDER MANAGEMENT</p>
                    <h2>Recent Restaurant Orders</h2>
                  </div>
                  <span className="dashboard-order-status">
                    {pendingOrders} pending
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="dashboard-empty">
                    <h3>No orders received yet</h3>
                    <p>New customer orders will appear here.</p>
                  </div>
                ) : (
                  <div className="dashboard-recent-orders">
                    {orders.slice(0, 6).map((order) => {
                      const nextStatus =
                        NEXT_STATUS[order.status.toUpperCase()];

                      return (
                        <article
                          className="dashboard-order-row owner-order-row"
                          key={order.id}
                        >
                          <div className="dashboard-order-info">
                            <strong>
                              Order #{order.id.slice(0, 8)}
                            </strong>
                            <small>{order.restaurantName}</small>
                            <small>
                              Customer: {order.user?.name || 'Customer'}
                            </small>
                            <small>
                              {order.items?.length ?? 0} meal types ·{' '}
                              {dateLabel(order.createdAt)}
                            </small>
                          </div>

                          <div className="dashboard-order-meta">
                            <strong>${money(order.total)}</strong>

                            <span className="dashboard-order-status">
                              {statusLabel(order.status)}
                            </span>

                            {nextStatus && (
                              <button
                                type="button"
                                className="dashboard-status-btn"
                                disabled={
                                  updatingOrderId === order.id
                                }
                                onClick={() => updateOrderStatus(order)}
                              >
                                {updatingOrderId === order.id
                                  ? 'Updating...'
                                  : `Mark ${statusLabel(nextStatus)}`}
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </article>
            </div>

            <aside className="dashboard-sidebar">
              <article className="dashboard-panel">
                <p className="eyebrow">QUICK ACCESS</p>
                <h2>Management</h2>

                <div className="dashboard-quick-links">
                  <Link
                    to={routes.ownerHome}
                    className="dashboard-quick-link"
                  >
                    <span className="quick-link-icon">🍽️</span>
                    <span className="quick-link-content">
                      <strong>Manage Meals</strong>
                      <small>Add, edit and remove meals</small>
                    </span>
                    <span className="quick-link-arrow">→</span>
                  </Link>

                  <Link
                    to={routes.ownerMenuNew}
                    className="dashboard-quick-link"
                  >
                    <span className="quick-link-icon">+</span>
                    <span className="quick-link-content">
                      <strong>Add New Meal</strong>
                      <small>Create a new menu item</small>
                    </span>
                    <span className="quick-link-arrow">→</span>
                  </Link>
                </div>
              </article>

              <article className="dashboard-help-card">
                <span>📊</span>
                <h3>Business Overview</h3>
                <p>
                  You currently have {activeOrders} active orders
                  across your restaurants.
                </p>
              </article>
            </aside>
          </section>

          {actionMessage && (
            <p className="dashboard-data-note">
              {actionMessage}
            </p>
          )}
        </>
      )}
    </main>
  );
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

function AdminDashboard({ userName }: { userName: string }) {
  const [activeRestaurants, setActiveRestaurants] =
    useState<Restaurant[]>([]);

  const [pendingRestaurants, setPendingRestaurants] =
    useState<Restaurant[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [approvingId, setApprovingId] = useState('');

  useEffect(() => {
    let active = true;

    async function loadAdminDashboard() {
      try {
        setLoading(true);
        setError('');

        const [activeResponse, pendingResponse] =
          await Promise.all([
            apiClient.get<Restaurant[]>('restaurants'),
            apiClient.get<Restaurant[]>(
              'restaurants/admin/pending',
            ),
          ]);

        if (active) {
          setActiveRestaurants(activeResponse.data);
          setPendingRestaurants(pendingResponse.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load administrative data.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAdminDashboard();

    return () => {
      active = false;
    };
  }, []);

  async function approveRestaurant(restaurant: Restaurant) {
    try {
      setApprovingId(restaurant.id);
      setActionError('');

      await apiClient.patch(
        `restaurants/admin/${restaurant.id}/approve`,
      );

      setPendingRestaurants((previous) =>
        previous.filter((item) => item.id !== restaurant.id),
      );

      setActiveRestaurants((previous) => [
        { ...restaurant, status: 'ACTIVE' },
        ...previous,
      ]);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to approve this restaurant.',
      );
    } finally {
      setApprovingId('');
    }
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-role-empty">
          Loading administrative dashboard...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-role-empty">
          <h2>Unable to load admin dashboard</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  const stats = [
    {
      icon: '🏪',
      title: 'Active Restaurants',
      value: activeRestaurants.length,
      description: 'Approved and active restaurants',
    },
    {
      icon: '⏳',
      title: 'Pending Approvals',
      value: pendingRestaurants.length,
      description: 'Waiting for your review',
    },
    {
      icon: '📋',
      title: 'Known Restaurants',
      value: activeRestaurants.length + pendingRestaurants.length,
      description: 'Active and pending restaurants',
    },
  ];

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">ADMINISTRATOR DASHBOARD</p>
          <h1>Welcome back, {userName}.</h1>
          <p className="dashboard-description">
            Monitor restaurants and review new restaurant applications.
          </p>
        </div>
      </header>

      <section className="dashboard-stats dashboard-admin-stats">
        {stats.map((stat) => (
          <article className="dashboard-stat-card" key={stat.title}>
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

      <section className="dashboard-panel dashboard-admin-panel">
        <div className="dashboard-panel-heading">
          <div>
            <p className="eyebrow">RESTAURANT MANAGEMENT</p>
            <h2>Pending Restaurant Approvals</h2>
          </div>

          <span className="dashboard-order-status">
            {pendingRestaurants.length} waiting
          </span>
        </div>

        {actionError && (
          <p className="dashboard-data-note">{actionError}</p>
        )}

        {pendingRestaurants.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">✓</div>
            <h3>No pending applications</h3>
            <p>All currently listed restaurant applications have been reviewed.</p>
          </div>
        ) : (
          <div className="dashboard-restaurant-list">
            {pendingRestaurants.map((restaurant) => (
              <article
                className="dashboard-restaurant-card"
                key={restaurant.id}
              >
                <div className="dashboard-restaurant-info">
                  <strong>{restaurant.name}</strong>
                  <span>
                    {restaurant.description ||
                      restaurant.address ||
                      'Restaurant application'}
                  </span>
                  <small>
                    Status: {restaurant.status}
                  </small>
                </div>

                <button
                  type="button"
                  className="dashboard-status-btn"
                  disabled={approvingId === restaurant.id}
                  onClick={() => approveRestaurant(restaurant)}
                >
                  {approvingId === restaurant.id
                    ? 'Approving...'
                    : 'Approve Restaurant'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-panel dashboard-admin-panel">
        <div className="dashboard-panel-heading">
          <div>
            <p className="eyebrow">PLATFORM OVERVIEW</p>
            <h2>Active Restaurants</h2>
          </div>
        </div>

        {activeRestaurants.length === 0 ? (
          <div className="dashboard-empty">
            <p>No active restaurants found.</p>
          </div>
        ) : (
          <div className="dashboard-restaurant-list">
            {activeRestaurants.map((restaurant) => (
              <article
                className="dashboard-restaurant-card"
                key={restaurant.id}
              >
                <div className="dashboard-restaurant-info">
                  <strong>{restaurant.name}</strong>
                  <span>
                    {restaurant.description || restaurant.address || ''}
                  </span>
                </div>

                <span className="dashboard-restaurant-status">
                  {restaurant.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

// ==========================================
// CUSTOMER QUICK ACTIONS
// ==========================================

function QuickActions({ cartCount }: { cartCount: number }) {
  return (
    <article className="dashboard-panel">
      <p className="eyebrow">QUICK ACCESS</p>
      <h2>Quick Actions</h2>

      <div className="dashboard-quick-links">
        <Link to={routes.meals} className="dashboard-quick-link">
          <span className="quick-link-icon">🍽️</span>
          <span className="quick-link-content">
            <strong>Browse Menu</strong>
            <small>Discover available meals</small>
          </span>
          <span className="quick-link-arrow">→</span>
        </Link>

        <Link to={routes.cart} className="dashboard-quick-link">
          <span className="quick-link-icon">🛒</span>
          <span className="quick-link-content">
            <strong>My Cart</strong>
            <small>{cartCount} items currently selected</small>
          </span>
          <span className="quick-link-arrow">→</span>
        </Link>

        <Link to={routes.orders} className="dashboard-quick-link">
          <span className="quick-link-icon">📦</span>
          <span className="quick-link-content">
            <strong>My Orders</strong>
            <small>View order history</small>
          </span>
          <span className="quick-link-arrow">→</span>
        </Link>
      </div>
    </article>
  );
}
