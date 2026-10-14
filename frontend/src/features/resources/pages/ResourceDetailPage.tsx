import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ResourcesShell } from '../components/ResourcesShell';
import { ResourceMedia } from '../components/ResourceMedia';
import { downloadResource, findResource } from '../services/resources-repository';

export function ResourceDetailPage() {
  const { id } = useParams();
  const resource = findResource(id ?? '');
  const [active, setActive] = React.useState(0);
  const [message, setMessage] = React.useState('');
  const publicResource = resource?.status === 'published' ? resource : null;

  if (!publicResource) {
    return (
      <ResourcesShell>
        <div className="resources-main">
          <section className="resources-empty">
            <h2>Recurso no disponible</h2>
            <p>El recurso que buscas no está publicado o ya no existe.</p>
            <Link className="resources-button resources-button-secondary" to="/resources">
              Volver a Recursos
            </Link>
          </section>
        </div>
      </ResourcesShell>
    );
  }

  const gallery = [publicResource.cover, ...publicResource.previews].filter(Boolean);
  const formats = publicResource.formats.filter(Boolean);

  return (
    <ResourcesShell>
      <div className="resources-main">
        <Link to="/resources" className="resources-back-link">
          <ArrowLeft aria-hidden="true" /> Volver a Recursos
        </Link>

        <div className="resources-detail">
          <div className="resources-detail-gallery">
            <div className="resources-detail-image">
              <ResourceMedia asset={gallery[active]} alt={`Previsualización de ${publicResource.title}`} />
            </div>

            <div className="resources-detail-thumbs">
              {gallery.map((asset, index) => (
                <button
                  key={asset?.id ?? index}
                  type="button"
                  className={`resources-detail-thumb${index === active ? ' is-active' : ''}`}
                  onClick={() => setActive(index)}
                  aria-label={`Ver previsualización ${index + 1}`}
                >
                  <ResourceMedia asset={asset} alt="" />
                </button>
              ))}
            </div>

            <p className="resources-detail-byline">
              <span>Por {publicResource.creatorName}</span>
            </p>
          </div>

          <article className="resources-detail-copy">
            <p className="resources-detail-category">{publicResource.category}</p>
            <h1>{publicResource.title}</h1>
            <p>{publicResource.description}</p>

            <div className="resources-detail-actions">
              <button
                type="button"
                className="resources-button resources-button-primary"
                onClick={async () => {
                  try {
                    await downloadResource(publicResource);
                    setMessage('Descarga iniciada.');
                  } catch {
                    setMessage('No se pudo iniciar la descarga. Inténtalo de nuevo.');
                  }
                }}
              >
                 Descargar recurso
              </button>
            </div>

            {message ? <p className="resources-form-status" role="status">{message}</p> : null}

            <dl className="resources-facts">
              {publicResource.fileCount > 0 ? <div className="resources-fact"><dt>Archivos incluidos</dt><dd>{publicResource.fileCount}</dd></div> : null}
              {publicResource.products.length ? <div className="resources-fact"><dt>Productos</dt><dd>{publicResource.products.join(', ')}</dd></div> : null}
              {publicResource.techniques.length ? <div className="resources-fact"><dt>Técnicas</dt><dd>{publicResource.techniques.join(', ')}</dd></div> : null}
              {publicResource.dimensions ? <div className="resources-fact"><dt>Dimensiones</dt><dd>{publicResource.dimensions}</dd></div> : null}
              {publicResource.resolution ? <div className="resources-fact"><dt>Resolución</dt><dd>{publicResource.resolution}</dd></div> : null}
              {publicResource.transparent !== undefined ? <div className="resources-fact"><dt>Transparencia</dt><dd>{publicResource.transparent ? 'Sí' : 'No'}</dd></div> : null}
              {publicResource.license.trim() ? <div className="resources-fact resources-fact-license"><dt>Licencia</dt><dd>{publicResource.license}</dd></div> : null}
              {formats.length ? <div className="resources-fact resources-fact-format"><dt>FORMATO DE ARCHIVO</dt><dd>{formats.join(', ')}</dd></div> : null}
            </dl>
          </article>
        </div>
      </div>
    </ResourcesShell>
  );
}
