import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, FileText, MoreHorizontal, Plus, Star, Pin, GripVertical } from 'lucide-react'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { usePageStore } from '@/modules/pages/page-store'
import { useSidebarStore } from '@/layouts/sidebar-store'
import { useToastStore } from '@/shared/hooks/use-toast'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/utils/cn'

interface PageTreeProps {
  className?: string;
  section?: 'pages' | 'favorites' | 'recent';
  title?: string;
}

export function PageTree({ className, section = 'pages', title = 'Pages' }: PageTreeProps) {
  const navigate = useNavigate()
  const { setSelectedPage, selectedPageId } = useWorkspaceStore()
  const {
    pages,
    toggleFavorite,
    createPage,
    loadPages,
  } = usePageStore()
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const { expandedSections, toggleSection } = useSidebarStore()
  const toast = useToastStore((s) => s.toast)

  const isExpanded = expandedSections[section]

  const displayedPages = useMemo(() => {
    const currentPages = pages.filter((p) => p.workspaceId === currentWorkspaceId)
    switch (section) {
      case 'favorites':
        return currentPages.filter((p) => p.isFavorite)
      case 'recent':
        return currentPages
          .sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)
          .slice(0, 5)
      default:
        return currentPages
    }
  }, [pages, currentWorkspaceId, section])

  const handleCreatePage = useCallback(async () => {
    if (!currentWorkspaceId) return
    const title = `New Page ${pages.length + 1}`
    const page = await createPage(title, currentWorkspaceId)
    if (page) {
      setSelectedPage(page.id)
      navigate('/')
    }
    await loadPages(currentWorkspaceId)
    toast(`Page "${title}" created`, 'success')
  }, [currentWorkspaceId, pages.length, createPage, loadPages, toast, setSelectedPage, navigate])

  return (
    <div className={cn('select-none', className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => toggleSection(section)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSection(section) }}
        className="group flex w-full cursor-pointer items-center gap-1 px-2 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-90')} />
        {title}
        {section === 'pages' && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100"
            onClick={handleCreatePage}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
      {isExpanded && (
        <div className="mt-1 space-y-0.5">
          {displayedPages.length === 0 ? (
            <p className="px-6 py-1.5 text-xs text-muted-foreground">
              {section === 'favorites'
                ? 'No favorites yet'
                : section === 'recent'
                  ? 'No recent pages'
                  : 'No pages yet'}
            </p>
          ) : (
            displayedPages.map((page) => (
              <PageItem
                key={page.id}
                page={page}
                isSelected={selectedPageId === page.id}
                onSelect={() => { setSelectedPage(page.id); navigate('/') }}
                onToggleFavorite={(e) => {
                  e.stopPropagation()
                  toggleFavorite(page.id)
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface PageItemProps {
  page: {
    id: string;
    title: string;
    isFavorite: boolean;
    isPinned: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

function PageItem({ page, isSelected, onSelect, onToggleFavorite }: PageItemProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(page.title)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const renamePage = usePageStore((s) => s.renamePage)
  const duplicatePage = usePageStore((s) => s.duplicatePage)
  const deletePage = usePageStore((s) => s.deletePage)
  const togglePin = usePageStore((s) => s.togglePin)
  const loadPages = usePageStore((s) => s.loadPages)
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const toast = useToastStore((s) => s.toast)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleRename = useCallback(async () => {
    if (!renameValue.trim() || renameValue.trim() === page.title) {
      setIsRenaming(false)
      return
    }
    await renamePage(page.id, renameValue.trim())
    setIsRenaming(false)
    toast('Page renamed', 'success')
  }, [page.id, page.title, renameValue, renamePage, toast])

  const handleDuplicate = useCallback(async () => {
    await duplicatePage(page.id)
    if (currentWorkspaceId) await loadPages(currentWorkspaceId)
    toast('Page duplicated', 'success')
  }, [page.id, duplicatePage, currentWorkspaceId, loadPages, toast])

  const handleDelete = useCallback(async () => {
    await deletePage(page.id)
    if (currentWorkspaceId) await loadPages(currentWorkspaceId)
    toast('Page moved to trash', 'info')
  }, [page.id, deletePage, currentWorkspaceId, loadPages, toast])

  const handleTogglePin = useCallback(async () => {
    await togglePin(page.id)
    if (currentWorkspaceId) await loadPages(currentWorkspaceId)
    toast(page.isPinned ? 'Page unpinned' : 'Page pinned', 'success')
  }, [page.id, page.isPinned, togglePin, currentWorkspaceId, loadPages, toast])

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', page.id)
    e.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
  }, [page.id])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className={cn('group', isDragging && 'opacity-50')}>
      <div
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-sm px-6 py-1 transition-colors hover:bg-accent/50',
          isSelected && 'bg-accent text-accent-foreground',
        )}
        onClick={onSelect}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {isRenaming ? (
          <Input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') setIsRenaming(false)
            }}
            className="h-6 flex-1 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate text-sm">{page.title}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleTogglePin()
          }}
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Pin
            className={cn(
              'h-3 w-3',
              page.isPinned ? 'fill-sky-400 text-sky-400' : 'text-muted-foreground',
            )}
          />
        </button>
        <button
          onClick={onToggleFavorite}
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
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem className="text-xs" onSelect={() => { setRenameValue(page.title); setIsRenaming(true) }}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onSelect={handleDuplicate}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onSelect={() => toast('Move dialog coming soon', 'info')}>
              Move
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onSelect={handleTogglePin}>
              {page.isPinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-destructive" onSelect={() => setShowDeleteConfirm(true)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Page"
        description={`Are you sure you want to delete "${page.title}"? It will be moved to trash.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
