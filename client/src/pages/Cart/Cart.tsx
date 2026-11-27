import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { getMeal, getRestaurants } from "@/services/marketplace";
import { quoteCart } from "@/services/cartQuote";
import type { Meal, Restaurant } from "@/types/marketplace";
import { amountToMinor, formatMinor } from "@/types/marketplace";
import "../Home/marketplace.css";

export const CART_STORAGE_KEY = "foodorder-cart-v2";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const load = useCartStore((state) => state.load);
  const increase = useCartStore((state) => state.increaseQuantity);
  const decrease = useCartStore((state) => state.decreaseQuantity);
  const remove = useCartStore((state) => state.removeItem);
  const [meals, setMeals] = useState<Map<string, Meal | null>>(new Map());
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [error, setError] = useState("");
  const ids = items.map((item) => item.mealId).sort().join("|");
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    let active = true;
    if (!ids) return () => { active = false; };
    void Promise.resolve().then(() => { if (active) { setLoadingCatalog(true); setError(""); } });
    Promise.all([getRestaurants(), ...items.map((item) => getMeal(item.mealId).catch(() => null))]).then((results) => {
      if (!active) return;
      setRestaurants(results[0] as Restaurant[]);
      const next = new Map<string, Meal | null>();
      items.forEach((item, index) => next.set(item.mealId, results[index + 1] as Meal | null));
      setMeals(next);
    }).catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : "Could not refresh the menu." )).finally(() => active && setLoadingCatalog(false));
    return () => { active = false; };
  // ids changes whenever lines are added or removed; quantity changes do not affect catalog data.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);
  const quote = useMemo(() => quoteCart(items, meals, restaurants), [items, meals, restaurants]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="sb-page">
    <header className="sb-page-heading"><div><p className="sb-eyebrow">YOUR SELECTION</p><h1>Your cart</h1><p>{count} {count === 1 ? "item" : "items"} from {quote.groups.length} {quote.groups.length === 1 ? "restaurant" : "restaurants"}.</p></div><Link className="sb-text-link" to="/restaurants">Continue browsing →</Link></header>
    {items.length === 0 ? <div className="sb-empty"><h2>Your cart is empty</h2><p>Explore restaurant menus to add a meal.</p><Link className="sb-button sb-primary" to="/restaurants">Browse restaurants</Link></div> : <>
      {error && <p className="sb-error" role="alert">{error} Menu availability could not be refreshed.</p>}
      {loadingCatalog && <p className="sb-muted" role="status">Refreshing current prices and availability…</p>}
      <div className="sb-cart-layout"><section className="sb-cart-groups">
        {quote.groups.map((group) => <article className="sb-cart-group" key={group.restaurant.id}><div className="sb-cart-group-heading"><div><p className="sb-eyebrow">RESTAURANT</p><h2>{group.restaurant.name}</h2></div><span className={group.restaurant.isOpen ? "sb-open" : "sb-closed"}>{group.restaurant.isOpen ? "Open" : "Closed"}</span></div>
          {group.lines.map(({ line, meal }) => <div className="sb-cart-line" key={line.mealId}><img src={meal.image || line.imageUrl || "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=300"} alt="" /><div className="sb-cart-line-info"><h3>{meal.name}</h3><p>{meal.description || ""}</p><span>{meal.isAvailable ? "Available" : "Sold out"} · {formatMinor(amountToMinor(meal.price))} each</span></div><div className="sb-cart-quantity"><button type="button" onClick={() => decrease(line.mealId)} aria-label={`Decrease ${meal.name}`}>−</button><span>{line.quantity}</span><button type="button" onClick={() => increase(line.mealId)} disabled={line.quantity >= 99} aria-label={`Increase ${meal.name}`}>+</button></div><strong>{formatMinor(amountToMinor(meal.price) * line.quantity)}</strong><button className="sb-text-button" type="button" onClick={() => remove(line.mealId)}>Remove</button></div>)}
          <div className="sb-group-totals"><span>Food subtotal <strong>{formatMinor(group.subtotalMinor)}</strong></span><span>Minimum <strong>{formatMinor(group.minimumMinor)}</strong></span><span>Delivery <strong>{formatMinor(group.feeMinor)}</strong></span></div>
        </article>)}
        {items.some((item) => !meals.get(item.mealId)) && <article className="sb-closed-notice"><strong>Some dishes are no longer on the menu.</strong>{items.filter((item) => !meals.get(item.mealId)).map((item) => <p key={item.mealId}>{item.name || "A previous menu item"} <button className="sb-text-button" type="button" onClick={() => remove(item.mealId)}>Remove from cart</button></p>)}</article>}
      </section><aside className="sb-summary"><h2>Order summary</h2><div className="sb-total-row"><span>Food subtotal</span><strong>{formatMinor(quote.subtotalMinor)}</strong></div><div className="sb-total-row"><span>Delivery fees</span><strong>{formatMinor(quote.deliveryFeeMinor)}</strong></div><div className="sb-total-row sb-total"><span>Estimated total</span><strong>{formatMinor(quote.totalMinor)}</strong></div>
        {quote.areaRequired && <div className="sb-summary-note"><strong>Shared delivery area</strong><p>{quote.commonAreas.length ? quote.commonAreas.join(", ") : "No common delivery area for these restaurants."}</p></div>}
        {quote.issues.map((issue) => <p className="sb-error" key={issue}>{issue}</p>)}
        {quote.issues.length === 0 && !loadingCatalog && <Link className="sb-button sb-primary sb-full" to="/checkout">Continue to checkout →</Link>}
        {quote.issues.length > 0 && <p className="sb-muted">Resolve the items above before checkout.</p>}
        <p className="sb-muted">Each restaurant has its own delivery fee and minimum.</p>
      </aside></div>
    </>}
  </div>;
}
