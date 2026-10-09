# PrintShop — Design System

## Rol y filosofía visual

Este documento es la referencia visual principal del frontend. PrintShop busca una interfaz premium, minimalista, moderna, profesional, clara y consistente. Puede inspirarse en principios generales de productos de alta calidad —claridad, foco, jerarquía y sobriedad— sin copiar ni reproducir diseños propietarios.

La evolución visual sigue: auditoría → Design System → reglas UI/UX → implementación → validación. Conserva siempre la funcionalidad, información y comportamiento existentes.

## Tokens implementados

Los tokens de Fase 1 están centralizados en `frontend/src/shared/styles/globals.css` y expuestos a Tailwind en `frontend/tailwind.config.ts`. Los valores literales existentes fuera de la UI base no se han sustituido de forma masiva.

| Categoría | Tokens implementados |
|---|---|
| Tipografía | `Inter` con fallback de sistema mediante `font-sans`; la escala usa clases Tailwind existentes, con títulos, cuerpo y metadata definidos por los componentes. |
| Superficies y texto | `background`, `surface`, `surface-muted`, `surface-strong`, `surface-elevated`, `foreground`, `foreground-muted`, `foreground-subtle`. |
| Color semántico | `primary`, `primary-hover`, `primary-active`, `primary-foreground`, `success`, `success-muted`, `warning`, `danger`, `info`, además de los alias de identidad `accent`. |
| Bordes | `border`, `border-strong`, `border-muted`. |
| Espaciado | Escala base `--space-1` a `--space-8` y alias `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`. |
| Radios | `control` (8 px), `card` (16 px), `dialog` (20 px), `badge` (píldora), junto con la escala heredada. |
| Sombras | `subtle`, `card`, `elevated`, `modal`, más los alias heredados `xs` a `lg`. |
| Focus y motion | `--focus-ring`, `--motion-fast` (120 ms), `--motion-normal` (180 ms), `--motion-slow` (240 ms) y `--motion-ease`; reducción de motion bajo `prefers-reduced-motion`. |

La auditoría ha identificado aproximadamente 3.623 usos de valores visuales literales. Su consolidación forma parte de fases posteriores; no se deben propagar nuevos valores literales cuando exista un token o componente aplicable.

## Componentes y patrones

Antes de crear UI nueva, sigue: reutilizar → extender → crear. Busca primero en `frontend/src/shared/ui/`; una variante nueva debe ser semántica, reutilizable y coherente con el sistema.

Los componentes que ya consumen los tokens de Fase 1 son `Button`, `Input`, `Card`, `Tabs`, `Dialog`, `Modal`, `Tooltip` y `Badge`. `PageHeader`, `TableSearchBar`, `TablePagination`, `TableFilterSelect`, `Sidebar`, `Topbar`, `StatusBadge`, `StatCard` y `AdminTable` se mantienen sin cambios estructurales para su migración progresiva posterior.

- Botones: jerarquía primaria, secundaria, terciaria y destructiva; estados hover, focus, active, disabled y loading.
- Inputs: labels persistentes, ayuda y error junto al campo, foco visible y áreas cómodas.
- Cards: superficie, borde/elevación y padding consistentes según su función.
- Tablas: encabezados claros, densidad controlada, estados vacíos/carga/error, acciones descubribles y respuesta móvil planificada.
- Badges y estados: semántica por significado, no solo por color.
- Dialogs y modales: jerarquía clara, foco gestionado, cierre predecible y acciones inequívocas.
- Navegación: sidebar y topbar deben mantener orientación, estado activo y alternativa móvil accesible.

## Iconografía, estados y responsive

- `lucide-react` ya es la librería consolidada del proyecto (112 archivos de `frontend/src` la importan). No se añade dependencia ni se hace una migración masiva en esta fase. Material Symbols / Material Icons solo se evaluará para una adopción futura compatible y controlada.
- No uses emojis como iconos de interfaz ni mezcles familias de iconos arbitrariamente.
- Los iconos sin texto requieren nombre accesible y tooltip cuando el significado no sea evidente.
- Los estados hover, focus, active, disabled, loading, vacío, éxito y error deben ser perceptibles y consistentes.
- El responsive se implementa con breakpoints de Tailwind, flex, grid, `max-width`, `min-width`, spacing y tipografía responsivos. El zoom del navegador o CSS no es una solución responsive. En Fase 1 se identificaron cuatro reglas `zoom` para `.landing-wrapper` en `globals.css`; retirarlas requiere reconstruir el layout de Landing sin regresiones, por lo que quedan pendientes para la Fase 5.

## Consolidación entre módulos

Administración y Tienda pueden conservar layouts independientes. Deben compartir tokens, componentes, patrones y lenguaje visual cuando sea apropiado, sin exigir una fusión de sus shells o flujos.
