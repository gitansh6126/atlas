import { Command } from '@/core/commands/base-command'
import { logger } from '@/core/storage/logger'
import type { Block } from './types'
import type { EditorEngine } from './editor-engine'
import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'

interface InsertBlockInput {
  type: string;
  parentId: string;
  position?: number;
  content?: Record<string, unknown>;
}

interface InsertBlockOutput {
  block: Block;
}

export class InsertBlockCommand extends Command<InsertBlockInput, InsertBlockOutput> {
  readonly name = 'editor:insert-block';
  readonly description = 'Insert a new block';
  readonly category = 'editor';

  private engine: EditorEngine;

  constructor(engine: EditorEngine) {
    super()
    this.engine = engine
  }

  async execute(input: InsertBlockInput): Promise<Result<InsertBlockOutput, Error | StorageError>> {
    const blockManager = this.engine.getBlockManager()
    if (!blockManager) {
      return { success: false, error: new Error('No document open') }
    }

    const block = blockManager.insertBlock(input.type, input.parentId, input.position, input.content)
    this.engine.getHistoryBridge().recordInsert(block.id)
    logger.info(`Block inserted: ${block.type} (${block.id})`)
    return { success: true, data: { block } }
  }
}

interface DeleteBlockInput {
  blockId: string;
}

interface DeleteBlockOutput {
  deletedId: string;
}

export class DeleteBlockCommand extends Command<DeleteBlockInput, DeleteBlockOutput> {
  readonly name = 'editor:delete-block';
  readonly description = 'Delete a block';
  readonly category = 'editor';

  private engine: EditorEngine;

  constructor(engine: EditorEngine) {
    super()
    this.engine = engine
  }

  async execute(input: DeleteBlockInput): Promise<Result<DeleteBlockOutput, Error | StorageError>> {
    const blockManager = this.engine.getBlockManager()
    if (!blockManager) {
      return { success: false, error: new Error('No document open') }
    }

    const block = blockManager.getBlock(input.blockId)
    if (block) {
      this.engine.getHistoryBridge().recordDelete(input.blockId, block as unknown as Record<string, unknown>)
    }

    blockManager.deleteBlock(input.blockId)
    logger.info(`Block deleted: ${input.blockId}`)
    return { success: true, data: { deletedId: input.blockId } }
  }
}

interface MoveBlockInput {
  blockId: string;
  newParentId: string;
  position?: number;
}

interface MoveBlockOutput {
  block: Block;
}

export class MoveBlockCommand extends Command<MoveBlockInput, MoveBlockOutput> {
  readonly name = 'editor:move-block';
  readonly description = 'Move a block to a new parent';
  readonly category = 'editor';

  private engine: EditorEngine;

  constructor(engine: EditorEngine) {
    super()
    this.engine = engine
  }

  async execute(input: MoveBlockInput): Promise<Result<MoveBlockOutput, Error | StorageError>> {
    const blockManager = this.engine.getBlockManager()
    if (!blockManager) {
      return { success: false, error: new Error('No document open') }
    }

    const block = blockManager.getBlock(input.blockId)
    if (block) {
      this.engine.getHistoryBridge().recordMove(input.blockId, block as unknown as Record<string, unknown>)
    }

    const moved = blockManager.moveBlock(input.blockId, input.newParentId, input.position)
    if (!moved) {
      return { success: false, error: new Error('Failed to move block') }
    }

    logger.info(`Block moved: ${input.blockId} -> ${input.newParentId}`)
    return { success: true, data: { block: moved } }
  }
}

interface DuplicateBlockInput {
  blockId: string;
}

interface DuplicateBlockOutput {
  block: Block;
  cloneId: string;
}

export class DuplicateBlockCommand extends Command<DuplicateBlockInput, DuplicateBlockOutput> {
  readonly name = 'editor:duplicate-block';
  readonly description = 'Duplicate a block and its children';
  readonly category = 'editor';

  private engine: EditorEngine;

  constructor(engine: EditorEngine) {
    super()
    this.engine = engine
  }

  async execute(input: DuplicateBlockInput): Promise<Result<DuplicateBlockOutput, Error | StorageError>> {
    const blockManager = this.engine.getBlockManager()
    if (!blockManager) {
      return { success: false, error: new Error('No document open') }
    }

    const clone = blockManager.duplicateBlock(input.blockId)
    if (!clone) {
      return { success: false, error: new Error('Failed to duplicate block') }
    }

    logger.info(`Block duplicated: ${input.blockId} -> ${clone.id}`)
    return { success: true, data: { block: clone, cloneId: clone.id } }
  }
}

export class SplitBlockCommand extends Command<void, void> {
  readonly name = 'editor:split-block';
  readonly description = 'Split a block at cursor position (placeholder)';
  readonly category = 'editor';

  async execute(): Promise<Result<void, Error | StorageError>> {
    logger.info('SplitBlockCommand: not yet implemented')
    return { success: true, data: undefined }
  }
}

export class MergeBlockCommand extends Command<void, void> {
  readonly name = 'editor:merge-block';
  readonly description = 'Merge adjacent blocks (placeholder)';
  readonly category = 'editor';

  async execute(): Promise<Result<void, Error | StorageError>> {
    logger.info('MergeBlockCommand: not yet implemented')
    return { success: true, data: undefined }
  }
}
