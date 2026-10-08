# IMPLEMENTATION_ROADMAP.md
# PrintShop — Roadmap de Implementación de la Design Platform

**Versión:** 0.1.0  
**Última actualización:** 2026-10-08
**Estado actual**: BLOCK 07 sigue bloqueado por falta de calibración 3D verificable; BLOCK 08–11 están completados dentro de sus límites. BLOCK 12 está parcialmente integrado y continúa bloqueado en la integración de Tool Registry. Las rutas canónicas de Designer 3 son `/store/designerv` (entrada), `/store/designer/easy` (canvas Easy) y `/store/designer/advanced` (canvas Advanced). Easy y Advanced comparten un `PrintShopDocument` por ID, persistido localmente en IndexedDB, con handoff inmediato independiente del guardado. Easy parte de 58 × 100 cm a 300 DPI; Ajustar, Semitonos, Eliminador mágico y Borrador mágico usan procesamiento local real compartido, y las capacidades sin provider se declaran `NOT_CONFIGURED`. Advanced incorpora un registro central parcial de atajos, con agrupación y otras capacidades aún pendientes. La persistencia remota sigue pendiente. El análisis de dependencias posteriores está en [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md).

---

## Reglas del Roadmap

1. Los bloques son **secuenciales**. No comenzar el siguiente sin completar el anterior.
2. La excepción es si la inspección real demuestra una dependencia diferente — documentar en DECISIONS.md.
3. Cada bloque termina con un commit y una actualización de `IMPLEMENTATION_PROGRESS.md`.
4. El criterio final de cada bloque es `DEFINITION_OF_DONE.md`.
5. La funcionalidad existente de Designer 2 (camiseta) debe funcionar al finalizar **cada bloque**.

---

## BLOCK 00 — Baseline + Inventario

**Objetivo**: Documentar el estado real del proyecto. Sin implementar código funcional.

**Dependencias**: ninguna

**Archivos producidos**:
- `docs/architecture/DESIGN_PLATFORM_ARCHITECTURE.md`
- `docs/architecture/IMPLEMENTATION_GUARDRAILS.md`
- `docs/architecture/DESIGNER_CAPABILITY_MATRIX.md`
- `docs/architecture/PRODUCT_MODEL_CAPABILITIES.md`
- `docs/architecture/CURRENT_EDITOR_INVENTORY.md`
- `docs/architecture/ASSET_INVENTORY.md`
- `docs/architecture/DECISIONS.md`
- `docs/implementation/IMPLEMENTATION_ROADMAP.md`
- `docs/implementation/IMPLEMENTATION_PROGRESS.md`
- `docs/implementation/DEFINITION_OF_DONE.md`
- `docs/implementation/DESIGNER_1_FUNCTIONAL_SPEC.md`
- `docs/implementation/DESIGNER_2_FUNCTIONAL_SPEC.md`
- `docs/implementation/DESIGNER_3_FUNCTIONAL_SPEC.md`

**Criterios de aceptación**:
- Todos los archivos creados
- No se modificó código funcional
- Build pasa igual que antes
- Commit realizado: `docs(architecture): define design platform architecture and implementation rules`

**Estado**: COMPLETADO — entregables documentales. El estado de build y el cierre de commit se registran en [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md).

---

## BLOCK 01 — Design Core (Fundación)

**Objetivo**: Definir las interfaces y tipos del Design Core en TypeScript puro. Sin implementar renderers ni hooks de React.

**Dependencias**: BLOCK 00

**Archivos potenciales**:
- `src/core/design/types/document.ts` — PrintShopDocument, ProductSurface, Layer
- `src/core/design/types/element.ts` — migrar/extender CanvasElement
- `src/core/design/types/capabilities.ts` — DesignerCapabilities
- `src/core/design/types/index.ts`

**Resultado esperado**:
- Tipos formales del documento de diseño
- Interfaces de DesignerCapabilities definidas
- Los tipos existentes en `src/types/` se mantienen sin cambios

**Criterios de aceptación**:
- TypeScript compila sin errores nuevos
- Build pasa
- Los stores existentes siguen funcionando sin cambios
- No se rompe Designer 2

**Riesgos**:
- Conflicto de naming con tipos existentes en `src/types/`
- Solución: usar namespace `design-core/` para los nuevos tipos

**Estado**: COMPLETADO — contratos TypeScript puros definidos; sin runtime ni cambios a stores/tipos existentes.

**Siguiente bloque**: BLOCK 02

---

## BLOCK 02 — Document Model

**Objetivo**: Implementar `PrintShopDocument` como estructura de datos completa. Crear serialización/deserialización básica.

**Dependencias**: BLOCK 01

**Archivos potenciales**:
- `src/core/design/document/document-manager.ts`
- `src/core/design/document/serializer.ts`
- `src/core/design/document/schema-version.ts`

**Resultado esperado**:
- Se puede crear, serializar y deserializar un `PrintShopDocument`
- El estado del `canvasStore` actual puede convertirse a `PrintShopDocument` (función de adaptador)

**Criterios de aceptación**:
- Tests unitarios básicos (si el proyecto tiene setup de testing)
- No se rompe Designer 2

**Estado**: COMPLETADO — documento versionado, validado, serializable y adaptable desde el estado actual del canvas.

**Siguiente bloque**: BLOCK 03

---

## BLOCK 03 — Command System + History

**Objetivo**: Reemplazar el sistema de snapshots (`_history` en `canvasStore`) con un Command System formal.

**Dependencias**: BLOCK 02

**Archivos potenciales**:
- `src/core/design/commands/command.ts` — interfaz Command
- `src/core/design/commands/command-system.ts` — CommandSystem class
- `src/core/design/commands/add-element.command.ts`
- `src/core/design/commands/remove-element.command.ts`
- `src/core/design/commands/update-element.command.ts`
- `src/core/design/commands/reorder-element.command.ts`

**Resultado esperado**:
- Undo/redo basado en comandos
- El `canvasStore` usa el CommandSystem internamente
- El comportamiento de undo/redo es idéntico o mejor que el actual

**IMPORTANTE**: El `_history` actual no puede eliminarse hasta que el Command System esté validado en producción.

**Riesgos**:
- Cambio en la API del store puede romper consumidores
- Solución: mantener la API pública del store igual, cambiar solo la implementación interna

**Estado**: COMPLETADO — undo/redo se ejecuta mediante comandos; la API pública del canvasStore se conserva.

**Siguiente bloque**: BLOCK 05

---

## BLOCK 04 — Layers

**Objetivo**: Implementar un sistema de capas formal con operaciones de reorder, lock y visibility integradas al Command System.

**Dependencias**: BLOCK 03

**Archivos potenciales**:
- `src/core/design/layers/layer-manager.ts`
- `src/core/design/layers/layer-commands.ts`
- `src/store/canvas-store.ts`
- `src/features/designer/pages/designer-2-workspace.tsx`

**Resultado esperado**:
- Las operaciones de capa generan comandos en el historial
- Lock y visibility son undoables

**Estado**: COMPLETADO — reorder, lock y visibility pasan por comandos compartidos; Designer 2 conserva su representación y semántica actuales.

**Siguiente bloque**: BLOCK 05

---

## BLOCK 05 — Selection + Transform

**Objetivo**: Implementar Selection Manager y Transform System integrados al Command System.

**Dependencias**: BLOCK 04

**Archivos potenciales**:
- `src/core/design/selection/selection-manager.ts`
- `src/core/design/transform/transform-system.ts`
- `src/core/design/commands/composite.command.ts`
- `src/store/canvas-store.ts`
- Bridge Konva ↔ store y controles de selección de Designer 2

**Resultado esperado**:
- Todas las transformaciones son undoables
- Multi-selection funcional

**Riesgos**:
- El Konva Transformer actual maneja algunos transforms directamente sin pasar por el store
- Requiere refactor del bridge Konva ↔ store

**Estado**: COMPLETADO — selección múltiple, transformaciones y operaciones de lote pasan por managers compartidos y comandos undoables.

**Siguiente bloque**: BLOCK 06

**Geometría portable**: `engine/src/transform/affine-transform.ts` es la implementación común de composición, rotación, inversión y bounds 2D. El adapter de coordenadas del Designer delega allí la rotación y los bounds combinados sin cambiar sus APIs. La integración con renderers y resize interactivo sigue `PARTIAL`.

---

## BLOCK 06 — Tool Registry + Tool Context

**Objetivo**: Implementar Tool Registry formal reemplazando el sistema actual de `tools-config.ts` + `toolsStore`.

**Dependencias**: BLOCK 05

**Archivos potenciales**:
- `src/core/design/tools/tool.ts` — interfaz Tool
- `src/core/design/tools/tool-registry.ts` — ToolRegistry class
- `src/core/design/tools/tool-context.ts` — ToolContext
- `src/core/design/tools/select-tool.ts`
- `src/core/design/tools/text-tool.ts`
- `src/core/design/tools/image-tool.ts`

**Resultado esperado**:
- Las herramientas tienen ciclo de vida (onActivate/onDeactivate)
- El ToolRegistry sabe qué herramientas están disponibles según las capabilities del designer activo
- El comportamiento de las herramientas actuales se mantiene

**IMPORTANTE**: `tools-config.ts` y `toolsStore` no se eliminan hasta que el ToolRegistry esté validado.

**Estado**: COMPLETADO — registry compartido, filtrado por capabilities y transición de ciclo de vida; compatibilidad legacy preservada.

**Siguiente bloque**: BLOCK 07

---

## BLOCK 07 — Product Surface

**Objetivo**: Eliminar bounds hardcoded y usar el `ProductSurface` existente junto con `ProductDefinition.printableAreas` como fuente del runtime.

**Estado**: `BLOCKED` — se completó el uso de bounds 2D del producto, pero no existe calibración física verificable para las cuatro zonas no frontales.

**Dependencias**: BLOCK 06

**Archivos a modificar**:
- `src/store/canvas-store.ts` — `alignSelectedElement` usa coordenadas hardcoded
- `src/features/designer/pages/designer-2-workspace.tsx` — alta/centrado de artwork usa bounds del producto/zona
- `src/features/designer/components/product-viewer/artwork-decals.tsx` — `PRINT_AREA` debe recibir coordenadas desde el producto
- `src/features/designer/components/product-viewer/product-model.tsx` y `product-pivot.tsx` — propagar el área frontal calibrada
- `src/features/designer/components/canvas.tsx` — fallback hardcoded
- `src/features/designer/hooks/use-canvas-drag.ts` — fallback hardcoded
- `src/features/designer/services/canvas-config.ts` — `PRINTABLE_AREA` hardcoded

**Resultado esperado**:
- El printable area se deriva de `viewerStore.activeProduct.printableAreas[activeZoneId]`
- Los Decals 3D se posicionan correctamente según el producto activo
- El sistema soporta correctamente las 5 zonas de la camiseta

**Límite de evidencia**: La inspección del GLB disponible encontró superficies/materiales textiles etiquetados como `FRONT`, pero ninguna calibración semántica verificable para espalda, mangas o etiqueta. No derivar posiciones físicas 3D desde coordenadas 2D ni desde `cameraTarget`. Hasta disponer de calibración real por zona, registrar el soporte 3D de esas zonas como `BLOCKED` y no cerrar este bloque. La calibración 3D pendiente no bloquea BLOCK 08, que solo abstrae el renderizado 2D y filtra por la superficie activa.

**Riesgos**: Alto — un cambio de coordenadas puede desposicionar artwork existente. Validar visualmente las zonas que tengan calibración real y conservar explícita cualquier limitación.

**Siguiente bloque implementable**: BLOCK 08 (DONE, independiente de las calibraciones 3D pendientes por ADR-015). Reabrir BLOCK 07 cuando existan datos físicos verificables.

---

## BLOCK 08 — 2D Renderer Adapter

**Objetivo**: Crear un adapter que desacople el Design Core de la implementación específica de Konva.

**Dependencias**: contrato `ProductSurface` y el ID de zona disponibles desde BLOCK 01/BLOCK 07. La calibración física 3D pendiente de BLOCK 07 no es dependencia de este adapter 2D.

**Archivos potenciales**:
- `src/core/design/renderer/renderer-2d.ts` — interfaz abstracta
- `src/features/designer/renderer/konva-renderer.ts` — implementación Konva

**Resultado esperado**:
- El Design Core no importa Konva directamente
- Un futuro renderer alternativo puede implementarse sin cambiar el Core

**Siguiente bloque**: BLOCK 09

**Estado**: COMPLETADO — el contrato 2D y el adapter Konva están integrados; ver `IMPLEMENTATION_PROGRESS.md`.

---

## BLOCK 09 — 3D Renderer Adapter

**Objetivo**: Crear un adapter que desacople el Design Core de Three.js/react-three-fiber.

**Dependencias**: BLOCK 08

**Archivos potenciales**:
- `src/core/design/renderer/renderer-3d.ts` — interfaz abstracta
- `src/features/designer/renderer/threejs-renderer.ts` — implementación Three.js

**Resultado esperado**:
- La sincronización 2D→3D (artwork como Decals) se gestiona a través del adapter
- El Core no importa Three.js

**Límite**: el adapter solo entrega decals para la superficie `front`, que es la única con calibración física verificable. No habilita espalda, mangas ni etiqueta y no cierra BLOCK 07.

**Siguiente bloque**: BLOCK 10

**Estado**: COMPLETADO para la superficie frontal calibrada; las zonas no calibradas siguen excluidas.

---

## BLOCK 10 — Asset System

**Objetivo**: Implementar un sistema de gestión de assets formal (biblioteca, upload, cache).

**Dependencias**: BLOCK 09

**Archivos potenciales**:
- `src/core/design/assets/asset-manager.ts`
- `src/core/design/assets/asset-cache.ts`
- `src/core/design/assets/upload-service.ts`

**Resultado esperado**:
- Los assets tienen un ID único y URL inmutable
- La biblioteca de diseños se gestiona a través del AssetManager
- Los uploads del usuario se registran como assets

**Siguiente bloque**: BLOCK 11

**Estado**: COMPLETADO — registro e índice de metadata en memoria; los binarios y drafts no se persisten ni se cachean.

---

## BLOCK 11 — Image Processing Foundation

**Objetivo**: Crear la capa de abstracción de procesamiento de imágenes. Implementar los filtros no-destructivos reales (brightness, contrast, etc.) como procesamiento real, no solo CSS.

**Dependencias**: BLOCK 10

**Archivos potenciales**:
- `src/core/design/processing/image-processor.ts`
- `src/core/design/processing/filters.ts`
- Potencial: Web Worker para procesamiento asíncrono

**Resultado esperado**:
- Los filtros de `ArtworkFilters` se aplican mediante Canvas API en un Web Worker
- El procesamiento no bloquea el hilo principal

**Nota**: Background removal (Python/AI) es BLOCK 14.

**Siguiente bloque**: BLOCK 12

**Estado**: COMPLETADO — API compartida procesa los siete `ArtworkFilters` en un Web Worker con `OffscreenCanvas`; conserva el asset original. La integración en las experiencias de diseñador queda para sus bloques respectivos.

---

## BLOCK 12 — Designer 2 Integration

**Objetivo**: Migrar Designer 2 para usar completamente el Design Core, Tool Registry y Command System.

**Dependencias**: BLOCK 11

**Resultado esperado**:
- Designer 2 usa el Design Core para todas sus operaciones
- El comportamiento visual y funcional es idéntico o mejor
- La funcionalidad de camiseta sigue funcionando completamente

**Riesgos**: Alto — mayor bloque de migración. Dividir en sub-bloques si es necesario.

**Estado actual**: `BLOCKED (PARTIAL)`. Las mutaciones principales de D2 usan el Design Core y el Command System; Konva comparte geometría afín, bounds de drag y normalización de resize con el engine. La integración global sigue bloqueada parcialmente porque el workspace no consume el Tool Registry. Sus tabs actuales son navegación de paneles y no equivalen a herramientas de puntero. Ver ADR-019.

**Siguiente bloque**: BLOCK 13

---

## BLOCK 13 — Designer 1 Integration

**Objetivo**: Implementar Designer 1 (Personalizer) usando el Design Core.

**Dependencias**: BLOCK 12

**Pre-requisito**: Verificar qué existe en la ruta `/designer/personalize`. Si no existe componente, este bloque lo crea.

**Estado actual**: `BLOCKED`. La ruta monta un layout compartido, pero la especificación funcional mantiene el comportamiento de D1 como `UNKNOWN`; depende además de cerrar BLOCK 12.

**Resultado esperado**:
- Designer 1 completamente funcional con producto del catálogo
- Reutiliza todas las capacidades compartidas del Design Core

**Siguiente bloque**: BLOCK 14

---

## BLOCK 14 — Designer 3 Easy (procesamiento real)

**Objetivo**: Conectar Designer 3 Easy con procesamiento de imagen real.

**Dependencias**: BLOCK 13, + Python service disponible

**Requisito externo**: Servicio Python de background removal debe estar disponible.

**Subalcances independientes completados**: "Eliminar fondo" usa el algoritmo local portable del Image Engine a través del Worker; el switch de semitransparencia aplica cleanup real y se puede revertir mientras siga siendo la última salida activa. Se corrigió la conexión anterior que hacía que el switch de semitransparencia aplicara contraste en vez de limpiar alpha. El algoritmo local no equivale a un modelo/servicio externo de background removal. Easy ya ofrece scale/rotate/flip 2D con la matriz canónica del engine en preview y PNG export; Semitonos promedia cada celda con 16 muestras distribuidas sobre su área completa, validado con pruebas del engine y smoke de navegador. Los presets de producción siguen pendientes y la exportación de producción depende de BLOCK 16.

**Estado actual**: `PARTIAL / BLOCKED`. Eliminación local de fondo y cleanup de semitransparencia están integrados en Designer 3 Easy por el Worker compartido; Undo/Redo cubre imagen, procesamiento y transformaciones 2D. Posición por arrastre/flechas, rotación, flip y escala usan `createArtworkTransformMatrix` para preview y PNG export. El artwork seleccionado tiene handles directos de resize proporcional y rotación sobre el canvas; el resize y la rotación se verificaron en navegador con Undo/Redo. El PNG descargable incluye metadata física `pHYs` del DPI seleccionado, insertada con slices del Blob original sin reconstruir el raster. Easy usa `/store/designer/easy`; su artwork y configuración actualizan el `PrintShopDocument` compartido con Advanced y guardan un snapshot de modo en IndexedDB. Easy sigue siendo una vista de imagen única y no renderiza las demás capas Advanced. Pan con la herramienta mano solo desplaza el viewport; Zoom/pan del workspace no altera la resolución raster. PDF y export de producción no están configurados, no hay provider externo/Python y los perfiles de producción no tienen transformaciones definidas.

**Resultado esperado**:
- El botón "Eliminar fondo" llama a un servicio real
- Los indicadores de proceso reflejan el estado real
- La exportación produce un PNG de alta resolución

**Nota**: Si el servicio Python no está disponible, mantener los botones disabled con tooltip claro.

**Siguiente bloque**: BLOCK 15

---

## BLOCK 15 — Designer 3 Advanced

**Objetivo**: Implementar el modo avanzado de Designer 3 con capas, texto, formas y efectos.

**Dependencias**: BLOCK 14

**Pre-requisito**: Verificar qué existe en `/designer/advanced`. Si no hay componente, este bloque lo crea.

**Subalcance independiente completado**: ImageTools de Advanced ofrece Recorte poligonal para la imagen seleccionada. El contorno cerrado usa `create-path-selection` y `erase-mask` del Worker compartido para conservar el interior y volver transparente el exterior; el original se mantiene y la aplicación es undoable. La selección es raster temporal: no se serializan paths y la edición de anchors/handles continúa pendiente.

**Subalcance independiente completado**: ImageTools de Advanced permite eliminar una región conectada a partir de un píxel semilla, tolerancia y conectividad 4/8. El Worker genera la preview de máscara y aplica el borrado alpha sobre el artwork; la operación queda en el historial undoable. No altera el modelo de selección de objetos ni agrega estado de máscara persistente al documento.

**Estado actual**: `PARTIAL / BLOCKED`. `/store/designer/advanced` monta el editor Advanced de Tienda y no el `DesignerLayout` de Designer 1. Cambiar entre Easy y Advanced mantiene el mismo `?document=<id>` y actualiza un único `PrintShopDocument` en IndexedDB; los snapshots por modo permiten restaurar cada vista después de refresh. El modo Easy conserva las capas Advanced en el documento aunque no las renderice. Advanced delega select/toggle/multiselect al `SelectionManager` compartido y dispone de atajos centrales parciales; Undo/Redo usa el `CommandSystem` compartido con snapshots de estado Advanced en memoria de sesión (no se serializa al recargar), y la disponibilidad de sus controles se refleja en React al ejecutar, deshacer, rehacer y cambiar de documento. El menú contextual de capas ofrece duplicar/eliminar, orden, lock y visibilidad, conectado a operaciones existentes; Escape/click fuera cierran el menú y duplicar/lock/undo/redo se verificaron en navegador. ImageTools integra limpieza de semitransparencias con preview de hasta 500 px, aplicación a resolución completa y un único cambio undoable; el original se conserva. Ajustes y Filtros invocan diálogos existentes; la opacidad modifica la propiedad persistida de la capa seleccionada. Las herramientas y entradas de menú sin operación de documento se deshabilitan y exponen la razón en vez de mostrar controles simulados; los modos de fusión alternativos se declaran `NOT_CONFIGURED` porque no están en el contrato/renderizado. El export actual incluye el documento completo a resolución de vista previa con proporción conservada; no aplica metadata DPI ni un pipeline de efectos/preflight de producción. Agrupar/Desagrupar queda `NOT_CONFIGURED` y deshabilitado porque el contrato canónico de documento no representa jerarquía de grupos; multiselección permite mover/alinear/distribuir como workaround. El desbloqueo requiere agregar y serializar una relación de grupo antes de implementar las operaciones y su renderizado/historial. La exportación de producción y otras capacidades D3 Advanced siguen pendientes; no se infieren desde D2 o Easy.

**Resultado esperado**:
- Modo avanzado completamente funcional
- Reutiliza herramientas del Design Core

**Siguiente bloque**: BLOCK 16

---

## BLOCK 16 — Production Engine

**Objetivo**: Implementar el motor de producción: export de alta resolución, selección de método de impresión funcional.

**Dependencias**: BLOCK 15, + Spring Boot API de producción disponible

**Estado actual**: `BLOCKED`. En el repositorio inspeccionado existe un servidor Express para otros dominios; no se encontraron APIs de diseño/producción ni un proyecto Spring Boot.

**Resultado esperado**:
- Export a PNG de alta resolución (300 DPI)
- Los perfiles de producción (DTF, sublimación, etc.) aplican transformaciones correctas
- Integración con el flujo de órdenes

**Siguiente bloque**: BLOCK 17

---

## BLOCK 17 — Persistence / Autosave

**Objetivo**: Implementar autosave en IndexedDB y persistencia en backend.

**Dependencias**: BLOCK 16, + Spring Boot API de documentos disponible

**Estado actual**: `BLOCKED` para persistencia remota: no se encontraron APIs de documentos. Designer 3 implementa identidad por ID y recuperación/autosave local con IndexedDB como adapter; no sustituye una API remota ni define persistencia compartida entre dispositivos.

**Resultado esperado**:
- Los diseños se guardan automáticamente en IndexedDB cada 30 segundos
- Los diseños se pueden guardar en el backend
- Los diseños se pueden cargar desde el backend

**Siguiente bloque**: BLOCK 18

---

## BLOCK 18 — Performance

**Objetivo**: Optimizar rendimiento: Web Workers, OffscreenCanvas, lazy loading de assets.

**Dependencias**: BLOCK 17 para validar el flujo integral con documentos persistidos. La carga diferida de miniaturas de bibliotecas existentes es independiente.

**Estado actual**: `PARTIAL / BLOCKED`. BLOCK 11 ya procesa imágenes en Worker. Un `IntersectionObserver` compartido difiere la asignación de `src` en miniaturas de las bibliotecas D2 y del sidebar; este subalcance no depende de BLOCK 17. La fluidez de Konva con documentos de múltiples elementos aún no cuenta con una carga objetivo ni evidencia de profiling.

**Subalcance independiente completado**: diferir la descarga/decodificación de miniaturas hasta 200 px del viewport. No altera el documento, la imagen colocada ni la miniatura del producto.

**Resultado esperado**:
- El procesamiento de imágenes no bloquea el UI
- Los assets grandes se cargan bajo demanda
- El render de Konva es fluido con múltiples elementos

**Siguiente bloque**: BLOCK 19

---

## BLOCK 19 — Testing + Stabilization

**Objetivo**: Validación completa de todos los diseñadores. Corrección de regresiones. Documentación final.

**Dependencias**: BLOCK 18

**Resultado esperado**:
- Los tres diseñadores funcionan correctamente
- Sin errores críticos de consola
- Responsive funcional en desktop y tablet
- Documentación actualizada

**Estado actual**: `PARTIAL / BLOCKED`. Se validaron por navegador los subalcances implementados, pero no se puede certificar los tres diseñadores mientras D1 sea `UNKNOWN` y sigan incompletas la integración de tools, producción y persistencia. El frontend no cuenta con runner de pruebas configurado.

---

*Documento creado en FASE 0 — Design Platform Architecture Phase.*

---

## PORTABLE ENGINE TRACK — Extracción incremental

Este track convierte el Design Core existente en una fuente canónica portable en `/engine`. Los módulos frontend que ya tenían consumidores se conservan como adapters/reexports hasta que cada integración pueda migrarse sin cambiar contratos.

| Bloque | Estado | Resultado / siguiente acción |
|---|---|---|
| Engine Bootstrap + extracción de bloques 01–06 | DONE | Paquete TypeScript aislado, modelos y managers existentes migrados, fachada frontend compatible y prueba vertical de documento/capas/selección/transformación/undo/redo. |
| Path + Selection Engine | PARTIAL | Engine portable con paths abiertos/cerrados, anchors CORNER/SMOOTH, segmentos LINE/CUBIC_BEZIER, flattening de Bézier y rasterización antialias de selección a las dimensiones raster solicitadas; Easy envía el contorno cerrado al Worker. La edición interactiva de anchors/handles en Advanced aún no está implementada. |
| Image Processing Engine | PARTIAL | Operaciones puras reales para alpha/masks, effect stack, Remove Background, Halftone, cleanup semitransparencia, análisis/recolor, PNG y DTF preflight. Remove Background usa muestras múltiples de borde, refinamiento morfológico opcional, conectividad configurable y feather limitado a los bordes; el procesamiento no semántico no sustituye segmentación ML y necesita regresión con imágenes reales. Semitransparency cleanup ofrece además una política opt-in para ruido aislado que preserva alpha conectado a bordes opacos. Halftone pondera muestras por alpha visible y antialiasa puntos en cobertura subpixel. ImageBuffer soporta extracción/copia de regiones acotadas, coordenadas de píxel estrictas y clamping de canales. La escala raster distingue resolución px, dimensiones de impresión y DPI efectivo; bilinear premultiplied-alpha es opcional y no se mezcla con zoom/transform visual. El Worker despacha operaciones raster y filtros no destructivos; filtros de artwork se reflejan en la textura 3D de D2, Remove Background/Halftone y grayscale/invert/ajustes están integrados en `ImageTools`, y Remove Background/cleanup en D3 Easy. Upscale/JPEG requieren provider/encoder. |
| Mask Refinement | PARTIAL | Se agregaron combine add/subtract/intersect, invert, grow/shrink, clean (opening + closing), fill holes y eliminación de islas por tamaño mínimo al engine compartido. Falta integrar refinamiento como capability de UI/selección; no se inventan controles Easy. |
| Geometría afín + composición raster | PARTIAL | Preview/export del Designer clásico comparten matrices centradas para rotate y flip global X/Y; export usa `compositeRasterLayers` con z-order/visibility/opacity/clipping/alpha. Engine tests verifican flips, rotación, mezcla y escala normalizada. Pendiente Konva/D2, resize interactivo, otros designers y runtime de export con artwork real. |
| Designer 3 — entrada `/store/designerv` | PARTIAL / BLOCKED | Pantalla para crear, abrir y cargar documentos; no es un canvas. |
| Designer 3 Easy — `/store/designer/easy` | PARTIAL / BLOCKED | Eliminación local de fondo, cleanup, transforms 2D del artwork, resize/rotación con handles y Undo/Redo, y PNG con dimensiones físicas/DPI y metadata `pHYs` verificada. El Eliminador Mágico usa región conectada con tolerancia de color/alpha y conectividad elegible en el engine; el modo Dibujar trazo rasteriza el path poligonal en el Worker a resolución real y comparte máscara/preview/aplicación/historial. Comparte el `PrintShopDocument` e ID con Advanced mediante IndexedDB; sigue siendo una vista de imagen única. Faltan provider externo, reglas de presets y exportación de producción. |
| Designer 3 Advanced — `/store/designer/advanced` | PARTIAL / BLOCKED | Comparte y restaura el mismo documento local que Easy, incluidas capas, artwork y transformaciones conservadas. Selección vía `SelectionManager`, atajos centrales parciales, Undo/Redo mediante `CommandSystem` en memoria de sesión, limpieza de semitransparencias y recorte poligonal raster mediante Worker con aplicación undoable, menú contextual de capas y export rasterizado del documento completo a resolución de vista previa. Exportación de producción/DPI/efectos, edición de paths persistentes y agrupación siguen pendientes; el alcance funcional completo sigue sin especificación verificable. |
| Designer 1 — `/designer/personalize` | PENDING | Integrar capacidades comunes verificadas, sin inventar funcionalidades específicas del flujo. |
| Designer 2 — `/designer/new` | PARTIAL / BLOCKED | Los filtros de artwork se procesan en el Worker y actualizan la textura 3D con preview limitada. Sigue pendiente integrar/verificar el resto de document, commands/history, selection, transform y layers; el workspace no consume Tool Registry y sus tabs conservan semántica de navegación. |
| AI Provider + Command Bridge | PENDING | Definir providers/request/response/context/tool/bridge server-side; traducir intenciones a comandos del engine sin acceso a UI/Zustand. |
| BLOCK 07 — calibración/proyección 3D | DEFERRED | No implementar sin datos de calibración verificables por superficie. |

La continuidad de este track no invalida los estados históricos de los bloques del frontend registrados arriba; documenta la extracción portable en curso y su secuencia posterior.

## Designer 3 Professional Sprint — estado de ejecución

- Prioridades 1–3 en curso: Path/Selection Engine `PARTIAL`; selección conectada y poligonal local verificadas; Mask Refinement amplió su API portable, pendiente de integración con consumidores.
- Paths y selección raster usan coordenadas del documento/raster y no dependen del tamaño CSS ni del zoom. Curvas cúbicas cuentan con flattening geométrico de tolerancia controlada; la UI actual de Easy crea segmentos rectos mediante puntos.
- Validación actual del bloque: `npm test --prefix engine` PASS (55/55); `npm run build --prefix frontend` PASS. Browser smoke en Easy confirmó path poligonal → Worker → aplicar → undo → redo; Advanced confirmó recorte poligonal raster sobre una capa seleccionada, cambio de artwork y restauración exacta con undo/redo.
- Siguiente foco independiente: definir el contrato serializable para paths editables antes de implementar anchors/handles en Advanced. No se afirma que el sprint completo, Advanced ni la demo independiente estén cerrados.

### BLOCKER — paths persistentes en Advanced

- **BLOCKER**: edición y guardado de paths/anchors como elementos del documento.
- **REASON**: `DesignElement` no declara tipo ni geometría de path; `DocumentManager` valida tipos cerrados y el renderer Advanced solo dibuja imagen, texto y formas. `VectorPath` existe en el engine para rasterizar selecciones, no como elemento serializable del documento.
- **WORKAROUND**: el recorte poligonal actual produce una máscara raster temporal y aplica el resultado a la imagen seleccionada con Undo/Redo.
- **UNBLOCK CONDITION**: acordar esquema/versionado serializable para paths, su validación, adaptación a Designer 3, render, export e historial undoable, con pruebas de round-trip y refresh.
- **NEXT AVAILABLE WORK**: seguir integrando operaciones raster del Worker en ImageTools cuando su comportamiento esté definido; la eliminación de región por color quedó implementada y validada en este bloque.
