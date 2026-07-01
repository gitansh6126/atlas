import { cn } from '@/shared/utils/cn'

interface BlockPlaceholderProps {
  blockType: string
  level?: number
}

export function BlockPlaceholder({ blockType: _bt, level }: BlockPlaceholderProps) {
  const text = level ? `Heading ${level}` : "Type '/' for commands..."
  return (
    <span
      className={cn(
        'pointer-events-none absolute left-0 top-0 select-none',
        'text-muted-foreground/40'
      )}
      aria-hidden
    >
      {text}
    </span>
  )
}
