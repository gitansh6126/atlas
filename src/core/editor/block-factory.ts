import type { Block } from './types'
import {
  BLOCK_TYPE_ROOT,
  BLOCK_TYPE_PARAGRAPH,
  BLOCK_TYPE_HEADING,
  BLOCK_TYPE_DIVIDER,
  BLOCK_TYPE_GRID,
  BLOCK_TYPE_LIST,
  BLOCK_TYPE_CARD,
  BLOCK_TYPE_GALLERY,
  BLOCK_TYPE_KANBAN,
  BLOCK_TYPE_CALENDAR,
} from './types'

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

  createGrid(
    workspaceId: string,
    pageId: string,
    parentId: string,
    columns = 3,
    gap = 4,
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: BLOCK_TYPE_GRID,
      content: { columns, gap, layout: 'fixed' },
      position,
    })
  }

  createList(
    workspaceId: string,
    pageId: string,
    parentId: string,
    style: 'bullet' | 'numbered' | 'check' = 'bullet',
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: BLOCK_TYPE_LIST,
      content: { style, items: [] },
      position,
    })
  }

  createCard(
    workspaceId: string,
    pageId: string,
    parentId: string,
    title?: string,
    description?: string,
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: BLOCK_TYPE_CARD,
      content: { title: title ?? '', description: description ?? '' },
      position,
    })
  }

  createGallery(
    workspaceId: string,
    pageId: string,
    parentId: string,
    images: string[] = [],
    columns = 3,
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: BLOCK_TYPE_GALLERY,
      content: { images, columns },
      position,
    })
  }

  createKanban(
    workspaceId: string,
    pageId: string,
    parentId: string,
    columns: { id: string; title: string }[] = [],
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: BLOCK_TYPE_KANBAN,
      content: { columns: columns.length > 0 ? columns : [{ id: 'todo', title: 'To Do' }, { id: 'doing', title: 'In Progress' }, { id: 'done', title: 'Done' }] },
      position,
    })
  }

  createCalendar(
    workspaceId: string,
    pageId: string,
    parentId: string,
    view: 'month' | 'week' | 'day' = 'month',
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: BLOCK_TYPE_CALENDAR,
      content: { view, events: [] },
      position,
    })
  }

  createLabel(
    workspaceId: string,
    pageId: string,
    parentId: string,
    text: string,
    variant: 'default' | 'outline' | 'secondary' | 'destructive' = 'default',
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: 'label',
      content: { text, variant },
      position,
    })
  }

  createTag(
    workspaceId: string,
    pageId: string,
    parentId: string,
    label: string,
    color: string = '#3b82f6',
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: 'tag',
      content: { label, color },
      position,
    })
  }

  createHtmlEmbed(
    workspaceId: string,
    pageId: string,
    parentId: string,
    html: string = '',
    css: string = '',
    position?: number,
  ): Block {
    return this.create({
      workspaceId,
      pageId,
      parentId,
      type: 'html_embed',
      content: { html, css, files: [] },
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
