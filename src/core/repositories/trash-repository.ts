import type { StorageProvider } from '@/core/storage/types'
import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'
import type { Page, Folder } from '@/core/types/domain'

export interface TrashItem {
  id: string;
  entityType: 'page' | 'folder';
  workspaceId: string;
  originalParentId: string | null;
  name: string;
  icon: string | null;
  deletedAt: number;
}

export class TrashRepository {
  private provider: StorageProvider;

  constructor(provider: StorageProvider) {
    this.provider = provider
  }

  async getTrashItems(workspaceId: string): Promise<Result<TrashItem[], StorageError>> {
    const [pagesResult, foldersResult] = await Promise.all([
      this.provider.query<Page>('pages', [
        { field: 'workspaceId', operator: 'eq', value: workspaceId },
        { field: 'deletedAt', operator: 'neq', value: null },
      ]),
      this.provider.query<Folder>('folders', [
        { field: 'workspaceId', operator: 'eq', value: workspaceId },
        { field: 'deletedAt', operator: 'neq', value: null },
      ]),
    ])

    const items: TrashItem[] = []

    if (pagesResult.success) {
      for (const page of pagesResult.data) {
        items.push({
          id: page.id,
          entityType: 'page',
          workspaceId: page.workspaceId,
          originalParentId: page.folderId,
          name: page.title,
          icon: page.icon,
          deletedAt: page.deletedAt ?? Date.now(),
        })
      }
    }

    if (foldersResult.success) {
      for (const folder of foldersResult.data) {
        items.push({
          id: folder.id,
          entityType: 'folder',
          workspaceId: folder.workspaceId,
          originalParentId: folder.parentId,
          name: folder.name,
          icon: folder.icon,
          deletedAt: folder.deletedAt ?? Date.now(),
        })
      }
    }

    items.sort((a, b) => b.deletedAt - a.deletedAt)

    return { success: true, data: items }
  }

  async restore(id: string, entityType: 'page' | 'folder'): Promise<Result<void, StorageError>> {
    const tableName = entityType === 'page' ? 'pages' : 'folders'
    const result = await this.provider.update(tableName, id, { deletedAt: null } as Partial<Page | Folder>)
    if (!result.success) return result
    return { success: true, data: undefined }
  }

  async permanentlyDelete(id: string, entityType: 'page' | 'folder'): Promise<Result<void, StorageError>> {
    const tableName = entityType === 'page' ? 'pages' : 'folders'
    return this.provider.purge(tableName, id)
  }
}
