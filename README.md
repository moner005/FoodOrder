# SwiftBite – Food Ordering Platform

A full-stack food ordering application that allows customers to explore restaurants, browse meals, manage shopping carts, place orders, and track their order status.

The platform also provides restaurant owners with menu and order management capabilities, while administrators can manage restaurant approvals.

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
- Node.js 22.12 or later
- npm
- PostgreSQL

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

Environment files are not included in the repository for security reasons.

Create your local environment files from the examples.

From the project root:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Update the environment variables with your own local configuration.

### Backend Environment Variables

```env
DATABASE_URL="postgresql://postgres:YOUR_LOCAL_PASSWORD@localhost:5432/foodorder?schema=public"
JWT_SECRET="YOUR_OWN_SECRET"
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

Never commit real passwords, tokens, or API keys.

## Database Setup

1. Install and start PostgreSQL.
2. Create a database named `foodorder`.
3. Configure `DATABASE_URL` in `server/.env`.
4. Run the Prisma commands from the server directory.

```bash
npx prisma generate
npx prisma migrate deploy
```

The migration files must be included in the repository.

## Running the Project

### Start the Backend

```bash
cd server
npm run start:dev
```

### Start the Frontend

In another terminal:

```bash
cd client
npm run dev
```

The frontend is available at:

http://localhost:5173

The backend API uses the configured server port and API prefix.

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