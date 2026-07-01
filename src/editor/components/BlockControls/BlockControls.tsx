import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { EditorController } from '@/modules/editor/editor-controller'

interface BlockControlsProps {
  blockId: string
  controller: EditorController
  isSelected: boolean
  onMenuOpen: (blockId: string, anchorEl: HTMLElement) => void
  onPickerOpen: (blockId: string, anchorEl: HTMLElement) => void
  onDragStart: (blockId: string, e: React.DragEvent) => void
}

export function BlockControls({
  blockId,
  controller: _c,
  isSelected,
  onMenuOpen,
  onPickerOpen,
  onDragStart,
}: BlockControlsProps) {
  const dragRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', blockId)
    e.dataTransfer.effectAllowed = 'move'
    setDragging(true)
    onDragStart(blockId, e)
  }

  const handleDragEnd = () => {
    setDragging(false)
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const el = dragRef.current?.closest('[data-block-id]') as HTMLElement
    if (el) {
      onMenuOpen(blockId, el)
    }
  }

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const el = dragRef.current?.closest('[data-block-id]') as HTMLElement
    if (el) {
      onPickerOpen(blockId, el)
    }
  }

  return (
    <div
      ref={dragRef}
      className={cn(
        'absolute -left-14 top-0 flex items-center gap-0.5',
        'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
        'transition-opacity duration-150',
        isSelected && 'opacity-100'
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Insert block"
        className={cn(
          'flex h-6 w-5 items-center justify-center rounded text-xs',
          'text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50',
          'transition-colors'
        )}
        onClick={handlePlusClick}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          'flex h-6 w-5 cursor-grab items-center justify-center rounded',
          'hover:bg-accent/50 transition-colors',
          dragging && 'cursor-grabbing'
        )}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-muted-foreground/40">
          <circle cx="5" cy="3" r="1.2" fill="currentColor" />
          <circle cx="11" cy="3" r="1.2" fill="currentColor" />
          <circle cx="5" cy="8" r="1.2" fill="currentColor" />
          <circle cx="11" cy="8" r="1.2" fill="currentColor" />
          <circle cx="5" cy="13" r="1.2" fill="currentColor" />
          <circle cx="11" cy="13" r="1.2" fill="currentColor" />
        </svg>
      </div>

      <button
        type="button"
        tabIndex={-1}
        aria-label="Block menu"
        className={cn(
          'flex h-6 w-5 items-center justify-center rounded',
          'text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50',
          'transition-colors'
        )}
        onClick={handleMenuClick}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="4" r="1.3" fill="currentColor" />
          <circle cx="8" cy="8" r="1.3" fill="currentColor" />
          <circle cx="8" cy="12" r="1.3" fill="currentColor" />
        </svg>
      </button>
    </div>
  )
}
