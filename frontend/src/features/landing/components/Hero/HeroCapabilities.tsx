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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 lg:gap-4">
      {capabilities.map(({ icon, label, description }) => {
        const Icon = iconMap[icon] ?? Box;
        return (
          <div
            key={label}
            className="group flex min-w-0 items-center gap-3.5 rounded-2xl border border-white/90 bg-white/70 p-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-black/[0.08] hover:bg-white hover:shadow-card active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                {label}
              </span>
              <span className="block truncate text-xs text-foregroundMuted">
                {description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
