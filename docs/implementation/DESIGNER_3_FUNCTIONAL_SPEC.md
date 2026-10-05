# PrintShop — Especificación funcional: Designer 3 (Editor)

**Versión:** 0.1.0-draft  
**Última actualización:** 2026-10-05  
**Estado de evidencia:** `PARTIAL` para Easy (UI y preview) y para la existencia del layout Advanced; sus capacidades específicas siguen `UNKNOWN`.

## 1. Propósito documentado

Designer 3, también llamado **Editor**, agrupa los modos Easy y Advanced para preparar y editar diseños gráficos. El inventario actual confirma una pantalla de modo Easy con limitaciones de backend. `/designer/advanced` resuelve a `DesignerLayout`, pero la evidencia disponible no establece qué capacidades de D3 Advanced cumple. Esta especificación no presupone que ambos modos tengan capacidades equivalentes.

Consultar [CURRENT_EDITOR_INVENTORY.md](../architecture/CURRENT_EDITOR_INVENTORY.md) y [DESIGNER_CAPABILITY_MATRIX.md](../architecture/DESIGNER_CAPABILITY_MATRIX.md).

## 2. Designer 3 Easy — estado observado

| Elemento | Estado documentado |
|---|---|
| Ruta `/designer/easy` y `DesignerEasyModePage` | `IMPLEMENTED` (UI) |
| Selección de imagen desde el botón de upload | `IMPLEMENTED` |
| Comparación antes/después con filtros CSS | `IMPLEMENTED` como preview visual, no como procesamiento real |
| Selección de preset DTF, serigrafía, vinilo o sublimación | `IMPLEMENTED` como selección visible |
| Mostrar/ocultar comparación | `IMPLEMENTED` |
| Navegación hacia `/designer/advanced` | `IMPLEMENTED` como navegación; destino funcional no verificado |
| Guardar | `PARTIAL`; no hay persistencia backend verificada |
| Eliminar fondo, mejorar contraste y exportar | `PARTIAL`; controles visibles, sin funcionalidad backend verificada |
| Indicadores de resultado de procesamiento | `PARTIAL`; el inventario los describe como valores visuales hardcoded, no como estado real |
| Procesador compartido de filtros raster | API Worker disponible desde BLOCK 11; no integrada en Designer 3 Easy |
| Background removal, procesamiento conectado a Easy y exportación de alta resolución | No implementados según inventario |

Los filtros CSS son una vista previa. No se debe informar que se eliminó un fondo, que se procesó el archivo o que se exportó un resultado real sin verificar la operación correspondiente.

## 3. Designer 3 Advanced — estado observado

| Elemento | Estado |
|---|---|
| Ruta `/designer/advanced` | `DesignerLayout` vía `App.tsx`; cargó en navegador |
| Pantalla Advanced | `PARTIAL` — la UI compartida se monta; no se verificó que todas sus capacidades correspondan al alcance Advanced |
| Herramientas, operaciones, estado y persistencia | `UNKNOWN` |

No se deben derivar requisitos para Advanced a partir de la interfaz Easy, Designer 2 o el destino del enlace de navegación.

## 4. Límites y pendientes de verificación

1. Inspeccionar el layout compartido y verificar sus interacciones antes de atribuir capacidades específicas a Advanced.
2. Confirmar en código los controles y estados de Easy antes de cualquier cambio en su comportamiento.
3. Definir, con aprobación, los resultados esperados de guardar, exportar, eliminar fondo y mejorar contraste antes de conectar servicios.
4. Mantener explícito que la preview CSS no está conectada a la API Worker y no es evidencia de procesamiento real en Easy.
5. Actualizar este documento y la matriz con evidencia real antes de BLOCK 14 o BLOCK 15, según corresponda.

Estos pendientes no introducen decisiones de producto; preservan como `UNKNOWN` aquello no comprobado.

## 5. Criterio de verificación

Para cambios futuros en Easy, contrastar upload, preset, preview/comparación, navegación y estado de los controles con el baseline documentado. Para Advanced, primero confirmar la pantalla y acordar su alcance; no marcar capacidades como `IMPLEMENTED` sin operación funcional comprobada.
