import type { Block } from './types'
import { BLOCK_TYPE_ROOT, BLOCK_TYPE_PARAGRAPH, BLOCK_TYPE_HEADING, BLOCK_TYPE_DIVIDER } from './types'

function generateId(): string {
  return crypto.randomUUID()
}

function now(): number {
  return Date.now()
}

interface CreateBlockInput {
  workspaceId: string;
  pageId: string;
  parentId: string | null;
  type: string;
  content?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  position?: number;
}

export class BlockFactory {
  create(input: CreateBlockInput): Block {
    const nowTs = now()
    return {
      id: generateId(),
      workspaceId: input.workspaceId,
      pageId: input.pageId,
      parentId: input.parentId,
      children: [],
      type: input.type,
      pluginVersion: '1.0.0',
      content: input.content ?? {},
      metadata: input.metadata ?? {},
      formats: [],
      position: input.position ?? 0,
      plainText: '',
      wordCount: 0,
      charCount: 0,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    }
  }

  createRoot(workspaceId: string, pageId: string): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId: null,
      type: BLOCK_TYPE_ROOT,
      content: { title: '' },
    })
  }

  createParagraph(
    workspaceId: string,
    pageId: string,
    parentId: string,
    text?: string,
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: BLOCK_TYPE_PARAGRAPH,
      content: { text: text ?? '' },
      position,
    })
  }

  createHeading(
    workspaceId: string,
    pageId: string,
    parentId: string,
    level: number,
    text?: string,
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: BLOCK_TYPE_HEADING,
      content: { level, text: text ?? '' },
      position,
    })
  }

  createDivider(
    workspaceId: string,
    pageId: string,
    parentId: string,
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: BLOCK_TYPE_DIVIDER,
      position,
    })
  }

  clone(block: Block, newParentId?: string): Block {
    const nowTs = now()
    return {
      ...block,
      id: generateId(),
      parentId: newParentId ?? block.parentId,
      children: [],
      position: block.position + 1,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    }
  }
}
