# Reglas Oficiales de Negocio y Dominio de Pedidos (PrintShop Designer)

Este documento define la arquitectura y el modelo de negocio oficial de PrintShop para pedidos, personalización, planes de pago, anticipos, liquidación de saldos, selección de tiendas, producción en taller y logística física.

---

## 1. Concepto de Negocio: Más que una Tienda Tradicional

PrintShop es una plataforma SaaS colaborativa para la industria textil y de personalización por demanda. Los usuarios pueden operar tanto como **clientes** como **vendedores / talleres**.

### Tres Modalidades de Compra y Cumplimiento (`FulfillmentType`)

1. **`READY_TO_SHIP` (Producto listo para vender)**:
   - Prenda o artículo ya confeccionado, estampado y disponible en stock para despacho inmediato.
   - **Flujo**: Compra ➔ Pago 100% (`FULL_PAYMENT`) ➔ Preparar Envío ➔ Despachar ➔ Tracking ➔ Entrega.
   - **Reglas**: **Nunca ingresa al taller de producción** (`productionStatus: NOT_STARTED`). No admite pagos parciales ni plazo de 7 días.

2. **`CUSTOMIZE_EXISTING` (Producto existente personalizado)**:
   - El cliente elige una prenda base del catálogo oficial (ej: Hoodie Oversize Negro XL) y personaliza un diseño gráfico, texto o estampado disponible.
   - **Flujo**: Pedido creado ➔ Pago 100% anticipado (`FULL_PAYMENT`) ➔ Ingreso a Taller (`IN_PRODUCTION`) ➔ Aprobación QC (`READY`) ➔ Preparar Envío ➔ Despacho ➔ Entrega.
   - **Reglas**: Exige **pago completo del 100%** antes de iniciar estampación. No aplica período de 7 días de saldo.

3. **`CUSTOM_FROM_SCRATCH` (Personalización total desde cero)**:
   - El cliente define requerimientos específicos (archivos vectoriales, colores Pantone, técnicas mixtas, dimensiones milimétricas) y **selecciona una tienda o taller específico** capacitado para confeccionarlo.
   - **Flujo**: Cotización aceptada ➔ Pago de Anticipo pactado (`depositAmount`) ➔ Confección en Taller (`IN_PRODUCTION`) ➔ Producto Terminado (`READY`) ➔ **Inicio inmediato del período de 7 días** ➔ Recordatorios diarios ➔ Cliente liquida saldo pendiente ➔ Preparar Envío ➔ Despacho ➔ Entrega.
   - **Reglas**: Admite `DEPOSIT_PLUS_BALANCE`. El despacho físico está **estrictamente bloqueado** mientras exista saldo pendiente.

---

## 2. Modalidades de Pago y Plan Financiero (`PaymentPlan`)

El sistema cuenta con un modelo financiero formal desacoplado del estado del pedido:

```typescript
export type PaymentMode = "FULL_PAYMENT" | "DEPOSIT_PLUS_BALANCE";

export interface PaymentPlan {
  paymentMode: PaymentMode;
  depositPercentage: number; // Snapshot inmutable (ej: 60)
  totalAmount: number;
  depositAmount: number;
  amountPaid: number;
  balanceAmount: number;
  balanceDueAt?: string; // Timestamp cuando pasó a READY
  balanceDeadlineAt?: string; // balanceDueAt + 7 días
  balancePaymentStatus: BalancePaymentStatus;
}
```

### 2.1. Snapshot Inmutable del Porcentaje de Anticipo
- Cuando un pedido `CUSTOM_FROM_SCRATCH` es creado, el porcentaje de anticipo configurado por la tienda (ej: 60%) queda **congelado en el snapshot** de la orden.
- Si el vendedor cambia posteriormente su política al 70%, el pedido existente **conserva el 60% original**. Jamás se recalcula retroactivamente.

---

## 3. La Regla Central del Período de 7 Días

Aplica exclusivamente cuando:
- El pedido es `CUSTOM_FROM_SCRATCH`.
- La modalidad es `DEPOSIT_PLUS_BALANCE`.
- El anticipo fue pagado y las prendas fueron producidas.
- `productionStatus` transiciona a **`READY`**.
- Existe un saldo pendiente (`balanceAmount > 0`).

### ¿Cuándo comienza el plazo?
> **REGLA FUNDAMENTAL**: El período de 7 días **NO** comienza al crear el pedido, ni al pagar el anticipo, ni al iniciar la producción.
> **Comienza exactamente en el instante en que el producto queda terminado y aprobado (`READY`)**.

```
productionStatus: READY
        ↓
balanceDueAt = timestamp_actual (ISO)
balanceDeadlineAt = balanceDueAt + 7 días (ISO)
balancePaymentStatus = BALANCE_PENDING
        ↓
Despacho bloqueado hasta liquidación
```

---

## 4. Recordatorios Diarios y Notificaciones

Desde que el producto pasa a `READY` y existe saldo pendiente, el sistema emite recordatorios calculados dinámicamente:

```typescript
export function getBalanceDaysRemaining(order: StoreOrderFull, now: Date = new Date()): number {
  const deadlineStr = order.paymentPlan?.balanceDeadlineAt;
  if (!deadlineStr) return 0;
  const diffMs = new Date(deadlineStr).getTime() - now.getTime();
  return diffMs <= 0 ? 0 : Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
```

- **Día 7**: *"Tu producto está listo en taller. Tienes 7 días para liquidar el saldo restante."*
- **Día 6 al 2**: *"Te quedan X días para completar el pago de tu saldo."*
- **Día 1**: *"Último día: tu plazo para liquidar el saldo vence hoy."*
- **Vencimiento**: *"El plazo para liquidar el saldo ha vencido."*

---

## 5. Expiración del Saldo (`BALANCE_EXPIRED`)

Si el cliente no realiza el pago del saldo restante dentro de los 7 días estipulados:
1. `balancePaymentStatus` transiciona a **`BALANCE_EXPIRED`**.
2. **El producto NO se elimina físicamente**.
3. **El pedido NO se destruye ni se borra de la base de datos**.
4. **Los archivos y artes del cliente se conservan intactos**.
5. Se registra con precisión: fecha de inicio, fecha de vencimiento, monto pendiente acumulado, porcentaje de anticipo inicial y monto total.
6. El despacho físico permanece bloqueado hasta resolución administrativa.

---

## 6. Regla Crítica de Despacho (Regla #34)

Para cualquier tipo de pedido:
> Si el pedido presenta saldo pendiente (`BALANCE_PENDING`) o saldo vencido (`BALANCE_EXPIRED`), la acción **`DESPACHAR_TRANSPORTADORA` / `REGISTRAR_EN_TRANSITO` está categóricamente BLOQUEADA (`DISABLED`)**.

- **Motivo en UI**: *"El pedido tiene un saldo pendiente por pagar de $ {monto}. Despacho bloqueado."*
- **Condición para desbloqueo**: Una vez que el cliente liquida el saldo (`PAGAR_SALDO`), `balancePaymentStatus` pasa a `BALANCE_PAID`, `paymentStatus` a `PAID`, y el despacho queda legalmente habilitado.

---

## 7. Selección y Confiabilidad de Tiendas

Para pedidos `CUSTOM_FROM_SCRATCH`, el cliente selecciona el taller ejecutor. El modelo almacena:
- `selectedStore.storeId`
- `selectedStore.sellerId`
- `selectedStore.storeNameSnapshot`
- `selectedStore.reliabilitySnapshot`:
  - Calificación promedio (ej: 4.9 estrellas)
  - Pedidos completados con éxito
  - Porcentaje de entregas a tiempo (ej: 99%)
  - Años operando
  - Especialidades y técnicas textiles soportadas

---

## 8. Arquitectura de Artículos y Requerimientos del Cliente

Los artículos del pedido no son simples cadenas de texto. Conservan un snapshot técnico estructurado:

```typescript
export interface OrderItemSnapshot {
  productId: string;
  productNameSnapshot: string;
  variantSnapshot: { color: string; size: string; fabric: string; sku?: string };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  fulfillmentType: FulfillmentType;
  designSnapshot?: DesignSnapshot;
  customization?: CustomizationSpec;
  customerRequirements?: CustomerRequirements;
  uploadedAssets?: CustomizationAsset[];
}
```

- **`CustomerRequirements`**: Almacena descripción detallada, instrucciones de centrado/estampado, imágenes de referencia cargadas por el cliente, archivos vectoriales adjuntos y dimensiones solicitadas en milímetros.

---

## 9. Múltiples Envíos y Trazabilidad Inmutable

- Un pedido puede contener `N` despachos físicos (`shipments: Shipment[]`).
- Cada `Shipment` es la **fuente de verdad única** de su estado de entrega (`shippingStatus`).
- Cada `Shipment` tiene su propio arreglo aislado de `trackingEvents`. Los eventos de dos paquetes distintos **jamás se mezclan**.
- El estado `Order.shippingStatus` es puramente **derivado** mediante `getAggregatedShippingStatus(order)`.
