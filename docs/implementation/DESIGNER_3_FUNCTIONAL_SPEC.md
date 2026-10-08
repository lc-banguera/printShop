# PrintShop — Especificación funcional: Designer 3 (Editor)

**Versión:** 0.1.0-draft  
**Última actualización:** 2026-10-08
**Estado de evidencia:** `PARTIAL` para Easy y Advanced. La entrada, las rutas, el identificador compartido, el handoff y persistencia local están implementados; el alcance integral de ambos editores sigue parcial.

## 1. Propósito documentado

Designer 3, también llamado **Editor**, agrupa una pantalla de entrada y dos canvases que operan sobre el mismo documento:

- `/store/designerv`: entrada para crear, abrir o cargar un diseño.
- `/store/designer/easy`: canvas Easy.
- `/store/designer/advanced`: canvas Advanced de Tienda; no es Designer 1.

Easy y Advanced usan el mismo `PrintShopDocument`, identificado por `?document=<id>`. Los snapshots de cada modo son proyecciones asociadas al documento, no fuentes independientes de verdad.

Consultar [CURRENT_EDITOR_INVENTORY.md](../architecture/CURRENT_EDITOR_INVENTORY.md) y [DESIGNER_CAPABILITY_MATRIX.md](../architecture/DESIGNER_CAPABILITY_MATRIX.md).

El modal "Nuevo lienzo" parte de 58 × 100 cm a 300 DPI. El tamaño físico y el zoom de pantalla son valores distintos; el viewport ajusta el lienzo al área de trabajo.

## 2. Designer 3 Easy — estado observado

| Elemento | Estado documentado |
|---|---|
| Ruta `/store/designer/easy` y `DesignerEasyModePage` | `IMPLEMENTED` |
| Entrada desde "Nuevo lienzo" con Modo avanzado OFF | Crea un documento identificado y navega a Easy con `?document=<id>`; aplica el tamaño físico, DPI y fondo elegidos |
| Tamaño inicial | 58 × 100 cm a 300 DPI; controles de dimensión con paso de 1 cm |
| Cambio a Advanced | Navega a `/store/designer/advanced` inmediatamente con el mismo ID; guarda el snapshot Easy en segundo plano y usa el handoff en memoria durante la navegación |
| Herramientas: Ajustar | `IMPLEMENTED` localmente para brillo, contraste y saturación mediante el Web Worker compartido; undo/redo conserva el estado |
| Herramientas: Semitonos | `IMPLEMENTED` localmente mediante la operación `halftone` del Worker/engine compartido; expone tamaño, ángulo, intensidad, contraste, forma, inversión, color del punto y fondo/transparencia |
| Herramientas: Eliminador mágico y Borrador mágico | `IMPLEMENTED` localmente mediante máscara compartida de región conectada o trazo; genera una imagen derivada, conserva el original y se integra al historial undo/redo |
| Escalar/Mejorar, Vectorizar, Capas mágicas y Edición mágica | `NOT_CONFIGURED`; muestran el estado explícitamente y no generan resultados simulados |
| Selección de imagen desde el botón de upload | `IMPLEMENTED` |
| Técnica DTF | `PARTIAL`; la opción visible puede seleccionarse, pero no aplica transformaciones de perfil |
| Eliminar fondo | `IMPLEMENTED` localmente mediante el Worker compartido; el resultado es un asset separado y el original permanece intacto. No equivale a un proveedor externo de IA |
| Eliminar semitransparencias | `IMPLEMENTED` mediante el Worker; activar y desactivar el cleanup son transiciones de historial reversibles que conservan transforms posteriores |
| Canvas físico | `IMPLEMENTED`; tamaño, DPI y fondo controlan la presentación y el PNG rasterizado |
| Zoom, pan y centrar lienzo | `IMPLEMENTED` como transformaciones del viewport; no cambian la escala de impresión ni el raster exportado |
| Undo / Redo | `PARTIAL`; snapshots de imagen, dimensiones de procesamiento, semitransparencia y transformaciones; no es historial de documento multicapa |
| Descargar PNG | `IMPLEMENTED`; exporta el canvas al tamaño físico/DPI configurados, con fondo transparente o seleccionado, limitado a 40 MP y 16.000 px por lado |
| Descargar PDF | `NOT CONFIGURED`; permanece disabled porque no hay encoder PDF integrado |
| Duplicar imagen / capas múltiples | `NOT CONFIGURED`; duplicar permanece disabled porque Easy actualmente representa una sola imagen activa |
| Guardar / persistencia | `PARTIAL`; el `PrintShopDocument` y los snapshots de modo se guardan en IndexedDB local. Refresh del artwork probado. No hay API remota |
| Transformar artwork | `PARTIAL`; posición por arrastre o flechas (Shift mueve 5%), escala uniforme (10–400%), rotación en pasos de 90° y flips X/Y usan una matriz canónica del engine tanto en preview como en PNG export. Undo/Redo conserva los transforms. No hay documento multicapa |

La eliminación de fondo y el cleanup actúan sobre una copia raster local; no deben presentarse como servicio externo. El PNG exportado no afirma aplicar perfiles de impresión ni verificación de preflight.

## 3. Designer 3 Advanced — estado observado

| Elemento | Estado |
|---|---|
| Ruta `/store/designer/advanced` | `IMPLEMENTED`; monta el editor de Tienda, fuera del layout de Designer 1 |
| Cambio a Easy | Menú de tres puntos contiene únicamente “Modo fácil”; captura las capas actuales y persiste en segundo plano |
| Handoff/persistencia | Usa el mismo `PrintShopDocument`; actualiza el snapshot Advanced y escala las coordenadas entre píxeles del documento y el viewport de 480 px |
| Selección | `PARTIAL`; click, Shift-toggle y multiselección delegan en `SelectionManager`; click + Shift verificados en navegador |
| Layers/context menu | `PARTIAL`; menú contextual conecta duplicar/eliminar, orden, lock y visibilidad a acciones existentes; duplicar, bloqueo, Escape y click fuera verificados |
| Crop | `PARTIAL`; crop raster con preview, aplicación no destructiva sobre `processedSrc`, error visible y undo; aplicación y undo verificados |
| Recorte poligonal raster | `PARTIAL`; un contorno cerrado rasteriza una máscara en el Worker, conserva el interior y vuelve transparente el exterior de la imagen seleccionada; una aplicación es undoable y conserva el original. No añade paths al documento ni permite editar anchors/handles |
| Paths persistentes y edición Advanced | `IMPLEMENTED` para creación y edición básica: schema versionado, round-trip, creación Pluma, selección directa, mover anchors/handles, corner/smooth y abrir/cerrar. La geometría usa coordenadas de documento, render SVG y export raster respetan su caja y transformaciones. La migración 1.0 → 1.1 conserva los documentos existentes |
| Eliminar región por color | `IMPLEMENTED` en ImageTools; selección conectada por semilla, tolerancia y conectividad 4/8 procesa la máscara en el Worker y la aplicación sobre la capa raster es undoable. No crea una selección persistente del documento |
| Undo / Redo | `PARTIAL`; usa el `CommandSystem` compartido con snapshots del estado Advanced en memoria de sesión; undo/redo probados, el historial no se persiste después de refresh |
| Agrupar / Desagrupar | `NOT_CONFIGURED`; el documento no representa relaciones de grupo; el control está deshabilitado y explica el motivo. Requiere soporte de jerarquía y serialización en el contrato canónico |
| Export raster | `PARTIAL`; compone las capas del documento completo y conserva su proporción a 2× la escala base (960 px de ancho); el aviso informa dimensiones reales y que es resolución de vista previa. No incorpora DPI, efectos/preflight completos ni escala de producción |
| Atajos de teclado | `PARTIAL`; registro central habilitado solo en Advanced para undo/redo, copy/cut/paste, duplicate/delete, Escape, flechas (Shift mueve 10 px), select all y guardado local. Los campos editables conservan sus atajos nativos |
| Herramientas de Advanced | `PARTIAL`; Pluma abre creación/edición de paths y Selección directa edita sus anchors; Ajustes/Filtros y edición de texto conservan sus operaciones existentes. Pincel, borrador directo, varita como selección persistente, selección geométrica, vectorizar, efectos, cuentagotas y acciones de menú sin handler siguen deshabilitados con razón visible. Eliminación por color es raster y distinta de selección de objetos |
| Apariencia de capa | `PARTIAL`; opacidad edita `opacity` de la capa seleccionada y el canvas la renderiza. Los modos de fusión distintos de Normal no están en el contrato/render y se informan como `NOT_CONFIGURED` |
| Herramientas, operaciones y alcance completo | `PARTIAL` / `UNKNOWN`; no se atribuyen capacidades no verificadas |

No se deben derivar requisitos para Advanced a partir de la interfaz Easy, Designer 2 o el destino del enlace de navegación.

## 4. Límites y pendientes de verificación

1. Implementar y validar las capacidades Advanced por bloque; no inferirlas desde Designer 1 o Designer 2.
2. Añadir relaciones de grupo al contrato serializable antes de habilitar Agrupar/Desagrupar o Ctrl/Cmd+G; completar persistencia del historial y exportación de alta resolución con datos de producción verificables.
3. Conectar providers reales para Escalar/Mejorar, Vectorizar, Capas mágicas y Edición mágica; hasta entonces mantener `NOT_CONFIGURED`.
4. Integrar PDF, perfiles de producción y preflight solo cuando exista un pipeline verificable.

Estos pendientes no introducen decisiones de producto; preservan como `UNKNOWN` aquello no comprobado.

## 5. Criterio de verificación

Para cambios futuros en Easy, contrastar upload, preset, preview/comparación, navegación y estado de los controles con el baseline documentado. Para Advanced, primero confirmar la pantalla y acordar su alcance; no marcar capacidades como `IMPLEMENTED` sin operación funcional comprobada.
