import * as React from 'react';
import { Benefit } from '../../data/benefits.data';

interface BenefitCardProps {
  benefit: Benefit;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ benefit }) => {
  const { icon: Icon, title, description } = benefit;

  return (
    <div className="flex min-w-0 items-center gap-3 px-2 py-2">
      {/* Icono lineal en primary */}
      <div className="flex shrink-0 items-center justify-center w-9 h-9 rounded-lg bg-accentMuted text-primary">
        <Icon className="h-4 w-4 stroke-[1.75]" />
      </div>

      <div className="min-w-0">
        <h3 className="text-xs font-bold leading-tight text-foreground sm:text-[13px]">
          {title}
        </h3>
        <p className="mt-0.5 text-[11px] leading-snug text-foregroundMuted sm:text-xs">
          {description}
        </p>
      </div>
    </div>
  );
};