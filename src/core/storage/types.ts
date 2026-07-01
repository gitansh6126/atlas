import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'

export interface Query<T> {
  field: keyof T;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: unknown;
}

export interface StorageProvider {
  get<T extends { id: string }>(
    entityType: string,
    id: string,
  ): Promise<Result<T, StorageError>>;

  getAll<T extends { id: string }>(
    entityType: string,
  ): Promise<Result<T[], StorageError>>;

  query<T extends { id: string }>(
    entityType: string,
    queries: Query<T>[],
  ): Promise<Result<T[], StorageError>>;

  create<T extends { id: string }>(
    entityType: string,
    data: T,
  ): Promise<Result<T, StorageError>>;

  upsert<T extends { id: string }>(
    entityType: string,
    data: T,
  ): Promise<Result<T, StorageError>>;

  update<T extends { id: string }>(
    entityType: string,
    id: string,
    data: Partial<T>,
  ): Promise<Result<T, StorageError>>;

  delete(
    entityType: string,
    id: string,
  ): Promise<Result<void, StorageError>>;

  purge(
    entityType: string,
    id: string,
  ): Promise<Result<void, StorageError>>;

  count(
    entityType: string,
  ): Promise<Result<number, StorageError>>;
}
