import * as React from 'react';
import { Box, Image as ImageIcon, Layers, Monitor, Palette } from 'lucide-react';
import type { HeroCapability, HeroCapabilityIcon } from '../../data/hero.data';

const iconMap: Record<HeroCapabilityIcon, React.ElementType> = {
  package: Box,
  box: Monitor,
  palette: Palette,
  layers: Layers,
  image: ImageIcon,
};

interface HeroCapabilitiesProps {
  capabilities: HeroCapability[];
}

export const HeroCapabilities: React.FC<HeroCapabilitiesProps> = ({ capabilities }) => (
  <div className="w-full">
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6 xl:gap-x-8">
      {capabilities.map(({ icon, label, description }) => {
        const Icon = iconMap[icon] ?? Box;
        return (
          <div key={label} className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#5D46E8] shadow-[0_2px_10px_rgba(93,70,232,0.08)]">
              <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-[13.5px] font-bold tracking-tight text-[#111827]">
                {label}
              </span>
              <span className="block truncate text-[11.5px] font-medium text-[#6B7280]">
                {description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
