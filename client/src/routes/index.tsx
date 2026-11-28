import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import ContactPage from "@/pages/Contact";
import HomePage from "@/pages/Home";
import RestaurantsPage from "@/pages/Restaurants/Restaurants";
import RestaurantMenuPage from "@/pages/Restaurants/RestaurantMenu";
import MealsPage from "@/pages/Meals";
import MealDetailsPage from "@/pages/Meals/MealDetails";
import CartPage from "@/pages/Cart/Cart";
import CheckoutPage from "@/pages/Checkout";
import OrdersPage from "@/pages/Orders";
import OrderDetailsPage from "@/pages/Orders/OrderDetails";
import CheckoutReceiptPage from "@/pages/Orders/CheckoutReceipt";
import ProfilePage from "@/pages/Profile/Profile";
import DashboardPage from "@/pages/Dashboard";
import NotFoundPage from "@/pages/NotFound";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import OwnerHomePage from "@/pages/Owner/OwnerHomPage";
import MealForm from "@/pages/Owner/MealForm";
import { routes } from "@/constants/routes";
import FAQsPage from "@/pages/FAQs";
import AdminPage from "@/pages/Admin/Admin";
import { RequireAuth } from "@/components/common/RequireAuth";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "restaurants", element: <RestaurantsPage /> },
      { path: "restaurant", element: <Navigate to={routes.restaurants} replace /> },
      { path: "restaurants/:restaurantId/meals", element: <RestaurantMenuPage /> },
      { path: "meals", element: <MealsPage /> },
      { path: "meals/:id", element: <MealDetailsPage /> },
      {
        path: "cart",
        element: (
          <RequireAuth>
            <CartPage />
          </RequireAuth>
        ),
      },

      {
        path: "checkout",
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },

      {
        path: "orders",
        element: (
          <RequireAuth>
            <OrdersPage />
          </RequireAuth>
        ),
      },

      {
        path: "orders/checkouts/:id",
        element: (
          <RequireAuth>
            <CheckoutReceiptPage />
          </RequireAuth>
        ),
      },

      {
        path: "orders/:id",
        element: (
          <RequireAuth>
            <OrderDetailsPage />
          </RequireAuth>
        ),
      },

      {
        path: "Userprofile",
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },

      {
        path: "profile",
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },

      {
        path: "dashboard",
        element: (
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: "admin",
        element: (
          <RequireAuth allowedRoles={["ADMIN"]}>
            <AdminPage />
          </RequireAuth>
        ),
      },
      { path: "contact", element: <ContactPage /> },
      { path: "faqs", element: <FAQsPage /> },
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
      {
        path: routes.ownerHome,
        element: (
          <RequireAuth allowedRoles={["RESTAURANT_OWNER", "ADMIN"]}>
            <OwnerHomePage />
          </RequireAuth>
        ),
      },
      {
        path: routes.ownerMenuNew,
        element: (
          <RequireAuth allowedRoles={["RESTAURANT_OWNER", "ADMIN"]}>
            <MealForm />
          </RequireAuth>
        ),
      },
      {
        path: routes.ownerMenuEdit(":id"),
        element: (
          <RequireAuth allowedRoles={["RESTAURANT_OWNER", "ADMIN"]}>
            <MealForm />
          </RequireAuth>
        ),
      },
    ],
  },
]);
