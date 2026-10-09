import * as React from "react";
import { Container } from "@/shared/components/Container/Container";
import { featuresData } from "../../data/features.data";
import designerImg from "@/resources/landing_principal/images/designer_screenshot.png";

export const Features: React.FC = () => {
  return (
    <section
      id="que-puedes-hacer"
      aria-label="Todo lo que puedes hacer con PrintShop"
      className="w-full bg-background py-16 sm:py-20 lg:py-24"
    >
      <Container variant="wide">
        {/* ── Intro centrado ── */}
        <div className="mb-10 grid gap-4 sm:mb-14 sm:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] sm:items-end sm:gap-10 lg:mb-16">
          <h2 className="max-w-[680px] text-[2rem] font-bold leading-[1.12] text-[var(--text-primary)] sm:text-[2.5rem] lg:text-[2.75rem]">
            Diseña, personaliza y prepara desde un solo lugar.
          </h2>
          <p className="max-w-[520px] text-base leading-7 text-[var(--text-secondary)] sm:pb-1 sm:text-[17px]">
            PrintShop reúne el diseñador, los productos, los recursos y el flujo
            de producción en un único espacio de trabajo.
          </p>
        </div>

        <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:gap-14 xl:gap-20">
          {/* LEFT — image */}
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-[22px] border border-borderMuted bg-surface p-2 shadow-elevated sm:p-3">
              <img
                src={designerImg}
                alt="Diseñador de camisetas en PrintShop: panel de diseños, vista 3D del producto y opciones de configuración"
                className="h-auto w-full select-none rounded-[16px] object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Floating tag */}
            <div className="absolute -bottom-4 right-3 hidden items-center gap-2.5 rounded-xl border border-borderMuted bg-white/95 px-4 py-3 shadow-card backdrop-blur sm:flex lg:-right-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
                <svg
                  className="h-4 w-4 text-[var(--primary)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-[12px] font-bold leading-tight text-[var(--text-primary)]">
                  Listo para producir
                </p>
                <p className="text-[11px] leading-tight text-[var(--text-secondary)]">
                  Diseña y envía a imprimir
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — text + capabilities */}
          <div className="order-1 flex flex-col gap-8 lg:order-2">
            <ul className="divide-y divide-borderMuted">
              {featuresData.map(({ id, icon: Icon, title, description }) => (
                <li key={id} className="flex items-start gap-4 py-5 first:pt-0 last:pb-0">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[var(--surface-muted)] text-[var(--primary)]">
                    <Icon
                      className="h-5 w-5"
                      aria-hidden="true"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold leading-snug text-[var(--text-primary)]">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Benefits strip */}
            <div className="border-t border-[var(--border)] pt-6">
              <p className="mb-4 text-xs font-semibold uppercase text-[var(--text-muted)]">
                Incluido en cada pedido
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  "Materiales premium",
                  "Personalización fácil",
                  "Envíos a todo el país",
                  "Pagos seguros",
                ].map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
