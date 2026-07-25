import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown';

export function DesignerHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface shadow-xs">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-1">
            <h1 className="font-sans text-xl font-bold text-text-primary">PrintPro</h1>
            <p className="text-xs text-text-muted">Diseña sin límites</p>
          </div>

          <nav className="hidden md:flex gap-6">
            <Button variant="ghost" size="sm" className="font-medium text-text-secondary hover:text-text-primary">
              🎨 Diseño
            </Button>
            <Button variant="ghost" size="sm" className="font-medium text-text-secondary hover:text-text-primary">
              📦 Productos
            </Button>
            <Button variant="ghost" size="sm" className="font-medium text-text-secondary hover:text-text-primary">
              📋 Plantillas
            </Button>
            <Button variant="ghost" size="sm" className="font-medium text-text-secondary hover:text-text-primary">
              🎯 Mis Diseños
            </Button>
            <Button variant="ghost" size="sm" className="font-medium text-text-secondary hover:text-text-primary">
              💡 Inspiración
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">↶</Button>
          <Button variant="ghost" size="sm">↷</Button>
          <Button variant="secondary">💾 Guardar</Button>
          <Button className="gap-2 bg-accentPink hover:bg-[#d10a6b]">
            <span>🛒</span>
            <span>Agregar al carrito</span>
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-accentPink">3</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" fallback="CB" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
