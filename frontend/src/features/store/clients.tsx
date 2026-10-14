import * as React from "react";
import { Download, Eye, Search, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { StatusDot } from "./StatusDot";
import UserAvatar from "./UserAvatar";

/* ── Interfaces ─────────────────────────────────────────────────────────── */
export interface StoreClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  registeredDate: string;
  status: "Activo" | "Frecuente" | "Nuevo" | "Inactivo";
  avatarBg: string;
  recentPurchases: { id: string; item: string; total: number; date: string }[];
}

/* ── Mock Data ───────────────────────────────────────────────────────────── */
const mockClients: StoreClient[] = [
  {
    id: "cli-1",
    name: "María González",
    email: "maria.gonzalez@gmail.com",
    phone: "+57 312 456 7890",
    city: "Bogotá, Colombia",
    ordersCount: 8,
    totalSpent: 420000,
    lastOrderDate: "Hoy, 10:42 AM",
    registeredDate: "15 Ene, 2026",
    status: "Frecuente",
    avatarBg: "bg-[#EFF6FF] text-[#2563EB]",
    recentPurchases: [
      {
        id: "#ORD-9876",
        item: "Camiseta Oversize Premium",
        total: 89900,
        date: "Hoy",
      },
      {
        id: "#ORD-9412",
        item: "Hoodie Clásico Streetwear",
        total: 119000,
        date: "24 Abr",
      },
      {
        id: "#ORD-9102",
        item: "Taza Cerámica Custom",
        total: 32000,
        date: "10 Mar",
      },
    ],
  },
  {
    id: "cli-2",
    name: "Carlos Ramírez",
    email: "carlos.ramirez@empresa.com",
    phone: "+57 300 987 6543",
    city: "Medellín, Colombia",
    ordersCount: 4,
    totalSpent: 310000,
    lastOrderDate: "Hoy, 08:15 AM",
    registeredDate: "02 Feb, 2026",
    status: "Activo",
    avatarBg: "bg-[#FDF2F8] text-[#EC4899]",
    recentPurchases: [
      {
        id: "#ORD-9875",
        item: "Hoodie Clásico Custom",
        total: 129000,
        date: "Hoy",
      },
      {
        id: "#ORD-9304",
        item: "Camiseta Regular Fit",
        total: 45000,
        date: "18 Abr",
      },
    ],
  },
  {
    id: "cli-3",
    name: "Laura Martínez",
    email: "laura.m@outlook.com",
    phone: "+57 315 222 1133",
    city: "Manizales, Colombia",
    ordersCount: 1,
    totalSpent: 45500,
    lastOrderDate: "Ayer, 06:40 PM",
    registeredDate: "Ayer",
    status: "Nuevo",
    avatarBg: "bg-[#ECFDF5] text-[#10B981]",
    recentPurchases: [
      {
        id: "#ORD-9874",
        item: "Taza Cerámica 11oz",
        total: 45500,
        date: "Ayer",
      },
    ],
  },
  {
    id: "cli-4",
    name: "Andrés López",
    email: "alopez_design@gmail.com",
    phone: "+57 318 666 4411",
    city: "Barranquilla, Colombia",
    ordersCount: 6,
    totalSpent: 380000,
    lastOrderDate: "04 de Mayo",
    registeredDate: "10 Dic, 2025",
    status: "Frecuente",
    avatarBg: "bg-[#FFF7ED] text-[#F97316]",
    recentPurchases: [
      {
        id: "#ORD-9873",
        item: "Camiseta Oversize x2",
        total: 165000,
        date: "04 May",
      },
      {
        id: "#ORD-8921",
        item: "Gorra Urbana Bordada",
        total: 42000,
        date: "01 Mar",
      },
    ],
  },
  {
    id: "cli-5",
    name: "Sofía Herrera",
    email: "sofiah_99@yahoo.com",
    phone: "+57 320 111 8899",
    city: "Bucaramanga, Colombia",
    ordersCount: 2,
    totalSpent: 110000,
    lastOrderDate: "03 de Mayo",
    registeredDate: "20 Mar, 2026",
    status: "Activo",
    avatarBg: "bg-[#F5F3FF] text-[#8B5CF6]",
    recentPurchases: [
      {
        id: "#ORD-9872",
        item: "Camiseta Estampada Clásica",
        total: 68000,
        date: "03 May",
      },
    ],
  },
  {
    id: "cli-6",
    name: "Felipe Morales",
    email: "felipe.m@agencia.co",
    phone: "+57 311 555 7788",
    city: "Cali, Colombia",
    ordersCount: 3,
    totalSpent: 185000,
    lastOrderDate: "15 de Abril",
    registeredDate: "05 Nov, 2025",
    status: "Inactivo",
    avatarBg: "bg-[#F1F5F9] text-[#64748B]",
    recentPurchases: [
      {
        id: "#ORD-8712",
        item: "Bolsa Ecológica Lona x3",
        total: 84000,
        date: "15 Abr",
      },
    ],
  },
];

export default function StoreClients() {
  const [clients, setClients] = React.useState<StoreClient[]>(mockClients);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("Todos");
  const [selectedClient, setSelectedClient] =
    React.useState<StoreClient | null>(null);

  // KPIs
  const stats = React.useMemo(() => {
    return {
      total: clients.length,
      nuevos: clients.filter((c) => c.status === "Nuevo").length,
      frecuentes: clients.filter((c) => c.status === "Frecuente").length,
      activos: clients.filter((c) => c.status === "Activo").length,
    };
  }, [clients]);

  // Filtrado
  const filteredClients = React.useMemo(() => {
    return clients.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "Todos" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-4 sm:p-6">
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            Gestión de Clientes
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-foregroundMuted">
            Consulta el historial, recurrencia y valor de compras de los
            clientes de tu tienda.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-foregroundMuted shadow-subtle transition-colors duration-normal hover:border-borderStrong hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:active:scale-100"
          >
            <Download className="h-4 w-4 text-foregroundSubtle" aria-hidden="true" />
            <span>Exportar Clientes</span>
          </button>
        </div>
      </div>

      {/* ── Tarjetas Resumen (KPIs) ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-5 shadow-card transition-colors duration-normal hover:border-borderStrong">
          <span className="text-sm font-semibold text-foregroundMuted">
            Clientes Frecuentes
          </span>
          <p className="mt-2 text-3xl font-bold leading-tight tracking-tight text-foreground">
            {stats.frecuentes}
          </p>
          <span className="mt-1.5 inline-block text-xs leading-5 text-foregroundSubtle">
            Clientes con más de 5 compras
          </span>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 shadow-card transition-colors duration-normal hover:border-borderStrong">
          <span className="text-sm font-semibold text-foregroundMuted">
            Clientes Nuevos
          </span>
          <p className="mt-2 text-3xl font-bold leading-tight tracking-tight text-foreground">
            {stats.nuevos}
          </p>
          <span className="mt-1.5 inline-block text-xs leading-5 text-foregroundSubtle">
            Clientes nuevos este mes
          </span>
        </div>
      </div>

      {/* ── Barra de Búsqueda y Filtros ────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full min-w-0 sm:max-w-md sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foregroundSubtle" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo electrónico o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar por nombre, correo electrónico o ciudad"
            className="h-10 w-full rounded-control border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-normal placeholder:text-foregroundSubtle hover:border-borderStrong focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="-mx-1 flex w-full items-center gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:w-auto sm:flex-wrap sm:justify-end sm:overflow-visible sm:px-0 sm:pb-0">
          {["Todos", "Frecuente", "Activo", "Nuevo", "Inactivo"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              aria-pressed={statusFilter === st}
              className={cn(
                "min-h-9 shrink-0 rounded-badge border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:active:scale-100",
                statusFilter === st
                  ? "border-primary bg-primary text-primaryForeground"
                  : "border-border bg-surface text-foregroundMuted hover:border-borderStrong hover:bg-surfaceMuted",
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla de Clientes ──────────────────────────────────────── */}
      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-surfaceMuted text-[11px] font-semibold uppercase tracking-[0.08em] text-foregroundSubtle">
              <tr>
                <th scope="col" className="whitespace-nowrap px-5 py-3.5">Cliente</th>
                <th scope="col" className="whitespace-nowrap px-5 py-3.5">Ciudad</th>
                <th scope="col" className="whitespace-nowrap px-5 py-3.5">Pedidos</th>
                <th scope="col" className="whitespace-nowrap px-5 py-3.5">Total Comprado</th>
                <th scope="col" className="whitespace-nowrap px-5 py-3.5">Última Compra</th>
                <th scope="col" className="whitespace-nowrap px-5 py-3.5">Estado</th>
                <th scope="col" className="whitespace-nowrap px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted text-foregroundMuted">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="transition-colors duration-fast hover:bg-surfaceMuted"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={client.name}
                        className="h-9 w-9 shrink-0"
                        iconClassName="h-4 w-4"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {client.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-foregroundSubtle">
                          {client.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-foregroundMuted">{client.city}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                    {client.ordersCount} pedidos
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums text-foreground">
                    $ {client.totalSpent.toLocaleString("es-CO")}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-foregroundMuted">
                    {client.lastOrderDate}
                  </td>
                  <td className="px-5 py-4">
                    <StatusDot status={client.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedClient(client)}
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-control border border-transparent px-3 text-xs font-semibold text-foregroundMuted transition-colors duration-normal hover:border-border hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      <span>Ver historial</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: DETALLE Y HISTORIAL DEL CLIENTE ─────────────────── */}
      {selectedClient && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-history-title"
            className="max-h-[calc(100vh-1.5rem)] w-full max-w-xl space-y-5 overflow-y-auto rounded-dialog border border-border bg-surface p-5 shadow-modal sm:max-h-[calc(100vh-3rem)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4 border-b border-borderMuted pb-4">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={selectedClient.name}
                  className="h-11 w-11 shrink-0"
                  iconClassName="h-5 w-5"
                />
                <div className="min-w-0">
                  <h2 id="client-history-title" className="truncate text-lg font-semibold tracking-tight text-foreground">
                    {selectedClient.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-foregroundSubtle">
                    Cliente desde {selectedClient.registeredDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                aria-label="Cerrar historial del cliente"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-foregroundSubtle transition-colors hover:bg-surfaceMuted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 rounded-card border border-border bg-surfaceMuted p-4 text-sm sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-xs font-medium text-foregroundSubtle">
                  Email:
                </span>
                <span className="break-words font-medium text-foreground">
                  {selectedClient.email}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs font-medium text-foregroundSubtle">
                  Teléfono:
                </span>
                <span className="font-medium text-foreground">
                  {selectedClient.phone}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs font-medium text-foregroundSubtle">
                  Ciudad:
                </span>
                <span className="font-medium text-foreground">
                  {selectedClient.city}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs font-medium text-foregroundSubtle">
                  Total Invertido:
                </span>
                <span className="font-semibold tabular-nums text-primary">
                  $ {selectedClient.totalSpent.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Compras Recientes ({selectedClient.recentPurchases.length})
              </h3>
              <div className="divide-y divide-borderMuted overflow-hidden rounded-card border border-border">
                {selectedClient.recentPurchases.map((pur) => (
                  <div
                    key={pur.id}
                    className="flex flex-col gap-2 p-4 transition-colors even:bg-surfaceMuted sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{pur.item}</p>
                      <p className="mt-1 text-xs text-foregroundSubtle">
                        {pur.id} • {pur.date}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums text-foreground">
                      $ {pur.total.toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-borderMuted pt-4">
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="inline-flex min-h-10 items-center justify-center rounded-control border border-transparent bg-primary px-5 py-2 text-sm font-semibold text-primaryForeground shadow-subtle transition-colors duration-normal hover:bg-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:active:scale-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
