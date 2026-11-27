import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/services/apiClient";
import "./Orders.css";

interface OrderItem {
  id: string;
  mealId: string;
  mealName: string;
  unitPrice: number | string;
  quantity: number;
  subtotal: number | string;
}

interface Order {
  id: string;
  status: string;
  subtotal: number | string;
  deliveryFee: number | string;
  total: number | string;
  deliveryAddress: string;
  notes?: string | null;
  createdAt: string;
  restaurant?: {
    id: string;
    name: string;
  };
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    const response = await apiClient.get<Order[]>("orders/my-orders");
    return response.data;
  }, []);

  useEffect(() => {
    let active = true;

    fetchOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load your orders.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchOrders]);

  const retryFetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      setOrders(await fetchOrders());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    try {
      await apiClient.patch(`orders/${orderId}/cancel`);

      setOrders((previous) =>
        previous.map((order) =>
          order.id === orderId ? { ...order, status: "CANCELLED" } : order,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to cancel order.");
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleString();

  return (
    <main className="orders-page">
      {/* Warm decorative banner */}
      <section className="orders-header">
        <div className="orders-header-content">
          <span className="orders-subtitle">YOUR ACCOUNT</span>

          <h1>Your Orders</h1>

          <p>All your orders from all restaurants, gathered in one place.</p>
        </div>

        <div className="orders-header-icon">🛍️</div>

        <div className="orders-count">{orders.length} Orders</div>
      </section>

      <section className="orders-content">
        <div className="orders-section-heading">
          <div>
            <h2>Order History</h2>
            <p>Keep track of your food deliveries.</p>
          </div>

          <Link to="/restaurants" className="orders-browse-btn">
            Explore Restaurants →
          </Link>
        </div>

        {loading && (
          <div className="orders-state">
            <p>Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="orders-state orders-error">
            <h3>Unable to load orders</h3>
            <p>{error}</p>

            <button onClick={retryFetchOrders}>Try Again</button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <div className="orders-empty-icon">🍽️</div>

            <h2>No Orders Yet</h2>

            <p>
              You haven't placed any orders yet. Your orders from all
              restaurants will appear here.
            </p>

            <Link to="/restaurants" className="orders-browse-btn">
              Start Ordering →
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-card-top">
                  <div>
                    <span className="order-small-label">ORDER NUMBER</span>

                    <h3>#{order.id.slice(0, 8)}</h3>

                    <p className="order-restaurant">
                      🏪 {order.restaurant?.name ?? "Restaurant"}
                    </p>
                  </div>

                  <span
                    className={`order-status status-${order.status
                      .toLowerCase()
                      .replaceAll("_", "-")}`}
                  >
                    {order.status.replaceAll("_", " ")}
                  </span>
                </div>

                <p className="order-date">{formatDate(order.createdAt)}</p>

                <div className="order-items-list">
                  {order.items.map((item) => (
                    <div className="order-item-row" key={item.id}>
                      <div>
                        <strong>{item.mealName}</strong>
                        <span>Quantity: {item.quantity}</span>
                      </div>

                      <strong>${Number(item.subtotal).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                <div className="order-delivery">
                  <span>📍 Delivery Address</span>
                  <p>{order.deliveryAddress}</p>
                </div>

                {order.notes && (
                  <p className="order-notes">Note: {order.notes}</p>
                )}

                <div className="order-total-row">
                  <span>Total Amount</span>

                  <strong>${Number(order.total).toFixed(2)}</strong>
                </div>

                {order.status === "PENDING" && (
                  <button
                    className="cancel-order-btn"
                    onClick={() => cancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
