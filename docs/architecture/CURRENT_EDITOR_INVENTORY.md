# CURRENT_EDITOR_INVENTORY.md
# PrintShop — Inventario Real del Estado de los Editores

**Versión:** 0.1.0  
**Basada en:** Inspección directa de código — rama `feat/design-platform-implementation`<br>
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
| `CanvasElements` | `components/canvas-elements.tsx` | Renderizado Konva de elementos image; el texto de D2 se rasteriza como imagen y shapes no se renderizan aquí | ✅ (images) |
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
| `services/canvas-config.ts` | Configuración del artboard (dimensiones y layers) |
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
🟡 Artwork como Decals 3D sobre el frente calibrado; otras zonas no tienen calibración física verificable
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
✅ Undo / Redo mediante CommandSystem del Design Core; `_history` permanece como proyección de compatibilidad<br>
✅ Color de prenda (12 colores preset + custom)  
✅ Material brightness (slider)  
✅ Talla (S/M/L/XL/XXL)  
✅ Método de impresión (DTF/Sublimación/Vinilo/Serigrafía)  
✅ Guardar (botón existe — sin persistencia backend)  
✅ Descargar (botón existe — sin implementación real)  
✅ Artículo al carrito (botón existe — sin integración orders real)

### 1.7 Funcionalidad parcial o con limitaciones

🟡 **groupSelectedElements / ungroupSelectedElements**: implementados en el store pero eliminan el elemento en vez de agrupar correctamente  
🟡 **Guardar**: UI presente, sin backend  
🟡 **Descargar**: botón presente, sin exportación real de alta resolución  
🟡 **Producir**: tab existe, sin integración real con órdenes  
🟡 **"IA Generar"**: botón en sidebar izquierdo, sin funcionalidad  
🟡 **Shapes**: en sidebar izquierdo (Formas), sin interacción funcional para crear formas en canvas

### 1.8 Funcionalidad ausente o integración pendiente

❌ Persistencia en IndexedDB o backend  
❌ Exportación de alta resolución  
🟡 Tool Registry formal existe en el Design Core, pero Designer2Workspace aún no lo consume; sus tabs son navegación de paneles y sus descriptores no tienen handlers<br>
🟡 Sincronización parcial de printable area: bounds 2D por zona y área frontal 3D leen `ProductDefinition`; las demás proyecciones 3D están bloqueadas por falta de calibración
❌ SafeArea y Bleed  
❌ AI processing (background removal, enhancement)  
❌ Motor de producción (CMYK, preflight)  
❌ Autosave

BLOCK 12 queda `BLOCKED (PARTIAL)` hasta integrar handlers reales del Tool Registry con la interacción Konva existente sin equiparar tabs de paneles con tools. Ver [IMPLEMENTATION_PROGRESS.md](../implementation/IMPLEMENTATION_PROGRESS.md) y ADR-019 en [DECISIONS.md](DECISIONS.md).

---

## 2. DESIGNER 3 EASY — Estado: PARTIAL (canvas + procesamiento raster local + PNG + transforms 2D)

El modal "Nuevo lienzo" solo se monta actualmente desde `/store/designer`; no se encontró un punto de montaje adicional en Cliente.

### 2.1 Entry Point

| Ruta | Componente | Estado |
|---|---|---|
| `/designer/easy` | `DesignerEasyModePage` | 🟡 PARTIAL |
| `/store/designer` → "Nuevo lienzo", Modo avanzado OFF | `DesignerEasyModePage` | Consume `NewCanvasConfig` de `location.state` para tamaño, DPI y fondo inicial |
| `/store/designer` → "Nuevo lienzo", Modo avanzado ON | `StoreDesigner` / `DesignerWorkspace` | Aplica la configuración al workspace existente |

### 2.2 Componentes

| Componente | Archivo | Función | Estado |
|---|---|---|---|
| `DesignerEasyModePage` | `pages/designer-easy-mode-page.tsx` | Workspace de modo fácil, procesamiento local de imagen y export PNG | 🟡 |

### 2.3 Funcionalidad real

✅ Upload de imagen (click sobre botón)  
✅ Upload de imagen y registro local temporal<br>
✅ "Eliminar fondo" usa el algoritmo raster local por Worker; el asset original no se muta<br>
✅ "Eliminar semitransparencias" ejecuta cleanup raster por Worker y participa en undo/redo<br>
✅ Campos de ancho/alto/DPI y selección del fondo del canvas<br>
✅ Descargar PNG compone la imagen activa sobre el fondo configurado a la resolución física solicitada; límite 40 MP / 16.000 px por lado<br>
✅ Zoom, pan de viewport y centrado; no cambian dimensiones físicas ni exportación<br>
✅ Escala uniforme, rotación de 90° y flips X/Y del artwork; preview y PNG usan la misma matriz canónica del engine<br>
✅ Undo/Redo de snapshots de imagen/procesamiento, transform y canvas image clear<br>
🟡 Selección visible de técnica DTF; no aplica transformaciones al asset

### 2.4 Controles deshabilitados o preview solamente

🟡 "Duplicar" permanece disabled: no hay modelo multicapa en Easy y la acción previa no generaba una capa visible<br>
🟡 Descargar PDF permanece disabled: no hay encoder PDF integrado<br>
🟡 "Guardar" permanece disabled porque no hay persistencia<br>
🟡 DTF no aplica un perfil de producción; no se afirma preflight ni salida de fabricación verificada<br>
🟡 No hay posición por arrastre ni documento multicapa; los controles geométricos actuales transforman una sola imagen activa

### 2.5 Funcionalidad ausente

❌ Proveedor externo de background removal con IA (distinto del algoritmo local ya integrado)
❌ Documento multicapa y selección independiente de objetos/capas
❌ Export PDF y perfil/preflight de producción<br>
❌ Persistencia

---

## 3. DESIGNER 3 ADVANCED — Estado: PARTIAL (pantalla; capacidades UNKNOWN)

### 3.1 Entry Point

| Ruta | Componente | Estado |
|---|---|---|
| `/designer/advanced` | `DesignerLayout` | ✅ IMPLEMENTED (UI) |

El router (`App.tsx`) conecta `/designer/advanced` con `DesignerLayout`, que compone `DesignerHeader`, `LeftSidebar`, `CanvasArea`, `RightSidebar` y `BottomPanel`. La ruta cargó en navegador; el viewer 3D se montó. Esto verifica que existe una pantalla, pero no determina que todas las capacidades de D3 Advanced estén implementadas ni define su alcance.

El switch del modal "Nuevo lienzo" no navega a `/designer/advanced`: ON reutiliza el `DesignerWorkspace` actual de `StoreDesigner` y aplica la configuración allí. La ruta `/designer/advanced` no se usa como destino porque su layout compartido no constituye evidencia suficiente de un editor D3 Advanced.

**Acción requerida**: inspeccionar y documentar las interacciones reales de `DesignerLayout` antes de atribuir capacidades a D3 Advanced. No inferir comportamiento desde D2 Easy o D2 Builder.

---

## 4. DESIGNER 1 (Personalizer) — Estado: UNKNOWN

### 4.1 Entry Point

| Ruta | Componente | Estado |
|---|---|---|
| `/designer/personalize` | `DesignerLayout` | 🟡 La ruta y el layout existen; propósito/capacidades D1 siguen UNKNOWN |

El router (`App.tsx`) conecta `/designer/personalize` con el mismo `DesignerLayout` usado por `/designer/advanced`. La presencia del layout no confirma un flujo D1 de personalización de producto.

**Acción requerida**: definir y verificar el comportamiento específico de D1 antes de atribuir capabilities o iniciar su integración.

---

## 5. DESIGNER HUB — Eliminado

| Ruta | Componente | Estado |
|---|---|---|
| `/designer` | Redirect to `/designer/new` | ✅ LEGACY ALIAS |

La antigua pantalla selectora ya no existe. La ruta legacy `/designer` redirige directamente a `/designer/new`; los diseñadores mantienen sus rutas de entrada independientes.

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
