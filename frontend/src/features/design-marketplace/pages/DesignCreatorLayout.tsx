import type { ReactNode } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, FilePlus2, FolderOpen, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { DesignMarketplaceShell } from '../components/DesignMarketplaceShell';
import { useDesignMarketplaceStore } from '../store/design-marketplace-store';

const creatorLinks = [
  { to: '/designs/creator', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/designs/creator/packs', label: 'Mis packs', icon: FolderOpen, end: true },
  { to: '/designs/creator/sales', label: 'Ventas', icon: BarChart3 },
  { to: '/designs/creator/profile', label: 'Perfil público', icon: UserRound },
];

export function DesignCreatorGuard({ children }: { children: ReactNode }) {
  const session = useDesignMarketplaceStore((state) => state.session);
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;
  return session ? <>{children}</> : <Navigate to={`/designs/access?returnTo=${encodeURIComponent(returnTo)}`} replace />;
}

export function DesignCreatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPackEditor = location.pathname.startsWith('/designs/creator/packs/') && location.pathname !== '/designs/creator/packs/new';
  const creatorLinkClass = (isActive: boolean) => `marketplace-creator-link${isActive ? ' is-active' : ''}`;
  const signOut = useDesignMarketplaceStore((state) => state.signOut);

  return (
    <DesignMarketplaceShell variant="creator">
      <div className="marketplace-creator-shell">
        <aside className="marketplace-creator-sidebar">
          <nav aria-label="Navegación del centro del creador">
            <div className="marketplace-sidebar-group">
              {creatorLinks.map(({ to, label, icon: Icon, end }) => <NavLink key={to} end={end} to={to} className={({ isActive }) => creatorLinkClass(isActive || (to === '/designs/creator/packs' && isPackEditor))}><Icon aria-hidden="true" /><span>{label}</span></NavLink>)}
              <Link to="/designs/creator/packs/new" className={creatorLinkClass(location.pathname === '/designs/creator/packs/new')}><FilePlus2 aria-hidden="true" /><span>Nuevo pack</span></Link>
            </div>
          </nav>
          <div className="marketplace-creator-session">
            <button type="button" className="marketplace-creator-link w-full" onClick={() => { signOut(); navigate('/designs'); }}><LogOut aria-hidden="true" /><span>Cerrar sesión</span></button>
          </div>
        </aside>
        <section className="marketplace-creator-content"><Outlet /></section>
      </div>
    </DesignMarketplaceShell>
  );
}
