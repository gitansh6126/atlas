import React from 'react'
import { cn } from '@/shared/utils/cn'
import { getCaretPosition, setCaretPosition, isAtBlockStart, isAtBlockEnd } from '@/modules/editor/block-utils'
import { BlockPlaceholder } from '@/modules/editor/block-placeholder'
import type { EditorController } from '@/modules/editor/editor-controller'

interface ToggleRendererProps {
  blockId: string
  text: string
  collapsed?: boolean
  controller: EditorController
  isSelected?: boolean
}

export function ToggleRenderer({
  blockId,
  text,
  collapsed = true,
  controller,
  isSelected: _isSelected,
}: ToggleRendererProps) {
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
    controller.updateBlockContent(blockId, { text: newText, collapsed })
  }

  const toggleCollapsed = () => {
    controller.updateBlockContent(blockId, { text, collapsed: !collapsed })
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing.current) return
    const el = ref.current
    if (!el) return

    if (e.key === 'Home') { e.preventDefault(); setCaretPosition(el, 0); return }
    if (e.key === 'End') { e.preventDefault(); setCaretPosition(el, el.textContent?.length ?? 0); return }

    if (e.key === 'Enter') {
      e.preventDefault()
      const newBlock = await controller.insertBlock('toggle', undefined, controller.getBlockIndex(blockId) + 1, { text: '', collapsed: true })
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
          controller.updateBlockContent(blockId, { text: text + (nextBlock.content['text'] as string ?? ''), collapsed })
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
    <div className="relative">
      <div className="flex items-start gap-1">
        <button
          type="button"
          tabIndex={-1}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent/50 transition-colors"
          onClick={toggleCollapsed}
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className={cn('transition-transform', collapsed ? '' : 'rotate-90')}
          >
            <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="relative flex-1">
          {text.length === 0 && <BlockPlaceholder blockType="toggle" />}
          <div
            ref={ref}
            id={`block-${blockId}`}
            role="textbox"
            aria-label="Toggle"
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
    </div>
  )
}
