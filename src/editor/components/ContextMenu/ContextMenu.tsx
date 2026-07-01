import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { EditorController } from '@/modules/editor/editor-controller'

interface ContextMenuProps {
  blockId: string
  blockType: string
  open: boolean
  onClose: () => void
  controller: EditorController
  anchorEl: HTMLElement | null
  onConvert?: (blockId: string, newType: string) => void
}

interface MenuItem {
  label: string
  action: () => void
  disabled?: boolean
}

export function ContextMenu({
  blockId,
  blockType,
  open,
  onClose,
  controller,
  anchorEl,
  onConvert,
}: ContextMenuProps) {
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
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleDuplicate = () => {
    const cloned = controller.duplicateBlock(blockId)
    if (cloned) controller.focusBlock(cloned.id, 0)
    onClose()
  }

  const handleDelete = () => {
    controller.deleteBlock(blockId)
    onClose()
  }

  const handleCopy = () => {
    controller.copyBlock(blockId)
    onClose()
  }

  const handleCut = () => {
    controller.cutBlock(blockId)
    onClose()
  }

  const handlePasteBelow = () => {
    controller.pasteBlockAfter(blockId)
    onClose()
  }

  const handleMoveUp = () => {
    const idx = controller.getBlockIndex(blockId)
    if (idx > 0) {
      const block = controller.getBlock(blockId)
      if (block?.parentId) {
        controller.moveBlock(blockId, block.parentId, idx - 1)
      }
    }
    onClose()
  }

  const handleMoveDown = () => {
    const idx = controller.getBlockIndex(blockId)
    const block = controller.getBlock(blockId)
    if (block?.parentId) {
      const parent = controller.getBlock(block.parentId)
      if (parent && idx < parent.children.length - 1) {
        controller.moveBlock(blockId, block.parentId, idx + 2)
      }
    }
    onClose()
  }

  const handleInsertAbove = async () => {
    const newBlock = await controller.insertBlockAfter(blockId)
    if (newBlock) controller.focusBlock(newBlock.id, 0)
    onClose()
  }

  const handleInsertBelow = async () => {
    const newBlock = await controller.insertBlockBefore(blockId)
    if (newBlock) controller.focusBlock(newBlock.id, 0)
    onClose()
  }

  const handleConvert = (newType: string) => {
    if (onConvert) {
      onConvert(blockId, newType)
    } else {
      controller.convertBlock(blockId, newType)
    }
    onClose()
  }

  const items: MenuItem[] = [
    { label: 'Duplicate', action: handleDuplicate },
    { label: 'Copy', action: handleCopy },
    { label: 'Cut', action: handleCut },
    { label: 'Paste below', action: handlePasteBelow },
    { label: 'Insert above', action: handleInsertAbove },
    { label: 'Insert below', action: handleInsertBelow },
    { label: 'Move up', action: handleMoveUp },
    { label: 'Move down', action: handleMoveDown },
    { label: 'Delete', action: handleDelete },
  ]

  const convertibleTypes = ['paragraph', 'heading', 'quote', 'checklist', 'callout', 'toggle']
  const convertItems = convertibleTypes
    .filter((t) => t !== blockType)
    .map((t) => ({
      label: `Convert to ${t.charAt(0).toUpperCase() + t.slice(1)}`,
      action: () => handleConvert(t),
    }))

  if (!open) return null

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Block menu"
      className={cn(
        'fixed z-[100] min-w-[180px] rounded-lg border bg-popover p-1 shadow-md',
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

      {convertItems.length > 0 && (
        <>
          <div className="my-1 border-t border-border" />
          {convertItems.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm',
                'text-popover-foreground hover:bg-accent hover:text-accent-foreground',
                'transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              )}
              onClick={item.action}
            >
              {item.label}
            </button>
          ))}
        </>
      )}
    </div>
  )
}
