import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ArrowRight, Download, ImagePlus, Layers3, SlidersHorizontal, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { registerUploadedDesign, releaseUploadedDesign } from '../services/design-resources';

const presets = [
  {
    id: 'dtf',
    title: 'Preparar para DTF',
    description: 'Fondo limpio, semitransparencias controladas y color mejorado para impresión directa.',
    accent: 'Fácil',
  },
  {
    id: 'silk',
    title: 'Preparar para serigrafía',
    description: 'Ajuste de bordes, contraste y optimización para tinta sobre prenda.',
    accent: 'Prenda',
  },
  {
    id: 'vinyl',
    title: 'Preparar para vinilo',
    description: 'Márgenes más precisos y un contorno limpio para corte y aplicación.',
    accent: 'Corte',
  },
  {
    id: 'sublimation',
    title: 'Preparar para sublimación',
    description: 'Color vibrante y gradiente suave para soportes y textiles.',
    accent: 'Color',
  },
] as const;

const defaultPreview = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80';

export function DesignerEasyModePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState('dtf');
  const [imageSrc, setImageSrc] = useState(defaultPreview);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [showBeforeAfter, setShowBeforeAfter] = useState(true);

  useEffect(() => {
    if (!uploadedAssetId) return;
    return () => releaseUploadedDesign(uploadedAssetId);
  }, [uploadedAssetId]);

  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) ?? presets[0];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const asset = registerUploadedDesign(file);
    setUploadedAssetId(asset.id);
    setImageSrc(asset.image);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#171421]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-[#eaedf6] bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#5046e5]">Diseñador 3</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#171421] md:text-3xl">Modo fácil</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/designer/advanced" className="rounded-xl border border-[#e4e7f0] bg-white px-3 py-2 text-sm font-semibold text-[#171421] transition-colors hover:bg-[#f7f8ff]">
              Modo avanzado
            </Link>
            <button type="button" className="rounded-xl bg-[#5046e5] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4539d3]">
              Guardar
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className="rounded-[28px] border border-[#e8ebf6] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#5e5d72]">Preparar</h2>
              <Wand2 className="h-4 w-4 text-[#5046e5]" />
            </div>
            <div className="space-y-3">
              {presets.map((preset) => {
                const active = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                      active ? 'border-[#5046e5] bg-[#f4f2ff]' : 'border-[#e9ebf4] bg-[#fafbff] hover:border-[#dfe2f3] hover:bg-[#f3f6ff]'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-[#171421]">{preset.title}</p>
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#5046e5]">{preset.accent}</span>
                    </div>
                    <p className="text-xs leading-5 text-[#5e5d72]">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="rounded-[28px] border border-[#e8ebf6] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5e5d72]">Preparación rápida</p>
                <h2 className="mt-1 text-xl font-extrabold text-[#171421]">{selectedPreset.title}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e6f3] bg-[#f8f9ff] px-3 py-2 text-sm font-semibold text-[#171421] hover:bg-[#eef1ff]"
                >
                  <ImagePlus className="h-4 w-4" />
                  Subir imagen
                </button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5046e5] px-3 py-2 text-sm font-semibold text-white hover:bg-[#4539d3]">
                  <ArrowRight className="h-4 w-4" />
                  Aplicar
                </button>
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="rounded-[26px] border border-[#eaeef9] bg-gradient-to-br from-[#eef2ff] via-white to-[#f8edf8] p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5e5d72]">Vista previa</p>
                <button
                  type="button"
                  onClick={() => setShowBeforeAfter((current) => !current)}
                  className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#171421] shadow-sm"
                >
                  {showBeforeAfter ? 'Ocultar antes/después' : 'Mostrar antes/después'}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="overflow-hidden rounded-[22px] border border-white/70 bg-white p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5e5d72]">Antes</p>
                  <img src={imageSrc} alt="Imagen de entrada" className="h-[380px] w-full rounded-[16px] object-cover" />
                </div>
                <div className="overflow-hidden rounded-[22px] border border-[#dfe3f4] bg-[#171421] p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Después</p>
                  <div className="relative h-[380px] overflow-hidden rounded-[16px]">
                    <img src={imageSrc} alt="Resultado preparado" className="h-full w-full object-cover grayscale-[0.2] contrast-110 brightness-105 saturate-120" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(255,255,255,0.1)_30%,_rgba(0,0,0,0.34)_100%)]" />
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="rounded-[28px] border border-[#e8ebf6] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#5e5d72]">Ajustes rápidos</h2>
              <SlidersHorizontal className="h-4 w-4 text-[#5046e5]" />
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[#eceff7] bg-[#fafbff] p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5e5d72]">Proceso</p>
                <div className="mt-3 space-y-2 text-sm text-[#171421]">
                  {['Fondo eliminado', 'Semitransparencias', 'Semitono', 'Color mejorado'].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                      <span>{item}</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#eceff7] bg-[#fafbff] p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5e5d72]">Herramientas</p>
                <div className="mt-3 grid gap-2">
                  {[
                    { label: 'Eliminar fondo', icon: Sparkles },
                    { label: 'Mejorar contraste', icon: Layers3 },
                    { label: 'Exportar', icon: Download },
                  ].map(({ label, icon: Icon }) => (
                    <button key={label} type="button" className="flex items-center justify-between rounded-xl border border-[#e5e8f2] bg-white px-3 py-2 text-sm font-medium text-[#171421] hover:bg-[#f4f6ff]">
                      <span>{label}</span>
                      <Icon className="h-4 w-4 text-[#5e5d72]" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#eceff7] bg-[#f5f3ff] p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5046e5]">Salida</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#171421]">PNG listo para impresión</p>
                    <p className="text-xs text-[#5e5d72]">300 DPI · Transparente</p>
                  </div>
                  <Download className="h-4 w-4 text-[#5046e5]" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
