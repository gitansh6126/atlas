# Atlas — AI Agent Engineering Guide

> **Purpose:** This document defines the engineering rules, philosophy, and long-term vision of Atlas. Every AI coding agent MUST read this document before making any code changes. It is the permanent architectural reference for every session.

---

## 1. What is Atlas?

**Atlas is NOT a note-taking application.**

Atlas is a **reusable Knowledge Workspace Engine**.

Its purpose is to become the common knowledge platform powering multiple independent applications.

Examples include:

- Personal Knowledge Base
- IIT Madras Learning Portal (MLT)
- MAD2 Portal
- Rainbowz Internal Software
- RS Machinery Documentation
- Business SOP System
- Research Workspace
- Future SaaS products

Atlas is the foundation that every future project will share.

---

## 2. Long-Term Vision

Instead of every project building its own editor, storage, search system, media management, and AI integration, Atlas provides these capabilities **once**.

Every project should reuse Atlas.

```
Personal Project
MLT Portal
MAD2 Portal
Rainbowz
RS Machinery
Research
        │
        ▼
    Atlas Core
```

Every project should depend on Atlas instead of implementing these features independently.

---

## 3. Atlas Architecture

Atlas consists of two major parts.

### 3.1 Atlas Core

Atlas Core is the reusable engine.

It contains **no project-specific logic**. It must be reusable inside any React project.

Atlas Core is responsible for:

- Editor Engine
- Storage Layer (interface + adapters)
- Command System
- Search Engine
- Undo / Redo
- Version History
- Plugin System
- Parser (Markdown, HTML, plain text)
- Serializer (to Markdown, HTML, JSON)
- Export Engine (PDF, HTML, Markdown)
- Theme System
- Synchronization Engine

**Atlas Core must never know anything about MLT, Rainbowz, RS Machinery, or any other application.**

All modules in `core/` are pure TypeScript with zero React or DOM dependencies. They are the framework-agnostic heart of the system. React is an implementation detail of the UI layer.

### 3.2 Atlas App

Atlas App is the actual application users interact with.

Responsibilities include:

- Sidebar
- Workspace UI
- Folder Tree
- Page Tree
- Navigation
- Settings
- Theme Selection
- User Interface
- Project Configuration

**Atlas App consumes Atlas Core. Atlas App must contain no editor logic.**

### Layer Architecture (Strict Dependency Direction)

```
┌─────────────────────────────────────────────────┐
│  modules/        — Atlas App (Feature UI)        │
│  (workspace, pages, folders, settings, ai,       │
│   media)                                         │
│  DEPENDS ON: shared, core                       │
├─────────────────────────────────────────────────┤
│  plugins/        — Content type plugins          │
│  (paragraph, heading, code, image, table,        │
│   video, math, mermaid, quote, callout,          │
│   checklist, html)                               │
│  DEPENDS ON: shared                             │
├─────────────────────────────────────────────────┤
│  shared/         — Shared utilities & types      │
│  (components/ui, components/common, hooks,       │
│   utils, types, constants, icons)                │
│  DEPENDS ON: nothing project-internal            │
├─────────────────────────────────────────────────┤
│  core/           — Atlas Core (Framework-agnostic│
│  (commands, editor, parser, serializer,          │
│   storage, sync, search, history, export,        │
│   theme)                                         │
│  DEPENDS ON: nothing project-internal            │
└─────────────────────────────────────────────────┘
```

### Layer Rules (Non-Negotiable)

| Layer | May Import From | Must Never Import |
|-------|----------------|-------------------|
| `core/` | stdlib, external libs | Anything in `src/` (UI, React, modules, plugins, shared) |
| `shared/` | stdlib, external libs, `core/` | `modules/`, `plugins/` |
| `plugins/` | `shared/`, `core/` | `modules/` |
| `modules/` | `shared/`, `core/` | `plugins/` (directly), other `modules/` |

---

## 4. Core Principle

**Business logic must never depend on UI.**

UI depends on Core. Core never depends on UI.

Storage never depends on Editor. Editor never depends on Storage.

Commands never depend on React components.

Everything should communicate through interfaces.

---

## 5. Modular Design

Atlas must be modular. Every feature must be independently replaceable.

```
Good example:

Atlas Core
    Storage
        Local
        IndexedDB
        Supabase
        GitHub
```

Changing storage must never require changing the editor.

---

## 6. Plugin Philosophy

**Everything inside the editor must eventually become a plugin.**

Paragraph, Heading, Checklist, Quote, Code, Math, Mermaid, Image, Video, HTML, Callout, Table, PDF, Flashcards, Quiz, Mind Map, Timeline, Diagram — and more.

Plugins register themselves. The editor must never hardcode supported block types.

Each plugin is self-contained in `src/plugins/<name>/` and handles its own rendering, serialization, parsing, and editing.

---

## 7. Storage Philosophy

**Never directly call `localStorage`, `IndexedDB`, or `Supabase` inside UI components.**

Always use a Storage Provider interface.

```
Editor
    ↓
Storage Interface
    ↓
Local Provider  |  IndexedDB Provider  |  Supabase Provider  |  GitHub Provider
```

Modules call `StorageProvider` methods, never storage APIs directly.

---

## 8. Future Merge Strategy

Atlas is being developed independently. Later it will be merged into existing software.

**MLT Portal (Current → Future)**

```
Current:                  Future:
MLT                       MLT
│                         │
└── Custom Notes          └── Atlas Workspace
                               ├── Atlas Editor
                               ├── Atlas Search
                               └── Atlas Storage
```

**MAD2 Portal** — Same architecture.
**Rainbowz** — Same architecture.
**RS Machinery** — Same architecture.

This avoids maintaining four different editors. Instead, every application shares Atlas.

---

## 9. Offline First

Atlas must always function without internet.

Cloud synchronization is an enhancement — never a requirement.

Every feature must work without a network connection.

---

## 10. AI Philosophy

AI is an optional layer. Atlas must function perfectly without AI.

Future AI capabilities:

- Summarization
- Flashcards
- Quiz generation
- Mind Maps
- Revision Notes
- Explanation
- Translation
- Diagram Generation
- Knowledge Graph

**AI must never become a dependency of Atlas.**

---

## 11. Coding Standards & Conventions

### File Naming
- **Files:** kebab-case (`workspace-switcher.tsx`, `theme-store.ts`, `search-bar.tsx`)
- **React components:** PascalCase file name only for entry points; otherwise kebab-case
- **Test files:** `*.test.ts` or `*.test.tsx` co-located with source
- **Store files:** `<module>-store.ts`

### Naming Conventions
| Entity | Style | Example |
|--------|-------|---------|
| Components | PascalCase | `WorkspaceSwitcher`, `CommandPalette` |
| Functions | camelCase | `toggleTheme`, `setSelectedPage` |
| Interfaces/Types | PascalCase | `Workspace`, `ButtonProps` |
| Zustand stores | `useXxxStore` | `useThemeStore`, `useWorkspaceStore` |
| CSS classes | Tailwind utility classes only | No custom CSS class names |
| Environment variables | `VITE_*` | `VITE_API_URL` |

### TypeScript Style
- `verbatimModuleSyntax`: always use `import type` for type-only imports
- `erasableSyntaxOnly`: use `interface` over `type` where possible
- Strict unused locals/parameters checks enabled
- Path alias `@/` maps to `./src/`
- Target: ES2023
- Explicit return types on all public functions and exported components
- **No `any` types.** Use `unknown` with proper narrowing, or define explicit interfaces.

### Code Formatting (Prettier — enforced)
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100
}
```

### Linting (Oxlint — enforced)
```json
{
  "react/rules-of-hooks": "error",
  "react/only-export-components": ["warn", { "allowConstantExport": true }]
}
```

### React Component Patterns (Mandatory)
1. **Forward refs** on all UI primitives via `React.forwardRef`
2. **displayName** set on all forward-ref components
3. **Props interface** defined locally in each file, extending HTML attributes where appropriate
4. **className prop** accepted and merged via `cn()` utility
5. **Named exports** only — no `export default`
6. **Functional components** only — no class components
7. **Hooks** at top level, never inside conditionals or loops (enforced by oxlint)
8. **Never create large components.** Prefer composition and small functions.
9. **Never duplicate logic.** Reuse through shared components and utilities.

### Import Order Convention
```typescript
// 1. External libraries
import * as React from 'react'
import { create } from 'zustand'
import { Search } from 'lucide-react'

// 2. Internal project imports via @/ alias
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/ui/button'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'

// 3. Type-only imports
import type { Workspace } from '@/shared/types'
```

### CSS Convention
- **No custom CSS classes.** All styling uses Tailwind utility classes directly in JSX.
- **No inline styles.** Exception: dynamic animations.
- **Theme colors** are defined as HSL CSS custom properties in `globals.css` and referenced via Tailwind's `hsl(var(--color-name))`.
- **Dark mode** is toggled by the `.dark` class on `<html>`, managed by `useThemeStore`.

### State Management
- **Zustand** with `persist` middleware for all global state.
- Each domain owns its own store file co-located with its module.
- Storage keys use the `atlas-` prefix.
- Store actions must be synchronous unless performing I/O. Async logic goes in hooks or service layers.
- All persisted stores MUST use the `persist` middleware with `name: 'atlas-<feature>'`.

### Data Model (Types in `src/shared/types/index.ts`)
```
Workspace { id, name, icon, createdAt }
Folder    { id, name, workspaceId, parentId, children[], createdAt }
Page      { id, title, workspaceId, folderId, isFavorite, lastOpened, createdAt, updatedAt }
Theme     'light' | 'dark'
```

---

## 12. Performance

Atlas must remain responsive even with:

- 100 Workspaces
- 10,000 Pages
- 100,000 Blocks
- Thousands of Images

Performance is a primary goal, not an afterthought.

---

## 13. Directory Layout

```
src/
├── core/               # Atlas Core — reusable engine (no React, no project logic)
│   ├── commands/         Command pattern registry
│   ├── editor/           Document model & editing engine
│   ├── export/           Export pipeline (PDF, HTML, Markdown)
│   ├── history/          Undo/redo stack
│   ├── parser/           Markdown/HTML/plain text parsing
│   ├── search/           Full-text search engine
│   ├── serializer/       Document serialization
│   ├── storage/          Storage abstraction + adapters
│   ├── sync/             Offline-first sync engine
│   └── theme/            Theme management
├── modules/             # Atlas App — feature UI modules
│   ├── ai/               AI features
│   ├── folders/          Folder tree management
│   ├── media/            Media library
│   ├── pages/            Page management
│   ├── settings/         Settings UI
│   └── workspace/        Workspace management
├── plugins/             # Content type plugins (register themselves)
│   ├── callout/
│   ├── checklist/
│   ├── code/
│   ├── heading/
│   ├── html/
│   ├── image/
│   ├── math/
│   ├── mermaid/
│   ├── paragraph/
│   ├── quote/
│   ├── table/
│   └── video/
├── shared/              # Shared utilities
│   ├── components/
│   │   ├── ui/           Button, Card, Dialog, DropdownMenu, Input, ScrollArea, Separator, Tooltip
│   │   └── common/       Breadcrumb, CommandPalette, EmptyState, Logo, SearchBar, UserProfile
│   ├── constants/
│   ├── hooks/
│   ├── icons/
│   ├── types/            Workspace, Folder, Page, Theme, etc.
│   └── utils/            cn() utility
├── layouts/
├── pages/
├── assets/
└── styles/
    └── globals.css       Tailwind directives + CSS custom properties
```

Only build inside the correct module. Never mix responsibilities.

---

## 14. Roadmap

### Phase 1: Application Shell
- [x] Project scaffolding (Vite, TypeScript, Tailwind, Oxlint, Prettier)
- [x] UI primitive components (button, card, dialog, dropdown-menu, input, scroll-area, separator, tooltip)
- [x] Common components (breadcrumb, command-palette, empty-state, logo, search-bar, user-profile)
- [x] Theme system (light/dark, CSS variables, persisted store)
- [ ] Entry point wiring (`main.tsx`, `App.tsx`, router setup)

### Phase 2: Workspace Management
- [x] Workspace store and UI (switcher, welcome screen, quick actions)
- [ ] Folder tree navigation
- [ ] Page management (create, delete, rename, move)
- [ ] Favorites and recent pages

### Phase 3: Editor Engine
- [ ] Command pattern registry and execution
- [ ] Block-based document model
- [ ] Cursor management and selection
- [ ] Rich text formatting (bold, italic, links, etc.)

### Phase 4: Block System
- [ ] Content-type plugin system
- [ ] Plugin registration API
- [ ] Block rendering pipeline
- [ ] Drag-and-drop block reordering
- [ ] Slash menu for block insertion

### Phase 5: Storage Engine
- [ ] Storage provider interface
- [ ] IndexedDB (Dexie) adapter
- [ ] localStorage fallback adapter
- [ ] Data migration framework

### Phase 6: Search Engine
- [ ] Full-text search engine (block-level indexing, tokenization)
- [ ] Search UI integration
- [ ] Search result ranking

### Phase 7: History
- [ ] Undo/redo stack using command snapshots
- [ ] Version history

### Phase 8: Media Library
- [ ] Image/video upload and embedding
- [ ] Media management UI
- [ ] Export (Markdown, HTML, PDF)

### Phase 9: Plugin SDK
- [ ] Public plugin API
- [ ] Third-party plugin support
- [ ] Plugin marketplace (future)

### Phase 10: AI Integration
- [ ] AI command palette integration
- [ ] AI-assisted writing (completion, rewriting, summarization)
- [ ] Semantic search (embedding-based)
- [ ] Smart suggestions and transformations
- [ ] AI remains optional — never a dependency

### Phase 11: Cloud Sync
- [ ] Offline-first sync engine (CRDT-based)
- [ ] Remote storage adapters (Supabase, GitHub, S3)
- [ ] Cross-device synchronization
- [ ] Real-time collaboration (future)

### Phase 12: Atlas SDK
- [ ] Published npm package for Atlas Core
- [ ] Integration guides for MLT, MAD2, Rainbowz, RS Machinery
- [ ] Documentation and examples

---

## 15. Non-Negotiable Engineering Rules

### The Platform Test
Before implementing anything, ask:

**Can this be reused by another project?**

- **If yes** → Build it inside Atlas Core (`src/core/`).
- **If no** → Build it inside Atlas App (`src/modules/`).

Never violate this rule.

### Architecture Rules
1. **No React imports in `core/`.** Atlas Core is framework-agnostic. React is a UI concern.
2. **No backward imports.** `modules/` may never import from `plugins/`. `shared/` may never import from `core/`, `modules/`, or `plugins/`.
3. **No circular dependencies.** Every import points downward. Use dependency injection or events for upward communication.
4. **No direct DOM access outside components.** Core modules must never reference `document`, `window`, or browser globals.
5. **No direct storage access from UI.** Modules call `StorageProvider` methods, never IndexedDB, localStorage, or fetch APIs directly.
6. **Business logic must never depend on UI.** Core never depends on modules or shared components.

### Code Quality Rules
7. **No `any` types.** Use `unknown` with proper narrowing, or explicit interfaces.
8. **No `default` exports.** All exports must be named.
9. **No inline styles.** Use Tailwind utility classes. Exception: dynamic animations.
10. **No commented-out code.** Delete it. Git history is for recovery.
11. **No `console.log` in committed code.** Use a proper logging abstraction.
12. **No magic numbers or strings.** Define constants in `shared/constants/` or co-locate with the module.
13. **No large components.** Prefer small functions and composition.
14. **No duplicated logic.** Reuse through shared utilities and components.
15. **Prefer interfaces over implementations.** Code to abstractions, not concrete types.

### Testing & Quality Rules
16. **Oxlint must pass with zero errors before any commit.**
17. **TypeScript must compile with `tsc -b` before any commit.**
18. **New features must include corresponding type definitions.**
19. **No dead code.** Unused exports, parameters, and variables fail the build.
20. **Performance must be verified for scale.** Test with 100+ workspaces, 10K+ pages, 100K+ blocks.

### Process Rules
21. **Read this document first.** Every AI session begins by reading AIAGENT.md.
22. **Read existing module READMEs.** Each `core/`, `module/`, and `plugins/` directory has a `README.md` detailing its contract.
23. **Follow existing patterns.** Study 2-3 existing implementations before writing new code of the same kind.
24. **One component per file.** Exception: tightly coupled sub-components (e.g., `Card`, `CardHeader`, `CardContent`).
25. **Co-locate tests with source.** Test files go next to the module they test.
26. **Update AIAGENT.md** when architecture changes, new patterns are established, or rules are refined.

---

## 16. Key Technology Choices

| Technology | Rationale |
|-----------|-----------|
| **React 19** | Industry-standard UI library with server components, actions, and improved hooks |
| **TypeScript 6** | Strict type safety across the entire codebase |
| **Vite 8** | Fast OXC-based dev server and bundler |
| **Tailwind CSS 3** | Utility-first CSS with zero runtime, consistent design tokens |
| **Zustand 5** | Minimal, TypeScript-first state management with built-in persistence |
| **Radix UI** | Headless, accessible, composable UI primitives |
| **Lucide React** | Consistent, lightweight icon library |
| **class-variance-authority** | Type-safe component variant definitions |
| **clsx + tailwind-merge** | Class name composition without conflicts |
| **Oxlint** | Rust-based linter that replaces ESLint entirely |
| **Prettier** | Universal code formatting (no debates) |
| **React Router 7** | Type-safe routing with loaders and actions |

---

## 17. Quick Reference

### Commands
```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + Vite production build
npm run lint      # Run Oxlint
npm run preview   # Preview production build
```

### Import Path Alias
```typescript
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/ui/button'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import type { Workspace } from '@/shared/types'
```

### Zustand Store Pattern
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MyState {
  value: string;
  setValue: (v: string) => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      value: '',
      setValue: (value) => set({ value }),
    }),
    { name: 'atlas-my-feature' },
  ),
)
```

### Component Pattern
```typescript
import * as React from 'react'
import { cn } from '@/shared/utils/cn'

interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary';
}

const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('base-styles', variant === 'primary' && 'primary-styles', className)}
      {...props}
    />
  ),
)
MyComponent.displayName = 'MyComponent'

export { MyComponent }
```

---

## Summary

Atlas is a platform, not an application.

It is a reusable Knowledge Workspace Engine designed to power multiple independent projects — MLT, MAD2, Rainbowz, RS Machinery, and more — without each building its own editor, storage, search, and AI from scratch.

Every engineering decision must serve this vision.

---

## 18. Documentation Update Policy

Every code change, feature addition, bug fix, refactor, UI improvement, architectural change, or behavioral change **must** include documentation updates before the task is considered complete.

Whenever Atlas changes:

1. Update Developer Documentation (`docs/developer/`) if any technical implementation changed.
2. Update User Documentation (`docs/user/`) if the user experience, workflow, UI, features, or behavior changed.
3. Update screenshots/examples if outdated.
4. Update keyboard shortcuts if modified.
5. Update architecture diagrams if affected.
6. Update block documentation if block behavior changed.
7. Update API documentation if interfaces changed.
8. Update changelog/release notes.
9. Verify all documentation links remain valid.

No implementation is considered complete until the documentation has been updated.

### Pull Request / Task Completion Checklist

Every completed task must satisfy:

- [ ] Feature implemented
- [ ] Tests updated (if applicable)
- [ ] Developer documentation updated
- [ ] User documentation updated
- [ ] AIAGENT.md policy followed
- [ ] Examples updated
- [ ] Screenshots updated (if required)
- [ ] Changelog updated

---

*This document is a living artifact. Update it when the architecture changes, when new patterns are established, or when rules are refined. Every AI agent must start here. Every AI agent must contribute back to this document when it discovers something the next agent should know.*
