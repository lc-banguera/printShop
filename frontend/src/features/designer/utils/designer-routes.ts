import { getDesignerActiveModule } from "./designer-module-context";

export function getDesignerRouteContext(pathname: string) {
  const activeModule = getDesignerActiveModule();
  const isCustomer =
    pathname.startsWith("/account") ||
    pathname.startsWith("/customer") ||
    ((pathname.startsWith("/designer") || pathname.startsWith("/designerv")) && activeModule === "customer");

  return {
    isCustomerRoute: isCustomer,
    isCustomerLayoutRoute: isCustomer,
    activeModule,
    hub: "/designerv",
    advanced: "/designerv/advanced",
    easy: "/designerv/easy",
  };
}
