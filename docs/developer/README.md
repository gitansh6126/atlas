# Atlas Developer Documentation

Welcome to the **Atlas Developer Documentation** — the single source of truth for understanding, extending, and contributing to the Atlas block-based editor/engine.

Atlas is a modern, extensible block editor built with React, TypeScript, Vite, Tailwind CSS, and Zustand. It is architected as two primary layers: a framework-agnostic **Core** and a rich **App UI** built on top.

---

## Table of Contents

1. [Architecture Overview](architecture.md)
2. [Folder Structure](folder-structure.md)
3. [Technology Stack](tech-stack.md)
4. [Core Editor](editor.md)
5. [Block System](block-system.md)
6. [Rendering Pipeline](rendering.md)
7. [State Management](state-management.md)
8. [Command System](commands.md)
9. [Keyboard Shortcuts](keyboard-shortcuts.md)
10. [Slash Command Menu](slash-menu.md)
11. [Toolbar System](toolbar.md)
12. [Inspector Panel](inspector.md)
13. [Theme System](theme-system.md)
14. [Storage Layer](storage.md)
15. [Performance](performance.md)
16. [Extension Guide](extension-guide.md)
17. [Coding Standards](coding-standards.md)
18. [API Reference](api-reference.md)
19. [Troubleshooting](troubleshooting.md)
20. [Roadmap](roadmap.md)

---

## Quick Navigation

- **New to Atlas?** Start with the [Architecture](architecture.md) and [Editor](editor.md) docs.
- **Want to build a custom block?** Jump to the [Extension Guide](extension-guide.md).
- **Debugging an issue?** Check the [Troubleshooting](troubleshooting.md) guide.
- **Looking for API types?** See the [API Reference](api-reference.md).

---

## Foundational Overview

Atlas is composed of three major pillars:

1. **Atlas Core** (`src/core/`) — The document model, commands, storage, and other stateless logic. Pure TypeScript, zero React dependencies.
2. **Atlas App UI** (`src/modules/`) — The application shell, including the workspace, pages, folders, settings, and sidebar.
3. **Shared Infrastructure** (`src/shared/` and `src/layouts/`) — Reusable UI primitives, hooks, utilities, and layout components.

This separation ensures that the engine can be tested, ported, or even embedded independently of the UI layer.

---

## Getting Started

1. Ensure you have read the [Tech Stack](tech-stack.md) to understand our dependencies and why they were chosen.
2. Review the [Folder Structure](folder-structure.md) to orient yourself.
3. Explore the [Core Editor](editor.md) and [Block System](block-system.md) for the heart of the engine.
4. Follow the [Coding Standards](coding-standards.md) when contributing.

---

## Support

For questions not covered in these docs, please check the [Troubleshooting](troubleshooting.md) guide and the [Roadmap](roadmap.md) for known limitations and future plans.