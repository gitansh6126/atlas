import { BaseRepository } from './base-repository'
import type { Block } from '@/core/editor/types'
import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'
import type { StorageProvider } from '@/core/storage/types'

export class BlockRepository extends BaseRepository<Block> {
  constructor(provider: StorageProvider) {
    super(provider, 'blocks')
  }

  async findByPage(pageId: string): Promise<Result<Block[], StorageError>> {
    return this.query([
      { field: 'pageId', operator: 'eq', value: pageId },
      { field: 'deletedAt', operator: 'eq', value: null },
    ])
  }

  async findByParent(parentId: string): Promise<Result<Block[], StorageError>> {
    return this.query([
      { field: 'parentId', operator: 'eq', value: parentId },
      { field: 'deletedAt', operator: 'eq', value: null },
    ])
  }
}
