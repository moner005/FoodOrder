import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/services/apiClient";
import { formatMinor, amountToMinor } from "@/types/marketplace";
import "./Admin.css";

type AccountRole = "CUSTOMER" | "RESTAURANT_OWNER";
interface Account {
  id: string; name: string; email: string; role: AccountRole; isSuspended: boolean; createdAt: string; updatedAt: string;
  memberships: Array<{ restaurant: { id: string; name: string } }>;
}
interface Venue {
  id: string; name: string; slug: string; description: string | null; address: string | null; image: string | null; cuisine: string;
  status: string; isOpen: boolean; deliveryFee: string; minimumSubtotal: string; deliveryAreas: string[]; updatedAt: string;
}
interface AdminOrder {
  id: string; checkoutBatchId: string | null; status: string; total: string; createdAt: string;
  restaurantId: string; restaurantName: string | null; deliveryAddress: string;
  restaurant: { id: string; name: string }; user: { id: string; name: string; email: string };
}
type Tab = "accounts" | "restaurants" | "orders";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("accounts");
  return <div className="sb-page admin-page"><header className="admin-heading"><div><p className="sb-eyebrow">PLATFORM MANAGEMENT</p><h1>Administration</h1><p>Manage customer and owner access, venues, menus, and order progress.</p></div><Link className="sb-button sb-secondary" to="/dashboard">Restaurant approvals</Link></header>
    <nav className="admin-tabs" aria-label="Administration sections" role="tablist">{(["accounts", "restaurants", "orders"] as Tab[]).map((item) => <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item[0].toUpperCase() + item.slice(1)}</button>)}<Link to="/owner" className="admin-tab-link">Manage menus ↗</Link></nav>
    {tab === "accounts" && <AccountsPanel />}{tab === "restaurants" && <RestaurantsPanel />}{tab === "orders" && <OrdersPanel />}
  </div>;
}

function AccountsPanel() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<AccountRole>("CUSTOMER");
  const [newVenueIds, setNewVenueIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [accountResult, venueResult] = await Promise.all([apiClient.get<Account[]>("admin/users"), apiClient.get<Venue[]>("restaurants/admin/all")]);
      setAccounts(accountResult.data); setVenues(venueResult.data);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load account access."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(reload); }, [reload]);
  const createAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      await apiClient.post("admin/users", { name: newName.trim(), email: newEmail.trim(), initialPassword: newPassword, role: newRole, ...(newRole === "RESTAURANT_OWNER" ? { restaurantIds: newVenueIds } : {}) });
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewVenueIds([]); await reload();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create this account."); }
    finally { setSaving(false); }
  };
  return <section className="admin-section"><div className="admin-section-title"><div><p className="sb-eyebrow">ACCESS</p><h2>Accounts</h2><p>Create customer and restaurant-owner accounts, then update name, access, or venue assignments.</p></div><button className="sb-button sb-secondary" type="button" onClick={() => void reload()}>Refresh</button></div>
    <form className="admin-create-form" onSubmit={createAccount}><h3>Create account</h3><div className="admin-form-grid"><label>Name<input required minLength={2} maxLength={100} value={newName} onChange={(event) => setNewName(event.target.value)} /></label><label>Email<input required type="email" maxLength={254} value={newEmail} onChange={(event) => setNewEmail(event.target.value)} /></label><label>Account role<select value={newRole} onChange={(event) => { const value = event.target.value as AccountRole; setNewRole(value); if (value === "CUSTOMER") setNewVenueIds([]); }}><option value="CUSTOMER">Customer</option><option value="RESTAURANT_OWNER">Restaurant owner</option></select></label><label>Initial password<input required type="password" minLength={8} maxLength={72} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><small>Set once during account creation. Passwords cannot be viewed or reset here.</small></label>{newRole === "RESTAURANT_OWNER" && <label className="admin-wide">Restaurant assignments<select multiple value={newVenueIds} onChange={(event) => setNewVenueIds(Array.from(event.currentTarget.selectedOptions, (option) => option.value))}>{venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name} · {venue.status}</option>)}</select><small>Use Ctrl or Command to select more than one venue.</small></label>}</div><button className="sb-button sb-primary" type="submit" disabled={saving}>{saving ? "Creating…" : "Create account"}</button></form>
    {error && <p className="sb-error" role="alert">{error}</p>}{loading ? <p className="sb-muted" role="status">Loading accounts…</p> : accounts.length === 0 ? <div className="sb-empty"><h3>No managed accounts found</h3><p>Create a customer or owner account above.</p></div> : <div className="admin-account-list">{accounts.map((account) => <AccountRow account={account} venues={venues} key={`${account.id}:${account.updatedAt}`} onSaved={reload} />)}</div>}
  </section>;
}

function AccountRow({ account, venues, onSaved }: { account: Account; venues: Venue[]; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(account.name);
  const [suspended, setSuspended] = useState(account.isSuspended);
  const [venueIds, setVenueIds] = useState(account.memberships.map((membership) => membership.restaurant.id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (name.trim().length < 2) { setError("Enter a name with at least two characters."); return; }
    setSaving(true); setError("");
    try {
      await apiClient.patch(`admin/users/${encodeURIComponent(account.id)}`, { expectedUpdatedAt: account.updatedAt, name: name.trim(), isSuspended: suspended, restaurantIds: account.role === "RESTAURANT_OWNER" ? venueIds : [] });
      await onSaved();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save account changes."); }
    finally { setSaving(false); }
  };
  return <article className="admin-account-row"><div className="admin-row-heading"><div><h3>{account.name}</h3><p>{account.email} · {account.role === "CUSTOMER" ? "Customer" : "Restaurant owner"}</p></div><span className={suspended ? "admin-state suspended" : "admin-state"}>{suspended ? "Suspended" : "Active"}</span></div><div className="admin-form-grid"><label>Display name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} /></label>{account.role === "RESTAURANT_OWNER" && <label>Assigned restaurants<select multiple value={venueIds} onChange={(event) => setVenueIds(Array.from(event.currentTarget.selectedOptions, (option) => option.value))}>{venues.map((venue) => <option value={venue.id} key={venue.id}>{venue.name} · {venue.status}</option>)}</select></label>}<label className="admin-checkbox"><input type="checkbox" checked={suspended} onChange={(event) => setSuspended(event.target.checked)} /> Suspend this account</label></div>{error && <p className="sb-error" role="alert">{error}</p>}<div className="admin-row-actions"><button className="sb-button sb-primary" type="button" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save account"}</button><small>Revision updated {new Date(account.updatedAt).toLocaleString()}</small></div></article>;
}

function RestaurantsPanel() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try { setVenues((await apiClient.get<Venue[]>("restaurants/admin/all")).data); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load restaurants."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(reload); }, [reload]);
  return <section className="admin-section"><div className="admin-section-title"><div><p className="sb-eyebrow">VENUE SETTINGS</p><h2>Restaurants</h2><p>Update the live catalog rules. Restaurant identity, contact, and images remain unchanged unless edited here.</p></div><button className="sb-button sb-secondary" type="button" onClick={() => void reload()}>Refresh</button></div><p><Link className="sb-text-link" to="/dashboard">Review pending restaurant approvals →</Link></p>{error && <p className="sb-error" role="alert">{error}</p>}{loading ? <p className="sb-muted" role="status">Loading restaurants…</p> : <div className="admin-venue-list">{venues.map((venue) => <VenueRow venue={venue} onSaved={reload} key={`${venue.id}:${venue.updatedAt}`} />)}</div>}</section>;
}

function VenueRow({ venue, onSaved }: { venue: Venue; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(venue.name);
  const [description, setDescription] = useState(venue.description ?? "");
  const [address, setAddress] = useState(venue.address ?? "");
  const [cuisine, setCuisine] = useState(venue.cuisine);
  const [isOpen, setIsOpen] = useState(venue.isOpen);
  const [fee, setFee] = useState(venue.deliveryFee);
  const [minimum, setMinimum] = useState(venue.minimumSubtotal);
  const [areas, setAreas] = useState(venue.deliveryAreas.join("\n"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError("");
    const deliveryFee = Number(fee); const minimumSubtotal = Number(minimum);
    if (!Number.isFinite(deliveryFee) || deliveryFee < 0 || !Number.isFinite(minimumSubtotal) || minimumSubtotal < 0) { setError("Enter non-negative delivery fee and minimum values."); setSaving(false); return; }
    try {
      await apiClient.patch(`restaurants/${encodeURIComponent(venue.id)}`, { expectedUpdatedAt: venue.updatedAt, name: name.trim(), description, address, cuisine: cuisine.trim(), isOpen, deliveryFee, minimumSubtotal, deliveryAreas: areas.split(/\r?\n/).map((area) => area.trim()).filter(Boolean) });
      await onSaved();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save restaurant settings."); if (typeof reason === "object" && reason !== null && "response" in reason && (reason as { response?: { status?: number } }).response?.status === 409) await onSaved(); }
    finally { setSaving(false); }
  };
  const approve = async () => { setSaving(true); setError(""); try { await apiClient.patch(`restaurants/admin/${encodeURIComponent(venue.id)}/approve`); await onSaved(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not approve this restaurant."); } finally { setSaving(false); } };
  return <article className="admin-venue-row"><div className="admin-row-heading"><div><p className="sb-eyebrow">{venue.cuisine || "RESTAURANT"}</p><h3>{venue.name}</h3><p>{venue.address || "No address supplied"}</p></div><span className={`admin-state ${venue.status === "ACTIVE" ? "" : "suspended"}`}>{venue.status}{venue.isOpen ? " · Open" : " · Closed"}</span></div><form onSubmit={update}><div className="admin-form-grid"><label>Name<input required value={name} maxLength={100} onChange={(event) => setName(event.target.value)} /></label><label>Cuisine<input required value={cuisine} maxLength={100} onChange={(event) => setCuisine(event.target.value)} /></label><label className="admin-wide">Description<textarea value={description} maxLength={2000} rows={2} onChange={(event) => setDescription(event.target.value)} /></label><label>Address<input value={address} maxLength={200} onChange={(event) => setAddress(event.target.value)} /></label><label>Delivery fee ($)<input type="number" min="0" step="0.01" value={fee} onChange={(event) => setFee(event.target.value)} /></label><label>Food minimum ($)<input type="number" min="0" step="0.01" value={minimum} onChange={(event) => setMinimum(event.target.value)} /></label><label>Served areas <small>One area per line; leave blank for unrestricted.</small><textarea value={areas} rows={3} onChange={(event) => setAreas(event.target.value)} /></label><label className="admin-checkbox"><input type="checkbox" checked={isOpen} onChange={(event) => setIsOpen(event.target.checked)} /> Accepting orders now</label></div>{error && <p className="sb-error" role="alert">{error}</p>}<div className="admin-row-actions"><button className="sb-button sb-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save venue settings"}</button>{venue.status === "PENDING" && <button className="sb-button sb-secondary" type="button" onClick={() => void approve()} disabled={saving}>Approve restaurant</button>}<Link className="sb-button sb-secondary" to="/owner" state={{ restaurantId: venue.id }}>Manage menu</Link></div></form></article>;
}

const NEXT_STATUS: Record<string, string> = { PENDING: "CONFIRMED", CONFIRMED: "PREPARING", PREPARING: "READY", READY: "OUT_FOR_DELIVERY", OUT_FOR_DELIVERY: "DELIVERED" };
function OrdersPanel() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try { setOrders((await apiClient.get<AdminOrder[]>("orders/admin/all")).data); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load orders."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(reload); }, [reload]);
  const advance = async (order: AdminOrder) => {
    const next = NEXT_STATUS[order.status]; if (!next) return;
    setSaving(order.id); setError("");
    try { await apiClient.patch(`orders/admin/${encodeURIComponent(order.id)}/status`, { status: next }); await reload(); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Could not update this order."; await reload(); setError(message); }
    finally { setSaving(""); }
  };
  return <section className="admin-section"><div className="admin-section-title"><div><p className="sb-eyebrow">ORDER OPERATIONS</p><h2>Orders</h2><p>View every saved customer order and advance only to its next allowed delivery status.</p></div><button className="sb-button sb-secondary" type="button" onClick={() => void reload()}>Refresh</button></div>{error && <p className="sb-error" role="alert">{error}</p>}{loading ? <p className="sb-muted" role="status">Loading orders…</p> : orders.length === 0 ? <div className="sb-empty"><h3>No saved orders</h3><p>Completed checkouts will appear here.</p></div> : <div className="admin-order-list">{orders.map((order) => <article className="admin-order-row" key={order.id}><div><p className="sb-eyebrow">{new Date(order.createdAt).toLocaleString()}</p><h3>{order.restaurantName || order.restaurant.name}</h3><p>{order.user.name} · {order.user.email}</p><p className="admin-order-id">Order {order.id}</p></div><div className="admin-order-summary"><span className="admin-state">{order.status.replaceAll("_", " ")}</span><strong>{formatMinor(amountToMinor(order.total))}</strong><div className="admin-row-actions"><Link className="sb-text-link" to={`/orders/${encodeURIComponent(order.id)}`}>Order details</Link>{order.checkoutBatchId && <Link className="sb-text-link" to={`/orders/checkouts/${encodeURIComponent(order.checkoutBatchId)}`}>Grouped receipt</Link>}{NEXT_STATUS[order.status] && <button className="sb-button sb-primary" type="button" disabled={saving === order.id} onClick={() => void advance(order)}>{saving === order.id ? "Updating…" : `Advance to ${NEXT_STATUS[order.status].replaceAll("_", " ")}`}</button>}</div></div></article>)}</div>}</section>;
}
