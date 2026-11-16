import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { useCartStore } from '@/stores/cartStore';

import {
  getCheckoutCartItems,
} from '@/services/checkoutCartAdapter';

import './Checkout.css';

interface CheckoutForm {
  fullName: string;
  phone: string;
  address: string;
  notes: string;
}

interface Feedback {
  type: 'error' | 'info';
  message: string;
}

const initialForm: CheckoutForm = {
  fullName: '',
  phone: '',
  address: '',
  notes: '',
};

export default function CheckoutPage() {
  const cartLines = useCartStore(
    (state) => state.items,
  );

  const items = useMemo(
    () => getCheckoutCartItems(cartLines),
    [cartLines],
  );

  const [form, setForm] =
    useState<CheckoutForm>(initialForm);

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const updateField = (
    field: keyof CheckoutForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFeedback(null);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (items.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Your cart is empty. Add meals before continuing.',
      });

      return;
    }

    if (form.fullName.trim().length < 2) {
      setFeedback({
        type: 'error',
        message: 'Please enter your full name.',
      });

      return;
    }

    const phoneDigits = form.phone.replace(/\D/g, '');

    if (
      phoneDigits.length < 7 ||
      phoneDigits.length > 15
    ) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid phone number.',
      });

      return;
    }

    if (form.address.trim().length < 8) {
      setFeedback({
        type: 'error',
        message: 'Please enter a complete delivery address.',
      });

      return;
    }

    // Frontend validation only.
    // No API request or fake order is created.

    setFeedback({
      type: 'info',
      message:
        'Your delivery details are valid. Order submission is not available yet because the order API has not been implemented. Your cart and form data have not been changed.',
    });
  };

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <header className="checkout-heading">
          <p className="eyebrow">YOUR ORDER</p>
          <h1>Checkout</h1>
          <p>Complete your delivery information.</p>
        </header>

        <section className="checkout-empty">
          <span className="checkout-empty-icon">🛒</span>

          <h2>Your cart is empty</h2>

          <p>
            You need to add some meals before
            continuing to checkout.
          </p>

          <Link
            to={routes.meals}
            className="checkout-primary-btn"
          >
            Explore Menu →
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">

      {/* Header */}
      <header className="checkout-heading">
        <p className="eyebrow">ALMOST THERE</p>

        <h1>Complete your order.</h1>

        <p>
          Enter your details so your delivery information
          is ready.
        </p>

        <Link
          to={routes.cart}
          className="checkout-back-link"
        >
          ← Back to Cart
        </Link>
      </header>

      <div className="checkout-layout">

        {/* Form section */}
        <form
          className="checkout-form-column"
          onSubmit={handleSubmit}
          noValidate
        >

          {/* Customer information */}
          <section className="checkout-card">

            <div className="checkout-section-heading">
              <span className="checkout-step">01</span>

              <div>
                <h2>Customer Information</h2>

                <p>
                  Tell us who will receive the order.
                </p>
              </div>
            </div>

            <div className="checkout-fields">

              <div className="checkout-field">
                <label htmlFor="customer-name">
                  Full Name
                </label>

                <input
                  id="customer-name"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(event) =>
                    updateField(
                      'fullName',
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="customer-phone">
                  Phone Number
                </label>

                <input
                  id="customer-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateField(
                      'phone',
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

            </div>
          </section>

          {/* Delivery information */}
          <section className="checkout-card">

            <div className="checkout-section-heading">
              <span className="checkout-step">02</span>

              <div>
                <h2>Delivery Information</h2>

                <p>
                  Where should we deliver your order?
                </p>
              </div>
            </div>

            <div className="checkout-fields">

              <div className="checkout-field">
                <label htmlFor="customer-address">
                  Full Delivery Address
                </label>

                <textarea
                  id="customer-address"
                  name="address"
                  rows={4}
                  placeholder="Street, building, apartment and area..."
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(event) =>
                    updateField(
                      'address',
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="customer-notes">
                  Additional Instructions
                  <span> Optional</span>
                </label>

                <textarea
                  id="customer-notes"
                  name="notes"
                  rows={3}
                  placeholder="Any additional delivery instructions?"
                  value={form.notes}
                  onChange={(event) =>
                    updateField(
                      'notes',
                      event.target.value,
                    )
                  }
                />
              </div>

            </div>
          </section>

          {/* Payment information */}
          <section className="checkout-card">

            <div className="checkout-section-heading">
              <span className="checkout-step">03</span>

              <div>
                <h2>Payment Information</h2>

                <p>
                  Payment integration is not connected yet.
                </p>
              </div>
            </div>

            <div className="checkout-payment-notice">
              <span>🔒</span>

              <div>
                <strong>Payment method unavailable</strong>

                <p>
                  Payment options will be displayed once
                  the project payment and order flow
                  has been agreed and implemented.
                  Do not enter card information here.
                </p>
              </div>
            </div>

          </section>

          {/* Validation feedback */}
          {feedback && (
            <div
              className={`checkout-feedback ${feedback.type}`}
              role="status"
            >
              {feedback.type === 'error' ? '⚠' : 'ℹ'}

              <p>{feedback.message}</p>
            </div>
          )}

          <button
            type="submit"
            className="checkout-submit-btn"
          >
            Validate Delivery Details →
          </button>

          <p className="checkout-submit-note">
            This currently validates the form only.
            No order will be submitted.
          </p>

        </form>

        {/* Order summary */}
        <aside className="checkout-summary">

          <div className="checkout-summary-heading">
            <div>
              <p className="eyebrow">YOUR SELECTION</p>

              <h2>Order Summary</h2>
            </div>

            <span className="checkout-items-count">
              {totalQuantity} items
            </span>
          </div>

          <div className="checkout-summary-items">

            {items.map((item) => (
              <article
                className="checkout-summary-item"
                key={item.key}
              >

                <div className="checkout-item-image">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name ?? 'Selected meal'}
                    />
                  ) : (
                    <span>🍽️</span>
                  )}
                </div>

                <div className="checkout-item-details">
                  <strong>
                    {item.name ?? `Meal ${item.mealId}`}
                  </strong>

                  {item.description && (
                    <small>{item.description}</small>
                  )}

                  <span>
                    Quantity: {item.quantity}
                  </span>

                  {item.note && (
                    <small>
                      Note: {item.note}
                    </small>
                  )}
                </div>

              </article>
            ))}

          </div>

          <div className="checkout-summary-divider" />

          <div className="checkout-total-row">
            <span>Subtotal</span>
            <strong>Not available</strong>
          </div>

          <div className="checkout-total-row">
            <span>Delivery Fee</span>
            <strong>Not configured</strong>
          </div>

          <div className="checkout-grand-total">
            <strong>Estimated Total</strong>
            <strong>—</strong>
          </div>

          <div className="checkout-price-notice">
            Prices, currency and delivery charges will
            be displayed when the menu and restaurant
            data services are connected.
          </div>

          <div className="checkout-summary-footer">
            <span>🛡</span>

            <p>
              Your cart remains unchanged while you
              complete the checkout form.
            </p>
          </div>

        </aside>

      </div>
    </main>
  );
}
