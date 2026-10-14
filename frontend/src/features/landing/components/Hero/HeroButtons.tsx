import * as React from "react";
import { Link } from "react-router-dom";
import { Grid2X2, PencilLine } from 'lucide-react';

interface ButtonLink {
  label: string;
  href: string;
}

interface HeroButtonsProps {
  primary: ButtonLink;
  secondary: ButtonLink;
}

export const HeroButtons: React.FC<HeroButtonsProps> = ({
  primary,
  secondary,
}) => {
  return (
    <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
      <Link
        to={primary.href}
        className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(93,70,232,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#503cd4] hover:shadow-[0_12px_28px_rgba(93,70,232,0.32)] active:translate-y-0 active:scale-[0.97]"
      >
        <PencilLine className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
        <span>{primary.label}</span>
      </Link>

      <Link
        to={secondary.href}
        className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl border border-black/[0.08] bg-white/80 backdrop-blur-xl px-6 py-3.5 text-sm font-semibold text-foreground/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-primary hover:border-black/15 hover:shadow-card active:translate-y-0 active:scale-[0.97]"
      >
        <Grid2X2 className="h-4 w-4 text-primary" aria-hidden="true" strokeWidth={2} />
        <span>{secondary.label}</span>
      </Link>
    </div>
  );
};
