# PrintShop — contexto de trabajo para IA

## Producto y objetivo

PrintShop es una plataforma SaaS para personalización de productos, comercio de diseños, tiendas online, pedidos, suscripciones y administración. El frontend evoluciona visualmente sin alterar su funcionalidad, información, reglas de negocio ni arquitectura base.

## Stack y límites

- Frontend: React, TypeScript, Vite, Tailwind CSS y Zustand.
- Designer: React Konva.
- Backend: Spring Boot, PostgreSQL y JWT.
- Integraciones futuras: REST, almacenamiento cloud, IA, pagos y correo.

La estructura Feature First y los componentes compartidos existentes son parte del contrato del proyecto. Consulta `AGENTS.md` para reglas de cambio y `PROJECT_SPEC.md` para reglas de negocio.

## Fuentes de verdad

| Tema | Documento fuente |
|---|---|
| Reglas operativas para agentes | `AGENTS.md` |
| Producto, roles y capacidades | `PROJECT_SPEC.md` |
| Estándares de desarrollo | `DEVELOPMENT_RULES.md` |
| Sistema visual principal | `DESIGN_SYSTEM.md` |
| Implementación UI/UX | `UI_UX_RULES.md` |
| Auditoría y estado de módulos | `AUDIT_RULES.md` y `MODULE_STATUS.md` |
| Pedidos, logística y pagos | `docs/architecture/` y `docs/payments/` |

## Referencias visuales e imágenes históricas

- `docs/design/reference/landing-full.png`, `docs/design/reference/designer-full.png` y `docs/ui/admin/` son evidencia histórica y contexto visual disponible.
- Tienda y Cliente no tienen una carpeta de referencia visual específica en el repositorio al momento de esta consolidación.
- Ninguna imagen es automáticamente una especificación definitiva. Una tarea puede declarar una imagen concreta como referencia vigente; en ese caso se usa junto con el Design System y las reglas UI/UX.

## Decisiones consolidadas

- Hay exactamente tres roles: Super Administrador, Tienda y Cliente.
- La evolución visual sigue este flujo: auditoría → Design System → reglas UI/UX → implementación → validación.
- El agente puede tomar decisiones de presentación para mejorar UX/UI, siempre que conserve exactamente el contenido y comportamiento funcionales.
- Las imágenes locales son datos de presentación temporales; no deben convertirse en contratos rígidos de dominio ni de interfaz.
- Administración y Tienda pueden conservar layouts independientes; comparten tokens, componentes, patrones y lenguaje visual cuando sea apropiado.
