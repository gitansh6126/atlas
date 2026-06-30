import { BaseRepository } from './base-repository'
import type { Workspace } from '@/core/types/domain'
import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'
import type { StorageProvider } from '@/core/storage/types'

export class WorkspaceRepository extends BaseRepository<Workspace> {
  constructor(provider: StorageProvider) {
    super(provider, 'workspaces')
  }

  async findByName(name: string): Promise<Result<Workspace | null, StorageError>> {
    const result = await this.query([{ field: 'name', operator: 'eq', value: name }])
    if (!result.success) {
      return result
    }
    return { success: true, data: result.data[0] ?? null }
  }

  async findAllActive(): Promise<Result<Workspace[], StorageError>> {
    const result = await this.findAll()
    if (!result.success) {
      return result
    }
    return {
      success: true,
      data: result.data.filter((w) => w.deletedAt === null),
    }
  }
}
