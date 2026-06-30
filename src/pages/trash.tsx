import { useState, useEffect, useCallback } from 'react'
import { Trash2, RotateCcw, XCircle, FileText, Folder } from 'lucide-react'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { useToastStore } from '@/shared/hooks/use-toast'
import { EmptyState } from '@/shared/components/common/empty-state'
import { Button } from '@/shared/components/ui/button'
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog'
import { commandBus, RestoreFromTrashCommand, PermanentlyDeleteCommand } from '@/core/commands'
import { TrashRepository } from '@/core/repositories/trash-repository'
import { IndexedDbStorageProvider } from '@/core/storage/providers/indexeddb-provider'
import type { TrashItem } from '@/core/repositories/trash-repository'

const trashRepo = new TrashRepository(new IndexedDbStorageProvider())

export function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmEntityType, setConfirmEntityType] = useState<'page' | 'folder' | null>(null)
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const toast = useToastStore((s) => s.toast)

  const loadItems = useCallback(async () => {
    if (!currentWorkspaceId) return
    setIsLoading(true)
    const result = await trashRepo.getTrashItems(currentWorkspaceId)
    if (result.success) {
      setItems(result.data)
    }
    setIsLoading(false)
  }, [currentWorkspaceId])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleRestore = useCallback(async (id: string, entityType: 'page' | 'folder') => {
    const result = await commandBus.execute(new RestoreFromTrashCommand(), { id, entityType })
    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast(`${entityType} restored`, 'success')
    } else {
      toast('Failed to restore item', 'error')
    }
  }, [toast])

  const handlePermanentDelete = useCallback(async () => {
    if (!confirmDeleteId || !confirmEntityType) return
    const result = await commandBus.execute(new PermanentlyDeleteCommand(), {
      id: confirmDeleteId,
      entityType: confirmEntityType,
    })
    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== confirmDeleteId))
      toast(`${confirmEntityType} permanently deleted`, 'success')
    } else {
      toast('Failed to delete item', 'error')
    }
    setConfirmDeleteId(null)
    setConfirmEntityType(null)
  }, [confirmDeleteId, confirmEntityType, toast])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading trash...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={<Trash2 className="h-12 w-12" />}
          title="Trash is empty"
          description="Deleted pages and folders will appear here."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Trash</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-accent/50"
          >
            {item.entityType === 'page' ? (
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{item.entityType}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleRestore(item.id, item.entityType)}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive hover:text-destructive"
                onClick={() => {
                  setConfirmDeleteId(item.id)
                  setConfirmEntityType(item.entityType)
                }}
              >
                <XCircle className="mr-1 h-3 w-3" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) { setConfirmDeleteId(null); setConfirmEntityType(null) }}}
        title="Permanently Delete"
        description="This action cannot be undone. The item will be permanently deleted."
        confirmLabel="Permanently Delete"
        variant="destructive"
        onConfirm={handlePermanentDelete}
      />
    </div>
  )
}
