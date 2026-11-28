# SwiftBite

SwiftBite is a restaurant marketplace with React, NestJS, Prisma, and PostgreSQL. Customers can place one checkout across several restaurants. Each restaurant manages its own menu and order status. Platform administrators manage accounts, assignments, approvals, and venue settings.

## Prerequisites

- Git, npm, and Node.js 22.22.3+ or 24.15.0+ on the corresponding LTS line
- Docker Desktop or Docker Engine with the Compose plugin
- Available loopback ports 4191 for the storefront, 3302 for the API, and 55434 for PostgreSQL

## Install locally

Clone the repository and install both lockfiles from the project root.

```text
git clone https://github.com/moner005/FoodOrder.git
cd FoodOrder
npm ci --prefix client
npm ci --prefix server
```

Copy the environment examples from the root. On macOS or Linux, use `cp` in place of `Copy-Item`.

```powershell
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env.local
```

| File | Settings |
| --- | --- |
| `.env` | Set `FOODORDER_DB_PASSWORD` to a unique local password. Keep `FOODORDER_DB_PORT=55434` unless that port is occupied. |
| `server/.env` | Replace the password in `DATABASE_URL` with the same database password. URL-encode it if it contains URL punctuation. Set `JWT_SECRET` to a unique random value. |
| `client/.env.local` | Set `VITE_API_URL=http://127.0.0.1:3302/api` for the standard local setup. |

Generate a signing secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Save it only in your ignored environment file or secret manager. If a port changes, update its corresponding URL and set `CLIENT_ORIGIN` to the exact storefront origin.

Start Docker, then run these commands from the project root.

```powershell
docker compose up -d --wait
cd server
npx prisma generate
npx prisma migrate deploy
npm run build
```

Optional local data includes five approved restaurants, a pending restaurant, and three accounts. From `server/`, set `FOODORDER_PREVIEW_PASSWORD` to a unique local password of at least 12 characters and run `node prisma/seed-preview.mjs`. In PowerShell use `$env:FOODORDER_PREVIEW_PASSWORD = '<your local password>'`. The same password works with `customer@example.test`, `owner@example.test`, and `admin@example.test`. The seed checks the dedicated loopback database and preserves existing records on rerun.

To add six Lattakia, Syria listings, run `node --env-file=.env prisma/seed-lattakia.mjs` from `server/` after building the API. Search for `Lattakia` on the Restaurants page. The listings include public names and locations. Ordering is disabled until the restaurants have confirmed menus and delivery arrangements. See the [listing sources](docs/release-verification.md#lattakia-catalog).

## Run the site

Run the API from `server/`.

```text
node --env-file=.env dist/main.js
```

In a second terminal, run the frontend from `client/`.

```text
npm run dev -- --host 127.0.0.1 --port 4191 --strictPort
```

Open the [storefront](http://127.0.0.1:4191/), the [API health endpoint](http://127.0.0.1:3302/api/health), or the [local API documentation](http://127.0.0.1:3302/api/docs). Use **Admin** in the navigation after signing in as an administrator.

To try a grouped checkout, add Margherita Pizza from Salford & Co and Wood-fired Margherita from Al Forno. Select Willow Quarter. The seeded catalog totals $33.50 including delivery fees, and the receipt shows an independent status for each restaurant.

Stop the API and frontend with Ctrl+C. From the root, run `docker compose stop` to stop PostgreSQL while keeping the named volume. Start it again with `docker compose up -d --wait`.

### Troubleshooting

- **PostgreSQL connection fails.** Run `docker compose ps` from the project root and wait for PostgreSQL to report healthy. Check that `server/.env` uses the same port and password as the root `.env`. On first setup, run `npx prisma migrate deploy` from `server/` before starting the API.
- **The site loads but the catalog fails.** Open the API health endpoint and confirm the API is running. Check `VITE_API_URL` in `client/.env.local` and set `CLIENT_ORIGIN` in `server/.env` to the exact URL in your browser. `localhost` and `127.0.0.1` are distinct origins. Restart the affected processes after changing their environment files.
- **The catalog is empty or you need an administrator account.** Run the optional local data commands in the installation section, then sign in with the fixture account for the role you want to check.

## Build and verify

From the root, run:

```text
npm run lint --prefix client
npm run typecheck --prefix client
npm run build --prefix client
npm run build --prefix server
npm test --prefix server
npm run test:e2e --prefix server
```

Generate the Prisma client first and keep PostgreSQL running for the backend smoke test. See [release verification](docs/release-verification.md) for the browser matrix, isolated load check, and release requirements. See the [API contract](docs/api-contract.md) for routes and order behavior.

## Production configuration

Build the frontend with `VITE_API_URL` set to the deployed HTTPS API URL, including `/api`. The static host needs a fallback to `index.html` for client routes. Run the compiled API with `NODE_ENV=production`, an explicit `CLIENT_ORIGIN`, and deployment-managed database and signing secrets. Choose the API bind address for your host. Swagger stays off in production unless `ENABLE_SWAGGER=true` is set.

Use a durable PostgreSQL instance with backups. Apply migrations once from a trusted release job before starting the new API. The local seed is for the isolated development database. A release smoke check should cover HTTPS, the API health endpoint, a database-backed catalog request, a direct restaurant URL, and an authorized sign-in and order workflow.
