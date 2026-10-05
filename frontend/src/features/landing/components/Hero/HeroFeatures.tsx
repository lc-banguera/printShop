import * as React from "react";
import type { HeroCapabilityIcon, HeroFeature } from "../../data/hero.data";

// Icon components — each matches the coloured rounded-square icon style visible in the reference.
// The reference shows small icons with an accent tint, rendered inline with text.

const CubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect width="20" height="20" rx="5" fill="#EEF0FF" />
    <path
      d="M10 4L15.5 7.25V13.75L10 17L4.5 13.75V7.25L10 4Z"
      stroke="#5D46E8"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M10 4V10.5M10 10.5L15.5 7.25M10 10.5L4.5 7.25"
      stroke="#5D46E8"
      strokeWidth="1.5"
    />
  </svg>
);

const TemplatesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect width="20" height="20" rx="5" fill="#EEF0FF" />
    <rect x="4" y="4" width="5" height="5" rx="1" fill="#5D46E8" />
    <rect
      x="11"
      y="4"
      width="5"
      height="5"
      rx="1"
      fill="#5D46E8"
      opacity="0.5"
    />
    <rect
      x="4"
      y="11"
      width="5"
      height="5"
      rx="1"
      fill="#5D46E8"
      opacity="0.5"
    />
    <rect
      x="11"
      y="11"
      width="5"
      height="5"
      rx="1"
      fill="#5D46E8"
      opacity="0.3"
    />
  </svg>
);

const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect width="20" height="20" rx="5" fill="#EEF0FF" />
    <path
      d="M3 6h9v7H3V6ZM12 8h2.5L16 10.5V13h-4V8Z"
      stroke="#5D46E8"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <circle cx="6" cy="13.5" r="1.25" fill="#5D46E8" />
    <circle cx="14" cy="13.5" r="1.25" fill="#5D46E8" />
  </svg>
);

const iconMap: Record<HeroCapabilityIcon, React.ReactNode> = {
  package: <CubeIcon />,
  box: <TemplatesIcon />,
  palette: <TruckIcon />,
  layers: <TemplatesIcon />,
  image: <CubeIcon />,
};

interface HeroFeaturesProps {
  features: HeroFeature[];
}

export const HeroFeatures: React.FC<HeroFeaturesProps> = ({ features }) => {
  return (
    <ul className="flex flex-col gap-3">
      {features.map((item) => (
        <li key={item.icon} className="flex items-center gap-3">
          <span className="shrink-0">{iconMap[item.icon]}</span>
          <span className="text-[15px] font-medium text-[#161823]">
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
};
