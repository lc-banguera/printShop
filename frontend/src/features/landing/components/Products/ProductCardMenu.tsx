import * as React from "react";
import * as ReactDOM from "react-dom";

export interface ProductMenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}

interface ProductCardMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  items: ProductMenuItem[];
  menuId: string;
}

export const ProductCardMenu: React.FC<ProductCardMenuProps> = ({
  isOpen,
  onClose,
  triggerRef,
  items,
  menuId,
}) => {
  const [coords, setCoords] = React.useState<{
    top: number;
    left: number;
  } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [animate, setAnimate] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close when another menu opens
  React.useEffect(() => {
    if (!isOpen) return;

    const handleCloseAll = (e: Event) => {
      const customEvent = e as CustomEvent<{ activeMenuId: string }>;
      if (customEvent.detail?.activeMenuId !== menuId) {
        onClose();
      }
    };

    window.addEventListener("close-all-product-menus", handleCloseAll);
    return () => {
      window.removeEventListener("close-all-product-menus", handleCloseAll);
    };
  }, [isOpen, menuId, onClose]);

  // Handle position calculation on open/resize/scroll
  const updatePosition = React.useCallback(() => {
    if (!isOpen || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 190; // Fixed width matching our styles
    const menuHeight = items.length * 38 + 12; // Approximation

    // Calculate vertical position
    let top = window.scrollY + rect.bottom + 6; // Opens below by default
    if (
      rect.bottom + menuHeight > window.innerHeight &&
      rect.top - menuHeight > 0
    ) {
      top = window.scrollY + rect.top - menuHeight - 6; // Opens above if no space below
    }

    // Calculate horizontal position (align right to trigger by default)
    let left = window.scrollX + rect.right - menuWidth;
    if (left < 10) {
      left = 10; // Keep inside viewport
    } else if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    setCoords({ top, left });
  }, [isOpen, triggerRef, items.length]);

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Let animation run on next tick
      const timer = setTimeout(() => {
        setAnimate(true);
        updatePosition();
      }, 10);

      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, updatePosition]);

  // Click outside listener
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // Escape key listener
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !coords) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      style={{
        position: "absolute",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: "190px",
        zIndex: 9999,
      }}
      className={`
        bg-surface
        border border-border
        rounded-control
        shadow-elevated
        py-1.5
        transition-all duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-opacity
        ${animate ? "opacity-100 scale-100" : "opacity-0 scale-95"}
      `}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            role="menuitem"
            type="button"
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className="
              w-full
              flex items-center gap-2.5
              px-3.5 py-2
              text-left text-xs font-semibold
              text-foreground
              hover:bg-surfaceMuted
              focus-visible:outline-none focus-visible:bg-surfaceMuted
              transition-colors duration-150
            "
          >
            <Icon className="w-4 h-4 text-foregroundSubtle shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>,
    document.body,
  );
};
