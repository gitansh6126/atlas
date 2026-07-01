import React from 'react'
import type { EditorController } from '@/modules/editor/editor-controller'

interface DividerRendererProps {
  blockId: string
  controller: EditorController
}

export function DividerRenderer({ blockId, controller }: DividerRendererProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const idx = controller.getBlockIndex(blockId)
      const newBlock = controller.insertParagraph(undefined, '', idx + 1)
      if (newBlock) {
        requestAnimationFrame(() => controller.focusBlock(newBlock.id, 0))
      }
      return
    }

    if (e.key === 'Backspace') {
      e.preventDefault()
      controller.deleteBlock(blockId)
      return
    }

    if (e.key === 'Delete') {
      e.preventDefault()
      controller.deleteBlock(blockId)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const blockManager = controller.getBlockManager()
      if (!blockManager) return
      const block = blockManager.getBlock(blockId)
      if (!block || !block.parentId) return
      const parent = blockManager.getBlock(block.parentId)
      if (!parent || !parent.children) return
      const idx = parent.children.indexOf(blockId)
      if (idx > 0) { controller.focusBlock(parent.children[idx - 1], 0) }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const blockManager = controller.getBlockManager()
      if (!blockManager) return
      const block = blockManager.getBlock(blockId)
      if (!block || !block.parentId) return
      const parent = blockManager.getBlock(block.parentId)
      if (!parent || !parent.children) return
      const idx = parent.children.indexOf(blockId)
      if (idx < parent.children.length - 1) { controller.focusBlock(parent.children[idx + 1], 0) }
      return
    }
  }

  return (
    <div
      id={`block-${blockId}`}
      role="separator"
      aria-label="Divider"
      tabIndex={0}
      className="relative flex cursor-default items-center justify-center py-4 outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:rounded-sm"
      onKeyDown={handleKeyDown}
    >
      <hr className="w-full border-t" />
    </div>
  )
}
