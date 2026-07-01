import React from 'react'
import { cn } from '@/shared/utils/cn'
import { getCaretPosition, setCaretPosition, isAtBlockStart, isAtBlockEnd } from './block-utils.ts'
import { BlockPlaceholder } from './block-placeholder.tsx'
import type { EditorController } from './editor-controller.ts'
import { useReadOnly } from './editor-hooks.ts'

interface HeadingBlockProps {
  blockId: string
  text: string
  level: number
  controller: EditorController
  isSelected: boolean
}

export function HeadingBlock({
  blockId,
  text,
  level,
  controller,
  isSelected: _isSelected,
}: HeadingBlockProps) {
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
    controller.updateBlockContent(blockId, { text: newText, level })
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

    if (e.key === 'Backspace' && isAtBlockStart(el) && text.length > 0 && level > 1) {
      e.preventDefault()
      controller.updateBlockContent(blockId, { text, level: level - 1 })
      return
    }

    if (e.key === 'Backspace' && isAtBlockStart(el) && text.length > 0 && level === 1) {
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
        const nextId = parent.children[idx + 1]
        controller.deleteBlock(nextId)
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
      const anchorBlock = controller.getSelectedBlockIds()[0]
      if (anchorBlock && anchorBlock !== blockId) {
        controller.setSelection({ type: 'range', anchorBlockId: anchorBlock, focusBlockId: blockId, anchorOffset: 0, focusOffset: 0, selectedBlockIds: [anchorBlock, blockId] })
      }
    }
  }

  const Tag = (`h${Math.min(Math.max(level, 1), 3)}` as 'h1') as 'h1' | 'h2' | 'h3'
  const tagClass = level === 1 ? 'text-3xl font-bold' : level === 2 ? 'text-2xl font-semibold' : 'text-xl font-semibold'

  return (
    <div className="relative">
      {text.length === 0 && !isReadOnly && <BlockPlaceholder blockType="heading" level={level} />}
      <Tag
        ref={ref}
        id={`block-${blockId}`}
        role="textbox"
        aria-label={`Heading ${level}`}
        aria-multiline="false"
        aria-placeholder={`Heading ${level}`}
        contentEditable={!isReadOnly}
        suppressContentEditableWarning
        className={cn('relative outline-none break-words whitespace-pre-wrap', tagClass)}
        onInput={!isReadOnly ? handleInput : undefined}
        onKeyDown={!isReadOnly ? handleKeyDown : undefined}
        onCompositionStart={!isReadOnly ? handleCompositionStart : undefined}
        onCompositionEnd={!isReadOnly ? handleCompositionEnd : undefined}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        {text}
      </Tag>
    </div>
  )
}
