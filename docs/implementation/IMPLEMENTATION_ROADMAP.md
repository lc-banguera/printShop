# IMPLEMENTATION_ROADMAP.md
# PrintShop — Roadmap de Implementación de la Design Platform

**Versión:** 0.1.0  
**Última actualización:** 2026-10-05  
**Estado actual**: BLOCK 02 completado; BLOCK 03 es el siguiente — ver [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)

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

**Siguiente bloque**: BLOCK 04

---

## BLOCK 04 — Layers

**Objetivo**: Implementar un sistema de capas formal con operaciones de reorder, lock y visibility integradas al Command System.

**Dependencias**: BLOCK 03

**Archivos potenciales**:
- `src/core/design/layers/layer-manager.ts`
- `src/core/design/commands/reorder-layer.command.ts`
- `src/core/design/commands/toggle-lock.command.ts`
- `src/core/design/commands/toggle-visibility.command.ts`

**Resultado esperado**:
- Las operaciones de capa generan comandos en el historial
- Lock y visibility son undoables

**Siguiente bloque**: BLOCK 05

---

## BLOCK 05 — Selection + Transform

**Objetivo**: Implementar Selection Manager y Transform System integrados al Command System.

**Dependencias**: BLOCK 04

**Archivos potenciales**:
- `src/core/design/selection/selection-manager.ts`
- `src/core/design/transform/transform-system.ts`
- Comandos: MoveElement, ScaleElement, RotateElement, AlignElement, FlipElement, DuplicateElement, DeleteElement

**Resultado esperado**:
- Todas las transformaciones son undoables
- Multi-selection funcional

**Riesgos**:
- El Konva Transformer actual maneja algunos transforms directamente sin pasar por el store
- Requiere refactor del bridge Konva ↔ store

**Siguiente bloque**: BLOCK 06

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

**Siguiente bloque**: BLOCK 07

---

## BLOCK 07 — Product Surface

**Objetivo**: Eliminar el printable area hardcoded. Implementar `ProductSurface` que lea de `ProductDefinition`.

**Dependencias**: BLOCK 06

**Archivos a modificar**:
- `src/store/canvas-store.ts` — `alignSelectedElement` usa coordenadas hardcoded
- `src/features/designer/components/product-viewer/artwork-decals.tsx` — `PRINT_AREA` hardcoded
- `src/features/designer/components/canvas.tsx` — fallback hardcoded
- `src/features/designer/services/canvas-config.ts` — `PRINTABLE_AREA` hardcoded

**Resultado esperado**:
- El printable area se deriva de `viewerStore.activeProduct.printableAreas[activeZoneId]`
- Los Decals 3D se posicionan correctamente según el producto activo
- El sistema soporta correctamente las 5 zonas de la camiseta

**Riesgos**: Alto — cambio de coordenadas puede desposicionar artwork existente. Validar visualmente en las 5 zonas.

**Siguiente bloque**: BLOCK 08

---

## BLOCK 08 — 2D Renderer Adapter

**Objetivo**: Crear un adapter que desacople el Design Core de la implementación específica de Konva.

**Dependencias**: BLOCK 07

**Archivos potenciales**:
- `src/core/design/renderer/renderer-2d.ts` — interfaz abstracta
- `src/features/designer/renderer/konva-renderer.ts` — implementación Konva

**Resultado esperado**:
- El Design Core no importa Konva directamente
- Un futuro renderer alternativo puede implementarse sin cambiar el Core

**Siguiente bloque**: BLOCK 09

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

**Siguiente bloque**: BLOCK 10

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

---

## BLOCK 12 — Designer 2 Integration

**Objetivo**: Migrar Designer 2 para usar completamente el Design Core, Tool Registry y Command System.

**Dependencias**: BLOCK 11

**Resultado esperado**:
- Designer 2 usa el Design Core para todas sus operaciones
- El comportamiento visual y funcional es idéntico o mejor
- La funcionalidad de camiseta sigue funcionando completamente

**Riesgos**: Alto — mayor bloque de migración. Dividir en sub-bloques si es necesario.

**Siguiente bloque**: BLOCK 13

---

## BLOCK 13 — Designer 1 Integration

**Objetivo**: Implementar Designer 1 (Personalizer) usando el Design Core.

**Dependencias**: BLOCK 12

**Pre-requisito**: Verificar qué existe en la ruta `/designer/personalize`. Si no existe componente, este bloque lo crea.

**Resultado esperado**:
- Designer 1 completamente funcional con producto del catálogo
- Reutiliza todas las capacidades compartidas del Design Core

**Siguiente bloque**: BLOCK 14

---

## BLOCK 14 — Designer 3 Easy (procesamiento real)

**Objetivo**: Conectar Designer 3 Easy con procesamiento de imagen real.

**Dependencias**: BLOCK 13, + Python service disponible

**Requisito externo**: Servicio Python de background removal debe estar disponible.

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

**Resultado esperado**:
- Modo avanzado completamente funcional
- Reutiliza herramientas del Design Core

**Siguiente bloque**: BLOCK 16

---

## BLOCK 16 — Production Engine

**Objetivo**: Implementar el motor de producción: export de alta resolución, selección de método de impresión funcional.

**Dependencias**: BLOCK 15, + Spring Boot API de producción disponible

**Resultado esperado**:
- Export a PNG de alta resolución (300 DPI)
- Los perfiles de producción (DTF, sublimación, etc.) aplican transformaciones correctas
- Integración con el flujo de órdenes

**Siguiente bloque**: BLOCK 17

---

## BLOCK 17 — Persistence / Autosave

**Objetivo**: Implementar autosave en IndexedDB y persistencia en backend.

**Dependencias**: BLOCK 16, + Spring Boot API de documentos disponible

**Resultado esperado**:
- Los diseños se guardan automáticamente en IndexedDB cada 30 segundos
- Los diseños se pueden guardar en el backend
- Los diseños se pueden cargar desde el backend

**Siguiente bloque**: BLOCK 18

---

## BLOCK 18 — Performance

**Objetivo**: Optimizar rendimiento: Web Workers, OffscreenCanvas, lazy loading de assets.

**Dependencias**: BLOCK 17

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

---

*Documento creado en FASE 0 — Design Platform Architecture Phase.*
