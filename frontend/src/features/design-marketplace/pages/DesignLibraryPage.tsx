import * as React from 'react';
import { Link } from 'react-router-dom';
import { Library, LockKeyhole } from 'lucide-react';
import { DesignMarketplaceShell, MarketplaceSectionHeading, MarketplaceNotice } from '../components/DesignMarketplaceShell';
import { DesignPackCard } from '../components/DesignPackCard';
import { downloadMarketplacePack } from '../services/design-marketplace-repository';
import { useDesignMarketplaceStore } from '../store/design-marketplace-store';

export function DesignLibraryPage() {
  const session = useDesignMarketplaceStore((state) => state.session);
  const packs = useDesignMarketplaceStore((state) => state.packs);
  const acquisitions = useDesignMarketplaceStore((state) => state.acquisitions);
  const [message, setMessage] = React.useState('');
  const ownedPacks = packs.filter((pack) => acquisitions.some((item) => item.packId === pack.id));

  if (!session) {
    return <DesignMarketplaceShell><div className="marketplace-main"><section className="marketplace-empty"><LockKeyhole aria-hidden="true" /><h1>Tu biblioteca es privada</h1><p>Accede con el correo independiente del marketplace para consultar tus packs adquiridos.</p><Link to="/designs/access" className="marketplace-button marketplace-button-primary mt-5">Acceder al marketplace</Link></section></div></DesignMarketplaceShell>;
  }

  return (
    <DesignMarketplaceShell>
      <div className="marketplace-main">
        <MarketplaceSectionHeading eyebrow="Acceso privado" title="Mi biblioteca" description={`Packs asociados a ${session.email}. Los originales permanecen disponibles en esta cuenta después de recargar o volver a iniciar sesión.`} />
        {message ? <MarketplaceNotice tone="success">{message}</MarketplaceNotice> : null}
        {ownedPacks.length ? (
          <div className="marketplace-pack-grid mt-8">
            {ownedPacks.map((pack) => <div key={pack.id} className="relative">
              <DesignPackCard pack={pack} />
              <button type="button" className="marketplace-button marketplace-button-primary absolute bottom-20 right-3" onClick={async () => { await downloadMarketplacePack(pack); setMessage(`Descarga iniciada para “${pack.title}”.`); }}>Descargar</button>
            </div>)}
          </div>
        ) : (
          <section className="marketplace-empty mt-8"><Library aria-hidden="true" /><h2>Aún no tienes packs</h2><p>Explora el catálogo y adquiere un pack gratuito o de compra única para verlo aquí.</p><Link to="/designs" className="marketplace-button marketplace-button-primary mt-5">Explorar catálogo</Link></section>
        )}
      </div>
    </DesignMarketplaceShell>
  );
}
