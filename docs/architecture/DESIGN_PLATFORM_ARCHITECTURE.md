# DESIGN_PLATFORM_ARCHITECTURE.md
# PrintShop — Design Platform Architecture

**Version:** 0.1.0-draft  
**Status:** DRAFT — based on code inspection of `feat/design-platform-foundation` branch  
**Last Updated:** 2026-10-05  
**Owner:** PrintShop Core Team

---

## 1. Propósito

La **PrintShop Design Platform** es la capa de software que unifica todos los comportamientos de edición y personalización de productos de la plataforma. En lugar de tener tres diseñadores con código y lógica independientes, la plataforma define un núcleo compartido sobre el que se construyen tres **experiencias**:

| Experiencia | Nombre interno | Propósito |
|---|---|---|
| Designer 1 | Personalizer | Personalizar un producto existente con diseños propios o de la biblioteca |
| Designer 2 | Builder | Crear un producto desde cero con editor 3D y herramientas completas |
| Designer 3 | Editor | Preparar y editar diseños gráficos de forma fácil o avanzada |

---

## 2. Alcance

La Design Platform abarca:

- Documento de diseño (`PrintShopDocument`)
- Sistema de capas y elementos (`CanvasElement`)
- Sistema de comandos y historial (undo/redo)
- Registro de herramientas (`ToolRegistry`)
- Capacidades por diseñador (`CapabilitySystem`)
- Abstracción de renderizado 2D (React Konva)
- Abstracción de renderizado 3D (Three.js / @react-three/fiber)
- Sistema de assets y biblioteca
- Procesamiento de imágenes
- Motor de producción
- Persistencia (local e IndexedDB)

**Fuera del alcance de la Design Platform:**

- Órdenes, pagos, envíos (ver `docs/architecture/`)
- Autenticación y roles (ver `PROJECT_SPEC.md`)
- Subscripciones (`docs/mercadopago-subscriptions.md`)
- Administración y tienda (módulos independientes)

---

## 3. Principios Arquitectónicos

### 3.1 Una capacidad = una implementación

> **REGLA NO NEGOCIABLE**: Si dos o más diseñadores necesitan la misma capacidad (selección, transformación, texto, upload, capas, undo/redo), debe existir **una sola implementación compartida** + un **Tool Registry** + **Designer Capabilities** que determinen qué activa cada experiencia.

**Prohibido:**

```
Designer1SelectTool
Designer2SelectTool
Designer3SelectTool
```

**Correcto:**

```
SharedSelectTool (implementación única)
+ DesignerCapabilities { designer1: true, designer2: true, designer3: true }
```

### 3.2 Reuse before duplicate

El orden obligatorio al implementar una capacidad es:
1. Reutilizar si ya existe en el shared core
2. Extender si necesita adaptación menor
3. Crear solo cuando no existe alternativa viable

### 3.3 Business logic never lives inside visual components

Los componentes React (Konva, Three.js) solo renderizan estado. La lógica de negocio vive en:
- Design Core (TypeScript puro)
- Command System
- Zustand stores (estado global)

### 3.4 Migración incremental

No se puede hacer un "big bang refactor". La Design Platform se construye incrementalmente. En cada bloque, la funcionalidad existente debe quedar igual o mejor, nunca rota.

### 3.5 Assets inmutables

El asset original cargado por el usuario nunca se modifica. Todas las transformaciones son no-destructivas y se almacenan como metadatos sobre el asset original.

---

## 4. Responsabilidades por Tecnología

| Tecnología | Responsabilidad | Estado actual |
|---|---|---|
| **TypeScript / React** | Editor core, UI, interacciones, estado, herramientas, comandos, orquestación | IMPLEMENTED (parcial) |
| **React Konva / Konva** | Renderizado 2D, canvas artboard, selection transformer, layers 2D | IMPLEMENTED (Designer 2 canvas, Designer 1 parcial) |
| **Three.js / @react-three/fiber** | Renderizado 3D, GLB/GLTF, visualización de producto, decals | IMPLEMENTED (Designer 2 SceneController) |
| **@react-three/drei** | Helpers Three.js: Environment, Line, Decal, useGLTF, useTexture | IMPLEMENTED |
| **Zustand** | Estado global del canvas, viewer 3D, herramientas activas | IMPLEMENTED |
| **Java / Spring Boot** | Backend, APIs, usuarios, permisos, productos, documentos, jobs, metadata | PLANNED |
| **Python** | AI: segmentación, background removal, computer vision, enhancement | PLANNED |
| **C++** | Heavy image processing, print engine, color conversion, preflight | PLANNED |
| **Web Workers / OffscreenCanvas** | Procesamiento pesado en navegador sin bloquear UI | PLANNED |
| **WASM** | Cálculo local de alto rendimiento cuando esté justificado | PLANNED |
| **PostgreSQL** | Metadata/relational state, documentos de diseño | PLANNED |
| **Object Storage** | Binary assets (imágenes, GLB, exports) | PLANNED (local actualmente) |
| **IndexedDB** | Drafts/local cache/autosave | PLANNED |

> **REGLA**: No introducir ninguna tecnología simplemente porque aparezca en esta arquitectura. Debe existir una necesidad técnica real y un bloque de implementación aprobado.

---

## 5. Arquitectura Actual (Estado Real Verificado por Inspección de Código)

### 5.1 Stores existentes

| Store | Archivo | Propósito | Estado |
|---|---|---|---|
| `useCanvasStore` | `src/store/canvas-store.ts` | Elementos del canvas 2D, selección, historial, undo/redo | IMPLEMENTED |
| `useViewerStore` | `src/store/viewer-store.ts` | Estado del viewer 3D: producto activo, zona, zoom, color, materiales, grid/guides | IMPLEMENTED |
| `useToolsStore` | `src/store/tools-store.ts` | Herramienta activa global (type: ToolType) | IMPLEMENTED (básico) |

### 5.2 Tipos existentes

| Tipo | Archivo | Descripción |
|---|---|---|
| `CanvasElement` | `src/types/canvas.ts` | Elemento del canvas: id, type, layer, zoneId, x/y/w/h, image, text, filters, lock, visible |
| `CanvasState` | `src/types/canvas.ts` | Contrato del canvas store con selección, historial y acciones |
| `ProductDefinition` | `src/types/product.ts` | Producto: id, name, category, thumbnail, modelUrl, printableAreas, viewConfigs, materials |
| `PrintableZoneId` | `src/types/product.ts` | front, back, sleeve_left, sleeve_right, label |
| `PrintableZoneConfig` | `src/types/product.ts` | Zona imprimible: coordenadas, dimensiones, enabled, visible |
| `ProductViewConfig` | `src/types/product.ts` | Configuración de cámara/modelo por zona |
| `ArtworkFilters` | `src/types/canvas.ts` | Filtros: brightness, contrast, saturation, grayscale, sepia, invert, blur |
| `Tool` | `src/types/tools.ts` | Definición de herramienta: id, name, icon, description, category, cursor |
| `DesignResource` | `src/types/design-resource.ts` | Recurso de diseño de la biblioteca |

### 5.3 Configuraciones de canvas existentes

`canvas-config.ts` define:
- `ARTBOARD_WIDTH: 794`, `ARTBOARD_HEIGHT: 1123` (artboard en px @ 96 DPI equiv)
- `STAGE_SCALE: 0.7`
- `LAYERS`: background, mockup, content/user-objects, guides, selection
- `SNAP_THRESHOLD: 8px`

El bounds 2D de canvas, drag/drop, alineación y centrado se deriva ahora de `activeProduct.printableAreas[activeZoneId]`; el decal frontal también recibe el área configurada en `ProductDefinition`. La calibración física disponible en el GLB solo identifica material textil `FRONT`. La proyección 3D de espalda, mangas y etiqueta permanece `BLOCKED` hasta disponer de calibración verificable por zona.

### 5.4 Herramientas existentes

Las ocho definiciones existentes (SELECT, RECTANGLE, ELLIPSE, LINE, TEXT, IMAGE, HAND, ZOOM) ahora se registran en `core/design/tools`. `tools-config.ts` sigue exponiendo el contrato anterior como fachada de compatibilidad, y `toolsStore` conserva el ID activo en Zustand. `useActiveTool.activateTool` ofrece la transición formal de ciclo de vida; `getAvailableTools` filtra según las capabilities explícitas del designer.

Los perfiles de D1 y D3 siguen sin definirse porque sus capacidades están marcadas `UNKNOWN`. `shapeCreation` y `viewportNavigation` son requisitos de disponibilidad para las herramientas correspondientes, pero no se habilitan implícitamente. Los descriptores legacy no tienen handlers de eventos ni efectos de activación; estos no se simulan y la integración de interacción queda para los bloques de cada designer.

### 5.5 Historial / Undo-Redo

Implementado en `canvas-store.ts` con `_history: HistoryEntry[]` y `_historyIndex`. El historial almacena snapshots completos de `elements[]`. Funcional para undo pero el redo tiene comportamiento limitado.

**LIMITACIÓN**: No es un Command System formal. Los comandos no están encapsulados. Cambios de texto, color de prenda, zoom, etc. no forman parte del historial.

---

## 6. Arquitectura Objetivo

### 6.1 Design Core

El Design Core es una capa TypeScript pura (sin dependencias de React, Konva ni Three.js) que gestiona:

```
PrintShopDocument
  └─ ProductSurface[]
       └─ Layer[]
            └─ CanvasElement[]
```

El Design Core expone:
- `DocumentManager`: carga, guarda, valida documentos
- `CommandSystem`: ejecuta, deshace y rehace comandos
- `LayerManager`: reordena, bloquea, oculta capas
- `SelectionManager`: selección simple y múltiple
- `TransformSystem`: translación, escala, rotación, flip, alignment
- `ToolRegistry`: registro y ciclo de vida de herramientas

**Estado de implementación:** BLOCK 01 define los contratos de tipos compartidos en `frontend/src/core/design/types`; BLOCK 02 añade creación, validación, serialización/deserialización y adaptación del canvas en `frontend/src/core/design/document`; BLOCK 04 implementa `LayerManager` y comandos undoables de reorder, lock y visibility; BLOCK 05 implementa `SelectionManager`, `TransformSystem` y operaciones composites undoables integradas con el store y el bridge Konva. Los managers preservan los modelos actuales y no añaden persistencia.

### 6.2 PrintShopDocument

```typescript
interface PrintShopDocument {
  id: string;
  schemaVersion: string;        // semver, e.g. "1.0.0"
  createdAt: string;            // ISO 8601
  updatedAt: string;
  product: ProductReference;
  surfaces: ProductSurface[];
  metadata: DocumentMetadata;
}
```

### 6.3 ProductSurface

```typescript
interface ProductSurface {
  id: PrintableZoneId;
  name: string;
  printableArea: PrintableArea;
  safeArea?: SafeArea;
  bleed?: BleedConfig;
  layers: Layer[];
  coordinateSystem: CoordinateSystem;
}
```

### 6.4 Coordinate System

- Origen: esquina superior izquierda del artboard
- Unidades: píxeles artboard (794×1123 para camiseta)
- Las coordenadas físicas (mm/cm) se calculan en el Motor de Producción
- El sistema de coordenadas es independiente del scale del stage

### 6.5 Printable Area / Safe Area / Bleed

```
┌─────────────────────────────────────────┐
│              BLEED (3mm)                │
│  ┌───────────────────────────────────┐  │
│  │         PRINTABLE AREA            │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │       SAFE AREA             │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Estado actual**: `ProductSurface.printableArea` y sus bounds 2D provienen de `ProductDefinition`. SafeArea y Bleed siguen PLANNED; no se infieren.

### 6.6 Command System (objetivo)

```typescript
interface Command<TContext> {
  id: string;
  name: string;
  execute(context: TContext): void;
  undo(context: TContext): void;
  redo(context: TContext): void;
  canMerge?(other: Command<TContext>): boolean;  // para batching de transforms
}
```

El `CommandSystem` es la fuente de verdad de undo/redo desde BLOCK 03. El snapshot `_history` se conserva temporalmente como proyección de compatibilidad hasta validar el sistema en producción.

### 6.7 Tool Registry

```typescript
interface Tool {
  id: ToolId;
  name: string;
  category: ToolCategory;
  cursor: string;
  requiredCapabilities: readonly DesignerCapability[];
  onActivate?(context: ToolContext): void;
  onDeactivate?(context: ToolContext): void;
  onPointerDown?(event: ToolPointerEvent, context: ToolContext): void;
  onPointerMove?(event: ToolPointerEvent, context: ToolContext): void;
  onPointerUp?(event: ToolPointerEvent, context: ToolContext): void;
  onKeyDown?(event: ToolKeyboardEvent, context: ToolContext): void;
}

interface ToolContext {
  capabilities: DesignerCapabilities;
  document: PrintShopDocument | null;
  commandSystem: CommandSystem | null;
  selectionManager: SelectionManager | null;
  viewport: ToolViewportState | null;
}
```

El registry valida IDs duplicados, consulta herramientas por ID, filtra por capacidades y ejecuta los hooks definidos al cambiar de herramienta. Los hooks de ciclo de vida y eventos son opcionales porque los descriptores actuales no representan efectos ni interacciones del core; no se les asigna funcionalidad vacía para aparentar implementación. El store del designer continúa siendo la única fuente del ID activo.

### 6.8 Capability System

Determina qué herramientas y funciones están disponibles en cada experiencia de diseño. `shapeCreation` y `viewportNavigation` cubren las herramientas legacy de formas y navegación. El registry requiere que el caller proporcione el perfil activo; la falta de un perfil verificado para D1/D3 se conserva como desconocida. Ver `DESIGNER_CAPABILITY_MATRIX.md` para la matriz completa.

### 6.9 Renderer Abstraction

#### 2D Renderer (React Konva)

Responsable del canvas artboard 2D. Actualmente implementado en:
- `canvas.tsx` — Stage, Layer management, drag & drop
- `canvas-elements.tsx` — Renderizado de CanvasElement
- `canvas-selection.tsx` — Konva Transformer para selección

`Renderer2DAdapter` vive en `core/design/renderer` y describe elementos renderizables sin importar Konva ni React. `konva-renderer.ts` adapta los elementos de la feature Designer y recibe explícitamente el ID de superficie activa. El consumidor Konva preserva selección, interacciones y despacho al store.

#### 3D Renderer (Three.js)

Responsable de la visualización del producto 3D con artwork como decals. Implementado en:
- `scene-controller.tsx` — Canvas Three.js principal
- `camera-controller.tsx` — OrbitControls y fit-to-view
- `product-pivot.tsx` — Rotación por zona y color del producto
- `product-model.tsx` — Carga GLB con `useGLTF`
- `artwork-decals.tsx` — Proyección de elementos 2D como Decals 3D

Contratos: lee del store, no modifica estado.

`Renderer3DAdapter` vive en `core/design/renderer` y no importa Three.js. `threejs-renderer.ts` transforma elementos elegibles en descriptores de decal consumidos por `ArtworkDecals`. La implementación habilita únicamente `front`, cuya calibración física está verificada; las otras superficies no producen descriptores y permanecen bloqueadas según BLOCK 07.

### 6.10 Product Mapping / Decals

Los elementos del canvas 2D se proyectan sobre la malla 3D del producto como Decals (@react-three/drei). La conversión de coordenadas 2D → UV ocurre en `artwork-decals.tsx`.

El decal y contorno frontal reciben las coordenadas desde `ProductDefinition.printableAreas.front` y conservan la calibración física frontal existente. Las zonas sin calibración física verificable no se proyectan como decals 3D; no se extrapolan coordenadas 2D ni objetivos de cámara.

### 6.11 Persistence

#### Local (IndexedDB) — PLANNED
Autosave de borradores, cache de assets, estado del documento.

#### Backend (Spring Boot + PostgreSQL + Object Storage) — PLANNED
APIs de diseño: crear, guardar, cargar documentos. Assets binarios → Object Storage.

---

## 7. Rutas de los Designers (Estado Real)

| Ruta | Componente | Designer | Estado |
|---|---|---|---|
| `/designer` | `DesignerHubPage` | Hub | IMPLEMENTED |
| `/designer/new` | `DesignerBuilderPage` | D2 (selección) | IMPLEMENTED |
| `/designer/new?product=camisetas` | `Designer2Workspace` | D2 (workspace) | IMPLEMENTED |
| `/designer/personalize` | UNKNOWN — componente no encontrado | D1 | UNKNOWN |
| `/designer/easy` | `DesignerEasyModePage` | D3 Easy | IMPLEMENTED |
| `/designer/advanced` | UNKNOWN — componente no encontrado | D3 Advanced | UNKNOWN |

---

## 8. Composición por Designer

### 8.1 Designer 1 (Personalizer)

**Propósito**: Abrir un producto existente y personalizarlo.

**Estado real**: UNKNOWN. La ruta `/designer/personalize` aparece en el Hub pero no se encontró componente dedicado. Requiere verificación.

### 8.2 Designer 2 (Builder)

**Propósito**: Crear un producto desde cero con editor 3D completo.

**Componentes actuales verificados**:
- `DesignerBuilderPage` — selección de producto con grid de categorías
- `Designer2Workspace` — workspace completo (1248 líneas)
  - Left panel: diseños, upload, texto, capas, producir
  - Center: `SceneController` (Three.js 3D) con artwork como decals
  - Right: propiedades de elemento, layer management
  - Inline: controles de color de prenda, talla, método de impresión

**Estado**: IMPLEMENTED para camiseta (DEFAULT_PRODUCT). Otros productos: visibles pero botón deshabilitado.

### 8.3 Designer 3 (Editor)

**Modo Easy** (`/designer/easy`):
- Upload de imagen
- Selección de preset: DTF, serigrafía, vinilo, sublimación
- Vista antes/después con CSS filters (NO es procesamiento real)
- Botones: Eliminar fondo, Mejorar contraste, Exportar (SIN funcionalidad backend)
- **Estado**: IMPLEMENTED (UI only — procesamiento real: NOT IMPLEMENTED)

**Modo Advanced** (`/designer/advanced`):
- **Estado**: UNKNOWN — componente no encontrado en inspección

---

## 9. Anti-patrones Prohibidos

1. Duplicar herramientas por diseñador
2. Hardcodear coordenadas del printable area (ya existe como deuda técnica)
3. Usar modelo 3D de otro producto como sustituto
4. Crear rutas funcionales apuntando a GLB inexistentes
5. Simular AI con CSS filters sin comentario claro
6. Almacenar lógica de negocio en componentes React
7. Modificar el asset original del usuario
8. Big bang refactor

---

## 10. Estrategia de Migración

Ver `IMPLEMENTATION_ROADMAP.md` para el roadmap detallado por bloques.

La migración es incremental. En cada bloque:
1. La funcionalidad existente debe mantenerse funcional
2. La build debe pasar
3. Se documenta la decisión tomada
4. Se actualiza el progreso

---

*Documento de arquitectura objetivo. El estado implementado por bloque se registra en `docs/implementation/IMPLEMENTATION_PROGRESS.md`.*
