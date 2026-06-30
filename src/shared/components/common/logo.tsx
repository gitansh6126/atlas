import { cn } from '@/shared/utils/cn'

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
        <span className="text-xs font-bold text-primary-foreground">A</span>
      </div>
      {showText && <span className="text-sm font-semibold tracking-tight">Atlas</span>}
    </div>
  )
}
