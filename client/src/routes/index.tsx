import { createBrowserRouter, Route } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import HomePage from '@/pages/Home'
import MealsPage from '@/pages/Meals'
import MealDetailsPage from '@/pages/Meals/MealDetails'
import CartPage from '@/pages/Cart/Cart'
import CheckoutPage from '@/pages/Checkout'
import OrdersPage from '@/pages/Orders'
import OrderDetailsPage from '@/pages/Orders/OrderDetails'
import NotFoundPage from '@/pages/NotFound'

import ProfilePage from '@/pages/Profile/Profile';
<Route path="/profile" element={<ProfilePage />} />
export const router = createBrowserRouter([{ path: '/', element: <MainLayout/>, children: [{ index: true, element: <HomePage/> }, { path: 'meals', element: <MealsPage/> }, { path: 'meals/:id', element: <MealDetailsPage/> }, { path: 'cart', element: <CartPage/> }, { path: 'checkout', element: <CheckoutPage/> }, { path: 'orders', element: <OrdersPage/> }, { path: 'orders/:id', element: <OrderDetailsPage/> }, { path: '*', element: <NotFoundPage/> }] }])
