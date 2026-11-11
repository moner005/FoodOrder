import { Link } from 'react-router-dom'
import { routes } from '@/constants/routes'

type AuthShowcaseProps = {
  eyebrow: string
  title: string
  description: string
}

export function AuthShowcase({ eyebrow, title, description }: AuthShowcaseProps) {
  return (
    <aside className="auth-showcase">
      <Link className="brand auth-brand" to={routes.home}>
        <span className="brand-mark">f</span>
        <span>SwiftBite<small>Neighborhood kitchen</small></span>
      </Link>

      <div className="auth-showcase-copy">
        <p className="auth-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="auth-art" aria-hidden="true">
        <div className="auth-plate"><span>f</span></div>
        <span className="auth-leaf auth-leaf-one" />
        <span className="auth-leaf auth-leaf-two" />
      </div>

      <p className="auth-footnote">Good food, made nearby.</p>
    </aside>
  )
}
