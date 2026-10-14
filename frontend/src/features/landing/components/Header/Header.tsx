import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { Navbar } from './Navbar';

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Header: React.FC<HeaderProps> = ({ className, ...props }) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-black/[0.06] bg-white/75 shadow-[0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-2xl backdrop-saturate-[180%] transition-colors',
        className,
      )}
      {...props}
    >
      <Navbar />
    </header>
  );
};
