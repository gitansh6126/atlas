import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { EditorController } from '@/modules/editor/editor-controller'

interface SidebarItemProps {
  type: string
  label: string
  icon: React.ReactNode
  controller: EditorController
  onClick?: (type: string) => void
}

const defaultContent: Record<string, Record<string, unknown>> = {
  paragraph: { text: '' },
  heading: { text: '', level: 2 },
  divider: {},
  spacer: {},
  container: {},
  section: {},
  columns: {},
  grid: {},
  flex_row: { text: '' },
  flex_column: { text: '' },
  image: {},
  video: {},
  icon: {},
  gallery: {},
  button: { text: 'Button' },
  form: {},
  input: { text: '' },
  checkbox: { text: '', checked: false },
  radio: { text: '' },
  select: {},
  table: {},
  bullet_list_item: { text: '' },
  ordered_list_item: { text: '' },
  checklist: { text: '', checked: false },
  quote: { text: '' },
  code_block: { text: '' },
  html: { text: '' },
  markdown: { text: '' },
  embed: {},
  tabs: {},
  accordion: {},
  alert: { text: '', variant: 'info' },
  callout: { text: '', variant: 'info' },
  toggle: { text: '' },
  text: { text: '' },
}

export function SidebarItem({ type, label, icon, controller, onClick }: SidebarItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(type)
      return
    }
    const content = defaultContent[type] ?? { text: '' }
    controller.insertBlockAfterActive(type, content)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm',
        'hover:bg-accent/60 transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  )
}
