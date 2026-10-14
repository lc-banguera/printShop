export function CanvasArea() {
  return (
    <main className="flex-1 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-100" onDoubleClick={() => { const { requestFit } = require('@/store/viewer-store').useViewerStore.getState(); requestFit(); }}>
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Canvas Placeholder */}
          <div className="rounded-lg border-2 border-dashed border-border bg-surface p-16 shadow-xs">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-5xl opacity-50">🎨</div>
              <h3 className="text-lg font-semibold text-text-secondary">Área de Diseño</h3>
              <p className="max-w-xs text-sm text-text-muted">
                Aquí se renderizará el canvas con React-Konva. Espacio reservado para el editor visual.
              </p>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="fixed bottom-24 right-8 flex flex-col gap-2 rounded-lg border border-border bg-surface p-2 shadow-md">
            <button className="rounded px-3 py-1 text-sm font-medium text-text-secondary hover:bg-background hover:text-text-primary">
              +
            </button>
            <div className="px-3 py-1 text-center text-xs text-text-muted">100%</div>
            <button className="rounded px-3 py-1 text-sm font-medium text-text-secondary hover:bg-background hover:text-text-primary">
              −
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
