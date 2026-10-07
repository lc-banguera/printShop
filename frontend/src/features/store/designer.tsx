import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  UploadCloud,
  Sparkles,
  Wand2,
  Sliders,
  Type,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Download,
  Save,
  ArrowLeft,
  Move,
  Crop,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Check,
  Search,
  Plus,
  MoreVertical,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileImage,
  Shirt,
  Palette,
  MousePointer,
  Square,
  Circle,
  Pipette,
  Hand,
  ExternalLink,
  ChevronRight,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { DesignerWorkspace } from "./designer-workspace";
import { exportComposite } from "./designer/imageProcessor";
import type { DesignElement, Layer } from "@/core/design/types";
import {
  alignLayers,
  distributeLayers,
  repositionLayersForCanvasAnchor,
} from "./designer/layerUtils";
import {
  AlignmentType,
  CanvasAnchor,
  DistributionType,
  CropRect,
} from "./designer/types";
import { NewCanvasModal, NewCanvasConfig } from "./designer/NewCanvasModal";
import {
  createDesigner3Document,
  createDesigner3DocumentId,
  loadDesigner3Document,
  saveDesigner3Snapshot,
  updateDesigner3DocumentModel,
  type Designer3CanvasConfig,
} from "../designer/services/designer3-document-session";

/* ── Interfaces ─────────────────────────────────────────────────────────── */
interface DesignItem {
  id: string;
  title: string;
  previewUrl: string;
  lastModified: string;
  productType: string;
  dimensions: string;
  fileSize: string;
  editorState?: EditorDocumentState;
}

interface StylePreset {
  id: string;
  name: string;
  tagline: string;
  preview: string;
  category: string;
}

interface EditorLayer {
  id: string;
  name: string;
  type: "image" | "text" | "shape" | "background";
  visible: boolean;
  locked: boolean;
  opacity: number;
  preview: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;

  // Shape properties
  fill?: string;
  shapeType?: "rectangle" | "circle" | "triangle" | "line";
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;

  // Layer flip
  flipX?: boolean;
  flipY?: boolean;

  // Text properties
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;

  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
    grayscale: number;
    sepia: number;
    invert: number;
    blur: number;
  };
  // Image-specific fields
  src?: string;
  processedSrc?: string | null;
  naturalWidth?: number;
  naturalHeight?: number;
  cropRect?: CropRect | null;
  lastOp?: string;
}

interface EditorDocumentState {
  layers: EditorLayer[];
  selectedLayerId: string;
  selectedLayerIds?: string[];
  blendMode: string;
  layerOpacity: number;
  elementPos: { x: number; y: number };
  elementScale: number;
  elementRotation: number;
  elementSize: { w: number; h: number };
  documentWidth: number;
  documentHeight: number;
  dpi: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
}

function isEditorDocumentState(value: unknown): value is EditorDocumentState {
  if (typeof value !== "object" || value === null) return false;
  const state = value as Record<string, unknown>;
  return (
    Array.isArray(state.layers) &&
    typeof state.selectedLayerId === "string" &&
    typeof state.blendMode === "string" &&
    typeof state.layerOpacity === "number" &&
    typeof state.documentWidth === "number" &&
    typeof state.documentHeight === "number" &&
    typeof state.dpi === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNewCanvasConfig(value: unknown): NewCanvasConfig | null {
  if (!isRecord(value)) return null;
  const config = value.newCanvasConfig;
  if (!isRecord(config)) return null;
  if (
    typeof config.name !== "string" ||
    typeof config.widthPx !== "number" ||
    typeof config.heightPx !== "number" ||
    typeof config.dpi !== "number" ||
    (config.background !== "transparent" &&
      config.background !== "white" &&
      config.background !== "color") ||
    typeof config.backgroundColor !== "string"
  ) {
    return null;
  }
  return {
    name: config.name,
    widthPx: config.widthPx,
    heightPx: config.heightPx,
    dpi: config.dpi,
    background: config.background,
    backgroundColor: config.backgroundColor,
  };
}

function toDocumentLayers(layers: EditorLayer[]): Layer[] {
  return layers.map((layer, order) => {
    const source = layer.processedSrc ?? layer.src ?? layer.preview;
    const elementType: DesignElement["type"] =
      layer.type === "image"
        ? "image"
        : layer.type === "text"
          ? "text"
          : layer.shapeType === "circle"
            ? "circle"
            : "rectangle";
    const element: DesignElement = {
      id: layer.id,
      type: elementType,
      layer: "user",
      zoneId: "front",
      x: layer.x ?? 0,
      y: layer.y ?? 0,
      width: Math.max(1, layer.width ?? 1),
      height: Math.max(1, layer.height ?? 1),
      ...(layer.type === "image" && source ? { image: source, originalImageSrc: layer.src ?? source } : {}),
      rotation: layer.rotation ?? 0,
      scaleX: layer.flipX ? -1 : 1,
      scaleY: layer.flipY ? -1 : 1,
      fill: layer.fill ?? layer.color,
      stroke: layer.stroke,
      strokeWidth: layer.strokeWidth,
      opacity: Math.max(0, Math.min(1, (layer.opacity ?? 100) / 100)),
      name: layer.name,
      locked: layer.locked,
      visible: layer.visible,
      filters: layer.filters,
      textContent: layer.content,
      fontFamily: layer.fontFamily,
      fontWeight: layer.fontWeight,
      fontSize: layer.fontSize,
      textAlign: layer.textAlign,
      letterSpacing: layer.letterSpacing,
      lineHeight: layer.lineHeight,
    };
    return {
      id: layer.id,
      name: layer.name,
      order,
      locked: layer.locked,
      visible: layer.visible,
      elements: [element],
    };
  });
}

function fromDocumentLayers(
  layers: Layer[],
  previousLayers: EditorLayer[] = [],
): EditorLayer[] {
  const previousById = new Map(previousLayers.map((layer) => [layer.id, layer]));
  return [...layers]
    .sort((left, right) => left.order - right.order)
    .flatMap((layer) => {
      const element = layer.elements[0];
      if (!element) return [];
      const previous = previousById.get(layer.id);
      const isBackground =
        layer.id === "designer3-background" || layer.name === "Fondo";
      const type: EditorLayer["type"] = isBackground
        ? "background"
        : element.type === "image"
          ? "image"
          : element.type === "text"
            ? "text"
            : "shape";
      const mapped: EditorLayer = {
        ...previous,
        id: layer.id,
        name: layer.name,
        type,
        visible: layer.visible && element.visible !== false,
        locked: layer.locked || element.locked === true,
        opacity: Math.round((element.opacity ?? 1) * 100),
        preview: element.image ?? previous?.preview ?? "",
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation ?? 0,
        fill: element.fill,
        color: element.fill,
        shapeType: element.type === "circle" ? "circle" : previous?.shapeType ?? "rectangle",
        stroke: element.stroke,
        strokeWidth: element.strokeWidth,
        content: element.textContent,
        fontFamily: element.fontFamily,
        fontSize: element.fontSize,
        fontWeight:
          element.fontWeight === "bold" || element.fontWeight === 700
            ? "bold"
            : "normal",
        textAlign: element.textAlign,
        letterSpacing: element.letterSpacing,
        lineHeight: element.lineHeight,
        filters: element.filters,
        src: element.image ?? previous?.src,
        processedSrc: element.image ? null : previous?.processedSrc,
        naturalWidth: previous?.naturalWidth ?? element.width,
        naturalHeight: previous?.naturalHeight ?? element.height,
        flipX: (element.scaleX ?? 1) < 0,
        flipY: (element.scaleY ?? 1) < 0,
      };
      return [mapped];
    });
}

/* ── Mock Data: Diseños del Usuario ─────────────────────────────────────── */
const initialUserDesigns: DesignItem[] = [
  {
    id: "des-1",
    title: "Jordan Streetwear Legend",
    previewUrl:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80",
    lastModified: "Hace 20 min",
    productType: "Camiseta Oversize",
    dimensions: "3200 x 3200 px",
    fileSize: "4.8 MB",
  },
  {
    id: "des-2",
    title: "Cyberpunk Tokyo Skyline",
    previewUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80",
    lastModified: "Hace 2 horas",
    productType: "Hoodie Clásico",
    dimensions: "2400 x 3000 px",
    fileSize: "6.2 MB",
  },
  {
    id: "des-3",
    title: "Minimalist Botanical Art",
    previewUrl:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80",
    lastModified: "Ayer, 4:15 PM",
    productType: "Taza Cerámica",
    dimensions: "2000 x 1000 px",
    fileSize: "2.1 MB",
  },
  {
    id: "des-4",
    title: "Retro 90s Vintage Wave",
    previewUrl:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=80",
    lastModified: "2 de Mayo",
    productType: "Gorra Bordada",
    dimensions: "1800 x 1800 px",
    fileSize: "3.4 MB",
  },
  {
    id: "des-5",
    title: "Coffee Roaster Emblem",
    previewUrl:
      "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=500&auto=format&fit=crop&q=80",
    lastModified: "28 de Abril",
    productType: "Bolsa Ecológica",
    dimensions: "3000 x 3000 px",
    fileSize: "5.0 MB",
  },
  {
    id: "des-6",
    title: "Urban Skull Geometric",
    previewUrl:
      "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=500&auto=format&fit=crop&q=80",
    lastModified: "25 de Abril",
    productType: "Póster Metálico",
    dimensions: "4000 x 6000 px",
    fileSize: "8.9 MB",
  },
];

/* ── Mock Data: Efectos y Estilos Rápidos ───────────────────────────────── */
const stylePresets: StylePreset[] = [
  {
    id: "fx-bokeh",
    name: "Desenfoque Bokeh",
    tagline: "Destellos de luz sutil",
    preview:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80",
    category: "Óptico",
  },
  {
    id: "fx-motion",
    name: "Motion Blur",
    tagline: "Velocidad y movimiento",
    preview:
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&auto=format&fit=crop&q=80",
    category: "Dinámico",
  },
  {
    id: "fx-glitch",
    name: "Glitch Cromático",
    tagline: "Distorsión RGB futurista",
    preview:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop&q=80",
    category: "Digital",
  },
  {
    id: "fx-halftone",
    name: "Halftone Mono",
    tagline: "Trama de imprenta clásica",
    preview:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80",
    category: "Vintage",
  },
  {
    id: "fx-pop",
    name: "Halftone Color Pop",
    tagline: "Puntos estilo Warhol",
    preview:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&auto=format&fit=crop&q=80",
    category: "Pop Art",
  },
  {
    id: "fx-neon",
    name: "Resplandor Neón",
    tagline: "Bordes brillantes luminosos",
    preview:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80",
    category: "Luz",
  },
  {
    id: "fx-comic",
    name: "Cómic & Tinta",
    tagline: "Contornos negros marcados",
    preview:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80",
    category: "Ilustración",
  },
];

/* ── Mock Data: Productos para vincular ──────────────────────────────────── */
const mockLinkableProducts = [
  {
    id: "p1",
    name: "Camiseta Oversize Premium",
    price: "$ 48.000",
    category: "Camisetas",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "p2",
    name: "Hoodie Clásico Unisex",
    price: "$ 89.000",
    category: "Hoodies",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "p3",
    name: "Taza Cerámica 11oz",
    price: "$ 25.000",
    category: "Tazas",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "p4",
    name: "Gorra Urbana Bordada",
    price: "$ 38.000",
    category: "Accesorios",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "p5",
    name: "Bolsa Ecológica Canvas",
    price: "$ 22.000",
    category: "Bolsos",
    image:
      "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=300&auto=format&fit=crop&q=80",
  },
];

/* ── Componente Principal ────────────────────────────────────────────────── */
export default function StoreDesigner() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdvancedRoute = location.pathname.endsWith("/advanced");
  const documentId = new URLSearchParams(location.search).get("document");
  const [advancedDocumentLoaded, setAdvancedDocumentLoaded] = React.useState(
    !isAdvancedRoute,
  );
  // Estado principal: 'hub' (Pantalla inicial) o 'editor' (Área de trabajo)
  const [viewState, setViewState] = React.useState<"hub" | "editor">(
    isAdvancedRoute ? "editor" : "hub",
  );
  const [activeDesign, setActiveDesign] = React.useState<DesignItem | null>(
    null,
  );

  // Lista de diseños
  const [designs, setDesigns] =
    React.useState<DesignItem[]>(initialUserDesigns);
  const [isDirty, setIsDirty] = React.useState(false);
  // Modal "Crear Nuevo"
  const [isNewCanvasModalOpen, setIsNewCanvasModalOpen] = React.useState(false);

  const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = React.useState("");

  // Estado del Drag & Drop en el Hub
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(
        "printshop:seller-designer:designs",
      );
      if (saved) setDesigns(JSON.parse(saved) as DesignItem[]);
    } catch {
      /* Ignore unavailable or invalid browser storage. */
    }
  }, []);
  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        "printshop:seller-designer:designs",
        JSON.stringify(designs),
      );
    } catch {
      /* Storage is optional. */
    }
  }, [designs]);

  // Feedback Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  /* ── Estados del Editor ──────────────────────────────────────────────── */
  const [activeTool, setActiveTool] = React.useState<string>("move");
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [designTitle, setDesignTitle] = React.useState<string>("");
  const [blendMode, setBlendMode] = React.useState<string>("Normal");
  const [layerOpacity, setLayerOpacity] = React.useState<number>(100);
  const [selectedLayerId, setSelectedLayerId] =
    React.useState<string>("layer-1");
  const [selectedLayerIds, setSelectedLayerIds] = React.useState<string[]>([
    "layer-1",
  ]);

  // Transformación del elemento activo en el lienzo
  const [elementPos, setElementPos] = React.useState({ x: 0, y: 0 });
  const [elementScale, setElementScale] = React.useState(1);
  const [elementRotation, setElementRotation] = React.useState(0);
  const [elementSize, setElementSize] = React.useState({ w: 320, h: 320 });
  const [documentWidth, setDocumentWidth] = React.useState(3000);
  const [documentHeight, setDocumentHeight] = React.useState(3000);
  const [dpi, setDpi] = React.useState(300);
  const [rotation, setRotation] = React.useState(0);
  const [flipHorizontal, setFlipHorizontal] = React.useState(false);
  const [flipVertical, setFlipVertical] = React.useState(false);
  const [brightness, setBrightness] = React.useState(100);
  const [contrast, setContrast] = React.useState(100);
  const [saturation, setSaturation] = React.useState(100);
  const [imageDialog, setImageDialog] = React.useState<
    "image-size" | "canvas-size" | "adjustments" | null
  >(null);

  // Capas del editor
  const [layers, setLayers] = React.useState<EditorLayer[]>([
    {
      id: "layer-1",
      name: "Capa 1: Gráfico Principal",
      type: "image",
      visible: true,
      locked: false,
      opacity: 100,
      preview:
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "layer-2",
      name: "Capa 2: Tipografía JUMPMAN",
      type: "text",
      visible: true,
      locked: false,
      opacity: 100,
      preview: "",
      x: 0,
      y: 0,
      width: 320,
      height: 320,
      rotation: 0,
      fill: "#2563EB",
    },
    {
      id: "layer-0",
      name: "Capa 0: Fondo Blanco",
      type: "background",
      visible: true,
      locked: true,
      opacity: 100,
      preview: "",
    },
  ]);
  const historyRef = React.useRef<{
    past: EditorDocumentState[];
    future: EditorDocumentState[];
  }>({ past: [], future: [] });
  const clipboardRef = React.useRef<EditorLayer[]>([]);
  const applyingHistoryRef = React.useRef(false);
  const lastSnapshotRef = React.useRef<EditorDocumentState | null>(null);

  React.useEffect(() => {
    const visibleIds = new Set(
      layers.filter((layer) => layer.visible).map((layer) => layer.id),
    );
    const nextIds = selectedLayerIds.filter((id) => visibleIds.has(id));
    if (nextIds.length !== selectedLayerIds.length) {
      setSelectedLayerIds(nextIds);
      setSelectedLayerId(nextIds[0] ?? "");
    } else if (selectedLayerId && !visibleIds.has(selectedLayerId)) {
      setSelectedLayerId(nextIds[0] ?? "");
    }
  }, [layers, selectedLayerId, selectedLayerIds]);

  const getEditorDocumentState = React.useCallback(
    (): EditorDocumentState => ({
      layers: layers.map((layer) => ({ ...layer })),
      selectedLayerId,
      selectedLayerIds: [...selectedLayerIds],
      blendMode,
      layerOpacity,
      elementPos: { ...elementPos },
      elementScale,
      elementRotation,
      elementSize: { ...elementSize },
      documentWidth,
      documentHeight,
      dpi,
      rotation,
      flipHorizontal,
      flipVertical,
      brightness,
      contrast,
      saturation,
    }),
    [
      layers,
      selectedLayerId,
      blendMode,
      layerOpacity,
      elementPos,
      elementScale,
      elementRotation,
      elementSize,
      documentWidth,
      documentHeight,
      dpi,
      rotation,
      flipHorizontal,
      flipVertical,
      brightness,
      contrast,
      saturation,
    ],
  );

  const restoreEditorDocumentState = React.useCallback(
    (state: EditorDocumentState) => {
      applyingHistoryRef.current = true;
      setLayers(state.layers.map((layer) => ({ ...layer })));
      setSelectedLayerId(state.selectedLayerId);
      setSelectedLayerIds([
        ...(state.selectedLayerIds ?? [state.selectedLayerId]),
      ]);
      setBlendMode(state.blendMode);
      setLayerOpacity(state.layerOpacity);
      setElementPos({ ...state.elementPos });
      setElementScale(state.elementScale);
      setElementRotation(state.elementRotation);
      setElementSize({ ...state.elementSize });
      setDocumentWidth(state.documentWidth);
      setDocumentHeight(state.documentHeight);
      setDpi(state.dpi);
      setRotation(state.rotation);
      setFlipHorizontal(state.flipHorizontal);
      setFlipVertical(state.flipVertical);
      setBrightness(state.brightness);
      setContrast(state.contrast);
      setSaturation(state.saturation);
    },
    [],
  );

  React.useEffect(() => {
    if (!isAdvancedRoute) return;

    let cancelled = false;
    const routePath = "/store/designer/advanced";
    const loadOrCreateDocument = async () => {
      try {
        const requestedConfig = readNewCanvasConfig(location.state);
        if (!documentId) {
          const id = createDesigner3DocumentId();
          const config = requestedConfig
            ? {
                widthPx: requestedConfig.widthPx,
                heightPx: requestedConfig.heightPx,
                dpi: requestedConfig.dpi,
                background: requestedConfig.background,
                backgroundColor: requestedConfig.backgroundColor,
              }
            : {
                widthPx: documentWidth,
                heightPx: documentHeight,
                dpi,
                background: "white" as const,
                backgroundColor: "#ffffff",
              };
          await createDesigner3Document(
            id,
            requestedConfig?.name ?? "Mi nuevo diseño",
            config,
          );
          if (!cancelled) {
            navigate(
              { pathname: routePath, search: `?document=${encodeURIComponent(id)}` },
              { replace: true, state: location.state },
            );
          }
          return;
        }

        const persisted = await loadDesigner3Document(documentId);
        if (!persisted) {
          throw new Error(`No existe el documento Designer 3 "${documentId}".`);
        }
        if (cancelled) return;

        const snapshot = persisted.advancedSnapshot;
        const savedState =
          isRecord(snapshot) && isEditorDocumentState(snapshot.editorState)
            ? snapshot.editorState
            : null;
        const easyIsNewer =
          Boolean(persisted.easySnapshot) &&
          (!persisted.advancedUpdatedAt ||
            (persisted.easyUpdatedAt ?? "") > persisted.advancedUpdatedAt);

        if (savedState && !easyIsNewer) {
          restoreEditorDocumentState(savedState);
          const title =
            isRecord(snapshot) && typeof snapshot.title === "string"
              ? snapshot.title
              : "Mi diseño";
          setDesignTitle(title);
          setActiveDesign({
            id: documentId,
            title,
            previewUrl: "",
            lastModified: "Guardado automáticamente",
            productType: "Personalizado",
            dimensions: `${savedState.documentWidth} × ${savedState.documentHeight} px`,
            fileSize: "",
            editorState: savedState,
          });
        } else {
          const { metadata } = persisted.document;
          const width = typeof metadata.widthPx === "number" ? metadata.widthPx : documentWidth;
          const height = typeof metadata.heightPx === "number" ? metadata.heightPx : documentHeight;
          const savedDpi = typeof metadata.dpi === "number" ? metadata.dpi : dpi;
          setDocumentWidth(width);
          setDocumentHeight(height);
          setDpi(savedDpi);
          const easySnapshot = persisted.easySnapshot;
          const imageUrl =
            isRecord(easySnapshot) && typeof easySnapshot.imageUrl === "string"
              ? easySnapshot.imageUrl
              : null;
          const artworkDimensions =
            isRecord(easySnapshot) && isRecord(easySnapshot.artworkDimensions)
              ? easySnapshot.artworkDimensions
              : null;
          const artworkTransform =
            isRecord(easySnapshot) && isRecord(easySnapshot.artworkTransform)
              ? easySnapshot.artworkTransform
              : null;
          const previousAdvancedSnapshot = persisted.advancedSnapshot;
          const previousAdvancedState =
            isRecord(previousAdvancedSnapshot) &&
            isEditorDocumentState(previousAdvancedSnapshot.editorState)
              ? previousAdvancedSnapshot.editorState
              : null;
          const documentLayers =
            persisted.document.surfaces.find((surface) => surface.id === "front")
              ?.layers ?? [];
          const restoredLayers = fromDocumentLayers(
            documentLayers,
            previousAdvancedState?.layers ?? [],
          );
          const imageWidth =
            artworkDimensions && typeof artworkDimensions.width === "number"
              ? artworkDimensions.width
              : 480;
          const imageHeight =
            artworkDimensions && typeof artworkDimensions.height === "number"
              ? artworkDimensions.height
              : 480;
          const fittedScale = Math.min(width / imageWidth, height / imageHeight);
          const scale =
            artworkTransform && typeof artworkTransform.scale === "number"
              ? artworkTransform.scale
              : 1;
          const offsetX =
            artworkTransform && typeof artworkTransform.offsetX === "number"
              ? artworkTransform.offsetX
              : 0;
          const offsetY =
            artworkTransform && typeof artworkTransform.offsetY === "number"
              ? artworkTransform.offsetY
              : 0;
          const imageLayer: EditorLayer | null =
            restoredLayers.find((layer) => layer.type === "image") ??
            (imageUrl
            ? {
                id: "designer3-artwork",
                name: "Diseño",
                type: "image",
                visible: true,
                locked: false,
                opacity: 100,
                preview: imageUrl,
                src: imageUrl,
                x: width / 2 + offsetX * width - (imageWidth * fittedScale * scale) / 2,
                y: height / 2 + offsetY * height - (imageHeight * fittedScale * scale) / 2,
                width: imageWidth * fittedScale * scale,
                height: imageHeight * fittedScale * scale,
                naturalWidth: imageWidth,
                naturalHeight: imageHeight,
                rotation:
                  artworkTransform && typeof artworkTransform.rotationDegrees === "number"
                    ? artworkTransform.rotationDegrees
                    : 0,
                flipX: artworkTransform?.flipX === true,
                flipY: artworkTransform?.flipY === true,
              }
            : null);
          const background =
            metadata.background === "transparent"
              ? "transparent"
              : typeof metadata.backgroundColor === "string"
                ? metadata.backgroundColor
                : "#ffffff";
          const initialLayers: EditorLayer[] = restoredLayers.length
            ? [...restoredLayers]
            : [
                ...(imageLayer ? [imageLayer] : []),
                {
                  id: "designer3-background",
                  name: "Fondo",
                  type: "background",
                  visible: true,
                  locked: true,
                  opacity: 100,
                  preview: "",
                  fill: background,
                },
              ];
          if (
            imageLayer &&
            !initialLayers.some((layer) => layer.id === imageLayer.id)
          ) {
            initialLayers.unshift(imageLayer);
          }
          if (
            !initialLayers.some(
              (layer) =>
                layer.type === "background" ||
                layer.id === "designer3-background",
            )
          ) {
            initialLayers.push({
              id: "designer3-background",
              name: "Fondo",
              type: "background",
              visible: true,
              locked: true,
              opacity: 100,
              preview: "",
              fill: background,
            });
          }
          const selectedId =
            (previousAdvancedState &&
            initialLayers.some(
              (layer) => layer.id === previousAdvancedState.selectedLayerId,
            )
              ? previousAdvancedState.selectedLayerId
              : imageLayer?.id ?? initialLayers[0]?.id ?? "designer3-background");
          setLayers(initialLayers);
          setSelectedLayerId(selectedId);
          setSelectedLayerIds([selectedId]);
          setElementPos({ x: 0, y: 0 });
          setElementScale(1);
          setElementRotation(0);
          setElementSize({ w: width, h: height });
          const title =
            typeof metadata.title === "string" ? metadata.title : "Mi diseño";
          setDesignTitle(title);
          setActiveDesign({
            id: documentId,
            title,
            previewUrl: imageUrl ?? "",
            lastModified: "Guardado automáticamente",
            productType: "Personalizado",
            dimensions: `${width} × ${height} px`,
            fileSize: "",
            editorState: previousAdvancedState ?? undefined,
          });
        }
        setViewState("editor");
        setAdvancedDocumentLoaded(true);
      } catch (error) {
        if (cancelled) return;
        showToast(
          error instanceof Error
            ? `No se pudo recuperar el documento: ${error.message}`
            : "No se pudo recuperar el documento Designer 3.",
        );
        setAdvancedDocumentLoaded(true);
      }
    };

    void loadOrCreateDocument();
    return () => {
      cancelled = true;
    };
  }, [
    documentHeight,
    documentId,
    documentWidth,
    dpi,
    isAdvancedRoute,
    location.state,
    navigate,
    restoreEditorDocumentState,
  ]);

  React.useEffect(() => {
    if (
      !isAdvancedRoute ||
      !documentId ||
      !advancedDocumentLoaded ||
      viewState !== "editor"
    ) {
      return;
    }
    const snapshot = {
      title: designTitle || activeDesign?.title || "Mi diseño",
      editorState: getEditorDocumentState(),
    };
    const timeout = window.setTimeout(() => {
      void loadDesigner3Document(documentId)
        .then((persisted) => {
          if (!persisted) {
            throw new Error(`No existe el documento Designer 3 "${documentId}".`);
          }
          const background =
            persisted.document.metadata.background === "transparent" ||
            persisted.document.metadata.background === "white" ||
            persisted.document.metadata.background === "color"
              ? persisted.document.metadata.background
              : "white";
          const backgroundColor =
            typeof persisted.document.metadata.backgroundColor === "string"
              ? persisted.document.metadata.backgroundColor
              : "#ffffff";
          const document = updateDesigner3DocumentModel(
            persisted.document,
            {
              widthPx: snapshot.editorState.documentWidth,
              heightPx: snapshot.editorState.documentHeight,
              dpi: snapshot.editorState.dpi,
              background,
              backgroundColor,
            },
            toDocumentLayers(snapshot.editorState.layers),
            {
              title: snapshot.title,
            },
          );
          return saveDesigner3Snapshot(documentId, "advanced", snapshot, document);
        })
        .catch((error: unknown) => {
          showToast(
            error instanceof Error
              ? `No se pudo guardar el documento: ${error.message}`
              : "No se pudo guardar el documento Designer 3.",
          );
        });
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [
    activeDesign?.title,
    advancedDocumentLoaded,
    designTitle,
    documentId,
    getEditorDocumentState,
    isAdvancedRoute,
    viewState,
  ]);

  React.useEffect(() => {
    const current = getEditorDocumentState();
    const previous = lastSnapshotRef.current;
    if (!previous) {
      lastSnapshotRef.current = current;
      return;
    }
    if (applyingHistoryRef.current) {
      applyingHistoryRef.current = false;
      lastSnapshotRef.current = current;
      return;
    }
    if (JSON.stringify(previous) !== JSON.stringify(current)) {
      historyRef.current.past.push(previous);
      historyRef.current.future = [];
      lastSnapshotRef.current = current;
      setIsDirty(true);
    }
  }, [getEditorDocumentState]);

  const undo = React.useCallback(() => {
    const history = historyRef.current;
    const previous = history.past.pop();
    if (!previous) return;
    history.future.push(getEditorDocumentState());
    restoreEditorDocumentState(previous);
    setIsDirty(true);
  }, [getEditorDocumentState, restoreEditorDocumentState]);

  const redo = React.useCallback(() => {
    const history = historyRef.current;
    const next = history.future.pop();
    if (!next) return;
    history.past.push(getEditorDocumentState());
    restoreEditorDocumentState(next);
    setIsDirty(true);
  }, [getEditorDocumentState, restoreEditorDocumentState]);

  // Modal para vincular a producto
  const [isLinkProductModalOpen, setIsLinkProductModalOpen] =
    React.useState(false);
  const [selectedProductToLink, setSelectedProductToLink] = React.useState<
    string | null
  >(null);

  /* ── Funciones de Apertura del Editor ────────────────────────────────── */
  const openEditorWithDesign = (design: DesignItem) => {
    if (!isAdvancedRoute) {
      const editorState = design.editorState ?? getEditorDocumentState();
      const config: Designer3CanvasConfig = {
        widthPx: editorState.documentWidth,
        heightPx: editorState.documentHeight,
        dpi: editorState.dpi,
        background: "white",
        backgroundColor: "#ffffff",
      };
      void (async () => {
        try {
          await createDesigner3Document(design.id, design.title, config);
          await saveDesigner3Snapshot(design.id, "advanced", {
            title: design.title,
            editorState,
          });
          navigate(
            `/store/designer/advanced?document=${encodeURIComponent(design.id)}`,
          );
        } catch (error) {
          showToast(
            error instanceof Error
              ? `No se pudo abrir el diseño: ${error.message}`
              : "No se pudo abrir el diseño Designer 3.",
          );
        }
      })();
      return;
    }

    setActiveDesign(design);
    setDesignTitle(design.title);
    if (design.editorState) {
      const state = design.editorState;
      setLayers(state.layers);
      setSelectedLayerId(state.selectedLayerId);
      setSelectedLayerIds([state.selectedLayerId]);
      setBlendMode(state.blendMode);
      setLayerOpacity(state.layerOpacity);
      setElementPos(state.elementPos);
      setElementScale(state.elementScale);
      setElementRotation(state.elementRotation);
      setElementSize(state.elementSize);
      setDocumentWidth(state.documentWidth ?? 3000);
      setDocumentHeight(state.documentHeight ?? 3000);
      setDpi(state.dpi ?? 300);
      setRotation(state.rotation ?? 0);
      setFlipHorizontal(state.flipHorizontal ?? false);
      setFlipVertical(state.flipVertical ?? false);
      setBrightness(state.brightness ?? 100);
      setContrast(state.contrast ?? 100);
      setSaturation(state.saturation ?? 100);
    } else {
      setLayers((prev) => [
        {
          ...prev[0],
          name: `Capa 1: ${design.title}`,
          preview: design.previewUrl,
        },
        prev[1],
        prev[2],
      ]);
      setSelectedLayerId("layer-1");
      setSelectedLayerIds(["layer-1"]);
      setBlendMode("Normal");
      setLayerOpacity(100);
      setElementPos({ x: 0, y: 0 });
      setElementScale(1);
      setElementRotation(0);
      setElementSize({ w: 320, h: 320 });
      setDocumentWidth(3000);
      setDocumentHeight(3000);
      setDpi(300);
      setRotation(0);
      setFlipHorizontal(false);
      setFlipVertical(false);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
    }
    setViewState("editor");
    setIsDirty(false);
  };

  /** Abre el modal de configuración en lugar de crear directamente */
  const openEditorNewBlank = () => {
    setIsNewCanvasModalOpen(true);
  };

  /** Crea el nuevo documento real con la configuración del modal */
  const handleNewCanvasApply = async (
    config: NewCanvasConfig,
    isAdvancedMode: boolean,
  ) => {
    const id = createDesigner3DocumentId();
    try {
      await createDesigner3Document(id, config.name, {
        widthPx: config.widthPx,
        heightPx: config.heightPx,
        dpi: config.dpi,
        background: config.background,
        backgroundColor: config.backgroundColor,
      });
      const route = isAdvancedMode
        ? "/store/designer/advanced"
        : "/store/designer/easy";
      navigate(`${route}?document=${encodeURIComponent(id)}`, {
        state: { newCanvasConfig: config },
      });
    } catch (error) {
      showToast(
        error instanceof Error
          ? `No se pudo crear el documento: ${error.message}`
          : "No se pudo crear el documento Designer 3.",
      );
    }
  };

  const openEditorWithPreset = (preset: StylePreset) => {
    const newTitle = `Efecto_${preset.name.replace(/\s+/g, "_")}`;
    const newDesign: DesignItem = {
      id: `des-${Date.now()}`,
      title: newTitle,
      previewUrl: preset.preview,
      lastModified: "Recién aplicado",
      productType: "Efecto Rápido",
      dimensions: "2800 x 2800 px",
      fileSize: "3.5 MB",
    };
    setActiveDesign(newDesign);
    setDesignTitle(newTitle);
    setLayers((prev) => [
      {
        ...prev[0],
        name: `Capa 1: ${preset.name}`,
        preview: preset.preview,
      },
      prev[1],
      prev[2],
    ]);
    setSelectedLayerId("layer-1");
    setSelectedLayerIds(["layer-1"]);
    setDocumentWidth(3000);
    setDocumentHeight(3000);
    setDpi(300);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setViewState("editor");
    setIsDirty(false);
    showToast(`Estilo "${preset.name}" cargado en el editor`);
  };

  /* ── Manejo de Archivo Subido / Drag & Drop ──────────────────────────── */
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file: File) => {
    // Validate format
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      showToast(
        `Formato no soportado: ${file.type || "desconocido"}. Usa JPG, PNG o WebP.`,
      );
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    // Load image to get natural dimensions
    const img = new Image();
    img.src = objectUrl;
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });

    const natW = img.naturalWidth || 800;
    const natH = img.naturalHeight || 800;

    if (!isAdvancedRoute) {
      const id = createDesigner3DocumentId();
      const canvasConfig: NewCanvasConfig = {
        name: file.name.replace(/\.[^/.]+$/, ""),
        widthPx: natW,
        heightPx: natH,
        dpi: 300,
        background: "transparent",
        backgroundColor: "transparent",
      };
      try {
        await createDesigner3Document(id, canvasConfig.name, canvasConfig);
        navigate(`/store/designer/easy?document=${encodeURIComponent(id)}`, {
          state: { newCanvasConfig: canvasConfig, initialFile: file },
        });
      } catch (error) {
        showToast(
          error instanceof Error
            ? `No se pudo crear el documento: ${error.message}`
            : "No se pudo crear el documento Designer 3.",
        );
      }
      return;
    }

    // Scale to fit within canvas base (480px) while maintaining aspect ratio
    const BASE = 480;
    const maxSide = 340; // max initial size in canvas px
    const scale = Math.min(maxSide / natW, maxSide / natH, 1);
    const initW = Math.round(natW * scale);
    const initH = Math.round(natH * scale);

    // Generate thumbnail for layers panel (56x56)
    const thumb = document.createElement("canvas");
    thumb.width = 56;
    thumb.height = 56;
    const tCtx = thumb.getContext("2d")!;
    tCtx.drawImage(img, 0, 0, 56, 56);
    const thumbUrl = thumb.toDataURL("image/png");

    const layerId = `layer-img-${Date.now()}`;
    const newImageLayer: EditorLayer = {
      id: layerId,
      name: file.name.replace(/\.[^/.]+$/, ""),
      type: "image",
      visible: true,
      locked: false,
      opacity: 100,
      preview: thumbUrl,
      src: objectUrl,
      processedSrc: null,
      naturalWidth: natW,
      naturalHeight: natH,
      x: 0,
      y: 0,
      width: initW,
      height: initH,
      rotation: 0,
    };

    // If already in editor: add as a new layer on top
    if (viewState === "editor") {
      setLayers((prev) => [newImageLayer, ...prev]);
      setSelectedLayerId(layerId);
      setSelectedLayerIds([layerId]);
      setIsDirty(true);
      showToast(`Imagen "${file.name}" añadida como nueva capa`);
      return;
    }

    // Otherwise: open a new design
    const newDesign: DesignItem = {
      id: `des-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      previewUrl: thumbUrl,
      lastModified: "Hace un momento",
      productType: "Archivo Subido",
      dimensions: `${natW} × ${natH} px`,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    };
    setDesigns((prev) => [newDesign, ...prev]);

    // Open editor with this layer already in place
    setActiveDesign(newDesign);
    setDesignTitle(newDesign.title);
    setLayers([
      newImageLayer,
      {
        id: "layer-bg-0",
        name: "Fondo",
        type: "background",
        visible: true,
        locked: true,
        opacity: 100,
        preview: "",
        fill: "#ffffff",
      },
    ]);
    setSelectedLayerId(layerId);
    setSelectedLayerIds([layerId]);
    setDocumentWidth(natW);
    setDocumentHeight(natH);
    setDpi(300);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setViewState("editor");
    setIsDirty(false);
    showToast(`Imagen "${file.name}" cargada (${natW}×${natH}px)`);
  };

  /* ── Acciones de Capas ───────────────────────────────────────────────── */
  const toggleLayerVisibility = (layerId: string) => {
    setIsDirty(true);
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)),
    );
  };

  const toggleLayerLock = (layerId: string) => {
    setIsDirty(true);
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l)),
    );
  };

  const addEmptyLayer = () => {
    addShapeLayer("rectangle");
  };

  const addShapeLayer = (
    shapeType: "rectangle" | "circle" | "triangle" | "line" = "rectangle",
  ) => {
    setIsDirty(true);
    const id = `layer-shape-${Date.now()}`;
    const names: Record<string, string> = {
      rectangle: "Rectángulo",
      circle: "Círculo",
      triangle: "Triángulo",
      line: "Línea",
    };
    const count =
      layers.filter((l) => l.type === "shape" && l.shapeType === shapeType)
        .length + 1;
    const newShape: EditorLayer = {
      id,
      name: `${names[shapeType]} ${count}`,
      type: "shape",
      shapeType,
      visible: true,
      locked: false,
      opacity: 100,
      preview: "",
      x: 0,
      y: 0,
      width: shapeType === "line" ? 280 : 200,
      height: shapeType === "line" ? 30 : 200,
      rotation: 0,
      fill: "#2563EB",
      stroke: undefined,
      strokeWidth: shapeType === "line" ? 6 : 2,
      borderRadius: shapeType === "rectangle" ? 4 : 0,
    };

    setLayers((prev) => [newShape, ...prev]);
    setSelectedLayerId(id);
    setSelectedLayerIds([id]);
    showToast(`${names[shapeType]} añadido`);
  };

  const addTextLayer = () => {
    const id = `layer-${Date.now()}`;
    const textLayer: EditorLayer = {
      id,
      name: `Texto ${layers.filter((layer) => layer.type === "text").length + 1}`,
      type: "text",
      visible: true,
      locked: false,
      opacity: 100,
      preview: "",
      x: 0,
      y: 0,
      width: 420,
      height: 90,
      rotation: 0,
      content: "Texto",
      fontFamily: "Arial",
      fontSize: 48,
      color: "#111827",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      textAlign: "center",
    };
    setLayers((current) => [textLayer, ...current]);
    setSelectedLayerId(id);
    setSelectedLayerIds([id]);
  };

  const updateSelectedText = (changes: Partial<EditorLayer>) => {
    if (!selectedLayerId) return;
    const selected = layers.find((layer) => layer.id === selectedLayerId);
    if (!selected || selected.type !== "text" || selected.locked) return;
    setLayers((current) =>
      current.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, ...changes } : layer,
      ),
    );
  };

  const updateSelectedImageFilters = (
    changes: Partial<NonNullable<EditorLayer["filters"]>>,
  ) => {
    if (!selectedLayerId) return;
    const selected = layers.find((layer) => layer.id === selectedLayerId);
    if (!selected || selected.type !== "image" || selected.locked) return;
    const current = selected.filters ?? {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      blur: 0,
    };
    setLayers((currentLayers) =>
      currentLayers.map((layer) =>
        layer.id === selectedLayerId
          ? { ...layer, filters: { ...current, ...changes } }
          : layer,
      ),
    );
    setIsDirty(true);
  };

  const updateLayer = (id: string, changes: Partial<EditorLayer>) => {
    setLayers((current) =>
      current.map((layer) =>
        layer.id === id ? { ...layer, ...changes } : layer,
      ),
    );
    setIsDirty(true);
  };

  const updateMultipleLayers = (
    updates: { id: string; changes: Partial<EditorLayer> }[],
  ) => {
    const changeMap = new Map(updates.map((u) => [u.id, u.changes]));
    setLayers((current) =>
      current.map((layer) =>
        changeMap.has(layer.id)
          ? { ...layer, ...changeMap.get(layer.id) }
          : layer,
      ),
    );
    setIsDirty(true);
  };

  const deleteLayer = (layerId: string) => {
    if (layers.length <= 1) {
      showToast("No se puede eliminar la única capa");
      return;
    }
    setLayers((prev) => prev.filter((l) => l.id !== layerId));
    setIsDirty(true);
    const nextLayer = layers.find((layer) => layer.id !== layerId);
    setSelectedLayerId(nextLayer?.id ?? "");
    setSelectedLayerIds((current) => current.filter((id) => id !== layerId));
    showToast("Capa eliminada");
  };

  const copySelected = () => {
    const ids = selectedLayerIds.length ? selectedLayerIds : [selectedLayerId];
    clipboardRef.current = layers
      .filter(
        (layer) =>
          ids.includes(layer.id) &&
          layer.type !== "background" &&
          !layer.locked,
      )
      .map((layer) => ({ ...layer }));
  };

  const pasteClipboard = () => {
    if (!clipboardRef.current.length) return;
    const pasted = clipboardRef.current.map((layer, index) => ({
      ...layer,
      id: `layer-${Date.now()}-${index}`,
      name: `${layer.name} (copia)`,
    }));
    setLayers((current) => [...pasted, ...current]);
    setSelectedLayerId(pasted[0].id);
    setSelectedLayerIds(pasted.map((layer) => layer.id));
  };

  const duplicateSelected = () => {
    copySelected();
    pasteClipboard();
  };

  const cutSelected = () => {
    copySelected();
    const ids = new Set(clipboardRef.current.map((layer) => layer.id));
    if (!ids.size) return;
    setLayers((current) => current.filter((layer) => !ids.has(layer.id)));
    setSelectedLayerId("");
    setSelectedLayerIds([]);
  };

  const deleteSelected = () => {
    const ids = new Set(
      selectedLayerIds.length ? selectedLayerIds : [selectedLayerId],
    );
    const editableIds = new Set(
      layers
        .filter(
          (layer) =>
            ids.has(layer.id) && layer.type !== "background" && !layer.locked,
        )
        .map((layer) => layer.id),
    );
    if (!editableIds.size) return;
    setLayers((current) =>
      current.filter((layer) => !editableIds.has(layer.id)),
    );
    const next = layers.find((layer) => !editableIds.has(layer.id));
    setSelectedLayerId(next?.id ?? "");
    setSelectedLayerIds(next ? [next.id] : []);
  };

  const duplicateSelectedLayer = () => {
    if (!selectedLayerId) return;
    duplicateSelected();
  };

  const moveSelectedLayer = (direction: "up" | "down" | "front" | "back") => {
    const index = layers.findIndex((layer) => layer.id === selectedLayerId);
    if (index < 0) return;
    const target =
      direction === "up"
        ? index - 1
        : direction === "down"
          ? index + 1
          : direction === "front"
            ? 0
            : layers.length - 1;
    if (target < 0 || target >= layers.length || target === index) return;
    setLayers((current) => {
      const next = [...current];
      const [layer] = next.splice(index, 1);
      next.splice(target, 0, layer);
      return next;
    });
  };

  const toggleSelectedVisibility = () => {
    if (selectedLayerId) toggleLayerVisibility(selectedLayerId);
  };

  const toggleSelectedLock = () => {
    if (selectedLayerId) toggleLayerLock(selectedLayerId);
  };

  const selectAll = () => {
    const ids = layers
      .filter(
        (layer) =>
          layer.visible && layer.type !== "background" && !layer.locked,
      )
      .map((layer) => layer.id);
    setSelectedLayerIds(ids);
    setSelectedLayerId(ids[0] ?? "");
  };

  const selectLayer = (layerId: string, additive = false) => {
    const layer = layers.find((item) => item.id === layerId);
    if (!layer || !layer.visible) return;
    if (!additive) {
      setSelectedLayerId(layerId);
      setSelectedLayerIds([layerId]);
      return;
    }
    setSelectedLayerIds((current) => {
      const next = current.includes(layerId)
        ? current.filter((id) => id !== layerId)
        : [...current, layerId];
      setSelectedLayerId(next[0] ?? "");
      return next;
    });
  };

  const deselectLayers = () => {
    setSelectedLayerId("");
    setSelectedLayerIds([]);
  };

  const invertSelection = () => {
    const selected = new Set(selectedLayerIds);
    const ids = layers
      .filter(
        (layer) =>
          layer.visible && layer.type !== "background" && !layer.locked,
      )
      .map((layer) => layer.id)
      .filter((id) => !selected.has(id));
    setSelectedLayerIds(ids);
    setSelectedLayerId(ids[0] ?? "");
  };

  const rotateAction = (degrees: number) => {
    const selected = layers.find((l) => l.id === selectedLayerId);
    if (selected && !selected.locked && selected.type !== "background") {
      const curRot = selected.rotation ?? 0;
      const nextRot = (curRot + degrees + 360) % 360;
      updateLayer(selected.id, { rotation: nextRot });
      showToast(`Capa rotada ${degrees}°`);
    } else {
      const normalized = (rotation + degrees + 360) % 360;
      setRotation(normalized);
      if (Math.abs(degrees) === 90) {
        setDocumentWidth(documentHeight);
        setDocumentHeight(documentWidth);
      }
      showToast(`Lienzo rotado ${degrees}°`);
    }
  };

  const flipHorizontalAction = () => {
    const selected = layers.find((l) => l.id === selectedLayerId);
    if (selected && !selected.locked && selected.type !== "background") {
      updateLayer(selected.id, { flipX: !selected.flipX });
      showToast(`Capa volteada horizontalmente`);
    } else {
      setFlipHorizontal((value) => !value);
      showToast(`Lienzo volteado horizontalmente`);
    }
  };

  const flipVerticalAction = () => {
    const selected = layers.find((l) => l.id === selectedLayerId);
    if (selected && !selected.locked && selected.type !== "background") {
      updateLayer(selected.id, { flipY: !selected.flipY });
      showToast(`Capa volteada verticalmente`);
    } else {
      setFlipVertical((value) => !value);
      showToast(`Lienzo volteado verticalmente`);
    }
  };

  const applyImageSize = (width: number, height: number, nextDpi: number) => {
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0 ||
      !Number.isFinite(nextDpi) ||
      nextDpi <= 0
    ) {
      showToast("Introduce dimensiones y resolución válidas");
      return;
    }
    const selected = layers.find((l) => l.id === selectedLayerId);
    if (selected && !selected.locked && selected.type !== "background") {
      updateLayer(selected.id, {
        width: Math.round(width),
        height: Math.round(height),
      });
      showToast(`Tamaño de capa actualizado a ${width}×${height}px`);
    } else {
      setDocumentWidth(Math.round(width));
      setDocumentHeight(Math.round(height));
      showToast(`Tamaño de imagen actualizado a ${width}×${height}px`);
    }
    setDpi(Math.round(nextDpi));
    setImageDialog(null);
  };

  const applyCanvasSize = (
    width: number,
    height: number,
    anchor: CanvasAnchor = "Center",
  ) => {
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      showToast("Introduce un tamaño de lienzo válido");
      return;
    }
    const newW = Math.round(width);
    const newH = Math.round(height);
    const updates = repositionLayersForCanvasAnchor(
      layers as any,
      documentWidth,
      documentHeight,
      newW,
      newH,
      anchor,
    );
    if (updates.length > 0) {
      updateMultipleLayers(updates as any);
    }
    setDocumentWidth(newW);
    setDocumentHeight(newH);
    setImageDialog(null);
    showToast(`Tamaño del lienzo actualizado a ${newW}×${newH}px`);
  };

  const handleAlign = (type: AlignmentType) => {
    const ids = selectedLayerIds.length ? selectedLayerIds : [selectedLayerId];
    const updates = alignLayers(
      layers as any,
      ids,
      type,
      documentWidth,
      documentHeight,
    );
    if (updates.length > 0) {
      updateMultipleLayers(updates as any);
      showToast("Alineación aplicada");
    }
  };

  const handleDistribute = (dir: DistributionType) => {
    const ids = selectedLayerIds.length ? selectedLayerIds : [selectedLayerId];
    const updates = distributeLayers(layers as any, ids, dir);
    if (updates.length > 0) {
      updateMultipleLayers(updates as any);
      showToast("Distribución aplicada");
    } else {
      showToast("Selecciona al menos 3 capas para distribuir");
    }
  };

  const handleCropApply = (
    layerId: string,
    rect: CropRect,
    croppedDataUrl: string,
  ) => {
    updateLayer(layerId, {
      processedSrc: croppedDataUrl,
      cropRect: rect,
      lastOp: "crop",
      width: rect.width,
      height: rect.height,
    });
    showToast("Recorte aplicado a la imagen");
  };

  const applyAdjustments = (
    nextBrightness: number,
    nextContrast: number,
    nextSaturation: number,
  ) => {
    setBrightness(Math.max(0, Math.min(200, nextBrightness)));
    setContrast(Math.max(0, Math.min(200, nextContrast)));
    setSaturation(Math.max(0, Math.min(200, nextSaturation)));
    setImageDialog(null);
  };

  /* ── Guardar / Exportar ──────────────────────────────────────────────── */
  const handleSaveDesign = () => {
    const editorState = getEditorDocumentState();
    if (activeDesign) {
      const savedDesign = {
        ...activeDesign,
        title: designTitle,
        lastModified: "Hace un momento",
        editorState,
      };
      setDesigns((prev) =>
        prev.map((d) => (d.id === activeDesign.id ? savedDesign : d)),
      );
      setActiveDesign(savedDesign);
    }
    setIsDirty(false);
    showToast("Diseño guardado correctamente en la nube");
  };

  const handleSaveAs = () => {
    const name = window.prompt("Nombre del diseño", designTitle) ?? "";
    if (!name.trim()) return;
    const copy: DesignItem = {
      ...(activeDesign ?? {
        id: `des-${Date.now()}`,
        previewUrl: "",
        productType: "Personalizado",
        dimensions: "3000 x 3000 px",
        fileSize: "1.2 MB",
      }),
      id: `des-${Date.now()}`,
      title: name.trim(),
      lastModified: "Hace un momento",
      editorState: getEditorDocumentState(),
    };
    setDesigns((prev) => [
      copy,
      ...prev.filter((design) => design.id !== copy.id),
    ]);
    setActiveDesign(copy);
    setDesignTitle(copy.title);
    setIsDirty(false);
    showToast("Diseño guardado como una copia nueva");
  };

  const handleExport = async (format: string) => {
    showToast("Generando exportación…");
    try {
      const exportLayers = layers.map((layer) => ({
        src: layer.processedSrc ?? layer.src ?? layer.preview ?? "",
        x: layer.x ?? 0,
        y: layer.y ?? 0,
        width: layer.width ?? 480,
        height: layer.height ?? 480,
        rotation: layer.rotation ?? 0,
        opacity: layer.opacity ?? 100,
        visible: layer.visible,
        type: layer.type,
        content: layer.content,
        fontFamily: layer.fontFamily,
        fontSize: layer.fontSize,
        color: layer.color,
        fontWeight: layer.fontWeight,
        fontStyle: layer.fontStyle,
        textDecoration: layer.textDecoration,
        textAlign: layer.textAlign,
        fill: layer.fill,
        filters: layer.filters,
        flipX: layer.flipX,
        flipY: layer.flipY,
        shapeType: layer.shapeType,
        stroke: layer.stroke,
        strokeWidth: layer.strokeWidth,
        borderRadius: layer.borderRadius,
      }));

      const isJpeg =
        format.toLowerCase().includes("jpg") ||
        format.toLowerCase().includes("jpeg");
      const dataUrl = await exportComposite(exportLayers, {
        docWidth: documentWidth || 480,
        docHeight: documentHeight || 480,
        scale: 2, // 2× = 960px output
        format: isJpeg ? "jpeg" : "png",
        quality: 0.92,
        flipHorizontal,
        flipVertical,
        rotation,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${designTitle || "diseno"}.${isJpeg ? "jpg" : "png"}`;
      link.click();
      showToast(`Exportado como ${format} (960×960px)`);
    } catch (err) {
      console.error("Export failed:", err);
      showToast("Error al exportar. Intenta de nuevo.");
    }
  };

  const requestAction = (action: () => void) => {
    if (isDirty) setPendingAction(() => action);
    else action();
  };
  const closeEditor = () =>
    requestAction(() => {
      setViewState("hub");
      setPendingAction(null);
    });
  const discardChanges = () => {
    const action = pendingAction;
    setPendingAction(null);
    setIsDirty(false);
    action?.();
  };
  const saveAndContinue = () => {
    const action = pendingAction;
    handleSaveDesign();
    setPendingAction(null);
    action?.();
  };

  /* ── Filtrar Diseños del Hub ─────────────────────────────────────────── */
  const filteredDesigns = designs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.productType.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isAdvancedRoute && !advancedDocumentLoaded) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#F8FAFC]">
        <p role="status" className="text-sm font-medium text-[#64748B]">
          Recuperando documento…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      {/* ── Toast de Notificación Flotante ─────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-[6px] border border-[#BFDBFE] bg-white px-4 py-2.5 text-xs font-medium text-[#1E3A8A] shadow-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-[#2563EB]" />
          <span>{toastMessage}</span>
        </div>
      )}
      {pendingAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-xl"
          >
            <h2 className="text-sm font-bold text-[#111827]">
              Cambios sin guardar
            </h2>
            <p className="mt-2 text-xs text-[#64748B]">
              ¿Quieres guardar los cambios antes de continuar?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="rounded px-3 py-1.5 text-xs text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={discardChanges}
                className="rounded border border-[#E2E8F0] px-3 py-1.5 text-xs text-[#475569] hover:bg-[#F8FAFC]"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={saveAndContinue}
                className="rounded bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.psd,.svg"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* ===================================================================
          ESTADO A: PANTALLA INICIAL DEL DISEÑADOR (HUB / WELCOME)
          Inspirado en la Referencia Visual 1
          =================================================================== */}
      {viewState === "hub" && (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
          {/* ── Encabezado Principal ───────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <span>Tienda</span>
                <span>/</span>
                <span className="text-[#2563EB] font-medium">Diseñador</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight flex items-center gap-2.5">
                <span>PrintShop Designer</span>
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
                Crea, edita y prepara diseños de alta resolución optimizados
                para impresión textil y artículos personalizados.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={openEditorNewBlank}
                className="flex items-center gap-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-[6px] px-4 py-2.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nuevo</span>
              </button>
            </div>
          </div>

          {/* ── ÁREA PRINCIPAL: HERO DRAG & DROP ───────────────────────── */}
          <div className="w-full">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative group cursor-pointer w-full rounded-lg transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center border-2 border-dashed",
                isDraggingOver
                  ? "bg-[#EFF6FF] border-[#2563EB] shadow-lg scale-[1.005]"
                  : "border-[#BFDBFE] bg-white shadow-sm hover:border-[#2563EB]/70 hover:bg-[#F8FBFF]",
              )}
            >
              {/* Icono de Carga */}
              <div
                className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110 shadow-sm",
                  isDraggingOver
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]",
                )}
              >
                <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
              </div>

              {/* Textos Principales */}
              <h2
                className={cn(
                  "text-lg sm:text-xl font-bold mb-1.5 transition-colors",
                  isDraggingOver ? "text-[#1E3A8A]" : "text-[#111827]",
                )}
              >
                Arrastra y suelta tu archivo de diseño aquí
              </h2>
              <p
                className={cn(
                  "text-xs sm:text-sm max-w-[420px] mb-5 leading-relaxed",
                  isDraggingOver ? "text-[#3B82F6]" : "text-[#64748B]",
                )}
              >
                o selecciona un archivo desde tu ordenador para comenzar a
                personalizar tus productos.
              </p>

              {/* Botón de Selección */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2 rounded-[6px] bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#1D4ED8]"
              >
                <FileImage className="w-4 h-4" />
                <span>Seleccionar archivo</span>
              </button>

              <span
                className={cn(
                  "text-[11px] mt-4 block",
                  isDraggingOver ? "text-[#64748B]" : "text-[#64748B]",
                )}
              >
                Formatos recomendados: PNG transparente, JPG, SVG, PSD (hasta
                50MB)
              </span>
            </div>

            {/* ── Acciones Rápidas (Chips debajo del Hero) ─────────────── */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => {
                  openEditorNewBlank();
                  showToast("Herramienta Quitar Fondo activada en el editor");
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-[#334155] bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] px-3.5 py-2 rounded-full shadow-2xs transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Quitar fondo con IA</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openEditorNewBlank();
                  showToast("Herramienta Generador IA lista");
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-[#334155] bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] px-3.5 py-2 rounded-full shadow-2xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Generar gráfico con IA</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openEditorNewBlank();
                  showToast("Modo realce de color activado");
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-[#334155] bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] px-3.5 py-2 rounded-full shadow-2xs transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Mejorar colores e intensidad</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openEditorNewBlank();
                  showToast("Herramienta de Tipografía activada");
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-[#334155] bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] px-3.5 py-2 rounded-full shadow-2xs transition-colors"
              >
                <Type className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Crear tipografía personalizada</span>
              </button>
            </div>
          </div>

          {/* ── SECCIÓN: EFECTOS Y ESTILOS RÁPIDOS ─────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#111827] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2563EB]" />
                  <span>Prueba un estilo o efecto</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Aplica estilos predeterminados directamente sobre el lienzo
                  para acelerar tu flujo de trabajo.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer hidden sm:inline-block">
                Ver todos los estilos ({stylePresets.length})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {stylePresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => openEditorWithPreset(preset)}
                  className="group cursor-pointer bg-white rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <div className="h-28 sm:h-32 w-full overflow-hidden relative bg-[#F1F5F9]">
                    <img
                      src={preset.preview}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-[10px] text-white font-medium bg-[#2563EB] px-2 py-0.5 rounded">
                        Usar estilo
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <p className="text-xs font-bold text-[#111827] truncate group-hover:text-[#2563EB] transition-colors">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                      {preset.tagline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECCIÓN: MIS DISEÑOS RECIENTES ─────────────────────────── */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#111827] flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#2563EB]" />
                  <span>Mis Diseños</span>
                  <span className="text-xs font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                    {filteredDesigns.length}
                  </span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Tus creaciones guardadas listas para abrir, editar o aplicar a
                  productos.
                </p>
              </div>

              {/* Buscador de diseños */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Buscar en mis diseños..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            {filteredDesigns.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
                <Palette className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 stroke-[1.5]" />
                <p className="text-sm font-semibold text-[#111827]">
                  No se encontraron diseños
                </p>
                <p className="text-xs text-[#64748B] mt-1 max-w-[280px] mx-auto">
                  Crea tu primer diseño o sube un archivo para verlo en esta
                  sección.
                </p>
                <button
                  type="button"
                  onClick={openEditorNewBlank}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#2563EB] px-3.5 py-1.5 rounded-[6px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Nuevo</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {filteredDesigns.map((design) => (
                  <div
                    key={design.id}
                    onClick={() => openEditorWithDesign(design)}
                    className="group cursor-pointer bg-white rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    {/* Preview Image */}
                    <div className="h-40 w-full overflow-hidden relative bg-[#F8FAFC]">
                      <img
                        src={design.previewUrl}
                        alt={design.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-semibold text-white bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded">
                          Abrir
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#111827] truncate group-hover:text-[#2563EB] transition-colors">
                          {design.title}
                        </p>
                        <p className="text-[10.5px] text-[#64748B] mt-1 flex items-center justify-between">
                          <span>{design.lastModified}</span>
                          <span className="text-[#94A3B8]">
                            {design.fileSize}
                          </span>
                        </p>
                      </div>

                      <div className="pt-2 mt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                        <span className="text-[10px] text-[#2563EB] font-medium group-hover:underline flex items-center gap-1">
                          <span>Editar</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast("Diseño duplicado");
                          }}
                          className="p-1 text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================
          ESTADO B: ÁREA DE TRABAJO / EDITOR DE DISEÑO PROFESIONAL
          Inspirado en la Referencia Visual 2 (Photoshop Web Editor adaptado)
          =================================================================== */}
      {viewState === "editor" && (
        <>
          <DesignerWorkspace
            title={designTitle}
            previewUrl={activeDesign?.previewUrl}
            layers={layers}
            documentWidth={documentWidth}
            documentHeight={documentHeight}
            dpi={dpi}
            rotation={rotation}
            flipHorizontal={flipHorizontal}
            flipVertical={flipVertical}
            brightness={brightness}
            contrast={contrast}
            saturation={saturation}
            selectedLayerId={selectedLayerId}
            selectedLayerIds={selectedLayerIds}
            onSelectLayer={selectLayer}
            onSelectMultipleLayers={(ids) => {
              setSelectedLayerIds(ids);
              if (ids.length > 0) setSelectedLayerId(ids[0]);
            }}
            onDeselect={deselectLayers}
            onInvertSelection={invertSelection}
            onBack={closeEditor}
            onNew={() => requestAction(() => setIsNewCanvasModalOpen(true))}
            onOpen={() => requestAction(() => fileInputRef.current?.click())}
            onRecents={() =>
              showToast(
                designs.length
                  ? `Recientes: ${designs
                      .slice(0, 3)
                      .map((d) => d.title)
                      .join(", ")}`
                  : "No hay diseños recientes",
              )
            }
            onSave={handleSaveDesign}
            onSaveAs={handleSaveAs}
            onExport={() => handleExport("PNG")}
            onLinkProduct={() => setIsLinkProductModalOpen(true)}
            onToggleLayer={toggleLayerVisibility}
            onToggleLock={toggleLayerLock}
            onDeleteLayer={deleteLayer}
            onAddLayer={addEmptyLayer}
            onUndo={undo}
            onRedo={redo}
            canUndo={historyRef.current.past.length > 0}
            canRedo={historyRef.current.future.length > 0}
            onCut={cutSelected}
            onCopy={copySelected}
            onPaste={pasteClipboard}
            onDuplicate={duplicateSelected}
            onDeleteSelected={deleteSelected}
            onSelectAll={selectAll}
            onImageSize={() => setImageDialog("image-size")}
            onCanvasSize={() => setImageDialog("canvas-size")}
            onRotate={(degrees) => rotateAction(degrees)}
            onFlipHorizontal={flipHorizontalAction}
            onFlipVertical={flipVerticalAction}
            onAdjustments={() => setImageDialog("adjustments")}
            onApplyImageSize={applyImageSize}
            onApplyCanvasSize={applyCanvasSize}
            onApplyAdjustments={applyAdjustments}
            imageDialog={imageDialog}
            onCloseImageDialog={() => setImageDialog(null)}
            onDuplicateLayer={duplicateSelectedLayer}
            onMoveLayerUp={() => moveSelectedLayer("up")}
            onMoveLayerDown={() => moveSelectedLayer("down")}
            onBringLayerToFront={() => moveSelectedLayer("front")}
            onSendLayerToBack={() => moveSelectedLayer("back")}
            onToggleSelectedVisibility={toggleSelectedVisibility}
            onToggleSelectedLock={toggleSelectedLock}
            onAddTextLayer={addTextLayer}
            onAddShape={addShapeLayer}
            onAlign={handleAlign}
            onDistribute={handleDistribute}
            onCropApply={handleCropApply}
            onDropFiles={(files) => {
              if (files && files.length > 0) {
                Array.from(files).forEach((f) => processUploadedFile(f));
              }
            }}
            selectedTextLayer={layers.find(
              (layer) => layer.id === selectedLayerId && layer.type === "text",
            )}
            onUpdateSelectedText={updateSelectedText}
            selectedImageLayer={layers.find(
              (layer) => layer.id === selectedLayerId && layer.type === "image",
            )}
            onUpdateSelectedImageFilters={updateSelectedImageFilters}
            onUpdateLayer={updateLayer}
            onUpdateMultipleLayers={updateMultipleLayers}
          />
          {false && (
            <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#18181B] text-white select-none">
              {/* ── BARRA SUPERIOR DEL EDITOR ──────────────────────────────── */}
              <div className="h-12 bg-[#202024] border-b border-[#2E2E33] px-3 sm:px-4 flex items-center justify-between shrink-0">
                {/* Izquierda: Volver + Nombre del Archivo */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setViewState("hub")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-white bg-[#27272A] hover:bg-[#3F3F46] px-2.5 py-1.5 rounded-[5px] transition-colors"
                    title="Volver a mis diseños"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mis Diseños</span>
                  </button>

                  <div className="h-4 w-px bg-[#3F3F46] hidden sm:block" />

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-[#2563EB] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                      PS
                    </span>
                    <input
                      type="text"
                      value={designTitle}
                      onChange={(e) => {
                        setDesignTitle(e.target.value);
                        setIsDirty(true);
                      }}
                      className="bg-transparent text-xs font-bold text-white border-b border-transparent hover:border-[#3F3F46] focus:border-[#2563EB] focus:outline-none px-1 py-0.5 max-w-[160px] sm:max-w-[240px] truncate"
                    />
                    <span className="text-[10px] text-[#71717A] bg-[#27272A] px-2 py-0.5 rounded font-mono hidden md:inline">
                      300 DPI
                    </span>
                  </div>
                </div>

                {/* Centro: Zoom + Deshacer / Rehacer */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => showToast("Deshecho")}
                    className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] rounded transition-colors"
                    title="Deshacer (Ctrl+Z)"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast("Rehecho")}
                    className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] rounded transition-colors"
                    title="Rehacer (Ctrl+Y)"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-px bg-[#3F3F46] mx-1" />

                  <div className="flex items-center gap-1 bg-[#27272A] px-2 py-1 rounded-[5px] text-xs">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(z - 10, 50))}
                      className="p-0.5 text-[#A1A1AA] hover:text-white"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[11px] w-10 text-center font-medium">
                      {zoomLevel}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(z + 10, 200))}
                      className="p-0.5 text-[#A1A1AA] hover:text-white"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="text-[10.5px] text-[#A1A1AA] hover:text-white bg-[#27272A] px-2 py-1 rounded transition-colors"
                  >
                    Ajustar
                  </button>
                </div>

                {/* Derecha: Guardar + Vincular a Producto + Exportar */}
                <div className="flex items-center gap-2">
                  {/* Botón Vincular a Producto */}
                  <button
                    type="button"
                    onClick={() => setIsLinkProductModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] px-3 py-1.5 rounded-[5px] shadow-sm transition-all"
                    title="Aplicar este diseño a una prenda o producto"
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      Vincular a Producto
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDesign}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#E4E4E7] bg-[#27272A] hover:bg-[#3F3F46] px-2.5 py-1.5 rounded-[5px] transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Guardar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExport("PNG Transparente")}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-1.5 rounded-[5px] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>

              {/* ── CUERPO PRINCIPAL DEL EDITOR (3 COLUMNAS) ───────────────── */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* ── COLUMNA 1: BARRA DE HERRAMIENTAS VERTICAL ────────────── */}
                <div className="w-12 bg-[#202024] border-r border-[#2E2E33] flex flex-col items-center py-2.5 justify-between shrink-0">
                  <div className="flex flex-col items-center gap-1 w-full px-1">
                    {[
                      {
                        id: "move",
                        icon: Move,
                        label: "Mover / Seleccionar (V)",
                      },
                      {
                        id: "select",
                        icon: MousePointer,
                        label: "Varita Mágica (W)",
                      },
                      { id: "crop", icon: Crop, label: "Recortar Lienzo (C)" },
                      {
                        id: "brush",
                        icon: Palette,
                        label: "Pincel / Dibujar (B)",
                      },
                      {
                        id: "text",
                        icon: Type,
                        label: "Texto / Tipografía (T)",
                      },
                      {
                        id: "shapes",
                        icon: Square,
                        label: "Formas / Vectores (U)",
                      },
                      { id: "picker", icon: Pipette, label: "Cuentagotas (I)" },
                      { id: "hand", icon: Hand, label: "Mano / Encuadre (H)" },
                    ].map((tool) => {
                      const Icon = tool.icon;
                      const isActive = activeTool === tool.id;
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => setActiveTool(tool.id)}
                          title={tool.label}
                          className={cn(
                            "w-9 h-9 rounded-[6px] flex items-center justify-center transition-all",
                            isActive
                              ? "bg-[#2563EB] text-white shadow-xs"
                              : "text-[#A1A1AA] hover:text-white hover:bg-[#27272A]",
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector de color de primer plano / fondo */}
                  <div className="flex flex-col items-center gap-1.5 pb-2">
                    <div className="relative w-7 h-7">
                      <div
                        className="w-5 h-5 rounded-[3px] bg-red-600 border border-white/80 absolute top-0 left-0 shadow-xs cursor-pointer"
                        title="Color Frontal"
                      />
                      <div
                        className="w-5 h-5 rounded-[3px] bg-white border border-black/80 absolute bottom-0 right-0 shadow-xs cursor-pointer"
                        title="Color de Fondo"
                      />
                    </div>
                  </div>
                </div>

                {/* ── PANEL DOCKED IZQUIERDO: TAMAÑO Y POSICIÓN (INSPECTOR) ──── */}
                <div className="hidden lg:flex w-64 bg-[#202024]/95 border-r border-[#2E2E33] flex-col p-3.5 shrink-0 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#2E2E33] pb-2.5 mb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Tamaño y posición</span>
                    </span>
                    <span className="text-[10px] font-semibold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded">
                      Activo
                    </span>
                  </div>

                  {/* Botón Acción Move */}
                  <div className="mb-4">
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white text-xs font-bold py-2 rounded-[6px] shadow-sm hover:bg-[#1D4ED8] transition-colors"
                    >
                      <Move className="w-3.5 h-3.5" />
                      <span>Mover elemento</span>
                    </button>
                  </div>

                  {/* Alineación */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-medium text-[#A1A1AA]">
                      Alinear al lienzo
                    </span>
                    <div className="grid grid-cols-6 gap-1 bg-[#27272A] p-1 rounded-[6px]">
                      <button
                        type="button"
                        onClick={() => {
                          setElementPos((p) => ({ ...p, x: -100 }));
                          showToast("Alineado a la izquierda");
                        }}
                        className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46] rounded flex justify-center"
                        title="Alinear Izquierda"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setElementPos((p) => ({ ...p, x: 0 }));
                          showToast("Centrado horizontal");
                        }}
                        className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46] rounded flex justify-center"
                        title="Centrar Horizontal"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setElementPos((p) => ({ ...p, x: 100 }));
                          showToast("Alineado a la derecha");
                        }}
                        className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46] rounded flex justify-center"
                        title="Alinear Derecha"
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setElementPos((p) => ({ ...p, y: -80 }));
                          showToast("Alineado arriba");
                        }}
                        className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46] rounded flex justify-center"
                        title="Alinear Arriba"
                      >
                        <AlignJustify className="w-3.5 h-3.5 rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setElementPos({ x: 0, y: 0 });
                          showToast("Centrado total");
                        }}
                        className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46] rounded flex justify-center"
                        title="Centrar Todo"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setElementPos((p) => ({ ...p, y: 80 }));
                          showToast("Alineado abajo");
                        }}
                        className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46] rounded flex justify-center"
                        title="Alinear Abajo"
                      >
                        <AlignJustify className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                    </div>
                  </div>

                  {/* Dimensiones y Coordenadas */}
                  <div className="space-y-3 mb-4">
                    <span className="text-[11px] font-medium text-[#A1A1AA]">
                      Dimensiones y Posición
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#27272A] p-2 rounded-[5px]">
                        <span className="text-[10px] text-[#71717A] block font-mono">
                          X (px)
                        </span>
                        <input
                          type="number"
                          value={elementPos.x}
                          onChange={(e) =>
                            setElementPos((p) => ({
                              ...p,
                              x: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-transparent text-xs font-bold text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="bg-[#27272A] p-2 rounded-[5px]">
                        <span className="text-[10px] text-[#71717A] block font-mono">
                          Y (px)
                        </span>
                        <input
                          type="number"
                          value={elementPos.y}
                          onChange={(e) =>
                            setElementPos((p) => ({
                              ...p,
                              y: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-transparent text-xs font-bold text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="bg-[#27272A] p-2 rounded-[5px]">
                        <span className="text-[10px] text-[#71717A] block font-mono">
                          Ancho W
                        </span>
                        <input
                          type="number"
                          value={elementSize.w}
                          onChange={(e) =>
                            setElementSize((s) => ({
                              ...s,
                              w: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-transparent text-xs font-bold text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="bg-[#27272A] p-2 rounded-[5px]">
                        <span className="text-[10px] text-[#71717A] block font-mono">
                          Alto H
                        </span>
                        <input
                          type="number"
                          value={elementSize.h}
                          onChange={(e) =>
                            setElementSize((s) => ({
                              ...s,
                              h: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-transparent text-xs font-bold text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transformaciones Rápidas */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-medium text-[#A1A1AA]">
                      Transformar
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setElementRotation((r) => (r + 90) % 360);
                          showToast("Rotado 90°");
                        }}
                        className="flex flex-col items-center justify-center p-2 bg-[#27272A] hover:bg-[#3F3F46] rounded-[5px] text-[10px] text-[#D4D4D8] transition-colors"
                      >
                        <RotateCw className="w-3.5 h-3.5 mb-1 text-[#60A5FA]" />
                        <span>Girar 90°</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast("Volteado horizontal")}
                        className="flex flex-col items-center justify-center p-2 bg-[#27272A] hover:bg-[#3F3F46] rounded-[5px] text-[10px] text-[#D4D4D8] transition-colors"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5 mb-1 text-[#60A5FA]" />
                        <span>Voltear H</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast("Volteado vertical")}
                        className="flex flex-col items-center justify-center p-2 bg-[#27272A] hover:bg-[#3F3F46] rounded-[5px] text-[10px] text-[#D4D4D8] transition-colors"
                      >
                        <FlipVertical className="w-3.5 h-3.5 mb-1 text-[#60A5FA]" />
                        <span>Voltear V</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── COLUMNA 2: LIENZO CENTRAL (CANVAS WORKSPACE) ─────────── */}
                <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#121214] p-4 sm:p-8">
                  {/* Reglas / Cuadrícula de fondo sutil */}
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(#ffffff 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />

                  {/* Contenedor del Lienzo con Escala de Zoom */}
                  <div
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                    className="transition-transform duration-150 relative bg-white shadow-2xl rounded-[4px] w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] flex items-center justify-center overflow-hidden"
                  >
                    {/* Capa de fondo blanco de estampado */}
                    <div className="absolute inset-0 bg-white" />

                    {/* Elemento Interactivo del Diseño (con bounding box idéntico a Photoshop) */}
                    <div
                      style={{
                        transform: `translate(${elementPos.x}px, ${elementPos.y}px) rotate(${elementRotation}deg) scale(${elementScale})`,
                        opacity: layerOpacity / 100,
                      }}
                      className="relative cursor-move transition-transform duration-75 group/box"
                    >
                      {/* Imagen / Arte del Diseño */}
                      <div className="relative">
                        {activeDesign ? (
                          <div className="text-center">
                            <img
                              src={activeDesign?.previewUrl ?? ""}
                              alt={activeDesign?.title ?? "Diseño activo"}
                              className="w-48 h-48 sm:w-64 sm:h-64 object-contain pointer-events-none drop-shadow-md"
                            />
                            <p className="text-black font-black text-xl sm:text-2xl tracking-[0.2em] uppercase mt-2">
                              JUMPMAN
                            </p>
                          </div>
                        ) : (
                          <div className="w-48 h-48 sm:w-64 sm:h-64 bg-[#F1F5F9] rounded flex items-center justify-center text-[#94A3B8]">
                            <Palette className="w-12 h-12" />
                          </div>
                        )}
                      </div>

                      {/* Bounding Box / Manijas de Selección Activas (Estilo Photoshop Referencia 2) */}
                      <div className="absolute -inset-2 border-2 border-[#2563EB] pointer-events-none">
                        {/* 4 esquinas */}
                        <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#2563EB] rounded-full pointer-events-auto cursor-nwse-resize" />
                        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#2563EB] rounded-full pointer-events-auto cursor-nesw-resize" />
                        <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#2563EB] rounded-full pointer-events-auto cursor-nesw-resize" />
                        <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#2563EB] rounded-full pointer-events-auto cursor-nwse-resize" />

                        {/* 4 centros */}
                        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#2563EB] rounded-full pointer-events-auto cursor-ns-resize" />
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#2563EB] rounded-full pointer-events-auto cursor-ns-resize" />
                        <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#2563EB] rounded-full pointer-events-auto cursor-ew-resize" />
                        <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#2563EB] rounded-full pointer-events-auto cursor-ew-resize" />
                      </div>
                    </div>
                  </div>

                  {/* ── BARRA FLOTANTE INFERIOR: ACCIONES CONTEXTUALES ─────── */}
                  {/* Idéntico a la píldora inferior flotante de Photoshop Web en Ref 2 */}
                  <div className="absolute bottom-5 z-20 flex items-center gap-2 bg-[#202024]/90 backdrop-blur-md border border-[#3F3F46] rounded-full px-3 py-1.5 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => showToast("Analizando sujeto con IA...")}
                      className="flex items-center gap-1.5 text-xs text-[#E4E4E7] hover:text-white hover:bg-[#27272A] px-3 py-1 rounded-full transition-colors font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
                      <span>Mejora IA</span>
                    </button>
                    <div className="h-3 w-px bg-[#3F3F46]" />
                    <button
                      type="button"
                      onClick={() => showToast("Sujeto principal seleccionado")}
                      className="flex items-center gap-1.5 text-xs text-[#E4E4E7] hover:text-white hover:bg-[#27272A] px-3 py-1 rounded-full transition-colors font-medium"
                    >
                      <MousePointer className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>Seleccionar sujeto</span>
                    </button>
                    <div className="h-3 w-px bg-[#3F3F46]" />
                    <button
                      type="button"
                      onClick={() =>
                        showToast("Fondo eliminado con transparencia alfa")
                      }
                      className="flex items-center gap-1.5 text-xs text-[#E4E4E7] hover:text-white hover:bg-[#27272A] px-3 py-1 rounded-full transition-colors font-medium"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>Quitar fondo</span>
                    </button>
                    <div className="h-3 w-px bg-[#3F3F46]" />
                    <button
                      type="button"
                      onClick={() => {
                        setElementPos({ x: 0, y: 0 });
                        setElementRotation(0);
                        showToast("Lienzo reajustado");
                      }}
                      className="p-1 text-[#A1A1AA] hover:text-white rounded-full"
                      title="Resetear posición"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── COLUMNA 3: PANEL DERECHO DE CAPAS (LAYERS) ────────────── */}
                <div className="w-64 sm:w-72 bg-[#202024] border-l border-[#2E2E33] flex flex-col shrink-0">
                  {/* Encabezado del Panel de Capas */}
                  <div className="p-3 border-b border-[#2E2E33] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#2563EB]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Capas
                      </span>
                      <span className="text-[10px] text-[#71717A] bg-[#27272A] px-1.5 py-0.5 rounded font-mono">
                        {layers.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={addEmptyLayer}
                        className="p-1 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] rounded transition-colors"
                        title="Nueva capa"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteLayer(selectedLayerId)}
                        className="p-1 text-[#A1A1AA] hover:text-red-400 hover:bg-[#27272A] rounded transition-colors"
                        title="Eliminar capa seleccionada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Opciones de Fusión y Opacidad de Capa */}
                  <div className="p-3 border-b border-[#2E2E33] space-y-2.5 bg-[#1B1B1E]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#A1A1AA] font-medium">
                        Modo fusión:
                      </span>
                      <select
                        value={blendMode}
                        onChange={(e) => setBlendMode(e.target.value)}
                        className="bg-[#27272A] text-xs text-white border border-[#3F3F46] rounded px-2 py-1 focus:outline-none focus:border-[#2563EB]"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Multiplicar">Multiplicar</option>
                        <option value="Trama">Trama</option>
                        <option value="Superponer">Superponer</option>
                        <option value="Luz Suave">Luz Suave</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#A1A1AA] font-medium">
                        Opacidad:
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={layerOpacity}
                          onChange={(e) =>
                            setLayerOpacity(Number(e.target.value))
                          }
                          className="w-20 h-1 bg-[#3F3F46] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                        />
                        <span className="text-[11px] font-mono text-white w-8 text-right">
                          {layerOpacity}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Capas */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {layers.map((layer) => {
                      const isSelected = selectedLayerId === layer.id;
                      return (
                        <div
                          key={layer.id}
                          onClick={() => setSelectedLayerId(layer.id)}
                          className={cn(
                            "group flex items-center gap-2 px-2.5 py-2 rounded-[6px] cursor-pointer transition-all border",
                            isSelected
                              ? "bg-[#2563EB]/20 border-[#2563EB] text-white"
                              : "bg-[#27272A]/70 border-transparent hover:bg-[#27272A] text-[#D4D4D8]",
                          )}
                        >
                          {/* Ojo (Visibilidad) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLayerVisibility(layer.id);
                            }}
                            className="p-1 text-[#A1A1AA] hover:text-white"
                            title={
                              layer.visible ? "Ocultar capa" : "Mostrar capa"
                            }
                          >
                            {layer.visible ? (
                              <Eye className="w-3.5 h-3.5 text-[#60A5FA]" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-[#71717A]" />
                            )}
                          </button>

                          {/* Miniatura de la capa */}
                          <div className="w-8 h-8 rounded bg-black/40 border border-[#3F3F46] flex items-center justify-center shrink-0 overflow-hidden">
                            {layer.preview ? (
                              <img
                                src={layer.preview}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : layer.type === "text" ? (
                              <Type className="w-4 h-4 text-[#F59E0B]" />
                            ) : layer.type === "shape" ? (
                              <Square className="w-4 h-4 text-[#10B981]" />
                            ) : (
                              <div className="w-full h-full bg-white" />
                            )}
                          </div>

                          {/* Nombre de la Capa */}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">
                              {layer.name}
                            </p>
                            <span className="text-[10px] text-[#71717A] capitalize">
                              {layer.type}
                            </span>
                          </div>

                          {/* Candado (Bloqueo) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLayerLock(layer.id);
                            }}
                            className="p-1 text-[#71717A] hover:text-white"
                            title={
                              layer.locked
                                ? "Desbloquear capa"
                                : "Bloquear capa"
                            }
                          >
                            {layer.locked ? (
                              <Lock className="w-3 h-3 text-[#F59E0B]" />
                            ) : (
                              <Unlock className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botón inferior: Crear Producto con este diseño */}
                  <div className="p-3 border-t border-[#2E2E33] bg-[#1B1B1E]">
                    <button
                      type="button"
                      onClick={() => setIsLinkProductModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold py-2.5 rounded-[6px] shadow-sm transition-all"
                    >
                      <Shirt className="w-4 h-4" />
                      <span>Publicar en Producto</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===================================================================
          MODAL: VINCULAR DISEÑO A PRODUCTO
          Conecta el Diseñador con el catálogo de productos de la Tienda
          =================================================================== */}
      {isLinkProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-[#2563EB]" />
                  <span>Vincular diseño a un producto</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Selecciona la prenda o artículo donde deseas estampar "
                  {designTitle}".
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkProductModalOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-[#111827] hover:bg-[#F1F5F9] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grilla de productos mockups */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mockLinkableProducts.map((p) => {
                const isSelected = selectedProductToLink === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProductToLink(p.id)}
                    className={cn(
                      "cursor-pointer rounded-xl border-2 p-3 transition-all flex flex-col items-center text-center",
                      isSelected
                        ? "border-[#2563EB] bg-[#EFF6FF] shadow-xs"
                        : "border-[#E2E8F0] hover:border-[#CBD5E1] bg-white",
                    )}
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden mb-2 bg-[#F8FAFC]">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-bold text-[#111827] line-clamp-1">
                      {p.name}
                    </p>
                    <span className="text-[11px] font-semibold text-[#2563EB] mt-1">
                      {p.price}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
              <span className="text-xs text-[#64748B]">
                {selectedProductToLink
                  ? "Producto seleccionado listo para publicar"
                  : "Selecciona una opción para continuar"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLinkProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-[6px] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!selectedProductToLink}
                  onClick={() => {
                    setIsLinkProductModalOpen(false);
                    showToast(
                      `Diseño "${designTitle}" vinculado con éxito al catálogo de tu tienda`,
                    );
                  }}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-[6px] transition-all",
                    selectedProductToLink
                      ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm"
                      : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed",
                  )}
                >
                  Confirmar y Vincular
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Crear Nuevo Lienzo ───────────────────────────────────────── */}
      <NewCanvasModal
        isOpen={isNewCanvasModalOpen}
        onClose={() => setIsNewCanvasModalOpen(false)}
        onApply={handleNewCanvasApply}
      />
    </div>
  );
}
