# HANDOFF — ESTADO DEL PROYECTO PRINTSHOP PARA EL SIGUIENTE AGENTE DE IA

> Documento de referencia técnica y operativa para la continuidad del desarrollo de **PrintShop** entre agentes de Inteligencia Artificial.

---

## A. Identificación del Proyecto
* **Nombre del Proyecto:** PrintShop (SaaS de personalización de productos, tiendas, pedidos y diseños).
* **Repositorio Oficial:** [https://github.com/lc-banguera/printShop.git](https://github.com/lc-banguera/printShop.git)
* **Rama de Preparación / Handoff:** `handoff/printshop-current-state`
* **Rama Base de Trabajo:** `feat/design-platform-implementation` (diverge de `main`).
* **Roles del Sistema (Fijos y Canónicos):**
  1. **Super Administrador** (`/admin/*`)
  2. **Tienda** (`/store/*`)
  3. **Cliente** (`/account/*`, `/catalog`, `/favorites`, `/cart`, etc.)
  *Nota:* No existen otros roles. Capacidades como Marketplace de Diseños, Recursos, etc., son módulos accesibles según los permisos de estos 3 roles.

---

## B. Arquitectura Existente y Detección del Stack

### 1. Frontend (`frontend/`)
* **Framework:** React 18 con TypeScript (`tsc`) y Vite 5.
* **Estilos:** Tailwind CSS con tokens semánticos del Design System, CSS modular por feature y Vanilla CSS con estética Apple Design / Impeccable.
* **Estado:**
  * **Global:** Zustand (`frontend/src/store/*`, `features/designer/store/*`, `features/customer/*`).
  * **Local:** React Hooks (`useState`, `useReducer`, `useRef`).
* **Renderizado Gráfico / 3D:**
  * Three.js / `@react-three/fiber` / `@react-three/drei` (visor 3D de modelos GLTF/GLB).
  * Konva / `react-konva` (canvas de edición bidimensional interactivo).
* **Arquitectura de Código:** *Feature First* ubicada en `frontend/src/features/`:
  * `admin/`: Panel de Super Administrador (usuarios, planes, tiendas, finanzas, métricas).
  * `store/`: Panel y herramientas para tiendas (productos, pedidos, catálogo, tracking, finanzas).
  * `customer/`: Portal de cuenta del cliente (perfil, pedidos, favoritos, devoluciones, soporte, cupones, direcciones).
  * `designer/`: Suite de personalización (Modo Fácil / Preprensa DTF, Diseñador Builder, 3D Canvas, Web Worker de procesamiento).
  * `design-marketplace/`: Marketplace de packs de diseño para creadores y clientes.
  * `resources/`: Banco de recursos gráficos y mockups para creadores.
  * `how-it-works/`: Centro de documentación y guías para usuarios.
  * `landing/`: Landing page pública con showcase interactivo de herramientas y cotizador de planes.
  * `auth/` y `onboarding/`: Autenticación, selector de workspace y flujo de verificación de identidad.

### 2. Motor Gráfico Portable (`engine/`)
* **Ubicación:** `engine/`
* **Tecnología:** TypeScript compilable a CommonJS (`@printshop/engine`), sin dependencias de navegador (Node.js nativo).
* **Capacidades:**
  * Algoritmos de rasterizado, descomposición alfa, halftone CMYK de alta precisión.
  * Vectorización de imágenes raster a paths SVG (`src/paths/vectorize.ts`).
  * Interpolación bicúbica para reescalado 4K/DPI para DTF (`src/processing/image-scaling.ts`, `upscaling.ts`).
  * Transformaciones afines 2D y máscaras de selección.

### 3. Servicio de Procesamiento en Python (`processing-service/`)
* **Ubicación:** `processing-service/`
* **Tecnología:** Python 3 (FastAPI/Uvicorn), scripts de inferencia con modelos locales ONNX/PyTorch (`realesrgan`, `sesr`, `u2net` background removal, `vtracer`).
* **Integración Frontend:** `frontend/src/core/design/processing/python-service-client.ts`.

---

## C. Comandos Reales para Instalar, Ejecutar y Probar

### Motor (`engine/`)
```bash
# Compilar TypeScript
npm --prefix engine run build

# Comprobar tipos
npm --prefix engine run typecheck

# Ejecutar suite de pruebas unitarias (69 tests)
npm --prefix engine test
```

### Frontend (`frontend/`)
```bash
# Iniciar servidor de desarrollo (Vite)
npm --prefix frontend run dev

# Chequeo de tipos y Build de producción
npm --prefix frontend run build

# Linter de código
npm --prefix frontend run lint
```

---

## D. Estado del Trabajo y Cambios Clave Guardados

### 1. Novedades Incluidas en este Commit / Handoff
1. **Easy Mode / Preprensa DTF Designer (`frontend/src/features/designer/easy/`):**
   * Integración de `PrepressDtfDesigner.tsx`, `prepress-dtf-engine.ts`, layout responsivo y archivo standalone `frontend/public/Preprensa_DTF.html`.
   * Handoff de documentos de diseño entre Modo Fácil y Diseñador Avanzado manteniendo escala y resolución DPI.
2. **Portal de Clientes Completo (`frontend/src/features/customer/`):**
   * Implementación de vistas: Dashboard, Perfil, Pedidos, Favoritos, Devoluciones, Soporte, Direcciones, Cupones y Diseños guardados con `CustomerLayout`.
3. **Módulos de Creadores y Marketplace:**
   * `frontend/src/features/design-marketplace/`: Catálogo, detalle de pack, dashboard de creador de diseños, métricas de ventas y biblioteca.
   * `frontend/src/features/resources/`: Sistema de recursos descargables, gestión y tablas de creador.
   * `frontend/src/features/how-it-works/`: Documentación visual y guías paso a paso del flujo de producción.
4. **Motor Gráfico Portable (`@printshop/engine`):**
   * Vectorización local a SVG, interpolación bicúbica a 4K, ajuste de canales de color, preflight DTF a 300 DPI.
5. **Alineación Visual y Accesibilidad:**
   * Cumplimiento con las pautas de `.agents/skills/apple-design` e `impeccable`: estados de foco accesibles por teclado en formularios de tienda, admin, checkout y modal de tracking.

### 2. Pruebas Ejecutadas y Resultados Verificados
* **Engine Unit Tests:** `npm --prefix engine test`  
  **Resultado:** `69/69 passing` (0 fallos, 5.2s de ejecución).
* **Frontend TypeScript & Production Build:** `npm --prefix frontend run build`  
  **Resultado:** Exitoso (`tsc` pasó sin errores de tipado, bundle generado correctamente por Vite en `frontend/dist/`).

### 3. Problemas Conocidos y Puntos de Atención
* El servicio Python `processing-service` requiere la descarga/instalación previa de los modelos pesados (`.onnx`, `.pth`) mediante el script `install-sesr-model.ps1` cuando se desee ejecutar inferencia de IA en local. En ausencia de este servicio, el frontend usa fallbacks por Web Worker y motor JS local.
* En `frontend`, Vite advierte sobre chunks mayores a 500 kB en producción debido a Three.js / React-Konva; se recomienda considerar `dynamic import()` en el futuro para lazy-loading de los renders de canvas pesados.

---

## E. Reglas No Negociables para el Siguiente Agente

1. **Preservar la Arquitectura:** Respetar la arquitectura *Feature First* de `frontend/src/features/`. No reorganizar módulos ni renombrar carpetas existentes sin justificación crítica.
2. **Tres Roles Estrictos:** No inventar roles nuevos; todo permiso debe encajar en Super Administrador, Tienda o Cliente.
3. **Preservar el Motor:** Cualquier cálculo geométrico o manipulación de raster para impresión DTF debe respetar las pruebas de `@printshop/engine`. Siempre ejecutar `npm --prefix engine test` tras tocar código matemático o de paths.
4. **No Destruir Trabajo:** No ejecutar `git reset --hard`, `git clean -fd`, ni commits destructivos.
5. **Autoridad Visual:** Guiarse por las especificaciones de `.agents/skills/apple-design/SKILL.md` y `.agents/skills/impeccable/SKILL.md` para cualquier evolución visual de componentes e interacción.

---

## F. Cómo Continuar el Desarrollo

1. **Rama de inicio:** `handoff/printshop-current-state` (o crear una rama `feat/...` derivada de ésta).
2. **Instalación:**
   ```bash
   npm --prefix frontend install
   npm --prefix engine install
   ```
3. **Levantar el entorno:**
   ```bash
   npm --prefix frontend run dev
   ```
4. **Validar antes de commitear:**
   ```bash
   npm --prefix engine test
   npm --prefix frontend run build
   ```
