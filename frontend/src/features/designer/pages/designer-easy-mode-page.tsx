import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ArrowRight, Download, ImagePlus, Layers3, SlidersHorizontal, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { processArtworkImage } from '@/core/design/processing';
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
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [processedDimensions, setProcessedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [showBeforeAfter, setShowBeforeAfter] = useState(true);
  const processingRequestId = useRef(0);
  const processedImageUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!uploadedAssetId) return;
    return () => releaseUploadedDesign(uploadedAssetId);
  }, [uploadedAssetId]);

  useEffect(
    () => () => {
      processingRequestId.current += 1;
      if (processedImageUrlRef.current) {
        URL.revokeObjectURL(processedImageUrlRef.current);
      }
    },
    [],
  );

  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) ?? presets[0];

  const replaceProcessedImage = (url: string | null) => {
    if (processedImageUrlRef.current) {
      URL.revokeObjectURL(processedImageUrlRef.current);
    }
    processedImageUrlRef.current = url;
    setProcessedImageUrl(url);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const asset = registerUploadedDesign(file);
      processingRequestId.current += 1;
      replaceProcessedImage(null);
      setProcessedDimensions(null);
      setIsProcessing(false);
      setProcessingError(null);
      setSourceFile(file);
      setUploadedAssetId(asset.id);
      setImageSrc(asset.image);
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : 'No se pudo cargar la imagen.');
    } finally {
      event.currentTarget.value = '';
    }
  };

  const handleImproveContrast = async () => {
    if (!sourceFile || isProcessing) return;

    const requestId = ++processingRequestId.current;
    setIsProcessing(true);
    setProcessingError(null);

    try {
      const result = await processArtworkImage(sourceFile, { contrast: 110 });
      const resultUrl = URL.createObjectURL(result.blob);
      if (requestId !== processingRequestId.current) {
        URL.revokeObjectURL(resultUrl);
        return;
      }

      replaceProcessedImage(resultUrl);
      setProcessedDimensions({ width: result.width, height: result.height });
    } catch (error) {
      if (requestId === processingRequestId.current) {
        setProcessingError(error instanceof Error ? error.message : 'No se pudo procesar la imagen.');
      }
    } finally {
      if (requestId === processingRequestId.current) {
        setIsProcessing(false);
      }
    }
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
            <button
              type="button"
              disabled
              title="El guardado requiere persistencia, aún no disponible."
              className="rounded-xl bg-[#5046e5] px-3 py-2 text-sm font-semibold text-white opacity-50"
            >
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
                <button
                  type="button"
                  disabled
                  title="Los perfiles no tienen transformaciones reales definidas."
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5046e5] px-3 py-2 text-sm font-semibold text-white opacity-50"
                >
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
                    <img
                      src={processedImageUrl ?? imageSrc}
                      alt={processedImageUrl ? 'Resultado con contraste procesado' : 'Vista previa visual, sin procesamiento aplicado'}
                      className={`h-full w-full object-cover ${processedImageUrl ? '' : 'grayscale-[0.2] contrast-110 brightness-105 saturate-120'}`}
                    />
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
                  {[
                    { label: 'Fondo eliminado', status: 'No disponible', complete: false },
                    { label: 'Semitransparencias', status: 'No procesado', complete: false },
                    { label: 'Semitono', status: 'No procesado', complete: false },
                    { label: 'Color mejorado', status: processedImageUrl ? 'Procesado' : 'Pendiente', complete: Boolean(processedImageUrl) },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                      <span>{item.label}</span>
                      <span className="flex items-center gap-2 text-xs text-foregroundMuted">
                        {item.status}
                        <span className={`h-2.5 w-2.5 rounded-full ${item.complete ? 'bg-success' : 'bg-foregroundSubtle'}`} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#eceff7] bg-[#fafbff] p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5e5d72]">Herramientas</p>
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    disabled
                    title="El servicio real de eliminación de fondo no está disponible."
                    className="flex cursor-not-allowed items-center justify-between rounded-xl border border-[#e5e8f2] bg-white px-3 py-2 text-left text-sm font-medium text-[#171421] opacity-50"
                  >
                    <span>Eliminar fondo</span>
                    <Sparkles className="h-4 w-4 text-[#5e5d72]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleImproveContrast}
                    disabled={!sourceFile || isProcessing}
                    title={!sourceFile ? 'Sube una imagen para procesar el contraste.' : undefined}
                    className="flex items-center justify-between rounded-xl border border-[#e5e8f2] bg-white px-3 py-2 text-left text-sm font-medium text-[#171421] hover:bg-[#f4f6ff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>{isProcessing ? 'Procesando contraste…' : 'Mejorar contraste'}</span>
                    <Layers3 className="h-4 w-4 text-[#5e5d72]" />
                  </button>
                  <button
                    type="button"
                    disabled
                    title="La exportación de producción se habilitará con el motor de producción."
                    className="flex cursor-not-allowed items-center justify-between rounded-xl border border-[#e5e8f2] bg-white px-3 py-2 text-left text-sm font-medium text-[#171421] opacity-50"
                  >
                    <span>Exportar</span>
                    <Download className="h-4 w-4 text-[#5e5d72]" />
                  </button>
                </div>
                <p className="mt-3 text-xs leading-5 text-foregroundMuted">
                  Solo el ajuste de contraste procesa la imagen subida. Los perfiles, la eliminación de fondo y la exportación de producción aún no están conectados.
                </p>
                {isProcessing && <p role="status" className="mt-2 text-xs text-foregroundMuted">Procesando en segundo plano…</p>}
                {processingError && <p role="alert" className="mt-2 text-xs text-danger">{processingError}</p>}
              </div>

              <div className="rounded-2xl border border-[#eceff7] bg-[#f5f3ff] p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5046e5]">Salida</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#171421]">
                      {processedDimensions
                        ? `PNG procesado · ${processedDimensions.width} × ${processedDimensions.height} px`
                        : 'Sin salida de producción'}
                    </p>
                    <p className="text-xs text-[#5e5d72]">No se ha verificado resolución de 300 DPI.</p>
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
