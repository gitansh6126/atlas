import type { EditorController } from '@/modules/editor/editor-controller'
import type { Block } from '@/core/editor/types'

interface ClipboardEntry {
  blocks: Block[]
  timestamp: number
}

export class ClipboardManager {
  private controller: EditorController
  private internalClipboard: ClipboardEntry | null = null

  constructor(controller: EditorController) {
    this.controller = controller
  }

  copyBlocks(blockIds: string[]): void {
    if (blockIds.length === 0) return
    const blocks = blockIds
      .map((id) => this.controller.getBlock(id))
      .filter((b): b is Block => b !== undefined)

    if (blocks.length === 0) return

    this.internalClipboard = {
      blocks: blocks.map((b) => ({ ...b })),
      timestamp: Date.now(),
    }

    if (blockIds.length === 1) {
      this.controller.copyBlock(blockIds[0])
    } else {
      const plainText = blocks.map((b) => b.plainText).join('\n')
      navigator.clipboard.writeText(plainText).catch(() => {})
    }
  }

  cutBlocks(blockIds: string[]): void {
    this.copyBlocks(blockIds)
    for (const id of blockIds) {
      this.controller.deleteBlock(id)
    }
  }

  pasteBlocks(targetBlockId: string): void {
    const internal = this.internalClipboard
    if (internal && internal.blocks.length > 0) {
      this.pasteInternal(targetBlockId, internal.blocks)
      return
    }

    navigator.clipboard.readText().then((text) => {
      if (!text) return
      const block = this.controller.getBlock(targetBlockId)
      if (!block) return
      const parentId = block.parentId
      if (!parentId) return
      const idx = this.controller.getBlockIndex(targetBlockId)
      if (idx === -1) return
      const lines = text.split('\n').filter((l) => l.length > 0)
      for (let i = 0; i < lines.length; i++) {
        this.controller.insertBlock('paragraph', parentId, idx + 1 + i, { text: lines[i] })
      }
    }).catch(() => {})
  }

  duplicateBlocks(blockIds: string[]): void {
    if (blockIds.length === 0) return
    let lastInserted: Block | null = null
    for (const id of blockIds) {
      const block = this.controller.getBlock(id)
      if (!block) continue
      const cloned = this.controller.duplicateBlock(id)
      if (cloned) lastInserted = cloned
    }
    if (lastInserted) {
      this.controller.focusBlock(lastInserted.id, 0)
    }
  }

  hasInternalData(): boolean {
    return this.internalClipboard !== null
  }

  private pasteInternal(targetBlockId: string, blocks: Block[]): void {
    const target = this.controller.getBlock(targetBlockId)
    if (!target) return
    const parentId = target.parentId
    if (!parentId) return
    const idx = this.controller.getBlockIndex(targetBlockId)
    if (idx === -1) return

    for (let i = 0; i < blocks.length; i++) {
      this.controller.insertBlock(blocks[i].type, parentId, idx + 1 + i, blocks[i].content)
    }
  }
}
