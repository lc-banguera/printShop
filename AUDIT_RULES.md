# PrintShop — reglas de auditoría frontend

## Alcance

Audita solo lo observable desde frontend: UI, UX, responsive, navegación y comportamiento perceptible. No infieras problemas de backend, base de datos, seguridad, APIs o arquitectura interna.

## Evidencia y clasificación

- Contrasta cada pantalla con su referencia oficial cuando exista.
- Prueba desktop, laptop, tablet y móvil cuando sea posible.
- Verifica acciones visibles: botones, filtros, formularios, modales, menú, tabs, búsqueda, paginación, feedback y estados.
- Usa “No verificable” cuando falte referencia, acceso, estado o evidencia suficiente.

| Prioridad | Definición |
|---|---|
| P0 | Impide usar una función o pantalla importante. |
| P1 | Debe corregirse antes de considerar terminado el módulo. |
| P2 | Afecta consistencia o uso, sin bloquear el flujo. |
| P3 | Refinamiento visual o mejora menor. |

## Formato de hallazgo

Cada hallazgo debe indicar módulo, elemento, evidencia observable, impacto, prioridad, recomendación concreta y estado. Agrupa hallazgos repetidos como deuda global, sin duplicarlos innecesariamente.
