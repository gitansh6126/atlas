import { BaseRepository } from './base-repository'
import type { Page } from '@/core/types/domain'
import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'
import type { StorageProvider } from '@/core/storage/types'

export class PageRepository extends BaseRepository<Page> {
  constructor(provider: StorageProvider) {
    super(provider, 'pages')
  }

  async findByWorkspace(workspaceId: string): Promise<Result<Page[], StorageError>> {
    return this.query([
      { field: 'workspaceId', operator: 'eq', value: workspaceId },
      { field: 'deletedAt', operator: 'eq', value: null },
    ])
  }

  async findByFolder(folderId: string): Promise<Result<Page[], StorageError>> {
    return this.query([
      { field: 'folderId', operator: 'eq', value: folderId },
      { field: 'deletedAt', operator: 'eq', value: null },
    ])
  }

  async findFavorites(workspaceId: string): Promise<Result<Page[], StorageError>> {
    return this.query([
      { field: 'workspaceId', operator: 'eq', value: workspaceId },
      { field: 'isFavorite', operator: 'eq', value: true },
      { field: 'deletedAt', operator: 'eq', value: null },
    ])
  }
}
