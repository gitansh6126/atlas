import { Bell, Command } from 'lucide-react'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { Button } from '@/shared/components/ui/button'
import { SearchBar } from '@/shared/components/common/search-bar'
import { Breadcrumb } from '@/shared/components/common/breadcrumb'
import { UserProfile } from '@/shared/components/common/user-profile'
import { ThemeToggle } from '@/core/theme/theme-toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/shared/components/ui/tooltip'
import { cn } from '@/shared/utils/cn'
import type { BreadcrumbItem } from '@/shared/types'

interface TopbarProps {
  onCommandPaletteOpen: () => void;
  className?: string;
}

export function Topbar({ onCommandPaletteOpen, className }: TopbarProps) {
  const workspace = useWorkspaceStore((s) => s.getCurrentWorkspace())
  const selectedPageId = useWorkspaceStore((s) => s.selectedPageId)
  const pages = useWorkspaceStore((s) => s.getCurrentWorkspacePages())
  const selectedPage = pages.find((p) => p.id === selectedPageId)

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: workspace?.name ?? 'Workspace' },
    ...(selectedPage ? [{ label: selectedPage.title }] : []),
  ]

  return (
    <TooltipProvider>
      <header className={cn('flex h-12 items-center gap-3 border-b bg-background px-4', className)}>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="min-w-0 flex-1" />

        {/* Search */}
        <SearchBar className="hidden w-64 sm:block" />

        {/* Command Palette */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onCommandPaletteOpen}
              className="hidden text-muted-foreground sm:flex"
            >
              <Command className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Command Palette (⌘K)</p>
          </TooltipContent>
        </Tooltip>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>

        {/* Profile */}
        <UserProfile />
      </header>
    </TooltipProvider>
  )
}
