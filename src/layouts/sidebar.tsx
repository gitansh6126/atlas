import { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PanelLeftClose, PanelLeft, Trash2, Settings, HelpCircle, Pin, Maximize2 } from 'lucide-react'
import { useSidebarStore } from '@/layouts/sidebar-store'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { useFolderStore } from '@/modules/folders/folder-store'
import { usePageStore } from '@/modules/pages/page-store'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Separator } from '@/shared/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/shared/components/ui/tooltip'
import { Logo } from '@/shared/components/common/logo'
import { WorkspaceSwitcher } from '@/modules/workspace/workspace-switcher'
import { FolderTree } from '@/modules/folders/folder-tree'
import { PageTree } from '@/modules/pages/page-tree'
import { cn } from '@/shared/utils/cn'

export function Sidebar() {
  const { collapsed, mode, width, toggleSidebar, setWidth, setMode } = useSidebarStore()
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const loadFolders = useFolderStore((s) => s.loadFolders)
  const loadPages = usePageStore((s) => s.loadPages)
  const navigate = useNavigate()
  const location = useLocation()
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)
  const [isStretching, setIsStretching] = useState(false)

  useEffect(() => {
    if (currentWorkspaceId) {
      loadFolders(currentWorkspaceId)
      loadPages(currentWorkspaceId)
    }
  }, [currentWorkspaceId, loadFolders, loadPages])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (mode === 'fixed' || collapsed) return
    e.preventDefault()
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = width
    setIsStretching(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [mode, width, collapsed])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const delta = e.clientX - startX.current
      setWidth(startWidth.current + delta)
    }

    const handleMouseUp = () => {
      if (!isResizing.current) return
      isResizing.current = false
      setIsStretching(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [setWidth])

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'relative flex flex-col border-r bg-sidebar text-sidebar-foreground transition-colors duration-200 ease-in-out',
          collapsed ? 'w-[52px]' : '',
          isStretching && 'select-none',
        )}
        style={collapsed ? undefined : { width: mode === 'fixed' ? 240 : width }}
      >
        {/* Resize Handle */}
        {!collapsed && (
          <div
            className={cn(
              'absolute right-0 top-0 h-full w-1.5 cursor-col-resize transition-colors hover:bg-primary/20',
              isStretching && 'bg-primary/30',
            )}
            onMouseDown={handleMouseDown}
            title="Drag to resize sidebar"
          />
        )}

        {/* Header */}
        <div
          className={cn(
            'flex h-12 items-center border-b border-sidebar-muted px-2',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {collapsed ? <Logo showText={false} /> : <Logo />}
          <div className="flex items-center gap-1">
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMode(mode === 'fixed' ? 'variable' : 'fixed')}
                className={cn(
                  'shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground',
                  mode === 'fixed' && 'text-primary',
                )}
                title={mode === 'fixed' ? 'Switch to Variable width' : 'Switch to Fixed width'}
              >
                {mode === 'fixed' ? (
                  <Pin className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              className="shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Workspace Switcher */}
        {collapsed ? (
          <div className="flex justify-center py-2">
            <WorkspaceSwitcher collapsed />
          </div>
        ) : (
          <div className="px-2 pb-1 pt-2">
            <WorkspaceSwitcher />
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-2 py-2">
            {collapsed ? (
              <CollapsedNav />
            ) : (
              <>
                <FolderTree />
                <PageTree section="pages" title="Pages" />
                <div className="pt-2">
                  <Separator />
                </div>
                <PageTree section="favorites" title="Favorites" />
                <PageTree section="recent" title="Recent" />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="border-t border-sidebar-muted p-2">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => navigate('/trash')}
                    className={cn(
                      'h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground',
                      location.pathname === '/trash' && 'bg-sidebar-muted text-sidebar-foreground',
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Trash</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => navigate('/settings')}
                    className={cn(
                      'h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground',
                      location.pathname === '/settings' && 'bg-sidebar-muted text-sidebar-foreground',
                    )}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Help</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="space-y-0.5">
              <SidebarNavItem
                icon={<Trash2 className="h-4 w-4" />}
                label="Trash"
                onClick={() => navigate('/trash')}
                active={location.pathname === '/trash'}
              />
              <SidebarNavItem
                icon={<Settings className="h-4 w-4" />}
                label="Settings"
                onClick={() => navigate('/settings')}
                active={location.pathname === '/settings'}
              />
              <SidebarNavItem
                icon={<HelpCircle className="h-4 w-4" />}
                label="Help"
                onClick={() => {}}
              />
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}

function SidebarNavItem({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-muted',
        active ? 'bg-sidebar-muted text-sidebar-foreground' : 'text-sidebar-foreground/70',
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function CollapsedNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex flex-col items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate('/trash')}
            className={cn(
              'h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground',
              location.pathname === '/trash' && 'bg-sidebar-muted text-sidebar-foreground',
            )}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Trash</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate('/settings')}
            className={cn(
              'h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground',
              location.pathname === '/settings' && 'bg-sidebar-muted text-sidebar-foreground',
            )}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Settings</TooltipContent>
      </Tooltip>
    </div>
  )
}
