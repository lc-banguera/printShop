# PrintShop — Progreso de la Design Platform

**Última actualización:** 2026-10-05
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
| BLOCK 08 — 2D Renderer Adapter | PENDING | No iniciado. |
| BLOCK 09 — 3D Renderer Adapter | PENDING | No iniciado. |
| BLOCK 10 — Asset System | PENDING | No iniciado. |
| BLOCK 11 — Image Processing Foundation | PENDING | No iniciado. |
| BLOCK 12 — Designer 2 Integration | PENDING | No iniciado. |
| BLOCK 13 — Designer 1 Integration | PENDING | No iniciado. |
| BLOCK 14 — Designer 3 Easy | PENDING | No iniciado. |
| BLOCK 15 — Designer 3 Advanced | PENDING | No iniciado. |
| BLOCK 16 — Production Engine | PENDING | No iniciado. |
| BLOCK 17 — Persistence / Autosave | PENDING | No iniciado. |
| BLOCK 18 — Performance | PENDING | No iniciado. |
| BLOCK 19 — Testing + Stabilization | PENDING | No iniciado. |

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
- Límite: la proyección de decal 3D continúa soportada solo en la superficie frontal calibrada. Las otras cuatro zonas no se declaran completadas. BLOCK 07 queda `BLOCKED`; por la secuencia obligatoria, BLOCK 08 no puede comenzar hasta obtener y validar calibración real por zona.
- Build base (`npm run build --prefix frontend`): **PASS** (`tsc` y `vite build`). Build posterior: **PASS**.
- ESLint focalizado: reporta 14 errores en `canvas.tsx` y `product-pivot.tsx`, en código preexistente ajeno a las líneas de este cambio; no se limpiaron problemas fuera del alcance. Diagnósticos del editor en los nueve archivos funcionales modificados: **sin errores**.
- Tests: no hay suite/runner frontend configurado. La ruta `/designer/new?product=camisetas` cargó en navegador; se observaron solo warnings deprecados de Three.js, sin error crítico de ejecución. No se declara validación visual 3D de las cinco zonas.
- `git diff --check`: **PASS**.
- Decisión: ADR-005 aceptada para reutilizar el modelo de superficie existente y mantener bloqueada cualquier proyección 3D sin calibración verificable.
- Commit: `feat(design-core): derive 2d bounds from product surfaces` (avance parcial; no cierra BLOCK 07).
- Siguiente paso: obtener calibraciones/identificadores de superficie reales para espalda, ambas mangas y etiqueta; después validar sus decals antes de cerrar BLOCK 07 y comenzar BLOCK 08.
