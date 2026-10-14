import * as React from 'react';
import type { DesignPack, MarketplaceAssetRef } from '../data/design-packs.data';
import { resolveMarketplaceAssetUrl } from '../services/design-marketplace-repository';

export function useMarketplaceAssetUrl(ref: MarketplaceAssetRef | undefined) {
  const [url, setUrl] = React.useState<string | null>(ref?.assetUrl ?? null);

  React.useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setUrl(ref?.assetUrl ?? null);
    if (!ref || ref.assetUrl) return () => undefined;
    resolveMarketplaceAssetUrl(ref).then((resolved) => {
      if (!active) {
        if (resolved?.startsWith('blob:')) URL.revokeObjectURL(resolved);
        return;
      }
      objectUrl = resolved?.startsWith('blob:') ? resolved : null;
      setUrl(resolved);
    }).catch(() => setUrl(null));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [ref]);

  return url;
}

export function DesignPackMedia({ pack, asset, alt, className = '' }: { pack: DesignPack; asset?: MarketplaceAssetRef; alt: string; className?: string }) {
  const url = useMarketplaceAssetUrl(asset ?? pack.cover);
  return url ? <img src={url} alt={alt} className={className} loading="lazy" /> : <div className={`marketplace-media-placeholder ${className}`} aria-label={`Vista previa no disponible de ${alt}`} />;
}
