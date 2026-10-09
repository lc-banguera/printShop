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
    <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:mt-9">
      <Link
        to={primary.href}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primaryForeground shadow-[0_7px_18px_rgba(93,70,232,0.22)] transition-[background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-primaryHover hover:shadow-[0_10px_24px_rgba(93,70,232,0.28)] active:translate-y-0 active:scale-[0.98]"
      >
        <PencilLine className="h-4 w-4" aria-hidden="true" />
        <span>{primary.label}</span>
      </Link>

      <Link
        to={secondary.href}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-white/85 px-6 py-3 text-sm font-semibold text-primary shadow-subtle transition-[background-color,border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white active:translate-y-0 active:scale-[0.98]"
      >
        <Grid2X2 className="h-4 w-4" aria-hidden="true" />
        <span>{secondary.label}</span>
      </Link>
    </div>
  );
};
