import * as React from "react";
import { Search, Bell, MessageSquare, HelpCircle, Menu } from "lucide-react";
import UserAvatar from "./UserAvatar";

interface StoreTopbarProps {
  onToggleSidebar?: () => void;
  onMobileMenuOpen?: () => void;
}

export const StoreTopbar: React.FC<StoreTopbarProps> = ({
  onMobileMenuOpen,
  onToggleSidebar,
}) => {
  return (
    <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuOpen || onToggleSidebar}
          aria-label="Abrir menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] transition-all duration-normal hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

   
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          title="Notificaciones"
          aria-label="Notificaciones"
          className="relative flex h-9 w-9 items-center justify-center rounded-control border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] transition-all duration-normal hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[8.5px] font-bold leading-none text-[var(--text-inverse)]">
            9
          </span>
        </button>

        <button
          type="button"
          title="Mensajes"
          aria-label="Mensajes"
          className="relative flex h-9 w-9 items-center justify-center rounded-control border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] transition-all duration-normal hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[8.5px] font-bold leading-none text-[var(--text-inverse)]">
            3
          </span>
        </button>

        <button
          type="button"
          title="Ayuda"
          aria-label="Ayuda"
          className="flex h-9 w-9 items-center justify-center rounded-control border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] transition-all duration-normal hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <div className="ml-1 flex items-center gap-2 border-l border-[var(--border)] pl-2">
          <UserAvatar name="Juan Pérez" className="h-8 w-8" iconClassName="h-4 w-4" />
          <div className="hidden flex-col sm:flex">
            <span className="text-[11.5px] font-semibold leading-tight text-[var(--text-primary)]">Juan Pérez</span>
            <span className="text-[10px] leading-tight text-[var(--text-secondary)]">Vendedor</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StoreTopbar;
