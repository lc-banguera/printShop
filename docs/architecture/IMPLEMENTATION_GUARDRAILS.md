# IMPLEMENTATION_GUARDRAILS.md
# PrintShop — Guardrails para Implementación de la Design Platform

**Versión:** 0.1.0  
**Aplica a:** Todos los agentes e ingenieros trabajando en la Design Platform  
**Precedencia:** Este documento tiene precedencia sobre cualquier suposición del agente

---

## REGLA CRÍTICA GLOBAL

> Antes de modificar cualquier archivo relacionado con la Design Platform:  
> **LEE el código real. No asumas. No inventes. No completes.**

---

## 1. Prohibiciones Absolutas (NO)

### 1.1 Código

- **NO** hacer "big bang refactor" — ningún bloque reescribe más de lo que agrega
- **NO** duplicar herramientas: si ya existe SelectTool, no crees Designer2SelectTool
- **NO** mover archivos sin verificar que ningún consumidor se rompa
- **NO** renombrar stores, tipos o contratos públicos sin actualizar todos los consumidores
- **NO** borrar código sin verificar que ningún consumidor depende de él
- **NO** cambiar APIs de componentes sin verificar todos los usos
- **NO** agregar dependencias npm sin documentar la necesidad real y el bloque que lo justifica
- **NO** cambiar rutas existentes (especialmente `/designer/new?product=camisetas`)
- **NO** modificar `DEFAULT_PRODUCT` sin verificar todos sus consumidores
- **NO** hardcodear coordenadas del printable area (ya es deuda técnica: NO propagar)

### 1.2 Assets

- **NO** usar el GLB de la camiseta (`t_shirt.glb`) para otros productos
- **NO** inventar rutas de assets que no existen en el filesystem
- **NO** generar assets desde Internet
- **NO** modificar el asset original del usuario (las transformaciones son metadata)
- **NO** crear placeholders que parezcan funcionalidad real

### 1.3 Funcionalidad simulada

- **NO** crear "fake AI" — si no hay backend de AI, el botón debe estar disabled o con tooltip explicativo
- **NO** crear "fake 3D" — si no hay modelo GLB, el producto no debe abrirse en 3D
- **NO** crear "fake processing" — CSS filters son UI, no procesamiento de imagen
- **NO** crear rutas funcionales falsas que apunten a páginas inexistentes
- **NO** marcar una capacidad como IMPLEMENTED si solo existe la UI

### 1.4 Dominio

- **NO** modificar la arquitectura de Orders, Payments, Shipping, Auth, Subscriptions
- **NO** agregar nuevos roles al sistema
- **NO** agregar o eliminar campos de datos de dominio existente
- **NO** cambiar reglas de negocio documentadas en `docs/architecture/`

### 1.5 Documentación

- **NO** marcar como IMPLEMENTED algo que no pueda verificarse con código
- **NO** crear contradicciones entre documentos
- **NO** presentar decisiones PROPOSED como definitivas

---

## 2. Obligaciones (SÍ)

### 2.1 Antes de empezar cualquier bloque

- [ ] Leer `DESIGN_PLATFORM_ARCHITECTURE.md`
- [ ] Leer `CURRENT_EDITOR_INVENTORY.md`
- [ ] Leer el `FUNCTIONAL_SPEC` del designer afectado
- [ ] Verificar que el bloque anterior esté en estado DONE en `IMPLEMENTATION_PROGRESS.md`
- [ ] Ejecutar `npm run build` y registrar el estado base
- [ ] Listar los archivos que serán modificados

### 2.2 Durante la implementación

- [ ] Inspeccionar el código real antes de modificarlo
- [ ] Reutilizar antes de crear (reutilizar → extender → crear)
- [ ] Un cambio a la vez — commits pequeños y descriptivos
- [ ] Verificar TypeScript estricto (`noImplicitAny`, sin `as any`)
- [ ] Verificar que la herramienta/componente compartido funciona en todos los diseñadores que lo usan
- [ ] Mantener compatibilidad hacia atrás si el bloque es compartido

### 2.3 Al terminar cada bloque

- [ ] `npm run build` pasa sin errores nuevos
- [ ] Sin errores de TypeScript nuevos (los preexistentes son deuda existente)
- [ ] Sin errores críticos de consola en runtime
- [ ] Funcionalidad existente de Designer 2 (camiseta) intacta
- [ ] `IMPLEMENTATION_PROGRESS.md` actualizado
- [ ] `DECISIONS.md` actualizado si se tomó una decisión arquitectónica
- [ ] Commit realizado con mensaje descriptivo siguiendo convención

### 2.4 Convención de commits

```
feat(design-platform): <descripción>
fix(design-platform): <descripción>
refactor(design-platform): <descripción>
docs(architecture): <descripción>
```

---

## 3. Flujo de Decisión ante Ambigüedad

```
¿La implementación requiere cambiar el comportamiento existente?
  └─ SÍ → DETENTE. Consultar antes de proceder.
  └─ NO → ¿Existe ya esta capacidad en el shared core?
              └─ SÍ → Reutilizar.
              └─ NO → ¿Puede extenderse un componente existente?
                          └─ SÍ → Extender.
                          └─ NO → Crear nuevo, documentar en DECISIONS.md.
```

---

## 4. Clasificación de Estado

Al documentar capacidades, usar exactamente estos estados:

| Estado | Definición |
|---|---|
| `IMPLEMENTED` | Código real funcional, sin errores, build pasa |
| `PARTIAL` | Existe implementación pero incompleta o con limitaciones conocidas |
| `PLANNED` | Definido en arquitectura pero sin código |
| `NOT_APPLICABLE` | Esta capacidad no corresponde a este designer/bloque |
| `UNKNOWN` | No se pudo verificar durante inspección |
| `PROPOSED` | Decisión propuesta pero no confirmada por el equipo |
| `BLOCKED` | Depende de otro bloque no completado |

---

## 5. Reglas Específicas por Dominio

### 5.1 Coordenadas del printable area

- Nunca usar valores literales `197, 180, 400, 500` en código nuevo
- Siempre derivar desde `activeProduct.printableAreas[activeZoneId]`
- Los bounds 2D se derivan de `ProductDefinition` desde BLOCK 07; las proyecciones 3D sin calibración física verificable permanecen bloqueadas y no deben extrapolarse.

### 5.2 Modelos 3D

- Solo `camisetas` tiene modelo GLB funcional (`t_shirt.glb`, 33 MB)
- Ningún otro producto puede usar este GLB
- La adición de un nuevo GLB requiere: asset real + ProductDefinition actualizada + zona imprimible calibrada

### 5.3 Historial / Undo-Redo

- El sistema actual de snapshots en `canvasStore` es funcional — no romperlo
- El Command System formal se implementa en BLOCK 03
- Los cambios de color de prenda, zoom, guides NO forman parte del historial actual (y no deben agregarse al sistema de snapshots)

### 5.4 Stores de Zustand

- `canvasStore` — solo para elementos del canvas 2D
- `viewerStore` — solo para estado del viewer 3D (producto, zona, zoom, color, materiales)
- `toolsStore` — solo para herramienta activa
- No crear stores adicionales sin justificación documentada en DECISIONS.md

---

## 6. Checklist Definition of Done (resumen rápido)

Ver `DEFINITION_OF_DONE.md` para la lista completa.

Verificación mínima antes de cualquier merge:

```
[ ] Implementación real (no fake, no placeholder)
[ ] Integrada al estado correcto (store adecuado)
[ ] TypeScript sin errores nuevos
[ ] Build sin errores nuevos
[ ] Sin romper funcionalidad existente de Designer 2 (camiseta)
[ ] Documentación actualizada
[ ] Commit realizado
```

---

*Documento creado en FASE 0 — Design Platform Architecture Phase.*
