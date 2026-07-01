import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { EditorController } from './editor-controller.ts'
import { getBlockElement } from './block-utils.ts'

export interface SlashMenuItem {
  type: string
  label: string
  description: string
}

interface SlashMenuProps {
  blockId: string | null
  filter: string
  open: boolean
  items: SlashMenuItem[]
  controller: EditorController
  onClose: () => void
  onSelect: (type: string) => void
}

const MENU_MAX_HEIGHT = 360
const MENU_WIDTH = 260

function getMenuPosition(blockEl: HTMLElement, menuHeight: number): { top: number; left: number; anchorBottom: boolean } {
  const rect = blockEl.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  const spaceBelow = vh - rect.bottom - 8
  const spaceAbove = rect.top - 8
  const fitsBelow = spaceBelow >= menuHeight
  const fitsAbove = spaceAbove >= menuHeight

  if (fitsBelow || (!fitsAbove && spaceBelow >= spaceAbove)) {
    const left = Math.min(rect.left + window.scrollX, vw - MENU_WIDTH - 16)
    return { top: rect.bottom + window.scrollY + 4, left: Math.max(16, left), anchorBottom: true }
  }

  const left = Math.min(rect.left + window.scrollX, vw - MENU_WIDTH - 16)
  return { top: rect.top + window.scrollY - menuHeight - 4, left: Math.max(16, left), anchorBottom: false }
}

export function SlashMenu({ blockId, filter, open, items, controller: _c, onClose, onSelect }: SlashMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const activeRef = React.useRef<HTMLButtonElement>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const [anchorBottom, setAnchorBottom] = React.useState(true)
  const [measuredHeight, setMeasuredHeight] = React.useState(MENU_MAX_HEIGHT)

  const filtered = React.useMemo(() => {
    const f = filter.toLowerCase()
    if (!f) return items
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(f) ||
        item.description.toLowerCase().includes(f) ||
        item.type.includes(f)
    )
  }, [filter, items])

  React.useEffect(() => {
    setActiveIndex(0)
  }, [filter])

  React.useEffect(() => {
    if (open && blockId) {
      const el = getBlockElement(blockId)
      if (el) {
        const estimatedHeight = Math.min(filtered.length * 48 + 16, MENU_MAX_HEIGHT)
        setMeasuredHeight(estimatedHeight)
        const pos = getMenuPosition(el, estimatedHeight)
        setPosition(pos)
        setAnchorBottom(pos.anchorBottom)
      }
    }
  }, [open, blockId, filtered.length])

  React.useEffect(() => {
    if (!open || !menuRef.current) return
    const actual = menuRef.current.offsetHeight
    if (actual > 0 && actual !== measuredHeight) {
      setMeasuredHeight(actual)
      const el = getBlockElement(blockId ?? '')
      if (el) {
        const pos = getMenuPosition(el, actual)
        setPosition(pos)
        setAnchorBottom(pos.anchorBottom)
      }
    }
  })

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
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        return
      }
      if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault()
        onSelect(filtered[activeIndex].type)
        return
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, filtered, activeIndex, onClose, onSelect])

  React.useEffect(() => {
    if (activeRef.current && listRef.current) {
      const item = activeRef.current
      const container = listRef.current
      const itemTop = item.offsetTop
      const itemBottom = itemTop + item.offsetHeight
      const containerScrollTop = container.scrollTop
      const containerHeight = container.clientHeight

      if (itemTop < containerScrollTop) {
        container.scrollTop = itemTop
      } else if (itemBottom > containerScrollTop + containerHeight) {
        container.scrollTop = itemBottom - containerHeight
      }
    }
  }, [activeIndex])

  React.useEffect(() => {
    if (!open) return
    const el = getBlockElement(blockId ?? '')
    if (el) {
      el.setAttribute('aria-expanded', 'true')
      el.setAttribute('aria-controls', 'slash-menu')
    }
    return () => {
      if (el) {
        el.removeAttribute('aria-expanded')
        el.removeAttribute('aria-controls')
      }
    }
  }, [open, blockId])

  if (!open || !blockId) return null

  return (
    <div
      id="slash-menu"
      ref={menuRef}
      role="listbox"
      aria-label="Insert block menu"
      className={cn(
        'fixed z-[100] min-w-[260px] rounded-lg border bg-popover shadow-md',
        'animate-in fade-in duration-100',
        anchorBottom ? 'slide-in-from-top-1' : 'slide-in-from-bottom-1'
      )}
      style={{ top: position.top, left: position.left }}
    >
      <div
        ref={listRef}
        className={cn(
          'overflow-y-auto py-1',
          '[&::-webkit-scrollbar]:w-1.5',
          '[&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20',
          '[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/30'
        )}
        style={{ maxHeight: MENU_MAX_HEIGHT }}
      >
        {filtered.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No results
          </div>
        )}
        {filtered.map((item, index) => (
          <button
            key={item.type + item.label}
            ref={index === activeIndex ? activeRef : undefined}
            type="button"
            role="option"
            aria-selected={index === activeIndex}
            className={cn(
              'flex w-full items-center gap-3 px-3 py-2.5 text-left',
              'transition-colors',
              index === activeIndex
                ? 'bg-accent text-accent-foreground'
                : 'text-popover-foreground hover:bg-accent/50'
            )}
            onClick={() => { onSelect(item.type) }}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
              {item.label.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium truncate">{item.label}</span>
              <span className="text-xs text-muted-foreground truncate">{item.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
