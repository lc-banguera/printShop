import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  Check,
  ChevronDown,
  CloudUpload,
  Download,
  Eye,
  Focus,
  Hand,
  ImagePlus,
  Layers,
  Link2,
  LayoutGrid,
  Maximize,
  MoreVertical,
  Redo2,
  Shapes,
  Shirt,
  Sparkles,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { processArtworkImage } from '@/core/design/processing';
import { registerUploadedDesign, releaseUploadedDesign } from '../services/design-resources';

type CanvasBackground = 'transparent' | 'white' | 'color';

interface EasyCanvasSettings {
  widthCm: string;
  heightCm: string;
  dpi: number;
  background: CanvasBackground;
  backgroundColor: string;
}

interface CanvasConfigState {
  widthPx: number;
  heightPx: number;
  dpi: number;
  background: CanvasBackground;
  backgroundColor: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readCanvasConfig(locationState: unknown): CanvasConfigState | null {
  if (!isRecord(locationState) || !isRecord(locationState.newCanvasConfig)) return null;
  const config = locationState.newCanvasConfig;
  const isBackground = (value: unknown): value is CanvasBackground =>
    value === 'transparent' || value === 'white' || value === 'color';

  if (
    typeof config.widthPx !== 'number' ||
    typeof config.heightPx !== 'number' ||
    typeof config.dpi !== 'number' ||
    !isBackground(config.background) ||
    typeof config.backgroundColor !== 'string'
  ) {
    return null;
  }

  return {
    widthPx: config.widthPx,
    heightPx: config.heightPx,
    dpi: config.dpi,
    background: config.background,
    backgroundColor: config.backgroundColor,
  };
}

function createInitialCanvasSettings(locationState: unknown): EasyCanvasSettings {
  const config = readCanvasConfig(locationState);
  const dpi = config?.dpi ?? 300;
  const widthCm = config ? (config.widthPx / dpi) * 2.54 : (3000 / dpi) * 2.54;
  const heightCm = config ? (config.heightPx / dpi) * 2.54 : (3000 / dpi) * 2.54;

  return {
    widthCm: Number(widthCm.toFixed(1)).toString(),
    heightCm: Number(heightCm.toFixed(1)).toString(),
    dpi,
    background: config?.background ?? 'transparent',
    backgroundColor: config?.backgroundColor ?? '#ffffff',
  };
}

const backgroundOptions: { id: CanvasBackground; label: string }[] = [
  { id: 'transparent', label: 'Fondo transparente' },
  { id: 'white', label: 'Fondo blanco' },
  { id: 'color', label: 'Color de fondo configurado' },
];

const unavailableTools = [
  { label: 'Plantillas', icon: LayoutGrid },
  { label: 'Elementos', icon: Shapes },
  { label: 'Texto', icon: Type },
  { label: 'Formas', icon: Shapes },
  { label: 'Capas', icon: Layers },
];

function getCanvasColor(settings: EasyCanvasSettings): string {
  if (settings.background === 'white') return '#ffffff';
  if (settings.background === 'color') return settings.backgroundColor;
  return 'transparent';
}

function createRulerMarks(lengthCm: number): number[] {
  const marks: number[] = [];
  for (let mark = 0; mark <= lengthCm && mark <= 1000; mark += 10) marks.push(mark);
  if (marks[marks.length - 1] !== lengthCm) marks.push(lengthCm);
  return marks;
}

export function DesignerEasyModePage() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [technique, setTechnique] = useState('dtf');
  const [canvasSettings, setCanvasSettings] = useState(() => createInitialCanvasSettings(location.state));
  const [keepRatio, setKeepRatio] = useState(false);
  const [canvasRatio, setCanvasRatio] = useState(
    () => Number(canvasSettings.widthCm) / Math.max(0.1, Number(canvasSettings.heightCm)),
  );
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [processedDimensions, setProcessedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [showProcessedImage, setShowProcessedImage] = useState(true);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const processingRequestId = useRef(0);
  const processedImageUrlRef = useRef<string | null>(null);
  const widthCm = Number(canvasSettings.widthCm) || 0;
  const heightCm = Number(canvasSettings.heightCm) || 0;
  const selectedImage = showProcessedImage && processedImageUrl ? processedImageUrl : imageSrc;
  const rulerWidthMarks = createRulerMarks(widthCm);
  const rulerHeightMarks = createRulerMarks(heightCm);

  useEffect(() => {
    if (!uploadedAssetId) return;
    return () => releaseUploadedDesign(uploadedAssetId);
  }, [uploadedAssetId]);

  useEffect(
    () => () => {
      processingRequestId.current += 1;
      if (processedImageUrlRef.current) URL.revokeObjectURL(processedImageUrlRef.current);
    },
    [],
  );

  const replaceProcessedImage = (url: string | null) => {
    if (processedImageUrlRef.current) URL.revokeObjectURL(processedImageUrlRef.current);
    processedImageUrlRef.current = url;
    setProcessedImageUrl(url);
  };

  const loadFile = (file: File) => {
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
      setShowProcessedImage(true);
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : 'No se pudo cargar la imagen.');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadFile(file);
    event.currentTarget.value = '';
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
      setShowProcessedImage(true);
    } catch (error) {
      if (requestId === processingRequestId.current) {
        setProcessingError(error instanceof Error ? error.message : 'No se pudo procesar la imagen.');
      }
    } finally {
      if (requestId === processingRequestId.current) setIsProcessing(false);
    }
  };

  const handleDimensionChange = (axis: 'widthCm' | 'heightCm', value: string) => {
    setCanvasSettings((current) => {
      const next = { ...current, [axis]: value };
      const parsedValue = Number(value);
      if (!keepRatio || !Number.isFinite(parsedValue) || parsedValue <= 0) return next;
      if (axis === 'widthCm') next.heightCm = (parsedValue / canvasRatio).toFixed(1);
      else next.widthCm = (parsedValue * canvasRatio).toFixed(1);
      return next;
    });
  };

  const handleRatioToggle = () => {
    if (!keepRatio && widthCm > 0 && heightCm > 0) setCanvasRatio(widthCm / heightCm);
    setKeepRatio((current) => !current);
  };

  const handleDpiChange = (value: string) => {
    const dpi = Number.parseInt(value, 10);
    if (Number.isFinite(dpi) && dpi >= 72 && dpi <= 2400) {
      setCanvasSettings((current) => ({ ...current, dpi }));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
    const file = event.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const canvasAspectRatio = Math.max(0.01, widthCm / Math.max(0.1, heightCm));
  const canvasFrameStyle = {
    aspectRatio: `${Math.max(1, widthCm)} / ${Math.max(1, heightCm)}`,
    width: `min(100%, calc((100vh - 128px) * ${canvasAspectRatio}))`,
    maxHeight: 'calc(100vh - 128px)',
  };
  const canvasStyle = {
    backgroundColor: getCanvasColor(canvasSettings),
    backgroundImage:
      canvasSettings.background === 'transparent'
        ? 'linear-gradient(45deg, #e4e6eb 25%, transparent 25%), linear-gradient(-45deg, #e4e6eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e6eb 75%), linear-gradient(-45deg, transparent 75%, #e4e6eb 75%)'
        : undefined,
    backgroundSize: canvasSettings.background === 'transparent' ? '20px 20px' : undefined,
    backgroundPosition: canvasSettings.background === 'transparent' ? '0 0, 0 10px, 10px -10px, -10px 0px' : undefined,
  };

  return (
    <div className="flex h-screen max-h-screen w-screen max-w-[100vw] flex-col overflow-hidden bg-[#f3f4f6] font-sans text-[#171923]">
      <header className="z-20 flex h-16 min-h-16 shrink-0 flex-nowrap items-center gap-3 overflow-x-auto border-b border-[#e7e8ec] bg-white px-4 py-2">
        <Link to="/designer/easy" aria-label="PrintShop, modo básico" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#5848f4] text-lg font-semibold text-white shadow-sm">P</span>
          <span className="text-[18px] font-semibold tracking-[-0.04em] text-[#151720]">PrintShop</span>
        </Link>

        <nav aria-label="Menú del editor" className="hidden shrink-0 items-center gap-4 text-sm font-medium text-[#596070] md:flex">
          <span>Archivo</span>
          <span>Editar</span>
          <span>Ver</span>
        </nav>

        <label className="relative mx-auto flex h-11 w-[210px] shrink-0 items-center gap-2 rounded-[12px] border border-[#e1e3e9] bg-white px-3">
          <Shirt className="h-5 w-5 shrink-0 text-[#5146f5]" strokeWidth={2} />
          <span className="min-w-0 flex-1">
            <span className="block whitespace-nowrap text-[10px] leading-3 text-[#9298a5]">Técnica de estampado</span>
            <select
              aria-label="Técnica de estampado"
              value={technique}
              onChange={(event) => setTechnique(event.target.value)}
              className="w-full appearance-none bg-transparent text-sm font-semibold leading-4 text-[#171923] outline-none"
            >
              <option value="dtf">DTF</option>
            </select>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#171923]" />
        </label>

        <div className="flex shrink-0 items-center gap-1">
          <button type="button" disabled aria-label="Deshacer no disponible" title="Deshacer no está disponible en Modo Básico." className="rounded-lg p-1.5 text-[#aeb2bd] disabled:cursor-not-allowed">
            <Undo2 className="h-5 w-5" />
          </button>
          <button type="button" disabled aria-label="Rehacer no disponible" title="Rehacer no está disponible en Modo Básico." className="rounded-lg p-1.5 text-[#aeb2bd] disabled:cursor-not-allowed">
            <Redo2 className="h-5 w-5" />
          </button>
          <button type="button" disabled aria-label="Zoom al 100%" className="ml-1 flex h-9 items-center gap-2 rounded-full border border-[#e7e8ed] px-3 text-sm font-medium text-[#626977] opacity-70">
            <Focus className="h-4 w-4" />
            100%
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" disabled aria-label="Herramienta mano no disponible" title="La navegación de lienzo no está disponible en Modo Básico." className="rounded-full border border-[#e7e8ed] p-2 text-[#aeb2bd] disabled:cursor-not-allowed">
            <Hand className="h-5 w-5" />
          </button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled
            title="La exportación todavía no está disponible."
            className="flex h-9 items-center gap-2 whitespace-nowrap rounded-[12px] border border-[#e7e8ed] bg-[#fafbfc] px-3 text-sm font-semibold text-[#171923] opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Descargar PNG
          </button>
          <button
            type="button"
            disabled
            title="La exportación todavía no está disponible."
            className="flex h-9 items-center gap-2 whitespace-nowrap rounded-[12px] bg-[#5848f4] px-3 text-sm font-semibold text-white opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Descargar PDF
          </button>
          <button type="button" disabled aria-label="Más opciones no disponible" className="hidden rounded-lg p-2 text-[#8c92a0] opacity-60 sm:block">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[60px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_minmax(160px,35vh)] lg:grid-cols-[76px_minmax(0,1fr)_320px] lg:grid-rows-1">
        <nav aria-label="Herramientas de Modo Básico" className="col-start-1 row-span-2 row-start-1 flex min-h-0 flex-col items-center gap-2 overflow-y-auto border-r border-[#e7e8ec] bg-white px-1.5 py-3 lg:px-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full shrink-0 flex-col items-center gap-1 rounded-[11px] bg-[#f1f0ff] px-1 py-2 text-[#5146f5]">
            <CloudUpload className="h-6 w-6" strokeWidth={2} />
            <span className="text-[11px] font-medium">Archivo</span>
          </button>
          {unavailableTools.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              disabled
              title={`${label} no está disponible en Modo Básico.`}
              className="flex w-full shrink-0 flex-col items-center gap-1 rounded-[11px] px-1 py-2 text-[#586071] opacity-80 disabled:cursor-not-allowed"
            >
              <Icon className="h-6 w-6" strokeWidth={1.8} />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          ))}
        </nav>

        <aside className="col-start-2 row-start-2 min-h-0 min-w-0 overflow-y-auto border-t border-[#e7e8ec] bg-white px-4 py-3 lg:col-start-3 lg:row-start-1 lg:border-l lg:border-t-0">
          <section>
            <h1 className="mb-4 text-[19px] font-semibold tracking-[-0.03em] text-[#171923]">Agregar imagen</h1>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDrop}
              className={`flex min-h-[222px] flex-col items-center justify-center rounded-[14px] border border-dashed px-4 py-5 text-center transition-colors ${
                isDraggingFile ? 'border-[#5146f5] bg-[#f6f5ff]' : 'border-[#d9dce4] bg-white'
              }`}
            >
              <CloudUpload className="mb-2 h-9 w-9 text-[#151923]" strokeWidth={1.7} />
              <p className="text-sm font-semibold text-[#171923]">{sourceFile ? sourceFile.name : 'Sube una imagen'}</p>
              <p className="mt-1 text-xs text-[#9096a4]">JPG, PNG o SVG (máx. 50MB)</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex h-11 items-center gap-2 rounded-[16px] border border-[#e0e3e9] bg-[#fafbfc] px-5 text-sm font-semibold text-[#171923] shadow-[0_1px_3px_rgba(20,24,40,0.04)] transition-colors hover:bg-[#f5f6f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5146f5]"
              >
                <ImagePlus className="h-4 w-4" />
                Seleccionar archivo
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {processingError && <p role="alert" className="mt-2 text-xs text-danger">{processingError}</p>}
            {sourceFile && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleImproveContrast}
                  disabled={isProcessing}
                  className="flex h-9 items-center gap-2 rounded-[12px] border border-[#e0e3e9] bg-white px-3 text-xs font-semibold text-[#282c36] hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-[#5146f5]" />
                  {isProcessing ? 'Procesando…' : 'Mejorar contraste'}
                </button>
                {processedImageUrl && (
                  <button
                    type="button"
                    onClick={() => setShowProcessedImage((current) => !current)}
                    aria-pressed={showProcessedImage}
                    className="flex h-9 items-center gap-2 rounded-[12px] border border-[#e0e3e9] bg-white px-3 text-xs font-semibold text-[#282c36] hover:bg-[#f7f8fa]"
                  >
                    <Eye className="h-4 w-4" />
                    {showProcessedImage ? 'Ver original' : 'Ver resultado'}
                  </button>
                )}
                {processedDimensions && (
                  <span className="w-full text-center text-xs text-[#697181]">
                    PNG procesado · {processedDimensions.width} × {processedDimensions.height} px
                  </span>
                )}
                {isProcessing && <span role="status" className="w-full text-center text-xs text-[#697181]">Procesando imagen en segundo plano…</span>}
              </div>
            )}
          </section>

          <section className="mt-6 border-t border-[#e8e9ed] pt-5">
            <h2 className="mb-5 text-[17px] font-semibold tracking-[-0.025em] text-[#171923]">Fondo del lienzo</h2>
            <div className="flex items-center gap-3">
              {backgroundOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={canvasSettings.background === option.id}
                  title={option.label}
                  onClick={() => setCanvasSettings((current) => ({ ...current, background: option.id }))}
                  className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5146f5] focus-visible:ring-offset-2 ${
                    canvasSettings.background === option.id ? 'border-[#5a4aff]' : 'border-[#eceef2]'
                  }`}
                >
                  <span
                    className={`h-[46px] w-[46px] rounded-full border border-[#e8e9ed] ${
                      option.id === 'transparent' ? 'bg-[linear-gradient(45deg,#e1e3e8_25%,transparent_25%),linear-gradient(-45deg,#e1e3e8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e1e3e8_75%),linear-gradient(-45deg,transparent_75%,#e1e3e8_75%)] [background-position:0_0,0_7px,7px_-7px,-7px_0] [background-size:14px_14px]' : ''
                    } ${option.id === 'white' ? 'bg-white' : ''}`}
                    style={option.id === 'color' ? { backgroundColor: canvasSettings.backgroundColor } : undefined}
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6 border-t border-[#e8e9ed] pt-5">
            <h2 className="mb-4 text-[17px] font-semibold tracking-[-0.025em] text-[#171923]">Lienzo</h2>
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <label className="min-w-0 text-xs text-[#717887]">
                Ancho (cm)
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={canvasSettings.widthCm}
                  onChange={(event) => handleDimensionChange('widthCm', event.target.value)}
                  className="mt-2 h-12 w-full rounded-[14px] border border-[#e0e3e9] bg-white px-3 text-sm font-medium text-[#171923] outline-none focus:border-[#6355f5] focus:ring-2 focus:ring-[#6355f5]/15"
                />
              </label>
              <button
                type="button"
                aria-label={keepRatio ? 'Desbloquear proporción' : 'Mantener proporción'}
                aria-pressed={keepRatio}
                onClick={handleRatioToggle}
                className={`mb-3 rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5146f5] ${
                  keepRatio ? 'text-[#5146f5]' : 'text-[#7f8695]'
                }`}
              >
                <Link2 className="h-5 w-5" />
              </button>
              <label className="min-w-0 text-xs text-[#717887]">
                Alto (cm)
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={canvasSettings.heightCm}
                  onChange={(event) => handleDimensionChange('heightCm', event.target.value)}
                  className="mt-2 h-12 w-full rounded-[14px] border border-[#e0e3e9] bg-white px-3 text-sm font-medium text-[#171923] outline-none focus:border-[#6355f5] focus:ring-2 focus:ring-[#6355f5]/15"
                />
              </label>
            </div>
            <label className="mt-5 block text-xs text-[#717887]">
              Resolución
              <span className="mt-2 grid grid-cols-[1fr_112px] gap-3">
                <input
                  type="number"
                  min="72"
                  max="2400"
                  value={canvasSettings.dpi}
                  onChange={(event) => handleDpiChange(event.target.value)}
                  className="h-12 min-w-0 rounded-[14px] border border-[#e0e3e9] bg-white px-3 text-sm font-medium text-[#171923] outline-none focus:border-[#6355f5] focus:ring-2 focus:ring-[#6355f5]/15"
                />
                <span className="flex h-12 items-center justify-between rounded-[14px] border border-[#e0e3e9] bg-white px-3 text-sm text-[#465063]">
                  DPI
                  <ChevronDown className="h-4 w-4" />
                </span>
              </span>
            </label>
          </section>

        </aside>

        <main aria-label="Área de trabajo del lienzo" className="col-start-2 row-start-1 flex min-h-0 min-w-0 flex-col overflow-hidden bg-[#f3f4f6]">
          <div className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden px-10 py-8 sm:px-12">
            <div className="relative flex shrink-0 items-center justify-center" style={canvasFrameStyle}>
              <div className="absolute -top-7 left-0 flex w-full justify-between text-[11px] text-[#727988]">
              <span>cm</span>
              {rulerWidthMarks.map((mark) => <span key={mark}>{mark}</span>)}
              </div>
              <div
                aria-hidden="true"
                className="absolute -top-4 left-0 h-2 w-full border-b border-[#b8bdc7]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, #858c99 0 1px, transparent 1px 12px)',
                  backgroundPosition: '0 bottom',
                  backgroundSize: '100% 7px',
                  backgroundRepeat: 'no-repeat',
                }}
              />

              <div className="absolute -left-7 top-0 flex h-full flex-col items-end justify-between pr-1 text-[11px] text-[#727988]">
                {rulerHeightMarks.map((mark) => <span key={mark}>{mark}</span>)}
              </div>
              <div
                aria-hidden="true"
                className="absolute -left-4 top-0 h-full w-2 border-r border-[#b8bdc7]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(180deg, #858c99 0 1px, transparent 1px 12px)',
                  backgroundPosition: 'right top',
                  backgroundSize: '7px 100%',
                  backgroundRepeat: 'no-repeat',
                }}
              />

              <div
                role="img"
                aria-label={`Lienzo ${widthCm} por ${heightCm} centímetros a ${canvasSettings.dpi} DPI`}
                className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden bg-white shadow-[0_3px_12px_rgba(26,30,43,0.12)]"
                style={canvasStyle}
              >
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt={processedImageUrl && showProcessedImage ? 'Imagen con contraste procesado' : 'Imagen subida al lienzo'}
                    className="h-full w-full select-none object-contain"
                    draggable={false}
                  />
                )}
              </div>
            </div>

            <div className="absolute right-3 top-3 z-10 flex flex-col items-center gap-1 rounded-[13px] bg-white p-1.5 shadow-[0_5px_18px_rgba(25,30,44,0.12)]">
              <button type="button" disabled aria-label="Ajustar lienzo a pantalla no disponible" title="Ajuste de viewport no disponible en Modo Básico." className="rounded-lg p-2.5 text-[#737a89] opacity-60 disabled:cursor-not-allowed">
                <Focus className="h-5 w-5" />
              </button>
              <button type="button" disabled aria-label="Acercar no disponible" className="rounded-lg p-2.5 text-[#252a35] opacity-60 disabled:cursor-not-allowed">
                <ZoomIn className="h-5 w-5" />
              </button>
              <button type="button" disabled aria-label="Alejar no disponible" className="rounded-lg p-2.5 text-[#252a35] opacity-60 disabled:cursor-not-allowed">
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="my-1 h-px w-6 bg-[#e8e9ed]" />
              <button type="button" disabled aria-label="Pantalla completa no disponible" className="rounded-lg p-2.5 text-[#252a35] opacity-60 disabled:cursor-not-allowed">
                <Maximize className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              disabled
              aria-label="Descargar resultado"
              title="La exportación de producción todavía no está disponible."
              className="absolute bottom-3 right-3 z-10 flex h-9 items-center gap-2 rounded-[11px] border border-[#e0e3e9] bg-white px-3 text-xs font-semibold text-[#707786] opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>

          <footer className="flex min-h-8 flex-wrap items-center justify-between gap-2 border-t border-[#e1e3e8] bg-white px-4 py-1.5 text-[10px] text-[#737a88]">
            <span>Designer 3 · Modo Básico</span>
            <span className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-[#4b9a76]" />
              {processedImageUrl ? 'Contraste procesado' : sourceFile ? 'Imagen cargada' : 'Listo para agregar imagen'}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
