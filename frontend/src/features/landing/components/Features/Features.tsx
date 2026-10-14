import * as React from "react";
import { Container } from "@/shared/components/Container/Container";
import { featuresData } from "../../data/features.data";
import designerImg from "@/resources/landing_principal/images/designer_screenshot.png";

export const Features: React.FC = () => {
  return (
    <section
      id="que-puedes-hacer"
      aria-label="Todo lo que puedes hacer con PrintShop"
      className="relative w-full overflow-hidden bg-white py-18 sm:py-24 lg:py-28"
    >
      <Container variant="wide" className="px-4 sm:px-6 lg:px-8">
        {/* ── Intro centrado con Optical Typography ── */}
        <div className="mb-12 grid gap-4 sm:mb-16 sm:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] sm:items-end sm:gap-10 lg:mb-20">
          <h2 className="max-w-[680px] text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-[#0F172A] sm:text-[2.6rem] lg:text-[2.85rem]">
            Diseña, personaliza y prepara desde un solo lugar.
          </h2>
          <p className="max-w-[500px] text-base leading-relaxed tracking-[-0.01em] text-foregroundMuted sm:pb-1 sm:text-[17px]">
            PrintShop reúne el diseñador, los productos, los recursos y el flujo
            de producción en un único espacio de trabajo.
          </p>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-14 xl:gap-20">
          {/* LEFT — Retina display showcase frame */}
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-[28px] border border-black/[0.08] bg-[#F1F5F9] p-2 sm:p-2.5 shadow-[0_24px_64px_-12px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.04]">
              <img
                src={designerImg}
                alt="Diseñador de camisetas en PrintShop: panel de diseños, vista 3D del producto y opciones de configuración"
                className="h-auto w-full select-none rounded-[20px] object-cover object-top border border-black/[0.04]"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Floating Apple-style glass chip */}
            <div className="absolute -bottom-5 right-4 hidden items-center gap-3 rounded-2xl border border-white/90 bg-white/90 p-3.5 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:flex lg:-right-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <p className="text-[12px] font-bold leading-tight tracking-[-0.01em] text-foreground">
                  Listo para producir
                </p>
                <p className="text-[11px] leading-tight text-foregroundMuted">
                  Diseña y envía a imprimir
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Apple feature cards */}
          <div className="order-1 flex flex-col gap-6 lg:order-2">
            <ul className="flex flex-col gap-2.5">
              {featuresData.map(({ id, icon: Icon, title, description }) => (
                <li
                  key={id}
                  className="group flex items-start gap-4 rounded-2xl p-3.5 transition-all duration-200 hover:bg-[#F8FAFC] border border-transparent hover:border-black/[0.04] active:scale-[0.99]"
                >
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                    <Icon
                      className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
                      aria-hidden="true"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-snug tracking-[-0.01em] text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-foregroundMuted">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Benefits strip — Apple translucent pills */}
            <div className="border-t border-black/[0.06] pt-6">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-foregroundMuted">
                Incluido en cada pedido
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {[
                  "Materiales premium",
                  "Personalización fácil",
                  "Envíos a todo el país",
                  "Pagos seguros",
                ].map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-xl bg-[#F8FAFC] border border-black/[0.04] px-3 py-2 text-xs font-medium text-foreground/85 transition-colors hover:bg-white hover:border-black/[0.08]"
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0 text-primary"
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
