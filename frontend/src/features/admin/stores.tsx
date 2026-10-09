import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Store,
  Plus,
  Download,
  Filter,
  Search,
  ChevronDown,
  ShoppingBag,
  Mail,
  Phone,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle2,
  Trash2,
  FileSearch,
  XCircle,
  X,
  Pencil,
  Check,
  Building2,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { PageHeader } from "@/shared/ui/page-header";

/* ── Interfaces ───────────────────────────────────────────────── */
export interface AdminStore {
  id: string;
  name: string;
  email: string;
  phone: string;
  owner: string;
  ownerAvatar?: string;
  banner: string;
  logo: string;
  logoBg?: string;
  logoColor?: string;
  plan: "Básico" | "Profesional" | "Premium";
  status: "Activa" | "Inactiva" | "Pendiente";
  orders: number;
  revenue: string;
  joined: string;
}

/* ── Helper: Formatea fecha corta a texto completo ─────────────── */
const formatFullDate = (dateStr: string): string => {
  const months: Record<string, string> = {
    Ene: "enero",
    Feb: "febrero",
    Mar: "marzo",
    Abr: "abril",
    May: "mayo",
    Jun: "junio",
    Jul: "julio",
    Ago: "agosto",
    Sep: "septiembre",
    Oct: "octubre",
    Nov: "noviembre",
    Dic: "diciembre",
  };
  const match = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3}),?\s+(\d{4})$/);
  if (match) {
    const day = match[1];
    const month = months[match[2]] || match[2].toLowerCase();
    const year = match[3];
    return `${day} de ${month} del ${year}`;
  }
  if (dateStr.toLowerCase() === "hoy") return "hoy";
  return dateStr;
};

/* ── Datos de Tiendas según Referencia Oficial ─────────────────── */
const initialStores: AdminStore[] = [
  {
    id: "1",
    name: "Creative Print Store",
    email: "contacto@creativeprint.com",
    phone: "(321) 456-7890",
    owner: "Ana García",
    ownerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
    logo: "C",
    logoBg: "#F3E8FF",
    logoColor: "#7E22CE",
    plan: "Premium",
    status: "Activa",
    orders: 156,
    revenue: "$8.450.000",
    joined: "18 Abr, 2026",
  },
  {
    id: "2",
    name: "Urban Style Prints",
    email: "hola@urbanstyle.com",
    phone: "(320) 654-3210",
    owner: "Ivan Felipe Mosquera Pripra",
    ownerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
    logo: "USP",
    logoBg: "#F1F5F9",
    logoColor: "#0F172A",
    plan: "Profesional",
    status: "Activa",
    orders: 98,
    revenue: "$4.230.000",
    joined: "11 Abr, 2026",
  },
  {
    id: "3",
    name: "Print House CO",
    email: "info@printhouse.com",
    phone: "(315) 987-6543",
    owner: "María Torres",
    ownerAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    logo: "PH",
    logoBg: "#083344",
    logoColor: "#38BDF8",
    plan: "Básico",
    status: "Activa",
    orders: 73,
    revenue: "$2.310.000",
    joined: "05 Abr, 2026",
  },
  {
    id: "4",
    name: "Color Express",
    email: "ventas@colorexpress.com",
    phone: "(310) 123-4567",
    owner: "Luis Mendoza",
    ownerAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80",
    logo: "C",
    logoBg: "#18181B",
    logoColor: "#F59E0B",
    plan: "Profesional",
    status: "Inactiva",
    orders: 0,
    revenue: "$0",
    joined: "28 Mar, 2026",
  },
  {
    id: "5",
    name: "Design It Now",
    email: "hello@designitnow.com",
    phone: "(316) 789-0123",
    owner: "Sofia Ruiz",
    ownerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80",
    logo: "D",
    logoBg: "#000000",
    logoColor: "#FFFFFF",
    plan: "Premium",
    status: "Pendiente",
    orders: 0,
    revenue: "$0",
    joined: "21 May, 2026",
  },
  {
    id: "6",
    name: "Merch Studio",
    email: "studio@merch.com",
    phone: "(317) 456-8901",
    owner: "Diego Reyes",
    ownerAvatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80",
    logo: "M",
    logoBg: "#EEF2FF",
    logoColor: "#4F46E5",
    plan: "Básico",
    status: "Activa",
    orders: 45,
    revenue: "$1.120.000",
    joined: "02 Mar, 2026",
  },
  {
    id: "7",
    name: "Ink & Wear",
    email: "info@inkwear.com",
    phone: "(318) 234-5678",
    owner: "Valentina Cruz",
    ownerAvatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    logo: "IW",
    logoBg: "#134E4A",
    logoColor: "#2DD4BF",
    plan: "Profesional",
    status: "Activa",
    orders: 88,
    revenue: "$3.650.000",
    joined: "15 Feb, 2026",
  },
  {
    id: "8",
    name: "Art & Print",
    email: "hola@artprint.com",
    phone: "(314) 678-9012",
    owner: "Andrés Villa",
    ownerAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80",
    logo: "A&P",
    logoBg: "#FEF3C7",
    logoColor: "#D97706",
    plan: "Básico",
    status: "Activa",
    orders: 22,
    revenue: "$890.000",
    joined: "10 Ene, 2026",
  },
];

export default function Stores() {
  const [stores, setStores] = useState<AdminStore[]>(initialStores);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [perPage, setPerPage] = useState("12");
  const [exportNotice, setExportNotice] = useState(false);

  // Estados de modales
  const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null);
  const [editingStore, setEditingStore] = useState<AdminStore | null>(null);
  const [isNewStoreModalOpen, setIsNewStoreModalOpen] = useState(false);
  const [storeToToggle, setStoreToToggle] = useState<AdminStore | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<AdminStore | null>(null);
  const [modalNotice, setModalNotice] = useState<string | null>(null);

  // Filtrado
  const filtered = stores.filter((s) => {
    const term = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.owner.toLowerCase().includes(term);

    const matchPlan = planFilter === "Todos" || s.plan === planFilter;
    const matchStatus = statusFilter === "Todos" || s.status === statusFilter;

    return matchSearch && matchPlan && matchStatus;
  });

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2000);
  };

  const toggleStoreStatus = (id: string) => {
    setStores((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "Activa" ? "Inactiva" : "Activa" }
          : s,
      ),
    );
    setModalNotice("Estado de la tienda actualizado");
    setTimeout(() => setModalNotice(null), 2000);
  };

  const handleDeleteStore = (id: string) => {
    setStores((prev) => prev.filter((s) => s.id !== id));
    setModalNotice("Tienda eliminada correctamente");
    setTimeout(() => setModalNotice(null), 2000);
  };

  const outletContext = useOutletContext<{ sidebarCollapsed?: boolean }>();
  const isSidebarCollapsed = outletContext?.sidebarCollapsed ?? false;

  const gridColsClass = isSidebarCollapsed
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4";

  const gridClass = `grid ${gridColsClass} gap-4 transition-all duration-300`;

  return (
    <div className="p-3.5 sm:p-4 space-y-4 bg-[var(--background)] min-h-full">
      {/* ── Header ─────────────────────────────────────────────── */}
      <PageHeader
        title="Tiendas"
        description="Gestiona todas las tiendas registradas en la plataforma"
        icon={Store}
        action={
          <>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-[5px] px-3 py-1.5 bg-white hover:bg-[var(--surface-muted)] transition-colors cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Download className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              {exportNotice ? "Exportando..." : "Exportar"}
            </button>
            <button
              type="button"
              onClick={() => setIsNewStoreModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[var(--primary)] rounded-[5px] px-3.5 py-1.5 hover:bg-[var(--primary-hover)] transition-colors shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nueva Tienda</span>
            </button>
          </>
        }
      />

      {/* ── Barra de Búsqueda y Filtros ────────────────────────── */}
      <div className="bg-white rounded-[5px] border border-[var(--border)] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 min-w-[280px] max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tienda por nombre, correo o propietario..."
            className="w-full h-9 pl-9 pr-3.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-white border border-[var(--border)] rounded-[5px] outline-none transition-all hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.08)] focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
          />
        </div>

        {/* Selectores de Filtro y Botón */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Planes */}
          <div className="relative inline-flex items-center">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-9 rounded-[5px] border border-[var(--border)] bg-white pl-3.5 pr-8 text-xs font-medium text-[var(--text-secondary)] outline-none transition-all appearance-none cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
            >
              <option value="Todos">Todos los planes</option>
              <option value="Básico">Plan Básico</option>
              <option value="Profesional">Plan Profesional</option>
              <option value="Premium">Plan Premium</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
          </div>

          {/* Selector de Estados */}
          <div className="relative inline-flex items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-[5px] border border-[var(--border)] bg-white pl-3.5 pr-8 text-xs font-medium text-[var(--text-secondary)] outline-none transition-all appearance-none cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
              <option value="Pendiente">Pendiente</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
          </div>

          {/* Botón Filtros */}
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-[5px] border border-[var(--border)] bg-white px-3.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-colors cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Filter className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* ── Cuadrícula de Tarjetas de Tiendas ───────────────────── */}
      <div className={gridClass}>
        {filtered.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-[5px] border border-[var(--border)] shadow-2xs overflow-hidden flex flex-col justify-between hover:border-[var(--border-strong)] transition-all"
          >
            <div>
              {/* Parte Superior: Imagen de cabecera + Menú 3 puntos + Logo + Avatar */}
              <div className="relative h-28 w-full bg-[var(--surface-strong)]">
                <img
                  src={store.banner}
                  alt={store.name}
                  className="h-full w-full object-cover"
                />

                {/* Menú de Tres Puntos sobre la imagen */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="h-7 w-7 rounded-[4px] bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="min-w-[185px] rounded-[5px] p-1 shadow-md border border-[var(--border)] bg-white z-50"
                    >
                      <DropdownMenuItem
                        onClick={() => setSelectedStore(store)}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] rounded-[4px] hover:bg-[var(--surface-muted)] cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                        <span>Ver detalles</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setModalNotice(`Viendo pedidos de ${store.name}`)
                        }
                        className="flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)] rounded hover:bg-[var(--surface-muted)] cursor-pointer"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                        <span>Ver pedidos</span>
                      </DropdownMenuItem>
                      {store.status === "Activa" ? (
                        <DropdownMenuItem
                          onClick={() => setStoreToToggle(store)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)] rounded hover:bg-[var(--surface-muted)] cursor-pointer"
                        >
                          <Ban className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                          <span>Suspender tienda</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => setStoreToToggle(store)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)] rounded hover:bg-[var(--surface-muted)] cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                          <span>Activar tienda</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setStoreToDelete(store)}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)] rounded hover:bg-[var(--surface-muted)] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                        <span>Eliminar tienda</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* 1. Logo de la tienda (inferior izquierda) */}
                <div
                  className="absolute -bottom-5 left-3.5 h-11 w-11 rounded-full border-2 border-white shadow-xs flex items-center justify-center font-bold text-[13px] z-10 select-none overflow-hidden"
                  style={{
                    backgroundColor: store.logoBg || "var(--surface)",
                    color: store.logoColor || "var(--text-primary)",
                  }}
                >
                  {store.logo}
                </div>

                {/* 2. Foto del propietario (inferior derecha) */}
                <div className="absolute -bottom-3.5 right-3.5 z-10">
                  {store.ownerAvatar ? (
                    <img
                      src={store.ownerAvatar}
                      alt={store.owner}
                      className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-xs"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full border-2 border-white bg-[var(--border)] flex items-center justify-center text-[var(--text-muted)] shadow-xs">
                      <UserRound className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la Tienda */}
              <div className="pt-6 px-3.5 pb-2">
                {/* Nombre de la Tienda */}
                <h3
                  className="text-[14px] font-bold text-[var(--text-primary)] leading-tight truncate"
                  title={store.name}
                >
                  {store.name}
                </h3>

                {/* Nombre del Propietario — información secundaria */}
                <p className="text-[12px] text-[var(--text-secondary)] font-medium leading-tight mt-1.5 truncate">
                  {store.owner}
                </p>

                {/* Plan — información terciaria, gris más claro */}
                <p className="text-[11px] text-[var(--text-muted)] font-semibold leading-tight mt-0.5 leading-none">
                  Plan {store.plan}
                </p>

                {/* Fecha de Registro — limpia y centrada */}
                <div className="py-2.5 my-2.5 border-y border-[var(--surface-muted)] text-left">
                  <p className="text-[11.5px] text-[var(--text-secondary)] font-semibold leading-tight truncate">
                    Registrado el {formatFullDate(store.joined)}
                  </p>
                </div>

                {/* Contacto: Correo y Teléfono */}
                <div className="space-y-1 my-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                    <Mail className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                    <span className="truncate">{store.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                    <Phone className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                    <span className="truncate">{store.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila Inferior: Botones "Ver Tienda" y "Editar" */}
            <div className="px-3.5 pb-3 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStore(store)}
                  className="h-8 rounded-[5px] border border-[var(--border)] bg-white text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  Ver Tienda
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStore(store)}
                  className="h-8 rounded-[5px] bg-[var(--primary)] text-xs font-semibold text-white hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-[5px] border border-[var(--border)] p-12 text-center text-[var(--text-secondary)]">
          No se encontraron tiendas con los filtros seleccionados.
        </div>
      )}

      {/* ── Paginación ─────────────────────────────────────────── */}
      <div className="bg-white rounded-[5px] border border-[var(--border)] p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <p className="shrink-0 text-xs text-[var(--text-secondary)]">
          Mostrando <span className="font-semibold text-[var(--text-primary)]">1</span> a{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            {filtered.length > 0
              ? Math.min(Number(perPage), filtered.length)
              : 0}
          </span>{" "}
          de <span className="font-semibold text-[var(--text-primary)]">248</span> tiendas
        </p>

        {/* Botones de Navegación Numérica */}
        <div className="flex max-w-full shrink-0 items-center gap-2 overflow-x-auto">
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] bg-white flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors text-xs cursor-pointer"
            aria-label="Primera página"
          >
            «
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] bg-white flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors text-xs cursor-pointer"
            aria-label="Página anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold shadow-2xs"
          >
            1
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center text-xs font-medium transition-colors cursor-pointer"
          >
            2
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center text-xs font-medium transition-colors cursor-pointer"
          >
            3
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center text-xs font-medium transition-colors cursor-pointer"
          >
            4
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center text-xs font-medium transition-colors cursor-pointer"
          >
            5
          </button>
          <span className="h-[34px] w-7 min-w-7 shrink-0 flex items-center justify-center text-xs text-[var(--text-muted)]">
            ...
          </span>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center text-xs font-medium transition-colors cursor-pointer"
          >
            21
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] bg-white flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors text-xs cursor-pointer"
            aria-label="Página siguiente"
          >
            ›
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] bg-white flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors text-xs cursor-pointer"
            aria-label="Última página"
          >
            »
          </button>
        </div>

        {/* Selector de Registros por Página */}
        <div className="relative shrink-0">
          <select
            value={perPage}
            onChange={(e) => setPerPage(e.target.value)}
            className="h-[34px] min-w-[132px] rounded-[5px] border border-[var(--border)] bg-white pl-3 pr-8 text-xs text-[var(--text-secondary)] outline-none appearance-none cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--primary)] shadow-2xs"
          >
            <option value="5">5 por página</option>
            <option value="10">10 por página</option>
            <option value="12">12 por página</option>
            <option value="15">15 por página</option>
            <option value="20">20 por página</option>
            <option value="30">30 por página</option>
            <option value="50">50 por página</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
        </div>
      </div>

      {/* ── Modal: Ver Detalles de Tienda ──────────────────────── */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[5px] max-w-lg w-full p-5 sm:p-6 shadow-xl border border-[var(--border)] relative">
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Detalles de la Tienda
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStore(null)}
                className="h-7 w-7 rounded-[4px] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Imagen del banner de la tienda */}
              <div className="h-32 w-full rounded-[5px] overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] -mt-1">
                <img
                  src={selectedStore.banner}
                  alt={selectedStore.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Logo + Nombre + Propietario y Plan */}
              <div className="flex items-center gap-3.5">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm shadow-xs border border-[var(--border)] shrink-0"
                  style={{
                    backgroundColor: selectedStore.logoBg || "var(--surface)",
                    color: selectedStore.logoColor || "var(--text-primary)",
                  }}
                >
                  {selectedStore.logo}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-[var(--text-primary)] truncate">
                    {selectedStore.name}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Propietario: {selectedStore.owner} <br /> Plan{" "}
                    {selectedStore.plan}
                  </p>
                </div>
              </div>

              <div className="bg-[var(--surface-muted)] p-3.5 rounded-[5px] border border-[var(--border)] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Estado:</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {selectedStore.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Total de Pedidos:</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {selectedStore.orders} pedidos
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Ingresos Mensuales:</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {selectedStore.revenue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Fecha de Registro:</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {selectedStore.joined}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Correo Electrónico:</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {selectedStore.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Teléfono de Contacto:</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {selectedStore.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedStore(null)}
                className="px-4 py-1.5 text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] hover:bg-[var(--border-muted)] transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Editar Tienda ───────────────────────────────── */}
      {editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[5px] max-w-md w-full p-5 sm:p-6 shadow-xl border border-[var(--border)] relative">
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-[var(--primary)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Editar Tienda
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="h-7 w-7 rounded-[4px] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStores((prev) =>
                  prev.map((s) =>
                    s.id === editingStore.id ? editingStore : s,
                  ),
                );
                setEditingStore(null);
                setModalNotice("Tienda actualizada correctamente");
                setTimeout(() => setModalNotice(null), 2000);
              }}
              className="py-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Nombre de la Tienda
                </label>
                <input
                  type="text"
                  value={editingStore.name}
                  onChange={(e) =>
                    setEditingStore({ ...editingStore, name: e.target.value })
                  }
                  className="w-full h-8 px-2.5 border border-[var(--border)] rounded-[5px] text-xs outline-none focus:border-[var(--primary)] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Propietario
                </label>
                <input
                  type="text"
                  value={editingStore.owner}
                  onChange={(e) =>
                    setEditingStore({ ...editingStore, owner: e.target.value })
                  }
                  className="w-full h-8 px-2.5 border border-[var(--border)] rounded-[5px] text-xs outline-none focus:border-[var(--primary)] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Plan
                </label>
                <select
                  value={editingStore.plan}
                  onChange={(e) =>
                    setEditingStore({
                      ...editingStore,
                      plan: e.target.value as AdminStore["plan"],
                    })
                  }
                  className="w-full h-8 px-2 border border-[var(--border)] rounded-[5px] text-xs outline-none focus:border-[var(--primary)] shadow-2xs"
                >
                  <option value="Básico">Básico</option>
                  <option value="Profesional">Profesional</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={editingStore.email}
                  onChange={(e) =>
                    setEditingStore({ ...editingStore, email: e.target.value })
                  }
                  className="w-full h-8 px-2.5 border border-[var(--border)] rounded-[5px] text-xs outline-none focus:border-[var(--primary)] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={editingStore.phone}
                  onChange={(e) =>
                    setEditingStore({ ...editingStore, phone: e.target.value })
                  }
                  className="w-full h-8 px-2.5 border border-[var(--border)] rounded-[5px] text-xs outline-none focus:border-[var(--primary)] shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="px-4 py-1.5 text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] hover:bg-[var(--border-muted)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[var(--primary)] rounded-[5px] hover:bg-[var(--primary-hover)] transition-colors shadow-2xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Nueva Tienda ────────────────────────────────── */}
      {isNewStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[5px] max-w-md w-full p-5 sm:p-6 shadow-xl border border-[var(--border)] relative">
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Registrar Nueva Tienda
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewStoreModalOpen(false)}
                className="h-7 w-7 rounded-[4px] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const newStore: AdminStore = {
                  id: String(Date.now()),
                  name: (form.elements.namedItem("name") as HTMLInputElement)
                    .value,
                  owner: (form.elements.namedItem("owner") as HTMLInputElement)
                    .value,
                  plan: (form.elements.namedItem("plan") as HTMLSelectElement)
                    .value as AdminStore["plan"],
                  email: (form.elements.namedItem("email") as HTMLInputElement)
                    .value,
                  phone:
                    (form.elements.namedItem("phone") as HTMLInputElement)
                      .value || "(300) 000-0000",
                  orders: 0,
                  revenue: "$0",
                  joined: "Hoy",
                  status: "Activa",
                  banner:
                    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
                  logo: (
                    form.elements.namedItem("name") as HTMLInputElement
                  ).value
                    .substring(0, 2)
                    .toUpperCase(),
                  logoBg: "#EEF2FF",
                  logoColor: "#2563EB",
                  ownerAvatar: undefined,
                };
                setStores([newStore, ...stores]);
                setIsNewStoreModalOpen(false);
                setModalNotice("Nueva tienda creada con éxito");
                setTimeout(() => setModalNotice(null), 2000);
              }}
              className="py-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Nombre de la Tienda
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Ej. Print & Craft Studio"
                  className="w-full h-8 px-2.5 border border-[var(--border)] rounded-[5px] text-xs outline-none focus:border-[var(--primary)] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Propietario
                </label>
                <input
                  name="owner"
                  type="text"
                  placeholder="Ej. Santiago Morales"
                  className="w-full h-8 px-2.5 border border-[var(--border)] rounded-[5px] text-xs outline-none focus:border-[var(--primary)] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Plan Inicial
                </label>
                <select
                  name="plan"
                  defaultValue="Profesional"
                  className="w-full h-8 px-2 border border-[var(--border)] rounded-[5px] text-xs outline-none focus:border-[var(--primary)] shadow-2xs"
                >
                  <option value="Básico">Básico</option>
                  <option value="Profesional">Profesional</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Correo Electrónico
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="contacto@tienda.com"
                  className="w-full h-8 px-2.5 border border-[var(--border)] rounded-[5px] text-xs outline-none focus:border-[var(--primary)] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Teléfono
                </label>
                <input
                  name="phone"
                  type="text"
                  placeholder="(300) 123-4567"
                  className="w-full h-8 px-2.5 border border-[var(--border)] rounded-[5px] text-xs outline-none focus:border-[var(--primary)] shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewStoreModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] hover:bg-[var(--border-muted)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[var(--primary)] rounded-[5px] hover:bg-[var(--primary-hover)] transition-colors shadow-2xs"
                >
                  Crear Tienda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Suspender / Activar Tienda */}
      {storeToToggle && (
        <ConfirmationModal
          isOpen={Boolean(storeToToggle)}
          onClose={() => setStoreToToggle(null)}
          onConfirm={() => {
            toggleStoreStatus(storeToToggle.id);
            setStoreToToggle(null);
          }}
          title={
            storeToToggle.status === "Activa"
              ? "Suspender tienda"
              : "Activar tienda"
          }
          description={
            storeToToggle.status === "Activa"
              ? `¿Estás seguro de que deseas suspender la tienda "${storeToToggle.name}"? Los productos y el catálogo quedarán temporalmente inaccesibles.`
              : `¿Deseas activar la tienda "${storeToToggle.name}"? Los productos volverán a estar visibles inmediatamente.`
          }
          confirmText={
            storeToToggle.status === "Activa" ? "Suspender" : "Activar"
          }
          variant={storeToToggle.status === "Activa" ? "danger" : "primary"}
        />
      )}

      {/* Confirmation Modal: Eliminar Tienda */}
      {storeToDelete && (
        <ConfirmationModal
          isOpen={Boolean(storeToDelete)}
          onClose={() => setStoreToDelete(null)}
          onConfirm={() => {
            handleDeleteStore(storeToDelete.id);
            setStoreToDelete(null);
          }}
          title="Eliminar tienda"
          description={`¿Estás seguro de que deseas eliminar la tienda "${storeToDelete.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="danger"
        />
      )}
    </div>
  );
}
