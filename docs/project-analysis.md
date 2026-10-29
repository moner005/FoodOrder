# Scaffold implementation status — 29 October 2026

This repository currently contains a structural foundation only: a runnable React client scaffold and an Express health endpoint. The planned backlog (30 frontend tasks and 11 later backend tasks) remains open; feature routes are labeled as not implemented. The cart is only an empty, typed in-memory list of meal ID, quantity and note. Cart persistence and rules remain backlog. No restaurant/menu data, authentication, checkout submission, orders, simulated delivery status, fake API, or database behavior is implemented. The runnable baseline is Vite on port 5173 and the Express API on port 5001. The proposed json-server/db.json API on port 5000 is pending.

Local validation (29 October 2026): client clean install, lint, typecheck and production build passed; server clean install, typecheck/build and all three HTTP tests passed. A production-preview check in Edge passed Home/navigation, direct meal/order routes and reloads, not-found handling, favicon loading and mobile layout with zero console/page errors. These are scaffold checks; commerce workflows and production deployment are not verified.

---

# FoodOrder — five-person project plan

Planning baseline: 27 October 2026. This is a proposed specification and assignable backlog, not a record of completed implementation.

Team: five members, all trained in frontend development. Names, available hours, deadline, and backend technology are not yet specified. React frontend comes first; a real backend comes later.

Repository: https://github.com/moner005/FoodOrder

GitHub reported `Git Repository is empty.` when checked on the planning date. This is historical inspection evidence, not a fresh status check.

Confirmed scope: one restaurant with menu, cart, checkout and delivery status.

## 1. Scope and user journeys

Customer journey: see restaurant information → browse/search menu → view a dish → choose quantity/add a note → cart → delivery address → submit a demo order → view a simulated delivery timeline.

Required first release:

- Restaurant home page with name, address, contact information, and opening hours.
- Menu categories, search, dish details, prices, availability, and dietary/allergen information supplied in the fixture data.
- Cart, delivery fee, minimum food subtotal, checkout, confirmation, order history/details, and delivery-status display.
- One fixed delivery zone represented by an explicit list of supported areas. No map is required.
- Clear availability/closed-restaurant behavior and responsive/loading/empty/error states.

Scope assumptions for this plan: delivery only, cash-on-delivery or demo payment, no size/add-on pricing, no customer login. Notes do not change prices or guarantee allergy handling. Add pickup, paid options, or accounts only as separate tasks if the course requires them.

Later options: pickup, priced modifiers, scheduled delivery, restaurant administration, accounts, payment integration, driver tracking, and notifications.

## 2. Team ownership

Each person owns their React components, feature behavior, data connections, and verification. Rebalance at milestones using actual effort rather than task count.

Peer review cycle: 1 reviews 2; 2 reviews 3; 3 reviews 4; 4 reviews 5; 5 reviews 1. Choose another reviewer if the assigned reviewer substantially contributed to the change.

| Member | Responsibility | Frontend task IDs |
|---|---|---|
| Member 1 | Menu, dish details and menu data | F07–F12 |
| Member 2 | Cart, quantities, totals and persistence | F13–F18 |
| Member 3 | Checkout form, delivery validation and submission | F19–F24 |
| Member 4 | Order service, history/details and demo delivery status | F25–F30 |
| Member 5 | Setup, shared layout, restaurant home/settings and integration | F01–F06 |

These assignments rotate feature responsibilities to give members practice in different React boundaries. Member 5 coordinates app/router/shared-style edits; Member 4 coordinates the order-service contract with Member 3.

## 3. Session 7 architecture and project structure

Architecture revised: 29 October 2026, using [Session 7 — Final Project](https://github.com/ZakariaZhlat125/Bytes4Future-Tutorial-/blob/BootCamp/Session-7.md), especially its state-management, API-layer, folder-structure and implementation-pattern sections.

Use React + TypeScript + Vite + React Router + Zustand + TanStack React Query + Axios + Tailwind CSS, with react-hot-toast for notifications. Use `.tsx` for React components and `.ts` for services, stores, hooks without JSX, types and helpers. Configure `@/` to resolve to `src/` in both TypeScript and Vite.

The course supplies the architecture; this plan adapts its domain names and preserves the agreed project scope. Keep the team's page folders (`pages/Meals/index.tsx`, for example) and top-level `constants/` preference. The tutorial's `utils/constants.ts` becomes `constants/`; do not maintain duplicate constants in both places. There is one independent application per repository.

### Repository layout

```text
client/   # React + TypeScript + Vite application
server/   # Node + Express + TypeScript API
docs/     # preserved plan and current API contract
AGENTS.md README.md .gitignore
```

### Project source layout

The tree is the planned feature layout. The repository currently contains structural folders and entry points; feature behavior remains assigned backlog. Files marked **later** belong to the backend/auth phase; **optional** files need an actual caller or assigned task. Grouped filenames under a folder represent planned contents.

```text
client/src/
├── components/
│   ├── common/          # Button, Input, Select, Modal, EmptyState, LoadingSpinner
│   ├── layout/          # Header, Footer; Sidebar only when needed
│   ├── auth/            # LoginForm, ProtectedRoute [later]
│   ├── meals/           # MealCard, MealFilters, MealCardSkeleton, CategoryCard
│   ├── cart/            # CartItem, CartSummary, CartBadge
│   ├── checkout/        # CustomerForm, DeliveryAddressForm, CheckoutSummary
│   ├── orders/          # OrderCard, OrderStatusBadge, OrderTimeline
│   ├── restaurant/      # RestaurantInfo, OpeningHours, ClosedBanner
│   └── profile/         # ProfileForm [later, if assigned]
├── pages/
│   ├── Home/index.tsx
│   ├── Meals/           # index.tsx, MealDetails.tsx; UI label can be Menu
│   ├── Cart/index.tsx
│   ├── Checkout/        # index.tsx, Confirmation.tsx
│   ├── Orders/          # index.tsx, OrderDetails.tsx
│   ├── Login.tsx        # later
│   ├── Register.tsx     # later, if assigned
│   ├── Profile/index.tsx # later, if assigned
│   └── NotFound.tsx
├── layouts/             # MainLayout.tsx; AuthLayout/AdminLayout when needed
├── routes/              # index.tsx; protectedRoutes.tsx later
├── services/
│   ├── apiClient.ts     # the only Axios instance
│   ├── queryClient.ts   # React Query configuration and shared query keys
│   └── api/
│       ├── meals.ts     # meal/category reads
│       ├── restaurant.ts
│       ├── orders.ts   # order create/list/details/status operations
│       ├── auth.ts     # later
│       └── user.ts     # later, if assigned
├── stores/
│   ├── cartStore.ts     # persisted local cart, keyed by meal + normalized note
│   ├── authStore.ts     # later
│   └── uiStore.ts       # optional: genuinely shared menu/modal state
├── hooks/               # useMeals.ts, useOrders.ts, useRestaurant.ts, useDebounce.ts
│                        # useCart.ts only for useful derived rules; useAuth.ts later
├── types/               # meal.ts, restaurant.ts, order.ts, cart.ts, api.ts;
│                        # user.ts later
├── utils/               # money.ts, totals.ts, validation.ts, storage.ts
├── constants/           # routes.ts, endpoints.ts, orderStatus.ts
├── App.tsx
├── main.tsx
└── index.css
```

### What belongs in each boundary

| Boundary | Responsibility |
|---|---|
| `pages/` | Route-level composition: obtain data via hooks, handle UI states, compose domain components |
| `components/common/` | Domain-independent controls and loading/empty/error feedback |
| Domain component folders | Reusable meal/cart/checkout/order/restaurant views; page-private fragments may stay beside their page |
| `components/layout/` | Header/sidebar/footer building blocks |
| `layouts/` | Complete route shells using those building blocks and nested route outlets |
| `routes/` | Central `createBrowserRouter` configuration, not-found route and later access wrappers |
| `services/apiClient.ts` | One Axios client, environment URL and later auth interceptors |
| `services/queryClient.ts` | One QueryClient plus centrally agreed query-key factories |
| `services/api/` | Typed async domain service objects, transport mapping and the agreed mutation boundary |
| `stores/` | Zustand client state and client-only persistence |
| `hooks/` | Reusable query/mutation behavior, debouncing and derived client rules |
| `types/` | Shared entity, filter, request, response and error interfaces |
| `utils/` | Pure calculations/validation; `storage.ts` is the explicit browser persistence adapter |
| `constants/` | Reused route/endpoint/status/location identifiers, without runtime state |

Dependency direction: pages/layouts → components/hooks → domain services → apiClient; stores, types, constants and utilities support their consumers. Services must not import React components, React hooks, Zustand stores or QueryClient. Query/mutation hooks handle cache effects; services validate/save/return results. There are no direct Axios/fetch calls or hardcoded API URLs inside components. Avoid a general `useFetch` layer that duplicates React Query.

`main.tsx` mounts React. `App.tsx` mounts `QueryClientProvider`, `RouterProvider` and the toast container. Zustand needs no Context cart provider. Keep React Query cached records out of Zustand to avoid competing authorities.

### State ownership

| Data | Owner | Persistence/cache |
|---|---|---|
| Fetched meals, categories, restaurant settings and orders | React Query | Query cache; a future fake API may supply it, with a real backend later |
| Cart and client-only selections | Zustand | Validated, namespaced browser persistence |
| Form inputs, quantity picker, component-local dialog | `useState` | Local; no global store unless multiple components need it |
| Search/category/sort/page | URL query params and page state | Query keys include the normalized filters |
| Simple optional theme/language | Context or a small existing mechanism | Introduce only if assigned |
| Account session | Zustand `authStore` [later] | Real session behavior is defined with backend auth |

Use selectors when reading Zustand (for example, the header reads only the item count). Cart totals are derived with shared pure functions, not maintained as an independent mutable total. Query hooks handle loading/error/empty states and request cancellation; meal/restaurant IDs and normalized filters belong in the corresponding query keys. After an accepted mutation, update/invalidate relevant query caches before treating cached views as current. Disable submit while pending. Query reads may use the course's bounded retry setting; mutation automatic retries stay disabled until a safe retry contract is defined.

### Auth and scope adaptation

Session 7 also teaches demo login, registration and profile. This structural revision reserves their files but keeps the previously agreed account features in the later auth phase; it does not silently add mandatory frontend tasks. If the instructor requires the fake-auth milestone now, assign those tasks explicitly before wiring route guards. Once auth exists, checkout/orders/profile use protected routes. Frontend guards improve navigation; backend authorization remains mandatory.

Retain the project's agreed currency, delivery rules and statuses. The tutorial's example tax, phone length and token-storage snippets are not additional business requirements. Clear only this application's session keys and account-scoped query caches on logout; never clear all browser storage. No real card processing is part of the demo.

### Root configuration and fake API

The runnable repository baseline uses `client/` and `server/`, with root `docs/`, `.gitignore`, `README.md`, and `AGENTS.md`. Vite and TypeScript both resolve `@/` to the client `src/`. The Express scaffold health service runs on port 5001, separate from the still-proposed future fake API. No `db.json`, `json-server`, or `dev:api` script is included; assign and validate that data/API contract before adding it. Each app has its own `.env.example`; runtime `.env` files stay local.

If a fake API is assigned, normalize its plain arrays and total-count header into one typed `PaginatedResponse<T>` inside the service layer. In that future integration, pages should consume the agreed result shape; map filters to the fake API's `_page`, `_limit`, `q` and domain-category parameters there, then map any real backend response in the same boundary later. Do not mix the tutorial's array examples with `.data` pagination access in the same page.

### FoodOrder service and cache map

| Operation | Hook/cache identity | Service boundary |
|---|---|---|
| Meals/categories | `useMeals`; meals + normalized filters, categories | `api/meals.ts` reads `/meals` and `/categories` |
| Meal details | Meal + ID | `api/meals.ts` reads `/meals/:id` |
| Restaurant/settings | `useRestaurant`; restaurant | `api/restaurant.ts` reads the one restaurant record |
| Orders/details | `useOrders`; orders or order + ID | `api/orders.ts` reads `/orders` and `/orders/:id` |
| Checkout | Order mutation; invalidate orders and seed returned detail | `api/orders.ts` validates the controlled demo and saves the order |
| Demo status | Status mutation; invalidate relevant history/detail keys | `api/orders.ts` patches only permitted transitions |

Use `Meal`, `types/meal.ts`, `components/meals/`, `pages/Meals/`, `useMeals` and `/meals` consistently in code. “Menu” and “dish” remain normal UI wording. The service maps any snake_case fake-API fields into the agreed app type; do not maintain separate Meal and MenuItem models for the same entity. Keep integer `priceMinor` for agreed money arithmetic, mapping any decimal teaching data in the service.

Member 2 owns `stores/cartStore.ts`, with a namespaced key such as `food-order-cart`. A line is keyed by meal ID plus normalized note. `hooks/useCart.ts` is optional when it supplies derived behavior, not a copy of Zustand's actions. Only the local cart is persisted in browser storage; fetched restaurant/meals/orders remain React Query data backed by the API.

Future fake API design: `db.json` may contain `restaurant`, `categories`, `meals` and `orders`. If implemented, `api/orders.ts` can create via `POST /orders`, read saved orders and patch demo status. It should serialize submission in the one active demo instance and reconcile an unresolved request ID with a fresh read before any repeat POST. Same request ID with a different payload is rejected. A preflight lookup is not server uniqueness: parallel clients/retries are guaranteed only after FB05/FB09. Do not automatically retry an ambiguous POST or declare rollback from a network error. Preserve cart/form/request ID while the result is unresolved. If added later, the fake API is local teaching infrastructure, not a public order service.

### File ownership

| Member | Primary files/directories | Shared-edit agreement |
|---|---|---|
| Member 1 | `pages/Meals/`, `components/meals/`, `hooks/useMeals.ts`, `services/api/meals.ts`, `types/meal.ts` | Supplies meal/category entries during a scheduled `db.json` handoff |
| Member 2 | `pages/Cart/`, `components/cart/`, `stores/cartStore.ts`, optional derived `hooks/useCart.ts`, cart types and money/totals/storage helpers | Checkout/order service reuse agreed pure calculations |
| Member 3 | `pages/Checkout/`, `components/checkout/`, checkout mutation/form hook and validation helpers | Calls the order service; coordinates cache keys with Member 4 |
| Member 4 | `pages/Orders/`, `components/orders/`, `hooks/useOrders.ts`, `services/api/orders.ts`, order types and status constants | Owns order/status persistence and demo request reconciliation |
| Member 5 | `App.tsx`, `main.tsx`, `pages/Home/`, `components/common/`, `components/layout/`, `components/restaurant/`, `layouts/`, `routes/`, `services/apiClient.ts`, `services/queryClient.ts`, `services/api/restaurant.ts`, `hooks/useRestaurant.ts`, restaurant types and route constants | Coordinates setup, root config, shared UI and restaurant settings |

When the fake API is assigned, Member 5 coordinates restaurant entries, Member 1 adds meals/categories, and Member 4 initializes empty orders in scheduled exclusive turns. Share query-key contracts before integration. Auth/profile/UI-store files remain uncreated until assigned.

## 4. Data and business rules

| Entity | Minimum agreed fields |
|---|---|
| Restaurant | id, name, address, contact, openingHours, isOpen, deliveryFeeMinor, minimumSubtotalMinor, supportedAreas |
| Meal | id, name, description, categoryId, priceMinor, imageUrl, available, dietaryLabels, allergens |
| Cart line | mealId, quantity, note |
| Order | id, requestId, item snapshots, totals, customer, address, notes, status, createdAt |

FoodOrder invariants:

1. Only available dishes can be added or submitted. Revalidate availability at checkout.
2. Merge the same dish with the same normalized note; different notes remain different lines. Editing a note must keep line identity/totals correct.
3. The minimum applies to food subtotal before the delivery fee. Show this rule in the UI.
4. Add the configured delivery fee exactly once. Empty carts cannot submit an order.
5. Use one explicit supported-area list; reject an unsupported area at checkout. Address text alone is not proof of delivery coverage.
6. For the demo, restaurant openness is explicit fixture/service state; display opening hours as information. Do not silently infer a reliable ordering schedule from the user's device clock.
7. A closed restaurant cannot accept an order. An order saved before closing remains viewable.
8. Status sequence: placed → confirmed → preparing → out for delivery → delivered. Do not add cancellation/refunds to the required scope.
9. A labeled simulation control advances demo status and persists it. Refresh must not restart it or invent real driver movement.
10. Disable repeated submit while pending and reuse a submission request ID on a retry of the same attempt. A changed cart starts a new attempt. Guard repeats within the controlled single-instance demo; true concurrent request-ID uniqueness belongs to the backend. An ambiguous save remains unresolved until API reconciliation.

Future backend authority: menu prices, fees, delivery rules, actual order creation, and actual status belong on the server. The client sends IDs/quantities and customer choices; the server calculates accepted totals. Demo IDs/history/browser state do not prove a real order or delivery.

## 5. Task sizing and usage

Each table row is intended to become one GitHub issue and usually one small PR. Tasks are scoped for roughly a focused half-day where practical, but this is not a schedule estimate. Split a row if the assignee cannot explain a single observable outcome or finish it in a reasonable working session. Combine a tiny pair only if ownership and review remain clear.

All task statuses start **Not started**. Dependencies name tasks that must be merged before dependent behavior can be accepted. Developers may build isolated UI against an agreed mock contract earlier.

Every UI task includes responsive styling, accessible labels/focus, and its relevant loading/error/empty state. Every rule task includes a meaningful check of both success and failure. A visually finished page without connected behavior does not complete the issue.

## 6. Frontend tasks

### Member 5 — foundation and restaurant home

| ID | Small task | Depends on | Done when |
|---|---|---|---|
| F01 | Initialize course stack, @/ alias, apiClient/queryClient, fake API script, interfaces and ownership | — | Team can run/build and agrees menu/cart/order shapes and scope |
| F02 | Build common/layout components, centralized routes, MainLayout and not-found page | F01 | All planned routes work with consistent responsive navigation |
| F03 | Create restaurant db.json entry, types and services/api/restaurant.ts | F01 | Open/closed, delivery fee, minimum, hours, and supported areas have one source |
| F04 | Build restaurant home/contact/hours in pages/Home/index.tsx | F02,F03 | Menu CTA works and restaurant information displays correctly on mobile/desktop |
| F05 | Show cart count and closed-restaurant banner in layout | F02,F03,F14 | Count follows quantities; closed state is clear and consistent across pages |
| F06 | Integrate app and complete setup/static-host routing documentation | All other F tasks | Full order journey, restaurant home/banner, and refresh/deep links pass; limitations are documented |

### Member 1 — menu and dishes

| ID | Small task | Depends on | Done when |
|---|---|---|---|
| F07 | Create meal/category db.json entries, types/meal.ts and services/api/meals.ts | F01 | Stable IDs, prices, images, availability, and supplied food labels are available |
| F08 | Build components/meals/MealCard and React Query meals grid | F02,F07 | Correct dish information and unavailable state display |
| F09 | Add category filtering, search, and no-results recovery | F08 | Combined filters work and clear/reset restores the menu |
| F10 | Build pages/Meals/MealDetails.tsx route | F07,F02 | Direct dish link works; missing/unavailable item is handled |
| F11 | Add quantity/note input and connect add-to-cart | F10,F14 | Valid selection adds correct dish/note; unavailable dish cannot be added |
| F12 | Verify menu/cart integration and data states | F09,F11 | Slow/failing/empty data, bad dish link, note behavior, and availability have been checked |

### Member 2 — food cart

| ID | Small task | Depends on | Done when |
|---|---|---|---|
| F13 | Define typed meal/note cart identity and Zustand stores/cartStore.ts actions | F01 | Same dish/same note merges; distinct notes stay separate |
| F14 | Add validated Zustand cart persistence and restore behavior | F13 | Menu/layout/checkout share state; valid lines survive reload; malformed data is handled |
| F15 | Build pages/Cart and components/cart quantity/remove/note controls | F02,F14 | Edits update intended line; empty cart has menu recovery link |
| F16 | Implement pure utils/money.ts and utils/totals.ts for subtotal/fee/minimum calculations | F03,F15 | Fee applies once and minimum uses food subtotal; shared calculations feed checkout |
| F17 | Show unavailable-item and closed-restaurant cart feedback | F03,F07,F15 | Stale cart/closed state cannot appear ready to submit without a useful warning |
| F18 | Verify merge, note editing, totals, and persistence | F16,F17 | Same/different notes, last-line removal, invalid quantity, refresh, and minimum boundaries are checked |

### Member 3 — food checkout

| ID | Small task | Depends on | Done when |
|---|---|---|---|
| F19 | Build customer, phone, address and notes form in pages/Checkout | F02,F15 | Required/invalid input shows clear messages without losing entered fields |
| F20 | Add supported-area and order-eligibility validation | F03,F07,F16,F19 | Empty cart, below minimum, unsupported area, unavailable dish, and closed restaurant are rejected |
| F21 | Connect checkout summary and demo payment explanation | F16,F19 | Lines, notes, fee, total, and delivery choice match cart; no card data collected |
| F22 | Connect React Query create-order mutation and request-ID reconciliation | F20,F21,F25 | One attempt is in flight; retry uses same ID; errors preserve cart/form |
| F23 | Build confirmation using saved returned order | F22 | Confirmed ID/total/address are from saved result and cart clears only after success |
| F24 | Verify checkout edge cases | F22,F23 | Eligibility failure, repeated click, confirmed rejection, ambiguous save/reconciliation, and success are checked |

### Member 4 — food orders and delivery status

| ID | Small task | Depends on | Done when |
|---|---|---|---|
| F25 | Implement services/api/orders.ts fake API save/read and attempt reconciliation | F01,F03,F07,F16 | Revalidates demo rules, saves a snapshot, guards single-instance repeats and reconciles an ambiguous POST by request ID |
| F26 | Build pages/Orders/index.tsx history list | F02,F25 | New/saved orders show correctly; empty/error states work |
| F27 | Build pages/Orders/OrderDetails.tsx with items/address/totals | F26 | Direct saved-order link works; missing ID handled; saved prices remain stable |
| F28 | Build delivery-status timeline | F27 | Correct current/completed/pending steps display for each permitted status |
| F29 | Add explicitly labeled demo status advancement and persistence | F25,F28 | Only next valid status is allowed; refresh preserves status; delivered cannot advance |
| F30 | Verify order lifecycle and history | F23,F26,F29 | Controlled duplicate attempt, ambiguous save/reconciliation, cache refresh, reload, bad ID and all status transitions are checked |

Recommended FoodOrder routes: `/`, `/meals`, `/meals/:id`, `/cart`, `/checkout`, `/orders`, `/orders/:id`. Put the tracking timeline inside order details. Use a small service-controlled fixture switch to demonstrate closed/unavailable cases; a full admin menu editor is optional.

## 7. Milestones and integration

| Milestone | Work | Exit evidence |
|---|---|---|
| Food A: agreements/data | F01–F03,F07,F13 | Restaurant/menu/cart/order contracts agreed; app and routes start |
| Food B: smallest order | F08,F10,F11,F14–F16,F19–F23,F25 | One dish → cart → valid delivery checkout → saved confirmation |
| Food C: complete scope | Remaining F tasks | Menu search, restaurant info, history, simulated status, failure cases and integration pass |

These are dependency milestones, not calendar weeks. At each milestone, take one ready issue per person. Blocked members can build isolated UI against agreed fixtures, review a PR, or run a specified integration scenario. Do not edit another member's unfinished module without a handoff. F06 waits for all other required F tasks. Restaurant home and closed-state banner are part of completion.

## 8. Backend tasks — later phase

These tasks belong to the later backend phase. All five members will need backend learning/pairing. Choose the course-required stack before estimating. Preserve service contracts where practical and record deliberate changes. Define endpoint paths and schemas before implementing adapters.

| ID | Future task | Primary owner | Done when |
|---|---|---|---|
| FB01 | Choose stack; initialize server, error/validation convention, migrations and seeds | 1 | Fresh server/database setup is reproducible |
| FB02 | Create restaurant, menu, customer and order schema | 2, reviewed by 3/4/5 | Stable relations and constraints preserve agreed data rules |
| FB03 | Implement authentication/authorization with Login.tsx, AuthLayout, ProtectedRoute, useAuth and services/api/auth.ts | 1 | Customers read only their own orders; only staff can change operational data/status; guest access needs an explicit design |
| FB04 | Implement restaurant and menu read endpoints | 2 | Menu search/category/details and restaurant settings follow agreed contracts |
| FB05 | Implement order submission and delivery-rule validation | 4, pairing 3 | Server checks menu availability/open state/area/minimum, calculates fees/prices, and deduplicates attempts |
| FB06 | Implement staff status updates | 5 | Authorized staff can apply only permitted transitions; invalid/repeated transitions are handled consistently |
| FB07 | Point apiClient to real backend and adapt services/api response/mutation contracts | 1 coordinates; each feature owner | Menu, cart, checkout and history handle real server results/errors |
| FB08 | Implement authoritative history/details and identity migration | 4, pairing 1 | History is scoped to user; demo orders are labeled/cleared rather than uploaded as real orders |
| FB09 | Verify duplicate/concurrent requests, rollback and tampering | 3 leads, all contribute | Retry after a lost response creates one order; altered fees/prices and unauthorized access are rejected |
| FB10 | Prepare backend/frontend release configuration | 1, reviewed by 5 | Migrations, secrets, allowed origins, routing and service URLs are documented/configured |
| FB11 | Verify deployed restaurant-to-delivery journey | All five | Deployed API/database evidence proves menu → accepted order → staff status update → customer timeline |

Suggested learning ownership: Member 1 server/auth/integration; Member 2 menu data; Member 3 delivery/fee rules; Member 4 orders; Member 5 restaurant/status management. Pair Members 1+4 on identity/order access. Real payments, live maps, notifications and driver dispatch remain optional separate scopes. A timeout does not prove rejection: retry/reconcile using the original request ID.

## 9. GitHub workflow and issue template

Keep the issue list in the FoodOrder repository. Board columns: Backlog → Ready → In progress → Review → Done. Useful labels: `foundation`, `menu`, `cart`, `checkout`, `orders`, `bug`, `frontend`, `backend-later`.

- Keep `main` runnable. Use feature branches such as `feat/F09-menu-search`.
- One active implementation issue per person. Each issue has one accountable owner.
- Open small PRs linked to task IDs; include screenshots for UI and actual verification results.
- One peer approves before merge. The setup owner coordinates app entry, routes/layouts/shared-component/package edits and integration; other feature owners request those edits or get a scheduled handoff.
- Pull the latest main before starting and before final integration checks. Never overwrite a teammate's work to resolve a conflict.
- Assign ownership to shared files explicitly. In particular, coordinate edits to the FoodOrder service/checkout contracts.

Copy this into each issue:

```markdown
Task ID and title:
Owner:
Outcome (one observable result):
Dependencies:
Allowed files/module (use the file-ownership table):
Inputs/outputs and shared contracts:
Acceptance checklist:
- Success behavior
- Relevant empty/loading/error/invalid behavior
- Relevant rule/invariant
Verification performed:
Screenshots/demo notes:
Out of scope:
```

Use this document's rows as issue descriptions, then add the exact files once the app is initialized. No GitHub issues, branches, or commits were created by preparing this plan.

## 10. Completion checks

Each feature owner supplies the relevant behavior checks. Automate calculations, Zustand cart actions, meal availability rules and duplicate order submission cases where practical; do not spend time writing tests that only assert static markup. Use a browser smoke pass for the connected journeys and responsive/keyboard behavior.

Frontend release candidate:

- The `@/` alias resolves in both TypeScript and Vite; typecheck and production build accept the same imports.
- Shared props, services and query results use strict TypeScript interfaces without `any`; route lazy loading uses a visible Suspense fallback when introduced.
- Server records are read through React Query hooks and typed `services/api/` modules; client-only state has one Zustand owner. No duplicate cart provider or fetched-data store exists.
- Query keys contain relevant filters and meal/order IDs; order/status mutations refresh affected cached views.
- A fake API write timeout remains unresolved until reconciled; no success toast, cart clear or blind mutation retry follows an unconfirmed outcome.
- README documents actual client/server scripts, the health endpoint, port selection, `.env.example`, current scaffold limits and later auth entries. If json-server/db.json is added later, document its limitations separately.

- Install, lint, any configured tests/typecheck, and production build pass using the scripts actually defined in that repository.
- All required task acceptance conditions pass; record the commands and outcomes in the PR/project notes.
- Loading, error/retry, empty, unknown-route, bad-ID, refresh, and storage-failure cases are covered at their relevant boundaries.
- Food minimum/fee/delivery-area/open-state and simulated status behavior agree across menu/cart/checkout/orders.
- Mobile and desktop layouts are usable; controls have labels, keyboard focus, and readable feedback.
- Demo checkout/status behavior is accurately labeled. Do not collect payment card details.
- README states how to run, how to exercise demo failure/status cases, what is implemented, and what waits for backend.
- Deployment configuration supports direct route visits/refresh. Local build evidence and deployed verification are recorded separately.

Next ready work: agree restaurant branding, currency, delivery fee/minimum and supported areas; assign real names to Members 1–5; start F01. Backend implementation is not required before the React learning phase.
