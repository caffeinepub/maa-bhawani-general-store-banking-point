import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import StoreDetailsPage from './pages/StoreDetailsPage';
import AdminPage from './pages/AdminPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import BillingPage from './pages/BillingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminGuard from './components/AdminGuard';
import SearchPage from './pages/SearchPage';
import MyOrdersPage from './pages/MyOrdersPage';
import WalletPage from './pages/WalletPage';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

// Keep the $orderId param so OrderConfirmationPage can read it
const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation/$orderId',
  component: OrderConfirmationPage,
});

const storeDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/store-details',
  component: StoreDetailsPage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchPage,
});

const myOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-orders',
  component: MyOrdersPage,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallet',
  component: WalletPage,
});

// Public login route — no AdminGuard
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: AdminLoginPage,
});

// Admin routes — all wrapped with AdminGuard
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AdminGuard>
      <AdminPage />
    </AdminGuard>
  ),
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: () => (
    <AdminGuard>
      <AdminPage />
    </AdminGuard>
  ),
});

const adminBillingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/billing',
  component: () => (
    <AdminGuard>
      <BillingPage />
    </AdminGuard>
  ),
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/settings',
  component: () => (
    <AdminGuard>
      <AdminSettingsPage />
    </AdminGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  checkoutRoute,
  orderConfirmationRoute,
  storeDetailsRoute,
  searchRoute,
  myOrdersRoute,
  walletRoute,
  loginRoute,
  adminRoute,
  adminDashboardRoute,
  adminBillingRoute,
  adminSettingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
