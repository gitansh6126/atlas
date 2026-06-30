import { Command } from './base-command'
import type { Workspace } from '@/core/types/domain'
import { workspaceRepository } from '@/core/repositories'
import { logger } from '@/core/storage/logger'
import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'

function generateId(): string {
  return crypto.randomUUID()
}

function now(): number {
  return Date.now()
}

interface CreateWorkspaceInput {
  name: string;
  icon?: string;
  description?: string;
}

interface CreateWorkspaceOutput {
  workspace: Workspace;
}

export class CreateWorkspaceCommand extends Command<CreateWorkspaceInput, CreateWorkspaceOutput> {
  readonly name = 'workspace:create';
  readonly description = 'Create a new workspace';
  readonly category = 'workspace';

  canUndo(): boolean {
    return true
  }

  async execute(input: CreateWorkspaceInput): Promise<Result<CreateWorkspaceOutput, Error | StorageError>> {
    const nowTs = now()
    const workspace: Workspace = {
      id: generateId(),
      name: input.name,
      icon: input.icon ?? 'LayoutGrid',
      description: input.description ?? null,
      colorScheme: 'system',
      defaultEditorMode: 'edit',
      pageSortOrder: 'updated',
      pageSortDirection: 'desc',
      syncEnabled: false,
      syncProvider: null,
      lastSyncedAt: null,
      pageCount: 0,
      folderCount: 0,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    }

    const result = await workspaceRepository.create(workspace)
    if (!result.success) {
      return result
    }

    logger.info(`Workspace created: ${workspace.name} (${workspace.id})`)
    return { success: true, data: { workspace } }
  }

  async undo(_input: CreateWorkspaceInput): Promise<Result<void, Error>> {
    return { success: true, data: undefined }
  }
}

interface RenameWorkspaceInput {
  workspaceId: string;
  name: string;
}

interface RenameWorkspaceOutput {
  workspace: Workspace;
}

export class RenameWorkspaceCommand extends Command<RenameWorkspaceInput, RenameWorkspaceOutput> {
  readonly name = 'workspace:rename';
  readonly description = 'Rename a workspace';
  readonly category = 'workspace';

  async execute(input: RenameWorkspaceInput): Promise<Result<RenameWorkspaceOutput, Error | StorageError>> {
    const result = await workspaceRepository.update(input.workspaceId, {
      name: input.name,
    })

    if (!result.success) {
      return result
    }

    logger.info(`Workspace renamed: ${result.data.id}`)
    return { success: true, data: { workspace: result.data } }
  }
}

interface DeleteWorkspaceInput {
  workspaceId: string;
}

interface DeleteWorkspaceOutput {
  deletedId: string;
}

export class DeleteWorkspaceCommand extends Command<DeleteWorkspaceInput, DeleteWorkspaceOutput> {
  readonly name = 'workspace:delete';
  readonly description = 'Delete a workspace';
  readonly category = 'workspace';

  async execute(input: DeleteWorkspaceInput): Promise<Result<DeleteWorkspaceOutput, Error | StorageError>> {
    const result = await workspaceRepository.delete(input.workspaceId)
    if (!result.success) {
      return result
    }

    logger.info(`Workspace deleted: ${input.workspaceId}`)
    return { success: true, data: { deletedId: input.workspaceId } }
  }
}

interface DuplicateWorkspaceInput {
  workspaceId: string;
}

interface DuplicateWorkspaceOutput {
  workspace: Workspace;
}

export class DuplicateWorkspaceCommand extends Command<DuplicateWorkspaceInput, DuplicateWorkspaceOutput> {
  readonly name = 'workspace:duplicate';
  readonly description = 'Duplicate a workspace';
  readonly category = 'workspace';

  canUndo(): boolean {
    return true
  }

  async execute(input: DuplicateWorkspaceInput): Promise<Result<DuplicateWorkspaceOutput, Error | StorageError>> {
    const sourceResult = await workspaceRepository.findById(input.workspaceId)
    if (!sourceResult.success) {
      return sourceResult
    }

    const source = sourceResult.data
    const nowTs = now()
    const workspace: Workspace = {
      ...source,
      id: generateId(),
      name: `${source.name} (copy)`,
      pageCount: 0,
      folderCount: 0,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    }

    const result = await workspaceRepository.create(workspace)
    if (!result.success) {
      return result
    }

    logger.info(`Workspace duplicated: ${workspace.name} (${workspace.id})`)
    return { success: true, data: { workspace } }
  }
}
