import * as React from "react";
import { Container } from "@/shared/components/Container/Container";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InspirationCard } from "./InspirationCard";
import { inspirationData } from "../../data/inspiration.data";

export const Inspiration: React.FC = () => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const [showLeft, setShowLeft] = React.useState(false);
  const [showRight, setShowRight] = React.useState(true);

  const updateButtons = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowLeft(scrollLeft > 5);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateButtons();

    container.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);

    return () => {
      container.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const firstCard = container.querySelector("[data-card]") as HTMLElement;
    const cardWidth = firstCard?.offsetWidth ?? 140;
    const gap = 16;

    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';

    container.scrollBy({
      left:
        direction === "right" ? cardWidth * 2 + gap : -(cardWidth * 2 + gap),
      behavior,
    });
  };

  return (
    <section id="plantillas" className="w-full overflow-hidden bg-surfaceMuted py-16 sm:py-20 lg:py-24">
      <Container variant="wide">
        {/* Encabezado */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <h2 className="text-2xl font-bold tracking-normal text-foreground sm:text-3xl">
            Inspírate con nuestras{" "}
            <span className="text-primary transition-colors hover:text-primaryHover">
              plantillas
            </span>
          </h2>

          <a
            href="#"
            className="rounded-control text-sm font-semibold text-primary transition-colors hover:text-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          >
            Ver todas las plantillas
          </a>
        </div>

        {/* Carrusel de plantillas */}
        <div className="relative flex items-center">
          {showLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-foreground shadow-card backdrop-blur transition-[transform,background-color,box-shadow] duration-150 hover:bg-white hover:shadow-elevated active:scale-95"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex w-full min-w-0 gap-3 overflow-x-auto scroll-smooth px-1 pb-3 sm:gap-4"
          >
            {inspirationData.map((template) => (
              <InspirationCard key={template.id} template={template} />
            ))}
          </div>

          {showRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-foreground shadow-card backdrop-blur transition-[transform,background-color,box-shadow] duration-150 hover:bg-white hover:shadow-elevated active:scale-95"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </Container>
    </section>
  );
};

export default Inspiration;
