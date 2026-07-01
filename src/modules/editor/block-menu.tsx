import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { EditorController } from './editor-controller.ts'

interface BlockMenuProps {
  blockId: string
  blockType: string
  open: boolean
  onClose: () => void
  controller: EditorController
  anchorEl: HTMLElement | null
}

export function BlockMenu({ blockId, blockType, open, onClose, controller, anchorEl }: BlockMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })

  React.useEffect(() => {
    if (open && anchorEl) {
      const rect = anchorEl.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 2,
        left: rect.left + window.scrollX,
      })
    }
  }, [open, anchorEl])

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler, true)
    return () => document.removeEventListener('mousedown', handler, true)
  }, [open, onClose])

  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const items: { label: string; action: () => void; disabled: boolean }[] = [
    {
      label: 'Duplicate',
      action: () => {
        const cloned = controller.duplicateBlock(blockId)
        if (cloned) {
          controller.focusBlock(cloned.id, 0)
        }
        onClose()
      },
      disabled: false,
    },
    {
      label: 'Copy',
      action: () => {
        controller.copyBlock(blockId)
        onClose()
      },
      disabled: false,
    },
    {
      label: 'Cut',
      action: () => {
        controller.cutBlock(blockId)
        onClose()
      },
      disabled: false,
    },
    {
      label: 'Paste below',
      action: () => {
        controller.pasteBlockAfter(blockId)
        onClose()
      },
      disabled: false,
    },
    {
      label: 'Delete',
      action: () => {
        controller.deleteBlock(blockId)
        onClose()
      },
      disabled: false,
    },
  ]

  if (blockType === 'heading') {
    items.push({
      label: 'Convert to paragraph',
      action: () => {
        controller.convertToParagraph(blockId)
        onClose()
      },
      disabled: false,
    })
  }

  if (!open) return null

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Block menu"
      className={cn(
        'fixed z-[100] min-w-[160px] rounded-lg border bg-popover p-1 shadow-md',
        'animate-in fade-in slide-in-from-top-1 duration-100'
      )}
      style={{ top: position.top, left: position.left }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm',
            'text-popover-foreground hover:bg-accent hover:text-accent-foreground',
            'transition-colors disabled:opacity-40',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
          )}
          onClick={item.action}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
