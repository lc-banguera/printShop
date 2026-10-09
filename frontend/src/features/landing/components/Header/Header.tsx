import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { Navbar } from './Navbar';

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Header: React.FC<HeaderProps> = ({ className, ...props }) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-white/70 bg-white/80 shadow-[0_1px_0_rgba(22,24,35,0.04)] backdrop-blur-xl transition-colors',
        className,
      )}
      {...props}
    >
      <Navbar />
    </header>
  );
};
