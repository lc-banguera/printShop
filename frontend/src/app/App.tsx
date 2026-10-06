import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UIProvider } from "@/providers/ui-provider";
import { LandingPage } from "@/features/landing/LandingPage";
import { DesignerLayout } from "@/features/designer/layouts";
import { DesignerBuilderPage } from "@/features/designer/pages/designer-builder-page";
import { DesignerEasyModePage } from "@/features/designer/pages/designer-easy-mode-page";
import { AdminLayout } from "@/features/admin/AdminLayout";
import Dashboard from "@/features/admin/dashboard";
import Stores from "@/features/admin/stores";
import Users from "@/features/admin/users";
import Subscriptions from "@/features/admin/subscriptions";
import Plans from "@/features/admin/plans";
import Orders from "@/features/admin/orders";
import Products from "@/features/admin/products";
import Designs from "@/features/admin/designs";
import DesignDetail from "@/features/admin/design-detail";
import Templates from "@/features/admin/templates";
import Reports from "@/features/admin/reports";
import Finances from "@/features/admin/finances";
import Payments from "@/features/admin/payments";
import Commissions from "@/features/admin/commissions";
import Marketing from "@/features/admin/marketing";
import Support from "@/features/admin/support";
import AdminSettings from "@/features/admin/settings";
import SystemLogs from "@/features/admin/system-logs";
import ProductDetailPage from "@/features/catalog/ProductDetailPage";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  AuthRequiredModal,
} from "@/features/auth";
import { CartPage, CheckoutPage, CartDrawer } from "@/features/cart";
import { FavoritesPage } from "@/features/favorites";
import { DesignMarketplacePage } from "@/features/design-marketplace";
import { PlansPage } from "@/features/subscription/plans";
import PaymentStatusPage from "@/features/payments/PaymentStatusPage";

// Store / Vendor module
import { StoreLayout } from "@/features/store/StoreLayout";
import StoreDashboard from "@/features/store/dashboard";
import StoreOrders from "@/features/store/orders";
import StoreProducts from "@/features/store/products";
import StoreClients from "@/features/store/clients";
import StoreDesigns from "@/features/store/designs";
import StoreTemplates from "@/features/store/templates";
import StoreDiscounts from "@/features/store/discounts";
import StoreMarketing from "@/features/store/marketing";
import StoreReports from "@/features/store/reports";
import StoreFinances from "@/features/store/finances";
import StoreShipping from "@/features/store/shipping";
import StoreOnline from "@/features/store/online";
import StoreDesigner from "@/features/store/designer";
import StoreSettings from "@/features/store/settings";
import StoreSummary from "@/features/store/summary/SummaryPage";
import { IdentityVerificationPage } from "@/features/onboarding/identity";

export default function App() {
  return (
    <UIProvider>
      <BrowserRouter>
        {/* Drawer lateral global del carrito */}
        <CartDrawer />

        {/* Modal global de requerimiento de autenticación para agregar */}
        <AuthRequiredModal />

        {/* Contenedor principal — el drawer es un overlay y NO afecta este layout */}
        <div className="min-h-screen flex flex-col">
          <Routes>
          {/* Carrito, Checkout y Favoritos */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />

          {/* Autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          {/* Alias de prueba: /products sin id redirige al primer producto */}
          <Route path="/products" element={<ProductDetailPage />} />
          <Route path="/designs" element={<DesignMarketplacePage />} />

          {/* Onboarding / suscripción del nuevo vendedor */}
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/onboarding" element={<StoreSummary />} />
          <Route path="/onboarding/identity" element={<IdentityVerificationPage />} />
          <Route path="/payments/:status" element={<PaymentStatusPage />} />

          {/* Designer / Personalización */}
          <Route path="/designer" element={<Navigate to="/designer/new" replace />} />
          <Route path="/designer/advanced" element={<DesignerLayout />} />
          <Route path="/designer/easy" element={<DesignerEasyModePage />} />
          <Route path="/designer/new" element={<DesignerBuilderPage />} />
          <Route path="/designer/personalize" element={<DesignerLayout />} />

          {/* Admin module */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="stores" element={<Stores />} />
            <Route path="users" element={<Users />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="plans" element={<Plans />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="designs" element={<Designs />} />
            <Route path="designs/:id" element={<DesignDetail />} />
            <Route path="templates" element={<Templates />} />
            <Route path="reports" element={<Reports />} />
            <Route path="finances" element={<Finances />} />
            <Route path="payments" element={<Payments />} />
            <Route path="commissions" element={<Commissions />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="system-logs" element={<SystemLogs />} />
          </Route>

          {/* Store / Vendor module */}
          <Route path="/store/summary" element={<Navigate to="/onboarding" replace />} />
          <Route path="/store/onboarding" element={<Navigate to="/onboarding" replace />} />
          <Route path="/store/identity" element={<Navigate to="/onboarding/identity" replace />} />
          <Route path="/store" element={<StoreLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StoreDashboard />} />
            <Route path="orders" element={<StoreOrders />} />
            <Route path="products" element={<StoreProducts />} />
            <Route path="clients" element={<StoreClients />} />
            <Route path="customers" element={<Navigate to="/store/clients" replace />} />
            <Route path="designs" element={<StoreDesigns />} />
            <Route path="templates" element={<StoreTemplates />} />
            <Route path="discounts" element={<StoreDiscounts />} />
            <Route path="marketing" element={<StoreMarketing />} />
            <Route path="reports" element={<StoreReports />} />
            <Route path="finances" element={<StoreFinances />} />
            <Route path="shipping" element={<StoreShipping />} />
            <Route path="online" element={<StoreOnline />} />
            <Route path="online-store" element={<Navigate to="/store/online" replace />} />
            <Route path="designer" element={<StoreDesigner />} />
            <Route path="settings" element={<StoreSettings />} />
          </Route>
        </Routes>
        </div>
      </BrowserRouter>
    </UIProvider>
  );
}
