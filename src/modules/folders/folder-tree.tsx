import { useState } from 'react'
import { ChevronRight, Folder, FolderOpen, MoreHorizontal, Plus } from 'lucide-react'
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

interface FolderTreeProps {
  className?: string;
}

export function FolderTree({ className }: FolderTreeProps) {
  const { expandedSections, toggleSection } = useSidebarStore()
  const workspaceFolders = useWorkspaceStore((s) => s.getCurrentWorkspaceFolders())

  const isExpanded = expandedSections['folders']

  return (
    <div className={cn('select-none', className)}>
      <button
        onClick={() => toggleSection('folders')}
        className="group flex w-full items-center gap-1 px-2 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-90')} />
        Folders
      </button>
      {isExpanded && (
        <div className="mt-1 space-y-0.5">
          {workspaceFolders.length === 0 ? (
            <p className="px-6 py-1.5 text-xs text-muted-foreground">No folders yet</p>
          ) : (
            workspaceFolders.map((folder) => (
              <FolderItem key={folder.id} name={folder.name} />
            ))
          )}
          <button className="flex w-full items-center gap-2 px-6 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <Plus className="h-3 w-3" />
            New folder
          </button>
        </div>
      )}
    </div>
  )
}

interface FolderItemProps {
  name: string;
}

function FolderItem({ name }: FolderItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="group">
      <div
        className="flex cursor-pointer items-center gap-2 rounded-sm px-6 py-1 text-sm transition-colors hover:bg-accent/50"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate text-sm">{name}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem className="text-xs">Rename</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
