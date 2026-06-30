# RFC 0001: Core Principles

**Status:** Ratified
**Author:** Architecture Team
**Last Updated:** 2026-06-30
**Supersedes:** None

---

This document is the permanent design constitution of Atlas.

It does not describe the current implementation.

It defines the principles that every future implementation must follow.

Every feature proposal, every refactor, every dependency decision must be evaluated against this document before work begins.

---

## 1. Vision

### What Atlas Is

Atlas is a **reusable Knowledge Workspace Engine** — a platform for creating, organizing, relating, and retrieving structured knowledge. It is an operating system for knowledge, not an application.

Atlas provides:
- A block-based content model where every unit of content has a stable identity
- A plugin architecture that makes content types extensible without modifying core
- Storage, sync, search, and export as swappable infrastructure layers
- A professional, minimal UI that can be embedded, themed, and white-labelled

Atlas powers multiple products from a single engine:
- Personal Knowledge Base
- Course portals (IIT Madras, MAD2)
- Documentation sites (Rainbowz, RS Machinery)
- Business SOPs
- Future SaaS products

### What Atlas Is Not

Atlas is not a notes application. It is not a wiki. It is not a CMS. It is not a blog platform. It is not a social network. It is not a project management tool.

It does not compete with Notion, Obsidian, Confluence, or WordPress. It is the engine that could power any of those experiences, but it is none of them by default.

### Why Atlas Exists

Every organization rebuilds the same knowledge infrastructure:
- A way to create content
- A way to organize content
- A way to find content
- A way to relate content

Atlas exists so this infrastructure is built once, correctly, and reused across every context. The workspace is the unit of reuse. Each workspace inherits the full capability of the engine. No workspace needs its own editor, its own search, its own storage.

---

## 2. Design Principles

### Offline First

All operations must work without a network connection. The internet is optional. Sync is a background process that never blocks the user.

- Every create, edit, delete, and search operation succeeds locally regardless of connectivity
- Network failures never cause data loss
- Sync is transparent, asynchronous, and conflict-resolvable
- The user should not be able to tell whether they are online or offline

Consequence: All data is stored locally. Remote storage is a replica, not the source of truth.

### Block First

Content is composed of discrete, typed blocks. Documents are block trees. Every block has a unique, stable ID.

- Blocks are independently editable, versioned, serialized, and syncable
- Block types are determined by plugins — the editor core has no hardcoded content types
- Inline formatting is stored as structured ranges (delta), not as HTML
- Position within a parent is explicit, not implicit

Consequence: AI targets block IDs, not positional indices. Relationships target block IDs, not text ranges. History tracks changes per block, not per page.

### Plugin First

All content types are plugins. The editor core knows nothing about paragraphs, headings, images, or any specific block type.

- Adding a new block type requires zero changes to core code
- Plugins register: renderer, serializer, parser, settings UI, metadata schema
- Plugins are independently versioned and distributable
- Core provides the lifecycle; plugins provide the behavior

Consequence: The editor is a shell that coordinates block rendering, selection, and input routing. Everything content-specific lives in a plugin.

### Command Driven

Every user action is a command. UI components never call functions, mutate state, or trigger side effects directly. They dispatch commands.

- Commands are serializable (enables undo/redo, macros, audit)
- Commands have unique IDs (enables keyboard shortcut binding)
- Commands declare context (enables command palette filtering)
- Commands support inverse (enables undo stack)

Consequence: The command palette is the universal interface. Every action in the app is discoverable through it. Keyboard shortcuts are simple mappings of command IDs to key combinations.

### Storage Agnostic

Storage is always behind a provider interface. No module, component, or store accesses IndexedDB, localStorage, or any database directly.

- The `StorageProvider` interface defines all data operations
- Switching from IndexedDB to SQLite to Supabase requires zero module changes
- Storage providers are pluggable and swappable at runtime
- Every storage operation is typed and testable

Consequence: Modules import a storage interface, not a database library. The application does not know what database it runs on.

### Framework Agnostic Core

Core engines (editor, storage, search, sync, parser, serializer) have zero imports from React, React Router, or any UI framework.

- Core modules export pure TypeScript interfaces, types, and functions
- UI framework adapters live in a separate layer and consume core APIs
- Core can be tested without jsdom, React Testing Library, or any UI dependency
- Core can be ported to other frameworks (Vue, Svelte, desktop) without modification

Consequence: `core/editor` does not import `React`. `core/storage` does not import `zustand`. The UI layer is thin — it renders blocks and dispatches commands.

### Human Content First

User-created content is sacred. No system process, AI operation, or automated transformation ever modifies user content directly.

- AI writes to metadata, never to content
- AI results are attached to blocks by ID as separate records
- User content is the source of truth; AI metadata is derived and disposable
- Regenerating AI results creates new records; original content is untouched

Consequence: AI can be wrong, stale, or removed entirely without corrupting user content. Block versioning allows detecting staleness of AI metadata.

### AI Optional

Atlas must be fully functional with all AI features disabled, uninstalled, or never connected.

- No AI dependency at build time, runtime, or design time
- AI features are plugins that consume the core API — they are not part of core
- AI providers are swappable (OpenAI, Anthropic, local models, none)
- The UI must not degrade when AI is unavailable

Consequence: AI is a feature, not a platform. The command palette, search, editor, and storage all work identically with or without AI.

### Composable

Small, focused modules combine to create complex behaviors. Composition replaces inheritance and monolithic design.

- Each module does one thing and does it well
- Modules communicate through well-defined interfaces, not shared state
- A module's internal implementation can be rewritten without affecting its consumers
- Module composition happens at the application assembly layer, not inside the modules

Consequence: A feature like "AI-powered search" is composed of: search engine + AI plugin + command dispatcher. Each piece is independently testable and replaceable.

### Modular

Every module has clear boundaries, a documented public API, and zero knowledge of modules outside its dependency scope.

- Modules are organized by domain: core engines, business modules, UI plugins
- Dependency direction is enforced: core ← modules ← UI ← pages
- No circular dependencies between modules
- Module internals are never exposed — only the public API is importable

Consequence: You can delete a module without affecting unrelated modules. You can replace a module with a different implementation that conforms to the same interface.

### Minimal UI

The UI is intentionally sparse. Every visual element, every interaction, every animation must earn its place through utility.

- Inspired by Linear, Notion, Raycast, and VS Code — tools that get out of your way
- No unnecessary animations, gradients, vibrant colors, or decorative elements
- Typography, spacing, and alignment do the visual work
- Features are hidden until needed (progressive disclosure)
- The user should feel that Atlas is fast, stable, and predictable — not "delightful"

Consequence: The UI is professional and minimal. If a UI element can be removed without losing functionality, it must be removed.

### Reusable

Everything is built to be reused across multiple contexts, workspaces, and products.

- The same engine powers personal KB, course portals, documentation sites, and future products
- Workspaces isolate content; the engine is shared
- Configuration replaces forking and customization
- Workspace-specific behavior is achieved through settings and plugins, not code changes

Consequence: There is exactly one Atlas codebase. Every product is a workspace configuration, not a fork.

---

## 3. Things Atlas Will Never Become

### Social Network

Atlas will never have feeds, followers, likes, comments (as a social feature), sharing (as a discovery feature), or any social graph functionality. Knowledge management and social networking are fundamentally different problems. Adding social features would introduce moderation, privacy, and spam concerns that are outside Atlas's scope.

### Chat Application

Atlas will never have real-time messaging, chat rooms, or instant messaging features. Communication is not knowledge management. Comments on blocks are annotations, not conversations. The distinction matters: annotations are attached to content and persist with it; chat messages are ephemeral and belong to a conversation thread.

### CRM

Atlas will never manage contacts, deals, pipelines, or customer interactions. Customer relationship management requires specialized data models (leads, opportunities, accounts) and workflows (email sequences, scoring, forecasting) that would compromise the general-purpose architecture. Use a dedicated CRM. Atlas can link to it.

### Email Client

Atlas will never send, receive, or manage email. Email is a communication protocol, not a knowledge management concern. Atlas can store email as content (imported or linked), but it will never function as an email client.

### Spreadsheet Replacement

Atlas will never implement a formula engine, pivot tables, charting, or data analysis features. Tables in Atlas are for structured content display within documents — they are not spreadsheets. If you need a spreadsheet, use a spreadsheet. Atlas can embed it.

### Project Management Platform

Atlas will never implement Gantt charts, sprint planning, resource allocation, burndown charts, or project tracking workflows. Task tracking in Atlas is about tracking knowledge work (e.g., "todo items in a meeting note"), not replacing Jira, Linear, or Asana. The todo block type is for checklists within documents, not for issue tracking.

### Code Editor / IDE

Atlas will render code blocks with syntax highlighting, but it will never implement debugging, compilation, language servers, terminals, or any IDE functionality. Code blocks are for documentation and reference — they are not development environments.

### Drawing / Design Tool

Atlas will support diagrams through plugins (Mermaid), but it will never implement canvas-based drawing, vector editing, image manipulation, or design tools. If you need a diagram, use a diagramming tool. Atlas can embed the result.

### Blog / CMS

Atlas will never have public-facing routing, SEO features, caching layers, or content delivery features. It is a knowledge workspace, not a content management system. Export to a CMS? Yes. Be a CMS? No.

### Why These Boundaries Exist

Every feature that falls outside these boundaries introduces complexity, maintenance burden, and architectural compromise that dilutes Atlas's core mission. The purpose of these boundaries is not to limit what Atlas can do — it is to ensure that Atlas does what it does exceptionally well.

When you need one of these capabilities, integrate with the best tool for that job. Atlas provides the knowledge workspace. Specialized tools provide specialized functionality. Atlas links to them, embeds them, or exports to them.

---

## 4. Feature Acceptance Rules

Before implementing any feature, ask these questions in order. If any answer is unacceptable, reject or redesign the feature.

### Rule 1: Plugin Test

**Can this feature be a plugin?**

If yes, it must be built as a plugin. Only features that are fundamental to the block-based content model belong in core.

*Pass:* A new block type (build as plugin).
*Fail:* Adding the block type to core/editor.

### Rule 2: Reuse Test

**Can this feature be reused across different workspaces and contexts?**

If the feature is specific to one product, one workspace type, or one use case, it should be configurable, not hardcoded.

*Pass:* A "table of contents" block that works in any workspace.
*Fail:* A "grade calculator" block built into the editor.

### Rule 3: Coupling Test

**Does this feature increase coupling between modules?**

If the feature requires module A to import from module B, and those modules had no dependency before, the feature needs redesign. Circular dependencies are forbidden.

*Pass:* Adding a method to the existing StorageProvider interface.
*Fail:* Making the editor import from the sync module to show sync status.

### Rule 4: Modularity Test

**Does this feature violate the modular boundaries defined in this document?**

Each module has a defined scope. If the feature crosses scope boundaries, it must be split into pieces that fit within the existing module boundaries, or a new module must be created.

*Pass:* Creating a new plugin to support a new block type.
*Fail:* Adding export functionality inside the editor module.

### Rule 5: Offline Test

**Does this feature require internet to function?**

If the feature stops working without internet, it must have an offline fallback or be redesigned to work fully offline. Features that are purely additive when online (like AI summarization) are acceptable as long as they do not block offline workflows.

*Pass:* AI summarization that works locally when offline (using cached models or local LLM).
*Fail:* A save button that requires server confirmation before updating the UI.

### Rule 6: AI Independence Test

**Does this feature make AI mandatory?**

If disabling AI features breaks this feature, the feature must be redesigned. AI is always optional. The UI must not change, error messages must not appear, and functionality must not degrade when AI is unavailable.

*Pass:* Smart search that falls back to text-search when AI is off.
*Fail:* A page composer that requires AI to create content.

### Rule 7: Storage Test

**Does this feature access storage directly (localStorage, IndexedDB, fetch)?**

If it does, it must use the StorageProvider interface instead. No exceptions.

*Pass:* Using `storageProvider.pages.getById(id)`.
*Fail:* Calling `indexedDB.get('pages', id)`.

### Rule 8: Command Test

**Is this user action dispatched as a command?**

If the feature introduces a new user action (button click, shortcut, menu item), it must be implemented as a command, registered in the command registry, and bound to its UI trigger through the command system.

*Pass:* `commands.dispatch('editor:toggle-bold')`.
*Fail:* Calling `document.execCommand('bold')` directly.

### Rule 9: UI Necessity Test

**Does this feature add UI that could be deferred, hidden, or removed?**

Every UI element must justify its existence. If the feature adds buttons, menus, panels, or indicators that are not strictly necessary, remove them. If the feature can be accessed through the command palette, it does not need a toolbar button.

*Pass:* A formatting toolbar that appears only when text is selected.
*Fail:* A persistent formatting toolbar that takes up screen space.

### Summary Decision Matrix

| If answer is... | Then... |
|---|---|
| Can be a plugin | Build as plugin |
| Cannot be reused | Make configurable or reject |
| Increases coupling | Redesign |
| Violates modularity | Split or reject |
| Requires internet | Add offline fallback |
| Makes AI mandatory | Redesign |
| Accesses storage directly | Route through provider |
| Lacks command wrapper | Add command |
| Adds unnecessary UI | Remove or defer |

---

## 5. Core Invariants

These rules must never be broken. They are not guidelines. They are constraints.

### Module Boundaries

**5.1** `core/` never imports from `modules/`, `layouts/`, `pages/`, or any UI framework.

**5.2** `plugins/` never imports from `core/` internals. Plugins import from `core/` public APIs only.

**5.3** `modules/` never imports from `core/` directly. Modules consume core services through dependency injection or service locators.

**5.4** `shared/` never imports from `core/`, `modules/`, `plugins/`, or `layouts/`.

**5.5** No circular dependencies between any modules.

### Storage

**5.6** No module accesses `localStorage` or `IndexedDB` directly. All storage goes through the `StorageProvider` interface.

**5.7** The `StorageProvider` interface is defined in `core/storage`. All storage adapters implement this interface.

**5.8** Every entity has a `version` field (monotonic integer) that increments on every mutation.

**5.9** Every entity has a `deletedAt` field (`number | null`). Entities are soft-deleted unless explicitly purged.

**5.10** Entity IDs are UUIDv7 (time-ordered). No auto-increment integers.

### Content

**5.11** User content is never modified by non-user processes. AI, automation, and sync can create new entities or update metadata — they never overwrite user content.

**5.12** Every block has a unique ID. No block exists without an ID.

**5.13** Inline formatting is stored as structured ranges (offset, length, type). It is never stored as HTML or Markdown within content strings.

**5.14** The editor core does not know about specific block types. All block types are registered by plugins.

### Commands

**5.15** The command registry is the only entry point for user-initiated operations. UI components dispatch commands; they do not call functions or mutate state.

**5.16** Every command has a unique ID that can be bound to a keyboard shortcut.

### AI

**5.17** AI never modifies `Block.content`. AI writes to `AIMetadata.output` and `AIMetadata.structured`.

**5.18** AI features must be disableable without affecting any non-AI functionality.

### Schema

**5.19** All timestamps are Unix milliseconds (number). No Date objects, no ISO strings, no relative timestamps.

**5.20** All optional fields are `T | null`. `undefined` is not used for optional fields in stored entities.

**5.21** Every persisted entity must have: `id`, `createdAt`, `updatedAt`, `version`, `deletedAt`.

---

## 6. Decision Process

### When an RFC Is Required

Any change that affects one or more of the following must go through the RFC process:

- Module boundaries or creation of new modules
- Storage provider interface
- Core entity model (adding, removing, or modifying entity interfaces)
- Plugin registration interface
- Command registry architecture
- Sync protocol or data format
- Export/import format
- UI framework or state management library
- Build tooling or project structure
- External dependency that becomes a hard requirement

Changes that do not require an RFC:
- Adding a new plugin (follow plugin development guide)
- Adding a new command (follow command registration guide)
- UI layout changes within existing patterns
- Bug fixes that do not change interfaces
- Performance optimizations that do not change interfaces

### RFC Structure

Every RFC must contain these sections:

```
# RFC NNNN: Title

## Problem
What is the specific problem being solved? What is broken, missing, or suboptimal?

## Motivation
Why is this problem worth solving now? What user need or architectural debt drives this change?

## Proposed Solution
A detailed description of the proposed change. Include interfaces, data flow, and module boundaries.

## Alternatives Considered
What other approaches were evaluated? Why were they rejected?

## Trade-offs
What is being sacrificed? (Performance vs. simplicity, flexibility vs. safety, etc.)

## Migration
How will existing data or code be migrated? What breaks? What is the rollback plan?

## Impact
Which modules are affected? Which interfaces change? What is the blast radius?

## Checklist
- [ ] Does not violate Core Invariants (Section 5)
- [ ] Passes Feature Acceptance Rules (Section 4)
- [ ] Migration plan is defined
- [ ] Rollback plan is defined
- [ ] Documentation will be updated

## Decision
[To be filled after review: Approved / Rejected / Needs Revision]
```

### RFC Workflow

1. **Draft** — Author writes RFC and opens a pull request adding it to `docs/rfc/`
2. **Review** — Architecture team and affected module owners review. Discussion happens on the PR.
3. **Revise** — Author updates RFC based on feedback. Cycle repeats until consensus or rejection.
4. **Ratify** — Architecture team approves. RFC is merged.
5. **Implement** — Implementation begins. The RFC is the specification.
6. **Retroactively Document** — If emergency changes bypass RFC, an RFC must be written afterward explaining what changed and why.

### Emergency Changes

In rare cases (security vulnerability, data loss bug), changes may bypass the RFC process. The author must:

1. Create a post-hoc RFC within 7 days
2. Explain why the emergency bypass was necessary
3. Document what was changed and the impact

---

## 7. Long-Term Roadmap

This is not a feature roadmap. It describes the capabilities Atlas will gain over time and how its role evolves.

### Year 1: Knowledge Workspace

**Capabilities:**
- Block-based editor with core plugin set (paragraph, heading, list, todo, code, quote, callout, divider, image, video)
- Full offline operation with IndexedDB storage
- Workspace, folder, page CRUD with nested folder support
- Full-text search with ranking and highlighting
- Tags and page relationships
- Professional, minimal UI with dark mode
- Command palette with keyboard shortcuts
- Theme system (light/dark)

**Role:** Atlas is a personal knowledge base. One user, one device, full capability.

### Year 2: Knowledge Platform

**Capabilities:**
- Cloud sync with conflict resolution (last-write-wins)
- Multi-device support (phone, tablet, desktop)
- Version history with diffing and restore
- Revision management (user-saved snapshots)
- Advanced search with semantic embeddings
- Export pipeline (Markdown, HTML, PDF, .atlas format)
- Import from Obsidian, Notion, Markdown files
- Collaborative editing (block-level CRDT)
- User preferences sync across devices

**Role:** Atlas is a multi-device, multi-user platform. Teams can share workspaces. Content is synchronized and versioned.

### Year 3: Embeddable Engine

**Capabilities:**
- Atlas as an embedded engine (web component, iframe)
- Theming API for embedding contexts
- Headless API (all operations accessible through TypeScript API)
- Authentication adapters (OAuth, SAML, API keys)
- Programmatic content creation and management
- Custom storage adapters (bring your own database)
- Admin API for workspace management

**Role:** Atlas is embeddable in other products. A documentation portal, a course platform, or an internal wiki can all use Atlas as their engine without the user knowing.

### Year 4: Developer SDK

**Capabilities:**
- `@atlas/sdk` — JavaScript/TypeScript SDK for building on Atlas
- Plugin development toolkit (scaffold, test, build, publish)
- Headless mode (Atlas as a backend-only service)
- Event system (hooks for every CRUD operation)
- Custom serializer/parser registration
- Workspace templates as code
- CLI for workspace management and automation

**Role:** Atlas is a development platform. Developers build custom experiences on top of the Atlas engine. The SDK provides the tooling to make this productive.

### Year 5: Open Plugin Ecosystem

**Capabilities:**
- Plugin marketplace with versioning and distribution
- Community plugin registry (curated, verified)
- Plugin dependency system
- Plugin telemetry (usage, compatibility, performance)
- Plugin sandboxing (security isolation)
- Atlas Foundation (open governance model)
- Plugin developer certification program

**Role:** Atlas is an ecosystem. The core engine is stable and mature. The majority of innovation happens through plugins developed by the community. Atlas Foundation ensures long-term stewardship.

### Evolution Summary

```
Year 1:  Engine   → Knowledge Workspace (single user, local)
Year 2:  Platform → Knowledge Platform (multi-user, sync)
Year 3:  Embed    → Embeddable Engine (in other products)
Year 4:  SDK      → Developer Platform (build on Atlas)
Year 5:  Ecosystem → Open Plugin Ecosystem (community-driven)
```

Each phase builds on the previous. The architecture decisions made in Year 1 must not prevent any of these future capabilities. The offline-first, block-first, plugin-first design ensures this.

---

## Enforcement

Every pull request must include a checklist confirming the change does not violate this document:

```
- [ ] Does not violate Core Principles (docs/rfc/0001-core-principles.md)
- [ ] Passes Feature Acceptance Rules (§4)
- [ ] Respects Core Invariants (§5)
- [ ] Follows Decision Process (§6)
```

If a pull request is found to violate this document after merge, it must be reverted or refactored to comply.

If a change in circumstances makes a principle in this document obsolete, a new RFC must be written to amend this document. Amendments require supermajority approval (2/3 of architecture team).

---

**If a feature conflicts with this document, redesign the feature before writing code.**
