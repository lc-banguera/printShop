import * as React from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Container } from '@/shared/components/Container';
import { Logo } from './Logo';
import { UserActions } from './UserActions';
import { NavLinks } from './NavLinks';

interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Navbar: React.FC<NavbarProps> = ({ className, ...props }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className={cn('select-none bg-transparent', className)} {...props}>
      <Container variant="wide" className="flex flex-col px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-3 lg:gap-4 lg:py-3.5">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Logo className="shrink-0" />
          </div>

          {/* Nav — centered, takes available space */}
          <div className="hidden min-w-0 flex-1 items-center justify-center px-6 lg:flex xl:px-10">
            <NavLinks className="justify-center" />
          </div>

          {/* Actions — right, visually separated from nav */}
          <div className="ml-auto hidden items-center lg:flex">
            <UserActions className="shrink-0" />
          </div>

          <div className="ml-auto flex items-center justify-end gap-2 lg:hidden">
            <UserActions className="shrink-0" compact />
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors duration-200 hover:bg-surfaceMuted hover:text-foreground active:scale-95"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-borderMuted pb-4 pt-3 lg:hidden">
            <div>
              <NavLinks className="flex-col items-start gap-1.5 pt-1" />
              <div className="mt-4 pt-4">
                <UserActions className="w-full flex-wrap justify-start gap-y-3" compact={false} />
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};
