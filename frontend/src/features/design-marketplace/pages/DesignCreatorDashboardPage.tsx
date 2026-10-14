import { Link } from 'react-router-dom';
import { PackageCheck } from 'lucide-react';
import { MarketplaceSectionHeading } from '../components/DesignMarketplaceShell';
import { useDesignMarketplaceStore } from '../store/design-marketplace-store';

export function DesignCreatorDashboardPage() {
  const profile = useDesignMarketplaceStore((state) => state.profile);
  const packs = useDesignMarketplaceStore((state) => state.packs).filter((pack) => pack.creatorId === profile?.id);
  const sales = useDesignMarketplaceStore((state) => state.sales);
  const published = packs.filter((pack) => pack.status === 'published');
  const drafts = packs.filter((pack) => pack.status === 'draft');
  const pending = packs.filter((pack) => pack.status === 'pending_review');
  const rejected = packs.filter((pack) => pack.status === 'rejected');
  const recent = [...packs].sort((first, second) => second.updatedAt.localeCompare(first.updatedAt)).slice(0, 5);

  return (
    <>
      <MarketplaceSectionHeading eyebrow="Centro del creador" title={`Hola, ${profile?.publicName ?? 'creador'}`} description="Gestiona tus publicaciones, conserva tus borradores y revisa las adquisiciones de tus packs." action={<Link to="/designs/creator/packs/new" className="marketplace-button marketplace-button-primary">Crear pack</Link>} />
      <div className="marketplace-stat-grid">
        <div className="marketplace-stat"><span className="marketplace-stat-label">Packs publicados</span><div className="marketplace-stat-value">{published.length}</div><span className="marketplace-stat-note">Visibles en catálogo</span></div>
        <div className="marketplace-stat"><span className="marketplace-stat-label">Borradores</span><div className="marketplace-stat-value">{drafts.length}</div><span className="marketplace-stat-note">Listos para retomar</span></div>
        <div className="marketplace-stat"><span className="marketplace-stat-label">Pendientes</span><div className="marketplace-stat-value">{pending.length}</div><span className="marketplace-stat-note">En revisión</span></div>
        <div className="marketplace-stat"><span className="marketplace-stat-label">Adquisiciones</span><div className="marketplace-stat-value">{sales.length}</div><span className="marketplace-stat-note">Accesos registrados</span></div>
      </div>
      <div className="marketplace-creator-grid">
        <section className="marketplace-panel"><div className="marketplace-panel-heading"><h2>Actividad de publicaciones</h2><Link to="/designs/creator/packs" className="marketplace-button marketplace-button-ghost">Ver todos</Link></div>{recent.length ? <div className="marketplace-list">{recent.map((pack) => <div key={pack.id} className="marketplace-list-row"><div><strong>{pack.title}</strong><span>{pack.status === 'published' ? 'Publicado' : pack.status === 'draft' ? 'Borrador' : pack.status === 'pending_review' ? 'Pendiente de revisión' : 'Rechazado'}</span><span className="marketplace-list-row-meta">Actualizado {new Date(pack.updatedAt).toLocaleDateString('es-MX')}</span></div><Link to={`/designs/creator/packs/${pack.id}`} className="marketplace-button marketplace-button-secondary">Editar</Link></div>)}</div> : <div className="marketplace-empty"><PackageCheck aria-hidden="true" /><h2>Tu centro empieza aquí</h2><p>Crea tu primer pack para verlo aparecer en este resumen y en el catálogo.</p><Link to="/designs/creator/packs/new" className="marketplace-button marketplace-button-primary mt-4">Crear primer pack</Link></div>}</section>
        <section className="marketplace-panel"><h2>Estados de tu contenido</h2><div className="marketplace-list"><div className="marketplace-list-row"><div><strong>Publicado</strong><span>Visible para compradores</span></div><strong>{published.length}</strong></div><div className="marketplace-list-row"><div><strong>Borrador</strong><span>Solo visible para ti</span></div><strong>{drafts.length}</strong></div><div className="marketplace-list-row"><div><strong>Pendiente</strong><span>En proceso de revisión</span></div><strong>{pending.length}</strong></div><div className="marketplace-list-row"><div><strong>Rechazado</strong><span>Requiere corrección</span></div><strong>{rejected.length}</strong></div></div></section>
      </div>
    </>
  );
}
