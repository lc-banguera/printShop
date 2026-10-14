import { useState, useMemo, useRef, type DragEvent } from "react";
import {
  Shirt,
  Sparkles,
  Image as ImageIcon,
  Bot,
  Layers,
  Search,
  Lock,
  Upload,
  ImagePlus,
  Eye,
  EyeOff,
  Unlock,
  ChevronUp,
  ChevronDown,
  Trash2,
  Send,
  Sparkle,
} from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";
import { getDesignResources, registerUploadedDesign } from "../services";
import {
  DESIGN_DRAG_MIME_TYPE,
  type DesignDragPayload,
  type DesignResource,
} from "@/types/design-resource";
import { LazyGalleryImage } from "./lazy-gallery-image";
import { useViewerStore } from "@/store/viewer-store";
import { useCanvasStore } from "@/store/canvas-store";
import type { CanvasElement } from "@/types/canvas";

interface ExtendedDesignResource extends DesignResource {
  ownership: "own" | "purchased" | "locked";
}

function createDesignDragPayload(resource: DesignResource): DesignDragPayload {
  return {
    type: "design-resource",
    resource,
  };
}

export function LeftSidebar() {
  const [activeModule, setActiveModule] = useState<
    "producto" | "disenos" | "imagenes" | "ia" | "capas"
  >("disenos");

  // Stores
  const activeProduct = useViewerStore((state) => state.activeProduct);
  const currentGarmentColor = useViewerStore(
    (state) => state.currentGarmentColor,
  );
  const activeZoneId = useViewerStore((state) => state.activeZoneId);
  const selectGarmentColor = useViewerStore(
    (state) => state.selectGarmentColor,
  );
  const garmentColors = useViewerStore((state) => state.garmentColors);
  const setMaterialBrightness = useViewerStore(
    (state) => state.setMaterialBrightness,
  );

  const elements = useCanvasStore((state) => state.elements);
  const selectedElementId = useCanvasStore((state) => state.selectedElementId);
  const selectElement = useCanvasStore((state) => state.selectElement);
  const addElement = useCanvasStore((state) => state.addElement);
  const removeElement = useCanvasStore((state) => state.removeElement);
  const toggleElementVisibility = useCanvasStore(
    (state) => state.toggleElementVisibility,
  );
  const toggleElementLock = useCanvasStore((state) => state.toggleElementLock);
  const reorderElement = useCanvasStore((state) => state.reorderElement);
  const updateElement = useCanvasStore((state) => state.updateElement);

  // Designs Library states
  const [designFilter, setDesignFilter] = useState<"all" | "mine">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Uploaded Images states
  const [uploadedImages, setUploadedImages] = useState<DesignResource[]>([]);
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Assistant states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessages, setAiMessages] = useState<
    Array<{ sender: "user" | "assistant"; text: string }>
  >([
    {
      sender: "assistant",
      text: "¡Hola! Soy tu asistente de diseño. Pídeme cambiar el color de la prenda, ajustar el tamaño o posicionar tu diseño.",
    },
  ]);

  // Design Catalog resources with realistic ownership
  const rawResources = useMemo(() => getDesignResources(), []);

  const catalogDesigns = useMemo<ExtendedDesignResource[]>(() => {
    return rawResources.map((res, index) => {
      // Deterministic realistic ownership based on index
      // own = propios (sin candado), purchased = comprados (sin candado), locked = ajenos no comprados (con candado)
      let ownership: "own" | "purchased" | "locked" = "own";
      if (index % 3 === 1) {
        ownership = "purchased";
      } else if (index % 3 === 2) {
        ownership = "locked";
      }
      return {
        ...res,
        ownership,
      };
    });
  }, [rawResources]);

  // Filtered designs based on All vs Mine & search query
  const filteredDesigns = useMemo(() => {
    return catalogDesigns.filter((d) => {
      if (designFilter === "mine" && d.ownership === "locked") {
        return false;
      }
      if (searchQuery.trim()) {
        return d.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [catalogDesigns, designFilter, searchQuery]);

  // Drag handlers
  const handleDesignDragStart = (
    event: DragEvent<HTMLButtonElement>,
    resource: DesignResource,
    isLocked: boolean,
  ) => {
    if (isLocked) {
      event.preventDefault();
      return;
    }
    const payload = createDesignDragPayload(resource);
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(DESIGN_DRAG_MIME_TYPE, JSON.stringify(payload));
    event.dataTransfer.setData("text/plain", resource.id);
  };

  // Click to add design or image
  const handleAddArtwork = (resource: DesignResource, isLocked = false) => {
    if (isLocked) return;
    const printableArea = activeProduct.printableAreas[activeZoneId] || {
      x: 100,
      y: 100,
      width: 300,
      height: 400,
    };
    const size = 180;
    const newElement: CanvasElement = {
      id: `design-${resource.id}-${Date.now()}`,
      type: "image",
      layer: "user",
      zoneId: activeZoneId,
      name: resource.name,
      image: resource.image,
      originalImageSrc: resource.image,
      x: printableArea.x + (printableArea.width - size) / 2,
      y: printableArea.y + (printableArea.height - size) / 2,
      width: size,
      height: size,
      rotation: 0,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
    };
    addElement(newElement);
    selectElement(newElement.id);
  };

  // Image Upload handler
  const handleUploadFile = (file?: File) => {
    setUploadError("");
    if (!file) return;
    const supportedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
    ];
    const supportedExt = /\.(png|jpe?g|webp|svg)$/i;
    if (!supportedExt.test(file.name) && !supportedTypes.includes(file.type)) {
      setUploadError("Formatos admitidos: PNG, JPG, SVG y WebP.");
      return;
    }
    try {
      const resource = registerUploadedDesign(file);
      setUploadedImages((prev) => [resource, ...prev]);
      handleAddArtwork(resource, false);
    } catch {
      setUploadError("Error al procesar la imagen subida.");
    }
  };

  // AI Command Execution (Real, not simulated)
  const handleSendAiPrompt = () => {
    const text = aiPrompt.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    const newMessages = [...aiMessages, { sender: "user" as const, text }];
    let responseText = "He procesado tu solicitud sobre la prenda.";

    // Color commands
    if (lower.includes("negro") || lower.includes("black")) {
      const idx = garmentColors.findIndex(
        (c) => c.toLowerCase() === "#111111" || c.toLowerCase() === "#000000",
      );
      if (idx !== -1) selectGarmentColor(idx);
      responseText = "He cambiado el color de la prenda a Negro.";
    } else if (lower.includes("blanco") || lower.includes("white")) {
      const idx = garmentColors.findIndex((c) => c.toLowerCase() === "#ffffff");
      if (idx !== -1) selectGarmentColor(idx);
      responseText = "He cambiado el color de la prenda a Blanco.";
    } else if (lower.includes("rojo") || lower.includes("red")) {
      const idx = garmentColors.findIndex((c) => c.toLowerCase() === "#d94a3d");
      if (idx !== -1) selectGarmentColor(idx);
      responseText = "He cambiado el color de la prenda a Rojo.";
    } else if (lower.includes("azul") || lower.includes("blue")) {
      const idx = garmentColors.findIndex((c) => c.toLowerCase() === "#3f5bd2");
      if (idx !== -1) selectGarmentColor(idx);
      responseText = "He cambiado el color de la prenda a Azul.";
    } else if (
      lower.includes("brillo") ||
      lower.includes("intensidad") ||
      lower.includes("estampado")
    ) {
      if (lower.includes("más") || lower.includes("aument")) {
        setMaterialBrightness(1.2);
        responseText = "Aumenté la intensidad del material de la prenda.";
      } else {
        setMaterialBrightness(0.8);
        responseText = "Reduje la intensidad del material de la prenda.";
      }
    } else if (lower.includes("arriba") && selectedElementId) {
      const el = elements.find((e) => e.id === selectedElementId);
      if (el) {
        updateElement(el.id, { y: Math.max(50, el.y - 30) });
        responseText = "Moví el diseño seleccionado más arriba.";
      }
    } else if (lower.includes("abajo") && selectedElementId) {
      const el = elements.find((e) => e.id === selectedElementId);
      if (el) {
        updateElement(el.id, { y: el.y + 30 });
        responseText = "Moví el diseño seleccionado más abajo.";
      }
    } else if (
      (lower.includes("pequeño") || lower.includes("reduc")) &&
      selectedElementId
    ) {
      const el = elements.find((e) => e.id === selectedElementId);
      if (el) {
        updateElement(el.id, {
          width: Math.max(60, el.width * 0.85),
          height: Math.max(60, el.height * 0.85),
        });
        responseText = "Reduje el tamaño del diseño seleccionado.";
      }
    } else if (
      (lower.includes("grande") || lower.includes("aument")) &&
      selectedElementId
    ) {
      const el = elements.find((e) => e.id === selectedElementId);
      if (el) {
        updateElement(el.id, {
          width: Math.min(320, el.width * 1.15),
          height: Math.min(320, el.height * 1.15),
        });
        responseText = "Aumenté el tamaño del diseño seleccionado.";
      }
    } else {
      responseText = `Entendido. Puedes pedirme cambiar el color a negro/blanco/rojo/azul, mover o redimensionar el diseño activo.`;
    }

    newMessages.push({ sender: "assistant", text: responseText });
    setAiMessages(newMessages);
    setAiPrompt("");
  };

  const navItems = [
    { id: "producto" as const, name: "Producto", icon: Shirt },
    { id: "disenos" as const, name: "Diseños", icon: Sparkles },
    { id: "imagenes" as const, name: "Imágenes", icon: ImageIcon },
    { id: "ia" as const, name: "IA", icon: Bot },
    { id: "capas" as const, name: "Capas", icon: Layers },
  ];

  return (
    <TooltipProvider>
      <aside className="flex h-full border-r border-[#e8e8f0] bg-white select-none">
        {/* ── 1. Left Vertical Toolbar (64px) ── */}
        <div className="flex w-[64px] shrink-0 flex-col items-center border-r border-[#e8e8f0] bg-white py-3">
          <nav className="flex w-full flex-col items-center gap-1.5 px-1.5">
            {navItems.map((item) => {
              const isActive = activeModule === item.id;
              const Icon = item.icon;

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setActiveModule(item.id)}
                      className="group flex w-full flex-col items-center gap-1 py-1 outline-none cursor-pointer"
                    >
                      {/* Icon container — hover and active state exclusively here.
                           Uses rounded-xl by design: approved exception for sidebar nav pattern.
                           The 5px rule applies to rectangular UI components, not nav icon wells. */}
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? "bg-[#5046e5] text-white shadow-2xs"
                            : "text-[#5e5d72] group-hover:bg-[#f5f4fb] group-hover:text-[#5046e5]"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] stroke-[1.8]" />
                      </span>
                      {/* Label — independent, strictly without background */}
                      <span
                        className={`text-[9px] font-medium leading-none transition-colors ${
                          isActive
                            ? "font-semibold text-[#5046e5]"
                            : "text-[#8E96A6] group-hover:text-[#5046e5]"
                        }`}
                      >
                        {item.name}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-medium">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </div>

        {/* ── 2. Contextual Panel (300px) ── */}
        <div className="flex w-[300px] shrink-0 flex-col overflow-hidden bg-[#fafafc]">
          {/* ── TOOL: PRODUCTO ── */}
          {activeModule === "producto" && (
            <div className="flex flex-col h-full">
              <div className="border-b border-[#e8e8f0] p-3.5 bg-white">
                <h3 className="text-xs font-bold text-[#171421]">
                  Contexto del producto
                </h3>
                <p className="text-[11px] text-[#8E96A6] mt-0.5">
                  Información del artículo actual
                </p>
              </div>
              <ScrollArea className="flex-1 p-3.5 space-y-4">
                <div className="rounded-[5px] border border-[#e4e4ee] bg-white p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeProduct.thumbnail}
                      alt={activeProduct.name}
                      className="h-14 w-14 object-contain rounded-[5px] border border-[#e4e4ee] bg-[#fafafc] p-1"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#171421]">
                        {activeProduct.name}
                      </h4>
                      <p className="text-[10px] text-[#8E96A6] mt-0.5">
                        Categoría: {activeProduct.category}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className="h-3 w-3 rounded-full border border-black/10"
                          style={{ backgroundColor: currentGarmentColor }}
                        />
                        <span className="text-[10px] font-medium text-[#5e5d72]">
                          Color actual
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-[#eeeef5] pt-2 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-[#8E96A6]">
                      <span>Composición</span>
                      <span className="font-medium text-[#171421]">
                        100% Algodón Peinado
                      </span>
                    </div>
                    <div className="flex justify-between text-[#8E96A6]">
                      <span>Gramaje</span>
                      <span className="font-medium text-[#171421]">
                        180 GSM
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[5px] border border-[#e4e4ee] bg-white p-3 space-y-2">
                  <h4 className="text-[11px] font-semibold text-[#171421]">
                    Consejo de personalización
                  </h4>
                  <p className="text-[11px] leading-relaxed text-[#5e5d72]">
                    Puedes rotar libremente el modelo 3D usando el mouse o
                    arrastrar diseños directamente sobre el producto.
                  </p>
                </div>
              </ScrollArea>
            </div>
          )}

          {/* ── TOOL: DISEÑOS ── */}
          {activeModule === "disenos" && (
            <div className="flex flex-col h-full">
              {/* Header with Search and Filter */}
              <div className="border-b border-[#e8e8f0] p-3 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#171421]">
                    Biblioteca de diseños
                  </h3>
                  <span className="text-[10px] font-medium text-[#8E96A6]">
                    {filteredDesigns.length} disponibles
                  </span>
                </div>

                {/* Compact 5px search */}
                <div className="relative w-full">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#908fa3]" />
                  <input
                    type="text"
                    placeholder="Buscar diseños..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-7 w-full rounded-[5px] border border-[#e4e4ee] bg-white pl-8 pr-2.5 text-[11px] text-[#171421] placeholder:text-[#908fa3] shadow-2xs transition-all focus:border-[#5046e5]/40 focus:outline-none"
                  />
                </div>

                {/* Filter Todos / Mis Diseños */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDesignFilter("all")}
                    className={`flex-1 rounded-[5px] py-1 text-[10px] font-semibold transition-all ${
                      designFilter === "all"
                        ? "bg-[#5046e5] text-white shadow-2xs"
                        : "bg-[#eeeef5] text-[#5e5d72] hover:bg-[#e4e4ee]"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesignFilter("mine")}
                    className={`flex-1 rounded-[5px] py-1 text-[10px] font-semibold transition-all ${
                      designFilter === "mine"
                        ? "bg-[#5046e5] text-white shadow-2xs"
                        : "bg-[#eeeef5] text-[#5e5d72] hover:bg-[#e4e4ee]"
                    }`}
                  >
                    Mis Diseños
                  </button>
                </div>
              </div>

              {/* Grid of designs — compact tiles: more designs visible, less space wasted */}
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-2 gap-1.5 p-2.5">
                  {filteredDesigns.map((resource) => {
                    const isLocked = resource.ownership === "locked";

                    return (
                      <Tooltip key={resource.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleAddArtwork(resource, isLocked)}
                            draggable={!isLocked}
                            onDragStart={(e) =>
                              handleDesignDragStart(e, resource, isLocked)
                            }
                            className={`group relative flex h-[72px] w-full flex-col items-center justify-center overflow-hidden rounded-[5px] border bg-white p-1 shadow-2xs transition-all duration-150 ${
                              isLocked
                                ? "border-[#e5e5ee] opacity-80 cursor-not-allowed hover:border-amber-300"
                                : "border-[#e5e5ee] hover:border-[#5046e5]/50 hover:shadow-xs active:cursor-grabbing cursor-grab"
                            }`}
                          >
                            <LazyGalleryImage
                              src={resource.image}
                              alt={resource.name}
                              className={`h-full w-full object-contain transition-transform duration-200 ${
                                isLocked
                                  ? "grayscale-[30%]"
                                  : "group-hover:scale-[1.03]"
                              }`}
                              draggable={false}
                            />
                            {/* Discrete Lock Icon in corner for locked designs */}
                            {isLocked && (
                              <div
                                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-[3px] bg-black/60 text-white shadow-xs backdrop-blur-xs"
                                title="Diseño ajeno no comprado (licencia bloqueada)"
                              >
                                <Lock className="h-2.5 w-2.5" />
                              </div>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="text-xs font-medium"
                        >
                          <div className="flex flex-col">
                            <span>{resource.name}</span>
                            <span className="text-[10px] text-text-muted">
                              {isLocked
                                ? "Ajeno (Requiere compra)"
                                : resource.ownership === "own"
                                  ? "Diseño propio"
                                  : "Comprado"}
                            </span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>

                {filteredDesigns.length === 0 && (
                  <div className="px-3 py-10 text-center text-xs font-medium text-[#908fa3]">
                    No se encontraron diseños publicados.
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* ── TOOL: IMÁGENES (Upload own images) ── */}
          {activeModule === "imagenes" && (
            <div className="flex flex-col h-full">
              <div className="border-b border-[#e8e8f0] p-3 bg-white">
                <h3 className="text-xs font-bold text-[#171421]">
                  Imágenes propias
                </h3>
                <p className="text-[11px] text-[#8E96A6] mt-0.5">
                  Sube tus fotos o gráficos para la prenda
                </p>
              </div>

              <div className="p-3 space-y-3 flex-1 flex flex-col">
                {/* Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingUpload(true);
                  }}
                  onDragLeave={() => setIsDraggingUpload(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingUpload(false);
                    const file = e.dataTransfer.files?.[0];
                    handleUploadFile(file);
                  }}
                  className={`flex flex-col items-center justify-center rounded-[5px] border border-dashed p-4 text-center transition-colors ${
                    isDraggingUpload
                      ? "border-[#5046e5] bg-[#eeebff]"
                      : "border-[#d5d5e2] bg-white"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-[#f5f4fb] text-[#5046e5]">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-[#171421]">
                    Arrastra tu imagen aquí
                  </h4>
                  <p className="text-[10px] text-[#8E96A6] mt-1">
                    PNG, JPG, SVG o WebP
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      handleUploadFile(e.target.files?.[0]);
                      e.currentTarget.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 flex h-7 items-center gap-1.5 rounded-[5px] bg-[#5046e5] px-3 text-[11px] font-semibold text-white transition-all hover:bg-[#4338ca]"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Seleccionar archivo</span>
                  </button>
                </div>

                {uploadError && (
                  <p className="text-[10px] font-medium text-rose-500">
                    {uploadError}
                  </p>
                )}

                {/* Uploaded Gallery */}
                <div className="flex-1 flex flex-col min-h-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E96A6] mb-1.5">
                    Subidos en esta sesión ({uploadedImages.length})
                  </span>
                  <ScrollArea className="flex-1">
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedImages.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => handleAddArtwork(img, false)}
                          className="group relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-[5px] border border-[#e4e4ee] bg-white p-1 hover:border-[#5046e5] transition-all cursor-pointer"
                        >
                          <img
                            src={img.image}
                            alt={img.name}
                            className="h-full w-full object-contain"
                          />
                          <span className="absolute inset-x-1 bottom-1 truncate rounded-[3px] bg-black/70 px-1 py-0.5 text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            {img.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    {uploadedImages.length === 0 && (
                      <p className="text-center py-6 text-[11px] text-[#908fa3]">
                        Aún no has subido imágenes
                      </p>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}

          {/* ── TOOL: IA (Integrated Personalization Assistant) ── */}
          {activeModule === "ia" && (
            <div className="flex flex-col h-full">
              <div className="border-b border-[#e8e8f0] p-3 bg-white">
                <div className="flex items-center gap-1.5">
                  <Sparkle className="h-3.5 w-3.5 text-[#5046e5]" />
                  <h3 className="text-xs font-bold text-[#171421]">
                    Asistente de inteligencia artificial
                  </h3>
                </div>
                <p className="text-[10px] text-[#8E96A6] mt-0.5">
                  Controla y personaliza la prenda con instrucciones
                </p>
              </div>

              {/* Chat messages */}
              <ScrollArea className="flex-1 p-3 space-y-2.5">
                <div className="space-y-2.5">
                  {aiMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-[5px] px-2.5 py-1.5 text-[11px] leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-[#5046e5] text-white"
                            : "bg-white border border-[#e4e4ee] text-[#171421] shadow-2xs"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Suggestions chips */}
              <div className="p-2 border-t border-[#eeeef5] bg-[#fafafc] flex flex-wrap gap-1">
                {[
                  "Cambia a negro",
                  "Cambia a blanco",
                  "Más arriba",
                  "Más pequeño",
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setAiPrompt(sug);
                    }}
                    className="rounded-[5px] bg-white border border-[#e4e4ee] px-2 py-0.5 text-[9px] text-[#5e5d72] hover:border-[#5046e5] hover:text-[#5046e5] transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Prompt Input */}
              <div className="p-2.5 border-t border-[#e8e8f0] bg-white flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Ej: pon la prenda en negro..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendAiPrompt();
                  }}
                  className="h-7 flex-1 rounded-[5px] border border-[#e4e4ee] bg-white px-2.5 text-[11px] text-[#171421] placeholder:text-[#908fa3] focus:border-[#5046e5]/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendAiPrompt}
                  className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-[#5046e5] text-white hover:bg-[#4338ca] transition-colors"
                  title="Enviar instrucción"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* ── TOOL: CAPAS ── */}
          {activeModule === "capas" && (
            <div className="flex flex-col h-full">
              <div className="border-b border-[#e8e8f0] p-3 bg-white">
                <h3 className="text-xs font-bold text-[#171421]">
                  Capas de personalización
                </h3>
                <p className="text-[11px] text-[#8E96A6] mt-0.5">
                  Ordena, oculta o bloquea elementos
                </p>
              </div>

              <ScrollArea className="flex-1 p-3">
                <div className="space-y-1.5">
                  {elements.length === 0 && (
                    <div className="rounded-[5px] border border-dashed border-[#d5d5e2] bg-white p-6 text-center text-xs text-[#908fa3]">
                      Aún no hay diseños colocados en la prenda.
                    </div>
                  )}

                  {elements.map((element, index) => {
                    const isSelected = selectedElementId === element.id;

                    return (
                      <div
                        key={element.id}
                        className={`flex items-center gap-2 rounded-[5px] border p-2 transition-all ${
                          isSelected
                            ? "border-[#5046e5] bg-[#eeebff]"
                            : "border-[#e4e4ee] bg-white hover:bg-[#fcfcff]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => selectElement(element.id)}
                          className="min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <div className="truncate text-xs font-semibold text-[#171421]">
                            {element.name || "Diseño"}
                          </div>
                          <div className="text-[9px] uppercase tracking-wider text-[#8E96A6]">
                            {element.type}
                          </div>
                        </button>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => toggleElementVisibility(element.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-[3px] text-[#5e5d72] hover:bg-white hover:text-[#171421]"
                            title={
                              element.visible === false ? "Mostrar" : "Ocultar"
                            }
                          >
                            {element.visible === false ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleElementLock(element.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-[3px] text-[#5e5d72] hover:bg-white hover:text-[#171421]"
                            title={element.locked ? "Desbloquear" : "Bloquear"}
                          >
                            {element.locked ? (
                              <Lock className="h-3 w-3" />
                            ) : (
                              <Unlock className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={index === elements.length - 1}
                            onClick={() => reorderElement(element.id, "up")}
                            className="flex h-6 w-6 items-center justify-center rounded-[3px] text-[#5e5d72] hover:bg-white disabled:opacity-30"
                            title="Subir"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => reorderElement(element.id, "down")}
                            className="flex h-6 w-6 items-center justify-center rounded-[3px] text-[#5e5d72] hover:bg-white disabled:opacity-30"
                            title="Bajar"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeElement(element.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-[3px] text-rose-500 hover:bg-rose-50"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
