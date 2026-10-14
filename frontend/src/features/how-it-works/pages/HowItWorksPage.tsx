import * as React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';
import { HowItWorksModuleCard } from '../components/HowItWorksModuleCard';
import { HowItWorksVideoCard } from '../components/HowItWorksVideoCard';
import { gettingStartedItems, howItWorksModules, howItWorksVideos } from '../data/how-it-works.data';
import '../how-it-works.css';

export function HowItWorksPage() {
  const [query, setQuery] = React.useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const matches = React.useCallback((values: string[]) => {
    return !normalizedQuery || values.join(' ').toLowerCase().includes(normalizedQuery);
  }, [normalizedQuery]);

  const visibleGettingStarted = React.useMemo(
    () => gettingStartedItems.filter((item) => matches([item.title, item.description, ...item.keywords])),
    [matches],
  );
  const visibleVideos = React.useMemo(
    () => howItWorksVideos.filter((video) => matches([video.title, video.description, video.channel, video.topic])),
    [matches],
  );
  const visibleModules = React.useMemo(
    () => howItWorksModules.filter((module) => matches([module.title, module.description, ...module.keywords])),
    [matches],
  );
  const hasResults = visibleGettingStarted.length + visibleVideos.length + visibleModules.length > 0;

  return (
    <div className="how-it-works-shell">
      <Header />
      <main>
        <section className="how-it-works-hero" aria-labelledby="how-it-works-title">
          <div className="how-it-works-container">
            <p className="how-it-works-eyebrow">Centro de aprendizaje</p>
            <h1 id="how-it-works-title">Cómo funciona PrintShop</h1>
            <p className="how-it-works-hero-description">Aprende a crear, personalizar, preparar y gestionar tus productos y recursos dentro de PrintShop.</p>
            <label className="how-it-works-search">
              <Search aria-hidden="true" />
              <span className="sr-only">Buscar en Cómo funciona</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por tema, módulo o función"
              />
            </label>
          </div>
        </section>

        <div className="how-it-works-container how-it-works-main">
          {!hasResults ? (
            <section className="how-it-works-empty" aria-live="polite">
              <h2>No encontramos contenido</h2>
              <p>Prueba con otro término para encontrar una guía, un módulo o un tutorial.</p>
              <button type="button" className="how-it-works-button how-it-works-button-secondary" onClick={() => setQuery('')}>Limpiar búsqueda</button>
            </section>
          ) : null}

          {visibleGettingStarted.length > 0 ? (
            <section className="how-it-works-section" aria-labelledby="getting-started-heading">
              <div className="how-it-works-section-heading">
                <div>
                  <p className="how-it-works-eyebrow">Para empezar</p>
                  <h2 id="getting-started-heading">Primeros pasos</h2>
                </div>
                <p>Un recorrido breve por los flujos principales que ya están disponibles en la plataforma.</p>
              </div>
              <div className="how-it-works-start-grid">
                {visibleGettingStarted.map((item) => (
                  <Link key={item.title} className="how-it-works-start-item" to={`/como-funciona/documentacion/${item.articleSlug}`}>
                    <span className="how-it-works-start-number" aria-hidden="true">{String(gettingStartedItems.indexOf(item) + 1).padStart(2, '0')}</span>
                    <span><strong>{item.title}</strong><span>{item.description}</span></span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {visibleVideos.length > 0 ? (
            <section className="how-it-works-section" aria-labelledby="videos-heading">
              <div className="how-it-works-section-heading">
                <div>
                  <p className="how-it-works-eyebrow">Referencias externas</p>
                  <h2 id="videos-heading">Videos y tutoriales</h2>
                </div>
                <p>Ideas y técnicas complementarias enlazadas a sus canales originales de YouTube.</p>
              </div>
              <div className="how-it-works-video-grid">
                {visibleVideos.map((video) => <HowItWorksVideoCard key={video.url} video={video} />)}
              </div>
            </section>
          ) : null}

          {visibleModules.length > 0 ? (
            <section className="how-it-works-section" aria-labelledby="modules-heading">
              <div className="how-it-works-section-heading">
                <div>
                  <p className="how-it-works-eyebrow">Guías de PrintShop</p>
                  <h2 id="modules-heading">Explorar por módulo</h2>
                </div>
                <p>Consulta la documentación del área que quieres conocer y vuelve al centro cuando lo necesites.</p>
              </div>
              <div className="how-it-works-module-grid">
                {visibleModules.map((module) => <HowItWorksModuleCard key={module.slug} module={module} />)}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
