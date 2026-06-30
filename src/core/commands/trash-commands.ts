import { Command } from './base-command'
import { logger } from '@/core/storage/logger'
import { TrashRepository } from '@/core/repositories/trash-repository'
import { IndexedDbStorageProvider } from '@/core/storage/providers/indexeddb-provider'
import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'

const trashRepo = new TrashRepository(new IndexedDbStorageProvider())

interface RestoreFromTrashInput {
  id: string;
  entityType: 'page' | 'folder';
}

export class RestoreFromTrashCommand extends Command<RestoreFromTrashInput, void> {
  readonly name = 'trash:restore';
  readonly description = 'Restore an item from trash';
  readonly category = 'trash';

  async execute(input: RestoreFromTrashInput): Promise<Result<void, Error | StorageError>> {
    const result = await trashRepo.restore(input.id, input.entityType)
    if (!result.success) {
      return result
    }
    logger.info(`Restored from trash: ${input.entityType} ${input.id}`)
    return { success: true, data: undefined }
  }
}

interface PermanentlyDeleteInput {
  id: string;
  entityType: 'page' | 'folder';
}

export class PermanentlyDeleteCommand extends Command<PermanentlyDeleteInput, void> {
  readonly name = 'trash:permanent-delete';
  readonly description = 'Permanently delete an item';
  readonly category = 'trash';

  async execute(input: PermanentlyDeleteInput): Promise<Result<void, Error | StorageError>> {
    const result = await trashRepo.permanentlyDelete(input.id, input.entityType)
    if (!result.success) {
      return result
    }
    logger.info(`Permanently deleted: ${input.entityType} ${input.id}`)
    return { success: true, data: undefined }
  }
}
