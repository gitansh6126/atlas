import React from 'react'
import { cn } from '@/shared/utils/cn'
import { getBlockDomId } from '@/modules/editor/block-utils'
import type { DragState } from '@/editor/managers/DragManager/DragManager'

interface DragOverlayProps {
  dragState: DragState
}

export function DragOverlay({ dragState }: DragOverlayProps) {
  const { isDragging, targetBlockId, position } = dragState
  const [indicatorTop, setIndicatorTop] = React.useState(0)

  React.useEffect(() => {
    if (!isDragging || !targetBlockId) return

    const updatePosition = () => {
      const el = document.getElementById(getBlockDomId(targetBlockId))
      if (!el) return
      const rect = el.getBoundingClientRect()
      setIndicatorTop(
        position === 'before'
          ? rect.top + window.scrollY
          : rect.bottom + window.scrollY
      )
    }

    updatePosition()
    const timer = setInterval(updatePosition, 50)
    return () => clearInterval(timer)
  }, [isDragging, targetBlockId, position])

  if (!isDragging) return null

  return (
    <>
      {isDragging && (
        <div
          className={cn(
            'pointer-events-none fixed left-0 right-0 z-[200]',
            'flex items-center'
          )}
          style={{ top: 0 }}
        >
          <div
            className={cn(
              'pointer-events-none fixed z-[200] h-1',
              'bg-primary/60 rounded-full',
              'transition-all duration-75'
            )}
            style={{
              top: indicatorTop - 2,
              left: 48,
              right: 48,
            }}
          />
        </div>
      )}
    </>
  )
}
