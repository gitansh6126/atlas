import React from 'react'
import { getCaretPosition, setCaretPosition, isAtBlockStart, isAtBlockEnd } from '@/modules/editor/block-utils'
import { BlockPlaceholder } from '@/modules/editor/block-placeholder'
import type { EditorController } from '@/modules/editor/editor-controller'

interface QuoteRendererProps {
  blockId: string
  text: string
  controller: EditorController
  isSelected?: boolean
}

export function QuoteRenderer({
  blockId,
  text,
  controller,
  isSelected: _isSelected,
}: QuoteRendererProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const tripleClickCount = React.useRef(0)
  const lastClickTime = React.useRef(0)
  const isComposing = React.useRef(false)

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
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing.current) return
    const el = ref.current
    if (!el) return

    if (e.key === 'Home') { e.preventDefault(); setCaretPosition(el, 0); return }
    if (e.key === 'End') { e.preventDefault(); setCaretPosition(el, el.textContent?.length ?? 0); return }

    if (e.key === 'Enter') {
      e.preventDefault()
      const newBlock = controller.insertParagraph(undefined, '', controller.getBlockIndex(blockId) + 1)
      if (newBlock) {
        requestAnimationFrame(() => controller.focusBlock(newBlock.id, 0))
      }
      return
    }

    if (e.key === 'Backspace' && isAtBlockStart(el) && text.length === 0) {
      e.preventDefault()
      controller.convertToParagraph(blockId)
      controller.focusBlock(blockId, 0)
      return
    }

    if (e.key === 'Backspace' && isAtBlockStart(el) && text.length > 0) {
      e.preventDefault()
      controller.convertToParagraph(blockId)
      controller.focusBlock(blockId, 0)
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
        controller.deleteBlock(parent.children[idx + 1])
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
      if (idx > 0) { controller.focusBlock(parent.children[idx - 1], 0) }
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
      if (idx < parent.children.length - 1) { controller.focusBlock(parent.children[idx + 1], 0) }
      return
    }
  }

  const handleCompositionStart = () => { isComposing.current = true }
  const handleCompositionEnd = () => { isComposing.current = false }

  const handleMouseDown = (e: React.MouseEvent) => {
    const now = Date.now()
    if (now - lastClickTime.current < 400) {
      tripleClickCount.current += 1
      if (tripleClickCount.current >= 2) {
        e.preventDefault()
        const range = document.createRange()
        range.selectNodeContents(e.currentTarget)
        const sel = window.getSelection()
        if (sel) { sel.removeAllRanges(); sel.addRange(range) }
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
      const anchorBlock = controller.getSelectedBlockIds()[0]
      if (anchorBlock && anchorBlock !== blockId) {
        controller.setSelection({
          type: 'block',
          anchorBlockId: anchorBlock,
          focusBlockId: blockId,
          anchorOffset: 0,
          focusOffset: 0,
          selectedBlockIds: [],
        })
      }
    }
  }

  return (
    <div className="relative border-l-[3px] border-muted-foreground/30 pl-4">
      {text.length === 0 && <BlockPlaceholder blockType="quote" />}
      <div
        ref={ref}
        id={`block-${blockId}`}
        role="textbox"
        aria-label="Quote"
        aria-multiline="false"
        aria-placeholder="Quote"
        contentEditable
        suppressContentEditableWarning
        className="relative min-h-[1.5em] text-[1.1em] italic text-muted-foreground/90 outline-none break-words whitespace-pre-wrap"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        {text}
      </div>
    </div>
  )
}
