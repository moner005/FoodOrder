import { Link } from "react-router-dom";
import "@/pages/Cart/Cart.css";
import { useState, useEffect } from "react";

export const CART_STORAGE_KEY = "foodorder-cart-v2";

export interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

export const addToCart = (
  newProduct: Omit<CartItem, "quantity">
) => {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);

  const currentCart: CartItem[] = savedCart
    ? JSON.parse(savedCart)
    : [];

  const existingProduct = currentCart.find(
    (item) => item.id === newProduct.id
  );

  let updatedCart: CartItem[];

  if (existingProduct) {
    updatedCart = currentCart.map((item) =>
      item.id === newProduct.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  } else {
    updatedCart = [
      ...currentCart,
      { ...newProduct, quantity: 1 },
    ];
  }

  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(updatedCart)
  );
};

const Cart = () => {

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  const increaseQuantity = (id: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id: number) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== id)
    );
  };

  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setCartItems([]);
    }
  };
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryFee = cartItems.length > 0 ? 2.99 : 0;

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const total = subtotal + deliveryFee;

  return (
    <div className="cart-page">

      <div className="cart-header">
        <div>
          <span className="cart-subtitle">YOUR ORDER</span>

          <h1>My Cart</h1>

          <p>
            You have {totalItems} items in your shopping cart.
          </p>
        </div>

        <div className="cart-icon">🛒</div>
      </div>

      {cartItems.length === 0 ? (

        <div className="empty-cart">

          <div>🍽️</div>

          <h2>Your cart is empty!</h2>

          <p>
            Looks like you haven't added anything yet.
          </p>

          <Link
            to="/Meals"
            className="shop-btn"
          >
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

              <div className="cart-product" key={item.id}>

                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-product-image"
                />

                <div className="cart-product-info">

                  <h3>{item.name}</h3>

                  <p>{item.description}</p>

                  <span className="cart-price">
                    ${item.price.toFixed(2)}
                  </span>

                </div>
                <div className="quantity-control">

                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    +
                  </button>

                  <button
                    className="remove-item-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    🗑
                  </button>

                </div>

                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

              </div>

            ))}

            <Link
              to="/Meals"
              className="continue-shopping"
            >
              ← Continue Shopping
            </Link>

            <button
              className="clear-cart-btn"
              onClick={clearCart}
            >
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

            <div className="summary-divider"></div>

            <div className="summary-total">

              <span>Total</span>

              <span>${total.toFixed(2)}</span>

            </div>

            <button
              className="checkout-btn"
              onClick={() => alert("Checkout coming soon!")}
            >
              Proceed to Checkout →
            </button>

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
