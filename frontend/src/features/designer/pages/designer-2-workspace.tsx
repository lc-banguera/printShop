import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  FlipHorizontal,
  FlipVertical,
  ImagePlus,
  Layers3,
  Lock,
  Maximize2,
  Minus,
  Move,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Type,
  Undo2,
  Unlock,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { getDesignResources } from '../services/design-resources';
import type { DesignResource } from '@/types/design-resource';
import { ProductViewer } from '../components/product-viewer';
import { useViewerStore } from '@/store/viewer-store';
import { useCanvasStore } from '@/store/canvas-store';
import { getDesigner2ProductModel } from '../data/designer-2-product-models';
import type { CanvasElement } from '@/types/canvas';

const tools = [
  { id: 'designs', label: 'Diseños', icon: Sparkles },
  { id: 'upload', label: 'Subir', icon: Upload },
  { id: 'text', label: 'Texto', icon: Type },
  { id: 'layers', label: 'Capas', icon: Layers3 },
  { id: 'produce', label: 'Producir', icon: ShoppingBag },
] as const;

const garmentColorNames = [
  'Blanco',
  'Negro',
  'Gris',
  'Rojo',
  'Naranja',
  'Amarillo',
  'Verde',
  'Celeste',
  'Azul',
  'Morado',
  'Rosado',
  'Marrón',
];

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
const printMethods = ['DTF', 'Sublimación', 'Vinilo', 'Serigrafía'];
const defaultArtworkFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  blur: 0,
};

const availableTextFonts = [
  { label: 'Inter', value: 'Inter, "Segoe UI", sans-serif' },
  { label: 'Segoe UI', value: '"Segoe UI", sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
] as const;

const availableTextWeights = [
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Black', value: '900' },
] as const;

interface Designer2WorkspaceProps {
  categoryId: string;
}

function createArtwork(
  id: string,
  name: string,
  image: string,
  activeZoneId: CanvasElement['zoneId'],
): CanvasElement {
  return {
    id,
    type: 'image',
    layer: 'user',
    zoneId: activeZoneId,
    x: 300,
    y: 270,
    width: 190,
    height: 190,
    image,
    originalImageSrc: image,
    name,
    opacity: 1,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  };
}

function createTextImage(value: string, config?: {
  size?: number;
  weight?: string | number;
  align?: 'left' | 'center' | 'right';
  color?: string;
  family?: string;
  letterSpacing?: number;
  lineHeight?: number;
}) {
  const canvas = document.createElement('canvas');
  const fontSize = config?.size ?? 52;
  const fontWeight = config?.weight ?? '700';
  const alignment = config?.align ?? 'center';
  const color = config?.color ?? '#18181b';
  const family = config?.family ?? 'Inter, "Segoe UI", sans-serif';
  const letterSpacing = config?.letterSpacing ?? 0;
  const lineHeightFactor = config?.lineHeight ?? 1.2;

  const safeText = value.trim() || 'Texto';
  const words = safeText.split(/\s+/);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('No se pudo preparar el texto para el producto.');
  }

  const widthPadding = 64;
  const maxLineWidth = 720;
  const baseFont = `${fontWeight} ${fontSize}px ${family}`;
  context.font = baseFont;

  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    const candidateWidth = context.measureText(candidate).width + ((candidate.length - 1) * Math.max(0, letterSpacing));
    if (currentLine && candidateWidth > maxLineWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  const lineHeight = fontSize * lineHeightFactor;
  const longestLineWidth = lines.reduce((maxWidth, line) => {
    context.font = baseFont;
    return Math.max(maxWidth, context.measureText(line).width + ((line.length - 1) * Math.max(0, letterSpacing)));
  }, 0);

  canvas.width = Math.max(220, Math.min(900, Math.ceil(longestLineWidth + widthPadding)));
  canvas.height = Math.max(120, Math.ceil((lines.length * lineHeight) + 52));

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = alignment;
  context.font = baseFont;

  const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((text, index) => {
    const startX = alignment === 'left' ? widthPadding / 2 : alignment === 'right' ? canvas.width - (widthPadding / 2) : canvas.width / 2;
    if (letterSpacing > 0) {
      const characters = Array.from(text);
      let offset = 0;
      const spacingBase = Math.max(0, letterSpacing);
      characters.forEach((character) => {
        const characterWidth = context.measureText(character).width;
        const x = alignment === 'left'
          ? startX + offset
          : alignment === 'right'
            ? startX - (context.measureText(text).width + ((characters.length - 1) * spacingBase)) + offset
            : startX - (context.measureText(text).width + ((characters.length - 1) * spacingBase)) / 2 + offset;
        context.fillText(character, x, startY + (index * lineHeight));
        offset += characterWidth + spacingBase;
      });
      return;
    }
    context.fillText(text, startX, startY + (index * lineHeight), canvas.width - widthPadding);
  });

  return {
    url: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
  };
}

function createTextLayer(
  id: string,
  name: string,
  value: string,
  config: {
    x?: number;
    y?: number;
    size?: number;
    weight?: string | number;
    align?: 'left' | 'center' | 'right';
    color?: string;
    family?: string;
    letterSpacing?: number;
    lineHeight?: number;
    opacity?: number;
  } = {},
): CanvasElement {
  const fontSize = config.size ?? 52;
  const rendered = createTextImage(value, {
    size: fontSize,
    weight: config.weight ?? '700',
    align: config.align ?? 'center',
    color: config.color ?? '#1f2937',
    family: config.family ?? availableTextFonts[0].value,
    letterSpacing: config.letterSpacing ?? 0,
    lineHeight: config.lineHeight ?? 1.2,
  });

  return {
    id,
    type: 'text',
    layer: 'user',
    zoneId: 'front',
    x: config.x ?? 300,
    y: config.y ?? 250,
    width: Math.max(180, rendered.width * 0.42),
    height: Math.max(90, rendered.height * 0.42),
    image: rendered.url,
    originalImageSrc: rendered.url,
    name: name || value.trim() || 'Texto',
    textContent: value.trim() || 'Texto',
    fontFamily: config.family ?? availableTextFonts[0].value,
    fontWeight: config.weight ?? '700',
    fontSize,
    textAlign: config.align ?? 'center',
    letterSpacing: config.letterSpacing ?? 0,
    lineHeight: config.lineHeight ?? 1.2,
    opacity: config.opacity ?? 1,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    visible: true,
  };
}

export function Designer2Workspace({ categoryId }: Designer2WorkspaceProps) {
  const model = getDesigner2ProductModel(categoryId);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadedUrls = useRef(new Set<string>());
  const [activeTool, setActiveTool] = useState<(typeof tools)[number]['id']>('designs');
  const [uploadedDesigns, setUploadedDesigns] = useState<DesignResource[]>([]);
  const [textValue, setTextValue] = useState('PRINTSHOP');
  const [textSize, setTextSize] = useState(52);
  const [textWeight, setTextWeight] = useState<string>('700');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textColor, setTextColor] = useState('#1f2937');
  const [textFontFamily, setTextFontFamily] = useState<string>(availableTextFonts[0].value);
  const [textLetterSpacing, setTextLetterSpacing] = useState(0);
  const [textLineHeight, setTextLineHeight] = useState(1.2);
  const [textOpacity, setTextOpacity] = useState(1);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  const [size, setSize] = useState('M');
  const [method, setMethod] = useState('DTF');
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryTab, setLibraryTab] = useState<'all' | 'printshop' | 'uploads'>('all');
  const resources = useMemo(() => getDesignResources(), []);

  const setActiveProduct = useViewerStore((state) => state.setActiveProduct);
  const zoom = useViewerStore((state) => state.zoom);
  const setZoom = useViewerStore((state) => state.setZoom);
  const requestFit = useViewerStore((state) => state.requestFit);
  const colors = useViewerStore((state) => state.garmentColors);
  const currentGarmentColor = useViewerStore((state) => state.currentGarmentColor);
  const materialBrightness = useViewerStore((state) => state.materialBrightness);
  const selectedColor = useViewerStore((state) => state.selectedColorIndex);
  const selectColor = useViewerStore((state) => state.selectGarmentColor);
  const setMaterialBrightness = useViewerStore((state) => state.setMaterialBrightness);
  const resetMaterialAppearance = useViewerStore((state) => state.resetMaterialAppearance);
  const showGrid = useViewerStore((state) => state.showGrid);
  const showGuides = useViewerStore((state) => state.showGuides);
  const setShowGrid = useViewerStore((state) => state.setShowGrid);
  const setShowGuides = useViewerStore((state) => state.setShowGuides);

  const addElement = useCanvasStore((state) => state.addElement);
  const updateElement = useCanvasStore((state) => state.updateElement);
  const removeElement = useCanvasStore((state) => state.removeElement);
  const selectElement = useCanvasStore((state) => state.selectElement);
  const duplicateElement = useCanvasStore((state) => state.duplicateElement);
  const reorderElement = useCanvasStore((state) => state.reorderElement);
  const toggleElementLock = useCanvasStore((state) => state.toggleElementLock);
  const toggleElementVisibility = useCanvasStore((state) => state.toggleElementVisibility);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);
  const allElements = useCanvasStore((state) => state.elements);
  const selectedElementId = useCanvasStore((state) => state.selectedElementId);
  const elements = useMemo(
    () => allElements.filter((element) => element.id.startsWith('designer-2-')),
    [allElements],
  );
  const selectedArtwork = elements.find((element) => element.id === selectedElementId);
  const modelArtwork = useMemo(
    () => elements.filter((element) => element.visible !== false),
    [elements],
  );
  const availableDesigns = useMemo(
    () => [...uploadedDesigns, ...resources],
    [resources, uploadedDesigns],
  );
  const filteredDesigns = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const list = libraryTab === 'uploads'
      ? uploadedDesigns
      : libraryTab === 'printshop'
        ? resources
        : availableDesigns;

    if (!query) return list;
    return list.filter((item) => item.name.toLowerCase().includes(query));
  }, [availableDesigns, libraryTab, resources, searchTerm, uploadedDesigns]);

  useEffect(() => {
    if (model) setActiveProduct(model);
  }, [model, setActiveProduct]);

  useEffect(
    () => () => {
      uploadedUrls.current.forEach((url) => URL.revokeObjectURL(url));
      uploadedUrls.current.clear();
    },
    [],
  );

  useEffect(() => {
    if (selectedElementId && !selectedElementId.startsWith('designer-2-')) {
      selectElement(null);
    }
  }, [selectedElementId, selectElement]);

  useEffect(() => {
    if (!selectedArtwork || selectedArtwork.type !== 'text') return;
    const nextTextValue = selectedArtwork.textContent ?? selectedArtwork.name ?? '';
    setTextValue(nextTextValue);
    setTextFontFamily(selectedArtwork.fontFamily ?? availableTextFonts[0].value);
    setTextWeight(String(selectedArtwork.fontWeight ?? '700'));
    setTextSize(selectedArtwork.fontSize ?? 52);
    setTextAlign(selectedArtwork.textAlign ?? 'center');
    setTextLetterSpacing(selectedArtwork.letterSpacing ?? 0);
    setTextLineHeight(selectedArtwork.lineHeight ?? 1.2);
    setTextOpacity(selectedArtwork.opacity ?? 1);
    setTextColor((selectedArtwork as CanvasElement & { fill?: string }).fill ?? '#1f2937');
    setActiveTool('text');
  }, [selectedArtwork]);

  if (!model) return null;

  const addImage = (image: string, name: string) => {
    const id = `designer-2-${Date.now()}`;
    addElement(createArtwork(id, name, image, 'front'));
    selectElement(id);
  };

  const handleUpload = (file?: File) => {
    setUploadError('');
    if (!file) return;
    const supportedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/svg+xml',
    ];
    const supportedExt = /\.(png|jpe?g|webp|svg)$/i;
    if (!supportedExt.test(file.name) && !supportedTypes.includes(file.type)) {
      setUploadError('Formatos admitidos: PNG, JPG, SVG y WebP.');
      return;
    }

    setUploading(true);
    const image = URL.createObjectURL(file);
    uploadedUrls.current.add(image);
    setUploadedDesigns((current) => [
      { id: `upload-${Date.now()}`, name: file.name, image, category: 'Subidos' },
      ...current,
    ]);
    addImage(image, file.name);
    setActiveTool('designs');
    window.setTimeout(() => setUploading(false), 350);
  };

  const addText = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const textContent = textValue.trim();
    if (!textContent) return;
    const id = `designer-2-${Date.now()}`;
    const element = createTextLayer(id, textContent, textContent, {
      x: 300,
      y: 270,
      size: textSize,
      weight: textWeight,
      align: textAlign,
      color: textColor,
      family: textFontFamily,
      letterSpacing: textLetterSpacing,
      lineHeight: textLineHeight,
      opacity: textOpacity,
    });

    addElement(element);
    selectElement(id);
    setTextValue(textContent);
    setActiveTool('text');
  };

  const moveArtwork = (id: string, x: number, y: number) => {
    updateElement(id, { x: Math.round(x), y: Math.round(y) });
  };

  const resizeArtwork = (width: number) => {
    if (!selectedArtwork) return;
    const aspectRatio = selectedArtwork.height / selectedArtwork.width;
    updateElement(selectedArtwork.id, {
      width,
      height: Math.round(width * aspectRatio),
    });
  };

  const centerArtwork = (id: string, width: number, height: number) => {
    updateElement(id, {
      x: Math.round(197 + (400 - width) / 2),
      y: Math.round(180 + (500 - height) / 2),
    });
  };

  const updateArtworkFilter = (key: keyof typeof defaultArtworkFilters, value: number) => {
    if (!selectedArtwork) return;
    updateElement(selectedArtwork.id, {
      filters: {
        ...defaultArtworkFilters,
        ...(selectedArtwork.filters ?? {}),
        [key]: value,
      },
    });
  };

  const resetArtworkFilter = () => {
    if (!selectedArtwork) return;
    updateElement(selectedArtwork.id, { filters: { ...defaultArtworkFilters } });
  };

  const formatArtworkFilterValue = (key: keyof typeof defaultArtworkFilters, value: number) => {
    if (key === 'blur') return `${value}px`;
    return `${value}%`;
  };

  const updateTextLayer = (layerId: string, patch: Partial<CanvasElement> & { textContent?: string; fontSize?: number; fontWeight?: string | number; textAlign?: 'left' | 'center' | 'right'; letterSpacing?: number; lineHeight?: number; fill?: string; opacity?: number; }) => {
    const layer = elements.find((element) => element.id === layerId && element.type === 'text');
    if (!layer) return;

    const nextTextValue = patch.textContent ?? layer.textContent ?? layer.name ?? 'Texto';
    const nextColor = patch.fill ?? layer.fill ?? textColor;
    const nextFontFamily = patch.fontFamily ?? layer.fontFamily ?? availableTextFonts[0].value;
    const nextFontWeight = patch.fontWeight ?? layer.fontWeight ?? '700';
    const nextFontSize = patch.fontSize ?? layer.fontSize ?? 52;
    const nextAlign = patch.textAlign ?? layer.textAlign ?? 'center';
    const nextLetterSpacing = patch.letterSpacing ?? layer.letterSpacing ?? 0;
    const nextLineHeight = patch.lineHeight ?? layer.lineHeight ?? 1.2;
    const nextOpacity = patch.opacity ?? layer.opacity ?? 1;

    const rendered = createTextImage(nextTextValue, {
      size: nextFontSize,
      weight: nextFontWeight,
      align: nextAlign,
      color: nextColor,
      family: nextFontFamily,
      letterSpacing: nextLetterSpacing,
      lineHeight: nextLineHeight,
    });

    updateElement(layerId, {
      ...patch,
      textContent: nextTextValue,
      fill: nextColor,
      fontFamily: nextFontFamily,
      fontWeight: nextFontWeight,
      fontSize: nextFontSize,
      textAlign: nextAlign,
      letterSpacing: nextLetterSpacing,
      lineHeight: nextLineHeight,
      opacity: nextOpacity,
      name: nextTextValue,
      image: rendered.url,
      originalImageSrc: rendered.url,
      width: Math.max(180, rendered.width * 0.42),
      height: Math.max(90, rendered.height * 0.42),
    });
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
      <header className="z-20 flex min-h-[72px] flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6">
       
        <div className="min-w-0 flex-1 border-l border-border pl-3 sm:pl-5">
          <p className="truncate text-sm font-semibold text-foreground">Camiseta Oversize Premium</p>
          <p className="text-xs text-foregroundSubtle">Diseñador 2 <span aria-hidden="true">·</span> Producto desde cero</p>
        </div>
        <div className="order-3 flex w-full items-center justify-end gap-2 border-t border-border pt-3 sm:order-none sm:w-auto sm:border-0 sm:pt-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2400);
            }}
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>{saved ? 'Guardado' : 'Guardar'}</span>
          </Button>
          <Button variant="secondary" size="sm" disabled title="Disponible cuando el diseño esté listo">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Descargar</span>
          </Button>
          <Button size="sm" disabled title="El siguiente paso se habilita al completar la configuración">
            Continuar
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-border bg-surface lg:w-[300px] lg:flex-row lg:border-b-0 lg:border-r">
          <nav
            aria-label="Herramientas de diseño"
            className="flex w-full shrink-0 items-center justify-around border-b border-border px-2 py-1.5 sm:justify-center sm:gap-2 lg:w-[72px] lg:flex-col lg:justify-start lg:border-b-0 lg:border-r lg:px-2 lg:py-3"
          >
            {tools.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTool(id)}
                aria-pressed={activeTool === id}
                className={`flex min-h-12 min-w-[64px] flex-col items-center justify-center gap-1 rounded-control px-2 text-[11px] font-medium transition-colors lg:min-w-0 lg:w-full ${activeTool === id ? 'bg-[var(--accent-muted)] text-primary' : 'text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground'}`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="min-h-[245px] min-w-0 flex-1 p-4 lg:min-h-0 lg:overflow-y-auto">
            {activeTool === 'designs' && (
              <section aria-labelledby="design-library-title">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 id="design-library-title" className="text-sm font-semibold">Mis diseños</h2>
                    <p className="mt-0.5 text-xs text-foregroundSubtle">Biblioteca de PrintShop y archivos subidos</p>
                  </div>
                  <span className="rounded-badge bg-surfaceMuted px-2 py-1 text-xs font-medium text-foregroundMuted">{availableDesigns.length}</span>
                </div>
                <div className="mb-3 flex items-center gap-2 rounded-control border border-border bg-surfaceMuted px-2 py-2">
                  <Search className="h-3.5 w-3.5 text-foregroundSubtle" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar diseño"
                    className="w-full bg-transparent text-xs text-foreground placeholder:text-foregroundSubtle focus:outline-none"
                  />
                </div>
                <div className="mb-3 flex gap-2 text-[11px]">
                  {['all', 'printshop', 'uploads'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setLibraryTab(tab as 'all' | 'printshop' | 'uploads')}
                      className={`border-none px-2.5 py-1.5 font-medium transition-colors ${libraryTab === tab ? 'bg-primary text-primaryForeground' : 'bg-surfaceMuted text-foregroundMuted'}`}
                    >
                      {tab === 'all' ? 'Todo' : tab === 'printshop' ? 'PrintShop' : 'Subidos'}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {filteredDesigns.map((resource) => (
                    <button
                      key={resource.id}
                      type="button"
                      onClick={() => addImage(resource.image, resource.name)}
                      className="group relative aspect-square overflow-hidden rounded-control border border-border bg-surfaceMuted p-1.5 transition-colors hover:border-primary focus-visible:outline-none"
                      title={`Colocar ${resource.name}`}
                    >
                      <img src={resource.image} alt={resource.name} className="h-full w-full object-contain" />
                      <span className="absolute inset-x-1 bottom-1 truncate rounded bg-surface/90 px-1 py-0.5 text-[9px] text-foregroundMuted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        {resource.name}
                      </span>
                    </button>
                  ))}
                </div>
                {filteredDesigns.length === 0 && (
                  <p className="py-8 text-center text-sm text-foregroundMuted">No hay diseños que coincidan con la búsqueda.</p>
                )}
                <p className="mt-3 flex items-center gap-1.5 text-xs leading-5 text-foregroundSubtle">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  Los diseños bloqueados conservan su restricción de licencia.
                </p>
              </section>
            )}

            {activeTool === 'upload' && (
              <section className="flex min-h-[230px] flex-col items-center justify-center text-center">
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    const file = event.dataTransfer.files?.[0];
                    handleUpload(file);
                  }}
                  className={`flex w-full flex-col items-center justify-center rounded-2xl border border-dashed p-4 text-center transition-colors ${isDragging ? 'border-primary bg-[var(--accent-muted)]' : 'border-border bg-surfaceMuted'}`}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-surface text-primary">
                    <ImagePlus className="h-5 w-5" />
                  </span>
                  <h2 className="mt-3 text-sm font-semibold">Subir diseño</h2>
                  <p className="mt-1 max-w-[250px] text-xs leading-5 text-foregroundMuted">
                    Arrastra archivos o selecciona una imagen para colocarlo sobre la camiseta.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[0.15em] text-foregroundSubtle">
                    <span>PNG</span>
                    <span>JPG</span>
                    <span>SVG</span>
                    <span>WEBP</span>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                    className="sr-only"
                    aria-label="Seleccionar archivo de imagen"
                    onChange={(event) => {
                      handleUpload(event.target.files?.[0]);
                      event.currentTarget.value = '';
                    }}
                  />
                  <Button className="mt-4" size="sm" onClick={() => inputRef.current?.click()}>
                    <Upload className="h-4 w-6" />
                    Seleccionar archivo
                  </Button>
                </div>
                {uploading && <p className="mt-3 text-xs text-foregroundSubtle">Preparando vista previa…</p>}
                {uploadError && <p role="alert" className="mt-3 text-xs text-danger">{uploadError}</p>}
              </section>
            )}

            {activeTool === 'text' && (
              <form onSubmit={addText} className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold">Texto profesional</h2>
                  <p className="mt-1 text-xs leading-5 text-foregroundMuted">Crea y ajusta tipografía sobre el producto en tiempo real.</p>
                </div>

                <label htmlFor="designer-2-text" className="block text-xs font-medium text-foregroundMuted">Texto</label>
                <textarea
                  id="designer-2-text"
                  rows={3}
                  value={selectedArtwork && selectedArtwork.type === 'text' ? (selectedArtwork.textContent ?? selectedArtwork.name ?? '') : textValue}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setTextValue(nextValue);
                    if (selectedArtwork && selectedArtwork.type === 'text') {
                      updateTextLayer(selectedArtwork.id, {
                        textContent: nextValue,
                        fill: textColor,
                        fontWeight: textWeight,
                        fontSize: textSize,
                        textAlign: textAlign,
                        fontFamily: textFontFamily,
                        letterSpacing: textLetterSpacing,
                        lineHeight: textLineHeight,
                        opacity: textOpacity,
                      });
                    }
                  }}
                  placeholder="Escribe tu texto"
                  className="w-full resize-y rounded-control border border-border bg-surface px-3 py-2 text-sm placeholder:text-foregroundSubtle focus-visible:outline-none"
                />

                <div className="space-y-3">
                  <div className="rounded-control border border-border bg-surfaceMuted p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-foregroundSubtle">Tipografía</p>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block text-[11px] font-medium text-foregroundMuted">
                        Fuente
                        <select
                          value={textFontFamily}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setTextFontFamily(nextValue);
                            if (selectedArtwork && selectedArtwork.type === 'text') {
                              updateTextLayer(selectedArtwork.id, { fontFamily: nextValue, fill: textColor, fontWeight: textWeight, fontSize: textSize, textAlign: textAlign, letterSpacing: textLetterSpacing, lineHeight: textLineHeight, opacity: textOpacity });
                            }
                          }}
                          className="mt-1 h-9 w-full rounded-control border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none"
                        >
                          {availableTextFonts.map((font) => (
                            <option key={font.value} value={font.value}>{font.label}</option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-[11px] font-medium text-foregroundMuted">
                        Peso
                        <select
                          value={textWeight}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setTextWeight(nextValue);
                            if (selectedArtwork && selectedArtwork.type === 'text') {
                              updateTextLayer(selectedArtwork.id, { fontWeight: nextValue, fill: textColor, fontFamily: textFontFamily, fontSize: textSize, textAlign: textAlign, letterSpacing: textLetterSpacing, lineHeight: textLineHeight, opacity: textOpacity });
                            }
                          }}
                          className="mt-1 h-9 w-full rounded-control border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none"
                        >
                          {availableTextWeights.map((weight) => (
                            <option key={weight.value} value={weight.value}>{weight.label}</option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-[11px] font-medium text-foregroundMuted">
                        Tamaño
                        <input
                          type="number"
                          min={16}
                          max={180}
                          value={textSize}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value) || 52;
                            setTextSize(nextValue);
                            if (selectedArtwork && selectedArtwork.type === 'text') {
                              updateTextLayer(selectedArtwork.id, { fontSize: nextValue, fill: textColor, fontWeight: textWeight, fontFamily: textFontFamily, textAlign: textAlign, letterSpacing: textLetterSpacing, lineHeight: textLineHeight, opacity: textOpacity });
                            }
                          }}
                          className="mt-1 h-9 w-full rounded-control border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none"
                        />
                      </label>

                      <label className="block text-[11px] font-medium text-foregroundMuted">
                        Color
                        <input
                          value={textColor}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setTextColor(nextValue);
                            if (selectedArtwork && selectedArtwork.type === 'text') {
                              updateTextLayer(selectedArtwork.id, { fill: nextValue, fontWeight: textWeight, fontFamily: textFontFamily, fontSize: textSize, textAlign: textAlign, letterSpacing: textLetterSpacing, lineHeight: textLineHeight, opacity: textOpacity });
                            }
                          }}
                          type="color"
                          className="mt-1 h-9 w-full rounded-control border border-border bg-surface p-1"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-control border border-border bg-surfaceMuted p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-foregroundSubtle">Párrafo</p>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block text-[11px] font-medium text-foregroundMuted">
                        Alineación
                        <select
                          value={textAlign}
                          onChange={(event) => {
                            const nextValue = event.target.value as 'left' | 'center' | 'right';
                            setTextAlign(nextValue);
                            if (selectedArtwork && selectedArtwork.type === 'text') {
                              updateTextLayer(selectedArtwork.id, { textAlign: nextValue, fill: textColor, fontWeight: textWeight, fontFamily: textFontFamily, fontSize: textSize, letterSpacing: textLetterSpacing, lineHeight: textLineHeight, opacity: textOpacity });
                            }
                          }}
                          className="mt-1 h-9 w-full rounded-control border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none"
                        >
                          <option value="left">Izquierda</option>
                          <option value="center">Centro</option>
                          <option value="right">Derecha</option>
                        </select>
                      </label>

                      <label className="block text-[11px] font-medium text-foregroundMuted">
                        Tracking
                        <input
                          type="number"
                          min={-6}
                          max={24}
                          step={0.5}
                          value={textLetterSpacing}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value) || 0;
                            setTextLetterSpacing(nextValue);
                            if (selectedArtwork && selectedArtwork.type === 'text') {
                              updateTextLayer(selectedArtwork.id, { letterSpacing: nextValue, fill: textColor, fontWeight: textWeight, fontFamily: textFontFamily, fontSize: textSize, textAlign: textAlign, lineHeight: textLineHeight, opacity: textOpacity });
                            }
                          }}
                          className="mt-1 h-9 w-full rounded-control border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none"
                        />
                      </label>

                      <label className="col-span-2 block text-[11px] font-medium text-foregroundMuted">
                        Interlineado
                        <input
                          type="number"
                          min={0.8}
                          max={2.2}
                          step={0.1}
                          value={textLineHeight}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value) || 1.2;
                            setTextLineHeight(nextValue);
                            if (selectedArtwork && selectedArtwork.type === 'text') {
                              updateTextLayer(selectedArtwork.id, { lineHeight: nextValue, fill: textColor, fontWeight: textWeight, fontFamily: textFontFamily, fontSize: textSize, textAlign: textAlign, letterSpacing: textLetterSpacing, opacity: textOpacity });
                            }
                          }}
                          className="mt-1 h-9 w-full rounded-control border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-control border border-border bg-surfaceMuted p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-foregroundSubtle">Apariencia</p>
                    <label className="block text-[11px] font-medium text-foregroundMuted">
                      Opacidad
                      <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={textOpacity}
                        onChange={(event) => {
                          const nextValue = Number(event.target.value);
                          setTextOpacity(nextValue);
                          if (selectedArtwork && selectedArtwork.type === 'text') {
                            updateTextLayer(selectedArtwork.id, { opacity: nextValue, fill: textColor, fontWeight: textWeight, fontFamily: textFontFamily, fontSize: textSize, textAlign: textAlign, letterSpacing: textLetterSpacing, lineHeight: textLineHeight });
                          }
                        }}
                        className="mt-2 block h-2 w-full accent-[var(--primary)]"
                      />
                    </label>
                  </div>
                </div>

                <Button size="sm" type="submit" disabled={!textValue.trim()} className="w-full">
                  <Plus className="h-4 w-4" />
                  Agregar texto
                </Button>
              </form>
            )}

            {activeTool === 'produce' && (
              <section className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold">Producir</h2>
                  <p className="mt-1 text-xs leading-5 text-foregroundMuted">Revisa la vista previa final del producto y prepara la entrega para impresión o producción.</p>
                </div>
                <div className="rounded-control border border-border bg-surfaceMuted p-3">
                  <div className="flex items-center justify-between text-xs text-foregroundMuted">
                    <span>Producto</span>
                    <span className="font-medium text-foreground">Camiseta Oversize Premium</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-foregroundMuted">
                    <span>Talla</span>
                    <span className="font-medium text-foreground">{size}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-foregroundMuted">
                    <span>Método</span>
                    <span className="font-medium text-foreground">{method}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-foregroundMuted">
                    <span>Diseños</span>
                    <span className="font-medium text-foreground">{elements.length}</span>
                  </div>
                </div>
                <Button type="button" className="w-full" disabled title="La exportación real se habilita cuando el flujo de producción esté conectado.">
                  <ShoppingBag className="h-4 w-4" />
                  Preparar producción
                </Button>
              </section>
            )}

            {activeTool === 'layers' && (
              <section>
                <h2 className="text-sm font-semibold">Capas</h2>
                <p className="mt-1 text-xs leading-5 text-foregroundMuted">Controla orden, visibilidad y bloqueo de cada elemento del diseño.</p>
                <div className="mt-3 space-y-2">
                  {elements.length === 0 && (
                    <p className="rounded-control border border-dashed border-border bg-surfaceMuted px-3 py-4 text-center text-xs text-foregroundMuted">
                      Aún no hay elementos sobre la camiseta.
                    </p>
                  )}
                  {elements.map((element, index) => (
                    <div
                      key={element.id}
                      className={`flex items-center gap-2 rounded-control border px-2 py-2 transition-colors ${selectedElementId === element.id ? 'border-primary bg-[var(--accent-muted)]' : 'border-border bg-surfaceMuted'}`}
                    >
                      <button type="button" onClick={() => selectElement(element.id)} className="min-w-0 flex-1 text-left">
                        <div className="truncate text-xs font-medium text-foreground">{element.name || 'Elemento'}</div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-foregroundSubtle">{element.type}</div>
                      </button>
                      <div className="flex items-center gap-1">
                        <button type="button" aria-label={element.visible === false ? 'Mostrar elemento' : 'Ocultar elemento'} onClick={() => toggleElementVisibility(element.id)} className="grid h-7 w-7 place-items-center rounded-control text-foregroundMuted hover:bg-surface hover:text-foreground">
                          {element.visible === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button type="button" aria-label={element.locked ? 'Desbloquear elemento' : 'Bloquear elemento'} onClick={() => toggleElementLock(element.id)} className="grid h-7 w-7 place-items-center rounded-control text-foregroundMuted hover:bg-surface hover:text-foreground">
                          {element.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                        </button>
                        <button type="button" aria-label="Subir capa" onClick={() => reorderElement(element.id, 'up')} disabled={index === elements.length - 1} className="grid h-7 w-7 place-items-center rounded-control text-foregroundMuted hover:bg-surface hover:text-foreground disabled:opacity-30">
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" aria-label="Bajar capa" onClick={() => reorderElement(element.id, 'down')} disabled={index === 0} className="grid h-7 w-7 place-items-center rounded-control text-foregroundMuted hover:bg-surface hover:text-foreground disabled:opacity-30">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" aria-label="Eliminar capa" onClick={() => { removeElement(element.id); if (selectedElementId === element.id) selectElement(null); }} className="grid h-7 w-7 place-items-center rounded-control text-foregroundMuted hover:bg-danger-muted hover:text-danger">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>

        <main className="flex min-h-[430px] min-w-0 flex-1 flex-col bg-surfaceMuted p-3 sm:p-5 lg:min-h-0">
          <div className="relative h-[min(72vh,860px)] min-h-[420px] flex-1 overflow-hidden rounded-card border border-border bg-surface">
            <div className="absolute inset-0">
              <ProductViewer
                artwork={modelArtwork}
                selectedArtworkId={selectedElementId?.startsWith('designer-2-') ? selectedElementId : null}
                onSelectArtwork={selectElement}
                onMoveArtwork={moveArtwork}
                showPrintArea
                showSelection
              />
            </div>
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 rounded-control border border-border bg-surface/95 p-1 shadow-subtle">
              <button type="button" aria-label="Deshacer último cambio" onClick={undo} disabled={!elements.length} className="grid h-9 w-9 place-items-center rounded-control text-foregroundMuted transition-colors hover:bg-surfaceMuted hover:text-foreground disabled:opacity-40">
                <Undo2 className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Rehacer cambio" onClick={redo} disabled={!elements.length} className="grid h-9 w-9 place-items-center rounded-control text-foregroundMuted transition-colors hover:bg-surfaceMuted hover:text-foreground disabled:opacity-40">
                <Redo2 className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center text-xs font-medium tabular-nums">{Math.round(zoom * 100)}%</span>
              <button type="button" aria-label="Reducir zoom" onClick={() => setZoom((value) => Math.max(0.35, value - 0.1))} className="grid h-9 w-9 place-items-center rounded-control text-foregroundMuted transition-colors hover:bg-surfaceMuted hover:text-foreground">
                <Minus className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Aumentar zoom" onClick={() => setZoom((value) => Math.min(2.5, value + 0.1))} className="grid h-9 w-9 place-items-center rounded-control text-foregroundMuted transition-colors hover:bg-surfaceMuted hover:text-foreground">
                <Plus className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Ajustar vista del modelo" onClick={requestFit} className="grid h-9 w-9 place-items-center rounded-control text-foregroundMuted transition-colors hover:bg-surfaceMuted hover:text-foreground">
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={showGuides ? 'Ocultar guías de impresión' : 'Mostrar guías de impresión'}
                onClick={() => setShowGuides(!showGuides)}
                className={`grid h-9 w-9 place-items-center rounded-control text-xs font-semibold transition-colors ${showGuides ? 'bg-[var(--accent-muted)] text-primary' : 'text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground'}`}
                title="Guías de impresión"
              >
                G
              </button>
              <button
                type="button"
                aria-label={showGrid ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}
                onClick={() => setShowGrid(!showGrid)}
                className={`grid h-9 w-9 place-items-center rounded-control text-xs font-semibold transition-colors ${showGrid ? 'bg-[var(--accent-muted)] text-primary' : 'text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground'}`}
                title="Cuadrícula"
              >
                ⊞
              </button>
            </div>

            {selectedArtwork && (
              <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-surface/95 px-2 py-1.5 shadow-subtle">
                <button type="button" onClick={() => centerArtwork(selectedArtwork.id, selectedArtwork.width, selectedArtwork.height)} className="grid h-8 w-8 place-items-center rounded-full text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground" title="Centrar diseño">
                  <Move className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => updateElement(selectedArtwork.id, { width: Math.min(320, Math.max(80, selectedArtwork.width + 12)), height: Math.min(320, Math.max(80, selectedArtwork.height + 12)) })} className="grid h-8 w-8 place-items-center rounded-full text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground" title="Aumentar tamaño">
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => updateElement(selectedArtwork.id, { rotation: (selectedArtwork.rotation ?? 0) + 15 })} className="grid h-8 w-8 place-items-center rounded-full text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground" title="Rotar 15°">
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => duplicateElement(selectedArtwork.id)} className="grid h-8 w-8 place-items-center rounded-full text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground" title="Duplicar diseño">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => updateElement(selectedArtwork.id, { scaleX: (selectedArtwork.scaleX ?? 1) * -1 })} className="grid h-8 w-8 place-items-center rounded-full text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground" title="Voltear horizontal">
                  <FlipHorizontal className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => updateElement(selectedArtwork.id, { scaleY: (selectedArtwork.scaleY ?? 1) * -1 })} className="grid h-8 w-8 place-items-center rounded-full text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground" title="Voltear vertical">
                  <FlipVertical className="h-3.5 w-3.5" />
                </button>
                <label className="flex items-center gap-1 rounded-full border border-border bg-surfaceMuted px-2 py-1 text-[10px] font-medium text-foregroundMuted" title="Opacidad">
                  <span>O</span>
                  <input
                    type="range"
                    min={0.2}
                    max={1}
                    step={0.05}
                    value={selectedArtwork.opacity ?? 1}
                    onChange={(event) => updateElement(selectedArtwork.id, { opacity: Number(event.target.value) })}
                    className="h-1.5 w-16 accent-[var(--primary)]"
                  />
                </label>
                <button type="button" onClick={() => toggleElementLock(selectedArtwork.id)} className="grid h-8 w-8 place-items-center rounded-full text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground" title={selectedArtwork.locked ? 'Desbloquear capa' : 'Bloquear capa'}>
                  {selectedArtwork.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                </button>
                <button type="button" onClick={() => toggleElementVisibility(selectedArtwork.id)} className="grid h-8 w-8 place-items-center rounded-full text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground" title={selectedArtwork.visible === false ? 'Mostrar capa' : 'Ocultar capa'}>
                  {selectedArtwork.visible === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button type="button" onClick={() => { removeElement(selectedArtwork.id); selectElement(null); }} className="grid h-8 w-8 place-items-center rounded-full text-foregroundMuted hover:bg-danger-muted hover:text-danger" title="Eliminar diseño">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </main>

        <aside className="shrink-0 border-t border-border bg-surface p-4 sm:p-5 lg:w-[330px] lg:overflow-y-auto lg:border-l lg:border-t-0">
          <div className="flex items-center gap-3 pb-4">
            <img src={model.thumbnail} alt="" className="h-14 w-14 shrink-0 rounded-control bg-surfaceMuted object-contain p-1" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold leading-5">Camiseta Oversize Premium</h2>
              <p className="mt-1 text-xs text-foregroundMuted">Algodón 100% <span aria-hidden="true">·</span> 180 GSM</p>
            </div>
          </div>

          <div className="divide-y divide-border border-y border-border">
            <section className="space-y-3 py-4">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="garment-color" className="block text-xs font-semibold">Apariencia de prenda</label>
                <button type="button" onClick={resetMaterialAppearance} className="text-[11px] font-medium text-primary hover:underline">Restaurar</button>
              </div>

              <div className="flex flex-wrap gap-2">
                {colors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    type="button"
                    aria-label={`Seleccionar ${garmentColorNames[index] ?? `Color ${index + 1}`}`}
                    onClick={() => selectColor(index)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform ${selectedColor === index ? 'scale-110 border-foreground' : 'border-border'}`}
                    style={{ backgroundColor: color }}
                    title={garmentColorNames[index] ?? `Color ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-control border border-border bg-surfaceMuted px-3 py-2">
                <span className="h-5 w-5 rounded-full border border-borderStrong" style={{ backgroundColor: currentGarmentColor }} />
                <input
                  id="garment-color"
                  type="color"
                  value={currentGarmentColor}
                  onChange={(event) => {
                    const nextColor = event.target.value;
                    const nextIndex = colors.findIndex((color) => color.toLowerCase() === nextColor.toLowerCase());
                    if (nextIndex >= 0) {
                      selectColor(nextIndex);
                    } else {
                      const customIndex = Math.min(colors.length - 1, selectedColor);
                      const nextColors = [...colors];
                      nextColors[customIndex] = nextColor;
                      const customColorValue = nextColors[customIndex];
                      const customColorMap = new Map(colors.map((color, index) => [color.toLowerCase(), index]));
                      if (!customColorMap.has(nextColor.toLowerCase())) {
                        useViewerStore.getState().updateGarmentColor(customIndex, customColorValue);
                      }
                    }
                  }}
                  className="h-8 w-11 cursor-pointer rounded border border-border bg-transparent p-0"
                />
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-foregroundSubtle">{currentGarmentColor}</span>
              </div>

              <label className="block text-[11px] text-foregroundMuted">
                Intensidad
                <div className="mt-2 flex items-center gap-2">
                  <input
                    min="0.7"
                    max="1.4"
                    step="0.01"
                    value={materialBrightness}
                    onChange={(event) => setMaterialBrightness(Number(event.target.value))}
                    type="range"
                    className="h-2 w-full accent-[var(--primary)]"
                  />
                  <span className="w-10 text-right text-[10px] font-medium text-foreground">{materialBrightness.toFixed(2)}</span>
                </div>
              </label>
            </section>

            <section className="space-y-2.5 py-4">
              <label htmlFor="garment-size" className="block text-xs font-semibold">Talla</label>
              <select id="garment-size" value={size} onChange={(event) => setSize(event.target.value)} className="h-10 w-full rounded-control border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none">
                {sizes.map((item) => <option key={item}>{item}</option>)}
              </select>
            </section>

            <section className="space-y-2.5 py-4">
              <label htmlFor="print-method" className="block text-xs font-semibold">Método de impresión</label>
              <select id="print-method" value={method} onChange={(event) => setMethod(event.target.value)} className="h-10 w-full rounded-control border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none">
                {printMethods.map((item) => <option key={item}>{item}</option>)}
              </select>
            </section>
          </div>

          {selectedArtwork && (
            <section className="space-y-3 border-b border-border py-4" aria-labelledby="selected-artwork-heading">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 id="selected-artwork-heading" className="text-xs font-semibold">Diseño seleccionado</h3>
                  <p className="mt-1 truncate text-xs text-foregroundSubtle">{selectedArtwork.name}</p>
                </div>
                <button type="button" aria-label="Quitar diseño seleccionado" onClick={() => { removeElement(selectedArtwork.id); selectElement(null); }} className="grid h-8 w-8 shrink-0 place-items-center rounded-control text-foregroundSubtle transition-colors hover:bg-danger-muted hover:text-danger">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <label className="block text-[11px] text-foregroundMuted">
                Nombre de capa
                <input
                  value={selectedArtwork.name ?? ''}
                  onChange={(event) => updateElement(selectedArtwork.id, { name: event.target.value || 'Elemento' })}
                  className="mt-2 h-9 w-full rounded-control border border-border bg-surface px-2.5 text-sm text-foreground focus-visible:outline-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-foregroundMuted">
                <label className="block">
                  Tamaño
                  <input min="60" max="320" value={selectedArtwork.width} onChange={(event) => resizeArtwork(Number(event.target.value))} type="range" className="mt-2 block h-2 w-full accent-[var(--primary)]" />
                </label>
                <label className="block">
                  Opacidad
                  <input min="0.2" max="1" step="0.05" value={selectedArtwork.opacity ?? 1} onChange={(event) => updateElement(selectedArtwork.id, { opacity: Number(event.target.value) })} type="range" className="mt-2 block h-2 w-full accent-[var(--primary)]" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-foregroundMuted">
                <label className="block">
                  Escala X
                  <input min="0.3" max="2" step="0.1" value={selectedArtwork.scaleX ?? 1} onChange={(event) => updateElement(selectedArtwork.id, { scaleX: Number(event.target.value) })} type="range" className="mt-2 block h-2 w-full accent-[var(--primary)]" />
                </label>
                <label className="block">
                  Escala Y
                  <input min="0.3" max="2" step="0.1" value={selectedArtwork.scaleY ?? 1} onChange={(event) => updateElement(selectedArtwork.id, { scaleY: Number(event.target.value) })} type="range" className="mt-2 block h-2 w-full accent-[var(--primary)]" />
                </label>
              </div>

              <label className="block text-[11px] text-foregroundMuted">
                Rotación
                <input min="-180" max="180" value={selectedArtwork.rotation ?? 0} onChange={(event) => updateElement(selectedArtwork.id, { rotation: Number(event.target.value) })} type="range" className="mt-2 block h-2 w-full accent-[var(--primary)]" />
              </label>

              {selectedArtwork.type === 'image' && (
                <div className="rounded-control border border-border bg-surfaceMuted p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foregroundMuted">Ajustes no destructivos</h4>
                    <button type="button" onClick={resetArtworkFilter} className="text-[10px] font-medium text-primary hover:underline">Original</button>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      ['brightness', 'Brillo', 0, 200],
                      ['contrast', 'Contraste', 0, 200],
                      ['saturation', 'Saturación', 0, 200],
                      ['grayscale', 'Grises', 0, 100],
                      ['sepia', 'Sepia', 0, 100],
                      ['invert', 'Invertir', 0, 100],
                      ['blur', 'Desenfoque', 0, 12],
                    ].map(([key, label, min, max]) => (
                      <label key={key} className="block text-[10px] font-medium text-foregroundMuted">
                        <span className="flex items-center justify-between">
                          <span>{label}</span>
                          <span>{formatArtworkFilterValue(key as keyof typeof defaultArtworkFilters, selectedArtwork.filters?.[key as keyof typeof defaultArtworkFilters] ?? defaultArtworkFilters[key as keyof typeof defaultArtworkFilters])}</span>
                        </span>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={selectedArtwork.filters?.[key as keyof typeof defaultArtworkFilters] ?? defaultArtworkFilters[key as keyof typeof defaultArtworkFilters]}
                          onChange={(event) => updateArtworkFilter(key as keyof typeof defaultArtworkFilters, Number(event.target.value))}
                          className="mt-1.5 block h-2 w-full accent-[var(--primary)]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="pt-4">
            <h3 className="text-xs font-semibold text-foregroundMuted">Resumen del producto</h3>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span>Producto base</span>
              <strong className="font-semibold">$ 49.900</strong>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
              <span>Total estimado</span>
              <span>$ 49.900</span>
            </div>
          </section>
        </aside>
      </div>

      {saved && (
        <div role="status" className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-control bg-foreground px-4 py-3 text-sm font-medium text-primaryForeground shadow-elevated">
          <Check className="h-4 w-4" />
          Proyecto guardado en esta sesión
        </div>
      )}
    </div>
  );
}
