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
      <Container variant="wide" className="flex flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 lg:gap-4">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Logo className="shrink-0" />
          </div>

          {/* Nav — centered with optical spacing */}
          <div className="hidden min-w-0 flex-1 items-center justify-center px-4 lg:flex xl:px-8">
            <NavLinks className="justify-center" />
          </div>

          {/* Actions — right, visually separated */}
          <div className="ml-auto hidden items-center lg:flex">
            <UserActions className="shrink-0" />
          </div>

          {/* Mobile actions + menu toggle */}
          <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-2 lg:hidden">
            <UserActions className="shrink-0" compact />
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/80 transition-all duration-150 hover:bg-black/[0.05] hover:text-foreground active:scale-90"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-black/[0.06] pb-5 pt-3 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <NavLinks className="flex-col items-start gap-1 pt-1" />
              <div className="mt-4 border-t border-black/[0.06] pt-4">
                <UserActions className="w-full flex-wrap justify-start gap-3" compact={false} />
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};
