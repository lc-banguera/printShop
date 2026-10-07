import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  Check,
  Crosshair,
  Folder,
  FolderUp,
  Grid2X2,
  Hand,
  Images,
  Layers,
  LayoutGrid,
  Link2,
  LogOut,
  Maximize2,
  MoreVertical,
  Redo2,
  RotateCcw,
  Search,
  Shapes,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { processRasterImageUrl } from "@/core/design/processing";
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
} from "../services/designer-mode-session";
import { useToast } from "@/shared/components/Toast/Toast";
import {
  createArtworkTransformMatrix,
  type ArtworkTransform,
} from "../../../../../engine/src/transform/artwork-transform";
import { createPngDpiMetadataPlan } from "../../../../../engine/src/processing/export";

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

const DEFAULT_WIDTH_CM = "35";
const DEFAULT_HEIGHT_CM = "50";
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
  { id: "archivo", label: "Archivo", icon: CloudUpload },
  { id: "subidos", label: "Subidos", icon: Images },
  { id: "plantillas", label: "Plantillas", icon: LayoutGrid },
  { id: "elementos", label: "Elementos", icon: Shapes },
  { id: "texto", label: "Texto", icon: Type },
  { id: "formas", label: "Formas", icon: Grid2X2 },
  { id: "capas", label: "Capas", icon: Layers },
] as const;

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
          ? "flex h-10 items-center rounded-xl border border-[#e2e8f0] bg-white focus-within:border-[#4f46e5] focus-within:ring-1 focus-within:ring-[#4f46e5]/20"
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
            : `h-9 w-full rounded-xl border border-[#e2e8f0] bg-white pl-3 pr-7 text-[13px] font-semibold text-[#0f172a] outline-none [appearance:textfield] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
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
  const modeSessionRef = useRef(getEasyModeSession());
  const modeSession = modeSessionRef.current;
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
    () => modeSession?.canvasSettings ?? createInitialCanvasSettings(location.state),
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
    useState<UploadedLibraryTab>(() => modeSession?.uploadedLibraryTab ?? "images");
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
  const [removeSemitransparencies, setRemoveSemitransparencies] =
    useState(() => modeSession?.removeSemitransparencies ?? false);
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
    saveEasyModeSession({
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
    });
    setIsHeaderMenuOpen(false);
    navigate("/designer/advanced", { state: { fromEasyMode: true } });
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
    const hasCanvasCreationContext =
      isRecord(location.state) && "newCanvasConfig" in location.state;
    setIsHeaderMenuOpen(false);
    navigate(hasCanvasCreationContext ? "/store/designer" : "/products");
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
      Math.min(4, Math.max(0.25, Number((current * (direction > 0 ? 1.15 : 0.87)).toFixed(3)))),
    );
  };

  const handleWorkspacePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!isHandToolActive || event.button !== 0) return;
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

  const handleWorkspacePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
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

  const handleArtworkPointerDown = (
    event: ReactPointerEvent<HTMLImageElement>,
  ) => {
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
    const canvas = event.currentTarget.closest<HTMLElement>("[data-artwork-canvas]");
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
    if (!gesture || gesture.pointerId !== event.pointerId || !canvasViewport) return;
    const canvas = event.currentTarget.closest<HTMLElement>("[data-artwork-canvas]");
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
      const scale = Math.min(4, Math.max(0.1, gesture.startTransform.scale * ratio));
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
      rotationDegrees: gesture.startTransform.rotationDegrees + angleDelta * (180 / Math.PI),
    });
  };

  const finishArtworkGesture = (event: ReactPointerEvent<HTMLButtonElement>) => {
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
        message: "Reduce las dimensiones o el DPI para exportar un PNG de hasta 40 megapíxeles.",
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
        throw new Error("El navegador no pudo preparar el lienzo de exportación.");
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
          image.onerror = () => reject(new Error("No se pudo leer la imagen activa para exportarla."));
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
          (result) => result
            ? resolve(result)
            : reject(new Error("El navegador no pudo codificar el PNG.")),
          "image/png",
        );
      });
      const pngBytes = new Uint8Array(await blob.arrayBuffer());
      const metadataPlan = createPngDpiMetadataPlan(pngBytes, canvasSettings.dpi);
      const downloadParts: BlobPart[] = [];
      for (const [index, range] of metadataPlan.sourceRanges.entries()) {
        downloadParts.push(blob.slice(range.start, range.end));
        if (index === 0) {
          const metadataBuffer = new ArrayBuffer(metadataPlan.resolutionChunk.byteLength);
          new Uint8Array(metadataBuffer).set(metadataPlan.resolutionChunk);
          downloadParts.push(metadataBuffer);
        }
      }
      const downloadBlob = new Blob(downloadParts, { type: "image/png" });
      const downloadUrl = URL.createObjectURL(downloadBlob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `printshop-${rasterWidth}x${rasterHeight}.png`;
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
        message: error instanceof Error ? error.message : "Error desconocido al exportar PNG.",
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
    const next = Math.max(0.1, Number((current + direction).toFixed(1)));
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
  const artworkBox = canvasViewport && artworkDimensions
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
      ? { width: canvasViewport.widthPx - 2, height: canvasViewport.heightPx - 2 }
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
            <button
              type="button"
              className="transition-colors hover:text-[#0f172a]"
            >
              Archivo
            </button>
            <button
              type="button"
              className="transition-colors hover:text-[#0f172a]"
            >
              Editar
            </button>
            <button
              type="button"
              className="transition-colors hover:text-[#0f172a]"
            >
              Ver
            </button>
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

          {/* Zoom pill */}
          <div className="flex h-[clamp(36px,2.63vw,44px)] items-center gap-1.5 rounded-[5px] border border-[#e2e8f0] bg-white px-[clamp(9px,0.95vw,16px)] text-[clamp(12px,0.9vw,15px)] font-medium text-[#334155] shadow-xs">
            <RotateCcw className="h-3.5 w-3.5 text-[#64748b]" />
            <span>{Math.round((canvasViewport?.zoomPercent ?? 0) * canvasZoom)}%</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#94a3b8]" />
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
                  aria-checked="true"
                  tabIndex={-1}
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    headerMenuButtonRef.current?.focus();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-[#0f172a] hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none"
                >
                  <span>Modo fácil</span>
                  <Check className="h-4 w-4 text-[#4f46e5]" />
                </button>
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
            "clamp(68px, 6.46vw, 108px) clamp(304px, 22.85vw, 382px) minmax(0, 1fr)",
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
                  setActiveSidebarTool(tool.id);
                }}
                className={`group mx-[clamp(6px,0.95vw,16px)] flex shrink-0 self-stretch flex-col items-center justify-center gap-[clamp(3px,0.3vw,5px)] py-1 transition-colors ${
                  isActive
                    ? "text-[#4f46e5]"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                <span
                  className={`flex h-[clamp(32px,2.86vw,44px)] w-[clamp(32px,2.86vw,44px)] items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? "bg-[#eff2fe]"
                      : "group-hover:bg-[#f5f7ff]"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 1.8 : 1.6} />
                </span>
                <span
                  className={`text-[11px] ${isActive ? "font-semibold" : "font-medium"}`}
                >
                  {tool.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ─── PANEL LATERAL DE CONFIGURACIÓN ─── */}
        <aside className="flex min-w-0 flex-col overflow-y-auto border-r border-[#e2e8f0] bg-white px-[clamp(18px,1.43vw,24px)] py-3">
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
                    className={`mb-2.5 rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] ${
                      keepRatio
                        ? "text-[#4f46e5] bg-[#eeedff]"
                        : "text-[#94a3b8] hover:text-[#0f172a]"
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
                    disabled
                    title="Duplicar no está configurado en Modo Básico."
                    className="flex h-9 cursor-not-allowed items-center justify-center rounded-[5px] border border-[#e2e8f0] bg-white text-[11px] font-bold uppercase text-[#334155] opacity-45"
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
                  className="flex min-w-0 rounded-lg bg-[#f1f5f9] p-0.5"
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
                    className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors ${
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
                    className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors ${
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
                  className="h-9 w-full rounded-lg border border-[#e2e8f0] bg-white pl-8 pr-2.5 text-[11px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-[#a5b4fc] focus:ring-2 focus:ring-[#4f46e5]/10"
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
                          Los archivos de otros formatos fueron omitidos al importarla.
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

          {activeSidebarTool === "elementos" && (
            <section className="min-w-0">
              <h1 className="mb-3 text-[15px] font-bold text-[#0f172a]">
                Elementos
              </h1>
              <p className="text-[12px] text-[#64748b]">
                Gráficos, stickers e ilustraciones para añadir a tu diseño.
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

          {activeSidebarTool === "capas" && (
            <section className="min-w-0">
              <h1 className="mb-3 text-[15px] font-bold text-[#0f172a]">
                Capas
              </h1>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-[12px]">
                  <span className="font-medium text-[#0f172a]">
                    {selectedImage ? "Diseño activo" : "Sin diseño en lienzo"}
                  </span>
                  <span className="text-[11px] text-[#64748b]">
                    {selectedImage ? "Capa 1" : "Vacío"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[12px]">
                  <span className="text-[#64748b]">Lienzo base</span>
                  <span className="text-[11px] text-[#94a3b8]">Fondo</span>
                </div>
              </div>
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

              {/* Fila inferior: regla vertical + lienzo */}
              <div className="flex items-start">
                <div style={{ height: `${canvasViewport.heightPx}px` }}>
                  <VerticalRuler
                    heightPx={canvasViewport.heightPx}
                    lengthCm={safeHeightCm}
                  />
                </div>

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
                          src={selectedImage}
                          alt={
                            processedImageUrl &&
                            processedImageUrl !== activeUploadedAsset?.image &&
                            showProcessedImage
                              ? "Imagen procesada"
                              : "Imagen subida al lienzo"
                          }
                          className={`h-full w-full select-none object-fill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            isHandToolActive ? "" : "cursor-move touch-none"
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
                            const { naturalWidth, naturalHeight } = event.currentTarget;
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
                          style={{ pointerEvents: isHandToolActive ? "none" : "auto" }}
                        />
                        {isArtworkSelected && !isHandToolActive && (
                          <>
                            <div className="pointer-events-none absolute inset-0 border border-indigo-500" />
                            {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((position) => {
                              const cursor = position === "top-left" || position === "bottom-right"
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
                                    left: position.endsWith("left") ? 0 : "100%",
                                    top: position.startsWith("top") ? 0 : "100%",
                                    cursor,
                                    touchAction: "none",
                                  }}
                                  onPointerDown={(event) => handleArtworkGesturePointerDown(event, "scale")}
                                  onPointerMove={handleArtworkGesturePointerMove}
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
                              style={{ top: -24, cursor: "grab", touchAction: "none" }}
                              onPointerDown={(event) => handleArtworkGesturePointerDown(event, "rotate")}
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
          </div>
        </main>
      </div>
    </div>
  );
}
