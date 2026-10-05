import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import {
  ChevronDown,
  ChevronUp,
  CloudUpload,
  Crosshair,
  Eye,
  Grid2X2,
  Hand,
  Layers,
  LayoutGrid,
  Link2,
  Maximize2,
  MoreVertical,
  Redo2,
  RotateCcw,
  Shapes,
  Shirt,
  Sparkles,
  Type,
  Undo2,
  Upload,
  ZoomIn,
  ZoomOut,
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
  { id: 'light-gray', label: 'Fondo gris claro', background: 'color', color: '#d1d5db' },
  { id: 'gray', label: 'Fondo gris oscuro', background: 'color', color: '#4b5563' },
  { id: 'black', label: 'Fondo negro', background: 'color', color: '#000000' },
];

const sidebarTools = [
  { id: 'archivo', label: 'Archivo', icon: CloudUpload, active: true },
  { id: 'plantillas', label: 'Plantillas', icon: LayoutGrid, active: false },
  { id: 'elementos', label: 'Elementos', icon: Shapes, active: false },
  { id: 'texto', label: 'Texto', icon: Type, active: false },
  { id: 'formas', label: 'Formas', icon: Grid2X2, active: false },
  { id: 'capas', label: 'Capas', icon: Layers, active: false },
];

function isBackgroundSelected(settings: EasyCanvasSettings, option: BackgroundOption): boolean {
  if (option.background !== settings.background) return false;
  if (option.background !== 'color') return true;
  return settings.backgroundColor.toLowerCase() === option.color?.toLowerCase();
}

function getCanvasColor(settings: EasyCanvasSettings): string {
  if (settings.background === 'white') return '#ffffff';
  if (settings.background === 'color') return settings.backgroundColor;
  return 'transparent';
}

// ─── SVG Rulers ──────────────────────────────────────────────────────────────

interface HorizontalRulerProps {
  widthPx: number;
  lengthCm: number;
}

function HorizontalRuler({ widthPx, lengthCm }: HorizontalRulerProps) {
  if (widthPx <= 0 || lengthCm <= 0) return null;

  const labelStep = lengthCm <= 100 ? 10 : lengthCm <= 500 ? 50 : 100;
  const tickStep = lengthCm <= 100 ? 1 : lengthCm <= 500 ? 5 : 10;

  const ticks: { x: number; height: number; stroke: string }[] = [];
  for (let cm = 0; cm <= lengthCm; cm += tickStep) {
    const x = (cm / lengthCm) * widthPx;
    const isMajor = cm % labelStep === 0 || cm === lengthCm;
    const isMedium = cm % (labelStep / 2) === 0;
    ticks.push({
      x,
      height: isMajor ? 7 : isMedium ? 5 : 3,
      stroke: isMajor ? '#64748b' : isMedium ? '#94a3b8' : '#cbd5e1',
    });
  }

  const labels: { x: number; text: string }[] = [];
  for (let cm = 0; cm <= lengthCm; cm += labelStep) {
    labels.push({ x: (cm / lengthCm) * widthPx, text: String(cm) });
  }
  if (lengthCm % labelStep !== 0) {
    labels.push({ x: widthPx, text: String(lengthCm) });
  }

  return (
    <svg
      width={widthPx}
      height={22}
      className="block select-none"
      style={{ width: `${widthPx}px`, height: '22px' }}
    >
      <line x1={0} y1={22} x2={widthPx} y2={22} stroke="#94a3b8" strokeWidth={1} />
      {ticks.map((t, idx) => (
        <line
          key={`tick-h-${idx}`}
          x1={t.x}
          y1={22 - t.height}
          x2={t.x}
          y2={22}
          stroke={t.stroke}
          strokeWidth={1}
        />
      ))}
      {labels.map((l, idx) => (
        <text
          key={`label-h-${idx}`}
          x={l.x}
          y={10}
          textAnchor="middle"
          fontSize="9"
          fill="#475569"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="500"
        >
          {l.text}
        </text>
      ))}
    </svg>
  );
}

interface VerticalRulerProps {
  heightPx: number;
  lengthCm: number;
}

function VerticalRuler({ heightPx, lengthCm }: VerticalRulerProps) {
  if (heightPx <= 0 || lengthCm <= 0) return null;

  const labelStep = lengthCm <= 100 ? 10 : lengthCm <= 500 ? 50 : 100;
  const tickStep = lengthCm <= 100 ? 1 : lengthCm <= 500 ? 5 : 10;

  const ticks: { y: number; width: number; stroke: string }[] = [];
  for (let cm = 0; cm <= lengthCm; cm += tickStep) {
    const y = (cm / lengthCm) * heightPx;
    const isMajor = cm % labelStep === 0 || cm === lengthCm;
    const isMedium = cm % (labelStep / 2) === 0;
    ticks.push({
      y,
      width: isMajor ? 7 : isMedium ? 5 : 3,
      stroke: isMajor ? '#64748b' : isMedium ? '#94a3b8' : '#cbd5e1',
    });
  }

  const labels: { y: number; text: string }[] = [];
  for (let cm = 0; cm <= lengthCm; cm += labelStep) {
    labels.push({ y: (cm / lengthCm) * heightPx, text: String(cm) });
  }
  if (lengthCm % labelStep !== 0) {
    labels.push({ y: heightPx, text: String(lengthCm) });
  }

  return (
    <svg
      width={28}
      height={heightPx}
      className="block select-none"
      style={{ width: '28px', height: `${heightPx}px` }}
    >
      <line x1={28} y1={0} x2={28} y2={heightPx} stroke="#94a3b8" strokeWidth={1} />
      {ticks.map((t, idx) => (
        <line
          key={`tick-v-${idx}`}
          x1={28 - t.width}
          y1={t.y}
          x2={28}
          y2={t.y}
          stroke={t.stroke}
          strokeWidth={1}
        />
      ))}
      {labels.map((l, idx) => (
        <text
          key={`label-v-${idx}`}
          x={19}
          y={l.y + 3.5}
          textAnchor="end"
          fontSize="9"
          fill="#475569"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="500"
        >
          {l.text}
        </text>
      ))}
    </svg>
  );
}

// ─── SteppedInput ─────────────────────────────────────────────────────────────

interface SteppedInputProps {
  label: string;
  value: string | number;
  min?: string;
  max?: string;
  step?: string;
  onChange: (value: string) => void;
  onStep: (direction: 1 | -1) => void;
}

function SteppedInput({ label, value, min, max, step, onChange, onStep }: SteppedInputProps) {
  return (
    <div className="relative flex items-center">
      <input
        type="number"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-[#e2e8f0] bg-white pl-3.5 pr-8 text-[14px] font-semibold text-[#0f172a] outline-none [appearance:textfield] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <div className="absolute right-2 flex flex-col items-center">
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Aumentar ${label}`}
          onClick={() => onStep(1)}
          className="flex h-3.5 w-3.5 items-center justify-center text-[#94a3b8] hover:text-[#0f172a]"
        >
          <ChevronUp className="h-3 w-3" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Disminuir ${label}`}
          onClick={() => onStep(-1)}
          className="flex h-3.5 w-3.5 items-center justify-center text-[#94a3b8] hover:text-[#0f172a]"
        >
          <ChevronDown className="h-3 w-3" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DesignerEasyModePage() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

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
  const [removeSemitransparencies, setRemoveSemitransparencies] = useState(false);

  // Responsive workspace size tracking
  const [workspaceSize, setWorkspaceSize] = useState({ width: 1100, height: 850 });

  const processingRequestId = useRef(0);
  const processedImageUrlRef = useRef<string | null>(null);

  const widthCm = Number(canvasSettings.widthCm) || 0;
  const heightCm = Number(canvasSettings.heightCm) || 0;
  const safeWidthCm = Math.max(0.1, widthCm);
  const safeHeightCm = Math.max(0.1, heightCm);
  const selectedImage =
    showProcessedImage && processedImageUrl ? processedImageUrl : imageSrc;

  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setWorkspaceSize({ width, height });
        }
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // ─── Proportional Dominant Canvas Geometry ─────────────────────────────────
  // El canvas debe aprovechar de forma dominante el espacio vertical disponible,
  // tal como se observa en designer_easy.png (~92% del alto visible del workspace).
  const availHeight = Math.max(100, workspaceSize.height - 60);
  const availWidth = Math.max(100, workspaceSize.width - 100);
  const ratio = safeWidthCm / safeHeightCm;

  let canvasHeightPx = availHeight;
  let canvasWidthPx = Math.round(canvasHeightPx * ratio);

  if (canvasWidthPx > availWidth) {
    canvasWidthPx = availWidth;
    canvasHeightPx = Math.round(canvasWidthPx / ratio);
  }

  const canvasStyle = {
    backgroundColor: getCanvasColor(canvasSettings),
    backgroundImage:
      canvasSettings.background === 'transparent'
        ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
        : undefined,
    backgroundSize: canvasSettings.background === 'transparent' ? '16px 16px' : undefined,
    backgroundPosition:
      canvasSettings.background === 'transparent'
        ? '0 0, 0 8px, 8px -8px, -8px 0px'
        : undefined,
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#f4f5f8] font-sans text-[#0f172a]">
      {/* ══════════════════════════════════════════════════════════
          HEADER — réplica exacta 1:1 de designer_easy.png
      ══════════════════════════════════════════════════════════ */}
      <header className="z-20 flex h-14 min-h-14 shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-white px-5">
        {/* Izquierda: logo + menú */}
        <div className="flex shrink-0 items-center gap-7">
          <Link
            to="/designer/easy"
            aria-label="PrintShop, modo básico"
            className="flex shrink-0 items-center gap-2.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4f46e5] text-[15px] font-bold text-white shadow-xs">
              P
            </span>
            <span className="text-[16px] font-bold tracking-tight text-[#0f172a]">
              PrintShop
            </span>
          </Link>

          <nav
            aria-label="Menú del editor"
            className="hidden items-center gap-6 text-[13px] font-medium text-[#64748b] md:flex"
          >
            <button type="button" className="transition-colors hover:text-[#0f172a]">
              Archivo
            </button>
            <button type="button" className="transition-colors hover:text-[#0f172a]">
              Editar
            </button>
            <button type="button" className="transition-colors hover:text-[#0f172a]">
              Ver
            </button>
          </nav>
        </div>

        {/* Centro: selector de técnica estampado DTF */}
        <div className="flex shrink-0 items-center justify-center">
          <label className="flex h-11 w-[220px] cursor-pointer items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white px-4 shadow-xs">
            <Shirt className="h-5 w-5 shrink-0 text-[#4f46e5]" strokeWidth={2} />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-medium leading-none text-[#94a3b8] mb-0.5">
                Técnica de estampado
              </span>
              <select
                aria-label="Técnica de estampado"
                value={technique}
                onChange={(event) => setTechnique(event.target.value)}
                className="w-full appearance-none bg-transparent text-[14px] font-bold leading-none text-[#0f172a] outline-none cursor-pointer"
              >
                <option value="dtf">DTF</option>
              </select>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#94a3b8]" />
          </label>
        </div>

        {/* Derecha: controles de exportación y herramientas */}
        <div className="flex shrink-0 items-center gap-2.5">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled
              aria-label="Deshacer"
              title="Deshacer no está disponible en Modo Básico."
              className="rounded-lg p-1.5 text-[#94a3b8] disabled:cursor-not-allowed hover:bg-[#f1f5f9]"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled
              aria-label="Rehacer"
              title="Rehacer no está disponible en Modo Básico."
              className="rounded-lg p-1.5 text-[#94a3b8] disabled:cursor-not-allowed hover:bg-[#f1f5f9]"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom pill */}
          <div className="flex h-9 items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-3 text-[13px] font-medium text-[#334155] shadow-xs">
            <RotateCcw className="h-3.5 w-3.5 text-[#64748b]" />
            <span>100%</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#94a3b8]" />
          </div>

          {/* Herramienta mano */}
          <button
            type="button"
            disabled
            aria-label="Herramienta mano"
            title="La navegación de lienzo no está disponible en Modo Básico."
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white text-[#475569] shadow-xs disabled:cursor-not-allowed hover:bg-[#f8fafc]"
          >
            <Hand className="h-4 w-4" />
          </button>

          {/* Descargar PNG */}
          <button
            type="button"
            disabled
            title="La exportación todavía no está disponible."
            className="flex h-9 items-center justify-center rounded-xl border border-[#e2e8f0] bg-[#f1f3f6] px-4 text-[13px] font-semibold text-[#1e293b] hover:bg-[#e2e8f0] disabled:cursor-not-allowed transition-colors"
          >
            Descargar PNG
          </button>

          {/* Descargar PDF */}
          <button
            type="button"
            disabled
            title="La exportación todavía no está disponible."
            className="flex h-9 items-center justify-center rounded-xl bg-[#4f46e5] px-4 text-[13px] font-semibold text-white shadow-xs hover:bg-[#4338ca] disabled:cursor-not-allowed transition-colors"
          >
            Descargar PDF
          </button>

          {/* Más opciones */}
          <button
            type="button"
            disabled
            aria-label="Más opciones"
            className="rounded-lg p-1.5 text-[#64748b] disabled:cursor-not-allowed hover:bg-[#f1f5f9]"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          CUERPO PRINCIPAL — Toolbar + Panel + Workspace
      ══════════════════════════════════════════════════════════ */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ─── SIDEBAR TOOLBAR ─── 76px de ancho como en la referencia */}
        <nav
          aria-label="Herramientas de Modo Básico"
          className="flex w-[76px] min-w-[76px] shrink-0 flex-col items-center gap-1.5 border-r border-[#e2e8f0] bg-white py-3.5 overflow-y-auto"
        >
          {sidebarTools.map((tool) => {
            const Icon = tool.icon;
            if (tool.active) {
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-[56px] w-[62px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-[#eeedff] text-[#4f46e5] transition-colors"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                  <span className="text-[11px] font-medium">{tool.label}</span>
                </button>
              );
            }

            return (
              <button
                key={tool.id}
                type="button"
                disabled
                title={`${tool.label} no está disponible en Modo Básico.`}
                className="flex h-[56px] w-[62px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl text-[#64748b] disabled:cursor-not-allowed hover:text-[#0f172a] transition-colors"
              >
                <Icon className="h-5 w-5" strokeWidth={1.6} />
                <span className="text-[11px] font-medium">{tool.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ─── PANEL LATERAL DE CONFIGURACIÓN ─── 360px de ancho ─── */}
        <aside className="flex w-[360px] min-w-[360px] shrink-0 flex-col border-r border-[#e2e8f0] bg-white overflow-y-auto px-6 py-5">
          {/* 1. AGREGAR IMAGEN */}
          <section>
            <h1 className="mb-3 text-[15px] font-bold text-[#0f172a]">
              Agregar imagen
            </h1>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                isDraggingFile
                  ? 'border-[#4f46e5] bg-[#eeedff]/40'
                  : 'border-[#cbd5e1] bg-white'
              }`}
            >
              <CloudUpload className="h-9 w-9 text-[#0f172a]" strokeWidth={1.5} />
              <p className="mt-2.5 text-[14px] font-bold text-[#0f172a]">
                {sourceFile ? sourceFile.name : 'Sube una imagen'}
              </p>
              <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                JPG, PNG o SVG (máx. 50MB)
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3.5 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-6 py-2 text-[12px] font-semibold text-[#1e293b] shadow-xs hover:bg-[#f1f5f9] transition-colors"
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
                  className="flex h-7 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[11px] font-semibold text-[#334155] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3 text-[#4f46e5]" />
                  {isProcessing ? 'Procesando…' : 'Mejorar contraste'}
                </button>

                {processedImageUrl && (
                  <button
                    type="button"
                    onClick={() => setShowProcessedImage((current) => !current)}
                    aria-pressed={showProcessedImage}
                    className="flex h-7 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[11px] font-semibold text-[#334155] hover:bg-[#f8fafc]"
                  >
                    <Eye className="h-3 w-3" />
                    {showProcessedImage ? 'Ver original' : 'Ver resultado'}
                  </button>
                )}

                {processedDimensions && (
                  <span className="w-full text-[11px] text-[#64748b]">
                    PNG procesado · {processedDimensions.width} × {processedDimensions.height} px
                  </span>
                )}
              </div>
            )}
          </section>

          {/* 2. LIENZO */}
          <section className="mt-5">
            <h2 className="mb-2.5 text-[15px] font-bold text-[#0f172a]">
              Lienzo
            </h2>

            {/* Ancho / Alto */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <label className="min-w-0 text-[12px] text-[#64748b]">
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
                className={`mb-2.5 rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] ${
                  keepRatio ? 'text-[#4f46e5] bg-[#eeedff]' : 'text-[#94a3b8] hover:text-[#0f172a]'
                }`}
              >
                <Link2 className="h-4 w-4" />
              </button>

              <label className="min-w-0 text-[12px] text-[#64748b]">
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
            <div className="mt-3">
              <span className="mb-1.5 block text-[12px] text-[#64748b]">Resolución</span>
              <div className="grid grid-cols-[1fr_84px] gap-2">
                <SteppedInput
                  label="Resolución"
                  min="72"
                  max="2400"
                  step="1"
                  value={canvasSettings.dpi}
                  onChange={handleDpiChange}
                  onStep={stepDpi}
                />
                <div className="flex h-10 items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-3 text-[13px] font-medium text-[#334155]">
                  <span>DPI</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#94a3b8]" />
                </div>
              </div>
            </div>
          </section>

          {/* 3. FONDO DEL LIENZO */}
          <section className="mt-5">
            <h2 className="mb-3 text-[15px] font-bold text-[#0f172a]">
              Fondo del lienzo
            </h2>

            <div className="flex items-center gap-3">
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
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform ${
                      selected
                        ? 'ring-2 ring-[#4f46e5] ring-offset-2'
                        : 'hover:scale-105'
                    }`}
                  >
                    <span
                      className={`h-8 w-8 rounded-full border border-[#cbd5e1] ${
                        option.id === 'transparent'
                          ? 'bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] [background-position:0_0,0_4px,4px_-4px,-4px_0] [background-size:8px_8px]'
                          : ''
                      } ${option.id === 'white' ? 'bg-white' : ''}`}
                      style={option.color ? { backgroundColor: option.color } : undefined}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. AGREGAR DISEÑOS */}
          <section className="mt-5">
            <h2 className="mb-3 text-[15px] font-bold text-[#0f172a]">
              Agregar diseños
            </h2>

            {/* Botón principal: + SUBIR IMAGEN */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#18181b] px-4 text-[12px] font-bold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-black"
            >
              + SUBIR IMAGEN
            </button>

            {/* Fila de 3 botones: ATRÁS, DUPLICAR, BORRAR */}
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (processedImageUrl) setShowProcessedImage(false);
                }}
                className="flex h-9 items-center justify-center gap-1 rounded-xl border border-[#e2e8f0] bg-white text-[11px] font-bold uppercase text-[#334155] hover:bg-[#f8fafc] transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>ATRÁS</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  // Duplicar reservado
                }}
                className="flex h-9 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white text-[11px] font-bold uppercase text-[#334155] hover:bg-[#f8fafc] transition-colors"
              >
                DUPLICAR
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageSrc(null);
                  setSourceFile(null);
                  replaceProcessedImage(null);
                  setProcessedDimensions(null);
                }}
                className="flex h-9 items-center justify-center rounded-xl border border-[#fecaca] bg-white text-[11px] font-bold uppercase text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
              >
                BORRAR
              </button>
            </div>

            {/* Banner naranja: Eliminar semitransparencias */}
            <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-[#fed7aa] bg-[#fff7ed] p-3.5">
              <div>
                <p className="text-[12px] font-bold text-[#ea580c]">
                  Eliminar semitransparencias
                </p>
                <p className="text-[11px] text-[#c2410c]/80 mt-0.5">
                  Evita bordes blancos
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={removeSemitransparencies}
                onClick={() => {
                  const next = !removeSemitransparencies;
                  setRemoveSemitransparencies(next);
                  if (next && sourceFile && !isProcessing) {
                    handleImproveContrast();
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  removeSemitransparencies ? 'bg-[#ea580c]' : 'bg-[#d1d5db]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    removeSemitransparencies ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </section>
        </aside>

        {/* ─── WORKSPACE (Área central de lienzo dominante) ─── */}
        <main
          ref={workspaceRef}
          aria-label="Área de trabajo del lienzo"
          className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#f4f5f8] flex items-center justify-center p-4 select-none"
        >
          {/* Contenedor central: reglas perfectamente unidas al lienzo dominante */}
          <div className="relative flex flex-col items-start">
            {/* Fila superior: esquina (cm) + regla horizontal */}
            <div className="flex items-end">
              <div className="flex h-[22px] w-[28px] shrink-0 items-center justify-end pr-1 text-[10px] font-medium text-[#64748b]">
                cm
              </div>
              <div style={{ width: `${canvasWidthPx}px` }}>
                <HorizontalRuler widthPx={canvasWidthPx} lengthCm={safeWidthCm} />
              </div>
            </div>

            {/* Fila inferior: regla vertical + lienzo */}
            <div className="flex items-start">
              <div style={{ height: `${canvasHeightPx}px` }}>
                <VerticalRuler heightPx={canvasHeightPx} lengthCm={safeHeightCm} />
              </div>

              {/* Lienzo / Canvas dominante */}
              <div
                role="img"
                aria-label={`Lienzo ${widthCm} por ${heightCm} centímetros a ${canvasSettings.dpi} DPI`}
                className="relative shrink-0 overflow-hidden border border-[#cbd5e1] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                style={{
                  width: `${canvasWidthPx}px`,
                  height: `${canvasHeightPx}px`,
                  ...canvasStyle,
                }}
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

          {/* ── Controles flotantes en la parte superior derecha ── */}
          <div className="absolute right-6 top-6 z-20 flex flex-col items-center gap-1 rounded-2xl border border-[#e2e8f0] bg-white p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <button
              type="button"
              disabled
              aria-label="Centrar lienzo"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#475569] disabled:cursor-not-allowed hover:bg-[#f1f5f9] transition-colors"
            >
              <Crosshair className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              disabled
              aria-label="Acercar"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#475569] disabled:cursor-not-allowed hover:bg-[#f1f5f9] transition-colors"
            >
              <ZoomIn className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              disabled
              aria-label="Alejar"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#475569] disabled:cursor-not-allowed hover:bg-[#f1f5f9] transition-colors"
            >
              <ZoomOut className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <div className="my-0.5 h-px w-5 bg-[#e2e8f0]" />
            <button
              type="button"
              disabled
              aria-label="Ajustar a pantalla"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#475569] disabled:cursor-not-allowed hover:bg-[#f1f5f9] transition-colors"
            >
              <Maximize2 className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>

          {/* ── Botón flotante 'Exportar' en la esquina inferior derecha ── */}
          <div className="absolute bottom-6 right-6 z-20">
            <button
              type="button"
              disabled
              title="La exportación todavía no está disponible."
              className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0f172a] shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:bg-[#f8fafc] disabled:cursor-not-allowed transition-colors"
            >
              <Upload className="h-4 w-4 text-[#0f172a]" strokeWidth={2} />
              <span>Exportar</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}