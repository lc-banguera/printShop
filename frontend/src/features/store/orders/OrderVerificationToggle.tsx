import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface OrderVerificationToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

export const OrderVerificationToggle: React.FC<OrderVerificationToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  required = false,
  className,
  id,
}) => {
  const toggle = React.useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, disabled, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-required={required}
      tabIndex={disabled ? -1 : 0}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      id={id}
      className={cn(
        "flex items-center justify-between gap-3 p-2.5 rounded-[4px] border border-[#E2E8F0] bg-white transition-colors cursor-pointer select-none",
        "hover:bg-[#F8FAFC]",
        disabled && "opacity-50 cursor-not-allowed hover:bg-white",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <span className="text-xs text-[#334155] font-normal leading-tight block">
          {label}
          {required && <span className="text-[#EF4444] ml-1 font-bold">*</span>}
        </span>
        {description && (
          <p className="text-[10.5px] text-[#64748B] mt-0.5 leading-normal">
            {description}
          </p>
        )}
      </div>

      {/* Switch estilo teléfono: OFF gris neutro, ON azul PrintShop */}
      <div
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
          checked ? "bg-[#2563EB]" : "bg-[#CBD5E1]",
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-200",
            checked ? "translate-x-[18px]" : "translate-x-[3px]",
          )}
        />
      </div>
    </div>
  );
};

export default OrderVerificationToggle;
