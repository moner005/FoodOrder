import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import HomePage from "@/pages/Home";
import MealsPage from "@/pages/Meals";
import MealDetailsPage from "@/pages/Meals/MealDetails";
import CartPage from "@/pages/Cart";
import CheckoutPage from "@/pages/Checkout";
import OrdersPage from "@/pages/Orders";
import OrderDetailsPage from "@/pages/Orders/OrderDetails";
import NotFoundPage from "@/pages/NotFound";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import { routes } from "@/constants/routes";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "meals", element: <MealsPage /> },
      { path: "meals/:id", element: <MealDetailsPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "orders/:id", element: <OrderDetailsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
        { path: routes.login, element: <LoginPage /> },
        { path: routes.register, element: <RegisterPage /> }
    ],
  },
]);
