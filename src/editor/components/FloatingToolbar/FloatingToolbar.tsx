import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { EditorController } from '@/modules/editor/editor-controller'

interface FloatingToolbarProps {
  controller: EditorController
}

interface FormatAction {
  label: string
  icon: React.ReactNode
  format: string
}

const formatActions: FormatAction[] = [
  {
    label: 'Bold',
    format: 'bold',
    icon: (
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
        <path d="M4 2.5H9C10.3807 2.5 11.5 3.61929 11.5 5C11.5 6.38071 10.3807 7.5 9 7.5H4V2.5Z" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M4 7.5H10C11.3807 7.5 12.5 8.61929 12.5 10C12.5 11.3807 11.3807 12.5 10 12.5H4V7.5Z" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    label: 'Italic',
    format: 'italic',
    icon: (
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
        <path d="M6 2.5H10.5M4.5 12.5H9M8.5 2.5L6.5 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Underline',
    format: 'underline',
    icon: (
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
        <path d="M4 2.5V7C4 9.20914 5.79086 11 8 11C10.2091 11 12 9.20914 12 7V2.5M3 12.5H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Strikethrough',
    format: 'strikethrough',
    icon: (
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
        <path d="M3 7.5H12M5 4.5C5 4.5 5.5 3 8 3C10.5 3 11 4.5 11 5C11 6 10 6.5 8 7M10 10.5C10 10.5 9.5 12 7 12C4.5 12 4 10.5 4 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Code',
    format: 'code',
    icon: (
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
        <path d="M5 4.5L2 7.5L5 10.5M10 4.5L13 7.5L10 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export function FloatingToolbar({ controller }: FloatingToolbarProps) {
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })

  React.useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setVisible(false)
        return
      }

      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        setVisible(false)
        return
      }

      setPosition({
        top: rect.top + window.scrollY - 44,
        left: rect.left + window.scrollX + rect.width / 2 - 100,
      })
      setVisible(true)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [controller])

  React.useEffect(() => {
    if (!visible) return
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        const sel = window.getSelection()
        if (sel && !sel.isCollapsed) return
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handler, true)
    return () => document.removeEventListener('mousedown', handler, true)
  }, [visible])

  const handleFormat = (_format: string) => {
    document.execCommand(_format, false)
  }

  if (!visible) return null

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'fixed z-[100] flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-md',
        'animate-in fade-in slide-in-from-bottom-1 duration-100'
      )}
      style={{ top: position.top, left: position.left }}
    >
      {formatActions.map((action) => (
        <button
          key={action.format}
          type="button"
          aria-label={action.label}
          title={action.label}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded',
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            'transition-colors'
          )}
          onClick={() => handleFormat(action.format)}
        >
          {action.icon}
        </button>
      ))}
    </div>
  )
}
