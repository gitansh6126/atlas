import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { EditorController } from './editor-controller.ts'

interface BlockDragHandleProps {
  blockId: string
  controller: EditorController
  isSelected: boolean
  onMenuOpen: (blockId: string, anchorEl: HTMLElement) => void
}

export function BlockDragHandle({ blockId, controller: _c, isSelected, onMenuOpen }: BlockDragHandleProps) {
  const handleRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', blockId)
    e.dataTransfer.effectAllowed = 'move'
    setDragging(true)
  }

  const handleDragEnd = () => {
    setDragging(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const el = handleRef.current?.parentElement
    if (el) {
      onMenuOpen(blockId, el)
    }
  }

  return (
    <div
      ref={handleRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      role="button"
      tabIndex={-1}
      aria-label={`Drag block ${blockId}`}
      className={cn(
        'absolute -left-10 top-0 flex h-6 w-6 cursor-grab items-center justify-center rounded-md',
        'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
        isSelected && 'opacity-100',
        dragging && 'opacity-100 cursor-grabbing',
        'hover:bg-accent/50 transition-opacity'
      )}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-muted-foreground/60">
        <circle cx="5" cy="4" r="1.2" fill="currentColor" />
        <circle cx="11" cy="4" r="1.2" fill="currentColor" />
        <circle cx="5" cy="8" r="1.2" fill="currentColor" />
        <circle cx="11" cy="8" r="1.2" fill="currentColor" />
        <circle cx="5" cy="12" r="1.2" fill="currentColor" />
        <circle cx="11" cy="12" r="1.2" fill="currentColor" />
      </svg>
    </div>
  )
}
