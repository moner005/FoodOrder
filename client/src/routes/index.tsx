import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import HomePage from "@/pages/Home";
import RestaurantsPage from "@/pages/Restaurants/Restaurants";
import MealsPage from "@/pages/Meals";
import MealDetailsPage from "@/pages/Meals/MealDetails";
import CartPage from "@/pages/Cart/Cart";
import CheckoutPage from "@/pages/Checkout";
import OrdersPage from "@/pages/Orders";
import OrderDetailsPage from "@/pages/Orders/OrderDetails";
import ProfilePage from "@/pages/Profile/Profile";
import DashboardPage from "@/pages/Dashboard";
import NotFoundPage from "@/pages/NotFound";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import OwnerHomePage from "@/pages/Owner/OwnerHomPage";
import MealForm from "@/pages/Owner/MealForm";
import { routes } from "@/constants/routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "restaurants", element: <RestaurantsPage /> },
      { path: "meals", element: <MealsPage /> },
      { path: "meals/:id", element: <MealDetailsPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "orders/:id", element: <OrderDetailsPage /> },
      { path: "Userprofile", element: <ProfilePage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      { path: routes.ownerHome, element: <OwnerHomePage /> },
      { path: routes.ownerMenuNew, element: <MealForm /> },
      { path: routes.ownerMenuEdit(":id"), element: <MealForm /> },
    ],
  },
]);
