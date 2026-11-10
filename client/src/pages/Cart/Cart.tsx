
import { Link } from "react-router-dom";
import "@/pages/Cart/Cart.css"
import {useState,useEffect} from "react";
interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

const initialCart: CartItem[] = [
  {
    id: 1,
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato and basil",
    price: 12.99,
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
  },
  {
    id: 2,
    name: "Classic Beef Burger",
    description: "Juicy beef, cheese and fresh vegetables",
    price: 9.99,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
  },
  {
    id: 3,
    name: "French Fries",
    description: "Golden crispy potato fries",
    price: 4.99,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
  },
];

const Cart = () => {
const [cartItems, setCartItems] = useState<CartItem[]>(() => {
  const savedCart = localStorage.getItem("foodorder-cart");

  return savedCart
    ? JSON.parse(savedCart)
    : initialCart;
});

useEffect(() => {
  localStorage.setItem("foodorder-cart", JSON.stringify(cartItems));
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

const addToCart = (newProduct: CartItem) => {
  setCartItems((prevItems) => {
    const existingProduct = prevItems.find(
      (item) => item.id === newProduct.id
    );

    if (existingProduct) {
      return prevItems.map((item) =>
        item.id === newProduct.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...prevItems, { ...newProduct, quantity: 1 }];
  });
};

const removeItem = (id: number) => {
  setCartItems((prevItems) =>
    prevItems.filter((item) => item.id !== id)
  );
};

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
          <div>🛍️</div>
          <h2>Your cart is empty!</h2>
          <p>Looks like you haven't added anything yet.</p>
         <Link
  to="/products"
  className="shop-btn"
  onClick={() => setCartItems(initialCart)}
>
  Explore Menu
</Link>
        </div>

      ) : (
        <div className="cart-layout">
          <section className="cart-products">

            <div className="section-title">
              <h2>Shopping Cart</h2>

              <span  className="quantity-control">{cartItems.length} Products</span>
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

            <Link to="/Meals" className="continue-shopping">
              ← Continue Shopping
            </Link>
            
                          <button
  className="clear-cart-btn"
  onClick={() => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setCartItems([]);
    }
  }}
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