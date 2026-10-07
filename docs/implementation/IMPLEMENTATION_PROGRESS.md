# PrintShop — Progreso de la Design Platform

**Última actualización:** 2026-10-07
**Rama de trabajo:** `feat/design-platform-implementation`
**Fuente de secuencia:** [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)

## Estado actual

| Bloque | Estado | Evidencia / resultado |
|---|---|---|
| BLOCK 00 — Baseline + Inventario | DONE | Entregables documentales completos. No se modificó código funcional. El estado de build se registra abajo. |
| BLOCK 01 — Design Core (Fundación) | DONE | Contratos TypeScript puros bajo `frontend/src/core/design/types`; tipos existentes y stores intactos. Build y lint focalizado pasan. Commit registrado en historial. |
| BLOCK 02 — Document Model | DONE | Creación/versionado, validación, JSON serializer y adaptador de canvas; build, lint focalizado y pruebas runtime pasan. Commit independiente. |
| BLOCK 03 — Command System + History | DONE | CommandSystem y comandos add/update/remove/reorder integrados al store; undo/redo y ramificación verificados. Build/lint/runtime pasan. Commit independiente. |
| BLOCK 04 — Layers | DONE | LayerManager y comandos undoables de reorder/lock/visibility conectados al canvasStore y a las acciones de capas de Designer 2. |
| BLOCK 05 — Selection + Transform | DONE | SelectionManager y TransformSystem integrados al store, Designer 2 y bridge Konva; operaciones múltiples atómicas y undoables. |
| BLOCK 06 — Tool Registry + Tool Context | DONE | Registry del Design Core, filtrado explícito por capabilities y transición de ciclo de vida conectada al hook; configuración y Zustand legacy preservados. |
| BLOCK 07 — Product Surface | BLOCKED | Límites y operaciones 2D leen la superficie/zona del producto activo; el decal frontal toma el printable area del producto. El GLB solo ofrece calibración física etiquetada `FRONT`; no hay evidencia para proyectar con fidelidad los decals en espalda, mangas o etiqueta. |
| BLOCK 08 — 2D Renderer Adapter | DONE | Contrato 2D independiente de Konva y adapter Konva integrado al canvas; filtra elementos por la superficie activa. No realiza proyección 3D ni cambia el estado de BLOCK 07. |
| BLOCK 09 — 3D Renderer Adapter | DONE | Contrato 3D neutral al framework y adapter Three.js integrado al flujo de decals. Emite descriptores únicamente para `front`; las zonas no calibradas siguen excluidas y BLOCK 07 continúa `BLOCKED`. |
| BLOCK 10 — Asset System | DONE | AssetManager compartido registra la biblioteca local y uploads temporales de D2/D3 Easy con IDs únicos y URLs inmutables; cleanup revoca object URLs. No se añade persistencia ni caché binaria. |
| BLOCK 11 — Image Processing Foundation | DONE | API compartida procesa los siete `ArtworkFilters` con `OffscreenCanvas` en Web Worker y devuelve PNG sin alterar el Blob original. La integración de UI no está incluida en este bloque. |
| BLOCK 12 — Designer 2 Integration | BLOCKED (PARTIAL) | Las mutaciones principales de D2 ya pasan por managers/comandos del Core, pero `Designer2Workspace` no consume `useActiveTool`/Tool Registry. Sus tabs son navegación de paneles; mapearlos a tools alteraría su semántica y los descriptores registrados no tienen handlers de interacción. |
| BLOCK 13 — Designer 1 Integration | BLOCKED | Depende de BLOCK 12 y su funcionalidad específica sigue `UNKNOWN`; `/designer/personalize` monta un layout compartido. |
| BLOCK 14 — Designer 3 Easy | PARTIAL / BLOCKED | Eliminación local de fondo y limpieza de semitransparencia usan el Worker; presets y exportación de producción siguen pendientes. El algoritmo local no sustituye un provider externo de background removal. |
| BLOCK 15 — Designer 3 Advanced | BLOCKED | Depende de BLOCK 14; las capacidades específicas son `UNKNOWN` y la ruta comparte `DesignerLayout` con Personalizer. |
| BLOCK 16 — Production Engine | BLOCKED | Depende de BLOCK 15 y requiere APIs de producción no encontradas en el backend actual. |
| BLOCK 17 — Persistence / Autosave | BLOCKED | La API de documentos requerida no existe; el ciclo de identidad/restauración local tampoco está especificado para evitar mezclar borradores. |
| BLOCK 18 — Performance | PARTIAL / BLOCKED | `IntersectionObserver` difiere las miniaturas de las bibliotecas D2 y sidebar compartido sin depender de BLOCK 17. La validación de Konva con documentos de múltiples elementos sigue bloqueada por falta de carga objetivo y profiling. |
| BLOCK 19 — Testing + Stabilization | PARTIAL / BLOCKED | Se validaron en navegador los subalcances implementados; no es posible certificar los tres diseñadores mientras continúen bloqueados D1, la integración de tools y producción/persistencia. No hay runner de pruebas frontend. |
| BLOCK 19 — Testing + Stabilization | BLOCKED | Depende de los bloques pendientes y de que los flujos de D1/D3 tengan alcance verificable. |

## Registro de BLOCK 00

- Se conservaron y revisaron los ocho documentos de arquitectura/roadmap ya existentes.
- Se completaron `IMPLEMENTATION_PROGRESS.md`, `DEFINITION_OF_DONE.md` y las especificaciones funcionales de Designer 1, 2 y 3 que faltaban en el inventario de entregables de BLOCK 00.
- El inventario existente mantiene como `UNKNOWN` los flujos de Designer 1 y Designer 3 Advanced que no se pudieron verificar. Sus especificaciones no convierten esos vacíos en requisitos inventados.
- `MODULE_STATUS.md` se refiere a la Fase 0 del proceso de evolución visual; no reemplaza ni contradice el estado de BLOCK 00 de esta Design Platform.
- Código funcional modificado: **no**.
- Build de frontend (`npm run build --prefix frontend`): **PASS** (`tsc` y `vite build`).
- Commit de cierre de BLOCK 00: **incluido en el cierre documental de esta rama**, según el criterio del roadmap.

## Registro de BLOCK 01 — Design Core (Fundación)

- Archivos: `frontend/src/core/design/types/{document,element,capabilities,index}.ts`.
- Cambio: se definieron los contratos de documento, superficie, capas, coordenadas, referencia de producto, metadata serializable, elementos y capabilities por experiencia.
- Compatibilidad: `src/types/canvas.ts`, `src/types/product.ts`, stores, rutas y runtime no se modificaron. `DesignElement` es un alias de tipo de `CanvasElement`; no duplica ni migra su definición.
- Decisiones: las capabilities son identificadores tipados, no configuración activa de D1/D2/D3. No se habilitó ninguna capacidad ni se afirmó su implementación. ADR-004 continúa `PROPOSED`; BLOCK 01 declara tipos, no un schema validado ni serializador.
- Build base anterior al bloque: **PASS** (`npm run build --prefix frontend`).
- Validación posterior: build **PASS**; ESLint focalizado en los cuatro archivos **PASS**; `git diff --check` **PASS**.
- Tests: no se encontraron archivos de pruebas del frontend; no existe runner de tests configurado en `frontend/package.json`.
- Rutas/runtime: no aplica; el bloque no cambia componentes ni rutas.
- Alcance: solo tipos compartidos del Design Core y documentación del bloque.
- Commit: registrado en el historial de esta rama como cierre separado de BLOCK 01.
- Siguiente bloque: **BLOCK 02 — Document Model**.

## Registro de BLOCK 02 — Document Model

- Archivos: `frontend/src/core/design/types/document.ts` y `frontend/src/core/design/document/{schema-version,document-manager,serializer,document-adapter,index}.ts`.
- Cambio: creación de documentos con schema `1.0.0`, validación estructural/versionada, serialización/deserialización JSON y conversión del estado plano actual del canvas a superficies y capas.
- Fidelidad: se preservan las cinco zonas y su configuración imprimible, los elementos en su orden por zona y sus propiedades, incluido `CanvasElement.layer`; el adaptador copia los elementos y no comparte objetos mutables con el store.
- Decisión: cada superficie exportada obtiene una capa estructural `Artwork`; la clasificación legacy `user`/`guide` se conserva en cada elemento. Los timestamps e ID del documento son entradas explícitas; no se agrega persistencia ni generación automática de identidad/fecha.
- Build: **PASS** (`npm run build --prefix frontend`).
- ESLint focalizado en los archivos del Design Core/document: **PASS**.
- Checks runtime aislados: **PASS** — adaptación de las cinco zonas, preservación de atributos, copias independientes, round-trip JSON, JSON malformado, versión no soportada, incoherencia de zona y metadata inválida/cíclica.
- Tests del repo: no se encontró runner ni suite frontend configurada.
- Rutas/runtime de UI: sin cambios; D2 y sus stores no se modificaron.
- `git diff --check`: **PASS** antes del commit.
- Commit: cierre funcional en commit independiente de BLOCK 02 con convención `feat(document): ...`.
- Siguiente bloque: **BLOCK 03 — Command System + History**.

## Registro de BLOCK 03 — Command System + History

- Archivos: `frontend/src/core/design/commands/*`, `frontend/src/store/canvas-store.ts` y `frontend/src/types/canvas.ts`.
- Cambio: se añadió CommandSystem con cursor de undo/redo y comandos compartidos para añadir, actualizar, eliminar y reordenar elementos. El `canvasStore` mantiene sus acciones públicas y delega esas operaciones al sistema de comandos.
- Compatibilidad: `_history`, `_historyIndex` y `HistoryEntry` permanecen como proyección de snapshots legacy hasta validación en producción; no controlan ya undo/redo. Se mantiene también la semántica actual de selección y de las acciones `groupSelectedElements`/`ungroupSelectedElements`.
- Build: **PASS** (`npm run build --prefix frontend`).
- ESLint focalizado: **PASS** para comandos, store y tipo de canvas.
- Checks runtime integrados: **PASS** — añadir/actualizar/eliminar/reordenar, undo/redo, límites vacíos y ramificación después de undo.
- Tests del repo: no hay runner/suite frontend configurada.
- Rutas/UI: se conservan selectores y acciones existentes; no se cambiaron componentes ni rutas. La camiseta Designer 2 mantiene su build y las mismas operaciones de store.
- `git diff --check`: **PASS** antes del commit.
- Commit: cierre funcional en commit independiente de BLOCK 03 con convención `feat(commands): ...`.
- Siguiente bloque: **BLOCK 05 — Selection + Transform**.

## Registro de BLOCK 04 — Layers

- Archivos: `frontend/src/core/design/layers/{layer-manager,layer-commands,index}.ts`, `frontend/src/core/design/commands/reorder-element.command.ts`, `frontend/src/store/canvas-store.ts`, `frontend/src/types/canvas.ts` y `frontend/src/features/designer/pages/designer-2-workspace.tsx`.
- Cambio: `LayerManager` delega reorder, toggle de lock y toggle de visibility a comandos del `CommandSystem`; las acciones del panel de capas y de propiedades de Designer 2 usan el manager a través del store.
- Fidelidad: la representación existente conserva un elemento de canvas por fila/capa y mantiene las semánticas previas: lock invierte el valor actual; visibility convierte `undefined`/visible a `false` y oculta a visible. No se cambian datos, rutas ni otras reglas de Designer 2.
- Undo/redo runtime: **PASS** a través del `canvasStore` real para reorder, lock y visibility, incluyendo restauración de valores originalmente `undefined`, redo y que los límites no válidos no añadan historial.
- Build frontend (`npm run build --prefix frontend`): **PASS** (`tsc` y `vite build`).
- ESLint focalizado en los archivos modificados: **PASS**.
- `git diff --check`: **PASS** antes del commit.
- Tests del repo: no hay runner/suite frontend configurada; se ejecutaron checks runtime aislados con el `CommandSystem` real.
- Alcance: solo Design Core, store/canvas y controles existentes de capas de Designer 2; sin cambios de rutas.
- Decisión: el `LayerManager` opera sobre la representación plana actual del canvas (un `CanvasElement` es una capa en la UI) y evita migrar prematuramente las capas agrupadas del `PrintShopDocument`. ADR-013.
- Commit: cierre independiente con mensaje `feat(layers): add undoable layer operations`.
- Siguiente bloque: **BLOCK 05 — Selection + Transform**.

## Registro de BLOCK 05 — Selection + Transform

- Archivos: `frontend/src/core/design/{selection,transform}`, `frontend/src/core/design/commands/{composite.command.ts,index.ts}`, `frontend/src/store/canvas-store.ts`, `frontend/src/types/canvas.ts`, `frontend/src/features/designer/components/{canvas,canvas-elements,canvas-selection}.tsx`, `frontend/src/features/designer/components/canvas-overlay/canvas-overlay.tsx`, `frontend/src/features/designer/hooks/{use-canvas-selection,use-canvas-drag}.ts` y `frontend/src/features/designer/pages/designer-2-workspace.tsx`.
- Cambio: `SelectionManager` unifica selección simple/múltiple; shift/control/command selecciona varios elementos desde el canvas y las capas D2. `TransformSystem` centraliza update, move, scale, rotate, flip, align y center; `CompositeCommand` hace atómicas las transformaciones, duplicaciones y eliminaciones por lote.
- Bridge Konva: el Transformer enlaza todos los nodos seleccionados; un cambio de tamaño se registra como una sola operación undoable. Arrastrar un miembro mueve el conjunto seleccionado de la misma zona manteniendo sus posiciones relativas.
- Lock: elementos bloqueados no se arrastran, no se adjuntan al Transformer ni reciben transformaciones del manager; se pueden desbloquear con la acción de capas.
- Fidelidad: elementos siguen siendo entidades individuales; alineación y centrado de selección múltiple trasladan el bounding box del conjunto sin crear grupos persistentes. El centrado mantiene el área legacy del canvas; la abstracción del producto sigue pendiente de BLOCK 07.
- Build frontend: **PASS** (`tsc` y `vite build`).
- ESLint focalizado en core, store, hooks y componentes salvo `CanvasArea`: **PASS**. Los 9 diagnósticos de ESLint de `CanvasArea` (import `Box`, `any`, bloques vacíos y punto y coma) también se reproducen en el archivo de `HEAD`; no los introdujo este bloque.
- Runtime aislado del `canvasStore` real: **PASS** para selección, transformaciones simples/múltiples, alineación de grupo, lock, duplicación/eliminación múltiple y undo/redo atómico.
- Browser smoke en `/designer/new?product=camisetas` a 1440×900: selección aditiva de `Img1` y `Img2` desde capas, rotación conjunta y verificación visual de 15° en ambas; undo restauró 0° en ambas y redo restauró 15° en ambas. La ruta no generó errores de página; Three.js registró warnings deprecados existentes. No se verificó móvil.
- Tests del repo: no hay runner/suite frontend configurada.
- `git diff --check`: **PASS** antes del commit.
- Decisión: operaciones de grupo son composites temporales; no se introduce una capa de agrupación persistente ni se cambia el dominio. ADR-014.
- Commit: cierre independiente con mensaje `feat(selection): add shared selection and transform systems`.
- Siguiente bloque: **BLOCK 07 — Product Surface**.

## Registro de BLOCK 06 — Tool Registry + Tool Context

- Archivos: `frontend/src/core/design/tools/*`, `frontend/src/core/design/types/capabilities.ts`, `frontend/src/features/designer/services/tools-config.ts`, `frontend/src/features/designer/hooks/use-active-tool.ts` y `frontend/src/types/tools.ts`.
- Cambio: `ToolRegistry` registra las ocho definiciones existentes, rechaza IDs duplicados, permite consulta y retiro, filtra todas las herramientas por `DesignerCapabilities` y ejecuta los hooks `onDeactivate`/`onActivate` definidos en cada transición. El hook expone la transición y la consulta de herramientas disponibles.
- Capacidades: select/text/image requieren `selection`/`text`/`imageUpload`; herramientas de formas y navegación requieren `shapeCreation`/`viewportNavigation`. No se crean perfiles automáticos para D1/D3 ni se elevan capacidades `UNKNOWN`.
- Compatibilidad: `tools-config.ts` sigue exponiendo `TOOLS`, `TOOLS_ORDER` y `getTool`; `ToolsState` y `toolsStore` conservan la semántica del setter existente. El ID activo continúa residiendo solo en Zustand; no se duplica en el registry.
- Contexto: documento, CommandSystem, SelectionManager y viewport son referencias nullable mientras la integración de los stores/runtime no exista para todos los diseñadores. Los descriptores legacy son metadata, sin handlers ni efectos de activación; no se introdujo comportamiento simulado. Las tabs de panel existentes de D2 no se confundieron con herramientas del canvas.
- Build base antes del bloque: **PASS** (`npm run build --prefix frontend`).
- Build posterior: **PASS** (`tsc` y `vite build`).
- ESLint focalizado y diagnósticos del editor para los archivos modificados: **PASS**, sin errores.
- Checks runtime del código fuente: **PASS** — disponibilidad por perfiles de capabilities, rechazo de herramientas no registradas/no disponibles, detección de IDs duplicados, orden activate/deactivate/activate, transición idempotente y unregister.
- Tests del repo: no hay runner/suite frontend configurada.
- `git diff --check`: **PASS**; no se modificaron rutas ni UI funcional del Builder.
- Decisión: ADR-002 aceptada; el registry no mantiene una segunda fuente de verdad para el ID activo y no habilita perfiles de diseñadores sin evidencia.
- Commit: cierre independiente con mensaje `feat(tools): add capability-aware tool registry`.
- Siguiente bloque: **BLOCK 07 — Product Surface**.

## Historial

| Fecha | Bloque | Cambio |
|---|---|---|
| 2026-10-05 | BLOCK 00 | Se completó la documentación faltante y se registraron las limitaciones de evidencia. |
| 2026-10-05 | BLOCK 01 | Se añadieron contratos TypeScript puros y se validó build/lint sin modificar los tipos ni stores existentes. |
| 2026-10-05 | BLOCK 02 | Se implementaron creación, validación, serialización JSON y adaptación del canvas; build, lint y checks runtime aprobados. |
| 2026-10-05 | BLOCK 03 | Se integraron comandos compartidos al canvasStore; undo/redo y ramificación validados sin retirar el historial legacy. |
| 2026-10-05 | BLOCK 04 | Se implementaron reorder, lock y visibility de capas mediante comandos undoables e integración con Designer 2. |
| 2026-10-05 | BLOCK 05 | Se integraron selección múltiple y transformaciones de grupo mediante commands undoables y managers compartidos. |
| 2026-10-05 | BLOCK 06 | Se añadió el Tool Registry compartido con filtrado por capabilities y puente de compatibilidad para la configuración y el estado legacy. |

## Registro de BLOCK 07 — Product Surface (avance parcial; bloqueado)

- Archivos funcionales: `frontend/src/features/designer/components/canvas.tsx`, `frontend/src/features/designer/components/product-viewer/artwork-decals.tsx`, `frontend/src/features/designer/components/product-viewer/product-model.tsx`, `frontend/src/features/designer/components/product-viewer/product-pivot.tsx`, `frontend/src/features/designer/hooks/use-canvas-drag.ts`, `frontend/src/features/designer/pages/designer-2-workspace.tsx`, `frontend/src/features/designer/services/canvas-config.ts`, `frontend/src/store/canvas-store.ts` y `frontend/src/types/canvas.ts`.
- Cambio seguro completado: drag, drop, alineación/centrado, alta de artwork y límites 2D toman `activeProduct.printableAreas[activeZoneId]`; los elementos nuevos se limitan al tamaño disponible de su superficie. Se eliminó la constante de printable area de `canvas-config.ts`. El decal y el contorno de la superficie frontal consumen el printable area de `ProductDefinition`; se conservó sin cambios la calibración física frontal existente.
- Arquitectura: se reutiliza `PrintableZoneConfig` como fuente de coordenadas del producto y el `ProductSurface` existente del modelo documental; no se crea un esquema paralelo ni se inventan `safeArea`, `bleed` o calibraciones.
- Evidencia del asset: lectura del GLB real mediante `@gltf-transform/core`; los materiales textiles disponibles están etiquetados `FRONT` y no se hallaron regiones etiquetadas como espalda, mangas o etiqueta. No es seguro estimar la geometría imprimible de esas zonas a partir de rectángulos 2D o de objetivos de cámara.
- Límite: la proyección de decal 3D continúa soportada solo en la superficie frontal calibrada. Las otras cuatro zonas no se declaran completadas. BLOCK 07 queda `BLOCKED`; esta limitación física no afecta la abstracción de renderizado 2D de BLOCK 08.
- Build base (`npm run build --prefix frontend`): **PASS** (`tsc` y `vite build`). Build posterior: **PASS**.
- ESLint focalizado: reporta 14 errores en `canvas.tsx` y `product-pivot.tsx`, en código preexistente ajeno a las líneas de este cambio; no se limpiaron problemas fuera del alcance. Diagnósticos del editor en los nueve archivos funcionales modificados: **sin errores**.
- Tests: no hay suite/runner frontend configurado. La ruta `/designer/new?product=camisetas` cargó en navegador; se observaron solo warnings deprecados de Three.js, sin error crítico de ejecución. No se declara validación visual 3D de las cinco zonas.
- `git diff --check`: **PASS**.
- Decisión: ADR-005 aceptada para reutilizar el modelo de superficie existente y mantener bloqueada cualquier proyección 3D sin calibración verificable.
- Commit: `feat(design-core): derive 2d bounds from product surfaces` (avance parcial; no cierra BLOCK 07).
- Siguiente paso para BLOCK 07: obtener calibraciones/identificadores de superficie reales para espalda, ambas mangas y etiqueta; después validar sus decals antes de cerrar ese bloque.

## Registro de BLOCK 08 — 2D Renderer Adapter

- Archivos: `frontend/src/core/design/renderer/renderer-2d.ts`, `frontend/src/core/design/renderer/index.ts`, `frontend/src/features/designer/renderer/konva-renderer.ts`, `frontend/src/features/designer/components/canvas-elements.tsx`, `frontend/src/features/designer/components/canvas-overlay/canvas-overlay.tsx` y `frontend/src/features/designer/components/canvas.tsx`.
- Cambio: se definió un contrato de renderizado 2D sin imports de Konva/React y un adapter de feature que proyecta imágenes del `DesignElement` a descriptores neutrales. El consumidor Konva conserva selección, interacción, carga de imagen y lock; el ID de la superficie activa se propaga explícitamente y se excluyen elementos de otras zonas.
- Dependencia: el adapter utiliza el contrato tipado de `ProductSurface` y el ID de zona; no calcula dimensiones físicas ni proyecta artwork al viewer 3D. Por tanto, BLOCK 08 se puede cerrar sin resolver las calibraciones faltantes de BLOCK 07. BLOCK 07 permanece `BLOCKED`.
- Build frontend (`npm run build --prefix frontend`): **PASS** (`tsc` y `vite build`).
- ESLint focalizado en contrato, adapter y consumidores modificados: **PASS**; los 9 errores de `canvas.tsx` se reproducen en `HEAD` y son preexistentes.
- Checks runtime aislados: **PASS** — filtrado de zona, tipo no soportado, origen de imagen, defaults de presentación y propiedades geométricas.
- Navegador: `/designer/advanced` cargó el workspace y el viewer Three.js sin errores críticos; se observaron warnings deprecados preexistentes de Three.js. El viewport desktop fue comprobado a 1440 × 900. No se modificó la calibración 3D.
- Tests del repo: no hay runner/suite frontend configurado.
- `git diff --check`: **PASS**.
- Decisión: ADR-015 registra que el adapter 2D depende del contrato de superficie, no de la calibración física 3D pendiente.
- Commit: `feat(renderer): add 2d renderer adapter`.
- Siguiente bloque: **BLOCK 09 — 3D Renderer Adapter** (completado a continuación; ver su registro). El bloque pendiente de análisis tras BLOCK 10 es BLOCK 11.

## Registro de BLOCK 09 — 3D Renderer Adapter

- Archivos: `frontend/src/core/design/renderer/renderer-3d.ts`, `frontend/src/core/design/renderer/index.ts`, `frontend/src/features/designer/renderer/threejs-renderer.ts` y `frontend/src/features/designer/components/product-viewer/artwork-decals.tsx`.
- Cambio: se añadió un contrato neutral a Three.js y un adapter de feature integrado al flujo real de decals. La elegibilidad de elementos y la resolución de su fuente pasan por el adapter; el renderer de Three.js conserva la conversión geométrica existente y sus interacciones.
- Límite deliberado: el adapter solo acepta la superficie frontal (`front`), para la que ya existe calibración física verificable. Devuelve `null` para espalda, ambas mangas y etiqueta; no añade coordenadas, UVs, decals ni estimaciones nuevas. BLOCK 07 sigue `BLOCKED`.
- Arquitectura: `frontend/src/core/design` no importa Three.js, `@react-three/fiber` ni `@react-three/drei`; el contrato usa únicamente tipos del documento compartido. ADR-016 registra este límite.
- Build frontend (`npm run build --prefix frontend`): **PASS** (`tsc` y `vite build`).
- ESLint focalizado en contrato, adapter y componente de decals: **PASS**.
- Checks runtime aislados: **PASS** — decal frontal, zonas no calibradas, tipos no soportados y fuente ausente.
- Navegador: `/designer/advanced` recargó con el viewer 3D funcional; no se observaron errores críticos nuevos. Permanecen advertencias conocidas deprecadas de Three.js y un request externo bloqueado por el navegador.
- Tests del repo: no hay runner/suite frontend configurado.
- `git diff --check`: **PASS**.
- Commit: `feat(renderer): add 3d renderer adapter`.
- Siguiente bloque: **BLOCK 10 — Asset System** (completado a continuación; ver su registro). El bloque pendiente de análisis es BLOCK 11.

## Registro de BLOCK 10 — Asset System

- Archivos: `frontend/src/core/design/assets/asset-manager.ts`, `frontend/src/core/design/assets/index.ts`, `frontend/src/features/designer/services/design-resources.ts`, `frontend/src/features/designer/services/index.ts`, `frontend/src/features/designer/pages/designer-2-workspace.tsx` y `frontend/src/features/designer/pages/designer-easy-mode-page.tsx`.
- Cambio: AssetManager registra descriptores inmutables con ID, nombre, URL, origen y categoría; rechaza metadatos vacíos y colisiones con cambios de URL/metadata. La biblioteca local Vite se registra una vez a través del manager; la API existente `DesignResource` se mantiene como adaptador de compatibilidad. Los uploads de D2 y D3 Easy se registran con URLs blob temporales y se liberan/revocan al terminar su ciclo de vida.
- Alcance de caché/persistencia: el Map mantiene un índice de metadata en memoria; no se cachean bytes, no se persiste en IndexedDB y no se añade Object Storage. Las URLs de upload siguen siendo temporales como antes.
- Build frontend (`npm run build --prefix frontend`): **PASS** (`tsc` y `vite build`).
- ESLint focalizado en AssetManager, servicio y consumidores D2/D3 Easy: **PASS**.
- Checks runtime del core: **PASS** — registro idempotente del mismo asset, inmutabilidad/choques de ID, filtrado por origen y retirada solo de uploads.
- Navegador: `/designer/new?product=camisetas` mostró la biblioteca local y permitió subir `img1.jpg`; la pestaña `Subidos` reflejó el asset y el artwork quedó seleccionado, sin alerta. `/designer/easy` permitió cargar el mismo archivo en la preview, sin alerta.
- Tests del repo: no hay runner/suite frontend configurado.
- `git diff --check`: **PASS**.
- Decisión: ADR-017 registra el AssetManager de metadata en memoria y la naturaleza temporal de los object URLs; no implica persistencia ni cache de bytes.
- Commit: `feat(assets): add shared asset manager`.
- Siguiente análisis: BLOCK 11 — Image Processing Foundation; verificar si Canvas API puede proporcionar filtros reales no destructivos con preservación del asset original, sin declarar eliminación de fondo ni procesamiento no implementado.

## Registro de BLOCK 11 — Image Processing Foundation

- Archivos: `frontend/src/core/design/processing/{filters,image-processor-contract,image-processor,image-processor.worker,index}.ts`, `frontend/src/types/canvas.ts`, `frontend/src/features/designer/components/product-viewer/artwork-decals.tsx` y `frontend/src/features/designer/pages/designer-2-workspace.tsx`.
- Cambio: se centralizaron el tipo público `ArtworkFilters`, sus defaults, sus rangos y la generación de filtros Canvas. `processArtworkImage` recibe un `Blob` inmutable y parámetros no destructivos; el worker decodifica con `createImageBitmap`, dibuja con `OffscreenCanvas`/Canvas 2D, y devuelve un PNG junto con sus dimensiones originales.
- Filtros reales validados: brightness, contrast, saturation, grayscale, sepia, invert y blur. La API rechaza filtros no finitos/fuera de rango y assets vacíos; no cae silenciosamente a procesamiento en el hilo principal si el worker o `CanvasRenderingContext2D.filter` no están disponibles.
- Compatibilidad: `ArtworkFilters` continúa exportado desde `src/types/canvas.ts`; la vista 3D conserva el mismo string de filtros y la UI D2 conserva valores, rangos y defaults. La API aún no está integrada en los flujos de edición; esa migración se realiza en los bloques de integración, no se afirma procesamiento habilitado en D3 Easy.
- Asset original: el `Blob` de entrada no se modifica; las pruebas de navegador comprobaron el valor original tras procesar.
- Build frontend (`npm run build --prefix frontend`): **PASS** (`tsc` y `vite build`); Vite empaquetó `image-processor.worker`.
- ESLint focalizado en processing, tipo compatible y consumidores: **PASS**.
- Checks de navegador con blob sintético: **PASS** — los siete filtros cambiaron los píxeles de salida, invert/grayscale dieron valores esperados, dimensiones se preservaron y el original quedó intacto; blur produjo salida con alpha distinto. Filtro `blur: 13` fue rechazado.
- Tests del repo: no hay runner/suite frontend configurado.
- `git diff --check`: **PASS**.
- Decisión: ADR-018 fija procesamiento raster real en Worker, preservación del original y errores explícitos cuando no se soporta el runtime requerido.
- Commit: `feat(image-processing): add worker image processing foundation`.
- Siguiente bloque evaluado: **BLOCK 12 — Designer 2 Integration**; BLOCK 07 continúa `BLOCKED` para proyección 3D de zonas sin calibración verificable.

## Evaluación de BLOCK 12 y dependencias posteriores

- Rama inspeccionada: `feat/design-platform-implementation`; el worktree estaba limpio al iniciar esta evaluación.
- Evidencia D2: las altas, actualizaciones, eliminaciones, reorder, capas, selección y transformaciones usan acciones de `canvasStore`, que delega en `CommandSystem`, `LayerManager`, `SelectionManager` y `TransformSystem`. El adapter Konva y el viewer 3D ya están conectados.
- Validación funcional previamente registrada: ruta `/designer/new?product=camisetas` y operaciones add/update/undo/redo del store pasan el smoke test de navegador.
- Gap bloqueante de BLOCK 12: `Designer2Workspace` no usa `useActiveTool` ni activa el `ToolRegistry`. El `activeTool` local de ese workspace identifica paneles (“Diseños”, “Subir”, “Texto”, etc.), no herramientas de puntero; el registry contiene descriptores sin handlers de interacción. Convertir esos tabs en activaciones de tools sería un cambio de UX/semántica y no se hace por inferencia.
- Decisión: BLOCK 12 queda `BLOCKED (PARTIAL)`, no `DONE`. No se modificó código para aparentar una integración del registry. ADR-019 registra esta frontera.
- BLOCK 13 no es independiente: además de depender de BLOCK 12, la especificación de D1 mantiene sus capacidades como `UNKNOWN`.
- Dependencias posteriores verificadas: no hay archivos Python ni servicio de background removal en el repositorio; `server` es Express y contiene endpoints de pagos/suscripciones, no APIs de diseño/documentos/producción. Tampoco se encontró proyecto Spring Boot.
- Trabajo independiente identificado: conectar en D3 Easy el filtro de contraste que ya tiene equivalencia exacta en la preview CSS con el Worker de BLOCK 11. Se completó como subalcance de BLOCK 14 sin requerir D1, calibración 3D, servicio Python ni backend; no cierra BLOCK 14.
- No se inicia BLOCK 15 porque las interacciones de Advanced son `UNKNOWN` y la ruta comparte un layout con `/designer/personalize`; capas/texto/formas/efectos no están definidos con suficiente precisión para implementarlos sin inventar comportamiento.
- BLOCK 16–19 no se ejecutan en esta evaluación: faltan APIs de producción/documentos, contratos de persistencia y un perfil de rendimiento; sus dependencias declaradas tampoco están completas.
- Cambios de código en esta evaluación de BLOCK 12: ninguno. Build base actual (`npm run build --prefix frontend`): **PASS**; Vite conserva su advertencia de chunk mayor a 500 kB. La última validación runtime D2 está registrada arriba en BLOCK 10/11; no se atribuyen pruebas nuevas a esta evaluación.
- Commit de esta evaluación documental: `d3e7c0f docs(architecture): record designer integration blockers`.
- Siguiente paso: reevaluar BLOCK 12 cuando exista un contrato de interacción de tools compatible con D2; BLOCK 14 requiere servicio Python real, definición de transformaciones por preset y motor de producción para cerrarse.

## Registro de subalcance independiente de BLOCK 14 — Contraste real en Designer 3 Easy

- Archivos funcionales: `frontend/src/features/designer/pages/designer-easy-mode-page.tsx`.
- Cambio: "Mejorar contraste" procesa el `File` original en el Worker compartido con `contrast: 110`, equivalente al valor visible `contrast-110` de la preview actual. La salida es un PNG nuevo del mismo ancho/alto en píxeles; el archivo original no se sustituye ni modifica.
- Estados honestos: solo "Color mejorado" pasa a `Procesado` tras respuesta exitosa del Worker. Eliminación de fondo, semitransparencias y semitono no se marcan como completados. Guardar, aplicar presets, eliminar fondo y exportar quedan disabled con motivos; no se afirma salida 300 DPI ni aplicación de perfiles.
- Base previa: `npm run build --prefix frontend` pasó antes del cambio (`tsc` + Vite; warning conocido de chunk >500 kB).
- Validación posterior: build **PASS**; ESLint focalizado en `designer-easy-mode-page.tsx` **PASS**; `problems` sin errores. El repositorio no configura runner de pruebas frontend.
- Navegador: `/designer/easy`, upload de `img1.jpg` y ejecución de contraste **PASS**. Antes y salida se mostraron como URLs blob distintas, ambas con dimensiones 500×500; el indicador pasó de `Pendiente` a `Procesado`. Guardar, Aplicar, Eliminar fondo y Exportar se observaron disabled.
- Responsive: `html.scrollWidth` coincidió con `html.clientWidth` a 375 px y 1024 px. No se observaron errores críticos durante la interacción.
- `git diff --check`: **PASS** antes del commit.
- Dependencias restantes: servicio real para background removal; alcance de filtros por preset; motor de producción para exportar alta resolución/300 DPI. BLOCK 14 permanece `PARTIAL / BLOCKED`.
- Commit: `feat(designer3): process contrast adjustments in worker`. Siguiente bloque evaluado: BLOCK 15, que sigue `BLOCKED` por el alcance `UNKNOWN` de Advanced y su dependencia de BLOCK 14 completo.

## Registro de subalcance independiente de BLOCK 18 — Miniaturas con carga diferida

- Archivos funcionales: `frontend/src/features/designer/components/lazy-gallery-image.tsx`, `frontend/src/features/designer/pages/designer-2-workspace.tsx`, `frontend/src/features/designer/components/left-sidebar.tsx`.
- Cambio: el componente compartido asigna `src` al acercarse a 200 px del viewport y luego usa carga eager + decodificación asíncrona. La imagen activa del canvas y la miniatura del producto no cambian. Se eligió `IntersectionObserver` porque la prueba inicial confirmó que `loading="lazy"` solo no difería las 28 imágenes actuales.
- Dependencia: la optimización de las bibliotecas no requiere BLOCK 17 ni inventa persistencia, documentos o APIs. BLOCK 18 completo sigue necesitando carga objetivo y profiling para render de Konva con documentos grandes.
- Validación: `npm run build --prefix frontend` **PASS**; ESLint focalizado **PASS**; `problems` sin errores. Navegador a 375×800: 18 de 28 miniaturas tenían `src` antes del scroll y las 28 después; sin overflow horizontal (360 px de contenido para 360 px disponibles). En el viewport inicial de 768 px: 27 de 28 antes del scroll y 28 después. `git diff --check`: **PASS** antes del commit.
- Estado: BLOCK 18 permanece `PARTIAL / BLOCKED`.
- Commit: `perf(designer): lazy-load design library thumbnails`.

## Evaluación de BLOCK 19 — Testing + Stabilization

- Smoke tests del navegador para el contraste real en `/designer/easy` y la carga diferida en `/designer/new`: **PASS** en los subalcances cambiados. D2 cargó 18/28 miniaturas antes del scroll en 375×800 y 28/28 después; no hubo overflow horizontal.
- El navegador no reportó errores de consola en la ruta D2; aparecen advertencias existentes de Three.js. `npm run build --prefix frontend`, ESLint focalizado y diagnósticos de los archivos modificados pasaron.
- El frontend no tiene runner de pruebas configurado ni archivos de test. No se añade infraestructura de test como sustituto de contratos/capacidades faltantes.
- BLOCK 19 permanece `PARTIAL / BLOCKED`: su alcance requiere validar los tres diseñadores, pero D1 sigue `UNKNOWN`, BLOCK 12 no integra el Tool Registry en la interacción, y BLOCK 14–17 siguen incompletos o bloqueados. Siguiente paso: resolver esas dependencias con contratos/datos reales y luego ejecutar la estabilización integral.
- Commit: `docs(designer): record stabilization blockers`.

## ENGINE BOOTSTRAP — DONE

- Fuente canónica: `engine/src`. Se migraron los contratos y la implementación existente de documentos, comandos, historial, selección, transformación, capas y Tool Registry desde `frontend/src/core/design`.
- Compatibilidad: las rutas previas de `frontend/src/core/design` ahora reexportan desde `engine`; `CanvasElement`, `PrintableZoneId` y `ArtworkFilters` también derivan sus contratos del motor. `createDocumentFromCanvasState` permanece como adapter del frontend porque depende de `ProductDefinition` y de la configuración del canvas.
- Runtime funcional: `DesignEngine` valida y representa `PrintShopDocument`, crea capas, agrega elementos, permite selección simple/múltiple incluso entre capas, transforma elementos y ejecuta undo/redo sobre el historial compartido.
- Portabilidad: configuración TypeScript estricta con `ES2020`, sin librerías DOM, y búsqueda de imports/globales prohibidos sin coincidencias en `engine/src`.
- Prueba vertical: `engine/tests/design-engine.test.mjs` verifica documento → capas → elementos → selección múltiple → transformación → undo → redo.
- Validación: `npm test` de `engine` **PASS** (TypeScript build y 1 test). `git diff --check` **PASS**. El build frontend estándar quedó impedido por `frontend/tsconfig.json` usando `ignoreDeprecations: "6.0"` con TypeScript 5.9.3; sin alterar ese cambio externo, `tsc --ignoreDeprecations 5.0` y Vite build pasaron.
- Estado del commit: `feat(engine): bootstrap portable design engine`.
- Siguiente bloque: Image Engine Foundation.

## IMAGE PROCESSING ENGINE — PARTIAL

- `DONE`: buffer RGBA portable e independiente del DOM; extracción/aplicación/composición de alpha y masks con dimensiones verificadas; efectos serializables en orden estable, composición additive/replace y salida no destructiva.
- `DONE`: eliminación local de fondo con muestreo de bordes, flood-fill de cuatro vecinos, distancia perceptual, tolerance, shift, feather y descontaminación; halftone conserva tamaño, ángulo de trama, forma, polaridad, intensidad/contraste, color y alpha.
- `DONE`: cleanup configurable de semitransparencia, análisis de color/regiones con masks, recolor por tolerancia con alpha/mask, PNG RGBA portable, y DTF preflight con límites físicos explícitos y política de 300 DPI documentada.
- `PARTIAL`: upscale requiere un `UpscalingProcessor` real y devuelve `NOT_CONFIGURED` si falta; JPEG requiere un encoder inyectado, aplana alpha sobre matte configurable y devuelve `NOT_CONFIGURED` si falta. No se simulan modelos ni codificación.
- `PARTIAL`: el Worker frontend ya consume las operaciones canónicas raster; D3 Easy conecta background cleanup y semitransparency cleanup, y `ImageTools` conecta Halftone. Las funciones Canvas de otras operaciones aún no migradas siguen siendo la referencia activa. No se marca la integración completa de D1/D2/D3.
- Validación: `npm --prefix engine test` **PASS** (build TypeScript y 12 tests); PNG verificado por firma, datos zlib y píxel RGBA; operaciones verificadas con tests de comportamiento e inmutabilidad. `git diff --check` **PASS**.
- Portabilidad: el nuevo código del engine no requiere React, Zustand, Konva, Three.js ni APIs DOM.
- Commit: `feat(engine): add portable raster processing operations`.
- Siguiente: adapter único para frontend y ejecución de operaciones raster pesadas en Worker; conectar primero D3 Easy.

## Integración incremental — Raster worker y Designer 3 Easy

- `DONE`: el contrato discriminado del Worker admite operaciones raster del engine para eliminación local de fondo, halftone, cleanup de semitransparencia y PNG. El Worker decodifica la imagen a RGBA, ejecuta la operación canónica y devuelve un Blob PNG; no duplica los algoritmos raster.
- `DONE`: Designer 3 Easy ejecuta eliminación local de fondo y limpieza de semitransparencia a través del Worker. La limpieza crea una salida rastreable en el historial; al desactivar el switch se restaura la imagen anterior cuando esa operación sigue siendo la salida activa. Undo, cambio de asset y limpieza del diseñador mantienen la invalidación de solicitudes y la gestión de object URLs.
- `DONE`: el switch ya no invoca por error el ajuste de contraste. El worker sigue soportando filtros para consumidores existentes; halftone y export PNG están disponibles en su contrato, pero no se exponen como acciones nuevas de UI.
- `PARTIAL`: no se habilita JPEG, upscaling ni un provider ML no configurado.
- `PARTIAL / BLOCKED`: la eliminación implementada es el algoritmo local portable del engine, no un servicio/modelo externo. Presets y exportación de producción aún no tienen reglas/contratos verificables.
- Validación: `npm --prefix engine test` **PASS** (12/12); TypeScript de frontend **PASS** con `--ignoreDeprecations 5.0` porque el cambio preexistente en `frontend/tsconfig.json` configura `6.0`, inválido para el TypeScript 5.9.3 instalado; Vite build **PASS**; el build compuesto estándar no puede iniciar por ese mismo valor preexistente. Smoke test de navegador en `/designer/easy`: carga de imagen, cleanup ON/OFF, eliminación local de fondo y undo **PASS**. `git diff --check` **PASS**. ESLint focalizado detecta únicamente el `addedCount` sin uso preexistente en esta página; no se alteró ese código ajeno.
- Siguiente: continuar con integraciones de procesamiento en consumidores existentes y verificables; Designer 3 Advanced sigue bloqueado por alcance `UNKNOWN`.

## Integración incremental — Halftone de ImageTools en Worker

- `DONE`: el panel existente `ImageTools` envía preview y aplicación de Halftone al Worker compartido, usando el algoritmo de `/engine`. La preview conserva el límite de 500 px; Aplicar procesa la resolución natural. Se preservan los controles, parámetros, conversión a `data:` URL que usa la capa y el commit existente de una sola entrada de historial.
- `DONE`: las solicitudes de preview obsoletas/canceladas abortan fetch y terminan el Worker en lugar de continuar consumiendo CPU.
- Runtime smoke en `/store/designer`: se cargó una imagen, se abrió “Semitono / Halftone”, se generó preview y Aplicar produjo `lastOp: halftone`; la UI confirmó “Original conservado”.
- Validación: `npm --prefix engine test` **PASS** (12/12); TypeScript de frontend con `--ignoreDeprecations 5.0` **PASS**; Vite build **PASS**; `git diff --check` **PASS**. ESLint de `ImageTools.tsx` conserva tres errores no relacionados y preexistentes (`FilterValues`, `RemoveBgOptions` y `previewCanvasRef` sin uso); no se modificaron.
- Estado: integración específica de Halftone en `ImageTools` **DONE**; BLOCK 12 completo continúa `BLOCKED (PARTIAL)` por su alcance de Tool Registry y otras capacidades no verificadas.

## Integración incremental — filtros de imagen en la textura 3D de Designer 2

- `DONE`: los filtros no destructivos existentes de artwork en `/designer/new` ahora se procesan por el Worker compartido y alimentan la textura 3D mediante `CanvasTexture`; la imagen original y los controles existentes se preservan. La preview conserva el límite de 1024 px.
- `DONE`: cambios de imagen/filtros abortan el trabajo anterior, cierran bitmaps temporales y descartan texturas obsoletas; los fallos no-abortados se reportan explícitamente.
- Runtime smoke en `/designer/new`: se abrió Camisetas, se seleccionó un diseño, se llevó Brillo a 200% y se verificó que el decal procesado se renderizara en el canvas 3D.
- Validación: TypeScript frontend con `--ignoreDeprecations 5.0` **PASS**; Vite build **PASS**; ESLint focalizado en los cinco archivos de procesamiento/render **PASS**; `npm --prefix engine test` **PASS** (12/12); `git diff --check` **PASS**.
- Alcance: este sub-bloque no completa BLOCK 12; Designer 2 sigue `BLOCKED (PARTIAL)` hasta resolver Tool Registry e integración restante sin alterar la semántica de los tabs.

## Integración incremental — Remove Background de ImageTools en Worker

- `DONE`: el preview de Remove Background en `ImageTools` ejecuta `removeBackgroundLocal` canónico del engine mediante el Worker y conserva tolerancia, suavizado, formato de preview, máscara manual de refinamiento y el commit existente de una entrada al historial.
- `DONE`: los cambios de parámetros, cancelación y desmontaje abortan el Worker activo; la salida sigue usando el contrato `data:` URL de `processedSrc`. Se eliminó el algoritmo Canvas duplicado del adapter legacy.
- Runtime smoke en `/store/designer`: abrir un diseño, generar preview sin fondo y Aplicar produjo `Op. activa: remove-background · Original conservado`.
- Validación: TypeScript frontend con `--ignoreDeprecations 5.0` **PASS**; Vite build **PASS**; `npm --prefix engine test` **PASS** (12/12); `git diff --check` **PASS**. ESLint focalizado sigue reportando problemas preexistentes fuera de este cambio (`FilterValues` y `previewCanvasRef` sin uso en `ImageTools.tsx`, y `any` en la exportación legacy de `imageProcessor.ts`).
- Alcance: esta integración no añade proveedor ML; la eliminación local permanece diferenciada de background removal externo.
