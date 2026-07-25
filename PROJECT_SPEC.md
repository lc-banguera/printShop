# PrintShop - Project Specification

Version: 1.0
Status: In Development

---

# 1. Project Overview

PrintShop is a professional web application for designing and customizing printable products such as T-shirts, hoodies, mugs, caps, stickers, and more.

The application is inspired by professional online editors such as Canva, Adobe Express and Kittl, but it is NOT intended to be a clone of any of them.

The objective is to build a modern, scalable, maintainable and professional customization platform.

The project must be developed following clean architecture principles and reusable component design.

---

# 2. Main Goals

The application must allow users to:

• Customize products visually.

• Drag resources onto products.

• Resize, rotate and position objects.

• Manage layers.

• Undo and Redo changes.

• Save projects.

• Export final designs.

Future versions will also include:

• User accounts

• Orders

• Product catalog

• Payments

• Administration

• Cloud storage

---

# 3. Technology Stack

Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- React Konva
- Zustand

Backend

- Spring Boot

Database

- PostgreSQL

Authentication

- JWT

Future Storage

- Cloudinary
- AWS S3
- MinIO

---

# 4. Current Development Stage

Current stage focuses ONLY on building the Designer interface.

Backend implementation is intentionally postponed.

All current resources are local.

Future versions will replace local resources with APIs.

---

# 5. Application Modules

Current Module

Designer

Future Modules

Authentication

Dashboard

Orders

Products

Categories

Customers

Administration

Templates

Projects

Settings

Reports

---

# 6. Designer Architecture

Designer consists of independent modules.

Header

Left Sidebar

Canvas

Right Sidebar

Bottom Panel

Dialogs

Every module must be developed independently.

No task should modify multiple modules unless explicitly requested.

---

# 7. Canvas

The Canvas is the heart of the application.

It must support:

Images

SVG

Text

Shapes

Icons

Stickers

Templates

Mockups

---

# 8. Object Manipulation

Every object inserted into the canvas must support:

Move

Rotate

Resize

Scale

Duplicate

Delete

Lock

Unlock

Opacity

Layer Order

Visibility

Selection

Multiple Selection

Future versions may support grouping and smart guides.

---

# 9. Drag & Drop

The user must be able to drag resources from the left sidebar directly into the canvas.

When dropped:

A new independent object is created.

Objects remain editable.

Objects must never modify the base mockup.

---

# 10. Mockups

Products are represented by mockups.

Examples:

T-Shirt

Hoodie

Mug

Cap

Sticker

The mockup is only the visual base.

Designs are always rendered above it.

The original mockup must never be modified.

---

# 11. Design Resources

During development resources are stored locally.

Current path:

frontend/src/resources/designs/

Example:

img1.png

img2.png

img3.png

...

img28.png

Future implementation:

Resources will be loaded from the backend using REST APIs.

The frontend must be designed so the resource provider can be replaced without modifying the UI.

---

# 12. Resource Categories

Future categories include:

Sports

Streetwear

Anime

Gaming

Abstract

Typography

Logos

Vintage

Nature

Minimal

More categories may be added without changing the application architecture.

---

# 13. Future Resource Storage

Current

Local Images

↓

Future

Database

↓

Cloud Storage

↓

REST API

↓

Frontend

The application should be designed so this migration requires minimal frontend changes.

---

# 14. State Management

Global state must be handled using Zustand.

Local component state should only be used when appropriate.

Business logic must never be duplicated.

---

# 15. React Konva

All canvas interactions must be implemented using React Konva.

Avoid using the native Canvas API unless absolutely necessary.

---

# 16. UI Design

The official design reference is:

docs/design/reference/designer-full.png

This image is considered the official visual specification.

Any UI implementation must follow it as closely as possible.

The objective is visual consistency.

---

# 17. Development Philosophy

Build reusable components.

Avoid duplicated code.

Keep components small.

Prefer composition over inheritance.

Write readable code.

Favor scalability over shortcuts.

---

# 18. Performance

Avoid unnecessary re-renders.

Use lazy loading where appropriate.

Keep components independent.

Optimize rendering inside the canvas.

---

# 19. Future Backend

Future backend responsibilities:

Authentication

Projects

Orders

Products

Uploads

Cloud Storage

Users

Roles

Permissions

Templates

Design Resources

---

# 20. Final Objective

The final objective is to build a professional online customization platform comparable in quality, usability and architecture to modern commercial design applications.

Every implementation decision should prioritize maintainability, scalability and user experience.