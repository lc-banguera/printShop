import * as React from 'react';
import { Link } from 'react-router-dom';
import { ResourcesCreatorResourceTable } from '../components/ResourcesCreatorResourceTable';
import { useCreatorResources } from '../store/resources-store';

export function ResourcesCreatorListPage() {
  const resources = useCreatorResources();
  const [query, setQuery] = React.useState('');
  const visible = resources.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  return <>
    <div className="resources-heading"><div><h1>Mis recursos</h1><p>Consulta borradores y publicaciones de esta cuenta independiente.</p></div><Link to="/resources/creator/resources/new" className="resources-button resources-button-primary">Nuevo recurso</Link></div>
    <input className="resources-control" style={{ width: '100%', marginTop: 28 }} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en mis recursos" aria-label="Buscar en mis recursos" />
    <ResourcesCreatorResourceTable resources={visible} />
    {visible.length === 0 ? <section className="resources-empty"><h2>Aún no tienes recursos</h2><p>Cuando guardes un recurso, aparecerá aquí.</p></section> : null}
  </>;
}
