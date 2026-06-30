import type { StorageProvider, Query } from '@/core/storage/types'
import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'

export abstract class BaseRepository<T extends { id: string }> {
  protected provider: StorageProvider;
  protected entityType: string;

  constructor(provider: StorageProvider, entityType: string) {
    this.provider = provider
    this.entityType = entityType
  }

  async findById(id: string): Promise<Result<T, StorageError>> {
    return this.provider.get<T>(this.entityType, id)
  }

  async findAll(): Promise<Result<T[], StorageError>> {
    return this.provider.getAll<T>(this.entityType)
  }

  async query(queries: Query<T>[]): Promise<Result<T[], StorageError>> {
    return this.provider.query<T>(this.entityType, queries)
  }

  async create(data: T): Promise<Result<T, StorageError>> {
    return this.provider.create<T>(this.entityType, data)
  }

  async update(id: string, data: Partial<T>): Promise<Result<T, StorageError>> {
    const withTimestamps = {
      ...data,
      updatedAt: Date.now(),
    } as Partial<T>
    return this.provider.update<T>(this.entityType, id, withTimestamps)
  }

  async delete(id: string): Promise<Result<void, StorageError>> {
    return this.provider.delete(this.entityType, id)
  }

  async purge(id: string): Promise<Result<void, StorageError>> {
    return this.provider.purge(this.entityType, id)
  }

  async count(): Promise<Result<number, StorageError>> {
    return this.provider.count(this.entityType)
  }
}
