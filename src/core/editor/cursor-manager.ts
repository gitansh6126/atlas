import type { CursorPosition } from './types'
import { DocumentModel } from './document-model'

export class CursorManager {
  private cursor: CursorPosition | null = null;
  private document: DocumentModel;

  constructor(document: DocumentModel) {
    this.document = document
  }

  getCursor(): CursorPosition | null {
    return this.cursor
  }

  setCursor(blockId: string, offset: number): void {
    const block = this.document.getBlock(blockId)
    if (!block || block.deletedAt !== null) return

    this.cursor = { blockId, offset }
  }

  clearCursor(): void {
    this.cursor = null
  }

  moveToStart(blockId: string): void {
    this.setCursor(blockId, 0)
  }

  moveToEnd(blockId: string): void {
    const block = this.document.getBlock(blockId)
    if (!block) return
    const textLength = (block.content?.text as string)?.length ?? 0
    this.setCursor(blockId, textLength)
  }

  moveLeft(): void {
    if (!this.cursor) return
    const { blockId, offset } = this.cursor

    if (offset > 0) {
      this.setCursor(blockId, offset - 1)
      return
    }

    const block = this.document.getBlock(blockId)
    if (!block) return

    const traversal = this.document.getTraversal()
    const prevBlock = traversal.getPreviousBlock(block)
    if (prevBlock) {
      this.moveToEnd(prevBlock.id)
    }
  }

  moveRight(): void {
    if (!this.cursor) return
    const { blockId, offset } = this.cursor

    const block = this.document.getBlock(blockId)
    if (!block) return

    const textLength = (block.content?.text as string)?.length ?? 0

    if (offset < textLength) {
      this.setCursor(blockId, offset + 1)
      return
    }

    const traversal = this.document.getTraversal()
    const nextBlock = traversal.getNextBlock(block)
    if (nextBlock) {
      this.moveToStart(nextBlock.id)
    }
  }

  moveUp(): void {
    if (!this.cursor) return
    const { blockId } = this.cursor
    const block = this.document.getBlock(blockId)
    if (!block) return

    const traversal = this.document.getTraversal()
    const prevBlock = traversal.getPreviousBlock(block)
    if (prevBlock) {
      this.moveToEnd(prevBlock.id)
    }
  }

  moveDown(): void {
    if (!this.cursor) return
    const { blockId } = this.cursor
    const block = this.document.getBlock(blockId)
    if (!block) return

    const traversal = this.document.getTraversal()
    const nextBlock = traversal.getNextBlock(block)
    if (nextBlock) {
      this.moveToStart(nextBlock.id)
    }
  }

  hasCursor(): boolean {
    return this.cursor !== null
  }

  getCursorBlockId(): string | null {
    return this.cursor?.blockId ?? null
  }

  getCursorOffset(): number {
    return this.cursor?.offset ?? 0
  }
}
