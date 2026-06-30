import type { Block, Document } from './types'
import { BlockFactory } from './block-factory'
import { NodeTraversal } from './node-traversal'

export class DocumentModel {
  private document: Document;
  private factory: BlockFactory;
  private traversal: NodeTraversal;

  constructor(pageId: string, workspaceId: string, rootBlock: Block) {
    const blocks = new Map<string, Block>()
    blocks.set(rootBlock.id, rootBlock)

    this.document = {
      pageId,
      workspaceId,
      blocks,
      rootBlockId: rootBlock.id,
      dirtyBlocks: new Set<string>(),
      loadedAt: Date.now(),
      lastSavedAt: 0,
      isSaving: false,
    }

    this.factory = new BlockFactory()
    this.traversal = new NodeTraversal(this.document.blocks)
  }

  getPageId(): string {
    return this.document.pageId
  }

  getWorkspaceId(): string {
    return this.document.workspaceId
  }

  getRootBlockId(): string {
    return this.document.rootBlockId
  }

  getRootBlock(): Block | undefined {
    return this.document.blocks.get(this.document.rootBlockId)
  }

  getBlock(id: string): Block | undefined {
    return this.document.blocks.get(id)
  }

  getAllBlocks(): Map<string, Block> {
    return this.document.blocks
  }

  getDirtyBlocks(): Set<string> {
    return this.document.dirtyBlocks
  }

  getTraversal(): NodeTraversal {
    return this.traversal
  }

  getFactory(): BlockFactory {
    return this.factory
  }

  isDirty(): boolean {
    return this.document.dirtyBlocks.size > 0
  }

  getLoadedAt(): number {
    return this.document.loadedAt
  }

  getLastSavedAt(): number {
    return this.document.lastSavedAt
  }

  isSaving(): boolean {
    return this.document.isSaving
  }

  setSaving(saving: boolean): void {
    this.document.isSaving = saving
  }

  setLastSavedAt(timestamp: number): void {
    this.document.lastSavedAt = timestamp
  }

  markDirty(blockId: string): void {
    this.document.dirtyBlocks.add(blockId)
  }

  markClean(blockId: string): void {
    this.document.dirtyBlocks.delete(blockId)
  }

  markAllClean(): void {
    this.document.dirtyBlocks.clear()
  }

  addBlock(block: Block): void {
    this.document.blocks.set(block.id, block)

    if (block.parentId) {
      const parent = this.document.blocks.get(block.parentId)
      if (parent) {
        const children = [...parent.children]
        const insertAt = block.position
        children.splice(insertAt, 0, block.id)
        parent.children = children
        parent.updatedAt = Date.now()
        parent.version++
        this.document.dirtyBlocks.add(parent.id)
      }
    }

    this.document.dirtyBlocks.add(block.id)
  }

  removeBlock(blockId: string): Block | undefined {
    const block = this.document.blocks.get(blockId)
    if (!block) return undefined

    const removedBlocks: Block[] = []

    const removeRecursive = (id: string): void => {
      const b = this.document.blocks.get(id)
      if (!b) return

      for (const childId of [...b.children]) {
        removeRecursive(childId)
      }

      b.deletedAt = Date.now()
      b.version++
      this.document.dirtyBlocks.add(id)
      removedBlocks.push(b)
    }

    removeRecursive(blockId)

    if (block.parentId) {
      const parent = this.document.blocks.get(block.parentId)
      if (parent) {
        parent.children = parent.children.filter((id) => id !== blockId)
        parent.updatedAt = Date.now()
        parent.version++
        this.document.dirtyBlocks.add(parent.id)
      }
    }

    return block
  }

  moveBlock(blockId: string, newParentId: string, newPosition: number): Block | undefined {
    const block = this.document.blocks.get(blockId)
    if (!block) return undefined

    const oldParentId = block.parentId

    if (oldParentId && oldParentId !== newParentId) {
      const oldParent = this.document.blocks.get(oldParentId)
      if (oldParent) {
        oldParent.children = oldParent.children.filter((id) => id !== blockId)
        oldParent.updatedAt = Date.now()
        oldParent.version++
        this.document.dirtyBlocks.add(oldParent.id)
      }
    }

    block.parentId = newParentId
    block.position = newPosition
    block.updatedAt = Date.now()
    block.version++
    this.document.dirtyBlocks.add(block.id)

    const newParent = this.document.blocks.get(newParentId)
    if (newParent) {
      const children = [...newParent.children]
      children.splice(newPosition, 0, blockId)
      newParent.children = children
      newParent.updatedAt = Date.now()
      newParent.version++
      this.document.dirtyBlocks.add(newParent.id)
    }

    return block
  }

  updateBlockContent(blockId: string, content: Record<string, unknown>): Block | undefined {
    const block = this.document.blocks.get(blockId)
    if (!block) return undefined

    block.content = content
    block.updatedAt = Date.now()
    block.version++
    this.document.dirtyBlocks.add(blockId)
    return block
  }

  updateBlockMetadata(blockId: string, metadata: Record<string, unknown>): Block | undefined {
    const block = this.document.blocks.get(blockId)
    if (!block) return undefined

    block.metadata = { ...block.metadata, ...metadata }
    block.updatedAt = Date.now()
    block.version++
    this.document.dirtyBlocks.add(blockId)
    return block
  }

  toSnapshot(): Block[] {
    return Array.from(this.document.blocks.values())
      .filter((b) => b.deletedAt === null)
      .map((b) => ({ ...b }))
  }

  canUndo(): boolean {
    return this.document.dirtyBlocks.size > 0
  }
}
