# Storage System

Atlas uses an abstracted storage layer that supports multiple backends while maintaining an offline-first approach.

---

## Overview

The storage system is built around the principle that UI components never interact directly with storage APIs. All storage operations go through an abstract interface, allowing seamless swapping between different backends.

## Storage Architecture

```
Atlas App
   |
   v
StorageProvider (Interface)
   |
   +-- LocalStorageProvider
   +-- IndexedDBProvider (Dexie)
   +-- SupabaseProvider
   +-- GitHubProvider
```

## Storage Interface

```typescript
interface StorageProvider {
  // Pages
  getPage(id: string): Promise<Page | null>
  getPages(workspaceId: string): Promise<Page[]>
  savePage(page: Page): Promise<void>
  deletePage(id: string): Promise<void
  // Blocks
  getBlock(id: string): Promise<Block | null>
  getBlocksByPage(pageId: string): Promise<Block[]>
  saveBlock(block: Block): Promise<void>
  deleteBlock(id: string): Promise<void>
  // Workspaces
  getWorkspace(id: string): Promise<Workspace | null>
  getAllWorkspaces(): Promise<Workspace[]>
  saveWorkspace(workspace: Workspace): Promise<void>
  deleteWorkspace(id: string): Promise<void>
  // Export
  export(): Promise<Blob>
  import(blob: Blob): Promise<void>
}
```

## IndexedDB Provider (Default)

Dexie.js powers the default IndexedDB adapter:

```typescript
import Dexie from 'dexie'

class AtlasDatabase extends Dexie {
  workspaces!: Table<Workspace>
  pages!: Table<Page>
  blocks!: Table<Block>

  constructor() {
    super('AtlasDB')
    this.version(1).stores({
      workspaces: 'id, name, createdAt',
      pages: 'id, workspaceId, folderId, title, updatedAt',
      blocks: 'id, pageId, type, parentId, position',
    })
  }
}
```

### Performance Optimizations

- All reads use IndexedDB indexes
- Batch writes for bulk operations
- Lazy loading for large documents
- Compression for block content (future)

## Offline-First Strategy

1. All data is stored locally first
2. Background sync when network is available
3. Conflict resolution using timestamps
4. Graceful degradation if sync fails

## Migration

When the schema changes, a migration runs automatically:

```typescript
interface Migration {
  version: number
  description: string
  up: (db: AtlasDatabase) => Promise<void>
}
```

## Future Providers

- **Supabase** — real-time sync, collaboration
- **GitHub** — version control for documents
- **S3** — binary asset storage
- **IPFS** — decentralized storage

## Best Practices

1. Never access storage directly from components
2. Always handle storage errors gracefully
3. Show loading states for storage operations
4. Implement retry logic for failed operations
5. Keep transaction scope minimal

## Related Documentation

- [State Management](state-management.md) — Zustand stores and persistence
- [Performance](performance.md) — Storage optimization strategies