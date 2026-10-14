# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

PrintShop serves three product roles: Super Administrador, Tienda, and Cliente. Customers personalize products, purchase them, save projects, and may monetize their own designs. Stores manage products, production, orders, customers, and finances. The Super Administrador manages and moderates the platform.

## Product Purpose

PrintShop is a SaaS platform for product personalization, online stores, design resources, orders, and subscriptions.

## Positioning

No distinct competitive positioning is established in the available product documentation.

## Capabilities and Constraints

- Customer-facing capabilities include a catalog, product personalization, a designer, and saved designs.
- Store capabilities include catalog, production, orders, customers, finances, and marketing.
- Preserve the three existing roles and their separate module contexts.
- The frontend uses React, TypeScript, Vite, Tailwind CSS, and Zustand. The shared designer uses React Konva.
- Visual changes must preserve existing product content, business rules, permissions, APIs, and architecture.

## Evidence on Hand

- `PROJECT_SPEC.md` documents product purpose, roles, and capabilities.
- The repository contains the current application implementation and its shared visual system.
- No verified customer testimonials, usage metrics, or competitive claims are established in the available documentation.

## Product Principles

- Preserve the distinct responsibilities and navigation contexts of the three roles.
- Keep Customer and Store capabilities in their existing modules.
- Evolve presentation without changing product behavior or business rules.
