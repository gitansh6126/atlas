import { useCallback, useEffect, useRef } from 'react'
import type { EditorController } from '@/modules/editor/editor-controller'
import { ClipboardManager } from '@/editor/managers/ClipboardManager/ClipboardManager'

export function useClipboard(
  controller: EditorController,
  getSelectedBlockIds: () => string[],
  getFocusedBlockId: () => string | null
) {
  const managerRef = useRef<ClipboardManager | null>(null)

  if (!managerRef.current) {
    managerRef.current = new ClipboardManager(controller)
  }

  const manager = managerRef.current

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (!ctrl) return

      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const selectedIds = getSelectedBlockIds()
      const focusedId = getFocusedBlockId()

      switch (e.key.toLowerCase()) {
        case 'c': {
          e.preventDefault()
          if (selectedIds.length > 0) {
            manager.copyBlocks(selectedIds)
          } else if (focusedId) {
            manager.copyBlocks([focusedId])
          }
          break
        }
        case 'x': {
          e.preventDefault()
          const ids = selectedIds.length > 0 ? selectedIds : (focusedId ? [focusedId] : [])
          if (ids.length > 0) {
            manager.cutBlocks(ids)
          }
          break
        }
        case 'v': {
          e.preventDefault()
          const targetId = focusedId ?? selectedIds[selectedIds.length - 1]
          if (targetId) {
            manager.pasteBlocks(targetId)
          }
          break
        }
        case 'd': {
          e.preventDefault()
          const ids = selectedIds.length > 0 ? selectedIds : (focusedId ? [focusedId] : [])
          if (ids.length > 0) {
            manager.duplicateBlocks(ids)
          }
          break
        }
      }
    },
    [controller, manager, getSelectedBlockIds, getFocusedBlockId]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    manager,
    copyBlocks: manager.copyBlocks.bind(manager),
    cutBlocks: manager.cutBlocks.bind(manager),
    pasteBlocks: manager.pasteBlocks.bind(manager),
    duplicateBlocks: manager.duplicateBlocks.bind(manager),
  }
}
