import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { headerData } from '../../data/header.data';

interface LogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export const Logo: React.FC<LogoProps> = ({ className, ...props }) => {
  return (
    <Link to="/" className={cn('flex cursor-pointer select-none flex-col', className)} {...props}>
      <div className="flex items-baseline leading-none">
        <span className="text-[1.35rem] font-black tracking-normal text-[#111827] sm:text-[1.7rem] lg:text-[1.85rem]">
          {headerData.logoText}
        </span>
        <span className="text-[1.35rem] font-black tracking-normal text-[#5D46E8] sm:text-[1.7rem] lg:text-[1.85rem]">
          {headerData.logoTextAccent}
        </span>
      </div>
      <span className="mt-0.5 text-[7.5px] font-semibold uppercase tracking-[0.2em] text-[#6B7280] sm:text-[8px]">
        {headerData.logoSubtitle}
      </span>
    </Link>
  );
};
