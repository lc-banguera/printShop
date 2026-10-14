import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit3, Eye, Trash2 } from 'lucide-react';
import { MarketplaceSectionHeading, MarketplaceNotice } from '../components/DesignMarketplaceShell';
import { DesignPackMedia } from '../components/DesignPackMedia';
import { removeMarketplacePack } from '../services/design-marketplace-repository';
import { useDesignMarketplaceStore } from '../store/design-marketplace-store';

function statusLabel(status: string) { return status === 'published' ? 'Publicado' : status === 'draft' ? 'Borrador' : status === 'pending_review' ? 'Pendiente de revisión' : 'Rechazado'; }

export function DesignCreatorPacksPage() {
  const navigate = useNavigate();
  const profile = useDesignMarketplaceStore((state) => state.profile);
  const packs = useDesignMarketplaceStore((state) => state.packs).filter((pack) => pack.creatorId === profile?.id);
  const refresh = useDesignMarketplaceStore((state) => state.refresh);
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [message, setMessage] = React.useState('');
  const filtered = packs.filter((pack) => (!query || `${pack.title} ${pack.category}`.toLowerCase().includes(query.toLowerCase())) && (status === 'all' || pack.status === status));

  const remove = (id: string) => {
    if (!window.confirm('¿Eliminar este borrador? Esta acción no se puede deshacer.')) return;
    removeMarketplacePack(id);
    refresh();
    setMessage('Borrador eliminado.');
  };

  return <>
    <MarketplaceSectionHeading eyebrow="Publicaciones" title="Mis packs" description="Administra borradores, publicaciones visibles y contenido que requiere correcciones." action={<Link to="/designs/creator/packs/new" className="marketplace-button marketplace-button-primary">Nuevo pack</Link>} />
    {message ? <MarketplaceNotice tone="success">{message}</MarketplaceNotice> : null}
    <div className="marketplace-toolbar mt-7"><div className="marketplace-toolbar-group"><label className="marketplace-search"><span className="sr-only">Buscar publicaciones</span><input className="marketplace-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar mis packs" /></label></div><div className="marketplace-toolbar-group"><label><span className="sr-only">Filtrar estado</span><select className="marketplace-control" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos los estados</option><option value="draft">Borradores</option><option value="published">Publicados</option><option value="pending_review">Pendientes</option><option value="rejected">Rechazados</option></select></label></div></div>
    <div className="marketplace-table-wrap"><table className="marketplace-table"><thead><tr><th>Portada</th><th>Pack</th><th>Categoría</th><th>Acceso</th><th>Estado</th><th>Actualizado</th><th>Acciones</th></tr></thead><tbody>{filtered.map((pack) => <tr key={pack.id}><td><div className="marketplace-table-cover">{pack.cover ? <DesignPackMedia pack={pack} asset={pack.cover} alt={`Portada de ${pack.title}`} /> : <span className="marketplace-table-cover-fallback">Sin portada</span>}</div></td><td><strong>{pack.title}</strong><div className="marketplace-table-meta">{pack.designCount} diseños</div><div className="marketplace-table-meta">{pack.formats.join(', ') || 'Formato pendiente'}</div></td><td>{pack.category}</td><td>{pack.access === 'free' ? 'Gratis' : `$ ${pack.price.toLocaleString('es-MX')}`}</td><td><span className="marketplace-status">{statusLabel(pack.status)}</span></td><td>{new Date(pack.updatedAt).toLocaleDateString('es-MX')}</td><td><div className="marketplace-list-actions">{pack.status === 'published' ? <button type="button" className="marketplace-icon-button" title="Ver pack publicado" aria-label={`Ver ${pack.title}`} onClick={() => navigate(`/designs/pack/${pack.id}`)}><Eye aria-hidden="true" /></button> : null}<button type="button" className="marketplace-icon-button" title="Editar pack" aria-label={`Editar ${pack.title}`} onClick={() => navigate(`/designs/creator/packs/${pack.id}`)}><Edit3 aria-hidden="true" /></button><button type="button" className="marketplace-icon-button" title="Eliminar borrador" aria-label={`Eliminar ${pack.title}`} onClick={() => remove(pack.id)}><Trash2 aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div>
    {filtered.length === 0 ? <section className="marketplace-empty"><h2>No hay publicaciones que coincidan</h2><p>Ajusta la búsqueda o crea un nuevo pack para comenzar.</p></section> : null}
  </>;
}
