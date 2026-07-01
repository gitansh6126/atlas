import React from 'react'
import { cn } from '@/shared/utils/cn'
import { getCaretPosition, setCaretPosition, isAtBlockStart, isAtBlockEnd } from '@/modules/editor/block-utils'
import { BlockPlaceholder } from '@/modules/editor/block-placeholder'
import type { EditorController } from '@/modules/editor/editor-controller'

type CalloutVariant = 'info' | 'warning' | 'success' | 'danger' | 'tip'

interface CalloutRendererProps {
  blockId: string
  text: string
  variant?: CalloutVariant
  controller: EditorController
  isSelected?: boolean
}

const variantConfig: Record<CalloutVariant, { bg: string; border: string; icon: string; label: string }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'ℹ️',
    label: 'Info',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    icon: '⚠️',
    label: 'Warning',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    icon: '✅',
    label: 'Success',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    icon: '🚫',
    label: 'Danger',
  },
  tip: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    icon: '💡',
    label: 'Tip',
  },
}

export function CalloutRenderer({
  blockId,
  text,
  variant = 'info',
  controller,
  isSelected: _isSelected,
}: CalloutRendererProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isComposing = React.useRef(false)
  const cfg = variantConfig[variant] ?? variantConfig.info

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
    controller.updateBlockContent(blockId, { text: newText, variant })
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
  }

  const handleCompositionStart = () => { isComposing.current = true }
  const handleCompositionEnd = () => { isComposing.current = false }

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-4',
        cfg.bg,
        cfg.border
      )}
    >
      <span className="mt-0 shrink-0 text-lg leading-none select-none" aria-hidden>
        {cfg.icon}
      </span>
      <div className="relative flex-1">
        {text.length === 0 && <BlockPlaceholder blockType="callout" />}
        <div
          ref={ref}
          id={`block-${blockId}`}
          role="textbox"
          aria-label={`Callout (${cfg.label})`}
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
