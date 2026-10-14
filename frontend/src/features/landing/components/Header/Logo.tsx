import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { headerData } from '../../data/header.data';

interface LogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export const Logo: React.FC<LogoProps> = ({ className, ...props }) => {
  return (
    <Link
      to="/"
      className={cn('flex cursor-pointer select-none flex-col transition-transform active:scale-[0.98]', className)}
      {...props}
    >
      <div className="flex items-baseline leading-none">
        <span className="text-[1.2rem] font-black tracking-[-0.03em] text-[#111827] sm:text-[1.65rem] lg:text-[1.8rem]">
          {headerData.logoText}
        </span>
        <span className="text-[1.2rem] font-black tracking-[-0.03em] text-[#5D46E8] sm:text-[1.65rem] lg:text-[1.8rem]">
          {headerData.logoTextAccent}
        </span>
      </div>
      <span className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.22em] text-[#6B7280] sm:text-[8px]">
        {headerData.logoSubtitle}
      </span>
    </Link>
  );
};
