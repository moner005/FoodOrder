# SwiftBite – Food Ordering Platform

A full-stack food ordering application that allows customers to explore restaurants, browse meals, manage shopping carts, place orders, and track their order status.

Restaurant owners manage menus and orders. Platform administrators manage accounts, restaurant approvals, venue settings, menus, and orders.

## Tech Stack

### Frontend
- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Zustand 5
- TanStack React Query 5
- Axios
- React Hot Toast

### Backend
- NestJS 12
- TypeScript
- Prisma ORM 7
- PostgreSQL
- Passport JWT Authentication
- bcrypt
- class-validator
- class-transformer

## Main Features

- User registration and authentication
- Role-based access: Customer, Restaurant Owner, Admin
- Restaurant browsing
- Meal and category management
- Shopping cart with meals from multiple restaurants
- Multi-restaurant checkout
- Order creation and order history
- Order status management
- Customer profile management
- Restaurant approval workflow
- Role-based dashboards

## Requirements

Install the following before running the project:

- Git
- Node.js 22.22.3+ or 24.15.0+ on the supported LTS lines
- npm
- Docker Desktop or Docker Engine with Compose

## Installation

### 1. Clone the Repository

Replace the repository URL with your GitHub repository URL.

```bash
git clone <YOUR_REPOSITORY_URL>
cd FoodOrder
```

### 2. Install Frontend Dependencies

```bash
cd client
npm ci
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm ci
```

## Environment Configuration

Copy the local environment examples from the project root.

```powershell
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env.local
```

Set a local database password in the root `.env` and use the same password in
`server/.env`'s `DATABASE_URL`. URL-encode the password in `DATABASE_URL`
if it contains URL punctuation. Replace the JWT secret with a random value.
The ignored environment files hold the local credentials.

## Database Setup

Start PostgreSQL from the project root with Docker running. The Compose volume
preserves the database across restarts. The default PostgreSQL port is `55434`.

```powershell
docker compose up -d --wait
cd server
npx prisma generate
npx prisma migrate deploy
npm run build
```

To populate a new local browsing database, set `FOODORDER_PREVIEW_PASSWORD` in
the terminal to a test password of at least 12 characters and run
`node prisma/seed-preview.mjs` from `server/`. This adds the fictional
customer, owner, and admin accounts `customer@example.test`, `owner@example.test`,
and `admin@example.test` and a small restaurant catalog. The seed accepts only
the dedicated loopback preview database and preserves existing preview edits on rerun.

## Running the Project

### Start the Backend

```bash
cd server
node --env-file=.env dist/main.js
```

### Start the Frontend

In another terminal:

```bash
cd client
npm run dev -- --host 127.0.0.1 --port 4191 --strictPort
```

The storefront is at [127.0.0.1:4191](http://127.0.0.1:4191/) and the API
documentation is at [127.0.0.1:3302/api/docs](http://127.0.0.1:3302/api/docs).

With the preview fixtures, sign in as the customer and add Margherita Pizza
from Salford & Co and Wood-fired Margherita from Al Forno. Choose Willow Quarter
at checkout. The combined receipt totals $33.50 and includes a status for each
restaurant's order. Sign in as the owner to access the assigned menu and order
dashboard. Sign in as the admin and open **Admin** for accounts, restaurants,
menu links, and orders. Cedar Kitchen is seeded as a pending restaurant for
the approval workflow.

## Build and Validation

Frontend:

```bash
cd client
npm run build
npm run lint
```

Backend:

```bash
cd server
npm run build
npm test
```

## Project Structure

```text
FoodOrder/
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── server/
│   ├── src/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── prisma.config.ts
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

## Security

- Environment files containing real credentials are excluded from Git.
- Passwords are hashed before database storage.
- Authentication uses JWT.
- Protected operations require authentication and appropriate permissions.
- Each developer must configure their own local environment variables.

## License

Add the appropriate project license here.
