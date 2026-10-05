# CURRENT_EDITOR_INVENTORY.md
# PrintShop — Inventario Real del Estado de los Editores

**Versión:** 0.1.0  
**Basada en:** Inspección directa de código — rama `feat/design-platform-foundation`  
**Última actualización:** 2026-10-05

> **ADVERTENCIA**: Este documento describe el estado REAL del código, no la arquitectura deseada.  
> Las marcas UNKNOWN no deben interpretarse como "no existe", sino como "no pudo verificarse".

---

## 1. DESIGNER 2 (Builder) — Estado: IMPLEMENTED (parcial)

### 1.1 Entry Points

| Ruta | Componente | Estado |
|---|---|---|
| `/designer/new` | `DesignerBuilderPage` | ✅ IMPLEMENTED |
| `/designer/new?product=camisetas` | `Designer2Workspace` (via `DesignerBuilderPage`) | ✅ IMPLEMENTED |

### 1.2 Componentes

| Componente | Archivo | Función | Estado |
|---|---|---|---|
| `DesignerBuilderPage` | `pages/designer-builder-page.tsx` (226L) | Selección de producto por categoría | ✅ |
| `Designer2Workspace` | `pages/designer-2-workspace.tsx` (1248L) | Workspace principal con panel izquierdo, visor 3D, panel derecho, inline controls | ✅ |
| `CanvasArea` | `components/canvas.tsx` (337L) | Stage Konva 2D con drag & drop, toolbar de acciones, zoom | ✅ |
| `CanvasElements` | `components/canvas-elements.tsx` | Renderizado de CanvasElement (image, text, shapes) | ✅ |
| `CanvasSelection` | `components/canvas-selection.tsx` | Konva Transformer para selección y resize | ✅ |
| `CanvasOverlay` | `components/canvas-overlay/canvas-overlay.tsx` | Overlay HTML sobre el canvas Konva | ✅ |
| `LeftSidebar` | `components/left-sidebar.tsx` (214L) | Barra lateral izquierda con módulos: plantillas, texto, imágenes, IA, logos, stickers, formas, bordado, QR, capas | ✅ (UI) |
| `RightSidebar` | `components/right-sidebar.tsx` (226L) | Propiedades del elemento seleccionado + panel de capas | ✅ (UI) |
| `BottomPanel` | `components/bottom-panel.tsx` (148L) | Color de prenda, talla, método, acciones de producción | ✅ (UI) |
| `ProductViewer` | `components/product-viewer/product-viewer.tsx` | Wrapper del SceneController | ✅ |
| `SceneController` | `components/product-viewer/scene-controller.tsx` | Canvas Three.js con luces, grids, guides | ✅ |
| `CameraController` | `components/product-viewer/camera-controller.tsx` | OrbitControls y fit-to-view | ✅ |
| `ProductPivot` | `components/product-viewer/product-pivot.tsx` | Rotación del modelo por zona + color applier | ✅ |
| `ProductModel` | `components/product-viewer/product-model.tsx` | Carga GLB con useGLTF | ✅ |
| `ArtworkDecals` | `components/product-viewer/artwork-decals.tsx` (357L) | Proyección de CanvasElement como Decals 3D | ✅ |
| `PrintableAreaManager` | `components/printable-area/printable-area-manager.tsx` | Muestra/oculta el área imprimible en 2D | ✅ |

### 1.3 Stores consumidos

- `useCanvasStore` — elementos, selección, historial
- `useViewerStore` — producto activo, zona, zoom, color prenda

### 1.4 Hooks

| Hook | Archivo | Función |
|---|---|---|
| `useCanvasSize` | `hooks/use-canvas-size.ts` | Calcula dimensiones del contenedor del canvas |
| `useCanvasDrag` | `hooks/use-canvas-drag.ts` | Lógica de arrastre de elementos en el canvas |
| `useCanvasSelection` | `hooks/use-canvas-selection.ts` | Manejo de selección (wraps canvasStore) |
| `useActiveTool` | `hooks/use-active-tool.ts` | Herramienta activa actual |

### 1.5 Servicios / Data

| Archivo | Función |
|---|---|
| `services/canvas-config.ts` | Configuración del artboard (dimensiones, layers, printable area hardcoded) |
| `services/tools-config.ts` | Definición estática de herramientas |
| `services/design-resources.ts` | Carga dinámica de imágenes desde `src/resources/designs/` |
| `data/designer-2-product-models.ts` | Registry de productos habilitados (solo camiseta) |

### 1.6 Funcionalidad real implementada en Designer 2

✅ Selección de producto por categoría  
✅ Navegación al workspace al seleccionar camiseta  
✅ Viewer 3D con modelo GLB de camiseta  
✅ Orbit libre (sin restricción de zonas)  
✅ Zoom 3D  
✅ Reset de vista (doble clic)  
✅ Guides y grid en 3D (toggle)  
✅ Artwork como Decals 3D sobre el modelo  
✅ Panel izquierdo con tabs: Diseños, Subir, Texto, Capas, Producir  
✅ Biblioteca de diseños con búsqueda (filtro por nombre)  
✅ Tabs de biblioteca: Todos, PrintShop, Mis subidas  
✅ Upload de imagen (click + drag & drop)  
✅ Validación de tipo y tamaño de archivo (PNG/JPG/WebP/SVG, max 5MB)  
✅ Text tool con canvas rasterizado  
✅ Font, weight, size, color, align, letter-spacing, line-height  
✅ Opacity del texto  
✅ Panel de capas: listar elementos, ocultar/mostrar, bloquear, reordenar, eliminar  
✅ Controles de transformación: mover, escalar, rotar, flip H/V  
✅ Alineación: izq, centro, der, arriba, medio, abajo  
✅ Opacidad del elemento seleccionado  
✅ Undo / Redo (sistema de snapshots)  
✅ Color de prenda (12 colores preset + custom)  
✅ Material brightness (slider)  
✅ Talla (S/M/L/XL/XXL)  
✅ Método de impresión (DTF/Sublimación/Vinilo/Serigrafía)  
✅ Guardar (botón existe — sin persistencia backend)  
✅ Descargar (botón existe — sin implementación real)  
✅ Artículo al carrito (botón existe — sin integración orders real)

### 1.7 Funcionalidad parcial o con limitaciones

🟡 **Redo**: avanza el índice pero la reconstrucción del estado futuro tiene limitaciones  
🟡 **groupSelectedElements / ungroupSelectedElements**: implementados en el store pero eliminan el elemento en vez de agrupar correctamente  
🟡 **Guardar**: UI presente, sin backend  
🟡 **Descargar**: botón presente, sin exportación real de alta resolución  
🟡 **Producir**: tab existe, sin integración real con órdenes  
🟡 **"IA Generar"**: botón en sidebar izquierdo, sin funcionalidad  
🟡 **Shapes**: en sidebar izquierdo (Formas), sin interacción funcional para crear formas en canvas

### 1.8 Funcionalidad ausente (NOT IMPLEMENTED)

❌ Persistencia en IndexedDB o backend  
❌ Exportación de alta resolución  
❌ Command System formal (undo/redo se basa en snapshots)  
❌ Tool Registry formal con ciclo de vida  
❌ Sincronización de printable area entre 2D y 3D  
❌ SafeArea y Bleed  
❌ AI processing (background removal, enhancement)  
❌ Motor de producción (CMYK, preflight)  
❌ Autosave

---

## 2. DESIGNER 3 EASY — Estado: PARTIAL (UI only)

### 2.1 Entry Point

| Ruta | Componente | Estado |
|---|---|---|
| `/designer/easy` | `DesignerEasyModePage` | ✅ IMPLEMENTED (UI) |

### 2.2 Componentes

| Componente | Archivo | Función | Estado |
|---|---|---|---|
| `DesignerEasyModePage` | `pages/designer-easy-mode-page.tsx` (209L) | Página completa del modo fácil | ✅ (UI) |

### 2.3 Funcionalidad real

✅ Upload de imagen (click sobre botón)  
✅ Vista antes/después con CSS filters  
✅ Selección de preset: DTF, serigrafía, vinilo, sublimación  
✅ Toggle mostrar/ocultar comparación  
✅ Navegación a modo avanzado (`/designer/advanced`)  
✅ Botón "Guardar" (sin backend)

### 2.4 Funcionalidad simulada (UI sin backend)

🎭 "Eliminar fondo" — botón clickeable sin funcionalidad  
🎭 "Mejorar contraste" — botón clickeable sin funcionalidad  
🎭 "Exportar" — botón clickeable sin funcionalidad  
🎭 "Aplicar" — aplica preset visualmente con CSS filters (no procesamiento real)  
🎭 "Fondo eliminado / Semitransparencias / Semitono / Color mejorado" — indicadores verdes hardcoded, no reflejan estado real

### 2.5 Funcionalidad ausente

❌ Procesamiento de imagen real (Python backend)  
❌ Background removal real  
❌ Export de alta resolución  
❌ Persistencia

---

## 3. DESIGNER 3 ADVANCED — Estado: UNKNOWN

### 3.1 Entry Point

| Ruta | Componente | Estado |
|---|---|---|
| `/designer/advanced` | DESCONOCIDO | ❓ UNKNOWN |

El `DesignerHubPage` define la ruta `/designer/advanced`. Sin embargo, **no se encontró un componente correspondiente** en `designer/pages/` durante la inspección.

**Posibilidades**:
- El componente existe en otra ubicación no inspeccionada
- La ruta redirige a un 404
- El componente está en un directorio compartido

**Acción requerida**: verificar las rutas registradas en el router antes de implementar.

---

## 4. DESIGNER 1 (Personalizer) — Estado: UNKNOWN

### 4.1 Entry Point

| Ruta | Componente | Estado |
|---|---|---|
| `/designer/personalize` | DESCONOCIDO | ❓ UNKNOWN |

El `DesignerHubPage` define la ruta `/designer/personalize`. No se encontró componente correspondiente en inspección.

**Acción requerida**: verificar las rutas registradas en el router antes de implementar Designer 1.

---

## 5. DESIGNER HUB — Estado: IMPLEMENTED

| Ruta | Componente | Estado |
|---|---|---|
| `/designer` | `DesignerHubPage` | ✅ IMPLEMENTED |

Muestra tarjetas de los tres diseñadores con links a sus rutas. Los links están presentes aunque algunas rutas destino pueden no tener componentes.

---

## 6. Infraestructura Compartida

### 6.1 Canvas (Konva)

| Componente | Estado | Notas |
|---|---|---|
| Konva Stage | ✅ | `canvas.tsx` |
| Konva Layer rendering | ✅ | `canvas-elements.tsx` |
| Konva Transformer | ✅ | `canvas-selection.tsx` |
| Printable area guide | ✅ | `printable-area-manager.tsx` |
| Drag & drop de imágenes | ✅ | `canvas.tsx` |
| Canvas overlay HTML | ✅ | `canvas-overlay.tsx` |

### 6.2 Three.js

| Componente | Estado | Notas |
|---|---|---|
| @react-three/fiber Canvas | ✅ | `scene-controller.tsx` |
| @react-three/drei Environment | ✅ | preset "studio" |
| @react-three/drei Decal | ✅ | `artwork-decals.tsx` |
| @react-three/drei Line | ✅ | para guías |
| useGLTF | ✅ | `product-model.tsx` |
| useTexture | ✅ | `artwork-decals.tsx` |
| OrbitControls | ✅ | `camera-controller.tsx` |
| Fit-to-view | ✅ | bounding box auto-fit |
| Luces | ✅ | ambientLight, hemisphereLight, directionalLight |
| Sombras | ✅ | castShadow, shadow-mapSize 2048 |

### 6.3 Stores

| Store | Estado | Limitaciones |
|---|---|---|
| `canvasStore` | ✅ | groupSelected/ungroupSelected implementados incorrectamente |
| `viewerStore` | ✅ | Sin limitaciones críticas identificadas |
| `toolsStore` | ✅ (básico) | Solo activa/desactiva tool por ID, sin ciclo de vida |

### 6.4 APIs / Backend

No existe ninguna API de diseño implementada en el backend. Todo el estado es local (en memoria del navegador / React).

---

## 7. Assets del Designer

| Recurso | Ruta | Contenido | Usado por |
|---|---|---|---|
| Diseños de biblioteca | `src/resources/designs/` | 28 imágenes (img1-28, jpg/png) | Designer 2 Left Sidebar |
| GLB camiseta | `src/resources/mockup/t_shirt.glb` | 33 MB, modelo 3D funcional | Designer 2 (Three.js) |
| Mockup camiseta | `src/resources/mockup/t-shirt-mockup.png` | Imagen 2D plana | ProductDefinition thumbnail/preview |
| Mockups varios | `src/resources/mockup/` | bolso, cuadro, gorra, hoddie, tazas (sin GLB) | No usados en Designer 2 actualmente |

---

*Documento creado en FASE 0 — Design Platform Architecture Phase.*
