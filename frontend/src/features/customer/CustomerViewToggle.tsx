import { Grid2X2, List } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type CustomerViewMode = "grid" | "table";

export function CustomerViewToggle({
  value,
  onChange,
}: {
  value: CustomerViewMode;
  onChange: (value: CustomerViewMode) => void;
}) {
  return (
    <div
      className="inline-flex h-[42px] border border-slate-200/60 bg-slate-100 p-1"
      style={{ borderRadius: 5 }}
      aria-label="Cambiar vista"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "inline-flex h-full min-w-[86px] items-center justify-center gap-1.5 px-2.5 text-xs font-semibold transition-all duration-normal active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30",
          value === "grid"
            ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
            : "text-slate-600 hover:text-slate-900",
        )}
        style={{ borderRadius: 4 }}
      >
        <Grid2X2 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        <span>Cuadrícula</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={cn(
          "inline-flex h-full min-w-[86px] items-center justify-center gap-1.5 px-2.5 text-xs font-semibold transition-all duration-normal active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30",
          value === "table"
            ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
            : "text-slate-600 hover:text-slate-900",
        )}
        style={{ borderRadius: 4 }}
      >
        <List className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        <span>Lista</span>
      </button>
    </div>
  );
}
