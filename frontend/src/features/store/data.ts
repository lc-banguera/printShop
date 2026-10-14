// Mock data for the Store/Vendor module

// ── Sales chart data ────────────────────────────────────────────────────────
export const salesChartData = [
  { day: "01 May", ventas: 1200000, pedidos: 8 },
  { day: "05 May", ventas: 2800000, pedidos: 18 },
  { day: "09 May", ventas: 2100000, pedidos: 14 },
  { day: "13 May", ventas: 4200000, pedidos: 28 },
  { day: "17 May", ventas: 3600000, pedidos: 22 },
  { day: "21 May", ventas: 5800000, pedidos: 35 },
];

// ── Category distribution data ───────────────────────────────────────────────
export const categoryData = [
  { name: "Camisetas",  value: 50, amount: "$ 12.35M", color: "var(--primary)" },
  { name: "Hoodies",    value: 25, amount: "$ 6.18M",  color: "var(--danger)" },
  { name: "Tazas",      value: 12, amount: "$ 2.96M",  color: "var(--success)" },
  { name: "Accesorios", value: 8,  amount: "$ 1.97M",  color: "var(--warning)" },
  { name: "Otros",      value: 5,  amount: "$ 1.22M",  color: "var(--accent-dark)" },
];

// ── Recent orders ────────────────────────────────────────────────────────────
export type OrderStatus = "En produccion" | "Pagado" | "Enviado" | "Pendiente" | "Cancelado";

export interface StoreOrder {
  id: string;
  customer: string;
  status: OrderStatus;
  products: number;
  total: string;
}

export const recentOrders: StoreOrder[] = [
  { id: "#ORD-9876", customer: "Maria Gonzalez",  status: "En produccion", products: 2, total: "$ 89.900" },
  { id: "#ORD-9875", customer: "Carlos Ramirez",  status: "Pagado",        products: 1, total: "$ 45.500" },
  { id: "#ORD-9874", customer: "Laura Martinez",  status: "Enviado",       products: 3, total: "$ 129.900" },
  { id: "#ORD-9873", customer: "Andres Lopez",    status: "Pendiente",     products: 1, total: "$ 35.000" },
  { id: "#ORD-9872", customer: "Sofia Herrera",   status: "Cancelado",     products: 2, total: "$ 68.000" },
];

// ── Top selling products ─────────────────────────────────────────────────────
export interface TopProduct {
  rank: number;
  name: string;
  sales: number;
  revenue: string;
  image: string;
}

export const topProducts: TopProduct[] = [
  { rank: 1, name: "Camiseta Oversize Premium", sales: 234, revenue: "$ 7.254.000", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=60&h=60&fit=crop&auto=format" },
  { rank: 2, name: "Hoodie Clasico",            sales: 176, revenue: "$ 5.126.000", image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=60&h=60&fit=crop&auto=format" },
  { rank: 3, name: "Taza Personalizada",        sales: 162, revenue: "$ 3.456.000", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&fit=crop&auto=format" },
  { rank: 4, name: "Camiseta Estampada",        sales: 149, revenue: "$ 2.987.000", image: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=60&h=60&fit=crop&auto=format" },
  { rank: 5, name: "Gorra Bordada",             sales: 98,  revenue: "$ 1.856.000", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=60&h=60&fit=crop&auto=format" },
];

// ── Store health checklist ───────────────────────────────────────────────────
export interface HealthItem {
  label: string;
  done: boolean;
}

export const storeHealthItems: HealthItem[] = [
  { label: "Informacion completa",  done: true },
  { label: "Productos publicados",  done: true },
  { label: "Metodos de pago",       done: true },
  { label: "Envios configurados",   done: true },
  { label: "Dominio personalizado", done: false },
];

// ── KPI cards data ───────────────────────────────────────────────────────────
export type KpiIcon = "dollar" | "bag" | "users" | "cart" | "palette";

export interface KpiCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  iconBg: string;
  iconColor: string;
  icon: KpiIcon;
}

export const kpiCards: KpiCard[] = [
  { label: "Ventas Totales",   value: "$ 24.680.000", change: "+28.6%", positive: true, iconBg: "var(--info-muted)", iconColor: "var(--primary)", icon: "dollar" },
  { label: "Pedidos Totales",  value: "356",           change: "+18.3%", positive: true, iconBg: "var(--danger-muted)", iconColor: "var(--danger)", icon: "bag" },
  { label: "Clientes Nuevos",  value: "142",           change: "+22.5%", positive: true, iconBg: "var(--surface-muted)", iconColor: "var(--success)", icon: "users" },
  { label: "Ticket Promedio",  value: "$ 69.326",      change: "+9.7%",  positive: true, iconBg: "var(--surface-muted)", iconColor: "var(--success)", icon: "cart" },
  { label: "Disenos Creados",  value: "1.248",         change: "+31.8%", positive: true, iconBg: "var(--warning-muted)", iconColor: "var(--warning-foreground)", icon: "palette" },
];
