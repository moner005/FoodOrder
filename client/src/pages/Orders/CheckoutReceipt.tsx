import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiClient } from "@/services/apiClient";
import { formatMinor, amountToMinor } from "@/types/marketplace";
import "../Home/marketplace.css";

interface ReceiptOrder {
  id: string;
  checkoutBatchId: string | null;
  restaurantName: string;
  status: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  deliveryAddress: string;
  notes?: string | null;
  items: Array<{ id: string; mealName: string; unitPrice: string; quantity: number; subtotal: string }>;
}
interface CheckoutReceipt { checkoutId: string; createdAt: string; deliveryArea: string | null; subtotal: string; deliveryFee: string; total: string; orders: ReceiptOrder[]; }

export default function CheckoutReceiptPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    apiClient.get<CheckoutReceipt>(`orders/checkouts/${encodeURIComponent(id)}`).then((result) => active && setReceipt(result.data)).catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : "Could not load this receipt.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);
  if (loading) return <div className="sb-page"><p className="sb-muted" role="status">Loading checkout receipt…</p></div>;
  if (error || !receipt) return <div className="sb-page"><div className="sb-empty"><h1>Receipt unavailable</h1><p>{error || "This checkout could not be found."}</p><Link to="/orders" className="sb-button sb-primary">Back to order history</Link></div></div>;
  return <div className="sb-page"><header className="sb-page-heading"><div><p className="sb-eyebrow">CHECKOUT RECEIPT</p><h1>Order placed</h1><p>Checkout {receipt.checkoutId.slice(0, 8)} · {new Date(receipt.createdAt).toLocaleString()}</p></div><Link className="sb-text-link" to="/orders">Order history →</Link></header>
    <section className="sb-receipt"><div className="sb-receipt-intro"><span className="sb-receipt-check" aria-hidden="true">✓</span><div><h2>Your order is saved</h2><p>Each restaurant will update its own order status.</p></div></div>
      {receipt.orders.map((order) => <article className="sb-receipt-group" key={order.id}><div className="sb-cart-group-heading"><div><p className="sb-eyebrow">RESTAURANT</p><h2>{order.restaurantName}</h2></div><span className="sb-status-pill">{order.status.replaceAll("_", " ")}</span></div><div className="sb-receipt-items">{order.items.map((item) => <div className="sb-total-row" key={item.id}><span>{item.quantity} × {item.mealName} <small>{formatMinor(amountToMinor(item.unitPrice))} each</small></span><strong>{formatMinor(amountToMinor(item.subtotal))}</strong></div>)}</div><div className="sb-total-row"><span>Food subtotal</span><strong>{formatMinor(amountToMinor(order.subtotal))}</strong></div><div className="sb-total-row"><span>Delivery fee</span><strong>{formatMinor(amountToMinor(order.deliveryFee))}</strong></div><div className="sb-total-row sb-total"><span>Restaurant total</span><strong>{formatMinor(amountToMinor(order.total))}</strong></div><p className="sb-muted">Deliver to {order.deliveryAddress}</p>{order.notes && <p className="sb-muted">Instructions: {order.notes}</p>}<Link className="sb-text-link" to={`/orders/${encodeURIComponent(order.id)}`}>View order status →</Link></article>)}
      <div className="sb-receipt-total"><div className="sb-total-row"><span>Combined food subtotal</span><strong>{formatMinor(amountToMinor(receipt.subtotal))}</strong></div><div className="sb-total-row"><span>Combined delivery fees</span><strong>{formatMinor(amountToMinor(receipt.deliveryFee))}</strong></div>{receipt.deliveryArea && <div className="sb-total-row"><span>Delivery area</span><strong>{receipt.deliveryArea}</strong></div>}<div className="sb-total-row sb-total"><span>Checkout total</span><strong>{formatMinor(amountToMinor(receipt.total))}</strong></div></div>
    </section>{(location.state as { cartCleanupFailed?: boolean } | null)?.cartCleanupFailed && <p className="sb-closed-notice" role="status">Your order is saved. The cart could not be cleared automatically; review it before placing another order.</p>}<div className="sb-actions"><Link className="sb-button sb-primary" to="/orders">View order history</Link><Link className="sb-button sb-secondary" to="/restaurants">Browse restaurants</Link></div>
  </div>;
}
