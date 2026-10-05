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

    container.scrollBy({
      left:
        direction === "right" ? cardWidth * 2 + gap : -(cardWidth * 2 + gap),
      behavior: "smooth",
    });
  };

  return (
    <section id="plantillas" className="w-full overflow-hidden bg-[#F4F5FB] py-12 sm:py-16 lg:py-20">
      <Container variant="wide">
        {/* Encabezado */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Inspírate con nuestras{" "}
            <span                         className="text-primary transition-colors hover:text-primaryHover">
              plantillas
            </span>
          </h2>

          <a
            href="#"
            className="rounded-control text-xs font-semibold text-primary transition-colors hover:text-primaryHover sm:text-sm"
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
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-[#E5E7EB] shadow-md flex items-center justify-center text-[#111827] hover:bg-[#F9FAFB] transition-all"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex w-full min-w-0 gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-none sm:gap-4"
          >
            {inspirationData.map((template) => (
              <InspirationCard key={template.id} template={template} />
            ))}
          </div>

          {showRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-[#E5E7EB] shadow-md flex items-center justify-center text-[#111827] hover:bg-[#F9FAFB] transition-all"
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
