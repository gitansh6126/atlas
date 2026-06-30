import { BaseRepository } from './base-repository'
import type { Folder } from '@/core/types/domain'
import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'
import type { StorageProvider } from '@/core/storage/types'

export class FolderRepository extends BaseRepository<Folder> {
  constructor(provider: StorageProvider) {
    super(provider, 'folders')
  }

  async findByWorkspace(workspaceId: string): Promise<Result<Folder[], StorageError>> {
    return this.query([
      { field: 'workspaceId', operator: 'eq', value: workspaceId },
      { field: 'deletedAt', operator: 'eq', value: null },
    ])
  }

  async findByParent(parentId: string): Promise<Result<Folder[], StorageError>> {
    return this.query([
      { field: 'parentId', operator: 'eq', value: parentId },
      { field: 'deletedAt', operator: 'eq', value: null },
    ])
  }

  async findRootFolders(workspaceId: string): Promise<Result<Folder[], StorageError>> {
    return this.query([
      { field: 'workspaceId', operator: 'eq', value: workspaceId },
      { field: 'parentId', operator: 'eq', value: null },
      { field: 'deletedAt', operator: 'eq', value: null },
    ])
  }
}
