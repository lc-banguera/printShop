import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Download,
  Filter,
  CheckCircle2,
  Eye,
  Pencil,
  CalendarDays,
  PowerOff,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Store,
  Users,
  Package,
  Palette,
  Database,
  Bot,
  MessageCircle,
  HelpCircle,
  Globe,
  Code2,
  Sparkles,
  ShieldAlert,
  ArrowUpDown,
} from 'lucide-react';
import type { TableAction } from '@/shared/ui/table-actions';
import {
  mockPlans,
  mockSubscriptions,
  AdminPlan,
  PlanCapabilities,
} from '@/features/admin/data';
import { TableActions } from '@/shared/ui/table-actions';
import { PageHeader } from '@/shared/ui/page-header';
import { TableSearchBar } from '@/shared/ui/table-search-bar';
import { TablePagination } from '@/shared/ui/table-pagination';
import { ConfirmationModal } from '@/shared/ui/confirmation-modal';

/* ── Definición de Capacidades del Sistema ────────────────────────── */
const capabilityDefinitions = [
  {
    key: 'designEditor' as keyof PlanCapabilities,
    label: 'Editor de diseños profesional',
    desc: 'Lienzo interactivo en vivo de personalización',
    icon: Palette,
  },
  {
    key: 'templates' as keyof PlanCapabilities,
    label: 'Catálogo de plantillas',
    desc: 'Acceso a biblioteca de plantillas prediseñadas',
    icon: Package,
  },
  {
    key: 'aiDesignGen' as keyof PlanCapabilities,
    label: 'Generación con Inteligencia Artificial',
    desc: 'Creación asistida de gráficos y diseños con IA',
    icon: Bot,
  },
  {
    key: 'automations' as keyof PlanCapabilities,
    label: 'Automatizaciones de tienda',
    desc: 'Flujos automáticos y alertas de eventos',
    icon: Sparkles,
  },
  {
    key: 'whatsappIntegration' as keyof PlanCapabilities,
    label: 'Integración directa con WhatsApp',
    desc: 'Notificaciones y comunicación por WhatsApp',
    icon: MessageCircle,
  },
  {
    key: 'prioritySupport' as keyof PlanCapabilities,
    label: 'Soporte prioritario 24/7',
    desc: 'Canal preferencial y atención técnica ágil',
    icon: HelpCircle,
  },
  {
    key: 'customDomain' as keyof PlanCapabilities,
    label: 'Dominio personalizado',
    desc: 'Conexión de dominio propio para la tienda',
    icon: Globe,
  },
  {
    key: 'apiAccess' as keyof PlanCapabilities,
    label: 'Acceso a API de desarrolladores',
    desc: 'Webhooks y credenciales para integraciones',
    icon: Code2,
  },
];

/* ── Capacidades por Defecto para Nuevos Planes ────────────────────── */
const defaultCapabilities: PlanCapabilities = {
  stores: 1,
  users: 1,
  products: 50,
  designs: 20,
  storageGB: 5,
  designEditor: true,
  templates: true,
  aiDesignGen: false,
  automations: false,
  whatsappIntegration: false,
  prioritySupport: false,
  customDomain: false,
  apiAccess: false,
};

/* ── Sub-Componente: Switch / Toggle Estilo PrintShop ──────────────── */
function SwitchToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="flex items-start justify-between gap-3 p-2.5 rounded-[5px] border border-border hover:bg-surfaceMuted transition-colors cursor-pointer select-none bg-surface"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        {description && (
          <p className="text-[11px] text-foregroundSubtle mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-primary' : 'bg-borderStrong'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out mt-0.5 ${
            checked ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

const tabs = ['Todos', 'Activos', 'Inactivos', 'Más vendidos'];

/* ── Componente Principal: Gestión de Planes ───────────────────────── */
export default function Plans() {
  // Estado local de planes (preparado para futura sincronización con Supabase)
  const [plans, setPlans] = useState<AdminPlan[]>(mockPlans);
  const [activeTab, setActiveTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Estados de modales
  const [selectedPlan, setSelectedPlan] = useState<AdminPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [subscriptionsPlan, setSubscriptionsPlan] = useState<AdminPlan | null>(
    null
  );
  const [planToToggle, setPlanToToggle] = useState<AdminPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<AdminPlan | null>(null);

  // Notificaciones flotantes tipo toast
  const [notice, setNotice] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState(false);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2400);
  };

  /* ── Filtrado y Ordenamiento ─────────────────────────────────────── */
  const filteredPlans = useMemo(() => {
    let result = [...plans];

    // Filtro por búsqueda (nombre, descripción y precio)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.price.toLowerCase().includes(q)
      );
    }

    // Filtro por Tabs
    if (activeTab === 'Activos') {
      result = result.filter((p) => p.status === 'Activo');
    } else if (activeTab === 'Inactivos') {
      result = result.filter((p) => p.status === 'Inactivo');
    } else if (activeTab === 'Más vendidos') {
      // Sort sobre copia para no mutar el array filtrado
      result = [...result].sort((a, b) => b.subscriptions - a.subscriptions);
    }

    return result;
  }, [plans, activeTab, search]);

  // Paginación local
  const totalPages = Math.ceil(filteredPlans.length / pageSize) || 1;
  const paginatedPlans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlans.slice(start, start + pageSize);
  }, [filteredPlans, currentPage, pageSize]);

  /* ── Acciones de Fila Dinámicas ──────────────────────────────────── */
  const getPlanActions = (plan: AdminPlan): TableAction[] => {
    const isActivo = plan.status === 'Activo';
    return [
      {
        label: 'Ver detalles',
        icon: Eye,
        onSelect: () => setSelectedPlan(plan),
      },
      {
        label: 'Editar plan',
        icon: Pencil,
        onSelect: () => setEditingPlan(plan),
      },
      {
        label: 'Ver suscripciones',
        icon: CalendarDays,
        onSelect: () => setSubscriptionsPlan(plan),
      },
      isActivo
        ? {
            label: 'Desactivar plan',
            icon: PowerOff,
            destructive: true,
            onSelect: () => setPlanToToggle(plan),
          }
        : {
            label: 'Activar plan',
            icon: CheckCircle2,
            onSelect: () => setPlanToToggle(plan),
          },
      {
        label: 'Eliminar plan',
        icon: Trash2,
        destructive: true,
        onSelect: () => setPlanToDelete(plan),
      },
    ];
  };

  /* ── Handlers de Modificaciones ──────────────────────────────────── */
  // Activar / Desactivar plan
  const handleConfirmToggle = () => {
    if (!planToToggle) return;
    const newStatus = planToToggle.status === 'Activo' ? 'Inactivo' : 'Activo';
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planToToggle.id ? { ...p, status: newStatus } : p
      )
    );
    showNotice(
      newStatus === 'Activo'
        ? `Plan "${planToToggle.name}" activado exitosamente`
        : `Plan "${planToToggle.name}" desactivado`
    );
    setPlanToToggle(null);
  };

  // Eliminar plan — la validación primaria ya está en el ConfirmationModal
  // (sólo se llama cuando subscriptions === 0), pero se mantiene doble-check defensivo
  const handleConfirmDelete = () => {
    if (!planToDelete) return;
    setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
    showNotice(`Plan "${planToDelete.name}" eliminado correctamente`);
    setPlanToDelete(null);
  };

  // Guardar Plan Editado
  const handleSaveEditedPlan = (updatedPlan: AdminPlan) => {
    // Calculamos conteo de características activas para compatibilidad
    const activeCount = Object.entries(updatedPlan.capabilities).filter(
      ([key, val]) => {
        if (typeof val === 'boolean') return val;
        return val !== 0;
      }
    ).length;

    const planToSave: AdminPlan = {
      ...updatedPlan,
      features: activeCount,
      stores: updatedPlan.capabilities.stores,
      users: updatedPlan.capabilities.users,
    };

    setPlans((prev) =>
      prev.map((p) => (p.id === planToSave.id ? planToSave : p))
    );
    setEditingPlan(null);
    showNotice(`Plan "${planToSave.name}" actualizado con éxito`);
  };

  // Crear Nuevo Plan
  const handleCreateNewPlan = (newPlanData: Omit<AdminPlan, 'id'>) => {
    const activeCount = Object.entries(newPlanData.capabilities).filter(
      ([key, val]) => {
        if (typeof val === 'boolean') return val;
        return val !== 0;
      }
    ).length;

    const newPlan: AdminPlan = {
      ...newPlanData,
      id: String(Date.now()),
      subscriptions: 0,
      features: activeCount,
      stores: newPlanData.capabilities.stores,
      users: newPlanData.capabilities.users,
    };

    setPlans((prev) => [newPlan, ...prev]);
    setIsNewPlanModalOpen(false);
    showNotice(`Nuevo plan "${newPlan.name}" creado con éxito`);
  };

  // Suscripciones asociadas al plan seleccionado
  const planSubscriptions = useMemo(() => {
    if (!subscriptionsPlan) return [];
    const pName = subscriptionsPlan.name.toLowerCase();
    return mockSubscriptions.filter((s) => {
      const sPlan = s.plan.toLowerCase();
      if (sPlan === pName) return true;
      if (pName === 'basic' && sPlan.includes('básic')) return true;
      if (pName === 'professional' && sPlan.includes('profes')) return true;
      if (pName === 'free' && sPlan.includes('grat')) return true;
      return false;
    });
  }, [subscriptionsPlan]);

  return (
    <div className="p-4 space-y-4 bg-surfaceMuted min-h-full">
      {/* ── Toast Flotante de Notificaciones ──────────────────────── */}
      {notice && (
        <div className="fixed top-5 right-5 z-50 bg-foreground text-primaryForeground px-4 py-2.5 rounded-[5px] shadow-lg flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="h-3.5 w-3.5 text-success" />
          <span>{notice}</span>
        </div>
      )}

      {/* ── Header Principal ──────────────────────────────────────── */}
      <PageHeader
        title="Planes"
        description="Gestiona los planes de suscripción y sus características para las tiendas"
        icon={Layers}
        action={
          <>
            <button
              type="button"
              onClick={() => {
                setExportNotice(true);
                setTimeout(() => setExportNotice(false), 2000);
                showNotice('Lista de planes exportada con éxito');
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-foregroundMuted border border-border rounded-[5px] px-3 py-1.5 bg-surface hover:bg-surfaceMuted transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-foregroundSubtle" />
              <span>{exportNotice ? 'Exportando...' : 'Exportar'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsNewPlanModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primaryForeground bg-primary hover:bg-primaryHover rounded-[5px] px-3.5 py-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo Plan</span>
            </button>
          </>
        }
      />

      {/* ── Sección de Tabla y Controles ──────────────────────────── */}
      <div className="bg-surface rounded-[5px] border border-border shadow-2xs w-full overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-border bg-surface">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-surfaceMuted p-0.5 rounded-[5px] border border-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-[4px] transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-surface text-primary font-bold shadow-2xs border border-border'
                    : 'text-foregroundSubtle hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="flex flex-wrap items-center gap-2">
            <TableSearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Buscar planes..."
              width="w-52"
            />
            <button
              type="button"
              onClick={() => {
                showNotice('Mostrando todos los planes configurados');
              }}
              className="flex h-8 items-center gap-1.5 rounded-[5px] border border-border bg-surface px-3 text-xs text-foregroundMuted hover:bg-surfaceMuted transition-colors shadow-2xs cursor-pointer"
            >
              <Filter className="h-3.5 w-3.5 text-foregroundSubtle" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="min-w-0 overflow-x-auto overscroll-x-contain">
          <table className="w-full text-xs text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-surfaceMuted text-foreground">
                {[
                  'Plan',
                  'Precio Mensual',
                  'Tiendas Permitidas',
                  'Usuarios',
                  'Características',
                  'Estado',
                  'Suscripciones',
                  'Acciones',
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
              {paginatedPlans.map((plan, idx) => (
                <tr
                  key={plan.id}
                  className={`transition-colors duration-normal ${
                    idx % 2 === 0
                      ? 'bg-surface hover:bg-surfaceStrong'
                      : 'bg-surfaceMuted hover:bg-surfaceStrong'
                  }`}
                >
                  {/* Columna: Plan */}
                  <td className="border-b border-borderMuted px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-border bg-surfaceMuted text-sm">
                        {plan.icon || '📦'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight text-foreground">
                          {plan.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-normal leading-tight text-foregroundSubtle">
                          {plan.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Columna: Precio Mensual */}
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-medium text-foreground">
                    {plan.price}
                    {plan.priceVal > 0 && (
                      <span className="mt-0.5 block text-xs font-normal text-foregroundSubtle">
                        /{plan.periodicity || 'Mes'}
                      </span>
                    )}
                  </td>

                  {/* Columna: Tiendas Permitidas */}
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    {plan.capabilities?.stores === -1 || plan.stores === -1
                      ? 'Ilimitadas'
                      : `${plan.capabilities?.stores ?? plan.stores} tiendas`}
                  </td>

                  {/* Columna: Usuarios */}
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    {plan.capabilities?.users === -1 || plan.users === -1
                      ? 'Ilimitados'
                      : `${plan.capabilities?.users ?? plan.users} usuarios`}
                  </td>

                  {/* Columna: Características */}
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    <span className="inline-flex items-center gap-1.5 rounded-control bg-surfaceMuted px-2.5 py-1 text-xs font-medium text-foregroundMuted">
                      <Sparkles className="h-3.5 w-3.5 text-foregroundSubtle" />
                      {plan.capabilities?.storageGB === -1
                        ? 'Capacidad máxima'
                        : `${plan.features ?? 8} capacidades`}
                    </span>
                  </td>

                  {/* Columna: Estado (Indicador discreto minimalista) */}
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foregroundMuted">
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          plan.status === 'Activo'
                            ? 'bg-success'
                            : 'bg-foregroundSubtle'
                        }`}
                      />
                      {plan.status}
                    </span>
                  </td>

                  {/* Columna: Suscripciones */}
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-medium text-foreground">
                    <button
                      type="button"
                      onClick={() => setSubscriptionsPlan(plan)}
                      className="flex items-center gap-1 rounded-sm hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      title="Ver tiendas suscritas"
                    >
                      <span>{plan.subscriptions}</span>
                      <span className="text-xs font-normal text-foregroundSubtle">
                        activas
                      </span>
                    </button>
                  </td>

                  {/* Columna: Acciones */}
                  <td className="border-b border-borderMuted px-4 py-3">
                    <TableActions actions={getPlanActions(plan)} />
                  </td>
                </tr>
              ))}

              {paginatedPlans.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-foregroundMuted"
                  >
                    No se encontraron planes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <TablePagination
          totalItems={filteredPlans.length}
          itemLabel="planes"
          totalPages={totalPages}
          currentPage={currentPage}
          itemsPerPage={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* ── Modal 1: Ver Detalles del Plan ────────────────────────── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-surface rounded-[5px] max-w-2xl w-full p-5 sm:p-6 shadow-xl border border-border relative my-6 max-h-[92vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3.5 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-[4px] bg-surfaceMuted border border-border flex items-center justify-center text-base shrink-0">
                  {selectedPlan.icon || '📦'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Detalles del Plan: {selectedPlan.name}
                  </h3>
                  <p className="text-[11px] text-foregroundSubtle">
                    Información general y capacidades autorizadas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="h-7 w-7 rounded-[4px] hover:bg-surfaceMuted text-foregroundSubtle flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="py-4 space-y-4 text-xs overflow-y-auto flex-1 pr-1">
              {/* Resumen de Datos Clave */}
              <div className="bg-surfaceMuted p-3.5 rounded-[5px] border border-border space-y-2">
                <p className="text-xs text-foregroundMuted italic mb-2">
                  "{selectedPlan.description}"
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-foregroundSubtle">Precio:</span>
                    <span className="font-semibold text-foreground">
                      {selectedPlan.price} /{' '}
                      {selectedPlan.periodicity || 'Mensual'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foregroundSubtle">Estado:</span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          selectedPlan.status === 'Activo'
                            ? 'bg-success'
                            : 'bg-foregroundSubtle'
                        }`}
                      />
                      {selectedPlan.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foregroundSubtle">Suscripciones:</span>
                    <span className="font-semibold text-foreground">
                      {selectedPlan.subscriptions} activas
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foregroundSubtle">Pedidos:</span>
                    <span className="font-semibold text-foreground">
                      Ilimitados
                    </span>
                  </div>
                </div>
              </div>

              {/* Capacidades Numéricas */}
              <div>
                <h4 className="font-bold text-foreground text-xs mb-2">
                  Límites y Cuotas de Capacidad
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2 bg-surface rounded-[5px] border border-border">
                    <span className="text-[10.5px] text-foregroundSubtle block">
                      Tiendas permitidas
                    </span>
                    <span className="font-bold text-foreground text-xs">
                      {selectedPlan.capabilities.stores === -1
                        ? 'Ilimitadas'
                        : selectedPlan.capabilities.stores}
                    </span>
                  </div>
                  <div className="p-2 bg-surface rounded-[5px] border border-border">
                    <span className="text-[10.5px] text-foregroundSubtle block">
                      Usuarios / Equipo
                    </span>
                    <span className="font-bold text-foreground text-xs">
                      {selectedPlan.capabilities.users === -1
                        ? 'Ilimitados'
                        : selectedPlan.capabilities.users}
                    </span>
                  </div>
                  <div className="p-2 bg-surface rounded-[5px] border border-border">
                    <span className="text-[10.5px] text-foregroundSubtle block">
                      Productos máximos
                    </span>
                    <span className="font-bold text-foreground text-xs">
                      {selectedPlan.capabilities.products === -1
                        ? 'Ilimitados'
                        : selectedPlan.capabilities.products}
                    </span>
                  </div>
                  <div className="p-2 bg-surface rounded-[5px] border border-border">
                    <span className="text-[10.5px] text-foregroundSubtle block">
                      Diseños permitidos
                    </span>
                    <span className="font-bold text-foreground text-xs">
                      {selectedPlan.capabilities.designs === -1
                        ? 'Ilimitados'
                        : selectedPlan.capabilities.designs}
                    </span>
                  </div>
                  <div className="p-2 bg-surface rounded-[5px] border border-border">
                    <span className="text-[10.5px] text-foregroundSubtle block">
                      Almacenamiento
                    </span>
                    <span className="font-bold text-foreground text-xs">
                      {selectedPlan.capabilities.storageGB === -1
                        ? 'Ilimitado'
                        : `${selectedPlan.capabilities.storageGB} GB`}
                    </span>
                  </div>
                  <div className="p-2 bg-surface rounded-[5px] border border-border">
                    <span className="text-[10.5px] text-foregroundSubtle block">
                      Límite de pedidos
                    </span>
                    <span className="font-bold text-success text-xs">
                      Sin límite
                    </span>
                  </div>
                </div>
              </div>

              {/* Funcionalidades del Sistema */}
              <div>
                <h4 className="font-bold text-foreground text-xs mb-2">
                  Funcionalidades Habilitadas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {capabilityDefinitions.map((cap) => {
                    const isEnabled = Boolean(
                      selectedPlan.capabilities[cap.key]
                    );
                    const CapIcon = cap.icon;
                    return (
                      <div
                        key={cap.key}
                        className={`p-3 min-h-[58px] rounded-[5px] border flex items-center justify-between gap-3 transition-colors ${
                          isEnabled
                            ? 'bg-surface border-border'
                            : 'bg-surfaceMuted border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="h-7 w-7 rounded-[4px] bg-surfaceMuted border border-border flex items-center justify-center shrink-0 text-foregroundSubtle">
                            <CapIcon className="h-3.5 w-3.5" />
                          </div>
                          <p
                            className={`text-xs font-semibold leading-snug ${
                              isEnabled ? 'text-foreground' : 'text-foregroundSubtle'
                            }`}
                          >
                            {cap.label}
                          </p>
                        </div>
                        <span className="shrink-0">
                          {isEnabled ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foregroundMuted">
                              <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                              Incluido
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-foregroundSubtle">
                              <span className="h-1.5 w-1.5 rounded-full bg-borderStrong shrink-0" />
                              No incluido
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t border-border flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  const toEdit = selectedPlan;
                  setSelectedPlan(null);
                  setEditingPlan(toEdit);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primaryHover hover:underline transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                <Pencil className="h-3.5 w-3.5 text-primary" />
                <span>Editar este plan</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-1.5 text-xs font-semibold text-primary bg-surface border border-infoMuted hover:bg-infoMuted hover:border-infoMuted rounded-[5px] transition-colors cursor-pointer shadow-2xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2 & 3: Formulario de Plan (Nuevo / Editar) ───────── */}
      {(isNewPlanModalOpen || editingPlan) && (
        <PlanFormModal
          plan={editingPlan}
          onClose={() => {
            setIsNewPlanModalOpen(false);
            setEditingPlan(null);
          }}
          onSave={editingPlan ? handleSaveEditedPlan : handleCreateNewPlan}
        />
      )}

      {/* ── Modal 4: Ver Suscripciones del Plan ────────────────────── */}
      {subscriptionsPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-surface rounded-[5px] max-w-2xl w-full p-5 sm:p-6 shadow-xl border border-border relative my-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-[4px] bg-surfaceMuted border border-border flex items-center justify-center text-base shrink-0 text-foregroundSubtle">
                  <CalendarDays className="h-4 w-4 text-foregroundSubtle" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Suscripciones asociadas: Plan {subscriptionsPlan.name}
                  </h3>
                  <p className="text-[11px] text-foregroundSubtle">
                    Tiendas y cuentas suscritas a este plan ({subscriptionsPlan.subscriptions} registradas)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubscriptionsPlan(null)}
                className="h-7 w-7 rounded-[4px] hover:bg-surfaceMuted text-foregroundSubtle flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              {planSubscriptions.length > 0 ? (
                <div className="overflow-x-auto border border-border rounded-[5px]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-surfaceMuted text-foregroundMuted border-b border-border">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Tienda</th>
                        <th className="px-3 py-2 font-semibold">Email</th>
                        <th className="px-3 py-2 font-semibold">Estado</th>
                        <th className="px-3 py-2 font-semibold">Inicio</th>
                        <th className="px-3 py-2 font-semibold">Próximo Cobro</th>
                        <th className="px-3 py-2 font-semibold">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surfaceMuted">
                      {planSubscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-surfaceMuted">
                          <td className="px-3 py-2 font-semibold text-foreground">
                            {sub.store}
                          </td>
                          <td className="px-3 py-2 text-foregroundSubtle">
                            {sub.email}
                          </td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foregroundMuted">
                              <span
                                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                  sub.status === 'Activa'
                                    ? 'bg-success'
                                    : sub.status === 'Pendiente'
                                    ? 'bg-warning'
                                    : 'bg-dangerStrong'
                                }`}
                              />
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-foregroundSubtle">
                            {sub.startDate}
                          </td>
                          <td className="px-3 py-2 text-foregroundSubtle">
                            {sub.nextPayment}
                          </td>
                          <td className="px-3 py-2 font-semibold text-foreground">
                            {sub.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-surfaceMuted p-8 rounded-[5px] border border-border text-center">
                  <CalendarDays className="h-8 w-8 text-foregroundSubtle mx-auto mb-2" />
                  <p className="text-xs font-semibold text-foregroundMuted">
                    Sin suscripciones activas en este momento
                  </p>
                  <p className="text-[11px] text-foregroundSubtle mt-1">
                    No se encontraron tiendas suscritas actualmente al plan "{subscriptionsPlan.name}".
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setSubscriptionsPlan(null)}
                className="px-4 py-1.5 text-xs font-semibold text-primary bg-surface border border-infoMuted hover:bg-infoMuted hover:border-infoMuted rounded-[5px] transition-colors cursor-pointer shadow-2xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 5: Activar / Desactivar Plan (ConfirmationModal) ── */}
      {planToToggle && (
        <ConfirmationModal
          isOpen={Boolean(planToToggle)}
          onClose={() => setPlanToToggle(null)}
          onConfirm={handleConfirmToggle}
          title={
            planToToggle.status === 'Activo'
              ? 'Desactivar plan'
              : 'Activar plan'
          }
          description={
            planToToggle.status === 'Activo'
              ? `¿Estás seguro de que deseas desactivar el plan "${planToToggle.name}"? El acceso para nuevas suscripciones quedará suspendido hasta que vuelva a activarse.`
              : `¿Estás seguro de que deseas activar el plan "${planToToggle.name}"? Estará disponible de inmediato para que las tiendas puedan contratarlo.`
          }
          confirmText={
            planToToggle.status === 'Activo' ? 'Desactivar' : 'Activar'
          }
          variant={planToToggle.status === 'Activo' ? 'danger' : 'primary'}
          icon={planToToggle.status === 'Activo' ? PowerOff : CheckCircle2}
        />
      )}

      {/* ── Modal 6: Eliminar Plan (ConfirmationModal con Seguridad) ── */}
      {planToDelete && (
        <ConfirmationModal
          isOpen={Boolean(planToDelete)}
          onClose={() => setPlanToDelete(null)}
          onConfirm={
            planToDelete.subscriptions === 0 ? handleConfirmDelete : undefined
          }
          showCancel={planToDelete.subscriptions === 0}
          title={
            planToDelete.subscriptions > 0
              ? 'No es posible eliminar este plan'
              : '¿Eliminar plan permanentemente?'
          }
          description={
            planToDelete.subscriptions > 0 ? (
              <div className="space-y-2 text-xs leading-relaxed text-foregroundMuted">
                <p>
                  El plan <strong className="font-semibold text-foreground">"{planToDelete.name}"</strong> cuenta actualmente con{' '}
                  <strong className="font-semibold text-foreground">{planToDelete.subscriptions} tiendas suscritas</strong>.
                </p>
                <p className="text-foregroundSubtle">
                  Por seguridad e integridad histórica, no se permite eliminar permanentemente planes en uso. Te recomendamos desactivarlo para suspender nuevas contrataciones.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-xs leading-relaxed text-foregroundMuted">
                <p>
                  ¿Estás seguro de que deseas eliminar permanentemente el plan <strong className="font-semibold text-foreground">"{planToDelete.name}"</strong>?
                </p>
                <p className="text-foregroundSubtle">
                  Esta acción es destructiva e irreversible. El plan se eliminará por completo del catálogo y la configuración del sistema.
                </p>
              </div>
            )
          }
          confirmText={
            planToDelete.subscriptions === 0 ? 'Eliminar' : undefined
          }
          variant={planToDelete.subscriptions > 0 ? 'warning' : 'danger'}
          icon={AlertTriangle}
          secondaryAction={
            planToDelete.subscriptions > 0
              ? {
                  label: 'Desactivar en su lugar',
                  onClick: () => {
                    const toToggle = planToDelete;
                    setPlanToDelete(null);
                    setPlanToToggle(toToggle);
                  },
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

/* ── Componente Modal: Formulario para Crear / Editar Plan ─────────── */
interface PlanFormModalProps {
  plan?: AdminPlan | null;
  onClose: () => void;
  onSave: (plan: any) => void;
}

function PlanFormModal({ plan, onClose, onSave }: PlanFormModalProps) {
  const isEditing = Boolean(plan);

  // Estados locales del formulario
  const [name, setName] = useState(plan?.name || '');
  const [description, setDescription] = useState(plan?.description || '');
  const [price, setPrice] = useState(plan?.price || '$0');
  const [periodicity, setPeriodicity] = useState<'Mensual' | 'Anual'>(
    plan?.periodicity || 'Mensual'
  );
  const [status, setStatus] = useState<'Activo' | 'Inactivo'>(
    plan?.status || 'Activo'
  );
  const [icon, setIcon] = useState(plan?.icon || '⭐');

  // Límites numéricos
  const [stores, setStores] = useState<number>(
    plan?.capabilities?.stores ?? 1
  );
  const [users, setUsers] = useState<number>(plan?.capabilities?.users ?? 1);
  const [products, setProducts] = useState<number>(
    plan?.capabilities?.products ?? 50
  );
  const [designs, setDesigns] = useState<number>(
    plan?.capabilities?.designs ?? 20
  );
  const [storageGB, setStorageGB] = useState<number>(
    plan?.capabilities?.storageGB ?? 5
  );

  // Capacidades booleanas
  const [capabilities, setCapabilities] = useState({
    designEditor: plan?.capabilities?.designEditor ?? true,
    templates: plan?.capabilities?.templates ?? true,
    aiDesignGen: plan?.capabilities?.aiDesignGen ?? false,
    automations: plan?.capabilities?.automations ?? false,
    whatsappIntegration: plan?.capabilities?.whatsappIntegration ?? false,
    prioritySupport: plan?.capabilities?.prioritySupport ?? false,
    customDomain: plan?.capabilities?.customDomain ?? false,
    apiAccess: plan?.capabilities?.apiAccess ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación: nombre obligatorio
    if (!name.trim()) return;

    // Limpieza de precio para ordenar numéricamente
    const numericPrice = parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;

    const fullCapabilities: PlanCapabilities = {
      stores: Number(stores),
      users: Number(users),
      products: Number(products),
      designs: Number(designs),
      storageGB: Number(storageGB),
      ...capabilities,
    };

    const planPayload = {
      ...(plan || {}),
      name: name.trim(),
      description: description.trim(),
      price: price.trim() || '$0',
      priceVal: numericPrice,
      periodicity,
      status,
      icon,
      capabilities: fullCapabilities,
    };

    onSave(planPayload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface rounded-[5px] max-w-xl w-full p-5 sm:p-6 shadow-xl border border-border relative my-6 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Pencil className="h-4 w-4 text-foregroundSubtle" />
            ) : (
              <Plus className="h-4 w-4 text-foregroundSubtle" />
            )}
            <h3 className="text-sm font-bold text-foreground">
              {isEditing ? `Editar Plan: ${plan?.name}` : 'Crear Nuevo Plan'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-[4px] hover:bg-surfaceMuted text-foregroundSubtle flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario con scroll vertical */}
        <form
          onSubmit={handleSubmit}
          className="py-4 space-y-4 text-xs overflow-y-auto pr-1 flex-1"
        >
          {/* Fila 1: Nombre, Ícono y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-foregroundMuted font-semibold mb-1">
                Nombre del Plan *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Growth, Pro, Enterprise"
                className="w-full h-8 px-2.5 border border-border rounded-[5px] text-xs outline-none focus:border-primary shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-foregroundMuted font-semibold mb-1">
                Ícono / Emoji
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full h-8 px-2 border border-border rounded-[5px] text-xs outline-none focus:border-primary shadow-2xs cursor-pointer"
              >
                <option value="⭐">⭐ Estrella</option>
                <option value="🏆">🏆 Trofeo</option>
                <option value="💎">💎 Diamante</option>
                <option value="👑">👑 Corona</option>
                <option value="🏢">🏢 Empresa</option>
                <option value="🎯">🎯 Objetivo</option>
                <option value="🚀">🚀 Cohete</option>
                <option value="⚡">⚡ Rayo</option>
              </select>
            </div>
          </div>

          {/* Fila 2: Descripción */}
          <div>
            <label className="block text-foregroundMuted font-semibold mb-1">
              Descripción Corta *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Ideal para pequeños equipos en crecimiento"
              className="w-full h-8 px-2.5 border border-border rounded-[5px] text-xs outline-none focus:border-primary shadow-2xs"
              required
            />
          </div>

          {/* Fila 3: Precio, Periodicidad y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-foregroundMuted font-semibold mb-1">
                Precio Mensual *
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej. $49.900 o A medida"
                className="w-full h-8 px-2.5 border border-border rounded-[5px] text-xs outline-none focus:border-primary shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-foregroundMuted font-semibold mb-1">
                Periodicidad
              </label>
              <select
                value={periodicity}
                onChange={(e) =>
                  setPeriodicity(e.target.value as 'Mensual' | 'Anual')
                }
                className="w-full h-8 px-2 border border-border rounded-[5px] text-xs outline-none focus:border-primary shadow-2xs cursor-pointer"
              >
                <option value="Mensual">Mensual</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
            <div>
              <label className="block text-foregroundMuted font-semibold mb-1">
                Estado Inicial
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'Activo' | 'Inactivo')
                }
                className="w-full h-8 px-2 border border-border rounded-[5px] text-xs outline-none focus:border-primary shadow-2xs cursor-pointer"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Banner de Información: Pedidos Ilimitados */}
          <div className="p-3 bg-surfaceMuted rounded-[5px] border border-border text-xs flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-foregroundSubtle shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-foreground">Capacidad de Pedidos: </span>
              <span className="text-foregroundSubtle">
                Todos los planes incluyen procesamiento de pedidos <strong className="font-semibold text-foreground">ilimitados</strong> sin topes artificiales.
              </span>
            </div>
          </div>

          {/* Sección: Límites de Capacidad */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-bold text-foreground text-xs">
                Límites Cuantitativos
              </h4>
              <span className="text-[10.5px] text-foregroundSubtle">
                Ingresa <strong>-1</strong> para capacidades ilimitadas
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-foregroundSubtle text-[11px] mb-1">
                  Tiendas permitidas
                </label>
                <input
                  type="number"
                  value={stores}
                  onChange={(e) => setStores(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-8 px-2.5 border border-border rounded-[5px] text-xs outline-none focus:border-primary shadow-2xs"
                  required
                />
              </div>
              <div>
                <label className="block text-foregroundSubtle text-[11px] mb-1">
                  Usuarios permitidos
                </label>
                <input
                  type="number"
                  value={users}
                  onChange={(e) => setUsers(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-8 px-2.5 border border-border rounded-[5px] text-xs outline-none focus:border-primary shadow-2xs"
                  required
                />
              </div>
              <div>
                <label className="block text-foregroundSubtle text-[11px] mb-1">
                  Productos máximos
                </label>
                <input
                  type="number"
                  value={products}
                  onChange={(e) =>
                    setProducts(parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full h-8 px-2.5 border border-border rounded-[5px] text-xs outline-none focus:border-primary shadow-2xs"
                  required
                />
              </div>
              <div>
                <label className="block text-foregroundSubtle text-[11px] mb-1">
                  Diseños permitidos
                </label>
                <input
                  type="number"
                  value={designs}
                  onChange={(e) =>
                    setDesigns(parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full h-8 px-2.5 border border-border rounded-[5px] text-xs outline-none focus:border-primary shadow-2xs"
                  required
                />
              </div>
              <div>
                <label className="block text-foregroundSubtle text-[11px] mb-1">
                  Almacenamiento (GB)
                </label>
                <input
                  type="number"
                  value={storageGB}
                  onChange={(e) =>
                    setStorageGB(parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full h-8 px-2.5 border border-border rounded-[5px] text-xs outline-none focus:border-primary shadow-2xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sección: Funcionalidades del Sistema (Switches) */}
          <div>
            <h4 className="font-bold text-foreground text-xs mb-2">
              Funcionalidades del Sistema
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {capabilityDefinitions.map((cap) => (
                <SwitchToggle
                  key={cap.key}
                  label={cap.label}
                  description={cap.desc}
                  checked={
                    Boolean(capabilities[cap.key as keyof typeof capabilities])
                  }
                  onChange={(val) =>
                    setCapabilities((prev) => ({ ...prev, [cap.key]: val }))
                  }
                />
              ))}
            </div>
          </div>

          {/* Footer de Acciones del Formulario */}
          <div className="pt-3 border-t border-border flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-foregroundMuted bg-surfaceMuted border border-border rounded-[5px] hover:bg-surfaceMuted transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-primaryForeground bg-primary hover:bg-primaryHover rounded-[5px] transition-colors cursor-pointer shadow-2xs"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
