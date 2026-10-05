import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastData = {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
};

type ToastContextValue = {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  dismissToast: (id: string) => void;
  toasts: ToastData[];
};

const ToastContext = createContext<ToastContextValue | null>(null);

const autocloseByType: Record<ToastType, number> = {
  success: 4500,
  info: 4500,
  warning: 4500,
  error: 4500,
};

const iconMap = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: AlertCircle,
} as const;

const accentMap: Record<ToastType, string> = {
  success: 'text-[#15803D]',
  info: 'text-[#1D4ED8]',
  warning: 'text-[#B45309]',
  error: 'text-[#B91C1C]',
};

const borderMap: Record<ToastType, string> = {
  success: 'border-[#DCFCE7] bg-[#F0FDF4]',
  info: 'border-[#DBEAFE] bg-[#F8FBFF]',
  warning: 'border-[#FDE68A] bg-[#FFFBEB]',
  error: 'border-[#FECACA] bg-[#FEF2F2]',
};

function ToastItem({ toast, onClose }: { toast: ToastData; onClose: (id: string) => void }) {
  const Icon = iconMap[toast.type];

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={[
        'pointer-events-auto relative w-full max-w-[380px] rounded-[6px] border p-4 shadow-lg shadow-slate-200/60 transition-all duration-200 ease-out',
        borderMap[toast.type],
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className={['mt-0.5 flex h-8 w-8 items-center justify-center rounded-[5px] bg-white/60', accentMap[toast.type]].join(' ')}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1 pr-6">
          <p className="text-sm font-semibold leading-5 text-[#0F172A]">{toast.title}</p>
          <p className="mt-1 text-sm leading-5 text-[#475569]">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#475569] transition-colors hover:bg-white/60 hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="Cerrar notificación"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const clearToastTimer = useCallback((id: string) => {
    const timerId = timersRef.current.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    clearToastTimer(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, [clearToastTimer]);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const entry: ToastData = {
      id,
      duration: toast.duration ?? autocloseByType[toast.type],
      ...toast,
    };

    setToasts((current) => [...current, entry]);

    if (entry.duration && entry.duration > 0) {
      const timerId = window.setTimeout(() => {
        dismissToast(id);
      }, entry.duration);

      timersRef.current.set(id, timerId);
    }
  }, [dismissToast]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast, dismissToast, toasts }), [showToast, dismissToast, toasts]);

  const portalNode = typeof document !== 'undefined' ? document.body : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portalNode && createPortal(
        <div className="pointer-events-none fixed left-4 right-4 top-6 z-50 flex flex-col items-end gap-3 md:left-auto md:right-6 md:w-[380px]">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto w-full transition-all duration-200 ease-out">
              <ToastItem toast={toast} onClose={dismissToast} />
            </div>
          ))}
        </div>,
        portalNode,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
