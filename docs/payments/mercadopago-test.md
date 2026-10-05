# Pruebas de Mercado Pago

## Configuración local

El backend carga exclusivamente `server/.env` al arrancar. `server/.env.example` es una plantilla: no se carga y no debe contener credenciales reales. Copia los nombres de variables de la plantilla a un archivo local `server/.env`, que está ignorado por Git.

```dotenv
PORT=3001
FRONTEND_URL=http://localhost:5173
BACKEND_PUBLIC_URL=https://TU-URL-PUBLICA-HTTPS
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
MERCADOPAGO_PUBLIC_KEY=
NODE_ENV=development
```

`MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_WEBHOOK_SECRET` son privados: solo pertenecen a `server/.env`. Nunca se usan en Vite, React, el navegador, logs ni Git. `MERCADOPAGO_PUBLIC_KEY` puede ser pública, aunque Checkout Pro de esta implementación no la necesita en el frontend.

`BACKEND_PUBLIC_URL` debe ser la URL HTTPS pública del backend (por ejemplo, un túnel HTTPS durante desarrollo), porque Mercado Pago debe alcanzar `POST /api/webhooks/mercadopago`. La URL de frontend debe ser una URL de retorno válida y accesible por el navegador. Reinicia el backend después de modificar `server/.env`.

## Ejecución y diagnóstico

En una terminal inicia el backend desde `server` con `npm run dev`; inicia el frontend desde `frontend` con `npm run dev`. Consulta `GET http://localhost:3001/api/health`: muestra solo estados seguros (`configured`, `missing` o `invalid`), nunca secretos.

El checkout es `POST /api/payments/checkout` con `planId`, `billingPeriod`, `userId` y `userEmail`. El precio se resuelve en el backend. Una respuesta correcta contiene `checkoutUrl`, la URL oficial de Mercado Pago. En desarrollo, la consola del navegador registra el estado HTTP y el error seguro que devuelva el backend bajo el prefijo `[MERCADO_PAGO]`.

## Flujos de prueba

- **Gratis:** en `/plans`, pulsa **Comenzar** en Gratis. Va directamente a `/onboarding`; no hay petición de pago ni Mercado Pago. El título debe ser “Empieza a configurar tu tienda”.
- **Básico y Profesional:** selecciona la periodicidad y pulsa **Comenzar**. La aplicación crea la preferencia en el backend y redirige a `checkoutUrl`. Inicia sesión con un comprador de prueba de Mercado Pago y usa una tarjeta de prueba indicada por Mercado Pago para tu país y cuenta de prueba.
- **Enterprise:** conserva la modalidad a medida. No crea checkout sin `ENTERPRISE_MONTHLY_PRICE` configurado exclusivamente en el backend.

No se debe considerar pagado un retorno del navegador. El retorno incluye `external_reference`; `PaymentStatusPage` consulta `GET /api/subscriptions/status` y solo muestra “Continuar a la configuración” cuando el webhook haya actualizado la suscripción a `ACTIVE`.

## Webhook y confirmación

Configura en Mercado Pago la URL pública `https://TU-URL-PUBLICA-HTTPS/api/webhooks/mercadopago` para eventos de pagos y coloca la firma secreta en `MERCADOPAGO_WEBHOOK_SECRET`. El backend valida `x-signature` con el SDK oficial, consulta el pago con el Access Token, correlaciona `external_reference` y actualiza los estados en forma idempotente. Eventos repetidos no crean otra suscripción.

Estados: pago `PENDING`, `CONFIRMED`, `FAILED` o `CANCELLED`; suscripción `PENDING`, `ACTIVE`, `REJECTED` o `CANCELLED`. Un pago pendiente o rechazado nunca permite onboarding pagado.

Si el checkout falla, revisa primero `/api/health`, después el estado HTTP del `POST /api/payments/checkout`, la URL pública HTTPS del webhook y que el backend se haya reiniciado. No copies secretos a la consola ni a un issue.
