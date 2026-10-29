import { Link, NavLink } from 'react-router-dom'
import { routes } from '@/constants/routes'
import { useCartStore } from '@/stores/cartStore'
const links = [['Home', routes.home], ['Menu', routes.meals], ['Orders', routes.orders]] as const
export function Header() {
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))
  return <header className="site-header"><Link className="brand" to={routes.home}><span className="brand-mark">f</span><span>FoodOrder<small>Neighborhood kitchen</small></span></Link><nav aria-label="Main navigation">{links.map(([label, to]) => <NavLink key={to} to={to} end={to === routes.home} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{label}</NavLink>)}</nav><Link className="cart-link" to={routes.cart}>Your cart <span aria-label={`${count} items in cart`}>{count}</span></Link></header>
}
