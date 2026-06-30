import type { Selection, CursorPosition } from './types'
import { DocumentModel } from './document-model'

export class SelectionManager {
  private selection: Selection;
  private document: DocumentModel;

  constructor(document: DocumentModel) {
    this.document = document
    this.selection = this.createEmptySelection()
  }

  private createEmptySelection(): Selection {
    return {
      type: 'cursor',
      anchorBlockId: '',
      anchorOffset: 0,
      focusBlockId: '',
      focusOffset: 0,
      selectedBlockIds: [],
    }
  }

  getSelection(): Selection {
    return this.selection
  }

  setSelection(selection: Selection): void {
    this.selection = { ...selection }
  }

  setCursor(blockId: string, offset: number): void {
    this.selection = {
      type: 'cursor',
      anchorBlockId: blockId,
      anchorOffset: offset,
      focusBlockId: blockId,
      focusOffset: offset,
      selectedBlockIds: [blockId],
    }
  }

  setRange(anchorBlockId: string, anchorOffset: number, focusBlockId: string, focusOffset: number): void {
    this.selection = {
      type: 'range',
      anchorBlockId,
      anchorOffset,
      focusBlockId,
      focusOffset,
      selectedBlockIds: this.computeSelectedBlockIds(anchorBlockId, focusBlockId),
    }
  }

  selectBlock(blockId: string): void {
    this.selection = {
      type: 'block',
      anchorBlockId: blockId,
      anchorOffset: 0,
      focusBlockId: blockId,
      focusOffset: 0,
      selectedBlockIds: [blockId],
    }
  }

  selectBlocks(blockIds: string[]): void {
    if (blockIds.length === 0) {
      this.clearSelection()
      return
    }
    this.selection = {
      type: 'block',
      anchorBlockId: blockIds[0],
      anchorOffset: 0,
      focusBlockId: blockIds[blockIds.length - 1],
      focusOffset: 0,
      selectedBlockIds: [...blockIds],
    }
  }

  clearSelection(): void {
    this.selection = this.createEmptySelection()
  }

  isCollapsed(): boolean {
    return (
      this.selection.anchorBlockId === this.selection.focusBlockId &&
      this.selection.anchorOffset === this.selection.focusOffset
    )
  }

  hasSelection(): boolean {
    return this.selection.anchorBlockId !== ''
  }

  getCursorPosition(): CursorPosition | null {
    if (!this.hasSelection()) return null
    return {
      blockId: this.selection.focusBlockId,
      offset: this.selection.focusOffset,
    }
  }

  getSelectedBlocks(): string[] {
    return [...this.selection.selectedBlockIds]
  }

  moveCursorToStart(blockId: string): void {
    this.setCursor(blockId, 0)
  }

  moveCursorToEnd(blockId: string): void {
    const block = this.document.getBlock(blockId)
    if (!block) return
    const textLength = (block.content?.text as string)?.length ?? 0
    this.setCursor(blockId, textLength)
  }

  moveCursorUp(currentBlockId?: string): void {
    const blockId = currentBlockId ?? this.selection.focusBlockId
    if (!blockId) return

    const block = this.document.getBlock(blockId)
    if (!block) return

    const traversal = this.document.getTraversal()
    const prevBlock = traversal.getPreviousBlock(block)
    if (prevBlock) {
      this.moveCursorToEnd(prevBlock.id)
    }
  }

  moveCursorDown(currentBlockId?: string): void {
    const blockId = currentBlockId ?? this.selection.focusBlockId
    if (!blockId) return

    const block = this.document.getBlock(blockId)
    if (!block) return

    const traversal = this.document.getTraversal()
    const nextBlock = traversal.getNextBlock(block)
    if (nextBlock) {
      this.moveCursorToStart(nextBlock.id)
    }
  }

  private computeSelectedBlockIds(anchorBlockId: string, focusBlockId: string): string[] {
    if (anchorBlockId === focusBlockId) {
      return [anchorBlockId]
    }

    const allBlocks = Array.from(this.document.getAllBlocks().values())
      .filter((b) => b.deletedAt === null)
      .sort((a, b) => a.position - b.position)

    const result: string[] = []
    let capturing = false

    for (const block of allBlocks) {
      if (block.id === anchorBlockId || block.id === focusBlockId) {
        capturing = !capturing || result.length === 0
        result.push(block.id)
        if (!capturing) break
        continue
      }
      if (capturing) {
        result.push(block.id)
      }
    }

    return result
  }
}
