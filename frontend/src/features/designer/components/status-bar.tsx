import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';

export function StatusBar() {
  return (
    <footer className="border-t border-border bg-surface px-6 py-2 shadow-sm">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">✓ Guardado</Badge>
          <Separator orientation="vertical" className="h-4" />
          <span>1 elemento seleccionado</span>
          <span>•</span>
          <span>A4 (210 × 297 mm)</span>
        </div>

        <div className="flex items-center gap-4">
          <span>Zoom: 100%</span>
          <Separator orientation="vertical" className="h-4" />
          <span>RGB (0, 120, 215)</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Sesión activa</span>
        </div>
      </div>
    </footer>
  );
}
