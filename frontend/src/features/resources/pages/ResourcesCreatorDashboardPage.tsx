import { Link } from 'react-router-dom';
import { ResourcesCreatorResourceTable } from '../components/ResourcesCreatorResourceTable';
import { useCreatorResources } from '../store/resources-store';
import { useResourcesAuthStore } from '../store/resources-auth-store';

export function ResourcesCreatorDashboardPage() {
  const resources = useCreatorResources();
  const profile = useResourcesAuthStore((state) => state.profile);
  return <>
    <div className="resources-heading"><div><h1>Hola, {profile?.publicName ?? 'creador'}</h1><p>Publica y administra recursos creativos desde tu cuenta independiente, manteniendo tus originales separados de las vistas previas.</p></div><Link to="/resources/creator/resources/new" className="resources-button resources-button-primary">Nuevo recurso</Link></div>
    {resources.length ? <ResourcesCreatorResourceTable resources={resources} /> : <section className="resources-empty"><h2>Tu centro empieza aquí</h2><p>Guarda un borrador para conservar tu avance o publica tu primer recurso cuando esté listo.</p></section>}
  </>;
}
