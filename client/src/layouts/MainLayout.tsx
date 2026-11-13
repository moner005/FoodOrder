
import { Link, Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { routes } from '@/constants/routes'

export function MainLayout() {
  return (
    <>
      <Header />

      <main className="page-shell">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Link className="footer-logo" to={routes.home}>
              <span className="footer-logo-mark">S</span>
              SwiftBite
            </Link>

            <p>
              Delicious food, delivered fresh to your doorstep.
              Discover your favorite meals and enjoy every bite.
            </p>
          </div>

          <div className="footer-column">
            <h3>Quick Links</h3>
            <Link to={routes.home}>Home</Link>
            <Link to={routes.meals}>Explore Meals</Link>
            <Link to={routes.restaurants}>Restaurants</Link>
            <Link to={routes.cart}>My Cart</Link>
          </div>

          <div className="footer-column">
            <h3>My Account</h3>
            <Link to={routes.profile}>My Profile</Link>
            <Link to={routes.orders}>Track My Order</Link>
            <Link to={routes.checkout}>Checkout</Link>
            <Link to={routes.contact}>Contact Us</Link>
          </div>

          <div className="footer-column footer-contact">
            <h3>Get in Touch</h3>
            <p>Have a question or need help?</p>
            <Link to={routes.contact}>Visit our Contact Page</Link>
            <span>We're here to help!</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SwiftBite. All rights reserved.</p>
          <p>Made with love for food lovers.</p>
        </div>
      </footer>
    </>
  )
}
