import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { BreadcrumbItem } from '@/shared/types'

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {item.href ? (
            <a href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </a>
          ) : (
            <span className={cn(index === items.length - 1 && 'font-medium text-foreground')}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
