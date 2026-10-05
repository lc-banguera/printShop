# PrintShop — estado de módulos

Actualizado: 2 de octubre de 2026. Estado basado en el diagnóstico visual y funcional local. Estados permitidos: Pendiente, Auditado, En progreso, Implementado y Validado. Ningún módulo está marcado como terminado.

| Módulo | Estado | Diagnóstico / observaciones | Riesgo o prioridad |
|---|---|---|---|
| Landing | En progreso | Fase 5 rediseñó visualmente las secciones públicas y el header; responsive comprobado hasta 375 px y zoom legacy retirado. Algunos enlaces conservan destinos placeholder. | P1: completar destinos funcionales en una fase autorizada. |
| Authentication | En progreso | Parcial: implementación pendiente de auditoría visual integral. | P2: consistencia de formularios y estados. |
| Administration | En progreso | Fase 4 actualizó visualmente el dashboard y las tablas con búsqueda, filtros, acciones y paginación; overflow horizontal contenido en sus tablas. La revisión de lint detecta errores preexistentes en archivos de consumidores. | P1: resolver deuda de lint heredada y continuar la evolución de módulos internos. |
| Store | En progreso | Fase 4 actualizó visualmente el dashboard, sus KPI, gráficos y superficies con tokens; responsive revisado sin overflow horizontal de página. No hay referencia visual específica para medir fidelidad. | P2: validar patrones propios y compartidos. |
| Customer | En progreso | Fase 5 actualizó detalle, carrito, checkout, favoritos y estado de pago; rutas, estados y controles existentes se preservaron. Navegación/footer conservan enlaces placeholder. | P1: completar destinos funcionales en una fase autorizada. |
| Designer | Validado | Se validó el flujo de Diseñador 2 con la camiseta GLB como foco: workspace de edición profesional, biblioteca lateral con búsqueda y filtros, subida de imágenes con drag & drop, agregación de texto editable, capas y ordenamiento, acción contextual de selección, controles compactos de color/talla/método, y ajustes reales de tamaño opacidad/escala/rotación sobre elementos. La corrección del overlay 3D y la composición del studio se verificaron en navegador y la build del frontend quedó aprobada. No se modificaron la pantalla de selección ni los flujos de Diseñador 1/3. | P1: completar validaciones desktop/tablet/móvil y regresiones finales de interacción en todos los modos. |
| Marketplace | Pendiente | No implementado como módulo dedicado; capacidad sin módulo dedicado identificado. | P2: definir alcance dentro de los roles existentes. |
| Products | En progreso | Parcial: capacidad pendiente de auditoría visual y funcional puntual. | P2. |
| Designs | En progreso | Parcial: capacidad pendiente de auditoría visual y funcional puntual. | P2. |
| Templates | En progreso | Parcial: capacidad pendiente de auditoría visual y funcional puntual. | P2. |
| Orders | En progreso | Parcial: capacidad pendiente de auditoría visual y funcional puntual. | P2. |
| Payments | En progreso | Parcial: capacidad pendiente de auditoría visual y funcional puntual. | P1: preservar contratos y flujos de pago. |
| Subscriptions | En progreso | Parcial: capacidad pendiente de auditoría visual y funcional puntual. | P1: preservar contratos y flujos de suscripción. |
| Reports | En progreso | Parcial: capacidad pendiente de auditoría visual y funcional puntual. | P2. |
| Marketing | En progreso | Parcial: capacidad pendiente de auditoría visual y funcional puntual. | P2. |
| Support | En progreso | Parcial: capacidad pendiente de auditoría visual y funcional puntual. | P2. |
| Settings | En progreso | Parcial: capacidad pendiente de auditoría visual y funcional puntual. | P2. |
| Logs | En progreso | Parcial: capacidad pendiente de auditoría visual y funcional puntual. | P2. |

## Hallazgos globales registrados

- Aproximadamente 3.623 usos de valores visuales literales y fragmentación del Design System.
- Adopción irregular de componentes compartidos y diferencias entre `Button`, `Card`, `AdminTable`, Landing y Store.
- Inconsistencias de color, radios, densidad, tablas, cards, estados e iconografía.
- El zoom legacy de `.landing-wrapper` se retiró en Fase 5 al implementar reflow responsive real.
- Problemas responsive en Landing y problemas responsive críticos en Designer.

## Orden oficial de migración

1. Fase 0 — Alineación documental.
2. Fase 1 — Fundación visual.
3. Fase 2 — Primitivas compartidas.
4. Fase 3 — Shell de aplicación.
5. Fase 4 — Dashboards y tablas.
6. Fase 5 — Landing y cliente.
7. Fase 6 — Designer.
8. Fase 7 — Módulos internos.
9. Fase 8 — Validación.

## Progreso de migración visual

- Fase 0 — Alineación documental: completada.
- Fase 1 — Fundación visual: completada. Se centralizaron tokens de color, superficie, texto, espaciado, radios, sombras, focus y motion; los componentes UI base los consumen progresivamente. No se cambia el estado de módulos individuales porque no se rediseñó ninguna pantalla.
- Fase 2 — Primitivas compartidas: completada y validada. Se revisaron las APIs y consumidores de Button, Input, Card, Badge, Tabs, Dialog, Modal y Tooltip; se conservaron las APIs y se validaron lint focalizado, TypeScript y build. Las tablas y controles no modificados quedan para sus fases correspondientes.
- Fase 3 — Shell de aplicación: completada y validada. Se modernizaron visualmente Sidebar, Topbar, PageHeader, AdminLayout y StoreLayout, manteniendo rutas, permisos, roles, Zustand, APIs y lógica funcional sin cambios. La validación incluye build del frontend, lint focalizado sobre archivos del shell y revisión del diff. El shell queda alineado con tokens del Design System y con responsive real de desktop/tablet/móvil.
- Fase 4 — Dashboards y tablas: COMPLETADA Y VALIDADA. Dashboards Admin/Store, controles compartidos y consumidores administrativos de tablas actualizados visualmente; métricas, series, datos, columnas, filtros, paginación, acciones y callbacks preservados. Build TypeScript/Vite aprobado. Playwright validó 11 rutas en 1440, 1024, 768 y 375 px, sin overflow horizontal del documento; las tablas anchas mantienen desplazamiento dentro del wrapper. Se capturaron Admin Dashboard, Store Dashboard y Admin Designs en desktop y móvil; se verificaron hover, focus-visible y controles disabled. Tokens existentes usados; no quedan colores hex/rgb/rgba ni tokens inexistentes en el alcance, ni zoom o transform:scale. ESLint focalizado ejecutado: reporta 27 errores preexistentes frente a 28 en el baseline staged, sin regresiones atribuibles al diff. `git diff --check` limpio. No se modificó lógica funcional.
- Fase 5 — Landing + Customer: COMPLETADA Y VALIDADA. Se actualizaron visualmente Landing/header, detalle de producto, carrito, checkout, favoritos y estado de pago; se retiró el zoom legacy. Playwright validó las 7 rutas de compra/Landing en 1920, 1440, 1280, 1024, 768, 640, 480 y 375 px: `documentElement.scrollWidth <= clientWidth` en las 56 combinaciones y los enlaces del header quedaron dentro del viewport. Se capturaron y revisaron Landing desktop/móvil, detalle desktop/móvil, carrito móvil, checkout móvil, favoritos móvil y estado de pago móvil. `npm run build` aprobado; Vite conserva su advertencia de chunk mayor a 500 kB. ESLint focalizado ejecutado sobre 36 archivos: 16 errores y 2 advertencias; el baseline staged confirma que todos son preexistentes y no hay regresiones. `git diff --check` limpio. No se modificaron APIs, rutas, estado, datos ni lógica funcional.

## Regla de actualización

Actualiza este documento tras una auditoría con evidencia nueva. Solo usa `Validado` cuando se hayan comprobado visualmente el responsive y las interacciones principales; no implica por sí mismo que el módulo esté terminado.
