import * as React from 'react';
import type { ResourceFileRef } from '../data/resources.data';
import { resolveResourceUrl } from '../services/resources-repository';

export function ResourceMedia({ asset, alt, className = '' }: { asset?: ResourceFileRef; alt: string; className?: string }) {
  const [url, setUrl] = React.useState<string | null>(asset?.assetUrl ?? null);
  React.useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setUrl(asset?.assetUrl ?? null);
    if (!asset?.assetUrl) resolveResourceUrl(asset).then((next) => { if (active) { objectUrl = next?.startsWith('blob:') ? next : null; setUrl(next); } });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [asset]);
  return url ? <img src={url} alt={alt} className={className} /> : <div className={`resources-media-placeholder ${className}`} role="img" aria-label={alt}>Sin previsualización</div>;
}
