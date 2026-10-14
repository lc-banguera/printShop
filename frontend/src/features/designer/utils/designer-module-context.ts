import { useAuthStore, hasSellerProfile } from "@/features/auth";

export type DesignerModule = "customer" | "store";

const DESIGNER_MODULE_KEY = "printshop_designer_active_module";

/**
 * Obtiene el módulo activo (customer o store) con fallback resiliente.
 */
export function getDesignerActiveModule(): DesignerModule {
  if (typeof window !== "undefined") {
    try {
      const sessionVal = window.sessionStorage.getItem(DESIGNER_MODULE_KEY);
      if (sessionVal === "store" || sessionVal === "customer") {
        return sessionVal;
      }
      const localVal = window.localStorage.getItem(DESIGNER_MODULE_KEY);
      if (localVal === "store" || localVal === "customer") {
        return localVal;
      }
    } catch {
      // Ignore storage access errors
    }
  }

  // Si el usuario tiene perfil de vendedor y una tienda activa en sesión
  const auth = useAuthStore.getState();
  if (auth.isAuthenticated && (auth.activeStoreId || hasSellerProfile(auth.user))) {
    return "store";
  }

  return "customer";
}

/**
 * Establece y persiste el módulo activo (customer o store).
 */
export function setDesignerActiveModule(module: DesignerModule): void {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(DESIGNER_MODULE_KEY, module);
      window.localStorage.setItem(DESIGNER_MODULE_KEY, module);
    } catch {
      // Ignore storage access errors
    }
  }
}
