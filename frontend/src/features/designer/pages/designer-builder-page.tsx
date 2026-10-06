import { useMemo, useState } from "react";

import {
  ArrowRight,
  Check,
  CircleHelp,
  FolderKanban,
  Images,
  LayoutTemplate,
  PackagePlus,
  Sparkles,
} from "lucide-react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { categoriesData } from "@/features/landing/data/categories.data";
import { Button } from "@/shared/ui/button";

import { getDesigner2ProductModel } from "../data/designer-2-product-models";
import { Designer2Workspace } from "./designer-2-workspace";

const categoryDescriptions: Record<string, string> = {
  camisetas: "Camisetas clásicas, oversize y deportivas.",
  hoodies: "Hoodies, buzos y sudaderas personalizables.",
  tazas: "Tazas de cerámica para tus ideas favoritas.",
  gorras: "Gorras clásicas, trucker y snapback.",
  posters: "Pósters, cuadros y decoración de pared.",
  bolsos: "Bolsos, tote bags y mochilas personalizables.",
};

const sidebarItems = [
  { label: "Crear producto", icon: PackagePlus, active: true },
  { label: "Mis proyectos", icon: FolderKanban },
  { label: "Mis diseños", icon: Images },
  { label: "Plantillas", icon: LayoutTemplate },
  { label: "Inspiración", icon: Sparkles },
];

export function DesignerBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const workspaceProduct = searchParams.get("product");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");

    return normalizedQuery
      ? categoriesData.filter((category) =>
          `${category.name} ${categoryDescriptions[category.id]}`
            .toLocaleLowerCase("es")
            .includes(normalizedQuery),
        )
      : categoriesData;
  }, [query]);

  const selectedCategory = categoriesData.find(
    (category) => category.id === selectedCategoryId,
  );

  if (getDesigner2ProductModel(workspaceProduct)) {
    return <Designer2Workspace categoryId={workspaceProduct!} />;
  }

  return (
    <div className="min-h-screen bg-[#F4F5FB] text-foreground">
      <div className="flex">
        <aside className="hidden w-[266px] shrink-0 border-r border-border bg-[#F4F5FB] p-5 lg:sticky lg:top-0 lg:block lg:h-screen">
          <nav
            aria-label="Navegación del creador"
            className="space-y-1"
          >
            {sidebarItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
                className={`group flex w-full items-center gap-4 px-4 py-3.5 text-left text-sm font-medium transition-colors ${
                  active
                    ? "text-primary"
                    : "text-foregroundMuted hover:text-foreground"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-control transition-colors ${
                    active
                      ? "bg-[var(--accent-muted)]"
                      : "group-hover:bg-surfaceMuted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-10 hidden rounded-card border border-border bg-surfaceMuted p-4 lg:block">
            <CircleHelp className="mb-3 h-7 w-7 text-foregroundMuted" />

            <p className="text-sm font-bold text-foreground">
              ¿Necesitas ayuda?
            </p>

            <p className="mt-1 text-xs leading-5 text-foregroundSubtle">
              Mira nuestro tutorial paso a paso.
            </p>

            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-full"
            >
              Ver guía
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-[#F4F5FB] px-4 py-7 sm:px-6 lg:px-7 xl:px-8">
          <ol
            className="mx-auto mb-7 flex max-w-4xl items-center justify-center gap-2 overflow-x-auto pb-1 sm:gap-4"
            aria-label="Pasos de creación"
          />

          <section className="relative min-h-[220px] overflow-hidden bg-[#F4F5FB] px-6 py-7 sm:px-9 sm:py-8 lg:min-h-[248px] lg:pr-[36%]">
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-5xl">
                ¿Qué quieres{" "}
                <span className="text-primary">diseñar?</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-foregroundMuted sm:text-base">
                Selecciona un producto y comienza a crear un diseño único
                desde cero. Luego podrás personalizarlo y guardar tu proyecto.
              </p>
            </div>

            <Link
              to="/designer/new"
              aria-label="Ir a la selección de productos"
              className="group absolute bottom-0 right-9 hidden w-[278px] rounded-[5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:block"
            >
              <img
                src={categoriesData[0].image}
                alt=""
                className="h-[235px] w-full object-contain object-bottom transition-transform duration-normal group-hover:scale-[1.02]"
                style={{
                  maskImage: "radial-gradient(ellipse at center, black 52%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse at center, black 52%, transparent 100%)",
                }}
              />
            </Link>
          </section>

          <section className="mt-7" aria-labelledby="available-products">
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredCategories.map((category) => {
                const selected = category.id === selectedCategoryId;

                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`group flex h-full flex-col overflow-hidden rounded-[5px] border bg-white text-left transition-all duration-normal hover:-translate-y-0.5 hover:shadow-card ${
                      selected
                        ? "border-primary"
                        : "border-borderMuted hover:border-borderStrong"
                    }`}
                  >
                    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[#F4F5FB] p-3.5 sm:p-4">
                      <img
                        src={category.image}
                        alt=""
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col bg-white p-3.5 pt-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="line-clamp-1 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                          {category.name}
                        </h3>

                        {selected && (
                          <span
                            aria-label="Seleccionado"
                            className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px] bg-primary text-primaryForeground"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-4 text-foregroundMuted">
                          {categoryDescriptions[category.id]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedCategory && (
              <div className="mt-5 flex flex-col gap-3 rounded-[5px] border border-border bg-surfaceMuted p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-foregroundMuted">
                  {selectedCategory.id === "camisetas"
                    ? "Camisetas cuenta con un modelo disponible para abrir el diseñador."
                    : "Este producto estará disponible cuando exista un modelo compatible."}
                </p>

                <Button
                  disabled={selectedCategory.id !== "camisetas"}
                  onClick={() =>
                    navigate("/designer/new?product=camisetas")
                  }
                >
                  Continuar con {selectedCategory.name}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}