import * as React from 'react';
import { PackageOpen } from 'lucide-react';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';
import { Container } from '@/shared/components/Container';
import { designPacks } from '../data/design-packs.data';

export const DesignMarketplacePage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <Container variant="wide">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Recursos digitales</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Diseños</h1>
            <p className="mt-3 text-sm leading-6 text-foregroundMuted sm:text-base">
              Explora packs de diseños listos para utilizar en PrintShop.
            </p>
          </div>

          {designPacks.length === 0 ? (
            <section className="mt-10 border border-border bg-surface px-6 py-12 text-center sm:mt-12 sm:px-10" aria-labelledby="design-catalog-status">
              <PackageOpen className="mx-auto h-7 w-7 text-foregroundMuted" aria-hidden="true" />
              <h2 id="design-catalog-status" className="mt-4 text-lg font-semibold text-foreground">
                El catálogo de packs estará disponible pronto
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-foregroundMuted">
                Aún no hay packs de diseños publicados para explorar o adquirir. Esta sección se conectará al catálogo cuando existan datos disponibles.
              </p>
            </section>
          ) : null}
        </Container>
      </main>

      <Footer />
    </div>
  );
};
