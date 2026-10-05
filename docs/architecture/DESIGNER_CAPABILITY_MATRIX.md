# DESIGNER_CAPABILITY_MATRIX.md
# PrintShop — Matriz de Capacidades por Designer

**Versión:** 0.1.0-draft  
**Basada en:** Inspección real de código — rama `feat/design-platform-foundation`  
**Última actualización:** 2026-10-05

---

## Leyenda de estados

| Símbolo | Estado | Definición |
|---|---|---|
| ✅ | IMPLEMENTED | Código real funcional y verificado |
| 🟡 | PARTIAL | Existe pero incompleto o con limitaciones |
| 📋 | PLANNED | En arquitectura, sin código todavía |
| ➖ | NOT_APPLICABLE | No corresponde a esta experiencia |
| ❓ | UNKNOWN | No pudo verificarse durante inspección |
| 🚫 | BLOCKED | Depende de bloque no completado |

---

## Matriz Principal

| Capacidad | D1 Personalizer | D2 Builder | D3 Editor | Shared Core Target |
|---|:---:|:---:|:---:|:---:|
| **Selection** | ❓ | ✅ | ❓ | BLOCK 05 |
| **Canvas shape tools (rectangle/ellipse/line)** | ❓ | ❓ | ❓ | BLOCK 06 |
| **Canvas navigation tools (hand/zoom)** | ❓ | ❓ | ❓ | BLOCK 06 |
| **Transform (move/scale/rotate)** | ❓ | ✅ | ❓ | BLOCK 05 |
| **Multi-selection** | ❓ | 🟡 | ❓ | BLOCK 05 |
| **Layers panel** | ❓ | ✅ | ❓ | BLOCK 04 |
| **Layer reorder** | ❓ | ✅ | ❓ | BLOCK 04 |
| **Undo** | ❓ | ✅ | ❓ | BLOCK 03 |
| **Redo** | ❓ | 🟡 | ❓ | BLOCK 03 |
| **Text tool** | ❓ | ✅ | ❓ | BLOCK 06 |
| **Text font selection** | ❓ | ✅ | ❓ | BLOCK 06 |
| **Text weight** | ❓ | ✅ | ❓ | BLOCK 06 |
| **Text color** | ❓ | ✅ | ❓ | BLOCK 06 |
| **Text alignment** | ❓ | ✅ | ❓ | BLOCK 06 |
| **Text letter spacing** | ❓ | ✅ | ❓ | BLOCK 06 |
| **Text line height** | ❓ | ✅ | ❓ | BLOCK 06 |
| **Upload image** | ❓ | ✅ | ✅ | BLOCK 10 |
| **Drag & drop upload** | ❓ | ✅ | ❓ | BLOCK 10 |
| **Design library** | ❓ | ✅ | ➖ | BLOCK 10 |
| **Library search** | ❓ | ✅ | ➖ | BLOCK 10 |
| **Library tabs (all/printshop/uploads)** | ❓ | ✅ | ➖ | BLOCK 10 |
| **Duplicate element** | ❓ | ✅ | ❓ | BLOCK 05 |
| **Delete element** | ❓ | ✅ | ❓ | BLOCK 05 |
| **Lock element** | ❓ | ✅ | ❓ | BLOCK 04 |
| **Visibility toggle** | ❓ | ✅ | ❓ | BLOCK 04 |
| **Alignment tools** | ❓ | ✅ | ❓ | BLOCK 05 |
| **Flip horizontal** | ❓ | ✅ | ❓ | BLOCK 05 |
| **Flip vertical** | ❓ | ✅ | ❓ | BLOCK 05 |
| **Opacity control** | ❓ | ✅ | ❓ | BLOCK 05 |
| **Element position (X/Y)** | ❓ | ✅ | ❓ | BLOCK 05 |
| **Element dimensions (W/H)** | ❓ | ✅ | ❓ | BLOCK 05 |
| **Element rotation** | ❓ | ✅ | ❓ | BLOCK 05 |

---

## Capacidades 3D / Producto

| Capacidad | D1 | D2 | D3 | Shared Core Target |
|---|:---:|:---:|:---:|:---:|
| **3D Viewer (GLB)** | ❓ | ✅ | ➖ | BLOCK 09 |
| **Free orbit camera** | ❓ | ✅ | ➖ | BLOCK 09 |
| **Zoom 3D** | ❓ | ✅ | ➖ | BLOCK 09 |
| **Reset view (double click)** | ❓ | ✅ | ➖ | BLOCK 09 |
| **Guides overlay 3D** | ❓ | ✅ | ➖ | BLOCK 09 |
| **Grid overlay 3D** | ❓ | ✅ | ➖ | BLOCK 09 |
| **Artwork as decals 3D** | ❓ | ✅ | ➖ | BLOCK 09 |
| **Product color** | ❓ | ✅ | ➖ | BLOCK 07 |
| **Garment color palette** | ❓ | ✅ | ➖ | BLOCK 07 |
| **Material brightness** | ❓ | ✅ | ➖ | BLOCK 07 |
| **Product zone selection** | ❓ | ✅ | ➖ | BLOCK 07 |
| **Product builder flow** | ➖ | ✅ | ➖ | BLOCK 12 |
| **Product size selection** | ➖ | ✅ | ➖ | BLOCK 12 |
| **Print method selection** | ➖ | ✅ | ➖ | BLOCK 16 |
| **Produce / add to cart** | ➖ | 🟡 | ➖ | BLOCK 16 |

---

## Capacidades de Imagen

| Capacidad | D1 | D2 | D3 | Notas |
|---|:---:|:---:|:---:|:---:|
| **CSS visual filters** | ❓ | 📋 | 🟡 | D3 Easy: filtros CSS aplicados visualmente (no destructivos reales) |
| **Background removal** | ➖ | ➖ | 🟡 | D3 Easy: botón existe, sin backend |
| **Halftone** | ➖ | ➖ | 📋 | PLANNED para D3 Advanced |
| **Remove semi-transparency** | ➖ | ➖ | 🟡 | D3 Easy: listado en UI, sin procesamiento |
| **Color correction** | ➖ | ➖ | 📋 | PLANNED |
| **Advanced image editing** | ➖ | ➖ | 📋 | D3 Advanced — UNKNOWN |
| **AI generate (text to image)** | ➖ | ➖ | 📋 | Botón "IA Generar" en D2 sidebar sin backend |

---

## Capacidades de Export / Producción

| Capacidad | D1 | D2 | D3 | Notas |
|---|:---:|:---:|:---:|:---:|
| **Save design** | ❓ | 🟡 | 🟡 | D2: botón "Guardar" sin persistencia real |
| **Download design** | ❓ | 🟡 | 🟡 | D2: botón "Descargar" sin implementación; D3: botón sin backend |
| **Export for production** | ❓ | 📋 | 📋 | PLANNED |
| **Print preflight** | ❓ | 📋 | 📋 | PLANNED (C++) |

---

## Notas sobre D1 (Designer 1 / Personalizer)

**Estado**: UNKNOWN

El `DesignerHubPage` define el D1 con ruta `/designer/personalize`. Sin embargo, durante la inspección de código **no se encontró un componente `DesignerPersonalizePage` o equivalente**. Los componentes de la carpeta `designer/pages/` son:

- `designer-hub-page.tsx` — Hub selector
- `designer-builder-page.tsx` + `designer-2-workspace.tsx` — Designer 2
- `designer-easy-mode-page.tsx` — Designer 3 Easy
- (sin componente para `/designer/personalize`)
- (sin componente para `/designer/advanced`)

La matriz marca `D1` como `❓` en todas las capacidades hasta que se verifique o implemente el componente.

---

## Capacidades por Bloque de Implementación

| Bloque | Capacidades que habilita |
|---|---|
| BLOCK 03 | Undo/Redo mejorado (Command System) |
| BLOCK 04 | Layers, lock, visibility |
| BLOCK 05 | Selection, transform, duplicate, delete, alignment, flip, opacity |
| BLOCK 06 | Tool Registry formal, Tool Context |
| BLOCK 07 | Product Surface, printable area dinámico, color producto |
| BLOCK 08 | 2D Renderer Adapter (desacoplamiento Konva) |
| BLOCK 09 | 3D Renderer Adapter (desacoplamiento Three.js) |
| BLOCK 10 | Asset System, biblioteca, upload |
| BLOCK 11 | Image Processing Foundation |
| BLOCK 12 | Designer 2 Integration completa |
| BLOCK 13 | Designer 1 Integration |
| BLOCK 14 | Designer 3 Easy (procesamiento real) |
| BLOCK 15 | Designer 3 Advanced |
| BLOCK 16 | Production Engine |

---

*Documento creado en FASE 0 — Design Platform Architecture Phase.*
