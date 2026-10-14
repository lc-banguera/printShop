import { Link } from 'react-router-dom';
import { FileImage } from 'lucide-react';
import type { DesignPack } from '../data/design-packs.data';
import { DesignPackMedia } from './DesignPackMedia';

function priceLabel(pack: DesignPack) {
  return pack.access === 'free' ? 'Gratis' : `$ ${pack.price.toLocaleString('es-MX')} ${pack.currency}`;
}

export function DesignPackCard({ pack }: { pack: DesignPack }) {
  return (
    <article className="marketplace-pack-card">
      <Link to={`/designs/pack/${pack.id}`} className="marketplace-pack-cover-link" aria-label={`Ver ${pack.title}`}>
        <div className="marketplace-pack-cover">
          <DesignPackMedia pack={pack} alt={`Portada de ${pack.title}`} className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-[1.02]" />
          <span className="marketplace-pack-access">{pack.access === 'free' ? 'Gratis' : 'Pack de pago'}</span>
        </div>
      </Link>
      <div className="marketplace-pack-body">
        <div className="marketplace-pack-meta-row">
          <span>{pack.category}</span>
          <span>{pack.designCount} diseños</span>
        </div>
        <h2><Link to={`/designs/pack/${pack.id}`}>{pack.title}</Link></h2>
        <p className="marketplace-pack-creator">Por {pack.creatorName}</p>
        <div className="marketplace-pack-footer">
          <span className="marketplace-pack-price">{priceLabel(pack)}</span>
          <span className="marketplace-pack-format"><FileImage aria-hidden="true" /> {pack.formats[0]}</span>
        </div>
      </div>
    </article>
  );
}

export function PackAccessLabel({ pack }: { pack: DesignPack }) {
  return <span className="marketplace-inline-label">{pack.access === 'free' ? 'Acceso sin membresía' : 'Compra única'}</span>;
}
