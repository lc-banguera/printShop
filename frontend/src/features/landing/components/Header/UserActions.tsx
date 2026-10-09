import * as React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { headerData } from '../../data/header.data';
import { useCartStore } from '@/features/cart';
import { useAuthStore } from '@/features/auth';
import { useFavoritesStore } from '@/features/favorites';

interface UserActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

export const UserActions: React.FC<UserActionsProps> = ({ className, compact = false, ...divProps }) => {
  const openDrawer = useCartStore((s) => s.openDrawer);
  const totalCartItems = useCartStore((s) => s.getTotalItemsCount());
  const { isAuthenticated, user } = useAuthStore();
  const favoritesCount = useFavoritesStore((s) => s.getFavoritesCount(user?.id));

  const actionLinkClass =
    'flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--primary)]';

  const iconBadgeClass =
    'absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[9px] font-bold leading-none text-white';

  return (
    <div className={cn('flex items-center gap-3 sm:gap-4 lg:gap-5', className)} {...divProps}>
      <Link
        to="/favorites"
        className={cn(actionLinkClass, 'relative')}
        title="Ver mis favoritos"
        aria-label="Mis favoritos"
      >
        <div className="relative">
          <Heart className="h-4 w-4 text-current" />
          {isAuthenticated && favoritesCount > 0 && <span className={iconBadgeClass}>{favoritesCount}</span>}
        </div>
        {!compact && <span className="hidden sm:inline">{headerData.favoritesLabel}</span>}
      </Link>

      <button
        type="button"
        onClick={openDrawer}
        className={cn(actionLinkClass, 'relative')}
        title="Ver carrito de compras"
        aria-label="Abrir carrito de compras"
      >
        <div className="relative">
          <ShoppingCart className="h-4 w-4 text-current" />
          {totalCartItems > 0 && <span className={iconBadgeClass}>{totalCartItems}</span>}
        </div>
        {!compact && <span className="hidden sm:inline">{headerData.cartLabel}</span>}
      </button>

      {!isAuthenticated ? (
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/login"
            className={cn(
              actionLinkClass,
              'gap-1.5 py-1.5',
            )}
          >
            <User className="h-4 w-4 text-current" />
            {!compact && <span>{headerData.loginLabel}</span>}
          </Link>

          <Link
            to="/register"
            className="flex items-center justify-center rounded-[9px] bg-[var(--primary)] px-4 py-2 text-[13.5px] font-semibold text-white shadow-[0_2px_8px_rgba(93,70,232,0.25)] transition-all duration-200 hover:bg-[var(--primary-hover)] hover:scale-[1.02] sm:px-4.5 sm:py-2.5"
          >
            {headerData.registerLabel}
          </Link>
        </div>
      ) : (
        <Link
          to="/account"
          className={cn(actionLinkClass, 'gap-1.5')}
          title="Mi cuenta"
          aria-label="Mi cuenta"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surfaceMuted text-foregroundMuted">
            <User className="h-3.5 w-3.5 text-current" />
          </div>
          {!compact && <span className="hidden sm:inline">{user?.name || 'Mi cuenta'}</span>}
        </Link>
      )}
    </div>
  );
};
