import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'neutral';
  icon?: React.ElementType;
  isLoading?: boolean;
  showCancel?: boolean;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  icon: CustomIcon,
  isLoading = false,
  showCancel = true,
  secondaryAction,
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Icono por defecto según variante
  const DefaultIcon =
    variant === 'danger'
      ? Trash2
      : variant === 'primary'
      ? CheckCircle2
      : variant === 'warning'
      ? AlertTriangle
      : AlertCircle;

  const IconComponent = CustomIcon || DefaultIcon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-normal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-dialog border border-border bg-surface p-5 shadow-modal animate-in fade-in duration-normal sm:p-6">
        {/* Contenedor circular sutil para el icono */}
        <div
          className={`mb-3.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
            variant === 'danger'
              ? 'border-danger-muted bg-danger-muted text-danger-strong'
              : variant === 'warning'
              ? 'border-warning-muted bg-warning-muted text-warning-foreground'
              : variant === 'primary'
              ? 'border-info-muted bg-info-muted text-info'
              : 'border-border bg-surface-muted text-foreground-muted'
          }`}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Título en negro / gris muy oscuro */}
        <h3 className="mb-2 text-[15px] font-bold leading-snug text-foreground sm:text-base">
          {title}
        </h3>

        {/* Descripción en gris neutro */}
        <div className="mb-6 text-xs leading-relaxed text-foreground-muted">
          {typeof description === 'string' ? <p>{description}</p> : description}
        </div>

        {/* Botones de acción alineados */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border-muted pt-4">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="cursor-pointer rounded-control border border-warning-muted bg-warning-muted px-3.5 py-1.5 text-xs font-semibold text-warning-foreground shadow-subtle transition-colors duration-normal hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning"
            >
              {secondaryAction.label}
            </button>
          )}

          {showCancel && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer rounded-control border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground-muted shadow-subtle transition-colors duration-normal hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}

          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`cursor-pointer rounded-control px-4 py-1.5 text-xs font-semibold text-primaryForeground shadow-subtle transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 ${
                variant === 'danger'
                  ? 'bg-danger-strong hover:brightness-95'
                  : variant === 'warning'
                  ? 'bg-warning-foreground hover:brightness-95'
                  : 'bg-primary hover:bg-primaryHover active:bg-primaryActive'
              }`}
            >
              {isLoading ? 'Procesando...' : confirmText}
            </button>
          )}

          {!onConfirm && !showCancel && (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-control border border-border bg-surface px-4 py-1.5 text-xs font-medium text-foreground-muted shadow-subtle transition-colors duration-normal hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
