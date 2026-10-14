import * as React from "react";
import {
  Bell,
  MessageSquare,
  HelpCircle,
  Menu,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { setDesignerActiveModule } from "@/features/designer/utils/designer-module-context";
import UserAvatar from "./UserAvatar";

interface StoreTopbarProps {
  onToggleSidebar?: () => void;
  onMobileMenuOpen?: () => void;
}

export const StoreTopbar: React.FC<StoreTopbarProps> = ({
  onMobileMenuOpen,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);
  const documentId = new URLSearchParams(location.search).get("document");
  const isAdvancedDesigner = location.pathname === "/store/designer/advanced" || location.pathname === "/designerv/advanced";
  const isDesignerEntry = location.pathname === "/store/designerv" || location.pathname.startsWith("/designerv");

  React.useEffect(() => {
    if (!isUserMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleEasyMode = () => {
    setIsUserMenuOpen(false);
    if (isAdvancedDesigner) {
      window.dispatchEvent(new CustomEvent("designer3:switch-to-easy"));
      return;
    }
    navigate({
      pathname: "/designerv/easy",
      search: documentId ? `?document=${encodeURIComponent(documentId)}` : "",
    });
  };

  const handleAdvancedMode = () => {
    setIsUserMenuOpen(false);
    setDesignerActiveModule("store");
    navigate({
      pathname: "/designerv/advanced",
      search: documentId ? `?document=${encodeURIComponent(documentId)}` : "",
    }, { state: { fromModule: "store" } });
  };

  return (
    <header className="z-[60] flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:px-6">
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

        <div ref={userMenuRef} className="relative ml-1 flex items-center gap-2 border-l border-[var(--border)] pl-2">
          {isAdvancedDesigner ? (
            <>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((open) => !open)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                aria-label="Más opciones"
                className="flex h-9 w-9 items-center justify-center rounded-control text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {isUserMenuOpen && (
                <div
                  role="menu"
                  aria-label="Opciones del diseñador avanzado"
                  className="absolute right-0 top-full z-[70] mt-2 w-44 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate("/workspace");
                    }}
                    className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    <span>Cambiar espacio</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleEasyMode}
                    className="flex w-full items-center rounded-[8px] px-3 py-2 text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    Modo fácil
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (!isDesignerEntry) setIsUserMenuOpen((open) => !open);
                }}
                aria-expanded={!isDesignerEntry && isUserMenuOpen}
                aria-haspopup={isDesignerEntry ? undefined : "menu"}
                aria-label={isDesignerEntry ? "Juan Pérez, Vendedor" : "Abrir menú del usuario"}
                className="flex items-center gap-2 rounded-control text-left transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
              >
                <UserAvatar name="Juan Pérez" className="h-8 w-8" iconClassName="h-4 w-4" />
                <div className="hidden flex-col sm:flex">
                  <span className="text-[11.5px] font-semibold leading-tight text-[var(--text-primary)]">Juan Pérez</span>
                  <span className="text-[10px] leading-tight text-[var(--text-secondary)]">Vendedor</span>
                </div>
                {!isDesignerEntry && (
                  <ChevronDown className="hidden h-3.5 w-3.5 text-[var(--text-secondary)] sm:block" />
                )}
              </button>

              {!isDesignerEntry && isUserMenuOpen && (
                <div
                  role="menu"
                  aria-label="Menú de usuario"
                  className="absolute right-0 top-full z-[70] mt-2 w-48 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleEasyMode}
                    className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    <span>Modo fácil</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleAdvancedMode}
                    className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    <span>Modo avanzado</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default StoreTopbar;
