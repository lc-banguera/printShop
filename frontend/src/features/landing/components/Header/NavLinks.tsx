import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { headerData } from '../../data/header.data';

interface NavLinksProps extends React.HTMLAttributes<HTMLElement> {}

export const NavLinks: React.FC<NavLinksProps> = ({ className, ...props }) => {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  const navLinkClass = (isActive: boolean, isDropdownTrigger = false) =>
    cn(
      'relative flex min-h-9 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] font-semibold leading-none text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focusRing',
      isActive && 'text-[var(--primary)] font-semibold',
      isDropdownTrigger && 'rounded-md',
    );

  return (
    <nav
      className={cn(
        'flex min-w-0 w-full flex-wrap items-center justify-start gap-x-2 gap-y-1 text-[13px] font-semibold text-[var(--text-secondary)] lg:flex-nowrap lg:justify-center lg:gap-x-1 xl:gap-x-2',
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
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="menu"
              onClick={() => setOpenDropdown((current) => (current === item.label ? null : item.label))}
              className={navLinkClass(false, true)}
            >
              <span>{item.label}</span>
              <ChevronDown className={cn('h-3.5 w-3.5 text-current transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>

            {isOpen && item.dropdownItems && (
              <div
                className="absolute left-0 top-full z-50 mt-2 min-w-[210px] rounded-xl border border-border bg-white/95 py-1.5 shadow-[0_14px_34px_rgba(22,24,35,0.12)] backdrop-blur-xl"
                role="menu"
              >
                {item.dropdownItems.map((subItem) => (
                  <Link
                    key={subItem.label}
                    to={subItem.href}
                    role="menuitem"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2 text-xs text-foreground/75 transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focusRing"
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
