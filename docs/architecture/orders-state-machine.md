# Arquitectura y Máquina de Estados del Sistema de Pedidos — PrintShop

**Versión:** 1.0.0  
**Fecha:** Mayo 2026  
**Estado:** Documento Oficial de Especificación de Arquitectura  
**Módulo:** Gestión de Pedidos (`/store/orders`)  
**Ecosistema:** PrintShop SaaS (Frontend React + Vite / Backend Spring Boot + PostgreSQL)  

---

## 1. Objetivo

Definir la arquitectura funcional, el modelo de dominio y la máquina de estados formal para el ciclo de vida de los pedidos en **PrintShop**.

El sistema de personalización bajo demanda (Print-on-Demand) de PrintShop requiere desacoplar el ciclo de vida del pedido en dimensiones ortogonales e interdependientes (comercial, financiera, manufactura, logística, postventa e incidencias).

### Principio Rector
> **Ningún estado se modifica arbitrariamente mediante selectores genéricos (CRUD). Toda transición es el resultado de una Acción Contextual validada, ejecutada por un rol autorizado, precedida por un formulario o confirmación, registrada de forma inmutable en la auditoría y respaldada por el Backend como única fuente de verdad.**

---

## 2. Modelo de Estados Multidimensional

En lugar de un campo monolítico `status: string`, un pedido en PrintShop se modela mediante **seis dimensiones de estado**:

```
                              ┌─────────────────────────┐
                              │    ORDER STATE MODEL    │
                              └────────────┬────────────┘
         ┌──────────────────┬──────────────┼──────────────┬──────────────────┐
         ▼                  ▼              ▼              ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌───────────┐ ┌─────────────┐ ┌───────────────────┐
│   orderStatus   │ │paymentStatus │ │production │ │  shipping   │ │   returnStatus    │
│    (Global)     │ │ (Financiero) │ │  Status   │ │   Status    │ │   & issueStatus   │
│                 │ │              │ │ (Taller)  │ │ (Logística) │ │   (Postventa)     │
└─────────────────┘ └──────────────┘ └───────────┘ └─────────────┘ └───────────────────┘
```

### 2.1. Dimensión 1: `orderStatus` (Estado General Comercial)
Representa la vigencia del contrato de compraventa entre el cliente y la tienda.
- `OPEN`: Pedido activo en curso.
- `COMPLETED`: Pedido concluido con éxito (entregado y liquidado sin disputas activas).
- `CANCELLED`: Pedido anulado formalmente antes de su entrega.
- `ARCHIVED`: Condición administrativa histórica para pedidos concluidos o cancelados hace más de 90 días.

### 2.2. Dimensión 2: `paymentStatus` (Estado Financiero)
Gestionado primariamente por webhooks asíncronos de pasarelas de pago (Mercado Pago, Wompi, etc.).
- `PENDING`: Esperando acreditación o captura de fondos.
- `PAID`: Pago verificado, capturado y conciliado.
- `FAILED`: Transacción rechazada por fondos insuficientes, fraude o error bancario.
- `REFUNDED`: Reembolso total o parcial emitido al comprador.
- `VOIDED`: Autorización anulada antes de la captura.

### 2.3. Dimensión 3: `productionStatus` (Estado de Confección y Estampado)
Controla la manufactura en el taller de impresión textil y artículos personalizados.
- `NOT_STARTED`: Pedido en cola, prendas base no reservadas o en espera de pago confirmado.
- `IN_PRODUCTION`: Prendas en taller de estampado (DTG, serigrafía, sublimación o bordado).
- `READY`: Artículos producidos, verificados en control de calidad (QC) y empaquetados.

### 2.4. Dimensión 4: `shippingStatus` (Estado Logístico y Transporte)
Controla el tránsito físico del paquete con las transportadoras aliadas (Coordinadora, Servientrega, Inter Rapidísimo, etc.).
- `NOT_SHIPPED`: Paquete en bodega sin guía generada ni entrega a transportadora.
- `SHIPPED`: Guía de rastreo generada y paquete rotulado en espera de recolección.
- `IN_TRANSIT`: En poder de la transportadora y en movimiento hacia destino.
- `DELIVERED`: Entregado al destinatario final con prueba de entrega (POD).

### 2.5. Dimensión 5: `returnStatus` (Estado de Devoluciones y Garantías)
- `NONE`: Sin trámite de devolución.
- `REQUESTED`: Solicitud radicada por el cliente con motivos y fotografías.
- `IN_REVIEW`: En evaluación por el vendedor o soporte administrativo.
- `APPROVED`: Devolución o garantía aceptada (procede re-producción o nota crédito).
- `REJECTED`: Solicitud desestimada con justificación formal.
- `COMPLETED`: Producto recibido en bodega o caso cerrado.

### 2.6. Dimensión 6: `issueStatus` (Gestión de Incidencias Operativas)
- `NONE`: Flujo regular sin anomalías.
- `REPORTED`: Novedad reportada (dirección incompleta, destinatario ausente, daño en tránsito, rotura de stock en prenda base).
- `UNDER_REVIEW`: En coordinación entre transportadora, tienda y cliente.
- `RESOLVED`: Novedad resuelta y flujo operativo reanudado.

---

## 3. Flujo Principal (Happy Path)

El flujo natural de un pedido en PrintShop sigue este encadenamiento estricto entre dimensiones:

```
[1. Check-out Cliente]
       │
       ▼
orderStatus: OPEN
paymentStatus: PENDING
productionStatus: NOT_STARTED
shippingStatus: NOT_SHIPPED
       │
       │ Webhook Pasarela de Pagos (PAID)
       ▼
paymentStatus: PAID
       │
       │ Acción Vendedor: "Iniciar Producción"
       ▼
productionStatus: IN_PRODUCTION
       │
       │ Acción Taller: "Marcar como Listo" (Control de Calidad Aprobado)
       ▼
productionStatus: READY
       │
       │ Acción Despacho: "Preparar Envío" (Generación de Guía & Transportadora)
       ▼
shippingStatus: SHIPPED
       │
       │ Evento Webhook Transportadora: Paquete en Movimiento
       ▼
shippingStatus: IN_TRANSIT
       │
       │ Evento Webhook Transportadora / Confirmación: Entrega Exitosa
       ▼
shippingStatus: DELIVERED
orderStatus: COMPLETED
```

---

## 4. Tabla Maestra de Transiciones y Reglas de Negocio

| Estado Origen | Acción Disparadora | Precondiciones Obligatorias | Estado Destino | Formulario / Confirmación | Roles Permitidos |
|---|---|---|---|---|---|
| `paymentStatus: PENDING` | `CONFIRMAR_PAGO` | Webhook pasarela con firma criptográfica válida o comprobante manual aprobado | `paymentStatus: PAID` | Ninguno (Automático por Webhook) / Modal de Aprobación Manual | `SYSTEM`, `SUPER_ADMIN` |
| `paymentStatus: PENDING` | `FALLO_PAGO` | Rechazo reportado por la pasarela o expiración de tiempo límite (72h) | `paymentStatus: FAILED` | Automático por Webhook | `SYSTEM` |
| `paymentStatus: FAILED` | `REINTENTAR_PAGO` | Pedido dentro de las 48h posteriores al fallo | `paymentStatus: PENDING` | Modal de regeneración de link de cobro | `CLIENTE`, `TIENDA` |
| `paymentStatus: PAID` + `productionStatus: NOT_STARTED` | `INICIAR_PRODUCCION` | Pago confirmado, archivos de diseño en resolución apta (>= 300 DPI) | `productionStatus: IN_PRODUCTION` | **Modal 1: Confirmar Inicio de Producción** | `TIENDA`, `SUPER_ADMIN` |
| `productionStatus: IN_PRODUCTION` | `MARCAR_LISTO` | Todos los artículos del pedido estampados y verificados | `productionStatus: READY` | **Modal 2: Control de Calidad y Listo** | `TIENDA`, `SUPER_ADMIN` |
| `productionStatus: READY` + `shippingStatus: NOT_SHIPPED` | `PREPARAR_ENVIO` | Pedido empaquetado, dimensiones y peso verificados | `shippingStatus: SHIPPED` | **Modal 3: Preparar Despacho y Guía** | `TIENDA`, `SUPER_ADMIN` |
| `shippingStatus: SHIPPED` | `DESPACHAR_TRANSPORTADORA` | Paquete entregado a transportadora con manifiesto | `shippingStatus: IN_TRANSIT` | Webhook de tracking o Confirmación rápida | `TIENDA`, `SYSTEM` |
| `shippingStatus: IN_TRANSIT` | `CONFIRMAR_ENTREGA` | Guía reportada como entregada por transportadora | `shippingStatus: DELIVERED`<br>`orderStatus: COMPLETED` | Webhook transportadora o Modal de confirmación con firma/recibo | `SYSTEM`, `TIENDA`, `SUPER_ADMIN` |
| `orderStatus: OPEN` (Cualquier fase pre-envío) | `REPORTAR_INCIDENCIA` | Bloqueo en taller, dirección errada o novedad transportadora | `issueStatus: REPORTED` | **Modal 4: Reportar Incidencia** | `TIENDA`, `SUPER_ADMIN`, `SYSTEM` |
| `issueStatus: REPORTED` | `RESOLVER_INCIDENCIA` | Causa de la novedad subsanada | `issueStatus: RESOLVED` | Modal de resolución con notas | `TIENDA`, `SUPER_ADMIN` |
| `orderStatus: OPEN` | `CANCELAR_PEDIDO` | `shippingStatus == NOT_SHIPPED`. Si `productionStatus == IN_PRODUCTION`, requiere autorización admin | `orderStatus: CANCELLED`<br>`productionStatus: NOT_STARTED`<br>`paymentStatus: REFUNDED/VOIDED` | **Modal 5: Cancelación de Pedido** | `TIENDA`, `SUPER_ADMIN` |
| `shippingStatus: DELIVERED` | `SOLICITAR_DEVOLUCION` | Dentro de los 5 días hábiles post-entrega (garantía o defecto) | `returnStatus: REQUESTED` | **Modal 6: Solicitud de Garantía/Devolución** | `CLIENTE`, `SUPER_ADMIN` |
| `returnStatus: REQUESTED` | `RESOLVER_DEVOLUCION` | Fotos y evidencias evaluadas | `returnStatus: APPROVED` o `REJECTED` | Modal de dictamen técnico | `TIENDA`, `SUPER_ADMIN` |

---

## 5. Matriz de Compatibilidad de Transiciones (Estados Imposibles)

Para prevenir inconsistencias lógicas en base de datos y frontend, se establecen las siguientes restricciones invariantes:

```
                                  MATRIZ DE INVARIANTES
┌──────────────────────────────────────────────┬─────────────────────────────────────────────────┐
│ Invariante Restrictivo                       │ Justificación de Negocio                        │
├──────────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ NO `productionStatus: IN_PRODUCTION`         │ No se estampa ni incurre en costos de materia   │
│ sin `paymentStatus: PAID`                    │ prima sin dinero garantizado y conciliado.      │
├──────────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ NO `shippingStatus: SHIPPED`                 │ No se puede despachar un pedido que no ha sido  │
│ sin `productionStatus: READY`                │ completamente terminado e inspeccionado.        │
├──────────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ NO `shippingStatus: IN_TRANSIT`              │ Es físicamente imposible estar en tránsito sin  │
│ con `shippingStatus: NOT_SHIPPED`            │ haber generado guía ni salido de taller.        │
├──────────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ NO retroceso `SHIPPED` → `NOT_SHIPPED`       │ Una vez emitida la guía, se cancela o anula la  │
│ de forma arbitraria                          │ guía mediante novedad, no retrocediendo tiempo. │
├──────────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ NO `CANCELLED` en pedido ya `SHIPPED`        │ Si el paquete ya fue despachado, aplica proceso │
│ o `DELIVERED`                                │ de devolución o retorno, no cancelación directa.│
├──────────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ NO reanudación de pedido `CANCELLED`         │ La cancelación es estado terminal. Se debe      │
│                                              │ crear un nuevo pedido si el cliente recomienza. │
└──────────────────────────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 6. Acciones Disponibles por Estado (UI / UX Contextual)

En la interfaz de usuario (`/store/orders`), la columna de **Acciones** y los botones del **Modal de Detalle** deben calcularse dinámicamente según el estado:

### 6.1. Vista Tabla de Pedidos (`orders.tsx`)
1. **Acción Principal Siempre Presente**:
   - `[ Ver detalle ]`: Abre el modal exhaustivo con información del cliente, productos y tracking.
2. **Acción Rápida Secundaria (Segura)**:
   - Si `paymentStatus === "PAID"` y `productionStatus === "NOT_STARTED"`:
     - Botón secundario discreto: `[ Iniciar producción ]`.
   - Si `productionStatus === "IN_PRODUCTION"`:
     - Botón secundario discreto: `[ Marcar listo ]`.
   - Si `productionStatus === "READY"` y `shippingStatus === "NOT_SHIPPED"`:
     - Botón secundario discreto: `[ Preparar envío ]`.
   - Si `shippingStatus === "IN_TRANSIT"` o `SHIPPED`:
     - Botón secundario discreto: `[ Rastrear guía ]`.

### 6.2. Vista Modal de Detalle de Pedido
En el encabezado o footer del modal se presentan las acciones operativas con validación:
- **Botón Primario**: Acción siguiente recomendada en el Happy Path (`Iniciar Producción`, `Marcar como Listo`, `Preparar Envío`).
- **Botón de Novedad/Incidencia**: `[ Reportar Novedad ]` (abre modal de incidencia).
- **Botón Destructivo/Cancelación**: `[ Cancelar Pedido ]` (solo si no ha sido enviado; requiere motivo).

---

## 7. Especificación de Formularios y Modales de Transición

Ninguna transición crítica ocurre sin captura de datos. A continuación se especifican los modales requeridos:

### Modal 1: Iniciar Producción
- **Título**: `Enviar Pedido #ORD-XXXX a Producción`
- **Campos**:
  - Resumen visual de prendas a estampar con su respectiva talla, color y técnica.
  - Checkbox: `Verifiqué que los archivos de diseño cumplen con los requerimientos técnicos de impresión (resolución y área de estampado)`.
  - Input opcional: `Notas para el taller de estampado` (textarea, máx. 250 caracteres).
- **Acciones**: `[ Cancelar ]` | `[ Confirmar e Iniciar ]`

### Modal 2: Control de Calidad y Listo para Despacho
- **Título**: `Completar Producción #ORD-XXXX`
- **Campos**:
  - Lista de chequeo (Quality Check):
    - [x] Estampado centrado y sin defectos visuales.
    - [x] Tallas y prendas corresponden a la orden de compra.
    - [x] Empaque protector y etiquetas PrintShop colocadas.
  - Input opcional: `Ubicación en estante de despacho` (ej: "Estante B-12").
- **Acciones**: `[ Cancelar ]` | `[ Marcar como Listo ]`

### Modal 3: Preparar Envío y Generar Despacho
- **Título**: `Generar Despacho para Pedido #ORD-XXXX`
- **Campos**:
  - Selector: `Empresa Transportadora` (*Coordinadora*, *Servientrega*, *Inter Rapidísimo*, *Envío Propio / Retiro en Taller*).
  - Input obligatorio: `Número de Guía de Rastreo` (validación de formato según transportadora).
  - Input: `Fecha estimada de entrega` (date picker, por defecto +3 días hábiles).
  - Switch: `Notificar automáticamente al cliente por correo y SMS con el enlace de rastreo` (por defecto: `true`).
  - Input opcional: `Costo de envío real` (para balance de finanzas).
- **Acciones**: `[ Cancelar ]` | `[ Confirmar Despacho ]`

### Modal 4: Reportar Incidencia Operativa
- **Título**: `Reportar Novedad en Pedido #ORD-XXXX`
- **Campos**:
  - Selector de categoría:
    - *Falta de stock en prenda base / color*
    - *Falla en maquinaria de estampado*
    - *Dirección del cliente incompleta / errónea*
    - *Novedad reportada por transportadora*
    - *Otro motivo operativo*
  - Textarea obligatorio: `Descripción detallada de la novedad`.
  - Switch: `Pausar temporalmente el tiempo de entrega prometido`.
- **Acciones**: `[ Descartar ]` | `[ Registrar Incidencia ]`

### Modal 5: Cancelación de Pedido
- **Título**: `Cancelar Pedido #ORD-XXXX`
- **Campos**:
  - Alerta visual destacada: *"Esta acción anulará el pedido y liberará el inventario reservado"*.
  - Selector de motivo:
    - *Solicitud explícita del cliente*
    - *Inventario agotado del proveedor*
    - *Sospecha de fraude / pago no reconocido*
    - *Error insubsanable en el diseño proporcionado*
  - Textarea: `Observaciones internas para auditoría`.
  - Selector de reembolso:
    - *Reembolsar automáticamente por pasarela*
    - *Emitir saldo a favor en tienda / cupón*
    - *Sin reembolso (pago nunca fue acreditado)*
- **Acciones**: `[ Regresar ]` | `[ Confirmar Cancelación (Botón Rojo) ]`

---

## 8. Registro de Auditoría y Línea de Tiempo (`OrderTimeline`)

Cada pedido mantendrá un log inmutable de eventos de auditoría que alimenta la línea de tiempo visual del detalle del pedido.

### 8.1. Estructura del Evento
```typescript
export interface OrderTimelineEvent {
  id: string;                      // UUID único del evento
  orderId: string;                 // Referencia al pedido
  event: OrderEventType;           // Código normalizado del evento
  previousState: OrderStateSnapshot; // Estado anterior
  newState: OrderStateSnapshot;      // Estado resultante
  description: string;             // Glosa legible para humanos
  performedBy: {
    userId: string;
    userName: string;
    role: "SUPER_ADMIN" | "TIENDA" | "CLIENTE" | "SYSTEM" | "PAYMENT_GATEWAY";
  };
  metadata?: Record<string, any>;  // Datos contextuales (guía, motivo, id pasarela)
  createdAt: string;               // ISO 8601 Timestamp UTC
}
```

### 8.2. Catálogo Oficial de Eventos
1. `ORDER_CREATED`: Pedido registrado por el comprador en la tienda.
2. `PAYMENT_PENDING`: Orden enviada a pasarela de cobro.
3. `PAYMENT_CAPTURED`: Pago acreditado y conciliado por webhook.
4. `PAYMENT_FAILED`: Intento de pago rechazado.
5. `PRODUCTION_STARTED`: Taller comenzó estampado de las prendas.
6. `PRODUCTION_QUALITY_CHECK_PASSED`: Control de calidad superado.
7. `PRODUCTION_COMPLETED`: Artículos empaquetados y marcados como listos.
8. `SHIPPING_GUIDE_GENERATED`: Guía de transportadora asignada.
9. `SHIPPING_DISPATCHED`: Paquete recogido por la transportadora.
10. `SHIPPING_IN_TRANSIT`: En movimiento en centro de distribución.
11. `SHIPPING_DELIVERED`: Entregado al cliente final.
12. `ISSUE_REPORTED`: Novedad registrada en el pedido.
13. `ISSUE_RESOLVED`: Novedad subsanada.
14. `ORDER_CANCELLED`: Pedido cancelado y cerrado.
15. `REFUND_ISSUED`: Reembolso liquidado al cliente.
16. `RETURN_REQUESTED`: Garantía solicitada por cliente.
17. `RETURN_APPROVED`: Garantía admitida por la tienda.

---

## 9. Pedidos Multi-Producto y Estado a Nivel de Artículo

PrintShop permite cestas con múltiples productos personalizados (ej: 2 Camisetas Oversize + 1 Gorra bordada + 2 Tazas sublimadas).

### 9.1. Producción Asíncrona por Línea de Producto
En talleres especializados, las tazas van a una prensa térmica, mientras que las camisetas van a impresión digital directa (DTG). Para soportar esto:
- Cada `OrderItem` tiene su propio `itemProductionStatus`:
  - `NOT_STARTED`
  - `IN_PRODUCTION`
  - `READY`
- **Regla de Agregación**:
  - `productionStatus` del Pedido completo es `IN_PRODUCTION` si al menos un artículo está `IN_PRODUCTION` o `READY`.
  - `productionStatus` del Pedido completo pasa a `READY` **únicamente cuando el 100% de los artículos están `READY`**.
  - No se permite despachar (`SHIPPED`) si existen artículos pendientes de producción (PrintShop no realiza envíos parciales por defecto para evitar sobrecostos al vendedor).

---

## 10. Patrón Snapshot en `OrderItem` (Inmutabilidad Histórica)

Un pedido histórico jamás debe renderizarse consultando las tablas maestras vivas de productos o diseños. Si el vendedor cambia el precio de la camiseta mañana o edita el diseño gráfico, el pedido histórico debe permanecer inalterado.

### Modelo del Snapshot:
```typescript
export interface OrderItemSnapshot {
  id: string;                      // ID de la línea de pedido
  productId: string;               // Referencia al producto original
  variantId: string;               // Referencia a la variante
  
  // Snapshots Inmutables de Producto
  productTitleSnapshot: string;    // "Camiseta Oversize Premium"
  skuSnapshot: string;             // "TSH-OVR-WHT-L"
  categorySnapshot: string;        // "Camisetas"
  attributesSnapshot: {
    color: string;                 // "Blanco Algodón"
    colorHex: string;              // "#FFFFFF"
    size: string;                  // "L"
    fabricWeight: string;          // "240g Peinado"
  };
  
  // Snapshots Inmutables de Diseño Personalizado
  designSnapshot: {
    designId: string;
    designTitle: string;
    previewUrl: string;            // Mockup renderizado con el diseño
    printZone: "FRONT" | "BACK" | "CHEST_POCKET" | "SLEEVE";
    dimensionsMm: { width: number; height: number };
    technique: "DTG" | "SUBLIMATION" | "VINYL" | "EMBROIDERY";
    highResAssetUrl: string;       // Archivo de impresión de 300 DPI original
  };
  
  // Snapshots Financieros
  quantity: number;
  unitBasePrice: number;           // Precio de la prenda base
  unitPrintPrice: number;          // Costo de estampado
  unitFinalPrice: number;          // unitBasePrice + unitPrintPrice
  totalPrice: number;              // unitFinalPrice * quantity
  
  // Estado individual
  itemProductionStatus: "NOT_STARTED" | "IN_PRODUCTION" | "READY";
}
```

---

## 11. Arquitectura de Pagos, Webhooks e Idempotencia

### 11.1. Separación de Responsabilidades
El frontend **nunca** reporta un pago como acreditado. El frontend únicamente recibe un token o redirección de pasarela y consulta el estado en modo lectura con polling o Server-Sent Events (SSE).

### 11.2. Flujo Asíncrono de Conciliación:
```
Cliente ──(Paga en pasarela)──> Pasarela (Mercado Pago / Wompi)
                                         │
                              POST /api/webhooks/payments
                                         │
                                         ▼
                                Backend PrintShop
                                         │
                 1. Validar HMAC Signature con secret de pasarela
                 2. Verificar Idempotency Key (payment_event_id)
                 3. Iniciar Transacción DB @Transactional (ACID)
                 4. Actualizar Payment Record → PAID
                 5. Transicionar Order.paymentStatus → PAID
                 6. Insertar OrderTimeline (PAYMENT_CAPTURED)
                 7. Disparar notificaciones asíncronas
                                         │
                                         ▼
                              Respuesta HTTP 200 OK
```

### 11.3. Idempotencia y Protección contra Doble Procesamiento
- La base de datos mantendrá una tabla `processed_webhook_events` con índice único en `(gateway_name, external_event_id)`.
- Si la pasarela reintenta un webhook ya procesado, el backend responde inmediatamente `HTTP 200 OK` sin ejecutar transiciones de estado repetidas ni alterar la contabilidad.

---

## 12. Matriz de Permisos por Rol (RBAC)

De acuerdo con `AGENTS.md`, PrintShop cuenta únicamente con tres roles de usuario:

| Acción sobre Pedido | CLIENTE | TIENDA (Vendedor) | SUPER_ADMIN |
|---|:---:|:---:|:---:|
| Ver sus propios pedidos | ✅ | ✅ (Solo pedidos de su tienda) | ✅ (Todos) |
| Iniciar producción | ❌ | ✅ | ✅ |
| Marcar listo para empaque | ❌ | ✅ | ✅ |
| Generar guía y preparar envío | ❌ | ✅ | ✅ |
| Confirmar entrega | ❌ | ✅ | ✅ |
| Reportar novedad de entrega | ❌ | ✅ | ✅ |
| Cancelar pedido pre-producción | ✅ (Dentro de 1 hora) | ✅ | ✅ |
| Cancelar pedido en producción | ❌ | ❌ (Requiere ticket) | ✅ |
| Emitir reembolso directo | ❌ | ❌ | ✅ |
| Solicitar garantía / devolución | ✅ | ❌ | ✅ (En su nombre) |
| Aprobar / Rechazar garantía | ❌ | ✅ (Dictamen) | ✅ (Resolución final) |
| Modificar dirección de entrega | ✅ (Pre-despacho) | ✅ (Pre-despacho) | ✅ |

---

## 13. Casos Excepcionales y Protocolos de Resolución

### 13.1. Reversión de Guía por Error de Tipografía
- Si el vendedor digitó un número de guía incorrecto en `SHIPPED`, no puede editar libremente el campo.
- Debe ejecutar la acción `[ Corregir Guía de Envío ]`, lo cual requiere registrar el motivo (ej: "Error de digitación en transportadora") y genera un evento `SHIPPING_GUIDE_UPDATED` en la auditoría notificando al cliente con la nueva guía.

### 13.2. Devolución por Daño de Paquete en Transporte
- El paquete llega a `DELIVERED`, pero el cliente reporta que la taza llegó fracturada.
- Se abre `returnStatus: REQUESTED`.
- El vendedor evalúa fotos y aprueba `returnStatus: APPROVED`.
- Se genera una orden de re-producción vinculada (`reproductionOf: "#ORD-XXXX"`), enviando la taza directamente a `productionStatus: IN_PRODUCTION` sin requerir nuevo pago al cliente.

---

## 14. Plan de Adaptación para el Código Actual (`orders.tsx`)

El código actual de `/store/orders` se encuentra en una base visual excelente, limpia y sin badges multicolores (utiliza `StatusDot`). En la siguiente fase de desarrollo funcional, las adaptaciones puntuales serán:

1. **Extensión del Modelo Mock**:
   - Reemplazar el `status` único por el objeto de estados multidimensional:
     ```typescript
     orderStatus: "OPEN" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
     paymentStatus: "Pagado" | "Pendiente" | "Reembolsado" | "Fallido";
     productionStatus: "Sin iniciar" | "En producción" | "Listo";
     shippingStatus: "Sin despachar" | "Enviado" | "En tránsito" | "Entregado";
     ```
2. **Cálculo del Indicador Principal (`StatusDot`)**:
   - En la tabla de pedidos, el `StatusDot` mostrará el estado más relevante del ciclo actual (ej: si ya está pagado pero en producción, muestra `● En producción`; si ya fue despachado, muestra `● En camino`).
3. **Sustitución de Botones de Acción Estáticos por Acciones Contextuales**:
   - Reemplazar el selector de filtros o acciones genéricas por botones basados en la máquina de estados.
4. **Construcción Modular de los 5 Modales de Transición**:
   - Componentes modales dedicados dentro de `frontend/src/features/store/orders/components/`.

---

*Fin de la especificación oficial de arquitectura de pedidos (Fase 1).*

---

# FASE 2: ARQUITECTURA DE ENVÍOS (SHIPMENTS) Y EVENTOS DE RASTREO (TRACKING EVENTS)

## 15. Principio de Single Source of Truth para Logística

`Shipment.shippingStatus` es la **única fuente de verdad** del estado de cada envío físico.
`Order.shippingStatus` se mantiene exclusivamente como un estado **derivado/agregado** mediante la función centralizada `getAggregatedShippingStatus(order)`.

No se permiten discrepancias donde el pedido figure con un estado que contradiga el estado real de sus envíos.

---

## 16. Entidades Nuevas del Dominio Logístico

### 16.1. `Shipment`
Representa un paquete físico preparado y despachado con una empresa de envíos:

```typescript
export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  shipmentId?: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippingStatus: ShipmentStatus;
  shippedAt?: string;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  trackingEvents: TrackingEvent[];
}
```

### 16.2. `TrackingEvent`
Representa un hito inmutable en la bitácora cronológica de transporte del paquete:

```typescript
export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  description: string;
  location?: string;
  occurredAt: string;
  source: "mock" | "carrier_webhook" | "manual";
  externalEventId?: string;
  createdAt: string;
}
```

---

## 17. Nuevos Estados y Transiciones de Envíos

Se incorpora el estado `OUT_FOR_DELIVERY` ("En ruta de entrega") a la dimensión de despacho:

```
NOT_SHIPPED ➔ SHIPPED ➔ IN_TRANSIT ➔ OUT_FOR_DELIVERY ➔ DELIVERED
```

- **`SHIPPED`**: Guía generada por el vendedor; paquete embalado y listo para recolección en bodega.
- **`IN_TRANSIT`**: Recolectado por la transportadora y moviéndose entre centros logísticos.
- **`OUT_FOR_DELIVERY`**: Paquete a bordo del vehículo de reparto urbano de última milla.
- **`DELIVERED`**: Paquete entregado a satisfacción al cliente.

---

## 18. Algoritmo de Derivación: `getAggregatedShippingStatus`

Ubicado en `frontend/src/features/store/orders/orderActions.ts`:
1. Si `shipments` está vacío ➔ `NOT_SHIPPED`.
2. Si todos los envíos están en `DELIVERED` ➔ `DELIVERED`.
3. Si algún envío está en `OUT_FOR_DELIVERY` ➔ `OUT_FOR_DELIVERY`.
4. Si algún envío está en `IN_TRANSIT` ➔ `IN_TRANSIT`.
5. Si algún envío está en `SHIPPED` ➔ `SHIPPED`.
6. En cualquier otro caso ➔ `NOT_SHIPPED`.

---

## 19. Sistema de Disponibilidad de Acciones (3 Estados)

Cada acción contextual es evaluada mediante `getOrderActionAvailability(order)` produciendo:
- **`AVAILABLE`**: Transición permitida, botón interactivo destacado.
- **`DISABLED`**: La acción existe en esta fase del flujo pero no cumple precondiciones (ej. "Requiere pago confirmado", "Producción no finalizada", "El paquete debe estar en tránsito antes de pasar a ruta"). La UI muestra el botón deshabilitado con tooltip del motivo.
- **`HIDDEN`**: La acción no tiene relevancia en el estado actual del pedido o es ilegal (ej. no mostrar "Preparar envío" si el pedido está cancelado o ya entregado).

---

# FASE 3: DOMINIO INTEGRAL — FULFILLMENT, PAGOS PARCIALES, TIENDAS Y REQUERIMIENTOS

## 20. Dimensiones de Fulfillment (`FulfillmentType`)

El ciclo de vida del pedido se ramifica según cómo debe cumplirse:

1. **`READY_TO_SHIP`**:
   - Producto de stock terminado.
   - `paymentMode: FULL_PAYMENT` (100% prepagado).
   - **`INICIAR_PRODUCCION` está `HIDDEN`** (nunca entra a taller).
   - Transiciona directamente a `PREPARAR_ENVIO` ➔ `DESPACHAR_TRANSPORTADORA`.

2. **`CUSTOMIZE_EXISTING`**:
   - Prenda base estándar + diseño del catálogo personalizado.
   - Exige pago completo (`FULL_PAYMENT`) antes de confección.
   - `NOT_STARTED` ➔ `IN_PRODUCTION` ➔ `READY` ➔ Envío.
   - No aplica período de 7 días.

3. **`CUSTOM_FROM_SCRATCH`**:
   - Personalización total con requerimientos y tienda seleccionada.
   - Admite `paymentMode: DEPOSIT_PLUS_BALANCE` (ej: 60% anticipo / 40% saldo).
   - Requiere pago de anticipo para iniciar producción.
   - Al pasar a `READY`, **inicia automáticamente el plazo de 7 días**.
   - Exige liquidación total del saldo antes de permitir el despacho.

---

## 21. Plan Financiero y Snapshot de Anticipo (`PaymentPlan`)

```typescript
export interface PaymentPlan {
  paymentMode: "FULL_PAYMENT" | "DEPOSIT_PLUS_BALANCE";
  depositPercentage: number; // Snapshot inmutable (ej: 60)
  totalAmount: number;
  depositAmount: number;
  amountPaid: number;
  balanceAmount: number;
  balanceDueAt?: string; // Seteado exactamente cuando productionStatus -> READY
  balanceDeadlineAt?: string; // balanceDueAt + 7 días
  balancePaymentStatus: "NO_BALANCE" | "BALANCE_PENDING" | "BALANCE_PAID" | "BALANCE_EXPIRED";
}
```

- **Snapshot Inmutable**: `depositPercentage` se congela con el valor configurado por la tienda al crear la orden. Cambios futuros en la política del vendedor no alteran órdenes preexistentes.

---

## 22. Regla Central del Período de 7 Días

1. **Momento de activación**: Se calcula exclusivamente a partir del timestamp en que la prenda es aprobada en control de calidad (`productionStatus === "READY"`):
   - `balanceDueAt = timestamp_ready`
   - `balanceDeadlineAt = balanceDueAt + 7 días`
2. **Cálculo dinámico**: Días restantes se derivan mediante `getBalanceDaysRemaining(order, now)` sin depender de valores estáticos en base de datos.
3. **Expiración (`BALANCE_EXPIRED`)**: Si vencen los 7 días sin recibir el saldo restante, el despacho queda bloqueado, pero **el producto y la orden nunca se eliminan físicamente**.

---

## 23. Bloqueo Crítico de Despacho (Regla #34)

Para cualquier pedido:
- Si `balancePaymentStatus === "BALANCE_PENDING"` ➔ `DESPACHAR_TRANSPORTADORA` / `REGISTRAR_EN_TRANSITO` está **`DISABLED`** (Motivo: *"El pedido tiene un saldo pendiente por pagar de $..."*).
- Si `balancePaymentStatus === "BALANCE_EXPIRED"` ➔ `DESPACHAR_TRANSPORTADORA` está **`DISABLED`** (Motivo: *"El plazo para completar el saldo ha vencido."*).

---

## 24. Tienda Seleccionada y Confiabilidad (`SelectedStoreInfo`)

Para pedidos `CUSTOM_FROM_SCRATCH`, se almacena:
- `storeId` y `sellerId`.
- `storeNameSnapshot`.
- `reliabilitySnapshot`: Calificación (rating), pedidos completados, porcentaje de entregas a tiempo y métodos de producción soportados.

---

## 25. Requerimientos del Cliente y Assets (`CustomerRequirements`)

Los pedidos personalizados guardan la especificación técnica completa:
- `description` e `instructions`.
- `referenceImages`: Array de `CustomizationAsset` con URLs, tipos MIME y metadatos.
- `requestedDimensions` y `requestedPlacement`.
- `designSnapshot`: Snapshot inmutable del arte gráfico aprobado (DPI, técnica, zona).
