import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  Check,
  CircleHelp,
  FileImage,
  FolderKanban,
  Images,
  Package,
  PackagePlus,
  Upload,
} from "lucide-react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { categoriesData } from "@/features/landing/data/categories.data";
import {
  formatFileSize,
  useCustomerDesignLibrary,
} from "@/features/customer/customer-design-library";

import { getDesigner2ProductModel } from "../data/designer-2-product-models";
import {
  listDesigner3Documents,
  type Designer3DocumentSession,
} from "../services/designer3-document-session";
import { Designer2Workspace } from "./designer-2-workspace";

const categoryDescriptions: Record<string, string> = {
  camisetas: "Camisetas clásicas, oversize y deportivas.",
  hoodies: "Hoodies, buzos y sudaderas personalizables.",
  tazas: "Tazas de cerámica para tus ideas favoritas.",
  gorras: "Gorras clásicas, trucker y snapback.",
  posters: "Pósters, cuadros y decoración de pared.",
  bolsas: "Bolsas, tote bags y mochilas personalizables.",
};

const sidebarItems = [
  { id: "create", label: "Crear producto", icon: PackagePlus },
  { id: "projects", label: "Mis proyectos", icon: FolderKanban },
  { id: "designs", label: "Mis diseños", icon: Images },
] as const;

type BuilderView = (typeof sidebarItems)[number]["id"];

function formatProjectDate(value: string) {
  return new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getProjectPreview(session: Designer3DocumentSession) {
  const imageElement = session.document.surfaces
    .flatMap((surface) => surface.layers)
    .flatMap((layer) => layer.elements)
    .find(
      (element) =>
        element.type === "image" &&
        element.visible !== false &&
        Boolean(element.image),
    );

  return imageElement?.image ?? null;
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function EmptyLibraryState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center border border-slate-200 bg-slate-50 text-slate-500">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-slate-950">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>
      {(actionLabel || secondaryLabel) && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex h-10 items-center justify-center rounded-[4px] bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              {actionLabel}
            </button>
          )}
          {secondaryLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex h-10 items-center justify-center rounded-[4px] border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectsView({ onCreate }: { onCreate: () => void }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Designer3DocumentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void listDesigner3Documents()
      .then((documents) => {
        if (!cancelled) setProjects(documents);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Tu espacio de trabajo"
        title="Mis proyectos"
        description="Retoma los documentos que ya guardaste en el Diseñador y continúa trabajando desde el punto en que los dejaste."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse border border-slate-200 bg-white motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : hasError ? (
        <div className="border border-slate-300 bg-white px-6 py-10 text-center">
          <h2 className="text-base font-semibold text-slate-950">
            No pudimos cargar tus proyectos
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Intenta volver a abrir esta sección para consultar el almacenamiento local.
          </p>
        </div>
      ) : projects.length === 0 ? (
        <EmptyLibraryState
          icon={FolderKanban}
          title="Aún no tienes proyectos guardados"
          description="Cuando guardes un documento desde el Diseñador, aparecerá aquí con su fecha de actualización."
          actionLabel="Crear producto"
          onAction={onCreate}
        />
      ) : (
        <section
          aria-label="Proyectos guardados"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {projects.map((project) => {
            const preview = getProjectPreview(project);
            const title =
              typeof project.document.metadata.title === "string" &&
                project.document.metadata.title.trim()
                ? project.document.metadata.title
                : "Proyecto sin título";

            return (
              <article
                key={project.id}
                className="flex min-w-0 flex-col border border-slate-200 bg-white"
              >
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-slate-200 bg-slate-50 p-5">
                  {preview ? (
                    <img
                      src={preview}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Package className="h-8 w-8" aria-hidden="true" />
                      <span className="text-xs">Modelo guardado</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="truncate text-sm font-semibold text-slate-950">
                    {title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Actualizado el {formatProjectDate(project.updatedAt)}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/designerv/easy?document=${encodeURIComponent(project.id)}`)
                    }
                    className="mt-5 inline-flex h-9 items-center justify-center rounded-[4px] bg-slate-950 px-3 text-xs font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  >
                    Abrir proyecto
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function DesignsView({ onCreate }: { onCreate: () => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const designs = useCustomerDesignLibrary((state) => state.designs);
  const addFiles = useCustomerDesignLibrary((state) => state.addFiles);
  const removeDesign = useCustomerDesignLibrary((state) => state.removeDesign);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  return (
    <div className="space-y-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Biblioteca personal"
          title="Mis diseños"
          description="Consulta los archivos que has cargado y ábrelos en el flujo de diseño existente."
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[4px] bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Subir diseño
        </button>
      </div>

      {designs.length === 0 ? (
        <EmptyLibraryState
          icon={FileImage}
          title="Aún no tienes diseños cargados"
          description="Sube un archivo de imagen para conservarlo en tu biblioteca o empieza creando un producto nuevo."
          actionLabel="Subir diseño"
          onAction={() => fileInputRef.current?.click()}
          secondaryLabel="Crear producto"
          onSecondaryAction={onCreate}
        />
      ) : (
        <section
          aria-label="Diseños cargados"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {designs.map((design) => (
            <article
              key={design.id}
              className="group flex min-w-0 flex-col border border-slate-200 bg-white"
            >
              <div className="relative aspect-square overflow-hidden border-b border-slate-200 bg-slate-50 p-3">
                <img
                  src={design.previewUrl}
                  alt={design.name}
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02] motion-reduce:transition-none"
                />
                <button
                  type="button"
                  onClick={() => removeDesign(design.id)}
                  aria-label={`Eliminar ${design.name}`}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-[4px] border border-slate-200 bg-white text-slate-500 opacity-0 transition-opacity hover:text-slate-950 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 group-hover:opacity-100"
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    ×
                  </span>
                </button>
              </div>
              <div className="min-w-0 p-3">
                <h2 className="truncate text-xs font-semibold text-slate-950">
                  {design.name}
                </h2>
                <p className="mt-1 truncate text-[11px] text-slate-500">
                  {design.type} · {formatFileSize(design.size)}
                </p>
                <Link
                  to="/designerv"
                  className="mt-3 inline-flex text-xs font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  Abrir en Diseñador
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function CreatorNavigation({
  view,
  onChange,
  mobile = false,
}: {
  view: BuilderView;
  onChange: (nextView: BuilderView) => void;
  mobile?: boolean;
}) {
  return (
    <nav
      aria-label="Navegación del creador"
      className={mobile ? "grid grid-cols-3 gap-1" : "space-y-1"}
    >
      {sidebarItems.map(({ id, label, icon: Icon }) => {
        const active = view === id;

        return (
          <button
            key={id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(id)}
            className={`group flex items-center text-left text-sm font-medium text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${mobile
                ? "min-h-16 flex-col justify-center gap-1 border border-slate-200 bg-white px-2 py-2"
                : "w-full gap-4 px-3 py-3"
              }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] transition-colors ${active
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-950"
                }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className={mobile ? "text-center text-[11px]" : undefined}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function DesignerBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workspaceProduct = searchParams.get("product");

  const [view, setView] = useState<BuilderView>("create");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const filteredCategories = useMemo(() => categoriesData, []);
  const selectedCategory = categoriesData.find(
    (category) => category.id === selectedCategoryId,
  );

  if (getDesigner2ProductModel(workspaceProduct)) {
    return <Designer2Workspace categoryId={workspaceProduct!} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 border-r border-slate-200 bg-[#F7F7F5] p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">


          <CreatorNavigation view={view} onChange={setView} />

          <div className="mt-auto border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <CircleHelp
                className="mt-0.5 h-5 w-5 shrink-0 text-slate-500"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  ¿Necesitas ayuda?
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Mira nuestro tutorial.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-[4px] border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              Ver guía
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-10 pt-4 sm:px-6 lg:px-10 lg:pt-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 lg:hidden">
              <p className="mb-3 text-sm font-semibold tracking-[-0.02em] text-slate-950">
                PrintShop · Diseñador 2
              </p>
              <CreatorNavigation view={view} onChange={setView} mobile />
            </div>

            {view === "create" && (
              <section aria-label="Seleccionar producto" className="space-y-7">
                <SectionHeading
                  eyebrow="Crear producto"
                  title="Selecciona el producto que deseas diseñar"
                  description="Elige una de las 6 categorías para comenzar a personalizar en el lienzo 3D."
                />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
                  {filteredCategories.map((category) => {
                    const selected = category.id === selectedCategoryId;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-[4px] border bg-white text-left transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${selected
                            ? "border-slate-950 shadow-[0_0_0_1px_rgba(15,23,42,1)]"
                            : "border-slate-200"
                          }`}
                      >
                        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-slate-50 p-3 sm:p-4">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col p-3">
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950">
                              {category.name}
                            </h2>
                            {selected && (
                              <span
                                aria-label="Seleccionado"
                                className="grid h-4 w-4 shrink-0 place-items-center rounded-[2px] bg-slate-950 text-white"
                              >
                                <Check className="h-3 w-3" aria-hidden="true" />
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">
                            {categoryDescriptions[category.id]}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedCategory && (
                  <div className="flex flex-col gap-3 border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-5 text-slate-600">
                      {selectedCategory.id === "camisetas"
                        ? "Camisetas cuenta con un modelo disponible para abrir el diseñador."
                        : "Este producto estará disponible cuando exista un modelo compatible."}
                    </p>

                    <button
                      type="button"
                      disabled={selectedCategory.id !== "camisetas"}
                      onClick={() => navigate("/designer/new?product=camisetas")}
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-[4px] bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                    >
                      Continuar con {selectedCategory.name}
                    </button>
                  </div>
                )}
              </section>
            )}

            {view === "projects" && <ProjectsView onCreate={() => setView("create")} />}
            {view === "designs" && <DesignsView onCreate={() => setView("create")} />}
          </div>
        </main>
      </div>
    </div>
  );
}
