import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { EditorController } from '@/modules/editor/editor-controller'

interface BlockPickerProps {
  blockId: string | null
  open: boolean
  onClose: () => void
  onSelect: (type: string) => void
  controller: EditorController
  anchorEl: HTMLElement | null
}

interface PickerItem {
  type: string
  label: string
  description: string
}

const defaultItems: PickerItem[] = [
  { type: 'paragraph', label: 'Paragraph', description: 'Plain text block' },
  { type: 'heading', label: 'Heading', description: 'Section heading (H2)' },
  { type: 'divider', label: 'Divider', description: 'Horizontal separator' },
  { type: 'bullet_list_item', label: 'Bulleted List', description: 'Unordered list' },
  { type: 'ordered_list_item', label: 'Numbered List', description: 'Ordered list' },
  { type: 'checklist', label: 'Checklist', description: 'Task list with checkboxes' },
  { type: 'quote', label: 'Quote', description: 'Blockquote' },
  { type: 'callout', label: 'Callout', description: 'Highlighted callout box' },
  { type: 'toggle', label: 'Toggle', description: 'Collapsible toggle' },
]

export function BlockPicker({
  blockId,
  open,
  onClose,
  onSelect,
  controller: _c,
  anchorEl,
}: BlockPickerProps) {
  const menuRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [search, setSearch] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })

  React.useEffect(() => {
    if (open && anchorEl) {
      const rect = anchorEl.getBoundingClientRect()
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX - 200,
      })
      setTimeout(() => inputRef.current?.focus(), 50)
      setSearch('')
      setActiveIndex(0)
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

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return defaultItems
    return defaultItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.type.includes(q)
    )
  }, [search])

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      handleSelect(filtered[activeIndex].type)
      return
    }
  }

  const handleSelect = (type: string) => {
    if (!blockId) return
    onSelect(type)
    onClose()
  }

  if (!open || !blockId) return null

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-[100] w-[220px] rounded-lg border bg-popover shadow-md',
        'animate-in fade-in slide-in-from-top-1 duration-100'
      )}
      style={{ top: position.top, left: position.left }}
    >
      <div className="border-b border-border px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setActiveIndex(0) }}
          onKeyDown={handleKeyDown}
          placeholder="Search blocks..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>
      <div className="max-h-[240px] overflow-y-auto p-1">
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            No blocks found
          </div>
        )}
        {filtered.map((item, index) => (
          <button
            key={item.type}
            type="button"
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm',
              'transition-colors',
              index === activeIndex
                ? 'bg-accent text-accent-foreground'
                : 'text-popover-foreground hover:bg-accent/50'
            )}
            onClick={() => handleSelect(item.type)}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div className="flex flex-col">
              <span className="font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
