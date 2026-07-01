# Roadmap

Atlas is an evolving platform. This document outlines the current status and future plans.

---

## Current Status

**Phase: Foundation Complete**

Core features implemented:
- Block-based editor architecture
- Document model and rendering pipeline
- Paragraph, heading, divider blocks
- Grid, list, card, gallery, kanban, calendar blocks
- Label and tag inline elements
- HTML embed with CSS support
- Sidebar with fixed/variable mode and resize handle
- Slash command menu
- Block drag-and-drop
- Basic keyboard shortcuts
- Dark/light theme
- Zustand state management
- TypeScript strict mode
- Vite build pipeline

---

## Phase 1: Foundation Complete

- [x] Project scaffolding (Vite, TypeScript, Tailwind, Oxlint, Prettier)
- [x] UI primitive components (button, card, dialog, dropdown-menu, input, scroll-area, separator, tooltip)
- [x] Theme system (light/dark, CSS variables, persisted store)
- [x] Editor engine and document model
- [x] Block system with plugin architecture
- [x] Basic blocks: paragraph, heading, divider
- [x] Container blocks: grid, list, card, gallery, kanban, calendar
- [x] Inline elements: label, tag
- [x] HTML embed with file upload
- [x] Slash command menu
- [x] Sidebar with collapse and resize

---

## Phase 2: Storage & Persistence

- [ ] IndexedDB (Dexie) storage adapter
- [ ] LocalStorage fallback adapter
- [ ] CRUD operations for workspaces, pages, and blocks
- [ ] Data migration framework
- [ ] Backup and export (JSON)
- [ ] Import from Notion, Obsidian

---

## Phase 3: Editor Enhancement

- [ ] Rich text formatting (bold, italic, underline, strikethrough, code, link)
- [ ] Inline color and highlight洪流 highlighting
- [ ] Mention system (users, pages, dates)
- [ ] Undo/redo using command snapshots
- [ ] Copy/paste with formatting preservation
- [ ] Block-level comments

---

## Phase 4: Advanced Blocks

- [ ] Image block with upload and resizing
- [ ] Video block with embedding
- [ ] Table block with sorting and filtering
- [ ] Code block with syntax highlighting
- [ ] Math block with KaTeX
- [ ] Mermaid diagram block
- [ ] Quote and callout blocks
- [ ] Checklist block
- [ ] Divider variations

---

## Phase 5: Search & Discovery

- [ ] Full-text search engine (block-level indexing, tokenization)
- [ ] Search UI integration
- [ ] Search result ranking
- [ ] Saved searches
- [ ] Recent pages history

---

## Phase 6: Media & Assets

- [ ] Media library with upload
- [ ] Image optimization and resizing
- [ ] Video thumbnail generation
- [ ] File attachment support
- [ ] Asset organization (folders, tags)

---

## Phase 7: Collaboration

- [ ] Real-time collaboration using CRDT
- [ ] User presence indicators
- [ ] Comments and mentions
- [ ] Revision history
- [ ] Sharing and permissions

---

## Phase 8: Export & Publishing

- [ ] Markdown export
- [ ] HTML export
- [ ] PDF export
- [ ] Print styling
- [ ] Publish to web (static site generation)
- [ ] Git export (version control)

---

## Phase 9: AI Integration

- [ ] AI-assisted writing (completion, rewriting, summarization)
- [ ] Semantic search (embedding-based)
- [ ] Smart suggestions and transformations
- [ ] Auto-categorization
- [ ] AI commands in slash menu

---

## Phase 10: Platform SDK

- [ ] Published npm package for Atlas Core
- [ ] Plugin SDK for third-party extensions
- [ ] Integration guides
- [ ] Documentation and examples

---

## Known Limitations

1. No server-side rendering
2. No real-time collaboration
3. No image or file upload yet
4. Limited export options
5. No mobile-responsive layout
6. No plugin marketplace

---

## Contributing

To contribute to Atlas development:

1. Review the [Architecture](architecture.md) and [Editor](editor.md) docs
2. Follow the [Coding Standards](coding-standards.md)
3. Add tests for new features
4. Update documentation for any changes
5. Submit a PR with a clear description

---

*Last updated: 2024*