import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { Navbar } from './Navbar';

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Header: React.FC<HeaderProps> = ({ className, ...props }) => {
  return (
    <header
      className={cn('sticky top-0 z-50 w-full bg-[#F4F5FB] transition-colors', className)}
      {...props}
    >
      <Navbar />
    </header>
  );
};
