import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Check,
  Palette,
  ExternalLink,
  Download,
  Shirt,
  Sparkles,
  Calendar,
  Tag,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { StatusDot } from "./StatusDot";

export interface StoreDesign {
  id: string;
  title: string;
  category: string;
  image: string;
  createdAt: string;
  associatedProducts: string[];
  status: "Publicado" | "Borrador" | "En revisión";
  resolution: string;
  downloads: number;
}

const mockDesigns: StoreDesign[] = [
  {
    id: "des-1",
    title: "Jordan Streetwear Legend",
    category: "Urbano & Streetwear",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80",
    createdAt: "02 May, 2026",
    associatedProducts: ["Camiseta Oversize", "Hoodie Clásico"],
    status: "Publicado",
    resolution: "3200 x 3200 px (300 DPI)",
    downloads: 142,
  },
  {
    id: "des-2",
    title: "Cyberpunk Tokyo Skyline",
    category: "Futurista & Sci-Fi",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80",
    createdAt: "28 Abr, 2026",
    associatedProducts: ["Hoodie Clásico"],
    status: "Publicado",
    resolution: "2400 x 3000 px (300 DPI)",
    downloads: 98,
  },
  {
    id: "des-3",
    title: "Minimalist Botanical Art",
    category: "Minimalismo & Naturaleza",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
    createdAt: "22 Abr, 2026",
    associatedProducts: ["Taza Cerámica", "Bolsa Ecológica"],
    status: "Publicado",
    resolution: "2000 x 2000 px (300 DPI)",
    downloads: 87,
  },
  {
    id: "des-4",
    title: "Retro 90s Vintage Wave",
    category: "Retro & Vintage",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80",
    createdAt: "15 Abr, 2026",
    associatedProducts: ["Gorra Bordada", "Camiseta Regular"],
    status: "Publicado",
    resolution: "1800 x 1800 px (300 DPI)",
    downloads: 64,
  },
  {
    id: "des-5",
    title: "Coffee Roaster Emblem",
    category: "Emblemas & Logotipos",
    image:
      "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=400&auto=format&fit=crop&q=80",
    createdAt: "10 Abr, 2026",
    associatedProducts: ["Taza Cerámica", "Bolsa Ecológica"],
    status: "Borrador",
    resolution: "3000 x 3000 px (300 DPI)",
    downloads: 12,
  },
  {
    id: "des-6",
    title: "Urban Skull Geometric",
    category: "Ilustración & Tattoo",
    image:
      "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=400&auto=format&fit=crop&q=80",
    createdAt: "05 Abr, 2026",
    associatedProducts: ["Camiseta Oversize", "Póster Metálico"],
    status: "Publicado",
    resolution: "4000 x 6000 px (300 DPI)",
    downloads: 178,
  },
];

export default function StoreDesigns() {
  const navigate = useNavigate();
  const [designs, setDesigns] = React.useState<StoreDesign[]>(mockDesigns);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Todas");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredDesigns = React.useMemo(() => {
    return designs.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === "Todas" || d.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [designs, searchQuery, selectedCategory]);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto w-full">
      {/* ── Toast ──────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-lg shadow-xl animate-in fade-in">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Tienda</span>
            <span>/</span>
            <span className="text-[#2563EB] font-medium">Diseños</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Biblioteca de Diseños
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Gestiona los artes gráficos, ilustraciones y logotipos disponibles
            para estampar en tu tienda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate("/store/designer")}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 rounded-[6px] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Diseño</span>
          </button>
        </div>
      </div>

      {/* ── KPIs Rápidos ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs text-[#64748B] font-medium">
            Total Diseños
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {designs.length}
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs text-[#64748B] font-medium">
            Publicados en Tienda
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {designs.filter((d) => d.status === "Publicado").length}
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs text-[#64748B] font-medium">Borradores</span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {designs.filter((d) => d.status === "Borrador").length}
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs text-[#64748B] font-medium">
            Prendas Estampadas
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">58</p>
        </div>
      </div>

      {/* ── Barra de Búsqueda y Filtros ────────────────────────────── */}
      <div className="bg-white p-3 rounded-[8px] border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "px-3 py-1 text-xs rounded-[5px] font-medium",
              viewMode === "grid"
                ? "bg-[#2563EB] text-white"
                : "bg-[#F1F5F9] text-[#64748B]",
            )}
          >
            Vista Cuadrícula
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={cn(
              "px-3 py-1 text-xs rounded-[5px] font-medium",
              viewMode === "table"
                ? "bg-[#2563EB] text-white"
                : "bg-[#F1F5F9] text-[#64748B]",
            )}
          >
            Vista Tabla
          </button>
        </div>
      </div>

      {/* ── Contenido: Grid de Diseños ─────────────────────────────── */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {filteredDesigns.map((design) => (
            <div
              key={design.id}
              className="bg-white rounded-xl border border-[#E5E7EB] hover:border-[#2563EB] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="h-44 w-full bg-[#F8FAFC] overflow-hidden relative">
                <img
                  src={design.image}
                  alt={design.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <p className="font-bold text-xs text-[#111827] truncate group-hover:text-[#2563EB]">
                    {design.title}
                  </p>
                  <p className="text-[10.5px] text-[#64748B]">
                    {design.category}
                  </p>
                  <p className="text-[10px] text-[#94A3B8] mt-1 font-mono">
                    {design.resolution}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate("/store/designer")}
                    className="text-[10.5px] font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    <span>Editar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(`Copia de "${design.title}" creada`)
                    }
                    className="p-1 text-[#94A3B8] hover:text-[#2563EB]"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vista Tabla */
        <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#64748B] text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Diseño</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Resolución</th>
                <th className="py-3 px-4">Productos Asociados</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredDesigns.map((design) => (
                <tr key={design.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 flex items-center gap-2.5">
                    <img
                      src={design.image}
                      alt=""
                      className="w-9 h-9 rounded object-cover border border-[#E2E8F0]"
                    />
                    <span className="font-bold text-[#111827]">
                      {design.title}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">
                    {design.category}
                  </td>
                  <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                    {design.resolution}
                  </td>
                  <td className="py-3 px-4 text-[#475569]">
                    {design.associatedProducts.join(", ")}
                  </td>
                  <td className="py-3 px-4">
                    <StatusDot status={design.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate("/store/designer")}
                      className="text-xs font-bold text-[#2563EB] hover:underline"
                    >
                      Abrir en Editor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
