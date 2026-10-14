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
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-primary sm:text-sm">
          {data.eyebrow}
        </span>
      )}

      {/* Main Headline — un solo color sólido, sin gradientes ni adornos decorativos */}
      <h1 className="mt-2 text-[2.25rem] font-bold leading-[1.08] tracking-[-0.035em] text-[#0F172A] sm:text-[3.5rem] sm:leading-[1.05] lg:text-[3.85rem] lg:text-[3rem]">
        <span className="block">{data.titleLines[0]}</span>
        <span className="block">{data.titleLines[1]}</span>
        <span className="block">{data.accentTitle}</span>
      </h1>

      {/* Description */}
      <p className="mt-5 max-w-[490px] text-base leading-relaxed tracking-[-0.01em] text-foregroundMuted sm:text-lg sm:leading-8">
        {data.description}
      </p>

      {/* Action Buttons */}
      <HeroButtons primary={data.primaryCta} secondary={data.secondaryCta} />
    </div>
  );
};
