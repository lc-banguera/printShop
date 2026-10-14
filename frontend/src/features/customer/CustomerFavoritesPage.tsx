import * as React from "react";
import {
  CheckCheck,
  ChevronDown,
  ExternalLink,
  Heart,
  MoreHorizontal,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { customerIconButtonClass } from "./customer-ui";
import { CustomerPortalMenu } from "./customer-portal-menu";
import { CustomerViewToggle, type CustomerViewMode } from "./CustomerViewToggle";

// ── Tipos y Modelo de Datos ──────────────────────────────────────────────────
export type FavoriteCategory = "all" | "designs" | "templates" | "resources";
export type SortOption = "recent" | "name" | "oldest";

export interface FavoriteResource {
  id: string;
  title: string;
  category: "designs" | "templates" | "resources";
  categoryLabel: string;
  designerUrl: string;
  thumbnailBg: string;
  // Ilustración vectorial distintiva para cada elemento
  variant:
    | "tiger"
    | "goodthings"
    | "sakura"
    | "sunset"
    | "brooklyn"
    | "skull"
    | "wave"
    | "space"
    | "createmore"
    | "bear"
    | "natural"
    | "artnolimits";
}

// ── Colección de los 12 Recursos Aprobados ───────────────────────────────────
const INITIAL_FAVORITES: FavoriteResource[] = [
  {
    id: "fav-1",
    title: "Tigre Geométrico",
    category: "designs",
    categoryLabel: "Ilustración",
    designerUrl: "/designerv",
    thumbnailBg: "#EA580C",
    variant: "tiger",
  },
  {
    id: "fav-2",
    title: "Good Things",
    category: "designs",
    categoryLabel: "Tipografía",
    designerUrl: "/designerv",
    thumbnailBg: "#F8FAFC",
    variant: "goodthings",
  },
  {
    id: "fav-3",
    title: "Sakura Japón",
    category: "designs",
    categoryLabel: "Ilustración",
    designerUrl: "/designerv",
    thumbnailBg: "#991B1B",
    variant: "sakura",
  },
  {
    id: "fav-4",
    title: "Sunset Vintage",
    category: "templates",
    categoryLabel: "Plantilla",
    designerUrl: "/designerv",
    thumbnailBg: "#D97706",
    variant: "sunset",
  },
  {
    id: "fav-5",
    title: "Brooklyn Style",
    category: "designs",
    categoryLabel: "Tipografía",
    designerUrl: "/designerv",
    thumbnailBg: "#F1F5F9",
    variant: "brooklyn",
  },
  {
    id: "fav-6",
    title: "Skull Flame",
    category: "designs",
    categoryLabel: "Ilustración",
    designerUrl: "/designerv",
    thumbnailBg: "#1E293B",
    variant: "skull",
  },
  {
    id: "fav-7",
    title: "Gran Ola",
    category: "designs",
    categoryLabel: "Ilustración",
    designerUrl: "/designerv",
    thumbnailBg: "#0284C7",
    variant: "wave",
  },
  {
    id: "fav-8",
    title: "Space Art",
    category: "resources",
    categoryLabel: "Ilustración",
    designerUrl: "/designerv",
    thumbnailBg: "#1E1B4B",
    variant: "space",
  },
  {
    id: "fav-9",
    title: "Create More",
    category: "templates",
    categoryLabel: "Tipografía",
    designerUrl: "/designerv",
    thumbnailBg: "#0F172A",
    variant: "createmore",
  },
  {
    id: "fav-10",
    title: "Bear Street",
    category: "resources",
    categoryLabel: "Ilustración",
    designerUrl: "/designerv",
    thumbnailBg: "#B45309",
    variant: "bear",
  },
  {
    id: "fav-11",
    title: "Natural Balance",
    category: "templates",
    categoryLabel: "Plantilla",
    designerUrl: "/designerv",
    thumbnailBg: "#F8FAFC",
    variant: "natural",
  },
  {
    id: "fav-12",
    title: "Art No Limits",
    category: "templates",
    categoryLabel: "Plantilla",
    designerUrl: "/designerv",
    thumbnailBg: "#0EA5E9",
    variant: "artnolimits",
  },
];

// ── Miniaturas Gráficas para los 12 Recursos ─────────────────────────────────
function ResourceThumbnail({ variant }: { variant: FavoriteResource["variant"] }) {
  switch (variant) {
    case "tiger":
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#EA580C" />
          {/* Geometría de Tigre */}
          <circle cx="120" cy="100" r="60" fill="#F97316" />
          <path d="M70 50L90 80L80 90L60 70Z" fill="#18181B" />
          <path d="M170 50L150 80L160 90L180 70Z" fill="#18181B" />
          <polygon points="120,60 100,105 140,105" fill="#FFFFFF" />
          <polygon points="120,70 105,100 135,100" fill="#18181B" />
          <circle cx="95" cy="95" r="7" fill="#FBBF24" />
          <circle cx="95" cy="95" r="3.5" fill="#18181B" />
          <circle cx="145" cy="95" r="7" fill="#FBBF24" />
          <circle cx="145" cy="95" r="3.5" fill="#18181B" />
          <polygon points="120,115 108,128 132,128" fill="#18181B" />
          {/* Franjas */}
          <path d="M80 75L100 85L85 92" stroke="#18181B" strokeWidth="4" strokeLinecap="round" />
          <path d="M160 75L140 85L155 92" stroke="#18181B" strokeWidth="4" strokeLinecap="round" />
          <path d="M120 45L120 62" stroke="#18181B" strokeWidth="4" strokeLinecap="round" />
          <path d="M110 50L114 62" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
          <path d="M130 50L126 62" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "goodthings":
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#F8FAFC" />
          {/* Ramas florales */}
          <path d="M40 50C60 65 80 55 95 40C85 65 65 75 40 50Z" fill="#334155" />
          <path d="M200 50C180 65 160 55 145 40C155 65 175 75 200 50Z" fill="#334155" />
          <path d="M50 160C70 145 90 155 105 170C95 145 75 135 50 160Z" fill="#334155" />
          <path d="M190 160C170 145 150 155 135 170C145 145 165 135 190 160Z" fill="#334155" />
          {/* Texto GOOD THINGS TAKE TIME */}
          <text x="120" y="85" textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="800" letterSpacing="3">GOOD</text>
          <text x="120" y="118" textAnchor="middle" fill="#0F172A" fontSize="28" fontFamily="serif" fontStyle="italic">Things</text>
          <text x="120" y="142" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600" letterSpacing="4">TAKE TIME</text>
        </svg>
      );
    case "sakura":
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#09090B" />
          {/* Círculo rojo sol naciente */}
          <circle cx="120" cy="100" r="65" fill="#DC2626" />
          {/* Caracteres japoneses kanji */}
          <text x="65" y="80" fill="#FFFFFF" fontSize="18" fontWeight="bold">桜</text>
          <text x="65" y="105" fill="#FFFFFF" fontSize="18" fontWeight="bold">の</text>
          <text x="65" y="130" fill="#FFFFFF" fontSize="18" fontWeight="bold">季</text>
          <text x="65" y="155" fill="#FFFFFF" fontSize="18" fontWeight="bold">節</text>
          {/* Ramas de sakura y flores rosadas */}
          <path d="M110 160C125 130 140 120 170 95" stroke="#451A03" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M140 120C155 110 175 115 185 105" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
          <circle cx="170" cy="95" r="8" fill="#FBCFE8" />
          <circle cx="170" cy="95" r="3" fill="#BE185D" />
          <circle cx="150" cy="115" r="7" fill="#FBCFE8" />
          <circle cx="185" cy="105" r="9" fill="#FBCFE8" />
          <circle cx="130" cy="135" r="7" fill="#FDF2F8" />
        </svg>
      );
    case "sunset":
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#F43F5E" />
          {/* Sol en atardecer */}
          <circle cx="120" cy="110" r="50" fill="#FDE047" />
          {/* Mar */}
          <rect x="0" y="125" width="240" height="75" fill="#0284C7" />
          {/* Palmeras en silueta negra */}
          <path d="M60 160C68 130 75 110 85 90" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
          <path d="M85 90C70 82 55 85 45 92" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          <path d="M85 90C85 75 88 65 95 60" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          <path d="M85 90C98 82 110 86 115 95" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          <path d="M175 160C170 135 165 115 155 95" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M155 95C140 90 130 95 125 102" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          <path d="M155 95C168 88 180 92 185 100" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "brooklyn":
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#F8FAFC" />
          {/* Arco con tipografía Brooklyn */}
          <path d="M40 100C80 65 160 65 200 100" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
          <text x="120" y="95" textAnchor="middle" fill="#0F172A" fontSize="22" fontWeight="900" letterSpacing="1">BROOKLYN</text>
          <text x="120" y="122" textAnchor="middle" fill="#DC2626" fontSize="14" fontWeight="800" fontStyle="italic" letterSpacing="2">NEW YORK</text>
          <line x1="70" y1="135" x2="170" y2="135" stroke="#0F172A" strokeWidth="1.5" />
          <text x="120" y="148" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="700">EST. 1998</text>
        </svg>
      );
    case "skull":
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#0A0A0A" />
          {/* Llamas de fondo */}
          <path d="M80 160C60 120 70 80 95 50C95 80 115 80 120 40C135 70 145 70 155 55C170 85 180 110 160 160Z" fill="#DC2626" />
          <path d="M95 160C80 130 90 100 105 75C110 100 125 100 125 65C135 90 145 90 150 80C160 105 165 125 145 160Z" fill="#F97316" />
          <path d="M105 160C95 135 105 115 115 95C120 115 130 115 130 90C135 110 140 110 145 100C150 120 155 135 135 160Z" fill="#FBBF24" />
          {/* Calavera blanca estilizada */}
          <ellipse cx="120" cy="110" rx="30" ry="25" fill="#FFFFFF" />
          <rect x="105" y="125" width="30" height="18" fill="#FFFFFF" rx="3" />
          <ellipse cx="110" cy="112" rx="7" ry="8" fill="#0A0A0A" />
          <ellipse cx="130" cy="112" rx="7" ry="8" fill="#0A0A0A" />
          <polygon points="120,120 116,128 124,128" fill="#0A0A0A" />
          <line x1="112" y1="135" x2="112" y2="143" stroke="#0A0A0A" strokeWidth="2" />
          <line x1="120" y1="135" x2="120" y2="143" stroke="#0A0A0A" strokeWidth="2" />
          <line x1="128" y1="135" x2="128" y2="143" stroke="#0A0A0A" strokeWidth="2" />
        </svg>
      );
    case "wave":
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#FDE047" />
          <circle cx="120" cy="85" r="45" fill="#EF4444" />
          {/* Gran ola azul con espuma blanca */}
          <path
            d="M0 160C40 160 60 140 80 120C100 100 120 70 140 60C130 75 110 85 100 95C130 90 160 110 180 135C200 160 220 160 240 160V200H0Z"
            fill="#0369A1"
          />
          <path
            d="M0 170C50 170 80 150 110 135C140 120 170 140 240 170V200H0Z"
            fill="#0284C7"
          />
          {/* Espuma */}
          <circle cx="135" cy="62" r="4" fill="#FFFFFF" />
          <circle cx="142" cy="68" r="3.5" fill="#FFFFFF" />
          <circle cx="125" cy="72" r="3" fill="#FFFFFF" />
          <circle cx="95" cy="98" r="4" fill="#FFFFFF" />
        </svg>
      );
    case "space":
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#0F172A" />
          {/* Estrellas */}
          <circle cx="40" cy="40" r="1.5" fill="#FFFFFF" />
          <circle cx="190" cy="35" r="1.5" fill="#FFFFFF" />
          <circle cx="210" cy="90" r="1" fill="#FFFFFF" />
          <circle cx="50" cy="140" r="1" fill="#FFFFFF" />
          {/* Planeta con anillo */}
          <circle cx="180" cy="50" r="16" fill="#818CF8" />
          <ellipse cx="180" cy="50" rx="26" ry="6" stroke="#C7D2FE" strokeWidth="2" fill="none" transform="rotate(-15 180 50)" />
          {/* Casco astronauta */}
          <circle cx="120" cy="100" r="42" fill="#E2E8F0" />
          <ellipse cx="120" cy="95" rx="28" ry="20" fill="#0284C7" />
          <path d="M102 90C110 85 125 85 138 90" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
          <rect x="98" y="135" width="44" height="25" fill="#CBD5E1" rx="4" />
        </svg>
      );
    case "createmore":
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#09090B" />
          {/* Mariposas estilizadas */}
          <path d="M120 70C110 50 85 50 90 75C95 100 120 90 120 90Z" fill="#E2E8F0" />
          <path d="M120 70C130 50 155 50 150 75C145 100 120 90 120 90Z" fill="#E2E8F0" />
          <path d="M120 85C110 95 95 105 105 115C115 125 120 100 120 100Z" fill="#CBD5E1" />
          <path d="M120 85C130 95 145 105 135 115C125 125 120 100 120 100Z" fill="#CBD5E1" />
          {/* Texto CREATE MORE */}
          <text x="120" y="140" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900" letterSpacing="2">CREATE</text>
          <text x="120" y="165" textAnchor="middle" fill="#F59E0B" fontSize="22" fontWeight="900" fontStyle="italic" letterSpacing="4">MORE</text>
        </svg>
      );
    case "bear":
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#B45309" />
          {/* Oso con gafas de sol */}
          <circle cx="85" cy="65" r="22" fill="#78350F" />
          <circle cx="155" cy="65" r="22" fill="#78350F" />
          <circle cx="120" cy="105" r="50" fill="#92400E" />
          <ellipse cx="120" cy="120" rx="26" ry="18" fill="#FDE68A" />
          <polygon points="120,112 110,122 130,122" fill="#18181B" />
          {/* Gafas de sol negras */}
          <rect x="80" y="85" width="36" height="22" rx="4" fill="#09090B" />
          <rect x="124" y="85" width="36" height="22" rx="4" fill="#09090B" />
          <line x1="116" y1="94" x2="124" y2="94" stroke="#09090B" strokeWidth="4" />
          <path d="M85 88L110 102" stroke="#FDE047" strokeWidth="2.5" />
          <path d="M129 88L154 102" stroke="#FDE047" strokeWidth="2.5" />
        </svg>
      );
    case "natural":
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#F8FAFC" />
          {/* Hojas botánicas botánicas */}
          <path d="M120 40C90 70 90 120 120 150C150 120 150 70 120 40Z" fill="#334155" />
          <line x1="120" y1="45" x2="120" y2="155" stroke="#F8FAFC" strokeWidth="2" />
          <path d="M80 80C65 95 65 125 85 140C100 125 100 95 80 80Z" fill="#475569" />
          <path d="M160 80C175 95 175 125 155 140C140 125 140 95 160 80Z" fill="#475569" />
          <text x="120" y="175" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="800" letterSpacing="2">NATURAL</text>
        </svg>
      );
    case "artnolimits":
    default:
      return (
        <svg viewBox="0 0 240 200" fill="none" className="h-full w-full object-cover">
          <rect width="240" height="200" fill="#0284C7" />
          {/* Manchas de pintura coloridas */}
          <circle cx="80" cy="70" r="45" fill="#EF4444" />
          <circle cx="160" cy="80" r="50" fill="#F59E0B" />
          <circle cx="120" cy="130" r="45" fill="#10B981" />
          <rect x="50" y="70" width="140" height="60" rx="4" fill="#0F172A" fillOpacity="0.85" />
          <text x="120" y="98" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" letterSpacing="1">ART</text>
          <text x="120" y="118" textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="700" letterSpacing="3">NO LIMITS</text>
        </svg>
      );
  }
}

// ── Menú de Tres Puntos para Cada Recurso ─────────────────────────────────────
function FavoriteCardMenu({
  item,
  onRemove,
}: {
  item: FavoriteResource;
  onRemove: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        className={cn(
          customerIconButtonClass,
          "h-7 w-7 text-slate-400",
          open && "bg-slate-100 text-slate-800",
        )}
        aria-label="Más opciones"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <CustomerPortalMenu
        open={open}
        anchorRef={buttonRef}
        onClose={() => setOpen(false)}
        minWidth={175}
      >
          <Link
            to={item.designerUrl}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            <span>Abrir en Diseñador</span>
          </Link>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onRemove();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-600" />
            <span>Eliminar de favoritos</span>
          </button>
      </CustomerPortalMenu>
    </div>
  );
}

// ── Página Principal de Favoritos ───────────────────────────────────────────
export function CustomerFavoritesPage() {
  const navigate = useNavigate();
  const [items, setItems] = React.useState<FavoriteResource[]>(INITIAL_FAVORITES);
  const [activeCategory, setActiveCategory] = React.useState<FavoriteCategory>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<CustomerViewMode>("grid");
  const [sortOrder, setSortOrder] = React.useState<SortOption>("recent");
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  // Contadores dinámicos derivados de los datos
  const totalCount = items.length;
  const designsCount = items.filter((i) => i.category === "designs").length;
  const templatesCount = items.filter((i) => i.category === "templates").length;
  const resourcesCount = items.filter((i) => i.category === "resources").length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleToggleFavorite = (id: string, title: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast(`"${title}" eliminado de tus favoritos.`);
  };

  // Filtrado y ordenamiento
  const displayedItems = React.useMemo(() => {
    let list = items;
    if (activeCategory !== "all") {
      list = list.filter((i) => i.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.categoryLabel.toLowerCase().includes(q),
      );
    }
    if (sortOrder === "name") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortOrder === "oldest") {
      return [...list].reverse();
    }
    return list;
  }, [items, activeCategory, searchQuery, sortOrder]);

  const CATEGORY_TABS: { key: FavoriteCategory; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: totalCount },
    { key: "designs", label: "Diseños", count: designsCount },
    { key: "templates", label: "Plantillas", count: templatesCount },
    { key: "resources", label: "Recursos", count: resourcesCount },
  ];

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-150">
      {/* ── Encabezado Principal ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
            Favoritos
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Tus diseños, plantillas y recursos guardados para inspirar tu próximo proyecto.
          </p>
        </div>

        {/* Contador superior derecho: 12 recursos guardados */}
        <span className="text-xs text-slate-400 font-medium self-start sm:self-auto">
          {totalCount} recursos guardados
        </span>
      </div>

      {/* ── Toast de Feedback ────────────────────────────────────────────── */}
      {toastMsg && (
        <div
          className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 animate-in fade-in duration-150"
          style={{ borderRadius: 5 }}
          role="status"
        >
          <CheckCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Barra de Controles: Filtros, Búsqueda, Orden y Vistas ────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Pestañas de categoría sin contadores */}
        <div
          className="flex flex-wrap gap-1.5 bg-slate-100 p-1 border border-slate-200/60"
          style={{ borderRadius: 5 }}
          role="tablist"
          aria-label="Categorías de favoritos"
        >
          {CATEGORY_TABS.map(({ key, label }) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(key)}
                className={cn(
                  "min-h-8 px-3.5 text-xs font-semibold transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900",
                )}
                style={{ borderRadius: 5 }}
              >
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Grupo derecho: Búsqueda, Ordenar y Selector de Vista */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Buscador */}
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en favoritos..."
              className="h-[42px] w-full border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
              style={{ borderRadius: 5 }}
              aria-label="Buscar en favoritos"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={cn(customerIconButtonClass, "absolute right-2.5 top-1/2 h-7 w-7 -translate-y-1/2")}
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Menú Ordenar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen((p) => !p)}
              className="inline-flex h-[42px] w-[160px] items-center justify-between border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              style={{ borderRadius: 5 }}
              aria-expanded={isSortOpen}
            >
              <span>
                {sortOrder === "recent"
                  ? "Más recientes"
                  : sortOrder === "name"
                    ? "Nombre (A-Z)"
                    : "Más antiguos"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            </button>

            {isSortOpen && (
              <div
                className="absolute right-0 top-9 z-40 min-w-[140px] border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
                style={{ borderRadius: 5 }}
              >
                <button
                  type="button"
                  onClick={() => { setSortOrder("recent"); setIsSortOpen(false); }}
                  className="flex w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Más recientes
                </button>
                <button
                  type="button"
                  onClick={() => { setSortOrder("name"); setIsSortOpen(false); }}
                  className="flex w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Nombre (A-Z)
                </button>
                <button
                  type="button"
                  onClick={() => { setSortOrder("oldest"); setIsSortOpen(false); }}
                  className="flex w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Más antiguos
                </button>
              </div>
            )}
          </div>

          {/* Selector de Vista: Cuadrícula | Lista */}
          <CustomerViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* ── Galería de Recursos / Estado Vacío ────────────────────────────── */}
      {displayedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-200">
          <div className="relative flex h-36 w-52 items-center justify-center text-slate-500" aria-hidden="true">
            <svg viewBox="0 0 208 144" className="h-full w-full" fill="none">
              <path d="M31 111.5h146" stroke="currentColor" strokeOpacity=".18" strokeWidth="2" />
              <path d="M48 99V49c0-3.3 2.7-6 6-6h58c3.3 0 6 2.7 6 6v50" stroke="currentColor" strokeWidth="2" />
              <path d="M48 62h70M48 76h70M48 90h46" stroke="currentColor" strokeOpacity=".28" strokeWidth="2" />
              <path d="m131 39 8.5 8.5L157 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M118 103c0-13 10.5-23.5 23.5-23.5S165 90 165 103" stroke="currentColor" strokeWidth="2" />
              <path d="M130 103c0-6.6 5.1-12 11.5-12s11.5 5.4 11.5 12" stroke="currentColor" strokeOpacity=".5" strokeWidth="2" />
              <path d="M136 67c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9Z" stroke="currentColor" strokeWidth="2" />
              <path d="M29 43c0-5.5 4.5-10 10-10s10 4.5 10 10c0 10-10 14-10 14S29 53 29 43Z" stroke="currentColor" strokeOpacity=".55" strokeWidth="2" />
              <path d="M35 43h8M39 39v8" stroke="currentColor" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            {searchQuery ? "No se encontraron favoritos" : "Aún no tienes favoritos guardados"}
          </h2>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            {searchQuery
              ? "Prueba buscando con otro término o limpia los filtros."
              : "Explora plantillas y diseños en el Diseñador para guardarlos aquí."}
          </p>
          <Link
            to="/designerv"
            className="mt-5 inline-flex bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-700"
            style={{ borderRadius: 5 }}
          >
            <span>Ir al Diseñador</span>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* Vista en Cuadrícula (3-4 columnas idéntica a la imagen) */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden border border-slate-200 bg-white transition-all duration-150 hover:shadow-xs hover:border-slate-300"
              style={{ borderRadius: 5 }}
            >
              {/* Contenedor de Miniatura Gráfica */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                <ResourceThumbnail variant={item.variant} />

                {/* Botón flotante de Corazón en la esquina superior derecha */}
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(item.id, item.title)}
                  className={`${customerIconButtonClass} absolute right-2 top-2 h-7 w-7`}
                  title="Eliminar de favoritos"
                  aria-label={`Quitar ${item.title} de favoritos`}
                >
                  <Heart className="h-4 w-4 fill-slate-500 text-slate-500" />
                </button>
              </div>

              {/* Contenido inferior de la tarjeta */}
              <div className="flex flex-1 flex-col justify-between p-3">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="truncate text-xs font-bold text-slate-900 group-hover:text-slate-600 transition-colors">
                      {item.title}
                    </h3>
                    <FavoriteCardMenu
                      item={item}
                      onRemove={() => handleToggleFavorite(item.id, item.title)}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {item.categoryLabel}
                  </p>
                </div>

                {/* Enlace: Abrir en diseñador -> */}
                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  <Link
                    to={item.designerUrl}
                    className="inline-flex text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <span>Abrir en diseñador</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vista en Lista */
        <div
          className="divide-y divide-slate-100 overflow-hidden border border-slate-200 bg-white"
          style={{ borderRadius: 5 }}
        >
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-3.5 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="h-12 w-14 shrink-0 overflow-hidden bg-slate-100"
                  style={{ borderRadius: 4 }}
                >
                  <ResourceThumbnail variant={item.variant} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-xs font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">{item.categoryLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to={item.designerUrl}
                  className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <span>Abrir en diseñador</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleToggleFavorite(item.id, item.title)}
                  className={`${customerIconButtonClass} h-7 w-7`}
                  title="Quitar de favoritos"
                >
                  <Heart className="h-4 w-4 fill-slate-500 text-slate-500" />
                </button>

                <FavoriteCardMenu
                  item={item}
                  onRemove={() => handleToggleFavorite(item.id, item.title)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pie de Página: Mostrando X recursos ──────────────────────────── */}
      {displayedItems.length > 0 && (
        <div className="pt-2 text-xs text-slate-400 font-medium">
          Mostrando {displayedItems.length} recursos
        </div>
      )}
    </div>
  );
}

export default CustomerFavoritesPage;
