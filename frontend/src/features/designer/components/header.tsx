import { Bookmark, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getEasyModeSession,
  syncEasyModeSessionFromAdvanced,
} from '../services/designer-mode-session';

export function DesignerHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromEasyMode =
    typeof location.state === 'object' &&
    location.state !== null &&
    'fromEasyMode' in location.state &&
    location.state.fromEasyMode === true;
  const canReturnToEasyMode = fromEasyMode && getEasyModeSession() !== null;
  const returnToEasyMode = () => {
    syncEasyModeSessionFromAdvanced();
    navigate('/designer/easy', { state: { fromAdvancedMode: true } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8e8f0] bg-white px-6 select-none shrink-0">
      <div className="flex h-14 items-center justify-between">
        {/* ── Left: Logo & Context ── */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (canReturnToEasyMode) {
                returnToEasyMode();
              } else {
                navigate(-1);
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-[5px] text-[#5e5d72] hover:bg-[#f5f4fb] hover:text-[#171421] transition-colors"
            title={canReturnToEasyMode ? 'Volver al modo fácil' : 'Volver'}
            aria-label={canReturnToEasyMode ? 'Volver al modo fácil' : 'Volver'}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-col">
            <span className="text-xl font-black italic tracking-tight text-[#5046e5]">
              Print<span className="text-[#171421]">Shop</span>
            </span>
            <span className="text-[9px] font-medium text-[#8E96A6] -mt-1 tracking-wider">
              Personalizador de producto
            </span>
          </div>
        </div>

        {/* ── Right: Essential actions (Guardar, Agregar al carrito) ── */}
        <div className="flex items-center gap-3">
          {canReturnToEasyMode && (
            <button
              type="button"
              onClick={returnToEasyMode}
              className="flex h-8 items-center gap-1.5 rounded-[5px] border border-[#5046e5] bg-white px-3.5 text-xs font-semibold text-[#5046e5] transition-all hover:bg-[#eeebff]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Modo fácil</span>
            </button>
          )}
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-[5px] border border-[#5046e5] bg-white px-3.5 text-xs font-semibold text-[#5046e5] transition-all hover:bg-[#eeebff]"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Guardar</span>
          </button>

          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-[5px] bg-[#5046e5] px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#4338ca]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Agregar al carrito</span>
          </button>
        </div>
      </div>
    </header>
  );
}
