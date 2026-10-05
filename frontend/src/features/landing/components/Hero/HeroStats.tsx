import * as React from 'react';

interface StatsShape {
  avatars: string[];
  customers: string;
  rating: number;
}

interface HeroStatsProps {
  stats: StatsShape;
}

// Four avatar sample images / colored placeholders matching reference
const AVATAR_COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B'];

export const HeroStats: React.FC<HeroStatsProps> = ({ stats }) => {
  const { avatars, customers, rating } = stats;
  const displayCount = 4;

  return (
    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
      {/* Overlapping avatar cluster */}
      <div className="flex -space-x-2 shrink-0">
        {Array.from({ length: displayCount }).map((_, i) => {
          const src = avatars[i];
          return src ? (
            <img
              key={i}
              src={src}
              alt="Cliente"
              className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
            />
          ) : (
            <div
              key={i}
              className="h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
            />
          );
        })}
      </div>

      {/* Customer text + Divider + Stars + Rating score strictly aligned on the SAME horizontal baseline */}
      <div className="flex items-center gap-2 sm:gap-3 text-sm">
        <span className="font-bold text-[#161823] whitespace-nowrap">
          {customers} clientes felices
        </span>

        <span className="text-[#D1D5DB] font-light" aria-hidden>|</span>

        <div className="flex items-center gap-1 shrink-0">
          {/* 5 gold stars */}
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="15" height="15" viewBox="0 0 15 15" fill="#FBBF24" aria-hidden>
              <path d="M7.5 1l1.8 3.65 4.03.58-2.92 2.84.69 4.02-3.6-1.89-3.6 1.89.69-4.02-2.92-2.84 4.03-.58L7.5 1z" />
            </svg>
          ))}
          <span className="text-[#4B5563] font-semibold text-xs ml-1 whitespace-nowrap">
            {rating}/5
          </span>
        </div>
      </div>
    </div>
  );
};
