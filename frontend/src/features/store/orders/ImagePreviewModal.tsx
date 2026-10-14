import * as React from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink } from "lucide-react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  imageAlt?: string;
  title?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  imageUrl,
  imageAlt = "Vista previa de imagen",
  title = "Referencia del Cliente",
  onClose,
}) => {
  // Manejador de Escape para cerrar modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#0F172A] border border-[#334155] rounded-[4px] max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header — Sin icono decorativo superior */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155] bg-[#1E293B]">
          <span className="text-xs font-bold text-white tracking-wide">
            {title}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94A3B8] hover:text-white p-1 rounded-[4px] transition-colors text-xs inline-flex items-center gap-1"
              title="Abrir imagen original"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-[#94A3B8] hover:text-white p-1 rounded-[4px] transition-colors"
              title="Cerrar vista previa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Imagen central */}
        <div className="p-4 flex items-center justify-center bg-[#0B0F19] min-h-[320px] max-h-[70vh] overflow-auto">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="max-h-[65vh] max-w-full object-contain rounded-[4px] border border-[#334155]/60"
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#1E293B] border-t border-[#334155] flex items-center justify-between text-[11px] text-[#94A3B8]">
          <span>Inspección de referencia para taller de producción</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-[#334155] hover:bg-[#475569] text-white rounded-[4px] text-xs font-medium transition-colors"
          >
            Cerrar vista previa
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
};
