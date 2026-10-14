import * as React from 'react';
import { X, Check, ArrowRight, Sparkles, Store, User, Layers, Palette, Eye, Cpu, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CustomPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = 'store' | 'client';
type DesignerMode = 'basic' | 'advanced' | 'both';

interface ToolOption {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  availableFor: ('store' | 'client')[];
  isDesigner?: boolean;
}

// Catálogo de herramientas reales y tarifas del sistema (referencia: planes Básico $49.900 y Profesional $119.900)
const TOOLS_CATALOG: ToolOption[] = [
  {
    id: 'designer',
    name: 'Diseñador Gráfico & Pre-impresión',
    description: 'Lienzo vectorial para posicionar gráficos, textos y composiciones sobre productos.',
    monthlyPrice: 19900,
    availableFor: ['store', 'client'],
    isDesigner: true,
  },
  {
    id: 'catalog-products',
    name: 'Gestor de Productos y Catálogo',
    description: 'Publicación de prendas, variantes de color y control de inventario de artículos.',
    monthlyPrice: 14900,
    availableFor: ['store'],
  },
  {
    id: 'orders-tracking',
    name: 'Seguimiento de Pedidos y Envíos',
    description: 'Panel de control de órdenes, estados de producción y guías de transporte.',
    monthlyPrice: 9900,
    availableFor: ['store', 'client'],
  },
  {
    id: 'templates-access',
    name: 'Biblioteca de Diseños y Plantillas',
    description: 'Acceso a colecciones temáticas de arte listas para estampar en cualquier producto.',
    monthlyPrice: 9900,
    availableFor: ['store', 'client'],
  },
  {
    id: 'custom-domain',
    name: 'Dominio Propio y Marca Blanca',
    description: 'Vinculación de tu dominio web exclusivo para tu tienda de personalización.',
    monthlyPrice: 24900,
    availableFor: ['store'],
  },
];

const AI_ADDON_PRICE = 19900;

export const CustomPlanModal: React.FC<CustomPlanModalProps> = ({ isOpen, onClose }) => {
  const [role, setRole] = React.useState<UserRole>('store');
  const [selectedTools, setSelectedTools] = React.useState<string[]>(['designer']);
  const [designerMode, setDesignerMode] = React.useState<DesignerMode>('basic');
  const [includeAI, setIncludeAI] = React.useState<boolean>(false);

  // Cerrar con Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filtrar herramientas disponibles según perfil
  const availableTools = TOOLS_CATALOG.filter((tool) => tool.availableFor.includes(role));

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  // Cálculo transparente del precio
  const calculateTotal = () => {
    let sum = 0;
    selectedTools.forEach((toolId) => {
      const tool = TOOLS_CATALOG.find((t) => t.id === toolId);
      if (!tool) return;

      if (tool.isDesigner) {
        // Tarifa según modo
        if (designerMode === 'basic') sum += 14900;
        else if (designerMode === 'advanced') sum += 24900;
        else sum += 29900; // Ambos modos
      } else {
        sum += tool.monthlyPrice;
      }
    });

    if (includeAI) {
      sum += AI_ADDON_PRICE;
    }

    return sum;
  };

  const totalPrice = calculateTotal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop sólido translúcido Apple */}
      <div
        className="fixed inset-0 bg-[#0B091A]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor Modal */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-black/[0.08] bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]">
        
        {/* Encabezado del Configurador */}
        <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#FAFBFD] px-6 py-4.5 sm:px-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Plan Personalizar
            </span>
            <h2 className="text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">
              Configura tu plan a la medida
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] bg-white text-foregroundMuted transition-colors hover:bg-[#F3F5FA] hover:text-foreground"
            aria-label="Cerrar configurador"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cuerpo del Configurador: 2 Columnas (Opciones / Resumen Dinámico) */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[1.4fr_1fr]">
          
          {/* Lado Izquierdo: Pasos de Configuración */}
          <div className="space-y-8 p-6 sm:p-8">
            
            {/* Paso 1: Elegir Perfil */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foregroundMuted">
                Paso 1 • ¿Cómo utilizarás PrintShop?
              </span>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('store')}
                  className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all ${
                    role === 'store'
                      ? 'border-primary bg-primary/[0.04] ring-1 ring-primary'
                      : 'border-black/[0.08] bg-white hover:border-black/20'
                  }`}
                >
                  <Store className={`h-5 w-5 ${role === 'store' ? 'text-primary' : 'text-foregroundMuted'}`} />
                  <span className="font-bold text-sm text-[#0F172A] mt-1">Como Tienda</span>
                  <span className="text-xs text-foregroundMuted">Producción, ventas y catálogo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all ${
                    role === 'client'
                      ? 'border-primary bg-primary/[0.04] ring-1 ring-primary'
                      : 'border-black/[0.08] bg-white hover:border-black/20'
                  }`}
                >
                  <User className={`h-5 w-5 ${role === 'client' ? 'text-primary' : 'text-foregroundMuted'}`} />
                  <span className="font-bold text-sm text-[#0F172A] mt-1">Como Creador / Cliente</span>
                  <span className="text-xs text-foregroundMuted">Diseño y personalización de artículos</span>
                </button>
              </div>
            </div>

            {/* Paso 2: Elegir Herramientas */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foregroundMuted">
                Paso 2 • Elige las herramientas necesarias
              </span>
              <div className="mt-3 space-y-2.5">
                {availableTools.map((tool) => {
                  const isChecked = selectedTools.includes(tool.id);
                  return (
                    <div
                      key={tool.id}
                      onClick={() => toggleTool(tool.id)}
                      className={`flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition-all ${
                        isChecked
                          ? 'border-primary bg-primary/[0.03] ring-1 ring-primary'
                          : 'border-black/[0.08] bg-white hover:border-black/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            isChecked ? 'border-primary bg-primary text-white' : 'border-black/20 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">{tool.name}</p>
                          <p className="text-xs text-foregroundMuted mt-0.5">{tool.description}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary shrink-0">
                        {tool.isDesigner
                          ? 'Desde $14.900/mes'
                          : `$${tool.monthlyPrice.toLocaleString('es-CO')}/mes`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Paso 3: Configurar Diseñadores (si el diseñador está seleccionado) */}
            {selectedTools.includes('designer') && (
              <div className="rounded-2xl border border-black/[0.08] bg-[#FAFBFD] p-4.5">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Paso 3 • Modo del Diseñador
                </span>
                <p className="text-xs text-foregroundMuted mt-1">
                  Elige la complejidad requerida para tu flujo de trabajo:
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { id: 'basic', label: 'Modo Básico', price: '$14.900/mes' },
                    { id: 'advanced', label: 'Modo Avanzado', price: '$24.900/mes' },
                    { id: 'both', label: 'Ambos Modos', price: '$29.900/mes' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setDesignerMode(mode.id as DesignerMode)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                        designerMode === mode.id
                          ? 'border-primary bg-white text-primary shadow-xs ring-1 ring-primary'
                          : 'border-black/[0.08] bg-white/60 text-foregroundMuted hover:border-black/15'
                      }`}
                    >
                      <span className="text-xs font-bold">{mode.label}</span>
                      <span className="text-[11px] text-foregroundMuted mt-0.5">{mode.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 4: Inteligencia Artificial como Complemento Independiente */}
            <div className="rounded-2xl border border-primary/20 bg-[#F5F3FF] p-4.5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    onClick={() => setIncludeAI(!includeAI)}
                    className={`mt-0.5 flex h-5 w-5 cursor-pointer shrink-0 items-center justify-center rounded-md border ${
                      includeAI ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-white'
                    }`}
                  >
                    {includeAI && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-[#0F172A]">
                        Complemento de Inteligencia Artificial
                      </span>
                    </div>
                    <p className="text-xs text-foregroundMuted mt-1">
                      Generación y vectorización automática de ilustraciones con IA aplicables a prendas.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary shrink-0">+$19.900/mes</span>
              </div>
            </div>

          </div>

          {/* Lado Derecho: Resumen Transparente y Precio Dinámico */}
          <div className="flex flex-col justify-between border-t border-black/[0.06] bg-[#FAFBFD] p-6 sm:p-8 lg:border-t-0 lg:border-l">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foregroundMuted">
                Resumen de Selección
              </span>
              <p className="text-sm text-foregroundMuted mt-1">
                Perfil: <strong className="text-[#0F172A]">{role === 'store' ? 'Tienda' : 'Cliente'}</strong>
              </p>

              {/* Lista de conceptos seleccionados */}
              <div className="mt-5 space-y-3 border-t border-black/[0.06] pt-4 text-xs">
                {selectedTools.map((id) => {
                  const tool = TOOLS_CATALOG.find((t) => t.id === id);
                  if (!tool) return null;
                  let price = tool.monthlyPrice;
                  let label = tool.name;
                  if (tool.isDesigner) {
                    if (designerMode === 'basic') {
                      price = 14900;
                      label = 'Diseñador (Modo Básico)';
                    } else if (designerMode === 'advanced') {
                      price = 24900;
                      label = 'Diseñador (Modo Avanzado)';
                    } else {
                      price = 29900;
                      label = 'Diseñador (Básico + Avanzado)';
                    }
                  }
                  return (
                    <div key={id} className="flex justify-between items-center text-[#0F172A]">
                      <span className="truncate pr-2">{label}</span>
                      <span className="font-semibold shrink-0">${price.toLocaleString('es-CO')}</span>
                    </div>
                  );
                })}

                {includeAI && (
                  <div className="flex justify-between items-center text-primary font-medium">
                    <span>Complemento IA</span>
                    <span className="font-semibold">+${AI_ADDON_PRICE.toLocaleString('es-CO')}</span>
                  </div>
                )}

                {selectedTools.length === 0 && !includeAI && (
                  <p className="text-xs italic text-foregroundMuted">
                    Selecciona al menos una herramienta para ver el cálculo.
                  </p>
                )}
              </div>
            </div>

            {/* Total y CTA hacia registro / login real */}
            <div className="mt-8 border-t border-black/[0.08] pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-foregroundMuted">Total mensual:</span>
                <span className="text-3xl font-bold tracking-tight text-[#0F172A]">
                  ${totalPrice.toLocaleString('es-CO')}
                  <span className="text-xs font-normal text-foregroundMuted">/mes</span>
                </span>
              </div>
              <p className="text-[11px] text-foregroundMuted mt-1">
                Precios transparentes sin contratos de permanencia.
              </p>

              <div className="mt-5 space-y-2">
                <Link
                  to="/register"
                  onClick={onClose}
                  className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#503cd4] active:scale-[0.98]"
                >
                  <span>Continuar con mi plan</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-center text-xs font-medium text-foregroundMuted hover:text-foreground py-1"
                >
                  Seguir explorando
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CustomPlanModal;
