import * as React from "react";
import type { HeroData } from "../../data/hero.data";
import { HeroButtons } from "./HeroButtons";

interface HeroContentProps {
  data: HeroData;
}

export const HeroContent: React.FC<HeroContentProps> = ({ data }) => {
  return (
    <div className="flex max-w-[36rem] flex-col">
      {/* Eyebrow */}
      {data.eyebrow && (
        <span className="text-sm font-semibold text-[var(--primary)]">
          {data.eyebrow}
        </span>
      )}

      {/* Main Headline */}
      <h1 className="mt-3 text-[2.8rem] font-extrabold leading-[1.04] tracking-normal text-[var(--text-primary)] sm:text-[3.65rem] lg:text-[4rem] xl:text-[4.5rem]">
        {data.titleLines[0]}
        <br />
        <span className="relative inline-flex items-center">
          <span>{data.titleLines[1]}</span>
          <svg
            className="ml-3 inline-block h-5 w-5 text-[var(--primary)] sm:h-6 sm:w-6 lg:ml-4 lg:h-7 lg:w-7"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </span>
        <br />
        <span className="text-[var(--primary)]">{data.accentTitle}</span>
      </h1>

      {/* Description */}
      <p className="mt-6 max-w-[500px] text-base leading-7 text-[var(--text-secondary)] sm:text-[17px] sm:leading-8">
        {data.description}
      </p>

      {/* Action Buttons */}
      <HeroButtons primary={data.primaryCta} secondary={data.secondaryCta} />
    </div>
  );
};
