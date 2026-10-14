# ASSET_INVENTORY.md
# PrintShop — Inventario de Assets del Designer

**Versión:** 0.1.0  
**Basada en:** Inspección real de filesystem — rama `feat/design-platform-foundation`  
**Última actualización:** 2026-10-05

---

## 1. Modelos 3D (GLB)

| Filename | Path | Tipo | Producto | Propósito | Tamaño | Estado |
|---|---|---|---|---|---|---|
| `t_shirt.glb` | `src/resources/mockup/t_shirt.glb` | GLB/GLTF | Camiseta | Modelo 3D principal para Designer 2 | 33 MB | ✅ FUNCIONAL |

> Solo existe un modelo GLB en todo el proyecto. No hay modelos para hoodie, taza, gorra, póster ni bolso.

---

## 2. Mockups 2D de Productos

| Filename | Path | Producto | Propósito | Tamaño | Estado |
|---|---|---|---|---|---|
| `t-shirt-mockup.png` | `src/resources/mockup/t-shirt-mockup.png` | Camiseta | Thumbnail + Preview en ProductDefinition | 124 KB | ✅ EN USO |
| `bolso.jpg` | `src/resources/mockup/bolso.jpg` | Bolso | Imagen plana de referencia | 16 KB | ⚠️ No usado en Designer 2 |
| `bolso.png` | `src/resources/mockup/bolso.png` | Bolso | Imagen plana de referencia | 148 KB | ⚠️ No usado en Designer 2 |
| `cuadro.jpg` | `src/resources/mockup/cuadro.jpg` | Póster/Cuadro | Imagen plana de referencia | 54 KB | ⚠️ No usado en Designer 2 |
| `cuadro.png` | `src/resources/mockup/cuadro.png` | Póster/Cuadro | Imagen plana de referencia | 338 KB | ⚠️ No usado en Designer 2 |
| `gorra.png` | `src/resources/mockup/gorra.png` | Gorra | Imagen plana de referencia | 81 KB | ⚠️ No usado en Designer 2 |
| `hoddie.png` | `src/resources/mockup/hoddie.png` | Hoodie | Imagen plana de referencia | 128 KB | ⚠️ No usado en Designer 2 |
| `tazas.png` | `src/resources/mockup/tazas.png` | Taza | Imagen plana de referencia | 107 KB | ⚠️ No usado en Designer 2 |

---

## 3. Biblioteca de Diseños (Design Library)

**Ruta**: `src/resources/designs/`  
**Consumidor**: `services/design-resources.ts` (carga dinámica con `import.meta.glob`)  
**Usado por**: Designer 2 Left Sidebar, Designer 2 Workspace

| Filename | Tipo | Tamaño |
|---|---|---|
| img1.jpg | JPG | 14 KB |
| img2.png | PNG | 2.8 MB |
| img3.jpg | JPG | 69 KB |
| img4.png | PNG | 388 KB |
| img5.jpg | JPG | 106 KB |
| img6.jpg | JPG | 36 KB |
| img7.jpg | JPG | 27 KB |
| img8.jpg | JPG | 95 KB |
| img9.jpg | JPG | 190 KB |
| img10.jpg | JPG | 95 KB |
| img11.jpg | JPG | 24 KB |
| img12.jpg | JPG | 18 KB |
| img13.jpg | JPG | 84 KB |
| img14.jpg | JPG | 54 KB |
| img15.jpg | JPG | 41 KB |
| img16.jpg | JPG | 94 KB |
| img17.jpg | JPG | 18 KB |
| img18.jpg | JPG | 172 KB |
| img19.jpg | JPG | 335 KB |
| img20.jpg | JPG | 33 KB |
| img21.jpg | JPG | 45 KB |
| img22.jpg | JPG | 32 KB |
| img23.jpg | JPG | 83 KB |
| img24.jpg | JPG | 222 KB |
| img25.jpg | JPG | 164 KB |
| img26.jpg | JPG | 104 KB |
| img27.jpg | JPG | 89 KB |
| img28.jpg | JPG | 63 KB |

**Total**: 28 imágenes. Los nombres no describen el contenido semánticamente (img1-28). Candidatos para renombrado futuro.

> **NOTA**: `img2.png` tiene 2.8 MB. Esto puede impactar el tiempo de carga del bundle. Considerar optimización en fases posteriores.

---

## 4. Imágenes de Landing — Modelos 3D (fitted)

**Ruta**: `src/resources/landing_principal/images/`  
**Usado por**: Sección "Explora modelos 3D" en Landing

| Filename | Producto | Variante | Tamaño | Estado |
|---|---|---|---|---|
| `t-shirt-basic-fitted.png` | Camiseta | Fitted canvas 88% | 46 KB | ✅ |
| `t-shirt-basic.png` | Camiseta | Original | 53 KB | ✅ |
| `t-shirt-basic-removebg-preview.png` | Camiseta | Sin fondo | 41 KB | ✅ |
| `t-shirt-women-fitted.png` | Camiseta mujer | Fitted canvas 88% | 30 KB | ✅ |
| `t-shirt-women.png` | Camiseta mujer | Original | 38 KB | ✅ |
| `t-shirt-women-removebg-preview.png` | Camiseta mujer | Sin fondo | 33 KB | ✅ |
| `oversized-hoodie-fitted.png` | Hoodie Oversize | Fitted canvas 88% | 65 KB | ✅ |
| `oversized-hoodie.png` | Hoodie Oversize | Original | 71 KB | ✅ |
| `oversized-hoodie-removebg-preview.png` | Hoodie Oversize | Sin fondo | 58 KB | ✅ |
| `oversized-sweatshirt-fitted.png` | Sudadera Oversize | Fitted canvas 88% | 62 KB | ✅ |
| `oversized-sweatshirt.png` | Sudadera Oversize | Original | 67 KB | ✅ |
| `oversized-sweatshirt-removebg-preview.png` | Sudadera Oversize | Sin fondo | 55 KB | ✅ |
| `puffer_jacket-fitted.png` | Chaqueta acolchada | Fitted canvas 88% | 74 KB | ✅ |
| `puffer_jacket.png` | Chaqueta acolchada | Original | 71 KB | ✅ |
| `puffer_jacket-removebg-preview.png` | Chaqueta acolchada | Sin fondo | - | ⚠️ archivo vacío reportado |
| `shopping-bag-standard-fitted.png` | Bolsa estándar | Fitted canvas 88% | 69 KB | ✅ |
| `shopping-bag-standard.png` | Bolsa estándar | Original | 89 KB | ✅ |
| `shopping-bag-standard-removebg-preview.png` | Bolsa estándar | Sin fondo | 58 KB | ✅ |
| `shopping-bag-wide.png` | Bolsa ancha | Original | 113 KB | ✅ |
| `shopping-bag-wide-removebg-preview.png` | Bolsa ancha | Sin fondo | 64 KB | ✅ |
| `iphone-16-fitted.png` | iPhone 16 | Fitted canvas 88% | 50 KB | ✅ |
| `iphone-16.png` | iPhone 16 | Original | 56 KB | ✅ |
| `iphone-16-removebg-preview.png` | iPhone 16 | Sin fondo | 45 KB | ✅ |
| `macbook-pro-fitted.png` | MacBook Pro | Fitted canvas 88% | 89 KB | ✅ |
| `macbook-pro.png` | MacBook Pro | Original | 82 KB | ✅ |
| `ipad-pro-fitted.png` | iPad Pro | Fitted canvas 88% | 55 KB | ✅ |
| `ipad-pro.png` | iPad Pro | Original | 60 KB | ✅ |
| `ipad-pro-removebg-preview.png` | iPad Pro | Sin fondo | 37 KB | ✅ |
| `pro-display-fitted.png` | Monitor Pro Display | Fitted canvas 88% | 74 KB | ✅ |
| `pro-display.png` | Monitor Pro Display | Original | 69 KB | ✅ |
| `pro-display-removebg-preview.png` | Monitor Pro Display | Sin fondo | 47 KB | ✅ |
| `bucket-hat.png` | Gorro bucket | Original | 75 KB | ✅ |
| `book-hard.png` | Libro tapa dura | Original | 109 KB | ✅ |
| `general-tablet.png` | Tablet genérica | Original | 78 KB | ✅ |
| `general-tablet-removebg-preview.png` | Tablet genérica | Sin fondo | - | ⚠️ archivo vacío reportado |

> **AUSENTE**: `device-screen.png` — referenciado en `models3d.data.ts` para model-16 "Pantalla dinámica" pero no existe en el filesystem. Causa imagen rota en la Landing.

---

## 5. Imágenes de Landing — Hero y CTA

**Ruta**: `src/resources/landing_principal/images/`

| Filename | Propósito | Tamaño |
|---|---|---|
| `image_hero.png` | Hero de la Landing | 1.6 MB |
| `img_cta.png` | Sección CTA | 1.6 MB |
| `img_design_button_left.png` | Botón de diseño izquierda | 215 KB |
| `img_design_button_right.png` | Botón de diseño derecha | 127 KB |
| `img_design_top_right.png` | Imagen superior derecha | 243 KB |
| `designer_screenshot.png` | Screenshot del designer | 1.4 MB |

> **NOTA**: `image_hero.png`, `img_cta.png` y `designer_screenshot.png` son >1 MB. Candidatos a compresión/optimización.

---

## 6. Imágenes de Inspiración (Landing)

**Ruta**: `src/resources/landing_principal/inspiration/`  
*(No inspeccionado en detalle — fuera del alcance del designer en esta fase)*

---

## 7. Resumen de Assets por Estado

| Categoría | Total | Funcionales | Con problemas | Ausentes |
|---|---|---|---|---|
| Modelos GLB | 1 | 1 | 0 | 5 (hoodie, taza, gorra, póster, bolso) |
| Mockups 2D productos | 8 | 8 | 0 | 0 |
| Biblioteca diseños | 28 | 27 | 1 (img2 muy grande) | 0 |
| Imágenes landing models3D | ~34 | ~31 | ~2 vacíos | 1 (device-screen.png) |

---

*Documento creado en FASE 0 — Design Platform Architecture Phase.*
