import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { headerData } from '../../data/header.data';

interface NavLinksProps extends React.HTMLAttributes<HTMLElement> {}

export const NavLinks: React.FC<NavLinksProps> = ({ className, ...props }) => {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const dropdownTriggerRef = React.useRef<HTMLButtonElement>(null);
  const location = useLocation();

  React.useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!openDropdown) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        dropdownTriggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdown]);

  const navLinkClass = (isActive: boolean, isDropdownTrigger = false) =>
    cn(
      'relative flex min-h-9 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium tracking-[-0.01em] text-foreground/80 transition-all duration-150 hover:bg-black/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.97]',
      isActive && 'text-primary font-semibold bg-primary/[0.07]',
      isDropdownTrigger && 'cursor-pointer',
    );

  return (
    <nav
      ref={navRef}
      className={cn(
        'flex min-w-0 w-full flex-wrap items-center justify-start gap-1 text-[13px] text-foreground/80 lg:flex-nowrap lg:justify-center',
        className,
      )}
      {...props}
    >
      {headerData.menuItems.map((item) => {
        if (!item.hasDropdown) {
          return (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) => navLinkClass(Boolean(isActive) && item.href === '/designs')}
            >
              {item.label}
            </NavLink>
          );
        }

        const isOpen = openDropdown === item.label;

        return (
          <div key={item.label} className="relative">
            <button
              ref={item.label === 'Categorías' ? dropdownTriggerRef : undefined}
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="menu"
              onClick={() => setOpenDropdown((current) => (current === item.label ? null : item.label))}
              className={navLinkClass(false, true)}
            >
              <span>{item.label}</span>
              <ChevronDown className={cn('h-3.5 w-3.5 text-current/70 transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>

            {isOpen && item.dropdownItems && (
              <div
                className="absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-2xl bg-white/95 p-1.5 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
                role="menu"
              >
                {item.dropdownItems.map((subItem) => (
                  <Link
                    key={subItem.label}
                    to={subItem.href}
                    role="menuitem"
                    onClick={() => setOpenDropdown(null)}
                    className="block rounded-xl px-3.5 py-2 text-xs font-medium tracking-[-0.01em] text-foreground/80 transition-colors duration-150 hover:bg-black/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
