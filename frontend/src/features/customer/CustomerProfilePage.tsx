import * as React from "react";
import {
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  Info,
  Laptop,
  Lock,
  Mail,
  Megaphone,
  Radio,
  Settings,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useAuthStore } from "@/features/auth";
import { cn } from "@/shared/utils/cn";
import { customerIconButtonClass } from "./customer-ui";

// ── Interfaz de Modal ────────────────────────────────────────────────────────
interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

function ModalWrapper({
  isOpen,
  onClose,
  title,
  description,
  children,
}: ModalWrapperProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg rounded-[5px] bg-white p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(customerIconButtonClass, "h-8 w-8")}
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// ── Switch Component (Apple Design style toggle) ────────────────────────────
function Switch({
  checked,
  onChange,
  disabled,
  id,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        checked ? "bg-slate-800" : "bg-slate-200",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function CustomerProfilePage() {
  const user = useAuthStore((state) => state.user);

  // ── 1. Estado de Información Personal ──────────────────────────────────────
  const [firstName, setFirstName] = React.useState(() => {
    if (!user?.name) return "Usuario";
    const parts = user.name.trim().split(/\s+/);
    return parts[0] || "Usuario";
  });
  const [lastName, setLastName] = React.useState(() => {
    if (!user?.name) return "Google";
    const parts = user.name.trim().split(/\s+/);
    return parts.slice(1).join(" ") || "Google";
  });
  const [phone, setPhone] = React.useState("300 123 4567");
  const [countryCode, setCountryCode] = React.useState("+57");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // ── 2. Estado de Preferencias ──────────────────────────────────────────────
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [printShopNews, setPrintShopNews] = React.useState(true);

  // ── 3. Estados de Modales Interactivos ─────────────────────────────────────
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = React.useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = React.useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  // Modal contraseña form
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordStatusMsg, setPasswordStatusMsg] = React.useState<string | null>(null);

  // Modal sesiones activas demo
  const [activeSessions, setActiveSessions] = React.useState([
    {
      id: "s1",
      device: "MacBook Pro",
      platform: "macOS Sequoia",
      location: "Bogotá, Colombia",
      current: true,
      lastActive: "Activo ahora",
      icon: Laptop,
    },
    {
      id: "s2",
      device: "iPhone 15 Pro",
      platform: "iOS 18",
      location: "Bogotá, Colombia",
      current: false,
      lastActive: "Hace 2 horas",
      icon: Smartphone,
    },
  ]);

  // Manejo de cambio de foto de avatar
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo no debe exceder 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejo de guardado de datos
  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const handleCancelChanges = () => {
    if (!user?.name) {
      setFirstName("Usuario");
      setLastName("Google");
    } else {
      const parts = user.name.trim().split(/\s+/);
      setFirstName(parts[0] || "Usuario");
      setLastName(parts.slice(1).join(" ") || "Google");
    }
    setPhone("300 123 4567");
    setCountryCode("+57");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setPasswordStatusMsg("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatusMsg("Las contraseñas no coinciden.");
      return;
    }
    setPasswordStatusMsg("¡Contraseña actualizada con éxito!");
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setPasswordStatusMsg(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1200);
  };

  const handleRevokeSession = (sessionId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ── Encabezado de la página ───────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
          Configuración de cuenta
        </h1>
        <p className="text-xs text-slate-500 sm:text-sm">
          Administra tu información personal, seguridad y preferencias.
        </p>
      </div>

      {/* ── Notificación de guardado exitoso ──────────────────────────────── */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Tus cambios han sido guardados correctamente.</span>
        </div>
      )}

      {/* ── Cuadrícula 2x2 de paneles principales ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── 1. Información personal ─────────────────────────────────────── */}
        <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header de la tarjeta */}
            <div className="flex items-start gap-3 pb-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-slate-100 text-slate-500">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Información personal
                </h2>
                <p className="text-[12px] text-slate-500">
                  Mantén tus datos actualizados para una mejor experiencia.
                </p>
              </div>
            </div>

            {/* Fila avatar e inputs */}
            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5 pt-1">
                {/* Avatar y botón de cambiar foto */}
                <div className="flex flex-col items-center shrink-0 w-32">
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Foto de perfil"
                        className="h-24 w-24 rounded-full object-cover ring-2 ring-slate-100 shadow-xs"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 shadow-xs">
                        <User className="h-10 w-10" aria-hidden="true" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(customerIconButtonClass, "absolute bottom-0 right-0 h-7 w-7")}
                      title="Cambiar foto"
                      aria-label="Cambiar foto de perfil"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/svg+xml"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
                  >
                    Cambiar foto
                  </button>
                  <span className="text-[10px] text-slate-400 text-center leading-tight mt-0.5">
                    JPG, PNG o SVG<br />(Máx. 5 MB)
                  </span>
                </div>

                {/* Campos de Nombre y Apellidos */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="firstNameInput"
                        className="block text-xs font-medium text-slate-700 mb-1"
                      >
                        Nombre
                      </label>
                      <input
                        id="firstNameInput"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-[5px] border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastNameInput"
                        className="block text-xs font-medium text-slate-700 mb-1"
                      >
                        Apellidos
                      </label>
                      <input
                        id="lastNameInput"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-[5px] border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                      />
                    </div>
                  </div>

                  {/* Correo electrónico */}
                  <div>
                    <label
                      htmlFor="emailInput"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <input
                        id="emailInput"
                        type="email"
                        readOnly
                        value={user?.email || ""}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-500 pr-24 cursor-not-allowed"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-[5px] bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600 border border-slate-200">
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                        <span>Verificado</span>
                      </div>
                    </div>
                    <p className="mt-1 text-[10.5px] text-slate-400">
                      Este correo se utiliza para iniciar sesión y recibir notificaciones.
                    </p>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label
                      htmlFor="phoneInput"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Teléfono (opcional)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-sm">🇨🇴</span>
                          <span>{countryCode}</span>
                          <ChevronDown className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                      <input
                        id="phoneInput"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="300 123 4567"
                      className="flex-1 rounded-[5px] border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                      />
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex h-[42px] items-center justify-center rounded-[5px] bg-slate-900 px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-[0.98] disabled:opacity-50"
                    >
                      <span>{isSaving ? "Guardando..." : "Guardar cambios"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelChanges}
                      className="h-[42px] rounded-[5px] border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ── 2. Seguridad y acceso ────────────────────────────────────────── */}
        <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start gap-3 pb-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-slate-100 text-slate-500">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Seguridad y acceso
                </h2>
                <p className="text-[12px] text-slate-500">
                  Administra tu contraseña y revisa tus sesiones activas.
                </p>
              </div>
            </div>

            {/* Filas de seguridad */}
            <div className="space-y-4">
              {/* Contraseña */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-slate-100 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800">Contraseña</h3>
                    <p className="text-[11px] text-slate-400">
                      Mantén tu cuenta segura con una contraseña fuerte y actualizada.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="flex items-center rounded-[5px] border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>Cambiar contraseña</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Sesiones activas */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-slate-100 text-slate-500">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800">Sesiones activas</h3>
                    <p className="text-[11px] text-slate-400">
                      Revisa los dispositivos donde has iniciado sesión y cierra los que no reconozcas.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSessionsModalOpen(true)}
                  className="flex items-center rounded-[5px] border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>Administrar sesiones</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Caja azulada de Consejos de seguridad */}
          <div className="mt-6 rounded-xl border border-[#E0E7FF] bg-[#F5F3FF]/70 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6366F1] text-white">
                <Info className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Consejos de seguridad</h4>
            </div>
            <ul className="space-y-1.5 pl-6 text-[11px] text-slate-600 list-disc">
              <li>Utiliza una contraseña única y segura.</li>
              <li>No compartas tus credenciales.</li>
              <li>Cierra sesión en dispositivos que no uses.</li>
              <li>Activa la verificación en dos pasos cuando esté disponible.</li>
            </ul>
          </div>
        </div>

        {/* ── 3. Preferencias ─────────────────────────────────────────────── */}
        <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start gap-3 pb-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#6366F1]">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Preferencias</h2>
                <p className="text-[12px] text-slate-500">
                  Personaliza tu experiencia en PrintShop.
                </p>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              {/* Notificaciones por correo */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#6366F1]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800">
                      Notificaciones por correo
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Recibe actualizaciones sobre tus pedidos, diseños, cupones y actividad de cuenta.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                  aria-label="Notificaciones por correo"
                />
              </div>

              {/* Novedades de PrintShop */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#6366F1]">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800">
                      Novedades de PrintShop
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Recibe noticias, consejos, nuevas plantillas y contenido creativo.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={printShopNews}
                  onChange={setPrintShopNews}
                  aria-label="Novedades de PrintShop"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Privacidad y datos ────────────────────────────────────────── */}
        <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start gap-3 pb-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#6366F1]">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Privacidad y datos</h2>
                <p className="text-[12px] text-slate-500">
                  Gestiona cómo se utilizan tus datos en PrintShop.
                </p>
              </div>
            </div>

            {/* Acciones de privacidad */}
            <div className="space-y-3">
              {/* Preferencias de privacidad */}
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="w-full flex items-center justify-between rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 group-hover:text-slate-800 transition-colors">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800">
                      Preferencias de privacidad
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Controla la información que compartes.
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>

              {/* Datos de tu cuenta */}
              <button
                type="button"
                onClick={() => setIsDataModalOpen(true)}
                className="w-full flex items-center justify-between rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 group-hover:text-slate-800 transition-colors">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800">
                      Datos de tu cuenta
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Consulta y administra tus datos personales.
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>

              {/* Eliminar cuenta */}
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full flex items-center justify-between rounded-xl border border-slate-100 p-3 text-left hover:bg-rose-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 group-hover:text-rose-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-rose-700">
                      Eliminar cuenta
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Solicita la eliminación de tu cuenta y datos asociados.
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modales interactivos correspondientes a las acciones ─────────── */}

      {/* 1. Modal Cambiar Contraseña */}
      <ModalWrapper
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Cambiar contraseña"
        description="Ingresa tu contraseña actual y define una nueva para mayor seguridad."
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordStatusMsg && (
            <div
              className={cn(
                "rounded-xl p-3 text-xs font-medium",
                passwordStatusMsg.includes("éxito")
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200",
              )}
            >
              {passwordStatusMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Contraseña actual
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-[5px] border border-slate-200 px-3 py-2 text-xs text-slate-800 pr-10 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(customerIconButtonClass, "absolute right-3 top-1/2 h-7 w-7 -translate-y-1/2")}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nueva contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-[5px] border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Confirmar nueva contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-[5px] border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Repite la nueva contraseña"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="h-[42px] rounded-[5px] border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-[42px] rounded-[5px] bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-700 shadow-xs"
            >
              Actualizar contraseña
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* 2. Modal Administrar Sesiones */}
      <ModalWrapper
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
        title="Sesiones activas"
        description="Dispositivos que actualmente tienen acceso a tu cuenta de PrintShop."
      >
        <div className="space-y-3">
          {activeSessions.map((session) => {
            const IconComp = session.icon;
            return (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-[5px] border border-slate-200 p-3 bg-slate-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700">
                    <IconComp className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">
                        {session.device}
                      </span>
                      {session.current && (
                        <span className="rounded-[5px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                          Este dispositivo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{session.platform}</p>
                    <p className="text-[11px] text-slate-400">{session.location}</p>
                    <p className="text-[11px] text-slate-400">{session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </ModalWrapper>

      {/* 3. Modal Preferencias de Privacidad */}
      <ModalWrapper
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Preferencias de privacidad"
        description="Ajusta la visibilidad y el uso de tus datos en la plataforma."
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Perfil en Marketplace</p>
              <p className="text-[11px] text-slate-400">
                Mostrar tu nombre público cuando compres o valores diseños.
              </p>
            </div>
            <Switch checked={true} onChange={() => {}} aria-label="Perfil en Marketplace" />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Analítica de uso</p>
              <p className="text-[11px] text-slate-400">
                Ayuda a mejorar PrintShop enviando datos anónimos de navegación.
              </p>
            </div>
            <Switch checked={false} onChange={() => {}} aria-label="Analítica de uso" />
          </div>
          <p className="text-[11px] text-slate-400 pt-2">
            Tus datos nunca son compartidos con terceros sin tu consentimiento expreso.
          </p>
        </div>
      </ModalWrapper>

      {/* 4. Modal Datos de tu Cuenta */}
      <ModalWrapper
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        title="Datos de tu cuenta"
        description="Información registrada y exportación de actividad personal."
      >
        <div className="space-y-3 text-xs text-slate-600">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <p className="font-medium text-slate-800">Identificador de cuenta:</p>
            <p className="font-mono text-[11px] text-slate-500 mt-0.5">{user?.id || "usr-printshop-demo"}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <p className="font-medium text-slate-800">Fecha de registro:</p>
            <p className="text-[11px] text-slate-500 mt-0.5">15 de enero de 2026</p>
          </div>
          <button
            type="button"
            onClick={() => {
              alert("Solicitud de exportación enviada a tu correo.");
              setIsDataModalOpen(false);
            }}
            className="h-[42px] w-full rounded-[5px] bg-slate-100 px-4 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition-colors"
          >
            Descargar archivo con mis datos (JSON/ZIP)
          </button>
        </div>
      </ModalWrapper>

      {/* 5. Modal Eliminar Cuenta */}
      <ModalWrapper
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar cuenta"
        description="Esta acción es irreversible y eliminará todos tus pedidos y diseños asociados."
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="flex items-start gap-2.5 rounded-[5px] border border-slate-300 bg-slate-100 p-3 text-slate-700">
            <p className="leading-snug">
              Al confirmar, se cancelarán todas las suscripciones activas y perderás acceso inmediato a tus archivos en la nube.
            </p>
          </div>
          <p className="text-[11px] text-slate-500">
            Escribe <strong className="text-slate-800">ELIMINAR</strong> para confirmar tu solicitud:
          </p>
          <input
            type="text"
            placeholder="ELIMINAR"
            className="w-full rounded-[5px] border border-slate-200 px-3 py-2 text-xs uppercase text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="h-[42px] rounded-[5px] border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                alert("Para procesar la baja definitiva de cuentas de demostración, contacta con soporte.");
                setIsDeleteModalOpen(false);
              }}
              className="h-[42px] rounded-[5px] bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-700 shadow-xs"
            >
              Confirmar eliminación
            </button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
}

export default CustomerProfilePage;
