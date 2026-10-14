import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, LogOut, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { headerData } from '../../data/header.data';
import { useCartStore } from '@/features/cart';
import { hasSellerProfile, useAuthStore } from '@/features/auth';
import { useFavoritesStore } from '@/features/favorites';

interface UserActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

export const UserActions: React.FC<UserActionsProps> = ({ className, compact = false, ...divProps }) => {
  const openDrawer = useCartStore((s) => s.openDrawer);
  const totalCartItems = useCartStore((s) => s.getTotalItemsCount());
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement>(null);
  const accountTriggerRef = React.useRef<HTMLButtonElement>(null);
  const favoritesCount = useFavoritesStore((s) => s.getFavoritesCount(user?.id));

  React.useEffect(() => {
    if (!accountMenuOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false);
        accountTriggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountMenuOpen]);

  React.useEffect(() => {
    setAccountMenuOpen(false);
  }, [isAuthenticated, user?.id]);

  const closeAccountMenu = () => setAccountMenuOpen(false);
  const handleLogout = () => {
    closeAccountMenu();
    logout();
    navigate('/', { replace: true });
  };

  const actionLinkClass =
    'relative flex min-h-9 items-center gap-1.5 rounded-full px-1.5 sm:px-2.5 py-1.5 text-[13px] font-medium tracking-[-0.01em] text-foreground/80 transition-all duration-150 hover:bg-black/[0.05] hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

  const iconBadgeClass =
    'absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-white shadow-sm ring-2 ring-white';

  return (
    <div className={cn('flex items-center gap-1.5 sm:gap-2 lg:gap-3', className)} {...divProps}>
      <Link
        to="/favorites"
        className={actionLinkClass}
        title="Ver mis favoritos"
        aria-label="Mis favoritos"
      >
        <div className="relative flex items-center justify-center">
          <Heart className="h-4 w-4 text-current" strokeWidth={1.8} />
          {isAuthenticated && favoritesCount > 0 && <span className={iconBadgeClass}>{favoritesCount}</span>}
        </div>
        {!compact && <span className="hidden sm:inline">{headerData.favoritesLabel}</span>}
      </Link>

      <button
        type="button"
        onClick={openDrawer}
        className={actionLinkClass}
        title="Ver carrito de compras"
        aria-label="Abrir carrito de compras"
      >
        <div className="relative flex items-center justify-center">
          <ShoppingCart className="h-4 w-4 text-current" strokeWidth={1.8} />
          {totalCartItems > 0 && <span className={iconBadgeClass}>{totalCartItems}</span>}
        </div>
        {!compact && <span className="hidden sm:inline">{headerData.cartLabel}</span>}
      </button>

      {!isAuthenticated ? (
        <div className={cn("items-center gap-2", compact ? "hidden sm:flex" : "flex")}>
          <Link
            to="/login"
            className={actionLinkClass}
          >
            <User className="h-4 w-4 text-current" strokeWidth={1.8} />
            {!compact && <span>{headerData.loginLabel}</span>}
          </Link>

          <Link
            to="/register"
            className={cn(
              'flex min-h-9 items-center justify-center rounded-[5px] bg-primary px-4 py-1.5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(93,70,232,0.25)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#503cd4] hover:shadow-[0_6px_16px_rgba(93,70,232,0.32)] active:translate-y-0 active:scale-[0.96]',
              compact && 'px-3 py-1 text-xs',
            )}
          >
            {headerData.registerLabel}
          </Link>
        </div>
      ) : (
        <div ref={accountMenuRef} className="relative">
          <button
            ref={accountTriggerRef}
            type="button"
            className={cn(actionLinkClass, 'gap-2')}
            title="Abrir menú de cuenta"
            aria-label="Abrir menú de cuenta"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            onClick={() => setAccountMenuOpen((open) => !open)}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-3.5 w-3.5 text-current" strokeWidth={2} />
            </div>
            {!compact && <span className="hidden max-w-[140px] truncate sm:inline font-medium">{user?.name || user?.email || 'Mi cuenta'}</span>}
          </button>

          {accountMenuOpen && (
            <div
              role="menu"
              aria-label="Menú de cuenta"
              className="absolute right-0 top-full z-[60] mt-2 w-64 rounded-2xl border border-black/[0.08] bg-white p-2 shadow-[0_16px_36px_rgba(15,23,42,0.14)]"
            >
              <div className="border-b border-black/[0.06] px-3 py-2">
                <p className="truncate text-sm font-semibold text-foreground">{user?.name || user?.email || 'Mi cuenta'}</p>
                {user?.name && <p className="truncate text-xs text-foreground/60">{user.email}</p>}
              </div>
              <Link
                to="/account"
                role="menuitem"
                onClick={closeAccountMenu}
                className="mt-1 flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/80 hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Ir a mi cuenta de cliente
              </Link>
              {hasSellerProfile(user) && (
                <Link
                  to="/workspace"
                  role="menuitem"
                  onClick={closeAccountMenu}
                  className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/80 hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Cambiar espacio
                </Link>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/80 hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
