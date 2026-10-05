# PrintShop — Especificación funcional: Designer 3 (Editor)

**Versión:** 0.1.0-draft  
**Última actualización:** 2026-10-05  
**Estado de evidencia:** `PARTIAL` para Easy (UI y preview) y para la existencia del layout Advanced; sus capacidades específicas siguen `UNKNOWN`.

## 1. Propósito documentado

Designer 3, también llamado **Editor**, agrupa los modos Easy y Advanced para preparar y editar diseños gráficos. El inventario actual confirma una pantalla de modo Easy con limitaciones de backend. `/designer/advanced` resuelve a `DesignerLayout`, pero la evidencia disponible no establece qué capacidades de D3 Advanced cumple. Esta especificación no presupone que ambos modos tengan capacidades equivalentes.

Consultar [CURRENT_EDITOR_INVENTORY.md](../architecture/CURRENT_EDITOR_INVENTORY.md) y [DESIGNER_CAPABILITY_MATRIX.md](../architecture/DESIGNER_CAPABILITY_MATRIX.md).

El modal "Nuevo lienzo" actualmente solo tiene como punto de montaje verificado `/store/designer`; no se encontró una segunda instancia desde Cliente.

## 2. Designer 3 Easy — estado observado

| Elemento | Estado documentado |
|---|---|
| Ruta `/designer/easy` y `DesignerEasyModePage` | `IMPLEMENTED` (UI) |
| Entrada desde "Nuevo lienzo" con Modo avanzado OFF | Navega a `/designer/easy` y conserva `NewCanvasConfig` en `location.state`; Easy todavía no consume esa configuración |
| Selección de imagen desde el botón de upload | `IMPLEMENTED` |
| Comparación antes/después con filtros CSS | `IMPLEMENTED` como preview visual, no como procesamiento real |
| Selección de preset DTF, serigrafía, vinilo o sublimación | `IMPLEMENTED` como selección visible |
| Mostrar/ocultar comparación | `IMPLEMENTED` |
| Navegación hacia `/designer/advanced` | `IMPLEMENTED` como navegación; destino funcional no verificado |
| Guardar | `BLOCKED`; control disabled mientras no exista persistencia |
| Mejorar contraste | `PARTIAL`; para una imagen subida, procesa el original en el Worker con `contrast: 110` y presenta un PNG del mismo tamaño en píxeles |
| Indicadores de procesamiento | `PARTIAL`; solo "Color mejorado" refleja la operación Worker; otros pasos no se presentan como completados |
| Presets / "Aplicar" | `PARTIAL`; la selección es visible y la preview CSS no es procesamiento; "Aplicar" está disabled porque no hay transformaciones reales definidas por perfil |
| Eliminar fondo | `BLOCKED`; control disabled, no se encontró servicio Python |
| Exportar / salida de producción | `BLOCKED`; control disabled, no hay export 300 DPI ni perfil de producción |
| Procesador compartido de filtros raster | Integrado en D3 Easy para el ajuste de contraste; los demás filtros aún no están conectados |

Los filtros CSS siguen siendo una vista previa. El procesamiento de contraste usa una copia PNG y no modifica el `File` fuente. No se debe informar que se eliminó un fondo, se aplicó un perfil de impresión o se exportó un resultado de producción.

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
3. Definir transformaciones reales para cada perfil antes de habilitar "Aplicar".
4. Conectar un servicio real antes de habilitar eliminación de fondo y un motor de producción antes de habilitar export.
5. Mantener explícito que la preview CSS no es procesamiento real; solo el ajuste de contraste consume actualmente la API Worker.
6. Actualizar este documento y la matriz con evidencia real antes de continuar BLOCK 14 o BLOCK 15.

Estos pendientes no introducen decisiones de producto; preservan como `UNKNOWN` aquello no comprobado.

## 5. Criterio de verificación

Para cambios futuros en Easy, contrastar upload, preset, preview/comparación, navegación y estado de los controles con el baseline documentado. Para Advanced, primero confirmar la pantalla y acordar su alcance; no marcar capacidades como `IMPLEMENTED` sin operación funcional comprobada.
