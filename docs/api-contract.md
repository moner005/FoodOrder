# FoodOrder API

The NestJS API uses the `/api` prefix. `GET /api/health` returns HTTP 200
with a `status` of `ok`. The local Swagger UI is at `/api/docs`.
Protected routes accept a JWT from `POST /api/auth/login` as
`Authorization: Bearer <token>`.

## Catalog

`GET /api/restaurants` lists approved restaurants. Restaurant records include
`isOpen`, `cuisine`, `deliveryFee`, `minimumSubtotal`, and `deliveryAreas`.
Approval and ordering availability are independent. An empty delivery-area
list preserves unrestricted delivery for legacy restaurants. Fees and minimums
are USD decimal amounts. Administrators update operational settings through
`PATCH /api/restaurants/:id`. The existing approval workflow remains under
`/api/restaurants/admin`.

## Checkout and orders

`POST /api/orders/checkout` accepts an address, optional notes, and meal IDs
and quantities. Supply `deliveryArea` for carts with area restrictions.
The integrated client sends a UUID `requestId`, `expectedCustomerId`,
`expectedTotalMinor`, and an `expectedUnitPriceMinor` per item. The quote
values are integer cents. The API rejects a checkout when the expected
customer differs from the authenticated account.

The transaction checks the current menu, restaurant status, minimums, fees,
and shared area. The response preserves `ordersCreated` and `orders` and
includes `checkoutId`, `requestId`, `deliveryArea`, `subtotal`, `deliveryFee`,
and `total`. Repeating the same request with the same customer and payload
returns the saved checkout. Reusing the ID with different checkout details
returns HTTP 409. The legacy single-restaurant `POST /api/orders` uses the
same rules.

`GET /api/orders/checkouts/:id` returns the grouped receipt to its customer
or an admin. Each child order retains its own status and historical meal
prices, fees, and restaurant name. Existing child order history, details,
cancellation, and owner status routes remain available.
