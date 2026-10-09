import * as React from "react";
import { Bell, Menu } from "lucide-react";

interface TopbarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  onMobileMenuOpen?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  onMobileMenuOpen,
}) => {
  return (
    <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuOpen || onToggleSidebar}
          aria-label="Abrir menú"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] transition-all duration-normal active:scale-[0.96] motion-reduce:active:scale-100 hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          title="Notificaciones"
          aria-label="Notificaciones"
          className="relative flex h-9 w-9 items-center justify-center rounded-control border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] transition-all duration-normal active:scale-[0.96] motion-reduce:active:scale-100 hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[8.5px] font-bold leading-none text-[var(--text-inverse)]">
            4
          </span>
        </button>

        <div className="flex items-center pl-1.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-semibold text-[var(--text-inverse)] shadow-subtle"
            title="Luis Carlos Banguera"
            aria-label="Luis Carlos Banguera"
          >
            LB
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
