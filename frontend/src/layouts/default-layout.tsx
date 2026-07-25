import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

export function DefaultLayout() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-text-secondary">PrintShop Design System</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">Base UI ready for Designer</h1>
          </div>
          <Button variant="secondary">Inicio</Button>
        </div>

        <Card className="w-full rounded-[var(--radius-xl)] border border-border p-8 shadow-sm">
          <div className="space-y-4 text-text-secondary">
            <p>
              Este es el punto de entrada de la aplicación. El sistema de diseño está construido como una base reusable
              con tokens de color, tipografía, espaciado, radios y componentes UI.
            </p>
            <p>La arquitectura está preparada para un proyecto grande: app, features, shared, layouts, providers, routes, hooks, services, store, types y constants.</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
