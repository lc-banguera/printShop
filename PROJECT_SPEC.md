# PrintShop — especificación de producto

## Visión

PrintShop es un SaaS de personalización bajo demanda: clientes compran y personalizan productos; las tiendas gestionan catálogo, producción, pedidos y finanzas; el Super Administrador modera y administra la plataforma.

## Roles

| Rol | Responsabilidad principal |
|---|---|
| Super Administrador | Gestiona plataforma, tiendas, suscripciones, plantillas, reportes, pagos, comisiones, marketing, soporte y logs; modera contenido de terceros. |
| Tienda | Vende, crea productos y diseños, gestiona catálogo, pedidos, clientes, finanzas y campañas. |
| Cliente | Personaliza, compra, guarda proyectos y puede monetizar diseños propios. |

Los administradores no editan contenido de terceros: lo visualizan, moderan, ocultan, suspenden, programan retiro o solicitan correcciones según la política de cada dominio.

## Capacidades

- Landing, autenticación, diseñador y catálogo para cliente.
- Administración de plataforma.
- Gestión de tienda: dashboard, productos, diseños, clientes, pedidos, envíos, finanzas, marketing y configuración.
- Marketplace, plantillas, suscripciones, pagos, comisiones, soporte, reportes y logs.

## Reglas de dominio

La especificación detallada de pedidos, estados, pagos parciales, envíos y rastreo vive exclusivamente en `docs/architecture/`. La configuración y prueba de Mercado Pago vive exclusivamente en `docs/payments/` y `docs/mercadopago-subscriptions.md`. Este documento no duplica esas reglas.
