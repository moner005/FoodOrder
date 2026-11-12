
import { Link, NavLink } from 'react-router-dom'
import { routes } from '@/constants/routes'
import { useCartStore } from '@/stores/cartStore'

const links = [
  ['Home', routes.home],
  ['Cart', routes.cart],
  ['All Restaurants', routes.restaurants],
  ['My Profile', routes.profile],
  ['Check Order', routes.orders],
  ['Contact', routes.contact],
] as const

export function Header() {
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  )

  return (
    <header className="site-header">
      <Link className="brand" to={routes.home}>
        <span className="brand-mark">f</span>
        <span>
          FoodOrder
          <small>Food delivered with love</small>
        </span>
      </Link>

      <nav aria-label="Main navigation">
        {links.map(([label, to]) => (
          <NavLink
            key={to}
            to={to}
            end={to === routes.home}
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            {label}
            {to === routes.cart && (
              <span className="nav-cart-count">{count}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
