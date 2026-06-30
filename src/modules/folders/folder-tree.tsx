import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronRight, Folder, FolderOpen, MoreHorizontal, Plus, GripVertical } from 'lucide-react'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { useFolderStore } from '@/modules/folders/folder-store'
import { useSidebarStore } from '@/layouts/sidebar-store'
import { useToastStore } from '@/shared/hooks/use-toast'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog'
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
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const folders = useFolderStore((s) => s.folders)
  const loadFolders = useFolderStore((s) => s.loadFolders)
  const createFolder = useFolderStore((s) => s.createFolder)
  const toast = useToastStore((s) => s.toast)

  const isExpanded = expandedSections['folders']

  const handleCreateFolder = useCallback(async () => {
    if (!currentWorkspaceId) return
    const name = `New Folder ${folders.length + 1}`
    await createFolder(name, currentWorkspaceId)
    await loadFolders(currentWorkspaceId)
    toast(`Folder "${name}" created`, 'success')
  }, [currentWorkspaceId, folders.length, createFolder, loadFolders, toast])

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
          {folders.length === 0 ? (
            <p className="px-6 py-1.5 text-xs text-muted-foreground">No folders yet</p>
          ) : (
            folders.map((folder) => (
              <FolderItem key={folder.id} folder={folder} />
            ))
          )}
          <button
            onClick={handleCreateFolder}
            className="flex w-full items-center gap-2 px-6 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
            New folder
          </button>
        </div>
      )}
    </div>
  )
}

interface FolderItemProps {
  folder: { id: string; name: string };
}

function FolderItem({ folder }: FolderItemProps) {
  const [open, setOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(folder.name)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const renameFolder = useFolderStore((s) => s.renameFolder)
  const duplicateFolder = useFolderStore((s) => s.duplicateFolder)
  const deleteFolder = useFolderStore((s) => s.deleteFolder)
  const loadFolders = useFolderStore((s) => s.loadFolders)
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const toast = useToastStore((s) => s.toast)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleRename = useCallback(async () => {
    if (!renameValue.trim() || renameValue.trim() === folder.name) {
      setIsRenaming(false)
      return
    }
    await renameFolder(folder.id, renameValue.trim())
    setIsRenaming(false)
    toast('Folder renamed', 'success')
  }, [folder.id, folder.name, renameValue, renameFolder, toast])

  const handleDuplicate = useCallback(async () => {
    await duplicateFolder(folder.id)
    if (currentWorkspaceId) await loadFolders(currentWorkspaceId)
    toast('Folder duplicated', 'success')
  }, [folder.id, duplicateFolder, currentWorkspaceId, loadFolders, toast])

  const handleDelete = useCallback(async () => {
    await deleteFolder(folder.id)
    if (currentWorkspaceId) await loadFolders(currentWorkspaceId)
    toast('Folder moved to trash', 'info')
  }, [folder.id, deleteFolder, currentWorkspaceId, loadFolders, toast])

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', folder.id)
    e.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
  }, [folder.id])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className={cn('group', isDragging && 'opacity-50')}>
      <div
        className="flex cursor-pointer items-center gap-2 rounded-sm px-6 py-1 text-sm transition-colors hover:bg-accent/50"
        onClick={() => setOpen(!open)}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        {open ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
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
            className="h-6 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate text-sm">{folder.name}</span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem className="text-xs" onSelect={() => { setRenameValue(folder.name); setIsRenaming(true) }}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onSelect={handleDuplicate}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-destructive" onSelect={() => setShowDeleteConfirm(true)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Folder"
        description={`Are you sure you want to delete "${folder.name}"? It will be moved to trash.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
