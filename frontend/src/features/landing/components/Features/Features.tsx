import * as React from "react";
import { Container } from "@/shared/components/Container/Container";
import { featuresData } from "../../data/features.data";
import designerImg from "@/resources/landing_principal/images/designer_screenshot.png";

export const Features: React.FC = () => {
  return (
    <section
      id="que-puedes-hacer"
      aria-label="Todo lo que puedes hacer con PrintShop"
      className="w-full bg-[var(--surface-muted)] py-12 sm:py-16 lg:py-20"
    >
      <Container variant="wide">
        {/* ── Intro centrado ── */}
        <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-14">
          <h2 className="text-[1.9rem] font-black leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[2.25rem] lg:text-[1.9rem]">
            Diseña, personaliza y prepara desde un solo lugar.
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] text-[15.5px] leading-relaxed text-[var(--text-secondary)]">
            PrintShop reúne el diseñador, los productos, los recursos y el flujo
            de producción en un único espacio de trabajo.
          </p>
        </div>

        {/* ── Two-column editorial layout ── */}
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px] xl:gap-16">
          {/* LEFT — image */}
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl shadow-[0_16px_48px_rgba(17,24,39,0.10)] ring-1 ring-black/[0.06]">
              <img
                src={designerImg}
                alt="Diseñador de camisetas en PrintShop: panel de diseños, vista 3D del producto y opciones de configuración"
                className="h-auto w-full select-none object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Floating tag */}
            <div className="absolute -bottom-4 -right-4 hidden items-center gap-2.5 rounded-xl bg-white px-4 py-3 shadow-[0_4px_20px_rgba(17,24,39,0.10)] ring-1 ring-black/[0.05] sm:flex lg:-right-6">
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
            <ul className="space-y-6">
              {featuresData.map(({ id, icon: Icon, title, description }) => (
                <li key={id} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-[0_2px_8px_rgba(93,70,232,0.10)] ring-1 ring-black/[0.04]">
                    <Icon
                      className="h-5 w-5"
                      aria-hidden="true"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold leading-snug text-[var(--text-primary)]">
                      {title}
                    </h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Benefits strip */}
            <div className="border-t border-[var(--border)] pt-6">
              <p className="mb-4 text-[11.5px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
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
                    className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]"
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
