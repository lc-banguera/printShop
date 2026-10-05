# PrintShop — reglas de desarrollo

## Implementación

- Usa componentes funcionales, TypeScript estricto y hooks de React.
- Usa Tailwind CSS y los tokens/componentes compartidos existentes. Los estilos inline son excepcionales y deben estar justificados.
- Busca, reutiliza o extiende componentes antes de crear uno nuevo. No dupliques componentes, lógica ni estado.
- Mantén límites de Feature First: un cambio pertenece al módulo solicitado y sus dependencias compartidas estrictamente necesarias.
- Evita `any`, valores mágicos y acoplamiento de UI a recursos locales; modela los datos para que puedan llegar por API.

## Flujo obligatorio

1. Identifica módulo, pantalla y referencia oficial.
2. Revisa componentes, estado y rutas relacionados.
3. Define el cambio mínimo necesario.
4. Implementa sin alterar reglas de dominio ajenas.
5. Verifica interacción visible, desktop y breakpoints afectados.
6. Ejecuta compilación o validación proporcional al cambio.

## Cierre

Confirma arquitectura intacta, imports limpios, ausencia de duplicación, fidelidad a referencia y archivos modificados. Registra limitaciones como “No verificable”; no las conviertas en supuestos.
