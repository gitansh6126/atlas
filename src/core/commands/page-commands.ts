import { Command } from './base-command'
import type { Page } from '@/core/types/domain'
import { pageRepository } from '@/core/repositories'
import { logger } from '@/core/storage/logger'
import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'

function generateId(): string {
  return crypto.randomUUID()
}

function now(): number {
  return Date.now()
}

interface CreatePageInput {
  title: string;
  workspaceId: string;
  folderId?: string | null;
  icon?: string | null;
  isFavorite?: boolean;
}

interface CreatePageOutput {
  page: Page;
}

export class CreatePageCommand extends Command<CreatePageInput, CreatePageOutput> {
  readonly name = 'page:create';
  readonly description = 'Create a new page';
  readonly category = 'page';

  canUndo(): boolean {
    return true
  }

  async execute(input: CreatePageInput): Promise<Result<CreatePageOutput, Error | StorageError>> {
    const nowTs = now()
    const page: Page = {
      id: generateId(),
      workspaceId: input.workspaceId,
      folderId: input.folderId ?? null,
      title: input.title,
      icon: input.icon ?? null,
      coverAssetId: null,
      rootBlockId: generateId(),
      isFavorite: input.isFavorite ?? false,
      isPinned: false,
      lastOpenedAt: nowTs,
      wordCount: 0,
      charCount: 0,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    }

    const result = await pageRepository.create(page)
    if (!result.success) {
      return result
    }

    logger.info(`Page created: ${page.title} (${page.id})`)
    return { success: true, data: { page } }
  }

  async undo(_input: CreatePageInput): Promise<Result<void, Error>> {
    return { success: true, data: undefined }
  }
}

interface RenamePageInput {
  pageId: string;
  title: string;
}

interface RenamePageOutput {
  page: Page;
}

export class RenamePageCommand extends Command<RenamePageInput, RenamePageOutput> {
  readonly name = 'page:rename';
  readonly description = 'Rename a page';
  readonly category = 'page';

  async execute(input: RenamePageInput): Promise<Result<RenamePageOutput, Error | StorageError>> {
    const result = await pageRepository.update(input.pageId, { title: input.title })
    if (!result.success) {
      return result
    }
    logger.info(`Page renamed: ${input.pageId}`)
    return { success: true, data: { page: result.data } }
  }
}

interface DeletePageInput {
  pageId: string;
}

interface DeletePageOutput {
  deletedId: string;
}

export class DeletePageCommand extends Command<DeletePageInput, DeletePageOutput> {
  readonly name = 'page:delete';
  readonly description = 'Delete a page';
  readonly category = 'page';

  async execute(input: DeletePageInput): Promise<Result<DeletePageOutput, Error | StorageError>> {
    const result = await pageRepository.delete(input.pageId)
    if (!result.success) {
      return result
    }
    logger.info(`Page deleted: ${input.pageId}`)
    return { success: true, data: { deletedId: input.pageId } }
  }
}

interface ToggleFavoriteInput {
  pageId: string;
  isFavorite: boolean;
}

interface ToggleFavoriteOutput {
  page: Page;
}

export class ToggleFavoriteCommand extends Command<ToggleFavoriteInput, ToggleFavoriteOutput> {
  readonly name = 'page:toggle-favorite';
  readonly description = 'Toggle page favorite status';
  readonly category = 'page';

  async execute(input: ToggleFavoriteInput): Promise<Result<ToggleFavoriteOutput, Error | StorageError>> {
    const result = await pageRepository.update(input.pageId, {
      isFavorite: input.isFavorite,
    })
    if (!result.success) {
      return result
    }
    return { success: true, data: { page: result.data } }
  }
}

interface DuplicatePageInput {
  pageId: string;
}

interface DuplicatePageOutput {
  page: Page;
}

export class DuplicatePageCommand extends Command<DuplicatePageInput, DuplicatePageOutput> {
  readonly name = 'page:duplicate';
  readonly description = 'Duplicate a page';
  readonly category = 'page';

  async execute(input: DuplicatePageInput): Promise<Result<DuplicatePageOutput, Error | StorageError>> {
    const sourceResult = await pageRepository.findById(input.pageId)
    if (!sourceResult.success) {
      return sourceResult
    }

    const source = sourceResult.data
    const nowTs = now()
    const page: Page = {
      ...source,
      id: generateId(),
      rootBlockId: generateId(),
      title: `${source.title} (copy)`,
      isFavorite: false,
      isPinned: false,
      lastOpenedAt: nowTs,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    }

    const result = await pageRepository.create(page)
    if (!result.success) {
      return result
    }

    logger.info(`Page duplicated: ${page.title} (${page.id})`)
    return { success: true, data: { page } }
  }
}

interface MovePageInput {
  pageId: string;
  folderId: string | null;
}

interface MovePageOutput {
  page: Page;
}

export class MovePageCommand extends Command<MovePageInput, MovePageOutput> {
  readonly name = 'page:move';
  readonly description = 'Move a page to a folder';
  readonly category = 'page';

  async execute(input: MovePageInput): Promise<Result<MovePageOutput, Error | StorageError>> {
    const result = await pageRepository.update(input.pageId, { folderId: input.folderId })
    if (!result.success) {
      return result
    }
    logger.info(`Page moved: ${input.pageId} -> ${input.folderId ?? 'root'}`)
    return { success: true, data: { page: result.data } }
  }
}

interface PinPageInput {
  pageId: string;
  isPinned: boolean;
}

interface PinPageOutput {
  page: Page;
}

export class PinPageCommand extends Command<PinPageInput, PinPageOutput> {
  readonly name = 'page:pin';
  readonly description = 'Pin or unpin a page';
  readonly category = 'page';

  async execute(input: PinPageInput): Promise<Result<PinPageOutput, Error | StorageError>> {
    const result = await pageRepository.update(input.pageId, { isPinned: input.isPinned })
    if (!result.success) {
      return result
    }
    return { success: true, data: { page: result.data } }
  }
}
