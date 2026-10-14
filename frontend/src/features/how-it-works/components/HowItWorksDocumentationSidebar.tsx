import { BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { howItWorksModules } from '../data/how-it-works.data';

export function HowItWorksDocumentationSidebar() {
  const location = useLocation();

  return (
    <aside className="how-it-works-doc-sidebar" aria-label="Documentación por módulo">
      <div className="how-it-works-doc-sidebar-heading">
        <BookOpen aria-hidden="true" />
        <span>Documentación</span>
      </div>
      <nav>
        {howItWorksModules.map((module) => {
          const href = `/como-funciona/documentacion/${module.articleSlug}`;
          const active = location.pathname === href;
          return (
            <Link key={module.slug} className={active ? 'is-active' : undefined} to={href} aria-current={active ? 'page' : undefined}>
              {module.title}
            </Link>
          );
        })}
      </nav>
      <Link className="how-it-works-doc-sidebar-back" to="/como-funciona">Volver a Cómo funciona</Link>
    </aside>
  );
}
