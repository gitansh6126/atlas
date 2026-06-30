import type { Block } from './types'
import { DocumentModel } from './document-model'
import { BlockFactory } from './block-factory'

export class BlockManager {
  private document: DocumentModel;
  private factory: BlockFactory;

  constructor(document: DocumentModel) {
    this.document = document
    this.factory = document.getFactory()
  }

  insertBlock(
    type: string,
    parentId: string,
    position?: number,
    content?: Record<string, unknown>,
  ): Block {
    const parent = this.document.getBlock(parentId)
    const insertPosition = position ?? (parent ? parent.children.length : 0)

    const block = this.factory.create({
      workspaceId: this.document.getWorkspaceId(),
      pageId: this.document.getPageId(),
      parentId,
      type,
      content,
      position: insertPosition,
    })

    this.document.addBlock(block)
    return block
  }

  insertParagraph(parentId: string, text?: string, position?: number): Block {
    const block = this.factory.createParagraph(
      this.document.getWorkspaceId(),
      this.document.getPageId(),
      parentId,
      text,
      position,
    )
    this.document.addBlock(block)
    return block
  }

  insertHeading(parentId: string, level: number, text?: string, position?: number): Block {
    const block = this.factory.createHeading(
      this.document.getWorkspaceId(),
      this.document.getPageId(),
      parentId,
      level,
      text,
      position,
    )
    this.document.addBlock(block)
    return block
  }

  insertDivider(parentId: string, position?: number): Block {
    const block = this.factory.createDivider(
      this.document.getWorkspaceId(),
      this.document.getPageId(),
      parentId,
      position,
    )
    this.document.addBlock(block)
    return block
  }

  deleteBlock(blockId: string): Block | undefined {
    return this.document.removeBlock(blockId)
  }

  moveBlock(blockId: string, newParentId: string, position?: number): Block | undefined {
    const parent = this.document.getBlock(newParentId)
    const insertPosition = position ?? (parent ? parent.children.length : 0)
    return this.document.moveBlock(blockId, newParentId, insertPosition)
  }

  duplicateBlock(blockId: string): Block | undefined {
    const source = this.document.getBlock(blockId)
    if (!source) return undefined

    const clone = this.factory.clone(source)
    this.document.addBlock(clone)

    const descendants = this.document.getTraversal().getDescendants(source)
    const idMap = new Map<string, string>()
    idMap.set(source.id, clone.id)

    for (const descendant of descendants) {
      const newParentId = idMap.get(descendant.parentId ?? '') ?? clone.id
      const clonedDescendant = this.factory.clone(descendant, newParentId)
      this.document.addBlock(clonedDescendant)
      idMap.set(descendant.id, clonedDescendant.id)
    }

    return clone
  }

  updateContent(blockId: string, content: Record<string, unknown>): Block | undefined {
    return this.document.updateBlockContent(blockId, content)
  }

  updateMetadata(blockId: string, metadata: Record<string, unknown>): Block | undefined {
    return this.document.updateBlockMetadata(blockId, metadata)
  }

  getBlock(id: string): Block | undefined {
    return this.document.getBlock(id)
  }

  getChildren(blockId: string): Block[] {
    const block = this.document.getBlock(blockId)
    if (!block) return []
    return this.document.getTraversal().getChildren(block)
  }
}
