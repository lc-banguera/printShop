import * as React from 'react';
import { UserRound } from 'lucide-react';
import { MarketplaceNotice, MarketplaceSectionHeading } from '../components/DesignMarketplaceShell';
import { useDesignMarketplaceStore } from '../store/design-marketplace-store';

export function DesignCreatorProfilePage() {
  const profile = useDesignMarketplaceStore((state) => state.profile);
  const saveProfile = useDesignMarketplaceStore((state) => state.saveProfile);
  const [publicName, setPublicName] = React.useState(profile?.publicName ?? '');
  const [bio, setBio] = React.useState(profile?.bio ?? '');
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (publicName.trim().length < 2) { setError('El nombre público debe tener al menos dos caracteres.'); return; } saveProfile({ email: profile?.email ?? '', publicName, bio }); setError(''); setMessage('Perfil actualizado.'); };
  return <><MarketplaceSectionHeading eyebrow="Identidad del marketplace" title="Perfil público" description="Este perfil pertenece únicamente al marketplace de diseños y no modifica tu cuenta de Cliente o Tienda." /><div className="marketplace-form-card">{message ? <MarketplaceNotice tone="success">{message}</MarketplaceNotice> : null}{error ? <MarketplaceNotice tone="error">{error}</MarketplaceNotice> : null}<form className="marketplace-form mt-6" onSubmit={submit}><div className="marketplace-field"><label htmlFor="creator-public-name">Nombre público</label><input id="creator-public-name" className="marketplace-control" value={publicName} onChange={(event) => setPublicName(event.target.value)} /></div><div className="marketplace-field"><label htmlFor="creator-email">Correo de acceso</label><input id="creator-email" className="marketplace-control" value={profile?.email ?? ''} readOnly /></div><div className="marketplace-field"><label htmlFor="creator-bio">Descripción</label><textarea id="creator-bio" className="marketplace-control" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Cuéntale a la comunidad qué tipo de recursos creas." /></div><div className="marketplace-form-footer"><button type="submit" className="marketplace-button marketplace-button-primary">Guardar perfil</button></div></form><div className="mt-8 border-t border-border pt-5"><div className="marketplace-page-icon"><UserRound aria-hidden="true" /> Perfil independiente y persistente</div><p className="mt-2 max-w-2xl text-xs leading-5 text-foregroundMuted">Tu nombre, publicaciones, adquisiciones y archivos se guardan separados de los módulos Cliente y Tienda.</p></div></div></>;
}
