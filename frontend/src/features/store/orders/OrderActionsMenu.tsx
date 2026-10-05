import * as React from "react";
import ReactDOM from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { getOrderActionAvailability } from "./orderActions";
import type { StoreOrderFull, OrderActionDefinition } from "./types";

interface Props {
  order: StoreOrderFull;
  onTriggerAction: (order: StoreOrderFull, action: OrderActionDefinition) => void;
  onOpenTracking: (order: StoreOrderFull) => void;
  onViewDetail: (order: StoreOrderFull) => void;
}

export const OrderActionsMenu: React.FC<Props> = ({ order, onTriggerAction, onOpenTracking, onViewDetail }) => {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const portalElRef = React.useRef<HTMLDivElement | null>(null);

  const [menuStyles, setMenuStyles] = React.useState<{ top: number; left: number } | null>(null);

  const items = React.useMemo(() => getOrderActionAvailability(order), [order]);
  const visible = items.filter((i) => i.status !== "HIDDEN");

  // Create portal container
  React.useEffect(() => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    portalElRef.current = el;
    return () => {
      if (portalElRef.current) document.body.removeChild(portalElRef.current);
      portalElRef.current = null;
    };
  }, []);

  // Positioning logic
  React.useEffect(() => {
    if (!open) return;
    const reposition = () => {
      const btn = buttonRef.current;
      const menu = menuRef.current;
      if (!btn || !portalElRef.current) return;
      const rect = btn.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Default placement below
      let left = rect.right - 224; // default menu width 224 (w-56)
      let top = rect.bottom + 8;
      // Adjust horizontal
      const menuWidth = menu?.offsetWidth || 224;
      if (left + menuWidth + 8 > vw) {
        left = Math.max(8, vw - menuWidth - 8);
      }
      if (left < 8) left = 8;

      // If not enough space below, open above
      const menuHeight = menu?.offsetHeight || 200;
      if (vh - rect.bottom < menuHeight + 24) {
        // open above
        top = rect.top - menuHeight - 8;
        if (top < 8) top = 8;
      }

      setMenuStyles({ top, left });
    };

    // Initial reposition after a tick to allow measuring
    const t = setTimeout(reposition, 0);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition);
    };
  }, [open]);

  // Outside click / escape handling
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      if (menuRef.current && menuRef.current.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const Menu = (
    <div
      ref={menuRef}
    className="w-56 bg-white border border-[#E2E8F0] rounded-[4px] shadow-lg z-40"
      style={menuStyles ? { position: "fixed", top: menuStyles.top, left: menuStyles.left } : { visibility: "hidden", position: "fixed", top: 0, left: 0 }}
    >
      <div className="py-1">
        {visible.map((it, idx) => {
          if (it.status === "DISABLED") {
            return (
              <button
                key={idx}
                type="button"
                disabled
                className="w-full text-left px-3 py-2 text-xs text-[#94A3B8] cursor-not-allowed opacity-60 border-b border-[#F8FAFC]"
              >
                <span className="flex-1">{it.action?.label || "Acción"}</span>
              </button>
            );
          }

          const act = (it as any).action as OrderActionDefinition;
          const handleClick = () => {
            setOpen(false);
            if (act.type === "RASTREAR_GUIA") {
              onOpenTracking(order);
              return;
            }
            onTriggerAction(order, act);
          };

          return (
            <button
              key={act.type}
              type="button"
              onClick={handleClick}
              className="w-full text-left px-3 py-2 text-xs hover:bg-[#F8FAFC] flex items-center gap-2"
            >
              <span className="flex-1">{act.label}</span>
            </button>
          );
        })}

        <div className="border-t border-[#F1F5F9] mt-1">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onViewDetail(order);
            }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-[#F8FAFC]"
          >
            Ver detalle
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        aria-label="Acciones del pedido"
        type="button"
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[#475569] hover:bg-[#F1F5F9] transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {portalElRef.current && open && ReactDOM.createPortal(Menu, portalElRef.current)}
    </>
  );
};
