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
| BLOCK 05 — Selection + Transform | PENDING | No iniciado. |
| BLOCK 06 — Tool Registry + Tool Context | PENDING | No iniciado. |
| BLOCK 07 — Product Surface | PENDING | No iniciado. |
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

## Historial

| Fecha | Bloque | Cambio |
|---|---|---|
| 2026-10-05 | BLOCK 00 | Se completó la documentación faltante y se registraron las limitaciones de evidencia. |
| 2026-10-05 | BLOCK 01 | Se añadieron contratos TypeScript puros y se validó build/lint sin modificar los tipos ni stores existentes. |
| 2026-10-05 | BLOCK 02 | Se implementaron creación, validación, serialización JSON y adaptación del canvas; build, lint y checks runtime aprobados. |
| 2026-10-05 | BLOCK 03 | Se integraron comandos compartidos al canvasStore; undo/redo y ramificación validados sin retirar el historial legacy. |
| 2026-10-05 | BLOCK 04 | Se implementaron reorder, lock y visibility de capas mediante comandos undoables e integración con Designer 2. |
