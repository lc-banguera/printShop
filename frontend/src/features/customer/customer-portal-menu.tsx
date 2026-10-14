import * as React from "react";
import { createPortal } from "react-dom";

export function CustomerPortalMenu({
  open,
  anchorRef,
  onClose,
  children,
  minWidth = 190,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: React.ReactNode;
  minWidth?: number;
}) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0, openUp: false });

  const updatePosition = React.useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const estimatedMenuHeight = 160;
    const openUp = rect.bottom + estimatedMenuHeight > window.innerHeight && rect.top > estimatedMenuHeight;
    setPosition({
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      left: Math.min(Math.max(8, rect.right - minWidth), window.innerWidth - minWidth - 8),
      openUp,
    });
  }, [anchorRef, minWidth]);

  React.useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!anchorRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    updatePosition();
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, onClose, open, updatePosition]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-[80] border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: position.top,
        left: position.left,
        minWidth,
        borderRadius: 5,
        transform: position.openUp ? "translateY(-100%)" : undefined,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
}
