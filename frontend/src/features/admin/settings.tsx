import React, { useState } from "react";
import {
  Settings,
  Camera,
  Shield,
  Eye,
  EyeOff,
  Laptop,
  Smartphone,
  Monitor,
  Trash2,
  Key,
  Calendar,
  ChevronDown,
  MoreVertical,
  UserCheck,
  Save,
  Store,
  Users,
  ShoppingBag,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Wallet,
  Ban,
  MessageSquare,
  Star,
  Package,
  Palette,
  Database,
  Check,
  Info,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";
import { TableActions, TableAction } from "@/shared/ui/table-actions";

// ─── Reusable Toggle Component ────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[20px] w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        checked ? "bg-[var(--primary)]" : "bg-[var(--border)]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<
    "account" | "notifications" | "maintenance" | "backups"
  >("account");

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 1: MI CUENTA STATE
  // ───────────────────────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("Luis Carlos Banguera Carabalí");
  const [timezone, setTimezone] = useState("America/Bogota");
  const [language, setLanguage] = useState("es");
  const [birthDate, setBirthDate] = useState("16/08/1990");

  const [currentPassword, setCurrentPassword] = useState("••••••••••••");
  const [newPassword, setNewPassword] = useState("••••••••••••");
  const [confirmPassword, setConfirmPassword] = useState("••••••••••••");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [savingAccount, setSavingAccount] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveAccount = async () => {
    setSavingAccount(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingAccount(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const sessions = [
    {
      id: "1",
      device: "Windows - Chrome (Sesión actual)",
      type: "desktop",
      location: "Bogotá, Colombia",
      ip: "190.144.12.45",
      activity: "Ahora",
      isCurrent: true,
    },
    {
      id: "2",
      device: "Android - Chrome",
      type: "mobile",
      location: "Bogotá, Colombia",
      ip: "190.144.12.45",
      activity: "Hace 2 horas",
      isCurrent: false,
    },
    {
      id: "3",
      device: "macOS - Safari",
      type: "laptop",
      location: "Medellín, Colombia",
      ip: "181.68.45.22",
      activity: "Hace 1 día",
      isCurrent: false,
    },
  ];


  // ───────────────────────────────────────────────────────────────────────────
  // TAB 2: NOTIFICACIONES STATE
  // ───────────────────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([
    {
      id: "store_registered",
      title: "Nuevas tiendas registradas",
      desc: "Cuando un usuario registra una nueva tienda.",
      icon: Store,
      iconBg: "bg-[var(--warning-muted)]",
      iconColor: "text-[var(--warning-foreground)]",
      email: true,
      panel: true,
    },
    {
      id: "user_registered",
      title: "Nuevos usuarios registrados",
      desc: "Cuando un usuario se registra en la plataforma.",
      icon: Users,
      iconBg: "bg-[var(--info-muted)]",
      iconColor: "text-[var(--primary)]",
      email: true,
      panel: true,
    },
    {
      id: "new_order",
      title: "Nuevos pedidos recibidos",
      desc: "Cuando se realiza un nuevo pedido en cualquier tienda.",
      icon: ShoppingBag,
      iconBg: "bg-[var(--success-muted)]",
      iconColor: "text-[var(--success)]",
      email: true,
      panel: true,
    },
    {
      id: "order_cancelled",
      title: "Pedidos cancelados",
      desc: "Cuando un pedido es cancelado por el cliente.",
      icon: AlertCircle,
      iconBg: "bg-[var(--danger-muted)]",
      iconColor: "text-[var(--danger-strong)]",
      email: true,
      panel: true,
    },
    {
      id: "refund_requested",
      title: "Reembolsos solicitados",
      desc: "Cuando un cliente solicita un reembolso.",
      icon: RefreshCw,
      iconBg: "bg-[var(--warning-muted)]",
      iconColor: "text-[var(--warning-foreground)]",
      email: true,
      panel: true,
    },
    {
      id: "payment_received",
      title: "Pagos recibidos",
      desc: "Cuando se confirma un pago en la plataforma.",
      icon: CreditCard,
      iconBg: "bg-[var(--success-muted)]",
      iconColor: "text-[var(--success)]",
      email: true,
      panel: true,
    },
    {
      id: "payout_requested",
      title: "Retiros solicitados",
      desc: "Cuando una tienda solicita un retiro de fondos.",
      icon: Wallet,
      iconBg: "bg-[var(--accent-muted)]",
      iconColor: "text-[var(--accent)]",
      email: true,
      panel: true,
    },
    {
      id: "product_reported",
      title: "Productos reportados",
      desc: "Cuando un producto es reportado por un usuario.",
      icon: Ban,
      iconBg: "bg-[var(--warning-muted)]",
      iconColor: "text-[var(--warning-foreground)]",
      email: false,
      panel: true,
    },
    {
      id: "system_alert",
      title: "Alertas del sistema",
      desc: "Notificaciones importantes y errores del sistema.",
      icon: AlertTriangle,
      iconBg: "bg-[var(--warning-muted)]",
      iconColor: "text-[var(--warning-foreground)]",
      email: true,
      panel: true,
    },
  ]);

  const [notificationEmail, setNotificationEmail] = useState(
    "admin@printshop.com",
  );
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [saveNotificationsSuccess, setSaveNotificationsSuccess] =
    useState(false);

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingNotifications(false);
    setSaveNotificationsSuccess(true);
    setTimeout(() => setSaveNotificationsSuccess(false), 2500);
  };

  const toggleNotification = (id: string, channel: "email" | "panel") => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [channel]: !n[channel] } : n)),
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 3: MODO MANTENIMIENTO STATE
  // ───────────────────────────────────────────────────────────────────────────
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "Estamos realizando mejoras en la plataforma para brindarte un mejor servicio.\nAgradecemos tu comprensión.",
  );

  const [maintenanceModules, setMaintenanceModules] = useState([
    {
      id: "stores",
      title: "Tiendas",
      desc: "Gestionar y ver tiendas.",
      icon: Store,
      disabled: false,
    },
    {
      id: "products",
      title: "Productos",
      desc: "Ver y comprar productos.",
      icon: Package,
      disabled: false,
    },
    {
      id: "designs",
      title: "Diseños",
      desc: "Explorar y usar diseños.",
      icon: Palette,
      disabled: false,
    },
    {
      id: "orders",
      title: "Pedidos",
      desc: "Realizar y gestionar pedidos.",
      icon: ShoppingBag,
      disabled: true,
    },
    {
      id: "payments",
      title: "Pagos",
      desc: "Realizar pagos y retiros.",
      icon: CreditCard,
      disabled: true,
    },
    {
      id: "messages",
      title: "Mensajes",
      desc: "Chat y comunicaciones.",
      icon: MessageSquare,
      disabled: false,
    },
    {
      id: "reviews",
      title: "Comentarios y valoraciones",
      desc: "Ver y dejar comentarios.",
      icon: Star,
      disabled: false,
    },
  ]);

  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [saveMaintenanceSuccess, setSaveMaintenanceSuccess] = useState(false);

  const handleSaveMaintenance = async () => {
    setSavingMaintenance(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingMaintenance(false);
    setSaveMaintenanceSuccess(true);
    setTimeout(() => setSaveMaintenanceSuccess(false), 2500);
  };

  const toggleMaintenanceModule = (id: string) => {
    setMaintenanceModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, disabled: !m.disabled } : m)),
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 4: RESPALDOS PERSONALIZADOS STATE
  // ───────────────────────────────────────────────────────────────────────────
  const [backupType, setBackupType] = useState<"auto" | "manual">("auto");
  const [backupFrequency, setBackupFrequency] = useState("Diaria");
  const [backupTime, setBackupTime] = useState("02:00 AM");
  const [backupRetention, setBackupRetention] = useState("30 días");

  const [backupModules, setBackupModules] = useState([
    {
      id: "users",
      label: "Usuarios",
      desc: "Información de usuarios y perfiles.",
      icon: Users,
      selected: true,
    },
    {
      id: "stores",
      label: "Tiendas",
      desc: "Datos de tiendas y configuraciones.",
      icon: Store,
      selected: true,
    },
    {
      id: "products",
      label: "Productos",
      desc: "Catálogo de productos e inventarios.",
      icon: Package,
      selected: true,
    },
    {
      id: "orders",
      label: "Pedidos",
      desc: "Historial de pedidos y transacciones.",
      icon: ShoppingBag,
      selected: true,
    },
    {
      id: "payments",
      label: "Pagos y retiros",
      desc: "Pagos, comisiones y retiros.",
      icon: CreditCard,
      selected: true,
    },
    {
      id: "designs",
      label: "Diseños",
      desc: "Diseños y archivos relacionados.",
      icon: Palette,
      selected: true,
    },
    {
      id: "messages",
      label: "Mensajes",
      desc: "Conversaciones y mensajes.",
      icon: MessageSquare,
      selected: true,
    },
    {
      id: "reviews",
      label: "Comentarios y valoraciones",
      desc: "Comentarios y valoraciones de usuarios.",
      icon: Star,
      selected: true,
    },
  ]);

  const [savingBackups, setSavingBackups] = useState(false);
  const [saveBackupsSuccess, setSaveBackupsSuccess] = useState(false);

  const [runningManualBackup, setRunningManualBackup] = useState(false);
  const [manualBackupSuccess, setManualBackupSuccess] = useState(false);

  const handleSaveBackups = async () => {
    setSavingBackups(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingBackups(false);
    setSaveBackupsSuccess(true);
    setTimeout(() => setSaveBackupsSuccess(false), 2500);
  };

  const handleRunManualBackup = async () => {
    setRunningManualBackup(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRunningManualBackup(false);
    setManualBackupSuccess(true);
    setTimeout(() => setManualBackupSuccess(false), 3000);
  };

  const toggleBackupModule = (id: string) => {
    setBackupModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m)),
    );
  };

  const backupHistory = [
    {
      date: "18 May, 2026",
      time: "02:00 AM",
      type: "Automático",
      modules: "8 módulos",
      size: "1.25 GB",
      status: "Completado",
    },
    {
      date: "16 May, 2026",
      time: "02:00 AM",
      type: "Automático",
      modules: "8 módulos",
      size: "1.18 GB",
      status: "Completado",
    },
    {
      date: "14 May, 2026",
      time: "02:00 AM",
      type: "Automático",
      modules: "8 módulos",
      size: "1.22 GB",
      status: "Completado",
    },
    {
      date: "13 May, 2026",
      time: "10:15 AM",
      type: "Manual",
      modules: "5 módulos",
      size: "850 MB",
      status: "Completado",
    },
    {
      date: "12 May, 2026",
      time: "11:30 AM",
      type: "Manual",
      modules: "8 módulos",
      size: "1.30 GB",
      status: "Completado",
    },
  ];

  return (
    <div className="p-3.5 sm:p-4 bg-[var(--background)] min-h-full flex flex-col gap-3">
      {/* ── Page Header ── */}
      <PageHeader
        title="Configuración"
        description="Gestiona tu cuenta administradora y las reglas generales de la plataforma."
        icon={Settings}
      />

      {/* ── Tabs Navigation ── */}
      <div className="border-b border-[var(--border)] bg-white rounded-t-xl">
        <div className="flex overflow-x-auto px-2">
          {[
            { id: "account", label: "Mi cuenta" },
            { id: "notifications", label: "Notificaciones" },
            { id: "maintenance", label: "Modo mantenimiento" },
            { id: "backups", label: "Respaldos personalizados" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "border-[var(--primary)] text-[var(--primary)] font-bold"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 1: MI CUENTA (Exact match to the reference image)
      ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "account" && (
        <div className="space-y-3">
          {/* ── ROW 1: Información personal + Seguridad de la cuenta (Equal Heights) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
            {/* CARD 1: Información personal */}
            <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                  Información personal
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-3.5">
                  Actualiza tu información básica.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  {/* Left avatar column */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center pt-1">
                    <div className="relative mb-2.5">
                      <div className="h-24 w-24 rounded-full bg-[var(--info-muted)] overflow-hidden border border-[var(--border)] shadow-2xs flex items-center justify-center">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                          alt="Foto de perfil"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-[var(--success)] border-2 border-white shadow-2xs" />
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] border border-[var(--border-strong)] rounded-[5px] bg-white hover:bg-[var(--info-muted)] transition-colors shadow-2xs cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5 text-[var(--primary)]" /> Cambiar
                      foto
                    </button>
                    <span className="text-[10px] text-[var(--text-muted)] mt-1.5 text-center">
                      JPG, PNG o SVG. Máx. 2MB
                    </span>
                  </div>

                  {/* Right fields column */}
                  <div className="sm:col-span-7 space-y-2.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-8 px-2.5 text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        Zona horaria
                      </label>
                      <div className="relative">
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full h-8 pl-2.5 pr-7 text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all appearance-none cursor-pointer shadow-2xs"
                        >
                          <option value="America/Bogota">
                            (UTC-05:00) Bogotá, Lima, Quito
                          </option>
                          <option value="America/Mexico_City">
                            (UTC-06:00) Ciudad de México
                          </option>
                          <option value="America/New_York">
                            (UTC-05:00) Nueva York
                          </option>
                          <option value="Europe/Madrid">
                            (UTC+01:00) Madrid
                          </option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)] pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        Idioma
                      </label>
                      <div className="relative">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full h-8 pl-2.5 pr-7 text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all appearance-none cursor-pointer shadow-2xs"
                        >
                          <option value="es">Español</option>
                          <option value="en">Inglés</option>
                          <option value="pt">Portugués</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)] pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        Fecha de nacimiento
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full h-8 pl-2.5 pr-8 text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all shadow-2xs"
                        />
                        <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)] pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Seguridad de la cuenta */}
            <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                  Seguridad de la cuenta
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-3.5">
                  Gestiona la seguridad y acceso a tu cuenta.
                </p>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full h-8 pl-2.5 pr-8 text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-8 pl-2.5 pr-8 text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      Confirmar nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-8 pl-2.5 pr-8 text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[var(--primary)] rounded-[5px] hover:bg-[var(--primary-hover)] transition-colors shadow-2xs cursor-pointer"
                >
                  <Shield className="h-3.5 w-3.5" /> Actualizar contraseña
                </button>
              </div>
            </div>
          </div>

          {/* ── ROW 2: Sesiones activas + Acciones de la cuenta (Equal Heights) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
            {/* CARD 3: Sesiones activas */}
            <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                  Sesiones activas
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-2.5">
                  Dispositivos donde tu cuenta está iniciada actualmente.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-muted)] text-[var(--text-secondary)] text-[10px] font-semibold uppercase tracking-wider">
                        <th className="pb-1.5 font-semibold">Dispositivo</th>
                        <th className="pb-1.5 font-semibold">Ubicación</th>
                        <th className="pb-1.5 font-semibold">IP</th>
                        <th className="pb-1.5 font-semibold">
                          Última actividad
                        </th>
                        <th className="pb-1.5 w-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-muted)]">
                      {sessions.map((s) => (
                        <tr
                          key={s.id}
                          className="text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors"
                        >
                          <td className="py-2.5 pr-2">
                            <div className="flex items-center gap-2">
                              {s.type === "desktop" && (
                                <Monitor className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
                              )}
                              {s.type === "mobile" && (
                                <Smartphone className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
                              )}
                              <span className="font-semibold text-[var(--text-primary)]">
                                {s.device}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-2">{s.location}</td>
                          <td className="py-2.5 pr-2 font-mono text-[11px]">
                            {s.ip}
                          </td>
                          <td className="py-2.5 pr-2">{s.activity}</td>
                          <td className="py-2.5 text-right">
                            {s.isCurrent ? (
                              <span className="inline-flex items-center rounded-[3px] bg-[var(--info-muted)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--primary)] border border-[var(--border-strong)]">
                                Actual
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="text-[11px] text-[var(--danger-strong)] hover:underline cursor-pointer"
                              >
                                Cerrar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] border border-[var(--primary)] rounded-[5px] hover:bg-[var(--info-muted)] transition-colors cursor-pointer shadow-2xs"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Cerrar otras sesiones
                </button>
              </div>
            </div>

            {/* CARD 4: Acciones de la cuenta */}
            <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                  Acciones de la cuenta
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-2.5">
                  Gestiona opciones importantes de tu cuenta.
                </p>

                <div className="divide-y divide-[var(--border-muted)]">
                  {/* Action 1: 2FA */}
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-[4px] bg-[var(--info-muted)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--border-strong)]">
                        <Key className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                          Verificación en dos pasos
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                          Añade una capa extra de seguridad a tu cuenta.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="w-24 h-7 text-xs font-semibold text-[var(--primary)] border border-[var(--border-strong)] rounded-[5px] hover:bg-[var(--info-muted)] transition-colors shrink-0 text-center cursor-pointer shadow-2xs"
                    >
                      Configurar
                    </button>
                  </div>

                  {/* Action 2: Dispositivos confiables */}
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-[4px] bg-[var(--surface-muted)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--border)]">
                        <Laptop className="h-4 w-4 text-[var(--text-secondary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                          Dispositivos confiables
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                          Gestiona los dispositivos que pueden acceder.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="w-24 h-7 text-xs font-semibold text-[var(--primary)] border border-[var(--border-strong)] rounded-[5px] hover:bg-[var(--info-muted)] transition-colors shrink-0 text-center cursor-pointer shadow-2xs"
                    >
                      Gestionar
                    </button>
                  </div>

                  {/* Action 3: Eliminar cuenta */}
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-[4px] bg-[var(--danger-muted)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--danger-muted)]">
                        <Trash2 className="h-4 w-4 text-[var(--danger-strong)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                          Eliminar cuenta
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
                          Elimina permanentemente tu cuenta y datos.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="w-24 h-7 text-xs font-medium text-[var(--danger-strong)] border border-[var(--danger-muted)] rounded-[5px] hover:bg-[var(--danger-muted)] transition-colors shrink-0 text-center cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>

              {/* Empty footer area to balance height */}
              <div className="pt-3" />
            </div>
          </div>

          {/* ── BOTTOM ACTIONS: Guardar configuración ── */}
          <div className="flex flex-col items-end pt-1">
            <button
              type="button"
              onClick={handleSaveAccount}
              disabled={savingAccount}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[var(--primary)] rounded-[5px] hover:bg-[var(--primary-hover)] transition-colors shadow-2xs disabled:opacity-70 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {savingAccount
                ? "Guardando..."
                : saveSuccess
                  ? "¡Configuración guardada!"
                  : "Guardar configuración"}
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 2: NOTIFICACIONES
      ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-4">
          <div className="mb-3">
            <h2 className="text-[13.5px] font-bold text-[var(--text-primary)] leading-tight">
              Notificaciones del administrador
            </h2>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Configura las notificaciones que recibes en el panel
              administrativo.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[var(--surface-muted)] text-[var(--text-secondary)] text-[10px] font-semibold uppercase tracking-wider">
                  <th className="pb-2 font-semibold">Notificación</th>
                  <th className="pb-2 font-semibold text-center w-36">
                    Correo electrónico
                  </th>
                  <th className="pb-2 font-semibold text-center w-36">
                    Notificación en panel
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-muted)]">
                {notifications.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-7 w-7 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}
                        >
                          <item.icon
                            className={`h-3.5 w-3.5 ${item.iconColor}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-[var(--text-primary)] leading-tight">
                            {item.title}
                          </p>
                          <p className="text-[10.5px] text-[var(--text-secondary)] mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={item.email}
                          onChange={() => toggleNotification(item.id, "email")}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={item.panel}
                          onChange={() => toggleNotification(item.id, "panel")}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── BOTTOM ACTIONS: Guardar configuración ── */}
          <div className="flex flex-col items-end pt-1">
            <button
              type="button"
              onClick={handleSaveNotifications}
              disabled={savingNotifications}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[var(--primary)] rounded-[5px] hover:bg-[var(--primary-hover)] transition-colors shadow-2xs disabled:opacity-70 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {savingNotifications
                ? "Guardando..."
                : saveNotificationsSuccess
                  ? "¡Configuración guardada!"
                  : "Guardar configuración"}
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 3: MODO MANTENIMIENTO
      ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "maintenance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          <div className="space-y-3">
            <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-2xs p-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                Estado del modo mantenimiento
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-3">
                Activa o desactiva el modo mantenimiento de la plataforma.
              </p>

              <div className="p-3 bg-[var(--info-muted)] border border-[var(--border-strong)] rounded-[5px] flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                      Modo mantenimiento
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Cuando el modo mantenimiento esté activo, los usuarios no
                      podrán acceder a los módulos seleccionados.
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={maintenanceActive}
                  onChange={setMaintenanceActive}
                />
              </div>

              <div className="mt-3.5 space-y-1.5">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                    Mensaje para los usuarios
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Este mensaje se mostrará a los usuarios cuando intenten
                    acceder a un módulo inhabilitado.
                  </p>
                </div>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full p-2.5 text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all resize-none leading-relaxed shadow-2xs"
                />
                <p className="text-[10px] text-[var(--text-muted)] text-right">
                  Caracteres: {maintenanceMessage.length}/500
                </p>
              </div>
            </div>

            <p className="text-xs font-medium text-[var(--text-secondary)]">
              El panel administrativo siempre estará disponible para ti.
            </p>

            {/* BUTTON SAVE */}
            <button
              type="button"
              onClick={handleSaveMaintenance}
              disabled={savingMaintenance}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[var(--primary)] rounded-[5px] hover:bg-[var(--primary-hover)] transition-colors shadow-2xs disabled:opacity-70 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {savingMaintenance
                ? "Guardando..."
                : saveMaintenanceSuccess
                  ? "¡Configuración guardada!"
                  : "Guardar configuración"}
            </button>
          </div>

          <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-2xs p-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
              Módulos y sesiones
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-3">
              Selecciona los módulos que estarán inhabilitados para los
              usuarios.
            </p>

            <div className="divide-y divide-[var(--border-muted)]">
              {maintenanceModules.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-[var(--border-muted)] flex items-center justify-center shrink-0 text-[var(--text-secondary)]">
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    checked={item.disabled}
                    onChange={() => toggleMaintenanceModule(item.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 4: RESPALDOS PERSONALIZADOS
      ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "backups" && (
        <div className="flex flex-col gap-3.5">
          {/* PRIMER PANEL — CONFIGURACIÓN DEL RESPALDO */}
          <div className="w-full bg-white rounded-[5px] border border-[var(--border)] shadow-2xs p-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
              Configuración del respaldo
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-3">
              Personaliza cómo y cuándo se realizan los respaldos de la
              plataforma.
            </p>

            {/* Selector segmentado: Automático | Manual */}
            <div className="space-y-1.5 mb-3">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Tipo de respaldo
              </label>
              <div className="inline-flex rounded-[5px] border border-[var(--border)] bg-[var(--surface-muted)] p-0.5">
                <button
                  type="button"
                  onClick={() => setBackupType("auto")}
                  className={`px-3 py-1 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                    backupType === "auto"
                      ? "bg-white text-[var(--primary)] shadow-2xs border border-[var(--border)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Automático
                </button>
                <button
                  type="button"
                  onClick={() => setBackupType("manual")}
                  className={`px-3 py-1 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                    backupType === "manual"
                      ? "bg-white text-[var(--primary)] shadow-2xs border border-[var(--border)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* Parámetros Automático (Frecuencia, Hora, Retención) - OCULTOS si es Manual */}
            {backupType === "auto" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pb-3.5 mb-3.5 border-b border-[var(--border-muted)]">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)]">
                    Frecuencia
                  </label>
                  <div className="relative">
                    <select
                      value={backupFrequency}
                      onChange={(e) => setBackupFrequency(e.target.value)}
                      className="w-full h-8 pl-2.5 pr-6 text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all appearance-none cursor-pointer shadow-2xs"
                    >
                      <option value="Diaria">Diaria</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Mensual">Mensual</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--text-secondary)] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)]">
                    Hora
                  </label>
                  <div className="relative">
                    <select
                      value={backupTime}
                      onChange={(e) => setBackupTime(e.target.value)}
                      className="w-full h-8 pl-2.5 pr-6 text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all appearance-none cursor-pointer shadow-2xs"
                    >
                      <option value="02:00 AM">02:00 AM</option>
                      <option value="04:00 AM">04:00 AM</option>
                      <option value="06:00 AM">06:00 AM</option>
                      <option value="12:00 AM">12:00 AM</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--text-secondary)] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)]">
                    Retención
                  </label>
                  <div className="relative">
                    <select
                      value={backupRetention}
                      onChange={(e) => setBackupRetention(e.target.value)}
                      className="w-full h-8 pl-2.5 pr-6 text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all appearance-none cursor-pointer shadow-2xs"
                    >
                      <option value="15 días">15 días</option>
                      <option value="30 días">30 días</option>
                      <option value="60 días">60 días</option>
                      <option value="90 días">90 días</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--text-secondary)] pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Módulos a respaldar (Cuadrícula de 3 columnas de tarjetas seleccionables) */}
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                Seleccionar módulos a respaldar
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 mb-2.5">
                Elige los módulos y datos que deseas incluir en el respaldo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {backupModules.map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => toggleBackupModule(mod.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-[5px] border cursor-pointer transition-all ${
                      mod.selected
                        ? "bg-[var(--info-muted)] border-[var(--primary)] shadow-2xs ring-1 ring-[var(--primary)]/20"
                        : "bg-white border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-[3px] mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                        mod.selected
                          ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                          : "border-[var(--border-strong)] bg-white"
                      }`}
                    >
                      {mod.selected && (
                        <Check className="h-3 w-3 stroke-[3]" />
                      )}
                    </div>
                    <div
                      className={`h-7 w-7 rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                        mod.selected
                          ? "bg-[var(--info-muted)] text-[var(--primary)]"
                          : "bg-[var(--border-muted)] text-[var(--text-secondary)]"
                      }`}
                    >
                      <mod.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                        {mod.label}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón principal al final del panel */}
            <div className="flex justify-end mt-4 pt-3 border-t border-[var(--border-muted)]">
              {backupType === "auto" ? (
                <button
                  type="button"
                  onClick={handleSaveBackups}
                  disabled={savingBackups}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[var(--primary)] rounded-[5px] hover:bg-[var(--primary-hover)] transition-colors shadow-2xs disabled:opacity-70 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  {savingBackups
                    ? "Guardando..."
                    : saveBackupsSuccess
                      ? "¡Configuración guardada!"
                      : "Guardar configuración"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRunManualBackup}
                  disabled={runningManualBackup}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[var(--primary)] rounded-[5px] hover:bg-[var(--primary-hover)] transition-colors shadow-2xs disabled:opacity-70 cursor-pointer"
                >
                  <Database className="h-4 w-4" />
                  {runningManualBackup
                    ? "Generando respaldo..."
                    : manualBackupSuccess
                      ? "¡Respaldo completado!"
                      : "Realizar respaldo ahora"}
                </button>
              )}
            </div>
          </div>

          {/* SEGUNDO PANEL — ÚLTIMOS RESPALDOS */}
          <div className="w-full bg-white rounded-[5px] border border-[var(--border)] shadow-2xs p-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
              Últimos respaldos
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-3">
              Historial de los respaldos realizados.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-muted)] text-[var(--text-secondary)] text-[10px] font-semibold uppercase tracking-wider">
                    <th className="pb-2 font-semibold">Fecha</th>
                    <th className="pb-2 font-semibold">Tipo</th>
                    <th className="pb-2 font-semibold">Módulos</th>
                    <th className="pb-2 font-semibold">Tamaño</th>
                    <th className="pb-2 font-semibold text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-muted)]">
                  {backupHistory.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[var(--surface-muted)] transition-colors"
                    >
                      <td className="py-2.5 pr-2">
                        <div>
                          <p className="font-semibold text-[var(--text-primary)] leading-tight whitespace-nowrap">
                            {item.date}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-tight">
                            {item.time}
                          </p>
                        </div>
                      </td>
                      <td className="py-2.5 pr-2 text-[var(--text-secondary)] whitespace-nowrap">
                        {item.type}
                      </td>
                      <td className="py-2.5 pr-2 text-[var(--text-secondary)] whitespace-nowrap">
                        {item.modules}
                      </td>
                      <td className="py-2.5 pr-2 text-[var(--text-secondary)] whitespace-nowrap font-medium">
                        {item.size}
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap text-[var(--text-secondary)] font-medium text-xs">
                        {item.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
