import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { UIProvider } from "@/providers/ui-provider";
import { LandingPage } from "@/features/landing/LandingPage";
import { DesignerLayout } from "@/features/designer/layouts";
import { DesignerBuilderPage } from "@/features/designer/pages/designer-builder-page";
import {
  DesignerPrepressDtfEntry,
  DesignerStoreAccessGuard,
} from "@/features/designer/pages/designer-prepress-dtf-entry";
import { PrepressDtfDesigner } from "@/features/designer/easy";
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
import CatalogPage from "@/features/catalog/CatalogPage";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  AuthRequiredModal,
  WorkspaceSelectorPage,
} from "@/features/auth";
import { CartPage, CheckoutPage, CartDrawer } from "@/features/cart";
import { FavoritesPage } from "@/features/favorites";
import { CustomerLayout } from "@/features/customer/CustomerLayout";
import { CustomerDashboardPage } from "@/features/customer/CustomerDashboardPage";
import { CustomerOrdersPage } from "@/features/customer/CustomerOrdersPage";
import { CustomerDesignsPage } from "@/features/customer/CustomerDesignsPage";
import { CustomerProfilePage } from "@/features/customer/CustomerProfilePage";
import { CustomerSupportPage } from "@/features/customer/CustomerSupportPage";
import { CustomerNotificationsPage } from "@/features/customer/CustomerNotificationsPage";
import { CustomerReturnsPage } from "@/features/customer/CustomerReturnsPage";
import { CustomerCouponsPage } from "@/features/customer/CustomerCouponsPage";
import { CustomerAddressesPage } from "@/features/customer/CustomerAddressesPage";
import { CustomerFavoritesPage } from "@/features/customer/CustomerFavoritesPage";
import {
  DesignCreatorDashboardPage,
  DesignCreatorGuard,
  DesignCreatorLayout,
  DesignCreatorPackFormPage,
  DesignCreatorPacksPage,
  DesignCreatorProfilePage,
  DesignCreatorSalesPage,
  DesignLibraryPage,
  DesignMarketplacePage,
  DesignPackDetailPage,
  DesignAccessPage,
} from "@/features/design-marketplace";
import { ResourceAccessPage, ResourceDetailPage, ResourceCreatorFormPage, ResourcesCreatorDashboardPage, ResourcesCreatorLayout, ResourcesCreatorListPage, ResourcesPage } from "@/features/resources";
import { PlansPage } from "@/features/subscription/plans";
import PaymentStatusPage from "@/features/payments/PaymentStatusPage";
import { HowItWorksDocumentationPage, HowItWorksPage } from "@/features/how-it-works";

function GlobalCommerceOverlays() {
  const location = useLocation();

  if (location.pathname.startsWith("/designs/creator") || location.pathname.startsWith("/resources/creator")) return null;

  return (
    <>
      <CartDrawer />
      <AuthRequiredModal />
    </>
  );
}

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
import DesignerRouteHost from "@/features/designer/components/DesignerRouteHost";
import StoreSettings from "@/features/store/settings";
import StoreSummary from "@/features/store/summary/SummaryPage";
import { IdentityVerificationPage } from "@/features/onboarding/identity";

export default function App() {
  return (
    <UIProvider>
      <BrowserRouter>
        <GlobalCommerceOverlays />

        {/* Contenedor principal — el drawer es un overlay y NO afecta este layout */}
        <div className="min-h-screen flex flex-col">
          <Routes>
          {/* Carrito, Checkout y Favoritos */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/account" element={<CustomerLayout />}>
            <Route index element={<CustomerDashboardPage />} />
            <Route path="orders" element={<CustomerOrdersPage />} />
            <Route path="designs" element={<CustomerDesignsPage />} />
            <Route path="favorites" element={<CustomerFavoritesPage />} />
            <Route path="addresses" element={<CustomerAddressesPage />} />
            <Route path="designer">
              <Route index element={<Navigate to="/designerv" replace state={{ fromModule: "customer" }} />} />
              <Route path="easy" element={<Navigate to="/designerv/easy" replace />} />
              <Route path="advanced" element={<Navigate to="/designerv/advanced" replace state={{ fromModule: "customer" }} />} />
            </Route>
            <Route path="payment-methods" element={<Navigate to="/account" replace />} />
            <Route path="coupons" element={<CustomerCouponsPage />} />
            <Route path="returns" element={<CustomerReturnsPage />} />
            <Route path="notifications" element={<CustomerNotificationsPage />} />
            <Route path="support" element={<CustomerSupportPage />} />
            <Route path="settings" element={<CustomerProfilePage />} />
            <Route path="profile" element={<CustomerProfilePage />} />
          </Route>

          {/* Autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/workspace" element={<WorkspaceSelectorPage />} />

          {/* Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/como-funciona/documentacion/:slug" element={<HowItWorksDocumentationPage />} />
          <Route path="/como-funciona" element={<HowItWorksPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/products" element={<CatalogPage />} />
          <Route path="/designs" element={<DesignMarketplacePage />} />
          <Route path="/designs/pack/:id" element={<DesignPackDetailPage />} />
          <Route path="/designs/access" element={<DesignAccessPage />} />
          <Route path="/designs/library" element={<DesignLibraryPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/access" element={<ResourceAccessPage />} />
          <Route path="/resources/:id" element={<ResourceDetailPage />} />
          <Route path="/resources/creator" element={<ResourcesCreatorLayout />}>
            <Route index element={<ResourcesCreatorDashboardPage />} />
            <Route path="resources" element={<ResourcesCreatorListPage />} />
            <Route path="resources/new" element={<ResourceCreatorFormPage />} />
            <Route path="resources/:id" element={<ResourceCreatorFormPage />} />
          </Route>
          <Route
            path="/designs/creator"
            element={<DesignCreatorGuard><DesignCreatorLayout /></DesignCreatorGuard>}
          >
            <Route index element={<DesignCreatorDashboardPage />} />
            <Route path="packs" element={<DesignCreatorPacksPage />} />
            <Route path="packs/new" element={<DesignCreatorPackFormPage />} />
            <Route path="packs/:id" element={<DesignCreatorPackFormPage />} />
            <Route path="sales" element={<DesignCreatorSalesPage />} />
            <Route path="profile" element={<DesignCreatorProfilePage />} />
          </Route>

          {/* Onboarding / suscripción del nuevo vendedor */}
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/onboarding" element={<StoreSummary />} />
          <Route path="/onboarding/identity" element={<IdentityVerificationPage />} />
          <Route path="/payments/:status" element={<PaymentStatusPage />} />

          {/* ─── Rutas oficiales del Diseñador ─────────────────────────────────── */}
          {/* Módulo principal del Diseñador (dentro de Clientes o Tienda según contexto) */}
          <Route path="/designerv" element={<DesignerRouteHost />} />
          {/* Modo fácil (Easy) — espacio independiente, sin layouts de Clientes o Tienda */}
          <Route path="/designerv/easy" element={<PrepressDtfDesigner />} />
          {/* Modo avanzado (Advanced) — dentro del layout correspondiente de Clientes o Tienda */}
          <Route path="/designerv/advanced" element={<DesignerRouteHost />} />

          {/* Compatibilidad hacia atrás — rutas antiguas */}
          <Route path="/designer" element={<Navigate to="/designerv" replace />} />
          <Route path="/designer/easy" element={<Navigate to="/designerv/easy" replace />} />
          <Route path="/designer/advanced" element={<Navigate to="/designerv/advanced" replace />} />
          <Route path="/designer/new" element={<DesignerBuilderPage />} />
          <Route path="/designer/personalize" element={<DesignerLayout />} />
          <Route path="/account/designer/easy" element={<Navigate to="/designerv/easy" replace />} />
          <Route path="/store/designer/easy" element={<Navigate to="/designerv/easy" replace />} />

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
            <Route path="designerv" element={<Navigate to="/designerv" replace state={{ fromModule: "store" }} />} />
            <Route path="designer">
              <Route index element={<Navigate to="/designerv" replace state={{ fromModule: "store" }} />} />
              <Route path="advanced" element={<Navigate to="/designerv/advanced" replace state={{ fromModule: "store" }} />} />
            </Route>
            <Route path="settings" element={<StoreSettings />} />
          </Route>
        </Routes>
        </div>
      </BrowserRouter>
    </UIProvider>
  );
}
