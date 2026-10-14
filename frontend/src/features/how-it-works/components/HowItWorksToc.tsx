import type { DocumentationSection } from '../data/how-it-works.data';

export function HowItWorksToc({ sections }: { sections: DocumentationSection[] }) {
  return (
    <nav className="how-it-works-toc" aria-label="En esta documentación">
      <p>En esta documentación</p>
      <ol>
        {sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}
      </ol>
    </nav>
  );
}
