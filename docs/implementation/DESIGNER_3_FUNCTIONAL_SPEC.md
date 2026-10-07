# PrintShop — Especificación funcional: Designer 3 (Editor)

**Versión:** 0.1.0-draft  
**Última actualización:** 2026-10-07
**Estado de evidencia:** `PARTIAL` para Easy (canvas, procesamiento raster local, PNG, viewport y transforms 2D del artwork) y para la existencia del layout Advanced; sus capacidades específicas siguen `UNKNOWN`.

## 1. Propósito documentado

Designer 3, también llamado **Editor**, agrupa los modos Easy y Advanced para preparar y editar diseños gráficos. El inventario actual confirma una pantalla de modo Easy con limitaciones de backend. `/designer/advanced` resuelve a `DesignerLayout`, pero la evidencia disponible no establece qué capacidades de D3 Advanced cumple. Esta especificación no presupone que ambos modos tengan capacidades equivalentes.

Consultar [CURRENT_EDITOR_INVENTORY.md](../architecture/CURRENT_EDITOR_INVENTORY.md) y [DESIGNER_CAPABILITY_MATRIX.md](../architecture/DESIGNER_CAPABILITY_MATRIX.md).

El modal "Nuevo lienzo" actualmente solo tiene como punto de montaje verificado `/store/designer`; no se encontró una segunda instancia desde Cliente.

## 2. Designer 3 Easy — estado observado

| Elemento | Estado documentado |
|---|---|
| Ruta `/designer/easy` y `DesignerEasyModePage` | `IMPLEMENTED` (UI) |
| Entrada desde "Nuevo lienzo" con Modo avanzado OFF | Navega a `/designer/easy`, consume `NewCanvasConfig` desde `location.state` y aplica tamaño físico, DPI y fondo inicial |
| Selección de imagen desde el botón de upload | `IMPLEMENTED` |
| Técnica DTF | `PARTIAL`; la opción visible puede seleccionarse, pero no aplica transformaciones de perfil |
| Eliminar fondo | `IMPLEMENTED` localmente mediante el Worker compartido; el resultado es un asset separado y el original permanece intacto. No equivale a un proveedor externo de IA |
| Eliminar semitransparencias | `IMPLEMENTED` mediante el Worker; el toggle modifica el asset procesado y puede deshacerse/rehacerse |
| Canvas físico | `IMPLEMENTED`; tamaño, DPI y fondo controlan la presentación y el PNG rasterizado |
| Zoom, pan y centrar lienzo | `IMPLEMENTED` como transformaciones del viewport; no cambian la escala de impresión ni el raster exportado |
| Undo / Redo | `PARTIAL`; snapshots de imagen, dimensiones de procesamiento, semitransparencia y transformaciones; no es historial de documento multicapa |
| Descargar PNG | `IMPLEMENTED`; exporta el canvas al tamaño físico/DPI configurados, con fondo transparente o seleccionado, limitado a 40 MP y 16.000 px por lado |
| Descargar PDF | `NOT CONFIGURED`; permanece disabled porque no hay encoder PDF integrado |
| Duplicar imagen / capas múltiples | `NOT CONFIGURED`; duplicar permanece disabled porque Easy actualmente representa una sola imagen activa |
| Guardar / persistencia | `BLOCKED`; no existe persistencia verificada |
| Transformar artwork | `PARTIAL`; escala uniforme (10–400%), rotación en pasos de 90° y flips X/Y usan una matriz canónica del engine tanto en preview como en PNG export. No hay posición por arrastre ni documento multicapa |

La eliminación de fondo y el cleanup actúan sobre una copia raster local; no deben presentarse como servicio externo. El PNG exportado no afirma aplicar perfiles de impresión ni verificación de preflight.

## 3. Designer 3 Advanced — estado observado

| Elemento | Estado |
|---|---|
| Ruta `/designer/advanced` | `DesignerLayout` vía `App.tsx`; cargó en navegador |
| Pantalla Advanced | `PARTIAL` — la UI compartida se monta; no se verificó que todas sus capacidades correspondan al alcance Advanced |
| Entrada avanzada desde "Nuevo lienzo" en `/store/designer` | Usa el `DesignerWorkspace` ya existente de `StoreDesigner` y aplica el `NewCanvasConfig`; no navega a `/designer/advanced`, cuyo layout compartido no es un destino verificado de D3 |
| Herramientas, operaciones, estado y persistencia | `UNKNOWN` |

No se deben derivar requisitos para Advanced a partir de la interfaz Easy, Designer 2 o el destino del enlace de navegación.

## 4. Límites y pendientes de verificación

1. Inspeccionar el layout compartido y verificar sus interacciones antes de atribuir capacidades específicas a Advanced.
2. Confirmar en código los controles y estados de Easy antes de cualquier cambio en su comportamiento.
3. Definir transformaciones específicas de producción para cada perfil antes de habilitarlas; los transforms geométricos generales no aplican un perfil DTF.
4. Ampliar la integración geométrica a posición interactiva y capas cuando exista un modelo verificable; los transforms de Easy implementados ya comparten matriz entre preview y export, separados de zoom/pan del viewport.
5. Conectar un proveedor externo solo si se requiere background removal con IA; mantener distinto el algoritmo local ya disponible.
6. Integrar PDF, perfiles de producción y preflight solo cuando exista un pipeline verificable.
7. Actualizar este documento y la matriz con evidencia real antes de atribuir capacidades a Advanced.

Estos pendientes no introducen decisiones de producto; preservan como `UNKNOWN` aquello no comprobado.

## 5. Criterio de verificación

Para cambios futuros en Easy, contrastar upload, preset, preview/comparación, navegación y estado de los controles con el baseline documentado. Para Advanced, primero confirmar la pantalla y acordar su alcance; no marcar capacidades como `IMPLEMENTED` sin operación funcional comprobada.
