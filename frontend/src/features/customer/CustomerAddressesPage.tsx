import * as React from "react";
import {
  Check,
  Edit2,
  MoreHorizontal,
  Phone,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { customerIconButtonClass } from "./customer-ui";
import { CustomerPortalMenu } from "./customer-portal-menu";

// ── Tipos del Dominio de Direcciones ──────────────────────────────────────────
export interface CustomerAddress {
  id: string;
  name: string;
  street: string;
  details?: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

// ── Fixture Inicial ──────────────────────────────────────────────────────────
// Por defecto, se inicia vacío para reflejar el estado aprobado en la referencia (Imagen 3).
// El usuario puede hacer clic en "+ Agregar dirección" para crear y guardar direcciones interactivamente.
const INITIAL_ADDRESSES: CustomerAddress[] = [];

// ── Ilustración Vectorial Fiel (Casa, marcador morado y paquetes) ────────────
function AddressesEmptyIllustration() {
  return (
    <div className="relative mx-auto flex h-[210px] w-[340px] select-none items-center justify-center sm:h-[240px] sm:w-[380px]">
      <svg
        viewBox="0 0 380 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        {/* Sombra de la base */}
        <ellipse
          cx="190"
          cy="210"
          rx="145"
          ry="14"
          fill="#E2E8F0"
          fillOpacity="0.6"
        />

        {/* Elementos de fondo: lámpara colgante y cuadro de camiseta */}
        <line
          x1="222"
          y1="65"
          x2="222"
          y2="82"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <path d="M216 82L228 82L225 89L219 89L216 82Z" fill="#64748B" />

        {/* Cuadro decorativo en la pared (Camiseta) */}
        <rect
          x="240"
          y="80"
          width="28"
          height="32"
          rx="3"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1.2"
        />
        <path
          d="M248 90L250 88L254 88L256 90L259 92L257 95L255 94V100H249V94L247 95L245 92L248 90Z"
          fill="#94A3B8"
        />

        {/* Árbol a la izquierda */}
        <rect x="173" y="125" width="4" height="20" fill="#94A3B8" />
        <ellipse
          cx="175"
          cy="115"
          rx="12"
          ry="18"
          fill="#94A3B8"
          fillOpacity="0.7"
        />

        {/* Casa isométrica */}
        <g transform="translate(180, 85)">
          {/* Techo */}
          <path d="M26 35L55 10L84 35H26Z" fill="#64748B" />
          <rect x="50" y="10" width="10" height="15" fill="#475569" />
          {/* Fachada frontal */}
          <rect
            x="28"
            y="35"
            width="54"
            height="45"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1.2"
          />
          {/* Puerta */}
          <rect x="48" y="55" width="14" height="25" rx="2" fill="#475569" />
          {/* Ventanas */}
          <rect x="34" y="44" width="10" height="10" rx="1" fill="#94A3B8" />
          <rect x="66" y="44" width="10" height="10" rx="1" fill="#94A3B8" />
        </g>

        {/* Cajas / paquetes apilados a la derecha de la casa */}
        <g transform="translate(235, 115)">
          {/* Estante y cajas */}
          <rect
            x="2"
            y="18"
            width="22"
            height="16"
            rx="2"
            fill="#D1B48C"
            stroke="#B8976C"
            strokeWidth="1"
          />
          <rect
            x="20"
            y="24"
            width="24"
            height="18"
            rx="2"
            fill="#DEC29E"
            stroke="#C9A87C"
            strokeWidth="1"
          />
          <rect
            x="8"
            y="32"
            width="26"
            height="20"
            rx="2"
            fill="#E2C9A6"
            stroke="#D1B48C"
            strokeWidth="1"
          />
        </g>

        {/* Hoja / mapa doblado en el suelo bajo el marcador */}
        <path
          d="M165 160L190 145L220 152L245 140L250 170L225 182L195 174L165 190L165 160Z"
          fill="#F1F5F9"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />

        {/* Pin de ubicación morado flotante grande */}
        <g transform="translate(200, 110)">
          <path
            d="M20 0C8.954 0 0 8.954 0 20C0 35 20 54 20 54C20 54 40 35 40 20C40 8.954 31.046 0 20 0Z"
            fill="#6366F1"
            stroke="#4F46E5"
            strokeWidth="1.5"
          />
          {/* Círculo central blanco */}
          <circle cx="20" cy="20" r="7.5" fill="#FFFFFF" />
        </g>

        {/* Pins pequeños sutiles en el fondo */}
        <g transform="translate(170, 75) scale(0.4)">
          <path
            d="M20 0C8.954 0 0 8.954 0 20C0 35 20 54 20 54C20 54 40 35 40 20C40 8.954 31.046 0 20 0Z"
            fill="#C7D2FE"
          />
          <circle cx="20" cy="20" r="7.5" fill="#FFFFFF" />
        </g>
        <g transform="translate(265, 102) scale(0.4)">
          <path
            d="M20 0C8.954 0 0 8.954 0 20C0 35 20 54 20 54C20 54 40 35 40 20C40 8.954 31.046 0 20 0Z"
            fill="#C7D2FE"
          />
          <circle cx="20" cy="20" r="7.5" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}

// ── Modal de Agregar / Editar Dirección ──────────────────────────────────────
function AddressFormModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  initialData: CustomerAddress | null;
  onClose: () => void;
  onSave: (address: Omit<CustomerAddress, "id">, id?: string) => void;
}) {
  const [name, setName] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [city, setCity] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setStreet(initialData.street);
      setDetails(initialData.details ?? "");
      setCity(initialData.city);
      setPostalCode(initialData.postalCode);
      setPhone(initialData.phone);
      setIsDefault(initialData.isDefault);
    } else {
      setName("");
      setStreet("");
      setDetails("");
      setCity("");
      setPostalCode("");
      setPhone("");
      setIsDefault(false);
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Ingresa el nombre del destinatario.";
    if (!street.trim()) newErrors.street = "Ingresa la dirección principal.";
    if (!city.trim()) newErrors.city = "Ingresa la ciudad o municipio.";
    if (!phone.trim())
      newErrors.phone = "Ingresa un número telefónico de contacto.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(
      {
        name: name.trim(),
        street: street.trim(),
        details: details.trim() || undefined,
        city: city.trim(),
        postalCode: postalCode.trim() || "110111",
        phone: phone.trim(),
        isDefault,
      },
      initialData?.id,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg border border-slate-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150"
        style={{ borderRadius: 5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? "Editar dirección" : "Agregar nueva dirección"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(customerIconButtonClass, "h-8 w-8")}
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nombre del destinatario *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Laura Banguera"
              className="mt-1 w-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
              style={{ borderRadius: 5 }}
            />
            {errors.name && (
              <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Dirección de entrega *
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Ej: Carrera 7 # 116-50"
                className="mt-1 w-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                style={{ borderRadius: 5 }}
              />
              {errors.street && (
                <p className="mt-1 text-[11px] text-red-600">{errors.street}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Apto / Oficina / Edificio
              </label>
              <input
                type="text"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Ej: Apto 302, Torre 1"
                className="mt-1 w-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                style={{ borderRadius: 5 }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Ciudad y Departamento *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: Bogotá D.C."
                className="mt-1 w-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                style={{ borderRadius: 5 }}
              />
              {errors.city && (
                <p className="mt-1 text-[11px] text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Código postal
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Ej: 110111"
                className="mt-1 w-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                style={{ borderRadius: 5 }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Teléfono de contacto *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +57 310 123 4567"
                className="mt-1 w-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                style={{ borderRadius: 5 }}
              />
              {errors.phone && (
                <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
              />
              <span>
                Establecer como dirección principal para futuros pedidos
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              style={{ borderRadius: 5 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 active:scale-[0.98]"
              style={{ borderRadius: 5 }}
            >
              Guardar dirección
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Menú de Tres Puntos para Cada Dirección ──────────────────────────────────
function AddressCardMenu({
  address,
  onEdit,
  onSetDefault,
  onDelete,
}: {
  address: CustomerAddress;
  onEdit: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
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
          "h-8 w-8 text-slate-400",
          open && "bg-slate-100 text-slate-800",
        )}
        aria-label="Acciones de la dirección"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <CustomerPortalMenu
        open={open}
        anchorRef={buttonRef}
        onClose={() => setOpen(false)}
        minWidth={190}
      >
          {!address.isDefault && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSetDefault();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span>Establecer como principal</span>
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Editar dirección</span>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-600" />
            <span>Eliminar dirección</span>
          </button>
      </CustomerPortalMenu>
    </div>
  );
}

// ── Página Principal de Mis Direcciones ──────────────────────────────────────
export function CustomerAddressesPage() {
  const [addresses, setAddresses] =
    React.useState<CustomerAddress[]>(INITIAL_ADDRESSES);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] =
    React.useState<CustomerAddress | null>(null);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<CustomerAddress, "id">, id?: string) => {
    if (id) {
      // Editar
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            return { ...a, ...data };
          }
          if (data.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        }),
      );
      showToast("Dirección actualizada con éxito.");
    } else {
      // Agregar
      const newAddr: CustomerAddress = {
        id: `addr-${Date.now()}`,
        ...data,
      };
      setAddresses((prev) => {
        const next = data.isDefault
          ? prev.map((a) => ({ ...a, isDefault: false }))
          : [...prev];
        return [newAddr, ...next];
      });
      showToast("Nueva dirección guardada.");
    }
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      })),
    );
    showToast("Dirección principal actualizada.");
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast("Dirección eliminada.");
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-150">
      {/* ── Encabezado Principal ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
            Mis direcciones
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Gestiona las direcciones guardadas para tu cuenta.
          </p>
        </div>

        {/* Botón superior derecho: + Agregar dirección */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex h-[42px] w-[160px] items-center justify-center self-start bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 sm:self-auto"
          style={{ borderRadius: 5 }}
        >
          <span>Agregar dirección</span>
        </button>
      </div>

      {/* ── Toast de Feedback ────────────────────────────────────────────── */}
      {toastMsg && (
        <div
          className="flex items-center border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-800 animate-in fade-in duration-150"
          style={{ borderRadius: 5 }}
          role="status"
        >
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Estado Vacío o Cuadrícula de Direcciones ─────────────────────── */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in duration-200">
          {/* Ilustración de la casa con pin morado */}
          <AddressesEmptyIllustration />

          <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
            Aún no tienes direcciones guardadas
          </h2>
          <p className="mt-1.5 max-w-md text-xs text-slate-500 sm:text-sm">
            Agrega una dirección para tener tu información organizada en un solo
            lugar.
          </p>
        </div>
      ) : (
        /* Cuadrícula de Direcciones */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={cn(
                "relative flex flex-col justify-between border bg-white p-5 transition-shadow hover:shadow-xs",
                address.isDefault
                  ? "border-indigo-300 ring-1 ring-indigo-200/50"
                  : "border-slate-200",
              )}
              style={{ borderRadius: 5 }}
            >
              <div>
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {address.name}
                    </span>
                    {address.isDefault && (
                      <span
                        className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700"
                        style={{ borderRadius: 4 }}
                      >
                        <Check className="h-3 w-3" />
                        Principal
                      </span>
                    )}
                  </div>

                  <AddressCardMenu
                    address={address}
                    onEdit={() => handleOpenEdit(address)}
                    onSetDefault={() => handleSetDefault(address.id)}
                    onDelete={() => handleDelete(address.id)}
                  />
                </div>

                {/* Datos de dirección */}
                <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                  <p className="font-medium text-slate-800">{address.street}</p>
                  {address.details && (
                    <p className="text-slate-500">{address.details}</p>
                  )}
                  <p className="text-slate-500">{address.city}</p>
                  <p className="text-slate-500">CP {address.postalCode}</p>
                </div>
              </div>

              {/* Teléfono de contacto */}
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{address.phone}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal de Formulario ─────────────────────────────────────────── */}
      <AddressFormModal
        isOpen={isModalOpen}
        initialData={editingAddress}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default CustomerAddressesPage;
