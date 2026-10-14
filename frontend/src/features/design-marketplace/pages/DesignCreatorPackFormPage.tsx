import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileImage, UploadCloud } from 'lucide-react';
import type { DesignPack, MarketplaceAssetRef } from '../data/design-packs.data';
import { MarketplaceNotice, MarketplaceSectionHeading } from '../components/DesignMarketplaceShell';
import { useMarketplaceAssetUrl } from '../components/DesignPackMedia';
import { storeMarketplaceAsset } from '../services/design-marketplace-repository';
import { useDesignMarketplaceStore } from '../store/design-marketplace-store';

const categories = ['Tipografía', 'Ilustración', 'Naturaleza', 'Abstracto', 'Cultura pop', 'Patrones'];
const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const extensionOf = (name: string) => name.split('.').pop()?.toUpperCase() ?? 'ARCHIVO';
const bytesLabel = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function FilePicker({ label, hint, accept, multiple, onFiles, files, progress }: { label: string; hint: string; accept: string; multiple?: boolean; onFiles: (files: File[]) => void; files: MarketplaceAssetRef[]; progress?: number }) {
  return <div className="marketplace-file-picker"><div className="flex items-start gap-3"><UploadCloud className="mt-0.5 h-5 w-5 shrink-0 text-foregroundMuted" aria-hidden="true" /><div><p className="m-0 text-sm font-bold text-foreground">{label}</p><p className="mt-1 text-xs leading-5 text-foregroundMuted">{hint}</p></div></div><input type="file" accept={accept} multiple={multiple} onChange={(event) => onFiles(Array.from(event.target.files ?? []))} />{progress !== undefined && progress < 100 ? <div className="marketplace-progress" aria-label={`Preparando archivos, ${progress}%`}><span style={{ width: `${progress}%` }} /></div> : null}{files.length ? <div className="marketplace-file-summary">{files.map((file) => <div key={file.id} className="flex items-center justify-between gap-3"><span className="min-w-0 truncate"><FileImage className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />{file.name}</span><span>{file.sizeBytes ? bytesLabel(file.sizeBytes) : 'Guardado'}</span></div>)}</div> : null}</div>;
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="marketplace-form-section"><div className="marketplace-form-section-heading"><h2>{title}</h2><p>{description}</p></div>{children}</section>;
}

export function DesignCreatorPackFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useDesignMarketplaceStore((state) => state.profile);
  const packs = useDesignMarketplaceStore((state) => state.packs);
  const savePack = useDesignMarketplaceStore((state) => state.savePack);
  const existing = id ? packs.find((pack) => pack.id === id && pack.creatorId === profile?.id) : undefined;
  const [title, setTitle] = React.useState(existing?.title ?? '');
  const [description, setDescription] = React.useState(existing?.description ?? '');
  const [category, setCategory] = React.useState(existing?.category ?? categories[0]);
  const [access, setAccess] = React.useState<DesignPack['access']>(existing?.access ?? 'free');
  const [price, setPrice] = React.useState(existing?.price ? String(existing.price) : '');
  const [license, setLicense] = React.useState(existing?.license ?? 'Uso comercial en productos físicos propios. No se permite revender los archivos originales.');
  const [cover, setCover] = React.useState<MarketplaceAssetRef | undefined>(existing?.cover);
  const [originals, setOriginals] = React.useState<MarketplaceAssetRef[]>(existing?.originals ?? []);
  const [previews, setPreviews] = React.useState<MarketplaceAssetRef[]>(existing?.previews ?? []);
  const [uploadProgress, setUploadProgress] = React.useState<number | undefined>();
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const coverUrl = useMarketplaceAssetUrl(cover);

  React.useEffect(() => {
    if (!existing) return;
    setTitle(existing.title); setDescription(existing.description); setCategory(existing.category); setAccess(existing.access); setPrice(existing.price ? String(existing.price) : ''); setLicense(existing.license); setCover(existing.cover); setOriginals(existing.originals); setPreviews(existing.previews);
  }, [existing]);

  const handleFiles = async (files: File[], kind: MarketplaceAssetRef['kind']) => {
    if (!files.length) return;
    const invalid = files.find((file) => file.size > 500 * 1024 * 1024 || (kind === 'preview' || kind === 'cover') && !imageTypes.includes(file.type));
    if (invalid) { setError(`No se pudo preparar “${invalid.name}”. Usa imágenes compatibles de hasta 500 MB.`); return; }
    setError(''); setUploadProgress(0);
    try {
      const refs: MarketplaceAssetRef[] = [];
      for (let index = 0; index < files.length; index += 1) {
        refs.push(await storeMarketplaceAsset(files[index], kind));
        setUploadProgress(Math.round(((index + 1) / files.length) * 100));
      }
      if (kind === 'cover') setCover(refs[0]);
      if (kind === 'preview') setPreviews((current) => [...current, ...refs]);
      if (kind === 'original') setOriginals(refs);
      window.setTimeout(() => setUploadProgress(undefined), 500);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudieron guardar los archivos.');
      setUploadProgress(undefined);
    }
  };

  const validate = (publishing: boolean) => {
    if (publishing && title.trim().length < 3) return 'Añade un título de al menos tres caracteres.';
    if (publishing && description.trim().length < 20) return 'Añade una descripción más completa para el catálogo.';
    if (publishing && !cover) return 'Añade una imagen de portada.';
    if (publishing && !originals.length) return 'Añade al menos un archivo original o un ZIP.';
    if (publishing && !previews.length) return 'Añade al menos una vista previa separada de los originales.';
    if (access === 'paid' && (!Number(price) || Number(price) <= 0)) return 'Indica un precio mayor que cero para un pack de pago.';
    return '';
  };

  const persist = (publishing: boolean) => {
    const validationError = validate(publishing);
    if (validationError) { setError(validationError); return; }
    const now = new Date().toISOString();
    const pack: DesignPack = {
      id: existing?.id ?? `marketplace-pack-${crypto.randomUUID()}`,
      title: title.trim() || 'Borrador sin título',
      description: description.trim(),
      category,
      access,
      price: access === 'paid' ? Number(price) : 0,
      currency: 'USD',
      creatorId: profile?.id ?? '',
      creatorName: profile?.publicName ?? 'Creador PrintShop',
      status: publishing ? 'published' : 'draft',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      designCount: originals.length || existing?.designCount || 0,
      formats: Array.from(new Set(originals.map((file) => extensionOf(file.name)))),
      contents: [originals.length ? `${originals.length} archivo(s) original(es)` : 'Archivos originales por preparar', previews.length ? `${previews.length} vista(s) previa(s)` : 'Vistas previas por preparar'],
      license,
      cover,
      previews,
      originals,
    };
    savePack(pack);
    setError('');
    setNotice(publishing ? 'Pack publicado en el catálogo.' : 'Borrador guardado.');
    if (publishing) window.setTimeout(() => navigate('/designs/creator/packs'), 900);
  };

  if (id && !existing) return <><MarketplaceSectionHeading title="Pack no disponible" description="No puedes editar esta publicación con la sesión actual." /><Link to="/designs/creator/packs" className="marketplace-button marketplace-button-secondary mt-6">Volver a mis packs</Link></>;

  return <>
    <MarketplaceSectionHeading eyebrow={existing ? 'Editar publicación' : 'Nueva publicación'} title={existing ? existing.title : 'Publicar un pack'} description="Conserva los originales tal como los seleccionas. Las vistas previas son recursos separados y solo sirven para presentar el contenido." />
    <div className="marketplace-form-card">
      {notice ? <MarketplaceNotice tone="success">{notice}</MarketplaceNotice> : null}
      {error ? <MarketplaceNotice tone="error">{error}</MarketplaceNotice> : null}

      <FormSection title="Información del pack" description="Presenta el recurso con claridad para que pueda encontrarse y entenderse en el catálogo.">
        <div className="marketplace-form-grid">
          <div className="marketplace-field marketplace-field-full"><label htmlFor="pack-title">Título del pack</label><input id="pack-title" className="marketplace-control" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Colección editorial urbana" /></div>
          <div className="marketplace-field marketplace-field-full"><label htmlFor="pack-description">Descripción</label><textarea id="pack-description" className="marketplace-control" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Explica qué incluye, para qué técnicas funciona y qué recibe el comprador." /></div>
        </div>
      </FormSection>

      <FormSection title="Acceso y precio" description="Define si el pack será gratuito o de compra única, sin requerir una membresía.">
        <div className="marketplace-form-grid">
          <div className="marketplace-field"><label htmlFor="pack-category">Categoría</label><select id="pack-category" className="marketplace-control" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="marketplace-field"><label>Acceso y precio</label><div className="marketplace-radio-row"><label className="marketplace-radio"><input type="radio" name="pack-access" checked={access === 'free'} onChange={() => setAccess('free')} /> Gratis</label><label className="marketplace-radio"><input type="radio" name="pack-access" checked={access === 'paid'} onChange={() => setAccess('paid')} /> De pago</label></div>{access === 'paid' ? <input className="marketplace-control mt-2" type="number" min="1" step="1" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Precio en USD" aria-label="Precio en USD" /> : null}</div>
        </div>
      </FormSection>

      <FormSection title="Archivos del pack" description="Separa la portada, los originales descargables y las muestras que se mostrarán en el catálogo.">
        <div className="marketplace-form-grid">
          <div className="marketplace-field"><label>Portada</label><FilePicker label="Imagen principal" hint="JPG, PNG, WebP o SVG. Se guarda separada de los originales." accept="image/png,image/jpeg,image/webp,image/svg+xml" onFiles={(files) => handleFiles(files, 'cover')} files={cover ? [cover] : []} progress={uploadProgress} />{coverUrl ? <img src={coverUrl} alt="Vista previa de la portada seleccionada" className="mt-3 aspect-[4/3] w-full rounded-control border border-border object-cover" /> : null}</div>
          <div className="marketplace-field"><label>Archivos originales</label><FilePicker label="ZIP o archivos individuales" hint="Puedes subir un ZIP con cientos o miles de imágenes. El archivo original se conserva sin convertir ni aplanar." accept=".zip,image/png,image/jpeg,image/webp,image/svg+xml,application/pdf" multiple onFiles={(files) => handleFiles(files, 'original')} files={originals} progress={uploadProgress} /></div>
          <div className="marketplace-field marketplace-field-full"><label>Vistas previas</label><FilePicker label="Muestras para el catálogo" hint="Selecciona imágenes de muestra separadas de los originales. Nunca reemplazan el archivo descargable." accept="image/png,image/jpeg,image/webp,image/svg+xml" multiple onFiles={(files) => handleFiles(files, 'preview')} files={previews} progress={uploadProgress} /></div>
        </div>
      </FormSection>

      <FormSection title="Uso y conservación" description="Estas condiciones acompañan al pack y ayudan a mantener claros sus permisos y su calidad.">
        <div className="marketplace-form-grid">
          <div className="marketplace-field marketplace-field-full"><label htmlFor="pack-license">Condiciones de uso</label><textarea id="pack-license" className="marketplace-control" value={license} onChange={(event) => setLicense(event.target.value)} /></div>
          <div className="marketplace-form-divider"><div className="flex items-start gap-3"><div><p className="m-0 text-sm font-bold text-foreground">Preparación sin pérdida</p><p className="mt-1 text-xs leading-5 text-foregroundMuted">Los originales se conservan sin convertir ni aplanar, incluyendo PNG, SVG, JPG o ZIP.</p></div></div></div>
        </div>
      </FormSection>

      <div className="marketplace-form-footer"><Link to="/designs/creator/packs" className="marketplace-button marketplace-button-secondary">Cancelar</Link><button type="button" className="marketplace-button marketplace-button-secondary" onClick={() => persist(false)}>Guardar borrador</button><button type="button" className="marketplace-button marketplace-button-primary" onClick={() => persist(true)}>Publicar pack</button></div>
    </div>
  </>;
}
