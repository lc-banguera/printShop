import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Search,
  Plus,
  Sparkles,
  ArrowRight,
  Eye,
  Copy,
  Check,
  Tag,
  Palette,
  Layers,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface TemplateItem {
  id: string;
  name: string;
  category: "Streetwear" | "Corporativo" | "Eventos" | "Vintage" | "Tipografía";
  image: string;
  usesCount: number;
  featured?: boolean;
}

const mockTemplates: TemplateItem[] = [
  {
    id: "tpl-1",
    name: "Aesthetic Tokyo Typography",
    category: "Streetwear",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80",
    usesCount: 428,
    featured: true,
  },
  {
    id: "tpl-2",
    name: "Modern Minimal Coffee Emblem",
    category: "Corporativo",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
    usesCount: 312,
    featured: true,
  },
  {
    id: "tpl-3",
    name: "Cyberpunk Glitch Hologram",
    category: "Streetwear",
    image:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&auto=format&fit=crop&q=80",
    usesCount: 290,
  },
  {
    id: "tpl-4",
    name: "Vintage California Surf 1984",
    category: "Vintage",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80",
    usesCount: 245,
  },
  {
    id: "tpl-5",
    name: "Bold Impact Motivational Quote",
    category: "Tipografía",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80",
    usesCount: 198,
  },
  {
    id: "tpl-6",
    name: "Festival Music Lineup Badge",
    category: "Eventos",
    image:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&auto=format&fit=crop&q=80",
    usesCount: 165,
  },
  {
    id: "tpl-7",
    name: "Botanical Floral Organic Badge",
    category: "Corporativo",
    image:
      "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=400&auto=format&fit=crop&q=80",
    usesCount: 140,
  },
  {
    id: "tpl-8",
    name: "Dark Tattoo Skull Geometric",
    category: "Streetwear",
    image:
      "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=400&auto=format&fit=crop&q=80",
    usesCount: 380,
  },
];

export default function StoreTemplates() {
  const navigate = useNavigate();
  const [templates] = React.useState<TemplateItem[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Todas");

  const filteredTemplates = React.useMemo(() => {
    return templates.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === "Todas" || t.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [templates, searchQuery, selectedCategory]);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto w-full">
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Tienda</span>
            <span>/</span>
            <span className="text-[#2563EB] font-medium">Plantillas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Biblioteca de Plantillas
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Plantillas profesionales prediseñadas listas para abrir en el
            Diseñador y adaptar a tus productos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/store/designer")}
          className="flex items-center gap-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 rounded-[6px] shadow-sm transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Crear plantilla en Diseñador</span>
        </button>
      </div>

      {/* ── Barra de Búsqueda y Categorías ─────────────────────────── */}
      <div className="bg-white p-3 rounded-[8px] border border-[#E5E7EB] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Buscar por nombre o estilo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            "Todas",
            "Streetwear",
            "Corporativo",
            "Eventos",
            "Vintage",
            "Tipografía",
          ].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1 text-xs rounded-full font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-[#2563EB] text-white"
                  : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid de Plantillas ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-xl border border-[#E5E7EB] hover:border-[#2563EB] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
          >
            <div className="h-48 w-full bg-[#F8FAFC] overflow-hidden relative">
              <img
                src={tpl.image}
                alt={tpl.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 text-[10.5px] font-bold px-2 py-0.5 rounded bg-white/90 text-[#1E3A8A] backdrop-blur-xs shadow-xs">
                {tpl.category}
              </span>
              {tpl.featured && (
                <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-[#2563EB] text-white shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Popular</span>
                </span>
              )}
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <p className="font-bold text-xs text-[#111827] group-hover:text-[#2563EB] transition-colors">
                  {tpl.name}
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Utilizada {tpl.usesCount} veces por vendedores
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/store/designer")}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB] text-[#334155] hover:text-[#2563EB] text-xs font-semibold rounded-[6px] transition-colors shadow-2xs"
                >
                  <span>Usar en Diseñador</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
