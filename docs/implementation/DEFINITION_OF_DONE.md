# PrintShop — Definition of Done de la Design Platform

**Versión:** 0.1.0  
**Última actualización:** 2026-10-05  
**Aplica a:** BLOCK 00–19 de [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)

Este documento establece criterios de salida verificables. No autoriza cambios de producto, dominio ni comportamiento que no estén documentados o aprobados. Las incertidumbres se registran como `UNKNOWN` o como decisión pendiente; no se completan por inferencia.

## Estados documentales

Usar los estados definidos en [IMPLEMENTATION_GUARDRAILS.md](../architecture/IMPLEMENTATION_GUARDRAILS.md): `IMPLEMENTED`, `PARTIAL`, `PLANNED`, `NOT_APPLICABLE`, `UNKNOWN`, `PROPOSED` y `BLOCKED`.

Una capacidad con interfaz visible pero sin operación funcional no se marca como `IMPLEMENTED`. Una decisión `PROPOSED` no se presenta como definitiva.

## Cierre de BLOCK 00 — Baseline + Inventario

- [ ] Están presentes los 13 entregables enumerados en BLOCK 00 de `IMPLEMENTATION_ROADMAP.md`.
- [ ] El inventario describe el estado observado y separa implementación real, implementación parcial, ausencia e incertidumbre.
- [ ] Las especificaciones funcionales no inventan comportamiento para rutas o capacidades `UNKNOWN`; enumeran las verificaciones o decisiones aún necesarias.
- [ ] Las decisiones arquitectónicas conservan su estado `ACCEPTED`, `PROPOSED` o equivalente y no se promueven sin aprobación.
- [ ] No se modificó código funcional.
- [ ] La build de frontend se ejecutó como comprobación de baseline y su resultado quedó registrado; si no fue posible ejecutarla, se documenta el motivo y no se declara aprobada.
- [ ] Los documentos se revisaron para consistencia entre sí y con las reglas del repositorio.
- [ ] Se registró el cierre de BLOCK 00 en `IMPLEMENTATION_PROGRESS.md`.
- [ ] El commit de documentación requerido por el roadmap se realizó con el mensaje acordado allí.

## Cierre de cada bloque de implementación

Un bloque puede marcarse `DONE` cuando:

- [ ] Cumple el objetivo, dependencias y criterios de aceptación del bloque en el roadmap.
- [ ] Se inspeccionó el código y los consumidores afectados antes de cambiar contratos o comportamiento.
- [ ] Se preservan los contratos públicos, rutas, permisos, reglas de negocio y comportamiento no incluido expresamente en el alcance.
- [ ] Se reutilizaron o extendieron las capacidades existentes antes de crear duplicados.
- [ ] No se incorporan capacidades falsas, placeholders engañosos, assets inexistentes ni dependencias sin justificación.
- [ ] El código cumple TypeScript estricto y no introduce errores de compilación nuevos.
- [ ] La build de frontend pasa; cualquier error preexistente queda distinguido de regresiones del bloque.
- [ ] Se ejecutaron pruebas focalizadas pertinentes y se registraron sus resultados. Si no existe setup de pruebas aplicable, se documenta.
- [ ] Se validó la funcionalidad existente de Designer 2 con la camiseta y GLB disponibles, en el nivel aplicable al cambio.
- [ ] Se verificaron consola/runtime y los estados visuales o responsive afectados cuando el cambio los alcance.
- [ ] Se actualizaron `IMPLEMENTATION_PROGRESS.md` y `DECISIONS.md` cuando corresponda.
- [ ] Se revisó el diff y no contiene cambios fuera del alcance ni archivos temporales.
- [ ] Se creó un commit descriptivo siguiendo la convención de `IMPLEMENTATION_GUARDRAILS.md`.

## Cierre del BLOCK 19 — Testing + Stabilization

Además de los criterios generales:

- [ ] Se comprobaron las capacidades aplicables de Designer 1, Designer 2 y Designer 3; las áreas no verificables se mantienen explícitamente identificadas.
- [ ] Se validaron las rutas, interacciones y regresiones relevantes en desktop y tablet, y en móvil cuando el flujo lo permita.
- [ ] Los problemas conocidos y limitaciones restantes tienen evidencia y estado documentado.
- [ ] La arquitectura y los documentos finales reflejan el estado implementado, no el estado objetivo.
