# Mercado Pago para PrintShop (sandbox)

Este proyecto no tenía backend definitivo configurado para pagos, por lo que se preparó una API local mínima en `server/` para crear preferencias de checkout y dejar el webhook listo para validación real.

## 1. Variables de entorno

### Backend

Copia `server/.env.example` a `server/.env` y completa los valores:

```bash
PORT=3001
CLIENT_URL=http://localhost:5173
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
```

`MERCADOPAGO_ACCESS_TOKEN` debe mantenerse únicamente en backend. No se usa en frontend ni se expone en Vite.

### Frontend

Copia `frontend/.env.example` a `frontend/.env` si vas a ejecutar el proyecto localmente:

```bash
VITE_API_BASE_URL=http://localhost:3001
```

## 2. Arrancar backend

```bash
cd server
npm install
npm run dev
```

## 3. Arrancar frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## 4. Probar `/plans`

1. Registra un usuario o inicia sesión con la simulación actual.
2. Navega a `http://localhost:5173/plans`.
3. Selecciona un plan.
4. El frontend llama a `POST /api/subscriptions/checkout` en el backend.

## 5. Estados esperados

- Antes del pago: `plan seleccionado`, `paymentStatus = PENDING`, `subscriptionStatus = PENDING`
- Si la variable `MERCADOPAGO_ACCESS_TOKEN` está vacía: el backend responde `503` con un mensaje claro y no intenta crear la preferencia
- Si la credencial real está configurada: el backend crea la preferencia de Mercado Pago y devuelve una URL de checkout

## 6. Webhook

El servidor expone:

```bash
POST /api/webhooks/mercadopago
```

Este endpoint deja preparada la validación del evento de Mercado Pago y la idempotencia por `eventId` para evitar duplicados.

## 7. Seguridad

- El Access Token de Mercado Pago queda en backend
- El frontend solo envía `planId` y datos mínimos del usuario
- El backend es la fuente confiable para el precio y la creación del checkout
- No se imprime ni se expone la credencial en consola o en bundle de React

## 8. Prueba real con sandbox

Cuando tengas la credencial de prueba de Mercado Pago:

1. Completa `server/.env`
2. Arranca el backend
3. Ejecuta `/plans`
4. Elige un plan
5. Se abrirá la pantalla de checkout de Mercado Pago en modo prueba
6. Confirma el pago de prueba
7. El webhook preparado recibirá el evento y la subscripción puede pasar a `ACTIVE` desde el backend

No se incluye ninguna credencial real en este repositorio.