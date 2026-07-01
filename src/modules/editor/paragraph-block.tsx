import * as React from 'react'
import { getCaretPosition, setCaretPosition, isAtBlockStart, isAtBlockEnd } from './block-utils.ts'
import { applyInlineFormatting, renderInlineText } from './inline-formatting.tsx'
import type { InlineFormat } from '@/core/editor/types'
import type { EditorController } from './editor-controller.ts'
import { useReadOnly } from './editor-hooks.ts'

interface ParagraphBlockProps {
  blockId: string
  text: string
  formats?: InlineFormat[]
  controller: EditorController
  onSlashOpen: (blockId: string) => void
  onSlashClose: () => void
  slashOpen: boolean
  isSelected: boolean
}

export function ParagraphBlock({
  blockId,
  text,
  controller,
  onSlashOpen,
  onSlashClose,
  slashOpen,
  isSelected: _isSelected,
}: ParagraphBlockProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const tripleClickCount = React.useRef(0)
  const lastClickTime = React.useRef(0)
  const isComposing = React.useRef(false)
  const isReadOnly = useReadOnly()

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
    controller.updateBlockContent(blockId, { text: newText })

    if (newText.startsWith('/') && !slashOpen) {
      onSlashOpen(blockId)
    } else if (slashOpen && !newText.startsWith('/')) {
      onSlashClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing.current) return

    const el = ref.current
    if (!el) return

    if (e.key === 'Home') {
      e.preventDefault()
      setCaretPosition(el, 0)
      return
    }

    if (e.key === 'End') {
      e.preventDefault()
      setCaretPosition(el, el.textContent?.length ?? 0)
      return
    }

    if (e.key === 'Enter') {
      if (slashOpen) {
        e.preventDefault()
        return
      }
      e.preventDefault()
      // Apply inline formatting from markdown syntax
      const currentText = el.textContent ?? ''
      const { formatted, text: cleanText, formats } = applyInlineFormatting(currentText)
      if (formatted) {
        controller.updateBlockContent(blockId, { text: cleanText, formats })
      }
      const newBlock = controller.insertParagraph(undefined, '', controller.getBlockIndex(blockId) + 1)
      if (newBlock) {
        requestAnimationFrame(() => controller.focusBlock(newBlock.id, 0))
      }
      return
    }

    if (e.key === 'Backspace' && isAtBlockStart(el) && text.length === 0) {
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
        const prevBlock = blockManager.getBlock(prevId)
        if (prevBlock) {
          const prevText = (prevBlock.content['text'] as string) ?? ''
          controller.focusBlock(prevId, prevText.length)
        }
      } else if (idx === 0) {
        controller.focusBlock(block.parentId, 0)
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
          const nextText = (nextBlock.content['text'] as string) ?? ''
          controller.updateBlockContent(blockId, { text: text + nextText })
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

    if (e.shiftKey && e.key === 'ArrowUp') {
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
        controller.focusBlock(prevId, 0)
      }
      return
    }

    if (e.shiftKey && e.key === 'ArrowDown') {
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
        controller.focusBlock(nextId, 0)
      }
      return
    }
  }

  const handleCompositionStart = () => {
    isComposing.current = true
  }

  const handleCompositionEnd = () => {
    isComposing.current = false
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const now = Date.now()
    if (now - lastClickTime.current < 400) {
      tripleClickCount.current += 1
      if (tripleClickCount.current >= 2) {
        e.preventDefault()
        const range = document.createRange()
        range.selectNodeContents(e.currentTarget)
        const sel = window.getSelection()
        if (sel) {
          sel.removeAllRanges()
          sel.addRange(range)
        }
        tripleClickCount.current = 0
        lastClickTime.current = 0
        return
      }
    } else {
      tripleClickCount.current = 1
    }
    lastClickTime.current = now
  }

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      const sel = window.getSelection()
      if (sel) {
        const anchorBlock = controller.getSelectedBlockIds()[0]
        if (anchorBlock && anchorBlock !== blockId) {
          controller.setSelection({ type: 'range', anchorBlockId: anchorBlock, focusBlockId: blockId, anchorOffset: 0, focusOffset: 0, selectedBlockIds: [anchorBlock, blockId] })
        }
      }
    }
  }

  return (
    <div className="relative">
      {isReadOnly ? (
        <div
          id={`block-${blockId}`}
          role="textbox"
          aria-label="Paragraph"
          aria-multiline="false"
          className="relative min-h-[1.5em] outline-none break-words whitespace-pre-wrap"
        >
          {renderInlineText(text, formats)}
        </div>
      ) : (
        <div
          ref={ref}
          id={`block-${blockId}`}
          role="textbox"
          aria-label="Paragraph"
          aria-multiline="false"
          contentEditable
          suppressContentEditableWarning
          className="relative min-h-[1.5em] outline-none break-words whitespace-pre-wrap"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          {text}
        </div>
      )}
    </div>
  )
}
