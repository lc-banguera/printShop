import { Link } from 'react-router-dom';
import type { DocumentationArticle } from '../data/how-it-works.data';

export function HowItWorksArticle({ article, relatedArticles }: { article: DocumentationArticle; relatedArticles: DocumentationArticle[] }) {
  return (
    <article className="how-it-works-article">
      <header className="how-it-works-article-header">
        <p className="how-it-works-eyebrow">{article.module}</p>
        <h1>{article.title}</h1>
        <p>{article.intro}</p>
      </header>

      <div className="how-it-works-article-content">
        {article.sections.map((section) => (
          <section key={section.id} id={section.id} className="how-it-works-article-section" aria-labelledby={`${section.id}-heading`}>
            <h2 id={`${section.id}-heading`}>{section.title}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.steps ? (
              <ol>
                {section.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            ) : null}
            {section.items ? (
              <ul>
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      {relatedArticles.length > 0 ? (
        <section className="how-it-works-related" aria-labelledby="related-documents-heading">
          <h2 id="related-documents-heading">También puede interesarte</h2>
          <div className="how-it-works-related-links">
            {relatedArticles.map((related) => (
              <Link key={related.slug} to={`/como-funciona/documentacion/${related.slug}`}>{related.title}</Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
