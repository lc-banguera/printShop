import * as React from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  Mail,
  MessageSquare,
  PlaySquare,
  Search,
  Sparkles,
  User,
  Wrench,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { customerIconButtonClass } from "./customer-ui";

// ── Tipos y Datos de Soporte ────────────────────────────────────────────────
interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

interface FaqItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  isPopular?: boolean;
}

interface PopularResource {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  modalContent: {
    subtitle: string;
    steps: string[];
  };
}

const helpCategories: HelpCategory[] = [
  {
    id: "designs",
    title: "Diseños y archivos",
    description:
      "Formatos, subida de archivos, biblioteca y requisitos de impresión.",
    icon: ImageIcon,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
  {
    id: "tools",
    title: "Herramientas de diseño",
    description: "Lienzo, modo fácil y avanzado, herramientas y exportación.",
    icon: Wrench,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
  {
    id: "templates",
    title: "Plantillas y recursos",
    description: "Cómo encontrar y usar plantillas, gráficos e ilustraciones.",
    icon: LayoutGrid,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
  {
    id: "account",
    title: "Cuenta y membresía",
    description: "Perfil, acceso, plan y gestión de tu cuenta.",
    icon: User,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
];

const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    categoryId: "designs",
    question: "¿Qué formatos de archivo puedo subir?",
    answer:
      "Puedes cargar formatos compatibles como PNG, JPG y SVG. Te recomendamos usar imágenes en alta resolución y sin fondos semitransparentes para obtener mejores resultados en impresión.",
    isPopular: true,
  },
  {
    id: "faq-2",
    categoryId: "tools",
    question: "¿Cómo abro el diseñador?",
    answer:
      "Puedes acceder al Diseñador directamente desde la opción 'Diseñador' en la barra lateral o abriendo cualquiera de tus creaciones guardadas en 'Mis diseños'. Dispones del modo fácil para personalizaciones ágiles y el modo avanzado para control total de capas y resolución a 300 DPI.",
  },
  {
    id: "faq-3",
    categoryId: "designs",
    question: "¿Dónde encuentro mis diseños guardados?",
    answer:
      "Todos tus archivos cargados y composiciones de lienzo se guardan en tu biblioteca personal en la sección 'Mis diseños'. Desde allí puedes inspeccionar su tamaño, organizarlos, duplicarlos o abrirlos nuevamente en el editor.",
  },
  {
    id: "faq-4",
    categoryId: "designs",
    question: "¿Cómo preparo un archivo para impresión?",
    answer:
      "Para una estampación textil óptima en DTF o serigrafía, asegúrate de que tu archivo cuente con una resolución mínima de 300 DPI al tamaño real de impresión, perfiles de color adecuados y textos o trazados trazados en vectores o mapa de bits nítido.",
  },
];

const popularResources: PopularResource[] = [
  {
    id: "res-1",
    title: "Guía de formatos",
    description: "PNG, JPG y SVG",
    icon: FileText,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    modalContent: {
      subtitle: "Requisitos técnicos para archivos de impresión",
      steps: [
        "PNG: Ideal para estampados con fondo transparente y detalles fotográficos.",
        "SVG: Formato vectorial recomendado para logotipos y tipografías a cualquier escala.",
        "JPG: Útil para fotografías de alta resolución sin transparencias.",
        "Resolución recomendada: 300 DPI al 100% de la escala de impresión.",
      ],
    },
  },
  {
    id: "res-2",
    title: "Cómo usar el diseñador",
    description: "Video paso a paso",
    icon: PlaySquare,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    modalContent: {
      subtitle: "Guía rápida de flujo en el Diseñador PrintShop",
      steps: [
        "Paso 1: Elige tu prenda o producto base en el catálogo o abre un lienzo en blanco.",
        "Paso 2: Arrastra tu logotipo o gráfico a la zona imprimible delimitada.",
        "Paso 3: Utiliza las herramientas de alineación, rotación y escala para calibrar la posición.",
        "Paso 4: Revisa la vista previa en maqueta y confirma tu diseño listo para producción.",
      ],
    },
  },
  {
    id: "res-3",
    title: "Preparación para DTF",
    description: "Recomendaciones de impresión",
    icon: ImageIcon,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    modalContent: {
      subtitle: "Optimización para tecnología Direct to Film (DTF)",
      steps: [
        "Elimina halos o píxeles semitransparentes en los bordes de la imagen.",
        "Asegúrate de que los trazos finos tengan un grosor mínimo de 0.5 mm.",
        "Trabaja en modo RGB para preservar la viveza de los colores en estampación textil.",
      ],
    },
  },
  {
    id: "res-4",
    title: "Plantillas gratuitas",
    description: "Recursos creativos",
    icon: BookOpen,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    modalContent: {
      subtitle: "Biblioteca de recursos y guías creativas",
      steps: [
        "Explora patrones y vectores listos para usar en camisetas, sudaderas y bolsas.",
        "Descarga plantillas con guías de corte y sangrado para diversos artículos.",
        "Aplica las composiciones directamente en el editor sin costo adicional.",
      ],
    },
  },
];

// ── Ilustración Vectorial Fiel del Hero ───────────────────────────────────────
function SupportHeroIllustration() {
  return (
    <div className="relative flex h-[180px] w-[320px] shrink-0 items-center justify-center">
      <svg
        viewBox="0 0 320 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full select-none"
        aria-hidden="true"
      >
        {/* Sombra base */}
        <ellipse
          cx="160"
          cy="162"
          rx="130"
          ry="14"
          fill="#E2E8F0"
          fillOpacity="0.6"
        />

        {/* Hojas decorativas botánicas a la izquierda */}
        <path
          d="M48 140C44 122 56 108 72 104C70 120 62 136 48 140Z"
          fill="#94A3B8"
          fillOpacity="0.4"
        />
        <path
          d="M62 145C68 132 82 126 94 128C88 139 76 146 62 145Z"
          fill="#64748B"
          fillOpacity="0.4"
        />

        {/* Laptop base */}
        <rect x="80" y="70" width="160" height="92" rx="8" fill="#1E293B" />
        <rect x="85" y="75" width="150" height="80" rx="5" fill="#0F172A" />
        <rect x="70" y="156" width="180" height="8" rx="4" fill="#94A3B8" />
        <rect x="145" y="156" width="30" height="2.5" rx="1" fill="#CBD5E1" />

        {/* Pantalla laptop con interfaz de diseño */}
        <rect x="92" y="82" width="55" height="4" rx="2" fill="#6366F1" />
        <rect x="92" y="90" width="70" height="2" rx="1" fill="#334155" />
        <rect x="92" y="95" width="60" height="2" rx="1" fill="#334155" />
        <rect x="92" y="100" width="40" height="2" rx="1" fill="#334155" />
        <rect x="92" y="112" width="75" height="35" rx="4" fill="#1E293B" />
        <circle cx="106" cy="126" r="6" fill="#6366F1" />
        <rect x="116" y="123" width="42" height="3" rx="1.5" fill="#94A3B8" />
        <rect x="116" y="128" width="30" height="2" rx="1" fill="#475569" />

        {/* Hoja de documento superpuesta (inclinada) */}
        <g transform="rotate(-6 195 90)">
          <rect
            x="160"
            y="42"
            width="82"
            height="104"
            rx="8"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            filter="drop-shadow(0px 8px 16px rgba(15, 23, 42, 0.08))"
          />
          <rect x="172" y="54" width="46" height="4" rx="2" fill="#CBD5E1" />
          <rect x="172" y="62" width="58" height="2.5" rx="1" fill="#E2E8F0" />
          <rect x="172" y="68" width="50" height="2.5" rx="1" fill="#E2E8F0" />
          <rect x="172" y="74" width="38" height="2.5" rx="1" fill="#E2E8F0" />
        </g>

        {/* Tarjeta frontal con marco de arte/montañas */}
        <g transform="rotate(4 215 105)">
          <rect
            x="176"
            y="56"
            width="78"
            height="86"
            rx="8"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            filter="drop-shadow(0px 10px 20px rgba(15, 23, 42, 0.12))"
          />
          {/* Arte de montaña estilizado en el marco */}
          <rect x="184" y="64" width="62" height="52" rx="4" fill="#F8FAFC" />
          <path
            d="M188 108L198 90L208 104L218 84L234 108H188Z"
            fill="#F97316"
          />
          <path d="M206 108L216 92L228 108H206Z" fill="#0284C7" />
          <circle cx="230" cy="74" r="5" fill="#F59E0B" />
          <rect x="184" y="122" width="40" height="3" rx="1.5" fill="#94A3B8" />
          <rect x="184" y="128" width="24" height="2" rx="1" fill="#CBD5E1" />
        </g>

        {/* Globo flotante morado con signo de interrogación '?' */}
        <g filter="drop-shadow(0px 6px 12px rgba(99, 102, 241, 0.3))">
          <circle cx="258" cy="52" r="16" fill="#6366F1" />
          <text
            x="258"
            y="58"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            ?
          </text>
        </g>
      </svg>
    </div>
  );
}

// ── Ilustración Vectorial del Panel de Asistencia ────────────────────────────
function AssistanceCardIllustration() {
  return (
    <div className="relative mx-auto flex h-[120px] w-[180px] items-center justify-center">
      <svg
        viewBox="0 0 180 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full select-none"
        aria-hidden="true"
      >
        {/* Sombra base */}
        <ellipse
          cx="90"
          cy="110"
          rx="70"
          ry="8"
          fill="#E2E8F0"
          fillOpacity="0.6"
        />

        {/* Hojas suaves laterales */}
        <path
          d="M32 94C28 80 38 68 50 64C48 78 40 90 32 94Z"
          fill="#94A3B8"
          fillOpacity="0.4"
        />

        {/* Documento base trasero */}
        <rect
          x="52"
          y="24"
          width="74"
          height="82"
          rx="7"
          fill="#F1F5F9"
          stroke="#E2E8F0"
          strokeWidth="1"
        />

        {/* Documento frontal blanco */}
        <rect
          x="60"
          y="18"
          width="76"
          height="88"
          rx="8"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1.5"
          filter="drop-shadow(0px 6px 14px rgba(15, 23, 42, 0.08))"
        />
        {/* Líneas simuladas de texto */}
        <rect x="70" y="32" width="40" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="70" y="40" width="54" height="2.5" rx="1" fill="#E2E8F0" />
        <rect x="70" y="47" width="48" height="2.5" rx="1" fill="#E2E8F0" />
        <rect x="70" y="54" width="38" height="2.5" rx="1" fill="#E2E8F0" />

        {/* Globo morado de ayuda '?' */}
        <g filter="drop-shadow(0px 4px 10px rgba(99, 102, 241, 0.35))">
          <circle cx="132" cy="48" r="16" fill="#6366F1" />
          <text
            x="132"
            y="54"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            ?
          </text>
        </g>
      </svg>
    </div>
  );
}

// ── Componente Principal de Soporte y Ayuda ─────────────────────────────────
export function CustomerSupportPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null,
  );
  const [expandedFaqId, setExpandedFaqId] = React.useState<string | null>(
    "faq-1",
  );
  const [showAllFaqs, setShowAllFaqs] = React.useState(false);
  const [activeModalResource, setActiveModalResource] =
    React.useState<PopularResource | null>(null);
  const [showContactModal, setShowContactModal] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  // Atajo de teclado Ctrl+K para enfocar la búsqueda
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtrado de FAQs según búsqueda y categoría seleccionada
  const filteredFaqs = React.useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return faqItems.filter((faq) => {
      const matchesCategory =
        !selectedCategory || faq.categoryId === selectedCategory;
      const matchesSearch =
        !term ||
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ── 1. Título y Encabezado de Página ──────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
            Soporte y ayuda
          </h1>
        </div>
        <p className="text-xs text-slate-500 sm:text-sm">
          Encuentra respuestas sobre tus diseños, archivos y herramientas de
          PrintShop.
        </p>
      </div>

      {/* ── 2. Hero de Búsqueda de Ayuda ──────────────────────────────────── */}
      <section
        aria-label="Búsqueda de ayuda"
        className="flex flex-col items-center justify-between rounded-[5px] border border-slate-200 bg-white p-6 shadow-xs sm:p-8 lg:flex-row"
      >
        <div className="w-full max-w-xl">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            ¿En qué podemos ayudarte?
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Busca artículos, guías y respuestas sobre el uso de PrintShop.
          </p>

          <div className="relative mt-5 w-full">
            <Search
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busca una pregunta, herramienta o tema..."
              className="h-11 w-full rounded-[5px] border border-slate-200 bg-white pl-10 pr-20 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 sm:text-sm"
              aria-label="Campo de búsqueda de soporte"
            />
          </div>
        </div>

        {/* Ilustración de Ayuda */}
        <div className="mt-6 flex shrink-0 justify-center lg:mt-0">
          <SupportHeroIllustration />
        </div>
      </section>

      {/* ── 3. Temas de Ayuda: Cuatro Tarjetas Horizontales ────────────────── */}
      <section aria-labelledby="temas-ayuda-heading" className="space-y-3">
        <div>
          <h2
            id="temas-ayuda-heading"
            className="text-base font-bold text-slate-900 sm:text-lg"
          >
            Temas de ayuda
          </h2>
          <p className="text-xs text-slate-500">
            Explora las categorías más comunes para encontrar la información que
            necesitas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {helpCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={cn(
                  "group flex items-center justify-between rounded-[16px] border bg-white p-4 text-left shadow-xs transition-all duration-150 hover:border-[#6366F1]/50 active:scale-[0.99]",
                  isSelected
                    ? "border-[#6366F1] ring-2 ring-[#6366F1]/15"
                    : "border-slate-200",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]",
                      cat.iconBg,
                      cat.iconColor,
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 pr-1">
                    <h3 className="truncate text-xs font-bold text-slate-900 sm:text-[13px]">
                      {cat.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5",
                    isSelected ? "text-[#6366F1]" : "text-slate-400",
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 4. Preguntas Frecuentes y Panel de Asistencia (2 Columnas) ─────── */}
      <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
        {/* Columna Izquierda: FAQ Acordeón */}
          <div className="rounded-[5px] border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Preguntas frecuentes
            </h2>
            <button
              type="button"
              onClick={() => setShowAllFaqs((prev) => !prev)}
              className="inline-flex text-xs font-semibold text-slate-700 transition-colors hover:text-slate-950"
            >
              <span>{showAllFaqs ? "Ver menos" : "Ver todas"}</span>
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;

              return (
                <div key={faq.id} className="py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between gap-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                          "bg-slate-100 text-slate-400",
                        )}
                      >
                        <Info className="h-3.5 w-3.5" />
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold sm:text-sm",
                          isExpanded
                            ? "text-slate-900 font-bold"
                            : "text-slate-700",
                        )}
                      >
                        {faq.question}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-[#6366F1]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 rounded-xl bg-slate-50/90 p-3.5 text-xs leading-relaxed text-slate-600 animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No se encontraron preguntas para el criterio actual.
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Panel de Asistencia */}
        <div className="flex flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <AssistanceCardIllustration />

            <div className="mt-3 text-center sm:text-left">
              <h3 className="text-base font-bold text-slate-900">
                ¿Sigues necesitando ayuda?
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Consulta las opciones de asistencia disponibles para tu cuenta.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="mt-5 inline-flex h-[42px] w-full items-center justify-center rounded-[5px] bg-slate-900 px-4 text-xs font-bold text-white shadow-xs transition-all duration-150 hover:bg-slate-700 active:scale-[0.98]"
          >
            <span>Ver opciones de ayuda</span>
          </button>
        </div>
      </section>

      {/* ── 5. Recursos Populares: Cuatro Tarjetas en una Fila ────────────── */}
      <section
        aria-labelledby="recursos-populares-heading"
        className="space-y-3"
      >
        <div>
          <h2
            id="recursos-populares-heading"
            className="text-base font-bold text-slate-900 sm:text-lg"
          >
            Recursos populares
          </h2>
          <p className="text-xs text-slate-500">
            Accede rápidamente a las guías más consultadas por otros usuarios.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {popularResources.map((res) => {
            const Icon = res.icon;
            return (
              <button
                key={res.id}
                type="button"
                onClick={() => setActiveModalResource(res)}
                className="group flex items-center justify-between rounded-[16px] border border-slate-200 bg-white p-4 text-left shadow-xs transition-all duration-150 hover:border-[#6366F1]/50 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]",
                      res.iconBg,
                      res.iconColor,
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 pr-1">
                    <h3 className="truncate text-xs font-bold text-slate-900 sm:text-[13px]">
                      {res.title}
                    </h3>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {res.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Modales de Ayuda Funcionales (Apple Design) ───────────────────── */}
      {/* Modal de Recurso Educativo */}
      {activeModalResource && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
          onClick={() => setActiveModalResource(null)}
        >
          <div
            className="relative w-full max-w-md rounded-[5px] border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    activeModalResource.iconBg,
                    activeModalResource.iconColor,
                  )}
                >
                  <activeModalResource.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeModalResource.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeModalResource.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalResource(null)}
                className={cn(customerIconButtonClass, "h-7 w-7")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              <p className="text-xs font-semibold text-slate-700">
                {activeModalResource.modalContent.subtitle}
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                {activeModalResource.modalContent.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#6366F1] mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalResource(null)}
                className="h-8 rounded-lg bg-slate-100 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Opciones de Asistencia */}
      {showContactModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[20px] border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Opciones de asistencia
              </h3>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className={cn(customerIconButtonClass, "h-7 w-7")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-[5px] border border-slate-200 p-3.5 text-left">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  <span>Centro de documentación y guías</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Explora manuales técnicos sobre resolución de impresión,
                  preparación de vectores y uso del Diseñador.
                </p>
              </div>

              <div className="rounded-[5px] border border-slate-200 p-3.5 text-left">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span>Ticket de consulta de cuenta</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Para consultas sobre pedidos específicos o tu membresía,
                  puedes revisar el estado desde 'Mis pedidos' o escribirnos
                  directamente.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="h-[42px] rounded-[5px] bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-700"
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

export default CustomerSupportPage;
