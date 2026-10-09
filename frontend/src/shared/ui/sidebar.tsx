import * as React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Home,
  Store,
  Users,
  ShoppingBag,
  Package,
  Palette,
  LayoutGrid,
  Calendar,
  Layers,
  BarChart3,
  CreditCard,
  DollarSign,
  CircleHelp,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    title: "PRINCIPAL",
    items: [
      {
        to: "/admin/dashboard",
        icon: Home,
        label: "Dashboard",
      },
    ],
  },
  {
    title: "GESTIÓN",
    items: [
      { to: "/admin/stores", icon: Store, label: "Tiendas" },
      { to: "/admin/users", icon: Users, label: "Usuarios" },
      { to: "/admin/orders", icon: ShoppingBag, label: "Pedidos" },
      { to: "/admin/products", icon: Package, label: "Productos" },
      { to: "/admin/designs", icon: Palette, label: "Diseños" },
      { to: "/admin/templates", icon: LayoutGrid, label: "Plantillas" },
    ],
  },
  {
    title: "NEGOCIO",
    items: [
      { to: "/admin/subscriptions", icon: Calendar, label: "Suscripciones" },
      { to: "/admin/plans", icon: Layers, label: "Planes" },
      { to: "/admin/finances", icon: BarChart3, label: "Finanzas" },
      { to: "/admin/payments", icon: CreditCard, label: "Pagos" },
      { to: "/admin/commissions", icon: DollarSign, label: "Comisiones" },
      { to: "/admin/support", icon: CircleHelp, label: "Soporte" },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { to: "/admin/settings", icon: Settings, label: "Configuración" },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  collapsed = false,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-[0_0_0_1px_rgba(15,23,42,0.02)] transition-[width,transform] duration-normal ease-in-out select-none lg:static",
          collapsed ? "w-[72px]" : "w-[232px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            "relative flex h-16 shrink-0 items-center border-b border-[var(--border)]",
            collapsed ? "justify-center px-0" : "justify-between px-4"
          )}
        >
          {!collapsed ? (
            <Link to="/admin/dashboard" className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-[var(--primary)] text-sm font-extrabold text-[var(--text-inverse)] shadow-subtle">
                P
              </span>
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                Print<span className="text-[var(--primary)]">Shop</span>
              </span>
            </Link>
          ) : (
            <Link
              to="/admin/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-control bg-[var(--primary)] text-sm font-extrabold text-[var(--text-inverse)] shadow-subtle"
              title="PrintShop Admin"
            >
              P
            </Link>
          )}

          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="absolute right-[-11px] top-1/2 z-[60] hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-control border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] shadow-subtle transition-all duration-normal active:scale-[0.96] motion-reduce:active:scale-100 hover:bg-[var(--surface-strong)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2 lg:flex"
              title={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
              aria-label={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
            >
              {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        <nav
          className={cn("flex-1 overflow-y-auto overflow-x-hidden py-3", collapsed ? "px-2" : "px-3")}
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="flex flex-col gap-4">
            {groups.map((group, groupIdx) => (
              <div key={group.title} className="flex flex-col">
                {!collapsed ? (
                  <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    {group.title}
                  </p>
                ) : (
                  groupIdx > 0 && <div className="my-2 h-px w-full bg-[var(--border)]" />
                )}

                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => onMobileClose && onMobileClose()}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex h-10 w-full shrink-0 items-center rounded-control text-sm font-medium transition-all duration-normal active:scale-[0.99] motion-reduce:active:scale-100",
                          collapsed ? "justify-center px-0" : "gap-2.5 px-2.5",
                          isActive
                            ? "bg-[var(--surface-strong)] text-[var(--primary)] shadow-[inset_0_0_0_1px_rgba(93,70,232,0.08)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[var(--primary)]" />}

                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                            )}
                            strokeWidth={1.75}
                          />

                          {!collapsed && <span className="truncate transition-opacity duration-200">{item.label}</span>}

                          {collapsed && (
                            <div className="pointer-events-none absolute left-[calc(100%+10px)] z-50 whitespace-nowrap rounded-sm bg-[var(--text-primary)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-inverse)] opacity-0 shadow-md transition-all duration-normal group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1">
                              {item.label}
                              <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[var(--text-primary)]" />
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
