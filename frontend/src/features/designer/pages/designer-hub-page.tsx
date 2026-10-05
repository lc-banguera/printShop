import { ArrowRight, Palette, Shirt, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const designerOptions = [
  {
    id: 'customize',
    title: 'Diseñador 1',
    label: 'Personalizador de producto',
    description: 'Personaliza un producto existente, añade texturas, diseños y ajustes rápidos para guardar o comprar.',
    icon: Palette,
    primaryAction: '/designer/personalize',
    secondaryAction: '/products',
    keyPoints: ['Biblioteca de diseños', 'Diseños propios y comprados', 'Preparación para guardar o carrito'],
  },
  {
    id: 'build',
    title: 'Diseñador 2',
    label: 'Armador desde cero',
    description: 'Crea un producto nuevo desde la selección del artículo, configuración y revisión final.',
    icon: Shirt,
    primaryAction: '/designer/new',
    secondaryAction: '/designer/new',
    keyPoints: ['Seleccionar producto', 'Configurar detalles', 'Guardar, descargar o mandar a hacer'],
  },
  {
    id: 'graphic',
    title: 'Diseñador 3',
    label: 'Editor gráfico avanzado',
    description: 'Trabaja con lienzo, capas, imágenes y preparación profesional, con modo fácil para tareas rápidas.',
    icon: Sparkles,
    primaryAction: '/designer/advanced',
    secondaryAction: '/designer/easy',
    keyPoints: ['Modo fácil para preparación', 'Modo avanzado para edición total', 'Exportación y capas'],
  },
] as const;

export function DesignerHubPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#171421]">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 lg:px-10">
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-[#e9eaf4] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#5046e5]">PrintShop</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#171421] md:text-4xl">Elegí tu flujo de diseño</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-xl border border-[#e4e7f0] bg-[#f8f9fd] px-4 py-2 text-sm font-semibold text-[#171421] transition-colors hover:border-[#d5d9ed] hover:bg-[#eef1ff]"
            >
              Explorar productos
            </Link>
            <button
              type="button"
              onClick={() => navigate('/designer/advanced')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5046e5] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4539d3]"
            >
              Abrir editor avanzado
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {designerOptions.map(({ id, title, label, description, icon: Icon, primaryAction, secondaryAction, keyPoints }) => (
            <article
              key={id}
              className="flex min-h-[420px] flex-col rounded-[28px] border border-[#e8ebf6] bg-white p-6 shadow-[0_12px_24px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef1ff] text-[#5046e5]">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-[#f3f4f8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5e5d72]">
                  {title}
                </span>
              </div>

              <div className="mb-4">
                <h2 className="text-2xl font-extrabold tracking-tight text-[#171421]">{label}</h2>
              </div>

              <p className="mb-5 text-sm leading-6 text-[#5e5d72]">{description}</p>

              <ul className="space-y-2.5 text-sm text-[#171421]">
                {keyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#5046e5]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(primaryAction)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5046e5] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4539d3]"
                >
                  Abrir flujo
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to={secondaryAction}
                  className="inline-flex items-center justify-center rounded-xl border border-[#e5e7ef] bg-white px-4 py-3 text-sm font-semibold text-[#171421] transition-colors hover:border-[#d9dceb] hover:bg-[#f8f9fd]"
                >
                  {id === 'graphic' ? 'Ir a modo fácil' : 'Ver detalle'}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-dashed border-[#d8def4] bg-[#eef2ff] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5046e5]">Atajo rápido</p>
              <h3 className="mt-1 text-xl font-bold text-[#171421]">Listo para preparar una imagen en segundos</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/designer/easy"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#171421] shadow-sm transition-colors hover:bg-[#f8f9fd]"
              >
                Modo fácil
              </Link>
              <Link
                to="/designer/advanced"
                className="inline-flex items-center justify-center rounded-xl bg-[#171421] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2b2d42]"
              >
                Modo avanzado
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
