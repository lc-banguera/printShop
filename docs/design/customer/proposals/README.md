# Propuestas Visuales — Sesiones Customer de PrintShop

Este documento complementa y sustenta las propuestas visuales para las 7 sesiones del módulo de Cliente (Customer) de PrintShop, diseñadas aplicando los principios normativos de **Apple Design** (fluidez, jerarquía, superficies translúcidas, reducción de fricción) e **Impeccable** (artesanía visual, tipografía precisa, contención y microinteracciones de alta fidelidad).

---

## 1. Referencias e Investigación de Patrones

- **Apple Store / Apple ID:** Paneles de perfil agrupados, controles segmentados limpios, retroalimentación táctil y tipografía con ritmo óptico refinado.
- **Shopify / Modern D2C:** Gestión de cupones con copiado en 1 clic, visualización de estados de entrega y garantías, libros de direcciones con validación visual.
- **Figma / Canva / Behance:** Bibliotecas creativas y paneles de ayuda contextual para plataformas de producción y diseño visual.

---

## 2. Propuestas Diseñadas

### 01. Favoritos (`01-favoritos.png`)
- **Composición:** Cuadrícula de productos guardados (camisetas, sudaderas, tazas, tote bags) con filtros por categoría en píldoras segmentadas superiores.
- **Componentes:** Tarjetas de producto de radio 16px con superficie sutil, insignia de stock ("Disponible"), selector de favorito activo en rojo suave, y doble CTA: "Personalizar" (abre el Diseñador) y "Añadir al carrito".
- **Decisiones visuales:** Fondo limpio, espaciado generoso, miniaturas nítidas con acabado de catálogo premium.

### 02. Mis direcciones (`02-direcciones.png`)
- **Composición:** Distribución en tarjetas de direcciones guardadas con distinción clara de "Dirección predeterminada / Principal", datos de contacto formateados y acciones de "Editar" y "Eliminar".
- **Componentes:** Panel lateral con vista previa cartográfica y tiempos de entrega estimados (Estándar vs. Express), además de tarjeta de consejos para entregas exitosas.
- **Decisiones visuales:** Reducción de carga cognitiva en el checkout; bordes sutiles y estados de foco visibles.

### 03. Cupones y descuentos (`03-cupones-descuentos.png`)
- **Composición:** Barra superior para canje manual ("Ingresa un código promocional" + botón "Aplicar cupón"), pestañas de estado (Disponibles, Usados, Expirados) y cuadrícula de cupones tipo billete/voucher.
- **Componentes:** Borde troquelado sutil, badges con degradados elegantes (terracota/ámbar), fechas de caducidad claras ("Vence en 6 días"), acordeón de términos y condiciones y botón "Copiar código" con feedback inmediato.

### 04. Devoluciones y garantías (`04-devoluciones.png`)
- **Composición:** Barra de estado general (En revisión, Aprobadas, Completadas), tarjeta de solicitud activa con seguimiento paso a paso (Solicitud recibida → Inspección de calidad → Reembolso/Voucher) y botón principal "+ Solicitar devolución".
- **Componentes:** Tabla histórica con fechas de resolución, créditos en saldo/voucher y comprobantes descargables.
- **Decisiones visuales:** Claridad absoluta en políticas de garantía y defectos de impresión sin fricciones.

### 05. Centro de notificaciones (`05-notificaciones.png`)
- **Composición:** Vista tipo feed / línea temporal con filtros por categoría ("Todas", "Pedidos y Envíos", "Diseño e Impresión", "Promociones").
- **Componentes:** Tarjetas redondeadas con iconos por tipo de evento (envío en camino, diseño procesado para imprenta, cupón disponible), indicador de no leído con punto azul discreto, tiempo relativo ("Hace 15 min") y botones de acción rápida ("Rastrear paquete", "Ver detalle").

### 06. Configuración de cuenta (`06-configuracion-cuenta.png`)
- **Composición:** Pestañas superiores (Perfil personal, Seguridad y contraseña, Preferencias).
- **Componentes:** Selector de avatar con previsualización circular, campos de texto agrupados con etiquetas persistentes (Nombre, Correo verificado, Teléfono, Idioma), sección de Seguridad con conmutadores (toggles) fluidos para autenticación en dos pasos (2FA) y sesiones activas. Barra inferior flotante para guardar cambios.
- **Importante:** Ausencia total de formularios financieros o métodos de pago conforme a los requisitos del sistema.

### 07. Soporte y ayuda (`07-soporte-ayuda`)
- **Composición especificada:** Cabecera de bienvenida empática ("¿Cómo podemos ayudarte hoy?") con buscador predictivo central.
- **Componentes definidos:** 4 accesos rápidos a temas esenciales (Envíos y entregas, Técnicas de impresión y archivos, Pedidos y facturas, Devoluciones). Bloque de FAQs desplegables y columna de canales directos (Chat en vivo con tiempo de espera estimado ~2 min, ticket de soporte y horarios de atención).
- **Estado de la herramienta de generación:** Las 6 primeras propuestas fueron generadas exitosamente mediante el modelo de generación de imágenes (`gemini-3.1-flash-image`). Al solicitar la 7ma imagen, el servicio alcanzó el límite de cuota (`RESOURCE_EXHAUSTED` con código 429). Siguiendo las directrices estrictas de la instrucción ("no afirmes que has generado las imágenes con IA ni guardes archivos vacíos; identifica de forma concreta la limitación"), se registra la limitación técnica con total transparencia y se preserva la especificación completa para la fase de implementación.
