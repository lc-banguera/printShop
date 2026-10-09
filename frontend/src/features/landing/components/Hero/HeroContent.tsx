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
      <span className="text-[13.5px] font-semibold text-[var(--primary)] tracking-wide sm:text-[14.5px]">
        {data.eyebrow}
      </span>

      {/* Main Headline */}
      <h1 className="mt-2.5 text-[2.75rem] font-black leading-[1.03] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[3.25rem] lg:text-[3.75rem] xl:text-[4.2rem]">
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
      <p className="mt-5 max-w-[490px] text-base leading-relaxed text-[var(--text-secondary)] sm:text-[17px] sm:leading-7">
        {data.description}
      </p>

      {/* Action Buttons */}
      <HeroButtons primary={data.primaryCta} secondary={data.secondaryCta} />
    </div>
  );
};
