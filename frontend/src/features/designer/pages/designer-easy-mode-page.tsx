import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import {
  ChevronDown,
  ChevronUp,
  CloudUpload,
  Crosshair,
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
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import { Link, useLocation } from 'react-router-dom';

import { processArtworkImage } from '@/core/design/processing';
import { removeBackgroundLocal } from '@/features/store/designer/imageProcessor';
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

const DEFAULT_WIDTH_CM = '35';
const DEFAULT_HEIGHT_CM = '50';

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
      className="block select-none overflow-visible"
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
      {labels.map((l, idx) => {
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        let posX = l.x;
        if (idx === 0) {
          textAnchor = 'start';
          posX = 0;
        } else if (idx === labels.length - 1) {
          textAnchor = 'end';
          posX = widthPx;
        }
        return (
          <text
            key={`label-h-${idx}`}
            x={posX}
            y={10}
            textAnchor={textAnchor}
            fontSize="9"
            fill="#475569"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="500"
          >
            {l.text}
          </text>
        );
      })}
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
      className="block select-none overflow-visible"
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
      {labels.map((l, idx) => {
        let posY = l.y + 3.5;
        if (idx === 0) {
          posY = 8;
        } else if (idx === labels.length - 1) {
          posY = heightPx - 1;
        }
        return (
          <text
            key={`label-v-${idx}`}
            x={19}
            y={posY}
            textAnchor="end"
            fontSize="9"
            fill="#475569"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="500"
          >
            {l.text}
          </text>
        );
      })}
    </svg>
  );
}

// ─── SteppedInput ─────────────────────────────────────────────────────────────

interface SteppedInputProps {
  label: string;
  value: string | number;
  suffix?: string;
  min?: string;
  max?: string;
  step?: string;
  className?: string;
  onChange: (value: string) => void;
  onStep: (direction: 1 | -1) => void;
}

function SteppedInput({
  label,
  value,
  suffix,
  min,
  max,
  step,
  className,
  onChange,
  onStep,
}: SteppedInputProps) {
  return (
    <div
      className={
        suffix
          ? 'flex h-10 items-center rounded-xl border border-[#e2e8f0] bg-white focus-within:border-[#4f46e5] focus-within:ring-1 focus-within:ring-[#4f46e5]/20'
          : 'relative flex items-center'
      }
    >
      <input
        type="number"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={
          suffix
            ? `h-full min-w-0 flex-1 border-0 bg-transparent pl-3 pr-1 text-[13px] font-semibold text-[#0f172a] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className ?? ''}`
            : `h-9 w-full rounded-xl border border-[#e2e8f0] bg-white pl-3 pr-7 text-[13px] font-semibold text-[#0f172a] outline-none [appearance:textfield] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                className ?? ''
              }`
        }
      />
      <div className={suffix ? 'flex flex-col items-center px-1' : 'absolute right-1.5 flex flex-col items-center'}>
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Aumentar ${label}`}
          onClick={() => onStep(1)}
          className="flex h-3 w-3 items-center justify-center text-[#94a3b8] hover:text-[#0f172a]"
        >
          <ChevronUp className="h-2.5 w-2.5" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Disminuir ${label}`}
          onClick={() => onStep(-1)}
          className="flex h-3 w-3 items-center justify-center text-[#94a3b8] hover:text-[#0f172a]"
        >
          <ChevronDown className="h-2.5 w-2.5" strokeWidth={2.2} />
        </button>
      </div>
      {suffix && (
        <span className="shrink-0 pr-3 text-[13px] font-medium text-[#334155]">
          {suffix}
        </span>
      )}
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
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

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
      setIsRemovingBg(false);
      setProcessingError(null);
      setSourceFile(file);
      setUploadedAssetId(asset.id);
      setImageSrc(asset.image);
      setShowProcessedImage(true);
      setHistoryStack([]);
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : 'No se pudo cargar la imagen.');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadFile(file);
    event.currentTarget.value = '';
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage || isRemovingBg) return;
    setIsRemovingBg(true);
    setProcessingError(null);
    try {
      setHistoryStack((prev) => [...prev, selectedImage]);
      const resultDataUrl = await removeBackgroundLocal(selectedImage, {
        tolerance: 32,
        feather: 1,
      });
      replaceProcessedImage(resultDataUrl);
      setShowProcessedImage(true);
    } catch (error) {
      setProcessingError(
        error instanceof Error ? error.message : 'No se pudo eliminar el fondo de la imagen.',
      );
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    replaceProcessedImage(previous);
    setShowProcessedImage(true);
  };

  const handleDuplicate = () => {
    if (!selectedImage) return;
    setHistoryStack((prev) => [...prev, selectedImage]);
  };

  const handleClearImage = () => {
    if (selectedImage) {
      setHistoryStack((prev) => [...prev, selectedImage]);
    }
    setImageSrc(null);
    setSourceFile(null);
    replaceProcessedImage(null);
    setProcessedDimensions(null);
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
  // La referencia usa un lienzo vertical deliberadamente dominante. Su alto se
  // conserva proporcional al documento y el área de trabajo recorta solo su
  // vista, sin deformar el contenido.
  const rulerSpace = 28;
  const workspaceInset = Math.max(32, Math.round(workspaceSize.width * 0.034));
  const availWidth = Math.max(100, workspaceSize.width - workspaceInset * 2 - rulerSpace);
  const ratio = safeWidthCm / safeHeightCm;

  // El escalado parte de la densidad visible de la regla en la referencia
  // (≈11.47 px por cm para un documento de 58 cm) y se adapta al ancho real
  // del workspace. Así el lienzo conserva la ocupación visual del master sin
  // depender de un porcentaje fijo del contenedor.
  const referenceWorkspaceWidth = 1183;
  const referenceRulerDensity = 11.47;
  const responsiveRulerDensity =
    referenceRulerDensity * (workspaceSize.width / referenceWorkspaceWidth);
  const canvasWidthPx = Math.min(
    availWidth,
    Math.round(safeWidthCm * responsiveRulerDensity),
  );
  const canvasHeightPx = Math.round(canvasWidthPx / ratio);

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
      <header className="z-20 flex h-20 min-h-20 shrink-0 items-center border-b border-[#e2e8f0] bg-white px-[clamp(16px,1.9vw,32px)]">
        {/* Izquierda: logo + menú */}
        <div className="flex min-w-0 items-center gap-[clamp(26px,4.55vw,76px)]">
          <Link
            to="/designer/easy"
            aria-label="PrintShop, modo básico"
            className="flex shrink-0 items-center gap-4"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4f46e5] text-[16px] font-bold text-white shadow-xs">
              P
            </span>
            <span className="text-[17px] font-bold tracking-tight text-[#0f172a]">
              PrintShop
            </span>
          </Link>

          <nav
            aria-label="Menú del editor"
            className="hidden items-center gap-[clamp(18px,1.9vw,32px)] text-[clamp(13px,0.9vw,15px)] font-medium text-[#475569] lg:flex"
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
        <div className="ml-[clamp(52px,7.95vw,133px)] flex shrink-0 items-center justify-center">
          <label className="flex h-[clamp(44px,3.35vw,56px)] w-[clamp(220px,16.45vw,275px)] cursor-pointer items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-white px-4 shadow-xs">
            <Shirt className="h-6 w-6 shrink-0 text-[#4f46e5]" strokeWidth={2} />
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
        <div className="ml-auto flex min-w-0 items-center justify-end gap-[clamp(4px,0.7vw,12px)]">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Deshacer"
              title="Deshacer"
              className="rounded-lg p-1.5 text-[#94a3b8] hover:bg-[#f1f5f9] transition-colors"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Rehacer"
              title="Rehacer"
              className="rounded-lg p-1.5 text-[#94a3b8] hover:bg-[#f1f5f9] transition-colors"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom pill */}
          <div className="flex h-[clamp(36px,2.63vw,44px)] items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-[clamp(9px,0.95vw,16px)] text-[clamp(12px,0.9vw,15px)] font-medium text-[#334155] shadow-xs">
            <RotateCcw className="h-3.5 w-3.5 text-[#64748b]" />
            <span>100%</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#94a3b8]" />
          </div>

          {/* Herramienta mano */}
          <button
            type="button"
            aria-label="Herramienta mano"
            title="Herramienta mano"
            className="flex h-[clamp(36px,2.63vw,44px)] w-[clamp(36px,2.63vw,44px)] shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white text-[#475569] shadow-xs hover:bg-[#f8fafc] transition-colors"
          >
            <Hand className="h-4 w-4" />
          </button>

          {/* Descargar PNG */}
          <button
            type="button"
            className="flex h-[clamp(38px,2.87vw,48px)] shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] bg-[#f1f3f6] px-[clamp(10px,1.2vw,20px)] text-[clamp(12px,0.9vw,15px)] font-semibold text-[#1e293b] hover:bg-[#e2e8f0] transition-colors"
          >
            Descargar PNG
          </button>

          {/* Descargar PDF */}
          <button
            type="button"
            className="flex h-[clamp(38px,2.87vw,48px)] shrink-0 items-center justify-center rounded-xl bg-[#4f46e5] px-[clamp(10px,1.2vw,20px)] text-[clamp(12px,0.9vw,15px)] font-semibold text-white shadow-xs hover:bg-[#4338ca] transition-colors"
          >
            Descargar PDF
          </button>

          {/* Más opciones */}
          <button
            type="button"
            aria-label="Más opciones"
            className="rounded-lg p-1.5 text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          CUERPO PRINCIPAL — Toolbar + Panel + Workspace
      ══════════════════════════════════════════════════════════ */}
      <div
        className="grid min-h-0 flex-1 overflow-hidden"
        style={{
          gridTemplateColumns: 'clamp(68px, 6.46vw, 108px) clamp(304px, 22.85vw, 382px) minmax(0, 1fr)',
        }}
      >
        {/* ─── SIDEBAR TOOLBAR ─── 76px de ancho como en la referencia */}
        <nav
          aria-label="Herramientas de Modo Básico"
          className="flex min-w-0 flex-col items-center gap-[clamp(6px,0.48vw,8px)] overflow-y-auto border-r border-[#e2e8f0] bg-white py-[clamp(10px,0.95vw,16px)]"
        >
          {sidebarTools.map((tool) => {
            const Icon = tool.icon;
            if (tool.active) {
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ backgroundColor: '#eff2fe' }}
                  className="mx-[clamp(6px,0.95vw,16px)] flex h-[clamp(58px,5.08vw,85px)] shrink-0 self-stretch flex-col items-center justify-center gap-1 rounded-xl text-[#4f46e5] transition-colors"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                  <span className="text-[11px] font-semibold">{tool.label}</span>
                </button>
              );
            }

            return (
              <button
                key={tool.id}
                type="button"
                className="mx-[clamp(6px,0.95vw,16px)] flex h-[clamp(58px,5.08vw,85px)] shrink-0 self-stretch flex-col items-center justify-center gap-1 rounded-lg text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                <Icon className="h-5 w-5" strokeWidth={1.6} />
                <span className="text-[11px] font-medium">{tool.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ─── PANEL LATERAL DE CONFIGURACIÓN ─── */}
        <aside className="flex min-w-0 flex-col overflow-y-auto border-r border-[#e2e8f0] bg-white px-[clamp(18px,1.43vw,24px)] py-3">
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

          </section>

          {/* 2. LIENZO */}
          <section className="mt-3 border-t border-[#eef0f4] pt-3">
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
              <SteppedInput
                label="Resolución"
                min="72"
                max="2400"
                step="1"
                value={canvasSettings.dpi}
                onChange={handleDpiChange}
                onStep={stepDpi}
                suffix="DPI"
              />
            </div>
          </section>

          {/* 3. FONDO DEL LIENZO */}
          <section className="mt-3 border-t border-[#eef0f4] pt-3">
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
                    {option.id === 'transparent' ? (
                      <svg className="h-8 w-8 rounded-full" viewBox="0 0 32 32">
                        <defs>
                          <pattern id={`checkers-${option.id}`} width="8" height="8" patternUnits="userSpaceOnUse">
                            <rect width="4" height="4" fill="#ffffff" />
                            <rect x="4" width="4" height="4" fill="#cbd5e1" />
                            <rect y="4" width="4" height="4" fill="#cbd5e1" />
                            <rect x="4" y="4" width="4" height="4" fill="#ffffff" />
                          </pattern>
                        </defs>
                        <circle cx="16" cy="16" r="15" fill={`url(#checkers-${option.id})`} stroke="#cbd5e1" strokeWidth="1" />
                      </svg>
                    ) : (
                      <span
                        className="h-8 w-8 rounded-full border border-[#cbd5e1]"
                        style={{ backgroundColor: option.color ?? '#ffffff' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. ACCIONES DEL DISEÑO */}
          <section className="mt-3 border-t border-[#eef0f4] pt-3">
            <h2 className="mb-3 text-[15px] font-bold text-[#0f172a]">
              Acciones del diseño
            </h2>

            {/* Acción sobre la imagen ya cargada; nunca abre un segundo cargador. */}
            <button
              type="button"
              onClick={handleRemoveBackground}
              disabled={!selectedImage || isRemovingBg}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#18181b] px-4 text-[12px] font-bold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isRemovingBg ? 'ELIMINANDO FONDO…' : 'ELIMINAR FONDO'}
            </button>

            {/* Fila de 3 botones: ATRÁS, DUPLICAR, BORRAR */}
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyStack.length === 0}
                className="flex h-9 items-center justify-center gap-1 rounded-xl border border-[#e2e8f0] bg-white text-[11px] font-bold uppercase text-[#334155] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <RotateCcw className="h-3 w-3" />
                <span>ATRÁS</span>
              </button>
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={!selectedImage}
                className="flex h-9 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white text-[11px] font-bold uppercase text-[#334155] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-45"
              >
                DUPLICAR
              </button>
              <button
                type="button"
                onClick={handleClearImage}
                disabled={!selectedImage}
                className="flex h-9 items-center justify-center rounded-xl border border-[#fecaca] bg-white text-[11px] font-bold uppercase text-[#ef4444] transition-colors hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-45"
              >
                BORRAR
              </button>
            </div>

            {/* Banner naranja: Eliminar semitransparencias */}
            <div className="mt-3.5 flex items-center justify-between rounded-lg border border-[#fed7aa] bg-[#fff7ed] p-3.5">
              <div>
                <p className="text-[13px] font-bold text-[#ea580c]">
                  Eliminar semitransparencias
                </p>
                <p className="text-[11px] text-[#c2410c] mt-0.5">
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
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
                style={{ backgroundColor: removeSemitransparencies ? '#ea580c' : '#cbd5e1' }}
              >
                <span
                  className="inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out"
                  style={{
                    transform: removeSemitransparencies ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>
          </section>
        </aside>

        {/* ─── WORKSPACE (Área central de lienzo dominante) ─── */}
        <main
          ref={workspaceRef}
          aria-label="Área de trabajo del lienzo"
          className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#f4f5f8] select-none"
        >
          {/* Contenedor central: reglas perfectamente unidas al lienzo dominante */}
          <div className="absolute left-[calc(50%-20px)] top-[49px] flex -translate-x-1/2 flex-col items-start">
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
          <div className="absolute right-6 top-9 z-20 flex flex-col items-center gap-1 rounded-2xl border border-[#e2e8f0] bg-white p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <button
              type="button"
              aria-label="Centrar lienzo"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#475569] hover:bg-[#f1f5f9] transition-colors"
            >
              <Crosshair className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Acercar"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#475569] hover:bg-[#f1f5f9] transition-colors"
            >
              <ZoomIn className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Alejar"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#475569] hover:bg-[#f1f5f9] transition-colors"
            >
              <ZoomOut className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <div className="my-0.5 h-px w-5 bg-[#e2e8f0]" />
            <button
              type="button"
              aria-label="Ajustar a pantalla"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#475569] hover:bg-[#f1f5f9] transition-colors"
            >
              <Maximize2 className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
