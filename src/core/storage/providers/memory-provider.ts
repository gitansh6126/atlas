import type { StorageProvider, Query } from '@/core/storage/types'
import type { Result } from '@/core/types/result'
import { StorageError, NotFoundError } from '@/core/storage/errors'

interface EntityRecord {
  id: string;
  [key: string]: unknown;
}

export class MemoryStorageProvider implements StorageProvider {
  private stores = new Map<string, Map<string, EntityRecord>>();

  private getStore(entityType: string): Map<string, EntityRecord> {
    let store = this.stores.get(entityType)
    if (!store) {
      store = new Map()
      this.stores.set(entityType, store)
    }
    return store
  }

  async get<T extends { id: string }>(
    entityType: string,
    id: string,
  ): Promise<Result<T, StorageError>> {
    const store = this.getStore(entityType)
    const item = store.get(id)
    if (!item) {
      return { success: false, error: new NotFoundError(entityType, id) }
    }
    return { success: true, data: item as unknown as T }
  }

  async getAll<T extends { id: string }>(
    entityType: string,
  ): Promise<Result<T[], StorageError>> {
    const store = this.getStore(entityType)
    const items = Array.from(store.values())
    return { success: true, data: items as unknown as T[] }
  }

  async query<T extends { id: string }>(
    entityType: string,
    queries: Query<T>[],
  ): Promise<Result<T[], StorageError>> {
    const store = this.getStore(entityType)
    let items = Array.from(store.values()) as unknown as T[]

    for (const q of queries) {
      items = items.filter((item) => {
        const value = item[q.field]
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
    }

    return { success: true, data: items }
  }

  async create<T extends { id: string }>(
    entityType: string,
    data: T,
  ): Promise<Result<T, StorageError>> {
    const store = this.getStore(entityType)
    store.set(data.id, data as unknown as EntityRecord)
    return { success: true, data }
  }

  async upsert<T extends { id: string }>(
    entityType: string,
    data: T,
  ): Promise<Result<T, StorageError>> {
    const store = this.getStore(entityType)
    store.set(data.id, data as unknown as EntityRecord)
    return { success: true, data }
  }

  async update<T extends { id: string }>(
    entityType: string,
    id: string,
    data: Partial<T>,
  ): Promise<Result<T, StorageError>> {
    const store = this.getStore(entityType)
    const existing = store.get(id)
    if (!existing) {
      return { success: false, error: new NotFoundError(entityType, id) }
    }
    const updated = {
      ...existing,
      ...data,
      updatedAt: Date.now(),
      version: ((existing.version as number) ?? 0) + 1,
    } as unknown as T
    store.set(id, updated as unknown as EntityRecord)
    return { success: true, data: updated }
  }

  async delete(
    entityType: string,
    id: string,
  ): Promise<Result<void, StorageError>> {
    const store = this.getStore(entityType)
    const existing = store.get(id)
    if (!existing) {
      return { success: false, error: new NotFoundError(entityType, id) }
    }
    existing.deletedAt = Date.now()
    return { success: true, data: undefined }
  }

  async purge(
    entityType: string,
    id: string,
  ): Promise<Result<void, StorageError>> {
    const store = this.getStore(entityType)
    const existing = store.get(id)
    if (!existing) {
      return { success: false, error: new NotFoundError(entityType, id) }
    }
    store.delete(id)
    return { success: true, data: undefined }
  }

  async count(
    entityType: string,
  ): Promise<Result<number, StorageError>> {
    const store = this.getStore(entityType)
    return { success: true, data: store.size }
  }
}
