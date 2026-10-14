# PrintShop — reglas obligatorias para agentes

Lee este archivo y `AI_CONTEXT.md` antes de modificar el repositorio. Para tareas visuales, lee además `DESIGN_SYSTEM.md` y `UI_UX_RULES.md`; para revisiones, `AUDIT_RULES.md`.

## Principios no negociables

- PrintShop es un SaaS de personalización de productos, tiendas, pedidos y diseños.
- Conserva exactamente la funcionalidad, la información, las reglas de negocio, los roles, permisos, contratos, APIs y arquitectura base existentes.
- La interfaz puede evolucionar para mejorar UX, UI, consistencia, responsive y design system, sin alterar el contenido ni el comportamiento funcional.
- Si existe duda entre cambiar una decisión funcional o preservar, preserva. Para decisiones de presentación, aplica la auditoría, el Design System y las reglas UI/UX vigentes.
- Trabaja solo en el módulo solicitado. No refactorices, muevas ni renombres código ajeno.
- La arquitectura Feature First existente es obligatoria. Reutiliza componentes antes de crear uno: reutilizar → extender → crear.
- Estado global: Zustand. Estado local: React. No dupliques estado ni lógica.
- Los recursos actuales son locales, pero las interfaces deben poder migrar a API y almacenamiento remoto.

## Alcance y roles

Los únicos roles del producto son Super Administrador, Tienda y Cliente. No crees roles nuevos.

Los módulos principales son Landing, Autenticación, Administración, Tienda, Cliente y Designer. Marketplace, pedidos, productos, diseños, plantillas, suscripciones, reportes, pagos, comisiones, marketing, soporte, configuración y logs son capacidades de esos módulos, no roles nuevos.

## Evolución visual y calidad

- PrintShop está en una etapa de evolución visual. El agente puede actuar como Senior Frontend Engineer, UI Engineer, UX Engineer y Design System Engineer dentro del alcance solicitado.
- Para toda tarea de diseño visual frontend, consulta y aplica la skill `.agents/skills/apple-design/SKILL.md` y revisa las demás skills de diseño/interacción/accesibilidad instaladas que sean pertinentes para el alcance.
- Puede detectar y mejorar layouts, jerarquía, espaciado, tipografía, iconografía, componentes, dashboards, formularios, tablas, navegación, responsive y accesibilidad visual.
- No puede agregar o eliminar campos, datos, reglas de negocio, APIs, contratos, roles, permisos o funcionalidades; tampoco inventar comportamientos.
- Las imágenes en `docs/ui/` y `docs/design/reference/` aportan contexto, evidencia histórica o referencias visuales previas; no constituyen por sí solas una especificación visual definitiva. Una imagen declarada expresamente vigente para una tarea concreta sí puede ser su referencia.
- No afirmes que existe una referencia aplicable cuando no hay archivo correspondiente; registra la fidelidad como no verificable o solicita definición.
- La prioridad es: experiencia y fidelidad al sistema visual vigente, arquitectura preservada, reutilización, escalabilidad, rendimiento y limpieza.
- Antes de finalizar: valida imports, ausencia de duplicación, responsive aplicable y compilación cuando el cambio lo permita.

## Precedencia documental y autoridad de diseño visual

1. Esta guía y los requisitos explícitos del usuario.
2. **Para decisiones de diseño visual frontend (composición, superficies, jerarquía, espaciado, colores, tipografía, tarjetas, controles, tablas, estados vacíos, microinteracciones y acabado): las únicas fuentes normativas son Apple Design (`.agents/skills/apple-design/SKILL.md`) e Impeccable (`.agents/skills/impeccable/SKILL.md`).** Los documentos del proyecto no impondrán restricciones estéticas heredadas que contradigan estas skills.
3. `PROJECT_SPEC.md` para producto, dominio, roles y reglas de negocio.
4. `DESIGN_SYSTEM.md` y `UI_UX_RULES.md` para contratos técnicos de tokens, componentes existentes y accesibilidad básica (sin limitar la evolución estética ni sobreescribir la autoridad visual de Apple Design e Impeccable).
5. Documentación específica de dominio en `docs/architecture/` y `docs/payments/`.

Los documentos anteriores quedan consolidados por esta estructura: no copies reglas ya cubiertas aquí.

