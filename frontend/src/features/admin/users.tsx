import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  Plus,
  Download,
  Filter,
  Search,
  ChevronDown,
  Mail,
  Phone,
  MoreHorizontal,
  Eye,
  MessageSquare,
  ShoppingBag,
  Ban,
  UserCheck,
  Trash2,
  UserRound,
  X,
  Pencil,
  Check,
  UserX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { PageHeader } from "@/shared/ui/page-header";

/* ── Tipos de Usuario ─────────────────────────────────────────── */
export type UserRole =
  | "Administrador"
  | "Tienda"
  | "Usuario"
  | "Empleado"
  | "Cliente";

export interface AdminUser {
  id: string;
  name: string;
  role: UserRole;
  store?: string;
  joined: string;
  email: string;
  phone: string;
  avatar?: string;
  status: "Activo" | "Inactivo";
}

/* ── Datos Mock Reales según la Referencia Oficial ────────────── */
const initialUsers: AdminUser[] = [
  {
    id: "1",
    name: "Andrés López",
    role: "Cliente",
    store: "Creator Custom",
    joined: "18 Abr, 2026",
    email: "andres.lopez@email.com",
    phone: "(123) 456-7890",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "Activo",
  },
  {
    id: "2",
    name: "María González",
    role: "Cliente",
    store: "Creator Custom",
    joined: "15 Abr, 2026",
    email: "maria.gonzalez@email.com",
    phone: "(123) 456-7890",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    status: "Activo",
  },
  {
    id: "3",
    name: "Juan Pérez",
    role: "Empleado",
    store: "Creator Custom",
    joined: "12 Abr, 2026",
    email: "juan.perez@email.com",
    phone: "(123) 456-7890",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    status: "Activo",
  },
  {
    id: "4",
    name: "Laura Martínez",
    role: "Cliente",
    store: "Creator Custom",
    joined: "05 Abr, 2026",
    email: "laura.martinez@email.com",
    phone: "(123) 456-7890",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    status: "Inactivo",
  },
  {
    id: "5",
    name: "Oscar Chávez",
    role: "Empleado",
    store: "Creator Custom",
    joined: "02 Abr, 2026",
    email: "oscar.chavez@email.com",
    phone: "(123) 456-7890",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    status: "Activo",
  },
  {
    id: "6",
    name: "Admin Principal",
    role: "Tienda",
    store: "Creator Custom",
    joined: "01 Ene, 2023",
    email: "admin@printshop.com",
    phone: "(123) 456-7890",
    avatar: undefined, // Sin foto -> muestra icono neutral UserRound
    status: "Activo",
  },
  {
    id: "7",
    name: "Carlos Rodríguez",
    role: "Usuario",
    store: "Urban Style Prints",
    joined: "28 Mar, 2026",
    email: "carlos.rodriguez@email.com",
    phone: "(123) 456-7890",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    status: "Activo",
  },
  {
    id: "8",
    name: "Valentina Cruz",
    role: "Empleado",
    store: "Print House CO",
    joined: "20 Mar, 2026",
    email: "valentina.cruz@email.com",
    phone: "(123) 456-7890",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "Activo",
  },
  {
    id: "9",
    name: "Diego Reyes",
    role: "Tienda",
    store: "Color Express",
    joined: "15 Mar, 2026",
    email: "diego.reyes@email.com",
    phone: "(123) 456-7890",
    avatar: undefined,
    status: "Inactivo",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [storeFilter, setStoreFilter] = useState("Todas");
  const [perPage, setPerPage] = useState("12");
  const [currentPage, setCurrentPage] = useState(1);
  const [exportNotice, setExportNotice] = useState(false);

  // Estados de Modales
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<AdminUser | null>(null);
  const [modalNotice, setModalNotice] = useState<string | null>(null);

  // Lista única de tiendas
  const storesList = Array.from(
    new Set(
      initialUsers
        .map((u) => u.store?.split(" ♦ ")[0])
        .filter((s): s is string => Boolean(s)),
    ),
  );

  // Filtrado de usuarios
  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.phone.toLowerCase().includes(term);

    const matchRole =
      roleFilter === "Todos" ||
      u.role.toLowerCase() === roleFilter.toLowerCase();

    const matchStore =
      storeFilter === "Todas" ||
      (u.store && u.store.toLowerCase().includes(storeFilter.toLowerCase()));

    return matchSearch && matchRole && matchStore;
  });

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2000);
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Activo" ? "Inactivo" : "Activo" }
          : u,
      ),
    );
    setModalNotice("Estado del usuario actualizado");
    setTimeout(() => setModalNotice(null), 2000);
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setModalNotice("Usuario eliminado correctamente");
    setTimeout(() => setModalNotice(null), 2000);
  };

  const outletContext = useOutletContext<{ sidebarCollapsed?: boolean }>();
  const isSidebarCollapsed = outletContext?.sidebarCollapsed ?? false;

  const gridColsClass = isSidebarCollapsed
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4";

  const gridClass = `grid ${gridColsClass} gap-4 transition-all duration-300`;

  return (
    <div className="p-3.5 sm:p-4 space-y-4 bg-[#FBFBFD] min-h-full">
      {/* ── Header ─────────────────────────────────────────────── */}
      <PageHeader
        title="Usuarios"
        description="Gestiona todos los usuarios registrados en la plataforma"
        icon={Users}
        action={
          <>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs font-medium text-[#475569] border border-[#E2E8F0] rounded-[5px] px-3 py-1.5 bg-white hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-[#64748B]" />
              {exportNotice ? "Exportando..." : "Exportar"}
            </button>
            <button
              type="button"
              onClick={() => setIsNewUserModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#2563EB] rounded-[5px] px-3.5 py-1.5 hover:bg-[#1D4ED8] transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo Usuario</span>
            </button>
          </>
        }
      />

      {/* ── Barra de Búsqueda y Filtros ────────────────────────── */}
      <div className="bg-white rounded-[5px] border border-[#E5E7EB] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Input de Búsqueda con Icono */}
        <div className="relative flex-1 min-w-[280px] max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario por nombre, email o teléfono..."
            className="w-full h-9 pl-9 pr-3.5 text-xs text-[#111827] placeholder-[#94A3B8] bg-white border border-[#E2E8F0] rounded-[5px] outline-none transition-all hover:border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.08)] shadow-2xs"
          />
        </div>

        {/* Selectores de Filtro y Botón */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Roles */}
          <div className="relative inline-flex items-center">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 rounded-[5px] border border-[#E2E8F0] bg-white pl-3.5 pr-8 text-xs font-medium text-[#475569] outline-none transition-all appearance-none cursor-pointer hover:border-[#CBD5E1] focus:border-[#2563EB] shadow-2xs"
            >
              <option value="Todos">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Tienda">Tienda</option>
              <option value="Usuario">Usuario</option>
              <option value="Empleado">Empleado</option>
              <option value="Cliente">Cliente</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
          </div>

          {/* Selector de Tiendas */}
          <div className="relative inline-flex items-center">
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="h-9 rounded-[5px] border border-[#E2E8F0] bg-white pl-3.5 pr-8 text-xs font-medium text-[#475569] outline-none transition-all appearance-none cursor-pointer hover:border-[#CBD5E1] focus:border-[#2563EB] shadow-2xs"
            >
              <option value="Todas">Todas las tiendas</option>
              {storesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
          </div>

          {/* Botón Filtros */}
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-[5px] border border-[#E2E8F0] bg-white px-3.5 text-xs font-medium text-[#475569] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors cursor-pointer shadow-2xs"
          >
            <Filter className="h-3.5 w-3.5 text-[#64748B]" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* ── Cuadrícula de Tarjetas de Usuarios ─────────────────── */}
      <div className={gridClass}>
        {filtered.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-[5px] border border-[#E5E7EB] p-5 shadow-2xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Fila Superior: Foto + Nombre + Rol + Menú 3 puntos */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Fotografía o Icono Neutral */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-[52px] h-[52px] rounded-full object-cover shrink-0 border border-[#F3F4F6]"
                    />
                  ) : (
                    <div className="w-[52px] h-[52px] rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <UserRound className="w-6 h-6" />
                    </div>
                  )}

                  {/* Nombre y Rol */}
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] leading-snug">
                      {user.name}
                    </h3>
                    <p className="text-xs text-[#64748B] font-normal leading-tight mt-0.5">
                      {user.role}
                    </p>
                  </div>
                </div>

                {/* Menú de Tres Puntos */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-8 w-8 -mr-1 -mt-1 flex items-center justify-center rounded-[5px] text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors focus:outline-none"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-[185px] rounded-[5px] p-1 shadow-md border border-[#E5E7EB] bg-white z-50"
                  >
                    <DropdownMenuItem
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#374151] rounded-[4px] hover:bg-[#F3F4F6] cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-[#6B7280]" />
                      <span>Ver detalles</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setEditingUser(user)}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#374151] rounded-[4px] hover:bg-[#F3F4F6] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#6B7280]" />
                      <span>Editar usuario</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setUserToToggle(user)}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#374151] rounded-[4px] hover:bg-[#F3F4F6] cursor-pointer"
                    >
                      {user.status === "Activo" ? (
                        <>
                          <UserX className="h-3.5 w-3.5 text-[#64748B]" />
                          <span>Desactivar usuario</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5 text-[#64748B]" />
                          <span>Activar usuario</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Información Detallada */}
              <div className="mt-4 pt-4 border-t border-[#F3F4F6] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Email:</span>
                  <span className="font-medium text-[#111827] truncate max-w-[170px]">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Teléfono:</span>
                  <span className="font-medium text-[#111827]">
                    {user.phone}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Tienda:</span>
                  <span className="font-medium text-[#111827]">
                    {user.store || "Sin tienda"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Registrado:</span>
                  <span className="font-medium text-[#111827]">
                    {user.joined}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Estado:</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#374151]">
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        user.status === "Activo"
                          ? "bg-[#10B981]"
                          : "bg-[#9CA3AF]"
                      }`}
                    />
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Fila Inferior: Botones de Acción */}
            <div className="mt-5 pt-3.5 border-t border-[#F3F4F6] grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedUser(user)}
                className="h-8 rounded-[5px] border border-[#E2E8F0] bg-white text-xs font-semibold text-[#374151] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              >
                Ver Usuario
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(user)}
                className="h-8 rounded-[5px] bg-[#2563EB] text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors flex items-center justify-center shadow-2xs cursor-pointer"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-[5px] border border-[#E5E7EB] p-12 text-center text-[#64748B]">
          No se encontraron usuarios con los filtros seleccionados.
        </div>
      )}

      {/* ── Paginación ─────────────────────────────────────────── */}
      <div className="bg-white rounded-[5px] border border-[#E5E7EB] p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <p className="shrink-0 text-xs text-[#475569]">
          Mostrando <span className="font-semibold text-[#111827]">1</span> a{" "}
          <span className="font-semibold text-[#111827]">
            {filtered.length > 0 ? Math.min(12, filtered.length) : 0}
          </span>{" "}
          de <span className="font-semibold text-[#111827]">248</span> usuarios
        </p>

        {/* Botones de Navegación Numérica */}
        <div className="flex max-w-full shrink-0 items-center gap-2 overflow-x-auto">
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors text-xs cursor-pointer"
            aria-label="Primera página"
          >
            «
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors text-xs cursor-pointer"
            aria-label="Página anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shadow-2xs"
          >
            1
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors text-xs cursor-pointer"
          >
            2
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors text-xs cursor-pointer"
          >
            3
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors text-xs cursor-pointer"
          >
            4
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors text-xs cursor-pointer"
          >
            5
          </button>
          <span className="h-[34px] w-7 min-w-7 shrink-0 flex items-center justify-center text-xs text-[#94A3B8]">
            ...
          </span>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors text-xs cursor-pointer"
          >
            21
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors text-xs cursor-pointer"
            aria-label="Página siguiente"
          >
            ›
          </button>
          <button
            type="button"
            className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors text-xs cursor-pointer"
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
            className="h-[34px] min-w-[132px] rounded-[5px] border border-[#E2E8F0] bg-white pl-3 pr-8 text-xs text-[#475569] outline-none appearance-none cursor-pointer hover:border-[#CBD5E1] focus:border-[#2563EB] shadow-2xs"
          >
            <option value="12">12 por página</option>
            <option value="24">24 por página</option>
            <option value="48">48 por página</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280]" />
        </div>
      </div>

      {/* ── Modal: Ver Usuario ─────────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[5px] max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#E5E7EB] relative">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827]">
                Detalle del Usuario
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="h-7 w-7 rounded-[4px] hover:bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5">
              <div className="flex items-center gap-3.5">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-14 h-14 rounded-full object-cover border border-[#E5E7EB]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#9CA3AF]">
                    <UserRound className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <h4 className="text-base font-bold text-[#111827]">
                    {selectedUser.name}
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    {selectedUser.role}
                  </p>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-3.5 rounded-[5px] border border-[#E2E8F0] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Tienda:</span>
                  <span className="font-medium text-[#111827]">
                    {selectedUser.store || "Sin tienda asignada"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Correo:</span>
                  <span className="font-medium text-[#111827]">
                    {selectedUser.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Teléfono:</span>
                  <span className="font-medium text-[#111827]">
                    {selectedUser.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Fecha Registro:</span>
                  <span className="font-medium text-[#111827]">
                    {selectedUser.joined}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Estado:</span>
                  <span className="font-medium text-[#111827]">
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 text-xs font-medium text-[#374151] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[5px] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Editar Usuario ─────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[5px] max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#E5E7EB] relative">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#111827]">
                  Editar Usuario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="h-7 w-7 rounded-[4px] hover:bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setUsers((prev) =>
                  prev.map((u) => (u.id === editingUser.id ? editingUser : u)),
                );
                setEditingUser(null);
                setModalNotice("Usuario actualizado con éxito");
                setTimeout(() => setModalNotice(null), 2000);
              }}
              className="py-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-[#475569] font-semibold mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full h-8 px-2.5 border border-[#E2E8F0] rounded-[5px] text-xs outline-none focus:border-[#2563EB] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">
                  Rol
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full h-8 px-2 border border-[#E2E8F0] rounded-[5px] text-xs outline-none focus:border-[#2563EB] shadow-2xs"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Tienda">Tienda</option>
                  <option value="Usuario">Usuario</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Cliente">Cliente</option>
                </select>
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">
                  Tienda Asociada
                </label>
                <input
                  type="text"
                  value={editingUser.store || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, store: e.target.value })
                  }
                  className="w-full h-8 px-2.5 border border-[#E2E8F0] rounded-[5px] text-xs outline-none focus:border-[#2563EB] shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full h-8 px-2.5 border border-[#E2E8F0] rounded-[5px] text-xs outline-none focus:border-[#2563EB] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={editingUser.phone}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, phone: e.target.value })
                  }
                  className="w-full h-8 px-2.5 border border-[#E2E8F0] rounded-[5px] text-xs outline-none focus:border-[#2563EB] shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-1.5 text-xs font-medium text-[#374151] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[5px] hover:bg-[#F1F5F9] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2563EB] rounded-[5px] hover:bg-[#1D4ED8] transition-colors shadow-2xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Nuevo Usuario ───────────────────────────────── */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[5px] max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#E5E7EB] relative">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#111827]">
                  Crear Nuevo Usuario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewUserModalOpen(false)}
                className="h-7 w-7 rounded-[4px] hover:bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const newUser: AdminUser = {
                  id: String(Date.now()),
                  name: (form.elements.namedItem("name") as HTMLInputElement)
                    .value,
                  role: (form.elements.namedItem("role") as HTMLSelectElement)
                    .value as UserRole,
                  store:
                    (form.elements.namedItem("store") as HTMLInputElement)
                      .value || "Creator Custom",
                  email: (form.elements.namedItem("email") as HTMLInputElement)
                    .value,
                  phone:
                    (form.elements.namedItem("phone") as HTMLInputElement)
                      .value || "(123) 456-7890",
                  joined: "Hoy",
                  status: "Activo",
                  avatar: undefined,
                };
                setUsers([newUser, ...users]);
                setIsNewUserModalOpen(false);
                setModalNotice("Nuevo usuario creado exitosamente");
                setTimeout(() => setModalNotice(null), 2000);
              }}
              className="py-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-[#475569] font-semibold mb-1">
                  Nombre Completo
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Ej. Carlos Vega"
                  className="w-full h-8 px-2.5 border border-[#E2E8F0] rounded-[5px] text-xs outline-none focus:border-[#2563EB] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">
                  Rol
                </label>
                <select
                  name="role"
                  defaultValue="Cliente"
                  className="w-full h-8 px-2 border border-[#E2E8F0] rounded-[5px] text-xs outline-none focus:border-[#2563EB] shadow-2xs"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Tienda">Tienda</option>
                  <option value="Usuario">Usuario</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Cliente">Cliente</option>
                </select>
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">
                  Tienda Asociada
                </label>
                <input
                  name="store"
                  type="text"
                  placeholder="Creator Custom"
                  className="w-full h-8 px-2.5 border border-[#E2E8F0] rounded-[5px] text-xs outline-none focus:border-[#2563EB] shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">
                  Correo Electrónico
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="carlos.vega@email.com"
                  className="w-full h-8 px-2.5 border border-[#E2E8F0] rounded-[5px] text-xs outline-none focus:border-[#2563EB] shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">
                  Teléfono
                </label>
                <input
                  name="phone"
                  type="text"
                  placeholder="(123) 456-7890"
                  className="w-full h-8 px-2.5 border border-[#E2E8F0] rounded-[5px] text-xs outline-none focus:border-[#2563EB] shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-medium text-[#374151] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[5px] hover:bg-[#F1F5F9] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2563EB] rounded-[5px] hover:bg-[#1D4ED8] transition-colors shadow-2xs"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notificación Flotante */}
      {modalNotice && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#111827] text-white text-xs px-3.5 py-2 rounded-[5px] shadow-lg flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{modalNotice}</span>
        </div>
      )}

      {/* ── Modal: Confirmación Desactivar / Activar Usuario ──── */}
      {userToToggle && (
        <ConfirmationModal
          isOpen={Boolean(userToToggle)}
          onClose={() => setUserToToggle(null)}
          onConfirm={() => {
            toggleUserStatus(userToToggle.id);
            setUserToToggle(null);
          }}
          title={
            userToToggle.status === "Activo"
              ? "Desactivar cuenta"
              : "Activar cuenta"
          }
          description={
            userToToggle.status === "Activo"
              ? `¿Estás seguro de que deseas desactivar esta cuenta? El acceso del usuario quedará suspendido hasta que vuelva a activarse.`
              : `¿Estás seguro de que deseas activar esta cuenta? El usuario podrá volver a acceder a la plataforma.`
          }
          confirmText={
            userToToggle.status === "Activo" ? "Desactivar" : "Activar"
          }
          variant={userToToggle.status === "Activo" ? "danger" : "primary"}
        />
      )}
    </div>
  );
}
