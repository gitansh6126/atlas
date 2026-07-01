# Folder Structure

This document maps the `src/` directory and explains the responsibilities of each folder.

---

## Top-Level Structure

```
atlas/
├── public/                     # Static assets (images, fonts, favicon)
├── src/
│   ├── core/                   # Atlas Core (framework-agnostic engine)
│   ├── modules/                # Atlas App UI (application pages & features)
│   ├── shared/                 # Shared utilities, UI primitives, hooks, types
│   ├── layouts/                # Layout components (shell, sidebar skeleton)
│   ├── App.tsx                 # Root React component
│   ├── main.tsx                # Vite entry point
│   ├── index.css               # Global Tailwind directives & CSS variables
│   └── vite-env.d.ts           # Vite type declarations
├── docs/
│   └── developer/              # This documentation set
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Folder Responsibilities

### `src/core/`

The engine. Zero React, zero DOM, zero UI dependencies.

```
core/
  editor.ts                     # Editor bootstrap and instance
  document-model.ts             # DocumentNode tree, immutable operations
  selection-manager.ts          # Cursor/selection state within the document
  block-registry.ts             # Block type registration
  command-registry.ts           # Command definitions and execution
  storage.ts                    # Abstract storage interface
  search.ts                     # Full-text and block-type search
```

### `src/modules/`

The application UI. Every module corresponds to a major feature or section of the app.

```
modules/
  workspace/
    Workspace.tsx
    hooks/
    components/
  pages/
    PagesList.tsx
    PageItem.tsx
  folders/
    FolderTree.tsx
  settings/
    SettingsPanel.tsx
  editor-surface/
    EditorSurface.tsx
```

### `src/shared/`

Reusable UI primitives and infrastructure.

```
shared/
  ui/                           # shadcn/ui wrappers and primitives
    button.tsx
    input.tsx
  hooks/
    useDebounce.ts
    useClickOutside.ts
  lib/
    utils.ts                    # cn() and other helpers
  types/
    index.ts                    # Shared type definitions
```

### `src/layouts/`

Page-level layout components.

```
layouts/
  SidebarLayout.tsx
  FullWidthLayout.tsx
```

---

## Import Conventions

- Use absolute path aliases defined in `tsconfig.json` and `vite.config.ts`:
  - `@atlas/core` → `src/core`
  - `@atlas/modules` → `src/modules`
  - `@atlas/shared` → `src/shared`
  - `@atlas/layouts` → `src/layouts`

```ts
// Good
import { createEditor } from "@atlas/core";
import { Button } from "@atlas/shared";

// Avoid
import { createEditor } from "../../../core";
```
