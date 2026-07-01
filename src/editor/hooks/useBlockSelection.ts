import { useCallback, useEffect, useRef } from 'react'
import type { EditorController } from '@/modules/editor/editor-controller'
import { SelectionManager } from '@/editor/managers/SelectionManager/SelectionManager'

export function useBlockSelection(controller: EditorController) {
  const managerRef = useRef<SelectionManager | null>(null)

  if (!managerRef.current) {
    managerRef.current = new SelectionManager(controller)
  }

  const manager = managerRef.current

  useEffect(() => {
    const handler = () => manager.syncFromController()
    controller.addEventListener('selection-change', handler)
    return () => controller.removeEventListener('selection-change', handler)
  }, [controller, manager])

  const handleShiftClick = useCallback(
    (blockId: string) => {
      const lastSelected = manager.getLastSelectedBlockId()
      if (lastSelected && lastSelected !== blockId) {
        manager.selectRange(lastSelected, blockId)
      } else {
        manager.selectBlock(blockId)
      }
    },
    [manager]
  )

  const handleClick = useCallback(
    (blockId: string, shiftKey: boolean) => {
      if (shiftKey) {
        handleShiftClick(blockId)
      } else {
        manager.selectBlock(blockId)
      }
    },
    [manager, handleShiftClick]
  )

  return {
    manager,
    selectedBlockIds: manager.getSelectedBlockIds(),
    selectBlock: manager.selectBlock.bind(manager),
    selectBlocks: manager.selectBlocks.bind(manager),
    toggleBlockSelection: manager.toggleBlockSelection.bind(manager),
    clearSelection: manager.clearSelection.bind(manager),
    isSelected: manager.isSelected.bind(manager),
    isMultiSelected: manager.isMultiSelected.bind(manager),
    handleClick,
    handleShiftClick,
  }
}
