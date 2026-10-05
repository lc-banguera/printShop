import * as React from "react";
import {
  Users,
  Search,
  Download,
  Filter,
  Eye,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserPlus,
  X,
  MapPin,
  Check,
} from "lucide-react";
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
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto w-full">
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Tienda</span>
            <span>/</span>
            <span className="text-[#2563EB] font-medium">Clientes</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Base de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Consulta el historial, recurrencia y valor de compras de los
            clientes de tu tienda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#334155] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] px-3.5 py-2 rounded-[6px] shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Exportar Clientes</span>
          </button>
        </div>
      </div>

      {/* ── Tarjetas Resumen (KPIs) ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-l font-medium text-[#64748B]">
            Clientes Frecuentes
          </span>
          <p className="text-2xl font-black text-[#000001] mt-1">
            {stats.frecuentes}
          </p>
          <span className="text-[12px] text-[#000000] font-medium mt-1 inline-block">
            Clientes con más de 5 compras
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-l font-medium text-[#64748B]">
            Clientes Nuevos
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {stats.nuevos}
          </p>
          <span className="text-[12px] text-[##111827] font-medium mt-1 inline-block">
            Clientes nuevos este mes
          </span>
        </div>
      </div>

      {/* ── Barra de Búsqueda y Filtros ────────────────────────────── */}
      <div className="bg-white p-3 rounded-[8px] border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo electrónico o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["Todos", "Frecuente", "Activo", "Nuevo", "Inactivo"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3 py-1 text-xs rounded-full font-medium transition-colors shrink-0",
                statusFilter === st
                  ? "bg-[#2563EB] text-white"
                  : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]",
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla de Clientes ──────────────────────────────────────── */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#64748B] text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Ciudad</th>
                <th className="py-3 px-4">Pedidos</th>
                <th className="py-3 px-4">Total Comprado</th>
                <th className="py-3 px-4">Última Compra</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={client.name}
                        className="w-8 h-8"
                        iconClassName="w-4 h-4"
                      />
                      <div>
                        <p className="font-bold text-[#111827]">
                          {client.name}
                        </p>
                        <p className="text-[10.5px] text-[#64748B]">
                          {client.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#475569]">{client.city}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111827]">
                    {client.ordersCount} pedidos
                  </td>
                  <td className="py-3.5 px-4 font-black text-[#111827]">
                    $ {client.totalSpent.toLocaleString("es-CO")}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    {client.lastOrderDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusDot status={client.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedClient(client)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] hover:text-[#111827] hover:bg-[#F1F5F9] px-2.5 py-1.5 rounded-[5px] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={selectedClient.name}
                  className="w-10 h-10"
                  iconClassName="w-5 h-5"
                />
                <div>
                  <h2 className="text-base font-bold text-[#111827]">
                    {selectedClient.name}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Cliente desde {selectedClient.registeredDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-1 text-[#94A3B8] hover:text-[#111827] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] text-xs">
              <div>
                <span className="text-[10.5px] text-[#64748B] block">
                  Email:
                </span>
                <span className="font-semibold text-[#111827]">
                  {selectedClient.email}
                </span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#64748B] block">
                  Teléfono:
                </span>
                <span className="font-semibold text-[#111827]">
                  {selectedClient.phone}
                </span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#64748B] block">
                  Ciudad:
                </span>
                <span className="font-semibold text-[#111827]">
                  {selectedClient.city}
                </span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#64748B] block">
                  Total Invertido:
                </span>
                <span className="font-bold text-[#2563EB]">
                  $ {selectedClient.totalSpent.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-[#111827]">
                Compras Recientes ({selectedClient.recentPurchases.length})
              </h3>
              <div className="border border-[#E2E8F0] rounded-lg divide-y divide-[#F1F5F9]">
                {selectedClient.recentPurchases.map((pur) => (
                  <div
                    key={pur.id}
                    className="p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-[#111827]">{pur.item}</p>
                      <p className="text-[10.5px] text-[#64748B]">
                        {pur.id} • {pur.date}
                      </p>
                    </div>
                    <span className="font-bold text-[#111827]">
                      $ {pur.total.toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-[6px] hover:bg-[#1D4ED8]"
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
