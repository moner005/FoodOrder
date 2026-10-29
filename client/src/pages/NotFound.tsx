import { Link } from 'react-router-dom'
export default function NotFoundPage() { return <section className="panel not-found"><p className="eyebrow">404 · Page not found</p><h1>That table isn’t here.</h1><p>Check the address or return to the restaurant overview.</p><Link className="button primary" to="/">Back to home</Link></section> }
