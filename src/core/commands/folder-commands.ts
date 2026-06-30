import { Command } from './base-command'
import type { Folder } from '@/core/types/domain'
import { folderRepository } from '@/core/repositories'
import { logger } from '@/core/storage/logger'
import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'

function generateId(): string {
  return crypto.randomUUID()
}

function now(): number {
  return Date.now()
}

interface CreateFolderInput {
  name: string;
  workspaceId: string;
  parentId?: string | null;
  icon?: string | null;
}

interface CreateFolderOutput {
  folder: Folder;
}

export class CreateFolderCommand extends Command<CreateFolderInput, CreateFolderOutput> {
  readonly name = 'folder:create';
  readonly description = 'Create a new folder';
  readonly category = 'folder';

  canUndo(): boolean {
    return true
  }

  async execute(input: CreateFolderInput): Promise<Result<CreateFolderOutput, Error | StorageError>> {
    const nowTs = now()
    const folder: Folder = {
      id: generateId(),
      workspaceId: input.workspaceId,
      parentId: input.parentId ?? null,
      name: input.name,
      icon: input.icon ?? null,
      children: [],
      pageCount: 0,
      collapsed: false,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    }

    const result = await folderRepository.create(folder)
    if (!result.success) {
      return result
    }

    logger.info(`Folder created: ${folder.name} (${folder.id})`)
    return { success: true, data: { folder } }
  }

  async undo(_input: CreateFolderInput): Promise<Result<void, Error>> {
    return { success: true, data: undefined }
  }
}

interface RenameFolderInput {
  folderId: string;
  name: string;
}

interface RenameFolderOutput {
  folder: Folder;
}

export class RenameFolderCommand extends Command<RenameFolderInput, RenameFolderOutput> {
  readonly name = 'folder:rename';
  readonly description = 'Rename a folder';
  readonly category = 'folder';

  async execute(input: RenameFolderInput): Promise<Result<RenameFolderOutput, Error | StorageError>> {
    const result = await folderRepository.update(input.folderId, { name: input.name })
    if (!result.success) {
      return result
    }
    logger.info(`Folder renamed: ${input.folderId}`)
    return { success: true, data: { folder: result.data } }
  }
}

interface DeleteFolderInput {
  folderId: string;
}

interface DeleteFolderOutput {
  deletedId: string;
}

export class DeleteFolderCommand extends Command<DeleteFolderInput, DeleteFolderOutput> {
  readonly name = 'folder:delete';
  readonly description = 'Delete a folder';
  readonly category = 'folder';

  async execute(input: DeleteFolderInput): Promise<Result<DeleteFolderOutput, Error | StorageError>> {
    const result = await folderRepository.delete(input.folderId)
    if (!result.success) {
      return result
    }
    logger.info(`Folder deleted: ${input.folderId}`)
    return { success: true, data: { deletedId: input.folderId } }
  }
}

interface DuplicateFolderInput {
  folderId: string;
}

interface DuplicateFolderOutput {
  folder: Folder;
}

export class DuplicateFolderCommand extends Command<DuplicateFolderInput, DuplicateFolderOutput> {
  readonly name = 'folder:duplicate';
  readonly description = 'Duplicate a folder';
  readonly category = 'folder';

  canUndo(): boolean {
    return true
  }

  async execute(input: DuplicateFolderInput): Promise<Result<DuplicateFolderOutput, Error | StorageError>> {
    const sourceResult = await folderRepository.findById(input.folderId)
    if (!sourceResult.success) {
      return sourceResult
    }

    const source = sourceResult.data
    const nowTs = now()
    const folder: Folder = {
      ...source,
      id: generateId(),
      name: `${source.name} (copy)`,
      children: [],
      pageCount: 0,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    }

    const result = await folderRepository.create(folder)
    if (!result.success) {
      return result
    }

    logger.info(`Folder duplicated: ${folder.name} (${folder.id})`)
    return { success: true, data: { folder } }
  }
}

interface MoveFolderInput {
  folderId: string;
  parentId: string | null;
}

interface MoveFolderOutput {
  folder: Folder;
}

export class MoveFolderCommand extends Command<MoveFolderInput, MoveFolderOutput> {
  readonly name = 'folder:move';
  readonly description = 'Move a folder to a different parent';
  readonly category = 'folder';

  async execute(input: MoveFolderInput): Promise<Result<MoveFolderOutput, Error | StorageError>> {
    const result = await folderRepository.update(input.folderId, { parentId: input.parentId })
    if (!result.success) {
      return result
    }
    logger.info(`Folder moved: ${input.folderId} -> ${input.parentId ?? 'root'}`)
    return { success: true, data: { folder: result.data } }
  }
}
