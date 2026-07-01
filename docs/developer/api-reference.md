# API Reference

This document provides a reference for the key interfaces, types, and APIs used in Atlas.

---

## Core Types

### Block

```typescript
interface Block {
  id: string
  workspaceId: string
  pageId: string
  parentId: string | null
  children: string[]
  type: string
  pluginVersion: string
  content: Record<string, unknown>
  metadata: Record<string, unknown>
  formats: InlineFormat[]
  position: number
  plainText: string
  wordCount: number
  charCount: number
  createdAt: number
  updatedAt: number
  version: number
  deletedAt: number | null
}
```

### RenderNode

```typescript
interface RenderNode {
  blockId: string
  type: string
  depth: number
  props: Record<string, unknown>
  children: RenderNode[]
}
```

### Selection

```typescript
interface Selection {
  type: 'cursor' | 'range' | 'block'
  anchorBlockId: string
  anchorOffset: number
  focusBlockId: string
  focusOffset: number
  selectedBlockIds: string[]
}
```

### InlineFormat

```typescript
interface InlineFormat {
  start: number
  end: number
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'link' | 'highlight' | 'color'
  value: string | null
}
```

## Block Plugin

```typescript
interface BlockPlugin {
  type: string
  name: string
  version: string
  render: (block: Block, children: RenderNode[], document: DocumentModel) => RenderNode
  validate?: (block: Block) => string[]
}
```

## Command

```typescript
interface Command<T, R = unknown> {
  id: string
  execute: (payload: T) => Promise<CommandResult<R>>
  undo?: () => Promise<void>
  redo?: () => Promise<void>
}

interface CommandResult<T> {
  success: boolean
  data?: T
  error?: string
}
```

## EditorController

The main controller for document operations:

```typescript
class EditorController {
  openDocument(pageId: string, workspaceId: string): Promise<void>
  closeDocument(): Promise<void>
  saveDocument(): Promise<void>
  
  getBlock(blockId: string): Block | undefined
  getRenderTree(): RenderNode[]
  
  insertBlockAfter(blockId: string, type: string): Promise<Block | null>
  insertBlock(type: string, parentId?: string, position?: number): Promise<Block | null>
  deleteBlock(blockId: string): boolean
  duplicateBlock(blockId: string): Block | null
  moveBlock(blockId: string, newParentId: string, position?: number): Block | null
  
  updateBlockContent(blockId: string, content: Record<string, unknown>): void
  updateBlockMetadata(blockId: string, metadata: Record<string, unknown>): void
  
  convertBlock(blockId: string, newType: string): Block | null
  
  focusBlock(blockId: string, offset?: number): void
  selectBlock(blockId: string): void
  
  undo(): Promise<boolean>
  redo(): Promise<boolean>
  
  getSelectedBlockIds(): string[]
  
  copyBlock(blockId: string): void
  cutBlock(blockId: string): void
  pasteBlockAfter(blockId: string): void
}
```

## DocumentModel

```typescript
class DocumentModel {
  getBlock(id: string): Block | undefined
  getBlocks(): Map<string, Block>
  getRootBlock(): Block | undefined
  getDirtyBlocks(): Set<string>
  
  addBlock(block: Block): void
  removeBlock(id: string): void
  updateBlock(id: string, updates: Partial<Block>): void
  
  markAllClean(): void
  isDirty(): boolean
  isSaving(): boolean
  getLastSavedAt(): number
}
```

## Zustand Stores

### WorkspaceStore

```typescript
interface WorkspaceStore {
  currentWorkspaceId: string | null
  setCurrentWorkspace: (id: string) => void
  // ...
}
```

### SidebarStore

```typescript
interface SidebarStore {
  collapsed: boolean
  mode: 'fixed' | 'variable'
  width: number
  toggleSidebar: () => void
  setMode: (mode: 'fixed' | 'variable') => void
  setWidth: (width: number) => void
}
```

## Constants

### Block Types

```typescript
const BLOCK_TYPE_ROOT = 'root'
const BLOCK_TYPE_PARAGRAPH = 'paragraph'
const BLOCK_TYPE_HEADING = 'heading'
const BLOCK_TYPE_DIVIDER = 'divider'
const BLOCK_TYPE_GRID = 'grid'
const BLOCK_TYPE_LIST = 'list'
const BLOCK_TYPE_CARD = 'card'
const BLOCK_TYPE_GALLERY = 'gallery'
const BLOCK_TYPE_KANBAN = 'kanban'
const BLOCK_TYPE_CALENDAR = 'calendar'
const BLOCK_TYPE_LABEL = 'label'
const BLOCK_TYPE_TAG = 'tag'
const BLOCK_TYPE_HTML_EMBED = 'html_embed'
```

## Related Documentation

- [Editor](editor.md) - Core editor architecture
- [Block System](block-system.md) - Block types and plugins
- [Commands](commands.md) - Command pattern implementation