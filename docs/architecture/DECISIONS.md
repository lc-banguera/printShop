# DECISIONS.md
# PrintShop — Architectural Decision Records (ADRs) — Design Platform

**Versión:** 0.1.0  
**Última actualización:** 2026-10-05

---

## Formato

Cada ADR tiene:
- **Estado**: ACCEPTED | PROPOSED | REJECTED | SUPERSEDED
- **Contexto**: por qué fue necesaria la decisión
- **Decisión**: qué se decidió
- **Consecuencias**: qué implica
- **Alternativas consideradas**

---

## ADR-001 — Shared Design Core

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
Existen tres flujos de diseño (Personalizer, Builder, Editor). Sin un núcleo compartido, cada capacidad (selección, texto, undo/redo, layers) tendría que implementarse tres veces.

### Decisión
Crear un Design Core compartido en TypeScript puro, sin dependencias de React, Konva ni Three.js. Todos los diseñadores acceden a él a través de Zustand stores.

### Consecuencias
- Implementación única de cada capacidad
- Menor superficie de bugs
- Mayor costo inicial de diseño de la API del Core

### Alternativas consideradas
- Tres diseñadores independientes (rechazado: duplicación prohibida por AGENTS.md)
- Monolito compartido con toda la UI (rechazado: mezcla UI con lógica de negocio)

### Estado de implementación
- BLOCK 01 define los contratos TypeScript compartidos en `frontend/src/core/design/types`.
- BLOCK 04 añade `LayerManager` como capacidad compartida; los siguientes managers y la migración de otros stores siguen pendientes.

---

## ADR-002 — Shared Tool Registry

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
Actualmente las herramientas están definidas en `tools-config.ts` como objetos estáticos y la herramienta activa se gestiona en `toolsStore`. No hay ciclo de vida por herramienta ni contexto.

### Decisión
Implementar un Tool Registry formal con interfaz `Tool` que admite hooks `onActivate`, `onDeactivate` y handlers de eventos. Cada designer activa solo las herramientas que le corresponden según sus `DesignerCapabilities`.

### Consecuencias
- Herramientas reutilizables sin duplicación
- Ciclo de vida explícito (limpieza de event listeners, estado)
- Inversión de tiempo en BLOCK 06

### Alternativas consideradas
- Mantener el sistema actual de `toolsStore` simple (viable a corto plazo, no escala)

### Estado de implementación
- BLOCK 06 añade el registro y el contexto tipado al Design Core. Las herramientas se filtran por las capabilities explícitas que recibe el registry; no se inventan perfiles para D1/D3.
- El ID activo continúa siendo estado Zustand; el registry no mantiene una segunda copia. `useActiveTool.activateTool` ejecuta la transición de ciclo de vida antes de actualizar el estado.
- `tools-config.ts` conserva exports compatibles y `toolsStore` permanece como puente legacy hasta validar su integración en los diseñadores.
- `document`, `commandSystem`, `selectionManager` y `viewport` son nullable en el contexto mientras el runtime actual no los conecte a todos los diseñadores. Las herramientas legacy son descriptores sin handlers de eventos ni efectos de activación; no se simula funcionalidad.

---

## ADR-003 — Shared Command System

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
El sistema actual de undo/redo usa snapshots completos del array `elements[]` en `canvasStore`. Esto tiene limitaciones: no captura cambios de color de prenda, zoom, ni guías; el redo no reconstruye correctamente el estado futuro; y los snapshots son costosos en memoria para documentos grandes.

### Decisión
Reemplazar el sistema de snapshots por un Command System formal en BLOCK 03. Cada operación (AddElement, MoveElement, DeleteElement, etc.) es un `Command` con `execute()`, `undo()`, `redo()`.

### Consecuencias
- Undo/redo preciso y eficiente
- Comandos pueden fusionarse (e.g., múltiples moves durante drag)
- Requiere migración del código existente que usa `_history` directamente

### Estado de implementación
- BLOCK 03 añade `CommandSystem` y comandos de add/update/remove/reorder; el `canvasStore` conserva sus acciones públicas.
- BLOCK 04 integra las operaciones de reorder, lock y visibility de capas en el mismo historial de comandos.
- BLOCK 05 utiliza `CompositeCommand` para que una acción sobre varios elementos genere un único paso de undo/redo.
- `_history` y `_historyIndex` siguen disponibles como proyección legacy, pero no son la fuente de verdad de undo/redo. Se retirarán solo después de validación en producción.

---

## ADR-004 — Shared Document Model (PrintShopDocument)

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
No existe un modelo de documento formal. El estado del canvas vive en `canvasStore` (en memoria) y se pierde al recargar. No hay forma de serializar, guardar ni restaurar un diseño completo.

### Decisión
Definir `PrintShopDocument` como el schema oficial del documento de diseño, con `schemaVersion` para migraciones futuras. El documento incluye todas las superficies, capas y elementos.

### Consecuencias
- Permite persistencia real (IndexedDB, backend)
- Permite versionado de documentos
- Requiere serialización/deserialización de todos los tipos actuales

### Estado de implementación
- `CURRENT_DOCUMENT_SCHEMA_VERSION` inicia en `1.0.0`; BLOCK 02 crea y valida la estructura y proporciona round-trip JSON.
- El adaptador actual crea una capa `Artwork` por superficie para los elementos planos de canvas y conserva el campo legacy `CanvasElement.layer` en cada elemento.
- El adaptador conserva la configuración imprimible de las zonas y recibe explícitamente el ID y timestamps; no introduce persistencia ni cambia los stores.
- Migraciones entre versiones y persistencia siguen pendientes para bloques posteriores.

---

## ADR-005 — ProductSurface Abstraction

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
El área imprimible es configuración del producto y de cada zona. `ProductDefinition.printableAreas` ya contiene las coordenadas 2D y el modelo documental ya define `ProductSurface`; mantener rectángulos independientes en canvas, transforms o decals permite que diverjan.

### Decisión
Reutilizar `ProductDefinition.printableAreas[zoneId]` (`PrintableZoneConfig`) como fuente única de bounds en las operaciones 2D y en la proyección frontal calibrada. Reutilizar el `ProductSurface` del modelo documental; no introducir una segunda abstracción runtime ni inferir `safeArea` o `bleed` que no estén definidos por el producto.

La calibración física existente del decal solo es verificable para el frente del GLB actual. No extrapolarla a espalda, mangas o etiqueta a partir de proporciones 2D, rotaciones o `cameraTarget`. Esas proyecciones requieren datos físicos/semánticos reales por zona.

### Consecuencias
- Drag, drop, alta de artwork, alineación y centrado 2D respetan la superficie activa del producto.
- El decal frontal lee su área 2D de `ProductDefinition` y conserva la calibración física conocida.
- El soporte de decal 3D en las otras zonas permanece `BLOCKED` hasta incorporar calibración verificable; no se considera cerrado BLOCK 07.

---

## ADR-006 — Designer 2 Free 3D Orbit

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
El producto se puede ver en 3D con rotación libre. Alternativamente, podría forzarse a vistas fijas (Front/Back/Sleeve) con botones de navegación.

### Decisión
Mantener la cámara libre con OrbitControls sin restricciones de zona. El usuario puede rotar el producto en cualquier ángulo. La `activeZoneId` en el store determina en qué superficie se añaden los artworks.

### Consecuencias
- UX más fluida e intuitiva
- No requiere tabs obligatorios de Front/Back/Sleeve
- Los artworks se asignan a la zona activa seleccionada por el usuario, no por la posición de la cámara

### Alternativas consideradas
- Vistas fijas con tab buttons (rechazado: restringe la experiencia innecesariamente)

---

## ADR-007 — Non-destructive Image Processing

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
Los usuarios cargan imágenes de alta resolución. Cualquier edición (filtros, rotación, escala, recorte) podría aplicarse de forma destructiva (modificando el pixel original) o no-destructiva (almacenando transformaciones como metadatos).

### Decisión
El asset original (`originalImageSrc`) es **inmutable**. Todas las transformaciones (filtros `ArtworkFilters`, posición, escala, rotación) son metadatos sobre el asset original. El renderizado final aplica las transformaciones al mostrar.

### Consecuencias
- Los usuarios pueden revertir cualquier cambio
- El asset original ocupa espacio adicional pero nunca se pierde
- El motor de producción debe aplicar las transformaciones al generar el archivo final

---

## ADR-008 — Original Asset Immutable

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Decisión
Derivado de ADR-007. La URL del asset original (`originalImageSrc` en `CanvasElement`) nunca se modifica. Se puede borrar el elemento pero no sobrescribir el asset.

---

## ADR-009 — Incremental Migration

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
El Designer 2 tiene una implementación funcional completa para la camiseta. Un "big bang refactor" rompería esta funcionalidad durante la migración.

### Decisión
La Design Platform se construye incrementalmente, bloque por bloque. En cada bloque:
1. La funcionalidad existente de Designer 2 (camiseta) debe mantenerse funcional
2. La build debe pasar
3. Los nuevos componentes compartidos coexisten con los existentes hasta que estén listos

### Consecuencias
- Proceso más lento pero sin regresos
- Puede existir código duplicado transitoriamente durante la migración
- El código duplicado transitorio debe estar comentado con `// TODO: migrate to shared core after BLOCK XX`

---

## ADR-010 — No Fake 3D / No Fake Processing

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Decisión
Un producto sin modelo GLB real no puede abrirse en el Designer 2 con un modelo falso o el modelo de otro producto. Los botones para productos sin GLB están deshabilitados.

Un procesamiento de imagen que no tiene backend real (Python, C++) puede tener UI con botón disabled + tooltip explicativo, pero nunca debe simular que el procesamiento ocurrió.

### Consecuencias
- Los indicadores "Fondo eliminado: ✅" hardcoded en Designer 3 Easy son una deuda técnica que debe resolverse
- El botón "Aplicar" en Designer 3 Easy puede mostrar CSS filters como preview visual, siempre que esté claro que es una previsualización, no el resultado final

---

## ADR-011 — Zustand como State Manager Global del Designer

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
`AGENTS.md` especifica: "Estado global: Zustand. Estado local: React."

### Decisión
El estado compartido entre componentes del designer (canvas elements, viewer state, active tool) vive en Zustand stores (`canvasStore`, `viewerStore`, `toolsStore`). El estado local a un componente (hover, tooltip abierto, tab activa local) vive en `useState`.

### Consecuencias
- No duplicar estado entre stores y props
- Los Zustand stores son la fuente de verdad para el estado del editor
- Los stores no deben contener lógica de renderizado

---

## ADR-012 — device-screen.png missing (deuda técnica)

**Estado**: ACCEPTED (documenta deuda, no decisión de diseño)  
**Fecha**: 2026-10-05

### Contexto
`models3d.data.ts` referencia `imageName: 'device-screen.png'` para el modelo "Pantalla dinámica" (model-16). Este archivo no existe en `src/resources/landing_principal/images/`.

### Decisión
Documentar como deuda técnica. La imagen faltante causa un error visual en la landing (imagen rota). Resolución pendiente: reemplazar con imagen existente o proveer el asset real.

---

## ADR-013 — LayerManager preserva la representación actual del canvas

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
El panel de capas actual de Designer 2 presenta cada `CanvasElement` como una capa individual y conserva orden, lock y visibility en el propio elemento. El `PrintShopDocument` también define capas estructurales que agrupan elementos, pero Designer 2 aún no se ha migrado a ese modelo.

### Decisión
BLOCK 04 implementa `LayerManager` sobre el contexto plano existente de `CanvasElement[]` y ejecuta reorder, lock y visibility mediante el `CommandSystem`. No altera el schema del documento ni convierte cada elemento a una capa estructural antes de la integración del diseñador.

### Consecuencias
- Las acciones actuales de Designer 2 conservan su comportamiento y pasan a ser undoables.
- Los diseñadores futuros pueden reutilizar la capacidad compartida; la adaptación a capas estructurales queda para la integración del modelo de documento.
- No se duplican stores ni se introducen abstracciones de agrupación que la UI actual no representa.

---

## ADR-014 — Selección múltiple y transformaciones por lote

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
El canvas mantenía `selectedElementIds`, pero el bridge Konva y las acciones del workspace operaban solo sobre un elemento. Las actualizaciones múltiples separadas también producirían varios pasos en el historial para una sola transformación visual.

### Decisión
La selección aditiva usa Shift, Control o Command en las superficies de selección existentes. Transformaciones y acciones por lote usan comandos composites como un paso undoable; la alineación/centrado mueve el bounding box del conjunto y conserva la relación entre sus elementos. Un elemento con lock no participa de las transformaciones ni del Transformer.

Los elementos continúan siendo registros independientes: no se agrega agrupación persistente. El grupo existe solo mientras se ejecuta una operación sobre la selección.

### Consecuencias
- La selección múltiple es reutilizable entre UI y core mediante `SelectionManager`.
- `TransformSystem` comparte las operaciones de movimiento, escala, rotación, flip, alineación y centrado.
- La experiencia actual de agrupación persistente mantiene su estado previo; no se redefine como parte de este bloque.

---

## ADR-015 — Independencia del renderer 2D respecto a la calibración física 3D

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
BLOCK 07 sigue bloqueado para la proyección física de decals en espalda, mangas y etiqueta, porque el GLB disponible solo aporta evidencia verificable para `FRONT`. BLOCK 08 necesita separar la interpretación de elementos del canvas del renderer Konva; el contrato `ProductSurface` ya proporciona un ID de superficie y esa operación no requiere convertir coordenadas 2D a espacio 3D.

### Decisión
Completar BLOCK 08 usando un contrato de renderer 2D libre de Konva y pasando explícitamente el ID de la superficie activa. El adapter filtra elementos por zona, sin calcular coordenadas físicas ni cambiar la proyección 3D. La calibración pendiente no impide cerrar este bloque y BLOCK 07 continúa `BLOCKED`.

### Consecuencias
- El Design Core puede describir elementos renderizables en 2D sin depender de Konva.
- La implementación Konva permanece dentro de la feature Designer y mantiene las interacciones existentes.
- No se amplía ni se declara completado el soporte de decals fuera de la superficie frontal calibrada.

### Alternativas consideradas
- Detener todos los bloques posteriores hasta calibrar físicamente las cinco superficies (rechazado: esa información no es necesaria para el adapter 2D).
- Inferir calibraciones 3D desde proporciones del canvas o la cámara (rechazado: no hay evidencia física verificable).

---

## ADR-016 — Adapter 3D limitado a superficies calibradas

**Estado**: ACCEPTED
**Fecha**: 2026-10-05

### Contexto
BLOCK 09 debe desacoplar el Design Core de Three.js y encaminar los elementos de diseño al renderer 3D. El producto GLB actual solo tiene calibración física verificable para `front`; el resto de las superficies sigue bloqueado en BLOCK 07.

### Decisión
Definir un contrato 3D neutral a Three.js en el Core y una implementación en la feature Designer que solo emite descriptores de decal para elementos con imagen en la superficie calibrada `front`. El cálculo geométrico y el renderizado Three.js existentes permanecen en `ArtworkDecals`. El adapter devuelve `null` para cualquier otra superficie o tipo de elemento no compatible.

### Consecuencias
- El Core permanece independiente de Three.js, React Three Fiber y Drei.
- La ruta real de decals consume el adapter, manteniendo su calibración e interacciones actuales.
- BLOCK 09 puede completarse para el alcance actualmente verificable sin marcar BLOCK 07 como completo ni habilitar zonas no calibradas.

### Alternativas consideradas
- Rechazar todos los decals hasta que existan cinco calibraciones (rechazado: impediría aislar la ruta frontal que ya funciona).
- Estimar mapeos para las demás zonas (rechazado: no hay evidencia física y está prohibido inventarla).

---

*Documento creado en FASE 0 — Design Platform Architecture Phase.*
