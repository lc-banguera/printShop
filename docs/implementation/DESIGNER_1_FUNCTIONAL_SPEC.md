# PrintShop — Especificación funcional: Designer 1 (Personalizer)

**Versión:** 0.1.0-draft  
**Última actualización:** 2026-10-05  
**Estado de evidencia:** `UNKNOWN` para capacidades D1; el router resuelve la ruta a un layout compartido, sin evidencia suficiente de que implemente el flujo Personalizer.

## 1. Propósito documentado

Designer 1, también llamado **Personalizer**, se describe en la arquitectura como la experiencia para personalizar un producto existente con diseños propios o de la biblioteca. Esta descripción identifica el propósito general; no define por sí sola un flujo funcional completo.

## 2. Estado observado

| Elemento | Evidencia disponible | Estado |
|---|---|---|
| Ruta `/designer/personalize` | `App.tsx` la conecta con `DesignerLayout`, también usado por `/designer/advanced`; el layout no confirma por sí mismo un flujo D1. | `UNKNOWN` en cuanto a comportamiento D1 |
| Pantalla / workspace | No hay componente confirmado en el inventario actual. | `UNKNOWN` |
| Catálogo o producto de entrada | No verificado para esta experiencia. | `UNKNOWN` |
| Herramientas, capas y selección | No verificado para esta experiencia. | `UNKNOWN` |
| Guardado, exportación y persistencia | No verificado para esta experiencia. | `UNKNOWN` |
| Capacidades por diseñador | La matriz de capacidades conserva `UNKNOWN` para D1. | `UNKNOWN` |

Consultar [CURRENT_EDITOR_INVENTORY.md](../architecture/CURRENT_EDITOR_INVENTORY.md), [DESIGNER_CAPABILITY_MATRIX.md](../architecture/DESIGNER_CAPABILITY_MATRIX.md) y [DESIGN_PLATFORM_ARCHITECTURE.md](../architecture/DESIGN_PLATFORM_ARCHITECTURE.md).

## 3. Comportamiento confirmado y límites

- La ruta está declarada en la documentación existente, pero no se confirma aquí que resuelva a una pantalla implementada.
- El objetivo de personalizar un producto existente está documentado a nivel de propósito.
- No hay evidencia suficiente para especificar los pasos del usuario, el producto seleccionable, las herramientas disponibles, los datos de entrada/salida ni la persistencia.
- No se deben inferir capacidades de D1 a partir de Designer 2 o Designer 3.

## 4. Pendientes de verificación antes de implementar D1

1. Inspeccionar `DesignerLayout` y verificar si sus interacciones corresponden al propósito D1.
2. Obtener definición funcional aprobada para el producto inicial, el flujo de personalización, las operaciones disponibles y el resultado esperado si el layout actual no lo cubre.
3. Confirmar contratos de entrada/salida y persistencia con sus propietarios antes de especificar integración.
4. Actualizar esta especificación y la matriz de capacidades antes de iniciar BLOCK 13.

Estos puntos son `UNKNOWN`/pendientes y no son decisiones propuestas sobre el producto.

## 5. Criterio documental de BLOCK 00

Esta especificación captura el propósito conocido y los límites de evidencia. No declara un flujo funcional implementado ni establece requisitos nuevos. La aceptación funcional de D1 permanece pendiente de verificación y definición antes de su integración.
