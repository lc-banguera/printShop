import React, { useState } from "react";
import {
  Plus,
  Filter,
  MoreVertical,
  Eye,
  BarChart2,
  PenTool,
  MessageSquareDot,
  Ban,
  CalendarX,
  Trash2,
  History,
} from "lucide-react";
import type { TableAction } from "@/shared/ui/table-actions";
import { TableActions } from "@/shared/ui/table-actions";
import { TableSearchBar } from "@/shared/ui/table-search-bar";
import { TableFilterSelect } from "@/shared/ui/table-filter-select";
import { TablePagination } from "@/shared/ui/table-pagination";
import { mockTemplates } from "./data";
import templateLess from "@/resources/designs/img2.png";
import templateSunset from "@/resources/landing_principal/inspiration/retro.png";
import templateCyber from "@/resources/landing_principal/inspiration/anime.png";
import templateJersey from "@/resources/designs/img24.jpg";
import templateFloral from "@/resources/designs/img5.jpg";
import templateTote from "@/resources/mockup/bolso.png";
import templateSticker from "@/resources/designs/img10.jpg";

const templateActions: TableAction[] = [
  { label: "Ver plantilla", icon: Eye },
  { label: "Ver estadísticas", icon: BarChart2 },
  { label: "Ver diseños creados con esta plantilla", icon: PenTool },
  { label: "Solicitar cambios", icon: MessageSquareDot },
  { label: "Deshabilitar plantilla", icon: Ban, destructive: true },
  { label: "Programar eliminación", icon: CalendarX, destructive: true },
  { label: "Eliminar inmediatamente", icon: Trash2, destructive: true },
  { label: "Ver historial", icon: History },
];

export default function Templates() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const categories = [
    "Todos",
    ...Array.from(new Set(mockTemplates.map((t) => t.category))),
  ];
  const statuses = [
    "Todos",
    ...Array.from(new Set(mockTemplates.map((t) => t.status))),
  ];
  const templateImages = [
    templateLess,
    templateSunset,
    templateCyber,
    templateJersey,
    templateTote,
    templateSticker,
    templateFloral,
  ];
  const featuredTemplates = [
    { ...mockTemplates[2], title: "Cyberpunk Warrior", image: templateCyber },
    { ...mockTemplates[1], title: "Sunset Paradise", image: templateSunset },
    { ...mockTemplates[0], title: "Less is More", image: templateLess },
    { ...mockTemplates[3], title: "Basketball Jersey", image: templateJersey },
  ];

  const filtered = mockTemplates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "Todos" || t.category === categoryFilter;
    const matchStatus = statusFilter === "Todos" || t.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="p-3.5 space-y-4 bg-surfaceMuted min-h-full">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[18px] font-bold leading-tight text-foreground">
            Catálogo de Plantillas
          </h1>
          <p className="mt-0.5 text-[11.5px] text-foregroundMuted">
            Crea y administra plantillas predeterminadas de productos para las
            tiendas.
          </p>
        </div>
        <button className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-[5px] bg-primary px-3 text-[11.5px] font-semibold text-primaryForeground shadow-2xs transition-colors hover:bg-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Plus className="h-3.5 w-3.5" /> Nueva plantilla
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <TableSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre..."
          width="w-full sm:w-64"
        />
        <TableFilterSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categories.map((c) => ({
            value: c,
            label: c === "Todos" ? "Todas las categorías" : c,
          }))}
          className="min-w-[172px]"
        />
        <TableFilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={statuses.map((s) => ({
            value: s,
            label: s === "Todos" ? "Todos los estados" : s,
          }))}
          className="min-w-[162px]"
        />
        <button className="flex h-10 items-center gap-2 rounded-control border border-border bg-surface px-3.5 text-sm text-foregroundMuted shadow-subtle transition-colors duration-normal hover:border-borderStrong hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Filter className="h-3.5 w-3.5 text-foregroundSubtle" /> Filtros
        </button>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2.5">
          <h2 className="text-[13px] font-bold text-foreground">
            Plantillas destacadas
          </h2>
          <button className="text-[11.5px] font-semibold text-primary transition-colors hover:text-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            Ver todas las plantillas destacadas →
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {featuredTemplates.map((template) => (
            <article
              key={template.id}
              className="overflow-hidden rounded-[5px] border border-border bg-surface shadow-2xs"
            >
              <div className="aspect-[16/8.5] overflow-hidden bg-surfaceMuted">
                <img
                  src={template.image}
                  alt={template.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-start justify-between gap-2.5 p-2.5">
                <div className="min-w-0">
                  <h3 className="truncate text-[11.5px] font-bold text-foreground">
                    {template.title}
                  </h3>
                  <p className="mt-0.5 text-[10.5px] text-foregroundMuted">
                    {template.products} productos{" "}
                    <span className="mx-1.5 text-borderStrong">•</span>{" "}
                    {template.uses.toLocaleString("es-MX")} usos
                  </p>
                </div>
                <button
                  type="button"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] text-foregroundSubtle transition-colors hover:bg-surfaceMuted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Abrir acciones"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="w-full min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between gap-3 border-b border-borderMuted bg-surfaceMuted px-4 py-4">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Todas las plantillas
          </h2>
        </div>

        <div className="min-w-0 overflow-x-auto overscroll-x-contain">
          <table className="w-full text-xs text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-surfaceMuted text-foreground">
                {[
                  "Nombre de Plantilla",
                  "Categoría",
                  "Productos Relacionados",
                  "Usos en Tiendas",
                  "Estado",
                  "Acciones",
                ].map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-foregroundMuted"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted">
              {filtered.map((temp, idx) => (
                <tr
                  key={temp.id}
                  className={`transition-colors duration-normal ${idx % 2 === 0 ? "bg-surface hover:bg-surfaceStrong" : "bg-surfaceMuted hover:bg-surfaceStrong"}`}
                >
                  <td className="border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-control border border-border bg-surfaceMuted">
                        <img
                          src={templateImages[idx % templateImages.length]}
                          alt={temp.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="truncate text-sm font-medium leading-tight text-foreground">
                        {temp.name}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    {temp.category}
                  </td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    {temp.products} productos
                  </td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    {temp.uses} veces
                  </td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    {temp.status}
                  </td>
                  <td className="px-3 py-2 border-b border-surfaceMuted">
                    <TableActions actions={templateActions} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-foregroundMuted"
                  >
                    No se encontraron plantillas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          totalItems={mockTemplates.length}
          itemLabel="plantillas"
          totalPages={1}
          className="py-3"
        />
      </div>
    </div>
  );
}
