import { ChevronRight, FileText, MoreHorizontal, Plus, Star } from 'lucide-react'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { useSidebarStore } from '@/layouts/sidebar-store'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/utils/cn'

interface PageTreeProps {
  className?: string;
  section?: 'pages' | 'favorites' | 'recent';
  title?: string;
}

export function PageTree({ className, section = 'pages', title = 'Pages' }: PageTreeProps) {
  const { setSelectedPage, selectedPageId, toggleFavorite, getCurrentWorkspacePages, getFavoritePages, getRecentPages } =
    useWorkspaceStore()
  const { expandedSections, toggleSection } = useSidebarStore()

  const isExpanded = expandedSections[section]
  const pages =
    section === 'favorites'
      ? getFavoritePages()
      : section === 'recent'
        ? getRecentPages()
        : getCurrentWorkspacePages()

  return (
    <div className={cn('select-none', className)}>
      <button
        onClick={() => toggleSection(section)}
        className="group flex w-full items-center gap-1 px-2 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-90')} />
        {title}
        {section === 'pages' && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </button>
      {isExpanded && (
        <div className="mt-1 space-y-0.5">
          {pages.length === 0 ? (
            <p className="px-6 py-1.5 text-xs text-muted-foreground">
              {section === 'favorites'
                ? 'No favorites yet'
                : section === 'recent'
                  ? 'No recent pages'
                  : 'No pages yet'}
            </p>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="group">
                <div
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-sm px-6 py-1 transition-colors hover:bg-accent/50',
                    selectedPageId === page.id && 'bg-accent text-accent-foreground',
                  )}
                  onClick={() => setSelectedPage(page.id)}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm">{page.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(page.id)
                    }}
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Star
                      className={cn(
                        'h-3 w-3',
                        page.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground',
                      )}
                    />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      <DropdownMenuItem className="text-xs">Rename</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs">Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs">Move</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
