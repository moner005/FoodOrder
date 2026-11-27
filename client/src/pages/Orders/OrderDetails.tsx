import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { apiClient } from '@/services/apiClient';

import './OrderDetails.css';

interface OrderItem {
  id: string;
  mealName: string;
  unitPrice: number | string;
  quantity: number;
  subtotal: number | string;
}

interface OrderDetails {
  id: string;
  status: string;
  subtotal: number | string;
  deliveryFee: number | string;
  total: number | string;
  deliveryAddress: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  restaurant?: {
    id: string;
    name: string;
    address?: string;
  };
  items: OrderItem[];
}

const ORDER_STEPS = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

function formatAmount(value: number | string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
}

function formatStatus(status: string) {
  return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) =>
    letter.toUpperCase(),
  );
}

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!id) {
        setError('Order ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await apiClient.get<OrderDetails>(
          `orders/${id}`,
        );

        if (active) {
          setOrder(response.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load this order.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="order-details-page">
        <div className="order-details-message">
          Loading order details...
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <div className="order-details-message">
          <h2>Unable to load order</h2>
          <p>{error || 'This order could not be found.'}</p>
          <Link to="/orders" className="order-details-back">
            Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  const currentStatus = order.status.toUpperCase();
  const currentStep = ORDER_STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  return (
    <main className="order-details-page">
      <header className="order-details-header">
        <div>
          <p className="eyebrow">ORDER INFORMATION</p>

          <h1>Order Details</h1>

          <p>
            Order #{order.id.slice(0, 8)} ·{' '}
            {new Date(order.createdAt).toLocaleString('en-GB')}
          </p>
        </div>

        <Link to="/orders" className="order-details-back">
          ← Back to My Orders
        </Link>
      </header>

      <section className="order-details-layout">
        <div className="order-details-main">
          <article className="order-details-panel">
            <div className="order-details-panel-heading">
              <div>
                <p className="eyebrow">DELIVERY PROGRESS</p>
                <h2>Order Status</h2>
              </div>

              <span
                className={`order-details-status status-${currentStatus.toLowerCase()}`}
              >
                {formatStatus(currentStatus)}
              </span>
            </div>

            {isCancelled ? (
              <div className="order-details-cancelled">
                This order has been cancelled.
              </div>
            ) : (
              <div className="order-details-timeline">
                {ORDER_STEPS.map((step, index) => {
                  const completed =
                    currentStep >= 0 && index < currentStep;
                  const current = index === currentStep;

                  return (
                    <div
                      className={[
                        'order-timeline-step',
                        completed ? 'completed' : '',
                        current ? 'current' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      key={step}
                    >
                      <span className="order-timeline-marker">
                        {completed ? '✓' : index + 1}
                      </span>

                      <span className="order-timeline-label">
                        {formatStatus(step)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          <article className="order-details-panel">
            <p className="eyebrow">YOUR PURCHASE</p>
            <h2>Ordered Meals</h2>

            <div className="order-details-items">
              {order.items.map((item) => (
                <div className="order-details-item" key={item.id}>
                  <div>
                    <strong>{item.mealName}</strong>
                    <p>
                      {item.quantity} × {formatAmount(item.unitPrice)}
                    </p>
                  </div>

                  <strong>{formatAmount(item.subtotal)}</strong>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="order-details-sidebar">
          <article className="order-details-panel">
            <p className="eyebrow">RESTAURANT</p>
            <h2>{order.restaurant?.name || 'Restaurant'}</h2>

            {order.restaurant?.address && (
              <p>{order.restaurant.address}</p>
            )}
          </article>

          <article className="order-details-panel">
            <p className="eyebrow">DELIVERY INFORMATION</p>
            <h2>Delivery Address</h2>

            <p>{order.deliveryAddress}</p>

            {order.notes && (
              <>
                <h3 className="order-details-subheading">
                  Order Notes
                </h3>
                <p>{order.notes}</p>
              </>
            )}
          </article>

          <article className="order-details-panel">
            <p className="eyebrow">PAYMENT SUMMARY</p>
            <h2>Order Total</h2>

            <div className="order-details-total-row">
              <span>Subtotal</span>
              <strong>{formatAmount(order.subtotal)}</strong>
            </div>

            <div className="order-details-total-row">
              <span>Delivery Fee</span>
              <strong>{formatAmount(order.deliveryFee)}</strong>
            </div>

            <div className="order-details-total-row grand-total">
              <span>Total</span>
              <strong>{formatAmount(order.total)}</strong>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}