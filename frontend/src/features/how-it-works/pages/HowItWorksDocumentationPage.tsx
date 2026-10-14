import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';
import { HowItWorksArticle } from '../components/HowItWorksArticle';
import { HowItWorksDocumentationSidebar } from '../components/HowItWorksDocumentationSidebar';
import { HowItWorksToc } from '../components/HowItWorksToc';
import { getHowItWorksArticle } from '../data/how-it-works.data';
import '../how-it-works.css';

export function HowItWorksDocumentationPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = getHowItWorksArticle(slug);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!article) {
    return (
      <div className="how-it-works-shell">
        <Header />
        <main className="how-it-works-container how-it-works-doc-main">
          <section className="how-it-works-empty">
            <h1>Documentación no disponible</h1>
            <p>La guía que buscas no existe o ya no está disponible.</p>
            <Link className="how-it-works-button how-it-works-button-primary" to="/como-funciona">Volver a Cómo funciona</Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedArticles = article.relatedSlugs
    .map((relatedSlug) => getHowItWorksArticle(relatedSlug))
    .filter((related): related is NonNullable<typeof related> => Boolean(related));

  return (
    <div className="how-it-works-shell">
      <Header />
      <main className="how-it-works-container how-it-works-doc-main">
        <div className="how-it-works-doc-toolbar">
          <button type="button" className="how-it-works-back-button" onClick={() => navigate(-1)}>
            <ArrowLeft aria-hidden="true" /> Atrás
          </button>
          <Link to="/como-funciona" className="how-it-works-back-link">Centro de Cómo funciona</Link>
        </div>
        <div className="how-it-works-doc-layout">
          <HowItWorksDocumentationSidebar />
          <HowItWorksArticle article={article} relatedArticles={relatedArticles} />
          <HowItWorksToc sections={article.sections} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
