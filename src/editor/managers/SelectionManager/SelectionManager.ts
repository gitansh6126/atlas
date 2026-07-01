import type { EditorController } from '@/modules/editor/editor-controller'
import type { Selection } from '@/core/editor/types'

export class SelectionManager {
  private controller: EditorController
  private selectedBlockIds: string[] = []
  private focusedBlockId: string | null = null
  private lastSelectedBlockId: string | null = null

  constructor(controller: EditorController) {
    this.controller = controller
  }

  getSelectedBlockIds(): string[] {
    return this.selectedBlockIds
  }

  getFocusedBlockId(): string | null {
    return this.focusedBlockId
  }

  getLastSelectedBlockId(): string | null {
    return this.lastSelectedBlockId
  }

  selectBlock(blockId: string): void {
    this.selectedBlockIds = [blockId]
    this.lastSelectedBlockId = blockId
    this.focusedBlockId = blockId
    this.controller.selectBlock(blockId)
  }

  selectBlocks(blockIds: string[]): void {
    this.selectedBlockIds = blockIds
    if (blockIds.length > 0) {
      this.lastSelectedBlockId = blockIds[blockIds.length - 1]
    }
    this.controller.selectBlocks(blockIds)
  }

  toggleBlockSelection(blockId: string): void {
    const idx = this.selectedBlockIds.indexOf(blockId)
    if (idx >= 0) {
      this.selectedBlockIds = this.selectedBlockIds.filter((id) => id !== blockId)
    } else {
      this.selectedBlockIds = [...this.selectedBlockIds, blockId]
    }
    this.lastSelectedBlockId = blockId
    this.controller.selectBlocks(this.selectedBlockIds)
  }

  selectRange(fromId: string, toId: string): void {
    const blockIds = this.getBlocksInRange(fromId, toId)
    this.selectBlocks(blockIds)
  }

  clearSelection(): void {
    this.selectedBlockIds = []
    this.lastSelectedBlockId = null
    this.controller.selectBlocks([])
  }

  isSelected(blockId: string): boolean {
    return this.selectedBlockIds.includes(blockId)
  }

  isMultiSelected(): boolean {
    return this.selectedBlockIds.length > 1
  }

  focusBlock(blockId: string, offset: number = 0): void {
    this.focusedBlockId = blockId
    this.controller.focusBlock(blockId, offset)
  }

  getSelection(): Selection | null {
    return this.controller.getSelection()
  }

  syncFromController(): void {
    this.selectedBlockIds = this.controller.getSelectedBlockIds()
    const sel = this.controller.getSelection()
    if (sel && 'anchorBlockId' in sel) {
      this.focusedBlockId = (sel as { anchorBlockId: string }).anchorBlockId
    }
  }

  private getBlocksInRange(fromId: string, toId: string): string[] {
    const root = this.controller.getRenderTree()[0]
    if (!root?.children) return []

    const childIds = root.children.map((n) => n.blockId)
    const fromIdx = childIds.indexOf(fromId)
    const toIdx = childIds.indexOf(toId)
    if (fromIdx === -1 || toIdx === -1) return []

    const start = Math.min(fromIdx, toIdx)
    const end = Math.max(fromIdx, toIdx)
    return childIds.slice(start, end + 1)
  }
}
