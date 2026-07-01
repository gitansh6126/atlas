import type { StorageProvider, Query } from '@/core/storage/types'
import type { Result } from '@/core/types/result'
import { StorageError, NotFoundError, isStorageError } from '@/core/storage/errors'
import { logger } from '@/core/storage/logger'
import { atlasDb } from '@/core/database/atlas-database'
import type { Table } from 'dexie'

export class IndexedDbStorageProvider implements StorageProvider {
  private getTable(entityType: string): Table<unknown, string> {
    const table = (atlasDb as unknown as Record<string, unknown>)[entityType]
    if (!table) {
      throw new StorageError(`Unknown entity type: ${entityType}`, 'UNKNOWN_ENTITY')
    }
    return table as Table<unknown, string>
  }

  private async wrap<T>(fn: () => Promise<T>): Promise<Result<T, StorageError>> {
    try {
      const data = await fn()
      return { success: true, data }
    } catch (error) {
      if (isStorageError(error)) {
        return { success: false, error }
      }
      const message = error instanceof Error ? error.message : String(error)
      logger.error(`Storage operation failed: ${message}`, error)
      return {
        success: false,
        error: new StorageError(message, 'UNKNOWN', error),
      }
    }
  }

  async get<T extends { id: string }>(
    entityType: string,
    id: string,
  ): Promise<Result<T, StorageError>> {
    return this.wrap(async () => {
      const table = this.getTable(entityType) as unknown as Table<T, string>
      const item = await table.get(id)
      if (!item) {
        throw new NotFoundError(entityType, id)
      }
      return item
    })
  }

  async getAll<T extends { id: string }>(
    entityType: string,
  ): Promise<Result<T[], StorageError>> {
    return this.wrap(async () => {
      const table = this.getTable(entityType) as unknown as Table<T, string>
      return table.toArray()
    })
  }

  async query<T extends { id: string }>(
    entityType: string,
    queries: Query<T>[],
  ): Promise<Result<T[], StorageError>> {
    return this.wrap(async () => {
      const table = this.getTable(entityType) as unknown as Table<T, string>
      const all = await table.toArray()
      return all.filter((item) => {
        return queries.every((q) => {
          const value = (item as Record<string, unknown>)[q.field as string]
          switch (q.operator) {
            case 'eq':
              return value === q.value
            case 'neq':
              return value !== q.value
            case 'gt':
              return (value as number) > (q.value as number)
            case 'gte':
              return (value as number) >= (q.value as number)
            case 'lt':
              return (value as number) < (q.value as number)
            case 'lte':
              return (value as number) <= (q.value as number)
            case 'in':
              return (q.value as unknown[]).includes(value)
            case 'contains':
              return String(value).includes(String(q.value))
            default:
              return false
          }
        })
      })
    })
  }

  async create<T extends { id: string }>(
    entityType: string,
    data: T,
  ): Promise<Result<T, StorageError>> {
    return this.wrap(async () => {
      const table = this.getTable(entityType) as unknown as Table<T, string>
      await table.add(data)
      logger.debug(`Created ${entityType}: ${data.id}`)
      return data
    })
  }

  async upsert<T extends { id: string }>(
    entityType: string,
    data: T,
  ): Promise<Result<T, StorageError>> {
    return this.wrap(async () => {
      const table = this.getTable(entityType) as unknown as Table<T, string>
      await table.put(data)
      logger.debug(`Upserted ${entityType}: ${data.id}`)
      return data
    })
  }

  async update<T extends { id: string }>(
    entityType: string,
    id: string,
    data: Partial<T>,
  ): Promise<Result<T, StorageError>> {
    return this.wrap(async () => {
      const table = this.getTable(entityType) as unknown as Table<{ id: string }, string>
      const existing = await table.get(id)
      if (!existing) {
        throw new NotFoundError(entityType, id)
      }
      const updated = { ...existing, ...data } as T
      await table.put(updated as { id: string })
      logger.debug(`Updated ${entityType}: ${id}`)
      return updated
    })
  }

  async delete(
    entityType: string,
    id: string,
  ): Promise<Result<void, StorageError>> {
    return this.wrap(async () => {
      const table = this.getTable(entityType) as unknown as Table<{ id: string; deletedAt?: number | null }, string>
      const existing = await table.get(id)
      if (!existing) {
        throw new NotFoundError(entityType, id)
      }
      const softDeleted = { ...existing, deletedAt: Date.now() }
      await table.put(softDeleted)
      logger.debug(`Soft-deleted ${entityType}: ${id}`)
    })
  }

  async purge(
    entityType: string,
    id: string,
  ): Promise<Result<void, StorageError>> {
    return this.wrap(async () => {
      const table = this.getTable(entityType)
      await table.delete(id)
      logger.debug(`Permanently deleted ${entityType}: ${id}`)
    })
  }

  async count(
    entityType: string,
  ): Promise<Result<number, StorageError>> {
    return this.wrap(async () => {
      const table = this.getTable(entityType) as unknown as Table<unknown, string>
      return table.count()
    })
  }
}
