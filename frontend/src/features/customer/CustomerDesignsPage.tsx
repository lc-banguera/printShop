import * as React from "react";
import {
  FileImage,
  Palette,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  CustomerViewToggle,
  type CustomerViewMode,
} from "./CustomerViewToggle";
import {
  formatFileSize,
  useCustomerDesignLibrary,
} from "./customer-design-library";
import { customerIconButtonClass } from "./customer-ui";
import { getDesignResources } from "@/features/designer/services/design-resources";

export function CustomerDesignsPage() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const designs = useCustomerDesignLibrary((state) => state.designs);
  const addFiles = useCustomerDesignLibrary((state) => state.addFiles);
  const removeDesign = useCustomerDesignLibrary((state) => state.removeDesign);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<CustomerViewMode>("grid");

  const demoDesigns = React.useMemo(
    () =>
      getDesignResources()
        .slice(0, 14)
        .map((resource, index) => ({
          id: `demo-${resource.id}`,
          name: resource.name,
          type: resource.category,
          size: 1800000 + index * 125000,
          createdAt: new Date(2026, 9, 8 - index).toISOString(),
          previewUrl: resource.image,
          isDemo: true,
        })),
    [],
  );
  const libraryDesigns =
    designs.length > 0
      ? designs.map((design) => ({ ...design, isDemo: false }))
      : demoDesigns;

  const filteredDesigns = React.useMemo(() => {
    const term = searchQuery.trim().toLocaleLowerCase();
    if (!term) return libraryDesigns;
    return libraryDesigns.filter((design) =>
      [design.name, design.type].some((value) =>
        value.toLocaleLowerCase().includes(term),
      ),
    );
  }, [libraryDesigns, searchQuery]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    addFiles(files);
    event.target.value = "";
  };

  return (
    <div className="space-y-5 pb-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Mis diseños
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-foregroundMuted sm:text-sm">
            Biblioteca de archivos creativos para preparar, inspeccionar y abrir
            en el Diseñador.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-[42px] w-[180px] items-center justify-center rounded-[5px] bg-slate-900 px-4 text-xs font-semibold text-white transition-all duration-150 hover:bg-slate-700 active:scale-[0.98]"
          >
            <span>Subir archivo</span>
          </button>
        </div>
      </div>

      {/* ── Barra de Control y Vista ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-[42px] w-full border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            style={{ borderRadius: 5 }}
          />
        </div>
        <CustomerViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* ── Cuadrícula o Lista de Diseños ─────────────────────────────────── */}
      {filteredDesigns.length > 0 ? (
        viewMode === "grid" ? (
          <section
            aria-label="Biblioteca de diseños en cuadrícula"
            className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 min-[1700px]:grid-cols-7"
          >
            {filteredDesigns.map((design) => (
              <article
                key={design.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[14px] border border-border/80 bg-surface shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
              >
                {/* Contenedor del Lienzo / Miniatura */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#F8FAFC] border-b border-border/60">
                  <img
                    src={design.previewUrl}
                    alt={design.name}
                    loading="lazy"
                    className="h-full w-full object-contain p-3 transition-transform duration-200 group-hover:scale-105"
                  />

                  {/* Botón flotante para eliminar (si no es demo) */}
                  {!design.isDemo && (
                    <button
                      type="button"
                      onClick={() => removeDesign(design.id)}
                      className={`${customerIconButtonClass} absolute right-2 top-2 z-10 h-7 w-7 text-foregroundSubtle`}
                      title={`Eliminar ${design.name}`}
                      aria-label={`Eliminar ${design.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Overlay táctil en hover */}
                  <Link
                    to="/designerv"
                    className="absolute inset-0 flex items-center justify-center bg-slate-900/30 opacity-0 backdrop-blur-[1px] transition-opacity duration-150 group-hover:opacity-100"
                  >
                    <span className="rounded-[5px] bg-white px-3 py-1 text-[11px] font-bold text-slate-900 shadow-sm transition-transform group-hover:scale-105">
                      Abrir en Diseñador
                    </span>
                  </Link>
                </div>

                {/* Bloque de Información y Metadatos */}
                <div className="p-3">
                  <h2 className="truncate text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                    <Link to="/designerv">{design.name}</Link>
                  </h2>
                  <div className="mt-1 flex items-center justify-between text-[10.5px] text-foregroundMuted">
                    <span className="truncate">{design.type}</span>
                    <span className="shrink-0 text-foregroundSubtle font-mono">
                      {formatFileSize(design.size)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="border-b border-border bg-surfaceMuted/50 text-[11px] font-semibold uppercase tracking-wide text-foregroundMuted">
                  <tr>
                    <th className="px-4 py-3">Diseño</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Tamaño</th>
                    <th className="px-4 py-3">Fecha de carga</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredDesigns.map((design) => (
                    <tr
                      key={design.id}
                      className="transition-colors hover:bg-surfaceMuted/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={design.previewUrl}
                            alt=""
                            loading="lazy"
                            className="h-9 w-9 rounded-[8px] border border-border bg-[#F8FAFC] object-contain p-1"
                          />
                          <Link
                            to="/designerv"
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {design.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foregroundMuted">
                        {design.type}
                      </td>
                      <td className="px-4 py-3 text-foregroundMuted font-mono">
                        {formatFileSize(design.size)}
                      </td>
                      <td className="px-4 py-3 text-foregroundMuted">
                        {new Date(design.createdAt).toLocaleDateString(
                          "es-CO",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-3">
                          <Link
                            to="/designerv"
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                          >
                            <span>Abrir</span>
                          </Link>
                          {!design.isDemo && (
                            <button
                              type="button"
                              onClick={() => removeDesign(design.id)}
                              className="font-semibold text-rose-600 hover:underline"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      ) : (
        <section className="rounded-[16px] border border-border bg-surface p-6 shadow-subtle text-center">
          <div className="mx-auto max-w-md space-y-3">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileImage className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="text-base font-bold text-foreground">
              {searchQuery
                ? "No se encontraron coincidencias"
                : "Tu biblioteca está lista para crear"}
            </h2>
            <p className="text-xs text-foregroundMuted">
              {searchQuery
                ? "Prueba buscando con otro término o limpia el filtro para ver todos los archivos."
                : "Sube archivos PNG, SVG, JPG o WEBP desde tu equipo para utilizarlos en tus prendas personalizadas."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-[42px] items-center rounded-[5px] bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-700"
              >
                <span>Subir diseño</span>
              </button>
              <Link
                to="/designerv"
                className="inline-flex h-[42px] items-center rounded-[5px] border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-900 hover:bg-slate-50"
              >
                <span>Abrir Diseñador</span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default CustomerDesignsPage;
