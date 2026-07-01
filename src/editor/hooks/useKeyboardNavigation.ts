import { useEffect, useCallback } from 'react'
import type { EditorController } from '@/modules/editor/editor-controller'

export function useKeyboardNavigation(controller: EditorController, isOpen: boolean) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault()
        controller.undo()
        return
      }

      if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) ||
          (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault()
        controller.redo()
        return
      }

      if (e.key === 'Tab') {
        const sel = controller.getSelection()
        if (!sel) return
        const blockId = sel.focusBlockId ?? sel.anchorBlockId
        if (!blockId) return
        const block = controller.getBlock(blockId)
        if (!block) return

        e.preventDefault()
        if (e.shiftKey) {
          if (block.type === 'heading') {
            const level = (block.content['level'] as number) ?? 2
            if (level > 1) {
              controller.updateBlockContent(blockId, { ...block.content, level: level - 1 })
            }
          }
        } else {
          if (block.type === 'heading') {
            const level = (block.content['level'] as number) ?? 2
            if (level < 3) {
              controller.updateBlockContent(blockId, { ...block.content, level: level + 1 })
            }
          }
        }
        return
      }
    },
    [controller, isOpen]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
