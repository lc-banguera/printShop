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
        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[10px] bg-[#5D46E8] px-6 py-3 text-[14.5px] font-semibold text-white shadow-[0_4px_14px_rgba(93,70,232,0.3)] transition-all duration-200 hover:bg-[#4F35E2] hover:shadow-[0_6px_20px_rgba(93,70,232,0.4)] hover:scale-[1.01]"
      >
        <PencilLine className="h-4 w-4" aria-hidden="true" />
        <span>{primary.label}</span>
      </Link>

      <Link
        to={secondary.href}
        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[10px] border border-[#5D46E8]/30 bg-white/90 px-6 py-3 text-[14.5px] font-semibold text-[#5D46E8] shadow-[0_2px_8px_rgba(30,34,72,0.04)] transition-all duration-200 hover:border-[#5D46E8]/50 hover:bg-white hover:shadow-[0_4px_12px_rgba(30,34,72,0.08)]"
      >
        <Grid2X2 className="h-4 w-4" aria-hidden="true" />
        <span>{secondary.label}</span>
      </Link>
    </div>
  );
};
