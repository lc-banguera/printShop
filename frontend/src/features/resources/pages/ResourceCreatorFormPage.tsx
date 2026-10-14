import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  resourceCategories,
  resourceProducts,
  resourceTechniques,
  type PrintResource,
  type ResourceCategory,
  type ResourceFileRef,
} from '../data/resources.data';
import { storeResourceFile } from '../services/resources-repository';
import { useResourcesAuthStore } from '../store/resources-auth-store';
import { useResourcesStore } from '../store/resources-store';

type UploadKind = ResourceFileRef['kind'];
type SpecificField = 'products' | 'techniques' | 'dimensions' | 'resolution' | 'transparent';

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const DRAFT_PREFIX = 'printshop-resources:draft:';

const resourceFieldVisibility: Record<ResourceCategory, Record<SpecificField, boolean>> = {
  'Plantillas editables': { products: true, techniques: true, dimensions: true, resolution: true, transparent: true },
  Mockups: { products: true, techniques: false, dimensions: true, resolution: true, transparent: true },
  'Elementos gráficos': { products: false, techniques: false, dimensions: true, resolution: true, transparent: true },
  'Recursos técnicos de impresión': { products: true, techniques: true, dimensions: true, resolution: true, transparent: false },
  'Recursos comerciales': { products: false, techniques: false, dimensions: true, resolution: true, transparent: false },
};

function draftKey(creatorId: string, id?: string) {
  return `${DRAFT_PREFIX}${creatorId}:${id ?? 'new'}`;
}

function extension(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function acceptedFile(file: File, kind: UploadKind) {
  const image = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)
    || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(extension(file.name));
  if (kind === 'cover' || kind === 'preview') return image;
  return image || file.type === 'application/pdf' || extension(file.name) === 'pdf'
    || extension(file.name) === 'zip' || file.type === 'application/zip';
}

function FilePicker({
  label,
  hint,
  accept,
  multiple,
  files,
  onFiles,
  onRemove,
}: {
  label: string;
  hint: string;
  accept: string;
  multiple?: boolean;
  files: ResourceFileRef[];
  onFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="resources-upload">
      <strong>{label}</strong>
      <span className="resources-table-meta">{hint}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = '';
        }}
      />
      {files.length ? (
        <div className="resources-file-list">
          {files.map((file) => (
            <div className="resources-file-row" key={file.id}>
              <span>{file.name} · {formatBytes(file.sizeBytes)}</span>
              <button type="button" className="resources-file-remove" onClick={() => onRemove(file.id)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatBytes(size: number) {
  if (!size) return 'tamaño no disponible';
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourceCreatorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const creator = useResourcesAuthStore((state) => state.profile);
  const resources = useResourcesStore((state) => state.resources);
  const save = useResourcesStore((state) => state.save);
  const existing = resources.find((item) => item.id === id && item.creatorId === creator?.id);
  const [title, setTitle] = React.useState(existing?.title === 'Borrador sin título' ? '' : existing?.title ?? '');
  const [description, setDescription] = React.useState(existing?.description ?? '');
  const [category, setCategory] = React.useState<ResourceCategory>(existing?.category ?? resourceCategories[0]);
  const [tags, setTags] = React.useState(existing?.tags.join(', ') ?? '');
  const [products, setProducts] = React.useState(existing?.products.join(', ') ?? '');
  const [techniques, setTechniques] = React.useState(existing?.techniques.join(', ') ?? '');
  const [dimensions, setDimensions] = React.useState(existing?.dimensions ?? '');
  const [resolution, setResolution] = React.useState(existing?.resolution ?? '');
  const [transparent, setTransparent] = React.useState(existing?.transparent === true ? 'yes' : 'no');
  const [license, setLicense] = React.useState(existing?.license ?? 'Uso comercial en productos propios.');
  const [rights, setRights] = React.useState(existing?.rightsConfirmed ?? false);
  const [cover, setCover] = React.useState<ResourceFileRef | undefined>(existing?.cover);
  const [previews, setPreviews] = React.useState<ResourceFileRef[]>(existing?.previews ?? []);
  const [originals, setOriginals] = React.useState<ResourceFileRef[]>(existing?.originals ?? []);
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [uploadStatus, setUploadStatus] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [draftLoaded, setDraftLoaded] = React.useState(Boolean(existing));
  const visibleFields = resourceFieldVisibility[category];

  React.useEffect(() => {
    if (!creator || existing) return;
    try {
      const raw = window.localStorage.getItem(draftKey(creator.id, id));
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<PrintResource>;
      setTitle(draft.title === 'Borrador sin título' ? '' : draft.title ?? '');
      setDescription(draft.description ?? '');
      setCategory(draft.category ?? resourceCategories[0]);
      setTags(draft.tags?.join(', ') ?? '');
      setProducts(draft.products?.join(', ') ?? '');
      setTechniques(draft.techniques?.join(', ') ?? '');
      setDimensions(draft.dimensions ?? '');
      setResolution(draft.resolution ?? '');
      setTransparent(draft.transparent === true ? 'yes' : 'no');
      setLicense(draft.license ?? 'Uso comercial en productos propios.');
      setRights(draft.rightsConfirmed ?? false);
      setCover(draft.cover);
      setPreviews(draft.previews ?? []);
      setOriginals(draft.originals ?? []);
    } catch {
      // Ignore an unreadable local draft.
    } finally {
      setDraftLoaded(true);
    }
  }, [creator, existing, id]);

  React.useEffect(() => {
    if (!creator || !draftLoaded) return;
    const draft = {
      title,
      description,
      category,
      tags: tags.split(',').map((item) => item.trim()).filter(Boolean),
      products: products.split(',').map((item) => item.trim()).filter(Boolean),
      techniques: techniques.split(',').map((item) => item.trim()).filter(Boolean),
      dimensions,
      resolution,
      transparent: transparent === 'yes',
      license,
      rightsConfirmed: rights,
      cover,
      previews,
      originals,
    };
    try {
      window.localStorage.setItem(draftKey(creator.id, id), JSON.stringify(draft));
    } catch {
      // File binaries remain in IndexedDB; metadata can be saved again manually.
    }
  }, [category, cover, creator, description, dimensions, draftLoaded, id, license, originals, previews, products, resolution, rights, tags, techniques, title, transparent]);

  const addFiles = async (files: File[], kind: UploadKind) => {
    if (!files.length) return;
    const invalid = files.find((file) => file.size > MAX_FILE_SIZE || !acceptedFile(file, kind));
    if (invalid) {
      setError(!acceptedFile(invalid, kind)
        ? `${invalid.name} no tiene un formato admitido para este campo.`
        : `${invalid.name} supera el límite de 500 MB.`);
      return;
    }
    setError('');
    setUploadStatus(`Guardando ${kind === 'cover' ? 'portada' : kind === 'preview' ? 'previsualizaciones' : 'originales'}…`);
    try {
      const refs: ResourceFileRef[] = [];
      for (let index = 0; index < files.length; index += 1) {
        refs.push(await storeResourceFile(files[index], kind));
        setUploadStatus(`Guardando archivo ${index + 1} de ${files.length}…`);
      }
      if (kind === 'cover') setCover(refs[0]);
      if (kind === 'preview') setPreviews((current) => [...current, ...refs]);
      if (kind === 'original') setOriginals((current) => [...current, ...refs]);
      setUploadStatus(`${files.length} ${files.length === 1 ? 'archivo guardado' : 'archivos guardados'}.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudieron guardar los archivos.');
      setUploadStatus('');
    }
  };

  const persist = (status: PrintResource['status']) => {
    const cleanTitle = title.trim();
    if (status === 'published' && cleanTitle.length < 3) {
      setError('Añade un título de al menos tres caracteres para publicar.');
      return;
    }
    if (status === 'published' && description.trim().length < 10) {
      setError('Añade una descripción de al menos diez caracteres para publicar.');
      return;
    }
    if (!creator) {
      setError('Necesitas una cuenta de creador.');
      return;
    }
    if (status === 'published' && (!cover || !originals.length || !rights || !license.trim())) {
      setError('Para publicar, añade portada, originales, licencia y confirma tu derecho a publicar los archivos.');
      return;
    }
    setError('');
    setSaving(true);
    const now = new Date().toISOString();
    const resource: PrintResource = {
      id: existing?.id ?? `resource-${crypto.randomUUID()}`,
      title: cleanTitle || 'Borrador sin título',
      description: description.trim(),
      category,
      tags: tags.split(',').map((item) => item.trim()).filter(Boolean),
      creatorId: creator.id,
      creatorName: creator.publicName,
      status,
      formats: Array.from(new Set(originals.map((file) => extension(file.name).toUpperCase() || 'ARCHIVO'))),
      products: products.split(',').map((item) => item.trim()).filter(Boolean),
      techniques: techniques.split(',').map((item) => item.trim()).filter(Boolean),
      dimensions: dimensions.trim() || undefined,
      resolution: resolution.trim() || undefined,
      transparent: transparent === 'yes',
      fileCount: originals.length,
      totalSizeBytes: originals.reduce((sum, file) => sum + file.sizeBytes, 0),
      license: license.trim(),
      rightsConfirmed: rights,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      cover,
      previews,
      originals,
    };
    save(resource);
    try {
      window.localStorage.removeItem(draftKey(creator.id, id));
    } catch {
      // Continue after a successful record save.
    }
    setSaving(false);
    setNotice(status === 'published' ? 'Recurso publicado.' : 'Borrador guardado.');
    window.setTimeout(() => navigate('/resources/creator/resources'), 350);
  };

  if (id && !existing) {
    return (
      <section className="resources-empty">
        <h2>Recurso no disponible</h2>
        <p>No puedes editar esta publicación con la sesión actual.</p>
        <Link className="resources-button resources-button-secondary" to="/resources/creator/resources">
          Volver a mis recursos
        </Link>
      </section>
    );
  }

  return (
    <div className="resources-form-panel">
      {error ? <p className="resources-message resources-message-error" role="alert">{error}</p> : null}
      {notice ? <p className="resources-message" role="status">{notice}</p> : null}
      {uploadStatus ? <p className="resources-form-status" role="status">{uploadStatus}</p> : null}

      <div className="resources-form-grid">
        <div className="resources-field resources-form-full">
          <label htmlFor="resource-title">Título del recurso</label>
          <input id="resource-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="resources-field resources-form-full">
          <label htmlFor="resource-description">Descripción</label>
          <textarea id="resource-description" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        <div className="resources-field">
          <label htmlFor="resource-category">Categoría</label>
          <select id="resource-category" value={category} onChange={(event) => setCategory(event.target.value as ResourceCategory)}>
            {resourceCategories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="resources-field">
          <label htmlFor="resource-tags">Etiquetas relevantes</label>
          <input id="resource-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="mockup, camiseta, catálogo" />
        </div>
        {visibleFields.products ? (
          <div className="resources-field">
            <label htmlFor="resource-products">Productos compatibles</label>
            <input id="resource-products" value={products} onChange={(event) => setProducts(event.target.value)} placeholder={resourceProducts.join(', ')} />
          </div>
        ) : null}
        {visibleFields.techniques ? (
          <div className="resources-field">
            <label htmlFor="resource-techniques">Técnicas</label>
            <input id="resource-techniques" value={techniques} onChange={(event) => setTechniques(event.target.value)} placeholder={resourceTechniques.join(', ')} />
          </div>
        ) : null}
        {visibleFields.dimensions ? (
          <div className="resources-field">
            <label htmlFor="resource-dimensions">Dimensiones <span>(si aplican)</span></label>
            <input id="resource-dimensions" value={dimensions} onChange={(event) => setDimensions(event.target.value)} placeholder="4500 × 5400 px" />
          </div>
        ) : null}
        {visibleFields.resolution ? (
          <div className="resources-field">
            <label htmlFor="resource-resolution">Resolución <span>(si se conoce)</span></label>
            <input id="resource-resolution" value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="300 dpi" />
          </div>
        ) : null}
        {visibleFields.transparent ? (
          <div className="resources-field">
            <label htmlFor="resource-transparent">Transparencia</label>
            <select id="resource-transparent" value={transparent} onChange={(event) => setTransparent(event.target.value)}>
              <option value="no">No especificada</option>
              <option value="yes">Sí</option>
            </select>
          </div>
        ) : null}
        <div className="resources-field resources-form-full">
          <label>Portada</label>
          <FilePicker label="Imagen de portada" hint="PNG, JPG, WEBP o SVG · máximo 500 MB" accept="image/png,image/jpeg,image/webp,image/svg+xml" files={cover ? [cover] : []} onFiles={(files) => addFiles(files, 'cover')} onRemove={() => setCover(undefined)} />
        </div>
        <div className="resources-field resources-form-full">
          <label>Vistas previas</label>
          <FilePicker label="Imágenes de previsualización" hint="Puedes seleccionar varias imágenes para mostrar el contenido" accept="image/png,image/jpeg,image/webp,image/svg+xml" multiple files={previews} onFiles={(files) => addFiles(files, 'preview')} onRemove={(fileId) => setPreviews((current) => current.filter((file) => file.id !== fileId))} />
        </div>
        <div className="resources-field resources-form-full">
          <label>Archivos originales</label>
          <FilePicker label="Archivos descargables" hint="Imágenes, PDF o ZIP · se conservan sin convertir" accept=".zip,.pdf,image/png,image/jpeg,image/webp,image/svg+xml,application/pdf,application/zip" multiple files={originals} onFiles={(files) => addFiles(files, 'original')} onRemove={(fileId) => setOriginals((current) => current.filter((file) => file.id !== fileId))} />
        </div>
        <div className="resources-field resources-form-full">
          <label htmlFor="resource-license">Licencia y condiciones de uso</label>
          <textarea id="resource-license" value={license} onChange={(event) => setLicense(event.target.value)} />
        </div>
        <label className="resources-form-full resources-rights-check">
          <input type="checkbox" checked={rights} onChange={(event) => setRights(event.target.checked)} />
          Confirmo que tengo derecho a publicar estos archivos.
        </label>
      </div>

      <div className="resources-form-actions">
        <Link to="/resources/creator/resources" className="resources-button resources-button-tertiary">Cancelar</Link>
        <button type="button" className="resources-button resources-button-secondary" onClick={() => persist('draft')} disabled={saving}>Guardar borrador</button>
        <button type="button" className="resources-button resources-button-primary" onClick={() => persist('published')} disabled={saving}>{saving ? 'Guardando…' : 'Publicar recurso'}</button>
      </div>
    </div>
  );
}
