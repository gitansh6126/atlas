import React from 'react'
import { getCaretPosition, setCaretPosition, isAtBlockStart, isAtBlockEnd } from '@/modules/editor/block-utils'
import { BlockPlaceholder } from '@/modules/editor/block-placeholder'
import type { EditorController } from '@/modules/editor/editor-controller'

interface BulletedListItemRendererProps {
  blockId: string
  text: string
  indent?: number
  controller: EditorController
  isSelected?: boolean
}

export function BulletedListItemRenderer({
  blockId,
  text,
  indent = 0,
  controller,
  isSelected: _isSelected,
}: BulletedListItemRendererProps) {
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
    controller.updateBlockContent(blockId, { text: newText, indent })
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing.current) return
    const el = ref.current
    if (!el) return

    if (e.key === 'Home') { e.preventDefault(); setCaretPosition(el, 0); return }
    if (e.key === 'End') { e.preventDefault(); setCaretPosition(el, el.textContent?.length ?? 0); return }

    if (e.key === 'Enter') {
      e.preventDefault()
      const newBlock = await controller.insertBlock('bullet_list_item', undefined, controller.getBlockIndex(blockId) + 1, { text: '', indent })
      if (newBlock) {
        requestAnimationFrame(() => controller.focusBlock(newBlock.id, 0))
      }
      return
    }

    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      controller.updateBlockContent(blockId, { text, indent: Math.min(indent + 1, 8) })
      return
    }

    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      controller.updateBlockContent(blockId, { text, indent: Math.max(indent - 1, 0) })
      return
    }

    if (e.key === 'Backspace' && isAtBlockStart(el) && text.length === 0 && indent > 0) {
      e.preventDefault()
      controller.updateBlockContent(blockId, { text, indent: indent - 1 })
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
          controller.updateBlockContent(blockId, { text: text + (nextBlock.content['text'] as string ?? ''), indent })
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
      <span className="mt-0 flex h-[1.5em] w-4 shrink-0 items-center justify-center text-muted-foreground select-none" aria-hidden>
        {'•'}
      </span>
      <div className="relative flex-1">
        {text.length === 0 && <BlockPlaceholder blockType="bulleted-list" />}
        <div
          ref={ref}
          id={`block-${blockId}`}
          role="textbox"
          aria-label="Bulleted list item"
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
