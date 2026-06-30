# Atlas Domain Model

Canonical reference for the Atlas Knowledge Workspace Engine data model.

**Status:** Architecture Phase — No implementation yet.
**Last Updated:** 2026-06-30
**Version:** 0.1.0

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Why Block-Based Storage](#2-why-block-based-storage)
3. [Entity Catalog](#3-entity-catalog)
4. [Entity Relationship Diagram](#4-entity-relationship-diagram)
5. [Storage Architecture](#5-storage-architecture)
6. [Sync Architecture](#6-sync-architecture)
7. [Plugin System Data Model](#7-plugin-system-data-model)
8. [AI Metadata Model](#8-ai-metadata-model)
9. [Search Index Model](#9-search-index-model)
10. [Git Export Serialization](#10-git-export-serialization)

---

## 1. Philosophy

### 1.1 What Atlas Is

Atlas is a **Knowledge Workspace Engine** — a platform for creating, organizing, relating, and retrieving structured knowledge. It is not a notes application. It is an operating system for knowledge.

### 1.2 Design Principles

| Principle | Meaning |
|---|---|
| **Block-first** | Content is composed of discrete, typed blocks. Documents are block trees, not blobs of HTML or Markdown. |
| **Entity independence** | Every entity (workspace, folder, page, block, tag) has its own identity and lifecycle. No entity owns another's data. |
| **Storage agnostic** | Entities never touch storage. They define interfaces; storage providers implement them. |
| **Plugin extensibility** | Block types are plugins. The editor core knows how to render, serialize, and diff blocks — it does not know what blocks exist. |
| **AI as metadata** | AI never modifies raw content. AI reads blocks and writes structured metadata back to them. |
| **Offline-first** | Every operation is local first. Sync is a background process that reconciles changes asynchronously. |
| **Relationships are first-class** | Pages are linked through explicit relationship entities, not through inline links. The graph is queryable. |

### 1.3 Naming Conventions

- `id`: Always a UUIDv7 (time-ordered for IndexedDB performance)
- `createdAt`: Unix timestamp (ms), set once on creation
- `updatedAt`: Unix timestamp (ms), updated on every mutation
- `deletedAt`: Unix timestamp (ms) or `null`. `null` = active. Non-null = soft-deleted.
- `version`: Monotonic integer starting at 1. Incremented on every mutation. Used for sync and conflict detection.

---

## 2. Why Block-Based Storage

### 2.1 Block vs. Document vs. HTML

| Concern | HTML Blob | Markdown File | Atlas Block Tree |
|---|---|---|---|
| **Edit granularity** | Must re-render entire document | Must re-render entire document | Single block rerenders independently |
| **Unique identity** | No block-level IDs | No block-level IDs | Every block has a UUID |
| **AI targeting** | "Rewrite paragraph 3" (fragile positional reference) | Same problem | "Rewrite block_abc123" (stable reference) |
| **Drag-and-drop** | Requires DOM manipulation and HTML parsing | Not possible | Native — reorder block IDs in parent |
| **Collaboration** | Requires OT on the whole document | Not possible | CRDT per block — independent |
| **Plugin types** | Must parse HTML to identify block types | Must parse Markdown | Native — block.type is first-class |
| **Version history** | Store full document per revision | Store full file per revision | Store changed blocks only |
| **Search** | Must parse HTML for indexing | Must parse Markdown | Direct access to block.content for each block |
| **Relationships** | Inline links only (fragile) | Inline links only | Explicit relationship entities |
| **Export** | Transform HTML → target format | Transform Markdown → target format | Serialize block tree block by block using per-type serializers |

### 2.2 Why Every Block Has Its Own ID

1. **Stable references.** AI commands ("improve this paragraph"), annotations, comments, and deep links all target a block by ID. Position-based references break when content is inserted or removed above the target.

2. **Independent history.** Each block tracks its own version history. Undoing a change to one block does not affect others.

3. **Granular sync.** When syncing, only changed blocks are transmitted — not the entire document.

4. **Plugin metadata.** Plugins attach data to specific blocks via the block's `metadata` map. Without block IDs, there is no way to associate metadata with content.

5. **Drag-and-drop reordering.** Reordering is simply reassigning the order of block IDs in the parent block's `children[]` array. No content is moved or copied.

6. **Block-level relationships.** Block A can reference Block B directly. For example, a table of contents block can reference heading blocks by ID.

### 2.3 Block Tree Structure

A page is a tree of blocks. The root block is the page itself. All content blocks are descendants.

```
Page (block_root)
├── Heading (block_h1)
├── Paragraph (block_p)
├── Image (block_img)
│   └── Caption (block_p)  [nested children]
├── ColumnLayout (block_columns)
│   ├── Column (block_column)
│   │   ├── Paragraph (block_p)
│   │   └── Image (block_img)
│   └── Column (block_column)
│       └── Paragraph (block_p)
├── Code (block_code)
└── Callout (block_callout)
    └── Paragraph (block_p)
```

Every block is stored as a flat row in IndexedDB with a `parentId` foreign key. The tree structure is reconstructed at query time.

---

## 3. Entity Catalog

### 3.1 Workspace

#### Purpose
A workspace is the top-level container. Every folder, page, tag, and asset belongs to exactly one workspace. Workspaces isolate data between projects (Personal KB, IIT Madras, Rainbowz Docs, etc.).

#### TypeScript Interface

```typescript
interface Workspace {
  id: string;                     // UUIDv7
  name: string;                   // Display name
  icon: string;                   // Lucide icon name or emoji
  description: string | null;     // Optional description

  // Settings
  colorScheme: 'light' | 'dark' | 'system';
  defaultEditorMode: 'edit' | 'preview' | 'focus';
  pageSortOrder: 'created' | 'updated' | 'alphabetical';
  pageSortDirection: 'asc' | 'desc';

  // Sync
  syncEnabled: boolean;
  syncProvider: string | null;    // 'supabase' | 'github' | null
  lastSyncedAt: number | null;

  // Metadata
  pageCount: number;              // Denormalized counter
  folderCount: number;            // Denormalized counter
  createdAt: number;
  updatedAt: number;
  version: number;
  deletedAt: number | null;
}
```

#### Required Properties
`id`, `name`, `createdAt`, `updatedAt`, `version`

#### Optional Properties
`icon` (default `LayoutGrid`), `description`, `colorScheme`, `defaultEditorMode`, `pageSortOrder`, `pageSortDirection`, `syncEnabled`, `syncProvider`, `lastSyncedAt`, `pageCount`, `folderCount`, `deletedAt`

#### Relationships
- **1→★ Folder** (workspaceId on Folder)
- **1→★ Page** (workspaceId on Page) — root-level pages
- **1→★ Tag** (workspaceId on Tag)
- **1→★ Asset** (workspaceId on Asset)

#### Lifecycle
1. Created by user (or system default on first launch)
2. Renamed, reconfigured by user
3. Soft-deleted (trashed) — all contents enter trash recursively
4. Permanently deleted (after trash retention period)

#### Future Scalability
- Workspace-level permissions and sharing
- Workspace templates (pre-populated with folders, pages, tags)
- Workspace-level export/import (.atlas file format)

---

### 3.2 Folder

#### Purpose
Folders provide hierarchical organization for pages. They form a tree within a workspace. A folder can contain sub-folders and pages.

#### TypeScript Interface

```typescript
interface Folder {
  id: string;                      // UUIDv7
  workspaceId: string;             // Parent workspace
  parentId: string | null;         // Parent folder (null = root level)
  name: string;                    // Display name
  icon: string | null;             // Emoji or icon override
  children: string[];              // Ordered child folder IDs
  pageCount: number;               // Denormalized direct page count
  collapsed: boolean;              // UI state: collapsed/expanded

  createdAt: number;
  updatedAt: number;
  version: number;
  deletedAt: number | null;
}
```

#### Required Properties
`id`, `workspaceId`, `name`, `children`, `createdAt`, `updatedAt`, `version`

#### Optional Properties
`parentId` (null = root), `icon`, `pageCount`, `collapsed`, `deletedAt`

#### Relationships
- **★→1 Workspace** (workspaceId)
- **★→1 Folder** (parentId) — self-referential for nesting
- **1→★ Folder** (children[] — child folders)
- **1→★ Page** (via folderId on Page)

#### Lifecycle
1. Created in a workspace (root or inside another folder)
2. Renamed, reordered (within parent folder)
3. Moved to another parent folder
4. Deleted → soft-delete → all contents (sub-folders and pages) recursively soft-deleted
5. Restored from trash → all contents restored recursively

#### Future Scalability
- Folder-level page ordering (manual drag-and-drop order vs. auto-sort)
- Folder templates (pre-defined structure for courses, projects)
- Shared folders (visible across workspaces)

---

### 3.3 Page

#### Purpose
A page is the primary knowledge unit. It contains a collection of blocks forming a document. Pages belong to a workspace and optionally to a folder.

#### TypeScript Interface

```typescript
interface Page {
  id: string;                      // UUIDv7
  workspaceId: string;             // Parent workspace
  folderId: string | null;         // Parent folder (null = root-level)

  title: string;                   // Page title
  icon: string | null;             // Emoji or Lucide icon
  coverAssetId: string | null;     // Cover image (references Asset)

  // Block tree root
  rootBlockId: string;             // References the root Block

  // Metadata
  isFavorite: boolean;
  lastOpenedAt: number;
  wordCount: number;               // Denormalized (computed from blocks)
  charCount: number;               // Denormalized

  // Timestamps
  createdAt: number;
  updatedAt: number;
  version: number;
  deletedAt: number | null;
}
```

#### Required Properties
`id`, `workspaceId`, `title`, `rootBlockId`, `createdAt`, `updatedAt`, `version`

#### Optional Properties
`folderId`, `icon`, `coverAssetId`, `isFavorite`, `lastOpenedAt`, `wordCount`, `charCount`, `deletedAt`

#### Relationships
- **★→1 Workspace** (workspaceId)
- **★→1 Folder** (folderId) — nullable for root-level pages
- **1→★ Tag** (via PageTag junction)
- **1→1 Block** (rootBlockId) — the root block that owns the block tree
- **★→★ Page** (via Relationship entity)
- **1→★ Revision** (via pageId on Revision)
- **1→★ Bookmark** (via pageId on Bookmark)
- **1→★ AIMetadata** (via pageId on AIMetadata)

#### Lifecycle
1. Created in workspace (optionally in a folder)
2. Title, icon, and blocks modified
3. Moved to another folder (or to root)
4. Favorited/unfavorited
5. Opened (updates lastOpenedAt)
6. Soft-deleted → moved to trash
7. Restored from trash or permanently deleted

#### Future Scalability
- Page-level permissions
- Page templates
- Page analytics (views, time spent)
- Multi-page selections and batch operations

---

### 3.4 Block

#### Purpose
A block is the atomic unit of content. Every piece of content on a page is a block. Blocks form a tree (page → section → content). Each block has a type that determines how it renders, serializes, and behaves.

#### TypeScript Interface

```typescript
interface Block {
  id: string;                      // UUIDv7
  workspaceId: string;             // For querying and partitioning
  pageId: string;                  // The page this block belongs to
  parentId: string | null;         // Parent block (null for root block)
  children: string[];              // Ordered child block IDs

  type: string;                    // Plugin type identifier
  pluginVersion: string;           // Plugin version that created this block
  content: Record<string, unknown>; // Type-specific content payload
  metadata: Record<string, unknown>; // Plugin-specific metadata

  // Inline formatting (stored as delta).
  // Each format targets a range within the block's primary text content.
  formats: InlineFormat[];

  // Order within parent
  position: number;                // Sort order index

  // Computed indexing
  plainText: string;               // Extracted plain text for search
  wordCount: number;               // Denormalized
  charCount: number;               // Denormalized

  createdAt: number;
  updatedAt: number;
  version: number;
  deletedAt: number | null;
}

interface InlineFormat {
  start: number;                   // Character offset (UTF-16)
  end: number;                     // Character offset (UTF-16)
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'link' | 'highlight' | 'color';
  value: string | null;            // URL for links, hex for color, null for toggles
}

// Predefined block types
type BuiltInBlockType =
  | 'paragraph'
  | 'heading'
  | 'bullet_list_item'
  | 'ordered_list_item'
  | 'todo'
  | 'code'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'image'
  | 'video'
  | 'file'
  | 'table'
  | 'math'
  | 'mermaid'
  | 'column_layout'
  | 'column'
  | 'toggle'
  | 'link_preview'
  | 'bookmark'
  | 'embed';

// Example block content by type
interface HeadingContent {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

interface ImageContent {
  assetId: string;
  caption: string | null;
  altText: string | null;
  width: number | null;
  alignment: 'left' | 'center' | 'right';
}

interface CodeContent {
  language: string;
  code: string;
  showLineNumbers: boolean;
}

interface CalloutContent {
  variant: 'info' | 'warning' | 'error' | 'success' | 'tip';
  icon: string | null;
  text: string;
}

interface TodoContent {
  checked: boolean;
  text: string;
}
```

#### Required Properties
`id`, `workspaceId`, `pageId`, `parentId`, `children`, `type`, `content`, `position`, `formats`, `createdAt`, `updatedAt`, `version`

#### Optional Properties
`deletedAt`, `metadata`, `pluginVersion`, `plainText`, `wordCount`, `charCount`

#### Relationships
- **★→1 Page** (pageId)
- **★→1 Block** (parentId) — self-referential for nesting
- **1→★ Block** (children[] — child blocks)
- **1→★ Asset** (via assetId in type-specific content)
- **1→★ AIMetadata** (via blockId on AIMetadata)

#### Lifecycle
1. Created on a page (inserted at a position within a parent block)
2. Content, type, or formatting modified
3. Reordered within parent (position updated)
4. Moved to different parent (parentId and position updated)
5. Deleted → soft-deleted → children recursively soft-deleted
6. Permanently deleted (when page is purged from trash)

#### Future Scalability
- Large block content stored separately and lazily loaded
- Block-level access control
- Block embeds (block from one page embedded in another)
- Block-level citations and references

---

### 3.5 Asset

#### Purpose
An asset is a binary file (image, video, document, attachment) referenced by one or more blocks. Assets are stored separately from content for efficient caching, resizing, and sync.

#### TypeScript Interface

```typescript
interface Asset {
  id: string;                      // UUIDv7
  workspaceId: string;
  fileName: string;                // Original filename
  fileSize: number;                // Bytes
  mimeType: string;                // e.g., 'image/png', 'application/pdf'
  extension: string;               // e.g., 'png', 'pdf'

  // Storage
  storageProvider: 'local' | 's3' | 'supabase';
  storageKey: string;              // Path/key in storage provider
  hash: string;                    // SHA-256 of file contents (deduplication)
  isProcessed: boolean;            // True after thumbnails/optimizations

  // Metadata
  width: number | null;            // For images
  height: number | null;           // For images
  duration: number | null;         // For video/audio (seconds)
  altText: string | null;
  caption: string | null;

  // Usage
  usedByBlockIds: string[];        // Denormalized reference count

  createdAt: number;
  updatedAt: number;
  version: number;
  deletedAt: number | null;
}
```

#### Required Properties
`id`, `workspaceId`, `fileName`, `fileSize`, `mimeType`, `storageProvider`, `storageKey`, `hash`, `createdAt`, `updatedAt`, `version`

#### Optional Properties
`extension`, `isProcessed`, `width`, `height`, `duration`, `altText`, `caption`, `usedByBlockIds`, `deletedAt`

#### Relationships
- **★→1 Workspace** (workspaceId)
- **★→★ Block** (via block type-specific content that references assetId)

#### Lifecycle
1. Uploaded → stored in local storage provider
2. Processed (thumbnails, optimizations generated)
3. Referenced by blocks (usedByBlockIds updated)
4. When all references removed, orphaned
5. Orphaned assets garbage-collected after 30 days
6. On sync, uploaded to remote storage provider

#### Future Scalability
- CDN integration for remote assets
- Lazy image loading with blur placeholder
- Image transformations (resize, crop, filter)
- Video transcoding
- Asset deduplication (same hash = one copy)

---

### 3.6 Tag

#### Purpose
Tags provide a flat, cross-cutting organization system independent of the folder hierarchy. A page can have multiple tags.

#### TypeScript Interface

```typescript
interface Tag {
  id: string;                      // UUIDv7
  workspaceId: string;
  name: string;                    // Display name
  color: string | null;            // Hex color for badge
  pageCount: number;               // Denormalized count

  createdAt: number;
  updatedAt: number;
  version: number;
  deletedAt: number | null;
}

interface PageTag {
  pageId: string;                  // References Page.id
  tagId: string;                   // References Tag.id
  createdAt: number;               // When the tag was applied
}

// Primary key: (pageId, tagId)
```

#### Required Properties
Tag: `id`, `workspaceId`, `name`, `createdAt`, `updatedAt`, `version`
PageTag: `pageId`, `tagId`, `createdAt`

#### Optional Properties
Tag: `color`, `pageCount`, `deletedAt`

#### Relationships
- **★→1 Workspace** (workspaceId)
- **★→★ Page** (via PageTag junction)

#### Lifecycle
1. Created by user (named and optionally colored)
2. Applied to pages (PageTag rows created)
3. Renamed (all pages keep the tag under new name)
4. Deleted → all PageTag rows cascade-deleted
5. Merged into another tag (A→B merge: all PageTag(A) → PageTag(B))

#### Future Scalability
- Tag hierarchy (parent/child tags)
- Tag groups/namespaces
- Auto-tagging via AI
- Tag-based page automation (e.g., "all pages tagged 'meeting' get archived after 30 days")

---

### 3.7 Plugin

#### Purpose
A plugin registers a block type with the editor. Plugins define how a block renders, serializes, parses, and behaves. The plugin entity stores configuration and metadata.

#### TypeScript Interface

```typescript
interface Plugin {
  id: string;                      // Plugin identifier (e.g., 'paragraph', 'mermaid')
  name: string;                    // Display name
  version: string;                 // Semver
  description: string;
  author: string;

  // Capabilities
  blockTypes: string[];            // Block types this plugin handles
  providesParser: boolean;         // Can parse this type from Markdown
  providesSerializer: boolean;     // Can serialize this type to Markdown
  providesSettings: boolean;       // Has settings UI
  isBuiltIn: boolean;              // Bundled with Atlas vs. user-installed

  // Configuration (per-workspace)
  config: Record<string, unknown>;

  // Runtime
  enabled: boolean;
  loadPriority: number;            // Lower = loads first

  createdAt: number;
  updatedAt: number;
}
```

#### Required Properties
`id`, `name`, `version`, `description`, `author`, `blockTypes`, `enabled`, `createdAt`, `updatedAt`

#### Optional Properties
`providesParser`, `providesSerializer`, `providesSettings`, `isBuiltIn`, `config`, `loadPriority`

#### Relationships
- **1→★ Block** (blocks with matching type reference this plugin)
- **1→★ PluginSetting** (per-workspace plugin configurations)

#### Lifecycle
1. Bundled or installed
2. Enabled/disabled per workspace
3. Configured via settings
4. Updated (new version replaces old)
5. Uninstalled (blocks of this type show fallback rendering)

#### Future Scalability
- Plugin marketplace
- Plugin permissions
- Plugin isolation (sandboxed iframe rendering)
- Plugin auto-updates

---

### 3.8 Command

#### Purpose
A command is a user-actionable operation. Every UI action in Atlas is backed by a command. Commands can be bound to keyboard shortcuts, triggered from the command palette, and recorded in history.

#### TypeScript Interface

```typescript
interface Command {
  id: string;                      // Namespaced identifier (e.g., 'editor:bold', 'page:create')
  name: string;                    // Human-readable name
  description: string;
  category: string;                // 'editor' | 'page' | 'workspace' | 'navigation' | 'view'

  // Keyboard shortcut
  defaultShortcut: string | null;  // e.g., 'Mod+B', 'Mod+Shift+N'
  userShortcut: string | null;     // User override

  // Context
  contexts: string[];              // Where this command is available
  enabled: boolean;                // Can be disabled by user

  // History
  supportsUndo: boolean;           // Can this command be undone?

  createdAt: number;
  updatedAt: number;
}
```

#### Required Properties
`id`, `name`, `description`, `category`, `contexts`, `createdAt`, `updatedAt`

#### Optional Properties
`defaultShortcut`, `userShortcut`, `supportsUndo`

#### Relationships
- Commands are logic, not data — they reference entities but are not stored as database rows in the traditional sense. This interface describes the metadata that powers the command palette and settings UI.

#### Lifecycle
1. Registered by core or plugins at startup
2. Keyboard shortcut customized by user
3. Disabled by user (removed from palette)
4. Removed when plugin uninstalled

#### Future Scalability
- Command macros (sequences of commands)
- Command history and analytics
- Custom user commands

---

### 3.9 Document (Internal Model)

#### Purpose
The Document is a runtime, in-memory representation of a page's full block tree. It is not stored as a single entity but is reconstructed from Block rows on page load. It provides the editor with a materialized view of the page.

#### TypeScript Interface

```typescript
interface Document {
  page: Page;
  blocks: Map<string, Block>;      // All blocks indexed by ID
  rootBlock: Block;                 // The root block of the tree
  dirtyBlocks: Set<string>;        // Blocks modified since last save
  loadedAt: number;
  lastSavedAt: number;
  isSaving: boolean;
}
```

#### Required Properties
`page`, `blocks`, `rootBlock`, `loadedAt`

#### Optional Properties
`dirtyBlocks`, `lastSavedAt`, `isSaving`

#### Relationships
- **1→1 Page** — each document represents one page
- **1→★ Block** — the blocks that compose the document

#### Lifecycle
1. Created when user opens a page
2. Blocks are loaded from storage and materialized into tree
3. User edits blocks — edits tracked via dirtyBlocks
4. Auto-save timer flushes dirty blocks to storage
5. On page close, document is disposed

#### Future Scalability
- Lazy loading (only load blocks in viewport)
- Collaborative document (WebSocket sync of block changes)
- Document snapshots for crash recovery

---

### 3.10 Selection

#### Purpose
Selection represents the user's current cursor position or text selection within the editor. It is a runtime-only entity — never persisted.

#### TypeScript Interface

```typescript
interface Selection {
  type: 'cursor' | 'range' | 'block';
  anchorBlockId: string;           // Start block
  anchorOffset: number;            // Character offset within anchor block
  focusBlockId: string;            // End block (same as anchor for cursor)
  focusOffset: number;             // Character offset within focus block
  selectedBlockIds: string[];      // For multi-block selection
}
```

#### Required Properties
`type`, `anchorBlockId`, `anchorOffset`, `focusBlockId`, `focusOffset`, `selectedBlockIds`

#### Relationships
- Runtime-only. Not persisted. Used by editor and commands.

---

### 3.11 History (Operation Stack)

#### Purpose
The History stack records all user operations for undo/redo. Each entry stores the inverse of an operation. This is a runtime data structure, not a persisted table.

#### TypeScript Interface

```typescript
interface HistoryEntry {
  id: string;                      // UUIDv7
  type: 'single' | 'group';       // Single operation or merged group
  label: string;                   // Display label (e.g., "Typing", "Bold")
  timestamp: number;

  // Inverse operations
  operations: HistoryOperation[];
}

interface HistoryOperation {
  entityType: string;              // 'block' | 'page' | 'folder'
  entityId: string;
  field: string;                   // The field that changed
  previousValue: unknown;          // Value before the change
  currentValue: unknown;           // Value after the change
}

interface HistoryState {
  stack: HistoryEntry[];
  pointer: number;                 // Current position (-1 = initial state)
  maxSize: number;                 // Maximum entries (configurable)
}
```

#### Required Properties
HistoryEntry: `id`, `type`, `timestamp`, `operations`
HistoryOperation: `entityType`, `entityId`, `field`, `previousValue`, `currentValue`

#### Optional Properties
HistoryEntry: `label`

#### Relationships
- Runtime-only. Used by core/history module. Not persisted (future: session persistence).

#### Future Scalability
- Persisted undo history (undo after app restart)
- Collaborative undo (undo across users)
- Visual history timeline

---

### 3.12 Revision

#### Purpose
A revision captures the complete state of a page at a point in time. Revisions enable version history, time travel, and change comparison.

#### TypeScript Interface

```typescript
interface Revision {
  id: string;                      // UUIDv7
  pageId: string;
  revisionNumber: number;          // Monotonic, per-page
  label: string | null;            // User-provided label
  description: string | null;      // Auto-generated or user-written

  // Snapshot
  snapshotType: 'full' | 'incremental';
  blockSnapshots: BlockSnapshot[]; // Full block data at this revision
  pageSnapshot: {                  // Page metadata at this revision
    title: string;
    icon: string | null;
    folderId: string | null;
  };

  // Metadata
  createdBy: 'user' | 'system' | 'sync';
  autoGenerated: boolean;          // True if system-created (not user-saved)

  createdAt: number;
}

interface BlockSnapshot {
  id: string;
  type: string;
  parentId: string | null;
  children: string[];
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  formats: InlineFormat[];
  position: number;
}
```

#### Required Properties
`id`, `pageId`, `revisionNumber`, `snapshotType`, `blockSnapshots`, `pageSnapshot`, `createdAt`

#### Optional Properties
`label`, `description`, `createdBy`, `autoGenerated`

#### Relationships
- **★→1 Page** (pageId)

#### Lifecycle
1. Created automatically on significant edits (debounced) or manually by user
2. Labeled by user (e.g., "Before major rewrite")
3. Browsed in version history UI
4. Compared (diff between two revisions)
5. Restored (page reverted to revision state)
6. Old revisions pruned per retention policy

#### Future Scalability
- Revision diffing (show what changed between revisions)
- Revision comments
- AI-generated revision summaries ("This revision adds a section on..."
- Branching revisions (experimental page variants)
- Storage-efficient snapshots (incremental, content-addressable)

---

### 3.13 Theme

#### Purpose
A theme defines the visual appearance of Atlas. It is a collection of CSS variable overrides. Users can have one active theme.

#### TypeScript Interface

```typescript
interface Theme {
  id: string;                      // UUIDv7
  name: string;                    // Display name
  isBuiltIn: boolean;              // Bundled vs. custom
  type: 'light' | 'dark';

  // CSS variable overrides
  colors: Record<string, string>;  // CSS variable name → value (e.g., '--primary': '240 5.9% 10%')
  fonts: {
    sans: string;                  // Font family stack
    mono: string;                  // Monospace font family stack
  };
  radius: string;                  // Border radius scale

  // Metadata
  author: string | null;
  version: string;

  createdAt: number;
  updatedAt: number;
}

interface UserThemePreference {
  userId: string;                  // User identifier (for multi-user future)
  workspaceId: string;
  themeId: string;                 // Active theme
  mode: 'light' | 'dark' | 'system';
  lastChangedAt: number;
}
```

#### Required Properties
Theme: `id`, `name`, `isBuiltIn`, `type`, `colors`, `fonts`, `radius`, `version`, `createdAt`, `updatedAt`
UserThemePreference: `userId`, `workspaceId`, `themeId`, `mode`, `lastChangedAt`

#### Optional Properties
Theme: `author`

#### Relationships
- **★→1 User** (via UserThemePreference)
- **★→1 Workspace** (via UserThemePreference)

#### Lifecycle
1. Bundled with Atlas or created by user
2. Activated (applied to UI)
3. Edited (color overrides modified)
4. Deleted (user-created themes only)

#### Future Scalability
- Theme marketplace
- Auto dark/light switching based on time
- Per-workspace themes
- Accessibility themes (high contrast, large type)
- Theme sync across devices

---

### 3.14 User Preferences

#### Purpose
User preferences store per-user, per-workspace settings for the Atlas experience.

#### TypeScript Interface

```typescript
interface UserPreferences {
  // Identification
  localUserId: string;             // Generated on first launch (before auth)
  authenticatedUserId: string | null;

  // Profile
  displayName: string;
  email: string | null;
  avatarUrl: string | null;

  // Editor
  editor: {
    fontFamily: 'sans' | 'mono';
    fontSize: 'small' | 'medium' | 'large';
    lineHeight: 'compact' | 'normal' | 'relaxed';
    maxWidth: 'narrow' | 'medium' | 'wide' | 'full';
    showLineNumbers: boolean;
    spellCheck: boolean;
    autoFormat: boolean;
  };

  // Sidebar
  sidebar: {
    collapsed: boolean;
    sectionOrder: string[];
    expandedSections: Record<string, boolean>;
    width: number;
  };

  // Search
  recentSearches: string[];        // Last 10 searches

  // Privacy
  analyticsEnabled: boolean;
  aiFeaturesEnabled: boolean;

  createdAt: number;
  updatedAt: number;
  version: number;
}
```

#### Required Properties
`localUserId`, `displayName`, `editor`, `sidebar`, `createdAt`, `updatedAt`, `version`

#### Optional Properties
`authenticatedUserId`, `email`, `avatarUrl`, `recentSearches`, `analyticsEnabled`, `aiFeaturesEnabled`

#### Relationships
- **1→1 User** (when authenticated)
- **1→★ Workspace** (via preferences per workspace)

#### Lifecycle
1. Created with default values on first launch
2. Modified through settings UI
3. Synced to cloud (when authenticated)
4. Reset to defaults

#### Future Scalability
- Per-workspace preferences override
- Preferences sync across devices
- Export/import preferences
- Keyboard shortcut customization

---

### 3.15 Search Index

#### Purpose
The search index is a denormalized data structure optimized for full-text search. It is rebuilt from blocks and pages and stored in IndexedDB for instant local search.

#### TypeScript Interface

```typescript
interface SearchIndexEntry {
  id: string;                      // `${entityType}:${entityId}`
  entityType: 'page' | 'block' | 'folder' | 'tag';
  entityId: string;
  workspaceId: string;
  pageId: string | null;           // Null for pages themselves

  // Indexed content
  title: string;                   // Page title or block preview
  text: string;                    // Full plain text of the entity
  snippet: string;                 // Truncated preview (200 chars)

  // Weights (for ranking)
  titleWeight: number;             // Title match = highest
  headingWeight: number;           // Heading match = high
  textWeight: number;              // Body text match = medium
  tagWeight: number;               // Tag match = low

  // Metadata for display
  icon: string | null;
  breadcrumb: string;              // Hierarchical path for display
  lastEditedAt: number;

  indexedAt: number;               // When this entry was indexed
}

interface SearchQuery {
  text: string;
  workspaceId: string | null;      // Scope to workspace
  pageId: string | null;           // Scope to page
  entityTypes: string[];           // Filter by type
  tags: string[];                  // Filter by tag
  limit: number;
  offset: number;
}

interface SearchResult {
  entry: SearchIndexEntry;
  score: number;                   // Relevance score (0–1)
  highlights: {                    // Text ranges to highlight
    field: 'title' | 'text' | 'snippet';
    start: number;
    end: number;
  }[];
}
```

#### Required Properties
SearchIndexEntry: `id`, `entityType`, `entityId`, `workspaceId`, `title`, `text`, `snippet`, `titleWeight`, `headingWeight`, `textWeight`, `lastEditedAt`, `indexedAt`

#### Optional Properties
`pageId`, `icon`, `breadcrumb`, `tagWeight`

#### Relationships
- This is a computed index. It is derived from Page, Block, Folder, and Tag entities. It is rebuilt when those entities change.

#### Lifecycle
1. Built on workspace load (full reindex)
2. Updated incrementally when pages/blocks change
3. Invalidated and rebuilt when search settings change
4. Cleared when workspace is deleted

#### Future Scalability
- Inverted index for full-text search
- Semantic search via embeddings (future)
- Search query suggestions
- Search filters UI
- Search history

---

### 3.16 AI Metadata

#### Purpose
AI metadata stores the results of AI operations on blocks. AI reads block content and writes structured data back. It never modifies the block's content directly.

#### TypeScript Interface

```typescript
interface AIMetadata {
  id: string;                      // UUIDv7
  workspaceId: string;
  pageId: string;
  blockId: string;                 // The block this AI data refers to
  sourceBlockVersion: number;      // The block.version when AI ran (detect staleness)

  // Operation
  operation: 'summarize' | 'improve' | 'translate' | 'explain' |
             'generate_tags' | 'extract_actions' | 'answer' | 'custom';
  model: string;                   // e.g., 'gpt-4o', 'claude-3-opus'
  prompt: string | null;           // The prompt used

  // Result
  output: string;                  // AI-generated text
  structured: Record<string, unknown> | null; // Structured output (e.g., tags array)

  // Confidence
  confidence: number | null;       // 0–1

  // Status
  status: 'pending' | 'completed' | 'failed';
  error: string | null;
  processingTimeMs: number | null;

  createdAt: number;
  updatedAt: number;
}
```

#### Required Properties
`id`, `workspaceId`, `pageId`, `blockId`, `sourceBlockVersion`, `operation`, `model`, `output`, `status`, `createdAt`, `updatedAt`

#### Optional Properties
`prompt`, `structured`, `confidence`, `error`, `processingTimeMs`

#### Relationships
- **★→1 Block** (blockId) — AI data is always attached to a specific block
- **★→1 Page** (pageId)

#### Lifecycle
1. User triggers AI operation on a block (or selection)
2. AI metadata record created with status 'pending'
3. AI processes and updates record to 'completed' (or 'failed')
4. If source block changes (version mismatch), AI data is flagged as stale
5. User can regenerate (creates new record, does not delete old)
6. Old AI metadata is pruned per retention policy

#### Future Scalability
- AI operation chaining (output of one op → input of another)
- AI metadata on selections (block ID + offset range)
- AI model management (switch models per operation type)
- AI streaming (real-time output updates)
- AI settings (max tokens, temperature, system prompts)

---

### 3.17 Relationship

#### Purpose
Relationships define explicit links between pages. Unlike inline links (which are embedded in block content), relationship entities are queryable, filterable, and bidirectional.

#### TypeScript Interface

```typescript
interface Relationship {
  id: string;                      // UUIDv7
  workspaceId: string;
  sourcePageId: string;            // The page that defines the relationship
  targetPageId: string;            // The related page
  sourceBlockId: string | null;    // Optional: specific block that defines the link

  type: 'reference' |             // Page A references Page B
        'parent' |                // Page A is parent of Page B
        'child' |                 // Page A is child of Page B
        'related' |               // Bidirectional relation
        'custom';                 // User-defined type
  customType: string | null;       // Custom type label

  // Display
  label: string | null;            // Display label (e.g., "See also")
  order: number;                   // Display order

  createdAt: number;
  updatedAt: number;
  version: number;
  deletedAt: number | null;
}

// Inverse lookup — efficiently find all pages related to a page
interface RelationshipIndex {
  pageId: string;
  relatedPageIds: string[];
  relationshipTypes: Record<string, string[]>; // type → pageId[]
  lastUpdated: number;
}
```

#### Required Properties
`id`, `workspaceId`, `sourcePageId`, `targetPageId`, `type`, `createdAt`, `updatedAt`, `version`

#### Optional Properties
`sourceBlockId`, `customType`, `label`, `order`, `deletedAt`

#### Relationships
- **★→1 Page** (sourcePageId) — source page
- **★→1 Page** (targetPageId) — target page
- **★→1 Block** (sourceBlockId) — optional block-level source

#### Lifecycle
1. Created by user (manually or via inline link → auto-relationship)
2. Updated (type changed)
3. Deleted (relationship removed, not the pages)
4. Inverse automatically maintained (graph is bidirectional)

#### Future Scalability
- Graph view (visualize page relationships)
- Relationship-based recommendations
- Relationship propagation (B follows A, C follows A → suggest C follow B)
- Relationship types for knowledge management (prerequisite, supersedes, contradicts)
- Block-level relationships (specific content links to specific content)

---

### 3.18 Bookmark

#### Purpose
Bookmarks are user-saved shortcuts to pages for quick access. They are separate from favorites (which are a page-level boolean).

#### TypeScript Interface

```typescript
interface Bookmark {
  id: string;                      // UUIDv7
  userId: string;                  // User identifier
  workspaceId: string;
  pageId: string;

  // Organization
  group: string | null;            // User-defined group (e.g., "Research", "TODO")
  order: number;                   // Display order within group

  // Display
  label: string | null;            // Custom label (defaults to page title)

  createdAt: number;
  updatedAt: number;
}
```

#### Required Properties
`id`, `userId`, `workspaceId`, `pageId`, `createdAt`, `updatedAt`

#### Optional Properties
`group`, `order`, `label`

#### Relationships
- **★→1 Page** (pageId)
- **★→1 User** (userId)

#### Lifecycle
1. Created by user (bookmark a page)
2. Organized into groups
3. Reordered within group
4. Deleted (bookmark removed, page unchanged)

#### Future Scalability
- Bookmark sync across devices
- Shared bookmarks (workspace-wide)
- Bookmark groups with nested structure
- Recent bookmarks in sidebar

---

### 3.19 Recent Pages

#### Purpose
Recent pages track the user's navigation history within a workspace. Unlike bookmarks (which are manual), recent pages are automatically recorded.

#### TypeScript Interface

```typescript
interface RecentPage {
  id: string;                      // UUIDv7
  userId: string;
  workspaceId: string;
  pageId: string;

  lastOpenedAt: number;            // When the page was last accessed
  openCount: number;               // Total times opened

  createdAt: number;               // First time opened
  updatedAt: number;
}
```

#### Required Properties
`id`, `userId`, `workspaceId`, `pageId`, `lastOpenedAt`, `openCount`, `createdAt`, `updatedAt`

#### Optional Properties
None

#### Relationships
- **★→1 Page** (pageId)

#### Lifecycle
1. Created when user opens a page for the first time
2. Updated on each subsequent open (lastOpenedAt, openCount)
3. Pruned when count exceeds limit (configurable, default 50)
4. Deleted when user clears history

#### Future Scalability
- Time-based recent (today, yesterday, this week)
- Recency + frequency ranking
- Workspace-switch resets recent scope

---

### 3.20 Favorites

#### Purpose
Favorites are user-starred pages for quick access. Unlike bookmarks, favorites are a lightweight flag on the Page entity itself.

#### TypeScript Interface

```typescript
// Favorites are stored as `isFavorite: boolean` on the Page entity.
// No separate entity is needed.

interface FavoriteIndex {
  userId: string;
  workspaceId: string;
  pageIds: string[];               // Ordered list of favorite page IDs
  lastUpdated: number;
}
```

#### Required Properties
N/A — handled by `Page.isFavorite` boolean.

#### Relationships
- Directly on the Page entity.

#### Lifecycle
1. User toggles star on a page → isFavorite flips
2. Favorites section shows all starred pages
3. Unstarring removes from favorites (page unchanged)

---

### 3.21 Trash

#### Purpose
Trash holds soft-deleted pages and folders. Items in trash can be restored or permanently deleted.

#### TypeScript Interface

```typescript
interface TrashItem {
  id: string;                      // UUIDv7 (same as original entity ID)
  entityType: 'page' | 'folder' | 'workspace';
  workspaceId: string;
  originalParentId: string | null; // Where it was before deletion

  // Snapshot of identifying info
  name: string;                    // Title or folder name
  icon: string | null;

  // Deletion
  deletedAt: number;               // When it was moved to trash
  expiresAt: number;               // Auto-delete after this date
  deletedBy: 'user' | 'system';

  // Restoration
  restoredAt: number | null;
}
```

#### Required Properties
`id`, `entityType`, `workspaceId`, `name`, `deletedAt`, `expiresAt`, `deletedBy`

#### Optional Properties
`icon`, `originalParentId`, `restoredAt`

#### Relationships
- **1→1 Page/Folder/Workspace** — the original entity (which has `deletedAt` set)

#### Lifecycle
1. Entity soft-deleted → TrashItem created
2. Entity visible in trash UI with restore/delete options
3. Restored → TrashItem removed, entity's deletedAt set to null (recursive for folders)
4. Expired → permanently deleted (entity + TrashItem removed, blocks cascade delete)
5. Manually emptied → same as expired

#### Future Scalability
- Trash retention policy (7 days, 30 days, never)
- Folder-restore recursion (restore folder restores all contents)
- Trash search
- Empty trash confirmation

---

## 4. Entity Relationship Diagram

```
Workspace 1 ────★ Folder          (workspaceId)
Workspace 1 ────★ Page            (workspaceId)
Workspace 1 ────★ Tag             (workspaceId)
Workspace 1 ────★ Asset           (workspaceId)
Workspace 1 ────★ SearchIndexEntry (workspaceId)

Folder ★ ────1 Workspace         (workspaceId)
Folder ★ ────1 Folder (parent)   (parentId, self-ref)
Folder 1 ────★ Folder (children)  (children[], self-ref)
Folder 1 ────★ Page              (folderId)

Page ★ ────1 Workspace           (workspaceId)
Page ★ ────1 Folder              (folderId, nullable)
Page 1 ────1 Block (root)        (rootBlockId)
Page 1 ────★ Block               (pageId)
Page 1 ────★ Revision            (pageId)
Page 1 ────★ AIMetadata          (pageId)
Page 1 ────★ Bookmark            (pageId)
Page 1 ────★ RecentPage          (pageId)
Page ★ ────★ Tag                 (via PageTag)
Page ★ ────★ Page                (via Relationship)

Block ★ ────1 Page               (pageId)
Block ★ ────1 Block (parent)     (parentId, self-ref)
Block 1 ────★ Block (children)    (children[], self-ref)
Block 1 ────★ AIMetadata         (blockId)

Tag ★ ────1 Workspace            (workspaceId)
Tag ★ ────★ Page                 (via PageTag)

Asset ★ ────1 Workspace          (workspaceId)
Asset ★ ────★ Block              (via content references)

Revision ★ ────1 Page            (pageId)

Relationship ★ ────1 Page (source) (sourcePageId)
Relationship ★ ────1 Page (target) (targetPageId)
Relationship ★ ────1 Block (source) (sourceBlockId, nullable)

AIMetadata ★ ────1 Block         (blockId)
AIMetadata ★ ────1 Page          (pageId)

Bookmark ★ ────1 Page            (pageId)
RecentPage ★ ────1 Page          (pageId)
```

---

## 5. Storage Architecture

### 5.1 Layers

```
┌──────────────────────────────────────────────┐
│              Application Modules              │
│  (workspace, folders, pages, settings, etc.)  │
├──────────────────────────────────────────────┤
│           Storage Provider Interface          │
│     get / set / delete / query / transaction  │
├────────────────────┬─────────────────────────┤
│   Local Provider   │    Remote Provider       │
│   (IndexedDB)      │    (Supabase / API)      │
├────────────────────┴─────────────────────────┤
│               Sync Engine                     │
│  Change tracking → Queue → Conflict resolve   │
└──────────────────────────────────────────────┘
```

### 5.2 IndexedDB Schema Design

| Store Name | Key Path | Indexes | Description |
|---|---|---|---|
| `workspaces` | `id` | `deletedAt` | Workspace entities |
| `folders` | `id` | `workspaceId`, `parentId`, `deletedAt` | Folder entities |
| `pages` | `id` | `workspaceId`, `folderId`, `deletedAt`, `updatedAt` | Page entities |
| `blocks` | `id` | `workspaceId`, `pageId`, `parentId`, `deletedAt`, `position` | Block entities |
| `assets` | `id` | `workspaceId`, `hash`, `deletedAt` | Asset entities |
| `tags` | `id` | `workspaceId`, `deletedAt` | Tag entities |
| `page_tags` | `[pageId, tagId]` | `tagId` | Page-Tag junction |
| `revisions` | `id` | `pageId` | Revision snapshots |
| `relationships` | `id` | `workspaceId`, `sourcePageId`, `targetPageId`, `deletedAt` | Page relationships |
| `ai_metadata` | `id` | `workspaceId`, `blockId`, `operation` | AI operation results |
| `search_index` | `id` | `workspaceId`, `entityType`, `text` (multi-entry) | Full-text search |
| `bookmarks` | `id` | `workspaceId`, `pageId` | User bookmarks |
| `recent_pages` | `id` | `workspaceId`, `lastOpenedAt` | Navigation history |
| `trash` | `id` | `workspaceId`, `expiresAt` | Deleted items index |
| `preferences` | `localUserId` | — | User preferences |
| `themes` | `id` | `isBuiltIn` | Theme definitions |

### 5.3 Query Patterns

```
// Get all pages in a folder (sorted)
pages.index('folderId').getAll(folderId)
  .sort((a, b) => b.updatedAt - a.updatedAt)

// Get all top-level blocks for a page
blocks.index('parentId').getAll(page.rootBlockId)
  .sort((a, b) => a.position - b.position)

// Full-text search
search_index.index('text').search(query)

// Get all tags for a page
page_tags.index('pageId').getAll(pageId)
  .then(join tags table)

// Get recent pages
recent_pages.index('lastOpenedAt')
  .getAll(range: [Date.now() - 30d, Date.now()])
  .sort(desc)

// Get all relationships for a page
relationships.index('sourcePageId').getAll(pageId)
  .concat(relationships.index('targetPageId').getAll(pageId))
```

### 5.4 Transaction Boundaries

```
// Operation: Create Page
1. BEGIN TRANSACTION
2. INSERT page
3. INSERT block (root)
4. INSERT search_index entries
5. COMMIT

// Operation: Move Folder
1. BEGIN TRANSACTION
2. UPDATE folder.parentId
3. COMMIT

// Operation: Trash Page
1. BEGIN TRANSACTION
2. UPDATE page.deletedAt = now
3. INSERT trash_item
4. COMMIT
```

---

## 6. Sync Architecture

### 6.1 Core Principles

1. **Local-first.** All operations succeed locally regardless of network state.
2. **Optimistic.** UI updates immediately; sync happens in the background.
3. **Versioned.** Every entity has a `version` counter. Sync uses version for change detection and conflict detection.
4. **Last-write-wins (LWW).** Default conflict resolution. If two devices modify the same field, the higher version wins.
5. **Extensible.** Different conflict strategies can be registered per entity type.

### 6.2 Change Tracking

```typescript
interface ChangeLogEntry {
  id: string;                      // UUIDv7
  entityType: string;              // 'page' | 'block' | 'folder'
  entityId: string;
  workspaceId: string;

  // Change
  operation: 'create' | 'update' | 'delete';
  changedFields: string[];         // Fields that were modified

  // Versioning
  oldVersion: number;              // Version before change
  newVersion: number;              // Version after change

  // Sync
  synced: boolean;                 // Has this been pushed to remote?
  syncedAt: number | null;

  // Device
  deviceId: string;                // Originating device

  createdAt: number;               // When the change occurred
}
```

### 6.3 Sync Flow

```
Local: User edits block
  → Update block in IndexedDB (increment version)
  → Append to ChangeLog (synced = false)
  → UI updates immediately

Sync Engine (background):
  → Query ChangeLog WHERE synced = false
  → Build changeset:
      { entityType, entityId, version, data, operation }
  → Push changeset to remote
  → Remote applies (LWW conflict resolution):
      if incoming.version > current.version: apply
      if incoming.version <= current.version: reject (already have newer)
  → Remote returns acknowledgment
  → Update ChangeLog: synced = true, syncedAt = now

Remote: Other device makes changes
  → Sync Engine pulls:
      GET /api/sync/changes?since={lastSyncTimestamp}
  → For each incoming change:
      if incoming.version > local.version:
        apply change to local IndexedDB
      if incoming.version <= local.version:
        // Conflict — LWW: keep local (higher version)
        // Or merge, depending on entity type
  → Update lastSyncTimestamp
```

### 6.4 Conflict Scenarios

| Scenario | Resolution |
|---|---|
| Same field, two devices | Higher version wins. Loser's change is stored in conflict log for review. |
| Different fields, same entity | Merge — both changes applied independently. |
| Device A deletes, Device B edits | Delete wins (version conflict: delete increments version). |
| Device A creates, Device B creates same ID | Second creator gets version bump and conflict notification. |
| Offline for 30 days | Changes merge per-field with LWW. No data loss — loser stored in conflict history. |

### 6.5 Offline Queue

```typescript
interface OfflineQueue {
  id: string;                      // UUIDv7
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;   // Full entity data
  version: number;
  retryCount: number;
  lastAttemptAt: number;
  createdAt: number;
}
```

---

## 7. Plugin System Data Model

### 7.1 Plugin Architecture

Each plugin:
1. **Registers** one or more block types with the plugin registry.
2. **Provides** a React component for rendering.
3. **Provides** a serializer for converting to Markdown/Mermaid.
4. **Provides** a parser for converting from Markdown.
5. **Provides** settings UI (optional).
6. **Stores** plugin-specific data in `Block.metadata`.

### 7.2 Plugin Registration

```typescript
interface PluginRegistration {
  type: string;                    // Block type identifier (e.g., 'mermaid')
  name: string;                    // Display name
  icon: string;                    // Lucide icon name

  // Rendering
  component: React.ComponentType<BlockRendererProps>;
  settingsComponent?: React.ComponentType<BlockSettingsProps>;

  // Serialization
  serialize: (block: Block, context: SerializeContext) => string;
  parse: (raw: string, context: ParseContext) => Partial<Block> | null;

  // Behavior
  allowChildren: boolean;          // Can this block contain child blocks?
  defaultContent: Record<string, unknown>;
  isVoid: boolean;                 // Self-closing (no children, no inline content)
  isInline: boolean;               // Inline within paragraph (rare)

  // Metadata
  metadataSchema: Record<string, unknown>; // JSON Schema for block.metadata
}
```

### 7.3 Plugin Metadata Storage

Plugins store data in two places:

1. **`Block.content`** — The primary content payload. Typed per plugin. This is what gets serialized and indexed.

2. **`Block.metadata`** — Plugin-specific metadata that modifies rendering or behavior but is not primary content. Examples:
   - `{ expanded: true }` for toggle blocks
   - `{ lineNumbers: true }` for code blocks
   - `{ caption: "..." }` for image blocks (alternative to dedicated field)

```typescript
// Example: Mermaid plugin stores diagram definition in content
const mermaidBlock: Block = {
  type: 'mermaid',
  content: {
    definition: 'graph TD\n  A-->B\n  A-->C',
    theme: 'default',
  },
  metadata: {
    autoRefresh: true,
    lastRenderedSvg: '<svg>...</svg>',  // Cached render
    renderError: null,
  },
};

// Example: Callout plugin
const calloutBlock: Block = {
  type: 'callout',
  content: {
    text: 'This is important',
    variant: 'warning',
  },
  metadata: {
    icon: 'alert-triangle',
    collapsible: true,
    collapsed: false,
  },
};
```

### 7.4 Plugin Versioning

Each block stores `pluginVersion` to track which version of the plugin created it. This enables:
- Migration of old blocks to new plugin versions
- Backward-compatible rendering
- Detection of stale plugin references

---

## 8. AI Metadata Model

### 8.1 How AI References Blocks

AI operations never receive raw text. They receive block IDs. The system:

1. User selects content (one or more blocks)
2. System sends the block IDs (not the text) to the AI service
3. AI service reads the block content via the storage interface
4. AI processes the content and writes results as `AIMetadata` records
5. Results are attached to the original block IDs

```
User: "Summarize this page"
  → System collects all block IDs on the page
  → Sends: { blocks: [block_abc, block_def, ...], operation: 'summarize' }
  → AI reads block content by IDs
  → AI returns summaries per block
  → System writes AIMetadata { blockId, operation: 'summarize', output: '...' }
```

### 8.2 AI Reference Stability

Because blocks have stable IDs:
- AI results survive reordering (block position changes, ID stays)
- AI results survive text edits (block ID stays, content changes — AI can detect staleness via `sourceBlockVersion`)
- AI can reference specific content even when the page is restructured

### 8.3 AI Metadata Lifecycle

```typescript
// AI metadata is always:
// 1. Attached to a specific block
// 2. Stale if block.version !== sourceBlockVersion
// 3. Replaceable (regenerate creates new record)
// 4. Queryable (find all AI summaries on this page)

// Example: Finding and using AI metadata
function getSummaries(pageId: string): AIMetadata[] {
  return db.ai_metadata
    .where({ pageId, operation: 'summarize' })
    .filter(m => m.status === 'completed' && !isStale(m))
    .toArray();
}

function isStale(meta: AIMetadata): boolean {
  const block = db.blocks.get(meta.blockId);
  return block.version !== meta.sourceBlockVersion;
}
```

---

## 9. Search Index Model

### 9.1 Indexing Strategy

| Entity | Indexed As | Weight |
|---|---|---|
| Page title | `SearchIndexEntry { title, text }` | titleWeight: 10 |
| Heading block | `SearchIndexEntry { text: heading_content }` | headingWeight: 5 |
| Paragraph block | `SearchIndexEntry { text: paragraph_content }` | textWeight: 1 |
| Code block | `SearchIndexEntry { text: code_content }` | textWeight: 0.5 |
| Tag name | `SearchIndexEntry { text: tag_name }` | tagWeight: 3 |

### 9.2 Incremental Indexing

```
On block create/update/delete:
  → Update search_index for that block

On page create/update/delete:
  → Update search_index for that page title

On tag rename:
  → Update all SearchIndexEntry for that tag
  → Or: delete and re-index tag's pages

Full reindex:
  → Clear search_index for workspace
  → Iterate all pages, blocks, tags
  → Rebuild search_index
```

### 9.3 Search Ranking Formula

```
score = (titleMatch * titleWeight +
         headingMatch * headingWeight +
         textMatch * textWeight +
         tagMatch * tagWeight) /
        (titleWeight + headingWeight + textWeight + tagWeight)

Where match = BM25(text, query) normalized to 0–1
```

---

## 10. Git Export Serialization

### 10.1 Export Format

Each workspace exports as a directory tree:

```
workspace-name/
├── .atlas/
│   ├── manifest.json              # Export metadata
│   ├── workspace.json             # Workspace metadata
│   ├── blocks/                    # Raw block data (JSON)
│   │   ├── block_abc123.json
│   │   └── block_def456.json
│   ├── relationships.json         # All page relationships
│   ├── tags.json                  # All tags
│   └── assets/                    # Asset metadata
│       └── asset_xyz789.json
├── assets/                        # Binary asset files
│   └── 2026/06/
│       └── photo.png
├── folders/                       # Folder structure mirrors pages
│   └── .folder                    # Empty marker file for empty folders
├── pages/
│   ├── my-page.md                 # Page exported as Markdown
│   └── another-page.md
└── README.md                      # Human-readable workspace overview
```

### 10.2 Page Markdown Serialization

```markdown
---
atlas-id: page_uuid_here
atlas-version: 5
atlas-exported-at: 2026-06-30T12:00:00Z
tags: [tag1, tag2]
icon: 🚀
folder: /path/to/folder
---

# Welcome to Atlas

This is a paragraph of text with **bold** and *italic* formatting.

- List item
- Another item

1. Ordered item
2. Another ordered item

> A block quote with attribution

| Column A | Column B |
|----------|----------|
| Data 1   | Data 2   |

```mermaid
graph TD
  A-->B
```

> [!warning] Callout
> This is a warning callout

- [x] Completed task
- [ ] Incomplete task

<!-- atlas:block block_uuid type=paragraph -->
<!-- atlas:block block_uuid type=heading level=2 -->
```

### 10.3 Block → Markdown Mapping

| Block Type | Markdown Representation |
|---|---|
| `paragraph` | Plain text |
| `heading` | `#`–`######` prefix |
| `bullet_list_item` | `- ` prefix |
| `ordered_list_item` | `1. ` prefix |
| `todo` | `- [x] ` or `- [ ] ` prefix |
| `code` | Fenced code block with language |
| `quote` | `> ` prefix |
| `callout` | `>[!type] ` prefix |
| `divider` | `---` |
| `image` | `![alt](path)` |
| `table` | GitHub-flavored Markdown table |
| `math` | `$$` block or `$` inline |
| `mermaid` | Fenced mermaid code block |
| `column_layout` | HTML div-based layout (or skipped in plain export) |

### 10.4 Import from Git

```
1. User opens .atlas directory
2. Atlas reads manifest.json
3. Atlas creates workspace (or detects existing by ID)
4. For each page/*.md:
   a. Parse frontmatter for metadata
   b. Parse Markdown content into blocks
   c. Create pages and blocks in local storage
   d. Restore relationships from relationships.json
5. Restore assets to asset storage
6. Rebuild search index
```

### 10.5 Round-Trip Fidelity

Not all features survive a Markdown round-trip. The `.atlas/` directory exists to preserve what Markdown cannot express:

| Feature | Markdown | `.atlas/` |
|---|---|---|
| Block IDs | In HTML comments | `blocks/*.json` |
| Column layout | HTML div | `blocks/*.json` |
| Relationship graph | — | `relationships.json` |
| AI metadata | — | `blocks/*.json` |
| Block version history | — | `blocks/*.json` |
| Custom plugin data | — | `blocks/*.json` |

---

## Appendix A: Versioning Strategy

| Entity | Version Field | Increment On | Used By |
|---|---|---|---|
| Workspace | `version` | Any field change | Sync |
| Folder | `version` | Any field change | Sync |
| Page | `version` | Title, icon, folder change | Sync, AI freshness |
| Block | `version` | Content, type, position, format change | Sync, AI freshness |
| Asset | `version` | Metadata change | Sync |
| Tag | `version` | Name, color change | Sync |

## Appendix B: Retention Policies

| Data | Retention | Configurable |
|---|---|---|
| Trash items | 30 days | Yes (7 / 30 / 90 / never) |
| Revisions | Last 100 | Yes |
| AI metadata | Last 10 per block | Yes |
| Recent pages | Last 50 | Yes |
| Search cache | Until reindex | No |
| Change log | Until synced | No |
| Offline queue | Until processed | No |

## Appendix C: Reserved Block Type IDs

These block types are built into Atlas. Custom plugins must use a namespaced ID (e.g., `plugin-author/block-name`).

| ID | Description | Has Children | Is Void |
|---|---|---|---|
| `paragraph` | Standard text paragraph | No | No |
| `heading` | Section heading (H1–H6) | No | No |
| `bullet_list_item` | Unordered list item | Yes | No |
| `ordered_list_item` | Ordered list item | Yes | No |
| `todo` | Checkbox task | No | No |
| `code` | Code block with syntax highlighting | No | No |
| `quote` | Block quote | Yes | No |
| `callout` | Colored callout box | Yes | No |
| `divider` | Horizontal rule | No | Yes |
| `image` | Embedded image | No | Yes |
| `video` | Embedded video | No | Yes |
| `file` | File attachment | No | Yes |
| `table` | Data table | No | No |
| `math` | LaTeX math block | No | No |
| `mermaid` | Mermaid diagram | No | No |
| `column_layout` | Multi-column container | Yes | No |
| `column` | Single column within layout | Yes | No |
| `toggle` | Collapsible content block | Yes | No |
| `link_preview` | URL link preview card | No | Yes |
| `bookmark` | Saved link with preview | No | Yes |
| `embed` | Iframe embed | No | Yes |

---

*This document is the canonical reference for the Atlas data model. No implementation code should be written without consulting this document first.*
