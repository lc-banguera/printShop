import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CloudUpload,
  Check,
  Circle,
  Copy,
  Crosshair,
  Download,
  Droplets,
  Eraser,
  FilePlus,
  Focus,
  Folder,
  FolderOpen,
  FolderUp,
  Frame,
  Grid2X2,
  Hand,
  Images,
  Layers,
  LayoutGrid,
  Lightbulb,
  Link2,
  LogOut,
  Maximize2,
  MoreVertical,
  Network,
  Palette,
  Redo2,
  RotateCcw,
  Ruler,
  Save,
  Scan,
  Scissors,
  Search,
  Shapes,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Thermometer,
  Trash2,
  Type,
  Undo2,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  processArtworkImageUrl,
  processRasterImageUrl,
  type HalftoneOptions,
} from "@/core/design/processing";
import type { DesignResource } from "@/types/design-resource";
import {
  registerUploadedDesign,
  releaseUploadedDesign,
} from "../services/design-resources";
import {
  clearEasyModeSession,
  getEasyModeSession,
  hasEasyModeSession,
  saveEasyModeSession,
  type EasyModeSession,
} from "../services/designer-mode-session";
import {
  createDesigner3Document,
  createDesigner3DocumentId,
  loadDesigner3Document,
  saveDesigner3Snapshot,
  updateDesigner3DocumentModel,
} from "../services/designer3-document-session";
import type { DesignElement, Layer } from "@/core/design/types";
import { useToast } from "@/shared/components/Toast/Toast";
import {
  createArtworkTransformMatrix,
  type ArtworkTransform,
} from "../../../../../engine/src/transform/artwork-transform";
import { createPngDpiMetadataPlan } from "../../../../../engine/src/processing/export";
import type { PathPoint, VectorPath } from "../../../../../engine/src/paths";

// ─── Types ───────────────────────────────────────────────────────────────────

type CanvasBackground = "transparent" | "white" | "color";

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

interface CanvasViewport {
  widthPx: number;
  heightPx: number;
  leftPx: number;
  topPx: number;
  zoomPercent: number;
}

interface UploadedAsset extends DesignResource {
  file: File;
  identityKey: string;
}

interface ProcessedImageDimensions {
  width: number;
  height: number;
}

type ArtworkGestureMode = "scale" | "rotate";
type EasyToolId =
  | "adjust"
  | "magic-eraser"
  | "enhance"
  | "vectorize"
  | "halftone"
  | "magic-layers"
  | "eraser"
  | "magic-edit";
type EasyToolStatus =
  | "AVAILABLE"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "NOT_CONFIGURED";

interface EasyAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
}

type MagicLassoPoint = PathPoint;

interface ArtworkGesture {
  pointerId: number;
  mode: ArtworkGestureMode;
  startTransform: ArtworkTransform;
  startDistance: number;
  startAngle: number;
  hasChanged: boolean;
}

const DEFAULT_ARTWORK_TRANSFORM: ArtworkTransform = {
  scale: 1,
  rotationDegrees: 0,
  flipX: false,
  flipY: false,
  offsetX: 0,
  offsetY: 0,
};

interface SemitransparencyResult {
  resultUrl: string;
  previousUrl: string;
  previousDimensions: ProcessedImageDimensions | null;
}

interface EasyImageSnapshot {
  activeUploadedAssetId: string | null;
  processedImageUrl: string | null;
  processedDimensions: ProcessedImageDimensions | null;
  showProcessedImage: boolean;
  removeSemitransparencies: boolean;
  semitransparencyResult: SemitransparencyResult | null;
  artworkTransform: ArtworkTransform;
}

interface EasyImageHistory {
  undo: EasyImageSnapshot[];
  redo: EasyImageSnapshot[];
}

interface UploadedFolderAsset {
  assetId: string;
  relativePath: string;
  identityKey: string;
}

interface UploadedFolder {
  id: string;
  name: string;
  assets: UploadedFolderAsset[];
  ignoredCount?: number;
}

interface UploadedSubfolder {
  name: string;
  path: string;
  assetCount: number;
}

interface BackgroundOption {
  id: string;
  label: string;
  background: CanvasBackground;
  color?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_WIDTH_CM = "58";
const DEFAULT_HEIGHT_CM = "100";
const RULER_WIDTH_PX = 28;
const RULER_HEIGHT_PX = 22;

function calculateCanvasViewport(
  workspaceWidth: number,
  workspaceHeight: number,
  widthCm: number,
  heightCm: number,
): CanvasViewport | null {
  if (
    workspaceWidth <= 0 ||
    workspaceHeight <= 0 ||
    widthCm <= 0 ||
    heightCm <= 0
  ) {
    return null;
  }

  const horizontalMargin = 32;
  const topMargin = 32;
  const bottomReservedSpace = 84;
  const maxCanvasWidth = Math.max(
    1,
    workspaceWidth - horizontalMargin * 2 - RULER_WIDTH_PX * 2,
  );
  const maxCanvasHeight = Math.max(
    1,
    workspaceHeight - topMargin - bottomReservedSpace - RULER_HEIGHT_PX,
  );
  const scale = Math.min(maxCanvasWidth / widthCm, maxCanvasHeight / heightCm);
  const widthPx = widthCm * scale;
  const heightPx = heightCm * scale;

  return {
    widthPx,
    heightPx,
    leftPx: workspaceWidth / 2 - widthPx / 2 - RULER_WIDTH_PX,
    topPx:
      (topMargin + workspaceHeight - bottomReservedSpace - heightPx) / 2 -
      RULER_HEIGHT_PX,
    zoomPercent: Math.round((scale / (96 / 2.54)) * 100),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEasyModeSession(value: unknown): value is EasyModeSession {
  if (!isRecord(value) || !isRecord(value.canvasSettings)) return false;
  const settings = value.canvasSettings;
  return (
    typeof value.documentId === "string" &&
    typeof settings.widthCm === "string" &&
    typeof settings.heightCm === "string" &&
    typeof settings.dpi === "number" &&
    Array.isArray(value.uploadedAssets) &&
    Array.isArray(value.uploadedFolders) &&
    isRecord(value.artworkTransform) &&
    isRecord(value.imageHistory)
  );
}

function readCanvasConfig(locationState: unknown): CanvasConfigState | null {
  if (!isRecord(locationState) || !isRecord(locationState.newCanvasConfig))
    return null;

  const config = locationState.newCanvasConfig;
  const isBackground = (value: unknown): value is CanvasBackground =>
    value === "transparent" || value === "white" || value === "color";

  if (
    typeof config.widthPx !== "number" ||
    !Number.isFinite(config.widthPx) ||
    config.widthPx <= 0 ||
    typeof config.heightPx !== "number" ||
    !Number.isFinite(config.heightPx) ||
    config.heightPx <= 0 ||
    typeof config.dpi !== "number" ||
    !Number.isFinite(config.dpi) ||
    config.dpi <= 0 ||
    !isBackground(config.background) ||
    typeof config.backgroundColor !== "string"
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

function createInitialCanvasSettings(
  locationState: unknown,
): EasyCanvasSettings {
  const config = readCanvasConfig(locationState);
  const dpi = config?.dpi ?? 300;

  if (!config) {
    return {
      widthCm: DEFAULT_WIDTH_CM,
      heightCm: DEFAULT_HEIGHT_CM,
      dpi,
      background: "transparent",
      backgroundColor: "#ffffff",
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
  { id: "transparent", label: "Fondo transparente", background: "transparent" },
  { id: "white", label: "Fondo blanco", background: "white" },
  {
    id: "light-gray",
    label: "Fondo gris claro",
    background: "color",
    color: "#d1d5db",
  },
  {
    id: "gray",
    label: "Fondo gris oscuro",
    background: "color",
    color: "#4b5563",
  },
  { id: "black", label: "Fondo negro", background: "color", color: "#000000" },
];

const sidebarTools = [
  { id: "archivo", label: "Archivos", icon: CloudUpload },
  { id: "subidos", label: "Subidos", icon: Images },
  { id: "texto", label: "Texto", icon: Type },
  { id: "herramientas", label: "Herramientas", icon: SlidersHorizontal },
  { id: "plantillas", label: "Plantillas", icon: LayoutGrid },
  { id: "formas", label: "Formas", icon: Shapes },
  { id: "marcos", label: "Marcos", icon: Frame },
] as const;

function FeatureDevelopmentState() {
  return (
    <div className="flex w-full items-center justify-center">
      <img
        src="/img/desarrollo.png"
        alt="Función en desarrollo"
        className="block h-auto w-full select-none object-contain pointer-events-none"
        loading="eager"
      />
    </div>
  );
}

const easyTools: {
  id: EasyToolId;
  label: string;
  icon: typeof SlidersHorizontal;
  status: EasyToolStatus;
}[] = [
  {
    id: "adjust",
    label: "Ajustar",
    icon: SlidersHorizontal,
    status: "AVAILABLE",
  },
  {
    id: "magic-eraser",
    label: "Eliminador mágico",
    icon: Wand2,
    status: "AVAILABLE",
  },
  {
    id: "enhance",
    label: "Escalar / Mejorar",
    icon: Scan,
    status: "NOT_CONFIGURED",
  },
  {
    id: "vectorize",
    label: "Vectorizar",
    icon: Network,
    status: "NOT_CONFIGURED",
  },
  {
    id: "halftone",
    label: "Semitonos",
    icon: Crosshair,
    status: "AVAILABLE",
  },
  {
    id: "magic-layers",
    label: "Capas mágicas",
    icon: Layers,
    status: "NOT_CONFIGURED",
  },
  {
    id: "eraser",
    label: "Borrador mágico",
    icon: Scissors,
    status: "AVAILABLE",
  },
  {
    id: "magic-edit",
    label: "Edición mágica",
    icon: Sparkles,
    status: "NOT_CONFIGURED",
  },
];

type SidebarToolId = (typeof sidebarTools)[number]["id"];
type UploadedLibraryTab = "images" | "folders";

function getFileIdentityKey(file: File): string {
  return JSON.stringify([
    file.name.toLocaleLowerCase(),
    file.size,
    file.lastModified,
    file.type.toLocaleLowerCase(),
  ]);
}

function normalizeFolderName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

function isBackgroundSelected(
  settings: EasyCanvasSettings,
  option: BackgroundOption,
): boolean {
  if (option.background !== settings.background) return false;
  if (option.background !== "color") return true;
  return settings.backgroundColor.toLowerCase() === option.color?.toLowerCase();
}

function getCanvasColor(settings: EasyCanvasSettings): string {
  if (settings.background === "white") return "#ffffff";
  if (settings.background === "color") return settings.backgroundColor;
  return "transparent";
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
      stroke: isMajor ? "#64748b" : isMedium ? "#94a3b8" : "#cbd5e1",
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
      height={RULER_HEIGHT_PX}
      className="block select-none overflow-visible"
      style={{ width: `${widthPx}px`, height: `${RULER_HEIGHT_PX}px` }}
    >
      <line
        x1={0}
        y1={RULER_HEIGHT_PX}
        x2={widthPx}
        y2={RULER_HEIGHT_PX}
        stroke="#94a3b8"
        strokeWidth={1}
      />
      {ticks.map((t, idx) => (
        <line
          key={`tick-h-${idx}`}
          x1={t.x}
          y1={RULER_HEIGHT_PX - t.height}
          x2={t.x}
          y2={RULER_HEIGHT_PX}
          stroke={t.stroke}
          strokeWidth={1}
        />
      ))}
      {labels.map((l, idx) => {
        let textAnchor: "start" | "middle" | "end" = "middle";
        let posX = l.x;
        if (idx === 0) {
          textAnchor = "start";
          posX = 0;
        } else if (idx === labels.length - 1) {
          textAnchor = "end";
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
      stroke: isMajor ? "#64748b" : isMedium ? "#94a3b8" : "#cbd5e1",
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
      width={RULER_WIDTH_PX}
      height={heightPx}
      className="block select-none overflow-visible"
      style={{ width: `${RULER_WIDTH_PX}px`, height: `${heightPx}px` }}
    >
      <line
        x1={RULER_WIDTH_PX}
        y1={0}
        x2={RULER_WIDTH_PX}
        y2={heightPx}
        stroke="#94a3b8"
        strokeWidth={1}
      />
      {ticks.map((t, idx) => (
        <line
          key={`tick-v-${idx}`}
          x1={RULER_WIDTH_PX - t.width}
          y1={t.y}
          x2={RULER_WIDTH_PX}
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
          ? "flex h-10 items-center rounded-[5px] border border-[#e2e8f0] bg-white focus-within:border-[#4f46e5] focus-within:ring-1 focus-within:ring-[#4f46e5]/20"
          : "relative flex items-center"
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
            ? `h-full min-w-0 flex-1 border-0 bg-transparent pl-3 pr-1 text-[13px] font-semibold text-[#0f172a] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className ?? ""}`
            : `h-9 w-full rounded-[5px] border border-[#e2e8f0] bg-white pl-3 pr-7 text-[13px] font-semibold text-[#0f172a] outline-none [appearance:textfield] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                className ?? ""
              }`
        }
      />
      <div
        className={
          suffix
            ? "flex flex-col items-center px-1"
            : "absolute right-1.5 flex flex-col items-center"
        }
      >
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
  const navigate = useNavigate();
  const documentId = new URLSearchParams(location.search).get("document");
  const cachedSession = getEasyModeSession();
  const modeSessionRef = useRef(
    cachedSession?.documentId === documentId ? cachedSession : null,
  );
  const modeSession = modeSessionRef.current;
  const [isDocumentHydrated, setIsDocumentHydrated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const headerMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const headerMenuRef = useRef<HTMLDivElement | null>(null);
  const uploadOptionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const uploadOptionsMenuRef = useRef<HTMLDivElement | null>(null);

  const [technique, setTechnique] = useState("dtf");
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [canvasSettings, setCanvasSettings] = useState(
    () =>
      modeSession?.canvasSettings ??
      createInitialCanvasSettings(location.state),
  );
  const [canvasViewport, setCanvasViewport] = useState<CanvasViewport | null>(
    null,
  );
  const [canvasZoom, setCanvasZoom] = useState(modeSession?.canvasZoom ?? 1);
  const [canvasPan, setCanvasPan] = useState(
    () => modeSession?.canvasPan ?? { x: 0, y: 0 },
  );
  const [isHandToolActive, setIsHandToolActive] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [activeSidebarTool, setActiveSidebarTool] =
    useState<SidebarToolId>("archivo");
  const [activeEasyTool, setActiveEasyTool] = useState<EasyToolId>("adjust");
  const [isToolsSelectionOpen, setIsToolsSelectionOpen] = useState(true);
  const [openToolPanel, setOpenToolPanel] = useState<EasyToolId | null>("adjust");
  const [openHeaderDropdown, setOpenHeaderDropdown] = useState<
    "archivo" | "editar" | "ver" | "zoom" | null
  >(null);
  const [showRulers, setShowRulers] = useState(true);
  const headerNavRef = useRef<HTMLDivElement | null>(null);
  const zoomPillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!openHeaderDropdown) return;
      const target = e.target as Node;
      if (
        headerNavRef.current?.contains(target) ||
        zoomPillRef.current?.contains(target)
      ) {
        return;
      }
      setOpenHeaderDropdown(null);
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [openHeaderDropdown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        const active = document.activeElement;
        if (
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          active instanceof HTMLSelectElement
        ) {
          return;
        }
        isSpacePressedRef.current = true;
        if (workspaceRef.current) {
          workspaceRef.current.style.cursor = "grab";
        }
        e.preventDefault();
        return;
      }
      if (e.key === "Escape") {
        if (openHeaderDropdown) {
          setOpenHeaderDropdown(null);
        } else if (activeSidebarTool === "herramientas") {
          if (openToolPanel !== null) {
            setOpenToolPanel(null);
          } else if (isToolsSelectionOpen) {
            setIsToolsSelectionOpen(false);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        isSpacePressedRef.current = false;
        if (workspaceRef.current && !isHandToolActive) {
          workspaceRef.current.style.cursor = "";
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeSidebarTool, openToolPanel, isToolsSelectionOpen, openHeaderDropdown, isHandToolActive]);
  const [adjustments, setAdjustments] = useState<EasyAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });
  const [halftoneOptions, setHalftoneOptions] = useState<HalftoneOptions>({
    cellSize: 8,
    angle: 45,
    dotColor: "original",
    bgColor: "transparent",
    intensity: 100,
    contrast: 100,
    shape: "circle",
  });
  const [toolStatuses, setToolStatuses] = useState<
    Record<EasyToolId, EasyToolStatus>
  >({
    adjust: "AVAILABLE",
    "magic-eraser": "AVAILABLE",
    enhance: "NOT_CONFIGURED",
    vectorize: "NOT_CONFIGURED",
    halftone: "AVAILABLE",
    "magic-layers": "NOT_CONFIGURED",
    eraser: "AVAILABLE",
    "magic-edit": "NOT_CONFIGURED",
  });
  const [magicEraserMode, setMagicEraserMode] = useState<"select" | "lasso">(
    "select",
  );
  const [magicLassoCursor, setMagicLassoCursor] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState(2);
  const [magicMaskPreviewUrl, setMagicMaskPreviewUrl] = useState<string | null>(
    null,
  );
  const [hasMagicMask, setHasMagicMask] = useState(false);
  const [magicLassoPoints, setMagicLassoPoints] = useState<MagicLassoPoint[]>([]);
  const [isMagicLassoClosed, setIsMagicLassoClosed] = useState(false);
  const magicMaskBlobRef = useRef<Blob | null>(null);
  const maskPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const artworkImageRef = useRef<HTMLImageElement | null>(null);
  const magicLassoGenerationRef = useRef(0);
  const [keepRatio, setKeepRatio] = useState(false);
  const [canvasRatio, setCanvasRatio] = useState(
    () =>
      Number(canvasSettings.widthCm) /
      Math.max(0.1, Number(canvasSettings.heightCm)),
  );
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>(
    () => modeSession?.uploadedAssets ?? [],
  );
  const [uploadedFolders, setUploadedFolders] = useState<UploadedFolder[]>(
    () => modeSession?.uploadedFolders ?? [],
  );
  const [activeUploadedAssetId, setActiveUploadedAssetId] = useState<
    string | null
  >(() => modeSession?.activeUploadedAssetId ?? null);
  const [uploadedLibraryTab, setUploadedLibraryTab] =
    useState<UploadedLibraryTab>(
      () => modeSession?.uploadedLibraryTab ?? "images",
    );
  const [activeUploadedFolderId, setActiveUploadedFolderId] = useState<
    string | null
  >(() => modeSession?.activeUploadedFolderId ?? null);
  const [activeUploadedFolderPath, setActiveUploadedFolderPath] = useState(
    () => modeSession?.activeUploadedFolderPath ?? "",
  );
  const [uploadSearch, setUploadSearch] = useState(
    () => modeSession?.uploadSearch ?? "",
  );
  const [isUploadOptionsOpen, setIsUploadOptionsOpen] = useState(false);
  const { showToast } = useToast();
  const [isImportingFolder, setIsImportingFolder] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    () => modeSession?.processedImageUrl ?? null,
  );
  const [processedDimensions, setProcessedDimensions] =
    useState<ProcessedImageDimensions | null>(
      () => modeSession?.processedDimensions ?? null,
    );
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showProcessedImage, setShowProcessedImage] = useState(
    () => modeSession?.showProcessedImage ?? true,
  );
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [removeSemitransparencies, setRemoveSemitransparencies] = useState(
    () => modeSession?.removeSemitransparencies ?? false,
  );
  const [imageHistory, setImageHistory] = useState<EasyImageHistory>(
    () => modeSession?.imageHistory ?? { undo: [], redo: [] },
  );
  const [artworkTransform, setArtworkTransform] = useState<ArtworkTransform>(
    () => modeSession?.artworkTransform ?? DEFAULT_ARTWORK_TRANSFORM,
  );
  const [artworkDimensions, setArtworkDimensions] =
    useState<ProcessedImageDimensions | null>(
      () => modeSession?.artworkDimensions ?? null,
    );
  const [isArtworkSelected, setIsArtworkSelected] = useState(
    () => modeSession?.isArtworkSelected ?? true,
  );
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const processingRequestId = useRef(0);
  const panDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);
  const artworkGestureRef = useRef<ArtworkGesture | null>(null);
  const artworkDragRef = useRef<{
    pointerId: number;
    lastX: number;
    lastY: number;
    hasChanged: boolean;
  } | null>(null);
  const ownedProcessedImageUrlsRef = useRef(
    new Set(modeSession?.ownedProcessedImageUrls ?? []),
  );
  const uploadedAssetIdsRef = useRef(
    new Set(modeSession?.uploadedAssets.map((asset) => asset.id) ?? []),
  );
  const semitransparencyResultRef = useRef<SemitransparencyResult | null>(
    modeSession?.semitransparencyResult ?? null,
  );
  const isSpacePressedRef = useRef(false);
  const [cursorCanvasPos, setCursorCanvasPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isHeaderMenuOpen) return;

    const firstMenuItem =
      headerMenuRef.current?.querySelector<HTMLButtonElement>(
        '[role="menuitemradio"], [role="menuitem"]',
      );
    firstMenuItem?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !headerMenuRef.current?.contains(target) &&
        !headerMenuButtonRef.current?.contains(target)
      ) {
        setIsHeaderMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsHeaderMenuOpen(false);
        headerMenuButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHeaderMenuOpen]);

  useEffect(() => {
    if (!isUploadOptionsOpen) return;

    uploadOptionsMenuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      ?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !uploadOptionsMenuRef.current?.contains(target) &&
        !uploadOptionsButtonRef.current?.contains(target)
      ) {
        setIsUploadOptionsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsUploadOptionsOpen(false);
        uploadOptionsButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUploadOptionsOpen]);

  const widthCm = Number(canvasSettings.widthCm) || 0;
  const heightCm = Number(canvasSettings.heightCm) || 0;
  const safeWidthCm = Math.max(0.1, widthCm);
  const safeHeightCm = Math.max(0.1, heightCm);
  const activeUploadedAsset =
    uploadedAssets.find((asset) => asset.id === activeUploadedAssetId) ?? null;
  const selectedImage =
    showProcessedImage && processedImageUrl
      ? processedImageUrl
      : (activeUploadedAsset?.image ?? null);
  const handleSwitchToAdvanced = () => {
    if (!documentId || !isDocumentHydrated) {
      showToast({
        type: "error",
        title: "Documento no disponible",
        message:
          "Espera a que el documento termine de cargarse antes de cambiar de modo.",
      });
      return;
    }

    const session: EasyModeSession = {
      documentId,
      canvasSettings,
      canvasZoom,
      canvasPan,
      uploadedAssets,
      uploadedFolders,
      activeUploadedAssetId,
      uploadedLibraryTab,
      activeUploadedFolderId,
      activeUploadedFolderPath,
      uploadSearch,
      processedImageUrl,
      processedDimensions,
      showProcessedImage,
      removeSemitransparencies,
      semitransparencyResult: semitransparencyResultRef.current,
      imageHistory,
      artworkTransform,
      artworkDimensions,
      isArtworkSelected,
      imageUrl: selectedImage,
      ownedProcessedImageUrls: [...ownedProcessedImageUrlsRef.current],
      advancedElementId: modeSession?.advancedElementId ?? null,
      advancedElementBaseSize: modeSession?.advancedElementBaseSize ?? null,
      advancedImageUrl: modeSession?.advancedImageUrl ?? null,
      previousAdvancedZoneId: modeSession?.previousAdvancedZoneId ?? null,
    };
    saveEasyModeSession(session);
    setIsHeaderMenuOpen(false);
    navigate(
      `/store/designer/advanced?document=${encodeURIComponent(documentId)}`,
    );
    void saveDesigner3Snapshot(documentId, "easy", session).catch(
      (error: unknown) => {
        showToast({
          type: "error",
          title: "No se pudo guardar el documento",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo guardar el documento para continuar en modo avanzado.",
        });
      },
    );
  };
  const activeUploadedFolder =
    uploadedFolders.find((folder) => folder.id === activeUploadedFolderId) ??
    null;
  const uploadSearchTerm = uploadSearch.trim().toLocaleLowerCase();
  const matchingUploadedAssets = uploadedAssets.filter((asset) =>
    asset.name.toLocaleLowerCase().includes(uploadSearchTerm),
  );
  const matchingUploadedFolders = uploadedFolders.filter(
    (folder) =>
      folder.name.toLocaleLowerCase().includes(uploadSearchTerm) ||
      folder.assets.some((entry) =>
        entry.relativePath.toLocaleLowerCase().includes(uploadSearchTerm),
      ),
  );
  const activeFolderContents = (() => {
    const subfolders = new Map<string, UploadedSubfolder>();
    const images: UploadedAsset[] = [];
    if (!activeUploadedFolder) return { subfolders: [], images };

    const pathPrefix = activeUploadedFolderPath
      ? `${activeUploadedFolderPath}/`
      : "";
    for (const entry of activeUploadedFolder.assets) {
      if (pathPrefix && !entry.relativePath.startsWith(pathPrefix)) continue;
      const relativeToCurrent = entry.relativePath.slice(pathPrefix.length);
      const [firstSegment, ...remainingSegments] = relativeToCurrent.split("/");
      if (!firstSegment) continue;

      if (remainingSegments.length > 0) {
        const nestedPath = pathPrefix
          ? `${pathPrefix}${firstSegment}`
          : firstSegment;
        const existingSubfolder = subfolders.get(nestedPath);
        const assetCount = existingSubfolder?.assetCount ?? 0;
        subfolders.set(nestedPath, {
          name: firstSegment,
          path: nestedPath,
          assetCount: assetCount + 1,
        });
        continue;
      }

      const asset = uploadedAssets.find(
        (candidate) => candidate.id === entry.assetId,
      );
      if (asset) images.push(asset);
    }

    return {
      subfolders: [...subfolders.values()],
      images: images.filter((asset) =>
        asset.name.toLocaleLowerCase().includes(uploadSearchTerm),
      ),
    };
  })();

  const handleHeaderMenuKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="menuitemradio"], [role="menuitem"]',
      ),
    );
    if (items.length === 0) return;

    const currentIndex = items.findIndex(
      (item) => item === document.activeElement,
    );
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (currentIndex +
              (event.key === "ArrowDown" ? 1 : -1) +
              items.length) %
            items.length;
    items[nextIndex]?.focus();
  };

  const handleUploadOptionsKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsUploadOptionsOpen(false);
      uploadOptionsButtonRef.current?.focus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ),
    );
    if (items.length === 0) return;

    const currentIndex = items.findIndex(
      (item) => item === document.activeElement,
    );
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (currentIndex +
              (event.key === "ArrowDown" ? 1 : -1) +
              items.length) %
            items.length;
    items[nextIndex]?.focus();
  };

  const handleExitDesigner = () => {
    setIsHeaderMenuOpen(false);
    navigate(documentId ? "/store/designerv" : "/products");
  };

  const fitCanvasToWorkspace = () => {
    const el = workspaceRef.current;
    if (!el) return;

    const { width, height } = el.getBoundingClientRect();
    setCanvasViewport(
      calculateCanvasViewport(width, height, safeWidthCm, safeHeightCm),
    );
    setCanvasZoom(1);
    setCanvasPan({ x: 0, y: 0 });
  };

  const centerCanvasInWorkspace = () => {
    setCanvasZoom(1);
    setCanvasPan({ x: 0, y: 0 });
    const el = workspaceRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setCanvasViewport(
      calculateCanvasViewport(width, height, safeWidthCm, safeHeightCm),
    );
  };

  const changeCanvasZoom = (direction: 1 | -1) => {
    setCanvasZoom((current) =>
      Math.min(
        4,
        Math.max(
          0.25,
          Number((current * (direction > 0 ? 1.15 : 0.87)).toFixed(3)),
        ),
      ),
    );
  };

  const handleWorkspacePointerDown = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    const isPanTrigger =
      isHandToolActive ||
      isSpacePressedRef.current ||
      event.button === 1; // middle mouse
    if (!isPanTrigger) return;
    if (event.button === 0 && !isHandToolActive && !isSpacePressedRef.current) return;
    if (
      event.target instanceof Element &&
      event.target.closest("button, input, select, textarea, [role='button']")
    ) {
      return;
    }

    const workspace = workspaceRef.current;
    if (!workspace) return;

    event.preventDefault();
    workspace.setPointerCapture(event.pointerId);
    panDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: canvasPan.x,
      startPanY: canvasPan.y,
    };
    setIsPanning(true);
  };

  const handleWorkspaceWheel = (event: React.WheelEvent<HTMLElement>) => {
    event.preventDefault();
    const workspace = workspaceRef.current;
    if (!workspace) return;

    const rect = workspace.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    const factor = event.deltaY < 0 ? 1.1 : 0.9;
    setCanvasZoom((current) => {
      const next = Math.min(10, Math.max(0.1, Number((current * factor).toFixed(4))));
      // Anchor zoom to cursor position
      const scale = next / current;
      setCanvasPan((pan) => ({
        x: pointerX - scale * (pointerX - pan.x),
        y: pointerY - scale * (pointerY - pan.y),
      }));
      return next;
    });
  };

  const handleWorkspacePointerMove = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    const drag = panDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setCanvasPan({
      x: drag.startPanX + event.clientX - drag.startX,
      y: drag.startPanY + event.clientY - drag.startY,
    });
  };

  const finishWorkspacePan = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = panDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    panDragRef.current = null;
    setIsPanning(false);
    const workspace = workspaceRef.current;
    if (workspace?.hasPointerCapture(event.pointerId)) {
      workspace.releasePointerCapture(event.pointerId);
    }
  };

  const clearMagicMask = () => {
    magicLassoGenerationRef.current += 1;
    magicMaskBlobRef.current = null;
    setHasMagicMask(false);
    setMagicLassoPoints([]);
    setIsMagicLassoClosed(false);
    setMagicLassoCursor(null);
    setMagicMaskPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    const previewContext = maskPreviewCanvasRef.current?.getContext("2d");
    if (previewContext && maskPreviewCanvasRef.current) {
      previewContext.clearRect(
        0,
        0,
        maskPreviewCanvasRef.current.width,
        maskPreviewCanvasRef.current.height,
      );
    }
  };

  const drawMagicLassoPreview = (
    points: MagicLassoPoint[],
    cursor: MagicLassoPoint | null,
    closed: boolean,
    showEraseArea = true,
  ) => {
    const canvas = maskPreviewCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (closed && showEraseArea && points.length >= 3) {
      context.fillStyle = "rgba(239,68,68,0.38)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = "destination-out";
      context.fillStyle = "#000000";
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.closePath();
      context.fill();
      context.globalCompositeOperation = "source-over";
    }

    if (points.length === 0) return;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    if (closed) context.closePath();
    else if (cursor) context.lineTo(cursor.x, cursor.y);
    context.setLineDash(closed ? [8, 5] : []);
    context.lineWidth = Math.max(1, canvas.width / 500);
    context.strokeStyle = "rgba(15,23,42,0.9)";
    context.stroke();
    context.lineDashOffset = closed ? 6 : 0;
    context.strokeStyle = "#ffffff";
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = "#ffffff";
    context.strokeStyle = "rgba(15,23,42,0.9)";
    context.lineWidth = Math.max(1, canvas.width / 700);
    for (const point of points) {
      context.beginPath();
      context.arc(
        point.x,
        point.y,
        Math.max(2, canvas.width / 150),
        0,
        Math.PI * 2,
      );
      context.fill();
      context.stroke();
    }
  };

  const finishMagicLasso = async (points: MagicLassoPoint[]) => {
    const image = artworkImageRef.current;
    if (!selectedImage || !image || points.length < 3 || isProcessing) return;
    const generation = magicLassoGenerationRef.current;
    setIsMagicLassoClosed(true);
    drawMagicLassoPreview(points, null, true);
    const anchors = points.map((point, index) => ({
      id: `anchor-${index}`,
      ...point,
      type: "CORNER" as const,
    }));
    const path: VectorPath = {
      id: `magic-lasso-${generation}`,
      closed: true,
      anchors,
      segments: anchors.map((anchor, index) => ({
        id: `segment-${index}`,
        type: "LINE" as const,
        startAnchorId: anchor.id,
        endAnchorId: anchors[(index + 1) % anchors.length].id,
      })),
    };

    setIsProcessing(true);
    setProcessingError(null);
    setToolStatuses((current) => ({ ...current, "magic-eraser": "PROCESSING" }));
    try {
      const result = await processRasterImageUrl(selectedImage, {
        kind: "create-path-selection",
        path,
      });
      if (generation !== magicLassoGenerationRef.current) return;
      magicMaskBlobRef.current = result.blob;
      setHasMagicMask(true);
      const previewUrl = URL.createObjectURL(result.blob);
      setMagicMaskPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return previewUrl;
      });
      drawMagicLassoPreview(points, null, true, false);
      setToolStatuses((current) => ({ ...current, "magic-eraser": "SUCCESS" }));
    } catch (error) {
      if (generation === magicLassoGenerationRef.current) {
        setHasMagicMask(false);
        setToolStatuses((current) => ({ ...current, "magic-eraser": "FAILED" }));
        setProcessingError(
          error instanceof Error
            ? error.message
            : "No se pudo preparar la selección del contorno.",
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMagicRegionSelect = async (
    event: ReactPointerEvent<HTMLImageElement>,
  ) => {
    if (!selectedImage || isProcessing || isRemovingBg) return;
    clearMagicMask();
    const image = event.currentTarget;
    const bounds = image.getBoundingClientRect();
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height || !bounds.width || !bounds.height) return;
    const x = Math.min(
      width - 1,
      Math.max(
        0,
        Math.floor(((event.clientX - bounds.left) / bounds.width) * width),
      ),
    );
    const y = Math.min(
      height - 1,
      Math.max(
        0,
        Math.floor(((event.clientY - bounds.top) / bounds.height) * height),
      ),
    );
    const statusKey = activeEasyTool === "eraser" ? "eraser" : "magic-eraser";
    setToolStatuses((current) => ({ ...current, [statusKey]: "PROCESSING" }));
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const result = await processRasterImageUrl(selectedImage, {
        kind: "select-color-region",
        x,
        y,
        tolerance: 32,
      });
      const previewUrl = URL.createObjectURL(result.blob);
      magicMaskBlobRef.current = result.blob;
      setHasMagicMask(true);
      setMagicMaskPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return previewUrl;
      });
      setToolStatuses((current) => ({ ...current, [statusKey]: "SUCCESS" }));
    } catch (error) {
      setToolStatuses((current) => ({ ...current, [statusKey]: "FAILED" }));
      setProcessingError(
        error instanceof Error
          ? error.message
          : "No se pudo seleccionar la región de la imagen.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLassoPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (
      magicEraserMode !== "lasso" ||
      !selectedImage ||
      isProcessing ||
      isRemovingBg
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus();
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    const width =
      artworkImageRef.current?.naturalWidth ||
      artworkDimensions?.width ||
      canvas.width;
    const height =
      artworkImageRef.current?.naturalHeight ||
      artworkDimensions?.height ||
      canvas.height;
    if (!bounds.width || !bounds.height || !width || !height) return;
    canvas.width = width;
    canvas.height = height;

    const point = {
      x: Math.min(
        width,
        Math.max(0, ((event.clientX - bounds.left) / bounds.width) * width),
      ),
      y: Math.min(
        height,
        Math.max(0, ((event.clientY - bounds.top) / bounds.height) * height),
      ),
    };
    if (isMagicLassoClosed) return;

    const firstPoint = magicLassoPoints[0];
    if (firstPoint && magicLassoPoints.length >= 3) {
      const distanceX = ((point.x - firstPoint.x) / width) * bounds.width;
      const distanceY = ((point.y - firstPoint.y) / height) * bounds.height;
      if (Math.hypot(distanceX, distanceY) <= 14) {
        void finishMagicLasso(magicLassoPoints);
        return;
      }
    }

    const nextPoints = [...magicLassoPoints, point];
    if (magicLassoPoints.length === 0) setProcessingError(null);
    setMagicLassoPoints(nextPoints);
    setToolStatuses((current) => ({ ...current, "magic-eraser": "AVAILABLE" }));
    drawMagicLassoPreview(nextPoints, null, false);
  };

  const handleLassoDoubleClick = (event: ReactMouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (magicLassoPoints.length >= 3 && !isMagicLassoClosed) {
      void finishMagicLasso(magicLassoPoints);
    }
  };

  const handleLassoPointerMove = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height || magicLassoPoints.length === 0) return;
    const cursor = {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
    setMagicLassoCursor({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    if (!isMagicLassoClosed) {
      drawMagicLassoPreview(magicLassoPoints, cursor, false);
    }
  };

  const handleLassoKeyDown = (
    event: React.KeyboardEvent<HTMLCanvasElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      clearMagicMask();
    } else if (event.key === "Backspace" && !isMagicLassoClosed) {
      event.preventDefault();
      const nextPoints = magicLassoPoints.slice(0, -1);
      setMagicLassoPoints(nextPoints);
      drawMagicLassoPreview(nextPoints, null, false);
    }
  };

  const applyMagicMask = async () => {
    if (!selectedImage || isProcessing || isRemovingBg) return;
    const mask = magicMaskBlobRef.current;
    if (!mask) {
      setProcessingError(
        "Selecciona una región o dibuja un trazo antes de aplicar.",
      );
      return;
    }
    const statusKey = activeEasyTool === "eraser" ? "eraser" : "magic-eraser";
    const requestId = ++processingRequestId.current;
    const previousState = captureImageSnapshot();
    setToolStatuses((current) => ({ ...current, [statusKey]: "PROCESSING" }));
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const result = await processRasterImageUrl(selectedImage, {
        kind: "erase-mask",
        mask,
      });
      if (requestId !== processingRequestId.current) return;
      const resultUrl = URL.createObjectURL(result.blob);
      ownedProcessedImageUrlsRef.current.add(resultUrl);
      recordImageChange(previousState);
      replaceProcessedImage(resultUrl);
      setProcessedDimensions({ width: result.width, height: result.height });
      setShowProcessedImage(true);
      setToolStatuses((current) => ({ ...current, [statusKey]: "SUCCESS" }));
      clearMagicMask();
    } catch (error) {
      if (requestId === processingRequestId.current) {
        setToolStatuses((current) => ({ ...current, [statusKey]: "FAILED" }));
        setProcessingError(
          error instanceof Error
            ? error.message
            : "No se pudo aplicar el borrador.",
        );
      }
    } finally {
      if (requestId === processingRequestId.current) setIsProcessing(false);
    }
  };

  const handleArtworkPointerDown = (
    event: ReactPointerEvent<HTMLImageElement>,
  ) => {
    if (
      (activeEasyTool === "magic-eraser" && magicEraserMode === "select") ||
      activeEasyTool === "eraser"
    ) {
      event.preventDefault();
      event.stopPropagation();
      setIsArtworkSelected(true);
      void handleMagicRegionSelect(event);
      return;
    }
    if (
      isHandToolActive ||
      event.button !== 0 ||
      !selectedImage ||
      !canvasViewport
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setIsArtworkSelected(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    artworkDragRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
      hasChanged: false,
    };
  };

  const handleArtworkPointerMove = (
    event: ReactPointerEvent<HTMLImageElement>,
  ) => {
    const drag = artworkDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !canvasViewport) return;

    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    if (deltaX === 0 && deltaY === 0) return;

    if (!drag.hasChanged) {
      recordImageChange();
      drag.hasChanged = true;
    }

    const canvasWidth = Math.max(1, canvasViewport.widthPx - 2);
    const canvasHeight = Math.max(1, canvasViewport.heightPx - 2);
    setArtworkTransform((current) => ({
      ...current,
      offsetX: current.offsetX + deltaX / (canvasWidth * canvasZoom),
      offsetY: current.offsetY + deltaY / (canvasHeight * canvasZoom),
    }));
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
  };

  const finishArtworkDrag = (event: ReactPointerEvent<HTMLImageElement>) => {
    const drag = artworkDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    artworkDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleArtworkGesturePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    mode: ArtworkGestureMode,
  ) => {
    if (!selectedImage || !canvasViewport || isHandToolActive) return;
    event.preventDefault();
    event.stopPropagation();
    const canvas = event.currentTarget.closest<HTMLElement>(
      "[data-artwork-canvas]",
    );
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const canvasX = (event.clientX - bounds.left) / canvasZoom;
    const canvasY = (event.clientY - bounds.top) / canvasZoom;
    const deltaX = canvasX - canvasViewport.widthPx / 2;
    const deltaY = canvasY - canvasViewport.heightPx / 2;
    setIsArtworkSelected(true);
    artworkGestureRef.current = {
      pointerId: event.pointerId,
      mode,
      startTransform: artworkTransform,
      startDistance: Math.max(1, Math.hypot(deltaX, deltaY)),
      startAngle: Math.atan2(deltaY, deltaX),
      hasChanged: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleArtworkGesturePointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const gesture = artworkGestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId || !canvasViewport)
      return;
    const canvas = event.currentTarget.closest<HTMLElement>(
      "[data-artwork-canvas]",
    );
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const canvasX = (event.clientX - bounds.left) / canvasZoom;
    const canvasY = (event.clientY - bounds.top) / canvasZoom;
    const deltaX = canvasX - canvasViewport.widthPx / 2;
    const deltaY = canvasY - canvasViewport.heightPx / 2;
    if (!gesture.hasChanged) {
      recordImageChange();
      gesture.hasChanged = true;
    }

    if (gesture.mode === "scale") {
      const ratio = Math.hypot(deltaX, deltaY) / gesture.startDistance;
      const scale = Math.min(
        4,
        Math.max(0.1, gesture.startTransform.scale * ratio),
      );
      setArtworkTransform({ ...gesture.startTransform, scale });
      return;
    }

    const rawAngleDelta = Math.atan2(deltaY, deltaX) - gesture.startAngle;
    const angleDelta = Math.atan2(
      Math.sin(rawAngleDelta),
      Math.cos(rawAngleDelta),
    );
    setArtworkTransform({
      ...gesture.startTransform,
      rotationDegrees:
        gesture.startTransform.rotationDegrees + angleDelta * (180 / Math.PI),
    });
  };

  const finishArtworkGesture = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const gesture = artworkGestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    artworkGestureRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleExportPng = async () => {
    if (isExporting) return;
    const rasterWidth = Math.round((safeWidthCm / 2.54) * canvasSettings.dpi);
    const rasterHeight = Math.round((safeHeightCm / 2.54) * canvasSettings.dpi);
    if (
      rasterWidth <= 0 ||
      rasterHeight <= 0 ||
      rasterWidth > 16000 ||
      rasterHeight > 16000 ||
      rasterWidth * rasterHeight > 40_000_000
    ) {
      showToast({
        type: "error",
        title: "No se pudo exportar",
        message:
          "Reduce las dimensiones o el DPI para exportar un PNG de hasta 40 megapíxeles.",
      });
      return;
    }

    setIsExporting(true);
    try {
      const output = document.createElement("canvas");
      output.width = rasterWidth;
      output.height = rasterHeight;
      const context = output.getContext("2d", { alpha: true });
      if (!context) {
        throw new Error(
          "El navegador no pudo preparar el lienzo de exportación.",
        );
      }

      if (canvasSettings.background !== "transparent") {
        context.fillStyle = getCanvasColor(canvasSettings);
        context.fillRect(0, 0, rasterWidth, rasterHeight);
      }

      if (selectedImage) {
        const image = new Image();
        image.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () =>
            reject(
              new Error("No se pudo leer la imagen activa para exportarla."),
            );
          image.src = selectedImage;
        });

        const scale = Math.min(
          rasterWidth / image.naturalWidth,
          rasterHeight / image.naturalHeight,
        );
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        const transform = createArtworkTransformMatrix(
          rasterWidth,
          rasterHeight,
          artworkTransform,
        );
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.setTransform(
          transform.a,
          transform.b,
          transform.c,
          transform.d,
          transform.e,
          transform.f,
        );
        context.drawImage(
          image,
          (rasterWidth - width) / 2,
          (rasterHeight - height) / 2,
          width,
          height,
        );
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        output.toBlob(
          (result) =>
            result
              ? resolve(result)
              : reject(new Error("El navegador no pudo codificar el PNG.")),
          "image/png",
        );
      });
      const pngBytes = new Uint8Array(await blob.arrayBuffer());
      const metadataPlan = createPngDpiMetadataPlan(
        pngBytes,
        canvasSettings.dpi,
      );
      const downloadParts: BlobPart[] = [];
      for (const [index, range] of metadataPlan.sourceRanges.entries()) {
        downloadParts.push(blob.slice(range.start, range.end));
        if (index === 0) {
          const metadataBuffer = new ArrayBuffer(
            metadataPlan.resolutionChunk.byteLength,
          );
          new Uint8Array(metadataBuffer).set(metadataPlan.resolutionChunk);
          downloadParts.push(metadataBuffer);
        }
      }
      const downloadBlob = new Blob(downloadParts, { type: "image/png" });
      const downloadUrl = URL.createObjectURL(downloadBlob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      const techClean = technique
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      const wCm = Number(safeWidthCm);
      const hCm = Number(safeHeightCm);
      const exportFilename = `${techClean}_${wCm}x${hCm}cm.png`;
      anchor.download = exportFilename;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      showToast({
        type: "success",
        title: "PNG exportado",
        message: `Lienzo de ${rasterWidth} × ${rasterHeight} px a ${canvasSettings.dpi} DPI.`,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo exportar",
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al exportar PNG.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  useLayoutEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;

    const updateCanvasViewport = (width: number, height: number) => {
      setCanvasViewport(
        calculateCanvasViewport(width, height, safeWidthCm, safeHeightCm),
      );
    };

    const { width, height } = el.getBoundingClientRect();
    updateCanvasViewport(width, height);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateCanvasViewport(entry.contentRect.width, entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [safeHeightCm, safeWidthCm]);

  // Non-passive wheel listener: must use native addEventListener so preventDefault() works.
  // React's synthetic onWheel is passive in some configurations and can't prevent scroll.

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    const listener = (event: WheelEvent) => {
      event.preventDefault();
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const factor = event.deltaY < 0 ? 1.1 : 0.9;
      setCanvasZoom((current) => {
        const next = Math.min(10, Math.max(0.1, Number((current * factor).toFixed(4))));
        const scale = next / current;
        setCanvasPan((pan) => ({
          x: pointerX - scale * (pointerX - pan.x),
          y: pointerY - scale * (pointerY - pan.y),
        }));
        return next;
      });
    };

    workspace.addEventListener("wheel", listener, { passive: false });
    return () => workspace.removeEventListener("wheel", listener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(
    () => () => {
      processingRequestId.current += 1;
      if (hasEasyModeSession()) return;
      uploadedAssetIdsRef.current.forEach(releaseUploadedDesign);
      uploadedAssetIdsRef.current.clear();
      ownedProcessedImageUrlsRef.current.forEach((url) =>
        URL.revokeObjectURL(url),
      );
      ownedProcessedImageUrlsRef.current.clear();
    },
    [],
  );

  useEffect(() => {
    if (!modeSession) return;
    const timeout = window.setTimeout(clearEasyModeSession, 0);
    return () => window.clearTimeout(timeout);
  }, [modeSession]);

  useEffect(() => {
    const retainedUrls = new Set<string>();
    if (processedImageUrl) retainedUrls.add(processedImageUrl);
    for (const snapshot of [...imageHistory.undo, ...imageHistory.redo]) {
      if (snapshot.processedImageUrl)
        retainedUrls.add(snapshot.processedImageUrl);
      if (snapshot.semitransparencyResult) {
        retainedUrls.add(snapshot.semitransparencyResult.resultUrl);
        retainedUrls.add(snapshot.semitransparencyResult.previousUrl);
      }
    }

    ownedProcessedImageUrlsRef.current.forEach((url) => {
      if (!retainedUrls.has(url)) {
        URL.revokeObjectURL(url);
        ownedProcessedImageUrlsRef.current.delete(url);
      }
    });
  }, [imageHistory, processedImageUrl]);

  const replaceProcessedImage = (url: string | null) => {
    setProcessedImageUrl(url);
  };

  const captureImageSnapshot = (): EasyImageSnapshot => ({
    activeUploadedAssetId,
    processedImageUrl,
    processedDimensions,
    showProcessedImage,
    removeSemitransparencies,
    semitransparencyResult: semitransparencyResultRef.current,
    artworkTransform,
  });

  const recordImageChange = (snapshot = captureImageSnapshot()) => {
    setImageHistory((current) => ({
      undo: [...current.undo, snapshot],
      redo: [],
    }));
  };

  const restoreImageSnapshot = (snapshot: EasyImageSnapshot) => {
    setActiveUploadedAssetId(snapshot.activeUploadedAssetId);
    replaceProcessedImage(snapshot.processedImageUrl);
    setProcessedDimensions(snapshot.processedDimensions);
    setShowProcessedImage(snapshot.showProcessedImage);
    setRemoveSemitransparencies(snapshot.removeSemitransparencies);
    semitransparencyResultRef.current = snapshot.semitransparencyResult;
    setArtworkTransform(snapshot.artworkTransform);
  };

  const activateUploadedAsset = (assetId: string) => {
    processingRequestId.current += 1;
    replaceProcessedImage(null);
    setProcessedDimensions(null);
    setIsProcessing(false);
    setIsRemovingBg(false);
    setProcessingError(null);
    setActiveUploadedAssetId(assetId);
    setShowProcessedImage(true);
    setImageHistory({ undo: [], redo: [] });
    setRemoveSemitransparencies(false);
    setArtworkTransform(DEFAULT_ARTWORK_TRANSFORM);
    setArtworkDimensions(null);
    setIsArtworkSelected(true);
    semitransparencyResultRef.current = null;
  };

  const loadFile = (file: File) => {
    const identityKey = getFileIdentityKey(file);
    const existingAsset = uploadedAssets.find(
      (asset) => asset.identityKey === identityKey,
    );
    if (existingAsset) {
      activateUploadedAsset(existingAsset.id);
      setProcessingError(null);
      return;
    }

    try {
      const asset = registerUploadedDesign(file);
      uploadedAssetIdsRef.current.add(asset.id);
      setUploadedAssets((current) => [
        ...current,
        { ...asset, file, identityKey },
      ]);
      activateUploadedAsset(asset.id);
    } catch (error) {
      setProcessingError(
        error instanceof Error ? error.message : "No se pudo cargar la imagen.",
      );
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadFile(file);
    event.currentTarget.value = "";
  };
  const loadFileRef = useRef(loadFile);
  loadFileRef.current = loadFile;

  useEffect(() => {
    if (documentId || isDocumentHydrated) return;

    let cancelled = false;
    const createDocumentAndRedirect = async () => {
      try {
        const widthPx = Math.max(
          1,
          Math.round(
            (Number(canvasSettings.widthCm) / 2.54) * canvasSettings.dpi,
          ),
        );
        const heightPx = Math.max(
          1,
          Math.round(
            (Number(canvasSettings.heightCm) / 2.54) * canvasSettings.dpi,
          ),
        );
        const id = createDesigner3DocumentId();
        await createDesigner3Document(id, "Mi nuevo diseño", {
          widthPx,
          heightPx,
          dpi: canvasSettings.dpi,
          background: canvasSettings.background,
          backgroundColor: canvasSettings.backgroundColor,
        });
        if (!cancelled) {
          navigate(
            {
              pathname: "/store/designer/easy",
              search: `?document=${encodeURIComponent(id)}`,
            },
            { replace: true, state: location.state },
          );
        }
      } catch (error) {
        if (cancelled) return;
        showToast({
          type: "error",
          title: "No se pudo crear el documento",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo preparar el documento para el modo fácil.",
        });
      }
    };

    void createDocumentAndRedirect();
    return () => {
      cancelled = true;
    };
  }, [
    canvasSettings,
    documentId,
    isDocumentHydrated,
    location.state,
    navigate,
    showToast,
  ]);

  useEffect(() => {
    if (!documentId || isDocumentHydrated) return;

    let cancelled = false;
    const hydrateDocument = async () => {
      try {
        const record = await loadDesigner3Document(documentId);
        if (!record) {
          throw new Error(`No existe el documento Designer 3 "${documentId}".`);
        }
        if (cancelled) return;

        const metadata = record.document.metadata;
        const documentWidth =
          typeof metadata.widthPx === "number" ? metadata.widthPx : 3000;
        const documentHeight =
          typeof metadata.heightPx === "number" ? metadata.heightPx : 3000;
        const documentDpi =
          typeof metadata.dpi === "number" ? metadata.dpi : 300;
        const documentBackground =
          metadata.background === "transparent" ||
          metadata.background === "white" ||
          metadata.background === "color"
            ? metadata.background
            : "transparent";
        const documentBackgroundColor =
          typeof metadata.backgroundColor === "string"
            ? metadata.backgroundColor
            : "#ffffff";
        const derivedCanvasSettings: EasyCanvasSettings = {
          widthCm: Number(
            ((documentWidth / documentDpi) * 2.54).toFixed(1),
          ).toString(),
          heightCm: Number(
            ((documentHeight / documentDpi) * 2.54).toFixed(1),
          ).toString(),
          dpi: documentDpi,
          background: documentBackground,
          backgroundColor: documentBackgroundColor,
        };
        setCanvasSettings(derivedCanvasSettings);
        setCanvasRatio(
          Number(derivedCanvasSettings.widthCm) /
            Math.max(0.1, Number(derivedCanvasSettings.heightCm)),
        );

        const advancedSnapshot = record.advancedSnapshot;
        const advancedIsNewer =
          Boolean(advancedSnapshot) &&
          (!record.easyUpdatedAt ||
            (record.advancedUpdatedAt ?? "") > record.easyUpdatedAt);
        if (advancedIsNewer && isRecord(advancedSnapshot)) {
          const state = advancedSnapshot.editorState;
          const layers =
            isRecord(state) && Array.isArray(state.layers)
              ? state.layers.filter(isRecord)
              : [];
          const imageLayer = layers.find(
            (layer) =>
              layer.type === "image" &&
              (typeof layer.processedSrc === "string" ||
                typeof layer.src === "string" ||
                typeof layer.preview === "string"),
          );
          if (imageLayer) {
            const image = (
              typeof imageLayer.processedSrc === "string" &&
              imageLayer.processedSrc
                ? imageLayer.processedSrc
                : typeof imageLayer.src === "string" && imageLayer.src
                  ? imageLayer.src
                  : imageLayer.preview
            ) as string;
            const layerId =
              typeof imageLayer.id === "string"
                ? imageLayer.id
                : "designer3-artwork";
            const layerName =
              typeof imageLayer.name === "string" ? imageLayer.name : "Diseño";
            const width =
              typeof imageLayer.naturalWidth === "number"
                ? imageLayer.naturalWidth
                : typeof imageLayer.width === "number"
                  ? imageLayer.width
                  : 480;
            const height =
              typeof imageLayer.naturalHeight === "number"
                ? imageLayer.naturalHeight
                : typeof imageLayer.height === "number"
                  ? imageLayer.height
                  : 480;
            const fitScale = Math.min(
              documentWidth / width,
              documentHeight / height,
            );
            const renderedWidth =
              typeof imageLayer.width === "number"
                ? imageLayer.width
                : width * fitScale;
            const renderedHeight =
              typeof imageLayer.height === "number"
                ? imageLayer.height
                : height * fitScale;
            const centerX =
              (typeof imageLayer.x === "number" ? imageLayer.x : 0) +
              renderedWidth / 2;
            const centerY =
              (typeof imageLayer.y === "number" ? imageLayer.y : 0) +
              renderedHeight / 2;
            const file = new File([], layerName, { type: "image/png" });
            const resource: UploadedAsset = {
              id: layerId,
              name: layerName,
              image,
              category: "Subidos",
              file,
              identityKey: layerId,
            };
            const restoredSession: EasyModeSession = {
              documentId,
              canvasSettings: derivedCanvasSettings,
              canvasZoom: 1,
              canvasPan: { x: 0, y: 0 },
              uploadedAssets: [resource],
              uploadedFolders: [],
              activeUploadedAssetId: layerId,
              uploadedLibraryTab: "images",
              activeUploadedFolderId: null,
              activeUploadedFolderPath: "",
              uploadSearch: "",
              processedImageUrl:
                typeof imageLayer.processedSrc === "string"
                  ? imageLayer.processedSrc
                  : null,
              processedDimensions: { width, height },
              showProcessedImage: true,
              removeSemitransparencies: false,
              semitransparencyResult: null,
              imageHistory: { undo: [], redo: [] },
              artworkTransform: {
                scale: fitScale > 0 ? renderedWidth / (width * fitScale) : 1,
                rotationDegrees:
                  typeof imageLayer.rotation === "number"
                    ? imageLayer.rotation
                    : 0,
                flipX: imageLayer.flipX === true,
                flipY: imageLayer.flipY === true,
                offsetX: (centerX - documentWidth / 2) / documentWidth,
                offsetY: (centerY - documentHeight / 2) / documentHeight,
              },
              artworkDimensions: { width, height },
              isArtworkSelected: true,
              imageUrl: image,
              ownedProcessedImageUrls: [],
              advancedElementId: layerId,
              advancedElementBaseSize: {
                width: renderedWidth,
                height: renderedHeight,
              },
              advancedImageUrl: image,
              previousAdvancedZoneId: null,
            };
            modeSessionRef.current = restoredSession;
            saveEasyModeSession(restoredSession);
            setUploadedAssets(restoredSession.uploadedAssets);
            setActiveUploadedAssetId(layerId);
            setProcessedImageUrl(restoredSession.processedImageUrl);
            setProcessedDimensions(restoredSession.processedDimensions);
            setShowProcessedImage(true);
            setArtworkTransform(restoredSession.artworkTransform);
            setArtworkDimensions(restoredSession.artworkDimensions);
          }
        } else if (isEasyModeSession(record.easySnapshot)) {
          const restoredSession = record.easySnapshot;
          modeSessionRef.current = restoredSession;
          saveEasyModeSession(restoredSession);
          setCanvasSettings(restoredSession.canvasSettings);
          setCanvasZoom(restoredSession.canvasZoom);
          setCanvasPan(restoredSession.canvasPan);
          setUploadedAssets(restoredSession.uploadedAssets);
          setUploadedFolders(restoredSession.uploadedFolders);
          setActiveUploadedAssetId(restoredSession.activeUploadedAssetId);
          setUploadedLibraryTab(restoredSession.uploadedLibraryTab);
          setActiveUploadedFolderId(restoredSession.activeUploadedFolderId);
          setActiveUploadedFolderPath(restoredSession.activeUploadedFolderPath);
          setUploadSearch(restoredSession.uploadSearch);
          setProcessedImageUrl(restoredSession.processedImageUrl);
          setProcessedDimensions(restoredSession.processedDimensions);
          setShowProcessedImage(restoredSession.showProcessedImage);
          setRemoveSemitransparencies(restoredSession.removeSemitransparencies);
          setImageHistory(restoredSession.imageHistory);
          setArtworkTransform(restoredSession.artworkTransform);
          setArtworkDimensions(restoredSession.artworkDimensions);
          setIsArtworkSelected(restoredSession.isArtworkSelected);
          ownedProcessedImageUrlsRef.current = new Set(
            restoredSession.ownedProcessedImageUrls,
          );
          uploadedAssetIdsRef.current = new Set(
            restoredSession.uploadedAssets.map((asset) => asset.id),
          );
          semitransparencyResultRef.current =
            restoredSession.semitransparencyResult;
          setCanvasRatio(
            Number(restoredSession.canvasSettings.widthCm) /
              Math.max(0.1, Number(restoredSession.canvasSettings.heightCm)),
          );
        }

        const locationState = location.state;
        if (
          !record.easySnapshot &&
          !record.advancedSnapshot &&
          isRecord(locationState) &&
          locationState.initialFile instanceof File
        ) {
          loadFileRef.current(locationState.initialFile);
        }
        setIsDocumentHydrated(true);
      } catch (error) {
        if (cancelled) return;
        showToast({
          type: "error",
          title: "No se pudo recuperar el documento",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo abrir el documento Designer 3.",
        });
      }
    };

    void hydrateDocument();
    return () => {
      cancelled = true;
    };
  }, [documentId, isDocumentHydrated, location.state, showToast]);

  useEffect(() => {
    if (!documentId || !isDocumentHydrated) return;
    const session: EasyModeSession = {
      documentId,
      canvasSettings,
      canvasZoom,
      canvasPan,
      uploadedAssets,
      uploadedFolders,
      activeUploadedAssetId,
      uploadedLibraryTab,
      activeUploadedFolderId,
      activeUploadedFolderPath,
      uploadSearch,
      processedImageUrl,
      processedDimensions,
      showProcessedImage,
      removeSemitransparencies,
      semitransparencyResult: semitransparencyResultRef.current,
      imageHistory,
      artworkTransform,
      artworkDimensions,
      isArtworkSelected,
      imageUrl: selectedImage,
      ownedProcessedImageUrls: [...ownedProcessedImageUrlsRef.current],
      advancedElementId: modeSessionRef.current?.advancedElementId ?? null,
      advancedElementBaseSize:
        modeSessionRef.current?.advancedElementBaseSize ?? null,
      advancedImageUrl: modeSessionRef.current?.advancedImageUrl ?? null,
      previousAdvancedZoneId:
        modeSessionRef.current?.previousAdvancedZoneId ?? null,
    };
    const timeout = window.setTimeout(() => {
      void (async () => {
        const persisted = await loadDesigner3Document(documentId);
        if (!persisted) {
          throw new Error(`No existe el documento Designer 3 "${documentId}".`);
        }
        const widthPx = Math.max(
          1,
          Math.round(
            (Number(canvasSettings.widthCm) / 2.54) * canvasSettings.dpi,
          ),
        );
        const heightPx = Math.max(
          1,
          Math.round(
            (Number(canvasSettings.heightCm) / 2.54) * canvasSettings.dpi,
          ),
        );
        const existingSurface = persisted.document.surfaces.find(
          (surface) => surface.id === "front",
        );
        const imageId =
          modeSessionRef.current?.advancedElementId ??
          activeUploadedAssetId ??
          "designer3-artwork";
        const existingLayers = existingSurface?.layers ?? [];
        const retainedLayers = existingLayers.filter(
          (layer) => layer.id !== imageId,
        );
        const naturalWidth = Math.max(
          1,
          artworkDimensions?.width ?? processedDimensions?.width ?? widthPx,
        );
        const naturalHeight = Math.max(
          1,
          artworkDimensions?.height ?? processedDimensions?.height ?? heightPx,
        );
        const fitScale = Math.min(
          widthPx / naturalWidth,
          heightPx / naturalHeight,
        );
        const artworkWidth = naturalWidth * fitScale * artworkTransform.scale;
        const artworkHeight = naturalHeight * fitScale * artworkTransform.scale;
        const element: DesignElement | null = selectedImage
          ? {
              id: imageId,
              type: "image",
              layer: "user",
              zoneId: "front",
              x:
                widthPx / 2 +
                artworkTransform.offsetX * widthPx -
                artworkWidth / 2,
              y:
                heightPx / 2 +
                artworkTransform.offsetY * heightPx -
                artworkHeight / 2,
              width: artworkWidth,
              height: artworkHeight,
              image: selectedImage,
              originalImageSrc: activeUploadedAsset?.image ?? selectedImage,
              rotation: artworkTransform.rotationDegrees,
              scaleX: artworkTransform.flipX ? -1 : 1,
              scaleY: artworkTransform.flipY ? -1 : 1,
              name: activeUploadedAsset?.name ?? "Diseño",
              visible: true,
              locked: false,
              opacity: 1,
            }
          : null;
        const layers: Layer[] = element
          ? [
              {
                id: imageId,
                name: activeUploadedAsset?.name ?? "Diseño",
                order: 0,
                locked: false,
                visible: true,
                elements: [element],
              },
              ...retainedLayers.map((layer, index) => ({
                ...layer,
                order: index + 1,
              })),
            ]
          : retainedLayers.map((layer, index) => ({ ...layer, order: index }));
        const config = {
          widthPx,
          heightPx,
          dpi: canvasSettings.dpi,
          background: canvasSettings.background,
          backgroundColor: canvasSettings.backgroundColor,
        };
        const document = updateDesigner3DocumentModel(
          persisted.document,
          config,
          layers,
        );
        await saveDesigner3Snapshot(documentId, "easy", session, document);
      })().catch((error: unknown) => {
        showToast({
          type: "error",
          title: "Error de guardado",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo guardar el documento Designer 3.",
        });
      });
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [
    activeUploadedAssetId,
    activeUploadedAsset?.image,
    activeUploadedAsset?.name,
    activeUploadedFolderId,
    activeUploadedFolderPath,
    artworkDimensions,
    artworkTransform,
    canvasPan,
    canvasSettings,
    canvasSettings.background,
    canvasSettings.backgroundColor,
    canvasZoom,
    canvasSettings.dpi,
    canvasSettings.heightCm,
    canvasSettings.widthCm,
    documentId,
    imageHistory,
    isArtworkSelected,
    isDocumentHydrated,
    processedDimensions,
    processedImageUrl,
    removeSemitransparencies,
    selectedImage,
    showProcessedImage,
    uploadedAssets,
    uploadedFolders,
    uploadedLibraryTab,
    uploadSearch,
    showToast,
  ]);

  const openFolderPicker = () => {
    const input = folderInputRef.current;
    if (!input || isImportingFolder) return;
    input.setAttribute("webkitdirectory", "");
    input.click();
  };

  const handleFolderChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (files.length === 0) return;

    const pngFiles = files.filter((file) =>
      file.name.toLocaleLowerCase().endsWith(".png"),
    );
    const ignoredCount = files.length - pngFiles.length;
    if (pngFiles.length === 0) {
      showToast({
        type: "info",
        title: "Carpeta procesada",
        message: "No se encontraron archivos PNG compatibles.",
      });
      return;
    }

    const rootRelativePath = pngFiles.find(
      (file) => file.webkitRelativePath,
    )?.webkitRelativePath;
    if (!rootRelativePath) {
      showToast({
        type: "error",
        title: "Error de importación",
        message: "No se pudo identificar la carpeta seleccionada.",
      });
      return;
    }

    const folderName = rootRelativePath.split("/")[0];
    const existingFolder = uploadedFolders.find(
      (folder) =>
        normalizeFolderName(folder.name) === normalizeFolderName(folderName),
    );
    const folderId = existingFolder?.id ?? crypto.randomUUID();
    const folderAssets = [...(existingFolder?.assets ?? [])];
    const assetsById = new Map(
      uploadedAssets.map((asset) => [asset.id, asset]),
    );
    let addedCount = 0;
    let linkedCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;
    let registrationError = "";

    setIsImportingFolder(true);

    try {
      for (const file of pngFiles) {
        const identityKey = getFileIdentityKey(file);
        const relativePath =
          file.webkitRelativePath.split("/").slice(1).join("/") || file.name;
        const existingPathIndex = folderAssets.findIndex(
          (entry) => entry.relativePath === relativePath,
        );
        const existingPath =
          existingPathIndex >= 0 ? folderAssets[existingPathIndex] : null;

        if (existingPath?.identityKey === identityKey) {
          duplicateCount += 1;
          continue;
        }

        let asset = [...assetsById.values()].find(
          (candidate) => candidate.identityKey === identityKey,
        );
        if (!asset) {
          try {
            const resource = registerUploadedDesign(file);
            asset = { ...resource, file, identityKey };
            assetsById.set(asset.id, asset);
            uploadedAssetIdsRef.current.add(asset.id);
            addedCount += 1;
          } catch (error) {
            failedCount += 1;
            if (!registrationError) {
              registrationError =
                error instanceof Error
                  ? error.message
                  : "Error desconocido al registrar PNG.";
            }
            continue;
          }
        }

        const folderAsset: UploadedFolderAsset = {
          assetId: asset.id,
          relativePath,
          identityKey,
        };
        if (existingPathIndex >= 0)
          folderAssets[existingPathIndex] = folderAsset;
        else folderAssets.push(folderAsset);
        linkedCount += 1;
      }

      setUploadedAssets([...assetsById.values()]);
      if (folderAssets.length > 0) {
        const updatedFolder: UploadedFolder = {
          id: folderId,
          name: folderName,
          assets: folderAssets,
          ignoredCount: (existingFolder?.ignoredCount ?? 0) + ignoredCount,
        };
        setUploadedFolders((current) => {
          const index = current.findIndex((folder) => folder.id === folderId);
          if (index < 0) return [...current, updatedFolder];
          const next = [...current];
          next[index] = updatedFolder;
          return next;
        });
      }

      setUploadedLibraryTab("folders");
      setActiveUploadedFolderId(folderId);
      setActiveUploadedFolderPath("");

      if (failedCount > 0 && linkedCount === 0) {
        showToast({
          type: "error",
          title: "Error de importación",
          message:
            registrationError ||
            "No se pudieron registrar los diseños PNG de la carpeta.",
        });
      } else {
        const parts: string[] = [
          folderName,
          `${linkedCount} PNG añadido${linkedCount === 1 ? "" : "s"}`,
        ];
        if (duplicateCount > 0) {
          parts.push(
            `${duplicateCount} duplicado${duplicateCount === 1 ? "" : "s"} omitido${duplicateCount === 1 ? "" : "s"}`,
          );
        }
        if (ignoredCount > 0) {
          parts.push(
            `${ignoredCount} archivo${ignoredCount === 1 ? "" : "s"} omitido${ignoredCount === 1 ? "" : "s"}`,
          );
        }
        showToast({
          type: "success",
          title: "Carpeta importada",
          message: parts.join(" · "),
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Error de importación",
        message: "No se pudo importar la carpeta.",
      });
    } finally {
      setIsImportingFolder(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage || isRemovingBg || isProcessing) return;
    const requestId = ++processingRequestId.current;
    const previousState = captureImageSnapshot();
    setIsRemovingBg(true);
    setProcessingError(null);
    try {
      const result = await processRasterImageUrl(selectedImage, {
        kind: "remove-background",
        options: { tolerance: 32, feather: 1 },
      });
      if (requestId !== processingRequestId.current) return;

      const resultUrl = URL.createObjectURL(result.blob);
      ownedProcessedImageUrlsRef.current.add(resultUrl);
      recordImageChange(previousState);
      replaceProcessedImage(resultUrl);
      setProcessedDimensions({ width: result.width, height: result.height });
      setShowProcessedImage(true);
    } catch (error) {
      if (requestId === processingRequestId.current) {
        setProcessingError(
          error instanceof Error
            ? error.message
            : "No se pudo eliminar el fondo de la imagen.",
        );
      }
    } finally {
      if (requestId === processingRequestId.current) setIsRemovingBg(false);
    }
  };

  const applyAdjustments = async () => {
    if (!selectedImage || isProcessing || isRemovingBg) return;
    const requestId = ++processingRequestId.current;
    const previousState = captureImageSnapshot();
    setToolStatuses((current) => ({ ...current, adjust: "PROCESSING" }));
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const result = await processArtworkImageUrl(selectedImage, adjustments);
      if (requestId !== processingRequestId.current) return;
      const resultUrl = URL.createObjectURL(result.blob);
      ownedProcessedImageUrlsRef.current.add(resultUrl);
      recordImageChange(previousState);
      replaceProcessedImage(resultUrl);
      setProcessedDimensions({ width: result.width, height: result.height });
      setShowProcessedImage(true);
      setToolStatuses((current) => ({ ...current, adjust: "SUCCESS" }));
    } catch (error) {
      if (requestId === processingRequestId.current) {
        setToolStatuses((current) => ({ ...current, adjust: "FAILED" }));
        setProcessingError(
          error instanceof Error
            ? error.message
            : "No se pudo ajustar la imagen.",
        );
      }
    } finally {
      if (requestId === processingRequestId.current) setIsProcessing(false);
    }
  };

  const applyHalftone = async () => {
    if (!selectedImage || isProcessing || isRemovingBg) return;
    const requestId = ++processingRequestId.current;
    const previousState = captureImageSnapshot();
    setToolStatuses((current) => ({ ...current, halftone: "PROCESSING" }));
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const result = await processRasterImageUrl(selectedImage, {
        kind: "halftone",
        options: halftoneOptions,
      });
      if (requestId !== processingRequestId.current) return;
      const resultUrl = URL.createObjectURL(result.blob);
      ownedProcessedImageUrlsRef.current.add(resultUrl);
      recordImageChange(previousState);
      replaceProcessedImage(resultUrl);
      setProcessedDimensions({ width: result.width, height: result.height });
      setShowProcessedImage(true);
      setToolStatuses((current) => ({ ...current, halftone: "SUCCESS" }));
    } catch (error) {
      if (requestId === processingRequestId.current) {
        setToolStatuses((current) => ({ ...current, halftone: "FAILED" }));
        setProcessingError(
          error instanceof Error
            ? error.message
            : "No se pudo aplicar el semitono.",
        );
      }
    } finally {
      if (requestId === processingRequestId.current) setIsProcessing(false);
    }
  };

  const handleUndo = () => {
    const previous = imageHistory.undo.at(-1);
    if (!previous) return;

    const current = captureImageSnapshot();
    setImageHistory((history) => ({
      undo: history.undo.slice(0, -1),
      redo: [...history.redo, current],
    }));
    restoreImageSnapshot(previous);
  };

  const handleRedo = () => {
    const next = imageHistory.redo.at(-1);
    if (!next) return;

    const current = captureImageSnapshot();
    setImageHistory((history) => ({
      undo: [...history.undo, current],
      redo: history.redo.slice(0, -1),
    }));
    restoreImageSnapshot(next);
  };

  const handleClearImage = () => {
    if (selectedImage) {
      recordImageChange();
    }
    processingRequestId.current += 1;
    setActiveUploadedAssetId(null);
    replaceProcessedImage(null);
    setProcessedDimensions(null);
    setIsProcessing(false);
    setIsRemovingBg(false);
    setRemoveSemitransparencies(false);
    setArtworkTransform(DEFAULT_ARTWORK_TRANSFORM);
    semitransparencyResultRef.current = null;
  };

  const getCurrentSession = (): EasyModeSession | null => {
    if (!documentId) return null;
    return {
      documentId,
      canvasSettings,
      canvasZoom,
      canvasPan,
      uploadedAssets,
      uploadedFolders,
      activeUploadedAssetId,
      uploadedLibraryTab,
      activeUploadedFolderId,
      activeUploadedFolderPath,
      uploadSearch,
      processedImageUrl,
      processedDimensions,
      showProcessedImage,
      removeSemitransparencies,
      semitransparencyResult: semitransparencyResultRef.current,
      imageHistory,
      artworkTransform,
      artworkDimensions,
      isArtworkSelected,
      imageUrl: selectedImage,
      ownedProcessedImageUrls: [...ownedProcessedImageUrlsRef.current],
      advancedElementId: modeSession?.advancedElementId ?? null,
      advancedElementBaseSize: modeSession?.advancedElementBaseSize ?? null,
      advancedImageUrl: modeSession?.advancedImageUrl ?? null,
      previousAdvancedZoneId: modeSession?.previousAdvancedZoneId ?? null,
    };
  };

  const handleNewDocument = () => {
    handleClearImage();
    setCanvasSettings({
      widthCm: DEFAULT_WIDTH_CM,
      heightCm: DEFAULT_HEIGHT_CM,
      dpi: 300,
      background: "transparent",
      backgroundColor: "#ffffff",
    });
    setImageHistory({ undo: [], redo: [] });
    setCanvasZoom(1);
    setCanvasPan({ x: 0, y: 0 });
    showToast({
      type: "success",
      title: "Nuevo documento",
      message: "Lienzo restablecido a 58 × 100 cm a 300 DPI.",
    });
  };

  const handleDuplicateArtwork = () => {
    if (!selectedImage) return;
    recordImageChange();
    if (activeUploadedAsset) {
      const duplicateId = `${activeUploadedAsset.id}-copy-${Date.now()}`;
      const duplicateAsset: UploadedAsset = {
        ...activeUploadedAsset,
        id: duplicateId,
        name: `${activeUploadedAsset.name} (copia)`,
      };
      setUploadedAssets((current) => [...current, duplicateAsset]);
    }
    setArtworkTransform((current) => ({
      ...current,
      offsetX: Math.min(0.8, current.offsetX + 0.04),
      offsetY: Math.min(0.8, current.offsetY + 0.04),
    }));
    showToast({
      type: "success",
      title: "Elemento duplicado",
      message: "Se ha duplicado el diseño seleccionado.",
    });
  };

  const handleFitToCanvas = () => {
    setCanvasZoom(1);
    setCanvasPan({ x: 0, y: 0 });
  };

  const handleActualSize = () => {
    const basePercent = canvasViewport?.zoomPercent ?? 100;
    setCanvasZoom(100 / (basePercent || 100));
    setCanvasPan({ x: 0, y: 0 });
  };

  const handleSetZoomPreset = (preset: number) => {
    const basePercent = canvasViewport?.zoomPercent ?? 100;
    setCanvasZoom(preset / (basePercent || 100));
    setCanvasPan({ x: 0, y: 0 });
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  };

  const handleSaveDesign = () => {
    const session = getCurrentSession();
    if (session && documentId) {
      saveEasyModeSession(session);
      void saveDesigner3Snapshot(documentId, "easy", session).catch(() => {});
    }
    showToast({
      type: "success",
      title: "Diseño guardado",
      message: "El estado actual del diseño ha sido guardado exitosamente.",
    });
  };

  const commitArtworkTransform = (next: ArtworkTransform) => {
    if (!selectedImage || next === artworkTransform) return;
    recordImageChange();
    setArtworkTransform(next);
  };

  const handleArtworkKeyDown = (
    event: ReactKeyboardEvent<HTMLImageElement>,
  ) => {
    const movement = event.shiftKey ? 0.05 : 0.01;
    let offset: { x: number; y: number };
    switch (event.key) {
      case "ArrowLeft":
        offset = { x: -movement, y: 0 };
        break;
      case "ArrowRight":
        offset = { x: movement, y: 0 };
        break;
      case "ArrowUp":
        offset = { x: 0, y: -movement };
        break;
      case "ArrowDown":
        offset = { x: 0, y: movement };
        break;
      default:
        return;
    }
    if (!selectedImage) return;

    event.preventDefault();
    commitArtworkTransform({
      ...artworkTransform,
      offsetX: artworkTransform.offsetX + offset.x,
      offsetY: artworkTransform.offsetY + offset.y,
    });
  };

  const handleSemitransparencyToggle = async (enabled: boolean) => {
    if (!enabled) {
      if (!removeSemitransparencies) return;

      const previous = semitransparencyResultRef.current;
      recordImageChange();
      if (previous && processedImageUrl === previous.resultUrl) {
        replaceProcessedImage(
          previous.previousUrl === activeUploadedAsset?.image
            ? null
            : previous.previousUrl,
        );
        setProcessedDimensions(previous.previousDimensions);
        setShowProcessedImage(true);
      }
      semitransparencyResultRef.current = null;
      setRemoveSemitransparencies(false);
      return;
    }

    if (!selectedImage || isProcessing || isRemovingBg) return;
    const sourceUrl = selectedImage;
    const requestId = ++processingRequestId.current;
    const previousState = captureImageSnapshot();
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const result = await processRasterImageUrl(sourceUrl, {
        kind: "cleanup-semitransparency",
        options: { strategy: "remove" },
      });
      const resultUrl = URL.createObjectURL(result.blob);
      if (requestId !== processingRequestId.current) {
        URL.revokeObjectURL(resultUrl);
        return;
      }
      ownedProcessedImageUrlsRef.current.add(resultUrl);
      recordImageChange(previousState);
      semitransparencyResultRef.current = {
        resultUrl,
        previousUrl: sourceUrl,
        previousDimensions: processedDimensions,
      };
      replaceProcessedImage(resultUrl);
      setProcessedDimensions({ width: result.width, height: result.height });
      setShowProcessedImage(true);
      setRemoveSemitransparencies(true);
    } catch (error) {
      if (requestId === processingRequestId.current) {
        setProcessingError(
          error instanceof Error
            ? error.message
            : "No se pudieron eliminar las semitransparencias.",
        );
      }
    } finally {
      if (requestId === processingRequestId.current) setIsProcessing(false);
    }
  };

  const handleDimensionChange = (
    axis: "widthCm" | "heightCm",
    value: string,
  ) => {
    setCanvasSettings((current) => {
      const next = { ...current, [axis]: value };
      const parsedValue = Number(value);

      if (!keepRatio || !Number.isFinite(parsedValue) || parsedValue <= 0)
        return next;

      if (axis === "widthCm")
        next.heightCm = (parsedValue / canvasRatio).toFixed(1);
      else next.widthCm = (parsedValue * canvasRatio).toFixed(1);

      return next;
    });
  };

  const stepDimension = (axis: "widthCm" | "heightCm", direction: 1 | -1) => {
    const current = Number(canvasSettings[axis]) || 0;
    // Integer step: add direction (±1), then round to 1 decimal to kill float noise
    const stepped = current + direction;
    const next = Math.max(0.1, Math.round(stepped * 10) / 10);
    handleDimensionChange(axis, next.toString());
  };

  const handleRatioToggle = () => {
    if (!keepRatio && widthCm > 0 && heightCm > 0)
      setCanvasRatio(widthCm / heightCm);
    setKeepRatio((current) => !current);
  };

  const handleDpiChange = (value: string) => {
    const dpi = Number.parseInt(value, 10);
    if (Number.isFinite(dpi) && dpi >= 72 && dpi <= 2400) {
      setCanvasSettings((current) => ({ ...current, dpi }));
    }
  };

  const stepDpi = (direction: 1 | -1) =>
    handleDpiChange(String(canvasSettings.dpi + direction * 10));

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

  const canvasStyle = {
    backgroundColor: getCanvasColor(canvasSettings),
    backgroundImage:
      canvasSettings.background === "transparent"
        ? "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)"
        : undefined,
    backgroundSize:
      canvasSettings.background === "transparent" ? "16px 16px" : undefined,
    backgroundPosition:
      canvasSettings.background === "transparent"
        ? "0 0, 0 8px, 8px -8px, -8px 0px"
        : undefined,
  };
  const previewTransform = canvasViewport
    ? createArtworkTransformMatrix(
        Math.max(1, canvasViewport.widthPx - 2),
        Math.max(1, canvasViewport.heightPx - 2),
        artworkTransform,
      )
    : null;
  const artworkBox =
    canvasViewport && artworkDimensions
      ? (() => {
          const availableWidth = Math.max(1, canvasViewport.widthPx - 2);
          const availableHeight = Math.max(1, canvasViewport.heightPx - 2);
          const fitScale = Math.min(
            availableWidth / artworkDimensions.width,
            availableHeight / artworkDimensions.height,
          );
          return {
            width: artworkDimensions.width * fitScale,
            height: artworkDimensions.height * fitScale,
          };
        })()
      : canvasViewport
        ? {
            width: canvasViewport.widthPx - 2,
            height: canvasViewport.heightPx - 2,
          }
        : null;

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
            to={{
              pathname: "/store/designer/easy",
              search: location.search,
            }}
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
            ref={headerNavRef}
            aria-label="Menú del editor"
            className="hidden items-center gap-[clamp(18px,1.9vw,32px)] text-[clamp(13px,0.9vw,15px)] font-medium text-[#475569] lg:flex"
          >
            {/* ── Archivo ── */}
            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openHeaderDropdown === "archivo"}
                onClick={() =>
                  setOpenHeaderDropdown((prev) =>
                    prev === "archivo" ? null : "archivo",
                  )
                }
                className={`transition-colors hover:text-[#0f172a] ${
                  openHeaderDropdown === "archivo"
                    ? "font-semibold text-[#0f172a]"
                    : ""
                }`}
              >
                Archivo
              </button>
              {openHeaderDropdown === "archivo" && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-50 mt-2 w-52 rounded-[5px] border border-[#e2e8f0] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.10)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      handleNewDocument();
                    }}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-2">
                      <FilePlus
                        className="h-4 w-4 text-[#64748b]"
                        strokeWidth={1.8}
                      />
                      <span>Nuevo documento</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      fileInputRef.current?.click();
                    }}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen
                        className="h-4 w-4 text-[#64748b]"
                        strokeWidth={1.8}
                      />
                      <span>Abrir imagen…</span>
                    </div>
                  </button>

                  <div
                    role="separator"
                    className="my-1 border-t border-[#f1f5f9]"
                  />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      handleSaveDesign();
                    }}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-2">
                      <Save
                        className="h-4 w-4 text-[#64748b]"
                        strokeWidth={1.8}
                      />
                      <span>Guardar diseño</span>
                    </div>
                    <span className="text-[11px] font-normal text-[#94a3b8]">
                      Ctrl+S
                    </span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      void handleExportPng();
                    }}
                    disabled={isExporting}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc] disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <Download
                        className="h-4 w-4 text-[#64748b]"
                        strokeWidth={1.8}
                      />
                      <span>Descargar PNG</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* ── Editar ── */}
            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openHeaderDropdown === "editar"}
                onClick={() =>
                  setOpenHeaderDropdown((prev) =>
                    prev === "editar" ? null : "editar",
                  )
                }
                className={`transition-colors hover:text-[#0f172a] ${
                  openHeaderDropdown === "editar"
                    ? "font-semibold text-[#0f172a]"
                    : ""
                }`}
              >
                Editar
              </button>
              {openHeaderDropdown === "editar" && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-50 mt-2 w-52 rounded-[5px] border border-[#e2e8f0] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.10)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    disabled={imageHistory.undo.length === 0}
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      handleUndo();
                    }}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="flex items-center gap-2">
                      <Undo2
                        className="h-4 w-4 text-[#64748b]"
                        strokeWidth={1.8}
                      />
                      <span>Deshacer</span>
                    </div>
                    <span className="text-[11px] font-normal text-[#94a3b8]">
                      Ctrl+Z
                    </span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    disabled={imageHistory.redo.length === 0}
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      handleRedo();
                    }}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="flex items-center gap-2">
                      <Redo2
                        className="h-4 w-4 text-[#64748b]"
                        strokeWidth={1.8}
                      />
                      <span>Rehacer</span>
                    </div>
                    <span className="text-[11px] font-normal text-[#94a3b8]">
                      Ctrl+Y
                    </span>
                  </button>

                  <div
                    role="separator"
                    className="my-1 border-t border-[#f1f5f9]"
                  />

                  <button
                    type="button"
                    role="menuitem"
                    disabled={!selectedImage}
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      handleDuplicateArtwork();
                    }}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="flex items-center gap-2">
                      <Copy
                        className="h-4 w-4 text-[#64748b]"
                        strokeWidth={1.8}
                      />
                      <span>Duplicar</span>
                    </div>
                    <span className="text-[11px] font-normal text-[#94a3b8]">
                      Ctrl+D
                    </span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    disabled={!selectedImage}
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      handleClearImage();
                    }}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#ef4444] transition-colors hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="flex items-center gap-2">
                      <Trash2
                        className="h-4 w-4 text-[#ef4444]"
                        strokeWidth={1.8}
                      />
                      <span>Eliminar diseño</span>
                    </div>
                    <span className="text-[11px] font-normal text-[#94a3b8]">
                      Supr
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* ── Ver ── */}
            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openHeaderDropdown === "ver"}
                onClick={() =>
                  setOpenHeaderDropdown((prev) =>
                    prev === "ver" ? null : "ver",
                  )
                }
                className={`transition-colors hover:text-[#0f172a] ${
                  openHeaderDropdown === "ver"
                    ? "font-semibold text-[#0f172a]"
                    : ""
                }`}
              >
                Ver
              </button>
              {openHeaderDropdown === "ver" && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-50 mt-2 w-52 rounded-[5px] border border-[#e2e8f0] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.10)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      handleFitToCanvas();
                    }}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-2">
                      <Focus
                        className="h-4 w-4 text-[#64748b]"
                        strokeWidth={1.8}
                      />
                      <span>Ajustar al lienzo</span>
                    </div>
                    <span className="text-[11px] font-normal text-[#94a3b8]">
                      Ctrl+0
                    </span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      handleActualSize();
                    }}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-2">
                      <Scan
                        className="h-4 w-4 text-[#64748b]"
                        strokeWidth={1.8}
                      />
                      <span>Tamaño real (100%)</span>
                    </div>
                    <span className="text-[11px] font-normal text-[#94a3b8]">
                      Ctrl+1
                    </span>
                  </button>

                  <div
                    role="separator"
                    className="my-1 border-t border-[#f1f5f9]"
                  />

                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={showRulers}
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      setShowRulers((prev) => !prev);
                    }}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-2">
                      <Ruler
                        className="h-4 w-4 text-[#64748b]"
                        strokeWidth={1.8}
                      />
                      <span>Mostrar reglas</span>
                    </div>
                    {showRulers && (
                      <Check
                        className="h-3.5 w-3.5 text-[#4f46e5]"
                        strokeWidth={2.2}
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenHeaderDropdown(null);
                      handleToggleFullscreen();
                    }}
                    className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-2">
                      <Maximize2
                        className="h-4 w-4 text-[#64748b]"
                        strokeWidth={1.8}
                      />
                      <span>Pantalla completa</span>
                    </div>
                    <span className="text-[11px] font-normal text-[#94a3b8]">
                      F11
                    </span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Derecha: controles de exportación y herramientas */}
        <div className="ml-auto flex min-w-0 items-center justify-end gap-[clamp(4px,0.7vw,12px)]">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Deshacer"
              title="Deshacer"
              onClick={handleUndo}
              disabled={imageHistory.undo.length === 0}
              className="rounded-lg p-1.5 text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Rehacer"
              title="Rehacer"
              onClick={handleRedo}
              disabled={imageHistory.redo.length === 0}
              className="rounded-lg p-1.5 text-[#94a3b8] transition-colors disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom pill con dropdown interactivo */}
          <div ref={zoomPillRef} className="relative">
            <button
              type="button"
              aria-label="Ajustar zoom"
              aria-haspopup="menu"
              aria-expanded={openHeaderDropdown === "zoom"}
              onClick={() =>
                setOpenHeaderDropdown((prev) =>
                  prev === "zoom" ? null : "zoom",
                )
              }
              className="flex h-[clamp(36px,2.63vw,44px)] items-center gap-1.5 rounded-[5px] border border-[#e2e8f0] bg-white px-[clamp(9px,0.95vw,16px)] text-[clamp(12px,0.9vw,15px)] font-medium text-[#334155] shadow-xs transition-colors hover:border-[#cbd5e1]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#64748b]" />
              <span>
                {Math.round((canvasViewport?.zoomPercent ?? 0) * canvasZoom)}%
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#94a3b8]" />
            </button>
            {openHeaderDropdown === "zoom" && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-[5px] border border-[#e2e8f0] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.10)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpenHeaderDropdown(null);
                    handleFitToCanvas();
                  }}
                  className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
                >
                  <span>Ajustar al lienzo</span>
                  {canvasZoom === 1 && (
                    <Check
                      className="h-3.5 w-3.5 text-[#4f46e5]"
                      strokeWidth={2.2}
                    />
                  )}
                </button>

                <div
                  role="separator"
                  className="my-1 border-t border-[#f1f5f9]"
                />

                {[25, 50, 75, 100, 150, 200].map((preset) => {
                  const currentPercent = Math.round(
                    (canvasViewport?.zoomPercent ?? 0) * canvasZoom,
                  );
                  return (
                    <button
                      key={preset}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenHeaderDropdown(null);
                        handleSetZoomPreset(preset);
                      }}
                      className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
                    >
                      <span>
                        {preset}% {preset === 100 ? "(Real)" : ""}
                      </span>
                      {currentPercent === preset && (
                        <Check
                          className="h-3.5 w-3.5 text-[#4f46e5]"
                          strokeWidth={2.2}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Descargar PNG */}
          <button
            type="button"
            onClick={handleExportPng}
            disabled={isExporting}
            className="flex h-[clamp(38px,2.87vw,48px)] shrink-0 items-center justify-center rounded-[5px] border border-[#e2e8f0] bg-[#f1f3f6] px-[clamp(10px,1.2vw,20px)] text-[clamp(12px,0.9vw,15px)] font-semibold text-[#1e293b] hover:bg-[#e2e8f0] transition-colors disabled:cursor-wait disabled:opacity-60"
          >
            {isExporting ? "Exportando…" : "Descargar PNG"}
          </button>

          <button
            type="button"
            disabled
            title="PDF no configurado: todavía no hay un encoder PDF integrado."
            className="flex h-[clamp(38px,2.87vw,48px)] shrink-0 cursor-not-allowed items-center justify-center rounded-[5px] bg-[#4f46e5] px-[clamp(10px,1.2vw,20px)] text-[clamp(12px,0.9vw,15px)] font-semibold text-white shadow-xs opacity-55"
          >
            Descargar PDF
          </button>

          {/* Más opciones */}
          <div className="relative">
            <button
              ref={headerMenuButtonRef}
              type="button"
              aria-label="Más opciones"
              aria-haspopup="menu"
              aria-expanded={isHeaderMenuOpen}
              aria-controls="designer-header-menu"
              onClick={() => setIsHeaderMenuOpen((open) => !open)}
              className="rounded-lg p-1.5 text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {isHeaderMenuOpen && (
              <div
                id="designer-header-menu"
                ref={headerMenuRef}
                role="menu"
                aria-label="Opciones del diseñador"
                onKeyDown={handleHeaderMenuKeyDown}
                className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
              >
                <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold text-[#64748b]">
                  Modo de edición
                </div>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked="false"
                  tabIndex={-1}
                  onClick={handleSwitchToAdvanced}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-[#0f172a] hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none"
                >
                  <span>Modo avanzado</span>
                </button>
                <div
                  role="separator"
                  className="my-1 border-t border-[#eef0f4]"
                />
                <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold text-[#64748b]">
                  Técnica de estampado
                </div>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={technique === "dtf"}
                  tabIndex={-1}
                  onClick={() => {
                    setTechnique("dtf");
                    setIsHeaderMenuOpen(false);
                    headerMenuButtonRef.current?.focus();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-[#0f172a] hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none"
                >
                  <span>DTF</span>
                  {technique === "dtf" && (
                    <Check className="h-4 w-4 text-[#4f46e5]" />
                  )}
                </button>
                <div
                  role="separator"
                  className="my-1 border-t border-[#eef0f4]"
                />
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={handleExitDesigner}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-[#475569] hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir del diseñador</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          CUERPO PRINCIPAL — Toolbar + Panel + Workspace
      ══════════════════════════════════════════════════════════ */}
      <div
        className="grid min-h-0 flex-1 overflow-hidden"
        style={{
          gridTemplateColumns:
            activeSidebarTool === "herramientas" && !isToolsSelectionOpen
              ? "clamp(68px, 6.46vw, 108px) 0px minmax(0, 1fr)"
              : "clamp(68px, 6.46vw, 108px) clamp(304px, 22.85vw, 382px) minmax(0, 1fr)",
        }}
      >
        {/* ─── SIDEBAR TOOLBAR ─── 76px de ancho como en la referencia */}
        <nav
          aria-label="Herramientas de Modo Básico"
          className="flex min-w-0 flex-col items-center gap-[clamp(6px,0.48vw,8px)] overflow-y-auto border-r border-[#e2e8f0] bg-white py-[clamp(10px,0.95vw,16px)]"
        >
          {sidebarTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeSidebarTool === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  if (tool.id === "herramientas") {
                    if (activeSidebarTool === "herramientas") {
                      setIsToolsSelectionOpen((prev) => !prev);
                    } else {
                      setActiveSidebarTool("herramientas");
                      setIsToolsSelectionOpen(true);
                      setOpenToolPanel((prev) => prev ?? activeEasyTool);
                    }
                  } else {
                    setActiveSidebarTool(tool.id);
                  }
                }}
                className="group mx-[clamp(6px,0.95vw,16px)] flex shrink-0 self-stretch flex-col items-center justify-center gap-[clamp(3px,0.3vw,5px)] py-1"
              >
                <span
                  className={`flex h-[clamp(32px,2.86vw,44px)] w-[clamp(32px,2.86vw,44px)] items-center justify-center rounded-xl transition-all duration-150 ${
                    isActive
                      ? "bg-[#f1f5f9] text-[#0f172a] shadow-xs ring-1 ring-[#cbd5e1]"
                      : "text-[#64748b] group-hover:bg-[#f8fafc] group-hover:text-[#334155]"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.6} />
                </span>
                <span className="text-[11px] font-medium text-[#64748b]">
                  {tool.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ─── PANEL LATERAL DE CONFIGURACIÓN ─── */}
        <aside
          className={`min-w-0 flex-col overflow-y-auto border-r border-[#e2e8f0] bg-white px-[clamp(18px,1.43vw,24px)] py-3 ${
            activeSidebarTool === "herramientas" && !isToolsSelectionOpen
              ? "hidden"
              : "flex"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFolderChange}
          />

          {/* ══════════════════════════════════════════════════════════
              1. ARCHIVO — Importar imagen, Lienzo, Fondo y Acciones
          ══════════════════════════════════════════════════════════ */}
          {activeSidebarTool === "archivo" && (
            <div className="space-y-4">
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
                      ? "border-[#4f46e5] bg-[#eeedff]/40"
                      : "border-[#cbd5e1] bg-white"
                  }`}
                >
                  <CloudUpload
                    className="h-9 w-9 text-[#0f172a]"
                    strokeWidth={1.5}
                  />
                  <p className="mt-2.5 text-[14px] font-bold text-[#0f172a]">
                    Sube una imagen
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                    JPG, PNG o SVG (máx. 50MB)
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3.5 rounded-[5px] border border-[#e2e8f0] bg-[#f8fafc] px-6 py-2 text-[12px] font-semibold text-[#1e293b] shadow-xs hover:bg-[#f1f5f9] transition-colors"
                  >
                    Seleccionar archivo
                  </button>
                </div>
              </section>

              {processingError && (
                <p role="alert" className="text-[11px] text-red-600">
                  {processingError}
                </p>
              )}

              {/* 2. LIENZO */}
              <section className="border-t border-[#eef0f4] pt-3">
                <h2 className="mb-2.5 text-[15px] font-bold text-[#0f172a]">
                  Configuración del Lienzo
                </h2>

                {/* Ancho / Alto */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                  <label className="min-w-0 text-[12px] text-[#64748b]">
                    <span className="mb-1.5 block">Ancho del Lienzo</span>
                    <SteppedInput
                      label="Ancho"
                      min="0.1"
                      step="1"
                      value={canvasSettings.widthCm}
                      onChange={(value) =>
                        handleDimensionChange("widthCm", value)
                      }
                      onStep={(direction) =>
                        stepDimension("widthCm", direction)
                      }
                    />
                  </label>

                  <button
                    type="button"
                    aria-label={
                      keepRatio
                        ? "Desbloquear proporción"
                        : "Mantener proporción"
                    }
                    aria-pressed={keepRatio}
                    onClick={handleRatioToggle}
                    className={`mb-2.5 rounded-[5px] p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] ${
                      keepRatio
                        ? "text-[#4f46e5] bg-[#eeedff]"
                        : "text-[#94a3b8] hover:text-[#0f172a]"
                    }`}
                  >
                    <Link2 className="h-4 w-4" />
                  </button>

                  <label className="min-w-0 text-[12px] text-[#64748b]">
                    <span className="mb-1.5 block">Alto del lienzo</span>
                    <SteppedInput
                      label="Alto"
                      min="0.1"
                      step="1"
                      value={canvasSettings.heightCm}
                      onChange={(value) =>
                        handleDimensionChange("heightCm", value)
                      }
                      onStep={(direction) =>
                        stepDimension("heightCm", direction)
                      }
                    />
                  </label>
                </div>

                {/* Resolución */}
                <div className="mt-3">
                  <span className="mb-1.5 block text-[12px] text-[#64748b]">
                    Resolución (DPI)
                  </span>
                  <SteppedInput
                    label="Resolución (DPI)"
                    min="72"
                    max="300"
                    step="1"
                    value={canvasSettings.dpi}
                    onChange={handleDpiChange}
                    onStep={stepDpi}
                  />
                </div>
              </section>

              {/* 3. FONDO DEL LIENZO */}
              <section className="border-t border-[#eef0f4] pt-3">
                <h2 className="mb-3 text-[15px] font-bold text-[#0f172a]">
                  Fondo del lienzo
                </h2>

                <div className="flex items-center gap-3">
                  {backgroundOptions.map((option) => {
                    const selected = isBackgroundSelected(
                      canvasSettings,
                      option,
                    );

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
                            ? "ring-2 ring-[#4f46e5] ring-offset-2"
                            : "hover:scale-105"
                        }`}
                      >
                        {option.id === "transparent" ? (
                          <svg
                            className="h-8 w-8 rounded-full"
                            viewBox="0 0 32 32"
                          >
                            <defs>
                              <pattern
                                id={`checkers-${option.id}`}
                                width="8"
                                height="8"
                                patternUnits="userSpaceOnUse"
                              >
                                <rect width="4" height="4" fill="#ffffff" />
                                <rect
                                  x="4"
                                  width="4"
                                  height="4"
                                  fill="#cbd5e1"
                                />
                                <rect
                                  y="4"
                                  width="4"
                                  height="4"
                                  fill="#cbd5e1"
                                />
                                <rect
                                  x="4"
                                  y="4"
                                  width="4"
                                  height="4"
                                  fill="#ffffff"
                                />
                              </pattern>
                            </defs>
                            <circle
                              cx="16"
                              cy="16"
                              r="15"
                              fill={`url(#checkers-${option.id})`}
                              stroke="#cbd5e1"
                              strokeWidth="1"
                            />
                          </svg>
                        ) : (
                          <span
                            className="h-8 w-8 rounded-full border border-[#cbd5e1]"
                            style={{
                              backgroundColor: option.color ?? "#ffffff",
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 4. ACCIONES DEL DISEÑO */}
              <section className="border-t border-[#eef0f4] pt-3">
                <h2 className="mb-3 text-[15px] font-bold text-[#0f172a]">
                  Acciones del diseño
                </h2>

                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  disabled={!selectedImage || isRemovingBg}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-[#18181b] px-4 text-[12px] font-bold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isRemovingBg ? "ELIMINANDO FONDO…" : "ELIMINAR FONDO"}
                </button>

                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={imageHistory.undo.length === 0}
                    className="flex h-9 items-center justify-center gap-1 rounded-[5px] border border-[#e2e8f0] bg-white text-[11px] font-bold uppercase text-[#334155] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>ATRÁS</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDuplicateArtwork}
                    disabled={!selectedImage}
                    title={
                      selectedImage
                        ? "Duplicar diseño"
                        : "Selecciona una imagen para duplicar"
                    }
                    className="flex h-9 items-center justify-center rounded-[5px] border border-[#e2e8f0] bg-white text-[11px] font-bold uppercase text-[#334155] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    DUPLICAR
                  </button>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    disabled={!selectedImage}
                    className="flex h-9 items-center justify-center rounded-[5px] border border-[#fecaca] bg-white text-[11px] font-bold uppercase text-[#ef4444] transition-colors hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    BORRAR
                  </button>
                </div>

                <div className="mt-3.5 flex items-center justify-between rounded-[5px] border border-[#fed7aa] bg-[#fff7ed] p-3.5">
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
                    aria-busy={isProcessing}
                    onClick={() =>
                      handleSemitransparencyToggle(!removeSemitransparencies)
                    }
                    disabled={isProcessing || isRemovingBg}
                    className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
                    style={{
                      backgroundColor: removeSemitransparencies
                        ? "#ea580c"
                        : "#cbd5e1",
                    }}
                  >
                    <span
                      className="inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out"
                      style={{
                        transform: removeSemitransparencies
                          ? "translateX(20px)"
                          : "translateX(0px)",
                      }}
                    />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              2. SUBIDOS — Biblioteca exclusiva de contenido subido
          ══════════════════════════════════════════════════════════ */}
          {activeSidebarTool === "subidos" && (
            <section className="min-w-0">
              <h1 className="mb-3 text-[15px] font-bold text-[#0f172a]">
                Subidos
              </h1>

              <div className="flex items-center justify-between gap-2">
                <div
                  role="tablist"
                  aria-label="Biblioteca de subidos"
                  className="flex min-w-0 rounded-[5px] bg-[#f1f5f9] p-0.5"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={uploadedLibraryTab === "images"}
                    onClick={() => {
                      setUploadedLibraryTab("images");
                      setActiveUploadedFolderId(null);
                      setActiveUploadedFolderPath("");
                    }}
                    className={`rounded-[5px] px-3 py-1.5 text-[11px] font-medium transition-colors ${
                      uploadedLibraryTab === "images"
                        ? "bg-white text-[#0f172a] shadow-xs"
                        : "text-[#64748b] hover:text-[#0f172a]"
                    }`}
                  >
                    Imágenes
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={uploadedLibraryTab === "folders"}
                    onClick={() => {
                      setUploadedLibraryTab("folders");
                      setActiveUploadedFolderId(null);
                      setActiveUploadedFolderPath("");
                    }}
                    className={`rounded-[5px] px-3 py-1.5 text-[11px] font-medium transition-colors ${
                      uploadedLibraryTab === "folders"
                        ? "bg-white text-[#0f172a] shadow-xs"
                        : "text-[#64748b] hover:text-[#0f172a]"
                    }`}
                  >
                    Carpetas
                  </button>
                </div>

                <div className="relative shrink-0">
                  <button
                    ref={uploadOptionsButtonRef}
                    type="button"
                    aria-label="Opciones para subir contenido"
                    aria-haspopup="menu"
                    aria-expanded={isUploadOptionsOpen}
                    onClick={() => setIsUploadOptionsOpen((open) => !open)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {isUploadOptionsOpen && (
                    <div
                      ref={uploadOptionsMenuRef}
                      role="menu"
                      aria-label="Opciones para subir contenido"
                      onKeyDown={handleUploadOptionsKeyDown}
                      className="absolute right-0 top-full z-30 mt-1 w-48 rounded-lg border border-[#e2e8f0] bg-white p-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        disabled={isImportingFolder}
                        onClick={() => {
                          setIsUploadOptionsOpen(false);
                          openFolderPicker();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12px] font-medium text-[#334155] outline-none hover:bg-[#f8fafc] focus:bg-[#f1f5f9] disabled:cursor-wait disabled:opacity-60"
                      >
                        <FolderUp className="h-4 w-4 text-[#64748b]" />
                        {isImportingFolder
                          ? "Importando carpeta…"
                          : "Subir una carpeta"}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsUploadOptionsOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12px] text-[#334155] outline-none hover:bg-[#f8fafc] focus:bg-[#f1f5f9]"
                      >
                        <CloudUpload className="h-4 w-4 text-[#64748b]" />
                        Subir imágenes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <label className="relative mt-3 block">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]"
                />
                <input
                  type="search"
                  value={uploadSearch}
                  onChange={(event) => setUploadSearch(event.target.value)}
                  placeholder="Buscar imágenes o carpetas"
                  aria-label="Buscar imágenes o carpetas"
                  className="h-9 w-full rounded-[5px] border border-[#e2e8f0] bg-white pl-8 pr-2.5 text-[11px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-[#a5b4fc] focus:ring-2 focus:ring-[#4f46e5]/10"
                />
              </label>

              <div className="mt-3">
                {uploadSearchTerm ? (
                  <div className="space-y-3">
                    {matchingUploadedFolders.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                          Carpetas
                        </p>
                        <div className="space-y-1.5">
                          {matchingUploadedFolders.map((folder) => (
                            <button
                              key={folder.id}
                              type="button"
                              onClick={() => {
                                setUploadedLibraryTab("folders");
                                setActiveUploadedFolderId(folder.id);
                                setActiveUploadedFolderPath("");
                                setUploadSearch("");
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-left transition-colors hover:bg-[#f8fafc] hover:border-[#cbd5e1]"
                            >
                              <Folder className="h-4 w-4 shrink-0 text-[#64748b]" />
                              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#0f172a]">
                                {folder.name}
                              </span>
                              <span className="shrink-0 text-[11px] text-[#64748b]">
                                {folder.assets.length} PNG
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {matchingUploadedAssets.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                          Imágenes
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {matchingUploadedAssets.map((asset) => {
                            const isActive = asset.id === activeUploadedAssetId;
                            return (
                              <button
                                key={asset.id}
                                type="button"
                                aria-label={`Seleccionar ${asset.name}`}
                                aria-pressed={isActive}
                                title={asset.name}
                                onClick={() => activateUploadedAsset(asset.id)}
                                className={`flex aspect-square min-w-0 items-center justify-center overflow-hidden rounded-lg border bg-white p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] ${
                                  isActive
                                    ? "border-[#4f46e5] ring-2 ring-[#4f46e5]/20"
                                    : "border-[#e2e8f0] hover:border-[#94a3b8]"
                                }`}
                              >
                                <img
                                  src={asset.image}
                                  alt=""
                                  className="h-full w-full object-contain"
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {matchingUploadedFolders.length === 0 &&
                      matchingUploadedAssets.length === 0 && (
                        <p className="text-[12px] text-[#64748b]">
                          No hay resultados que coincidan con la búsqueda.
                        </p>
                      )}
                  </div>
                ) : uploadedLibraryTab === "images" ? (
                  uploadedAssets.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedAssets.map((asset) => {
                        const isActive = asset.id === activeUploadedAssetId;
                        return (
                          <button
                            key={asset.id}
                            type="button"
                            aria-label={`Seleccionar ${asset.name}`}
                            aria-pressed={isActive}
                            title={asset.name}
                            onClick={() => activateUploadedAsset(asset.id)}
                            className={`flex aspect-square min-w-0 items-center justify-center overflow-hidden rounded-lg border bg-white p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] ${
                              isActive
                                ? "border-[#4f46e5] ring-2 ring-[#4f46e5]/20"
                                : "border-[#e2e8f0] hover:border-[#94a3b8]"
                            }`}
                          >
                            <img
                              src={asset.image}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd5e1] p-6 text-center">
                      <Images
                        className="h-8 w-8 text-[#94a3b8]"
                        strokeWidth={1.5}
                      />
                      <p className="mt-2 text-[13px] font-semibold text-[#0f172a]">
                        Aún no hay imágenes subidas
                      </p>
                      <p className="mt-1 text-[11px] text-[#64748b]">
                        Sube archivos desde Archivo o usando el menú ⋮
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 rounded-[5px] border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-1.5 text-[11px] font-semibold text-[#1e293b] hover:bg-[#f1f5f9] transition-colors"
                      >
                        Subir imágenes
                      </button>
                    </div>
                  )
                ) : activeUploadedFolder ? (
                  <div>
                    <div className="mb-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (activeUploadedFolderPath) {
                            setActiveUploadedFolderPath(
                              activeUploadedFolderPath
                                .split("/")
                                .slice(0, -1)
                                .join("/"),
                            );
                          } else {
                            setActiveUploadedFolderId(null);
                          }
                        }}
                        aria-label="Volver a carpetas"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <div className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#0f172a]">
                        {activeUploadedFolder.name}
                        {activeUploadedFolderPath &&
                          ` / ${activeUploadedFolderPath}`}
                      </div>
                      <span className="shrink-0 text-[11px] text-[#64748b]">
                        {activeFolderContents.images.length} PNG
                        {activeUploadedFolder.ignoredCount
                          ? ` · ${activeUploadedFolder.ignoredCount} archivo${activeUploadedFolder.ignoredCount === 1 ? "" : "s"} omitido${activeUploadedFolder.ignoredCount === 1 ? "" : "s"}`
                          : ""}
                      </span>
                    </div>

                    {activeFolderContents.subfolders.length > 0 && (
                      <div className="mb-2 space-y-1.5">
                        {activeFolderContents.subfolders.map((folder) => (
                          <button
                            key={folder.path}
                            type="button"
                            onClick={() =>
                              setActiveUploadedFolderPath(folder.path)
                            }
                            className="flex w-full items-center gap-2.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-left transition-colors hover:bg-[#f8fafc] hover:border-[#cbd5e1]"
                          >
                            <Folder className="h-4 w-4 shrink-0 text-[#64748b]" />
                            <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#0f172a]">
                              {folder.name}
                            </span>
                            <span className="shrink-0 text-[11px] text-[#64748b]">
                              {folder.assetCount} PNG
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {activeFolderContents.images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {activeFolderContents.images.map((asset) => {
                          const isActive = asset.id === activeUploadedAssetId;
                          return (
                            <button
                              key={asset.id}
                              type="button"
                              aria-label={`Seleccionar ${asset.name}`}
                              aria-pressed={isActive}
                              title={asset.name}
                              onClick={() => activateUploadedAsset(asset.id)}
                              className={`flex aspect-square min-w-0 items-center justify-center overflow-hidden rounded-lg border bg-white p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] ${
                                isActive
                                  ? "border-[#4f46e5] ring-2 ring-[#4f46e5]/20"
                                  : "border-[#e2e8f0] hover:border-[#94a3b8]"
                              }`}
                            >
                              <img
                                src={asset.image}
                                alt=""
                                className="h-full w-full object-contain"
                              />
                            </button>
                          );
                        })}
                      </div>
                    ) : activeFolderContents.subfolders.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-[#cbd5e1] p-4 text-center">
                        <p className="text-[12px] font-medium text-[#475569]">
                          Esta carpeta no contiene diseños PNG compatibles.
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                          Los archivos de otros formatos fueron omitidos al
                          importarla.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : uploadedFolders.length > 0 ? (
                  <div className="space-y-1.5">
                    {uploadedFolders.map((folder) => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => {
                          setActiveUploadedFolderId(folder.id);
                          setActiveUploadedFolderPath("");
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-left transition-colors hover:bg-[#f8fafc] hover:border-[#cbd5e1]"
                      >
                        <Folder className="h-5 w-5 shrink-0 text-[#64748b]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-semibold text-[#0f172a]">
                            {folder.name}
                          </p>
                          <p className="text-[11px] text-[#64748b]">
                            {folder.assets.length} PNG
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd5e1] p-6 text-center">
                    <Folder
                      className="h-8 w-8 text-[#94a3b8]"
                      strokeWidth={1.5}
                    />
                    <p className="mt-2 text-[13px] font-semibold text-[#0f172a]">
                      Aún no hay carpetas subidas
                    </p>
                    <p className="mt-1 text-[11px] text-[#64748b]">
                      Organiza tus archivos subiendo una carpeta con diseños PNG
                    </p>
                    <button
                      type="button"
                      onClick={openFolderPicker}
                      className="mt-3 flex items-center gap-1.5 rounded-[5px] border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-1.5 text-[11px] font-semibold text-[#1e293b] hover:bg-[#f1f5f9] transition-colors"
                    >
                      <FolderUp className="h-3.5 w-3.5 text-[#64748b]" />
                      Subir una carpeta
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
              3. OTRAS HERRAMIENTAS — Paneles correspondientes
          ══════════════════════════════════════════════════════════ */}
          {activeSidebarTool === "plantillas" && (
            <section className="min-w-0">
              <h1 className="mb-3 text-[15px] font-bold text-[#0f172a]">
                Plantillas
              </h1>
              <p className="text-[12px] text-[#64748b]">
                Explora y aplica plantillas prediseñadas para tus productos.
              </p>
            </section>
          )}

          {activeSidebarTool === "texto" && (
            <section className="min-w-0">
              <h1 className="mb-3 text-[15px] font-bold text-[#0f172a]">
                Texto
              </h1>
              <p className="text-[12px] text-[#64748b]">
                Agrega títulos, subtítulos y textos con tipografías
                personalizadas.
              </p>
            </section>
          )}

          {activeSidebarTool === "formas" && (
            <section className="min-w-0">
              <h1 className="mb-3 text-[15px] font-bold text-[#0f172a]">
                Formas
              </h1>
              <p className="text-[12px] text-[#64748b]">
                Inserta rectángulos, círculos, líneas y vectores geométricos.
              </p>
            </section>
          )}

          {activeSidebarTool === "marcos" && (
            <section className="min-w-0">
              <h1 className="mb-3 text-[15px] font-bold text-[#0f172a]">
                Marcos
              </h1>
              <p className="text-[12px] text-[#64748b]">
                Agrega marcos y bordes a tu composición.
              </p>
            </section>
          )}

          {activeSidebarTool === "herramientas" && (
            <section className="min-w-0">
              {/* ── Encabezado ── */}
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-[17px] font-bold tracking-tight text-[#0f172a]">
                    Herramientas
                  </h1>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-[#64748b]">
                    Procesamiento aplicado al diseño seleccionado.
                  </p>
                </div>
                <button
                  type="button"
                  id="easy-tools-selection-close"
                  aria-label="Cerrar panel de herramientas"
                  onClick={() => setIsToolsSelectionOpen(false)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#475569]"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              {/* ── Lista de tarjetas ── */}
              <div className="space-y-1.5">
                {easyTools.map((tool) => {
                  const isActive = activeEasyTool === tool.id;
                  const status = toolStatuses[tool.id];

                  return (
                    <button
                      key={tool.id}
                      id={`easy-tool-card-${tool.id}`}
                      type="button"
                      onClick={() => {
                        setActiveEasyTool(tool.id);
                        setOpenToolPanel(tool.id);
                        if (
                          tool.id === "magic-eraser" ||
                          tool.id === "eraser"
                        ) {
                          clearMagicMask();
                        }
                        if (tool.id === "eraser") setMagicEraserMode("select");
                      }}
                      aria-pressed={isActive}
                      className={[
                        "group relative flex w-full items-center gap-3 rounded-[5px] border px-3 py-2.5 text-left",
                        "transition-all duration-150 ease-out",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1",
                        isActive
                          ? "border-[#cbd5e1] bg-[#f8fafc] shadow-xs"
                          : "border-[#f1f3f7] bg-white hover:border-[#cbd5e1] hover:bg-[#f8fafc]",
                      ].join(" ")}
                    >
                      {/* Icono monocromático — solo el icono comunica el estado activo */}
                      <span
                        className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] transition-all duration-150",
                          isActive
                            ? "bg-[#0f172a] text-white shadow-xs"
                            : "bg-[#f1f5f9] text-[#334155] group-hover:bg-[#e2e8f0] group-hover:text-[#0f172a]",
                        ].join(" ")}
                      >
                        <tool.icon
                          className="h-4 w-4"
                          strokeWidth={isActive ? 2 : 1.75}
                        />
                      </span>

                      {/* Texto — solo el nombre, visualmente estable */}
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#1e293b]">
                        {tool.label}
                      </span>

                      {/* Indicador discreto si procesa + flecha sutil */}
                      <span className="flex shrink-0 items-center gap-1.5">
                        {status === "PROCESSING" && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-600" />
                        )}
                        {status === "SUCCESS" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                        {status === "FAILED" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        )}
                        <ChevronRight
                          className={[
                            "h-3.5 w-3.5 transition-transform duration-150",
                            isActive
                              ? "translate-x-0.5 text-[#0f172a]"
                              : "text-[#cbd5e1] group-hover:text-[#94a3b8]",
                          ].join(" ")}
                          strokeWidth={2}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>

              {processingError && (
                <p role="alert" className="mt-3 text-[12px] text-red-700">
                  {processingError}
                </p>
              )}
            </section>
          )}
        </aside>

        {/* ─── WORKSPACE (Área central de lienzo dominante) ─── */}
        <main
          ref={workspaceRef}
          aria-label="Área de trabajo del lienzo"
          onPointerDown={handleWorkspacePointerDown}
          onPointerMove={handleWorkspacePointerMove}
          onPointerUp={finishWorkspacePan}
          onPointerCancel={finishWorkspacePan}
          className={`relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#f4f5f8] select-none ${
            isHandToolActive
              ? isPanning
                ? "cursor-grabbing touch-none"
                : "cursor-grab touch-none"
              : ""
          }`}
        >
          {/* ══ PANEL CONTEXTUAL FLOTANTE — Herramientas ══════════════════════
              Aparece sobre el workspace cuando herramientas está activo.
              Fiel a la referencia: tarjeta blanca con controles y CTAs.
          ══════════════════════════════════════════════════════════════════ */}
          {activeSidebarTool === "herramientas" && openToolPanel !== null && (
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-30 flex items-start p-4"
              style={{ animationTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
            >
              <div
                className="pointer-events-auto w-[292px] overflow-hidden rounded-[5px] border border-[#e2e8f0] bg-white shadow-[0_8px_32px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.06)]"
                style={{
                  animation:
                    "easy-panel-in 220ms cubic-bezier(0.16,1,0.3,1) both",
                }}
              >
                <style>{`
                  @keyframes easy-panel-in {
                    from { opacity: 0; transform: translateX(-12px); }
                    to   { opacity: 1; transform: translateX(0); }
                  }
                  @media (prefers-reduced-motion: reduce) {
                    .easy-tool-panel-enter { animation: none !important; }
                  }
                  .ps-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 4px;
                    border-radius: 9999px;
                    outline: none;
                    cursor: pointer;
                    width: 100%;
                  }
                  .ps-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 9999px;
                    background: #4f46e5;
                    border: 2px solid #fff;
                    box-shadow: 0 0 0 1px #4f46e5, 0 1px 3px rgba(0,0,0,0.18);
                    cursor: pointer;
                  }
                  .ps-slider-blue {
                    background: linear-gradient(to right, #818cf8 0%, #4f46e5 100%);
                  }
                  .ps-slider-warm {
                    background: linear-gradient(to right, #60a5fa 0%, #f59e0b 100%);
                  }
                  .ps-slider-hue {
                    background: linear-gradient(to right, #ef4444, #f59e0b, #22c55e, #06b6d4, #4f46e5, #ec4899, #ef4444);
                  }
                  .ps-slider-sharp {
                    background: linear-gradient(to right, #e2e8f0 0%, #0f172a 100%);
                  }
                `}</style>

                {/* ── Encabezado del panel ── */}
                <div className="flex items-center gap-2.5 border-b border-[#f0f2f5] px-4 py-3.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-[#f1f5f9] text-[#0f172a]">
                    {openToolPanel === "adjust" && (
                      <SlidersHorizontal
                        className="h-4 w-4"
                        strokeWidth={1.8}
                      />
                    )}
                    {(openToolPanel === "magic-eraser" ||
                      openToolPanel === "eraser") && (
                      <Wand2 className="h-4 w-4" strokeWidth={1.8} />
                    )}
                    {openToolPanel === "halftone" && (
                      <Crosshair className="h-4 w-4" strokeWidth={1.8} />
                    )}
                    {openToolPanel === "enhance" && (
                      <Scan className="h-4 w-4" strokeWidth={1.8} />
                    )}
                    {openToolPanel === "vectorize" && (
                      <Network className="h-4 w-4" strokeWidth={1.8} />
                    )}
                    {openToolPanel === "magic-layers" && (
                      <Layers className="h-4 w-4" strokeWidth={1.8} />
                    )}
                    {openToolPanel === "magic-edit" && (
                      <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                    )}
                  </span>
                  <span className="flex-1 text-[15px] font-bold tracking-tight text-[#0f172a]">
                    {easyTools.find((t) => t.id === openToolPanel)?.label ??
                      ""}
                  </span>
                  <button
                    type="button"
                    id="easy-tool-panel-close"
                    aria-label="Cerrar panel"
                    onClick={() => setOpenToolPanel(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-[5px] text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#475569]"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>

                {/* ── Cuerpo del panel ── */}
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-3">
                  {/* ════ AJUSTAR ════ */}
                  {openToolPanel === "adjust" && (
                    <div className="space-y-4">
                      {/* Controles de ajuste — sin iconos en los controles */}
                      <div className="space-y-3.5">
                        {/* Brillo */}
                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[12px] font-medium text-[#374151]">
                              Brillo
                            </span>
                            <span className="text-[12px] font-semibold text-[#0f172a]">
                              {adjustments.brightness - 100}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={200}
                            value={adjustments.brightness}
                            onChange={(event) =>
                              setAdjustments((current) => ({
                                ...current,
                                brightness: Number(event.target.value),
                              }))
                            }
                            className="ps-slider ps-slider-blue"
                          />
                        </div>

                        {/* Contraste */}
                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[12px] font-medium text-[#374151]">
                              Contraste
                            </span>
                            <span className="text-[12px] font-semibold text-[#0f172a]">
                              {adjustments.contrast - 100}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={200}
                            value={adjustments.contrast}
                            onChange={(event) =>
                              setAdjustments((current) => ({
                                ...current,
                                contrast: Number(event.target.value),
                              }))
                            }
                            className="ps-slider ps-slider-blue"
                          />
                        </div>

                        {/* Saturación */}
                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[12px] font-medium text-[#374151]">
                              Saturación
                            </span>
                            <span className="text-[12px] font-semibold text-[#0f172a]">
                              {adjustments.saturation - 100}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={200}
                            value={adjustments.saturation}
                            onChange={(event) =>
                              setAdjustments((current) => ({
                                ...current,
                                saturation: Number(event.target.value),
                              }))
                            }
                            className="ps-slider ps-slider-blue"
                          />
                        </div>

                        {/* Temperatura */}
                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[12px] font-medium text-[#374151]">
                              Temperatura
                            </span>
                            <span className="text-[12px] font-semibold text-[#64748b]">
                              0
                            </span>
                          </div>
                          <input
                            type="range"
                            min={-100}
                            max={100}
                            defaultValue={0}
                            readOnly
                            className="ps-slider ps-slider-warm"
                          />
                        </div>

                        {/* Matiz */}
                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[12px] font-medium text-[#374151]">
                              Matiz
                            </span>
                            <span className="text-[12px] font-semibold text-[#64748b]">
                              0
                            </span>
                          </div>
                          <input
                            type="range"
                            min={-180}
                            max={180}
                            defaultValue={0}
                            readOnly
                            className="ps-slider ps-slider-hue"
                          />
                        </div>

                        {/* Nitidez */}
                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[12px] font-medium text-[#374151]">
                              Nitidez
                            </span>
                            <span className="text-[12px] font-semibold text-[#64748b]">
                              0
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            defaultValue={0}
                            readOnly
                            className="ps-slider ps-slider-sharp"
                          />
                        </div>
                      </div>

                      {/* CTAs */}
                      <div className="space-y-2 pt-1">
                        <button
                          type="button"
                          id="easy-tool-adjust-apply"
                          onClick={() => void applyAdjustments()}
                          disabled={
                            !selectedImage || isProcessing || isRemovingBg
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-[5px] bg-[#4f46e5] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#4338ca] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? "Procesando…" : "Aplicar ajustes"}
                        </button>
                        <button
                          type="button"
                          id="easy-tool-adjust-reset"
                          onClick={() =>
                            setAdjustments({
                              brightness: 100,
                              contrast: 100,
                              saturation: 100,
                            })
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-[5px] border border-[#e2e8f0] px-4 py-2 text-[13px] font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc]"
                        >
                          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                          Restablecer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ════ SEMITONOS ════ */}
                  {openToolPanel === "halftone" && (
                    <div className="space-y-3">
                      <label className="block">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[#374151]">
                            Tamaño de punto
                          </span>
                          <span className="text-[12px] font-semibold text-[#4f46e5]">
                            {halftoneOptions.cellSize}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={60}
                          value={halftoneOptions.cellSize}
                          onChange={(e) =>
                            setHalftoneOptions((c) => ({
                              ...c,
                              cellSize: Number(e.target.value),
                            }))
                          }
                          className="ps-slider ps-slider-blue"
                        />
                      </label>
                      <label className="block">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[#374151]">
                            Ángulo
                          </span>
                          <span className="text-[12px] font-semibold text-[#4f46e5]">
                            {halftoneOptions.angle}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={180}
                          value={halftoneOptions.angle}
                          onChange={(e) =>
                            setHalftoneOptions((c) => ({
                              ...c,
                              angle: Number(e.target.value),
                            }))
                          }
                          className="ps-slider ps-slider-blue"
                        />
                      </label>
                      {(["intensity", "contrast"] as const).map((key) => (
                        <label key={key} className="block">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-[12px] font-medium text-[#374151] capitalize">
                              {key === "intensity" ? "Intensidad" : "Contraste"}
                            </span>
                            <span className="text-[12px] font-semibold text-[#4f46e5]">
                              {halftoneOptions[key]}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={200}
                            value={halftoneOptions[key]}
                            onChange={(e) =>
                              setHalftoneOptions((c) => ({
                                ...c,
                                [key]: Number(e.target.value),
                              }))
                            }
                            className="ps-slider ps-slider-blue"
                          />
                        </label>
                      ))}
                      <label className="block text-[12px] font-medium text-[#374151]">
                        Forma
                        <select
                          value={halftoneOptions.shape}
                          onChange={(e) =>
                            setHalftoneOptions((c) => ({
                              ...c,
                              shape: e.target.value as "circle" | "square",
                            }))
                          }
                          className="mt-1 w-full rounded-[5px] border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-[12px] text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30"
                        >
                          <option value="circle">Círculo</option>
                          <option value="square">Cuadrado</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2 text-[12px] font-medium text-[#374151]">
                        <input
                          type="checkbox"
                          checked={halftoneOptions.invert ?? false}
                          onChange={(e) =>
                            setHalftoneOptions((c) => ({
                              ...c,
                              invert: e.target.checked,
                            }))
                          }
                          className="accent-[#4f46e5]"
                        />
                        Invertir tonos
                      </label>
                      <button
                        type="button"
                        onClick={() => void applyHalftone()}
                        disabled={
                          !selectedImage || isProcessing || isRemovingBg
                        }
                        className="mt-2 flex w-full items-center justify-center rounded-[5px] bg-[#4f46e5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#4338ca] disabled:opacity-50"
                      >
                        {isProcessing ? "Procesando…" : "Aplicar semitono"}
                      </button>
                    </div>
                  )}

                  {/* ════ ELIMINADOR / BORRADOR MÁGICO ════ */}
                  {(openToolPanel === "magic-eraser" ||
                    openToolPanel === "eraser") && (
                    <div className="space-y-3">
                      {openToolPanel === "magic-eraser" && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            aria-pressed={magicEraserMode === "select"}
                            onClick={() => {
                              clearMagicMask();
                              setMagicEraserMode("select");
                            }}
                            className={`flex min-h-10 items-center justify-center gap-1.5 rounded-[5px] px-2 text-[11px] font-semibold transition-colors ${
                              magicEraserMode === "select"
                                ? "bg-[#f1f5f9] text-[#0f172a] ring-1 ring-[#cbd5e1]"
                                : "border border-[#e2e8f0] text-[#475569]"
                            }`}
                          >
                            <Crosshair className="h-3.5 w-3.5" /> Seleccionar
                            área
                          </button>
                          <button
                            type="button"
                            aria-pressed={magicEraserMode === "lasso"}
                            onClick={() => {
                              clearMagicMask();
                              setMagicEraserMode("lasso");
                            }}
                            className={`flex min-h-10 items-center justify-center gap-1.5 rounded-[5px] px-2 text-[11px] font-semibold transition-colors ${
                              magicEraserMode === "lasso"
                                ? "bg-[#f1f5f9] text-[#0f172a] ring-1 ring-[#cbd5e1]"
                                : "border border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            }`}
                          >
                            <Eraser className="h-3.5 w-3.5" /> Dibujar trazo
                          </button>
                        </div>
                      )}
                      <p className="text-[11px] text-[#64748b]">
                        {magicMaskBlobRef.current || hasMagicMask
                          ? "Máscara lista. Puedes aplicarla o cancelarla."
                          : magicEraserMode === "lasso"
                            ? "Marca puntos alrededor del objeto que deseas conservar. Cierra el contorno para previsualizar lo que se eliminará."
                            : "Selecciona el área que deseas eliminar."}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void applyMagicMask()}
                          disabled={
                            !selectedImage ||
                            (!magicMaskBlobRef.current && !hasMagicMask) ||
                            isProcessing ||
                            isRemovingBg
                          }
                          className="flex-1 rounded-[5px] bg-[#4f46e5] px-3 py-2.5 text-[12px] font-semibold text-white hover:bg-[#4338ca] disabled:opacity-50"
                        >
                          {isProcessing ? "Procesando…" : "Aplicar borrado"}
                        </button>
                        <button
                          type="button"
                          onClick={clearMagicMask}
                          disabled={
                            !magicMaskBlobRef.current &&
                            magicLassoPoints.length === 0 &&
                            !hasMagicMask
                          }
                          className="rounded-[5px] border border-[#e2e8f0] px-3 py-2 text-[12px] font-semibold text-[#475569] hover:bg-[#f8fafc] disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ════ FUNCIONES EN DESARROLLO (COMPONENTE COMPARTIDO) ════ */}
                  {[
                    "enhance",
                    "vectorize",
                    "magic-layers",
                    "magic-edit",
                  ].includes(openToolPanel) && <FeatureDevelopmentState />}

                  {processingError &&
                    !["enhance", "vectorize", "magic-layers", "magic-edit"].includes(
                      openToolPanel,
                    ) && (
                      <p role="alert" className="mt-3 text-[12px] text-red-600">
                        {processingError}
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Rulers and canvas share the same fitted viewport geometry. */}
          {canvasViewport && (
            <div
              className="absolute flex flex-col items-start"
              style={{
                left: `${canvasViewport.leftPx}px`,
                top: `${canvasViewport.topPx}px`,
                transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
                transformOrigin: "top left",
              }}
            >
              {/* Fila superior: esquina (cm) + regla horizontal */}
              {showRulers && (
                <div className="flex items-end">
                  <div className="flex h-[22px] w-[28px] shrink-0 items-center justify-end pr-1 text-[10px] font-medium text-[#64748b]">
                    cm
                  </div>
                  <div style={{ width: `${canvasViewport.widthPx}px` }}>
                    <HorizontalRuler
                      widthPx={canvasViewport.widthPx}
                      lengthCm={safeWidthCm}
                    />
                  </div>
                </div>
              )}

              {/* Fila inferior: regla vertical + lienzo */}
              <div className="flex items-start">
                {showRulers && (
                  <div style={{ height: `${canvasViewport.heightPx}px` }}>
                    <VerticalRuler
                      heightPx={canvasViewport.heightPx}
                      lengthCm={safeHeightCm}
                    />
                  </div>
                )}

                {/* Lienzo / Canvas dominante */}
                <div
                  data-artwork-canvas
                  role="group"
                  aria-label={`Lienzo ${widthCm} por ${heightCm} centímetros a ${canvasSettings.dpi} DPI`}
                  onPointerDown={(event) => {
                    if (event.target === event.currentTarget) {
                      setIsArtworkSelected(false);
                    }
                  }}
                  onMouseMove={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const relX = (event.clientX - rect.left) / rect.width;
                    const relY = (event.clientY - rect.top) / rect.height;
                    setCursorCanvasPos({
                      x: Math.max(0, Math.min(safeWidthCm, relX * safeWidthCm)),
                      y: Math.max(0, Math.min(safeHeightCm, relY * safeHeightCm)),
                    });
                  }}
                  onMouseLeave={() => setCursorCanvasPos(null)}
                  className="relative shrink-0 overflow-hidden border border-[#cbd5e1] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                  style={{
                    width: `${canvasViewport.widthPx}px`,
                    height: `${canvasViewport.heightPx}px`,
                    ...canvasStyle,
                  }}
                >
                  {selectedImage && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        transform: previewTransform
                          ? `matrix(${previewTransform.a}, ${previewTransform.b}, ${previewTransform.c}, ${previewTransform.d}, ${previewTransform.e}, ${previewTransform.f})`
                          : undefined,
                        transformOrigin: "0 0",
                      }}
                    >
                      <div
                        className="absolute pointer-events-auto"
                        style={{
                          left: "50%",
                          top: "50%",
                          width: `${artworkBox?.width ?? 1}px`,
                          height: `${artworkBox?.height ?? 1}px`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <img
                          ref={artworkImageRef}
                          src={selectedImage}
                          alt={
                            processedImageUrl &&
                            processedImageUrl !== activeUploadedAsset?.image &&
                            showProcessedImage
                              ? "Imagen procesada"
                              : "Imagen subida al lienzo"
                          }
                          className={`h-full w-full select-none object-fill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            isHandToolActive
                              ? ""
                              : activeEasyTool === "magic-eraser" &&
                                  magicEraserMode === "lasso"
                                ? "cursor-crosshair touch-none"
                                : "cursor-move touch-none"
                          }`}
                          draggable={false}
                          tabIndex={0}
                          aria-label="Diseño activo. Arrastra para moverlo o usa las flechas."
                          title={
                            isHandToolActive
                              ? "Lienzo"
                              : "Arrastra para mover el diseño"
                          }
                          onLoad={(event) => {
                            const { naturalWidth, naturalHeight } =
                              event.currentTarget;
                            if (naturalWidth > 0 && naturalHeight > 0) {
                              setArtworkDimensions({
                                width: naturalWidth,
                                height: naturalHeight,
                              });
                            }
                          }}
                          onPointerDown={handleArtworkPointerDown}
                          onPointerMove={handleArtworkPointerMove}
                          onPointerUp={finishArtworkDrag}
                          onPointerCancel={finishArtworkDrag}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              event.preventDefault();
                              setIsArtworkSelected(false);
                              return;
                            }
                            handleArtworkKeyDown(event);
                          }}
                          style={{
                            pointerEvents:
                              isHandToolActive ||
                              (activeEasyTool === "magic-eraser" &&
                                magicEraserMode === "lasso")
                                ? "none"
                                : "auto",
                          }}
                        />
                        {magicMaskPreviewUrl &&
                          (activeEasyTool === "magic-eraser" ||
                            activeEasyTool === "eraser") && (
                            <img
                              src={magicMaskPreviewUrl}
                              alt="Vista previa de la máscara"
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 z-20 h-full w-full object-fill opacity-60"
                            />
                          )}
                        {activeEasyTool === "magic-eraser" &&
                          magicEraserMode === "lasso" && (
                            <canvas
                              ref={maskPreviewCanvasRef}
                              width={artworkDimensions?.width ?? 1}
                              height={artworkDimensions?.height ?? 1}
                              aria-label="Selección poligonal; dibuja el contorno del objeto que quieres conservar"
                              className="absolute inset-0 z-20 h-full w-full cursor-crosshair touch-none"
                              tabIndex={0}
                              onPointerDown={handleLassoPointerDown}
                              onPointerMove={handleLassoPointerMove}
                              onDoubleClick={handleLassoDoubleClick}
                              onPointerLeave={() => {
                                setMagicLassoCursor(null);
                                drawMagicLassoPreview(
                                  magicLassoPoints,
                                  null,
                                  isMagicLassoClosed,
                                );
                              }}
                              onKeyDown={handleLassoKeyDown}
                            />
                          )}
                        {magicLassoCursor &&
                          activeEasyTool === "magic-eraser" &&
                          magicEraserMode === "lasso" &&
                          !isMagicLassoClosed && (
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute z-30 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-indigo-500 shadow-[0_0_0_1px_rgba(15,23,42,0.7)]"
                              style={{
                                left: magicLassoCursor.x,
                                top: magicLassoCursor.y,
                              }}
                            />
                          )}
                        {isArtworkSelected && !isHandToolActive && (
                          <>
                            <div className="pointer-events-none absolute inset-0 border border-indigo-500" />
                            {(
                              [
                                "top-left",
                                "top-right",
                                "bottom-left",
                                "bottom-right",
                              ] as const
                            ).map((position) => {
                              const cursor =
                                position === "top-left" ||
                                position === "bottom-right"
                                  ? "nwse-resize"
                                  : "nesw-resize";
                              return (
                                <button
                                  key={position}
                                  type="button"
                                  aria-label="Cambiar tamaño del diseño"
                                  title="Arrastra para cambiar el tamaño"
                                  className={`absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-indigo-600 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
                                  style={{
                                    left: position.endsWith("left")
                                      ? 0
                                      : "100%",
                                    top: position.startsWith("top")
                                      ? 0
                                      : "100%",
                                    cursor,
                                    touchAction: "none",
                                  }}
                                  onPointerDown={(event) =>
                                    handleArtworkGesturePointerDown(
                                      event,
                                      "scale",
                                    )
                                  }
                                  onPointerMove={
                                    handleArtworkGesturePointerMove
                                  }
                                  onPointerUp={finishArtworkGesture}
                                  onPointerCancel={finishArtworkGesture}
                                />
                              );
                            })}
                            <button
                              type="button"
                              aria-label="Rotar diseño"
                              title="Arrastra para rotar"
                              className="absolute left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-indigo-600 bg-white text-indigo-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                              style={{
                                top: -24,
                                cursor: "grab",
                                touchAction: "none",
                              }}
                              onPointerDown={(event) =>
                                handleArtworkGesturePointerDown(event, "rotate")
                              }
                              onPointerMove={handleArtworkGesturePointerMove}
                              onPointerUp={finishArtworkGesture}
                              onPointerCancel={finishArtworkGesture}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Controles flotantes inferiores del workspace ── */}
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-[5px] border border-[#e2e8f0] bg-white p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <button
              type="button"
              aria-label={
                isHandToolActive
                  ? "Desactivar herramienta mano"
                  : "Activar herramienta mano"
              }
              aria-pressed={isHandToolActive}
              title={
                isHandToolActive
                  ? "Desactivar herramienta mano"
                  : "Activar herramienta mano"
              }
              onClick={() => setIsHandToolActive((active) => !active)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                isHandToolActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-[#475569] hover:bg-[#f1f5f9]"
              }`}
            >
              <Hand className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Centrar lienzo"
              title="Centrar lienzo"
              onClick={centerCanvasInWorkspace}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] hover:bg-[#f1f5f9] transition-colors"
            >
              <Crosshair className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Acercar"
              title="Acercar"
              onClick={() => changeCanvasZoom(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] hover:bg-[#f1f5f9] transition-colors"
            >
              <ZoomIn className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Alejar"
              title="Alejar"
              onClick={() => changeCanvasZoom(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] hover:bg-[#f1f5f9] transition-colors"
            >
              <ZoomOut className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <div aria-hidden="true" className="mx-0.5 h-5 w-px bg-[#e2e8f0]" />
            <button
              type="button"
              aria-label="Ajustar a pantalla"
              title="Ajustar a pantalla"
              onClick={fitCanvasToWorkspace}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] hover:bg-[#f1f5f9] transition-colors"
            >
              <Maximize2 className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <div aria-hidden="true" className="mx-0.5 h-5 w-px bg-[#e2e8f0]" />
            <span className="min-w-[42px] px-2 text-center text-[11px] font-semibold tabular-nums text-[#475569]">
              {Math.round(canvasZoom * 100)}%
            </span>
          </div>

          {/* Coordinate readout — shown when cursor is over the canvas */}
          {cursorCanvasPos && (
            <div
              aria-live="polite"
              aria-atomic="true"
              className="absolute bottom-6 right-4 z-20 flex items-center gap-2 rounded-[5px] border border-[#e2e8f0] bg-white px-2.5 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
            >
              <span className="text-[11px] font-medium tabular-nums text-[#64748b]">
                X: {cursorCanvasPos.x.toFixed(1)} cm
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-[#e2e8f0]" />
              <span className="text-[11px] font-medium tabular-nums text-[#64748b]">
                Y: {cursorCanvasPos.y.toFixed(1)} cm
              </span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
