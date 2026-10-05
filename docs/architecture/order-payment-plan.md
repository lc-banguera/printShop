# Especificación de Planes de Pago (Order Payment Plan) - PrintShop Designer

Este documento detalla la arquitectura de modelado financiero para órdenes en PrintShop Designer, distinguiendo entre prepago total y el esquema de anticipo más saldo de 7 días.

---

## 1. Comparativa de Modalidades (`PaymentMode`)

| Característica | `FULL_PAYMENT` (Prepago 100%) | `DEPOSIT_PLUS_BALANCE` (Anticipo + Saldo) |
|---|---|---|
| **Modalidad de cumplimiento** | `READY_TO_SHIP` y `CUSTOMIZE_EXISTING` | `CUSTOM_FROM_SCRATCH` (Personalizado desde cero) |
| **Exigencia previa a confección** | 100% del valor total | Porcentaje de anticipo pactado (ej: 60%) |
| **Porcentaje de anticipo** | Siempre 100% | Configurable por la tienda (ej: 50%, 60%, 70%) |
| **Saldo restante** | $0 | Diferencia entre total y anticipo |
| **Período de 7 días** | No aplica | Se activa en el instante exacto en que pasa a `READY` |
| **Habilitación de despacho** | Automático al terminar QC | Requiere liquidación previa del saldo restante |

---

## 2. Invariantes Matemáticas del Plan de Pagos

Para cualquier orden con `PaymentPlan`:

1. `depositAmount = Math.round((totalAmount * depositPercentage) / 100)`
2. `balanceAmount = totalAmount - amountPaid` (cuando no ha sido liquidado)
3. Cuando `amountPaid == totalAmount`:
   - `balanceAmount = 0`
   - `balancePaymentStatus = "BALANCE_PAID"`
   - `paymentStatus = "PAID"`
4. **Inmutabilidad del Snapshot**:
   El campo `depositPercentage` es un **snapshot congelado** al momento de crear la orden. Si el vendedor modifica la configuración de su tienda posteriormente de 60% a 70%, los pedidos antiguos **mantienen intacto el 60% original**.

---

## 3. Ejemplo Numérico Paso a Paso

Consideremos un pedido `CUSTOM_FROM_SCRATCH` de un Hoodie Personalizado con las siguientes condiciones:
- **Total de la Orden**: `$ 200.000 COP`
- **Porcentaje de Anticipo del Vendedor**: `60%`

### Paso 1: Creación del Pedido
- `paymentMode = "DEPOSIT_PLUS_BALANCE"`
- `depositPercentage = 60`
- `totalAmount = $ 200.000`
- `depositAmount = $ 120.000`
- `amountPaid = $ 0`
- `balanceAmount = $ 80.000`
- `paymentStatus = "PENDING"`
- `balancePaymentStatus = "BALANCE_PENDING"`
- `productionStatus = "NOT_STARTED"`
- **Acción operativa**: `INICIAR_PRODUCCION` se encuentra `DISABLED` con razón: *"Requiere pago del anticipo de $ 120.000 (60%)"*.

### Paso 2: Pago del Anticipo
- El cliente transfiere `$ 120.000 COP`.
- Se ejecuta la acción `PAGAR_ANTICIPO`.
- `amountPaid = $ 120.000`
- `paymentStatus = "PARTIAL"`
- `productionStatus = "NOT_STARTED"`
- **Acción operativa**: `INICIAR_PRODUCCION` pasa a `AVAILABLE`.

### Paso 3: Confección e Impresión en Taller
- El taller inicia estampación: `INICIAR_PRODUCCION` ➔ `productionStatus = "IN_PRODUCTION"`.
- Se realizan los bordados y curado térmico de las tintas.

### Paso 4: Finalización de Prenda y Activación de los 7 Días
- Control de calidad aprueba la prenda: acción `MARCAR_LISTO`.
- `productionStatus = "READY"`
- **Disparador automático**:
  - `balanceDueAt = "2026-09-04T10:00:00.000Z"` (Timestamp de la transición)
  - `balanceDeadlineAt = "2026-09-11T10:00:00.000Z"` (Exactamente 7 días calendario después)
  - `balancePaymentStatus = "BALANCE_PENDING"`
  - Se genera en timeline: `BALANCE_PAYMENT_STARTED`.
  - Se programa notificación al cliente por Email y WhatsApp.
- **Acción operativa**: `DESPACHAR_TRANSPORTADORA` está **BLOQUEADA (`DISABLED`)** con razón: *"El pedido tiene un saldo pendiente por pagar de $ 80.000. Despacho bloqueado."*

### Paso 5A: Liquidación Exitosa del Saldo
- El cliente realiza el pago del saldo restante de `$ 80.000` en el día 3.
- Se ejecuta la acción `PAGAR_SALDO`.
- `amountPaid = $ 200.000`
- `balanceAmount = $ 0`
- `paymentStatus = "PAID"`
- `balancePaymentStatus = "BALANCE_PAID"`
- Se genera en timeline: `BALANCE_PAYMENT_COMPLETED`.
- **Desbloqueo**: `DESPACHAR_TRANSPORTADORA` pasa a `AVAILABLE` (sujeto a guía de envío generada).

### Paso 5B: Vencimiento del Plazo (Escenario Alternativo)
- Transcurren los 7 días sin recibir el saldo.
- La función de dominio `isBalancePaymentExpired(order)` retorna `true`.
- `balancePaymentStatus = "BALANCE_EXPIRED"`.
- Se genera en timeline: `BALANCE_PAYMENT_EXPIRED`.
- **El pedido NO se elimina, la prenda NO se destruye**. Queda registrado el historial completo para gestión de soporte según las políticas de almacenamiento del taller.
