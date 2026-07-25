# DEVELOPMENT_RULES.md

# PrintShop Development Rules

Version: 1.0

---

# 1. General Rules

These rules are mandatory.

Unless explicitly instructed otherwise, they must always be followed.

---

# 2. Architecture

Never change the project architecture.

Never reorganize the folder structure.

Never rename folders.

Never replace technologies already selected for the project.

Respect the current feature-based architecture.

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

---

# 4. Module Development

Only one module may be modified per task.

Development order:

1. Header
2. Left Sidebar
3. Canvas
4. Right Sidebar
5. Bottom Panel
6. Dialogs
7. Final Refinement

Never redesign multiple modules simultaneously.

---

# 5. Design Rules

The official UI reference is:

docs/design/reference/designer-full.png

This image has higher priority than personal assumptions.

Do not redesign.

Do not simplify.

Do not modernize.

Implement the interface as accurately as possible.

---

# 6. Components

Prefer reusable components.

Avoid duplicated components.

Avoid creating components that are used only once unless necessary.

Keep components focused on a single responsibility.

---

# 7. File Organization

Respect existing folders.

New files must follow the current project organization.

Do not create unnecessary directories.

---

# 8. React

Use functional components.

Prefer hooks.

Avoid class components.

Keep JSX readable.

---

# 9. TypeScript

Avoid using "any".

Prefer interfaces.

Prefer explicit typing.

Keep types reusable.

---

# 10. Zustand

Global state belongs in Zustand.

Avoid storing business state inside React components.

Avoid duplicated state.

---

# 11. React Konva

All canvas interaction must use React Konva.

Do not replace Konva with another rendering solution.

---

# 12. Canvas Objects

Every object must eventually support:

Move

Rotate

Resize

Scale

Delete

Duplicate

Opacity

Visibility

Lock

Unlock

Layer order

Selection

Multiple selection

Future compatibility for grouping must be preserved.

---

# 13. Drag & Drop

Resources originate from the left sidebar.

Dragging creates a new independent canvas object.

Objects remain editable.

Mockups are never modified.

---

# 14. Resource Management

Current implementation uses local files.

Location:

frontend/src/resources/designs/

The application must be prepared for future REST APIs.

UI components should not depend directly on local files.

Prefer services for loading resources.

---

# 15. Mockups

Mockups represent products.

Examples:

T-shirts

Hoodies

Caps

Mugs

Stickers

Mockups remain immutable.

Designs are rendered above them.

---

# 16. Performance

Avoid unnecessary renders.

Memoize expensive calculations.

Optimize Konva rendering.

Reuse objects whenever possible.

---

# 17. Code Quality

Readable code.

Reusable code.

Simple code.

Consistent formatting.

Clear naming.

No duplicated logic.

---

# 18. Existing Code

Never remove working functionality.

Never rewrite modules without justification.

Prefer extending existing code over replacing it.

---

# 19. Before Starting Any Task

Understand the current implementation.

Inspect related files.

Understand dependencies.

Understand state flow.

Understand component hierarchy.

---

# 20. Before Completing Any Task

Verify:

✓ Architecture preserved

✓ No unrelated files modified

✓ No duplicated code

✓ Imports cleaned

✓ TypeScript without errors

✓ Existing functionality preserved

✓ Visual result matches reference image

---

# 21. Commit Philosophy

Every task should produce a small, focused change.

Avoid mixing unrelated features.

Each implementation should be independently testable.

---

# 22. Future Compatibility

The project will eventually integrate:

REST APIs

Authentication

Cloud Storage

Project persistence

User accounts

Product catalog

Order management

Payment processing

Current decisions must not prevent future implementation.

---

# 23. Communication

When implementing a task:

Explain what files were modified.

Explain why they were modified.

Explain how the implementation works.

Mention any assumptions made.

---

# 24. Priority Order

Always prioritize:

1. Correct architecture

2. Visual fidelity

3. Reusability

4. Scalability

5. Performance

6. Code cleanliness

---

# 25. Project Vision

PrintShop is intended to become a professional product customization platform.

Every implementation must contribute toward that long-term vision.

Temporary solutions are acceptable only when they preserve future scalability.