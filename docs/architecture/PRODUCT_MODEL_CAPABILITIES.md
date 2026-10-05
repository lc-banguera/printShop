# PRODUCT_MODEL_CAPABILITIES.md
# PrintShop — Inventario de Productos y Modelos

**Versión:** 0.1.0  
**Basada en:** Inspección real de código y filesystem — rama `feat/design-platform-foundation`  
**Última actualización:** 2026-10-05

---

## Regla crítica

> Nunca utilizar el modelo 3D de un producto como sustituto de otro.  
> Nunca inventar una ruta de GLB que no existe.  
> Un producto puede estar visible en la UI y estar en desarrollo al mismo tiempo.

---

## 1. Camiseta (T-Shirt)

| Campo | Valor |
|---|---|
| **ID** | `camisetas` (categoría) / `classic-tshirt` (ProductDefinition) |
| **Nombre** | Camiseta Clásica |
| **Categoría** | Textil |
| **Imagen thumbnail** | `src/resources/mockup/t-shirt-mockup.png` |
| **Preview** | `src/resources/mockup/t-shirt-mockup.png` |
| **Modelo 3D GLB** | `src/resources/mockup/t_shirt.glb` (33 MB) |
| **Designer 1** | UNKNOWN (ruta no verificada) |
| **Designer 2** | IMPLEMENTED — ruta: `/designer/new?product=camisetas` |
| **Superficies** | front, back, sleeve_left, sleeve_right, label |
| **Printable Areas** | front: (197, 180, 400×500), back: (197, 180, 400×500), sleeves: (270, 250, 250×350), label: (320, 150, 150×150) |
| **Materiales** | Blanco (#ffffff), Negro (#171421) |
| **Estado 3D** | ✅ DISPONIBLE — GLB real y funcional |
| **Calibración de decals 3D** | Frente verificado; no se encontró identificación/calibración física verificable para espalda, mangas o etiqueta |
| **Estado Designer 2** | ✅ HABILITADO |

---

## 2. Hoodie / Sudadera

| Campo | Valor |
|---|---|
| **ID** | `hoodies` |
| **Nombre** | Hoodies |
| **Imágenes disponibles** | `oversized-hoodie-fitted.png`, `oversized-hoodie.png`, `oversized-sweatshirt-fitted.png`, `oversized-sweatshirt.png`, `hoddie.png` |
| **Modelo 3D GLB** | NO EXISTE |
| **Designer 1** | UNKNOWN |
| **Designer 2** | `designer2ProductModels.hoodies = null` — Botón DESHABILITADO |
| **Superficies** | No definidas (sin ProductDefinition) |
| **Estado 3D** | ❌ NO DISPONIBLE |
| **Estado Designer 2** | 🚫 DESHABILITADO hasta que exista GLB |

---

## 3. Tazas

| Campo | Valor |
|---|---|
| **ID** | `tazas` |
| **Nombre** | Tazas |
| **Imágenes disponibles** | `src/resources/mockup/tazas.png` |
| **Modelo 3D GLB** | NO EXISTE |
| **Designer 1** | UNKNOWN |
| **Designer 2** | `designer2ProductModels.tazas = null` — Botón DESHABILITADO |
| **Superficies** | No definidas |
| **Estado 3D** | ❌ NO DISPONIBLE |
| **Estado Designer 2** | 🚫 DESHABILITADO |

---

## 4. Gorras

| Campo | Valor |
|---|---|
| **ID** | `gorras` |
| **Nombre** | Gorras |
| **Imágenes disponibles** | `src/resources/mockup/gorra.png`, `bucket-hat.png` (landing) |
| **Modelo 3D GLB** | NO EXISTE |
| **Designer 1** | UNKNOWN |
| **Designer 2** | `designer2ProductModels.gorras = null` — Botón DESHABILITADO |
| **Superficies** | No definidas |
| **Estado 3D** | ❌ NO DISPONIBLE |
| **Estado Designer 2** | 🚫 DESHABILITADO |

---

## 5. Pósters / Cuadros

| Campo | Valor |
|---|---|
| **ID** | `posters` |
| **Nombre** | Pósters |
| **Imágenes disponibles** | `src/resources/mockup/cuadro.png`, `cuadro.jpg` |
| **Modelo 3D GLB** | NO EXISTE |
| **Designer 1** | UNKNOWN |
| **Designer 2** | `designer2ProductModels.posters = null` — Botón DESHABILITADO |
| **Superficies** | No definidas |
| **Estado 3D** | ❌ NO DISPONIBLE |
| **Estado Designer 2** | 🚫 DESHABILITADO |

---

## 6. Bolsos / Bolsas

| Campo | Valor |
|---|---|
| **ID** | `bolsos` |
| **Nombre** | Bolsos y bolsas |
| **Imágenes disponibles** | `src/resources/mockup/bolso.png`, `bolso.jpg`, `shopping-bag-standard-fitted.png`, `shopping-bag-standard.png`, `shopping-bag-wide.png` |
| **Modelo 3D GLB** | NO EXISTE |
| **Designer 1** | UNKNOWN |
| **Designer 2** | `designer2ProductModels.bolsos = null` — Botón DESHABILITADO |
| **Superficies** | No definidas |
| **Estado 3D** | ❌ NO DISPONIBLE |
| **Estado Designer 2** | 🚫 DESHABILITADO |

---

## 7. Productos de la Sección "Modelos 3D" (Landing)

Estos productos aparecen en la sección "Explora modelos 3D" de la Landing pero **no forman parte del catálogo funcional de Designer 2**.

| ID | Nombre | Categoría | supports3D | GLB | Route |
|---|---|---|---|---|---|
| model-1 | Hoodie Oversize | ropa | false | null | — |
| model-2 | Sudadera Oversize | ropa | false | null | — |
| model-3 | Camiseta | ropa | true | `t_shirt.glb` | `/designer/new?product=camisetas` |
| model-4 | Sudadera | ropa | false | null | — |
| model-5 | Camiseta de mujer | ropa | false | null | — |
| model-6 | Camiseta de hombre | ropa | false | null | — |
| model-7 | Hoodie | ropa | false | null | — |
| model-8 | Chaqueta acolchada | ropa | false | null | — |
| model-9 | Chaqueta con cremallera | ropa | false | null | — |
| model-10 | Chaqueta abierta | ropa | false | null | — |
| model-11 | Gorro tipo bucket | ropa | false | null | — |
| model-12 | Taza | objetos | false | null | — |
| model-13 | Bolsa de tela | objetos | false | null | — |
| model-14 | Póster | objetos | false | null | — |
| model-15 | iPhone 16 | dispositivos | false | null | — |
| model-16 | Pantalla dinámica | dispositivos | false | null | — |
| model-17 | MacBook Pro | dispositivos | false | null | — |
| model-18 | Monitor Pro Display | dispositivos | false | null | — |
| model-19 | iPad Pro | dispositivos | false | null | — |

> **Nota**: `model-16` (Pantalla dinámica) referencia `imageName: 'device-screen.png'` que **no existe** en el filesystem de `landing_principal/images/`. Estado: BROKEN — imagen faltante.

---

## 8. ProductDefinition existente en el sistema

Solo existe **un** `ProductDefinition` registrado:

```typescript
// src/features/catalog/data/products.ts
export const DEFAULT_PRODUCT: ProductDefinition = {
  id: 'classic-tshirt',
  name: 'Camiseta Clásica',
  category: 'Textil',
  modelUrl: tshirtGlb,   // src/resources/mockup/t_shirt.glb
  printableAreas: { front, back, sleeve_left, sleeve_right, label },
  viewConfigs: { front, back, sleeve_left, sleeve_right, label },
  materials: [{ white }, { black }],
};

export const PRODUCTS: ProductDefinition[] = [DEFAULT_PRODUCT];
```

La lista `PRODUCTS` tiene solo un elemento. Para agregar un nuevo producto al sistema funcional se requiere:
1. Asset GLB real calibrado
2. `ProductDefinition` con `printableAreas` correctas
3. `viewConfigs` para cada zona
4. Registro en `designer2ProductModels`
5. Validación en Designer 2

---

*Documento creado en FASE 0 — Design Platform Architecture Phase.*
