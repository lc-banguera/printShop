import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
  min?: number;
  size?: 'sm' | 'md';
}

export function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  disabled = false,
  min = 1,
  size = 'md',
}: QuantityControlProps) {
  const isSm = size === 'sm';

  return (
    <div
      className={`inline-flex select-none items-center rounded-control border border-border bg-surface shadow-subtle ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= min}
        className={`${
          isSm ? 'h-8 w-8' : 'h-9 w-9'
        } flex items-center justify-center rounded-l-control text-foregroundMuted transition-colors hover:bg-surfaceMuted hover:text-foreground active:bg-surfaceStrong disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
        aria-label="Disminuir cantidad"
      >
        <Minus className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </button>

      <span
        className={`${
          isSm ? 'w-7 h-6 text-xs' : 'w-8 h-7 sm:w-9 sm:h-8 text-xs sm:text-[13px]'
        } flex items-center justify-center border-x border-border bg-surface font-semibold text-foreground`}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        className={`${
          isSm ? 'h-8 w-8' : 'h-9 w-9'
        } flex items-center justify-center rounded-r-control text-foregroundMuted transition-colors hover:bg-surfaceMuted hover:text-foreground active:bg-surfaceStrong disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
        aria-label="Aumentar cantidad"
      >
        <Plus className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </button>
    </div>
  );
}

export default QuantityControl;
