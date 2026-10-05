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
      stroke: isMajor ? '#6b7280' : isMedium ? '#9ca3af' : '#cbd5e1',
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
      <line x1={0} y1={22} x2={widthPx} y2={22} stroke="#9ca3af" strokeWidth={1} />
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
          fill="#4b5563"
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
      stroke: isMajor ? '#6b7280' : isMedium ? '#9ca3af' : '#cbd5e1',
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
      <line x1={28} y1={0} x2={28} y2={heightPx} stroke="#9ca3af" strokeWidth={1} />
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
          fill="#4b5563"
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
        className="h-9 w-full rounded-lg border border-[#e2e8f0] bg-white pl-3 pr-7 text-[13px] font-semibold text-[#111827] outline-none [appearance:textfield] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <div className="absolute right-1.5 flex flex-col items-center">
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Aumentar ${label}`}
          onClick={() => onStep(1)}
          className="flex h-3.5 w-3.5 items-center justify-center text-[#9ca3af] hover:text-[#111827]"
        >
          <ChevronUp className="h-3 w-3" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Disminuir ${label}`}
          onClick={() => onStep(-1)}
          className="flex h-3.5 w-3.5 items-center justify-center text-[#9ca3af] hover:text-[#111827]"
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
  const [workspaceSize, setWorkspaceSize] = useState({ width: 900, height: 700 });

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

  // ─── Proportional Canvas Geometry ─────────────────────────────────────────

  const availWidth = Math.max(120, workspaceSize.width - 150);
  const availHeight = Math.max(120, workspaceSize.height - 90);
  const ratio = safeWidthCm / safeHeightCm;

  let canvasWidthPx = Math.round(availHeight * ratio);
  let canvasHeightPx = Math.round(availHeight);

  if (canvasWidthPx > availWidth) {
    canvasWidthPx = Math.round(availWidth);
    canvasHeightPx = Math.round(availWidth / ratio);
  }

  const canvasStyle = {
    backgroundColor: getCanvasColor(canvasSettings),
    backgroundImage:
      canvasSettings.background === 'transparent'
        ? 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)'
        : undefined,
    backgroundSize: canvasSettings.background === 'transparent' ? '16px 16px' : undefined,
    backgroundPosition:
      canvasSettings.background === 'transparent'
        ? '0 0, 0 8px, 8px -8px, -8px 0px'
        : undefined,
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#f1f3f7] font-sans text-[#111827]">
      {/* ══════════════════════════════════════════════════════════
          HEADER — réplica exacta 1:1 de la referencia
      ══════════════════════════════════════════════════════════ */}
      <header className="z-20 flex h-14 min-h-14 shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-4">
        {/* Izquierda: logo + menú */}
        <div className="flex shrink-0 items-center gap-6">
          <Link
            to="/designer/easy"
            aria-label="PrintShop, modo básico"
            className="flex shrink-0 items-center gap-2.5"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#4f46e5] text-[14px] font-bold text-white shadow-xs">
              P
            </span>
            <span className="text-[15px] font-bold tracking-tight text-[#111827]">
              PrintShop
            </span>
          </Link>

          <nav
            aria-label="Menú del editor"
            className="hidden items-center gap-5 text-[13px] font-normal text-[#6b7280] md:flex"
          >
            <button type="button" className="transition-colors hover:text-[#111827]">
              Archivo
            </button>
            <button type="button" className="transition-colors hover:text-[#111827]">
              Editar
            </button>
            <button type="button" className="transition-colors hover:text-[#111827]">
              Ver
            </button>
          </nav>
        </div>

        {/* Centro: selector de técnica estampado DTF */}
        <div className="flex shrink-0 items-center justify-center">
          <label className="flex h-10 w-[210px] cursor-pointer items-center gap-2.5 rounded-xl border border-[#e2e8f0] bg-white px-3 shadow-xs">
            <Shirt className="h-4 w-4 shrink-0 text-[#4f46e5]" strokeWidth={2} />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] leading-tight text-[#9ca3af]">
                Técnica de estampado
              </span>
              <select
                aria-label="Técnica de estampado"
                value={technique}
                onChange={(event) => setTechnique(event.target.value)}
                className="w-full appearance-none bg-transparent text-[13px] font-bold leading-tight text-[#111827] outline-none"
              >
                <option value="dtf">DTF</option>
              </select>
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#9ca3af]" />
          </label>
        </div>

        {/* Derecha: controles de exportación y herramientas */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center">
            <button
              type="button"
              disabled
              aria-label="Deshacer"
              title="Deshacer no está disponible en Modo Básico."
              className="rounded-lg p-1.5 text-[#9ca3af] disabled:cursor-not-allowed hover:bg-[#f3f4f6]"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled
              aria-label="Rehacer"
              title="Rehacer no está disponible en Modo Básico."
              className="rounded-lg p-1.5 text-[#9ca3af] disabled:cursor-not-allowed hover:bg-[#f3f4f6]"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom pill */}
          <div className="flex h-8 items-center gap-1 rounded-xl border border-[#e2e8f0] bg-white px-2.5 text-[12px] font-medium text-[#374151] shadow-xs">
            <RotateCcw className="h-3.5 w-3.5 text-[#6b7280]" />
            <span>100%</span>
            <ChevronDown className="h-3 w-3 text-[#9ca3af]" />
          </div>

          {/* Herramienta mano */}
          <button
            type="button"
            disabled
            aria-label="Herramienta mano"
            title="La navegación de lienzo no está disponible en Modo Básico."
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white text-[#4b5563] shadow-xs disabled:cursor-not-allowed hover:bg-[#f9fafb]"
          >
            <Hand className="h-4 w-4" />
          </button>

          {/* Descargar PNG */}
          <button
            type="button"
            disabled
            title="La exportación todavía no está disponible."
            className="hidden h-8 items-center justify-center rounded-xl border border-[#e2e8f0] bg-[#f3f4f6] px-3.5 text-[12px] font-semibold text-[#1f2937] hover:bg-[#e5e7eb] disabled:cursor-not-allowed sm:flex"
          >
            Descargar PNG
          </button>

          {/* Descargar PDF */}
          <button
            type="button"
            disabled
            title="La exportación todavía no está disponible."
            className="hidden h-8 items-center justify-center rounded-xl bg-[#4338ca] px-3.5 text-[12px] font-semibold text-white shadow-xs hover:bg-[#3730a3] disabled:cursor-not-allowed md:flex"
          >
            Descargar PDF
          </button>

          {/* Más opciones */}
          <button
            type="button"
            disabled
            aria-label="Más opciones"
            className="rounded-lg p-1 text-[#6b7280] disabled:cursor-not-allowed hover:bg-[#f3f4f6]"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          CUERPO PRINCIPAL — Toolbar + Panel + Workspace
      ══════════════════════════════════════════════════════════ */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ─── SIDEBAR TOOLBAR ─── exactamente 72px de ancho */}
        <nav
          aria-label="Herramientas de Modo Básico"
          className="flex w-[72px] min-w-[72px] shrink-0 flex-col items-center gap-1 border-r border-[#e5e7eb] bg-white py-3 overflow-y-auto"
        >
          {sidebarTools.map((tool) => {
            const Icon = tool.icon;
            if (tool.active) {
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-[54px] w-[58px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-[#eeedff] text-[#4f46e5]"
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
                className="flex h-[54px] w-[58px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl text-[#6b7280] disabled:cursor-not-allowed hover:text-[#111827]"
              >
                <Icon className="h-5 w-5" strokeWidth={1.6} />
                <span className="text-[11px] font-medium">{tool.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ─── PANEL LATERAL DE CONFIGURACIÓN ─── 320px de ancho */}
        <aside className="flex w-[320px] min-w-[320px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white overflow-y-auto p-5">
          {/* 1. AGREGAR IMAGEN */}
          <section>
            <h1 className="mb-2.5 text-[15px] font-bold text-[#111827]">
              Agregar imagen
            </h1>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
                isDraggingFile
                  ? 'border-[#4f46e5] bg-[#eeedff]/40'
                  : 'border-[#e2e8f0] bg-white'
              }`}
            >
              <CloudUpload className="h-8 w-8 text-[#111827]" strokeWidth={1.5} />
              <p className="mt-2 text-[14px] font-bold text-[#111827]">
                {sourceFile ? sourceFile.name : 'Sube una imagen'}
              </p>
              <p className="mt-0.5 text-[11px] text-[#9ca3af]">
                JPG, PNG o SVG (máx. 50MB)
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 rounded-full border border-[#e2e8f0] bg-[#f9fafb] px-5 py-1.5 text-[12px] font-semibold text-[#1f2937] shadow-xs hover:bg-[#f3f4f6]"
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
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleImproveContrast}
                  disabled={isProcessing}
                  className="flex h-7 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[11px] font-semibold text-[#374151] hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3 text-[#4f46e5]" />
                  {isProcessing ? 'Procesando…' : 'Mejorar contraste'}
                </button>

                {processedImageUrl && (
                  <button
                    type="button"
                    onClick={() => setShowProcessedImage((current) => !current)}
                    aria-pressed={showProcessedImage}
                    className="flex h-7 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[11px] font-semibold text-[#374151] hover:bg-[#f9fafb]"
                  >
                    <Eye className="h-3 w-3" />
                    {showProcessedImage ? 'Ver original' : 'Ver resultado'}
                  </button>
                )}

                {processedDimensions && (
                  <span className="w-full text-[11px] text-[#6b7280]">
                    PNG procesado · {processedDimensions.width} × {processedDimensions.height} px
                  </span>
                )}
              </div>
            )}
          </section>

          {/* 2. LIENZO */}
          <section className="mt-4">
            <h2 className="mb-2 text-[14px] font-bold text-[#111827]">
              Lienzo
            </h2>

            {/* Ancho / Alto */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-1.5">
              <label className="min-w-0 text-[11px] text-[#6b7280]">
                <span className="mb-1 block">Ancho (cm)</span>
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
                className={`mb-2 rounded-md p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] ${
                  keepRatio ? 'text-[#4f46e5]' : 'text-[#9ca3af]'
                }`}
              >
                <Link2 className="h-4 w-4" />
              </button>

              <label className="min-w-0 text-[11px] text-[#6b7280]">
                <span className="mb-1 block">Alto (cm)</span>
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
            <div className="mt-2.5">
              <span className="mb-1 block text-[11px] text-[#6b7280]">Resolución</span>
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
                <div className="flex h-9 items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-3 text-[13px] font-medium text-[#374151]">
                  <span>DPI</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#9ca3af]" />
                </div>
              </div>
            </div>
          </section>

          {/* 3. FONDO DEL LIENZO */}
          <section className="mt-4">
            <h2 className="mb-2 text-[14px] font-bold text-[#111827]">
              Fondo del lienzo
            </h2>

            <div className="flex items-center gap-2.5">
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
                      className={`h-8 w-8 rounded-full border border-[#d1d5db] ${
                        option.id === 'transparent'
                          ? 'bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] [background-position:0_0,0_4px,4px_-4px,-4px_0] [background-size:8px_8px]'
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
          <section className="mt-4">
            <h2 className="mb-2 text-[14px] font-bold text-[#111827]">
              Agregar diseños
            </h2>

            {/* Botón principal: + SUBIR IMAGEN */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#18181b] px-4 text-[12px] font-bold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-black"
            >
              + SUBIR IMAGEN
            </button>

            {/* Fila de 3 botones: ATRÁS, DUPLICAR, BORRAR */}
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (processedImageUrl) setShowProcessedImage(false);
                }}
                className="flex h-8 items-center justify-center gap-1 rounded-lg border border-[#e2e8f0] bg-white text-[11px] font-bold uppercase text-[#374151] hover:bg-[#f9fafb]"
              >
                <RotateCcw className="h-3 w-3" />
                <span>ATRÁS</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  // Duplicar reservado
                }}
                className="flex h-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[11px] font-bold uppercase text-[#374151] hover:bg-[#f9fafb]"
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
                className="flex h-8 items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[11px] font-bold uppercase text-[#ef4444] hover:bg-[#fef2f2]"
              >
                BORRAR
              </button>
            </div>

            {/* Banner naranja: Eliminar semitransparencias */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-3">
              <div>
                <p className="text-[12px] font-bold text-[#ea580c]">
                  Eliminar semitransparencias
                </p>
                <p className="text-[10px] text-[#c2410c]/80">
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

        {/* ─── WORKSPACE (Área central de lienzo) ─── */}
        <main
          ref={workspaceRef}
          aria-label="Área de trabajo del lienzo"
          className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#f1f3f7] flex items-center justify-center p-8 select-none"
        >
          {/* Contenedor central: reglas pegadas al lienzo */}
          <div className="relative flex flex-col items-start">
            {/* Fila superior: esquina (cm) + regla horizontal */}
            <div className="flex items-end">
              <div className="flex h-[22px] w-[28px] shrink-0 items-center justify-end pr-1 text-[10px] font-medium text-[#6b7280]">
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

              {/* Lienzo / Canvas */}
              <div
                role="img"
                aria-label={`Lienzo ${widthCm} por ${heightCm} centímetros a ${canvasSettings.dpi} DPI`}
                className="relative shrink-0 overflow-hidden border border-[#d1d5db] shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
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
          <div className="absolute right-6 top-6 z-20 flex flex-col items-center gap-1 rounded-2xl border border-[#e2e8f0] bg-white p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
            <button
              type="button"
              disabled
              aria-label="Centrar lienzo"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4b5563] disabled:cursor-not-allowed hover:bg-[#f3f4f6]"
            >
              <Crosshair className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              disabled
              aria-label="Acercar"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4b5563] disabled:cursor-not-allowed hover:bg-[#f3f4f6]"
            >
              <ZoomIn className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              disabled
              aria-label="Alejar"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4b5563] disabled:cursor-not-allowed hover:bg-[#f3f4f6]"
            >
              <ZoomOut className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <div className="my-0.5 h-px w-5 bg-[#e5e7eb]" />
            <button
              type="button"
              disabled
              aria-label="Ajustar a pantalla"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4b5563] disabled:cursor-not-allowed hover:bg-[#f3f4f6]"
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
              className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:bg-[#f9fafb] disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4 text-[#111827]" strokeWidth={2} />
              <span>Exportar</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}