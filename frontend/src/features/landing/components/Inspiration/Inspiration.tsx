import * as React from "react";
import { Container } from "@/shared/components/Container/Container";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InspirationCard } from "./InspirationCard";
import { inspirationData } from "../../data/inspiration.data";

export const Inspiration: React.FC = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = React.useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="plantillas"
      className="relative w-full overflow-hidden border-b border-slate-200 bg-white py-20 sm:py-24 lg:py-28"
    >
      <Container variant="wide" className="px-4 sm:px-6 lg:px-8">
        {/* Encabezado editorial limpio con navegación Apple */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.03em] text-[#0D1014] sm:text-4xl lg:text-2xl">
              Inspírate con nuestras plantillas
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Cientos de composiciones gráficas y estilos listos para
              personalizar tu próximo artículo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Controles de desplazamiento fluidos */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Ver plantillas anteriores"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-[#0D1014] transition-colors duration-150 hover:bg-slate-950 hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Ver siguientes plantillas"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-[#0D1014] transition-colors duration-150 hover:bg-slate-950 hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <a
              href="#plantillas"
              className="inline-flex min-h-10 items-center rounded-[5px] bg-[#0D1014] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-black active:scale-[0.98]"
            >
              <span>Ver todas las plantillas</span>
            </a>
          </div>
        </div>

        {/* Carrusel de plantillas con tarjetas intactas */}
        <div className="relative mt-5">
          <div
            ref={scrollRef}
            className="flex w-full select-none gap-5 overflow-x-auto scroll-smooth pb-4 pt-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {inspirationData.map((template) => (
              <InspirationCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Inspiration;
