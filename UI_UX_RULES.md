# PrintShop — reglas UI/UX

## Regla de evolución visual

El agente puede modificar la presentación visual de una funcionalidad siempre que conserve exactamente su contenido y comportamiento funcional.

Un formulario de ocho campos sigue teniendo ocho campos; una tabla de siete columnas sigue teniendo siete columnas. Puede cambiar su jerarquía, layout, espaciado, estilo, navegación visual y adaptación responsive, pero no sus datos, reglas, acciones, contratos ni permisos.

## Proceso de implementación

1. Revisa la auditoría, el módulo, el Design System y las reglas funcionales aplicables.
2. Identifica contenido, comportamiento, estados y componentes reutilizables existentes.
3. Aplica la estrategia reutilizar → extender → crear.
4. Mejora la presentación con jerarquía, legibilidad, consistencia y accesibilidad visual.
5. Valida desktop, tablet y móvil, además de los estados relevantes.

Las imágenes históricas aportan contexto; no deben replicarse literalmente ni bloquear una mejora. Si una imagen se declara explícitamente referencia vigente para una tarea concreta, úsala como insumo junto con el Design System, sin modificar el contenido funcional.

## Interacción y accesibilidad

- Toda acción visible debe tener destino, efecto o estado disabled con una razón; nunca aparentar funcionalidad mediante enlaces `#`.
- Las acciones destructivas requieren confirmación y feedback de resultado.
- Formularios muestran validación junto al campo y conservan contexto cuando el flujo exige autenticación.
- Filtros, tabs, modales, dropdowns, búsqueda, paginación y notificaciones deben proporcionar feedback perceptible.
- Mantén orden de foco, labels, contraste, foco visible y área táctil suficientes.
- Los iconos deben pertenecer a una familia coherente; prioriza Material Symbols / Material Icons cuando sean compatibles o reutiliza la librería consolidada. No uses emojis como iconos de interfaz.

## Responsive

- El zoom de navegador o CSS no es una solución responsive. Su eliminación se programa para la Fundación visual; no se modifica en esta fase documental.
- Usa breakpoints de Tailwind, flex, grid, `max-width`, `min-width`, spacing y tipografía responsivos.
- Desktop, tablet y móvil deben conservar acciones esenciales sin desbordes, solapamientos ni scroll horizontal involuntario.
- Navegación lateral y horizontal debe tener una alternativa móvil accesible.
- Las tablas deben responder con scroll controlado, tarjetas o jerarquía alternativa sin perder columnas, datos ni acciones funcionales.

## Límites

- No agregues ni elimines campos, textos funcionales, datos, acciones, estados de negocio, roles, permisos, APIs, contratos o funcionalidades.
- No inventes comportamientos ni recursos que alteren el alcance funcional.
- No introduzcas una dependencia de iconos sin evaluar primero la solución ya consolidada en el proyecto.
