import * as React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Package,
  Palette,
  Users,
  Layers,
  LayoutGrid,
  Tag,
  Megaphone,
  BarChart3,
  DollarSign,
  Truck,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Crown,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  badgeVariant?: "count" | "new";
}

const navItems: NavItem[] = [
  { to: "/store/dashboard", icon: Home, label: "Inicio" },
  {
    to: "/store/orders",
    icon: ShoppingBag,
    label: "Pedidos",
    badge: "12",
    badgeVariant: "count",
  },
  {
    to: "/store/products",
    icon: Package,
    label: "Productos",
    badge: "58",
    badgeVariant: "count",
  },
  {
    to: "/store/designerv",
    icon: Palette,
    label: "Diseñador",
    badge: "Nuevo",
    badgeVariant: "new",
  },
  { to: "/store/clients", icon: Users, label: "Clientes" },
  { to: "/store/designs", icon: Layers, label: "Diseños" },
  { to: "/store/templates", icon: LayoutGrid, label: "Plantillas" },
  { to: "/store/discounts", icon: Tag, label: "Descuentos" },
  { to: "/store/marketing", icon: Megaphone, label: "Marketing" },
  { to: "/store/reports", icon: BarChart3, label: "Reportes" },
  { to: "/store/finances", icon: DollarSign, label: "Finanzas" },
  { to: "/store/shipping", icon: Truck, label: "Envíos" },
  { to: "/store/online", icon: Globe, label: "Tienda Online" },
  { to: "/store/settings", icon: Settings, label: "Configuración" },
];

interface StoreSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function StoreSidebar({
  collapsed = false,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: StoreSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
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
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div
          className={cn(
            "relative flex h-16 shrink-0 items-center border-b border-[var(--border)]",
            collapsed ? "justify-center px-0" : "justify-between px-4",
          )}
        >
          {!collapsed ? (
            <Link to="/store/dashboard" className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-[var(--primary)] text-sm font-extrabold text-[var(--text-inverse)] shadow-subtle">
                P
              </span>
              <div className="min-w-0">
                <span className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                  Print<span className="text-[var(--primary)]">Shop</span>
                </span>
                <p className="-mt-0.5 text-[9px] leading-none text-[var(--text-muted)]">Diseña sin límites</p>
              </div>
            </Link>
          ) : (
            <Link
              to="/store/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-control bg-[var(--primary)] text-sm font-extrabold text-[var(--text-inverse)] shadow-subtle"
              title="PrintShop Tienda"
            >
              P
            </Link>
          )}

          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="absolute right-[-11px] top-1/2 z-[60] hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-control border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] shadow-subtle transition-all duration-normal active:scale-[0.96] motion-reduce:active:scale-100 hover:bg-[var(--surface-strong)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2 lg:flex"
              title={collapsed ? "Expandir menú" : "Contraer menú"}
            >
              {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-2",
            collapsed ? "px-2" : "px-3",
          )}
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
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
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[var(--primary)]" />}

                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]",
                      )}
                      strokeWidth={1.75}
                    />

                    {!collapsed && <span className="flex-1 truncate transition-opacity duration-200">{item.label}</span>}

                    {!collapsed && item.badge && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold leading-none",
                          item.badgeVariant === "new" ? "bg-[var(--success)] text-[var(--text-inverse)]" : "bg-[var(--surface-strong)] text-[var(--primary)]",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}

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
        </nav>

        <div className="border-t border-[var(--border)] p-2 transition-all duration-normal">
          <div
            className={cn(
              "group relative overflow-hidden bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] transition-all duration-normal",
              collapsed ? "mx-auto flex h-9 w-9 items-center justify-center rounded-control" : "flex w-full flex-col justify-between rounded-control p-3",
            )}
          >
            <div className={cn("flex items-center", collapsed ? "justify-center" : "mb-1.5 gap-2")}>
              <Crown className={cn("shrink-0 text-[#D97706]", collapsed ? "h-4 w-4" : "h-3.5 w-3.5")} />
              <div
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-normal",
                  collapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100 delay-75",
                )}
              >
                <span className="text-[11px] font-bold leading-none text-[#92400E]">Plan Profesional</span>
              </div>
            </div>

            <div
              className={cn(
                "overflow-hidden transition-all duration-normal",
                collapsed ? "max-h-0 opacity-0 pointer-events-none" : "max-h-24 opacity-100 delay-75",
              )}
            >
              <p className="mb-2.5 whitespace-nowrap text-[10px] text-[#78350F]">Renueva el 15 Jun, 2026</p>
              <Link
                to="/store/settings"
                className="flex w-full items-center justify-center gap-1.5 rounded-[5px] bg-white/70 py-1.5 text-[10.5px] font-semibold text-[#92400E] transition-colors hover:bg-white"
              >
                <span>Ver mi plan</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {collapsed && (
              <>
                <Link to="/store/settings" className="absolute inset-0 z-10" title="Plan Profesional" />
                <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-sm bg-[var(--text-primary)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-inverse)] opacity-0 shadow-md transition-all duration-normal group-hover:opacity-100">
                  Plan Profesional
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[var(--text-primary)]" />
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default StoreSidebar;
