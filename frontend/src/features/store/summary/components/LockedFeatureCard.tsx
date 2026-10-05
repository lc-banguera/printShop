import * as React from "react";
import { Lock } from "lucide-react";

export interface LockedFeatureCardProps {
  title: string;
  description: string;
}

export const LockedFeatureCard: React.FC<LockedFeatureCardProps> = ({
  title,
  description,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col hover:border-[#CBD5E1] transition-colors">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-[#64748B] shrink-0" strokeWidth={2} />

        <h3 className="text-[14px] font-medium text-[#334155] leading-snug">
          {title}
        </h3>
      </div>

      <p className="text-[12px] text-[#94A3B8] leading-relaxed mt-1">
        {description}
      </p>
    </div>
  );
};
