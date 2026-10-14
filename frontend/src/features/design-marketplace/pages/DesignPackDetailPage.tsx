import * as React from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FileArchive, FileImage, LockKeyhole } from 'lucide-react';
import { DesignMarketplaceShell, MarketplaceNotice } from '../components/DesignMarketplaceShell';
import { DesignPackMedia, useMarketplaceAssetUrl } from '../components/DesignPackMedia';
import { PackAccessLabel } from '../components/DesignPackCard';
import { downloadMarketplacePack, setPendingMarketplaceAction } from '../services/design-marketplace-repository';
import { useDesignMarketplaceStore } from '../store/design-marketplace-store';

export function DesignPackDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const packs = useDesignMarketplaceStore((state) => state.packs);
  const session = useDesignMarketplaceStore((state) => state.session);
  const acquisitions = useDesignMarketplaceStore((state) => state.acquisitions);
  const acquirePack = useDesignMarketplaceStore((state) => state.acquirePack);
  const pack = packs.find((item) => item.id === id);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const owned = Boolean(pack && acquisitions.some((item) => item.packId === pack.id));
  const gallery = pack ? [pack.cover, ...pack.previews].filter(Boolean) : [];
  const activeAsset = gallery[activeIndex] ?? gallery[0];
  const activeUrl = useMarketplaceAssetUrl(activeAsset);

  React.useEffect(() => setActiveIndex(0), [pack?.id]);

  if (!pack || pack.status !== 'published') {
    return <DesignMarketplaceShell><div className="marketplace-main"><section className="marketplace-empty"><LockKeyhole aria-hidden="true" /><h1>Pack no disponible</h1><p>Este recurso no existe o todavía no está publicado en el catálogo.</p><Link to="/designs" className="marketplace-button marketplace-button-primary mt-5">Volver al catálogo</Link></section></div></DesignMarketplaceShell>;
  }

  const handleAccess = () => {
    setError('');
    if (!session) {
      setPendingMarketplaceAction({ packId: pack.id, returnTo: location.pathname });
      navigate(`/designs/access?returnTo=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (pack.access === 'free') {
      acquirePack(pack);
      setMessage('Pack añadido a tu biblioteca. Puedes descargar sus originales cuando quieras.');
      return;
    }
    setConfirmOpen(true);
  };

  const confirmPurchase = () => {
    try {
      acquirePack(pack);
      setConfirmOpen(false);
      setMessage('Pack añadido a tu biblioteca.');
    } catch (purchaseError) {
      setError(purchaseError instanceof Error ? purchaseError.message : 'No se pudo registrar la adquisición.');
    }
  };

  const download = async () => {
    await downloadMarketplacePack(pack);
    setMessage(`Descarga iniciada para “${pack.title}”. Los archivos originales no fueron transformados.`);
  };

  return (
    <DesignMarketplaceShell>
      <div className="marketplace-main">
        <Link to="/designs" className="marketplace-back-link">← Volver al catálogo</Link>
        <div className="marketplace-detail-grid mt-7">
          <div className="marketplace-detail-gallery">
            <div className="marketplace-detail-thumbs" aria-label="Vistas previas del pack">
              {gallery.map((asset, index) => <button key={asset?.id ?? index} type="button" className={`marketplace-detail-thumb${index === activeIndex ? ' is-active' : ''}`} onClick={() => setActiveIndex(index)} aria-label={`Ver vista previa ${index + 1}`}><DesignPackMedia pack={pack} asset={asset} alt={`Vista previa ${index + 1} de ${pack.title}`} /></button>)}
            </div>
            <div className="marketplace-detail-main-image">
              {activeUrl ? <img src={activeUrl} alt={`Vista previa principal de ${pack.title}`} /> : <DesignPackMedia pack={pack} asset={activeAsset} alt={`Vista previa de ${pack.title}`} />}
            </div>
          </div>

          <section className="marketplace-detail-copy" aria-labelledby="pack-title">
            <PackAccessLabel pack={pack} />
            <h1 id="pack-title" className="mt-4">{pack.title}</h1>
            <p className="marketplace-detail-byline"><span>Por {pack.creatorName}</span><span>{pack.category}</span></p>
            <p>{pack.description}</p>
            <div className="marketplace-detail-price">{pack.access === 'free' ? 'Gratis' : `$ ${pack.price.toLocaleString('es-MX')} ${pack.currency}`}<span className="ml-2 text-xs font-normal text-foregroundSubtle">pago único</span></div>
            {message ? <MarketplaceNotice tone="success">{message}</MarketplaceNotice> : null}
            {error ? <MarketplaceNotice tone="error">{error}</MarketplaceNotice> : null}
            <div className="marketplace-detail-actions">
              {owned ? <button type="button" className="marketplace-button marketplace-button-primary" onClick={download}>Descargar originales</button> : <button type="button" className="marketplace-button marketplace-button-primary" onClick={handleAccess}>{pack.access === 'free' ? 'Obtener gratis' : 'Comprar pack'}</button>}
              {owned ? <Link to="/designs/library" className="marketplace-button marketplace-button-secondary">Abrir biblioteca</Link> : null}
            </div>
            <dl className="marketplace-detail-facts">
              <div className="marketplace-detail-fact"><dt>Contenido</dt><dd>{pack.designCount} diseños</dd></div>
              <div className="marketplace-detail-fact"><dt>Formatos</dt><dd>{pack.formats.join(' · ')}</dd></div>
              <div className="marketplace-detail-fact"><dt>Entrega</dt><dd>Descarga desde biblioteca</dd></div>
              <div className="marketplace-detail-fact"><dt>Calidad</dt><dd>Originales sin aplanar</dd></div>
            </dl>
          </section>
        </div>

        <div className="marketplace-detail-sections">
          <section className="marketplace-detail-section"><h2>Qué incluye</h2><ul>{pack.contents.map((content) => <li key={content}>{content}</li>)}</ul></section>
          <section className="marketplace-detail-section"><h2>Formatos</h2><p>Los formatos publicados corresponden a los archivos originales del pack. Las vistas previas solo sirven para mostrar el contenido antes de adquirirlo.</p><p><strong className="text-foreground">{pack.formats.join(' · ')}</strong></p></section>
          <section className="marketplace-detail-section"><h2>Condiciones de uso</h2><p>{pack.license}</p><div className="marketplace-file-list">{pack.originals.map((file) => <div key={file.id} className="marketplace-file-row"><span>{file.mimeType.includes('zip') ? <FileArchive aria-hidden="true" /> : <FileImage aria-hidden="true" />} {file.name}</span><span>{file.sizeBytes ? `${Math.round(file.sizeBytes / 1024)} KB` : 'Archivo original'}</span></div>)}</div></section>
        </div>
      </div>

      {confirmOpen ? <div className="marketplace-modal-backdrop" role="presentation"><section className="marketplace-modal-card" role="dialog" aria-modal="true" aria-labelledby="purchase-title"><h2 id="purchase-title">Confirmar compra</h2><p>“{pack.title}” quedará disponible en la biblioteca de {session?.email} después de confirmar.</p><div className="marketplace-modal-actions"><button type="button" className="marketplace-button marketplace-button-secondary" onClick={() => setConfirmOpen(false)}>Cancelar</button><button type="button" className="marketplace-button marketplace-button-primary" onClick={confirmPurchase}>Confirmar adquisición</button></div></section></div> : null}
    </DesignMarketplaceShell>
  );
}
