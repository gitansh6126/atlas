import { cn } from '@/shared/utils/cn'

interface InsertBlockButtonProps {
  blockId: string
  visible: boolean
  onInsert: (blockId: string) => void
}

export function InsertBlockButton({ blockId, visible, onInsert }: InsertBlockButtonProps) {
  return (
    <div
      className={cn(
        'absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-md transition-opacity',
        'opacity-0 group-hover:opacity-100',
        visible && 'opacity-100'
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Insert block below"
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded text-xs',
          'text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50',
          'transition-colors'
        )}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onInsert(blockId)
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
