import * as React from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore, hasSellerProfile } from "@/features/auth";
import { CustomerLayout } from "@/features/customer/CustomerLayout";
import { StoreLayout } from "@/features/store/StoreLayout";
import StoreDesigner from "@/features/store/designer";
import {
  getDesignerActiveModule,
  setDesignerActiveModule,
  type DesignerModule,
} from "../utils/designer-module-context";

export function DesignerRouteHost() {
  const location = useLocation();
  const auth = useAuthStore();
  const locationState = location.state as { fromModule?: DesignerModule } | null;

  const [activeModule, setActiveModule] = React.useState<DesignerModule>(() => {
    if (locationState?.fromModule === "store" || locationState?.fromModule === "customer") {
      setDesignerActiveModule(locationState.fromModule);
      return locationState.fromModule;
    }
    return getDesignerActiveModule();
  });

  React.useEffect(() => {
    if (locationState?.fromModule === "store" || locationState?.fromModule === "customer") {
      setDesignerActiveModule(locationState.fromModule);
      setActiveModule(locationState.fromModule);
    }
  }, [locationState?.fromModule]);

  // Si activeModule es 'store', verificar si el usuario tiene permiso a tienda.
  // Si no está autenticado o no es vendedor, fallback a 'customer'
  const isSellerAuthorized =
    auth.isAuthenticated && (Boolean(auth.activeStoreId) || hasSellerProfile(auth.user));

  const effectiveModule =
    activeModule === "store" && !isSellerAuthorized && auth.isAuthenticated
      ? "customer"
      : activeModule;

  if (effectiveModule === "store") {
    return (
      <StoreLayout>
        <StoreDesigner />
      </StoreLayout>
    );
  }

  return (
    <CustomerLayout>
      <StoreDesigner />
    </CustomerLayout>
  );
}

export default DesignerRouteHost;
