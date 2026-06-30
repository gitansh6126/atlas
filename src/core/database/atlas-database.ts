import Dexie from 'dexie'
import type { Table } from 'dexie'
import { STORAGE_CONFIG } from '@/core/storage/config'
import type { Workspace, Folder, Page } from '@/core/types/domain'

export class AtlasDatabase extends Dexie {
  workspaces!: Table<Workspace, string>;
  folders!: Table<Folder, string>;
  pages!: Table<Page, string>;
  blocks!: Table<{ id: string }, string>;
  assets!: Table<{ id: string }, string>;
  tags!: Table<{ id: string }, string>;
  pageTags!: Table<{ pageId: string; tagId: string }, [string, string]>;
  revisions!: Table<{ id: string }, string>;
  relationships!: Table<{ id: string }, string>;
  aiMetadata!: Table<{ id: string }, string>;
  searchIndex!: Table<{ id: string }, string>;
  bookmarks!: Table<{ id: string }, string>;
  recentPages!: Table<{ id: string }, string>;
  trash!: Table<{ id: string }, string>;
  preferences!: Table<{ localUserId: string }, string>;
  themes!: Table<{ id: string }, string>;

  constructor() {
    super(STORAGE_CONFIG.databaseName)

    this.version(STORAGE_CONFIG.databaseVersion).stores({
      workspaces: 'id, deletedAt',
      folders: 'id, workspaceId, parentId, deletedAt',
      pages: 'id, workspaceId, folderId, deletedAt, updatedAt',
      blocks: 'id, workspaceId, pageId, parentId, deletedAt, position',
      assets: 'id, workspaceId, hash, deletedAt',
      tags: 'id, workspaceId, deletedAt',
      pageTags: '[pageId+tagId], tagId',
      revisions: 'id, pageId',
      relationships: 'id, workspaceId, sourcePageId, targetPageId, deletedAt',
      aiMetadata: 'id, workspaceId, blockId, operation',
      searchIndex: 'id, workspaceId, entityType',
      bookmarks: 'id, workspaceId, pageId',
      recentPages: 'id, workspaceId, lastOpenedAt',
      trash: 'id, workspaceId, expiresAt',
      preferences: 'localUserId',
      themes: 'id, isBuiltIn',
    })
  }
}

export const atlasDb = new AtlasDatabase()
