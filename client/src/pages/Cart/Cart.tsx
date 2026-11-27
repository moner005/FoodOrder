
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

import '@/pages/Cart/Cart.css';
import { useCartStore } from '@/stores/cartStore';

export const CART_STORAGE_KEY = 'foodorder-cart-v2';

export interface CartItem {
  id: string | number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

export const addToCart = (newProduct: Omit<CartItem, 'quantity'>) => {
  useCartStore.getState().load();

  useCartStore.getState().addItem({
    mealId: String(newProduct.id),
    name: newProduct.name,
    description: newProduct.description,
    price: newProduct.price,
    imageUrl: newProduct.image,
    quantity: 1,
    note: '',
  });
};

const Cart = () => {
  const {
    items,
    load,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clear,
  } = useCartStore();

  useEffect(() => {
    load();
  }, [load]);

  const cartItems = items;

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (item.price ?? 0) * item.quantity,
    0,
  );

  const deliveryFee = cartItems.length > 0 ? 2.99 : 0;

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const total = subtotal + deliveryFee;

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clear();
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div>
          <span className="cart-subtitle">YOUR ORDER</span>
          <h1>My Cart</h1>
          <p>You have {totalItems} items in your shopping cart.</p>
        </div>

        <div className="cart-icon">🛒</div>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div>🍽️</div>
          <h2>Your cart is empty!</h2>
          <p>Looks like you haven't added anything yet.</p>

          <Link to="/meals" className="shop-btn">
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-products">
            <div className="section-title">
              <h2>Shopping Cart</h2>
              <span className="quantity-control">
                {cartItems.length} Products
              </span>
            </div>

            {cartItems.map((item) => (
              <div className="cart-product" key={item.mealId}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name ?? 'Meal'}
                    className="cart-product-image"
                  />
                ) : (
                  <div className="cart-product-image">🍽️</div>
                )}

                <div className="cart-product-info">
                  <h3>{item.name ?? `Meal ${item.mealId}`}</h3>
                  <p>{item.description}</p>

                  <span className="cart-price">
                    ${(item.price ?? 0).toFixed(2)}
                  </span>
                </div>

                <div className="quantity-control">
                  <button
                    onClick={() => decreaseQuantity(item.mealId)}
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.mealId)}
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    +
                  </button>

                  <button
                    className="remove-item-btn"
                    onClick={() => removeItem(item.mealId)}
                    aria-label={`Remove ${item.name}`}
                  >
                    🗑
                  </button>
                </div>

                <div className="item-total">
                  ${((item.price ?? 0) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}

            <Link to="/meals" className="continue-shopping">
              ← Continue Shopping
            </Link>

            <button className="clear-cart-btn" onClick={clearCart}>
              🗑 Clear Cart
            </button>
          </section>

          <aside className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="checkout-btn">
              Proceed to Checkout →
            </Link>

            <div className="secure-payment">
              🔒 Secure Checkout
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
