import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import {
  ChevronDown,
  ChevronUp,
  CircleMinus,
  CloudUpload,
  Crosshair,
  Eye,
  Grid2X2,
  Hand,
  Layers,
  LayoutGrid,
  Link2,
  Maximize,
  MoreVertical,
  Redo2,
  Search,
  Shapes,
  Shirt,
  Sparkles,
  Type,
  Undo2,
  ZoomIn,
} from 'lucide-react';

import { Link, useLocation } from 'react-router-dom';

import { processArtworkImage } from '@/core/design/processing';
import { registerUploadedDesign, releaseUploadedDesign } from '../services/design-resources';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface BackgroundOption {
  id: string;
  label: string;
  background: CanvasBackground;
  color?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_WIDTH_CM = '58';
const DEFAULT_HEIGHT_CM = '100';

const TICK_COLOR = '#b0b4bc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

  if (!config) {
    return {
      widthCm: DEFAULT_WIDTH_CM,
      heightCm: DEFAULT_HEIGHT_CM,
      dpi,
      background: 'transparent',
      backgroundColor: '#ffffff',
    };
  }

  const widthCm = (config.widthPx / dpi) * 2.54;
  const heightCm = (config.heightPx / dpi) * 2.54;

  return {
    widthCm: Number(widthCm.toFixed(1)).toString(),
    heightCm: Number(heightCm.toFixed(1)).toString(),
    dpi,
    background: config.background,
    backgroundColor: config.backgroundColor,
  };
}

const backgroundOptions: BackgroundOption[] = [
  { id: 'transparent', label: 'Fondo transparente', background: 'transparent' },
  { id: 'white', label: 'Fondo blanco', background: 'white' },
  { id: 'light-gray', label: 'Fondo gris claro', background: 'color', color: '#d1d1d1' },
  { id: 'gray', label: 'Fondo gris oscuro', background: 'color', color: '#6b6b6b' },
  { id: 'black', label: 'Fondo negro', background: 'color', color: '#000000' },
];

const unavailableTools = [
  { label: 'Plantillas', icon: Grid2X2 },
  { label: 'Elementos', icon: Shapes },
  { label: 'Texto', icon: Type },
  { label: 'Formas', icon: LayoutGrid },
  { label: 'Capas', icon: Layers },
];

function isBackgroundSelected(settings: EasyCanvasSettings, option: BackgroundOption): boolean {
  if (option.background !== settings.background) return false;
  if (option.background !== 'color') return true;
  return settings.backgroundColor.toLowerCase() === option.color;
}

function getCanvasColor(settings: EasyCanvasSettings): string {
  if (settings.background === 'white') return '#ffffff';
  if (settings.background === 'color') return settings.backgroundColor;
  return 'transparent';
}

function getRulerSteps(lengthCm: number): { labelStep: number; tickStep: number } {
  if (lengthCm <= 300) return { labelStep: 10, tickStep: 1 };
  if (lengthCm <= 1000) return { labelStep: 50, tickStep: 5 };
  return { labelStep: 100, tickStep: 10 };
}

function createRulerMarks(lengthCm: number, labelStep: number): number[] {
  const marks: number[] = [];
  for (let mark = 0; mark <= lengthCm; mark += labelStep) marks.push(mark);

  const last = marks[marks.length - 1];
  if (last !== lengthCm && (lengthCm - last) / lengthCm > 0.04) marks.push(lengthCm);

  return marks;
}

// ─── SteppedInput ─────────────────────────────────────────────────────────────

interface SteppedInputProps {
  label: string;
  value: string | number;
  min: string;
  max?: string;
  step: string;
  onChange: (value: string) => void;
  onStep: (direction: 1 | -1) => void;
}

function SteppedInput({ label, value, min, max, step, onChange, onStep }: SteppedInputProps) {
  return (
    <span className="relative block">
      <input
        type="number"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-[#dfe2e9] bg-white pl-3 pr-8 text-[13px] font-semibold text-[#171923] outline-none [appearance:textfield] focus:border-[#4f46f5] focus:ring-1 focus:ring-[#4f46f5]/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col">
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Aumentar ${label}`}
          onClick={() => onStep(1)}
          className="flex h-[13px] w-3.5 items-center justify-center text-[#9aa0ab] hover:text-[#171923]"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Disminuir ${label}`}
          onClick={() => onStep(-1)}
          className="flex h-[13px] w-3.5 items-center justify-center text-[#9aa0ab] hover:text-[#171923]"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </span>
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DesignerEasyModePage() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [technique, setTechnique] = useState('dtf');
  const [canvasSettings, setCanvasSettings] = useState(() =>
    createInitialCanvasSettings(location.state),
  );
  const [keepRatio, setKeepRatio] = useState(false);
  const [canvasRatio, setCanvasRatio] = useState(
    () => Number(canvasSettings.widthCm) / Math.max(0.1, Number(canvasSettings.heightCm)),
  );
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [processedDimensions, setProcessedDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [showProcessedImage, setShowProcessedImage] = useState(true);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const processingRequestId = useRef(0);
  const processedImageUrlRef = useRef<string | null>(null);

  const widthCm = Number(canvasSettings.widthCm) || 0;
  const heightCm = Number(canvasSettings.heightCm) || 0;
  const safeWidthCm = Math.max(0.1, widthCm);
  const safeHeightCm = Math.max(0.1, heightCm);
  const selectedImage =
    showProcessedImage && processedImageUrl ? processedImageUrl : imageSrc;

  const widthSteps = getRulerSteps(safeWidthCm);
  const heightSteps = getRulerSteps(safeHeightCm);
  const rulerWidthMarks = createRulerMarks(safeWidthCm, widthSteps.labelStep);
  const rulerHeightMarks = createRulerMarks(safeHeightCm, heightSteps.labelStep);

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
        setProcessingError(
          error instanceof Error ? error.message : 'No se pudo procesar la imagen.',
        );
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

  const stepDimension = (axis: 'widthCm' | 'heightCm', direction: 1 | -1) => {
    const current = Number(canvasSettings[axis]) || 0;
    const next = Math.max(0.1, Number((current + direction).toFixed(1)));
    handleDimensionChange(axis, next.toString());
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

  const stepDpi = (direction: 1 | -1) => handleDpiChange(String(canvasSettings.dpi + direction * 10));

  const handleBackgroundSelect = (option: BackgroundOption) => {
    setCanvasSettings((current) => ({
      ...current,
      background: option.background,
      backgroundColor: option.color ?? current.backgroundColor,
    }));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
    const file = event.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const canvasAspectRatio = Math.max(0.01, safeWidthCm / safeHeightCm);

  const canvasFrameStyle = {
    aspectRatio: `${safeWidthCm} / ${safeHeightCm}`,
    width: `min(100cqw, calc(100cqh * ${canvasAspectRatio}))`,
  };

  const canvasStyle = {
    backgroundColor: getCanvasColor(canvasSettings),
    backgroundImage:
      canvasSettings.background === 'transparent'
        ? 'linear-gradient(45deg, #e8eaee 25%, transparent 25%), linear-gradient(-45deg, #e8eaee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8eaee 75%), linear-gradient(-45deg, transparent 75%, #e8eaee 75%)'
        : undefined,
    backgroundSize: canvasSettings.background === 'transparent' ? '24px 24px' : undefined,
    backgroundPosition:
      canvasSettings.background === 'transparent'
        ? '0 0, 0 12px, 12px -12px, -12px 0px'
        : undefined,
  };

  const horizontalTicksStyle = {
    backgroundImage: `linear-gradient(90deg, ${TICK_COLOR} 1px, transparent 1px), linear-gradient(90deg, ${TICK_COLOR} 1px, transparent 1px)`,
    backgroundSize: `${(widthSteps.tickStep / safeWidthCm) * 100}% 5px, ${(widthSteps.labelStep / safeWidthCm) * 100}% 9px`,
    backgroundPosition: 'left bottom, left bottom',
    backgroundRepeat: 'repeat-x',
  };

  const verticalTicksStyle = {
    backgroundImage: `linear-gradient(180deg, ${TICK_COLOR} 1px, transparent 1px), linear-gradient(180deg, ${TICK_COLOR} 1px, transparent 1px)`,
    backgroundSize: `5px ${(heightSteps.tickStep / safeHeightCm) * 100}%, 9px ${(heightSteps.labelStep / safeHeightCm) * 100}%`,
    backgroundPosition: 'right top, right top',
    backgroundRepeat: 'repeat-y',
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    /* Shell: full viewport, no scroll global */
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#f0f1f4] font-sans text-[#171923]">

      {/* ══════════════════════════════════════════════════════════
          HEADER — altura compacta ~56px como en la referencia
      ══════════════════════════════════════════════════════════ */}
      <header className="z-20 flex h-14 min-h-14 shrink-0 items-center border-b border-[#e3e5ea] bg-white px-4">

        {/* Izquierda: logo + menú */}
        <div className="flex min-w-0 shrink-0 items-center gap-5">
          <Link
            to="/designer/easy"
            aria-label="PrintShop, modo básico"
            className="flex shrink-0 items-center gap-2"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#4f46f5] text-[15px] font-bold text-white">
              P
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#151720]">
              PrintShop
            </span>
          </Link>

          <nav
            aria-label="Menú del editor"
            className="hidden items-center gap-5 text-[13px] font-medium text-[#555c69] sm:flex"
          >
            <button type="button" className="transition-colors hover:text-[#171923]">
              Archivo
            </button>
            <button type="button" className="transition-colors hover:text-[#171923]">
              Editar
            </button>
            <button type="button" className="transition-colors hover:text-[#171923]">
              Ver
            </button>
          </nav>
        </div>

        {/* Centro: selector de técnica */}
        <div className="mx-4 flex min-w-0 flex-1 justify-center">
          <label className="flex h-10 w-[220px] max-w-full shrink-0 items-center gap-2.5 rounded-xl border border-[#dfe2e8] bg-white px-3 shadow-[0_1px_2px_rgba(24,28,38,0.04)]">
            <Shirt className="h-5 w-5 shrink-0 text-[#4f46f5]" strokeWidth={1.9} />
            <span className="min-w-0 flex-1">
              <span className="block whitespace-nowrap text-[10px] leading-none text-[#8f95a2]">
                Técnica de estampado
              </span>
              <select
                aria-label="Técnica de estampado"
                value={technique}
                onChange={(event) => setTechnique(event.target.value)}
                className="w-full appearance-none bg-transparent text-[14px] font-semibold leading-5 text-[#171923] outline-none"
              >
                <option value="dtf">DTF</option>
              </select>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#555c69]" />
          </label>
        </div>

        {/* Derecha: controles */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled
              aria-label="Deshacer no disponible"
              title="Deshacer no está disponible en Modo Básico."
              className="rounded-lg p-1.5 text-[#b0b5bf] disabled:cursor-not-allowed"
            >
              <Undo2 className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              disabled
              aria-label="Rehacer no disponible"
              title="Rehacer no está disponible en Modo Básico."
              className="rounded-lg p-1.5 text-[#b0b5bf] disabled:cursor-not-allowed"
            >
              <Redo2 className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* Zoom */}
          <button
            type="button"
            disabled
            aria-label="Zoom al 100%"
            className="flex h-8 w-[90px] items-center justify-center gap-1.5 rounded-lg border border-[#e2e5eb] bg-[#f6f7f9] text-[13px] font-medium text-[#555d6b] disabled:cursor-not-allowed"
          >
            <Search className="h-3.5 w-3.5" />
            100%
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {/* Herramienta mano */}
          <button
            type="button"
            disabled
            aria-label="Herramienta mano no disponible"
            title="La navegación de lienzo no está disponible en Modo Básico."
            className="flex h-8 w-9 items-center justify-center rounded-lg border border-[#e2e5eb] bg-[#f6f7f9] text-[#555c69] disabled:cursor-not-allowed"
          >
            <Hand className="h-4 w-4" />
          </button>

          {/* Descargar PNG */}
          <button
            type="button"
            disabled
            title="La exportación todavía no está disponible."
            className="hidden h-8 items-center justify-center whitespace-nowrap rounded-lg border border-[#e2e5eb] bg-[#f4f5f7] px-4 text-[13px] font-semibold text-[#242832] disabled:cursor-not-allowed sm:flex"
          >
            Descargar PNG
          </button>

          {/* Descargar PDF */}
          <button
            type="button"
            disabled
            title="La exportación todavía no está disponible."
            className="hidden h-8 items-center justify-center whitespace-nowrap rounded-lg bg-[#4f46f5] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed lg:flex"
          >
            Descargar PDF
          </button>

          {/* Más opciones */}
          <button
            type="button"
            disabled
            aria-label="Más opciones no disponible"
            className="rounded-lg p-1 text-[#555c69] disabled:cursor-not-allowed"
          >
            <MoreVertical className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          BODY — toolbar + panel + workspace
      ══════════════════════════════════════════════════════════ */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* ─── SIDEBAR TOOLBAR ─── ~80px de ancho como en la referencia */}
        <nav
          aria-label="Herramientas de Modo Básico"
          className="flex w-[80px] min-w-[80px] shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-[#e3e5ea] bg-white py-2"
        >
          {/* Archivo — activo (highlighted) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-[64px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl bg-[#eeedff] py-3 text-[#4f46f5]"
          >
            <CloudUpload className="h-6 w-6" strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Archivo</span>
          </button>

          {/* Herramientas inactivas */}
          {unavailableTools.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              disabled
              title={`${label} no está disponible en Modo Básico.`}
              className="flex w-[64px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl py-3 text-[#6b717e] disabled:cursor-not-allowed"
            >
              <Icon className="h-6 w-6" strokeWidth={1.6} />
              <span className="text-[11px] font-medium text-[#8b919e]">{label}</span>
            </button>
          ))}
        </nav>

        {/* ─── PANEL LATERAL DE PROPIEDADES ─── ~300px de ancho */}
        <aside className="flex w-[300px] min-w-[260px] shrink-0 flex-col overflow-y-auto border-r border-[#e3e5ea] bg-white">

          {/* ── Agregar imagen ── */}
          <div className="px-5 pb-4 pt-5">
            <h1 className="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-[#171923]">
              Agregar imagen
            </h1>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDrop}
              className={`flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-center transition-colors ${
                isDraggingFile
                  ? 'border-[#4f46f5] bg-[#f6f5ff]'
                  : 'border-[#d0d4dc] bg-[#fafafa]'
              }`}
            >
              <CloudUpload className="mb-2 h-8 w-8 text-[#2a2f3a]" strokeWidth={1.5} />
              <p className="max-w-full truncate text-[13px] font-semibold text-[#171923]">
                {sourceFile ? sourceFile.name : 'Sube una imagen'}
              </p>
              <p className="mt-0.5 text-[11px] text-[#9aa0ab]">JPG, PNG o SVG (máx. 50MB)</p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex h-9 items-center justify-center rounded-lg border border-[#dfe2e9] bg-white px-5 text-[13px] font-semibold text-[#222630] transition-colors hover:bg-[#f0f1f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46f5]"
              >
                Seleccionar archivo
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {processingError && (
              <p role="alert" className="mt-2 text-[11px] text-red-600">
                {processingError}
              </p>
            )}

            {sourceFile && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleImproveContrast}
                  disabled={isProcessing}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e0e3e9] bg-white px-3 text-[11px] font-semibold text-[#282c36] hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#4f46f5]" />
                  {isProcessing ? 'Procesando…' : 'Mejorar contraste'}
                </button>

                {processedImageUrl && (
                  <button
                    type="button"
                    onClick={() => setShowProcessedImage((current) => !current)}
                    aria-pressed={showProcessedImage}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e0e3e9] bg-white px-3 text-[11px] font-semibold text-[#282c36] hover:bg-[#f7f8fa]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {showProcessedImage ? 'Ver original' : 'Ver resultado'}
                  </button>
                )}

                {processedDimensions && (
                  <span className="w-full pt-0.5 text-[11px] text-[#697181]">
                    PNG procesado · {processedDimensions.width} × {processedDimensions.height} px
                  </span>
                )}

                {isProcessing && (
                  <span role="status" className="w-full pt-0.5 text-[11px] text-[#697181]">
                    Procesando imagen en segundo plano…
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Fondo del lienzo ── */}
          <section className="border-t border-[#e8e9ed] px-5 pb-4 pt-4">
            <h2 className="mb-3 text-[14px] font-semibold tracking-[-0.01em] text-[#171923]">
              Fondo del lienzo
            </h2>

            <div className="flex items-center gap-2">
              {backgroundOptions.map((option) => {
                const selected = isBackgroundSelected(canvasSettings, option);

                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={selected}
                    title={option.label}
                    onClick={() => handleBackgroundSelect(option)}
                    className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46f5] focus-visible:ring-offset-2 ${
                      selected ? 'border-[#5a4aff]' : 'border-transparent'
                    }`}
                  >
                    <span
                      className={`h-9 w-9 rounded-full border border-[#dde0e7] ${
                        option.id === 'transparent'
                          ? 'bg-[linear-gradient(45deg,#e1e3e8_25%,transparent_25%),linear-gradient(-45deg,#e1e3e8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e1e3e8_75%),linear-gradient(-45deg,transparent_75%,#e1e3e8_75%)] [background-position:0_0,0_6px,6px_-6px,-6px_0] [background-size:12px_12px]'
                          : ''
                      } ${option.id === 'white' ? 'bg-white' : ''}`}
                      style={option.color ? { backgroundColor: option.color } : undefined}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Lienzo ── */}
          <section className="border-t border-[#e8e9ed] px-5 pb-5 pt-4">
            <h2 className="mb-3 text-[14px] font-semibold tracking-[-0.01em] text-[#171923]">
              Lienzo
            </h2>

            {/* Ancho / Alto */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-1.5">
              <label className="min-w-0 text-[12px] text-[#717887]">
                <span className="mb-1.5 block">Ancho (cm)</span>
                <SteppedInput
                  label="Ancho"
                  min="0.1"
                  step="0.1"
                  value={canvasSettings.widthCm}
                  onChange={(value) => handleDimensionChange('widthCm', value)}
                  onStep={(direction) => stepDimension('widthCm', direction)}
                />
              </label>

              <button
                type="button"
                aria-label={keepRatio ? 'Desbloquear proporción' : 'Mantener proporción'}
                aria-pressed={keepRatio}
                onClick={handleRatioToggle}
                className={`mb-2 rounded-md p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46f5] ${
                  keepRatio ? 'text-[#4f46f5]' : 'text-[#9aa0ab]'
                }`}
              >
                <Link2 className="h-4 w-4" />
              </button>

              <label className="min-w-0 text-[12px] text-[#717887]">
                <span className="mb-1.5 block">Alto (cm)</span>
                <SteppedInput
                  label="Alto"
                  min="0.1"
                  step="0.1"
                  value={canvasSettings.heightCm}
                  onChange={(value) => handleDimensionChange('heightCm', value)}
                  onStep={(direction) => stepDimension('heightCm', direction)}
                />
              </label>
            </div>

            {/* Resolución */}
            <div className="mt-3 text-[12px] text-[#717887]">
              <span className="mb-1.5 block">Resolución</span>
              <div className="grid grid-cols-[1fr_80px] gap-2">
                <SteppedInput
                  label="Resolución"
                  min="72"
                  max="2400"
                  step="1"
                  value={canvasSettings.dpi}
                  onChange={handleDpiChange}
                  onStep={stepDpi}
                />
                <span className="flex h-9 items-center justify-between rounded-lg border border-[#dfe2e9] bg-white px-3 text-[13px] text-[#465063]">
                  DPI
                  <ChevronDown className="h-3.5 w-3.5 text-[#9aa0ab]" />
                </span>
              </div>
            </div>
          </section>
        </aside>

        {/* ─── WORKSPACE (área principal) ─── */}
        <main
          aria-label="Área de trabajo del lienzo"
          className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#e9eaee]"
        >
          {/*
            Distribución del workspace:
            - Fila superior: esquina (20×20) + regla horizontal
            - Columna izquierda: regla vertical (20px ancho)
            - Centro: área de desplazamiento del canvas
            - Columna derecha: controles de zoom flotantes
          */}

          {/* Regla horizontal: banda gris con marcas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex h-5 border-b border-[#d4d6db] bg-[#f0f1f4] select-none"
          >
            {/* Esquina */}
            <div className="h-5 w-5 shrink-0 border-r border-[#d4d6db] bg-[#f0f1f4]" />
            {/* Regla horizontal — usa el mismo canvas container para proporciones */}
            <div className="relative flex-1 overflow-hidden text-[9px] text-[#8b919e]">
              <span className="absolute left-1 top-0 text-[9px] leading-5 text-[#9aa0ab]">cm</span>
              {rulerWidthMarks.map((mark) => (
                <span
                  key={mark}
                  className="absolute top-0 -translate-x-1/2 leading-5"
                  style={{ left: `${(mark / safeWidthCm) * 100}%` }}
                >
                  {mark}
                </span>
              ))}
              {/* Ticks */}
              <div
                className="absolute inset-0"
                style={horizontalTicksStyle}
              />
            </div>
          </div>

          {/* Regla vertical: banda izquierda con marcas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 top-5 z-10 w-5 border-r border-[#d4d6db] bg-[#f0f1f4] select-none"
          >
            <div className="relative h-full overflow-hidden text-[9px] text-[#8b919e]">
              {rulerHeightMarks.map((mark) => (
                <span
                  key={mark}
                  className="absolute right-0.5 -translate-y-1/2 leading-3"
                  style={{
                    top: `${(mark / safeHeightCm) * 100}%`,
                    writingMode: 'horizontal-tb',
                  }}
                >
                  {mark}
                </span>
              ))}
              {/* Ticks */}
              <div
                className="absolute inset-0"
                style={verticalTicksStyle}
              />
            </div>
          </div>

          {/* Canvas scroll area — dentro de las reglas */}
          <div
            className="absolute bottom-0 left-5 right-0 top-5 overflow-auto"
          >
            <div
              className="flex h-full w-full items-start justify-center p-8"
              style={{ containerType: 'size' }}
            >
              <div className="relative shrink-0" style={canvasFrameStyle}>
                {/* Canvas */}
                <div
                  role="img"
                  aria-label={`Lienzo ${widthCm} por ${heightCm} centímetros a ${canvasSettings.dpi} DPI`}
                  className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden shadow-[0_4px_20px_rgba(26,30,43,0.14)]"
                  style={canvasStyle}
                >
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt={
                        processedImageUrl && showProcessedImage
                          ? 'Imagen con contraste procesado'
                          : 'Imagen subida al lienzo'
                      }
                      className="h-full w-full select-none object-contain"
                      draggable={false}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Controles de viewport (derecha) ── */}
          <div className="absolute right-3 top-8 z-10 flex flex-col items-center gap-0.5 rounded-2xl border border-[#dde0e7] bg-white p-1.5 shadow-[0_4px_16px_rgba(25,30,44,0.08)]">
            <button
              type="button"
              disabled
              aria-label="Centrar lienzo no disponible"
              title="Ajuste de viewport no disponible en Modo Básico."
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#555c69] disabled:cursor-not-allowed"
            >
              <Crosshair className="h-5 w-5" strokeWidth={1.7} />
            </button>
            <button
              type="button"
              disabled
              aria-label="Acercar no disponible"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#555c69] disabled:cursor-not-allowed"
            >
              <ZoomIn className="h-5 w-5" strokeWidth={1.7} />
            </button>
            <button
              type="button"
              disabled
              aria-label="Alejar no disponible"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#555c69] disabled:cursor-not-allowed"
            >
              <CircleMinus className="h-5 w-5" strokeWidth={1.7} />
            </button>
            <span className="my-1 h-px w-6 bg-[#e8e9ed]" />
            <button
              type="button"
              disabled
              aria-label="Pantalla completa no disponible"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#555c69] disabled:cursor-not-allowed"
            >
              <Maximize className="h-5 w-5" strokeWidth={1.7} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}