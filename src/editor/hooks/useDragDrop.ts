import { useCallback, useEffect, useRef, useState } from 'react'
import type { EditorController } from '@/modules/editor/editor-controller'
import { DragManager, type DragState } from '@/editor/managers/DragManager/DragManager'

export function useDragDrop(controller: EditorController) {
  const managerRef = useRef<DragManager | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    sourceBlockId: null,
    targetBlockId: null,
    position: 'after',
    isDragging: false,
  })

  if (!managerRef.current) {
    managerRef.current = new DragManager(controller)
  }

  const manager = managerRef.current

  useEffect(() => {
    return manager.subscribe(setDragState)
  }, [manager])

  const handleDragStart = useCallback(
    (blockId: string, e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', blockId)
      e.dataTransfer.effectAllowed = 'move'
      manager.startDrag(blockId)
    },
    [manager]
  )

  const handleDragOver = useCallback(
    (blockId: string, e: React.DragEvent) => {
      e.preventDefault()
      if (!dragState.isDragging) return
      const el = e.currentTarget as HTMLElement
      const rect = el.getBoundingClientRect()
      manager.updateDrag(blockId, e.clientY, rect.top, rect.height)
    },
    [manager, dragState.isDragging]
  )

  const handleDrop = useCallback(
    (_blockId: string, e: React.DragEvent) => {
      e.preventDefault()
      manager.endDrag(true)
    },
    [manager]
  )

  const handleDragEnd = useCallback(() => {
    manager.endDrag(false)
  }, [manager])

  return {
    manager,
    dragState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  }
}
