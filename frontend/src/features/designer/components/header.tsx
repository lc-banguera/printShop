import {
  Sparkles,
  ShoppingBag,
  LayoutTemplate,
  FolderHeart,
  Lightbulb,
  Undo2,
  Redo2,
  Bookmark,
  ShoppingCart,
} from 'lucide-react';
import { Avatar } from '@/shared/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown';

export function DesignerHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e8e8f0] bg-white px-6 select-none shrink-0">
      <div className="flex h-16 items-center justify-between">
        {/* ── Left: Logo & Navigation Pills ── */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex flex-col">
            <span className="text-xl font-black italic tracking-tight text-[#5046e5]">
              Print<span className="text-[#e50c74]">Pro</span>
            </span>
            <span className="text-[10px] font-medium text-[#8E96A6] -mt-1 tracking-wider">
              Diseña sin límites
            </span>
          </div>

          {/* Nav Items */}
          <nav className="flex items-center gap-6">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full bg-[#fde8f3] px-3.5 py-1.5 text-xs font-bold text-[#e50c74] transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Diseño</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 text-xs font-semibold text-[#171421] hover:text-[#5046e5] transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-[#5e5d72]" />
              <span>Productos</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 text-xs font-semibold text-[#171421] hover:text-[#5046e5] transition-colors"
            >
              <LayoutTemplate className="h-4 w-4 text-[#5e5d72]" />
              <span>Plantillas</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 text-xs font-semibold text-[#171421] hover:text-[#5046e5] transition-colors"
            >
              <FolderHeart className="h-4 w-4 text-[#5e5d72]" />
              <span>Mis Diseños</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 text-xs font-semibold text-[#171421] hover:text-[#5046e5] transition-colors"
            >
              <Lightbulb className="h-4 w-4 text-[#5e5d72]" />
              <span>Inspiración</span>
            </button>
          </nav>
        </div>

        {/* ── Center: Undo / Redo ── */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5e5d72] hover:bg-[#f4f4f7] hover:text-[#171421] transition-all"
            title="Deshacer"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5e5d72] hover:bg-[#f4f4f7] hover:text-[#171421] transition-all"
            title="Rehacer"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        {/* ── Right: Guardar, Agregar al carrito, Avatar ── */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#5046e5] bg-white px-4 text-xs font-bold text-[#5046e5] transition-all hover:bg-[#eeebff]"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Guardar</span>
          </button>

          <button
            type="button"
            className="relative flex h-9 items-center gap-2 rounded-xl bg-[#e50c74] px-5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#d00a68]"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Agregar al carrito</span>
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#e50c74] text-[10px] font-bold text-white shadow-xs">
              3
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="outline-none">
                <Avatar
                  className="h-9 w-9 border-2 border-white shadow-xs cursor-pointer"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  fallback="CB"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Mis Pedidos</DropdownMenuItem>
              <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

