import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/utils/cn'

interface WorkspaceSwitcherProps {
  className?: string;
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ className, collapsed }: WorkspaceSwitcherProps) {
  const { workspaces, currentWorkspaceId, setCurrentWorkspace } = useWorkspaceStore()
  const current = workspaces.find((w) => w.id === currentWorkspaceId)

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className={cn('h-8 w-8', className)}>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              {current?.name.charAt(0) ?? 'W'}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => setCurrentWorkspace(ws.id)}
              className="cursor-pointer"
            >
              <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-muted text-xs font-medium">
                {ws.name.charAt(0)}
              </div>
              {ws.name}
              {ws.id === currentWorkspaceId && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-muted-foreground">
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'flex h-9 w-full items-center justify-between px-2 text-sm font-medium',
            className,
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
              {current?.name.charAt(0) ?? 'W'}
            </div>
            <span className="truncate">{current?.name ?? 'Select Workspace'}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => setCurrentWorkspace(ws.id)}
            className="cursor-pointer"
          >
            <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-muted text-xs font-medium">
              {ws.name.charAt(0)}
            </div>
            {ws.name}
            {ws.id === currentWorkspaceId && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-muted-foreground">
          <Plus className="mr-2 h-4 w-4" />
          New Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
