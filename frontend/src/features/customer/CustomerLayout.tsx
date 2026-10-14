import * as React from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Crown,
  Heart,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  TicketPercent,
  Undo2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { hasSellerProfile, useAuthStore } from "@/features/auth";
import { useCartStore } from "@/features/cart";
import { useFavoritesStore } from "@/features/favorites/favorites-store";
import { cn } from "@/shared/utils/cn";
import { setDesignerActiveModule } from "@/features/designer/utils/designer-module-context";
import { customerIconButtonClass } from "./customer-ui";

const SIDEBAR_STORAGE_KEY = "customer-sidebar-collapsed";

const customerPlanDemo = {
  name: "Cuenta Cliente",
  status: "Acceso gratuito al espacio personal.",
  actionLabel: "Ver mi cuenta",
  href: "/account/settings",
};

const customerNavigation = [
  { label: "Resumen", to: "/account", icon: LayoutDashboard, end: true },
  { label: "Mis pedidos", to: "/account/orders", icon: Package },
  { label: "Mis diseños", to: "/account/designs", icon: Palette },
  { label: "Favoritos", to: "/account/favorites", icon: Heart },
  { label: "Mis direcciones", to: "/account/addresses", icon: MapPin },
  {
    label: "Cupones y descuentos",
    to: "/account/coupons",
    icon: TicketPercent,
  },
  { label: "Devoluciones", to: "/account/returns", icon: Undo2 },
  { label: "Notificaciones", to: "/account/notifications", icon: Bell },
  { label: "Configuración de cuenta", to: "/account/settings", icon: Settings },
  { label: "Soporte y ayuda", to: "/account/support", icon: HelpCircle },
  { label: "Diseñador", to: "/designerv", icon: UploadCloud },
];

function CustomerPlanCard({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden bg-[#FEF3C7] border border-[#FDE68A] transition-all duration-150",
        collapsed
          ? "mx-auto flex h-9 w-9 items-center justify-center rounded-[10px]"
          : "rounded-[12px] p-3",
      )}
    >
      <div
        className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "mb-1.5 gap-2",
        )}
      >
        <Crown
          className={cn(
            "shrink-0 text-[#D97706]",
            collapsed ? "h-4 w-4" : "h-3.5 w-3.5",
          )}
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold leading-tight text-[#92400E]">
              {customerPlanDemo.name}
            </p>
          </div>
        )}
      </div>
      {!collapsed && (
        <>
          <p className="mb-2 text-[10px] leading-relaxed text-[#78350F]">
            {customerPlanDemo.status}
          </p>
          <Link
            to={customerPlanDemo.href}
            className="flex h-[42px] w-full items-center justify-center rounded-[6px] bg-white/80 py-1.5 text-[10.5px] font-semibold text-[#92400E] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <span>{customerPlanDemo.actionLabel}</span>
          </Link>
        </>
      )}
      {collapsed && (
        <Link
          to={customerPlanDemo.href}
          className="absolute inset-0"
          title={`Membresía: ${customerPlanDemo.name}`}
          aria-label={`Membresía: ${customerPlanDemo.name}`}
        />
      )}
    </div>
  );
}

function CustomerTopbar({
  onMobileMenuOpen,
  onToggleSidebar,
  onLogout,
}: {
  onMobileMenuOpen: () => void;
  onToggleSidebar?: () => void;
  onLogout: () => void;
}) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const cartCount = useCartStore((state) => state.getTotalItemsCount());
  const openCart = useCartStore((state) => state.openDrawer);
  const favoritesCount = useFavoritesStore((state) =>
    state.getFavoritesCount(user?.id),
  );
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!accountMenuOpen) return;

    const handleOutsidePointer = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutsidePointer);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsidePointer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  return (
    <header className="z-[60] flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuOpen || onToggleSidebar}
          aria-label="Abrir menú"
          className={cn(customerIconButtonClass, "h-9 w-9 lg:hidden")}
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <NavLink
          to="/account/favorites"
          title="Favoritos"
          aria-label="Favoritos"
          className={cn(customerIconButtonClass, "relative h-9 w-9")}
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
          {favoritesCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-slate-800 px-1 text-[8.5px] font-bold leading-none text-white">
              {favoritesCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/account/notifications"
          title="Notificaciones"
          aria-label="Notificaciones"
          className={cn(customerIconButtonClass, "relative h-9 w-9")}
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-slate-700 px-1 text-[8.5px] font-bold leading-none text-white">
            3
          </span>
        </NavLink>

        <button
          type="button"
          onClick={openCart}
          title="Carrito"
          aria-label="Carrito"
          className={cn(customerIconButtonClass, "relative h-9 w-9")}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-slate-800 px-1 text-[8.5px] font-bold leading-none text-white">
              {cartCount}
            </span>
          )}
        </button>

        <div ref={accountMenuRef} className="relative ml-1">
          <button
            type="button"
            onClick={() => setAccountMenuOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            className="flex items-center gap-2 rounded-control border-l border-[var(--border)] pl-2 text-left transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UserRound className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="hidden flex-col sm:flex">
              <span className="max-w-36 truncate text-[11.5px] font-semibold leading-tight text-[var(--text-primary)]">
                {user?.name || user?.email || "Cuenta de cliente"}
              </span>
              <span className="text-[10px] leading-tight text-[var(--text-secondary)]">
                Cliente
              </span>
            </div>
          </button>

          {accountMenuOpen && (
            <div
              role="menu"
              aria-label="Menú de cuenta"
              className="absolute right-0 top-full z-[70] mt-2 min-w-[160px] border border-slate-200 bg-white p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
              style={{ borderRadius: 5 }}
            >
              {hasSellerProfile(user) && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    navigate("/workspace");
                  }}
                  className="flex w-full items-center px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                >
                  Cambiar espacio
                </button>
              )}
              <Link
                to="/account/settings"
                role="menuitem"
                onClick={() => setAccountMenuOpen(false)}
                className="flex w-full items-center px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              >
                Mi perfil
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setAccountMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function CustomerSidebar({
  collapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-50 flex flex-col border-r border-border bg-surface shadow-xs transition-[width,transform] duration-normal ease-in-out lg:static",
          collapsed ? "w-[72px]" : "w-[232px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div
          className={cn(
            "relative flex h-16 shrink-0 items-center border-b border-border",
            collapsed ? "justify-center" : "justify-between px-4",
          )}
        >
          <Link
            to="/account"
            className={cn(
              "flex min-w-0 items-center",
              collapsed ? "justify-center" : "gap-2.5",
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-primary text-sm font-extrabold text-primaryForeground shadow-subtle">
              P
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-[17px] font-semibold tracking-tight text-foreground">
                  Print<span className="text-primary">Shop</span>
                </span>
                <p className="-mt-0.5 text-[9px] leading-none text-foregroundSubtle">
                  Mi cuenta
                </p>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              customerIconButtonClass,
              "absolute right-[-11px] top-1/2 z-[60] hidden h-6 w-6 -translate-y-1/2 text-foregroundMuted lg:flex",
            )}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-2",
            collapsed ? "px-2" : "px-3",
          )}
        >
          <div className="flex flex-col gap-1">
            {customerNavigation.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                state={to.startsWith("/designer") ? { fromModule: "customer" } : undefined}
                end={end}
                onClick={() => {
                  if (to.startsWith("/designer")) {
                    setDesignerActiveModule("customer");
                  }
                  onMobileClose?.();
                }}
                className={({ isActive }) =>
                  cn(
                    "group relative flex h-10 shrink-0 items-center text-sm font-medium transition-all duration-normal active:scale-[0.99] motion-reduce:active:scale-100",
                    collapsed ? "justify-center px-0" : "gap-2.5 px-2.5",
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30",
                  )
                }
                style={{ borderRadius: 5 }}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r bg-slate-900" />
                    )}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive
                          ? "text-slate-700"
                          : "text-slate-400 group-hover:text-slate-600",
                      )}
                      strokeWidth={1.75}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{label}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="space-y-2 border-t border-border p-2">
          <CustomerPlanCard collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}

export function CustomerLayout({ children }: { children?: React.ReactNode } = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isDesignerRoute = location.pathname.startsWith("/account/designer") || location.pathname.startsWith("/designerv");
  const isDesignsRoute = location.pathname === "/account/designs";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <CustomerSidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <CustomerTopbar
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
        />
        <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-background">
          <div
            className={cn(
              "w-full",
              isDesignerRoute
                ? "relative h-full min-h-0"
                : isDesignsRoute
                  ? "mx-auto w-full max-w-[1600px] p-4 sm:p-6"
                  : "mx-auto max-w-[1400px] p-4 sm:p-6",
            )}
          >
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CustomerLayout;
