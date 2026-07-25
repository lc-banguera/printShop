# CLAUDE.md

# Claude Development Instructions

This document defines how Claude must work while contributing to PrintShop.

These instructions have priority over assumptions.

Always read this document before implementing any feature.

---

# 1. Primary Objective

Your responsibility is to help build a professional online product customization platform.

You are NOT redesigning the application.

You are implementing an existing design.

---

# 2. Official Design Reference

The official UI specification is located at:

docs/design/reference/designer-full.png

Treat this image as the source of truth.

Do not invent layouts.

Do not redesign components.

Do not simplify the interface.

If something is unclear, preserve the existing architecture instead of guessing.

---

# 3. Development Strategy

Development is performed module by module.

Current order:

1. Header
2. Left Sidebar
3. Canvas
4. Right Sidebar
5. Bottom Panel
6. Dialogs
7. Final Refinement

Never modify multiple modules unless explicitly requested.

---

# 4. Preserve Architecture

Never reorganize folders.

Never rename directories.

Never replace the project architecture.

Never introduce a different framework.

Respect the existing feature-based architecture.

---

# 5. Existing Technologies

Frontend

React

TypeScript

Vite

TailwindCSS

React Konva

Zustand

Backend

Spring Boot

Database

PostgreSQL

---

# 6. Code Style

Prefer reusable components.

Keep components small.

Avoid duplicated code.

Prefer composition.

Write readable TypeScript.

Avoid unnecessary abstractions.

---

# 7. Component Rules

Do not rename components without permission.

Do not remove existing components.

Do not move components to another module.

Create reusable UI when appropriate.

---

# 8. State Management

Global state belongs to Zustand.

Local state only when necessary.

Never duplicate business state.

---

# 9. Canvas Rules

Canvas interactions must use React Konva.

Do not replace React Konva.

Do not implement a different rendering engine.

---

# 10. Drag and Drop

Resources from the left sidebar must be draggable.

Dragging a resource into the canvas creates a new object.

The inserted object must remain editable.

Never modify the base mockup.

---

# 11. Design Resources

Current resources are local.

Location:

frontend/src/resources/designs/

Current files:

img1.png

img2.png

...

img28.png

Never hardcode individual image imports inside UI components.

Always prepare the code so resources can later come from an API.

---

# 12. Mockups

Mockups represent products.

They are not editable.

Designs are rendered above them.

Never flatten designs into the mockup.

---

# 13. Future Compatibility

Current implementation is temporary.

Future versions will replace local resources with:

REST API

↓

Database

↓

Cloud Storage

The architecture must allow this migration with minimal changes.

---

# 14. Performance

Avoid unnecessary renders.

Avoid expensive computations.

Prefer memoization when appropriate.

Optimize canvas rendering.

---

# 15. Before Writing Code

Always understand the current module.

Inspect related components.

Reuse existing code.

Avoid introducing duplicate functionality.

---

# 16. Before Finishing

Verify:

Architecture preserved.

No unrelated files modified.

No duplicated logic.

Imports cleaned.

Formatting consistent.

Visual result matches the reference image.

---

# 17. Working Method

When assigned a task:

1. Analyze the current implementation.
2. Analyze the reference image.
3. Identify visual differences.
4. Plan the changes.
5. Modify only the required files.
6. Preserve existing functionality.
7. Explain what changed.

---

# 18. When Information Is Missing

Never invent architecture.

Never guess application behavior.

Ask for clarification only when absolutely necessary.

Prefer preserving existing code over making assumptions.

---

# 19. Future Features

The application will eventually support:

Authentication

Orders

Products

Projects

Templates

Uploads

Cloud Storage

Payments

Administration

Do not implement these features unless explicitly requested.

---

# 20. Final Goal

Every contribution should move PrintShop closer to a professional editor comparable in quality to commercial online design platforms.

The priorities are:

Visual fidelity

Maintainability

Scalability

Code quality

Reusable architecture