import React from 'react'
import { cn } from '@/shared/utils/cn'

interface SidebarSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function SidebarSection({ title, defaultOpen = true, children }: SidebarSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider',
          'text-muted-foreground hover:text-foreground transition-colors'
        )}
      >
        <svg
          className={cn('h-3 w-3 transition-transform', open && 'rotate-90')}
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.5 3.5L9.5 7.5L5.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {title}
      </button>
      {open && <div className="px-2 pb-2">{children}</div>}
    </div>
  )
}
