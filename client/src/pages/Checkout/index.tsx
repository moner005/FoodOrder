import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/services/apiClient";
import { getMeal, getRestaurants } from "@/services/marketplace";
import { quoteCart } from "@/services/cartQuote";
import { useAuthStore } from "@/stores/authStores";
import { useCartStore } from "@/stores/cartStore";
import { getSession } from "@/services/authStorage";
import type { CartLine } from "@/types/cart";
import type { Meal, Restaurant } from "@/types/marketplace";
import { amountToMinor, formatMinor } from "@/types/marketplace";
import "../Home/marketplace.css";

interface CheckoutPayload {
  requestId: string;
  expectedCustomerId?: string;
  deliveryAddress: string;
  notes?: string;
  deliveryArea?: string;
  expectedTotalMinor: number;
  items: Array<{ mealId: string; quantity: number; expectedUnitPriceMinor: number }>;
}
interface PendingAttempt { userId: string; payload: CheckoutPayload; cartSnapshot: CartLine[]; }
interface CheckoutResponse { checkoutId: string; ordersCreated: number; }
interface FormState { address: string; notes: string; area: string; }
const attemptKey = (userId: string) => `foodorder-checkout-attempt-v1:${encodeURIComponent(userId)}`;
function readAttempt(userId?: string): PendingAttempt | null {
  if (!userId) return null;
  try {
    const raw = sessionStorage.getItem(attemptKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingAttempt;
    return parsed.userId === userId && typeof parsed.payload?.requestId === "string" && Array.isArray(parsed.cartSnapshot) ? parsed : null;
  } catch { return null; }
}
function newRequestId() {
  if (!globalThis.crypto?.randomUUID) throw new Error("This browser cannot create a secure checkout request ID.");
  return globalThis.crypto.randomUUID();
}

export default function CheckoutPage() {
  const user = useAuthStore((state) => state.user);
  const cartLines = useCartStore((state) => state.items);
  const loadCart = useCartStore((state) => state.load);
  const matchesPersistedCart = useCartStore((state) => state.matchesPersistedCart);
  const clearIfUnchanged = useCartStore((state) => state.clearIfUnchanged);
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [meals, setMeals] = useState<Map<string, Meal | null>>(new Map());
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [catalogError, setCatalogError] = useState("");
  const [pending, setPending] = useState<PendingAttempt | null>(() => readAttempt(user?.id));
  const [form, setForm] = useState<FormState>(() => {
    const saved = readAttempt(user?.id)?.payload;
    return { address: saved?.deliveryAddress ?? user?.address ?? "", notes: saved?.notes ?? "", area: saved?.deliveryArea ?? "" };
  });
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const ids = cartLines.map((line) => line.mealId).sort().join("|");
  useEffect(() => { loadCart(); }, [loadCart]);
  useEffect(() => {
    let active = true;
    if (!ids) return () => { active = false; };
    void Promise.resolve().then(() => { if (active) { setLoadingCatalog(true); setCatalogError(""); } });
    Promise.all([getRestaurants(), ...cartLines.map((line) => getMeal(line.mealId).catch(() => null))]).then((results) => {
      if (!active) return;
      setRestaurants(results[0] as Restaurant[]);
      const next = new Map<string, Meal | null>();
      cartLines.forEach((line, index) => next.set(line.mealId, results[index + 1] as Meal | null));
      setMeals(next);
    }).catch((reason: unknown) => active && setCatalogError(reason instanceof Error ? reason.message : "Could not refresh the menu." )).finally(() => active && setLoadingCatalog(false));
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, catalogVersion]);
  const quote = useMemo(() => quoteCart(cartLines, meals, restaurants, form.area || undefined), [cartLines, meals, restaurants, form.area]);

  useEffect(() => {
    const current = readAttempt(user?.id);
    void Promise.resolve().then(() => {
      setPending(current);
      if (current) setForm({ address: current.payload.deliveryAddress, notes: current.payload.notes ?? "", area: current.payload.deliveryArea ?? "" });
    });
  }, [user?.id]);

  const update = (field: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setFeedback("");
  };
  const submitPayload = async (attempt: PendingAttempt) => {
    setSubmitting(true); setFeedback("");
    try {
      const payload = { ...attempt.payload, expectedCustomerId: attempt.payload.expectedCustomerId ?? attempt.userId };
      const response = await apiClient.post<CheckoutResponse>("orders/checkout", payload);
      if (useAuthStore.getState().user?.id !== attempt.userId || getSession()?.id !== attempt.userId) {
        setFeedback("The order was confirmed for the previous signed-in account. Sign back in to view its receipt; this checkout attempt is saved for recovery.");
        return;
      }
      let cartCleanupFailed = false;
      try { clearIfUnchanged(attempt.userId, attempt.cartSnapshot); }
      catch { cartCleanupFailed = true; }
      if (useAuthStore.getState().user?.id !== attempt.userId || getSession()?.id !== attempt.userId) {
        setFeedback("The order was confirmed for the previous signed-in account. Sign back in to view its receipt; this checkout attempt remains saved for recovery.");
        return;
      }
      if (!cartCleanupFailed) {
        try { sessionStorage.removeItem(attemptKey(attempt.userId)); setPending(null); }
        catch { /* Keep the same attempt available for idempotent recovery. */ }
      }
      navigate(`/orders/checkouts/${encodeURIComponent(response.data.checkoutId)}`, { state: { cartCleanupFailed } });
    } catch (reason) {
      const status = typeof reason === "object" && reason !== null && "response" in reason ? Number((reason as { response?: { status?: number } }).response?.status) : 0;
      const message = reason instanceof Error ? reason.message : "";
      const staleQuote = status === 409 && /price .* changed|total changed|refresh your cart/i.test(message);
      const confirmedReject = status >= 400 && status < 500 && status !== 401 && status !== 403 && status !== 408 && status !== 409 && status !== 429;
      if (staleQuote || confirmedReject) {
        sessionStorage.removeItem(attemptKey(attempt.userId));
        setPending(null);
        setFeedback(staleQuote ? `${message} Refresh the current menu before trying again.` : message || "Checkout was rejected. Review the current cart and try again.");
        if (staleQuote) setCatalogVersion((value) => value + 1);
      } else if (status === 401 || status === 403) {
        setFeedback("This checkout is still saved, but the current sign-in could not confirm it. Sign back in to the same customer account, then retry the exact checkout.");
      } else {
        setFeedback("The service did not confirm the result. Retry this same checkout to safely check whether it was saved.");
      }
    } finally { setSubmitting(false); }
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || user.role !== "CUSTOMER") { setFeedback("Checkout is available to customer accounts."); return; }
    if (pending) { setFeedback("A previous attempt is still awaiting confirmation. Retry that exact attempt first."); return; }
    if (!cartLines.length) { setFeedback("Your cart is empty."); return; }
    if (quote.issues.length || loadingCatalog || catalogError) { setFeedback("Resolve the cart availability, minimum, and delivery-area requirements before checkout."); return; }
    const address = form.address.trim();
    const notes = form.notes.trim();
    if (!address || address.length > 300) { setFeedback("Enter a delivery address of up to 300 characters."); return; }
    if (notes.length > 120) { setFeedback("Delivery instructions must be 120 characters or fewer."); return; }
    try {
      if (!matchesPersistedCart(user.id, cartLines)) {
        setFeedback("Your saved cart or sign-in changed. Review the current cart before placing an order.");
        return;
      }
      const payloadBase = {
        deliveryAddress: address,
        ...(notes ? { notes } : {}),
        ...(quote.areaRequired ? { deliveryArea: quote.commonAreas.find((area) => area.trim().toLocaleLowerCase() === form.area.trim().toLocaleLowerCase()) ?? form.area.trim() } : {}),
        expectedTotalMinor: quote.totalMinor,
        items: cartLines.map((line) => {
          const meal = meals.get(line.mealId);
          if (!meal) throw new Error("A cart dish could not be refreshed.");
          return { mealId: line.mealId, quantity: line.quantity, expectedUnitPriceMinor: amountToMinor(meal.price) };
        }).sort((a, b) => a.mealId.localeCompare(b.mealId)),
      };
      const attempt: PendingAttempt = { userId: user.id, payload: { requestId: newRequestId(), ...payloadBase }, cartSnapshot: cartLines.map((line) => ({ ...line })) };
      attempt.payload.expectedCustomerId = user.id;
      sessionStorage.setItem(attemptKey(user.id), JSON.stringify(attempt));
      setPending(attempt);
      await submitPayload(attempt);
    } catch (reason) {
      setFeedback(reason instanceof Error ? reason.message : "Unable to prepare checkout.");
    }
  };
  const retryPending = () => { if (pending && pending.userId === user?.id) void submitPayload(pending); };
  const count = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  if (!user || user.role !== "CUSTOMER") return <div className="sb-page"><div className="sb-empty"><h1>Customer checkout</h1><p>Sign in with a customer account to place an order.</p><Link className="sb-button sb-primary" to="/login">Sign in</Link></div></div>;
  if (!cartLines.length && !pending) return <div className="sb-page"><div className="sb-empty"><h1>Your cart is empty</h1><p>Add dishes from a restaurant menu to continue.</p><Link className="sb-button sb-primary" to="/restaurants">Browse restaurants</Link></div></div>;
  return <div className="sb-page">
    <header className="sb-page-heading"><div><p className="sb-eyebrow">CHECKOUT</p><h1>Delivery details</h1><p>Confirm your delivery address and review each restaurant’s quote.</p></div><Link to="/cart" className="sb-text-link">← Back to cart</Link></header>
    <div className="sb-checkout-layout"><form className="sb-checkout-form" onSubmit={handleSubmit}>
      <label>Delivery address<textarea value={form.address} maxLength={300} rows={3} autoComplete="street-address" required onChange={(event) => update("address", event.target.value)} placeholder="Street, building and apartment" /></label>
      {quote.areaRequired && <label>Delivery area<select required value={form.area} onChange={(event) => update("area", event.target.value)}><option value="">Choose a shared delivery area</option>{quote.commonAreas.map((area) => <option key={area} value={area}>{area}</option>)}</select></label>}
      <label>Delivery instructions <span className="sb-muted">Optional · up to 120 characters</span><textarea value={form.notes} maxLength={120} rows={3} onChange={(event) => update("notes", event.target.value)} placeholder="Gate code or delivery instructions" /></label>
      {catalogError && <p className="sb-error" role="alert">Menu refresh failed: {catalogError}</p>}
      {loadingCatalog && <p className="sb-muted" role="status">Checking current menu and delivery rules…</p>}
      {quote.issues.map((issue) => <p className="sb-error" key={issue}>{issue}</p>)}
      {pending && <div className="sb-pending"><strong>Checkout result needs confirmation</strong><p>We saved the exact request details locally. Retry it to receive the saved order or confirm that it was not accepted.</p><button className="sb-button sb-primary" type="button" disabled={submitting} onClick={retryPending}>{submitting ? "Checking…" : "Retry same checkout"}</button></div>}
      {feedback && <p className="sb-error" role="alert">{feedback}</p>}
      {feedback.includes("Refresh the current menu") && <button className="sb-button sb-secondary" type="button" onClick={() => setCatalogVersion((value) => value + 1)}>Refresh current menu</button>}
      <button className="sb-button sb-primary" type="submit" disabled={submitting || Boolean(pending) || loadingCatalog || Boolean(catalogError) || Boolean(quote.issues.length)}>{submitting ? "Placing order…" : "Place order"}</button>
      <p className="sb-muted">No payment details are collected by this preview.</p>
    </form><aside className="sb-summary"><p className="sb-eyebrow">{count} ITEMS · {quote.groups.length} RESTAURANTS</p><h2>Order summary</h2>{quote.groups.map((group) => <section className="sb-summary-group" key={group.restaurant.id}><h3>{group.restaurant.name}</h3>{group.lines.map(({ line, meal }) => <div className="sb-total-row" key={line.mealId}><span>{meal.name} × {line.quantity}</span><strong>{formatMinor(amountToMinor(meal.price) * line.quantity)}</strong></div>)}<div className="sb-total-row"><span>Food subtotal</span><strong>{formatMinor(group.subtotalMinor)}</strong></div><div className="sb-total-row"><span>Delivery fee</span><strong>{formatMinor(group.feeMinor)}</strong></div></section>)}<div className="sb-total-row sb-total"><span>Total</span><strong>{formatMinor(quote.totalMinor)}</strong></div>{quote.areaRequired && <p className="sb-muted">Shared delivery area: {quote.commonAreas.join(", ") || "unavailable"}</p>}</aside></div>
  </div>;
}
