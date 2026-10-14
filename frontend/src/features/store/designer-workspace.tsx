import * as React from 'react';
import {
  AlignCenter, AlignHorizontalDistributeCenter, AlignLeft, AlignRight, AlignVerticalDistributeCenter, ArrowLeft, ArrowDown, ArrowUp, BringToFront, ChevronDown, ChevronUp, Circle, Contrast, Crop, Download, Eraser, Eye, EyeOff, FlipHorizontal, FlipVertical, Frame, Grid2X2, Group, Hand, History, Image as ImageIcon, ImageMinus, LayoutDashboard, Lock, Minus, MoreVertical, Move, MousePointer2, Palette, PenTool, Pipette, Plus, Redo2, RotateCw, Save, ScanLine, Shapes, SlidersHorizontal, Sparkles, Square, Star, Triangle as TriangleIcon, Type, Undo2, Ungroup, Unlock, Wand2, X, ZoomIn, ZoomOut,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { InteractiveCanvas } from './designer/InteractiveCanvas';
import { ImageTools } from './designer/ImageTools';
import { PathEditorModal } from './designer/PathEditorModal';
import { resolveDesignerToolShortcut } from './designer/keyboard-command-registry';
import { CropModal } from './designer/CropModal';
import { CanvasSizeModal } from './designer/CanvasSizeModal';
import { ImageSizeModal } from './designer/ImageSizeModal';
import {
  DesignerLayer,
  CanvasAnchor,
  AlignmentType,
  DistributionType,
  CropRect,
} from './designer/types';
import type { DocumentPath } from '@/core/design/types';

type LayerKind = 'image' | 'text' | 'shape' | 'path' | 'background';
type Panel = 'select' | 'crop' | 'draw' | 'image' | 'text' | 'shape' | 'color' | 'view' | 'arrange';
export type DesignerWorkspaceLayer = DesignerLayer;
interface FilterValues { brightness: number; contrast: number; saturation: number; grayscale: number; sepia: number; invert: number; blur: number; }
const DEFAULT_FILTERS: FilterValues = { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0, invert: 0, blur: 0 };
interface Tool { id: string; label: string; shortcut?: string; icon: React.ElementType; panel: Panel; hasPanel?: boolean; disabled?: boolean; unavailableReason?: string; }

const MENU_CONFIG = [
  { label: 'Archivo', items: ['Nuevo', 'Abrir', 'Recientes', '—', 'Guardar', 'Guardar como', 'Exportar', 'Cerrar'] },
  { label: 'Editar', items: ['Deshacer', 'Rehacer', '—', 'Cortar', 'Copiar', 'Pegar', 'Duplicar', 'Eliminar', '—', 'Seleccionar todo'] },
  { label: 'Imagen', items: ['Tamaño de imagen', 'Tamaño del lienzo', 'Recortar', 'Rotar 90° derecha', 'Rotar 90° izquierda', 'Rotar 180°', 'Voltear horizontal', 'Voltear vertical', '—', 'Ajustes'] },
  { label: 'Capa', items: ['Nueva capa', 'Duplicar capa', 'Eliminar capa', '—', 'Subir capa', 'Bajar capa', 'Traer al frente', 'Enviar al fondo', '—', 'Bloquear / Desbloquear', 'Mostrar / Ocultar'] },
  { label: 'Texto', items: ['Nueva capa de texto', 'Fuente Arial', 'Fuente Georgia', 'Fuente Verdana', 'Tamaño 24', 'Tamaño 36', 'Tamaño 48', 'Color', 'Negrita', 'Cursiva', 'Subrayado', 'Alinear izquierda', 'Alinear centro', 'Alinear derecha'] },
  { label: 'Seleccionar', items: ['Seleccionar todo', 'Deseleccionar', 'Invertir selección', '—', 'Rectangular', 'Elíptica', 'Varita mágica', 'Por color', 'Libre'] },
  { label: 'Filtro', items: ['Brillo', 'Contraste', 'Saturación', 'Escala de grises', 'Sepia', 'Invertir', 'Desenfoque'] },
  { label: 'Ver', items: ['Zoom', 'Alejar', 'Ajustar al lienzo', '—', 'Reglas', 'Guías', 'Cuadrícula', 'Área segura', 'Área imprimible', '—', 'Ajustar a cuadrícula', 'Ajustar a guías', 'Ajustar a objetos'] },
  { label: 'Ventana', items: ['Capas', 'Propiedades', 'Historial', 'Herramientas', 'Navegador'] },
  { label: 'Ayuda', items: ['Atajos de teclado', 'Ayuda', 'Centro de ayuda', 'Acerca de PrintShop Designer'] },
] as const;

const MENU_UNAVAILABLE_REASONS: Record<string, Record<string, string>> = {
  Seleccionar: {
    Rectangular: 'Las selecciones geométricas no están conectadas al modelo de selección Advanced.',
    Elíptica: 'Las selecciones geométricas no están conectadas al modelo de selección Advanced.',
    'Varita mágica': 'La selección por máscara no está integrada en Advanced.',
    'Por color': 'La selección por color no está integrada en Advanced.',
    Libre: 'La selección libre no está conectada al modelo de selección Advanced.',
  },
  Ver: {
    'Ajustar a cuadrícula': 'El ajuste a cuadrícula no está conectado a las transformaciones del canvas.',
    'Ajustar a guías': 'El ajuste a guías no está conectado a las transformaciones del canvas.',
    'Ajustar a objetos': 'El ajuste a objetos no está conectado a las transformaciones del canvas.',
  },
};

/** Centralized tool model; unavailable actions stay visible with an explicit reason. */
const TOOL_GROUPS: { label: string; tools: Tool[] }[] = [
  { label: 'Selección', tools: [{ id: 'select', label: 'Seleccionar', shortcut: 'V', icon: MousePointer2, panel: 'select' }, { id: 'move', label: 'Mover', shortcut: 'M', icon: Move, panel: 'select' }, { id: 'direct-select', label: 'Selección directa', shortcut: 'A', icon: MousePointer2, panel: 'select' }, { id: 'transform', label: 'Transformar', icon: Frame, panel: 'select', hasPanel: true }, { id: 'crop', label: 'Recortar', shortcut: 'C', icon: Crop, panel: 'crop', hasPanel: true }] },
  { label: 'Dibujo', tools: [{ id: 'brush', label: 'Pincel', shortcut: 'B', icon: Palette, panel: 'draw', disabled: true, unavailableReason: 'El trazo raster no está conectado al canvas ni al documento.' }, { id: 'pen', label: 'Pluma', shortcut: 'P', icon: PenTool, panel: 'draw' }, { id: 'eraser', label: 'Borrador', icon: Eraser, panel: 'draw', disabled: true, unavailableReason: 'El borrado directo sobre el canvas no está configurado.' }] },
  { label: 'Selección avanzada', tools: [{ id: 'magic', label: 'Varita mágica', icon: Wand2, panel: 'image', disabled: true, unavailableReason: 'La máscara local aún no está integrada como selección en Advanced.' }, { id: 'color-select', label: 'Selección por color', icon: Pipette, panel: 'image', disabled: true, unavailableReason: 'La selección por color aún no está integrada en Advanced.' }] },
  { label: 'Imagen', tools: [{ id: 'background', label: 'Quitar fondo', icon: ImageMinus, panel: 'image', hasPanel: true }, { id: 'vectorize', label: 'Vectorizar', icon: Wand2, panel: 'image', disabled: true, unavailableReason: 'No hay un vectorizador local o provider conectado a Advanced.' }, { id: 'adjustments', label: 'Ajustes', icon: SlidersHorizontal, panel: 'image' }, { id: 'filters', label: 'Filtros', icon: Contrast, panel: 'image' }, { id: 'effects', label: 'Efectos', icon: Sparkles, panel: 'image', disabled: true, unavailableReason: 'Sombras, resplandor y borde no tienen un modelo de capa/export configurado.' }] },
  { label: 'Crear', tools: [{ id: 'text', label: 'Texto', shortcut: 'T', icon: Type, panel: 'text', hasPanel: true }, { id: 'shapes', label: 'Formas', shortcut: 'U', icon: Shapes, panel: 'shape', hasPanel: true }, { id: 'picker', label: 'Cuentagotas', icon: Pipette, panel: 'color', disabled: true, unavailableReason: 'La lectura de color desde el canvas no está conectada.' }] },
  { label: 'Orden', tools: [{ id: 'arrange', label: 'Alinear y distribuir', icon: AlignCenter, panel: 'arrange', hasPanel: true }, { id: 'group', label: 'Agrupar elementos', icon: Group, panel: 'arrange', disabled: true, unavailableReason: 'La estructura de grupos no está configurada en el documento.' }] },
  { label: 'Vista', tools: [{ id: 'hand', label: 'Mano', shortcut: 'H', icon: Hand, panel: 'view' }, { id: 'zoom', label: 'Zoom', shortcut: 'Z', icon: ZoomIn, panel: 'view' }, { id: 'guides', label: 'Guías y cuadrícula', icon: Grid2X2, panel: 'view', hasPanel: true }] },
];

export function DesignerWorkspace({
  title,
  previewUrl,
  layers,
  selectedLayerId,
  selectedLayerIds,
  onSelectLayer,
  onSelectMultipleLayers,
  onDeselect,
  onInvertSelection,
  documentWidth,
  documentHeight,
  dpi,
  rotation,
  flipHorizontal,
  flipVertical,
  brightness,
  contrast,
  saturation,
  onBack,
  onNew,
  onOpen,
  onRecents,
  onSave,
  onSaveAs,
  onExport,
  onLinkProduct,
  onToggleLayer,
  onToggleLock,
  onDeleteLayer,
  onAddLayer,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCut,
  onCopy,
  onPaste,
  onDuplicate,
  onDeleteSelected,
  onSelectAll,
  onImageSize,
  onCanvasSize,
  onRotate,
  onFlipHorizontal,
  onFlipVertical,
  onAdjustments,
  onApplyImageSize,
  onApplyCanvasSize,
  onApplyAdjustments,
  imageDialog,
  onCloseImageDialog,
  onDuplicateLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onBringLayerToFront,
  onSendLayerToBack,
  onToggleSelectedVisibility,
  onToggleSelectedLock,
  onAddTextLayer,
  onAddShape,
  onAlign,
  onDistribute,
  onCropApply,
  onDropFiles,
  selectedTextLayer,
  onUpdateSelectedText,
  selectedImageLayer,
  onUpdateSelectedImageFilters,
  onUpdateLayer,
  onUpdateMultipleLayers,
  onSavePath,
  onSwitchToEasy,
}: {
  title: string;
  previewUrl?: string;
  layers: DesignerWorkspaceLayer[];
  selectedLayerId: string;
  selectedLayerIds: string[];
  onSelectLayer: (id: string, additive?: boolean) => void;
  onSelectMultipleLayers?: (ids: string[]) => void;
  onDeselect: () => void;
  onInvertSelection: () => void;
  documentWidth: number;
  documentHeight: number;
  dpi: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  onBack: () => void;
  onNew: () => void;
  onOpen: () => void;
  onRecents: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExport: () => void;
  onLinkProduct: () => void;
  onToggleLayer: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onAddLayer: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onImageSize: () => void;
  onCanvasSize: () => void;
  onRotate: (degrees: number) => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onAdjustments: () => void;
  onApplyImageSize: (width: number, height: number, dpi: number) => void;
  onApplyCanvasSize: (width: number, height: number, anchor?: CanvasAnchor) => void;
  onApplyAdjustments: (brightness: number, contrast: number, saturation: number) => void;
  imageDialog: 'image-size' | 'canvas-size' | 'adjustments' | null;
  onCloseImageDialog: () => void;
  onDuplicateLayer: () => void;
  onMoveLayerUp: () => void;
  onMoveLayerDown: () => void;
  onBringLayerToFront: () => void;
  onSendLayerToBack: () => void;
  onToggleSelectedVisibility: () => void;
  onToggleSelectedLock: () => void;
  onAddTextLayer: () => void;
  onAddShape?: (shapeType: "rectangle" | "circle" | "triangle" | "line") => void;
  onAlign?: (type: AlignmentType) => void;
  onDistribute?: (type: DistributionType) => void;
  onCropApply?: (layerId: string, rect: CropRect, croppedDataUrl: string) => void;
  onDropFiles?: (files: FileList | File[]) => void;
  selectedTextLayer?: DesignerWorkspaceLayer;
  onUpdateSelectedText: (changes: Partial<DesignerWorkspaceLayer>) => void;
  selectedImageLayer?: DesignerWorkspaceLayer;
  onUpdateSelectedImageFilters: (changes: Partial<FilterValues>) => void;
  onUpdateLayer?: (id: string, changes: Partial<DesignerWorkspaceLayer>) => void;
  onUpdateMultipleLayers?: (updates: { id: string; changes: Partial<DesignerWorkspaceLayer> }[]) => void;
  onSavePath: (
    path: DocumentPath,
    style: { fill: string; stroke: string; strokeWidth: number },
    layerId?: string,
  ) => void;
  onSwitchToEasy?: () => void;
}) {
  const [activeTool, setActiveTool] = React.useState('select');
  const [cropModalOpen, setCropModalOpen] = React.useState(false);
  const [pathEditorLayerId, setPathEditorLayerId] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(100);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [selectedLayer, setSelectedLayer] = React.useState(layers[0]?.id);
  const [showGrid, setShowGrid] = React.useState(true);
  const [showRulers, setShowRulers] = React.useState(false);
  const [showGuides, setShowGuides] = React.useState(false);
  const [showSafeArea, setShowSafeArea] = React.useState(true);
  const [tab, setTab] = React.useState<'properties' | 'layers' | 'history'>('properties');
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [openToolGroup, setOpenToolGroup] = React.useState<string | null>(null);
  const [modeMenuOpen, setModeMenuOpen] = React.useState(false);
  const modeMenuRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!modeMenuOpen) return;
    const handle = (e: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setModeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [modeMenuOpen]);
  const [filterDialog, setFilterDialog] = React.useState(false);
  const canvasViewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setSelectedLayer(selectedLayerId), [selectedLayerId]);
  const active = TOOL_GROUPS.flatMap((group) => group.tools).find((tool) => tool.id === activeTool) ?? TOOL_GROUPS[0].tools[0];
  const selected = layers.find((layer) => layer.id === selectedLayer);
  const kind = selected?.type ?? 'background';
  const typeLabel = kind === 'image' ? 'Imagen' : kind === 'text' ? 'Texto' : kind === 'shape' ? 'Forma' : 'Documento';

  React.useEffect(() => {
    const isTextControl = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      return !!element?.closest('input, textarea, [contenteditable="true"]');
    };
    const handler = (event: KeyboardEvent) => {
      if (isTextControl(event.target)) return;
      const key = event.key.toLowerCase();
      const modifier = event.ctrlKey || event.metaKey;
      const tool = resolveDesignerToolShortcut(event);
      if (tool) {
        event.preventDefault();
        setOpenToolGroup(null);
        setActiveTool(tool);
        if (tool === 'pen') {
          setPathEditorLayerId(selected?.type === 'path' ? selected.id : null);
        } else if (tool === 'direct-select') {
          if (selected?.type === 'path') setPathEditorLayerId(selected.id);
          else setTab('layers');
        } else if (tool === 'crop') {
          setCropModalOpen(true);
        } else if (tool === 'text') {
          onAddTextLayer();
        }
        return;
      }
      if (modifier && key === 'z') {
        event.preventDefault();
        (event.shiftKey ? onRedo : onUndo)();
      } else if (modifier && key === 'y') {
        event.preventDefault();
        onRedo();
      } else if (modifier && key === 'x') {
        event.preventDefault();
        onCut();
      } else if (modifier && key === 'c') {
        event.preventDefault();
        onCopy();
      } else if (modifier && key === 'v') {
        event.preventDefault();
        onPaste();
      } else if (modifier && key === 'd') {
        event.preventDefault();
        onDuplicate();
      } else if (modifier && key === 'a') {
        event.preventDefault();
        onSelectAll();
      } else if (modifier && event.key === ']') {
        event.preventDefault();
        (event.shiftKey ? onBringLayerToFront : onMoveLayerUp)();
      } else if (modifier && event.key === '[') {
        event.preventDefault();
        (event.shiftKey ? onSendLayerToBack : onMoveLayerDown)();
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        onDeleteSelected();
      } else if (modifier && key === 'n') {
        event.preventDefault();
        onNew();
      } else if (modifier && key === 'o') {
        event.preventDefault();
        onOpen();
      } else if (modifier && key === 's') {
        event.preventDefault();
        (event.shiftKey ? onSaveAs : onSave)();
      }
    };

    const pasteHandler = (event: ClipboardEvent) => {
      if (isTextControl(event.target)) return;
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            onDropFiles?.([file]);
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handler);
    window.addEventListener('paste', pasteHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('paste', pasteHandler);
    };
  }, [onNew, onOpen, onSave, onSaveAs, onUndo, onRedo, onCut, onCopy, onPaste, onDuplicate, onDeleteSelected, onSelectAll, onMoveLayerUp, onMoveLayerDown, onBringLayerToFront, onSendLayerToBack, onDropFiles, onAddTextLayer, selected?.id, selected?.type]);

  const fileActions: Record<string, () => void> = { Nuevo: onNew, Abrir: onOpen, Recientes: onRecents, Guardar: onSave, 'Guardar como': onSaveAs, Exportar: onExport, Cerrar: onBack };
  const editActions: Record<string, () => void> = { Deshacer: onUndo, Rehacer: onRedo, Cortar: onCut, Copiar: onCopy, Pegar: onPaste, Duplicar: onDuplicate, Eliminar: onDeleteSelected, 'Seleccionar todo': onSelectAll };
  const selectionActions: Record<string, () => void> = { 'Seleccionar todo': onSelectAll, Deseleccionar: onDeselect, 'Invertir selección': onInvertSelection };
  const filterActions: Record<string, () => void> = Object.fromEntries(['Brillo', 'Contraste', 'Saturación', 'Escala de grises', 'Sepia', 'Invertir', 'Desenfoque'].map((item) => [item, () => setFilterDialog(true)]));
  const zoomIn = () => setZoom((value) => Math.min(300, value >= 100 ? value + 25 : value + 25));
  const zoomOut = () => setZoom((value) => Math.max(25, value - 25));
  const fitToCanvas = () => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;
    const availableWidth = Math.max(1, viewport.clientWidth - 40);
    const availableHeight = Math.max(1, viewport.clientHeight - 40);
    setZoom(Math.max(25, Math.min(200, Math.floor(Math.min(availableWidth / 480, availableHeight / 480) * 100))));
    setPan({ x: 0, y: 0 });
  };

  const viewActions: Record<string, () => void> = {
    Zoom: () => { setZoom(100); setPan({ x: 0, y: 0 }); },
    Alejar: zoomOut,
    'Ajustar al lienzo': fitToCanvas,
    Reglas: () => setShowRulers((value) => !value),
    Guías: () => setShowGuides((value) => !value),
    Cuadrícula: () => setShowGrid((value) => !value),
    'Área segura': () => setShowSafeArea((value) => !value),
    'Área imprimible': () => setShowSafeArea((value) => !value),
  };
  const imageActions: Record<string, () => void> = { 'Tamaño de imagen': onImageSize, 'Tamaño del lienzo': onCanvasSize, Recortar: () => setCropModalOpen(true), 'Rotar 90° derecha': () => onRotate(90), 'Rotar 90° izquierda': () => onRotate(-90), 'Rotar 180°': () => onRotate(180), 'Voltear horizontal': onFlipHorizontal, 'Voltear vertical': onFlipVertical, Ajustes: onAdjustments };
  const layerActions: Record<string, () => void> = { 'Nueva capa': () => (onAddShape ? onAddShape('rectangle') : onAddLayer()), 'Duplicar capa': onDuplicateLayer, 'Eliminar capa': onDeleteSelected, 'Subir capa': onMoveLayerUp, 'Bajar capa': onMoveLayerDown, 'Traer al frente': onBringLayerToFront, 'Enviar al fondo': onSendLayerToBack, 'Bloquear / Desbloquear': onToggleSelectedLock, 'Mostrar / Ocultar': onToggleSelectedVisibility };
  const textActions: Record<string, () => void> = {
    'Nueva capa de texto': onAddTextLayer,
    'Fuente Arial': () => onUpdateSelectedText({ fontFamily: 'Arial' }),
    'Fuente Georgia': () => onUpdateSelectedText({ fontFamily: 'Georgia' }),
    'Fuente Verdana': () => onUpdateSelectedText({ fontFamily: 'Verdana' }),
    'Tamaño 24': () => onUpdateSelectedText({ fontSize: 24 }),
    'Tamaño 36': () => onUpdateSelectedText({ fontSize: 36 }),
    'Tamaño 48': () => onUpdateSelectedText({ fontSize: 48 }),
    Color: () => onUpdateSelectedText({ color: selectedTextLayer?.color === '#2563EB' ? '#111827' : '#2563EB' }),
    Negrita: () => onUpdateSelectedText({ fontWeight: selectedTextLayer?.fontWeight === 'bold' ? 'normal' : 'bold' }),
    Cursiva: () => onUpdateSelectedText({ fontStyle: selectedTextLayer?.fontStyle === 'italic' ? 'normal' : 'italic' }),
    Subrayado: () => onUpdateSelectedText({ textDecoration: selectedTextLayer?.textDecoration === 'underline' ? 'none' : 'underline' }),
    'Alinear izquierda': () => onUpdateSelectedText({ textAlign: 'left' }),
    'Alinear centro': () => onUpdateSelectedText({ textAlign: 'center' }),
    'Alinear derecha': () => onUpdateSelectedText({ textAlign: 'right' }),
  };
  const windowActions: Record<string, () => void> = {
    Capas: () => setTab('layers'),
    Propiedades: () => setTab('properties'),
    Historial: () => setTab('history'),
  };
  const menuActions: Record<string, Record<string, () => void>> = {
    Archivo: fileActions,
    Editar: editActions,
    Imagen: imageActions,
    Capa: layerActions,
    Texto: textActions,
    Seleccionar: selectionActions,
    Filtro: filterActions,
    Ver: viewActions,
    Ventana: windowActions,
  };

  return <div className="flex h-[calc(100vh-64px)] min-h-[620px] flex-col overflow-hidden bg-[#FBFBFD] font-sans text-[#111827] select-none">
    <header className="relative z-40 shrink-0 border-b border-[#E5E7EB] bg-white">
      <div className="flex h-8 items-center border-b border-[#E5E7EB] px-3">
        <nav className="flex h-full items-stretch gap-0.5">
          {MENU_CONFIG.map((menu) => {
            const actions = menuActions[menu.label] ?? {};
            const unavailableReasons = Object.fromEntries(
              menu.items
                .filter((item) => item !== '—' && !actions[item])
                .map((item) => [
                  item,
                  MENU_UNAVAILABLE_REASONS[menu.label]?.[item]
                    ?? 'Esta acción no está configurada en Designer 3 Advanced.',
                ]),
            );
            return (
              <div key={menu.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((current) => current === menu.label ? null : menu.label)}
                  className={cn('h-full px-2 text-[11px] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827]', openMenu === menu.label && 'bg-[#EFF6FF] text-[#2563EB]')}
                >
                  {menu.label}
                </button>
                {openMenu === menu.label && (
                  <MenuDropdown
                    items={menu.items}
                    unavailableReasons={unavailableReasons}
                    onClose={() => setOpenMenu(null)}
                    onSelect={(item) => actions[item]?.()}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="flex h-11 items-center justify-between px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827]">
            <ArrowLeft className="h-3.5 w-3.5"/>
            <span className="hidden sm:inline">Mis diseños</span>
          </button>
          <span className="hidden h-4 w-px bg-[#E5E7EB] sm:block"/>
          <span className="truncate text-xs font-bold text-[#111827]">{title}</span>
          <span className="hidden rounded-[3px] border border-[#E5E7EB] bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-[10px] text-[#64748B] md:inline">300 DPI</span>
        </div>
        <div className="hidden items-center gap-1 md:flex">
          <IconButton icon={Undo2} label="Deshacer" onClick={onUndo} disabled={!canUndo}/>
          <IconButton icon={Redo2} label="Rehacer" onClick={onRedo} disabled={!canRedo}/>
          <span className="mx-1 h-4 w-px bg-[#E5E7EB]"/>
          <IconButton icon={ZoomOut} label="Alejar" onClick={zoomOut}/>
          <span className="w-9 text-center font-mono text-[11px] text-[#475569]">{zoom}%</span>
          <IconButton icon={ZoomIn} label="Acercar" onClick={zoomIn}/>
          <button type="button" onClick={fitToCanvas} className="rounded-[4px] px-1.5 py-1 text-[10px] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#111827]">Ajustar</button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onLinkProduct} className="hidden rounded-[5px] border border-[#2563EB] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] sm:inline">
            Vincular producto
          </button>
          <button type="button" onClick={onSave} className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#475569] hover:bg-[#F8FAFC]">
            <Save className="h-3.5 w-3.5"/><span className="hidden sm:inline">Guardar</span>
          </button>
          <button type="button" onClick={onExport} className="inline-flex items-center gap-1.5 rounded-[5px] bg-[#2563EB] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#1D4ED8]">
            <Download className="h-3.5 w-3.5"/>Exportar
          </button>
          {/* ── Botón tres puntos: cambiar de modo ── */}
          <div ref={modeMenuRef} className="relative">
            <button
              type="button"
              aria-label="Cambiar de modo"
              title="Cambiar de modo"
              onClick={() => setModeMenuOpen((v) => !v)}
              className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[5px] border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827]"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {modeMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-[6px] border border-[#E5E7EB] bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => { setModeMenuOpen(false); onSwitchToEasy?.(); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#111827] hover:bg-[#F1F5F9]"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>Cambiar a modo fácil</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      <aside className="z-20 flex w-12 shrink-0 flex-col items-center border-r border-[#E5E7EB] bg-white py-2">
        <div className="flex w-full flex-1 flex-col items-center gap-1.5">
          {TOOL_GROUPS.map((group, index) => (
            <React.Fragment key={group.label}>
              {index > 0 && <span className="h-px w-5 bg-[#E5E7EB]"/>}
              <ToolGroupButton
                group={group}
                active={group.tools.some((tool) => tool.id === activeTool)}
                open={openToolGroup === group.label}
                onClick={() => setOpenToolGroup((current) => current === group.label ? null : group.label)}
              />
            </React.Fragment>
          ))}
        </div>
        <div className="relative mb-1 h-7 w-7" title="Color frontal y fondo">
          <span className="absolute left-0 top-0 h-5 w-5 border border-white bg-[#2563EB]"/>
          <span className="absolute bottom-0 right-0 h-5 w-5 border border-[#CBD5E1] bg-white"/>
        </div>
      </aside>
      {openToolGroup && (
        <ToolFlyout
          group={TOOL_GROUPS.find((group) => group.label === openToolGroup)!}
          activeTool={activeTool}
          onSelect={(id) => {
            if (id === 'pen') {
              setActiveTool(id);
              setPathEditorLayerId(selected?.type === 'path' ? selected.id : null);
              setOpenToolGroup(null);
              setTab('properties');
              return;
            }
            if (id === 'direct-select') {
              if (selected?.type !== 'path') {
                setOpenToolGroup(null);
                setTab('layers');
                return;
              }
              setActiveTool(id);
              setPathEditorLayerId(selected.id);
              setOpenToolGroup(null);
              setTab('properties');
              return;
            }
            if (id === 'adjustments') {
              setOpenToolGroup(null);
              onAdjustments();
              return;
            }
            if (id === 'filters') {
              setOpenToolGroup(null);
              setFilterDialog(true);
              return;
            }
            setActiveTool(id);
            setOpenToolGroup(null);
            setTab('properties');
            if (id === 'crop') setCropModalOpen(true);
            if (id === 'text') onAddTextLayer();
            if (id === 'shapes') onAddShape?.('rectangle');
          }}
        />
      )} 

      <main
        ref={canvasViewportRef}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onDropFiles?.(e.dataTransfer.files);
          }
        }}
        className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#F4F5FA] p-0"
      >
        <div className={cn('pointer-events-none absolute inset-0 opacity-[0.14]', !showGrid && 'hidden')} style={{ backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)', backgroundSize: `${24 * zoom / 100}px ${24 * zoom / 100}px` }}/>
        {showRulers && (
          <>
            <span className="absolute left-0 right-0 top-0 h-5 border-b border-[#E5E7EB] bg-white px-7 pt-1 font-mono text-[9px] text-[#94A3B8] z-30">0  --  500  --  1000  --  1500</span>
            <span className="absolute bottom-0 left-0 top-0 w-5 border-r border-[#E5E7EB] bg-white pt-7 text-center font-mono text-[9px] text-[#94A3B8] z-30">0</span>
          </>
        )}

        <InteractiveCanvas
          layers={layers as unknown as import('./designer/types').DesignerLayer[]}
          selectedLayerIds={selectedLayerIds}
          previewUrl={previewUrl}
          documentWidth={documentWidth}
          documentHeight={documentHeight}
          documentRotation={rotation}
          flipHorizontal={flipHorizontal}
          flipVertical={flipVertical}
          brightness={brightness}
          contrast={contrast}
          saturation={saturation}
          zoom={zoom}
          pan={pan}
          activeTool={activeTool}
          showGrid={showGrid}
          showSafeArea={showSafeArea}
          showGuides={showGuides}
          onUpdateZoom={setZoom}
          onUpdatePan={setPan}
          onSelectLayer={onSelectLayer}
          onSelectMultipleLayers={onSelectMultipleLayers}
          onDeselect={onDeselect}
          onUpdateLayer={(id, changes) => onUpdateLayer?.(id, changes)}
          onUpdateMultipleLayers={(updates) => onUpdateMultipleLayers?.(updates)}
          onUpdateText={onUpdateSelectedText}
        />

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-[4px] border border-[#E2E8F0] bg-white p-1 shadow-sm z-30">
          <Toggle icon={Grid2X2} label="Cuadrícula" active={showGrid} onClick={() => setShowGrid(!showGrid)}/>
          <Toggle icon={ScanLine} label="Reglas" active={showRulers} onClick={() => setShowRulers(!showRulers)}/>
          <Toggle icon={Frame} label="Área segura" active={showSafeArea} onClick={() => setShowSafeArea(!showSafeArea)}/>
          <span className="mx-0.5 h-4 w-px bg-[#E5E7EB]"/>
          <Toggle icon={Hand} label="Mano (Pan)" active={activeTool === 'hand'} onClick={() => setActiveTool((curr) => curr === 'hand' ? 'select' : 'hand')}/>
        </div>
      </main>

      <aside className="flex w-[286px] shrink-0 flex-col border-l border-[#E5E7EB] bg-white">
        <div className="flex h-10 shrink-0 border-b border-[#E5E7EB] px-3">
          <Tab label={typeLabel} active={tab === 'properties'} onClick={() => setTab('properties')}/>
          <Tab label={`Capas (${layers.length})`} active={tab === 'layers'} onClick={() => setTab('layers')}/>
          <Tab label="Historial" active={tab === 'history'} onClick={() => setTab('history')}/>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === 'properties' && (
            <Properties
              kind={kind}
              activeTool={active}
              opacity={selected?.opacity ?? 100}
              setOpacity={(value) => {
                if (selected && !selected.locked && selectedLayerIds.length <= 1) {
                  onUpdateLayer?.(selected.id, { opacity: value });
                }
              }}
              textLayer={selectedTextLayer}
              selectedLayer={selected}
              selectedLayerCount={selectedLayerIds.length}
              onUpdateLayer={onUpdateLayer}
              onUpdateText={onUpdateSelectedText}
              onAddShape={onAddShape}
              onAlign={onAlign}
              onDistribute={onDistribute}
              onOpenCrop={() => setCropModalOpen(true)}
            />
          )}
          {tab === 'layers' && (
            <LayersPanel
              layers={layers}
              selectedLayers={selectedLayerIds}
              onSelect={onSelectLayer}
              onToggleLayer={onToggleLayer}
              onToggleLock={onToggleLock}
              onDeleteLayer={onDeleteLayer}
              onAddLayer={() => (onAddShape ? onAddShape('rectangle') : onAddLayer())}
              onMoveLayerUp={onMoveLayerUp}
              onMoveLayerDown={onMoveLayerDown}
              onBringLayerToFront={onBringLayerToFront}
              onSendLayerToBack={onSendLayerToBack}
              onDuplicateLayer={onDuplicateLayer}
            />
          )}
          {tab === 'history' && <HistoryPanel/>}
        </div>
      </aside>
    </div>

    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-[#E5E7EB] bg-white px-3 text-[10px] text-[#64748B]">
      <span>{active.label}{active.shortcut ? ` · ${active.shortcut}` : ''}</span>
      <span>RGB · 300 DPI · {zoom}% · Pan ({pan.x}, {pan.y})</span>
    </footer>

    {imageDialog === 'canvas-size' && (
      <CanvasSizeModal
        isOpen={true}
        width={documentWidth}
        height={documentHeight}
        dpi={dpi}
        onClose={onCloseImageDialog}
        onApply={(w, h, anchor) => {
          onApplyCanvasSize(w, h, anchor);
        }}
      />
    )}
    {imageDialog === 'image-size' && (
      <ImageSizeModal
        isOpen={true}
        width={selected?.width ?? documentWidth}
        height={selected?.height ?? documentHeight}
        dpi={dpi}
        onClose={onCloseImageDialog}
        onApply={(w, h, nextDpi) => {
          onApplyImageSize(w, h, nextDpi);
        }}
      />
    )}
    {imageDialog === 'adjustments' && (
      <ImageDialog
        type="adjustments"
        width={documentWidth}
        height={documentHeight}
        dpi={dpi}
        brightness={brightness}
        contrast={contrast}
        saturation={saturation}
        onClose={onCloseImageDialog}
        onApplyImageSize={onApplyImageSize}
        onApplyCanvasSize={(w, h) => onApplyCanvasSize(w, h)}
        onApplyAdjustments={onApplyAdjustments}
      />
    )}
    {cropModalOpen && selectedImageLayer && (
      <CropModal
        isOpen={cropModalOpen}
        layer={selectedImageLayer as unknown as DesignerLayer}
        onClose={() => setCropModalOpen(false)}
        onApplyCrop={(id, rect, url) => {
          onCropApply?.(id, rect, url);
          setCropModalOpen(false);
        }}
      />
    )}
    {(pathEditorLayerId !== null || activeTool === 'pen') && (
      <PathEditorModal
        key={pathEditorLayerId ?? 'new-path'}
        documentWidth={documentWidth}
        documentHeight={documentHeight}
        initialPath={layers.find((layer) => layer.id === pathEditorLayerId)?.path}
        initialStyle={layers.find((layer) => layer.id === pathEditorLayerId)}
        onClose={() => {
          setPathEditorLayerId(null);
          setActiveTool('select');
        }}
        onSave={(path, style) => {
          onSavePath(path, style, pathEditorLayerId ?? undefined);
          setPathEditorLayerId(null);
          setActiveTool('select');
        }}
      />
    )}
    {filterDialog && (
      <FilterDialog
        layer={selectedImageLayer}
        onClose={() => setFilterDialog(false)}
        onApply={(filters) => {
          onUpdateSelectedImageFilters(filters);
          setFilterDialog(false);
        }}
      />
    )}
  </div>;
}

function MenuDropdown({
  items,
  unavailableReasons,
  onClose,
  onSelect,
}: {
  items: readonly string[];
  unavailableReasons: Record<string, string>;
  onClose: () => void;
  onSelect: (item: string) => void;
}) {
  return (
    <div className="absolute left-0 top-full z-50 mt-px w-52 border border-[#E2E8F0] bg-white py-1 shadow-md">
      {items.map((item, index) => {
        if (item === '—') {
          return <span key={`${item}-${index}`} className="my-1 block h-px bg-[#F1F5F9]"/>;
        }

        const unavailableReason = unavailableReasons[item];
        const reasonId = `menu-unavailable-${item.toLowerCase().replace(/\s+/g, '-')}`;
        return (
          <div key={item}>
            <button
              type="button"
              aria-disabled={Boolean(unavailableReason)}
              aria-describedby={unavailableReason ? reasonId : undefined}
              title={unavailableReason}
              onClick={() => {
                if (unavailableReason) return;
                onClose();
                onSelect(item);
              }}
              className={cn('flex w-full items-center justify-between px-3 py-1.5 text-left text-[11px] text-[#475569]', unavailableReason ? 'cursor-not-allowed opacity-60' : 'hover:bg-[#F8FAFC] hover:text-[#111827]')}
            >
              <span className="flex-1">{item.replace(' ›', '')}</span>
              {unavailableReason ? (
                <span className="ml-2 text-[9px] text-[#64748B]">No configurado</span>
              ) : item.endsWith('›') ? (
                <ChevronDown className="h-3 w-3 -rotate-90"/>
              ) : null}
            </button>
            {unavailableReason && (
              <p id={reasonId} className="px-3 pb-1.5 text-[9px] leading-snug text-[#64748B]">{unavailableReason}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FilterDialog({ layer, onClose, onApply }: { layer?: DesignerWorkspaceLayer; onClose: () => void; onApply: (filters: FilterValues) => void }) {
  const [filters, setFilters] = React.useState<FilterValues>({ ...DEFAULT_FILTERS, ...layer?.filters });
  const setFilter = (key: keyof FilterValues, value: number) => setFilters((current) => ({ ...current, [key]: value }));
  const imageAvailable = layer?.type === 'image' && !layer.locked;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#111827]">Filtros de imagen</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"><X className="h-4 w-4"/></button>
        </div>
        {imageAvailable ? (
          <div className="space-y-3">
            {[['brightness', 'Brillo', '%'], ['contrast', 'Contraste', '%'], ['saturation', 'Saturación', '%'], ['grayscale', 'Escala de grises', '%'], ['sepia', 'Sepia', '%'], ['invert', 'Invertir', '%'], ['blur', 'Desenfoque', 'px']].map(([key, label, unit]) => (
              <label key={key} className="block text-[10px] text-[#64748B]">
                <span className="mb-1 flex justify-between"><span>{label}</span><span>{filters[key as keyof FilterValues]}{unit}</span></span>
                <input type="range" min={key === 'blur' ? 0 : 0} max={key === 'blur' ? 20 : key === 'brightness' || key === 'contrast' || key === 'saturation' ? 200 : 100} value={filters[key as keyof FilterValues]} onChange={(event) => setFilter(key as keyof FilterValues, Number(event.target.value))} className="w-full accent-[#2563EB]"/>
              </label>
            ))}
          </div>
        ) : (
          <p className="rounded border border-[#FDE68A] bg-[#FFFBEB] p-3 text-xs text-[#92400E]">Selecciona una capa de imagen desbloqueada para aplicar filtros.</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border border-[#E2E8F0] px-3 py-1.5 text-xs text-[#475569] hover:bg-[#F8FAFC]">Cancelar</button>
          <button type="button" disabled={!imageAvailable} onClick={() => onApply(filters)} className="rounded bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40">Aplicar</button>
        </div>
      </div>
    </div>
  );
}

function ImageDialog({ type, width, height, dpi, brightness, contrast, saturation, onClose, onApplyImageSize, onApplyCanvasSize, onApplyAdjustments }: { type: 'image-size' | 'canvas-size' | 'adjustments'; width: number; height: number; dpi: number; brightness: number; contrast: number; saturation: number; onClose: () => void; onApplyImageSize: (width: number, height: number, dpi: number) => void; onApplyCanvasSize: (width: number, height: number) => void; onApplyAdjustments: (brightness: number, contrast: number, saturation: number) => void }) {
  const [nextWidth, setNextWidth] = React.useState(width);
  const [nextHeight, setNextHeight] = React.useState(height);
  const [nextDpi, setNextDpi] = React.useState(dpi);
  const [keepRatio, setKeepRatio] = React.useState(true);
  const [nextBrightness, setNextBrightness] = React.useState(brightness);
  const [nextContrast, setNextContrast] = React.useState(contrast);
  const [nextSaturation, setNextSaturation] = React.useState(saturation);
  const ratio = width / height;
  const title = type === 'image-size' ? 'Tamaño de imagen' : type === 'canvas-size' ? 'Tamaño del lienzo' : 'Ajustes de imagen';
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"><X className="h-4 w-4"/></button>
        </div>
        {type !== 'adjustments' ? (
          <div className="space-y-3">
            <NumberField label="Ancho" value={nextWidth} onChange={(value) => { setNextWidth(value); if (type === 'image-size' && keepRatio) setNextHeight(Math.round(value / ratio)); }}/>
            <NumberField label="Alto" value={nextHeight} onChange={(value) => { setNextHeight(value); if (type === 'image-size' && keepRatio) setNextWidth(Math.round(value * ratio)); }}/>
            {type === 'image-size' && (
              <>
                <NumberField label="Resolución (DPI)" value={nextDpi} onChange={setNextDpi}/>
                <label className="flex items-center gap-2 text-xs text-[#475569]"><input type="checkbox" checked={keepRatio} onChange={(event) => setKeepRatio(event.target.checked)} className="accent-[#2563EB]"/>Mantener proporción</label>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <RangeField label="Brillo" value={nextBrightness} onChange={setNextBrightness}/>
            <RangeField label="Contraste" value={nextContrast} onChange={setNextContrast}/>
            <RangeField label="Saturación" value={nextSaturation} onChange={setNextSaturation}/>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border border-[#E2E8F0] px-3 py-1.5 text-xs text-[#475569] hover:bg-[#F8FAFC]">Cancelar</button>
          <button type="button" onClick={() => type === 'image-size' ? onApplyImageSize(nextWidth, nextHeight, nextDpi) : type === 'canvas-size' ? onApplyCanvasSize(nextWidth, nextHeight) : onApplyAdjustments(nextBrightness, nextContrast, nextSaturation)} className="rounded bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]">Aplicar</button>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-[#475569]">
      <span>{label}</span>
      <input type="number" min="1" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-28 rounded border border-[#E2E8F0] px-2 py-1.5 text-right text-xs text-[#111827] outline-none focus:border-[#2563EB]"/>
    </label>
  );
}

function RangeField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-xs text-[#475569]">
      <span className="mb-1 flex justify-between"><span>{label}</span><span>{value}%</span></span>
      <input type="range" min="0" max="200" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#2563EB]"/>
    </label>
  );
}

function ToolGroupButton({ group, active, open, onClick }: { group: { label: string; tools: Tool[] }; active: boolean; open: boolean; onClick: () => void }) {
  const Icon = group.tools[0].icon;
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${group.label} · ${group.tools.length} herramientas`}
      className={cn('relative flex h-8 w-8 items-center justify-center rounded-[5px] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#111827]', (active || open) && 'bg-[#EFF6FF] text-[#2563EB]')}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75}/>
      <ChevronDown className="absolute bottom-0.5 right-0.5 h-2 w-2"/>
    </button>
  );
}

function ToolFlyout({ group, activeTool, onSelect }: { group: { label: string; tools: Tool[] }; activeTool: string; onSelect: (id: string) => void }) {
  return (
    <div className="absolute left-12 top-0 z-30 w-52 border-r border-b border-[#E2E8F0] bg-white py-2 shadow-md">
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">{group.label}</p>
      {group.tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <div key={tool.id}>
            <button
              type="button"
              aria-disabled={tool.disabled || undefined}
              aria-describedby={tool.disabled ? `tool-unavailable-${tool.id}` : undefined}
              title={tool.unavailableReason}
              onClick={() => {
                if (!tool.disabled) onSelect(tool.id);
              }}
              className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-[#475569]', !tool.disabled && 'hover:bg-[#F8FAFC] hover:text-[#111827]', tool.disabled && 'cursor-not-allowed opacity-50', activeTool === tool.id && 'bg-[#EFF6FF] text-[#2563EB]')}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75}/>
              <span className="flex-1">{tool.label}</span>
              {tool.disabled && <span className="text-[9px] text-[#64748B]">No configurado</span>}
              {tool.shortcut && <span className="font-mono text-[10px] text-[#94A3B8]">{tool.shortcut}</span>}
            </button>
            {tool.disabled && tool.unavailableReason && (
              <p id={`tool-unavailable-${tool.id}`} className="px-8 pb-1.5 text-[9px] leading-snug text-[#64748B]">{tool.unavailableReason}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function IconButton({ icon: Icon, label, onClick, disabled = false }: { icon: React.ElementType; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn("rounded-[4px] p-1 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#111827]", disabled && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-[#64748B]")}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75}/>
    </button>
  );
}

function Toggle({ icon: Icon, label, active, onClick }: { icon: React.ElementType; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn('rounded-[4px] p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E3A8A]', active && 'bg-[#2563EB] text-white')}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75}/>
    </button>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('border-b-2 px-2 text-[10px] font-semibold transition-colors', active ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#64748B] hover:text-[#111827]')}
    >
      {label}
    </button>
  );
}

function TransformPanel({
  layer,
  onUpdateLayer,
}: {
  layer?: DesignerWorkspaceLayer;
  onUpdateLayer?: (id: string, changes: Partial<DesignerWorkspaceLayer>) => void;
}) {
  const x = layer?.x ?? 0;
  const y = layer?.y ?? 0;
  const width = layer?.width ?? 320;
  const height = layer?.height ?? 320;
  const rotation = layer?.rotation ?? 0;

  return (
    <Panel title="Transformación">
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[10px] text-[#64748B]">X (px)</span>
          <input
            type="number"
            value={x}
            disabled={!layer || layer.locked}
            onChange={(e) =>
              layer && onUpdateLayer?.(layer.id, { x: Number(e.target.value) })
            }
            className="flex h-7 w-full items-center rounded-[4px] border border-[#E2E8F0] bg-white px-2 text-[11px] text-[#111827] outline-none focus:border-[#2563EB] disabled:bg-[#F8FAFC]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] text-[#64748B]">Y (px)</span>
          <input
            type="number"
            value={y}
            disabled={!layer || layer.locked}
            onChange={(e) =>
              layer && onUpdateLayer?.(layer.id, { y: Number(e.target.value) })
            }
            className="flex h-7 w-full items-center rounded-[4px] border border-[#E2E8F0] bg-white px-2 text-[11px] text-[#111827] outline-none focus:border-[#2563EB] disabled:bg-[#F8FAFC]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] text-[#64748B]">Ancho (px)</span>
          <input
            type="number"
            min="10"
            value={width}
            disabled={!layer || layer.locked}
            onChange={(e) =>
              layer &&
              onUpdateLayer?.(layer.id, {
                width: Math.max(10, Number(e.target.value)),
              })
            }
            className="flex h-7 w-full items-center rounded-[4px] border border-[#E2E8F0] bg-white px-2 text-[11px] text-[#111827] outline-none focus:border-[#2563EB] disabled:bg-[#F8FAFC]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] text-[#64748B]">Alto (px)</span>
          <input
            type="number"
            min="10"
            value={height}
            disabled={!layer || layer.locked}
            onChange={(e) =>
              layer &&
              onUpdateLayer?.(layer.id, {
                height: Math.max(10, Number(e.target.value)),
              })
            }
            className="flex h-7 w-full items-center rounded-[4px] border border-[#E2E8F0] bg-white px-2 text-[11px] text-[#111827] outline-none focus:border-[#2563EB] disabled:bg-[#F8FAFC]"
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="block">
          <span className="mb-1 flex justify-between text-[10px] text-[#64748B]">
            <span>Rotación</span>
            <span className="text-[#111827]">{rotation}°</span>
          </span>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            disabled={!layer || layer.locked}
            onChange={(e) =>
              layer &&
              onUpdateLayer?.(layer.id, { rotation: Number(e.target.value) })
            }
            className="h-1.5 w-full accent-[#2563EB]"
          />
        </label>
      </div>
    </Panel>
  );
}

function ShapeProperties({
  layer,
  onUpdateLayer,
}: {
  layer: DesignerWorkspaceLayer;
  onUpdateLayer?: (id: string, changes: Partial<DesignerWorkspaceLayer>) => void;
}) {
  const shapeType = layer.shapeType ?? 'rectangle';
  const fill = layer.fill ?? '#2563EB';
  const stroke = layer.stroke ?? '#1D4ED8';
  const strokeWidth = layer.strokeWidth ?? 0;
  const borderRadius = layer.borderRadius ?? 0;

  return (
    <Panel title="Propiedades de Forma">
      <div>
        <span className="mb-1 block text-[10px] text-[#64748B]">Tipo de forma</span>
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            title="Rectángulo"
            onClick={() => onUpdateLayer?.(layer.id, { shapeType: 'rectangle' })}
            className={cn(
              "flex h-7 items-center justify-center rounded border text-xs",
              shapeType === 'rectangle' ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD]"
            )}
          >
            <Square className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Círculo / Elipse"
            onClick={() => onUpdateLayer?.(layer.id, { shapeType: 'circle' })}
            className={cn(
              "flex h-7 items-center justify-center rounded border text-xs",
              shapeType === 'circle' ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD]"
            )}
          >
            <Circle className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Triángulo"
            onClick={() => onUpdateLayer?.(layer.id, { shapeType: 'triangle' })}
            className={cn(
              "flex h-7 items-center justify-center rounded border text-xs",
              shapeType === 'triangle' ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD]"
            )}
          >
            <TriangleIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Línea"
            onClick={() => onUpdateLayer?.(layer.id, { shapeType: 'line' })}
            className={cn(
              "flex h-7 items-center justify-center rounded border text-xs",
              shapeType === 'line' ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD]"
            )}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[10px] text-[#64748B]">
          Color Relleno
          <div className="mt-1 flex items-center gap-1.5">
            <input
              type="color"
              value={fill}
              onChange={(e) => onUpdateLayer?.(layer.id, { fill: e.target.value })}
              className="h-6 w-7 cursor-pointer rounded border border-[#E2E8F0] p-0"
            />
            <span className="text-[10px] font-mono text-[#334155]">{fill}</span>
          </div>
        </label>
        <label className="block text-[10px] text-[#64748B]">
          Color Trazo
          <div className="mt-1 flex items-center gap-1.5">
            <input
              type="color"
              value={stroke}
              onChange={(e) => onUpdateLayer?.(layer.id, { stroke: e.target.value })}
              className="h-6 w-7 cursor-pointer rounded border border-[#E2E8F0] p-0"
            />
            <span className="text-[10px] font-mono text-[#334155]">{stroke}</span>
          </div>
        </label>
      </div>

      <div>
        <label className="block">
          <span className="mb-1 flex justify-between text-[10px] text-[#64748B]">
            <span>Grosor del trazo</span>
            <span className="text-[#111827]">{strokeWidth} px</span>
          </span>
          <input
            type="range"
            min="0"
            max="30"
            value={strokeWidth}
            onChange={(e) => onUpdateLayer?.(layer.id, { strokeWidth: Number(e.target.value) })}
            className="h-1.5 w-full accent-[#2563EB]"
          />
        </label>
      </div>

      {shapeType === 'rectangle' && (
        <div>
          <label className="block">
            <span className="mb-1 flex justify-between text-[10px] text-[#64748B]">
              <span>Radio de esquinas</span>
              <span className="text-[#111827]">{borderRadius} px</span>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={borderRadius}
              onChange={(e) => onUpdateLayer?.(layer.id, { borderRadius: Number(e.target.value) })}
              className="h-1.5 w-full accent-[#2563EB]"
            />
          </label>
        </div>
      )}
    </Panel>
  );
}

function AlignDistributePanel({
  onAlign,
  onDistribute,
}: {
  onAlign?: (type: AlignmentType) => void;
  onDistribute?: (type: DistributionType) => void;
}) {
  return (
    <Panel title="Alinear y Distribuir">
      <div className="space-y-2">
        <div>
          <span className="mb-1 block text-[10px] text-[#64748B]">Alineación</span>
          <div className="grid grid-cols-6 gap-1">
            <button
              type="button"
              title="Alinear a la izquierda"
              onClick={() => onAlign?.('left')}
              className="flex h-7 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD] hover:text-[#2563EB]"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Centrar horizontalmente"
              onClick={() => onAlign?.('center')}
              className="flex h-7 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD] hover:text-[#2563EB]"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Alinear a la derecha"
              onClick={() => onAlign?.('right')}
              className="flex h-7 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD] hover:text-[#2563EB]"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Alinear arriba"
              onClick={() => onAlign?.('top')}
              className="flex h-7 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD] hover:text-[#2563EB]"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Centrar verticalmente"
              onClick={() => onAlign?.('middle')}
              className="flex h-7 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD] hover:text-[#2563EB]"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Alinear abajo"
              onClick={() => onAlign?.('bottom')}
              className="flex h-7 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD] hover:text-[#2563EB]"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div>
          <span className="mb-1 block text-[10px] text-[#64748B]">Distribuir (3+ capas)</span>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              title="Distribuir horizontalmente"
              onClick={() => onDistribute?.('horizontal')}
              className="flex h-7 items-center justify-center gap-1 rounded border border-[#E2E8F0] bg-white text-[10px] text-[#64748B] hover:border-[#93C5FD] hover:text-[#2563EB]"
            >
              <AlignHorizontalDistributeCenter className="h-3.5 w-3.5" />
              <span>Horizontal</span>
            </button>
            <button
              type="button"
              title="Distribuir verticalmente"
              onClick={() => onDistribute?.('vertical')}
              className="flex h-7 items-center justify-center gap-1 rounded border border-[#E2E8F0] bg-white text-[10px] text-[#64748B] hover:border-[#93C5FD] hover:text-[#2563EB]"
            >
              <AlignVerticalDistributeCenter className="h-3.5 w-3.5" />
              <span>Vertical</span>
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ToolContent({
  id,
  onAddShape,
  onOpenCrop,
  onAlign,
  onDistribute,
}: {
  id: string;
  onAddShape?: (type: 'rectangle' | 'circle' | 'triangle' | 'line') => void;
  onOpenCrop?: () => void;
  onAlign?: (type: AlignmentType) => void;
  onDistribute?: (type: DistributionType) => void;
}) {
  if (id === 'background') {
    return (
      <Panel title="Quitar fondo">
        <p className="text-[11px] text-[#64748B] mb-2 leading-relaxed">
          Elimina el fondo de una imagen seleccionada mediante detección inteligente de bordes y flood-fill.
        </p>
        <p className="text-[10px] text-[#2563EB] bg-[#EFF6FF] p-2 rounded border border-[#BFDBFE]">
          Selecciona una única capa de imagen y abre Eliminar fondo en el panel de propiedades.
        </p>
      </Panel>
    );
  }
  if (id === 'crop') return (
    <Panel title="Recortar Imagen">
      <p className="text-[11px] text-[#64748B]">Selecciona una capa de imagen y abre el modal de recorte interactivo con proporciones fijas o libres.</p>
      <button
        type="button"
        onClick={onOpenCrop}
        className="mt-2 flex h-8 w-full items-center justify-center gap-1.5 rounded bg-[#2563EB] text-xs font-semibold text-white hover:bg-[#1D4ED8]"
      >
        <Crop className="h-4 w-4" />
        Abrir Recortador
      </button>
    </Panel>
  );
  if (id === 'text') return <Panel title="Texto"><p className="text-[11px] leading-relaxed text-[#64748B]">La capa de texto ya está en el lienzo. Edita contenido, fuente, tamaño, alineación y color en las propiedades de la capa.</p></Panel>;
  if (id === 'shapes') return (
    <Panel title="Insertar Formas">
      <p className="text-[10px] text-[#64748B] mb-2">Haz clic para añadir una forma al lienzo como nueva capa:</p>
      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => onAddShape?.('rectangle')}
          className="flex flex-col items-center justify-center gap-1 rounded border border-[#E2E8F0] bg-white py-2 hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[#334155] hover:text-[#2563EB]"
        >
          <Square className="h-4 w-4" />
          <span className="text-[9px]">Rectángulo</span>
        </button>
        <button
          type="button"
          onClick={() => onAddShape?.('circle')}
          className="flex flex-col items-center justify-center gap-1 rounded border border-[#E2E8F0] bg-white py-2 hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[#334155] hover:text-[#2563EB]"
        >
          <Circle className="h-4 w-4" />
          <span className="text-[9px]">Círculo</span>
        </button>
        <button
          type="button"
          onClick={() => onAddShape?.('triangle')}
          className="flex flex-col items-center justify-center gap-1 rounded border border-[#E2E8F0] bg-white py-2 hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[#334155] hover:text-[#2563EB]"
        >
          <TriangleIcon className="h-4 w-4" />
          <span className="text-[9px]">Triángulo</span>
        </button>
        <button
          type="button"
          onClick={() => onAddShape?.('line')}
          className="flex flex-col items-center justify-center gap-1 rounded border border-[#E2E8F0] bg-white py-2 hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[#334155] hover:text-[#2563EB]"
        >
          <Minus className="h-4 w-4" />
          <span className="text-[9px]">Línea</span>
        </button>
      </div>
    </Panel>
  );
  if (id === 'guides') return <Panel title="Visualización"><p className="text-[11px] leading-relaxed text-[#64748B]">Cuadrícula, reglas y área segura se controlan desde los botones de la barra inferior o el menú Ver.</p></Panel>;
  if (id === 'arrange') return <AlignDistributePanel onAlign={onAlign} onDistribute={onDistribute} />;
  return null;
}

function Properties({
  kind,
  activeTool,
  opacity,
  setOpacity,
  textLayer,
  selectedLayer,
  selectedLayerCount,
  onUpdateLayer,
  onUpdateText,
  onAddShape,
  onAlign,
  onDistribute,
  onOpenCrop,
}: {
  kind: LayerKind;
  activeTool: Tool;
  opacity: number;
  setOpacity: (value: number) => void;
  textLayer?: DesignerWorkspaceLayer;
  selectedLayer?: DesignerWorkspaceLayer;
  selectedLayerCount?: number;
  onUpdateLayer?: (id: string, changes: Partial<DesignerWorkspaceLayer>) => void;
  onUpdateText: (changes: Partial<DesignerWorkspaceLayer>) => void;
  onAddShape?: (type: 'rectangle' | 'circle' | 'triangle' | 'line') => void;
  onAlign?: (type: AlignmentType) => void;
  onDistribute?: (type: DistributionType) => void;
  onOpenCrop?: () => void;
}) {
  const showToolPanel = activeTool.hasPanel && !['select', 'move', 'transform', 'hand', 'zoom'].includes(activeTool.id);
  const opacityUnavailableReason = !onUpdateLayer
    ? 'La actualización de capas no está disponible.'
    : !selectedLayer
      ? 'Selecciona una capa para editar su opacidad.'
      : selectedLayer.locked
        ? 'Desbloquea la capa para editar su opacidad.'
        : (selectedLayerCount ?? 0) > 1
          ? 'Selecciona una sola capa para editar la opacidad.'
          : undefined;
  return (
    <div className="space-y-4 p-3">
      {showToolPanel && (
        <div className="border-b border-[#E5E7EB] pb-4">
          <div className="mb-3 flex items-center gap-2">
            <activeTool.icon className="h-4 w-4 text-[#2563EB]"/>
            <span className="text-xs font-semibold text-[#111827]">{activeTool.label}</span>
          </div>
          <ToolContent
            id={activeTool.id}
            onAddShape={onAddShape}
            onOpenCrop={onOpenCrop}
            onAlign={onAlign}
            onDistribute={onDistribute}
          />
        </div>
      )}

      {/* Sincronización en tiempo real de propiedades de Transformación */}
      <TransformPanel layer={selectedLayer} onUpdateLayer={onUpdateLayer} />

      {selectedLayer && (
        <AlignDistributePanel onAlign={onAlign} onDistribute={onDistribute} />
      )}

      {kind === 'text' && textLayer && (
        <Panel title="Texto">
          <label className="block text-[10px] text-[#64748B]">
            Contenido
            <textarea
              value={textLayer.content ?? ''}
              onChange={(event) => onUpdateText({ content: event.target.value })}
              className="mt-1 min-h-16 w-full resize-y rounded border border-[#E2E8F0] p-2 text-xs text-[#111827] outline-none focus:border-[#2563EB]"
            />
          </label>
          <Select
            label="Fuente"
            values={['Arial', 'Georgia', 'Verdana']}
            value={textLayer.fontFamily ?? 'Arial'}
            onChange={(value) => onUpdateText({ fontFamily: value })}
          />
          <Field label="Tamaño" value={`${textLayer.fontSize ?? 48} px`}/>
          <input
            type="range"
            min="12"
            max="120"
            value={textLayer.fontSize ?? 48}
            onChange={(event) => onUpdateText({ fontSize: Number(event.target.value) })}
            className="w-full accent-[#2563EB]"
          />
          <div className="flex gap-1">
            <ActionIcon icon={Type} label="Negrita" active={textLayer.fontWeight === 'bold'} onClick={() => onUpdateText({ fontWeight: textLayer.fontWeight === 'bold' ? 'normal' : 'bold' })}/>
            <ActionIcon icon={Type} label="Cursiva" active={textLayer.fontStyle === 'italic'} onClick={() => onUpdateText({ fontStyle: textLayer.fontStyle === 'italic' ? 'normal' : 'italic' })}/>
            <ActionIcon icon={Type} label="Subrayado" active={textLayer.textDecoration === 'underline'} onClick={() => onUpdateText({ textDecoration: textLayer.textDecoration === 'underline' ? 'none' : 'underline' })}/>
          </div>
          <div className="flex gap-1">
            <ActionIcon icon={AlignLeft} label="Izquierda" active={textLayer.textAlign === 'left'} onClick={() => onUpdateText({ textAlign: 'left' })}/>
            <ActionIcon icon={AlignCenter} label="Centro" active={textLayer.textAlign === 'center'} onClick={() => onUpdateText({ textAlign: 'center' })}/>
            <ActionIcon icon={AlignRight} label="Derecha" active={textLayer.textAlign === 'right'} onClick={() => onUpdateText({ textAlign: 'right' })}/>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <label className="block">
              <span className="mb-1 flex justify-between text-[10px] text-[#64748B]">
                <span>Interlineado</span>
                <span>{textLayer.lineHeight ?? 1.2}</span>
              </span>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.1"
                value={textLayer.lineHeight ?? 1.2}
                onChange={(e) => onUpdateText({ lineHeight: Number(e.target.value) })}
                className="h-1.5 w-full accent-[#2563EB]"
              />
            </label>
            <label className="block">
              <span className="mb-1 flex justify-between text-[10px] text-[#64748B]">
                <span>Espaciado</span>
                <span>{textLayer.letterSpacing ?? 0}px</span>
              </span>
              <input
                type="range"
                min="-2"
                max="20"
                step="1"
                value={textLayer.letterSpacing ?? 0}
                onChange={(e) => onUpdateText({ letterSpacing: Number(e.target.value) })}
                className="h-1.5 w-full accent-[#2563EB]"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-[10px] text-[#64748B]">
            Color
            <input
              type="color"
              value={textLayer.color ?? '#111827'}
              onChange={(event) => onUpdateText({ color: event.target.value })}
              className="h-7 w-10 cursor-pointer"
            />
          </label>
        </Panel>
      )}

      {kind === 'shape' && selectedLayer && (
        <ShapeProperties layer={selectedLayer} onUpdateLayer={onUpdateLayer} />
      )}
      {kind === 'image' && selectedLayer && (
        <section className="border-t border-[#E5E7EB] pt-3">
          <h3 className="mb-3 text-[11px] font-bold text-[#111827]">Imagen</h3>
          {selectedLayerCount && selectedLayerCount > 1 ? (
            <div className="rounded border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-center text-[10px] text-[#64748B]">
              Múltiples capas seleccionadas ({selectedLayerCount}). Selecciona solo una imagen para editarla.
            </div>
          ) : (
            <ImageTools
              layer={selectedLayer as unknown as import('./designer/types').DesignerLayer}
              onUpdateLayer={onUpdateLayer ?? (() => {})}
              onOpenCrop={onOpenCrop}
            />
          )}
        </section>
      )}

      <Panel title="Apariencia">
        <p role="status" className="rounded border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[10px] leading-relaxed text-[#64748B]">
          Solo está configurado el modo de fusión Normal. Los modos alternativos no se aplican al renderizado ni a la exportación.
        </p>
        <label className="block">
          <span className="mb-1 flex justify-between text-[10px] text-[#64748B]">
            <span>Opacidad del elemento</span>
            <span className="text-[#111827]">{opacity}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            disabled={Boolean(opacityUnavailableReason)}
            aria-describedby={opacityUnavailableReason ? 'opacity-unavailable-reason' : undefined}
            onChange={(event) => setOpacity(Number(event.target.value))}
            className="h-1.5 w-full accent-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
          />
          {opacityUnavailableReason && <span id="opacity-unavailable-reason" role="status" className="mt-1 block text-[9px] text-[#64748B]">{opacityUnavailableReason}</span>}
        </label>
      </Panel>
      <Effects/>
    </div>
  );
}

function LayersPanel({
  layers,
  selectedLayers,
  onSelect,
  onToggleLayer,
  onToggleLock,
  onDeleteLayer,
  onAddLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onBringLayerToFront,
  onSendLayerToBack,
  onDuplicateLayer,
}: {
  layers: DesignerWorkspaceLayer[];
  selectedLayers: string[];
  onSelect: (id: string, additive?: boolean) => void;
  onToggleLayer: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onAddLayer: () => void;
  onMoveLayerUp?: () => void;
  onMoveLayerDown?: () => void;
  onBringLayerToFront?: () => void;
  onSendLayerToBack?: () => void;
  onDuplicateLayer: () => void;
}) {
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    layerId: string;
  } | null>(null);
  const contextMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!contextMenu) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !contextMenuRef.current?.contains(event.target)
      ) {
        setContextMenu(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu]);

  const showLayerContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    layer: DesignerWorkspaceLayer,
  ) => {
    event.preventDefault();
    if (!selectedLayers.includes(layer.id)) onSelect(layer.id);
    const menuWidth = 196;
    const menuHeight = 284;
    setContextMenu({
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8)),
      layerId: layer.id,
    });
  };

  const contextLayer = contextMenu
    ? layers.find((layer) => layer.id === contextMenu.layerId)
    : undefined;
  const canEditContextLayer =
    contextLayer &&
    contextLayer.type !== "background" &&
    !contextLayer.locked;
  const runContextAction = (action: () => void) => {
    action();
    setContextMenu(null);
  };

  return (
    <div className="relative p-3">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">Orden de impresión</p>
        <div className="flex gap-1">
          <ActionIcon icon={ArrowUp} label="Subir capa" onClick={onMoveLayerUp}/>
          <ActionIcon icon={ArrowDown} label="Bajar capa" onClick={onMoveLayerDown}/>
          <ActionIcon icon={BringToFront} label="Traer al frente" onClick={onBringLayerToFront}/>
          <ActionIcon icon={Plus} label="Nueva capa" onClick={onAddLayer}/>
        </div>
      </div>
      <div className="space-y-1">
        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={(event) => onSelect(layer.id, event.shiftKey)}
            onContextMenu={(event) => showLayerContextMenu(event, layer)}
            className={cn(
              'group flex cursor-pointer items-center gap-2 rounded-[4px] border border-transparent px-2 py-2 hover:border-[#E2E8F0] hover:bg-[#F8FAFC]',
              selectedLayers.includes(layer.id) && 'border-[#BFDBFE] bg-[#EFF6FF]'
            )}
          >
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); onToggleLayer(layer.id); }}
              className={cn('text-[#64748B] hover:text-[#2563EB]', layer.visible && 'text-[#2563EB]')}
            >
              {layer.visible ? <Eye className="h-3.5 w-3.5"/> : <EyeOff className="h-3.5 w-3.5"/>}
            </button>
            <LayerThumb layer={layer}/>
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#334155]">{layer.name}</span>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); onToggleLock(layer.id); }}
              className="text-[#94A3B8] hover:text-[#64748B]"
            >
              {layer.locked ? <Lock className="h-3.5 w-3.5 text-[#2563EB]"/> : <Unlock className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100"/>}
            </button>
            <button
              type="button"
              title="Eliminar capa"
              onClick={(event) => { event.stopPropagation(); onDeleteLayer(layer.id); }}
              className="text-[#94A3B8] opacity-0 group-hover:opacity-100 hover:text-[#DC2626]"
            >
              <X className="h-3.5 w-3.5"/>
            </button>
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-[#E5E7EB] pt-3 text-[9px] leading-relaxed text-[#94A3B8]">
        Selecciona o interactúa directamente sobre el lienzo con el mouse. La selección y orden de impresión se sincronizan automáticamente.
      </p>
      {contextMenu && contextLayer && (
        <div
          ref={contextMenuRef}
          role="menu"
          aria-label={`Acciones de ${contextLayer.name}`}
          className="fixed z-50 min-w-48 rounded-lg border border-[#E2E8F0] bg-white p-1 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            type="button"
            role="menuitem"
            disabled={!canEditContextLayer}
            onClick={() => runContextAction(onDuplicateLayer)}
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Duplicar capa
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!canEditContextLayer}
            onClick={() => runContextAction(() => onDeleteLayer(contextLayer.id))}
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Eliminar capa
          </button>
          <div role="separator" className="my-1 border-t border-[#E2E8F0]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => runContextAction(() => onMoveLayerUp?.())}
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC]"
          >
            Traer adelante
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => runContextAction(() => onMoveLayerDown?.())}
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC]"
          >
            Enviar atrás
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() =>
              runContextAction(() => onBringLayerToFront?.())
            }
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC]"
          >
            Traer al frente
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() =>
              runContextAction(() => onSendLayerToBack?.())
            }
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC]"
          >
            Enviar al fondo
          </button>
          <div role="separator" className="my-1 border-t border-[#E2E8F0]" />
          <button
            type="button"
            role="menuitem"
            onClick={() =>
              runContextAction(() => onToggleLock(contextLayer.id))
            }
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC]"
          >
            {contextLayer.locked ? "Desbloquear capa" : "Bloquear capa"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() =>
              runContextAction(() => onToggleLayer(contextLayer.id))
            }
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#F8FAFC]"
          >
            {contextLayer.visible ? "Ocultar capa" : "Mostrar capa"}
          </button>
        </div>
      )}
    </div>
  );
}

function HistoryPanel() {
  return (
    <div className="p-3">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#111827]">
        <History className="h-4 w-4 text-[#2563EB]"/>Acciones recientes
      </div>
      {['Documento creado', 'Lienzo listo para manipular'].map((item, index) => (
        <div key={item} className={cn('border-l-2 px-3 py-2 text-[11px]', index === 0 ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1E3A8A]' : 'border-[#E2E8F0] text-[#64748B]')}>
          {item}
        </div>
      ))}
      <p className="mt-4 text-[10px] leading-relaxed text-[#94A3B8]">
        El historial Undo / Redo registra cada transformación completa realizada con el mouse.
      </p>
    </div>
  );
}

function LayerThumb({ layer }: { layer: DesignerWorkspaceLayer }) {
  if (layer.preview) return <img src={layer.preview} alt="" className="h-7 w-7 rounded-[3px] border border-[#E2E8F0] bg-white object-cover"/>;
  let Icon = ImageIcon;
  if (layer.type === 'text') Icon = Type;
  else if (layer.type === 'shape') {
    if (layer.shapeType === 'circle') Icon = Circle;
    else if (layer.shapeType === 'triangle') Icon = TriangleIcon;
    else if (layer.shapeType === 'line') Icon = Minus;
    else Icon = Square;
  } else if (layer.type === 'background') Icon = Circle;
  return <span className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-[#E2E8F0] bg-[#F8FAFC]"><Icon className="h-3.5 w-3.5 text-[#64748B]"/></span>;
}

function Effects() {
  return (
    <Panel title="Efectos">
      <p role="status" className="rounded border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[10px] leading-relaxed text-[#64748B]">
        Sombras, resplandor y borde no están configurados para guardarse y exportarse en el documento. No se aplican efectos simulados aquí.
      </p>
      <p className="text-[10px] leading-relaxed text-[#64748B]">
        El desenfoque de imagen está disponible en el menú Filtro.
      </p>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[#E5E7EB] pt-3 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-[11px] font-bold text-[#111827]">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] text-[#64748B]">{label}</span>
      <span className="flex h-7 items-center rounded-[4px] border border-[#E2E8F0] bg-white px-2 text-[11px] text-[#111827]">{value}</span>
    </label>
  );
}

function Select({ label, values, value, onChange }: { label: string; values: string[]; value?: string; onChange?: (value: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const current = value ?? values[0];
  return (
    <div className="relative">
      <span className="mb-1 block text-[10px] text-[#64748B]">{label}</span>
      <button type="button" onClick={() => setOpen(!open)} className="flex h-7 w-full items-center justify-between rounded-[4px] border border-[#E2E8F0] bg-white px-2 text-[11px] text-[#111827]">
        {current}<ChevronDown className="h-3 w-3"/>
      </button>
      {open && (
        <div className="absolute z-30 mt-1 max-h-44 w-full overflow-auto border border-[#E2E8F0] bg-white py-1 shadow-md">
          {values.map((item) => (
            <button key={item} type="button" onClick={() => { onChange?.(item); setOpen(false); }} className="block w-full px-2 py-1.5 text-left text-[11px] text-[#475569] hover:bg-[#F8FAFC]">
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionIcon({ icon: Icon, label, onClick, active = false }: { icon: React.ElementType; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button type="button" title={label} onClick={onClick} className={cn("flex h-7 min-w-7 items-center justify-center rounded-[4px] border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]", active && "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]")}>
      <Icon className="h-3.5 w-3.5"/>
    </button>
  );
}
