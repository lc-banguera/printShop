import type { ReactNode } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FilePlus2, FolderOpen, LayoutDashboard, LogOut } from 'lucide-react';
import { ResourcesShell } from '../components/ResourcesShell';
import { useResourcesAuthStore } from '../store/resources-auth-store';

export function ResourcesCreatorGuard({ children }: { children: ReactNode }) {
  const session = useResourcesAuthStore((state) => state.session);
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;
  return session ? <>{children}</> : <Navigate to={`/resources/access?returnTo=${encodeURIComponent(returnTo)}`} replace />;
}

export function ResourcesCreatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const signOut = useResourcesAuthStore((state) => state.signOut);
  const editorOpen = location.pathname.includes('/resources/creator/resources/');
  const activeClass = (path: string, exact = false) => `resources-creator-link${(exact ? location.pathname === path : location.pathname.startsWith(path)) ? ' is-active' : ''}`;

  return (
    <ResourcesCreatorGuard>
      <ResourcesShell>
        <div className="resources-main resources-creator-main">
          <div className="resources-creator-nav" aria-label="Navegación del centro de publicación">
            <Link to="/resources/creator" className={activeClass('/resources/creator', true)}><LayoutDashboard aria-hidden="true" /> Resumen</Link>
            <Link to="/resources/creator/resources" className={`${activeClass('/resources/creator/resources')}${editorOpen ? ' is-active' : ''}`}><FolderOpen aria-hidden="true" /> Mis recursos</Link>
            <Link to="/resources/creator/resources/new" className={activeClass('/resources/creator/resources/new', true)}><FilePlus2 aria-hidden="true" /> Nuevo recurso</Link>
            <button type="button" className="resources-creator-link resources-creator-signout" onClick={() => { signOut(); navigate('/resources'); }}><LogOut aria-hidden="true" /> Cerrar sesión</button>
          </div>
          <section className="resources-creator-content"><Outlet /></section>
        </div>
      </ResourcesShell>
    </ResourcesCreatorGuard>
  );
}
