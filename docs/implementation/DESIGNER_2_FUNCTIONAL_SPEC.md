# PrintShop — Especificación funcional: Designer 2 (Builder)

**Versión:** 0.1.0-draft  
**Última actualización:** 2026-10-05  
**Estado de evidencia:** `PARTIAL` — implementación verificada para la camiseta; algunas acciones visibles no están conectadas a servicios funcionales.

## 1. Propósito y alcance

Designer 2, también llamado **Builder**, es la experiencia documentada para crear un producto desde cero mediante un workspace con herramientas 2D y visualización 3D. El estado real aquí registrado está limitado al producto y comportamiento descritos en [CURRENT_EDITOR_INVENTORY.md](../architecture/CURRENT_EDITOR_INVENTORY.md), [PRODUCT_MODEL_CAPABILITIES.md](../architecture/PRODUCT_MODEL_CAPABILITIES.md) y [ASSET_INVENTORY.md](../architecture/ASSET_INVENTORY.md).

Esta especificación registra el baseline existente; no convierte los botones visibles sin integración en requisitos funcionales nuevos.

## 2. Entrada y flujo existente

1. `/designer/new` muestra la selección de productos por categoría.
2. La camiseta disponible abre el workspace mediante `/designer/new?product=camisetas`.
3. El workspace combina canvas 2D, viewer 3D, biblioteca y controles de propiedades/capas.
4. El usuario puede editar elementos del diseño y observarlos como decals sobre el modelo 3D de camiseta.

La única `ProductDefinition` registrada y el único GLB funcional documentados corresponden a la camiseta. Los demás productos sin modelo 3D no deben presentarse como editables en 3D ni usar el GLB de camiseta como sustituto.

## 3. Capacidades del baseline

| Área | Estado documentado |
|---|---|
| Viewer 3D de camiseta, órbita libre, zoom, reset de vista, guías y grid | `IMPLEMENTED` |
| Proyección de artwork como decals 3D | `PARTIAL`; solo el frente tiene calibración física verificable en el GLB disponible |
| Biblioteca local con búsqueda y tabs documentados | `IMPLEMENTED` |
| Subida de imagen por selección o drag & drop y validación de tipo/tamaño documentada | `IMPLEMENTED` |
| Creación de texto rasterizado y controles tipográficos descritos en inventario | `IMPLEMENTED` |
| Selección, transformaciones, alineación, flip, opacidad y operaciones de capas descritas en inventario | `IMPLEMENTED` |
| Undo / redo por snapshots | `PARTIAL`; redo tiene limitaciones documentadas |
| Multi-selección / agrupación | `PARTIAL`; la agrupación tiene limitaciones conocidas |
| Guardar, descargar y producir/agregar al carrito | `PARTIAL`; los botones no representan persistencia, exportación ni integración real con órdenes |
| Shapes e IA Generar | `PARTIAL`; la UI existe, pero no se confirma creación funcional de shapes ni backend de IA |
| Procesamiento raster compartido de `ArtworkFilters` | `PARTIAL`; API Worker de BLOCK 11 disponible, aún sin integración en el flujo de edición |
| Persistencia, autosave, preflight y motor de producción | `PLANNED` / no implementado según inventario |

Los estados reflejan la evidencia existente y deben corregirse solo con verificación de código y ejecución. La matriz detallada está en [DESIGNER_CAPABILITY_MATRIX.md](../architecture/DESIGNER_CAPABILITY_MATRIX.md).

## 4. Invariantes que deben preservarse

- La ruta `/designer/new?product=camisetas` debe seguir resolviendo el workspace de Designer 2.
- El GLB de camiseta no se reutiliza como modelo de otro producto.
- No se inventan rutas de assets ni se altera el asset original del usuario; transformaciones y filtros se mantienen no destructivos, según [DECISIONS.md](../architecture/DECISIONS.md).
- El área imprimible se trata como específica del producto/zona y sus bounds 2D se leen desde `ProductDefinition.printableAreas`.
- Las zonas 2D usan `ProductDefinition.printableAreas`; la proyección física 3D fuera del frente no se considera implementada hasta contar con calibración real por zona.
- No se declara que guardar, descargar, producir, IA o procesamiento estén conectados mientras no exista evidencia de la operación real.
- Se conservan las responsabilidades actuales de `canvasStore`, `viewerStore` y `toolsStore` hasta que un bloque aprobado cambie su implementación de forma compatible.

Consultar [IMPLEMENTATION_GUARDRAILS.md](../architecture/IMPLEMENTATION_GUARDRAILS.md).

## 5. Límites y trabajo posterior

- BLOCK 01–11 establece las partes compartidas que el roadmap requiere antes de BLOCK 12.
- La integración de D2 debe conservar la funcionalidad existente del Builder para la camiseta y validar las zonas imprimibles descritas.
- Guardado, descarga, carrito, IA, formas y producción requieren sus integraciones reales y no se consideran especificados en detalle por la mera presencia de UI.
- Cualquier cambio de flujo, campos, comportamiento de negocio, contratos o permisos queda fuera de esta especificación y requiere definición/aprobación explícita.

## 6. Criterio de verificación

Al integrar D2 en BLOCK 12, comparar contra el baseline de inventario: ruta y selección de la camiseta, edición 2D, viewer/decals 3D, herramientas listadas y estados parciales. Registrar pruebas y limitaciones en `IMPLEMENTATION_PROGRESS.md`; no elevar capacidades de estado por inferencia.
