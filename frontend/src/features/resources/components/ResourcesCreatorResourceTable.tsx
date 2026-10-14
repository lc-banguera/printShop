import { Link } from 'react-router-dom';
import type { PrintResource } from '../data/resources.data';
import { useResourcesStore } from '../store/resources-store';

export function ResourcesCreatorResourceTable({ resources }: { resources: PrintResource[] }) {
  const remove = useResourcesStore((state) => state.remove);
  const save = useResourcesStore((state) => state.save);
  const statusLabel = (status: PrintResource['status']) => status === 'published' ? 'Publicado' : status === 'draft' ? 'Borrador' : 'Retirado';
  const withdraw = (resource: PrintResource) => save({ ...resource, status: 'withdrawn', updatedAt: new Date().toISOString() });

  return (
    <div className="resources-table-wrap">
      <table className="resources-table">
        <thead>
          <tr>
            <th>Recurso</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Archivos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => (
            <tr key={resource.id}>
              <td>
                <strong>{resource.title}</strong>
                <div className="resources-table-meta">{resource.formats.join(', ') || 'Formato pendiente'}</div>
              </td>
              <td>{resource.category}</td>
              <td>{statusLabel(resource.status)}</td>
              <td>{resource.fileCount}</td>
              <td>
                <div className="resources-list-actions">
                  {resource.status === 'published' ? <Link className="resources-button resources-button-tertiary" to={`/resources/${resource.id}`}>Ver</Link> : null}
                  <Link className="resources-button resources-button-primary" to={`/resources/creator/resources/${resource.id}`}>Editar</Link>
                  {resource.status === 'published' ? <button type="button" className="resources-button resources-button-secondary" onClick={() => withdraw(resource)}>Retirar</button> : null}
                  <button type="button" className="resources-button resources-button-tertiary" onClick={() => { if (window.confirm('¿Eliminar este recurso?')) remove(resource.id); }}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
