import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HowItWorksModule } from '../data/how-it-works.data';

export function HowItWorksModuleCard({ module }: { module: HowItWorksModule }) {
  return (
    <Link className="how-it-works-module-card" to={`/como-funciona/documentacion/${module.articleSlug}`}>
      <span className="how-it-works-module-card-title">{module.title}</span>
      <span className="how-it-works-module-card-description">{module.description}</span>
      <span className="how-it-works-module-card-link">Abrir documentación <ArrowUpRight aria-hidden="true" /></span>
    </Link>
  );
}
