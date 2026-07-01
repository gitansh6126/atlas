import React from 'react'
import { getCaretPosition, setCaretPosition, isAtBlockStart, isAtBlockEnd } from '@/modules/editor/block-utils'
import { BlockPlaceholder } from '@/modules/editor/block-placeholder'
import type { EditorController } from '@/modules/editor/editor-controller'

interface NumberedListItemRendererProps {
  blockId: string
  text: string
  indent?: number
  number?: number
  controller: EditorController
  isSelected?: boolean
}

export function NumberedListItemRenderer({
  blockId,
  text,
  indent = 0,
  number = 1,
  controller,
  isSelected: _isSelected,
}: NumberedListItemRendererProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isComposing = React.useRef(false)
  const indentStyle = { marginLeft: `${indent * 24}px` }

  React.useEffect(() => {
    if (ref.current && ref.current.textContent !== text) {
      const el = ref.current
      const saved = getCaretPosition(el)
      el.textContent = text
      setCaretPosition(el, saved)
    }
  }, [text])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = (e.target as HTMLDivElement).textContent ?? ''
    controller.updateBlockContent(blockId, { text: newText, indent, number })
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing.current) return
    const el = ref.current
    if (!el) return

    if (e.key === 'Home') { e.preventDefault(); setCaretPosition(el, 0); return }
    if (e.key === 'End') { e.preventDefault(); setCaretPosition(el, el.textContent?.length ?? 0); return }

    if (e.key === 'Enter') {
      e.preventDefault()
      const newBlock = await controller.insertBlock('ordered_list_item', undefined, controller.getBlockIndex(blockId) + 1, { text: '', indent, number: number + 1 })
      if (newBlock) {
        requestAnimationFrame(() => controller.focusBlock(newBlock.id, 0))
      }
      return
    }

    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      controller.updateBlockContent(blockId, { text, indent: Math.min(indent + 1, 8), number })
      return
    }

    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      controller.updateBlockContent(blockId, { text, indent: Math.max(indent - 1, 0), number })
      return
    }

    if (e.key === 'Backspace' && isAtBlockStart(el) && text.length === 0 && indent > 0) {
      e.preventDefault()
      controller.updateBlockContent(blockId, { text, indent: indent - 1, number })
      return
    }

    if (e.key === 'Backspace' && isAtBlockStart(el) && text.length === 0 && indent === 0) {
      e.preventDefault()
      const blockManager = controller.getBlockManager()
      if (!blockManager) return
      const block = blockManager.getBlock(blockId)
      if (!block || !block.parentId) return
      const parent = blockManager.getBlock(block.parentId)
      if (!parent || !parent.children) return
      const idx = parent.children.indexOf(blockId)
      if (idx > 0) {
        const prevId = parent.children[idx - 1]
        controller.deleteBlock(blockId)
        controller.focusBlock(prevId)
      }
      return
    }

    if (e.key === 'Delete' && isAtBlockEnd(el) && text.length > 0) {
      e.preventDefault()
      const blockManager = controller.getBlockManager()
      if (!blockManager) return
      const block = blockManager.getBlock(blockId)
      if (!block || !block.parentId) return
      const parent = blockManager.getBlock(block.parentId)
      if (!parent || !parent.children) return
      const idx = parent.children.indexOf(blockId)
      if (idx < parent.children.length - 1) {
        const nextId = parent.children[idx + 1]
        const nextBlock = blockManager.getBlock(nextId)
        if (nextBlock) {
          controller.updateBlockContent(blockId, { text: text + (nextBlock.content['text'] as string ?? ''), indent, number })
          controller.deleteBlock(nextId)
        }
      }
      return
    }

    if (e.key === 'Delete' && isAtBlockEnd(el) && text.length === 0) {
      e.preventDefault()
      const blockManager = controller.getBlockManager()
      if (!blockManager) return
      const block = blockManager.getBlock(blockId)
      if (!block || !block.parentId) return
      const parent = blockManager.getBlock(block.parentId)
      if (!parent || !parent.children) return
      const idx = parent.children.indexOf(blockId)
      if (idx < parent.children.length - 1) {
        controller.deleteBlock(blockId)
      }
      return
    }
  }

  const handleCompositionStart = () => { isComposing.current = true }
  const handleCompositionEnd = () => { isComposing.current = false }

  return (
    <div className="relative flex items-start gap-2" style={indentStyle}>
      <span className="mt-0 flex h-[1.5em] w-6 shrink-0 items-center justify-end text-sm tabular-nums text-muted-foreground select-none" aria-hidden>
        {number}.
      </span>
      <div className="relative flex-1">
        {text.length === 0 && <BlockPlaceholder blockType="numbered-list" />}
        <div
          ref={ref}
          id={`block-${blockId}`}
          role="textbox"
          aria-label="Numbered list item"
          aria-multiline="false"
          contentEditable
          suppressContentEditableWarning
          className="relative min-h-[1.5em] outline-none break-words whitespace-pre-wrap"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        >
          {text}
        </div>
      </div>
    </div>
  )
}
