import React from 'react'
import { cn } from '@/shared/utils/cn'
import { getCaretPosition, setCaretPosition, isAtBlockStart, isAtBlockEnd } from '@/modules/editor/block-utils'
import { BlockPlaceholder } from '@/modules/editor/block-placeholder'
import type { EditorController } from '@/modules/editor/editor-controller'

interface ChecklistRendererProps {
  blockId: string
  text: string
  checked?: boolean
  controller: EditorController
  isSelected?: boolean
}

export function ChecklistRenderer({
  blockId,
  text,
  checked = false,
  controller,
  isSelected: _isSelected,
}: ChecklistRendererProps) {
  const ref = React.useRef<HTMLDivElement>(null)
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
    controller.updateBlockContent(blockId, { text: newText, checked })
  }

  const toggleChecked = () => {
    controller.updateBlockContent(blockId, { text, checked: !checked })
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing.current) return
    const el = ref.current
    if (!el) return

    if (e.key === 'Home') { e.preventDefault(); setCaretPosition(el, 0); return }
    if (e.key === 'End') { e.preventDefault(); setCaretPosition(el, el.textContent?.length ?? 0); return }

    if (e.key === 'Enter') {
      e.preventDefault()
      const newBlock = await controller.insertBlock('checklist', undefined, controller.getBlockIndex(blockId) + 1, { text: '', checked: false })
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
          controller.updateBlockContent(blockId, { text: text + (nextBlock.content['text'] as string ?? ''), checked })
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
    <div className="relative flex items-start gap-2">
      <button
        type="button"
        tabIndex={-1}
        aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
        className="mt-0.5 flex h-[1.2em] w-[1.2em] shrink-0 items-center justify-center rounded border transition-colors hover:bg-accent"
        style={{ borderColor: checked ? 'var(--primary)' : 'var(--border)', backgroundColor: checked ? 'var(--primary)' : 'transparent' }}
        onClick={toggleChecked}
        onMouseDown={(e) => e.preventDefault()}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-primary-foreground">
            <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="relative flex-1">
        {text.length === 0 && <BlockPlaceholder blockType="checklist" />}
        <div
          ref={ref}
          id={`block-${blockId}`}
          role="textbox"
          aria-label="Checklist item"
          aria-multiline="false"
          contentEditable
          suppressContentEditableWarning
          className={cn(
            'relative min-h-[1.5em] outline-none break-words whitespace-pre-wrap',
            checked && 'line-through opacity-60'
          )}
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
