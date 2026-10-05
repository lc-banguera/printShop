import * as React from 'react';
import { ChevronDown, Truck } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Container } from '@/shared/components/Container';
import { headerData } from '../../data/header.data';

interface TopBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TopBar: React.FC<TopBarProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'select-none bg-transparent text-[11px] font-medium text-foreground/75',
        className,
      )}
      {...props}
    >
      <Container variant="wide" className="flex items-center justify-between gap-3 py-2">
        <div className="hidden flex-1 md:block" />

        <div className="flex flex-1 items-center justify-center gap-1.5 text-center text-[11px] tracking-[0.02em] text-foreground/75 sm:text-[12px]">
          <Truck aria-hidden="true" className="h-3.5 w-3.5 text-foreground/70" />
          <span>{headerData.shippingMessage}</span>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4 text-[11px] font-medium text-foreground/75 sm:text-[12px]">
          <a href={headerData.helpHref} className="transition-colors duration-200 hover:text-foreground">
            {headerData.helpText}
          </a>
          <button
            className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground focus:outline-none"
            aria-label="Select Language"
            type="button"
          >
            <span>{headerData.currentLanguage}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </Container>
    </div>
  );
};
